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
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { GithubApiRequestError } from '../../utils/git/github';
import { GITHUB_TOKEN_GENERATE_URL } from '../../utils/git/github-urls';
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
                    git = AuthenticatedGitClient.get();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUNuRixPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSwwQ0FBMEMsQ0FBQztBQUNoRixPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSw2QkFBNkIsQ0FBQztBQUV0RSxPQUFPLEVBQUMscUJBQXFCLEVBQXdCLE1BQU0sVUFBVSxDQUFDO0FBQ3RFLE9BQU8sRUFBMkIsb0JBQW9CLEVBQTRCLE1BQU0sUUFBUSxDQUFDO0FBRWpHOzs7Ozs7Ozs7O0dBVUc7QUFDSCxNQUFNLFVBQWdCLGdCQUFnQixDQUFDLFFBQWdCLEVBQUUsS0FBZ0M7O1FBY3ZGLHVFQUF1RTtRQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7NEJBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7OzRCQUFyRCxNQUFNLEdBQUcsU0FBNEM7NEJBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO2dDQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7NEJBRTFELGtFQUFrRTs0QkFDbEUsMERBQTBEOzRCQUMxRCxJQUFJLEdBQUMsWUFBWSxxQkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtnQ0FDMUQsS0FBSyxDQUFDLEdBQUcsQ0FBQyw2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QUE7O29CQUg5Qiw4RUFBOEU7b0JBQzlFLHdFQUF3RTtvQkFDeEUscURBQXFEO29CQUNyRCxJQUFJLENBQUMsQ0FBQSxTQUF5QixDQUFBLEVBQUU7d0JBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pCOzs7OztDQThFRjtBQUVEOzs7O0dBSUc7QUFDSCxTQUFlLDBCQUEwQixDQUFDLEtBQWdDOzs7Ozs7b0JBQ2xFLGNBQWMsR0FBRyxTQUFTLEVBQUUsQ0FBQztvQkFFN0IsR0FBRyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUNoQixxQkFBTSxxQkFBcUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOztvQkFBMUUsS0FBbUIsU0FBdUQsRUFBekUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUFBO29CQUVyQixJQUFJLE1BQU0sRUFBRTt3QkFDVixLQUFLLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQzt3QkFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBUSxJQUFNLENBQUMsQ0FBQyxFQUE3QixDQUE2QixDQUFDLENBQUM7d0JBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pCO29CQUVELHdFQUF3RTtvQkFDeEUscUNBQXFDO29CQUNyQyxNQUFPLENBQUMsTUFBTSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUM7b0JBQ3ZDLDJFQUEyRTtvQkFDM0UsZ0JBQWdCO29CQUNoQixzQkFBTyxJQUFJLG9CQUFvQixDQUFDLE1BQWdDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFDOzs7O0NBQy9FIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcblxuaW1wb3J0IHtsb2FkQW5kVmFsaWRhdGVDb25maWcsIE1lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzfSBmcm9tICcuL3Rhc2snO1xuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBmbGFncyBDb25maWd1cmF0aW9uIG9wdGlvbnMgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QocHJOdW1iZXI6IG51bWJlciwgZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MpIHtcbiAgLy8gU2V0IHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBza2lwIGFsbCBnaXQgY29tbWl0IGhvb2tzIHRyaWdnZXJlZCBieSBodXNreS4gV2UgYXJlIHVuYWJsZSB0b1xuICAvLyByZWx5IG9uIGAtLW5vLXZlcmlmeWAgYXMgc29tZSBob29rcyBzdGlsbCBydW4sIG5vdGFibHkgdGhlIGBwcmVwYXJlLWNvbW1pdC1tc2dgIGhvb2suXG4gIHByb2Nlc3MuZW52WydIVVNLWSddID0gJzAnO1xuXG4gIGNvbnN0IGFwaSA9IGF3YWl0IGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGZsYWdzKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkge1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgbWVyZ2UgYW5kIHJldHVybnMgd2hldGhlciBpdCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuICovXG4gIGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1NZXJnZShpZ25vcmVGYXRhbEVycm9yczogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkubWVyZ2UocHJOdW1iZXIsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gdGhlIEdpdGh1YiBBUEkgZm9yIGludmFsaWQgcmVxdWVzdHMuIFdlIHdhbnQgdG9cbiAgICAgIC8vIGV4aXQgdGhlIHNjcmlwdCB3aXRoIGEgYmV0dGVyIGV4cGxhbmF0aW9uIG9mIHRoZSBlcnJvci5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0aHViQXBpUmVxdWVzdEVycm9yICYmIGUuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgZXJyb3IocmVkKCdHaXRodWIgQVBJIHJlcXVlc3QgZmFpbGVkLiAnICsgZS5tZXNzYWdlKSk7XG4gICAgICAgIGVycm9yKHllbGxvdygnUGxlYXNlIGVuc3VyZSB0aGF0IHlvdXIgcHJvdmlkZWQgdG9rZW4gaXMgdmFsaWQuJykpO1xuICAgICAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3Qgc2hvdWxkIGJlIGZvcmNpYmx5IG1lcmdlZC4gSWYgc28sIG1lcmdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBmb3JjaWJseSAoaWdub3Jpbmcgbm9uLWNyaXRpY2FsIGZhaWx1cmVzKS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBmb3JjaWJseSBtZXJnZWQuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gZm9yY2libHkgcHJvY2VlZCB3aXRoIG1lcmdpbmc/JykpIHtcbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIGZvcmNlIG1vZGUuIFRoaXMgbWVhbnMgdGhhdCBub24tZmF0YWwgZmFpbHVyZXNcbiAgICAgIC8vIGFyZSBpZ25vcmVkIGFuZCB0aGUgbWVyZ2UgY29udGludWVzLlxuICAgICAgcmV0dXJuIHBlcmZvcm1NZXJnZSh0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIG1lcmdlIHJlc3VsdCBieSBwcmludGluZyBjb25zb2xlIG1lc3NhZ2VzLCBleGl0aW5nIHRoZSBwcm9jZXNzXG4gICAqIGJhc2VkIG9uIHRoZSByZXN1bHQsIG9yIGJ5IHJlc3RhcnRpbmcgdGhlIG1lcmdlIGlmIGZvcmNlIG1vZGUgaGFzIGJlZW4gZW5hYmxlZC5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVyZ2UgY29tcGxldGVkIHdpdGhvdXQgZXJyb3JzIG9yIG5vdC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdDogTWVyZ2VSZXN1bHQsIGRpc2FibGVGb3JjZU1lcmdlUHJvbXB0ID0gZmFsc2UpIHtcbiAgICBjb25zdCB7ZmFpbHVyZSwgc3RhdHVzfSA9IHJlc3VsdDtcbiAgICBjb25zdCBjYW5Gb3JjaWJseU1lcmdlID0gZmFpbHVyZSAmJiBmYWlsdXJlLm5vbkZhdGFsO1xuXG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuU1VDQ0VTUzpcbiAgICAgICAgaW5mbyhncmVlbihgU3VjY2Vzc2Z1bGx5IG1lcmdlZCB0aGUgcHVsbCByZXF1ZXN0OiAjJHtwck51bWJlcn1gKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoYExvY2FsIHdvcmtpbmcgcmVwb3NpdG9yeSBub3QgY2xlYW4uIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIGAgK1xuICAgICAgICAgICAgICAgIGBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzLmApKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArXG4gICAgICAgICAgICAgICAgJ2Fib3ZlIGZvciBkZXRhaWxzLicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1I6XG4gICAgICAgIGVycm9yKHJlZCgnQW4gZXJyb3IgcmVsYXRlZCB0byBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YiBoYXMgYmVlbiBkaXNjb3ZlcmVkLicpKTtcbiAgICAgICAgZXJyb3IoZmFpbHVyZSEubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEOlxuICAgICAgICBpbmZvKGBNZXJnZSBvZiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBtYW51YWxseTogIyR7cHJOdW1iZXJ9YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5GQUlMRUQ6XG4gICAgICAgIGVycm9yKHllbGxvdyhgQ291bGQgbm90IG1lcmdlIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0LmApKTtcbiAgICAgICAgZXJyb3IocmVkKGZhaWx1cmUhLm1lc3NhZ2UpKTtcbiAgICAgICAgaWYgKGNhbkZvcmNpYmx5TWVyZ2UgJiYgIWRpc2FibGVGb3JjZU1lcmdlUHJvbXB0KSB7XG4gICAgICAgICAgaW5mbygpO1xuICAgICAgICAgIGluZm8oeWVsbG93KCdUaGUgcHVsbCByZXF1ZXN0IGFib3ZlIGZhaWxlZCBkdWUgdG8gbm9uLWNyaXRpY2FsIGVycm9ycy4nKSk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coYFRoaXMgZXJyb3IgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQgaWYgZGVzaXJlZC5gKSk7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYFVuZXhwZWN0ZWQgbWVyZ2UgcmVzdWx0OiAke3N0YXR1c31gKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UgdGFzayB1c2luZyB0aGUgZ2l2ZW4gY29uZmlndXJhdGlvbiBvcHRpb25zLiBFeHBsaWNpdCBjb25maWd1cmF0aW9uXG4gKiBvcHRpb25zIGNhbiBiZSBzcGVjaWZpZWQgd2hlbiB0aGUgbWVyZ2Ugc2NyaXB0IGlzIHVzZWQgb3V0c2lkZSBvZiBhbiBgbmctZGV2YCBjb25maWd1cmVkXG4gKiByZXBvc2l0b3J5LlxuICovXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVQdWxsUmVxdWVzdE1lcmdlVGFzayhmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICBjb25zdCBkZXZJbmZyYUNvbmZpZyA9IGdldENvbmZpZygpO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCB7Y29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGRldkluZnJhQ29uZmlnLCBnaXQuZ2l0aHViKTtcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgIGVycm9ycy5mb3JFYWNoKGRlc2MgPT4gZXJyb3IoeWVsbG93KGAgIC0gICR7ZGVzY31gKSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgcmVtb3RlIHNvIHRoYXQgdGhlIG1lcmdlIHRvb2wgaGFzIGFjY2VzcyB0byBpbmZvcm1hdGlvbiBhYm91dFxuICAvLyB0aGUgcmVtb3RlIGl0IGludGVuZHMgdG8gbWVyZ2UgdG8uXG4gIGNvbmZpZyEucmVtb3RlID0gZGV2SW5mcmFDb25maWcuZ2l0aHViO1xuICAvLyBXZSBjYW4gY2FzdCB0aGlzIHRvIGEgbWVyZ2UgY29uZmlnIHdpdGggcmVtb3RlIGJlY2F1c2Ugd2UgYWx3YXlzIHNldCB0aGVcbiAgLy8gcmVtb3RlIGFib3ZlLlxuICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGNvbmZpZyEgYXMgTWVyZ2VDb25maWdXaXRoUmVtb3RlLCBnaXQsIGZsYWdzKTtcbn1cbiJdfQ==