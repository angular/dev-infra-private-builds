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
        define("@angular/dev-infra-private/pr/discover-new-conflicts", ["require", "exports", "tslib", "cli-progress", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanUpGitState = exports.discoverNewConflictsForPr = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /* Graphql schema for the response body for each pending PR. */
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
    function discoverNewConflictsForPr(newPrNumber, updatedAfter) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git, previousBranchOrRevision, progressBar, conflicts, allPendingPRs, requestedPr, pendingPrs, result, pendingPrs_1, pendingPrs_1_1, pr, result_1, conflicts_1, conflicts_1_1, pr;
            var e_1, _a, e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        git = index_1.GitClient.getAuthenticatedInstance();
                        // If there are any local changes in the current repository state, the
                        // check cannot run as it needs to move between branches.
                        if (git.hasUncommittedChanges()) {
                            console_1.error('Cannot run with local changes. Please make sure there are no local changes.');
                            process.exit(1);
                        }
                        previousBranchOrRevision = git.getCurrentBranchOrRevision();
                        progressBar = new cli_progress_1.Bar({ format: "[{bar}] ETA: {eta}s | {value}/{total}" });
                        conflicts = [];
                        console_1.info("Requesting pending PRs from Github");
                        return [4 /*yield*/, github_1.getPendingPrs(PR_SCHEMA, git)];
                    case 1:
                        allPendingPRs = (_c.sent()).map(processPr);
                        requestedPr = allPendingPRs.find(function (pr) { return pr.number === newPrNumber; });
                        if (requestedPr === undefined) {
                            console_1.error("The request PR, #" + newPrNumber + " was not found as a pending PR on github, please confirm");
                            console_1.error("the PR number is correct and is an open PR");
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
                        console_1.info("Retrieved " + allPendingPRs.length + " total pending PRs");
                        console_1.info("Checking " + pendingPrs.length + " PRs for conflicts after a merge of #" + newPrNumber);
                        // Fetch and checkout the PR being checked.
                        shelljs_1.exec("git fetch " + requestedPr.headRef.repository.url + " " + requestedPr.headRef.name);
                        shelljs_1.exec("git checkout -B " + tempWorkingBranch + " FETCH_HEAD");
                        // Rebase the PR against the PRs target branch.
                        shelljs_1.exec("git fetch " + requestedPr.baseRef.repository.url + " " + requestedPr.baseRef.name);
                        result = shelljs_1.exec("git rebase FETCH_HEAD");
                        if (result.code) {
                            console_1.error('The requested PR currently has conflicts');
                            cleanUpGitState(previousBranchOrRevision);
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
                        console_1.info();
                        console_1.info("Result:");
                        cleanUpGitState(previousBranchOrRevision);
                        // If no conflicts are found, exit successfully.
                        if (conflicts.length === 0) {
                            console_1.info("No new conflicting PRs found after #" + newPrNumber + " merging");
                            process.exit(0);
                        }
                        // Inform about discovered conflicts, exit with failure.
                        console_1.error.group(conflicts.length + " PR(s) which conflict(s) after #" + newPrNumber + " merges:");
                        try {
                            for (conflicts_1 = tslib_1.__values(conflicts), conflicts_1_1 = conflicts_1.next(); !conflicts_1_1.done; conflicts_1_1 = conflicts_1.next()) {
                                pr = conflicts_1_1.value;
                                console_1.error("  - #" + pr.number + ": " + pr.title);
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (conflicts_1_1 && !conflicts_1_1.done && (_b = conflicts_1.return)) _b.call(conflicts_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        console_1.error.groupEnd();
                        process.exit(1);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.discoverNewConflictsForPr = discoverNewConflictsForPr;
    /** Reset git back to the provided branch or revision. */
    function cleanUpGitState(previousBranchOrRevision) {
        // Ensure that any outstanding rebases are aborted.
        shelljs_1.exec("git rebase --abort");
        // Ensure that any changes in the current repo state are cleared.
        shelljs_1.exec("git reset --hard");
        // Checkout the original branch from before the run began.
        shelljs_1.exec("git checkout " + previousBranchOrRevision);
        // Delete the generated branch.
        shelljs_1.exec("git branch -D " + tempWorkingBranch);
    }
    exports.cleanUpGitState = cleanUpGitState;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxvRUFBZ0Q7SUFDaEQsb0VBQWdEO0lBQ2hELGtFQUFpRDtJQUNqRCxvRUFBeUM7SUFHekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMzQixTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07S0FDM0IsQ0FBQztJQUtGLG1GQUFtRjtJQUNuRixTQUFTLFNBQVMsQ0FBQyxFQUFrQjtRQUNuQyw2Q0FBVyxFQUFFLEtBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUU7SUFDaEUsQ0FBQztJQUtELDZFQUE2RTtJQUM3RSxJQUFNLGlCQUFpQixHQUFHLDhCQUE4QixDQUFDO0lBRXpE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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUE1RkQsOERBNEZDO0lBRUQseURBQXlEO0lBQ3pELFNBQWdCLGVBQWUsQ0FBQyx3QkFBZ0M7UUFDOUQsbURBQW1EO1FBQ25ELGNBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNCLGlFQUFpRTtRQUNqRSxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6QiwwREFBMEQ7UUFDMUQsY0FBSSxDQUFDLGtCQUFnQix3QkFBMEIsQ0FBQyxDQUFDO1FBQ2pELCtCQUErQjtRQUMvQixjQUFJLENBQUMsbUJBQWlCLGlCQUFtQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQVRELDBDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRQZW5kaW5nUHJzfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuLi8uLi91dGlscy9zaGVsbGpzJztcblxuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIHVwZGF0ZWRBdDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICBtZXJnZWFibGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxufTtcblxuLyogUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIEdyYXBocWwgcXVlcnkgKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogQ29udmVydCByYXcgUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIHRvIHVzYWJsZSBQdWxsIFJlcXVlc3Qgb2JqZWN0LiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1ByKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICByZXR1cm4gey4uLnByLCB1cGRhdGVkQXQ6IChuZXcgRGF0ZShwci51cGRhdGVkQXQpKS5nZXRUaW1lKCl9O1xufVxuXG4vKiBQdWxsIFJlcXVlc3Qgb2JqZWN0IGFmdGVyIHByb2Nlc3NpbmcsIGRlcml2ZWQgZnJvbSB0aGUgcmV0dXJuIHR5cGUgb2YgdGhlIHByb2Nlc3NQciBmdW5jdGlvbi4gKi9cbnR5cGUgUHVsbFJlcXVlc3QgPSBSZXR1cm5UeXBlPHR5cGVvZiBwcm9jZXNzUHI+O1xuXG4vKiogTmFtZSBvZiBhIHRlbXBvcmFyeSBsb2NhbCBicmFuY2ggdGhhdCBpcyB1c2VkIGZvciBjaGVja2luZyBjb25mbGljdHMuICoqL1xuY29uc3QgdGVtcFdvcmtpbmdCcmFuY2ggPSAnX19OZ0RldlJlcG9CYXNlQWZ0ZXJDaGFuZ2VfXyc7XG5cbi8qKiBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIFBSIHdpbGwgY2F1c2UgbmV3IGNvbmZsaWN0cyBpbiBvdGhlciBwZW5kaW5nIFBScy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKG5ld1ByTnVtYmVyOiBudW1iZXIsIHVwZGF0ZWRBZnRlcjogbnVtYmVyKSB7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKTtcbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBsb2NhbCBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgc3RhdGUsIHRoZVxuICAvLyBjaGVjayBjYW5ub3QgcnVuIGFzIGl0IG5lZWRzIHRvIG1vdmUgYmV0d2VlbiBicmFuY2hlcy5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIG9yIHJldmlzaW9uIGJlZm9yZSB3ZSBwZXJmb3JtZWQgYW55IEdpdCBjb21tYW5kcy4gKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBpbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGdpdCkpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBlcnJvcihgdGhlIFBSIG51bWJlciBpcyBjb3JyZWN0IGFuZCBpcyBhbiBvcGVuIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcGVuZGluZ1BycyA9IGFsbFBlbmRpbmdQUnMuZmlsdGVyKHByID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvLyBQUnMgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHNhbWUgdGFyZ2V0IGJyYW5jaCBhcyB0aGUgcmVxdWVzdGVkIFBSXG4gICAgICAgIHByLmJhc2VSZWYubmFtZSA9PT0gcmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lICYmXG4gICAgICAgIC8vIFBScyB3aGljaCBlaXRoZXIgaGF2ZSBub3QgYmVlbiBwcm9jZXNzZWQgb3IgYXJlIGRldGVybWluZWQgYXMgbWVyZ2FibGUgYnkgR2l0aHViXG4gICAgICAgIHByLm1lcmdlYWJsZSAhPT0gJ0NPTkZMSUNUSU5HJyAmJlxuICAgICAgICAvLyBQUnMgdXBkYXRlZCBhZnRlciB0aGUgcHJvdmlkZWQgZGF0ZVxuICAgICAgICBwci51cGRhdGVkQXQgPj0gdXBkYXRlZEFmdGVyKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWV9YCk7XG4gIGV4ZWMoYGdpdCBjaGVja291dCAtQiAke3RlbXBXb3JraW5nQnJhbmNofSBGRVRDSF9IRUFEYCk7XG5cbiAgLy8gUmViYXNlIHRoZSBQUiBhZ2FpbnN0IHRoZSBQUnMgdGFyZ2V0IGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWV9YCk7XG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24pO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZXhlYyhgZ2l0IGZldGNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG4gICAgaWYgKHJlc3VsdC5jb2RlICE9PSAwKSB7XG4gICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcblxuICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgfVxuICAvLyBFbmQgdGhlIHByb2dyZXNzIGJhciBhcyBhbGwgUFJzIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgaW5mbygpO1xuICBpbmZvKGBSZXN1bHQ6YCk7XG5cbiAgY2xlYW5VcEdpdFN0YXRlKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbik7XG5cbiAgLy8gSWYgbm8gY29uZmxpY3RzIGFyZSBmb3VuZCwgZXhpdCBzdWNjZXNzZnVsbHkuXG4gIGlmIChjb25mbGljdHMubGVuZ3RoID09PSAwKSB7XG4gICAgaW5mbyhgTm8gbmV3IGNvbmZsaWN0aW5nIFBScyBmb3VuZCBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2luZ2ApO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIEluZm9ybSBhYm91dCBkaXNjb3ZlcmVkIGNvbmZsaWN0cywgZXhpdCB3aXRoIGZhaWx1cmUuXG4gIGVycm9yLmdyb3VwKGAke2NvbmZsaWN0cy5sZW5ndGh9IFBSKHMpIHdoaWNoIGNvbmZsaWN0KHMpIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnZXM6YCk7XG4gIGZvciAoY29uc3QgcHIgb2YgY29uZmxpY3RzKSB7XG4gICAgZXJyb3IoYCAgLSAjJHtwci5udW1iZXJ9OiAke3ByLnRpdGxlfWApO1xuICB9XG4gIGVycm9yLmdyb3VwRW5kKCk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqIFJlc2V0IGdpdCBiYWNrIHRvIHRoZSBwcm92aWRlZCBicmFuY2ggb3IgcmV2aXNpb24uICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcEdpdFN0YXRlKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nKSB7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzIGFyZSBhYm9ydGVkLlxuICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwbyBzdGF0ZSBhcmUgY2xlYXJlZC5cbiAgZXhlYyhgZ2l0IHJlc2V0IC0taGFyZGApO1xuICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gIGV4ZWMoYGdpdCBjaGVja291dCAke3ByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbn1gKTtcbiAgLy8gRGVsZXRlIHRoZSBnZW5lcmF0ZWQgYnJhbmNoLlxuICBleGVjKGBnaXQgYnJhbmNoIC1EICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG59XG4iXX0=