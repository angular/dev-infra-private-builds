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
        define("@angular/dev-infra-private/pr/rebase", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/authenticated-git-client", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.rebasePr = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var utils_1 = require("@angular/dev-infra-private/commit-message/utils");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    /* Graphql schema for the response body for each pending PR. */
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
            var git, previousBranchOrRevision, pr, headRefName, baseRefName, fullHeadRef, fullBaseRef, headRefUrl, baseRefUrl, forceWithLeaseFlag, commonAncestorSha, commits, squashFixups, _a, _b, flags, env, rebaseResult, err_1, continueRebase, _c;
            return tslib_1.__generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        git = authenticated_git_client_1.AuthenticatedGitClient.get();
                        if (git.hasUncommittedChanges()) {
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
                        _d.trys.push([2, 7, , 8]);
                        // Fetch the branch at the commit of the PR, and check it out in a detached state.
                        console_1.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                        git.run(['fetch', '-q', headRefUrl, headRefName]);
                        git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
                        // Fetch the PRs target branch and rebase onto it.
                        console_1.info("Fetching " + fullBaseRef + " to rebase #" + prNumber + " on");
                        git.run(['fetch', '-q', baseRefUrl, baseRefName]);
                        commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
                        return [4 /*yield*/, utils_1.getCommitsInRange(commonAncestorSha, 'HEAD')];
                    case 3:
                        commits = _d.sent();
                        if (!(commits.filter(function (commit) { return commit.isFixup; }).length === 0)) return [3 /*break*/, 4];
                        _a = false;
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, console_1.promptConfirm("PR #" + prNumber + " contains fixup commits, would you like to squash them during rebase?", true)];
                    case 5:
                        _a = _d.sent();
                        _d.label = 6;
                    case 6:
                        squashFixups = _a;
                        console_1.info("Attempting to rebase PR #" + prNumber + " on " + fullBaseRef);
                        _b = tslib_1.__read(squashFixups ?
                            [['--interactive', '--autosquash'], tslib_1.__assign(tslib_1.__assign({}, process.env), { GIT_SEQUENCE_EDITOR: 'true' })] :
                            [[], undefined], 2), flags = _b[0], env = _b[1];
                        rebaseResult = git.runGraceful(tslib_1.__spreadArray(tslib_1.__spreadArray(['rebase'], tslib_1.__read(flags)), ['FETCH_HEAD']), { env: env });
                        // If the rebase was clean, push the rebased PR up to the authors fork.
                        if (rebaseResult.status === 0) {
                            console_1.info("Rebase was able to complete automatically without conflicts");
                            console_1.info("Pushing rebased PR #" + prNumber + " to " + fullHeadRef);
                            git.run(['push', headRefUrl, "HEAD:" + headRefName, forceWithLeaseFlag]);
                            console_1.info("Rebased and updated PR #" + prNumber);
                            git.checkout(previousBranchOrRevision, true);
                            process.exit(0);
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        err_1 = _d.sent();
                        console_1.error(err_1.message);
                        git.checkout(previousBranchOrRevision, true);
                        process.exit(1);
                        return [3 /*break*/, 8];
                    case 8:
                        // On automatic rebase failures, prompt to choose if the rebase should be continued
                        // manually or aborted now.
                        console_1.info("Rebase was unable to complete automatically without conflicts.");
                        _c = process.env['CI'] === undefined;
                        if (!_c) return [3 /*break*/, 10];
                        return [4 /*yield*/, console_1.promptConfirm('Manually complete rebase?')];
                    case 9:
                        _c = (_d.sent());
                        _d.label = 10;
                    case 10:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFHdkQseUVBQTZEO0lBQzdELGtFQUEwRDtJQUMxRCxvRUFBK0Q7SUFDL0QsMEdBQWdGO0lBQ2hGLGdGQUFrRTtJQUNsRSxrRUFBeUM7SUFFekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDckMsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMvQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUMxQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOzs7Ozs7d0JBRXBGLEdBQUcsR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt3QkFDekMsSUFBSSxHQUFHLENBQUMscUJBQXFCLEVBQUUsRUFBRTs0QkFDL0IsZUFBSyxDQUFD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Y0FBYyxLQUNtRTt3QkFFdkYsSUFBSSxjQUFjLEVBQUU7NEJBQ2xCLGNBQUksQ0FBQywrRUFBNkUsUUFBUSxNQUFHLENBQUMsQ0FBQzs0QkFDL0YsY0FBSSxDQUFDLGlCQUFlLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsY0FBUyxXQUFXLFNBQUksa0JBQW9CLENBQUMsQ0FBQzs0QkFDM0YsY0FBSSxFQUFFLENBQUM7NEJBQ1AsY0FBSSxDQUFDLG1GQUFtRixDQUFDLENBQUM7NEJBQzFGLGNBQUksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDOzRCQUNuQyxjQUFJLENBQUMsK0RBQTZELHdCQUEwQixDQUFDLENBQUM7NEJBQzlGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCOzZCQUFNOzRCQUNMLGNBQUksQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO3lCQUM5RDt3QkFFRCxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO3dCQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQTdHRCw0QkE2R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge0NvbW1pdH0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHthZGRUb2tlblRvR2l0SHR0cHNVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaHFsIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGVhY2ggcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBocWxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmViYXNlUHIoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgY29uZmlnOiBQaWNrPE5nRGV2Q29uZmlnLCAnZ2l0aHViJz4gPSBnZXRDb25maWcoKSkge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuICBpZiAoZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBwZXJmb3JtIHJlYmFzZSBvZiBQUiB3aXRoIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3IgcmV2aXNpb24gb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybWVkXG4gICAqIGFueSBHaXQgb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIEdldCB0aGUgUFIgaW5mb3JtYXRpb24gZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByID0gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcblxuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgY29uc3QgYmFzZVJlZk5hbWUgPSBwci5iYXNlUmVmLm5hbWU7XG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7aGVhZFJlZk5hbWV9YDtcbiAgY29uc3QgZnVsbEJhc2VSZWYgPSBgJHtwci5iYXNlUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtiYXNlUmVmTmFtZX1gO1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgY29uc3QgYmFzZVJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG5cbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmViYXNlIGFzIHlvdSBkaWQgbm90IGF1dGhvciB0aGUgUFIgYW5kIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVyc2AgK1xuICAgICAgICBgdG8gbW9kaWZ5IHRoZSBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBpbmZvKGBGZXRjaGluZyAke2Z1bGxCYXNlUmVmfSB0byByZWJhc2UgIyR7cHJOdW1iZXJ9IG9uYCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgYmFzZVJlZlVybCwgYmFzZVJlZk5hbWVdKTtcblxuICAgIGNvbnN0IGNvbW1vbkFuY2VzdG9yU2hhID0gZ2l0LnJ1bihbJ21lcmdlLWJhc2UnLCAnSEVBRCcsICdGRVRDSF9IRUFEJ10pLnN0ZG91dC50cmltKCk7XG5cbiAgICBjb25zdCBjb21taXRzID0gYXdhaXQgZ2V0Q29tbWl0c0luUmFuZ2UoY29tbW9uQW5jZXN0b3JTaGEsICdIRUFEJyk7XG5cbiAgICBsZXQgc3F1YXNoRml4dXBzID0gY29tbWl0cy5maWx0ZXIoKGNvbW1pdDogQ29tbWl0KSA9PiBjb21taXQuaXNGaXh1cCkubGVuZ3RoID09PSAwID9cbiAgICAgICAgZmFsc2UgOlxuICAgICAgICBhd2FpdCBwcm9tcHRDb25maXJtKFxuICAgICAgICAgICAgYFBSICMke3ByTnVtYmVyfSBjb250YWlucyBmaXh1cCBjb21taXRzLCB3b3VsZCB5b3UgbGlrZSB0byBzcXVhc2ggdGhlbSBkdXJpbmcgcmViYXNlP2AsXG4gICAgICAgICAgICB0cnVlKTtcblxuICAgIGluZm8oYEF0dGVtcHRpbmcgdG8gcmViYXNlIFBSICMke3ByTnVtYmVyfSBvbiAke2Z1bGxCYXNlUmVmfWApO1xuXG4gICAgLyoqXG4gICAgICogVHVwbGUgb2YgZmxhZ3MgdG8gYmUgYWRkZWQgdG8gdGhlIHJlYmFzZSBjb21tYW5kIGFuZCBlbnYgb2JqZWN0IHRvIHJ1biB0aGUgZ2l0IGNvbW1hbmQuXG4gICAgICpcbiAgICAgKiBBZGRpdGlvbmFsIGZsYWdzIHRvIHBlcmZvcm0gdGhlIGF1dG9zcXVhc2hpbmcgYXJlIGFkZGVkIHdoZW4gdGhlIHVzZXIgY29uZmlybSBzcXVhc2hpbmcgb2ZcbiAgICAgKiBmaXh1cCBjb21taXRzIHNob3VsZCBvY2N1ci5cbiAgICAgKi9cbiAgICBjb25zdCBbZmxhZ3MsIGVudl0gPSBzcXVhc2hGaXh1cHMgP1xuICAgICAgICBbWyctLWludGVyYWN0aXZlJywgJy0tYXV0b3NxdWFzaCddLCB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ31dIDpcbiAgICAgICAgW1tdLCB1bmRlZmluZWRdO1xuICAgIGNvbnN0IHJlYmFzZVJlc3VsdCA9IGdpdC5ydW5HcmFjZWZ1bChbJ3JlYmFzZScsIC4uLmZsYWdzLCAnRkVUQ0hfSEVBRCddLCB7ZW52OiBlbnZ9KTtcblxuICAgIC8vIElmIHRoZSByZWJhc2Ugd2FzIGNsZWFuLCBwdXNoIHRoZSByZWJhc2VkIFBSIHVwIHRvIHRoZSBhdXRob3JzIGZvcmsuXG4gICAgaWYgKHJlYmFzZVJlc3VsdC5zdGF0dXMgPT09IDApIHtcbiAgICAgIGluZm8oYFJlYmFzZSB3YXMgYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzYCk7XG4gICAgICBpbmZvKGBQdXNoaW5nIHJlYmFzZWQgUFIgIyR7cHJOdW1iZXJ9IHRvICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICBpbmZvKGBSZWJhc2VkIGFuZCB1cGRhdGVkIFBSICMke3ByTnVtYmVyfWApO1xuICAgICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICBlcnJvcihlcnIubWVzc2FnZSk7XG4gICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gT24gYXV0b21hdGljIHJlYmFzZSBmYWlsdXJlcywgcHJvbXB0IHRvIGNob29zZSBpZiB0aGUgcmViYXNlIHNob3VsZCBiZSBjb250aW51ZWRcbiAgLy8gbWFudWFsbHkgb3IgYWJvcnRlZCBub3cuXG4gIGluZm8oYFJlYmFzZSB3YXMgdW5hYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHMuYCk7XG4gIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gIGNvbnN0IGNvbnRpbnVlUmViYXNlID1cbiAgICAgIHByb2Nlc3MuZW52WydDSSddID09PSB1bmRlZmluZWQgJiYgYXdhaXQgcHJvbXB0Q29uZmlybSgnTWFudWFsbHkgY29tcGxldGUgcmViYXNlPycpO1xuXG4gIGlmIChjb250aW51ZVJlYmFzZSkge1xuICAgIGluZm8oYEFmdGVyIG1hbnVhbGx5IGNvbXBsZXRpbmcgcmViYXNlLCBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHVwZGF0ZSBQUiAjJHtwck51bWJlcn06YCk7XG4gICAgaW5mbyhgICQgZ2l0IHB1c2ggJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsfSBIRUFEOiR7aGVhZFJlZk5hbWV9ICR7Zm9yY2VXaXRoTGVhc2VGbGFnfWApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBUbyBhYm9ydCB0aGUgcmViYXNlIGFuZCByZXR1cm4gdG8gdGhlIHN0YXRlIG9mIHRoZSByZXBvc2l0b3J5IGJlZm9yZSB0aGlzIGNvbW1hbmRgKTtcbiAgICBpbmZvKGBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgIGluZm8oYCAkIGdpdCByZWJhc2UgLS1hYm9ydCAmJiBnaXQgcmVzZXQgLS1oYXJkICYmIGdpdCBjaGVja291dCAke3ByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbn1gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgQ2xlYW5pbmcgdXAgZ2l0IHN0YXRlLCBhbmQgcmVzdG9yaW5nIHByZXZpb3VzIHN0YXRlLmApO1xuICB9XG5cbiAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==