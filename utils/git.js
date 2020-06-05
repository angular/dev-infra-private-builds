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
        define("@angular/dev-infra-private/utils/git", ["require", "exports", "tslib", "@octokit/rest", "child_process", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = exports.GithubApiRequestError = void 0;
    var tslib_1 = require("tslib");
    var Octokit = require("@octokit/rest");
    var child_process_1 = require("child_process");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Error for failed Github API requests. */
    var GithubApiRequestError = /** @class */ (function (_super) {
        tslib_1.__extends(GithubApiRequestError, _super);
        function GithubApiRequestError(status, message) {
            var _this = _super.call(this, message) || this;
            _this.status = status;
            return _this;
        }
        return GithubApiRequestError;
    }(Error));
    exports.GithubApiRequestError = GithubApiRequestError;
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
        function GitClient(_githubToken, _config) {
            if (_githubToken === void 0) { _githubToken = ''; }
            if (_config === void 0) { _config = config_1.getConfig(); }
            this._githubToken = _githubToken;
            this._config = _config;
            /** Short-hand for accessing the remote configuration. */
            this.remoteConfig = this._config.github;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** URL that resolves to the configured repository. */
            this.repoGitUrl = this.remoteConfig.useSsh ?
                "git@github.com:" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git" :
                "https://" + this._githubToken + "@github.com/" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git";
            /** The file path of project's root directory. */
            this._projectRoot = config_1.getRepoBaseDir();
            /** The OAuth scopes available for the provided Github token. */
            this._oauthScopes = Promise.resolve([]);
            /** Regular expression that matches the provided Github token. */
            this._tokenRegex = new RegExp(this._githubToken, 'g');
            this.api = new Octokit({ auth: _githubToken });
            this.api.hook.error('request', function (error) {
                // Wrap API errors in a known error class. This allows us to
                // expect Github API errors better and in a non-ambiguous way.
                throw new GithubApiRequestError(error.status, error.message);
            });
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
         * debug failed commands.
         */
        GitClient.prototype.runGraceful = function (args, options) {
            if (options === void 0) { options = {}; }
            // To improve the debugging experience in case something fails, we print all executed
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
        /** Gets the currently checked out branch. */
        GitClient.prototype.getCurrentBranch = function () {
            return this.run(['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
        };
        /** Gets whether the current Git repository has uncommitted changes. */
        GitClient.prototype.hasUncommittedChanges = function () {
            return this.runGraceful(['diff-index', '--quiet', 'HEAD']).status !== 0;
        };
        /** Whether the repo has any local changes. */
        GitClient.prototype.hasLocalChanges = function () {
            return !!this.runGraceful(['git', 'status', '--porcelain']).stdout.trim();
        };
        /** Sanitizes a given message by omitting the provided Github token if present. */
        GitClient.prototype.omitGithubTokenFromMessage = function (value) {
            return value.replace(this._tokenRegex, '<TOKEN>');
        };
        /**
         * Assert the GitClient instance is using a token with permissions for the all of the
         * provided OAuth scopes.
         */
        GitClient.prototype.hasOauthScopes = function () {
            var requestedScopes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                requestedScopes[_i] = arguments[_i];
            }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var missingScopes, scopes, error;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            missingScopes = [];
                            return [4 /*yield*/, this.getAuthScopesForToken()];
                        case 1:
                            scopes = _a.sent();
                            requestedScopes.forEach(function (scope) {
                                if (!scopes.includes(scope)) {
                                    missingScopes.push(scope);
                                }
                            });
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
         * Retrieves the OAuth scopes for the loaded Github token, returning the already
         * retrieved list of OAuth scopes if available.
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
                    return [2 /*return*/, this._oauthScopes = this.api.rateLimit.get().then(function (_response) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsdUNBQXlDO0lBQ3pDLCtDQUE0RTtJQUU1RSxrRUFBZ0U7SUFDaEUsb0VBQXVDO0lBUXZDLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQyxxQ0FBcUM7SUFDckM7UUFBcUMsMkNBQUs7UUFDeEMseUJBQVksTUFBaUIsRUFBUyxJQUFjO1lBQXBEO1lBQ0Usa0VBQWtFO1lBQ2xFLHNFQUFzRTtZQUN0RSxrRUFBa0U7WUFDbEUsa0JBQU0seUJBQXVCLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUMsU0FDbEY7WUFMcUMsVUFBSSxHQUFKLElBQUksQ0FBVTs7UUFLcEQsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQVBELENBQXFDLEtBQUssR0FPekM7SUFQWSwwQ0FBZTtJQVM1Qjs7Ozs7Ozs7UUFRSTtJQUNKO1FBb0JFLG1CQUNZLFlBQWlCLEVBQVUsT0FBa0Q7WUFBN0UsNkJBQUEsRUFBQSxpQkFBaUI7WUFBVSx3QkFBQSxFQUFBLFVBQXVDLGtCQUFTLEVBQUU7WUFBN0UsaUJBQVksR0FBWixZQUFZLENBQUs7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUEyQztZQXBCekYseURBQXlEO1lBQ3pELGlCQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDbkMsNkVBQTZF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Z2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBnZXRSZXBvQmFzZURpciwgTmdEZXZDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7aW5mbywgeWVsbG93fSBmcm9tICcuL2NvbnNvbGUnO1xuXG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXRodWIgQVBJIHJlcXVlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaVJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXR1czogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50Lm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbW1vbiBjbGllbnQgZm9yIHBlcmZvcm1pbmcgR2l0IGludGVyYWN0aW9ucy5cbiAqXG4gKiBUYWtlcyBpbiB0d28gb3B0aW9uYWwgYXJndWVtZW50czpcbiAqICAgX2dpdGh1YlRva2VuOiB0aGUgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGlmYXRpb24gaW4gZ2l0aHViIGludGVyYWN0aW9ucywgYnkgZGVmYXVsdCBlbXB0eVxuICogICAgIGFsbG93aW5nIHJlYWRvbmx5IGFjdGlvbnMuXG4gKiAgIF9jb25maWc6IFRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBjb250YWluaW5nIEdpdENsaWVudENvbmZpZyBpbmZvcm1hdGlvbiwgYnkgZGVmYXVsdFxuICogICAgIGxvYWRzIHRoZSBjb25maWcgZnJvbSB0aGUgZGVmYXVsdCBsb2NhdGlvbi5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVtb3RlQ29uZmlnID0gdGhpcy5fY29uZmlnLmdpdGh1YjtcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICByZXBvR2l0VXJsID0gdGhpcy5yZW1vdGVDb25maWcudXNlU3NoID9cbiAgICAgIGBnaXRAZ2l0aHViLmNvbToke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke3RoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGAgOlxuICAgICAgYGh0dHBzOi8vJHt0aGlzLl9naXRodWJUb2tlbn1AZ2l0aHViLmNvbS8ke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke1xuICAgICAgICAgIHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGA7XG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRodWIgb2N0b2tpdCBBUEkuICovXG4gIGFwaTogT2N0b2tpdDtcblxuICAvKiogVGhlIGZpbGUgcGF0aCBvZiBwcm9qZWN0J3Mgcm9vdCBkaXJlY3RvcnkuICovXG4gIHByaXZhdGUgX3Byb2plY3RSb290ID0gZ2V0UmVwb0Jhc2VEaXIoKTtcbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9vYXV0aFNjb3BlcyA9IFByb21pc2UucmVzb2x2ZTxzdHJpbmdbXT4oW10pO1xuICAvKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF90b2tlblJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLl9naXRodWJUb2tlbiwgJ2cnKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2dpdGh1YlRva2VuID0gJycsIHByaXZhdGUgX2NvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCkpIHtcbiAgICB0aGlzLmFwaSA9IG5ldyBPY3Rva2l0KHthdXRoOiBfZ2l0aHViVG9rZW59KTtcbiAgICB0aGlzLmFwaS5ob29rLmVycm9yKCdyZXF1ZXN0JywgZXJyb3IgPT4ge1xuICAgICAgLy8gV3JhcCBBUEkgZXJyb3JzIGluIGEga25vd24gZXJyb3IgY2xhc3MuIFRoaXMgYWxsb3dzIHVzIHRvXG4gICAgICAvLyBleHBlY3QgR2l0aHViIEFQSSBlcnJvcnMgYmV0dGVyIGFuZCBpbiBhIG5vbi1hbWJpZ3VvdXMgd2F5LlxuICAgICAgdGhyb3cgbmV3IEdpdGh1YkFwaVJlcXVlc3RFcnJvcihlcnJvci5zdGF0dXMsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGVzIHRoZSBnaXZlbiBnaXQgY29tbWFuZC4gVGhyb3dzIGlmIHRoZSBjb21tYW5kIGZhaWxzLiAqL1xuICBydW4oYXJnczogc3RyaW5nW10sIG9wdGlvbnM/OiBTcGF3blN5bmNPcHRpb25zKTogT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPiB7XG4gICAgY29uc3QgcmVzdWx0ID0gdGhpcy5ydW5HcmFjZWZ1bChhcmdzLCBvcHRpb25zKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyAhPT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEdpdENvbW1hbmRFcnJvcih0aGlzLCBhcmdzKTtcbiAgICB9XG4gICAgLy8gT21pdCBgc3RhdHVzYCBmcm9tIHRoZSB0eXBlIHNvIHRoYXQgaXQncyBvYnZpb3VzIHRoYXQgdGhlIHN0YXR1cyBpcyBuZXZlclxuICAgIC8vIG5vbi16ZXJvIGFzIGV4cGxhaW5lZCBpbiB0aGUgbWV0aG9kIGRlc2NyaXB0aW9uLlxuICAgIHJldHVybiByZXN1bHQgYXMgT21pdDxTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4sICdzdGF0dXMnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBTcGF3bnMgYSBnaXZlbiBHaXQgY29tbWFuZCBwcm9jZXNzLiBEb2VzIG5vdCB0aHJvdyBpZiB0aGUgY29tbWFuZCBmYWlscy4gQWRkaXRpb25hbGx5LFxuICAgKiBpZiB0aGVyZSBpcyBhbnkgc3RkZXJyIG91dHB1dCwgdGhlIG91dHB1dCB3aWxsIGJlIHByaW50ZWQuIFRoaXMgbWFrZXMgaXQgZWFzaWVyIHRvXG4gICAqIGRlYnVnIGZhaWxlZCBjb21tYW5kcy5cbiAgICovXG4gIHJ1bkdyYWNlZnVsKGFyZ3M6IHN0cmluZ1tdLCBvcHRpb25zOiBTcGF3blN5bmNPcHRpb25zID0ge30pOiBTcGF3blN5bmNSZXR1cm5zPHN0cmluZz4ge1xuICAgIC8vIFRvIGltcHJvdmUgdGhlIGRlYnVnZ2luZyBleHBlcmllbmNlIGluIGNhc2Ugc29tZXRoaW5nIGZhaWxzLCB3ZSBwcmludCBhbGwgZXhlY3V0ZWRcbiAgICAvLyBHaXQgY29tbWFuZHMuIE5vdGUgdGhhdCB3ZSBkbyBub3Qgd2FudCB0byBwcmludCB0aGUgdG9rZW4gaWYgaXMgY29udGFpbmVkIGluIHRoZVxuICAgIC8vIGNvbW1hbmQuIEl0J3MgY29tbW9uIHRvIHNoYXJlIGVycm9ycyB3aXRoIG90aGVycyBpZiB0aGUgdG9vbCBmYWlsZWQuXG4gICAgaW5mbygnRXhlY3V0aW5nOiBnaXQnLCB0aGlzLm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKSk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBzcGF3blN5bmMoJ2dpdCcsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5fcHJvamVjdFJvb3QsXG4gICAgICBzdGRpbzogJ3BpcGUnLFxuICAgICAgLi4ub3B0aW9ucyxcbiAgICAgIC8vIEVuY29kaW5nIGlzIGFsd2F5cyBgdXRmOGAgYW5kIG5vdCBvdmVycmlkYWJsZS4gVGhpcyBlbnN1cmVzIHRoYXQgdGhpcyBtZXRob2RcbiAgICAgIC8vIGFsd2F5cyByZXR1cm5zIGBzdHJpbmdgIGFzIG91dHB1dCBpbnN0ZWFkIG9mIGJ1ZmZlcnMuXG4gICAgICBlbmNvZGluZzogJ3V0ZjgnLFxuICAgIH0pO1xuXG4gICAgaWYgKHJlc3VsdC5zdGRlcnIgIT09IG51bGwpIHtcbiAgICAgIC8vIEdpdCBzb21ldGltZXMgcHJpbnRzIHRoZSBjb21tYW5kIGlmIGl0IGZhaWxlZC4gVGhpcyBtZWFucyB0aGF0IGl0IGNvdWxkXG4gICAgICAvLyBwb3RlbnRpYWxseSBsZWFrIHRoZSBHaXRodWIgdG9rZW4gdXNlZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUuIFRvIGF2b2lkXG4gICAgICAvLyBwcmludGluZyBhIHRva2VuLCB3ZSBzYW5pdGl6ZSB0aGUgc3RyaW5nIGJlZm9yZSBwcmludGluZyB0aGUgc3RkZXJyIG91dHB1dC5cbiAgICAgIHByb2Nlc3Muc3RkZXJyLndyaXRlKHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UocmVzdWx0LnN0ZGVycikpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvbnRhaW5zIHRoZSBzcGVjaWZpZWQgU0hBLiAqL1xuICBoYXNDb21taXQoYnJhbmNoTmFtZTogc3RyaW5nLCBzaGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnJ1bihbJ2JyYW5jaCcsIGJyYW5jaE5hbWUsICctLWNvbnRhaW5zJywgc2hhXSkuc3Rkb3V0ICE9PSAnJztcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuICBnZXRDdXJyZW50QnJhbmNoKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsncmV2LXBhcnNlJywgJy0tYWJicmV2LXJlZicsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKiogR2V0cyB3aGV0aGVyIHRoZSBjdXJyZW50IEdpdCByZXBvc2l0b3J5IGhhcyB1bmNvbW1pdHRlZCBjaGFuZ2VzLiAqL1xuICBoYXNVbmNvbW1pdHRlZENoYW5nZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuR3JhY2VmdWwoWydkaWZmLWluZGV4JywgJy0tcXVpZXQnLCAnSEVBRCddKS5zdGF0dXMgIT09IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGUgcmVwbyBoYXMgYW55IGxvY2FsIGNoYW5nZXMuICovXG4gIGhhc0xvY2FsQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnJ1bkdyYWNlZnVsKFsnZ2l0JywgJ3N0YXR1cycsICctLXBvcmNlbGFpbiddKS5zdGRvdXQudHJpbSgpO1xuICB9XG5cbiAgLyoqIFNhbml0aXplcyBhIGdpdmVuIG1lc3NhZ2UgYnkgb21pdHRpbmcgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbiBpZiBwcmVzZW50LiAqL1xuICBvbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl90b2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXMoLi4ucmVxdWVzdGVkU2NvcGVzOiBzdHJpbmdbXSk6IFByb21pc2U8dHJ1ZXx7ZXJyb3I6IHN0cmluZ30+IHtcbiAgICBjb25zdCBtaXNzaW5nU2NvcGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuZ2V0QXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgcmVxdWVzdGVkU2NvcGVzLmZvckVhY2goc2NvcGUgPT4ge1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoc2NvcGUpKSB7XG4gICAgICAgIG1pc3NpbmdTY29wZXMucHVzaChzY29wZSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gSWYgbm8gbWlzc2luZyBzY29wZXMgYXJlIGZvdW5kLCByZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhbGwgT0F1dGggU2NvcGVzIGFyZSBhdmFpbGFibGUuXG4gICAgaWYgKG1pc3NpbmdTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmVjb25zdHJ1Y3RlZCBlcnJvciBtZXNzYWdlIHRvIGxvZyB0byB0aGUgdXNlciwgcHJvdmlkaW5nIG1pc3Npbmcgc2NvcGVzIGFuZFxuICAgICAqIHJlbWVkaWF0aW9uIGluc3RydWN0aW9ucy5cbiAgICAgKiovXG4gICAgY29uc3QgZXJyb3IgPVxuICAgICAgICBgVGhlIHByb3ZpZGVkIDxUT0tFTj4gZG9lcyBub3QgaGF2ZSByZXF1aXJlZCBwZXJtaXNzaW9ucyBkdWUgdG8gbWlzc2luZyBzY29wZShzKTogYCArXG4gICAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgICBgVXBkYXRlIHRoZSB0b2tlbiBpbiB1c2UgYXQ6XFxuYCArXG4gICAgICAgIGAgIGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNcXG5cXG5gICtcbiAgICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zL25ld1xcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJldHJpZXZlcyB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbiwgcmV0dXJuaW5nIHRoZSBhbHJlYWR5XG4gICAqIHJldHJpZXZlZCBsaXN0IG9mIE9BdXRoIHNjb3BlcyBpZiBhdmFpbGFibGUuXG4gICAqKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX29hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fb2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX29hdXRoU2NvcGVzID0gdGhpcy5hcGkucmF0ZUxpbWl0LmdldCgpLnRoZW4oX3Jlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gX3Jlc3BvbnNlIGFzIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXI7XG4gICAgICBjb25zdCBzY29wZXM6IHN0cmluZyA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtb2F1dGgtc2NvcGVzJ10gfHwgJyc7XG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSk7XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==