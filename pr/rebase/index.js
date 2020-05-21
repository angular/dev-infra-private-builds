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
                            console_1.error('Cannot perform rebase of PR with local changes.');
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
                            console_1.error("Cannot rebase as you did not author the PR and the PR does not allow maintainers" +
                                "to modify the PR");
                            process.exit(1);
                        }
                        try {
                            // Fetch the branch at the commit of the PR, and check it out in a detached state.
                            console_1.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                            shelljs_1.exec("git fetch " + headRefUrl + " " + pr.headRef.name);
                            shelljs_1.exec("git checkout --detach FETCH_HEAD");
                            // Fetch the PRs target branch and rebase onto it.
                            console_1.info("Fetching " + fullBaseRef + " to rebase #" + prNumber + " on");
                            shelljs_1.exec("git fetch " + baseRefUrl + " " + pr.baseRef.name);
                            console_1.info("Attempting to rebase PR #" + prNumber + " on " + fullBaseRef);
                            rebaseResult = shelljs_1.exec("git rebase FETCH_HEAD");
                            // If the rebase was clean, push the rebased PR up to the authors fork.
                            if (rebaseResult.code === 0) {
                                console_1.info("Rebase was able to complete automatically without conflicts");
                                console_1.info("Pushing rebased PR #" + prNumber + " to " + fullHeadRef);
                                shelljs_1.exec("git push " + baseRefUrl + " HEAD:" + pr.baseRef.name + " --force-with-lease");
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
                            console_1.info(" $ git push " + pr.baseRef.repository.url + " HEAD:" + pr.baseRef.name + " --force-with-lease");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHFEQUF1RDtJQUN2RCwyQkFBd0I7SUFFeEIsa0VBQTBEO0lBQzFELG9FQUErRDtJQUMvRCw0REFBa0U7SUFDbEUsa0VBQXlDO0lBQ3pDLG9FQUF5QztJQUV6QywrREFBK0Q7SUFDL0QsSUFBTSxTQUFTLEdBQUc7UUFDaEIsS0FBSyxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMxQixtQkFBbUIsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDekMsZUFBZSxFQUFFLHdCQUFZLENBQUMsT0FBTztRQUNyQyxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUMxQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOztZQThFMUYsNkNBQTZDO1lBQzdDLFNBQVMsZUFBZTtnQkFDdEIsbURBQW1EO2dCQUNuRCxjQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztnQkFDM0IsaUVBQWlFO2dCQUNqRSxjQUFJLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDekIsMERB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LENBQUMsS0FBSyxTQUFTLENBQUE7aUNBQS9CLHdCQUErQjt3QkFBSSxxQkFBTSx1QkFBYSxDQUFDLDJCQUEyQixDQUFDLEVBQUE7OzhCQUFoRCxTQUFnRDs7O3dCQURqRixjQUFjLEtBQ21FO3dCQUV2RixJQUFJLGNBQWMsRUFBRTs0QkFDbEIsY0FBSSxDQUFDLCtFQUE2RSxRQUFRLE1BQUcsQ0FBQyxDQUFDOzRCQUMvRixjQUFJLENBQUMsaUJBQWUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxjQUFTLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSx3QkFBcUIsQ0FBQyxDQUFDOzRCQUM1RixjQUFJLEVBQUUsQ0FBQzs0QkFDUCxjQUFJLENBQUMsbUZBQW1GLENBQUMsQ0FBQzs0QkFDMUYsY0FBSSxDQUFDLDRCQUE0QixDQUFDLENBQUM7NEJBQ25DLGNBQUksQ0FBQywrREFBNkQsY0FBZ0IsQ0FBQyxDQUFDOzRCQUNwRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs2QkFBTTs0QkFDTCxjQUFJLENBQUMsc0RBQXNELENBQUMsQ0FBQzt5QkFDOUQ7d0JBRUQsZUFBZSxFQUFFLENBQUM7d0JBQ2xCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBV2pCO0lBeEZELDRCQXdGQztJQUVELCtEQUErRDtJQUMvRCxTQUFTLHNCQUFzQixDQUFDLFNBQWlCLEVBQUUsS0FBYTtRQUM5RCxJQUFNLEdBQUcsR0FBRyxJQUFJLFNBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQixHQUFHLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUNyQixPQUFPLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGVzIGFzIGdyYXBoUUxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge1VSTH0gZnJvbSAndXJsJztcblxuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2dldEN1cnJlbnRCcmFuY2gsIGhhc0xvY2FsQ2hhbmdlc30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvLyBUT0RPOiBSZWx5IG9uIGEgY29tbW9uIGFzc2VydE5vTG9jYWxDaGFuZ2VzIGZ1bmN0aW9uLlxuICBpZiAoaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICBlcnJvcignQ2Fubm90IHBlcmZvcm0gcmViYXNlIG9mIFBSIHdpdGggbG9jYWwgY2hhbmdlcy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtcyBhbnkgR2l0XG4gICAqIG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IG9yaWdpbmFsQnJhbmNoID0gZ2V0Q3VycmVudEJyYW5jaCgpO1xuICAvKiBHZXQgdGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGNvbmZpZy5naXRodWIpO1xuXG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7cHIuaGVhZFJlZi5uYW1lfWA7XG4gIGNvbnN0IGZ1bGxCYXNlUmVmID0gYCR7cHIuYmFzZVJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7cHIuYmFzZVJlZi5uYW1lfWA7XG4gIGNvbnN0IGhlYWRSZWZVcmwgPSBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgY29uc3QgYmFzZVJlZlVybCA9IGFkZEF1dGhlbnRpY2F0aW9uVG9VcmwocHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIElmIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgaXQsIGV4aXQgYXMgdGhlIHJlYmFzZWQgUFIgY2Fubm90XG4gIC8vIGJlIHB1c2hlZCB1cC5cbiAgaWYgKCFwci5tYWludGFpbmVyQ2FuTW9kaWZ5ICYmICFwci52aWV3ZXJEaWRBdXRob3IpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYENhbm5vdCByZWJhc2UgYXMgeW91IGRpZCBub3QgYXV0aG9yIHRoZSBQUiBhbmQgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzYCArXG4gICAgICAgIGB0byBtb2RpZnkgdGhlIFBSYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZXhlYyhgZ2l0IGZldGNoICR7aGVhZFJlZlVybH0gJHtwci5oZWFkUmVmLm5hbWV9YCk7XG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0IC0tZGV0YWNoIEZFVENIX0hFQURgKTtcblxuICAgIC8vIEZldGNoIHRoZSBQUnMgdGFyZ2V0IGJyYW5jaCBhbmQgcmViYXNlIG9udG8gaXQuXG4gICAgaW5mbyhgRmV0Y2hpbmcgJHtmdWxsQmFzZVJlZn0gdG8gcmViYXNlICMke3ByTnVtYmVyfSBvbmApO1xuICAgIGV4ZWMoYGdpdCBmZXRjaCAke2Jhc2VSZWZVcmx9ICR7cHIuYmFzZVJlZi5uYW1lfWApO1xuICAgIGluZm8oYEF0dGVtcHRpbmcgdG8gcmViYXNlIFBSICMke3ByTnVtYmVyfSBvbiAke2Z1bGxCYXNlUmVmfWApO1xuICAgIGNvbnN0IHJlYmFzZVJlc3VsdCA9IGV4ZWMoYGdpdCByZWJhc2UgRkVUQ0hfSEVBRGApO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LmNvZGUgPT09IDApIHtcbiAgICAgIGluZm8oYFJlYmFzZSB3YXMgYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzYCk7XG4gICAgICBpbmZvKGBQdXNoaW5nIHJlYmFzZWQgUFIgIyR7cHJOdW1iZXJ9IHRvICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgICBleGVjKGBnaXQgcHVzaCAke2Jhc2VSZWZVcmx9IEhFQUQ6JHtwci5iYXNlUmVmLm5hbWV9IC0tZm9yY2Utd2l0aC1sZWFzZWApO1xuICAgICAgaW5mbyhgUmViYXNlZCBhbmQgdXBkYXRlZCBQUiAjJHtwck51bWJlcn1gKTtcbiAgICAgIGNsZWFuVXBHaXRTdGF0ZSgpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgIGNsZWFuVXBHaXRTdGF0ZSgpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIE9uIGF1dG9tYXRpYyByZWJhc2UgZmFpbHVyZXMsIHByb21wdCB0byBjaG9vc2UgaWYgdGhlIHJlYmFzZSBzaG91bGQgYmUgY29udGludWVkXG4gIC8vIG1hbnVhbGx5IG9yIGFib3J0ZWQgbm93LlxuICBpbmZvKGBSZWJhc2Ugd2FzIHVuYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzLmApO1xuICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICBjb25zdCBjb250aW51ZVJlYmFzZSA9XG4gICAgICBwcm9jZXNzLmVudlsnQ0knXSA9PT0gdW5kZWZpbmVkICYmIGF3YWl0IHByb21wdENvbmZpcm0oJ01hbnVhbGx5IGNvbXBsZXRlIHJlYmFzZT8nKTtcblxuICBpZiAoY29udGludWVSZWJhc2UpIHtcbiAgICBpbmZvKGBBZnRlciBtYW51YWxseSBjb21wbGV0aW5nIHJlYmFzZSwgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byB1cGRhdGUgUFIgIyR7cHJOdW1iZXJ9OmApO1xuICAgIGluZm8oYCAkIGdpdCBwdXNoICR7cHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybH0gSEVBRDoke3ByLmJhc2VSZWYubmFtZX0gLS1mb3JjZS13aXRoLWxlYXNlYCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFRvIGFib3J0IHRoZSByZWJhc2UgYW5kIHJldHVybiB0byB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnkgYmVmb3JlIHRoaXMgY29tbWFuZGApO1xuICAgIGluZm8oYHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgaW5mbyhgICQgZ2l0IHJlYmFzZSAtLWFib3J0ICYmIGdpdCByZXNldCAtLWhhcmQgJiYgZ2l0IGNoZWNrb3V0ICR7b3JpZ2luYWxCcmFuY2h9YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oYENsZWFuaW5nIHVwIGdpdCBzdGF0ZSwgYW5kIHJlc3RvcmluZyBwcmV2aW91cyBzdGF0ZS5gKTtcbiAgfVxuXG4gIGNsZWFuVXBHaXRTdGF0ZSgpO1xuICBwcm9jZXNzLmV4aXQoMSk7XG5cbiAgLyoqIFJlc2V0IGdpdCBiYWNrIHRvIHRoZSBvcmlnaW5hbCBicmFuY2guICovXG4gIGZ1bmN0aW9uIGNsZWFuVXBHaXRTdGF0ZSgpIHtcbiAgICAvLyBFbnN1cmUgdGhhdCBhbnkgb3V0c3RhbmRpbmcgcmViYXNlcyBhcmUgYWJvcnRlZC5cbiAgICBleGVjKGBnaXQgcmViYXNlIC0tYWJvcnRgKTtcbiAgICAvLyBFbnN1cmUgdGhhdCBhbnkgY2hhbmdlcyBpbiB0aGUgY3VycmVudCByZXBvIHN0YXRlIGFyZSBjbGVhcmVkLlxuICAgIGV4ZWMoYGdpdCByZXNldCAtLWhhcmRgKTtcbiAgICAvLyBDaGVja291dCB0aGUgb3JpZ2luYWwgYnJhbmNoIGZyb20gYmVmb3JlIHRoZSBydW4gYmVnYW4uXG4gICAgZXhlYyhgZ2l0IGNoZWNrb3V0ICR7b3JpZ2luYWxCcmFuY2h9YCk7XG4gIH1cbn1cblxuLyoqIEFkZHMgdGhlIHByb3ZpZGVkIHRva2VuIGFzIHVzZXJuYW1lIHRvIHRoZSBwcm92aWRlZCB1cmwuICovXG5mdW5jdGlvbiBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHVybFN0cmluZzogc3RyaW5nLCB0b2tlbjogc3RyaW5nKSB7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJsU3RyaW5nKTtcbiAgdXJsLnVzZXJuYW1lID0gdG9rZW47XG4gIHJldHVybiB1cmwudG9TdHJpbmcoKTtcbn1cbiJdfQ==