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
        function PullRequestMergeTask(projectRoot, config, _githubToken) {
            this.projectRoot = projectRoot;
            this.config = config;
            this._githubToken = _githubToken;
            /** Git client that can be used to execute Git commands. */
            this.git = new git_1.GitClient(this._githubToken, { github: this.config.remote });
        }
        /**
         * Merges the given pull request and pushes it upstream.
         * @param prNumber Pull request that should be merged.
         * @param force Whether non-critical pull request failures should be ignored.
         */
        PullRequestMergeTask.prototype.merge = function (prNumber, force) {
            if (force === void 0) { force = false; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var hasOauthScopes, pullRequest, _a, strategy, previousBranch, failure, e_1;
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
                            previousBranch = null;
                            _c.label = 5;
                        case 5:
                            _c.trys.push([5, 9, 10, 11]);
                            previousBranch = this.git.getCurrentBranch();
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
                            this.git.run(['checkout', '-f', previousBranch]);
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
                            if (previousBranch !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranch]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFDbEQsa0VBQTJEO0lBRzNELHlFQUE4QztJQUM5Qyx5RUFBeUQ7SUFDekQsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFFdEUsdURBQXVEO0lBQ3ZELElBQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFvQmpDOzs7O09BSUc7SUFDSDtRQUlFLDhCQUNXLFdBQW1CLEVBQVMsTUFBNkIsRUFDeEQsWUFBb0I7WUFEckIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBUyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUN4RCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUxoQywyREFBMkQ7WUFDM0QsUUFBRyxHQUFHLElBQUksZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBSWxDLENBQUM7UUFFcEM7Ozs7V0FJRztRQUNHLG9DQUFLLEdBQVgsVUFBWSxRQUFnQixFQUFFLEtBQWE7WUFBYixzQkFBQSxFQUFBLGFBQWE7Ozs7OztnQ0FFbEIscUJBQU0sQ0FBQSxLQUFBLElBQUksQ0FBQyxHQUFHLENBQUEsQ0FBQyxjQUFjLDRCQUFJLGVBQWUsSUFBQzs7NEJBQWxFLGNBQWMsR0FBRyxTQUFpRDs0QkFDeEUsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO2dDQUMzQixzQkFBTzt3Q0FDTCxNQUFNLHNCQUEwQjt3Q0FDaEMsT0FBTyxFQUFFLDZCQUFrQixDQUFDLDhCQUE4QixDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUM7cUNBQ2pGLEVBQUM7NkJBQ0g7NEJBRUQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7Z0NBQ3BDLHNCQUFPLEVBQUMsTUFBTSwyQkFBK0IsRUFBQyxFQUFDOzZCQUNoRDs0QkFFbUIscUJBQU0seUNBQTBCLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsRUFBQTs7NEJBQXJFLFdBQVcsR0FBRyxTQUF1RDs0QkFFM0UsSUFBSSxDQUFDLDRCQUFhLENBQUMsV0FBVyxDQUFDLEVBQUU7Z0NBQy9CLHNCQUFPLEVBQUMsTUFBTSxnQkFBb0IsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFDLEVBQUM7NkJBQzNEOzRCQUlHLEtBQUEsV0FBVyxDQUFDLGdCQUFnQixDQUFBO3FDQUE1Qix3QkFBNEI7NEJBQzNCLHFCQUFNLHVCQUFhLENBQ2hCLHdDQUE2QixDQUFDLFdBQVcsQ0FBQyxHQUFHLG1DQUFtQyxDQUFDLEVBQUE7OzRCQURyRixLQUFBLENBQUMsQ0FBQSxTQUNvRixDQUFBLENBQUE7Ozs0QkFKekYsaUZBQWlGOzRCQUNqRiw4RUFBOEU7NEJBQzlFLFFBRTJGO2dDQUN6RixzQkFBTyxFQUFDLE1BQU0sc0JBQTBCLEVBQUMsRUFBQzs2QkFDM0M7NEJBRUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Z0NBQ3pDLElBQUksa0NBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xFLElBQUksMENBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUl0QyxjQUFjLEdBQWdCLElBQUksQ0FBQzs7Ozs0QkFLckMsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs0QkFFN0MsMkRBQTJEOzRCQUMzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFEbkMsMkRBQTJEOzRCQUMzRCxTQUFtQyxDQUFDOzRCQUdwQixxQkFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFBM0MsT0FBTyxHQUFHLFNBQWlDOzRCQUNqRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0NBQ3BCLHNCQUFPLEVBQUMsTUFBTSxnQkFBb0IsRUFBRSxPQUFPLFNBQUEsRUFBQyxFQUFDOzZCQUM5Qzs0QkFFRCx1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7NEJBRWpELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUFuQyxTQUFtQyxDQUFDOzRCQUVwQyxvQ0FBb0M7NEJBQ3BDLHNCQUFPLEVBQUMsTUFBTSxpQkFBcUIsRUFBQyxFQUFDOzs7NEJBRXJDLG1GQUFtRjs0QkFDbkYsMkVBQTJFOzRCQUMzRSxJQUFJLEdBQUMsWUFBWSxxQkFBZSxFQUFFO2dDQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBQ0QsTUFBTSxHQUFDLENBQUM7OzRCQUVSLHVFQUF1RTs0QkFDdkUsbURBQW1EOzRCQUNuRCxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0NBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDOzZCQUMxRDs7Ozs7O1NBRUo7UUFDSCwyQkFBQztJQUFELENBQUMsQUF0RkQsSUFzRkM7SUF0Rlksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudCwgR2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIEdpdGh1YiBPQXV0aCBzY29wZXMgcmVxdWlyZWQgZm9yIHRoZSBtZXJnZSB0YXNrLiAqL1xuY29uc3QgUkVRVUlSRURfU0NPUEVTID0gWydyZXBvJ107XG5cbi8qKiBEZXNjcmliZXMgdGhlIHN0YXR1cyBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIE1lcmdlU3RhdHVzIHtcbiAgVU5LTk9XTl9HSVRfRVJST1IsXG4gIERJUlRZX1dPUktJTkdfRElSLFxuICBTVUNDRVNTLFxuICBGQUlMRUQsXG4gIFVTRVJfQUJPUlRFRCxcbiAgR0lUSFVCX0VSUk9SLFxufVxuXG4vKiogUmVzdWx0IG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZVJlc3VsdCB7XG4gIC8qKiBPdmVyYWxsIHN0YXR1cyBvZiB0aGUgbWVyZ2UuICovXG4gIHN0YXR1czogTWVyZ2VTdGF0dXM7XG4gIC8qKiBMaXN0IG9mIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gKi9cbiAgZmFpbHVyZT86IFB1bGxSZXF1ZXN0RmFpbHVyZTtcbn1cblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFjY2VwdHMgYSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbiBhbmQgR2l0aHViIHRva2VuLiBJdCBwcm92aWRlc1xuICogYSBwcm9ncmFtbWF0aWMgaW50ZXJmYWNlIGZvciBtZXJnaW5nIG11bHRpcGxlIHB1bGwgcmVxdWVzdHMgYmFzZWQgb24gdGhlaXJcbiAqIGxhYmVscyB0aGF0IGhhdmUgYmVlbiByZXNvbHZlZCB0aHJvdWdoIHRoZSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrIHtcbiAgLyoqIEdpdCBjbGllbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBleGVjdXRlIEdpdCBjb21tYW5kcy4gKi9cbiAgZ2l0ID0gbmV3IEdpdENsaWVudCh0aGlzLl9naXRodWJUb2tlbiwge2dpdGh1YjogdGhpcy5jb25maWcucmVtb3RlfSk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcHJvamVjdFJvb3Q6IHN0cmluZywgcHVibGljIGNvbmZpZzogTWVyZ2VDb25maWdXaXRoUmVtb3RlLFxuICAgICAgcHJpdmF0ZSBfZ2l0aHViVG9rZW46IHN0cmluZykge31cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgYW5kIHB1c2hlcyBpdCB1cHN0cmVhbS5cbiAgICogQHBhcmFtIHByTnVtYmVyIFB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gICAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIG5vbi1jcml0aWNhbCBwdWxsIHJlcXVlc3QgZmFpbHVyZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBtZXJnZShwck51bWJlcjogbnVtYmVyLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxNZXJnZVJlc3VsdD4ge1xuICAgIC8vIEFzc2VydCB0aGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaGFzIGFjY2VzcyBvbiB0aGUgcmVxdWlyZWQgc2NvcGVzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoLi4uUkVRVUlSRURfU0NPUEVTKTtcbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZCwgcmFpc2UgYXdhcmVuZXNzIGJ5IHByb21wdGluZ1xuICAgIC8vIHRoZSBjYXJldGFrZXIuIFRoZSBjYXJldGFrZXIgY2FuIHRoZW4gZGVjaWRlIHRvIHByb2NlZWQgb3IgYWJvcnQgdGhlIG1lcmdlLlxuICAgIGlmIChwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKFxuICAgICAgICAgICAgZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpICsgYFxcbkRvIHlvdSB3YW50IHRvIHByb2NlZWQgbWVyZ2luZz9gKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSA/XG4gICAgICAgIG5ldyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0LCB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSkgOlxuICAgICAgICBuZXcgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kodGhpcy5naXQpO1xuXG4gICAgLy8gQnJhbmNoIHRoYXQgaXMgY3VycmVudGx5IGNoZWNrZWQgb3V0IHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBiYWNrIHRvIGl0IG9uY2VcbiAgICAvLyB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC5cbiAgICBsZXQgcHJldmlvdXNCcmFuY2g6IG51bGx8c3RyaW5nID0gbnVsbDtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIHByZXZpb3VzQnJhbmNoID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaCgpO1xuXG4gICAgICAvLyBSdW4gcHJlcGFyYXRpb25zIGZvciB0aGUgbWVyZ2UgKGUuZy4gZmV0Y2hpbmcgYnJhbmNoZXMpLlxuICAgICAgYXdhaXQgc3RyYXRlZ3kucHJlcGFyZShwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGFuZCBjYXB0dXJlIHBvdGVudGlhbCBmYWlsdXJlcy5cbiAgICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCBzdHJhdGVneS5tZXJnZShwdWxsUmVxdWVzdCk7XG4gICAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlfTtcbiAgICAgIH1cblxuICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIGJyYW5jaC4gV2UgbmVlZCB0byBkbyB0aGlzIGJlZm9yZSBkZWxldGluZyB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyBicmFuY2hlcyBiZWNhdXNlIHdlIGNhbm5vdCBkZWxldGUgYnJhbmNoZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBjaGVja2VkIG91dC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hdKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBBbHdheXMgdHJ5IHRvIHJlc3RvcmUgdGhlIGJyYW5jaCBpZiBwb3NzaWJsZS4gV2UgZG9uJ3Qgd2FudCB0byBsZWF2ZVxuICAgICAgLy8gdGhlIHJlcG9zaXRvcnkgaW4gYSBkaWZmZXJlbnQgc3RhdGUgdGhhbiBiZWZvcmUuXG4gICAgICBpZiAocHJldmlvdXNCcmFuY2ggIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=