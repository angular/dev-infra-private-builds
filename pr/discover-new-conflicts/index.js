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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxrRUFBMEQ7SUFDMUQsNERBQWtFO0lBQ2xFLGtFQUFpRDtJQUNqRCxvRUFBeUM7SUFHekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMzQixTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07S0FDM0IsQ0FBQztJQUtGLG1GQUFtRjtJQUNuRixTQUFTLFNBQVMsQ0FBQyxFQUFrQjtRQUNuQyw2Q0FBVyxFQUFFLEtBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUU7SUFDaEUsQ0FBQztJQUtELDZFQUE2RTtJQUM3RSxJQUFNLGlCQUFpQixHQUFHLDhCQUE4QixDQUFDO0lBRXpE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OzZCQUNoRDs7Ozs7Ozs7O3dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pCO0lBekZELDhEQXlGQztJQUVELDZDQUE2QztJQUM3QyxTQUFnQixlQUFlLENBQUMsTUFBYztRQUM1QyxtREFBbUQ7UUFDbkQsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDM0IsaUVBQWlFO1FBQ2pFLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pCLDBEQUEwRDtRQUMxRCxjQUFJLENBQUMsa0JBQWdCLE1BQVEsQ0FBQyxDQUFDO1FBQy9CLCtCQUErQjtRQUMvQixjQUFJLENBQUMsbUJBQWlCLGlCQUFtQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQVRELDBDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2dldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2dldEN1cnJlbnRCcmFuY2gsIGhhc0xvY2FsQ2hhbmdlc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaFFMIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihcbiAgICBuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlciwgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIHdoZW4gdGhlIHJ1biBiZWdhbi4gKi9cbiAgY29uc3Qgb3JpZ2luYWxCcmFuY2ggPSBnZXRDdXJyZW50QnJhbmNoKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBjb25zb2xlLmluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgY29uZmlnLmdpdGh1YikpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYFRoZSByZXF1ZXN0IFBSLCAjJHtuZXdQck51bWJlcn0gd2FzIG5vdCBmb3VuZCBhcyBhIHBlbmRpbmcgUFIgb24gZ2l0aHViLCBwbGVhc2UgY29uZmlybWApO1xuICAgIGNvbnNvbGUuZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcihwciA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgICBwci5iYXNlUmVmLm5hbWUgPT09IHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZSAmJlxuICAgICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgICAgLy8gUFJzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRhdGVcbiAgICAgICAgcHIudXBkYXRlZEF0ID49IHVwZGF0ZWRBZnRlcik7XG4gIH0pO1xuICBjb25zb2xlLmluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBjb25zb2xlLmluZm8oYENoZWNraW5nICR7cGVuZGluZ1Bycy5sZW5ndGh9IFBScyBmb3IgY29uZmxpY3RzIGFmdGVyIGEgbWVyZ2Ugb2YgIyR7bmV3UHJOdW1iZXJ9YCk7XG5cbiAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBQUiBiZWluZyBjaGVja2VkLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmhlYWRSZWYubmFtZX1gKTtcbiAgZXhlYyhgZ2l0IGNoZWNrb3V0IC1CICR7dGVtcFdvcmtpbmdCcmFuY2h9IEZFVENIX0hFQURgKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmJhc2VSZWYubmFtZX1gKTtcbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSBGRVRDSF9IRUFEYCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSByZXF1ZXN0ZWQgUFIgY3VycmVudGx5IGhhcyBjb25mbGljdHMnKTtcbiAgICBjbGVhblVwR2l0U3RhdGUob3JpZ2luYWxCcmFuY2gpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZXhlYyhgZ2l0IGZldGNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG4gICAgaWYgKHJlc3VsdC5jb2RlICE9PSAwKSB7XG4gICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcblxuICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgfVxuICAvLyBFbmQgdGhlIHByb2dyZXNzIGJhciBhcyBhbGwgUFJzIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgY29uc29sZS5pbmZvKGBcXG5SZXN1bHQ6YCk7XG5cbiAgY2xlYW5VcEdpdFN0YXRlKG9yaWdpbmFsQnJhbmNoKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLmluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBjb25zb2xlLmVycm9yKGAke2NvbmZsaWN0cy5sZW5ndGh9IFBSKHMpIHdoaWNoIGNvbmZsaWN0KHMpIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnZXM6YCk7XG4gIGZvciAoY29uc3QgcHIgb2YgY29uZmxpY3RzKSB7XG4gICAgY29uc29sZS5lcnJvcihgICAtICR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgcHJvdmlkZWQgYnJhbmNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZShicmFuY2g6IHN0cmluZykge1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICBleGVjKGBnaXQgY2hlY2tvdXQgJHticmFuY2h9YCk7XG4gIC8vIERlbGV0ZSB0aGUgZ2VuZXJhdGVkIGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGJyYW5jaCAtRCAke3RlbXBXb3JraW5nQnJhbmNofWApO1xufVxuIl19