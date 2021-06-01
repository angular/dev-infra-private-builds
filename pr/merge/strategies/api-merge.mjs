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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBR2pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUUvQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFakQsT0FBTyxFQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQVU5RCx3REFBd0Q7QUFDeEQsSUFBTSx1QkFBdUIsR0FBRyxNQUFNLENBQUM7QUFFdkM7Ozs7OztHQU1HO0FBQ0g7SUFBNEMsMENBQWE7SUFDdkQsZ0NBQVksR0FBb0IsRUFBVSxPQUFxQztRQUEvRSxZQUNFLGtCQUFNLEdBQUcsQ0FBQyxTQUNYO1FBRnlDLGFBQU8sR0FBUCxPQUFPLENBQThCOztJQUUvRSxDQUFDO0lBRUssc0NBQUssR0FBWCxVQUFZLFdBQXdCOzs7Ozs7d0JBQzNCLGtCQUFrQixHQUNyQixXQUFXLG1CQURVLEVBQUUsUUFBUSxHQUMvQixXQUFXLFNBRG9CLEVBQUUsY0FBYyxHQUMvQyxXQUFXLGVBRG9DLEVBQUUsZUFBZSxHQUNoRSxXQUFXLGdCQURxRCxFQUFFLHVCQUF1QixHQUN6RixXQUFXLHdCQUQ4RSxDQUM3RTt3QkFDaEIsaUZBQWlGO3dCQUNqRix5Q0FBeUM7d0JBQ3pDLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxrQkFBa0IsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFFOzRCQUN2RCxzQkFBTyxrQkFBa0IsQ0FBQyx1QkFB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R0FpTXhEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlTWV0aG9kfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuLi9zdHJpbmctcGF0dGVybic7XG5cbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIEFQSSBtZXJnZSBzdHJhdGVneS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZyB7XG4gIC8qKiBEZWZhdWx0IG1ldGhvZCB1c2VkIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMgKi9cbiAgZGVmYXVsdDogR2l0aHViQXBpTWVyZ2VNZXRob2Q7XG4gIC8qKiBMYWJlbHMgd2hpY2ggc3BlY2lmeSBhIGRpZmZlcmVudCBtZXJnZSBtZXRob2QgdGhhbiB0aGUgZGVmYXVsdC4gKi9cbiAgbGFiZWxzPzoge3BhdHRlcm46IHN0cmluZywgbWV0aG9kOiBHaXRodWJBcGlNZXJnZU1ldGhvZH1bXTtcbn1cblxuLyoqIFNlcGFyYXRvciBiZXR3ZWVuIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBhbmQgYm9keS4gKi9cbmNvbnN0IENPTU1JVF9IRUFERVJfU0VQQVJBVE9SID0gJ1xcblxcbic7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBwcmltYXJpbHkgbGV2ZXJhZ2VzIHRoZSBHaXRodWIgQVBJLiBUaGUgc3RyYXRlZ3kgbWVyZ2VzIGEgZ2l2ZW5cbiAqIHB1bGwgcmVxdWVzdCBpbnRvIGEgdGFyZ2V0IGJyYW5jaCB1c2luZyB0aGUgQVBJLiBUaGlzIGVuc3VyZXMgdGhhdCBHaXRodWIgZGlzcGxheXNcbiAqIHRoZSBwdWxsIHJlcXVlc3QgYXMgbWVyZ2VkLiBUaGUgbWVyZ2VkIGNvbW1pdHMgYXJlIHRoZW4gY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSByZW1haW5pbmdcbiAqIHRhcmdldCBicmFuY2hlcyB1c2luZyB0aGUgbG9jYWwgR2l0IGluc3RhbmNlLiBUaGUgYmVuZWZpdCBpcyB0aGF0IHRoZSBHaXRodWIgbWVyZ2VkIHN0YXRlXG4gKiBpcyBwcm9wZXJseSBzZXQsIGJ1dCBhIG5vdGFibGUgZG93bnNpZGUgaXMgdGhhdCBQUnMgY2Fubm90IHVzZSBmaXh1cCBvciBzcXVhc2ggY29tbWl0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoZ2l0OiBHaXRDbGllbnQ8dHJ1ZT4sIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZXxudWxsPiB7XG4gICAgY29uc3Qge2dpdGh1YlRhcmdldEJyYW5jaCwgcHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9XG4gICAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KHQgPT4gdCAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNtYXRjaGluZ1RhcmdldEJyYW5jaCh0YXJnZXRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgYSByZXF1aXJlZCBiYXNlIGNvbW1pdCBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZlxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS5cbiAgICAvLyBUaGlzIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBlLmcuIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZSBvd25lcnNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5fZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyA9IHRhcmdldEJyYW5jaGVzLmZpbHRlcihiID0+IGIgIT09IGdpdGh1YlRhcmdldEJyYW5jaCk7XG5cbiAgICAvLyBGaXJzdCBjaGVycnktcGljayB0aGUgUFIgaW50byBhbGwgbG9jYWwgdGFyZ2V0IGJyYW5jaGVzIGluIGRyeS1ydW4gbW9kZS4gVGhpcyBpc1xuICAgIC8vIHB1cmVseSBmb3IgdGVzdGluZyBzbyB0aGF0IHdlIGNhbiBmaWd1cmUgb3V0IHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkXG4gICAgLy8gaW50byB0aGUgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLiBXZSBkb24ndCB3YW50IHRvIG1lcmdlIHRoZSBQUiB0aHJvdWdoIHRoZSBBUEksIGFuZFxuICAgIC8vIHRoZW4gcnVuIGludG8gY2hlcnJ5LXBpY2sgY29uZmxpY3RzIGFmdGVyIHRoZSBpbml0aWFsIG1lcmdlIGFscmVhZHkgY29tcGxldGVkLlxuICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCB0aGlzLl9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0LCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gSWYgdGhlIFBSIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8gYWxsIHRhcmdldCBicmFuY2hlcyBsb2NhbGx5LCB3ZSBrbm93IGl0IGNhbid0XG4gICAgLy8gYmUgZG9uZSB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGVpdGhlci4gV2UgYWJvcnQgbWVyZ2luZyBhbmQgcGFzcy10aHJvdWdoIHRoZSBmYWlsdXJlLlxuICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZU9wdGlvbnM6IE9jdG9raXQuUHVsbHNNZXJnZVBhcmFtcyA9IHtcbiAgICAgIHB1bGxfbnVtYmVyOiBwck51bWJlcixcbiAgICAgIG1lcmdlX21ldGhvZDogbWV0aG9kLFxuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgIH07XG5cbiAgICBpZiAobmVlZHNDb21taXRNZXNzYWdlRml4dXApIHtcbiAgICAgIC8vIENvbW1pdCBtZXNzYWdlIGZpeHVwIGRvZXMgbm90IHdvcmsgd2l0aCBvdGhlciBtZXJnZSBtZXRob2RzIGFzIHRoZSBHaXRodWIgQVBJIG9ubHlcbiAgICAgIC8vIGFsbG93cyBjb21taXQgbWVzc2FnZSBtb2RpZmljYXRpb25zIGZvciBzcXVhc2ggbWVyZ2luZy5cbiAgICAgIGlmIChtZXRob2QgIT09ICdzcXVhc2gnKSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5hYmxlVG9GaXh1cENvbW1pdE1lc3NhZ2VTcXVhc2hPbmx5KCk7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLl9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChwdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zKTtcbiAgICB9XG5cbiAgICBsZXQgbWVyZ2VTdGF0dXNDb2RlOiBudW1iZXI7XG4gICAgbGV0IHRhcmdldFNoYTogc3RyaW5nO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIE1lcmdlIHRoZSBwdWxsIHJlcXVlc3QgdXNpbmcgdGhlIEdpdGh1YiBBUEkgaW50byB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMubWVyZ2UobWVyZ2VPcHRpb25zKTtcblxuICAgICAgbWVyZ2VTdGF0dXNDb2RlID0gcmVzdWx0LnN0YXR1cztcbiAgICAgIHRhcmdldFNoYSA9IHJlc3VsdC5kYXRhLnNoYTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBOb3RlOiBHaXRodWIgdXN1YWxseSByZXR1cm5zIGA0MDRgIGFzIHN0YXR1cyBjb2RlIGlmIHRoZSBBUEkgcmVxdWVzdCB1c2VzIGFcbiAgICAgIC8vIHRva2VuIHdpdGggaW5zdWZmaWNpZW50IHBlcm1pc3Npb25zLiBHaXRodWIgZG9lcyB0aGlzIGJlY2F1c2UgaXQgZG9lc24ndCB3YW50XG4gICAgICAvLyB0byBsZWFrIHdoZXRoZXIgYSByZXBvc2l0b3J5IGV4aXN0cyBvciBub3QuIEluIG91ciBjYXNlIHdlIGV4cGVjdCBhIGNlcnRhaW5cbiAgICAgIC8vIHJlcG9zaXRvcnkgdG8gZXhpc3QsIHNvIHdlIGFsd2F5cyB0cmVhdCB0aGlzIGFzIGEgcGVybWlzc2lvbiBmYWlsdXJlLlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDMgfHwgZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZSgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyNyZXNwb25zZS1pZi1tZXJnZS1jYW5ub3QtYmUtcGVyZm9ybWVkXG4gICAgLy8gUHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBtZXJnZWQgZHVlIHRvIG1lcmdlIGNvbmZsaWN0cy5cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlID09PSA0MDUpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuICAgIH1cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5rbm93bk1lcmdlRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgUFIgZG9lcyAgbm90IG5lZWQgdG8gYmUgbWVyZ2VkIGludG8gYW55IG90aGVyIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyB3ZSBleGl0IGhlcmUgYXMgd2UgYWxyZWFkeSBjb21wbGV0ZWQgdGhlIG1lcmdlLlxuICAgIGlmICghY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCB0aGUgdGFyZ2V0IGJyYW5jaCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkIGludG8gdGhyb3VnaCB0aGUgQVBJLiBXZSBuZWVkXG4gICAgLy8gdG8gcmUtZmV0Y2ggYXMgb3RoZXJ3aXNlIHdlIGNhbm5vdCBjaGVycnktcGljayB0aGUgbmV3IGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nXG4gICAgLy8gdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHRoaXMuZmV0Y2hUYXJnZXRCcmFuY2hlcyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG5cbiAgICAvLyBOdW1iZXIgb2YgY29tbWl0cyB0aGF0IGhhdmUgbGFuZGVkIGluIHRoZSB0YXJnZXQgYnJhbmNoLiBUaGlzIGNvdWxkIHZhcnkgZnJvbVxuICAgIC8vIHRoZSBjb3VudCBvZiBjb21taXRzIGluIHRoZSBQUiBkdWUgdG8gc3F1YXNoaW5nLlxuICAgIGNvbnN0IHRhcmdldENvbW1pdHNDb3VudCA9IG1ldGhvZCA9PT0gJ3NxdWFzaCcgPyAxIDogcHVsbFJlcXVlc3QuY29tbWl0Q291bnQ7XG5cbiAgICAvLyBDaGVycnkgcGljayB0aGUgbWVyZ2VkIGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nIHRhcmdldCBicmFuY2hlcy5cbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IGF3YWl0IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhcbiAgICAgICAgYCR7dGFyZ2V0U2hhfX4ke3RhcmdldENvbW1pdHNDb3VudH0uLiR7dGFyZ2V0U2hhfWAsIGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcywge1xuICAgICAgICAgIC8vIENvbW1pdHMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGUgR2l0aHViIEFQSSBkbyBub3QgbmVjZXNzYXJpbHkgY29udGFpblxuICAgICAgICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSBzb3VyY2UgcHVsbCByZXF1ZXN0ICh1bmxlc3MgdGhlIHNxdWFzaCBzdHJhdGVneSBpcyB1c2VkKS5cbiAgICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBvcmlnaW5hbCBjb21taXRzIGNhbiBiZSBmb3VuZCB3aGVuIGEgY29tbWl0IGlzIHZpZXdlZCBpbiBhXG4gICAgICAgICAgLy8gdGFyZ2V0IGJyYW5jaCwgd2UgYWRkIGEgbGluayB0byB0aGUgb3JpZ2luYWwgY29tbWl0cyB3aGVuIGNoZXJyeS1waWNraW5nLlxuICAgICAgICAgIGxpbmtUb09yaWdpbmFsQ29tbWl0czogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAvLyBXZSBhbHJlYWR5IGNoZWNrZWQgd2hldGhlciB0aGUgUFIgY2FuIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIGJ1dCBpbiBjYXNlIHRoZSBjaGVycnktcGljayBzb21laG93IGZhaWxzLCB3ZSBzdGlsbCBoYW5kbGUgdGhlIGNvbmZsaWN0cyBoZXJlLiBUaGVcbiAgICAvLyBjb21taXRzIGNyZWF0ZWQgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBjb3VsZCBiZSBkaWZmZXJlbnQgKGkuZS4gdGhyb3VnaCBzcXVhc2gpLlxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0oY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UgY2hhbmdlcy4gVW5saWtlIGFzIGluIHRoZSBhdXRvc3F1YXNoIG1lcmdlXG4gICAqIHN0cmF0ZWd5LCB3ZSBjYW5ub3Qgc3RhcnQgYW4gaW50ZXJhY3RpdmUgcmViYXNlIGJlY2F1c2Ugd2UgbWVyZ2UgdXNpbmcgdGhlIEdpdGh1YiBBUEkuXG4gICAqIFRoZSBHaXRodWIgQVBJIG9ubHkgYWxsb3dzIG1vZGlmaWNhdGlvbnMgdG8gUFIgdGl0bGUgYW5kIGJvZHkgZm9yIHNxdWFzaCBtZXJnZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChcbiAgICAgIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zOiBPY3Rva2l0LlB1bGxzTWVyZ2VQYXJhbXMpIHtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHtcbiAgICAgIHR5cGU6ICdlZGl0b3InLFxuICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHVwZGF0ZSB0aGUgY29tbWl0IG1lc3NhZ2UnLFxuICAgICAgZGVmYXVsdDogY29tbWl0TWVzc2FnZSxcbiAgICB9KTtcblxuICAgIC8vIFNwbGl0IHRoZSBuZXcgbWVzc2FnZSBpbnRvIHRpdGxlIGFuZCBtZXNzYWdlLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIEdpdGh1YiBBUEkgZXhwZWN0cyB0aXRsZSBhbmQgbWVzc2FnZSB0byBiZSBwYXNzZWQgc2VwYXJhdGVseS5cbiAgICBjb25zdCBbbmV3VGl0bGUsIC4uLm5ld01lc3NhZ2VdID0gcmVzdWx0LnNwbGl0KENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgbWVyZ2Ugb3B0aW9ucyBzbyB0aGF0IHRoZSBjaGFuZ2VzIGFyZSByZWZsZWN0ZWQgaW4gdGhlcmUuXG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF90aXRsZSA9IGAke25ld1RpdGxlfSAoIyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9KWA7XG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF9tZXNzYWdlID0gbmV3TWVzc2FnZS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIEdpdGh1YiBieSBkZWZhdWx0IGNvbmNhdGVuYXRlc1xuICAgKiBtdWx0aXBsZSBjb21taXQgbWVzc2FnZXMgaWYgYSBQUiBpcyBtZXJnZWQgaW4gc3F1YXNoIG1vZGUuIFdlIHRyeSB0byByZXBsaWNhdGUgdGhpc1xuICAgKiBiZWhhdmlvciBoZXJlIHNvIHRoYXQgd2UgaGF2ZSBhIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdGhhdCBjYW4gYmUgZml4ZWQgdXAuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGNvbW1pdHMgPSAoYXdhaXQgdGhpcy5fZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyhwdWxsUmVxdWVzdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKG1lc3NhZ2UgPT4gKHttZXNzYWdlLCBwYXJzZWQ6IHBhcnNlQ29tbWl0TWVzc2FnZShtZXNzYWdlKX0pKTtcbiAgICBjb25zdCBtZXNzYWdlQmFzZSA9IGAke3B1bGxSZXF1ZXN0LnRpdGxlfSR7Q09NTUlUX0hFQURFUl9TRVBBUkFUT1J9YDtcbiAgICBpZiAoY29tbWl0cy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7Y29tbWl0c1swXS5wYXJzZWQuYm9keX1gO1xuICAgIH1cbiAgICBjb25zdCBqb2luZWRNZXNzYWdlcyA9IGNvbW1pdHMubWFwKGMgPT4gYCogJHtjLm1lc3NhZ2V9YCkuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7am9pbmVkTWVzc2FnZXN9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBjb21taXQgbWVzc2FnZXMgb2YgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHtwck51bWJlcn06IFB1bGxSZXF1ZXN0KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5saXN0Q29tbWl0cy5lbmRwb2ludC5tZXJnZShcbiAgICAgICAgey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSk7XG4gICAgY29uc3QgYWxsQ29tbWl0czogT2N0b2tpdC5QdWxsc0xpc3RDb21taXRzUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucGFnaW5hdGUocmVxdWVzdCk7XG4gICAgcmV0dXJuIGFsbENvbW1pdHMubWFwKCh7Y29tbWl0fSkgPT4gY29tbWl0Lm1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBnaXZlbiBwdWxsIHJlcXVlc3QgY291bGQgYmUgbWVyZ2VkIGludG8gaXRzIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpZiBpdCB0aGUgUFIgY291bGQgbm90IGJlIG1lcmdlZC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NoZWNrTWVyZ2FiaWxpdHkocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LCB0YXJnZXRCcmFuY2hlczogc3RyaW5nW10pOlxuICAgICAgUHJvbWlzZTxudWxsfFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSB0aGlzLmdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPVxuICAgICAgICB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMsIHtkcnlSdW46IHRydWV9KTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHRoZSBtZXJnZSBhY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIF9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdCh7bGFiZWxzfTogUHVsbFJlcXVlc3QpOiBHaXRodWJBcGlNZXJnZU1ldGhvZCB7XG4gICAgaWYgKHRoaXMuX2NvbmZpZy5sYWJlbHMpIHtcbiAgICAgIGNvbnN0IG1hdGNoaW5nTGFiZWwgPVxuICAgICAgICAgIHRoaXMuX2NvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PiBsYWJlbHMuc29tZShsID0+IG1hdGNoZXNQYXR0ZXJuKGwsIHBhdHRlcm4pKSk7XG4gICAgICBpZiAobWF0Y2hpbmdMYWJlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGluZ0xhYmVsLm1ldGhvZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5kZWZhdWx0O1xuICB9XG59XG4iXX0=