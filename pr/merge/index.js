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
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
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
                                    console_1.error(console_1.red('Github API request failed. ' + e_1.message));
                                    console_1.error(console_1.yellow('Please ensure that your provided token is valid.'));
                                    console_1.error(console_1.yellow("You can generate a token here: " + exports.GITHUB_TOKEN_GENERATE_URL));
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
                                    case 4 /* GITHUB_ERROR */: return [3 /*break*/, 4];
                                    case 3 /* FAILED */: return [3 /*break*/, 5];
                                }
                                return [3 /*break*/, 8];
                            case 1:
                                console_1.info(console_1.green("Successfully merged the pull request: " + prNumber));
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
                                console_1.error(console_1.yellow("Could not merge the specified pull request."));
                                console_1.error(console_1.red(failure.message));
                                if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 7];
                                console_1.info();
                                console_1.info(console_1.yellow('The pull request above failed due to non-critical errors.'));
                                console_1.info(console_1.yellow("This error can be forcibly ignored if desired."));
                                return [4 /*yield*/, promptAndPerformForceMerge()];
                            case 6: return [2 /*return*/, _b.sent()];
                            case 7: return [2 /*return*/, false];
                            case 8: throw Error("Unexpected merge result: " + status);
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
                                console_1.error(console_1.red('Invalid configuration:'));
                                errors.forEach(function (desc) { return console_1.error(console_1.yellow("  -  " + desc)); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUFrRDtJQUNsRCxvRUFBbUY7SUFDbkYsNERBQXNEO0lBRXRELHFFQUFzRTtJQUN0RSxpRUFBc0U7SUFFdEUsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFHOUU7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBc0IsZ0JBQWdCLENBQ2xDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFzQyxFQUM3RSxNQUE4QjtRQURTLDRCQUFBLEVBQUEsY0FBc0IsdUJBQWMsRUFBRTs7WUF1Qi9FLHVFQUF1RTtZQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7Z0NBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7O2dDQUFyRCxNQUFNLEdBQUcsU0FBNEM7Z0NBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO29DQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7Z0NBRTFELGtFQUFrRTtnQ0FDbEUsMERBQTBEO2dDQUMxRCxJQUFJLEdBQUMsWUFBWSwyQkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQ0FDMUQsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2QkFBNkIsR0FBRyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQ0FDdEQsZUFBSyxDQUFDLGdCQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO29DQUNsRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDO29DQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMs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V0FBVyxDQUFDLENBQUM7d0JBS2xFLHFCQUFNLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBSDlCLDhFQUE4RTt3QkFDOUUsd0VBQXdFO3dCQUN4RSxxREFBcUQ7d0JBQ3JELElBQUksQ0FBQyxDQUFBLFNBQXlCLENBQUEsRUFBRTs0QkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7Ozs7O0tBMkVGO0lBakdELDRDQWlHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnLCBNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7TWVyZ2VSZXN1bHQsIE1lcmdlU3RhdHVzLCBQdWxsUmVxdWVzdE1lcmdlVGFza30gZnJvbSAnLi90YXNrJztcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc2A7XG5cblxuLyoqXG4gKiBNZXJnZXMgYSBnaXZlbiBwdWxsIHJlcXVlc3QgYmFzZWQgb24gbGFiZWxzIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuIG1lcmdlIGNvbmZpZ3VyYXRpb24uXG4gKiBQdWxsIHJlcXVlc3RzIGNhbiBiZSBtZXJnZWQgd2l0aCBkaWZmZXJlbnQgc3RyYXRlZ2llcyBzdWNoIGFzIHRoZSBHaXRodWIgQVBJIG1lcmdlXG4gKiBzdHJhdGVneSwgb3IgdGhlIGxvY2FsIGF1dG9zcXVhc2ggc3RyYXRlZ3kuIEVpdGhlciBzdHJhdGVneSBoYXMgYmVuZWZpdHMgYW5kIGRvd25zaWRlcy5cbiAqIE1vcmUgaW5mb3JtYXRpb24gb24gdGhlc2Ugc3RyYXRlZ2llcyBjYW4gYmUgZm91bmQgaW4gdGhlaXIgZGVkaWNhdGVkIHN0cmF0ZWd5IGNsYXNzZXMuXG4gKlxuICogU2VlIHtAbGluayBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBhbmQge0BsaW5rIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5fVxuICpcbiAqIEBwYXJhbSBwck51bWJlciBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQuXG4gKiBAcGFyYW0gZ2l0aHViVG9rZW4gR2l0aHViIHRva2VuIHVzZWQgZm9yIG1lcmdpbmcgKGkuZS4gZmV0Y2hpbmcgYW5kIHB1c2hpbmcpXG4gKiBAcGFyYW0gcHJvamVjdFJvb3QgUGF0aCB0byB0aGUgbG9jYWwgR2l0IHByb2plY3QgdGhhdCBpcyB1c2VkIGZvciBtZXJnaW5nLlxuICogQHBhcmFtIGNvbmZpZyBDb25maWd1cmF0aW9uIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZVB1bGxSZXF1ZXN0KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIHByb2plY3RSb290OiBzdHJpbmcgPSBnZXRSZXBvQmFzZURpcigpLFxuICAgIGNvbmZpZz86IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSkge1xuICAvLyBJZiBubyBleHBsaWNpdCBjb25maWd1cmF0aW9uIGhhcyBiZWVuIHNwZWNpZmllZCwgd2UgbG9hZCBhbmQgdmFsaWRhdGVcbiAgLy8gdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgc2hhcmVkIGRldi1pbmZyYSBjb25maWd1cmF0aW9uLlxuICBpZiAoY29uZmlnID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCB7Y29uZmlnOiBfY29uZmlnLCBlcnJvcnN9ID0gbG9hZEFuZFZhbGlkYXRlQ29uZmlnKCk7XG4gICAgaWYgKGVycm9ycykge1xuICAgICAgZXJyb3IocmVkKCdJbnZhbGlkIGNvbmZpZ3VyYXRpb246JykpO1xuICAgICAgZXJyb3JzLmZvckVhY2goZGVzYyA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIGNvbmZpZyA9IF9jb25maWchO1xuICB9XG5cbiAgY29uc3QgYXBpID0gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKHByb2plY3RSb290LCBjb25maWcsIGdpdGh1YlRva2VuKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkge1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgbWVyZ2UgYW5kIHJldHVybnMgd2hldGhlciBpdCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuICovXG4gIGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1NZXJnZShpZ25vcmVGYXRhbEVycm9yczogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkubWVyZ2UocHJOdW1iZXIsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gdGhlIEdpdGh1YiBBUEkgZm9yIGludmFsaWQgcmVxdWVzdHMuIFdlIHdhbnQgdG9cbiAgICAgIC8vIGV4aXQgdGhlIHNjcmlwdCB3aXRoIGEgYmV0dGVyIGV4cGxhbmF0aW9uIG9mIHRoZSBlcnJvci5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0aHViQXBpUmVxdWVzdEVycm9yICYmIGUuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgZXJyb3IocmVkKCdHaXRodWIgQVBJIHJlcXVlc3QgZmFpbGVkLiAnICsgZS5tZXNzYWdlKSk7XG4gICAgICAgIGVycm9yKHllbGxvdygnUGxlYXNlIGVuc3VyZSB0aGF0IHlvdXIgcHJvdmlkZWQgdG9rZW4gaXMgdmFsaWQuJykpO1xuICAgICAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3Qgc2hvdWxkIGJlIGZvcmNpYmx5IG1lcmdlZC4gSWYgc28sIG1lcmdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBmb3JjaWJseSAoaWdub3Jpbmcgbm9uLWNyaXRpY2FsIGZhaWx1cmVzKS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBmb3JjaWJseSBtZXJnZWQuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gZm9yY2libHkgcHJvY2VlZCB3aXRoIG1lcmdpbmc/JykpIHtcbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIGZvcmNlIG1vZGUuIFRoaXMgbWVhbnMgdGhhdCBub24tZmF0YWwgZmFpbHVyZXNcbiAgICAgIC8vIGFyZSBpZ25vcmVkIGFuZCB0aGUgbWVyZ2UgY29udGludWVzLlxuICAgICAgcmV0dXJuIHBlcmZvcm1NZXJnZSh0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIG1lcmdlIHJlc3VsdCBieSBwcmludGluZyBjb25zb2xlIG1lc3NhZ2VzLCBleGl0aW5nIHRoZSBwcm9jZXNzXG4gICAqIGJhc2VkIG9uIHRoZSByZXN1bHQsIG9yIGJ5IHJlc3RhcnRpbmcgdGhlIG1lcmdlIGlmIGZvcmNlIG1vZGUgaGFzIGJlZW4gZW5hYmxlZC5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVyZ2Ugd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBpbmZvKGdyZWVuKGBTdWNjZXNzZnVsbHkgbWVyZ2VkIHRoZSBwdWxsIHJlcXVlc3Q6ICR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKGBMb2NhbCB3b3JraW5nIHJlcG9zaXRvcnkgbm90IGNsZWFuLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBgICtcbiAgICAgICAgICAgICAgICBgbm8gdW5jb21taXR0ZWQgY2hhbmdlcy5gKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1I6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKCdBbiB1bmtub3duIEdpdCBlcnJvciBoYXMgYmVlbiB0aHJvd24uIFBsZWFzZSBjaGVjayB0aGUgb3V0cHV0ICcgK1xuICAgICAgICAgICAgICAgICdhYm92ZSBmb3IgZGV0YWlscy4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgZXJyb3IoeWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBlcnJvcihyZWQoZmFpbHVyZSEubWVzc2FnZSkpO1xuICAgICAgICBpZiAoY2FuRm9yY2libHlNZXJnZSAmJiAhZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQpIHtcbiAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBpbmZvKHllbGxvdyhgVGhpcyBlcnJvciBjYW4gYmUgZm9yY2libHkgaWdub3JlZCBpZiBkZXNpcmVkLmApKTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgVW5leHBlY3RlZCBtZXJnZSByZXN1bHQ6ICR7c3RhdHVzfWApO1xuICAgIH1cbiAgfVxufVxuIl19