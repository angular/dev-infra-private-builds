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
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/yargs", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var yargs_1 = require("@angular/dev-infra-private/utils/yargs");
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
     * @param githubToken Github token used for merging (i.e. fetching and pushing)
     * @param projectRoot Path to the local Git project that is used for merging.
     * @param config Configuration for merging pull requests.
     */
    function mergePullRequest(prNumber, githubToken, projectRoot, config) {
        if (projectRoot === void 0) { projectRoot = config_1.getRepoBaseDir(); }
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
                                    console_1.error(console_1.yellow("You can generate a token here: " + yargs_1.GITHUB_TOKEN_GENERATE_URL));
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
                    case 0: return [4 /*yield*/, createPullRequestMergeTask(githubToken, projectRoot, config)];
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
     * Creates the pull request merge task from the given Github token, project root
     * and optional explicit configuration. An explicit configuration can be specified
     * when the merge script is used outside of a `ng-dev` configured repository.
     */
    function createPullRequestMergeTask(githubToken, projectRoot, explicitConfig) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git_2, devInfraConfig, git, _a, config, errors;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (explicitConfig !== undefined) {
                            git_2 = new git_1.GitClient(githubToken, { github: explicitConfig.remote }, projectRoot);
                            return [2 /*return*/, new task_1.PullRequestMergeTask(explicitConfig, git_2)];
                        }
                        devInfraConfig = config_1.getConfig();
                        git = new git_1.GitClient(githubToken, devInfraConfig, projectRoot);
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
                        return [2 /*return*/, new task_1.PullRequestMergeTask(config, git)];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUE2RDtJQUM3RCxvRUFBbUY7SUFDbkYsa0VBQTBDO0lBQzFDLHNFQUE2RDtJQUM3RCxnRUFBNEQ7SUFFNUQscUVBQXNFO0lBQ3RFLGlFQUFzRTtJQUd0RTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFzQixnQkFBZ0IsQ0FDbEMsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFdBQXNDLEVBQzdFLE1BQThCO1FBRFMsNEJBQUEsRUFBQSxjQUFzQix1QkFBYyxFQUFFOztZQVcvRSx1RUFBdUU7WUFDdkUsU0FBZSxZQUFZLENBQUMsaUJBQTBCOzs7Ozs7O2dDQUVuQyxxQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOztnQ0FBckQsTUFBTSxHQUFHLFNBQTRDO2dDQUNwRCxxQkFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBQTtvQ0FBekQsc0JBQU8sU0FBa0QsRUFBQzs7O2dDQUUxRCxrRUFBa0U7Z0NBQ2xFLDBEQUEwRDtnQ0FDMUQsSUFBSSxHQUFDLFlBQVksOEJBQXFCLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0NBQzFELGVBQUssQ0FBQyxhQUFHLENBQUMsNkJBQTZCLEdBQUcsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0NBQ3RELGVBQUssQ0FBQyxnQkFBTSxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztvQ0FDbEUsZUFBSyxDQUFDLGdCQUFNLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUMsQ0FBQztvQ0FDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQ0FDakI7Z0NBQ0Qs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OzRCQUMxQixRQUFNLElBQUksZUFBUyxDQUFDLFdBQVcsRUFBRSxFQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7NEJBQ3JGLHNCQUFPLElBQUksMkJBQW9CLENBQUMsY0FBYyxFQUFFLEtBQUcsQ0FBQyxFQUFDO3lCQUN0RDt3QkFFSyxjQUFjLEdBQUcsa0JBQVMsRUFBRSxDQUFDO3dCQUM3QixHQUFHLEdBQUcsSUFBSSxlQUFTLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFDM0MscUJBQU0sOEJBQXFCLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBQTs7d0JBQTFFLEtBQW1CLFNBQXVELEVBQXpFLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBQTt3QkFFckIsSUFBSSxNQUFNLEVBQUU7NEJBQ1YsZUFBSyxDQUFDLGFBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUM7NEJBQzNDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxVQUFRLElBQU0sQ0FBQyxDQUFDLEVBQTdCLENBQTZCLENBQUMsQ0FBQzs0QkFDdEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsd0VBQXdFO3dCQUN4RSxxQ0FBcUM7d0JBQ3JDLE1BQU8sQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQzt3QkFDdkMsMkVBQTJFO3dCQUMzRSxnQkFBZ0I7d0JBQ2hCLHNCQUFPLElBQUksMkJBQW9CLENBQUMsTUFBZ0MsRUFBRSxHQUFHLENBQUMsRUFBQzs7OztLQUN4RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH0gZnJvbSAnLi4vLi4vdXRpbHMveWFyZ3MnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cblxuLyoqXG4gKiBNZXJnZXMgYSBnaXZlbiBwdWxsIHJlcXVlc3QgYmFzZWQgb24gbGFiZWxzIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuIG1lcmdlIGNvbmZpZ3VyYXRpb24uXG4gKiBQdWxsIHJlcXVlc3RzIGNhbiBiZSBtZXJnZWQgd2l0aCBkaWZmZXJlbnQgc3RyYXRlZ2llcyBzdWNoIGFzIHRoZSBHaXRodWIgQVBJIG1lcmdlXG4gKiBzdHJhdGVneSwgb3IgdGhlIGxvY2FsIGF1dG9zcXVhc2ggc3RyYXRlZ3kuIEVpdGhlciBzdHJhdGVneSBoYXMgYmVuZWZpdHMgYW5kIGRvd25zaWRlcy5cbiAqIE1vcmUgaW5mb3JtYXRpb24gb24gdGhlc2Ugc3RyYXRlZ2llcyBjYW4gYmUgZm91bmQgaW4gdGhlaXIgZGVkaWNhdGVkIHN0cmF0ZWd5IGNsYXNzZXMuXG4gKlxuICogU2VlIHtAbGluayBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBhbmQge0BsaW5rIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5fVxuICpcbiAqIEBwYXJhbSBwck51bWJlciBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gKiBAcGFyYW0gZ2l0aHViVG9rZW4gR2l0aHViIHRva2VuIHVzZWQgZm9yIG1lcmdpbmcgKGkuZS4gZmV0Y2hpbmcgYW5kIHB1c2hpbmcpXG4gKiBAcGFyYW0gcHJvamVjdFJvb3QgUGF0aCB0byB0aGUgbG9jYWwgR2l0IHByb2plY3QgdGhhdCBpcyB1c2VkIGZvciBtZXJnaW5nLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZVB1bGxSZXF1ZXN0KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIHByb2plY3RSb290OiBzdHJpbmcgPSBnZXRSZXBvQmFzZURpcigpLFxuICAgIGNvbmZpZz86IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSkge1xuICBjb25zdCBhcGkgPSBhd2FpdCBjcmVhdGVQdWxsUmVxdWVzdE1lcmdlVGFzayhnaXRodWJUb2tlbiwgcHJvamVjdFJvb3QsIGNvbmZpZyk7XG5cbiAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UuIEZvcmNlIG1vZGUgY2FuIGJlIGFjdGl2YXRlZCB0aHJvdWdoIGEgY29tbWFuZCBsaW5lIGZsYWcuXG4gIC8vIEFsdGVybmF0aXZlbHksIGlmIHRoZSBtZXJnZSBmYWlscyB3aXRoIG5vbi1mYXRhbCBmYWlsdXJlcywgdGhlIHNjcmlwdFxuICAvLyB3aWxsIHByb21wdCB3aGV0aGVyIGl0IHNob3VsZCByZXJ1biBpbiBmb3JjZSBtb2RlLlxuICBpZiAoIWF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGVycm9yKHJlZCgnR2l0aHViIEFQSSByZXF1ZXN0IGZhaWxlZC4gJyArIGUubWVzc2FnZSkpO1xuICAgICAgICBlcnJvcih5ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIGNvbXBsZXRlZCB3aXRob3V0IGVycm9ycyBvciBub3QuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQ6IE1lcmdlUmVzdWx0LCBkaXNhYmxlRm9yY2VNZXJnZVByb21wdCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2ZhaWx1cmUsIHN0YXR1c30gPSByZXN1bHQ7XG4gICAgY29uc3QgY2FuRm9yY2libHlNZXJnZSA9IGZhaWx1cmUgJiYgZmFpbHVyZS5ub25GYXRhbDtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlNVQ0NFU1M6XG4gICAgICAgIGluZm8oZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogIyR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKGBMb2NhbCB3b3JraW5nIHJlcG9zaXRvcnkgbm90IGNsZWFuLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBgICtcbiAgICAgICAgICAgICAgICBgbm8gdW5jb21taXR0ZWQgY2hhbmdlcy5gKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1I6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKCdBbiB1bmtub3duIEdpdCBlcnJvciBoYXMgYmVlbiB0aHJvd24uIFBsZWFzZSBjaGVjayB0aGUgb3V0cHV0ICcgK1xuICAgICAgICAgICAgICAgICdhYm92ZSBmb3IgZGV0YWlscy4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRDpcbiAgICAgICAgaW5mbyhgTWVyZ2Ugb2YgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgbWFudWFsbHk6ICMke3ByTnVtYmVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlIHRhc2sgZnJvbSB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuLCBwcm9qZWN0IHJvb3RcbiAqIGFuZCBvcHRpb25hbCBleHBsaWNpdCBjb25maWd1cmF0aW9uLiBBbiBleHBsaWNpdCBjb25maWd1cmF0aW9uIGNhbiBiZSBzcGVjaWZpZWRcbiAqIHdoZW4gdGhlIG1lcmdlIHNjcmlwdCBpcyB1c2VkIG91dHNpZGUgb2YgYSBgbmctZGV2YCBjb25maWd1cmVkIHJlcG9zaXRvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKFxuICAgIGdpdGh1YlRva2VuOiBzdHJpbmcsIHByb2plY3RSb290OiBzdHJpbmcsIGV4cGxpY2l0Q29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIGlmIChleHBsaWNpdENvbmZpZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbiwge2dpdGh1YjogZXhwbGljaXRDb25maWcucmVtb3RlfSwgcHJvamVjdFJvb3QpO1xuICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2soZXhwbGljaXRDb25maWcsIGdpdCk7XG4gIH1cblxuICBjb25zdCBkZXZJbmZyYUNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuLCBkZXZJbmZyYUNvbmZpZywgcHJvamVjdFJvb3QpO1xuICBjb25zdCB7Y29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGRldkluZnJhQ29uZmlnLCBnaXQuZ2l0aHViKTtcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgIGVycm9ycy5mb3JFYWNoKGRlc2MgPT4gZXJyb3IoeWVsbG93KGAgIC0gICR7ZGVzY31gKSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgcmVtb3RlIHNvIHRoYXQgdGhlIG1lcmdlIHRvb2wgaGFzIGFjY2VzcyB0byBpbmZvcm1hdGlvbiBhYm91dFxuICAvLyB0aGUgcmVtb3RlIGl0IGludGVuZHMgdG8gbWVyZ2UgdG8uXG4gIGNvbmZpZyEucmVtb3RlID0gZGV2SW5mcmFDb25maWcuZ2l0aHViO1xuICAvLyBXZSBjYW4gY2FzdCB0aGlzIHRvIGEgbWVyZ2UgY29uZmlnIHdpdGggcmVtb3RlIGJlY2F1c2Ugd2UgYWx3YXlzIHNldCB0aGVcbiAgLy8gcmVtb3RlIGFib3ZlLlxuICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGNvbmZpZyEgYXMgTWVyZ2VDb25maWdXaXRoUmVtb3RlLCBnaXQpO1xufVxuIl19