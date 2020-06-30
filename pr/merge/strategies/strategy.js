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
            this.git.run(tslib_1.__spread(['fetch', '-f', this.git.repoGitUrl], fetchRefspecs, extraRefspecs));
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
            this.git.run(tslib_1.__spread(['push', this.git.repoGitUrl], pushRefspecs));
        };
        return MergeStrategy;
    }());
    exports.MergeStrategy = MergeStrategy;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUg7Ozs7T0FJRztJQUNVLFFBQUEsbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0lBRW5EOzs7T0FHRztJQUNIO1FBQ0UsdUJBQXNCLEdBQWM7WUFBZCxRQUFHLEdBQUgsR0FBRyxDQUFXO1FBQUcsQ0FBQztRQUV4Qzs7O1dBR0c7UUFDRywrQkFBTyxHQUFiLFVBQWMsV0FBd0I7OztvQkFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixXQUFXLENBQUMsY0FBYyxFQUFFLFVBQVEsV0FBVyxDQUFDLFFBQVEsY0FBUywyQkFBcUIsQ0FBQyxDQUFDOzs7O1NBQzdGO1FBUUQsZ0ZBQWdGO1FBQzFFLCtCQUFPLEdBQWIsVUFBYyxXQUF3Qjs7OztvQkFDcEMsd0NBQXdDO29CQUN4QyxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FDOUIsVUFBQSxVQUFVLElBQUksT0FBQSxLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBekUsQ0FBeUUsQ0FBQyxDQUFDO29CQUU3RixxREFBcUQ7b0JBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSwyQkFBbUIsQ0FBQyxDQUFDLENBQUM7Ozs7U0FDckQ7UUFFRCx5RUFBeUU7UUFDL0QsbURBQTJCLEdBQXJDLFVBQXNDLFdBQXdCO1lBQzVELE9BQVUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxVQUFLLDJCQUFxQixDQUFDO1FBQ25GLENBQUM7UUFFRCxvRkFB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Z0JBQ3RFLE9BQVUsaUJBQWlCLG9CQUFlLFlBQWMsQ0FBQztZQUMzRCxDQUFDLENBQUMsQ0FBQztZQUNILGtGQUFrRjtZQUNsRix3RkFBd0Y7WUFDeEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLG1CQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBSyxZQUFZLEVBQUUsQ0FBQztRQUMvRCxDQUFDO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBM0dELElBMkdDO0lBM0dxQixzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuXG4vKipcbiAqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIGhlYWQgb2YgYSBjdXJyZW50bHktcHJvY2Vzc2VkIFBSLiBOb3RlXG4gKiB0aGF0IGEgYnJhbmNoIG5hbWUgc2hvdWxkIGJlIHVzZWQgdGhhdCBtb3N0IGxpa2VseSBkb2VzIG5vdCBjb25mbGljdCB3aXRoIG90aGVyIGxvY2FsXG4gKiBkZXZlbG9wbWVudCBicmFuY2hlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBfUFJfSEVBRF9CUkFOQ0ggPSAnbWVyZ2VfcHJfaGVhZCc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgbWVyZ2Ugc3RyYXRlZ2llcy4gQSBtZXJnZSBzdHJhdGVneSBhY2NlcHRzIGEgcHVsbCByZXF1ZXN0IGFuZFxuICogbWVyZ2VzIGl0IGludG8gdGhlIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudCkge31cblxuICAvKipcbiAgICogUHJlcGFyZXMgYSBtZXJnZSBvZiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBUaGUgc3RyYXRlZ3kgYnkgZGVmYXVsdCB3aWxsXG4gICAqIGZldGNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgYW5kIHRoZSBwdWxsIHJlcXVlc3QgaW50byBsb2NhbCB0ZW1wb3JhcnkgYnJhbmNoZXMuXG4gICAqL1xuICBhc3luYyBwcmVwYXJlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCkge1xuICAgIHRoaXMuZmV0Y2hUYXJnZXRCcmFuY2hlcyhcbiAgICAgICAgcHVsbFJlcXVlc3QudGFyZ2V0QnJhbmNoZXMsIGBwdWxsLyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9L2hlYWQ6JHtURU1QX1BSX0hFQURfQlJBTkNIfWApO1xuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBtZXJnZSBvZiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBUaGlzIG5lZWRzIHRvIGJlIGltcGxlbWVudGVkXG4gICAqIGJ5IGluZGl2aWR1YWwgbWVyZ2Ugc3RyYXRlZ2llcy5cbiAgICovXG4gIGFic3RyYWN0IG1lcmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8bnVsbHxQdWxsUmVxdWVzdEZhaWx1cmU+O1xuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS4gZS5nLiBkZWxldGluZyB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoZXMuICovXG4gIGFzeW5jIGNsZWFudXAocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KSB7XG4gICAgLy8gRGVsZXRlIGFsbCB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHB1bGxSZXF1ZXN0LnRhcmdldEJyYW5jaGVzLmZvckVhY2goXG4gICAgICAgIGJyYW5jaE5hbWUgPT4gdGhpcy5naXQucnVuKFsnYnJhbmNoJywgJy1EJywgdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUoYnJhbmNoTmFtZSldKSk7XG5cbiAgICAvLyBEZWxldGUgdGVtcG9yYXJ5IGJyYW5jaCBmb3IgdGhlIHB1bGwgcmVxdWVzdCBoZWFkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2JyYW5jaCcsICctRCcsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByZXZpc2lvbiByYW5nZSBmb3IgYWxsIGNvbW1pdHMgaW4gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJvdGVjdGVkIGdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0KX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGJhc2UgcmV2aXNpb24gb2YgYSBwdWxsIHJlcXVlc3QuIGkuZS4gdGhlIGNvbW1pdCB0aGUgUFIgaXMgYmFzZWQgb24uICovXG4gIHByb3RlY3RlZCBnZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtURU1QX1BSX0hFQURfQlJBTkNIfX4ke3B1bGxSZXF1ZXN0LmNvbW1pdENvdW50fWA7XG4gIH1cblxuICAvKiogR2V0cyBhIGRldGVybWluaXN0aWMgbG9jYWwgYnJhbmNoIG5hbWUgZm9yIGEgZ2l2ZW4gYnJhbmNoLiAqL1xuICBwcm90ZWN0ZWQgZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKHRhcmdldEJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG1lcmdlX3ByX3RhcmdldF8ke3RhcmdldEJyYW5jaC5yZXBsYWNlKC9cXC8vZywgJ18nKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgZ2l2ZW4gcmV2aXNpb24gcmFuZ2UgaW50byB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBsaXN0IG9mIGJyYW5jaGVzIGZvciB3aGljaCB0aGUgcmV2aXNpb25zIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlOiBzdHJpbmcsIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSwgb3B0aW9uczoge1xuICAgIGRyeVJ1bj86IGJvb2xlYW5cbiAgfSA9IHt9KSB7XG4gICAgY29uc3QgY2hlcnJ5UGlja0FyZ3MgPSBbcmV2aXNpb25SYW5nZV07XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtY2hlcnJ5LXBpY2sjRG9jdW1lbnRhdGlvbi9naXQtY2hlcnJ5LXBpY2sudHh0LS0tbm8tY29tbWl0XG4gICAgICAvLyBUaGlzIGNhdXNlcyBgZ2l0IGNoZXJyeS1waWNrYCB0byBub3QgZ2VuZXJhdGUgYW55IGNvbW1pdHMuIEluc3RlYWQsIHRoZSBjaGFuZ2VzIGFyZVxuICAgICAgLy8gYXBwbGllZCBkaXJlY3RseSBpbiB0aGUgd29ya2luZyB0cmVlLiBUaGlzIGFsbG93IHVzIHRvIGVhc2lseSBkaXNjYXJkIHRoZSBjaGFuZ2VzXG4gICAgICAvLyBmb3IgZHJ5LXJ1biBwdXJwb3Nlcy5cbiAgICAgIGNoZXJyeVBpY2tBcmdzLnB1c2goJy0tbm8tY29tbWl0Jyk7XG4gICAgfVxuXG4gICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHJlZnNwZWMgaW50byBhbGwgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAgZm9yIChjb25zdCBicmFuY2hOYW1lIG9mIHRhcmdldEJyYW5jaGVzKSB7XG4gICAgICBjb25zdCBsb2NhbFRhcmdldEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKGJyYW5jaE5hbWUpO1xuICAgICAgLy8gQ2hlY2tvdXQgdGhlIGxvY2FsIHRhcmdldCBicmFuY2guXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsIGxvY2FsVGFyZ2V0QnJhbmNoXSk7XG4gICAgICAvLyBDaGVycnktcGljayB0aGUgcmVmc3BlYyBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoLlxuICAgICAgaWYgKHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAuLi5jaGVycnlQaWNrQXJnc10pLnN0YXR1cyAhPT0gMCkge1xuICAgICAgICAvLyBBYm9ydCB0aGUgZmFpbGVkIGNoZXJyeS1waWNrLiBXZSBkbyB0aGlzIGJlY2F1c2UgR2l0IHBlcnNpc3RzIHRoZSBmYWlsZWRcbiAgICAgICAgLy8gY2hlcnJ5LXBpY2sgc3RhdGUgZ2xvYmFsbHkgaW4gdGhlIHJlcG9zaXRvcnkuIFRoaXMgY291bGQgcHJldmVudCBmdXR1cmVcbiAgICAgICAgLy8gcHVsbCByZXF1ZXN0IG1lcmdlcyBhcyBhIEdpdCB0aGlua3MgYSBjaGVycnktcGljayBpcyBzdGlsbCBpbiBwcm9ncmVzcy5cbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10pO1xuICAgICAgICBmYWlsZWRCcmFuY2hlcy5wdXNoKGJyYW5jaE5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgcnVuIHdpdGggZHJ5IHJ1biBtb2RlLCB3ZSByZXNldCB0aGUgbG9jYWwgdGFyZ2V0IGJyYW5jaCBzbyB0aGF0IGFsbCBkcnktcnVuXG4gICAgICAvLyBjaGVycnktcGljayBjaGFuZ2VzIGFyZSBkaXNjYXJkLiBDaGFuZ2VzIGFyZSBhcHBsaWVkIHRvIHRoZSB3b3JraW5nIHRyZWUgYW5kIGluZGV4LlxuICAgICAgaWYgKG9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jlc2V0JywgJy0taGFyZCcsICdIRUFEJ10pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFpbGVkQnJhbmNoZXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgZ2l2ZW4gdGFyZ2V0IGJyYW5jaGVzLiBBbHNvIGFjY2VwdHMgYSBsaXN0IG9mIGFkZGl0aW9uYWwgcmVmc3BlY3MgdGhhdFxuICAgKiBzaG91bGQgYmUgZmV0Y2hlZC4gVGhpcyBpcyBoZWxwZnVsIGFzIG11bHRpcGxlIHNsb3cgZmV0Y2hlcyBjb3VsZCBiZSBhdm9pZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGZldGNoVGFyZ2V0QnJhbmNoZXMobmFtZXM6IHN0cmluZ1tdLCAuLi5leHRyYVJlZnNwZWNzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IGZldGNoUmVmc3BlY3MgPSBuYW1lcy5tYXAodGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgcmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH06JHtsb2NhbFRhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIEZldGNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgd2l0aCBhIHNpbmdsZSBjb21tYW5kLiBXZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZW1cbiAgICAvLyBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLWYnLCB0aGlzLmdpdC5yZXBvR2l0VXJsLCAuLi5mZXRjaFJlZnNwZWNzLCAuLi5leHRyYVJlZnNwZWNzXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBnaXZlbiB0YXJnZXQgYnJhbmNoZXMgdXBzdHJlYW0uICovXG4gIHByb3RlY3RlZCBwdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShuYW1lczogc3RyaW5nW10pIHtcbiAgICBjb25zdCBwdXNoUmVmc3BlY3MgPSBuYW1lcy5tYXAodGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgJHtsb2NhbFRhcmdldEJyYW5jaH06cmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIFB1c2ggYWxsIHRhcmdldCBicmFuY2hlcyB3aXRoIGEgc2luZ2xlIGNvbW1hbmQgaWYgd2UgZG9uJ3QgcnVuIGluIGRyeS1ydW4gbW9kZS5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIHB1c2ggdGhlbSBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LnJlcG9HaXRVcmwsIC4uLnB1c2hSZWZzcGVjc10pO1xuICB9XG59XG4iXX0=