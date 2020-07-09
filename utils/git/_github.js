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
        define("@angular/dev-infra-private/utils/git/_github", ["require", "exports", "tslib", "@octokit/graphql", "@octokit/rest", "typed-graphqlify"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports._GithubClient = exports.GithubApiRequestError = void 0;
    var tslib_1 = require("tslib");
    /****************************************************************************
     ****************************************************************************
     ** DO NOT IMPORT THE GithubClient DIRECTLY, INSTEAD IMPORT GitClient from **
     ** ./index.ts and access the GithubClient via the `.github` member.       **
     ****************************************************************************
     ****************************************************************************/
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
     * Additionally, provides convienience methods for actions which require multiple requests, or
     * would provide value from memoized style responses.
     **/
    var _GithubClient = /** @class */ (function (_super) {
        tslib_1.__extends(_GithubClient, _super);
        function _GithubClient(token) {
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
        _GithubClient.prototype.getCurrentUser = function () {
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
        return _GithubClient;
    }(Octokit));
    exports._GithubClient = _GithubClient;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiX2dpdGh1Yi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9naXQvX2dpdGh1Yi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUg7Ozs7O2tGQUs4RTtJQUU5RSw0Q0FBeUM7SUFDekMsdUNBQXlDO0lBRXpDLHFEQUE4QztJQUU5Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEM7Ozs7O1FBS0k7SUFDSjtRQUFtQyx5Q0FBTztRQU94Qyx1QkFBWSxLQUFjO1lBQTFCO1lBQ0Usc0RBQXNEO1lBQ3RELGtCQUFNLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBQyxDQUFDLFNBVXJCO1lBZkQsaUVBQWlFO1lBQ3pELGtCQUFZLEdBQWdCLElBQUksQ0FBQztZQU12QyxLQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsVUFBQSxLQUFLO2dCQUM5Qiw0REFBNEQ7Z0JBQzVELDhEQUE4RDtnQkFDOUQsTUFBTSxJQUFJLHFCQUFxQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQy9ELENBQUMsQ0FBQyxDQUFDO1lBRUgsdUNBQXVDO1lBQ3ZDLEtBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7UUFDaEQsQ0FBQztRQUVELDBEQUEwRDtRQUNwRCxzQ0FBYyxHQUFwQjs7Ozs7OzRCQUNFLHNGQUFzRjs0QkFDdEYsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLElBQUksRUFBRTtnQ0FDOUIsc0JBQU8sSUFBSSxDQUFDLFlBQVksRUFBQzs2QkFDMUI7NEJBQ2MscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0NBQ3RDLE1BQU0sRUFBRTt3Q0FDTixLQUFLLEVBQUUsd0JBQUssQ0FBQyxNQUFNO3FDQUNwQjtpQ0FDRixDQUFDLEVBQUE7OzRCQUpJLE1BQU0sR0FBRyxTQUliOzRCQUNGLHNCQUFPLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUM7Ozs7U0FDaEQ7UUFDSCxvQkFBQztJQUFELENBQUMsQUFsQ0QsQ0FBbUMsT0FBTyxHQWtDekM7SUFsQ1ksc0NBQWE7SUEwQzFCOzs7OztPQUtHO0lBQ0g7UUFJRSw2QkFBWSxLQUFjO1lBSDFCLG1DQUFtQztZQUMzQixZQUFPLEdBQUcsaUJBQU8sQ0FBQztZQUd4QixtRkFBbUY7WUFDbkYsaUJBQWlCO1lBQ2pCLElBQUksS0FBSyxFQUFFO2dCQUNULElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUMsYUFBYSxFQUFFLFdBQVMsS0FBTyxFQUFDLEVBQUMsQ0FBQyxDQUFDO2FBQ3JFO1FBQ0gsQ0FBQztRQUdELGtEQUFrRDtRQUM1QyxtQ0FBSyxHQUFYLFVBQTBDLFdBQWMsRUFBRSxNQUE4QjtZQUE5Qix1QkFBQSxFQUFBLFdBQThCOzs7Ozs7NEJBQ2hGLFdBQVcsR0FBRyx3QkFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDOzRCQUMvQixxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBQTtnQ0FBL0Msc0JBQU8sQ0FBQyxTQUF1QyxDQUFNLEVBQUM7Ozs7U0FDdkQ7UUFDSCwwQkFBQztJQUFELENBQUMsQUFsQkQsSUFrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiogRE8gTk9UIElNUE9SVCBUSEUgR2l0aHViQ2xpZW50IERJUkVDVExZLCBJTlNURUFEIElNUE9SVCBHaXRDbGllbnQgZnJvbSAqKlxuICoqIC4vaW5kZXgudHMgYW5kIGFjY2VzcyB0aGUgR2l0aHViQ2xpZW50IHZpYSB0aGUgYC5naXRodWJgIG1lbWJlci4gICAgICAgKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuaW1wb3J0IHtncmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge1JlcXVlc3RQYXJhbWV0ZXJzfSBmcm9tICdAb2N0b2tpdC90eXBlcyc7XG5pbXBvcnQge3F1ZXJ5LCB0eXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpUmVxdWVzdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdHVzOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogQSBHaXRodWIgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBHaXRodWIgQVBJcy5cbiAqXG4gKiBBZGRpdGlvbmFsbHksIHByb3ZpZGVzIGNvbnZpZW5pZW5jZSBtZXRob2RzIGZvciBhY3Rpb25zIHdoaWNoIHJlcXVpcmUgbXVsdGlwbGUgcmVxdWVzdHMsIG9yXG4gKiB3b3VsZCBwcm92aWRlIHZhbHVlIGZyb20gbWVtb2l6ZWQgc3R5bGUgcmVzcG9uc2VzLlxuICoqL1xuZXhwb3J0IGNsYXNzIF9HaXRodWJDbGllbnQgZXh0ZW5kcyBPY3Rva2l0IHtcbiAgLyoqIFRoZSBHaXRodWIgR3JhcGhRTCAodjQpIEFQSS4gKi9cbiAgZ3JhcWhxbDogR2l0aHViR3JhcGhxbENsaWVudDtcblxuICAvKiogVGhlIGN1cnJlbnQgdXNlciBiYXNlZCBvbiBjaGVja2luZyBhZ2FpbnN0IHRoZSBHaXRodWIgQVBJLiAqL1xuICBwcml2YXRlIF9jdXJyZW50VXNlcjogc3RyaW5nfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHRva2VuPzogc3RyaW5nKSB7XG4gICAgLy8gUGFzcyBpbiBhdXRoZW50aWNhdGlvbiB0b2tlbiB0byBiYXNlIE9jdG9raXQgY2xhc3MuXG4gICAgc3VwZXIoe2F1dGg6IHRva2VufSk7XG5cbiAgICB0aGlzLmhvb2suZXJyb3IoJ3JlcXVlc3QnLCBlcnJvciA9PiB7XG4gICAgICAvLyBXcmFwIEFQSSBlcnJvcnMgaW4gYSBrbm93biBlcnJvciBjbGFzcy4gVGhpcyBhbGxvd3MgdXMgdG9cbiAgICAgIC8vIGV4cGVjdCBHaXRodWIgQVBJIGVycm9ycyBiZXR0ZXIgYW5kIGluIGEgbm9uLWFtYmlndW91cyB3YXkuXG4gICAgICB0aHJvdyBuZXcgR2l0aHViQXBpUmVxdWVzdEVycm9yKGVycm9yLnN0YXR1cywgZXJyb3IubWVzc2FnZSk7XG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgYXV0aGVudGljYXRlZCBncmFwaHFsIGNsaWVudC5cbiAgICB0aGlzLmdyYXFocWwgPSBuZXcgR2l0aHViR3JhcGhxbENsaWVudCh0b2tlbik7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIGxvZ2luIG9mIHRoZSBjdXJyZW50IHVzZXIgZnJvbSBHaXRodWIuICovXG4gIGFzeW5jIGdldEN1cnJlbnRVc2VyKCkge1xuICAgIC8vIElmIHRoZSBjdXJyZW50IHVzZXIgaGFzIGFscmVhZHkgYmVlbiByZXRyaWV2ZWQgcmV0dXJuIHRoZSBjdXJyZW50IHVzZXIgdmFsdWUgYWdhaW4uXG4gICAgaWYgKHRoaXMuX2N1cnJlbnRVc2VyICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXI7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ3JhcWhxbC5xdWVyeSh7XG4gICAgICB2aWV3ZXI6IHtcbiAgICAgICAgbG9naW46IHR5cGVzLnN0cmluZyxcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcy5fY3VycmVudFVzZXIgPSByZXN1bHQudmlld2VyLmxvZ2luO1xuICB9XG59XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhRTCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmQgdG8gZ2VuZXJhdGVcbiAqIGEgR3JhcGhRTCBxdWVyeSBzdHJpbmcuXG4gKi9cbnR5cGUgR3JhcGhRTFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKipcbiAqIEEgY2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIEdpdGh1YidzIEdyYXBoUUwgQVBJLlxuICpcbiAqIFRoaXMgY2xhc3MgaXMgaW50ZW50aW9uYWxseSBub3QgZXhwb3J0ZWQgYXMgaXQgc2hvdWxkIGFsd2F5cyBiZSBhY2Nlc3MvdXNlZCB2aWEgYVxuICogX0dpdGh1YkNsaWVudCBpbnN0YW5jZS5cbiAqL1xuY2xhc3MgR2l0aHViR3JhcGhxbENsaWVudCB7XG4gIC8qKiBUaGUgR2l0aHViIEdyYXBoUUwgKHY0KSBBUEkuICovXG4gIHByaXZhdGUgZ3JhcWhxbCA9IGdyYXBocWw7XG5cbiAgY29uc3RydWN0b3IodG9rZW4/OiBzdHJpbmcpIHtcbiAgICAvLyBTZXQgdGhlIGRlZmF1bHQgaGVhZGVycyB0byBpbmNsdWRlIGF1dGhvcml6YXRpb24gd2l0aCB0aGUgcHJvdmlkZWQgdG9rZW4gZm9yIGFsbFxuICAgIC8vIGdyYXBoUUwgY2FsbHMuXG4gICAgaWYgKHRva2VuKSB7XG4gICAgICB0aGlzLmdyYXFocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0b2tlbn1gfX0pO1xuICAgIH1cbiAgfVxuXG5cbiAgLyoqIFBlcmZvcm0gYSBxdWVyeSB1c2luZyBHaXRodWIncyBHcmFwaFFMIEFQSS4gKi9cbiAgYXN5bmMgcXVlcnk8VCBleHRlbmRzIEdyYXBoUUxRdWVyeU9iamVjdD4ocXVlcnlPYmplY3Q6IFQsIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcnMgPSB7fSkge1xuICAgIGNvbnN0IHF1ZXJ5U3RyaW5nID0gcXVlcnkocXVlcnlPYmplY3QpO1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5ncmFxaHFsKHF1ZXJ5U3RyaW5nLCBwYXJhbXMpKSBhcyBUO1xuICB9XG59XG4iXX0=