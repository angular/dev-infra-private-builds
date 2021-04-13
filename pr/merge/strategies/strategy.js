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
        define("@angular/dev-infra-private/pr/merge/strategies/strategy", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeStrategy = exports.TEMP_PR_HEAD_BRANCH = void 0;
    var tslib_1 = require("tslib");
    /**
     * Name of a temporary branch that contains the head of a currently-processed PR. Note
     * that a branch name should be used that most likely does not conflict with other local
     * development branches.
     */
    exports.TEMP_PR_HEAD_BRANCH = 'merge_pr_head';
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.fetchTargetBranches(pullRequest.targetBranches, "pull/" + pullRequest.prNumber + "/head:" + exports.TEMP_PR_HEAD_BRANCH);
                    return [2 /*return*/];
                });
            });
        };
        /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
        MergeStrategy.prototype.cleanup = function (pullRequest) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    // Delete all temporary target branches.
                    pullRequest.targetBranches.forEach(function (branchName) { return _this.git.run(['branch', '-D', _this.getLocalTargetBranchName(branchName)]); });
                    // Delete temporary branch for the pull request head.
                    this.git.run(['branch', '-D', exports.TEMP_PR_HEAD_BRANCH]);
                    return [2 /*return*/];
                });
            });
        };
        /** Gets the revision range for all commits in the given pull request. */
        MergeStrategy.prototype.getPullRequestRevisionRange = function (pullRequest) {
            return this.getPullRequestBaseRevision(pullRequest) + ".." + exports.TEMP_PR_HEAD_BRANCH;
        };
        /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
        MergeStrategy.prototype.getPullRequestBaseRevision = function (pullRequest) {
            return exports.TEMP_PR_HEAD_BRANCH + "~" + pullRequest.commitCount;
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
                for (var targetBranches_1 = tslib_1.__values(targetBranches), targetBranches_1_1 = targetBranches_1.next(); !targetBranches_1_1.done; targetBranches_1_1 = targetBranches_1.next()) {
                    var branchName = targetBranches_1_1.value;
                    var localTargetBranch = this.getLocalTargetBranchName(branchName);
                    // Checkout the local target branch.
                    this.git.run(['checkout', localTargetBranch]);
                    // Cherry-pick the refspec into the target branch.
                    if (this.git.runGraceful(tslib_1.__spread(['cherry-pick'], cherryPickArgs)).status !== 0) {
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
            this.git.run(tslib_1.__spread(['fetch', '-q', '-f', this.git.getRepoGitUrl()], fetchRefspecs, extraRefspecs));
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
            this.git.run(tslib_1.__spread(['push', this.git.getRepoGitUrl()], pushRefspecs));
        };
        return MergeStrategy;
    }());
    exports.MergeStrategy = MergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUg7Ozs7T0FJRztJQUNVLFFBQUEsbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0lBRW5EOzs7T0FHRztJQUNIO1FBQ0UsdUJBQXNCLEdBQW9CO1lBQXBCLFFBQUcsR0FBSCxHQUFHLENBQWlCO1FBQUcsQ0FBQztRQUU5Qzs7O1dBR0c7UUFDRywrQkFBTyxHQUFiLFVBQWMsV0FBd0I7OztvQkFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixXQUFXLENBQUMsY0FBYyxFQUFFLFVBQVEsV0FBVyxDQUFDLFFBQVEsY0FBUywyQkFBcUIsQ0FBQyxDQUFDOzs7O1NBQzdGO1FBUUQsZ0ZBQWdGO1FBQzFFLCtCQUFPLEdBQWIsVUFBYyxXQUF3Qjs7OztvQkFDcEMsd0NBQXdDO29CQUN4QyxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FDOUIsVUFBQSxVQUFVLElBQUksT0FBQSxLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBekUsQ0FBeUUsQ0FBQyxDQUFDO29CQUU3RixxREFBcUQ7b0JBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSwyQkFBbUIsQ0FBQyxDQUFDLENBQUM7Ozs7U0FDckQ7UUFFRCx5RUFBeUU7UUFDL0QsbURBQTJCLEdBQXJDLFVBQXNDLFdBQXdCO1lBQzVELE9BQVUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxVQUFLLDJCQUFxQixDQUFDO1FBQ25GLENBQUM7UUFFRCxv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O1FBQ3ZDLGtEQUEwQixHQUFwQyxVQUFxQyxLQUFlO1lBQXBELGlCQVFDO1lBUEMsSUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFlBQVk7Z0JBQ3pDLElBQU0saUJBQWlCLEdBQUcsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUN0RSxPQUFVLGlCQUFpQixvQkFBZSxZQUFjLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSCxrRkFBa0Y7WUFDbEYsd0ZBQXdGO1lBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxtQkFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsR0FBSyxZQUFZLEVBQUUsQ0FBQztRQUNwRSxDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBckhELElBcUhDO0lBckhxQixzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuXG4vKipcbiAqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIGhlYWQgb2YgYSBjdXJyZW50bHktcHJvY2Vzc2VkIFBSLiBOb3RlXG4gKiB0aGF0IGEgYnJhbmNoIG5hbWUgc2hvdWxkIGJlIHVzZWQgdGhhdCBtb3N0IGxpa2VseSBkb2VzIG5vdCBjb25mbGljdCB3aXRoIG90aGVyIGxvY2FsXG4gKiBkZXZlbG9wbWVudCBicmFuY2hlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBfUFJfSEVBRF9CUkFOQ0ggPSAnbWVyZ2VfcHJfaGVhZCc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgbWVyZ2Ugc3RyYXRlZ2llcy4gQSBtZXJnZSBzdHJhdGVneSBhY2NlcHRzIGEgcHVsbCByZXF1ZXN0IGFuZFxuICogbWVyZ2VzIGl0IGludG8gdGhlIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudDx0cnVlPikge31cblxuICAvKipcbiAgICogUHJlcGFyZXMgYSBtZXJnZSBvZiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBUaGUgc3RyYXRlZ3kgYnkgZGVmYXVsdCB3aWxsXG4gICAqIGZldGNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgYW5kIHRoZSBwdWxsIHJlcXVlc3QgaW50byBsb2NhbCB0ZW1wb3JhcnkgYnJhbmNoZXMuXG4gICAqL1xuICBhc3luYyBwcmVwYXJlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCkge1xuICAgIHRoaXMuZmV0Y2hUYXJnZXRCcmFuY2hlcyhcbiAgICAgICAgcHVsbFJlcXVlc3QudGFyZ2V0QnJhbmNoZXMsIGBwdWxsLyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9L2hlYWQ6JHtURU1QX1BSX0hFQURfQlJBTkNIfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBtZXJnZSBvZiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBUaGlzIG5lZWRzIHRvIGJlIGltcGxlbWVudGVkXG4gICAqIGJ5IGluZGl2aWR1YWwgbWVyZ2Ugc3RyYXRlZ2llcy5cbiAgICovXG4gIGFic3RyYWN0IG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8bnVsbHxQdWxsUmVxdWVzdEZhaWx1cmU+O1xuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS4gZS5nLiBkZWxldGluZyB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoZXMuICovXG4gIGFzeW5jIGNsZWFudXAocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KSB7XG4gICAgLy8gRGVsZXRlIGFsbCB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHB1bGxSZXF1ZXN0LnRhcmdldEJyYW5jaGVzLmZvckVhY2goXG4gICAgICAgIGJyYW5jaE5hbWUgPT4gdGhpcy5naXQucnVuKFsnYnJhbmNoJywgJy1EJywgdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUoYnJhbmNoTmFtZSldKSk7XG5cbiAgICAvLyBEZWxldGUgdGVtcG9yYXJ5IGJyYW5jaCBmb3IgdGhlIHB1bGwgcmVxdWVzdCBoZWFkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2JyYW5jaCcsICctRCcsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByZXZpc2lvbiByYW5nZSBmb3IgYWxsIGNvbW1pdHMgaW4gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJvdGVjdGVkIGdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0KX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGJhc2UgcmV2aXNpb24gb2YgYSBwdWxsIHJlcXVlc3QuIGkuZS4gdGhlIGNvbW1pdCB0aGUgUFIgaXMgYmFzZWQgb24uICovXG4gIHByb3RlY3RlZCBnZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtURU1QX1BSX0hFQURfQlJBTkNIfX4ke3B1bGxSZXF1ZXN0LmNvbW1pdENvdW50fWA7XG4gIH1cblxuICAvKiogR2V0cyBhIGRldGVybWluaXN0aWMgbG9jYWwgYnJhbmNoIG5hbWUgZm9yIGEgZ2l2ZW4gYnJhbmNoLiAqL1xuICBwcm90ZWN0ZWQgZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKHRhcmdldEJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG1lcmdlX3ByX3RhcmdldF8ke3RhcmdldEJyYW5jaC5yZXBsYWNlKC9cXC8vZywgJ18nKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgZ2l2ZW4gcmV2aXNpb24gcmFuZ2UgaW50byB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBsaXN0IG9mIGJyYW5jaGVzIGZvciB3aGljaCB0aGUgcmV2aXNpb25zIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlOiBzdHJpbmcsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSwgb3B0aW9uczoge1xuICAgIGRyeVJ1bj86IGJvb2xlYW4sXG4gICAgbGlua1RvT3JpZ2luYWxDb21taXRzPzogYm9vbGVhbixcbiAgfSA9IHt9KSB7XG4gICAgY29uc3QgY2hlcnJ5UGlja0FyZ3MgPSBbcmV2aXNpb25SYW5nZV07XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtY2hlcnJ5LXBpY2sjRG9jdW1lbnRhdGlvbi9naXQtY2hlcnJ5LXBpY2sudHh0LS0tbm8tY29tbWl0XG4gICAgICAvLyBUaGlzIGNhdXNlcyBgZ2l0IGNoZXJyeS1waWNrYCB0byBub3QgZ2VuZXJhdGUgYW55IGNvbW1pdHMuIEluc3RlYWQsIHRoZSBjaGFuZ2VzIGFyZVxuICAgICAgLy8gYXBwbGllZCBkaXJlY3RseSBpbiB0aGUgd29ya2luZyB0cmVlLiBUaGlzIGFsbG93IHVzIHRvIGVhc2lseSBkaXNjYXJkIHRoZSBjaGFuZ2VzXG4gICAgICAvLyBmb3IgZHJ5LXJ1biBwdXJwb3Nlcy5cbiAgICAgIGNoZXJyeVBpY2tBcmdzLnB1c2goJy0tbm8tY29tbWl0Jyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubGlua1RvT3JpZ2luYWxDb21taXRzKSB7XG4gICAgICAvLyBXZSBhZGQgYC14YCB3aGVuIGNoZXJyeS1waWNraW5nIGFzIHRoYXQgd2lsbCBhbGxvdyB1cyB0byBlYXNpbHkganVtcCB0byBvcmlnaW5hbFxuICAgICAgLy8gY29tbWl0cyBmb3IgY2hlcnJ5LXBpY2tlZCBjb21taXRzLiBXaXRoIHRoYXQgZmxhZyBzZXQsIEdpdCB3aWxsIGF1dG9tYXRpY2FsbHkgYXBwZW5kXG4gICAgICAvLyB0aGUgb3JpZ2luYWwgU0hBL3JldmlzaW9uIHRvIHRoZSBjb21taXQgbWVzc2FnZS4gZS5nLiBgKGNoZXJyeSBwaWNrZWQgZnJvbSBjb21taXQgPC4uPilgLlxuICAgICAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1jaGVycnktcGljayNEb2N1bWVudGF0aW9uL2dpdC1jaGVycnktcGljay50eHQtLXguXG4gICAgICBjaGVycnlQaWNrQXJncy5wdXNoKCcteCcpO1xuICAgIH1cblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSByZWZzcGVjIGludG8gYWxsIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGZvciAoY29uc3QgYnJhbmNoTmFtZSBvZiB0YXJnZXRCcmFuY2hlcykge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShicmFuY2hOYW1lKTtcbiAgICAgIC8vIENoZWNrb3V0IHRoZSBsb2NhbCB0YXJnZXQgYnJhbmNoLlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCBsb2NhbFRhcmdldEJyYW5jaF0pO1xuICAgICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHJlZnNwZWMgaW50byB0aGUgdGFyZ2V0IGJyYW5jaC5cbiAgICAgIGlmICh0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgLi4uY2hlcnJ5UGlja0FyZ3NdKS5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgLy8gQWJvcnQgdGhlIGZhaWxlZCBjaGVycnktcGljay4gV2UgZG8gdGhpcyBiZWNhdXNlIEdpdCBwZXJzaXN0cyB0aGUgZmFpbGVkXG4gICAgICAgIC8vIGNoZXJyeS1waWNrIHN0YXRlIGdsb2JhbGx5IGluIHRoZSByZXBvc2l0b3J5LiBUaGlzIGNvdWxkIHByZXZlbnQgZnV0dXJlXG4gICAgICAgIC8vIHB1bGwgcmVxdWVzdCBtZXJnZXMgYXMgYSBHaXQgdGhpbmtzIGEgY2hlcnJ5LXBpY2sgaXMgc3RpbGwgaW4gcHJvZ3Jlc3MuXG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddKTtcbiAgICAgICAgZmFpbGVkQnJhbmNoZXMucHVzaChicmFuY2hOYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlIHJ1biB3aXRoIGRyeSBydW4gbW9kZSwgd2UgcmVzZXQgdGhlIGxvY2FsIHRhcmdldCBicmFuY2ggc28gdGhhdCBhbGwgZHJ5LXJ1blxuICAgICAgLy8gY2hlcnJ5LXBpY2sgY2hhbmdlcyBhcmUgZGlzY2FyZC4gQ2hhbmdlcyBhcmUgYXBwbGllZCB0byB0aGUgd29ya2luZyB0cmVlIGFuZCBpbmRleC5cbiAgICAgIGlmIChvcHRpb25zLmRyeVJ1bikge1xuICAgICAgICB0aGlzLmdpdC5ydW4oWydyZXNldCcsICctLWhhcmQnLCAnSEVBRCddKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhaWxlZEJyYW5jaGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIGdpdmVuIHRhcmdldCBicmFuY2hlcy4gQWxzbyBhY2NlcHRzIGEgbGlzdCBvZiBhZGRpdGlvbmFsIHJlZnNwZWNzIHRoYXRcbiAgICogc2hvdWxkIGJlIGZldGNoZWQuIFRoaXMgaXMgaGVscGZ1bCBhcyBtdWx0aXBsZSBzbG93IGZldGNoZXMgY291bGQgYmUgYXZvaWRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBmZXRjaFRhcmdldEJyYW5jaGVzKG5hbWVzOiBzdHJpbmdbXSwgLi4uZXh0cmFSZWZzcGVjczogc3RyaW5nW10pIHtcbiAgICBjb25zdCBmZXRjaFJlZnNwZWNzID0gbmFtZXMubWFwKHRhcmdldEJyYW5jaCA9PiB7XG4gICAgICBjb25zdCBsb2NhbFRhcmdldEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKHRhcmdldEJyYW5jaCk7XG4gICAgICByZXR1cm4gYHJlZnMvaGVhZHMvJHt0YXJnZXRCcmFuY2h9OiR7bG9jYWxUYXJnZXRCcmFuY2h9YDtcbiAgICB9KTtcbiAgICAvLyBGZXRjaCBhbGwgdGFyZ2V0IGJyYW5jaGVzIHdpdGggYSBzaW5nbGUgY29tbWFuZC4gV2UgZG9uJ3Qgd2FudCB0byBmZXRjaCB0aGVtXG4gICAgLy8gaW5kaXZpZHVhbGx5IGFzIHRoYXQgY291bGQgY2F1c2UgYW4gdW5uZWNlc3Nhcnkgc2xvdy1kb3duLlxuICAgIHRoaXMuZ2l0LnJ1bihcbiAgICAgICAgWydmZXRjaCcsICctcScsICctZicsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgLi4uZmV0Y2hSZWZzcGVjcywgLi4uZXh0cmFSZWZzcGVjc10pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgZ2l2ZW4gdGFyZ2V0IGJyYW5jaGVzIHVwc3RyZWFtLiAqL1xuICBwcm90ZWN0ZWQgcHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0obmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgcHVzaFJlZnNwZWNzID0gbmFtZXMubWFwKHRhcmdldEJyYW5jaCA9PiB7XG4gICAgICBjb25zdCBsb2NhbFRhcmdldEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKHRhcmdldEJyYW5jaCk7XG4gICAgICByZXR1cm4gYCR7bG9jYWxUYXJnZXRCcmFuY2h9OnJlZnMvaGVhZHMvJHt0YXJnZXRCcmFuY2h9YDtcbiAgICB9KTtcbiAgICAvLyBQdXNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgd2l0aCBhIHNpbmdsZSBjb21tYW5kIGlmIHdlIGRvbid0IHJ1biBpbiBkcnktcnVuIG1vZGUuXG4gICAgLy8gV2UgZG9uJ3Qgd2FudCB0byBwdXNoIHRoZW0gaW5kaXZpZHVhbGx5IGFzIHRoYXQgY291bGQgY2F1c2UgYW4gdW5uZWNlc3Nhcnkgc2xvdy1kb3duLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIC4uLnB1c2hSZWZzcGVjc10pO1xuICB9XG59XG4iXX0=