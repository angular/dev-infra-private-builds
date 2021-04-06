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
        define("@angular/dev-infra-private/utils/git/index", ["require", "exports", "tslib", "child_process", "semver", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/dry-run", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
    var semver_1 = require("semver");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var dry_run_1 = require("@angular/dev-infra-private/utils/dry-run");
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
            /** The git command to be run. */
            var gitCommand = args[0];
            if (dry_run_1.isDryRun() && gitCommand === 'push') {
                console_1.debug("\"git push\" is not able to be run in dryRun mode.");
                throw new dry_run_1.DryRunError();
            }
            // To improve the debugging experience in case something fails, we print all executed Git
            // commands to better understand the git actions occuring. Depending on the command being
            // executed, this debugging information should be logged at different logging levels.
            var printFn = (!GitClient.LOG_COMMANDS || options.stdio === 'ignore') ? console_1.debug : console_1.info;
            // Note that we do not want to print the token if it is contained in the command. It's common
            // to share errors with others if the tool failed, and we do not want to leak tokens.
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
        /** Gets the latest git tag on the current branch that matches SemVer. */
        GitClient.prototype.getLatestSemverTag = function () {
            var semVerOptions = { loose: true };
            var tags = this.runGraceful(['tag', '--sort=-committerdate', '--merged']).stdout.split('\n');
            var latestTag = tags.find(function (tag) { return semver_1.parse(tag, semVerOptions); });
            if (latestTag === undefined) {
                throw new Error("Unable to find a SemVer matching tag on \"" + this.getCurrentBranchOrRevision() + "\"");
            }
            return new semver_1.SemVer(latestTag, semVerOptions);
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
            // If the OAuth scopes have already been loaded, return the Promise containing them.
            if (this._cachedOauthScopes !== null) {
                return this._cachedOauthScopes;
            }
            // OAuth scopes are loaded via the /rate_limit endpoint to prevent
            // usage of a request against that rate_limit for this lookup.
            return this._cachedOauthScopes = this.github.rateLimit.get().then(function (_response) {
                var response = _response;
                var scopes = response.headers['x-oauth-scopes'] || '';
                return scopes.split(',').map(function (scope) { return scope.trim(); });
            });
        };
        /** Whether verbose logging of Git actions should be used. */
        GitClient.LOG_COMMANDS = true;
        return GitClient;
    }());
    exports.GitClient = GitClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQ0FBNEU7SUFDNUUsaUNBQStEO0lBRS9ELGtFQUFpRTtJQUNqRSxvRUFBK0M7SUFDL0Msb0VBQWlEO0lBQ2pELHNFQUFzQztJQUN0QyxnRkFBd0c7SUFVeEcscUNBQXFDO0lBQ3JDO1FBQXFDLDJDQUFLO1FBQ3hDLHlCQUFZLE1BQWlCLEVBQVMsSUFBYztZQUFwRDtZQUNFLGtFQUFrRTtZQUNsRSxzRUFBc0U7WUFDdEUsa0VBQWtFO1lBQ2xFLGtCQUFNLHlCQUF1QixNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDLFNBQ2xGO1lBTHFDLFVBQUksR0FBSixJQUFJLENBQVU7O1FBS3BELENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFQRCxDQUFxQyxLQUFLLEdBT3pDO0lBUFksMENBQWU7SUFTNUI7Ozs7Ozs7O1FBUUk7SUFDSjtRQW9CRSxtQkFDVyxXQUFvQixFQUFVLE9BQWtELEVBQy9FLFlBQStCO1lBREYsd0JBQUEsRUFBQSxVQUF1QyxrQkFBUyxFQUFFO1lBQy9FLDZCQUFBLEVBQUEsZUFBZSx1QkFBYyxFQUFFO1lBRGhDLGdCQUFXLEdBQVgsV0FBVyxDQUFTO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBMkM7WUFDL0UsaUJBQVksR0FBWixZQUFZLENBQW1CO1lBbkIzQyxpRUFBaUU7WUFDakUsaUJBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNuQyw2RUFBNkU7WUFDN0UsaUJBQVksR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlB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QU0sR0FBVyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxDQUFDO2dCQUNoRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQWxNRCw2REFBNkQ7UUFDdEQsc0JBQVksR0FBRyxJQUFJLENBQUM7UUFrTTdCLGdCQUFDO0tBQUEsQUFwTUQsSUFvTUM7SUFwTVksOEJBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7c3Bhd25TeW5jLCBTcGF3blN5bmNPcHRpb25zLCBTcGF3blN5bmNSZXR1cm5zfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcbmltcG9ydCB7T3B0aW9ucyBhcyBTZW1WZXJPcHRpb25zLCBwYXJzZSwgU2VtVmVyfSBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dldENvbmZpZywgZ2V0UmVwb0Jhc2VEaXIsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgaW5mbywgeWVsbG93fSBmcm9tICcuLi9jb25zb2xlJztcbmltcG9ydCB7RHJ5UnVuRXJyb3IsIGlzRHJ5UnVufSBmcm9tICcuLi9kcnktcnVuJztcbmltcG9ydCB7R2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmwsIEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwsIEdJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogR2l0aHViIHJlc3BvbnNlIHR5cGUgZXh0ZW5kZWQgdG8gaW5jbHVkZSB0aGUgYHgtb2F1dGgtc2NvcGVzYCBoZWFkZXJzIHByZXNlbmNlLiAqL1xudHlwZSBSYXRlTGltaXRSZXNwb25zZVdpdGhPQXV0aFNjb3BlSGVhZGVyID0gT2N0b2tpdC5SZXNwb25zZTxPY3Rva2l0LlJhdGVMaW1pdEdldFJlc3BvbnNlPiZ7XG4gIGhlYWRlcnM6IHsneC1vYXV0aC1zY29wZXMnOiBzdHJpbmd9O1xufTtcblxuLyoqIERlc2NyaWJlcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gdGVzdCBmb3IgZ2l2ZW4gR2l0aHViIE9BdXRoIHNjb3Blcy4gKi9cbmV4cG9ydCB0eXBlIE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24gPSAoc2NvcGVzOiBzdHJpbmdbXSwgbWlzc2luZzogc3RyaW5nW10pID0+IHZvaWQ7XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdCBjb21tYW5kcy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRDb21tYW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudDogR2l0Q2xpZW50LCBwdWJsaWMgYXJnczogc3RyaW5nW10pIHtcbiAgICAvLyBFcnJvcnMgYXJlIG5vdCBndWFyYW50ZWVkIHRvIGJlIGNhdWdodC4gVG8gZW5zdXJlIHRoYXQgd2UgZG9uJ3RcbiAgICAvLyBhY2NpZGVudGFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHRoYXQgbWlnaHQgYmUgdXNlZCBpbiBhIGNvbW1hbmQsXG4gICAgLy8gd2Ugc2FuaXRpemUgdGhlIGNvbW1hbmQgdGhhdCB3aWxsIGJlIHBhcnQgb2YgdGhlIGVycm9yIG1lc3NhZ2UuXG4gICAgc3VwZXIoYENvbW1hbmQgZmFpbGVkOiBnaXQgJHtjbGllbnQub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpfWApO1xuICB9XG59XG5cbi8qKlxuICogQ29tbW9uIGNsaWVudCBmb3IgcGVyZm9ybWluZyBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuXG4gKlxuICogVGFrZXMgaW4gdHdvIG9wdGlvbmFsIGFyZ3VtZW50czpcbiAqICAgYGdpdGh1YlRva2VuYDogdGhlIHRva2VuIHVzZWQgZm9yIGF1dGhlbnRpY2F0aW9uIGluIEdpdGh1YiBpbnRlcmFjdGlvbnMsIGJ5IGRlZmF1bHQgZW1wdHlcbiAqICAgICBhbGxvd2luZyByZWFkb25seSBhY3Rpb25zLlxuICogICBgY29uZmlnYDogVGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbW90ZS4gQnkgZGVmYXVsdFxuICogICAgIHRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBpcyBsb2FkZWQgd2l0aCBpdHMgR2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gKiovXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50IHtcbiAgLyoqIFdoZXRoZXIgdmVyYm9zZSBsb2dnaW5nIG9mIEdpdCBhY3Rpb25zIHNob3VsZCBiZSB1c2VkLiAqL1xuICBzdGF0aWMgTE9HX0NPTU1BTkRTID0gdHJ1ZTtcbiAgLyoqIFNob3J0LWhhbmQgZm9yIGFjY2Vzc2luZyB0aGUgZGVmYXVsdCByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVtb3RlQ29uZmlnID0gdGhpcy5fY29uZmlnLmdpdGh1YjtcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICAvKiogSW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgR2l0aHViIG9jdG9raXQgQVBJLiAqL1xuICBnaXRodWIgPSBuZXcgR2l0aHViQ2xpZW50KHRoaXMuZ2l0aHViVG9rZW4pO1xuXG4gIC8qKiBUaGUgT0F1dGggc2NvcGVzIGF2YWlsYWJsZSBmb3IgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkT2F1dGhTY29wZXM6IFByb21pc2U8c3RyaW5nW10+fG51bGwgPSBudWxsO1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cHxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBnaXRodWJUb2tlbj86IHN0cmluZywgcHJpdmF0ZSBfY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSxcbiAgICAgIHByaXZhdGUgX3Byb2plY3RSb290ID0gZ2V0UmVwb0Jhc2VEaXIoKSkge1xuICAgIC8vIElmIGEgdG9rZW4gaGFzIGJlZW4gc3BlY2lmaWVkIChhbmQgaXMgbm90IGVtcHR5KSwgcGFzcyBpdCB0byB0aGUgT2N0b2tpdCBBUEkgYW5kXG4gICAgLy8gYWxzbyBjcmVhdGUgYSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBmb3Igc2FuaXRpemluZyBHaXQgY29tbWFuZCBvdXRwdXRcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IHByaW50IHRoZSB0b2tlbiBhY2NpZGVudGFsbHkuXG4gICAgaWYgKGdpdGh1YlRva2VuICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPSBuZXcgUmVnRXhwKGdpdGh1YlRva2VuLCAnZycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogU3Bhd25TeW5jT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBTcGF3blN5bmNPcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8qKiBUaGUgZ2l0IGNvbW1hbmQgdG8gYmUgcnVuLiAqL1xuICAgIGNvbnN0IGdpdENvbW1hbmQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKGlzRHJ5UnVuKCkgJiYgZ2l0Q29tbWFuZCA9PT0gJ3B1c2gnKSB7XG4gICAgICBkZWJ1ZyhgXCJnaXQgcHVzaFwiIGlzIG5vdCBhYmxlIHRvIGJlIHJ1biBpbiBkcnlSdW4gbW9kZS5gKTtcbiAgICAgIHRocm93IG5ldyBEcnlSdW5FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWQgR2l0XG4gICAgLy8gY29tbWFuZHMgdG8gYmV0dGVyIHVuZGVyc3RhbmQgdGhlIGdpdCBhY3Rpb25zIG9jY3VyaW5nLiBEZXBlbmRpbmcgb24gdGhlIGNvbW1hbmQgYmVpbmdcbiAgICAvLyBleGVjdXRlZCwgdGhpcyBkZWJ1Z2dpbmcgaW5mb3JtYXRpb24gc2hvdWxkIGJlIGxvZ2dlZCBhdCBkaWZmZXJlbnQgbG9nZ2luZyBsZXZlbHMuXG4gICAgY29uc3QgcHJpbnRGbiA9ICghR2l0Q2xpZW50LkxPR19DT01NQU5EUyB8fCBvcHRpb25zLnN0ZGlvID09PSAnaWdub3JlJykgPyBkZWJ1ZyA6IGluZm87XG4gICAgLy8gTm90ZSB0aGF0IHdlIGRvIG5vdCB3YW50IHRvIHByaW50IHRoZSB0b2tlbiBpZiBpdCBpcyBjb250YWluZWQgaW4gdGhlIGNvbW1hbmQuIEl0J3MgY29tbW9uXG4gICAgLy8gdG8gc2hhcmUgZXJyb3JzIHdpdGggb3RoZXJzIGlmIHRoZSB0b29sIGZhaWxlZCwgYW5kIHdlIGRvIG5vdCB3YW50IHRvIGxlYWsgdG9rZW5zLlxuICAgIHByaW50Rm4oJ0V4ZWN1dGluZzogZ2l0JywgdGhpcy5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShhcmdzLmpvaW4oJyAnKSkpO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gc3Bhd25TeW5jKCdnaXQnLCBhcmdzLCB7XG4gICAgICBjd2Q6IHRoaXMuX3Byb2plY3RSb290LFxuICAgICAgc3RkaW86ICdwaXBlJyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAvLyBFbmNvZGluZyBpcyBhbHdheXMgYHV0ZjhgIGFuZCBub3Qgb3ZlcnJpZGFibGUuIFRoaXMgZW5zdXJlcyB0aGF0IHRoaXMgbWV0aG9kXG4gICAgICAvLyBhbHdheXMgcmV0dXJucyBgc3RyaW5nYCBhcyBvdXRwdXQgaW5zdGVhZCBvZiBidWZmZXJzLlxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGlmIChyZXN1bHQuc3RkZXJyICE9PSBudWxsKSB7XG4gICAgICAvLyBHaXQgc29tZXRpbWVzIHByaW50cyB0aGUgY29tbWFuZCBpZiBpdCBmYWlsZWQuIFRoaXMgbWVhbnMgdGhhdCBpdCBjb3VsZFxuICAgICAgLy8gcG90ZW50aWFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHVzZWQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlLiBUbyBhdm9pZFxuICAgICAgLy8gcHJpbnRpbmcgYSB0b2tlbiwgd2Ugc2FuaXRpemUgdGhlIHN0cmluZyBiZWZvcmUgcHJpbnRpbmcgdGhlIHN0ZGVyciBvdXRwdXQuXG4gICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSh0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHJlc3VsdC5zdGRlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFNIQS4gKi9cbiAgaGFzQ29tbWl0KGJyYW5jaE5hbWU6IHN0cmluZywgc2hhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydicmFuY2gnLCBicmFuY2hOYW1lLCAnLS1jb250YWlucycsIHNoYV0pLnN0ZG91dCAhPT0gJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbiAgZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBJZiBubyBicmFuY2ggbmFtZSBjb3VsZCBiZSByZXNvbHZlZC4gaS5lLiBgSEVBRGAgaGFzIGJlZW4gcmV0dXJuZWQsIHRoZW4gR2l0XG4gICAgLy8gaXMgY3VycmVudGx5IGluIGEgZGV0YWNoZWQgc3RhdGUuIEluIHRob3NlIGNhc2VzLCB3ZSBqdXN0IHdhbnQgdG8gcmV0dXJuIHRoZVxuICAgIC8vIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi9TSEEuXG4gICAgaWYgKGJyYW5jaE5hbWUgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcmVwbyBoYXMgYW55IGxvY2FsIGNoYW5nZXMuICovXG4gIGhhc0xvY2FsQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgb21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gSWYgbm8gdG9rZW4gaGFzIGJlZW4gZGVmaW5lZCAoaS5lLiBubyB0b2tlbiByZWdleCksIHdlIGp1c3QgcmV0dXJuIHRoZVxuICAgIC8vIHZhbHVlIGFzIGlzLiBUaGVyZSBpcyBubyBzZWNyZXQgdmFsdWUgdGhhdCBuZWVkcyB0byBiZSBvbWl0dGVkLlxuICAgIGlmICh0aGlzLl9naXRodWJUb2tlblJlZ2V4ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCBhIHJlcXVlc3RlZCBicmFuY2ggb3IgcmV2aXNpb24sIG9wdGlvbmFsbHkgY2xlYW5pbmcgdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIGJlZm9yZSBhdHRlbXB0aW5nIHRoZSBjaGVja2luZy4gUmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicmFuY2ggb3IgcmV2aXNpb25cbiAgICogd2FzIGNsZWFubHkgY2hlY2tlZCBvdXQuXG4gICAqL1xuICBjaGVja291dChicmFuY2hPclJldmlzaW9uOiBzdHJpbmcsIGNsZWFuU3RhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoY2xlYW5TdGF0ZSkge1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGFtcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydhbScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBjaGVycnktcGlja3MuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBDbGVhciBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3Jlc2V0JywgJy0taGFyZCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBicmFuY2hPclJldmlzaW9uXSwge3N0ZGlvOiAnaWdub3JlJ30pLnN0YXR1cyA9PT0gMDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYXRlc3QgZ2l0IHRhZyBvbiB0aGUgY3VycmVudCBicmFuY2ggdGhhdCBtYXRjaGVzIFNlbVZlci4gKi9cbiAgZ2V0TGF0ZXN0U2VtdmVyVGFnKCk6IFNlbVZlciB7XG4gICAgY29uc3Qgc2VtVmVyT3B0aW9uczogU2VtVmVyT3B0aW9ucyA9IHtsb29zZTogdHJ1ZX07XG4gICAgY29uc3QgdGFncyA9IHRoaXMucnVuR3JhY2VmdWwoWyd0YWcnLCAnLS1zb3J0PS1jb21taXR0ZXJkYXRlJywgJy0tbWVyZ2VkJ10pLnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbGF0ZXN0VGFnID0gdGFncy5maW5kKCh0YWc6IHN0cmluZykgPT4gcGFyc2UodGFnLCBzZW1WZXJPcHRpb25zKSk7XG5cbiAgICBpZiAobGF0ZXN0VGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgYSBTZW1WZXIgbWF0Y2hpbmcgdGFnIG9uIFwiJHt0aGlzLmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIobGF0ZXN0VGFnLCBzZW1WZXJPcHRpb25zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhlIEdpdENsaWVudCBpbnN0YW5jZSBpcyB1c2luZyBhIHRva2VuIHdpdGggcGVybWlzc2lvbnMgZm9yIHRoZSBhbGwgb2YgdGhlXG4gICAqIHByb3ZpZGVkIE9BdXRoIHNjb3Blcy5cbiAgICovXG4gIGFzeW5jIGhhc09hdXRoU2NvcGVzKHRlc3RGbjogT0F1dGhTY29wZVRlc3RGdW5jdGlvbik6IFByb21pc2U8dHJ1ZXx7ZXJyb3I6IHN0cmluZ30+IHtcbiAgICBjb25zdCBzY29wZXMgPSBhd2FpdCB0aGlzLmdldEF1dGhTY29wZXNGb3JUb2tlbigpO1xuICAgIGNvbnN0IG1pc3NpbmdTY29wZXM6IHN0cmluZ1tdID0gW107XG4gICAgLy8gVGVzdCBHaXRodWIgT0F1dGggc2NvcGVzIGFuZCBjb2xsZWN0IG1pc3Npbmcgb25lcy5cbiAgICB0ZXN0Rm4oc2NvcGVzLCBtaXNzaW5nU2NvcGVzKTtcbiAgICAvLyBJZiBubyBtaXNzaW5nIHNjb3BlcyBhcmUgZm91bmQsIHJldHVybiB0cnVlIHRvIGluZGljYXRlIGFsbCBPQXV0aCBTY29wZXMgYXJlIGF2YWlsYWJsZS5cbiAgICBpZiAobWlzc2luZ1Njb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgICogcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgICAqKi9cbiAgICBjb25zdCBlcnJvciA9XG4gICAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgICAgYCR7eWVsbG93KG1pc3NpbmdTY29wZXMuam9pbignLCAnKSl9XFxuXFxuYCArXG4gICAgICAgIGBVcGRhdGUgdGhlIHRva2VuIGluIHVzZSBhdDpcXG5gICtcbiAgICAgICAgYCAgJHtHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfVxcblxcbmAgK1xuICAgICAgICBgQWx0ZXJuYXRpdmVseSwgYSBuZXcgdG9rZW4gY2FuIGJlIGNyZWF0ZWQgYXQ6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1cXG5gO1xuXG4gICAgcmV0dXJuIHtlcnJvcn07XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIE9BdXRoIHNjb3BlcyBmb3IgdGhlIGxvYWRlZCBHaXRodWIgdG9rZW4uXG4gICAqKi9cbiAgcHJpdmF0ZSBnZXRBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4oX3Jlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gX3Jlc3BvbnNlIGFzIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXI7XG4gICAgICBjb25zdCBzY29wZXM6IHN0cmluZyA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtb2F1dGgtc2NvcGVzJ10gfHwgJyc7XG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==