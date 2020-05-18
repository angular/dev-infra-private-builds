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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILHFDQUFnQztJQUVoQywrRUFBb0U7SUFFcEUseUVBQStDO0lBRy9DLHFGQUFpRDtJQUVqRCxvRkFBOEQ7SUFVOUQsd0RBQXdEO0lBQ3hELElBQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0lBRXZDOzs7Ozs7T0FNRztJQUNIO1FBQTRDLGtEQUFhO1FBQ3ZELGdDQUFZLEdBQWMsRUFBVSxPQUFxQztZQUF6RSxZQUNFLGtCQUFNLEdBQUcsQ0FBQyxTQUNYO1lBRm1DLGFBQU8sR0FBUCxPQUFPLENBQThCOztRQUV6RSxDQUFDO1FBRUssc0NBQUssR0FBWCxVQUFZLFdBQXdCOzs7Ozs7NEJBQzNCLGtCQUFrQixHQUNyQixXQUFXLG1CQURVLEVBQUUsUUFBUSxHQUMvQixXQUFXLFNBRG9CLEVBQUUsY0FBYyxHQUMvQyxXQUFXLGVBRG9DLEVBQUUsZUFBZSxHQUNoRSxXQUFXLGdCQURxRCxFQUFFLHVCQUF1QixHQUN6RixXQUFXLHdCQUQ4RSxDQUM3RTs0QkFDaEIsaUZBQWlGOzRCQUNqRix5Q0FBeUM7NEJBQ3pDLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxrQkFBa0IsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFFO2dDQUN2RCxzQkFBTyw2QkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQyxjQUFjLENBQUMsRUFBQzs2QkFDbkU7NEJBRUQscUZBQXFGOzRCQUNyRixxRkFBcUY7NEJBQ3JGLG9GQUFvRjs0QkFDcEYsc0ZBQXNGOzRCQUN0Rix5Q0FBeUM7NEJBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFT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LDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFFckYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQzFEO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRCwrREFBK0Q7UUFDdkQsK0RBQThCLEdBQXRDLFVBQXVDLEVBQXFCO2dCQUFwQixrQkFBTTtZQUM1QyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUN2QixJQUFNLGFBQWEsR0FDZixJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFTO3dCQUFSLG9CQUFPO29CQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLCtCQUFjLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUExQixDQUEwQixDQUFDO2dCQUE1QyxDQUE0QyxDQUFDLENBQUM7Z0JBQzFGLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtvQkFDL0IsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDO2lCQUM3QjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUM5QixDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBMUxELENBQTRDLHdCQUFhLEdBMEx4RDtJQTFMWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQdWxsc0xpc3RDb21taXRzUmVzcG9uc2UsIFB1bGxzTWVyZ2VQYXJhbXN9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlJztcbmltcG9ydCB7R2l0aHViQXBpTWVyZ2VNZXRob2R9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi4vZmFpbHVyZXMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uL2dpdCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiBBUEkgbWVyZ2Ugc3RyYXRlZ3kuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcge1xuICAvKiogRGVmYXVsdCBtZXRob2QgdXNlZCBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzICovXG4gIGRlZmF1bHQ6IEdpdGh1YkFwaU1lcmdlTWV0aG9kO1xuICAvKiogTGFiZWxzIHdoaWNoIHNwZWNpZnkgYSBkaWZmZXJlbnQgbWVyZ2UgbWV0aG9kIHRoYW4gdGhlIGRlZmF1bHQuICovXG4gIGxhYmVscz86IHtwYXR0ZXJuOiBzdHJpbmcsIG1ldGhvZDogR2l0aHViQXBpTWVyZ2VNZXRob2R9W107XG59XG5cbi8qKiBTZXBhcmF0b3IgYmV0d2VlbiBjb21taXQgbWVzc2FnZSBoZWFkZXIgYW5kIGJvZHkuICovXG5jb25zdCBDT01NSVRfSEVBREVSX1NFUEFSQVRPUiA9ICdcXG5cXG4nO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgcHJpbWFyaWx5IGxldmVyYWdlcyB0aGUgR2l0aHViIEFQSS4gVGhlIHN0cmF0ZWd5IG1lcmdlcyBhIGdpdmVuXG4gKiBwdWxsIHJlcXVlc3QgaW50byBhIHRhcmdldCBicmFuY2ggdXNpbmcgdGhlIEFQSS4gVGhpcyBlbnN1cmVzIHRoYXQgR2l0aHViIGRpc3BsYXlzXG4gKiB0aGUgcHVsbCByZXF1ZXN0IGFzIG1lcmdlZC4gVGhlIG1lcmdlZCBjb21taXRzIGFyZSB0aGVuIGNoZXJyeS1waWNrZWQgaW50byB0aGUgcmVtYWluaW5nXG4gKiB0YXJnZXQgYnJhbmNoZXMgdXNpbmcgdGhlIGxvY2FsIEdpdCBpbnN0YW5jZS4gVGhlIGJlbmVmaXQgaXMgdGhhdCB0aGUgR2l0aHViIG1lcmdlZCBzdGF0ZVxuICogaXMgcHJvcGVybHkgc2V0LCBidXQgYSBub3RhYmxlIGRvd25zaWRlIGlzIHRoYXQgUFJzIGNhbm5vdCB1c2UgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKGdpdDogR2l0Q2xpZW50LCBwcml2YXRlIF9jb25maWc6IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcpIHtcbiAgICBzdXBlcihnaXQpO1xuICB9XG5cbiAgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtnaXRodWJUYXJnZXRCcmFuY2gsIHByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cH0gPVxuICAgICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGRvZXMgbm90IGhhdmUgaXRzIGJhc2UgYnJhbmNoIHNldCB0byBhbnkgZGV0ZXJtaW5lZCB0YXJnZXRcbiAgICAvLyBicmFuY2gsIHdlIGNhbm5vdCBtZXJnZSB1c2luZyB0aGUgQVBJLlxuICAgIGlmICh0YXJnZXRCcmFuY2hlcy5ldmVyeSh0ID0+IHQgIT09IGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2godGFyZ2V0QnJhbmNoZXMpO1xuICAgIH1cblxuICAgIC8vIEluIGNhc2VzIHdoZXJlIGEgcmVxdWlyZWQgYmFzZSBjb21taXQgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWZcbiAgICAvLyB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuXG4gICAgLy8gVGhpcyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gZS5nLiBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGUgb3duZXJzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMgPSB0YXJnZXRCcmFuY2hlcy5maWx0ZXIoYiA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBQdWxsc01lcmdlUGFyYW1zID0ge1xuICAgICAgcHVsbF9udW1iZXI6IHByTnVtYmVyLFxuICAgICAgbWVyZ2VfbWV0aG9kOiBtZXRob2QsXG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgfTtcblxuICAgIGlmIChuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCkge1xuICAgICAgLy8gQ29tbWl0IG1lc3NhZ2UgZml4dXAgZG9lcyBub3Qgd29yayB3aXRoIG90aGVyIG1lcmdlIG1ldGhvZHMgYXMgdGhlIEdpdGh1YiBBUEkgb25seVxuICAgICAgLy8gYWxsb3dzIGNvbW1pdCBtZXNzYWdlIG1vZGlmaWNhdGlvbnMgZm9yIHNxdWFzaCBtZXJnaW5nLlxuICAgICAgaWYgKG1ldGhvZCAhPT0gJ3NxdWFzaCcpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBtZXJnZVN0YXR1c0NvZGU6IG51bWJlcjtcbiAgICBsZXQgdGFyZ2V0U2hhOiBzdHJpbmc7XG5cbiAgICB0cnkge1xuICAgICAgLy8gTWVyZ2UgdGhlIHB1bGwgcmVxdWVzdCB1c2luZyB0aGUgR2l0aHViIEFQSSBpbnRvIHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmFwaS5wdWxscy5tZXJnZShtZXJnZU9wdGlvbnMpO1xuXG4gICAgICBtZXJnZVN0YXR1c0NvZGUgPSByZXN1bHQuc3RhdHVzO1xuICAgICAgdGFyZ2V0U2hhID0gcmVzdWx0LmRhdGEuc2hhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE5vdGU6IEdpdGh1YiB1c3VhbGx5IHJldHVybnMgYDQwNGAgYXMgc3RhdHVzIGNvZGUgaWYgdGhlIEFQSSByZXF1ZXN0IHVzZXMgYVxuICAgICAgLy8gdG9rZW4gd2l0aCBpbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMuIEdpdGh1YiBkb2VzIHRoaXMgYmVjYXVzZSBpdCBkb2Vzbid0IHdhbnRcbiAgICAgIC8vIHRvIGxlYWsgd2hldGhlciBhIHJlcG9zaXRvcnkgZXhpc3RzIG9yIG5vdC4gSW4gb3VyIGNhc2Ugd2UgZXhwZWN0IGEgY2VydGFpblxuICAgICAgLy8gcmVwb3NpdG9yeSB0byBleGlzdCwgc28gd2UgYWx3YXlzIHRyZWF0IHRoaXMgYXMgYSBwZXJtaXNzaW9uIGZhaWx1cmUuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwMyB8fCBlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI3Jlc3BvbnNlLWlmLW1lcmdlLWNhbm5vdC1iZS1wZXJmb3JtZWRcbiAgICAvLyBQdWxsIHJlcXVlc3QgY2Fubm90IGJlIG1lcmdlZCBkdWUgdG8gbWVyZ2UgY29uZmxpY3RzLlxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgPT09IDQwNSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG4gICAgfVxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmtub3duTWVyZ2VFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBQUiBkb2VzICBub3QgbmVlZCB0byBiZSBtZXJnZWQgaW50byBhbnkgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIHdlIGV4aXQgaGVyZSBhcyB3ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGUgbWVyZ2UuXG4gICAgaWYgKCFjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZWZyZXNoIHRoZSB0YXJnZXQgYnJhbmNoIHRoZSBQUiBoYXMgYmVlbiBtZXJnZWQgaW50byB0aHJvdWdoIHRoZSBBUEkuIFdlIG5lZWRcbiAgICAvLyB0byByZS1mZXRjaCBhcyBvdGhlcndpc2Ugd2UgY2Fubm90IGNoZXJyeS1waWNrIHRoZSBuZXcgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmdcbiAgICAvLyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcblxuICAgIC8vIE51bWJlciBvZiBjb21taXRzIHRoYXQgaGF2ZSBsYW5kZWQgaW4gdGhlIHRhcmdldCBicmFuY2guIFRoaXMgY291bGQgdmFyeSBmcm9tXG4gICAgLy8gdGhlIGNvdW50IG9mIGNvbW1pdHMgaW4gdGhlIFBSIGR1ZSB0byBzcXVhc2hpbmcuXG4gICAgY29uc3QgdGFyZ2V0Q29tbWl0c0NvdW50ID0gbWV0aG9kID09PSAnc3F1YXNoJyA/IDEgOiBwdWxsUmVxdWVzdC5jb21taXRDb3VudDtcblxuICAgIC8vIENoZXJyeSBwaWNrIHRoZSBtZXJnZWQgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmcgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gYXdhaXQgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKFxuICAgICAgICBgJHt0YXJnZXRTaGF9fiR7dGFyZ2V0Q29tbWl0c0NvdW50fS4uJHt0YXJnZXRTaGF9YCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIFdlIGFscmVhZHkgY2hlY2tlZCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gYnV0IGluIGNhc2UgdGhlIGNoZXJyeS1waWNrIHNvbWVob3cgZmFpbHMsIHdlIHN0aWxsIGhhbmRsZSB0aGUgY29uZmxpY3RzIGhlcmUuIFRoZVxuICAgIC8vIGNvbW1pdHMgY3JlYXRlZCB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGNvdWxkIGJlIGRpZmZlcmVudCAoaS5lLiB0aHJvdWdoIHNxdWFzaCkuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHRoZSBjb21taXQgbWVzc2FnZSBjaGFuZ2VzLiBVbmxpa2UgYXMgaW4gdGhlIGF1dG9zcXVhc2ggbWVyZ2VcbiAgICogc3RyYXRlZ3ksIHdlIGNhbm5vdCBzdGFydCBhbiBpbnRlcmFjdGl2ZSByZWJhc2UgYmVjYXVzZSB3ZSBtZXJnZSB1c2luZyB0aGUgR2l0aHViIEFQSS5cbiAgICogVGhlIEdpdGh1YiBBUEkgb25seSBhbGxvd3MgbW9kaWZpY2F0aW9ucyB0byBQUiB0aXRsZSBhbmQgYm9keSBmb3Igc3F1YXNoIG1lcmdlcy5cbiAgICovXG4gIGFzeW5jIF9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9uczogUHVsbHNNZXJnZVBhcmFtcykge1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3Qge3Jlc3VsdH0gPSBhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogc3RyaW5nfT4oe1xuICAgICAgdHlwZTogJ2VkaXRvcicsXG4gICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2UgdXBkYXRlIHRoZSBjb21taXQgbWVzc2FnZScsXG4gICAgICBkZWZhdWx0OiBjb21taXRNZXNzYWdlLFxuICAgIH0pO1xuXG4gICAgLy8gU3BsaXQgdGhlIG5ldyBtZXNzYWdlIGludG8gdGl0bGUgYW5kIG1lc3NhZ2UuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gR2l0aHViIEFQSSBleHBlY3RzIHRpdGxlIGFuZCBtZXNzYWdlIHRvIGJlIHBhc3NlZCBzZXBhcmF0ZWx5LlxuICAgIGNvbnN0IFtuZXdUaXRsZSwgLi4ubmV3TWVzc2FnZV0gPSByZXN1bHQuc3BsaXQoQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBtZXJnZSBvcHRpb25zIHNvIHRoYXQgdGhlIGNoYW5nZXMgYXJlIHJlZmxlY3RlZCBpbiB0aGVyZS5cbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X3RpdGxlID0gYCR7bmV3VGl0bGV9ICgjJHtwdWxsUmVxdWVzdC5wck51bWJlcn0pYDtcbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X21lc3NhZ2UgPSBuZXdNZXNzYWdlLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb21taXQgbWVzc2FnZSBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gR2l0aHViIGJ5IGRlZmF1bHQgY29uY2F0ZW5hdGVzXG4gICAqIG11bHRpcGxlIGNvbW1pdCBtZXNzYWdlcyBpZiBhIFBSIGlzIG1lcmdlZCBpbiBzcXVhc2ggbW9kZS4gV2UgdHJ5IHRvIHJlcGxpY2F0ZSB0aGlzXG4gICAqIGJlaGF2aW9yIGhlcmUgc28gdGhhdCB3ZSBoYXZlIGEgZGVmYXVsdCBjb21taXQgbWVzc2FnZSB0aGF0IGNhbiBiZSBmaXhlZCB1cC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgY29tbWl0cyA9IChhd2FpdCB0aGlzLl9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHB1bGxSZXF1ZXN0KSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAobWVzc2FnZSA9PiAoe21lc3NhZ2UsIHBhcnNlZDogcGFyc2VDb21taXRNZXNzYWdlKG1lc3NhZ2UpfSkpO1xuICAgIGNvbnN0IG1lc3NhZ2VCYXNlID0gYCR7cHVsbFJlcXVlc3QudGl0bGV9JHtDT01NSVRfSEVBREVSX1NFUEFSQVRPUn1gO1xuICAgIGlmIChjb21taXRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtjb21taXRzWzBdLnBhcnNlZC5ib2R5fWA7XG4gICAgfVxuICAgIGNvbnN0IGpvaW5lZE1lc3NhZ2VzID0gY29tbWl0cy5tYXAoYyA9PiBgKiAke2MubWVzc2FnZX1gKS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtqb2luZWRNZXNzYWdlc31gO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIGNvbW1pdCBtZXNzYWdlcyBvZiBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMoe3ByTnVtYmVyfTogUHVsbFJlcXVlc3QpIHtcbiAgICBjb25zdCByZXF1ZXN0ID0gdGhpcy5naXQuYXBpLnB1bGxzLmxpc3RDb21taXRzLmVuZHBvaW50Lm1lcmdlKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBwdWxsX251bWJlcjogcHJOdW1iZXJ9KTtcbiAgICBjb25zdCBhbGxDb21taXRzOiBQdWxsc0xpc3RDb21taXRzUmVzcG9uc2UgPSBhd2FpdCB0aGlzLmdpdC5hcGkucGFnaW5hdGUocmVxdWVzdCk7XG4gICAgcmV0dXJuIGFsbENvbW1pdHMubWFwKCh7Y29tbWl0fSkgPT4gY29tbWl0Lm1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBnaXZlbiBwdWxsIHJlcXVlc3QgY291bGQgYmUgbWVyZ2VkIGludG8gaXRzIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpZiBpdCB0aGUgUFIgY291bGQgbm90IGJlIG1lcmdlZC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NoZWNrTWVyZ2FiaWxpdHkocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LCB0YXJnZXRCcmFuY2hlczogc3RyaW5nW10pOlxuICAgICAgUHJvbWlzZTxudWxsfFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSB0aGlzLmdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPVxuICAgICAgICB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMsIHtkcnlSdW46IHRydWV9KTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHRoZSBtZXJnZSBhY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIF9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdCh7bGFiZWxzfTogUHVsbFJlcXVlc3QpOiBHaXRodWJBcGlNZXJnZU1ldGhvZCB7XG4gICAgaWYgKHRoaXMuX2NvbmZpZy5sYWJlbHMpIHtcbiAgICAgIGNvbnN0IG1hdGNoaW5nTGFiZWwgPVxuICAgICAgICAgIHRoaXMuX2NvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PiBsYWJlbHMuc29tZShsID0+IG1hdGNoZXNQYXR0ZXJuKGwsIHBhdHRlcm4pKSk7XG4gICAgICBpZiAobWF0Y2hpbmdMYWJlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGluZ0xhYmVsLm1ldGhvZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5kZWZhdWx0O1xuICB9XG59XG4iXX0=