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
                    case 0:
                        // Set the environment variable to skip all git commit hooks triggered by husky. We are unable to
                        // rely on `---no-verify` as some hooks still run, notably the `prepare-commit-msg` hook.
                        process.env['HUSKY_SKIP_HOOKS'] = '1';
                        return [4 /*yield*/, createPullRequestMergeTask(githubToken, projectRoot, config)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILGtFQUE2RDtJQUM3RCxvRUFBbUY7SUFDbkYsa0VBQTBDO0lBQzFDLHNFQUE2RDtJQUM3RCxnRUFBNEQ7SUFFNUQscUVBQXNFO0lBQ3RFLGlFQUFzRTtJQUd0RTs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFzQixnQkFBZ0IsQ0FDbEMsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLFdBQXNDLEVBQzdFLE1BQThCO1FBRFMsNEJBQUEsRUFBQSxjQUFzQix1QkFBYyxFQUFFOztZQWUvRSx1RUFBdUU7WUFDdkUsU0FBZSxZQUFZLENBQUMsaUJBQTBCOzs7Ozs7O2dDQUVuQyxxQkFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxpQkFBaUIsQ0FBQyxFQUFBOztnQ0FBckQsTUFBTSxHQUFHLFNBQTRDO2dDQUNwRCxxQkFBTSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsaUJBQWlCLENBQUMsRUFBQTtvQ0FBekQsc0JBQU8sU0FBa0QsRUFBQzs7O2dDQUUxRCxrRUFBa0U7Z0NBQ2xFLDBEQUEwRDtnQ0FDMUQsSUFBSSxHQUFDLFlBQVksOEJBQXFCLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7b0NBQzFELGVBQUssQ0FBQyxhQUFHLENBQUMsNkJBQTZCLEdBQUcsR0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7b0NBQ3RELGVBQUssQ0FBQyxnQkFBTSxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztvQ0FDbEUsZUFBSyxDQUFDLGdCQUFNLENBQUMsb0NBQWtDLGlDQUEyQixDQUFDLENBQUMsQ0FBQztvQ0FDN0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQ0FDakI7Z0NBQ0Qs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ZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxuaW1wb3J0IHtnZXRDb25maWcsIGdldFJlcG9CYXNlRGlyfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuaW1wb3J0IHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfSBmcm9tICcuLi8uLi91dGlscy95YXJncyc7XG5cbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnLCBNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7TWVyZ2VSZXN1bHQsIE1lcmdlU3RhdHVzLCBQdWxsUmVxdWVzdE1lcmdlVGFza30gZnJvbSAnLi90YXNrJztcblxuXG4vKipcbiAqIE1lcmdlcyBhIGdpdmVuIHB1bGwgcmVxdWVzdCBiYXNlZCBvbiBsYWJlbHMgY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW4gbWVyZ2UgY29uZmlndXJhdGlvbi5cbiAqIFB1bGwgcmVxdWVzdHMgY2FuIGJlIG1lcmdlZCB3aXRoIGRpZmZlcmVudCBzdHJhdGVnaWVzIHN1Y2ggYXMgdGhlIEdpdGh1YiBBUEkgbWVyZ2VcbiAqIHN0cmF0ZWd5LCBvciB0aGUgbG9jYWwgYXV0b3NxdWFzaCBzdHJhdGVneS4gRWl0aGVyIHN0cmF0ZWd5IGhhcyBiZW5lZml0cyBhbmQgZG93bnNpZGVzLlxuICogTW9yZSBpbmZvcm1hdGlvbiBvbiB0aGVzZSBzdHJhdGVnaWVzIGNhbiBiZSBmb3VuZCBpbiB0aGVpciBkZWRpY2F0ZWQgc3RyYXRlZ3kgY2xhc3Nlcy5cbiAqXG4gKiBTZWUge0BsaW5rIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGFuZCB7QGxpbmsgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9XG4gKlxuICogQHBhcmFtIHByTnVtYmVyIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAqIEBwYXJhbSBnaXRodWJUb2tlbiBHaXRodWIgdG9rZW4gdXNlZCBmb3IgbWVyZ2luZyAoaS5lLiBmZXRjaGluZyBhbmQgcHVzaGluZylcbiAqIEBwYXJhbSBwcm9qZWN0Um9vdCBQYXRoIHRvIHRoZSBsb2NhbCBHaXQgcHJvamVjdCB0aGF0IGlzIHVzZWQgZm9yIG1lcmdpbmcuXG4gKiBAcGFyYW0gY29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1lcmdlUHVsbFJlcXVlc3QoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgcHJvamVjdFJvb3Q6IHN0cmluZyA9IGdldFJlcG9CYXNlRGlyKCksXG4gICAgY29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIC8vIFNldCB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgdG8gc2tpcCBhbGwgZ2l0IGNvbW1pdCBob29rcyB0cmlnZ2VyZWQgYnkgaHVza3kuIFdlIGFyZSB1bmFibGUgdG9cbiAgLy8gcmVseSBvbiBgLS0tbm8tdmVyaWZ5YCBhcyBzb21lIGhvb2tzIHN0aWxsIHJ1biwgbm90YWJseSB0aGUgYHByZXBhcmUtY29tbWl0LW1zZ2AgaG9vay5cbiAgcHJvY2Vzcy5lbnZbJ0hVU0tZX1NLSVBfSE9PS1MnXSA9ICcxJztcblxuICBjb25zdCBhcGkgPSBhd2FpdCBjcmVhdGVQdWxsUmVxdWVzdE1lcmdlVGFzayhnaXRodWJUb2tlbiwgcHJvamVjdFJvb3QsIGNvbmZpZyk7XG5cbiAgLy8gUGVyZm9ybSB0aGUgbWVyZ2UuIEZvcmNlIG1vZGUgY2FuIGJlIGFjdGl2YXRlZCB0aHJvdWdoIGEgY29tbWFuZCBsaW5lIGZsYWcuXG4gIC8vIEFsdGVybmF0aXZlbHksIGlmIHRoZSBtZXJnZSBmYWlscyB3aXRoIG5vbi1mYXRhbCBmYWlsdXJlcywgdGhlIHNjcmlwdFxuICAvLyB3aWxsIHByb21wdCB3aGV0aGVyIGl0IHNob3VsZCByZXJ1biBpbiBmb3JjZSBtb2RlLlxuICBpZiAoIWF3YWl0IHBlcmZvcm1NZXJnZShmYWxzZSkpIHtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKiogUGVyZm9ybXMgdGhlIG1lcmdlIGFuZCByZXR1cm5zIHdoZXRoZXIgaXQgd2FzIHN1Y2Nlc3NmdWwgb3Igbm90LiAqL1xuICBhc3luYyBmdW5jdGlvbiBwZXJmb3JtTWVyZ2UoaWdub3JlRmF0YWxFcnJvcnM6IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLm1lcmdlKHByTnVtYmVyLCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgICByZXR1cm4gYXdhaXQgaGFuZGxlTWVyZ2VSZXN1bHQocmVzdWx0LCBpZ25vcmVGYXRhbEVycm9ycyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggZXJyb3JzIHRvIHRoZSBHaXRodWIgQVBJIGZvciBpbnZhbGlkIHJlcXVlc3RzLiBXZSB3YW50IHRvXG4gICAgICAvLyBleGl0IHRoZSBzY3JpcHQgd2l0aCBhIGJldHRlciBleHBsYW5hdGlvbiBvZiB0aGUgZXJyb3IuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIGVycm9yKHJlZCgnR2l0aHViIEFQSSByZXF1ZXN0IGZhaWxlZC4gJyArIGUubWVzc2FnZSkpO1xuICAgICAgICBlcnJvcih5ZWxsb3coJ1BsZWFzZSBlbnN1cmUgdGhhdCB5b3VyIHByb3ZpZGVkIHRva2VuIGlzIHZhbGlkLicpKTtcbiAgICAgICAgZXJyb3IoeWVsbG93KGBZb3UgY2FuIGdlbmVyYXRlIGEgdG9rZW4gaGVyZTogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfWApKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IHNob3VsZCBiZSBmb3JjaWJseSBtZXJnZWQuIElmIHNvLCBtZXJnZXNcbiAgICogdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZm9yY2libHkgKGlnbm9yaW5nIG5vbi1jcml0aWNhbCBmYWlsdXJlcykuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gZm9yY2libHkgbWVyZ2VkLlxuICAgKi9cbiAgYXN5bmMgZnVuY3Rpb24gcHJvbXB0QW5kUGVyZm9ybUZvcmNlTWVyZ2UoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGZvcmNpYmx5IHByb2NlZWQgd2l0aCBtZXJnaW5nPycpKSB7XG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBpbiBmb3JjZSBtb2RlLiBUaGlzIG1lYW5zIHRoYXQgbm9uLWZhdGFsIGZhaWx1cmVzXG4gICAgICAvLyBhcmUgaWdub3JlZCBhbmQgdGhlIG1lcmdlIGNvbnRpbnVlcy5cbiAgICAgIHJldHVybiBwZXJmb3JtTWVyZ2UodHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBtZXJnZSByZXN1bHQgYnkgcHJpbnRpbmcgY29uc29sZSBtZXNzYWdlcywgZXhpdGluZyB0aGUgcHJvY2Vzc1xuICAgKiBiYXNlZCBvbiB0aGUgcmVzdWx0LCBvciBieSByZXN0YXJ0aW5nIHRoZSBtZXJnZSBpZiBmb3JjZSBtb2RlIGhhcyBiZWVuIGVuYWJsZWQuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lcmdlIGNvbXBsZXRlZCB3aXRob3V0IGVycm9ycyBvciBub3QuXG4gICAqL1xuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVNZXJnZVJlc3VsdChyZXN1bHQ6IE1lcmdlUmVzdWx0LCBkaXNhYmxlRm9yY2VNZXJnZVByb21wdCA9IGZhbHNlKSB7XG4gICAgY29uc3Qge2ZhaWx1cmUsIHN0YXR1c30gPSByZXN1bHQ7XG4gICAgY29uc3QgY2FuRm9yY2libHlNZXJnZSA9IGZhaWx1cmUgJiYgZmFpbHVyZS5ub25GYXRhbDtcblxuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlNVQ0NFU1M6XG4gICAgICAgIGluZm8oZ3JlZW4oYFN1Y2Nlc3NmdWxseSBtZXJnZWQgdGhlIHB1bGwgcmVxdWVzdDogIyR7cHJOdW1iZXJ9YCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRElSVFlfV09SS0lOR19ESVI6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKGBMb2NhbCB3b3JraW5nIHJlcG9zaXRvcnkgbm90IGNsZWFuLiBQbGVhc2UgbWFrZSBzdXJlIHRoZXJlIGFyZSBgICtcbiAgICAgICAgICAgICAgICBgbm8gdW5jb21taXR0ZWQgY2hhbmdlcy5gKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1I6XG4gICAgICAgIGVycm9yKFxuICAgICAgICAgICAgcmVkKCdBbiB1bmtub3duIEdpdCBlcnJvciBoYXMgYmVlbiB0aHJvd24uIFBsZWFzZSBjaGVjayB0aGUgb3V0cHV0ICcgK1xuICAgICAgICAgICAgICAgICdhYm92ZSBmb3IgZGV0YWlscy4nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SOlxuICAgICAgICBlcnJvcihyZWQoJ0FuIGVycm9yIHJlbGF0ZWQgdG8gaW50ZXJhY3Rpbmcgd2l0aCBHaXRodWIgaGFzIGJlZW4gZGlzY292ZXJlZC4nKSk7XG4gICAgICAgIGVycm9yKGZhaWx1cmUhLm1lc3NhZ2UpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICBjYXNlIE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRDpcbiAgICAgICAgaW5mbyhgTWVyZ2Ugb2YgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWQgbWFudWFsbHk6ICMke3ByTnVtYmVyfWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIGNhc2UgTWVyZ2VTdGF0dXMuRkFJTEVEOlxuICAgICAgICBlcnJvcih5ZWxsb3coYENvdWxkIG5vdCBtZXJnZSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdC5gKSk7XG4gICAgICAgIGVycm9yKHJlZChmYWlsdXJlIS5tZXNzYWdlKSk7XG4gICAgICAgIGlmIChjYW5Gb3JjaWJseU1lcmdlICYmICFkaXNhYmxlRm9yY2VNZXJnZVByb21wdCkge1xuICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICBpbmZvKHllbGxvdygnVGhlIHB1bGwgcmVxdWVzdCBhYm92ZSBmYWlsZWQgZHVlIHRvIG5vbi1jcml0aWNhbCBlcnJvcnMuJykpO1xuICAgICAgICAgIGluZm8oeWVsbG93KGBUaGlzIGVycm9yIGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkIGlmIGRlc2lyZWQuYCkpO1xuICAgICAgICAgIHJldHVybiBhd2FpdCBwcm9tcHRBbmRQZXJmb3JtRm9yY2VNZXJnZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBVbmV4cGVjdGVkIG1lcmdlIHJlc3VsdDogJHtzdGF0dXN9YCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlIHRhc2sgZnJvbSB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuLCBwcm9qZWN0IHJvb3RcbiAqIGFuZCBvcHRpb25hbCBleHBsaWNpdCBjb25maWd1cmF0aW9uLiBBbiBleHBsaWNpdCBjb25maWd1cmF0aW9uIGNhbiBiZSBzcGVjaWZpZWRcbiAqIHdoZW4gdGhlIG1lcmdlIHNjcmlwdCBpcyB1c2VkIG91dHNpZGUgb2YgYSBgbmctZGV2YCBjb25maWd1cmVkIHJlcG9zaXRvcnkuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVB1bGxSZXF1ZXN0TWVyZ2VUYXNrKFxuICAgIGdpdGh1YlRva2VuOiBzdHJpbmcsIHByb2plY3RSb290OiBzdHJpbmcsIGV4cGxpY2l0Q29uZmlnPzogTWVyZ2VDb25maWdXaXRoUmVtb3RlKSB7XG4gIGlmIChleHBsaWNpdENvbmZpZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbiwge2dpdGh1YjogZXhwbGljaXRDb25maWcucmVtb3RlfSwgcHJvamVjdFJvb3QpO1xuICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RNZXJnZVRhc2soZXhwbGljaXRDb25maWcsIGdpdCk7XG4gIH1cblxuICBjb25zdCBkZXZJbmZyYUNvbmZpZyA9IGdldENvbmZpZygpO1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuLCBkZXZJbmZyYUNvbmZpZywgcHJvamVjdFJvb3QpO1xuICBjb25zdCB7Y29uZmlnLCBlcnJvcnN9ID0gYXdhaXQgbG9hZEFuZFZhbGlkYXRlQ29uZmlnKGRldkluZnJhQ29uZmlnLCBnaXQuZ2l0aHViKTtcblxuICBpZiAoZXJyb3JzKSB7XG4gICAgZXJyb3IocmVkKCdJbnZhbGlkIG1lcmdlIGNvbmZpZ3VyYXRpb246JykpO1xuICAgIGVycm9ycy5mb3JFYWNoKGRlc2MgPT4gZXJyb3IoeWVsbG93KGAgIC0gICR7ZGVzY31gKSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIFNldCB0aGUgcmVtb3RlIHNvIHRoYXQgdGhlIG1lcmdlIHRvb2wgaGFzIGFjY2VzcyB0byBpbmZvcm1hdGlvbiBhYm91dFxuICAvLyB0aGUgcmVtb3RlIGl0IGludGVuZHMgdG8gbWVyZ2UgdG8uXG4gIGNvbmZpZyEucmVtb3RlID0gZGV2SW5mcmFDb25maWcuZ2l0aHViO1xuICAvLyBXZSBjYW4gY2FzdCB0aGlzIHRvIGEgbWVyZ2UgY29uZmlnIHdpdGggcmVtb3RlIGJlY2F1c2Ugd2UgYWx3YXlzIHNldCB0aGVcbiAgLy8gcmVtb3RlIGFib3ZlLlxuICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrKGNvbmZpZyEgYXMgTWVyZ2VDb25maWdXaXRoUmVtb3RlLCBnaXQpO1xufVxuIl19