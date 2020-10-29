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
        define("@angular/dev-infra-private/pr/common/checkout-pr", ["require", "exports", "tslib", "typed-graphqlify", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/github"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkOutPullRequestLocally = exports.MaintainerModifyAccessError = exports.UnexpectedLocalChangesError = void 0;
    var tslib_1 = require("tslib");
    var typed_graphqlify_1 = require("typed-graphqlify");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
                        git = new index_1.GitClient(githubToken);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2tvdXQtcHIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvY29tbW9uL2NoZWNrb3V0LXByLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxREFBdUQ7SUFFdkQsb0VBQXlDO0lBQ3pDLGdGQUFrRTtJQUNsRSxvRUFBZ0Q7SUFDaEQsa0VBQXlDO0lBRXpDLDREQUE0RDtJQUM1RCxJQUFNLFNBQVMsR0FBRztRQUNoQixLQUFLLEVBQUUsd0JBQVksQ0FBQyxNQUFNO1FBQzFCLG1CQUFtQixFQUFFLHdCQUFZLENBQUMsT0FBTztRQUN6QyxlQUFlLEVBQUUsd0JBQVksQ0FBQyxPQUFPO1FBQ3JDLFVBQVUsRUFBRSx3QkFBWSxDQUFDLE1BQU07UUFDL0IsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO1FBQ0QsT0FBTyxFQUFFO1lBQ1AsSUFBSSxFQUFFLHdCQUFZLENBQUMsTUFBTTtZQUN6QixVQUFVLEVBQUU7Z0JBQ1YsR0FBRyxFQUFFLHdCQUFZLENBQUMsTUFBTTtnQkFDeEIsYUFBYSxFQUFFLHdCQUFZLENBQUMsTUFBTTthQUNuQztTQUNGO0tBQ0YsQ0FBQztJQUdGO1FBQWlELHVEQUFLO1FBQ3BELHFDQUFZLENBQVM7WUFBckIsWUFDRSxrQkFBTSxDQUFDLENBQUMsU0FFVDtZQURDLE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUNyRSxDQUFDO1FBQ0gsa0NBQUM7SUFBRCxDQUFDLEFBTEQsQ0FBaUQsS0FBSyxHQUtyRDtJQUxZLGtFQUEyQjtJQU94QztRQUFpRCx1REFBSztRQUNwRCxxQ0FBWSxDQUFTO1lBQXJCLFlBQ0Usa0JBQU0sQ0FBQyxDQUFDLFNBRVQ7WUFEQyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSwyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDckUsQ0FBQztRQUNILGtDQUFDO0lBQUQsQ0FBQyxBQUxELENBQWlELEtBQUssR0FLckQ7SUFMWSxrRUFBMkI7SUFheEM7OztPQUdHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQzVDLFFBQWdCLEVBQUUsV0FBbUIsRUFBRSxJQUFxQztRQUFyQyxxQkFBQSxFQUFBLFNBQXFDOzs7Ozs7d0JBRXhFLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7d0JBRXZDLGlHQUFpRzt3QkFDakcsa0VBQWtFO3dCQUNsRSxJQUFJLEdBQUcsQ0FBQyxlQUFlLEVBQUUsRUFBRTs0QkFDekIsTUFBTSxJQUFJLDJCQUEyQixDQUFDLG1EQUFtRCxDQUFDLENBQUM7eUJBQzVGO3dCQU1LLHdCQUF3QixHQUFHLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO3dCQUV2RCxxQkFBTSxjQUFLLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBQTs7d0JBQTFDLEVBQUUsR0FBRyxTQUFxQzt3QkFFMUMsV0FBVyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO3dCQUU5QixXQUFXLEdBQU0sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsYUFBYSxTQUFJLFdBQWEsQ0FBQzt3QkFFdEUsVUFBVSxHQUFHLG1DQUFxQixDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQzt3QkFRM0Usa0JBQWtCLEdBQUcsd0JBQXNCLFdBQVcsU0FBSSxFQUFFLENBQUMsVUFBWSxDQUFDO3dCQUVoRixtRkFBbUY7d0JBQ25GLGdCQUFnQjt3QkFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEVBQUU7NEJBQ3pGLE1BQU0sSUFBSSwyQkFBMkIsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO3lCQUM5Rjt3QkFFRCxJQUFJOzRCQUNGLGtGQUFrRjs0QkFDbEYsY0FBSSxDQUFDLHNCQUFvQixRQUFRLGNBQVMsV0FBYSxDQUFDLENBQUM7NEJBQ3pELEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7NEJBQzVDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUM7eUJBQ2pEO3dCQUFDLE9BQU8sQ0FBQyxFQUFFOzRCQUNWLEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7NEJBQzdDLE1BQU0sQ0FBQyxDQUFDO3lCQUNUO3dCQUVELHNCQUFPO2dDQUNMOzs7OzttQ0FLRztnQ0FDSCxjQUFjLEVBQUU7b0NBQ2QsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBUSxXQUFhLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO29DQUN6RSxPQUFPLElBQUksQ0FBQztnQ0FDZCxDQUFDO2dDQUNELG9GQUFvRjtnQ0FDcEYsYUFBYSxFQUFFO29DQUNiLE9BQU8sR0FBRyxDQUFDLFFBQVEsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDdEQsQ0FBQzs2QkFDRixFQUFDOzs7O0tBQ0g7SUFqRUQsZ0VBaUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7dHlwZXMgYXMgZ3JhcGhRTFR5cGVzfSBmcm9tICd0eXBlZC1ncmFwaHFsaWZ5JztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2dldFByfSBmcm9tICcuLi8uLi91dGlscy9naXRodWInO1xuXG4vKiBHcmFwaFFMIHNjaGVtYSBmb3IgdGhlIHJlc3BvbnNlIGJvZHkgZm9yIGEgcGVuZGluZyBQUi4gKi9cbmNvbnN0IFBSX1NDSEVNQSA9IHtcbiAgc3RhdGU6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gIG1haW50YWluZXJDYW5Nb2RpZnk6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICB2aWV3ZXJEaWRBdXRob3I6IGdyYXBoUUxUeXBlcy5ib29sZWFuLFxuICBoZWFkUmVmT2lkOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICBoZWFkUmVmOiB7XG4gICAgbmFtZTogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICByZXBvc2l0b3J5OiB7XG4gICAgICB1cmw6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgICBuYW1lV2l0aE93bmVyOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIH0sXG4gIH0sXG4gIGJhc2VSZWY6IHtcbiAgICBuYW1lOiBncmFwaFFMVHlwZXMuc3RyaW5nLFxuICAgIHJlcG9zaXRvcnk6IHtcbiAgICAgIHVybDogZ3JhcGhRTFR5cGVzLnN0cmluZyxcbiAgICAgIG5hbWVXaXRoT3duZXI6IGdyYXBoUUxUeXBlcy5zdHJpbmcsXG4gICAgfSxcbiAgfSxcbn07XG5cblxuZXhwb3J0IGNsYXNzIFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobTogc3RyaW5nKSB7XG4gICAgc3VwZXIobSk7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFVuZXhwZWN0ZWRMb2NhbENoYW5nZXNFcnJvci5wcm90b3R5cGUpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKG06IHN0cmluZykge1xuICAgIHN1cGVyKG0pO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IucHJvdG90eXBlKTtcbiAgfVxufVxuXG4vKiogT3B0aW9ucyBmb3IgY2hlY2tpbmcgb3V0IGEgUFIgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3RDaGVja291dE9wdGlvbnMge1xuICAvKiogV2hldGhlciB0aGUgUFIgc2hvdWxkIGJlIGNoZWNrZWQgb3V0IGlmIHRoZSBtYWludGFpbmVyIGNhbm5vdCBtb2RpZnkuICovXG4gIGFsbG93SWZNYWludGFpbmVyQ2Fubm90TW9kaWZ5PzogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBSZWJhc2UgdGhlIHByb3ZpZGVkIFBSIG9udG8gaXRzIG1lcmdlIHRhcmdldCBicmFuY2gsIGFuZCBwdXNoIHVwIHRoZSByZXN1bHRpbmdcbiAqIGNvbW1pdCB0byB0aGUgUFJzIHJlcG9zaXRvcnkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja091dFB1bGxSZXF1ZXN0TG9jYWxseShcbiAgICBwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nLCBvcHRzOiBQdWxsUmVxdWVzdENoZWNrb3V0T3B0aW9ucyA9IHt9KSB7XG4gIC8qKiBBdXRoZW50aWNhdGVkIEdpdCBjbGllbnQgZm9yIGdpdCBhbmQgR2l0aHViIGludGVyYWN0aW9ucy4gKi9cbiAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbik7XG5cbiAgLy8gSW4gb3JkZXIgdG8gcHJlc2VydmUgbG9jYWwgY2hhbmdlcywgY2hlY2tvdXRzIGNhbm5vdCBvY2N1ciBpZiBsb2NhbCBjaGFuZ2VzIGFyZSBwcmVzZW50IGluIHRoZVxuICAvLyBnaXQgZW52aXJvbm1lbnQuIENoZWNrZWQgYmVmb3JlIHJldHJpZXZpbmcgdGhlIFBSIHRvIGZhaWwgZmFzdC5cbiAgaWYgKGdpdC5oYXNMb2NhbENoYW5nZXMoKSkge1xuICAgIHRocm93IG5ldyBVbmV4cGVjdGVkTG9jYWxDaGFuZ2VzRXJyb3IoJ1VuYWJsZSB0byBjaGVja291dCBQUiBkdWUgdG8gdW5jb21taXR0ZWQgY2hhbmdlcy4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgYnJhbmNoIG9yIHJldmlzaW9uIG9yaWdpbmFsbHkgY2hlY2tlZCBvdXQgYmVmb3JlIHRoaXMgbWV0aG9kIHBlcmZvcm1lZFxuICAgKiBhbnkgR2l0IG9wZXJhdGlvbnMgdGhhdCBtYXkgY2hhbmdlIHRoZSB3b3JraW5nIGJyYW5jaC5cbiAgICovXG4gIGNvbnN0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiA9IGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAvKiBUaGUgUFIgaW5mb3JtYXRpb24gZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByID0gYXdhaXQgZ2V0UHIoUFJfU0NIRU1BLCBwck51bWJlciwgZ2l0KTtcbiAgLyoqIFRoZSBicmFuY2ggbmFtZSBvZiB0aGUgUFIgZnJvbSB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgLyoqIFRoZSBmdWxsIHJlZiBmb3IgdGhlIHJlcG9zaXRvcnkgYW5kIGJyYW5jaCB0aGUgUFIgY2FtZSBmcm9tLiAqL1xuICBjb25zdCBmdWxsSGVhZFJlZiA9IGAke3ByLmhlYWRSZWYucmVwb3NpdG9yeS5uYW1lV2l0aE93bmVyfToke2hlYWRSZWZOYW1lfWA7XG4gIC8qKiBUaGUgZnVsbCBVUkwgcGF0aCBvZiB0aGUgcmVwb3NpdG9yeSB0aGUgUFIgY2FtZSBmcm9tIHdpdGggZ2l0aHViIHRva2VuIGFzIGF1dGhlbnRpY2F0aW9uLiAqL1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgLyoqIEZsYWcgZm9yIGEgZm9yY2UgcHVzaCB3aXRoIGxlYWdlIGJhY2sgdG8gdXBzdHJlYW0uICovXG4gIGNvbnN0IGZvcmNlV2l0aExlYXNlRmxhZyA9IGAtLWZvcmNlLXdpdGgtbGVhc2U9JHtoZWFkUmVmTmFtZX06JHtwci5oZWFkUmVmT2lkfWA7XG5cbiAgLy8gSWYgdGhlIFBSIGRvZXMgbm90IGFsbG93IG1haW50YWluZXJzIHRvIG1vZGlmeSBpdCwgZXhpdCBhcyB0aGUgcmViYXNlZCBQUiBjYW5ub3RcbiAgLy8gYmUgcHVzaGVkIHVwLlxuICBpZiAoIXByLm1haW50YWluZXJDYW5Nb2RpZnkgJiYgIXByLnZpZXdlckRpZEF1dGhvciAmJiAhb3B0cy5hbGxvd0lmTWFpbnRhaW5lckNhbm5vdE1vZGlmeSkge1xuICAgIHRocm93IG5ldyBNYWludGFpbmVyTW9kaWZ5QWNjZXNzRXJyb3IoJ1BSIGlzIG5vdCBzZXQgdG8gYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IHRoZSBQUicpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgaGVhZFJlZlVybCwgaGVhZFJlZk5hbWVdKTtcbiAgICBnaXQucnVuKFsnY2hlY2tvdXQnLCAnLS1kZXRhY2gnLCAnRkVUQ0hfSEVBRCddKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGdpdC5jaGVja291dChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIHRocm93IGU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8qKlxuICAgICAqIFB1c2hlcyB0aGUgY3VycmVudCBsb2NhbCBicmFuY2ggdG8gdGhlIFBSIG9uIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5LlxuICAgICAqXG4gICAgICogQHJldHVybnMgdHJ1ZSBJZiB0aGUgY29tbWFuZCBkaWQgbm90IGZhaWwgY2F1c2luZyBhIEdpdENvbW1hbmRFcnJvciB0byBiZSB0aHJvd24uXG4gICAgICogQHRocm93cyBHaXRDb21tYW5kRXJyb3IgVGhyb3duIHdoZW4gdGhlIHB1c2ggYmFjayB0byB1cHN0cmVhbSBmYWlscy5cbiAgICAgKi9cbiAgICBwdXNoVG9VcHN0cmVhbTogKCk6IHRydWUgPT4ge1xuICAgICAgZ2l0LnJ1bihbJ3B1c2gnLCBoZWFkUmVmVXJsLCBgSEVBRDoke2hlYWRSZWZOYW1lfWAsIGZvcmNlV2l0aExlYXNlRmxhZ10pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICAvKiogUmVzdG9yZXMgdGhlIHN0YXRlIG9mIHRoZSBsb2NhbCByZXBvc2l0b3J5IHRvIGJlZm9yZSB0aGUgUFIgY2hlY2tvdXQgb2NjdXJlZC4gKi9cbiAgICByZXNldEdpdFN0YXRlOiAoKTogYm9vbGVhbiA9PiB7XG4gICAgICByZXR1cm4gZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgfVxuICB9O1xufVxuIl19