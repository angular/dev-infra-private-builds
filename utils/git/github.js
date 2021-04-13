/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/git/github", ["require", "exports", "tslib", "@octokit/graphql", "@octokit/rest", "typed-graphqlify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GithubClient = exports.GithubGraphqlClientError = exports.GithubApiRequestError = void 0;
    var tslib_1 = require("tslib");
    var graphql_1 = require("@octokit/graphql");
    var Octokit = require("@octokit/rest");
    var typed_graphqlify_1 = require("typed-graphqlify");
    /** Error for failed Github API requests. */
    var GithubApiRequestError = /** @class */ (function (_super) {
        tslib_1.__extends(GithubApiRequestError, _super);
        function GithubApiRequestError(status, message) {
            var _this = _super.call(this, message) || this;
            _this.status = status;
            return _this;
        }
        return GithubApiRequestError;
    }(Error));
    exports.GithubApiRequestError = GithubApiRequestError;
    /** Error for failed Github API requests. */
    var GithubGraphqlClientError = /** @class */ (function (_super) {
        tslib_1.__extends(GithubGraphqlClientError, _super);
        function GithubGraphqlClientError() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return GithubGraphqlClientError;
    }(Error));
    exports.GithubGraphqlClientError = GithubGraphqlClientError;
    /**
     * A Github client for interacting with the Github APIs.
     *
     * Additionally, provides convenience methods for actions which require multiple requests, or
     * would provide value from memoized style responses.
     **/
    var GithubClient = /** @class */ (function (_super) {
        tslib_1.__extends(GithubClient, _super);
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
            _this._graphql = graphql_1.graphql.defaults({ headers: { authorization: "token " + _this.token } });
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.token === undefined) {
                                throw new GithubGraphqlClientError('Cannot query via graphql without an authentication token set, use the authenticated ' +
                                    '`GitClient` by calling `GitClient.getAuthenticatedInstance()`.');
                            }
                            return [4 /*yield*/, this._graphql(typed_graphqlify_1.query(queryObject), params)];
                        case 1: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        /** Retrieve the login of the current user from Github. */
        GithubClient.prototype.getCurrentUser = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var result;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // If the current user has already been retrieved return the current user value again.
                            if (this._currentUser !== null) {
                                return [2 /*return*/, this._currentUser];
                            }
                            return [4 /*yield*/, this.graphql({
                                    viewer: {
                                        login: typed_graphqlify_1.types.string,
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
    exports.GithubClient = GithubClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6Qyx1Q0FBeUM7SUFFekMscURBQThDO0lBZ0I5Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEMsNENBQTRDO0lBQzVDO1FBQThDLG9EQUFLO1FBQW5EOztRQUFxRCxDQUFDO1FBQUQsK0JBQUM7SUFBRCxDQUFDLEFBQXRELENBQThDLEtBQUssR0FBRztJQUF6Qyw0REFBd0I7SUFFckM7Ozs7O1FBS0k7SUFDSjtRQUFrQyx3Q0FBTztRQU12Qzs7V0FFRztRQUNILHNCQUFvQixLQUFjO1lBQWxDO1lBQ0Usc0RBQXNEO1lBQ3RELGtCQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLFNBY3JCO1lBaEJtQixXQUFLLEdBQUwsS0FBSyxDQUFTO1lBUmxDLGlFQUFpRTtZQUN6RCxrQkFBWSxHQUFnQixJQUFJLENBQUM7WUFDekMsd0VBQXdFO1lBQ2hFLGNBQVEsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBRSxFQUFDLGFBQWEsRUFBRSxXQUFTLEtBQUksQ0FBQyxLQUFPLEVBQUMsRUFBQyxDQUFDLENBQUM7WUFTckYsS0FBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSztnQkFDOUIsNERBQTREO2dCQUM1RCw4REFBOEQ7Z0JBQzlELE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztZQUVILDhGQUE4RjtZQUM5RixnREFBZ0Q7WUFDaEQsT0FBTztZQUNQLG1IQUFtSDtZQUNuSCx5R0FBeUc7WUFDekcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUN0RCxDQUFDO1FBRUQsa0RBQWtEO1FBQzVDLDhCQUFPLEdBQWIsVUFBNEMsV0FBYyxFQUFFLE1BQThCO1lBQTlCLHVCQUFBLEVBQUEsV0FBOEI7Ozs7OzRCQUN4RixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO2dDQUM1QixNQUFNLElBQUksd0JBQXdCLENBQzlCLHNGQUFzRjtvQ0FDdEYsZ0VBQWdFLENBQUMsQ0FBQzs2QkFDdkU7NEJBQ08scUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxFQUFBO2dDQUF2RCxzQkFBTyxDQUFDLFNBQStDLENBQU0sRUFBQzs7OztTQUMvRDtRQUVELDBEQUEwRDtRQUNwRCxxQ0FBYyxHQUFwQjs7Ozs7OzRCQUNFLHNGQUFzRjs0QkFDdEYsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRTtnQ0FDOUIsc0JBQU8sSUFBSSxDQUFDLFlBQVksRUFBQzs2QkFDMUI7NEJBQ2MscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztvQ0FDaEMsTUFBTSxFQUFFO3dDQUNOLEtBQUssRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3BCO2lDQUNGLENBQUMsRUFBQTs7NEJBSkksTUFBTSxHQUFHLFNBSWI7NEJBQ0Ysc0JBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQzs7OztTQUNoRDtRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQWxERCxDQUFrQyxPQUFPLEdBa0R4QztJQWxEWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7UmVxdWVzdFBhcmFtZXRlcnN9IGZyb20gJ0BvY3Rva2l0L3R5cGVzJztcbmltcG9ydCB7cXVlcnksIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJHcmFwaHFsQ2xpZW50RXJyb3IgZXh0ZW5kcyBFcnJvciB7fVxuXG4vKipcbiAqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuXG4gKlxuICogQWRkaXRpb25hbGx5LCBwcm92aWRlcyBjb252ZW5pZW5jZSBtZXRob2RzIGZvciBhY3Rpb25zIHdoaWNoIHJlcXVpcmUgbXVsdGlwbGUgcmVxdWVzdHMsIG9yXG4gKiB3b3VsZCBwcm92aWRlIHZhbHVlIGZyb20gbWVtb2l6ZWQgc3R5bGUgcmVzcG9uc2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkNsaWVudCBleHRlbmRzIE9jdG9raXQge1xuICAvKiogVGhlIGN1cnJlbnQgdXNlciBiYXNlZCBvbiBjaGVja2luZyBhZ2FpbnN0IHRoZSBHaXRodWIgQVBJLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VXNlcjogc3RyaW5nfG51bGwgPSBudWxsO1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLnRva2VufWB9fSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0b2tlbiBUaGUgZ2l0aHViIGF1dGhlbnRpY2F0aW9uIHRva2VuIGZvciBHaXRodWIgUmVzdCBhbmQgR3JhcGhxbCBBUEkgcmVxdWVzdHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gUGFzcyBpbiBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byBiYXNlIE9jdG9raXQgY2xhc3MuXG4gICAgc3VwZXIoe2F1dGg6IHRva2VufSk7XG5cbiAgICB0aGlzLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvLyBOb3RlOiBUaGUgcHJvdG90eXBlIG11c3QgYmUgc2V0IGV4cGxpY3RseSBhcyBHaXRodWIncyBPY3Rva2l0IGNsYXNzIGlzIGEgbm9uLXN0YW5kYXJkIGNsYXNzXG4gICAgLy8gZGVmaW5pdGlvbiB3aGljaCBhZGp1c3RzIHRoZSBwcm90b3R5cGUgY2hhaW4uXG4gICAgLy8gU2VlOlxuICAgIC8vICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvVHlwZVNjcmlwdC93aWtpL0ZBUSN3aHktZG9lc250LWV4dGVuZGluZy1idWlsdC1pbnMtbGlrZS1lcnJvci1hcnJheS1hbmQtbWFwLXdvcmtcbiAgICAvLyAgICBodHRwczovL2dpdGh1Yi5jb20vb2N0b2tpdC9yZXN0LmpzL2Jsb2IvN2I1MWNlZTRhMjJiNmU1MmFkY2RjYTAxMWY5M2VmZGZmYTVkZjk5OC9saWIvY29uc3RydWN0b3IuanNcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgR2l0aHViQ2xpZW50LnByb3RvdHlwZSk7XG4gIH1cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBocWwgQVBJLiAqL1xuICBhc3luYyBncmFwaHFsPFQgZXh0ZW5kcyBHcmFwaHFsUXVlcnlPYmplY3Q+KHF1ZXJ5T2JqZWN0OiBULCBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJzID0ge30pIHtcbiAgICBpZiAodGhpcy50b2tlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgR2l0aHViR3JhcGhxbENsaWVudEVycm9yKFxuICAgICAgICAgICdDYW5ub3QgcXVlcnkgdmlhIGdyYXBocWwgd2l0aG91dCBhbiBhdXRoZW50aWNhdGlvbiB0b2tlbiBzZXQsIHVzZSB0aGUgYXV0aGVudGljYXRlZCAnICtcbiAgICAgICAgICAnYEdpdENsaWVudGAgYnkgY2FsbGluZyBgR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpYC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLl9ncmFwaHFsKHF1ZXJ5KHF1ZXJ5T2JqZWN0KSwgcGFyYW1zKSkgYXMgVDtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgbG9naW4gb2YgdGhlIGN1cnJlbnQgdXNlciBmcm9tIEdpdGh1Yi4gKi9cbiAgYXN5bmMgZ2V0Q3VycmVudFVzZXIoKSB7XG4gICAgLy8gSWYgdGhlIGN1cnJlbnQgdXNlciBoYXMgYWxyZWFkeSBiZWVuIHJldHJpZXZlZCByZXR1cm4gdGhlIGN1cnJlbnQgdXNlciB2YWx1ZSBhZ2Fpbi5cbiAgICBpZiAodGhpcy5fY3VycmVudFVzZXIgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXNlcjtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ncmFwaHFsKHtcbiAgICAgIHZpZXdlcjoge1xuICAgICAgICBsb2dpbjogdHlwZXMuc3RyaW5nLFxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXNlciA9IHJlc3VsdC52aWV3ZXIubG9naW47XG4gIH1cbn1cbiJdfQ==