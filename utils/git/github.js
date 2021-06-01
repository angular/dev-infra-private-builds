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
    var GithubClient = /** @class */ (function () {
        /**
         * @param token The github authentication token for Github Rest and Graphql API requests.
         */
        function GithubClient(token) {
            this.token = token;
            /** The graphql instance with authentication set during construction. */
            this._graphql = graphql_1.graphql.defaults({ headers: { authorization: "token " + this.token } });
            /** The Octokit instance actually performing API requests. */
            this._octokit = new rest_1.Octokit({ token: this.token });
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
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (this.token === undefined) {
                                throw new GithubGraphqlClientError('Cannot query via graphql without an authentication token set, use the authenticated ' +
                                    '`GitClient` by calling `GitClient.getAuthenticatedInstance()`.');
                            }
                            return [4 /*yield*/, this._graphql(typed_graphqlify_1.query(queryObject).toString(), params)];
                        case 1: return [2 /*return*/, (_a.sent())];
                    }
                });
            });
        };
        return GithubClient;
    }());
    exports.GithubClient = GithubClient;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6QyxzQ0FBc0M7SUFFdEMscURBQXVDO0lBZ0J2Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEMsNENBQTRDO0lBQzVDO1FBQThDLG9EQUFLO1FBQW5EOztRQUFxRCxDQUFDO1FBQUQsK0JBQUM7SUFBRCxDQUFDLEFBQXRELENBQThDLEtBQUssR0FBRztJQUF6Qyw0REFBd0I7SUFFckM7Ozs7O1FBS0k7SUFDSjtRQU1FOztXQUVHO1FBQ0gsc0JBQW9CLEtBQWM7WUFBZCxVQUFLLEdBQUwsS0FBSyxDQUFTO1lBUmxDLHdFQUF3RTtZQUNoRSxhQUFRLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxJQUFJLENBQUMsS0FBTyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZGLDZEQUE2RDtZQUNyRCxhQUFRLEdBQUcsSUFBSSxjQUFPLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7WUF1QnBELFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM1QixVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDNUIsV0FBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzlCLFFBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUN4QixhQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDbEMsY0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBdEJsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSztnQkFDdkMsNERBQTREO2dCQUM1RCw4REFBOEQ7Z0JBQzlELE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxrREFBa0Q7UUFDNUMsOEJBQU8sR0FBYixVQUE0QyxXQUFjLEVBQUUsTUFBOEI7WUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7Ozs7NEJBQ3hGLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0NBQzVCLE1BQU0sSUFBSSx3QkFBd0IsQ0FDOUIsc0ZBQXNGO29DQUN0RixnRUFBZ0UsQ0FBQyxDQUFDOzZCQUN2RTs0QkFDTyxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUE7Z0NBQWxFLHNCQUFPLENBQUMsU0FBMEQsQ0FBTSxFQUFDOzs7O1NBQzFFO1FBUUgsbUJBQUM7SUFBRCxDQUFDLEFBakNELElBaUNDO0lBakNZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z3JhcGhxbH0gZnJvbSAnQG9jdG9raXQvZ3JhcGhxbCc7XG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtSZXF1ZXN0UGFyYW1ldGVyc30gZnJvbSAnQG9jdG9raXQvdHlwZXMnO1xuaW1wb3J0IHtxdWVyeX0gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhxbCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmRcbiAqIHRvIGdlbmVyYXRlIGEgR3JhcGhxbCBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIEdyYXBocWxRdWVyeU9iamVjdCA9IFBhcmFtZXRlcnM8dHlwZW9mIHF1ZXJ5PlsxXTtcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICAvKiogT3duZXIgbG9naW4gb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpUmVxdWVzdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdHVzOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViR3JhcGhxbENsaWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBBIEdpdGh1YiBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUElzLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgcHJvdmlkZXMgY29udmVuaWVuY2UgbWV0aG9kcyBmb3IgYWN0aW9ucyB3aGljaCByZXF1aXJlIG11bHRpcGxlIHJlcXVlc3RzLCBvclxuICogd291bGQgcHJvdmlkZSB2YWx1ZSBmcm9tIG1lbW9pemVkIHN0eWxlIHJlc3BvbnNlcy5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJDbGllbnQge1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLnRva2VufWB9fSk7XG4gIC8qKiBUaGUgT2N0b2tpdCBpbnN0YW5jZSBhY3R1YWxseSBwZXJmb3JtaW5nIEFQSSByZXF1ZXN0cy4gKi9cbiAgcHJpdmF0ZSBfb2N0b2tpdCA9IG5ldyBPY3Rva2l0KHt0b2tlbjogdGhpcy50b2tlbn0pO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gdG9rZW4gVGhlIGdpdGh1YiBhdXRoZW50aWNhdGlvbiB0b2tlbiBmb3IgR2l0aHViIFJlc3QgYW5kIEdyYXBocWwgQVBJIHJlcXVlc3RzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB0b2tlbj86IHN0cmluZykge1xuICAgIHRoaXMuX29jdG9raXQuaG9vay5lcnJvcigncmVxdWVzdCcsIGVycm9yID0+IHtcbiAgICAgIC8vIFdyYXAgQVBJIGVycm9ycyBpbiBhIGtub3duIGVycm9yIGNsYXNzLiBUaGlzIGFsbG93cyB1cyB0b1xuICAgICAgLy8gZXhwZWN0IEdpdGh1YiBBUEkgZXJyb3JzIGJldHRlciBhbmQgaW4gYSBub24tYW1iaWd1b3VzIHdheS5cbiAgICAgIHRocm93IG5ldyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IoZXJyb3Iuc3RhdHVzLCBlcnJvci5tZXNzYWdlKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtIGEgcXVlcnkgdXNpbmcgR2l0aHViJ3MgR3JhcGhxbCBBUEkuICovXG4gIGFzeW5jIGdyYXBocWw8VCBleHRlbmRzIEdyYXBocWxRdWVyeU9iamVjdD4ocXVlcnlPYmplY3Q6IFQsIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcnMgPSB7fSkge1xuICAgIGlmICh0aGlzLnRva2VuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBHaXRodWJHcmFwaHFsQ2xpZW50RXJyb3IoXG4gICAgICAgICAgJ0Nhbm5vdCBxdWVyeSB2aWEgZ3JhcGhxbCB3aXRob3V0IGFuIGF1dGhlbnRpY2F0aW9uIHRva2VuIHNldCwgdXNlIHRoZSBhdXRoZW50aWNhdGVkICcgK1xuICAgICAgICAgICdgR2l0Q2xpZW50YCBieSBjYWxsaW5nIGBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKClgLicpO1xuICAgIH1cbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2dyYXBocWwocXVlcnkocXVlcnlPYmplY3QpLnRvU3RyaW5nKCksIHBhcmFtcykpIGFzIFQ7XG4gIH1cblxuICBwdWxscyA9IHRoaXMuX29jdG9raXQucHVsbHM7XG4gIHJlcG9zID0gdGhpcy5fb2N0b2tpdC5yZXBvcztcbiAgaXNzdWVzID0gdGhpcy5fb2N0b2tpdC5pc3N1ZXM7XG4gIGdpdCA9IHRoaXMuX29jdG9raXQuZ2l0O1xuICBwYWdpbmF0ZSA9IHRoaXMuX29jdG9raXQucGFnaW5hdGU7XG4gIHJhdGVMaW1pdCA9IHRoaXMuX29jdG9raXQucmF0ZUxpbWl0O1xufVxuIl19