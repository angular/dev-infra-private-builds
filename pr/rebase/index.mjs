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
import { addTokenToGitHttpsUrl } from '../../utils/git/github-urls';
import { GitClient } from '../../utils/git/index';
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
        /** The singleton instance of the GitClient. */
        const git = GitClient.getAuthenticatedInstance();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBR3ZELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBQyxTQUFTLEVBQWMsTUFBTSxvQkFBb0IsQ0FBQztBQUMxRCxPQUFPLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLCtEQUErRDtBQUMvRCxNQUFNLFNBQVMsR0FBRztJQUNoQixLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDMUIsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLE9BQU87SUFDekMsZUFBZSxFQUFFLFlBQVksQ0FBQyxPQUFPO0lBQ3JDLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMvQixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSxZQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU07U0FD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RjtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQixHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCxtRkFBbUY7UUFDbkYsMkJBQTJCO1FBQzNCLElBQUksQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO1FBQ3ZFLHlGQUF5RjtRQUN6RixNQUFNLGNBQWMsR0FDaEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLEtBQUksTUFBTSxhQUFhLENBQUMsMkJBQTJCLENBQUMsQ0FBQSxDQUFDO1FBRXhGLElBQUksY0FBYyxFQUFFO1lBQ2xCLElBQUksQ0FBQyw2RUFBNkUsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUMvRixJQUFJLENBQUMsZUFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFNBQVMsV0FBVyxJQUFJLGtCQUFrQixFQUFFLENBQUMsQ0FBQztZQUMzRixJQUFJLEVBQUUsQ0FBQztZQUNQLElBQUksQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDO1lBQzFGLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyw2REFBNkQsd0JBQXdCLEVBQUUsQ0FBQyxDQUFDO1lBQzlGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7YUFBTTtZQUNMLElBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1NBQzlEO1FBRUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7Q29tbWl0fSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS91dGlscyc7XG5pbXBvcnQge2dldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCBwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCk7XG4gIGlmIChnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICBlcnJvcignQ2Fubm90IHBlcmZvcm0gcmViYXNlIG9mIFBSIHdpdGggbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogR2V0IHRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuXG4gIGNvbnN0IGhlYWRSZWZOYW1lID0gcHIuaGVhZFJlZi5uYW1lO1xuICBjb25zdCBiYXNlUmVmTmFtZSA9IHByLmJhc2VSZWYubmFtZTtcbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICBjb25zdCBmdWxsQmFzZVJlZiA9IGAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2Jhc2VSZWZOYW1lfWA7XG4gIGNvbnN0IGhlYWRSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuICBjb25zdCBiYXNlUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmJhc2VSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcblxuICAvLyBOb3RlOiBTaW5jZSB3ZSB1c2UgYSBkZXRhY2hlZCBoZWFkIGZvciByZWJhc2luZyB0aGUgUFIgYW5kIHRoZXJlZm9yZSBkbyBub3QgaGF2ZVxuICAvLyByZW1vdGUtdHJhY2tpbmcgYnJhbmNoZXMgY29uZmlndXJlZCwgd2UgbmVlZCB0byBzZXQgb3VyIGV4cGVjdGVkIHJlZiBhbmQgU0hBLiBUaGlzXG4gIC8vIGFsbG93cyB1cyB0byB1c2UgYC0tZm9yY2Utd2l0aC1sZWFzZWAgZm9yIHRoZSBkZXRhY2hlZCBoZWFkIHdoaWxlIGVuc3VyaW5nIHRoYXQgd2VcbiAgLy8gbmV2ZXIgYWNjaWRlbnRhbGx5IG92ZXJyaWRlIHVwc3RyZWFtIGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gcHVzaGVkIGluIHRoZSBtZWFud2hpbGUuXG4gIC8vIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1wdXNoI0RvY3VtZW50YXRpb24vZ2l0LXB1c2gudHh0LS0tZm9yY2Utd2l0aC1sZWFzZWx0cmVmbmFtZWd0bHRleHBlY3RndFxuICBjb25zdCBmb3JjZVdpdGhMZWFzZUZsYWcgPSBgLS1mb3JjZS13aXRoLWxlYXNlPSR7aGVhZFJlZk5hbWV9OiR7cHIuaGVhZFJlZk9pZH1gO1xuXG4gIC8vIElmIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgaXQsIGV4aXQgYXMgdGhlIHJlYmFzZWQgUFIgY2Fubm90XG4gIC8vIGJlIHB1c2hlZCB1cC5cbiAgaWYgKCFwci5tYWludGFpbmVyQ2FuTW9kaWZ5ICYmICFwci52aWV3ZXJEaWRBdXRob3IpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYENhbm5vdCByZWJhc2UgYXMgeW91IGRpZCBub3QgYXV0aG9yIHRoZSBQUiBhbmQgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzYCArXG4gICAgICAgIGB0byBtb2RpZnkgdGhlIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgaGVhZFJlZlVybCwgaGVhZFJlZk5hbWVdKTtcbiAgICBnaXQucnVuKFsnY2hlY2tvdXQnLCAnLXEnLCAnLS1kZXRhY2gnLCAnRkVUQ0hfSEVBRCddKTtcbiAgICAvLyBGZXRjaCB0aGUgUFJzIHRhcmdldCBicmFuY2ggYW5kIHJlYmFzZSBvbnRvIGl0LlxuICAgIGluZm8oYEZldGNoaW5nICR7ZnVsbEJhc2VSZWZ9IHRvIHJlYmFzZSAjJHtwck51bWJlcn0gb25gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBiYXNlUmVmVXJsLCBiYXNlUmVmTmFtZV0pO1xuXG4gICAgY29uc3QgY29tbW9uQW5jZXN0b3JTaGEgPSBnaXQucnVuKFsnbWVyZ2UtYmFzZScsICdIRUFEJywgJ0ZFVENIX0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcblxuICAgIGNvbnN0IGNvbW1pdHMgPSBhd2FpdCBnZXRDb21taXRzSW5SYW5nZShjb21tb25BbmNlc3RvclNoYSwgJ0hFQUQnKTtcblxuICAgIGxldCBzcXVhc2hGaXh1cHMgPSBjb21taXRzLmZpbHRlcigoY29tbWl0OiBDb21taXQpID0+IGNvbW1pdC5pc0ZpeHVwKS5sZW5ndGggPT09IDAgP1xuICAgICAgICBmYWxzZSA6XG4gICAgICAgIGF3YWl0IHByb21wdENvbmZpcm0oXG4gICAgICAgICAgICBgUFIgIyR7cHJOdW1iZXJ9IGNvbnRhaW5zIGZpeHVwIGNvbW1pdHMsIHdvdWxkIHlvdSBsaWtlIHRvIHNxdWFzaCB0aGVtIGR1cmluZyByZWJhc2U/YCxcbiAgICAgICAgICAgIHRydWUpO1xuXG4gICAgaW5mbyhgQXR0ZW1wdGluZyB0byByZWJhc2UgUFIgIyR7cHJOdW1iZXJ9IG9uICR7ZnVsbEJhc2VSZWZ9YCk7XG5cbiAgICAvKipcbiAgICAgKiBUdXBsZSBvZiBmbGFncyB0byBiZSBhZGRlZCB0byB0aGUgcmViYXNlIGNvbW1hbmQgYW5kIGVudiBvYmplY3QgdG8gcnVuIHRoZSBnaXQgY29tbWFuZC5cbiAgICAgKlxuICAgICAqIEFkZGl0aW9uYWwgZmxhZ3MgdG8gcGVyZm9ybSB0aGUgYXV0b3NxdWFzaGluZyBhcmUgYWRkZWQgd2hlbiB0aGUgdXNlciBjb25maXJtIHNxdWFzaGluZyBvZlxuICAgICAqIGZpeHVwIGNvbW1pdHMgc2hvdWxkIG9jY3VyLlxuICAgICAqL1xuICAgIGNvbnN0IFtmbGFncywgZW52XSA9IHNxdWFzaEZpeHVwcyA/XG4gICAgICAgIFtbJy0taW50ZXJhY3RpdmUnLCAnLS1hdXRvc3F1YXNoJ10sIHsuLi5wcm9jZXNzLmVudiwgR0lUX1NFUVVFTkNFX0VESVRPUjogJ3RydWUnfV0gOlxuICAgICAgICBbW10sIHVuZGVmaW5lZF07XG4gICAgY29uc3QgcmViYXNlUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgLi4uZmxhZ3MsICdGRVRDSF9IRUFEJ10sIHtlbnY6IGVudn0pO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LnN0YXR1cyA9PT0gMCkge1xuICAgICAgaW5mbyhgUmViYXNlIHdhcyBhYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHNgKTtcbiAgICAgIGluZm8oYFB1c2hpbmcgcmViYXNlZCBQUiAjJHtwck51bWJlcn0gdG8gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIGluZm8oYFJlYmFzZWQgYW5kIHVwZGF0ZWQgUFIgIyR7cHJOdW1iZXJ9YCk7XG4gICAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGVycm9yKGVyci5tZXNzYWdlKTtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBPbiBhdXRvbWF0aWMgcmViYXNlIGZhaWx1cmVzLCBwcm9tcHQgdG8gY2hvb3NlIGlmIHRoZSByZWJhc2Ugc2hvdWxkIGJlIGNvbnRpbnVlZFxuICAvLyBtYW51YWxseSBvciBhYm9ydGVkIG5vdy5cbiAgaW5mbyhgUmViYXNlIHdhcyB1bmFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0cy5gKTtcbiAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgY29uc3QgY29udGludWVSZWJhc2UgPVxuICAgICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiBhd2FpdCBwcm9tcHRDb25maXJtKCdNYW51YWxseSBjb21wbGV0ZSByZWJhc2U/Jyk7XG5cbiAgaWYgKGNvbnRpbnVlUmViYXNlKSB7XG4gICAgaW5mbyhgQWZ0ZXIgbWFudWFsbHkgY29tcGxldGluZyByZWJhc2UsIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gdXBkYXRlIFBSICMke3ByTnVtYmVyfTpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcHVzaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9IEhFQUQ6JHtoZWFkUmVmTmFtZX0gJHtmb3JjZVdpdGhMZWFzZUZsYWd9YCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFRvIGFib3J0IHRoZSByZWJhc2UgYW5kIHJldHVybiB0byB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnkgYmVmb3JlIHRoaXMgY29tbWFuZGApO1xuICAgIGluZm8oYHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgaW5mbyhgICQgZ2l0IHJlYmFzZSAtLWFib3J0ICYmIGdpdCByZXNldCAtLWhhcmQgJiYgZ2l0IGNoZWNrb3V0ICR7cHJldmlvdXNCcmFuY2hPclJldmlzaW9ufWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBDbGVhbmluZyB1cCBnaXQgc3RhdGUsIGFuZCByZXN0b3JpbmcgcHJldmlvdXMgc3RhdGUuYCk7XG4gIH1cblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19