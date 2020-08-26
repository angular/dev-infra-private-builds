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
        define("@angular/dev-infra-private/pr/merge", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/task"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePullRequest = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
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
                                if (e_1 instanceof github_1.GithubApiRequestError && e_1.status === 401) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUE2RDtJQUM3RCxvRUFBbUY7SUFDbkYsa0VBQTBDO0lBQzFDLHNFQUE2RDtJQUU3RCxxRUFBbUY7SUFDbkYsaUVBQXNFO0lBRXRFLDRFQUE0RTtJQUMvRCxRQUFBLHlCQUF5QixHQUFHLG9DQUFvQyxDQUFDO0lBRzlFOzs7Ozs7Ozs7Ozs7T0FZRztJQUNILFNBQXNCLGdCQUFnQixDQUNsQyxRQUFnQixFQUFFLFdBQW1CLEVBQUUsV0FBc0MsRUFDN0UsTUFBOEI7UUFEUyw0QkFBQSxFQUFBLGNBQXNCLHVCQUFjLEVBQUU7O1lBVy9FLHVFQUF1RTtZQUN2RSxTQUFlLFlBQVksQ0FBQyxpQkFBMEI7Ozs7Ozs7Z0NBRW5DLHFCQUFNLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLEVBQUE7O2dDQUFyRCxNQUFNLEdBQUcsU0FBNEM7Z0NBQ3BELHFCQUFNLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxFQUFBO29DQUF6RCxzQkFBTyxTQUFrRCxFQUFDOzs7Z0NBRTFELGtFQUFrRTtnQ0FDbEUsMERBQTBEO2dDQUMxRCxJQUFJLEdBQUMsWUFBWSw4QkFBcUIsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTtvQ0FDMUQsZUFBSyxDQUFDLGFBQUcsQ0FBQyw2QkFBNkIsR0FBRyxHQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztvQ0FDdEQsZUFBSyxDQUFDLGdCQUFNLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO29DQUNsRSxlQUFLLENBQUMsZ0JBQU0sQ0FBQyxvQ0FBa0MsaUNBQTJCLENBQUMsQ0FBQyxDQUFDO29DQUM3RSxPQUFPLENBQUMsSUFB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Ozs7O3dCQUNsRixJQUFJLGNBQWMsS0FBSyxTQUFTLEVBQUU7NEJBQzFCLFFBQU0sSUFBSSxlQUFTLENBQUMsV0FBVyxFQUFFLEVBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQzs0QkFDckYsc0JBQU8sSUFBSSwyQkFBb0IsQ0FBQyxjQUFjLEVBQUUsS0FBRyxDQUFDLEVBQUM7eUJBQ3REO3dCQUVLLGNBQWMsR0FBRyxrQkFBUyxFQUFFLENBQUM7d0JBQzdCLEdBQUcsR0FBRyxJQUFJLGVBQVMsQ0FBQyxXQUFXLEVBQUUsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUMzQyxxQkFBTSw4QkFBcUIsQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBMUUsS0FBbUIsU0FBdUQsRUFBekUsTUFBTSxZQUFBLEVBQUUsTUFBTSxZQUFBO3dCQUVyQixJQUFJLE1BQU0sRUFBRTs0QkFDVixlQUFLLENBQUMsYUFBRyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQzs0QkFDM0MsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLGVBQUssQ0FBQyxnQkFBTSxDQUFDLFVBQVEsSUFBTSxDQUFDLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQyxDQUFDOzRCQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFFRCx3RUFBd0U7d0JBQ3hFLHFDQUFxQzt3QkFDckMsTUFBTyxDQUFDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDO3dCQUN2QywyRUFBMkU7d0JBQzNFLGdCQUFnQjt3QkFDaEIsc0JBQU8sSUFBSSwyQkFBb0IsQ0FBQyxNQUFnQyxFQUFFLEdBQUcsQ0FBQyxFQUFDOzs7O0tBQ3hFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtnZXRDb25maWcsIGdldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgTWVyZ2VDb25maWcsIE1lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtNZXJnZVJlc3VsdCwgTWVyZ2VTdGF0dXMsIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zYDtcblxuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBnaXRodWJUb2tlbiBHaXRodWIgdG9rZW4gdXNlZCBmb3IgbWVyZ2luZyAoaS5lLiBmZXRjaGluZyBhbmQgcHVzaGluZylcbiAqIEBwYXJhbSBwcm9qZWN0Um9vdCBQYXRoIHRvIHRoZSBsb2NhbCBHaXQgcHJvamVjdCB0aGF0IGlzIHVzZWQgZm9yIG1lcmdpbmcuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgcHJvamVjdFJvb3Q6IHN0cmluZyA9IGdldFJlcG9CYXNlRGlyKCksXG4gICAgY29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIGNvbnN0IGFwaSA9IGF3YWl0IGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGdpdGh1YlRva2VuLCBwcm9qZWN0Um9vdCwgY29uZmlnKTtcblxuICAvLyBQZXJmb3JtIHRoZSBtZXJnZS4gRm9yY2UgbW9kZSBjYW4gYmUgYWN0aXZhdGVkIHRocm91Z2ggYSBjb21tYW5kIGxpbmUgZmxhZy5cbiAgLy8gQWx0ZXJuYXRpdmVseSwgaWYgdGhlIG1lcmdlIGZhaWxzIHdpdGggbm9uLWZhdGFsIGZhaWx1cmVzLCB0aGUgc2NyaXB0XG4gIC8vIHdpbGwgcHJvbXB0IHdoZXRoZXIgaXQgc2hvdWxkIHJlcnVuIGluIGZvcmNlIG1vZGUuXG4gIGlmICghYXdhaXQgcGVyZm9ybU1lcmdlKGZhbHNlKSkge1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtcyB0aGUgbWVyZ2UgYW5kIHJldHVybnMgd2hldGhlciBpdCB3YXMgc3VjY2Vzc2Z1bCBvciBub3QuICovXG4gIGFzeW5jIGZ1bmN0aW9uIHBlcmZvcm1NZXJnZShpZ25vcmVGYXRhbEVycm9yczogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkubWVyZ2UocHJOdW1iZXIsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICAgIHJldHVybiBhd2FpdCBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQsIGlnbm9yZUZhdGFsRXJyb3JzKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBlcnJvcnMgdG8gdGhlIEdpdGh1YiBBUEkgZm9yIGludmFsaWQgcmVxdWVzdHMuIFdlIHdhbnQgdG9cbiAgICAgIC8vIGV4aXQgdGhlIHNjcmlwdCB3aXRoIGEgYmV0dGVyIGV4cGxhbmF0aW9uIG9mIHRoZSBlcnJvci5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0aHViQXBpUmVxdWVzdEVycm9yICYmIGUuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgZXJyb3IocmVkKCdHaXRodWIgQVBJIHJlcXVlc3QgZmFpbGVkLiAnICsgZS5tZXNzYWdlKSk7XG4gICAgICAgIGVycm9yKHllbGxvdygnUGxlYXNlIGVuc3VyZSB0aGF0IHlvdXIgcHJvdmlkZWQgdG9rZW4gaXMgdmFsaWQuJykpO1xuICAgICAgICBlcnJvcih5ZWxsb3coYFlvdSBjYW4gZ2VuZXJhdGUgYSB0b2tlbiBoZXJlOiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9YCkpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3Qgc2hvdWxkIGJlIGZvcmNpYmx5IG1lcmdlZC4gSWYgc28sIG1lcmdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBmb3JjaWJseSAoaWdub3Jpbmcgbm9uLWNyaXRpY2FsIGZhaWx1cmVzKS5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBmb3JjaWJseSBtZXJnZWQuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gZm9yY2libHkgcHJvY2VlZCB3aXRoIG1lcmdpbmc/JykpIHtcbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIGZvcmNlIG1vZGUuIFRoaXMgbWVhbnMgdGhhdCBub24tZmF0YWwgZmFpbHVyZXNcbiAgICAgIC8vIGFyZSBpZ25vcmVkIGFuZCB0aGUgbWVyZ2UgY29udGludWVzLlxuICAgICAgcmV0dXJuIHBlcmZvcm1NZXJnZSh0cnVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIG1lcmdlIHJlc3VsdCBieSBwcmludGluZyBjb25zb2xlIG1lc3NhZ2VzLCBleGl0aW5nIHRoZSBwcm9jZXNzXG4gICAqIGJhc2VkIG9uIHRoZSByZXN1bHQsIG9yIGJ5IHJlc3RhcnRpbmcgdGhlIG1lcmdlIGlmIGZvcmNlIG1vZGUgaGFzIGJlZW4gZW5hYmxlZC5cbiAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVyZ2UgY29tcGxldGVkIHdpdGhvdXQgZXJyb3JzIG9yIG5vdC5cbiAgICovXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZU1lcmdlUmVzdWx0KHJlc3VsdDogTWVyZ2VSZXN1bHQsIGRpc2FibGVGb3JjZU1lcmdlUHJvbXB0ID0gZmFsc2UpIHtcbiAgICBjb25zdCB7ZmFpbHVyZSwgc3RhdHVzfSA9IHJlc3VsdDtcbiAgICBjb25zdCBjYW5Gb3JjaWJseU1lcmdlID0gZmFpbHVyZSAmJiBmYWlsdXJlLm5vbkZhdGFsO1xuXG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuU1VDQ0VTUzpcbiAgICAgICAgaW5mbyhncmVlbihgU3VjY2Vzc2Z1bGx5IG1lcmdlZCB0aGUgcHVsbCByZXF1ZXN0OiAjJHtwck51bWJlcn1gKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoYExvY2FsIHdvcmtpbmcgcmVwb3NpdG9yeSBub3QgY2xlYW4uIFBsZWFzZSBtYWtlIHN1cmUgdGhlcmUgYXJlIGAgK1xuICAgICAgICAgICAgICAgIGBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzLmApKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5VTktOT1dOX0dJVF9FUlJPUjpcbiAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICByZWQoJ0FuIHVua25vd24gR2l0IGVycm9yIGhhcyBiZWVuIHRocm93bi4gUGxlYXNlIGNoZWNrIHRoZSBvdXRwdXQgJyArXG4gICAgICAgICAgICAgICAgJ2Fib3ZlIGZvciBkZXRhaWxzLicpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1I6XG4gICAgICAgIGVycm9yKHJlZCgnQW4gZXJyb3IgcmVsYXRlZCB0byBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YiBoYXMgYmVlbiBkaXNjb3ZlcmVkLicpKTtcbiAgICAgICAgZXJyb3IoZmFpbHVyZSEubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEOlxuICAgICAgICBpbmZvKGBNZXJnZSBvZiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZCBtYW51YWxseTogIyR7cHJOdW1iZXJ9YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSBNZXJnZVN0YXR1cy5GQUlMRUQ6XG4gICAgICAgIGVycm9yKHllbGxvdyhgQ291bGQgbm90IG1lcmdlIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0LmApKTtcbiAgICAgICAgZXJyb3IocmVkKGZhaWx1cmUhLm1lc3NhZ2UpKTtcbiAgICAgICAgaWYgKGNhbkZvcmNpYmx5TWVyZ2UgJiYgIWRpc2FibGVGb3JjZU1lcmdlUHJvbXB0KSB7XG4gICAgICAgICAgaW5mbygpO1xuICAgICAgICAgIGluZm8oeWVsbG93KCdUaGUgcHVsbCByZXF1ZXN0IGFib3ZlIGZhaWxlZCBkdWUgdG8gbm9uLWNyaXRpY2FsIGVycm9ycy4nKSk7XG4gICAgICAgICAgaW5mbyh5ZWxsb3coYFRoaXMgZXJyb3IgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQgaWYgZGVzaXJlZC5gKSk7XG4gICAgICAgICAgcmV0dXJuIGF3YWl0IHByb21wdEFuZFBlcmZvcm1Gb3JjZU1lcmdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYFVuZXhwZWN0ZWQgbWVyZ2UgcmVzdWx0OiAke3N0YXR1c31gKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UgdGFzayBmcm9tIHRoZSBnaXZlbiBHaXRodWIgdG9rZW4sIHByb2plY3Qgcm9vdFxuICogYW5kIG9wdGlvbmFsIGV4cGxpY2l0IGNvbmZpZ3VyYXRpb24uIEFuIGV4cGxpY2l0IGNvbmZpZ3VyYXRpb24gY2FuIGJlIHNwZWNpZmllZFxuICogd2hlbiB0aGUgbWVyZ2Ugc2NyaXB0IGlzIHVzZWQgb3V0c2lkZSBvZiBhIGBuZy1kZXZgIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlUHVsbFJlcXVlc3RNZXJnZVRhc2soXG4gICAgZ2l0aHViVG9rZW46IHN0cmluZywgcHJvamVjdFJvb3Q6IHN0cmluZywgZXhwbGljaXRDb25maWc/OiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUpIHtcbiAgaWYgKGV4cGxpY2l0Q29uZmlnICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuLCB7Z2l0aHViOiBleHBsaWNpdENvbmZpZy5yZW1vdGV9LCBwcm9qZWN0Um9vdCk7XG4gICAgcmV0dXJuIG5ldyBQdWxsUmVxdWVzdE1lcmdlVGFzayhleHBsaWNpdENvbmZpZywgZ2l0KTtcbiAgfVxuXG4gIGNvbnN0IGRldkluZnJhQ29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQoZ2l0aHViVG9rZW4sIGRldkluZnJhQ29uZmlnLCBwcm9qZWN0Um9vdCk7XG4gIGNvbnN0IHtjb25maWcsIGVycm9yc30gPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVDb25maWcoZGV2SW5mcmFDb25maWcsIGdpdC5naXRodWIpO1xuXG4gIGlmIChlcnJvcnMpIHtcbiAgICBlcnJvcihyZWQoJ0ludmFsaWQgbWVyZ2UgY29uZmlndXJhdGlvbjonKSk7XG4gICAgZXJyb3JzLmZvckVhY2goZGVzYyA9PiBlcnJvcih5ZWxsb3coYCAgLSAgJHtkZXNjfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gU2V0IHRoZSByZW1vdGUgc28gdGhhdCB0aGUgbWVyZ2UgdG9vbCBoYXMgYWNjZXNzIHRvIGluZm9ybWF0aW9uIGFib3V0XG4gIC8vIHRoZSByZW1vdGUgaXQgaW50ZW5kcyB0byBtZXJnZSB0by5cbiAgY29uZmlnIS5yZW1vdGUgPSBkZXZJbmZyYUNvbmZpZy5naXRodWI7XG4gIC8vIFdlIGNhbiBjYXN0IHRoaXMgdG8gYSBtZXJnZSBjb25maWcgd2l0aCByZW1vdGUgYmVjYXVzZSB3ZSBhbHdheXMgc2V0IHRoZVxuICAvLyByZW1vdGUgYWJvdmUuXG4gIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2soY29uZmlnISBhcyBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIGdpdCk7XG59XG4iXX0=