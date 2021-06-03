/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator } from "tslib";
import { params, types as graphqlTypes } from 'typed-graphqlify';
import { parseCommitMessage } from '../../commit-message/parse';
import { red, warn } from '../../utils/console';
import { getPr } from '../../utils/github';
import { PullRequestFailure } from './failures';
import { matchesPattern } from './string-pattern';
import { getBranchesFromTargetLabel, getTargetLabelFromPullRequest, InvalidTargetBranchError, InvalidTargetLabelError } from './target-label';
/** The default label for labeling pull requests containing a breaking change. */
var BreakingChangeLabel = 'breaking changes';
/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
export function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
    var git = _a.git, config = _a.config;
    if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
    return __awaiter(this, void 0, void 0, function () {
        var prData, labels, targetLabel, commitsInPr, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, fetchPullRequestFromGithub(git, prNumber)];
                case 1:
                    prData = _b.sent();
                    if (prData === null) {
                        return [2 /*return*/, PullRequestFailure.notFound()];
                    }
                    labels = prData.labels.nodes.map(function (l) { return l.name; });
                    if (!labels.some(function (name) { return matchesPattern(name, config.mergeReadyLabel); })) {
                        return [2 /*return*/, PullRequestFailure.notMergeReady()];
                    }
                    if (!labels.some(function (name) { return matchesPattern(name, config.claSignedLabel); })) {
                        return [2 /*return*/, PullRequestFailure.claUnsigned()];
                    }
                    try {
                        targetLabel = getTargetLabelFromPullRequest(config, labels);
                    }
                    catch (error) {
                        if (error instanceof InvalidTargetLabelError) {
                            return [2 /*return*/, new PullRequestFailure(error.failureMessage)];
                        }
                        throw error;
                    }
                    commitsInPr = prData.commits.nodes.map(function (n) { return parseCommitMessage(n.commit.message); });
                    try {
                        assertPendingState(prData);
                        assertChangesAllowForTargetLabel(commitsInPr, targetLabel, config);
                        assertCorrectBreakingChangeLabeling(commitsInPr, labels, config);
                    }
                    catch (error) {
                        return [2 /*return*/, error];
                    }
                    state = prData.commits.nodes.slice(-1)[0].commit.status.state;
                    if (state === 'FAILURE' && !ignoreNonFatalFailures) {
                        return [2 /*return*/, PullRequestFailure.failingCiJobs()];
                    }
                    if (state === 'PENDING' && !ignoreNonFatalFailures) {
                        return [2 /*return*/, PullRequestFailure.pendingCiJobs()];
                    }
                    githubTargetBranch = prData.baseRefName;
                    requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
                    needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
                        labels.some(function (name) { return matchesPattern(name, config.commitMessageFixupLabel); });
                    hasCaretakerNote = !!config.caretakerNoteLabel &&
                        labels.some(function (name) { return matchesPattern(name, config.caretakerNoteLabel); });
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                case 3:
                    targetBranches = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    if (error_1 instanceof InvalidTargetBranchError || error_1 instanceof InvalidTargetLabelError) {
                        return [2 /*return*/, new PullRequestFailure(error_1.failureMessage)];
                    }
                    throw error_1;
                case 5: return [2 /*return*/, {
                        url: prData.url,
                        prNumber: prNumber,
                        labels: labels,
                        requiredBaseSha: requiredBaseSha,
                        githubTargetBranch: githubTargetBranch,
                        needsCommitMessageFixup: needsCommitMessageFixup,
                        hasCaretakerNote: hasCaretakerNote,
                        targetBranches: targetBranches,
                        title: prData.title,
                        commitCount: prData.commits.totalCount,
                    }];
            }
        });
    });
}
/* Graphql schema for the response body the requested pull request. */
var PR_SCHEMA = {
    url: graphqlTypes.string,
    isDraft: graphqlTypes.boolean,
    state: graphqlTypes.oneOf(['OPEN', 'MERGED', 'CLOSED']),
    number: graphqlTypes.number,
    // Only the last 100 commits from a pull request are obtained as we likely will never see a pull
    // requests with more than 100 commits.
    commits: params({ last: 100 }, {
        totalCount: graphqlTypes.number,
        nodes: [{
                commit: {
                    status: {
                        state: graphqlTypes.oneOf(['FAILURE', 'PENDING', 'SUCCESS']),
                    },
                    message: graphqlTypes.string,
                },
            }],
    }),
    baseRefName: graphqlTypes.string,
    title: graphqlTypes.string,
    labels: params({ first: 100 }, {
        nodes: [{
                name: graphqlTypes.string,
            }]
    }),
};
/** Fetches a pull request from Github. Returns null if an error occurred. */
function fetchPullRequestFromGithub(git, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, getPr(PR_SCHEMA, prNumber, git)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    e_1 = _a.sent();
                    // If the pull request could not be found, we want to return `null` so
                    // that the error can be handled gracefully.
                    if (e_1.status === 404) {
                        return [2 /*return*/, null];
                    }
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/** Whether the specified value resolves to a pull request. */
export function isPullRequest(v) {
    return v.targetBranches !== undefined;
}
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
    var exemptedScopes = config.targetLabelExemptScopes || [];
    /** List of commits which are subject to content requirements for the target label. */
    commits = commits.filter(function (commit) { return !exemptedScopes.includes(commit.scope); });
    var hasBreakingChanges = commits.some(function (commit) { return commit.breakingChanges.length !== 0; });
    var hasDeprecations = commits.some(function (commit) { return commit.deprecations.length !== 0; });
    var hasFeatureCommits = commits.some(function (commit) { return commit.type === 'feat'; });
    switch (label.pattern) {
        case 'target: major':
            break;
        case 'target: minor':
            if (hasBreakingChanges) {
                throw PullRequestFailure.hasBreakingChanges(label);
            }
            break;
        case 'target: rc':
        case 'target: patch':
        case 'target: lts':
            if (hasBreakingChanges) {
                throw PullRequestFailure.hasBreakingChanges(label);
            }
            if (hasFeatureCommits) {
                throw PullRequestFailure.hasFeatureCommits(label);
            }
            // Deprecations should not be merged into RC, patch or LTS branches.
            // https://semver.org/#spec-item-7. Deprecations should be part of
            // minor releases, or major releases according to SemVer.
            if (hasDeprecations) {
                throw PullRequestFailure.hasDeprecations(label);
            }
            break;
        default:
            warn(red('WARNING: Unable to confirm all commits in the pull request are eligible to be'));
            warn(red("merged into the target branch: " + label.pattern));
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
    var hasLabel = labels.includes(config.breakingChangeLabel || BreakingChangeLabel);
    //** Whether the PR has at least one commit which notes a breaking change. */
    var hasCommit = commits.some(function (commit) { return commit.breakingChanges.length !== 0; });
    if (!hasLabel && hasCommit) {
        throw PullRequestFailure.missingBreakingChangeLabel();
    }
    if (hasLabel && !hasCommit) {
        throw PullRequestFailure.missingBreakingChangeCommit();
    }
}
/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
function assertPendingState(pr) {
    if (pr.isDraft) {
        throw PullRequestFailure.isDraft();
    }
    switch (pr.state) {
        case 'CLOSED':
            throw PullRequestFailure.isClosed();
        case 'MERGED':
            throw PullRequestFailure.isMerged();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFFL0QsT0FBTyxFQUFTLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdEUsT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUU5QyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFHekMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsMEJBQTBCLEVBQUUsNkJBQTZCLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc1SSxpRkFBaUY7QUFDakYsSUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQTBCL0M7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7UUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO0lBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7O3dCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O29CQUF4RCxNQUFNLEdBQUcsU0FBK0M7b0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTt3QkFDbkIsc0JBQU8sa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7cUJBQ3RDO29CQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtB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QyxDQUFDO1lBQzdELE1BQU07S0FDVDtBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxtQ0FBbUMsQ0FDeEMsT0FBaUIsRUFBRSxNQUFnQixFQUFFLE1BQW1CO0lBQzFELDJEQUEyRDtJQUMzRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BGLDZFQUE2RTtJQUM3RSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7SUFFOUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSxrQkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSxrQkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQUdEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsRUFBa0I7SUFDNUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQ2QsTUFBTSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLFFBQVE7WUFDWCxNQUFNLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge3JlZCwgd2Fybn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBUaGUgZGVmYXVsdCBsYWJlbCBmb3IgbGFiZWxpbmcgcHVsbCByZXF1ZXN0cyBjb250YWluaW5nIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuY29uc3QgQnJlYWtpbmdDaGFuZ2VMYWJlbCA9ICdicmVha2luZyBjaGFuZ2VzJztcblxuLyoqIEludGVyZmFjZSB0aGF0IGRlc2NyaWJlcyBhIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVVJMIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByTnVtYmVyOiBudW1iZXI7XG4gIC8qKiBUaXRsZSBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB0aXRsZTogc3RyaW5nO1xuICAvKiogTGFiZWxzIGFwcGxpZWQgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgbGFiZWxzOiBzdHJpbmdbXTtcbiAgLyoqIExpc3Qgb2YgYnJhbmNoZXMgdGhpcyBQUiBzaG91bGQgYmUgbWVyZ2VkIGludG8uICovXG4gIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcbiAgLyoqIEJyYW5jaCB0aGF0IHRoZSBQUiB0YXJnZXRzIGluIHRoZSBHaXRodWIgVUkuICovXG4gIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nO1xuICAvKiogQ291bnQgb2YgY29tbWl0cyBpbiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29tbWl0Q291bnQ6IG51bWJlcjtcbiAgLyoqIE9wdGlvbmFsIFNIQSB0aGF0IHRoaXMgcHVsbCByZXF1ZXN0IG5lZWRzIHRvIGJlIGJhc2VkIG9uLiAqL1xuICByZXF1aXJlZEJhc2VTaGE/OiBzdHJpbmc7XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0IG1lc3NhZ2UgZml4dXAuICovXG4gIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwOiBib29sZWFuO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlLiAqL1xuICBoYXNDYXJldGFrZXJOb3RlOiBib29sZWFuO1xufVxuXG4vKipcbiAqIExvYWRzIGFuZCB2YWxpZGF0ZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgYWdhaW5zdCB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbi5cbiAqIElmIHRoZSBwdWxsIHJlcXVlc3RzIGZhaWxzLCBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlzIHJldHVybmVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QoXG4gICAge2dpdCwgY29uZmlnfTogUHVsbFJlcXVlc3RNZXJnZVRhc2ssIHByTnVtYmVyOiBudW1iZXIsXG4gICAgaWdub3JlTm9uRmF0YWxGYWlsdXJlcyA9IGZhbHNlKTogUHJvbWlzZTxQdWxsUmVxdWVzdHxQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgY29uc3QgcHJEYXRhID0gYXdhaXQgZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoZ2l0LCBwck51bWJlcik7XG5cbiAgaWYgKHByRGF0YSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90Rm91bmQoKTtcbiAgfVxuXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubm9kZXMubWFwKGwgPT4gbC5uYW1lKTtcblxuICBpZiAoIWxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLm1lcmdlUmVhZHlMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RNZXJnZVJlYWR5KCk7XG4gIH1cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jbGFTaWduZWRMYWJlbCkpKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5jbGFVbnNpZ25lZCgpO1xuICB9XG5cbiAgbGV0IHRhcmdldExhYmVsOiBUYXJnZXRMYWJlbDtcbiAgdHJ5IHtcbiAgICB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KGNvbmZpZywgbGFiZWxzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdEZhaWx1cmUoZXJyb3IuZmFpbHVyZU1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxuXG4gIC8qKiBMaXN0IG9mIHBhcnNlZCBjb21taXRzIGZvciBhbGwgb2YgdGhlIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3QgY29tbWl0c0luUHIgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5tYXAobiA9PiBwYXJzZUNvbW1pdE1lc3NhZ2Uobi5jb21taXQubWVzc2FnZSkpO1xuXG4gIHRyeSB7XG4gICAgYXNzZXJ0UGVuZGluZ1N0YXRlKHByRGF0YSk7XG4gICAgYXNzZXJ0Q2hhbmdlc0FsbG93Rm9yVGFyZ2V0TGFiZWwoY29tbWl0c0luUHIsIHRhcmdldExhYmVsLCBjb25maWcpO1xuICAgIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKGNvbW1pdHNJblByLCBsYWJlbHMsIGNvbmZpZyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yO1xuICB9XG5cbiAgLyoqIFRoZSBjb21iaW5lZCBzdGF0dXMgb2YgdGhlIGxhdGVzdCBjb21taXQgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgY29uc3Qgc3RhdGUgPSBwckRhdGEuY29tbWl0cy5ub2Rlcy5zbGljZSgtMSlbMF0uY29tbWl0LnN0YXR1cy5zdGF0ZTtcbiAgaWYgKHN0YXRlID09PSAnRkFJTFVSRScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdQRU5ESU5HJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2VSZWZOYW1lO1xuICBjb25zdCByZXF1aXJlZEJhc2VTaGEgPVxuICAgICAgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHMgJiYgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHNbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgY29uc3QgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPSAhIWNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwpKTtcbiAgY29uc3QgaGFzQ2FyZXRha2VyTm90ZSA9ICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuICBsZXQgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuXG4gIC8vIElmIGJyYW5jaGVzIGFyZSBkZXRlcm1pbmVkIGZvciBhIGdpdmVuIHRhcmdldCBsYWJlbCwgY2FwdHVyZSBlcnJvcnMgdGhhdCBhcmVcbiAgLy8gdGhyb3duIGFzIHBhcnQgb2YgYnJhbmNoIGNvbXB1dGF0aW9uLiBUaGlzIGlzIGV4cGVjdGVkIGJlY2F1c2UgYSBtZXJnZSBjb25maWd1cmF0aW9uXG4gIC8vIGNhbiBsYXppbHkgY29tcHV0ZSBicmFuY2hlcyBmb3IgYSB0YXJnZXQgbGFiZWwgYW5kIHRocm93LiBlLmcuIGlmIGFuIGludmFsaWQgdGFyZ2V0XG4gIC8vIGxhYmVsIGlzIGFwcGxpZWQsIHdlIHdhbnQgdG8gZXhpdCB0aGUgc2NyaXB0IGdyYWNlZnVsbHkgd2l0aCBhbiBlcnJvciBtZXNzYWdlLlxuICB0cnkge1xuICAgIHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHx8IGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHVybDogcHJEYXRhLnVybCxcbiAgICBwck51bWJlcixcbiAgICBsYWJlbHMsXG4gICAgcmVxdWlyZWRCYXNlU2hhLFxuICAgIGdpdGh1YlRhcmdldEJyYW5jaCxcbiAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCxcbiAgICBoYXNDYXJldGFrZXJOb3RlLFxuICAgIHRhcmdldEJyYW5jaGVzLFxuICAgIHRpdGxlOiBwckRhdGEudGl0bGUsXG4gICAgY29tbWl0Q291bnQ6IHByRGF0YS5jb21taXRzLnRvdGFsQ291bnQsXG4gIH07XG59XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSB0aGUgcmVxdWVzdGVkIHB1bGwgcmVxdWVzdC4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBpc0RyYWZ0OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ09QRU4nLCAnTUVSR0VEJywgJ0NMT1NFRCddIGFzIGNvbnN0KSxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAvLyBPbmx5IHRoZSBsYXN0IDEwMCBjb21taXRzIGZyb20gYSBwdWxsIHJlcXVlc3QgYXJlIG9idGFpbmVkIGFzIHdlIGxpa2VseSB3aWxsIG5ldmVyIHNlZSBhIHB1bGxcbiAgLy8gcmVxdWVzdHMgd2l0aCBtb3JlIHRoYW4gMTAwIGNvbW1pdHMuXG4gIGNvbW1pdHM6IHBhcmFtcyh7bGFzdDogMTAwfSwge1xuICAgIHRvdGFsQ291bnQ6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gICAgbm9kZXM6IFt7XG4gICAgICBjb21taXQ6IHtcbiAgICAgICAgc3RhdHVzOiB7XG4gICAgICAgICAgc3RhdGU6IGdyYXBocWxUeXBlcy5vbmVPZihbJ0ZBSUxVUkUnLCAnUEVORElORycsICdTVUNDRVNTJ10gYXMgY29uc3QpLFxuICAgICAgICB9LFxuICAgICAgICBtZXNzYWdlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgfSxcbiAgICB9XSxcbiAgfSksXG4gIGJhc2VSZWZOYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbGFiZWxzOiBwYXJhbXMoe2ZpcnN0OiAxMDB9LCB7XG4gICAgbm9kZXM6IFt7XG4gICAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH1dXG4gIH0pLFxufTtcblxuLyoqIEEgcHVsbCByZXF1ZXN0IHJldHJpZXZlZCBmcm9tIGdpdGh1YiB2aWEgdGhlIGdyYXBocWwgQVBJLiAqL1xudHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cblxuLyoqIEZldGNoZXMgYSBwdWxsIHJlcXVlc3QgZnJvbSBHaXRodWIuIFJldHVybnMgbnVsbCBpZiBhbiBlcnJvciBvY2N1cnJlZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKFxuICAgIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8UmF3UHVsbFJlcXVlc3R8bnVsbD4ge1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLFxuICogdGhyb3dpbmcgYW4gZXJyb3Igb3RoZXJ3aXNlLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5mdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWw6IFRhcmdldExhYmVsLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoY29tbWl0ID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0RlcHJlY2F0aW9ucyA9IGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNGZWF0dXJlQ29tbWl0cyA9IGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0Jyk7XG4gIHN3aXRjaCAobGFiZWwucGF0dGVybikge1xuICAgIGNhc2UgJ3RhcmdldDogbWFqb3InOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiBtaW5vcic6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiByYyc6XG4gICAgY2FzZSAndGFyZ2V0OiBwYXRjaCc6XG4gICAgY2FzZSAndGFyZ2V0OiBsdHMnOlxuICAgICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlcykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNGZWF0dXJlQ29tbWl0cykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRmVhdHVyZUNvbW1pdHMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gRGVwcmVjYXRpb25zIHNob3VsZCBub3QgYmUgbWVyZ2VkIGludG8gUkMsIHBhdGNoIG9yIExUUyBicmFuY2hlcy5cbiAgICAgIC8vIGh0dHBzOi8vc2VtdmVyLm9yZy8jc3BlYy1pdGVtLTcuIERlcHJlY2F0aW9ucyBzaG91bGQgYmUgcGFydCBvZlxuICAgICAgLy8gbWlub3IgcmVsZWFzZXMsIG9yIG1ham9yIHJlbGVhc2VzIGFjY29yZGluZyB0byBTZW1WZXIuXG4gICAgICBpZiAoaGFzRGVwcmVjYXRpb25zKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNEZXByZWNhdGlvbnMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHdhcm4ocmVkKCdXQVJOSU5HOiBVbmFibGUgdG8gY29uZmlybSBhbGwgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGFyZSBlbGlnaWJsZSB0byBiZScpKTtcbiAgICAgIHdhcm4ocmVkKGBtZXJnZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaDogJHtsYWJlbC5wYXR0ZXJufWApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaGFzIHRoZSBwcm9wZXIgbGFiZWwgZm9yIGJyZWFraW5nIGNoYW5nZXMgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZVxuICogY29tbWl0cywgYW5kIG9ubHkgaGFzIHRoZSBsYWJlbCBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlIGNvbW1pdHMuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmZ1bmN0aW9uIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKFxuICAgIGNvbW1pdHM6IENvbW1pdFtdLCBsYWJlbHM6IHN0cmluZ1tdLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYSBsYWJlbCBub3RpbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0xhYmVsID0gbGFiZWxzLmluY2x1ZGVzKGNvbmZpZy5icmVha2luZ0NoYW5nZUxhYmVsIHx8IEJyZWFraW5nQ2hhbmdlTGFiZWwpO1xuICAvLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhdCBsZWFzdCBvbmUgY29tbWl0IHdoaWNoIG5vdGVzIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNDb21taXQgPSBjb21taXRzLnNvbWUoY29tbWl0ID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGlzIHBlbmRpbmcsIG5vdCBjbG9zZWQsIG1lcmdlZCBvciBpbiBkcmFmdC5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX0gaWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBub3QgcGVuZGluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0UGVuZGluZ1N0YXRlKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICBpZiAocHIuaXNEcmFmdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0RyYWZ0KCk7XG4gIH1cbiAgc3dpdGNoIChwci5zdGF0ZSkge1xuICAgIGNhc2UgJ0NMT1NFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNDbG9zZWQoKTtcbiAgICBjYXNlICdNRVJHRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzTWVyZ2VkKCk7XG4gIH1cbn1cbiJdfQ==