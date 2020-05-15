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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlzY292ZXItbmV3LWNvbmZsaWN0cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9kaXNjb3Zlci1uZXctY29uZmxpY3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyxxREFBdUQ7SUFFdkQsa0VBQXVEO0lBQ3ZELDREQUErRDtJQUMvRCxrRUFBOEM7SUFDOUMsb0VBQXNDO0lBR3RDLCtEQUErRDtJQUMvRCxJQUFNLFNBQVMsR0FBRztRQUNoQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLE1BQU0sRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDM0IsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUM5QixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0tBQzNCLENBQUM7SUFLRixtRkFBbUY7SUFDbkYsU0FBUyxTQUFTLENBQUMsRUFBa0I7UUFDbkMsNkNBQVcsRUFBRSxLQUFFLFNBQVMsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFFO0lBQ2hFLENBQUM7SUFLRCw2RUFBNkU7SUFDN0UsSUFBTSxpQkFBaUIsR0FBRyw4QkFBOEIsQ0FB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QUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBTyxFQUFFLENBQUMsTUFBTSxVQUFLLEVBQUUsQ0FBQyxLQUFPLENBQUMsQ0FBQzs2QkFDaEQ7Ozs7Ozs7Ozt3QkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQTNGRCw4REEyRkM7SUFFRCw2Q0FBNkM7SUFDN0MsU0FBZ0IsZUFBZSxDQUFDLE1BQWM7UUFDNUMsbURBQW1EO1FBQ25ELGNBQUksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQzNCLGlFQUFpRTtRQUNqRSxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUN6QiwwREFBMEQ7UUFDMUQsY0FBSSxDQUFDLGtCQUFnQixNQUFRLENBQUMsQ0FBQztRQUMvQiwrQkFBK0I7UUFDL0IsY0FBSSxDQUFDLG1CQUFpQixpQkFBbUIsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFURCwwQ0FTQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXJ9IGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQge3R5cGVzIGFzIGdyYXBoUUxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7Z2V0Q3VycmVudEJyYW5jaCwgaGFzTG9jYWxDaGFuZ2VzfSBmcm9tICcuLi91dGlscy9naXQnO1xuaW1wb3J0IHtnZXRQZW5kaW5nUHJzfSBmcm9tICcuLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuLi91dGlscy9zaGVsbGpzJztcblxuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIHVwZGF0ZWRBdDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbnVtYmVyOiBncmFwaFFMVHlwZXMubnVtYmVyLFxuICBtZXJnZWFibGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxufTtcblxuLyogUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIEdyYXBoUUwgcXVlcnkgKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogQ29udmVydCByYXcgUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIHRvIHVzYWJsZSBQdWxsIFJlcXVlc3Qgb2JqZWN0LiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1ByKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICByZXR1cm4gey4uLnByLCB1cGRhdGVkQXQ6IChuZXcgRGF0ZShwci51cGRhdGVkQXQpKS5nZXRUaW1lKCl9O1xufVxuXG4vKiBQdWxsIFJlcXVlc3Qgb2JqZWN0IGFmdGVyIHByb2Nlc3NpbmcsIGRlcml2ZWQgZnJvbSB0aGUgcmV0dXJuIHR5cGUgb2YgdGhlIHByb2Nlc3NQciBmdW5jdGlvbi4gKi9cbnR5cGUgUHVsbFJlcXVlc3QgPSBSZXR1cm5UeXBlPHR5cGVvZiBwcm9jZXNzUHI+O1xuXG4vKiogTmFtZSBvZiBhIHRlbXBvcmFyeSBsb2NhbCBicmFuY2ggdGhhdCBpcyB1c2VkIGZvciBjaGVja2luZyBjb25mbGljdHMuICoqL1xuY29uc3QgdGVtcFdvcmtpbmdCcmFuY2ggPSAnX19OZ0RldlJlcG9CYXNlQWZ0ZXJDaGFuZ2VfXyc7XG5cbi8qKiBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIFBSIHdpbGwgY2F1c2UgbmV3IGNvbmZsaWN0cyBpbiBvdGhlciBwZW5kaW5nIFBScy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKFxuICAgIG5ld1ByTnVtYmVyOiBudW1iZXIsIHVwZGF0ZWRBZnRlcjogbnVtYmVyLCBjb25maWc6IFBpY2s8TmdEZXZDb25maWcsICdnaXRodWInPiA9IGdldENvbmZpZygpKSB7XG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbG9jYWwgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5IHN0YXRlLCB0aGVcbiAgLy8gY2hlY2sgY2Fubm90IHJ1biBhcyBpdCBuZWVkcyB0byBtb3ZlIGJldHdlZW4gYnJhbmNoZXMuXG4gIGlmIChoYXNMb2NhbENoYW5nZXMoKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBydW4gd2l0aCBsb2NhbCBjaGFuZ2VzLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGdpdGh1YiBicmFuY2ggd2hlbiB0aGUgcnVuIGJlZ2FuLiAqL1xuICBjb25zdCBvcmlnaW5hbEJyYW5jaCA9IGdldEN1cnJlbnRCcmFuY2goKTtcbiAgLyogUHJvZ3Jlc3MgYmFyIHRvIGluZGljYXRlIHByb2dyZXNzLiAqL1xuICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH1gfSk7XG4gIC8qIFBScyB3aGljaCB3ZXJlIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nLiAqL1xuICBjb25zdCBjb25mbGljdHM6IEFycmF5PFB1bGxSZXF1ZXN0PiA9IFtdO1xuICAvKiBTdHJpbmcgdmVyc2lvbiBvZiB0aGUgdXBkYXRlZEFmdGVyIHZhbHVlLCBmb3IgbG9nZ2luZy4gKi9cbiAgY29uc3QgdXBkYXRlZEFmdGVyU3RyaW5nID0gbmV3IERhdGUodXBkYXRlZEFmdGVyKS50b0xvY2FsZURhdGVTdHJpbmcoKTtcblxuICBjb25zb2xlLmluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgY29uZmlnLmdpdGh1YikpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYFRoZSByZXF1ZXN0IFBSLCAjJHtuZXdQck51bWJlcn0gd2FzIG5vdCBmb3VuZCBhcyBhIHBlbmRpbmcgUFIgb24gZ2l0aHViLCBwbGVhc2UgY29uZmlybWApO1xuICAgIGNvbnNvbGUuZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcihwciA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgICBwci5iYXNlUmVmLm5hbWUgPT09IHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZSAmJlxuICAgICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgICAgLy8gUFJzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRhdGVcbiAgICAgICAgcHIudXBkYXRlZEF0ID49IHVwZGF0ZWRBZnRlcik7XG4gIH0pO1xuICBjb25zb2xlLmluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBjb25zb2xlLmluZm8oYENoZWNraW5nICR7cGVuZGluZ1Bycy5sZW5ndGh9IFBScyBmb3IgY29uZmxpY3RzIGFmdGVyIGEgbWVyZ2Ugb2YgIyR7bmV3UHJOdW1iZXJ9YCk7XG5cbiAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBQUiBiZWluZyBjaGVja2VkLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmhlYWRSZWYubmFtZX1gKTtcbiAgZXhlYyhgZ2l0IGNoZWNrb3V0IC1CICR7dGVtcFdvcmtpbmdCcmFuY2h9IEZFVENIX0hFQURgKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBleGVjKGBnaXQgZmV0Y2ggJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsfSAke3JlcXVlc3RlZFByLmJhc2VSZWYubmFtZX1gKTtcbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSBGRVRDSF9IRUFEYCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1RoZSByZXF1ZXN0ZWQgUFIgY3VycmVudGx5IGhhcyBjb25mbGljdHMnKTtcbiAgICBjbGVhblVwR2l0U3RhdGUob3JpZ2luYWxCcmFuY2gpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZXhlYyhgZ2l0IGZldGNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG4gICAgaWYgKHJlc3VsdC5jb2RlICE9PSAwKSB7XG4gICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcblxuICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgfVxuICAvLyBFbmQgdGhlIHByb2dyZXNzIGJhciBhcyBhbGwgUFJzIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgY29uc29sZS5pbmZvKGBcXG5SZXN1bHQ6YCk7XG5cbiAgY2xlYW5VcEdpdFN0YXRlKG9yaWdpbmFsQnJhbmNoKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBjb25zb2xlLmluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBjb25zb2xlLmVycm9yKGAke2NvbmZsaWN0cy5sZW5ndGh9IFBSKHMpIHdoaWNoIGNvbmZsaWN0KHMpIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnZXM6YCk7XG4gIGZvciAoY29uc3QgcHIgb2YgY29uZmxpY3RzKSB7XG4gICAgY29uc29sZS5lcnJvcihgICAtICR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgcHJvdmlkZWQgYnJhbmNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZShicmFuY2g6IHN0cmluZykge1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICBleGVjKGBnaXQgY2hlY2tvdXQgJHticmFuY2h9YCk7XG4gIC8vIERlbGV0ZSB0aGUgZ2VuZXJhdGVkIGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGJyYW5jaCAtRCAke3RlbXBXb3JraW5nQnJhbmNofWApO1xufVxuIl19