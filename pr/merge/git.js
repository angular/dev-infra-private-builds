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
        define("@angular/dev-infra-private/pr/merge/git", ["require", "exports", "tslib", "@octokit/rest", "child_process", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GitClient = exports.GitCommandError = exports.GithubApiRequestError = void 0;
    var tslib_1 = require("tslib");
    var Octokit = require("@octokit/rest");
    var child_process_1 = require("child_process");
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
    var GitClient = /** @class */ (function () {
        function GitClient(_projectRoot, _githubToken, _config) {
            this._projectRoot = _projectRoot;
            this._githubToken = _githubToken;
            this._config = _config;
            /** Short-hand for accessing the remote configuration. */
            this.remoteConfig = this._config.remote;
            /** Octokit request parameters object for targeting the configured remote. */
            this.remoteParams = { owner: this.remoteConfig.owner, repo: this.remoteConfig.name };
            /** URL that resolves to the configured repository. */
            this.repoGitUrl = this.remoteConfig.useSsh ?
                "git@github.com:" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git" :
                "https://" + this._githubToken + "@github.com/" + this.remoteConfig.owner + "/" + this.remoteConfig.name + ".git";
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
                            return [4 /*yield*/, this.getAuthScopes()];
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
         * Retrieves the OAuth scopes for the loaded Github token, returning the already retrived
         * list of OAuth scopes if available.
         **/
        GitClient.prototype.getAuthScopes = function () {
            // If the OAuth scopes have already been loaded, return the Promise containing them.
            if (this._oauthScopes) {
                return this._oauthScopes;
            }
            // OAuth scopes are loaded via the /rate_limit endpoint to prevent
            // usage of a request against that rate_limit for this lookup.
            this._oauthScopes = this.api.rateLimit.get().then(function (_response) {
                var response = _response;
                var scopes = response.headers['x-oauth-scopes'] || '';
                return scopes.split(',').map(function (scope) { return scope.trim(); });
            });
            return this._oauthScopes;
        };
        return GitClient;
    }());
    exports.GitClient = GitClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2dpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsdUNBQXlDO0lBQ3pDLCtDQUE0RTtJQUU1RSxvRUFBaUQ7SUFTakQsNENBQTRDO0lBQzVDO1FBQTJDLGlEQUFLO1FBQzlDLCtCQUFtQixNQUFjLEVBQUUsT0FBZTtZQUFsRCxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxTQUNmO1lBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O1FBRWpDLENBQUM7UUFDSCw0QkFBQztJQUFELENBQUMsQUFKRCxDQUEyQyxLQUFLLEdBSS9DO0lBSlksc0RBQXFCO0lBTWxDLHFDQUFxQztJQUNyQztRQUFxQywyQ0FBSztRQUN4Qyx5QkFBWSxNQUFpQixFQUFTLElBQWM7WUFBcEQ7WUFDRSxrRUFBa0U7WUFDbEUsc0VBQXNFO1lBQ3RFLGtFQUFrRTtZQUNsRSxrQkFBTSx5QkFBdUIsTUFBTSxDQUFDLDBCQUEwQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUcsQ0FBQyxTQUNsRjtZQUxxQyxVQUFJLEdBQUosSUFBSSxDQUFVOztRQUtwRCxDQUFDO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBUEQsQ0FBcUMsS0FBSyxHQU96QztJQVBZLDBDQUFlO0lBUzVCO1FBa0JFLG1CQUNZLFlBQW9CLEVBQVUsWUFBb0IsRUFDbEQsT0FBOEI7WUFEOUIsaUJBQVksR0FBWixZQUFZLENBQVE7WUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUNsRCxZQUFPLEdBQVAsT0FBTyxDQUF1QjtZQW5CMUMseURBQXlEO1lBQ3pELGlCQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDbkMsNkVBQTZFO1lBQzdFLGlCQUFZLEdBQUcsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFD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QztnQ0FDMUMsd0ZBQXdGLENBQUM7NEJBRTdGLHNCQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUMsRUFBQzs7OztTQUNoQjtRQUdEOzs7WUFHSTtRQUNJLGlDQUFhLEdBQXJCO1lBQ0Usb0ZBQW9GO1lBQ3BGLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDckIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQzFCO1lBQ0Qsa0VBQWtFO1lBQ2xFLDhEQUE4RDtZQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7Z0JBQ3pELElBQU0sUUFBUSxHQUFHLFNBQWtELENBQUM7Z0JBQ3BFLElBQU0sTUFBTSxHQUFXLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2hFLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDM0IsQ0FBQztRQUNILGdCQUFDO0lBQUQsQ0FBQyxBQTVJRCxJQTRJQztJQTVJWSw4QkFBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtzcGF3blN5bmMsIFNwYXduU3luY09wdGlvbnMsIFNwYXduU3luY1JldHVybnN9IGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuXG5pbXBvcnQge2luZm8sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7TWVyZ2VDb25maWdXaXRoUmVtb3RlfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBHaXRodWIgcmVzcG9uc2UgdHlwZSBleHRlbmRlZCB0byBpbmNsdWRlIHRoZSBgeC1vYXV0aC1zY29wZXNgIGhlYWRlcnMgcHJlc2VuY2UuICovXG50eXBlIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXIgPSBPY3Rva2l0LlJlc3BvbnNlPE9jdG9raXQuUmF0ZUxpbWl0R2V0UmVzcG9uc2U+JntcbiAgaGVhZGVyczogeyd4LW9hdXRoLXNjb3Blcyc6IHN0cmluZ307XG59O1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXRodWIgQVBJIHJlcXVlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaVJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXR1czogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXQgY29tbWFuZHMuICovXG5leHBvcnQgY2xhc3MgR2l0Q29tbWFuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEdpdENsaWVudCwgcHVibGljIGFyZ3M6IHN0cmluZ1tdKSB7XG4gICAgLy8gRXJyb3JzIGFyZSBub3QgZ3VhcmFudGVlZCB0byBiZSBjYXVnaHQuIFRvIGVuc3VyZSB0aGF0IHdlIGRvbid0XG4gICAgLy8gYWNjaWRlbnRhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB0aGF0IG1pZ2h0IGJlIHVzZWQgaW4gYSBjb21tYW5kLFxuICAgIC8vIHdlIHNhbml0aXplIHRoZSBjb21tYW5kIHRoYXQgd2lsbCBiZSBwYXJ0IG9mIHRoZSBlcnJvciBtZXNzYWdlLlxuICAgIHN1cGVyKGBDb21tYW5kIGZhaWxlZDogZ2l0ICR7Y2xpZW50Lm9taXRHaXRodWJUb2tlbkZyb21NZXNzYWdlKGFyZ3Muam9pbignICcpKX1gKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR2l0Q2xpZW50IHtcbiAgLyoqIFNob3J0LWhhbmQgZm9yIGFjY2Vzc2luZyB0aGUgcmVtb3RlIGNvbmZpZ3VyYXRpb24uICovXG4gIHJlbW90ZUNvbmZpZyA9IHRoaXMuX2NvbmZpZy5yZW1vdGU7XG4gIC8qKiBPY3Rva2l0IHJlcXVlc3QgcGFyYW1ldGVycyBvYmplY3QgZm9yIHRhcmdldGluZyB0aGUgY29uZmlndXJlZCByZW1vdGUuICovXG4gIHJlbW90ZVBhcmFtcyA9IHtvd25lcjogdGhpcy5yZW1vdGVDb25maWcub3duZXIsIHJlcG86IHRoaXMucmVtb3RlQ29uZmlnLm5hbWV9O1xuICAvKiogVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgcmVwb0dpdFVybCA9IHRoaXMucmVtb3RlQ29uZmlnLnVzZVNzaCA/XG4gICAgICBgZ2l0QGdpdGh1Yi5jb206JHt0aGlzLnJlbW90ZUNvbmZpZy5vd25lcn0vJHt0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfS5naXRgIDpcbiAgICAgIGBodHRwczovLyR7dGhpcy5fZ2l0aHViVG9rZW59QGdpdGh1Yi5jb20vJHt0aGlzLnJlbW90ZUNvbmZpZy5vd25lcn0vJHtcbiAgICAgICAgICB0aGlzLnJlbW90ZUNvbmZpZy5uYW1lfS5naXRgO1xuICAvKiogSW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgR2l0aHViIG9jdG9raXQgQVBJLiAqL1xuICBhcGk6IE9jdG9raXQ7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9vYXV0aFNjb3BlcyA9IFByb21pc2UucmVzb2x2ZTxzdHJpbmdbXT4oW10pO1xuICAvKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF90b2tlblJlZ2V4ID0gbmV3IFJlZ0V4cCh0aGlzLl9naXRodWJUb2tlbiwgJ2cnKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3Byb2plY3RSb290OiBzdHJpbmcsIHByaXZhdGUgX2dpdGh1YlRva2VuOiBzdHJpbmcsXG4gICAgICBwcml2YXRlIF9jb25maWc6IE1lcmdlQ29uZmlnV2l0aFJlbW90ZSkge1xuICAgIHRoaXMuYXBpID0gbmV3IE9jdG9raXQoe2F1dGg6IF9naXRodWJUb2tlbn0pO1xuICAgIHRoaXMuYXBpLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogRXhlY3V0ZXMgdGhlIGdpdmVuIGdpdCBjb21tYW5kLiBUaHJvd3MgaWYgdGhlIGNvbW1hbmQgZmFpbHMuICovXG4gIHJ1bihhcmdzOiBzdHJpbmdbXSwgb3B0aW9ucz86IFNwYXduU3luY09wdGlvbnMpOiBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLnJ1bkdyYWNlZnVsKGFyZ3MsIG9wdGlvbnMpO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzICE9PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0Q29tbWFuZEVycm9yKHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgICAvLyBPbWl0IGBzdGF0dXNgIGZyb20gdGhlIHR5cGUgc28gdGhhdCBpdCdzIG9idmlvdXMgdGhhdCB0aGUgc3RhdHVzIGlzIG5ldmVyXG4gICAgLy8gbm9uLXplcm8gYXMgZXhwbGFpbmVkIGluIHRoZSBtZXRob2QgZGVzY3JpcHRpb24uXG4gICAgcmV0dXJuIHJlc3VsdCBhcyBPbWl0PFNwYXduU3luY1JldHVybnM8c3RyaW5nPiwgJ3N0YXR1cyc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFNwYXducyBhIGdpdmVuIEdpdCBjb21tYW5kIHByb2Nlc3MuIERvZXMgbm90IHRocm93IGlmIHRoZSBjb21tYW5kIGZhaWxzLiBBZGRpdGlvbmFsbHksXG4gICAqIGlmIHRoZXJlIGlzIGFueSBzdGRlcnIgb3V0cHV0LCB0aGUgb3V0cHV0IHdpbGwgYmUgcHJpbnRlZC4gVGhpcyBtYWtlcyBpdCBlYXNpZXIgdG9cbiAgICogZGVidWcgZmFpbGVkIGNvbW1hbmRzLlxuICAgKi9cbiAgcnVuR3JhY2VmdWwoYXJnczogc3RyaW5nW10sIG9wdGlvbnM6IFNwYXduU3luY09wdGlvbnMgPSB7fSk6IFNwYXduU3luY1JldHVybnM8c3RyaW5nPiB7XG4gICAgLy8gVG8gaW1wcm92ZSB0aGUgZGVidWdnaW5nIGV4cGVyaWVuY2UgaW4gY2FzZSBzb21ldGhpbmcgZmFpbHMsIHdlIHByaW50IGFsbCBleGVjdXRlZFxuICAgIC8vIEdpdCBjb21tYW5kcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCB3YW50IHRvIHByaW50IHRoZSB0b2tlbiBpZiBpcyBjb250YWluZWQgaW4gdGhlXG4gICAgLy8gY29tbWFuZC4gSXQncyBjb21tb24gdG8gc2hhcmUgZXJyb3JzIHdpdGggb3RoZXJzIGlmIHRoZSB0b29sIGZhaWxlZC5cbiAgICBpbmZvKCdFeGVjdXRpbmc6IGdpdCcsIHRoaXMub21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UoYXJncy5qb2luKCcgJykpKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IHNwYXduU3luYygnZ2l0JywgYXJncywge1xuICAgICAgY3dkOiB0aGlzLl9wcm9qZWN0Um9vdCxcbiAgICAgIHN0ZGlvOiAncGlwZScsXG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgLy8gRW5jb2RpbmcgaXMgYWx3YXlzIGB1dGY4YCBhbmQgbm90IG92ZXJyaWRhYmxlLiBUaGlzIGVuc3VyZXMgdGhhdCB0aGlzIG1ldGhvZFxuICAgICAgLy8gYWx3YXlzIHJldHVybnMgYHN0cmluZ2AgYXMgb3V0cHV0IGluc3RlYWQgb2YgYnVmZmVycy5cbiAgICAgIGVuY29kaW5nOiAndXRmOCcsXG4gICAgfSk7XG5cbiAgICBpZiAocmVzdWx0LnN0ZGVyciAhPT0gbnVsbCkge1xuICAgICAgLy8gR2l0IHNvbWV0aW1lcyBwcmludHMgdGhlIGNvbW1hbmQgaWYgaXQgZmFpbGVkLiBUaGlzIG1lYW5zIHRoYXQgaXQgY291bGRcbiAgICAgIC8vIHBvdGVudGlhbGx5IGxlYWsgdGhlIEdpdGh1YiB0b2tlbiB1c2VkIGZvciBhY2Nlc3NpbmcgdGhlIHJlbW90ZS4gVG8gYXZvaWRcbiAgICAgIC8vIHByaW50aW5nIGEgdG9rZW4sIHdlIHNhbml0aXplIHRoZSBzdHJpbmcgYmVmb3JlIHByaW50aW5nIHRoZSBzdGRlcnIgb3V0cHV0LlxuICAgICAgcHJvY2Vzcy5zdGRlcnIud3JpdGUodGhpcy5vbWl0R2l0aHViVG9rZW5Gcm9tTWVzc2FnZShyZXN1bHQuc3RkZXJyKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29udGFpbnMgdGhlIHNwZWNpZmllZCBTSEEuICovXG4gIGhhc0NvbW1pdChicmFuY2hOYW1lOiBzdHJpbmcsIHNoYTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucnVuKFsnYnJhbmNoJywgYnJhbmNoTmFtZSwgJy0tY29udGFpbnMnLCBzaGFdKS5zdGRvdXQgIT09ICcnO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guICovXG4gIGdldEN1cnJlbnRCcmFuY2goKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ydW4oWydyZXYtcGFyc2UnLCAnLS1hYmJyZXYtcmVmJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHdoZXRoZXIgdGhlIGN1cnJlbnQgR2l0IHJlcG9zaXRvcnkgaGFzIHVuY29tbWl0dGVkIGNoYW5nZXMuICovXG4gIGhhc1VuY29tbWl0dGVkQ2hhbmdlcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5ydW5HcmFjZWZ1bChbJ2RpZmYtaW5kZXgnLCAnLS1xdWlldCcsICdIRUFEJ10pLnN0YXR1cyAhPT0gMDtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgb21pdEdpdGh1YlRva2VuRnJvbU1lc3NhZ2UodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fdG9rZW5SZWdleCwgJzxUT0tFTj4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhlIEdpdENsaWVudCBpbnN0YW5jZSBpcyB1c2luZyBhIHRva2VuIHdpdGggcGVybWlzc2lvbnMgZm9yIHRoZSBhbGwgb2YgdGhlXG4gICAqIHByb3ZpZGVkIE9BdXRoIHNjb3Blcy5cbiAgICovXG4gIGFzeW5jIGhhc09hdXRoU2NvcGVzKC4uLnJlcXVlc3RlZFNjb3Blczogc3RyaW5nW10pOiBQcm9taXNlPHRydWV8e2Vycm9yOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBzY29wZXMgPSBhd2FpdCB0aGlzLmdldEF1dGhTY29wZXMoKTtcbiAgICByZXF1ZXN0ZWRTY29wZXMuZm9yRWFjaChzY29wZSA9PiB7XG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcyhzY29wZSkpIHtcbiAgICAgICAgbWlzc2luZ1Njb3Blcy5wdXNoKHNjb3BlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBJZiBubyBtaXNzaW5nIHNjb3BlcyBhcmUgZm91bmQsIHJldHVybiB0cnVlIHRvIGluZGljYXRlIGFsbCBPQXV0aCBTY29wZXMgYXJlIGF2YWlsYWJsZS5cbiAgICBpZiAobWlzc2luZ1Njb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByZWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgICogcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgICAqKi9cbiAgICBjb25zdCBlcnJvciA9XG4gICAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgICAgYCR7eWVsbG93KG1pc3NpbmdTY29wZXMuam9pbignLCAnKSl9XFxuXFxuYCArXG4gICAgICAgIGBVcGRhdGUgdGhlIHRva2VuIGluIHVzZSBhdDpcXG5gICtcbiAgICAgICAgYCAgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vuc1xcblxcbmAgK1xuICAgICAgICBgQWx0ZXJuYXRpdmVseSwgYSBuZXcgdG9rZW4gY2FuIGJlIGNyZWF0ZWQgYXQ6IGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnMvbmV3XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cblxuICAvKipcbiAgICogUmV0cmlldmVzIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLCByZXR1cm5pbmcgdGhlIGFscmVhZHkgcmV0cml2ZWRcbiAgICogbGlzdCBvZiBPQXV0aCBzY29wZXMgaWYgYXZhaWxhYmxlLlxuICAgKiovXG4gIHByaXZhdGUgZ2V0QXV0aFNjb3BlcygpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fb2F1dGhTY29wZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9vYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICB0aGlzLl9vYXV0aFNjb3BlcyA9IHRoaXMuYXBpLnJhdGVMaW1pdC5nZXQoKS50aGVuKF9yZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IF9yZXNwb25zZSBhcyBSYXRlTGltaXRSZXNwb25zZVdpdGhPQXV0aFNjb3BlSGVhZGVyO1xuICAgICAgY29uc3Qgc2NvcGVzOiBzdHJpbmcgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddIHx8ICcnO1xuICAgICAgcmV0dXJuIHNjb3Blcy5zcGxpdCgnLCcpLm1hcChzY29wZSA9PiBzY29wZS50cmltKCkpO1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9vYXV0aFNjb3BlcztcbiAgfVxufVxuIl19