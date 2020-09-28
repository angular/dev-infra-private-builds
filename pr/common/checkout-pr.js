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
        define("@angular/dev-infra-private/pr/common/checkout-pr", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.UnexpectedLocalChangesError = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    /* GraphQL schema for the response body for a pending PR. */
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
    var UnexpectedLocalChangesError = /** @class */ (function (_super) {
        tslib_1.__extends(UnexpectedLocalChangesError, _super);
        function UnexpectedLocalChangesError(m) {
            var _this = _super.call(this, m) || this;
            Object.setPrototypeOf(_this, UnexpectedLocalChangesError.prototype);
            return _this;
        }
        return UnexpectedLocalChangesError;
    }(Error));
    exports.UnexpectedLocalChangesError = UnexpectedLocalChangesError;
    var MaintainerModifyAccessError = /** @class */ (function (_super) {
        tslib_1.__extends(MaintainerModifyAccessError, _super);
        function MaintainerModifyAccessError(m) {
            var _this = _super.call(this, m) || this;
            Object.setPrototypeOf(_this, MaintainerModifyAccessError.prototype);
            return _this;
        }
        return MaintainerModifyAccessError;
    }(Error));
    exports.MaintainerModifyAccessError = MaintainerModifyAccessError;
    /**
     * Rebase the provided PR onto its merge target branch, and push up the resulting
     * commit to the PRs repository.
     */
    function checkOutPullRequestLocally(prNumber, githubToken, opts) {
        if (opts === void 0) { opts = {}; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var git, previousBranchOrRevision, pr, headRefName, fullHeadRef, headRefUrl, forceWithLeaseFlag;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        git = new git_1.GitClient(githubToken);
                        // In order to preserve local changes, checkouts cannot occur if local changes are present in the
                        // git environment. Checked before retrieving the PR to fail fast.
                        if (git.hasLocalChanges()) {
                            throw new UnexpectedLocalChangesError('Unable to checkout PR due to uncommitted changes.');
                        }
                        previousBranchOrRevision = git.getCurrentBranchOrRevision();
                        return [4 /*yield*/, github_1.getPr(PR_SCHEMA, prNumber, git)];
                    case 1:
                        pr = _a.sent();
                        headRefName = pr.headRef.name;
                        fullHeadRef = pr.headRef.repository.nameWithOwner + ":" + headRefName;
                        headRefUrl = github_urls_1.addTokenToGitHttpsUrl(pr.headRef.repository.url, githubToken);
                        forceWithLeaseFlag = "--force-with-lease=" + headRefName + ":" + pr.headRefOid;
                        // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
                        // be pushed up.
                        if (!pr.maintainerCanModify && !pr.viewerDidAuthor && !opts.allowIfMaintainerCannotModify) {
                            throw new MaintainerModifyAccessError('PR is not set to allow maintainers to modify the PR');
                        }
                        try {
                            // Fetch the branch at the commit of the PR, and check it out in a detached state.
                            console_1.info("Checking out PR #" + prNumber + " from " + fullHeadRef);
                            git.run(['fetch', headRefUrl, headRefName]);
                            git.run(['checkout', '--detach', 'FETCH_HEAD']);
                        }
                        catch (e) {
                            git.checkout(previousBranchOrRevision, true);
                            throw e;
                        }
                        return [2 /*return*/, {
                                /**
                                 * Pushes the current local branch to the PR on the upstream repository.
                                 *
                                 * @returns true If the command did not fail causing a GitCommandError to be thrown.
                                 * @throws GitCommandError Thrown when the push back to upstream fails.
                                 */
                                pushToUpstream: function () {
                                    git.run(['push', headRefUrl, "HEAD:" + headRefName, forceWithLeaseFlag]);
                                    return true;
                                },
                                /** Restores the state of the local repository to before the PR checkout occured. */
                                resetGitState: function () {
                                    return git.checkout(previousBranchOrRevision, true);
                                }
                            }];
                }
            });
        });
    }
    exports.checkOutPullRequestLocally = checkOutPullRequestLocally;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFFdkQsb0VBQXlDO0lBQ3pDLGtFQUEwQztJQUMxQyxnRkFBa0U7SUFDbEUsa0VBQXlDO0lBRXpDLDREQUE0RDtJQUM1RCxJQUFNLFNBQVMsR0FBRztRQUNoQixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzFCLG1CQUFtQixFQUFFLHdCQUFZLENBQUMsT0FBTztRQUN6QyxlQUFlLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3JDLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDL0IsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO0tBQ0YsQ0FBQztJQUdGO1FBQWlELHVEQUFLO1FBQ3BELHFDQUFZLENBQVM7WUFBckIsWUFDRSxrQkFBTSxDQUFDLENBQUMsU0FFVDtZQURDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNyRSxDQUFDO1FBQ0gsa0NBQUM7SUFBRCxDQUFDLEFBTEQsQ0FBaUQsS0FBSyxHQUtyRDtJQUxZLGtFQUEyQjtJQU94QztRQUFpRCx1REFBSztRQUNwRCxxQ0FBWSxDQUFTO1lBQXJCLFlBQ0Usa0JBQU0sQ0FBQyxDQUFDLFNBRVQ7WUFEQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDckUsQ0FBQztRQUNILGtDQUFDO0lBQUQsQ0FBQyxBQUxELENBQWlELEtBQUssR0FLckQ7SUFMWSxrRUFBMkI7SUFheEM7OztPQUdHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQzVDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxJQUFxQztRQUFyQyxxQkFBQSxFQUFBLFNBQXFDOzs7Ozs7d0JBRXhFLEdBQUcsR0FBRyxJQUFJLGVBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQzt3QkFFdkMsaUdBQWlHO3dCQUNqRyxrRUFBa0U7d0JBQ2xFLElBQUksR0FBRyxDQUFDLGVBQWUsRUFBRSxFQUFFOzRCQUN6QixNQUFNLElBQUksMkJBQTJCLENBQUMsbURBQW1ELENBQUMsQ0FBQzt5QkFDNUY7d0JBTUssd0JBQXdCLEdBQUcsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7d0JBRXZELHFCQUFNLGNBQUssQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxFQUFBOzt3QkFBMUMsRUFBRSxHQUFHLFNBQXFDO3dCQUUxQyxXQUFXLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7d0JBRTlCLFdBQVcsR0FBTSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLFNBQUksV0FBYSxDQUFDO3dCQUV0RSxVQUFVLEdBQUcsbUNBQXFCLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO3dCQVEzRSxrQkFBa0IsR0FBRyx3QkFBc0IsV0FBVyxTQUFJLEVBQUUsQ0FBQyxVQUFZLENBQUM7d0JBRWhGLG1GQUFtRjt3QkFDbkYsZ0JBQWdCO3dCQUNoQixJQUFJLENBQUMsRUFBRSxDQUFDLG1CQUFtQixJQUFJLENBQUMsRUFBRSxDQUFDLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRTs0QkFDekYsTUFBTSxJQUFJLDJCQUEyQixDQUFDLHFEQUFxRCxDQUFDLENBQUM7eUJBQzlGO3dCQUVELElBQUk7NEJBQ0Ysa0ZBQWtGOzRCQUNsRixjQUFJLENBQUMsc0JBQW9CLFFBQVEsY0FBUyxXQUFhLENBQUMsQ0FBQzs0QkFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDNUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQzt5QkFDakQ7d0JBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ1YsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDN0MsTUFBTSxDQUFDLENBQUM7eUJBQ1Q7d0JBRUQsc0JBQU87Z0NBQ0w7Ozs7O21DQUtHO2dDQUNILGNBQWMsRUFBRTtvQ0FDZCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFRLFdBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7b0NBQ3pFLE9BQU8sSUFBSSxDQUFDO2dDQUNkLENBQUM7Z0NBQ0Qsb0ZBQW9GO2dDQUNwRixhQUFhLEVBQUU7b0NBQ2IsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUN0RCxDQUFDOzZCQUNGLEVBQUM7Ozs7S0FDSDtJQWpFRCxnRUFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaFFMVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2FkZFRva2VuVG9HaXRIdHRwc1VybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7Z2V0UHJ9IGZyb20gJy4uLy4uL3V0aWxzL2dpdGh1Yic7XG5cbi8qIEdyYXBoUUwgc2NoZW1hIGZvciB0aGUgcmVzcG9uc2UgYm9keSBmb3IgYSBwZW5kaW5nIFBSLiAqL1xuY29uc3QgUFJfU0NIRU1BID0ge1xuICBzdGF0ZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgbWFpbnRhaW5lckNhbk1vZGlmeTogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIHZpZXdlckRpZEF1dGhvcjogZ3JhcGhRTFR5cGVzLmJvb2xlYW4sXG4gIGhlYWRSZWZPaWQ6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIGhlYWRSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbiAgYmFzZVJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxufTtcblxuXG5leHBvcnQgY2xhc3MgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobTogc3RyaW5nKSB7XG4gICAgc3VwZXIobSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbi8qKiBPcHRpb25zIGZvciBjaGVja2luZyBvdXQgYSBQUiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdENoZWNrb3V0T3B0aW9ucyB7XG4gIC8qKiBXaGV0aGVyIHRoZSBQUiBzaG91bGQgYmUgY2hlY2tlZCBvdXQgaWYgdGhlIG1haW50YWluZXIgY2Fubm90IG1vZGlmeS4gKi9cbiAgYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnk/OiBib29sZWFuO1xufVxuXG4vKipcbiAqIFJlYmFzZSB0aGUgcHJvdmlkZWQgUFIgb250byBpdHMgbWVyZ2UgdGFyZ2V0IGJyYW5jaCwgYW5kIHB1c2ggdXAgdGhlIHJlc3VsdGluZ1xuICogY29tbWl0IHRvIHRoZSBQUnMgcmVwb3NpdG9yeS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrT3V0UHVsbFJlcXVlc3RMb2NhbGx5KFxuICAgIHByTnVtYmVyOiBudW1iZXIsIGdpdGh1YlRva2VuOiBzdHJpbmcsIG9wdHM6IFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zID0ge30pIHtcbiAgLyoqIEF1dGhlbnRpY2F0ZWQgR2l0IGNsaWVudCBmb3IgZ2l0IGFuZCBHaXRodWIgaW50ZXJhY3Rpb25zLiAqL1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuKTtcblxuICAvLyBJbiBvcmRlciB0byBwcmVzZXJ2ZSBsb2NhbCBjaGFuZ2VzLCBjaGVja291dHMgY2Fubm90IG9jY3VyIGlmIGxvY2FsIGNoYW5nZXMgYXJlIHByZXNlbnQgaW4gdGhlXG4gIC8vIGdpdCBlbnZpcm9ubWVudC4gQ2hlY2tlZCBiZWZvcmUgcmV0cmlldmluZyB0aGUgUFIgdG8gZmFpbCBmYXN0LlxuICBpZiAoZ2l0Lmhhc0xvY2FsQ2hhbmdlcygpKSB7XG4gICAgdGhyb3cgbmV3IFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvcignVW5hYmxlIHRvIGNoZWNrb3V0IFBSIGR1ZSB0byB1bmNvbW1pdHRlZCBjaGFuZ2VzLicpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3IgcmV2aXNpb24gb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybWVkXG4gICAqIGFueSBHaXQgb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIFRoZSBQUiBpbmZvcm1hdGlvbiBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHIgPSBhd2FpdCBnZXRQcihQUl9TQ0hFTUEsIHByTnVtYmVyLCBnaXQpO1xuICAvKiogVGhlIGJyYW5jaCBuYW1lIG9mIHRoZSBQUiBmcm9tIHRoZSByZXBvc2l0b3J5IHRoZSBQUiBjYW1lIGZyb20uICovXG4gIGNvbnN0IGhlYWRSZWZOYW1lID0gcHIuaGVhZFJlZi5uYW1lO1xuICAvKiogVGhlIGZ1bGwgcmVmIGZvciB0aGUgcmVwb3NpdG9yeSBhbmQgYnJhbmNoIHRoZSBQUiBjYW1lIGZyb20uICovXG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7aGVhZFJlZk5hbWV9YDtcbiAgLyoqIFRoZSBmdWxsIFVSTCBwYXRoIG9mIHRoZSByZXBvc2l0b3J5IHRoZSBQUiBjYW1lIGZyb20gd2l0aCBnaXRodWIgdG9rZW4gYXMgYXV0aGVudGljYXRpb24uICovXG4gIGNvbnN0IGhlYWRSZWZVcmwgPSBhZGRUb2tlblRvR2l0SHR0cHNVcmwocHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuICAvLyBOb3RlOiBTaW5jZSB3ZSB1c2UgYSBkZXRhY2hlZCBoZWFkIGZvciByZWJhc2luZyB0aGUgUFIgYW5kIHRoZXJlZm9yZSBkbyBub3QgaGF2ZVxuICAvLyByZW1vdGUtdHJhY2tpbmcgYnJhbmNoZXMgY29uZmlndXJlZCwgd2UgbmVlZCB0byBzZXQgb3VyIGV4cGVjdGVkIHJlZiBhbmQgU0hBLiBUaGlzXG4gIC8vIGFsbG93cyB1cyB0byB1c2UgYC0tZm9yY2Utd2l0aC1sZWFzZWAgZm9yIHRoZSBkZXRhY2hlZCBoZWFkIHdoaWxlIGVuc3VyaW5nIHRoYXQgd2VcbiAgLy8gbmV2ZXIgYWNjaWRlbnRhbGx5IG92ZXJyaWRlIHVwc3RyZWFtIGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gcHVzaGVkIGluIHRoZSBtZWFud2hpbGUuXG4gIC8vIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1wdXNoI0RvY3VtZW50YXRpb24vZ2l0LXB1c2gudHh0LS0tZm9yY2Utd2l0aC1sZWFzZWx0cmVmbmFtZWd0bHRleHBlY3RndFxuICAvKiogRmxhZyBmb3IgYSBmb3JjZSBwdXNoIHdpdGggbGVhZ2UgYmFjayB0byB1cHN0cmVhbS4gKi9cbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yICYmICFvcHRzLmFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5KSB7XG4gICAgdGhyb3cgbmV3IE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvcignUFIgaXMgbm90IHNldCB0byBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgdGhlIFBSJyk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogUHVzaGVzIHRoZSBjdXJyZW50IGxvY2FsIGJyYW5jaCB0byB0aGUgUFIgb24gdGhlIHVwc3RyZWFtIHJlcG9zaXRvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIElmIHRoZSBjb21tYW5kIGRpZCBub3QgZmFpbCBjYXVzaW5nIGEgR2l0Q29tbWFuZEVycm9yIHRvIGJlIHRocm93bi5cbiAgICAgKiBAdGhyb3dzIEdpdENvbW1hbmRFcnJvciBUaHJvd24gd2hlbiB0aGUgcHVzaCBiYWNrIHRvIHVwc3RyZWFtIGZhaWxzLlxuICAgICAqL1xuICAgIHB1c2hUb1Vwc3RyZWFtOiAoKTogdHJ1ZSA9PiB7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIC8qKiBSZXN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIGxvY2FsIHJlcG9zaXRvcnkgdG8gYmVmb3JlIHRoZSBQUiBjaGVja291dCBvY2N1cmVkLiAqL1xuICAgIHJlc2V0R2l0U3RhdGU6ICgpOiBib29sZWFuID0+IHtcbiAgICAgIHJldHVybiBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB9XG4gIH07XG59XG4iXX0=