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
/** Error for failed Github API requests. */
var GithubGraphqlClientError = /** @class */ (function (_super) {
    __extends(GithubGraphqlClientError, _super);
    function GithubGraphqlClientError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return GithubGraphqlClientError;
}(Error));
export { GithubGraphqlClientError };
/**
 * A Github client for interacting with the Github APIs.
 *
 * Additionally, provides convenience methods for actions which require multiple requests, or
 * would provide value from memoized style responses.
 **/
var GithubClient = /** @class */ (function () {
    /**
     * @param token The github authentication token for Github Rest and Graphql API requests.
     */
    function GithubClient(token) {
        this.token = token;
        /** The graphql instance with authentication set during construction. */
        this._graphql = graphql.defaults({ headers: { authorization: "token " + this.token } });
        /** The Octokit instance actually performing API requests. */
        this._octokit = new Octokit({ token: this.token });
        this.pulls = this._octokit.pulls;
        this.repos = this._octokit.repos;
        this.issues = this._octokit.issues;
        this.git = this._octokit.git;
        this.paginate = this._octokit.paginate;
        this.rateLimit = this._octokit.rateLimit;
        this._octokit.hook.error('request', function (error) {
            // Wrap API errors in a known error class. This allows us to
            // expect Github API errors better and in a non-ambiguous way.
            throw new GithubApiRequestError(error.status, error.message);
        });
    }
    /** Perform a query using Github's Graphql API. */
    GithubClient.prototype.graphql = function (queryObject, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.token === undefined) {
                            throw new GithubGraphqlClientError('Cannot query via graphql without an authentication token set, use the authenticated ' +
                                '`GitClient` by calling `GitClient.getAuthenticatedInstance()`.');
                        }
                        return [4 /*yield*/, this._graphql(query(queryObject).toString(), params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    return GithubClient;
}());
export { GithubClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQWdCdkMsNENBQTRDO0FBQzVDO0lBQTJDLHlDQUFLO0lBQzlDLCtCQUFtQixNQUFjLEVBQUUsT0FBZTtRQUFsRCxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxTQUNmO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFKRCxDQUEyQyxLQUFLLEdBSS9DOztBQUVELDRDQUE0QztBQUM1QztJQUE4Qyw0Q0FBSztJQUFuRDs7SUFBcUQsQ0FBQztJQUFELCtCQUFDO0FBQUQsQ0FBQyxBQUF0RCxDQUE4QyxLQUFLLEdBQUc7O0FBRXREOzs7OztJQUtJO0FBQ0o7SUFNRTs7T0FFRztJQUNILHNCQUFvQixLQUFjO1FBQWQsVUFBSyxHQUFMLEtBQUssQ0FBUztRQVJsQyx3RUFBd0U7UUFDaEUsYUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxJQUFJLENBQUMsS0FBTyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZGLDZEQUE2RDtRQUNyRCxhQUFRLEdBQUcsSUFBSSxPQUFPLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7UUF1QnBELFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDNUIsV0FBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBQzlCLFFBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztRQUN4QixhQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFDbEMsY0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1FBdEJsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSztZQUN2Qyw0REFBNEQ7WUFDNUQsOERBQThEO1lBQzlELE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxrREFBa0Q7SUFDNUMsOEJBQU8sR0FBYixVQUE0QyxXQUFjLEVBQUUsTUFBOEI7UUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7Ozs7d0JBQ3hGLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7NEJBQzVCLE1BQU0sSUFBSSx3QkFBd0IsQ0FDOUIsc0ZBQXNGO2dDQUN0RixnRUFBZ0UsQ0FBQyxDQUFDO3lCQUN2RTt3QkFDTyxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBQTs0QkFBbEUsc0JBQU8sQ0FBQyxTQUEwRCxDQUFNLEVBQUM7Ozs7S0FDMUU7SUFRSCxtQkFBQztBQUFELENBQUMsQUFqQ0QsSUFpQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge1JlcXVlc3RQYXJhbWV0ZXJzfSBmcm9tICdAb2N0b2tpdC90eXBlcyc7XG5pbXBvcnQge3F1ZXJ5fSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJHcmFwaHFsQ2xpZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuXG4gKlxuICogQWRkaXRpb25hbGx5LCBwcm92aWRlcyBjb252ZW5pZW5jZSBtZXRob2RzIGZvciBhY3Rpb25zIHdoaWNoIHJlcXVpcmUgbXVsdGlwbGUgcmVxdWVzdHMsIG9yXG4gKiB3b3VsZCBwcm92aWRlIHZhbHVlIGZyb20gbWVtb2l6ZWQgc3R5bGUgcmVzcG9uc2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkNsaWVudCB7XG4gIC8qKiBUaGUgZ3JhcGhxbCBpbnN0YW5jZSB3aXRoIGF1dGhlbnRpY2F0aW9uIHNldCBkdXJpbmcgY29uc3RydWN0aW9uLiAqL1xuICBwcml2YXRlIF9ncmFwaHFsID0gZ3JhcGhxbC5kZWZhdWx0cyh7aGVhZGVyczoge2F1dGhvcml6YXRpb246IGB0b2tlbiAke3RoaXMudG9rZW59YH19KTtcbiAgLyoqIFRoZSBPY3Rva2l0IGluc3RhbmNlIGFjdHVhbGx5IHBlcmZvcm1pbmcgQVBJIHJlcXVlc3RzLiAqL1xuICBwcml2YXRlIF9vY3Rva2l0ID0gbmV3IE9jdG9raXQoe3Rva2VuOiB0aGlzLnRva2VufSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0b2tlbiBUaGUgZ2l0aHViIGF1dGhlbnRpY2F0aW9uIHRva2VuIGZvciBHaXRodWIgUmVzdCBhbmQgR3JhcGhxbCBBUEkgcmVxdWVzdHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuPzogc3RyaW5nKSB7XG4gICAgdGhpcy5fb2N0b2tpdC5ob29rLmVycm9yKCdyZXF1ZXN0JywgZXJyb3IgPT4ge1xuICAgICAgLy8gV3JhcCBBUEkgZXJyb3JzIGluIGEga25vd24gZXJyb3IgY2xhc3MuIFRoaXMgYWxsb3dzIHVzIHRvXG4gICAgICAvLyBleHBlY3QgR2l0aHViIEFQSSBlcnJvcnMgYmV0dGVyIGFuZCBpbiBhIG5vbi1hbWJpZ3VvdXMgd2F5LlxuICAgICAgdGhyb3cgbmV3IEdpdGh1YkFwaVJlcXVlc3RFcnJvcihlcnJvci5zdGF0dXMsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBlcmZvcm0gYSBxdWVyeSB1c2luZyBHaXRodWIncyBHcmFwaHFsIEFQSS4gKi9cbiAgYXN5bmMgZ3JhcGhxbDxUIGV4dGVuZHMgR3JhcGhxbFF1ZXJ5T2JqZWN0PihxdWVyeU9iamVjdDogVCwgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVycyA9IHt9KSB7XG4gICAgaWYgKHRoaXMudG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEdpdGh1YkdyYXBocWxDbGllbnRFcnJvcihcbiAgICAgICAgICAnQ2Fubm90IHF1ZXJ5IHZpYSBncmFwaHFsIHdpdGhvdXQgYW4gYXV0aGVudGljYXRpb24gdG9rZW4gc2V0LCB1c2UgdGhlIGF1dGhlbnRpY2F0ZWQgJyArXG4gICAgICAgICAgJ2BHaXRDbGllbnRgIGJ5IGNhbGxpbmcgYEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKWAuJyk7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ3JhcGhxbChxdWVyeShxdWVyeU9iamVjdCkudG9TdHJpbmcoKSwgcGFyYW1zKSkgYXMgVDtcbiAgfVxuXG4gIHB1bGxzID0gdGhpcy5fb2N0b2tpdC5wdWxscztcbiAgcmVwb3MgPSB0aGlzLl9vY3Rva2l0LnJlcG9zO1xuICBpc3N1ZXMgPSB0aGlzLl9vY3Rva2l0Lmlzc3VlcztcbiAgZ2l0ID0gdGhpcy5fb2N0b2tpdC5naXQ7XG4gIHBhZ2luYXRlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcbiAgcmF0ZUxpbWl0ID0gdGhpcy5fb2N0b2tpdC5yYXRlTGltaXQ7XG59XG4iXX0=