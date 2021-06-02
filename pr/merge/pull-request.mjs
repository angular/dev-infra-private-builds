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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksWUFBWSxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDL0QsT0FBTyxFQUFTLGtCQUFrQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDdEUsT0FBTyxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUc5QyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFHekMsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQzlDLE9BQU8sRUFBQyxjQUFjLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLEVBQUMsMEJBQTBCLEVBQUUsNkJBQTZCLEVBQUUsd0JBQXdCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc1SSxpRkFBaUY7QUFDakYsSUFBTSxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQTBCL0M7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQiwwQkFBMEIsQ0FDNUMsRUFBbUMsRUFBRSxRQUFnQixFQUNyRCxzQkFBOEI7UUFEN0IsR0FBRyxTQUFBLEVBQUUsTUFBTSxZQUFBO0lBQ1osdUNBQUEsRUFBQSw4QkFBOEI7Ozs7O3dCQUNqQixxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLEVBQUE7O29CQUF4RCxNQUFNLEdBQUcsU0FBK0M7b0JBRTlELElBQUksTUFBTSxLQUFLLElBQUksRUFBRTt3QkFDbkIsc0JBQU8sa0JBQWtCLENBQUMsUUFBUSxFQUFFLEVBQUM7cUJBQ3RDO29CQUVLLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO29CQUVwRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxFQUE1QyxDQUE0QyxDQUFDLEVBQUU7d0JBQ3RFLHNCQUFPLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3FCQUMzQztvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLEVBQUU7d0JBQ3JFLHNCQUFPLGtCQUFrQixDQUFDLFdBQVcsRUFBRSxFQUFDO3FCQUN6QztvQkFHRCxJQUFJO3dCQUNGLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7cUJBQzdEO29CQUFDLE9BQU8sS0FBSyxFQUFFO3dCQUNkLElBQUksS0FBSyxZQUFZLHVCQUF1QixFQUFFOzRCQUM1QyxzQkFBTyxJQUFJLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBQzt5QkFDckQ7d0JBQ0QsTUFBTSxLQUFLLENBQUM7cUJBQ2I7b0JBR0ssV0FBVyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQXBDLENBQW9DLENBQUMsQ0FBQztvQkFFeEYsSUFBSTt3QkFDRixrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzt3QkFDM0IsZ0NBQWdDLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFDbkUsbUNBQW1DLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztxQkFDbEU7b0JBQUMsT0FBTyxLQUFLLEVBQUU7d0JBQ2Qsc0JBQU8sS0FBSyxFQUFDO3FCQUNkO29CQUdLLEtBQUssR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztvQkFDcEUsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7d0JBQ2xELHNCQUFPLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3FCQUMzQztvQkFDRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxzQkFBc0IsRUFBRTt3QkFDbEQsc0JBQU8sa0JBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7cUJBQzNDO29CQUVLLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7b0JBQ3hDLGVBQWUsR0FDakIsTUFBTSxDQUFDLG1CQUFtQixJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO29CQUMzRSx1QkFBdUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLHVCQUF1Qjt3QkFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGNBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQXBELENBQW9ELENBQUMsQ0FBQztvQkFDeEUsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0I7d0JBQ2hELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxrQkFBbUIsQ0FBQyxFQUFoRCxDQUFnRCxDQUFDLENBQUM7Ozs7b0JBUXZELHFCQUFNLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxFQUFBOztvQkFBbEYsY0FBYyxHQUFHLFNBQWlFLENBQUM7Ozs7b0JBRW5GLElBQUksT0FBSyxZQUFZLHdCQUF3QixJQUFJLE9BQUssWUFBWSx1QkFBdUIsRUFBRTt3QkFDekYsc0JBQU8sSUFBSSxrQkFBa0IsQ0FBQyxPQUFLLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQ3JEO29CQUNELE1BQU0sT0FBSyxDQUFDO3dCQUdkLHNCQUFPO3dCQUNMLEdBQUcsRUFBRSxNQUFNLENBQUMsR0FBRzt3QkFDZixRQUFRLFVBQUE7d0JBQ1IsTUFBTSxRQUFBO3dCQUNOLGVBQWUsaUJBQUE7d0JBQ2Ysa0JBQWtCLG9CQUFBO3dCQUNsQix1QkFBdUIseUJBQUE7d0JBQ3ZCLGdCQUFnQixrQkFBQTt3QkFDaEIsY0FBYyxnQkFBQTt3QkFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7d0JBQ25CLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVU7cUJBQ3ZDLEVBQUM7Ozs7Q0FDSDtBQUVELHNFQUFzRTtBQUN0RSxJQUFNLFNBQVMsR0FBRztJQUNoQixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDeEIsT0FBTyxFQUFFLFlBQVksQ0FBQyxPQUFPO0lBQzdCLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLENBQVUsQ0FBQztJQUNoRSxNQUFNLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDM0IsZ0dBQWdHO0lBQ2hHLHVDQUF1QztJQUN2QyxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUMsSUFBSSxFQUFFLEdBQUcsRUFBQyxFQUFFO1FBQzNCLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTTtRQUMvQixLQUFLLEVBQUUsQ0FBQztnQkFDTixNQUFNLEVBQUU7b0JBQ04sTUFBTSxFQUFFO3dCQUNOLEtBQUssRUFBRSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQVUsQ0FBQztxQkFDdEU7b0JBQ0QsT0FBTyxFQUFFLFlBQVksQ0FBQyxNQUFNO2lCQUM3QjthQUNGLENBQUM7S0FDSCxDQUFDO0lBQ0YsV0FBVyxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQ2hDLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMxQixNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxFQUFFO1FBQzNCLEtBQUssRUFBRSxDQUFDO2dCQUNOLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTthQUMxQixDQUFDO0tBQ0gsQ0FBQztDQUNILENBQUM7QUFNRiw2RUFBNkU7QUFDN0UsU0FBZSwwQkFBMEIsQ0FDckMsR0FBb0IsRUFBRSxRQUFnQjs7Ozs7OztvQkFFL0IscUJBQU0sS0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUE7d0JBQTVDLHNCQUFPLFNBQXFDLEVBQUM7OztvQkFFN0Msc0VBQXNFO29CQUN0RSw0Q0FBNEM7b0JBQzVDLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7d0JBQ3BCLHNCQUFPLElBQUksRUFBQztxQkFDYjtvQkFDRCxNQUFNLEdBQUMsQ0FBQzs7Ozs7Q0FFWDtBQUVELDhEQUE4RDtBQUM5RCxNQUFNLFVBQVUsYUFBYSxDQUFDLENBQWlDO0lBQzdELE9BQVEsQ0FBaUIsQ0FBQyxjQUFjLEtBQUssU0FBUyxDQUFDO0FBQ3pELENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxnQ0FBZ0MsQ0FDckMsT0FBaUIsRUFBRSxLQUFrQixFQUFFLE1BQW1CO0lBQzVEOzs7T0FHRztJQUNILElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyx1QkFBdUIsSUFBSSxFQUFFLENBQUM7SUFDNUQsc0ZBQXNGO0lBQ3RGLE9BQU8sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBdEMsQ0FBc0MsQ0FBQyxDQUFDO0lBQzNFLElBQU0sa0JBQWtCLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLE1BQU0sQ0FBQyxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxDQUFDO0lBQ3ZGLElBQU0sZUFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQWhDLENBQWdDLENBQUMsQ0FBQztJQUNqRixJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBdEIsQ0FBc0IsQ0FBQyxDQUFDO0lBQ3pFLFFBQVEsS0FBSyxDQUFDLE9BQU8sRUFBRTtRQUNyQixLQUFLLGVBQWU7WUFDbEIsTUFBTTtRQUNSLEtBQUssZUFBZTtZQUNsQixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixNQUFNLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsTUFBTTtRQUNSLEtBQUssWUFBWSxDQUFDO1FBQ2xCLEtBQUssZUFBZSxDQUFDO1FBQ3JCLEtBQUssYUFBYTtZQUNoQixJQUFJLGtCQUFrQixFQUFFO2dCQUN0QixNQUFNLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3BEO1lBQ0QsSUFBSSxpQkFBaUIsRUFBRTtnQkFDckIsTUFBTSxrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNuRDtZQUNELG9FQUFvRTtZQUNwRSxrRUFBa0U7WUFDbEUseURBQXlEO1lBQ3pELElBQUksZUFBZSxFQUFFO2dCQUNuQixNQUFNLGtCQUFrQixDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUNqRDtZQUNELE1BQU07UUFDUjtZQUNFLElBQUksQ0FBQyxHQUFHLENBQUMsK0VBQStFLENBQUMsQ0FBQyxDQUFDO1lBQzNGLElBQUksQ0FBQyxHQUFHLENBQUMsb0NBQWtDLEtBQUssQ0FBQyxPQUFTLENBQUMsQ0FBQyxDQUFDO1lBQzdELE1BQU07S0FDVDtBQUNILENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxtQ0FBbUMsQ0FDeEMsT0FBaUIsRUFBRSxNQUFnQixFQUFFLE1BQW1CO0lBQzFELDJEQUEyRDtJQUMzRCxJQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BGLDZFQUE2RTtJQUM3RSxJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7SUFFOUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxTQUFTLEVBQUU7UUFDMUIsTUFBTSxrQkFBa0IsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0tBQ3ZEO0lBRUQsSUFBSSxRQUFRLElBQUksQ0FBQyxTQUFTLEVBQUU7UUFDMUIsTUFBTSxrQkFBa0IsQ0FBQywyQkFBMkIsRUFBRSxDQUFDO0tBQ3hEO0FBQ0gsQ0FBQztBQUdEOzs7R0FHRztBQUNILFNBQVMsa0JBQWtCLENBQUMsRUFBa0I7SUFDNUMsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFO1FBQ2QsTUFBTSxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNwQztJQUNELFFBQVEsRUFBRSxDQUFDLEtBQUssRUFBRTtRQUNoQixLQUFLLFFBQVE7WUFDWCxNQUFNLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3RDLEtBQUssUUFBUTtZQUNYLE1BQU0sa0JBQWtCLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDdkM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cGFyYW1zLCB0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtDb21taXQsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtyZWQsIHdhcm59IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5pbXBvcnQge01lcmdlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LCBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsIEludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVGhlIGRlZmF1bHQgbGFiZWwgZm9yIGxhYmVsaW5nIHB1bGwgcmVxdWVzdHMgY29udGFpbmluZyBhIGJyZWFraW5nIGNoYW5nZS4gKi9cbmNvbnN0IEJyZWFraW5nQ2hhbmdlTGFiZWwgPSAnYnJlYWtpbmcgY2hhbmdlcyc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICAgIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBwck51bWJlcjogbnVtYmVyLFxuICAgIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSk6IFByb21pc2U8UHVsbFJlcXVlc3R8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm5vZGVzLm1hcChsID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGxldCB0YXJnZXRMYWJlbDogVGFyZ2V0TGFiZWw7XG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWcsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICAvKiogTGlzdCBvZiBwYXJzZWQgY29tbWl0cyBmb3IgYWxsIG9mIHRoZSBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IGNvbW1pdHNJblByID0gcHJEYXRhLmNvbW1pdHMubm9kZXMubWFwKG4gPT4gcGFyc2VDb21taXRNZXNzYWdlKG4uY29tbWl0Lm1lc3NhZ2UpKTtcblxuICB0cnkge1xuICAgIGFzc2VydFBlbmRpbmdTdGF0ZShwckRhdGEpO1xuICAgIGFzc2VydENoYW5nZXNBbGxvd0ZvclRhcmdldExhYmVsKGNvbW1pdHNJblByLCB0YXJnZXRMYWJlbCwgY29uZmlnKTtcbiAgICBhc3NlcnRDb3JyZWN0QnJlYWtpbmdDaGFuZ2VMYWJlbGluZyhjb21taXRzSW5QciwgbGFiZWxzLCBjb25maWcpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuXG4gIC8qKiBUaGUgY29tYmluZWQgc3RhdHVzIG9mIHRoZSBsYXRlc3QgY29tbWl0IGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGNvbnN0IHN0YXRlID0gcHJEYXRhLmNvbW1pdHMubm9kZXMuc2xpY2UoLTEpWzBdLmNvbW1pdC5zdGF0dXMuc3RhdGU7XG4gIGlmIChzdGF0ZSA9PT0gJ0ZBSUxVUkUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAnUEVORElORycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlUmVmTmFtZTtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID0gISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPSAhIWNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCEpKTtcbiAgbGV0IHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IHByRGF0YS51cmwsXG4gICAgcHJOdW1iZXIsXG4gICAgbGFiZWxzLFxuICAgIHJlcXVpcmVkQmFzZVNoYSxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsXG4gICAgaGFzQ2FyZXRha2VyTm90ZSxcbiAgICB0YXJnZXRCcmFuY2hlcyxcbiAgICB0aXRsZTogcHJEYXRhLnRpdGxlLFxuICAgIGNvbW1pdENvdW50OiBwckRhdGEuY29tbWl0cy50b3RhbENvdW50LFxuICB9O1xufVxuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgdGhlIHJlcXVlc3RlZCBwdWxsIHJlcXVlc3QuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaXNEcmFmdDogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydPUEVOJywgJ01FUkdFRCcsICdDTE9TRUQnXSBhcyBjb25zdCksXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgLy8gT25seSB0aGUgbGFzdCAxMDAgY29tbWl0cyBmcm9tIGEgcHVsbCByZXF1ZXN0IGFyZSBvYnRhaW5lZCBhcyB3ZSBsaWtlbHkgd2lsbCBuZXZlciBzZWUgYSBwdWxsXG4gIC8vIHJlcXVlc3RzIHdpdGggbW9yZSB0aGFuIDEwMCBjb21taXRzLlxuICBjb21taXRzOiBwYXJhbXMoe2xhc3Q6IDEwMH0sIHtcbiAgICB0b3RhbENvdW50OiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICAgIG5vZGVzOiBbe1xuICAgICAgY29tbWl0OiB7XG4gICAgICAgIHN0YXR1czoge1xuICAgICAgICAgIHN0YXRlOiBncmFwaHFsVHlwZXMub25lT2YoWydGQUlMVVJFJywgJ1BFTkRJTkcnLCAnU1VDQ0VTUyddIGFzIGNvbnN0KSxcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIH0sXG4gICAgfV0sXG4gIH0pLFxuICBiYXNlUmVmTmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGxhYmVsczogcGFyYW1zKHtmaXJzdDogMTAwfSwge1xuICAgIG5vZGVzOiBbe1xuICAgICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9XVxuICB9KSxcbn07XG5cbi8qKiBBIHB1bGwgcmVxdWVzdCByZXRyaWV2ZWQgZnJvbSBnaXRodWIgdmlhIHRoZSBncmFwaHFsIEFQSS4gKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgICBnaXQ6IEdpdENsaWVudDx0cnVlPiwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8UmF3UHVsbFJlcXVlc3R8bnVsbD4ge1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGUgY29tbWl0cyBwcm92aWRlZCBhcmUgYWxsb3dlZCB0byBtZXJnZSB0byB0aGUgcHJvdmlkZWQgdGFyZ2V0IGxhYmVsLFxuICogdGhyb3dpbmcgYW4gZXJyb3Igb3RoZXJ3aXNlLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3RGYWlsdXJlfVxuICovXG5mdW5jdGlvbiBhc3NlcnRDaGFuZ2VzQWxsb3dGb3JUYXJnZXRMYWJlbChcbiAgICBjb21taXRzOiBDb21taXRbXSwgbGFiZWw6IFRhcmdldExhYmVsLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKlxuICAgKiBMaXN0IG9mIGNvbW1pdCBzY29wZXMgd2hpY2ggYXJlIGV4ZW1wdGVkIGZyb20gdGFyZ2V0IGxhYmVsIGNvbnRlbnQgcmVxdWlyZW1lbnRzLiBpLmUuIG5vIGBmZWF0YFxuICAgKiBzY29wZXMgaW4gcGF0Y2ggYnJhbmNoZXMsIG5vIGJyZWFraW5nIGNoYW5nZXMgaW4gbWlub3Igb3IgcGF0Y2ggY2hhbmdlcy5cbiAgICovXG4gIGNvbnN0IGV4ZW1wdGVkU2NvcGVzID0gY29uZmlnLnRhcmdldExhYmVsRXhlbXB0U2NvcGVzIHx8IFtdO1xuICAvKiogTGlzdCBvZiBjb21taXRzIHdoaWNoIGFyZSBzdWJqZWN0IHRvIGNvbnRlbnQgcmVxdWlyZW1lbnRzIGZvciB0aGUgdGFyZ2V0IGxhYmVsLiAqL1xuICBjb21taXRzID0gY29tbWl0cy5maWx0ZXIoY29tbWl0ID0+ICFleGVtcHRlZFNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKTtcbiAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2VzID0gY29tbWl0cy5zb21lKGNvbW1pdCA9PiBjb21taXQuYnJlYWtpbmdDaGFuZ2VzLmxlbmd0aCAhPT0gMCk7XG4gIGNvbnN0IGhhc0RlcHJlY2F0aW9ucyA9IGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LmRlcHJlY2F0aW9ucy5sZW5ndGggIT09IDApO1xuICBjb25zdCBoYXNGZWF0dXJlQ29tbWl0cyA9IGNvbW1pdHMuc29tZShjb21taXQgPT4gY29tbWl0LnR5cGUgPT09ICdmZWF0Jyk7XG4gIHN3aXRjaCAobGFiZWwucGF0dGVybikge1xuICAgIGNhc2UgJ3RhcmdldDogbWFqb3InOlxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiBtaW5vcic6XG4gICAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2VzKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNCcmVha2luZ0NoYW5nZXMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAndGFyZ2V0OiByYyc6XG4gICAgY2FzZSAndGFyZ2V0OiBwYXRjaCc6XG4gICAgY2FzZSAndGFyZ2V0OiBsdHMnOlxuICAgICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlcykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzQnJlYWtpbmdDaGFuZ2VzKGxhYmVsKTtcbiAgICAgIH1cbiAgICAgIGlmIChoYXNGZWF0dXJlQ29tbWl0cykge1xuICAgICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaGFzRmVhdHVyZUNvbW1pdHMobGFiZWwpO1xuICAgICAgfVxuICAgICAgLy8gRGVwcmVjYXRpb25zIHNob3VsZCBub3QgYmUgbWVyZ2VkIGludG8gUkMsIHBhdGNoIG9yIExUUyBicmFuY2hlcy5cbiAgICAgIC8vIGh0dHBzOi8vc2VtdmVyLm9yZy8jc3BlYy1pdGVtLTcuIERlcHJlY2F0aW9ucyBzaG91bGQgYmUgcGFydCBvZlxuICAgICAgLy8gbWlub3IgcmVsZWFzZXMsIG9yIG1ham9yIHJlbGVhc2VzIGFjY29yZGluZyB0byBTZW1WZXIuXG4gICAgICBpZiAoaGFzRGVwcmVjYXRpb25zKSB7XG4gICAgICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5oYXNEZXByZWNhdGlvbnMobGFiZWwpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHdhcm4ocmVkKCdXQVJOSU5HOiBVbmFibGUgdG8gY29uZmlybSBhbGwgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0IGFyZSBlbGlnaWJsZSB0byBiZScpKTtcbiAgICAgIHdhcm4ocmVkKGBtZXJnZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaDogJHtsYWJlbC5wYXR0ZXJufWApKTtcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoZSBwdWxsIHJlcXVlc3QgaGFzIHRoZSBwcm9wZXIgbGFiZWwgZm9yIGJyZWFraW5nIGNoYW5nZXMgaWYgdGhlcmUgYXJlIGJyZWFraW5nIGNoYW5nZVxuICogY29tbWl0cywgYW5kIG9ubHkgaGFzIHRoZSBsYWJlbCBpZiB0aGVyZSBhcmUgYnJlYWtpbmcgY2hhbmdlIGNvbW1pdHMuXG4gKiBAdGhyb3dzIHtQdWxsUmVxdWVzdEZhaWx1cmV9XG4gKi9cbmZ1bmN0aW9uIGFzc2VydENvcnJlY3RCcmVha2luZ0NoYW5nZUxhYmVsaW5nKFxuICAgIGNvbW1pdHM6IENvbW1pdFtdLCBsYWJlbHM6IHN0cmluZ1tdLCBjb25maWc6IE1lcmdlQ29uZmlnKSB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBoYXMgYSBsYWJlbCBub3RpbmcgYSBicmVha2luZyBjaGFuZ2UuICovXG4gIGNvbnN0IGhhc0xhYmVsID0gbGFiZWxzLmluY2x1ZGVzKGNvbmZpZy5icmVha2luZ0NoYW5nZUxhYmVsIHx8IEJyZWFraW5nQ2hhbmdlTGFiZWwpO1xuICAvLyoqIFdoZXRoZXIgdGhlIFBSIGhhcyBhdCBsZWFzdCBvbmUgY29tbWl0IHdoaWNoIG5vdGVzIGEgYnJlYWtpbmcgY2hhbmdlLiAqL1xuICBjb25zdCBoYXNDb21taXQgPSBjb21taXRzLnNvbWUoY29tbWl0ID0+IGNvbW1pdC5icmVha2luZ0NoYW5nZXMubGVuZ3RoICE9PSAwKTtcblxuICBpZiAoIWhhc0xhYmVsICYmIGhhc0NvbW1pdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNzaW5nQnJlYWtpbmdDaGFuZ2VMYWJlbCgpO1xuICB9XG5cbiAgaWYgKGhhc0xhYmVsICYmICFoYXNDb21taXQpIHtcbiAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUubWlzc2luZ0JyZWFraW5nQ2hhbmdlQ29tbWl0KCk7XG4gIH1cbn1cblxuXG4vKipcbiAqIEFzc2VydCB0aGUgcHVsbCByZXF1ZXN0IGlzIHBlbmRpbmcsIG5vdCBjbG9zZWQsIG1lcmdlZCBvciBpbiBkcmFmdC5cbiAqIEB0aHJvd3Mge1B1bGxSZXF1ZXN0RmFpbHVyZX0gaWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBub3QgcGVuZGluZy5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0UGVuZGluZ1N0YXRlKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICBpZiAocHIuaXNEcmFmdCkge1xuICAgIHRocm93IFB1bGxSZXF1ZXN0RmFpbHVyZS5pc0RyYWZ0KCk7XG4gIH1cbiAgc3dpdGNoIChwci5zdGF0ZSkge1xuICAgIGNhc2UgJ0NMT1NFRCc6XG4gICAgICB0aHJvdyBQdWxsUmVxdWVzdEZhaWx1cmUuaXNDbG9zZWQoKTtcbiAgICBjYXNlICdNRVJHRUQnOlxuICAgICAgdGhyb3cgUHVsbFJlcXVlc3RGYWlsdXJlLmlzTWVyZ2VkKCk7XG4gIH1cbn1cbiJdfQ==