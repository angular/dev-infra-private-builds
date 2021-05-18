/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { types as graphqlTypes } from 'typed-graphqlify';
import { info } from '../../utils/console';
import { addTokenToGitHttpsUrl } from '../../utils/git/github-urls';
import { GitClient } from '../../utils/git/index';
import { getPr } from '../../utils/github';
/* Graphql schema for the response body for a pending PR. */
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
export class UnexpectedLocalChangesError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, UnexpectedLocalChangesError.prototype);
    }
}
export class MaintainerModifyAccessError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, MaintainerModifyAccessError.prototype);
    }
}
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
export function checkOutPullRequestLocally(prNumber, githubToken, opts = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        /** The singleton instance of the GitClient. */
        const git = GitClient.getAuthenticatedInstance();
        // In order to preserve local changes, checkouts cannot occur if local changes are present in the
        // git environment. Checked before retrieving the PR to fail fast.
        if (git.hasLocalChanges()) {
            throw new UnexpectedLocalChangesError('Unable to checkout PR due to uncommitted changes.');
        }
        /**
         * The branch or revision originally checked out before this method performed
         * any Git operations that may change the working branch.
         */
        const previousBranchOrRevision = git.getCurrentBranchOrRevision();
        /* The PR information from Github. */
        const pr = yield getPr(PR_SCHEMA, prNumber, git);
        /** The branch name of the PR from the repository the PR came from. */
        const headRefName = pr.headRef.name;
        /** The full ref for the repository and branch the PR came from. */
        const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
        /** The full URL path of the repository the PR came from with github token as authentication. */
        const headRefUrl = addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
        // Note: Since we use a detached head for rebasing the PR and therefore do not have
        // remote-tracking branches configured, we need to set our expected ref and SHA. This
        // allows us to use `--force-with-lease` for the detached head while ensuring that we
        // never accidentally override upstream changes that have been pushed in the meanwhile.
        // See:
        // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
        /** Flag for a force push with leage back to upstream. */
        const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
        // be pushed up.
        if (!pr.maintainerCanModify && !pr.viewerDidAuthor && !opts.allowIfMaintainerCannotModify) {
            throw new MaintainerModifyAccessError('PR is not set to allow maintainers to modify the PR');
        }
        try {
            // Fetch the branch at the commit of the PR, and check it out in a detached state.
            info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
            git.run(['fetch', '-q', headRefUrl, headRefName]);
            git.run(['checkout', '--detach', 'FETCH_HEAD']);
        }
        catch (e) {
            git.checkout(previousBranchOrRevision, true);
            throw e;
        }
        return {
            /**
             * Pushes the current local branch to the PR on the upstream repository.
             *
             * @returns true If the command did not fail causing a GitCommandError to be thrown.
             * @throws GitCommandError Thrown when the push back to upstream fails.
             */
            pushToUpstream: () => {
                git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
                return true;
            },
            /** Restores the state of the local repository to before the PR checkout occured. */
            resetGitState: () => {
                return git.checkout(previousBranchOrRevision, true);
            }
        };
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLDREQUE0RDtBQUM1RCxNQUFNLFNBQVMsR0FBRztJQUNoQixLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDMUIsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLE9BQU87SUFDekMsZUFBZSxFQUFFLFlBQVksQ0FBQyxPQUFPO0lBQ3JDLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMvQixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSxZQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtDQUNGLENBQUM7QUFHRixNQUFNLE9BQU8sMkJBQTRCLFNBQVEsS0FBSztJQUNwRCxZQUFZLENBQVM7UUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFD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SSxDQUFDLENBQUM7WUFDdEQsQ0FBQztTQUNGLENBQUM7SUFDSixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHthZGRUb2tlblRvR2l0SHR0cHNVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgYSBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWZPaWQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuXG5leHBvcnQgY2xhc3MgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobTogc3RyaW5nKSB7XG4gICAgc3VwZXIobSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBPcHRpb25zIGZvciBjaGVja2luZyBvdXQgYSBQUiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdENoZWNrb3V0T3B0aW9ucyB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBzaG91bGQgYmUgY2hlY2tlZCBvdXQgaWYgdGhlIG1haW50YWluZXIgY2Fubm90IG1vZGlmeS4gKi9cbiAgYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrT3V0UHVsbFJlcXVlc3RMb2NhbGx5KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIG9wdHM6IFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zID0ge30pIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIEdpdENsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpO1xuXG4gIC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIGxvY2FsIGNoYW5nZXMsIGNoZWNrb3V0cyBjYW5ub3Qgb2NjdXIgaWYgbG9jYWwgY2hhbmdlcyBhcmUgcHJlc2VudCBpbiB0aGVcbiAgLy8gZ2l0IGVudmlyb25tZW50LiBDaGVja2VkIGJlZm9yZSByZXRyaWV2aW5nIHRoZSBQUiB0byBmYWlsIGZhc3QuXG4gIGlmIChnaXQuaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICB0aHJvdyBuZXcgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yKCdVbmFibGUgdG8gY2hlY2tvdXQgUFIgZHVlIHRvIHVuY29tbWl0dGVkIGNoYW5nZXMuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogVGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gIC8qKiBUaGUgYnJhbmNoIG5hbWUgb2YgdGhlIFBSIGZyb20gdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIC8qKiBUaGUgZnVsbCByZWYgZm9yIHRoZSByZXBvc2l0b3J5IGFuZCBicmFuY2ggdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICAvKiogVGhlIGZ1bGwgVVJMIHBhdGggb2YgdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbSB3aXRoIGdpdGh1YiB0b2tlbiBhcyBhdXRoZW50aWNhdGlvbi4gKi9cbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIC8qKiBGbGFnIGZvciBhIGZvcmNlIHB1c2ggd2l0aCBsZWFnZSBiYWNrIHRvIHVwc3RyZWFtLiAqL1xuICBjb25zdCBmb3JjZVdpdGhMZWFzZUZsYWcgPSBgLS1mb3JjZS13aXRoLWxlYXNlPSR7aGVhZFJlZk5hbWV9OiR7cHIuaGVhZFJlZk9pZH1gO1xuXG4gIC8vIElmIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgaXQsIGV4aXQgYXMgdGhlIHJlYmFzZWQgUFIgY2Fubm90XG4gIC8vIGJlIHB1c2hlZCB1cC5cbiAgaWYgKCFwci5tYWludGFpbmVyQ2FuTW9kaWZ5ICYmICFwci52aWV3ZXJEaWRBdXRob3IgJiYgIW9wdHMuYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnkpIHtcbiAgICB0aHJvdyBuZXcgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yKCdQUiBpcyBub3Qgc2V0IHRvIGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSB0aGUgUFInKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgbG9jYWwgYnJhbmNoIHRvIHRoZSBQUiBvbiB0aGUgdXBzdHJlYW0gcmVwb3NpdG9yeS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHRydWUgSWYgdGhlIGNvbW1hbmQgZGlkIG5vdCBmYWlsIGNhdXNpbmcgYSBHaXRDb21tYW5kRXJyb3IgdG8gYmUgdGhyb3duLlxuICAgICAqIEB0aHJvd3MgR2l0Q29tbWFuZEVycm9yIFRocm93biB3aGVuIHRoZSBwdXNoIGJhY2sgdG8gdXBzdHJlYW0gZmFpbHMuXG4gICAgICovXG4gICAgcHVzaFRvVXBzdHJlYW06ICgpOiB0cnVlID0+IHtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgLyoqIFJlc3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbG9jYWwgcmVwb3NpdG9yeSB0byBiZWZvcmUgdGhlIFBSIGNoZWNrb3V0IG9jY3VyZWQuICovXG4gICAgcmVzZXRHaXRTdGF0ZTogKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgcmV0dXJuIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==