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
        define("@angular/dev-infra-private/pr/merge/task", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/messages", "@angular/dev-infra-private/pr/merge/pull-request", "@angular/dev-infra-private/pr/merge/strategies/api-merge", "@angular/dev-infra-private/pr/merge/strategies/autosquash-merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullRequestMergeTask = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var messages_1 = require("@angular/dev-infra-private/pr/merge/messages");
    var pull_request_1 = require("@angular/dev-infra-private/pr/merge/pull-request");
    var api_merge_1 = require("@angular/dev-infra-private/pr/merge/strategies/api-merge");
    var autosquash_merge_1 = require("@angular/dev-infra-private/pr/merge/strategies/autosquash-merge");
    var defaultPullRequestMergeTaskFlags = {
        branchPrompt: true,
    };
    /**
     * Class that accepts a merge script configuration and Github token. It provides
     * a programmatic interface for merging multiple pull requests based on their
     * labels that have been resolved through the merge script configuration.
     */
    var PullRequestMergeTask = /** @class */ (function () {
        function PullRequestMergeTask(config, git, flags) {
            this.config = config;
            this.git = git;
            // Update flags property with the provided flags values as patches to the default flag values.
            this.flags = tslib_1.__assign(tslib_1.__assign({}, defaultPullRequestMergeTaskFlags), flags);
        }
        /**
         * Merges the given pull request and pushes it upstream.
         * @param prNumber Pull request that should be merged.
         * @param force Whether non-critical pull request failures should be ignored.
         */
        PullRequestMergeTask.prototype.merge = function (prNumber, force) {
            if (force === void 0) { force = false; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var hasOauthScopes, pullRequest, _a, _b, strategy, previousBranchOrRevision, failure, e_1;
                var _this = this;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0: return [4 /*yield*/, this.git.hasOauthScopes(function (scopes, missing) {
                                if (!scopes.includes('repo')) {
                                    if (_this.config.remote.private) {
                                        missing.push('repo');
                                    }
                                    else if (!scopes.includes('public_repo')) {
                                        missing.push('public_repo');
                                    }
                                }
                                // Pull requests can modify Github action workflow files. In such cases Github requires us to
                                // push with a token that has the `workflow` oauth scope set. To avoid errors when the
                                // caretaker intends to merge such PRs, we ensure the scope is always set on the token before
                                // the merge process starts.
                                // https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
                                if (!scopes.includes('workflow')) {
                                    missing.push('workflow');
                                }
                            })];
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
                            _a = this.flags.branchPrompt;
                            if (!_a) return [3 /*break*/, 4];
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getTargettedBranchesConfirmationPromptMessage(pullRequest))];
                        case 3:
                            _a = !(_c.sent());
                            _c.label = 4;
                        case 4:
                            if (_a) {
                                return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                            }
                            _b = pullRequest.hasCaretakerNote;
                            if (!_b) return [3 /*break*/, 6];
                            return [4 /*yield*/, console_1.promptConfirm(messages_1.getCaretakerNotePromptMessage(pullRequest))];
                        case 5:
                            _b = !(_c.sent());
                            _c.label = 6;
                        case 6:
                            // If the pull request has a caretaker note applied, raise awareness by prompting
                            // the caretaker. The caretaker can then decide to proceed or abort the merge.
                            if (_b) {
                                return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                            }
                            strategy = this.config.githubApiMerge ?
                                new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                                new autosquash_merge_1.AutosquashMergeStrategy(this.git);
                            previousBranchOrRevision = null;
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 11, 12, 13]);
                            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 8:
                            // Run preparations for the merge (e.g. fetching branches).
                            _c.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 9:
                            failure = _c.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranchOrRevision]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 10:
                            _c.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 11:
                            e_1 = _c.sent();
                            // Catch all git command errors and return a merge result w/ git error status code.
                            // Other unknown errors which aren't caused by a git command are re-thrown.
                            if (e_1 instanceof git_client_1.GitCommandError) {
                                return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                            }
                            throw e_1;
                        case 12:
                            // Always try to restore the branch if possible. We don't want to leave
                            // the repository in a different state than before.
                            if (previousBranchOrRevision !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
                            }
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/];
                    }
                });
            });
        };
        return PullRequestMergeTask;
    }());
    exports.PullRequestMergeTask = PullRequestMergeTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBa0Q7SUFFbEQsOEVBQTJEO0lBRzNELHlFQUE4QztJQUM5Qyx5RUFBd0c7SUFDeEcsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUF3QnRFLElBQU0sZ0NBQWdDLEdBQThCO1FBQ2xFLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7SUFFRjs7OztPQUlHO0lBQ0g7UUFHRSw4QkFDVyxNQUE2QixFQUFTLEdBQTJCLEVBQ3hFLEtBQXlDO1lBRGxDLFdBQU0sR0FBTixNQUFNLENBQXVCO1lBQVMsUUFBRyxHQUFILEdBQUcsQ0FBd0I7WUFFMUUsOEZBQThGO1lBQzlGLElBQUksQ0FBQyxLQUFLLHlDQUFPLGdDQUFnQyxHQUFLLEtBQUssQ0FBQyxDQUFDO1FBQy9ELENBQUM7UUFFRDs7OztXQUlHO1FBQ0csb0NBQUssR0FBWCxVQUFZLFFBQWdCLEVBQUUsS0FBYTtZQUFiLHNCQUFBLEVBQUEsYUFBYTs7Ozs7O2dDQUlsQixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxVQUFDLE1BQU0sRUFBRSxPQUFPO2dDQUNuRSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQ0FDNUIsSUFBSSxLQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7d0NBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7cUNBQ3RCO3lDQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dDQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3FDQUM3QjtpQ0FDRjtnQ0FFRCw2RkFB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Q0FBb0M7NEJBQ3BDLHNCQUFPLEVBQUMsTUFBTSxpQkFBcUIsRUFBQyxFQUFDOzs7NEJBRXJDLG1GQUFtRjs0QkFDbkYsMkVBQTJFOzRCQUMzRSxJQUFJLEdBQUMsWUFBWSw0QkFBZSxFQUFFO2dDQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBQ0QsTUFBTSxHQUFDLENBQUM7OzRCQUVSLHVFQUF1RTs0QkFDdkUsbURBQW1EOzRCQUNuRCxJQUFJLHdCQUF3QixLQUFLLElBQUksRUFBRTtnQ0FDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzs2QkFDcEU7Ozs7OztTQUVKO1FBQ0gsMkJBQUM7SUFBRCxDQUFDLEFBbEhELElBa0hDO0lBbEhZLG9EQUFvQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbmltcG9ydCB7TWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge2dldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlLCBnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2V9IGZyb20gJy4vbWVzc2FnZXMnO1xuaW1wb3J0IHtpc1B1bGxSZXF1ZXN0LCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCx9IGZyb20gJy4vcHVsbC1yZXF1ZXN0JztcbmltcG9ydCB7R2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2FwaS1tZXJnZSc7XG5pbXBvcnQge0F1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXV0b3NxdWFzaC1tZXJnZSc7XG5cbi8qKiBEZXNjcmliZXMgdGhlIHN0YXR1cyBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIE1lcmdlU3RhdHVzIHtcbiAgVU5LTk9XTl9HSVRfRVJST1IsXG4gIERJUlRZX1dPUktJTkdfRElSLFxuICBTVUNDRVNTLFxuICBGQUlMRUQsXG4gIFVTRVJfQUJPUlRFRCxcbiAgR0lUSFVCX0VSUk9SLFxufVxuXG4vKiogUmVzdWx0IG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZVJlc3VsdCB7XG4gIC8qKiBPdmVyYWxsIHN0YXR1cyBvZiB0aGUgbWVyZ2UuICovXG4gIHN0YXR1czogTWVyZ2VTdGF0dXM7XG4gIC8qKiBMaXN0IG9mIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gKi9cbiAgZmFpbHVyZT86IFB1bGxSZXF1ZXN0RmFpbHVyZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzIHtcbiAgYnJhbmNoUHJvbXB0OiBib29sZWFuO1xufVxuXG5jb25zdCBkZWZhdWx0UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncyA9IHtcbiAgYnJhbmNoUHJvbXB0OiB0cnVlLFxufTtcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFjY2VwdHMgYSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbiBhbmQgR2l0aHViIHRva2VuLiBJdCBwcm92aWRlc1xuICogYSBwcm9ncmFtbWF0aWMgaW50ZXJmYWNlIGZvciBtZXJnaW5nIG11bHRpcGxlIHB1bGwgcmVxdWVzdHMgYmFzZWQgb24gdGhlaXJcbiAqIGxhYmVscyB0aGF0IGhhdmUgYmVlbiByZXNvbHZlZCB0aHJvdWdoIHRoZSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrIHtcbiAgcHJpdmF0ZSBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncztcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSwgcHVibGljIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgICAgIGZsYWdzOiBQYXJ0aWFsPFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M+KSB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHByb3BlcnR5IHdpdGggdGhlIHByb3ZpZGVkIGZsYWdzIHZhbHVlcyBhcyBwYXRjaGVzIHRvIHRoZSBkZWZhdWx0IGZsYWcgdmFsdWVzLlxuICAgIHRoaXMuZmxhZ3MgPSB7Li4uZGVmYXVsdFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MsIC4uLmZsYWdzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuIGhhcyBzdWZmaWNpZW50IHBlcm1pc3Npb25zIGZvciB3cml0aW5nXG4gICAgLy8gdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gSWYgdGhlIHJlcG9zaXRvcnkgaXMgbm90IHByaXZhdGUsIG9ubHkgdGhlXG4gICAgLy8gcmVkdWNlZCBgcHVibGljX3JlcG9gIE9BdXRoIHNjb3BlIGlzIHN1ZmZpY2llbnQgZm9yIHBlcmZvcm1pbmcgbWVyZ2VzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoKHNjb3BlcywgbWlzc2luZykgPT4ge1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3JlcG8nKSkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcucmVtb3RlLnByaXZhdGUpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3JlcG8nKTtcbiAgICAgICAgfSBlbHNlIGlmICghc2NvcGVzLmluY2x1ZGVzKCdwdWJsaWNfcmVwbycpKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdwdWJsaWNfcmVwbycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFB1bGwgcmVxdWVzdHMgY2FuIG1vZGlmeSBHaXRodWIgYWN0aW9uIHdvcmtmbG93IGZpbGVzLiBJbiBzdWNoIGNhc2VzIEdpdGh1YiByZXF1aXJlcyB1cyB0b1xuICAgICAgLy8gcHVzaCB3aXRoIGEgdG9rZW4gdGhhdCBoYXMgdGhlIGB3b3JrZmxvd2Agb2F1dGggc2NvcGUgc2V0LiBUbyBhdm9pZCBlcnJvcnMgd2hlbiB0aGVcbiAgICAgIC8vIGNhcmV0YWtlciBpbnRlbmRzIHRvIG1lcmdlIHN1Y2ggUFJzLCB3ZSBlbnN1cmUgdGhlIHNjb3BlIGlzIGFsd2F5cyBzZXQgb24gdGhlIHRva2VuIGJlZm9yZVxuICAgICAgLy8gdGhlIG1lcmdlIHByb2Nlc3Mgc3RhcnRzLlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZGV2ZWxvcGVycy9hcHBzL3Njb3Blcy1mb3Itb2F1dGgtYXBwcyNhdmFpbGFibGUtc2NvcGVzXG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygnd29ya2Zsb3cnKSkge1xuICAgICAgICBtaXNzaW5nLnB1c2goJ3dvcmtmbG93Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuZmxhZ3MuYnJhbmNoUHJvbXB0ICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cblxuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZCwgcmFpc2UgYXdhcmVuZXNzIGJ5IHByb21wdGluZ1xuICAgIC8vIHRoZSBjYXJldGFrZXIuIFRoZSBjYXJldGFrZXIgY2FuIHRoZW4gZGVjaWRlIHRvIHByb2NlZWQgb3IgYWJvcnQgdGhlIG1lcmdlLlxuICAgIGlmIChwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UgP1xuICAgICAgICBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpIDpcbiAgICAgICAgbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCBvciByZXZpc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0b1xuICAgIC8vIGl0IG9uY2UgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgbGV0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbjogbnVsbHxzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayBydW5zIEdpdCBjb21tYW5kcyBhcyBjaGlsZCBwcm9jZXNzZXMuIFRoZXNlIEdpdCBjb21tYW5kcyBjYW4gZmFpbC5cbiAgICAvLyBXZSB3YW50IHRvIGNhcHR1cmUgdGhlc2UgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhbiBhcHByb3ByaWF0ZSBtZXJnZSByZXF1ZXN0IHN0YXR1cy5cbiAgICB0cnkge1xuICAgICAgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuXG4gICAgICBhd2FpdCBzdHJhdGVneS5jbGVhbnVwKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUmV0dXJuIGEgc3VjY2Vzc2Z1bCBtZXJnZSBzdGF0dXMuXG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuU1VDQ0VTU307XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggYWxsIGdpdCBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGEgbWVyZ2UgcmVzdWx0IHcvIGdpdCBlcnJvciBzdGF0dXMgY29kZS5cbiAgICAgIC8vIE90aGVyIHVua25vd24gZXJyb3JzIHdoaWNoIGFyZW4ndCBjYXVzZWQgYnkgYSBnaXQgY29tbWFuZCBhcmUgcmUtdGhyb3duLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIEFsd2F5cyB0cnkgdG8gcmVzdG9yZSB0aGUgYnJhbmNoIGlmIHBvc3NpYmxlLiBXZSBkb24ndCB3YW50IHRvIGxlYXZlXG4gICAgICAvLyB0aGUgcmVwb3NpdG9yeSBpbiBhIGRpZmZlcmVudCBzdGF0ZSB0aGFuIGJlZm9yZS5cbiAgICAgIGlmIChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19