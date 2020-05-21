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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxrRUFBMEQ7SUFDMUQsNERBQWtFO0lBQ2xFLGtFQUFpRDtJQUNqRCxvRUFBeUM7SUFHekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMzQixTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07S0FDM0IsQ0FBQztJQUtGLG1GQUFtRjtJQUNuRixTQUFTLFNBQVMsQ0FBQyxFQUFrQjtRQUNuQyw2Q0FBVyxFQUFFLEtBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUU7SUFDaEUsQ0FBQztJQUtELDZFQUE2RTtJQUM3RSxJQUFNLGlCQUFpQixHQUFHLDhCQUE4QixDQUFDO0lBRXpE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OzZCQUNoRDs7Ozs7Ozs7O3dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pCO0lBekZELDhEQXlGQztJQUVELDZDQUE2QztJQUM3QyxTQUFnQixlQUFlLENBQUMsTUFBYztRQUM1QyxtREFBbUQ7UUFDbkQsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDM0IsaUVBQWlFO1FBQ2pFLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pCLDBEQUEwRDtRQUMxRCxjQUFJLENBQUMsa0JBQWdCLE1BQVEsQ0FBQyxDQUFDO1FBQy9CLCtCQUErQjtRQUMvQixjQUFJLENBQUMsbUJBQWlCLGlCQUFtQixDQUFDLENBQUM7SUFDN0MsQ0FBQztJQVRELDBDQVNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtnZXRDdXJyZW50QnJhbmNoLCBoYXNMb2NhbENoYW5nZXN9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2dldFBlbmRpbmdQcnN9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG5cbi8qIEdyYXBoUUwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgZWFjaCBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgdXBkYXRlZEF0OiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBudW1iZXI6IGdyYXBoUUxUeXBlcy5udW1iZXIsXG4gIG1lcmdlYWJsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG59O1xuXG4vKiBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgR3JhcGhRTCBxdWVyeSAqL1xudHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cbi8qKiBDb252ZXJ0IHJhdyBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgdG8gdXNhYmxlIFB1bGwgUmVxdWVzdCBvYmplY3QuICovXG5mdW5jdGlvbiBwcm9jZXNzUHIocHI6IFJhd1B1bGxSZXF1ZXN0KSB7XG4gIHJldHVybiB7Li4ucHIsIHVwZGF0ZWRBdDogKG5ldyBEYXRlKHByLnVwZGF0ZWRBdCkpLmdldFRpbWUoKX07XG59XG5cbi8qIFB1bGwgUmVxdWVzdCBvYmplY3QgYWZ0ZXIgcHJvY2Vzc2luZywgZGVyaXZlZCBmcm9tIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgcHJvY2Vzc1ByIGZ1bmN0aW9uLiAqL1xudHlwZSBQdWxsUmVxdWVzdCA9IFJldHVyblR5cGU8dHlwZW9mIHByb2Nlc3NQcj47XG5cbi8qKiBOYW1lIG9mIGEgdGVtcG9yYXJ5IGxvY2FsIGJyYW5jaCB0aGF0IGlzIHVzZWQgZm9yIGNoZWNraW5nIGNvbmZsaWN0cy4gKiovXG5jb25zdCB0ZW1wV29ya2luZ0JyYW5jaCA9ICdfX05nRGV2UmVwb0Jhc2VBZnRlckNoYW5nZV9fJztcblxuLyoqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgUFIgd2lsbCBjYXVzZSBuZXcgY29uZmxpY3RzIGluIG90aGVyIHBlbmRpbmcgUFJzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIoXG4gICAgbmV3UHJOdW1iZXI6IG51bWJlciwgdXBkYXRlZEFmdGVyOiBudW1iZXIsIGNvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCkpIHtcbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBsb2NhbCBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgc3RhdGUsIHRoZVxuICAvLyBjaGVjayBjYW5ub3QgcnVuIGFzIGl0IG5lZWRzIHRvIG1vdmUgYmV0d2VlbiBicmFuY2hlcy5cbiAgaWYgKGhhc0xvY2FsQ2hhbmdlcygpKSB7XG4gICAgY29uc29sZS5lcnJvcignQ2Fubm90IHJ1biB3aXRoIGxvY2FsIGNoYW5nZXMuIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFRoZSBhY3RpdmUgZ2l0aHViIGJyYW5jaCB3aGVuIHRoZSBydW4gYmVnYW4uICovXG4gIGNvbnN0IG9yaWdpbmFsQnJhbmNoID0gZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAvKiBQcm9ncmVzcyBiYXIgdG8gaW5kaWNhdGUgcHJvZ3Jlc3MuICovXG4gIGNvbnN0IHByb2dyZXNzQmFyID0gbmV3IEJhcih7Zm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfWB9KTtcbiAgLyogUFJzIHdoaWNoIHdlcmUgZm91bmQgdG8gYmUgY29uZmxpY3RpbmcuICovXG4gIGNvbnN0IGNvbmZsaWN0czogQXJyYXk8UHVsbFJlcXVlc3Q+ID0gW107XG5cbiAgY29uc29sZS5pbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGNvbmZpZy5naXRodWIpKS5tYXAocHJvY2Vzc1ByKTtcbiAgLyoqIFRoZSBQUiB3aGljaCBpcyBiZWluZyBjaGVja2VkIGFnYWluc3QuICovXG4gIGNvbnN0IHJlcXVlc3RlZFByID0gYWxsUGVuZGluZ1BScy5maW5kKHByID0+IHByLm51bWJlciA9PT0gbmV3UHJOdW1iZXIpO1xuICBpZiAocmVxdWVzdGVkUHIgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBjb25zb2xlLmVycm9yKGB0aGUgUFIgbnVtYmVyIGlzIGNvcnJlY3QgYW5kIGlzIGFuIG9wZW4gUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBwZW5kaW5nUHJzID0gYWxsUGVuZGluZ1BScy5maWx0ZXIocHIgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8vIFBScyBiZWluZyBtZXJnZWQgaW50byB0aGUgc2FtZSB0YXJnZXQgYnJhbmNoIGFzIHRoZSByZXF1ZXN0ZWQgUFJcbiAgICAgICAgcHIuYmFzZVJlZi5uYW1lID09PSByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWUgJiZcbiAgICAgICAgLy8gUFJzIHdoaWNoIGVpdGhlciBoYXZlIG5vdCBiZWVuIHByb2Nlc3NlZCBvciBhcmUgZGV0ZXJtaW5lZCBhcyBtZXJnYWJsZSBieSBHaXRodWJcbiAgICAgICAgcHIubWVyZ2VhYmxlICE9PSAnQ09ORkxJQ1RJTkcnICYmXG4gICAgICAgIC8vIFBScyB1cGRhdGVkIGFmdGVyIHRoZSBwcm92aWRlZCBkYXRlXG4gICAgICAgIHByLnVwZGF0ZWRBdCA+PSB1cGRhdGVkQWZ0ZXIpO1xuICB9KTtcbiAgY29uc29sZS5pbmZvKGBSZXRyaWV2ZWQgJHthbGxQZW5kaW5nUFJzLmxlbmd0aH0gdG90YWwgcGVuZGluZyBQUnNgKTtcbiAgY29uc29sZS5pbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWV9YCk7XG4gIGV4ZWMoYGdpdCBjaGVja291dCAtQiAke3RlbXBXb3JraW5nQnJhbmNofSBGRVRDSF9IRUFEYCk7XG5cbiAgLy8gUmViYXNlIHRoZSBQUiBhZ2FpbnN0IHRoZSBQUnMgdGFyZ2V0IGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWV9YCk7XG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICBjb25zb2xlLmVycm9yKCdUaGUgcmVxdWVzdGVkIFBSIGN1cnJlbnRseSBoYXMgY29uZmxpY3RzJyk7XG4gICAgY2xlYW5VcEdpdFN0YXRlKG9yaWdpbmFsQnJhbmNoKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdQcnMubGVuZ3RoLCAwKTtcblxuICAvLyBDaGVjayBlYWNoIFBSIHRvIGRldGVybWluZSBpZiBpdCBjYW4gbWVyZ2UgY2xlYW5seSBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gIGZvciAoY29uc3QgcHIgb2YgcGVuZGluZ1Bycykge1xuICAgIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgbmV4dCBQUlxuICAgIGV4ZWMoYGdpdCBmZXRjaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cHIuaGVhZFJlZi5uYW1lfWApO1xuICAgIGV4ZWMoYGdpdCBjaGVja291dCAtLWRldGFjaCBGRVRDSF9IRUFEYCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSAke3RlbXBXb3JraW5nQnJhbmNofWApO1xuICAgIGlmIChyZXN1bHQuY29kZSAhPT0gMCkge1xuICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG5cbiAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gIH1cbiAgLy8gRW5kIHRoZSBwcm9ncmVzcyBiYXIgYXMgYWxsIFBScyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gIGNvbnNvbGUuaW5mbyhgXFxuUmVzdWx0OmApO1xuXG4gIGNsZWFuVXBHaXRTdGF0ZShvcmlnaW5hbEJyYW5jaCk7XG5cbiAgLy8gSWYgbm8gY29uZmxpY3RzIGFyZSBmb3VuZCwgZXhpdCBzdWNjZXNzZnVsbHkuXG4gIGlmIChjb25mbGljdHMubGVuZ3RoID09PSAwKSB7XG4gICAgY29uc29sZS5pbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgY29uc29sZS5lcnJvcihgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGNvbnNvbGUuZXJyb3IoYCAgLSAke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogUmVzZXQgZ2l0IGJhY2sgdG8gdGhlIHByb3ZpZGVkIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblVwR2l0U3RhdGUoYnJhbmNoOiBzdHJpbmcpIHtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMgYXJlIGFib3J0ZWQuXG4gIGV4ZWMoYGdpdCByZWJhc2UgLS1hYm9ydGApO1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvIHN0YXRlIGFyZSBjbGVhcmVkLlxuICBleGVjKGBnaXQgcmVzZXQgLS1oYXJkYCk7XG4gIC8vIENoZWNrb3V0IHRoZSBvcmlnaW5hbCBicmFuY2ggZnJvbSBiZWZvcmUgdGhlIHJ1biBiZWdhbi5cbiAgZXhlYyhgZ2l0IGNoZWNrb3V0ICR7YnJhbmNofWApO1xuICAvLyBEZWxldGUgdGhlIGdlbmVyYXRlZCBicmFuY2guXG4gIGV4ZWMoYGdpdCBicmFuY2ggLUQgJHt0ZW1wV29ya2luZ0JyYW5jaH1gKTtcbn1cbiJdfQ==