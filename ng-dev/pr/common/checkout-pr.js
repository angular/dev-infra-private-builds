"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.PullRequestNotFoundError = exports.UnexpectedLocalChangesError = void 0;
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
/** Error being thrown if there are unexpected local changes in the project repo. */
class UnexpectedLocalChangesError extends Error {
}
exports.UnexpectedLocalChangesError = UnexpectedLocalChangesError;
/** Error being thrown if a requested pull request could not be found upstream. */
class PullRequestNotFoundError extends Error {
}
exports.PullRequestNotFoundError = PullRequestNotFoundError;
/** Error being thrown if the pull request does not allow for maintainer modifications. */
class MaintainerModifyAccessError extends Error {
}
exports.MaintainerModifyAccessError = MaintainerModifyAccessError;
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 *
 * @throws {UnexpectedLocalChangesError} If the pull request cannot be checked out
 *   due to uncommitted local changes.
 * @throws {PullRequestNotFoundError} If the pull request cannot be checked out
 *   because it is unavailable on Github.
 * @throws {MaintainerModifyAccessError} If the pull request does not allow maintainers
 *   to modify a pull request. Skipped if `allowIfMaintainerCannotModify` is set.
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
    /** The PR information from Github. */
    const pr = await (0, github_1.getPr)(PR_SCHEMA, prNumber, git);
    if (pr === null) {
        throw new PullRequestNotFoundError(`Pull request #${prNumber} could not be found.`);
    }
    /** The branch name of the PR from the repository the PR came from. */
    const headRefName = pr.headRef.name;
    /** The full ref for the repository and branch the PR came from. */
    const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
    /** The full URL path of the repository the PR came from with github token as authentication. */
    const headRefUrl = (0, github_urls_1.addTokenToGitHttpsUrl)(pr.headRef.repository.url, githubToken);
    // Note: Since we use a detached head for rebasing the PR and therefore do not have
    // remote-tracking branches configured, we need to set our expected ref and SHA. This
    // allows us to use `--force-with-lease` for the detached head while ensuring that we
    // never accidentally override upstream changes that have been pushed in the meanwhile.
    // See:
    // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
    /** Flag for a force push with lease back to upstream. */
    const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
    // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
    // be pushed up.
    if (!pr.maintainerCanModify && !pr.viewerDidAuthor && !opts.allowIfMaintainerCannotModify) {
        throw new MaintainerModifyAccessError('PR is not set to allow maintainers to modify the PR');
    }
    try {
        // Fetch the branch at the commit of the PR, and check it out in a detached state.
        (0, console_1.info)(`Checking out PR #${prNumber} from ${fullHeadRef}`);
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
         * @throws {GitCommandError} Thrown when the push back to upstream fails.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHVEQUF1RDtBQUV2RCxpREFBeUM7QUFDekMsdUZBQWdGO0FBQ2hGLDZEQUFrRTtBQUNsRSwrQ0FBeUM7QUFFekMsNERBQTREO0FBQzVELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07SUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO0lBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87SUFDckMsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtJQUMvQixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtDQUNGLENBQUM7QUFFRixvRkFBb0Y7QUFDcEYsTUFBYSwyQkFBNEIsU0FBUSxLQUFLO0NBQUc7QUFBekQsa0VBQXlEO0FBQ3pELGtGQUFrRjtBQUNsRixNQUFhLHdCQUF5QixTQUFRLEtBQUs7Q0FBRztBQUF0RCw0REFBc0Q7QUFDdEQsMEZBQTBGO0FBQzFGLE1BQWEsMkJBQTRCLFNBQVEsS0FBSztDQUFHO0FBQXpELGtFQUF5RDtBQVF6RDs7Ozs7Ozs7OztHQVVHO0FBQ0ksS0FBSyxVQUFVLDBCQUEwQixDQUM5QyxRQUFnQixFQUNoQixXQUFtQixFQUNuQixPQUFtQyxFQUFFO0lBRXJDLDhEQUE4RDtJQUM5RCxNQUFNLEdBQUcsR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUV6QyxpR0FBaUc7SUFDakcsa0VBQWtFO0lBQ2xFLElBQUksR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7UUFDL0IsTUFBTSxJQUFJLDJCQUEyQixDQUFDLG1EQUFtRCxDQUFDLENBQUM7S0FDNUY7SUFFRDs7O09BR0c7SUFDSCxNQUFNLHdCQUF3QixHQUFHLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQ2xFLHNDQUFzQztJQUN0QyxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUEsY0FBSyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakQsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ2YsTUFBTSxJQUFJLHdCQUF3QixDQUFDLGlCQUFpQixRQUFRLHNCQUFzQixDQUFDLENBQUM7S0FDckY7SUFFRCxzRUFBc0U7SUFDdEUsTUFBTSxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDcEMsbUVBQW1FO0lBQ25FLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQzVFLGdHQUFnRztJQUNoRyxNQUFNLFVBQVUsR0FBRyxJQUFBLG1DQUFxQixFQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRixtRkFBbUY7SUFDbkYscUZBQXFGO0lBQ3JGLHFGQUFxRjtJQUNyRix1RkFBdUY7SUFDdkYsT0FBTztJQUNQLHVHQUF1RztJQUN2Ryx5REFBeUQ7SUFDekQsTUFBTSxrQkFBa0IsR0FBRyxzQkFBc0IsV0FBVyxJQUFJLEVBQUUsQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUVoRixtRkFBbUY7SUFDbkYsZ0JBQWdCO0lBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFO1FBQ3pGLE1BQU0sSUFBSSwyQkFBMkIsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0tBQzlGO0lBRUQsSUFBSTtRQUNGLGtGQUFrRjtRQUNsRixJQUFBLGNBQUksRUFBQyxvQkFBb0IsUUFBUSxTQUFTLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztLQUNqRDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsQ0FBQztLQUNUO0lBRUQsT0FBTztRQUNMOzs7OztXQUtHO1FBQ0gsY0FBYyxFQUFFLEdBQVMsRUFBRTtZQUN6QixHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLFdBQVcsRUFBRSxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQztZQUN6RSxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxvRkFBb0Y7UUFDcEYsYUFBYSxFQUFFLEdBQVksRUFBRTtZQUMzQixPQUFPLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEQsQ0FBQztLQUNGLENBQUM7QUFDSixDQUFDO0FBekVELGdFQXlFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHthZGRUb2tlblRvR2l0SHR0cHNVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGEgcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKiBFcnJvciBiZWluZyB0aHJvd24gaWYgdGhlcmUgYXJlIHVuZXhwZWN0ZWQgbG9jYWwgY2hhbmdlcyBpbiB0aGUgcHJvamVjdCByZXBvLiAqL1xuZXhwb3J0IGNsYXNzIFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvciBleHRlbmRzIEVycm9yIHt9XG4vKiogRXJyb3IgYmVpbmcgdGhyb3duIGlmIGEgcmVxdWVzdGVkIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQgdXBzdHJlYW0uICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3ROb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige31cbi8qKiBFcnJvciBiZWluZyB0aHJvd24gaWYgdGhlIHB1bGwgcmVxdWVzdCBkb2VzIG5vdCBhbGxvdyBmb3IgbWFpbnRhaW5lciBtb2RpZmljYXRpb25zLiAqL1xuZXhwb3J0IGNsYXNzIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKiBPcHRpb25zIGZvciBjaGVja2luZyBvdXQgYSBQUiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdENoZWNrb3V0T3B0aW9ucyB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBzaG91bGQgYmUgY2hlY2tlZCBvdXQgaWYgdGhlIG1haW50YWluZXIgY2Fubm90IG1vZGlmeS4gKi9cbiAgYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqXG4gKiBAdGhyb3dzIHtVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3J9IElmIHRoZSBwdWxsIHJlcXVlc3QgY2Fubm90IGJlIGNoZWNrZWQgb3V0XG4gKiAgIGR1ZSB0byB1bmNvbW1pdHRlZCBsb2NhbCBjaGFuZ2VzLlxuICogQHRocm93cyB7UHVsbFJlcXVlc3ROb3RGb3VuZEVycm9yfSBJZiB0aGUgcHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBjaGVja2VkIG91dFxuICogICBiZWNhdXNlIGl0IGlzIHVuYXZhaWxhYmxlIG9uIEdpdGh1Yi5cbiAqIEB0aHJvd3Mge01haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvcn0gSWYgdGhlIHB1bGwgcmVxdWVzdCBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVyc1xuICogICB0byBtb2RpZnkgYSBwdWxsIHJlcXVlc3QuIFNraXBwZWQgaWYgYGFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5YCBpcyBzZXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseShcbiAgcHJOdW1iZXI6IG51bWJlcixcbiAgZ2l0aHViVG9rZW46IHN0cmluZyxcbiAgb3B0czogUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMgPSB7fSxcbikge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuXG4gIC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIGxvY2FsIGNoYW5nZXMsIGNoZWNrb3V0cyBjYW5ub3Qgb2NjdXIgaWYgbG9jYWwgY2hhbmdlcyBhcmUgcHJlc2VudCBpbiB0aGVcbiAgLy8gZ2l0IGVudmlyb25tZW50LiBDaGVja2VkIGJlZm9yZSByZXRyaWV2aW5nIHRoZSBQUiB0byBmYWlsIGZhc3QuXG4gIGlmIChnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICB0aHJvdyBuZXcgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yKCdVbmFibGUgdG8gY2hlY2tvdXQgUFIgZHVlIHRvIHVuY29tbWl0dGVkIGNoYW5nZXMuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyoqIFRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuXG4gIGlmIChwciA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBQdWxsUmVxdWVzdE5vdEZvdW5kRXJyb3IoYFB1bGwgcmVxdWVzdCAjJHtwck51bWJlcn0gY291bGQgbm90IGJlIGZvdW5kLmApO1xuICB9XG5cbiAgLyoqIFRoZSBicmFuY2ggbmFtZSBvZiB0aGUgUFIgZnJvbSB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgLyoqIFRoZSBmdWxsIHJlZiBmb3IgdGhlIHJlcG9zaXRvcnkgYW5kIGJyYW5jaCB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIC8qKiBUaGUgZnVsbCBVUkwgcGF0aCBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tIHdpdGggZ2l0aHViIHRva2VuIGFzIGF1dGhlbnRpY2F0aW9uLiAqL1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgLyoqIEZsYWcgZm9yIGEgZm9yY2UgcHVzaCB3aXRoIGxlYXNlIGJhY2sgdG8gdXBzdHJlYW0uICovXG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvciAmJiAhb3B0cy5hbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeSkge1xuICAgIHRocm93IG5ldyBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IoJ1BSIGlzIG5vdCBzZXQgdG8gYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IHRoZSBQUicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgaGVhZFJlZlVybCwgaGVhZFJlZk5hbWVdKTtcbiAgICBnaXQucnVuKFsnY2hlY2tvdXQnLCAnLS1kZXRhY2gnLCAnRkVUQ0hfSEVBRCddKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIHRocm93IGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyB0aGUgY3VycmVudCBsb2NhbCBicmFuY2ggdG8gdGhlIFBSIG9uIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgdHJ1ZSBJZiB0aGUgY29tbWFuZCBkaWQgbm90IGZhaWwgY2F1c2luZyBhIEdpdENvbW1hbmRFcnJvciB0byBiZSB0aHJvd24uXG4gICAgICogQHRocm93cyB7R2l0Q29tbWFuZEVycm9yfSBUaHJvd24gd2hlbiB0aGUgcHVzaCBiYWNrIHRvIHVwc3RyZWFtIGZhaWxzLlxuICAgICAqL1xuICAgIHB1c2hUb1Vwc3RyZWFtOiAoKTogdHJ1ZSA9PiB7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIC8qKiBSZXN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIGxvY2FsIHJlcG9zaXRvcnkgdG8gYmVmb3JlIHRoZSBQUiBjaGVja291dCBvY2N1cmVkLiAqL1xuICAgIHJlc2V0R2l0U3RhdGU6ICgpOiBib29sZWFuID0+IHtcbiAgICAgIHJldHVybiBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB9LFxuICB9O1xufVxuIl19