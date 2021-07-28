/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __awaiter, __generator } from "tslib";
import { promptConfirm } from '../../utils/console';
import { GitCommandError } from '../../utils/git/git-client';
import { PullRequestFailure } from './failures';
import { getCaretakerNotePromptMessage, getTargettedBranchesConfirmationPromptMessage } from './messages';
import { isPullRequest, loadAndValidatePullRequest, } from './pull-request';
import { GithubApiMergeStrategy } from './strategies/api-merge';
import { AutosquashMergeStrategy } from './strategies/autosquash-merge';
var defaultPullRequestMergeTaskFlags = {
    branchPrompt: true,
};
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
var PullRequestMergeTask = /** @class */ (function () {
    function PullRequestMergeTask(config, git, flags) {
        this.config = config;
        this.git = git;
        // Update flags property with the provided flags values as patches to the default flag values.
        this.flags = __assign(__assign({}, defaultPullRequestMergeTaskFlags), flags);
    }
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    PullRequestMergeTask.prototype.merge = function (prNumber, force) {
        if (force === void 0) { force = false; }
        return __awaiter(this, void 0, void 0, function () {
            var hasOauthScopes, pullRequest, _a, _b, strategy, previousBranchOrRevision, failure, e_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.git.hasOauthScopes(function (scopes, missing) {
                            if (!scopes.includes('repo')) {
                                if (_this.config.remote.private) {
                                    missing.push('repo');
                                }
                                else if (!scopes.includes('public_repo')) {
                                    missing.push('public_repo');
                                }
                            }
                            // Pull requests can modify Github action workflow files. In such cases Github requires us to
                            // push with a token that has the `workflow` oauth scope set. To avoid errors when the
                            // caretaker intends to merge such PRs, we ensure the scope is always set on the token before
                            // the merge process starts.
                            // https://docs.github.com/en/developers/apps/scopes-for-oauth-apps#available-scopes
                            if (!scopes.includes('workflow')) {
                                missing.push('workflow');
                            }
                        })];
                    case 1:
                        hasOauthScopes = _c.sent();
                        if (hasOauthScopes !== true) {
                            return [2 /*return*/, {
                                    status: 5 /* GITHUB_ERROR */,
                                    failure: PullRequestFailure.insufficientPermissionsToMerge(hasOauthScopes.error)
                                }];
                        }
                        if (this.git.hasUncommittedChanges()) {
                            return [2 /*return*/, { status: 1 /* DIRTY_WORKING_DIR */ }];
                        }
                        return [4 /*yield*/, loadAndValidatePullRequest(this, prNumber, force)];
                    case 2:
                        pullRequest = _c.sent();
                        if (!isPullRequest(pullRequest)) {
                            return [2 /*return*/, { status: 3 /* FAILED */, failure: pullRequest }];
                        }
                        _a = this.flags.branchPrompt;
                        if (!_a) return [3 /*break*/, 4];
                        return [4 /*yield*/, promptConfirm(getTargettedBranchesConfirmationPromptMessage(pullRequest))];
                    case 3:
                        _a = !(_c.sent());
                        _c.label = 4;
                    case 4:
                        if (_a) {
                            return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                        }
                        _b = pullRequest.hasCaretakerNote;
                        if (!_b) return [3 /*break*/, 6];
                        return [4 /*yield*/, promptConfirm(getCaretakerNotePromptMessage(pullRequest))];
                    case 5:
                        _b = !(_c.sent());
                        _c.label = 6;
                    case 6:
                        // If the pull request has a caretaker note applied, raise awareness by prompting
                        // the caretaker. The caretaker can then decide to proceed or abort the merge.
                        if (_b) {
                            return [2 /*return*/, { status: 4 /* USER_ABORTED */ }];
                        }
                        strategy = this.config.githubApiMerge ?
                            new GithubApiMergeStrategy(this.git, this.config.githubApiMerge) :
                            new AutosquashMergeStrategy(this.git);
                        previousBranchOrRevision = null;
                        _c.label = 7;
                    case 7:
                        _c.trys.push([7, 11, 12, 13]);
                        previousBranchOrRevision = this.git.getCurrentBranchOrRevision();
                        // Run preparations for the merge (e.g. fetching branches).
                        return [4 /*yield*/, strategy.prepare(pullRequest)];
                    case 8:
                        // Run preparations for the merge (e.g. fetching branches).
                        _c.sent();
                        return [4 /*yield*/, strategy.merge(pullRequest)];
                    case 9:
                        failure = _c.sent();
                        if (failure !== null) {
                            return [2 /*return*/, { status: 3 /* FAILED */, failure: failure }];
                        }
                        // Switch back to the previous branch. We need to do this before deleting the temporary
                        // branches because we cannot delete branches which are currently checked out.
                        this.git.run(['checkout', '-f', previousBranchOrRevision]);
                        return [4 /*yield*/, strategy.cleanup(pullRequest)];
                    case 10:
                        _c.sent();
                        // Return a successful merge status.
                        return [2 /*return*/, { status: 2 /* SUCCESS */ }];
                    case 11:
                        e_1 = _c.sent();
                        // Catch all git command errors and return a merge result w/ git error status code.
                        // Other unknown errors which aren't caused by a git command are re-thrown.
                        if (e_1 instanceof GitCommandError) {
                            return [2 /*return*/, { status: 0 /* UNKNOWN_GIT_ERROR */ }];
                        }
                        throw e_1;
                    case 12:
                        // Always try to restore the branch if possible. We don't want to leave
                        // the repository in a different state than before.
                        if (previousBranchOrRevision !== null) {
                            this.git.runGraceful(['checkout', '-f', previousBranchOrRevision]);
                        }
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    return PullRequestMergeTask;
}());
export { PullRequestMergeTask };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFFbEQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRzNELE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM5QyxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsNkNBQTZDLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDeEcsT0FBTyxFQUFDLGFBQWEsRUFBRSwwQkFBMEIsR0FBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBd0J0RSxJQUFNLGdDQUFnQyxHQUE4QjtJQUNsRSxZQUFZLEVBQUUsSUFBSTtDQUNuQixDQUFDO0FBRUY7Ozs7R0FJRztBQUNIO0lBR0UsOEJBQ1csTUFBNkIsRUFBUyxHQUEyQixFQUN4RSxLQUF5QztRQURsQyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBRTFFLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyx5QkFBTyxnQ0FBZ0MsR0FBSyxLQUFLLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNHLG9DQUFLLEdBQVgsVUFBWSxRQUFnQixFQUFFLEtBQWE7UUFBYixzQkFBQSxFQUFBLGFBQWE7Ozs7Ozs0QkFJbEIscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBQyxNQUFNLEVBQUUsT0FBTzs0QkFDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxD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QUFvQixFQUFFLE9BQU8sU0FBQSxFQUFDLEVBQUM7eUJBQzlDO3dCQUVELHVGQUF1Rjt3QkFDdkYsOEVBQThFO3dCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO3dCQUUzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzt3QkFBbkMsU0FBbUMsQ0FBQzt3QkFFcEMsb0NBQW9DO3dCQUNwQyxzQkFBTyxFQUFDLE1BQU0saUJBQXFCLEVBQUMsRUFBQzs7O3dCQUVyQyxtRkFBbUY7d0JBQ25GLDJFQUEyRTt3QkFDM0UsSUFBSSxHQUFDLFlBQVksZUFBZSxFQUFFOzRCQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzt5QkFDaEQ7d0JBQ0QsTUFBTSxHQUFDLENBQUM7O3dCQUVSLHVFQUF1RTt3QkFDdkUsbURBQW1EO3dCQUNuRCxJQUFJLHdCQUF3QixLQUFLLElBQUksRUFBRTs0QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzt5QkFDcEU7Ozs7OztLQUVKO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBbEhELElBa0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRDb21tYW5kRXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcblxuaW1wb3J0IHtNZXJnZUNvbmZpZ1dpdGhSZW1vdGV9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UsIGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZX0gZnJvbSAnLi9tZXNzYWdlcyc7XG5pbXBvcnQge2lzUHVsbFJlcXVlc3QsIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0LH0gZnJvbSAnLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZVN0cmF0ZWd5fSBmcm9tICcuL3N0cmF0ZWdpZXMvYXBpLW1lcmdlJztcbmltcG9ydCB7QXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hdXRvc3F1YXNoLW1lcmdlJztcblxuLyoqIERlc2NyaWJlcyB0aGUgc3RhdHVzIG9mIGEgcHVsbCByZXF1ZXN0IG1lcmdlLiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gTWVyZ2VTdGF0dXMge1xuICBVTktOT1dOX0dJVF9FUlJPUixcbiAgRElSVFlfV09SS0lOR19ESVIsXG4gIFNVQ0NFU1MsXG4gIEZBSUxFRCxcbiAgVVNFUl9BQk9SVEVELFxuICBHSVRIVUJfRVJST1IsXG59XG5cbi8qKiBSZXN1bHQgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgaW50ZXJmYWNlIE1lcmdlUmVzdWx0IHtcbiAgLyoqIE92ZXJhbGwgc3RhdHVzIG9mIHRoZSBtZXJnZS4gKi9cbiAgc3RhdHVzOiBNZXJnZVN0YXR1cztcbiAgLyoqIExpc3Qgb2YgcHVsbCByZXF1ZXN0IGZhaWx1cmVzLiAqL1xuICBmYWlsdXJlPzogUHVsbFJlcXVlc3RGYWlsdXJlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3Mge1xuICBicmFuY2hQcm9tcHQ6IGJvb2xlYW47XG59XG5cbmNvbnN0IGRlZmF1bHRQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzID0ge1xuICBicmFuY2hQcm9tcHQ6IHRydWUsXG59O1xuXG4vKipcbiAqIENsYXNzIHRoYXQgYWNjZXB0cyBhIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uIGFuZCBHaXRodWIgdG9rZW4uIEl0IHByb3ZpZGVzXG4gKiBhIHByb2dyYW1tYXRpYyBpbnRlcmZhY2UgZm9yIG1lcmdpbmcgbXVsdGlwbGUgcHVsbCByZXF1ZXN0cyBiYXNlZCBvbiB0aGVpclxuICogbGFiZWxzIHRoYXQgaGF2ZSBiZWVuIHJlc29sdmVkIHRocm91Z2ggdGhlIG1lcmdlIHNjcmlwdCBjb25maWd1cmF0aW9uLlxuICovXG5leHBvcnQgY2xhc3MgUHVsbFJlcXVlc3RNZXJnZVRhc2sge1xuICBwcml2YXRlIGZsYWdzOiBQdWxsUmVxdWVzdE1lcmdlVGFza0ZsYWdzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGNvbmZpZzogTWVyZ2VDb25maWdXaXRoUmVtb3RlLCBwdWJsaWMgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgICAgZmxhZ3M6IFBhcnRpYWw8UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncz4pIHtcbiAgICAvLyBVcGRhdGUgZmxhZ3MgcHJvcGVydHkgd2l0aCB0aGUgcHJvdmlkZWQgZmxhZ3MgdmFsdWVzIGFzIHBhdGNoZXMgdG8gdGhlIGRlZmF1bHQgZmxhZyB2YWx1ZXMuXG4gICAgdGhpcy5mbGFncyA9IHsuLi5kZWZhdWx0UHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncywgLi4uZmxhZ3N9O1xuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IGFuZCBwdXNoZXMgaXQgdXBzdHJlYW0uXG4gICAqIEBwYXJhbSBwck51bWJlciBQdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkLlxuICAgKiBAcGFyYW0gZm9yY2UgV2hldGhlciBub24tY3JpdGljYWwgcHVsbCByZXF1ZXN0IGZhaWx1cmVzIHNob3VsZCBiZSBpZ25vcmVkLlxuICAgKi9cbiAgYXN5bmMgbWVyZ2UocHJOdW1iZXI6IG51bWJlciwgZm9yY2UgPSBmYWxzZSk6IFByb21pc2U8TWVyZ2VSZXN1bHQ+IHtcbiAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiBHaXRodWIgdG9rZW4gaGFzIHN1ZmZpY2llbnQgcGVybWlzc2lvbnMgZm9yIHdyaXRpbmdcbiAgICAvLyB0byB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5LiBJZiB0aGUgcmVwb3NpdG9yeSBpcyBub3QgcHJpdmF0ZSwgb25seSB0aGVcbiAgICAvLyByZWR1Y2VkIGBwdWJsaWNfcmVwb2AgT0F1dGggc2NvcGUgaXMgc3VmZmljaWVudCBmb3IgcGVyZm9ybWluZyBtZXJnZXMuXG4gICAgY29uc3QgaGFzT2F1dGhTY29wZXMgPSBhd2FpdCB0aGlzLmdpdC5oYXNPYXV0aFNjb3Blcygoc2NvcGVzLCBtaXNzaW5nKSA9PiB7XG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygncmVwbycpKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5yZW1vdGUucHJpdmF0ZSkge1xuICAgICAgICAgIG1pc3NpbmcucHVzaCgncmVwbycpO1xuICAgICAgICB9IGVsc2UgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3B1YmxpY19yZXBvJykpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3B1YmxpY19yZXBvJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUHVsbCByZXF1ZXN0cyBjYW4gbW9kaWZ5IEdpdGh1YiBhY3Rpb24gd29ya2Zsb3cgZmlsZXMuIEluIHN1Y2ggY2FzZXMgR2l0aHViIHJlcXVpcmVzIHVzIHRvXG4gICAgICAvLyBwdXNoIHdpdGggYSB0b2tlbiB0aGF0IGhhcyB0aGUgYHdvcmtmbG93YCBvYXV0aCBzY29wZSBzZXQuIFRvIGF2b2lkIGVycm9ycyB3aGVuIHRoZVxuICAgICAgLy8gY2FyZXRha2VyIGludGVuZHMgdG8gbWVyZ2Ugc3VjaCBQUnMsIHdlIGVuc3VyZSB0aGUgc2NvcGUgaXMgYWx3YXlzIHNldCBvbiB0aGUgdG9rZW4gYmVmb3JlXG4gICAgICAvLyB0aGUgbWVyZ2UgcHJvY2VzcyBzdGFydHMuXG4gICAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9kZXZlbG9wZXJzL2FwcHMvc2NvcGVzLWZvci1vYXV0aC1hcHBzI2F2YWlsYWJsZS1zY29wZXNcbiAgICAgIGlmICghc2NvcGVzLmluY2x1ZGVzKCd3b3JrZmxvdycpKSB7XG4gICAgICAgIG1pc3NpbmcucHVzaCgnd29ya2Zsb3cnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChoYXNPYXV0aFNjb3BlcyAhPT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzOiBNZXJnZVN0YXR1cy5HSVRIVUJfRVJST1IsXG4gICAgICAgIGZhaWx1cmU6IFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoaGFzT2F1dGhTY29wZXMuZXJyb3IpXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkRJUlRZX1dPUktJTkdfRElSfTtcbiAgICB9XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KHRoaXMsIHByTnVtYmVyLCBmb3JjZSk7XG5cbiAgICBpZiAoIWlzUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlOiBwdWxsUmVxdWVzdH07XG4gICAgfVxuXG5cbiAgICBpZiAodGhpcy5mbGFncy5icmFuY2hQcm9tcHQgJiZcbiAgICAgICAgIWF3YWl0IHByb21wdENvbmZpcm0oZ2V0VGFyZ2V0dGVkQnJhbmNoZXNDb25maXJtYXRpb25Qcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuXG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZSBhcHBsaWVkLCByYWlzZSBhd2FyZW5lc3MgYnkgcHJvbXB0aW5nXG4gICAgLy8gdGhlIGNhcmV0YWtlci4gVGhlIGNhcmV0YWtlciBjYW4gdGhlbiBkZWNpZGUgdG8gcHJvY2VlZCBvciBhYm9ydCB0aGUgbWVyZ2UuXG4gICAgaWYgKHB1bGxSZXF1ZXN0Lmhhc0NhcmV0YWtlck5vdGUgJiZcbiAgICAgICAgIWF3YWl0IHByb21wdENvbmZpcm0oZ2V0Q2FyZXRha2VyTm90ZVByb21wdE1lc3NhZ2UocHVsbFJlcXVlc3QpKSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVTRVJfQUJPUlRFRH07XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyYXRlZ3kgPSB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSA/XG4gICAgICAgIG5ldyBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0LCB0aGlzLmNvbmZpZy5naXRodWJBcGlNZXJnZSkgOlxuICAgICAgICBuZXcgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kodGhpcy5naXQpO1xuXG4gICAgLy8gQnJhbmNoIG9yIHJldmlzaW9uIHRoYXQgaXMgY3VycmVudGx5IGNoZWNrZWQgb3V0IHNvIHRoYXQgd2UgY2FuIHN3aXRjaCBiYWNrIHRvXG4gICAgLy8gaXQgb25jZSB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC5cbiAgICBsZXQgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uOiBudWxsfHN0cmluZyA9IG51bGw7XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIGJsb2NrIHJ1bnMgR2l0IGNvbW1hbmRzIGFzIGNoaWxkIHByb2Nlc3Nlcy4gVGhlc2UgR2l0IGNvbW1hbmRzIGNhbiBmYWlsLlxuICAgIC8vIFdlIHdhbnQgdG8gY2FwdHVyZSB0aGVzZSBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGFuIGFwcHJvcHJpYXRlIG1lcmdlIHJlcXVlc3Qgc3RhdHVzLlxuICAgIHRyeSB7XG4gICAgICBwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gICAgICAvLyBSdW4gcHJlcGFyYXRpb25zIGZvciB0aGUgbWVyZ2UgKGUuZy4gZmV0Y2hpbmcgYnJhbmNoZXMpLlxuICAgICAgYXdhaXQgc3RyYXRlZ3kucHJlcGFyZShwdWxsUmVxdWVzdCk7XG5cbiAgICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGFuZCBjYXB0dXJlIHBvdGVudGlhbCBmYWlsdXJlcy5cbiAgICAgIGNvbnN0IGZhaWx1cmUgPSBhd2FpdCBzdHJhdGVneS5tZXJnZShwdWxsUmVxdWVzdCk7XG4gICAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuRkFJTEVELCBmYWlsdXJlfTtcbiAgICAgIH1cblxuICAgICAgLy8gU3dpdGNoIGJhY2sgdG8gdGhlIHByZXZpb3VzIGJyYW5jaC4gV2UgbmVlZCB0byBkbyB0aGlzIGJlZm9yZSBkZWxldGluZyB0aGUgdGVtcG9yYXJ5XG4gICAgICAvLyBicmFuY2hlcyBiZWNhdXNlIHdlIGNhbm5vdCBkZWxldGUgYnJhbmNoZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBjaGVja2VkIG91dC5cbiAgICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uXSk7XG5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LmNsZWFudXAocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBSZXR1cm4gYSBzdWNjZXNzZnVsIG1lcmdlIHN0YXR1cy5cbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5TVUNDRVNTfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBDYXRjaCBhbGwgZ2l0IGNvbW1hbmQgZXJyb3JzIGFuZCByZXR1cm4gYSBtZXJnZSByZXN1bHQgdy8gZ2l0IGVycm9yIHN0YXR1cyBjb2RlLlxuICAgICAgLy8gT3RoZXIgdW5rbm93biBlcnJvcnMgd2hpY2ggYXJlbid0IGNhdXNlZCBieSBhIGdpdCBjb21tYW5kIGFyZSByZS10aHJvd24uXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdENvbW1hbmRFcnJvcikge1xuICAgICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVU5LTk9XTl9HSVRfRVJST1J9O1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgLy8gQWx3YXlzIHRyeSB0byByZXN0b3JlIHRoZSBicmFuY2ggaWYgcG9zc2libGUuIFdlIGRvbid0IHdhbnQgdG8gbGVhdmVcbiAgICAgIC8vIHRoZSByZXBvc2l0b3J5IGluIGEgZGlmZmVyZW50IHN0YXRlIHRoYW4gYmVmb3JlLlxuICAgICAgaWYgKHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZWNrb3V0JywgJy1mJywgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=