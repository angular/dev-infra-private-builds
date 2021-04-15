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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxxQ0FBZ0M7SUFFaEMseUVBQWlFO0lBR2pFLHlFQUErQztJQUUvQyxxRkFBaUQ7SUFFakQsb0ZBQThEO0lBVTlELHdEQUF3RDtJQUN4RCxJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztJQUV2Qzs7Ozs7O09BTUc7SUFDSDtRQUE0QyxrREFBYTtRQUN2RCxnQ0FBWSxHQUFvQixFQUFVLE9BQXFDO1lBQS9FLFlBQ0Usa0JBQU0sR0FBRyxDQUFDLFNBQ1g7WUFGeUMsYUFBTyxHQUFQLE9BQU8sQ0FBOEI7O1FBRS9FLENBQUM7UUFFSyxzQ0FBSyxHQUFYLFVBQVksV0FBd0I7Ozs7Ozs0QkFDM0Isa0JBQWtCLEdBQ3JCLFdBQVcsbUJBRFUsRUFBRSxRQUFRLEdBQy9CLFdBQVcsU0FEb0IsRUFBRSxjQUFjLEdBQy9DLFdBQVcsZUFEb0MsRUFBRSxlQUFlLEdBQ2hFLFdBQVcsZ0JBRHFELEVBQUUsdUJBQXVCLEdBQ3pGLFdBQVcsd0JBRDhFLENBQzdFOzRCQUNoQixpRkFBaUY7NEJBQ2pGLHlDQUF5Qzs0QkFDekMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLGtCQUFrQixFQUF4QixDQUF3QixDQUFDLEVBQUU7Z0NBQ3ZELHNCQUFPLDZCQUFrQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxFQUFDOzZCQUNuRTs0QkFFRCxxRkFBcUY7NEJBQ3JGLHFGQUFxRjs0QkFDckYsb0ZBQW9GOzRCQUNwRixzRkFBc0Y7NEJBQ3RGLHlDQUF5Qzs0QkFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNB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QUF3QixFQUFFLGNBQXdCOzs7O29CQUUxRSxhQUFhLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUM5RCxjQUFjLEdBQ2hCLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsY0FBYyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7b0JBRXJGLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTt3QkFDekIsc0JBQU8sNkJBQWtCLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFDO3FCQUMxRDtvQkFDRCxzQkFBTyxJQUFJLEVBQUM7OztTQUNiO1FBRUQsK0RBQStEO1FBQ3ZELCtEQUE4QixHQUF0QyxVQUF1QyxFQUFxQjtnQkFBcEIsTUFBTSxZQUFBO1lBQzVDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3ZCLElBQU0sYUFBYSxHQUNmLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQVM7d0JBQVIsT0FBTyxhQUFBO29CQUFNLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLCtCQUFjLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxFQUExQixDQUEwQixDQUFDO2dCQUE1QyxDQUE0QyxDQUFDLENBQUM7Z0JBQzFGLElBQUksYUFBYSxLQUFLLFNBQVMsRUFBRTtvQkFDL0IsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDO2lCQUM3QjthQUNGO1lBQ0QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztRQUM5QixDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBaE1ELENBQTRDLHdCQUFhLEdBZ014RDtJQWhNWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQdWxsc0xpc3RDb21taXRzUmVzcG9uc2UsIFB1bGxzTWVyZ2VQYXJhbXN9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiBBUEkgbWVyZ2Ugc3RyYXRlZ3kuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcge1xuICAvKiogRGVmYXVsdCBtZXRob2QgdXNlZCBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzICovXG4gIGRlZmF1bHQ6IEdpdGh1YkFwaU1lcmdlTWV0aG9kO1xuICAvKiogTGFiZWxzIHdoaWNoIHNwZWNpZnkgYSBkaWZmZXJlbnQgbWVyZ2UgbWV0aG9kIHRoYW4gdGhlIGRlZmF1bHQuICovXG4gIGxhYmVscz86IHtwYXR0ZXJuOiBzdHJpbmcsIG1ldGhvZDogR2l0aHViQXBpTWVyZ2VNZXRob2R9W107XG59XG5cbi8qKiBTZXBhcmF0b3IgYmV0d2VlbiBjb21taXQgbWVzc2FnZSBoZWFkZXIgYW5kIGJvZHkuICovXG5jb25zdCBDT01NSVRfSEVBREVSX1NFUEFSQVRPUiA9ICdcXG5cXG4nO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgcHJpbWFyaWx5IGxldmVyYWdlcyB0aGUgR2l0aHViIEFQSS4gVGhlIHN0cmF0ZWd5IG1lcmdlcyBhIGdpdmVuXG4gKiBwdWxsIHJlcXVlc3QgaW50byBhIHRhcmdldCBicmFuY2ggdXNpbmcgdGhlIEFQSS4gVGhpcyBlbnN1cmVzIHRoYXQgR2l0aHViIGRpc3BsYXlzXG4gKiB0aGUgcHVsbCByZXF1ZXN0IGFzIG1lcmdlZC4gVGhlIG1lcmdlZCBjb21taXRzIGFyZSB0aGVuIGNoZXJyeS1waWNrZWQgaW50byB0aGUgcmVtYWluaW5nXG4gKiB0YXJnZXQgYnJhbmNoZXMgdXNpbmcgdGhlIGxvY2FsIEdpdCBpbnN0YW5jZS4gVGhlIGJlbmVmaXQgaXMgdGhhdCB0aGUgR2l0aHViIG1lcmdlZCBzdGF0ZVxuICogaXMgcHJvcGVybHkgc2V0LCBidXQgYSBub3RhYmxlIGRvd25zaWRlIGlzIHRoYXQgUFJzIGNhbm5vdCB1c2UgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKGdpdDogR2l0Q2xpZW50PHRydWU+LCBwcml2YXRlIF9jb25maWc6IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcpIHtcbiAgICBzdXBlcihnaXQpO1xuICB9XG5cbiAgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtnaXRodWJUYXJnZXRCcmFuY2gsIHByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cH0gPVxuICAgICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGRvZXMgbm90IGhhdmUgaXRzIGJhc2UgYnJhbmNoIHNldCB0byBhbnkgZGV0ZXJtaW5lZCB0YXJnZXRcbiAgICAvLyBicmFuY2gsIHdlIGNhbm5vdCBtZXJnZSB1c2luZyB0aGUgQVBJLlxuICAgIGlmICh0YXJnZXRCcmFuY2hlcy5ldmVyeSh0ID0+IHQgIT09IGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2godGFyZ2V0QnJhbmNoZXMpO1xuICAgIH1cblxuICAgIC8vIEluIGNhc2VzIHdoZXJlIGEgcmVxdWlyZWQgYmFzZSBjb21taXQgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWZcbiAgICAvLyB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuXG4gICAgLy8gVGhpcyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gZS5nLiBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGUgb3duZXJzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMgPSB0YXJnZXRCcmFuY2hlcy5maWx0ZXIoYiA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBQdWxsc01lcmdlUGFyYW1zID0ge1xuICAgICAgcHVsbF9udW1iZXI6IHByTnVtYmVyLFxuICAgICAgbWVyZ2VfbWV0aG9kOiBtZXRob2QsXG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgfTtcblxuICAgIGlmIChuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCkge1xuICAgICAgLy8gQ29tbWl0IG1lc3NhZ2UgZml4dXAgZG9lcyBub3Qgd29yayB3aXRoIG90aGVyIG1lcmdlIG1ldGhvZHMgYXMgdGhlIEdpdGh1YiBBUEkgb25seVxuICAgICAgLy8gYWxsb3dzIGNvbW1pdCBtZXNzYWdlIG1vZGlmaWNhdGlvbnMgZm9yIHNxdWFzaCBtZXJnaW5nLlxuICAgICAgaWYgKG1ldGhvZCAhPT0gJ3NxdWFzaCcpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBtZXJnZVN0YXR1c0NvZGU6IG51bWJlcjtcbiAgICBsZXQgdGFyZ2V0U2hhOiBzdHJpbmc7XG5cbiAgICB0cnkge1xuICAgICAgLy8gTWVyZ2UgdGhlIHB1bGwgcmVxdWVzdCB1c2luZyB0aGUgR2l0aHViIEFQSSBpbnRvIHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5tZXJnZShtZXJnZU9wdGlvbnMpO1xuXG4gICAgICBtZXJnZVN0YXR1c0NvZGUgPSByZXN1bHQuc3RhdHVzO1xuICAgICAgdGFyZ2V0U2hhID0gcmVzdWx0LmRhdGEuc2hhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE5vdGU6IEdpdGh1YiB1c3VhbGx5IHJldHVybnMgYDQwNGAgYXMgc3RhdHVzIGNvZGUgaWYgdGhlIEFQSSByZXF1ZXN0IHVzZXMgYVxuICAgICAgLy8gdG9rZW4gd2l0aCBpbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMuIEdpdGh1YiBkb2VzIHRoaXMgYmVjYXVzZSBpdCBkb2Vzbid0IHdhbnRcbiAgICAgIC8vIHRvIGxlYWsgd2hldGhlciBhIHJlcG9zaXRvcnkgZXhpc3RzIG9yIG5vdC4gSW4gb3VyIGNhc2Ugd2UgZXhwZWN0IGEgY2VydGFpblxuICAgICAgLy8gcmVwb3NpdG9yeSB0byBleGlzdCwgc28gd2UgYWx3YXlzIHRyZWF0IHRoaXMgYXMgYSBwZXJtaXNzaW9uIGZhaWx1cmUuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwMyB8fCBlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI3Jlc3BvbnNlLWlmLW1lcmdlLWNhbm5vdC1iZS1wZXJmb3JtZWRcbiAgICAvLyBQdWxsIHJlcXVlc3QgY2Fubm90IGJlIG1lcmdlZCBkdWUgdG8gbWVyZ2UgY29uZmxpY3RzLlxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgPT09IDQwNSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG4gICAgfVxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmtub3duTWVyZ2VFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBQUiBkb2VzICBub3QgbmVlZCB0byBiZSBtZXJnZWQgaW50byBhbnkgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIHdlIGV4aXQgaGVyZSBhcyB3ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGUgbWVyZ2UuXG4gICAgaWYgKCFjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZWZyZXNoIHRoZSB0YXJnZXQgYnJhbmNoIHRoZSBQUiBoYXMgYmVlbiBtZXJnZWQgaW50byB0aHJvdWdoIHRoZSBBUEkuIFdlIG5lZWRcbiAgICAvLyB0byByZS1mZXRjaCBhcyBvdGhlcndpc2Ugd2UgY2Fubm90IGNoZXJyeS1waWNrIHRoZSBuZXcgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmdcbiAgICAvLyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcblxuICAgIC8vIE51bWJlciBvZiBjb21taXRzIHRoYXQgaGF2ZSBsYW5kZWQgaW4gdGhlIHRhcmdldCBicmFuY2guIFRoaXMgY291bGQgdmFyeSBmcm9tXG4gICAgLy8gdGhlIGNvdW50IG9mIGNvbW1pdHMgaW4gdGhlIFBSIGR1ZSB0byBzcXVhc2hpbmcuXG4gICAgY29uc3QgdGFyZ2V0Q29tbWl0c0NvdW50ID0gbWV0aG9kID09PSAnc3F1YXNoJyA/IDEgOiBwdWxsUmVxdWVzdC5jb21taXRDb3VudDtcblxuICAgIC8vIENoZXJyeSBwaWNrIHRoZSBtZXJnZWQgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmcgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gYXdhaXQgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKFxuICAgICAgICBgJHt0YXJnZXRTaGF9fiR7dGFyZ2V0Q29tbWl0c0NvdW50fS4uJHt0YXJnZXRTaGF9YCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLCB7XG4gICAgICAgICAgLy8gQ29tbWl0cyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoZSBHaXRodWIgQVBJIGRvIG5vdCBuZWNlc3NhcmlseSBjb250YWluXG4gICAgICAgICAgLy8gYSByZWZlcmVuY2UgdG8gdGhlIHNvdXJjZSBwdWxsIHJlcXVlc3QgKHVubGVzcyB0aGUgc3F1YXNoIHN0cmF0ZWd5IGlzIHVzZWQpLlxuICAgICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG9yaWdpbmFsIGNvbW1pdHMgY2FuIGJlIGZvdW5kIHdoZW4gYSBjb21taXQgaXMgdmlld2VkIGluIGFcbiAgICAgICAgICAvLyB0YXJnZXQgYnJhbmNoLCB3ZSBhZGQgYSBsaW5rIHRvIHRoZSBvcmlnaW5hbCBjb21taXRzIHdoZW4gY2hlcnJ5LXBpY2tpbmcuXG4gICAgICAgICAgbGlua1RvT3JpZ2luYWxDb21taXRzOiB0cnVlLFxuICAgICAgICB9KTtcblxuICAgIC8vIFdlIGFscmVhZHkgY2hlY2tlZCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gYnV0IGluIGNhc2UgdGhlIGNoZXJyeS1waWNrIHNvbWVob3cgZmFpbHMsIHdlIHN0aWxsIGhhbmRsZSB0aGUgY29uZmxpY3RzIGhlcmUuIFRoZVxuICAgIC8vIGNvbW1pdHMgY3JlYXRlZCB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGNvdWxkIGJlIGRpZmZlcmVudCAoaS5lLiB0aHJvdWdoIHNxdWFzaCkuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHRoZSBjb21taXQgbWVzc2FnZSBjaGFuZ2VzLiBVbmxpa2UgYXMgaW4gdGhlIGF1dG9zcXVhc2ggbWVyZ2VcbiAgICogc3RyYXRlZ3ksIHdlIGNhbm5vdCBzdGFydCBhbiBpbnRlcmFjdGl2ZSByZWJhc2UgYmVjYXVzZSB3ZSBtZXJnZSB1c2luZyB0aGUgR2l0aHViIEFQSS5cbiAgICogVGhlIEdpdGh1YiBBUEkgb25seSBhbGxvd3MgbW9kaWZpY2F0aW9ucyB0byBQUiB0aXRsZSBhbmQgYm9keSBmb3Igc3F1YXNoIG1lcmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgbWVyZ2VPcHRpb25zOiBQdWxsc01lcmdlUGFyYW1zKSB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCB7cmVzdWx0fSA9IGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7XG4gICAgICB0eXBlOiAnZWRpdG9yJyxcbiAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSB1cGRhdGUgdGhlIGNvbW1pdCBtZXNzYWdlJyxcbiAgICAgIGRlZmF1bHQ6IGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICAvLyBTcGxpdCB0aGUgbmV3IG1lc3NhZ2UgaW50byB0aXRsZSBhbmQgbWVzc2FnZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBHaXRodWIgQVBJIGV4cGVjdHMgdGl0bGUgYW5kIG1lc3NhZ2UgdG8gYmUgcGFzc2VkIHNlcGFyYXRlbHkuXG4gICAgY29uc3QgW25ld1RpdGxlLCAuLi5uZXdNZXNzYWdlXSA9IHJlc3VsdC5zcGxpdChDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lcmdlIG9wdGlvbnMgc28gdGhhdCB0aGUgY2hhbmdlcyBhcmUgcmVmbGVjdGVkIGluIHRoZXJlLlxuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfdGl0bGUgPSBgJHtuZXdUaXRsZX0gKCMke3B1bGxSZXF1ZXN0LnByTnVtYmVyfSlgO1xuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfbWVzc2FnZSA9IG5ld01lc3NhZ2Uuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGNvbW1pdCBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBHaXRodWIgYnkgZGVmYXVsdCBjb25jYXRlbmF0ZXNcbiAgICogbXVsdGlwbGUgY29tbWl0IG1lc3NhZ2VzIGlmIGEgUFIgaXMgbWVyZ2VkIGluIHNxdWFzaCBtb2RlLiBXZSB0cnkgdG8gcmVwbGljYXRlIHRoaXNcbiAgICogYmVoYXZpb3IgaGVyZSBzbyB0aGF0IHdlIGhhdmUgYSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRoYXQgY2FuIGJlIGZpeGVkIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IHRoaXMuX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMocHVsbFJlcXVlc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7bWVzc2FnZSwgcGFyc2VkOiBwYXJzZUNvbW1pdE1lc3NhZ2UobWVzc2FnZSl9KSk7XG4gICAgY29uc3QgbWVzc2FnZUJhc2UgPSBgJHtwdWxsUmVxdWVzdC50aXRsZX0ke0NPTU1JVF9IRUFERVJfU0VQQVJBVE9SfWA7XG4gICAgaWYgKGNvbW1pdHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2NvbW1pdHNbMF0ucGFyc2VkLmJvZHl9YDtcbiAgICB9XG4gICAgY29uc3Qgam9pbmVkTWVzc2FnZXMgPSBjb21taXRzLm1hcChjID0+IGAqICR7Yy5tZXNzYWdlfWApLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2pvaW5lZE1lc3NhZ2VzfWA7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgY29tbWl0IG1lc3NhZ2VzIG9mIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyh7cHJOdW1iZXJ9OiBQdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmdpdC5naXRodWIucHVsbHMubGlzdENvbW1pdHMuZW5kcG9pbnQubWVyZ2UoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIGNvbnN0IGFsbENvbW1pdHM6IFB1bGxzTGlzdENvbW1pdHNSZXNwb25zZSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wYWdpbmF0ZShyZXF1ZXN0KTtcbiAgICByZXR1cm4gYWxsQ29tbWl0cy5tYXAoKHtjb21taXR9KSA9PiBjb21taXQubWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGdpdmVuIHB1bGwgcmVxdWVzdCBjb3VsZCBiZSBtZXJnZWQgaW50byBpdHMgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlmIGl0IHRoZSBQUiBjb3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSk6XG4gICAgICBQcm9taXNlPG51bGx8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IHRoaXMuZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9XG4gICAgICAgIHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcywge2RyeVJ1bjogdHJ1ZX0pO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG1lcmdlIGFjdGlvbiBmcm9tIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHtsYWJlbHN9OiBQdWxsUmVxdWVzdCk6IEdpdGh1YkFwaU1lcmdlTWV0aG9kIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmxhYmVscykge1xuICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9XG4gICAgICAgICAgdGhpcy5fY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+IGxhYmVscy5zb21lKGwgPT4gbWF0Y2hlc1BhdHRlcm4obCwgcGF0dGVybikpKTtcbiAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTGFiZWwubWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmRlZmF1bHQ7XG4gIH1cbn1cbiJdfQ==