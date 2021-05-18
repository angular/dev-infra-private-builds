/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __awaiter, __extends, __generator, __read } from "tslib";
import { prompt } from 'inquirer';
import { parseCommitMessage } from '../../../commit-message/parse';
import { PullRequestFailure } from '../failures';
import { matchesPattern } from '../string-pattern';
import { MergeStrategy, TEMP_PR_HEAD_BRANCH } from './strategy';
/** Separator between commit message header and body. */
var COMMIT_HEADER_SEPARATOR = '\n\n';
/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
var GithubApiMergeStrategy = /** @class */ (function (_super) {
    __extends(GithubApiMergeStrategy, _super);
    function GithubApiMergeStrategy(git, _config) {
        var _this = _super.call(this, git) || this;
        _this._config = _config;
        return _this;
    }
    GithubApiMergeStrategy.prototype.merge = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var githubTargetBranch, prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, method, cherryPickTargetBranches, failure, mergeOptions, mergeStatusCode, targetSha, result, e_1, targetCommitsCount, failedBranches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubTargetBranch = pullRequest.githubTargetBranch, prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup;
                        // If the pull request does not have its base branch set to any determined target
                        // branch, we cannot merge using the API.
                        if (targetBranches.every(function (t) { return t !== githubTargetBranch; })) {
                            return [2 /*return*/, PullRequestFailure.mismatchingTargetBranch(targetBranches)];
                        }
                        // In cases where a required base commit is specified for this pull request, check if
                        // the pull request contains the given commit. If not, return a pull request failure.
                        // This check is useful for enforcing that PRs are rebased on top of a given commit.
                        // e.g. a commit that changes the code ownership validation. PRs which are not rebased
                        // could bypass new codeowner ship rules.
                        if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                            return [2 /*return*/, PullRequestFailure.unsatisfiedBaseSha()];
                        }
                        method = this._getMergeActionFromPullRequest(pullRequest);
                        cherryPickTargetBranches = targetBranches.filter(function (b) { return b !== githubTargetBranch; });
                        return [4 /*yield*/, this._checkMergability(pullRequest, cherryPickTargetBranches)];
                    case 1:
                        failure = _a.sent();
                        // If the PR could not be cherry-picked into all target branches locally, we know it can't
                        // be done through the Github API either. We abort merging and pass-through the failure.
                        if (failure !== null) {
                            return [2 /*return*/, failure];
                        }
                        mergeOptions = __assign({ pull_number: prNumber, merge_method: method }, this.git.remoteParams);
                        if (!needsCommitMessageFixup) return [3 /*break*/, 3];
                        // Commit message fixup does not work with other merge methods as the Github API only
                        // allows commit message modifications for squash merging.
                        if (method !== 'squash') {
                            return [2 /*return*/, PullRequestFailure.unableToFixupCommitMessageSquashOnly()];
                        }
                        return [4 /*yield*/, this._promptCommitMessageEdit(pullRequest, mergeOptions)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.git.github.pulls.merge(mergeOptions)];
                    case 4:
                        result = _a.sent();
                        mergeStatusCode = result.status;
                        targetSha = result.data.sha;
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        // Note: Github usually returns `404` as status code if the API request uses a
                        // token with insufficient permissions. Github does this because it doesn't want
                        // to leak whether a repository exists or not. In our case we expect a certain
                        // repository to exist, so we always treat this as a permission failure.
                        if (e_1.status === 403 || e_1.status === 404) {
                            return [2 /*return*/, PullRequestFailure.insufficientPermissionsToMerge()];
                        }
                        throw e_1;
                    case 6:
                        // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
                        // Pull request cannot be merged due to merge conflicts.
                        if (mergeStatusCode === 405) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts([githubTargetBranch])];
                        }
                        if (mergeStatusCode !== 200) {
                            return [2 /*return*/, PullRequestFailure.unknownMergeError()];
                        }
                        // If the PR does  not need to be merged into any other target branches,
                        // we exit here as we already completed the merge.
                        if (!cherryPickTargetBranches.length) {
                            return [2 /*return*/, null];
                        }
                        // Refresh the target branch the PR has been merged into through the API. We need
                        // to re-fetch as otherwise we cannot cherry-pick the new commits into the remaining
                        // target branches.
                        this.fetchTargetBranches([githubTargetBranch]);
                        targetCommitsCount = method === 'squash' ? 1 : pullRequest.commitCount;
                        return [4 /*yield*/, this.cherryPickIntoTargetBranches(targetSha + "~" + targetCommitsCount + ".." + targetSha, cherryPickTargetBranches, {
                                // Commits that have been created by the Github API do not necessarily contain
                                // a reference to the source pull request (unless the squash strategy is used).
                                // To ensure that original commits can be found when a commit is viewed in a
                                // target branch, we add a link to the original commits when cherry-picking.
                                linkToOriginalCommits: true,
                            })];
                    case 7:
                        failedBranches = _a.sent();
                        // We already checked whether the PR can be cherry-picked into the target branches,
                        // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
                        // commits created through the Github API could be different (i.e. through squash).
                        if (failedBranches.length) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                        }
                        this.pushTargetBranchesUpstream(cherryPickTargetBranches);
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Prompts the user for the commit message changes. Unlike as in the autosquash merge
     * strategy, we cannot start an interactive rebase because we merge using the Github API.
     * The Github API only allows modifications to PR title and body for squash merges.
     */
    GithubApiMergeStrategy.prototype._promptCommitMessageEdit = function (pullRequest, mergeOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var commitMessage, result, _a, newTitle, newMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getDefaultSquashCommitMessage(pullRequest)];
                    case 1:
                        commitMessage = _b.sent();
                        return [4 /*yield*/, prompt({
                                type: 'editor',
                                name: 'result',
                                message: 'Please update the commit message',
                                default: commitMessage,
                            })];
                    case 2:
                        result = (_b.sent()).result;
                        _a = __read(result.split(COMMIT_HEADER_SEPARATOR)), newTitle = _a[0], newMessage = _a.slice(1);
                        // Update the merge options so that the changes are reflected in there.
                        mergeOptions.commit_title = newTitle + " (#" + pullRequest.prNumber + ")";
                        mergeOptions.commit_message = newMessage.join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a commit message for the given pull request. Github by default concatenates
     * multiple commit messages if a PR is merged in squash mode. We try to replicate this
     * behavior here so that we have a default commit message that can be fixed up.
     */
    GithubApiMergeStrategy.prototype._getDefaultSquashCommitMessage = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var commits, messageBase, joinedMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getPullRequestCommitMessages(pullRequest)];
                    case 1:
                        commits = (_a.sent())
                            .map(function (message) { return ({ message: message, parsed: parseCommitMessage(message) }); });
                        messageBase = "" + pullRequest.title + COMMIT_HEADER_SEPARATOR;
                        if (commits.length <= 1) {
                            return [2 /*return*/, "" + messageBase + commits[0].parsed.body];
                        }
                        joinedMessages = commits.map(function (c) { return "* " + c.message; }).join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/, "" + messageBase + joinedMessages];
                }
            });
        });
    };
    /** Gets all commit messages of commits in the pull request. */
    GithubApiMergeStrategy.prototype._getPullRequestCommitMessages = function (_a) {
        var prNumber = _a.prNumber;
        return __awaiter(this, void 0, void 0, function () {
            var request, allCommits;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        request = this.git.github.pulls.listCommits.endpoint.merge(__assign(__assign({}, this.git.remoteParams), { pull_number: prNumber }));
                        return [4 /*yield*/, this.git.github.paginate(request)];
                    case 1:
                        allCommits = _b.sent();
                        return [2 /*return*/, allCommits.map(function (_a) {
                                var commit = _a.commit;
                                return commit.message;
                            })];
                }
            });
        });
    };
    /**
     * Checks if given pull request could be merged into its target branches.
     * @returns A pull request failure if it the PR could not be merged.
     */
    GithubApiMergeStrategy.prototype._checkMergability = function (pullRequest, targetBranches) {
        return __awaiter(this, void 0, void 0, function () {
            var revisionRange, failedBranches;
            return __generator(this, function (_a) {
                revisionRange = this.getPullRequestRevisionRange(pullRequest);
                failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, { dryRun: true });
                if (failedBranches.length) {
                    return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                }
                return [2 /*return*/, null];
            });
        });
    };
    /** Determines the merge action from the given pull request. */
    GithubApiMergeStrategy.prototype._getMergeActionFromPullRequest = function (_a) {
        var labels = _a.labels;
        if (this._config.labels) {
            var matchingLabel = this._config.labels.find(function (_a) {
                var pattern = _a.pattern;
                return labels.some(function (l) { return matchesPattern(l, pattern); });
            });
            if (matchingLabel !== undefined) {
                return matchingLabel.method;
            }
        }
        return this._config.default;
    };
    return GithubApiMergeStrategy;
}(MergeStrategy));
export { GithubApiMergeStrategy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBR2pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUUvQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFakQsT0FBTyxFQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQVU5RCx3REFBd0Q7QUFDeEQsSUFBTSx1QkFBdUIsR0FBRyxNQUFNLENBQUM7QUFFdkM7Ozs7OztHQU1HO0FBQ0g7SUFBNEMsMENBQWE7SUFDdkQsZ0NBQVksR0FBb0IsRUFBVSxPQUFxQztRQUEvRSxZQUNFLGtCQUFNLEdBQUcsQ0FBQyxTQUNYO1FBRnlDLGFBQU8sR0FBUCxPQUFPLENBQThCOztJQUUvRSxDQUFDO0lBRUssc0NBQUssR0FBWCxVQUFZLFdBQXdCOzs7Ozs7d0JBQzNCLGtCQUFrQixHQUNyQixXQUFXLG1CQURVLEVBQUUsUUFBUSxHQUMvQixXQUFXLFNBRG9CLEVBQUUsY0FBYyxHQUMvQyxXQUFXLGVBRG9DLEVBQUUsZUFBZSxHQUNoRSxXQUFXLGdCQURxRCxFQUFFLHVCQUF1QixHQUN6RixXQUFXLHdCQUQ4RSxDQUM3RTt3QkFDaEIsaUZBQWlGO3dCQUNqRix5Q0FBeUM7d0JBQ3pDLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxrQkFBa0IsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFFOzRCQUN2RCxzQkFBTyxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsRUFBQzt5QkFDbkU7d0JBRUQscUZBQXFGO3dCQUNyRixxRkFBcUY7d0JBQ3JGLG9GQUFvRjt3QkFDcEYsc0ZBQXNGO3dCQUN0Rix5Q0FBeUM7d0JBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsZUFBZSxDQUFDLEVBQUU7NEJBQ2hGLHNCQUFPLGtCQUFrQixDQUFDLGtCQUFrQixFQUFFLEVBQUM7eUJBQ2hEO3dCQUVLLE1BQU0sR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQzFELHdCQUF3QixHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssa0JBQWtCLEVBQXhCLENBQXdCLENBQUMsQ0FBQzt3QkFNdEUscUJBQU0sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFdBQVcsRUFBRSx3QkFBd0IsQ0FBQyxFQUFBOzt3QkFBN0UsT0FBTyxHQUFHLFNBQW1FO3dCQUVuRiwwRkFBMEY7d0JBQzFGLHdGQUF3Rjt3QkFDeEYsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFOzRCQUNwQixzQkFBTyxPQUFPLEVBQUM7eUJBQ2hCO3dCQUVLLFlBQVksY0FDaEIsV0FBVyxFQUFFLFFBQVEsRUFDckIsWUFBWSxFQUFFLE1BQU0sSUFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQ3pCLENBQUM7NkJBRUUsdUJBQXVCLEVBQXZCLHdCQUF1Qjt3QkFDekIscUZBQXFGO3dCQUNyRiwwREFBMEQ7d0JBQzFELElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTs0QkFDdkIsc0JBQU8sa0JBQWtCLENBQUMsb0NBQW9DLEVBQUUsRUFBQzt5QkFDbEU7d0JBQ0QscUJBQU0sSUFBSSxDQUFDLHdCQUF3QixDQUFDLFdBQVcsRUFBRSxZQUFZLENBQUMsRUFBQTs7d0JBQTlELFNBQThELENBQUM7Ozs7d0JBUWhELHFCQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUE7O3dCQUF4RCxNQUFNLEdBQUcsU0FBK0M7d0JBRTlELGVBQWUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO3dCQUNoQyxTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7Ozs7d0JBRTVCLDhFQUE4RTt3QkFDOUUsZ0ZBQWdGO3dCQUNoRiw4RUFBOEU7d0JBQzlFLHdFQUF3RTt3QkFDeEUsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTs0QkFDeEMsc0JBQU8sa0JBQWtCLENBQUMsOEJBQThCLEVBQUUsRUFBQzt5QkFDNUQ7d0JBQ0QsTUFBTSxHQUFDLENBQUM7O3dCQUdWLCtFQUErRTt3QkFDL0Usd0RBQXdEO3dCQUN4RCxJQUFJLGVBQWUsS0FBSyxHQUFHLEVBQUU7NEJBQzNCLHNCQUFPLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBQzt5QkFDaEU7d0JBQ0QsSUFBSSxlQUFlLEtBQUssR0FBRyxFQUFFOzRCQUMzQixzQkFBTyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxFQUFDO3lCQUMvQzt3QkFFRCx3RUFBd0U7d0JBQ3hFLGtEQUFrRDt3QkFDbEQsSUFBSSxDQUFDLHdCQUF3QixDQUFDLE1BQU0sRUFBRTs0QkFDcEMsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQUVELGlGQUFpRjt3QkFDakYsb0ZBQW9GO3dCQUNwRixtQkFBbUI7d0JBQ25CLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQzt3QkFJekMsa0JBQWtCLEdBQUcsTUFBTSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDO3dCQUd0RCxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQ3ZELFNBQVMsU0FBSSxrQkFBa0IsVUFBSyxTQUFXLEVBQUUsd0JBQXdCLEVBQUU7Z0NBQzVFLDhFQUE4RTtnQ0FDOUUsK0VBQStFO2dDQUMvRSw0RUFBNEU7Z0NBQzVFLDRFQUE0RTtnQ0FDNUUscUJBQXFCLEVBQUUsSUFBSTs2QkFDNUIsQ0FBQyxFQUFBOzt3QkFQQSxjQUFjLEdBQUcsU0FPakI7d0JBRU4sbUZBQW1GO3dCQUNuRixxRkFBcUY7d0JBQ3JGLG1GQUFtRjt3QkFDbkYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFOzRCQUN6QixzQkFBTyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7eUJBQzFEO3dCQUVELElBQUksQ0FBQywwQkFBMEIsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO3dCQUMxRCxzQkFBTyxJQUFJLEVBQUM7Ozs7S0FDYjtJQUVEOzs7O09BSUc7SUFDVyx5REFBd0IsR0FBdEMsVUFBdUMsV0FBd0IsRUFBRSxZQUE4Qjs7Ozs7NEJBQ3ZFLHFCQUFNLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXLENBQUMsRUFBQTs7d0JBQXRFLGFBQWEsR0FBRyxTQUFzRDt3QkFDM0QscUJBQU0sTUFBTSxDQUFtQjtnQ0FDOUMsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsT0FBTyxFQUFFLGtDQUFrQztnQ0FDM0MsT0FBTyxFQUFFLGFBQWE7NkJBQ3ZCLENBQUMsRUFBQTs7d0JBTEssTUFBTSxHQUFJLENBQUEsU0FLZixDQUFBLE9BTFc7d0JBU1AsS0FBQSxPQUE0QixNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUEsRUFBaEUsUUFBUSxRQUFBLEVBQUssVUFBVSxjQUFBLENBQTBDO3dCQUV4RSx1RUFBdUU7d0JBQ3ZFLFlBQVksQ0FBQyxZQUFZLEdBQU0sUUFBUSxXQUFNLFdBQVcsQ0FBQyxRQUFRLE1BQUcsQ0FBQzt3QkFDckUsWUFBWSxDQUFDLGNBQWMsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7Ozs7O0tBQ3hFO0lBRUQ7Ozs7T0FJRztJQUNXLCtEQUE4QixHQUE1QyxVQUE2QyxXQUF3Qjs7Ozs7NEJBQ2xELHFCQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxXQUFXLENBQUMsRUFBQTs7d0JBQWhFLE9BQU8sR0FBRyxDQUFDLFNBQXFELENBQUM7NkJBQ2xELEdBQUcsQ0FBQyxVQUFBLE9BQU8sSUFBSSxPQUFBLENBQUMsRUFBQyxPQUFPLFNBQUEsRUFBRSxNQUFNLEVBQUUsa0JBQWtCLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxFQUFoRCxDQUFnRCxDQUFDO3dCQUMvRSxXQUFXLEdBQUcsS0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLHVCQUF5QixDQUFDO3dCQUNyRSxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFOzRCQUN2QixzQkFBTyxLQUFHLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQU0sRUFBQzt5QkFDbEQ7d0JBQ0ssY0FBYyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFLLENBQUMsQ0FBQyxPQUFTLEVBQWhCLENBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQzt3QkFDeEYsc0JBQU8sS0FBRyxXQUFXLEdBQUcsY0FBZ0IsRUFBQzs7OztLQUMxQztJQUVELCtEQUErRDtJQUNqRCw4REFBNkIsR0FBM0MsVUFBNEMsRUFBdUI7WUFBdEIsUUFBUSxjQUFBOzs7Ozs7d0JBQzdDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxLQUFLLHVCQUN4RCxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsUUFBUSxJQUFFLENBQUM7d0JBQ1YscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFBOzt3QkFBOUUsVUFBVSxHQUE2QixTQUF1Qzt3QkFDcEYsc0JBQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQVE7b0NBQVAsTUFBTSxZQUFBO2dDQUFNLE9BQUEsTUFBTSxDQUFDLE9BQU87NEJBQWQsQ0FBYyxDQUFDLEVBQUM7Ozs7S0FDckQ7SUFFRDs7O09BR0c7SUFDVyxrREFBaUIsR0FBL0IsVUFBZ0MsV0FBd0IsRUFBRSxjQUF3Qjs7OztnQkFFMUUsYUFBYSxHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDOUQsY0FBYyxHQUNoQixJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO2dCQUVyRixJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7b0JBQ3pCLHNCQUFPLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBQztpQkFDMUQ7Z0JBQ0Qsc0JBQU8sSUFBSSxFQUFDOzs7S0FDYjtJQUVELCtEQUErRDtJQUN2RCwrREFBOEIsR0FBdEMsVUFBdUMsRUFBcUI7WUFBcEIsTUFBTSxZQUFBO1FBQzVDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdkIsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUztvQkFBUixPQUFPLGFBQUE7Z0JBQU0sT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsY0FBYyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQztZQUE1QyxDQUE0QyxDQUFDLENBQUM7WUFDMUYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDN0I7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQWhNRCxDQUE0QyxhQUFhLEdBZ014RCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1B1bGxzTGlzdENvbW1pdHNSZXNwb25zZSwgUHVsbHNNZXJnZVBhcmFtc30gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlTWV0aG9kfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuLi9zdHJpbmctcGF0dGVybic7XG5cbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIEFQSSBtZXJnZSBzdHJhdGVneS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZyB7XG4gIC8qKiBEZWZhdWx0IG1ldGhvZCB1c2VkIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMgKi9cbiAgZGVmYXVsdDogR2l0aHViQXBpTWVyZ2VNZXRob2Q7XG4gIC8qKiBMYWJlbHMgd2hpY2ggc3BlY2lmeSBhIGRpZmZlcmVudCBtZXJnZSBtZXRob2QgdGhhbiB0aGUgZGVmYXVsdC4gKi9cbiAgbGFiZWxzPzoge3BhdHRlcm46IHN0cmluZywgbWV0aG9kOiBHaXRodWJBcGlNZXJnZU1ldGhvZH1bXTtcbn1cblxuLyoqIFNlcGFyYXRvciBiZXR3ZWVuIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBhbmQgYm9keS4gKi9cbmNvbnN0IENPTU1JVF9IRUFERVJfU0VQQVJBVE9SID0gJ1xcblxcbic7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBwcmltYXJpbHkgbGV2ZXJhZ2VzIHRoZSBHaXRodWIgQVBJLiBUaGUgc3RyYXRlZ3kgbWVyZ2VzIGEgZ2l2ZW5cbiAqIHB1bGwgcmVxdWVzdCBpbnRvIGEgdGFyZ2V0IGJyYW5jaCB1c2luZyB0aGUgQVBJLiBUaGlzIGVuc3VyZXMgdGhhdCBHaXRodWIgZGlzcGxheXNcbiAqIHRoZSBwdWxsIHJlcXVlc3QgYXMgbWVyZ2VkLiBUaGUgbWVyZ2VkIGNvbW1pdHMgYXJlIHRoZW4gY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSByZW1haW5pbmdcbiAqIHRhcmdldCBicmFuY2hlcyB1c2luZyB0aGUgbG9jYWwgR2l0IGluc3RhbmNlLiBUaGUgYmVuZWZpdCBpcyB0aGF0IHRoZSBHaXRodWIgbWVyZ2VkIHN0YXRlXG4gKiBpcyBwcm9wZXJseSBzZXQsIGJ1dCBhIG5vdGFibGUgZG93bnNpZGUgaXMgdGhhdCBQUnMgY2Fubm90IHVzZSBmaXh1cCBvciBzcXVhc2ggY29tbWl0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoZ2l0OiBHaXRDbGllbnQ8dHJ1ZT4sIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZXxudWxsPiB7XG4gICAgY29uc3Qge2dpdGh1YlRhcmdldEJyYW5jaCwgcHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9XG4gICAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KHQgPT4gdCAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNtYXRjaGluZ1RhcmdldEJyYW5jaCh0YXJnZXRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgYSByZXF1aXJlZCBiYXNlIGNvbW1pdCBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZlxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS5cbiAgICAvLyBUaGlzIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBlLmcuIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZSBvd25lcnNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5fZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyA9IHRhcmdldEJyYW5jaGVzLmZpbHRlcihiID0+IGIgIT09IGdpdGh1YlRhcmdldEJyYW5jaCk7XG5cbiAgICAvLyBGaXJzdCBjaGVycnktcGljayB0aGUgUFIgaW50byBhbGwgbG9jYWwgdGFyZ2V0IGJyYW5jaGVzIGluIGRyeS1ydW4gbW9kZS4gVGhpcyBpc1xuICAgIC8vIHB1cmVseSBmb3IgdGVzdGluZyBzbyB0aGF0IHdlIGNhbiBmaWd1cmUgb3V0IHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkXG4gICAgLy8gaW50byB0aGUgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLiBXZSBkb24ndCB3YW50IHRvIG1lcmdlIHRoZSBQUiB0aHJvdWdoIHRoZSBBUEksIGFuZFxuICAgIC8vIHRoZW4gcnVuIGludG8gY2hlcnJ5LXBpY2sgY29uZmxpY3RzIGFmdGVyIHRoZSBpbml0aWFsIG1lcmdlIGFscmVhZHkgY29tcGxldGVkLlxuICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCB0aGlzLl9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0LCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gSWYgdGhlIFBSIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8gYWxsIHRhcmdldCBicmFuY2hlcyBsb2NhbGx5LCB3ZSBrbm93IGl0IGNhbid0XG4gICAgLy8gYmUgZG9uZSB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGVpdGhlci4gV2UgYWJvcnQgbWVyZ2luZyBhbmQgcGFzcy10aHJvdWdoIHRoZSBmYWlsdXJlLlxuICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZU9wdGlvbnM6IFB1bGxzTWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jcmVzcG9uc2UtaWYtbWVyZ2UtY2Fubm90LWJlLXBlcmZvcm1lZFxuICAgIC8vIFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGR1ZSB0byBtZXJnZSBjb25mbGljdHMuXG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSA9PT0gNDA1KSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcbiAgICB9XG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVua25vd25NZXJnZUVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFBSIGRvZXMgIG5vdCBuZWVkIHRvIGJlIG1lcmdlZCBpbnRvIGFueSBvdGhlciB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gd2UgZXhpdCBoZXJlIGFzIHdlIGFscmVhZHkgY29tcGxldGVkIHRoZSBtZXJnZS5cbiAgICBpZiAoIWNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggdGhlIHRhcmdldCBicmFuY2ggdGhlIFBSIGhhcyBiZWVuIG1lcmdlZCBpbnRvIHRocm91Z2ggdGhlIEFQSS4gV2UgbmVlZFxuICAgIC8vIHRvIHJlLWZldGNoIGFzIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2hlcnJ5LXBpY2sgdGhlIG5ldyBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIHRhcmdldCBicmFuY2hlcy5cbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuXG4gICAgLy8gTnVtYmVyIG9mIGNvbW1pdHMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgdGFyZ2V0IGJyYW5jaC4gVGhpcyBjb3VsZCB2YXJ5IGZyb21cbiAgICAvLyB0aGUgY291bnQgb2YgY29tbWl0cyBpbiB0aGUgUFIgZHVlIHRvIHNxdWFzaGluZy5cbiAgICBjb25zdCB0YXJnZXRDb21taXRzQ291bnQgPSBtZXRob2QgPT09ICdzcXVhc2gnID8gMSA6IHB1bGxSZXF1ZXN0LmNvbW1pdENvdW50O1xuXG4gICAgLy8gQ2hlcnJ5IHBpY2sgdGhlIG1lcmdlZCBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMoXG4gICAgICAgIGAke3RhcmdldFNoYX1+JHt0YXJnZXRDb21taXRzQ291bnR9Li4ke3RhcmdldFNoYX1gLCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMsIHtcbiAgICAgICAgICAvLyBDb21taXRzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhlIEdpdGh1YiBBUEkgZG8gbm90IG5lY2Vzc2FyaWx5IGNvbnRhaW5cbiAgICAgICAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgc291cmNlIHB1bGwgcmVxdWVzdCAodW5sZXNzIHRoZSBzcXVhc2ggc3RyYXRlZ3kgaXMgdXNlZCkuXG4gICAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgb3JpZ2luYWwgY29tbWl0cyBjYW4gYmUgZm91bmQgd2hlbiBhIGNvbW1pdCBpcyB2aWV3ZWQgaW4gYVxuICAgICAgICAgIC8vIHRhcmdldCBicmFuY2gsIHdlIGFkZCBhIGxpbmsgdG8gdGhlIG9yaWdpbmFsIGNvbW1pdHMgd2hlbiBjaGVycnktcGlja2luZy5cbiAgICAgICAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgLy8gV2UgYWxyZWFkeSBjaGVja2VkIHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyBidXQgaW4gY2FzZSB0aGUgY2hlcnJ5LXBpY2sgc29tZWhvdyBmYWlscywgd2Ugc3RpbGwgaGFuZGxlIHRoZSBjb25mbGljdHMgaGVyZS4gVGhlXG4gICAgLy8gY29tbWl0cyBjcmVhdGVkIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgY291bGQgYmUgZGlmZmVyZW50IChpLmUuIHRocm91Z2ggc3F1YXNoKS5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgdGhlIGNvbW1pdCBtZXNzYWdlIGNoYW5nZXMuIFVubGlrZSBhcyBpbiB0aGUgYXV0b3NxdWFzaCBtZXJnZVxuICAgKiBzdHJhdGVneSwgd2UgY2Fubm90IHN0YXJ0IGFuIGludGVyYWN0aXZlIHJlYmFzZSBiZWNhdXNlIHdlIG1lcmdlIHVzaW5nIHRoZSBHaXRodWIgQVBJLlxuICAgKiBUaGUgR2l0aHViIEFQSSBvbmx5IGFsbG93cyBtb2RpZmljYXRpb25zIHRvIFBSIHRpdGxlIGFuZCBib2R5IGZvciBzcXVhc2ggbWVyZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnM6IFB1bGxzTWVyZ2VQYXJhbXMpIHtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHtcbiAgICAgIHR5cGU6ICdlZGl0b3InLFxuICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHVwZGF0ZSB0aGUgY29tbWl0IG1lc3NhZ2UnLFxuICAgICAgZGVmYXVsdDogY29tbWl0TWVzc2FnZSxcbiAgICB9KTtcblxuICAgIC8vIFNwbGl0IHRoZSBuZXcgbWVzc2FnZSBpbnRvIHRpdGxlIGFuZCBtZXNzYWdlLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIEdpdGh1YiBBUEkgZXhwZWN0cyB0aXRsZSBhbmQgbWVzc2FnZSB0byBiZSBwYXNzZWQgc2VwYXJhdGVseS5cbiAgICBjb25zdCBbbmV3VGl0bGUsIC4uLm5ld01lc3NhZ2VdID0gcmVzdWx0LnNwbGl0KENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgbWVyZ2Ugb3B0aW9ucyBzbyB0aGF0IHRoZSBjaGFuZ2VzIGFyZSByZWZsZWN0ZWQgaW4gdGhlcmUuXG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF90aXRsZSA9IGAke25ld1RpdGxlfSAoIyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9KWA7XG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF9tZXNzYWdlID0gbmV3TWVzc2FnZS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIEdpdGh1YiBieSBkZWZhdWx0IGNvbmNhdGVuYXRlc1xuICAgKiBtdWx0aXBsZSBjb21taXQgbWVzc2FnZXMgaWYgYSBQUiBpcyBtZXJnZWQgaW4gc3F1YXNoIG1vZGUuIFdlIHRyeSB0byByZXBsaWNhdGUgdGhpc1xuICAgKiBiZWhhdmlvciBoZXJlIHNvIHRoYXQgd2UgaGF2ZSBhIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdGhhdCBjYW4gYmUgZml4ZWQgdXAuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGNvbW1pdHMgPSAoYXdhaXQgdGhpcy5fZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyhwdWxsUmVxdWVzdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKG1lc3NhZ2UgPT4gKHttZXNzYWdlLCBwYXJzZWQ6IHBhcnNlQ29tbWl0TWVzc2FnZShtZXNzYWdlKX0pKTtcbiAgICBjb25zdCBtZXNzYWdlQmFzZSA9IGAke3B1bGxSZXF1ZXN0LnRpdGxlfSR7Q09NTUlUX0hFQURFUl9TRVBBUkFUT1J9YDtcbiAgICBpZiAoY29tbWl0cy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7Y29tbWl0c1swXS5wYXJzZWQuYm9keX1gO1xuICAgIH1cbiAgICBjb25zdCBqb2luZWRNZXNzYWdlcyA9IGNvbW1pdHMubWFwKGMgPT4gYCogJHtjLm1lc3NhZ2V9YCkuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7am9pbmVkTWVzc2FnZXN9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBjb21taXQgbWVzc2FnZXMgb2YgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHtwck51bWJlcn06IFB1bGxSZXF1ZXN0KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5saXN0Q29tbWl0cy5lbmRwb2ludC5tZXJnZShcbiAgICAgICAgey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSk7XG4gICAgY29uc3QgYWxsQ29tbWl0czogUHVsbHNMaXN0Q29tbWl0c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnBhZ2luYXRlKHJlcXVlc3QpO1xuICAgIHJldHVybiBhbGxDb21taXRzLm1hcCgoe2NvbW1pdH0pID0+IGNvbW1pdC5tZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgZ2l2ZW4gcHVsbCByZXF1ZXN0IGNvdWxkIGJlIG1lcmdlZCBpbnRvIGl0cyB0YXJnZXQgYnJhbmNoZXMuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaWYgaXQgdGhlIFBSIGNvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdKTpcbiAgICAgIFByb21pc2U8bnVsbHxQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gdGhpcy5nZXRQdWxsUmVxdWVzdFJldmlzaW9uUmFuZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID1cbiAgICAgICAgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzLCB7ZHJ5UnVuOiB0cnVlfSk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgbWVyZ2UgYWN0aW9uIGZyb20gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3Qoe2xhYmVsc306IFB1bGxSZXF1ZXN0KTogR2l0aHViQXBpTWVyZ2VNZXRob2Qge1xuICAgIGlmICh0aGlzLl9jb25maWcubGFiZWxzKSB7XG4gICAgICBjb25zdCBtYXRjaGluZ0xhYmVsID1cbiAgICAgICAgICB0aGlzLl9jb25maWcubGFiZWxzLmZpbmQoKHtwYXR0ZXJufSkgPT4gbGFiZWxzLnNvbWUobCA9PiBtYXRjaGVzUGF0dGVybihsLCBwYXR0ZXJuKSkpO1xuICAgICAgaWYgKG1hdGNoaW5nTGFiZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hpbmdMYWJlbC5tZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb25maWcuZGVmYXVsdDtcbiAgfVxufVxuIl19