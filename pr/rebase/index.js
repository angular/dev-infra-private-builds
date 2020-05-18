/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/pr/rebase", ["require", "exports", "tslib", "typed-graphqlify", "url", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/utils/github", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var url_1 = require("url");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /* GraphQL schema for the response body for each pending PR. */
    var PR_SCHEMA = {
        state: typed_graphqlify_1.types.string,
        maintainerCanModify: typed_graphqlify_1.types.boolean,
        viewerDidAuthor: typed_graphqlify_1.types.boolean,
        headRef: {
            name: typed_graphqlify_1.types.string,
            repository: {
                url: typed_graphqlify_1.types.string,
                nameWithOwner: typed_graphqlify_1.types.string,
            },
        },
        baseRef: {
            name: typed_graphqlify_1.types.string,
            repository: {
                url: typed_graphqlify_1.types.string,
                nameWithOwner: typed_graphqlify_1.types.string,
            },
        },
    };
    /**
     * Rebase the provided PR onto its merge target branch, and push up the resulting
     * commit to the PRs repository.
     */
    function rebasePr(prNumber, githubToken, config) {
        if (config === void 0) { config = config_1.getConfig(); }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            /** Reset git back to the original branch. */
            function cleanUpGitState() {
                // Ensure that any outstanding rebases are aborted.
                shelljs_1.exec("git rebase --abort");
                // Ensure that any changes in the current repo state are cleared.
                shelljs_1.exec("git reset --hard");
                // Checkout the original branch from before the run began.
                shelljs_1.exec("git checkout " + originalBranch);
            }
            var originalBranch, pr, fullHeadRef, fullBaseRef, headRefUrl, baseRefUrl, rebaseResult, continueRebase, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // TODO: Rely on a common assertNoLocalChanges function.
                        if (git_1.hasLocalChanges()) {
                            console.error('Cannot perform rebase of PR with local changes.');
                            process.exit(1);
                        }
                        originalBranch = git_1.getCurrentBranch();
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, config.github)];
                    case 1:
                        pr = _b.sent();
                        fullHeadRef = pr.headRef.repository.nameWithOwner + ":" + pr.headRef.name;
                        fullBaseRef = pr.baseRef.repository.nameWithOwner + ":" + pr.baseRef.name;
                        headRefUrl = addAuthenticationToUrl(pr.headRef.repository.url, githubToken);
                        baseRefUrl = addAuthenticationToUrl(pr.baseRef.repository.url, githubToken);
                        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
                        // be pushed up.
                        if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
                            console.error("Cannot rebase as you did not author the PR and the PR does not allow maintainers" +
                                "to modify the PR");
                            process.exit(1);
                        }
                        try {
                            // Fetch the branch at the commit of the PR, and check it out in a detached state.
                            console.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                            shelljs_1.exec("git fetch " + headRefUrl + " " + pr.headRef.name);
                            shelljs_1.exec("git checkout --detach FETCH_HEAD");
                            // Fetch the PRs target branch and rebase onto it.
                            console.info("Fetching " + fullBaseRef + " to rebase #" + prNumber + " on");
                            shelljs_1.exec("git fetch " + baseRefUrl + " " + pr.baseRef.name);
                            console.info("Attempting to rebase PR #" + prNumber + " on " + fullBaseRef);
                            rebaseResult = shelljs_1.exec("git rebase FETCH_HEAD");
                            // If the rebase was clean, push the rebased PR up to the authors fork.
                            if (rebaseResult.code === 0) {
                                console.info("Rebase was able to complete automatically without conflicts");
                                console.info("Pushing rebased PR #" + prNumber + " to " + fullHeadRef);
                                shelljs_1.exec("git push " + baseRefUrl + " HEAD:" + pr.baseRef.name + " --force-with-lease");
                                console.info("Rebased and updated PR #" + prNumber);
                                cleanUpGitState();
                                process.exit(0);
                            }
                        }
                        catch (err) {
                            console.error(err.message);
                            cleanUpGitState();
                            process.exit(1);
                        }
                        // On automatic rebase failures, prompt to choose if the rebase should be continued
                        // manually or aborted now.
                        console.info("Rebase was unable to complete automatically without conflicts.");
                        _a = process.env['CI'] === undefined;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, console_1.promptConfirm('Manually complete rebase?')];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        continueRebase = _a;
                        if (continueRebase) {
                            console.info("After manually completing rebase, run the following command to update PR #" + prNumber + ":");
                            console.info(" $ git push " + pr.baseRef.repository.url + " HEAD:" + pr.baseRef.name + " --force-with-lease");
                            console.info();
                            console.info("To abort the rebase and return to the state of the repository before this command");
                            console.info("run the following command:");
                            console.info(" $ git rebase --abort && git reset --hard && git checkout " + originalBranch);
                            process.exit(1);
                        }
                        else {
                            console.info("Cleaning up git state, and restoring previous state.");
                        }
                        cleanUpGitState();
                        process.exit(1);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.rebasePr = rebasePr;
    /** Adds the provided token as username to the provided url. */
    function addAuthenticationToUrl(urlString, token) {
        var url = new url_1.URL(urlString);
        url.username = token;
        return url.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUdILHFEQUF1RDtJQUN2RCwyQkFBd0I7SUFFeEIsa0VBQTBEO0lBQzFELG9FQUFrRDtJQUNsRCw0REFBa0U7SUFDbEUsa0VBQXlDO0lBQ3pDLG9FQUF5QztJQUV6QywrREFBK0Q7SUFDL0QsSUFBTSxTQUFTLEdBQUc7UUFDaEIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMxQixtQkFBbUIsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDekMsZUFBZSxFQUFFLHdCQUFZLENBQUMsT0FBTztRQUNyQyxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUMxQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOztZQWlGMUYsNkNBQTZDO1lBQzdDLFNBQVMsZUFBZTtnQkFDdEIsbURBQW1EO2dCQUNuRCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDM0IsaUVBQWlFO2dCQUNqRSxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDekIsMERB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Q3JCLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQge3R5cGVzIGFzIGdyYXBoUUxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge1VSTH0gZnJvbSAndXJsJztcblxuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Z2V0Q3VycmVudEJyYW5jaCwgaGFzTG9jYWxDaGFuZ2VzfSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cbi8qIEdyYXBoUUwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgZWFjaCBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuLyoqXG4gKiBSZWJhc2UgdGhlIHByb3ZpZGVkIFBSIG9udG8gaXRzIG1lcmdlIHRhcmdldCBicmFuY2gsIGFuZCBwdXNoIHVwIHRoZSByZXN1bHRpbmdcbiAqIGNvbW1pdCB0byB0aGUgUFJzIHJlcG9zaXRvcnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWJhc2VQcihcbiAgICBwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nLCBjb25maWc6IFBpY2s8TmdEZXZDb25maWcsICdnaXRodWInPiA9IGdldENvbmZpZygpKSB7XG4gIC8vIFRPRE86IFJlbHkgb24gYSBjb21tb24gYXNzZXJ0Tm9Mb2NhbENoYW5nZXMgZnVuY3Rpb24uXG4gIGlmIChoYXNMb2NhbENoYW5nZXMoKSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Nhbm5vdCBwZXJmb3JtIHJlYmFzZSBvZiBQUiB3aXRoIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybXMgYW55IEdpdFxuICAgKiBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBvcmlnaW5hbEJyYW5jaCA9IGdldEN1cnJlbnRCcmFuY2goKTtcbiAgLyogR2V0IHRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBjb25maWcuZ2l0aHViKTtcblxuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke3ByLmhlYWRSZWYubmFtZX1gO1xuICBjb25zdCBmdWxsQmFzZVJlZiA9IGAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke3ByLmJhc2VSZWYubmFtZX1gO1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkQXV0aGVudGljYXRpb25Ub1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIGNvbnN0IGJhc2VSZWZVcmwgPSBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHByLmJhc2VSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYENhbm5vdCByZWJhc2UgYXMgeW91IGRpZCBub3QgYXV0aG9yIHRoZSBQUiBhbmQgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzYCArXG4gICAgICAgIGB0byBtb2RpZnkgdGhlIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgY29uc29sZS5pbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBleGVjKGBnaXQgZmV0Y2ggJHtoZWFkUmVmVXJsfSAke3ByLmhlYWRSZWYubmFtZX1gKTtcbiAgICBleGVjKGBnaXQgY2hlY2tvdXQgLS1kZXRhY2ggRkVUQ0hfSEVBRGApO1xuXG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBjb25zb2xlLmluZm8oYEZldGNoaW5nICR7ZnVsbEJhc2VSZWZ9IHRvIHJlYmFzZSAjJHtwck51bWJlcn0gb25gKTtcbiAgICBleGVjKGBnaXQgZmV0Y2ggJHtiYXNlUmVmVXJsfSAke3ByLmJhc2VSZWYubmFtZX1gKTtcbiAgICBjb25zb2xlLmluZm8oYEF0dGVtcHRpbmcgdG8gcmViYXNlIFBSICMke3ByTnVtYmVyfSBvbiAke2Z1bGxCYXNlUmVmfWApO1xuICAgIGNvbnN0IHJlYmFzZVJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LmNvZGUgPT09IDApIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgUmViYXNlIHdhcyBhYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHNgKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgUHVzaGluZyByZWJhc2VkIFBSICMke3ByTnVtYmVyfSB0byAke2Z1bGxIZWFkUmVmfWApO1xuICAgICAgZXhlYyhgZ2l0IHB1c2ggJHtiYXNlUmVmVXJsfSBIRUFEOiR7cHIuYmFzZVJlZi5uYW1lfSAtLWZvcmNlLXdpdGgtbGVhc2VgKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgUmViYXNlZCBhbmQgdXBkYXRlZCBQUiAjJHtwck51bWJlcn1gKTtcbiAgICAgIGNsZWFuVXBHaXRTdGF0ZSgpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihlcnIubWVzc2FnZSk7XG4gICAgY2xlYW5VcEdpdFN0YXRlKCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gT24gYXV0b21hdGljIHJlYmFzZSBmYWlsdXJlcywgcHJvbXB0IHRvIGNob29zZSBpZiB0aGUgcmViYXNlIHNob3VsZCBiZSBjb250aW51ZWRcbiAgLy8gbWFudWFsbHkgb3IgYWJvcnRlZCBub3cuXG4gIGNvbnNvbGUuaW5mbyhgUmViYXNlIHdhcyB1bmFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0cy5gKTtcbiAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgY29uc3QgY29udGludWVSZWJhc2UgPVxuICAgICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiBhd2FpdCBwcm9tcHRDb25maXJtKCdNYW51YWxseSBjb21wbGV0ZSByZWJhc2U/Jyk7XG5cbiAgaWYgKGNvbnRpbnVlUmViYXNlKSB7XG4gICAgY29uc29sZS5pbmZvKFxuICAgICAgICBgQWZ0ZXIgbWFudWFsbHkgY29tcGxldGluZyByZWJhc2UsIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gdXBkYXRlIFBSICMke3ByTnVtYmVyfTpgKTtcbiAgICBjb25zb2xlLmluZm8oXG4gICAgICAgIGAgJCBnaXQgcHVzaCAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS51cmx9IEhFQUQ6JHtwci5iYXNlUmVmLm5hbWV9IC0tZm9yY2Utd2l0aC1sZWFzZWApO1xuICAgIGNvbnNvbGUuaW5mbygpO1xuICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgYFRvIGFib3J0IHRoZSByZWJhc2UgYW5kIHJldHVybiB0byB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnkgYmVmb3JlIHRoaXMgY29tbWFuZGApO1xuICAgIGNvbnNvbGUuaW5mbyhgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICBjb25zb2xlLmluZm8oYCAkIGdpdCByZWJhc2UgLS1hYm9ydCAmJiBnaXQgcmVzZXQgLS1oYXJkICYmIGdpdCBjaGVja291dCAke29yaWdpbmFsQnJhbmNofWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmluZm8oYENsZWFuaW5nIHVwIGdpdCBzdGF0ZSwgYW5kIHJlc3RvcmluZyBwcmV2aW91cyBzdGF0ZS5gKTtcbiAgfVxuXG4gIGNsZWFuVXBHaXRTdGF0ZSgpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG5cbiAgLyoqIFJlc2V0IGdpdCBiYWNrIHRvIHRoZSBvcmlnaW5hbCBicmFuY2guICovXG4gIGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZSgpIHtcbiAgICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcbiAgICAvLyBFbnN1cmUgdGhhdCBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvIHN0YXRlIGFyZSBjbGVhcmVkLlxuICAgIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0ICR7b3JpZ2luYWxCcmFuY2h9YCk7XG4gIH1cbn1cblxuLyoqIEFkZHMgdGhlIHByb3ZpZGVkIHRva2VuIGFzIHVzZXJuYW1lIHRvIHRoZSBwcm92aWRlZCB1cmwuICovXG5mdW5jdGlvbiBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHVybFN0cmluZzogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSB7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJsU3RyaW5nKTtcbiAgdXJsLnVzZXJuYW1lID0gdG9rZW47XG4gIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbn1cbiJdfQ==