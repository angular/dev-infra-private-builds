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
                var prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, baseSha, revisionRange, branchBeforeRebase, rebaseEnv, failedBranches;
                return tslib_1.__generator(this, function (_a) {
                    prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup;
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
                    branchBeforeRebase = this.git.getCurrentBranch();
                    rebaseEnv = needsCommitMessageFixup ? undefined : tslib_1.__assign(tslib_1.__assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' });
                    this.git.run(['rebase', '--interactive', '--autosquash', baseSha, strategy_1.TEMP_PR_HEAD_BRANCH], { stdio: 'inherit', env: rebaseEnv });
                    // Update pull requests commits to reference the pull request. This matches what
                    // Github does when pull requests are merged through the Web UI. The motivation is
                    // that it should be easy to determine which pull request contained a given commit.
                    // **Note**: The filter-branch command relies on the working tree, so we want to make
                    // sure that we are on the initial branch where the merge script has been run.
                    this.git.run(['checkout', '-f', branchBeforeRebase]);
                    this.git.run(['filter-branch', '-f', '--msg-filter', MSG_FILTER_SCRIPT + " " + prNumber, revisionRange]);
                    failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);
                    if (failedBranches.length) {
                        return [2 /*return*/, failures_1.PullRequestFailure.mergeConflicts(failedBranches)];
                    }
                    this.pushTargetBranchesUpstream(targetBranches);
                    return [2 /*return*/, null];
                });
            });
        };
        return AutosquashMergeStrategy;
    }(strategy_1.MergeStrategy));
    exports.AutosquashMergeStrategy = AutosquashMergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBLDZCQUEwQjtJQUMxQix5RUFBK0M7SUFFL0Msb0ZBQThEO0lBRTlELCtGQUErRjtJQUMvRixJQUFNLGlCQUFpQixHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTVGOzs7Ozs7T0FNRztJQUNIO1FBQTZDLG1EQUFhO1FBQTFEOztRQWdFQSxDQUFDO1FBL0RDOzs7Ozs7OztXQVFHO1FBQ0csdUNBQUssR0FBWCxVQUFZLFdBQXdCOzs7O29CQUMzQixRQUFRLEdBQThELFdBQVcsU0FBekUsRUFBRSxjQUFjLEdBQThDLFdBQVcsZUFBekQsRUFBRSxlQUFlLEdBQTZCLFdBQVcsZ0JBQXhDLEVBQUUsdUJBQXVCLEdBQUksV0FBVyx3QkFBZixDQUFnQjtvQkFDekYsZ0ZBQWdGO29CQUNoRixpRkFBaUY7b0JBQ2pGLG9GQUFvRjtvQkFDcEYsaUZBQWlGO29CQUNqRix5Q0FBeUM7b0JBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsOEJBQW1CLEVBQUUsZUFBZSxDQUFDLEVBQUU7d0JBQ2hGLHNCQUFPLDZCQUFrQixDQUFDLGtCQUFrQixFQUFFLEVBQUM7cUJBQ2hEO29CQVFLLE9BQU8sR0FDVCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFdEYsYUFBYSxHQUFNLE9BQU8sVUFBSyw4QkFBcUIsQ0FBQztvQkFRckQsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNqRCxTQUFTLEdBQ1gsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLHVDQUFLLE9BQU8sQ0FBQyxHQUFHLEtBQUUsbUJBQW1CLEVBQUUsTUFBTSxHQUFDLENBQUM7b0JBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUNSLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLDhCQUFtQixDQUFDLEVBQ3pFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztvQkFFeEMsZ0ZBQWdGO29CQUNoRixrRkFBa0Y7b0JBQ2xGLG1GQUFtRjtvQkFDbkYscUZBQXFGO29CQUNyRiw4RUFBOEU7b0JBQzlFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7b0JBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUNSLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUssaUJBQWlCLFNBQUksUUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBRzFGLGNBQWMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUV4RixJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7d0JBQ3pCLHNCQUFPLDZCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBQztxQkFDMUQ7b0JBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoRCxzQkFBTyxJQUFJLEVBQUM7OztTQUNiO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBaEVELENBQTZDLHdCQUFhLEdBZ0V6RDtJQWhFWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogUGF0aCB0byB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsdGVyIHNjcmlwdC4gR2l0IGV4cGVjdHMgdGhpcyBwYXRocyB0byB1c2UgZm9yd2FyZCBzbGFzaGVzLiAqL1xuY29uc3QgTVNHX0ZJTFRFUl9TQ1JJUFQgPSBqb2luKF9fZGlybmFtZSwgJy4vY29tbWl0LW1lc3NhZ2UtZmlsdGVyLmpzJykucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4vKipcbiAqIE1lcmdlIHN0cmF0ZWd5IHRoYXQgZG9lcyBub3QgdXNlIHRoZSBHaXRodWIgQVBJIGZvciBtZXJnaW5nLiBJbnN0ZWFkLCBpdCBmZXRjaGVzXG4gKiBhbGwgdGFyZ2V0IGJyYW5jaGVzIGFuZCB0aGUgUFIgbG9jYWxseS4gVGhlIFBSIGlzIHRoZW4gY2hlcnJ5LXBpY2tlZCB3aXRoIGF1dG9zcXVhc2hcbiAqIGVuYWJsZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLiBUaGUgYmVuZWZpdCBpcyB0aGUgc3VwcG9ydCBmb3IgZml4dXAgYW5kIHNxdWFzaCBjb21taXRzLlxuICogQSBub3RhYmxlIGRvd25zaWRlIHRob3VnaCBpcyB0aGF0IEdpdGh1YiBkb2VzIG5vdCBzaG93IHRoZSBQUiBhcyBgTWVyZ2VkYCBkdWUgdG8gbm9uXG4gKiBmYXN0LWZvcndhcmQgbWVyZ2VzXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICAvKipcbiAgICogTWVyZ2VzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGludG8gdGhlIHRhcmdldCBicmFuY2hlcyBhbmQgcHVzaGVzIHRoZSB0YXJnZXRcbiAgICogYnJhbmNoZXMgdXBzdHJlYW0uIFRoaXMgbWV0aG9kIHJlcXVpcmVzIHRoZSB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzIHRvIGJlIGZldGNoZWRcbiAgICogYWxyZWFkeSBhcyB3ZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZSB0YXJnZXQgYnJhbmNoZXMgcGVyIHB1bGwgcmVxdWVzdCBtZXJnZS4gVGhpc1xuICAgKiB3b3VsZCBjYXVzZXMgdW5uZWNlc3NhcnkgbXVsdGlwbGUgZmV0Y2ggcmVxdWVzdHMgd2hlbiBtdWx0aXBsZSBQUnMgYXJlIG1lcmdlZC5cbiAgICogQHRocm93cyB7R2l0Q29tbWFuZEVycm9yfSBBbiB1bmtub3duIEdpdCBjb21tYW5kIGVycm9yIG9jY3VycmVkIHRoYXQgaXMgbm90XG4gICAqICAgc3BlY2lmaWMgdG8gdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBvciBudWxsIGluIGNhc2Ugb2Ygc3VjY2Vzcy5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8UHVsbFJlcXVlc3RGYWlsdXJlfG51bGw+IHtcbiAgICBjb25zdCB7cHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9IHB1bGxSZXF1ZXN0O1xuICAgIC8vIEluIGNhc2UgYSByZXF1aXJlZCBiYXNlIGlzIHNwZWNpZmllZCBmb3IgdGhpcyBwdWxsIHJlcXVlc3QsIGNoZWNrIGlmIHRoZSBwdWxsXG4gICAgLy8gcmVxdWVzdCBjb250YWlucyB0aGUgZ2l2ZW4gY29tbWl0LiBJZiBub3QsIHJldHVybiBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlLiBUaGlzXG4gICAgLy8gY2hlY2sgaXMgdXNlZnVsIGZvciBlbmZvcmNpbmcgdGhhdCBQUnMgYXJlIHJlYmFzZWQgb24gdG9wIG9mIGEgZ2l2ZW4gY29tbWl0LiBlLmcuXG4gICAgLy8gYSBjb21taXQgdGhhdCBjaGFuZ2VzIHRoZSBjb2Rlb3duZXIgc2hpcCB2YWxpZGF0aW9uLiBQUnMgd2hpY2ggYXJlIG5vdCByZWJhc2VkXG4gICAgLy8gY291bGQgYnlwYXNzIG5ldyBjb2Rlb3duZXIgc2hpcCBydWxlcy5cbiAgICBpZiAocmVxdWlyZWRCYXNlU2hhICYmICF0aGlzLmdpdC5oYXNDb21taXQoVEVNUF9QUl9IRUFEX0JSQU5DSCwgcmVxdWlyZWRCYXNlU2hhKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bnNhdGlzZmllZEJhc2VTaGEoKTtcbiAgICB9XG5cbiAgICAvLyBTSEEgZm9yIHRoZSBmaXJzdCBjb21taXQgdGhlIHB1bGwgcmVxdWVzdCBpcyBiYXNlZCBvbi4gVXN1YWxseSB3ZSB3b3VsZCBhYmxlXG4gICAgLy8gdG8ganVzdCByZWx5IG9uIHRoZSBiYXNlIHJldmlzaW9uIHByb3ZpZGVkIGJ5IGBnZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbmAsIGJ1dFxuICAgIC8vIHRoZSByZXZpc2lvbiB3b3VsZCByZWx5IG9uIHRoZSBhbW91bnQgb2YgY29tbWl0cyBpbiBhIHB1bGwgcmVxdWVzdC4gVGhpcyBpcyBub3RcbiAgICAvLyByZWxpYWJsZSBhcyB3ZSByZWJhc2UgdGhlIFBSIHdpdGggYXV0b3NxdWFzaCB3aGVyZSB0aGUgYW1vdW50IG9mIGNvbW1pdHMgY291bGRcbiAgICAvLyBjaGFuZ2UuIFdlIHdvcmsgYXJvdW5kIHRoaXMgYnkgcGFyc2luZyB0aGUgYmFzZSByZXZpc2lvbiBzbyB0aGF0IHdlIGhhdmUgYSBmaXhhdGVkXG4gICAgLy8gU0hBIGJlZm9yZSB0aGUgYXV0b3NxdWFzaCByZWJhc2UgaXMgcGVyZm9ybWVkLlxuICAgIGNvbnN0IGJhc2VTaGEgPVxuICAgICAgICB0aGlzLmdpdC5ydW4oWydyZXYtcGFyc2UnLCB0aGlzLmdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0KV0pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gR2l0IHJldmlzaW9uIHJhbmdlIHRoYXQgbWF0Y2hlcyB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdHMuXG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IGAke2Jhc2VTaGF9Li4ke1RFTVBfUFJfSEVBRF9CUkFOQ0h9YDtcblxuICAgIC8vIFdlIGFsd2F5cyByZWJhc2UgdGhlIHB1bGwgcmVxdWVzdCBzbyB0aGF0IGZpeHVwIG9yIHNxdWFzaCBjb21taXRzIGFyZSBhdXRvbWF0aWNhbGx5XG4gICAgLy8gY29sbGFwc2VkLiBHaXQncyBhdXRvc3F1YXNoIGZ1bmN0aW9uYWxpdHkgZG9lcyBvbmx5IHdvcmsgaW4gaW50ZXJhY3RpdmUgcmViYXNlcywgc29cbiAgICAvLyBvdXIgcmViYXNlIGlzIGFsd2F5cyBpbnRlcmFjdGl2ZS4gSW4gcmVhbGl0eSB0aG91Z2gsIHVubGVzcyBhIGNvbW1pdCBtZXNzYWdlIGZpeHVwXG4gICAgLy8gaXMgZGVzaXJlZCwgd2Ugc2V0IHRoZSBgR0lUX1NFUVVFTkNFX0VESVRPUmAgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gYHRydWVgIHNvIHRoYXRcbiAgICAvLyB0aGUgcmViYXNlIHNlZW1zIGludGVyYWN0aXZlIHRvIEdpdCwgd2hpbGUgaXQncyBub3QgaW50ZXJhY3RpdmUgdG8gdGhlIHVzZXIuXG4gICAgLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZ2l0L2dpdC9jb21taXQvODkxZDRhMDMxM2VkYzAzZjdlMmVjYjk2ZWRlYzVkMzBkYzE4MjI5NC5cbiAgICBjb25zdCBicmFuY2hCZWZvcmVSZWJhc2UgPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoKCk7XG4gICAgY29uc3QgcmViYXNlRW52ID1cbiAgICAgICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPyB1bmRlZmluZWQgOiB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ307XG4gICAgdGhpcy5naXQucnVuKFxuICAgICAgICBbJ3JlYmFzZScsICctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCcsIGJhc2VTaGEsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdLFxuICAgICAgICB7c3RkaW86ICdpbmhlcml0JywgZW52OiByZWJhc2VFbnZ9KTtcblxuICAgIC8vIFVwZGF0ZSBwdWxsIHJlcXVlc3RzIGNvbW1pdHMgdG8gcmVmZXJlbmNlIHRoZSBwdWxsIHJlcXVlc3QuIFRoaXMgbWF0Y2hlcyB3aGF0XG4gICAgLy8gR2l0aHViIGRvZXMgd2hlbiBwdWxsIHJlcXVlc3RzIGFyZSBtZXJnZWQgdGhyb3VnaCB0aGUgV2ViIFVJLiBUaGUgbW90aXZhdGlvbiBpc1xuICAgIC8vIHRoYXQgaXQgc2hvdWxkIGJlIGVhc3kgdG8gZGV0ZXJtaW5lIHdoaWNoIHB1bGwgcmVxdWVzdCBjb250YWluZWQgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gKipOb3RlKio6IFRoZSBmaWx0ZXItYnJhbmNoIGNvbW1hbmQgcmVsaWVzIG9uIHRoZSB3b3JraW5nIHRyZWUsIHNvIHdlIHdhbnQgdG8gbWFrZVxuICAgIC8vIHN1cmUgdGhhdCB3ZSBhcmUgb24gdGhlIGluaXRpYWwgYnJhbmNoIHdoZXJlIHRoZSBtZXJnZSBzY3JpcHQgaGFzIGJlZW4gcnVuLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgYnJhbmNoQmVmb3JlUmViYXNlXSk7XG4gICAgdGhpcy5naXQucnVuKFxuICAgICAgICBbJ2ZpbHRlci1icmFuY2gnLCAnLWYnLCAnLS1tc2ctZmlsdGVyJywgYCR7TVNHX0ZJTFRFUl9TQ1JJUFR9ICR7cHJOdW1iZXJ9YCwgcmV2aXNpb25SYW5nZV0pO1xuXG4gICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHB1bGwgcmVxdWVzdCBpbnRvIGFsbCBkZXRlcm1pbmVkIHRhcmdldCBicmFuY2hlcy5cbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcyk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKHRhcmdldEJyYW5jaGVzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19