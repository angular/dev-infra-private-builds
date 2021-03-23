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
        define("@angular/dev-infra-private/pr/rebase", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rebasePr = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
            var git, previousBranchOrRevision, pr, headRefName, baseRefName, fullHeadRef, fullBaseRef, headRefUrl, baseRefUrl, forceWithLeaseFlag, commonAncestorSha, commits, squashFixups, _a, _b, flags, env_1, rebaseResult, err_1, continueRebase, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        git = new index_1.GitClient(githubToken);
                        // TODO: Rely on a common assertNoLocalChanges function.
                        if (git.hasLocalChanges()) {
                            console_1.error('Cannot perform rebase of PR with local changes.');
                            process.exit(1);
                        }
                        previousBranchOrRevision = git.getCurrentBranchOrRevision();
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, git)];
                    case 1:
                        pr = _d.sent();
                        headRefName = pr.headRef.name;
                        baseRefName = pr.baseRef.name;
                        fullHeadRef = pr.headRef.repository.nameWithOwner + ":" + headRefName;
                        fullBaseRef = pr.baseRef.repository.nameWithOwner + ":" + baseRefName;
                        headRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
                        baseRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.baseRef.repository.url, githubToken);
                        forceWithLeaseFlag = "--force-with-lease=" + headRefName + ":" + pr.headRefOid;
                        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
                        // be pushed up.
                        if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
                            console_1.error("Cannot rebase as you did not author the PR and the PR does not allow maintainers" +
                                "to modify the PR");
                            process.exit(1);
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 6, , 7]);
                        // Fetch the branch at the commit of the PR, and check it out in a detached state.
                        console_1.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                        git.run(['fetch', '-q', headRefUrl, headRefName]);
                        git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
                        // Fetch the PRs target branch and rebase onto it.
                        console_1.info("Fetching " + fullBaseRef + " to rebase #" + prNumber + " on");
                        git.run(['fetch', '-q', baseRefUrl, baseRefName]);
                        commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
                        commits = parse_1.parseCommitMessagesForRange(commonAncestorSha + "..HEAD");
                        if (!(commits.filter(function (commit) { return commit.isFixup; }).length === 0)) return [3 /*break*/, 3];
                        _a = false;
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, console_1.promptConfirm("PR #" + prNumber + " contains fixup commits, would you like to squash them during rebase?", true)];
                    case 4:
                        _a = _d.sent();
                        _d.label = 5;
                    case 5:
                        squashFixups = _a;
                        console_1.info("Attempting to rebase PR #" + prNumber + " on " + fullBaseRef);
                        _b = tslib_1.__read(squashFixups ?
                            [['--interactive', '--autosquash'], tslib_1.__assign(tslib_1.__assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' })] :
                            [[], undefined], 2), flags = _b[0], env_1 = _b[1];
                        rebaseResult = git.runGraceful(tslib_1.__spread(['rebase'], flags, ['FETCH_HEAD']), { env: env_1 });
                        // If the rebase was clean, push the rebased PR up to the authors fork.
                        if (rebaseResult.status === 0) {
                            console_1.info("Rebase was able to complete automatically without conflicts");
                            console_1.info("Pushing rebased PR #" + prNumber + " to " + fullHeadRef);
                            git.run(['push', headRefUrl, "HEAD:" + headRefName, forceWithLeaseFlag]);
                            console_1.info("Rebased and updated PR #" + prNumber);
                            git.checkout(previousBranchOrRevision, true);
                            process.exit(0);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        err_1 = _d.sent();
                        console_1.error(err_1.message);
                        git.checkout(previousBranchOrRevision, true);
                        process.exit(1);
                        return [3 /*break*/, 7];
                    case 7:
                        // On automatic rebase failures, prompt to choose if the rebase should be continued
                        // manually or aborted now.
                        console_1.info("Rebase was unable to complete automatically without conflicts.");
                        _c = process.env['CI'] === undefined;
                        if (!_c) return [3 /*break*/, 9];
                        return [4 /*yield*/, console_1.promptConfirm('Manually complete rebase?')];
                    case 8:
                        _c = (_d.sent());
                        _d.label = 9;
                    case 9:
                        continueRebase = _c;
                        if (continueRebase) {
                            console_1.info("After manually completing rebase, run the following command to update PR #" + prNumber + ":");
                            console_1.info(" $ git push " + pr.headRef.repository.url + " HEAD:" + headRefName + " " + forceWithLeaseFlag);
                            console_1.info();
                            console_1.info("To abort the rebase and return to the state of the repository before this command");
                            console_1.info("run the following command:");
                            console_1.info(" $ git rebase --abort && git reset --hard && git checkout " + previousBranchOrRevision);
                            process.exit(1);
                        }
                        else {
                            console_1.info("Cleaning up git state, and restoring previous state.");
                        }
                        git.checkout(previousBranchOrRevision, true);
                        process.exit(1);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.rebasePr = rebasePr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFFdkQseUVBQStFO0lBQy9FLGtFQUEwRDtJQUMxRCxvRUFBK0Q7SUFDL0QsZ0ZBQWtFO0lBQ2xFLG9FQUFnRDtJQUNoRCxrRUFBeUM7SUFFekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDckMsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMvQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUMxQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOzs7Ozs7d0JBQ3BGLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ3ZDLHdEQUF3RDt3QkFDeEQsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7NEJBQ3pCLGVBQUssQ0FBQyxpREFBaUQsQ0FBQyxDQUFDOzRCQUN6RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFNSyx3QkFBd0IsR0FBRyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQzt3QkFFdkQscUJBQU0sY0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUE7O3dCQUExQyxFQUFFLEdBQUcsU0FBcUM7d0JBRTFDLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFDOUIsV0FBVyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO3dCQUM5QixXQUFXLEdBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxTQUFJLFdBQWEsQ0FBQzt3QkFDdEUsV0FBVyxHQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsU0FBSSxXQUFhLENBQUM7d0JBQ3RFLFVBQVUsR0FBRyxtQ0FBcUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBQzNFLFVBQVUsR0FBRyxtQ0FBcUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBUTNFLGtCQUFrQixHQUFHLHdCQUFzQixXQUFXLFNBQUksRUFBRSxDQUFDLFVBQVksQ0FBQzt3QkFFaEYsbUZBQW1GO3dCQUNuRixnQkFBZ0I7d0JBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFOzRCQUNsRCxlQUFLLENBQ0Qsa0ZBQWtGO2dDQUNsRixrQkFBa0IsQ0FBQyxDQUFDOzRCQUN4QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs7Ozt3QkFHQyxrRkFBa0Y7d0JBQ2xGLGNBQUksQ0FBQyxzQkFBb0IsUUFBUSxjQUFTLFdBQWEsQ0FBQyxDQUFDO3dCQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7d0JBQ3RELGtEQUFrRDt3QkFDbEQsY0FBSSxDQUFDLGNBQVksV0FBVyxvQkFBZSxRQUFRLFFBQUssQ0FBQyxDQUFDO3dCQUMxRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzt3QkFFNUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBRWhGLE9BQU8sR0FBRyxtQ0FBMkIsQ0FBSSxpQkFBaUIsV0FBUSxDQUFDLENBQUM7NkJBRXZELENBQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFDLE1BQWMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxPQUFPLEVBQWQsQ0FBYyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQSxFQUEvRCx3QkFBK0Q7d0JBQzlFLEtBQUEsS0FBSyxDQUFBOzs0QkFDTCxxQkFBTSx1QkFBYSxDQUNmLFNBQU8sUUFBUSwwRUFBdUUsRUFDdEYsSUFBSSxDQUFDLEVBQUE7O3dCQUZULEtBQUEsU0FFUyxDQUFBOzs7d0JBSlQsWUFBWSxLQUlIO3dCQUViLGNBQUksQ0FBQyw4QkFBNEIsUUFBUSxZQUFPLFdBQWEsQ0FBQyxDQUFDO3dCQVF6RCxLQUFBLGVBQWUsWUFBWSxDQUFDLENBQUM7NEJBQy9CLENBQUMsQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLHdDQUFNLE9BQU8sQ0FBQyxHQUFHLEtBQUUsbUJBQW1CLEVBQUUsTUFBTSxJQUFFLENBQUMsQ0FBQzs0QkFDcEYsQ0FBQyxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUEsRUFGWixLQUFLLFFBQUEsRUFBRSxhQUFHLENBRUc7d0JBQ2QsWUFBWSxHQUFHLEdBQUcsQ0FBQyxXQUFXLG1CQUFFLFFBQVEsR0FBSyxLQUFLLEdBQUUsWUFBWSxJQUFHLEVBQUMsR0FBRyxFQUFFLEtBQUcsRUFBQyxDQUFDLENBQUM7d0JBRXJGLHVFQUF1RTt3QkFDdkUsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDN0IsY0FBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7NEJBQ3BFLGNBQUksQ0FBQyx5QkFBdUIsUUFBUSxZQUFPLFdBQWEsQ0FBQyxDQUFDOzRCQUMxRCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFRLFdBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7NEJBQ3pFLGNBQUksQ0FBQyw2QkFBMkIsUUFBVSxDQUFDLENBQUM7NEJBQzVDLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCOzs7O3dCQUVELGVBQUssQ0FBQyxLQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ25CLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7d0JBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozt3QkFHbEIsbUZBQW1GO3dCQUNuRiwyQkFBMkI7d0JBQzNCLGNBQUksQ0FBQyxnRUFBZ0UsQ0FBQyxDQUFDO3dCQUduRSxLQUFBLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxDQUFBO2lDQUEvQix3QkFBK0I7d0JBQUkscUJBQU0sdUJBQWEsQ0FBQywyQkFBMkIsQ0FBQyxFQUFBOzs4QkFBaEQsU0FBZ0Q7Ozt3QkFEakYsY0FBYyxLQUNtRTt3QkFFdkYsSUFBSSxjQUFjLEVBQUU7NEJBQ2xCLGNBQUksQ0FBQywrRUFBNkUsUUFBUSxNQUFHLENBQUMsQ0FBQzs0QkFDL0YsY0FBSSxDQUFDLGlCQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsY0FBUyxXQUFXLFNBQUksa0JBQW9CLENBQUMsQ0FBQzs0QkFDM0YsY0FBSSxFQUFFLENBQUM7NEJBQ1AsY0FBSSxDQUFDLG1GQUFtRixDQUFDLENBQUM7NEJBQzFGLGNBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDOzRCQUNuQyxjQUFJLENBQUMsK0RBQTZELHdCQUEwQixDQUFDLENBQUM7NEJBQzlGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCOzZCQUFNOzRCQUNMLGNBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO3lCQUM5RDt3QkFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQTdHRCw0QkE2R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge2dldENvbmZpZywgTmdEZXZDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCBwcm9tcHRDb25maXJtfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuKTtcbiAgLy8gVE9ETzogUmVseSBvbiBhIGNvbW1vbiBhc3NlcnROb0xvY2FsQ2hhbmdlcyBmdW5jdGlvbi5cbiAgaWYgKGdpdC5oYXNMb2NhbENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcGVyZm9ybSByZWJhc2Ugb2YgUFIgd2l0aCBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yIHJldmlzaW9uIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1lZFxuICAgKiBhbnkgR2l0IG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBHZXQgdGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG5cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIGNvbnN0IGJhc2VSZWZOYW1lID0gcHIuYmFzZVJlZi5uYW1lO1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIGNvbnN0IGZ1bGxCYXNlUmVmID0gYCR7cHIuYmFzZVJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7YmFzZVJlZk5hbWV9YDtcbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIGNvbnN0IGJhc2VSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuYmFzZVJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuXG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvcikge1xuICAgIGVycm9yKFxuICAgICAgICBgQ2Fubm90IHJlYmFzZSBhcyB5b3UgZGlkIG5vdCBhdXRob3IgdGhlIFBSIGFuZCB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnNgICtcbiAgICAgICAgYHRvIG1vZGlmeSB0aGUgUFJgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCAnLXEnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctcScsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuICAgIC8vIEZldGNoIHRoZSBQUnMgdGFyZ2V0IGJyYW5jaCBhbmQgcmViYXNlIG9udG8gaXQuXG4gICAgaW5mbyhgRmV0Y2hpbmcgJHtmdWxsQmFzZVJlZn0gdG8gcmViYXNlICMke3ByTnVtYmVyfSBvbmApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGJhc2VSZWZVcmwsIGJhc2VSZWZOYW1lXSk7XG5cbiAgICBjb25zdCBjb21tb25BbmNlc3RvclNoYSA9IGdpdC5ydW4oWydtZXJnZS1iYXNlJywgJ0hFQUQnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuXG4gICAgY29uc3QgY29tbWl0cyA9IHBhcnNlQ29tbWl0TWVzc2FnZXNGb3JSYW5nZShgJHtjb21tb25BbmNlc3RvclNoYX0uLkhFQURgKTtcblxuICAgIGxldCBzcXVhc2hGaXh1cHMgPSBjb21taXRzLmZpbHRlcigoY29tbWl0OiBDb21taXQpID0+IGNvbW1pdC5pc0ZpeHVwKS5sZW5ndGggPT09IDAgP1xuICAgICAgICBmYWxzZSA6XG4gICAgICAgIGF3YWl0IHByb21wdENvbmZpcm0oXG4gICAgICAgICAgICBgUFIgIyR7cHJOdW1iZXJ9IGNvbnRhaW5zIGZpeHVwIGNvbW1pdHMsIHdvdWxkIHlvdSBsaWtlIHRvIHNxdWFzaCB0aGVtIGR1cmluZyByZWJhc2U/YCxcbiAgICAgICAgICAgIHRydWUpO1xuXG4gICAgaW5mbyhgQXR0ZW1wdGluZyB0byByZWJhc2UgUFIgIyR7cHJOdW1iZXJ9IG9uICR7ZnVsbEJhc2VSZWZ9YCk7XG5cbiAgICAvKipcbiAgICAgKiBUdXBsZSBvZiBmbGFncyB0byBiZSBhZGRlZCB0byB0aGUgcmViYXNlIGNvbW1hbmQgYW5kIGVudiBvYmplY3QgdG8gcnVuIHRoZSBnaXQgY29tbWFuZC5cbiAgICAgKlxuICAgICAqIEFkZGl0aW9uYWwgZmxhZ3MgdG8gcGVyZm9ybSB0aGUgYXV0b3NxdWFzaGluZyBhcmUgYWRkZWQgd2hlbiB0aGUgdXNlciBjb25maXJtIHNxdWFzaGluZyBvZlxuICAgICAqIGZpeHVwIGNvbW1pdHMgc2hvdWxkIG9jY3VyLlxuICAgICAqL1xuICAgIGNvbnN0IFtmbGFncywgZW52XSA9IHNxdWFzaEZpeHVwcyA/XG4gICAgICAgIFtbJy0taW50ZXJhY3RpdmUnLCAnLS1hdXRvc3F1YXNoJ10sIHsuLi5wcm9jZXNzLmVudiwgR0lUX1NFUVVFTkNFX0VESVRPUjogJ3RydWUnfV0gOlxuICAgICAgICBbW10sIHVuZGVmaW5lZF07XG4gICAgY29uc3QgcmViYXNlUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgLi4uZmxhZ3MsICdGRVRDSF9IRUFEJ10sIHtlbnY6IGVudn0pO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LnN0YXR1cyA9PT0gMCkge1xuICAgICAgaW5mbyhgUmViYXNlIHdhcyBhYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHNgKTtcbiAgICAgIGluZm8oYFB1c2hpbmcgcmViYXNlZCBQUiAjJHtwck51bWJlcn0gdG8gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIGluZm8oYFJlYmFzZWQgYW5kIHVwZGF0ZWQgUFIgIyR7cHJOdW1iZXJ9YCk7XG4gICAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGVycm9yKGVyci5tZXNzYWdlKTtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBPbiBhdXRvbWF0aWMgcmViYXNlIGZhaWx1cmVzLCBwcm9tcHQgdG8gY2hvb3NlIGlmIHRoZSByZWJhc2Ugc2hvdWxkIGJlIGNvbnRpbnVlZFxuICAvLyBtYW51YWxseSBvciBhYm9ydGVkIG5vdy5cbiAgaW5mbyhgUmViYXNlIHdhcyB1bmFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0cy5gKTtcbiAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgY29uc3QgY29udGludWVSZWJhc2UgPVxuICAgICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiBhd2FpdCBwcm9tcHRDb25maXJtKCdNYW51YWxseSBjb21wbGV0ZSByZWJhc2U/Jyk7XG5cbiAgaWYgKGNvbnRpbnVlUmViYXNlKSB7XG4gICAgaW5mbyhgQWZ0ZXIgbWFudWFsbHkgY29tcGxldGluZyByZWJhc2UsIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gdXBkYXRlIFBSICMke3ByTnVtYmVyfTpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcHVzaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9IEhFQUQ6JHtoZWFkUmVmTmFtZX0gJHtmb3JjZVdpdGhMZWFzZUZsYWd9YCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFRvIGFib3J0IHRoZSByZWJhc2UgYW5kIHJldHVybiB0byB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnkgYmVmb3JlIHRoaXMgY29tbWFuZGApO1xuICAgIGluZm8oYHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgaW5mbyhgICQgZ2l0IHJlYmFzZSAtLWFib3J0ICYmIGdpdCByZXNldCAtLWhhcmQgJiYgZ2l0IGNoZWNrb3V0ICR7cHJldmlvdXNCcmFuY2hPclJldmlzaW9ufWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBDbGVhbmluZyB1cCBnaXQgc3RhdGUsIGFuZCByZXN0b3JpbmcgcHJldmlvdXMgc3RhdGUuYCk7XG4gIH1cblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19