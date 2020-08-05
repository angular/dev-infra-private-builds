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
    exports.GithubClient = exports.GithubApiRequestError = void 0;
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
            _this.graqhql = new GithubGraphqlClient(token);
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
                            return [4 /*yield*/, this.graqhql.query({
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
    /**
     * A client for interacting with Github's GraphQL API.
     *
     * This class is intentionally not exported as it should always be access/used via a
     * _GithubClient instance.
     */
    var GithubGraphqlClient = /** @class */ (function () {
        function GithubGraphqlClient(token) {
            /** The Github GraphQL (v4) API. */
            this.graqhql = graphql_1.graphql;
            // Set the default headers to include authorization with the provided token for all
            // graphQL calls.
            if (token) {
                this.graqhql.defaults({ headers: { authorization: "token " + token } });
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6Qyx1Q0FBeUM7SUFFekMscURBQThDO0lBRTlDLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQzs7Ozs7UUFLSTtJQUNKO1FBQWtDLHdDQUFPO1FBT3ZDLHNCQUFZLEtBQWM7WUFBMUI7WUFDRSxzREFBc0Q7WUFDdEQsa0JBQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsU0FVckI7WUFmRCxpRUFBaUU7WUFDekQsa0JBQVksR0FBZ0IsSUFBSSxDQUFDO1lBTXZDLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFBLEtBQUs7Z0JBQzlCLDREQUE0RDtnQkFDNUQsOERBQThEO2dCQUM5RCxNQUFNLElBQUkscUJBQXFCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFFSCx1Q0FBdUM7WUFDdkMsS0FBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDOztRQUNoRCxDQUFDO1FBRUQsMERBQTBEO1FBQ3BELHFDQUFjLEdBQXBCOzs7Ozs7NEJBQ0Usc0ZBQXNGOzRCQUN0RixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxFQUFFO2dDQUM5QixzQkFBTyxJQUFJLENBQUMsWUFBWSxFQUFDOzZCQUMxQjs0QkFDYyxxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztvQ0FDdEMsTUFBTSxFQUFFO3dDQUNOLEtBQUssRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3BCO2lDQUNGLENBQUMsRUFBQTs7NEJBSkksTUFBTSxHQUFHLFNBSWI7NEJBQ0Ysc0JBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQzs7OztTQUNoRDtRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQWxDRCxDQUFrQyxPQUFPLEdBa0N4QztJQWxDWSxvQ0FBWTtJQTBDekI7Ozs7O09BS0c7SUFDSDtRQUlFLDZCQUFZLEtBQWM7WUFIMUIsbUNBQW1DO1lBQzNCLFlBQU8sR0FBRyxpQkFBTyxDQUFDO1lBR3hCLG1GQUFtRjtZQUNuRixpQkFBaUI7WUFDakIsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxLQUFPLEVBQUMsRUFBQyxDQUFDLENBQUM7YUFDckU7UUFDSCxDQUFDO1FBR0Qsa0RBQWtEO1FBQzVDLG1DQUFLLEdBQVgsVUFBMEMsV0FBYyxFQUFFLE1BQThCO1lBQTlCLHVCQUFBLEVBQUEsV0FBOEI7Ozs7Ozs0QkFDaEYsV0FBVyxHQUFHLHdCQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQy9CLHFCQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFBO2dDQUEvQyxzQkFBTyxDQUFDLFNBQXVDLENBQU0sRUFBQzs7OztTQUN2RDtRQUNILDBCQUFDO0lBQUQsQ0FBQyxBQWxCRCxJQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7UmVxdWVzdFBhcmFtZXRlcnN9IGZyb20gJ0BvY3Rva2l0L3R5cGVzJztcbmltcG9ydCB7cXVlcnksIHR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBIEdpdGh1YiBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUElzLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgcHJvdmlkZXMgY29udmVuaWVuY2UgbWV0aG9kcyBmb3IgYWN0aW9ucyB3aGljaCByZXF1aXJlIG11bHRpcGxlIHJlcXVlc3RzLCBvclxuICogd291bGQgcHJvdmlkZSB2YWx1ZSBmcm9tIG1lbW9pemVkIHN0eWxlIHJlc3BvbnNlcy5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJDbGllbnQgZXh0ZW5kcyBPY3Rva2l0IHtcbiAgLyoqIFRoZSBHaXRodWIgR3JhcGhRTCAodjQpIEFQSS4gKi9cbiAgZ3JhcWhxbDogR2l0aHViR3JhcGhxbENsaWVudDtcblxuICAvKiogVGhlIGN1cnJlbnQgdXNlciBiYXNlZCBvbiBjaGVja2luZyBhZ2FpbnN0IHRoZSBHaXRodWIgQVBJLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VXNlcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gUGFzcyBpbiBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byBiYXNlIE9jdG9raXQgY2xhc3MuXG4gICAgc3VwZXIoe2F1dGg6IHRva2VufSk7XG5cbiAgICB0aGlzLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYXV0aGVudGljYXRlZCBncmFwaHFsIGNsaWVudC5cbiAgICB0aGlzLmdyYXFocWwgPSBuZXcgR2l0aHViR3JhcGhxbENsaWVudCh0b2tlbik7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIGxvZ2luIG9mIHRoZSBjdXJyZW50IHVzZXIgZnJvbSBHaXRodWIuICovXG4gIGFzeW5jIGdldEN1cnJlbnRVc2VyKCkge1xuICAgIC8vIElmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGFscmVhZHkgYmVlbiByZXRyaWV2ZWQgcmV0dXJuIHRoZSBjdXJyZW50IHVzZXIgdmFsdWUgYWdhaW4uXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRVc2VyICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXI7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ3JhcWhxbC5xdWVyeSh7XG4gICAgICB2aWV3ZXI6IHtcbiAgICAgICAgbG9naW46IHR5cGVzLnN0cmluZyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXIgPSByZXN1bHQudmlld2VyLmxvZ2luO1xuICB9XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhRTCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmQgdG8gZ2VuZXJhdGVcbiAqIGEgR3JhcGhRTCBxdWVyeSBzdHJpbmcuXG4gKi9cbnR5cGUgR3JhcGhRTFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKipcbiAqIEEgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YidzIEdyYXBoUUwgQVBJLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgaW50ZW50aW9uYWxseSBub3QgZXhwb3J0ZWQgYXMgaXQgc2hvdWxkIGFsd2F5cyBiZSBhY2Nlc3MvdXNlZCB2aWEgYVxuICogX0dpdGh1YkNsaWVudCBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgR2l0aHViR3JhcGhxbENsaWVudCB7XG4gIC8qKiBUaGUgR2l0aHViIEdyYXBoUUwgKHY0KSBBUEkuICovXG4gIHByaXZhdGUgZ3JhcWhxbCA9IGdyYXBocWw7XG5cbiAgY29uc3RydWN0b3IodG9rZW4/OiBzdHJpbmcpIHtcbiAgICAvLyBTZXQgdGhlIGRlZmF1bHQgaGVhZGVycyB0byBpbmNsdWRlIGF1dGhvcml6YXRpb24gd2l0aCB0aGUgcHJvdmlkZWQgdG9rZW4gZm9yIGFsbFxuICAgIC8vIGdyYXBoUUwgY2FsbHMuXG4gICAgaWYgKHRva2VuKSB7XG4gICAgICB0aGlzLmdyYXFocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0b2tlbn1gfX0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFBlcmZvcm0gYSBxdWVyeSB1c2luZyBHaXRodWIncyBHcmFwaFFMIEFQSS4gKi9cbiAgYXN5bmMgcXVlcnk8VCBleHRlbmRzIEdyYXBoUUxRdWVyeU9iamVjdD4ocXVlcnlPYmplY3Q6IFQsIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcnMgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkocXVlcnlPYmplY3QpO1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ncmFxaHFsKHF1ZXJ5U3RyaW5nLCBwYXJhbXMpKSBhcyBUO1xuICB9XG59XG4iXX0=