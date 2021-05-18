/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __awaiter, __generator } from "tslib";
import { promptConfirm } from '../../utils/console';
import { GitCommandError } from '../../utils/git/index';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFzay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS90YXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxFQUFZLGVBQWUsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBR2pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUM5QyxPQUFPLEVBQUMsNkJBQTZCLEVBQUUsNkNBQTZDLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDeEcsT0FBTyxFQUFDLGFBQWEsRUFBRSwwQkFBMEIsR0FBRSxNQUFNLGdCQUFnQixDQUFDO0FBQzFFLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQzlELE9BQU8sRUFBQyx1QkFBdUIsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBd0J0RSxJQUFNLGdDQUFnQyxHQUE4QjtJQUNsRSxZQUFZLEVBQUUsSUFBSTtDQUNuQixDQUFDO0FBRUY7Ozs7R0FJRztBQUNIO0lBR0UsOEJBQ1csTUFBNkIsRUFBUyxHQUFvQixFQUNqRSxLQUF5QztRQURsQyxXQUFNLEdBQU4sTUFBTSxDQUF1QjtRQUFTLFFBQUcsR0FBSCxHQUFHLENBQWlCO1FBRW5FLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsS0FBSyx5QkFBTyxnQ0FBZ0MsR0FBSyxLQUFLLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNHLG9DQUFLLEdBQVgsVUFBWSxRQUFnQixFQUFFLEtBQWE7UUFBYixzQkFBQSxFQUFBLGFBQWE7Ozs7Ozs0QkFJbEIscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsVUFBQyxNQUFNLEVBQUUsT0FBTzs0QkFDbkUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxD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QUFvQixFQUFFLE9BQU8sU0FBQSxFQUFDLEVBQUM7eUJBQzlDO3dCQUVELHVGQUF1Rjt3QkFDdkYsOEVBQThFO3dCQUM5RSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsd0JBQXdCLENBQUMsQ0FBQyxDQUFDO3dCQUUzRCxxQkFBTSxRQUFRLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxFQUFBOzt3QkFBbkMsU0FBbUMsQ0FBQzt3QkFFcEMsb0NBQW9DO3dCQUNwQyxzQkFBTyxFQUFDLE1BQU0saUJBQXFCLEVBQUMsRUFBQzs7O3dCQUVyQyxtRkFBbUY7d0JBQ25GLDJFQUEyRTt3QkFDM0UsSUFBSSxHQUFDLFlBQVksZUFBZSxFQUFFOzRCQUNoQyxzQkFBTyxFQUFDLE1BQU0sMkJBQStCLEVBQUMsRUFBQzt5QkFDaEQ7d0JBQ0QsTUFBTSxHQUFDLENBQUM7O3dCQUVSLHVFQUF1RTt3QkFDdkUsbURBQW1EO3dCQUNuRCxJQUFJLHdCQUF3QixLQUFLLElBQUksRUFBRTs0QkFDckMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLHdCQUF3QixDQUFDLENBQUMsQ0FBQzt5QkFDcEU7Ozs7OztLQUVKO0lBQ0gsMkJBQUM7QUFBRCxDQUFDLEFBbEhELElBa0hDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudCwgR2l0Q29tbWFuZEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG5pbXBvcnQge01lcmdlQ29uZmlnV2l0aFJlbW90ZX0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJOb3RlUHJvbXB0TWVzc2FnZSwgZ2V0VGFyZ2V0dGVkQnJhbmNoZXNDb25maXJtYXRpb25Qcm9tcHRNZXNzYWdlfSBmcm9tICcuL21lc3NhZ2VzJztcbmltcG9ydCB7aXNQdWxsUmVxdWVzdCwgbG9hZEFuZFZhbGlkYXRlUHVsbFJlcXVlc3QsfSBmcm9tICcuL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlU3RyYXRlZ3l9IGZyb20gJy4vc3RyYXRlZ2llcy9hcGktbWVyZ2UnO1xuaW1wb3J0IHtBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneX0gZnJvbSAnLi9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UnO1xuXG4vKiogRGVzY3JpYmVzIHRoZSBzdGF0dXMgb2YgYSBwdWxsIHJlcXVlc3QgbWVyZ2UuICovXG5leHBvcnQgY29uc3QgZW51bSBNZXJnZVN0YXR1cyB7XG4gIFVOS05PV05fR0lUX0VSUk9SLFxuICBESVJUWV9XT1JLSU5HX0RJUixcbiAgU1VDQ0VTUyxcbiAgRkFJTEVELFxuICBVU0VSX0FCT1JURUQsXG4gIEdJVEhVQl9FUlJPUixcbn1cblxuLyoqIFJlc3VsdCBvZiBhIHB1bGwgcmVxdWVzdCBtZXJnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VSZXN1bHQge1xuICAvKiogT3ZlcmFsbCBzdGF0dXMgb2YgdGhlIG1lcmdlLiAqL1xuICBzdGF0dXM6IE1lcmdlU3RhdHVzO1xuICAvKiogTGlzdCBvZiBwdWxsIHJlcXVlc3QgZmFpbHVyZXMuICovXG4gIGZhaWx1cmU/OiBQdWxsUmVxdWVzdEZhaWx1cmU7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3RNZXJnZVRhc2tGbGFncyB7XG4gIGJyYW5jaFByb21wdDogYm9vbGVhbjtcbn1cblxuY29uc3QgZGVmYXVsdFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MgPSB7XG4gIGJyYW5jaFByb21wdDogdHJ1ZSxcbn07XG5cbi8qKlxuICogQ2xhc3MgdGhhdCBhY2NlcHRzIGEgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24gYW5kIEdpdGh1YiB0b2tlbi4gSXQgcHJvdmlkZXNcbiAqIGEgcHJvZ3JhbW1hdGljIGludGVyZmFjZSBmb3IgbWVyZ2luZyBtdWx0aXBsZSBwdWxsIHJlcXVlc3RzIGJhc2VkIG9uIHRoZWlyXG4gKiBsYWJlbHMgdGhhdCBoYXZlIGJlZW4gcmVzb2x2ZWQgdGhyb3VnaCB0aGUgbWVyZ2Ugc2NyaXB0IGNvbmZpZ3VyYXRpb24uXG4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsUmVxdWVzdE1lcmdlVGFzayB7XG4gIHByaXZhdGUgZmxhZ3M6IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgY29uZmlnOiBNZXJnZUNvbmZpZ1dpdGhSZW1vdGUsIHB1YmxpYyBnaXQ6IEdpdENsaWVudDx0cnVlPixcbiAgICAgIGZsYWdzOiBQYXJ0aWFsPFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3M+KSB7XG4gICAgLy8gVXBkYXRlIGZsYWdzIHByb3BlcnR5IHdpdGggdGhlIHByb3ZpZGVkIGZsYWdzIHZhbHVlcyBhcyBwYXRjaGVzIHRvIHRoZSBkZWZhdWx0IGZsYWcgdmFsdWVzLlxuICAgIHRoaXMuZmxhZ3MgPSB7Li4uZGVmYXVsdFB1bGxSZXF1ZXN0TWVyZ2VUYXNrRmxhZ3MsIC4uLmZsYWdzfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCBhbmQgcHVzaGVzIGl0IHVwc3RyZWFtLlxuICAgKiBAcGFyYW0gcHJOdW1iZXIgUHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZC5cbiAgICogQHBhcmFtIGZvcmNlIFdoZXRoZXIgbm9uLWNyaXRpY2FsIHB1bGwgcmVxdWVzdCBmYWlsdXJlcyBzaG91bGQgYmUgaWdub3JlZC5cbiAgICovXG4gIGFzeW5jIG1lcmdlKHByTnVtYmVyOiBudW1iZXIsIGZvcmNlID0gZmFsc2UpOiBQcm9taXNlPE1lcmdlUmVzdWx0PiB7XG4gICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gR2l0aHViIHRva2VuIGhhcyBzdWZmaWNpZW50IHBlcm1pc3Npb25zIGZvciB3cml0aW5nXG4gICAgLy8gdG8gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeS4gSWYgdGhlIHJlcG9zaXRvcnkgaXMgbm90IHByaXZhdGUsIG9ubHkgdGhlXG4gICAgLy8gcmVkdWNlZCBgcHVibGljX3JlcG9gIE9BdXRoIHNjb3BlIGlzIHN1ZmZpY2llbnQgZm9yIHBlcmZvcm1pbmcgbWVyZ2VzLlxuICAgIGNvbnN0IGhhc09hdXRoU2NvcGVzID0gYXdhaXQgdGhpcy5naXQuaGFzT2F1dGhTY29wZXMoKHNjb3BlcywgbWlzc2luZykgPT4ge1xuICAgICAgaWYgKCFzY29wZXMuaW5jbHVkZXMoJ3JlcG8nKSkge1xuICAgICAgICBpZiAodGhpcy5jb25maWcucmVtb3RlLnByaXZhdGUpIHtcbiAgICAgICAgICBtaXNzaW5nLnB1c2goJ3JlcG8nKTtcbiAgICAgICAgfSBlbHNlIGlmICghc2NvcGVzLmluY2x1ZGVzKCdwdWJsaWNfcmVwbycpKSB7XG4gICAgICAgICAgbWlzc2luZy5wdXNoKCdwdWJsaWNfcmVwbycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFB1bGwgcmVxdWVzdHMgY2FuIG1vZGlmeSBHaXRodWIgYWN0aW9uIHdvcmtmbG93IGZpbGVzLiBJbiBzdWNoIGNhc2VzIEdpdGh1YiByZXF1aXJlcyB1cyB0b1xuICAgICAgLy8gcHVzaCB3aXRoIGEgdG9rZW4gdGhhdCBoYXMgdGhlIGB3b3JrZmxvd2Agb2F1dGggc2NvcGUgc2V0LiBUbyBhdm9pZCBlcnJvcnMgd2hlbiB0aGVcbiAgICAgIC8vIGNhcmV0YWtlciBpbnRlbmRzIHRvIG1lcmdlIHN1Y2ggUFJzLCB3ZSBlbnN1cmUgdGhlIHNjb3BlIGlzIGFsd2F5cyBzZXQgb24gdGhlIHRva2VuIGJlZm9yZVxuICAgICAgLy8gdGhlIG1lcmdlIHByb2Nlc3Mgc3RhcnRzLlxuICAgICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZGV2ZWxvcGVycy9hcHBzL3Njb3Blcy1mb3Itb2F1dGgtYXBwcyNhdmFpbGFibGUtc2NvcGVzXG4gICAgICBpZiAoIXNjb3Blcy5pbmNsdWRlcygnd29ya2Zsb3cnKSkge1xuICAgICAgICBtaXNzaW5nLnB1c2goJ3dvcmtmbG93Jyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoaGFzT2F1dGhTY29wZXMgIT09IHRydWUpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1czogTWVyZ2VTdGF0dXMuR0lUSFVCX0VSUk9SLFxuICAgICAgICBmYWlsdXJlOiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKGhhc09hdXRoU2NvcGVzLmVycm9yKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5ESVJUWV9XT1JLSU5HX0RJUn07XG4gICAgfVxuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdCh0aGlzLCBwck51bWJlciwgZm9yY2UpO1xuXG4gICAgaWYgKCFpc1B1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KSkge1xuICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZTogcHVsbFJlcXVlc3R9O1xuICAgIH1cblxuXG4gICAgaWYgKHRoaXMuZmxhZ3MuYnJhbmNoUHJvbXB0ICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKGdldFRhcmdldHRlZEJyYW5jaGVzQ29uZmlybWF0aW9uUHJvbXB0TWVzc2FnZShwdWxsUmVxdWVzdCkpKSB7XG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuVVNFUl9BQk9SVEVEfTtcbiAgICB9XG5cblxuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUgYXBwbGllZCwgcmFpc2UgYXdhcmVuZXNzIGJ5IHByb21wdGluZ1xuICAgIC8vIHRoZSBjYXJldGFrZXIuIFRoZSBjYXJldGFrZXIgY2FuIHRoZW4gZGVjaWRlIHRvIHByb2NlZWQgb3IgYWJvcnQgdGhlIG1lcmdlLlxuICAgIGlmIChwdWxsUmVxdWVzdC5oYXNDYXJldGFrZXJOb3RlICYmXG4gICAgICAgICFhd2FpdCBwcm9tcHRDb25maXJtKGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0KSkpIHtcbiAgICAgIHJldHVybiB7c3RhdHVzOiBNZXJnZVN0YXR1cy5VU0VSX0FCT1JURUR9O1xuICAgIH1cblxuICAgIGNvbnN0IHN0cmF0ZWd5ID0gdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UgP1xuICAgICAgICBuZXcgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSh0aGlzLmdpdCwgdGhpcy5jb25maWcuZ2l0aHViQXBpTWVyZ2UpIDpcbiAgICAgICAgbmV3IEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5KHRoaXMuZ2l0KTtcblxuICAgIC8vIEJyYW5jaCBvciByZXZpc2lvbiB0aGF0IGlzIGN1cnJlbnRseSBjaGVja2VkIG91dCBzbyB0aGF0IHdlIGNhbiBzd2l0Y2ggYmFjayB0b1xuICAgIC8vIGl0IG9uY2UgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuXG4gICAgbGV0IHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbjogbnVsbHxzdHJpbmcgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBibG9jayBydW5zIEdpdCBjb21tYW5kcyBhcyBjaGlsZCBwcm9jZXNzZXMuIFRoZXNlIEdpdCBjb21tYW5kcyBjYW4gZmFpbC5cbiAgICAvLyBXZSB3YW50IHRvIGNhcHR1cmUgdGhlc2UgY29tbWFuZCBlcnJvcnMgYW5kIHJldHVybiBhbiBhcHByb3ByaWF0ZSBtZXJnZSByZXF1ZXN0IHN0YXR1cy5cbiAgICB0cnkge1xuICAgICAgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gdGhpcy5naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICAgICAgLy8gUnVuIHByZXBhcmF0aW9ucyBmb3IgdGhlIG1lcmdlIChlLmcuIGZldGNoaW5nIGJyYW5jaGVzKS5cbiAgICAgIGF3YWl0IHN0cmF0ZWd5LnByZXBhcmUocHVsbFJlcXVlc3QpO1xuXG4gICAgICAvLyBQZXJmb3JtIHRoZSBtZXJnZSBhbmQgY2FwdHVyZSBwb3RlbnRpYWwgZmFpbHVyZXMuXG4gICAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgc3RyYXRlZ3kubWVyZ2UocHVsbFJlcXVlc3QpO1xuICAgICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLkZBSUxFRCwgZmFpbHVyZX07XG4gICAgICB9XG5cbiAgICAgIC8vIFN3aXRjaCBiYWNrIHRvIHRoZSBwcmV2aW91cyBicmFuY2guIFdlIG5lZWQgdG8gZG8gdGhpcyBiZWZvcmUgZGVsZXRpbmcgdGhlIHRlbXBvcmFyeVxuICAgICAgLy8gYnJhbmNoZXMgYmVjYXVzZSB3ZSBjYW5ub3QgZGVsZXRlIGJyYW5jaGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQuXG4gICAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuXG4gICAgICBhd2FpdCBzdHJhdGVneS5jbGVhbnVwKHB1bGxSZXF1ZXN0KTtcblxuICAgICAgLy8gUmV0dXJuIGEgc3VjY2Vzc2Z1bCBtZXJnZSBzdGF0dXMuXG4gICAgICByZXR1cm4ge3N0YXR1czogTWVyZ2VTdGF0dXMuU1VDQ0VTU307XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gQ2F0Y2ggYWxsIGdpdCBjb21tYW5kIGVycm9ycyBhbmQgcmV0dXJuIGEgbWVyZ2UgcmVzdWx0IHcvIGdpdCBlcnJvciBzdGF0dXMgY29kZS5cbiAgICAgIC8vIE90aGVyIHVua25vd24gZXJyb3JzIHdoaWNoIGFyZW4ndCBjYXVzZWQgYnkgYSBnaXQgY29tbWFuZCBhcmUgcmUtdGhyb3duLlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRDb21tYW5kRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIHtzdGF0dXM6IE1lcmdlU3RhdHVzLlVOS05PV05fR0lUX0VSUk9SfTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIC8vIEFsd2F5cyB0cnkgdG8gcmVzdG9yZSB0aGUgYnJhbmNoIGlmIHBvc3NpYmxlLiBXZSBkb24ndCB3YW50IHRvIGxlYXZlXG4gICAgICAvLyB0aGUgcmVwb3NpdG9yeSBpbiBhIGRpZmZlcmVudCBzdGF0ZSB0aGFuIGJlZm9yZS5cbiAgICAgIGlmIChwcmV2aW91c0JyYW5jaE9yUmV2aXNpb24gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5naXQucnVuR3JhY2VmdWwoWydjaGVja291dCcsICctZicsIHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbl0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19