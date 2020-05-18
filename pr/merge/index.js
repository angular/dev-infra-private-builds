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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQTBCO0lBRTFCLGtFQUFrRDtJQUNsRCxvRUFBa0Q7SUFFbEQscUVBQXNFO0lBQ3RFLCtEQUE0QztJQUM1QyxpRUFBc0U7SUFFdEUsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFHOUU7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBc0IsZ0JBQWdCLENBQ2xDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFzQyxFQUM3RSxNQUE4QjtRQURTLDRCQUFBLEVBQUEsY0FBc0IsdUJBQWMsRUFBRTs7WUF1Qi9FLHVFQUF1RTtZQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7Z0NBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7O2dDQUFyRCxNQUFNLEdBQUcsU0FBNEM7Z0NBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO29DQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7Z0NBRTFELGtFQUFrRTtnQ0FDbEUsMERBQTBEO2dDQUMxRCxJQUFJLEdBQUMsWUFBWSwyQkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQ0FDMUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFLLENBQUMsR0FBRyxDQUFDLDZCQUE2QixHQUFHLEdBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29DQUNwRSxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxNQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO29DQUNoRixPQUFPLENBQUMsS0FBSyxDQUFDLGVBQUssQ0FBQyxN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LElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDakI7NEJBQ0QsTUFBTSxHQUFHLE9BQVEsQ0FBQzt5QkFDbkI7d0JBRUssR0FBRyxHQUFHLElBQUksMkJBQW9CLENBQUMsV0FBVyxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFLbEUscUJBQU0sWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFBOzt3QkFIOUIsOEVBQThFO3dCQUM5RSx3RUFBd0U7d0JBQ3hFLHFEQUFxRDt3QkFDckQsSUFBSSxDQUFDLENBQUEsU0FBeUIsQ0FBQSxFQUFFOzRCQUM5QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs7Ozs7S0F1RUY7SUE3RkQsNENBNkZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBjaGFsayBmcm9tICdjaGFsayc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge3Byb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0dpdGh1YkFwaVJlcXVlc3RFcnJvcn0gZnJvbSAnLi9naXQnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zYDtcblxuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBnaXRodWJUb2tlbiBHaXRodWIgdG9rZW4gdXNlZCBmb3IgbWVyZ2luZyAoaS5lLiBmZXRjaGluZyBhbmQgcHVzaGluZylcbiAqIEBwYXJhbSBwcm9qZWN0Um9vdCBQYXRoIHRvIHRoZSBsb2NhbCBHaXQgcHJvamVjdCB0aGF0IGlzIHVzZWQgZm9yIG1lcmdpbmcuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgcHJvamVjdFJvb3Q6IHN0cmluZyA9IGdldFJlcG9CYXNlRGlyKCksXG4gICAgY29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIC8vIElmIG5vIGV4cGxpY2l0IGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gc3BlY2lmaWVkLCB3ZSBsb2FkIGFuZCB2YWxpZGF0ZVxuICAvLyB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBzaGFyZWQgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHtjb25maWc6IF9jb25maWcsIGVycm9yc30gPSBsb2FkQW5kVmFsaWRhdGVDb25maWcoKTtcbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGNoYWxrLnJlZCgnSW52YWxpZCBjb25maWd1cmF0aW9uOicpKTtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGRlc2MgPT4gY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICAgIGNvbmZpZyA9IF9jb25maWchO1xuICB9XG5cbiAgY29uc3QgYXBpID0gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKHByb2plY3RSb290LCBjb25maWcsIGdpdGh1YlRva2VuKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkge1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgbWVyZ2UgYW5kIHJldHVybnMgd2hldGhlciBpdCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuICovXG4gIGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1NZXJnZShpZ25vcmVGYXRhbEVycm9yczogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkubWVyZ2UocHJOdW1iZXIsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gdGhlIEdpdGh1YiBBUEkgZm9yIGludmFsaWQgcmVxdWVzdHMuIFdlIHdhbnQgdG9cbiAgICAgIC8vIGV4aXQgdGhlIHNjcmlwdCB3aXRoIGEgYmV0dGVyIGV4cGxhbmF0aW9uIG9mIHRoZSBlcnJvci5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0aHViQXBpUmVxdWVzdEVycm9yICYmIGUuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3Qgc2hvdWxkIGJlIGZvcmNpYmx5IG1lcmdlZC4gSWYgc28sIG1lcmdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBmb3JjaWJseSAoaWdub3Jpbmcgbm9uLWNyaXRpY2FsIGZhaWx1cmVzKS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBmb3JjaWJseSBtZXJnZWQuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gZm9yY2libHkgcHJvY2VlZCB3aXRoIG1lcmdpbmc/JykpIHtcbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIGZvcmNlIG1vZGUuIFRoaXMgbWVhbnMgdGhhdCBub24tZmF0YWwgZmFpbHVyZXNcbiAgICAgIC8vIGFyZSBpZ25vcmVkIGFuZCB0aGUgbWVyZ2UgY29udGludWVzLlxuICAgICAgcmV0dXJuIHBlcmZvcm1NZXJnZSh0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIG1lcmdlIHJlc3VsdCBieSBwcmludGluZyBjb25zb2xlIG1lc3NhZ2VzLCBleGl0aW5nIHRoZSBwcm9jZXNzXG4gICAqIGJhc2VkIG9uIHRoZSByZXN1bHQsIG9yIGJ5IHJlc3RhcnRpbmcgdGhlIG1lcmdlIGlmIGZvcmNlIG1vZGUgaGFzIGJlZW4gZW5hYmxlZC5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVyZ2Ugd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0OiBNZXJnZVJlc3VsdCwgZGlzYWJsZUZvcmNlTWVyZ2VQcm9tcHQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHtmYWlsdXJlLCBzdGF0dXN9ID0gcmVzdWx0O1xuICAgIGNvbnN0IGNhbkZvcmNpYmx5TWVyZ2UgPSBmYWlsdXJlICYmIGZhaWx1cmUubm9uRmF0YWw7XG5cbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5TVUNDRVNTOlxuICAgICAgICBjb25zb2xlLmluZm8oY2hhbGsuZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogJHtwck51bWJlcn1gKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUjpcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay5yZWQoXG4gICAgICAgICAgICBgTG9jYWwgd29ya2luZyByZXBvc2l0b3J5IG5vdCBjbGVhbi4gUGxlYXNlIG1ha2Ugc3VyZSB0aGVyZSBhcmUgYCArXG4gICAgICAgICAgICBgbm8gdW5jb21taXR0ZWQgY2hhbmdlcy5gKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1I6XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKFxuICAgICAgICAgICAgJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArXG4gICAgICAgICAgICAnYWJvdmUgZm9yIGRldGFpbHMuJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLkZBSUxFRDpcbiAgICAgICAgY29uc29sZS5lcnJvcihjaGFsay55ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoY2hhbGsucmVkKGZhaWx1cmUhLm1lc3NhZ2UpKTtcbiAgICAgICAgaWYgKGNhbkZvcmNpYmx5TWVyZ2UgJiYgIWRpc2FibGVGb3JjZU1lcmdlUHJvbXB0KSB7XG4gICAgICAgICAgY29uc29sZS5pbmZvKCk7XG4gICAgICAgICAgY29uc29sZS5pbmZvKGNoYWxrLnllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGNvbnNvbGUuaW5mbyhjaGFsay55ZWxsb3coYFRoaXMgZXJyb3IgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQgaWYgZGVzaXJlZC5gKSk7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYFVuZXhwZWN0ZWQgbWVyZ2UgcmVzdWx0OiAke3N0YXR1c31gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==