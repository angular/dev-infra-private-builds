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
    /** Github OAuth scopes required for the merge task. */
    var REQUIRED_SCOPES = ['repo'];
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
                var _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, (_b = this.git).hasOauthScopes.apply(_b, tslib_1.__spread(REQUIRED_SCOPES))];
                        case 1:
                            hasOauthScopes = _c.sent();
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
                            pullRequest = _c.sent();
                            if (!pull_request_1.isPullRequest(pullRequest)) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: pullRequest }];
                            }
                            _a = pullRequest.hasCaretakerNote;
                            if (!_a) return [3 /*break*/, 4];
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getCaretakerNotePromptMessage(pullRequest) + "\nDo you want to proceed merging?")];
                        case 3:
                            _a = !(_c.sent());
                            _c.label = 4;
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
                            _c.label = 5;
                        case 5:
                            _c.trys.push([5, 9, 10, 11]);
                            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 6:
                            // Run preparations for the merge (e.g. fetching branches).
                            _c.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 7:
                            failure = _c.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranchOrRevision]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 8:
                            _c.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 9:
                            e_1 = _c.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFDbEQsa0VBQTJEO0lBRzNELHlFQUE4QztJQUM5Qyx5RUFBeUQ7SUFDekQsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFFdEUsdURBQXVEO0lBQ3ZELElBQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFvQmpDOzs7O09BSUc7SUFDSDtRQUNFLDhCQUFtQixNQUE2QixFQUFTLEdBQWM7WUFBcEQsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFBUyxRQUFHLEdBQUgsR0FBRyxDQUFXO1FBQUcsQ0FBQztRQUUzRTs7OztXQUlHO1FBQ0csb0NBQUssR0FBWCxVQUFZLFFBQWdCLEVBQUUsS0FBYTtZQUFiLHNCQUFBLEVBQUEsYUFBYTs7Ozs7O2dDQUVsQixxQkFBTSxDQUFBLEtBQUEsSUFBSSxDQUFDLEdBQUcsQ0FBQSxDQUFDLGNBQWMsNEJBQUksZUFBZSxJQUFDOzs0QkFBbEUsY0FBYyxHQUFHLFNBQWlEOzRCQUN4RSxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0NBQzNCLHNCQUFPO3dDQUNMLE1BQU0sc0JBQTBCO3dDQUNoQyxPQUFPLEVBQUUsNkJBQWtCLENBQUMsOEJBQThCLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztxQ0FDakYsRUFBQzs2QkFDSDs0QkFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRTtnQ0FDcEMsc0JBQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLEVBQUM7NkJBQ2hEOzRCQUVtQixxQkFBTSx5Q0FBMEIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFBOzs0QkFBckUsV0FBVyxHQUFHLFNBQXVEOzRCQUUzRSxJQUFJLENBQUMsNEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQ0FDL0Isc0JBQU8sRUFBQyxNQUFNLGdCQUFvQixFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUMsRUFBQzs2QkFDM0Q7NEJBSUcsS0FBQSxXQUFXLENBQUMsZ0JBQWdCLENBQUE7cUNBQTVCLHdCQUE0Qjs0QkFDM0IscUJBQU0sdUJBQWEsQ0FDaEIsd0NBQTZCLENBQUMsV0FBVyxDQUFDLEdBQUcsbUNBQW1DLENBQUMsRUFBQTs7NEJBRHJGLEtBQUEsQ0FBQyxDQUFBLFNBQ29GLENBQUEsQ0FBQTs7OzRCQUp6RixpRkFBaUY7NEJBQ2pGLDhFQUE4RTs0QkFDOUUsUUFFMkY7Z0NBQ3pGLHNCQUFPLEVBQUMsTUFBTSxzQkFBMEIsRUFBQyxFQUFDOzZCQUMzQzs0QkFFSyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQ0FDekMsSUFBSSxrQ0FBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQ0FDbEUsSUFBSSwwQ0FBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBSXRDLHdCQUF3QixHQUFnQixJQUFJLENBQUM7Ozs7NEJBSy9DLHdCQUF3QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQzs0QkFFakUsMkRBQTJEOzRCQUMzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFEbkMsMkRBQTJEOzRCQUMzRCxTQUFtQyxDQUFDOzRCQUdwQixxQkFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFBM0MsT0FBTyxHQUFHLFNBQWlDOzRCQUNqRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0NBQ3BCLHNCQUFPLEVBQUMsTUFBTSxnQkFBb0IsRUFBRSxPQUFPLFNBQUEsRUFBQyxFQUFDOzZCQUM5Qzs0QkFFRCx1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzs0QkFFM0QscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBQW5DLFNBQW1DLENBQUM7NEJBRXBDLG9DQUFvQzs0QkFDcEMsc0JBQU8sRUFBQyxNQUFNLGlCQUFxQixFQUFDLEVBQUM7Ozs0QkFFckMsbUZBQW1GOzRCQUNuRiwyRUFBMkU7NEJBQzNFLElBQUksR0FBQyxZQUFZLHFCQUFlLEVBQUU7Z0NBQ2hDLHNCQUFPLEVBQUMsTUFBTSwyQkFBK0IsRUFBQyxFQUFDOzZCQUNoRDs0QkFDRCxNQUFNLEdBQUMsQ0FBQzs7NEJBRVIsdUVBQXVFOzRCQUN2RSxtREFBbUQ7NEJBQ25ELElBQUksd0JBQXdCLEtBQUssSUFBSSxFQUFFO2dDQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOzZCQUNwRTs7Ozs7O1NBRUo7UUFDSCwyQkFBQztJQUFELENBQUMsQUFqRkQsSUFpRkM7SUFqRlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudCwgR2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnLCBNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2V9IGZyb20gJy4vbWVzc2FnZXMnO1xuaW1wb3J0IHtpc1B1bGxSZXF1ZXN0LCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCx9IGZyb20gJy4vcHVsbC1yZXF1ZXN0JztcbmltcG9ydCB7R2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2FwaS1tZXJnZSc7XG5pbXBvcnQge0F1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXV0b3NxdWFzaC1tZXJnZSc7XG5cbi8qKiBHaXRodWIgT0F1dGggc2NvcGVzIHJlcXVpcmVkIGZvciB0aGUgbWVyZ2UgdGFzay4gKi9cbmNvbnN0IFJFUVVJUkVEX1NDT1BFUyA9IFsncmVwbyddO1xuXG4vKiogRGVzY3JpYmVzIHRoZSBzdGF0dXMgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgY29uc3QgZW51bSBNZXJnZVN0YXR1cyB7XG4gIFVOS05PV05fR0lUX0VSUk9SLFxuICBESVJUWV9XT1JLSU5HX0RJUixcbiAgU1VDQ0VTUyxcbiAgRkFJTEVELFxuICBVU0VSX0FCT1JURUQsXG4gIEdJVEhVQl9FUlJPUixcbn1cblxuLyoqIFJlc3VsdCBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VSZXN1bHQge1xuICAvKiogT3ZlcmFsbCBzdGF0dXMgb2YgdGhlIG1lcmdlLiAqL1xuICBzdGF0dXM6IE1lcmdlU3RhdHVzO1xuICAvKiogTGlzdCBvZiBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuICovXG4gIGZhaWx1cmU/OiBQdWxsUmVxdWVzdEZhaWx1cmU7XG59XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBhY2NlcHRzIGEgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24gYW5kIEdpdGh1YiB0b2tlbi4gSXQgcHJvdmlkZXNcbiAqIGEgcHJvZ3JhbW1hdGljIGludGVyZmFjZSBmb3IgbWVyZ2luZyBtdWx0aXBsZSBwdWxsIHJlcXVlc3RzIGJhc2VkIG9uIHRoZWlyXG4gKiBsYWJlbHMgdGhhdCBoYXZlIGJlZW4gcmVzb2x2ZWQgdGhyb3VnaCB0aGUgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdE1lcmdlVGFzayB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSwgcHVibGljIGdpdDogR2l0Q2xpZW50KSB7fVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgLy8gQXNzZXJ0IHRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudCBoYXMgYWNjZXNzIG9uIHRoZSByZXF1aXJlZCBzY29wZXMuXG4gICAgY29uc3QgaGFzT2F1dGhTY29wZXMgPSBhd2FpdCB0aGlzLmdpdC5oYXNPYXV0aFNjb3BlcyguLi5SRVFVSVJFRF9TQ09QRVMpO1xuICAgIGlmIChoYXNPYXV0aFNjb3BlcyAhPT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1IsXG4gICAgICAgIGZhaWx1cmU6IFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoaGFzT2F1dGhTY29wZXMuZXJyb3IpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSfTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KHRoaXMsIHByTnVtYmVyLCBmb3JjZSk7XG5cbiAgICBpZiAoIWlzUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlOiBwdWxsUmVxdWVzdH07XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZSBhcHBsaWVkLCByYWlzZSBhd2FyZW5lc3MgYnkgcHJvbXB0aW5nXG4gICAgLy8gdGhlIGNhcmV0YWtlci4gVGhlIGNhcmV0YWtlciBjYW4gdGhlbiBkZWNpZGUgdG8gcHJvY2VlZCBvciBhYm9ydCB0aGUgbWVyZ2UuXG4gICAgaWYgKHB1bGxSZXF1ZXN0Lmhhc0NhcmV0YWtlck5vdGUgJiZcbiAgICAgICAgIWF3YWl0IHByb21wdENvbmZpcm0oXG4gICAgICAgICAgICBnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkgKyBgXFxuRG8geW91IHdhbnQgdG8gcHJvY2VlZCBtZXJnaW5nP2ApKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlID9cbiAgICAgICAgbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKSA6XG4gICAgICAgIG5ldyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCk7XG5cbiAgICAvLyBCcmFuY2ggb3IgcmV2aXNpb24gdGhhdCBpcyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIGJhY2sgdG9cbiAgICAvLyBpdCBvbmNlIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLlxuICAgIGxldCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb246IG51bGx8c3RyaW5nID0gbnVsbDtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBBbHdheXMgdHJ5IHRvIHJlc3RvcmUgdGhlIGJyYW5jaCBpZiBwb3NzaWJsZS4gV2UgZG9uJ3Qgd2FudCB0byBsZWF2ZVxuICAgICAgLy8gdGhlIHJlcG9zaXRvcnkgaW4gYSBkaWZmZXJlbnQgc3RhdGUgdGhhbiBiZWZvcmUuXG4gICAgICBpZiAocHJldmlvdXNCcmFuY2hPclJldmlzaW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==