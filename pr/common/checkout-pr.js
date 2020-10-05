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
        define("@angular/dev-infra-private/pr/common/checkout-pr", ["require", "exports", "tslib", "typed-graphqlify", "url", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.UnexpectedLocalChangesError = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var url_1 = require("url");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
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
                        headRefUrl = addAuthenticationToUrl(pr.headRef.repository.url, githubToken);
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
    /** Adds the provided token as username to the provided url. */
    function addAuthenticationToUrl(urlString, token) {
        var url = new url_1.URL(urlString);
        url.username = token;
        return url.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFDdkQsMkJBQXdCO0lBRXhCLG9FQUF5QztJQUN6QyxrRUFBMEM7SUFDMUMsa0VBQXlDO0lBRXpDLDREQUE0RDtJQUM1RCxJQUFNLFNBQVMsR0FBRztRQUNoQixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzFCLG1CQUFtQixFQUFFLHdCQUFZLENBQUMsT0FBTztRQUN6QyxlQUFlLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3JDLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDL0IsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO0tBQ0YsQ0FBQztJQUdGO1FBQWlELHVEQUFLO1FBQ3BELHFDQUFZLENBQVM7WUFBckIsWUFDRSxrQkFBTSxDQUFDLENBQUMsU0FFVDtZQURDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNyRSxDQUFDO1FBQ0gsa0NBQUM7SUFBRCxDQUFDLEFBTEQsQ0FBaUQsS0FBSyxHQUtyRDtJQUxZLGtFQUEyQjtJQU94QztRQUFpRCx1REFBSztR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dXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3R5cGVzIGFzIGdyYXBoUUxUeXBlc30gZnJvbSAndHlwZWQtZ3JhcGhxbGlmeSc7XG5pbXBvcnQge1VSTH0gZnJvbSAndXJsJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyogR3JhcGhRTCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBhIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHN0YXRlOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaFFMVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaFFMVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuICAgIHN1cGVyKG0pO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIE9wdGlvbnMgZm9yIGNoZWNraW5nIG91dCBhIFBSICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIHNob3VsZCBiZSBjaGVja2VkIG91dCBpZiB0aGUgbWFpbnRhaW5lciBjYW5ub3QgbW9kaWZ5LiAqL1xuICBhbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tPdXRQdWxsUmVxdWVzdExvY2FsbHkoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgb3B0czogUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMgPSB7fSkge1xuICAvKiogQXV0aGVudGljYXRlZCBHaXQgY2xpZW50IGZvciBnaXQgYW5kIEdpdGh1YiBpbnRlcmFjdGlvbnMuICovXG4gIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQoZ2l0aHViVG9rZW4pO1xuXG4gIC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIGxvY2FsIGNoYW5nZXMsIGNoZWNrb3V0cyBjYW5ub3Qgb2NjdXIgaWYgbG9jYWwgY2hhbmdlcyBhcmUgcHJlc2VudCBpbiB0aGVcbiAgLy8gZ2l0IGVudmlyb25tZW50LiBDaGVja2VkIGJlZm9yZSByZXRyaWV2aW5nIHRoZSBQUiB0byBmYWlsIGZhc3QuXG4gIGlmIChnaXQuaGFzTG9jYWxDaGFuZ2VzKCkpIHtcbiAgICB0aHJvdyBuZXcgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yKCdVbmFibGUgdG8gY2hlY2tvdXQgUFIgZHVlIHRvIHVuY29tbWl0dGVkIGNoYW5nZXMuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogVGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gIC8qKiBUaGUgYnJhbmNoIG5hbWUgb2YgdGhlIFBSIGZyb20gdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIC8qKiBUaGUgZnVsbCByZWYgZm9yIHRoZSByZXBvc2l0b3J5IGFuZCBicmFuY2ggdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICAvKiogVGhlIGZ1bGwgVVJMIHBhdGggb2YgdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbSB3aXRoIGdpdGh1YiB0b2tlbiBhcyBhdXRoZW50aWNhdGlvbi4gKi9cbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZEF1dGhlbnRpY2F0aW9uVG9VcmwocHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybCwgZ2l0aHViVG9rZW4pO1xuICAvLyBOb3RlOiBTaW5jZSB3ZSB1c2UgYSBkZXRhY2hlZCBoZWFkIGZvciByZWJhc2luZyB0aGUgUFIgYW5kIHRoZXJlZm9yZSBkbyBub3QgaGF2ZVxuICAvLyByZW1vdGUtdHJhY2tpbmcgYnJhbmNoZXMgY29uZmlndXJlZCwgd2UgbmVlZCB0byBzZXQgb3VyIGV4cGVjdGVkIHJlZiBhbmQgU0hBLiBUaGlzXG4gIC8vIGFsbG93cyB1cyB0byB1c2UgYC0tZm9yY2Utd2l0aC1sZWFzZWAgZm9yIHRoZSBkZXRhY2hlZCBoZWFkIHdoaWxlIGVuc3VyaW5nIHRoYXQgd2VcbiAgLy8gbmV2ZXIgYWNjaWRlbnRhbGx5IG92ZXJyaWRlIHVwc3RyZWFtIGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gcHVzaGVkIGluIHRoZSBtZWFud2hpbGUuXG4gIC8vIFNlZTpcbiAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1wdXNoI0RvY3VtZW50YXRpb24vZ2l0LXB1c2gudHh0LS0tZm9yY2Utd2l0aC1sZWFzZWx0cmVmbmFtZWd0bHRleHBlY3RndFxuICAvKiogRmxhZyBmb3IgYSBmb3JjZSBwdXNoIHdpdGggbGVhZ2UgYmFjayB0byB1cHN0cmVhbS4gKi9cbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yICYmICFvcHRzLmFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5KSB7XG4gICAgdGhyb3cgbmV3IE1haW50YWluZXJNb2RpZnlBY2Nlc3NFcnJvcignUFIgaXMgbm90IHNldCB0byBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgdGhlIFBSJyk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoIHRoZSBicmFuY2ggYXQgdGhlIGNvbW1pdCBvZiB0aGUgUFIsIGFuZCBjaGVjayBpdCBvdXQgaW4gYSBkZXRhY2hlZCBzdGF0ZS5cbiAgICBpbmZvKGBDaGVja2luZyBvdXQgUFIgIyR7cHJOdW1iZXJ9IGZyb20gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICBnaXQucnVuKFsnZmV0Y2gnLCBoZWFkUmVmVXJsLCBoZWFkUmVmTmFtZV0pO1xuICAgIGdpdC5ydW4oWydjaGVja291dCcsICctLWRldGFjaCcsICdGRVRDSF9IRUFEJ10pO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLyoqXG4gICAgICogUHVzaGVzIHRoZSBjdXJyZW50IGxvY2FsIGJyYW5jaCB0byB0aGUgUFIgb24gdGhlIHVwc3RyZWFtIHJlcG9zaXRvcnkuXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB0cnVlIElmIHRoZSBjb21tYW5kIGRpZCBub3QgZmFpbCBjYXVzaW5nIGEgR2l0Q29tbWFuZEVycm9yIHRvIGJlIHRocm93bi5cbiAgICAgKiBAdGhyb3dzIEdpdENvbW1hbmRFcnJvciBUaHJvd24gd2hlbiB0aGUgcHVzaCBiYWNrIHRvIHVwc3RyZWFtIGZhaWxzLlxuICAgICAqL1xuICAgIHB1c2hUb1Vwc3RyZWFtOiAoKTogdHJ1ZSA9PiB7XG4gICAgICBnaXQucnVuKFsncHVzaCcsIGhlYWRSZWZVcmwsIGBIRUFEOiR7aGVhZFJlZk5hbWV9YCwgZm9yY2VXaXRoTGVhc2VGbGFnXSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIC8qKiBSZXN0b3JlcyB0aGUgc3RhdGUgb2YgdGhlIGxvY2FsIHJlcG9zaXRvcnkgdG8gYmVmb3JlIHRoZSBQUiBjaGVja291dCBvY2N1cmVkLiAqL1xuICAgIHJlc2V0R2l0U3RhdGU6ICgpOiBib29sZWFuID0+IHtcbiAgICAgIHJldHVybiBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKiBBZGRzIHRoZSBwcm92aWRlZCB0b2tlbiBhcyB1c2VybmFtZSB0byB0aGUgcHJvdmlkZWQgdXJsLiAqL1xuZnVuY3Rpb24gYWRkQXV0aGVudGljYXRpb25Ub1VybCh1cmxTdHJpbmc6IHN0cmluZywgdG9rZW46IHN0cmluZykge1xuICBjb25zdCB1cmwgPSBuZXcgVVJMKHVybFN0cmluZyk7XG4gIHVybC51c2VybmFtZSA9IHRva2VuO1xuICByZXR1cm4gdXJsLnRvU3RyaW5nKCk7XG59XG4iXX0=