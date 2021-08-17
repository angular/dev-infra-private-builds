"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPullRequest = exports.loadAndValidatePullRequest = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const parse_1 = require("../../commit-message/parse");
const console_1 = require("../../utils/console");
const github_1 = require("../../utils/github");
const failures_1 = require("./failures");
const string_pattern_1 = require("./string-pattern");
const target_label_1 = require("./target-label");
const constants_1 = require("./constants");
/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
async function loadAndValidatePullRequest({ git, config }, prNumber, ignoreNonFatalFailures = false) {
    const prData = await fetchPullRequestFromGithub(git, prNumber);
    if (prData === null) {
        return failures_1.PullRequestFailure.notFound();
    }
    const labels = prData.labels.nodes.map((l) => l.name);
    if (!labels.some((name) => string_pattern_1.matchesPattern(name, config.mergeReadyLabel))) {
        return failures_1.PullRequestFailure.notMergeReady();
    }
    if (!labels.some((name) => string_pattern_1.matchesPattern(name, config.claSignedLabel))) {
        return failures_1.PullRequestFailure.claUnsigned();
    }
    let targetLabel;
    try {
        targetLabel = target_label_1.getTargetLabelFromPullRequest(config, labels);
    }
    catch (error) {
        if (error instanceof target_label_1.InvalidTargetLabelError) {
            return new failures_1.PullRequestFailure(error.failureMessage);
        }
        throw error;
    }
    /** List of parsed commits for all of the commits in the pull request. */
    const commitsInPr = prData.commits.nodes.map((n) => parse_1.parseCommitMessage(n.commit.message));
    try {
        assertPendingState(prData);
        assertChangesAllowForTargetLabel(commitsInPr, targetLabel, config);
        assertCorrectBreakingChangeLabeling(commitsInPr, labels);
    }
    catch (error) {
        return error;
    }
    /** The combined status of the latest commit in the pull request. */
    const state = prData.commits.nodes.slice(-1)[0].commit.status.state;
    if (state === 'FAILURE' && !ignoreNonFatalFailures) {
        return failures_1.PullRequestFailure.failingCiJobs();
    }
    if (state === 'PENDING' && !ignoreNonFatalFailures) {
        return failures_1.PullRequestFailure.pendingCiJobs();
    }
    const githubTargetBranch = prData.baseRefName;
    const requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
    const needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
        labels.some((name) => string_pattern_1.matchesPattern(name, config.commitMessageFixupLabel));
    const hasCaretakerNote = !!config.caretakerNoteLabel &&
        labels.some((name) => string_pattern_1.matchesPattern(name, config.caretakerNoteLabel));
    let targetBranches;
    // If branches are determined for a given target label, capture errors that are
    // thrown as part of branch computation. This is expected because a merge configuration
    // can lazily compute branches for a target label and throw. e.g. if an invalid target
    // label is applied, we want to exit the script gracefully with an error message.
    try {
        targetBranches = await target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
    }
    catch (error) {
        if (error instanceof target_label_1.InvalidTargetBranchError || error instanceof target_label_1.InvalidTargetLabelError) {
            return new failures_1.PullRequestFailure(error.failureMessage);
        }
        throw error;
    }
    return {
        url: prData.url,
        prNumber,
        labels,
        requiredBaseSha,
        githubTargetBranch,
        needsCommitMessageFixup,
        hasCaretakerNote,
        targetBranches,
        title: prData.title,
        commitCount: prData.commits.totalCount,
    };
}
exports.loadAndValidatePullRequest = loadAndValidatePullRequest;
/* Graphql schema for the response body the requested pull request. */
const PR_SCHEMA = {
    url: typed_graphqlify_1.types.string,
    isDraft: typed_graphqlify_1.types.boolean,
    state: typed_graphqlify_1.types.oneOf(['OPEN', 'MERGED', 'CLOSED']),
    number: typed_graphqlify_1.types.number,
    // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
    // requests with more than 100 commits.
    commits: typed_graphqlify_1.params({ last: 100 }, {
        totalCount: typed_graphqlify_1.types.number,
        nodes: [
            {
                commit: {
                    status: {
                        state: typed_graphqlify_1.types.oneOf(['FAILURE', 'PENDING', 'SUCCESS']),
                    },
                    message: typed_graphqlify_1.types.string,
                },
            },
        ],
    }),
    baseRefName: typed_graphqlify_1.types.string,
    title: typed_graphqlify_1.types.string,
    labels: typed_graphqlify_1.params({ first: 100 }, {
        nodes: [
            {
                name: typed_graphqlify_1.types.string,
            },
        ],
    }),
};
/** Fetches a pull request from Github. Returns null if an error occurred. */
async function fetchPullRequestFromGithub(git, prNumber) {
    try {
        return await github_1.getPr(PR_SCHEMA, prNumber, git);
    }
    catch (e) {
        // If the pull request could not be found, we want to return `null` so
        // that the error can be handled gracefully.
        if (e.status === 404) {
            return null;
        }
        throw e;
    }
}
/** Whether the specified value resolves to a pull request. */
function isPullRequest(v) {
    return v.targetBranches !== undefined;
}
exports.isPullRequest = isPullRequest;
/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
function assertChangesAllowForTargetLabel(commits, label, config) {
    /**
     * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
     * scopes in patch branches, no breaking changes in minor or patch changes.
     */
    const exemptedScopes = config.targetLabelExemptScopes || [];
    /** List of commits which are subject to content requirements for the target label. */
    commits = commits.filter((commit) => !exemptedScopes.includes(commit.scope));
    const hasBreakingChanges = commits.some((commit) => commit.breakingChanges.length !== 0);
    const hasDeprecations = commits.some((commit) => commit.deprecations.length !== 0);
    const hasFeatureCommits = commits.some((commit) => commit.type === 'feat');
    switch (label.pattern) {
        case 'target: major':
            break;
        case 'target: minor':
            if (hasBreakingChanges) {
                throw failures_1.PullRequestFailure.hasBreakingChanges(label);
            }
            break;
        case 'target: rc':
        case 'target: patch':
        case 'target: lts':
            if (hasBreakingChanges) {
                throw failures_1.PullRequestFailure.hasBreakingChanges(label);
            }
            if (hasFeatureCommits) {
                throw failures_1.PullRequestFailure.hasFeatureCommits(label);
            }
            // Deprecations should not be merged into RC, patch or LTS branches.
            // https://semver.org/#spec-item-7. Deprecations should be part of
            // minor releases, or major releases according to SemVer.
            if (hasDeprecations) {
                throw failures_1.PullRequestFailure.hasDeprecations(label);
            }
            break;
        default:
            console_1.warn(console_1.red('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
            console_1.warn(console_1.red(`merged into the target branch: ${label.pattern}`));
            break;
    }
}
/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
function assertCorrectBreakingChangeLabeling(commits, labels) {
    /** Whether the PR has a label noting a breaking change. */
    const hasLabel = labels.includes(constants_1.breakingChangeLabel);
    //** Whether the PR has at least one commit which notes a breaking change. */
    const hasCommit = commits.some((commit) => commit.breakingChanges.length !== 0);
    if (!hasLabel && hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeLabel();
    }
    if (hasLabel && !hasCommit) {
        throw failures_1.PullRequestFailure.missingBreakingChangeCommit();
    }
}
/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
function assertPendingState(pr) {
    if (pr.isDraft) {
        throw failures_1.PullRequestFailure.isDraft();
    }
    switch (pr.state) {
        case 'CLOSED':
            throw failures_1.PullRequestFailure.isClosed();
        case 'MERGED':
            throw failures_1.PullRequestFailure.isMerged();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0Qsc0RBQXNFO0FBQ3RFLGlEQUE4QztBQUU5QywrQ0FBeUM7QUFHekMseUNBQThDO0FBQzlDLHFEQUFnRDtBQUNoRCxpREFLd0I7QUFFeEIsMkNBQWdEO0FBMEJoRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsMEJBQTBCLENBQzlDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBdUIsRUFDbkMsUUFBZ0IsRUFDaEIsc0JBQXNCLEdBQUcsS0FBSztJQUU5QixNQUFNLE1BQU0sR0FBRyxNQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUvRCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsT0FBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN0QztJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQywrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtRQUN4RSxPQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzNDO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFO1FBQ3ZFLE9BQU8sNkJBQWtCLENB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QUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsRUFBa0I7SUFDNUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQ2QsTUFBTSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsXG4gIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LFxuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxufSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuaW1wb3J0IHticmVha2luZ0NoYW5nZUxhYmVsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICB7Z2l0LCBjb25maWd9OiBQdWxsUmVxdWVzdE1lcmdlVGFzayxcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgaWdub3JlTm9uRmF0YWxGYWlsdXJlcyA9IGZhbHNlLFxuKTogUHJvbWlzZTxQdWxsUmVxdWVzdCB8IFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICBjb25zdCBwckRhdGEgPSBhd2FpdCBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihnaXQsIHByTnVtYmVyKTtcblxuICBpZiAocHJEYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RGb3VuZCgpO1xuICB9XG5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5ub2Rlcy5tYXAoKGwpID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLm1lcmdlUmVhZHlMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RNZXJnZVJlYWR5KCk7XG4gIH1cbiAgaWYgKCFsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNsYVNpZ25lZExhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG4gIH1cblxuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgLyoqIExpc3Qgb2YgcGFyc2VkIGNvbW1pdHMgZm9yIGFsbCBvZiB0aGUgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBjb21taXRzSW5QciA9IHByRGF0YS5jb21taXRzLm5vZGVzLm1hcCgobikgPT4gcGFyc2VDb21taXRNZXNzYWdlKG4uY29tbWl0Lm1lc3NhZ2UpKTtcblxuICB0cnkge1xuICAgIGFzc2VydFBlbmRpbmdTdGF0ZShwckRhdGEpO1xuICAgIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKGNvbW1pdHNJblByLCB0YXJnZXRMYWJlbCwgY29uZmlnKTtcbiAgICBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzSW5QciwgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICAvKiogVGhlIGNvbWJpbmVkIHN0YXR1cyBvZiB0aGUgbGF0ZXN0IGNvbW1pdCBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBzdGF0ZSA9IHByRGF0YS5jb21taXRzLm5vZGVzLnNsaWNlKC0xKVswXS5jb21taXQuc3RhdHVzLnN0YXRlO1xuICBpZiAoc3RhdGUgPT09ICdGQUlMVVJFJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuZmFpbGluZ0NpSm9icygpO1xuICB9XG4gIGlmIChzdGF0ZSA9PT0gJ1BFTkRJTkcnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5wZW5kaW5nQ2lKb2JzKCk7XG4gIH1cblxuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZVJlZk5hbWU7XG4gIGNvbnN0IHJlcXVpcmVkQmFzZVNoYSA9XG4gICAgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHMgJiYgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHNbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgY29uc3QgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPVxuICAgICEhY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsICYmXG4gICAgbGFiZWxzLnNvbWUoKG5hbWUpID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCkpO1xuICBjb25zdCBoYXNDYXJldGFrZXJOb3RlID1cbiAgICAhIWNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwgJiZcbiAgICBsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCEpKTtcbiAgbGV0IHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IHByRGF0YS51cmwsXG4gICAgcHJOdW1iZXIsXG4gICAgbGFiZWxzLFxuICAgIHJlcXVpcmVkQmFzZVNoYSxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsXG4gICAgaGFzQ2FyZXRha2VyTm90ZSxcbiAgICB0YXJnZXRCcmFuY2hlcyxcbiAgICB0aXRsZTogcHJEYXRhLnRpdGxlLFxuICAgIGNvbW1pdENvdW50OiBwckRhdGEuY29tbWl0cy50b3RhbENvdW50LFxuICB9O1xufVxuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgdGhlIHJlcXVlc3RlZCBwdWxsIHJlcXVlc3QuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaXNEcmFmdDogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydPUEVOJywgJ01FUkdFRCcsICdDTE9TRUQnXSBhcyBjb25zdCksXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoXG4gICAge2xhc3Q6IDEwMH0sXG4gICAge1xuICAgICAgdG90YWxDb3VudDogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBjb21taXQ6IHtcbiAgICAgICAgICAgIHN0YXR1czoge1xuICAgICAgICAgICAgICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnRkFJTFVSRScsICdQRU5ESU5HJywgJ1NVQ0NFU1MnXSBhcyBjb25zdCksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbWVzc2FnZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxuICBiYXNlUmVmTmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGxhYmVsczogcGFyYW1zKFxuICAgIHtmaXJzdDogMTAwfSxcbiAgICB7XG4gICAgICBub2RlczogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgKSxcbn07XG5cbi8qKiBBIHB1bGwgcmVxdWVzdCByZXRyaWV2ZWQgZnJvbSBnaXRodWIgdmlhIHRoZSBncmFwaHFsIEFQSS4gKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoXG4gIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgcHJOdW1iZXI6IG51bWJlcixcbik6IFByb21pc2U8UmF3UHVsbFJlcXVlc3QgfCBudWxsPiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGNvdWxkIG5vdCBiZSBmb3VuZCwgd2Ugd2FudCB0byByZXR1cm4gYG51bGxgIHNvXG4gICAgLy8gdGhhdCB0aGUgZXJyb3IgY2FuIGJlIGhhbmRsZWQgZ3JhY2VmdWxseS5cbiAgICBpZiAoZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cblxuLyoqIFdoZXRoZXIgdGhlIHNwZWNpZmllZCB2YWx1ZSByZXNvbHZlcyB0byBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1B1bGxSZXF1ZXN0KHY6IFB1bGxSZXF1ZXN0RmFpbHVyZSB8IFB1bGxSZXF1ZXN0KTogdiBpcyBQdWxsUmVxdWVzdCB7XG4gIHJldHVybiAodiBhcyBQdWxsUmVxdWVzdCkudGFyZ2V0QnJhbmNoZXMgIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIGNvbW1pdHMgcHJvdmlkZWQgYXJlIGFsbG93ZWQgdG8gbWVyZ2UgdG8gdGhlIHByb3ZpZGVkIHRhcmdldCBsYWJlbCxcbiAqIHRocm93aW5nIGFuIGVycm9yIG90aGVyd2lzZS5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoXG4gIGNvbW1pdHM6IENvbW1pdFtdLFxuICBsYWJlbDogVGFyZ2V0TGFiZWwsXG4gIGNvbmZpZzogTWVyZ2VDb25maWcsXG4pIHtcbiAgLyoqXG4gICAqIExpc3Qgb2YgY29tbWl0IHNjb3BlcyB3aGljaCBhcmUgZXhlbXB0ZWQgZnJvbSB0YXJnZXQgbGFiZWwgY29udGVudCByZXF1aXJlbWVudHMuIGkuZS4gbm8gYGZlYXRgXG4gICAqIHNjb3BlcyBpbiBwYXRjaCBicmFuY2hlcywgbm8gYnJlYWtpbmcgY2hhbmdlcyBpbiBtaW5vciBvciBwYXRjaCBjaGFuZ2VzLlxuICAgKi9cbiAgY29uc3QgZXhlbXB0ZWRTY29wZXMgPSBjb25maWcudGFyZ2V0TGFiZWxFeGVtcHRTY29wZXMgfHwgW107XG4gIC8qKiBMaXN0IG9mIGNvbW1pdHMgd2hpY2ggYXJlIHN1YmplY3QgdG8gY29udGVudCByZXF1aXJlbWVudHMgZm9yIHRoZSB0YXJnZXQgbGFiZWwuICovXG4gIGNvbW1pdHMgPSBjb21taXRzLmZpbHRlcigoY29tbWl0KSA9PiAhZXhlbXB0ZWRTY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSk7XG4gIGNvbnN0IGhhc0JyZWFraW5nQ2hhbmdlcyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0RlcHJlY2F0aW9ucyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuZGVwcmVjYXRpb25zLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0ZlYXR1cmVDb21taXRzID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC50eXBlID09PSAnZmVhdCcpO1xuICBzd2l0Y2ggKGxhYmVsLnBhdHRlcm4pIHtcbiAgICBjYXNlICd0YXJnZXQ6IG1ham9yJzpcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RhcmdldDogbWlub3InOlxuICAgICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlcykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3RhcmdldDogcmMnOlxuICAgIGNhc2UgJ3RhcmdldDogcGF0Y2gnOlxuICAgIGNhc2UgJ3RhcmdldDogbHRzJzpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBpZiAoaGFzRmVhdHVyZUNvbW1pdHMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0ZlYXR1cmVDb21taXRzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIC8vIERlcHJlY2F0aW9ucyBzaG91bGQgbm90IGJlIG1lcmdlZCBpbnRvIFJDLCBwYXRjaCBvciBMVFMgYnJhbmNoZXMuXG4gICAgICAvLyBodHRwczovL3NlbXZlci5vcmcvI3NwZWMtaXRlbS03LiBEZXByZWNhdGlvbnMgc2hvdWxkIGJlIHBhcnQgb2ZcbiAgICAgIC8vIG1pbm9yIHJlbGVhc2VzLCBvciBtYWpvciByZWxlYXNlcyBhY2NvcmRpbmcgdG8gU2VtVmVyLlxuICAgICAgaWYgKGhhc0RlcHJlY2F0aW9ucykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRGVwcmVjYXRpb25zKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB3YXJuKHJlZCgnV0FSTklORzogVW5hYmxlIHRvIGNvbmZpcm0gYWxsIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdCBhcmUgZWxpZ2libGUgdG8gYmUnKSk7XG4gICAgICB3YXJuKHJlZChgbWVyZ2VkIGludG8gdGhlIHRhcmdldCBicmFuY2g6ICR7bGFiZWwucGF0dGVybn1gKSk7XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGhhcyB0aGUgcHJvcGVyIGxhYmVsIGZvciBicmVha2luZyBjaGFuZ2VzIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2VcbiAqIGNvbW1pdHMsIGFuZCBvbmx5IGhhcyB0aGUgbGFiZWwgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZSBjb21taXRzLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5mdW5jdGlvbiBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzOiBDb21taXRbXSwgbGFiZWxzOiBzdHJpbmdbXSkge1xuICAvKiogV2hldGhlciB0aGUgUFIgaGFzIGEgbGFiZWwgbm90aW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNMYWJlbCA9IGxhYmVscy5pbmNsdWRlcyhicmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBpcyBwZW5kaW5nLCBub3QgY2xvc2VkLCBtZXJnZWQgb3IgaW4gZHJhZnQuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9IGlmIHRoZSBwdWxsIHJlcXVlc3QgaXMgbm90IHBlbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBlbmRpbmdTdGF0ZShwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgaWYgKHByLmlzRHJhZnQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNEcmFmdCgpO1xuICB9XG4gIHN3aXRjaCAocHIuc3RhdGUpIHtcbiAgICBjYXNlICdDTE9TRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzQ2xvc2VkKCk7XG4gICAgY2FzZSAnTUVSR0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc01lcmdlZCgpO1xuICB9XG59XG4iXX0=