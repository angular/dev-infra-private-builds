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
        this.rateLimit = this._octokit.rateLimit;
        // Note: These are properties from `Octokit` that are brought in by optional plugins.
        // TypeScript requires us to provide an explicit type for these.
        this.rest = this._octokit.rest;
        this.paginate = this._octokit.paginate;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC9naXRodWIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUdILE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUd6QyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXRDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQWdCdkMsNENBQTRDO0FBQzVDO0lBQTJDLHlDQUFLO0lBQzlDLCtCQUFtQixNQUFjLEVBQUUsT0FBZTtRQUFsRCxZQUNFLGtCQUFNLE9BQU8sQ0FBQyxTQUNmO1FBRmtCLFlBQU0sR0FBTixNQUFNLENBQVE7O0lBRWpDLENBQUM7SUFDSCw0QkFBQztBQUFELENBQUMsQUFKRCxDQUEyQyxLQUFLLEdBSS9DOztBQUVELDREQUE0RDtBQUM1RDtJQWVFLHNCQUFvQixlQUFnQztRQUFoQyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFkcEQsNkRBQTZEO1FBQ3JELGFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFNUMsVUFBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO1FBQzVCLFVBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztRQUM1QixXQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDOUIsUUFBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1FBQ3hCLGNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQztRQUU3QyxxRkFBcUY7UUFDckYsZ0VBQWdFO1FBQ3ZELFNBQUksR0FBd0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDL0MsYUFBUSxHQUFzQixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQztJQUVQLENBQUM7SUFDMUQsbUJBQUM7QUFBRCxDQUFDLEFBaEJELElBZ0JDOztBQUVEOzs7R0FHRztBQUNIO0lBQStDLDZDQUFZO0lBSXpELG1DQUFvQixNQUFjO1FBQWxDO1FBQ0UsMENBQTBDO1FBQzFDLGtCQUFNLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLFNBQ3RCO1FBSG1CLFlBQU0sR0FBTixNQUFNLENBQVE7UUFIbEMsd0VBQXdFO1FBQ2hFLGNBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUMsT0FBTyxFQUFFLEVBQUMsYUFBYSxFQUFFLFdBQVMsS0FBSSxDQUFDLE1BQVEsRUFBQyxFQUFDLENBQUMsQ0FBQzs7SUFLeEYsQ0FBQztJQUVELGtEQUFrRDtJQUM1QywyQ0FBTyxHQUFiLFVBQTRDLFdBQWMsRUFBRSxNQUE4QjtRQUE5Qix1QkFBQSxFQUFBLFdBQThCOzs7OzRCQUNoRixxQkFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLENBQUMsRUFBQTs0QkFBbEUsc0JBQU8sQ0FBQyxTQUEwRCxDQUFNLEVBQUM7Ozs7S0FDMUU7SUFDSCxnQ0FBQztBQUFELENBQUMsQUFiRCxDQUErQyxZQUFZLEdBYTFEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2N0b2tpdE9wdGlvbnN9IGZyb20gJ0BvY3Rva2l0L2NvcmUvZGlzdC10eXBlcy90eXBlcyc7XG5pbXBvcnQge2dyYXBocWx9IGZyb20gJ0BvY3Rva2l0L2dyYXBocWwnO1xuaW1wb3J0IHtQYWdpbmF0ZUludGVyZmFjZX0gZnJvbSAnQG9jdG9raXQvcGx1Z2luLXBhZ2luYXRlLXJlc3QnO1xuaW1wb3J0IHtSZXN0RW5kcG9pbnRNZXRob2RzfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzL2Rpc3QtdHlwZXMvZ2VuZXJhdGVkL21ldGhvZC10eXBlcyc7XG5pbXBvcnQge09jdG9raXR9IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtSZXF1ZXN0UGFyYW1ldGVyc30gZnJvbSAnQG9jdG9raXQvdHlwZXMnO1xuaW1wb3J0IHtxdWVyeX0gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5cbi8qKlxuICogQW4gb2JqZWN0IHJlcHJlc2VudGF0aW9uIG9mIGEgR3JhcGhxbCBRdWVyeSB0byBiZSB1c2VkIGFzIGEgcmVzcG9uc2UgdHlwZSBhbmRcbiAqIHRvIGdlbmVyYXRlIGEgR3JhcGhxbCBxdWVyeSBzdHJpbmcuXG4gKi9cbmV4cG9ydCB0eXBlIEdyYXBocWxRdWVyeU9iamVjdCA9IFBhcmFtZXRlcnM8dHlwZW9mIHF1ZXJ5PlsxXTtcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICAvKiogT3duZXIgbG9naW4gb2YgdGhlIHJlcG9zaXRvcnkuICovXG4gIG93bmVyOiBzdHJpbmc7XG4gIC8qKiBOYW1lIG9mIHRoZSByZXBvc2l0b3J5LiAqL1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBFcnJvciBmb3IgZmFpbGVkIEdpdGh1YiBBUEkgcmVxdWVzdHMuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpUmVxdWVzdEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc3RhdHVzOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKiBBIEdpdGh1YiBjbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUElzLiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkNsaWVudCB7XG4gIC8qKiBUaGUgb2N0b2tpdCBpbnN0YW5jZSBhY3R1YWxseSBwZXJmb3JtaW5nIEFQSSByZXF1ZXN0cy4gKi9cbiAgcHJpdmF0ZSBfb2N0b2tpdCA9IG5ldyBPY3Rva2l0KHRoaXMuX29jdG9raXRPcHRpb25zKTtcblxuICByZWFkb25seSBwdWxscyA9IHRoaXMuX29jdG9raXQucHVsbHM7XG4gIHJlYWRvbmx5IHJlcG9zID0gdGhpcy5fb2N0b2tpdC5yZXBvcztcbiAgcmVhZG9ubHkgaXNzdWVzID0gdGhpcy5fb2N0b2tpdC5pc3N1ZXM7XG4gIHJlYWRvbmx5IGdpdCA9IHRoaXMuX29jdG9raXQuZ2l0O1xuICByZWFkb25seSByYXRlTGltaXQgPSB0aGlzLl9vY3Rva2l0LnJhdGVMaW1pdDtcblxuICAvLyBOb3RlOiBUaGVzZSBhcmUgcHJvcGVydGllcyBmcm9tIGBPY3Rva2l0YCB0aGF0IGFyZSBicm91Z2h0IGluIGJ5IG9wdGlvbmFsIHBsdWdpbnMuXG4gIC8vIFR5cGVTY3JpcHQgcmVxdWlyZXMgdXMgdG8gcHJvdmlkZSBhbiBleHBsaWNpdCB0eXBlIGZvciB0aGVzZS5cbiAgcmVhZG9ubHkgcmVzdDogUmVzdEVuZHBvaW50TWV0aG9kcyA9IHRoaXMuX29jdG9raXQucmVzdDtcbiAgcmVhZG9ubHkgcGFnaW5hdGU6IFBhZ2luYXRlSW50ZXJmYWNlID0gdGhpcy5fb2N0b2tpdC5wYWdpbmF0ZTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9vY3Rva2l0T3B0aW9ucz86IE9jdG9raXRPcHRpb25zKSB7fVxufVxuXG4vKipcbiAqIEV4dGVuc2lvbiBvZiB0aGUgYEdpdGh1YkNsaWVudGAgdGhhdCBwcm92aWRlcyB1dGlsaXRpZXMgd2hpY2ggYXJlIHNwZWNpZmljXG4gKiB0byBhdXRoZW50aWNhdGVkIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEF1dGhlbnRpY2F0ZWRHaXRodWJDbGllbnQgZXh0ZW5kcyBHaXRodWJDbGllbnQge1xuICAvKiogVGhlIGdyYXBocWwgaW5zdGFuY2Ugd2l0aCBhdXRoZW50aWNhdGlvbiBzZXQgZHVyaW5nIGNvbnN0cnVjdGlvbi4gKi9cbiAgcHJpdmF0ZSBfZ3JhcGhxbCA9IGdyYXBocWwuZGVmYXVsdHMoe2hlYWRlcnM6IHthdXRob3JpemF0aW9uOiBgdG9rZW4gJHt0aGlzLl90b2tlbn1gfX0pO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3Rva2VuOiBzdHJpbmcpIHtcbiAgICAvLyBTZXQgdGhlIHRva2VuIGZvciB0aGUgb2N0b2tpdCBpbnN0YW5jZS5cbiAgICBzdXBlcih7YXV0aDogX3Rva2VufSk7XG4gIH1cblxuICAvKiogUGVyZm9ybSBhIHF1ZXJ5IHVzaW5nIEdpdGh1YidzIEdyYXBocWwgQVBJLiAqL1xuICBhc3luYyBncmFwaHFsPFQgZXh0ZW5kcyBHcmFwaHFsUXVlcnlPYmplY3Q+KHF1ZXJ5T2JqZWN0OiBULCBwYXJhbXM6IFJlcXVlc3RQYXJhbWV0ZXJzID0ge30pIHtcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuX2dyYXBocWwocXVlcnkocXVlcnlPYmplY3QpLnRvU3RyaW5nKCksIHBhcmFtcykpIGFzIFQ7XG4gIH1cbn1cbiJdfQ==