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
            case 3 /* SUCCESS */:
                (0, console_1.info)((0, console_1.green)(`Successfully merged the pull request: #${prNumber}`));
                return true;
            case 1 /* DIRTY_WORKING_DIR */:
                (0, console_1.error)((0, console_1.red)(`Local working repository not clean. Please make sure there are ` +
                    `no uncommitted changes.`));
                return false;
            case 2 /* UNEXPECTED_SHALLOW_REPO */:
                (0, console_1.error)((0, console_1.red)(`Unable to perform merge in a local repository that is configured as shallow.`));
                (0, console_1.error)((0, console_1.red)(`Please convert the repository to a complete one by syncing with upstream.`));
                (0, console_1.error)((0, console_1.red)(`https://git-scm.com/docs/git-fetch#Documentation/git-fetch.txt---unshallow`));
                return false;
            case 0 /* UNKNOWN_GIT_ERROR */:
                (0, console_1.error)((0, console_1.red)('An unknown Git error has been thrown. Please check the output ' + 'above for details.'));
                return false;
            case 6 /* GITHUB_ERROR */:
                (0, console_1.error)((0, console_1.red)('An error related to interacting with Github has been discovered.'));
                (0, console_1.error)(failure.message);
                return false;
            case 5 /* USER_ABORTED */:
                (0, console_1.info)(`Merge of pull request has been aborted manually: #${prNumber}`);
                return true;
            case 4 /* FAILED */:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZGO0FBQzdGLGlEQUFtRjtBQUNuRix1RkFBZ0Y7QUFDaEYsbURBQTZEO0FBQzdELDZEQUFzRTtBQUV0RSxxQ0FBZ0Q7QUFDaEQsaUNBQWlHO0FBRWpHOzs7Ozs7Ozs7O0dBVUc7QUFDSSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxLQUFnQztJQUN2RixpR0FBaUc7SUFDakcsd0ZBQXdGO0lBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBRTNCLE1BQU0sR0FBRyxHQUFHLE1BQU0sMEJBQTBCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEQsOEVBQThFO0lBQzlFLHdFQUF3RTtJQUN4RSxxREFBcUQ7SUFDckQsSUFBSSxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLEtBQUssVUFBVSxZQUFZLENBQUMsaUJBQTBCO1FBQ3BELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUM7WUFDNUQsT0FBTyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixrRUFBa0U7WUFDbEUsMERBQTBEO1lBQzFELElBQUksQ0FBQyxZQUFZLDhCQUFxQixJQUFJLENBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO2dCQUMxRCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcs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IEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnRWYWxpZEdpdGh1YkNvbmZpZywgQ29uZmlnVmFsaWRhdGlvbkVycm9yLCBnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcblxuaW1wb3J0IHthc3NlcnRWYWxpZE1lcmdlQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2ssIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3N9IGZyb20gJy4vdGFzayc7XG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGZsYWdzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChwck51bWJlcjogbnVtYmVyLCBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICAvLyBTZXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHNraXAgYWxsIGdpdCBjb21taXQgaG9va3MgdHJpZ2dlcmVkIGJ5IGh1c2t5LiBXZSBhcmUgdW5hYmxlIHRvXG4gIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgY29uc3QgYXBpID0gYXdhaXQgY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3MpO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCEoYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGVycm9yKHJlZCgnR2l0aHViIEFQSSByZXF1ZXN0IGZhaWxlZC4gJyArIGUubWVzc2FnZSkpO1xuICAgICAgICBlcnJvcih5ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIGNvbXBsZXRlZCB3aXRob3V0IGVycm9ycyBvciBub3QuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQ6IE1lcmdlUmVzdWx0LCBkaXNhYmxlRm9yY2VNZXJnZVByb21wdCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2ZhaWx1cmUsIHN0YXR1c30gPSByZXN1bHQ7XG4gICAgY29uc3QgY2FuRm9yY2libHlNZXJnZSA9IGZhaWx1cmUgJiYgZmFpbHVyZS5ub25GYXRhbDtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlNVQ0NFU1M6XG4gICAgICAgIGluZm8oZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogIyR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChcbiAgICAgICAgICAgIGBMb2NhbCB3b3JraW5nIHJlcG9zaXRvcnkgbm90IGNsZWFuLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBgICtcbiAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVORVhQRUNURURfU0hBTExPV19SRVBPOlxuICAgICAgICBlcnJvcihyZWQoYFVuYWJsZSB0byBwZXJmb3JtIG1lcmdlIGluIGEgbG9jYWwgcmVwb3NpdG9yeSB0aGF0IGlzIGNvbmZpZ3VyZWQgYXMgc2hhbGxvdy5gKSk7XG4gICAgICAgIGVycm9yKHJlZChgUGxlYXNlIGNvbnZlcnQgdGhlIHJlcG9zaXRvcnkgdG8gYSBjb21wbGV0ZSBvbmUgYnkgc3luY2luZyB3aXRoIHVwc3RyZWFtLmApKTtcbiAgICAgICAgZXJyb3IocmVkKGBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LWZldGNoI0RvY3VtZW50YXRpb24vZ2l0LWZldGNoLnR4dC0tLXVuc2hhbGxvd2ApKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKFxuICAgICAgICAgICAgJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArICdhYm92ZSBmb3IgZGV0YWlscy4nLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRDpcbiAgICAgICAgaW5mbyhgTWVyZ2Ugb2YgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgbWFudWFsbHk6ICMke3ByTnVtYmVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlIHRhc2sgdXNpbmcgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gb3B0aW9ucy4gRXhwbGljaXQgY29uZmlndXJhdGlvblxuICogb3B0aW9ucyBjYW4gYmUgc3BlY2lmaWVkIHdoZW4gdGhlIG1lcmdlIHNjcmlwdCBpcyB1c2VkIG91dHNpZGUgb2YgYW4gYG5nLWRldmAgY29uZmlndXJlZFxuICogcmVwb3NpdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgICBhc3NlcnRWYWxpZEdpdGh1YkNvbmZpZyhjb25maWcpO1xuICAgIGFzc2VydFZhbGlkTWVyZ2VDb25maWcoY29uZmlnKTtcbiAgICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICAgIGNvbnN0IGdpdCA9IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuZ2V0KCk7XG5cbiAgICAvLyBTZXQgdGhlIHJlbW90ZSBzbyB0aGF0IHRoZSBtZXJnZSB0b29sIGhhcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXRcbiAgICAvLyB0aGUgcmVtb3RlIGl0IGludGVuZHMgdG8gbWVyZ2UgdG8uXG4gICAgY29uc3QgbWVyZ2VDb25maWcgPSB7XG4gICAgICByZW1vdGU6IGNvbmZpZy5naXRodWIsXG4gICAgICAuLi5jb25maWcubWVyZ2UsXG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2sobWVyZ2VDb25maWcsIGdpdCwgZmxhZ3MpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBDb25maWdWYWxpZGF0aW9uRXJyb3IpIHtcbiAgICAgIGlmIChlLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgICAgICBlLmVycm9ycy5mb3JFYWNoKChkZXNjKSA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvcihyZWQoZS5tZXNzYWdlKSk7XG4gICAgICB9XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn1cbiJdfQ==