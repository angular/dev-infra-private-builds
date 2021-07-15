/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __extends, __generator } from "tslib";
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
import { query } from 'typed-graphqlify';
/** Error for failed Github API requests. */
var GithubApiRequestError = /** @class */ (function (_super) {
    __extends(GithubApiRequestError, _super);
    function GithubApiRequestError(status, message) {
        var _this = _super.call(this, message) || this;
        _this.status = status;
        return _this;
    }
    return GithubApiRequestError;
}(Error));
export { GithubApiRequestError };
/** A Github client for interacting with the Github APIs. */
var GithubClient = /** @class */ (function () {
    function GithubClient(_octokitOptions) {
        this._octokitOptions = _octokitOptions;
        /** The octokit instance actually performing API requests. */
        this._octokit = new Octokit(this._octokitOptions);
        this.pulls = this._octokit.pulls;
        this.repos = this._octokit.repos;
        this.issues = this._octokit.issues;
        this.git = this._octokit.git;
        this.rateLimit = this._octokit.rateLimit;
        this.teams = this._octokit.teams;
        // Note: These are properties from `Octokit` that are brought in by optional plugins.
        // TypeScript requires us to provide an explicit type for these.
        this.rest = this._octokit.rest;
        this.paginate = this._octokit.paginate;
    }
    return GithubClient;
}());
export { GithubClient };
/**
 * Extension of the `GithubClient` that provides utilities which are specific
 * to authenticated instances.
 */
