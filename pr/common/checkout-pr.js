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
        define("@angular/dev-infra-private/pr/common/checkout-pr", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/authenticated-git-client", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.UnexpectedLocalChangesError = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var github_1 = require("@angular/dev-infra-private/utils/github");
    /* Graphql schema for the response body for a pending PR. */
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
                        git = authenticated_git_client_1.AuthenticatedGitClient.get();
                        // In order to preserve local changes, checkouts cannot occur if local changes are present in the
                        // git environment. Checked before retrieving the PR to fail fast.
                        if (git.hasUncommittedChanges()) {
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
                            git.run(['fetch', '-q', headRefUrl, headRefName]);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFFdkQsb0VBQXlDO0lBQ3pDLDBHQUFnRjtJQUNoRixnRkFBa0U7SUFDbEUsa0VBQXlDO0lBRXpDLDREQUE0RDtJQUM1RCxJQUFNLFNBQVMsR0FBRztRQUNoQixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzFCLG1CQUFtQixFQUFFLHdCQUFZLENBQUMsT0FBTztRQUN6QyxlQUFlLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3JDLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDL0IsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO0tBQ0YsQ0FBQztJQUdGO1FBQWlELHVEQUFLO1FBQ3BELHFDQUFZLENBQVM7WUFBckIsWUFDRSxrQkFBTSxDQUFDLENBQUMsU0FFVDtZQURDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNyRSxDQUFDO1FBQ0gsa0NBQUM7SUFBRCxDQUFDLEFBTEQsQ0FBaUQsS0FBSyxHQUtyRDtJQUxZLGtFQUEyQjtJQU94QztRQUFpRCx1REFBSztRQUNwRCxxQ0FBWSxDQUFTO1lBQXJCLFlBQ0Usa0JBQU0sQ0FBQyxDQUFDLFNBRVQ7WUFEQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDckUsQ0FBQztRQUNILGtDQUFDO0lBQUQsQ0FBQyxBQUxELENBQWlELEtBQUssR0FLckQ7SUFMWSxrRUFBMkI7SUFheEM7OztPQUdHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQzVDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxJQUFxQztRQUFyQyxxQkFBQSxFQUFBLFNBQXFDOzs7Ozs7d0JBRXhFLEdBQUcsR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt3QkFFekMsaUdBQWlHO3dCQUNqRyxrRUFBa0U7d0JBQ2xFLElBQUksR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7NEJBQy9CLE1BQU0sSUFBSSwyQkFBMkIsQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO3lCQUM1Rjt3QkFNSyx3QkFBd0IsR0FBRyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQzt3QkFFdkQscUJBQU0sY0FBSyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLEVBQUE7O3dCQUExQyxFQUFFLEdBQUcsU0FBcUM7d0JBRTFDLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzt3QkFFOUIsV0FBVyxHQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsU0FBSSxXQUFhLENBQUM7d0JBRXRFLFVBQVUsR0FBRyxtQ0FBcUIsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBUTNFLGtCQUFrQixHQUFHLHdCQUFzQixXQUFXLFNBQUksRUFBRSxDQUFDLFVBQVksQ0FBQzt3QkFFaEYsbUZBQW1GO3dCQUNuRixnQkFBZ0I7d0JBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLElBQUksQ0FBQyxFQUFFLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLDZCQUE2QixFQUFFOzRCQUN6RixNQUFNLElBQUksMkJBQTJCLENBQUMscURBQXFELENBQUMsQ0FBQzt5QkFDOUY7d0JBRUQsSUFBSTs0QkFDRixrRkFBa0Y7NEJBQ2xGLGNBQUksQ0FBQyxzQkFBb0IsUUFBUSxjQUFTLFdBQWEsQ0FBQyxDQUFDOzRCQUN6RCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzs0QkFDbEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQzt5QkFDakQ7d0JBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ1YsR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDN0MsTUFBTSxDQUFDLENBQUM7eUJBQ1Q7d0JBRUQsc0JBQU87Z0NBQ0w7Ozs7O21DQUtHO2dDQUNILGNBQWMsRUFBRTtvQ0FDZCxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxVQUFRLFdBQWEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7b0NBQ3pFLE9BQU8sSUFBSSxDQUFDO2dDQUNkLENBQUM7Z0NBQ0Qsb0ZBQW9GO2dDQUNwRixhQUFhLEVBQUU7b0NBQ2IsT0FBTyxHQUFHLENBQUMsUUFBUSxDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUN0RCxDQUFDOzZCQUNGLEVBQUM7Ozs7S0FDSDtJQWpFRCxnRUFpRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt0eXBlcyBhcyBncmFwaHFsVHlwZXN9IGZyb20gJ3R5cGVkLWdyYXBocWxpZnknO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtnZXRQcn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0aHViJztcblxuLyogR3JhcGhxbCBzY2hlbWEgZm9yIHRoZSByZXNwb25zZSBib2R5IGZvciBhIHBlbmRpbmcgUFIuICovXG5jb25zdCBQUl9TQ0hFTUEgPSB7XG4gIHN0YXRlOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICBtYWludGFpbmVyQ2FuTW9kaWZ5OiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgdmlld2VyRGlkQXV0aG9yOiBncmFwaHFsVHlwZXMuYm9vbGVhbixcbiAgaGVhZFJlZk9pZDogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgaGVhZFJlZjoge1xuICAgIG5hbWU6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgcmVwb3NpdG9yeToge1xuICAgICAgdXJsOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgICAgbmFtZVdpdGhPd25lcjogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICB9LFxuICB9LFxuICBiYXNlUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhxbFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBocWxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaHFsVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG59O1xuXG5cbmV4cG9ydCBjbGFzcyBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuICAgIHN1cGVyKG0pO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtOiBzdHJpbmcpIHtcbiAgICBzdXBlcihtKTtcbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cblxuLyoqIE9wdGlvbnMgZm9yIGNoZWNraW5nIG91dCBhIFBSICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0Q2hlY2tvdXRPcHRpb25zIHtcbiAgLyoqIFdoZXRoZXIgdGhlIFBSIHNob3VsZCBiZSBjaGVja2VkIG91dCBpZiB0aGUgbWFpbnRhaW5lciBjYW5ub3QgbW9kaWZ5LiAqL1xuICBhbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeT86IGJvb2xlYW47XG59XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tPdXRQdWxsUmVxdWVzdExvY2FsbHkoXG4gICAgcHJOdW1iZXI6IG51bWJlciwgZ2l0aHViVG9rZW46IHN0cmluZywgb3B0czogUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMgPSB7fSkge1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgYXV0aGVudGljYXRlZCBnaXQgY2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LmdldCgpO1xuXG4gIC8vIEluIG9yZGVyIHRvIHByZXNlcnZlIGxvY2FsIGNoYW5nZXMsIGNoZWNrb3V0cyBjYW5ub3Qgb2NjdXIgaWYgbG9jYWwgY2hhbmdlcyBhcmUgcHJlc2VudCBpbiB0aGVcbiAgLy8gZ2l0IGVudmlyb25tZW50LiBDaGVja2VkIGJlZm9yZSByZXRyaWV2aW5nIHRoZSBQUiB0byBmYWlsIGZhc3QuXG4gIGlmIChnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICB0aHJvdyBuZXcgVW5leHBlY3RlZExvY2FsQ2hhbmdlc0Vycm9yKCdVbmFibGUgdG8gY2hlY2tvdXQgUFIgZHVlIHRvIHVuY29tbWl0dGVkIGNoYW5nZXMuJyk7XG4gIH1cblxuICAvKipcbiAgICogVGhlIGJyYW5jaCBvciByZXZpc2lvbiBvcmlnaW5hbGx5IGNoZWNrZWQgb3V0IGJlZm9yZSB0aGlzIG1ldGhvZCBwZXJmb3JtZWRcbiAgICogYW55IEdpdCBvcGVyYXRpb25zIHRoYXQgbWF5IGNoYW5nZSB0aGUgd29ya2luZyBicmFuY2guXG4gICAqL1xuICBjb25zdCBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgLyogVGhlIFBSIGluZm9ybWF0aW9uIGZyb20gR2l0aHViLiAqL1xuICBjb25zdCBwciA9IGF3YWl0IGdldFByKFBSX1NDSEVNQSwgcHJOdW1iZXIsIGdpdCk7XG4gIC8qKiBUaGUgYnJhbmNoIG5hbWUgb2YgdGhlIFBSIGZyb20gdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgaGVhZFJlZk5hbWUgPSBwci5oZWFkUmVmLm5hbWU7XG4gIC8qKiBUaGUgZnVsbCByZWYgZm9yIHRoZSByZXBvc2l0b3J5IGFuZCBicmFuY2ggdGhlIFBSIGNhbWUgZnJvbS4gKi9cbiAgY29uc3QgZnVsbEhlYWRSZWYgPSBgJHtwci5oZWFkUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtoZWFkUmVmTmFtZX1gO1xuICAvKiogVGhlIGZ1bGwgVVJMIHBhdGggb2YgdGhlIHJlcG9zaXRvcnkgdGhlIFBSIGNhbWUgZnJvbSB3aXRoIGdpdGh1YiB0b2tlbiBhcyBhdXRoZW50aWNhdGlvbi4gKi9cbiAgY29uc3QgaGVhZFJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5oZWFkUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG4gIC8vIE5vdGU6IFNpbmNlIHdlIHVzZSBhIGRldGFjaGVkIGhlYWQgZm9yIHJlYmFzaW5nIHRoZSBQUiBhbmQgdGhlcmVmb3JlIGRvIG5vdCBoYXZlXG4gIC8vIHJlbW90ZS10cmFja2luZyBicmFuY2hlcyBjb25maWd1cmVkLCB3ZSBuZWVkIHRvIHNldCBvdXIgZXhwZWN0ZWQgcmVmIGFuZCBTSEEuIFRoaXNcbiAgLy8gYWxsb3dzIHVzIHRvIHVzZSBgLS1mb3JjZS13aXRoLWxlYXNlYCBmb3IgdGhlIGRldGFjaGVkIGhlYWQgd2hpbGUgZW5zdXJpbmcgdGhhdCB3ZVxuICAvLyBuZXZlciBhY2NpZGVudGFsbHkgb3ZlcnJpZGUgdXBzdHJlYW0gY2hhbmdlcyB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgaW4gdGhlIG1lYW53aGlsZS5cbiAgLy8gU2VlOlxuICAvLyBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0LXB1c2gjRG9jdW1lbnRhdGlvbi9naXQtcHVzaC50eHQtLS1mb3JjZS13aXRoLWxlYXNlbHRyZWZuYW1lZ3RsdGV4cGVjdGd0XG4gIC8qKiBGbGFnIGZvciBhIGZvcmNlIHB1c2ggd2l0aCBsZWFnZSBiYWNrIHRvIHVwc3RyZWFtLiAqL1xuICBjb25zdCBmb3JjZVdpdGhMZWFzZUZsYWcgPSBgLS1mb3JjZS13aXRoLWxlYXNlPSR7aGVhZFJlZk5hbWV9OiR7cHIuaGVhZFJlZk9pZH1gO1xuXG4gIC8vIElmIHRoZSBQUiBkb2VzIG5vdCBhbGxvdyBtYWludGFpbmVycyB0byBtb2RpZnkgaXQsIGV4aXQgYXMgdGhlIHJlYmFzZWQgUFIgY2Fubm90XG4gIC8vIGJlIHB1c2hlZCB1cC5cbiAgaWYgKCFwci5tYWludGFpbmVyQ2FuTW9kaWZ5ICYmICFwci52aWV3ZXJEaWRBdXRob3IgJiYgIW9wdHMuYWxsb3dJZk1haW50YWluZXJDYW5ub3RNb2RpZnkpIHtcbiAgICB0aHJvdyBuZXcgTWFpbnRhaW5lck1vZGlmeUFjY2Vzc0Vycm9yKCdQUiBpcyBub3Qgc2V0IHRvIGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSB0aGUgUFInKTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gRmV0Y2ggdGhlIGJyYW5jaCBhdCB0aGUgY29tbWl0IG9mIHRoZSBQUiwgYW5kIGNoZWNrIGl0IG91dCBpbiBhIGRldGFjaGVkIHN0YXRlLlxuICAgIGluZm8oYENoZWNraW5nIG91dCBQUiAjJHtwck51bWJlcn0gZnJvbSAke2Z1bGxIZWFkUmVmfWApO1xuICAgIGdpdC5ydW4oWydmZXRjaCcsICctcScsIGhlYWRSZWZVcmwsIGhlYWRSZWZOYW1lXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvKipcbiAgICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgbG9jYWwgYnJhbmNoIHRvIHRoZSBQUiBvbiB0aGUgdXBzdHJlYW0gcmVwb3NpdG9yeS5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHRydWUgSWYgdGhlIGNvbW1hbmQgZGlkIG5vdCBmYWlsIGNhdXNpbmcgYSBHaXRDb21tYW5kRXJyb3IgdG8gYmUgdGhyb3duLlxuICAgICAqIEB0aHJvd3MgR2l0Q29tbWFuZEVycm9yIFRocm93biB3aGVuIHRoZSBwdXNoIGJhY2sgdG8gdXBzdHJlYW0gZmFpbHMuXG4gICAgICovXG4gICAgcHVzaFRvVXBzdHJlYW06ICgpOiB0cnVlID0+IHtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgLyoqIFJlc3RvcmVzIHRoZSBzdGF0ZSBvZiB0aGUgbG9jYWwgcmVwb3NpdG9yeSB0byBiZWZvcmUgdGhlIFBSIGNoZWNrb3V0IG9jY3VyZWQuICovXG4gICAgcmVzZXRHaXRTdGF0ZTogKCk6IGJvb2xlYW4gPT4ge1xuICAgICAgcmV0dXJuIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIH1cbiAgfTtcbn1cbiJdfQ==