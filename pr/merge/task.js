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
        define("@angular/dev-infra-private/pr/merge/task", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/merge/git", "@angular/dev-infra-private/pr/merge/pull-request", "@angular/dev-infra-private/pr/merge/strategies/api-merge", "@angular/dev-infra-private/pr/merge/strategies/autosquash-merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullRequestMergeTask = void 0;
    var tslib_1 = require("tslib");
    var git_1 = require("@angular/dev-infra-private/pr/merge/git");
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
            this.git = new git_1.GitClient(this.projectRoot, this._githubToken, this.config);
        }
        /**
         * Merges the given pull request and pushes it upstream.
         * @param prNumber Pull request that should be merged.
         * @param force Whether non-critical pull request failures should be ignored.
         */
        PullRequestMergeTask.prototype.merge = function (prNumber, force) {
            if (force === void 0) { force = false; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var pullRequest, strategy, previousBranch, failure, e_1;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.git.hasUncommittedChanges()) {
                                return [2 /*return*/, { status: 1 /* DIRTY_WORKING_DIR */ }];
                            }
                            return [4 /*yield*/, pull_request_1.loadAndValidatePullRequest(this, prNumber, force)];
                        case 1:
                            pullRequest = _a.sent();
                            if (!pull_request_1.isPullRequest(pullRequest)) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: pullRequest }];
                            }
                            strategy = this.config.githubApiMerge ?
                                new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                                new autosquash_merge_1.AutosquashMergeStrategy(this.git);
                            previousBranch = null;
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 6, 7, 8]);
                            previousBranch = this.git.getCurrentBranch();
                            // Run preparations for the merge (e.g. fetching branches).
                            return [4 /*yield*/, strategy.prepare(pullRequest)];
                        case 3:
                            // Run preparations for the merge (e.g. fetching branches).
                            _a.sent();
                            return [4 /*yield*/, strategy.merge(pullRequest)];
                        case 4:
                            failure = _a.sent();
                            if (failure !== null) {
                                return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                            }
                            // Switch back to the previous branch. We need to do this before deleting the temporary
                            // branches because we cannot delete branches which are currently checked out.
                            this.git.run(['checkout', '-f', previousBranch]);
                            return [4 /*yield*/, strategy.cleanup(pullRequest)];
                        case 5:
                            _a.sent();
                            // Return a successful merge status.
                            return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                        case 6:
                            e_1 = _a.sent();
                            // Catch all git command errors and return a merge result w/ git error status code.
                            // Other unknown errors which aren't caused by a git command are re-thrown.
                            if (e_1 instanceof git_1.GitCommandError) {
                                return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                            }
                            throw e_1;
                        case 7:
                            // Always try to restore the branch if possible. We don't want to leave
                            // the repository in a different state than before.
                            if (previousBranch !== null) {
                                this.git.runGraceful(['checkout', '-f', previousBranch]);
                            }
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        return PullRequestMergeTask;
    }());
    exports.PullRequestMergeTask = PullRequestMergeTask;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCwrREFBaUQ7SUFDakQsaUZBQTBFO0lBQzFFLHNGQUE4RDtJQUM5RCxvR0FBc0U7SUFrQnRFOzs7O09BSUc7SUFDSDtRQUlFLDhCQUNXLFdBQW1CLEVBQVMsTUFBNkIsRUFDeEQsWUFBb0I7WUFEckIsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBUyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtZQUN4RCxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUxoQywyREFBMkQ7WUFDM0QsUUFBRyxHQUFHLElBQUksZUFBUyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFJbkMsQ0FBQztRQUVwQzs7OztXQUlHO1FBQ0csb0NBQUssR0FBWCxVQUFZLFFBQWdCLEVBQUUsS0FBYTtZQUFiLHNCQUFBLEVBQUEsYUFBYTs7Ozs7OzRCQUN6QyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRTtnQ0FDcEMsc0JBQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLEVBQUM7NkJBQ2hEOzRCQUVtQixxQkFBTSx5Q0FBMEIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFBOzs0QkFBckUsV0FBVyxHQUFHLFNBQXVEOzRCQUUzRSxJQUFJLENBQUMsNEJBQWEsQ0FBQyxXQUFXLENBQUMsRUFBRTtnQ0FDL0Isc0JBQU8sRUFBQyxNQUFNLGdCQUFvQixFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUMsRUFBQzs2QkFDM0Q7NEJBRUssUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUM7Z0NBQ3pDLElBQUksa0NBQXNCLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0NBQ2xFLElBQUksMENBQXVCLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOzRCQUl0QyxjQUFjLEdBQWdCLElBQUksQ0FBQzs7Ozs0QkFLckMsY0FBYyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs0QkFFN0MsMkRBQTJEOzRCQUMzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFEbkMsMkRBQTJEOzRCQUMzRCxTQUFtQyxDQUFDOzRCQUdwQixxQkFBTSxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzs0QkFBM0MsT0FBTyxHQUFHLFNBQWlDOzRCQUNqRCxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7Z0NBQ3BCLHNCQUFPLEVBQUMsTUFBTSxnQkFBb0IsRUFBRSxPQUFPLFNBQUEsRUFBQyxFQUFDOzZCQUM5Qzs0QkFFRCx1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7NEJBRWpELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUFuQyxTQUFtQyxDQUFDOzRCQUVwQyxvQ0FBb0M7NEJBQ3BDLHNCQUFPLEVBQUMsTUFBTSxpQkFBcUIsRUFBQyxFQUFDOzs7NEJBRXJDLG1GQUFtRjs0QkFDbkYsMkVBQTJFOzRCQUMzRSxJQUFJLEdBQUMsWUFBWSxxQkFBZSxFQUFFO2dDQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBQ0QsTUFBTSxHQUFDLENBQUM7OzRCQUVSLHVFQUF1RTs0QkFDdkUsbURBQW1EOzRCQUNuRCxJQUFJLGNBQWMsS0FBSyxJQUFJLEVBQUU7Z0NBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDOzZCQUMxRDs7Ozs7O1NBRUo7UUFDSCwyQkFBQztJQUFELENBQUMsQUFyRUQsSUFxRUM7SUFyRVksb0RBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge0dpdENsaWVudCwgR2l0Q29tbWFuZEVycm9yfSBmcm9tICcuL2dpdCc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbn1cblxuLyoqIFJlc3VsdCBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VSZXN1bHQge1xuICAvKiogT3ZlcmFsbCBzdGF0dXMgb2YgdGhlIG1lcmdlLiAqL1xuICBzdGF0dXM6IE1lcmdlU3RhdHVzO1xuICAvKiogTGlzdCBvZiBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuICovXG4gIGZhaWx1cmU/OiBQdWxsUmVxdWVzdEZhaWx1cmU7XG59XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBhY2NlcHRzIGEgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24gYW5kIEdpdGh1YiB0b2tlbi4gSXQgcHJvdmlkZXNcbiAqIGEgcHJvZ3JhbW1hdGljIGludGVyZmFjZSBmb3IgbWVyZ2luZyBtdWx0aXBsZSBwdWxsIHJlcXVlc3RzIGJhc2VkIG9uIHRoZWlyXG4gKiBsYWJlbHMgdGhhdCBoYXZlIGJlZW4gcmVzb2x2ZWQgdGhyb3VnaCB0aGUgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdE1lcmdlVGFzayB7XG4gIC8qKiBHaXQgY2xpZW50IHRoYXQgY2FuIGJlIHVzZWQgdG8gZXhlY3V0ZSBHaXQgY29tbWFuZHMuICovXG4gIGdpdCA9IG5ldyBHaXRDbGllbnQodGhpcy5wcm9qZWN0Um9vdCwgdGhpcy5fZ2l0aHViVG9rZW4sIHRoaXMuY29uZmlnKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBwcm9qZWN0Um9vdDogc3RyaW5nLCBwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsXG4gICAgICBwcml2YXRlIF9naXRodWJUb2tlbjogc3RyaW5nKSB7fVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVJ9O1xuICAgIH1cblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QodGhpcywgcHJOdW1iZXIsIGZvcmNlKTtcblxuICAgIGlmICghaXNQdWxsUmVxdWVzdChwdWxsUmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmU6IHB1bGxSZXF1ZXN0fTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlID9cbiAgICAgICAgbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKSA6XG4gICAgICAgIG5ldyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCk7XG5cbiAgICAvLyBCcmFuY2ggdGhhdCBpcyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIGJhY2sgdG8gaXQgb25jZVxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLlxuICAgIGxldCBwcmV2aW91c0JyYW5jaDogbnVsbHxzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayBydW5zIEdpdCBjb21tYW5kcyBhcyBjaGlsZCBwcm9jZXNzZXMuIFRoZXNlIEdpdCBjb21tYW5kcyBjYW4gZmFpbC5cbiAgICAvLyBXZSB3YW50IHRvIGNhcHR1cmUgdGhlc2UgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhbiBhcHByb3ByaWF0ZSBtZXJnZSByZXF1ZXN0IHN0YXR1cy5cbiAgICB0cnkge1xuICAgICAgcHJldmlvdXNCcmFuY2ggPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoKCk7XG5cbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaF0pO1xuXG4gICAgICBhd2FpdCBzdHJhdGVneS5jbGVhbnVwKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUmV0dXJuIGEgc3VjY2Vzc2Z1bCBtZXJnZSBzdGF0dXMuXG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuU1VDQ0VTU307XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggYWxsIGdpdCBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGEgbWVyZ2UgcmVzdWx0IHcvIGdpdCBlcnJvciBzdGF0dXMgY29kZS5cbiAgICAgIC8vIE90aGVyIHVua25vd24gZXJyb3JzIHdoaWNoIGFyZW4ndCBjYXVzZWQgYnkgYSBnaXQgY29tbWFuZCBhcmUgcmUtdGhyb3duLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIEFsd2F5cyB0cnkgdG8gcmVzdG9yZSB0aGUgYnJhbmNoIGlmIHBvc3NpYmxlLiBXZSBkb24ndCB3YW50IHRvIGxlYXZlXG4gICAgICAvLyB0aGUgcmVwb3NpdG9yeSBpbiBhIGRpZmZlcmVudCBzdGF0ZSB0aGFuIGJlZm9yZS5cbiAgICAgIGlmIChwcmV2aW91c0JyYW5jaCAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==