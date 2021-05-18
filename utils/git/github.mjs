/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __extends, __generator } from "tslib";
import { graphql } from '@octokit/graphql';
import * as Octokit from '@octokit/rest';
import { query, types } from 'typed-graphqlify';
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
var GithubClient = /** @class */ (function (_super) {
    __extends(GithubClient, _super);
    /**
     * @param token The github authentication token for Github Rest and Graphql API requests.
     */
    function GithubClient(token) {
        var _this = 
        // Pass in authentication token to base Octokit class.
        _super.call(this, { auth: token }) || this;
        _this.token = token;
        /** The current user based on checking against the Github API. */
        _this._currentUser = null;
        /** The graphql instance with authentication set during construction. */
        _this._graphql = graphql.defaults({ headers: { authorization: "token " + _this.token } });
        _this.hook.error('request', function (error) {
            // Wrap API errors in a known error class. This allows us to
            // expect Github API errors better and in a non-ambiguous way.
            throw new GithubApiRequestError(error.status, error.message);
        });
        // Note: The prototype must be set explictly as Github's Octokit class is a non-standard class
        // definition which adjusts the prototype chain.
        // See:
        //    https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work
        //    https://github.com/octokit/rest.js/blob/7b51cee4a22b6e52adcdca011f93efdffa5df998/lib/constructor.js
        Object.setPrototypeOf(_this, GithubClient.prototype);
        return _this;
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
    /** Retrieve the login of the current user from Github. */
    GithubClient.prototype.getCurrentUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the current user has already been retrieved return the current user value again.
                        if (this._currentUser !== null) {
                            return [2 /*return*/, this._currentUser];
                        }
                        return [4 /*yield*/, this.graphql({
                                viewer: {
                                    login: types.string,
                                }
                            })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, this._currentUser = result.viewer.login];
                }
            });
        });
    };
    return GithubClient;
}(Octokit));
export { GithubClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEtBQUssT0FBTyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBZ0I5Qyw0Q0FBNEM7QUFDNUM7SUFBMkMseUNBQUs7SUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1FBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7UUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7SUFFakMsQ0FBQztJQUNILDRCQUFDO0FBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7O0FBRUQsNENBQTRDO0FBQzVDO0lBQThDLDRDQUFLO0lBQW5EOztJQUFxRCxDQUFDO0lBQUQsK0JBQUM7QUFBRCxDQUFDLEFBQXRELENBQThDLEtBQUssR0FBRzs7QUFFdEQ7Ozs7O0lBS0k7QUFDSjtJQUFrQyxnQ0FBTztJQU12Qzs7T0FFRztJQUNILHNCQUFvQixLQUFjO1FBQWxDO1FBQ0Usc0RBQXNEO1FBQ3RELGtCQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLFNBY3JCO1FBaEJtQixXQUFLLEdBQUwsS0FBSyxDQUFTO1FBUmxDLGlFQUFpRTtRQUN6RCxrQkFBWSxHQUFnQixJQUFJLENBQUM7UUFDekMsd0VBQXdFO1FBQ2hFLGNBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUMsYUFBYSxFQUFFLFdBQVMsS0FBSSxDQUFDLEtBQU8sRUFBQyxFQUFDLENBQUMsQ0FBQztRQVNyRixLQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxLQUFLO1lBQzlCLDREQUE0RDtZQUM1RCw4REFBOEQ7WUFDOUQsTUFBTSxJQUFJLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBRUgsOEZBQThGO1FBQzlGLGdEQUFnRDtRQUNoRCxPQUFPO1FBQ1AsbUhBQW1IO1FBQ25ILHlHQUF5RztRQUN6RyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ3RELENBQUM7SUFFRCxrREFBa0Q7SUFDNUMsOEJBQU8sR0FBYixVQUE0QyxXQUFjLEVBQUUsTUFBOEI7UUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7Ozs7d0JBQ3hGLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7NEJBQzVCLE1BQU0sSUFBSSx3QkFBd0IsQ0FDOUIsc0ZBQXNGO2dDQUN0RixnRUFBZ0UsQ0FBQyxDQUFDO3lCQUN2RTt3QkFDTyxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBQTs0QkFBbEUsc0JBQU8sQ0FBQyxTQUEwRCxDQUFNLEVBQUM7Ozs7S0FDMUU7SUFFRCwwREFBMEQ7SUFDcEQscUNBQWMsR0FBcEI7Ozs7Ozt3QkFDRSxzRkFBc0Y7d0JBQ3RGLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLEVBQUU7NEJBQzlCLHNCQUFPLElBQUksQ0FBQyxZQUFZLEVBQUM7eUJBQzFCO3dCQUNjLHFCQUFNLElBQUksQ0FBQyxPQUFPLENBQUM7Z0NBQ2hDLE1BQU0sRUFBRTtvQ0FDTixLQUFLLEVBQUUsS0FBSyxDQUFDLE1BQU07aUNBQ3BCOzZCQUNGLENBQUMsRUFBQTs7d0JBSkksTUFBTSxHQUFHLFNBSWI7d0JBQ0Ysc0JBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQzs7OztLQUNoRDtJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQWxERCxDQUFrQyxPQUFPLEdBa0R4QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7UmVxdWVzdFBhcmFtZXRlcnN9IGZyb20gJ0BvY3Rva2l0L3R5cGVzJztcbmltcG9ydCB7cXVlcnksIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJHcmFwaHFsQ2xpZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuXG4gKlxuICogQWRkaXRpb25hbGx5LCBwcm92aWRlcyBjb252ZW5pZW5jZSBtZXRob2RzIGZvciBhY3Rpb25zIHdoaWNoIHJlcXVpcmUgbXVsdGlwbGUgcmVxdWVzdHMsIG9yXG4gKiB3b3VsZCBwcm92aWRlIHZhbHVlIGZyb20gbWVtb2l6ZWQgc3R5bGUgcmVzcG9uc2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkNsaWVudCBleHRlbmRzIE9jdG9raXQge1xuICAvKiogVGhlIGN1cnJlbnQgdXNlciBiYXNlZCBvbiBjaGVja2luZyBhZ2FpbnN0IHRoZSBHaXRodWIgQVBJLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VXNlcjogc3RyaW5nfG51bGwgPSBudWxsO1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLnRva2VufWB9fSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0b2tlbiBUaGUgZ2l0aHViIGF1dGhlbnRpY2F0aW9uIHRva2VuIGZvciBHaXRodWIgUmVzdCBhbmQgR3JhcGhxbCBBUEkgcmVxdWVzdHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gUGFzcyBpbiBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byBiYXNlIE9jdG9raXQgY2xhc3MuXG4gICAgc3VwZXIoe2F1dGg6IHRva2VufSk7XG5cbiAgICB0aGlzLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlOiBUaGUgcHJvdG90eXBlIG11c3QgYmUgc2V0IGV4cGxpY3RseSBhcyBHaXRodWIncyBPY3Rva2l0IGNsYXNzIGlzIGEgbm9uLXN0YW5kYXJkIGNsYXNzXG4gICAgLy8gZGVmaW5pdGlvbiB3aGljaCBhZGp1c3RzIHRoZSBwcm90b3R5cGUgY2hhaW4uXG4gICAgLy8gU2VlOlxuICAgIC8vICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmtcbiAgICAvLyAgICBodHRwczovL2dpdGh1Yi5jb20vb2N0b2tpdC9yZXN0LmpzL2Jsb2IvN2I1MWNlZTRhMjJiNmU1MmFkY2RjYTAxMWY5M2VmZGZmYTVkZjk5OC9saWIvY29uc3RydWN0b3IuanNcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgR2l0aHViQ2xpZW50LnByb3RvdHlwZSk7XG4gIH1cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBocWwgQVBJLiAqL1xuICBhc3luYyBncmFwaHFsPFQgZXh0ZW5kcyBHcmFwaHFsUXVlcnlPYmplY3Q+KHF1ZXJ5T2JqZWN0OiBULCBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJzID0ge30pIHtcbiAgICBpZiAodGhpcy50b2tlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0aHViR3JhcGhxbENsaWVudEVycm9yKFxuICAgICAgICAgICdDYW5ub3QgcXVlcnkgdmlhIGdyYXBocWwgd2l0aG91dCBhbiBhdXRoZW50aWNhdGlvbiB0b2tlbiBzZXQsIHVzZSB0aGUgYXV0aGVudGljYXRlZCAnICtcbiAgICAgICAgICAnYEdpdENsaWVudGAgYnkgY2FsbGluZyBgR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpYC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9ncmFwaHFsKHF1ZXJ5KHF1ZXJ5T2JqZWN0KS50b1N0cmluZygpLCBwYXJhbXMpKSBhcyBUO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSBsb2dpbiBvZiB0aGUgY3VycmVudCB1c2VyIGZyb20gR2l0aHViLiAqL1xuICBhc3luYyBnZXRDdXJyZW50VXNlcigpIHtcbiAgICAvLyBJZiB0aGUgY3VycmVudCB1c2VyIGhhcyBhbHJlYWR5IGJlZW4gcmV0cmlldmVkIHJldHVybiB0aGUgY3VycmVudCB1c2VyIHZhbHVlIGFnYWluLlxuICAgIGlmICh0aGlzLl9jdXJyZW50VXNlciAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRVc2VyO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdyYXBocWwoe1xuICAgICAgdmlld2VyOiB7XG4gICAgICAgIGxvZ2luOiB0eXBlcy5zdHJpbmcsXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRVc2VyID0gcmVzdWx0LnZpZXdlci5sb2dpbjtcbiAgfVxufVxuIl19