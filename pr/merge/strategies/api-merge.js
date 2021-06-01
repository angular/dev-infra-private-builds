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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxxQ0FBZ0M7SUFFaEMseUVBQWlFO0lBR2pFLHlFQUErQztJQUUvQyxxRkFBaUQ7SUFFakQsb0ZBQThEO0lBVTlELHdEQUF3RDtJQUN4RCxJQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztJQUV2Qzs7Ozs7O09BTUc7SUFDSDtRQUE0QyxrREFBYTtRQUN2RCxnQ0FBWSxHQUFvQixFQUFVLE9BQXFDO1lBQS9FLFlBQ0Usa0JBQU0sR0FBRyxDQUFDLFNBQ1g7WUFGeUMsYUFBTyxHQUFQLE9BQU8sQ0FBOEI7O1FBRS9FLENBQUM7UUFFSyxzQ0FBSyxHQUFYLFVBQVksV0FBd0I7Ozs7Ozs0QkFDM0Isa0JBQWtCLEdBQ3JCLFdBQVcsbUJBRFUsRUFBRSxRQUFRLEdBQy9CLFdBQVcsU0FEb0IsRUFBRSxjQUFjLEdBQy9DLFdBQVcsZUFEb0MsRUFBRSxlQUFlLEdBQ2hFLFdBQVcsZ0JBRHFELEVBQUUsdUJBQXVCLEdBQ3pGLFdBQVcsd0JBRDhFLENBQzdFOzRCQUNoQixpRkFBaUY7NEJBQ2pGLHlDQUF5Qzs0QkFDekMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLGtCQUFrQixFQUF4QixDQUF3QixDQUFDLEVBQUU7Z0NBQ3ZELHNCQUFPLDZCQUFrQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxFQUFDOzZCQUNuRTs0QkFFRCxxRkFBcUY7NEJBQ3JGLHFGQUFxRjs0QkFDckYsb0ZBQW9GOzRCQUNwRixzRkFBc0Y7NEJBQ3RGLHlDQUF5Qzs0QkFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNB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QXdCLEVBQUUsY0FBd0I7Ozs7b0JBRTFFLGFBQWEsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7b0JBQzlELGNBQWMsR0FDaEIsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztvQkFFckYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO3dCQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7cUJBQzFEO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRCwrREFBK0Q7UUFDdkQsK0RBQThCLEdBQXRDLFVBQXVDLEVBQXFCO2dCQUFwQixNQUFNLFlBQUE7WUFDNUMsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDdkIsSUFBTSxhQUFhLEdBQ2YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUzt3QkFBUixPQUFPLGFBQUE7b0JBQU0sT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQTFCLENBQTBCLENBQUM7Z0JBQTVDLENBQTRDLENBQUMsQ0FBQztnQkFDMUYsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO29CQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7aUJBQzdCO2FBQ0Y7WUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQzlCLENBQUM7UUFDSCw2QkFBQztJQUFELENBQUMsQUFqTUQsQ0FBNEMsd0JBQWEsR0FpTXhEO0lBak1ZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogQ29uZmlndXJhdGlvbiBmb3IgdGhlIEdpdGh1YiBBUEkgbWVyZ2Ugc3RyYXRlZ3kuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcge1xuICAvKiogRGVmYXVsdCBtZXRob2QgdXNlZCBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzICovXG4gIGRlZmF1bHQ6IEdpdGh1YkFwaU1lcmdlTWV0aG9kO1xuICAvKiogTGFiZWxzIHdoaWNoIHNwZWNpZnkgYSBkaWZmZXJlbnQgbWVyZ2UgbWV0aG9kIHRoYW4gdGhlIGRlZmF1bHQuICovXG4gIGxhYmVscz86IHtwYXR0ZXJuOiBzdHJpbmcsIG1ldGhvZDogR2l0aHViQXBpTWVyZ2VNZXRob2R9W107XG59XG5cbi8qKiBTZXBhcmF0b3IgYmV0d2VlbiBjb21taXQgbWVzc2FnZSBoZWFkZXIgYW5kIGJvZHkuICovXG5jb25zdCBDT01NSVRfSEVBREVSX1NFUEFSQVRPUiA9ICdcXG5cXG4nO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgcHJpbWFyaWx5IGxldmVyYWdlcyB0aGUgR2l0aHViIEFQSS4gVGhlIHN0cmF0ZWd5IG1lcmdlcyBhIGdpdmVuXG4gKiBwdWxsIHJlcXVlc3QgaW50byBhIHRhcmdldCBicmFuY2ggdXNpbmcgdGhlIEFQSS4gVGhpcyBlbnN1cmVzIHRoYXQgR2l0aHViIGRpc3BsYXlzXG4gKiB0aGUgcHVsbCByZXF1ZXN0IGFzIG1lcmdlZC4gVGhlIG1lcmdlZCBjb21taXRzIGFyZSB0aGVuIGNoZXJyeS1waWNrZWQgaW50byB0aGUgcmVtYWluaW5nXG4gKiB0YXJnZXQgYnJhbmNoZXMgdXNpbmcgdGhlIGxvY2FsIEdpdCBpbnN0YW5jZS4gVGhlIGJlbmVmaXQgaXMgdGhhdCB0aGUgR2l0aHViIG1lcmdlZCBzdGF0ZVxuICogaXMgcHJvcGVybHkgc2V0LCBidXQgYSBub3RhYmxlIGRvd25zaWRlIGlzIHRoYXQgUFJzIGNhbm5vdCB1c2UgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKGdpdDogR2l0Q2xpZW50PHRydWU+LCBwcml2YXRlIF9jb25maWc6IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcpIHtcbiAgICBzdXBlcihnaXQpO1xuICB9XG5cbiAgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtnaXRodWJUYXJnZXRCcmFuY2gsIHByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cH0gPVxuICAgICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGRvZXMgbm90IGhhdmUgaXRzIGJhc2UgYnJhbmNoIHNldCB0byBhbnkgZGV0ZXJtaW5lZCB0YXJnZXRcbiAgICAvLyBicmFuY2gsIHdlIGNhbm5vdCBtZXJnZSB1c2luZyB0aGUgQVBJLlxuICAgIGlmICh0YXJnZXRCcmFuY2hlcy5ldmVyeSh0ID0+IHQgIT09IGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2godGFyZ2V0QnJhbmNoZXMpO1xuICAgIH1cblxuICAgIC8vIEluIGNhc2VzIHdoZXJlIGEgcmVxdWlyZWQgYmFzZSBjb21taXQgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWZcbiAgICAvLyB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuXG4gICAgLy8gVGhpcyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gZS5nLiBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGUgb3duZXJzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMgPSB0YXJnZXRCcmFuY2hlcy5maWx0ZXIoYiA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBPY3Rva2l0LlB1bGxzTWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jcmVzcG9uc2UtaWYtbWVyZ2UtY2Fubm90LWJlLXBlcmZvcm1lZFxuICAgIC8vIFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGR1ZSB0byBtZXJnZSBjb25mbGljdHMuXG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSA9PT0gNDA1KSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcbiAgICB9XG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVua25vd25NZXJnZUVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFBSIGRvZXMgIG5vdCBuZWVkIHRvIGJlIG1lcmdlZCBpbnRvIGFueSBvdGhlciB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gd2UgZXhpdCBoZXJlIGFzIHdlIGFscmVhZHkgY29tcGxldGVkIHRoZSBtZXJnZS5cbiAgICBpZiAoIWNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggdGhlIHRhcmdldCBicmFuY2ggdGhlIFBSIGhhcyBiZWVuIG1lcmdlZCBpbnRvIHRocm91Z2ggdGhlIEFQSS4gV2UgbmVlZFxuICAgIC8vIHRvIHJlLWZldGNoIGFzIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2hlcnJ5LXBpY2sgdGhlIG5ldyBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIHRhcmdldCBicmFuY2hlcy5cbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuXG4gICAgLy8gTnVtYmVyIG9mIGNvbW1pdHMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgdGFyZ2V0IGJyYW5jaC4gVGhpcyBjb3VsZCB2YXJ5IGZyb21cbiAgICAvLyB0aGUgY291bnQgb2YgY29tbWl0cyBpbiB0aGUgUFIgZHVlIHRvIHNxdWFzaGluZy5cbiAgICBjb25zdCB0YXJnZXRDb21taXRzQ291bnQgPSBtZXRob2QgPT09ICdzcXVhc2gnID8gMSA6IHB1bGxSZXF1ZXN0LmNvbW1pdENvdW50O1xuXG4gICAgLy8gQ2hlcnJ5IHBpY2sgdGhlIG1lcmdlZCBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMoXG4gICAgICAgIGAke3RhcmdldFNoYX1+JHt0YXJnZXRDb21taXRzQ291bnR9Li4ke3RhcmdldFNoYX1gLCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMsIHtcbiAgICAgICAgICAvLyBDb21taXRzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhlIEdpdGh1YiBBUEkgZG8gbm90IG5lY2Vzc2FyaWx5IGNvbnRhaW5cbiAgICAgICAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgc291cmNlIHB1bGwgcmVxdWVzdCAodW5sZXNzIHRoZSBzcXVhc2ggc3RyYXRlZ3kgaXMgdXNlZCkuXG4gICAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgb3JpZ2luYWwgY29tbWl0cyBjYW4gYmUgZm91bmQgd2hlbiBhIGNvbW1pdCBpcyB2aWV3ZWQgaW4gYVxuICAgICAgICAgIC8vIHRhcmdldCBicmFuY2gsIHdlIGFkZCBhIGxpbmsgdG8gdGhlIG9yaWdpbmFsIGNvbW1pdHMgd2hlbiBjaGVycnktcGlja2luZy5cbiAgICAgICAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgLy8gV2UgYWxyZWFkeSBjaGVja2VkIHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyBidXQgaW4gY2FzZSB0aGUgY2hlcnJ5LXBpY2sgc29tZWhvdyBmYWlscywgd2Ugc3RpbGwgaGFuZGxlIHRoZSBjb25mbGljdHMgaGVyZS4gVGhlXG4gICAgLy8gY29tbWl0cyBjcmVhdGVkIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgY291bGQgYmUgZGlmZmVyZW50IChpLmUuIHRocm91Z2ggc3F1YXNoKS5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgdGhlIGNvbW1pdCBtZXNzYWdlIGNoYW5nZXMuIFVubGlrZSBhcyBpbiB0aGUgYXV0b3NxdWFzaCBtZXJnZVxuICAgKiBzdHJhdGVneSwgd2UgY2Fubm90IHN0YXJ0IGFuIGludGVyYWN0aXZlIHJlYmFzZSBiZWNhdXNlIHdlIG1lcmdlIHVzaW5nIHRoZSBHaXRodWIgQVBJLlxuICAgKiBUaGUgR2l0aHViIEFQSSBvbmx5IGFsbG93cyBtb2RpZmljYXRpb25zIHRvIFBSIHRpdGxlIGFuZCBib2R5IGZvciBzcXVhc2ggbWVyZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQoXG4gICAgICBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9uczogT2N0b2tpdC5QdWxsc01lcmdlUGFyYW1zKSB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCB7cmVzdWx0fSA9IGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7XG4gICAgICB0eXBlOiAnZWRpdG9yJyxcbiAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSB1cGRhdGUgdGhlIGNvbW1pdCBtZXNzYWdlJyxcbiAgICAgIGRlZmF1bHQ6IGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICAvLyBTcGxpdCB0aGUgbmV3IG1lc3NhZ2UgaW50byB0aXRsZSBhbmQgbWVzc2FnZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBHaXRodWIgQVBJIGV4cGVjdHMgdGl0bGUgYW5kIG1lc3NhZ2UgdG8gYmUgcGFzc2VkIHNlcGFyYXRlbHkuXG4gICAgY29uc3QgW25ld1RpdGxlLCAuLi5uZXdNZXNzYWdlXSA9IHJlc3VsdC5zcGxpdChDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lcmdlIG9wdGlvbnMgc28gdGhhdCB0aGUgY2hhbmdlcyBhcmUgcmVmbGVjdGVkIGluIHRoZXJlLlxuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfdGl0bGUgPSBgJHtuZXdUaXRsZX0gKCMke3B1bGxSZXF1ZXN0LnByTnVtYmVyfSlgO1xuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfbWVzc2FnZSA9IG5ld01lc3NhZ2Uuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGNvbW1pdCBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBHaXRodWIgYnkgZGVmYXVsdCBjb25jYXRlbmF0ZXNcbiAgICogbXVsdGlwbGUgY29tbWl0IG1lc3NhZ2VzIGlmIGEgUFIgaXMgbWVyZ2VkIGluIHNxdWFzaCBtb2RlLiBXZSB0cnkgdG8gcmVwbGljYXRlIHRoaXNcbiAgICogYmVoYXZpb3IgaGVyZSBzbyB0aGF0IHdlIGhhdmUgYSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRoYXQgY2FuIGJlIGZpeGVkIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IHRoaXMuX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMocHVsbFJlcXVlc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7bWVzc2FnZSwgcGFyc2VkOiBwYXJzZUNvbW1pdE1lc3NhZ2UobWVzc2FnZSl9KSk7XG4gICAgY29uc3QgbWVzc2FnZUJhc2UgPSBgJHtwdWxsUmVxdWVzdC50aXRsZX0ke0NPTU1JVF9IRUFERVJfU0VQQVJBVE9SfWA7XG4gICAgaWYgKGNvbW1pdHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2NvbW1pdHNbMF0ucGFyc2VkLmJvZHl9YDtcbiAgICB9XG4gICAgY29uc3Qgam9pbmVkTWVzc2FnZXMgPSBjb21taXRzLm1hcChjID0+IGAqICR7Yy5tZXNzYWdlfWApLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2pvaW5lZE1lc3NhZ2VzfWA7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgY29tbWl0IG1lc3NhZ2VzIG9mIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyh7cHJOdW1iZXJ9OiBQdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmdpdC5naXRodWIucHVsbHMubGlzdENvbW1pdHMuZW5kcG9pbnQubWVyZ2UoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIGNvbnN0IGFsbENvbW1pdHM6IE9jdG9raXQuUHVsbHNMaXN0Q29tbWl0c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnBhZ2luYXRlKHJlcXVlc3QpO1xuICAgIHJldHVybiBhbGxDb21taXRzLm1hcCgoe2NvbW1pdH0pID0+IGNvbW1pdC5tZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgZ2l2ZW4gcHVsbCByZXF1ZXN0IGNvdWxkIGJlIG1lcmdlZCBpbnRvIGl0cyB0YXJnZXQgYnJhbmNoZXMuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaWYgaXQgdGhlIFBSIGNvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdKTpcbiAgICAgIFByb21pc2U8bnVsbHxQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gdGhpcy5nZXRQdWxsUmVxdWVzdFJldmlzaW9uUmFuZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID1cbiAgICAgICAgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzLCB7ZHJ5UnVuOiB0cnVlfSk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgbWVyZ2UgYWN0aW9uIGZyb20gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3Qoe2xhYmVsc306IFB1bGxSZXF1ZXN0KTogR2l0aHViQXBpTWVyZ2VNZXRob2Qge1xuICAgIGlmICh0aGlzLl9jb25maWcubGFiZWxzKSB7XG4gICAgICBjb25zdCBtYXRjaGluZ0xhYmVsID1cbiAgICAgICAgICB0aGlzLl9jb25maWcubGFiZWxzLmZpbmQoKHtwYXR0ZXJufSkgPT4gbGFiZWxzLnNvbWUobCA9PiBtYXRjaGVzUGF0dGVybihsLCBwYXR0ZXJuKSkpO1xuICAgICAgaWYgKG1hdGNoaW5nTGFiZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hpbmdMYWJlbC5tZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb25maWcuZGVmYXVsdDtcbiAgfVxufVxuIl19