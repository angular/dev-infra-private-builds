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
            return this._cachedOauthScopes = this.github.rateLimit.get().then(function (_response) {
                var response = _response;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQVVBLG9FQUFrQztJQUVsQyw4RUFBdUM7SUFDdkMsc0VBQW1EO0lBQ25ELGdGQUF3RztJQVV4Rzs7O09BR0c7SUFDSDtRQUE0QyxrREFBUztRQWFuRCxnQ0FBK0IsV0FBbUIsRUFBRSxPQUFnQixFQUFFLE1BQW9CO1lBQTFGLFlBQ0Usa0JBQU0sT0FBTyxFQUFFLE1BQU0sQ0FBQyxTQUN2QjtZQUY4QixpQkFBVyxHQUFYLFdBQVcsQ0FBUTtZQVpsRDs7O2VBR0c7WUFDYyx1QkFBaUIsR0FBVyxJQUFJLE1BQU0sQ0FBQyxLQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRS9FLGdFQUFnRTtZQUN4RCx3QkFBa0IsR0FBMkIsSUFBSSxDQUFDO1lBRTFELGtEQUFrRDtZQUN6QyxZQUFNLEdBQUcsSUFBSSxrQ0FBeUIsQ0FBQyxLQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7O1FBSWxFLENBQUM7UUFFRCxrRkFBa0Y7UUFDbEYsc0RBQXFCLEdBQXJCLFVBQXNCLEtBQWE7WUFDakMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRUQsMERBQTBEO1FBQzFELDhDQUFhLEdBQWI7WUFDRSxPQUFPLGlDQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xFLENBQUM7UUFFRDs7O1dBR0c7UUFDRywrQ0FBYyxHQUFwQixVQUFxQixNQUE4Qjs7Ozs7Z0NBQ2xDLHFCQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFBOzs0QkFBOUMsTUFBTSxHQUFHLFNBQXFDOzRCQUM5QyxhQUFhLEdBQWEsRUFBRSxDQUFDOzRCQUNuQyxxREFBcUQ7NEJBQ3JELE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7NEJBQzlCLDBGQUEwRjs0QkFDMUYsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtnQ0FDOUIsc0JBQU8sSUFBSSxFQUFDOzZCQUNiOzRCQUlLLEtBQUssR0FDUCxtRkFBbUY7aUNBQ2hGLGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFNLENBQUE7Z0NBQ3pDLCtCQUErQjtpQ0FDL0IsT0FBSyx1Q0FBeUIsU0FBTSxDQUFBO2lDQUNwQyxtREFBaUQsdUNBQXlCLE9BQUksQ0FBQSxDQUFDOzRCQUVuRixzQkFBTyxFQUFDLEtBQUssT0FBQSxFQUFDLEVBQUM7Ozs7U0FDaEI7UUFFRCwwREFBMEQ7UUFDbEQseURBQXdCLEdBQWhDO1lBQ0Usb0ZBQW9GO1lBQ3BGLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtnQkFDcEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7YUFDaEM7WUFDRCxrRUFBa0U7WUFDbEUsOERBQThEO1lBQzlELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7Z0JBQ3pFLElBQU0sUUFBUSxHQUFHLFNBQWtELENBQUM7Z0JBQ3BFLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFFbEQsaUZBQWlGO2dCQUNqRixnRkFBZ0Y7Z0JBQ2hGLDZCQUE2QjtnQkFDN0IsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUN4QixNQUFNLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2lCQUNsRjtnQkFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssS0FBSyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7WUFDcEYsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBS0Q7OztXQUdHO1FBQ0ksMEJBQUcsR0FBVjtZQUNFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO2FBQ2pGO1lBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQztRQUN2RCxDQUFDO1FBRUQsOENBQThDO1FBQ3ZDLGdDQUFTLEdBQWhCLFVBQWlCLEtBQWE7WUFDNUIsSUFBSSxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDakQsTUFBTSxLQUFLLENBQ1AsaUZBQWlGLENBQUMsQ0FBQzthQUN4RjtZQUNELHNCQUFzQixDQUFDLHNCQUFzQixHQUFHLElBQUksc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDcEYsQ0FBQztRQUNILDZCQUFDO0lBQUQsQ0FBQyxBQWxHRCxDQUE0QyxzQkFBUyxHQWtHcEQ7SUFsR1ksd0RBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuXG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHt5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsLCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLCBHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIEdpdGh1YiByZXNwb25zZSB0eXBlIGV4dGVuZGVkIHRvIGluY2x1ZGUgdGhlIGB4LW9hdXRoLXNjb3Blc2AgaGVhZGVycyBwcmVzZW5jZS4gKi9cbnR5cGUgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlciA9IE9jdG9raXQuUmVzcG9uc2U8T2N0b2tpdC5SYXRlTGltaXRHZXRSZXNwb25zZT4me1xuICBoZWFkZXJzOiB7J3gtb2F1dGgtc2NvcGVzJzogc3RyaW5nfHVuZGVmaW5lZH07XG59O1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqXG4gKiBFeHRlbnNpb24gb2YgdGhlIGBHaXRDbGllbnRgIHdpdGggYWRkaXRpb25hbCB1dGlsaXRpZXMgd2hpY2ggYXJlIHVzZWZ1bCBmb3JcbiAqIGF1dGhlbnRpY2F0ZWQgR2l0IGNsaWVudCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IGV4dGVuZHMgR2l0Q2xpZW50IHtcbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gVXNlZCBmb3JcbiAgICogc2FuaXRpemluZyB0aGUgdG9rZW4gZnJvbSBHaXQgY2hpbGQgcHJvY2VzcyBvdXRwdXQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9naXRodWJUb2tlblJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKHRoaXMuZ2l0aHViVG9rZW4sICdnJyk7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG5cbiAgLyoqIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0aHViIGNsaWVudC4gKi9cbiAgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdpdGh1YlRva2VuOiBzdHJpbmcsIGJhc2VEaXI/OiBzdHJpbmcsIGNvbmZpZz86IE5nRGV2Q29uZmlnKSB7XG4gICAgc3VwZXIoYmFzZURpciwgY29uZmlnKTtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUHJlLWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgLy8gcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4oX3Jlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gX3Jlc3BvbnNlIGFzIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXI7XG4gICAgICBjb25zdCBzY29wZXMgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddO1xuXG4gICAgICAvLyBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgb3IgaWYgdGhlIEdpdGh1YiBjbGllbnQgaXMgYXV0aGVudGljYXRlZCBpbmNvcnJlY3RseSxcbiAgICAgIC8vIHRoZSBgeC1vYXV0aC1zY29wZXNgIHJlc3BvbnNlIGhlYWRlciBpcyBub3Qgc2V0LiBXZSBlcnJvciBpbiBzdWNoIGNhc2VzIGFzIGl0XG4gICAgICAvLyBzaWduaWZpZXMgYSBmYXVsdHkgIG9mIHRoZVxuICAgICAgaWYgKHNjb3BlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcmV0cmlldmUgT0F1dGggc2NvcGVzIGZvciB0b2tlbiBwcm92aWRlZCB0byBHaXQgY2xpZW50LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSkuZmlsdGVyKHNjb3BlID0+IHNjb3BlICE9PSAnJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfYXV0aGVudGljYXRlZEluc3RhbmNlOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAsXG4gICAqIGNyZWF0aW5nIGl0IGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBnZXQoKTogQXV0aGVudGljYXRlZEdpdENsaWVudCB7XG4gICAgaWYgKCFBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5zdGFuY2Ugb2YgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGhhcyBiZWVuIHNldCB1cCB5ZXQuJyk7XG4gICAgfVxuICAgIHJldHVybiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cblxuICAvKiogQ29uZmlndXJlcyBhbiBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHN0YXRpYyBjb25maWd1cmUodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gY29uZmlndXJlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBhcyBpdCBoYXMgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuJyk7XG4gICAgfVxuICAgIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50KHRva2VuKTtcbiAgfVxufVxuIl19