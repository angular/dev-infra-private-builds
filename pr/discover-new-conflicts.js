/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/discover-new-conflicts", ["require", "exports", "tslib", "cli-progress", "typed-graphqlify", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanUpGitState = exports.discoverNewConflictsForPr = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var git_1 = require("@angular/dev-infra-private/utils/git");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /* GraphQL schema for the response body for each pending PR. */
    var PR_SCHEMA = {
        headRef: {
            name: typed_graphqlify_1.types.string,
            repository: {
                url: typed_graphqlify_1.types.string,
                nameWithOwner: typed_graphqlify_1.types.string,
            },
        },
        baseRef: {
            name: typed_graphqlify_1.types.string,
            repository: {
                url: typed_graphqlify_1.types.string,
                nameWithOwner: typed_graphqlify_1.types.string,
            },
        },
        updatedAt: typed_graphqlify_1.types.string,
        number: typed_graphqlify_1.types.number,
        mergeable: typed_graphqlify_1.types.string,
        title: typed_graphqlify_1.types.string,
    };
    /** Convert raw Pull Request response from Github to usable Pull Request object. */
    function processPr(pr) {
        return tslib_1.__assign(tslib_1.__assign({}, pr), { updatedAt: (new Date(pr.updatedAt)).getTime() });
    }
    /** Name of a temporary local branch that is used for checking conflicts. **/
    var tempWorkingBranch = '__NgDevRepoBaseAfterChange__';
    /** Checks if the provided PR will cause new conflicts in other pending PRs. */
    function discoverNewConflictsForPr(newPrNumber, updatedAfter, config) {
        if (config === void 0) { config = config_1.getConfig(); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var originalBranch, progressBar, conflicts, updatedAfterString, allPendingPRs, requestedPr, pendingPrs, result, pendingPrs_1, pendingPrs_1_1, pr, result_1, conflicts_1, conflicts_1_1, pr;
            var e_1, _a, e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // If there are any local changes in the current repository state, the
                        // check cannot run as it needs to move between branches.
                        if (git_1.hasLocalChanges()) {
                            console.error('Cannot run with local changes. Please make sure there are no local changes.');
                            process.exit(1);
                        }
                        originalBranch = git_1.getCurrentBranch();
                        progressBar = new cli_progress_1.Bar({ format: "[{bar}] ETA: {eta}s | {value}/{total}" });
                        conflicts = [];
                        updatedAfterString = new Date(updatedAfter).toLocaleDateString();
                        console.info("Requesting pending PRs from Github");
                        return [4 /*yield*/, github_1.getPendingPrs(PR_SCHEMA, config.github)];
                    case 1:
                        allPendingPRs = (_c.sent()).map(processPr);
                        requestedPr = allPendingPRs.find(function (pr) { return pr.number === newPrNumber; });
                        if (requestedPr === undefined) {
                            console.error("The request PR, #" + newPrNumber + " was not found as a pending PR on github, please confirm");
                            console.error("the PR number is correct and is an open PR");
                            process.exit(1);
                        }
                        pendingPrs = allPendingPRs.filter(function (pr) {
                            return (
                            // PRs being merged into the same target branch as the requested PR
                            pr.baseRef.name === requestedPr.baseRef.name &&
                                // PRs which either have not been processed or are determined as mergable by Github
                                pr.mergeable !== 'CONFLICTING' &&
                                // PRs updated after the provided date
                                pr.updatedAt >= updatedAfter);
                        });
                        console.info("Retrieved " + allPendingPRs.length + " total pending PRs");
                        console.info("Checking " + pendingPrs.length + " PRs for conflicts after a merge of #" + newPrNumber);
                        // Fetch and checkout the PR being checked.
                        shelljs_1.exec("git fetch " + requestedPr.headRef.repository.url + " " + requestedPr.headRef.name);
                        shelljs_1.exec("git checkout -B " + tempWorkingBranch + " FETCH_HEAD");
                        // Rebase the PR against the PRs target branch.
                        shelljs_1.exec("git fetch " + requestedPr.baseRef.repository.url + " " + requestedPr.baseRef.name);
                        result = shelljs_1.exec("git rebase FETCH_HEAD");
                        if (result.code) {
                            console.error('The requested PR currently has conflicts');
                            cleanUpGitState(originalBranch);
                            process.exit(1);
                        }
                        // Start the progress bar
                        progressBar.start(pendingPrs.length, 0);
                        try {
                            // Check each PR to determine if it can merge cleanly into the repo after the target PR.
                            for (pendingPrs_1 = tslib_1.__values(pendingPrs), pendingPrs_1_1 = pendingPrs_1.next(); !pendingPrs_1_1.done; pendingPrs_1_1 = pendingPrs_1.next()) {
                                pr = pendingPrs_1_1.value;
                                // Fetch and checkout the next PR
                                shelljs_1.exec("git fetch " + pr.headRef.repository.url + " " + pr.headRef.name);
                                shelljs_1.exec("git checkout --detach FETCH_HEAD");
                                result_1 = shelljs_1.exec("git rebase " + tempWorkingBranch);
                                if (result_1.code !== 0) {
                                    conflicts.push(pr);
                                }
                                // Abort any outstanding rebase attempt.
                                shelljs_1.exec("git rebase --abort");
                                progressBar.increment(1);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (pendingPrs_1_1 && !pendingPrs_1_1.done && (_a = pendingPrs_1.return)) _a.call(pendingPrs_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        // End the progress bar as all PRs have been processed.
                        progressBar.stop();
                        console.info("\nResult:");
                        cleanUpGitState(originalBranch);
                        // If no conflicts are found, exit successfully.
                        if (conflicts.length === 0) {
                            console.info("No new conflicting PRs found after #" + newPrNumber + " merging");
                            process.exit(0);
                        }
                        // Inform about discovered conflicts, exit with failure.
                        console.error(conflicts.length + " PR(s) which conflict(s) after #" + newPrNumber + " merges:");
                        try {
                            for (conflicts_1 = tslib_1.__values(conflicts), conflicts_1_1 = conflicts_1.next(); !conflicts_1_1.done; conflicts_1_1 = conflicts_1.next()) {
                                pr = conflicts_1_1.value;
                                console.error("  - " + pr.number + ": " + pr.title);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (conflicts_1_1 && !conflicts_1_1.done && (_b = conflicts_1.return)) _b.call(conflicts_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        process.exit(1);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.discoverNewConflictsForPr = discoverNewConflictsForPr;
    /** Reset git back to the provided branch. */
    function cleanUpGitState(branch) {
        // Ensure that any outstanding rebases are aborted.
        shelljs_1.exec("git rebase --abort");
        // Ensure that any changes in the current repo state are cleared.
        shelljs_1.exec("git reset --hard");
        // Checkout the original branch from before the run began.
        shelljs_1.exec("git checkout " + branch);
        // Delete the generated branch.
        shelljs_1.exec("git branch -D " + tempWorkingBranch);
    }
    exports.cleanUpGitState = cleanUpGitState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXItbmV3LWNvbmZsaWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9kaXNjb3Zlci1uZXctY29uZmxpY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCw2Q0FBaUM7SUFDakMscURBQXVEO0lBRXZELGtFQUF1RDtJQUN2RCw0REFBK0Q7SUFDL0Qsa0VBQThDO0lBQzlDLG9FQUFzQztJQUd0QywrREFBK0Q7SUFDL0QsSUFBTSxTQUFTLEdBQUc7UUFDaEIsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixNQUFNLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzNCLFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtLQUMzQixDQUFDO0lBS0YsbUZBQW1GO0lBQ25GLFNBQVMsU0FBUyxDQUFDLEVBQWtCO1FBQ25DLDZDQUFXLEVBQUUsS0FBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBRTtJQUNoRSxDQUFDO0lBS0QsNkVBQTZFO0lBQzdFLElBQU0saUJBQWlCLEdBQUcsOEJBQThCLENBQUM7SUFFekQsK0VBQStFO0lBQy9FLFNBQXNCLHlCQUF5QixDQUMzQyxXQUFtQixFQUFFLFlBQW9CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOzs7Ozs7O3dCQUM5RixzRUFBc0U7d0JBQ3RFLHlEQUF5RDt3QkFDekQsSUFBSSxxQkFBZSxFQUFFLEVBQUU7NEJBQ3JCLE9BQU8sQ0FBQyxLQUFLLENBQUMsNkVBQTZFLENBQUMsQ0FBQzs0QkFDN0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBR0ssY0FBYyxHQUFHLHNCQUFnQixFQUFFLENBQUM7d0JBRXBDLFdBQVcsR0FBRyxJQUFJLGtCQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsdUNBQXVDLEVBQUMsQ0FBQyxDQUFDO3dCQUV6RSxTQUFTLEdBQXVCLEVBQUUsQ0FBQzt3QkFFbkMsa0JBQWtCLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzt3QkFFdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO3dCQUU1QixxQkFBTSxzQkFBYSxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUE7O3dCQUE5RCxhQUFhLEdBQUcsQ0FBQyxTQUE2QyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQzt3QkFFOUUsV0FBVyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBQSxFQUFFLElBQUksT0FBQSxFQUFFLENBQUMsTUFBTSxLQUFLLFdBQVcsRUFBekIsQ0FBeUIsQ0FBQyxDQUFDO3dCQUN4RSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7NEJBQzdCLE9BQU8sQ0FBQyxLQUFLLENBQ1Qsc0JBQW9CLFdBQVcsNkRBQTBELENBQUMsQ0FBQzs0QkFDL0YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDOzRCQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFSyxVQUFVLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFBLEVBQUU7NEJBQ3hDLE9BQU87NEJBQ0gsbUVBQW1FOzRCQUNuRSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUk7Z0NBQzVDLG1GQUFtRjtnQ0FDbkYsRUFBRSxDQUFDLFNBQVMsS0FBSyxhQUFhO2dDQUM5QixzQ0FBc0M7Z0NBQ3RDLEVBQUUsQ0FBQyxTQUFTLElBQUksWUFBWSxDQUFDLENBQUM7d0JBQ3BDLENBQUMsQ0FBQyxDQUFDO3dCQUNILE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBYSxhQUFhLENBQUMsTUFBTSx1QkFBb0IsQ0FBQyxDQUFDO3dCQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQVksVUFBVSxDQUFDLE1BQU0sNkNBQXdDLFdBQWEsQ0FBQyxDQUFDO3dCQUVqRywyQ0FBMkM7d0JBQzNDLGNBQUksQ0FBQyxlQUFhLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBSSxXQUFXLENBQUMsT0FBTyxDQUFDLElBQU0sQ0FBQyxDQUFDO3dCQUNwRixjQUFJLENBQUMscUJBQW1CLGlCQUFpQixnQkFBYSxDQUFDLENBQUM7d0JBRXhELCtDQUErQzt3QkFDL0MsY0FBSSxDQUFDLGVBQWEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxTQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDLENBQUM7d0JBQzlFLE1BQU0sR0FBRyxjQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQzt3QkFDN0MsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFOzRCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzs0QkFDMUQsZUFBZSxDQUFDLGNBQWMsQ0FBQyxDQUFDOzRCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCx5QkFBeUI7d0JBQ3pCLFdBQVcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQzs7NEJBRXhDLHdGQUF3Rjs0QkFDeEYsS0FBaUIsZUFBQSxpQkFBQSxVQUFVLENBQUEsb0dBQUU7Z0NBQWxCLEVBQUU7Z0NBQ1gsaUNBQWlDO2dDQUNqQyxjQUFJLENBQUMsZUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFNLENBQUMsQ0FBQztnQ0FDbEUsY0FBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7Z0NBRW5DLFdBQVMsY0FBSSxDQUFDLGdCQUFjLGlCQUFtQixDQUFDLENBQUM7Z0NBQ3ZELElBQUksUUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7b0NBQ3JCLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7aUNBQ3BCO2dDQUNELHdDQUF3QztnQ0FDeEMsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0NBRTNCLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQzFCOzs7Ozs7Ozs7d0JBQ0QsdURBQXVEO3dCQUN2RCxXQUFXLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBRTFCLGVBQWUsQ0FBQyxjQUFjLENBQUMsQ0FBQzt3QkFFaEMsZ0RBQWdEO3dCQUNoRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUF1QyxXQUFXLGFBQVUsQ0FBQyxDQUFDOzRCQUMzRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCx3REFBd0Q7d0JBQ3hELE9BQU8sQ0FBQyxLQUFLLENBQUksU0FBUyxDQUFDLE1BQU0sd0NBQW1DLFdBQVcsYUFBVSxDQUFDLENBQUM7OzRCQUMzRixLQUFpQixjQUFBLGlCQUFBLFNBQVMsQ0FBQSwrRkFBRTtnQ0FBakIsRUFBRTtnQ0FDWCxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQU8sRUFBRSxDQUFDLE1BQU0sVUFBSyxFQUFFLENBQUMsS0FBTyxDQUFDLENBQUM7NkJBQ2hEOzs7Ozs7Ozs7d0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUEzRkQsOERBMkZDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWdCLGVBQWUsQ0FBQyxNQUFjO1FBQzVDLG1EQUFtRDtRQUNuRCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMzQixpRUFBaUU7UUFDakUsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDekIsMERBQTBEO1FBQzFELGNBQUksQ0FBQyxrQkFBZ0IsTUFBUSxDQUFDLENBQUM7UUFDL0IsK0JBQStCO1FBQy9CLGNBQUksQ0FBQyxtQkFBaUIsaUJBQW1CLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBVEQsMENBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2dldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2dldEN1cnJlbnRCcmFuY2gsIGhhc0xvY2FsQ2hhbmdlc30gZnJvbSAnLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaFFMIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihcbiAgICBuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlciwgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIHdoZW4gdGhlIHJ1biBiZWdhbi4gKi9cbiAgY29uc3Qgb3JpZ2luYWxCcmFuY2ggPSBnZXRDdXJyZW50QnJhbmNoKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcbiAgLyogU3RyaW5nIHZlcnNpb24gb2YgdGhlIHVwZGF0ZWRBZnRlciB2YWx1ZSwgZm9yIGxvZ2dpbmcuICovXG4gIGNvbnN0IHVwZGF0ZWRBZnRlclN0cmluZyA9IG5ldyBEYXRlKHVwZGF0ZWRBZnRlcikudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG5cbiAgY29uc29sZS5pbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGNvbmZpZy5naXRodWIpKS5tYXAocHJvY2Vzc1ByKTtcbiAgLyoqIFRoZSBQUiB3aGljaCBpcyBiZWluZyBjaGVja2VkIGFnYWluc3QuICovXG4gIGNvbnN0IHJlcXVlc3RlZFByID0gYWxsUGVuZGluZ1BScy5maW5kKHByID0+IHByLm51bWJlciA9PT0gbmV3UHJOdW1iZXIpO1xuICBpZiAocmVxdWVzdGVkUHIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBjb25zb2xlLmVycm9yKGB0aGUgUFIgbnVtYmVyIGlzIGNvcnJlY3QgYW5kIGlzIGFuIG9wZW4gUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBwZW5kaW5nUHJzID0gYWxsUGVuZGluZ1BScy5maWx0ZXIocHIgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8vIFBScyBiZWluZyBtZXJnZWQgaW50byB0aGUgc2FtZSB0YXJnZXQgYnJhbmNoIGFzIHRoZSByZXF1ZXN0ZWQgUFJcbiAgICAgICAgcHIuYmFzZVJlZi5uYW1lID09PSByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWUgJiZcbiAgICAgICAgLy8gUFJzIHdoaWNoIGVpdGhlciBoYXZlIG5vdCBiZWVuIHByb2Nlc3NlZCBvciBhcmUgZGV0ZXJtaW5lZCBhcyBtZXJnYWJsZSBieSBHaXRodWJcbiAgICAgICAgcHIubWVyZ2VhYmxlICE9PSAnQ09ORkxJQ1RJTkcnICYmXG4gICAgICAgIC8vIFBScyB1cGRhdGVkIGFmdGVyIHRoZSBwcm92aWRlZCBkYXRlXG4gICAgICAgIHByLnVwZGF0ZWRBdCA+PSB1cGRhdGVkQWZ0ZXIpO1xuICB9KTtcbiAgY29uc29sZS5pbmZvKGBSZXRyaWV2ZWQgJHthbGxQZW5kaW5nUFJzLmxlbmd0aH0gdG90YWwgcGVuZGluZyBQUnNgKTtcbiAgY29uc29sZS5pbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWV9YCk7XG4gIGV4ZWMoYGdpdCBjaGVja291dCAtQiAke3RlbXBXb3JraW5nQnJhbmNofSBGRVRDSF9IRUFEYCk7XG5cbiAgLy8gUmViYXNlIHRoZSBQUiBhZ2FpbnN0IHRoZSBQUnMgdGFyZ2V0IGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWV9YCk7XG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdUaGUgcmVxdWVzdGVkIFBSIGN1cnJlbnRseSBoYXMgY29uZmxpY3RzJyk7XG4gICAgY2xlYW5VcEdpdFN0YXRlKG9yaWdpbmFsQnJhbmNoKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdQcnMubGVuZ3RoLCAwKTtcblxuICAvLyBDaGVjayBlYWNoIFBSIHRvIGRldGVybWluZSBpZiBpdCBjYW4gbWVyZ2UgY2xlYW5seSBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gIGZvciAoY29uc3QgcHIgb2YgcGVuZGluZ1Bycykge1xuICAgIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgbmV4dCBQUlxuICAgIGV4ZWMoYGdpdCBmZXRjaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cHIuaGVhZFJlZi5uYW1lfWApO1xuICAgIGV4ZWMoYGdpdCBjaGVja291dCAtLWRldGFjaCBGRVRDSF9IRUFEYCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSAke3RlbXBXb3JraW5nQnJhbmNofWApO1xuICAgIGlmIChyZXN1bHQuY29kZSAhPT0gMCkge1xuICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG5cbiAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gIH1cbiAgLy8gRW5kIHRoZSBwcm9ncmVzcyBiYXIgYXMgYWxsIFBScyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gIGNvbnNvbGUuaW5mbyhgXFxuUmVzdWx0OmApO1xuXG4gIGNsZWFuVXBHaXRTdGF0ZShvcmlnaW5hbEJyYW5jaCk7XG5cbiAgLy8gSWYgbm8gY29uZmxpY3RzIGFyZSBmb3VuZCwgZXhpdCBzdWNjZXNzZnVsbHkuXG4gIGlmIChjb25mbGljdHMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS5pbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgY29uc29sZS5lcnJvcihgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGNvbnNvbGUuZXJyb3IoYCAgLSAke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogUmVzZXQgZ2l0IGJhY2sgdG8gdGhlIHByb3ZpZGVkIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblVwR2l0U3RhdGUoYnJhbmNoOiBzdHJpbmcpIHtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMgYXJlIGFib3J0ZWQuXG4gIGV4ZWMoYGdpdCByZWJhc2UgLS1hYm9ydGApO1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvIHN0YXRlIGFyZSBjbGVhcmVkLlxuICBleGVjKGBnaXQgcmVzZXQgLS1oYXJkYCk7XG4gIC8vIENoZWNrb3V0IHRoZSBvcmlnaW5hbCBicmFuY2ggZnJvbSBiZWZvcmUgdGhlIHJ1biBiZWdhbi5cbiAgZXhlYyhgZ2l0IGNoZWNrb3V0ICR7YnJhbmNofWApO1xuICAvLyBEZWxldGUgdGhlIGdlbmVyYXRlZCBicmFuY2guXG4gIGV4ZWMoYGdpdCBicmFuY2ggLUQgJHt0ZW1wV29ya2luZ0JyYW5jaH1gKTtcbn1cbiJdfQ==