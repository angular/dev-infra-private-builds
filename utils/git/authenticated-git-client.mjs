/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
}(GitClient));
export { AuthenticatedGitClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBS3hHOzs7R0FHRztBQUNIO0lBQTRDLDBDQUFTO0lBYW5ELGdDQUErQixXQUFtQixFQUFFLE9BQWdCLEVBQUUsTUFBb0I7UUFBMUYsWUFDRSxrQkFBTSxPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQ3ZCO1FBRjhCLGlCQUFXLEdBQVgsV0FBVyxDQUFRO1FBWmxEOzs7V0FHRztRQUNjLHVCQUFpQixHQUFXLElBQUksTUFBTSxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0UsZ0VBQWdFO1FBQ3hELHdCQUFrQixHQUEyQixJQUFJLENBQUM7UUFFMUQsa0RBQWtEO1FBQ2hDLFlBQU0sR0FBRyxJQUFJLHlCQUF5QixDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7SUFJM0UsQ0FBQztJQUVELGtGQUFrRjtJQUN6RSxzREFBcUIsR0FBOUIsVUFBK0IsS0FBYTtRQUMxQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCwwREFBMEQ7SUFDakQsOENBQWEsR0FBdEI7UUFDRSxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7O09BR0c7SUFDRywrQ0FBYyxHQUFwQixVQUFxQixNQUE4Qjs7Ozs7NEJBQ2xDLHFCQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxFQUFBOzt3QkFBOUMsTUFBTSxHQUFHLFNBQXFDO3dCQUM5QyxhQUFhLEdBQWEsRUFBRSxDQUFDO3dCQUNuQyxxREFBcUQ7d0JBQ3JELE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQzlCLDBGQUEwRjt3QkFDMUYsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDOUIsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQUlLLEtBQUssR0FDUCxtRkFBbUY7NkJBQ2hGLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQU0sQ0FBQTs0QkFDekMsK0JBQStCOzZCQUMvQixPQUFLLHlCQUF5QixTQUFNLENBQUE7NkJBQ3BDLG1EQUFpRCx5QkFBeUIsT0FBSSxDQUFBLENBQUM7d0JBRW5GLHNCQUFPLEVBQUMsS0FBSyxPQUFBLEVBQUMsRUFBQzs7OztLQUNoQjtJQUVELDBEQUEwRDtJQUNsRCx5REFBd0IsR0FBaEM7UUFDRSxvRkFBb0Y7UUFDcEYsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQ2hDO1FBQ0Qsa0VBQWtFO1FBQ2xFLDhEQUE4RDtRQUM5RCxPQUFPLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO1lBQ3hFLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVsRCxpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLDZCQUE2QjtZQUM3QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE1BQU0sS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7YUFDbEY7WUFFRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFaLENBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUssS0FBSyxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDcEYsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBS0Q7OztPQUdHO0lBQ2EsMEJBQUcsR0FBbkI7UUFDRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQztJQUN2RCxDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLGdDQUFTLEdBQWhCLFVBQWlCLEtBQWE7UUFDNUIsSUFBSSxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtZQUNqRCxNQUFNLEtBQUssQ0FDUCxpRkFBaUYsQ0FBQyxDQUFDO1NBQ3hGO1FBQ0Qsc0JBQXNCLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBQ0gsNkJBQUM7QUFBRCxDQUFDLEFBakdELENBQTRDLFNBQVMsR0FpR3BEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TmdEZXZDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge3llbGxvd30gZnJvbSAnLi4vY29uc29sZSc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC1jbGllbnQnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge2dldFJlcG9zaXRvcnlHaXRVcmwsIEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwsIEdJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqXG4gKiBFeHRlbnNpb24gb2YgdGhlIGBHaXRDbGllbnRgIHdpdGggYWRkaXRpb25hbCB1dGlsaXRpZXMgd2hpY2ggYXJlIHVzZWZ1bCBmb3JcbiAqIGF1dGhlbnRpY2F0ZWQgR2l0IGNsaWVudCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IGV4dGVuZHMgR2l0Q2xpZW50IHtcbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gVXNlZCBmb3JcbiAgICogc2FuaXRpemluZyB0aGUgdG9rZW4gZnJvbSBHaXQgY2hpbGQgcHJvY2VzcyBvdXRwdXQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9naXRodWJUb2tlblJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKHRoaXMuZ2l0aHViVG9rZW4sICdnJyk7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT58bnVsbCA9IG51bGw7XG5cbiAgLyoqIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0aHViIGNsaWVudC4gKi9cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKHJlYWRvbmx5IGdpdGh1YlRva2VuOiBzdHJpbmcsIGJhc2VEaXI/OiBzdHJpbmcsIGNvbmZpZz86IE5nRGV2Q29uZmlnKSB7XG4gICAgc3VwZXIoYmFzZURpciwgY29uZmlnKTtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgb3ZlcnJpZGUgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIG92ZXJyaWRlIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlfHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUHJlLWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgLy8gcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgIGNvbnN0IGVycm9yID1cbiAgICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3Qgc2NvcGVzID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXTtcblxuICAgICAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIG9yIGlmIHRoZSBHaXRodWIgY2xpZW50IGlzIGF1dGhlbnRpY2F0ZWQgaW5jb3JyZWN0bHksXG4gICAgICAvLyB0aGUgYHgtb2F1dGgtc2NvcGVzYCByZXNwb25zZSBoZWFkZXIgaXMgbm90IHNldC4gV2UgZXJyb3IgaW4gc3VjaCBjYXNlcyBhcyBpdFxuICAgICAgLy8gc2lnbmlmaWVzIGEgZmF1bHR5ICBvZiB0aGVcbiAgICAgIGlmIChzY29wZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBFcnJvcignVW5hYmxlIHRvIHJldHJpZXZlIE9BdXRoIHNjb3BlcyBmb3IgdG9rZW4gcHJvdmlkZWQgdG8gR2l0IGNsaWVudC4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNjb3Blcy5zcGxpdCgnLCcpLm1hcChzY29wZSA9PiBzY29wZS50cmltKCkpLmZpbHRlcihzY29wZSA9PiBzY29wZSAhPT0gJycpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZTogQXV0aGVudGljYXRlZEdpdENsaWVudDtcblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLFxuICAgKiBjcmVhdGluZyBpdCBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgb3ZlcnJpZGUgZ2V0KCk6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQge1xuICAgIGlmICghQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGluc3RhbmNlIG9mIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBoYXMgYmVlbiBzZXQgdXAgeWV0LicpO1xuICAgIH1cbiAgICByZXR1cm4gQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlO1xuICB9XG5cbiAgLyoqIENvbmZpZ3VyZXMgYW4gYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBzdGF0aWMgY29uZmlndXJlKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICAnVW5hYmxlIHRvIGNvbmZpZ3VyZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAgYXMgaXQgaGFzIGJlZW4gY29uZmlndXJlZCBhbHJlYWR5LicpO1xuICAgIH1cbiAgICBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UgPSBuZXcgQXV0aGVudGljYXRlZEdpdENsaWVudCh0b2tlbik7XG4gIH1cbn1cbiJdfQ==