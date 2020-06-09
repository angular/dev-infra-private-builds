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
            this._oauthScopes = null;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsdUNBQXlDO0lBQ3pDLCtDQUE0RTtJQUU1RSxrRUFBZ0U7SUFDaEUsb0VBQXVDO0lBUXZDLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQyxxQ0FBcUM7SUFDckM7UUFBcUMsMkNBQUs7UUFDeEMseUJBQVksTUFBaUIsRUFBUyxJQUFjO1lBQXBEO1lBQ0Usa0VBQWtFO1lBQ2xFLHNFQUFzRTtZQUN0RSxrRUFBa0U7WUFDbEUsa0JBQU0seUJBQXVCLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFHLENBQUMsU0FDbEY7WUFMcUMsVUFBSSxHQUFKLElBQUksQ0FBVTs7UUFLcEQsQ0FBQztRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQVBELENBQXFDLEtBQUssR0FPekM7SUFQWSwwQ0FBZTtJQVM1Qjs7Ozs7Ozs7UUFRSTtJQUNKO1FBb0JFLG1CQUNZLFlBQWlCLEVBQVUsT0FBa0Q7WUFBN0UsNkJBQUEsRUFBQSxpQkFBaUI7WUFBVSx3QkFBQSxFQUFBLFVBQXVDLGtCQUFTLEVBQUU7WUFBN0UsaUJBQVksR0FBWixZQUFZLENBQUs7WUFBVSxZQUFPLEdBQVAsT0FBTyxDQUEyQztZQXBCekYseURBQXlEO1lBQ3pELGlCQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDbkMsNkVBQTZF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QkFDSCxDQUFDLENBQUMsQ0FBQzs0QkFDSCwwRkFBMEY7NEJBQzFGLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0NBQzlCLHNCQUFPLElBQUksRUFBQzs2QkFDYjs0QkFNSyxLQUFLLEdBQ1AsbUZBQW1GO2lDQUNoRixnQkFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBTSxDQUFBO2dDQUN6QywrQkFBK0I7Z0NBQy9CLDBDQUEwQztnQ0FDMUMsd0ZBQXdGLENBQUM7NEJBRTdGLHNCQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUMsRUFBQzs7OztTQUNoQjtRQUdEOzs7WUFHSTtRQUNVLHlDQUFxQixHQUFuQzs7O29CQUNFLG9GQUFvRjtvQkFDcEYsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRTt3QkFDOUIsc0JBQU8sSUFBSSxDQUFDLFlBQVksRUFBQztxQkFDMUI7b0JBQ0Qsa0VBQWtFO29CQUNsRSw4REFBOEQ7b0JBQzlELHNCQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsU0FBUzs0QkFDaEUsSUFBTSxRQUFRLEdBQUcsU0FBa0QsQ0FBQzs0QkFDcEUsSUFBTSxNQUFNLEdBQVcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQzs0QkFDaEUsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQzt3QkFDdEQsQ0FBQyxDQUFDLEVBQUM7OztTQUNKO1FBQ0gsZ0JBQUM7SUFBRCxDQUFDLEFBakpELElBaUpDO0lBakpZLDhCQUFTIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3NwYXduU3luYywgU3Bhd25TeW5jT3B0aW9ucywgU3Bhd25TeW5jUmV0dXJuc30gZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBnZXRSZXBvQmFzZURpciwgTmdEZXZDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7aW5mbywgeWVsbG93fSBmcm9tICcuL2NvbnNvbGUnO1xuXG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXRodWIgQVBJIHJlcXVlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaVJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXR1czogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50Lm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbW1vbiBjbGllbnQgZm9yIHBlcmZvcm1pbmcgR2l0IGludGVyYWN0aW9ucy5cbiAqXG4gKiBUYWtlcyBpbiB0d28gb3B0aW9uYWwgYXJndWVtZW50czpcbiAqICAgX2dpdGh1YlRva2VuOiB0aGUgdG9rZW4gdXNlZCBmb3IgYXV0aGVudGlmYXRpb24gaW4gZ2l0aHViIGludGVyYWN0aW9ucywgYnkgZGVmYXVsdCBlbXB0eVxuICogICAgIGFsbG93aW5nIHJlYWRvbmx5IGFjdGlvbnMuXG4gKiAgIF9jb25maWc6IFRoZSBkZXYtaW5mcmEgY29uZmlndXJhdGlvbiBjb250YWluaW5nIEdpdENsaWVudENvbmZpZyBpbmZvcm1hdGlvbiwgYnkgZGVmYXVsdFxuICogICAgIGxvYWRzIHRoZSBjb25maWcgZnJvbSB0aGUgZGVmYXVsdCBsb2NhdGlvbi5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRDbGllbnQge1xuICAvKiogU2hvcnQtaGFuZCBmb3IgYWNjZXNzaW5nIHRoZSByZW1vdGUgY29uZmlndXJhdGlvbi4gKi9cbiAgcmVtb3RlQ29uZmlnID0gdGhpcy5fY29uZmlnLmdpdGh1YjtcbiAgLyoqIE9jdG9raXQgcmVxdWVzdCBwYXJhbWV0ZXJzIG9iamVjdCBmb3IgdGFyZ2V0aW5nIHRoZSBjb25maWd1cmVkIHJlbW90ZS4gKi9cbiAgcmVtb3RlUGFyYW1zID0ge293bmVyOiB0aGlzLnJlbW90ZUNvbmZpZy5vd25lciwgcmVwbzogdGhpcy5yZW1vdGVDb25maWcubmFtZX07XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICByZXBvR2l0VXJsID0gdGhpcy5yZW1vdGVDb25maWcudXNlU3NoID9cbiAgICAgIGBnaXRAZ2l0aHViLmNvbToke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke3RoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGAgOlxuICAgICAgYGh0dHBzOi8vJHt0aGlzLl9naXRodWJUb2tlbn1AZ2l0aHViLmNvbS8ke3RoaXMucmVtb3RlQ29uZmlnLm93bmVyfS8ke1xuICAgICAgICAgIHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9LmdpdGA7XG4gIC8qKiBJbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBHaXRodWIgb2N0b2tpdCBBUEkuICovXG4gIGFwaTogT2N0b2tpdDtcblxuICAvKiogVGhlIGZpbGUgcGF0aCBvZiBwcm9qZWN0J3Mgcm9vdCBkaXJlY3RvcnkuICovXG4gIHByaXZhdGUgX3Byb2plY3RSb290ID0gZ2V0UmVwb0Jhc2VEaXIoKTtcbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9vYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG4gIC8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX3Rva2VuUmVnZXggPSBuZXcgUmVnRXhwKHRoaXMuX2dpdGh1YlRva2VuLCAnZycpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfZ2l0aHViVG9rZW4gPSAnJywgcHJpdmF0ZSBfY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAgIHRoaXMuYXBpID0gbmV3IE9jdG9raXQoe2F1dGg6IF9naXRodWJUb2tlbn0pO1xuICAgIHRoaXMuYXBpLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRXhlY3V0ZXMgdGhlIGdpdmVuIGdpdCBjb21tYW5kLiBUaHJvd3MgaWYgdGhlIGNvbW1hbmQgZmFpbHMuICovXG4gIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnMpOiBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJ1bkdyYWNlZnVsKGFyZ3MsIG9wdGlvbnMpO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0Q29tbWFuZEVycm9yKHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICAvLyBPbWl0IGBzdGF0dXNgIGZyb20gdGhlIHR5cGUgc28gdGhhdCBpdCdzIG9idmlvdXMgdGhhdCB0aGUgc3RhdHVzIGlzIG5ldmVyXG4gICAgLy8gbm9uLXplcm8gYXMgZXhwbGFpbmVkIGluIHRoZSBtZXRob2QgZGVzY3JpcHRpb24uXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNwYXducyBhIGdpdmVuIEdpdCBjb21tYW5kIHByb2Nlc3MuIERvZXMgbm90IHRocm93IGlmIHRoZSBjb21tYW5kIGZhaWxzLiBBZGRpdGlvbmFsbHksXG4gICAqIGlmIHRoZXJlIGlzIGFueSBzdGRlcnIgb3V0cHV0LCB0aGUgb3V0cHV0IHdpbGwgYmUgcHJpbnRlZC4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICogZGVidWcgZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduU3luY09wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZFxuICAgIC8vIEdpdCBjb21tYW5kcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCB3YW50IHRvIHByaW50IHRoZSB0b2tlbiBpZiBpcyBjb250YWluZWQgaW4gdGhlXG4gICAgLy8gY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGggb3RoZXJzIGlmIHRoZSB0b29sIGZhaWxlZC5cbiAgICBpbmZvKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYygnZ2l0JywgYXJncywge1xuICAgICAgY3dkOiB0aGlzLl9wcm9qZWN0Um9vdCxcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShyZXN1bHQuc3RkZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guICovXG4gIGdldEN1cnJlbnRCcmFuY2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSByZXBvIGhhcyBhbnkgbG9jYWwgY2hhbmdlcy4gKi9cbiAgaGFzTG9jYWxDaGFuZ2VzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMucnVuR3JhY2VmdWwoWydnaXQnLCAnc3RhdHVzJywgJy0tcG9yY2VsYWluJ10pLnN0ZG91dC50cmltKCk7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX3Rva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBHaXRDbGllbnQgaW5zdGFuY2UgaXMgdXNpbmcgYSB0b2tlbiB3aXRoIHBlcm1pc3Npb25zIGZvciB0aGUgYWxsIG9mIHRoZVxuICAgKiBwcm92aWRlZCBPQXV0aCBzY29wZXMuXG4gICAqL1xuICBhc3luYyBoYXNPYXV0aFNjb3BlcyguLi5yZXF1ZXN0ZWRTY29wZXM6IHN0cmluZ1tdKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IG1pc3NpbmdTY29wZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3Qgc2NvcGVzID0gYXdhaXQgdGhpcy5nZXRBdXRoU2NvcGVzRm9yVG9rZW4oKTtcbiAgICByZXF1ZXN0ZWRTY29wZXMuZm9yRWFjaChzY29wZSA9PiB7XG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcyhzY29wZSkpIHtcbiAgICAgICAgbWlzc2luZ1Njb3Blcy5wdXNoKHNjb3BlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBJZiBubyBtaXNzaW5nIHNjb3BlcyBhcmUgZm91bmQsIHJldHVybiB0cnVlIHRvIGluZGljYXRlIGFsbCBPQXV0aCBTY29wZXMgYXJlIGF2YWlsYWJsZS5cbiAgICBpZiAobWlzc2luZ1Njb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgICogcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgICAqKi9cbiAgICBjb25zdCBlcnJvciA9XG4gICAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgICAgYCR7eWVsbG93KG1pc3NpbmdTY29wZXMuam9pbignLCAnKSl9XFxuXFxuYCArXG4gICAgICAgIGBVcGRhdGUgdGhlIHRva2VuIGluIHVzZSBhdDpcXG5gICtcbiAgICAgICAgYCAgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc1xcblxcbmAgK1xuICAgICAgICBgQWx0ZXJuYXRpdmVseSwgYSBuZXcgdG9rZW4gY2FuIGJlIGNyZWF0ZWQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnMvbmV3XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLCByZXR1cm5pbmcgdGhlIGFscmVhZHlcbiAgICogcmV0cmlldmVkIGxpc3Qgb2YgT0F1dGggc2NvcGVzIGlmIGF2YWlsYWJsZS5cbiAgICoqL1xuICBwcml2YXRlIGFzeW5jIGdldEF1dGhTY29wZXNGb3JUb2tlbigpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fb2F1dGhTY29wZXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICByZXR1cm4gdGhpcy5fb2F1dGhTY29wZXMgPSB0aGlzLmFwaS5yYXRlTGltaXQuZ2V0KCkudGhlbihfcmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBfcmVzcG9uc2UgYXMgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlcjtcbiAgICAgIGNvbnN0IHNjb3Blczogc3RyaW5nID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXSB8fCAnJztcbiAgICAgIHJldHVybiBzY29wZXMuc3BsaXQoJywnKS5tYXAoc2NvcGUgPT4gc2NvcGUudHJpbSgpKTtcbiAgICB9KTtcbiAgfVxufVxuIl19