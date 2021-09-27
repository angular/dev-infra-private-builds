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
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const git_client_1 = require("../../utils/git/git-client");
const fetch_pull_request_1 = require("../common/fetch-pull-request");
/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
async function discoverNewConflictsForPr(newPrNumber, updatedAfter) {
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    // If there are any local changes in the current repository state, the
    // check cannot run as it needs to move between branches.
    if (git.hasUncommittedChanges()) {
        (0, console_1.error)('Cannot run with local changes. Please make sure there are no local changes.');
        process.exit(1);
    }
    /** The active github branch or revision before we performed any Git commands. */
    const previousBranchOrRevision = git.getCurrentBranchOrRevision();
    /* Progress bar to indicate progress. */
    const progressBar = new cli_progress_1.Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total}` });
    /* PRs which were found to be conflicting. */
    const conflicts = [];
    (0, console_1.info)(`Requesting pending PRs from Github`);
    /** List of PRs from github currently known as mergable. */
    const allPendingPRs = await (0, fetch_pull_request_1.fetchPendingPullRequestsFromGithub)(git);
    if (allPendingPRs === null) {
        (0, console_1.error)('Unable to find any pending PRs in the repository');
        process.exit(1);
    }
    /** The PR which is being checked against. */
    const requestedPr = allPendingPRs.find((pr) => pr.number === newPrNumber);
    if (requestedPr === undefined) {
        (0, console_1.error)(`The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`);
        (0, console_1.error)(`the PR number is correct and is an open PR`);
        process.exit(1);
    }
    const pendingPrs = allPendingPRs.filter((pr) => {
        return (
        // PRs being merged into the same target branch as the requested PR
        pr.baseRef.name === requestedPr.baseRef.name &&
            // PRs which either have not been processed or are determined as mergable by Github
            pr.mergeable !== 'CONFLICTING' &&
            // PRs updated after the provided date
            new Date(pr.updatedAt).getTime() >= updatedAfter);
    });
    (0, console_1.info)(`Retrieved ${allPendingPRs.length} total pending PRs`);
    (0, console_1.info)(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);
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
            (0, console_1.error)('The requested PR currently has conflicts');
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
    (0, console_1.info)();
    (0, console_1.info)(`Result:`);
    git.checkout(previousBranchOrRevision, true);
    // If no conflicts are found, exit successfully.
    if (conflicts.length === 0) {
        (0, console_1.info)(`No new conflicting PRs found after #${newPrNumber} merging`);
        process.exit(0);
    }
    // Inform about discovered conflicts, exit with failure.
    console_1.error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
    for (const pr of conflicts) {
        (0, console_1.error)(`  - #${pr.number}: ${pr.title}`);
    }
    console_1.error.groupEnd();
    process.exit(1);
}
exports.discoverNewConflictsForPr = discoverNewConflictsForPr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwrQ0FBaUM7QUFFakMsaURBQWdEO0FBQ2hELHVGQUFnRjtBQUNoRiwyREFBMkQ7QUFDM0QscUVBR3NDO0FBRXRDLDZFQUE2RTtBQUM3RSxNQUFNLGlCQUFpQixHQUFHLDhCQUE4QixDQUFDO0FBRXpELCtFQUErRTtBQUN4RSxLQUFLLFVBQVUseUJBQXlCLENBQUMsV0FBbUIsRUFBRSxZQUFvQjtJQUN2Riw4REFBOEQ7SUFDOUQsTUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDekMsc0VBQXNFO0lBQ3RFLHlEQUF5RDtJQUN6RCxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1FBQy9CLElBQUEsZUFBSyxFQUFDLDZFQUE2RSxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELGlGQUFpRjtJQUNqRixNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQ2xFLHdDQUF3QztJQUN4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLGtCQUFHLENBQUMsRUFBQyxNQUFNLEVBQUUsdUNBQXVDLEVBQUMsQ0FBQyxDQUFDO0lBQy9FLDZDQUE2QztJQUM3QyxNQUFNLFNBQVMsR0FBaUMsRUFBRSxDQUFDO0lBRW5ELElBQUEsY0FBSSxFQUFDLG9DQUFvQyxDQUFDLENBQUM7SUFDM0MsMkRBQTJEO0lBQzNELE1BQU0sYUFBYSxHQUFHLE1BQU0sSUFBQSx1REFBa0MsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUVwRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7UUFDMUIsSUFBQSxlQUFLLEVBQUMsa0RB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QUMsS0FBSyxFQUFFLENBQUMsQ0FBQztLQUN6QztJQUNELGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUE3R0QsOERBNkdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtcbiAgZmV0Y2hQZW5kaW5nUHVsbFJlcXVlc3RzRnJvbUdpdGh1YixcbiAgUHVsbFJlcXVlc3RGcm9tR2l0aHViLFxufSBmcm9tICcuLi9jb21tb24vZmV0Y2gtcHVsbC1yZXF1ZXN0JztcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlcikge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBydW4gd2l0aCBsb2NhbCBjaGFuZ2VzLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGdpdGh1YiBicmFuY2ggb3IgcmV2aXNpb24gYmVmb3JlIHdlIHBlcmZvcm1lZCBhbnkgR2l0IGNvbW1hbmRzLiAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogUHJvZ3Jlc3MgYmFyIHRvIGluZGljYXRlIHByb2dyZXNzLiAqL1xuICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH1gfSk7XG4gIC8qIFBScyB3aGljaCB3ZXJlIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nLiAqL1xuICBjb25zdCBjb25mbGljdHM6IEFycmF5PFB1bGxSZXF1ZXN0RnJvbUdpdGh1Yj4gPSBbXTtcblxuICBpbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSBhd2FpdCBmZXRjaFBlbmRpbmdQdWxsUmVxdWVzdHNGcm9tR2l0aHViKGdpdCk7XG5cbiAgaWYgKGFsbFBlbmRpbmdQUnMgPT09IG51bGwpIHtcbiAgICBlcnJvcignVW5hYmxlIHRvIGZpbmQgYW55IHBlbmRpbmcgUFJzIGluIHRoZSByZXBvc2l0b3J5Jyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFRoZSBQUiB3aGljaCBpcyBiZWluZyBjaGVja2VkIGFnYWluc3QuICovXG4gIGNvbnN0IHJlcXVlc3RlZFByID0gYWxsUGVuZGluZ1BScy5maW5kKChwcikgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IoXG4gICAgICBgVGhlIHJlcXVlc3QgUFIsICMke25ld1ByTnVtYmVyfSB3YXMgbm90IGZvdW5kIGFzIGEgcGVuZGluZyBQUiBvbiBnaXRodWIsIHBsZWFzZSBjb25maXJtYCxcbiAgICApO1xuICAgIGVycm9yKGB0aGUgUFIgbnVtYmVyIGlzIGNvcnJlY3QgYW5kIGlzIGFuIG9wZW4gUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBwZW5kaW5nUHJzID0gYWxsUGVuZGluZ1BScy5maWx0ZXIoKHByKSA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgIC8vIFBScyBiZWluZyBtZXJnZWQgaW50byB0aGUgc2FtZSB0YXJnZXQgYnJhbmNoIGFzIHRoZSByZXF1ZXN0ZWQgUFJcbiAgICAgIHByLmJhc2VSZWYubmFtZSA9PT0gcmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lICYmXG4gICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgcHIubWVyZ2VhYmxlICE9PSAnQ09ORkxJQ1RJTkcnICYmXG4gICAgICAvLyBQUnMgdXBkYXRlZCBhZnRlciB0aGUgcHJvdmlkZWQgZGF0ZVxuICAgICAgbmV3IERhdGUocHIudXBkYXRlZEF0KS5nZXRUaW1lKCkgPj0gdXBkYXRlZEFmdGVyXG4gICAgKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcmVxdWVzdGVkUHIuaGVhZFJlZi5uYW1lXSk7XG4gIGdpdC5ydW4oWydjaGVja291dCcsICctcScsICctQicsIHRlbXBXb3JraW5nQnJhbmNoLCAnRkVUQ0hfSEVBRCddKTtcblxuICAvLyBSZWJhc2UgdGhlIFBSIGFnYWluc3QgdGhlIFBScyB0YXJnZXQgYnJhbmNoLlxuICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCByZXF1ZXN0ZWRQci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWVdKTtcbiAgdHJ5IHtcbiAgICBnaXQucnVuKFsncmViYXNlJywgJ0ZFVENIX0hFQUQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoZXJyIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIHRocm93IGVycjtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgcHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgcHIuaGVhZFJlZi5uYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgdHJ5IHtcbiAgICAgIGdpdC5ydW4oWydyZWJhc2UnLCB0ZW1wV29ya2luZ0JyYW5jaF0sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuXG4gICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICB9XG4gIC8vIEVuZCB0aGUgcHJvZ3Jlc3MgYmFyIGFzIGFsbCBQUnMgaGF2ZSBiZWVuIHByb2Nlc3NlZC5cbiAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICBpbmZvKCk7XG4gIGluZm8oYFJlc3VsdDpgKTtcblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcblxuICAvLyBJZiBubyBjb25mbGljdHMgYXJlIGZvdW5kLCBleGl0IHN1Y2Nlc3NmdWxseS5cbiAgaWYgKGNvbmZsaWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBpbmZvKGBObyBuZXcgY29uZmxpY3RpbmcgUFJzIGZvdW5kIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnaW5nYCk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gSW5mb3JtIGFib3V0IGRpc2NvdmVyZWQgY29uZmxpY3RzLCBleGl0IHdpdGggZmFpbHVyZS5cbiAgZXJyb3IuZ3JvdXAoYCR7Y29uZmxpY3RzLmxlbmd0aH0gUFIocykgd2hpY2ggY29uZmxpY3QocykgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdlczpgKTtcbiAgZm9yIChjb25zdCBwciBvZiBjb25mbGljdHMpIHtcbiAgICBlcnJvcihgICAtICMke3ByLm51bWJlcn06ICR7cHIudGl0bGV9YCk7XG4gIH1cbiAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19