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
        define("@angular/dev-infra-private/pr/discover-new-conflicts", ["require", "exports", "tslib", "cli-progress", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/authenticated-git-client", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.discoverNewConflictsForPr = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var github_1 = require("@angular/dev-infra-private/utils/github");
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
            var git, previousBranchOrRevision, progressBar, conflicts, allPendingPRs, requestedPr, pendingPrs, pendingPrs_1, pendingPrs_1_1, pr, conflicts_1, conflicts_1_1, pr;
            var e_1, _a, e_2, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        git = authenticated_git_client_1.AuthenticatedGitClient.get();
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
                        git.run(['fetch', '-q', requestedPr.headRef.repository.url, requestedPr.headRef.name]);
                        git.run(['checkout', '-q', '-B', tempWorkingBranch, 'FETCH_HEAD']);
                        // Rebase the PR against the PRs target branch.
                        git.run(['fetch', '-q', requestedPr.baseRef.repository.url, requestedPr.baseRef.name]);
                        try {
                            git.run(['rebase', 'FETCH_HEAD'], { stdio: 'ignore' });
                        }
                        catch (err) {
                            if (err instanceof git_client_1.GitCommandError) {
                                console_1.error('The requested PR currently has conflicts');
                                git.checkout(previousBranchOrRevision, true);
                                process.exit(1);
                            }
                            throw err;
                        }
                        // Start the progress bar
                        progressBar.start(pendingPrs.length, 0);
                        try {
                            // Check each PR to determine if it can merge cleanly into the repo after the target PR.
                            for (pendingPrs_1 = tslib_1.__values(pendingPrs), pendingPrs_1_1 = pendingPrs_1.next(); !pendingPrs_1_1.done; pendingPrs_1_1 = pendingPrs_1.next()) {
                                pr = pendingPrs_1_1.value;
                                // Fetch and checkout the next PR
                                git.run(['fetch', '-q', pr.headRef.repository.url, pr.headRef.name]);
                                git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
                                // Check if the PR cleanly rebases into the repo after the target PR.
                                try {
                                    git.run(['rebase', tempWorkingBranch], { stdio: 'ignore' });
                                }
                                catch (err) {
                                    if (err instanceof git_client_1.GitCommandError) {
                                        conflicts.push(pr);
                                    }
                                    else {
                                        throw err;
                                    }
                                }
                                // Abort any outstanding rebase attempt.
                                git.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
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
                        git.checkout(previousBranchOrRevision, true);
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsNkNBQWlDO0lBQ2pDLHFEQUF1RDtJQUV2RCxvRUFBZ0Q7SUFDaEQsMEdBQWdGO0lBQ2hGLDhFQUEyRDtJQUMzRCxrRUFBaUQ7SUFHakQsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELFNBQVMsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDOUIsTUFBTSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMzQixTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzlCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07S0FDM0IsQ0FBQztJQUtGLG1GQUFtRjtJQUNuRixTQUFTLFNBQVMsQ0FBQyxFQUFrQjtRQUNuQyw2Q0FBVyxFQUFFLEtBQUUsU0FBUyxFQUFFLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUU7SUFDaEUsQ0FBQztJQUtELDZFQUE2RTtJQUM3RSxJQUFNLGlCQUFpQixHQUFHLDhCQUE4QixDQUFDO0lBRXpE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QUFXLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBQ25CLGNBQUksRUFBRSxDQUFDO3dCQUNQLGNBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzt3QkFFaEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFFN0MsZ0RBQWdEO3dCQUNoRCxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUMxQixjQUFJLENBQUMseUNBQXVDLFdBQVcsYUFBVSxDQUFDLENBQUM7NEJBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELHdEQUF3RDt3QkFDeEQsZUFBSyxDQUFDLEtBQUssQ0FBSSxTQUFTLENBQUMsTUFBTSx3Q0FBbUMsV0FBVyxhQUFVLENBQUMsQ0FBQzs7NEJBQ3pGLEtBQWlCLGNBQUEsaUJBQUEsU0FBUyxDQUFBLCtGQUFFO2dDQUFqQixFQUFFO2dDQUNYLGVBQUssQ0FBQyxVQUFRLEVBQUUsQ0FBQyxNQUFNLFVBQUssRUFBRSxDQUFDLEtBQU8sQ0FBQyxDQUFDOzZCQUN6Qzs7Ozs7Ozs7O3dCQUNELGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUFyR0QsOERBcUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRQZW5kaW5nUHJzfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgZWFjaCBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgdXBkYXRlZEF0OiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBudW1iZXI6IGdyYXBocWxUeXBlcy5udW1iZXIsXG4gIG1lcmdlYWJsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgdGl0bGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG59O1xuXG4vKiBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgR3JhcGhxbCBxdWVyeSAqL1xudHlwZSBSYXdQdWxsUmVxdWVzdCA9IHR5cGVvZiBQUl9TQ0hFTUE7XG5cbi8qKiBDb252ZXJ0IHJhdyBQdWxsIFJlcXVlc3QgcmVzcG9uc2UgZnJvbSBHaXRodWIgdG8gdXNhYmxlIFB1bGwgUmVxdWVzdCBvYmplY3QuICovXG5mdW5jdGlvbiBwcm9jZXNzUHIocHI6IFJhd1B1bGxSZXF1ZXN0KSB7XG4gIHJldHVybiB7Li4ucHIsIHVwZGF0ZWRBdDogKG5ldyBEYXRlKHByLnVwZGF0ZWRBdCkpLmdldFRpbWUoKX07XG59XG5cbi8qIFB1bGwgUmVxdWVzdCBvYmplY3QgYWZ0ZXIgcHJvY2Vzc2luZywgZGVyaXZlZCBmcm9tIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgcHJvY2Vzc1ByIGZ1bmN0aW9uLiAqL1xudHlwZSBQdWxsUmVxdWVzdCA9IFJldHVyblR5cGU8dHlwZW9mIHByb2Nlc3NQcj47XG5cbi8qKiBOYW1lIG9mIGEgdGVtcG9yYXJ5IGxvY2FsIGJyYW5jaCB0aGF0IGlzIHVzZWQgZm9yIGNoZWNraW5nIGNvbmZsaWN0cy4gKiovXG5jb25zdCB0ZW1wV29ya2luZ0JyYW5jaCA9ICdfX05nRGV2UmVwb0Jhc2VBZnRlckNoYW5nZV9fJztcblxuLyoqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgUFIgd2lsbCBjYXVzZSBuZXcgY29uZmxpY3RzIGluIG90aGVyIHBlbmRpbmcgUFJzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIobmV3UHJOdW1iZXI6IG51bWJlciwgdXBkYXRlZEFmdGVyOiBudW1iZXIpIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBsb2NhbCBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgc3RhdGUsIHRoZVxuICAvLyBjaGVjayBjYW5ub3QgcnVuIGFzIGl0IG5lZWRzIHRvIG1vdmUgYmV0d2VlbiBicmFuY2hlcy5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIG9yIHJldmlzaW9uIGJlZm9yZSB3ZSBwZXJmb3JtZWQgYW55IEdpdCBjb21tYW5kcy4gKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBpbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGdpdCkpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBlcnJvcihgdGhlIFBSIG51bWJlciBpcyBjb3JyZWN0IGFuZCBpcyBhbiBvcGVuIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcGVuZGluZ1BycyA9IGFsbFBlbmRpbmdQUnMuZmlsdGVyKHByID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvLyBQUnMgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHNhbWUgdGFyZ2V0IGJyYW5jaCBhcyB0aGUgcmVxdWVzdGVkIFBSXG4gICAgICAgIHByLmJhc2VSZWYubmFtZSA9PT0gcmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lICYmXG4gICAgICAgIC8vIFBScyB3aGljaCBlaXRoZXIgaGF2ZSBub3QgYmVlbiBwcm9jZXNzZWQgb3IgYXJlIGRldGVybWluZWQgYXMgbWVyZ2FibGUgYnkgR2l0aHViXG4gICAgICAgIHByLm1lcmdlYWJsZSAhPT0gJ0NPTkZMSUNUSU5HJyAmJlxuICAgICAgICAvLyBQUnMgdXBkYXRlZCBhZnRlciB0aGUgcHJvdmlkZWQgZGF0ZVxuICAgICAgICBwci51cGRhdGVkQXQgPj0gdXBkYXRlZEFmdGVyKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcmVxdWVzdGVkUHIuaGVhZFJlZi5uYW1lXSk7XG4gIGdpdC5ydW4oWydjaGVja291dCcsICctcScsICctQicsIHRlbXBXb3JraW5nQnJhbmNoLCAnRkVUQ0hfSEVBRCddKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCByZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWVdKTtcbiAgdHJ5IHtcbiAgICBnaXQucnVuKFsncmViYXNlJywgJ0ZFVENIX0hFQUQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcHIuaGVhZFJlZi5uYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgdHJ5IHtcbiAgICAgIGdpdC5ydW4oWydyZWJhc2UnLCB0ZW1wV29ya2luZ0JyYW5jaF0sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuXG4gICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICB9XG4gIC8vIEVuZCB0aGUgcHJvZ3Jlc3MgYmFyIGFzIGFsbCBQUnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICBpbmZvKCk7XG4gIGluZm8oYFJlc3VsdDpgKTtcblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBpbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgZXJyb3IuZ3JvdXAoYCR7Y29uZmxpY3RzLmxlbmd0aH0gUFIocykgd2hpY2ggY29uZmxpY3QocykgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdlczpgKTtcbiAgZm9yIChjb25zdCBwciBvZiBjb25mbGljdHMpIHtcbiAgICBlcnJvcihgICAtICMke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19