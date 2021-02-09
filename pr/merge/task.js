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
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getTargettedBranchesConfirmationPromptMessage(pullRequest))];
                        case 3:
                            if (!(_b.sent())) {
                                return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                            }
                            _a = pullRequest.hasCaretakerNote;
                            if (!_a) return [3 /*break*/, 5];
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getCaretakerNotePromptMessage(pullRequest))];
                        case 4:
                            _a = !(_b.sent());
                            _b.label = 5;
                        case 5:
                            // If the pull request has a caretaker note applied, raise awareness by prompting
                            // the caretaker. The caretaker can then decide to proceed or abort the merge.
                            if (_a) {
                                return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                            }
                            strategy = this.config.githubApiMerge ?
                                new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                                new autosquash_merge_1.AutosquashMergeStrategy(this.git);
                            previousBranchOrRevision = null;
                            _b.label = 6;
                        case 6:
                            _b.trys.push([6, 10, 11, 12]);
                            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 7:
                            // Run preparations for the merge (e.g. fetching branches).
                            _b.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 8:
                            failure = _b.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranchOrRevision]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 9:
                            _b.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 10:
                            e_1 = _b.sent();
                            // Catch all git command errors and return a merge result w/ git error status code.
                            // Other unknown errors which aren't caused by a git command are re-thrown.
                            if (e_1 instanceof index_1.GitCommandError) {
                                return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                            }
                            throw e_1;
                        case 11:
                            // Always try to restore the branch if possible. We don't want to leave
                            // the repository in a different state than before.
                            if (previousBranchOrRevision !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
                            }
                            return [7 /*endfinally*/];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        };
        return PullRequestMergeTask;
    }());
    exports.PullRequestMergeTask = PullRequestMergeTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFDbEQsb0VBQWlFO0lBR2pFLHlFQUE4QztJQUM5Qyx5RUFBd0c7SUFDeEcsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFvQnRFOzs7O09BSUc7SUFDSDtRQUNFLDhCQUFtQixNQUE2QixFQUFTLEdBQWM7WUFBcEQsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFXO1FBQUcsQ0FBQztRQUUzRTs7OztXQUlHO1FBQ0csb0NBQUssR0FBWCxVQUFZLFFBQWdCLEVBQUUsS0FBYTtZQUFiLHNCQUFBLEVBQUEsYUFBYTs7Ozs7O2dDQUlsQixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFDLE1BQU0sRUFBRSxPQUFPO2dDQUNuRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQ0FDNUIsSUFBSSxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0NBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUNBQ3RCO3lDQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dDQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FDQUM3QjtpQ0FDRjs0QkFDSCxDQUFDLENBQUMsRUFBQTs7NEJBUkksY0FBYyxHQUFHLFNBUXJCOzRCQUVGLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0Isc0JBQU87d0NBQ0wsTUFBTSxzQkFBMEI7d0NBQ2hDLE9BQU8sRUFBRSw2QkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO3FDQUNqRixFQUFDOzZCQUNIOzRCQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dDQUNwQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBRW1CLHFCQUFNLHlDQUEwQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUE7OzRCQUFyRSxXQUFXLEdBQUcsU0FBdUQ7NEJBRTNFLElBQUksQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dDQUMvQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxFQUFDOzZCQUMzRDs0QkFHSSxxQkFBTSx1QkFBYSxDQUFDLHdEQUE2QyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUE7OzRCQUFwRixJQUFJLENBQUMsQ0FBQSxTQUErRSxDQUFBLEVBQUU7Z0NBQ3BGLHNCQUFPLEVBQUMsTUFBTSxzQkFBMEIsRUFBQyxFQUFDOzZCQUMzQzs0QkFLRyxLQUFBLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQTtxQ0FBNUIsd0JBQTRCOzRCQUMzQixxQkFBTSx1QkFBYSxDQUFDLHdDQUE2QixDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUE7OzRCQUFoRSxLQUFBLENBQUMsQ0FBQSxTQUErRCxDQUFBLENBQUE7Ozs0QkFIcEUsaUZBQWlGOzRCQUNqRiw4RUFBOEU7NEJBQzlFLFFBQ3NFO2dDQUNwRSxzQkFBTyxFQUFDLE1BQU0sc0JBQTBCLEVBQUMsRUFBQzs2QkFDM0M7NEJBRUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Z0NBQ3pDLElBQUksa0NBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xFLElBQUksMENBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUl0Qyx3QkFBd0IsR0FBZ0IsSUFBSSxDQUFDOzs7OzRCQUsvQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7NEJBRWpFLDJEQUEyRDs0QkFDM0QscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBRG5DLDJEQUEyRDs0QkFDM0QsU0FBbUMsQ0FBQzs0QkFHcEIscUJBQU0sUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBQTNDLE9BQU8sR0FBRyxTQUFpQzs0QkFDakQsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO2dDQUNwQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxTQUFBLEVBQUMsRUFBQzs2QkFDOUM7NEJBRUQsdUZBQXVGOzRCQUN2Riw4RUFBOEU7NEJBQzlFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7NEJBRTNELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUFuQyxTQUFtQyxDQUFDOzRCQUVwQyxvQ0FBb0M7NEJBQ3BDLHNCQUFPLEVBQUMsTUFBTSxpQkFBcUIsRUFBQyxFQUFDOzs7NEJBRXJDLG1GQUFtRjs0QkFDbkYsMkVBQTJFOzRCQUMzRSxJQUFJLEdBQUMsWUFBWSx1QkFBZSxFQUFFO2dDQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBQ0QsTUFBTSxHQUFDLENBQUM7OzRCQUVSLHVFQUF1RTs0QkFDdkUsbURBQW1EOzRCQUNuRCxJQUFJLHdCQUF3QixLQUFLLElBQUksRUFBRTtnQ0FDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzs2QkFDcEU7Ozs7OztTQUVKO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBakdELElBaUdDO0lBakdZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnQsIEdpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UsIGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIHB1YmxpYyBnaXQ6IEdpdENsaWVudCkge31cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgYW5kIHB1c2hlcyBpdCB1cHN0cmVhbS5cbiAgICogQHBhcmFtIHByTnVtYmVyIFB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gICAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIG5vbi1jcml0aWNhbCBwdWxsIHJlcXVlc3QgZmFpbHVyZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBtZXJnZShwck51bWJlcjogbnVtYmVyLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxNZXJnZVJlc3VsdD4ge1xuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIEdpdGh1YiB0b2tlbiBoYXMgc3VmZmljaWVudCBwZXJtaXNzaW9ucyBmb3Igd3JpdGluZ1xuICAgIC8vIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuIElmIHRoZSByZXBvc2l0b3J5IGlzIG5vdCBwcml2YXRlLCBvbmx5IHRoZVxuICAgIC8vIHJlZHVjZWQgYHB1YmxpY19yZXBvYCBPQXV0aCBzY29wZSBpcyBzdWZmaWNpZW50IGZvciBwZXJmb3JtaW5nIG1lcmdlcy5cbiAgICBjb25zdCBoYXNPYXV0aFNjb3BlcyA9IGF3YWl0IHRoaXMuZ2l0Lmhhc09hdXRoU2NvcGVzKChzY29wZXMsIG1pc3NpbmcpID0+IHtcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCdyZXBvJykpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnJlbW90ZS5wcml2YXRlKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdyZXBvJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNjb3Blcy5pbmNsdWRlcygncHVibGljX3JlcG8nKSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncHVibGljX3JlcG8nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGhhc09hdXRoU2NvcGVzICE9PSB0cnVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6IE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUixcbiAgICAgICAgZmFpbHVyZTogUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShoYXNPYXV0aFNjb3Blcy5lcnJvcilcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVJ9O1xuICAgIH1cblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QodGhpcywgcHJOdW1iZXIsIGZvcmNlKTtcblxuICAgIGlmICghaXNQdWxsUmVxdWVzdChwdWxsUmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmU6IHB1bGxSZXF1ZXN0fTtcbiAgICB9XG5cblxuICAgIGlmICghYXdhaXQgcHJvbXB0Q29uZmlybShnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG5cbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlIGFwcGxpZWQsIHJhaXNlIGF3YXJlbmVzcyBieSBwcm9tcHRpbmdcbiAgICAvLyB0aGUgY2FyZXRha2VyLiBUaGUgY2FyZXRha2VyIGNhbiB0aGVuIGRlY2lkZSB0byBwcm9jZWVkIG9yIGFib3J0IHRoZSBtZXJnZS5cbiAgICBpZiAocHVsbFJlcXVlc3QuaGFzQ2FyZXRha2VyTm90ZSAmJlxuICAgICAgICAhYXdhaXQgcHJvbXB0Q29uZmlybShnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlID9cbiAgICAgICAgbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKSA6XG4gICAgICAgIG5ldyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCk7XG5cbiAgICAvLyBCcmFuY2ggb3IgcmV2aXNpb24gdGhhdCBpcyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIGJhY2sgdG9cbiAgICAvLyBpdCBvbmNlIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLlxuICAgIGxldCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb246IG51bGx8c3RyaW5nID0gbnVsbDtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBBbHdheXMgdHJ5IHRvIHJlc3RvcmUgdGhlIGJyYW5jaCBpZiBwb3NzaWJsZS4gV2UgZG9uJ3Qgd2FudCB0byBsZWF2ZVxuICAgICAgLy8gdGhlIHJlcG9zaXRvcnkgaW4gYSBkaWZmZXJlbnQgc3RhdGUgdGhhbiBiZWZvcmUuXG4gICAgICBpZiAocHJldmlvdXNCcmFuY2hPclJldmlzaW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==