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
    exports.AuthenticatedGithubClient = exports.GithubClient = exports.GithubApiRequestError = void 0;
    var tslib_1 = require("tslib");
    var graphql_1 = require("@octokit/graphql");
    var rest_1 = require("@octokit/rest");
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
    /** A Github client for interacting with the Github APIs. */
    var GithubClient = /** @class */ (function () {
        function GithubClient(_octokitOptions) {
            this._octokitOptions = _octokitOptions;
            /** The octokit instance actually performing API requests. */
            this._octokit = new rest_1.Octokit(this._octokitOptions);
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
    exports.GithubClient = GithubClient;
    /**
     * Extension of the `GithubClient` that provides utilities which are specific
     * to authenticated instances.
     */
    var AuthenticatedGithubClient = /** @class */ (function (_super) {
        tslib_1.__extends(AuthenticatedGithubClient, _super);
        function AuthenticatedGithubClient(_token) {
            var _this = 
            // Set the token for the octokit instance.
            _super.call(this, { auth: _token }) || this;
            _this._token = _token;
            /** The graphql instance with authentication set during construction. */
            _this._graphql = graphql_1.graphql.defaults({ headers: { authorization: "token " + _this._token } });
            return _this;
        }
        /** Perform a query using Github's Graphql API. */
        AuthenticatedGithubClient.prototype.graphql = function (queryObject, params) {
            if (params === void 0) { params = {}; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._graphql(typed_graphqlify_1.query(queryObject).toString(), params)];
                        case 1: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        return AuthenticatedGithubClient;
    }(GithubClient));
    exports.AuthenticatedGithubClient = AuthenticatedGithubClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUdILDRDQUF5QztJQUd6QyxzQ0FBc0M7SUFFdEMscURBQXVDO0lBZ0J2Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEMsNERBQTREO0lBQzVEO1FBZ0JFLHNCQUFvQixlQUFnQztZQUFoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFmcEQsNkRBQTZEO1lBQ3JELGFBQVEsR0FBRyxJQUFJLGNBQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7WUFFNUMsVUFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQzVCLFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM1QixXQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFDOUIsUUFBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQ3hCLGNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztZQUNwQyxVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFFckMscUZBQXFGO1lBQ3JGLGdFQUFnRTtZQUN2RCxTQUFJLEdBQXdCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQy9DLGFBQVEsR0FBc0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7UUFFUCxDQUFDO1FBQzFELG1CQUFDO0lBQUQsQ0FBQyxBQWpCRCxJQWlCQztJQWpCWSxvQ0FBWTtJQW1CekI7OztPQUdHO0lBQ0g7UUFBK0MscURBQVk7UUFJekQsbUNBQW9CLE1BQWM7WUFBbEM7WUFDRSwwQ0FBMEM7WUFDMUMsa0JBQU0sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsU0FDdEI7WUFIbUIsWUFBTSxHQUFOLE1BQU0sQ0FBUTtZQUhsQyx3RUFBd0U7WUFDaEUsY0FBUSxHQUFHLGlCQUFPLENBQUMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUMsYUFBYSxFQUFFLFdBQVMsS0FBSSxDQUFDLE1BQVEsRUFBQyxFQUFDLENBQUMsQ0FBQzs7UUFLeEYsQ0FBQztRQUVELGtEQUFrRDtRQUM1QywyQ0FBTyxHQUFiLFVBQTRDLFdBQWMsRUFBRSxNQUE4QjtZQUE5Qix1QkFBQSxFQUFBLFdBQThCOzs7O2dDQUNoRixxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUE7Z0NBQWxFLHNCQUFPLENBQUMsU0FBMEQsQ0FBTSxFQUFDOzs7O1NBQzFFO1FBQ0gsZ0NBQUM7SUFBRCxDQUFDLEFBYkQsQ0FBK0MsWUFBWSxHQWExRDtJQWJZLDhEQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge09jdG9raXRPcHRpb25zfSBmcm9tICdAb2N0b2tpdC9jb3JlL2Rpc3QtdHlwZXMvdHlwZXMnO1xuaW1wb3J0IHtncmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcbmltcG9ydCB7UGFnaW5hdGVJbnRlcmZhY2V9IGZyb20gJ0BvY3Rva2l0L3BsdWdpbi1wYWdpbmF0ZS1yZXN0JztcbmltcG9ydCB7UmVzdEVuZHBvaW50TWV0aG9kc30gZnJvbSAnQG9jdG9raXQvcGx1Z2luLXJlc3QtZW5kcG9pbnQtbWV0aG9kcy9kaXN0LXR5cGVzL2dlbmVyYXRlZC9tZXRob2QtdHlwZXMnO1xuaW1wb3J0IHtPY3Rva2l0fSBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7UmVxdWVzdFBhcmFtZXRlcnN9IGZyb20gJ0BvY3Rva2l0L3R5cGVzJztcbmltcG9ydCB7cXVlcnl9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG4vKipcbiAqIEFuIG9iamVjdCByZXByZXNlbnRhdGlvbiBvZiBhIEdyYXBocWwgUXVlcnkgdG8gYmUgdXNlZCBhcyBhIHJlc3BvbnNlIHR5cGUgYW5kXG4gKiB0byBnZW5lcmF0ZSBhIEdyYXBocWwgcXVlcnkgc3RyaW5nLlxuICovXG5leHBvcnQgdHlwZSBHcmFwaHFsUXVlcnlPYmplY3QgPSBQYXJhbWV0ZXJzPHR5cGVvZiBxdWVyeT5bMV07XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgLyoqIE93bmVyIGxvZ2luIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBvd25lcjogc3RyaW5nO1xuICAvKiogTmFtZSBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogRXJyb3IgZm9yIGZhaWxlZCBHaXRodWIgQVBJIHJlcXVlc3RzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaVJlcXVlc3RFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIHN0YXR1czogbnVtYmVyLCBtZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgfVxufVxuXG4vKiogQSBHaXRodWIgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBHaXRodWIgQVBJcy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJDbGllbnQge1xuICAvKiogVGhlIG9jdG9raXQgaW5zdGFuY2UgYWN0dWFsbHkgcGVyZm9ybWluZyBBUEkgcmVxdWVzdHMuICovXG4gIHByaXZhdGUgX29jdG9raXQgPSBuZXcgT2N0b2tpdCh0aGlzLl9vY3Rva2l0T3B0aW9ucyk7XG5cbiAgcmVhZG9ubHkgcHVsbHMgPSB0aGlzLl9vY3Rva2l0LnB1bGxzO1xuICByZWFkb25seSByZXBvcyA9IHRoaXMuX29jdG9raXQucmVwb3M7XG4gIHJlYWRvbmx5IGlzc3VlcyA9IHRoaXMuX29jdG9raXQuaXNzdWVzO1xuICByZWFkb25seSBnaXQgPSB0aGlzLl9vY3Rva2l0LmdpdDtcbiAgcmVhZG9ubHkgcmF0ZUxpbWl0ID0gdGhpcy5fb2N0b2tpdC5yYXRlTGltaXQ7XG4gIHJlYWRvbmx5IHRlYW1zID0gdGhpcy5fb2N0b2tpdC50ZWFtcztcblxuICAvLyBOb3RlOiBUaGVzZSBhcmUgcHJvcGVydGllcyBmcm9tIGBPY3Rva2l0YCB0aGF0IGFyZSBicm91Z2h0IGluIGJ5IG9wdGlvbmFsIHBsdWdpbnMuXG4gIC8vIFR5cGVTY3JpcHQgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhbiBleHBsaWNpdCB0eXBlIGZvciB0aGVzZS5cbiAgcmVhZG9ubHkgcmVzdDogUmVzdEVuZHBvaW50TWV0aG9kcyA9IHRoaXMuX29jdG9raXQucmVzdDtcbiAgcmVhZG9ubHkgcGFnaW5hdGU6IFBhZ2luYXRlSW50ZXJmYWNlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vY3Rva2l0T3B0aW9ucz86IE9jdG9raXRPcHRpb25zKSB7fVxufVxuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgYEdpdGh1YkNsaWVudGAgdGhhdCBwcm92aWRlcyB1dGlsaXRpZXMgd2hpY2ggYXJlIHNwZWNpZmljXG4gKiB0byBhdXRoZW50aWNhdGVkIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQgZXh0ZW5kcyBHaXRodWJDbGllbnQge1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLl90b2tlbn1gfX0pO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Rva2VuOiBzdHJpbmcpIHtcbiAgICAvLyBTZXQgdGhlIHRva2VuIGZvciB0aGUgb2N0b2tpdCBpbnN0YW5jZS5cbiAgICBzdXBlcih7YXV0aDogX3Rva2VufSk7XG4gIH1cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBocWwgQVBJLiAqL1xuICBhc3luYyBncmFwaHFsPFQgZXh0ZW5kcyBHcmFwaHFsUXVlcnlPYmplY3Q+KHF1ZXJ5T2JqZWN0OiBULCBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJzID0ge30pIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2dyYXBocWwocXVlcnkocXVlcnlPYmplY3QpLnRvU3RyaW5nKCksIHBhcmFtcykpIGFzIFQ7XG4gIH1cbn1cbiJdfQ==