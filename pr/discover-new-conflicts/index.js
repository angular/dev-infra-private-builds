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
        define("@angular/dev-infra-private/pr/discover-new-conflicts", ["require", "exports", "tslib", "cli-progress", "typed-graphqlify", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/utils/shelljs"], factory);
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
            var git, originalBranch, progressBar, conflicts, allPendingPRs, requestedPr, pendingPrs, result, pendingPrs_1, pendingPrs_1_1, pr, result_1, conflicts_1, conflicts_1_1, pr;
            var e_1, _a, e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        git = new git_1.GitClient();
                        // If there are any local changes in the current repository state, the
                        // check cannot run as it needs to move between branches.
                        if (git.hasLocalChanges()) {
                            console_1.error('Cannot run with local changes. Please make sure there are no local changes.');
                            process.exit(1);
                        }
                        originalBranch = git.getCurrentBranch();
                        progressBar = new cli_progress_1.Bar({ format: "[{bar}] ETA: {eta}s | {value}/{total}" });
                        conflicts = [];
                        console_1.info("Requesting pending PRs from Github");
                        return [4 /*yield*/, github_1.getPendingPrs(PR_SCHEMA, config.github)];
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
                        console_1.info();
                        console_1.info("Result:");
                        cleanUpGitState(originalBranch);
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
                                console_1.error("  - " + pr.number + ": " + pr.title);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxrRUFBMEQ7SUFDMUQsb0VBQWdEO0lBQ2hELDREQUEwQztJQUMxQyxrRUFBaUQ7SUFDakQsb0VBQXlDO0lBR3pDLCtEQUErRDtJQUMvRCxJQUFNLFNBQVMsR0FBRztRQUNoQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLE1BQU0sRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDM0IsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0tBQzNCLENBQUM7SUFLRixtRkFBbUY7SUFDbkYsU0FBUyxTQUFTLENBQUMsRUFBa0I7UUFDbkMsNkNBQVcsRUFBRSxLQUFFLFNBQVMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFFO0lBQ2hFLENBQUM7SUFLRCw2RUFBNkU7SUFDN0UsSUFBTSxpQkFBaUIsR0FBRyw4QkFB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Ozs7Ozs7d0JBQ0QsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQTVGRCw4REE0RkM7SUFFRCw2Q0FBNkM7SUFDN0MsU0FBZ0IsZUFBZSxDQUFDLE1BQWM7UUFDNUMsbURBQW1EO1FBQ25ELGNBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNCLGlFQUFpRTtRQUNqRSxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6QiwwREFBMEQ7UUFDMUQsY0FBSSxDQUFDLGtCQUFnQixNQUFRLENBQUMsQ0FBQztRQUMvQiwrQkFBK0I7UUFDL0IsY0FBSSxDQUFDLG1CQUFpQixpQkFBbUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFURCwwQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaFFMIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihcbiAgICBuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlciwgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KCk7XG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbG9jYWwgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5IHN0YXRlLCB0aGVcbiAgLy8gY2hlY2sgY2Fubm90IHJ1biBhcyBpdCBuZWVkcyB0byBtb3ZlIGJldHdlZW4gYnJhbmNoZXMuXG4gIGlmIChnaXQuaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBlcnJvcignQ2Fubm90IHJ1biB3aXRoIGxvY2FsIGNoYW5nZXMuIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFRoZSBhY3RpdmUgZ2l0aHViIGJyYW5jaCB3aGVuIHRoZSBydW4gYmVnYW4uICovXG4gIGNvbnN0IG9yaWdpbmFsQnJhbmNoID0gZ2l0LmdldEN1cnJlbnRCcmFuY2goKTtcbiAgLyogUHJvZ3Jlc3MgYmFyIHRvIGluZGljYXRlIHByb2dyZXNzLiAqL1xuICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH1gfSk7XG4gIC8qIFBScyB3aGljaCB3ZXJlIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nLiAqL1xuICBjb25zdCBjb25mbGljdHM6IEFycmF5PFB1bGxSZXF1ZXN0PiA9IFtdO1xuXG4gIGluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgY29uZmlnLmdpdGh1YikpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBlcnJvcihgdGhlIFBSIG51bWJlciBpcyBjb3JyZWN0IGFuZCBpcyBhbiBvcGVuIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcGVuZGluZ1BycyA9IGFsbFBlbmRpbmdQUnMuZmlsdGVyKHByID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvLyBQUnMgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHNhbWUgdGFyZ2V0IGJyYW5jaCBhcyB0aGUgcmVxdWVzdGVkIFBSXG4gICAgICAgIHByLmJhc2VSZWYubmFtZSA9PT0gcmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lICYmXG4gICAgICAgIC8vIFBScyB3aGljaCBlaXRoZXIgaGF2ZSBub3QgYmVlbiBwcm9jZXNzZWQgb3IgYXJlIGRldGVybWluZWQgYXMgbWVyZ2FibGUgYnkgR2l0aHViXG4gICAgICAgIHByLm1lcmdlYWJsZSAhPT0gJ0NPTkZMSUNUSU5HJyAmJlxuICAgICAgICAvLyBQUnMgdXBkYXRlZCBhZnRlciB0aGUgcHJvdmlkZWQgZGF0ZVxuICAgICAgICBwci51cGRhdGVkQXQgPj0gdXBkYXRlZEFmdGVyKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWV9YCk7XG4gIGV4ZWMoYGdpdCBjaGVja291dCAtQiAke3RlbXBXb3JraW5nQnJhbmNofSBGRVRDSF9IRUFEYCk7XG5cbiAgLy8gUmViYXNlIHRoZSBQUiBhZ2FpbnN0IHRoZSBQUnMgdGFyZ2V0IGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWV9YCk7XG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgIGNsZWFuVXBHaXRTdGF0ZShvcmlnaW5hbEJyYW5jaCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICBwcm9ncmVzc0Jhci5zdGFydChwZW5kaW5nUHJzLmxlbmd0aCwgMCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBQUiB0byBkZXRlcm1pbmUgaWYgaXQgY2FuIG1lcmdlIGNsZWFubHkgaW50byB0aGUgcmVwbyBhZnRlciB0aGUgdGFyZ2V0IFBSLlxuICBmb3IgKGNvbnN0IHByIG9mIHBlbmRpbmdQcnMpIHtcbiAgICAvLyBGZXRjaCBhbmQgY2hlY2tvdXQgdGhlIG5leHQgUFJcbiAgICBleGVjKGBnaXQgZmV0Y2ggJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3ByLmhlYWRSZWYubmFtZX1gKTtcbiAgICBleGVjKGBnaXQgY2hlY2tvdXQgLS1kZXRhY2ggRkVUQ0hfSEVBRGApO1xuICAgIC8vIENoZWNrIGlmIHRoZSBQUiBjbGVhbmx5IHJlYmFzZXMgaW50byB0aGUgcmVwbyBhZnRlciB0aGUgdGFyZ2V0IFBSLlxuICAgIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgJHt0ZW1wV29ya2luZ0JyYW5jaH1gKTtcbiAgICBpZiAocmVzdWx0LmNvZGUgIT09IDApIHtcbiAgICAgIGNvbmZsaWN0cy5wdXNoKHByKTtcbiAgICB9XG4gICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZSBhdHRlbXB0LlxuICAgIGV4ZWMoYGdpdCByZWJhc2UgLS1hYm9ydGApO1xuXG4gICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICB9XG4gIC8vIEVuZCB0aGUgcHJvZ3Jlc3MgYmFyIGFzIGFsbCBQUnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICBpbmZvKCk7XG4gIGluZm8oYFJlc3VsdDpgKTtcblxuICBjbGVhblVwR2l0U3RhdGUob3JpZ2luYWxCcmFuY2gpO1xuXG4gIC8vIElmIG5vIGNvbmZsaWN0cyBhcmUgZm91bmQsIGV4aXQgc3VjY2Vzc2Z1bGx5LlxuICBpZiAoY29uZmxpY3RzLmxlbmd0aCA9PT0gMCkge1xuICAgIGluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBlcnJvci5ncm91cChgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGVycm9yKGAgIC0gJHtwci5udW1iZXJ9OiAke3ByLnRpdGxlfWApO1xuICB9XG4gIGVycm9yLmdyb3VwRW5kKCk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqIFJlc2V0IGdpdCBiYWNrIHRvIHRoZSBwcm92aWRlZCBicmFuY2guICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcEdpdFN0YXRlKGJyYW5jaDogc3RyaW5nKSB7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzIGFyZSBhYm9ydGVkLlxuICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwbyBzdGF0ZSBhcmUgY2xlYXJlZC5cbiAgZXhlYyhgZ2l0IHJlc2V0IC0taGFyZGApO1xuICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gIGV4ZWMoYGdpdCBjaGVja291dCAke2JyYW5jaH1gKTtcbiAgLy8gRGVsZXRlIHRoZSBnZW5lcmF0ZWQgYnJhbmNoLlxuICBleGVjKGBnaXQgYnJhbmNoIC1EICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG59XG4iXX0=