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
        define("@angular/dev-infra-private/pr/merge/task", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/pull-request", "@angular/dev-infra-private/pr/merge/strategies/api-merge", "@angular/dev-infra-private/pr/merge/strategies/autosquash-merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullRequestMergeTask = void 0;
    var tslib_1 = require("tslib");
    var git_1 = require("@angular/dev-infra-private/utils/git");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
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
                var hasOauthScopes, pullRequest, strategy, previousBranch, failure, e_1;
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, (_a = this.git).hasOauthScopes.apply(_a, tslib_1.__spread(REQUIRED_SCOPES))];
                        case 1:
                            hasOauthScopes = _b.sent();
                            if (hasOauthScopes !== true) {
                                return [2 /*return*/, {
                                        status: 4 /* GITHUB_ERROR */,
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
                            strategy = this.config.githubApiMerge ?
                                new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                                new autosquash_merge_1.AutosquashMergeStrategy(this.git);
                            previousBranch = null;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 7, 8, 9]);
                            previousBranch = this.git.getCurrentBranch();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 4:
                            // Run preparations for the merge (e.g. fetching branches).
                            _b.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 5:
                            failure = _b.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranch]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 6:
                            _b.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 7:
                            e_1 = _b.sent();
                            // Catch all git command errors and return a merge result w/ git error status code.
                            // Other unknown errors which aren't caused by a git command are re-thrown.
                            if (e_1 instanceof git_1.GitCommandError) {
                                return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                            }
                            throw e_1;
                        case 8:
                            // Always try to restore the branch if possible. We don't want to leave
                            // the repository in a different state than before.
                            if (previousBranch !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranch]);
                            }
                            return [7 /*endfinally*/];
                        case 9: return [2 /*return*/];
                    }
                });
            });
        };
        return PullRequestMergeTask;
    }());
    exports.PullRequestMergeTask = PullRequestMergeTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw0REFBMkQ7SUFHM0QseUVBQThDO0lBQzlDLGlGQUEwRTtJQUMxRSxzRkFBOEQ7SUFDOUQsb0dBQXNFO0lBRXRFLHVEQUF1RDtJQUN2RCxJQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBbUJqQzs7OztPQUlHO0lBQ0g7UUFJRSw4QkFDVyxXQUFtQixFQUFTLE1BQTZCLEVBQ3hELFlBQW9CO1lBRHJCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFDeEQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFMaEMsMkRBQTJEO1lBQzNELFFBQUcsR0FBRyxJQUFJLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUlsQyxDQUFDO1FBRXBDOzs7O1dBSUc7UUFDRyxvQ0FBSyxHQUFYLFVBQVksUUFBZ0IsRUFBRSxLQUFhO1lBQWIsc0JBQUEsRUFBQSxhQUFhOzs7Ozs7Z0NBRWxCLHFCQUFNLENBQUEsS0FBQSxJQUFJLENBQUMsR0FBRyxDQUFBLENBQUMsY0FBYyw0QkFBSSxlQUFlLElBQUM7OzRCQUFsRSxjQUFjLEdBQUcsU0FBaUQ7NEJBQ3hFLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0Isc0JBQU87d0NBQ0wsTUFBTSxzQkFBMEI7d0NBQ2hDLE9BQU8sRUFBRSw2QkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO3FDQUNqRixFQUFDOzZCQUNIOzRCQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dDQUNwQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBRW1CLHFCQUFNLHlDQUEwQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUE7OzRCQUFyRSxXQUFXLEdBQUcsU0FBdUQ7NEJBRTNFLElBQUksQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dDQUMvQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxFQUFDOzZCQUMzRDs0QkFFSyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQ0FDekMsSUFBSSxrQ0FBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQ0FDbEUsSUFBSSwwQ0FBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBSXRDLGNBQWMsR0FBZ0IsSUFBSSxDQUFDOzs7OzRCQUtyQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOzRCQUU3QywyREFBMkQ7NEJBQzNELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQURuQywyREFBMkQ7NEJBQzNELFNBQW1DLENBQUM7NEJBR3BCLHFCQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUEzQyxPQUFPLEdBQUcsU0FBaUM7NEJBQ2pELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtnQ0FDcEIsc0JBQU8sRUFBQyxNQUFNLGdCQUFvQixFQUFFLE9BQU8sU0FBQSxFQUFDLEVBQUM7NkJBQzlDOzRCQUVELHVGQUF1Rjs0QkFDdkYsOEVBQThFOzRCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQzs0QkFFakQscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBQW5DLFNBQW1DLENBQUM7NEJBRXBDLG9DQUFvQzs0QkFDcEMsc0JBQU8sRUFBQyxNQUFNLGlCQUFxQixFQUFDLEVBQUM7Ozs0QkFFckMsbUZBQW1GOzRCQUNuRiwyRUFBMkU7NEJBQzNFLElBQUksR0FBQyxZQUFZLHFCQUFlLEVBQUU7Z0NBQ2hDLHNCQUFPLEVBQUMsTUFBTSwyQkFBK0IsRUFBQyxFQUFDOzZCQUNoRDs0QkFDRCxNQUFNLEdBQUMsQ0FBQzs7NEJBRVIsdUVBQXVFOzRCQUN2RSxtREFBbUQ7NEJBQ25ELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7NkJBQzFEOzs7Ozs7U0FFSjtRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQTlFRCxJQThFQztJQTlFWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRDbGllbnQsIEdpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7aXNQdWxsUmVxdWVzdCwgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QsfSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hcGktbWVyZ2UnO1xuaW1wb3J0IHtBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UnO1xuXG4vKiogR2l0aHViIE9BdXRoIHNjb3BlcyByZXF1aXJlZCBmb3IgdGhlIG1lcmdlIHRhc2suICovXG5jb25zdCBSRVFVSVJFRF9TQ09QRVMgPSBbJ3JlcG8nXTtcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgR0lUSFVCX0VSUk9SLFxufVxuXG4vKiogUmVzdWx0IG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZVJlc3VsdCB7XG4gIC8qKiBPdmVyYWxsIHN0YXR1cyBvZiB0aGUgbWVyZ2UuICovXG4gIHN0YXR1czogTWVyZ2VTdGF0dXM7XG4gIC8qKiBMaXN0IG9mIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gKi9cbiAgZmFpbHVyZT86IFB1bGxSZXF1ZXN0RmFpbHVyZTtcbn1cblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFjY2VwdHMgYSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbiBhbmQgR2l0aHViIHRva2VuLiBJdCBwcm92aWRlc1xuICogYSBwcm9ncmFtbWF0aWMgaW50ZXJmYWNlIGZvciBtZXJnaW5nIG11bHRpcGxlIHB1bGwgcmVxdWVzdHMgYmFzZWQgb24gdGhlaXJcbiAqIGxhYmVscyB0aGF0IGhhdmUgYmVlbiByZXNvbHZlZCB0aHJvdWdoIHRoZSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrIHtcbiAgLyoqIEdpdCBjbGllbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBleGVjdXRlIEdpdCBjb21tYW5kcy4gKi9cbiAgZ2l0ID0gbmV3IEdpdENsaWVudCh0aGlzLl9naXRodWJUb2tlbiwge2dpdGh1YjogdGhpcy5jb25maWcucmVtb3RlfSk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcHJvamVjdFJvb3Q6IHN0cmluZywgcHVibGljIGNvbmZpZzogTWVyZ2VDb25maWdXaXRoUmVtb3RlLFxuICAgICAgcHJpdmF0ZSBfZ2l0aHViVG9rZW46IHN0cmluZykge31cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgYW5kIHB1c2hlcyBpdCB1cHN0cmVhbS5cbiAgICogQHBhcmFtIHByTnVtYmVyIFB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gICAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIG5vbi1jcml0aWNhbCBwdWxsIHJlcXVlc3QgZmFpbHVyZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBtZXJnZShwck51bWJlcjogbnVtYmVyLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxNZXJnZVJlc3VsdD4ge1xuICAgIC8vIEFzc2VydCB0aGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaGFzIGFjY2VzcyBvbiB0aGUgcmVxdWlyZWQgc2NvcGVzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoLi4uUkVRVUlSRURfU0NPUEVTKTtcbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UgP1xuICAgICAgICBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpIDpcbiAgICAgICAgbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0byBpdCBvbmNlXG4gICAgLy8gdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgbGV0IHByZXZpb3VzQnJhbmNoOiBudWxsfHN0cmluZyA9IG51bGw7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGJsb2NrIHJ1bnMgR2l0IGNvbW1hbmRzIGFzIGNoaWxkIHByb2Nlc3Nlcy4gVGhlc2UgR2l0IGNvbW1hbmRzIGNhbiBmYWlsLlxuICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGVzZSBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGFuIGFwcHJvcHJpYXRlIG1lcmdlIHJlcXVlc3Qgc3RhdHVzLlxuICAgIHRyeSB7XG4gICAgICBwcmV2aW91c0JyYW5jaCA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2goKTtcblxuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoXSk7XG5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LmNsZWFudXAocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBSZXR1cm4gYSBzdWNjZXNzZnVsIG1lcmdlIHN0YXR1cy5cbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5TVUNDRVNTfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbGwgZ2l0IGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYSBtZXJnZSByZXN1bHQgdy8gZ2l0IGVycm9yIHN0YXR1cyBjb2RlLlxuICAgICAgLy8gT3RoZXIgdW5rbm93biBlcnJvcnMgd2hpY2ggYXJlbid0IGNhdXNlZCBieSBhIGdpdCBjb21tYW5kIGFyZSByZS10aHJvd24uXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1J9O1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gQWx3YXlzIHRyeSB0byByZXN0b3JlIHRoZSBicmFuY2ggaWYgcG9zc2libGUuIFdlIGRvbid0IHdhbnQgdG8gbGVhdmVcbiAgICAgIC8vIHRoZSByZXBvc2l0b3J5IGluIGEgZGlmZmVyZW50IHN0YXRlIHRoYW4gYmVmb3JlLlxuICAgICAgaWYgKHByZXZpb3VzQnJhbmNoICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19