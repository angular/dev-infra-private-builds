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
                var hasOauthScopes, pullRequest, strategy, previousBranchOrRevision, failure, e_1;
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
                            previousBranchOrRevision = null;
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 7, 8, 9]);
                            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
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
                            this.git.run(['checkout', '-f', previousBranchOrRevision]);
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
                            if (previousBranchOrRevision !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw0REFBMkQ7SUFHM0QseUVBQThDO0lBQzlDLGlGQUEwRTtJQUMxRSxzRkFBOEQ7SUFDOUQsb0dBQXNFO0lBRXRFLHVEQUF1RDtJQUN2RCxJQUFNLGVBQWUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBbUJqQzs7OztPQUlHO0lBQ0g7UUFJRSw4QkFDVyxXQUFtQixFQUFTLE1BQTZCLEVBQ3hELFlBQW9CO1lBRHJCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBdUI7WUFDeEQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFMaEMsMkRBQTJEO1lBQzNELFFBQUcsR0FBRyxJQUFJLGVBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFDLENBQUMsQ0FBQztRQUlsQyxDQUFDO1FBRXBDOzs7O1dBSUc7UUFDRyxvQ0FBSyxHQUFYLFVBQVksUUFBZ0IsRUFBRSxLQUFhO1lBQWIsc0JBQUEsRUFBQSxhQUFhOzs7Ozs7Z0NBRWxCLHFCQUFNLENBQUEsS0FBQSxJQUFJLENBQUMsR0FBRyxDQUFBLENBQUMsY0FBYyw0QkFBSSxlQUFlLElBQUM7OzRCQUFsRSxjQUFjLEdBQUcsU0FBaUQ7NEJBQ3hFLElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0Isc0JBQU87d0NBQ0wsTUFBTSxzQkFBMEI7d0NBQ2hDLE9BQU8sRUFBRSw2QkFBa0IsQ0FBQyw4QkFBOEIsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDO3FDQUNqRixFQUFDOzZCQUNIOzRCQUVELElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dDQUNwQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBRW1CLHFCQUFNLHlDQUEwQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUE7OzRCQUFyRSxXQUFXLEdBQUcsU0FBdUQ7NEJBRTNFLElBQUksQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dDQUMvQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxFQUFDOzZCQUMzRDs0QkFFSyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQ0FDekMsSUFBSSxrQ0FBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQ0FDbEUsSUFBSSwwQ0FBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBSXRDLHdCQUF3QixHQUFnQixJQUFJLENBQUM7Ozs7NEJBSy9DLHdCQUF3QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQzs0QkFFakUsMkRBQTJEOzRCQUMzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFEbkMsMkRBQTJEOzRCQUMzRCxTQUFtQyxDQUFDOzRCQUdwQixxQkFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFBM0MsT0FBTyxHQUFHLFNBQWlDOzRCQUNqRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0NBQ3BCLHNCQUFPLEVBQUMsTUFBTSxnQkFBb0IsRUFBRSxPQUFPLFNBQUEsRUFBQyxFQUFDOzZCQUM5Qzs0QkFFRCx1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzs0QkFFM0QscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBQW5DLFNBQW1DLENBQUM7NEJBRXBDLG9DQUFvQzs0QkFDcEMsc0JBQU8sRUFBQyxNQUFNLGlCQUFxQixFQUFDLEVBQUM7Ozs0QkFFckMsbUZBQW1GOzRCQUNuRiwyRUFBMkU7NEJBQzNFLElBQUksR0FBQyxZQUFZLHFCQUFlLEVBQUU7Z0NBQ2hDLHNCQUFPLEVBQUMsTUFBTSwyQkFBK0IsRUFBQyxFQUFDOzZCQUNoRDs0QkFDRCxNQUFNLEdBQUMsQ0FBQzs7NEJBRVIsdUVBQXVFOzRCQUN2RSxtREFBbUQ7NEJBQ25ELElBQUksd0JBQXdCLEtBQUssSUFBSSxFQUFFO2dDQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDOzZCQUNwRTs7Ozs7O1NBRUo7UUFDSCwyQkFBQztJQUFELENBQUMsQUE5RUQsSUE4RUM7SUE5RVksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50LCBHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cbmltcG9ydCB7TWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIEdpdGh1YiBPQXV0aCBzY29wZXMgcmVxdWlyZWQgZm9yIHRoZSBtZXJnZSB0YXNrLiAqL1xuY29uc3QgUkVRVUlSRURfU0NPUEVTID0gWydyZXBvJ107XG5cbi8qKiBEZXNjcmliZXMgdGhlIHN0YXR1cyBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIE1lcmdlU3RhdHVzIHtcbiAgVU5LTk9XTl9HSVRfRVJST1IsXG4gIERJUlRZX1dPUktJTkdfRElSLFxuICBTVUNDRVNTLFxuICBGQUlMRUQsXG4gIEdJVEhVQl9FUlJPUixcbn1cblxuLyoqIFJlc3VsdCBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VSZXN1bHQge1xuICAvKiogT3ZlcmFsbCBzdGF0dXMgb2YgdGhlIG1lcmdlLiAqL1xuICBzdGF0dXM6IE1lcmdlU3RhdHVzO1xuICAvKiogTGlzdCBvZiBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuICovXG4gIGZhaWx1cmU/OiBQdWxsUmVxdWVzdEZhaWx1cmU7XG59XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBhY2NlcHRzIGEgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24gYW5kIEdpdGh1YiB0b2tlbi4gSXQgcHJvdmlkZXNcbiAqIGEgcHJvZ3JhbW1hdGljIGludGVyZmFjZSBmb3IgbWVyZ2luZyBtdWx0aXBsZSBwdWxsIHJlcXVlc3RzIGJhc2VkIG9uIHRoZWlyXG4gKiBsYWJlbHMgdGhhdCBoYXZlIGJlZW4gcmVzb2x2ZWQgdGhyb3VnaCB0aGUgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdE1lcmdlVGFzayB7XG4gIC8qKiBHaXQgY2xpZW50IHRoYXQgY2FuIGJlIHVzZWQgdG8gZXhlY3V0ZSBHaXQgY29tbWFuZHMuICovXG4gIGdpdCA9IG5ldyBHaXRDbGllbnQodGhpcy5fZ2l0aHViVG9rZW4sIHtnaXRodWI6IHRoaXMuY29uZmlnLnJlbW90ZX0pO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHByb2plY3RSb290OiBzdHJpbmcsIHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSxcbiAgICAgIHByaXZhdGUgX2dpdGh1YlRva2VuOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IGFuZCBwdXNoZXMgaXQgdXBzdHJlYW0uXG4gICAqIEBwYXJhbSBwck51bWJlciBQdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciBub24tY3JpdGljYWwgcHVsbCByZXF1ZXN0IGZhaWx1cmVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHJOdW1iZXI6IG51bWJlciwgZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8TWVyZ2VSZXN1bHQ+IHtcbiAgICAvLyBBc3NlcnQgdGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGhhcyBhY2Nlc3Mgb24gdGhlIHJlcXVpcmVkIHNjb3Blcy5cbiAgICBjb25zdCBoYXNPYXV0aFNjb3BlcyA9IGF3YWl0IHRoaXMuZ2l0Lmhhc09hdXRoU2NvcGVzKC4uLlJFUVVJUkVEX1NDT1BFUyk7XG4gICAgaWYgKGhhc09hdXRoU2NvcGVzICE9PSB0cnVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6IE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUixcbiAgICAgICAgZmFpbHVyZTogUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShoYXNPYXV0aFNjb3Blcy5lcnJvcilcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVJ9O1xuICAgIH1cblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QodGhpcywgcHJOdW1iZXIsIGZvcmNlKTtcblxuICAgIGlmICghaXNQdWxsUmVxdWVzdChwdWxsUmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmU6IHB1bGxSZXF1ZXN0fTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlID9cbiAgICAgICAgbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKSA6XG4gICAgICAgIG5ldyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCk7XG5cbiAgICAvLyBCcmFuY2ggb3IgcmV2aXNpb24gdGhhdCBpcyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIGJhY2sgdG9cbiAgICAvLyBpdCBvbmNlIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLlxuICAgIGxldCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb246IG51bGx8c3RyaW5nID0gbnVsbDtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBBbHdheXMgdHJ5IHRvIHJlc3RvcmUgdGhlIGJyYW5jaCBpZiBwb3NzaWJsZS4gV2UgZG9uJ3Qgd2FudCB0byBsZWF2ZVxuICAgICAgLy8gdGhlIHJlcG9zaXRvcnkgaW4gYSBkaWZmZXJlbnQgc3RhdGUgdGhhbiBiZWZvcmUuXG4gICAgICBpZiAocHJldmlvdXNCcmFuY2hPclJldmlzaW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==