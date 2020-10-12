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
        define("@angular/dev-infra-private/utils/git/github-urls", ["require", "exports", "url"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getListCommitsInBranchUrl = exports.getRepositoryGitUrl = exports.addTokenToGitHttpsUrl = exports.GITHUB_TOKEN_GENERATE_URL = exports.GITHUB_TOKEN_SETTINGS_URL = void 0;
    var url_1 = require("url");
    /** URL to the Github page where personal access tokens can be managed. */
    exports.GITHUB_TOKEN_SETTINGS_URL = 'https://github.com/settings/tokens';
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = 'https://github.com/settings/tokens/new';
    /** Adds the provided token to the given Github HTTPs remote url. */
    function addTokenToGitHttpsUrl(githubHttpsUrl, token) {
        var url = new url_1.URL(githubHttpsUrl);
        url.username = token;
        return url.href;
    }
    exports.addTokenToGitHttpsUrl = addTokenToGitHttpsUrl;
    /** Gets the repository Git URL for the given github config. */
    function getRepositoryGitUrl(config, githubToken) {
        if (config.useSsh) {
            return "git@github.com:" + config.owner + "/" + config.name + ".git";
        }
        var baseHttpUrl = "https://github.com/" + config.owner + "/" + config.name + ".git";
        if (githubToken !== undefined) {
            return addTokenToGitHttpsUrl(baseHttpUrl, githubToken);
        }
        return baseHttpUrl;
    }
    exports.getRepositoryGitUrl = getRepositoryGitUrl;
    /** Gets a Github URL that refers to a list of recent commits within a specified branch. */
    function getListCommitsInBranchUrl(_a, branchName) {
        var remoteParams = _a.remoteParams;
        return "https://github.com/" + remoteParams.owner + "/" + remoteParams.repo + "/commits/" + branchName;
    }
    exports.getListCommitsInBranchUrl = getListCommitsInBranchUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXVybHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2dpdGh1Yi11cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDJCQUF3QjtJQUl4QiwwRUFBMEU7SUFDN0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyx3Q0FBd0MsQ0FBQztJQUVsRixvRUFBb0U7SUFDcEUsU0FBZ0IscUJBQXFCLENBQUMsY0FBc0IsRUFBRSxLQUFhO1FBQ3pFLElBQU0sR0FBRyxHQUFHLElBQUksU0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztJQUNsQixDQUFDO0lBSkQsc0RBSUM7SUFFRCwrREFBK0Q7SUFDL0QsU0FBZ0IsbUJBQW1CLENBQUMsTUFBb0IsRUFBRSxXQUFvQjtRQUM1RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTyxvQkFBa0IsTUFBTSxDQUFDLEtBQUssU0FBSSxNQUFNLENBQUMsSUFBSSxTQUFNLENBQUM7U0FDNUQ7UUFDRCxJQUFNLFdBQVcsR0FBRyx3QkFBc0IsTUFBTSxDQUFDLEtBQUssU0FBSSxNQUFNLENBQUMsSUFBSSxTQUFNLENBQUM7UUFDNUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLE9BQU8scUJBQXFCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQVRELGtEQVNDO0lBRUQsMkZBQTJGO0lBQzNGLFNBQWdCLHlCQUF5QixDQUFDLEVBQXlCLEVBQUUsVUFBa0I7WUFBNUMsWUFBWSxrQkFBQTtRQUNyRCxPQUFPLHdCQUFzQixZQUFZLENBQUMsS0FBSyxTQUFJLFlBQVksQ0FBQyxJQUFJLGlCQUFZLFVBQVksQ0FBQztJQUMvRixDQUFDO0lBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge1VSTH0gZnJvbSAndXJsJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBtYW5hZ2VkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9TRVRUSU5HU19VUkwgPSAnaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vucyc7XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIGdlbmVyYXRlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnMvbmV3JztcblxuLyoqIEFkZHMgdGhlIHByb3ZpZGVkIHRva2VuIHRvIHRoZSBnaXZlbiBHaXRodWIgSFRUUHMgcmVtb3RlIHVybC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGRUb2tlblRvR2l0SHR0cHNVcmwoZ2l0aHViSHR0cHNVcmw6IHN0cmluZywgdG9rZW46IHN0cmluZykge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKGdpdGh1Ykh0dHBzVXJsKTtcbiAgdXJsLnVzZXJuYW1lID0gdG9rZW47XG4gIHJldHVybiB1cmwuaHJlZjtcbn1cblxuLyoqIEdldHMgdGhlIHJlcG9zaXRvcnkgR2l0IFVSTCBmb3IgdGhlIGdpdmVuIGdpdGh1YiBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb3NpdG9yeUdpdFVybChjb25maWc6IEdpdGh1YkNvbmZpZywgZ2l0aHViVG9rZW4/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoY29uZmlnLnVzZVNzaCkge1xuICAgIHJldHVybiBgZ2l0QGdpdGh1Yi5jb206JHtjb25maWcub3duZXJ9LyR7Y29uZmlnLm5hbWV9LmdpdGA7XG4gIH1cbiAgY29uc3QgYmFzZUh0dHBVcmwgPSBgaHR0cHM6Ly9naXRodWIuY29tLyR7Y29uZmlnLm93bmVyfS8ke2NvbmZpZy5uYW1lfS5naXRgO1xuICBpZiAoZ2l0aHViVG9rZW4gIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBhZGRUb2tlblRvR2l0SHR0cHNVcmwoYmFzZUh0dHBVcmwsIGdpdGh1YlRva2VuKTtcbiAgfVxuICByZXR1cm4gYmFzZUh0dHBVcmw7XG59XG5cbi8qKiBHZXRzIGEgR2l0aHViIFVSTCB0aGF0IHJlZmVycyB0byBhIGxpc3Qgb2YgcmVjZW50IGNvbW1pdHMgd2l0aGluIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHtyZW1vdGVQYXJhbXN9OiBHaXRDbGllbnQsIGJyYW5jaE5hbWU6IHN0cmluZykge1xuICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3JlbW90ZVBhcmFtcy5vd25lcn0vJHtyZW1vdGVQYXJhbXMucmVwb30vY29tbWl0cy8ke2JyYW5jaE5hbWV9YDtcbn1cbiJdfQ==