var AuthenticatedGithubClient = /** @class */ (function (_super) {
    __extends(AuthenticatedGithubClient, _super);
    function AuthenticatedGithubClient(_token) {
        var _this = 
        // Set the token for the octokit instance.
        _super.call(this, { auth: _token }) || this;
        _this._token = _token;
        /** The graphql instance with authentication set during construction. */
        _this._graphql = graphql.defaults({ headers: { authorization: "token " + _this._token } });
        return _this;
    }
    /** Perform a query using Github's Graphql API. */
    AuthenticatedGithubClient.prototype.graphql = function (queryObject, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._graphql(query(queryObject).toString(), params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    return AuthenticatedGithubClient;
}(GithubClient));
export { AuthenticatedGithubClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUd6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQWdCdkMsNENBQTRDO0FBQzVDO0lBQTJDLHlDQUFLO0lBQzlDLCtCQUFtQixNQUFjLEVBQUUsT0FBZTtRQUFsRCxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxTQUNmO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFKRCxDQUEyQyxLQUFLLEdBSS9DOztBQUVELDREQUE0RDtBQUM1RDtJQWdCRSxzQkFBb0IsZUFBZ0M7UUFBaEMsb0JBQWUsR0FBZixlQUFlLENBQWlCO1FBZnBELDZEQUE2RDtRQUNyRCxhQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRTVDLFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsV0FBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzlCLFFBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN4QixjQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7UUFDcEMsVUFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBRXJDLHFGQUFxRjtRQUNyRixnRUFBZ0U7UUFDdkQsU0FBSSxHQUF3QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztRQUMvQyxhQUFRLEdBQXNCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO0lBRVAsQ0FBQztJQUMxRCxtQkFBQztBQUFELENBQUMsQUFqQkQsSUFpQkM7O0FBRUQ7OztHQUdHO0FBQ0g7SUFBK0MsNkNBQVk7SUFJekQsbUNBQW9CLE1BQWM7UUFBbEM7UUFDRSwwQ0FBMEM7UUFDMUMsa0JBQU0sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsU0FDdEI7UUFIbUIsWUFBTSxHQUFOLE1BQU0sQ0FBUTtRQUhsQyx3RUFBd0U7UUFDaEUsY0FBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxLQUFJLENBQUMsTUFBUSxFQUFDLEVBQUMsQ0FBQyxDQUFDOztJQUt4RixDQUFDO0lBRUQsa0RBQWtEO0lBQzVDLDJDQUFPLEdBQWIsVUFBNEMsV0FBYyxFQUFFLE1BQThCO1FBQTlCLHVCQUFBLEVBQUEsV0FBOEI7Ozs7NEJBQ2hGLHFCQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFBOzRCQUFsRSxzQkFBTyxDQUFDLFNBQTBELENBQU0sRUFBQzs7OztLQUMxRTtJQUNILGdDQUFDO0FBQUQsQ0FBQyxBQWJELENBQStDLFlBQVksR0FhMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPY3Rva2l0T3B0aW9uc30gZnJvbSAnQG9jdG9raXQvY29yZS9kaXN0LXR5cGVzL3R5cGVzJztcbmltcG9ydCB7Z3JhcGhxbH0gZnJvbSAnQG9jdG9raXQvZ3JhcGhxbCc7XG5pbXBvcnQge1BhZ2luYXRlSW50ZXJmYWNlfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcGFnaW5hdGUtcmVzdCc7XG5pbXBvcnQge1Jlc3RFbmRwb2ludE1ldGhvZHN9IGZyb20gJ0BvY3Rva2l0L3BsdWdpbi1yZXN0LWVuZHBvaW50LW1ldGhvZHMvZGlzdC10eXBlcy9nZW5lcmF0ZWQvbWV0aG9kLXR5cGVzJztcbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge1JlcXVlc3RQYXJhbWV0ZXJzfSBmcm9tICdAb2N0b2tpdC90eXBlcyc7XG5pbXBvcnQge3F1ZXJ5fSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQ2xpZW50IHtcbiAgLyoqIFRoZSBvY3Rva2l0IGluc3RhbmNlIGFjdHVhbGx5IHBlcmZvcm1pbmcgQVBJIHJlcXVlc3RzLiAqL1xuICBwcml2YXRlIF9vY3Rva2l0ID0gbmV3IE9jdG9raXQodGhpcy5fb2N0b2tpdE9wdGlvbnMpO1xuXG4gIHJlYWRvbmx5IHB1bGxzID0gdGhpcy5fb2N0b2tpdC5wdWxscztcbiAgcmVhZG9ubHkgcmVwb3MgPSB0aGlzLl9vY3Rva2l0LnJlcG9zO1xuICByZWFkb25seSBpc3N1ZXMgPSB0aGlzLl9vY3Rva2l0Lmlzc3VlcztcbiAgcmVhZG9ubHkgZ2l0ID0gdGhpcy5fb2N0b2tpdC5naXQ7XG4gIHJlYWRvbmx5IHJhdGVMaW1pdCA9IHRoaXMuX29jdG9raXQucmF0ZUxpbWl0O1xuICByZWFkb25seSB0ZWFtcyA9IHRoaXMuX29jdG9raXQudGVhbXM7XG5cbiAgLy8gTm90ZTogVGhlc2UgYXJlIHByb3BlcnRpZXMgZnJvbSBgT2N0b2tpdGAgdGhhdCBhcmUgYnJvdWdodCBpbiBieSBvcHRpb25hbCBwbHVnaW5zLlxuICAvLyBUeXBlU2NyaXB0IHJlcXVpcmVzIHVzIHRvIHByb3ZpZGUgYW4gZXhwbGljaXQgdHlwZSBmb3IgdGhlc2UuXG4gIHJlYWRvbmx5IHJlc3Q6IFJlc3RFbmRwb2ludE1ldGhvZHMgPSB0aGlzLl9vY3Rva2l0LnJlc3Q7XG4gIHJlYWRvbmx5IHBhZ2luYXRlOiBQYWdpbmF0ZUludGVyZmFjZSA9IHRoaXMuX29jdG9raXQucGFnaW5hdGU7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfb2N0b2tpdE9wdGlvbnM/OiBPY3Rva2l0T3B0aW9ucykge31cbn1cblxuLyoqXG4gKiBFeHRlbnNpb24gb2YgdGhlIGBHaXRodWJDbGllbnRgIHRoYXQgcHJvdmlkZXMgdXRpbGl0aWVzIHdoaWNoIGFyZSBzcGVjaWZpY1xuICogdG8gYXV0aGVudGljYXRlZCBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBdXRoZW50aWNhdGVkR2l0aHViQ2xpZW50IGV4dGVuZHMgR2l0aHViQ2xpZW50IHtcbiAgLyoqIFRoZSBncmFwaHFsIGluc3RhbmNlIHdpdGggYXV0aGVudGljYXRpb24gc2V0IGR1cmluZyBjb25zdHJ1Y3Rpb24uICovXG4gIHByaXZhdGUgX2dyYXBocWwgPSBncmFwaHFsLmRlZmF1bHRzKHtoZWFkZXJzOiB7YXV0aG9yaXphdGlvbjogYHRva2VuICR7dGhpcy5fdG9rZW59YH19KTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF90b2tlbjogc3RyaW5nKSB7XG4gICAgLy8gU2V0IHRoZSB0b2tlbiBmb3IgdGhlIG9jdG9raXQgaW5zdGFuY2UuXG4gICAgc3VwZXIoe2F1dGg6IF90b2tlbn0pO1xuICB9XG5cbiAgLyoqIFBlcmZvcm0gYSBxdWVyeSB1c2luZyBHaXRodWIncyBHcmFwaHFsIEFQSS4gKi9cbiAgYXN5bmMgZ3JhcGhxbDxUIGV4dGVuZHMgR3JhcGhxbFF1ZXJ5T2JqZWN0PihxdWVyeU9iamVjdDogVCwgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVycyA9IHt9KSB7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9ncmFwaHFsKHF1ZXJ5KHF1ZXJ5T2JqZWN0KS50b1N0cmluZygpLCBwYXJhbXMpKSBhcyBUO1xuICB9XG59XG4iXX0=