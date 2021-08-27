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
        return (0, github_urls_1.getRepositoryGitUrl)(this.remoteConfig, this.githubToken);
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
            `${(0, console_1.yellow)(missingScopes.join(', '))}\n\n` +
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsd0NBQWtDO0FBRWxDLDZDQUF1QztBQUN2QyxxQ0FBbUQ7QUFDbkQsK0NBSXVCO0FBS3ZCOzs7R0FHRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsc0JBQVM7SUFhbkQsWUFDVyxXQUFtQixFQUM1QixPQUFnQixFQUNoQixNQUErQjtRQUUvQixLQUFLLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBSmQsZ0JBQVcsR0FBWCxXQUFXLENBQVE7UUFiOUI7OztXQUdHO1FBQ2Msc0JBQWlCLEdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUvRSxnRUFBZ0U7UUFDeEQsdUJBQWtCLEdBQTZCLElBQUksQ0FBQztRQUU1RCxrREFBa0Q7UUFDaEMsV0FBTSxHQUFHLElBQUksa0NBQXlCLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBUTNFLENBQUM7SUFFRCxrRkFBa0Y7SUFDekUscUJBQXFCLENBQUMsS0FBYTtRQUMxQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCwwREFBMEQ7SUFDakQsYUFBYTtRQUNwQixPQUFPLElBQUEsaUNBQW1CLEVBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUVEOzs7T0FHRztJQUNILEtBQUssQ0FBQyxjQUFjLENBQUMsTUFBOEI7UUFDakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUNyRCxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7UUFDbkMscURBQXFEO1FBQ3JELE1BQU0sQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDOUIsMEZBQTBGO1FBQzFGLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELGlGQUFpRjtRQUNqRiw0QkFBNEI7UUFDNUIsTUFBTSxLQUFLLEdBQ1QsbUZBQW1GO1lBQ25GLEdBQUcsSUFBQSxnQkFBTSxFQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTTtZQUN6QywrQkFBK0I7WUFDL0IsS0FBSyx1Q0FBeUIsTUFBTTtZQUNwQyxpREFBaUQsdUNBQXlCLElBQUksQ0FBQztRQUVqRixPQUFPLEVBQUMsS0FBSyxFQUFDLENBQUM7SUFDakIsQ0FBQztJQUVELDBEQUEwRDtJQUNsRCx3QkFBd0I7UUFDOUIsb0ZBQW9GO1FBQ3BGLElBQUksSUFBSSxDQUFDLGtCQUFrQixLQUFLLElBQUksRUFBRTtZQUNwQyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztTQUNoQztRQUNELGtFQUFrRTtRQUNsRSw4REFBOEQ7UUFDOUQsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRTtZQUM5RSxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFbEQsaUZBQWlGO1lBQ2pGLGdGQUFnRjtZQUNoRiw2QkFBNkI7WUFDN0IsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN4QixNQUFNLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO2FBQ2xGO1lBRUQsT0FBTyxNQUFNO2lCQUNWLEtBQUssQ0FBQyxHQUFHLENBQUM7aUJBQ1YsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQzVCLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTixDQUFDO0lBS0Q7OztPQUdHO0lBQ0gsTUFBTSxDQUFVLEdBQUc7UUFDakIsSUFBSSxDQUFDLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO1lBQ2xELE1BQU0sSUFBSSxLQUFLLENBQUMsOERBQThELENBQUMsQ0FBQztTQUNqRjtRQUNELE9BQU8sc0JBQXNCLENBQUMsc0JBQXNCLENBQUM7SUFDdkQsQ0FBQztJQUVELDhDQUE4QztJQUM5QyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQWE7UUFDNUIsSUFBSSxzQkFBc0IsQ0FBQyxzQkFBc0IsRUFBRTtZQUNqRCxNQUFNLEtBQUssQ0FDVCxpRkFBaUYsQ0FDbEYsQ0FBQztTQUNIO1FBQ0Qsc0JBQXNCLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQ0Y7QUF6R0Qsd0RBeUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHt5ZWxsb3d9IGZyb20gJy4uL2NvbnNvbGUnO1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdGh1YkNsaWVudH0gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtcbiAgZ2V0UmVwb3NpdG9yeUdpdFVybCxcbiAgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCxcbiAgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTCxcbn0gZnJvbSAnLi9naXRodWItdXJscyc7XG5cbi8qKiBEZXNjcmliZXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHRlc3QgZm9yIGdpdmVuIEdpdGh1YiBPQXV0aCBzY29wZXMuICovXG5leHBvcnQgdHlwZSBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uID0gKHNjb3Blczogc3RyaW5nW10sIG1pc3Npbmc6IHN0cmluZ1tdKSA9PiB2b2lkO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgYEdpdENsaWVudGAgd2l0aCBhZGRpdGlvbmFsIHV0aWxpdGllcyB3aGljaCBhcmUgdXNlZnVsIGZvclxuICogYXV0aGVudGljYXRlZCBHaXQgY2xpZW50IGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQgZXh0ZW5kcyBHaXRDbGllbnQge1xuICAvKipcbiAgICogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiBVc2VkIGZvclxuICAgKiBzYW5pdGl6aW5nIHRoZSB0b2tlbiBmcm9tIEdpdCBjaGlsZCBwcm9jZXNzIG91dHB1dC5cbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX2dpdGh1YlRva2VuUmVnZXg6IFJlZ0V4cCA9IG5ldyBSZWdFeHAodGhpcy5naXRodWJUb2tlbiwgJ2cnKTtcblxuICAvKiogVGhlIE9BdXRoIHNjb3BlcyBhdmFpbGFibGUgZm9yIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2NhY2hlZE9hdXRoU2NvcGVzOiBQcm9taXNlPHN0cmluZ1tdPiB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBJbnN0YW5jZSBvZiBhbiBhdXRoZW50aWNhdGVkIGdpdGh1YiBjbGllbnQuICovXG4gIG92ZXJyaWRlIHJlYWRvbmx5IGdpdGh1YiA9IG5ldyBBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50KHRoaXMuZ2l0aHViVG9rZW4pO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICByZWFkb25seSBnaXRodWJUb2tlbjogc3RyaW5nLFxuICAgIGJhc2VEaXI/OiBzdHJpbmcsXG4gICAgY29uZmlnPzoge2dpdGh1YjogR2l0aHViQ29uZmlnfSxcbiAgKSB7XG4gICAgc3VwZXIoYmFzZURpciwgY29uZmlnKTtcbiAgfVxuXG4gIC8qKiBTYW5pdGl6ZXMgYSBnaXZlbiBtZXNzYWdlIGJ5IG9taXR0aW5nIHRoZSBwcm92aWRlZCBHaXRodWIgdG9rZW4gaWYgcHJlc2VudC4gKi9cbiAgb3ZlcnJpZGUgc2FuaXRpemVDb25zb2xlT3V0cHV0KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKHRoaXMuX2dpdGh1YlRva2VuUmVnZXgsICc8VE9LRU4+Jyk7XG4gIH1cblxuICAvKiogR2l0IFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkuICovXG4gIG92ZXJyaWRlIGdldFJlcG9HaXRVcmwoKSB7XG4gICAgcmV0dXJuIGdldFJlcG9zaXRvcnlHaXRVcmwodGhpcy5yZW1vdGVDb25maWcsIHRoaXMuZ2l0aHViVG9rZW4pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgR2l0Q2xpZW50IGluc3RhbmNlIGlzIHVzaW5nIGEgdG9rZW4gd2l0aCBwZXJtaXNzaW9ucyBmb3IgdGhlIGFsbCBvZiB0aGVcbiAgICogcHJvdmlkZWQgT0F1dGggc2NvcGVzLlxuICAgKi9cbiAgYXN5bmMgaGFzT2F1dGhTY29wZXModGVzdEZuOiBPQXV0aFNjb3BlVGVzdEZ1bmN0aW9uKTogUHJvbWlzZTx0cnVlIHwge2Vycm9yOiBzdHJpbmd9PiB7XG4gICAgY29uc3Qgc2NvcGVzID0gYXdhaXQgdGhpcy5fZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKTtcbiAgICBjb25zdCBtaXNzaW5nU2NvcGVzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIFRlc3QgR2l0aHViIE9BdXRoIHNjb3BlcyBhbmQgY29sbGVjdCBtaXNzaW5nIG9uZXMuXG4gICAgdGVzdEZuKHNjb3BlcywgbWlzc2luZ1Njb3Blcyk7XG4gICAgLy8gSWYgbm8gbWlzc2luZyBzY29wZXMgYXJlIGZvdW5kLCByZXR1cm4gdHJ1ZSB0byBpbmRpY2F0ZSBhbGwgT0F1dGggU2NvcGVzIGFyZSBhdmFpbGFibGUuXG4gICAgaWYgKG1pc3NpbmdTY29wZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBQcmUtY29uc3RydWN0ZWQgZXJyb3IgbWVzc2FnZSB0byBsb2cgdG8gdGhlIHVzZXIsIHByb3ZpZGluZyBtaXNzaW5nIHNjb3BlcyBhbmRcbiAgICAvLyByZW1lZGlhdGlvbiBpbnN0cnVjdGlvbnMuXG4gICAgY29uc3QgZXJyb3IgPVxuICAgICAgYFRoZSBwcm92aWRlZCA8VE9LRU4+IGRvZXMgbm90IGhhdmUgcmVxdWlyZWQgcGVybWlzc2lvbnMgZHVlIHRvIG1pc3Npbmcgc2NvcGUocyk6IGAgK1xuICAgICAgYCR7eWVsbG93KG1pc3NpbmdTY29wZXMuam9pbignLCAnKSl9XFxuXFxuYCArXG4gICAgICBgVXBkYXRlIHRoZSB0b2tlbiBpbiB1c2UgYXQ6XFxuYCArXG4gICAgICBgICAke0dJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkx9XFxuXFxuYCArXG4gICAgICBgQWx0ZXJuYXRpdmVseSwgYSBuZXcgdG9rZW4gY2FuIGJlIGNyZWF0ZWQgYXQ6ICR7R0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTH1cXG5gO1xuXG4gICAgcmV0dXJuIHtlcnJvcn07XG4gIH1cblxuICAvKiogRmV0Y2ggdGhlIE9BdXRoIHNjb3BlcyBmb3IgdGhlIGxvYWRlZCBHaXRodWIgdG9rZW4uICovXG4gIHByaXZhdGUgX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCkge1xuICAgIC8vIElmIHRoZSBPQXV0aCBzY29wZXMgaGF2ZSBhbHJlYWR5IGJlZW4gbG9hZGVkLCByZXR1cm4gdGhlIFByb21pc2UgY29udGFpbmluZyB0aGVtLlxuICAgIGlmICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzO1xuICAgIH1cbiAgICAvLyBPQXV0aCBzY29wZXMgYXJlIGxvYWRlZCB2aWEgdGhlIC9yYXRlX2xpbWl0IGVuZHBvaW50IHRvIHByZXZlbnRcbiAgICAvLyB1c2FnZSBvZiBhIHJlcXVlc3QgYWdhaW5zdCB0aGF0IHJhdGVfbGltaXQgZm9yIHRoaXMgbG9va3VwLlxuICAgIHJldHVybiAodGhpcy5fY2FjaGVkT2F1dGhTY29wZXMgPSB0aGlzLmdpdGh1Yi5yYXRlTGltaXQuZ2V0KCkudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlcyA9IHJlc3BvbnNlLmhlYWRlcnNbJ3gtb2F1dGgtc2NvcGVzJ107XG5cbiAgICAgIC8vIElmIG5vIHRva2VuIGlzIHByb3ZpZGVkLCBvciBpZiB0aGUgR2l0aHViIGNsaWVudCBpcyBhdXRoZW50aWNhdGVkIGluY29ycmVjdGx5LFxuICAgICAgLy8gdGhlIGB4LW9hdXRoLXNjb3Blc2AgcmVzcG9uc2UgaGVhZGVyIGlzIG5vdCBzZXQuIFdlIGVycm9yIGluIHN1Y2ggY2FzZXMgYXMgaXRcbiAgICAgIC8vIHNpZ25pZmllcyBhIGZhdWx0eSAgb2YgdGhlXG4gICAgICBpZiAoc2NvcGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoJ1VuYWJsZSB0byByZXRyaWV2ZSBPQXV0aCBzY29wZXMgZm9yIHRva2VuIHByb3ZpZGVkIHRvIEdpdCBjbGllbnQuJyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzY29wZXNcbiAgICAgICAgLnNwbGl0KCcsJylcbiAgICAgICAgLm1hcCgoc2NvcGUpID0+IHNjb3BlLnRyaW0oKSlcbiAgICAgICAgLmZpbHRlcigoc2NvcGUpID0+IHNjb3BlICE9PSAnJyk7XG4gICAgfSkpO1xuICB9XG5cbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YC4gKi9cbiAgcHJpdmF0ZSBzdGF0aWMgX2F1dGhlbnRpY2F0ZWRJbnN0YW5jZTogQXV0aGVudGljYXRlZEdpdENsaWVudDtcblxuICAvKipcbiAgICogU3RhdGljIG1ldGhvZCB0byBnZXQgdGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLFxuICAgKiBjcmVhdGluZyBpdCBpZiBpdCBoYXMgbm90IHlldCBiZWVuIGNyZWF0ZWQuXG4gICAqL1xuICBzdGF0aWMgb3ZlcnJpZGUgZ2V0KCk6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQge1xuICAgIGlmICghQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIGluc3RhbmNlIG9mIGBBdXRoZW50aWNhdGVkR2l0Q2xpZW50YCBoYXMgYmVlbiBzZXQgdXAgeWV0LicpO1xuICAgIH1cbiAgICByZXR1cm4gQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlO1xuICB9XG5cbiAgLyoqIENvbmZpZ3VyZXMgYW4gYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBzdGF0aWMgY29uZmlndXJlKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgJ1VuYWJsZSB0byBjb25maWd1cmUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGFzIGl0IGhhcyBiZWVuIGNvbmZpZ3VyZWQgYWxyZWFkeS4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgQXV0aGVudGljYXRlZEdpdENsaWVudC5fYXV0aGVudGljYXRlZEluc3RhbmNlID0gbmV3IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQodG9rZW4pO1xuICB9XG59XG4iXX0=