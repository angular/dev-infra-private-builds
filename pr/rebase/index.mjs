/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { types as graphqlTypes } from 'typed-graphqlify';
import { getCommitsInRange } from '../../commit-message/utils';
import { getConfig } from '../../utils/config';
import { error, info, promptConfirm } from '../../utils/console';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { addTokenToGitHttpsUrl } from '../../utils/git/github-urls';
import { getPr } from '../../utils/github';
/* Graphql schema for the response body for each pending PR. */
const PR_SCHEMA = {
    state: graphqlTypes.string,
    maintainerCanModify: graphqlTypes.boolean,
    viewerDidAuthor: graphqlTypes.boolean,
    headRefOid: graphqlTypes.string,
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
};
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export function rebasePr(prNumber, githubToken, config = getConfig()) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The singleton instance of the authenticated git client. */
        const git = AuthenticatedGitClient.get();
        if (git.hasUncommittedChanges()) {
            error('Cannot perform rebase of PR with local changes.');
            process.exit(1);
        }
        /**
         * The branch or revision originally checked out before this method performed
         * any Git operations that may change the working branch.
         */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* Get the PR information from Github. */
        const pr = yield getPr(PR_SCHEMA, prNumber, git);
        const headRefName = pr.headRef.name;
        const baseRefName = pr.baseRef.name;
        const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
        const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
        const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
        const baseRefUrl = addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);
        // Note: Since we use a detached head for rebasing the PR and therefore do not have
        // remote-tracking branches configured, we need to set our expected ref and SHA. This
        // allows us to use `--force-with-lease` for the detached head while ensuring that we
        // never accidentally override upstream changes that have been pushed in the meanwhile.
        // See:
        // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
        const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
        // be pushed up.
        if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
            error(`Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
                `to modify the PR`);
            process.exit(1);
        }
        try {
            // Fetch the branch at the commit of the PR, and check it out in a detached state.
            info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
            git.run(['fetch', '-q', headRefUrl, headRefName]);
            git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
            // Fetch the PRs target branch and rebase onto it.
            info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
            git.run(['fetch', '-q', baseRefUrl, baseRefName]);
            const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
            const commits = yield getCommitsInRange(commonAncestorSha, 'HEAD');
            let squashFixups = commits.filter((commit) => commit.isFixup).length === 0 ?
                false :
                yield promptConfirm(`PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`, true);
            info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
            /**
             * Tuple of flags to be added to the rebase command and env object to run the git command.
             *
             * Additional flags to perform the autosquashing are added when the user confirm squashing of
             * fixup commits should occur.
             */
            const [flags, env] = squashFixups ?
                [['--interactive', '--autosquash'], Object.assign(Object.assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' })] :
                [[], undefined];
            const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], { env: env });
            // If the rebase was clean, push the rebased PR up to the authors fork.
            if (rebaseResult.status === 0) {
                info(`Rebase was able to complete automatically without conflicts`);
                info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
                git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
                info(`Rebased and updated PR #${prNumber}`);
                git.checkout(previousBranchOrRevision, true);
                process.exit(0);
            }
        }
        catch (err) {
            error(err.message);
            git.checkout(previousBranchOrRevision, true);
            process.exit(1);
        }
        // On automatic rebase failures, prompt to choose if the rebase should be continued
        // manually or aborted now.
        info(`Rebase was unable to complete automatically without conflicts.`);
        // If the command is run in a non-CI environment, prompt to format the files immediately.
        const continueRebase = process.env['CI'] === undefined && (yield promptConfirm('Manually complete rebase?'));
        if (continueRebase) {
            info(`After manually completing rebase, run the following command to update PR #${prNumber}:`);
            info(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
            info();
            info(`To abort the rebase and return to the state of the repository before this command`);
            info(`run the following command:`);
            info(` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`);
            process.exit(1);
        }
        else {
            info(`Cleaning up git state, and restoring previous state.`);
        }
        git.checkout(previousBranchOrRevision, true);
        process.exit(1);
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR3ZELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBQyxTQUFTLEVBQWMsTUFBTSxvQkFBb0IsQ0FBQztBQUMxRCxPQUFPLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUNoRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFekMsK0RBQStEO0FBQy9ELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMxQixtQkFBbUIsRUFBRSxZQUFZLENBQUMsT0FBTztJQUN6QyxlQUFlLEVBQUUsWUFBWSxDQUFDLE9BQU87SUFDckMsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQy9CLE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtT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QUNGO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELG1GQUFtRjtRQUNuRiwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLGdFQUFnRSxDQUFDLENBQUM7UUFDdkUseUZBQXlGO1FBQ3pGLE1BQU0sY0FBYyxHQUNoQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsS0FBSSxNQUFNLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFBLENBQUM7UUFFeEYsSUFBSSxjQUFjLEVBQUU7WUFDbEIsSUFBSSxDQUFDLDZFQUE2RSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQy9GLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxXQUFXLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1lBQzNGLElBQUksRUFBRSxDQUFDO1lBQ1AsSUFBSSxDQUFDLG1GQUFtRixDQUFDLENBQUM7WUFDMUYsSUFBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7WUFDbkMsSUFBSSxDQUFDLDZEQUE2RCx3QkFBd0IsRUFBRSxDQUFDLENBQUM7WUFDOUYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjthQUFNO1lBQ0wsSUFBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7U0FDOUQ7UUFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0luUmFuZ2V9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3V0aWxzJztcbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHN0YXRlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG59O1xuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYmFzZVByKFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIGNvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCkpIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcGVyZm9ybSByZWJhc2Ugb2YgUFIgd2l0aCBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yIHJldmlzaW9uIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1lZFxuICAgKiBhbnkgR2l0IG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBHZXQgdGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG5cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIGNvbnN0IGJhc2VSZWZOYW1lID0gcHIuYmFzZVJlZi5uYW1lO1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIGNvbnN0IGZ1bGxCYXNlUmVmID0gYCR7cHIuYmFzZVJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7YmFzZVJlZk5hbWV9YDtcbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIGNvbnN0IGJhc2VSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvcikge1xuICAgIGVycm9yKFxuICAgICAgICBgQ2Fubm90IHJlYmFzZSBhcyB5b3UgZGlkIG5vdCBhdXRob3IgdGhlIFBSIGFuZCB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnNgICtcbiAgICAgICAgYHRvIG1vZGlmeSB0aGUgUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctcScsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuICAgIC8vIEZldGNoIHRoZSBQUnMgdGFyZ2V0IGJyYW5jaCBhbmQgcmViYXNlIG9udG8gaXQuXG4gICAgaW5mbyhgRmV0Y2hpbmcgJHtmdWxsQmFzZVJlZn0gdG8gcmViYXNlICMke3ByTnVtYmVyfSBvbmApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGJhc2VSZWZVcmwsIGJhc2VSZWZOYW1lXSk7XG5cbiAgICBjb25zdCBjb21tb25BbmNlc3RvclNoYSA9IGdpdC5ydW4oWydtZXJnZS1iYXNlJywgJ0hFQUQnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuXG4gICAgY29uc3QgY29tbWl0cyA9IGF3YWl0IGdldENvbW1pdHNJblJhbmdlKGNvbW1vbkFuY2VzdG9yU2hhLCAnSEVBRCcpO1xuXG4gICAgbGV0IHNxdWFzaEZpeHVwcyA9IGNvbW1pdHMuZmlsdGVyKChjb21taXQ6IENvbW1pdCkgPT4gY29tbWl0LmlzRml4dXApLmxlbmd0aCA9PT0gMCA/XG4gICAgICAgIGZhbHNlIDpcbiAgICAgICAgYXdhaXQgcHJvbXB0Q29uZmlybShcbiAgICAgICAgICAgIGBQUiAjJHtwck51bWJlcn0gY29udGFpbnMgZml4dXAgY29tbWl0cywgd291bGQgeW91IGxpa2UgdG8gc3F1YXNoIHRoZW0gZHVyaW5nIHJlYmFzZT9gLFxuICAgICAgICAgICAgdHJ1ZSk7XG5cbiAgICBpbmZvKGBBdHRlbXB0aW5nIHRvIHJlYmFzZSBQUiAjJHtwck51bWJlcn0gb24gJHtmdWxsQmFzZVJlZn1gKTtcblxuICAgIC8qKlxuICAgICAqIFR1cGxlIG9mIGZsYWdzIHRvIGJlIGFkZGVkIHRvIHRoZSByZWJhc2UgY29tbWFuZCBhbmQgZW52IG9iamVjdCB0byBydW4gdGhlIGdpdCBjb21tYW5kLlxuICAgICAqXG4gICAgICogQWRkaXRpb25hbCBmbGFncyB0byBwZXJmb3JtIHRoZSBhdXRvc3F1YXNoaW5nIGFyZSBhZGRlZCB3aGVuIHRoZSB1c2VyIGNvbmZpcm0gc3F1YXNoaW5nIG9mXG4gICAgICogZml4dXAgY29tbWl0cyBzaG91bGQgb2NjdXIuXG4gICAgICovXG4gICAgY29uc3QgW2ZsYWdzLCBlbnZdID0gc3F1YXNoRml4dXBzID9cbiAgICAgICAgW1snLS1pbnRlcmFjdGl2ZScsICctLWF1dG9zcXVhc2gnXSwgey4uLnByb2Nlc3MuZW52LCBHSVRfU0VRVUVOQ0VfRURJVE9SOiAndHJ1ZSd9XSA6XG4gICAgICAgIFtbXSwgdW5kZWZpbmVkXTtcbiAgICBjb25zdCByZWJhc2VSZXN1bHQgPSBnaXQucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAuLi5mbGFncywgJ0ZFVENIX0hFQUQnXSwge2VudjogZW52fSk7XG5cbiAgICAvLyBJZiB0aGUgcmViYXNlIHdhcyBjbGVhbiwgcHVzaCB0aGUgcmViYXNlZCBQUiB1cCB0byB0aGUgYXV0aG9ycyBmb3JrLlxuICAgIGlmIChyZWJhc2VSZXN1bHQuc3RhdHVzID09PSAwKSB7XG4gICAgICBpbmZvKGBSZWJhc2Ugd2FzIGFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0c2ApO1xuICAgICAgaW5mbyhgUHVzaGluZyByZWJhc2VkIFBSICMke3ByTnVtYmVyfSB0byAke2Z1bGxIZWFkUmVmfWApO1xuICAgICAgZ2l0LnJ1bihbJ3B1c2gnLCBoZWFkUmVmVXJsLCBgSEVBRDoke2hlYWRSZWZOYW1lfWAsIGZvcmNlV2l0aExlYXNlRmxhZ10pO1xuICAgICAgaW5mbyhgUmViYXNlZCBhbmQgdXBkYXRlZCBQUiAjJHtwck51bWJlcn1gKTtcbiAgICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIE9uIGF1dG9tYXRpYyByZWJhc2UgZmFpbHVyZXMsIHByb21wdCB0byBjaG9vc2UgaWYgdGhlIHJlYmFzZSBzaG91bGQgYmUgY29udGludWVkXG4gIC8vIG1hbnVhbGx5IG9yIGFib3J0ZWQgbm93LlxuICBpbmZvKGBSZWJhc2Ugd2FzIHVuYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzLmApO1xuICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICBjb25zdCBjb250aW51ZVJlYmFzZSA9XG4gICAgICBwcm9jZXNzLmVudlsnQ0knXSA9PT0gdW5kZWZpbmVkICYmIGF3YWl0IHByb21wdENvbmZpcm0oJ01hbnVhbGx5IGNvbXBsZXRlIHJlYmFzZT8nKTtcblxuICBpZiAoY29udGludWVSZWJhc2UpIHtcbiAgICBpbmZvKGBBZnRlciBtYW51YWxseSBjb21wbGV0aW5nIHJlYmFzZSwgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byB1cGRhdGUgUFIgIyR7cHJOdW1iZXJ9OmApO1xuICAgIGluZm8oYCAkIGdpdCBwdXNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gSEVBRDoke2hlYWRSZWZOYW1lfSAke2ZvcmNlV2l0aExlYXNlRmxhZ31gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgVG8gYWJvcnQgdGhlIHJlYmFzZSBhbmQgcmV0dXJuIHRvIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeSBiZWZvcmUgdGhpcyBjb21tYW5kYCk7XG4gICAgaW5mbyhgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcmViYXNlIC0tYWJvcnQgJiYgZ2l0IHJlc2V0IC0taGFyZCAmJiBnaXQgY2hlY2tvdXQgJHtwcmV2aW91c0JyYW5jaE9yUmV2aXNpb259YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYENsZWFuaW5nIHVwIGdpdCBzdGF0ZSwgYW5kIHJlc3RvcmluZyBwcmV2aW91cyBzdGF0ZS5gKTtcbiAgfVxuXG4gIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=