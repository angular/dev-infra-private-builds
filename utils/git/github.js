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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6Qyx1Q0FBeUM7SUFFekMscURBQThDO0lBRTlDLDRDQUE0QztJQUM1QztRQUEyQyxpREFBSztRQUM5QywrQkFBbUIsTUFBYyxFQUFFLE9BQWU7WUFBbEQsWUFDRSxrQkFBTSxPQUFPLENBQUMsU0FDZjtZQUZrQixZQUFNLEdBQU4sTUFBTSxDQUFROztRQUVqQyxDQUFDO1FBQ0gsNEJBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMkMsS0FBSyxHQUkvQztJQUpZLHNEQUFxQjtJQU1sQzs7Ozs7UUFLSTtJQUNKO1FBQWtDLHdDQUFPO1FBT3ZDLHNCQUFZLEtBQWM7WUFBMUI7WUFDRSxzREFBc0Q7WUFDdEQsa0JBQU0sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUMsU0FVckI7WUFmRCxpRUFBaUU7WUFDekQsa0JBQVksR0FBZ0IsSUFBSSxDQUFDO1lBTXZDLEtBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxVQUFBLEtBQUs7Z0JBQzlCLDREQUE0RDtnQkFDNUQsOERBQThEO2dCQUM5RCxNQUFNLElBQUkscUJBQXFCLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7WUFFSCx1Q0FBdUM7WUFDdkMsS0FBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDOztRQUNoRCxDQUFDO1FBRUQsMERBQTBEO1FBQ3BELHFDQUFjLEdBQXBCOzs7Ozs7NEJBQ0Usc0ZBQXNGOzRCQUN0RixJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssSUFBSSxFQUFFO2dDQUM5QixzQkFBTyxJQUFJLENBQUMsWUFBWSxFQUFDOzZCQUMxQjs0QkFDYyxxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztvQ0FDdEMsTUFBTSxFQUFFO3dDQUNOLEtBQUssRUFBRSx3QkFBSyxDQUFDLE1BQU07cUNBQ3BCO2lDQUNGLENBQUMsRUFBQTs7NEJBSkksTUFBTSxHQUFHLFNBSWI7NEJBQ0Ysc0JBQU8sSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBQzs7OztTQUNoRDtRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQWxDRCxDQUFrQyxPQUFPLEdBa0N4QztJQWxDWSxvQ0FBWTtJQTBDekI7Ozs7O09BS0c7SUFDSDtRQUlFLDZCQUFZLEtBQWM7WUFIMUIsbUNBQW1DO1lBQzNCLFlBQU8sR0FBRyxpQkFBTyxDQUFDO1lBR3hCLG1GQUFtRjtZQUNuRixpQkFBaUI7WUFDakIsSUFBSSxLQUFLLEVBQUU7Z0JBQ1QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBRSxFQUFDLGFBQWEsRUFBRSxXQUFTLEtBQU8sRUFBQyxFQUFDLENBQUMsQ0FBQzthQUNwRjtRQUNILENBQUM7UUFHRCxrREFBa0Q7UUFDNUMsbUNBQUssR0FBWCxVQUEwQyxXQUFjLEVBQUUsTUFBOEI7WUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7Ozs7OzRCQUNoRixXQUFXLEdBQUcsd0JBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQzs0QkFDL0IscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUE7Z0NBQS9DLHNCQUFPLENBQUMsU0FBdUMsQ0FBTSxFQUFDOzs7O1NBQ3ZEO1FBQ0gsMEJBQUM7SUFBRCxDQUFDLEFBbEJELElBa0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z3JhcGhxbH0gZnJvbSAnQG9jdG9raXQvZ3JhcGhxbCc7XG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtSZXF1ZXN0UGFyYW1ldGVyc30gZnJvbSAnQG9jdG9raXQvdHlwZXMnO1xuaW1wb3J0IHtxdWVyeSwgdHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXRodWIgQVBJIHJlcXVlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaVJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXR1czogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKipcbiAqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuXG4gKlxuICogQWRkaXRpb25hbGx5LCBwcm92aWRlcyBjb252ZW5pZW5jZSBtZXRob2RzIGZvciBhY3Rpb25zIHdoaWNoIHJlcXVpcmUgbXVsdGlwbGUgcmVxdWVzdHMsIG9yXG4gKiB3b3VsZCBwcm92aWRlIHZhbHVlIGZyb20gbWVtb2l6ZWQgc3R5bGUgcmVzcG9uc2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkNsaWVudCBleHRlbmRzIE9jdG9raXQge1xuICAvKiogVGhlIEdpdGh1YiBHcmFwaFFMICh2NCkgQVBJLiAqL1xuICBncmFwaHFsOiBHaXRodWJHcmFwaHFsQ2xpZW50O1xuXG4gIC8qKiBUaGUgY3VycmVudCB1c2VyIGJhc2VkIG9uIGNoZWNraW5nIGFnYWluc3QgdGhlIEdpdGh1YiBBUEkuICovXG4gIHByaXZhdGUgX2N1cnJlbnRVc2VyOiBzdHJpbmd8bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IodG9rZW4/OiBzdHJpbmcpIHtcbiAgICAvLyBQYXNzIGluIGF1dGhlbnRpY2F0aW9uIHRva2VuIHRvIGJhc2UgT2N0b2tpdCBjbGFzcy5cbiAgICBzdXBlcih7YXV0aDogdG9rZW59KTtcblxuICAgIHRoaXMuaG9vay5lcnJvcigncmVxdWVzdCcsIGVycm9yID0+IHtcbiAgICAgIC8vIFdyYXAgQVBJIGVycm9ycyBpbiBhIGtub3duIGVycm9yIGNsYXNzLiBUaGlzIGFsbG93cyB1cyB0b1xuICAgICAgLy8gZXhwZWN0IEdpdGh1YiBBUEkgZXJyb3JzIGJldHRlciBhbmQgaW4gYSBub24tYW1iaWd1b3VzIHdheS5cbiAgICAgIHRocm93IG5ldyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IoZXJyb3Iuc3RhdHVzLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBhdXRoZW50aWNhdGVkIGdyYXBocWwgY2xpZW50LlxuICAgIHRoaXMuZ3JhcGhxbCA9IG5ldyBHaXRodWJHcmFwaHFsQ2xpZW50KHRva2VuKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgbG9naW4gb2YgdGhlIGN1cnJlbnQgdXNlciBmcm9tIEdpdGh1Yi4gKi9cbiAgYXN5bmMgZ2V0Q3VycmVudFVzZXIoKSB7XG4gICAgLy8gSWYgdGhlIGN1cnJlbnQgdXNlciBoYXMgYWxyZWFkeSBiZWVuIHJldHJpZXZlZCByZXR1cm4gdGhlIGN1cnJlbnQgdXNlciB2YWx1ZSBhZ2Fpbi5cbiAgICBpZiAodGhpcy5fY3VycmVudFVzZXIgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXNlcjtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5ncmFwaHFsLnF1ZXJ5KHtcbiAgICAgIHZpZXdlcjoge1xuICAgICAgICBsb2dpbjogdHlwZXMuc3RyaW5nLFxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLl9jdXJyZW50VXNlciA9IHJlc3VsdC52aWV3ZXIubG9naW47XG4gIH1cbn1cblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaFFMIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZCB0byBnZW5lcmF0ZVxuICogYSBHcmFwaFFMIHF1ZXJ5IHN0cmluZy5cbiAqL1xudHlwZSBHcmFwaFFMUXVlcnlPYmplY3QgPSBQYXJhbWV0ZXJzPHR5cGVvZiBxdWVyeT5bMV07XG5cbi8qKlxuICogQSBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggR2l0aHViJ3MgR3JhcGhRTCBBUEkuXG4gKlxuICogVGhpcyBjbGFzcyBpcyBpbnRlbnRpb25hbGx5IG5vdCBleHBvcnRlZCBhcyBpdCBzaG91bGQgYWx3YXlzIGJlIGFjY2Vzcy91c2VkIHZpYSBhXG4gKiBfR2l0aHViQ2xpZW50IGluc3RhbmNlLlxuICovXG5jbGFzcyBHaXRodWJHcmFwaHFsQ2xpZW50IHtcbiAgLyoqIFRoZSBHaXRodWIgR3JhcGhRTCAodjQpIEFQSS4gKi9cbiAgcHJpdmF0ZSBncmFxaHFsID0gZ3JhcGhxbDtcblxuICBjb25zdHJ1Y3Rvcih0b2tlbj86IHN0cmluZykge1xuICAgIC8vIFNldCB0aGUgZGVmYXVsdCBoZWFkZXJzIHRvIGluY2x1ZGUgYXV0aG9yaXphdGlvbiB3aXRoIHRoZSBwcm92aWRlZCB0b2tlbiBmb3IgYWxsXG4gICAgLy8gZ3JhcGhRTCBjYWxscy5cbiAgICBpZiAodG9rZW4pIHtcbiAgICAgIHRoaXMuZ3JhcWhxbCA9IHRoaXMuZ3JhcWhxbC5kZWZhdWx0cyh7aGVhZGVyczoge2F1dGhvcml6YXRpb246IGB0b2tlbiAke3Rva2VufWB9fSk7XG4gICAgfVxuICB9XG5cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBoUUwgQVBJLiAqL1xuICBhc3luYyBxdWVyeTxUIGV4dGVuZHMgR3JhcGhRTFF1ZXJ5T2JqZWN0PihxdWVyeU9iamVjdDogVCwgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVycyA9IHt9KSB7XG4gICAgY29uc3QgcXVlcnlTdHJpbmcgPSBxdWVyeShxdWVyeU9iamVjdCk7XG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmdyYXFocWwocXVlcnlTdHJpbmcsIHBhcmFtcykpIGFzIFQ7XG4gIH1cbn1cbiJdfQ==