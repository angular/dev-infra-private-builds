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
    exports.GITHUB_TOKEN_SETTINGS_URL = "https://github.com/settings/tokens";
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens/new";
    /** Adds the provided token to the given Github HTTPs remote url. */
    function addTokenToGitHttpsUrl(githubHttpsUrl, token) {
        var url = new url_1.URL(githubHttpsUrl);
        url.username = token;
        return url.toString();
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
    /** Gets a Github URL that refers to a lists of recent commits within a specified branch. */
    function getListCommitsInBranchUrl(_a, branchName) {
        var remoteParams = _a.remoteParams;
        return "https://github.com/" + remoteParams.owner + "/" + remoteParams.repo + "/commits/" + branchName;
    }
    exports.getListCommitsInBranchUrl = getListCommitsInBranchUrl;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0aHViLXVybHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdXRpbHMvZ2l0L2dpdGh1Yi11cmxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILDJCQUF3QjtJQUl4QiwwRUFBMEU7SUFDN0QsUUFBQSx5QkFBeUIsR0FBRyxvQ0FBb0MsQ0FBQztJQUU5RSw0RUFBNEU7SUFDL0QsUUFBQSx5QkFBeUIsR0FBRyx3Q0FBd0MsQ0FBQztJQUVsRixvRUFBb0U7SUFDcEUsU0FBZ0IscUJBQXFCLENBQUMsY0FBc0IsRUFBRSxLQUFhO1FBQ3pFLElBQU0sR0FBRyxHQUFHLElBQUksU0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFKRCxzREFJQztJQUVELCtEQUErRDtJQUMvRCxTQUFnQixtQkFBbUIsQ0FBQyxNQUFvQixFQUFFLFdBQW9CO1FBQzVFLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtZQUNqQixPQUFPLG9CQUFrQixNQUFNLENBQUMsS0FBSyxTQUFJLE1BQU0sQ0FBQyxJQUFJLFNBQU0sQ0FBQztTQUM1RDtRQUNELElBQU0sV0FBVyxHQUFHLHdCQUFzQixNQUFNLENBQUMsS0FBSyxTQUFJLE1BQU0sQ0FBQyxJQUFJLFNBQU0sQ0FBQztRQUM1RSxJQUFJLFdBQVcsS0FBSyxTQUFTLEVBQUU7WUFDN0IsT0FBTyxxQkFBcUIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxPQUFPLFdBQVcsQ0FBQztJQUNyQixDQUFDO0lBVEQsa0RBU0M7SUFFRCw0RkFBNEY7SUFDNUYsU0FBZ0IseUJBQXlCLENBQUMsRUFBeUIsRUFBRSxVQUFrQjtZQUE1QyxZQUFZLGtCQUFBO1FBQ3JELE9BQU8sd0JBQXNCLFlBQVksQ0FBQyxLQUFLLFNBQUksWUFBWSxDQUFDLElBQUksaUJBQVksVUFBWSxDQUFDO0lBQy9GLENBQUM7SUFGRCw4REFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5cbmltcG9ydCB7VVJMfSBmcm9tICd1cmwnO1xuaW1wb3J0IHtHaXRodWJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIG1hbmFnZWQuICovXG5leHBvcnQgY29uc3QgR0lUSFVCX1RPS0VOX1NFVFRJTkdTX1VSTCA9IGBodHRwczovL2dpdGh1Yi5jb20vc2V0dGluZ3MvdG9rZW5zYDtcblxuLyoqIFVSTCB0byB0aGUgR2l0aHViIHBhZ2Ugd2hlcmUgcGVyc29uYWwgYWNjZXNzIHRva2VucyBjYW4gYmUgZ2VuZXJhdGVkLiAqL1xuZXhwb3J0IGNvbnN0IEdJVEhVQl9UT0tFTl9HRU5FUkFURV9VUkwgPSBgaHR0cHM6Ly9naXRodWIuY29tL3NldHRpbmdzL3Rva2Vucy9uZXdgO1xuXG4vKiogQWRkcyB0aGUgcHJvdmlkZWQgdG9rZW4gdG8gdGhlIGdpdmVuIEdpdGh1YiBIVFRQcyByZW1vdGUgdXJsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZFRva2VuVG9HaXRIdHRwc1VybChnaXRodWJIdHRwc1VybDogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSB7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwoZ2l0aHViSHR0cHNVcmwpO1xuICB1cmwudXNlcm5hbWUgPSB0b2tlbjtcbiAgcmV0dXJuIHVybC50b1N0cmluZygpO1xufVxuXG4vKiogR2V0cyB0aGUgcmVwb3NpdG9yeSBHaXQgVVJMIGZvciB0aGUgZ2l2ZW4gZ2l0aHViIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZXBvc2l0b3J5R2l0VXJsKGNvbmZpZzogR2l0aHViQ29uZmlnLCBnaXRodWJUb2tlbj86IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChjb25maWcudXNlU3NoKSB7XG4gICAgcmV0dXJuIGBnaXRAZ2l0aHViLmNvbToke2NvbmZpZy5vd25lcn0vJHtjb25maWcubmFtZX0uZ2l0YDtcbiAgfVxuICBjb25zdCBiYXNlSHR0cFVybCA9IGBodHRwczovL2dpdGh1Yi5jb20vJHtjb25maWcub3duZXJ9LyR7Y29uZmlnLm5hbWV9LmdpdGA7XG4gIGlmIChnaXRodWJUb2tlbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGFkZFRva2VuVG9HaXRIdHRwc1VybChiYXNlSHR0cFVybCwgZ2l0aHViVG9rZW4pO1xuICB9XG4gIHJldHVybiBiYXNlSHR0cFVybDtcbn1cblxuLyoqIEdldHMgYSBHaXRodWIgVVJMIHRoYXQgcmVmZXJzIHRvIGEgbGlzdHMgb2YgcmVjZW50IGNvbW1pdHMgd2l0aGluIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHtyZW1vdGVQYXJhbXN9OiBHaXRDbGllbnQsIGJyYW5jaE5hbWU6IHN0cmluZykge1xuICByZXR1cm4gYGh0dHBzOi8vZ2l0aHViLmNvbS8ke3JlbW90ZVBhcmFtcy5vd25lcn0vJHtyZW1vdGVQYXJhbXMucmVwb30vY29tbWl0cy8ke2JyYW5jaE5hbWV9YDtcbn1cbiJdfQ==