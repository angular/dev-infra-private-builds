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
    exports.rebasePr = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFDdkQsMkJBQXdCO0lBRXhCLGtFQUEwRDtJQUMxRCxvRUFBK0Q7SUFDL0QsNERBQWtFO0lBQ2xFLGtFQUF5QztJQUN6QyxvRUFBeUM7SUFFekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDckMsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO0tBQ0YsQ0FBQztJQUVGOzs7T0FHRztJQUNILFNBQXNCLFFBQVEsQ0FDMUIsUUFBZ0IsRUFBRSxXQUFtQixFQUFFLE1BQWlEO1FBQWpELHVCQUFBLEVBQUEsU0FBc0Msa0JBQVMsRUFBRTs7WUE4RTFGLDZDQUE2QztZQUM3QyxTQUFTLGVBQWU7Z0JBQ3RCLG1EQUFtRDtnQkFDbkQsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7Z0JBQzNCLGlFQUFpRTtnQkFDakUsY0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3pCLDBEQUEwRDtnQkFDMUQsY0FBSSxDQUFDLGtCQUFnQixjQUFnQixDQUFDLENBQUM7WUFDekMsQ0FBQzs7Ozs7d0JBckZELHdEQUF3RDt3QkFDeEQsSUFBSSxxQkFBZSxFQUFFLEVBQUU7NEJBQ3JCLGVBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDOzRCQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFNSyxjQUFjLEdBQUcsc0JBQWdCLEVBQUUsQ0FBQzt3QkFFL0IscUJBQU0sY0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBcEQsRUFBRSxHQUFHLFNBQStDO3dCQUVwRCxXQUFXLEdBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxTQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDO3dCQUMxRSxXQUFXLEdBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxTQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDO3dCQUMxRSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUM1RSxVQUFVLEdBQUcsc0JBQXNCLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQUVsRixtRkFBbUY7d0JBQ25GLGdCQUFnQjt3QkFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUU7NEJBQ2xELGVBQUssQ0FDRCxrRkFBa0Y7Z0NBQ2xGLGtCQUFrQixDQUFDLENBQUM7NEJBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELElBQUk7NEJBQ0Ysa0ZBQWtGOzRCQUNsRixjQUFJLENBQUMsc0JBQW9CLFFBQVEsY0FBUyxXQUFhLENBQUMsQ0FBQzs0QkFDekQsY0FBSSxDQUFDLGVBQWEsVUFBVSxTQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDLENBQUM7NEJBQ25ELGNBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDOzRCQUV6QyxrREFBa0Q7NEJBQ2xELGNBQUksQ0FBQyxjQUFZLFdBQVcsb0JBQWUsUUFBUSxRQUFLLENBQUMsQ0FBQzs0QkFDMUQsY0FBSSxDQUFDLGVBQWEsVUFBVSxTQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBTSxDQUFDLENBQUM7NEJBQ25ELGNBQUksQ0FBQyw4QkFBNEIsUUFBUSxZQUFPLFdBQWEsQ0FBQyxDQUFDOzRCQUN6RCxZQUFZLEdBQUcsY0FBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7NEJBRW5ELHVFQUF1RTs0QkFDdkUsSUFBSSxZQUFZLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtnQ0FDM0IsY0FBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7Z0NBQ3BFLGNBQUksQ0FBQyx5QkFBdUIsUUFBUSxZQUFPLFdBQWEsQ0FBQyxDQUFDO2dDQUMxRCxjQUFJLENBQUMsY0FBWSxVQUFVLGNBQVMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLHdCQUFxQixDQUFDLENBQUM7Z0NBQzFFLGNBQUksQ0FBQyw2QkFBMkIsUUFBVSxDQUFDLENBQUM7Z0NBQzVDLGVBQWUsRUFBRSxDQUFDO2dDQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUNqQjt5QkFDRjt3QkFBQyxPQUFPLEdBQUcsRUFBRTs0QkFDWixlQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzRCQUNuQixlQUFlLEVBQUUsQ0FBQzs0QkFDbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsbUZBQW1GO3dCQUNuRiwyQkFBMkI7d0JBQzNCLGNBQUksQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO3dCQUduRSxLQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxDQUFBO2lDQUEvQix3QkFBK0I7d0JBQUkscUJBQU0sdUJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxFQUFBOzs4QkFBaEQsU0FBZ0Q7Ozt3QkFEakYsY0FBYyxLQUNtRTt3QkFFdkYsSUFBSSxjQUFjLEVBQUU7NEJBQ2xCLGNBQUksQ0FBQywrRUFBNkUsUUFBUSxNQUFHLENBQUMsQ0FBQzs0QkFDL0YsY0FBSSxDQUFDLGlCQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsY0FBUyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksd0JBQXFCLENBQUMsQ0FBQzs0QkFDNUYsY0FBSSxFQUFFLENBQUM7NEJBQ1AsY0FBSSxDQUFDLG1GQUFtRixDQUFDLENBQUM7NEJBQzFGLGNBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDOzRCQUNuQyxjQUFJLENBQUMsK0RBQTZELGNBQWdCLENBQUMsQ0FBQzs0QkFDcEYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBQU07NEJBQ0wsY0FBSSxDQUFDLHNEQUFzRCxDQUFDLENBQUM7eUJBQzlEO3dCQUVELGVBQWUsRUFBRSxDQUFDO3dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQVdqQjtJQXhGRCw0QkF3RkM7SUFFRCwrREFBK0Q7SUFDL0QsU0FBUyxzQkFBc0IsQ0FBQyxTQUFpQixFQUFFLEtBQWE7UUFDOUQsSUFBTSxHQUFHLEdBQUcsSUFBSSxTQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0IsR0FBRyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDckIsT0FBTyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDeEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuaW1wb3J0IHtVUkx9IGZyb20gJ3VybCc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtnZXRDdXJyZW50QnJhbmNoLCBoYXNMb2NhbENoYW5nZXN9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuaW1wb3J0IHtleGVjfSBmcm9tICcuLi8uLi91dGlscy9zaGVsbGpzJztcblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBlYWNoIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHN0YXRlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaFFMVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaFFMVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG59O1xuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlYmFzZVByKFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIGNvbmZpZzogUGljazxOZ0RldkNvbmZpZywgJ2dpdGh1Yic+ID0gZ2V0Q29uZmlnKCkpIHtcbiAgLy8gVE9ETzogUmVseSBvbiBhIGNvbW1vbiBhc3NlcnROb0xvY2FsQ2hhbmdlcyBmdW5jdGlvbi5cbiAgaWYgKGhhc0xvY2FsQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBwZXJmb3JtIHJlYmFzZSBvZiBQUiB3aXRoIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybXMgYW55IEdpdFxuICAgKiBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBvcmlnaW5hbEJyYW5jaCA9IGdldEN1cnJlbnRCcmFuY2goKTtcbiAgLyogR2V0IHRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBjb25maWcuZ2l0aHViKTtcblxuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke3ByLmhlYWRSZWYubmFtZX1gO1xuICBjb25zdCBmdWxsQmFzZVJlZiA9IGAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke3ByLmJhc2VSZWYubmFtZX1gO1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkQXV0aGVudGljYXRpb25Ub1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIGNvbnN0IGJhc2VSZWZVcmwgPSBhZGRBdXRoZW50aWNhdGlvblRvVXJsKHByLmJhc2VSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmViYXNlIGFzIHlvdSBkaWQgbm90IGF1dGhvciB0aGUgUFIgYW5kIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVyc2AgK1xuICAgICAgICBgdG8gbW9kaWZ5IHRoZSBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGV4ZWMoYGdpdCBmZXRjaCAke2hlYWRSZWZVcmx9ICR7cHIuaGVhZFJlZi5uYW1lfWApO1xuICAgIGV4ZWMoYGdpdCBjaGVja291dCAtLWRldGFjaCBGRVRDSF9IRUFEYCk7XG5cbiAgICAvLyBGZXRjaCB0aGUgUFJzIHRhcmdldCBicmFuY2ggYW5kIHJlYmFzZSBvbnRvIGl0LlxuICAgIGluZm8oYEZldGNoaW5nICR7ZnVsbEJhc2VSZWZ9IHRvIHJlYmFzZSAjJHtwck51bWJlcn0gb25gKTtcbiAgICBleGVjKGBnaXQgZmV0Y2ggJHtiYXNlUmVmVXJsfSAke3ByLmJhc2VSZWYubmFtZX1gKTtcbiAgICBpbmZvKGBBdHRlbXB0aW5nIHRvIHJlYmFzZSBQUiAjJHtwck51bWJlcn0gb24gJHtmdWxsQmFzZVJlZn1gKTtcbiAgICBjb25zdCByZWJhc2VSZXN1bHQgPSBleGVjKGBnaXQgcmViYXNlIEZFVENIX0hFQURgKTtcblxuICAgIC8vIElmIHRoZSByZWJhc2Ugd2FzIGNsZWFuLCBwdXNoIHRoZSByZWJhc2VkIFBSIHVwIHRvIHRoZSBhdXRob3JzIGZvcmsuXG4gICAgaWYgKHJlYmFzZVJlc3VsdC5jb2RlID09PSAwKSB7XG4gICAgICBpbmZvKGBSZWJhc2Ugd2FzIGFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0c2ApO1xuICAgICAgaW5mbyhgUHVzaGluZyByZWJhc2VkIFBSICMke3ByTnVtYmVyfSB0byAke2Z1bGxIZWFkUmVmfWApO1xuICAgICAgZXhlYyhgZ2l0IHB1c2ggJHtiYXNlUmVmVXJsfSBIRUFEOiR7cHIuYmFzZVJlZi5uYW1lfSAtLWZvcmNlLXdpdGgtbGVhc2VgKTtcbiAgICAgIGluZm8oYFJlYmFzZWQgYW5kIHVwZGF0ZWQgUFIgIyR7cHJOdW1iZXJ9YCk7XG4gICAgICBjbGVhblVwR2l0U3RhdGUoKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGVycm9yKGVyci5tZXNzYWdlKTtcbiAgICBjbGVhblVwR2l0U3RhdGUoKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBPbiBhdXRvbWF0aWMgcmViYXNlIGZhaWx1cmVzLCBwcm9tcHQgdG8gY2hvb3NlIGlmIHRoZSByZWJhc2Ugc2hvdWxkIGJlIGNvbnRpbnVlZFxuICAvLyBtYW51YWxseSBvciBhYm9ydGVkIG5vdy5cbiAgaW5mbyhgUmViYXNlIHdhcyB1bmFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0cy5gKTtcbiAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgY29uc3QgY29udGludWVSZWJhc2UgPVxuICAgICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiBhd2FpdCBwcm9tcHRDb25maXJtKCdNYW51YWxseSBjb21wbGV0ZSByZWJhc2U/Jyk7XG5cbiAgaWYgKGNvbnRpbnVlUmViYXNlKSB7XG4gICAgaW5mbyhgQWZ0ZXIgbWFudWFsbHkgY29tcGxldGluZyByZWJhc2UsIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gdXBkYXRlIFBSICMke3ByTnVtYmVyfTpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcHVzaCAke3ByLmJhc2VSZWYucmVwb3NpdG9yeS51cmx9IEhFQUQ6JHtwci5iYXNlUmVmLm5hbWV9IC0tZm9yY2Utd2l0aC1sZWFzZWApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBUbyBhYm9ydCB0aGUgcmViYXNlIGFuZCByZXR1cm4gdG8gdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5IGJlZm9yZSB0aGlzIGNvbW1hbmRgKTtcbiAgICBpbmZvKGBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgIGluZm8oYCAkIGdpdCByZWJhc2UgLS1hYm9ydCAmJiBnaXQgcmVzZXQgLS1oYXJkICYmIGdpdCBjaGVja291dCAke29yaWdpbmFsQnJhbmNofWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBDbGVhbmluZyB1cCBnaXQgc3RhdGUsIGFuZCByZXN0b3JpbmcgcHJldmlvdXMgc3RhdGUuYCk7XG4gIH1cblxuICBjbGVhblVwR2l0U3RhdGUoKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xuXG4gIC8qKiBSZXNldCBnaXQgYmFjayB0byB0aGUgb3JpZ2luYWwgYnJhbmNoLiAqL1xuICBmdW5jdGlvbiBjbGVhblVwR2l0U3RhdGUoKSB7XG4gICAgLy8gRW5zdXJlIHRoYXQgYW55IG91dHN0YW5kaW5nIHJlYmFzZXMgYXJlIGFib3J0ZWQuXG4gICAgZXhlYyhgZ2l0IHJlYmFzZSAtLWFib3J0YCk7XG4gICAgLy8gRW5zdXJlIHRoYXQgYW55IGNoYW5nZXMgaW4gdGhlIGN1cnJlbnQgcmVwbyBzdGF0ZSBhcmUgY2xlYXJlZC5cbiAgICBleGVjKGBnaXQgcmVzZXQgLS1oYXJkYCk7XG4gICAgLy8gQ2hlY2tvdXQgdGhlIG9yaWdpbmFsIGJyYW5jaCBmcm9tIGJlZm9yZSB0aGUgcnVuIGJlZ2FuLlxuICAgIGV4ZWMoYGdpdCBjaGVja291dCAke29yaWdpbmFsQnJhbmNofWApO1xuICB9XG59XG5cbi8qKiBBZGRzIHRoZSBwcm92aWRlZCB0b2tlbiBhcyB1c2VybmFtZSB0byB0aGUgcHJvdmlkZWQgdXJsLiAqL1xuZnVuY3Rpb24gYWRkQXV0aGVudGljYXRpb25Ub1VybCh1cmxTdHJpbmc6IHN0cmluZywgdG9rZW46IHN0cmluZykge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKHVybFN0cmluZyk7XG4gIHVybC51c2VybmFtZSA9IHRva2VuO1xuICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XG59XG4iXX0=