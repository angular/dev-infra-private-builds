/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge/strategies/api-merge", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/commit-message/validate", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/string-pattern", "@angular/dev-infra-private/pr/merge/strategies/strategy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubApiMergeStrategy = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    var strategy_1 = require("@angular/dev-infra-private/pr/merge/strategies/strategy");
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
        tslib_1.__extends(GithubApiMergeStrategy, _super);
        function GithubApiMergeStrategy(git, _config) {
            var _this = _super.call(this, git) || this;
            _this._config = _config;
            return _this;
        }
        GithubApiMergeStrategy.prototype.merge = function (pullRequest) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var githubTargetBranch, prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, method, cherryPickTargetBranches, failure, mergeOptions, mergeStatusCode, targetSha, result, e_1, targetCommitsCount, failedBranches;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            githubTargetBranch = pullRequest.githubTargetBranch, prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup;
                            // If the pull request does not have its base branch set to any determined target
                            // branch, we cannot merge using the API.
                            if (targetBranches.every(function (t) { return t !== githubTargetBranch; })) {
                                return [2 /*return*/, failures_1.PullRequestFailure.mismatchingTargetBranch(targetBranches)];
                            }
                            // In cases where a required base commit is specified for this pull request, check if
                            // the pull request contains the given commit. If not, return a pull request failure.
                            // This check is useful for enforcing that PRs are rebased on top of a given commit.
                            // e.g. a commit that changes the code ownership validation. PRs which are not rebased
                            // could bypass new codeowner ship rules.
                            if (requiredBaseSha && !this.git.hasCommit(strategy_1.TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                                return [2 /*return*/, failures_1.PullRequestFailure.unsatisfiedBaseSha()];
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
                            mergeOptions = tslib_1.__assign({ pull_number: prNumber, merge_method: method }, this.git.remoteParams);
                            if (!needsCommitMessageFixup) return [3 /*break*/, 3];
                            // Commit message fixup does not work with other merge methods as the Github API only
                            // allows commit message modifications for squash merging.
                            if (method !== 'squash') {
                                return [2 /*return*/, failures_1.PullRequestFailure.unableToFixupCommitMessageSquashOnly()];
                            }
                            return [4 /*yield*/, this._promptCommitMessageEdit(pullRequest, mergeOptions)];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, this.git.api.pulls.merge(mergeOptions)];
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
                                return [2 /*return*/, failures_1.PullRequestFailure.insufficientPermissionsToMerge()];
                            }
                            throw e_1;
                        case 6:
                            // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
                            // Pull request cannot be merged due to merge conflicts.
                            if (mergeStatusCode === 405) {
                                return [2 /*return*/, failures_1.PullRequestFailure.mergeConflicts([githubTargetBranch])];
                            }
                            if (mergeStatusCode !== 200) {
                                return [2 /*return*/, failures_1.PullRequestFailure.unknownMergeError()];
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
                            return [4 /*yield*/, this.cherryPickIntoTargetBranches(targetSha + "~" + targetCommitsCount + ".." + targetSha, cherryPickTargetBranches)];
                        case 7:
                            failedBranches = _a.sent();
                            // We already checked whether the PR can be cherry-picked into the target branches,
                            // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
                            // commits created through the Github API could be different (i.e. through squash).
                            if (failedBranches.length) {
                                return [2 /*return*/, failures_1.PullRequestFailure.mergeConflicts(failedBranches)];
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commitMessage, result, _a, newTitle, newMessage;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._getDefaultSquashCommitMessage(pullRequest)];
                        case 1:
                            commitMessage = _b.sent();
                            return [4 /*yield*/, inquirer_1.prompt({
                                    type: 'editor',
                                    name: 'result',
                                    message: 'Please update the commit message',
                                    default: commitMessage,
                                })];
                        case 2:
                            result = (_b.sent()).result;
                            _a = tslib_1.__read(result.split(COMMIT_HEADER_SEPARATOR)), newTitle = _a[0], newMessage = _a.slice(1);
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commits, messageBase, joinedMessages;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getPullRequestCommitMessages(pullRequest)];
                        case 1:
                            commits = (_a.sent())
                                .map(function (message) { return ({ message: message, parsed: validate_1.parseCommitMessage(message) }); });
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var request, allCommits;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            request = this.git.api.pulls.listCommits.endpoint.merge(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { pull_number: prNumber }));
                            return [4 /*yield*/, this.git.api.paginate(request)];
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var revisionRange, failedBranches;
                return tslib_1.__generator(this, function (_a) {
                    revisionRange = this.getPullRequestRevisionRange(pullRequest);
                    failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, { dryRun: true });
                    if (failedBranches.length) {
                        return [2 /*return*/, failures_1.PullRequestFailure.mergeConflicts(failedBranches)];
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
                    return labels.some(function (l) { return string_pattern_1.matchesPattern(l, pattern); });
                });
                if (matchingLabel !== undefined) {
                    return matchingLabel.method;
                }
            }
            return this._config.default;
        };
        return GithubApiMergeStrategy;
    }(strategy_1.MergeStrategy));
    exports.GithubApiMergeStrategy = GithubApiMergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxxQ0FBZ0M7SUFFaEMsK0VBQW9FO0lBRXBFLHlFQUErQztJQUcvQyxxRkFBaUQ7SUFFakQsb0ZBQThEO0lBVTlELHdEQUF3RDtJQUN4RCxJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztJQUV2Qzs7Ozs7O09BTUc7SUFDSDtRQUE0QyxrREFBYTtRQUN2RCxnQ0FBWSxHQUFjLEVBQVUsT0FBcUM7WUFBekUsWUFDRSxrQkFBTSxHQUFHLENBQUMsU0FDWDtZQUZtQyxhQUFPLEdBQVAsT0FBTyxDQUE4Qjs7UUFFekUsQ0FBQztRQUVLLHNDQUFLLEdBQVgsVUFBWSxXQUF3Qjs7Ozs7OzRCQUMzQixrQkFBa0IsR0FDckIsV0FBVyxtQkFEVSxFQUFFLFFBQVEsR0FDL0IsV0FBVyxTQURvQixFQUFFLGNBQWMsR0FDL0MsV0FBVyxlQURvQyxFQUFFLGVBQWUsR0FDaEUsV0FBVyxnQkFEcUQsRUFBRSx1QkFBdUIsR0FDekYsV0FBVyx3QkFEOEUsQ0FDN0U7NEJBQ2hCLGlGQUFpRjs0QkFDakYseUNBQXlDOzRCQUN6QyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssa0JBQWtCLEVBQXhCLENBQXdCLENBQUMsRUFBRTtnQ0FDdkQsc0JBQU8sNkJBQWtCLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLEVBQUM7NkJBQ25FOzRCQUVELHFGQUFxRjs0QkFDckYscUZBQXFGOzRCQUNyRixvRkFBb0Y7NEJBQ3BGLHNGQUFzRjs0QkFDdEYseUNBQXlDOzRCQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FB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SUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFFckYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQzFEO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRCwrREFBK0Q7UUFDdkQsK0RBQThCLEdBQXRDLFVBQXVDLEVBQXFCO2dCQUFwQixNQUFNLFlBQUE7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUzt3QkFBUixPQUFPLGFBQUE7b0JBQU0sT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUM7Z0JBQTVDLENBQTRDLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7aUJBQzdCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUExTEQsQ0FBNEMsd0JBQWEsR0EwTHhEO0lBMUxZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1B1bGxzTGlzdENvbW1pdHNSZXNwb25zZSwgUHVsbHNNZXJnZVBhcmFtc30gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vZ2l0JztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuLi9zdHJpbmctcGF0dGVybic7XG5cbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIEFQSSBtZXJnZSBzdHJhdGVneS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZyB7XG4gIC8qKiBEZWZhdWx0IG1ldGhvZCB1c2VkIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMgKi9cbiAgZGVmYXVsdDogR2l0aHViQXBpTWVyZ2VNZXRob2Q7XG4gIC8qKiBMYWJlbHMgd2hpY2ggc3BlY2lmeSBhIGRpZmZlcmVudCBtZXJnZSBtZXRob2QgdGhhbiB0aGUgZGVmYXVsdC4gKi9cbiAgbGFiZWxzPzoge3BhdHRlcm46IHN0cmluZywgbWV0aG9kOiBHaXRodWJBcGlNZXJnZU1ldGhvZH1bXTtcbn1cblxuLyoqIFNlcGFyYXRvciBiZXR3ZWVuIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBhbmQgYm9keS4gKi9cbmNvbnN0IENPTU1JVF9IRUFERVJfU0VQQVJBVE9SID0gJ1xcblxcbic7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBwcmltYXJpbHkgbGV2ZXJhZ2VzIHRoZSBHaXRodWIgQVBJLiBUaGUgc3RyYXRlZ3kgbWVyZ2VzIGEgZ2l2ZW5cbiAqIHB1bGwgcmVxdWVzdCBpbnRvIGEgdGFyZ2V0IGJyYW5jaCB1c2luZyB0aGUgQVBJLiBUaGlzIGVuc3VyZXMgdGhhdCBHaXRodWIgZGlzcGxheXNcbiAqIHRoZSBwdWxsIHJlcXVlc3QgYXMgbWVyZ2VkLiBUaGUgbWVyZ2VkIGNvbW1pdHMgYXJlIHRoZW4gY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSByZW1haW5pbmdcbiAqIHRhcmdldCBicmFuY2hlcyB1c2luZyB0aGUgbG9jYWwgR2l0IGluc3RhbmNlLiBUaGUgYmVuZWZpdCBpcyB0aGF0IHRoZSBHaXRodWIgbWVyZ2VkIHN0YXRlXG4gKiBpcyBwcm9wZXJseSBzZXQsIGJ1dCBhIG5vdGFibGUgZG93bnNpZGUgaXMgdGhhdCBQUnMgY2Fubm90IHVzZSBmaXh1cCBvciBzcXVhc2ggY29tbWl0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoZ2l0OiBHaXRDbGllbnQsIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZXxudWxsPiB7XG4gICAgY29uc3Qge2dpdGh1YlRhcmdldEJyYW5jaCwgcHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9XG4gICAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KHQgPT4gdCAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNtYXRjaGluZ1RhcmdldEJyYW5jaCh0YXJnZXRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgYSByZXF1aXJlZCBiYXNlIGNvbW1pdCBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZlxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS5cbiAgICAvLyBUaGlzIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBlLmcuIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZSBvd25lcnNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5fZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyA9IHRhcmdldEJyYW5jaGVzLmZpbHRlcihiID0+IGIgIT09IGdpdGh1YlRhcmdldEJyYW5jaCk7XG5cbiAgICAvLyBGaXJzdCBjaGVycnktcGljayB0aGUgUFIgaW50byBhbGwgbG9jYWwgdGFyZ2V0IGJyYW5jaGVzIGluIGRyeS1ydW4gbW9kZS4gVGhpcyBpc1xuICAgIC8vIHB1cmVseSBmb3IgdGVzdGluZyBzbyB0aGF0IHdlIGNhbiBmaWd1cmUgb3V0IHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkXG4gICAgLy8gaW50byB0aGUgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLiBXZSBkb24ndCB3YW50IHRvIG1lcmdlIHRoZSBQUiB0aHJvdWdoIHRoZSBBUEksIGFuZFxuICAgIC8vIHRoZW4gcnVuIGludG8gY2hlcnJ5LXBpY2sgY29uZmxpY3RzIGFmdGVyIHRoZSBpbml0aWFsIG1lcmdlIGFscmVhZHkgY29tcGxldGVkLlxuICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCB0aGlzLl9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0LCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gSWYgdGhlIFBSIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8gYWxsIHRhcmdldCBicmFuY2hlcyBsb2NhbGx5LCB3ZSBrbm93IGl0IGNhbid0XG4gICAgLy8gYmUgZG9uZSB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGVpdGhlci4gV2UgYWJvcnQgbWVyZ2luZyBhbmQgcGFzcy10aHJvdWdoIHRoZSBmYWlsdXJlLlxuICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZU9wdGlvbnM6IFB1bGxzTWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuYXBpLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jcmVzcG9uc2UtaWYtbWVyZ2UtY2Fubm90LWJlLXBlcmZvcm1lZFxuICAgIC8vIFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGR1ZSB0byBtZXJnZSBjb25mbGljdHMuXG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSA9PT0gNDA1KSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcbiAgICB9XG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVua25vd25NZXJnZUVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFBSIGRvZXMgIG5vdCBuZWVkIHRvIGJlIG1lcmdlZCBpbnRvIGFueSBvdGhlciB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gd2UgZXhpdCBoZXJlIGFzIHdlIGFscmVhZHkgY29tcGxldGVkIHRoZSBtZXJnZS5cbiAgICBpZiAoIWNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggdGhlIHRhcmdldCBicmFuY2ggdGhlIFBSIGhhcyBiZWVuIG1lcmdlZCBpbnRvIHRocm91Z2ggdGhlIEFQSS4gV2UgbmVlZFxuICAgIC8vIHRvIHJlLWZldGNoIGFzIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2hlcnJ5LXBpY2sgdGhlIG5ldyBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIHRhcmdldCBicmFuY2hlcy5cbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuXG4gICAgLy8gTnVtYmVyIG9mIGNvbW1pdHMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgdGFyZ2V0IGJyYW5jaC4gVGhpcyBjb3VsZCB2YXJ5IGZyb21cbiAgICAvLyB0aGUgY291bnQgb2YgY29tbWl0cyBpbiB0aGUgUFIgZHVlIHRvIHNxdWFzaGluZy5cbiAgICBjb25zdCB0YXJnZXRDb21taXRzQ291bnQgPSBtZXRob2QgPT09ICdzcXVhc2gnID8gMSA6IHB1bGxSZXF1ZXN0LmNvbW1pdENvdW50O1xuXG4gICAgLy8gQ2hlcnJ5IHBpY2sgdGhlIG1lcmdlZCBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMoXG4gICAgICAgIGAke3RhcmdldFNoYX1+JHt0YXJnZXRDb21taXRzQ291bnR9Li4ke3RhcmdldFNoYX1gLCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gV2UgYWxyZWFkeSBjaGVja2VkIHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyBidXQgaW4gY2FzZSB0aGUgY2hlcnJ5LXBpY2sgc29tZWhvdyBmYWlscywgd2Ugc3RpbGwgaGFuZGxlIHRoZSBjb25mbGljdHMgaGVyZS4gVGhlXG4gICAgLy8gY29tbWl0cyBjcmVhdGVkIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgY291bGQgYmUgZGlmZmVyZW50IChpLmUuIHRocm91Z2ggc3F1YXNoKS5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgdGhlIGNvbW1pdCBtZXNzYWdlIGNoYW5nZXMuIFVubGlrZSBhcyBpbiB0aGUgYXV0b3NxdWFzaCBtZXJnZVxuICAgKiBzdHJhdGVneSwgd2UgY2Fubm90IHN0YXJ0IGFuIGludGVyYWN0aXZlIHJlYmFzZSBiZWNhdXNlIHdlIG1lcmdlIHVzaW5nIHRoZSBHaXRodWIgQVBJLlxuICAgKiBUaGUgR2l0aHViIEFQSSBvbmx5IGFsbG93cyBtb2RpZmljYXRpb25zIHRvIFBSIHRpdGxlIGFuZCBib2R5IGZvciBzcXVhc2ggbWVyZ2VzLlxuICAgKi9cbiAgYXN5bmMgX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zOiBQdWxsc01lcmdlUGFyYW1zKSB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCB7cmVzdWx0fSA9IGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7XG4gICAgICB0eXBlOiAnZWRpdG9yJyxcbiAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSB1cGRhdGUgdGhlIGNvbW1pdCBtZXNzYWdlJyxcbiAgICAgIGRlZmF1bHQ6IGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICAvLyBTcGxpdCB0aGUgbmV3IG1lc3NhZ2UgaW50byB0aXRsZSBhbmQgbWVzc2FnZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBHaXRodWIgQVBJIGV4cGVjdHMgdGl0bGUgYW5kIG1lc3NhZ2UgdG8gYmUgcGFzc2VkIHNlcGFyYXRlbHkuXG4gICAgY29uc3QgW25ld1RpdGxlLCAuLi5uZXdNZXNzYWdlXSA9IHJlc3VsdC5zcGxpdChDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lcmdlIG9wdGlvbnMgc28gdGhhdCB0aGUgY2hhbmdlcyBhcmUgcmVmbGVjdGVkIGluIHRoZXJlLlxuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfdGl0bGUgPSBgJHtuZXdUaXRsZX0gKCMke3B1bGxSZXF1ZXN0LnByTnVtYmVyfSlgO1xuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfbWVzc2FnZSA9IG5ld01lc3NhZ2Uuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGNvbW1pdCBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBHaXRodWIgYnkgZGVmYXVsdCBjb25jYXRlbmF0ZXNcbiAgICogbXVsdGlwbGUgY29tbWl0IG1lc3NhZ2VzIGlmIGEgUFIgaXMgbWVyZ2VkIGluIHNxdWFzaCBtb2RlLiBXZSB0cnkgdG8gcmVwbGljYXRlIHRoaXNcbiAgICogYmVoYXZpb3IgaGVyZSBzbyB0aGF0IHdlIGhhdmUgYSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRoYXQgY2FuIGJlIGZpeGVkIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IHRoaXMuX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMocHVsbFJlcXVlc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7bWVzc2FnZSwgcGFyc2VkOiBwYXJzZUNvbW1pdE1lc3NhZ2UobWVzc2FnZSl9KSk7XG4gICAgY29uc3QgbWVzc2FnZUJhc2UgPSBgJHtwdWxsUmVxdWVzdC50aXRsZX0ke0NPTU1JVF9IRUFERVJfU0VQQVJBVE9SfWA7XG4gICAgaWYgKGNvbW1pdHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2NvbW1pdHNbMF0ucGFyc2VkLmJvZHl9YDtcbiAgICB9XG4gICAgY29uc3Qgam9pbmVkTWVzc2FnZXMgPSBjb21taXRzLm1hcChjID0+IGAqICR7Yy5tZXNzYWdlfWApLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2pvaW5lZE1lc3NhZ2VzfWA7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgY29tbWl0IG1lc3NhZ2VzIG9mIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyh7cHJOdW1iZXJ9OiBQdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmdpdC5hcGkucHVsbHMubGlzdENvbW1pdHMuZW5kcG9pbnQubWVyZ2UoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIGNvbnN0IGFsbENvbW1pdHM6IFB1bGxzTGlzdENvbW1pdHNSZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2l0LmFwaS5wYWdpbmF0ZShyZXF1ZXN0KTtcbiAgICByZXR1cm4gYWxsQ29tbWl0cy5tYXAoKHtjb21taXR9KSA9PiBjb21taXQubWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGdpdmVuIHB1bGwgcmVxdWVzdCBjb3VsZCBiZSBtZXJnZWQgaW50byBpdHMgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlmIGl0IHRoZSBQUiBjb3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSk6XG4gICAgICBQcm9taXNlPG51bGx8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IHRoaXMuZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9XG4gICAgICAgIHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcywge2RyeVJ1bjogdHJ1ZX0pO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG1lcmdlIGFjdGlvbiBmcm9tIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHtsYWJlbHN9OiBQdWxsUmVxdWVzdCk6IEdpdGh1YkFwaU1lcmdlTWV0aG9kIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmxhYmVscykge1xuICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9XG4gICAgICAgICAgdGhpcy5fY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+IGxhYmVscy5zb21lKGwgPT4gbWF0Y2hlc1BhdHRlcm4obCwgcGF0dGVybikpKTtcbiAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTGFiZWwubWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmRlZmF1bHQ7XG4gIH1cbn1cbiJdfQ==