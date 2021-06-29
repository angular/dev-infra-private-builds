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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFFbEMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN2QyxPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDbkQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLHlCQUF5QixFQUFFLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBS3hHOzs7R0FHRztBQUNIO0lBQTRDLDBDQUFTO0lBYW5ELGdDQUErQixXQUFtQixFQUFFLE9BQWdCLEVBQUUsTUFBb0I7UUFBMUYsWUFDRSxrQkFBTSxPQUFPLEVBQUUsTUFBTSxDQUFDLFNBQ3ZCO1FBRjhCLGlCQUFXLEdBQVgsV0FBVyxDQUFRO1FBWmxEOzs7V0FHRztRQUNjLHVCQUFpQixHQUFXLElBQUksTUFBTSxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFL0UsZ0VBQWdFO1FBQ3hELHdCQUFrQixHQUEyQixJQUFJLENBQUM7UUFFMUQsa0RBQWtEO1FBQ3pDLFlBQU0sR0FBRyxJQUFJLHlCQUF5QixDQUFDLEtBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQzs7SUFJbEUsQ0FBQztJQUVELGtGQUFrRjtJQUNsRixzREFBcUIsR0FBckIsVUFBc0IsS0FBYTtRQUNqQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCwwREFBMEQ7SUFDMUQsOENBQWEsR0FBYjtRQUNFLE9BQU8sbUJBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNHLCtDQUFjLEdBQXBCLFVBQXFCLE1BQThCOzs7Ozs0QkFDbEMscUJBQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFLEVBQUE7O3dCQUE5QyxNQUFNLEdBQUcsU0FBcUM7d0JBQzlDLGFBQWEsR0FBYSxFQUFFLENBQUM7d0JBQ25DLHFEQUFxRDt3QkFDckQsTUFBTSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQzt3QkFDOUIsMEZBQTBGO3dCQUMxRixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUM5QixzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7d0JBSUssS0FBSyxHQUNQLG1GQUFtRjs2QkFDaEYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBTSxDQUFBOzRCQUN6QywrQkFBK0I7NkJBQy9CLE9BQUsseUJBQXlCLFNBQU0sQ0FBQTs2QkFDcEMsbURBQWlELHlCQUF5QixPQUFJLENBQUEsQ0FBQzt3QkFFbkYsc0JBQU8sRUFBQyxLQUFLLE9BQUEsRUFBQyxFQUFDOzs7O0tBQ2hCO0lBRUQsMERBQTBEO0lBQ2xELHlEQUF3QixHQUFoQztRQUNFLG9GQUFvRjtRQUNwRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7WUFDcEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7U0FDaEM7UUFDRCxrRUFBa0U7UUFDbEUsOERBQThEO1FBQzlELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFBLFFBQVE7WUFDeEUsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWxELGlGQUFpRjtZQUNqRixnRkFBZ0Y7WUFDaEYsNkJBQTZCO1lBQzdCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQzthQUNsRjtZQUVELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxLQUFLLElBQUksT0FBQSxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQVosQ0FBWSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSyxLQUFLLEVBQUUsRUFBWixDQUFZLENBQUMsQ0FBQztRQUNwRixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFLRDs7O09BR0c7SUFDSSwwQkFBRyxHQUFWO1FBQ0UsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO1lBQ2xELE1BQU0sSUFBSSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztTQUNqRjtRQUNELE9BQU8sc0JBQXNCLENBQUMsc0JBQXNCLENBQUM7SUFDdkQsQ0FBQztJQUVELDhDQUE4QztJQUN2QyxnQ0FBUyxHQUFoQixVQUFpQixLQUFhO1FBQzVCLElBQUksc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDakQsTUFBTSxLQUFLLENBQ1AsaUZBQWlGLENBQUMsQ0FBQztTQUN4RjtRQUNELHNCQUFzQixDQUFDLHNCQUFzQixHQUFHLElBQUksc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEYsQ0FBQztJQUNILDZCQUFDO0FBQUQsQ0FBQyxBQWpHRCxDQUE0QyxTQUFTLEdBaUdwRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHt5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtnZXRSZXBvc2l0b3J5R2l0VXJsLCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLCBHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIERlc2NyaWJlcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gdGVzdCBmb3IgZ2l2ZW4gR2l0aHViIE9BdXRoIHNjb3Blcy4gKi9cbmV4cG9ydCB0eXBlIE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24gPSAoc2NvcGVzOiBzdHJpbmdbXSwgbWlzc2luZzogc3RyaW5nW10pID0+IHZvaWQ7XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHRoZSBgR2l0Q2xpZW50YCB3aXRoIGFkZGl0aW9uYWwgdXRpbGl0aWVzIHdoaWNoIGFyZSB1c2VmdWwgZm9yXG4gKiBhdXRoZW50aWNhdGVkIEdpdCBjbGllbnQgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRlZEdpdENsaWVudCBleHRlbmRzIEdpdENsaWVudCB7XG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uIFVzZWQgZm9yXG4gICAqIHNhbml0aXppbmcgdGhlIHRva2VuIGZyb20gR2l0IGNoaWxkIHByb2Nlc3Mgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZ2l0aHViVG9rZW5SZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cCh0aGlzLmdpdGh1YlRva2VuLCAnZycpO1xuXG4gIC8qKiBUaGUgT0F1dGggc2NvcGVzIGF2YWlsYWJsZSBmb3IgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkT2F1dGhTY29wZXM6IFByb21pc2U8c3RyaW5nW10+fG51bGwgPSBudWxsO1xuXG4gIC8qKiBJbnN0YW5jZSBvZiBhbiBhdXRoZW50aWNhdGVkIGdpdGh1YiBjbGllbnQuICovXG4gIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50KHRoaXMuZ2l0aHViVG9rZW4pO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihyZWFkb25seSBnaXRodWJUb2tlbjogc3RyaW5nLCBiYXNlRGlyPzogc3RyaW5nLCBjb25maWc/OiBOZ0RldkNvbmZpZykge1xuICAgIHN1cGVyKGJhc2VEaXIsIGNvbmZpZyk7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl9naXRodWJUb2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnLCB0aGlzLmdpdGh1YlRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhlIEdpdENsaWVudCBpbnN0YW5jZSBpcyB1c2luZyBhIHRva2VuIHdpdGggcGVybWlzc2lvbnMgZm9yIHRoZSBhbGwgb2YgdGhlXG4gICAqIHByb3ZpZGVkIE9BdXRoIHNjb3Blcy5cbiAgICovXG4gIGFzeW5jIGhhc09hdXRoU2NvcGVzKHRlc3RGbjogT0F1dGhTY29wZVRlc3RGdW5jdGlvbik6IFByb21pc2U8dHJ1ZXx7ZXJyb3I6IHN0cmluZ30+IHtcbiAgICBjb25zdCBzY29wZXMgPSBhd2FpdCB0aGlzLl9mZXRjaEF1dGhTY29wZXNGb3JUb2tlbigpO1xuICAgIGNvbnN0IG1pc3NpbmdTY29wZXM6IHN0cmluZ1tdID0gW107XG4gICAgLy8gVGVzdCBHaXRodWIgT0F1dGggc2NvcGVzIGFuZCBjb2xsZWN0IG1pc3Npbmcgb25lcy5cbiAgICB0ZXN0Rm4oc2NvcGVzLCBtaXNzaW5nU2NvcGVzKTtcbiAgICAvLyBJZiBubyBtaXNzaW5nIHNjb3BlcyBhcmUgZm91bmQsIHJldHVybiB0cnVlIHRvIGluZGljYXRlIGFsbCBPQXV0aCBTY29wZXMgYXJlIGF2YWlsYWJsZS5cbiAgICBpZiAobWlzc2luZ1Njb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFByZS1jb25zdHJ1Y3RlZCBlcnJvciBtZXNzYWdlIHRvIGxvZyB0byB0aGUgdXNlciwgcHJvdmlkaW5nIG1pc3Npbmcgc2NvcGVzIGFuZFxuICAgIC8vIHJlbWVkaWF0aW9uIGluc3RydWN0aW9ucy5cbiAgICBjb25zdCBlcnJvciA9XG4gICAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgICAgYCR7eWVsbG93KG1pc3NpbmdTY29wZXMuam9pbignLCAnKSl9XFxuXFxuYCArXG4gICAgICAgIGBVcGRhdGUgdGhlIHRva2VuIGluIHVzZSBhdDpcXG5gICtcbiAgICAgICAgYCAgJHtHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfVxcblxcbmAgK1xuICAgICAgICBgQWx0ZXJuYXRpdmVseSwgYSBuZXcgdG9rZW4gY2FuIGJlIGNyZWF0ZWQgYXQ6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1cXG5gO1xuXG4gICAgcmV0dXJuIHtlcnJvcn07XG4gIH1cblxuICAvKiogRmV0Y2ggdGhlIE9BdXRoIHNjb3BlcyBmb3IgdGhlIGxvYWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCkge1xuICAgIC8vIElmIHRoZSBPQXV0aCBzY29wZXMgaGF2ZSBhbHJlYWR5IGJlZW4gbG9hZGVkLCByZXR1cm4gdGhlIFByb21pc2UgY29udGFpbmluZyB0aGVtLlxuICAgIGlmICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzO1xuICAgIH1cbiAgICAvLyBPQXV0aCBzY29wZXMgYXJlIGxvYWRlZCB2aWEgdGhlIC9yYXRlX2xpbWl0IGVuZHBvaW50IHRvIHByZXZlbnRcbiAgICAvLyB1c2FnZSBvZiBhIHJlcXVlc3QgYWdhaW5zdCB0aGF0IHJhdGVfbGltaXQgZm9yIHRoaXMgbG9va3VwLlxuICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyA9IHRoaXMuZ2l0aHViLnJhdGVMaW1pdC5nZXQoKS50aGVuKHJlc3BvbnNlID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlcyA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtb2F1dGgtc2NvcGVzJ107XG5cbiAgICAgIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCBvciBpZiB0aGUgR2l0aHViIGNsaWVudCBpcyBhdXRoZW50aWNhdGVkIGluY29ycmVjdGx5LFxuICAgICAgLy8gdGhlIGB4LW9hdXRoLXNjb3Blc2AgcmVzcG9uc2UgaGVhZGVyIGlzIG5vdCBzZXQuIFdlIGVycm9yIGluIHN1Y2ggY2FzZXMgYXMgaXRcbiAgICAgIC8vIHNpZ25pZmllcyBhIGZhdWx0eSAgb2YgdGhlXG4gICAgICBpZiAoc2NvcGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuYWJsZSB0byByZXRyaWV2ZSBPQXV0aCBzY29wZXMgZm9yIHRva2VuIHByb3ZpZGVkIHRvIEdpdCBjbGllbnQuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzY29wZXMuc3BsaXQoJywnKS5tYXAoc2NvcGUgPT4gc2NvcGUudHJpbSgpKS5maWx0ZXIoc2NvcGUgPT4gc2NvcGUgIT09ICcnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF9hdXRoZW50aWNhdGVkSW5zdGFuY2U6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQ7XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCxcbiAgICogY3JlYXRpbmcgaXQgaWYgaXQgaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgc3RhdGljIGdldCgpOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IHtcbiAgICBpZiAoIUF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnN0YW5jZSBvZiBgQXV0aGVudGljYXRlZEdpdENsaWVudGAgaGFzIGJlZW4gc2V0IHVwIHlldC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZTtcbiAgfVxuXG4gIC8qKiBDb25maWd1cmVzIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgc3RhdGljIGNvbmZpZ3VyZSh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgJ1VuYWJsZSB0byBjb25maWd1cmUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGFzIGl0IGhhcyBiZWVuIGNvbmZpZ3VyZWQgYWxyZWFkeS4nKTtcbiAgICB9XG4gICAgQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQodG9rZW4pO1xuICB9XG59XG4iXX0=