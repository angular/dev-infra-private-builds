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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsd0NBQWtDO0FBRWxDLDZDQUF1QztBQUN2QyxxQ0FBbUQ7QUFDbkQsK0NBSXVCO0FBS3ZCOzs7R0FHRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsc0JBQVM7SUFhbkQsWUFDVyxXQUFtQixFQUM1QixPQUFnQixFQUNoQixNQUErQjtRQUUvQixLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBSmQsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFiOUI7OztXQUdHO1FBQ2Msc0JBQWlCLEdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUvRSxnRUFBZ0U7UUFDeEQsdUJBQWtCLEdBQTZCLElBQUksQ0FBQztRQUU1RCxrREFBa0Q7UUFDaEMsV0FBTSxHQUFHLElBQUksa0NBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBUTNFLENBQUM7SUFFRCxrRkFBa0Y7SUFDekUscUJBQXFCLENBQUMsS0FBYTtRQUMxQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCwwREFBMEQ7SUFDakQsYUFBYTtRQUNwQixPQUFPLGlDQUFtQixDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQThCO1FBQ2pELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7UUFDckQsTUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBQ25DLHFEQUFxRDtRQUNyRCxNQUFNLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQzlCLDBGQUEwRjtRQUMxRixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxpRkFBaUY7UUFDakYsNEJBQTRCO1FBQzVCLE1BQU0sS0FBSyxHQUNULG1GQUFtRjtZQUNuRixHQUFHLGdCQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNO1lBQ3pDLCtCQUErQjtZQUMvQixLQUFLLHVDQUF5QixNQUFNO1lBQ3BDLGlEQUFpRCx1Q0FBeUIsSUFBSSxDQUFDO1FBRWpGLE9BQU8sRUFBQyxLQUFLLEVBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQsMERBQTBEO0lBQ2xELHdCQUF3QjtRQUM5QixvRkFBb0Y7UUFDcEYsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQ2hDO1FBQ0Qsa0VBQWtFO1FBQ2xFLDhEQUE4RDtRQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVsRCxpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLDZCQUE2QjtZQUM3QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE1BQU0sS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7YUFDbEY7WUFFRCxPQUFPLE1BQU07aUJBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDVixHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDNUIsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFLRDs7O09BR0c7SUFDSCxNQUFNLENBQVUsR0FBRztRQUNqQixJQUFJLENBQUMsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQztJQUN2RCxDQUFDO0lBRUQsOENBQThDO0lBQzlDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBYTtRQUM1QixJQUFJLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO1lBQ2pELE1BQU0sS0FBSyxDQUNULGlGQUFpRixDQUNsRixDQUFDO1NBQ0g7UUFDRCxzQkFBc0IsQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLENBQUM7Q0FDRjtBQXpHRCx3REF5R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge3llbGxvd30gZnJvbSAnLi4vY29uc29sZSc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuL2dpdC1jbGllbnQnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50fSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge1xuICBnZXRSZXBvc2l0b3J5R2l0VXJsLFxuICBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMLFxuICBHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMLFxufSBmcm9tICcuL2dpdGh1Yi11cmxzJztcblxuLyoqIERlc2NyaWJlcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gdGVzdCBmb3IgZ2l2ZW4gR2l0aHViIE9BdXRoIHNjb3Blcy4gKi9cbmV4cG9ydCB0eXBlIE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24gPSAoc2NvcGVzOiBzdHJpbmdbXSwgbWlzc2luZzogc3RyaW5nW10pID0+IHZvaWQ7XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHRoZSBgR2l0Q2xpZW50YCB3aXRoIGFkZGl0aW9uYWwgdXRpbGl0aWVzIHdoaWNoIGFyZSB1c2VmdWwgZm9yXG4gKiBhdXRoZW50aWNhdGVkIEdpdCBjbGllbnQgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRlZEdpdENsaWVudCBleHRlbmRzIEdpdENsaWVudCB7XG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uIFVzZWQgZm9yXG4gICAqIHNhbml0aXppbmcgdGhlIHRva2VuIGZyb20gR2l0IGNoaWxkIHByb2Nlc3Mgb3V0cHV0LlxuICAgKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZ2l0aHViVG9rZW5SZWdleDogUmVnRXhwID0gbmV3IFJlZ0V4cCh0aGlzLmdpdGh1YlRva2VuLCAnZycpO1xuXG4gIC8qKiBUaGUgT0F1dGggc2NvcGVzIGF2YWlsYWJsZSBmb3IgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkT2F1dGhTY29wZXM6IFByb21pc2U8c3RyaW5nW10+IHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIEluc3RhbmNlIG9mIGFuIGF1dGhlbnRpY2F0ZWQgZ2l0aHViIGNsaWVudC4gKi9cbiAgb3ZlcnJpZGUgcmVhZG9ubHkgZ2l0aHViID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQodGhpcy5naXRodWJUb2tlbik7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgIHJlYWRvbmx5IGdpdGh1YlRva2VuOiBzdHJpbmcsXG4gICAgYmFzZURpcj86IHN0cmluZyxcbiAgICBjb25maWc/OiB7Z2l0aHViOiBHaXRodWJDb25maWd9LFxuICApIHtcbiAgICBzdXBlcihiYXNlRGlyLCBjb25maWcpO1xuICB9XG5cbiAgLyoqIFNhbml0aXplcyBhIGdpdmVuIG1lc3NhZ2UgYnkgb21pdHRpbmcgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbiBpZiBwcmVzZW50LiAqL1xuICBvdmVycmlkZSBzYW5pdGl6ZUNvbnNvbGVPdXRwdXQodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UodGhpcy5fZ2l0aHViVG9rZW5SZWdleCwgJzxUT0tFTj4nKTtcbiAgfVxuXG4gIC8qKiBHaXQgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gKi9cbiAgb3ZlcnJpZGUgZ2V0UmVwb0dpdFVybCgpIHtcbiAgICByZXR1cm4gZ2V0UmVwb3NpdG9yeUdpdFVybCh0aGlzLnJlbW90ZUNvbmZpZywgdGhpcy5naXRodWJUb2tlbik7XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoZSBHaXRDbGllbnQgaW5zdGFuY2UgaXMgdXNpbmcgYSB0b2tlbiB3aXRoIHBlcm1pc3Npb25zIGZvciB0aGUgYWxsIG9mIHRoZVxuICAgKiBwcm92aWRlZCBPQXV0aCBzY29wZXMuXG4gICAqL1xuICBhc3luYyBoYXNPYXV0aFNjb3Blcyh0ZXN0Rm46IE9BdXRoU2NvcGVUZXN0RnVuY3Rpb24pOiBQcm9taXNlPHRydWUgfCB7ZXJyb3I6IHN0cmluZ30+IHtcbiAgICBjb25zdCBzY29wZXMgPSBhd2FpdCB0aGlzLl9mZXRjaEF1dGhTY29wZXNGb3JUb2tlbigpO1xuICAgIGNvbnN0IG1pc3NpbmdTY29wZXM6IHN0cmluZ1tdID0gW107XG4gICAgLy8gVGVzdCBHaXRodWIgT0F1dGggc2NvcGVzIGFuZCBjb2xsZWN0IG1pc3Npbmcgb25lcy5cbiAgICB0ZXN0Rm4oc2NvcGVzLCBtaXNzaW5nU2NvcGVzKTtcbiAgICAvLyBJZiBubyBtaXNzaW5nIHNjb3BlcyBhcmUgZm91bmQsIHJldHVybiB0cnVlIHRvIGluZGljYXRlIGFsbCBPQXV0aCBTY29wZXMgYXJlIGF2YWlsYWJsZS5cbiAgICBpZiAobWlzc2luZ1Njb3Blcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIFByZS1jb25zdHJ1Y3RlZCBlcnJvciBtZXNzYWdlIHRvIGxvZyB0byB0aGUgdXNlciwgcHJvdmlkaW5nIG1pc3Npbmcgc2NvcGVzIGFuZFxuICAgIC8vIHJlbWVkaWF0aW9uIGluc3RydWN0aW9ucy5cbiAgICBjb25zdCBlcnJvciA9XG4gICAgICBgVGhlIHByb3ZpZGVkIDxUT0tFTj4gZG9lcyBub3QgaGF2ZSByZXF1aXJlZCBwZXJtaXNzaW9ucyBkdWUgdG8gbWlzc2luZyBzY29wZShzKTogYCArXG4gICAgICBgJHt5ZWxsb3cobWlzc2luZ1Njb3Blcy5qb2luKCcsICcpKX1cXG5cXG5gICtcbiAgICAgIGBVcGRhdGUgdGhlIHRva2VuIGluIHVzZSBhdDpcXG5gICtcbiAgICAgIGAgICR7R0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTH1cXG5cXG5gICtcbiAgICAgIGBBbHRlcm5hdGl2ZWx5LCBhIG5ldyB0b2tlbiBjYW4gYmUgY3JlYXRlZCBhdDogJHtHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMfVxcbmA7XG5cbiAgICByZXR1cm4ge2Vycm9yfTtcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyA9IHRoaXMuZ2l0aHViLnJhdGVMaW1pdC5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3Qgc2NvcGVzID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXTtcblxuICAgICAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIG9yIGlmIHRoZSBHaXRodWIgY2xpZW50IGlzIGF1dGhlbnRpY2F0ZWQgaW5jb3JyZWN0bHksXG4gICAgICAvLyB0aGUgYHgtb2F1dGgtc2NvcGVzYCByZXNwb25zZSBoZWFkZXIgaXMgbm90IHNldC4gV2UgZXJyb3IgaW4gc3VjaCBjYXNlcyBhcyBpdFxuICAgICAgLy8gc2lnbmlmaWVzIGEgZmF1bHR5ICBvZiB0aGVcbiAgICAgIGlmIChzY29wZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBFcnJvcignVW5hYmxlIHRvIHJldHJpZXZlIE9BdXRoIHNjb3BlcyBmb3IgdG9rZW4gcHJvdmlkZWQgdG8gR2l0IGNsaWVudC4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNjb3Blc1xuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAubWFwKChzY29wZSkgPT4gc2NvcGUudHJpbSgpKVxuICAgICAgICAuZmlsdGVyKChzY29wZSkgPT4gc2NvcGUgIT09ICcnKTtcbiAgICB9KSk7XG4gIH1cblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfYXV0aGVudGljYXRlZEluc3RhbmNlOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAsXG4gICAqIGNyZWF0aW5nIGl0IGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBvdmVycmlkZSBnZXQoKTogQXV0aGVudGljYXRlZEdpdENsaWVudCB7XG4gICAgaWYgKCFBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5zdGFuY2Ugb2YgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGhhcyBiZWVuIHNldCB1cCB5ZXQuJyk7XG4gICAgfVxuICAgIHJldHVybiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cblxuICAvKiogQ29uZmlndXJlcyBhbiBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHN0YXRpYyBjb25maWd1cmUodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnVW5hYmxlIHRvIGNvbmZpZ3VyZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAgYXMgaXQgaGFzIGJlZW4gY29uZmlndXJlZCBhbHJlYWR5LicsXG4gICAgICApO1xuICAgIH1cbiAgICBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UgPSBuZXcgQXV0aGVudGljYXRlZEdpdENsaWVudCh0b2tlbik7XG4gIH1cbn1cbiJdfQ==