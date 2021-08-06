"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticatedGitClient = void 0;
const console_1 = require("../console");
const git_client_1 = require("./git-client");
const github_1 = require("./github");
const github_urls_1 = require("./github-urls");
/**
 * Extension of the `GitClient` with additional utilities which are useful for
 * authenticated Git client instances.
 */
class AuthenticatedGitClient extends git_client_1.GitClient {
    constructor(githubToken, baseDir, config) {
        super(baseDir, config);
        this.githubToken = githubToken;
        /**
         * Regular expression that matches the provided Github token. Used for
         * sanitizing the token from Git child process output.
         */
        this._githubTokenRegex = new RegExp(this.githubToken, 'g');
        /** The OAuth scopes available for the provided Github token. */
        this._cachedOauthScopes = null;
        /** Instance of an authenticated github client. */
        this.github = new github_1.AuthenticatedGithubClient(this.githubToken);
    }
    /** Sanitizes a given message by omitting the provided Github token if present. */
    sanitizeConsoleOutput(value) {
        return value.replace(this._githubTokenRegex, '<TOKEN>');
    }
    /** Git URL that resolves to the configured repository. */
    getRepoGitUrl() {
        return github_urls_1.getRepositoryGitUrl(this.remoteConfig, this.githubToken);
    }
    /**
     * Assert the GitClient instance is using a token with permissions for the all of the
     * provided OAuth scopes.
     */
    async hasOauthScopes(testFn) {
        const scopes = await this._fetchAuthScopesForToken();
        const missingScopes = [];
        // Test Github OAuth scopes and collect missing ones.
        testFn(scopes, missingScopes);
        // If no missing scopes are found, return true to indicate all OAuth Scopes are available.
        if (missingScopes.length === 0) {
            return true;
        }
        // Pre-constructed error message to log to the user, providing missing scopes and
        // remediation instructions.
        const error = `The provided <TOKEN> does not have required permissions due to missing scope(s): ` +
            `${console_1.yellow(missingScopes.join(', '))}\n\n` +
            `Update the token in use at:\n` +
            `  ${github_urls_1.GITHUB_TOKEN_SETTINGS_URL}\n\n` +
            `Alternatively, a new token can be created at: ${github_urls_1.GITHUB_TOKEN_GENERATE_URL}\n`;
        return { error };
    }
    /** Fetch the OAuth scopes for the loaded Github token. */
    _fetchAuthScopesForToken() {
        // If the OAuth scopes have already been loaded, return the Promise containing them.
        if (this._cachedOauthScopes !== null) {
            return this._cachedOauthScopes;
        }
        // OAuth scopes are loaded via the /rate_limit endpoint to prevent
        // usage of a request against that rate_limit for this lookup.
        return (this._cachedOauthScopes = this.github.rateLimit.get().then((response) => {
            const scopes = response.headers['x-oauth-scopes'];
            // If no token is provided, or if the Github client is authenticated incorrectly,
            // the `x-oauth-scopes` response header is not set. We error in such cases as it
            // signifies a faulty  of the
            if (scopes === undefined) {
                throw Error('Unable to retrieve OAuth scopes for token provided to Git client.');
            }
            return scopes
                .split(',')
                .map((scope) => scope.trim())
                .filter((scope) => scope !== '');
        }));
    }
    /**
     * Static method to get the singleton instance of the `AuthenticatedGitClient`,
     * creating it if it has not yet been created.
     */
    static get() {
        if (!AuthenticatedGitClient._authenticatedInstance) {
            throw new Error('No instance of `AuthenticatedGitClient` has been set up yet.');
        }
        return AuthenticatedGitClient._authenticatedInstance;
    }
    /** Configures an authenticated git client. */
    static configure(token) {
        if (AuthenticatedGitClient._authenticatedInstance) {
            throw Error('Unable to configure `AuthenticatedGitClient` as it has been configured already.');
        }
        AuthenticatedGitClient._authenticatedInstance = new AuthenticatedGitClient(token);
    }
}
exports.AuthenticatedGitClient = AuthenticatedGitClient;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsd0NBQWtDO0FBRWxDLDZDQUF1QztBQUN2QyxxQ0FBbUQ7QUFDbkQsK0NBSXVCO0FBS3ZCOzs7R0FHRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsc0JBQVM7SUFhbkQsWUFBK0IsV0FBbUIsRUFBRSxPQUFnQixFQUFFLE1BQW9CO1FBQ3hGLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFETSxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQVpsRDs7O1dBR0c7UUFDYyxzQkFBaUIsR0FBVyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRS9FLGdFQUFnRTtRQUN4RCx1QkFBa0IsR0FBNkIsSUFBSSxDQUFDO1FBRTVELGtEQUFrRDtRQUNoQyxXQUFNLEdBQUcsSUFBSSxrQ0FBeUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFJM0UsQ0FBQztJQUVELGtGQUFrRjtJQUN6RSxxQkFBcUIsQ0FBQyxLQUFhO1FBQzFDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELDBEQUEwRDtJQUNqRCxhQUFhO1FBQ3BCLE9BQU8saUNBQW1CLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBOEI7UUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNyRCxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7UUFDbkMscURBQXFEO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDOUIsMEZBQTBGO1FBQzFGLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELGlGQUFpRjtRQUNqRiw0QkFBNEI7UUFDNUIsTUFBTSxLQUFLLEdBQ1QsbUZBQW1GO1lBQ25GLEdBQUcsZ0JBQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU07WUFDekMsK0JBQStCO1lBQy9CLEtBQUssdUNBQXlCLE1BQU07WUFDcEMsaURBQWlELHVDQUF5QixJQUFJLENBQUM7UUFFakYsT0FBTyxFQUFDLEtBQUssRUFBQyxDQUFDO0lBQ2pCLENBQUM7SUFFRCwwREFBMEQ7SUFDbEQsd0JBQXdCO1FBQzlCLG9GQUFvRjtRQUNwRixJQUFJLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLEVBQUU7WUFDcEMsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUM7U0FDaEM7UUFDRCxrRUFBa0U7UUFDbEUsOERBQThEO1FBQzlELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUU7WUFDOUUsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBRWxELGlGQUFpRjtZQUNqRixnRkFBZ0Y7WUFDaEYsNkJBQTZCO1lBQzdCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsTUFBTSxLQUFLLENBQUMsbUVBQW1FLENBQUMsQ0FBQzthQUNsRjtZQUVELE9BQU8sTUFBTTtpQkFDVixLQUFLLENBQUMsR0FBRyxDQUFDO2lCQUNWLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO2lCQUM1QixNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ04sQ0FBQztJQUtEOzs7T0FHRztJQUNILE1BQU0sQ0FBVSxHQUFHO1FBQ2pCLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtZQUNsRCxNQUFNLElBQUksS0FBSyxDQUFDLDhEQUE4RCxDQUFDLENBQUM7U0FDakY7UUFDRCxPQUFPLHNCQUFzQixDQUFDLHNCQUFzQixDQUFDO0lBQ3ZELENBQUM7SUFFRCw4Q0FBOEM7SUFDOUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFhO1FBQzVCLElBQUksc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDakQsTUFBTSxLQUFLLENBQ1QsaUZBQWlGLENBQ2xGLENBQUM7U0FDSDtRQUNELHNCQUFzQixDQUFDLHNCQUFzQixHQUFHLElBQUksc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUNGO0FBckdELHdEQXFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nRGV2Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHt5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtcbiAgZ2V0UmVwb3NpdG9yeUdpdFVybCxcbiAgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCxcbiAgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTCxcbn0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBEZXNjcmliZXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHRlc3QgZm9yIGdpdmVuIEdpdGh1YiBPQXV0aCBzY29wZXMuICovXG5leHBvcnQgdHlwZSBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uID0gKHNjb3Blczogc3RyaW5nW10sIG1pc3Npbmc6IHN0cmluZ1tdKSA9PiB2b2lkO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgYEdpdENsaWVudGAgd2l0aCBhZGRpdGlvbmFsIHV0aWxpdGllcyB3aGljaCBhcmUgdXNlZnVsIGZvclxuICogYXV0aGVudGljYXRlZCBHaXQgY2xpZW50IGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQgZXh0ZW5kcyBHaXRDbGllbnQge1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAodGhpcy5naXRodWJUb2tlbiwgJ2cnKTtcblxuICAvKiogVGhlIE9BdXRoIHNjb3BlcyBhdmFpbGFibGUgZm9yIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2NhY2hlZE9hdXRoU2NvcGVzOiBQcm9taXNlPHN0cmluZ1tdPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBJbnN0YW5jZSBvZiBhbiBhdXRoZW50aWNhdGVkIGdpdGh1YiBjbGllbnQuICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50KHRoaXMuZ2l0aHViVG9rZW4pO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihyZWFkb25seSBnaXRodWJUb2tlbjogc3RyaW5nLCBiYXNlRGlyPzogc3RyaW5nLCBjb25maWc/OiBOZ0RldkNvbmZpZykge1xuICAgIHN1cGVyKGJhc2VEaXIsIGNvbmZpZyk7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG92ZXJyaWRlIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl9naXRodWJUb2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBvdmVycmlkZSBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnLCB0aGlzLmdpdGh1YlRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhlIEdpdENsaWVudCBpbnN0YW5jZSBpcyB1c2luZyBhIHRva2VuIHdpdGggcGVybWlzc2lvbnMgZm9yIHRoZSBhbGwgb2YgdGhlXG4gICAqIHByb3ZpZGVkIE9BdXRoIHNjb3Blcy5cbiAgICovXG4gIGFzeW5jIGhhc09hdXRoU2NvcGVzKHRlc3RGbjogT0F1dGhTY29wZVRlc3RGdW5jdGlvbik6IFByb21pc2U8dHJ1ZSB8IHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUHJlLWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgLy8gcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgIGNvbnN0IGVycm9yID1cbiAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgYCAgJHtHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfVxcblxcbmAgK1xuICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cbiAgLyoqIEZldGNoIHRoZSBPQXV0aCBzY29wZXMgZm9yIHRoZSBsb2FkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9mZXRjaEF1dGhTY29wZXNGb3JUb2tlbigpIHtcbiAgICAvLyBJZiB0aGUgT0F1dGggc2NvcGVzIGhhdmUgYWxyZWFkeSBiZWVuIGxvYWRlZCwgcmV0dXJuIHRoZSBQcm9taXNlIGNvbnRhaW5pbmcgdGhlbS5cbiAgICBpZiAodGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcztcbiAgICB9XG4gICAgLy8gT0F1dGggc2NvcGVzIGFyZSBsb2FkZWQgdmlhIHRoZSAvcmF0ZV9saW1pdCBlbmRwb2ludCB0byBwcmV2ZW50XG4gICAgLy8gdXNhZ2Ugb2YgYSByZXF1ZXN0IGFnYWluc3QgdGhhdCByYXRlX2xpbWl0IGZvciB0aGlzIGxvb2t1cC5cbiAgICByZXR1cm4gKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzID0gdGhpcy5naXRodWIucmF0ZUxpbWl0LmdldCgpLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICBjb25zdCBzY29wZXMgPSByZXNwb25zZS5oZWFkZXJzWyd4LW9hdXRoLXNjb3BlcyddO1xuXG4gICAgICAvLyBJZiBubyB0b2tlbiBpcyBwcm92aWRlZCwgb3IgaWYgdGhlIEdpdGh1YiBjbGllbnQgaXMgYXV0aGVudGljYXRlZCBpbmNvcnJlY3RseSxcbiAgICAgIC8vIHRoZSBgeC1vYXV0aC1zY29wZXNgIHJlc3BvbnNlIGhlYWRlciBpcyBub3Qgc2V0LiBXZSBlcnJvciBpbiBzdWNoIGNhc2VzIGFzIGl0XG4gICAgICAvLyBzaWduaWZpZXMgYSBmYXVsdHkgIG9mIHRoZVxuICAgICAgaWYgKHNjb3BlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcmV0cmlldmUgT0F1dGggc2NvcGVzIGZvciB0b2tlbiBwcm92aWRlZCB0byBHaXQgY2xpZW50LicpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2NvcGVzXG4gICAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAgIC5tYXAoKHNjb3BlKSA9PiBzY29wZS50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoKHNjb3BlKSA9PiBzY29wZSAhPT0gJycpO1xuICAgIH0pKTtcbiAgfVxuXG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAuICovXG4gIHByaXZhdGUgc3RhdGljIF9hdXRoZW50aWNhdGVkSW5zdGFuY2U6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQ7XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBtZXRob2QgdG8gZ2V0IHRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCxcbiAgICogY3JlYXRpbmcgaXQgaWYgaXQgaGFzIG5vdCB5ZXQgYmVlbiBjcmVhdGVkLlxuICAgKi9cbiAgc3RhdGljIG92ZXJyaWRlIGdldCgpOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IHtcbiAgICBpZiAoIUF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBpbnN0YW5jZSBvZiBgQXV0aGVudGljYXRlZEdpdENsaWVudGAgaGFzIGJlZW4gc2V0IHVwIHlldC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZTtcbiAgfVxuXG4gIC8qKiBDb25maWd1cmVzIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgc3RhdGljIGNvbmZpZ3VyZSh0b2tlbjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdVbmFibGUgdG8gY29uZmlndXJlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBhcyBpdCBoYXMgYmVlbiBjb25maWd1cmVkIGFscmVhZHkuJyxcbiAgICAgICk7XG4gICAgfVxuICAgIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQuX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZSA9IG5ldyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50KHRva2VuKTtcbiAgfVxufVxuIl19