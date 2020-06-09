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
        define("@angular/dev-infra-private/pr/rebase", ["require", "exports", "tslib", "typed-graphqlify", "url", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rebasePr = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var url_1 = require("url");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    /* GraphQL schema for the response body for each pending PR. */
    var PR_SCHEMA = {
        state: typed_graphqlify_1.types.string,
        maintainerCanModify: typed_graphqlify_1.types.boolean,
        viewerDidAuthor: typed_graphqlify_1.types.boolean,
        headRefOid: typed_graphqlify_1.types.string,
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
                git.runGraceful(['rebase', '--abort'], { stdio: 'ignore' });
                // Ensure that any changes in the current repo state are cleared.
                git.runGraceful(['reset', '--hard'], { stdio: 'ignore' });
                // Checkout the original branch from before the run began.
                git.runGraceful(['checkout', originalBranch], { stdio: 'ignore' });
            }
            var git, originalBranch, pr, headRefName, baseRefName, fullHeadRef, fullBaseRef, headRefUrl, baseRefUrl, forceWithLeaseFlag, rebaseResult, continueRebase, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        git = new git_1.GitClient(githubToken);
                        // TODO: Rely on a common assertNoLocalChanges function.
                        if (git.hasLocalChanges()) {
                            console_1.error('Cannot perform rebase of PR with local changes.');
                            process.exit(1);
                        }
                        originalBranch = git.getCurrentBranch();
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, config.github)];
                    case 1:
                        pr = _b.sent();
                        headRefName = pr.headRef.name;
                        baseRefName = pr.baseRef.name;
                        fullHeadRef = pr.headRef.repository.nameWithOwner + ":" + headRefName;
                        fullBaseRef = pr.baseRef.repository.nameWithOwner + ":" + baseRefName;
                        headRefUrl = addAuthenticationToUrl(pr.headRef.repository.url, githubToken);
                        baseRefUrl = addAuthenticationToUrl(pr.baseRef.repository.url, githubToken);
                        forceWithLeaseFlag = "--force-with-lease=" + headRefName + ":" + pr.headRefOid;
                        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
                        // be pushed up.
                        if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
                            console_1.error("Cannot rebase as you did not author the PR and the PR does not allow maintainers" +
                                "to modify the PR");
                            process.exit(1);
                        }
                        try {
                            // Fetch the branch at the commit of the PR, and check it out in a detached state.
                            console_1.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                            git.run(['fetch', headRefUrl, headRefName]);
                            git.run(['checkout', '--detach', 'FETCH_HEAD']);
                            // Fetch the PRs target branch and rebase onto it.
                            console_1.info("Fetching " + fullBaseRef + " to rebase #" + prNumber + " on");
                            git.run(['fetch', baseRefUrl, baseRefName]);
                            console_1.info("Attempting to rebase PR #" + prNumber + " on " + fullBaseRef);
                            rebaseResult = git.runGraceful(['rebase', 'FETCH_HEAD']);
                            // If the rebase was clean, push the rebased PR up to the authors fork.
                            if (rebaseResult.status === 0) {
                                console_1.info("Rebase was able to complete automatically without conflicts");
                                console_1.info("Pushing rebased PR #" + prNumber + " to " + fullHeadRef);
                                git.run(['push', headRefUrl, "HEAD:" + headRefName, forceWithLeaseFlag]);
                                console_1.info("Rebased and updated PR #" + prNumber);
                                cleanUpGitState();
                                process.exit(0);
                            }
                        }
                        catch (err) {
                            console_1.error(err.message);
                            cleanUpGitState();
                            process.exit(1);
                        }
                        // On automatic rebase failures, prompt to choose if the rebase should be continued
                        // manually or aborted now.
                        console_1.info("Rebase was unable to complete automatically without conflicts.");
                        _a = process.env['CI'] === undefined;
                        if (!_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, console_1.promptConfirm('Manually complete rebase?')];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        continueRebase = _a;
                        if (continueRebase) {
                            console_1.info("After manually completing rebase, run the following command to update PR #" + prNumber + ":");
                            console_1.info(" $ git push " + pr.headRef.repository.url + " HEAD:" + headRefName + " " + forceWithLeaseFlag);
                            console_1.info();
                            console_1.info("To abort the rebase and return to the state of the repository before this command");
                            console_1.info("run the following command:");
                            console_1.info(" $ git rebase --abort && git reset --hard && git checkout " + originalBranch);
                            process.exit(1);
                        }
                        else {
                            console_1.info("Cleaning up git state, and restoring previous state.");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFDdkQsMkJBQXdCO0lBRXhCLGtFQUEwRDtJQUMxRCxvRUFBK0Q7SUFDL0QsNERBQTBDO0lBQzFDLGtFQUF5QztJQUV6QywrREFBK0Q7SUFDL0QsSUFBTSxTQUFTLEdBQUc7UUFDaEIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMxQixtQkFBbUIsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDekMsZUFBZSxFQUFFLHdCQUFZLENBQUMsT0FBTztRQUNyQyxVQUFVLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQy9CLE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtRQUNELE9BQU8sRUFBRTtZQUNQLElBQUksRUFBRSx3QkFBWSxDQUFDLE1BQU07WUFDekIsVUFBVSxFQUFFO2dCQUNWLEdBQUcsRUFBRSx3QkFBWSxDQUFDLE1BQU07Z0JBQ3hCLGFBQWEsRUFBRSx3QkFBWSxDQUFDLE1BQU07YUFDbkM7U0FDRjtLQUNGLENBQUM7SUFFRjs7O09BR0c7SUFDSCxTQUFzQixRQUFRLENBQzFCLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxNQUFpRDtRQUFqRCx1QkFBQSxFQUFBLFNBQXNDLGtCQUFTLEVBQUU7O1lBeUYxRiw2Q0FBNkM7WUFDN0MsU0FBUyxlQUFlO2dCQUN0QixtREFBbUQ7Z0JBQ25ELEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBQyxLQUFLLEVBQUUs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QUFNOzRCQUNMLGNBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO3lCQUM5RDt3QkFFRCxlQUFlLEVBQUUsQ0FBQzt3QkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FXakI7SUFuR0QsNEJBbUdDO0lBRUQsK0RBQStEO0lBQy9ELFNBQVMsc0JBQXNCLENBQUMsU0FBaUIsRUFBRSxLQUFhO1FBQzlELElBQU0sR0FBRyxHQUFHLElBQUksU0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQy9CLEdBQUcsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtVUkx9IGZyb20gJ3VybCc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuKTtcbiAgLy8gVE9ETzogUmVseSBvbiBhIGNvbW1vbiBhc3NlcnROb0xvY2FsQ2hhbmdlcyBmdW5jdGlvbi5cbiAgaWYgKGdpdC5oYXNMb2NhbENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcGVyZm9ybSByZWJhc2Ugb2YgUFIgd2l0aCBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1zIGFueSBHaXRcbiAgICogb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3Qgb3JpZ2luYWxCcmFuY2ggPSBnaXQuZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAvKiBHZXQgdGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGNvbmZpZy5naXRodWIpO1xuXG4gIGNvbnN0IGhlYWRSZWZOYW1lID0gcHIuaGVhZFJlZi5uYW1lO1xuICBjb25zdCBiYXNlUmVmTmFtZSA9IHByLmJhc2VSZWYubmFtZTtcbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICBjb25zdCBmdWxsQmFzZVJlZiA9IGAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2Jhc2VSZWZOYW1lfWA7XG4gIGNvbnN0IGhlYWRSZWZVcmwgPSBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgY29uc3QgYmFzZVJlZlVybCA9IGFkZEF1dGhlbnRpY2F0aW9uVG9VcmwocHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvcikge1xuICAgIGVycm9yKFxuICAgICAgICBgQ2Fubm90IHJlYmFzZSBhcyB5b3UgZGlkIG5vdCBhdXRob3IgdGhlIFBSIGFuZCB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnNgICtcbiAgICAgICAgYHRvIG1vZGlmeSB0aGUgUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuXG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBpbmZvKGBGZXRjaGluZyAke2Z1bGxCYXNlUmVmfSB0byByZWJhc2UgIyR7cHJOdW1iZXJ9IG9uYCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgYmFzZVJlZlVybCwgYmFzZVJlZk5hbWVdKTtcbiAgICBpbmZvKGBBdHRlbXB0aW5nIHRvIHJlYmFzZSBQUiAjJHtwck51bWJlcn0gb24gJHtmdWxsQmFzZVJlZn1gKTtcbiAgICBjb25zdCByZWJhc2VSZXN1bHQgPSBnaXQucnVuR3JhY2VmdWwoWydyZWJhc2UnLCAnRkVUQ0hfSEVBRCddKTtcblxuICAgIC8vIElmIHRoZSByZWJhc2Ugd2FzIGNsZWFuLCBwdXNoIHRoZSByZWJhc2VkIFBSIHVwIHRvIHRoZSBhdXRob3JzIGZvcmsuXG4gICAgaWYgKHJlYmFzZVJlc3VsdC5zdGF0dXMgPT09IDApIHtcbiAgICAgIGluZm8oYFJlYmFzZSB3YXMgYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzYCk7XG4gICAgICBpbmZvKGBQdXNoaW5nIHJlYmFzZWQgUFIgIyR7cHJOdW1iZXJ9IHRvICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICBpbmZvKGBSZWJhc2VkIGFuZCB1cGRhdGVkIFBSICMke3ByTnVtYmVyfWApO1xuICAgICAgY2xlYW5VcEdpdFN0YXRlKCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBlcnJvcihlcnIubWVzc2FnZSk7XG4gICAgY2xlYW5VcEdpdFN0YXRlKCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gT24gYXV0b21hdGljIHJlYmFzZSBmYWlsdXJlcywgcHJvbXB0IHRvIGNob29zZSBpZiB0aGUgcmViYXNlIHNob3VsZCBiZSBjb250aW51ZWRcbiAgLy8gbWFudWFsbHkgb3IgYWJvcnRlZCBub3cuXG4gIGluZm8oYFJlYmFzZSB3YXMgdW5hYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHMuYCk7XG4gIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gIGNvbnN0IGNvbnRpbnVlUmViYXNlID1cbiAgICAgIHByb2Nlc3MuZW52WydDSSddID09PSB1bmRlZmluZWQgJiYgYXdhaXQgcHJvbXB0Q29uZmlybSgnTWFudWFsbHkgY29tcGxldGUgcmViYXNlPycpO1xuXG4gIGlmIChjb250aW51ZVJlYmFzZSkge1xuICAgIGluZm8oYEFmdGVyIG1hbnVhbGx5IGNvbXBsZXRpbmcgcmViYXNlLCBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHVwZGF0ZSBQUiAjJHtwck51bWJlcn06YCk7XG4gICAgaW5mbyhgICQgZ2l0IHB1c2ggJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSBIRUFEOiR7aGVhZFJlZk5hbWV9ICR7Zm9yY2VXaXRoTGVhc2VGbGFnfWApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBUbyBhYm9ydCB0aGUgcmViYXNlIGFuZCByZXR1cm4gdG8gdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5IGJlZm9yZSB0aGlzIGNvbW1hbmRgKTtcbiAgICBpbmZvKGBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgIGluZm8oYCAkIGdpdCByZWJhc2UgLS1hYm9ydCAmJiBnaXQgcmVzZXQgLS1oYXJkICYmIGdpdCBjaGVja291dCAke29yaWdpbmFsQnJhbmNofWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBDbGVhbmluZyB1cCBnaXQgc3RhdGUsIGFuZCByZXN0b3JpbmcgcHJldmlvdXMgc3RhdGUuYCk7XG4gIH1cblxuICBjbGVhblVwR2l0U3RhdGUoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xuXG4gIC8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgb3JpZ2luYWwgYnJhbmNoLiAqL1xuICBmdW5jdGlvbiBjbGVhblVwR2l0U3RhdGUoKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMgYXJlIGFib3J0ZWQuXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgJy0tYWJvcnQnXSwge3N0ZGlvOiAnaWdub3JlJ30pO1xuICAgIC8vIEVuc3VyZSB0aGF0IGFueSBjaGFuZ2VzIGluIHRoZSBjdXJyZW50IHJlcG8gc3RhdGUgYXJlIGNsZWFyZWQuXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsncmVzZXQnLCAnLS1oYXJkJ10sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gICAgZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlY2tvdXQnLCBvcmlnaW5hbEJyYW5jaF0sIHtzdGRpbzogJ2lnbm9yZSd9KTtcbiAgfVxufVxuXG4vKiogQWRkcyB0aGUgcHJvdmlkZWQgdG9rZW4gYXMgdXNlcm5hbWUgdG8gdGhlIHByb3ZpZGVkIHVybC4gKi9cbmZ1bmN0aW9uIGFkZEF1dGhlbnRpY2F0aW9uVG9VcmwodXJsU3RyaW5nOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcpIHtcbiAgY29uc3QgdXJsID0gbmV3IFVSTCh1cmxTdHJpbmcpO1xuICB1cmwudXNlcm5hbWUgPSB0b2tlbjtcbiAgcmV0dXJuIHVybC50b1N0cmluZygpO1xufVxuIl19