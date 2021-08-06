"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebasePr = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const utils_1 = require("../../commit-message/utils");
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const github_urls_1 = require("../../utils/git/github-urls");
const github_1 = require("../../utils/github");
/* Graphql schema for the response body for each pending PR. */
const PR_SCHEMA = {
    state: typed_graphqlify_1.types.string,
    maintainerCanModify: typed_graphqlify_1.types.boolean,
    viewerDidAuthor: typed_graphqlify_1.types.boolean,
    headRefOid: typed_graphqlify_1.types.string,
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
};
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
async function rebasePr(prNumber, githubToken, config = config_1.getConfig()) {
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    if (git.hasUncommittedChanges()) {
        console_1.error('Cannot perform rebase of PR with local changes.');
        process.exit(1);
    }
    /**
     * The branch or revision originally checked out before this method performed
     * any Git operations that may change the working branch.
     */
    const previousBranchOrRevision = git.getCurrentBranchOrRevision();
    /* Get the PR information from Github. */
    const pr = await github_1.getPr(PR_SCHEMA, prNumber, git);
    const headRefName = pr.headRef.name;
    const baseRefName = pr.baseRef.name;
    const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
    const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
    const headRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
    const baseRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);
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
        console_1.error(`Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
            `to modify the PR`);
        process.exit(1);
    }
    try {
        // Fetch the branch at the commit of the PR, and check it out in a detached state.
        console_1.info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
        git.run(['fetch', '-q', headRefUrl, headRefName]);
        git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
        // Fetch the PRs target branch and rebase onto it.
        console_1.info(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
        git.run(['fetch', '-q', baseRefUrl, baseRefName]);
        const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
        const commits = await utils_1.getCommitsInRange(commonAncestorSha, 'HEAD');
        let squashFixups = commits.filter((commit) => commit.isFixup).length === 0
            ? false
            : await console_1.promptConfirm(`PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`, true);
        console_1.info(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
        /**
         * Tuple of flags to be added to the rebase command and env object to run the git command.
         *
         * Additional flags to perform the autosquashing are added when the user confirm squashing of
         * fixup commits should occur.
         */
        const [flags, env] = squashFixups
            ? [['--interactive', '--autosquash'], { ...process.env, GIT_SEQUENCE_EDITOR: 'true' }]
            : [[], undefined];
        const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], { env: env });
        // If the rebase was clean, push the rebased PR up to the authors fork.
        if (rebaseResult.status === 0) {
            console_1.info(`Rebase was able to complete automatically without conflicts`);
            console_1.info(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
            git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
            console_1.info(`Rebased and updated PR #${prNumber}`);
            git.checkout(previousBranchOrRevision, true);
            process.exit(0);
        }
    }
    catch (err) {
        console_1.error(err.message);
        git.checkout(previousBranchOrRevision, true);
        process.exit(1);
    }
    // On automatic rebase failures, prompt to choose if the rebase should be continued
    // manually or aborted now.
    console_1.info(`Rebase was unable to complete automatically without conflicts.`);
    // If the command is run in a non-CI environment, prompt to format the files immediately.
    const continueRebase = process.env['CI'] === undefined && (await console_1.promptConfirm('Manually complete rebase?'));
    if (continueRebase) {
        console_1.info(`After manually completing rebase, run the following command to update PR #${prNumber}:`);
        console_1.info(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
        console_1.info();
        console_1.info(`To abort the rebase and return to the state of the repository before this command`);
        console_1.info(`run the following command:`);
        console_1.info(` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`);
        process.exit(1);
    }
    else {
        console_1.info(`Cleaning up git state, and restoring previous state.`);
    }
    git.checkout(previousBranchOrRevision, true);
    process.exit(1);
}
exports.rebasePr = rebasePr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVEQUF1RDtBQUd2RCxzREFBNkQ7QUFDN0QsK0NBQTBEO0FBQzFELGlEQUErRDtBQUMvRCx1RkFBZ0Y7QUFDaEYsNkRBQWtFO0FBQ2xFLCtDQUF5QztBQUV6QywrREFBK0Q7QUFDL0QsTUFBTSxTQUFTLEdBQUc7SUFDaEIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMxQixtQkFBbUIsRUFBRSx3QkFBWSxDQUFDLE9BQU87SUFDekMsZUFBZSxFQUFFLHdCQUFZLENBQUMsT0FBTztJQUNyQyxVQUFVLEVBQUUsd0JBQVksQ0FBQyxNQUFNO0lBQy9CLE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0NBQ0YsQ0FBQztBQUVGOzs7R0FHRztBQUNJLEtBQUssVUFBVSxRQUFRLENBQzVCLFFBQWdCLEVBQ2hCLFdBQW1CLEVBQ25CLFNBQXNDLGtCQUFTLEVBQUU7SUFFakQsOERBQThEO0lBQzlELE1BQU0sR0FBRyxHQUFHLGlEQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3pDLElBQUksR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7UUFDL0IsZUFBSyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7UUFDekQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVEOzs7T0FHRztJQUNILE1BQU0sd0JBQXdCLEdBQUcsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7SUFDbEUseUNBQXlDO0lBQ3pDLE1BQU0sRUFBRSxHQUFHLE1BQU0sY0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakQsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDcEMsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDcEMsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksV0FBVyxFQUFFLENBQUM7SUFDNUUsTUFBTSxXQUFXLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLElBQUksV0FBVyxFQUFFLENBQUM7SUFDNUUsTUFBTSxVQUFVLEdBQUcsbUNBQXFCLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ2pGLE1BQU0sVUFBVSxHQUFHLG1DQUFxQixDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUVqRixtRkFBbUY7SUFDbkYscUZBQXFGO0lBQ3JGLHFGQUFxRjtJQUNyRix1RkFBdUY7SUFDdkYsT0FBTztJQUNQLHVHQUF1RztJQUN2RyxNQUFNLGtCQUFrQixHQUFHLHNCQUFzQixXQUFXLElBQUksRUFBRSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBRWhGLG1GQUFtRjtJQUNuRixnQkFBZ0I7SUFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUU7UUFDbEQsZUFBSyxDQUNILGtGQUFrRjtZQUNoRixrQkFBa0IsQ0FDckIsQ0FBQztRQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJO1FBQ0Ysa0ZBQWtGO1FBQ2xGLGNBQUksQ0FBQyxvQkFBb0IsUUFBUSxTQUFTLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDdEQsa0RBQWtEO1FBQ2xELGNBQUksQ0FBQyxZQUFZLFdBQVcsZUFBZSxRQUFRLEtBQUssQ0FBQyxDQUFDO1FBQzFELEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBRWxELE1BQU0saUJBQWlCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFdEYsTUFBTSxPQUFPLEdBQUcsTUFBTSx5QkFBaUIsQ0FBQyxpQkFBaUIsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVuRSxJQUFJLFlBQVksR0FDZCxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7WUFDN0QsQ0FBQyxDQUFDLEtBQUs7WUFDUCxDQUFDLENBQUMsTUFBTSx1QkFBYSxDQUNqQixPQUFPLFFBQVEsdUVBQXVFLEVBQ3RGLElBQUksQ0FDTCxDQUFDO1FBRVIsY0FBSSxDQUFDLDRCQUE0QixRQUFRLE9BQU8sV0FBVyxFQUFFLENBQUMsQ0FBQztRQUUvRDs7Ozs7V0FLRztRQUNILE1BQU0sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsWUFBWTtZQUMvQixDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxjQUFjLENBQUMsRUFBRSxFQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUMsQ0FBQztZQUNwRixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDcEIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLEtBQUssRUFBRSxZQUFZLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO1FBRXJGLHVFQUF1RTtRQUN2RSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzdCLGNBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO1lBQ3BFLGNBQUksQ0FBQyx1QkFBdUIsUUFBUSxPQUFPLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDMUQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxXQUFXLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDekUsY0FBSSxDQUFDLDJCQUEyQixRQUFRLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNGO0lBQUMsT0FBTyxHQUFHLEVBQUU7UUFDWixlQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELG1GQUFtRjtJQUNuRiwyQkFBMkI7SUFDM0IsY0FBSSxDQUFDLGdFQUFnRSxDQUFDLENBQUM7SUFDdkUseUZBQXlGO0lBQ3pGLE1BQU0sY0FBYyxHQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsSUFBSSxDQUFDLE1BQU0sdUJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7SUFFeEYsSUFBSSxjQUFjLEVBQUU7UUFDbEIsY0FBSSxDQUFDLDZFQUE2RSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQy9GLGNBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsU0FBUyxXQUFXLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO1FBQzNGLGNBQUksRUFBRSxDQUFDO1FBQ1AsY0FBSSxDQUFDLG1GQUFtRixDQUFDLENBQUM7UUFDMUYsY0FBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDbkMsY0FBSSxDQUFDLDZEQUE2RCx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFDOUYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtTQUFNO1FBQ0wsY0FBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7S0FDOUQ7SUFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQW5IRCw0QkFtSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdH0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHthZGRUb2tlblRvR2l0SHR0cHNVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gIHByTnVtYmVyOiBudW1iZXIsXG4gIGdpdGh1YlRva2VuOiBzdHJpbmcsXG4gIGNvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCksXG4pIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcGVyZm9ybSByZWJhc2Ugb2YgUFIgd2l0aCBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yIHJldmlzaW9uIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1lZFxuICAgKiBhbnkgR2l0IG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBHZXQgdGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG5cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIGNvbnN0IGJhc2VSZWZOYW1lID0gcHIuYmFzZVJlZi5uYW1lO1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIGNvbnN0IGZ1bGxCYXNlUmVmID0gYCR7cHIuYmFzZVJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7YmFzZVJlZk5hbWV9YDtcbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIGNvbnN0IGJhc2VSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvcikge1xuICAgIGVycm9yKFxuICAgICAgYENhbm5vdCByZWJhc2UgYXMgeW91IGRpZCBub3QgYXV0aG9yIHRoZSBQUiBhbmQgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzYCArXG4gICAgICAgIGB0byBtb2RpZnkgdGhlIFBSYCxcbiAgICApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBpbmZvKGBGZXRjaGluZyAke2Z1bGxCYXNlUmVmfSB0byByZWJhc2UgIyR7cHJOdW1iZXJ9IG9uYCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgYmFzZVJlZlVybCwgYmFzZVJlZk5hbWVdKTtcblxuICAgIGNvbnN0IGNvbW1vbkFuY2VzdG9yU2hhID0gZ2l0LnJ1bihbJ21lcmdlLWJhc2UnLCAnSEVBRCcsICdGRVRDSF9IRUFEJ10pLnN0ZG91dC50cmltKCk7XG5cbiAgICBjb25zdCBjb21taXRzID0gYXdhaXQgZ2V0Q29tbWl0c0luUmFuZ2UoY29tbW9uQW5jZXN0b3JTaGEsICdIRUFEJyk7XG5cbiAgICBsZXQgc3F1YXNoRml4dXBzID1cbiAgICAgIGNvbW1pdHMuZmlsdGVyKChjb21taXQ6IENvbW1pdCkgPT4gY29tbWl0LmlzRml4dXApLmxlbmd0aCA9PT0gMFxuICAgICAgICA/IGZhbHNlXG4gICAgICAgIDogYXdhaXQgcHJvbXB0Q29uZmlybShcbiAgICAgICAgICAgIGBQUiAjJHtwck51bWJlcn0gY29udGFpbnMgZml4dXAgY29tbWl0cywgd291bGQgeW91IGxpa2UgdG8gc3F1YXNoIHRoZW0gZHVyaW5nIHJlYmFzZT9gLFxuICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICApO1xuXG4gICAgaW5mbyhgQXR0ZW1wdGluZyB0byByZWJhc2UgUFIgIyR7cHJOdW1iZXJ9IG9uICR7ZnVsbEJhc2VSZWZ9YCk7XG5cbiAgICAvKipcbiAgICAgKiBUdXBsZSBvZiBmbGFncyB0byBiZSBhZGRlZCB0byB0aGUgcmViYXNlIGNvbW1hbmQgYW5kIGVudiBvYmplY3QgdG8gcnVuIHRoZSBnaXQgY29tbWFuZC5cbiAgICAgKlxuICAgICAqIEFkZGl0aW9uYWwgZmxhZ3MgdG8gcGVyZm9ybSB0aGUgYXV0b3NxdWFzaGluZyBhcmUgYWRkZWQgd2hlbiB0aGUgdXNlciBjb25maXJtIHNxdWFzaGluZyBvZlxuICAgICAqIGZpeHVwIGNvbW1pdHMgc2hvdWxkIG9jY3VyLlxuICAgICAqL1xuICAgIGNvbnN0IFtmbGFncywgZW52XSA9IHNxdWFzaEZpeHVwc1xuICAgICAgPyBbWyctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCddLCB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ31dXG4gICAgICA6IFtbXSwgdW5kZWZpbmVkXTtcbiAgICBjb25zdCByZWJhc2VSZXN1bHQgPSBnaXQucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAuLi5mbGFncywgJ0ZFVENIX0hFQUQnXSwge2VudjogZW52fSk7XG5cbiAgICAvLyBJZiB0aGUgcmViYXNlIHdhcyBjbGVhbiwgcHVzaCB0aGUgcmViYXNlZCBQUiB1cCB0byB0aGUgYXV0aG9ycyBmb3JrLlxuICAgIGlmIChyZWJhc2VSZXN1bHQuc3RhdHVzID09PSAwKSB7XG4gICAgICBpbmZvKGBSZWJhc2Ugd2FzIGFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0c2ApO1xuICAgICAgaW5mbyhgUHVzaGluZyByZWJhc2VkIFBSICMke3ByTnVtYmVyfSB0byAke2Z1bGxIZWFkUmVmfWApO1xuICAgICAgZ2l0LnJ1bihbJ3B1c2gnLCBoZWFkUmVmVXJsLCBgSEVBRDoke2hlYWRSZWZOYW1lfWAsIGZvcmNlV2l0aExlYXNlRmxhZ10pO1xuICAgICAgaW5mbyhgUmViYXNlZCBhbmQgdXBkYXRlZCBQUiAjJHtwck51bWJlcn1gKTtcbiAgICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIE9uIGF1dG9tYXRpYyByZWJhc2UgZmFpbHVyZXMsIHByb21wdCB0byBjaG9vc2UgaWYgdGhlIHJlYmFzZSBzaG91bGQgYmUgY29udGludWVkXG4gIC8vIG1hbnVhbGx5IG9yIGFib3J0ZWQgbm93LlxuICBpbmZvKGBSZWJhc2Ugd2FzIHVuYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzLmApO1xuICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICBjb25zdCBjb250aW51ZVJlYmFzZSA9XG4gICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnTWFudWFsbHkgY29tcGxldGUgcmViYXNlPycpKTtcblxuICBpZiAoY29udGludWVSZWJhc2UpIHtcbiAgICBpbmZvKGBBZnRlciBtYW51YWxseSBjb21wbGV0aW5nIHJlYmFzZSwgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byB1cGRhdGUgUFIgIyR7cHJOdW1iZXJ9OmApO1xuICAgIGluZm8oYCAkIGdpdCBwdXNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gSEVBRDoke2hlYWRSZWZOYW1lfSAke2ZvcmNlV2l0aExlYXNlRmxhZ31gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgVG8gYWJvcnQgdGhlIHJlYmFzZSBhbmQgcmV0dXJuIHRvIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeSBiZWZvcmUgdGhpcyBjb21tYW5kYCk7XG4gICAgaW5mbyhgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcmViYXNlIC0tYWJvcnQgJiYgZ2l0IHJlc2V0IC0taGFyZCAmJiBnaXQgY2hlY2tvdXQgJHtwcmV2aW91c0JyYW5jaE9yUmV2aXNpb259YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYENsZWFuaW5nIHVwIGdpdCBzdGF0ZSwgYW5kIHJlc3RvcmluZyBwcmV2aW91cyBzdGF0ZS5gKTtcbiAgfVxuXG4gIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=