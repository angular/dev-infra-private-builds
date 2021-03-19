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
    exports.GithubGraphqlClient = exports.GithubClient = exports.GithubApiRequestError = void 0;
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
    /**
     * A Github client for interacting with the Github APIs.
     *
     * Additionally, provides convenience methods for actions which require multiple requests, or
     * would provide value from memoized style responses.
     **/
    var GithubClient = /** @class */ (function (_super) {
        tslib_1.__extends(GithubClient, _super);
        function GithubClient(token) {
            var _this = 
            // Pass in authentication token to base Octokit class.
            _super.call(this, { auth: token }) || this;
            /** The current user based on checking against the Github API. */
            _this._currentUser = null;
            _this.hook.error('request', function (error) {
                // Wrap API errors in a known error class. This allows us to
                // expect Github API errors better and in a non-ambiguous way.
                throw new GithubApiRequestError(error.status, error.message);
            });
            // Create authenticated graphql client.
            _this.graphql = new GithubGraphqlClient(token);
            return _this;
        }
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
                            return [4 /*yield*/, this.graphql.query({
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
    /** A client for interacting with Github's GraphQL API. */
    var GithubGraphqlClient = /** @class */ (function () {
        function GithubGraphqlClient(token) {
            /** The Github GraphQL (v4) API. */
            this.graqhql = graphql_1.graphql;
            // Set the default headers to include authorization with the provided token for all
            // graphQL calls.
            if (token) {
                this.graqhql = this.graqhql.defaults({ headers: { authorization: "token " + token } });
            }
        }
        /** Perform a query using Github's GraphQL API. */
        GithubGraphqlClient.prototype.query = function (queryObject, params) {
            if (params === void 0) { params = {}; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var queryString;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            queryString = typed_graphqlify_1.query(queryObject);
                            return [4 /*yield*/, this.graqhql(queryString, params)];
                        case 1: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        return GithubGraphqlClient;
    }());
    exports.GithubGraphqlClient = GithubGraphqlClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6Qyx1Q0FBeUM7SUFFekMscURBQThDO0lBVTlDLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQzs7Ozs7UUFLSTtJQUNKO1FBQWtDLHdDQUFPO1FBT3ZDLHNCQUFZLEtBQWM7WUFBMUI7WUFDRSxzREFBc0Q7WUFDdEQsa0JBQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsU0FVckI7WUFmRCxpRUFBaUU7WUFDekQsa0JBQVksR0FBZ0IsSUFBSSxDQUFDO1lBTXZDLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFBLEtBQUs7Z0JBQzlCLDREQUE0RDtnQkFDNUQsOERBQThEO2dCQUM5RCxNQUFNLElBQUkscUJBQXFCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFFSCx1Q0FBdUM7WUFDdkMsS0FBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDOztRQUNoRCxDQUFDO1FBRUQsMERBQTBEO1FBQ3BELHFDQUFjLEdBQXBCOzs7Ozs7NEJBQ0Usc0ZBQXNGOzRCQUN0RixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxFQUFFO2dDQUM5QixzQkFBTyxJQUFJLENBQUMsWUFBWSxFQUFDOzZCQUMxQjs0QkFDYyxxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztvQ0FDdEMsTUFBTSxFQUFFO3dDQUNOLEtBQUssRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3BCO2lDQUNGLENBQUMsRUFBQTs7NEJBSkksTUFBTSxHQUFHLFNBSWI7NEJBQ0Ysc0JBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQzs7OztTQUNoRDtRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQWxDRCxDQUFrQyxPQUFPLEdBa0N4QztJQWxDWSxvQ0FBWTtJQTBDekIsMERBQTBEO0lBQzFEO1FBSUUsNkJBQVksS0FBYztZQUgxQixtQ0FBbUM7WUFDM0IsWUFBTyxHQUFHLGlCQUFPLENBQUM7WUFHeEIsbUZBQW1GO1lBQ25GLGlCQUFpQjtZQUNqQixJQUFJLEtBQUssRUFBRTtnQkFDVCxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUMsYUFBYSxFQUFFLFdBQVMsS0FBTyxFQUFDLEVBQUMsQ0FBQyxDQUFDO2FBQ3BGO1FBQ0gsQ0FBQztRQUVELGtEQUFrRDtRQUM1QyxtQ0FBSyxHQUFYLFVBQTBDLFdBQWMsRUFBRSxNQUE4QjtZQUE5Qix1QkFBQSxFQUFBLFdBQThCOzs7Ozs7NEJBQ2hGLFdBQVcsR0FBRyx3QkFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUMvQixxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBQTtnQ0FBL0Msc0JBQU8sQ0FBQyxTQUF1QyxDQUFNLEVBQUM7Ozs7U0FDdkQ7UUFDSCwwQkFBQztJQUFELENBQUMsQUFqQkQsSUFpQkM7SUFqQlksa0RBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z3JhcGhxbH0gZnJvbSAnQG9jdG9raXQvZ3JhcGhxbCc7XG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtSZXF1ZXN0UGFyYW1ldGVyc30gZnJvbSAnQG9jdG9raXQvdHlwZXMnO1xuaW1wb3J0IHtxdWVyeSwgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIEdpdGh1YiBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUElzLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgcHJvdmlkZXMgY29udmVuaWVuY2UgbWV0aG9kcyBmb3IgYWN0aW9ucyB3aGljaCByZXF1aXJlIG11bHRpcGxlIHJlcXVlc3RzLCBvclxuICogd291bGQgcHJvdmlkZSB2YWx1ZSBmcm9tIG1lbW9pemVkIHN0eWxlIHJlc3BvbnNlcy5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJDbGllbnQgZXh0ZW5kcyBPY3Rva2l0IHtcbiAgLyoqIFRoZSBHaXRodWIgR3JhcGhRTCAodjQpIEFQSS4gKi9cbiAgZ3JhcGhxbDogR2l0aHViR3JhcGhxbENsaWVudDtcblxuICAvKiogVGhlIGN1cnJlbnQgdXNlciBiYXNlZCBvbiBjaGVja2luZyBhZ2FpbnN0IHRoZSBHaXRodWIgQVBJLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VXNlcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gUGFzcyBpbiBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byBiYXNlIE9jdG9raXQgY2xhc3MuXG4gICAgc3VwZXIoe2F1dGg6IHRva2VufSk7XG5cbiAgICB0aGlzLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYXV0aGVudGljYXRlZCBncmFwaHFsIGNsaWVudC5cbiAgICB0aGlzLmdyYXBocWwgPSBuZXcgR2l0aHViR3JhcGhxbENsaWVudCh0b2tlbik7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIGxvZ2luIG9mIHRoZSBjdXJyZW50IHVzZXIgZnJvbSBHaXRodWIuICovXG4gIGFzeW5jIGdldEN1cnJlbnRVc2VyKCkge1xuICAgIC8vIElmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGFscmVhZHkgYmVlbiByZXRyaWV2ZWQgcmV0dXJuIHRoZSBjdXJyZW50IHVzZXIgdmFsdWUgYWdhaW4uXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRVc2VyICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXI7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ3JhcGhxbC5xdWVyeSh7XG4gICAgICB2aWV3ZXI6IHtcbiAgICAgICAgbG9naW46IHR5cGVzLnN0cmluZyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXIgPSByZXN1bHQudmlld2VyLmxvZ2luO1xuICB9XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhRTCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmRcbiAqIHRvIGdlbmVyYXRlIGEgR3JhcGhRTCBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIEdyYXBoUUxRdWVyeU9iamVjdCA9IFBhcmFtZXRlcnM8dHlwZW9mIHF1ZXJ5PlsxXTtcblxuLyoqIEEgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YidzIEdyYXBoUUwgQVBJLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkdyYXBocWxDbGllbnQge1xuICAvKiogVGhlIEdpdGh1YiBHcmFwaFFMICh2NCkgQVBJLiAqL1xuICBwcml2YXRlIGdyYXFocWwgPSBncmFwaHFsO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0IGhlYWRlcnMgdG8gaW5jbHVkZSBhdXRob3JpemF0aW9uIHdpdGggdGhlIHByb3ZpZGVkIHRva2VuIGZvciBhbGxcbiAgICAvLyBncmFwaFFMIGNhbGxzLlxuICAgIGlmICh0b2tlbikge1xuICAgICAgdGhpcy5ncmFxaHFsID0gdGhpcy5ncmFxaHFsLmRlZmF1bHRzKHtoZWFkZXJzOiB7YXV0aG9yaXphdGlvbjogYHRva2VuICR7dG9rZW59YH19KTtcbiAgICB9XG4gIH1cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBoUUwgQVBJLiAqL1xuICBhc3luYyBxdWVyeTxUIGV4dGVuZHMgR3JhcGhRTFF1ZXJ5T2JqZWN0PihxdWVyeU9iamVjdDogVCwgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVycyA9IHt9KSB7XG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeShxdWVyeU9iamVjdCk7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdyYXFocWwocXVlcnlTdHJpbmcsIHBhcmFtcykpIGFzIFQ7XG4gIH1cbn1cbiJdfQ==