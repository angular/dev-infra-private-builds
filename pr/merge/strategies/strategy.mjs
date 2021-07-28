/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator, __read, __spreadArray, __values } from "tslib";
/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
export var TEMP_PR_HEAD_BRANCH = 'merge_pr_head';
/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
var MergeStrategy = /** @class */ (function () {
    function MergeStrategy(git) {
        this.git = git;
    }
    /**
     * Prepares a merge of the given pull request. The strategy by default will
     * fetch all target branches and the pull request into local temporary branches.
     */
    MergeStrategy.prototype.prepare = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.fetchTargetBranches(pullRequest.targetBranches, "pull/" + pullRequest.prNumber + "/head:" + TEMP_PR_HEAD_BRANCH);
                return [2 /*return*/];
            });
        });
    };
    /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
    MergeStrategy.prototype.cleanup = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Delete all temporary target branches.
                pullRequest.targetBranches.forEach(function (branchName) { return _this.git.run(['branch', '-D', _this.getLocalTargetBranchName(branchName)]); });
                // Delete temporary branch for the pull request head.
                this.git.run(['branch', '-D', TEMP_PR_HEAD_BRANCH]);
                return [2 /*return*/];
            });
        });
    };
    /** Gets the revision range for all commits in the given pull request. */
    MergeStrategy.prototype.getPullRequestRevisionRange = function (pullRequest) {
        return this.getPullRequestBaseRevision(pullRequest) + ".." + TEMP_PR_HEAD_BRANCH;
    };
    /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
    MergeStrategy.prototype.getPullRequestBaseRevision = function (pullRequest) {
        return TEMP_PR_HEAD_BRANCH + "~" + pullRequest.commitCount;
    };
    /** Gets a deterministic local branch name for a given branch. */
    MergeStrategy.prototype.getLocalTargetBranchName = function (targetBranch) {
        return "merge_pr_target_" + targetBranch.replace(/\//g, '_');
    };
    /**
     * Cherry-picks the given revision range into the specified target branches.
     * @returns A list of branches for which the revisions could not be cherry-picked into.
     */
    MergeStrategy.prototype.cherryPickIntoTargetBranches = function (revisionRange, targetBranches, options) {
        var e_1, _a;
        if (options === void 0) { options = {}; }
        var cherryPickArgs = [revisionRange];
        var failedBranches = [];
        if (options.dryRun) {
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt---no-commit
            // This causes `git cherry-pick` to not generate any commits. Instead, the changes are
            // applied directly in the working tree. This allow us to easily discard the changes
            // for dry-run purposes.
            cherryPickArgs.push('--no-commit');
        }
        if (options.linkToOriginalCommits) {
            // We add `-x` when cherry-picking as that will allow us to easily jump to original
            // commits for cherry-picked commits. With that flag set, Git will automatically append
            // the original SHA/revision to the commit message. e.g. `(cherry picked from commit <..>)`.
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt--x.
            cherryPickArgs.push('-x');
        }
        try {
            // Cherry-pick the refspec into all determined target branches.
            for (var targetBranches_1 = __values(targetBranches), targetBranches_1_1 = targetBranches_1.next(); !targetBranches_1_1.done; targetBranches_1_1 = targetBranches_1.next()) {
                var branchName = targetBranches_1_1.value;
                var localTargetBranch = this.getLocalTargetBranchName(branchName);
                // Checkout the local target branch.
                this.git.run(['checkout', localTargetBranch]);
                // Cherry-pick the refspec into the target branch.
                if (this.git.runGraceful(__spreadArray(['cherry-pick'], __read(cherryPickArgs))).status !== 0) {
                    // Abort the failed cherry-pick. We do this because Git persists the failed
                    // cherry-pick state globally in the repository. This could prevent future
                    // pull request merges as a Git thinks a cherry-pick is still in progress.
                    this.git.runGraceful(['cherry-pick', '--abort']);
                    failedBranches.push(branchName);
                }
                // If we run with dry run mode, we reset the local target branch so that all dry-run
                // cherry-pick changes are discard. Changes are applied to the working tree and index.
                if (options.dryRun) {
                    this.git.run(['reset', '--hard', 'HEAD']);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (targetBranches_1_1 && !targetBranches_1_1.done && (_a = targetBranches_1.return)) _a.call(targetBranches_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return failedBranches;
    };
    /**
     * Fetches the given target branches. Also accepts a list of additional refspecs that
     * should be fetched. This is helpful as multiple slow fetches could be avoided.
     */
    MergeStrategy.prototype.fetchTargetBranches = function (names) {
        var _this = this;
        var extraRefspecs = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            extraRefspecs[_i - 1] = arguments[_i];
        }
        var fetchRefspecs = names.map(function (targetBranch) {
            var localTargetBranch = _this.getLocalTargetBranchName(targetBranch);
            return "refs/heads/" + targetBranch + ":" + localTargetBranch;
        });
        // Fetch all target branches with a single command. We don't want to fetch them
        // individually as that could cause an unnecessary slow-down.
        this.git.run(__spreadArray(__spreadArray(['fetch', '-q', '-f', this.git.getRepoGitUrl()], __read(fetchRefspecs)), __read(extraRefspecs)));
    };
    /** Pushes the given target branches upstream. */
    MergeStrategy.prototype.pushTargetBranchesUpstream = function (names) {
        var _this = this;
        var pushRefspecs = names.map(function (targetBranch) {
            var localTargetBranch = _this.getLocalTargetBranchName(targetBranch);
            return localTargetBranch + ":refs/heads/" + targetBranch;
        });
        // Push all target branches with a single command if we don't run in dry-run mode.
        // We don't want to push them individually as that could cause an unnecessary slow-down.
        this.git.run(__spreadArray(['push', this.git.getRepoGitUrl()], __read(pushRefspecs)));
    };
    return MergeStrategy;
}());
export { MergeStrategy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBTUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLGVBQWUsQ0FBQztBQUVuRDs7O0dBR0c7QUFDSDtJQUNFLHVCQUFzQixHQUEyQjtRQUEzQixRQUFHLEdBQUgsR0FBRyxDQUF3QjtJQUFHLENBQUM7SUFFckQ7OztPQUdHO0lBQ0csK0JBQU8sR0FBYixVQUFjLFdBQXdCOzs7Z0JBQ3BDLElBQUksQ0FBQyxtQkFBbUIsQ0FDcEIsV0FBVyxDQUFDLGNBQWMsRUFBRSxVQUFRLFdBQVcsQ0FBQyxRQUFRLGNBQVMsbUJBQXFCLENBQUMsQ0FBQzs7OztLQUM3RjtJQVFELGdGQUFnRjtJQUMxRSwrQkFBTyxHQUFiLFVBQWMsV0FBd0I7Ozs7Z0JBQ3BDLHdDQUF3QztnQkFDeEMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQzlCLFVBQUEsVUFBVSxJQUFJLE9BQUEsS0FBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQXpFLENBQXlFLENBQUMsQ0FBQztnQkFFN0YscURBQXFEO2dCQUNyRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsbUJBQW1CLENBQUMsQ0FBQyxDQUFDOzs7O0tBQ3JEO0lBRUQseUVBQXlFO0lBQy9ELG1EQUEyQixHQUFyQyxVQUFzQyxXQUF3QjtRQUM1RCxPQUFVLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxXQUFXLENBQUMsVUFBSyxtQkFBcUIsQ0FBQztJQUNuRixDQUFDO0lBRUQsb0ZB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VUFBcUMsS0FBZTtRQUFwRCxpQkFRQztRQVBDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxZQUFZO1lBQ3pDLElBQU0saUJBQWlCLEdBQUcsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RFLE9BQVUsaUJBQWlCLG9CQUFlLFlBQWMsQ0FBQztRQUMzRCxDQUFDLENBQUMsQ0FBQztRQUNILGtGQUFrRjtRQUNsRix3RkFBd0Y7UUFDeEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFLLFlBQVksR0FBRSxDQUFDO0lBQ3BFLENBQUM7SUFDSCxvQkFBQztBQUFELENBQUMsQUFySEQsSUFxSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuXG4vKipcbiAqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIGhlYWQgb2YgYSBjdXJyZW50bHktcHJvY2Vzc2VkIFBSLiBOb3RlXG4gKiB0aGF0IGEgYnJhbmNoIG5hbWUgc2hvdWxkIGJlIHVzZWQgdGhhdCBtb3N0IGxpa2VseSBkb2VzIG5vdCBjb25mbGljdCB3aXRoIG90aGVyIGxvY2FsXG4gKiBkZXZlbG9wbWVudCBicmFuY2hlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBfUFJfSEVBRF9CUkFOQ0ggPSAnbWVyZ2VfcHJfaGVhZCc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgbWVyZ2Ugc3RyYXRlZ2llcy4gQSBtZXJnZSBzdHJhdGVneSBhY2NlcHRzIGEgcHVsbCByZXF1ZXN0IGFuZFxuICogbWVyZ2VzIGl0IGludG8gdGhlIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHt9XG5cbiAgLyoqXG4gICAqIFByZXBhcmVzIGEgbWVyZ2Ugb2YgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gVGhlIHN0cmF0ZWd5IGJ5IGRlZmF1bHQgd2lsbFxuICAgKiBmZXRjaCBhbGwgdGFyZ2V0IGJyYW5jaGVzIGFuZCB0aGUgcHVsbCByZXF1ZXN0IGludG8gbG9jYWwgdGVtcG9yYXJ5IGJyYW5jaGVzLlxuICAgKi9cbiAgYXN5bmMgcHJlcGFyZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpIHtcbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoXG4gICAgICAgIHB1bGxSZXF1ZXN0LnRhcmdldEJyYW5jaGVzLCBgcHVsbC8ke3B1bGxSZXF1ZXN0LnByTnVtYmVyfS9oZWFkOiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbWVyZ2Ugb2YgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gVGhpcyBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZFxuICAgKiBieSBpbmRpdmlkdWFsIG1lcmdlIHN0cmF0ZWdpZXMuXG4gICAqL1xuICBhYnN0cmFjdCBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPG51bGx8UHVsbFJlcXVlc3RGYWlsdXJlPjtcblxuICAvKiogQ2xlYW5zIHVwIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UuIGUuZy4gZGVsZXRpbmcgdGVtcG9yYXJ5IGxvY2FsIGJyYW5jaGVzLiAqL1xuICBhc3luYyBjbGVhbnVwKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCkge1xuICAgIC8vIERlbGV0ZSBhbGwgdGVtcG9yYXJ5IHRhcmdldCBicmFuY2hlcy5cbiAgICBwdWxsUmVxdWVzdC50YXJnZXRCcmFuY2hlcy5mb3JFYWNoKFxuICAgICAgICBicmFuY2hOYW1lID0+IHRoaXMuZ2l0LnJ1bihbJ2JyYW5jaCcsICctRCcsIHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKGJyYW5jaE5hbWUpXSkpO1xuXG4gICAgLy8gRGVsZXRlIHRlbXBvcmFyeSBicmFuY2ggZm9yIHRoZSBwdWxsIHJlcXVlc3QgaGVhZC5cbiAgICB0aGlzLmdpdC5ydW4oWydicmFuY2gnLCAnLUQnLCBURU1QX1BSX0hFQURfQlJBTkNIXSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcmV2aXNpb24gcmFuZ2UgZm9yIGFsbCBjb21taXRzIGluIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByb3RlY3RlZCBnZXRQdWxsUmVxdWVzdFJldmlzaW9uUmFuZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5nZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdCl9Li4ke1RFTVBfUFJfSEVBRF9CUkFOQ0h9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBiYXNlIHJldmlzaW9uIG9mIGEgcHVsbCByZXF1ZXN0LiBpLmUuIHRoZSBjb21taXQgdGhlIFBSIGlzIGJhc2VkIG9uLiAqL1xuICBwcm90ZWN0ZWQgZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7VEVNUF9QUl9IRUFEX0JSQU5DSH1+JHtwdWxsUmVxdWVzdC5jb21taXRDb3VudH1gO1xuICB9XG5cbiAgLyoqIEdldHMgYSBkZXRlcm1pbmlzdGljIGxvY2FsIGJyYW5jaCBuYW1lIGZvciBhIGdpdmVuIGJyYW5jaC4gKi9cbiAgcHJvdGVjdGVkIGdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZSh0YXJnZXRCcmFuY2g6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBtZXJnZV9wcl90YXJnZXRfJHt0YXJnZXRCcmFuY2gucmVwbGFjZSgvXFwvL2csICdfJyl9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIGdpdmVuIHJldmlzaW9uIHJhbmdlIGludG8gdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAqIEByZXR1cm5zIEEgbGlzdCBvZiBicmFuY2hlcyBmb3Igd2hpY2ggdGhlIHJldmlzaW9ucyBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZTogc3RyaW5nLCB0YXJnZXRCcmFuY2hlczogc3RyaW5nW10sIG9wdGlvbnM6IHtcbiAgICBkcnlSdW4/OiBib29sZWFuLFxuICAgIGxpbmtUb09yaWdpbmFsQ29tbWl0cz86IGJvb2xlYW4sXG4gIH0gPSB7fSkge1xuICAgIGNvbnN0IGNoZXJyeVBpY2tBcmdzID0gW3JldmlzaW9uUmFuZ2VdO1xuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gICAgaWYgKG9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWNoZXJyeS1waWNrI0RvY3VtZW50YXRpb24vZ2l0LWNoZXJyeS1waWNrLnR4dC0tLW5vLWNvbW1pdFxuICAgICAgLy8gVGhpcyBjYXVzZXMgYGdpdCBjaGVycnktcGlja2AgdG8gbm90IGdlbmVyYXRlIGFueSBjb21taXRzLiBJbnN0ZWFkLCB0aGUgY2hhbmdlcyBhcmVcbiAgICAgIC8vIGFwcGxpZWQgZGlyZWN0bHkgaW4gdGhlIHdvcmtpbmcgdHJlZS4gVGhpcyBhbGxvdyB1cyB0byBlYXNpbHkgZGlzY2FyZCB0aGUgY2hhbmdlc1xuICAgICAgLy8gZm9yIGRyeS1ydW4gcHVycG9zZXMuXG4gICAgICBjaGVycnlQaWNrQXJncy5wdXNoKCctLW5vLWNvbW1pdCcpO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmxpbmtUb09yaWdpbmFsQ29tbWl0cykge1xuICAgICAgLy8gV2UgYWRkIGAteGAgd2hlbiBjaGVycnktcGlja2luZyBhcyB0aGF0IHdpbGwgYWxsb3cgdXMgdG8gZWFzaWx5IGp1bXAgdG8gb3JpZ2luYWxcbiAgICAgIC8vIGNvbW1pdHMgZm9yIGNoZXJyeS1waWNrZWQgY29tbWl0cy4gV2l0aCB0aGF0IGZsYWcgc2V0LCBHaXQgd2lsbCBhdXRvbWF0aWNhbGx5IGFwcGVuZFxuICAgICAgLy8gdGhlIG9yaWdpbmFsIFNIQS9yZXZpc2lvbiB0byB0aGUgY29tbWl0IG1lc3NhZ2UuIGUuZy4gYChjaGVycnkgcGlja2VkIGZyb20gY29tbWl0IDwuLj4pYC5cbiAgICAgIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtY2hlcnJ5LXBpY2sjRG9jdW1lbnRhdGlvbi9naXQtY2hlcnJ5LXBpY2sudHh0LS14LlxuICAgICAgY2hlcnJ5UGlja0FyZ3MucHVzaCgnLXgnKTtcbiAgICB9XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcmVmc3BlYyBpbnRvIGFsbCBkZXRlcm1pbmVkIHRhcmdldCBicmFuY2hlcy5cbiAgICBmb3IgKGNvbnN0IGJyYW5jaE5hbWUgb2YgdGFyZ2V0QnJhbmNoZXMpIHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUoYnJhbmNoTmFtZSk7XG4gICAgICAvLyBDaGVja291dCB0aGUgbG9jYWwgdGFyZ2V0IGJyYW5jaC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgbG9jYWxUYXJnZXRCcmFuY2hdKTtcbiAgICAgIC8vIENoZXJyeS1waWNrIHRoZSByZWZzcGVjIGludG8gdGhlIHRhcmdldCBicmFuY2guXG4gICAgICBpZiAodGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsIC4uLmNoZXJyeVBpY2tBcmdzXSkuc3RhdHVzICE9PSAwKSB7XG4gICAgICAgIC8vIEFib3J0IHRoZSBmYWlsZWQgY2hlcnJ5LXBpY2suIFdlIGRvIHRoaXMgYmVjYXVzZSBHaXQgcGVyc2lzdHMgdGhlIGZhaWxlZFxuICAgICAgICAvLyBjaGVycnktcGljayBzdGF0ZSBnbG9iYWxseSBpbiB0aGUgcmVwb3NpdG9yeS4gVGhpcyBjb3VsZCBwcmV2ZW50IGZ1dHVyZVxuICAgICAgICAvLyBwdWxsIHJlcXVlc3QgbWVyZ2VzIGFzIGEgR2l0IHRoaW5rcyBhIGNoZXJyeS1waWNrIGlzIHN0aWxsIGluIHByb2dyZXNzLlxuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSk7XG4gICAgICAgIGZhaWxlZEJyYW5jaGVzLnB1c2goYnJhbmNoTmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSBydW4gd2l0aCBkcnkgcnVuIG1vZGUsIHdlIHJlc2V0IHRoZSBsb2NhbCB0YXJnZXQgYnJhbmNoIHNvIHRoYXQgYWxsIGRyeS1ydW5cbiAgICAgIC8vIGNoZXJyeS1waWNrIGNoYW5nZXMgYXJlIGRpc2NhcmQuIENoYW5nZXMgYXJlIGFwcGxpZWQgdG8gdGhlIHdvcmtpbmcgdHJlZSBhbmQgaW5kZXguXG4gICAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgdGhpcy5naXQucnVuKFsncmVzZXQnLCAnLS1oYXJkJywgJ0hFQUQnXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWlsZWRCcmFuY2hlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBnaXZlbiB0YXJnZXQgYnJhbmNoZXMuIEFsc28gYWNjZXB0cyBhIGxpc3Qgb2YgYWRkaXRpb25hbCByZWZzcGVjcyB0aGF0XG4gICAqIHNob3VsZCBiZSBmZXRjaGVkLiBUaGlzIGlzIGhlbHBmdWwgYXMgbXVsdGlwbGUgc2xvdyBmZXRjaGVzIGNvdWxkIGJlIGF2b2lkZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZmV0Y2hUYXJnZXRCcmFuY2hlcyhuYW1lczogc3RyaW5nW10sIC4uLmV4dHJhUmVmc3BlY3M6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgZmV0Y2hSZWZzcGVjcyA9IG5hbWVzLm1hcCh0YXJnZXRCcmFuY2ggPT4ge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZSh0YXJnZXRCcmFuY2gpO1xuICAgICAgcmV0dXJuIGByZWZzL2hlYWRzLyR7dGFyZ2V0QnJhbmNofToke2xvY2FsVGFyZ2V0QnJhbmNofWA7XG4gICAgfSk7XG4gICAgLy8gRmV0Y2ggYWxsIHRhcmdldCBicmFuY2hlcyB3aXRoIGEgc2luZ2xlIGNvbW1hbmQuIFdlIGRvbid0IHdhbnQgdG8gZmV0Y2ggdGhlbVxuICAgIC8vIGluZGl2aWR1YWxseSBhcyB0aGF0IGNvdWxkIGNhdXNlIGFuIHVubmVjZXNzYXJ5IHNsb3ctZG93bi5cbiAgICB0aGlzLmdpdC5ydW4oXG4gICAgICAgIFsnZmV0Y2gnLCAnLXEnLCAnLWYnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIC4uLmZldGNoUmVmc3BlY3MsIC4uLmV4dHJhUmVmc3BlY3NdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGdpdmVuIHRhcmdldCBicmFuY2hlcyB1cHN0cmVhbS4gKi9cbiAgcHJvdGVjdGVkIHB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKG5hbWVzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IHB1c2hSZWZzcGVjcyA9IG5hbWVzLm1hcCh0YXJnZXRCcmFuY2ggPT4ge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZSh0YXJnZXRCcmFuY2gpO1xuICAgICAgcmV0dXJuIGAke2xvY2FsVGFyZ2V0QnJhbmNofTpyZWZzL2hlYWRzLyR7dGFyZ2V0QnJhbmNofWA7XG4gICAgfSk7XG4gICAgLy8gUHVzaCBhbGwgdGFyZ2V0IGJyYW5jaGVzIHdpdGggYSBzaW5nbGUgY29tbWFuZCBpZiB3ZSBkb24ndCBydW4gaW4gZHJ5LXJ1biBtb2RlLlxuICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcHVzaCB0aGVtIGluZGl2aWR1YWxseSBhcyB0aGF0IGNvdWxkIGNhdXNlIGFuIHVubmVjZXNzYXJ5IHNsb3ctZG93bi5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCAuLi5wdXNoUmVmc3BlY3NdKTtcbiAgfVxufVxuIl19