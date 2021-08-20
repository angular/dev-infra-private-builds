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
                console_1.error(console_1.red('Github API request failed. ' + e.message));
                console_1.error(console_1.yellow('Please ensure that your provided token is valid.'));
                console_1.error(console_1.yellow(`You can generate a token here: ${github_urls_1.GITHUB_TOKEN_GENERATE_URL}`));
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
        if (await console_1.promptConfirm('Do you want to forcibly proceed with merging?')) {
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
                console_1.info(console_1.green(`Successfully merged the pull request: #${prNumber}`));
                return true;
            case 1 /* DIRTY_WORKING_DIR */:
                console_1.error(console_1.red(`Local working repository not clean. Please make sure there are ` +
                    `no uncommitted changes.`));
                return false;
            case 0 /* UNKNOWN_GIT_ERROR */:
                console_1.error(console_1.red('An unknown Git error has been thrown. Please check the output ' + 'above for details.'));
                return false;
            case 5 /* GITHUB_ERROR */:
                console_1.error(console_1.red('An error related to interacting with Github has been discovered.'));
                console_1.error(failure.message);
                return false;
            case 4 /* USER_ABORTED */:
                console_1.info(`Merge of pull request has been aborted manually: #${prNumber}`);
                return true;
            case 3 /* FAILED */:
                console_1.error(console_1.yellow(`Could not merge the specified pull request.`));
                console_1.error(console_1.red(failure.message));
                if (canForciblyMerge && !disableForceMergePrompt) {
                    console_1.info();
                    console_1.info(console_1.yellow('The pull request above failed due to non-critical errors.'));
                    console_1.info(console_1.yellow(`This error can be forcibly ignored if desired.`));
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
    const devInfraConfig = config_1.getConfig();
    config_1.assertValidGithubConfig(devInfraConfig);
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    const { config, errors } = await config_2.loadAndValidateConfig(devInfraConfig, git.github);
    if (errors) {
        console_1.error(console_1.red('Invalid merge configuration:'));
        errors.forEach((desc) => console_1.error(console_1.yellow(`  -  ${desc}`)));
        process.exit(1);
    }
    // Set the remote so that the merge tool has access to information about
    // the remote it intends to merge to.
    config.remote = devInfraConfig.github;
    // We can cast this to a merge config with remote because we always set the
    // remote above.
    return new task_1.PullRequestMergeTask(config, git, flags);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQXNFO0FBQ3RFLGlEQUFtRjtBQUNuRix1RkFBZ0Y7QUFDaEYsbURBQTZEO0FBQzdELDZEQUFzRTtBQUV0RSxxQ0FBc0U7QUFDdEUsaUNBQWlHO0FBRWpHOzs7Ozs7Ozs7O0dBVUc7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxLQUFnQztJQUN2RixpR0FBaUc7SUFDakcsd0ZBQXdGO0lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEQsOEVBQThFO0lBQzlFLHdFQUF3RTtJQUN4RSxxREFBcUQ7SUFDckQsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLEtBQUssVUFBVSxZQUFZLENBQUMsaUJBQTBCO1FBQ3BELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixrRUFBa0U7WUFDbEUsMERBQTBEO1lBQzFELElBQUksQ0FBQyxZQUFZLDhCQUFxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO2dCQUMxRCxlQUFLLENBQUMsYUFBRyxDQUFDLDZCQUE2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Q0FBQyxDQUFDLENBQUM7UUFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsZUFBSyxDQUFDLGdCQUFNLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsd0VBQXdFO0lBQ3hFLHFDQUFxQztJQUNyQyxNQUFPLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7SUFDdkMsMkVBQTJFO0lBQzNFLGdCQUFnQjtJQUNoQixPQUFPLElBQUksMkJBQW9CLENBQUMsTUFBZ0MsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDaEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydFZhbGlkR2l0aHViQ29uZmlnLCBnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcblxuaW1wb3J0IHtsb2FkQW5kVmFsaWRhdGVDb25maWcsIE1lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzfSBmcm9tICcuL3Rhc2snO1xuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBmbGFncyBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QocHJOdW1iZXI6IG51bWJlciwgZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gIHByb2Nlc3MuZW52WydIVVNLWSddID0gJzAnO1xuXG4gIGNvbnN0IGFwaSA9IGF3YWl0IGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGZsYWdzKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghKGF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcnMgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICMke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICByZWQoXG4gICAgICAgICAgICBgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgIGBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzLmAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKFxuICAgICAgICAgICAgJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArICdhYm92ZSBmb3IgZGV0YWlscy4nLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRDpcbiAgICAgICAgaW5mbyhgTWVyZ2Ugb2YgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgbWFudWFsbHk6ICMke3ByTnVtYmVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlIHRhc2sgdXNpbmcgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy4gRXhwbGljaXQgY29uZmlndXJhdGlvblxuICogb3B0aW9ucyBjYW4gYmUgc3BlY2lmaWVkIHdoZW4gdGhlIG1lcmdlIHNjcmlwdCBpcyB1c2VkIG91dHNpZGUgb2YgYW4gYG5nLWRldmAgY29uZmlndXJlZFxuICogcmVwb3NpdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgY29uc3QgZGV2SW5mcmFDb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRHaXRodWJDb25maWcoZGV2SW5mcmFDb25maWcpO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCB7Y29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGRldkluZnJhQ29uZmlnLCBnaXQuZ2l0aHViKTtcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgIGVycm9ycy5mb3JFYWNoKChkZXNjKSA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gU2V0IHRoZSByZW1vdGUgc28gdGhhdCB0aGUgbWVyZ2UgdG9vbCBoYXMgYWNjZXNzIHRvIGluZm9ybWF0aW9uIGFib3V0XG4gIC8vIHRoZSByZW1vdGUgaXQgaW50ZW5kcyB0byBtZXJnZSB0by5cbiAgY29uZmlnIS5yZW1vdGUgPSBkZXZJbmZyYUNvbmZpZy5naXRodWI7XG4gIC8vIFdlIGNhbiBjYXN0IHRoaXMgdG8gYSBtZXJnZSBjb25maWcgd2l0aCByZW1vdGUgYmVjYXVzZSB3ZSBhbHdheXMgc2V0IHRoZVxuICAvLyByZW1vdGUgYWJvdmUuXG4gIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2soY29uZmlnISBhcyBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIGdpdCwgZmxhZ3MpO1xufVxuIl19