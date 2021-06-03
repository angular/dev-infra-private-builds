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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsS0FBSyxJQUFJLFlBQVksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZELE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN6QyxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUNsRSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFDaEQsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBRXpDLDREQUE0RDtBQUM1RCxNQUFNLFNBQVMsR0FBRztJQUNoQixLQUFLLEVBQUUsWUFBWSxDQUFDLE1BQU07SUFDMUIsbUJBQW1CLEVBQUUsWUFBWSxDQUFDLE9BQU87SUFDekMsZUFBZSxFQUFFLFlBQVksQ0FBQyxPQUFPO0lBQ3JDLFVBQVUsRUFBRSxZQUFZLENBQUMsTUFBTTtJQUMvQixPQUFPLEVBQUU7UUFDUCxJQUFJLEVBQUUsWUFBWSxDQUFDLE1BQU07UUFDekIsVUFBVSxFQUFFO1lBQ1YsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNO1lBQ3hCLGFBQWEsRUFBRSxZQUFZLENBQUMsTUFBTTtTQUNuQztLQUNGO0lBQ0QsT0FBTyxFQUFFO1FBQ1AsSUFBSSxFQUFFLFlBQVksQ0FBQyxNQUFNO1FBQ3pCLFVBQVUsRUFBRTtZQUNWLEdBQUcsRUFBRSxZQUFZLENBQUMsTUFBTTtZQUN4QixhQUFhLEVBQUUsWUFBWSxDQUFDLE1BQU07U0FDbkM7S0FDRjtDQUNGLENBQUM7QUFHRixNQUFNLE9BQU8sMkJBQTRCLFNBQVEsS0FBSztJQUNwRCxZQUFZLENBQVM7UUFDbkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFD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QUFJLENBQUMsQ0FBQztZQUN0RCxDQUFDO1NBQ0YsQ0FBQztJQUNKLENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGVzIGFzIGdyYXBocWxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2FkZFRva2VuVG9HaXRIdHRwc1VybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBhIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHN0YXRlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuICAgIHN1cGVyKG0pO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIE9wdGlvbnMgZm9yIGNoZWNraW5nIG91dCBhIFBSICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIHNob3VsZCBiZSBjaGVja2VkIG91dCBpZiB0aGUgbWFpbnRhaW5lciBjYW5ub3QgbW9kaWZ5LiAqL1xuICBhbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tPdXRQdWxsUmVxdWVzdExvY2FsbHkoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgb3B0czogUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMgPSB7fSkge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCk7XG5cbiAgLy8gSW4gb3JkZXIgdG8gcHJlc2VydmUgbG9jYWwgY2hhbmdlcywgY2hlY2tvdXRzIGNhbm5vdCBvY2N1ciBpZiBsb2NhbCBjaGFuZ2VzIGFyZSBwcmVzZW50IGluIHRoZVxuICAvLyBnaXQgZW52aXJvbm1lbnQuIENoZWNrZWQgYmVmb3JlIHJldHJpZXZpbmcgdGhlIFBSIHRvIGZhaWwgZmFzdC5cbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIHRocm93IG5ldyBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IoJ1VuYWJsZSB0byBjaGVja291dCBQUiBkdWUgdG8gdW5jb21taXR0ZWQgY2hhbmdlcy4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yIHJldmlzaW9uIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1lZFxuICAgKiBhbnkgR2l0IG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBUaGUgUFIgaW5mb3JtYXRpb24gZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByID0gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbiAgLyoqIFRoZSBicmFuY2ggbmFtZSBvZiB0aGUgUFIgZnJvbSB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgLyoqIFRoZSBmdWxsIHJlZiBmb3IgdGhlIHJlcG9zaXRvcnkgYW5kIGJyYW5jaCB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIC8qKiBUaGUgZnVsbCBVUkwgcGF0aCBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tIHdpdGggZ2l0aHViIHRva2VuIGFzIGF1dGhlbnRpY2F0aW9uLiAqL1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgLyoqIEZsYWcgZm9yIGEgZm9yY2UgcHVzaCB3aXRoIGxlYWdlIGJhY2sgdG8gdXBzdHJlYW0uICovXG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvciAmJiAhb3B0cy5hbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeSkge1xuICAgIHRocm93IG5ldyBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IoJ1BSIGlzIG5vdCBzZXQgdG8gYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IHRoZSBQUicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgaGVhZFJlZlVybCwgaGVhZFJlZk5hbWVdKTtcbiAgICBnaXQucnVuKFsnY2hlY2tvdXQnLCAnLS1kZXRhY2gnLCAnRkVUQ0hfSEVBRCddKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIHRocm93IGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyB0aGUgY3VycmVudCBsb2NhbCBicmFuY2ggdG8gdGhlIFBSIG9uIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgdHJ1ZSBJZiB0aGUgY29tbWFuZCBkaWQgbm90IGZhaWwgY2F1c2luZyBhIEdpdENvbW1hbmRFcnJvciB0byBiZSB0aHJvd24uXG4gICAgICogQHRocm93cyBHaXRDb21tYW5kRXJyb3IgVGhyb3duIHdoZW4gdGhlIHB1c2ggYmFjayB0byB1cHN0cmVhbSBmYWlscy5cbiAgICAgKi9cbiAgICBwdXNoVG9VcHN0cmVhbTogKCk6IHRydWUgPT4ge1xuICAgICAgZ2l0LnJ1bihbJ3B1c2gnLCBoZWFkUmVmVXJsLCBgSEVBRDoke2hlYWRSZWZOYW1lfWAsIGZvcmNlV2l0aExlYXNlRmxhZ10pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICAvKiogUmVzdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsb2NhbCByZXBvc2l0b3J5IHRvIGJlZm9yZSB0aGUgUFIgY2hlY2tvdXQgb2NjdXJlZC4gKi9cbiAgICByZXNldEdpdFN0YXRlOiAoKTogYm9vbGVhbiA9PiB7XG4gICAgICByZXR1cm4gZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgfVxuICB9O1xufVxuIl19