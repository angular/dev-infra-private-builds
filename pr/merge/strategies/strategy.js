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
            this.git.run(tslib_1.__spread(['fetch', '-q', '-f', this.git.repoGitUrl], fetchRefspecs, extraRefspecs));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUg7Ozs7T0FJRztJQUNVLFFBQUEsbUJBQW1CLEdBQUcsZUFBZSxDQUFDO0lBRW5EOzs7T0FHRztJQUNIO1FBQ0UsdUJBQXNCLEdBQWM7WUFBZCxRQUFHLEdBQUgsR0FBRyxDQUFXO1FBQUcsQ0FBQztRQUV4Qzs7O1dBR0c7UUFDRywrQkFBTyxHQUFiLFVBQWMsV0FBd0I7OztvQkFDcEMsSUFBSSxDQUFDLG1CQUFtQixDQUNwQixXQUFXLENBQUMsY0FBYyxFQUFFLFVBQVEsV0FBVyxDQUFDLFFBQVEsY0FBUywyQkFBcUIsQ0FBQyxDQUFDOzs7O1NBQzdGO1FBUUQsZ0ZBQWdGO1FBQzFFLCtCQUFPLEdBQWIsVUFBYyxXQUF3Qjs7OztvQkFDcEMsd0NBQXdDO29CQUN4QyxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FDOUIsVUFBQSxVQUFVLElBQUksT0FBQSxLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsRUFBekUsQ0FBeUUsQ0FBQyxDQUFDO29CQUU3RixxREFBcUQ7b0JBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSwyQkFBbUIsQ0FBQyxDQUFDLENBQUM7Ozs7U0FDckQ7UUFFRCx5RUFBeUU7UUFDL0QsbURBQTJCLEdBQXJDLFVBQXNDLFdBQXdCO1lBQzVELE9BQVUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxVQUFLLDJCQUFxQixDQUFDO1FBQ25GLENBQUM7UUFFRCxvRkFBb0Y7UUFDMUUsa0RBQTBCLEdBQXBDLFVBQXFDLFdBQXdCO1lBQzNELE9BQVUsMkJBQW1CLFNBQUksV0FBVyxDQUFDLFdBQWEsQ0FBQztRQUM3RCxDQUFDO1FBRUQsaUVBQWlFO1FBQ3ZELGdEQUF3QixHQUFsQyxVQUFtQyxZQUFvQjtZQUNyRCxPQUFPLHFCQUFtQixZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUcsQ0FBQztRQUMvRCxDQUFDO1FBRUQ7OztXQUdHO1FBQ08sb0RBQTRCLEdBQXRDLFVBQXVDLGFBQXFCLEVBQUUsY0FBd0IsRUFBRSxPQUdsRjs7WUFIa0Ysd0JBQUEsRUFBQSxZQUdsRjtZQUNKLElBQU0sY0FBYyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDdkMsSUFBTSxjQUFjLEdBQWEsRUFBRSxDQUFDO1lBRXBDLElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtnQkFDbEIseUZBQXlGO2dCQUN6RixzRkFBc0Y7Z0JBQ3RGLG9GQUFvRjtnQkFDcEYsd0JBQXdCO2dCQUN4QixjQUFjLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO2FBQ3BDO1lBRUQsSUFBSSxPQUFPLENBQUMscUJBQXFCLEVBQUU7Z0JBQ2pDLG1GQUFtRjtnQkFDbkYsdUZBQXVGO2dCQUN2Riw0RkFBNEY7Z0JBQzVGLGlGQUFpRjtnQkFDakYsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMzQjs7Z0JBRUQsK0RBQStEO2dCQUMvRCxLQUF5QixJQUFBLG1CQUFBLGlCQUFBLGNBQWMsQ0FBQSw4Q0FBQSwwRUFBRTtvQkFBcEMsSUFBTSxVQUFVLDJCQUFBO29CQUNuQixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEUsb0NBQW9DO29CQUNwQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLGtEQUFrRDtvQkFDbEQsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsbUJBQUUsYUFBYSxHQUFLLGNBQWMsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7d0JBQ3pFLDJFQUEyRTt3QkFDM0UsMEVBQTBFO3dCQUMxRSwwRUFBMEU7d0JBQzFFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBQ2pELGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7cUJBQ2pDO29CQUNELG9GQUFvRjtvQkFDcEYsc0ZBQXNGO29CQUN0RixJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7d0JBQ2xCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO3FCQUMzQztpQkFDRjs7Ozs7Ozs7O1lBQ0QsT0FBTyxjQUFjLENBQUM7UUFDeEIsQ0FBQztRQUVEOzs7V0FHRztRQUNPLDJDQUFtQixHQUE3QixVQUE4QixLQUFlO1lBQTdDLGlCQVFDO1lBUjhDLHVCQUEwQjtpQkFBMUIsVUFBMEIsRUFBMUIscUJBQTBCLEVBQTFCLElBQTBCO2dCQUExQixzQ0FBMEI7O1lBQ3ZFLElBQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxZQUFZO2dCQUMxQyxJQUFNLGlCQUFpQixHQUFHLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdEUsT0FBTyxnQkFBYyxZQUFZLFNBQUksaUJBQW1CLENBQUM7WUFDM0QsQ0FBQyxDQUFDLENBQUM7WUFDSCwrRUFBK0U7WUFDL0UsNkRBQTZEO1lBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxtQkFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBSyxhQUFhLEVBQUssYUFBYSxFQUFFLENBQUM7UUFDL0YsQ0FBQztRQUVELGlEQUFpRDtRQUN2QyxrREFBMEIsR0FBcEMsVUFBcUMsS0FBZTtZQUFwRCxpQkFRQztZQVBDLElBQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQSxZQUFZO2dCQUN6QyxJQUFNLGlCQUFpQixHQUFHLEtBQUksQ0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDdEUsT0FBVSxpQkFBaUIsb0JBQWUsWUFBYyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1lBQ0gsa0ZBQWtGO1lBQ2xGLHdGQUF3RjtZQUN4RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsbUJBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFLLFlBQVksRUFBRSxDQUFDO1FBQy9ELENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUFwSEQsSUFvSEM7SUFwSHFCLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5cbi8qKlxuICogTmFtZSBvZiBhIHRlbXBvcmFyeSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgaGVhZCBvZiBhIGN1cnJlbnRseS1wcm9jZXNzZWQgUFIuIE5vdGVcbiAqIHRoYXQgYSBicmFuY2ggbmFtZSBzaG91bGQgYmUgdXNlZCB0aGF0IG1vc3QgbGlrZWx5IGRvZXMgbm90IGNvbmZsaWN0IHdpdGggb3RoZXIgbG9jYWxcbiAqIGRldmVsb3BtZW50IGJyYW5jaGVzLlxuICovXG5leHBvcnQgY29uc3QgVEVNUF9QUl9IRUFEX0JSQU5DSCA9ICdtZXJnZV9wcl9oZWFkJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBtZXJnZSBzdHJhdGVnaWVzLiBBIG1lcmdlIHN0cmF0ZWd5IGFjY2VwdHMgYSBwdWxsIHJlcXVlc3QgYW5kXG4gKiBtZXJnZXMgaXQgaW50byB0aGUgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGdpdDogR2l0Q2xpZW50KSB7fVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBhIG1lcmdlIG9mIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIFRoZSBzdHJhdGVneSBieSBkZWZhdWx0IHdpbGxcbiAgICogZmV0Y2ggYWxsIHRhcmdldCBicmFuY2hlcyBhbmQgdGhlIHB1bGwgcmVxdWVzdCBpbnRvIGxvY2FsIHRlbXBvcmFyeSBicmFuY2hlcy5cbiAgICovXG4gIGFzeW5jIHByZXBhcmUocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KSB7XG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFxuICAgICAgICBwdWxsUmVxdWVzdC50YXJnZXRCcmFuY2hlcywgYHB1bGwvJHtwdWxsUmVxdWVzdC5wck51bWJlcn0vaGVhZDoke1RFTVBfUFJfSEVBRF9CUkFOQ0h9YCk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIG1lcmdlIG9mIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIFRoaXMgbmVlZHMgdG8gYmUgaW1wbGVtZW50ZWRcbiAgICogYnkgaW5kaXZpZHVhbCBtZXJnZSBzdHJhdGVnaWVzLlxuICAgKi9cbiAgYWJzdHJhY3QgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxudWxsfFB1bGxSZXF1ZXN0RmFpbHVyZT47XG5cbiAgLyoqIENsZWFucyB1cCB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlLiBlLmcuIGRlbGV0aW5nIHRlbXBvcmFyeSBsb2NhbCBicmFuY2hlcy4gKi9cbiAgYXN5bmMgY2xlYW51cChwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpIHtcbiAgICAvLyBEZWxldGUgYWxsIHRlbXBvcmFyeSB0YXJnZXQgYnJhbmNoZXMuXG4gICAgcHVsbFJlcXVlc3QudGFyZ2V0QnJhbmNoZXMuZm9yRWFjaChcbiAgICAgICAgYnJhbmNoTmFtZSA9PiB0aGlzLmdpdC5ydW4oWydicmFuY2gnLCAnLUQnLCB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShicmFuY2hOYW1lKV0pKTtcblxuICAgIC8vIERlbGV0ZSB0ZW1wb3JhcnkgYnJhbmNoIGZvciB0aGUgcHVsbCByZXF1ZXN0IGhlYWQuXG4gICAgdGhpcy5naXQucnVuKFsnYnJhbmNoJywgJy1EJywgVEVNUF9QUl9IRUFEX0JSQU5DSF0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJldmlzaW9uIHJhbmdlIGZvciBhbGwgY29tbWl0cyBpbiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuICBwcm90ZWN0ZWQgZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3QpfS4uJHtURU1QX1BSX0hFQURfQlJBTkNIfWA7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYmFzZSByZXZpc2lvbiBvZiBhIHB1bGwgcmVxdWVzdC4gaS5lLiB0aGUgY29tbWl0IHRoZSBQUiBpcyBiYXNlZCBvbi4gKi9cbiAgcHJvdGVjdGVkIGdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke1RFTVBfUFJfSEVBRF9CUkFOQ0h9fiR7cHVsbFJlcXVlc3QuY29tbWl0Q291bnR9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgZGV0ZXJtaW5pc3RpYyBsb2NhbCBicmFuY2ggbmFtZSBmb3IgYSBnaXZlbiBicmFuY2guICovXG4gIHByb3RlY3RlZCBnZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbWVyZ2VfcHJfdGFyZ2V0XyR7dGFyZ2V0QnJhbmNoLnJlcGxhY2UoL1xcLy9nLCAnXycpfWA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlcnJ5LXBpY2tzIHRoZSBnaXZlbiByZXZpc2lvbiByYW5nZSBpbnRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIGxpc3Qgb2YgYnJhbmNoZXMgZm9yIHdoaWNoIHRoZSByZXZpc2lvbnMgY291bGQgbm90IGJlIGNoZXJyeS1waWNrZWQgaW50by5cbiAgICovXG4gIHByb3RlY3RlZCBjaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2U6IHN0cmluZywgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdLCBvcHRpb25zOiB7XG4gICAgZHJ5UnVuPzogYm9vbGVhbixcbiAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM/OiBib29sZWFuLFxuICB9ID0ge30pIHtcbiAgICBjb25zdCBjaGVycnlQaWNrQXJncyA9IFtyZXZpc2lvblJhbmdlXTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlczogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmIChvcHRpb25zLmRyeVJ1bikge1xuICAgICAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1jaGVycnktcGljayNEb2N1bWVudGF0aW9uL2dpdC1jaGVycnktcGljay50eHQtLS1uby1jb21taXRcbiAgICAgIC8vIFRoaXMgY2F1c2VzIGBnaXQgY2hlcnJ5LXBpY2tgIHRvIG5vdCBnZW5lcmF0ZSBhbnkgY29tbWl0cy4gSW5zdGVhZCwgdGhlIGNoYW5nZXMgYXJlXG4gICAgICAvLyBhcHBsaWVkIGRpcmVjdGx5IGluIHRoZSB3b3JraW5nIHRyZWUuIFRoaXMgYWxsb3cgdXMgdG8gZWFzaWx5IGRpc2NhcmQgdGhlIGNoYW5nZXNcbiAgICAgIC8vIGZvciBkcnktcnVuIHB1cnBvc2VzLlxuICAgICAgY2hlcnJ5UGlja0FyZ3MucHVzaCgnLS1uby1jb21taXQnKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5saW5rVG9PcmlnaW5hbENvbW1pdHMpIHtcbiAgICAgIC8vIFdlIGFkZCBgLXhgIHdoZW4gY2hlcnJ5LXBpY2tpbmcgYXMgdGhhdCB3aWxsIGFsbG93IHVzIHRvIGVhc2lseSBqdW1wIHRvIG9yaWdpbmFsXG4gICAgICAvLyBjb21taXRzIGZvciBjaGVycnktcGlja2VkIGNvbW1pdHMuIFdpdGggdGhhdCBmbGFnIHNldCwgR2l0IHdpbGwgYXV0b21hdGljYWxseSBhcHBlbmRcbiAgICAgIC8vIHRoZSBvcmlnaW5hbCBTSEEvcmV2aXNpb24gdG8gdGhlIGNvbW1pdCBtZXNzYWdlLiBlLmcuIGAoY2hlcnJ5IHBpY2tlZCBmcm9tIGNvbW1pdCA8Li4+KWAuXG4gICAgICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWNoZXJyeS1waWNrI0RvY3VtZW50YXRpb24vZ2l0LWNoZXJyeS1waWNrLnR4dC0teC5cbiAgICAgIGNoZXJyeVBpY2tBcmdzLnB1c2goJy14Jyk7XG4gICAgfVxuXG4gICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHJlZnNwZWMgaW50byBhbGwgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAgZm9yIChjb25zdCBicmFuY2hOYW1lIG9mIHRhcmdldEJyYW5jaGVzKSB7XG4gICAgICBjb25zdCBsb2NhbFRhcmdldEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKGJyYW5jaE5hbWUpO1xuICAgICAgLy8gQ2hlY2tvdXQgdGhlIGxvY2FsIHRhcmdldCBicmFuY2guXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsIGxvY2FsVGFyZ2V0QnJhbmNoXSk7XG4gICAgICAvLyBDaGVycnktcGljayB0aGUgcmVmc3BlYyBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoLlxuICAgICAgaWYgKHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAuLi5jaGVycnlQaWNrQXJnc10pLnN0YXR1cyAhPT0gMCkge1xuICAgICAgICAvLyBBYm9ydCB0aGUgZmFpbGVkIGNoZXJyeS1waWNrLiBXZSBkbyB0aGlzIGJlY2F1c2UgR2l0IHBlcnNpc3RzIHRoZSBmYWlsZWRcbiAgICAgICAgLy8gY2hlcnJ5LXBpY2sgc3RhdGUgZ2xvYmFsbHkgaW4gdGhlIHJlcG9zaXRvcnkuIFRoaXMgY291bGQgcHJldmVudCBmdXR1cmVcbiAgICAgICAgLy8gcHVsbCByZXF1ZXN0IG1lcmdlcyBhcyBhIEdpdCB0aGlua3MgYSBjaGVycnktcGljayBpcyBzdGlsbCBpbiBwcm9ncmVzcy5cbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10pO1xuICAgICAgICBmYWlsZWRCcmFuY2hlcy5wdXNoKGJyYW5jaE5hbWUpO1xuICAgICAgfVxuICAgICAgLy8gSWYgd2UgcnVuIHdpdGggZHJ5IHJ1biBtb2RlLCB3ZSByZXNldCB0aGUgbG9jYWwgdGFyZ2V0IGJyYW5jaCBzbyB0aGF0IGFsbCBkcnktcnVuXG4gICAgICAvLyBjaGVycnktcGljayBjaGFuZ2VzIGFyZSBkaXNjYXJkLiBDaGFuZ2VzIGFyZSBhcHBsaWVkIHRvIHRoZSB3b3JraW5nIHRyZWUgYW5kIGluZGV4LlxuICAgICAgaWYgKG9wdGlvbnMuZHJ5UnVuKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bihbJ3Jlc2V0JywgJy0taGFyZCcsICdIRUFEJ10pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFpbGVkQnJhbmNoZXM7XG4gIH1cblxuICAvKipcbiAgICogRmV0Y2hlcyB0aGUgZ2l2ZW4gdGFyZ2V0IGJyYW5jaGVzLiBBbHNvIGFjY2VwdHMgYSBsaXN0IG9mIGFkZGl0aW9uYWwgcmVmc3BlY3MgdGhhdFxuICAgKiBzaG91bGQgYmUgZmV0Y2hlZC4gVGhpcyBpcyBoZWxwZnVsIGFzIG11bHRpcGxlIHNsb3cgZmV0Y2hlcyBjb3VsZCBiZSBhdm9pZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGZldGNoVGFyZ2V0QnJhbmNoZXMobmFtZXM6IHN0cmluZ1tdLCAuLi5leHRyYVJlZnNwZWNzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IGZldGNoUmVmc3BlY3MgPSBuYW1lcy5tYXAodGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgcmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH06JHtsb2NhbFRhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIEZldGNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgd2l0aCBhIHNpbmdsZSBjb21tYW5kLiBXZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZW1cbiAgICAvLyBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLXEnLCAnLWYnLCB0aGlzLmdpdC5yZXBvR2l0VXJsLCAuLi5mZXRjaFJlZnNwZWNzLCAuLi5leHRyYVJlZnNwZWNzXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBnaXZlbiB0YXJnZXQgYnJhbmNoZXMgdXBzdHJlYW0uICovXG4gIHByb3RlY3RlZCBwdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShuYW1lczogc3RyaW5nW10pIHtcbiAgICBjb25zdCBwdXNoUmVmc3BlY3MgPSBuYW1lcy5tYXAodGFyZ2V0QnJhbmNoID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgJHtsb2NhbFRhcmdldEJyYW5jaH06cmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIFB1c2ggYWxsIHRhcmdldCBicmFuY2hlcyB3aXRoIGEgc2luZ2xlIGNvbW1hbmQgaWYgd2UgZG9uJ3QgcnVuIGluIGRyeS1ydW4gbW9kZS5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIHB1c2ggdGhlbSBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LnJlcG9HaXRVcmwsIC4uLnB1c2hSZWZzcGVjc10pO1xuICB9XG59XG4iXX0=