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
            this.paginate = this._octokit.paginate;
            this.rateLimit = this._octokit.rateLimit;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDRDQUF5QztJQUN6QyxzQ0FBc0M7SUFFdEMscURBQXVDO0lBZ0J2Qyw0Q0FBNEM7SUFDNUM7UUFBMkMsaURBQUs7UUFDOUMsK0JBQW1CLE1BQWMsRUFBRSxPQUFlO1lBQWxELFlBQ0Usa0JBQU0sT0FBTyxDQUFDLFNBQ2Y7WUFGa0IsWUFBTSxHQUFOLE1BQU0sQ0FBUTs7UUFFakMsQ0FBQztRQUNILDRCQUFDO0lBQUQsQ0FBQyxBQUpELENBQTJDLEtBQUssR0FJL0M7SUFKWSxzREFBcUI7SUFNbEMsNERBQTREO0lBQzVEO1FBV0Usc0JBQW9CLGVBQWlDO1lBQWpDLG9CQUFlLEdBQWYsZUFBZSxDQUFrQjtZQVZyRCw2REFBNkQ7WUFDckQsYUFBUSxHQUFHLElBQUksY0FBTyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUU1QyxVQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDNUIsVUFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1lBQzVCLFdBQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQztZQUM5QixRQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUM7WUFDeEIsYUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDO1lBQ2xDLGNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUVXLENBQUM7UUFDM0QsbUJBQUM7SUFBRCxDQUFDLEFBWkQsSUFZQztJQVpZLG9DQUFZO0lBY3pCOzs7T0FHRztJQUNIO1FBQStDLHFEQUFZO1FBSXpELG1DQUFvQixNQUFjO1lBQWxDO1lBQ0UsMENBQTBDO1lBQzFDLGtCQUFNLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLFNBQ3RCO1lBSG1CLFlBQU0sR0FBTixNQUFNLENBQVE7WUFIbEMsd0VBQXdFO1lBQ2hFLGNBQVEsR0FBRyxpQkFBTyxDQUFDLFFBQVEsQ0FBQyxFQUFDLE9BQU8sRUFBRSxFQUFDLGFBQWEsRUFBRSxXQUFTLEtBQUksQ0FBQyxNQUFRLEVBQUMsRUFBQyxDQUFDLENBQUM7O1FBS3hGLENBQUM7UUFFRCxrREFBa0Q7UUFDNUMsMkNBQU8sR0FBYixVQUE0QyxXQUFjLEVBQUUsTUFBOEI7WUFBOUIsdUJBQUEsRUFBQSxXQUE4Qjs7OztnQ0FDaEYscUJBQU0sSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFBO2dDQUFsRSxzQkFBTyxDQUFDLFNBQTBELENBQU0sRUFBQzs7OztTQUMxRTtRQUNILGdDQUFDO0lBQUQsQ0FBQyxBQWJELENBQStDLFlBQVksR0FhMUQ7SUFiWSw4REFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge1JlcXVlc3RQYXJhbWV0ZXJzfSBmcm9tICdAb2N0b2tpdC90eXBlcyc7XG5pbXBvcnQge3F1ZXJ5fSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQ2xpZW50IHtcbiAgLyoqIFRoZSBvY3Rva2l0IGluc3RhbmNlIGFjdHVhbGx5IHBlcmZvcm1pbmcgQVBJIHJlcXVlc3RzLiAqL1xuICBwcml2YXRlIF9vY3Rva2l0ID0gbmV3IE9jdG9raXQodGhpcy5fb2N0b2tpdE9wdGlvbnMpO1xuXG4gIHJlYWRvbmx5IHB1bGxzID0gdGhpcy5fb2N0b2tpdC5wdWxscztcbiAgcmVhZG9ubHkgcmVwb3MgPSB0aGlzLl9vY3Rva2l0LnJlcG9zO1xuICByZWFkb25seSBpc3N1ZXMgPSB0aGlzLl9vY3Rva2l0Lmlzc3VlcztcbiAgcmVhZG9ubHkgZ2l0ID0gdGhpcy5fb2N0b2tpdC5naXQ7XG4gIHJlYWRvbmx5IHBhZ2luYXRlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcbiAgcmVhZG9ubHkgcmF0ZUxpbWl0ID0gdGhpcy5fb2N0b2tpdC5yYXRlTGltaXQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfb2N0b2tpdE9wdGlvbnM/OiBPY3Rva2l0Lk9wdGlvbnMpIHt9XG59XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHRoZSBgR2l0aHViQ2xpZW50YCB0aGF0IHByb3ZpZGVzIHV0aWxpdGllcyB3aGljaCBhcmUgc3BlY2lmaWNcbiAqIHRvIGF1dGhlbnRpY2F0ZWQgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRlZEdpdGh1YkNsaWVudCBleHRlbmRzIEdpdGh1YkNsaWVudCB7XG4gIC8qKiBUaGUgZ3JhcGhxbCBpbnN0YW5jZSB3aXRoIGF1dGhlbnRpY2F0aW9uIHNldCBkdXJpbmcgY29uc3RydWN0aW9uLiAqL1xuICBwcml2YXRlIF9ncmFwaHFsID0gZ3JhcGhxbC5kZWZhdWx0cyh7aGVhZGVyczoge2F1dGhvcml6YXRpb246IGB0b2tlbiAke3RoaXMuX3Rva2VufWB9fSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdG9rZW46IHN0cmluZykge1xuICAgIC8vIFNldCB0aGUgdG9rZW4gZm9yIHRoZSBvY3Rva2l0IGluc3RhbmNlLlxuICAgIHN1cGVyKHthdXRoOiBfdG9rZW59KTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtIGEgcXVlcnkgdXNpbmcgR2l0aHViJ3MgR3JhcGhxbCBBUEkuICovXG4gIGFzeW5jIGdyYXBocWw8VCBleHRlbmRzIEdyYXBocWxRdWVyeU9iamVjdD4ocXVlcnlPYmplY3Q6IFQsIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcnMgPSB7fSkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ3JhcGhxbChxdWVyeShxdWVyeU9iamVjdCkudG9TdHJpbmcoKSwgcGFyYW1zKSkgYXMgVDtcbiAgfVxufVxuIl19