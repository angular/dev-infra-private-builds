"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergePullRequest = void 0;
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const github_1 = require("../../utils/git/github");
const github_urls_1 = require("../../utils/git/github-urls");
const config_2 = require("./config");
const task_1 = require("./task");
/**
 * Merges a given pull request based on labels configured in the given merge configuration.
 * Pull requests can be merged with different strategies such as the Github API merge
 * strategy, or the local autosquash strategy. Either strategy has benefits and downsides.
 * More information on these strategies can be found in their dedicated strategy classes.
 *
 * See {@link GithubApiMergeStrategy} and {@link AutosquashMergeStrategy}
 *
 * @param prNumber Number of the pull request that should be merged.
 * @param flags Configuration options for merging pull requests.
 */
async function mergePullRequest(prNumber, flags) {
    // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
    // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
    process.env['HUSKY'] = '0';
    const api = await createPullRequestMergeTask(flags);
    // Perform the merge. Force mode can be activated through a command line flag.
    // Alternatively, if the merge fails with non-fatal failures, the script
    // will prompt whether it should rerun in force mode.
    if (!(await performMerge(false))) {
        process.exit(1);
    }
    /** Performs the merge and returns whether it was successful or not. */
    async function performMerge(ignoreFatalErrors) {
        try {
            const result = await api.merge(prNumber, ignoreFatalErrors);
            return await handleMergeResult(result, ignoreFatalErrors);
        }
        catch (e) {
            // Catch errors to the Github API for invalid requests. We want to
            // exit the script with a better explanation of the error.
            if (e instanceof github_1.GithubApiRequestError && e.status === 401) {
                (0, console_1.error)((0, console_1.red)('Github API request failed. ' + e.message));
                (0, console_1.error)((0, console_1.yellow)('Please ensure that your provided token is valid.'));
                (0, console_1.error)((0, console_1.yellow)(`You can generate a token here: ${github_urls_1.GITHUB_TOKEN_GENERATE_URL}`));
                process.exit(1);
            }
            throw e;
        }
    }
    /**
     * Prompts whether the specified pull request should be forcibly merged. If so, merges
     * the specified pull request forcibly (ignoring non-critical failures).
     * @returns Whether the specified pull request has been forcibly merged.
     */
    async function promptAndPerformForceMerge() {
        if (await (0, console_1.promptConfirm)('Do you want to forcibly proceed with merging?')) {
            // Perform the merge in force mode. This means that non-fatal failures
            // are ignored and the merge continues.
            return performMerge(true);
        }
        return false;
    }
    /**
     * Handles the merge result by printing console messages, exiting the process
     * based on the result, or by restarting the merge if force mode has been enabled.
     * @returns Whether the merge completed without errors or not.
     */
    async function handleMergeResult(result, disableForceMergePrompt = false) {
        const { failure, status } = result;
        const canForciblyMerge = failure && failure.nonFatal;
        switch (status) {
            case 2 /* SUCCESS */:
                (0, console_1.info)((0, console_1.green)(`Successfully merged the pull request: #${prNumber}`));
                return true;
            case 1 /* DIRTY_WORKING_DIR */:
                (0, console_1.error)((0, console_1.red)(`Local working repository not clean. Please make sure there are ` +
                    `no uncommitted changes.`));
                return false;
            case 0 /* UNKNOWN_GIT_ERROR */:
                (0, console_1.error)((0, console_1.red)('An unknown Git error has been thrown. Please check the output ' + 'above for details.'));
                return false;
            case 5 /* GITHUB_ERROR */:
                (0, console_1.error)((0, console_1.red)('An error related to interacting with Github has been discovered.'));
                (0, console_1.error)(failure.message);
                return false;
            case 4 /* USER_ABORTED */:
                (0, console_1.info)(`Merge of pull request has been aborted manually: #${prNumber}`);
                return true;
            case 3 /* FAILED */:
                (0, console_1.error)((0, console_1.yellow)(`Could not merge the specified pull request.`));
                (0, console_1.error)((0, console_1.red)(failure.message));
                if (canForciblyMerge && !disableForceMergePrompt) {
                    (0, console_1.info)();
                    (0, console_1.info)((0, console_1.yellow)('The pull request above failed due to non-critical errors.'));
                    (0, console_1.info)((0, console_1.yellow)(`This error can be forcibly ignored if desired.`));
                    return await promptAndPerformForceMerge();
                }
                return false;
            default:
                throw Error(`Unexpected merge result: ${status}`);
        }
    }
}
exports.mergePullRequest = mergePullRequest;
/**
 * Creates the pull request merge task using the given configuration options. Explicit configuration
 * options can be specified when the merge script is used outside of an `ng-dev` configured
 * repository.
 */
