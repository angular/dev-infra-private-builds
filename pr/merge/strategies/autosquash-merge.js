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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQix5RUFBK0M7SUFFL0Msb0ZBQThEO0lBRTlELCtGQUErRjtJQUMvRixJQUFNLGlCQUFpQixHQUFHLFdBQUksQ0FBQyxTQUFTLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTVGOzs7Ozs7T0FNRztJQUNIO1FBQTZDLG1EQUFhO1FBQTFEOztRQXlGQSxDQUFDO1FBeEZDOzs7Ozs7OztXQVFHO1FBQ1ksdUNBQUssR0FBcEIsVUFBcUIsV0FBd0I7Ozs7Ozs0QkFDcEMsUUFBUSxHQUNYLFdBQVcsU0FEQSxFQUFFLGNBQWMsR0FDM0IsV0FBVyxlQURnQixFQUFFLGVBQWUsR0FDNUMsV0FBVyxnQkFEaUMsRUFBRSx1QkFBdUIsR0FDckUsV0FBVyx3QkFEMEQsRUFBRSxrQkFBa0IsR0FDekYsV0FBVyxtQkFEOEUsQ0FDN0U7NEJBQ2hCLGdGQUFnRjs0QkFDaEYsaUZBQWlGOzRCQUNqRixvRkFBb0Y7NEJBQ3BGLGlGQUFpRjs0QkFDakYseUNBQXlDOzRCQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDhCQUFtQixFQUFFLGVBQWUsQ0FBQyxFQUFFO2dDQUNoRixzQkFBTyw2QkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxFQUFDOzZCQUNoRDs0QkFRSyxPQUFPLEdBQ1QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBRXRGLGFBQWEsR0FBTSxPQUFPLFVBQUssOEJBQXFCLENBQUM7NEJBUXJELDRCQUE0QixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQzs0QkFDckUsU0FBUyxHQUNYLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyx1Q0FBSyxPQUFPLENBQUMsR0FBRyxLQUFFLG1CQUFtQixFQUFFLE1BQU0sR0FBQyxDQUFDOzRCQUN4RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FDUixDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSw4QkFBbUIsQ0FBQyxFQUN6RSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBQyxDQUFDLENBQUM7NEJBRXhDLGdGQUFnRjs0QkFDaEYsa0ZBQWtGOzRCQUNsRixtRkFBbUY7NEJBQ25GLHNGQUFzRjs0QkFDdEYseUZBQXlGOzRCQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDOzRCQUMvRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FDUixDQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFLLGlCQUFpQixTQUFJLFFBQVUsRUFBRSxhQUFhLENBQUMsQ0FBQyxDQUFDOzRCQUcxRixjQUFjLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQzs0QkFFeEYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO2dDQUN6QixzQkFBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLEVBQUM7NkJBQzFEOzRCQUVELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxjQUFjLENBQUMsQ0FBQztpQ0FNNUMsQ0FBQSxrQkFBa0IsS0FBSyxRQUFRLENBQUEsRUFBL0Isd0JBQStCOzRCQUUzQixXQUFXLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDLENBQUM7NEJBRWhFLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDbkUsd0RBQXdEOzRCQUN4RCxxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSx1Q0FDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEtBQ3hCLFlBQVksRUFBRSxXQUFXLENBQUMsUUFBUSxFQUNsQyxJQUFJLEVBQUUsc0JBQW9CLEdBQUssSUFDL0IsRUFBQTs7NEJBTEYsd0RBQXdEOzRCQUN4RCxTQUlFLENBQUM7NEJBQ0gseUJBQXlCOzRCQUN6QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSx1Q0FDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEtBQ3hCLFdBQVcsRUFBRSxXQUFXLENBQUMsUUFBUSxFQUNqQyxLQUFLLEVBQUUsUUFBUSxJQUNmLEVBQUE7OzRCQUxGLHlCQUF5Qjs0QkFDekIsU0FJRSxDQUFDOztnQ0FHTCxzQkFBTyxJQUFJLEVBQUM7Ozs7U0FDYjtRQUNILDhCQUFDO0lBQUQsQ0FBQyxBQXpGRCxDQUE2Qyx3QkFBYSxHQXlGekQ7SUF6RlksMERBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi4vZmFpbHVyZXMnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdH0gZnJvbSAnLi4vcHVsbC1yZXF1ZXN0JztcbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBQYXRoIHRvIHRoZSBjb21taXQgbWVzc2FnZSBmaWx0ZXIgc2NyaXB0LiBHaXQgZXhwZWN0cyB0aGlzIHBhdGhzIHRvIHVzZSBmb3J3YXJkIHNsYXNoZXMuICovXG5jb25zdCBNU0dfRklMVEVSX1NDUklQVCA9IGpvaW4oX19kaXJuYW1lLCAnLi9jb21taXQtbWVzc2FnZS1maWx0ZXIuanMnKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdCB1c2UgdGhlIEdpdGh1YiBBUEkgZm9yIG1lcmdpbmcuIEluc3RlYWQsIGl0IGZldGNoZXNcbiAqIGFsbCB0YXJnZXQgYnJhbmNoZXMgYW5kIHRoZSBQUiBsb2NhbGx5LiBUaGUgUFIgaXMgdGhlbiBjaGVycnktcGlja2VkIHdpdGggYXV0b3NxdWFzaFxuICogZW5hYmxlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMuIFRoZSBiZW5lZml0IGlzIHRoZSBzdXBwb3J0IGZvciBmaXh1cCBhbmQgc3F1YXNoIGNvbW1pdHMuXG4gKiBBIG5vdGFibGUgZG93bnNpZGUgdGhvdWdoIGlzIHRoYXQgR2l0aHViIGRvZXMgbm90IHNob3cgdGhlIFBSIGFzIGBNZXJnZWRgIGR1ZSB0byBub25cbiAqIGZhc3QtZm9yd2FyZCBtZXJnZXNcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzIGFuZCBwdXNoZXMgdGhlIHRhcmdldFxuICAgKiBicmFuY2hlcyB1cHN0cmVhbS4gVGhpcyBtZXRob2QgcmVxdWlyZXMgdGhlIHRlbXBvcmFyeSB0YXJnZXQgYnJhbmNoZXMgdG8gYmUgZmV0Y2hlZFxuICAgKiBhbHJlYWR5IGFzIHdlIGRvbid0IHdhbnQgdG8gZmV0Y2ggdGhlIHRhcmdldCBicmFuY2hlcyBwZXIgcHVsbCByZXF1ZXN0IG1lcmdlLiBUaGlzXG4gICAqIHdvdWxkIGNhdXNlcyB1bm5lY2Vzc2FyeSBtdWx0aXBsZSBmZXRjaCByZXF1ZXN0cyB3aGVuIG11bHRpcGxlIFBScyBhcmUgbWVyZ2VkLlxuICAgKiBAdGhyb3dzIHtHaXRDb21tYW5kRXJyb3J9IEFuIHVua25vd24gR2l0IGNvbW1hbmQgZXJyb3Igb2NjdXJyZWQgdGhhdCBpcyBub3RcbiAgICogICBzcGVjaWZpYyB0byB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIG9yIG51bGwgaW4gY2FzZSBvZiBzdWNjZXNzLlxuICAgKi9cbiAgb3ZlcnJpZGUgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsIGdpdGh1YlRhcmdldEJyYW5jaH0gPVxuICAgICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJbiBjYXNlIGEgcmVxdWlyZWQgYmFzZSBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZiB0aGUgcHVsbFxuICAgIC8vIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS4gVGhpc1xuICAgIC8vIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC4gZS5nLlxuICAgIC8vIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZW93bmVyIHNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgLy8gU0hBIGZvciB0aGUgZmlyc3QgY29tbWl0IHRoZSBwdWxsIHJlcXVlc3QgaXMgYmFzZWQgb24uIFVzdWFsbHkgd2Ugd291bGQgYWJsZVxuICAgIC8vIHRvIGp1c3QgcmVseSBvbiB0aGUgYmFzZSByZXZpc2lvbiBwcm92aWRlZCBieSBgZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb25gLCBidXRcbiAgICAvLyB0aGUgcmV2aXNpb24gd291bGQgcmVseSBvbiB0aGUgYW1vdW50IG9mIGNvbW1pdHMgaW4gYSBwdWxsIHJlcXVlc3QuIFRoaXMgaXMgbm90XG4gICAgLy8gcmVsaWFibGUgYXMgd2UgcmViYXNlIHRoZSBQUiB3aXRoIGF1dG9zcXVhc2ggd2hlcmUgdGhlIGFtb3VudCBvZiBjb21taXRzIGNvdWxkXG4gICAgLy8gY2hhbmdlLiBXZSB3b3JrIGFyb3VuZCB0aGlzIGJ5IHBhcnNpbmcgdGhlIGJhc2UgcmV2aXNpb24gc28gdGhhdCB3ZSBoYXZlIGEgZml4YXRlZFxuICAgIC8vIFNIQSBiZWZvcmUgdGhlIGF1dG9zcXVhc2ggcmViYXNlIGlzIHBlcmZvcm1lZC5cbiAgICBjb25zdCBiYXNlU2hhID1cbiAgICAgICAgdGhpcy5naXQucnVuKFsncmV2LXBhcnNlJywgdGhpcy5nZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdCldKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIEdpdCByZXZpc2lvbiByYW5nZSB0aGF0IG1hdGNoZXMgdGhlIHB1bGwgcmVxdWVzdCBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSBgJHtiYXNlU2hhfS4uJHtURU1QX1BSX0hFQURfQlJBTkNIfWA7XG5cbiAgICAvLyBXZSBhbHdheXMgcmViYXNlIHRoZSBwdWxsIHJlcXVlc3Qgc28gdGhhdCBmaXh1cCBvciBzcXVhc2ggY29tbWl0cyBhcmUgYXV0b21hdGljYWxseVxuICAgIC8vIGNvbGxhcHNlZC4gR2l0J3MgYXV0b3NxdWFzaCBmdW5jdGlvbmFsaXR5IGRvZXMgb25seSB3b3JrIGluIGludGVyYWN0aXZlIHJlYmFzZXMsIHNvXG4gICAgLy8gb3VyIHJlYmFzZSBpcyBhbHdheXMgaW50ZXJhY3RpdmUuIEluIHJlYWxpdHkgdGhvdWdoLCB1bmxlc3MgYSBjb21taXQgbWVzc2FnZSBmaXh1cFxuICAgIC8vIGlzIGRlc2lyZWQsIHdlIHNldCB0aGUgYEdJVF9TRVFVRU5DRV9FRElUT1JgIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIGB0cnVlYCBzbyB0aGF0XG4gICAgLy8gdGhlIHJlYmFzZSBzZWVtcyBpbnRlcmFjdGl2ZSB0byBHaXQsIHdoaWxlIGl0J3Mgbm90IGludGVyYWN0aXZlIHRvIHRoZSB1c2VyLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2dpdC9naXQvY29tbWl0Lzg5MWQ0YTAzMTNlZGMwM2Y3ZTJlY2I5NmVkZWM1ZDMwZGMxODIyOTQuXG4gICAgY29uc3QgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZSA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gICAgY29uc3QgcmViYXNlRW52ID1cbiAgICAgICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPyB1bmRlZmluZWQgOiB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ307XG4gICAgdGhpcy5naXQucnVuKFxuICAgICAgICBbJ3JlYmFzZScsICctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCcsIGJhc2VTaGEsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdLFxuICAgICAgICB7c3RkaW86ICdpbmhlcml0JywgZW52OiByZWJhc2VFbnZ9KTtcblxuICAgIC8vIFVwZGF0ZSBwdWxsIHJlcXVlc3RzIGNvbW1pdHMgdG8gcmVmZXJlbmNlIHRoZSBwdWxsIHJlcXVlc3QuIFRoaXMgbWF0Y2hlcyB3aGF0XG4gICAgLy8gR2l0aHViIGRvZXMgd2hlbiBwdWxsIHJlcXVlc3RzIGFyZSBtZXJnZWQgdGhyb3VnaCB0aGUgV2ViIFVJLiBUaGUgbW90aXZhdGlvbiBpc1xuICAgIC8vIHRoYXQgaXQgc2hvdWxkIGJlIGVhc3kgdG8gZGV0ZXJtaW5lIHdoaWNoIHB1bGwgcmVxdWVzdCBjb250YWluZWQgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gTm90ZTogVGhlIGZpbHRlci1icmFuY2ggY29tbWFuZCByZWxpZXMgb24gdGhlIHdvcmtpbmcgdHJlZSwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmVcbiAgICAvLyB0aGF0IHdlIGFyZSBvbiB0aGUgaW5pdGlhbCBicmFuY2ggb3IgcmV2aXNpb24gd2hlcmUgdGhlIG1lcmdlIHNjcmlwdCBoYXMgYmVlbiBpbnZva2VkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihcbiAgICAgICAgWydmaWx0ZXItYnJhbmNoJywgJy1mJywgJy0tbXNnLWZpbHRlcicsIGAke01TR19GSUxURVJfU0NSSVBUfSAke3ByTnVtYmVyfWAsIHJldmlzaW9uUmFuZ2VdKTtcblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSBwdWxsIHJlcXVlc3QgaW50byBhbGwgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbSh0YXJnZXRCcmFuY2hlcyk7XG5cbiAgICAvLyBGb3IgUFJzIHdoaWNoIGRvIG5vdCB0YXJnZXQgdGhlIGBtYXN0ZXJgIGJyYW5jaCBvbiBHaXRodWIsIEdpdGh1YiBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5XG4gICAgLy8gY2xvc2UgdGhlIFBSIHdoZW4gaXRzIGNvbW1pdCBpcyBwdXNoZWQgaW50byB0aGUgcmVwb3NpdG9yeS4gIFRvIGVuc3VyZSB0aGVzZSBQUnMgYXJlXG4gICAgLy8gY29ycmVjdGx5IG1hcmtlZCBhcyBjbG9zZWQsIHdlIG11c3QgZGV0ZWN0IHRoaXMgc2l0dWF0aW9uIGFuZCBjbG9zZSB0aGUgUFIgdmlhIHRoZSBBUEkgYWZ0ZXJcbiAgICAvLyB0aGUgdXBzdHJlYW0gcHVzaGVzIGFyZSBjb21wbGV0ZWQuXG4gICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCAhPT0gJ21hc3RlcicpIHtcbiAgICAgIC8qKiBUaGUgbG9jYWwgYnJhbmNoIG5hbWUgb2YgdGhlIGdpdGh1YiB0YXJnZXRlZCBicmFuY2guICovXG4gICAgICBjb25zdCBsb2NhbEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gICAgICAvKiogVGhlIFNIQSBvZiB0aGUgY29tbWl0IHB1c2hlZCB0byBnaXRodWIgd2hpY2ggcmVwcmVzZW50cyBjbG9zaW5nIHRoZSBQUi4gKi9cbiAgICAgIGNvbnN0IHNoYSA9IHRoaXMuZ2l0LnJ1bihbJ3Jldi1wYXJzZScsIGxvY2FsQnJhbmNoXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIC8vIENyZWF0ZSBhIGNvbW1lbnQgc2F5aW5nIHRoZSBQUiB3YXMgY2xvc2VkIGJ5IHRoZSBTSEEuXG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmNyZWF0ZUNvbW1lbnQoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogcHVsbFJlcXVlc3QucHJOdW1iZXIsXG4gICAgICAgIGJvZHk6IGBDbG9zZWQgYnkgY29tbWl0ICR7c2hhfWBcbiAgICAgIH0pO1xuICAgICAgLy8gQWN0dWFsbHkgY2xvc2UgdGhlIFBSLlxuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLnVwZGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgcHVsbF9udW1iZXI6IHB1bGxSZXF1ZXN0LnByTnVtYmVyLFxuICAgICAgICBzdGF0ZTogJ2Nsb3NlZCcsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19