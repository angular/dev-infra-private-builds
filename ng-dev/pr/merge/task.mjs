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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlEQUFrRDtBQUVsRCwyREFBMkQ7QUFHM0QseUNBQThDO0FBQzlDLHlDQUdvQjtBQUNwQixpREFBeUU7QUFDekUsc0RBQThEO0FBQzlELG9FQUFzRTtBQXlCdEUsTUFBTSxnQ0FBZ0MsR0FBOEI7SUFDbEUsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFhLG9CQUFvQjtJQUcvQixZQUNTLE1BQTZCLEVBQzdCLEdBQTJCLEVBQ2xDLEtBQXlDO1FBRmxDLFdBQU0sR0FBTixNQUFNLENBQXVCO1FBQzdCLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBR2xDLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsR0FBRyxnQ0FBZ0MsRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFnQixFQUFFLEtBQUssR0FBRyxLQUFLO1FBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3BDLE9BQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDNUIsT0FBTyxFQUFDLE1BQU0saUNBQXFDLEVBQUMsQ0FBQztTQUN0RDtRQUVELDhFQUE4RTtRQUM5RSwyRUFBMkU7UUFDM0UseUVBQXlFO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FB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QUNUO2dCQUFTO1lBQ1IsdUZBQXVGO1lBQ3ZGLDhFQUE4RTtZQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO1lBRTNELE1BQU0sUUFBUSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyQztJQUNILENBQUM7Q0FDRjtBQWxIRCxvREFrSEMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdENvbW1hbmRFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7XG4gIGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlLFxuICBnZXRUYXJnZXR0ZWRCcmFuY2hlc0NvbmZpcm1hdGlvblByb21wdE1lc3NhZ2UsXG59IGZyb20gJy4vbWVzc2FnZXMnO1xuaW1wb3J0IHtpc1B1bGxSZXF1ZXN0LCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFVORVhQRUNURURfU0hBTExPV19SRVBPLFxuICBTVUNDRVNTLFxuICBGQUlMRUQsXG4gIFVTRVJfQUJPUlRFRCxcbiAgR0lUSFVCX0VSUk9SLFxufVxuXG4vKiogUmVzdWx0IG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZVJlc3VsdCB7XG4gIC8qKiBPdmVyYWxsIHN0YXR1cyBvZiB0aGUgbWVyZ2UuICovXG4gIHN0YXR1czogTWVyZ2VTdGF0dXM7XG4gIC8qKiBMaXN0IG9mIHB1bGwgcmVxdWVzdCBmYWlsdXJlcy4gKi9cbiAgZmFpbHVyZT86IFB1bGxSZXF1ZXN0RmFpbHVyZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzIHtcbiAgYnJhbmNoUHJvbXB0OiBib29sZWFuO1xufVxuXG5jb25zdCBkZWZhdWx0UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncyA9IHtcbiAgYnJhbmNoUHJvbXB0OiB0cnVlLFxufTtcblxuLyoqXG4gKiBDbGFzcyB0aGF0IGFjY2VwdHMgYSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbiBhbmQgR2l0aHViIHRva2VuLiBJdCBwcm92aWRlc1xuICogYSBwcm9ncmFtbWF0aWMgaW50ZXJmYWNlIGZvciBtZXJnaW5nIG11bHRpcGxlIHB1bGwgcmVxdWVzdHMgYmFzZWQgb24gdGhlaXJcbiAqIGxhYmVscyB0aGF0IGhhdmUgYmVlbiByZXNvbHZlZCB0aHJvdWdoIHRoZSBtZXJnZSBzY3JpcHQgY29uZmlndXJhdGlvbi5cbiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrIHtcbiAgcHJpdmF0ZSBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsXG4gICAgcHVibGljIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgICBmbGFnczogUGFydGlhbDxQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzPixcbiAgKSB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHByb3BlcnR5IHdpdGggdGhlIHByb3ZpZGVkIGZsYWdzIHZhbHVlcyBhcyBwYXRjaGVzIHRvIHRoZSBkZWZhdWx0IGZsYWcgdmFsdWVzLlxuICAgIHRoaXMuZmxhZ3MgPSB7Li4uZGVmYXVsdFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MsIC4uLmZsYWdzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgaWYgKHRoaXMuZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVJ9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdpdC5pc1NoYWxsb3dSZXBvKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTkVYUEVDVEVEX1NIQUxMT1dfUkVQT307XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuIGhhcyBzdWZmaWNpZW50IHBlcm1pc3Npb25zIGZvciB3cml0aW5nXG4gICAgLy8gdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gSWYgdGhlIHJlcG9zaXRvcnkgaXMgbm90IHByaXZhdGUsIG9ubHkgdGhlXG4gICAgLy8gcmVkdWNlZCBgcHVibGljX3JlcG9gIE9BdXRoIHNjb3BlIGlzIHN1ZmZpY2llbnQgZm9yIHBlcmZvcm1pbmcgbWVyZ2VzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoKHNjb3BlcywgbWlzc2luZykgPT4ge1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3JlcG8nKSkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcucmVtb3RlLnByaXZhdGUpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3JlcG8nKTtcbiAgICAgICAgfSBlbHNlIGlmICghc2NvcGVzLmluY2x1ZGVzKCdwdWJsaWNfcmVwbycpKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdwdWJsaWNfcmVwbycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFB1bGwgcmVxdWVzdHMgY2FuIG1vZGlmeSBHaXRodWIgYWN0aW9uIHdvcmtmbG93IGZpbGVzLiBJbiBzdWNoIGNhc2VzIEdpdGh1YiByZXF1aXJlcyB1cyB0b1xuICAgICAgLy8gcHVzaCB3aXRoIGEgdG9rZW4gdGhhdCBoYXMgdGhlIGB3b3JrZmxvd2Agb2F1dGggc2NvcGUgc2V0LiBUbyBhdm9pZCBlcnJvcnMgd2hlbiB0aGVcbiAgICAgIC8vIGNhcmV0YWtlciBpbnRlbmRzIHRvIG1lcmdlIHN1Y2ggUFJzLCB3ZSBlbnN1cmUgdGhlIHNjb3BlIGlzIGFsd2F5cyBzZXQgb24gdGhlIHRva2VuIGJlZm9yZVxuICAgICAgLy8gdGhlIG1lcmdlIHByb2Nlc3Mgc3RhcnRzLlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZGV2ZWxvcGVycy9hcHBzL3Njb3Blcy1mb3Itb2F1dGgtYXBwcyNhdmFpbGFibGUtc2NvcGVzXG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygnd29ya2Zsb3cnKSkge1xuICAgICAgICBtaXNzaW5nLnB1c2goJ3dvcmtmbG93Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHRoaXMuZmxhZ3MuYnJhbmNoUHJvbXB0ICYmXG4gICAgICAhKGF3YWl0IHByb21wdENvbmZpcm0oZ2V0VGFyZ2V0dGVkQnJhbmNoZXNDb25maXJtYXRpb25Qcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGhhcyBhIGNhcmV0YWtlciBub3RlIGFwcGxpZWQsIHJhaXNlIGF3YXJlbmVzcyBieSBwcm9tcHRpbmdcbiAgICAvLyB0aGUgY2FyZXRha2VyLiBUaGUgY2FyZXRha2VyIGNhbiB0aGVuIGRlY2lkZSB0byBwcm9jZWVkIG9yIGFib3J0IHRoZSBtZXJnZS5cbiAgICBpZiAoXG4gICAgICBwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAhKGF3YWl0IHByb21wdENvbmZpcm0oZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2VcbiAgICAgID8gbmV3IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kodGhpcy5naXQsIHRoaXMuY29uZmlnLmdpdGh1YkFwaU1lcmdlKVxuICAgICAgOiBuZXcgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kodGhpcy5naXQpO1xuXG4gICAgLy8gQnJhbmNoIG9yIHJldmlzaW9uIHRoYXQgaXMgY3VycmVudGx5IGNoZWNrZWQgb3V0IHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBiYWNrIHRvXG4gICAgLy8gaXQgb25jZSB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC5cbiAgICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayBydW5zIEdpdCBjb21tYW5kcyBhcyBjaGlsZCBwcm9jZXNzZXMuIFRoZXNlIEdpdCBjb21tYW5kcyBjYW4gZmFpbC5cbiAgICAvLyBXZSB3YW50IHRvIGNhcHR1cmUgdGhlc2UgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhbiBhcHByb3ByaWF0ZSBtZXJnZSByZXF1ZXN0IHN0YXR1cy5cbiAgICB0cnkge1xuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFJldHVybiBhIHN1Y2Nlc3NmdWwgbWVyZ2Ugc3RhdHVzLlxuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlNVQ0NFU1N9O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGFsbCBnaXQgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhIG1lcmdlIHJlc3VsdCB3LyBnaXQgZXJyb3Igc3RhdHVzIGNvZGUuXG4gICAgICAvLyBPdGhlciB1bmtub3duIGVycm9ycyB3aGljaCBhcmVuJ3QgY2F1c2VkIGJ5IGEgZ2l0IGNvbW1hbmQgYXJlIHJlLXRocm93bi5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0Q29tbWFuZEVycm9yKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUn07XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBTd2l0Y2ggYmFjayB0byB0aGUgcHJldmlvdXMgYnJhbmNoLiBXZSBuZWVkIHRvIGRvIHRoaXMgYmVmb3JlIGRlbGV0aW5nIHRoZSB0ZW1wb3JhcnlcbiAgICAgIC8vIGJyYW5jaGVzIGJlY2F1c2Ugd2UgY2Fubm90IGRlbGV0ZSBicmFuY2hlcyB3aGljaCBhcmUgY3VycmVudGx5IGNoZWNrZWQgb3V0LlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb25dKTtcblxuICAgICAgYXdhaXQgc3RyYXRlZ3kuY2xlYW51cChwdWxsUmVxdWVzdCk7XG4gICAgfVxuICB9XG59XG4iXX0=