async function createPullRequestMergeTask(flags) {
    try {
        const config = (0, config_1.getConfig)();
        (0, config_1.assertValidGithubConfig)(config);
        (0, config_2.assertValidMergeConfig)(config);
        /** The singleton instance of the authenticated git client. */
        const git = authenticated_git_client_1.AuthenticatedGitClient.get();
        // Set the remote so that the merge tool has access to information about
        // the remote it intends to merge to.
        const mergeConfig = {
            remote: config.github,
            ...config.merge,
        };
        return new task_1.PullRequestMergeTask(mergeConfig, git, flags);
    }
    catch (e) {
        if (e instanceof config_1.ConfigValidationError) {
            if (e.errors.length) {
                (0, console_1.error)((0, console_1.red)('Invalid merge configuration:'));
                e.errors.forEach((desc) => (0, console_1.error)((0, console_1.yellow)(`  -  ${desc}`)));
            }
            else {
                (0, console_1.error)((0, console_1.red)(e.message));
            }
            process.exit(1);
        }
        throw e;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZGO0FBQzdGLGlEQUFtRjtBQUNuRix1RkFBZ0Y7QUFDaEYsbURBQTZEO0FBQzdELDZEQUFzRTtBQUV0RSxxQ0FBZ0Q7QUFDaEQsaUNBQWlHO0FBRWpHOzs7Ozs7Ozs7O0dBVUc7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxLQUFnQztJQUN2RixpR0FBaUc7SUFDakcsd0ZBQXdGO0lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEQsOEVBQThFO0lBQzlFLHdFQUF3RTtJQUN4RSxxREFBcUQ7SUFDckQsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLEtBQUssVUFBVSxZQUFZLENBQUMsaUJBQTBCO1FBQ3BELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixrRUFBa0U7WUFDbEUsMERBQTBEO1lBQzFELElBQUksQ0FBQyxZQUFZLDhCQUFxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO2dCQUMxRCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcs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TUFBTSxHQUFHLEdBQUcsaURBQXNCLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFekMsd0VBQXdFO1FBQ3hFLHFDQUFxQztRQUNyQyxNQUFNLFdBQVcsR0FBRztZQUNsQixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU07WUFDckIsR0FBRyxNQUFNLENBQUMsS0FBSztTQUNoQixDQUFDO1FBRUYsT0FBTyxJQUFJLDJCQUFvQixDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDMUQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLElBQUksQ0FBQyxZQUFZLDhCQUFxQixFQUFFO1lBQ3RDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUEsZUFBSyxFQUFDLElBQUEsZ0JBQU0sRUFBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQzNEO2lCQUFNO2dCQUNMLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2FBQ3ZCO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUNELE1BQU0sQ0FBQyxDQUFDO0tBQ1Q7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRHaXRodWJDb25maWcsIENvbmZpZ1ZhbGlkYXRpb25FcnJvciwgZ2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdGh1YkFwaVJlcXVlc3RFcnJvcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5pbXBvcnQge0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRNZXJnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzfSBmcm9tICcuL3Rhc2snO1xuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBmbGFncyBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QocHJOdW1iZXI6IG51bWJlciwgZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gIHByb2Nlc3MuZW52WydIVVNLWSddID0gJzAnO1xuXG4gIGNvbnN0IGFwaSA9IGF3YWl0IGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGZsYWdzKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghKGF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcnMgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICMke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICByZWQoXG4gICAgICAgICAgICBgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgIGBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzLmAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKFxuICAgICAgICAgICAgJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArICdhYm92ZSBmb3IgZGV0YWlscy4nLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRDpcbiAgICAgICAgaW5mbyhgTWVyZ2Ugb2YgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgbWFudWFsbHk6ICMke3ByTnVtYmVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlIHRhc2sgdXNpbmcgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy4gRXhwbGljaXQgY29uZmlndXJhdGlvblxuICogb3B0aW9ucyBjYW4gYmUgc3BlY2lmaWVkIHdoZW4gdGhlIG1lcmdlIHNjcmlwdCBpcyB1c2VkIG91dHNpZGUgb2YgYW4gYG5nLWRldmAgY29uZmlndXJlZFxuICogcmVwb3NpdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICAgIGFzc2VydFZhbGlkTWVyZ2VDb25maWcoY29uZmlnKTtcbiAgICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICAgIGNvbnN0IGdpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG5cbiAgICAvLyBTZXQgdGhlIHJlbW90ZSBzbyB0aGF0IHRoZSBtZXJnZSB0b29sIGhhcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXRcbiAgICAvLyB0aGUgcmVtb3RlIGl0IGludGVuZHMgdG8gbWVyZ2UgdG8uXG4gICAgY29uc3QgbWVyZ2VDb25maWcgPSB7XG4gICAgICByZW1vdGU6IGNvbmZpZy5naXRodWIsXG4gICAgICAuLi5jb25maWcubWVyZ2UsXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2sobWVyZ2VDb25maWcsIGdpdCwgZmxhZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBDb25maWdWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgIGlmIChlLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgICAgICBlLmVycm9ycy5mb3JFYWNoKChkZXNjKSA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvcihyZWQoZS5tZXNzYWdlKSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cbiJdfQ==