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
        define("@angular/dev-infra-private/pr/merge/task", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/messages", "@angular/dev-infra-private/pr/merge/pull-request", "@angular/dev-infra-private/pr/merge/strategies/api-merge", "@angular/dev-infra-private/pr/merge/strategies/autosquash-merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullRequestMergeTask = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var messages_1 = require("@angular/dev-infra-private/pr/merge/messages");
    var pull_request_1 = require("@angular/dev-infra-private/pr/merge/pull-request");
    var api_merge_1 = require("@angular/dev-infra-private/pr/merge/strategies/api-merge");
    var autosquash_merge_1 = require("@angular/dev-infra-private/pr/merge/strategies/autosquash-merge");
    /**
     * Class that accepts a merge script configuration and Github token. It provides
     * a programmatic interface for merging multiple pull requests based on their
     * labels that have been resolved through the merge script configuration.
     */
    var PullRequestMergeTask = /** @class */ (function () {
        function PullRequestMergeTask(config, git) {
            this.config = config;
            this.git = git;
        }
        /**
         * Merges the given pull request and pushes it upstream.
         * @param prNumber Pull request that should be merged.
         * @param force Whether non-critical pull request failures should be ignored.
         */
        PullRequestMergeTask.prototype.merge = function (prNumber, force) {
            if (force === void 0) { force = false; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var hasOauthScopes, pullRequest, _a, strategy, previousBranchOrRevision, failure, e_1;
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this.git.hasOauthScopes(function (scopes, missing) {
                                if (!scopes.includes('repo')) {
                                    if (_this.config.remote.private) {
                                        missing.push('repo');
                                    }
                                    else if (!scopes.includes('public_repo')) {
                                        missing.push('public_repo');
                                    }
                                }
                            })];
                        case 1:
                            hasOauthScopes = _b.sent();
                            if (hasOauthScopes !== true) {
                                return [2 /*return*/, {
                                        status: 5 /* GITHUB_ERROR */,
                                        failure: failures_1.PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error)
                                    }];
                            }
                            if (this.git.hasUncommittedChanges()) {
                                return [2 /*return*/, { status: 1 /* DIRTY_WORKING_DIR */ }];
                            }
                            return [4 /*yield*/, pull_request_1.loadAndValidatePullRequest(this, prNumber, force)];
                        case 2:
                            pullRequest = _b.sent();
                            if (!pull_request_1.isPullRequest(pullRequest)) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: pullRequest }];
                            }
                            _a = pullRequest.hasCaretakerNote;
                            if (!_a) return [3 /*break*/, 4];
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getCaretakerNotePromptMessage(pullRequest) + "\nDo you want to proceed merging?")];
                        case 3:
                            _a = !(_b.sent());
                            _b.label = 4;
                        case 4:
                            // If the pull request has a caretaker note applied, raise awareness by prompting
                            // the caretaker. The caretaker can then decide to proceed or abort the merge.
                            if (_a) {
                                return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                            }
                            strategy = this.config.githubApiMerge ?
                                new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                                new autosquash_merge_1.AutosquashMergeStrategy(this.git);
                            previousBranchOrRevision = null;
                            _b.label = 5;
                        case 5:
                            _b.trys.push([5, 9, 10, 11]);
                            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 6:
                            // Run preparations for the merge (e.g. fetching branches).
                            _b.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 7:
                            failure = _b.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranchOrRevision]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 8:
                            _b.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 9:
                            e_1 = _b.sent();
                            // Catch all git command errors and return a merge result w/ git error status code.
                            // Other unknown errors which aren't caused by a git command are re-thrown.
                            if (e_1 instanceof git_1.GitCommandError) {
                                return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                            }
                            throw e_1;
                        case 10:
                            // Always try to restore the branch if possible. We don't want to leave
                            // the repository in a different state than before.
                            if (previousBranchOrRevision !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
                            }
                            return [7 /*endfinally*/];
                        case 11: return [2 /*return*/];
                    }
                });
            });
        };
        return PullRequestMergeTask;
    }());
    exports.PullRequestMergeTask = PullRequestMergeTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFDbEQsa0VBQTJEO0lBRzNELHlFQUE4QztJQUM5Qyx5RUFBeUQ7SUFDekQsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFvQnRFOzs7O09BSUc7SUFDSDtRQUNFLDhCQUFtQixNQUE2QixFQUFTLEdBQWM7WUFBcEQsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFXO1FBQUcsQ0FBQztRQUUzRTs7OztXQUlHO1FBQ0csb0NBQUssR0FBWCxVQUFZLFFBQWdCLEVBQUUsS0FBYTtZQUFiLHNCQUFBLEVBQUEsYUFBYTs7Ozs7O2dDQUlsQixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFDLE1BQU0sRUFBRSxPQUFPO2dDQUNuRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQ0FDNUIsSUFBSSxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0NBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUNBQ3RCO3lDQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dDQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FDQUM3QjtpQ0FDRjs0QkFDSCxDQUFDLENBQUMsRUFBQTs7NEJBUkksY0FBYyxHQUFHLFNBUXJCOzRCQUVGLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0Isc0JBQU87d0NBQ0wsTUFBTSxzQkFBMEI7d0NBQ2hDLE9BQU8sRUFBRSw2QkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO3FDQUNqRixFQUFDOzZCQUNIOzRCQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dDQUNwQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBRW1CLHFCQUFNLHlDQUEwQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUE7OzRCQUFyRSxXQUFXLEdBQUcsU0FBdUQ7NEJBRTNFLElBQUksQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dDQUMvQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxFQUFDOzZCQUMzRDs0QkFJRyxLQUFBLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQTtxQ0FBNUIsd0JBQTRCOzRCQUMzQixxQkFBTSx1QkFBYSxDQUNoQix3Q0FBNkIsQ0FBQyxXQUFXLENBQUMsR0FBRyxtQ0FBbUMsQ0FBQyxFQUFBOzs0QkFEckYsS0FBQSxDQUFDLENBQUEsU0FDb0YsQ0FBQSxDQUFBOzs7NEJBSnpGLGlGQUFpRjs0QkFDakYsOEVBQThFOzRCQUM5RSxRQUUyRjtnQ0FDekYsc0JBQU8sRUFBQyxNQUFNLHNCQUEwQixFQUFDLEVBQUM7NkJBQzNDOzRCQUVLLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2dDQUN6QyxJQUFJLGtDQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dDQUNsRSxJQUFJLDBDQUF1QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs0QkFJdEMsd0JBQXdCLEdBQWdCLElBQUksQ0FBQzs7Ozs0QkFLL0Msd0JBQXdCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDOzRCQUVqRSwyREFBMkQ7NEJBQzNELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQURuQywyREFBMkQ7NEJBQzNELFNBQW1DLENBQUM7NEJBR3BCLHFCQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUEzQyxPQUFPLEdBQUcsU0FBaUM7NEJBQ2pELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtnQ0FDcEIsc0JBQU8sRUFBQyxNQUFNLGdCQUFvQixFQUFFLE9BQU8sU0FBQSxFQUFDLEVBQUM7NkJBQzlDOzRCQUVELHVGQUF1Rjs0QkFDdkYsOEVBQThFOzRCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOzRCQUUzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFBbkMsU0FBbUMsQ0FBQzs0QkFFcEMsb0NBQW9DOzRCQUNwQyxzQkFBTyxFQUFDLE1BQU0saUJBQXFCLEVBQUMsRUFBQzs7OzRCQUVyQyxtRkFBbUY7NEJBQ25GLDJFQUEyRTs0QkFDM0UsSUFBSSxHQUFDLFlBQVkscUJBQWUsRUFBRTtnQ0FDaEMsc0JBQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLEVBQUM7NkJBQ2hEOzRCQUNELE1BQU0sR0FBQyxDQUFDOzs0QkFFUix1RUFBdUU7NEJBQ3ZFLG1EQUFtRDs0QkFDbkQsSUFBSSx3QkFBd0IsS0FBSyxJQUFJLEVBQUU7Z0NBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7NkJBQ3BFOzs7Ozs7U0FFSjtRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQTVGRCxJQTRGQztJQTVGWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50LCBHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cbmltcG9ydCB7TWVyZ2VDb25maWcsIE1lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIHB1YmxpYyBnaXQ6IEdpdENsaWVudCkge31cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgYW5kIHB1c2hlcyBpdCB1cHN0cmVhbS5cbiAgICogQHBhcmFtIHByTnVtYmVyIFB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gICAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIG5vbi1jcml0aWNhbCBwdWxsIHJlcXVlc3QgZmFpbHVyZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBtZXJnZShwck51bWJlcjogbnVtYmVyLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxNZXJnZVJlc3VsdD4ge1xuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIEdpdGh1YiB0b2tlbiBoYXMgc3VmZmljaWVudCBwZXJtaXNzaW9ucyBmb3Igd3JpdGluZ1xuICAgIC8vIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuIElmIHRoZSByZXBvc2l0b3J5IGlzIG5vdCBwcml2YXRlLCBvbmx5IHRoZVxuICAgIC8vIHJlZHVjZWQgYHB1YmxpY19yZXBvYCBPQXV0aCBzY29wZSBpcyBzdWZmaWNpZW50IGZvciBwZXJmb3JtaW5nIG1lcmdlcy5cbiAgICBjb25zdCBoYXNPYXV0aFNjb3BlcyA9IGF3YWl0IHRoaXMuZ2l0Lmhhc09hdXRoU2NvcGVzKChzY29wZXMsIG1pc3NpbmcpID0+IHtcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCdyZXBvJykpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnJlbW90ZS5wcml2YXRlKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdyZXBvJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNjb3Blcy5pbmNsdWRlcygncHVibGljX3JlcG8nKSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncHVibGljX3JlcG8nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGhhc09hdXRoU2NvcGVzICE9PSB0cnVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6IE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUixcbiAgICAgICAgZmFpbHVyZTogUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShoYXNPYXV0aFNjb3Blcy5lcnJvcilcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVJ9O1xuICAgIH1cblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QodGhpcywgcHJOdW1iZXIsIGZvcmNlKTtcblxuICAgIGlmICghaXNQdWxsUmVxdWVzdChwdWxsUmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmU6IHB1bGxSZXF1ZXN0fTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlIGFwcGxpZWQsIHJhaXNlIGF3YXJlbmVzcyBieSBwcm9tcHRpbmdcbiAgICAvLyB0aGUgY2FyZXRha2VyLiBUaGUgY2FyZXRha2VyIGNhbiB0aGVuIGRlY2lkZSB0byBwcm9jZWVkIG9yIGFib3J0IHRoZSBtZXJnZS5cbiAgICBpZiAocHVsbFJlcXVlc3QuaGFzQ2FyZXRha2VyTm90ZSAmJlxuICAgICAgICAhYXdhaXQgcHJvbXB0Q29uZmlybShcbiAgICAgICAgICAgIGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSArIGBcXG5EbyB5b3Ugd2FudCB0byBwcm9jZWVkIG1lcmdpbmc/YCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UgP1xuICAgICAgICBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpIDpcbiAgICAgICAgbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCBvciByZXZpc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0b1xuICAgIC8vIGl0IG9uY2UgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgbGV0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbjogbnVsbHxzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayBydW5zIEdpdCBjb21tYW5kcyBhcyBjaGlsZCBwcm9jZXNzZXMuIFRoZXNlIEdpdCBjb21tYW5kcyBjYW4gZmFpbC5cbiAgICAvLyBXZSB3YW50IHRvIGNhcHR1cmUgdGhlc2UgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhbiBhcHByb3ByaWF0ZSBtZXJnZSByZXF1ZXN0IHN0YXR1cy5cbiAgICB0cnkge1xuICAgICAgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuXG4gICAgICBhd2FpdCBzdHJhdGVneS5jbGVhbnVwKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUmV0dXJuIGEgc3VjY2Vzc2Z1bCBtZXJnZSBzdGF0dXMuXG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuU1VDQ0VTU307XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggYWxsIGdpdCBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGEgbWVyZ2UgcmVzdWx0IHcvIGdpdCBlcnJvciBzdGF0dXMgY29kZS5cbiAgICAgIC8vIE90aGVyIHVua25vd24gZXJyb3JzIHdoaWNoIGFyZW4ndCBjYXVzZWQgYnkgYSBnaXQgY29tbWFuZCBhcmUgcmUtdGhyb3duLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIEFsd2F5cyB0cnkgdG8gcmVzdG9yZSB0aGUgYnJhbmNoIGlmIHBvc3NpYmxlLiBXZSBkb24ndCB3YW50IHRvIGxlYXZlXG4gICAgICAvLyB0aGUgcmVwb3NpdG9yeSBpbiBhIGRpZmZlcmVudCBzdGF0ZSB0aGFuIGJlZm9yZS5cbiAgICAgIGlmIChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19