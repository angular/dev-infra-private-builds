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
        define("@angular/dev-infra-private/pr/merge/strategies/autosquash-merge", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/strategies/strategy"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AutosquashMergeStrategy = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var strategy_1 = require("@angular/dev-infra-private/pr/merge/strategies/strategy");
    /** Path to the commit message filter script. Git expects this paths to use forward slashes. */
    var MSG_FILTER_SCRIPT = path_1.join(__dirname, './commit-message-filter.js').replace(/\\/g, '/');
    /**
     * Merge strategy that does not use the Github API for merging. Instead, it fetches
     * all target branches and the PR locally. The PR is then cherry-picked with autosquash
     * enabled into the target branches. The benefit is the support for fixup and squash commits.
     * A notable downside though is that Github does not show the PR as `Merged` due to non
     * fast-forward merges
     */
    var AutosquashMergeStrategy = /** @class */ (function (_super) {
        tslib_1.__extends(AutosquashMergeStrategy, _super);
        function AutosquashMergeStrategy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Merges the specified pull request into the target branches and pushes the target
         * branches upstream. This method requires the temporary target branches to be fetched
         * already as we don't want to fetch the target branches per pull request merge. This
         * would causes unnecessary multiple fetch requests when multiple PRs are merged.
         * @throws {GitCommandError} An unknown Git command error occurred that is not
         *   specific to the pull request merge.
         * @returns A pull request failure or null in case of success.
         */
        AutosquashMergeStrategy.prototype.merge = function (pullRequest) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, githubTargetBranch, baseSha, revisionRange, branchOrRevisionBeforeRebase, rebaseEnv, failedBranches, localBranch, sha;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup, githubTargetBranch = pullRequest.githubTargetBranch;
                            // In case a required base is specified for this pull request, check if the pull
                            // request contains the given commit. If not, return a pull request failure. This
                            // check is useful for enforcing that PRs are rebased on top of a given commit. e.g.
                            // a commit that changes the codeowner ship validation. PRs which are not rebased
                            // could bypass new codeowner ship rules.
                            if (requiredBaseSha && !this.git.hasCommit(strategy_1.TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                                return [2 /*return*/, failures_1.PullRequestFailure.unsatisfiedBaseSha()];
                            }
                            baseSha = this.git.run(['rev-parse', this.getPullRequestBaseRevision(pullRequest)]).stdout.trim();
                            revisionRange = baseSha + ".." + strategy_1.TEMP_PR_HEAD_BRANCH;
                            branchOrRevisionBeforeRebase = this.git.getCurrentBranchOrRevision();
                            rebaseEnv = needsCommitMessageFixup ? undefined : tslib_1.__assign(tslib_1.__assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' });
                            this.git.run(['rebase', '--interactive', '--autosquash', baseSha, strategy_1.TEMP_PR_HEAD_BRANCH], { stdio: 'inherit', env: rebaseEnv });
                            // Update pull requests commits to reference the pull request. This matches what
                            // Github does when pull requests are merged through the Web UI. The motivation is
                            // that it should be easy to determine which pull request contained a given commit.
                            // Note: The filter-branch command relies on the working tree, so we want to make sure
                            // that we are on the initial branch or revision where the merge script has been invoked.
                            this.git.run(['checkout', '-f', branchOrRevisionBeforeRebase]);
                            this.git.run(['filter-branch', '-f', '--msg-filter', MSG_FILTER_SCRIPT + " " + prNumber, revisionRange]);
                            failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);
                            if (failedBranches.length) {
                                return [2 /*return*/, failures_1.PullRequestFailure.mergeConflicts(failedBranches)];
                            }
                            this.pushTargetBranchesUpstream(targetBranches);
                            if (!(githubTargetBranch !== 'master')) return [3 /*break*/, 3];
                            localBranch = this.getLocalTargetBranchName(githubTargetBranch);
                            sha = this.git.run(['rev-parse', localBranch]).stdout.trim();
                            // Create a comment saying the PR was closed by the SHA.
                            return [4 /*yield*/, this.git.github.issues.createComment(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { issue_number: pullRequest.prNumber, body: "Closed by commit " + sha }))];
                        case 1:
                            // Create a comment saying the PR was closed by the SHA.
                            _a.sent();
                            // Actually close the PR.
                            return [4 /*yield*/, this.git.github.pulls.update(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { pull_number: pullRequest.prNumber, state: 'closed' }))];
                        case 2:
                            // Actually close the PR.
                            _a.sent();
                            _a.label = 3;
                        case 3: return [2 /*return*/, null];
                    }
                });
            });
        };
        return AutosquashMergeStrategy;
    }(strategy_1.MergeStrategy));
    exports.AutosquashMergeStrategy = AutosquashMergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQix5RUFBK0M7SUFFL0Msb0ZBQThEO0lBRTlELCtGQUErRjtJQUMvRixJQUFNLGlCQUFpQixHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTVGOzs7Ozs7T0FNRztJQUNIO1FBQTZDLG1EQUFhO1FBQTFEOztRQXlGQSxDQUFDO1FBeEZDOzs7Ozs7OztXQVFHO1FBQ0csdUNBQUssR0FBWCxVQUFZLFdBQXdCOzs7Ozs7NEJBQzNCLFFBQVEsR0FDWCxXQUFXLFNBREEsRUFBRSxjQUFjLEdBQzNCLFdBQVcsZUFEZ0IsRUFBRSxlQUFlLEdBQzVDLFdBQVcsZ0JBRGlDLEVBQUUsdUJBQXVCLEdBQ3JFLFdBQVcsd0JBRDBELEVBQUUsa0JBQWtCLEdBQ3pGLFdBQVcsbUJBRDhFLENBQzdFOzRCQUNoQixnRkFBZ0Y7NEJBQ2hGLGlGQUFpRjs0QkFDakYsb0ZBQW9GOzRCQUNwRixpRkFBaUY7NEJBQ2pGLHlDQUF5Qzs0QkFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw4QkFBbUIsRUFBRSxlQUFlLENBQUMsRUFBRTtnQ0FDaEYsc0JBQU8sNkJBQWtCLENBQUMsa0JBQWtCLEVBQUUsRUFBQzs2QkFDaEQ7NEJBUUssT0FBTyxHQUNULElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDOzRCQUV0RixhQUFhLEdBQU0sT0FBTyxVQUFLLDhCQUFxQixDQUFDOzRCQVFyRCw0QkFBNEIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7NEJBQ3JFLFNBQVMsR0FDWCx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsdUNBQUssT0FBTyxDQUFDLEdBQUcsS0FBRSxtQkFBbUIsRUFBRSxNQUFNLEdBQUMsQ0FBQzs0QkFDeEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQ1IsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsOEJBQW1CLENBQUMsRUFDekUsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDOzRCQUV4QyxnRkFBZ0Y7NEJBQ2hGLGtGQUFrRjs0QkFDbEYsbUZBQW1GOzRCQUNuRixzRkFBc0Y7NEJBQ3RGLHlGQUF5Rjs0QkFDekYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLDRCQUE0QixDQUFDLENBQUMsQ0FBQzs0QkFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQ1IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBSyxpQkFBaUIsU0FBSSxRQUFVLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQzs0QkFHMUYsY0FBYyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7NEJBRXhGLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtnQ0FDekIsc0JBQU8sNkJBQWtCLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFDOzZCQUMxRDs0QkFFRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7aUNBTTVDLENBQUEsa0JBQWtCLEtBQUssUUFBUSxDQUFBLEVBQS9CLHdCQUErQjs0QkFFM0IsV0FBVyxHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDOzRCQUVoRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ25FLHdEQUF3RDs0QkFDeEQscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsdUNBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUN4QixZQUFZLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFDbEMsSUFBSSxFQUFFLHNCQUFvQixHQUFLLElBQy9CLEVBQUE7OzRCQUxGLHdEQUF3RDs0QkFDeEQsU0FJRSxDQUFDOzRCQUNILHlCQUF5Qjs0QkFDekIscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sdUNBQzdCLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxLQUN4QixXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFDakMsS0FBSyxFQUFFLFFBQVEsSUFDZixFQUFBOzs0QkFMRix5QkFBeUI7NEJBQ3pCLFNBSUUsQ0FBQzs7Z0NBR0wsc0JBQU8sSUFBSSxFQUFDOzs7O1NBQ2I7UUFDSCw4QkFBQztJQUFELENBQUMsQUF6RkQsQ0FBNkMsd0JBQWEsR0F5RnpEO0lBekZZLDBEQUF1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogUGF0aCB0byB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsdGVyIHNjcmlwdC4gR2l0IGV4cGVjdHMgdGhpcyBwYXRocyB0byB1c2UgZm9yd2FyZCBzbGFzaGVzLiAqL1xuY29uc3QgTVNHX0ZJTFRFUl9TQ1JJUFQgPSBqb2luKF9fZGlybmFtZSwgJy4vY29tbWl0LW1lc3NhZ2UtZmlsdGVyLmpzJykucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgZG9lcyBub3QgdXNlIHRoZSBHaXRodWIgQVBJIGZvciBtZXJnaW5nLiBJbnN0ZWFkLCBpdCBmZXRjaGVzXG4gKiBhbGwgdGFyZ2V0IGJyYW5jaGVzIGFuZCB0aGUgUFIgbG9jYWxseS4gVGhlIFBSIGlzIHRoZW4gY2hlcnJ5LXBpY2tlZCB3aXRoIGF1dG9zcXVhc2hcbiAqIGVuYWJsZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLiBUaGUgYmVuZWZpdCBpcyB0aGUgc3VwcG9ydCBmb3IgZml4dXAgYW5kIHNxdWFzaCBjb21taXRzLlxuICogQSBub3RhYmxlIGRvd25zaWRlIHRob3VnaCBpcyB0aGF0IEdpdGh1YiBkb2VzIG5vdCBzaG93IHRoZSBQUiBhcyBgTWVyZ2VkYCBkdWUgdG8gbm9uXG4gKiBmYXN0LWZvcndhcmQgbWVyZ2VzXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICAvKipcbiAgICogTWVyZ2VzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGludG8gdGhlIHRhcmdldCBicmFuY2hlcyBhbmQgcHVzaGVzIHRoZSB0YXJnZXRcbiAgICogYnJhbmNoZXMgdXBzdHJlYW0uIFRoaXMgbWV0aG9kIHJlcXVpcmVzIHRoZSB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzIHRvIGJlIGZldGNoZWRcbiAgICogYWxyZWFkeSBhcyB3ZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZSB0YXJnZXQgYnJhbmNoZXMgcGVyIHB1bGwgcmVxdWVzdCBtZXJnZS4gVGhpc1xuICAgKiB3b3VsZCBjYXVzZXMgdW5uZWNlc3NhcnkgbXVsdGlwbGUgZmV0Y2ggcmVxdWVzdHMgd2hlbiBtdWx0aXBsZSBQUnMgYXJlIG1lcmdlZC5cbiAgICogQHRocm93cyB7R2l0Q29tbWFuZEVycm9yfSBBbiB1bmtub3duIEdpdCBjb21tYW5kIGVycm9yIG9jY3VycmVkIHRoYXQgaXMgbm90XG4gICAqICAgc3BlY2lmaWMgdG8gdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBvciBudWxsIGluIGNhc2Ugb2Ygc3VjY2Vzcy5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8UHVsbFJlcXVlc3RGYWlsdXJlfG51bGw+IHtcbiAgICBjb25zdCB7cHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLCBnaXRodWJUYXJnZXRCcmFuY2h9ID1cbiAgICAgICAgcHVsbFJlcXVlc3Q7XG4gICAgLy8gSW4gY2FzZSBhIHJlcXVpcmVkIGJhc2UgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWYgdGhlIHB1bGxcbiAgICAvLyByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuIFRoaXNcbiAgICAvLyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuIGUuZy5cbiAgICAvLyBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGVvd25lciBzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIC8vIFNIQSBmb3IgdGhlIGZpcnN0IGNvbW1pdCB0aGUgcHVsbCByZXF1ZXN0IGlzIGJhc2VkIG9uLiBVc3VhbGx5IHdlIHdvdWxkIGFibGVcbiAgICAvLyB0byBqdXN0IHJlbHkgb24gdGhlIGJhc2UgcmV2aXNpb24gcHJvdmlkZWQgYnkgYGdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uYCwgYnV0XG4gICAgLy8gdGhlIHJldmlzaW9uIHdvdWxkIHJlbHkgb24gdGhlIGFtb3VudCBvZiBjb21taXRzIGluIGEgcHVsbCByZXF1ZXN0LiBUaGlzIGlzIG5vdFxuICAgIC8vIHJlbGlhYmxlIGFzIHdlIHJlYmFzZSB0aGUgUFIgd2l0aCBhdXRvc3F1YXNoIHdoZXJlIHRoZSBhbW91bnQgb2YgY29tbWl0cyBjb3VsZFxuICAgIC8vIGNoYW5nZS4gV2Ugd29yayBhcm91bmQgdGhpcyBieSBwYXJzaW5nIHRoZSBiYXNlIHJldmlzaW9uIHNvIHRoYXQgd2UgaGF2ZSBhIGZpeGF0ZWRcbiAgICAvLyBTSEEgYmVmb3JlIHRoZSBhdXRvc3F1YXNoIHJlYmFzZSBpcyBwZXJmb3JtZWQuXG4gICAgY29uc3QgYmFzZVNoYSA9XG4gICAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jldi1wYXJzZScsIHRoaXMuZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3QpXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBHaXQgcmV2aXNpb24gcmFuZ2UgdGhhdCBtYXRjaGVzIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gYCR7YmFzZVNoYX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuXG4gICAgLy8gV2UgYWx3YXlzIHJlYmFzZSB0aGUgcHVsbCByZXF1ZXN0IHNvIHRoYXQgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMgYXJlIGF1dG9tYXRpY2FsbHlcbiAgICAvLyBjb2xsYXBzZWQuIEdpdCdzIGF1dG9zcXVhc2ggZnVuY3Rpb25hbGl0eSBkb2VzIG9ubHkgd29yayBpbiBpbnRlcmFjdGl2ZSByZWJhc2VzLCBzb1xuICAgIC8vIG91ciByZWJhc2UgaXMgYWx3YXlzIGludGVyYWN0aXZlLiBJbiByZWFsaXR5IHRob3VnaCwgdW5sZXNzIGEgY29tbWl0IG1lc3NhZ2UgZml4dXBcbiAgICAvLyBpcyBkZXNpcmVkLCB3ZSBzZXQgdGhlIGBHSVRfU0VRVUVOQ0VfRURJVE9SYCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBgdHJ1ZWAgc28gdGhhdFxuICAgIC8vIHRoZSByZWJhc2Ugc2VlbXMgaW50ZXJhY3RpdmUgdG8gR2l0LCB3aGlsZSBpdCdzIG5vdCBpbnRlcmFjdGl2ZSB0byB0aGUgdXNlci5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9naXQvZ2l0L2NvbW1pdC84OTFkNGEwMzEzZWRjMDNmN2UyZWNiOTZlZGVjNWQzMGRjMTgyMjk0LlxuICAgIGNvbnN0IGJyYW5jaE9yUmV2aXNpb25CZWZvcmVSZWJhc2UgPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAgIGNvbnN0IHJlYmFzZUVudiA9XG4gICAgICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID8gdW5kZWZpbmVkIDogey4uLnByb2Nlc3MuZW52LCBHSVRfU0VRVUVOQ0VfRURJVE9SOiAndHJ1ZSd9O1xuICAgIHRoaXMuZ2l0LnJ1bihcbiAgICAgICAgWydyZWJhc2UnLCAnLS1pbnRlcmFjdGl2ZScsICctLWF1dG9zcXVhc2gnLCBiYXNlU2hhLCBURU1QX1BSX0hFQURfQlJBTkNIXSxcbiAgICAgICAge3N0ZGlvOiAnaW5oZXJpdCcsIGVudjogcmViYXNlRW52fSk7XG5cbiAgICAvLyBVcGRhdGUgcHVsbCByZXF1ZXN0cyBjb21taXRzIHRvIHJlZmVyZW5jZSB0aGUgcHVsbCByZXF1ZXN0LiBUaGlzIG1hdGNoZXMgd2hhdFxuICAgIC8vIEdpdGh1YiBkb2VzIHdoZW4gcHVsbCByZXF1ZXN0cyBhcmUgbWVyZ2VkIHRocm91Z2ggdGhlIFdlYiBVSS4gVGhlIG1vdGl2YXRpb24gaXNcbiAgICAvLyB0aGF0IGl0IHNob3VsZCBiZSBlYXN5IHRvIGRldGVybWluZSB3aGljaCBwdWxsIHJlcXVlc3QgY29udGFpbmVkIGEgZ2l2ZW4gY29tbWl0LlxuICAgIC8vIE5vdGU6IFRoZSBmaWx0ZXItYnJhbmNoIGNvbW1hbmQgcmVsaWVzIG9uIHRoZSB3b3JraW5nIHRyZWUsIHNvIHdlIHdhbnQgdG8gbWFrZSBzdXJlXG4gICAgLy8gdGhhdCB3ZSBhcmUgb24gdGhlIGluaXRpYWwgYnJhbmNoIG9yIHJldmlzaW9uIHdoZXJlIHRoZSBtZXJnZSBzY3JpcHQgaGFzIGJlZW4gaW52b2tlZC5cbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIGJyYW5jaE9yUmV2aXNpb25CZWZvcmVSZWJhc2VdKTtcbiAgICB0aGlzLmdpdC5ydW4oXG4gICAgICAgIFsnZmlsdGVyLWJyYW5jaCcsICctZicsICctLW1zZy1maWx0ZXInLCBgJHtNU0dfRklMVEVSX1NDUklQVH0gJHtwck51bWJlcn1gLCByZXZpc2lvblJhbmdlXSk7XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcHVsbCByZXF1ZXN0IGludG8gYWxsIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzKTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0odGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgLy8gRm9yIFBScyB3aGljaCBkbyBub3QgdGFyZ2V0IHRoZSBgbWFzdGVyYCBicmFuY2ggb24gR2l0aHViLCBHaXRodWIgZG9lcyBub3QgYXV0b21hdGljYWxseVxuICAgIC8vIGNsb3NlIHRoZSBQUiB3aGVuIGl0cyBjb21taXQgaXMgcHVzaGVkIGludG8gdGhlIHJlcG9zaXRvcnkuICBUbyBlbnN1cmUgdGhlc2UgUFJzIGFyZVxuICAgIC8vIGNvcnJlY3RseSBtYXJrZWQgYXMgY2xvc2VkLCB3ZSBtdXN0IGRldGVjdCB0aGlzIHNpdHVhdGlvbiBhbmQgY2xvc2UgdGhlIFBSIHZpYSB0aGUgQVBJIGFmdGVyXG4gICAgLy8gdGhlIHVwc3RyZWFtIHB1c2hlcyBhcmUgY29tcGxldGVkLlxuICAgIGlmIChnaXRodWJUYXJnZXRCcmFuY2ggIT09ICdtYXN0ZXInKSB7XG4gICAgICAvKiogVGhlIGxvY2FsIGJyYW5jaCBuYW1lIG9mIHRoZSBnaXRodWIgdGFyZ2V0ZWQgYnJhbmNoLiAqL1xuICAgICAgY29uc3QgbG9jYWxCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShnaXRodWJUYXJnZXRCcmFuY2gpO1xuICAgICAgLyoqIFRoZSBTSEEgb2YgdGhlIGNvbW1pdCBwdXNoZWQgdG8gZ2l0aHViIHdoaWNoIHJlcHJlc2VudHMgY2xvc2luZyB0aGUgUFIuICovXG4gICAgICBjb25zdCBzaGEgPSB0aGlzLmdpdC5ydW4oWydyZXYtcGFyc2UnLCBsb2NhbEJyYW5jaF0pLnN0ZG91dC50cmltKCk7XG4gICAgICAvLyBDcmVhdGUgYSBjb21tZW50IHNheWluZyB0aGUgUFIgd2FzIGNsb3NlZCBieSB0aGUgU0hBLlxuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5jcmVhdGVDb21tZW50KHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IHB1bGxSZXF1ZXN0LnByTnVtYmVyLFxuICAgICAgICBib2R5OiBgQ2xvc2VkIGJ5IGNvbW1pdCAke3NoYX1gXG4gICAgICB9KTtcbiAgICAgIC8vIEFjdHVhbGx5IGNsb3NlIHRoZSBQUi5cbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy51cGRhdGUoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIHB1bGxfbnVtYmVyOiBwdWxsUmVxdWVzdC5wck51bWJlcixcbiAgICAgICAgc3RhdGU6ICdjbG9zZWQnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==