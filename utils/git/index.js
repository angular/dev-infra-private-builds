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
        define("@angular/dev-infra-private/utils/git/index", ["require", "exports", "tslib", "child_process", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/dry-run", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = void 0;
    var tslib_1 = require("tslib");
    var child_process_1 = require("child_process");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQ0FBNEU7SUFFNUUsa0VBQWlFO0lBQ2pFLG9FQUErQztJQUMvQyxvRUFBaUQ7SUFDakQsc0VBQXNDO0lBQ3RDLGdGQUF3RztJQVV4RyxxQ0FBcUM7SUFDckM7UUFBcUMsMkNBQUs7UUFDeEMseUJBQVksTUFBaUIsRUFBUyxJQUFjO1lBQXBEO1lBQ0Usa0VBQWtFO1lBQ2xFLHNFQUFzRTtZQUN0RSxrRUFBa0U7WUFDbEUsa0JBQU0seUJBQXVCLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUMsU0FDbEY7WUFMcUMsVUFBSSxHQUFKLElBQUksQ0FBVTs7UUFLcEQsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQVBELENBQXFDLEtBQUssR0FPekM7SUFQWSwwQ0FBZTtJQVM1Qjs7Ozs7Ozs7UUFRSTtJQUNKO1FBb0JFLG1CQUNXLFdBQW9CLEVBQVUsT0FBa0QsRUFDL0UsWUFBK0I7WUFERix3QkFBQSxFQUFBLFVBQXVDLGtCQUFTLEVBQUU7WUFDL0UsNkJBQUEsRUFBQSxlQUFlLHVCQUFjLEVBQUU7WUFEaEMsZ0JBQVcsR0FBWCxXQUFXLENBQVM7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUEyQztZQUMvRSxpQkFBWSxHQUFaLFlBQVksQ0FBbUI7WUFuQjNDLGlFQUFpRTtZQUNqRSxpQkFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDO1lBQ25DLDZFQUE2RTtZQUM3RSxpQkFBWSxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUks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LE9BQUssdUNBQXlCLFNBQU0sQ0FBQTtpQ0FDcEMsbURBQWlELHVDQUF5QixPQUFJLENBQUEsQ0FBQzs0QkFFbkYsc0JBQU8sRUFBQyxLQUFLLE9BQUEsRUFBQyxFQUFDOzs7O1NBQ2hCO1FBRUQ7O1lBRUk7UUFDSSx5Q0FBcUIsR0FBN0I7WUFDRSxvRkFBb0Y7WUFDcEYsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssSUFBSSxFQUFFO2dCQUNwQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQzthQUNoQztZQUNELGtFQUFrRTtZQUNsRSw4REFBOEQ7WUFDOUQsT0FBTyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUztnQkFDekUsSUFBTSxRQUFRLEdBQUcsU0FBa0QsQ0FBQztnQkFDcEUsSUFBTSxNQUFNLEdBQVcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDaEUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztZQUN0RCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFyTEQsNkRBQTZEO1FBQ3RELHNCQUFZLEdBQUcsSUFBSSxDQUFDO1FBcUw3QixnQkFBQztLQUFBLEFBdkxELElBdUxDO0lBdkxZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBnZXRSZXBvQmFzZURpciwgTmdEZXZDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybCwgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQsIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShhcmdzLmpvaW4oJyAnKSl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21tb24gY2xpZW50IGZvciBwZXJmb3JtaW5nIEdpdCBpbnRlcmFjdGlvbnMgd2l0aCBhIGdpdmVuIHJlbW90ZS5cbiAqXG4gKiBUYWtlcyBpbiB0d28gb3B0aW9uYWwgYXJndW1lbnRzOlxuICogICBgZ2l0aHViVG9rZW5gOiB0aGUgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGljYXRpb24gaW4gR2l0aHViIGludGVyYWN0aW9ucywgYnkgZGVmYXVsdCBlbXB0eVxuICogICAgIGFsbG93aW5nIHJlYWRvbmx5IGFjdGlvbnMuXG4gKiAgIGBjb25maWdgOiBUaGUgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVtb3RlLiBCeSBkZWZhdWx0XG4gKiAgICAgdGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uIGlzIGxvYWRlZCB3aXRoIGl0cyBHaXRodWIgY29uZmlndXJhdGlvbi5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogV2hldGhlciB2ZXJib3NlIGxvZ2dpbmcgb2YgR2l0IGFjdGlvbnMgc2hvdWxkIGJlIHVzZWQuICovXG4gIHN0YXRpYyBMT0dfQ09NTUFORFMgPSB0cnVlO1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSBkZWZhdWx0IHJlbW90ZSBjb25maWd1cmF0aW9uLiAqL1xuICByZW1vdGVDb25maWcgPSB0aGlzLl9jb25maWcuZ2l0aHViO1xuICAvKiogT2N0b2tpdCByZXF1ZXN0IHBhcmFtZXRlcnMgb2JqZWN0IGZvciB0YXJnZXRpbmcgdGhlIGNvbmZpZ3VyZWQgcmVtb3RlLiAqL1xuICByZW1vdGVQYXJhbXMgPSB7b3duZXI6IHRoaXMucmVtb3RlQ29uZmlnLm93bmVyLCByZXBvOiB0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfTtcbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICByZXBvR2l0VXJsID0gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZywgdGhpcy5naXRodWJUb2tlbik7XG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRodWIgb2N0b2tpdCBBUEkuICovXG4gIGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uIFVzZWQgZm9yXG4gICAqIHNhbml0aXppbmcgdGhlIHRva2VuIGZyb20gR2l0IGNoaWxkIHByb2Nlc3Mgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2l0aHViVG9rZW5SZWdleDogUmVnRXhwfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGdpdGh1YlRva2VuPzogc3RyaW5nLCBwcml2YXRlIF9jb25maWc6IFBpY2s8TmdEZXZDb25maWcsICdnaXRodWInPiA9IGdldENvbmZpZygpLFxuICAgICAgcHJpdmF0ZSBfcHJvamVjdFJvb3QgPSBnZXRSZXBvQmFzZURpcigpKSB7XG4gICAgLy8gSWYgYSB0b2tlbiBoYXMgYmVlbiBzcGVjaWZpZWQgKGFuZCBpcyBub3QgZW1wdHkpLCBwYXNzIGl0IHRvIHRoZSBPY3Rva2l0IEFQSSBhbmRcbiAgICAvLyBhbHNvIGNyZWF0ZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGZvciBzYW5pdGl6aW5nIEdpdCBjb21tYW5kIG91dHB1dFxuICAgIC8vIHNvIHRoYXQgaXQgZG9lcyBub3QgcHJpbnQgdGhlIHRva2VuIGFjY2lkZW50YWxseS5cbiAgICBpZiAoZ2l0aHViVG9rZW4gIT0gbnVsbCkge1xuICAgICAgdGhpcy5fZ2l0aHViVG9rZW5SZWdleCA9IG5ldyBSZWdFeHAoZ2l0aHViVG9rZW4sICdnJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBTcGF3blN5bmNPcHRpb25zKTogT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ydW5HcmFjZWZ1bChhcmdzLCBvcHRpb25zKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEdpdENvbW1hbmRFcnJvcih0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgLy8gT21pdCBgc3RhdHVzYCBmcm9tIHRoZSB0eXBlIHNvIHRoYXQgaXQncyBvYnZpb3VzIHRoYXQgdGhlIHN0YXR1cyBpcyBuZXZlclxuICAgIC8vIG5vbi16ZXJvIGFzIGV4cGxhaW5lZCBpbiB0aGUgbWV0aG9kIGRlc2NyaXB0aW9uLlxuICAgIHJldHVybiByZXN1bHQgYXMgT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGF3bnMgYSBnaXZlbiBHaXQgY29tbWFuZCBwcm9jZXNzLiBEb2VzIG5vdCB0aHJvdyBpZiB0aGUgY29tbWFuZCBmYWlscy4gQWRkaXRpb25hbGx5LFxuICAgKiBpZiB0aGVyZSBpcyBhbnkgc3RkZXJyIG91dHB1dCwgdGhlIG91dHB1dCB3aWxsIGJlIHByaW50ZWQuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAqIGluZm8gZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduU3luY09wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLyoqIFRoZSBnaXQgY29tbWFuZCB0byBiZSBydW4uICovXG4gICAgY29uc3QgZ2l0Q29tbWFuZCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoaXNEcnlSdW4oKSAmJiBnaXRDb21tYW5kID09PSAncHVzaCcpIHtcbiAgICAgIGRlYnVnKGBcImdpdCBwdXNoXCIgaXMgbm90IGFibGUgdG8gYmUgcnVuIGluIGRyeVJ1biBtb2RlLmApO1xuICAgICAgdGhyb3cgbmV3IERyeVJ1bkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZCBHaXRcbiAgICAvLyBjb21tYW5kcyB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJpbmcuIERlcGVuZGluZyBvbiB0aGUgY29tbWFuZCBiZWluZ1xuICAgIC8vIGV4ZWN1dGVkLCB0aGlzIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBzaG91bGQgYmUgbG9nZ2VkIGF0IGRpZmZlcmVudCBsb2dnaW5nIGxldmVscy5cbiAgICBjb25zdCBwcmludEZuID0gKCFHaXRDbGllbnQuTE9HX0NPTU1BTkRTIHx8IG9wdGlvbnMuc3RkaW8gPT09ICdpZ25vcmUnKSA/IGRlYnVnIDogaW5mbztcbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gbm90IHdhbnQgdG8gcHJpbnQgdGhlIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb25cbiAgICAvLyB0byBzaGFyZSBlcnJvcnMgd2l0aCBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICctLWFiYnJldi1yZWYnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIElmIG5vIGJyYW5jaCBuYW1lIGNvdWxkIGJlIHJlc29sdmVkLiBpLmUuIGBIRUFEYCBoYXMgYmVlbiByZXR1cm5lZCwgdGhlbiBHaXRcbiAgICAvLyBpcyBjdXJyZW50bHkgaW4gYSBkZXRhY2hlZCBzdGF0ZS4gSW4gdGhvc2UgY2FzZXMsIHdlIGp1c3Qgd2FudCB0byByZXR1cm4gdGhlXG4gICAgLy8gY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uL1NIQS5cbiAgICBpZiAoYnJhbmNoTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoTmFtZTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByZXBvIGhhcyBhbnkgbG9jYWwgY2hhbmdlcy4gKi9cbiAgaGFzTG9jYWxDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqIFNhbml0aXplcyBhIGdpdmVuIG1lc3NhZ2UgYnkgb21pdHRpbmcgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbiBpZiBwcmVzZW50LiAqL1xuICBvbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBJZiBubyB0b2tlbiBoYXMgYmVlbiBkZWZpbmVkIChpLmUuIG5vIHRva2VuIHJlZ2V4KSwgd2UganVzdCByZXR1cm4gdGhlXG4gICAgLy8gdmFsdWUgYXMgaXMuIFRoZXJlIGlzIG5vIHNlY3JldCB2YWx1ZSB0aGF0IG5lZWRzIHRvIGJlIG9taXR0ZWQuXG4gICAgaWYgKHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fZ2l0aHViVG9rZW5SZWdleCwgJzxUT0tFTj4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IGEgcmVxdWVzdGVkIGJyYW5jaCBvciByZXZpc2lvbiwgb3B0aW9uYWxseSBjbGVhbmluZyB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogYmVmb3JlIGF0dGVtcHRpbmcgdGhlIGNoZWNraW5nLiBSZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGJyYW5jaCBvciByZXZpc2lvblxuICAgKiB3YXMgY2xlYW5seSBjaGVja2VkIG91dC5cbiAgICovXG4gIGNoZWNrb3V0KGJyYW5jaE9yUmV2aXNpb246IHN0cmluZywgY2xlYW5TdGF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChjbGVhblN0YXRlKSB7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgYW1zLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2FtJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGNoZXJyeS1waWNrcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3JlYmFzZScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIENsZWFyIGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8uXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmVzZXQnLCAnLS1oYXJkJ10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydjaGVja291dCcsIGJyYW5jaE9yUmV2aXNpb25dLCB7c3RkaW86ICdpZ25vcmUnfSkuc3RhdHVzID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlY29uc3RydWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBsb2cgdG8gdGhlIHVzZXIsIHByb3ZpZGluZyBtaXNzaW5nIHNjb3BlcyBhbmRcbiAgICAgKiByZW1lZGlhdGlvbiBpbnN0cnVjdGlvbnMuXG4gICAgICoqL1xuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi5cbiAgICoqL1xuICBwcml2YXRlIGdldEF1dGhTY29wZXNGb3JUb2tlbigpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgPSB0aGlzLmdpdGh1Yi5yYXRlTGltaXQuZ2V0KCkudGhlbihfcmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBfcmVzcG9uc2UgYXMgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlcjtcbiAgICAgIGNvbnN0IHNjb3Blczogc3RyaW5nID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXSB8fCAnJztcbiAgICAgIHJldHVybiBzY29wZXMuc3BsaXQoJywnKS5tYXAoc2NvcGUgPT4gc2NvcGUudHJpbSgpKTtcbiAgICB9KTtcbiAgfVxufVxuIl19