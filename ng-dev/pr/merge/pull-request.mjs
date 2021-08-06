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
/** The default label for labeling pull requests containing a breaking change. */
const BreakingChangeLabel = 'breaking changes';
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
        assertCorrectBreakingChangeLabeling(commitsInPr, labels, config);
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
function assertCorrectBreakingChangeLabeling(commits, labels, config) {
    /** Whether the PR has a label noting a breaking change. */
    const hasLabel = labels.includes(config.breakingChangeLabel || BreakingChangeLabel);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0Qsc0RBQXNFO0FBQ3RFLGlEQUE4QztBQUU5QywrQ0FBeUM7QUFHekMseUNBQThDO0FBQzlDLHFEQUFnRDtBQUNoRCxpREFLd0I7QUFHeEIsaUZBQWlGO0FBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsa0JBQWtCLENBQUM7QUEwQi9DOzs7R0FHRztBQUNJLEtBQUssVUFBVSwwQkFBMEIsQ0FDOUMsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUF1QixFQUNuQyxRQUFnQixFQUNoQixzQkFBc0IsR0FBRyxLQUFLO0lBRTlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRS9ELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixPQUFPLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3RDO0lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO1FBQ3hFLE9BQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDM0M7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMs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QUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsRUFBa0I7SUFDNUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQ2QsTUFBTSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsXG4gIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LFxuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxufSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVGhlIGRlZmF1bHQgbGFiZWwgZm9yIGxhYmVsaW5nIHB1bGwgcmVxdWVzdHMgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbmNvbnN0IEJyZWFraW5nQ2hhbmdlTGFiZWwgPSAnYnJlYWtpbmcgY2hhbmdlcyc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICB7Z2l0LCBjb25maWd9OiBQdWxsUmVxdWVzdE1lcmdlVGFzayxcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgaWdub3JlTm9uRmF0YWxGYWlsdXJlcyA9IGZhbHNlLFxuKTogUHJvbWlzZTxQdWxsUmVxdWVzdCB8IFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICBjb25zdCBwckRhdGEgPSBhd2FpdCBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihnaXQsIHByTnVtYmVyKTtcblxuICBpZiAocHJEYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RGb3VuZCgpO1xuICB9XG5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5ub2Rlcy5tYXAoKGwpID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLm1lcmdlUmVhZHlMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RNZXJnZVJlYWR5KCk7XG4gIH1cbiAgaWYgKCFsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNsYVNpZ25lZExhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG4gIH1cblxuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgLyoqIExpc3Qgb2YgcGFyc2VkIGNvbW1pdHMgZm9yIGFsbCBvZiB0aGUgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBjb25zdCBjb21taXRzSW5QciA9IHByRGF0YS5jb21taXRzLm5vZGVzLm1hcCgobikgPT4gcGFyc2VDb21taXRNZXNzYWdlKG4uY29tbWl0Lm1lc3NhZ2UpKTtcblxuICB0cnkge1xuICAgIGFzc2VydFBlbmRpbmdTdGF0ZShwckRhdGEpO1xuICAgIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKGNvbW1pdHNJblByLCB0YXJnZXRMYWJlbCwgY29uZmlnKTtcbiAgICBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzSW5QciwgbGFiZWxzLCBjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKiBUaGUgY29tYmluZWQgc3RhdHVzIG9mIHRoZSBsYXRlc3QgY29tbWl0IGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IHN0YXRlID0gcHJEYXRhLmNvbW1pdHMubm9kZXMuc2xpY2UoLTEpWzBdLmNvbW1pdC5zdGF0dXMuc3RhdGU7XG4gIGlmIChzdGF0ZSA9PT0gJ0ZBSUxVUkUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAnUEVORElORycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlUmVmTmFtZTtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0cyAmJiBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0c1tnaXRodWJUYXJnZXRCcmFuY2hdO1xuICBjb25zdCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA9XG4gICAgISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICBsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPVxuICAgICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgIGxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuICBsZXQgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuXG4gIC8vIElmIGJyYW5jaGVzIGFyZSBkZXRlcm1pbmVkIGZvciBhIGdpdmVuIHRhcmdldCBsYWJlbCwgY2FwdHVyZSBlcnJvcnMgdGhhdCBhcmVcbiAgLy8gdGhyb3duIGFzIHBhcnQgb2YgYnJhbmNoIGNvbXB1dGF0aW9uLiBUaGlzIGlzIGV4cGVjdGVkIGJlY2F1c2UgYSBtZXJnZSBjb25maWd1cmF0aW9uXG4gIC8vIGNhbiBsYXppbHkgY29tcHV0ZSBicmFuY2hlcyBmb3IgYSB0YXJnZXQgbGFiZWwgYW5kIHRocm93LiBlLmcuIGlmIGFuIGludmFsaWQgdGFyZ2V0XG4gIC8vIGxhYmVsIGlzIGFwcGxpZWQsIHdlIHdhbnQgdG8gZXhpdCB0aGUgc2NyaXB0IGdyYWNlZnVsbHkgd2l0aCBhbiBlcnJvciBtZXNzYWdlLlxuICB0cnkge1xuICAgIHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHx8IGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHVybDogcHJEYXRhLnVybCxcbiAgICBwck51bWJlcixcbiAgICBsYWJlbHMsXG4gICAgcmVxdWlyZWRCYXNlU2hhLFxuICAgIGdpdGh1YlRhcmdldEJyYW5jaCxcbiAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCxcbiAgICBoYXNDYXJldGFrZXJOb3RlLFxuICAgIHRhcmdldEJyYW5jaGVzLFxuICAgIHRpdGxlOiBwckRhdGEudGl0bGUsXG4gICAgY29tbWl0Q291bnQ6IHByRGF0YS5jb21taXRzLnRvdGFsQ291bnQsXG4gIH07XG59XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSB0aGUgcmVxdWVzdGVkIHB1bGwgcmVxdWVzdC4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBpc0RyYWZ0OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ09QRU4nLCAnTUVSR0VEJywgJ0NMT1NFRCddIGFzIGNvbnN0KSxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAvLyBPbmx5IHRoZSBsYXN0IDEwMCBjb21taXRzIGZyb20gYSBwdWxsIHJlcXVlc3QgYXJlIG9idGFpbmVkIGFzIHdlIGxpa2VseSB3aWxsIG5ldmVyIHNlZSBhIHB1bGxcbiAgLy8gcmVxdWVzdHMgd2l0aCBtb3JlIHRoYW4gMTAwIGNvbW1pdHMuXG4gIGNvbW1pdHM6IHBhcmFtcyhcbiAgICB7bGFzdDogMTAwfSxcbiAgICB7XG4gICAgICB0b3RhbENvdW50OiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGNvbW1pdDoge1xuICAgICAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgICAgIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydGQUlMVVJFJywgJ1BFTkRJTkcnLCAnU1VDQ0VTUyddIGFzIGNvbnN0KSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBtZXNzYWdlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG4gIGJhc2VSZWZOYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoXG4gICAge2ZpcnN0OiAxMDB9LFxuICAgIHtcbiAgICAgIG5vZGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICApLFxufTtcblxuLyoqIEEgcHVsbCByZXF1ZXN0IHJldHJpZXZlZCBmcm9tIGdpdGh1YiB2aWEgdGhlIGdyYXBocWwgQVBJLiAqL1xudHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICBwck51bWJlcjogbnVtYmVyLFxuKTogUHJvbWlzZTxSYXdQdWxsUmVxdWVzdCB8IG51bGw+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kLCB3ZSB3YW50IHRvIHJldHVybiBgbnVsbGAgc29cbiAgICAvLyB0aGF0IHRoZSBlcnJvciBjYW4gYmUgaGFuZGxlZCBncmFjZWZ1bGx5LlxuICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIHJlc29sdmVzIHRvIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3QodjogUHVsbFJlcXVlc3RGYWlsdXJlIHwgUHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLFxuICogdGhyb3dpbmcgYW4gZXJyb3Igb3RoZXJ3aXNlLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5mdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgY29tbWl0czogQ29tbWl0W10sXG4gIGxhYmVsOiBUYXJnZXRMYWJlbCxcbiAgY29uZmlnOiBNZXJnZUNvbmZpZyxcbikge1xuICAvKipcbiAgICogTGlzdCBvZiBjb21taXQgc2NvcGVzIHdoaWNoIGFyZSBleGVtcHRlZCBmcm9tIHRhcmdldCBsYWJlbCBjb250ZW50IHJlcXVpcmVtZW50cy4gaS5lLiBubyBgZmVhdGBcbiAgICogc2NvcGVzIGluIHBhdGNoIGJyYW5jaGVzLCBubyBicmVha2luZyBjaGFuZ2VzIGluIG1pbm9yIG9yIHBhdGNoIGNoYW5nZXMuXG4gICAqL1xuICBjb25zdCBleGVtcHRlZFNjb3BlcyA9IGNvbmZpZy50YXJnZXRMYWJlbEV4ZW1wdFNjb3BlcyB8fCBbXTtcbiAgLyoqIExpc3Qgb2YgY29tbWl0cyB3aGljaCBhcmUgc3ViamVjdCB0byBjb250ZW50IHJlcXVpcmVtZW50cyBmb3IgdGhlIHRhcmdldCBsYWJlbC4gKi9cbiAgY29tbWl0cyA9IGNvbW1pdHMuZmlsdGVyKChjb21taXQpID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRGVwcmVjYXRpb25zID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5kZXByZWNhdGlvbnMubGVuZ3RoICE9PSAwKTtcbiAgY29uc3QgaGFzRmVhdHVyZUNvbW1pdHMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0Jyk7XG4gIHN3aXRjaCAobGFiZWwucGF0dGVybikge1xuICAgIGNhc2UgJ3RhcmdldDogbWFqb3InOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiBtaW5vcic6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiByYyc6XG4gICAgY2FzZSAndGFyZ2V0OiBwYXRjaCc6XG4gICAgY2FzZSAndGFyZ2V0OiBsdHMnOlxuICAgICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlcykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNGZWF0dXJlQ29tbWl0cykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRmVhdHVyZUNvbW1pdHMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gRGVwcmVjYXRpb25zIHNob3VsZCBub3QgYmUgbWVyZ2VkIGludG8gUkMsIHBhdGNoIG9yIExUUyBicmFuY2hlcy5cbiAgICAgIC8vIGh0dHBzOi8vc2VtdmVyLm9yZy8jc3BlYy1pdGVtLTcuIERlcHJlY2F0aW9ucyBzaG91bGQgYmUgcGFydCBvZlxuICAgICAgLy8gbWlub3IgcmVsZWFzZXMsIG9yIG1ham9yIHJlbGVhc2VzIGFjY29yZGluZyB0byBTZW1WZXIuXG4gICAgICBpZiAoaGFzRGVwcmVjYXRpb25zKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNEZXByZWNhdGlvbnMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHdhcm4ocmVkKCdXQVJOSU5HOiBVbmFibGUgdG8gY29uZmlybSBhbGwgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGFyZSBlbGlnaWJsZSB0byBiZScpKTtcbiAgICAgIHdhcm4ocmVkKGBtZXJnZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaDogJHtsYWJlbC5wYXR0ZXJufWApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaGFzIHRoZSBwcm9wZXIgbGFiZWwgZm9yIGJyZWFraW5nIGNoYW5nZXMgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZVxuICogY29tbWl0cywgYW5kIG9ubHkgaGFzIHRoZSBsYWJlbCBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlIGNvbW1pdHMuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmZ1bmN0aW9uIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgbGFiZWxzOiBzdHJpbmdbXSxcbiAgY29uZmlnOiBNZXJnZUNvbmZpZyxcbikge1xuICAvKiogV2hldGhlciB0aGUgUFIgaGFzIGEgbGFiZWwgbm90aW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNMYWJlbCA9IGxhYmVscy5pbmNsdWRlcyhjb25maWcuYnJlYWtpbmdDaGFuZ2VMYWJlbCB8fCBCcmVha2luZ0NoYW5nZUxhYmVsKTtcbiAgLy8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYXQgbGVhc3Qgb25lIGNvbW1pdCB3aGljaCBub3RlcyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzQ29tbWl0ID0gY29tbWl0cy5zb21lKChjb21taXQpID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBpcyBwZW5kaW5nLCBub3QgY2xvc2VkLCBtZXJnZWQgb3IgaW4gZHJhZnQuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9IGlmIHRoZSBwdWxsIHJlcXVlc3QgaXMgbm90IHBlbmRpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFBlbmRpbmdTdGF0ZShwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgaWYgKHByLmlzRHJhZnQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNEcmFmdCgpO1xuICB9XG4gIHN3aXRjaCAocHIuc3RhdGUpIHtcbiAgICBjYXNlICdDTE9TRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzQ2xvc2VkKCk7XG4gICAgY2FzZSAnTUVSR0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc01lcmdlZCgpO1xuICB9XG59XG4iXX0=