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
            this._octokit = new rest_1.Octokit({ auth: this.token });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6QyxzQ0FBc0M7SUFFdEMscURBQXVDO0lBZ0J2Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEMsNENBQTRDO0lBQzVDO1FBQThDLG9EQUFLO1FBQW5EOztRQUFxRCxDQUFDO1FBQUQsK0JBQUM7SUFBRCxDQUFDLEFBQXRELENBQThDLEtBQUssR0FBRztJQUF6Qyw0REFBd0I7SUFFckM7Ozs7O1FBS0k7SUFDSjtRQU1FOztXQUVHO1FBQ0gsc0JBQW9CLEtBQWM7WUFBZCxVQUFLLEdBQUwsS0FBSyxDQUFTO1lBUmxDLHdFQUF3RTtZQUNoRSxhQUFRLEdBQUcsaUJBQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxJQUFJLENBQUMsS0FBTyxFQUFDLEVBQUMsQ0FBQyxDQUFDO1lBQ3ZGLDZEQUE2RDtZQUNyRCxhQUFRLEdBQUcsSUFBSSxjQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7WUF1Qm5ELFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztZQUM1QixVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDNUIsV0FBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBQzlCLFFBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUN4QixhQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUM7WUFDbEMsY0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBdEJsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLFVBQUEsS0FBSztnQkFDdkMsNERBQTREO2dCQUM1RCw4REFBOEQ7Z0JBQzlELE1BQU0sSUFBSSxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMvRCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFFRCxrREFBa0Q7UUFDNUMsOEJBQU8sR0FBYixVQUE0QyxXQUFjLEVBQUUsTUFBOEI7WUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7Ozs7NEJBQ3hGLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0NBQzVCLE1BQU0sSUFBSSx3QkFBd0IsQ0FDOUIsc0ZBQXNGO29DQUN0RixnRUFBZ0UsQ0FBQyxDQUFDOzZCQUN2RTs0QkFDTyxxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUE7Z0NBQWxFLHNCQUFPLENBQUMsU0FBMEQsQ0FBTSxFQUFDOzs7O1NBQzFFO1FBUUgsbUJBQUM7SUFBRCxDQUFDLEFBakNELElBaUNDO0lBakNZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z3JhcGhxbH0gZnJvbSAnQG9jdG9raXQvZ3JhcGhxbCc7XG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtSZXF1ZXN0UGFyYW1ldGVyc30gZnJvbSAnQG9jdG9raXQvdHlwZXMnO1xuaW1wb3J0IHtxdWVyeX0gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhxbCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmRcbiAqIHRvIGdlbmVyYXRlIGEgR3JhcGhxbCBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIEdyYXBocWxRdWVyeU9iamVjdCA9IFBhcmFtZXRlcnM8dHlwZW9mIHF1ZXJ5PlsxXTtcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICAvKiogT3duZXIgbG9naW4gb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpUmVxdWVzdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdHVzOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViR3JhcGhxbENsaWVudEVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBBIEdpdGh1YiBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUElzLlxuICpcbiAqIEFkZGl0aW9uYWxseSwgcHJvdmlkZXMgY29udmVuaWVuY2UgbWV0aG9kcyBmb3IgYWN0aW9ucyB3aGljaCByZXF1aXJlIG11bHRpcGxlIHJlcXVlc3RzLCBvclxuICogd291bGQgcHJvdmlkZSB2YWx1ZSBmcm9tIG1lbW9pemVkIHN0eWxlIHJlc3BvbnNlcy5cbiAqKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJDbGllbnQge1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLnRva2VufWB9fSk7XG4gIC8qKiBUaGUgT2N0b2tpdCBpbnN0YW5jZSBhY3R1YWxseSBwZXJmb3JtaW5nIEFQSSByZXF1ZXN0cy4gKi9cbiAgcHJpdmF0ZSBfb2N0b2tpdCA9IG5ldyBPY3Rva2l0KHthdXRoOiB0aGlzLnRva2VufSk7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB0b2tlbiBUaGUgZ2l0aHViIGF1dGhlbnRpY2F0aW9uIHRva2VuIGZvciBHaXRodWIgUmVzdCBhbmQgR3JhcGhxbCBBUEkgcmVxdWVzdHMuXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIHRva2VuPzogc3RyaW5nKSB7XG4gICAgdGhpcy5fb2N0b2tpdC5ob29rLmVycm9yKCdyZXF1ZXN0JywgZXJyb3IgPT4ge1xuICAgICAgLy8gV3JhcCBBUEkgZXJyb3JzIGluIGEga25vd24gZXJyb3IgY2xhc3MuIFRoaXMgYWxsb3dzIHVzIHRvXG4gICAgICAvLyBleHBlY3QgR2l0aHViIEFQSSBlcnJvcnMgYmV0dGVyIGFuZCBpbiBhIG5vbi1hbWJpZ3VvdXMgd2F5LlxuICAgICAgdGhyb3cgbmV3IEdpdGh1YkFwaVJlcXVlc3RFcnJvcihlcnJvci5zdGF0dXMsIGVycm9yLm1lc3NhZ2UpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIFBlcmZvcm0gYSBxdWVyeSB1c2luZyBHaXRodWIncyBHcmFwaHFsIEFQSS4gKi9cbiAgYXN5bmMgZ3JhcGhxbDxUIGV4dGVuZHMgR3JhcGhxbFF1ZXJ5T2JqZWN0PihxdWVyeU9iamVjdDogVCwgcGFyYW1zOiBSZXF1ZXN0UGFyYW1ldGVycyA9IHt9KSB7XG4gICAgaWYgKHRoaXMudG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEdpdGh1YkdyYXBocWxDbGllbnRFcnJvcihcbiAgICAgICAgICAnQ2Fubm90IHF1ZXJ5IHZpYSBncmFwaHFsIHdpdGhvdXQgYW4gYXV0aGVudGljYXRpb24gdG9rZW4gc2V0LCB1c2UgdGhlIGF1dGhlbnRpY2F0ZWQgJyArXG4gICAgICAgICAgJ2BHaXRDbGllbnRgIGJ5IGNhbGxpbmcgYEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKWAuJyk7XG4gICAgfVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ3JhcGhxbChxdWVyeShxdWVyeU9iamVjdCkudG9TdHJpbmcoKSwgcGFyYW1zKSkgYXMgVDtcbiAgfVxuXG4gIHB1bGxzID0gdGhpcy5fb2N0b2tpdC5wdWxscztcbiAgcmVwb3MgPSB0aGlzLl9vY3Rva2l0LnJlcG9zO1xuICBpc3N1ZXMgPSB0aGlzLl9vY3Rva2l0Lmlzc3VlcztcbiAgZ2l0ID0gdGhpcy5fb2N0b2tpdC5naXQ7XG4gIHBhZ2luYXRlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcbiAgcmF0ZUxpbWl0ID0gdGhpcy5fb2N0b2tpdC5yYXRlTGltaXQ7XG59XG4iXX0=