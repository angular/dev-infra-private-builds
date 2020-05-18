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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUEsNkJBQTBCO0lBQzFCLHlFQUErQztJQUUvQyxvRkFBOEQ7SUFFOUQsK0ZBQStGO0lBQy9GLElBQU0saUJBQWlCLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFNUY7Ozs7OztPQU1HO0lBQ0g7UUFBNkMsbURBQWE7UUFBMUQ7O1FBZ0VBLENBQUM7UUEvREM7Ozs7Ozs7O1dBUUc7UUFDRyx1Q0FBSyxHQUFYLFVBQVksV0FBd0I7Ozs7b0JBQzNCLFFBQVEsR0FBOEQsV0FBVyxTQUF6RSxFQUFFLGNBQWMsR0FBOEMsV0FBVyxlQUF6RCxFQUFFLGVBQWUsR0FBNkIsV0FBVyxnQkFBeEMsRUFBRSx1QkFBdUIsR0FBSSxXQUFXLHdCQUFmLENBQWdCO29CQUN6RixnRkFBZ0Y7b0JBQ2hGLGlGQUFpRjtvQkFDakYsb0ZBQW9GO29CQUNwRixpRkFBaUY7b0JBQ2pGLHlDQUF5QztvQkFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw4QkFBbUIsRUFBRSxlQUFlLENBQUMsRUFBRTt3QkFDaEYsc0JBQU8sNkJBQWtCLENBQUMsa0JBQWtCLEVBQUUsRUFBQztxQkFDaEQ7b0JBUUssT0FBTyxHQUNULElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUV0RixhQUFhLEdBQU0sT0FBTyxVQUFLLDhCQUFxQixDQUFDO29CQVFyRCxrQkFBa0IsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7b0JBQ2pELFNBQVMsR0FDWCx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsdUNBQUssT0FBTyxDQUFDLEdBQUcsS0FBRSxtQkFBbUIsRUFBRSxNQUFNLEdBQUMsQ0FBQztvQkFDeEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQ1IsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsOEJBQW1CLENBQUMsRUFDekUsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO29CQUV4QyxnRkFBZ0Y7b0JBQ2hGLGtGQUFrRjtvQkFDbEYsbUZBQW1GO29CQUNuRixxRkFBcUY7b0JBQ3JGLDhFQUE4RTtvQkFDOUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztvQkFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQ1IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBSyxpQkFBaUIsU0FBSSxRQUFVLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQztvQkFHMUYsY0FBYyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBRXhGLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTt3QkFDekIsc0JBQU8sNkJBQWtCLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxFQUFDO3FCQUMxRDtvQkFFRCxJQUFJLENBQUMsMEJBQTBCLENBQUMsY0FBYyxDQUFDLENBQUM7b0JBQ2hELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFDSCw4QkFBQztJQUFELENBQUMsQUFoRUQsQ0FBNkMsd0JBQWEsR0FnRXpEO0lBaEVZLDBEQUF1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi4vZmFpbHVyZXMnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdH0gZnJvbSAnLi4vcHVsbC1yZXF1ZXN0JztcbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBQYXRoIHRvIHRoZSBjb21taXQgbWVzc2FnZSBmaWx0ZXIgc2NyaXB0LiBHaXQgZXhwZWN0cyB0aGlzIHBhdGhzIHRvIHVzZSBmb3J3YXJkIHNsYXNoZXMuICovXG5jb25zdCBNU0dfRklMVEVSX1NDUklQVCA9IGpvaW4oX19kaXJuYW1lLCAnLi9jb21taXQtbWVzc2FnZS1maWx0ZXIuanMnKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdCB1c2UgdGhlIEdpdGh1YiBBUEkgZm9yIG1lcmdpbmcuIEluc3RlYWQsIGl0IGZldGNoZXNcbiAqIGFsbCB0YXJnZXQgYnJhbmNoZXMgYW5kIHRoZSBQUiBsb2NhbGx5LiBUaGUgUFIgaXMgdGhlbiBjaGVycnktcGlja2VkIHdpdGggYXV0b3NxdWFzaFxuICogZW5hYmxlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMuIFRoZSBiZW5lZml0IGlzIHRoZSBzdXBwb3J0IGZvciBmaXh1cCBhbmQgc3F1YXNoIGNvbW1pdHMuXG4gKiBBIG5vdGFibGUgZG93bnNpZGUgdGhvdWdoIGlzIHRoYXQgR2l0aHViIGRvZXMgbm90IHNob3cgdGhlIFBSIGFzIGBNZXJnZWRgIGR1ZSB0byBub25cbiAqIGZhc3QtZm9yd2FyZCBtZXJnZXNcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzIGFuZCBwdXNoZXMgdGhlIHRhcmdldFxuICAgKiBicmFuY2hlcyB1cHN0cmVhbS4gVGhpcyBtZXRob2QgcmVxdWlyZXMgdGhlIHRlbXBvcmFyeSB0YXJnZXQgYnJhbmNoZXMgdG8gYmUgZmV0Y2hlZFxuICAgKiBhbHJlYWR5IGFzIHdlIGRvbid0IHdhbnQgdG8gZmV0Y2ggdGhlIHRhcmdldCBicmFuY2hlcyBwZXIgcHVsbCByZXF1ZXN0IG1lcmdlLiBUaGlzXG4gICAqIHdvdWxkIGNhdXNlcyB1bm5lY2Vzc2FyeSBtdWx0aXBsZSBmZXRjaCByZXF1ZXN0cyB3aGVuIG11bHRpcGxlIFBScyBhcmUgbWVyZ2VkLlxuICAgKiBAdGhyb3dzIHtHaXRDb21tYW5kRXJyb3J9IEFuIHVua25vd24gR2l0IGNvbW1hbmQgZXJyb3Igb2NjdXJyZWQgdGhhdCBpcyBub3RcbiAgICogICBzcGVjaWZpYyB0byB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIG9yIG51bGwgaW4gY2FzZSBvZiBzdWNjZXNzLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXB9ID0gcHVsbFJlcXVlc3Q7XG4gICAgLy8gSW4gY2FzZSBhIHJlcXVpcmVkIGJhc2UgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWYgdGhlIHB1bGxcbiAgICAvLyByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuIFRoaXNcbiAgICAvLyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuIGUuZy5cbiAgICAvLyBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGVvd25lciBzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIC8vIFNIQSBmb3IgdGhlIGZpcnN0IGNvbW1pdCB0aGUgcHVsbCByZXF1ZXN0IGlzIGJhc2VkIG9uLiBVc3VhbGx5IHdlIHdvdWxkIGFibGVcbiAgICAvLyB0byBqdXN0IHJlbHkgb24gdGhlIGJhc2UgcmV2aXNpb24gcHJvdmlkZWQgYnkgYGdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uYCwgYnV0XG4gICAgLy8gdGhlIHJldmlzaW9uIHdvdWxkIHJlbHkgb24gdGhlIGFtb3VudCBvZiBjb21taXRzIGluIGEgcHVsbCByZXF1ZXN0LiBUaGlzIGlzIG5vdFxuICAgIC8vIHJlbGlhYmxlIGFzIHdlIHJlYmFzZSB0aGUgUFIgd2l0aCBhdXRvc3F1YXNoIHdoZXJlIHRoZSBhbW91bnQgb2YgY29tbWl0cyBjb3VsZFxuICAgIC8vIGNoYW5nZS4gV2Ugd29yayBhcm91bmQgdGhpcyBieSBwYXJzaW5nIHRoZSBiYXNlIHJldmlzaW9uIHNvIHRoYXQgd2UgaGF2ZSBhIGZpeGF0ZWRcbiAgICAvLyBTSEEgYmVmb3JlIHRoZSBhdXRvc3F1YXNoIHJlYmFzZSBpcyBwZXJmb3JtZWQuXG4gICAgY29uc3QgYmFzZVNoYSA9XG4gICAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jldi1wYXJzZScsIHRoaXMuZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3QpXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBHaXQgcmV2aXNpb24gcmFuZ2UgdGhhdCBtYXRjaGVzIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gYCR7YmFzZVNoYX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuXG4gICAgLy8gV2UgYWx3YXlzIHJlYmFzZSB0aGUgcHVsbCByZXF1ZXN0IHNvIHRoYXQgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMgYXJlIGF1dG9tYXRpY2FsbHlcbiAgICAvLyBjb2xsYXBzZWQuIEdpdCdzIGF1dG9zcXVhc2ggZnVuY3Rpb25hbGl0eSBkb2VzIG9ubHkgd29yayBpbiBpbnRlcmFjdGl2ZSByZWJhc2VzLCBzb1xuICAgIC8vIG91ciByZWJhc2UgaXMgYWx3YXlzIGludGVyYWN0aXZlLiBJbiByZWFsaXR5IHRob3VnaCwgdW5sZXNzIGEgY29tbWl0IG1lc3NhZ2UgZml4dXBcbiAgICAvLyBpcyBkZXNpcmVkLCB3ZSBzZXQgdGhlIGBHSVRfU0VRVUVOQ0VfRURJVE9SYCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBgdHJ1ZWAgc28gdGhhdFxuICAgIC8vIHRoZSByZWJhc2Ugc2VlbXMgaW50ZXJhY3RpdmUgdG8gR2l0LCB3aGlsZSBpdCdzIG5vdCBpbnRlcmFjdGl2ZSB0byB0aGUgdXNlci5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9naXQvZ2l0L2NvbW1pdC84OTFkNGEwMzEzZWRjMDNmN2UyZWNiOTZlZGVjNWQzMGRjMTgyMjk0LlxuICAgIGNvbnN0IGJyYW5jaEJlZm9yZVJlYmFzZSA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2goKTtcbiAgICBjb25zdCByZWJhc2VFbnYgPVxuICAgICAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA/IHVuZGVmaW5lZCA6IHsuLi5wcm9jZXNzLmVudiwgR0lUX1NFUVVFTkNFX0VESVRPUjogJ3RydWUnfTtcbiAgICB0aGlzLmdpdC5ydW4oXG4gICAgICAgIFsncmViYXNlJywgJy0taW50ZXJhY3RpdmUnLCAnLS1hdXRvc3F1YXNoJywgYmFzZVNoYSwgVEVNUF9QUl9IRUFEX0JSQU5DSF0sXG4gICAgICAgIHtzdGRpbzogJ2luaGVyaXQnLCBlbnY6IHJlYmFzZUVudn0pO1xuXG4gICAgLy8gVXBkYXRlIHB1bGwgcmVxdWVzdHMgY29tbWl0cyB0byByZWZlcmVuY2UgdGhlIHB1bGwgcmVxdWVzdC4gVGhpcyBtYXRjaGVzIHdoYXRcbiAgICAvLyBHaXRodWIgZG9lcyB3aGVuIHB1bGwgcmVxdWVzdHMgYXJlIG1lcmdlZCB0aHJvdWdoIHRoZSBXZWIgVUkuIFRoZSBtb3RpdmF0aW9uIGlzXG4gICAgLy8gdGhhdCBpdCBzaG91bGQgYmUgZWFzeSB0byBkZXRlcm1pbmUgd2hpY2ggcHVsbCByZXF1ZXN0IGNvbnRhaW5lZCBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyAqKk5vdGUqKjogVGhlIGZpbHRlci1icmFuY2ggY29tbWFuZCByZWxpZXMgb24gdGhlIHdvcmtpbmcgdHJlZSwgc28gd2Ugd2FudCB0byBtYWtlXG4gICAgLy8gc3VyZSB0aGF0IHdlIGFyZSBvbiB0aGUgaW5pdGlhbCBicmFuY2ggd2hlcmUgdGhlIG1lcmdlIHNjcmlwdCBoYXMgYmVlbiBydW4uXG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBicmFuY2hCZWZvcmVSZWJhc2VdKTtcbiAgICB0aGlzLmdpdC5ydW4oXG4gICAgICAgIFsnZmlsdGVyLWJyYW5jaCcsICctZicsICctLW1zZy1maWx0ZXInLCBgJHtNU0dfRklMVEVSX1NDUklQVH0gJHtwck51bWJlcn1gLCByZXZpc2lvblJhbmdlXSk7XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcHVsbCByZXF1ZXN0IGludG8gYWxsIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzKTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0odGFyZ2V0QnJhbmNoZXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=