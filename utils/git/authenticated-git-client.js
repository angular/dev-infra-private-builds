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
        define("@angular/dev-infra-private/utils/git/authenticated-git-client", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/utils/git/github", "@angular/dev-infra-private/utils/git/github-urls"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthenticatedGitClient = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var github_1 = require("@angular/dev-infra-private/utils/git/github");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    /**
     * Extension of the `GitClient` with additional utilities which are useful for
     * authenticated Git client instances.
     */
    var AuthenticatedGitClient = /** @class */ (function (_super) {
        tslib_1.__extends(AuthenticatedGitClient, _super);
        function AuthenticatedGitClient(githubToken, baseDir, config) {
            var _this = _super.call(this, baseDir, config) || this;
            _this.githubToken = githubToken;
            /**
             * Regular expression that matches the provided Github token. Used for
             * sanitizing the token from Git child process output.
             */
            _this._githubTokenRegex = new RegExp(_this.githubToken, 'g');
            /** The OAuth scopes available for the provided Github token. */
            _this._cachedOauthScopes = null;
            /** Instance of an authenticated github client. */
            _this.github = new github_1.AuthenticatedGithubClient(_this.githubToken);
            return _this;
        }
        /** Sanitizes a given message by omitting the provided Github token if present. */
        AuthenticatedGitClient.prototype.sanitizeConsoleOutput = function (value) {
            return value.replace(this._githubTokenRegex, '<TOKEN>');
        };
        /** Git URL that resolves to the configured repository. */
        AuthenticatedGitClient.prototype.getRepoGitUrl = function () {
            return github_urls_1.getRepositoryGitUrl(this.remoteConfig, this.githubToken);
        };
        /**
         * Assert the GitClient instance is using a token with permissions for the all of the
         * provided OAuth scopes.
         */
        AuthenticatedGitClient.prototype.hasOauthScopes = function (testFn) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var scopes, missingScopes, error;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._fetchAuthScopesForToken()];
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
        /** Fetch the OAuth scopes for the loaded Github token. */
        AuthenticatedGitClient.prototype._fetchAuthScopesForToken = function () {
            // If the OAuth scopes have already been loaded, return the Promise containing them.
            if (this._cachedOauthScopes !== null) {
                return this._cachedOauthScopes;
            }
            // OAuth scopes are loaded via the /rate_limit endpoint to prevent
            // usage of a request against that rate_limit for this lookup.
            return this._cachedOauthScopes = this.github.rateLimit.get().then(function (response) {
                var scopes = response.headers['x-oauth-scopes'];
                // If no token is provided, or if the Github client is authenticated incorrectly,
                // the `x-oauth-scopes` response header is not set. We error in such cases as it
                // signifies a faulty  of the
                if (scopes === undefined) {
                    throw Error('Unable to retrieve OAuth scopes for token provided to Git client.');
                }
                return scopes.split(',').map(function (scope) { return scope.trim(); }).filter(function (scope) { return scope !== ''; });
            });
        };
        /**
         * Static method to get the singleton instance of the `AuthenticatedGitClient`,
         * creating it if it has not yet been created.
         */
        AuthenticatedGitClient.get = function () {
            if (!AuthenticatedGitClient._authenticatedInstance) {
                throw new Error('No instance of `AuthenticatedGitClient` has been set up yet.');
            }
            return AuthenticatedGitClient._authenticatedInstance;
        };
        /** Configures an authenticated git client. */
        AuthenticatedGitClient.configure = function (token) {
            if (AuthenticatedGitClient._authenticatedInstance) {
                throw Error('Unable to configure `AuthenticatedGitClient` as it has been configured already.');
            }
            AuthenticatedGitClient._authenticatedInstance = new AuthenticatedGitClient(token);
        };
        return AuthenticatedGitClient;
    }(git_client_1.GitClient));
    exports.AuthenticatedGitClient = AuthenticatedGitClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILG9FQUFrQztJQUVsQyw4RUFBdUM7SUFDdkMsc0VBQW1EO0lBQ25ELGdGQUF3RztJQUt4Rzs7O09BR0c7SUFDSDtRQUE0QyxrREFBUztRQWFuRCxnQ0FBK0IsV0FBbUIsRUFBRSxPQUFnQixFQUFFLE1BQW9CO1lBQTFGLFlBQ0Usa0JBQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxTQUN2QjtZQUY4QixpQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQVpsRDs7O2VBR0c7WUFDYyx1QkFBaUIsR0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRS9FLGdFQUFnRTtZQUN4RCx3QkFBa0IsR0FBMkIsSUFBSSxDQUFDO1lBRTFELGtEQUFrRDtZQUNoQyxZQUFNLEdBQUcsSUFBSSxrQ0FBeUIsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O1FBSTNFLENBQUM7UUFFRCxrRkFBa0Y7UUFDekUsc0RBQXFCLEdBQTlCLFVBQStCLEtBQWE7WUFDMUMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsMERBQTBEO1FBQ2pELDhDQUFhLEdBQXRCO1lBQ0UsT0FBTyxpQ0FBbUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBRUQ7OztXQUdHO1FBQ0csK0NBQWMsR0FBcEIsVUFBcUIsTUFBOEI7Ozs7O2dDQUNsQyxxQkFBTSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsRUFBQTs7NEJBQTlDLE1BQU0sR0FBRyxTQUFxQzs0QkFDOUMsYUFBYSxHQUFhLEVBQUUsQ0FBQzs0QkFDbkMscURBQXFEOzRCQUNyRCxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDOzRCQUM5QiwwRkFBMEY7NEJBQzFGLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0NBQzlCLHNCQUFPLElBQUksRUFBQzs2QkFDYjs0QkFJSyxLQUFLLEdBQ1AsbUZBQW1GO2lDQUNoRixnQkFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBTSxDQUFBO2dDQUN6QywrQkFBK0I7aUNBQy9CLE9BQUssdUNBQXlCLFNBQU0sQ0FBQTtpQ0FDcEMsbURBQWlELHVDQUF5QixPQUFJLENBQUEsQ0FBQzs0QkFFbkYsc0JBQU8sRUFBQyxLQUFLLE9BQUEsRUFBQyxFQUFDOzs7O1NBQ2hCO1FBRUQsMERBQTBEO1FBQ2xELHlEQUF3QixHQUFoQztZQUNFLG9GQUFvRjtZQUNwRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7Z0JBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO2FBQ2hDO1lBQ0Qsa0VBQWtFO1lBQ2xFLDhEQUE4RDtZQUM5RCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO2dCQUN4RSxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBRWxELGlGQUFpRjtnQkFDakYsZ0ZBQWdGO2dCQUNoRiw2QkFBNkI7Z0JBQzdCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtvQkFDeEIsTUFBTSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQztpQkFDbEY7Z0JBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLEtBQUssRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDO1lBQ3BGLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUtEOzs7V0FHRztRQUNhLDBCQUFHLEdBQW5CO1lBQ0UsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO2dCQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7YUFDakY7WUFDRCxPQUFPLHNCQUFzQixDQUFDLHNCQUFzQixDQUFDO1FBQ3ZELENBQUM7UUFFRCw4Q0FBOEM7UUFDdkMsZ0NBQVMsR0FBaEIsVUFBaUIsS0FBYTtZQUM1QixJQUFJLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO2dCQUNqRCxNQUFNLEtBQUssQ0FDUCxpRkFBaUYsQ0FBQyxDQUFDO2FBQ3hGO1lBQ0Qsc0JBQXNCLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwRixDQUFDO1FBQ0gsNkJBQUM7SUFBRCxDQUFDLEFBakdELENBQTRDLHNCQUFTLEdBaUdwRDtJQWpHWSx3REFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ0RldkNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7eWVsbG93fSBmcm9tICcuLi9jb25zb2xlJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0LWNsaWVudCc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnR9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7Z2V0UmVwb3NpdG9yeUdpdFVybCwgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCwgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBEZXNjcmliZXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHRlc3QgZm9yIGdpdmVuIEdpdGh1YiBPQXV0aCBzY29wZXMuICovXG5leHBvcnQgdHlwZSBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uID0gKHNjb3Blczogc3RyaW5nW10sIG1pc3Npbmc6IHN0cmluZ1tdKSA9PiB2b2lkO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgYEdpdENsaWVudGAgd2l0aCBhZGRpdGlvbmFsIHV0aWxpdGllcyB3aGljaCBhcmUgdXNlZnVsIGZvclxuICogYXV0aGVudGljYXRlZCBHaXQgY2xpZW50IGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQgZXh0ZW5kcyBHaXRDbGllbnQge1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAodGhpcy5naXRodWJUb2tlbiwgJ2cnKTtcblxuICAvKiogVGhlIE9BdXRoIHNjb3BlcyBhdmFpbGFibGUgZm9yIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2NhY2hlZE9hdXRoU2NvcGVzOiBQcm9taXNlPHN0cmluZ1tdPnxudWxsID0gbnVsbDtcblxuICAvKiogSW5zdGFuY2Ugb2YgYW4gYXV0aGVudGljYXRlZCBnaXRodWIgY2xpZW50LiAqL1xuICBvdmVycmlkZSByZWFkb25seSBnaXRodWIgPSBuZXcgQXV0aGVudGljYXRlZEdpdGh1YkNsaWVudCh0aGlzLmdpdGh1YlRva2VuKTtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IocmVhZG9ubHkgZ2l0aHViVG9rZW46IHN0cmluZywgYmFzZURpcj86IHN0cmluZywgY29uZmlnPzogTmdEZXZDb25maWcpIHtcbiAgICBzdXBlcihiYXNlRGlyLCBjb25maWcpO1xuICB9XG5cbiAgLyoqIFNhbml0aXplcyBhIGdpdmVuIG1lc3NhZ2UgYnkgb21pdHRpbmcgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbiBpZiBwcmVzZW50LiAqL1xuICBvdmVycmlkZSBzYW5pdGl6ZUNvbnNvbGVPdXRwdXQodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fZ2l0aHViVG9rZW5SZWdleCwgJzxUT0tFTj4nKTtcbiAgfVxuXG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgb3ZlcnJpZGUgZ2V0UmVwb0dpdFVybCgpIHtcbiAgICByZXR1cm4gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZywgdGhpcy5naXRodWJUb2tlbik7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBHaXRDbGllbnQgaW5zdGFuY2UgaXMgdXNpbmcgYSB0b2tlbiB3aXRoIHBlcm1pc3Npb25zIGZvciB0aGUgYWxsIG9mIHRoZVxuICAgKiBwcm92aWRlZCBPQXV0aCBzY29wZXMuXG4gICAqL1xuICBhc3luYyBoYXNPYXV0aFNjb3Blcyh0ZXN0Rm46IE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24pOiBQcm9taXNlPHRydWV8e2Vycm9yOiBzdHJpbmd9PiB7XG4gICAgY29uc3Qgc2NvcGVzID0gYXdhaXQgdGhpcy5fZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKTtcbiAgICBjb25zdCBtaXNzaW5nU2NvcGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRlc3QgR2l0aHViIE9BdXRoIHNjb3BlcyBhbmQgY29sbGVjdCBtaXNzaW5nIG9uZXMuXG4gICAgdGVzdEZuKHNjb3BlcywgbWlzc2luZ1Njb3Blcyk7XG4gICAgLy8gSWYgbm8gbWlzc2luZyBzY29wZXMgYXJlIGZvdW5kLCByZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhbGwgT0F1dGggU2NvcGVzIGFyZSBhdmFpbGFibGUuXG4gICAgaWYgKG1pc3NpbmdTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQcmUtY29uc3RydWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBsb2cgdG8gdGhlIHVzZXIsIHByb3ZpZGluZyBtaXNzaW5nIHNjb3BlcyBhbmRcbiAgICAvLyByZW1lZGlhdGlvbiBpbnN0cnVjdGlvbnMuXG4gICAgY29uc3QgZXJyb3IgPVxuICAgICAgICBgVGhlIHByb3ZpZGVkIDxUT0tFTj4gZG9lcyBub3QgaGF2ZSByZXF1aXJlZCBwZXJtaXNzaW9ucyBkdWUgdG8gbWlzc2luZyBzY29wZShzKTogYCArXG4gICAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgICBgVXBkYXRlIHRoZSB0b2tlbiBpbiB1c2UgYXQ6XFxuYCArXG4gICAgICAgIGAgICR7R0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH1cXG5cXG5gICtcbiAgICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cbiAgLyoqIEZldGNoIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9mZXRjaEF1dGhTY29wZXNGb3JUb2tlbigpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgPSB0aGlzLmdpdGh1Yi5yYXRlTGltaXQuZ2V0KCkudGhlbihyZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCBzY29wZXMgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddO1xuXG4gICAgICAvLyBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgb3IgaWYgdGhlIEdpdGh1YiBjbGllbnQgaXMgYXV0aGVudGljYXRlZCBpbmNvcnJlY3RseSxcbiAgICAgIC8vIHRoZSBgeC1vYXV0aC1zY29wZXNgIHJlc3BvbnNlIGhlYWRlciBpcyBub3Qgc2V0LiBXZSBlcnJvciBpbiBzdWNoIGNhc2VzIGFzIGl0XG4gICAgICAvLyBzaWduaWZpZXMgYSBmYXVsdHkgIG9mIHRoZVxuICAgICAgaWYgKHNjb3BlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcmV0cmlldmUgT0F1dGggc2NvcGVzIGZvciB0b2tlbiBwcm92aWRlZCB0byBHaXQgY2xpZW50LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSkuZmlsdGVyKHNjb3BlID0+IHNjb3BlICE9PSAnJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfYXV0aGVudGljYXRlZEluc3RhbmNlOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAsXG4gICAqIGNyZWF0aW5nIGl0IGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBvdmVycmlkZSBnZXQoKTogQXV0aGVudGljYXRlZEdpdENsaWVudCB7XG4gICAgaWYgKCFBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5zdGFuY2Ugb2YgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGhhcyBiZWVuIHNldCB1cCB5ZXQuJyk7XG4gICAgfVxuICAgIHJldHVybiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cblxuICAvKiogQ29uZmlndXJlcyBhbiBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHN0YXRpYyBjb25maWd1cmUodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gY29uZmlndXJlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBhcyBpdCBoYXMgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuJyk7XG4gICAgfVxuICAgIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50KHRva2VuKTtcbiAgfVxufVxuIl19