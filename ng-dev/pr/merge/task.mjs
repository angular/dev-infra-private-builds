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
const failures_1 = require("../common/validation/failures");
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
                if (this.config.github.private) {
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
        const strategy = this.config.pullRequest.githubApiMerge
            ? new api_merge_1.GithubApiMergeStrategy(this.git, this.config.pullRequest.githubApiMerge)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILGlEQUFrRDtBQUVsRCwyREFBMkQ7QUFHM0QsNERBQWlFO0FBQ2pFLHlDQUdvQjtBQUNwQixpREFBeUU7QUFDekUsc0RBQThEO0FBQzlELG9FQUFzRTtBQTBCdEUsTUFBTSxnQ0FBZ0MsR0FBOEI7SUFDbEUsWUFBWSxFQUFFLElBQUk7Q0FDbkIsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFhLG9CQUFvQjtJQUcvQixZQUNTLE1BQThELEVBQzlELEdBQTJCLEVBQ2xDLEtBQXlDO1FBRmxDLFdBQU0sR0FBTixNQUFNLENBQXdEO1FBQzlELFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBR2xDLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsR0FBRyxnQ0FBZ0MsRUFBRSxHQUFHLEtBQUssRUFBQyxDQUFDO0lBQy9ELENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFnQixFQUFFLEtBQUssR0FBRyxLQUFLO1FBQ3pDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO1lBQ3BDLE9BQU8sRUFBQyxNQUFNLDJCQUErQixFQUFDLENBQUM7U0FDaEQ7UUFFRCxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUU7WUFDNUIsT0FBTyxFQUFDLE1BQU0saUNBQXFDLEVBQUMsQ0FBQztTQUN0RDtRQUVELDhFQUE4RTtRQUM5RSwyRUFBMkU7UUFDM0UseUVBQXlFO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxFQUFFLEVBQUU7WUFDdkUsSUFBSSxDQUFDLE1BQU0sQ0FB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QUNELE1BQU0sQ0FBQyxDQUFDO1NBQ1Q7Z0JBQVM7WUFDUix1RkFBdUY7WUFDdkYsOEVBQThFO1lBQzlFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7WUFFM0QsTUFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztDQUNGO0FBbEhELG9EQWtIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbmltcG9ydCB7UHVsbFJlcXVlc3RDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi4vY29tbW9uL3ZhbGlkYXRpb24vZmFpbHVyZXMnO1xuaW1wb3J0IHtcbiAgZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UsXG4gIGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZSxcbn0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0fSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hcGktbWVyZ2UnO1xuaW1wb3J0IHtBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbi8qKiBEZXNjcmliZXMgdGhlIHN0YXR1cyBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBjb25zdCBlbnVtIE1lcmdlU3RhdHVzIHtcbiAgVU5LTk9XTl9HSVRfRVJST1IsXG4gIERJUlRZX1dPUktJTkdfRElSLFxuICBVTkVYUEVDVEVEX1NIQUxMT1dfUkVQTyxcbiAgU1VDQ0VTUyxcbiAgRkFJTEVELFxuICBVU0VSX0FCT1JURUQsXG4gIEdJVEhVQl9FUlJPUixcbn1cblxuLyoqIFJlc3VsdCBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VSZXN1bHQge1xuICAvKiogT3ZlcmFsbCBzdGF0dXMgb2YgdGhlIG1lcmdlLiAqL1xuICBzdGF0dXM6IE1lcmdlU3RhdHVzO1xuICAvKiogTGlzdCBvZiBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuICovXG4gIGZhaWx1cmU/OiBQdWxsUmVxdWVzdEZhaWx1cmU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncyB7XG4gIGJyYW5jaFByb21wdDogYm9vbGVhbjtcbn1cblxuY29uc3QgZGVmYXVsdFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MgPSB7XG4gIGJyYW5jaFByb21wdDogdHJ1ZSxcbn07XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBhY2NlcHRzIGEgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24gYW5kIEdpdGh1YiB0b2tlbi4gSXQgcHJvdmlkZXNcbiAqIGEgcHJvZ3JhbW1hdGljIGludGVyZmFjZSBmb3IgbWVyZ2luZyBtdWx0aXBsZSBwdWxsIHJlcXVlc3RzIGJhc2VkIG9uIHRoZWlyXG4gKiBsYWJlbHMgdGhhdCBoYXZlIGJlZW4gcmVzb2x2ZWQgdGhyb3VnaCB0aGUgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdE1lcmdlVGFzayB7XG4gIHByaXZhdGUgZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGNvbmZpZzoge3B1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdENvbmZpZzsgZ2l0aHViOiBHaXRodWJDb25maWd9LFxuICAgIHB1YmxpYyBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gICAgZmxhZ3M6IFBhcnRpYWw8UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncz4sXG4gICkge1xuICAgIC8vIFVwZGF0ZSBmbGFncyBwcm9wZXJ0eSB3aXRoIHRoZSBwcm92aWRlZCBmbGFncyB2YWx1ZXMgYXMgcGF0Y2hlcyB0byB0aGUgZGVmYXVsdCBmbGFnIHZhbHVlcy5cbiAgICB0aGlzLmZsYWdzID0gey4uLmRlZmF1bHRQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzLCAuLi5mbGFnc307XG4gIH1cblxuICAvKipcbiAgICogTWVyZ2VzIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgYW5kIHB1c2hlcyBpdCB1cHN0cmVhbS5cbiAgICogQHBhcmFtIHByTnVtYmVyIFB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gICAqIEBwYXJhbSBmb3JjZSBXaGV0aGVyIG5vbi1jcml0aWNhbCBwdWxsIHJlcXVlc3QgZmFpbHVyZXMgc2hvdWxkIGJlIGlnbm9yZWQuXG4gICAqL1xuICBhc3luYyBtZXJnZShwck51bWJlcjogbnVtYmVyLCBmb3JjZSA9IGZhbHNlKTogUHJvbWlzZTxNZXJnZVJlc3VsdD4ge1xuICAgIGlmICh0aGlzLmdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaXNTaGFsbG93UmVwbygpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5FWFBFQ1RFRF9TSEFMTE9XX1JFUE99O1xuICAgIH1cblxuICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIEdpdGh1YiB0b2tlbiBoYXMgc3VmZmljaWVudCBwZXJtaXNzaW9ucyBmb3Igd3JpdGluZ1xuICAgIC8vIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuIElmIHRoZSByZXBvc2l0b3J5IGlzIG5vdCBwcml2YXRlLCBvbmx5IHRoZVxuICAgIC8vIHJlZHVjZWQgYHB1YmxpY19yZXBvYCBPQXV0aCBzY29wZSBpcyBzdWZmaWNpZW50IGZvciBwZXJmb3JtaW5nIG1lcmdlcy5cbiAgICBjb25zdCBoYXNPYXV0aFNjb3BlcyA9IGF3YWl0IHRoaXMuZ2l0Lmhhc09hdXRoU2NvcGVzKChzY29wZXMsIG1pc3NpbmcpID0+IHtcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCdyZXBvJykpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmdpdGh1Yi5wcml2YXRlKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdyZXBvJyk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXNjb3Blcy5pbmNsdWRlcygncHVibGljX3JlcG8nKSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncHVibGljX3JlcG8nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBQdWxsIHJlcXVlc3RzIGNhbiBtb2RpZnkgR2l0aHViIGFjdGlvbiB3b3JrZmxvdyBmaWxlcy4gSW4gc3VjaCBjYXNlcyBHaXRodWIgcmVxdWlyZXMgdXMgdG9cbiAgICAgIC8vIHB1c2ggd2l0aCBhIHRva2VuIHRoYXQgaGFzIHRoZSBgd29ya2Zsb3dgIG9hdXRoIHNjb3BlIHNldC4gVG8gYXZvaWQgZXJyb3JzIHdoZW4gdGhlXG4gICAgICAvLyBjYXJldGFrZXIgaW50ZW5kcyB0byBtZXJnZSBzdWNoIFBScywgd2UgZW5zdXJlIHRoZSBzY29wZSBpcyBhbHdheXMgc2V0IG9uIHRoZSB0b2tlbiBiZWZvcmVcbiAgICAgIC8vIHRoZSBtZXJnZSBwcm9jZXNzIHN0YXJ0cy5cbiAgICAgIC8vIGh0dHBzOi8vZG9jcy5naXRodWIuY29tL2VuL2RldmVsb3BlcnMvYXBwcy9zY29wZXMtZm9yLW9hdXRoLWFwcHMjYXZhaWxhYmxlLXNjb3Blc1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3dvcmtmbG93JykpIHtcbiAgICAgICAgbWlzc2luZy5wdXNoKCd3b3JrZmxvdycpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKGhhc09hdXRoU2NvcGVzICE9PSB0cnVlKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXM6IE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUixcbiAgICAgICAgZmFpbHVyZTogUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZShoYXNPYXV0aFNjb3Blcy5lcnJvciksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QodGhpcywgcHJOdW1iZXIsIGZvcmNlKTtcblxuICAgIGlmICghaXNQdWxsUmVxdWVzdChwdWxsUmVxdWVzdCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmU6IHB1bGxSZXF1ZXN0fTtcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLmZsYWdzLmJyYW5jaFByb21wdCAmJlxuICAgICAgIShhd2FpdCBwcm9tcHRDb25maXJtKGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkpKVxuICAgICkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZSBhcHBsaWVkLCByYWlzZSBhd2FyZW5lc3MgYnkgcHJvbXB0aW5nXG4gICAgLy8gdGhlIGNhcmV0YWtlci4gVGhlIGNhcmV0YWtlciBjYW4gdGhlbiBkZWNpZGUgdG8gcHJvY2VlZCBvciBhYm9ydCB0aGUgbWVyZ2UuXG4gICAgaWYgKFxuICAgICAgcHVsbFJlcXVlc3QuaGFzQ2FyZXRha2VyTm90ZSAmJlxuICAgICAgIShhd2FpdCBwcm9tcHRDb25maXJtKGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpXG4gICAgKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cbiAgICBjb25zdCBzdHJhdGVneSA9IHRoaXMuY29uZmlnLnB1bGxSZXF1ZXN0LmdpdGh1YkFwaU1lcmdlXG4gICAgICA/IG5ldyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0LCB0aGlzLmNvbmZpZy5wdWxsUmVxdWVzdC5naXRodWJBcGlNZXJnZSlcbiAgICAgIDogbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCBvciByZXZpc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0b1xuICAgIC8vIGl0IG9uY2UgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICAgIC8vIFRoZSBmb2xsb3dpbmcgYmxvY2sgcnVucyBHaXQgY29tbWFuZHMgYXMgY2hpbGQgcHJvY2Vzc2VzLiBUaGVzZSBHaXQgY29tbWFuZHMgY2FuIGZhaWwuXG4gICAgLy8gV2Ugd2FudCB0byBjYXB0dXJlIHRoZXNlIGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYW4gYXBwcm9wcmlhdGUgbWVyZ2UgcmVxdWVzdCBzdGF0dXMuXG4gICAgdHJ5IHtcbiAgICAgIC8vIFJ1biBwcmVwYXJhdGlvbnMgZm9yIHRoZSBtZXJnZSAoZS5nLiBmZXRjaGluZyBicmFuY2hlcykuXG4gICAgICBhd2FpdCBzdHJhdGVneS5wcmVwYXJlKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgYW5kIGNhcHR1cmUgcG90ZW50aWFsIGZhaWx1cmVzLlxuICAgICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHN0cmF0ZWd5Lm1lcmdlKHB1bGxSZXF1ZXN0KTtcbiAgICAgIGlmIChmYWlsdXJlICE9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5GQUlMRUQsIGZhaWx1cmV9O1xuICAgICAgfVxuXG4gICAgICAvLyBSZXR1cm4gYSBzdWNjZXNzZnVsIG1lcmdlIHN0YXR1cy5cbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5TVUNDRVNTfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbGwgZ2l0IGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYSBtZXJnZSByZXN1bHQgdy8gZ2l0IGVycm9yIHN0YXR1cyBjb2RlLlxuICAgICAgLy8gT3RoZXIgdW5rbm93biBlcnJvcnMgd2hpY2ggYXJlbid0IGNhdXNlZCBieSBhIGdpdCBjb21tYW5kIGFyZSByZS10aHJvd24uXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1J9O1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIGJyYW5jaC4gV2UgbmVlZCB0byBkbyB0aGlzIGJlZm9yZSBkZWxldGluZyB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyBicmFuY2hlcyBiZWNhdXNlIHdlIGNhbm5vdCBkZWxldGUgYnJhbmNoZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBjaGVja2VkIG91dC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uXSk7XG5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LmNsZWFudXAocHVsbFJlcXVlc3QpO1xuICAgIH1cbiAgfVxufVxuIl19