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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFDbEQsa0VBQTJEO0lBRzNELHlFQUE4QztJQUM5Qyx5RUFBeUQ7SUFDekQsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFvQnRFOzs7O09BSUc7SUFDSDtRQUlFLDhCQUNXLFdBQW1CLEVBQVMsTUFBNkIsRUFDeEQsWUFBb0I7WUFEckIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBUyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUN4RCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUxoQywyREFBMkQ7WUFDM0QsUUFBRyxHQUFHLElBQUksZUFBUyxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO1FBSWxDLENBQUM7UUFFcEM7Ozs7V0FJRztRQUNHLG9DQUFLLEdBQVgsVUFBWSxRQUFnQixFQUFFLEtBQWE7WUFBYixzQkFBQSxFQUFBLGFBQWE7Ozs7OztnQ0FJbEIscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBQyxNQUFNLEVBQUUsT0FBTztnQ0FDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7b0NBQzVCLElBQUksS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO3dDQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO3FDQUN0Qjt5Q0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTt3Q0FDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FB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QkFBQztJQUFELENBQUMsQUFqR0QsSUFpR0M7SUFqR1ksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudCwgR2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICAvKiogR2l0IGNsaWVudCB0aGF0IGNhbiBiZSB1c2VkIHRvIGV4ZWN1dGUgR2l0IGNvbW1hbmRzLiAqL1xuICBnaXQgPSBuZXcgR2l0Q2xpZW50KHRoaXMuX2dpdGh1YlRva2VuLCB7Z2l0aHViOiB0aGlzLmNvbmZpZy5yZW1vdGV9KTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBwcm9qZWN0Um9vdDogc3RyaW5nLCBwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsXG4gICAgICBwcml2YXRlIF9naXRodWJUb2tlbjogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuIGhhcyBzdWZmaWNpZW50IHBlcm1pc3Npb25zIGZvciB3cml0aW5nXG4gICAgLy8gdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gSWYgdGhlIHJlcG9zaXRvcnkgaXMgbm90IHByaXZhdGUsIG9ubHkgdGhlXG4gICAgLy8gcmVkdWNlZCBgcHVibGljX3JlcG9gIE9BdXRoIHNjb3BlIGlzIHN1ZmZpY2llbnQgZm9yIHBlcmZvcm1pbmcgbWVyZ2VzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoKHNjb3BlcywgbWlzc2luZykgPT4ge1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3JlcG8nKSkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcucmVtb3RlLnByaXZhdGUpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3JlcG8nKTtcbiAgICAgICAgfSBlbHNlIGlmICghc2NvcGVzLmluY2x1ZGVzKCdwdWJsaWNfcmVwbycpKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdwdWJsaWNfcmVwbycpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZCwgcmFpc2UgYXdhcmVuZXNzIGJ5IHByb21wdGluZ1xuICAgIC8vIHRoZSBjYXJldGFrZXIuIFRoZSBjYXJldGFrZXIgY2FuIHRoZW4gZGVjaWRlIHRvIHByb2NlZWQgb3IgYWJvcnQgdGhlIG1lcmdlLlxuICAgIGlmIChwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKFxuICAgICAgICAgICAgZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpICsgYFxcbkRvIHlvdSB3YW50IHRvIHByb2NlZWQgbWVyZ2luZz9gKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSA/XG4gICAgICAgIG5ldyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0LCB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSkgOlxuICAgICAgICBuZXcgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kodGhpcy5naXQpO1xuXG4gICAgLy8gQnJhbmNoIG9yIHJldmlzaW9uIHRoYXQgaXMgY3VycmVudGx5IGNoZWNrZWQgb3V0IHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBiYWNrIHRvXG4gICAgLy8gaXQgb25jZSB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC5cbiAgICBsZXQgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uOiBudWxsfHN0cmluZyA9IG51bGw7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGJsb2NrIHJ1bnMgR2l0IGNvbW1hbmRzIGFzIGNoaWxkIHByb2Nlc3Nlcy4gVGhlc2UgR2l0IGNvbW1hbmRzIGNhbiBmYWlsLlxuICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGVzZSBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGFuIGFwcHJvcHJpYXRlIG1lcmdlIHJlcXVlc3Qgc3RhdHVzLlxuICAgIHRyeSB7XG4gICAgICBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gICAgICAvLyBSdW4gcHJlcGFyYXRpb25zIGZvciB0aGUgbWVyZ2UgKGUuZy4gZmV0Y2hpbmcgYnJhbmNoZXMpLlxuICAgICAgYXdhaXQgc3RyYXRlZ3kucHJlcGFyZShwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGFuZCBjYXB0dXJlIHBvdGVudGlhbCBmYWlsdXJlcy5cbiAgICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCBzdHJhdGVneS5tZXJnZShwdWxsUmVxdWVzdCk7XG4gICAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlfTtcbiAgICAgIH1cblxuICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIGJyYW5jaC4gV2UgbmVlZCB0byBkbyB0aGlzIGJlZm9yZSBkZWxldGluZyB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyBicmFuY2hlcyBiZWNhdXNlIHdlIGNhbm5vdCBkZWxldGUgYnJhbmNoZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBjaGVja2VkIG91dC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uXSk7XG5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LmNsZWFudXAocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBSZXR1cm4gYSBzdWNjZXNzZnVsIG1lcmdlIHN0YXR1cy5cbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5TVUNDRVNTfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbGwgZ2l0IGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYSBtZXJnZSByZXN1bHQgdy8gZ2l0IGVycm9yIHN0YXR1cyBjb2RlLlxuICAgICAgLy8gT3RoZXIgdW5rbm93biBlcnJvcnMgd2hpY2ggYXJlbid0IGNhdXNlZCBieSBhIGdpdCBjb21tYW5kIGFyZSByZS10aHJvd24uXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1J9O1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gQWx3YXlzIHRyeSB0byByZXN0b3JlIHRoZSBicmFuY2ggaWYgcG9zc2libGUuIFdlIGRvbid0IHdhbnQgdG8gbGVhdmVcbiAgICAgIC8vIHRoZSByZXBvc2l0b3J5IGluIGEgZGlmZmVyZW50IHN0YXRlIHRoYW4gYmVmb3JlLlxuICAgICAgaWYgKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=