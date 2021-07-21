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
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { GitCommandError } from '../../utils/git/git-client';
import { getPendingPrs } from '../../utils/github';
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
        /** The singleton instance of the authenticated git client. */
        const git = AuthenticatedGitClient.get();
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
        git.run(['fetch', '-q', requestedPr.headRef.repository.url, requestedPr.headRef.name]);
        git.run(['checkout', '-q', '-B', tempWorkingBranch, 'FETCH_HEAD']);
        // Rebase the PR against the PRs target branch.
        git.run(['fetch', '-q', requestedPr.baseRef.repository.url, requestedPr.baseRef.name]);
        try {
            git.run(['rebase', 'FETCH_HEAD'], { stdio: 'ignore' });
        }
        catch (err) {
            if (err instanceof GitCommandError) {
                error('The requested PR currently has conflicts');
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
                if (err instanceof GitCommandError) {
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
        info();
        info(`Result:`);
        git.checkout(previousBranchOrRevision, true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvZGlzY292ZXItbmV3LWNvbmZsaWN0cy9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLHNCQUFzQixFQUFDLE1BQU0sMENBQTBDLENBQUM7QUFDaEYsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUdqRCwrREFBK0Q7QUFDL0QsTUFBTSxTQUFTLEdBQUc7SUFDaEIsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSxZQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtJQUNELE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxTQUFTLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDOUIsTUFBTSxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQzNCLFNBQVMsRUFBRSxZQUFZLENBQUMsTUFBTTtJQUM5QixLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07Q0FDM0IsQ0FBQztBQUtGLG1GQUFtRjtBQUNuRixTQUFTLFNB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RyxDQUFDO2lCQUNYO2FBQ0Y7WUFDRCx3Q0FBd0M7WUFDeEMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1lBRTFELFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDMUI7UUFDRCx1REFBdUQ7UUFDdkQsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ25CLElBQUksRUFBRSxDQUFDO1FBQ1AsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRWhCLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFN0MsZ0RBQWdEO1FBQ2hELElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDMUIsSUFBSSxDQUFDLHVDQUF1QyxXQUFXLFVBQVUsQ0FBQyxDQUFDO1lBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCx3REFBd0Q7UUFDeEQsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLG1DQUFtQyxXQUFXLFVBQVUsQ0FBQyxDQUFDO1FBQ3pGLEtBQUssTUFBTSxFQUFFLElBQUksU0FBUyxFQUFFO1lBQzFCLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDekM7UUFDRCxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXJ9IGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQge3R5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7ZXJyb3IsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldFBlbmRpbmdQcnN9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICB1cGRhdGVkQXQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG51bWJlcjogZ3JhcGhxbFR5cGVzLm51bWJlcixcbiAgbWVyZ2VhYmxlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICB0aXRsZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbn07XG5cbi8qIFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiBHcmFwaHFsIHF1ZXJ5ICovXG50eXBlIFJhd1B1bGxSZXF1ZXN0ID0gdHlwZW9mIFBSX1NDSEVNQTtcblxuLyoqIENvbnZlcnQgcmF3IFB1bGwgUmVxdWVzdCByZXNwb25zZSBmcm9tIEdpdGh1YiB0byB1c2FibGUgUHVsbCBSZXF1ZXN0IG9iamVjdC4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NQcihwcjogUmF3UHVsbFJlcXVlc3QpIHtcbiAgcmV0dXJuIHsuLi5wciwgdXBkYXRlZEF0OiAobmV3IERhdGUocHIudXBkYXRlZEF0KSkuZ2V0VGltZSgpfTtcbn1cblxuLyogUHVsbCBSZXF1ZXN0IG9iamVjdCBhZnRlciBwcm9jZXNzaW5nLCBkZXJpdmVkIGZyb20gdGhlIHJldHVybiB0eXBlIG9mIHRoZSBwcm9jZXNzUHIgZnVuY3Rpb24uICovXG50eXBlIFB1bGxSZXF1ZXN0ID0gUmV0dXJuVHlwZTx0eXBlb2YgcHJvY2Vzc1ByPjtcblxuLyoqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgY29uZmxpY3RzLiAqKi9cbmNvbnN0IHRlbXBXb3JraW5nQnJhbmNoID0gJ19fTmdEZXZSZXBvQmFzZUFmdGVyQ2hhbmdlX18nO1xuXG4vKiogQ2hlY2tzIGlmIHRoZSBwcm92aWRlZCBQUiB3aWxsIGNhdXNlIG5ldyBjb25mbGljdHMgaW4gb3RoZXIgcGVuZGluZyBQUnMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGlzY292ZXJOZXdDb25mbGljdHNGb3JQcihuZXdQck51bWJlcjogbnVtYmVyLCB1cGRhdGVkQWZ0ZXI6IG51bWJlcikge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICAvLyBJZiB0aGVyZSBhcmUgYW55IGxvY2FsIGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwb3NpdG9yeSBzdGF0ZSwgdGhlXG4gIC8vIGNoZWNrIGNhbm5vdCBydW4gYXMgaXQgbmVlZHMgdG8gbW92ZSBiZXR3ZWVuIGJyYW5jaGVzLlxuICBpZiAoZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBydW4gd2l0aCBsb2NhbCBjaGFuZ2VzLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBUaGUgYWN0aXZlIGdpdGh1YiBicmFuY2ggb3IgcmV2aXNpb24gYmVmb3JlIHdlIHBlcmZvcm1lZCBhbnkgR2l0IGNvbW1hbmRzLiAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogUHJvZ3Jlc3MgYmFyIHRvIGluZGljYXRlIHByb2dyZXNzLiAqL1xuICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH1gfSk7XG4gIC8qIFBScyB3aGljaCB3ZXJlIGZvdW5kIHRvIGJlIGNvbmZsaWN0aW5nLiAqL1xuICBjb25zdCBjb25mbGljdHM6IEFycmF5PFB1bGxSZXF1ZXN0PiA9IFtdO1xuXG4gIGluZm8oYFJlcXVlc3RpbmcgcGVuZGluZyBQUnMgZnJvbSBHaXRodWJgKTtcbiAgLyoqIExpc3Qgb2YgUFJzIGZyb20gZ2l0aHViIGN1cnJlbnRseSBrbm93biBhcyBtZXJnYWJsZS4gKi9cbiAgY29uc3QgYWxsUGVuZGluZ1BScyA9IChhd2FpdCBnZXRQZW5kaW5nUHJzKFBSX1NDSEVNQSwgZ2l0KSkubWFwKHByb2Nlc3NQcik7XG4gIC8qKiBUaGUgUFIgd2hpY2ggaXMgYmVpbmcgY2hlY2tlZCBhZ2FpbnN0LiAqL1xuICBjb25zdCByZXF1ZXN0ZWRQciA9IGFsbFBlbmRpbmdQUnMuZmluZChwciA9PiBwci5udW1iZXIgPT09IG5ld1ByTnVtYmVyKTtcbiAgaWYgKHJlcXVlc3RlZFByID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYFRoZSByZXF1ZXN0IFBSLCAjJHtuZXdQck51bWJlcn0gd2FzIG5vdCBmb3VuZCBhcyBhIHBlbmRpbmcgUFIgb24gZ2l0aHViLCBwbGVhc2UgY29uZmlybWApO1xuICAgIGVycm9yKGB0aGUgUFIgbnVtYmVyIGlzIGNvcnJlY3QgYW5kIGlzIGFuIG9wZW4gUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBwZW5kaW5nUHJzID0gYWxsUGVuZGluZ1BScy5maWx0ZXIocHIgPT4ge1xuICAgIHJldHVybiAoXG4gICAgICAgIC8vIFBScyBiZWluZyBtZXJnZWQgaW50byB0aGUgc2FtZSB0YXJnZXQgYnJhbmNoIGFzIHRoZSByZXF1ZXN0ZWQgUFJcbiAgICAgICAgcHIuYmFzZVJlZi5uYW1lID09PSByZXF1ZXN0ZWRQci5iYXNlUmVmLm5hbWUgJiZcbiAgICAgICAgLy8gUFJzIHdoaWNoIGVpdGhlciBoYXZlIG5vdCBiZWVuIHByb2Nlc3NlZCBvciBhcmUgZGV0ZXJtaW5lZCBhcyBtZXJnYWJsZSBieSBHaXRodWJcbiAgICAgICAgcHIubWVyZ2VhYmxlICE9PSAnQ09ORkxJQ1RJTkcnICYmXG4gICAgICAgIC8vIFBScyB1cGRhdGVkIGFmdGVyIHRoZSBwcm92aWRlZCBkYXRlXG4gICAgICAgIHByLnVwZGF0ZWRBdCA+PSB1cGRhdGVkQWZ0ZXIpO1xuICB9KTtcbiAgaW5mbyhgUmV0cmlldmVkICR7YWxsUGVuZGluZ1BScy5sZW5ndGh9IHRvdGFsIHBlbmRpbmcgUFJzYCk7XG4gIGluZm8oYENoZWNraW5nICR7cGVuZGluZ1Bycy5sZW5ndGh9IFBScyBmb3IgY29uZmxpY3RzIGFmdGVyIGEgbWVyZ2Ugb2YgIyR7bmV3UHJOdW1iZXJ9YCk7XG5cbiAgLy8gRmV0Y2ggYW5kIGNoZWNrb3V0IHRoZSBQUiBiZWluZyBjaGVja2VkLlxuICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCByZXF1ZXN0ZWRQci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCByZXF1ZXN0ZWRQci5oZWFkUmVmLm5hbWVdKTtcbiAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgdGVtcFdvcmtpbmdCcmFuY2gsICdGRVRDSF9IRUFEJ10pO1xuXG4gIC8vIFJlYmFzZSB0aGUgUFIgYWdhaW5zdCB0aGUgUFJzIHRhcmdldCBicmFuY2guXG4gIGdpdC5ydW4oWydmZXRjaCcsICctcScsIHJlcXVlc3RlZFByLmJhc2VSZWYucmVwb3NpdG9yeS51cmwsIHJlcXVlc3RlZFByLmJhc2VSZWYubmFtZV0pO1xuICB0cnkge1xuICAgIGdpdC5ydW4oWydyZWJhc2UnLCAnRkVUQ0hfSEVBRCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgIGVycm9yKCdUaGUgcmVxdWVzdGVkIFBSIGN1cnJlbnRseSBoYXMgY29uZmxpY3RzJyk7XG4gICAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyO1xuICB9XG5cbiAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICBwcm9ncmVzc0Jhci5zdGFydChwZW5kaW5nUHJzLmxlbmd0aCwgMCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBQUiB0byBkZXRlcm1pbmUgaWYgaXQgY2FuIG1lcmdlIGNsZWFubHkgaW50byB0aGUgcmVwbyBhZnRlciB0aGUgdGFyZ2V0IFBSLlxuICBmb3IgKGNvbnN0IHByIG9mIHBlbmRpbmdQcnMpIHtcbiAgICAvLyBGZXRjaCBhbmQgY2hlY2tvdXQgdGhlIG5leHQgUFJcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBwci5oZWFkUmVmLm5hbWVdKTtcbiAgICBnaXQucnVuKFsnY2hlY2tvdXQnLCAnLXEnLCAnLS1kZXRhY2gnLCAnRkVUQ0hfSEVBRCddKTtcbiAgICAvLyBDaGVjayBpZiB0aGUgUFIgY2xlYW5seSByZWJhc2VzIGludG8gdGhlIHJlcG8gYWZ0ZXIgdGhlIHRhcmdldCBQUi5cbiAgICB0cnkge1xuICAgICAgZ2l0LnJ1bihbJ3JlYmFzZScsIHRlbXBXb3JraW5nQnJhbmNoXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICBjb25mbGljdHMucHVzaChwcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2UgYXR0ZW1wdC5cbiAgICBnaXQucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG5cbiAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gIH1cbiAgLy8gRW5kIHRoZSBwcm9ncmVzcyBiYXIgYXMgYWxsIFBScyBoYXZlIGJlZW4gcHJvY2Vzc2VkLlxuICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gIGluZm8oKTtcbiAgaW5mbyhgUmVzdWx0OmApO1xuXG4gIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuXG4gIC8vIElmIG5vIGNvbmZsaWN0cyBhcmUgZm91bmQsIGV4aXQgc3VjY2Vzc2Z1bGx5LlxuICBpZiAoY29uZmxpY3RzLmxlbmd0aCA9PT0gMCkge1xuICAgIGluZm8oYE5vIG5ldyBjb25mbGljdGluZyBQUnMgZm91bmQgYWZ0ZXIgIyR7bmV3UHJOdW1iZXJ9IG1lcmdpbmdgKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBJbmZvcm0gYWJvdXQgZGlzY292ZXJlZCBjb25mbGljdHMsIGV4aXQgd2l0aCBmYWlsdXJlLlxuICBlcnJvci5ncm91cChgJHtjb25mbGljdHMubGVuZ3RofSBQUihzKSB3aGljaCBjb25mbGljdChzKSBhZnRlciAjJHtuZXdQck51bWJlcn0gbWVyZ2VzOmApO1xuICBmb3IgKGNvbnN0IHByIG9mIGNvbmZsaWN0cykge1xuICAgIGVycm9yKGAgIC0gIyR7cHIubnVtYmVyfTogJHtwci50aXRsZX1gKTtcbiAgfVxuICBlcnJvci5ncm91cEVuZCgpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=