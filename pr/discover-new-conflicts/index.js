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
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
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
                        git = new git_1.GitClient();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxrRUFBMEQ7SUFDMUQsb0VBQWdEO0lBQ2hELGtFQUEwQztJQUMxQyxrRUFBaUQ7SUFDakQsb0VBQXlDO0lBR3pDLCtEQUErRDtJQUMvRCxJQUFNLFNBQVMsR0FBRztRQUNoQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLE1BQU0sRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDM0IsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0tBQzNCLENBQUM7SUFLRixtRkFBbUY7SUFDbkYsU0FBUyxTQUFTLENBQUMsRUFBa0I7UUFDbkMsNkNBQVcsRUFBRSxLQUFFLFNBQVMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFFO0lBQ2hFLENBQUM7SUFLRCw2RUFBNkU7SUFDN0UsSUFBTSxpQkFBaUIsR0FBRyw4QkFB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Ozt3QkFDRCxlQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pCO0lBNUZELDhEQTRGQztJQUVELHlEQUF5RDtJQUN6RCxTQUFnQixlQUFlLENBQUMsd0JBQWdDO1FBQzlELG1EQUFtRDtRQUNuRCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUMzQixpRUFBaUU7UUFDakUsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDekIsMERBQTBEO1FBQzFELGNBQUksQ0FBQyxrQkFBZ0Isd0JBQTBCLENBQUMsQ0FBQztRQUNqRCwrQkFBK0I7UUFDL0IsY0FBSSxDQUFDLG1CQUFpQixpQkFBbUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFURCwwQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhRTFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaFFMIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihcbiAgICBuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlciwgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KCk7XG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbG9jYWwgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5IHN0YXRlLCB0aGVcbiAgLy8gY2hlY2sgY2Fubm90IHJ1biBhcyBpdCBuZWVkcyB0byBtb3ZlIGJldHdlZW4gYnJhbmNoZXMuXG4gIGlmIChnaXQuaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBlcnJvcignQ2Fubm90IHJ1biB3aXRoIGxvY2FsIGNoYW5nZXMuIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFRoZSBhY3RpdmUgZ2l0aHViIGJyYW5jaCBvciByZXZpc2lvbiBiZWZvcmUgd2UgcGVyZm9ybWVkIGFueSBHaXQgY29tbWFuZHMuICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBQcm9ncmVzcyBiYXIgdG8gaW5kaWNhdGUgcHJvZ3Jlc3MuICovXG4gIGNvbnN0IHByb2dyZXNzQmFyID0gbmV3IEJhcih7Zm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfWB9KTtcbiAgLyogUFJzIHdoaWNoIHdlcmUgZm91bmQgdG8gYmUgY29uZmxpY3RpbmcuICovXG4gIGNvbnN0IGNvbmZsaWN0czogQXJyYXk8UHVsbFJlcXVlc3Q+ID0gW107XG5cbiAgaW5mbyhgUmVxdWVzdGluZyBwZW5kaW5nIFBScyBmcm9tIEdpdGh1YmApO1xuICAvKiogTGlzdCBvZiBQUnMgZnJvbSBnaXRodWIgY3VycmVudGx5IGtub3duIGFzIG1lcmdhYmxlLiAqL1xuICBjb25zdCBhbGxQZW5kaW5nUFJzID0gKGF3YWl0IGdldFBlbmRpbmdQcnMoUFJfU0NIRU1BLCBnaXQpKS5tYXAocHJvY2Vzc1ByKTtcbiAgLyoqIFRoZSBQUiB3aGljaCBpcyBiZWluZyBjaGVja2VkIGFnYWluc3QuICovXG4gIGNvbnN0IHJlcXVlc3RlZFByID0gYWxsUGVuZGluZ1BScy5maW5kKHByID0+IHByLm51bWJlciA9PT0gbmV3UHJOdW1iZXIpO1xuICBpZiAocmVxdWVzdGVkUHIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9yKFxuICAgICAgICBgVGhlIHJlcXVlc3QgUFIsICMke25ld1ByTnVtYmVyfSB3YXMgbm90IGZvdW5kIGFzIGEgcGVuZGluZyBQUiBvbiBnaXRodWIsIHBsZWFzZSBjb25maXJtYCk7XG4gICAgZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcihwciA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgICBwci5iYXNlUmVmLm5hbWUgPT09IHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZSAmJlxuICAgICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgICAgLy8gUFJzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRhdGVcbiAgICAgICAgcHIudXBkYXRlZEF0ID49IHVwZGF0ZWRBZnRlcik7XG4gIH0pO1xuICBpbmZvKGBSZXRyaWV2ZWQgJHthbGxQZW5kaW5nUFJzLmxlbmd0aH0gdG90YWwgcGVuZGluZyBQUnNgKTtcbiAgaW5mbyhgQ2hlY2tpbmcgJHtwZW5kaW5nUHJzLmxlbmd0aH0gUFJzIGZvciBjb25mbGljdHMgYWZ0ZXIgYSBtZXJnZSBvZiAjJHtuZXdQck51bWJlcn1gKTtcblxuICAvLyBGZXRjaCBhbmQgY2hlY2tvdXQgdGhlIFBSIGJlaW5nIGNoZWNrZWQuXG4gIGV4ZWMoYGdpdCBmZXRjaCAke3JlcXVlc3RlZFByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5uYW1lfWApO1xuICBleGVjKGBnaXQgY2hlY2tvdXQgLUIgJHt0ZW1wV29ya2luZ0JyYW5jaH0gRkVUQ0hfSEVBRGApO1xuXG4gIC8vIFJlYmFzZSB0aGUgUFIgYWdhaW5zdCB0aGUgUFJzIHRhcmdldCBicmFuY2guXG4gIGV4ZWMoYGdpdCBmZXRjaCAke3JlcXVlc3RlZFByLmJhc2VSZWYucmVwb3NpdG9yeS51cmx9ICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lfWApO1xuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlIEZFVENIX0hFQURgKTtcbiAgaWYgKHJlc3VsdC5jb2RlKSB7XG4gICAgZXJyb3IoJ1RoZSByZXF1ZXN0ZWQgUFIgY3VycmVudGx5IGhhcyBjb25mbGljdHMnKTtcbiAgICBjbGVhblVwR2l0U3RhdGUocHJldmlvdXNCcmFuY2hPclJldmlzaW9uKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdQcnMubGVuZ3RoLCAwKTtcblxuICAvLyBDaGVjayBlYWNoIFBSIHRvIGRldGVybWluZSBpZiBpdCBjYW4gbWVyZ2UgY2xlYW5seSBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gIGZvciAoY29uc3QgcHIgb2YgcGVuZGluZ1Bycykge1xuICAgIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgbmV4dCBQUlxuICAgIGV4ZWMoYGdpdCBmZXRjaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cHIuaGVhZFJlZi5uYW1lfWApO1xuICAgIGV4ZWMoYGdpdCBjaGVja291dCAtLWRldGFjaCBGRVRDSF9IRUFEYCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSAke3RlbXBXb3JraW5nQnJhbmNofWApO1xuICAgIGlmIChyZXN1bHQuY29kZSAhPT0gMCkge1xuICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG5cbiAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gIH1cbiAgLy8gRW5kIHRoZSBwcm9ncmVzcyBiYXIgYXMgYWxsIFBScyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gIGluZm8oKTtcbiAgaW5mbyhgUmVzdWx0OmApO1xuXG4gIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24pO1xuXG4gIC8vIElmIG5vIGNvbmZsaWN0cyBhcmUgZm91bmQsIGV4aXQgc3VjY2Vzc2Z1bGx5LlxuICBpZiAoY29uZmxpY3RzLmxlbmd0aCA9PT0gMCkge1xuICAgIGluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBlcnJvci5ncm91cChgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGVycm9yKGAgIC0gIyR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBlcnJvci5ncm91cEVuZCgpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgcHJvdmlkZWQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb246IHN0cmluZykge1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICBleGVjKGBnaXQgY2hlY2tvdXQgJHtwcmV2aW91c0JyYW5jaE9yUmV2aXNpb259YCk7XG4gIC8vIERlbGV0ZSB0aGUgZ2VuZXJhdGVkIGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGJyYW5jaCAtRCAke3RlbXBXb3JraW5nQnJhbmNofWApO1xufVxuIl19