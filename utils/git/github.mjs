/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __extends, __generator } from "tslib";
import { graphql } from '@octokit/graphql';
import { Octokit } from '@octokit/rest';
import { query } from 'typed-graphqlify';
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
/** A Github client for interacting with the Github APIs. */
var GithubClient = /** @class */ (function () {
    function GithubClient(_octokitOptions) {
        this._octokitOptions = _octokitOptions;
        /** The octokit instance actually performing API requests. */
        this._octokit = new Octokit(this._octokitOptions);
        this.pulls = this._octokit.pulls;
        this.repos = this._octokit.repos;
        this.issues = this._octokit.issues;
        this.git = this._octokit.git;
        this.paginate = this._octokit.paginate;
        this.rateLimit = this._octokit.rateLimit;
    }
    return GithubClient;
}());
export { GithubClient };
/**
 * Extension of the `GithubClient` that provides utilities which are specific
 * to authenticated instances.
 */
var AuthenticatedGithubClient = /** @class */ (function (_super) {
    __extends(AuthenticatedGithubClient, _super);
    function AuthenticatedGithubClient(_token) {
        var _this = 
        // Set the token for the octokit instance.
        _super.call(this, { auth: _token }) || this;
        _this._token = _token;
        /** The graphql instance with authentication set during construction. */
        _this._graphql = graphql.defaults({ headers: { authorization: "token " + _this._token } });
        return _this;
    }
    /** Perform a query using Github's Graphql API. */
    AuthenticatedGithubClient.prototype.graphql = function (queryObject, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._graphql(query(queryObject).toString(), params)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    return AuthenticatedGithubClient;
}(GithubClient));
export { AuthenticatedGithubClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUN6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQWdCdkMsNENBQTRDO0FBQzVDO0lBQTJDLHlDQUFLO0lBQzlDLCtCQUFtQixNQUFjLEVBQUUsT0FBZTtRQUFsRCxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxTQUNmO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFKRCxDQUEyQyxLQUFLLEdBSS9DOztBQUVELDREQUE0RDtBQUM1RDtJQVdFLHNCQUFvQixlQUFpQztRQUFqQyxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7UUFWckQsNkRBQTZEO1FBQ3JELGFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFNUMsVUFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzVCLFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixXQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDOUIsUUFBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1FBQ3hCLGFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztRQUNsQyxjQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUM7SUFFVyxDQUFDO0lBQzNELG1CQUFDO0FBQUQsQ0FBQyxBQVpELElBWUM7O0FBRUQ7OztHQUdHO0FBQ0g7SUFBK0MsNkNBQVk7SUFJekQsbUNBQW9CLE1BQWM7UUFBbEM7UUFDRSwwQ0FBMEM7UUFDMUMsa0JBQU0sRUFBQyxJQUFJLEVBQUUsTUFBTSxFQUFDLENBQUMsU0FDdEI7UUFIbUIsWUFBTSxHQUFOLE1BQU0sQ0FBUTtRQUhsQyx3RUFBd0U7UUFDaEUsY0FBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBQyxPQUFPLEVBQUUsRUFBQyxhQUFhLEVBQUUsV0FBUyxLQUFJLENBQUMsTUFBUSxFQUFDLEVBQUMsQ0FBQyxDQUFDOztJQUt4RixDQUFDO0lBRUQsa0RBQWtEO0lBQzVDLDJDQUFPLEdBQWIsVUFBNEMsV0FBYyxFQUFFLE1BQThCO1FBQTlCLHVCQUFBLEVBQUEsV0FBOEI7Ozs7NEJBQ2hGLHFCQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxFQUFBOzRCQUFsRSxzQkFBTyxDQUFDLFNBQTBELENBQU0sRUFBQzs7OztLQUMxRTtJQUNILGdDQUFDO0FBQUQsQ0FBQyxBQWJELENBQStDLFlBQVksR0FhMUQiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtncmFwaHFsfSBmcm9tICdAb2N0b2tpdC9ncmFwaHFsJztcbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge1JlcXVlc3RQYXJhbWV0ZXJzfSBmcm9tICdAb2N0b2tpdC90eXBlcyc7XG5pbXBvcnQge3F1ZXJ5fSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuLyoqXG4gKiBBbiBvYmplY3QgcmVwcmVzZW50YXRpb24gb2YgYSBHcmFwaHFsIFF1ZXJ5IHRvIGJlIHVzZWQgYXMgYSByZXNwb25zZSB0eXBlIGFuZFxuICogdG8gZ2VuZXJhdGUgYSBHcmFwaHFsIHF1ZXJ5IHN0cmluZy5cbiAqL1xuZXhwb3J0IHR5cGUgR3JhcGhxbFF1ZXJ5T2JqZWN0ID0gUGFyYW1ldGVyczx0eXBlb2YgcXVlcnk+WzFdO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIC8qKiBPd25lciBsb2dpbiBvZiB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgb3duZXI6IHN0cmluZztcbiAgLyoqIE5hbWUgb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEVycm9yIGZvciBmYWlsZWQgR2l0aHViIEFQSSByZXF1ZXN0cy4gKi9cbmV4cG9ydCBjbGFzcyBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzdGF0dXM6IG51bWJlciwgbWVzc2FnZTogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqIEEgR2l0aHViIGNsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCB0aGUgR2l0aHViIEFQSXMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQ2xpZW50IHtcbiAgLyoqIFRoZSBvY3Rva2l0IGluc3RhbmNlIGFjdHVhbGx5IHBlcmZvcm1pbmcgQVBJIHJlcXVlc3RzLiAqL1xuICBwcml2YXRlIF9vY3Rva2l0ID0gbmV3IE9jdG9raXQodGhpcy5fb2N0b2tpdE9wdGlvbnMpO1xuXG4gIHJlYWRvbmx5IHB1bGxzID0gdGhpcy5fb2N0b2tpdC5wdWxscztcbiAgcmVhZG9ubHkgcmVwb3MgPSB0aGlzLl9vY3Rva2l0LnJlcG9zO1xuICByZWFkb25seSBpc3N1ZXMgPSB0aGlzLl9vY3Rva2l0Lmlzc3VlcztcbiAgcmVhZG9ubHkgZ2l0ID0gdGhpcy5fb2N0b2tpdC5naXQ7XG4gIHJlYWRvbmx5IHBhZ2luYXRlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcbiAgcmVhZG9ubHkgcmF0ZUxpbWl0ID0gdGhpcy5fb2N0b2tpdC5yYXRlTGltaXQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfb2N0b2tpdE9wdGlvbnM/OiBPY3Rva2l0Lk9wdGlvbnMpIHt9XG59XG5cbi8qKlxuICogRXh0ZW5zaW9uIG9mIHRoZSBgR2l0aHViQ2xpZW50YCB0aGF0IHByb3ZpZGVzIHV0aWxpdGllcyB3aGljaCBhcmUgc3BlY2lmaWNcbiAqIHRvIGF1dGhlbnRpY2F0ZWQgaW5zdGFuY2VzLlxuICovXG5leHBvcnQgY2xhc3MgQXV0aGVudGljYXRlZEdpdGh1YkNsaWVudCBleHRlbmRzIEdpdGh1YkNsaWVudCB7XG4gIC8qKiBUaGUgZ3JhcGhxbCBpbnN0YW5jZSB3aXRoIGF1dGhlbnRpY2F0aW9uIHNldCBkdXJpbmcgY29uc3RydWN0aW9uLiAqL1xuICBwcml2YXRlIF9ncmFwaHFsID0gZ3JhcGhxbC5kZWZhdWx0cyh7aGVhZGVyczoge2F1dGhvcml6YXRpb246IGB0b2tlbiAke3RoaXMuX3Rva2VufWB9fSk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdG9rZW46IHN0cmluZykge1xuICAgIC8vIFNldCB0aGUgdG9rZW4gZm9yIHRoZSBvY3Rva2l0IGluc3RhbmNlLlxuICAgIHN1cGVyKHthdXRoOiBfdG9rZW59KTtcbiAgfVxuXG4gIC8qKiBQZXJmb3JtIGEgcXVlcnkgdXNpbmcgR2l0aHViJ3MgR3JhcGhxbCBBUEkuICovXG4gIGFzeW5jIGdyYXBocWw8VCBleHRlbmRzIEdyYXBocWxRdWVyeU9iamVjdD4ocXVlcnlPYmplY3Q6IFQsIHBhcmFtczogUmVxdWVzdFBhcmFtZXRlcnMgPSB7fSkge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5fZ3JhcGhxbChxdWVyeShxdWVyeU9iamVjdCkudG9TdHJpbmcoKSwgcGFyYW1zKSkgYXMgVDtcbiAgfVxufVxuIl19