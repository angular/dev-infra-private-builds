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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUFrRDtJQUNsRCxvRUFBbUY7SUFFbkYscUVBQXNFO0lBQ3RFLCtEQUE0QztJQUM1QyxpRUFBc0U7SUFFdEUsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFHOUU7Ozs7Ozs7Ozs7OztPQVlHO0lBQ0gsU0FBc0IsZ0JBQWdCLENBQ2xDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxXQUFzQyxFQUM3RSxNQUE4QjtRQURTLDRCQUFBLEVBQUEsY0FBc0IsdUJBQWMsRUFBRTs7WUF1Qi9FLHVFQUF1RTtZQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7Z0NBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7O2dDQUFyRCxNQUFNLEdBQUcsU0FBNEM7Z0NBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO29DQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7Z0NBRTFELGtFQUFrRTtnQ0FDbEUsMERBQTBEO2dDQUMxRCxJQUFJLEdBQUMsWUFBWSwyQkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQ0FDMUQsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2QkFBNkIsR0FBRyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQ0FDdEQsZUFBSyxDQUFDLGdCQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO29DQUNsRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDO29DQUM3RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMs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V0FBVyxDQUFDLENBQUM7d0JBS2xFLHFCQUFNLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBQTs7d0JBSDlCLDhFQUE4RTt3QkFDOUUsd0VBQXdFO3dCQUN4RSxxREFBcUQ7d0JBQ3JELElBQUksQ0FBQyxDQUFBLFNBQXlCLENBQUEsRUFBRTs0QkFDOUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7Ozs7O0tBMkVGO0lBakdELDRDQWlHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0dpdGh1YkFwaVJlcXVlc3RFcnJvcn0gZnJvbSAnLi9naXQnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zYDtcblxuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBnaXRodWJUb2tlbiBHaXRodWIgdG9rZW4gdXNlZCBmb3IgbWVyZ2luZyAoaS5lLiBmZXRjaGluZyBhbmQgcHVzaGluZylcbiAqIEBwYXJhbSBwcm9qZWN0Um9vdCBQYXRoIHRvIHRoZSBsb2NhbCBHaXQgcHJvamVjdCB0aGF0IGlzIHVzZWQgZm9yIG1lcmdpbmcuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgcHJvamVjdFJvb3Q6IHN0cmluZyA9IGdldFJlcG9CYXNlRGlyKCksXG4gICAgY29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIC8vIElmIG5vIGV4cGxpY2l0IGNvbmZpZ3VyYXRpb24gaGFzIGJlZW4gc3BlY2lmaWVkLCB3ZSBsb2FkIGFuZCB2YWxpZGF0ZVxuICAvLyB0aGUgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBzaGFyZWQgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24uXG4gIGlmIChjb25maWcgPT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IHtjb25maWc6IF9jb25maWcsIGVycm9yc30gPSBsb2FkQW5kVmFsaWRhdGVDb25maWcoKTtcbiAgICBpZiAoZXJyb3JzKSB7XG4gICAgICBlcnJvcihyZWQoJ0ludmFsaWQgY29uZmlndXJhdGlvbjonKSk7XG4gICAgICBlcnJvcnMuZm9yRWFjaChkZXNjID0+IGVycm9yKHllbGxvdyhgICAtICAke2Rlc2N9YCkpKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gICAgY29uZmlnID0gX2NvbmZpZyE7XG4gIH1cblxuICBjb25zdCBhcGkgPSBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2socHJvamVjdFJvb3QsIGNvbmZpZywgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIFBlcmZvcm0gdGhlIG1lcmdlLiBGb3JjZSBtb2RlIGNhbiBiZSBhY3RpdmF0ZWQgdGhyb3VnaCBhIGNvbW1hbmQgbGluZSBmbGFnLlxuICAvLyBBbHRlcm5hdGl2ZWx5LCBpZiB0aGUgbWVyZ2UgZmFpbHMgd2l0aCBub24tZmF0YWwgZmFpbHVyZXMsIHRoZSBzY3JpcHRcbiAgLy8gd2lsbCBwcm9tcHQgd2hldGhlciBpdCBzaG91bGQgcmVydW4gaW4gZm9yY2UgbW9kZS5cbiAgaWYgKCFhd2FpdCBwZXJmb3JtTWVyZ2UoZmFsc2UpKSB7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqIFBlcmZvcm1zIHRoZSBtZXJnZSBhbmQgcmV0dXJucyB3aGV0aGVyIGl0IHdhcyBzdWNjZXNzZnVsIG9yIG5vdC4gKi9cbiAgYXN5bmMgZnVuY3Rpb24gcGVyZm9ybU1lcmdlKGlnbm9yZUZhdGFsRXJyb3JzOiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5tZXJnZShwck51bWJlciwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgICAgcmV0dXJuIGF3YWl0IGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdCwgaWdub3JlRmF0YWxFcnJvcnMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIENhdGNoIGVycm9ycyB0byB0aGUgR2l0aHViIEFQSSBmb3IgaW52YWxpZCByZXF1ZXN0cy4gV2Ugd2FudCB0b1xuICAgICAgLy8gZXhpdCB0aGUgc2NyaXB0IHdpdGggYSBiZXR0ZXIgZXhwbGFuYXRpb24gb2YgdGhlIGVycm9yLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICBlcnJvcihyZWQoJ0dpdGh1YiBBUEkgcmVxdWVzdCBmYWlsZWQuICcgKyBlLm1lc3NhZ2UpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KCdQbGVhc2UgZW5zdXJlIHRoYXQgeW91ciBwcm92aWRlZCB0b2tlbiBpcyB2YWxpZC4nKSk7XG4gICAgICAgIGVycm9yKHllbGxvdyhgWW91IGNhbiBnZW5lcmF0ZSBhIHRva2VuIGhlcmU6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1gKSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgd2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBzaG91bGQgYmUgZm9yY2libHkgbWVyZ2VkLiBJZiBzbywgbWVyZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGZvcmNpYmx5IChpZ25vcmluZyBub24tY3JpdGljYWwgZmFpbHVyZXMpLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGZvcmNpYmx5IG1lcmdlZC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UgaW4gZm9yY2UgbW9kZS4gVGhpcyBtZWFucyB0aGF0IG5vbi1mYXRhbCBmYWlsdXJlc1xuICAgICAgLy8gYXJlIGlnbm9yZWQgYW5kIHRoZSBtZXJnZSBjb250aW51ZXMuXG4gICAgICByZXR1cm4gcGVyZm9ybU1lcmdlKHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgbWVyZ2UgcmVzdWx0IGJ5IHByaW50aW5nIGNvbnNvbGUgbWVzc2FnZXMsIGV4aXRpbmcgdGhlIHByb2Nlc3NcbiAgICogYmFzZWQgb24gdGhlIHJlc3VsdCwgb3IgYnkgcmVzdGFydGluZyB0aGUgbWVyZ2UgaWYgZm9yY2UgbW9kZSBoYXMgYmVlbiBlbmFibGVkLlxuICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXJnZSB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQ6IE1lcmdlUmVzdWx0LCBkaXNhYmxlRm9yY2VNZXJnZVByb21wdCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2ZhaWx1cmUsIHN0YXR1c30gPSByZXN1bHQ7XG4gICAgY29uc3QgY2FuRm9yY2libHlNZXJnZSA9IGZhaWx1cmUgJiYgZmFpbHVyZS5ub25GYXRhbDtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlNVQ0NFU1M6XG4gICAgICAgIGluZm8oZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogJHtwck51bWJlcn1gKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoYExvY2FsIHdvcmtpbmcgcmVwb3NpdG9yeSBub3QgY2xlYW4uIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIGAgK1xuICAgICAgICAgICAgICAgIGBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzLmApKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArXG4gICAgICAgICAgICAgICAgJ2Fib3ZlIGZvciBkZXRhaWxzLicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1I6XG4gICAgICAgIGVycm9yKHJlZCgnQW4gZXJyb3IgcmVsYXRlZCB0byBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YiBoYXMgYmVlbiBkaXNjb3ZlcmVkLicpKTtcbiAgICAgICAgZXJyb3IoZmFpbHVyZSEubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG4iXX0=