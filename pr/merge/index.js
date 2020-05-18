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
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "chalk", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/git", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var chalk_1 = require("chalk");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
    var git_1 = require("@angular/dev-infra-private/pr/merge/git");
    var task_1 = require("@angular/dev-infra-private/pr/merge/task");
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
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
                                if (e_1 instanceof git_1.GithubApiRequestError && e_1.status === 401) {
                                    console.error(chalk_1.default.red('Github API request failed. ' + e_1.message));
                                    console.error(chalk_1.default.yellow('Please ensure that your provided token is valid.'));
                                    console.error(chalk_1.default.yellow("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL));
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
             * @returns Whether the merge was successful or not.
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
                                    case 3 /* FAILED */: return [3 /*break*/, 4];
                                }
                                return [3 /*break*/, 7];
                            case 1:
                                console.info(chalk_1.default.green("Successfully merged the pull request: " + prNumber));
                                return [2 /*return*/, true];
                            case 2:
                                console.error(chalk_1.default.red("Local working repository not clean. Please make sure there are " +
                                    "no uncommitted changes."));
                                return [2 /*return*/, false];
                            case 3:
                                console.error(chalk_1.default.red('An unknown Git error has been thrown. Please check the output ' +
                                    'above for details.'));
                                return [2 /*return*/, false];
                            case 4:
                                console.error(chalk_1.default.yellow("Could not merge the specified pull request."));
                                console.error(chalk_1.default.red(failure.message));
                                if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 6];
                                console.info();
                                console.info(chalk_1.default.yellow('The pull request above failed due to non-critical errors.'));
                                console.info(chalk_1.default.yellow("This error can be forcibly ignored if desired."));
                                return [4 /*yield*/, promptAndPerformForceMerge()];
                            case 5: return [2 /*return*/, _b.sent()];
                            case 6: return [2 /*return*/, false];
                            case 7: throw Error("Unexpected merge result: " + status);
                        }
                    });
                });
            }
            var _a, _config, errors, api;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If no explicit configuration has been specified, we load and validate
                        // the configuration from the shared dev-infra configuration.
                        if (config === undefined) {
                            _a = config_2.loadAndValidateConfig(), _config = _a.config, errors = _a.errors;
                            if (errors) {
                                console.error(chalk_1.default.red('Invalid configuration:'));
                                errors.forEach(function (desc) { return console.error(chalk_1.default.yellow("  -  " + desc)); });
                                process.exit(1);
                            }
                            config = _config;
                        }
                        api = new task_1.PullRequestMergeTask(projectRoot, config, githubToken);
                        return [4 /*yield*/, performMerge(false)];
                    case 1:
                        // Perform the merge. Force mode can be activated through a command line flag.
                        // Alternatively, if the merge fails with non-fatal failures, the script
                        // will prompt whether it should rerun in force mode.
                        if (!(_b.sent())) {
                            process.exit(1);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.mergePullRequest = mergePullRequest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUEwQjtJQUUxQixrRUFBa0Q7SUFDbEQsb0VBQWtEO0lBRWxELHFFQUFzRTtJQUN0RSwrREFBNEM7SUFDNUMsaUVBQXNFO0lBRXRFLDRFQUE0RTtJQUMvRCxRQUFBLHlCQUF5QixHQUFHLG9DQUFvQyxDQUFDO0lBRzlFOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFNBQXNCLGdCQUFnQixDQUNsQyxRQUFnQixFQUFFLFdBQW1CLEVBQUUsV0FBc0MsRUFDN0UsTUFBOEI7UUFEUyw0QkFBQSxFQUFBLGNBQXNCLHVCQUFjLEVBQUU7O1lBdUIvRSx1RUFBdUU7WUFDdkUsU0FBZSxZQUFZLENBQUMsaUJBQTBCOzs7Ozs7O2dDQUVuQyxxQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOztnQ0FBckQsTUFBTSxHQUFHLFNBQTRDO2dDQUNwRCxxQkFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBQTtvQ0FBekQsc0JBQU8sU0FBa0QsRUFBQzs7O2dDQUUxRCxrRUFBa0U7Z0NBQ2xFLDBEQUEwRDtnQ0FDMUQsSUFBSSxHQUFDLFlBQVksMkJBQXFCLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0NBQzFELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBSyxDQUFDLEdBQUcsQ0FBQyw2QkFBNkIsR0FBRyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQ0FDcEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsTUFBTSxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztvQ0FDaEYsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMs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QyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ2pCOzRCQUNELE1BQU0sR0FBRyxPQUFRLENBQUM7eUJBQ25CO3dCQUVLLEdBQUcsR0FBRyxJQUFJLDJCQUFvQixDQUFDLFdBQVcsRUFBRSxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBS2xFLHFCQUFNLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBSDlCLDhFQUE4RTt3QkFDOUUsd0VBQXdFO3dCQUN4RSxxREFBcUQ7d0JBQ3JELElBQUksQ0FBQyxDQUFBLFNBQXlCLENBQUEsRUFBRTs0QkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7Ozs7O0tBdUVGO0lBN0ZELDRDQTZGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtsb2FkQW5kVmFsaWRhdGVDb25maWcsIE1lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4vZ2l0JztcbmltcG9ydCB7TWVyZ2VSZXN1bHQsIE1lcmdlU3RhdHVzLCBQdWxsUmVxdWVzdE1lcmdlVGFza30gZnJvbSAnLi90YXNrJztcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc2A7XG5cblxuLyoqXG4gKiBNZXJnZXMgYSBnaXZlbiBwdWxsIHJlcXVlc3QgYmFzZWQgb24gbGFiZWxzIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuIG1lcmdlIGNvbmZpZ3VyYXRpb24uXG4gKiBQdWxsIHJlcXVlc3RzIGNhbiBiZSBtZXJnZWQgd2l0aCBkaWZmZXJlbnQgc3RyYXRlZ2llcyBzdWNoIGFzIHRoZSBHaXRodWIgQVBJIG1lcmdlXG4gKiBzdHJhdGVneSwgb3IgdGhlIGxvY2FsIGF1dG9zcXVhc2ggc3RyYXRlZ3kuIEVpdGhlciBzdHJhdGVneSBoYXMgYmVuZWZpdHMgYW5kIGRvd25zaWRlcy5cbiAqIE1vcmUgaW5mb3JtYXRpb24gb24gdGhlc2Ugc3RyYXRlZ2llcyBjYW4gYmUgZm91bmQgaW4gdGhlaXIgZGVkaWNhdGVkIHN0cmF0ZWd5IGNsYXNzZXMuXG4gKlxuICogU2VlIHtAbGluayBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBhbmQge0BsaW5rIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5fVxuICpcbiAqIEBwYXJhbSBwck51bWJlciBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gKiBAcGFyYW0gZ2l0aHViVG9rZW4gR2l0aHViIHRva2VuIHVzZWQgZm9yIG1lcmdpbmcgKGkuZS4gZmV0Y2hpbmcgYW5kIHB1c2hpbmcpXG4gKiBAcGFyYW0gcHJvamVjdFJvb3QgUGF0aCB0byB0aGUgbG9jYWwgR2l0IHByb2plY3QgdGhhdCBpcyB1c2VkIGZvciBtZXJnaW5nLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZVB1bGxSZXF1ZXN0KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIHByb2plY3RSb290OiBzdHJpbmcgPSBnZXRSZXBvQmFzZURpcigpLFxuICAgIGNvbmZpZz86IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSkge1xuICAvLyBJZiBubyBleHBsaWNpdCBjb25maWd1cmF0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgd2UgbG9hZCBhbmQgdmFsaWRhdGVcbiAgLy8gdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgc2hhcmVkIGRldi1pbmZyYSBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB7Y29uZmlnOiBfY29uZmlnLCBlcnJvcnN9ID0gbG9hZEFuZFZhbGlkYXRlQ29uZmlnKCk7XG4gICAgaWYgKGVycm9ycykge1xuICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0ludmFsaWQgY29uZmlndXJhdGlvbjonKSk7XG4gICAgICBlcnJvcnMuZm9yRWFjaChkZXNjID0+IGNvbnNvbGUuZXJyb3IoY2hhbGsueWVsbG93KGAgIC0gICR7ZGVzY31gKSkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgICBjb25maWcgPSBfY29uZmlnITtcbiAgfVxuXG4gIGNvbnN0IGFwaSA9IG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhwcm9qZWN0Um9vdCwgY29uZmlnLCBnaXRodWJUb2tlbik7XG5cbiAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UuIEZvcmNlIG1vZGUgY2FuIGJlIGFjdGl2YXRlZCB0aHJvdWdoIGEgY29tbWFuZCBsaW5lIGZsYWcuXG4gIC8vIEFsdGVybmF0aXZlbHksIGlmIHRoZSBtZXJnZSBmYWlscyB3aXRoIG5vbi1mYXRhbCBmYWlsdXJlcywgdGhlIHNjcmlwdFxuICAvLyB3aWxsIHByb21wdCB3aGV0aGVyIGl0IHNob3VsZCByZXJ1biBpbiBmb3JjZSBtb2RlLlxuICBpZiAoIWF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKCdHaXRodWIgQVBJIHJlcXVlc3QgZmFpbGVkLiAnICsgZS5tZXNzYWdlKSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsueWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsueWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdDogTWVyZ2VSZXN1bHQsIGRpc2FibGVGb3JjZU1lcmdlUHJvbXB0ID0gZmFsc2UpIHtcbiAgICBjb25zdCB7ZmFpbHVyZSwgc3RhdHVzfSA9IHJlc3VsdDtcbiAgICBjb25zdCBjYW5Gb3JjaWJseU1lcmdlID0gZmFpbHVyZSAmJiBmYWlsdXJlLm5vbkZhdGFsO1xuXG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuU1VDQ0VTUzpcbiAgICAgICAgY29uc29sZS5pbmZvKGNoYWxrLmdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKFxuICAgICAgICAgICAgYExvY2FsIHdvcmtpbmcgcmVwb3NpdG9yeSBub3QgY2xlYW4uIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIGAgK1xuICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChcbiAgICAgICAgICAgICdBbiB1bmtub3duIEdpdCBlcnJvciBoYXMgYmVlbiB0aHJvd24uIFBsZWFzZSBjaGVjayB0aGUgb3V0cHV0ICcgK1xuICAgICAgICAgICAgJ2Fib3ZlIGZvciBkZXRhaWxzLicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5GQUlMRUQ6XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsueWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGNvbnNvbGUuaW5mbygpO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBjb25zb2xlLmluZm8oY2hhbGsueWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=