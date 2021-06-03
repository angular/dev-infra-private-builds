/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __assign, __awaiter, __extends, __generator, __read } from "tslib";
import { prompt } from 'inquirer';
import { parseCommitMessage } from '../../../commit-message/parse';
import { PullRequestFailure } from '../failures';
import { matchesPattern } from '../string-pattern';
import { MergeStrategy, TEMP_PR_HEAD_BRANCH } from './strategy';
/** Separator between commit message header and body. */
var COMMIT_HEADER_SEPARATOR = '\n\n';
/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
var GithubApiMergeStrategy = /** @class */ (function (_super) {
    __extends(GithubApiMergeStrategy, _super);
    function GithubApiMergeStrategy(git, _config) {
        var _this = _super.call(this, git) || this;
        _this._config = _config;
        return _this;
    }
    GithubApiMergeStrategy.prototype.merge = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var githubTargetBranch, prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, method, cherryPickTargetBranches, failure, mergeOptions, mergeStatusCode, targetSha, result, e_1, targetCommitsCount, failedBranches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        githubTargetBranch = pullRequest.githubTargetBranch, prNumber = pullRequest.prNumber, targetBranches = pullRequest.targetBranches, requiredBaseSha = pullRequest.requiredBaseSha, needsCommitMessageFixup = pullRequest.needsCommitMessageFixup;
                        // If the pull request does not have its base branch set to any determined target
                        // branch, we cannot merge using the API.
                        if (targetBranches.every(function (t) { return t !== githubTargetBranch; })) {
                            return [2 /*return*/, PullRequestFailure.mismatchingTargetBranch(targetBranches)];
                        }
                        // In cases where a required base commit is specified for this pull request, check if
                        // the pull request contains the given commit. If not, return a pull request failure.
                        // This check is useful for enforcing that PRs are rebased on top of a given commit.
                        // e.g. a commit that changes the code ownership validation. PRs which are not rebased
                        // could bypass new codeowner ship rules.
                        if (requiredBaseSha && !this.git.hasCommit(TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
                            return [2 /*return*/, PullRequestFailure.unsatisfiedBaseSha()];
                        }
                        method = this._getMergeActionFromPullRequest(pullRequest);
                        cherryPickTargetBranches = targetBranches.filter(function (b) { return b !== githubTargetBranch; });
                        return [4 /*yield*/, this._checkMergability(pullRequest, cherryPickTargetBranches)];
                    case 1:
                        failure = _a.sent();
                        // If the PR could not be cherry-picked into all target branches locally, we know it can't
                        // be done through the Github API either. We abort merging and pass-through the failure.
                        if (failure !== null) {
                            return [2 /*return*/, failure];
                        }
                        mergeOptions = __assign({ pull_number: prNumber, merge_method: method }, this.git.remoteParams);
                        if (!needsCommitMessageFixup) return [3 /*break*/, 3];
                        // Commit message fixup does not work with other merge methods as the Github API only
                        // allows commit message modifications for squash merging.
                        if (method !== 'squash') {
                            return [2 /*return*/, PullRequestFailure.unableToFixupCommitMessageSquashOnly()];
                        }
                        return [4 /*yield*/, this._promptCommitMessageEdit(pullRequest, mergeOptions)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.git.github.pulls.merge(mergeOptions)];
                    case 4:
                        result = _a.sent();
                        mergeStatusCode = result.status;
                        targetSha = result.data.sha;
                        return [3 /*break*/, 6];
                    case 5:
                        e_1 = _a.sent();
                        // Note: Github usually returns `404` as status code if the API request uses a
                        // token with insufficient permissions. Github does this because it doesn't want
                        // to leak whether a repository exists or not. In our case we expect a certain
                        // repository to exist, so we always treat this as a permission failure.
                        if (e_1.status === 403 || e_1.status === 404) {
                            return [2 /*return*/, PullRequestFailure.insufficientPermissionsToMerge()];
                        }
                        throw e_1;
                    case 6:
                        // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
                        // Pull request cannot be merged due to merge conflicts.
                        if (mergeStatusCode === 405) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts([githubTargetBranch])];
                        }
                        if (mergeStatusCode !== 200) {
                            return [2 /*return*/, PullRequestFailure.unknownMergeError()];
                        }
                        // If the PR does  not need to be merged into any other target branches,
                        // we exit here as we already completed the merge.
                        if (!cherryPickTargetBranches.length) {
                            return [2 /*return*/, null];
                        }
                        // Refresh the target branch the PR has been merged into through the API. We need
                        // to re-fetch as otherwise we cannot cherry-pick the new commits into the remaining
                        // target branches.
                        this.fetchTargetBranches([githubTargetBranch]);
                        targetCommitsCount = method === 'squash' ? 1 : pullRequest.commitCount;
                        return [4 /*yield*/, this.cherryPickIntoTargetBranches(targetSha + "~" + targetCommitsCount + ".." + targetSha, cherryPickTargetBranches, {
                                // Commits that have been created by the Github API do not necessarily contain
                                // a reference to the source pull request (unless the squash strategy is used).
                                // To ensure that original commits can be found when a commit is viewed in a
                                // target branch, we add a link to the original commits when cherry-picking.
                                linkToOriginalCommits: true,
                            })];
                    case 7:
                        failedBranches = _a.sent();
                        // We already checked whether the PR can be cherry-picked into the target branches,
                        // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
                        // commits created through the Github API could be different (i.e. through squash).
                        if (failedBranches.length) {
                            return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                        }
                        this.pushTargetBranchesUpstream(cherryPickTargetBranches);
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Prompts the user for the commit message changes. Unlike as in the autosquash merge
     * strategy, we cannot start an interactive rebase because we merge using the Github API.
     * The Github API only allows modifications to PR title and body for squash merges.
     */
    GithubApiMergeStrategy.prototype._promptCommitMessageEdit = function (pullRequest, mergeOptions) {
        return __awaiter(this, void 0, void 0, function () {
            var commitMessage, result, _a, newTitle, newMessage;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this._getDefaultSquashCommitMessage(pullRequest)];
                    case 1:
                        commitMessage = _b.sent();
                        return [4 /*yield*/, prompt({
                                type: 'editor',
                                name: 'result',
                                message: 'Please update the commit message',
                                default: commitMessage,
                            })];
                    case 2:
                        result = (_b.sent()).result;
                        _a = __read(result.split(COMMIT_HEADER_SEPARATOR)), newTitle = _a[0], newMessage = _a.slice(1);
                        // Update the merge options so that the changes are reflected in there.
                        mergeOptions.commit_title = newTitle + " (#" + pullRequest.prNumber + ")";
                        mergeOptions.commit_message = newMessage.join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets a commit message for the given pull request. Github by default concatenates
     * multiple commit messages if a PR is merged in squash mode. We try to replicate this
     * behavior here so that we have a default commit message that can be fixed up.
     */
    GithubApiMergeStrategy.prototype._getDefaultSquashCommitMessage = function (pullRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var commits, messageBase, joinedMessages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._getPullRequestCommitMessages(pullRequest)];
                    case 1:
                        commits = (_a.sent())
                            .map(function (message) { return ({ message: message, parsed: parseCommitMessage(message) }); });
                        messageBase = "" + pullRequest.title + COMMIT_HEADER_SEPARATOR;
                        if (commits.length <= 1) {
                            return [2 /*return*/, "" + messageBase + commits[0].parsed.body];
                        }
                        joinedMessages = commits.map(function (c) { return "* " + c.message; }).join(COMMIT_HEADER_SEPARATOR);
                        return [2 /*return*/, "" + messageBase + joinedMessages];
                }
            });
        });
    };
    /** Gets all commit messages of commits in the pull request. */
    GithubApiMergeStrategy.prototype._getPullRequestCommitMessages = function (_a) {
        var prNumber = _a.prNumber;
        return __awaiter(this, void 0, void 0, function () {
            var request, allCommits;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        request = this.git.github.pulls.listCommits.endpoint.merge(__assign(__assign({}, this.git.remoteParams), { pull_number: prNumber }));
                        return [4 /*yield*/, this.git.github.paginate(request)];
                    case 1:
                        allCommits = _b.sent();
                        return [2 /*return*/, allCommits.map(function (_a) {
                                var commit = _a.commit;
                                return commit.message;
                            })];
                }
            });
        });
    };
    /**
     * Checks if given pull request could be merged into its target branches.
     * @returns A pull request failure if it the PR could not be merged.
     */
    GithubApiMergeStrategy.prototype._checkMergability = function (pullRequest, targetBranches) {
        return __awaiter(this, void 0, void 0, function () {
            var revisionRange, failedBranches;
            return __generator(this, function (_a) {
                revisionRange = this.getPullRequestRevisionRange(pullRequest);
                failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, { dryRun: true });
                if (failedBranches.length) {
                    return [2 /*return*/, PullRequestFailure.mergeConflicts(failedBranches)];
                }
                return [2 /*return*/, null];
            });
        });
    };
    /** Determines the merge action from the given pull request. */
    GithubApiMergeStrategy.prototype._getMergeActionFromPullRequest = function (_a) {
        var labels = _a.labels;
        if (this._config.labels) {
            var matchingLabel = this._config.labels.find(function (_a) {
                var pattern = _a.pattern;
                return labels.some(function (l) { return matchesPattern(l, pattern); });
            });
            if (matchingLabel !== undefined) {
                return matchingLabel.method;
            }
        }
        return this._config.default;
    };
    return GithubApiMergeStrategy;
}(MergeStrategy));
export { GithubApiMergeStrategy };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFHSCxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sVUFBVSxDQUFDO0FBRWhDLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQixDQUFDO0FBSWpFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUUvQyxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFFakQsT0FBTyxFQUFDLGFBQWEsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLFlBQVksQ0FBQztBQVU5RCx3REFBd0Q7QUFDeEQsSUFBTSx1QkFBdUIsR0FBRyxNQUFNLENBQUM7QUFFdkM7Ozs7OztHQU1HO0FBQ0g7SUFBNEMsMENBQWE7SUFDdkQsZ0NBQVksR0FBMkIsRUFBVSxPQUFxQztRQUF0RixZQUNFLGtCQUFNLEdBQUcsQ0FBQyxTQUNYO1FBRmdELGFBQU8sR0FBUCxPQUFPLENBQThCOztJQUV0RixDQUFDO0lBRUssc0NBQUssR0FBWCxVQUFZLFdBQXdCOzs7Ozs7d0JBQzNCLGtCQUFrQixHQUNyQixXQUFXLG1CQURVLEVBQUUsUUFBUSxHQUMvQixXQUFXLFNBRG9CLEVBQUUsY0FBYyxHQUMvQyxXQUFXLGVBRG9DLEVBQUUsZUFBZSxHQUNoRSxXQUFXLGdCQURxRCxFQUFFLHVCQUF1QixHQUN6RixXQUFXLHdCQUQ4RSxDQUM3RTt3QkFDaEIsaUZBQWlGO3dCQUNqRix5Q0FBeUM7d0JBQ3pDLElBQUksY0FBYyxDQUFDLEtBQUssQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsS0FBSyxrQkFBa0IsRUFBeEIsQ0FBd0IsQ0FBQyxFQUFFOzRCQUN2RCxzQkFBTyxrQkFBa0IsQ0FBQyx1QkFB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R0FpTXhEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge0dpdGh1YkFwaU1lcmdlTWV0aG9kfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4uL2ZhaWx1cmVzJztcbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4uL3B1bGwtcmVxdWVzdCc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuLi9zdHJpbmctcGF0dGVybic7XG5cbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciB0aGUgR2l0aHViIEFQSSBtZXJnZSBzdHJhdGVneS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZyB7XG4gIC8qKiBEZWZhdWx0IG1ldGhvZCB1c2VkIGZvciBtZXJnaW5nIHB1bGwgcmVxdWVzdHMgKi9cbiAgZGVmYXVsdDogR2l0aHViQXBpTWVyZ2VNZXRob2Q7XG4gIC8qKiBMYWJlbHMgd2hpY2ggc3BlY2lmeSBhIGRpZmZlcmVudCBtZXJnZSBtZXRob2QgdGhhbiB0aGUgZGVmYXVsdC4gKi9cbiAgbGFiZWxzPzoge3BhdHRlcm46IHN0cmluZywgbWV0aG9kOiBHaXRodWJBcGlNZXJnZU1ldGhvZH1bXTtcbn1cblxuLyoqIFNlcGFyYXRvciBiZXR3ZWVuIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBhbmQgYm9keS4gKi9cbmNvbnN0IENPTU1JVF9IRUFERVJfU0VQQVJBVE9SID0gJ1xcblxcbic7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBwcmltYXJpbHkgbGV2ZXJhZ2VzIHRoZSBHaXRodWIgQVBJLiBUaGUgc3RyYXRlZ3kgbWVyZ2VzIGEgZ2l2ZW5cbiAqIHB1bGwgcmVxdWVzdCBpbnRvIGEgdGFyZ2V0IGJyYW5jaCB1c2luZyB0aGUgQVBJLiBUaGlzIGVuc3VyZXMgdGhhdCBHaXRodWIgZGlzcGxheXNcbiAqIHRoZSBwdWxsIHJlcXVlc3QgYXMgbWVyZ2VkLiBUaGUgbWVyZ2VkIGNvbW1pdHMgYXJlIHRoZW4gY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSByZW1haW5pbmdcbiAqIHRhcmdldCBicmFuY2hlcyB1c2luZyB0aGUgbG9jYWwgR2l0IGluc3RhbmNlLiBUaGUgYmVuZWZpdCBpcyB0aGF0IHRoZSBHaXRodWIgbWVyZ2VkIHN0YXRlXG4gKiBpcyBwcm9wZXJseSBzZXQsIGJ1dCBhIG5vdGFibGUgZG93bnNpZGUgaXMgdGhhdCBQUnMgY2Fubm90IHVzZSBmaXh1cCBvciBzcXVhc2ggY29tbWl0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LCBwcml2YXRlIF9jb25maWc6IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcpIHtcbiAgICBzdXBlcihnaXQpO1xuICB9XG5cbiAgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmV8bnVsbD4ge1xuICAgIGNvbnN0IHtnaXRodWJUYXJnZXRCcmFuY2gsIHByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cH0gPVxuICAgICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGRvZXMgbm90IGhhdmUgaXRzIGJhc2UgYnJhbmNoIHNldCB0byBhbnkgZGV0ZXJtaW5lZCB0YXJnZXRcbiAgICAvLyBicmFuY2gsIHdlIGNhbm5vdCBtZXJnZSB1c2luZyB0aGUgQVBJLlxuICAgIGlmICh0YXJnZXRCcmFuY2hlcy5ldmVyeSh0ID0+IHQgIT09IGdpdGh1YlRhcmdldEJyYW5jaCkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWlzbWF0Y2hpbmdUYXJnZXRCcmFuY2godGFyZ2V0QnJhbmNoZXMpO1xuICAgIH1cblxuICAgIC8vIEluIGNhc2VzIHdoZXJlIGEgcmVxdWlyZWQgYmFzZSBjb21taXQgaXMgc3BlY2lmaWVkIGZvciB0aGlzIHB1bGwgcmVxdWVzdCwgY2hlY2sgaWZcbiAgICAvLyB0aGUgcHVsbCByZXF1ZXN0IGNvbnRhaW5zIHRoZSBnaXZlbiBjb21taXQuIElmIG5vdCwgcmV0dXJuIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUuXG4gICAgLy8gVGhpcyBjaGVjayBpcyB1c2VmdWwgZm9yIGVuZm9yY2luZyB0aGF0IFBScyBhcmUgcmViYXNlZCBvbiB0b3Agb2YgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gZS5nLiBhIGNvbW1pdCB0aGF0IGNoYW5nZXMgdGhlIGNvZGUgb3duZXJzaGlwIHZhbGlkYXRpb24uIFBScyB3aGljaCBhcmUgbm90IHJlYmFzZWRcbiAgICAvLyBjb3VsZCBieXBhc3MgbmV3IGNvZGVvd25lciBzaGlwIHJ1bGVzLlxuICAgIGlmIChyZXF1aXJlZEJhc2VTaGEgJiYgIXRoaXMuZ2l0Lmhhc0NvbW1pdChURU1QX1BSX0hFQURfQlJBTkNILCByZXF1aXJlZEJhc2VTaGEpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuc2F0aXNmaWVkQmFzZVNoYSgpO1xuICAgIH1cblxuICAgIGNvbnN0IG1ldGhvZCA9IHRoaXMuX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMgPSB0YXJnZXRCcmFuY2hlcy5maWx0ZXIoYiA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBPY3Rva2l0LlB1bGxzTWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jcmVzcG9uc2UtaWYtbWVyZ2UtY2Fubm90LWJlLXBlcmZvcm1lZFxuICAgIC8vIFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGR1ZSB0byBtZXJnZSBjb25mbGljdHMuXG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSA9PT0gNDA1KSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcbiAgICB9XG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVua25vd25NZXJnZUVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFBSIGRvZXMgIG5vdCBuZWVkIHRvIGJlIG1lcmdlZCBpbnRvIGFueSBvdGhlciB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gd2UgZXhpdCBoZXJlIGFzIHdlIGFscmVhZHkgY29tcGxldGVkIHRoZSBtZXJnZS5cbiAgICBpZiAoIWNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggdGhlIHRhcmdldCBicmFuY2ggdGhlIFBSIGhhcyBiZWVuIG1lcmdlZCBpbnRvIHRocm91Z2ggdGhlIEFQSS4gV2UgbmVlZFxuICAgIC8vIHRvIHJlLWZldGNoIGFzIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2hlcnJ5LXBpY2sgdGhlIG5ldyBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIHRhcmdldCBicmFuY2hlcy5cbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuXG4gICAgLy8gTnVtYmVyIG9mIGNvbW1pdHMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgdGFyZ2V0IGJyYW5jaC4gVGhpcyBjb3VsZCB2YXJ5IGZyb21cbiAgICAvLyB0aGUgY291bnQgb2YgY29tbWl0cyBpbiB0aGUgUFIgZHVlIHRvIHNxdWFzaGluZy5cbiAgICBjb25zdCB0YXJnZXRDb21taXRzQ291bnQgPSBtZXRob2QgPT09ICdzcXVhc2gnID8gMSA6IHB1bGxSZXF1ZXN0LmNvbW1pdENvdW50O1xuXG4gICAgLy8gQ2hlcnJ5IHBpY2sgdGhlIG1lcmdlZCBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMoXG4gICAgICAgIGAke3RhcmdldFNoYX1+JHt0YXJnZXRDb21taXRzQ291bnR9Li4ke3RhcmdldFNoYX1gLCBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMsIHtcbiAgICAgICAgICAvLyBDb21taXRzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhlIEdpdGh1YiBBUEkgZG8gbm90IG5lY2Vzc2FyaWx5IGNvbnRhaW5cbiAgICAgICAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgc291cmNlIHB1bGwgcmVxdWVzdCAodW5sZXNzIHRoZSBzcXVhc2ggc3RyYXRlZ3kgaXMgdXNlZCkuXG4gICAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgb3JpZ2luYWwgY29tbWl0cyBjYW4gYmUgZm91bmQgd2hlbiBhIGNvbW1pdCBpcyB2aWV3ZWQgaW4gYVxuICAgICAgICAgIC8vIHRhcmdldCBicmFuY2gsIHdlIGFkZCBhIGxpbmsgdG8gdGhlIG9yaWdpbmFsIGNvbW1pdHMgd2hlbiBjaGVycnktcGlja2luZy5cbiAgICAgICAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM6IHRydWUsXG4gICAgICAgIH0pO1xuXG4gICAgLy8gV2UgYWxyZWFkeSBjaGVja2VkIHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyBidXQgaW4gY2FzZSB0aGUgY2hlcnJ5LXBpY2sgc29tZWhvdyBmYWlscywgd2Ugc3RpbGwgaGFuZGxlIHRoZSBjb25mbGljdHMgaGVyZS4gVGhlXG4gICAgLy8gY29tbWl0cyBjcmVhdGVkIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgY291bGQgYmUgZGlmZmVyZW50IChpLmUuIHRocm91Z2ggc3F1YXNoKS5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgdGhlIGNvbW1pdCBtZXNzYWdlIGNoYW5nZXMuIFVubGlrZSBhcyBpbiB0aGUgYXV0b3NxdWFzaCBtZXJnZVxuICAgKiBzdHJhdGVneSwgd2UgY2Fubm90IHN0YXJ0IGFuIGludGVyYWN0aXZlIHJlYmFzZSBiZWNhdXNlIHdlIG1lcmdlIHVzaW5nIHRoZSBHaXRodWIgQVBJLlxuICAgKiBUaGUgR2l0aHViIEFQSSBvbmx5IGFsbG93cyBtb2RpZmljYXRpb25zIHRvIFBSIHRpdGxlIGFuZCBib2R5IGZvciBzcXVhc2ggbWVyZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQoXG4gICAgICBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9uczogT2N0b2tpdC5QdWxsc01lcmdlUGFyYW1zKSB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCB7cmVzdWx0fSA9IGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7XG4gICAgICB0eXBlOiAnZWRpdG9yJyxcbiAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSB1cGRhdGUgdGhlIGNvbW1pdCBtZXNzYWdlJyxcbiAgICAgIGRlZmF1bHQ6IGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICAvLyBTcGxpdCB0aGUgbmV3IG1lc3NhZ2UgaW50byB0aXRsZSBhbmQgbWVzc2FnZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBHaXRodWIgQVBJIGV4cGVjdHMgdGl0bGUgYW5kIG1lc3NhZ2UgdG8gYmUgcGFzc2VkIHNlcGFyYXRlbHkuXG4gICAgY29uc3QgW25ld1RpdGxlLCAuLi5uZXdNZXNzYWdlXSA9IHJlc3VsdC5zcGxpdChDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lcmdlIG9wdGlvbnMgc28gdGhhdCB0aGUgY2hhbmdlcyBhcmUgcmVmbGVjdGVkIGluIHRoZXJlLlxuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfdGl0bGUgPSBgJHtuZXdUaXRsZX0gKCMke3B1bGxSZXF1ZXN0LnByTnVtYmVyfSlgO1xuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfbWVzc2FnZSA9IG5ld01lc3NhZ2Uuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGNvbW1pdCBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBHaXRodWIgYnkgZGVmYXVsdCBjb25jYXRlbmF0ZXNcbiAgICogbXVsdGlwbGUgY29tbWl0IG1lc3NhZ2VzIGlmIGEgUFIgaXMgbWVyZ2VkIGluIHNxdWFzaCBtb2RlLiBXZSB0cnkgdG8gcmVwbGljYXRlIHRoaXNcbiAgICogYmVoYXZpb3IgaGVyZSBzbyB0aGF0IHdlIGhhdmUgYSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRoYXQgY2FuIGJlIGZpeGVkIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IHRoaXMuX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMocHVsbFJlcXVlc3QpKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1hcChtZXNzYWdlID0+ICh7bWVzc2FnZSwgcGFyc2VkOiBwYXJzZUNvbW1pdE1lc3NhZ2UobWVzc2FnZSl9KSk7XG4gICAgY29uc3QgbWVzc2FnZUJhc2UgPSBgJHtwdWxsUmVxdWVzdC50aXRsZX0ke0NPTU1JVF9IRUFERVJfU0VQQVJBVE9SfWA7XG4gICAgaWYgKGNvbW1pdHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2NvbW1pdHNbMF0ucGFyc2VkLmJvZHl9YDtcbiAgICB9XG4gICAgY29uc3Qgam9pbmVkTWVzc2FnZXMgPSBjb21taXRzLm1hcChjID0+IGAqICR7Yy5tZXNzYWdlfWApLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2pvaW5lZE1lc3NhZ2VzfWA7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgY29tbWl0IG1lc3NhZ2VzIG9mIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyh7cHJOdW1iZXJ9OiBQdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSB0aGlzLmdpdC5naXRodWIucHVsbHMubGlzdENvbW1pdHMuZW5kcG9pbnQubWVyZ2UoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIGNvbnN0IGFsbENvbW1pdHM6IE9jdG9raXQuUHVsbHNMaXN0Q29tbWl0c1Jlc3BvbnNlID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnBhZ2luYXRlKHJlcXVlc3QpO1xuICAgIHJldHVybiBhbGxDb21taXRzLm1hcCgoe2NvbW1pdH0pID0+IGNvbW1pdC5tZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgZ2l2ZW4gcHVsbCByZXF1ZXN0IGNvdWxkIGJlIG1lcmdlZCBpbnRvIGl0cyB0YXJnZXQgYnJhbmNoZXMuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaWYgaXQgdGhlIFBSIGNvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jaGVja01lcmdhYmlsaXR5KHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCwgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdKTpcbiAgICAgIFByb21pc2U8bnVsbHxQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gdGhpcy5nZXRQdWxsUmVxdWVzdFJldmlzaW9uUmFuZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID1cbiAgICAgICAgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzLCB7ZHJ5UnVuOiB0cnVlfSk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgbWVyZ2UgYWN0aW9uIGZyb20gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3Qoe2xhYmVsc306IFB1bGxSZXF1ZXN0KTogR2l0aHViQXBpTWVyZ2VNZXRob2Qge1xuICAgIGlmICh0aGlzLl9jb25maWcubGFiZWxzKSB7XG4gICAgICBjb25zdCBtYXRjaGluZ0xhYmVsID1cbiAgICAgICAgICB0aGlzLl9jb25maWcubGFiZWxzLmZpbmQoKHtwYXR0ZXJufSkgPT4gbGFiZWxzLnNvbWUobCA9PiBtYXRjaGVzUGF0dGVybihsLCBwYXR0ZXJuKSkpO1xuICAgICAgaWYgKG1hdGNoaW5nTGFiZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hpbmdMYWJlbC5tZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb25maWcuZGVmYXVsdDtcbiAgfVxufVxuIl19