"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.UnexpectedLocalChangesError = void 0;
const typed_graphqlify_1 = require("typed-graphqlify");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const github_urls_1 = require("../../utils/git/github-urls");
const github_1 = require("../../utils/github");
/* Graphql schema for the response body for a pending PR. */
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
class UnexpectedLocalChangesError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, UnexpectedLocalChangesError.prototype);
    }
}
exports.UnexpectedLocalChangesError = UnexpectedLocalChangesError;
class MaintainerModifyAccessError extends Error {
    constructor(m) {
        super(m);
        Object.setPrototypeOf(this, MaintainerModifyAccessError.prototype);
    }
}
exports.MaintainerModifyAccessError = MaintainerModifyAccessError;
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 */
async function checkOutPullRequestLocally(prNumber, githubToken, opts = {}) {
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    // In order to preserve local changes, checkouts cannot occur if local changes are present in the
    // git environment. Checked before retrieving the PR to fail fast.
    if (git.hasUncommittedChanges()) {
        throw new UnexpectedLocalChangesError('Unable to checkout PR due to uncommitted changes.');
    }
    /**
     * The branch or revision originally checked out before this method performed
     * any Git operations that may change the working branch.
     */
    const previousBranchOrRevision = git.getCurrentBranchOrRevision();
    /* The PR information from Github. */
    const pr = await github_1.getPr(PR_SCHEMA, prNumber, git);
    /** The branch name of the PR from the repository the PR came from. */
    const headRefName = pr.headRef.name;
    /** The full ref for the repository and branch the PR came from. */
    const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
    /** The full URL path of the repository the PR came from with github token as authentication. */
    const headRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
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
        console_1.info(`Checking out PR #${prNumber} from ${fullHeadRef}`);
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
        },
    };
}
exports.checkOutPullRequestLocally = checkOutPullRequestLocally;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVEQUF1RDtBQUV2RCxpREFBeUM7QUFDekMsdUZBQWdGO0FBQ2hGLDZEQUFrRTtBQUNsRSwrQ0FBeUM7QUFFekMsNERBQTREO0FBQzVELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO0lBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87SUFDckMsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMvQixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtDQUNGLENBQUM7QUFFRixNQUFhLDJCQUE0QixTQUFRLEtBQUs7SUFDcEQsWUFBWSxDQUFTO1FBQ25CLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JFLENBQUM7Q0FDRjtBQUxELGtFQUtDO0FBRUQsTUFBYSwyQkFBNEIsU0FBUSxLQUFLO0lBQ3BELFlBQVksQ0FBUztRQUNuQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRSxDQUFDO0NBQ0Y7QUFMRCxrRUFLQztBQVFEOzs7R0FHRztBQUNJLEtBQUssVUFBVSwwQkFBMEIsQ0FDOUMsUUFBZ0IsRUFDaEIsV0FBbUIsRUFDbkIsT0FBbUMsRUFBRTtJQUVyQyw4REFBOEQ7SUFDOUQsTUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFekMsaUdBQWlHO0lBQ2pHLGtFQUFrRTtJQUNsRSxJQUFJLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1FBQy9CLE1BQU0sSUFBSSwyQkFBMkIsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO0tBQzVGO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUNsRSxxQ0FBcUM7SUFDckMsTUFBTSxFQUFFLEdBQUcsTUFBTSxjQUFLLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRCxzRUFBc0U7SUFDdEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDcEMsbUVBQW1FO0lBQ25FLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQzVFLGdHQUFnRztJQUNoRyxNQUFNLFVBQVUsR0FBRyxtQ0FBcUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDakYsbUZBQW1GO0lBQ25GLHFGQUFxRjtJQUNyRixxRkFBcUY7SUFDckYsdUZBQXVGO0lBQ3ZGLE9BQU87SUFDUCx1R0FBdUc7SUFDdkcseURBQXlEO0lBQ3pELE1BQU0sa0JBQWtCLEdBQUcsc0JBQXNCLFdBQVcsSUFBSSxFQUFFLENBQUMsVUFBVSxFQUFFLENBQUM7SUFFaEYsbUZBQW1GO0lBQ25GLGdCQUFnQjtJQUNoQixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTtRQUN6RixNQUFNLElBQUksMkJBQTJCLENBQUMscURBQXFELENBQUMsQ0FBQztLQUM5RjtJQUVELElBQUk7UUFDRixrRkFBa0Y7UUFDbEYsY0FBSSxDQUFDLG9CQUFvQixRQUFRLFNBQVMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNsRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO0tBQ2pEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzdDLE1BQU0sQ0FBQyxDQUFDO0tBQ1Q7SUFFRCxPQUFPO1FBQ0w7Ozs7O1dBS0c7UUFDSCxjQUFjLEVBQUUsR0FBUyxFQUFFO1lBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsV0FBVyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO1lBQ3pFLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELG9GQUFvRjtRQUNwRixhQUFhLEVBQUUsR0FBWSxFQUFFO1lBQzNCLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN0RCxDQUFDO0tBQ0YsQ0FBQztBQUNKLENBQUM7QUFwRUQsZ0VBb0VDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2FkZFRva2VuVG9HaXRIdHRwc1VybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgYSBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWZPaWQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuZXhwb3J0IGNsYXNzIFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobTogc3RyaW5nKSB7XG4gICAgc3VwZXIobSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuICAgIHN1cGVyKG0pO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG4vKiogT3B0aW9ucyBmb3IgY2hlY2tpbmcgb3V0IGEgUFIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMge1xuICAvKiogV2hldGhlciB0aGUgUFIgc2hvdWxkIGJlIGNoZWNrZWQgb3V0IGlmIHRoZSBtYWludGFpbmVyIGNhbm5vdCBtb2RpZnkuICovXG4gIGFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBSZWJhc2UgdGhlIHByb3ZpZGVkIFBSIG9udG8gaXRzIG1lcmdlIHRhcmdldCBicmFuY2gsIGFuZCBwdXNoIHVwIHRoZSByZXN1bHRpbmdcbiAqIGNvbW1pdCB0byB0aGUgUFJzIHJlcG9zaXRvcnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseShcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgZ2l0aHViVG9rZW46IHN0cmluZyxcbiAgb3B0czogUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMgPSB7fSxcbikge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuXG4gIC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIGxvY2FsIGNoYW5nZXMsIGNoZWNrb3V0cyBjYW5ub3Qgb2NjdXIgaWYgbG9jYWwgY2hhbmdlcyBhcmUgcHJlc2VudCBpbiB0aGVcbiAgLy8gZ2l0IGVudmlyb25tZW50LiBDaGVja2VkIGJlZm9yZSByZXRyaWV2aW5nIHRoZSBQUiB0byBmYWlsIGZhc3QuXG4gIGlmIChnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICB0aHJvdyBuZXcgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yKCdVbmFibGUgdG8gY2hlY2tvdXQgUFIgZHVlIHRvIHVuY29tbWl0dGVkIGNoYW5nZXMuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogVGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gIC8qKiBUaGUgYnJhbmNoIG5hbWUgb2YgdGhlIFBSIGZyb20gdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIC8qKiBUaGUgZnVsbCByZWYgZm9yIHRoZSByZXBvc2l0b3J5IGFuZCBicmFuY2ggdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICAvKiogVGhlIGZ1bGwgVVJMIHBhdGggb2YgdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbSB3aXRoIGdpdGh1YiB0b2tlbiBhcyBhdXRoZW50aWNhdGlvbi4gKi9cbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIC8qKiBGbGFnIGZvciBhIGZvcmNlIHB1c2ggd2l0aCBsZWFnZSBiYWNrIHRvIHVwc3RyZWFtLiAqL1xuICBjb25zdCBmb3JjZVdpdGhMZWFzZUZsYWcgPSBgLS1mb3JjZS13aXRoLWxlYXNlPSR7aGVhZFJlZk5hbWV9OiR7cHIuaGVhZFJlZk9pZH1gO1xuXG4gIC8vIElmIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgaXQsIGV4aXQgYXMgdGhlIHJlYmFzZWQgUFIgY2Fubm90XG4gIC8vIGJlIHB1c2hlZCB1cC5cbiAgaWYgKCFwci5tYWludGFpbmVyQ2FuTW9kaWZ5ICYmICFwci52aWV3ZXJEaWRBdXRob3IgJiYgIW9wdHMuYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnkpIHtcbiAgICB0aHJvdyBuZXcgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yKCdQUiBpcyBub3Qgc2V0IHRvIGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSB0aGUgUFInKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgbG9jYWwgYnJhbmNoIHRvIHRoZSBQUiBvbiB0aGUgdXBzdHJlYW0gcmVwb3NpdG9yeS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHRydWUgSWYgdGhlIGNvbW1hbmQgZGlkIG5vdCBmYWlsIGNhdXNpbmcgYSBHaXRDb21tYW5kRXJyb3IgdG8gYmUgdGhyb3duLlxuICAgICAqIEB0aHJvd3MgR2l0Q29tbWFuZEVycm9yIFRocm93biB3aGVuIHRoZSBwdXNoIGJhY2sgdG8gdXBzdHJlYW0gZmFpbHMuXG4gICAgICovXG4gICAgcHVzaFRvVXBzdHJlYW06ICgpOiB0cnVlID0+IHtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgLyoqIFJlc3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbG9jYWwgcmVwb3NpdG9yeSB0byBiZWZvcmUgdGhlIFBSIGNoZWNrb3V0IG9jY3VyZWQuICovXG4gICAgcmVzZXRHaXRTdGF0ZTogKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgcmV0dXJuIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIH0sXG4gIH07XG59XG4iXX0=