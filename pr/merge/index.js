/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
    var task_1 = require("@angular/dev-infra-private/pr/merge/task");
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
    function mergePullRequest(prNumber, flags) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            /** Performs the merge and returns whether it was successful or not. */
            function performMerge(ignoreFatalErrors) {
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var result, e_1;
                    return tslib_1.__generator(this, function (_a) {
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
                                if (e_1 instanceof github_1.GithubApiRequestError && e_1.status === 401) {
                                    console_1.error(console_1.red('Github API request failed. ' + e_1.message));
                                    console_1.error(console_1.yellow('Please ensure that your provided token is valid.'));
                                    console_1.error(console_1.yellow("You can generate a token here: " + github_urls_1.GITHUB_TOKEN_GENERATE_URL));
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
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    return tslib_1.__generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, console_1.promptConfirm('Do you want to forcibly proceed with merging?')];
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
                return tslib_1.__awaiter(this, void 0, void 0, function () {
                    var failure, status, canForciblyMerge, _a;
                    return tslib_1.__generator(this, function (_b) {
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
                                console_1.info(console_1.green("Successfully merged the pull request: #" + prNumber));
                                return [2 /*return*/, true];
                            case 2:
                                console_1.error(console_1.red("Local working repository not clean. Please make sure there are " +
                                    "no uncommitted changes."));
                                return [2 /*return*/, false];
                            case 3:
                                console_1.error(console_1.red('An unknown Git error has been thrown. Please check the output ' +
                                    'above for details.'));
                                return [2 /*return*/, false];
                            case 4:
                                console_1.error(console_1.red('An error related to interacting with Github has been discovered.'));
                                console_1.error(failure.message);
                                return [2 /*return*/, false];
                            case 5:
                                console_1.info("Merge of pull request has been aborted manually: #" + prNumber);
                                return [2 /*return*/, true];
                            case 6:
                                console_1.error(console_1.yellow("Could not merge the specified pull request."));
                                console_1.error(console_1.red(failure.message));
                                if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 8];
                                console_1.info();
                                console_1.info(console_1.yellow('The pull request above failed due to non-critical errors.'));
                                console_1.info(console_1.yellow("This error can be forcibly ignored if desired."));
                                return [4 /*yield*/, promptAndPerformForceMerge()];
                            case 7: return [2 /*return*/, _b.sent()];
                            case 8: return [2 /*return*/, false];
                            case 9: throw Error("Unexpected merge result: " + status);
                        }
                    });
                });
            }
            var api;
            return tslib_1.__generator(this, function (_a) {
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
    exports.mergePullRequest = mergePullRequest;
    /**
     * Creates the pull request merge task using the given configuration options. Explicit configuration
     * options can be specified when the merge script is used outside of an `ng-dev` configured
     * repository.
     */
    function createPullRequestMergeTask(flags) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var devInfraConfig, git, _a, config, errors;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        devInfraConfig = config_1.getConfig();
                        git = index_1.GitClient.getAuthenticatedInstance();
                        return [4 /*yield*/, config_2.loadAndValidateConfig(devInfraConfig, git.github)];
                    case 1:
                        _a = _b.sent(), config = _a.config, errors = _a.errors;
                        if (errors) {
                            console_1.error(console_1.red('Invalid merge configuration:'));
                            errors.forEach(function (desc) { return console_1.error(console_1.yellow("  -  " + desc)); });
                            process.exit(1);
                        }
                        // Set the remote so that the merge tool has access to information about
                        // the remote it intends to merge to.
                        config.remote = devInfraConfig.github;
                        // We can cast this to a merge config with remote because we always set the
                        // remote above.
                        return [2 /*return*/, new task_1.PullRequestMergeTask(config, git, flags)];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUE2QztJQUM3QyxvRUFBbUY7SUFDbkYsc0VBQTZEO0lBQzdELGdGQUFzRTtJQUN0RSxvRUFBZ0Q7SUFFaEQscUVBQXNFO0lBQ3RFLGlFQUFpRztJQUVqRzs7Ozs7Ozs7OztPQVVHO0lBQ0gsU0FBc0IsZ0JBQWdCLENBQUMsUUFBZ0IsRUFBRSxLQUFnQzs7WUFjdkYsdUVBQXVFO1lBQ3ZFLFNBQWUsWUFBWSxDQUFDLGlCQUEwQjs7Ozs7OztnQ0FFbkMscUJBQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLENBQUMsRUFBQTs7Z0NBQXJELE1BQU0sR0FBRyxTQUE0QztnQ0FDcEQscUJBQU0saUJBQWlCLENBQUMsTUFBTSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7b0NBQXpELHNCQUFPLFNBQWtELEVBQUM7OztnQ0FFMUQsa0VBQWtFO2dDQUNsRSwwREFBMEQ7Z0NBQzFELElBQUksR0FBQyxZQUFZLDhCQUFxQixJQUFJLEdBQUMsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO29DQUMxRCxlQUFLLENBQUMsYUFBRyxDQUFDLDZCQUE2QixHQUFHLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29DQUN0RCxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7b0NBQ2xFLGVBQUssQ0FBQyxnQkFBTSxDQUFDLG9DQUFrQyx1Q0FBMkIsQ0FBQyxDQUFDLENBQUM7b0NBQzdFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUNBQ2pCO2dDQUNELE1BQU0sR0FBQyxDQUFDOzs7OzthQUVYO1lBRUQ7Ozs7ZUFJRztZQUNILFNBQWUsMEJBQTBCOzs7O29DQUNuQyxxQkFBTSx1QkFBYSxDQUFDLCtDQUErQyxDQUFDLEVBQUE7O2dDQUF4RSxJQUFJLFNBQW9FLEVBQUU7b0NBQ3hFLHNFQUFzRTtvQ0FDdEUsdUNBQXVDO29DQUN2QyxzQkFBTyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUM7aUNBQzNCO2dDQUNELHNCQUFPLEtBQUssRUFBQzs7OzthQUNkO1lBRUQ7Ozs7ZUFJRztZQUNILFNBQWUsaUJBQWlCLENBQUMsTUFBbUIsRUFBRSx1QkFBK0I7Z0JBQS9CLHdDQUFBLEVBQUEsK0JBQStCOzs7Ozs7Z0NBQzVFLE9BQU8sR0FBWSxNQUFNLFFBQWxCLEVBQUUsTUFBTSxHQUFJLE1BQU0sT0FBVixDQUFXO2dDQUMzQixnQkFBZ0IsR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQztnQ0FFN0MsS0FBQSxNQUFNLENBQUE7O3dEQUNZLENBQUMsQ0FBcEIsd0JBQW1CO2tFQUdVLENBQUMsQ0FBOUIsd0JBQTZCO2tFQUtBLENBQUMsQ0FBOUIsd0JBQTZCOzZEQUtMLENBQUMsQ0FBekIsd0JBQXdCOzZEQUlBLENBQUMsQ0FBekIsd0JBQXdCO3VEQUdOLENBQUMsQ0FBbkIsd0JBQWtCOzs7O2dDQW5CckIsY0FBSSxDQUFDLGVBQUssQ0FBQyw0Q0FBMEMsUUFBVSxDQUFDLENBQUMsQ0FBQztnQ0FDbEUsc0JBQU8sSUFBSSxFQUFDOztnQ0FFWixlQUFLLENBQ0QsYUFBRyxDQUFDLGlFQUFpRTtvQ0FDakUseUJBQXlCLENBQUMsQ0FBQyxDQUFDO2dDQUNwQyxzQkFBTyxLQUFLLEVBQUM7O2dDQUViLGVBQUssQ0FDRCxhQUFHLENBQUMsZ0VBQWdFO29DQUNoRSxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7Z0NBQy9CLHNCQUFPLEtBQUssRUFBQzs7Z0NBRWIsZUFBSyxDQUFDLGFBQUcsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDLENBQUM7Z0NBQy9FLGVBQUssQ0FBQyxPQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7Z0NBQ3hCLHNCQUFPLEtBQUssRUFBQzs7Z0NBRWIsY0FBSSxDQUFDLHVEQUFxRCxRQUFVLENBQUMsQ0FBQztnQ0FDdEUsc0JBQU8sSUFBSSxFQUFDOztnQ0FFWixlQUFLLENBQUMsZ0JBQU0sQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdELGVBQUssQ0FBQyxhQUFHLENBQUMsT0FBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7cUNBQ3pCLENBQUEsZ0JBQWdCLElBQUksQ0FBQyx1QkFBdUIsQ0FBQSxFQUE1Qyx3QkFBNEM7Z0NBQzlDLGNBQUksRUFBRSxDQUFDO2dDQUNQLGNBQUksQ0FBQyxnQkFBTSxDQUFDLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztnQ0FDMUUsY0FBSSxDQUFDLGdCQUFNLENBQUMsZ0RBQWdELENBQUMsQ0FBQyxDQUFDO2dDQUN4RCxxQkFBTSwwQkFBMEIsRUFBRSxFQUFBO29DQUF6QyxzQkFBTyxTQUFrQyxFQUFDO29DQUU1QyxzQkFBTyxLQUFLLEVBQUM7b0NBRWIsTUFBTSxLQUFLLENBQUMsOEJBQTRCLE1BQVEsQ0FBQyxDQUFDOzs7O2FBRXZEOzs7Ozt3QkF4RkQsaUdBQWlHO3dCQUNqRyx3RkFBd0Y7d0JBQ3hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxDQUFDO3dCQUVmLHFCQUFNLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxFQUFBOzt3QkFBN0MsR0FBRyxHQUFHLFNBQXVDO3dCQUs5QyxxQkFBTSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUE7O3dCQUg5Qiw4RUFBOEU7d0JBQzlFLHdFQUF3RTt3QkFDeEUscURBQXFEO3dCQUNyRCxJQUFJLENBQUMsQ0FBQSxTQUF5QixDQUFBLEVBQUU7NEJBQzlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCOzs7OztLQThFRjtJQTFGRCw0Q0EwRkM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZSwwQkFBMEIsQ0FBQyxLQUFnQzs7Ozs7O3dCQUNsRSxjQUFjLEdBQUcsa0JBQVMsRUFBRSxDQUFDO3dCQUU3QixHQUFHLEdBQUcsaUJBQVMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO3dCQUN4QixxQkFBTSw4QkFBcUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBMUUsS0FBbUIsU0FBdUQsRUFBekUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUFBO3dCQUVyQixJQUFJLE1BQU0sRUFBRTs0QkFDVixlQUFLLENBQUMsYUFBRyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGVBQUssQ0FBQyxnQkFBTSxDQUFDLFVBQVEsSUFBTSxDQUFDLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDOzRCQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCx3RUFBd0U7d0JBQ3hFLHFDQUFxQzt3QkFDckMsTUFBTyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO3dCQUN2QywyRUFBMkU7d0JBQzNFLGdCQUFnQjt3QkFDaEIsc0JBQU8sSUFBSSwyQkFBb0IsQ0FBQyxNQUFnQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsRUFBQzs7OztLQUMvRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2ssIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3N9IGZyb20gJy4vdGFzayc7XG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGZsYWdzIENvbmZpZ3VyYXRpb24gb3B0aW9ucyBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChwck51bWJlcjogbnVtYmVyLCBmbGFnczogUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncykge1xuICAvLyBTZXQgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIHNraXAgYWxsIGdpdCBjb21taXQgaG9va3MgdHJpZ2dlcmVkIGJ5IGh1c2t5LiBXZSBhcmUgdW5hYmxlIHRvXG4gIC8vIHJlbHkgb24gYC0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgcHJvY2Vzcy5lbnZbJ0hVU0tZJ10gPSAnMCc7XG5cbiAgY29uc3QgYXBpID0gYXdhaXQgY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soZmxhZ3MpO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCFhd2FpdCBwZXJmb3JtTWVyZ2UoZmFsc2UpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSBjb21wbGV0ZWQgd2l0aG91dCBlcnJvcnMgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICMke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZChgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZCgnQW4gdW5rbm93biBHaXQgZXJyb3IgaGFzIGJlZW4gdGhyb3duLiBQbGVhc2UgY2hlY2sgdGhlIG91dHB1dCAnICtcbiAgICAgICAgICAgICAgICAnYWJvdmUgZm9yIGRldGFpbHMuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkdJVEhVQl9FUlJPUjpcbiAgICAgICAgZXJyb3IocmVkKCdBbiBlcnJvciByZWxhdGVkIHRvIGludGVyYWN0aW5nIHdpdGggR2l0aHViIGhhcyBiZWVuIGRpc2NvdmVyZWQuJykpO1xuICAgICAgICBlcnJvcihmYWlsdXJlIS5tZXNzYWdlKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUQ6XG4gICAgICAgIGluZm8oYE1lcmdlIG9mIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkIG1hbnVhbGx5OiAjJHtwck51bWJlcn1gKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgZXJyb3IoeWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBlcnJvcihyZWQoZmFpbHVyZSEubWVzc2FnZSkpO1xuICAgICAgICBpZiAoY2FuRm9yY2libHlNZXJnZSAmJiAhZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQpIHtcbiAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBpbmZvKHllbGxvdyhgVGhpcyBlcnJvciBjYW4gYmUgZm9yY2libHkgaWdub3JlZCBpZiBkZXNpcmVkLmApKTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgVW5leHBlY3RlZCBtZXJnZSByZXN1bHQ6ICR7c3RhdHVzfWApO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZSB0YXNrIHVzaW5nIHRoZSBnaXZlbiBjb25maWd1cmF0aW9uIG9wdGlvbnMuIEV4cGxpY2l0IGNvbmZpZ3VyYXRpb25cbiAqIG9wdGlvbnMgY2FuIGJlIHNwZWNpZmllZCB3aGVuIHRoZSBtZXJnZSBzY3JpcHQgaXMgdXNlZCBvdXRzaWRlIG9mIGFuIGBuZy1kZXZgIGNvbmZpZ3VyZWRcbiAqIHJlcG9zaXRvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzKSB7XG4gIGNvbnN0IGRldkluZnJhQ29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKTtcbiAgY29uc3Qge2NvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhkZXZJbmZyYUNvbmZpZywgZ2l0LmdpdGh1Yik7XG5cbiAgaWYgKGVycm9ycykge1xuICAgIGVycm9yKHJlZCgnSW52YWxpZCBtZXJnZSBjb25maWd1cmF0aW9uOicpKTtcbiAgICBlcnJvcnMuZm9yRWFjaChkZXNjID0+IGVycm9yKHllbGxvdyhgICAtICAke2Rlc2N9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBTZXQgdGhlIHJlbW90ZSBzbyB0aGF0IHRoZSBtZXJnZSB0b29sIGhhcyBhY2Nlc3MgdG8gaW5mb3JtYXRpb24gYWJvdXRcbiAgLy8gdGhlIHJlbW90ZSBpdCBpbnRlbmRzIHRvIG1lcmdlIHRvLlxuICBjb25maWchLnJlbW90ZSA9IGRldkluZnJhQ29uZmlnLmdpdGh1YjtcbiAgLy8gV2UgY2FuIGNhc3QgdGhpcyB0byBhIG1lcmdlIGNvbmZpZyB3aXRoIHJlbW90ZSBiZWNhdXNlIHdlIGFsd2F5cyBzZXQgdGhlXG4gIC8vIHJlbW90ZSBhYm92ZS5cbiAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhjb25maWchIGFzIE1lcmdlQ29uZmlnV2l0aFJlbW90ZSwgZ2l0LCBmbGFncyk7XG59XG4iXX0=