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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZDO0FBQzdDLGlEQUFtRjtBQUNuRix1RkFBZ0Y7QUFDaEYsbURBQTZEO0FBQzdELDZEQUFzRTtBQUV0RSxxQ0FBc0U7QUFDdEUsaUNBQWlHO0FBRWpHOzs7Ozs7Ozs7O0dBVUc7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxLQUFnQztJQUN2RixpR0FBaUc7SUFDakcsd0ZBQXdGO0lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEQsOEVBQThFO0lBQzlFLHdFQUF3RTtJQUN4RSxxREFBcUQ7SUFDckQsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLEtBQUssVUFBVSxZQUFZLENBQUMsaUJBQTBCO1FBQ3BELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixrRUFBa0U7WUFDbEUsMERBQTBEO1lBQzFELElBQUksQ0FBQyxZQUFZLDhCQUFxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO2dCQUMxRCxlQUFLLENBQUMsYUFBRyxDQUFDLDZCQUE2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QU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsZUFBSyxDQUFDLGdCQUFNLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsd0VBQXdFO0lBQ3hFLHFDQUFxQztJQUNyQyxNQUFPLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7SUFDdkMsMkVBQTJFO0lBQzNFLGdCQUFnQjtJQUNoQixPQUFPLElBQUksMkJBQW9CLENBQUMsTUFBZ0MsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDaEYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2ssIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3N9IGZyb20gJy4vdGFzayc7XG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGZsYWdzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChwck51bWJlcjogbnVtYmVyLCBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICAvLyBTZXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHNraXAgYWxsIGdpdCBjb21taXQgaG9va3MgdHJpZ2dlcmVkIGJ5IGh1c2t5LiBXZSBhcmUgdW5hYmxlIHRvXG4gIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgY29uc3QgYXBpID0gYXdhaXQgY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3MpO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCEoYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGVycm9yKHJlZCgnR2l0aHViIEFQSSByZXF1ZXN0IGZhaWxlZC4gJyArIGUubWVzc2FnZSkpO1xuICAgICAgICBlcnJvcih5ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIGNvbXBsZXRlZCB3aXRob3V0IGVycm9ycyBvciBub3QuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQ6IE1lcmdlUmVzdWx0LCBkaXNhYmxlRm9yY2VNZXJnZVByb21wdCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2ZhaWx1cmUsIHN0YXR1c30gPSByZXN1bHQ7XG4gICAgY29uc3QgY2FuRm9yY2libHlNZXJnZSA9IGZhaWx1cmUgJiYgZmFpbHVyZS5ub25GYXRhbDtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlNVQ0NFU1M6XG4gICAgICAgIGluZm8oZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogIyR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChcbiAgICAgICAgICAgIGBMb2NhbCB3b3JraW5nIHJlcG9zaXRvcnkgbm90IGNsZWFuLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBgICtcbiAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICByZWQoXG4gICAgICAgICAgICAnQW4gdW5rbm93biBHaXQgZXJyb3IgaGFzIGJlZW4gdGhyb3duLiBQbGVhc2UgY2hlY2sgdGhlIG91dHB1dCAnICsgJ2Fib3ZlIGZvciBkZXRhaWxzLicsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1I6XG4gICAgICAgIGVycm9yKHJlZCgnQW4gZXJyb3IgcmVsYXRlZCB0byBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YiBoYXMgYmVlbiBkaXNjb3ZlcmVkLicpKTtcbiAgICAgICAgZXJyb3IoZmFpbHVyZSEubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEOlxuICAgICAgICBpbmZvKGBNZXJnZSBvZiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBtYW51YWxseTogIyR7cHJOdW1iZXJ9YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5GQUlMRUQ6XG4gICAgICAgIGVycm9yKHllbGxvdyhgQ291bGQgbm90IG1lcmdlIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0LmApKTtcbiAgICAgICAgZXJyb3IocmVkKGZhaWx1cmUhLm1lc3NhZ2UpKTtcbiAgICAgICAgaWYgKGNhbkZvcmNpYmx5TWVyZ2UgJiYgIWRpc2FibGVGb3JjZU1lcmdlUHJvbXB0KSB7XG4gICAgICAgICAgaW5mbygpO1xuICAgICAgICAgIGluZm8oeWVsbG93KCdUaGUgcHVsbCByZXF1ZXN0IGFib3ZlIGZhaWxlZCBkdWUgdG8gbm9uLWNyaXRpY2FsIGVycm9ycy4nKSk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coYFRoaXMgZXJyb3IgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQgaWYgZGVzaXJlZC5gKSk7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYFVuZXhwZWN0ZWQgbWVyZ2UgcmVzdWx0OiAke3N0YXR1c31gKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UgdGFzayB1c2luZyB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBvcHRpb25zLiBFeHBsaWNpdCBjb25maWd1cmF0aW9uXG4gKiBvcHRpb25zIGNhbiBiZSBzcGVjaWZpZWQgd2hlbiB0aGUgbWVyZ2Ugc2NyaXB0IGlzIHVzZWQgb3V0c2lkZSBvZiBhbiBgbmctZGV2YCBjb25maWd1cmVkXG4gKiByZXBvc2l0b3J5LlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVQdWxsUmVxdWVzdE1lcmdlVGFzayhmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICBjb25zdCBkZXZJbmZyYUNvbmZpZyA9IGdldENvbmZpZygpO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCB7Y29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGRldkluZnJhQ29uZmlnLCBnaXQuZ2l0aHViKTtcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgIGVycm9ycy5mb3JFYWNoKChkZXNjKSA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gU2V0IHRoZSByZW1vdGUgc28gdGhhdCB0aGUgbWVyZ2UgdG9vbCBoYXMgYWNjZXNzIHRvIGluZm9ybWF0aW9uIGFib3V0XG4gIC8vIHRoZSByZW1vdGUgaXQgaW50ZW5kcyB0byBtZXJnZSB0by5cbiAgY29uZmlnIS5yZW1vdGUgPSBkZXZJbmZyYUNvbmZpZy5naXRodWI7XG4gIC8vIFdlIGNhbiBjYXN0IHRoaXMgdG8gYSBtZXJnZSBjb25maWcgd2l0aCByZW1vdGUgYmVjYXVzZSB3ZSBhbHdheXMgc2V0IHRoZVxuICAvLyByZW1vdGUgYWJvdmUuXG4gIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2soY29uZmlnISBhcyBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIGdpdCwgZmxhZ3MpO1xufVxuIl19