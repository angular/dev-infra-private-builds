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
        /**
         * @param githubToken The github token used for authentication, if provided.
         * @param _config The configuration, containing the github specific configuration.
         * @param baseDir The full path to the root of the repository base.
         */
        function GitClient(githubToken, config, baseDir) {
            this.githubToken = githubToken;
            /** Whether verbose logging of Git actions should be used. */
            this.verboseLogging = true;
            /** The OAuth scopes available for the provided Github token. */
            this._cachedOauthScopes = null;
            /**
             * Regular expression that matches the provided Github token. Used for
             * sanitizing the token from Git child process output.
             */
            this._githubTokenRegex = null;
            /** Instance of the Github octokit API. */
            this.github = new github_1.GithubClient(this.githubToken);
            this.baseDir = baseDir || this.determineBaseDir();
            this.config = config || config_1.getConfig(this.baseDir);
            this.remoteConfig = this.config.github;
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            // If a token has been specified (and is not empty), pass it to the Octokit API and
            // also create a regular expression that can be used for sanitizing Git command output
            // so that it does not print the token accidentally.
            if (typeof githubToken === 'string') {
                this._githubTokenRegex = new RegExp(githubToken, 'g');
            }
        }
        /**
         * Static method to get the singleton instance of the unauthorized GitClient, creating it if it
         * has not yet been created.
         */
        GitClient.getInstance = function () {
            if (!GitClient.unauthenticated) {
                GitClient.unauthenticated = new GitClient(undefined);
            }
            return GitClient.unauthenticated;
        };
        /**
         * Static method to get the singleton instance of the authenticated GitClient if it has been
         * generated.
         */
        GitClient.getAuthenticatedInstance = function () {
            if (!GitClient.authenticated) {
                throw Error('The authenticated GitClient has not yet been generated.');
            }
            return GitClient.authenticated;
        };
        /** Build the authenticated GitClient instance. */
        GitClient.authenticateWithToken = function (token) {
            if (GitClient.authenticated) {
                throw Error('Cannot generate new authenticated GitClient after one has already been generated.');
            }
            GitClient.authenticated = new GitClient(token);
        };
        /** Set the verbose logging state of the GitClient instance. */
        GitClient.prototype.setVerboseLoggingState = function (verbose) {
            this.verboseLogging = verbose;
            return this;
        };
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
            var printFn = (!this.verboseLogging || options.stdio === 'ignore') ? console_1.debug : console_1.info;
            // Note that we do not want to print the token if it is contained in the command. It's common
            // to share errors with others if the tool failed, and we do not want to leak tokens.
            printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
            var result = child_process_1.spawnSync('git', args, tslib_1.__assign(tslib_1.__assign({ cwd: this.baseDir, stdio: 'pipe' }, options), { 
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
        /** Git URL that resolves to the configured repository. */
        GitClient.prototype.getRepoGitUrl = function () {
            return github_urls_1.getRepositoryGitUrl(this.remoteConfig, this.githubToken);
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
        /** Gets the path of the directory for the repository base. */
        GitClient.prototype.getBaseDir = function () {
            var previousVerboseLoggingState = this.verboseLogging;
            this.setVerboseLoggingState(false);
            var _a = this.runGraceful(['rev-parse', '--show-toplevel']), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
            this.setVerboseLoggingState(previousVerboseLoggingState);
            if (status !== 0) {
                throw Error("Unable to find the path to the base directory of the repository.\n" +
                    "Was the command run from inside of the repo?\n\n" +
                    ("ERROR:\n " + stderr));
            }
            return stdout.trim();
        };
        /** Retrieve a list of all files in the repostitory changed since the provided shaOrRef. */
        GitClient.prototype.allChangesFilesSince = function (shaOrRef) {
            if (shaOrRef === void 0) { shaOrRef = 'HEAD'; }
            return Array.from(new Set(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])))), tslib_1.__read(gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard']))))));
        };
        /** Retrieve a list of all files currently staged in the repostitory. */
        GitClient.prototype.allStagedFiles = function () {
            return gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=ACM', '--staged']));
        };
        /** Retrieve a list of all files tracked in the repostitory. */
        GitClient.prototype.allFiles = function () {
            return gitOutputAsArray(this.runGraceful(['ls-files']));
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
        GitClient.prototype.determineBaseDir = function () {
            this.setVerboseLoggingState(false);
            var _a = this.runGraceful(['rev-parse', '--show-toplevel']), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
            if (status !== 0) {
                throw Error("Unable to find the path to the base directory of the repository.\n" +
                    "Was the command run from inside of the repo?\n\n" +
                    ("ERROR:\n " + stderr));
            }
            this.setVerboseLoggingState(true);
            return stdout.trim();
        };
        return GitClient;
    }());
    exports.GitClient = GitClient;
    /**
     * Takes the output from `GitClient.run` and `GitClient.runGraceful` and returns an array of strings
     * for each new line. Git commands typically return multiple output values for a command a set of
     * strings separated by new lines.
     *
     * Note: This is specifically created as a locally available function for usage as convience utility
     * within `GitClient`'s methods to create outputs as array.
     */
    function gitOutputAsArray(gitCommandResult) {
        return gitCommandResult.stdout.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQ0FBNEU7SUFDNUUsaUNBQStEO0lBRS9ELGtFQUErRDtJQUMvRCxvRUFBK0M7SUFDL0Msb0VBQWlEO0lBQ2pELHNFQUFzQztJQUN0QyxnRkFBd0c7SUFVeEcscUNBQXFDO0lBQ3JDO1FBQXFDLDJDQUFLO1FBQ3hDLHlCQUFZLE1BQTBCLEVBQVMsSUFBYztZQUE3RDtZQUNFLGtFQUFrRTtZQUNsRSxzRUFBc0U7WUFDdEUsa0VBQWtFO1lBQ2xFLGtCQUFNLHlCQUF1QixNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDLFNBQ2xGO1lBTDhDLFVBQUksR0FBSixJQUFJLENBQVU7O1FBSzdELENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFQRCxDQUFxQyxLQUFLLEdBT3pDO0lBUFksMENBQWU7SUFTNUI7Ozs7Ozs7O1FBUUk7SUFDSjtRQTRERTs7OztXQUlHO1FBQ0gsbUJBQTZCLFdBQTBELEVBQ3ZCLE1BQW9CLEVBQ3BCLE9BQWdCO1lBRm5ELGdCQUFXLEdBQVgsV0FBVyxDQUErQztZQXZCdkYsNkRBQTZEO1lBQ3JELG1CQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzlCLGdFQUFnRTtZQUN4RCx1QkFBa0IsR0FBMkIsSUFBSSxDQUFDO1lBQzFEOzs7ZUFHRztZQUNLLHNCQUFpQixHQUFnQixJQUFJLENBQUM7WUFLOUMsMENBQTBDO1lBQzFDLFdBQU0sR0FBRyxJQUFJLHFCQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBWTFDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2xE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QyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRU8sb0NBQWdCLEdBQXhCO1lBQ0UsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdCLElBQUEsS0FBMkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLEVBQTVFLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBQSxFQUFFLE1BQU0sWUFBc0QsQ0FBQztZQUNwRixJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQ2hCLE1BQU0sS0FBSyxDQUNQLG9FQUFvRTtvQkFDcEUsa0RBQWtEO3FCQUNsRCxjQUFZLE1BQVEsQ0FBQSxDQUFDLENBQUM7YUFDM0I7WUFDRCxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDdkIsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQWhURCxJQWdUQztJQWhUWSw4QkFBUztJQWtUdEI7Ozs7Ozs7T0FPRztJQUNILFNBQVMsZ0JBQWdCLENBQUMsZ0JBQTBDO1FBQ2xFLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsRUFBSCxDQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge09wdGlvbnMgYXMgU2VtVmVyT3B0aW9ucywgcGFyc2UsIFNlbVZlcn0gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtnZXRDb25maWcsIEdpdGh1YkNvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybCwgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQ8Ym9vbGVhbj4sIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShhcmdzLmpvaW4oJyAnKSl9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb21tb24gY2xpZW50IGZvciBwZXJmb3JtaW5nIEdpdCBpbnRlcmFjdGlvbnMgd2l0aCBhIGdpdmVuIHJlbW90ZS5cbiAqXG4gKiBUYWtlcyBpbiB0d28gb3B0aW9uYWwgYXJndW1lbnRzOlxuICogICBgZ2l0aHViVG9rZW5gOiB0aGUgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGljYXRpb24gaW4gR2l0aHViIGludGVyYWN0aW9ucywgYnkgZGVmYXVsdCBlbXB0eVxuICogICAgIGFsbG93aW5nIHJlYWRvbmx5IGFjdGlvbnMuXG4gKiAgIGBjb25maWdgOiBUaGUgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24gY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVtb3RlLiBCeSBkZWZhdWx0XG4gKiAgICAgdGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uIGlzIGxvYWRlZCB3aXRoIGl0cyBHaXRodWIgY29uZmlndXJhdGlvbi5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQ8QXV0aGVudGljYXRlZCBleHRlbmRzIGJvb2xlYW4+IHtcbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICogU2luZ2xldG9uIGRlZmluaXRpb24gYW5kIGNvbmZpZ3VyYXRpb24uICAgICAgICpcbiAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgYXV0aGVudGljYXRlZDogR2l0Q2xpZW50PHRydWU+O1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgdW5hdXRoZW50aWNhdGVkIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgdW5hdXRoZW50aWNhdGVkOiBHaXRDbGllbnQ8ZmFsc2U+O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSB1bmF1dGhvcml6ZWQgR2l0Q2xpZW50LCBjcmVhdGluZyBpdCBpZiBpdFxuICAgKiBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0SW5zdGFuY2UoKSB7XG4gICAgaWYgKCFHaXRDbGllbnQudW5hdXRoZW50aWNhdGVkKSB7XG4gICAgICBHaXRDbGllbnQudW5hdXRoZW50aWNhdGVkID0gbmV3IEdpdENsaWVudCh1bmRlZmluZWQpO1xuICAgIH1cbiAgICByZXR1cm4gR2l0Q2xpZW50LnVuYXV0aGVudGljYXRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBhdXRoZW50aWNhdGVkIEdpdENsaWVudCBpZiBpdCBoYXMgYmVlblxuICAgKiBnZW5lcmF0ZWQuXG4gICAqL1xuICBzdGF0aWMgZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCkge1xuICAgIGlmICghR2l0Q2xpZW50LmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHRocm93IEVycm9yKCdUaGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaGFzIG5vdCB5ZXQgYmVlbiBnZW5lcmF0ZWQuJyk7XG4gICAgfVxuICAgIHJldHVybiBHaXRDbGllbnQuYXV0aGVudGljYXRlZDtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaW5zdGFuY2UuICovXG4gIHN0YXRpYyBhdXRoZW50aWNhdGVXaXRoVG9rZW4odG9rZW46IHN0cmluZykge1xuICAgIGlmIChHaXRDbGllbnQuYXV0aGVudGljYXRlZCkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBnZW5lcmF0ZSBuZXcgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgYWZ0ZXIgb25lIGhhcyBhbHJlYWR5IGJlZW4gZ2VuZXJhdGVkLicpO1xuICAgIH1cbiAgICBHaXRDbGllbnQuYXV0aGVudGljYXRlZCA9IG5ldyBHaXRDbGllbnQodG9rZW4pO1xuICB9XG5cbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uLCBjb250YWluaW5nIHRoZSBnaXRodWIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi4gKi9cbiAgcHJpdmF0ZSBjb25maWc6IE5nRGV2Q29uZmlnO1xuICAvKiogV2hldGhlciB2ZXJib3NlIGxvZ2dpbmcgb2YgR2l0IGFjdGlvbnMgc2hvdWxkIGJlIHVzZWQuICovXG4gIHByaXZhdGUgdmVyYm9zZUxvZ2dpbmcgPSB0cnVlO1xuICAvKiogVGhlIE9BdXRoIHNjb3BlcyBhdmFpbGFibGUgZm9yIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2NhY2hlZE9hdXRoU2NvcGVzOiBQcm9taXNlPHN0cmluZ1tdPnxudWxsID0gbnVsbDtcbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gVXNlZCBmb3JcbiAgICogc2FuaXRpemluZyB0aGUgdG9rZW4gZnJvbSBHaXQgY2hpbGQgcHJvY2VzcyBvdXRwdXQuXG4gICAqL1xuICBwcml2YXRlIF9naXRodWJUb2tlblJlZ2V4OiBSZWdFeHB8bnVsbCA9IG51bGw7XG4gIC8qKiBTaG9ydC1oYW5kIGZvciBhY2Nlc3NpbmcgdGhlIGRlZmF1bHQgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlbW90ZUNvbmZpZzogR2l0aHViQ29uZmlnO1xuICAvKiogT2N0b2tpdCByZXF1ZXN0IHBhcmFtZXRlcnMgb2JqZWN0IGZvciB0YXJnZXRpbmcgdGhlIGNvbmZpZ3VyZWQgcmVtb3RlLiAqL1xuICByZW1vdGVQYXJhbXM6IHtvd25lcjogc3RyaW5nLCByZXBvOiBzdHJpbmd9O1xuICAvKiogSW5zdGFuY2Ugb2YgdGhlIEdpdGh1YiBvY3Rva2l0IEFQSS4gKi9cbiAgZ2l0aHViID0gbmV3IEdpdGh1YkNsaWVudCh0aGlzLmdpdGh1YlRva2VuKTtcbiAgLyoqIFRoZSBmdWxsIHBhdGggdG8gdGhlIHJvb3Qgb2YgdGhlIHJlcG9zaXRvcnkgYmFzZS4gKi9cbiAgYmFzZURpcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gZ2l0aHViVG9rZW4gVGhlIGdpdGh1YiB0b2tlbiB1c2VkIGZvciBhdXRoZW50aWNhdGlvbiwgaWYgcHJvdmlkZWQuXG4gICAqIEBwYXJhbSBfY29uZmlnIFRoZSBjb25maWd1cmF0aW9uLCBjb250YWluaW5nIHRoZSBnaXRodWIgc3BlY2lmaWMgY29uZmlndXJhdGlvbi5cbiAgICogQHBhcmFtIGJhc2VEaXIgVGhlIGZ1bGwgcGF0aCB0byB0aGUgcm9vdCBvZiB0aGUgcmVwb3NpdG9yeSBiYXNlLlxuICAgKi9cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHB1YmxpYyBnaXRodWJUb2tlbjogQXV0aGVudGljYXRlZCBleHRlbmRzIHRydWU/IHN0cmluZzogdW5kZWZpbmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uZmlnPzogTmdEZXZDb25maWcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlRGlyPzogc3RyaW5nKSB7XG4gICAgdGhpcy5iYXNlRGlyID0gYmFzZURpciB8fCB0aGlzLmRldGVybWluZUJhc2VEaXIoKTtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyB8fCBnZXRDb25maWcodGhpcy5iYXNlRGlyKTtcbiAgICB0aGlzLnJlbW90ZUNvbmZpZyA9IHRoaXMuY29uZmlnLmdpdGh1YjtcbiAgICB0aGlzLnJlbW90ZVBhcmFtcyA9IHtvd25lcjogdGhpcy5yZW1vdGVDb25maWcub3duZXIsIHJlcG86IHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9O1xuXG4gICAgLy8gSWYgYSB0b2tlbiBoYXMgYmVlbiBzcGVjaWZpZWQgKGFuZCBpcyBub3QgZW1wdHkpLCBwYXNzIGl0IHRvIHRoZSBPY3Rva2l0IEFQSSBhbmRcbiAgICAvLyBhbHNvIGNyZWF0ZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGZvciBzYW5pdGl6aW5nIEdpdCBjb21tYW5kIG91dHB1dFxuICAgIC8vIHNvIHRoYXQgaXQgZG9lcyBub3QgcHJpbnQgdGhlIHRva2VuIGFjY2lkZW50YWxseS5cbiAgICBpZiAodHlwZW9mIGdpdGh1YlRva2VuID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fZ2l0aHViVG9rZW5SZWdleCA9IG5ldyBSZWdFeHAoZ2l0aHViVG9rZW4sICdnJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCB0aGUgdmVyYm9zZSBsb2dnaW5nIHN0YXRlIG9mIHRoZSBHaXRDbGllbnQgaW5zdGFuY2UuICovXG4gIHNldFZlcmJvc2VMb2dnaW5nU3RhdGUodmVyYm9zZTogYm9vbGVhbik6IHRoaXMge1xuICAgIHRoaXMudmVyYm9zZUxvZ2dpbmcgPSB2ZXJib3NlO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBTcGF3blN5bmNPcHRpb25zKTogT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ydW5HcmFjZWZ1bChhcmdzLCBvcHRpb25zKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEdpdENvbW1hbmRFcnJvcih0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgLy8gT21pdCBgc3RhdHVzYCBmcm9tIHRoZSB0eXBlIHNvIHRoYXQgaXQncyBvYnZpb3VzIHRoYXQgdGhlIHN0YXR1cyBpcyBuZXZlclxuICAgIC8vIG5vbi16ZXJvIGFzIGV4cGxhaW5lZCBpbiB0aGUgbWV0aG9kIGRlc2NyaXB0aW9uLlxuICAgIHJldHVybiByZXN1bHQgYXMgT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGF3bnMgYSBnaXZlbiBHaXQgY29tbWFuZCBwcm9jZXNzLiBEb2VzIG5vdCB0aHJvdyBpZiB0aGUgY29tbWFuZCBmYWlscy4gQWRkaXRpb25hbGx5LFxuICAgKiBpZiB0aGVyZSBpcyBhbnkgc3RkZXJyIG91dHB1dCwgdGhlIG91dHB1dCB3aWxsIGJlIHByaW50ZWQuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAqIGluZm8gZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduU3luY09wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLyoqIFRoZSBnaXQgY29tbWFuZCB0byBiZSBydW4uICovXG4gICAgY29uc3QgZ2l0Q29tbWFuZCA9IGFyZ3NbMF07XG5cbiAgICBpZiAoaXNEcnlSdW4oKSAmJiBnaXRDb21tYW5kID09PSAncHVzaCcpIHtcbiAgICAgIGRlYnVnKGBcImdpdCBwdXNoXCIgaXMgbm90IGFibGUgdG8gYmUgcnVuIGluIGRyeVJ1biBtb2RlLmApO1xuICAgICAgdGhyb3cgbmV3IERyeVJ1bkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZCBHaXRcbiAgICAvLyBjb21tYW5kcyB0byBiZXR0ZXIgdW5kZXJzdGFuZCB0aGUgZ2l0IGFjdGlvbnMgb2NjdXJpbmcuIERlcGVuZGluZyBvbiB0aGUgY29tbWFuZCBiZWluZ1xuICAgIC8vIGV4ZWN1dGVkLCB0aGlzIGRlYnVnZ2luZyBpbmZvcm1hdGlvbiBzaG91bGQgYmUgbG9nZ2VkIGF0IGRpZmZlcmVudCBsb2dnaW5nIGxldmVscy5cbiAgICBjb25zdCBwcmludEZuID0gKCF0aGlzLnZlcmJvc2VMb2dnaW5nIHx8IG9wdGlvbnMuc3RkaW8gPT09ICdpZ25vcmUnKSA/IGRlYnVnIDogaW5mbztcbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gbm90IHdhbnQgdG8gcHJpbnQgdGhlIHRva2VuIGlmIGl0IGlzIGNvbnRhaW5lZCBpbiB0aGUgY29tbWFuZC4gSXQncyBjb21tb25cbiAgICAvLyB0byBzaGFyZSBlcnJvcnMgd2l0aCBvdGhlcnMgaWYgdGhlIHRvb2wgZmFpbGVkLCBhbmQgd2UgZG8gbm90IHdhbnQgdG8gbGVhayB0b2tlbnMuXG4gICAgcHJpbnRGbignRXhlY3V0aW5nOiBnaXQnLCB0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5iYXNlRGlyLFxuICAgICAgc3RkaW86ICdwaXBlJyxcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAvLyBFbmNvZGluZyBpcyBhbHdheXMgYHV0ZjhgIGFuZCBub3Qgb3ZlcnJpZGFibGUuIFRoaXMgZW5zdXJlcyB0aGF0IHRoaXMgbWV0aG9kXG4gICAgICAvLyBhbHdheXMgcmV0dXJucyBgc3RyaW5nYCBhcyBvdXRwdXQgaW5zdGVhZCBvZiBidWZmZXJzLlxuICAgICAgZW5jb2Rpbmc6ICd1dGY4JyxcbiAgICB9KTtcblxuICAgIGlmIChyZXN1bHQuc3RkZXJyICE9PSBudWxsKSB7XG4gICAgICAvLyBHaXQgc29tZXRpbWVzIHByaW50cyB0aGUgY29tbWFuZCBpZiBpdCBmYWlsZWQuIFRoaXMgbWVhbnMgdGhhdCBpdCBjb3VsZFxuICAgICAgLy8gcG90ZW50aWFsbHkgbGVhayB0aGUgR2l0aHViIHRva2VuIHVzZWQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlLiBUbyBhdm9pZFxuICAgICAgLy8gcHJpbnRpbmcgYSB0b2tlbiwgd2Ugc2FuaXRpemUgdGhlIHN0cmluZyBiZWZvcmUgcHJpbnRpbmcgdGhlIHN0ZGVyciBvdXRwdXQuXG4gICAgICBwcm9jZXNzLnN0ZGVyci53cml0ZSh0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHJlc3VsdC5zdGRlcnIpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnLCB0aGlzLmdpdGh1YlRva2VuKTtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2ggb3IgcmV2aXNpb24uICovXG4gIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk6IHN0cmluZyB7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgLy8gSWYgbm8gYnJhbmNoIG5hbWUgY291bGQgYmUgcmVzb2x2ZWQuIGkuZS4gYEhFQURgIGhhcyBiZWVuIHJldHVybmVkLCB0aGVuIEdpdFxuICAgIC8vIGlzIGN1cnJlbnRseSBpbiBhIGRldGFjaGVkIHN0YXRlLiBJbiB0aG9zZSBjYXNlcywgd2UganVzdCB3YW50IHRvIHJldHVybiB0aGVcbiAgICAvLyBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24vU0hBLlxuICAgIGlmIChicmFuY2hOYW1lID09PSAnSEVBRCcpIHtcbiAgICAgIHJldHVybiB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgfVxuICAgIHJldHVybiBicmFuY2hOYW1lO1xuICB9XG5cbiAgLyoqIEdldHMgd2hldGhlciB0aGUgY3VycmVudCBHaXQgcmVwb3NpdG9yeSBoYXMgdW5jb21taXR0ZWQgY2hhbmdlcy4gKi9cbiAgaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGFueSBsb2NhbCBjaGFuZ2VzLiAqL1xuICBoYXNMb2NhbENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIC8vIElmIG5vIHRva2VuIGhhcyBiZWVuIGRlZmluZWQgKGkuZS4gbm8gdG9rZW4gcmVnZXgpLCB3ZSBqdXN0IHJldHVybiB0aGVcbiAgICAvLyB2YWx1ZSBhcyBpcy4gVGhlcmUgaXMgbm8gc2VjcmV0IHZhbHVlIHRoYXQgbmVlZHMgdG8gYmUgb21pdHRlZC5cbiAgICBpZiAodGhpcy5fZ2l0aHViVG9rZW5SZWdleCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl9naXRodWJUb2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgYSByZXF1ZXN0ZWQgYnJhbmNoIG9yIHJldmlzaW9uLCBvcHRpb25hbGx5IGNsZWFuaW5nIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeVxuICAgKiBiZWZvcmUgYXR0ZW1wdGluZyB0aGUgY2hlY2tpbmcuIFJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgYnJhbmNoIG9yIHJldmlzaW9uXG4gICAqIHdhcyBjbGVhbmx5IGNoZWNrZWQgb3V0LlxuICAgKi9cbiAgY2hlY2tvdXQoYnJhbmNoT3JSZXZpc2lvbjogc3RyaW5nLCBjbGVhblN0YXRlOiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgaWYgKGNsZWFuU3RhdGUpIHtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBhbXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnYW0nLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgY2hlcnJ5LXBpY2tzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQ2xlYXIgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwby5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZXNldCcsICctLWhhcmQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgYnJhbmNoT3JSZXZpc2lvbl0sIHtzdGRpbzogJ2lnbm9yZSd9KS5zdGF0dXMgPT09IDA7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbGF0ZXN0IGdpdCB0YWcgb24gdGhlIGN1cnJlbnQgYnJhbmNoIHRoYXQgbWF0Y2hlcyBTZW1WZXIuICovXG4gIGdldExhdGVzdFNlbXZlclRhZygpOiBTZW1WZXIge1xuICAgIGNvbnN0IHNlbVZlck9wdGlvbnM6IFNlbVZlck9wdGlvbnMgPSB7bG9vc2U6IHRydWV9O1xuICAgIGNvbnN0IHRhZ3MgPSB0aGlzLnJ1bkdyYWNlZnVsKFsndGFnJywgJy0tc29ydD0tY29tbWl0dGVyZGF0ZScsICctLW1lcmdlZCddKS5zdGRvdXQuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxhdGVzdFRhZyA9IHRhZ3MuZmluZCgodGFnOiBzdHJpbmcpID0+IHBhcnNlKHRhZywgc2VtVmVyT3B0aW9ucykpO1xuXG4gICAgaWYgKGxhdGVzdFRhZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBmaW5kIGEgU2VtVmVyIG1hdGNoaW5nIHRhZyBvbiBcIiR7dGhpcy5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpfVwiYCk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgU2VtVmVyKGxhdGVzdFRhZywgc2VtVmVyT3B0aW9ucyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLiAqL1xuICBnZXRCYXNlRGlyKCk6IHN0cmluZyB7XG4gICAgY29uc3QgcHJldmlvdXNWZXJib3NlTG9nZ2luZ1N0YXRlID0gdGhpcy52ZXJib3NlTG9nZ2luZztcbiAgICB0aGlzLnNldFZlcmJvc2VMb2dnaW5nU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfSA9IHRoaXMucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnLS1zaG93LXRvcGxldmVsJ10pO1xuICAgIHRoaXMuc2V0VmVyYm9zZUxvZ2dpbmdTdGF0ZShwcmV2aW91c1ZlcmJvc2VMb2dnaW5nU3RhdGUpO1xuICAgIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgICAgYEVSUk9SOlxcbiAke3N0ZGVycn1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBpbiB0aGUgcmVwb3N0aXRvcnkgY2hhbmdlZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhT3JSZWYuICovXG4gIGFsbENoYW5nZXNGaWxlc1NpbmNlKHNoYU9yUmVmID0gJ0hFQUQnKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoW1xuICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPWQnLCBzaGFPclJlZl0pKSxcbiAgICAgIC4uLmdpdE91dHB1dEFzQXJyYXkodGhpcy5ydW5HcmFjZWZ1bChbJ2xzLWZpbGVzJywgJy0tb3RoZXJzJywgJy0tZXhjbHVkZS1zdGFuZGFyZCddKSksXG4gICAgXSkpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgY3VycmVudGx5IHN0YWdlZCBpbiB0aGUgcmVwb3N0aXRvcnkuICovXG4gIGFsbFN0YWdlZEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheShcbiAgICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYnLCAnLS1uYW1lLW9ubHknLCAnLS1kaWZmLWZpbHRlcj1BQ00nLCAnLS1zdGFnZWQnXSkpO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIGEgbGlzdCBvZiBhbGwgZmlsZXMgdHJhY2tlZCBpbiB0aGUgcmVwb3N0aXRvcnkuICovXG4gIGFsbEZpbGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnXSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlY29uc3RydWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBsb2cgdG8gdGhlIHVzZXIsIHByb3ZpZGluZyBtaXNzaW5nIHNjb3BlcyBhbmRcbiAgICAgKiByZW1lZGlhdGlvbiBpbnN0cnVjdGlvbnMuXG4gICAgICoqL1xuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi5cbiAgICoqL1xuICBwcml2YXRlIGdldEF1dGhTY29wZXNGb3JUb2tlbigpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgPSB0aGlzLmdpdGh1Yi5yYXRlTGltaXQuZ2V0KCkudGhlbihfcmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBfcmVzcG9uc2UgYXMgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlcjtcbiAgICAgIGNvbnN0IHNjb3Blczogc3RyaW5nID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXSB8fCAnJztcbiAgICAgIHJldHVybiBzY29wZXMuc3BsaXQoJywnKS5tYXAoc2NvcGUgPT4gc2NvcGUudHJpbSgpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZGV0ZXJtaW5lQmFzZURpcigpIHtcbiAgICB0aGlzLnNldFZlcmJvc2VMb2dnaW5nU3RhdGUoZmFsc2UpO1xuICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfSA9IHRoaXMucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnLS1zaG93LXRvcGxldmVsJ10pO1xuICAgIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgICAgYEVSUk9SOlxcbiAke3N0ZGVycn1gKTtcbiAgICB9XG4gICAgdGhpcy5zZXRWZXJib3NlTG9nZ2luZ1N0YXRlKHRydWUpO1xuICAgIHJldHVybiBzdGRvdXQudHJpbSgpO1xuICB9XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIG91dHB1dCBmcm9tIGBHaXRDbGllbnQucnVuYCBhbmQgYEdpdENsaWVudC5ydW5HcmFjZWZ1bGAgYW5kIHJldHVybnMgYW4gYXJyYXkgb2Ygc3RyaW5nc1xuICogZm9yIGVhY2ggbmV3IGxpbmUuIEdpdCBjb21tYW5kcyB0eXBpY2FsbHkgcmV0dXJuIG11bHRpcGxlIG91dHB1dCB2YWx1ZXMgZm9yIGEgY29tbWFuZCBhIHNldCBvZlxuICogc3RyaW5ncyBzZXBhcmF0ZWQgYnkgbmV3IGxpbmVzLlxuICpcbiAqIE5vdGU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGNyZWF0ZWQgYXMgYSBsb2NhbGx5IGF2YWlsYWJsZSBmdW5jdGlvbiBmb3IgdXNhZ2UgYXMgY29udmllbmNlIHV0aWxpdHlcbiAqIHdpdGhpbiBgR2l0Q2xpZW50YCdzIG1ldGhvZHMgdG8gY3JlYXRlIG91dHB1dHMgYXMgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGdpdE91dHB1dEFzQXJyYXkoZ2l0Q29tbWFuZFJlc3VsdDogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+KTogc3RyaW5nW10ge1xuICByZXR1cm4gZ2l0Q29tbWFuZFJlc3VsdC5zdGRvdXQuc3BsaXQoJ1xcbicpLm1hcCh4ID0+IHgudHJpbSgpKS5maWx0ZXIoeCA9PiAhIXgpO1xufVxuIl19