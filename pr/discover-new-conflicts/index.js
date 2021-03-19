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
        define("@angular/dev-infra-private/pr/discover-new-conflicts", ["require", "exports", "tslib", "cli-progress", "typed-graphqlify", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanUpGitState = exports.discoverNewConflictsForPr = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
            var git, previousBranchOrRevision, progressBar, conflicts, allPendingPRs, requestedPr, pendingPrs, result, pendingPrs_1, pendingPrs_1_1, pr, result_1, conflicts_1, conflicts_1_1, pr;
            var e_1, _a, e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        git = new index_1.GitClient();
                        // If there are any local changes in the current repository state, the
                        // check cannot run as it needs to move between branches.
                        if (git.hasLocalChanges()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxrRUFBMEQ7SUFDMUQsb0VBQWdEO0lBQ2hELG9FQUFnRDtJQUNoRCxrRUFBaUQ7SUFDakQsb0VBQXlDO0lBR3pDLCtEQUErRDtJQUMvRCxJQUFNLFNBQVMsR0FBRztRQUNoQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLE1BQU0sRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDM0IsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0tBQzNCLENBQUM7SUFLRixtRkFBbUY7SUFDbkYsU0FBUyxTQUFTLENBQUMsRUFBa0I7UUFDbkMsNkNBQVcsRUFBRSxLQUFFLFNBQVMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFFO0lBQ2hFLENBQUM7SUFLRCw2RUFBNkU7SUFDN0UsSUFBTSxpQkFBaUIsR0FBRyw4QkFB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Ozs7d0JBQ0QsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQTVGRCw4REE0RkM7SUFFRCx5REFBeUQ7SUFDekQsU0FBZ0IsZUFBZSxDQUFDLHdCQUFnQztRQUM5RCxtREFBbUQ7UUFDbkQsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDM0IsaUVBQWlFO1FBQ2pFLGNBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pCLDBEQUEwRDtRQUMxRCxjQUFJLENBQUMsa0JBQWdCLHdCQUEwQixDQUFDLENBQUM7UUFDakQsK0JBQStCO1FBQy9CLGNBQUksQ0FBQyxtQkFBaUIsaUJBQW1CLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBVEQsMENBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXJ9IGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQge3R5cGVzIGFzIGdyYXBoUUxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2dldFBlbmRpbmdQcnN9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG5cbi8qIEdyYXBoUUwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgZWFjaCBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgdXBkYXRlZEF0OiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBudW1iZXI6IGdyYXBoUUxUeXBlcy5udW1iZXIsXG4gIG1lcmdlYWJsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG59O1xuXG4vKiBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgR3JhcGhRTCBxdWVyeSAqL1xudHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cbi8qKiBDb252ZXJ0IHJhdyBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgdG8gdXNhYmxlIFB1bGwgUmVxdWVzdCBvYmplY3QuICovXG5mdW5jdGlvbiBwcm9jZXNzUHIocHI6IFJhd1B1bGxSZXF1ZXN0KSB7XG4gIHJldHVybiB7Li4ucHIsIHVwZGF0ZWRBdDogKG5ldyBEYXRlKHByLnVwZGF0ZWRBdCkpLmdldFRpbWUoKX07XG59XG5cbi8qIFB1bGwgUmVxdWVzdCBvYmplY3QgYWZ0ZXIgcHJvY2Vzc2luZywgZGVyaXZlZCBmcm9tIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgcHJvY2Vzc1ByIGZ1bmN0aW9uLiAqL1xudHlwZSBQdWxsUmVxdWVzdCA9IFJldHVyblR5cGU8dHlwZW9mIHByb2Nlc3NQcj47XG5cbi8qKiBOYW1lIG9mIGEgdGVtcG9yYXJ5IGxvY2FsIGJyYW5jaCB0aGF0IGlzIHVzZWQgZm9yIGNoZWNraW5nIGNvbmZsaWN0cy4gKiovXG5jb25zdCB0ZW1wV29ya2luZ0JyYW5jaCA9ICdfX05nRGV2UmVwb0Jhc2VBZnRlckNoYW5nZV9fJztcblxuLyoqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgUFIgd2lsbCBjYXVzZSBuZXcgY29uZmxpY3RzIGluIG90aGVyIHBlbmRpbmcgUFJzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIoXG4gICAgbmV3UHJOdW1iZXI6IG51bWJlciwgdXBkYXRlZEFmdGVyOiBudW1iZXIsIGNvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCkpIHtcbiAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudCgpO1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoZ2l0Lmhhc0xvY2FsQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBydW4gd2l0aCBsb2NhbCBjaGFuZ2VzLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGdpdGh1YiBicmFuY2ggb3IgcmV2aXNpb24gYmVmb3JlIHdlIHBlcmZvcm1lZCBhbnkgR2l0IGNvbW1hbmRzLiAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogUHJvZ3Jlc3MgYmFyIHRvIGluZGljYXRlIHByb2dyZXNzLiAqL1xuICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH1gfSk7XG4gIC8qIFBScyB3aGljaCB3ZXJlIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nLiAqL1xuICBjb25zdCBjb25mbGljdHM6IEFycmF5PFB1bGxSZXF1ZXN0PiA9IFtdO1xuXG4gIGluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgZ2l0KSkubWFwKHByb2Nlc3NQcik7XG4gIC8qKiBUaGUgUFIgd2hpY2ggaXMgYmVpbmcgY2hlY2tlZCBhZ2FpbnN0LiAqL1xuICBjb25zdCByZXF1ZXN0ZWRQciA9IGFsbFBlbmRpbmdQUnMuZmluZChwciA9PiBwci5udW1iZXIgPT09IG5ld1ByTnVtYmVyKTtcbiAgaWYgKHJlcXVlc3RlZFByID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYFRoZSByZXF1ZXN0IFBSLCAjJHtuZXdQck51bWJlcn0gd2FzIG5vdCBmb3VuZCBhcyBhIHBlbmRpbmcgUFIgb24gZ2l0aHViLCBwbGVhc2UgY29uZmlybWApO1xuICAgIGVycm9yKGB0aGUgUFIgbnVtYmVyIGlzIGNvcnJlY3QgYW5kIGlzIGFuIG9wZW4gUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBwZW5kaW5nUHJzID0gYWxsUGVuZGluZ1BScy5maWx0ZXIocHIgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8vIFBScyBiZWluZyBtZXJnZWQgaW50byB0aGUgc2FtZSB0YXJnZXQgYnJhbmNoIGFzIHRoZSByZXF1ZXN0ZWQgUFJcbiAgICAgICAgcHIuYmFzZVJlZi5uYW1lID09PSByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWUgJiZcbiAgICAgICAgLy8gUFJzIHdoaWNoIGVpdGhlciBoYXZlIG5vdCBiZWVuIHByb2Nlc3NlZCBvciBhcmUgZGV0ZXJtaW5lZCBhcyBtZXJnYWJsZSBieSBHaXRodWJcbiAgICAgICAgcHIubWVyZ2VhYmxlICE9PSAnQ09ORkxJQ1RJTkcnICYmXG4gICAgICAgIC8vIFBScyB1cGRhdGVkIGFmdGVyIHRoZSBwcm92aWRlZCBkYXRlXG4gICAgICAgIHByLnVwZGF0ZWRBdCA+PSB1cGRhdGVkQWZ0ZXIpO1xuICB9KTtcbiAgaW5mbyhgUmV0cmlldmVkICR7YWxsUGVuZGluZ1BScy5sZW5ndGh9IHRvdGFsIHBlbmRpbmcgUFJzYCk7XG4gIGluZm8oYENoZWNraW5nICR7cGVuZGluZ1Bycy5sZW5ndGh9IFBScyBmb3IgY29uZmxpY3RzIGFmdGVyIGEgbWVyZ2Ugb2YgIyR7bmV3UHJOdW1iZXJ9YCk7XG5cbiAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBQUiBiZWluZyBjaGVja2VkLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmhlYWRSZWYubmFtZX1gKTtcbiAgZXhlYyhgZ2l0IGNoZWNrb3V0IC1CICR7dGVtcFdvcmtpbmdCcmFuY2h9IEZFVENIX0hFQURgKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmJhc2VSZWYubmFtZX1gKTtcbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSBGRVRDSF9IRUFEYCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIGVycm9yKCdUaGUgcmVxdWVzdGVkIFBSIGN1cnJlbnRseSBoYXMgY29uZmxpY3RzJyk7XG4gICAgY2xlYW5VcEdpdFN0YXRlKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbik7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICBwcm9ncmVzc0Jhci5zdGFydChwZW5kaW5nUHJzLmxlbmd0aCwgMCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBQUiB0byBkZXRlcm1pbmUgaWYgaXQgY2FuIG1lcmdlIGNsZWFubHkgaW50byB0aGUgcmVwbyBhZnRlciB0aGUgdGFyZ2V0IFBSLlxuICBmb3IgKGNvbnN0IHByIG9mIHBlbmRpbmdQcnMpIHtcbiAgICAvLyBGZXRjaCBhbmQgY2hlY2tvdXQgdGhlIG5leHQgUFJcbiAgICBleGVjKGBnaXQgZmV0Y2ggJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3ByLmhlYWRSZWYubmFtZX1gKTtcbiAgICBleGVjKGBnaXQgY2hlY2tvdXQgLS1kZXRhY2ggRkVUQ0hfSEVBRGApO1xuICAgIC8vIENoZWNrIGlmIHRoZSBQUiBjbGVhbmx5IHJlYmFzZXMgaW50byB0aGUgcmVwbyBhZnRlciB0aGUgdGFyZ2V0IFBSLlxuICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgJHt0ZW1wV29ya2luZ0JyYW5jaH1gKTtcbiAgICBpZiAocmVzdWx0LmNvZGUgIT09IDApIHtcbiAgICAgIGNvbmZsaWN0cy5wdXNoKHByKTtcbiAgICB9XG4gICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZSBhdHRlbXB0LlxuICAgIGV4ZWMoYGdpdCByZWJhc2UgLS1hYm9ydGApO1xuXG4gICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICB9XG4gIC8vIEVuZCB0aGUgcHJvZ3Jlc3MgYmFyIGFzIGFsbCBQUnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICBpbmZvKCk7XG4gIGluZm8oYFJlc3VsdDpgKTtcblxuICBjbGVhblVwR2l0U3RhdGUocHJldmlvdXNCcmFuY2hPclJldmlzaW9uKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBpbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgZXJyb3IuZ3JvdXAoYCR7Y29uZmxpY3RzLmxlbmd0aH0gUFIocykgd2hpY2ggY29uZmxpY3QocykgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdlczpgKTtcbiAgZm9yIChjb25zdCBwciBvZiBjb25mbGljdHMpIHtcbiAgICBlcnJvcihgICAtICMke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuXG4vKiogUmVzZXQgZ2l0IGJhY2sgdG8gdGhlIHByb3ZpZGVkIGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbGVhblVwR2l0U3RhdGUocHJldmlvdXNCcmFuY2hPclJldmlzaW9uOiBzdHJpbmcpIHtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMgYXJlIGFib3J0ZWQuXG4gIGV4ZWMoYGdpdCByZWJhc2UgLS1hYm9ydGApO1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvIHN0YXRlIGFyZSBjbGVhcmVkLlxuICBleGVjKGBnaXQgcmVzZXQgLS1oYXJkYCk7XG4gIC8vIENoZWNrb3V0IHRoZSBvcmlnaW5hbCBicmFuY2ggZnJvbSBiZWZvcmUgdGhlIHJ1biBiZWdhbi5cbiAgZXhlYyhgZ2l0IGNoZWNrb3V0ICR7cHJldmlvdXNCcmFuY2hPclJldmlzaW9ufWApO1xuICAvLyBEZWxldGUgdGhlIGdlbmVyYXRlZCBicmFuY2guXG4gIGV4ZWMoYGdpdCBicmFuY2ggLUQgJHt0ZW1wV29ya2luZ0JyYW5jaH1gKTtcbn1cbiJdfQ==