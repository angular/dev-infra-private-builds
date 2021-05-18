/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator } from "tslib";
import { getConfig } from '../../utils/config';
import { error, green, info, promptConfirm, red, yellow } from '../../utils/console';
import { GithubApiRequestError } from '../../utils/git/github';
import { GITHUB_TOKEN_GENERATE_URL } from '../../utils/git/github-urls';
import { GitClient } from '../../utils/git/index';
import { loadAndValidateConfig } from './config';
import { PullRequestMergeTask } from './task';
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
export function mergePullRequest(prNumber, flags) {
    return __awaiter(this, void 0, void 0, function () {
        /** Performs the merge and returns whether it was successful or not. */
        function performMerge(ignoreFatalErrors) {
            return __awaiter(this, void 0, void 0, function () {
                var result, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, api.merge(prNumber, ignoreFatalErrors)];
                        case 1:
                            result = _a.sent();
                            return [4 /*yield*/, handleMergeResult(result, ignoreFatalErrors)];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            e_1 = _a.sent();
                            // Catch errors to the Github API for invalid requests. We want to
                            // exit the script with a better explanation of the error.
                            if (e_1 instanceof GithubApiRequestError && e_1.status === 401) {
                                error(red('Github API request failed. ' + e_1.message));
                                error(yellow('Please ensure that your provided token is valid.'));
                                error(yellow("You can generate a token here: " + GITHUB_TOKEN_GENERATE_URL));
                                process.exit(1);
                            }
                            throw e_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        /**
         * Prompts whether the specified pull request should be forcibly merged. If so, merges
         * the specified pull request forcibly (ignoring non-critical failures).
         * @returns Whether the specified pull request has been forcibly merged.
         */
        function promptAndPerformForceMerge() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, promptConfirm('Do you want to forcibly proceed with merging?')];
                        case 1:
                            if (_a.sent()) {
                                // Perform the merge in force mode. This means that non-fatal failures
                                // are ignored and the merge continues.
                                return [2 /*return*/, performMerge(true)];
                            }
                            return [2 /*return*/, false];
                    }
                });
            });
        }
        /**
         * Handles the merge result by printing console messages, exiting the process
         * based on the result, or by restarting the merge if force mode has been enabled.
         * @returns Whether the merge completed without errors or not.
         */
        function handleMergeResult(result, disableForceMergePrompt) {
            if (disableForceMergePrompt === void 0) { disableForceMergePrompt = false; }
            return __awaiter(this, void 0, void 0, function () {
                var failure, status, canForciblyMerge, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            failure = result.failure, status = result.status;
                            canForciblyMerge = failure && failure.nonFatal;
                            _a = status;
                            switch (_a) {
                                case 2 /* SUCCESS */: return [3 /*break*/, 1];
                                case 1 /* DIRTY_WORKING_DIR */: return [3 /*break*/, 2];
                                case 0 /* UNKNOWN_GIT_ERROR */: return [3 /*break*/, 3];
                                case 5 /* GITHUB_ERROR */: return [3 /*break*/, 4];
                                case 4 /* USER_ABORTED */: return [3 /*break*/, 5];
                                case 3 /* FAILED */: return [3 /*break*/, 6];
                            }
                            return [3 /*break*/, 9];
                        case 1:
                            info(green("Successfully merged the pull request: #" + prNumber));
                            return [2 /*return*/, true];
                        case 2:
                            error(red("Local working repository not clean. Please make sure there are " +
                                "no uncommitted changes."));
                            return [2 /*return*/, false];
                        case 3:
                            error(red('An unknown Git error has been thrown. Please check the output ' +
                                'above for details.'));
                            return [2 /*return*/, false];
                        case 4:
                            error(red('An error related to interacting with Github has been discovered.'));
                            error(failure.message);
                            return [2 /*return*/, false];
                        case 5:
                            info("Merge of pull request has been aborted manually: #" + prNumber);
                            return [2 /*return*/, true];
                        case 6:
                            error(yellow("Could not merge the specified pull request."));
                            error(red(failure.message));
                            if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 8];
                            info();
                            info(yellow('The pull request above failed due to non-critical errors.'));
                            info(yellow("This error can be forcibly ignored if desired."));
                            return [4 /*yield*/, promptAndPerformForceMerge()];
                        case 7: return [2 /*return*/, _b.sent()];
                        case 8: return [2 /*return*/, false];
                        case 9: throw Error("Unexpected merge result: " + status);
                    }
                });
            });
        }
        var api;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
                    // rely on `--no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
                    process.env['HUSKY'] = '0';
                    return [4 /*yield*/, createPullRequestMergeTask(flags)];
                case 1:
                    api = _a.sent();
                    return [4 /*yield*/, performMerge(false)];
                case 2:
                    // Perform the merge. Force mode can be activated through a command line flag.
                    // Alternatively, if the merge fails with non-fatal failures, the script
                    // will prompt whether it should rerun in force mode.
                    if (!(_a.sent())) {
                        process.exit(1);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates the pull request merge task using the given configuration options. Explicit configuration
 * options can be specified when the merge script is used outside of an `ng-dev` configured
 * repository.
 */
function createPullRequestMergeTask(flags) {
    return __awaiter(this, void 0, void 0, function () {
        var devInfraConfig, git, _a, config, errors;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    devInfraConfig = getConfig();
                    git = GitClient.getAuthenticatedInstance();
                    return [4 /*yield*/, loadAndValidateConfig(devInfraConfig, git.github)];
                case 1:
                    _a = _b.sent(), config = _a.config, errors = _a.errors;
                    if (errors) {
                        error(red('Invalid merge configuration:'));
                        errors.forEach(function (desc) { return error(yellow("  -  " + desc)); });
                        process.exit(1);
                    }
                    // Set the remote so that the merge tool has access to information about
                    // the remote it intends to merge to.
                    config.remote = devInfraConfig.github;
                    // We can cast this to a merge config with remote because we always set the
                    // remote above.
                    return [2 /*return*/, new PullRequestMergeTask(config, git, flags)];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUN0RSxPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sdUJBQXVCLENBQUM7QUFFaEQsT0FBTyxFQUFDLHFCQUFxQixFQUF3QixNQUFNLFVBQVUsQ0FBQztBQUN0RSxPQUFPLEVBQTJCLG9CQUFvQixFQUE0QixNQUFNLFFBQVEsQ0FBQztBQUVqRzs7Ozs7Ozs7OztHQVVHO0FBQ0gsTUFBTSxVQUFnQixnQkFBZ0IsQ0FBQyxRQUFnQixFQUFFLEtBQWdDOztRQWN2Rix1RUFBdUU7UUFDdkUsU0FBZSxZQUFZLENBQUMsaUJBQTBCOzs7Ozs7OzRCQUVuQyxxQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOzs0QkFBckQsTUFBTSxHQUFHLFNBQTRDOzRCQUNwRCxxQkFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBQTtnQ0FBekQsc0JBQU8sU0FBa0QsRUFBQzs7OzRCQUUxRCxrRUFBa0U7NEJBQ2xFLDBEQUEwRDs0QkFDMUQsSUFBSSxHQUFDLFlBQVkscUJBQXFCLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7Z0NBQzFELEtBQUssQ0FBQyxHQUFHLENBQUMsNkJB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OztvQkFIOUIsOEVBQThFO29CQUM5RSx3RUFBd0U7b0JBQ3hFLHFEQUFxRDtvQkFDckQsSUFBSSxDQUFDLENBQUEsU0FBeUIsQ0FBQSxFQUFFO3dCQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjs7Ozs7Q0E4RUY7QUFFRDs7OztHQUlHO0FBQ0gsU0FBZSwwQkFBMEIsQ0FBQyxLQUFnQzs7Ozs7O29CQUNsRSxjQUFjLEdBQUcsU0FBUyxFQUFFLENBQUM7b0JBRTdCLEdBQUcsR0FBRyxTQUFTLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztvQkFDeEIscUJBQU0scUJBQXFCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBQTs7b0JBQTFFLEtBQW1CLFNBQXVELEVBQXpFLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBQTtvQkFFckIsSUFBSSxNQUFNLEVBQUU7d0JBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7d0JBQzNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVEsSUFBTSxDQUFDLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDO3dCQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtvQkFFRCx3RUFBd0U7b0JBQ3hFLHFDQUFxQztvQkFDckMsTUFBTyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO29CQUN2QywyRUFBMkU7b0JBQzNFLGdCQUFnQjtvQkFDaEIsc0JBQU8sSUFBSSxvQkFBb0IsQ0FBQyxNQUFnQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBQzs7OztDQUMvRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2ssIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3N9IGZyb20gJy4vdGFzayc7XG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGZsYWdzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChwck51bWJlcjogbnVtYmVyLCBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICAvLyBTZXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHNraXAgYWxsIGdpdCBjb21taXQgaG9va3MgdHJpZ2dlcmVkIGJ5IGh1c2t5LiBXZSBhcmUgdW5hYmxlIHRvXG4gIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgY29uc3QgYXBpID0gYXdhaXQgY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3MpO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCFhd2FpdCBwZXJmb3JtTWVyZ2UoZmFsc2UpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcnMgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICMke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZChgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZCgnQW4gdW5rbm93biBHaXQgZXJyb3IgaGFzIGJlZW4gdGhyb3duLiBQbGVhc2UgY2hlY2sgdGhlIG91dHB1dCAnICtcbiAgICAgICAgICAgICAgICAnYWJvdmUgZm9yIGRldGFpbHMuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUjpcbiAgICAgICAgZXJyb3IocmVkKCdBbiBlcnJvciByZWxhdGVkIHRvIGludGVyYWN0aW5nIHdpdGggR2l0aHViIGhhcyBiZWVuIGRpc2NvdmVyZWQuJykpO1xuICAgICAgICBlcnJvcihmYWlsdXJlIS5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUQ6XG4gICAgICAgIGluZm8oYE1lcmdlIG9mIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIG1hbnVhbGx5OiAjJHtwck51bWJlcn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgZXJyb3IoeWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBlcnJvcihyZWQoZmFpbHVyZSEubWVzc2FnZSkpO1xuICAgICAgICBpZiAoY2FuRm9yY2libHlNZXJnZSAmJiAhZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQpIHtcbiAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBpbmZvKHllbGxvdyhgVGhpcyBlcnJvciBjYW4gYmUgZm9yY2libHkgaWdub3JlZCBpZiBkZXNpcmVkLmApKTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgVW5leHBlY3RlZCBtZXJnZSByZXN1bHQ6ICR7c3RhdHVzfWApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZSB0YXNrIHVzaW5nIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIG9wdGlvbnMuIEV4cGxpY2l0IGNvbmZpZ3VyYXRpb25cbiAqIG9wdGlvbnMgY2FuIGJlIHNwZWNpZmllZCB3aGVuIHRoZSBtZXJnZSBzY3JpcHQgaXMgdXNlZCBvdXRzaWRlIG9mIGFuIGBuZy1kZXZgIGNvbmZpZ3VyZWRcbiAqIHJlcG9zaXRvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzKSB7XG4gIGNvbnN0IGRldkluZnJhQ29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKTtcbiAgY29uc3Qge2NvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhkZXZJbmZyYUNvbmZpZywgZ2l0LmdpdGh1Yik7XG5cbiAgaWYgKGVycm9ycykge1xuICAgIGVycm9yKHJlZCgnSW52YWxpZCBtZXJnZSBjb25maWd1cmF0aW9uOicpKTtcbiAgICBlcnJvcnMuZm9yRWFjaChkZXNjID0+IGVycm9yKHllbGxvdyhgICAtICAke2Rlc2N9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIHJlbW90ZSBzbyB0aGF0IHRoZSBtZXJnZSB0b29sIGhhcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXRcbiAgLy8gdGhlIHJlbW90ZSBpdCBpbnRlbmRzIHRvIG1lcmdlIHRvLlxuICBjb25maWchLnJlbW90ZSA9IGRldkluZnJhQ29uZmlnLmdpdGh1YjtcbiAgLy8gV2UgY2FuIGNhc3QgdGhpcyB0byBhIG1lcmdlIGNvbmZpZyB3aXRoIHJlbW90ZSBiZWNhdXNlIHdlIGFsd2F5cyBzZXQgdGhlXG4gIC8vIHJlbW90ZSBhYm92ZS5cbiAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhjb25maWchIGFzIE1lcmdlQ29uZmlnV2l0aFJlbW90ZSwgZ2l0LCBmbGFncyk7XG59XG4iXX0=