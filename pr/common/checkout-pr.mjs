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
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { addTokenToGitHttpsUrl } from '../../utils/git/github-urls';
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
        /** The singleton instance of the authenticated git client. */
        const git = AuthenticatedGitClient.get();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUNoRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFFekMsNERBQTREO0FBQzVELE1BQU0sU0FBUyxHQUFHO0lBQ2hCLEtBQUssRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMxQixtQkFBbUIsRUFBRSxZQUFZLENBQUMsT0FBTztJQUN6QyxlQUFlLEVBQUUsWUFBWSxDQUFDLE9BQU87SUFDckMsVUFBVSxFQUFFLFlBQVksQ0FBQyxNQUFNO0lBQy9CLE9BQU8sRUFBRTtRQUNQLElBQUksRUFBRSxZQUFZLENBQUMsTUFBTTtRQUN6QixVQUFVLEVBQUU7WUFDVixHQUFHLEVBQUUsWUFBWSxDQUFDLE1BQU07WUFDeEIsYUFBYSxFQUFFLFlBQVksQ0FBQyxNQUFNO1NBQ25DO0tBQ0Y7SUFDRCxPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0NBQ0YsQ0FBQztBQUdGLE1BQU0sT0FBTywyQkFBNEIsU0FBUSxLQUFLO0lBQ3BELFlBQVksQ0FBUztRQUNuQixLQUFLLENBQUMsQ0FBQyxDQUFDLENB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LElBQUksQ0FBQyxDQUFDO1lBQ3RELENBQUM7U0FDRixDQUFDO0lBQ0osQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhxbFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2FkZFRva2VuVG9HaXRIdHRwc1VybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qIEdyYXBocWwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgYSBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhxbFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWZPaWQ6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuXG5leHBvcnQgY2xhc3MgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobTogc3RyaW5nKSB7XG4gICAgc3VwZXIobSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBPcHRpb25zIGZvciBjaGVja2luZyBvdXQgYSBQUiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdENoZWNrb3V0T3B0aW9ucyB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBzaG91bGQgYmUgY2hlY2tlZCBvdXQgaWYgdGhlIG1haW50YWluZXIgY2Fubm90IG1vZGlmeS4gKi9cbiAgYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrT3V0UHVsbFJlcXVlc3RMb2NhbGx5KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIG9wdHM6IFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zID0ge30pIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcblxuICAvLyBJbiBvcmRlciB0byBwcmVzZXJ2ZSBsb2NhbCBjaGFuZ2VzLCBjaGVja291dHMgY2Fubm90IG9jY3VyIGlmIGxvY2FsIGNoYW5nZXMgYXJlIHByZXNlbnQgaW4gdGhlXG4gIC8vIGdpdCBlbnZpcm9ubWVudC4gQ2hlY2tlZCBiZWZvcmUgcmV0cmlldmluZyB0aGUgUFIgdG8gZmFpbCBmYXN0LlxuICBpZiAoZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgdGhyb3cgbmV3IFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvcignVW5hYmxlIHRvIGNoZWNrb3V0IFBSIGR1ZSB0byB1bmNvbW1pdHRlZCBjaGFuZ2VzLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3IgcmV2aXNpb24gb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybWVkXG4gICAqIGFueSBHaXQgb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICAvKiogVGhlIGJyYW5jaCBuYW1lIG9mIHRoZSBQUiBmcm9tIHRoZSByZXBvc2l0b3J5IHRoZSBQUiBjYW1lIGZyb20uICovXG4gIGNvbnN0IGhlYWRSZWZOYW1lID0gcHIuaGVhZFJlZi5uYW1lO1xuICAvKiogVGhlIGZ1bGwgcmVmIGZvciB0aGUgcmVwb3NpdG9yeSBhbmQgYnJhbmNoIHRoZSBQUiBjYW1lIGZyb20uICovXG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7aGVhZFJlZk5hbWV9YDtcbiAgLyoqIFRoZSBmdWxsIFVSTCBwYXRoIG9mIHRoZSByZXBvc2l0b3J5IHRoZSBQUiBjYW1lIGZyb20gd2l0aCBnaXRodWIgdG9rZW4gYXMgYXV0aGVudGljYXRpb24uICovXG4gIGNvbnN0IGhlYWRSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuICAvLyBOb3RlOiBTaW5jZSB3ZSB1c2UgYSBkZXRhY2hlZCBoZWFkIGZvciByZWJhc2luZyB0aGUgUFIgYW5kIHRoZXJlZm9yZSBkbyBub3QgaGF2ZVxuICAvLyByZW1vdGUtdHJhY2tpbmcgYnJhbmNoZXMgY29uZmlndXJlZCwgd2UgbmVlZCB0byBzZXQgb3VyIGV4cGVjdGVkIHJlZiBhbmQgU0hBLiBUaGlzXG4gIC8vIGFsbG93cyB1cyB0byB1c2UgYC0tZm9yY2Utd2l0aC1sZWFzZWAgZm9yIHRoZSBkZXRhY2hlZCBoZWFkIHdoaWxlIGVuc3VyaW5nIHRoYXQgd2VcbiAgLy8gbmV2ZXIgYWNjaWRlbnRhbGx5IG92ZXJyaWRlIHVwc3RyZWFtIGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gcHVzaGVkIGluIHRoZSBtZWFud2hpbGUuXG4gIC8vIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1wdXNoI0RvY3VtZW50YXRpb24vZ2l0LXB1c2gudHh0LS0tZm9yY2Utd2l0aC1sZWFzZWx0cmVmbmFtZWd0bHRleHBlY3RndFxuICAvKiogRmxhZyBmb3IgYSBmb3JjZSBwdXNoIHdpdGggbGVhZ2UgYmFjayB0byB1cHN0cmVhbS4gKi9cbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yICYmICFvcHRzLmFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5KSB7XG4gICAgdGhyb3cgbmV3IE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvcignUFIgaXMgbm90IHNldCB0byBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgdGhlIFBSJyk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogUHVzaGVzIHRoZSBjdXJyZW50IGxvY2FsIGJyYW5jaCB0byB0aGUgUFIgb24gdGhlIHVwc3RyZWFtIHJlcG9zaXRvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIElmIHRoZSBjb21tYW5kIGRpZCBub3QgZmFpbCBjYXVzaW5nIGEgR2l0Q29tbWFuZEVycm9yIHRvIGJlIHRocm93bi5cbiAgICAgKiBAdGhyb3dzIEdpdENvbW1hbmRFcnJvciBUaHJvd24gd2hlbiB0aGUgcHVzaCBiYWNrIHRvIHVwc3RyZWFtIGZhaWxzLlxuICAgICAqL1xuICAgIHB1c2hUb1Vwc3RyZWFtOiAoKTogdHJ1ZSA9PiB7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIC8qKiBSZXN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIGxvY2FsIHJlcG9zaXRvcnkgdG8gYmVmb3JlIHRoZSBQUiBjaGVja291dCBvY2N1cmVkLiAqL1xuICAgIHJlc2V0R2l0U3RhdGU6ICgpOiBib29sZWFuID0+IHtcbiAgICAgIHJldHVybiBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB9XG4gIH07XG59XG4iXX0=