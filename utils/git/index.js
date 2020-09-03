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
        define("@angular/dev-infra-private/utils/git/index", ["require", "exports", "tslib", "child_process", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github"], factory);
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
     * Common client for performing Git interactions.
     *
     * Takes in two optional arguements:
     *   _githubToken: the token used for authentifation in github interactions, by default empty
     *     allowing readonly actions.
     *   _config: The dev-infra configuration containing GitClientConfig information, by default
     *     loads the config from the default location.
     **/
    var GitClient = /** @class */ (function () {
        function GitClient(_githubToken, _config, _projectRoot) {
            if (_config === void 0) { _config = config_1.getConfig(); }
            if (_projectRoot === void 0) { _projectRoot = config_1.getRepoBaseDir(); }
            this._githubToken = _githubToken;
            this._config = _config;
            this._projectRoot = _projectRoot;
            /** Short-hand for accessing the remote configuration. */
            this.remoteConfig = this._config.github;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** URL that resolves to the configured repository. */
            this.repoGitUrl = this.remoteConfig.useSsh ?
                "git@github.com:" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git" :
                "https://" + this._githubToken + "@github.com/" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git";
            /** Instance of the authenticated Github octokit API. */
            this.github = new github_1.GithubClient(this._githubToken);
            /** The OAuth scopes available for the provided Github token. */
            this._oauthScopes = null;
            /**
             * Regular expression that matches the provided Github token. Used for
             * sanitizing the token from Git child process output.
             */
            this._githubTokenRegex = null;
            // If a token has been specified (and is not empty), pass it to the Octokit API and
            // also create a regular expression that can be used for sanitizing Git command output
            // so that it does not print the token accidentally.
            if (_githubToken != null) {
                this._githubTokenRegex = new RegExp(_githubToken, 'g');
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
            // To improve the infoging experience in case something fails, we print all executed
            // Git commands. Note that we do not want to print the token if is contained in the
            // command. It's common to share errors with others if the tool failed.
            console_1.info('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
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
                                "  https://github.com/settings/tokens\n\n" +
                                "Alternatively, a new token can be created at: https://github.com/settings/tokens/new\n";
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
                    if (this._oauthScopes !== null) {
                        return [2 /*return*/, this._oauthScopes];
                    }
                    // OAuth scopes are loaded via the /rate_limit endpoint to prevent
                    // usage of a request against that rate_limit for this lookup.
                    return [2 /*return*/, this._oauthScopes = this.github.rateLimit.get().then(function (_response) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCwrQ0FBNEU7SUFFNUUsa0VBQWlFO0lBQ2pFLG9FQUF3QztJQUN4QyxzRUFBc0M7SUFVdEMscUNBQXFDO0lBQ3JDO1FBQXFDLDJDQUFLO1FBQ3hDLHlCQUFZLE1BQWlCLEVBQVMsSUFBYztZQUFwRDtZQUNFLGtFQUFrRTtZQUNsRSxzRUFBc0U7WUFDdEUsa0VBQWtFO1lBQ2xFLGtCQUFNLHlCQUF1QixNQUFNLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBRyxDQUFDLFNBQ2xGO1lBTHFDLFVBQUksR0FBSixJQUFJLENBQVU7O1FBS3BELENBQUM7UUFDSCxzQkFBQztJQUFELENBQUMsQUFQRCxDQUFxQyxLQUFLLEdBT3pDO0lBUFksMENBQWU7SUFTNUI7Ozs7Ozs7O1FBUUk7SUFDSjtRQXFCRSxtQkFDWSxZQUFxQixFQUFVLE9BQWtELEVBQ2pGLFlBQStCO1lBREEsd0JBQUEsRUFBQSxVQUF1QyxrQkFBUyxFQUFFO1lBQ2pGLDZCQUFBLEVBQUEsZUFBZSx1QkFBYyxFQUFFO1lBRC9CLGlCQUFZLEdBQVosWUFBWSxDQUFTO1lBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBMkM7WUFDakYsaUJBQVksR0FBWixZQUFZLENBQW1CO1lBdEIzQyx5REFBeUQ7WUFDekQsaUJBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQztZQUNuQyw2RUFBNkU7WUFDN0UsaUJBQVksR0FBRyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUMsQ0FBQztZQUM5RSxzREFBc0Q7WUFDdEQsZUFBVSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ25DLG9CQUFrQixJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssU0FBSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksU0FBTSxDQUFDLENBQUM7Z0JBQzNFLGFBQVcsSUFBSSxDQUFDLFlBQVksb0JBQWUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLFNBQzlELElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxTQUFNLENBQUM7WUFDckMsd0RBQXdEO1lBQ3hELFdBQU0sR0FBRyxJQUFJLHFCQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTdDLGdFQUFnRTtZQUN4RCxpQkFBWSxHQUEyQixJQUFJLENBQUM7WUFDcEQ7OztlQUdHO1lBQ0ssc0JBQWlCLEdBQWdCLElBQUksQ0FBQztZQUs1QyxtRkFBbUY7WUFDbkYsc0ZBQXNGO1lBQ3RGLG9EQUFvRDtZQUNwRCxJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLE1BQU0sQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUM7YUFDeEQ7UUFDSCxDQUFDO1FBRUQsbUVBQW1FO1FBQ25FLHVCQUFHLEdBQUgsVUFBSSxJQUFjLEVBQUUsT0FBMEI7WUFDNUMsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0MsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQkFDdkIsTUFBTSxJQUFJLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDdkM7WUFDRCw0RUFBNEU7WUFDNUUsbURBQW1EO1lBQ25ELE9BQU8sTUFBa0QsQ0FBQztRQUM1RCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILCtCQUFXLEdBQVgsVUFBWSxJQUFjLEVBQUUsT0FBOEI7WUFBOUIsd0JBQUEsRUFBQSxZQUE4QjtZQUN4RCxvRkFBb0Y7WUFDcEYsbUZBQW1GO1lBQ25GLHVFQUF1RTtZQUN2RSxjQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRXhFLElBQU0sTUFBTSxHQUFHLHlCQUFTLENBQUMsS0FBSyxFQUFFLElBQUksc0NBQ2xDLEdBQUcsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUN0QixLQUFLLEVBQUUsTUFBTSxJQUNWLE9BQU87Z0JBQ1YsK0VBQStFO2dCQUMvRSx3REFBd0Q7Z0JBQ3hELFFBQVEsRUFBRSxNQUFNLElBQ2hCLENBQUM7WUFFSCxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUFFO2dCQUMxQiwwRUFBMEU7Z0JBQzFFLDRFQUE0RTtnQkFDNUUsOEVBQThFO2dCQUM5RSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7YUFDdEU7WUFFRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO1FBRUQsMkRBQTJEO1FBQzNELDZCQUFTLEdBQVQsVUFBVSxVQUFrQixFQUFFLEdBQVc7WUFDdkMsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssRUFBRSxDQUFDO1FBQzNFLENBQUM7UUFFRCx5REFBeUQ7UUFDekQsOENBQTBCLEdBQTFCO1lBQ0UsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDakYsK0VBQStFO1lBQy9FLCtFQUErRTtZQUMvRSxzQ0FBc0M7WUFDdEMsSUFBSSxVQUFVLEtBQUssTUFBTSxFQUFFO2dCQUN6QixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDdEQ7WUFDRCxPQUFPLFVBQVUsQ0FBQztRQUNwQixDQUFDO1FBRUQsdUVBQXVFO1FBQ3ZFLHlDQUFxQixHQUFyQjtZQUNFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCw4Q0FBOEM7UUFDOUMsbUNBQWUsR0FBZjtZQUNFLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxrRkFBa0Y7UUFDbEYsOENBQTBCLEdBQTFCLFVBQTJCLEtBQWE7WUFDdEMseUVBQXlFO1lBQ3pFLGtFQUFrRTtZQUNsRSxJQUFJLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7Z0JBQ25DLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsNEJBQVEsR0FBUixVQUFTLGdCQUF3QixFQUFFLFVBQW1CO1lBQ3BELElBQUksVUFBVSxFQUFFO2dCQUNkLDZCQUE2QjtnQkFDN0IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUN2RCxzQ0FBc0M7Z0JBQ3RDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztnQkFDaEUsaUNBQWlDO2dCQUNqQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLEVBQUMsS0FBSyxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7Z0JBQzNELHlDQUF5QztnQkFDekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxFQUFDLEtBQUssRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2FBQzFEO1lBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO1FBQzFGLENBQUM7UUFFRDs7O1dBR0c7UUFDRyxrQ0FBYyxHQUFwQixVQUFxQixNQUE4Qjs7Ozs7Z0NBQ2xDLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBOzs0QkFBM0MsTUFBTSxHQUFHLFNBQWtDOzRCQUMzQyxhQUFhLEdBQWEsRUFBRSxDQUFDOzRCQUNuQyxxREFBcUQ7NEJBQ3JELE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQzlCLDBGQUEwRjs0QkFDMUYsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FDOUIsc0JBQU8sSUFBSSxFQUFDOzZCQUNiOzRCQU1LLEtBQUssR0FDUCxtRkFBbUY7aUNBQ2hGLGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFNLENBQUE7Z0NBQ3pDLCtCQUErQjtnQ0FDL0IsMENBQTBDO2dDQUMxQyx3RkFBd0YsQ0FBQzs0QkFFN0Ysc0JBQU8sRUFBQyxLQUFLLE9BQUEsRUFBQyxFQUFDOzs7O1NBQ2hCO1FBRUQ7O1lBRUk7UUFDVSx5Q0FBcUIsR0FBbkM7OztvQkFDRSxvRkFBb0Y7b0JBQ3BGLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7d0JBQzlCLHNCQUFPLElBQUksQ0FBQyxZQUFZLEVBQUM7cUJBQzFCO29CQUNELGtFQUFrRTtvQkFDbEUsOERBQThEO29CQUM5RCxzQkFBTyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7NEJBQ25FLElBQU0sUUFBUSxHQUFHLFNBQWtELENBQUM7NEJBQ3BFLElBQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBQ2hFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7d0JBQ3RELENBQUMsQ0FBQyxFQUFDOzs7U0FDSjtRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQTdLRCxJQTZLQztJQTdLWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2dldENvbmZpZywgZ2V0UmVwb0Jhc2VEaXIsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtpbmZvLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcblxuLyoqIEdpdGh1YiByZXNwb25zZSB0eXBlIGV4dGVuZGVkIHRvIGluY2x1ZGUgdGhlIGB4LW9hdXRoLXNjb3Blc2AgaGVhZGVycyBwcmVzZW5jZS4gKi9cbnR5cGUgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlciA9IE9jdG9raXQuUmVzcG9uc2U8T2N0b2tpdC5SYXRlTGltaXRHZXRSZXNwb25zZT4me1xuICBoZWFkZXJzOiB7J3gtb2F1dGgtc2NvcGVzJzogc3RyaW5nfTtcbn07XG5cbi8qKiBEZXNjcmliZXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHRlc3QgZm9yIGdpdmVuIEdpdGh1YiBPQXV0aCBzY29wZXMuICovXG5leHBvcnQgdHlwZSBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uID0gKHNjb3Blczogc3RyaW5nW10sIG1pc3Npbmc6IHN0cmluZ1tdKSA9PiB2b2lkO1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50Lm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbW1vbiBjbGllbnQgZm9yIHBlcmZvcm1pbmcgR2l0IGludGVyYWN0aW9ucy5cbiAqXG4gKiBUYWtlcyBpbiB0d28gb3B0aW9uYWwgYXJndWVtZW50czpcbiAqICAgX2dpdGh1YlRva2VuOiB0aGUgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGlmYXRpb24gaW4gZ2l0aHViIGludGVyYWN0aW9ucywgYnkgZGVmYXVsdCBlbXB0eVxuICogICAgIGFsbG93aW5nIHJlYWRvbmx5IGFjdGlvbnMuXG4gKiAgIF9jb25maWc6IFRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBjb250YWluaW5nIEdpdENsaWVudENvbmZpZyBpbmZvcm1hdGlvbiwgYnkgZGVmYXVsdFxuICogICAgIGxvYWRzIHRoZSBjb25maWcgZnJvbSB0aGUgZGVmYXVsdCBsb2NhdGlvbi5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVtb3RlQ29uZmlnID0gdGhpcy5fY29uZmlnLmdpdGh1YjtcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICByZXBvR2l0VXJsID0gdGhpcy5yZW1vdGVDb25maWcudXNlU3NoID9cbiAgICAgIGBnaXRAZ2l0aHViLmNvbToke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke3RoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGAgOlxuICAgICAgYGh0dHBzOi8vJHt0aGlzLl9naXRodWJUb2tlbn1AZ2l0aHViLmNvbS8ke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke1xuICAgICAgICAgIHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGA7XG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRodWIgb2N0b2tpdCBBUEkuICovXG4gIGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQodGhpcy5fZ2l0aHViVG9rZW4pO1xuXG4gIC8qKiBUaGUgT0F1dGggc2NvcGVzIGF2YWlsYWJsZSBmb3IgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfb2F1dGhTY29wZXM6IFByb21pc2U8c3RyaW5nW10+fG51bGwgPSBudWxsO1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cHxudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2dpdGh1YlRva2VuPzogc3RyaW5nLCBwcml2YXRlIF9jb25maWc6IFBpY2s8TmdEZXZDb25maWcsICdnaXRodWInPiA9IGdldENvbmZpZygpLFxuICAgICAgcHJpdmF0ZSBfcHJvamVjdFJvb3QgPSBnZXRSZXBvQmFzZURpcigpKSB7XG4gICAgLy8gSWYgYSB0b2tlbiBoYXMgYmVlbiBzcGVjaWZpZWQgKGFuZCBpcyBub3QgZW1wdHkpLCBwYXNzIGl0IHRvIHRoZSBPY3Rva2l0IEFQSSBhbmRcbiAgICAvLyBhbHNvIGNyZWF0ZSBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSB1c2VkIGZvciBzYW5pdGl6aW5nIEdpdCBjb21tYW5kIG91dHB1dFxuICAgIC8vIHNvIHRoYXQgaXQgZG9lcyBub3QgcHJpbnQgdGhlIHRva2VuIGFjY2lkZW50YWxseS5cbiAgICBpZiAoX2dpdGh1YlRva2VuICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPSBuZXcgUmVnRXhwKF9naXRodWJUb2tlbiwgJ2cnKTtcbiAgICB9XG4gIH1cblxuICAvKiogRXhlY3V0ZXMgdGhlIGdpdmVuIGdpdCBjb21tYW5kLiBUaHJvd3MgaWYgdGhlIGNvbW1hbmQgZmFpbHMuICovXG4gIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnMpOiBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJ1bkdyYWNlZnVsKGFyZ3MsIG9wdGlvbnMpO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0Q29tbWFuZEVycm9yKHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICAvLyBPbWl0IGBzdGF0dXNgIGZyb20gdGhlIHR5cGUgc28gdGhhdCBpdCdzIG9idmlvdXMgdGhhdCB0aGUgc3RhdHVzIGlzIG5ldmVyXG4gICAgLy8gbm9uLXplcm8gYXMgZXhwbGFpbmVkIGluIHRoZSBtZXRob2QgZGVzY3JpcHRpb24uXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNwYXducyBhIGdpdmVuIEdpdCBjb21tYW5kIHByb2Nlc3MuIERvZXMgbm90IHRocm93IGlmIHRoZSBjb21tYW5kIGZhaWxzLiBBZGRpdGlvbmFsbHksXG4gICAqIGlmIHRoZXJlIGlzIGFueSBzdGRlcnIgb3V0cHV0LCB0aGUgb3V0cHV0IHdpbGwgYmUgcHJpbnRlZC4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICogaW5mbyBmYWlsZWQgY29tbWFuZHMuXG4gICAqL1xuICBydW5HcmFjZWZ1bChhcmdzOiBzdHJpbmdbXSwgb3B0aW9uczogU3Bhd25TeW5jT3B0aW9ucyA9IHt9KTogU3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+IHtcbiAgICAvLyBUbyBpbXByb3ZlIHRoZSBpbmZvZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWRcbiAgICAvLyBHaXQgY29tbWFuZHMuIE5vdGUgdGhhdCB3ZSBkbyBub3Qgd2FudCB0byBwcmludCB0aGUgdG9rZW4gaWYgaXMgY29udGFpbmVkIGluIHRoZVxuICAgIC8vIGNvbW1hbmQuIEl0J3MgY29tbW9uIHRvIHNoYXJlIGVycm9ycyB3aXRoIG90aGVycyBpZiB0aGUgdG9vbCBmYWlsZWQuXG4gICAgaW5mbygnRXhlY3V0aW5nOiBnaXQnLCB0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoIG9yIHJldmlzaW9uLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSB0aGlzLnJ1bihbJ3Jldi1wYXJzZScsICctLWFiYnJldi1yZWYnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIC8vIElmIG5vIGJyYW5jaCBuYW1lIGNvdWxkIGJlIHJlc29sdmVkLiBpLmUuIGBIRUFEYCBoYXMgYmVlbiByZXR1cm5lZCwgdGhlbiBHaXRcbiAgICAvLyBpcyBjdXJyZW50bHkgaW4gYSBkZXRhY2hlZCBzdGF0ZS4gSW4gdGhvc2UgY2FzZXMsIHdlIGp1c3Qgd2FudCB0byByZXR1cm4gdGhlXG4gICAgLy8gY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uL1NIQS5cbiAgICBpZiAoYnJhbmNoTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIH1cbiAgICByZXR1cm4gYnJhbmNoTmFtZTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByZXBvIGhhcyBhbnkgbG9jYWwgY2hhbmdlcy4gKi9cbiAgaGFzTG9jYWxDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZi1pbmRleCcsICctLXF1aWV0JywgJ0hFQUQnXSkuc3RhdHVzICE9PSAwO1xuICB9XG5cbiAgLyoqIFNhbml0aXplcyBhIGdpdmVuIG1lc3NhZ2UgYnkgb21pdHRpbmcgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbiBpZiBwcmVzZW50LiAqL1xuICBvbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICAvLyBJZiBubyB0b2tlbiBoYXMgYmVlbiBkZWZpbmVkIChpLmUuIG5vIHRva2VuIHJlZ2V4KSwgd2UganVzdCByZXR1cm4gdGhlXG4gICAgLy8gdmFsdWUgYXMgaXMuIFRoZXJlIGlzIG5vIHNlY3JldCB2YWx1ZSB0aGF0IG5lZWRzIHRvIGJlIG9taXR0ZWQuXG4gICAgaWYgKHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fZ2l0aHViVG9rZW5SZWdleCwgJzxUT0tFTj4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IGEgcmVxdWVzdGVkIGJyYW5jaCBvciByZXZpc2lvbiwgb3B0aW9uYWxseSBjbGVhbmluZyB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnlcbiAgICogYmVmb3JlIGF0dGVtcHRpbmcgdGhlIGNoZWNraW5nLiBSZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGJyYW5jaCBvciByZXZpc2lvblxuICAgKiB3YXMgY2xlYW5seSBjaGVja2VkIG91dC5cbiAgICovXG4gIGNoZWNrb3V0KGJyYW5jaE9yUmV2aXNpb246IHN0cmluZywgY2xlYW5TdGF0ZTogYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGlmIChjbGVhblN0YXRlKSB7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgYW1zLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ2FtJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGNoZXJyeS1waWNrcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydjaGVycnktcGljaycsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyByZWJhc2VzLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3JlYmFzZScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIENsZWFyIGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8uXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsncmVzZXQnLCAnLS1oYXJkJ10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydjaGVja291dCcsIGJyYW5jaE9yUmV2aXNpb25dLCB7c3RkaW86ICdpZ25vcmUnfSkuc3RhdHVzID09PSAwO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUHJlY29uc3RydWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBsb2cgdG8gdGhlIHVzZXIsIHByb3ZpZGluZyBtaXNzaW5nIHNjb3BlcyBhbmRcbiAgICAgKiByZW1lZGlhdGlvbiBpbnN0cnVjdGlvbnMuXG4gICAgICoqL1xuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zXFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vucy9uZXdcXG5gO1xuXG4gICAgcmV0dXJuIHtlcnJvcn07XG4gIH1cblxuICAvKipcbiAgICogUmV0cmlldmUgdGhlIE9BdXRoIHNjb3BlcyBmb3IgdGhlIGxvYWRlZCBHaXRodWIgdG9rZW4uXG4gICAqKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX29hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX29hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4oX3Jlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gX3Jlc3BvbnNlIGFzIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXI7XG4gICAgICBjb25zdCBzY29wZXM6IHN0cmluZyA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtb2F1dGgtc2NvcGVzJ10gfHwgJyc7XG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==