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
            var originalBranch, progressBar, conflicts, allPendingPRs, requestedPr, pendingPrs, result, pendingPrs_1, pendingPrs_1_1, pr, result_1, conflicts_1, conflicts_1_1, pr;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2Q0FBaUM7SUFDakMscURBQXVEO0lBRXZELGtFQUEwRDtJQUMxRCw0REFBa0U7SUFDbEUsa0VBQWlEO0lBQ2pELG9FQUF5QztJQUd6QywrREFBK0Q7SUFDL0QsSUFBTSxTQUFTLEdBQUc7UUFDaEIsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixNQUFNLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzNCLFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtLQUMzQixDQUFDO0lBS0YsbUZBQW1GO0lBQ25GLFNBQVMsU0FBUyxDQUFDLEVBQWtCO1FBQ25DLDZDQUFXLEVBQUUsS0FBRSxTQUFTLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBRTtJQUNoRSxDQUFDO0lBS0QsNkVBQTZFO0lBQzdFLElBQU0saUJBQWlCLEdBQUcsOEJBQThCLENBQUM7SUFFekQs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NkJBQ2hEOzs7Ozs7Ozs7d0JBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUF6RkQsOERBeUZDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWdCLGVBQWUsQ0FBQyxNQUFjO1FBQzVDLG1EQUFtRDtRQUNuRCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMzQixpRUFBaUU7UUFDakUsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDekIsMERBQTBEO1FBQzFELGNBQUksQ0FBQyxrQkFBZ0IsTUFBUSxDQUFDLENBQUM7UUFDL0IsK0JBQStCO1FBQy9CLGNBQUksQ0FBQyxtQkFBaUIsaUJBQW1CLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBVEQsMENBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2dldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2dldEN1cnJlbnRCcmFuY2gsIGhhc0xvY2FsQ2hhbmdlc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaFFMIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihcbiAgICBuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlciwgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIHdoZW4gdGhlIHJ1biBiZWdhbi4gKi9cbiAgY29uc3Qgb3JpZ2luYWxCcmFuY2ggPSBnZXRDdXJyZW50QnJhbmNoKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBjb25zb2xlLmluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgY29uZmlnLmdpdGh1YikpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYFRoZSByZXF1ZXN0IFBSLCAjJHtuZXdQck51bWJlcn0gd2FzIG5vdCBmb3VuZCBhcyBhIHBlbmRpbmcgUFIgb24gZ2l0aHViLCBwbGVhc2UgY29uZmlybWApO1xuICAgIGNvbnNvbGUuZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcihwciA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgICBwci5iYXNlUmVmLm5hbWUgPT09IHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZSAmJlxuICAgICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgICAgLy8gUFJzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRhdGVcbiAgICAgICAgcHIudXBkYXRlZEF0ID49IHVwZGF0ZWRBZnRlcik7XG4gIH0pO1xuICBjb25zb2xlLmluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBjb25zb2xlLmluZm8oYENoZWNraW5nICR7cGVuZGluZ1Bycy5sZW5ndGh9IFBScyBmb3IgY29uZmxpY3RzIGFmdGVyIGEgbWVyZ2Ugb2YgIyR7bmV3UHJOdW1iZXJ9YCk7XG5cbiAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBQUiBiZWluZyBjaGVja2VkLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmhlYWRSZWYubmFtZX1gKTtcbiAgZXhlYyhgZ2l0IGNoZWNrb3V0IC1CICR7dGVtcFdvcmtpbmdCcmFuY2h9IEZFVENIX0hFQURgKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmJhc2VSZWYubmFtZX1gKTtcbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSBGRVRDSF9IRUFEYCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSByZXF1ZXN0ZWQgUFIgY3VycmVudGx5IGhhcyBjb25mbGljdHMnKTtcbiAgICBjbGVhblVwR2l0U3RhdGUob3JpZ2luYWxCcmFuY2gpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZXhlYyhgZ2l0IGZldGNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG4gICAgaWYgKHJlc3VsdC5jb2RlICE9PSAwKSB7XG4gICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcblxuICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgfVxuICAvLyBFbmQgdGhlIHByb2dyZXNzIGJhciBhcyBhbGwgUFJzIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgY29uc29sZS5pbmZvKGBcXG5SZXN1bHQ6YCk7XG5cbiAgY2xlYW5VcEdpdFN0YXRlKG9yaWdpbmFsQnJhbmNoKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLmluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBjb25zb2xlLmVycm9yKGAke2NvbmZsaWN0cy5sZW5ndGh9IFBSKHMpIHdoaWNoIGNvbmZsaWN0KHMpIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnZXM6YCk7XG4gIGZvciAoY29uc3QgcHIgb2YgY29uZmxpY3RzKSB7XG4gICAgY29uc29sZS5lcnJvcihgICAtICR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgcHJvdmlkZWQgYnJhbmNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZShicmFuY2g6IHN0cmluZykge1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICBleGVjKGBnaXQgY2hlY2tvdXQgJHticmFuY2h9YCk7XG4gIC8vIERlbGV0ZSB0aGUgZ2VuZXJhdGVkIGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGJyYW5jaCAtRCAke3RlbXBXb3JraW5nQnJhbmNofWApO1xufVxuIl19