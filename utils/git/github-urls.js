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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXVybHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2dpdGh1Yi11cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDJCQUF3QjtJQUt4QiwwRUFBMEU7SUFDN0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyx3Q0FBd0MsQ0FBQztJQUVsRixvRUFBb0U7SUFDcEUsU0FBZ0IscUJBQXFCLENBQUMsY0FBc0IsRUFBRSxLQUFhO1FBQ3pFLElBQU0sR0FBRyxHQUFHLElBQUksU0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQztJQUNsQixDQUFDO0lBSkQsc0RBSUM7SUFFRCwrREFBK0Q7SUFDL0QsU0FBZ0IsbUJBQW1CLENBQUMsTUFBb0IsRUFBRSxXQUFvQjtRQUM1RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDakIsT0FBTyxvQkFBa0IsTUFBTSxDQUFDLEtBQUssU0FBSSxNQUFNLENBQUMsSUFBSSxTQUFNLENBQUM7U0FDNUQ7UUFDRCxJQUFNLFdBQVcsR0FBRyx3QkFBc0IsTUFBTSxDQUFDLEtBQUssU0FBSSxNQUFNLENBQUMsSUFBSSxTQUFNLENBQUM7UUFDNUUsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO1lBQzdCLE9BQU8scUJBQXFCLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsT0FBTyxXQUFXLENBQUM7SUFDckIsQ0FBQztJQVRELGtEQVNDO0lBRUQsMkZBQTJGO0lBQzNGLFNBQWdCLHlCQUF5QixDQUFDLEVBQXlCLEVBQUUsVUFBa0I7WUFBNUMsWUFBWSxrQkFBQTtRQUNyRCxPQUFPLHdCQUFzQixZQUFZLENBQUMsS0FBSyxTQUFJLFlBQVksQ0FBQyxJQUFJLGlCQUFZLFVBQVksQ0FBQztJQUMvRixDQUFDO0lBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuXG5pbXBvcnQge1VSTH0gZnJvbSAndXJsJztcblxuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9naXQtY2xpZW50JztcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgbWFuYWdlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fU0VUVElOR1NfVVJMID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnMnO1xuXG4vKiogVVJMIHRvIHRoZSBHaXRodWIgcGFnZSB3aGVyZSBwZXJzb25hbCBhY2Nlc3MgdG9rZW5zIGNhbiBiZSBnZW5lcmF0ZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX0dFTkVSQVRFX1VSTCA9ICdodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zL25ldyc7XG5cbi8qKiBBZGRzIHRoZSBwcm92aWRlZCB0b2tlbiB0byB0aGUgZ2l2ZW4gR2l0aHViIEhUVFBzIHJlbW90ZSB1cmwuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKGdpdGh1Ykh0dHBzVXJsOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpIHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTChnaXRodWJIdHRwc1VybCk7XG4gIHVybC51c2VybmFtZSA9IHRva2VuO1xuICByZXR1cm4gdXJsLmhyZWY7XG59XG5cbi8qKiBHZXRzIHRoZSByZXBvc2l0b3J5IEdpdCBVUkwgZm9yIHRoZSBnaXZlbiBnaXRodWIgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlcG9zaXRvcnlHaXRVcmwoY29uZmlnOiBHaXRodWJDb25maWcsIGdpdGh1YlRva2VuPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgaWYgKGNvbmZpZy51c2VTc2gpIHtcbiAgICByZXR1cm4gYGdpdEBnaXRodWIuY29tOiR7Y29uZmlnLm93bmVyfS8ke2NvbmZpZy5uYW1lfS5naXRgO1xuICB9XG4gIGNvbnN0IGJhc2VIdHRwVXJsID0gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke2NvbmZpZy5vd25lcn0vJHtjb25maWcubmFtZX0uZ2l0YDtcbiAgaWYgKGdpdGh1YlRva2VuICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKGJhc2VIdHRwVXJsLCBnaXRodWJUb2tlbik7XG4gIH1cbiAgcmV0dXJuIGJhc2VIdHRwVXJsO1xufVxuXG4vKiogR2V0cyBhIEdpdGh1YiBVUkwgdGhhdCByZWZlcnMgdG8gYSBsaXN0IG9mIHJlY2VudCBjb21taXRzIHdpdGhpbiBhIHNwZWNpZmllZCBicmFuY2guICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCh7cmVtb3RlUGFyYW1zfTogR2l0Q2xpZW50LCBicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBodHRwczovL2dpdGh1Yi5jb20vJHtyZW1vdGVQYXJhbXMub3duZXJ9LyR7cmVtb3RlUGFyYW1zLnJlcG99L2NvbW1pdHMvJHticmFuY2hOYW1lfWA7XG59XG4iXX0=