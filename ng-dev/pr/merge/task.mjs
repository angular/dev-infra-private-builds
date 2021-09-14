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
        if (this.git.hasUncommittedChanges()) {
            return { status: 1 /* DIRTY_WORKING_DIR */ };
        }
        if (this.git.isShallowRepo()) {
            return { status: 2 /* UNEXPECTED_SHALLOW_REPO */ };
        }
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
                status: 6 /* GITHUB_ERROR */,
                failure: failures_1.PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error),
            };
        }
        const pullRequest = await (0, pull_request_1.loadAndValidatePullRequest)(this, prNumber, force);
        if (!(0, pull_request_1.isPullRequest)(pullRequest)) {
            return { status: 4 /* FAILED */, failure: pullRequest };
        }
        if (this.flags.branchPrompt &&
            !(await (0, console_1.promptConfirm)((0, messages_1.getTargettedBranchesConfirmationPromptMessage)(pullRequest)))) {
            return { status: 5 /* USER_ABORTED */ };
        }
        // If the pull request has a caretaker note applied, raise awareness by prompting
        // the caretaker. The caretaker can then decide to proceed or abort the merge.
        if (pullRequest.hasCaretakerNote &&
            !(await (0, console_1.promptConfirm)((0, messages_1.getCaretakerNotePromptMessage)(pullRequest)))) {
            return { status: 5 /* USER_ABORTED */ };
        }
        const strategy = this.config.githubApiMerge
            ? new api_merge_1.GithubApiMergeStrategy(this.git, this.config.githubApiMerge)
            : new autosquash_merge_1.AutosquashMergeStrategy(this.git);
        // Branch or revision that is currently checked out so that we can switch back to
        // it once the pull request has been merged.
        const previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
        // The following block runs Git commands as child processes. These Git commands can fail.
        // We want to capture these command errors and return an appropriate merge request status.
        try {
            // Run preparations for the merge (e.g. fetching branches).
            await strategy.prepare(pullRequest);
            // Perform the merge and capture potential failures.
            const failure = await strategy.merge(pullRequest);
            if (failure !== null) {
                return { status: 4 /* FAILED */, failure };
            }
            // Return a successful merge status.
            return { status: 3 /* SUCCESS */ };
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
            // Switch back to the previous branch. We need to do this before deleting the temporary
            // branches because we cannot delete branches which are currently checked out.
            this.git.run(['checkout', '-f', previousBranchOrRevision]);
            await strategy.cleanup(pullRequest);
        }
    }
}
exports.PullRequestMergeTask = PullRequestMergeTask;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlEQUFrRDtBQUVsRCwyREFBMkQ7QUFHM0QseUNBQThDO0FBQzlDLHlDQUdvQjtBQUNwQixpREFBeUU7QUFDekUsc0RBQThEO0FBQzlELG9FQUFzRTtBQXlCdEUsTUFBTSxnQ0FBZ0MsR0FBOEI7SUFDbEUsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFhLG9CQUFvQjtJQUcvQixZQUNTLE1BQTZCLEVBQzdCLEdBQTJCLEVBQ2xDLEtBQXlDO1FBRmxDLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQzdCLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBR2xDLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsR0FBRyxnQ0FBZ0MsRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFnQixFQUFFLEtBQUssR0FBRyxLQUFLO1FBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3BDLE9BQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDNUIsT0FBTyxFQUFDLE1BQU0saUNBQXFDLEVBQUMsQ0FBQztTQUN0RDtRQUVELDhFQUE4RTtRQUM5RSwyRUFBMkU7UUFDM0UseUVBQXlFO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FB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QUNUO2dCQUFTO1lBQ1IsdUZBQXVGO1lBQ3ZGLDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7Q0FDRjtBQWxIRCxvREFrSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtcbiAgZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UsXG4gIGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZSxcbn0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0fSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hcGktbWVyZ2UnO1xuaW1wb3J0IHtBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UnO1xuXG4vKiogRGVzY3JpYmVzIHRoZSBzdGF0dXMgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgY29uc3QgZW51bSBNZXJnZVN0YXR1cyB7XG4gIFVOS05PV05fR0lUX0VSUk9SLFxuICBESVJUWV9XT1JLSU5HX0RJUixcbiAgVU5FWFBFQ1RFRF9TSEFMTE9XX1JFUE8sXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3Mge1xuICBicmFuY2hQcm9tcHQ6IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzID0ge1xuICBicmFuY2hQcm9tcHQ6IHRydWUsXG59O1xuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICBwcml2YXRlIGZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyBjb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSxcbiAgICBwdWJsaWMgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIGZsYWdzOiBQYXJ0aWFsPFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M+LFxuICApIHtcbiAgICAvLyBVcGRhdGUgZmxhZ3MgcHJvcGVydHkgd2l0aCB0aGUgcHJvdmlkZWQgZmxhZ3MgdmFsdWVzIGFzIHBhdGNoZXMgdG8gdGhlIGRlZmF1bHQgZmxhZyB2YWx1ZXMuXG4gICAgdGhpcy5mbGFncyA9IHsuLi5kZWZhdWx0UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncywgLi4uZmxhZ3N9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IGFuZCBwdXNoZXMgaXQgdXBzdHJlYW0uXG4gICAqIEBwYXJhbSBwck51bWJlciBQdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciBub24tY3JpdGljYWwgcHVsbCByZXF1ZXN0IGZhaWx1cmVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHJOdW1iZXI6IG51bWJlciwgZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8TWVyZ2VSZXN1bHQ+IHtcbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZ2l0LmlzU2hhbGxvd1JlcG8oKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVORVhQRUNURURfU0hBTExPV19SRVBPfTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiBHaXRodWIgdG9rZW4gaGFzIHN1ZmZpY2llbnQgcGVybWlzc2lvbnMgZm9yIHdyaXRpbmdcbiAgICAvLyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiBJZiB0aGUgcmVwb3NpdG9yeSBpcyBub3QgcHJpdmF0ZSwgb25seSB0aGVcbiAgICAvLyByZWR1Y2VkIGBwdWJsaWNfcmVwb2AgT0F1dGggc2NvcGUgaXMgc3VmZmljaWVudCBmb3IgcGVyZm9ybWluZyBtZXJnZXMuXG4gICAgY29uc3QgaGFzT2F1dGhTY29wZXMgPSBhd2FpdCB0aGlzLmdpdC5oYXNPYXV0aFNjb3Blcygoc2NvcGVzLCBtaXNzaW5nKSA9PiB7XG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygncmVwbycpKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5yZW1vdGUucHJpdmF0ZSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncmVwbycpO1xuICAgICAgICB9IGVsc2UgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3B1YmxpY19yZXBvJykpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3B1YmxpY19yZXBvJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUHVsbCByZXF1ZXN0cyBjYW4gbW9kaWZ5IEdpdGh1YiBhY3Rpb24gd29ya2Zsb3cgZmlsZXMuIEluIHN1Y2ggY2FzZXMgR2l0aHViIHJlcXVpcmVzIHVzIHRvXG4gICAgICAvLyBwdXNoIHdpdGggYSB0b2tlbiB0aGF0IGhhcyB0aGUgYHdvcmtmbG93YCBvYXV0aCBzY29wZSBzZXQuIFRvIGF2b2lkIGVycm9ycyB3aGVuIHRoZVxuICAgICAgLy8gY2FyZXRha2VyIGludGVuZHMgdG8gbWVyZ2Ugc3VjaCBQUnMsIHdlIGVuc3VyZSB0aGUgc2NvcGUgaXMgYWx3YXlzIHNldCBvbiB0aGUgdG9rZW4gYmVmb3JlXG4gICAgICAvLyB0aGUgbWVyZ2UgcHJvY2VzcyBzdGFydHMuXG4gICAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9kZXZlbG9wZXJzL2FwcHMvc2NvcGVzLWZvci1vYXV0aC1hcHBzI2F2YWlsYWJsZS1zY29wZXNcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCd3b3JrZmxvdycpKSB7XG4gICAgICAgIG1pc3NpbmcucHVzaCgnd29ya2Zsb3cnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChoYXNPYXV0aFNjb3BlcyAhPT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1IsXG4gICAgICAgIGZhaWx1cmU6IFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoaGFzT2F1dGhTY29wZXMuZXJyb3IpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KHRoaXMsIHByTnVtYmVyLCBmb3JjZSk7XG5cbiAgICBpZiAoIWlzUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlOiBwdWxsUmVxdWVzdH07XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgdGhpcy5mbGFncy5icmFuY2hQcm9tcHQgJiZcbiAgICAgICEoYXdhaXQgcHJvbXB0Q29uZmlybShnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZCwgcmFpc2UgYXdhcmVuZXNzIGJ5IHByb21wdGluZ1xuICAgIC8vIHRoZSBjYXJldGFrZXIuIFRoZSBjYXJldGFrZXIgY2FuIHRoZW4gZGVjaWRlIHRvIHByb2NlZWQgb3IgYWJvcnQgdGhlIG1lcmdlLlxuICAgIGlmIChcbiAgICAgIHB1bGxSZXF1ZXN0Lmhhc0NhcmV0YWtlck5vdGUgJiZcbiAgICAgICEoYXdhaXQgcHJvbXB0Q29uZmlybShnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkpKVxuICAgICkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZVxuICAgICAgPyBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpXG4gICAgICA6IG5ldyBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCk7XG5cbiAgICAvLyBCcmFuY2ggb3IgcmV2aXNpb24gdGhhdCBpcyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgc28gdGhhdCB3ZSBjYW4gc3dpdGNoIGJhY2sgdG9cbiAgICAvLyBpdCBvbmNlIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLlxuICAgIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGJsb2NrIHJ1bnMgR2l0IGNvbW1hbmRzIGFzIGNoaWxkIHByb2Nlc3Nlcy4gVGhlc2UgR2l0IGNvbW1hbmRzIGNhbiBmYWlsLlxuICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGVzZSBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGFuIGFwcHJvcHJpYXRlIG1lcmdlIHJlcXVlc3Qgc3RhdHVzLlxuICAgIHRyeSB7XG4gICAgICAvLyBSdW4gcHJlcGFyYXRpb25zIGZvciB0aGUgbWVyZ2UgKGUuZy4gZmV0Y2hpbmcgYnJhbmNoZXMpLlxuICAgICAgYXdhaXQgc3RyYXRlZ3kucHJlcGFyZShwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGFuZCBjYXB0dXJlIHBvdGVudGlhbCBmYWlsdXJlcy5cbiAgICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCBzdHJhdGVneS5tZXJnZShwdWxsUmVxdWVzdCk7XG4gICAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlfTtcbiAgICAgIH1cblxuICAgICAgLy8gUmV0dXJuIGEgc3VjY2Vzc2Z1bCBtZXJnZSBzdGF0dXMuXG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuU1VDQ0VTU307XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggYWxsIGdpdCBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGEgbWVyZ2UgcmVzdWx0IHcvIGdpdCBlcnJvciBzdGF0dXMgY29kZS5cbiAgICAgIC8vIE90aGVyIHVua25vd24gZXJyb3JzIHdoaWNoIGFyZW4ndCBjYXVzZWQgYnkgYSBnaXQgY29tbWFuZCBhcmUgcmUtdGhyb3duLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuXG4gICAgICBhd2FpdCBzdHJhdGVneS5jbGVhbnVwKHB1bGxSZXF1ZXN0KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==