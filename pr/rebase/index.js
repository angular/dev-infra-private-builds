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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFDdkQseUVBQTRGO0lBRTVGLGtFQUEwRDtJQUMxRCxvRUFBK0Q7SUFDL0QsZ0ZBQWtFO0lBQ2xFLG9FQUFnRDtJQUNoRCxrRUFBeUM7SUFFekMsK0RBQStEO0lBQy9ELElBQU0sU0FBUyxHQUFHO1FBQ2hCLEtBQUssRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDMUIsbUJBQW1CLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3pDLGVBQWUsRUFBRSx3QkFBWSxDQUFDLE9BQU87UUFDckMsVUFBVSxFQUFFLHdCQUFZLENBQUMsTUFBTTtRQUMvQixPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7UUFDRCxPQUFPLEVBQUU7WUFDUCxJQUFJLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1lBQ3pCLFVBQVUsRUFBRTtnQkFDVixHQUFHLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2dCQUN4QixhQUFhLEVBQUUsd0JBQVksQ0FBQyxNQUFNO2FBQ25DO1NBQ0Y7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBc0IsUUFBUSxDQUMxQixRQUFnQixFQUFFLFdBQW1CLEVBQUUsTUFBaUQ7UUFBakQsdUJBQUEsRUFBQSxTQUFzQyxrQkFBUyxFQUFFOzs7Ozs7d0JBQ3BGLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBQ3ZDLHdEQUF3RDt3QkFDeEQsSUFBSSxHQUFHLENBQUMsZUFBZSxFQUFFLEVBQUU7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RXZGLElBQUksY0FBYyxFQUFFOzRCQUNsQixjQUFJLENBQUMsK0VBQTZFLFFBQVEsTUFBRyxDQUFDLENBQUM7NEJBQy9GLGNBQUksQ0FBQyxpQkFBZSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLGNBQVMsV0FBVyxTQUFJLGtCQUFvQixDQUFDLENBQUM7NEJBQzNGLGNBQUksRUFBRSxDQUFDOzRCQUNQLGNBQUksQ0FBQyxtRkFBbUYsQ0FBQyxDQUFDOzRCQUMxRixjQUFJLENBQUMsNEJBQTRCLENBQUMsQ0FBQzs0QkFDbkMsY0FBSSxDQUFDLCtEQUE2RCx3QkFBMEIsQ0FBQyxDQUFDOzRCQUM5RixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs2QkFBTTs0QkFDTCxjQUFJLENBQUMsc0RBQXNELENBQUMsQ0FBQzt5QkFDOUQ7d0JBRUQsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQzt3QkFDN0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUE5R0QsNEJBOEdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlLCBQYXJzZWRDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHthZGRUb2tlblRvR2l0SHR0cHNVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qIEdyYXBoUUwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgZWFjaCBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWZPaWQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuLyoqXG4gKiBSZWJhc2UgdGhlIHByb3ZpZGVkIFBSIG9udG8gaXRzIG1lcmdlIHRhcmdldCBicmFuY2gsIGFuZCBwdXNoIHVwIHRoZSByZXN1bHRpbmdcbiAqIGNvbW1pdCB0byB0aGUgUFJzIHJlcG9zaXRvcnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWJhc2VQcihcbiAgICBwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nLCBjb25maWc6IFBpY2s8TmdEZXZDb25maWcsICdnaXRodWInPiA9IGdldENvbmZpZygpKSB7XG4gIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQoZ2l0aHViVG9rZW4pO1xuICAvLyBUT0RPOiBSZWx5IG9uIGEgY29tbW9uIGFzc2VydE5vTG9jYWxDaGFuZ2VzIGZ1bmN0aW9uLlxuICBpZiAoZ2l0Lmhhc0xvY2FsQ2hhbmdlcygpKSB7XG4gICAgZXJyb3IoJ0Nhbm5vdCBwZXJmb3JtIHJlYmFzZSBvZiBQUiB3aXRoIGxvY2FsIGNoYW5nZXMuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3IgcmV2aXNpb24gb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybWVkXG4gICAqIGFueSBHaXQgb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIEdldCB0aGUgUFIgaW5mb3JtYXRpb24gZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByID0gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcblxuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgY29uc3QgYmFzZVJlZk5hbWUgPSBwci5iYXNlUmVmLm5hbWU7XG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7aGVhZFJlZk5hbWV9YDtcbiAgY29uc3QgZnVsbEJhc2VSZWYgPSBgJHtwci5iYXNlUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtiYXNlUmVmTmFtZX1gO1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgY29uc3QgYmFzZVJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG5cbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBDYW5ub3QgcmViYXNlIGFzIHlvdSBkaWQgbm90IGF1dGhvciB0aGUgUFIgYW5kIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVyc2AgK1xuICAgICAgICBgdG8gbW9kaWZ5IHRoZSBQUmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBpbmZvKGBGZXRjaGluZyAke2Z1bGxCYXNlUmVmfSB0byByZWJhc2UgIyR7cHJOdW1iZXJ9IG9uYCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgYmFzZVJlZlVybCwgYmFzZVJlZk5hbWVdKTtcblxuICAgIGNvbnN0IGNvbW1vbkFuY2VzdG9yU2hhID0gZ2l0LnJ1bihbJ21lcmdlLWJhc2UnLCAnSEVBRCcsICdGRVRDSF9IRUFEJ10pLnN0ZG91dC50cmltKCk7XG5cbiAgICBjb25zdCBjb21taXRzID0gcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlKGAke2NvbW1vbkFuY2VzdG9yU2hhfS4uSEVBRGApO1xuXG4gICAgbGV0IHNxdWFzaEZpeHVwcyA9XG4gICAgICAgIGNvbW1pdHMuZmlsdGVyKChjb21taXQ6IFBhcnNlZENvbW1pdE1lc3NhZ2UpID0+IGNvbW1pdC5pc0ZpeHVwKS5sZW5ndGggPT09IDAgP1xuICAgICAgICBmYWxzZSA6XG4gICAgICAgIGF3YWl0IHByb21wdENvbmZpcm0oXG4gICAgICAgICAgICBgUFIgIyR7cHJOdW1iZXJ9IGNvbnRhaW5zIGZpeHVwIGNvbW1pdHMsIHdvdWxkIHlvdSBsaWtlIHRvIHNxdWFzaCB0aGVtIGR1cmluZyByZWJhc2U/YCxcbiAgICAgICAgICAgIHRydWUpO1xuXG4gICAgaW5mbyhgQXR0ZW1wdGluZyB0byByZWJhc2UgUFIgIyR7cHJOdW1iZXJ9IG9uICR7ZnVsbEJhc2VSZWZ9YCk7XG5cbiAgICAvKipcbiAgICAgKiBUdXBsZSBvZiBmbGFncyB0byBiZSBhZGRlZCB0byB0aGUgcmViYXNlIGNvbW1hbmQgYW5kIGVudiBvYmplY3QgdG8gcnVuIHRoZSBnaXQgY29tbWFuZC5cbiAgICAgKlxuICAgICAqIEFkZGl0aW9uYWwgZmxhZ3MgdG8gcGVyZm9ybSB0aGUgYXV0b3NxdWFzaGluZyBhcmUgYWRkZWQgd2hlbiB0aGUgdXNlciBjb25maXJtIHNxdWFzaGluZyBvZlxuICAgICAqIGZpeHVwIGNvbW1pdHMgc2hvdWxkIG9jY3VyLlxuICAgICAqL1xuICAgIGNvbnN0IFtmbGFncywgZW52XSA9IHNxdWFzaEZpeHVwcyA/XG4gICAgICAgIFtbJy0taW50ZXJhY3RpdmUnLCAnLS1hdXRvc3F1YXNoJ10sIHsuLi5wcm9jZXNzLmVudiwgR0lUX1NFUVVFTkNFX0VESVRPUjogJ3RydWUnfV0gOlxuICAgICAgICBbW10sIHVuZGVmaW5lZF07XG4gICAgY29uc3QgcmViYXNlUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgLi4uZmxhZ3MsICdGRVRDSF9IRUFEJ10sIHtlbnY6IGVudn0pO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LnN0YXR1cyA9PT0gMCkge1xuICAgICAgaW5mbyhgUmViYXNlIHdhcyBhYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHNgKTtcbiAgICAgIGluZm8oYFB1c2hpbmcgcmViYXNlZCBQUiAjJHtwck51bWJlcn0gdG8gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIGluZm8oYFJlYmFzZWQgYW5kIHVwZGF0ZWQgUFIgIyR7cHJOdW1iZXJ9YCk7XG4gICAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGVycm9yKGVyci5tZXNzYWdlKTtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBPbiBhdXRvbWF0aWMgcmViYXNlIGZhaWx1cmVzLCBwcm9tcHQgdG8gY2hvb3NlIGlmIHRoZSByZWJhc2Ugc2hvdWxkIGJlIGNvbnRpbnVlZFxuICAvLyBtYW51YWxseSBvciBhYm9ydGVkIG5vdy5cbiAgaW5mbyhgUmViYXNlIHdhcyB1bmFibGUgdG8gY29tcGxldGUgYXV0b21hdGljYWxseSB3aXRob3V0IGNvbmZsaWN0cy5gKTtcbiAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgY29uc3QgY29udGludWVSZWJhc2UgPVxuICAgICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiBhd2FpdCBwcm9tcHRDb25maXJtKCdNYW51YWxseSBjb21wbGV0ZSByZWJhc2U/Jyk7XG5cbiAgaWYgKGNvbnRpbnVlUmViYXNlKSB7XG4gICAgaW5mbyhgQWZ0ZXIgbWFudWFsbHkgY29tcGxldGluZyByZWJhc2UsIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gdXBkYXRlIFBSICMke3ByTnVtYmVyfTpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcHVzaCAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS51cmx9IEhFQUQ6JHtoZWFkUmVmTmFtZX0gJHtmb3JjZVdpdGhMZWFzZUZsYWd9YCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFRvIGFib3J0IHRoZSByZWJhc2UgYW5kIHJldHVybiB0byB0aGUgc3RhdGUgb2YgdGhlIHJlcG9zaXRvcnkgYmVmb3JlIHRoaXMgY29tbWFuZGApO1xuICAgIGluZm8oYHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgaW5mbyhgICQgZ2l0IHJlYmFzZSAtLWFib3J0ICYmIGdpdCByZXNldCAtLWhhcmQgJiYgZ2l0IGNoZWNrb3V0ICR7cHJldmlvdXNCcmFuY2hPclJldmlzaW9ufWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGBDbGVhbmluZyB1cCBnaXQgc3RhdGUsIGFuZCByZXN0b3JpbmcgcHJldmlvdXMgc3RhdGUuYCk7XG4gIH1cblxuICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19