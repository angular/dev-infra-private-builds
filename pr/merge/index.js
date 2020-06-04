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
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/git", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
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
                                    case 3 /* FAILED */: return [3 /*break*/, 4];
                                }
                                return [3 /*break*/, 7];
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
                                console_1.error(console_1.yellow("Could not merge the specified pull request."));
                                console_1.error(console_1.red(failure.message));
                                if (!(canForciblyMerge && !disableForceMergePrompt)) return [3 /*break*/, 6];
                                console_1.info();
                                console_1.info(console_1.yellow('The pull request above failed due to non-critical errors.'));
                                console_1.info(console_1.yellow("This error can be forcibly ignored if desired."));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUFrRDtJQUNsRCxvRUFBbUY7SUFFbkYscUVBQXNFO0lBQ3RFLCtEQUE0QztJQUM1QyxpRUFBc0U7SUFFdEUsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFHOUU7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBc0IsZ0JBQWdCLENBQ2xDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFzQyxFQUM3RSxNQUE4QjtRQURTLDRCQUFBLEVBQUEsY0FBc0IsdUJBQWMsRUFBRTs7WUF1Qi9FLHVFQUF1RTtZQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7Z0NBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7O2dDQUFyRCxNQUFNLEdBQUcsU0FBNEM7Z0NBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO29DQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7Z0NBRTFELGtFQUFrRTtnQ0FDbEUsMERBQTBEO2dDQUMxRCxJQUFJLEdBQUMsWUFBWSwyQkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQ0FDMUQsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2QkFBNkIsR0FBRyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQ0FDdEQsZUFBSyxDQUFDLGdCQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO29DQUNsRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDO29DQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMs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QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs7Ozs7S0F1RUY7SUE3RkQsNENBNkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnLCBNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuL2dpdCc7XG5pbXBvcnQge01lcmdlUmVzdWx0LCBNZXJnZVN0YXR1cywgUHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIGdlbmVyYXRlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNgO1xuXG5cbi8qKlxuICogTWVyZ2VzIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGJhc2VkIG9uIGxhYmVscyBjb25maWd1cmVkIGluIHRoZSBnaXZlbiBtZXJnZSBjb25maWd1cmF0aW9uLlxuICogUHVsbCByZXF1ZXN0cyBjYW4gYmUgbWVyZ2VkIHdpdGggZGlmZmVyZW50IHN0cmF0ZWdpZXMgc3VjaCBhcyB0aGUgR2l0aHViIEFQSSBtZXJnZVxuICogc3RyYXRlZ3ksIG9yIHRoZSBsb2NhbCBhdXRvc3F1YXNoIHN0cmF0ZWd5LiBFaXRoZXIgc3RyYXRlZ3kgaGFzIGJlbmVmaXRzIGFuZCBkb3duc2lkZXMuXG4gKiBNb3JlIGluZm9ybWF0aW9uIG9uIHRoZXNlIHN0cmF0ZWdpZXMgY2FuIGJlIGZvdW5kIGluIHRoZWlyIGRlZGljYXRlZCBzdHJhdGVneSBjbGFzc2VzLlxuICpcbiAqIFNlZSB7QGxpbmsgR2l0aHViQXBpTWVyZ2VTdHJhdGVneX0gYW5kIHtAbGluayBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX1cbiAqXG4gKiBAcGFyYW0gcHJOdW1iZXIgTnVtYmVyIG9mIHRoZSBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICogQHBhcmFtIGdpdGh1YlRva2VuIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBtZXJnaW5nIChpLmUuIGZldGNoaW5nIGFuZCBwdXNoaW5nKVxuICogQHBhcmFtIHByb2plY3RSb290IFBhdGggdG8gdGhlIGxvY2FsIEdpdCBwcm9qZWN0IHRoYXQgaXMgdXNlZCBmb3IgbWVyZ2luZy5cbiAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBmb3IgbWVyZ2luZyBwdWxsIHJlcXVlc3RzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbWVyZ2VQdWxsUmVxdWVzdChcbiAgICBwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nLCBwcm9qZWN0Um9vdDogc3RyaW5nID0gZ2V0UmVwb0Jhc2VEaXIoKSxcbiAgICBjb25maWc/OiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUpIHtcbiAgLy8gSWYgbm8gZXhwbGljaXQgY29uZmlndXJhdGlvbiBoYXMgYmVlbiBzcGVjaWZpZWQsIHdlIGxvYWQgYW5kIHZhbGlkYXRlXG4gIC8vIHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIHNoYXJlZCBkZXYtaW5mcmEgY29uZmlndXJhdGlvbi5cbiAgaWYgKGNvbmZpZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qge2NvbmZpZzogX2NvbmZpZywgZXJyb3JzfSA9IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZygpO1xuICAgIGlmIChlcnJvcnMpIHtcbiAgICAgIGVycm9yKHJlZCgnSW52YWxpZCBjb25maWd1cmF0aW9uOicpKTtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGRlc2MgPT4gZXJyb3IoeWVsbG93KGAgIC0gICR7ZGVzY31gKSkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgICBjb25maWcgPSBfY29uZmlnITtcbiAgfVxuXG4gIGNvbnN0IGFwaSA9IG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhwcm9qZWN0Um9vdCwgY29uZmlnLCBnaXRodWJUb2tlbik7XG5cbiAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UuIEZvcmNlIG1vZGUgY2FuIGJlIGFjdGl2YXRlZCB0aHJvdWdoIGEgY29tbWFuZCBsaW5lIGZsYWcuXG4gIC8vIEFsdGVybmF0aXZlbHksIGlmIHRoZSBtZXJnZSBmYWlscyB3aXRoIG5vbi1mYXRhbCBmYWlsdXJlcywgdGhlIHNjcmlwdFxuICAvLyB3aWxsIHByb21wdCB3aGV0aGVyIGl0IHNob3VsZCByZXJ1biBpbiBmb3JjZSBtb2RlLlxuICBpZiAoIWF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGVycm9yKHJlZCgnR2l0aHViIEFQSSByZXF1ZXN0IGZhaWxlZC4gJyArIGUubWVzc2FnZSkpO1xuICAgICAgICBlcnJvcih5ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIHdhcyBzdWNjZXNzZnVsIG9yIG5vdC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdDogTWVyZ2VSZXN1bHQsIGRpc2FibGVGb3JjZU1lcmdlUHJvbXB0ID0gZmFsc2UpIHtcbiAgICBjb25zdCB7ZmFpbHVyZSwgc3RhdHVzfSA9IHJlc3VsdDtcbiAgICBjb25zdCBjYW5Gb3JjaWJseU1lcmdlID0gZmFpbHVyZSAmJiBmYWlsdXJlLm5vbkZhdGFsO1xuXG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuU1VDQ0VTUzpcbiAgICAgICAgaW5mbyhncmVlbihgU3VjY2Vzc2Z1bGx5IG1lcmdlZCB0aGUgcHVsbCByZXF1ZXN0OiAke3ByTnVtYmVyfWApKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZChgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICAgICAgYG5vIHVuY29tbWl0dGVkIGNoYW5nZXMuYCkpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SOlxuICAgICAgICBlcnJvcihcbiAgICAgICAgICAgIHJlZCgnQW4gdW5rbm93biBHaXQgZXJyb3IgaGFzIGJlZW4gdGhyb3duLiBQbGVhc2UgY2hlY2sgdGhlIG91dHB1dCAnICtcbiAgICAgICAgICAgICAgICAnYWJvdmUgZm9yIGRldGFpbHMuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgZXJyb3IoeWVsbG93KGBDb3VsZCBub3QgbWVyZ2UgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QuYCkpO1xuICAgICAgICBlcnJvcihyZWQoZmFpbHVyZSEubWVzc2FnZSkpO1xuICAgICAgICBpZiAoY2FuRm9yY2libHlNZXJnZSAmJiAhZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQpIHtcbiAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coJ1RoZSBwdWxsIHJlcXVlc3QgYWJvdmUgZmFpbGVkIGR1ZSB0byBub24tY3JpdGljYWwgZXJyb3JzLicpKTtcbiAgICAgICAgICBpbmZvKHllbGxvdyhgVGhpcyBlcnJvciBjYW4gYmUgZm9yY2libHkgaWdub3JlZCBpZiBkZXNpcmVkLmApKTtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgVW5leHBlY3RlZCBtZXJnZSByZXN1bHQ6ICR7c3RhdHVzfWApO1xuICAgIH1cbiAgfVxufVxuIl19