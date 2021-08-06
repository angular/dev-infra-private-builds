"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PullRequestMergeTask = void 0;
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const failures_1 = require("./failures");
const messages_1 = require("./messages");
const pull_request_1 = require("./pull-request");
const api_merge_1 = require("./strategies/api-merge");
const autosquash_merge_1 = require("./strategies/autosquash-merge");
const defaultPullRequestMergeTaskFlags = {
    branchPrompt: true,
};
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
class PullRequestMergeTask {
    constructor(config, git, flags) {
        this.config = config;
        this.git = git;
        // Update flags property with the provided flags values as patches to the default flag values.
        this.flags = { ...defaultPullRequestMergeTaskFlags, ...flags };
    }
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    async merge(prNumber, force = false) {
        // Check whether the given Github token has sufficient permissions for writing
        // to the configured repository. If the repository is not private, only the
        // reduced `public_repo` OAuth scope is sufficient for performing merges.
        const hasOauthScopes = await this.git.hasOauthScopes((scopes, missing) => {
            if (!scopes.includes('repo')) {
                if (this.config.remote.private) {
                    missing.push('repo');
                }
                else if (!scopes.includes('public_repo')) {
                    missing.push('public_repo');
                }
            }
            // Pull requests can modify Github action workflow files. In such cases Github requires us to
            // push with a token that has the `workflow` oauth scope set. To avoid errors when the
            // caretaker intends to merge such PRs, we ensure the scope is always set on the token before
            // the merge process starts.
            // https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
            if (!scopes.includes('workflow')) {
                missing.push('workflow');
            }
        });
        if (hasOauthScopes !== true) {
            return {
                status: 5 /* GITHUB_ERROR */,
                failure: failures_1.PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error),
            };
        }
        if (this.git.hasUncommittedChanges()) {
            return { status: 1 /* DIRTY_WORKING_DIR */ };
        }
        const pullRequest = await pull_request_1.loadAndValidatePullRequest(this, prNumber, force);
        if (!pull_request_1.isPullRequest(pullRequest)) {
            return { status: 3 /* FAILED */, failure: pullRequest };
        }
        if (this.flags.branchPrompt &&
            !(await console_1.promptConfirm(messages_1.getTargettedBranchesConfirmationPromptMessage(pullRequest)))) {
            return { status: 4 /* USER_ABORTED */ };
        }
        // If the pull request has a caretaker note applied, raise awareness by prompting
        // the caretaker. The caretaker can then decide to proceed or abort the merge.
        if (pullRequest.hasCaretakerNote &&
            !(await console_1.promptConfirm(messages_1.getCaretakerNotePromptMessage(pullRequest)))) {
            return { status: 4 /* USER_ABORTED */ };
        }
        const strategy = this.config.githubApiMerge
            ? new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge)
            : new autosquash_merge_1.AutosquashMergeStrategy(this.git);
        // Branch or revision that is currently checked out so that we can switch back to
        // it once the pull request has been merged.
        let previousBranchOrRevision = null;
        // The following block runs Git commands as child processes. These Git commands can fail.
        // We want to capture these command errors and return an appropriate merge request status.
        try {
            previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
            // Run preparations for the merge (e.g. fetching branches).
            await strategy.prepare(pullRequest);
            // Perform the merge and capture potential failures.
            const failure = await strategy.merge(pullRequest);
            if (failure !== null) {
                return { status: 3 /* FAILED */, failure };
            }
            // Switch back to the previous branch. We need to do this before deleting the temporary
            // branches because we cannot delete branches which are currently checked out.
            this.git.run(['checkout', '-f', previousBranchOrRevision]);
            await strategy.cleanup(pullRequest);
            // Return a successful merge status.
            return { status: 2 /* SUCCESS */ };
        }
        catch (e) {
            // Catch all git command errors and return a merge result w/ git error status code.
            // Other unknown errors which aren't caused by a git command are re-thrown.
            if (e instanceof git_client_1.GitCommandError) {
                return { status: 0 /* UNKNOWN_GIT_ERROR */ };
            }
            throw e;
        }
        finally {
            // Always try to restore the branch if possible. We don't want to leave
            // the repository in a different state than before.
            if (previousBranchOrRevision !== null) {
                this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
            }
        }
    }
}
exports.PullRequestMergeTask = PullRequestMergeTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlEQUFrRDtBQUVsRCwyREFBMkQ7QUFHM0QseUNBQThDO0FBQzlDLHlDQUdvQjtBQUNwQixpREFBeUU7QUFDekUsc0RBQThEO0FBQzlELG9FQUFzRTtBQXdCdEUsTUFBTSxnQ0FBZ0MsR0FBOEI7SUFDbEUsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFhLG9CQUFvQjtJQUcvQixZQUNTLE1BQTZCLEVBQzdCLEdBQTJCLEVBQ2xDLEtBQXlDO1FBRmxDLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQzdCLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBR2xDLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsR0FBRyxnQ0FBZ0MsRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFnQixFQUFFLEtBQUssR0FBRyxLQUFLO1FBQ3pDLDhFQUE4RTtRQUM5RSwyRUFBMkU7UUFDM0UseUVBQXlFO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQzVCLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFO29CQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUN0QjtxQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtv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QkFDaEMsT0FBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsQ0FBQzthQUNoRDtZQUNELE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7Z0JBQVM7WUFDUix1RUFBdUU7WUFDdkUsbURBQW1EO1lBQ25ELElBQUksd0JBQXdCLEtBQUssSUFBSSxFQUFFO2dCQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO2FBQ3BFO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUF0SEQsb0RBc0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7XG4gIGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlLFxuICBnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2UsXG59IGZyb20gJy4vbWVzc2FnZXMnO1xuaW1wb3J0IHtpc1B1bGxSZXF1ZXN0LCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3Mge1xuICBicmFuY2hQcm9tcHQ6IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzID0ge1xuICBicmFuY2hQcm9tcHQ6IHRydWUsXG59O1xuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICBwcml2YXRlIGZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSxcbiAgICBwdWJsaWMgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIGZsYWdzOiBQYXJ0aWFsPFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M+LFxuICApIHtcbiAgICAvLyBVcGRhdGUgZmxhZ3MgcHJvcGVydHkgd2l0aCB0aGUgcHJvdmlkZWQgZmxhZ3MgdmFsdWVzIGFzIHBhdGNoZXMgdG8gdGhlIGRlZmF1bHQgZmxhZyB2YWx1ZXMuXG4gICAgdGhpcy5mbGFncyA9IHsuLi5kZWZhdWx0UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncywgLi4uZmxhZ3N9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IGFuZCBwdXNoZXMgaXQgdXBzdHJlYW0uXG4gICAqIEBwYXJhbSBwck51bWJlciBQdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciBub24tY3JpdGljYWwgcHVsbCByZXF1ZXN0IGZhaWx1cmVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHJOdW1iZXI6IG51bWJlciwgZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8TWVyZ2VSZXN1bHQ+IHtcbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiBHaXRodWIgdG9rZW4gaGFzIHN1ZmZpY2llbnQgcGVybWlzc2lvbnMgZm9yIHdyaXRpbmdcbiAgICAvLyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiBJZiB0aGUgcmVwb3NpdG9yeSBpcyBub3QgcHJpdmF0ZSwgb25seSB0aGVcbiAgICAvLyByZWR1Y2VkIGBwdWJsaWNfcmVwb2AgT0F1dGggc2NvcGUgaXMgc3VmZmljaWVudCBmb3IgcGVyZm9ybWluZyBtZXJnZXMuXG4gICAgY29uc3QgaGFzT2F1dGhTY29wZXMgPSBhd2FpdCB0aGlzLmdpdC5oYXNPYXV0aFNjb3Blcygoc2NvcGVzLCBtaXNzaW5nKSA9PiB7XG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygncmVwbycpKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5yZW1vdGUucHJpdmF0ZSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncmVwbycpO1xuICAgICAgICB9IGVsc2UgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3B1YmxpY19yZXBvJykpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3B1YmxpY19yZXBvJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUHVsbCByZXF1ZXN0cyBjYW4gbW9kaWZ5IEdpdGh1YiBhY3Rpb24gd29ya2Zsb3cgZmlsZXMuIEluIHN1Y2ggY2FzZXMgR2l0aHViIHJlcXVpcmVzIHVzIHRvXG4gICAgICAvLyBwdXNoIHdpdGggYSB0b2tlbiB0aGF0IGhhcyB0aGUgYHdvcmtmbG93YCBvYXV0aCBzY29wZSBzZXQuIFRvIGF2b2lkIGVycm9ycyB3aGVuIHRoZVxuICAgICAgLy8gY2FyZXRha2VyIGludGVuZHMgdG8gbWVyZ2Ugc3VjaCBQUnMsIHdlIGVuc3VyZSB0aGUgc2NvcGUgaXMgYWx3YXlzIHNldCBvbiB0aGUgdG9rZW4gYmVmb3JlXG4gICAgICAvLyB0aGUgbWVyZ2UgcHJvY2VzcyBzdGFydHMuXG4gICAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9kZXZlbG9wZXJzL2FwcHMvc2NvcGVzLWZvci1vYXV0aC1hcHBzI2F2YWlsYWJsZS1zY29wZXNcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCd3b3JrZmxvdycpKSB7XG4gICAgICAgIG1pc3NpbmcucHVzaCgnd29ya2Zsb3cnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChoYXNPYXV0aFNjb3BlcyAhPT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1IsXG4gICAgICAgIGZhaWx1cmU6IFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoaGFzT2F1dGhTY29wZXMuZXJyb3IpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuZmxhZ3MuYnJhbmNoUHJvbXB0ICYmXG4gICAgICAhKGF3YWl0IHByb21wdENvbmZpcm0oZ2V0VGFyZ2V0dGVkQnJhbmNoZXNDb25maXJtYXRpb25Qcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlIGFwcGxpZWQsIHJhaXNlIGF3YXJlbmVzcyBieSBwcm9tcHRpbmdcbiAgICAvLyB0aGUgY2FyZXRha2VyLiBUaGUgY2FyZXRha2VyIGNhbiB0aGVuIGRlY2lkZSB0byBwcm9jZWVkIG9yIGFib3J0IHRoZSBtZXJnZS5cbiAgICBpZiAoXG4gICAgICBwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAhKGF3YWl0IHByb21wdENvbmZpcm0oZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2VcbiAgICAgID8gbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKVxuICAgICAgOiBuZXcgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kodGhpcy5naXQpO1xuXG4gICAgLy8gQnJhbmNoIG9yIHJldmlzaW9uIHRoYXQgaXMgY3VycmVudGx5IGNoZWNrZWQgb3V0IHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBiYWNrIHRvXG4gICAgLy8gaXQgb25jZSB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC5cbiAgICBsZXQgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uOiBudWxsIHwgc3RyaW5nID0gbnVsbDtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBBbHdheXMgdHJ5IHRvIHJlc3RvcmUgdGhlIGJyYW5jaCBpZiBwb3NzaWJsZS4gV2UgZG9uJ3Qgd2FudCB0byBsZWF2ZVxuICAgICAgLy8gdGhlIHJlcG9zaXRvcnkgaW4gYSBkaWZmZXJlbnQgc3RhdGUgdGhhbiBiZWZvcmUuXG4gICAgICBpZiAocHJldmlvdXNCcmFuY2hPclJldmlzaW9uICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==