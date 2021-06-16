import { __awaiter, __extends, __generator } from "tslib";
import { yellow } from '../console';
import { GitClient } from './git-client';
import { AuthenticatedGithubClient } from './github';
import { getRepositoryGitUrl, GITHUB_TOKEN_GENERATE_URL, GITHUB_TOKEN_SETTINGS_URL } from './github-urls';
/**
 * Extension of the `GitClient` with additional utilities which are useful for
 * authenticated Git client instances.
 */
var AuthenticatedGitClient = /** @class */ (function (_super) {
    __extends(AuthenticatedGitClient, _super);
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
        _this.github = new AuthenticatedGithubClient(_this.githubToken);
        return _this;
    }
    /** Sanitizes a given message by omitting the provided Github token if present. */
    AuthenticatedGitClient.prototype.sanitizeConsoleOutput = function (value) {
        return value.replace(this._githubTokenRegex, '<TOKEN>');
    };
    /** Git URL that resolves to the configured repository. */
    AuthenticatedGitClient.prototype.getRepoGitUrl = function () {
        return getRepositoryGitUrl(this.remoteConfig, this.githubToken);
    };
    /**
     * Assert the GitClient instance is using a token with permissions for the all of the
     * provided OAuth scopes.
     */
    AuthenticatedGitClient.prototype.hasOauthScopes = function (testFn) {
        return __awaiter(this, void 0, void 0, function () {
            var scopes, missingScopes, error;
            return __generator(this, function (_a) {
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
                            (yellow(missingScopes.join(', ')) + "\n\n") +
                            "Update the token in use at:\n" +
                            ("  " + GITHUB_TOKEN_SETTINGS_URL + "\n\n") +
                            ("Alternatively, a new token can be created at: " + GITHUB_TOKEN_GENERATE_URL + "\n");
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
}(GitClient));
export { AuthenticatedGitClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQVVBLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBVXhHOzs7R0FHRztBQUNIO0lBQTRDLDBDQUFTO0lBYW5ELGdDQUErQixXQUFtQixFQUFFLE9BQWdCLEVBQUUsTUFBb0I7UUFBMUYsWUFDRSxrQkFBTSxPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQ3ZCO1FBRjhCLGlCQUFXLEdBQVgsV0FBVyxDQUFRO1FBWmxEOzs7V0FHRztRQUNjLHVCQUFpQixHQUFXLElBQUksTUFBTSxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0UsZ0VBQWdFO1FBQ3hELHdCQUFrQixHQUEyQixJQUFJLENBQUM7UUFFMUQsa0RBQWtEO1FBQ3pDLFlBQU0sR0FBRyxJQUFJLHlCQUF5QixDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7SUFJbEUsQ0FBQztJQUVELGtGQUFrRjtJQUNsRixzREFBcUIsR0FBckIsVUFBc0IsS0FBYTtRQUNqQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCwwREFBMEQ7SUFDMUQsOENBQWEsR0FBYjtRQUNFLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNHLCtDQUFjLEdBQXBCLFVBQXFCLE1BQThCOzs7Ozs0QkFDbEMscUJBQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFLEVBQUE7O3dCQUE5QyxNQUFNLEdBQUcsU0FBcUM7d0JBQzlDLGFBQWEsR0FBYSxFQUFFLENBQUM7d0JBQ25DLHFEQUFxRDt3QkFDckQsTUFBTSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQzt3QkFDOUIsMEZBQTBGO3dCQUMxRixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM5QixzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7d0JBSUssS0FBSyxHQUNQLG1GQUFtRjs2QkFDaEYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBTSxDQUFBOzRCQUN6QywrQkFBK0I7NkJBQy9CLE9BQUsseUJBQXlCLFNBQU0sQ0FBQTs2QkFDcEMsbURBQWlELHlCQUF5QixPQUFJLENBQUEsQ0FBQzt3QkFFbkYsc0JBQU8sRUFBQyxLQUFLLE9BQUEsRUFBQyxFQUFDOzs7O0tBQ2hCO0lBRUQsMERBQTBEO0lBQ2xELHlEQUF3QixHQUFoQztRQUNFLG9GQUFvRjtRQUNwRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7WUFDcEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7U0FDaEM7UUFDRCxrRUFBa0U7UUFDbEUsOERBQThEO1FBQzlELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFNBQVM7WUFDekUsSUFBTSxRQUFRLEdBQUcsU0FBa0QsQ0FBQztZQUNwRSxJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFbEQsaUZBQWlGO1lBQ2pGLGdGQUFnRjtZQUNoRiw2QkFBNkI7WUFDN0IsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN4QixNQUFNLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2FBQ2xGO1lBRUQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLEtBQUssRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDO1FBQ3BGLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUtEOzs7T0FHRztJQUNJLDBCQUFHLEdBQVY7UUFDRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQztJQUN2RCxDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLGdDQUFTLEdBQWhCLFVBQWlCLEtBQWE7UUFDNUIsSUFBSSxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtZQUNqRCxNQUFNLEtBQUssQ0FDUCxpRkFBaUYsQ0FBQyxDQUFDO1NBQ3hGO1FBQ0Qsc0JBQXNCLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBQ0gsNkJBQUM7QUFBRCxDQUFDLEFBbEdELENBQTRDLFNBQVMsR0FrR3BEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuXG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHt5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsLCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLCBHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIEdpdGh1YiByZXNwb25zZSB0eXBlIGV4dGVuZGVkIHRvIGluY2x1ZGUgdGhlIGB4LW9hdXRoLXNjb3Blc2AgaGVhZGVycyBwcmVzZW5jZS4gKi9cbnR5cGUgUmF0ZUxpbWl0UmVzcG9uc2VXaXRoT0F1dGhTY29wZUhlYWRlciA9IE9jdG9raXQuUmVzcG9uc2U8T2N0b2tpdC5SYXRlTGltaXRHZXRSZXNwb25zZT4me1xuICBoZWFkZXJzOiB7J3gtb2F1dGgtc2NvcGVzJzogc3RyaW5nfHVuZGVmaW5lZH07XG59O1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqXG4gKiBFeHRlbnNpb24gb2YgdGhlIGBHaXRDbGllbnRgIHdpdGggYWRkaXRpb25hbCB1dGlsaXRpZXMgd2hpY2ggYXJlIHVzZWZ1bCBmb3JcbiAqIGF1dGhlbnRpY2F0ZWQgR2l0IGNsaWVudCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IGV4dGVuZHMgR2l0Q2xpZW50IHtcbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gVXNlZCBmb3JcbiAgICogc2FuaXRpemluZyB0aGUgdG9rZW4gZnJvbSBHaXQgY2hpbGQgcHJvY2VzcyBvdXRwdXQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9naXRodWJUb2tlblJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKHRoaXMuZ2l0aHViVG9rZW4sICdnJyk7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG5cbiAgLyoqIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0aHViIGNsaWVudC4gKi9cbiAgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdpdGh1YlRva2VuOiBzdHJpbmcsIGJhc2VEaXI/OiBzdHJpbmcsIGNvbmZpZz86IE5nRGV2Q29uZmlnKSB7XG4gICAgc3VwZXIoYmFzZURpciwgY29uZmlnKTtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUHJlLWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgLy8gcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4oX3Jlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gX3Jlc3BvbnNlIGFzIFJhdGVMaW1pdFJlc3BvbnNlV2l0aE9BdXRoU2NvcGVIZWFkZXI7XG4gICAgICBjb25zdCBzY29wZXMgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddO1xuXG4gICAgICAvLyBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgb3IgaWYgdGhlIEdpdGh1YiBjbGllbnQgaXMgYXV0aGVudGljYXRlZCBpbmNvcnJlY3RseSxcbiAgICAgIC8vIHRoZSBgeC1vYXV0aC1zY29wZXNgIHJlc3BvbnNlIGhlYWRlciBpcyBub3Qgc2V0LiBXZSBlcnJvciBpbiBzdWNoIGNhc2VzIGFzIGl0XG4gICAgICAvLyBzaWduaWZpZXMgYSBmYXVsdHkgIG9mIHRoZVxuICAgICAgaWYgKHNjb3BlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcmV0cmlldmUgT0F1dGggc2NvcGVzIGZvciB0b2tlbiBwcm92aWRlZCB0byBHaXQgY2xpZW50LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2NvcGVzLnNwbGl0KCcsJykubWFwKHNjb3BlID0+IHNjb3BlLnRyaW0oKSkuZmlsdGVyKHNjb3BlID0+IHNjb3BlICE9PSAnJyk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfYXV0aGVudGljYXRlZEluc3RhbmNlOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAsXG4gICAqIGNyZWF0aW5nIGl0IGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBnZXQoKTogQXV0aGVudGljYXRlZEdpdENsaWVudCB7XG4gICAgaWYgKCFBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5zdGFuY2Ugb2YgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGhhcyBiZWVuIHNldCB1cCB5ZXQuJyk7XG4gICAgfVxuICAgIHJldHVybiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cblxuICAvKiogQ29uZmlndXJlcyBhbiBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHN0YXRpYyBjb25maWd1cmUodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gY29uZmlndXJlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBhcyBpdCBoYXMgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuJyk7XG4gICAgfVxuICAgIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50KHRva2VuKTtcbiAgfVxufVxuIl19