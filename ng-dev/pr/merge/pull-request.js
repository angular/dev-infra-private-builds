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
const BreakingChangeLabel = 'flag: breaking change';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0Qsc0RBQXNFO0FBQ3RFLGlEQUE4QztBQUU5QywrQ0FBeUM7QUFHekMseUNBQThDO0FBQzlDLHFEQUFnRDtBQUNoRCxpREFLd0I7QUFHeEIsaUZBQWlGO0FBQ2pGLE1BQU0sbUJBQW1CLEdBQUcsdUJBQXVCLENBQUM7QUEwQnBEOzs7R0FHRztBQUNJLEtBQUssVUFBVSwwQkFBMEIsQ0FDOUMsRUFBQyxHQUFHLEVBQUUsTUFBTSxFQUF1QixFQUNuQyxRQUFnQixFQUNoQixzQkFBc0IsR0FBRyxLQUFLO0lBRTlCLE1BQU0sTUFBTSxHQUFHLE1BQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRS9ELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTtRQUNuQixPQUFPLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQ3RDO0lBRUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFO1FBQ3hFLE9BQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDM0M7SUFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMs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QUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFFaEYsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSw2QkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsRUFBa0I7SUFDNUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQ2QsTUFBTSw2QkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLFFBQVE7WUFDWCxNQUFNLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sNkJBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsXG4gIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LFxuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxufSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVGhlIGRlZmF1bHQgbGFiZWwgZm9yIGxhYmVsaW5nIHB1bGwgcmVxdWVzdHMgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbmNvbnN0IEJyZWFraW5nQ2hhbmdlTGFiZWwgPSAnZmxhZzogYnJlYWtpbmcgY2hhbmdlJztcblxuLyoqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVVJMIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByTnVtYmVyOiBudW1iZXI7XG4gIC8qKiBUaXRsZSBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB0aXRsZTogc3RyaW5nO1xuICAvKiogTGFiZWxzIGFwcGxpZWQgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgLyoqIExpc3Qgb2YgYnJhbmNoZXMgdGhpcyBQUiBzaG91bGQgYmUgbWVyZ2VkIGludG8uICovXG4gIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcbiAgLyoqIEJyYW5jaCB0aGF0IHRoZSBQUiB0YXJnZXRzIGluIHRoZSBHaXRodWIgVUkuICovXG4gIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nO1xuICAvKiogQ291bnQgb2YgY29tbWl0cyBpbiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29tbWl0Q291bnQ6IG51bWJlcjtcbiAgLyoqIE9wdGlvbmFsIFNIQSB0aGF0IHRoaXMgcHVsbCByZXF1ZXN0IG5lZWRzIHRvIGJlIGJhc2VkIG9uLiAqL1xuICByZXF1aXJlZEJhc2VTaGE/OiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0IG1lc3NhZ2UgZml4dXAuICovXG4gIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlLiAqL1xuICBoYXNDYXJldGFrZXJOb3RlOiBib29sZWFuO1xufVxuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgYWdhaW5zdCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAqIElmIHRoZSBwdWxsIHJlcXVlc3RzIGZhaWxzLCBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QoXG4gIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLFxuICBwck51bWJlcjogbnVtYmVyLFxuICBpZ25vcmVOb25GYXRhbEZhaWx1cmVzID0gZmFsc2UsXG4pOiBQcm9taXNlPFB1bGxSZXF1ZXN0IHwgUHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm5vZGVzLm1hcCgobCkgPT4gbC5uYW1lKTtcblxuICBpZiAoIWxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdE1lcmdlUmVhZHkoKTtcbiAgfVxuICBpZiAoIWxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWcsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICAvKiogTGlzdCBvZiBwYXJzZWQgY29tbWl0cyBmb3IgYWxsIG9mIHRoZSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IGNvbW1pdHNJblByID0gcHJEYXRhLmNvbW1pdHMubm9kZXMubWFwKChuKSA9PiBwYXJzZUNvbW1pdE1lc3NhZ2Uobi5jb21taXQubWVzc2FnZSkpO1xuXG4gIHRyeSB7XG4gICAgYXNzZXJ0UGVuZGluZ1N0YXRlKHByRGF0YSk7XG4gICAgYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoY29tbWl0c0luUHIsIHRhcmdldExhYmVsLCBjb25maWcpO1xuICAgIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKGNvbW1pdHNJblByLCBsYWJlbHMsIGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzdGF0dXMgb2YgdGhlIGxhdGVzdCBjb21taXQgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3Qgc3RhdGUgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5zbGljZSgtMSlbMF0uY29tbWl0LnN0YXR1cy5zdGF0ZTtcbiAgaWYgKHN0YXRlID09PSAnRkFJTFVSRScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdQRU5ESU5HJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2VSZWZOYW1lO1xuICBjb25zdCByZXF1aXJlZEJhc2VTaGEgPVxuICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID1cbiAgICAhIWNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCAmJlxuICAgIGxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwpKTtcbiAgY29uc3QgaGFzQ2FyZXRha2VyTm90ZSA9XG4gICAgISFjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsICYmXG4gICAgbGFiZWxzLnNvbWUoKG5hbWUpID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwhKSk7XG4gIGxldCB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG5cbiAgLy8gSWYgYnJhbmNoZXMgYXJlIGRldGVybWluZWQgZm9yIGEgZ2l2ZW4gdGFyZ2V0IGxhYmVsLCBjYXB0dXJlIGVycm9ycyB0aGF0IGFyZVxuICAvLyB0aHJvd24gYXMgcGFydCBvZiBicmFuY2ggY29tcHV0YXRpb24uIFRoaXMgaXMgZXhwZWN0ZWQgYmVjYXVzZSBhIG1lcmdlIGNvbmZpZ3VyYXRpb25cbiAgLy8gY2FuIGxhemlseSBjb21wdXRlIGJyYW5jaGVzIGZvciBhIHRhcmdldCBsYWJlbCBhbmQgdGhyb3cuIGUuZy4gaWYgYW4gaW52YWxpZCB0YXJnZXRcbiAgLy8gbGFiZWwgaXMgYXBwbGllZCwgd2Ugd2FudCB0byBleGl0IHRoZSBzY3JpcHQgZ3JhY2VmdWxseSB3aXRoIGFuIGVycm9yIG1lc3NhZ2UuXG4gIHRyeSB7XG4gICAgdGFyZ2V0QnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IgfHwgZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdEZhaWx1cmUoZXJyb3IuZmFpbHVyZU1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgdXJsOiBwckRhdGEudXJsLFxuICAgIHByTnVtYmVyLFxuICAgIGxhYmVscyxcbiAgICByZXF1aXJlZEJhc2VTaGEsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLFxuICAgIGhhc0NhcmV0YWtlck5vdGUsXG4gICAgdGFyZ2V0QnJhbmNoZXMsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMudG90YWxDb3VudCxcbiAgfTtcbn1cblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGlzRHJhZnQ6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnT1BFTicsICdNRVJHRUQnLCAnQ0xPU0VEJ10gYXMgY29uc3QpLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIC8vIE9ubHkgdGhlIGxhc3QgMTAwIGNvbW1pdHMgZnJvbSBhIHB1bGwgcmVxdWVzdCBhcmUgb2J0YWluZWQgYXMgd2UgbGlrZWx5IHdpbGwgbmV2ZXIgc2VlIGEgcHVsbFxuICAvLyByZXF1ZXN0cyB3aXRoIG1vcmUgdGhhbiAxMDAgY29tbWl0cy5cbiAgY29tbWl0czogcGFyYW1zKFxuICAgIHtsYXN0OiAxMDB9LFxuICAgIHtcbiAgICAgIHRvdGFsQ291bnQ6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gICAgICBub2RlczogW1xuICAgICAgICB7XG4gICAgICAgICAgY29tbWl0OiB7XG4gICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgKSxcbiAgYmFzZVJlZk5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBsYWJlbHM6IHBhcmFtcyhcbiAgICB7Zmlyc3Q6IDEwMH0sXG4gICAge1xuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG59O1xuXG4vKiogQSBwdWxsIHJlcXVlc3QgcmV0cmlldmVkIGZyb20gZ2l0aHViIHZpYSB0aGUgZ3JhcGhxbCBBUEkuICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gIHByTnVtYmVyOiBudW1iZXIsXG4pOiBQcm9taXNlPFJhd1B1bGxSZXF1ZXN0IHwgbnVsbD4ge1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmUgfCBQdWxsUmVxdWVzdCk6IHYgaXMgUHVsbFJlcXVlc3Qge1xuICByZXR1cm4gKHYgYXMgUHVsbFJlcXVlc3QpLnRhcmdldEJyYW5jaGVzICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBjb21taXRzIHByb3ZpZGVkIGFyZSBhbGxvd2VkIHRvIG1lcmdlIHRvIHRoZSBwcm92aWRlZCB0YXJnZXQgbGFiZWwsXG4gKiB0aHJvd2luZyBhbiBlcnJvciBvdGhlcndpc2UuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmZ1bmN0aW9uIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgbGFiZWw6IFRhcmdldExhYmVsLFxuICBjb25maWc6IE1lcmdlQ29uZmlnLFxuKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoKGNvbW1pdCkgPT4gIWV4ZW1wdGVkU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpO1xuICBjb25zdCBoYXNCcmVha2luZ0NoYW5nZXMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNEZXByZWNhdGlvbnMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNGZWF0dXJlQ29tbWl0cyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQudHlwZSA9PT0gJ2ZlYXQnKTtcbiAgc3dpdGNoIChsYWJlbC5wYXR0ZXJuKSB7XG4gICAgY2FzZSAndGFyZ2V0OiBtYWpvcic6XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IG1pbm9yJzpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IHJjJzpcbiAgICBjYXNlICd0YXJnZXQ6IHBhdGNoJzpcbiAgICBjYXNlICd0YXJnZXQ6IGx0cyc6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0ZlYXR1cmVDb21taXRzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNGZWF0dXJlQ29tbWl0cyhsYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBEZXByZWNhdGlvbnMgc2hvdWxkIG5vdCBiZSBtZXJnZWQgaW50byBSQywgcGF0Y2ggb3IgTFRTIGJyYW5jaGVzLlxuICAgICAgLy8gaHR0cHM6Ly9zZW12ZXIub3JnLyNzcGVjLWl0ZW0tNy4gRGVwcmVjYXRpb25zIHNob3VsZCBiZSBwYXJ0IG9mXG4gICAgICAvLyBtaW5vciByZWxlYXNlcywgb3IgbWFqb3IgcmVsZWFzZXMgYWNjb3JkaW5nIHRvIFNlbVZlci5cbiAgICAgIGlmIChoYXNEZXByZWNhdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0RlcHJlY2F0aW9ucyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihyZWQoJ1dBUk5JTkc6IFVuYWJsZSB0byBjb25maXJtIGFsbCBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgYXJlIGVsaWdpYmxlIHRvIGJlJykpO1xuICAgICAgd2FybihyZWQoYG1lcmdlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoOiAke2xhYmVsLnBhdHRlcm59YCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBoYXMgdGhlIHByb3BlciBsYWJlbCBmb3IgYnJlYWtpbmcgY2hhbmdlcyBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlXG4gKiBjb21taXRzLCBhbmQgb25seSBoYXMgdGhlIGxhYmVsIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2UgY29tbWl0cy5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoXG4gIGNvbW1pdHM6IENvbW1pdFtdLFxuICBsYWJlbHM6IHN0cmluZ1tdLFxuICBjb25maWc6IE1lcmdlQ29uZmlnLFxuKSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYSBsYWJlbCBub3RpbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0xhYmVsID0gbGFiZWxzLmluY2x1ZGVzKGNvbmZpZy5icmVha2luZ0NoYW5nZUxhYmVsIHx8IEJyZWFraW5nQ2hhbmdlTGFiZWwpO1xuICAvLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhdCBsZWFzdCBvbmUgY29tbWl0IHdoaWNoIG5vdGVzIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNDb21taXQgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApO1xuXG4gIGlmICghaGFzTGFiZWwgJiYgaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUxhYmVsKCk7XG4gIH1cblxuICBpZiAoaGFzTGFiZWwgJiYgIWhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VDb21taXQoKTtcbiAgfVxufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGlzIHBlbmRpbmcsIG5vdCBjbG9zZWQsIG1lcmdlZCBvciBpbiBkcmFmdC5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX0gaWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBub3QgcGVuZGluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0UGVuZGluZ1N0YXRlKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICBpZiAocHIuaXNEcmFmdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0RyYWZ0KCk7XG4gIH1cbiAgc3dpdGNoIChwci5zdGF0ZSkge1xuICAgIGNhc2UgJ0NMT1NFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNDbG9zZWQoKTtcbiAgICBjYXNlICdNRVJHRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzTWVyZ2VkKCk7XG4gIH1cbn1cbiJdfQ==