/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { Bar } from 'cli-progress';
import { types as graphqlTypes } from 'typed-graphqlify';
import { error, info } from '../../utils/console';
import { GitClient } from '../../utils/git/index';
import { getPendingPrs } from '../../utils/github';
import { exec } from '../../utils/shelljs';
/* Graphql schema for the response body for each pending PR. */
const PR_SCHEMA = {
    headRef: {
        name: graphqlTypes.string,
        repository: {
            url: graphqlTypes.string,
            nameWithOwner: graphqlTypes.string,
        },
    },
    baseRef: {
        name: graphqlTypes.string,
        repository: {
            url: graphqlTypes.string,
            nameWithOwner: graphqlTypes.string,
        },
    },
    updatedAt: graphqlTypes.string,
    number: graphqlTypes.number,
    mergeable: graphqlTypes.string,
    title: graphqlTypes.string,
};
/** Convert raw Pull Request response from Github to usable Pull Request object. */
function processPr(pr) {
    return Object.assign(Object.assign({}, pr), { updatedAt: (new Date(pr.updatedAt)).getTime() });
}
/** Name of a temporary local branch that is used for checking conflicts. **/
const tempWorkingBranch = '__NgDevRepoBaseAfterChange__';
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
export function discoverNewConflictsForPr(newPrNumber, updatedAfter) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The singleton instance of the GitClient. */
        const git = GitClient.getAuthenticatedInstance();
        // If there are any local changes in the current repository state, the
        // check cannot run as it needs to move between branches.
        if (git.hasUncommittedChanges()) {
            error('Cannot run with local changes. Please make sure there are no local changes.');
            process.exit(1);
        }
        /** The active github branch or revision before we performed any Git commands. */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* Progress bar to indicate progress. */
        const progressBar = new Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total}` });
        /* PRs which were found to be conflicting. */
        const conflicts = [];
        info(`Requesting pending PRs from Github`);
        /** List of PRs from github currently known as mergable. */
        const allPendingPRs = (yield getPendingPrs(PR_SCHEMA, git)).map(processPr);
        /** The PR which is being checked against. */
        const requestedPr = allPendingPRs.find(pr => pr.number === newPrNumber);
        if (requestedPr === undefined) {
            error(`The request PR, #${newPrNumber} was not found as a pending PR on github, please confirm`);
            error(`the PR number is correct and is an open PR`);
            process.exit(1);
        }
        const pendingPrs = allPendingPRs.filter(pr => {
            return (
            // PRs being merged into the same target branch as the requested PR
            pr.baseRef.name === requestedPr.baseRef.name &&
                // PRs which either have not been processed or are determined as mergable by Github
                pr.mergeable !== 'CONFLICTING' &&
                // PRs updated after the provided date
                pr.updatedAt >= updatedAfter);
        });
        info(`Retrieved ${allPendingPRs.length} total pending PRs`);
        info(`Checking ${pendingPrs.length} PRs for conflicts after a merge of #${newPrNumber}`);
        // Fetch and checkout the PR being checked.
        exec(`git fetch ${requestedPr.headRef.repository.url} ${requestedPr.headRef.name}`);
        exec(`git checkout -B ${tempWorkingBranch} FETCH_HEAD`);
        // Rebase the PR against the PRs target branch.
        exec(`git fetch ${requestedPr.baseRef.repository.url} ${requestedPr.baseRef.name}`);
        const result = exec(`git rebase FETCH_HEAD`);
        if (result.code) {
            error('The requested PR currently has conflicts');
            cleanUpGitState(previousBranchOrRevision);
            process.exit(1);
        }
        // Start the progress bar
        progressBar.start(pendingPrs.length, 0);
        // Check each PR to determine if it can merge cleanly into the repo after the target PR.
        for (const pr of pendingPrs) {
            // Fetch and checkout the next PR
            exec(`git fetch ${pr.headRef.repository.url} ${pr.headRef.name}`);
            exec(`git checkout --detach FETCH_HEAD`);
            // Check if the PR cleanly rebases into the repo after the target PR.
            const result = exec(`git rebase ${tempWorkingBranch}`);
            if (result.code !== 0) {
                conflicts.push(pr);
            }
            // Abort any outstanding rebase attempt.
            exec(`git rebase --abort`);
            progressBar.increment(1);
        }
        // End the progress bar as all PRs have been processed.
        progressBar.stop();
        info();
        info(`Result:`);
        cleanUpGitState(previousBranchOrRevision);
        // If no conflicts are found, exit successfully.
        if (conflicts.length === 0) {
            info(`No new conflicting PRs found after #${newPrNumber} merging`);
            process.exit(0);
        }
        // Inform about discovered conflicts, exit with failure.
        error.group(`${conflicts.length} PR(s) which conflict(s) after #${newPrNumber} merges:`);
        for (const pr of conflicts) {
            error(`  - #${pr.number}: ${pr.title}`);
        }
        error.groupEnd();
        process.exit(1);
    });
}
/** Reset git back to the provided branch or revision. */
export function cleanUpGitState(previousBranchOrRevision) {
    // Ensure that any outstanding rebases are aborted.
    exec(`git rebase --abort`);
    // Ensure that any changes in the current repo state are cleared.
    exec(`git reset --hard`);
    // Checkout the original branch from before the run began.
    exec(`git checkout ${previousBranchOrRevision}`);
    // Delete the generated branch.
    exec(`git branch -D ${tempWorkingBranch}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHekMsK0RBQStEO0FBQy9ELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsU0FBUyxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQzlCLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMzQixTQUFTLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDOUIsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO0NBQzNCLENBQUM7QUFLRixtRkFBbUY7QUFDbkYsU0FBUyxTQUFT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QUMsR0FBRyxTQUFTLENBQUMsTUFBTSxtQ0FBbUMsV0FBVyxVQUFVLENBQUMsQ0FBQztRQUN6RixLQUFLLE1BQU0sRUFBRSxJQUFJLFNBQVMsRUFBRTtZQUMxQixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3pDO1FBQ0QsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztDQUFBO0FBRUQseURBQXlEO0FBQ3pELE1BQU0sVUFBVSxlQUFlLENBQUMsd0JBQWdDO0lBQzlELG1EQUFtRDtJQUNuRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztJQUMzQixpRUFBaUU7SUFDakUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDekIsMERBQTBEO0lBQzFELElBQUksQ0FBQyxnQkFBZ0Isd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELCtCQUErQjtJQUMvQixJQUFJLENBQUMsaUJBQWlCLGlCQUFpQixFQUFFLENBQUMsQ0FBQztBQUM3QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRQZW5kaW5nUHJzfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuLi8uLi91dGlscy9zaGVsbGpzJztcblxuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIHVwZGF0ZWRBdDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbnVtYmVyOiBncmFwaHFsVHlwZXMubnVtYmVyLFxuICBtZXJnZWFibGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIHRpdGxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxufTtcblxuLyogUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIEdyYXBocWwgcXVlcnkgKi9cbnR5cGUgUmF3UHVsbFJlcXVlc3QgPSB0eXBlb2YgUFJfU0NIRU1BO1xuXG4vKiogQ29udmVydCByYXcgUHVsbCBSZXF1ZXN0IHJlc3BvbnNlIGZyb20gR2l0aHViIHRvIHVzYWJsZSBQdWxsIFJlcXVlc3Qgb2JqZWN0LiAqL1xuZnVuY3Rpb24gcHJvY2Vzc1ByKHByOiBSYXdQdWxsUmVxdWVzdCkge1xuICByZXR1cm4gey4uLnByLCB1cGRhdGVkQXQ6IChuZXcgRGF0ZShwci51cGRhdGVkQXQpKS5nZXRUaW1lKCl9O1xufVxuXG4vKiBQdWxsIFJlcXVlc3Qgb2JqZWN0IGFmdGVyIHByb2Nlc3NpbmcsIGRlcml2ZWQgZnJvbSB0aGUgcmV0dXJuIHR5cGUgb2YgdGhlIHByb2Nlc3NQciBmdW5jdGlvbi4gKi9cbnR5cGUgUHVsbFJlcXVlc3QgPSBSZXR1cm5UeXBlPHR5cGVvZiBwcm9jZXNzUHI+O1xuXG4vKiogTmFtZSBvZiBhIHRlbXBvcmFyeSBsb2NhbCBicmFuY2ggdGhhdCBpcyB1c2VkIGZvciBjaGVja2luZyBjb25mbGljdHMuICoqL1xuY29uc3QgdGVtcFdvcmtpbmdCcmFuY2ggPSAnX19OZ0RldlJlcG9CYXNlQWZ0ZXJDaGFuZ2VfXyc7XG5cbi8qKiBDaGVja3MgaWYgdGhlIHByb3ZpZGVkIFBSIHdpbGwgY2F1c2UgbmV3IGNvbmZsaWN0cyBpbiBvdGhlciBwZW5kaW5nIFBScy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKG5ld1ByTnVtYmVyOiBudW1iZXIsIHVwZGF0ZWRBZnRlcjogbnVtYmVyKSB7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKTtcbiAgLy8gSWYgdGhlcmUgYXJlIGFueSBsb2NhbCBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG9zaXRvcnkgc3RhdGUsIHRoZVxuICAvLyBjaGVjayBjYW5ub3QgcnVuIGFzIGl0IG5lZWRzIHRvIG1vdmUgYmV0d2VlbiBicmFuY2hlcy5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcnVuIHdpdGggbG9jYWwgY2hhbmdlcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgbm8gbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogVGhlIGFjdGl2ZSBnaXRodWIgYnJhbmNoIG9yIHJldmlzaW9uIGJlZm9yZSB3ZSBwZXJmb3JtZWQgYW55IEdpdCBjb21tYW5kcy4gKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFByb2dyZXNzIGJhciB0byBpbmRpY2F0ZSBwcm9ncmVzcy4gKi9cbiAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9YH0pO1xuICAvKiBQUnMgd2hpY2ggd2VyZSBmb3VuZCB0byBiZSBjb25mbGljdGluZy4gKi9cbiAgY29uc3QgY29uZmxpY3RzOiBBcnJheTxQdWxsUmVxdWVzdD4gPSBbXTtcblxuICBpbmZvKGBSZXF1ZXN0aW5nIHBlbmRpbmcgUFJzIGZyb20gR2l0aHViYCk7XG4gIC8qKiBMaXN0IG9mIFBScyBmcm9tIGdpdGh1YiBjdXJyZW50bHkga25vd24gYXMgbWVyZ2FibGUuICovXG4gIGNvbnN0IGFsbFBlbmRpbmdQUnMgPSAoYXdhaXQgZ2V0UGVuZGluZ1BycyhQUl9TQ0hFTUEsIGdpdCkpLm1hcChwcm9jZXNzUHIpO1xuICAvKiogVGhlIFBSIHdoaWNoIGlzIGJlaW5nIGNoZWNrZWQgYWdhaW5zdC4gKi9cbiAgY29uc3QgcmVxdWVzdGVkUHIgPSBhbGxQZW5kaW5nUFJzLmZpbmQocHIgPT4gcHIubnVtYmVyID09PSBuZXdQck51bWJlcik7XG4gIGlmIChyZXF1ZXN0ZWRQciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgcmVxdWVzdCBQUiwgIyR7bmV3UHJOdW1iZXJ9IHdhcyBub3QgZm91bmQgYXMgYSBwZW5kaW5nIFBSIG9uIGdpdGh1YiwgcGxlYXNlIGNvbmZpcm1gKTtcbiAgICBlcnJvcihgdGhlIFBSIG51bWJlciBpcyBjb3JyZWN0IGFuZCBpcyBhbiBvcGVuIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgcGVuZGluZ1BycyA9IGFsbFBlbmRpbmdQUnMuZmlsdGVyKHByID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgICAvLyBQUnMgYmVpbmcgbWVyZ2VkIGludG8gdGhlIHNhbWUgdGFyZ2V0IGJyYW5jaCBhcyB0aGUgcmVxdWVzdGVkIFBSXG4gICAgICAgIHByLmJhc2VSZWYubmFtZSA9PT0gcmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lICYmXG4gICAgICAgIC8vIFBScyB3aGljaCBlaXRoZXIgaGF2ZSBub3QgYmVlbiBwcm9jZXNzZWQgb3IgYXJlIGRldGVybWluZWQgYXMgbWVyZ2FibGUgYnkgR2l0aHViXG4gICAgICAgIHByLm1lcmdlYWJsZSAhPT0gJ0NPTkZMSUNUSU5HJyAmJlxuICAgICAgICAvLyBQUnMgdXBkYXRlZCBhZnRlciB0aGUgcHJvdmlkZWQgZGF0ZVxuICAgICAgICBwci51cGRhdGVkQXQgPj0gdXBkYXRlZEFmdGVyKTtcbiAgfSk7XG4gIGluZm8oYFJldHJpZXZlZCAke2FsbFBlbmRpbmdQUnMubGVuZ3RofSB0b3RhbCBwZW5kaW5nIFBSc2ApO1xuICBpbmZvKGBDaGVja2luZyAke3BlbmRpbmdQcnMubGVuZ3RofSBQUnMgZm9yIGNvbmZsaWN0cyBhZnRlciBhIG1lcmdlIG9mICMke25ld1ByTnVtYmVyfWApO1xuXG4gIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgUFIgYmVpbmcgY2hlY2tlZC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWV9YCk7XG4gIGV4ZWMoYGdpdCBjaGVja291dCAtQiAke3RlbXBXb3JraW5nQnJhbmNofSBGRVRDSF9IRUFEYCk7XG5cbiAgLy8gUmViYXNlIHRoZSBQUiBhZ2FpbnN0IHRoZSBQUnMgdGFyZ2V0IGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGZldGNoICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gJHtyZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWV9YCk7XG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICBlcnJvcignVGhlIHJlcXVlc3RlZCBQUiBjdXJyZW50bHkgaGFzIGNvbmZsaWN0cycpO1xuICAgIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24pO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ1Bycy5sZW5ndGgsIDApO1xuXG4gIC8vIENoZWNrIGVhY2ggUFIgdG8gZGV0ZXJtaW5lIGlmIGl0IGNhbiBtZXJnZSBjbGVhbmx5IGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgZm9yIChjb25zdCBwciBvZiBwZW5kaW5nUHJzKSB7XG4gICAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBuZXh0IFBSXG4gICAgZXhlYyhgZ2l0IGZldGNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG4gICAgaWYgKHJlc3VsdC5jb2RlICE9PSAwKSB7XG4gICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcblxuICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgfVxuICAvLyBFbmQgdGhlIHByb2dyZXNzIGJhciBhcyBhbGwgUFJzIGhhdmUgYmVlbiBwcm9jZXNzZWQuXG4gIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgaW5mbygpO1xuICBpbmZvKGBSZXN1bHQ6YCk7XG5cbiAgY2xlYW5VcEdpdFN0YXRlKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbik7XG5cbiAgLy8gSWYgbm8gY29uZmxpY3RzIGFyZSBmb3VuZCwgZXhpdCBzdWNjZXNzZnVsbHkuXG4gIGlmIChjb25mbGljdHMubGVuZ3RoID09PSAwKSB7XG4gICAgaW5mbyhgTm8gbmV3IGNvbmZsaWN0aW5nIFBScyBmb3VuZCBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2luZ2ApO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIEluZm9ybSBhYm91dCBkaXNjb3ZlcmVkIGNvbmZsaWN0cywgZXhpdCB3aXRoIGZhaWx1cmUuXG4gIGVycm9yLmdyb3VwKGAke2NvbmZsaWN0cy5sZW5ndGh9IFBSKHMpIHdoaWNoIGNvbmZsaWN0KHMpIGFmdGVyICMke25ld1ByTnVtYmVyfSBtZXJnZXM6YCk7XG4gIGZvciAoY29uc3QgcHIgb2YgY29uZmxpY3RzKSB7XG4gICAgZXJyb3IoYCAgLSAjJHtwci5udW1iZXJ9OiAke3ByLnRpdGxlfWApO1xuICB9XG4gIGVycm9yLmdyb3VwRW5kKCk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cblxuLyoqIFJlc2V0IGdpdCBiYWNrIHRvIHRoZSBwcm92aWRlZCBicmFuY2ggb3IgcmV2aXNpb24uICovXG5leHBvcnQgZnVuY3Rpb24gY2xlYW5VcEdpdFN0YXRlKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nKSB7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzIGFyZSBhYm9ydGVkLlxuICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcbiAgLy8gRW5zdXJlIHRoYXQgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwbyBzdGF0ZSBhcmUgY2xlYXJlZC5cbiAgZXhlYyhgZ2l0IHJlc2V0IC0taGFyZGApO1xuICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gIGV4ZWMoYGdpdCBjaGVja291dCAke3ByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbn1gKTtcbiAgLy8gRGVsZXRlIHRoZSBnZW5lcmF0ZWQgYnJhbmNoLlxuICBleGVjKGBnaXQgYnJhbmNoIC1EICR7dGVtcFdvcmtpbmdCcmFuY2h9YCk7XG59XG4iXX0=