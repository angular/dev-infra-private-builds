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
const graphql_queries_1 = require("./graphql-queries");
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
        /** Cached found fork of the configured project. */
        this._cachedForkRepo = null;
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
    /**
     * Gets an owned fork for the configured project of the authenticated user, caching the determined
     * fork repository as the authenticated user cannot change during action execution.
     */
    async getForkOfAuthenticatedUser() {
        if (this._cachedForkRepo !== null) {
            return this._cachedForkRepo;
        }
        const { owner, name } = this.remoteConfig;
        const result = await this.github.graphql(graphql_queries_1.findOwnedForksOfRepoQuery, { owner, name });
        const forks = result.repository.forks.nodes;
        if (forks.length === 0) {
            throw Error('Unable to find fork for currently authenticated user. Please ensure you created a fork ' +
                ` of: ${owner}/${name}.`);
        }
        const fork = forks[0];
        return (this._cachedForkRepo = { owner: fork.owner.login, name: fork.name });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRlZC1naXQtY2xpZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsdURBQTREO0FBQzVELHdDQUFrQztBQUVsQyw2Q0FBdUM7QUFDdkMscUNBQStEO0FBQy9ELCtDQUl1QjtBQUt2Qjs7O0dBR0c7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHNCQUFTO0lBZ0JuRCxZQUNXLFdBQW1CLEVBQzVCLE9BQWdCLEVBQ2hCLE1BQStCO1FBRS9CLEtBQUssQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFKZCxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQWhCOUI7OztXQUdHO1FBQ2Msc0JBQWlCLEdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUUvRSxnRUFBZ0U7UUFDeEQsdUJBQWtCLEdBQTZCLElBQUksQ0FBQztRQUU1RCxtREFBbUQ7UUFDM0Msb0JBQWUsR0FBc0IsSUFBSSxDQUFDO1FBRWxELGtEQUFrRDtRQUNoQyxXQUFNLEdBQUcsSUFBSSxrQ0FBeUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFRM0UsQ0FBQztJQUVELGtGQUFrRjtJQUN6RSxxQkFBcUIsQ0FBQyxLQUFhO1FBQzFDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVELDBEQUEwRDtJQUNqRCxhQUFhO1FBQ3BCLE9BQU8sSUFBQSxpQ0FBbUIsRUFBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUE4QjtRQUNqRCxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO1FBQ3JELE1BQU0sYUFBYSxHQUFhLEVBQUUsQ0FBQztRQUNuQyxxREFBcUQ7UUFDckQsTUFBTSxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztRQUM5QiwwRkFBMEY7UUFDMUYsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsaUZBQWlGO1FBQ2pGLDRCQUE0QjtRQUM1QixNQUFNLEtBQUssR0FDVCxtRkFBbUY7WUFDbkYsR0FBRyxJQUFBLGdCQUFNLEVBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNO1lBQ3pDLCtCQUErQjtZQUMvQixLQUFLLHVDQUF5QixNQUFNO1lBQ3BDLGlEQUFpRCx1Q0FBeUIsSUFBSSxDQUFDO1FBRWpGLE9BQU8sRUFBQyxLQUFLLEVBQUMsQ0FBQztJQUNqQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLDBCQUEwQjtRQUM5QixJQUFJLElBQUksQ0FBQyxlQUFlLEtBQUssSUFBSSxFQUFFO1lBQ2pDLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUM3QjtRQUVELE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUN4QyxNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDJDQUF5QixFQUFFLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDbkYsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBRTVDLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdEIsTUFBTSxLQUFLLENBQ1QseUZBQXlGO2dCQUN2RixRQUFRLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FDM0IsQ0FBQztTQUNIO1FBRUQsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRUQsMERBQTBEO0lBQ2xELHdCQUF3QjtRQUM5QixvRkFBb0Y7UUFDcEYsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssSUFBSSxFQUFFO1lBQ3BDLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1NBQ2hDO1FBQ0Qsa0VBQWtFO1FBQ2xFLDhEQUE4RDtRQUM5RCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFO1lBQzlFLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVsRCxpRkFBaUY7WUFDakYsZ0ZBQWdGO1lBQ2hGLDZCQUE2QjtZQUM3QixJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7Z0JBQ3hCLE1BQU0sS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7YUFDbEY7WUFFRCxPQUFPLE1BQU07aUJBQ1YsS0FBSyxDQUFDLEdBQUcsQ0FBQztpQkFDVixHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztpQkFDNUIsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLENBQUM7UUFDckMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFLRDs7O09BR0c7SUFDSCxNQUFNLENBQVUsR0FBRztRQUNqQixJQUFJLENBQUMsc0JBQXNCLENBQUMsc0JBQXNCLEVBQUU7WUFDbEQsTUFBTSxJQUFJLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxDQUFDO1NBQ2pGO1FBQ0QsT0FBTyxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQztJQUN2RCxDQUFDO0lBRUQsOENBQThDO0lBQzlDLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBYTtRQUM1QixJQUFJLHNCQUFzQixDQUFDLHNCQUFzQixFQUFFO1lBQ2pELE1BQU0sS0FBSyxDQUNULGlGQUFpRixDQUNsRixDQUFDO1NBQ0g7UUFDRCxzQkFBc0IsQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3BGLENBQUM7Q0FDRjtBQXBJRCx3REFvSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge2ZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnl9IGZyb20gJy4vZ3JhcGhxbC1xdWVyaWVzJztcbmltcG9ydCB7eWVsbG93fSBmcm9tICcuLi9jb25zb2xlJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0LWNsaWVudCc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQsIEdpdGh1YlJlcG99IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7XG4gIGdldFJlcG9zaXRvcnlHaXRVcmwsXG4gIEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwsXG4gIEdJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkwsXG59IGZyb20gJy4vZ2l0aHViLXVybHMnO1xuXG4vKiogRGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byB0ZXN0IGZvciBnaXZlbiBHaXRodWIgT0F1dGggc2NvcGVzLiAqL1xuZXhwb3J0IHR5cGUgT0F1dGhTY29wZVRlc3RGdW5jdGlvbiA9IChzY29wZXM6IHN0cmluZ1tdLCBtaXNzaW5nOiBzdHJpbmdbXSkgPT4gdm9pZDtcblxuLyoqXG4gKiBFeHRlbnNpb24gb2YgdGhlIGBHaXRDbGllbnRgIHdpdGggYWRkaXRpb25hbCB1dGlsaXRpZXMgd2hpY2ggYXJlIHVzZWZ1bCBmb3JcbiAqIGF1dGhlbnRpY2F0ZWQgR2l0IGNsaWVudCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkR2l0Q2xpZW50IGV4dGVuZHMgR2l0Q2xpZW50IHtcbiAgLyoqXG4gICAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIEdpdGh1YiB0b2tlbi4gVXNlZCBmb3JcbiAgICogc2FuaXRpemluZyB0aGUgdG9rZW4gZnJvbSBHaXQgY2hpbGQgcHJvY2VzcyBvdXRwdXQuXG4gICAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9naXRodWJUb2tlblJlZ2V4OiBSZWdFeHAgPSBuZXcgUmVnRXhwKHRoaXMuZ2l0aHViVG9rZW4sICdnJyk7XG5cbiAgLyoqIFRoZSBPQXV0aCBzY29wZXMgYXZhaWxhYmxlIGZvciB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuLiAqL1xuICBwcml2YXRlIF9jYWNoZWRPYXV0aFNjb3BlczogUHJvbWlzZTxzdHJpbmdbXT4gfCBudWxsID0gbnVsbDtcblxuICAvKiogQ2FjaGVkIGZvdW5kIGZvcmsgb2YgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkRm9ya1JlcG86IEdpdGh1YlJlcG8gfCBudWxsID0gbnVsbDtcblxuICAvKiogSW5zdGFuY2Ugb2YgYW4gYXV0aGVudGljYXRlZCBnaXRodWIgY2xpZW50LiAqL1xuICBvdmVycmlkZSByZWFkb25seSBnaXRodWIgPSBuZXcgQXV0aGVudGljYXRlZEdpdGh1YkNsaWVudCh0aGlzLmdpdGh1YlRva2VuKTtcblxuICBwcm90ZWN0ZWQgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgZ2l0aHViVG9rZW46IHN0cmluZyxcbiAgICBiYXNlRGlyPzogc3RyaW5nLFxuICAgIGNvbmZpZz86IHtnaXRodWI6IEdpdGh1YkNvbmZpZ30sXG4gICkge1xuICAgIHN1cGVyKGJhc2VEaXIsIGNvbmZpZyk7XG4gIH1cblxuICAvKiogU2FuaXRpemVzIGEgZ2l2ZW4gbWVzc2FnZSBieSBvbWl0dGluZyB0aGUgcHJvdmlkZWQgR2l0aHViIHRva2VuIGlmIHByZXNlbnQuICovXG4gIG92ZXJyaWRlIHNhbml0aXplQ29uc29sZU91dHB1dCh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdmFsdWUucmVwbGFjZSh0aGlzLl9naXRodWJUb2tlblJlZ2V4LCAnPFRPS0VOPicpO1xuICB9XG5cbiAgLyoqIEdpdCBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiAqL1xuICBvdmVycmlkZSBnZXRSZXBvR2l0VXJsKCkge1xuICAgIHJldHVybiBnZXRSZXBvc2l0b3J5R2l0VXJsKHRoaXMucmVtb3RlQ29uZmlnLCB0aGlzLmdpdGh1YlRva2VuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhlIEdpdENsaWVudCBpbnN0YW5jZSBpcyB1c2luZyBhIHRva2VuIHdpdGggcGVybWlzc2lvbnMgZm9yIHRoZSBhbGwgb2YgdGhlXG4gICAqIHByb3ZpZGVkIE9BdXRoIHNjb3Blcy5cbiAgICovXG4gIGFzeW5jIGhhc09hdXRoU2NvcGVzKHRlc3RGbjogT0F1dGhTY29wZVRlc3RGdW5jdGlvbik6IFByb21pc2U8dHJ1ZSB8IHtlcnJvcjogc3RyaW5nfT4ge1xuICAgIGNvbnN0IHNjb3BlcyA9IGF3YWl0IHRoaXMuX2ZldGNoQXV0aFNjb3Blc0ZvclRva2VuKCk7XG4gICAgY29uc3QgbWlzc2luZ1Njb3Blczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBUZXN0IEdpdGh1YiBPQXV0aCBzY29wZXMgYW5kIGNvbGxlY3QgbWlzc2luZyBvbmVzLlxuICAgIHRlc3RGbihzY29wZXMsIG1pc3NpbmdTY29wZXMpO1xuICAgIC8vIElmIG5vIG1pc3Npbmcgc2NvcGVzIGFyZSBmb3VuZCwgcmV0dXJuIHRydWUgdG8gaW5kaWNhdGUgYWxsIE9BdXRoIFNjb3BlcyBhcmUgYXZhaWxhYmxlLlxuICAgIGlmIChtaXNzaW5nU2NvcGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gUHJlLWNvbnN0cnVjdGVkIGVycm9yIG1lc3NhZ2UgdG8gbG9nIHRvIHRoZSB1c2VyLCBwcm92aWRpbmcgbWlzc2luZyBzY29wZXMgYW5kXG4gICAgLy8gcmVtZWRpYXRpb24gaW5zdHJ1Y3Rpb25zLlxuICAgIGNvbnN0IGVycm9yID1cbiAgICAgIGBUaGUgcHJvdmlkZWQgPFRPS0VOPiBkb2VzIG5vdCBoYXZlIHJlcXVpcmVkIHBlcm1pc3Npb25zIGR1ZSB0byBtaXNzaW5nIHNjb3BlKHMpOiBgICtcbiAgICAgIGAke3llbGxvdyhtaXNzaW5nU2NvcGVzLmpvaW4oJywgJykpfVxcblxcbmAgK1xuICAgICAgYFVwZGF0ZSB0aGUgdG9rZW4gaW4gdXNlIGF0OlxcbmAgK1xuICAgICAgYCAgJHtHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMfVxcblxcbmAgK1xuICAgICAgYEFsdGVybmF0aXZlbHksIGEgbmV3IHRva2VuIGNhbiBiZSBjcmVhdGVkIGF0OiAke0dJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkx9XFxuYDtcblxuICAgIHJldHVybiB7ZXJyb3J9O1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb3duZWQgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCBvZiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLCBjYWNoaW5nIHRoZSBkZXRlcm1pbmVkXG4gICAqIGZvcmsgcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBhc3luYyBnZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXRodWIuZ3JhcGhxbChmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5LCB7b3duZXIsIG5hbWV9KTtcbiAgICBjb25zdCBmb3JrcyA9IHJlc3VsdC5yZXBvc2l0b3J5LmZvcmtzLm5vZGVzO1xuXG4gICAgaWYgKGZvcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICdVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLiBQbGVhc2UgZW5zdXJlIHlvdSBjcmVhdGVkIGEgZm9yayAnICtcbiAgICAgICAgICBgIG9mOiAke293bmVyfS8ke25hbWV9LmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gKHRoaXMuX2NhY2hlZEZvcmtSZXBvID0ge293bmVyOiBmb3JrLm93bmVyLmxvZ2luLCBuYW1lOiBmb3JrLm5hbWV9KTtcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgT0F1dGggc2NvcGVzIGZvciB0aGUgbG9hZGVkIEdpdGh1YiB0b2tlbi4gKi9cbiAgcHJpdmF0ZSBfZmV0Y2hBdXRoU2NvcGVzRm9yVG9rZW4oKSB7XG4gICAgLy8gSWYgdGhlIE9BdXRoIHNjb3BlcyBoYXZlIGFscmVhZHkgYmVlbiBsb2FkZWQsIHJldHVybiB0aGUgUHJvbWlzZSBjb250YWluaW5nIHRoZW0uXG4gICAgaWYgKHRoaXMuX2NhY2hlZE9hdXRoU2NvcGVzICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkT2F1dGhTY29wZXM7XG4gICAgfVxuICAgIC8vIE9BdXRoIHNjb3BlcyBhcmUgbG9hZGVkIHZpYSB0aGUgL3JhdGVfbGltaXQgZW5kcG9pbnQgdG8gcHJldmVudFxuICAgIC8vIHVzYWdlIG9mIGEgcmVxdWVzdCBhZ2FpbnN0IHRoYXQgcmF0ZV9saW1pdCBmb3IgdGhpcyBsb29rdXAuXG4gICAgcmV0dXJuICh0aGlzLl9jYWNoZWRPYXV0aFNjb3BlcyA9IHRoaXMuZ2l0aHViLnJhdGVMaW1pdC5nZXQoKS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgY29uc3Qgc2NvcGVzID0gcmVzcG9uc2UuaGVhZGVyc1sneC1vYXV0aC1zY29wZXMnXTtcblxuICAgICAgLy8gSWYgbm8gdG9rZW4gaXMgcHJvdmlkZWQsIG9yIGlmIHRoZSBHaXRodWIgY2xpZW50IGlzIGF1dGhlbnRpY2F0ZWQgaW5jb3JyZWN0bHksXG4gICAgICAvLyB0aGUgYHgtb2F1dGgtc2NvcGVzYCByZXNwb25zZSBoZWFkZXIgaXMgbm90IHNldC4gV2UgZXJyb3IgaW4gc3VjaCBjYXNlcyBhcyBpdFxuICAgICAgLy8gc2lnbmlmaWVzIGEgZmF1bHR5ICBvZiB0aGVcbiAgICAgIGlmIChzY29wZXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBFcnJvcignVW5hYmxlIHRvIHJldHJpZXZlIE9BdXRoIHNjb3BlcyBmb3IgdG9rZW4gcHJvdmlkZWQgdG8gR2l0IGNsaWVudC4nKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNjb3Blc1xuICAgICAgICAuc3BsaXQoJywnKVxuICAgICAgICAubWFwKChzY29wZSkgPT4gc2NvcGUudHJpbSgpKVxuICAgICAgICAuZmlsdGVyKChzY29wZSkgPT4gc2NvcGUgIT09ICcnKTtcbiAgICB9KSk7XG4gIH1cblxuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgLiAqL1xuICBwcml2YXRlIHN0YXRpYyBfYXV0aGVudGljYXRlZEluc3RhbmNlOiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50O1xuXG4gIC8qKlxuICAgKiBTdGF0aWMgbWV0aG9kIHRvIGdldCB0aGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAsXG4gICAqIGNyZWF0aW5nIGl0IGlmIGl0IGhhcyBub3QgeWV0IGJlZW4gY3JlYXRlZC5cbiAgICovXG4gIHN0YXRpYyBvdmVycmlkZSBnZXQoKTogQXV0aGVudGljYXRlZEdpdENsaWVudCB7XG4gICAgaWYgKCFBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gaW5zdGFuY2Ugb2YgYEF1dGhlbnRpY2F0ZWRHaXRDbGllbnRgIGhhcyBiZWVuIHNldCB1cCB5ZXQuJyk7XG4gICAgfVxuICAgIHJldHVybiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2U7XG4gIH1cblxuICAvKiogQ29uZmlndXJlcyBhbiBhdXRoZW50aWNhdGVkIGdpdCBjbGllbnQuICovXG4gIHN0YXRpYyBjb25maWd1cmUodG9rZW46IHN0cmluZyk6IHZvaWQge1xuICAgIGlmIChBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAnVW5hYmxlIHRvIGNvbmZpZ3VyZSBgQXV0aGVudGljYXRlZEdpdENsaWVudGAgYXMgaXQgaGFzIGJlZW4gY29uZmlndXJlZCBhbHJlYWR5LicsXG4gICAgICApO1xuICAgIH1cbiAgICBBdXRoZW50aWNhdGVkR2l0Q2xpZW50Ll9hdXRoZW50aWNhdGVkSW5zdGFuY2UgPSBuZXcgQXV0aGVudGljYXRlZEdpdENsaWVudCh0b2tlbik7XG4gIH1cbn1cbiJdfQ==