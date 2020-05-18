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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFNSDs7OztPQUlHO0lBQ1UsUUFBQSxtQkFBbUIsR0FBRyxlQUFlLENBQUM7SUFFbkQ7OztPQUdHO0lBQ0g7UUFDRSx1QkFBc0IsR0FBYztZQUFkLFFBQUcsR0FBSCxHQUFHLENBQVc7UUFBRyxDQUFDO1FBRXhDOzs7V0FHRztRQUNHLCtCQUFPLEdBQWIsVUFBYyxXQUF3Qjs7O29CQUNwQyxJQUFJLENBQUMsbUJBQW1CLENBQ3BCLFdBQVcsQ0FBQyxjQUFjLEVBQUUsVUFBUSxXQUFXLENBQUMsUUFBUSxjQUFTLDJCQUFxQixDQUFDLENBQUM7Ozs7U0FDN0Y7UUFRRCxnRkFBZ0Y7UUFDMUUsK0JBQU8sR0FBYixVQUFjLFdBQXdCOzs7O29CQUNwQyx3Q0FBd0M7b0JBQ3hDLFdBQVcsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUM5QixVQUFBLFVBQVUsSUFBSSxPQUFBLEtBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxLQUFJLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUF6RSxDQUF5RSxDQUFDLENBQUM7b0JBRTdGLHFEQUFxRDtvQkFDckQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLDJCQUFtQixDQUFDLENBQUMsQ0FBQzs7OztTQUNyRDtRQUVELHlFQUF5RTtRQUMvRCxtREFBMkIsR0FBckMsVUFBc0MsV0FBd0I7WUFDNUQsT0FBVSxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLFVBQUssMkJBQXFCLENBQUM7UUFDbkYsQ0FBQztRQUVELG9GQUFv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QkFDdEUsT0FBVSxpQkFBaUIsb0JBQWUsWUFBYyxDQUFDO1lBQzNELENBQUMsQ0FBQyxDQUFDO1lBQ0gsa0ZBQWtGO1lBQ2xGLHdGQUF3RjtZQUN4RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsbUJBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxHQUFLLFlBQVksRUFBRSxDQUFDO1FBQy9ELENBQUM7UUFDSCxvQkFBQztJQUFELENBQUMsQUEzR0QsSUEyR0M7SUEzR3FCLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vZ2l0JztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5cbi8qKlxuICogTmFtZSBvZiBhIHRlbXBvcmFyeSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgaGVhZCBvZiBhIGN1cnJlbnRseS1wcm9jZXNzZWQgUFIuIE5vdGVcbiAqIHRoYXQgYSBicmFuY2ggbmFtZSBzaG91bGQgYmUgdXNlZCB0aGF0IG1vc3QgbGlrZWx5IGRvZXMgbm90IGNvbmZsaWN0IHdpdGggb3RoZXIgbG9jYWxcbiAqIGRldmVsb3BtZW50IGJyYW5jaGVzLlxuICovXG5leHBvcnQgY29uc3QgVEVNUF9QUl9IRUFEX0JSQU5DSCA9ICdtZXJnZV9wcl9oZWFkJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBtZXJnZSBzdHJhdGVnaWVzLiBBIG1lcmdlIHN0cmF0ZWd5IGFjY2VwdHMgYSBwdWxsIHJlcXVlc3QgYW5kXG4gKiBtZXJnZXMgaXQgaW50byB0aGUgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIGdpdDogR2l0Q2xpZW50KSB7fVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlcyBhIG1lcmdlIG9mIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIFRoZSBzdHJhdGVneSBieSBkZWZhdWx0IHdpbGxcbiAgICogZmV0Y2ggYWxsIHRhcmdldCBicmFuY2hlcyBhbmQgdGhlIHB1bGwgcmVxdWVzdCBpbnRvIGxvY2FsIHRlbXBvcmFyeSBicmFuY2hlcy5cbiAgICovXG4gIGFzeW5jIHByZXBhcmUocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KSB7XG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFxuICAgICAgICBwdWxsUmVxdWVzdC50YXJnZXRCcmFuY2hlcywgYHB1bGwvJHtwdWxsUmVxdWVzdC5wck51bWJlcn0vaGVhZDoke1RFTVBfUFJfSEVBRF9CUkFOQ0h9YCk7XG4gIH1cblxuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIG1lcmdlIG9mIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIFRoaXMgbmVlZHMgdG8gYmUgaW1wbGVtZW50ZWRcbiAgICogYnkgaW5kaXZpZHVhbCBtZXJnZSBzdHJhdGVnaWVzLlxuICAgKi9cbiAgYWJzdHJhY3QgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxudWxsfFB1bGxSZXF1ZXN0RmFpbHVyZT47XG5cbiAgLyoqIENsZWFucyB1cCB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlLiBlLmcuIGRlbGV0aW5nIHRlbXBvcmFyeSBsb2NhbCBicmFuY2hlcy4gKi9cbiAgYXN5bmMgY2xlYW51cChwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpIHtcbiAgICAvLyBEZWxldGUgYWxsIHRlbXBvcmFyeSB0YXJnZXQgYnJhbmNoZXMuXG4gICAgcHVsbFJlcXVlc3QudGFyZ2V0QnJhbmNoZXMuZm9yRWFjaChcbiAgICAgICAgYnJhbmNoTmFtZSA9PiB0aGlzLmdpdC5ydW4oWydicmFuY2gnLCAnLUQnLCB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShicmFuY2hOYW1lKV0pKTtcblxuICAgIC8vIERlbGV0ZSB0ZW1wb3JhcnkgYnJhbmNoIGZvciB0aGUgcHVsbCByZXF1ZXN0IGhlYWQuXG4gICAgdGhpcy5naXQucnVuKFsnYnJhbmNoJywgJy1EJywgVEVNUF9QUl9IRUFEX0JSQU5DSF0pO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJldmlzaW9uIHJhbmdlIGZvciBhbGwgY29tbWl0cyBpbiB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuICBwcm90ZWN0ZWQgZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3QpfS4uJHtURU1QX1BSX0hFQURfQlJBTkNIfWA7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgYmFzZSByZXZpc2lvbiBvZiBhIHB1bGwgcmVxdWVzdC4gaS5lLiB0aGUgY29tbWl0IHRoZSBQUiBpcyBiYXNlZCBvbi4gKi9cbiAgcHJvdGVjdGVkIGdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke1RFTVBfUFJfSEVBRF9CUkFOQ0h9fiR7cHVsbFJlcXVlc3QuY29tbWl0Q291bnR9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgZGV0ZXJtaW5pc3RpYyBsb2NhbCBicmFuY2ggbmFtZSBmb3IgYSBnaXZlbiBicmFuY2guICovXG4gIHByb3RlY3RlZCBnZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBgbWVyZ2VfcHJfdGFyZ2V0XyR7dGFyZ2V0QnJhbmNoLnJlcGxhY2UoL1xcLy9nLCAnXycpfWA7XG4gIH1cblxuICAvKipcbiAgICogQ2hlcnJ5LXBpY2tzIHRoZSBnaXZlbiByZXZpc2lvbiByYW5nZSBpbnRvIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIGxpc3Qgb2YgYnJhbmNoZXMgZm9yIHdoaWNoIHRoZSByZXZpc2lvbnMgY291bGQgbm90IGJlIGNoZXJyeS1waWNrZWQgaW50by5cbiAgICovXG4gIHByb3RlY3RlZCBjaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2U6IHN0cmluZywgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdLCBvcHRpb25zOiB7XG4gICAgZHJ5UnVuPzogYm9vbGVhblxuICB9ID0ge30pIHtcbiAgICBjb25zdCBjaGVycnlQaWNrQXJncyA9IFtyZXZpc2lvblJhbmdlXTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlczogc3RyaW5nW10gPSBbXTtcblxuICAgIGlmIChvcHRpb25zLmRyeVJ1bikge1xuICAgICAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1jaGVycnktcGljayNEb2N1bWVudGF0aW9uL2dpdC1jaGVycnktcGljay50eHQtLS1uby1jb21taXRcbiAgICAgIC8vIFRoaXMgY2F1c2VzIGBnaXQgY2hlcnJ5LXBpY2tgIHRvIG5vdCBnZW5lcmF0ZSBhbnkgY29tbWl0cy4gSW5zdGVhZCwgdGhlIGNoYW5nZXMgYXJlXG4gICAgICAvLyBhcHBsaWVkIGRpcmVjdGx5IGluIHRoZSB3b3JraW5nIHRyZWUuIFRoaXMgYWxsb3cgdXMgdG8gZWFzaWx5IGRpc2NhcmQgdGhlIGNoYW5nZXNcbiAgICAgIC8vIGZvciBkcnktcnVuIHB1cnBvc2VzLlxuICAgICAgY2hlcnJ5UGlja0FyZ3MucHVzaCgnLS1uby1jb21taXQnKTtcbiAgICB9XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcmVmc3BlYyBpbnRvIGFsbCBkZXRlcm1pbmVkIHRhcmdldCBicmFuY2hlcy5cbiAgICBmb3IgKGNvbnN0IGJyYW5jaE5hbWUgb2YgdGFyZ2V0QnJhbmNoZXMpIHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUoYnJhbmNoTmFtZSk7XG4gICAgICAvLyBDaGVja291dCB0aGUgbG9jYWwgdGFyZ2V0IGJyYW5jaC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgbG9jYWxUYXJnZXRCcmFuY2hdKTtcbiAgICAgIC8vIENoZXJyeS1waWNrIHRoZSByZWZzcGVjIGludG8gdGhlIHRhcmdldCBicmFuY2guXG4gICAgICBpZiAodGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsIC4uLmNoZXJyeVBpY2tBcmdzXSkuc3RhdHVzICE9PSAwKSB7XG4gICAgICAgIC8vIEFib3J0IHRoZSBmYWlsZWQgY2hlcnJ5LXBpY2suIFdlIGRvIHRoaXMgYmVjYXVzZSBHaXQgcGVyc2lzdHMgdGhlIGZhaWxlZFxuICAgICAgICAvLyBjaGVycnktcGljayBzdGF0ZSBnbG9iYWxseSBpbiB0aGUgcmVwb3NpdG9yeS4gVGhpcyBjb3VsZCBwcmV2ZW50IGZ1dHVyZVxuICAgICAgICAvLyBwdWxsIHJlcXVlc3QgbWVyZ2VzIGFzIGEgR2l0IHRoaW5rcyBhIGNoZXJyeS1waWNrIGlzIHN0aWxsIGluIHByb2dyZXNzLlxuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSk7XG4gICAgICAgIGZhaWxlZEJyYW5jaGVzLnB1c2goYnJhbmNoTmFtZSk7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSBydW4gd2l0aCBkcnkgcnVuIG1vZGUsIHdlIHJlc2V0IHRoZSBsb2NhbCB0YXJnZXQgYnJhbmNoIHNvIHRoYXQgYWxsIGRyeS1ydW5cbiAgICAgIC8vIGNoZXJyeS1waWNrIGNoYW5nZXMgYXJlIGRpc2NhcmQuIENoYW5nZXMgYXJlIGFwcGxpZWQgdG8gdGhlIHdvcmtpbmcgdHJlZSBhbmQgaW5kZXguXG4gICAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgICAgdGhpcy5naXQucnVuKFsncmVzZXQnLCAnLS1oYXJkJywgJ0hFQUQnXSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWlsZWRCcmFuY2hlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIHRoZSBnaXZlbiB0YXJnZXQgYnJhbmNoZXMuIEFsc28gYWNjZXB0cyBhIGxpc3Qgb2YgYWRkaXRpb25hbCByZWZzcGVjcyB0aGF0XG4gICAqIHNob3VsZCBiZSBmZXRjaGVkLiBUaGlzIGlzIGhlbHBmdWwgYXMgbXVsdGlwbGUgc2xvdyBmZXRjaGVzIGNvdWxkIGJlIGF2b2lkZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZmV0Y2hUYXJnZXRCcmFuY2hlcyhuYW1lczogc3RyaW5nW10sIC4uLmV4dHJhUmVmc3BlY3M6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgZmV0Y2hSZWZzcGVjcyA9IG5hbWVzLm1hcCh0YXJnZXRCcmFuY2ggPT4ge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZSh0YXJnZXRCcmFuY2gpO1xuICAgICAgcmV0dXJuIGByZWZzL2hlYWRzLyR7dGFyZ2V0QnJhbmNofToke2xvY2FsVGFyZ2V0QnJhbmNofWA7XG4gICAgfSk7XG4gICAgLy8gRmV0Y2ggYWxsIHRhcmdldCBicmFuY2hlcyB3aXRoIGEgc2luZ2xlIGNvbW1hbmQuIFdlIGRvbid0IHdhbnQgdG8gZmV0Y2ggdGhlbVxuICAgIC8vIGluZGl2aWR1YWxseSBhcyB0aGF0IGNvdWxkIGNhdXNlIGFuIHVubmVjZXNzYXJ5IHNsb3ctZG93bi5cbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctZicsIHRoaXMuZ2l0LnJlcG9HaXRVcmwsIC4uLmZldGNoUmVmc3BlY3MsIC4uLmV4dHJhUmVmc3BlY3NdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGdpdmVuIHRhcmdldCBicmFuY2hlcyB1cHN0cmVhbS4gKi9cbiAgcHJvdGVjdGVkIHB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKG5hbWVzOiBzdHJpbmdbXSkge1xuICAgIGNvbnN0IHB1c2hSZWZzcGVjcyA9IG5hbWVzLm1hcCh0YXJnZXRCcmFuY2ggPT4ge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZSh0YXJnZXRCcmFuY2gpO1xuICAgICAgcmV0dXJuIGAke2xvY2FsVGFyZ2V0QnJhbmNofTpyZWZzL2hlYWRzLyR7dGFyZ2V0QnJhbmNofWA7XG4gICAgfSk7XG4gICAgLy8gUHVzaCBhbGwgdGFyZ2V0IGJyYW5jaGVzIHdpdGggYSBzaW5nbGUgY29tbWFuZCBpZiB3ZSBkb24ndCBydW4gaW4gZHJ5LXJ1biBtb2RlLlxuICAgIC8vIFdlIGRvbid0IHdhbnQgdG8gcHVzaCB0aGVtIGluZGl2aWR1YWxseSBhcyB0aGF0IGNvdWxkIGNhdXNlIGFuIHVubmVjZXNzYXJ5IHNsb3ctZG93bi5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgdGhpcy5naXQucmVwb0dpdFVybCwgLi4ucHVzaFJlZnNwZWNzXSk7XG4gIH1cbn1cbiJdfQ==