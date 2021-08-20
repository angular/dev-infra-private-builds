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
    /** List of parsed commits for all of the commits in the pull request. */
    const commitsInPr = prData.commits.nodes.map((n) => parse_1.parseCommitMessage(n.commit.message));
    const githubTargetBranch = prData.baseRefName;
    const targetBranches = await getTargetBranches({ github: git.config.github, merge: config }, labels, githubTargetBranch, commitsInPr);
    try {
        assertPendingState(prData);
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
    const requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
    const needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
        labels.some((name) => string_pattern_1.matchesPattern(name, config.commitMessageFixupLabel));
    const hasCaretakerNote = !!config.caretakerNoteLabel &&
        labels.some((name) => string_pattern_1.matchesPattern(name, config.caretakerNoteLabel));
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
/** Get the branches the pull request will be merged into.  */
async function getTargetBranches(config, labels, githubTargetBranch, commits) {
    if (config.merge.noTargetLabeling) {
        return [config.github.mainBranchName];
    }
    else {
        try {
            let targetLabel = await target_label_1.getTargetLabelFromPullRequest(config.merge, labels);
            // If branches are determined for a given target label, capture errors that are
            // thrown as part of branch computation. This is expected because a merge configuration
            // can lazily compute branches for a target label and throw. e.g. if an invalid target
            // label is applied, we want to exit the script gracefully with an error message.
            let targetBranches = await target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch);
            assertChangesAllowForTargetLabel(commits, targetLabel, config.merge);
            return targetBranches;
        }
        catch (error) {
            if (error instanceof target_label_1.InvalidTargetBranchError || error instanceof target_label_1.InvalidTargetLabelError) {
                throw new failures_1.PullRequestFailure(error.failureMessage);
            }
            throw error;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCx1REFBK0Q7QUFFL0Qsc0RBQXNFO0FBQ3RFLGlEQUE4QztBQUU5QywrQ0FBeUM7QUFHekMseUNBQThDO0FBQzlDLHFEQUFnRDtBQUNoRCxpREFLd0I7QUFFeEIsMkNBQWdEO0FBMkJoRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsMEJBQTBCLENBQzlDLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBdUIsRUFDbkMsUUFBZ0IsRUFDaEIsc0JBQXNCLEdBQUcsS0FBSztJQUU5QixNQUFNLE1BQU0sR0FBRyxNQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUvRCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDbkIsT0FBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUN0QztJQUVELE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXRELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQywrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRTtRQUN4RSxPQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxDQUFDO0tBQzNDO0lBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxFQUFFO1FBQ3ZFLE9BQU8sNkJBQWtCLENB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QixDQUM5QixNQUFrRCxFQUNsRCxNQUFnQixFQUNoQixrQkFBMEIsRUFDMUIsT0FBaUI7SUFFakIsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ3ZDO1NBQU07UUFDTCxJQUFJO1lBQ0YsSUFBSSxXQUFXLEdBQUcsTUFBTSw0Q0FBNkIsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQzVFLCtFQUErRTtZQUMvRSx1RkFBdUY7WUFDdkYsc0ZBQXNGO1lBQ3RGLGlGQUFpRjtZQUVqRixJQUFJLGNBQWMsR0FBRyxNQUFNLHlDQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1lBQ3ZGLGdDQUFnQyxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sY0FBYyxDQUFDO1NBQ3ZCO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLEtBQUssWUFBWSx1Q0FBd0IsSUFBSSxLQUFLLFlBQVksc0NBQXVCLEVBQUU7Z0JBQ3pGLE1BQU0sSUFBSSw2QkFBa0IsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7YUFDcEQ7WUFDRCxNQUFNLEtBQUssQ0FBQztTQUNiO0tBQ0Y7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsXG4gIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LFxuICBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsXG4gIEludmFsaWRUYXJnZXRMYWJlbEVycm9yLFxufSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuaW1wb3J0IHticmVha2luZ0NoYW5nZUxhYmVsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuLyoqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVVJMIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByTnVtYmVyOiBudW1iZXI7XG4gIC8qKiBUaXRsZSBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB0aXRsZTogc3RyaW5nO1xuICAvKiogTGFiZWxzIGFwcGxpZWQgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgLyoqIExpc3Qgb2YgYnJhbmNoZXMgdGhpcyBQUiBzaG91bGQgYmUgbWVyZ2VkIGludG8uICovXG4gIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcbiAgLyoqIEJyYW5jaCB0aGF0IHRoZSBQUiB0YXJnZXRzIGluIHRoZSBHaXRodWIgVUkuICovXG4gIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nO1xuICAvKiogQ291bnQgb2YgY29tbWl0cyBpbiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29tbWl0Q291bnQ6IG51bWJlcjtcbiAgLyoqIE9wdGlvbmFsIFNIQSB0aGF0IHRoaXMgcHVsbCByZXF1ZXN0IG5lZWRzIHRvIGJlIGJhc2VkIG9uLiAqL1xuICByZXF1aXJlZEJhc2VTaGE/OiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0IG1lc3NhZ2UgZml4dXAuICovXG4gIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlLiAqL1xuICBoYXNDYXJldGFrZXJOb3RlOiBib29sZWFuO1xufVxuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgYWdhaW5zdCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAqIElmIHRoZSBwdWxsIHJlcXVlc3RzIGZhaWxzLCBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QoXG4gIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLFxuICBwck51bWJlcjogbnVtYmVyLFxuICBpZ25vcmVOb25GYXRhbEZhaWx1cmVzID0gZmFsc2UsXG4pOiBQcm9taXNlPFB1bGxSZXF1ZXN0IHwgUHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm5vZGVzLm1hcCgobCkgPT4gbC5uYW1lKTtcblxuICBpZiAoIWxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdE1lcmdlUmVhZHkoKTtcbiAgfVxuICBpZiAoIWxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXRzIGZvciBhbGwgb2YgdGhlIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3QgY29tbWl0c0luUHIgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5tYXAoKG4pID0+IHBhcnNlQ29tbWl0TWVzc2FnZShuLmNvbW1pdC5tZXNzYWdlKSk7XG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlUmVmTmFtZTtcblxuICBjb25zdCB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldFRhcmdldEJyYW5jaGVzKFxuICAgIHtnaXRodWI6IGdpdC5jb25maWcuZ2l0aHViLCBtZXJnZTogY29uZmlnfSxcbiAgICBsYWJlbHMsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIGNvbW1pdHNJblByLFxuICApO1xuXG4gIHRyeSB7XG4gICAgYXNzZXJ0UGVuZGluZ1N0YXRlKHByRGF0YSk7XG4gICAgYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoY29tbWl0c0luUHIsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzdGF0dXMgb2YgdGhlIGxhdGVzdCBjb21taXQgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3Qgc3RhdGUgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5zbGljZSgtMSlbMF0uY29tbWl0LnN0YXR1cy5zdGF0ZTtcbiAgaWYgKHN0YXRlID09PSAnRkFJTFVSRScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdQRU5ESU5HJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0cyAmJiBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0c1tnaXRodWJUYXJnZXRCcmFuY2hdO1xuICBjb25zdCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA9XG4gICAgISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICBsYWJlbHMuc29tZSgobmFtZSkgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPVxuICAgICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgIGxhYmVscy5zb21lKChuYW1lKSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuXG4gIHJldHVybiB7XG4gICAgdXJsOiBwckRhdGEudXJsLFxuICAgIHByTnVtYmVyLFxuICAgIGxhYmVscyxcbiAgICByZXF1aXJlZEJhc2VTaGEsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLFxuICAgIGhhc0NhcmV0YWtlck5vdGUsXG4gICAgdGFyZ2V0QnJhbmNoZXMsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMudG90YWxDb3VudCxcbiAgfTtcbn1cblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IHRoZSByZXF1ZXN0ZWQgcHVsbCByZXF1ZXN0LiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGlzRHJhZnQ6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLm9uZU9mKFsnT1BFTicsICdNRVJHRUQnLCAnQ0xPU0VEJ10gYXMgY29uc3QpLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIC8vIE9ubHkgdGhlIGxhc3QgMTAwIGNvbW1pdHMgZnJvbSBhIHB1bGwgcmVxdWVzdCBhcmUgb2J0YWluZWQgYXMgd2UgbGlrZWx5IHdpbGwgbmV2ZXIgc2VlIGEgcHVsbFxuICAvLyByZXF1ZXN0cyB3aXRoIG1vcmUgdGhhbiAxMDAgY29tbWl0cy5cbiAgY29tbWl0czogcGFyYW1zKFxuICAgIHtsYXN0OiAxMDB9LFxuICAgIHtcbiAgICAgIHRvdGFsQ291bnQ6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gICAgICBub2RlczogW1xuICAgICAgICB7XG4gICAgICAgICAgY29tbWl0OiB7XG4gICAgICAgICAgICBzdGF0dXM6IHtcbiAgICAgICAgICAgICAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgKSxcbiAgYmFzZVJlZk5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBsYWJlbHM6IHBhcmFtcyhcbiAgICB7Zmlyc3Q6IDEwMH0sXG4gICAge1xuICAgICAgbm9kZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICksXG59O1xuXG4vKiogQSBwdWxsIHJlcXVlc3QgcmV0cmlldmVkIGZyb20gZ2l0aHViIHZpYSB0aGUgZ3JhcGhxbCBBUEkuICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gIHByTnVtYmVyOiBudW1iZXIsXG4pOiBQcm9taXNlPFJhd1B1bGxSZXF1ZXN0IHwgbnVsbD4ge1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmUgfCBQdWxsUmVxdWVzdCk6IHYgaXMgUHVsbFJlcXVlc3Qge1xuICByZXR1cm4gKHYgYXMgUHVsbFJlcXVlc3QpLnRhcmdldEJyYW5jaGVzICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBjb21taXRzIHByb3ZpZGVkIGFyZSBhbGxvd2VkIHRvIG1lcmdlIHRvIHRoZSBwcm92aWRlZCB0YXJnZXQgbGFiZWwsXG4gKiB0aHJvd2luZyBhbiBlcnJvciBvdGhlcndpc2UuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmZ1bmN0aW9uIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKFxuICBjb21taXRzOiBDb21taXRbXSxcbiAgbGFiZWw6IFRhcmdldExhYmVsLFxuICBjb25maWc6IE1lcmdlQ29uZmlnLFxuKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoKGNvbW1pdCkgPT4gIWV4ZW1wdGVkU2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpO1xuICBjb25zdCBoYXNCcmVha2luZ0NoYW5nZXMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmJyZWFraW5nQ2hhbmdlcy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNEZXByZWNhdGlvbnMgPSBjb21taXRzLnNvbWUoKGNvbW1pdCkgPT4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNGZWF0dXJlQ29tbWl0cyA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQudHlwZSA9PT0gJ2ZlYXQnKTtcbiAgc3dpdGNoIChsYWJlbC5wYXR0ZXJuKSB7XG4gICAgY2FzZSAndGFyZ2V0OiBtYWpvcic6XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IG1pbm9yJzpcbiAgICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZXMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0JyZWFraW5nQ2hhbmdlcyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICd0YXJnZXQ6IHJjJzpcbiAgICBjYXNlICd0YXJnZXQ6IHBhdGNoJzpcbiAgICBjYXNlICd0YXJnZXQ6IGx0cyc6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgaWYgKGhhc0ZlYXR1cmVDb21taXRzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNGZWF0dXJlQ29tbWl0cyhsYWJlbCk7XG4gICAgICB9XG4gICAgICAvLyBEZXByZWNhdGlvbnMgc2hvdWxkIG5vdCBiZSBtZXJnZWQgaW50byBSQywgcGF0Y2ggb3IgTFRTIGJyYW5jaGVzLlxuICAgICAgLy8gaHR0cHM6Ly9zZW12ZXIub3JnLyNzcGVjLWl0ZW0tNy4gRGVwcmVjYXRpb25zIHNob3VsZCBiZSBwYXJ0IG9mXG4gICAgICAvLyBtaW5vciByZWxlYXNlcywgb3IgbWFqb3IgcmVsZWFzZXMgYWNjb3JkaW5nIHRvIFNlbVZlci5cbiAgICAgIGlmIChoYXNEZXByZWNhdGlvbnMpIHtcbiAgICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmhhc0RlcHJlY2F0aW9ucyhsYWJlbCk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgd2FybihyZWQoJ1dBUk5JTkc6IFVuYWJsZSB0byBjb25maXJtIGFsbCBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QgYXJlIGVsaWdpYmxlIHRvIGJlJykpO1xuICAgICAgd2FybihyZWQoYG1lcmdlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoOiAke2xhYmVsLnBhdHRlcm59YCkpO1xuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhlIHB1bGwgcmVxdWVzdCBoYXMgdGhlIHByb3BlciBsYWJlbCBmb3IgYnJlYWtpbmcgY2hhbmdlcyBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlXG4gKiBjb21taXRzLCBhbmQgb25seSBoYXMgdGhlIGxhYmVsIGlmIHRoZXJlIGFyZSBicmVha2luZyBjaGFuZ2UgY29tbWl0cy5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX1cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Q29ycmVjdEJyZWFraW5nQ2hhbmdlTGFiZWxpbmcoY29tbWl0czogQ29tbWl0W10sIGxhYmVsczogc3RyaW5nW10pIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhIGxhYmVsIG5vdGluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbiAgY29uc3QgaGFzTGFiZWwgPSBsYWJlbHMuaW5jbHVkZXMoYnJlYWtpbmdDaGFuZ2VMYWJlbCk7XG4gIC8vKiogV2hldGhlciB0aGUgUFIgaGFzIGF0IGxlYXN0IG9uZSBjb21taXQgd2hpY2ggbm90ZXMgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0NvbW1pdCA9IGNvbW1pdHMuc29tZSgoY29tbWl0KSA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG5cbiAgaWYgKCFoYXNMYWJlbCAmJiBoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlTGFiZWwoKTtcbiAgfVxuXG4gIGlmIChoYXNMYWJlbCAmJiAhaGFzQ29tbWl0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLm1pc3NpbmdCcmVha2luZ0NoYW5nZUNvbW1pdCgpO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaXMgcGVuZGluZywgbm90IGNsb3NlZCwgbWVyZ2VkIG9yIGluIGRyYWZ0LlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfSBpZiB0aGUgcHVsbCByZXF1ZXN0IGlzIG5vdCBwZW5kaW5nLlxuICovXG5mdW5jdGlvbiBhc3NlcnRQZW5kaW5nU3RhdGUocHI6IFJhd1B1bGxSZXF1ZXN0KSB7XG4gIGlmIChwci5pc0RyYWZ0KSB7XG4gICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzRHJhZnQoKTtcbiAgfVxuICBzd2l0Y2ggKHByLnN0YXRlKSB7XG4gICAgY2FzZSAnQ0xPU0VEJzpcbiAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0Nsb3NlZCgpO1xuICAgIGNhc2UgJ01FUkdFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNNZXJnZWQoKTtcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBicmFuY2hlcyB0aGUgcHVsbCByZXF1ZXN0IHdpbGwgYmUgbWVyZ2VkIGludG8uICAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0VGFyZ2V0QnJhbmNoZXMoXG4gIGNvbmZpZzoge21lcmdlOiBNZXJnZUNvbmZpZzsgZ2l0aHViOiBHaXRodWJDb25maWd9LFxuICBsYWJlbHM6IHN0cmluZ1tdLFxuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZyxcbiAgY29tbWl0czogQ29tbWl0W10sXG4pIHtcbiAgaWYgKGNvbmZpZy5tZXJnZS5ub1RhcmdldExhYmVsaW5nKSB7XG4gICAgcmV0dXJuIFtjb25maWcuZ2l0aHViLm1haW5CcmFuY2hOYW1lXTtcbiAgfSBlbHNlIHtcbiAgICB0cnkge1xuICAgICAgbGV0IHRhcmdldExhYmVsID0gYXdhaXQgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLm1lcmdlLCBsYWJlbHMpO1xuICAgICAgLy8gSWYgYnJhbmNoZXMgYXJlIGRldGVybWluZWQgZm9yIGEgZ2l2ZW4gdGFyZ2V0IGxhYmVsLCBjYXB0dXJlIGVycm9ycyB0aGF0IGFyZVxuICAgICAgLy8gdGhyb3duIGFzIHBhcnQgb2YgYnJhbmNoIGNvbXB1dGF0aW9uLiBUaGlzIGlzIGV4cGVjdGVkIGJlY2F1c2UgYSBtZXJnZSBjb25maWd1cmF0aW9uXG4gICAgICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAgICAgLy8gbGFiZWwgaXMgYXBwbGllZCwgd2Ugd2FudCB0byBleGl0IHRoZSBzY3JpcHQgZ3JhY2VmdWxseSB3aXRoIGFuIGVycm9yIG1lc3NhZ2UuXG5cbiAgICAgIGxldCB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoY29tbWl0cywgdGFyZ2V0TGFiZWwsIGNvbmZpZy5tZXJnZSk7XG4gICAgICByZXR1cm4gdGFyZ2V0QnJhbmNoZXM7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICAgIHRocm93IG5ldyBQdWxsUmVxdWVzdEZhaWx1cmUoZXJyb3IuZmFpbHVyZU1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59XG4iXX0=