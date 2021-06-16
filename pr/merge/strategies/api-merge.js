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
                var request, allCommits;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            request = this.git.github.pulls.listCommits.endpoint.merge(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { pull_number: prNumber }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxxQ0FBZ0M7SUFFaEMseUVBQWlFO0lBSWpFLHlFQUErQztJQUUvQyxxRkFBaUQ7SUFFakQsb0ZBQThEO0lBVTlELHdEQUF3RDtJQUN4RCxJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztJQUV2Qzs7Ozs7O09BTUc7SUFDSDtRQUE0QyxrREFBYTtRQUN2RCxnQ0FBWSxHQUEyQixFQUFVLE9BQXFDO1lBQXRGLFlBQ0Usa0JBQU0sR0FBRyxDQUFDLFNBQ1g7WUFGZ0QsYUFBTyxHQUFQLE9BQU8sQ0FBOEI7O1FBRXRGLENBQUM7UUFFSyxzQ0FBSyxHQUFYLFVBQVksV0FBd0I7Ozs7Ozs0QkFDM0Isa0JBQWtCLEdBQ3JCLFdBQVcsbUJBRFUsRUFBRSxRQUFRLEdBQy9CLFdBQVcsU0FEb0IsRUFBRSxjQUFjLEdBQy9DLFdBQVcsZUFEb0MsRUFBRSxlQUFlLEdBQ2hFLFdBQVcsZ0JBRHFELEVBQUUsdUJBQXVCLEdBQ3pGLFdBQVcsd0JBRDhFLENBQzdFOzRCQUNoQixpRkFBaUY7NEJBQ2pGLHlDQUF5Qzs0QkFDekMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLGtCQUFrQixFQUF4QixDQUF3QixDQUFDLEVBQUU7Z0NBQ3ZELHNCQUFPLDZCQUFrQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxFQUFDOzZCQUNuRTs0QkFFRCxxRkFBcUY7NEJBQ3JGLHFGQUFxRjs0QkFDckYsb0ZBQW9GOzRCQUNwRixzRkFBc0Y7NEJBQ3RGLHlDQUF5Qzs0QkFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNB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QXdCLEVBQUUsY0FBd0I7Ozs7b0JBRTFFLGFBQWEsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzlELGNBQWMsR0FDaEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFFckYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQzFEO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRCwrREFBK0Q7UUFDdkQsK0RBQThCLEdBQXRDLFVBQXVDLEVBQXFCO2dCQUFwQixNQUFNLFlBQUE7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUzt3QkFBUixPQUFPLGFBQUE7b0JBQU0sT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUM7Z0JBQTVDLENBQTRDLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7aUJBQzdCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFqTUQsQ0FBNEMsd0JBQWEsR0FpTXhEO0lBak1ZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiBBUEkgbWVyZ2Ugc3RyYXRlZ3kuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcge1xuICAvKiogRGVmYXVsdCBtZXRob2QgdXNlZCBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzICovXG4gIGRlZmF1bHQ6IEdpdGh1YkFwaU1lcmdlTWV0aG9kO1xuICAvKiogTGFiZWxzIHdoaWNoIHNwZWNpZnkgYSBkaWZmZXJlbnQgbWVyZ2UgbWV0aG9kIHRoYW4gdGhlIGRlZmF1bHQuICovXG4gIGxhYmVscz86IHtwYXR0ZXJuOiBzdHJpbmcsIG1ldGhvZDogR2l0aHViQXBpTWVyZ2VNZXRob2R9W107XG59XG5cbi8qKiBTZXBhcmF0b3IgYmV0d2VlbiBjb21taXQgbWVzc2FnZSBoZWFkZXIgYW5kIGJvZHkuICovXG5jb25zdCBDT01NSVRfSEVBREVSX1NFUEFSQVRPUiA9ICdcXG5cXG4nO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgcHJpbWFyaWx5IGxldmVyYWdlcyB0aGUgR2l0aHViIEFQSS4gVGhlIHN0cmF0ZWd5IG1lcmdlcyBhIGdpdmVuXG4gKiBwdWxsIHJlcXVlc3QgaW50byBhIHRhcmdldCBicmFuY2ggdXNpbmcgdGhlIEFQSS4gVGhpcyBlbnN1cmVzIHRoYXQgR2l0aHViIGRpc3BsYXlzXG4gKiB0aGUgcHVsbCByZXF1ZXN0IGFzIG1lcmdlZC4gVGhlIG1lcmdlZCBjb21taXRzIGFyZSB0aGVuIGNoZXJyeS1waWNrZWQgaW50byB0aGUgcmVtYWluaW5nXG4gKiB0YXJnZXQgYnJhbmNoZXMgdXNpbmcgdGhlIGxvY2FsIEdpdCBpbnN0YW5jZS4gVGhlIGJlbmVmaXQgaXMgdGhhdCB0aGUgR2l0aHViIG1lcmdlZCBzdGF0ZVxuICogaXMgcHJvcGVybHkgc2V0LCBidXQgYSBub3RhYmxlIGRvd25zaWRlIGlzIHRoYXQgUFJzIGNhbm5vdCB1c2UgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCwgcHJpdmF0ZSBfY29uZmlnOiBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5Q29uZmlnKSB7XG4gICAgc3VwZXIoZ2l0KTtcbiAgfVxuXG4gIGFzeW5jIG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8UHVsbFJlcXVlc3RGYWlsdXJlfG51bGw+IHtcbiAgICBjb25zdCB7Z2l0aHViVGFyZ2V0QnJhbmNoLCBwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXB9ID1cbiAgICAgICAgcHVsbFJlcXVlc3Q7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBkb2VzIG5vdCBoYXZlIGl0cyBiYXNlIGJyYW5jaCBzZXQgdG8gYW55IGRldGVybWluZWQgdGFyZ2V0XG4gICAgLy8gYnJhbmNoLCB3ZSBjYW5ub3QgbWVyZ2UgdXNpbmcgdGhlIEFQSS5cbiAgICBpZiAodGFyZ2V0QnJhbmNoZXMuZXZlcnkodCA9PiB0ICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1pc21hdGNoaW5nVGFyZ2V0QnJhbmNoKHRhcmdldEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlcyB3aGVyZSBhIHJlcXVpcmVkIGJhc2UgY29tbWl0IGlzIHNwZWNpZmllZCBmb3IgdGhpcyBwdWxsIHJlcXVlc3QsIGNoZWNrIGlmXG4gICAgLy8gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyB0aGUgZ2l2ZW4gY29tbWl0LiBJZiBub3QsIHJldHVybiBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlLlxuICAgIC8vIFRoaXMgY2hlY2sgaXMgdXNlZnVsIGZvciBlbmZvcmNpbmcgdGhhdCBQUnMgYXJlIHJlYmFzZWQgb24gdG9wIG9mIGEgZ2l2ZW4gY29tbWl0LlxuICAgIC8vIGUuZy4gYSBjb21taXQgdGhhdCBjaGFuZ2VzIHRoZSBjb2RlIG93bmVyc2hpcCB2YWxpZGF0aW9uLiBQUnMgd2hpY2ggYXJlIG5vdCByZWJhc2VkXG4gICAgLy8gY291bGQgYnlwYXNzIG5ldyBjb2Rlb3duZXIgc2hpcCBydWxlcy5cbiAgICBpZiAocmVxdWlyZWRCYXNlU2hhICYmICF0aGlzLmdpdC5oYXNDb21taXQoVEVNUF9QUl9IRUFEX0JSQU5DSCwgcmVxdWlyZWRCYXNlU2hhKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bnNhdGlzZmllZEJhc2VTaGEoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRob2QgPSB0aGlzLl9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdChwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzID0gdGFyZ2V0QnJhbmNoZXMuZmlsdGVyKGIgPT4gYiAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKTtcblxuICAgIC8vIEZpcnN0IGNoZXJyeS1waWNrIHRoZSBQUiBpbnRvIGFsbCBsb2NhbCB0YXJnZXQgYnJhbmNoZXMgaW4gZHJ5LXJ1biBtb2RlLiBUaGlzIGlzXG4gICAgLy8gcHVyZWx5IGZvciB0ZXN0aW5nIHNvIHRoYXQgd2UgY2FuIGZpZ3VyZSBvdXQgd2hldGhlciB0aGUgUFIgY2FuIGJlIGNoZXJyeS1waWNrZWRcbiAgICAvLyBpbnRvIHRoZSBvdGhlciB0YXJnZXQgYnJhbmNoZXMuIFdlIGRvbid0IHdhbnQgdG8gbWVyZ2UgdGhlIFBSIHRocm91Z2ggdGhlIEFQSSwgYW5kXG4gICAgLy8gdGhlbiBydW4gaW50byBjaGVycnktcGljayBjb25mbGljdHMgYWZ0ZXIgdGhlIGluaXRpYWwgbWVyZ2UgYWxyZWFkeSBjb21wbGV0ZWQuXG4gICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHRoaXMuX2NoZWNrTWVyZ2FiaWxpdHkocHVsbFJlcXVlc3QsIGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG5cbiAgICAvLyBJZiB0aGUgUFIgY291bGQgbm90IGJlIGNoZXJyeS1waWNrZWQgaW50byBhbGwgdGFyZ2V0IGJyYW5jaGVzIGxvY2FsbHksIHdlIGtub3cgaXQgY2FuJ3RcbiAgICAvLyBiZSBkb25lIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgZWl0aGVyLiBXZSBhYm9ydCBtZXJnaW5nIGFuZCBwYXNzLXRocm91Z2ggdGhlIGZhaWx1cmUuXG4gICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWlsdXJlO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlT3B0aW9uczogT2N0b2tpdC5QdWxsc01lcmdlUGFyYW1zID0ge1xuICAgICAgcHVsbF9udW1iZXI6IHByTnVtYmVyLFxuICAgICAgbWVyZ2VfbWV0aG9kOiBtZXRob2QsXG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgfTtcblxuICAgIGlmIChuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCkge1xuICAgICAgLy8gQ29tbWl0IG1lc3NhZ2UgZml4dXAgZG9lcyBub3Qgd29yayB3aXRoIG90aGVyIG1lcmdlIG1ldGhvZHMgYXMgdGhlIEdpdGh1YiBBUEkgb25seVxuICAgICAgLy8gYWxsb3dzIGNvbW1pdCBtZXNzYWdlIG1vZGlmaWNhdGlvbnMgZm9yIHNxdWFzaCBtZXJnaW5nLlxuICAgICAgaWYgKG1ldGhvZCAhPT0gJ3NxdWFzaCcpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBtZXJnZVN0YXR1c0NvZGU6IG51bWJlcjtcbiAgICBsZXQgdGFyZ2V0U2hhOiBzdHJpbmc7XG5cbiAgICB0cnkge1xuICAgICAgLy8gTWVyZ2UgdGhlIHB1bGwgcmVxdWVzdCB1c2luZyB0aGUgR2l0aHViIEFQSSBpbnRvIHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5tZXJnZShtZXJnZU9wdGlvbnMpO1xuXG4gICAgICBtZXJnZVN0YXR1c0NvZGUgPSByZXN1bHQuc3RhdHVzO1xuICAgICAgdGFyZ2V0U2hhID0gcmVzdWx0LmRhdGEuc2hhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE5vdGU6IEdpdGh1YiB1c3VhbGx5IHJldHVybnMgYDQwNGAgYXMgc3RhdHVzIGNvZGUgaWYgdGhlIEFQSSByZXF1ZXN0IHVzZXMgYVxuICAgICAgLy8gdG9rZW4gd2l0aCBpbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMuIEdpdGh1YiBkb2VzIHRoaXMgYmVjYXVzZSBpdCBkb2Vzbid0IHdhbnRcbiAgICAgIC8vIHRvIGxlYWsgd2hldGhlciBhIHJlcG9zaXRvcnkgZXhpc3RzIG9yIG5vdC4gSW4gb3VyIGNhc2Ugd2UgZXhwZWN0IGEgY2VydGFpblxuICAgICAgLy8gcmVwb3NpdG9yeSB0byBleGlzdCwgc28gd2UgYWx3YXlzIHRyZWF0IHRoaXMgYXMgYSBwZXJtaXNzaW9uIGZhaWx1cmUuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwMyB8fCBlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI3Jlc3BvbnNlLWlmLW1lcmdlLWNhbm5vdC1iZS1wZXJmb3JtZWRcbiAgICAvLyBQdWxsIHJlcXVlc3QgY2Fubm90IGJlIG1lcmdlZCBkdWUgdG8gbWVyZ2UgY29uZmxpY3RzLlxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgPT09IDQwNSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG4gICAgfVxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmtub3duTWVyZ2VFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBQUiBkb2VzICBub3QgbmVlZCB0byBiZSBtZXJnZWQgaW50byBhbnkgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIHdlIGV4aXQgaGVyZSBhcyB3ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGUgbWVyZ2UuXG4gICAgaWYgKCFjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZWZyZXNoIHRoZSB0YXJnZXQgYnJhbmNoIHRoZSBQUiBoYXMgYmVlbiBtZXJnZWQgaW50byB0aHJvdWdoIHRoZSBBUEkuIFdlIG5lZWRcbiAgICAvLyB0byByZS1mZXRjaCBhcyBvdGhlcndpc2Ugd2UgY2Fubm90IGNoZXJyeS1waWNrIHRoZSBuZXcgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmdcbiAgICAvLyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcblxuICAgIC8vIE51bWJlciBvZiBjb21taXRzIHRoYXQgaGF2ZSBsYW5kZWQgaW4gdGhlIHRhcmdldCBicmFuY2guIFRoaXMgY291bGQgdmFyeSBmcm9tXG4gICAgLy8gdGhlIGNvdW50IG9mIGNvbW1pdHMgaW4gdGhlIFBSIGR1ZSB0byBzcXVhc2hpbmcuXG4gICAgY29uc3QgdGFyZ2V0Q29tbWl0c0NvdW50ID0gbWV0aG9kID09PSAnc3F1YXNoJyA/IDEgOiBwdWxsUmVxdWVzdC5jb21taXRDb3VudDtcblxuICAgIC8vIENoZXJyeSBwaWNrIHRoZSBtZXJnZWQgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmcgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gYXdhaXQgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKFxuICAgICAgICBgJHt0YXJnZXRTaGF9fiR7dGFyZ2V0Q29tbWl0c0NvdW50fS4uJHt0YXJnZXRTaGF9YCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLCB7XG4gICAgICAgICAgLy8gQ29tbWl0cyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoZSBHaXRodWIgQVBJIGRvIG5vdCBuZWNlc3NhcmlseSBjb250YWluXG4gICAgICAgICAgLy8gYSByZWZlcmVuY2UgdG8gdGhlIHNvdXJjZSBwdWxsIHJlcXVlc3QgKHVubGVzcyB0aGUgc3F1YXNoIHN0cmF0ZWd5IGlzIHVzZWQpLlxuICAgICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG9yaWdpbmFsIGNvbW1pdHMgY2FuIGJlIGZvdW5kIHdoZW4gYSBjb21taXQgaXMgdmlld2VkIGluIGFcbiAgICAgICAgICAvLyB0YXJnZXQgYnJhbmNoLCB3ZSBhZGQgYSBsaW5rIHRvIHRoZSBvcmlnaW5hbCBjb21taXRzIHdoZW4gY2hlcnJ5LXBpY2tpbmcuXG4gICAgICAgICAgbGlua1RvT3JpZ2luYWxDb21taXRzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgIC8vIFdlIGFscmVhZHkgY2hlY2tlZCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gYnV0IGluIGNhc2UgdGhlIGNoZXJyeS1waWNrIHNvbWVob3cgZmFpbHMsIHdlIHN0aWxsIGhhbmRsZSB0aGUgY29uZmxpY3RzIGhlcmUuIFRoZVxuICAgIC8vIGNvbW1pdHMgY3JlYXRlZCB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGNvdWxkIGJlIGRpZmZlcmVudCAoaS5lLiB0aHJvdWdoIHNxdWFzaCkuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHRoZSBjb21taXQgbWVzc2FnZSBjaGFuZ2VzLiBVbmxpa2UgYXMgaW4gdGhlIGF1dG9zcXVhc2ggbWVyZ2VcbiAgICogc3RyYXRlZ3ksIHdlIGNhbm5vdCBzdGFydCBhbiBpbnRlcmFjdGl2ZSByZWJhc2UgYmVjYXVzZSB3ZSBtZXJnZSB1c2luZyB0aGUgR2l0aHViIEFQSS5cbiAgICogVGhlIEdpdGh1YiBBUEkgb25seSBhbGxvd3MgbW9kaWZpY2F0aW9ucyB0byBQUiB0aXRsZSBhbmQgYm9keSBmb3Igc3F1YXNoIG1lcmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KFxuICAgICAgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnM6IE9jdG9raXQuUHVsbHNNZXJnZVBhcmFtcykge1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3Qge3Jlc3VsdH0gPSBhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogc3RyaW5nfT4oe1xuICAgICAgdHlwZTogJ2VkaXRvcicsXG4gICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2UgdXBkYXRlIHRoZSBjb21taXQgbWVzc2FnZScsXG4gICAgICBkZWZhdWx0OiBjb21taXRNZXNzYWdlLFxuICAgIH0pO1xuXG4gICAgLy8gU3BsaXQgdGhlIG5ldyBtZXNzYWdlIGludG8gdGl0bGUgYW5kIG1lc3NhZ2UuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gR2l0aHViIEFQSSBleHBlY3RzIHRpdGxlIGFuZCBtZXNzYWdlIHRvIGJlIHBhc3NlZCBzZXBhcmF0ZWx5LlxuICAgIGNvbnN0IFtuZXdUaXRsZSwgLi4ubmV3TWVzc2FnZV0gPSByZXN1bHQuc3BsaXQoQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBtZXJnZSBvcHRpb25zIHNvIHRoYXQgdGhlIGNoYW5nZXMgYXJlIHJlZmxlY3RlZCBpbiB0aGVyZS5cbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X3RpdGxlID0gYCR7bmV3VGl0bGV9ICgjJHtwdWxsUmVxdWVzdC5wck51bWJlcn0pYDtcbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X21lc3NhZ2UgPSBuZXdNZXNzYWdlLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb21taXQgbWVzc2FnZSBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gR2l0aHViIGJ5IGRlZmF1bHQgY29uY2F0ZW5hdGVzXG4gICAqIG11bHRpcGxlIGNvbW1pdCBtZXNzYWdlcyBpZiBhIFBSIGlzIG1lcmdlZCBpbiBzcXVhc2ggbW9kZS4gV2UgdHJ5IHRvIHJlcGxpY2F0ZSB0aGlzXG4gICAqIGJlaGF2aW9yIGhlcmUgc28gdGhhdCB3ZSBoYXZlIGEgZGVmYXVsdCBjb21taXQgbWVzc2FnZSB0aGF0IGNhbiBiZSBmaXhlZCB1cC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgY29tbWl0cyA9IChhd2FpdCB0aGlzLl9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHB1bGxSZXF1ZXN0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobWVzc2FnZSA9PiAoe21lc3NhZ2UsIHBhcnNlZDogcGFyc2VDb21taXRNZXNzYWdlKG1lc3NhZ2UpfSkpO1xuICAgIGNvbnN0IG1lc3NhZ2VCYXNlID0gYCR7cHVsbFJlcXVlc3QudGl0bGV9JHtDT01NSVRfSEVBREVSX1NFUEFSQVRPUn1gO1xuICAgIGlmIChjb21taXRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtjb21taXRzWzBdLnBhcnNlZC5ib2R5fWA7XG4gICAgfVxuICAgIGNvbnN0IGpvaW5lZE1lc3NhZ2VzID0gY29tbWl0cy5tYXAoYyA9PiBgKiAke2MubWVzc2FnZX1gKS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtqb2luZWRNZXNzYWdlc31gO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIGNvbW1pdCBtZXNzYWdlcyBvZiBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMoe3ByTnVtYmVyfTogUHVsbFJlcXVlc3QpIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5naXQuZ2l0aHViLnB1bGxzLmxpc3RDb21taXRzLmVuZHBvaW50Lm1lcmdlKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBwdWxsX251bWJlcjogcHJOdW1iZXJ9KTtcbiAgICBjb25zdCBhbGxDb21taXRzOiBPY3Rva2l0LlB1bGxzTGlzdENvbW1pdHNSZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wYWdpbmF0ZShyZXF1ZXN0KTtcbiAgICByZXR1cm4gYWxsQ29tbWl0cy5tYXAoKHtjb21taXR9KSA9PiBjb21taXQubWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGdpdmVuIHB1bGwgcmVxdWVzdCBjb3VsZCBiZSBtZXJnZWQgaW50byBpdHMgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlmIGl0IHRoZSBQUiBjb3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSk6XG4gICAgICBQcm9taXNlPG51bGx8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IHRoaXMuZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9XG4gICAgICAgIHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcywge2RyeVJ1bjogdHJ1ZX0pO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG1lcmdlIGFjdGlvbiBmcm9tIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHtsYWJlbHN9OiBQdWxsUmVxdWVzdCk6IEdpdGh1YkFwaU1lcmdlTWV0aG9kIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmxhYmVscykge1xuICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9XG4gICAgICAgICAgdGhpcy5fY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+IGxhYmVscy5zb21lKGwgPT4gbWF0Y2hlc1BhdHRlcm4obCwgcGF0dGVybikpKTtcbiAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTGFiZWwubWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmRlZmF1bHQ7XG4gIH1cbn1cbiJdfQ==