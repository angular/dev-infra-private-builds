"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.discoverNewConflictsForPr = void 0;
const cli_progress_1 = require("cli-progress");
const typed_graphqlify_1 = require("typed-graphqlify");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const git_client_1 = require("../../utils/git/git-client");
const github_1 = require("../../utils/github");
/* Graphql schema for the response body for each pending PR. */
const PR_SCHEMA = {
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
    return { ...pr, updatedAt: new Date(pr.updatedAt).getTime() };
}
/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
async function discoverNewConflictsForPr(newPrNumber, updatedAfter) {
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    // If there are any local changes in the current repository state, the
    // check cannot run as it needs to move between branches.
    if (git.hasUncommittedChanges()) {
        console_1.error('Cannot run with local changes. Please make sure there are no local changes.');
        process.exit(1);
    }
    /** The active github branch or revision before we performed any Git commands. */
    const previousBranchOrRevision = git.getCurrentBranchOrRevision();
    /* Progress bar to indicate progress. */
    const progressBar = new cli_progress_1.Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total}` });
    /* PRs which were found to be conflicting. */
    const conflicts = [];
    console_1.info(`Requesting pending PRs from Github`);
    /** List of PRs from github currently known as mergable. */
    const allPendingPRs = (await github_1.getPendingPrs(PR_SCHEMA, git)).map(processPr);
    /** The PR which is being checked against. */
    const requestedPr = allPendingPRs.find((pr) => pr.number === newPrNumber);
    if (requestedPr === undefined) {
        console_1.error(`The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`);
        console_1.error(`the PR number is correct and is an open PR`);
        process.exit(1);
    }
    const pendingPrs = allPendingPRs.filter((pr) => {
        return (
        // PRs being merged into the same target branch as the requested PR
        pr.baseRef.name === requestedPr.baseRef.name &&
            // PRs which either have not been processed or are determined as mergable by Github
            pr.mergeable !== 'CONFLICTING' &&
            // PRs updated after the provided date
            pr.updatedAt >= updatedAfter);
    });
    console_1.info(`Retrieved ${allPendingPRs.length} total pending PRs`);
    console_1.info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);
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
    // Check each PR to determine if it can merge cleanly into the repo after the target PR.
    for (const pr of pendingPrs) {
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
    // End the progress bar as all PRs have been processed.
    progressBar.stop();
    console_1.info();
    console_1.info(`Result:`);
    git.checkout(previousBranchOrRevision, true);
    // If no conflicts are found, exit successfully.
    if (conflicts.length === 0) {
        console_1.info(`No new conflicting PRs found after #${newPrNumber} merging`);
        process.exit(0);
    }
    // Inform about discovered conflicts, exit with failure.
    console_1.error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
    for (const pr of conflicts) {
        console_1.error(`  - #${pr.number}: ${pr.title}`);
    }
    console_1.error.groupEnd();
    process.exit(1);
}
exports.discoverNewConflictsForPr = discoverNewConflictsForPr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBaUM7QUFDakMsdURBQXVEO0FBRXZELGlEQUFnRDtBQUNoRCx1RkFBZ0Y7QUFDaEYsMkRBQTJEO0FBQzNELCtDQUFpRDtBQUVqRCwrREFBK0Q7QUFDL0QsTUFBTSxTQUFTLEdBQUc7SUFDaEIsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxTQUFTLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQzlCLE1BQU0sRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDM0IsU0FBUyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUM5QixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0NBQzNCLENBQUM7QUFLRixtRkFBbUY7QUFDbkYsU0FBUyxTQUFTLENBQUMsRUFBa0I7SUFDbkMsT0FBTyxFQUFDLEdBQUcsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUMsQ0FBQztBQUM5RCxDQUFDO0FBS0QsNkVBQTZFO0FBQzdFLE1BQU0saUJBQWlCLEdBQUcsOEJBQThCLENBQUM7QUFFekQsK0VBQStFO0FBQ3hF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V0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ25CLGNBQUksRUFBRSxDQUFDO0lBQ1AsY0FBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBRWhCLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFFN0MsZ0RBQWdEO0lBQ2hELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUIsY0FBSSxDQUFDLHVDQUF1QyxXQUFXLFVBQVUsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCx3REFBd0Q7SUFDeEQsZUFBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLG1DQUFtQyxXQUFXLFVBQVUsQ0FBQyxDQUFDO0lBQ3pGLEtBQUssTUFBTSxFQUFFLElBQUksU0FBUyxFQUFFO1FBQzFCLGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7S0FDekM7SUFDRCxlQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBdkdELDhEQXVHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaHFsIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiBuZXcgRGF0ZShwci51cGRhdGVkQXQpLmdldFRpbWUoKX07XG59XG5cbi8qIFB1bGwgUmVxdWVzdCBvYmplY3QgYWZ0ZXIgcHJvY2Vzc2luZywgZGVyaXZlZCBmcm9tIHRoZSByZXR1cm4gdHlwZSBvZiB0aGUgcHJvY2Vzc1ByIGZ1bmN0aW9uLiAqL1xudHlwZSBQdWxsUmVxdWVzdCA9IFJldHVyblR5cGU8dHlwZW9mIHByb2Nlc3NQcj47XG5cbi8qKiBOYW1lIG9mIGEgdGVtcG9yYXJ5IGxvY2FsIGJyYW5jaCB0aGF0IGlzIHVzZWQgZm9yIGNoZWNraW5nIGNvbmZsaWN0cy4gKiovXG5jb25zdCB0ZW1wV29ya2luZ0JyYW5jaCA9ICdfX05nRGV2UmVwb0Jhc2VBZnRlckNoYW5nZV9fJztcblxuLyoqIENoZWNrcyBpZiB0aGUgcHJvdmlkZWQgUFIgd2lsbCBjYXVzZSBuZXcgY29uZmxpY3RzIGluIG90aGVyIHBlbmRpbmcgUFJzLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHIobmV3UHJOdW1iZXI6IG51bWJlciwgdXBkYXRlZEFmdGVyOiBudW1iZXIpIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBsb2NhbCBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgc3RhdGUsIHRoZVxuICAvLyBjaGVjayBjYW5ub3QgcnVuIGFzIGl0IG5lZWRzIHRvIG1vdmUgYmV0d2VlbiBicmFuY2hlcy5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIG9yIHJldmlzaW9uIGJlZm9yZSB3ZSBwZXJmb3JtZWQgYW55IEdpdCBjb21tYW5kcy4gKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBpbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGdpdCkpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQoKHByKSA9PiBwci5udW1iZXIgPT09IG5ld1ByTnVtYmVyKTtcbiAgaWYgKHJlcXVlc3RlZFByID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcihcbiAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gLFxuICAgICk7XG4gICAgZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcigocHIpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgcHIuYmFzZVJlZi5uYW1lID09PSByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWUgJiZcbiAgICAgIC8vIFBScyB3aGljaCBlaXRoZXIgaGF2ZSBub3QgYmVlbiBwcm9jZXNzZWQgb3IgYXJlIGRldGVybWluZWQgYXMgbWVyZ2FibGUgYnkgR2l0aHViXG4gICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgIC8vIFBScyB1cGRhdGVkIGFmdGVyIHRoZSBwcm92aWRlZCBkYXRlXG4gICAgICBwci51cGRhdGVkQXQgPj0gdXBkYXRlZEFmdGVyXG4gICAgKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcmVxdWVzdGVkUHIuaGVhZFJlZi5uYW1lXSk7XG4gIGdpdC5ydW4oWydjaGVja291dCcsICctcScsICctQicsIHRlbXBXb3JraW5nQnJhbmNoLCAnRkVUQ0hfSEVBRCddKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCByZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWVdKTtcbiAgdHJ5IHtcbiAgICBnaXQucnVuKFsncmViYXNlJywgJ0ZFVENIX0hFQUQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcHIuaGVhZFJlZi5uYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgdHJ5IHtcbiAgICAgIGdpdC5ydW4oWydyZWJhc2UnLCB0ZW1wV29ya2luZ0JyYW5jaF0sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuXG4gICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICB9XG4gIC8vIEVuZCB0aGUgcHJvZ3Jlc3MgYmFyIGFzIGFsbCBQUnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICBpbmZvKCk7XG4gIGluZm8oYFJlc3VsdDpgKTtcblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBpbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgZXJyb3IuZ3JvdXAoYCR7Y29uZmxpY3RzLmxlbmd0aH0gUFIocykgd2hpY2ggY29uZmxpY3QocykgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdlczpgKTtcbiAgZm9yIChjb25zdCBwciBvZiBjb25mbGljdHMpIHtcbiAgICBlcnJvcihgICAtICMke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19