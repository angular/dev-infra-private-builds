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
        define("@angular/dev-infra-private/utils/git/index", ["require", "exports", "tslib", "child_process", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    /** Error for failed Git commands. */
    var GitCommandError = /** @class */ (function (_super) {
        tslib_1.__extends(GitCommandError, _super);
        function GitCommandError(client, args) {
            var _this = 
            // Errors are not guaranteed to be caught. To ensure that we don't
            // accidentally leak the Github token that might be used in a command,
            // we sanitize the command that will be part of the error message.
            _super.call(this, "Command failed: git " + client.omitGithubTokenFromMessage(args.join(' '))) || this;
            _this.args = args;
            return _this;
        }
        return GitCommandError;
    }(Error));
    exports.GitCommandError = GitCommandError;
    /**
     * Common client for performing Git interactions with a given remote.
     *
     * Takes in two optional arguments:
     *   `githubToken`: the token used for authentication in Github interactions, by default empty
     *     allowing readonly actions.
     *   `config`: The dev-infra configuration containing information about the remote. By default
     *     the dev-infra configuration is loaded with its Github configuration.
     **/
    var GitClient = /** @class */ (function () {
        function GitClient(githubToken, _config, _projectRoot) {
            if (_config === void 0) { _config = config_1.getConfig(); }
            if (_projectRoot === void 0) { _projectRoot = config_1.getRepoBaseDir(); }
            this.githubToken = githubToken;
            this._config = _config;
            this._projectRoot = _projectRoot;
            /** Short-hand for accessing the default remote configuration. */
            this.remoteConfig = this._config.github;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** Git URL that resolves to the configured repository. */
            this.repoGitUrl = github_urls_1.getRepositoryGitUrl(this.remoteConfig, this.githubToken);
            /** Instance of the authenticated Github octokit API. */
            this.github = new github_1.GithubClient(this.githubToken);
            /** The OAuth scopes available for the provided Github token. */
            this._cachedOauthScopes = null;
            /**
             * Regular expression that matches the provided Github token. Used for
             * sanitizing the token from Git child process output.
             */
            this._githubTokenRegex = null;
            // If a token has been specified (and is not empty), pass it to the Octokit API and
            // also create a regular expression that can be used for sanitizing Git command output
            // so that it does not print the token accidentally.
            if (githubToken != null) {
                this._githubTokenRegex = new RegExp(githubToken, 'g');
            }
        }
        /** Executes the given git command. Throws if the command fails. */
        GitClient.prototype.run = function (args, options) {
            var result = this.runGraceful(args, options);
            if (result.status !== 0) {
                throw new GitCommandError(this, args);
            }
            // Omit `status` from the type so that it's obvious that the status is never
            // non-zero as explained in the method description.
            return result;
        };
        /**
         * Spawns a given Git command process. Does not throw if the command fails. Additionally,
         * if there is any stderr output, the output will be printed. This makes it easier to
         * info failed commands.
         */
        GitClient.prototype.runGraceful = function (args, options) {
            if (options === void 0) { options = {}; }
            // To improve the debugging experience in case something fails, we print all executed Git
            // commands unless the `stdio` is explicitly to `ignore` (which is equivalent to silent).
            // Note that we do not want to print the token if is contained in the command. It's common
            // to share errors with others if the tool failed, and we do not want to leak tokens.
            // TODO: Add support for configuring this on a per-client basis. Some tools do not want
            // to print the Git command messages to the console at all (e.g. to maintain clean output).
            var printFn = options.stdio !== 'ignore' ? console_1.info : console_1.debug;
            printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
            var result = child_process_1.spawnSync('git', args, tslib_1.__assign(tslib_1.__assign({ cwd: this._projectRoot, stdio: 'pipe' }, options), { 
                // Encoding is always `utf8` and not overridable. This ensures that this method
                // always returns `string` as output instead of buffers.
                encoding: 'utf8' }));
            if (result.stderr !== null) {
                // Git sometimes prints the command if it failed. This means that it could
                // potentially leak the Github token used for accessing the remote. To avoid
                // printing a token, we sanitize the string before printing the stderr output.
                process.stderr.write(this.omitGithubTokenFromMessage(result.stderr));
            }
            return result;
        };
        /** Whether the given branch contains the specified SHA. */
        GitClient.prototype.hasCommit = function (branchName, sha) {
            return this.run(['branch', branchName, '--contains', sha]).stdout !== '';
        };
        /** Gets the currently checked out branch or revision. */
        GitClient.prototype.getCurrentBranchOrRevision = function () {
            var branchName = this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
            // If no branch name could be resolved. i.e. `HEAD` has been returned, then Git
            // is currently in a detached state. In those cases, we just want to return the
            // currently checked out revision/SHA.
            if (branchName === 'HEAD') {
                return this.run(['rev-parse', 'HEAD']).stdout.trim();
            }
            return branchName;
        };
        /** Gets whether the current Git repository has uncommitted changes. */
        GitClient.prototype.hasUncommittedChanges = function () {
            return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
        };
        /** Whether the repo has any local changes. */
        GitClient.prototype.hasLocalChanges = function () {
            return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
        };
        /** Sanitizes a given message by omitting the provided Github token if present. */
        GitClient.prototype.omitGithubTokenFromMessage = function (value) {
            // If no token has been defined (i.e. no token regex), we just return the
            // value as is. There is no secret value that needs to be omitted.
            if (this._githubTokenRegex === null) {
                return value;
            }
            return value.replace(this._githubTokenRegex, '<TOKEN>');
        };
        /**
         * Checks out a requested branch or revision, optionally cleaning the state of the repository
         * before attempting the checking. Returns a boolean indicating whether the branch or revision
         * was cleanly checked out.
         */
        GitClient.prototype.checkout = function (branchOrRevision, cleanState) {
            if (cleanState) {
                // Abort any outstanding ams.
                this.runGraceful(['am', '--abort'], { stdio: 'ignore' });
                // Abort any outstanding cherry-picks.
                this.runGraceful(['cherry-pick', '--abort'], { stdio: 'ignore' });
                // Abort any outstanding rebases.
                this.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
                // Clear any changes in the current repo.
                this.runGraceful(['reset', '--hard'], { stdio: 'ignore' });
            }
            return this.runGraceful(['checkout', branchOrRevision], { stdio: 'ignore' }).status === 0;
        };
        /**
         * Assert the GitClient instance is using a token with permissions for the all of the
         * provided OAuth scopes.
         */
        GitClient.prototype.hasOauthScopes = function (testFn) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var scopes, missingScopes, error;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.getAuthScopesForToken()];
                        case 1:
                            scopes = _a.sent();
                            missingScopes = [];
                            // Test Github OAuth scopes and collect missing ones.
                            testFn(scopes, missingScopes);
                            // If no missing scopes are found, return true to indicate all OAuth Scopes are available.
                            if (missingScopes.length === 0) {
                                return [2 /*return*/, true];
                            }
                            error = "The provided <TOKEN> does not have required permissions due to missing scope(s): " +
                                (console_1.yellow(missingScopes.join(', ')) + "\n\n") +
                                "Update the token in use at:\n" +
                                ("  " + github_urls_1.GITHUB_TOKEN_SETTINGS_URL + "\n\n") +
                                ("Alternatively, a new token can be created at: " + github_urls_1.GITHUB_TOKEN_GENERATE_URL + "\n");
                            return [2 /*return*/, { error: error }];
                    }
                });
            });
        };
        /**
         * Retrieve the OAuth scopes for the loaded Github token.
         **/
        GitClient.prototype.getAuthScopesForToken = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // If the OAuth scopes have already been loaded, return the Promise containing them.
                    if (this._cachedOauthScopes !== null) {
                        return [2 /*return*/, this._cachedOauthScopes];
                    }
                    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
                    // usage of a request against that rate_limit for this lookup.
                    return [2 /*return*/, this._cachedOauthScopes = this.github.rateLimit.get().then(function (_response) {
                            var response = _response;
                            var scopes = response.headers['x-oauth-scopes'] || '';
                            return scopes.split(',').map(function (scope) { return scope.trim(); });
                        })];
                });
            });
        };
        return GitClient;
    }());
    exports.GitClient = GitClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQ0FBNEU7SUFFNUUsa0VBQWlFO0lBQ2pFLG9FQUErQztJQUMvQyxzRUFBc0M7SUFDdEMsZ0ZBQXdHO0lBVXhHLHFDQUFxQztJQUNyQztRQUFxQywyQ0FBSztRQUN4Qyx5QkFBWSxNQUFpQixFQUFTLElBQWM7WUFBcEQ7WUFDRSxrRUFBa0U7WUFDbEUsc0VBQXNFO1lBQ3RFLGtFQUFrRTtZQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQUNsRjtZQUxxQyxVQUFJLEdBQUosSUFBSSxDQUFVOztRQUtwRCxDQUFDO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBUEQsQ0FBcUMsS0FBSyxHQU96QztJQVBZLDBDQUFlO0lBUzVCOzs7Ozs7OztRQVFJO0lBQ0o7UUFrQkUsbUJBQ1csV0FBb0IsRUFBVSxPQUFrRCxFQUMvRSxZQUErQjtZQURGLHdCQUFBLEVBQUEsVUFBdUMsa0JBQVMsRUFBRTtZQUMvRSw2QkFBQSxFQUFBLGVBQWUsdUJBQWMsRUFBRTtZQURoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBUztZQUFVLFlBQU8sR0FBUCxPQUFPLENBQTJDO1lBQy9FLGlCQUFZLEdBQVosWUFBWSxDQUFtQjtZQW5CM0MsaUVBQWlFO1lBQ2pFLGlCQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDbkMsNkVBQTZFO1lBQzdFLGlCQUFZLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFDLENBQUM7WUFD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QUFDLGtCQUFrQixFQUFDO3FCQUNoQztvQkFDRCxrRUFBa0U7b0JBQ2xFLDhEQUE4RDtvQkFDOUQsc0JBQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7NEJBQ3pFLElBQU0sUUFBUSxHQUFHLFNBQWtELENBQUM7NEJBQ3BFLElBQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ2hFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7d0JBQ3RELENBQUMsQ0FBQyxFQUFDOzs7U0FDSjtRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQTlLRCxJQThLQztJQTlLWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2dldENvbmZpZywgZ2V0UmVwb0Jhc2VEaXIsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mbywgeWVsbG93fSBmcm9tICcuLi9jb25zb2xlJztcbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmwsIEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwsIEdJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogR2l0aHViIHJlc3BvbnNlIHR5cGUgZXh0ZW5kZWQgdG8gaW5jbHVkZSB0aGUgYHgtb2F1dGgtc2NvcGVzYCBoZWFkZXJzIHByZXNlbmNlLiAqL1xudHlwZSBSYXRlTGltaXRSZXNwb25zZVdpdGhPQXV0aFNjb3BlSGVhZGVyID0gT2N0b2tpdC5SZXNwb25zZTxPY3Rva2l0LlJhdGVMaW1pdEdldFJlc3BvbnNlPiZ7XG4gIGhlYWRlcnM6IHsneC1vYXV0aC1zY29wZXMnOiBzdHJpbmd9O1xufTtcblxuLyoqIERlc2NyaWJlcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gdGVzdCBmb3IgZ2l2ZW4gR2l0aHViIE9BdXRoIHNjb3Blcy4gKi9cbmV4cG9ydCB0eXBlIE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24gPSAoc2NvcGVzOiBzdHJpbmdbXSwgbWlzc2luZzogc3RyaW5nW10pID0+IHZvaWQ7XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRDb21tYW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudDogR2l0Q2xpZW50LCBwdWJsaWMgYXJnczogc3RyaW5nW10pIHtcbiAgICAvLyBFcnJvcnMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhdWdodC4gVG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3RcbiAgICAvLyBhY2NpZGVudGFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHRoYXQgbWlnaHQgYmUgdXNlZCBpbiBhIGNvbW1hbmQsXG4gICAgLy8gd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgc3VwZXIoYENvbW1hbmQgZmFpbGVkOiBnaXQgJHtjbGllbnQub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpfWApO1xuICB9XG59XG5cbi8qKlxuICogQ29tbW9uIGNsaWVudCBmb3IgcGVyZm9ybWluZyBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuXG4gKlxuICogVGFrZXMgaW4gdHdvIG9wdGlvbmFsIGFyZ3VtZW50czpcbiAqICAgYGdpdGh1YlRva2VuYDogdGhlIHRva2VuIHVzZWQgZm9yIGF1dGhlbnRpY2F0aW9uIGluIEdpdGh1YiBpbnRlcmFjdGlvbnMsIGJ5IGRlZmF1bHQgZW1wdHlcbiAqICAgICBhbGxvd2luZyByZWFkb25seSBhY3Rpb25zLlxuICogICBgY29uZmlnYDogVGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbW90ZS4gQnkgZGVmYXVsdFxuICogICAgIHRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBpcyBsb2FkZWQgd2l0aCBpdHMgR2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gKiovXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50IHtcbiAgLyoqIFNob3J0LWhhbmQgZm9yIGFjY2Vzc2luZyB0aGUgZGVmYXVsdCByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVtb3RlQ29uZmlnID0gdGhpcy5fY29uZmlnLmdpdGh1YjtcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICAvKiogSW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgR2l0aHViIG9jdG9raXQgQVBJLiAqL1xuICBnaXRodWIgPSBuZXcgR2l0aHViQ2xpZW50KHRoaXMuZ2l0aHViVG9rZW4pO1xuXG4gIC8qKiBUaGUgT0F1dGggc2NvcGVzIGF2YWlsYWJsZSBmb3IgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkT2F1dGhTY29wZXM6IFByb21pc2U8c3RyaW5nW10+fG51bGwgPSBudWxsO1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cHxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBnaXRodWJUb2tlbj86IHN0cmluZywgcHJpdmF0ZSBfY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSxcbiAgICAgIHByaXZhdGUgX3Byb2plY3RSb290ID0gZ2V0UmVwb0Jhc2VEaXIoKSkge1xuICAgIC8vIElmIGEgdG9rZW4gaGFzIGJlZW4gc3BlY2lmaWVkIChhbmQgaXMgbm90IGVtcHR5KSwgcGFzcyBpdCB0byB0aGUgT2N0b2tpdCBBUEkgYW5kXG4gICAgLy8gYWxzbyBjcmVhdGUgYSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBmb3Igc2FuaXRpemluZyBHaXQgY29tbWFuZCBvdXRwdXRcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IHByaW50IHRoZSB0b2tlbiBhY2NpZGVudGFsbHkuXG4gICAgaWYgKGdpdGh1YlRva2VuICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPSBuZXcgUmVnRXhwKGdpdGh1YlRva2VuLCAnZycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25TeW5jT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBTcGF3blN5bmNPcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWQgR2l0XG4gICAgLy8gY29tbWFuZHMgdW5sZXNzIHRoZSBgc3RkaW9gIGlzIGV4cGxpY2l0bHkgdG8gYGlnbm9yZWAgKHdoaWNoIGlzIGVxdWl2YWxlbnQgdG8gc2lsZW50KS5cbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gbm90IHdhbnQgdG8gcHJpbnQgdGhlIHRva2VuIGlmIGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb25cbiAgICAvLyB0byBzaGFyZSBlcnJvcnMgd2l0aCBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgLy8gVE9ETzogQWRkIHN1cHBvcnQgZm9yIGNvbmZpZ3VyaW5nIHRoaXMgb24gYSBwZXItY2xpZW50IGJhc2lzLiBTb21lIHRvb2xzIGRvIG5vdCB3YW50XG4gICAgLy8gdG8gcHJpbnQgdGhlIEdpdCBjb21tYW5kIG1lc3NhZ2VzIHRvIHRoZSBjb25zb2xlIGF0IGFsbCAoZS5nLiB0byBtYWludGFpbiBjbGVhbiBvdXRwdXQpLlxuICAgIGNvbnN0IHByaW50Rm4gPSBvcHRpb25zLnN0ZGlvICE9PSAnaWdub3JlJyA/IGluZm8gOiBkZWJ1ZztcbiAgICBwcmludEZuKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYygnZ2l0JywgYXJncywge1xuICAgICAgY3dkOiB0aGlzLl9wcm9qZWN0Um9vdCxcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShyZXN1bHQuc3RkZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2ggb3IgcmV2aXNpb24uICovXG4gIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gSWYgbm8gYnJhbmNoIG5hbWUgY291bGQgYmUgcmVzb2x2ZWQuIGkuZS4gYEhFQURgIGhhcyBiZWVuIHJldHVybmVkLCB0aGVuIEdpdFxuICAgIC8vIGlzIGN1cnJlbnRseSBpbiBhIGRldGFjaGVkIHN0YXRlLiBJbiB0aG9zZSBjYXNlcywgd2UganVzdCB3YW50IHRvIHJldHVybiB0aGVcbiAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24vU0hBLlxuICAgIGlmIChicmFuY2hOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY3VycmVudCBHaXQgcmVwb3NpdG9yeSBoYXMgdW5jb21taXR0ZWQgY2hhbmdlcy4gKi9cbiAgaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGFueSBsb2NhbCBjaGFuZ2VzLiAqL1xuICBoYXNMb2NhbENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIElmIG5vIHRva2VuIGhhcyBiZWVuIGRlZmluZWQgKGkuZS4gbm8gdG9rZW4gcmVnZXgpLCB3ZSBqdXN0IHJldHVybiB0aGVcbiAgICAvLyB2YWx1ZSBhcyBpcy4gVGhlcmUgaXMgbm8gc2VjcmV0IHZhbHVlIHRoYXQgbmVlZHMgdG8gYmUgb21pdHRlZC5cbiAgICBpZiAodGhpcy5fZ2l0aHViVG9rZW5SZWdleCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl9naXRodWJUb2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgYSByZXF1ZXN0ZWQgYnJhbmNoIG9yIHJldmlzaW9uLCBvcHRpb25hbGx5IGNsZWFuaW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBiZWZvcmUgYXR0ZW1wdGluZyB0aGUgY2hlY2tpbmcuIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYnJhbmNoIG9yIHJldmlzaW9uXG4gICAqIHdhcyBjbGVhbmx5IGNoZWNrZWQgb3V0LlxuICAgKi9cbiAgY2hlY2tvdXQoYnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nLCBjbGVhblN0YXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGNsZWFuU3RhdGUpIHtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBhbXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnYW0nLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgY2hlcnJ5LXBpY2tzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQ2xlYXIgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwby5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZXNldCcsICctLWhhcmQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgYnJhbmNoT3JSZXZpc2lvbl0sIHtzdGRpbzogJ2lnbm9yZSd9KS5zdGF0dXMgPT09IDA7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBHaXRDbGllbnQgaW5zdGFuY2UgaXMgdXNpbmcgYSB0b2tlbiB3aXRoIHBlcm1pc3Npb25zIGZvciB0aGUgYWxsIG9mIHRoZVxuICAgKiBwcm92aWRlZCBPQXV0aCBzY29wZXMuXG4gICAqL1xuICBhc3luYyBoYXNPYXV0aFNjb3Blcyh0ZXN0Rm46IE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24pOiBQcm9taXNlPHRydWV8e2Vycm9yOiBzdHJpbmd9PiB7XG4gICAgY29uc3Qgc2NvcGVzID0gYXdhaXQgdGhpcy5nZXRBdXRoU2NvcGVzRm9yVG9rZW4oKTtcbiAgICBjb25zdCBtaXNzaW5nU2NvcGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRlc3QgR2l0aHViIE9BdXRoIHNjb3BlcyBhbmQgY29sbGVjdCBtaXNzaW5nIG9uZXMuXG4gICAgdGVzdEZuKHNjb3BlcywgbWlzc2luZ1Njb3Blcyk7XG4gICAgLy8gSWYgbm8gbWlzc2luZyBzY29wZXMgYXJlIGZvdW5kLCByZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhbGwgT0F1dGggU2NvcGVzIGFyZSBhdmFpbGFibGUuXG4gICAgaWYgKG1pc3NpbmdTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVjb25zdHJ1Y3RlZCBlcnJvciBtZXNzYWdlIHRvIGxvZyB0byB0aGUgdXNlciwgcHJvdmlkaW5nIG1pc3Npbmcgc2NvcGVzIGFuZFxuICAgICAqIHJlbWVkaWF0aW9uIGluc3RydWN0aW9ucy5cbiAgICAgKiovXG4gICAgY29uc3QgZXJyb3IgPVxuICAgICAgICBgVGhlIHByb3ZpZGVkIDxUT0tFTj4gZG9lcyBub3QgaGF2ZSByZXF1aXJlZCBwZXJtaXNzaW9ucyBkdWUgdG8gbWlzc2luZyBzY29wZShzKTogYCArXG4gICAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgICBgVXBkYXRlIHRoZSB0b2tlbiBpbiB1c2UgYXQ6XFxuYCArXG4gICAgICAgIGAgICR7R0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH1cXG5cXG5gICtcbiAgICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLlxuICAgKiovXG4gIHByaXZhdGUgYXN5bmMgZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCkge1xuICAgIC8vIElmIHRoZSBPQXV0aCBzY29wZXMgaGF2ZSBhbHJlYWR5IGJlZW4gbG9hZGVkLCByZXR1cm4gdGhlIFByb21pc2UgY29udGFpbmluZyB0aGVtLlxuICAgIGlmICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzO1xuICAgIH1cbiAgICAvLyBPQXV0aCBzY29wZXMgYXJlIGxvYWRlZCB2aWEgdGhlIC9yYXRlX2xpbWl0IGVuZHBvaW50IHRvIHByZXZlbnRcbiAgICAvLyB1c2FnZSBvZiBhIHJlcXVlc3QgYWdhaW5zdCB0aGF0IHJhdGVfbGltaXQgZm9yIHRoaXMgbG9va3VwLlxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyA9IHRoaXMuZ2l0aHViLnJhdGVMaW1pdC5nZXQoKS50aGVuKF9yZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IF9yZXNwb25zZSBhcyBSYXRlTGltaXRSZXNwb25zZVdpdGhPQXV0aFNjb3BlSGVhZGVyO1xuICAgICAgY29uc3Qgc2NvcGVzOiBzdHJpbmcgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddIHx8ICcnO1xuICAgICAgcmV0dXJuIHNjb3Blcy5zcGxpdCgnLCcpLm1hcChzY29wZSA9PiBzY29wZS50cmltKCkpO1xuICAgIH0pO1xuICB9XG59XG4iXX0=