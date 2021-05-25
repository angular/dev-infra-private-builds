/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __awaiter, __extends, __generator, __read, __spreadArray } from "tslib";
import { spawnSync } from 'child_process';
import { parse, SemVer } from 'semver';
import { getConfig } from '../config';
import { debug, info, yellow } from '../console';
import { DryRunError, isDryRun } from '../dry-run';
import { GithubClient } from './github';
import { getRepositoryGitUrl, GITHUB_TOKEN_GENERATE_URL, GITHUB_TOKEN_SETTINGS_URL } from './github-urls';
/** Error for failed Git commands. */
var GitCommandError = /** @class */ (function (_super) {
    __extends(GitCommandError, _super);
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
export { GitCommandError };
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
        /** The OAuth scopes available for the provided Github token. */
        this._cachedOauthScopes = null;
        /**
         * Regular expression that matches the provided Github token. Used for
         * sanitizing the token from Git child process output.
         */
        this._githubTokenRegex = null;
        /** Instance of the Github octokit API. */
        this.github = new GithubClient(this.githubToken);
        this.baseDir = baseDir || this.determineBaseDir();
        this.config = config || getConfig(this.baseDir);
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
    /** Set the verbose logging state of the GitClient class. */
    GitClient.setVerboseLoggingState = function (verbose) {
        this.verboseLogging = verbose;
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
        if (isDryRun() && gitCommand === 'push') {
            debug("\"git push\" is not able to be run in dryRun mode.");
            throw new DryRunError();
        }
        // To improve the debugging experience in case something fails, we print all executed Git
        // commands at the DEBUG level to better understand the git actions occuring. Verbose logging,
        // always logging at the INFO level, can be enabled either by setting the verboseLogging
        // property on the GitClient class or the options object provided to the method.
        var printFn = (GitClient.verboseLogging || options.verboseLogging) ? info : debug;
        // Note that we do not want to print the token if it is contained in the command. It's common
        // to share errors with others if the tool failed, and we do not want to leak tokens.
        printFn('Executing: git', this.omitGithubTokenFromMessage(args.join(' ')));
        var result = spawnSync('git', args, __assign(__assign({ cwd: this.baseDir, stdio: 'pipe' }, options), { 
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
        return getRepositoryGitUrl(this.remoteConfig, this.githubToken);
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
        var latestTag = tags.find(function (tag) { return parse(tag, semVerOptions); });
        if (latestTag === undefined) {
            throw new Error("Unable to find a SemVer matching tag on \"" + this.getCurrentBranchOrRevision() + "\"");
        }
        return new SemVer(latestTag, semVerOptions);
    };
    /** Retrieve a list of all files in the repostitory changed since the provided shaOrRef. */
    GitClient.prototype.allChangesFilesSince = function (shaOrRef) {
        if (shaOrRef === void 0) { shaOrRef = 'HEAD'; }
        return Array.from(new Set(__spreadArray(__spreadArray([], __read(gitOutputAsArray(this.runGraceful(['diff', '--name-only', '--diff-filter=d', shaOrRef])))), __read(gitOutputAsArray(this.runGraceful(['ls-files', '--others', '--exclude-standard']))))));
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
        return __awaiter(this, void 0, void 0, function () {
            var scopes, missingScopes, error;
            return __generator(this, function (_a) {
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
                            (yellow(missingScopes.join(', ')) + "\n\n") +
                            "Update the token in use at:\n" +
                            ("  " + GITHUB_TOKEN_SETTINGS_URL + "\n\n") +
                            ("Alternatively, a new token can be created at: " + GITHUB_TOKEN_GENERATE_URL + "\n");
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
        var _a = this.runGraceful(['rev-parse', '--show-toplevel']), stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
        if (status !== 0) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("ERROR:\n " + stderr));
        }
        return stdout.trim();
    };
    /** Whether verbose logging of Git actions should be used. */
    GitClient.verboseLogging = false;
    return GitClient;
}());
export { GitClient };
/**
 * Takes the output from `GitClient.run` and `GitClient.runGraceful` and returns an array of strings
 * for each new line. Git commands typically return multiple output values for a command a set of
 * strings separated by new lines.
 *
 * Note: This is specifically created as a locally available function for usage as convenience
 * utility within `GitClient`'s methods to create outputs as array.
 */
function gitOutputAsArray(gitCommandResult) {
    return gitCommandResult.stdout.split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsU0FBUyxFQUFxQyxNQUFNLGVBQWUsQ0FBQztBQUM1RSxPQUFPLEVBQTJCLEtBQUssRUFBRSxNQUFNLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFFL0QsT0FBTyxFQUFDLFNBQVMsRUFBNEIsTUFBTSxXQUFXLENBQUM7QUFDL0QsT0FBTyxFQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxXQUFXLEVBQUUsUUFBUSxFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQ2pELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDdEMsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBVXhHLHFDQUFxQztBQUNyQztJQUFxQyxtQ0FBSztJQUN4Qyx5QkFBWSxNQUEwQixFQUFTLElBQWM7UUFBN0Q7UUFDRSxrRUFBa0U7UUFDbEUsc0VBQXNFO1FBQ3RFLGtFQUFrRTtRQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQUNsRjtRQUw4QyxVQUFJLEdBQUosSUFBSSxDQUFVOztJQUs3RCxDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBUEQsQ0FBcUMsS0FBSyxHQU96Qzs7QUFPRDs7Ozs7Ozs7SUFRSTtBQUNKO0lBaUVFOzs7O09BSUc7SUFDSCxtQkFBNkIsV0FBMEQsRUFDdkIsTUFBb0IsRUFDcEIsT0FBZ0I7UUFGbkQsZ0JBQVcsR0FBWCxXQUFXLENBQStDO1FBckJ2RixnRUFBZ0U7UUFDeEQs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QUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsY0FBWSxNQUFRLENBQUEsQ0FBQyxDQUFDO1NBQzNCO1FBQ0QsT0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQWpQRCw2REFBNkQ7SUFDOUMsd0JBQWMsR0FBRyxLQUFLLENBQUM7SUFpUHhDLGdCQUFDO0NBQUEsQUEvUkQsSUErUkM7U0EvUlksU0FBUztBQWlTdEI7Ozs7Ozs7R0FPRztBQUNILFNBQVMsZ0JBQWdCLENBQUMsZ0JBQTBDO0lBQ2xFLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsRUFBSCxDQUFHLENBQUMsQ0FBQztBQUNqRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQge09wdGlvbnMgYXMgU2VtVmVyT3B0aW9ucywgcGFyc2UsIFNlbVZlcn0gZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtnZXRDb25maWcsIEdpdGh1YkNvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2RlYnVnLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuaW1wb3J0IHtEcnlSdW5FcnJvciwgaXNEcnlSdW59IGZyb20gJy4uL2RyeS1ydW4nO1xuaW1wb3J0IHtHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybCwgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0IGNvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdENvbW1hbmRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBHaXRDbGllbnQ8Ym9vbGVhbj4sIHB1YmxpYyBhcmdzOiBzdHJpbmdbXSkge1xuICAgIC8vIEVycm9ycyBhcmUgbm90IGd1YXJhbnRlZWQgdG8gYmUgY2F1Z2h0LiBUbyBlbnN1cmUgdGhhdCB3ZSBkb24ndFxuICAgIC8vIGFjY2lkZW50YWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdGhhdCBtaWdodCBiZSB1c2VkIGluIGEgY29tbWFuZCxcbiAgICAvLyB3ZSBzYW5pdGl6ZSB0aGUgY29tbWFuZCB0aGF0IHdpbGwgYmUgcGFydCBvZiB0aGUgZXJyb3IgbWVzc2FnZS5cbiAgICBzdXBlcihgQ29tbWFuZCBmYWlsZWQ6IGdpdCAke2NsaWVudC5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShhcmdzLmpvaW4oJyAnKSl9YCk7XG4gIH1cbn1cblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSBmb3IgYEdpdENsaWVudGAncyBgcnVuYCBhbmQgYHJ1bkdyYWNlZnVsYCBtZXRob2RzLiAqL1xudHlwZSBHaXRDbGllbnRSdW5PcHRpb25zID0gU3Bhd25TeW5jT3B0aW9ucyZ7XG4gIHZlcmJvc2VMb2dnaW5nPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogQ29tbW9uIGNsaWVudCBmb3IgcGVyZm9ybWluZyBHaXQgaW50ZXJhY3Rpb25zIHdpdGggYSBnaXZlbiByZW1vdGUuXG4gKlxuICogVGFrZXMgaW4gdHdvIG9wdGlvbmFsIGFyZ3VtZW50czpcbiAqICAgYGdpdGh1YlRva2VuYDogdGhlIHRva2VuIHVzZWQgZm9yIGF1dGhlbnRpY2F0aW9uIGluIEdpdGh1YiBpbnRlcmFjdGlvbnMsIGJ5IGRlZmF1bHQgZW1wdHlcbiAqICAgICBhbGxvd2luZyByZWFkb25seSBhY3Rpb25zLlxuICogICBgY29uZmlnYDogVGhlIGRldi1pbmZyYSBjb25maWd1cmF0aW9uIGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbW90ZS4gQnkgZGVmYXVsdFxuICogICAgIHRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBpcyBsb2FkZWQgd2l0aCBpdHMgR2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gKiovXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50PEF1dGhlbnRpY2F0ZWQgZXh0ZW5kcyBib29sZWFuPiB7XG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gICAqIFNpbmdsZXRvbiBkZWZpbml0aW9uIGFuZCBjb25maWd1cmF0aW9uLiAgICAgICAqXG4gICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgc3RhdGljIGF1dGhlbnRpY2F0ZWQ6IEdpdENsaWVudDx0cnVlPjtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIHVuYXV0aGVudGljYXRlZCBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgc3RhdGljIHVuYXV0aGVudGljYXRlZDogR2l0Q2xpZW50PGZhbHNlPjtcblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgdW5hdXRob3JpemVkIEdpdENsaWVudCwgY3JlYXRpbmcgaXQgaWYgaXRcbiAgICogaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgc3RhdGljIGdldEluc3RhbmNlKCkge1xuICAgIGlmICghR2l0Q2xpZW50LnVuYXV0aGVudGljYXRlZCkge1xuICAgICAgR2l0Q2xpZW50LnVuYXV0aGVudGljYXRlZCA9IG5ldyBHaXRDbGllbnQodW5kZWZpbmVkKTtcbiAgICB9XG4gICAgcmV0dXJuIEdpdENsaWVudC51bmF1dGhlbnRpY2F0ZWQ7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRDbGllbnQgaWYgaXQgaGFzIGJlZW5cbiAgICogZ2VuZXJhdGVkLlxuICAgKi9cbiAgc3RhdGljIGdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpIHtcbiAgICBpZiAoIUdpdENsaWVudC5hdXRoZW50aWNhdGVkKSB7XG4gICAgICB0aHJvdyBFcnJvcignVGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGhhcyBub3QgeWV0IGJlZW4gZ2VuZXJhdGVkLicpO1xuICAgIH1cbiAgICByZXR1cm4gR2l0Q2xpZW50LmF1dGhlbnRpY2F0ZWQ7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGluc3RhbmNlLiAqL1xuICBzdGF0aWMgYXV0aGVudGljYXRlV2l0aFRva2VuKHRva2VuOiBzdHJpbmcpIHtcbiAgICBpZiAoR2l0Q2xpZW50LmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdDYW5ub3QgZ2VuZXJhdGUgbmV3IGF1dGhlbnRpY2F0ZWQgR2l0Q2xpZW50IGFmdGVyIG9uZSBoYXMgYWxyZWFkeSBiZWVuIGdlbmVyYXRlZC4nKTtcbiAgICB9XG4gICAgR2l0Q2xpZW50LmF1dGhlbnRpY2F0ZWQgPSBuZXcgR2l0Q2xpZW50KHRva2VuKTtcbiAgfVxuXG4gIC8qKiBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiB0aGUgR2l0Q2xpZW50IGNsYXNzLiAqL1xuICBzdGF0aWMgc2V0VmVyYm9zZUxvZ2dpbmdTdGF0ZSh2ZXJib3NlOiBib29sZWFuKSB7XG4gICAgdGhpcy52ZXJib3NlTG9nZ2luZyA9IHZlcmJvc2U7XG4gIH1cblxuICAvKiogV2hldGhlciB2ZXJib3NlIGxvZ2dpbmcgb2YgR2l0IGFjdGlvbnMgc2hvdWxkIGJlIHVzZWQuICovXG4gIHByaXZhdGUgc3RhdGljIHZlcmJvc2VMb2dnaW5nID0gZmFsc2U7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uICovXG4gIHByaXZhdGUgY29uZmlnOiBOZ0RldkNvbmZpZztcbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uIFVzZWQgZm9yXG4gICAqIHNhbml0aXppbmcgdGhlIHRva2VuIGZyb20gR2l0IGNoaWxkIHByb2Nlc3Mgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2l0aHViVG9rZW5SZWdleDogUmVnRXhwfG51bGwgPSBudWxsO1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSBkZWZhdWx0IHJlbW90ZSBjb25maWd1cmF0aW9uLiAqL1xuICByZW1vdGVDb25maWc6IEdpdGh1YkNvbmZpZztcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zOiB7b3duZXI6IHN0cmluZywgcmVwbzogc3RyaW5nfTtcbiAgLyoqIEluc3RhbmNlIG9mIHRoZSBHaXRodWIgb2N0b2tpdCBBUEkuICovXG4gIGdpdGh1YiA9IG5ldyBHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG4gIC8qKiBUaGUgZnVsbCBwYXRoIHRvIHRoZSByb290IG9mIHRoZSByZXBvc2l0b3J5IGJhc2UuICovXG4gIGJhc2VEaXI6IHN0cmluZztcblxuICAvKipcbiAgICogQHBhcmFtIGdpdGh1YlRva2VuIFRoZSBnaXRodWIgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGljYXRpb24sIGlmIHByb3ZpZGVkLlxuICAgKiBAcGFyYW0gX2NvbmZpZyBUaGUgY29uZmlndXJhdGlvbiwgY29udGFpbmluZyB0aGUgZ2l0aHViIHNwZWNpZmljIGNvbmZpZ3VyYXRpb24uXG4gICAqIEBwYXJhbSBiYXNlRGlyIFRoZSBmdWxsIHBhdGggdG8gdGhlIHJvb3Qgb2YgdGhlIHJlcG9zaXRvcnkgYmFzZS5cbiAgICovXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihwdWJsaWMgZ2l0aHViVG9rZW46IEF1dGhlbnRpY2F0ZWQgZXh0ZW5kcyB0cnVlPyBzdHJpbmc6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZz86IE5nRGV2Q29uZmlnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZURpcj86IHN0cmluZykge1xuICAgIHRoaXMuYmFzZURpciA9IGJhc2VEaXIgfHwgdGhpcy5kZXRlcm1pbmVCYXNlRGlyKCk7XG4gICAgdGhpcy5jb25maWcgPSBjb25maWcgfHwgZ2V0Q29uZmlnKHRoaXMuYmFzZURpcik7XG4gICAgdGhpcy5yZW1vdGVDb25maWcgPSB0aGlzLmNvbmZpZy5naXRodWI7XG4gICAgdGhpcy5yZW1vdGVQYXJhbXMgPSB7b3duZXI6IHRoaXMucmVtb3RlQ29uZmlnLm93bmVyLCByZXBvOiB0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfTtcblxuICAgIC8vIElmIGEgdG9rZW4gaGFzIGJlZW4gc3BlY2lmaWVkIChhbmQgaXMgbm90IGVtcHR5KSwgcGFzcyBpdCB0byB0aGUgT2N0b2tpdCBBUEkgYW5kXG4gICAgLy8gYWxzbyBjcmVhdGUgYSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBjYW4gYmUgdXNlZCBmb3Igc2FuaXRpemluZyBHaXQgY29tbWFuZCBvdXRwdXRcbiAgICAvLyBzbyB0aGF0IGl0IGRvZXMgbm90IHByaW50IHRoZSB0b2tlbiBhY2NpZGVudGFsbHkuXG4gICAgaWYgKHR5cGVvZiBnaXRodWJUb2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX2dpdGh1YlRva2VuUmVnZXggPSBuZXcgUmVnRXhwKGdpdGh1YlRva2VuLCAnZycpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBFeGVjdXRlcyB0aGUgZ2l2ZW4gZ2l0IGNvbW1hbmQuIFRocm93cyBpZiB0aGUgY29tbWFuZCBmYWlscy4gKi9cbiAgcnVuKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zPzogR2l0Q2xpZW50UnVuT3B0aW9ucyk6IE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMucnVuR3JhY2VmdWwoYXJncywgb3B0aW9ucyk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IG5ldyBHaXRDb21tYW5kRXJyb3IodGhpcywgYXJncyk7XG4gICAgfVxuICAgIC8vIE9taXQgYHN0YXR1c2AgZnJvbSB0aGUgdHlwZSBzbyB0aGF0IGl0J3Mgb2J2aW91cyB0aGF0IHRoZSBzdGF0dXMgaXMgbmV2ZXJcbiAgICAvLyBub24temVybyBhcyBleHBsYWluZWQgaW4gdGhlIG1ldGhvZCBkZXNjcmlwdGlvbi5cbiAgICByZXR1cm4gcmVzdWx0IGFzIE9taXQ8U3Bhd25TeW5jUmV0dXJuczxzdHJpbmc+LCAnc3RhdHVzJz47XG4gIH1cblxuICAvKipcbiAgICogU3Bhd25zIGEgZ2l2ZW4gR2l0IGNvbW1hbmQgcHJvY2Vzcy4gRG9lcyBub3QgdGhyb3cgaWYgdGhlIGNvbW1hbmQgZmFpbHMuIEFkZGl0aW9uYWxseSxcbiAgICogaWYgdGhlcmUgaXMgYW55IHN0ZGVyciBvdXRwdXQsIHRoZSBvdXRwdXQgd2lsbCBiZSBwcmludGVkLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgKiBpbmZvIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBHaXRDbGllbnRSdW5PcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8qKiBUaGUgZ2l0IGNvbW1hbmQgdG8gYmUgcnVuLiAqL1xuICAgIGNvbnN0IGdpdENvbW1hbmQgPSBhcmdzWzBdO1xuXG4gICAgaWYgKGlzRHJ5UnVuKCkgJiYgZ2l0Q29tbWFuZCA9PT0gJ3B1c2gnKSB7XG4gICAgICBkZWJ1ZyhgXCJnaXQgcHVzaFwiIGlzIG5vdCBhYmxlIHRvIGJlIHJ1biBpbiBkcnlSdW4gbW9kZS5gKTtcbiAgICAgIHRocm93IG5ldyBEcnlSdW5FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWQgR2l0XG4gICAgLy8gY29tbWFuZHMgYXQgdGhlIERFQlVHIGxldmVsIHRvIGJldHRlciB1bmRlcnN0YW5kIHRoZSBnaXQgYWN0aW9ucyBvY2N1cmluZy4gVmVyYm9zZSBsb2dnaW5nLFxuICAgIC8vIGFsd2F5cyBsb2dnaW5nIGF0IHRoZSBJTkZPIGxldmVsLCBjYW4gYmUgZW5hYmxlZCBlaXRoZXIgYnkgc2V0dGluZyB0aGUgdmVyYm9zZUxvZ2dpbmdcbiAgICAvLyBwcm9wZXJ0eSBvbiB0aGUgR2l0Q2xpZW50IGNsYXNzIG9yIHRoZSBvcHRpb25zIG9iamVjdCBwcm92aWRlZCB0byB0aGUgbWV0aG9kLlxuICAgIGNvbnN0IHByaW50Rm4gPSAoR2l0Q2xpZW50LnZlcmJvc2VMb2dnaW5nIHx8IG9wdGlvbnMudmVyYm9zZUxvZ2dpbmcpID8gaW5mbyA6IGRlYnVnO1xuICAgIC8vIE5vdGUgdGhhdCB3ZSBkbyBub3Qgd2FudCB0byBwcmludCB0aGUgdG9rZW4gaWYgaXQgaXMgY29udGFpbmVkIGluIHRoZSBjb21tYW5kLiBJdCdzIGNvbW1vblxuICAgIC8vIHRvIHNoYXJlIGVycm9ycyB3aXRoIG90aGVycyBpZiB0aGUgdG9vbCBmYWlsZWQsIGFuZCB3ZSBkbyBub3Qgd2FudCB0byBsZWFrIHRva2Vucy5cbiAgICBwcmludEZuKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYygnZ2l0JywgYXJncywge1xuICAgICAgY3dkOiB0aGlzLmJhc2VEaXIsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICB9XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb250YWlucyB0aGUgc3BlY2lmaWVkIFNIQS4gKi9cbiAgaGFzQ29tbWl0KGJyYW5jaE5hbWU6IHN0cmluZywgc2hhOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydicmFuY2gnLCBicmFuY2hOYW1lLCAnLS1jb250YWlucycsIHNoYV0pLnN0ZG91dCAhPT0gJyc7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaCBvciByZXZpc2lvbi4gKi9cbiAgZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTogc3RyaW5nIHtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBJZiBubyBicmFuY2ggbmFtZSBjb3VsZCBiZSByZXNvbHZlZC4gaS5lLiBgSEVBRGAgaGFzIGJlZW4gcmV0dXJuZWQsIHRoZW4gR2l0XG4gICAgLy8gaXMgY3VycmVudGx5IGluIGEgZGV0YWNoZWQgc3RhdGUuIEluIHRob3NlIGNhc2VzLCB3ZSBqdXN0IHdhbnQgdG8gcmV0dXJuIHRoZVxuICAgIC8vIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi9TSEEuXG4gICAgaWYgKGJyYW5jaE5hbWUgPT09ICdIRUFEJykge1xuICAgICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICB9XG4gICAgcmV0dXJuIGJyYW5jaE5hbWU7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcmVwbyBoYXMgYW55IGxvY2FsIGNoYW5nZXMuICovXG4gIGhhc0xvY2FsQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgb21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgLy8gSWYgbm8gdG9rZW4gaGFzIGJlZW4gZGVmaW5lZCAoaS5lLiBubyB0b2tlbiByZWdleCksIHdlIGp1c3QgcmV0dXJuIHRoZVxuICAgIC8vIHZhbHVlIGFzIGlzLiBUaGVyZSBpcyBubyBzZWNyZXQgdmFsdWUgdGhhdCBuZWVkcyB0byBiZSBvbWl0dGVkLlxuICAgIGlmICh0aGlzLl9naXRodWJUb2tlblJlZ2V4ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCBhIHJlcXVlc3RlZCBicmFuY2ggb3IgcmV2aXNpb24sIG9wdGlvbmFsbHkgY2xlYW5pbmcgdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5XG4gICAqIGJlZm9yZSBhdHRlbXB0aW5nIHRoZSBjaGVja2luZy4gUmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBicmFuY2ggb3IgcmV2aXNpb25cbiAgICogd2FzIGNsZWFubHkgY2hlY2tlZCBvdXQuXG4gICAqL1xuICBjaGVja291dChicmFuY2hPclJldmlzaW9uOiBzdHJpbmcsIGNsZWFuU3RhdGU6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAoY2xlYW5TdGF0ZSkge1xuICAgICAgLy8gQWJvcnQgYW55IG91dHN0YW5kaW5nIGFtcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydhbScsICctLWFib3J0J10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAgIC8vIEFib3J0IGFueSBvdXRzdGFuZGluZyBjaGVycnktcGlja3MuXG4gICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBBYm9ydCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcy5cbiAgICAgIHRoaXMucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnLS1hYm9ydCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgICAvLyBDbGVhciBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvLlxuICAgICAgdGhpcy5ydW5HcmFjZWZ1bChbJ3Jlc2V0JywgJy0taGFyZCddLCB7c3RkaW86ICdpZ25vcmUnfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBicmFuY2hPclJldmlzaW9uXSwge3N0ZGlvOiAnaWdub3JlJ30pLnN0YXR1cyA9PT0gMDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBsYXRlc3QgZ2l0IHRhZyBvbiB0aGUgY3VycmVudCBicmFuY2ggdGhhdCBtYXRjaGVzIFNlbVZlci4gKi9cbiAgZ2V0TGF0ZXN0U2VtdmVyVGFnKCk6IFNlbVZlciB7XG4gICAgY29uc3Qgc2VtVmVyT3B0aW9uczogU2VtVmVyT3B0aW9ucyA9IHtsb29zZTogdHJ1ZX07XG4gICAgY29uc3QgdGFncyA9IHRoaXMucnVuR3JhY2VmdWwoWyd0YWcnLCAnLS1zb3J0PS1jb21taXR0ZXJkYXRlJywgJy0tbWVyZ2VkJ10pLnN0ZG91dC5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbGF0ZXN0VGFnID0gdGFncy5maW5kKCh0YWc6IHN0cmluZykgPT4gcGFyc2UodGFnLCBzZW1WZXJPcHRpb25zKSk7XG5cbiAgICBpZiAobGF0ZXN0VGFnID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGZpbmQgYSBTZW1WZXIgbWF0Y2hpbmcgdGFnIG9uIFwiJHt0aGlzLmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9XCJgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIobGF0ZXN0VGFnLCBzZW1WZXJPcHRpb25zKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhIGxpc3Qgb2YgYWxsIGZpbGVzIGluIHRoZSByZXBvc3RpdG9yeSBjaGFuZ2VkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGFPclJlZi4gKi9cbiAgYWxsQ2hhbmdlc0ZpbGVzU2luY2Uoc2hhT3JSZWYgPSAnSEVBRCcpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAuLi5naXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydkaWZmJywgJy0tbmFtZS1vbmx5JywgJy0tZGlmZi1maWx0ZXI9ZCcsIHNoYU9yUmVmXSkpLFxuICAgICAgLi4uZ2l0T3V0cHV0QXNBcnJheSh0aGlzLnJ1bkdyYWNlZnVsKFsnbHMtZmlsZXMnLCAnLS1vdGhlcnMnLCAnLS1leGNsdWRlLXN0YW5kYXJkJ10pKSxcbiAgICBdKSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgc3RhZ2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsU3RhZ2VkRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KFxuICAgICAgICB0aGlzLnJ1bkdyYWNlZnVsKFsnZGlmZicsICctLW5hbWUtb25seScsICctLWRpZmYtZmlsdGVyPUFDTScsICctLXN0YWdlZCddKSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgYSBsaXN0IG9mIGFsbCBmaWxlcyB0cmFja2VkIGluIHRoZSByZXBvc3RpdG9yeS4gKi9cbiAgYWxsRmlsZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KHRoaXMucnVuR3JhY2VmdWwoWydscy1maWxlcyddKSk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBHaXRDbGllbnQgaW5zdGFuY2UgaXMgdXNpbmcgYSB0b2tlbiB3aXRoIHBlcm1pc3Npb25zIGZvciB0aGUgYWxsIG9mIHRoZVxuICAgKiBwcm92aWRlZCBPQXV0aCBzY29wZXMuXG4gICAqL1xuICBhc3luYyBoYXNPYXV0aFNjb3Blcyh0ZXN0Rm46IE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24pOiBQcm9taXNlPHRydWV8e2Vycm9yOiBzdHJpbmd9PiB7XG4gICAgY29uc3Qgc2NvcGVzID0gYXdhaXQgdGhpcy5nZXRBdXRoU2NvcGVzRm9yVG9rZW4oKTtcbiAgICBjb25zdCBtaXNzaW5nU2NvcGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRlc3QgR2l0aHViIE9BdXRoIHNjb3BlcyBhbmQgY29sbGVjdCBtaXNzaW5nIG9uZXMuXG4gICAgdGVzdEZuKHNjb3BlcywgbWlzc2luZ1Njb3Blcyk7XG4gICAgLy8gSWYgbm8gbWlzc2luZyBzY29wZXMgYXJlIGZvdW5kLCByZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhbGwgT0F1dGggU2NvcGVzIGFyZSBhdmFpbGFibGUuXG4gICAgaWYgKG1pc3NpbmdTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVjb25zdHJ1Y3RlZCBlcnJvciBtZXNzYWdlIHRvIGxvZyB0byB0aGUgdXNlciwgcHJvdmlkaW5nIG1pc3Npbmcgc2NvcGVzIGFuZFxuICAgICAqIHJlbWVkaWF0aW9uIGluc3RydWN0aW9ucy5cbiAgICAgKiovXG4gICAgY29uc3QgZXJyb3IgPVxuICAgICAgICBgVGhlIHByb3ZpZGVkIDxUT0tFTj4gZG9lcyBub3QgaGF2ZSByZXF1aXJlZCBwZXJtaXNzaW9ucyBkdWUgdG8gbWlzc2luZyBzY29wZShzKTogYCArXG4gICAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgICBgVXBkYXRlIHRoZSB0b2tlbiBpbiB1c2UgYXQ6XFxuYCArXG4gICAgICAgIGAgICR7R0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH1cXG5cXG5gICtcbiAgICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHJpZXZlIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLlxuICAgKiovXG4gIHByaXZhdGUgZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCkge1xuICAgIC8vIElmIHRoZSBPQXV0aCBzY29wZXMgaGF2ZSBhbHJlYWR5IGJlZW4gbG9hZGVkLCByZXR1cm4gdGhlIFByb21pc2UgY29udGFpbmluZyB0aGVtLlxuICAgIGlmICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzO1xuICAgIH1cbiAgICAvLyBPQXV0aCBzY29wZXMgYXJlIGxvYWRlZCB2aWEgdGhlIC9yYXRlX2xpbWl0IGVuZHBvaW50IHRvIHByZXZlbnRcbiAgICAvLyB1c2FnZSBvZiBhIHJlcXVlc3QgYWdhaW5zdCB0aGF0IHJhdGVfbGltaXQgZm9yIHRoaXMgbG9va3VwLlxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyA9IHRoaXMuZ2l0aHViLnJhdGVMaW1pdC5nZXQoKS50aGVuKF9yZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IF9yZXNwb25zZSBhcyBSYXRlTGltaXRSZXNwb25zZVdpdGhPQXV0aFNjb3BlSGVhZGVyO1xuICAgICAgY29uc3Qgc2NvcGVzOiBzdHJpbmcgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddIHx8ICcnO1xuICAgICAgcmV0dXJuIHNjb3Blcy5zcGxpdCgnLCcpLm1hcChzY29wZSA9PiBzY29wZS50cmltKCkpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBkZXRlcm1pbmVCYXNlRGlyKCkge1xuICAgIGNvbnN0IHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfSA9IHRoaXMucnVuR3JhY2VmdWwoWydyZXYtcGFyc2UnLCAnLS1zaG93LXRvcGxldmVsJ10pO1xuICAgIGlmIChzdGF0dXMgIT09IDApIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgICAgYFdhcyB0aGUgY29tbWFuZCBydW4gZnJvbSBpbnNpZGUgb2YgdGhlIHJlcG8/XFxuXFxuYCArXG4gICAgICAgICAgYEVSUk9SOlxcbiAke3N0ZGVycn1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0ZG91dC50cmltKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBUYWtlcyB0aGUgb3V0cHV0IGZyb20gYEdpdENsaWVudC5ydW5gIGFuZCBgR2l0Q2xpZW50LnJ1bkdyYWNlZnVsYCBhbmQgcmV0dXJucyBhbiBhcnJheSBvZiBzdHJpbmdzXG4gKiBmb3IgZWFjaCBuZXcgbGluZS4gR2l0IGNvbW1hbmRzIHR5cGljYWxseSByZXR1cm4gbXVsdGlwbGUgb3V0cHV0IHZhbHVlcyBmb3IgYSBjb21tYW5kIGEgc2V0IG9mXG4gKiBzdHJpbmdzIHNlcGFyYXRlZCBieSBuZXcgbGluZXMuXG4gKlxuICogTm90ZTogVGhpcyBpcyBzcGVjaWZpY2FsbHkgY3JlYXRlZCBhcyBhIGxvY2FsbHkgYXZhaWxhYmxlIGZ1bmN0aW9uIGZvciB1c2FnZSBhcyBjb252ZW5pZW5jZVxuICogdXRpbGl0eSB3aXRoaW4gYEdpdENsaWVudGAncyBtZXRob2RzIHRvIGNyZWF0ZSBvdXRwdXRzIGFzIGFycmF5LlxuICovXG5mdW5jdGlvbiBnaXRPdXRwdXRBc0FycmF5KGdpdENvbW1hbmRSZXN1bHQ6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPik6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIGdpdENvbW1hbmRSZXN1bHQuc3Rkb3V0LnNwbGl0KCdcXG4nKS5tYXAoeCA9PiB4LnRyaW0oKSkuZmlsdGVyKHggPT4gISF4KTtcbn1cbiJdfQ==