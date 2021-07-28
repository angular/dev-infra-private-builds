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
        define("@angular/dev-infra-private/pr/merge/strategies/api-merge", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/string-pattern", "@angular/dev-infra-private/pr/merge/strategies/strategy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubApiMergeStrategy = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
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
                                .map(function (message) { return ({ message: message, parsed: parse_1.parseCommitMessage(message) }); });
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
                var allCommits;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.git.github.paginate(this.git.github.pulls.listCommits, tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { pull_number: prNumber }))];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxxQ0FBZ0M7SUFFaEMseUVBQWlFO0lBR2pFLHlFQUErQztJQUUvQyxxRkFBaUQ7SUFFakQsb0ZBQThEO0lBYTlELHdEQUF3RDtJQUN4RCxJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztJQUV2Qzs7Ozs7O09BTUc7SUFDSDtRQUE0QyxrREFBYTtRQUN2RCxnQ0FBWSxHQUEyQixFQUFVLE9BQXFDO1lBQXRGLFlBQ0Usa0JBQU0sR0FBRyxDQUFDLFNBQ1g7WUFGZ0QsYUFBTyxHQUFQLE9BQU8sQ0FBOEI7O1FBRXRGLENBQUM7UUFFYyxzQ0FBSyxHQUFwQixVQUFxQixXQUF3Qjs7Ozs7OzRCQUNwQyxrQkFBa0IsR0FDckIsV0FBVyxtQkFEVSxFQUFFLFFBQVEsR0FDL0IsV0FBVyxTQURvQixFQUFFLGNBQWMsR0FDL0MsV0FBVyxlQURvQyxFQUFFLGVBQWUsR0FDaEUsV0FBVyxnQkFEcUQsRUFBRSx1QkFBdUIsR0FDekYsV0FBVyx3QkFEOEUsQ0FDN0U7NEJBQ2hCLGlGQUFpRjs0QkFDakYseUNBQXlDOzRCQUN6QyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLEtBQUssa0JBQWtCLEVBQXhCLENBQXdCLENBQUMsRUFBRTtnQ0FDdkQsc0JBQU8sNkJBQWtCLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLEVBQUM7NkJBQ25FOzRCQUVELHFGQUFxRjs0QkFDckYscUZBQXFGOzRCQUNyRixvRkFBb0Y7NEJBQ3BGLHNGQUFzRjs0QkFDdEYseUNBQXlDOzRCQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMs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LENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzlELGNBQWMsR0FDaEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFFckYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQzFEO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRCwrREFBK0Q7UUFDdkQsK0RBQThCLEdBQXRDLFVBQXVDLEVBQXFCO2dCQUFwQixNQUFNLFlBQUE7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUzt3QkFBUixPQUFPLGFBQUE7b0JBQU0sT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUM7Z0JBQTVDLENBQTRDLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7aUJBQzdCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFoTUQsQ0FBNEMsd0JBQWEsR0FnTXhEO0lBaE1ZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Jlc3RFbmRwb2ludE1ldGhvZFR5cGVzfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgT2N0b2tpdCBgbWVyZ2VgIEFQSSBlbmRwb2ludC4gKi9cbnR5cGUgT2N0b2tpdE1lcmdlUGFyYW1zID0gUmVzdEVuZHBvaW50TWV0aG9kVHlwZXNbJ3B1bGxzJ11bJ21lcmdlJ11bJ3BhcmFtZXRlcnMnXTtcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBHaXRodWIgQVBJIG1lcmdlIHN0cmF0ZWd5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5Q29uZmlnIHtcbiAgLyoqIERlZmF1bHQgbWV0aG9kIHVzZWQgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cyAqL1xuICBkZWZhdWx0OiBHaXRodWJBcGlNZXJnZU1ldGhvZDtcbiAgLyoqIExhYmVscyB3aGljaCBzcGVjaWZ5IGEgZGlmZmVyZW50IG1lcmdlIG1ldGhvZCB0aGFuIHRoZSBkZWZhdWx0LiAqL1xuICBsYWJlbHM/OiB7cGF0dGVybjogc3RyaW5nLCBtZXRob2Q6IEdpdGh1YkFwaU1lcmdlTWV0aG9kfVtdO1xufVxuXG4vKiogU2VwYXJhdG9yIGJldHdlZW4gY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGFuZCBib2R5LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IgPSAnXFxuXFxuJztcblxuLyoqXG4gKiBNZXJnZSBzdHJhdGVneSB0aGF0IHByaW1hcmlseSBsZXZlcmFnZXMgdGhlIEdpdGh1YiBBUEkuIFRoZSBzdHJhdGVneSBtZXJnZXMgYSBnaXZlblxuICogcHVsbCByZXF1ZXN0IGludG8gYSB0YXJnZXQgYnJhbmNoIHVzaW5nIHRoZSBBUEkuIFRoaXMgZW5zdXJlcyB0aGF0IEdpdGh1YiBkaXNwbGF5c1xuICogdGhlIHB1bGwgcmVxdWVzdCBhcyBtZXJnZWQuIFRoZSBtZXJnZWQgY29tbWl0cyBhcmUgdGhlbiBjaGVycnktcGlja2VkIGludG8gdGhlIHJlbWFpbmluZ1xuICogdGFyZ2V0IGJyYW5jaGVzIHVzaW5nIHRoZSBsb2NhbCBHaXQgaW5zdGFuY2UuIFRoZSBiZW5lZml0IGlzIHRoYXQgdGhlIEdpdGh1YiBtZXJnZWQgc3RhdGVcbiAqIGlzIHByb3Blcmx5IHNldCwgYnV0IGEgbm90YWJsZSBkb3duc2lkZSBpcyB0aGF0IFBScyBjYW5ub3QgdXNlIGZpeHVwIG9yIHNxdWFzaCBjb21taXRzLlxuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZXxudWxsPiB7XG4gICAgY29uc3Qge2dpdGh1YlRhcmdldEJyYW5jaCwgcHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9XG4gICAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KHQgPT4gdCAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNtYXRjaGluZ1RhcmdldEJyYW5jaCh0YXJnZXRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgYSByZXF1aXJlZCBiYXNlIGNvbW1pdCBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZlxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS5cbiAgICAvLyBUaGlzIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBlLmcuIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZSBvd25lcnNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5fZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyA9IHRhcmdldEJyYW5jaGVzLmZpbHRlcihiID0+IGIgIT09IGdpdGh1YlRhcmdldEJyYW5jaCk7XG5cbiAgICAvLyBGaXJzdCBjaGVycnktcGljayB0aGUgUFIgaW50byBhbGwgbG9jYWwgdGFyZ2V0IGJyYW5jaGVzIGluIGRyeS1ydW4gbW9kZS4gVGhpcyBpc1xuICAgIC8vIHB1cmVseSBmb3IgdGVzdGluZyBzbyB0aGF0IHdlIGNhbiBmaWd1cmUgb3V0IHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkXG4gICAgLy8gaW50byB0aGUgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLiBXZSBkb24ndCB3YW50IHRvIG1lcmdlIHRoZSBQUiB0aHJvdWdoIHRoZSBBUEksIGFuZFxuICAgIC8vIHRoZW4gcnVuIGludG8gY2hlcnJ5LXBpY2sgY29uZmxpY3RzIGFmdGVyIHRoZSBpbml0aWFsIG1lcmdlIGFscmVhZHkgY29tcGxldGVkLlxuICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCB0aGlzLl9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0LCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gSWYgdGhlIFBSIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8gYWxsIHRhcmdldCBicmFuY2hlcyBsb2NhbGx5LCB3ZSBrbm93IGl0IGNhbid0XG4gICAgLy8gYmUgZG9uZSB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGVpdGhlci4gV2UgYWJvcnQgbWVyZ2luZyBhbmQgcGFzcy10aHJvdWdoIHRoZSBmYWlsdXJlLlxuICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFpbHVyZTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXJnZU9wdGlvbnM6IE9jdG9raXRNZXJnZVBhcmFtcyA9IHtcbiAgICAgIHB1bGxfbnVtYmVyOiBwck51bWJlcixcbiAgICAgIG1lcmdlX21ldGhvZDogbWV0aG9kLFxuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgIH07XG5cbiAgICBpZiAobmVlZHNDb21taXRNZXNzYWdlRml4dXApIHtcbiAgICAgIC8vIENvbW1pdCBtZXNzYWdlIGZpeHVwIGRvZXMgbm90IHdvcmsgd2l0aCBvdGhlciBtZXJnZSBtZXRob2RzIGFzIHRoZSBHaXRodWIgQVBJIG9ubHlcbiAgICAgIC8vIGFsbG93cyBjb21taXQgbWVzc2FnZSBtb2RpZmljYXRpb25zIGZvciBzcXVhc2ggbWVyZ2luZy5cbiAgICAgIGlmIChtZXRob2QgIT09ICdzcXVhc2gnKSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5hYmxlVG9GaXh1cENvbW1pdE1lc3NhZ2VTcXVhc2hPbmx5KCk7XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLl9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChwdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zKTtcbiAgICB9XG5cbiAgICBsZXQgbWVyZ2VTdGF0dXNDb2RlOiBudW1iZXI7XG4gICAgbGV0IHRhcmdldFNoYTogc3RyaW5nO1xuXG4gICAgdHJ5IHtcbiAgICAgIC8vIE1lcmdlIHRoZSBwdWxsIHJlcXVlc3QgdXNpbmcgdGhlIEdpdGh1YiBBUEkgaW50byB0aGUgc2VsZWN0ZWQgYmFzZSBicmFuY2guXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMubWVyZ2UobWVyZ2VPcHRpb25zKTtcblxuICAgICAgbWVyZ2VTdGF0dXNDb2RlID0gcmVzdWx0LnN0YXR1cztcbiAgICAgIHRhcmdldFNoYSA9IHJlc3VsdC5kYXRhLnNoYTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBOb3RlOiBHaXRodWIgdXN1YWxseSByZXR1cm5zIGA0MDRgIGFzIHN0YXR1cyBjb2RlIGlmIHRoZSBBUEkgcmVxdWVzdCB1c2VzIGFcbiAgICAgIC8vIHRva2VuIHdpdGggaW5zdWZmaWNpZW50IHBlcm1pc3Npb25zLiBHaXRodWIgZG9lcyB0aGlzIGJlY2F1c2UgaXQgZG9lc24ndCB3YW50XG4gICAgICAvLyB0byBsZWFrIHdoZXRoZXIgYSByZXBvc2l0b3J5IGV4aXN0cyBvciBub3QuIEluIG91ciBjYXNlIHdlIGV4cGVjdCBhIGNlcnRhaW5cbiAgICAgIC8vIHJlcG9zaXRvcnkgdG8gZXhpc3QsIHNvIHdlIGFsd2F5cyB0cmVhdCB0aGlzIGFzIGEgcGVybWlzc2lvbiBmYWlsdXJlLlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDMgfHwgZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZSgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyNyZXNwb25zZS1pZi1tZXJnZS1jYW5ub3QtYmUtcGVyZm9ybWVkXG4gICAgLy8gUHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBtZXJnZWQgZHVlIHRvIG1lcmdlIGNvbmZsaWN0cy5cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlID09PSA0MDUpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuICAgIH1cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5rbm93bk1lcmdlRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgUFIgZG9lcyAgbm90IG5lZWQgdG8gYmUgbWVyZ2VkIGludG8gYW55IG90aGVyIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyB3ZSBleGl0IGhlcmUgYXMgd2UgYWxyZWFkeSBjb21wbGV0ZWQgdGhlIG1lcmdlLlxuICAgIGlmICghY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCB0aGUgdGFyZ2V0IGJyYW5jaCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkIGludG8gdGhyb3VnaCB0aGUgQVBJLiBXZSBuZWVkXG4gICAgLy8gdG8gcmUtZmV0Y2ggYXMgb3RoZXJ3aXNlIHdlIGNhbm5vdCBjaGVycnktcGljayB0aGUgbmV3IGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nXG4gICAgLy8gdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHRoaXMuZmV0Y2hUYXJnZXRCcmFuY2hlcyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG5cbiAgICAvLyBOdW1iZXIgb2YgY29tbWl0cyB0aGF0IGhhdmUgbGFuZGVkIGluIHRoZSB0YXJnZXQgYnJhbmNoLiBUaGlzIGNvdWxkIHZhcnkgZnJvbVxuICAgIC8vIHRoZSBjb3VudCBvZiBjb21taXRzIGluIHRoZSBQUiBkdWUgdG8gc3F1YXNoaW5nLlxuICAgIGNvbnN0IHRhcmdldENvbW1pdHNDb3VudCA9IG1ldGhvZCA9PT0gJ3NxdWFzaCcgPyAxIDogcHVsbFJlcXVlc3QuY29tbWl0Q291bnQ7XG5cbiAgICAvLyBDaGVycnkgcGljayB0aGUgbWVyZ2VkIGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nIHRhcmdldCBicmFuY2hlcy5cbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IGF3YWl0IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhcbiAgICAgICAgYCR7dGFyZ2V0U2hhfX4ke3RhcmdldENvbW1pdHNDb3VudH0uLiR7dGFyZ2V0U2hhfWAsIGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcywge1xuICAgICAgICAgIC8vIENvbW1pdHMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGUgR2l0aHViIEFQSSBkbyBub3QgbmVjZXNzYXJpbHkgY29udGFpblxuICAgICAgICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSBzb3VyY2UgcHVsbCByZXF1ZXN0ICh1bmxlc3MgdGhlIHNxdWFzaCBzdHJhdGVneSBpcyB1c2VkKS5cbiAgICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBvcmlnaW5hbCBjb21taXRzIGNhbiBiZSBmb3VuZCB3aGVuIGEgY29tbWl0IGlzIHZpZXdlZCBpbiBhXG4gICAgICAgICAgLy8gdGFyZ2V0IGJyYW5jaCwgd2UgYWRkIGEgbGluayB0byB0aGUgb3JpZ2luYWwgY29tbWl0cyB3aGVuIGNoZXJyeS1waWNraW5nLlxuICAgICAgICAgIGxpbmtUb09yaWdpbmFsQ29tbWl0czogdHJ1ZSxcbiAgICAgICAgfSk7XG5cbiAgICAvLyBXZSBhbHJlYWR5IGNoZWNrZWQgd2hldGhlciB0aGUgUFIgY2FuIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIGJ1dCBpbiBjYXNlIHRoZSBjaGVycnktcGljayBzb21laG93IGZhaWxzLCB3ZSBzdGlsbCBoYW5kbGUgdGhlIGNvbmZsaWN0cyBoZXJlLiBUaGVcbiAgICAvLyBjb21taXRzIGNyZWF0ZWQgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBjb3VsZCBiZSBkaWZmZXJlbnQgKGkuZS4gdGhyb3VnaCBzcXVhc2gpLlxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0oY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UgY2hhbmdlcy4gVW5saWtlIGFzIGluIHRoZSBhdXRvc3F1YXNoIG1lcmdlXG4gICAqIHN0cmF0ZWd5LCB3ZSBjYW5ub3Qgc3RhcnQgYW4gaW50ZXJhY3RpdmUgcmViYXNlIGJlY2F1c2Ugd2UgbWVyZ2UgdXNpbmcgdGhlIEdpdGh1YiBBUEkuXG4gICAqIFRoZSBHaXRodWIgQVBJIG9ubHkgYWxsb3dzIG1vZGlmaWNhdGlvbnMgdG8gUFIgdGl0bGUgYW5kIGJvZHkgZm9yIHNxdWFzaCBtZXJnZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChcbiAgICAgIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zOiBPY3Rva2l0TWVyZ2VQYXJhbXMpIHtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHtcbiAgICAgIHR5cGU6ICdlZGl0b3InLFxuICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHVwZGF0ZSB0aGUgY29tbWl0IG1lc3NhZ2UnLFxuICAgICAgZGVmYXVsdDogY29tbWl0TWVzc2FnZSxcbiAgICB9KTtcblxuICAgIC8vIFNwbGl0IHRoZSBuZXcgbWVzc2FnZSBpbnRvIHRpdGxlIGFuZCBtZXNzYWdlLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIEdpdGh1YiBBUEkgZXhwZWN0cyB0aXRsZSBhbmQgbWVzc2FnZSB0byBiZSBwYXNzZWQgc2VwYXJhdGVseS5cbiAgICBjb25zdCBbbmV3VGl0bGUsIC4uLm5ld01lc3NhZ2VdID0gcmVzdWx0LnNwbGl0KENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgbWVyZ2Ugb3B0aW9ucyBzbyB0aGF0IHRoZSBjaGFuZ2VzIGFyZSByZWZsZWN0ZWQgaW4gdGhlcmUuXG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF90aXRsZSA9IGAke25ld1RpdGxlfSAoIyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9KWA7XG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF9tZXNzYWdlID0gbmV3TWVzc2FnZS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIEdpdGh1YiBieSBkZWZhdWx0IGNvbmNhdGVuYXRlc1xuICAgKiBtdWx0aXBsZSBjb21taXQgbWVzc2FnZXMgaWYgYSBQUiBpcyBtZXJnZWQgaW4gc3F1YXNoIG1vZGUuIFdlIHRyeSB0byByZXBsaWNhdGUgdGhpc1xuICAgKiBiZWhhdmlvciBoZXJlIHNvIHRoYXQgd2UgaGF2ZSBhIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdGhhdCBjYW4gYmUgZml4ZWQgdXAuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGNvbW1pdHMgPSAoYXdhaXQgdGhpcy5fZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyhwdWxsUmVxdWVzdCkpXG4gICAgICAgICAgICAgICAgICAgICAgICAubWFwKG1lc3NhZ2UgPT4gKHttZXNzYWdlLCBwYXJzZWQ6IHBhcnNlQ29tbWl0TWVzc2FnZShtZXNzYWdlKX0pKTtcbiAgICBjb25zdCBtZXNzYWdlQmFzZSA9IGAke3B1bGxSZXF1ZXN0LnRpdGxlfSR7Q09NTUlUX0hFQURFUl9TRVBBUkFUT1J9YDtcbiAgICBpZiAoY29tbWl0cy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7Y29tbWl0c1swXS5wYXJzZWQuYm9keX1gO1xuICAgIH1cbiAgICBjb25zdCBqb2luZWRNZXNzYWdlcyA9IGNvbW1pdHMubWFwKGMgPT4gYCogJHtjLm1lc3NhZ2V9YCkuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7am9pbmVkTWVzc2FnZXN9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBjb21taXQgbWVzc2FnZXMgb2YgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHtwck51bWJlcn06IFB1bGxSZXF1ZXN0KSB7XG4gICAgY29uc3QgYWxsQ29tbWl0cyA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wYWdpbmF0ZShcbiAgICAgICAgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmxpc3RDb21taXRzLCB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBwdWxsX251bWJlcjogcHJOdW1iZXJ9KTtcbiAgICByZXR1cm4gYWxsQ29tbWl0cy5tYXAoKHtjb21taXR9KSA9PiBjb21taXQubWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGdpdmVuIHB1bGwgcmVxdWVzdCBjb3VsZCBiZSBtZXJnZWQgaW50byBpdHMgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlmIGl0IHRoZSBQUiBjb3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSk6XG4gICAgICBQcm9taXNlPG51bGx8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IHRoaXMuZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9XG4gICAgICAgIHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcywge2RyeVJ1bjogdHJ1ZX0pO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG1lcmdlIGFjdGlvbiBmcm9tIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHtsYWJlbHN9OiBQdWxsUmVxdWVzdCk6IEdpdGh1YkFwaU1lcmdlTWV0aG9kIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmxhYmVscykge1xuICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9XG4gICAgICAgICAgdGhpcy5fY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+IGxhYmVscy5zb21lKGwgPT4gbWF0Y2hlc1BhdHRlcm4obCwgcGF0dGVybikpKTtcbiAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTGFiZWwubWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmRlZmF1bHQ7XG4gIH1cbn1cbiJdfQ==