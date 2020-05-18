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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILCtEQUFpRDtJQUNqRCxpRkFBMEU7SUFDMUUsc0ZBQThEO0lBQzlELG9HQUFzRTtJQWtCdEU7Ozs7T0FJRztJQUNIO1FBSUUsOEJBQ1csV0FBbUIsRUFBUyxNQUE2QixFQUN4RCxZQUFvQjtZQURyQixnQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQUFTLFdBQU0sR0FBTixNQUFNLENBQXVCO1lBQ3hELGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBTGhDLDJEQUEyRDtZQUMzRCxRQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUluQyxDQUFDO1FBRXBDOzs7O1dBSUc7UUFDRyxvQ0FBSyxHQUFYLFVBQVksUUFBZ0IsRUFBRSxLQUFhO1lBQWIsc0JBQUEsRUFBQSxhQUFhOzs7Ozs7NEJBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO2dDQUNwQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzs2QkFDaEQ7NEJBRW1CLHFCQUFNLHlDQUEwQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxDQUFDLEVBQUE7OzRCQUFyRSxXQUFXLEdBQUcsU0FBdUQ7NEJBRTNFLElBQUksQ0FBQyw0QkFBYSxDQUFDLFdBQVcsQ0FBQyxFQUFFO2dDQUMvQixzQkFBTyxFQUFDLE1BQU0sZ0JBQW9CLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxFQUFDOzZCQUMzRDs0QkFFSyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztnQ0FDekMsSUFBSSxrQ0FBc0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQ0FDbEUsSUFBSSwwQ0FBdUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBSXRDLGNBQWMsR0FBZ0IsSUFBSSxDQUFDOzs7OzRCQUtyQyxjQUFjLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDOzRCQUU3QywyREFBMkQ7NEJBQzNELHFCQUFNLFFBQVEsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQURuQywyREFBMkQ7NEJBQzNELFNBQW1DLENBQUM7NEJBR3BCLHFCQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUEzQyxPQUFPLEdBQUcsU0FBaUM7NEJBQ2pELElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtnQ0FDcEIsc0JBQU8sRUFBQyxNQUFNLGdCQUFvQixFQUFFLE9BQU8sU0FBQSxFQUFDLEVBQUM7NkJBQzlDOzRCQUVELHVGQUF1Rjs0QkFDdkYsOEVBQThFOzRCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQzs0QkFFakQscUJBQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBQTs7NEJBQW5DLFNBQW1DLENBQUM7NEJBRXBDLG9DQUFvQzs0QkFDcEMsc0JBQU8sRUFBQyxNQUFNLGlCQUFxQixFQUFDLEVBQUM7Ozs0QkFFckMsbUZBQW1GOzRCQUNuRiwyRUFBMkU7NEJBQzNFLElBQUksR0FBQyxZQUFZLHFCQUFlLEVBQUU7Z0NBQ2hDLHNCQUFPLEVBQUMsTUFBTSwyQkFBK0IsRUFBQyxFQUFDOzZCQUNoRDs0QkFDRCxNQUFNLEdBQUMsQ0FBQzs7NEJBRVIsdUVBQXVFOzRCQUN2RSxtREFBbUQ7NEJBQ25ELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtnQ0FDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUM7NkJBQzFEOzs7Ozs7U0FFSjtRQUNILDJCQUFDO0lBQUQsQ0FBQyxBQXJFRCxJQXFFQztJQXJFWSxvREFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7R2l0Q2xpZW50LCBHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4vZ2l0JztcbmltcG9ydCB7aXNQdWxsUmVxdWVzdCwgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QsfSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hcGktbWVyZ2UnO1xuaW1wb3J0IHtBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UnO1xuXG4vKiogRGVzY3JpYmVzIHRoZSBzdGF0dXMgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgY29uc3QgZW51bSBNZXJnZVN0YXR1cyB7XG4gIFVOS05PV05fR0lUX0VSUk9SLFxuICBESVJUWV9XT1JLSU5HX0RJUixcbiAgU1VDQ0VTUyxcbiAgRkFJTEVELFxufVxuXG4vKiogUmVzdWx0IG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZVJlc3VsdCB7XG4gIC8qKiBPdmVyYWxsIHN0YXR1cyBvZiB0aGUgbWVyZ2UuICovXG4gIHN0YXR1czogTWVyZ2VTdGF0dXM7XG4gIC8qKiBMaXN0IG9mIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gKi9cbiAgZmFpbHVyZT86IFB1bGxSZXF1ZXN0RmFpbHVyZTtcbn1cblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFjY2VwdHMgYSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbiBhbmQgR2l0aHViIHRva2VuLiBJdCBwcm92aWRlc1xuICogYSBwcm9ncmFtbWF0aWMgaW50ZXJmYWNlIGZvciBtZXJnaW5nIG11bHRpcGxlIHB1bGwgcmVxdWVzdHMgYmFzZWQgb24gdGhlaXJcbiAqIGxhYmVscyB0aGF0IGhhdmUgYmVlbiByZXNvbHZlZCB0aHJvdWdoIHRoZSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrIHtcbiAgLyoqIEdpdCBjbGllbnQgdGhhdCBjYW4gYmUgdXNlZCB0byBleGVjdXRlIEdpdCBjb21tYW5kcy4gKi9cbiAgZ2l0ID0gbmV3IEdpdENsaWVudCh0aGlzLnByb2plY3RSb290LCB0aGlzLl9naXRodWJUb2tlbiwgdGhpcy5jb25maWcpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHByb2plY3RSb290OiBzdHJpbmcsIHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSxcbiAgICAgIHByaXZhdGUgX2dpdGh1YlRva2VuOiBzdHJpbmcpIHt9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IGFuZCBwdXNoZXMgaXQgdXBzdHJlYW0uXG4gICAqIEBwYXJhbSBwck51bWJlciBQdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciBub24tY3JpdGljYWwgcHVsbCByZXF1ZXN0IGZhaWx1cmVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHJOdW1iZXI6IG51bWJlciwgZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8TWVyZ2VSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UgP1xuICAgICAgICBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpIDpcbiAgICAgICAgbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0byBpdCBvbmNlXG4gICAgLy8gdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgbGV0IHByZXZpb3VzQnJhbmNoOiBudWxsfHN0cmluZyA9IG51bGw7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGJsb2NrIHJ1bnMgR2l0IGNvbW1hbmRzIGFzIGNoaWxkIHByb2Nlc3Nlcy4gVGhlc2UgR2l0IGNvbW1hbmRzIGNhbiBmYWlsLlxuICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGVzZSBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGFuIGFwcHJvcHJpYXRlIG1lcmdlIHJlcXVlc3Qgc3RhdHVzLlxuICAgIHRyeSB7XG4gICAgICBwcmV2aW91c0JyYW5jaCA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2goKTtcblxuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoXSk7XG5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LmNsZWFudXAocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBSZXR1cm4gYSBzdWNjZXNzZnVsIG1lcmdlIHN0YXR1cy5cbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5TVUNDRVNTfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbGwgZ2l0IGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYSBtZXJnZSByZXN1bHQgdy8gZ2l0IGVycm9yIHN0YXR1cyBjb2RlLlxuICAgICAgLy8gT3RoZXIgdW5rbm93biBlcnJvcnMgd2hpY2ggYXJlbid0IGNhdXNlZCBieSBhIGdpdCBjb21tYW5kIGFyZSByZS10aHJvd24uXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1J9O1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gQWx3YXlzIHRyeSB0byByZXN0b3JlIHRoZSBicmFuY2ggaWYgcG9zc2libGUuIFdlIGRvbid0IHdhbnQgdG8gbGVhdmVcbiAgICAgIC8vIHRoZSByZXBvc2l0b3J5IGluIGEgZGlmZmVyZW50IHN0YXRlIHRoYW4gYmVmb3JlLlxuICAgICAgaWYgKHByZXZpb3VzQnJhbmNoICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaF0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19