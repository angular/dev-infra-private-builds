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
                var prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, baseSha, revisionRange, branchOrRevisionBeforeRebase, rebaseEnv, failedBranches;
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
                    return [2 /*return*/, null];
                });
            });
        };
        return AutosquashMergeStrategy;
    }(strategy_1.MergeStrategy));
    exports.AutosquashMergeStrategy = AutosquashMergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQix5RUFBK0M7SUFFL0Msb0ZBQThEO0lBRTlELCtGQUErRjtJQUMvRixJQUFNLGlCQUFpQixHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTVGOzs7Ozs7T0FNRztJQUNIO1FBQTZDLG1EQUFhO1FBQTFEOztRQWdFQSxDQUFDO1FBL0RDOzs7Ozs7OztXQVFHO1FBQ0csdUNBQUssR0FBWCxVQUFZLFdBQXdCOzs7O29CQUMzQixRQUFRLEdBQThELFdBQVcsU0FBekUsRUFBRSxjQUFjLEdBQThDLFdBQVcsZUFBekQsRUFBRSxlQUFlLEdBQTZCLFdBQVcsZ0JBQXhDLEVBQUUsdUJBQXVCLEdBQUksV0FBVyx3QkFBZixDQUFnQjtvQkFDekYsZ0ZBQWdGO29CQUNoRixpRkFBaUY7b0JBQ2pGLG9GQUFvRjtvQkFDcEYsaUZBQWlGO29CQUNqRix5Q0FBeUM7b0JBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsOEJBQW1CLEVBQUUsZUFBZSxDQUFDLEVBQUU7d0JBQ2hGLHNCQUFPLDZCQUFrQixDQUFDLGtCQUFrQixFQUFFLEVBQUM7cUJBQ2hEO29CQVFLLE9BQU8sR0FDVCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFdEYsYUFBYSxHQUFNLE9BQU8sVUFBSyw4QkFBcUIsQ0FBQztvQkFRckQsNEJBQTRCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO29CQUNyRSxTQUFTLEdBQ1gsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLHVDQUFLLE9BQU8sQ0FBQyxHQUFHLEtBQUUsbUJBQW1CLEVBQUUsTUFBTSxHQUFDLENBQUM7b0JBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUNSLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLDhCQUFtQixDQUFDLEVBQ3pFLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztvQkFFeEMsZ0ZBQWdGO29CQUNoRixrRkFBa0Y7b0JBQ2xGLG1GQUFtRjtvQkFDbkYsc0ZBQXNGO29CQUN0Rix5RkFBeUY7b0JBQ3pGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7b0JBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUNSLENBQUMsZUFBZSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUssaUJBQWlCLFNBQUksUUFBVSxFQUFFLGFBQWEsQ0FBQyxDQUFDLENBQUM7b0JBRzFGLGNBQWMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO29CQUV4RixJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7d0JBQ3pCLHNCQUFPLDZCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsRUFBQztxQkFDMUQ7b0JBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxDQUFDO29CQUNoRCxzQkFBTyxJQUFJLEVBQUM7OztTQUNiO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBaEVELENBQTZDLHdCQUFhLEdBZ0V6RDtJQWhFWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtNZXJnZVN0cmF0ZWd5LCBURU1QX1BSX0hFQURfQlJBTkNIfSBmcm9tICcuL3N0cmF0ZWd5JztcblxuLyoqIFBhdGggdG8gdGhlIGNvbW1pdCBtZXNzYWdlIGZpbHRlciBzY3JpcHQuIEdpdCBleHBlY3RzIHRoaXMgcGF0aHMgdG8gdXNlIGZvcndhcmQgc2xhc2hlcy4gKi9cbmNvbnN0IE1TR19GSUxURVJfU0NSSVBUID0gam9pbihfX2Rpcm5hbWUsICcuL2NvbW1pdC1tZXNzYWdlLWZpbHRlci5qcycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblxuLyoqXG4gKiBNZXJnZSBzdHJhdGVneSB0aGF0IGRvZXMgbm90IHVzZSB0aGUgR2l0aHViIEFQSSBmb3IgbWVyZ2luZy4gSW5zdGVhZCwgaXQgZmV0Y2hlc1xuICogYWxsIHRhcmdldCBicmFuY2hlcyBhbmQgdGhlIFBSIGxvY2FsbHkuIFRoZSBQUiBpcyB0aGVuIGNoZXJyeS1waWNrZWQgd2l0aCBhdXRvc3F1YXNoXG4gKiBlbmFibGVkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcy4gVGhlIGJlbmVmaXQgaXMgdGhlIHN1cHBvcnQgZm9yIGZpeHVwIGFuZCBzcXVhc2ggY29tbWl0cy5cbiAqIEEgbm90YWJsZSBkb3duc2lkZSB0aG91Z2ggaXMgdGhhdCBHaXRodWIgZG9lcyBub3Qgc2hvdyB0aGUgUFIgYXMgYE1lcmdlZGAgZHVlIHRvIG5vblxuICogZmFzdC1mb3J3YXJkIG1lcmdlc1xuICovXG5leHBvcnQgY2xhc3MgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMgYW5kIHB1c2hlcyB0aGUgdGFyZ2V0XG4gICAqIGJyYW5jaGVzIHVwc3RyZWFtLiBUaGlzIG1ldGhvZCByZXF1aXJlcyB0aGUgdGVtcG9yYXJ5IHRhcmdldCBicmFuY2hlcyB0byBiZSBmZXRjaGVkXG4gICAqIGFscmVhZHkgYXMgd2UgZG9uJ3Qgd2FudCB0byBmZXRjaCB0aGUgdGFyZ2V0IGJyYW5jaGVzIHBlciBwdWxsIHJlcXVlc3QgbWVyZ2UuIFRoaXNcbiAgICogd291bGQgY2F1c2VzIHVubmVjZXNzYXJ5IG11bHRpcGxlIGZldGNoIHJlcXVlc3RzIHdoZW4gbXVsdGlwbGUgUFJzIGFyZSBtZXJnZWQuXG4gICAqIEB0aHJvd3Mge0dpdENvbW1hbmRFcnJvcn0gQW4gdW5rbm93biBHaXQgY29tbWFuZCBlcnJvciBvY2N1cnJlZCB0aGF0IGlzIG5vdFxuICAgKiAgIHNwZWNpZmljIHRvIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgb3IgbnVsbCBpbiBjYXNlIG9mIHN1Y2Nlc3MuXG4gICAqL1xuICBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZXxudWxsPiB7XG4gICAgY29uc3Qge3ByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cH0gPSBwdWxsUmVxdWVzdDtcbiAgICAvLyBJbiBjYXNlIGEgcmVxdWlyZWQgYmFzZSBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZiB0aGUgcHVsbFxuICAgIC8vIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS4gVGhpc1xuICAgIC8vIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC4gZS5nLlxuICAgIC8vIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZW93bmVyIHNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgLy8gU0hBIGZvciB0aGUgZmlyc3QgY29tbWl0IHRoZSBwdWxsIHJlcXVlc3QgaXMgYmFzZWQgb24uIFVzdWFsbHkgd2Ugd291bGQgYWJsZVxuICAgIC8vIHRvIGp1c3QgcmVseSBvbiB0aGUgYmFzZSByZXZpc2lvbiBwcm92aWRlZCBieSBgZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb25gLCBidXRcbiAgICAvLyB0aGUgcmV2aXNpb24gd291bGQgcmVseSBvbiB0aGUgYW1vdW50IG9mIGNvbW1pdHMgaW4gYSBwdWxsIHJlcXVlc3QuIFRoaXMgaXMgbm90XG4gICAgLy8gcmVsaWFibGUgYXMgd2UgcmViYXNlIHRoZSBQUiB3aXRoIGF1dG9zcXVhc2ggd2hlcmUgdGhlIGFtb3VudCBvZiBjb21taXRzIGNvdWxkXG4gICAgLy8gY2hhbmdlLiBXZSB3b3JrIGFyb3VuZCB0aGlzIGJ5IHBhcnNpbmcgdGhlIGJhc2UgcmV2aXNpb24gc28gdGhhdCB3ZSBoYXZlIGEgZml4YXRlZFxuICAgIC8vIFNIQSBiZWZvcmUgdGhlIGF1dG9zcXVhc2ggcmViYXNlIGlzIHBlcmZvcm1lZC5cbiAgICBjb25zdCBiYXNlU2hhID1cbiAgICAgICAgdGhpcy5naXQucnVuKFsncmV2LXBhcnNlJywgdGhpcy5nZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdCldKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIEdpdCByZXZpc2lvbiByYW5nZSB0aGF0IG1hdGNoZXMgdGhlIHB1bGwgcmVxdWVzdCBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSBgJHtiYXNlU2hhfS4uJHtURU1QX1BSX0hFQURfQlJBTkNIfWA7XG5cbiAgICAvLyBXZSBhbHdheXMgcmViYXNlIHRoZSBwdWxsIHJlcXVlc3Qgc28gdGhhdCBmaXh1cCBvciBzcXVhc2ggY29tbWl0cyBhcmUgYXV0b21hdGljYWxseVxuICAgIC8vIGNvbGxhcHNlZC4gR2l0J3MgYXV0b3NxdWFzaCBmdW5jdGlvbmFsaXR5IGRvZXMgb25seSB3b3JrIGluIGludGVyYWN0aXZlIHJlYmFzZXMsIHNvXG4gICAgLy8gb3VyIHJlYmFzZSBpcyBhbHdheXMgaW50ZXJhY3RpdmUuIEluIHJlYWxpdHkgdGhvdWdoLCB1bmxlc3MgYSBjb21taXQgbWVzc2FnZSBmaXh1cFxuICAgIC8vIGlzIGRlc2lyZWQsIHdlIHNldCB0aGUgYEdJVF9TRVFVRU5DRV9FRElUT1JgIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIGB0cnVlYCBzbyB0aGF0XG4gICAgLy8gdGhlIHJlYmFzZSBzZWVtcyBpbnRlcmFjdGl2ZSB0byBHaXQsIHdoaWxlIGl0J3Mgbm90IGludGVyYWN0aXZlIHRvIHRoZSB1c2VyLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2dpdC9naXQvY29tbWl0Lzg5MWQ0YTAzMTNlZGMwM2Y3ZTJlY2I5NmVkZWM1ZDMwZGMxODIyOTQuXG4gICAgY29uc3QgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZSA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gICAgY29uc3QgcmViYXNlRW52ID1cbiAgICAgICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPyB1bmRlZmluZWQgOiB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ307XG4gICAgdGhpcy5naXQucnVuKFxuICAgICAgICBbJ3JlYmFzZScsICctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCcsIGJhc2VTaGEsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdLFxuICAgICAgICB7c3RkaW86ICdpbmhlcml0JywgZW52OiByZWJhc2VFbnZ9KTtcblxuICAgIC8vIFVwZGF0ZSBwdWxsIHJlcXVlc3RzIGNvbW1pdHMgdG8gcmVmZXJlbmNlIHRoZSBwdWxsIHJlcXVlc3QuIFRoaXMgbWF0Y2hlcyB3aGF0XG4gICAgLy8gR2l0aHViIGRvZXMgd2hlbiBwdWxsIHJlcXVlc3RzIGFyZSBtZXJnZWQgdGhyb3VnaCB0aGUgV2ViIFVJLiBUaGUgbW90aXZhdGlvbiBpc1xuICAgIC8vIHRoYXQgaXQgc2hvdWxkIGJlIGVhc3kgdG8gZGV0ZXJtaW5lIHdoaWNoIHB1bGwgcmVxdWVzdCBjb250YWluZWQgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gTm90ZTogVGhlIGZpbHRlci1icmFuY2ggY29tbWFuZCByZWxpZXMgb24gdGhlIHdvcmtpbmcgdHJlZSwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmVcbiAgICAvLyB0aGF0IHdlIGFyZSBvbiB0aGUgaW5pdGlhbCBicmFuY2ggb3IgcmV2aXNpb24gd2hlcmUgdGhlIG1lcmdlIHNjcmlwdCBoYXMgYmVlbiBpbnZva2VkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihcbiAgICAgICAgWydmaWx0ZXItYnJhbmNoJywgJy1mJywgJy0tbXNnLWZpbHRlcicsIGAke01TR19GSUxURVJfU0NSSVBUfSAke3ByTnVtYmVyfWAsIHJldmlzaW9uUmFuZ2VdKTtcblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSBwdWxsIHJlcXVlc3QgaW50byBhbGwgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbSh0YXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==