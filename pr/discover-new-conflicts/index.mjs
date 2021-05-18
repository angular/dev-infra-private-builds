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
        if (git.hasLocalChanges()) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2hELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNqRCxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHekMsK0RBQStEO0FBQy9ELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsU0FBUyxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQzlCLE1BQU0sRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMzQixTQUFTLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDOUIsS0FBSyxFQUFFLFlBQVksQ0FBQyxNQUFNO0NBQzNCLENBQUM7QUFLRixtRkFBbUY7QUFDbkYsU0FBUyxTQUFT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LEdBQUcsU0FBUyxDQUFDLE1BQU0sbUNBQW1DLFdBQVcsVUFBVSxDQUFDLENBQUM7UUFDekYsS0FBSyxNQUFNLEVBQUUsSUFBSSxTQUFTLEVBQUU7WUFDMUIsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDLE1BQU0sS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUN6QztRQUNELEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQUVELHlEQUF5RDtBQUN6RCxNQUFNLFVBQVUsZUFBZSxDQUFDLHdCQUFnQztJQUM5RCxtREFBbUQ7SUFDbkQsSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDM0IsaUVBQWlFO0lBQ2pFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ3pCLDBEQUEwRDtJQUMxRCxJQUFJLENBQUMsZ0JBQWdCLHdCQUF3QixFQUFFLENBQUMsQ0FBQztJQUNqRCwrQkFBK0I7SUFDL0IsSUFBSSxDQUFDLGlCQUFpQixpQkFBaUIsRUFBRSxDQUFDLENBQUM7QUFDN0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UGVuZGluZ1Byc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaHFsIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlcikge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCk7XG4gIC8vIElmIHRoZXJlIGFyZSBhbnkgbG9jYWwgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvc2l0b3J5IHN0YXRlLCB0aGVcbiAgLy8gY2hlY2sgY2Fubm90IHJ1biBhcyBpdCBuZWVkcyB0byBtb3ZlIGJldHdlZW4gYnJhbmNoZXMuXG4gIGlmIChnaXQuaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBlcnJvcignQ2Fubm90IHJ1biB3aXRoIGxvY2FsIGNoYW5nZXMuIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIG5vIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFRoZSBhY3RpdmUgZ2l0aHViIGJyYW5jaCBvciByZXZpc2lvbiBiZWZvcmUgd2UgcGVyZm9ybWVkIGFueSBHaXQgY29tbWFuZHMuICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBQcm9ncmVzcyBiYXIgdG8gaW5kaWNhdGUgcHJvZ3Jlc3MuICovXG4gIGNvbnN0IHByb2dyZXNzQmFyID0gbmV3IEJhcih7Zm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfWB9KTtcbiAgLyogUFJzIHdoaWNoIHdlcmUgZm91bmQgdG8gYmUgY29uZmxpY3RpbmcuICovXG4gIGNvbnN0IGNvbmZsaWN0czogQXJyYXk8UHVsbFJlcXVlc3Q+ID0gW107XG5cbiAgaW5mbyhgUmVxdWVzdGluZyBwZW5kaW5nIFBScyBmcm9tIEdpdGh1YmApO1xuICAvKiogTGlzdCBvZiBQUnMgZnJvbSBnaXRodWIgY3VycmVudGx5IGtub3duIGFzIG1lcmdhYmxlLiAqL1xuICBjb25zdCBhbGxQZW5kaW5nUFJzID0gKGF3YWl0IGdldFBlbmRpbmdQcnMoUFJfU0NIRU1BLCBnaXQpKS5tYXAocHJvY2Vzc1ByKTtcbiAgLyoqIFRoZSBQUiB3aGljaCBpcyBiZWluZyBjaGVja2VkIGFnYWluc3QuICovXG4gIGNvbnN0IHJlcXVlc3RlZFByID0gYWxsUGVuZGluZ1BScy5maW5kKHByID0+IHByLm51bWJlciA9PT0gbmV3UHJOdW1iZXIpO1xuICBpZiAocmVxdWVzdGVkUHIgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9yKFxuICAgICAgICBgVGhlIHJlcXVlc3QgUFIsICMke25ld1ByTnVtYmVyfSB3YXMgbm90IGZvdW5kIGFzIGEgcGVuZGluZyBQUiBvbiBnaXRodWIsIHBsZWFzZSBjb25maXJtYCk7XG4gICAgZXJyb3IoYHRoZSBQUiBudW1iZXIgaXMgY29ycmVjdCBhbmQgaXMgYW4gb3BlbiBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHBlbmRpbmdQcnMgPSBhbGxQZW5kaW5nUFJzLmZpbHRlcihwciA9PiB7XG4gICAgcmV0dXJuIChcbiAgICAgICAgLy8gUFJzIGJlaW5nIG1lcmdlZCBpbnRvIHRoZSBzYW1lIHRhcmdldCBicmFuY2ggYXMgdGhlIHJlcXVlc3RlZCBQUlxuICAgICAgICBwci5iYXNlUmVmLm5hbWUgPT09IHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZSAmJlxuICAgICAgICAvLyBQUnMgd2hpY2ggZWl0aGVyIGhhdmUgbm90IGJlZW4gcHJvY2Vzc2VkIG9yIGFyZSBkZXRlcm1pbmVkIGFzIG1lcmdhYmxlIGJ5IEdpdGh1YlxuICAgICAgICBwci5tZXJnZWFibGUgIT09ICdDT05GTElDVElORycgJiZcbiAgICAgICAgLy8gUFJzIHVwZGF0ZWQgYWZ0ZXIgdGhlIHByb3ZpZGVkIGRhdGVcbiAgICAgICAgcHIudXBkYXRlZEF0ID49IHVwZGF0ZWRBZnRlcik7XG4gIH0pO1xuICBpbmZvKGBSZXRyaWV2ZWQgJHthbGxQZW5kaW5nUFJzLmxlbmd0aH0gdG90YWwgcGVuZGluZyBQUnNgKTtcbiAgaW5mbyhgQ2hlY2tpbmcgJHtwZW5kaW5nUHJzLmxlbmd0aH0gUFJzIGZvciBjb25mbGljdHMgYWZ0ZXIgYSBtZXJnZSBvZiAjJHtuZXdQck51bWJlcn1gKTtcblxuICAvLyBGZXRjaCBhbmQgY2hlY2tvdXQgdGhlIFBSIGJlaW5nIGNoZWNrZWQuXG4gIGV4ZWMoYGdpdCBmZXRjaCAke3JlcXVlc3RlZFByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cmVxdWVzdGVkUHIuaGVhZFJlZi5uYW1lfWApO1xuICBleGVjKGBnaXQgY2hlY2tvdXQgLUIgJHt0ZW1wV29ya2luZ0JyYW5jaH0gRkVUQ0hfSEVBRGApO1xuXG4gIC8vIFJlYmFzZSB0aGUgUFIgYWdhaW5zdCB0aGUgUFJzIHRhcmdldCBicmFuY2guXG4gIGV4ZWMoYGdpdCBmZXRjaCAke3JlcXVlc3RlZFByLmJhc2VSZWYucmVwb3NpdG9yeS51cmx9ICR7cmVxdWVzdGVkUHIuYmFzZVJlZi5uYW1lfWApO1xuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlIEZFVENIX0hFQURgKTtcbiAgaWYgKHJlc3VsdC5jb2RlKSB7XG4gICAgZXJyb3IoJ1RoZSByZXF1ZXN0ZWQgUFIgY3VycmVudGx5IGhhcyBjb25mbGljdHMnKTtcbiAgICBjbGVhblVwR2l0U3RhdGUocHJldmlvdXNCcmFuY2hPclJldmlzaW9uKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdQcnMubGVuZ3RoLCAwKTtcblxuICAvLyBDaGVjayBlYWNoIFBSIHRvIGRldGVybWluZSBpZiBpdCBjYW4gbWVyZ2UgY2xlYW5seSBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gIGZvciAoY29uc3QgcHIgb2YgcGVuZGluZ1Bycykge1xuICAgIC8vIEZldGNoIGFuZCBjaGVja291dCB0aGUgbmV4dCBQUlxuICAgIGV4ZWMoYGdpdCBmZXRjaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9ICR7cHIuaGVhZFJlZi5uYW1lfWApO1xuICAgIGV4ZWMoYGdpdCBjaGVja291dCAtLWRldGFjaCBGRVRDSF9IRUFEYCk7XG4gICAgLy8gQ2hlY2sgaWYgdGhlIFBSIGNsZWFubHkgcmViYXNlcyBpbnRvIHRoZSByZXBvIGFmdGVyIHRoZSB0YXJnZXQgUFIuXG4gICAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IHJlYmFzZSAke3RlbXBXb3JraW5nQnJhbmNofWApO1xuICAgIGlmIChyZXN1bHQuY29kZSAhPT0gMCkge1xuICAgICAgY29uZmxpY3RzLnB1c2gocHIpO1xuICAgIH1cbiAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlIGF0dGVtcHQuXG4gICAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG5cbiAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gIH1cbiAgLy8gRW5kIHRoZSBwcm9ncmVzcyBiYXIgYXMgYWxsIFBScyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gIGluZm8oKTtcbiAgaW5mbyhgUmVzdWx0OmApO1xuXG4gIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24pO1xuXG4gIC8vIElmIG5vIGNvbmZsaWN0cyBhcmUgZm91bmQsIGV4aXQgc3VjY2Vzc2Z1bGx5LlxuICBpZiAoY29uZmxpY3RzLmxlbmd0aCA9PT0gMCkge1xuICAgIGluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBlcnJvci5ncm91cChgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGVycm9yKGAgIC0gIyR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBlcnJvci5ncm91cEVuZCgpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG5cbi8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgcHJvdmlkZWQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZShwcmV2aW91c0JyYW5jaE9yUmV2aXNpb246IHN0cmluZykge1xuICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICBleGVjKGBnaXQgY2hlY2tvdXQgJHtwcmV2aW91c0JyYW5jaE9yUmV2aXNpb259YCk7XG4gIC8vIERlbGV0ZSB0aGUgZ2VuZXJhdGVkIGJyYW5jaC5cbiAgZXhlYyhgZ2l0IGJyYW5jaCAtRCAke3RlbXBXb3JraW5nQnJhbmNofWApO1xufVxuIl19