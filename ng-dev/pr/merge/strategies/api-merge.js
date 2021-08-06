"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubApiMergeStrategy = void 0;
const inquirer_1 = require("inquirer");
const parse_1 = require("../../../commit-message/parse");
const failures_1 = require("../failures");
const string_pattern_1 = require("../string-pattern");
const strategy_1 = require("./strategy");
/** Separator between commit message header and body. */
const COMMIT_HEADER_SEPARATOR = '\n\n';
/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
class GithubApiMergeStrategy extends strategy_1.MergeStrategy {
    constructor(git, _config) {
        super(git);
        this._config = _config;
    }
    async merge(pullRequest) {
        const { githubTargetBranch, prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup } = pullRequest;
        // If the pull request does not have its base branch set to any determined target
        // branch, we cannot merge using the API.
        if (targetBranches.every((t) => t !== githubTargetBranch)) {
            return failures_1.PullRequestFailure.mismatchingTargetBranch(targetBranches);
        }
        // In cases where a required base commit is specified for this pull request, check if
        // the pull request contains the given commit. If not, return a pull request failure.
        // This check is useful for enforcing that PRs are rebased on top of a given commit.
        // e.g. a commit that changes the code ownership validation. PRs which are not rebased
        // could bypass new codeowner ship rules.
        if (requiredBaseSha && !this.git.hasCommit(strategy_1.TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
            return failures_1.PullRequestFailure.unsatisfiedBaseSha();
        }
        const method = this._getMergeActionFromPullRequest(pullRequest);
        const cherryPickTargetBranches = targetBranches.filter((b) => b !== githubTargetBranch);
        // First cherry-pick the PR into all local target branches in dry-run mode. This is
        // purely for testing so that we can figure out whether the PR can be cherry-picked
        // into the other target branches. We don't want to merge the PR through the API, and
        // then run into cherry-pick conflicts after the initial merge already completed.
        const failure = await this._checkMergability(pullRequest, cherryPickTargetBranches);
        // If the PR could not be cherry-picked into all target branches locally, we know it can't
        // be done through the Github API either. We abort merging and pass-through the failure.
        if (failure !== null) {
            return failure;
        }
        const mergeOptions = {
            pull_number: prNumber,
            merge_method: method,
            ...this.git.remoteParams,
        };
        if (needsCommitMessageFixup) {
            // Commit message fixup does not work with other merge methods as the Github API only
            // allows commit message modifications for squash merging.
            if (method !== 'squash') {
                return failures_1.PullRequestFailure.unableToFixupCommitMessageSquashOnly();
            }
            await this._promptCommitMessageEdit(pullRequest, mergeOptions);
        }
        let mergeStatusCode;
        let targetSha;
        try {
            // Merge the pull request using the Github API into the selected base branch.
            const result = await this.git.github.pulls.merge(mergeOptions);
            mergeStatusCode = result.status;
            targetSha = result.data.sha;
        }
        catch (e) {
            // Note: Github usually returns `404` as status code if the API request uses a
            // token with insufficient permissions. Github does this because it doesn't want
            // to leak whether a repository exists or not. In our case we expect a certain
            // repository to exist, so we always treat this as a permission failure.
            if (e.status === 403 || e.status === 404) {
                return failures_1.PullRequestFailure.insufficientPermissionsToMerge();
            }
            throw e;
        }
        // https://developer.github.com/v3/pulls/#response-if-merge-cannot-be-performed
        // Pull request cannot be merged due to merge conflicts.
        if (mergeStatusCode === 405) {
            return failures_1.PullRequestFailure.mergeConflicts([githubTargetBranch]);
        }
        if (mergeStatusCode !== 200) {
            return failures_1.PullRequestFailure.unknownMergeError();
        }
        // If the PR does  not need to be merged into any other target branches,
        // we exit here as we already completed the merge.
        if (!cherryPickTargetBranches.length) {
            return null;
        }
        // Refresh the target branch the PR has been merged into through the API. We need
        // to re-fetch as otherwise we cannot cherry-pick the new commits into the remaining
        // target branches.
        this.fetchTargetBranches([githubTargetBranch]);
        // Number of commits that have landed in the target branch. This could vary from
        // the count of commits in the PR due to squashing.
        const targetCommitsCount = method === 'squash' ? 1 : pullRequest.commitCount;
        // Cherry pick the merged commits into the remaining target branches.
        const failedBranches = await this.cherryPickIntoTargetBranches(`${targetSha}~${targetCommitsCount}..${targetSha}`, cherryPickTargetBranches, {
            // Commits that have been created by the Github API do not necessarily contain
            // a reference to the source pull request (unless the squash strategy is used).
            // To ensure that original commits can be found when a commit is viewed in a
            // target branch, we add a link to the original commits when cherry-picking.
            linkToOriginalCommits: true,
        });
        // We already checked whether the PR can be cherry-picked into the target branches,
        // but in case the cherry-pick somehow fails, we still handle the conflicts here. The
        // commits created through the Github API could be different (i.e. through squash).
        if (failedBranches.length) {
            return failures_1.PullRequestFailure.mergeConflicts(failedBranches);
        }
        this.pushTargetBranchesUpstream(cherryPickTargetBranches);
        return null;
    }
    /**
     * Prompts the user for the commit message changes. Unlike as in the autosquash merge
     * strategy, we cannot start an interactive rebase because we merge using the Github API.
     * The Github API only allows modifications to PR title and body for squash merges.
     */
    async _promptCommitMessageEdit(pullRequest, mergeOptions) {
        const commitMessage = await this._getDefaultSquashCommitMessage(pullRequest);
        const { result } = await inquirer_1.prompt({
            type: 'editor',
            name: 'result',
            message: 'Please update the commit message',
            default: commitMessage,
        });
        // Split the new message into title and message. This is necessary because the
        // Github API expects title and message to be passed separately.
        const [newTitle, ...newMessage] = result.split(COMMIT_HEADER_SEPARATOR);
        // Update the merge options so that the changes are reflected in there.
        mergeOptions.commit_title = `${newTitle} (#${pullRequest.prNumber})`;
        mergeOptions.commit_message = newMessage.join(COMMIT_HEADER_SEPARATOR);
    }
    /**
     * Gets a commit message for the given pull request. Github by default concatenates
     * multiple commit messages if a PR is merged in squash mode. We try to replicate this
     * behavior here so that we have a default commit message that can be fixed up.
     */
    async _getDefaultSquashCommitMessage(pullRequest) {
        const commits = (await this._getPullRequestCommitMessages(pullRequest)).map((message) => ({
            message,
            parsed: parse_1.parseCommitMessage(message),
        }));
        const messageBase = `${pullRequest.title}${COMMIT_HEADER_SEPARATOR}`;
        if (commits.length <= 1) {
            return `${messageBase}${commits[0].parsed.body}`;
        }
        const joinedMessages = commits.map((c) => `* ${c.message}`).join(COMMIT_HEADER_SEPARATOR);
        return `${messageBase}${joinedMessages}`;
    }
    /** Gets all commit messages of commits in the pull request. */
    async _getPullRequestCommitMessages({ prNumber }) {
        const allCommits = await this.git.github.paginate(this.git.github.pulls.listCommits, {
            ...this.git.remoteParams,
            pull_number: prNumber,
        });
        return allCommits.map(({ commit }) => commit.message);
    }
    /**
     * Checks if given pull request could be merged into its target branches.
     * @returns A pull request failure if it the PR could not be merged.
     */
    async _checkMergability(pullRequest, targetBranches) {
        const revisionRange = this.getPullRequestRevisionRange(pullRequest);
        const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches, {
            dryRun: true,
        });
        if (failedBranches.length) {
            return failures_1.PullRequestFailure.mergeConflicts(failedBranches);
        }
        return null;
    }
    /** Determines the merge action from the given pull request. */
    _getMergeActionFromPullRequest({ labels }) {
        if (this._config.labels) {
            const matchingLabel = this._config.labels.find(({ pattern }) => labels.some((l) => string_pattern_1.matchesPattern(l, pattern)));
            if (matchingLabel !== undefined) {
                return matchingLabel.method;
            }
        }
        return this._config.default;
    }
}
exports.GithubApiMergeStrategy = GithubApiMergeStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILHVDQUFnQztBQUVoQyx5REFBaUU7QUFHakUsMENBQStDO0FBRS9DLHNEQUFpRDtBQUVqRCx5Q0FBOEQ7QUFhOUQsd0RBQXdEO0FBQ3hELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxDQUFDO0FBRXZDOzs7Ozs7R0FNRztBQUNILE1BQWEsc0JBQXVCLFNBQVEsd0JBQWE7SUFDdkQsWUFBWSxHQUEyQixFQUFVLE9BQXFDO1FBQ3BGLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQURvQyxZQUFPLEdBQVAsT0FBTyxDQUE4QjtJQUV0RixDQUFDO0lBRVEsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUF3QjtRQUMzQyxNQUFNLEVBQUMsa0JBQWtCLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsdUJBQXVCLEVBQUMsR0FDNUYsV0FBVyxDQUFDO1FBQ2QsaUZBQWlGO1FBQ2pGLHlDQUF5QztRQUN6QyxJQUFJLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxrQkFBa0IsQ0FBQyxFQUFFO1lBQ3pELE9BQU8sNkJBQWtCLENBQUMsdUJBQXVCLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDbkU7UUFFRCxxRkFBcUY7UUFDckYscUZBQXFGO1FBQ3JGLG9GQUFvRjtRQUNwRixzRkFBc0Y7UUFDdEYseUNBQXlDO1FBQ3pDLElBQUksZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsOEJBQW1CLEVBQUUsZUFBZSxDQUFDLEVBQUU7WUFDaEYsT0FBTyw2QkFBa0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQ2hEO1FBRUQsTUFB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QztRQUNwRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsRUFBRTtZQUN0RixNQUFNLEVBQUUsSUFBSTtTQUNiLENBQUMsQ0FBQztRQUVILElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLDZCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMxRDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELCtEQUErRDtJQUN2RCw4QkFBOEIsQ0FBQyxFQUFDLE1BQU0sRUFBYztRQUMxRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ3ZCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsT0FBTyxFQUFDLEVBQUUsRUFBRSxDQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQywrQkFBYyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUMvQyxDQUFDO1lBQ0YsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDN0I7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQztDQUNGO0FBN01ELHdEQTZNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Jlc3RFbmRwb2ludE1ldGhvZFR5cGVzfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgT2N0b2tpdCBgbWVyZ2VgIEFQSSBlbmRwb2ludC4gKi9cbnR5cGUgT2N0b2tpdE1lcmdlUGFyYW1zID0gUmVzdEVuZHBvaW50TWV0aG9kVHlwZXNbJ3B1bGxzJ11bJ21lcmdlJ11bJ3BhcmFtZXRlcnMnXTtcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBHaXRodWIgQVBJIG1lcmdlIHN0cmF0ZWd5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5Q29uZmlnIHtcbiAgLyoqIERlZmF1bHQgbWV0aG9kIHVzZWQgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cyAqL1xuICBkZWZhdWx0OiBHaXRodWJBcGlNZXJnZU1ldGhvZDtcbiAgLyoqIExhYmVscyB3aGljaCBzcGVjaWZ5IGEgZGlmZmVyZW50IG1lcmdlIG1ldGhvZCB0aGFuIHRoZSBkZWZhdWx0LiAqL1xuICBsYWJlbHM/OiB7cGF0dGVybjogc3RyaW5nOyBtZXRob2Q6IEdpdGh1YkFwaU1lcmdlTWV0aG9kfVtdO1xufVxuXG4vKiogU2VwYXJhdG9yIGJldHdlZW4gY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGFuZCBib2R5LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IgPSAnXFxuXFxuJztcblxuLyoqXG4gKiBNZXJnZSBzdHJhdGVneSB0aGF0IHByaW1hcmlseSBsZXZlcmFnZXMgdGhlIEdpdGh1YiBBUEkuIFRoZSBzdHJhdGVneSBtZXJnZXMgYSBnaXZlblxuICogcHVsbCByZXF1ZXN0IGludG8gYSB0YXJnZXQgYnJhbmNoIHVzaW5nIHRoZSBBUEkuIFRoaXMgZW5zdXJlcyB0aGF0IEdpdGh1YiBkaXNwbGF5c1xuICogdGhlIHB1bGwgcmVxdWVzdCBhcyBtZXJnZWQuIFRoZSBtZXJnZWQgY29tbWl0cyBhcmUgdGhlbiBjaGVycnktcGlja2VkIGludG8gdGhlIHJlbWFpbmluZ1xuICogdGFyZ2V0IGJyYW5jaGVzIHVzaW5nIHRoZSBsb2NhbCBHaXQgaW5zdGFuY2UuIFRoZSBiZW5lZml0IGlzIHRoYXQgdGhlIEdpdGh1YiBtZXJnZWQgc3RhdGVcbiAqIGlzIHByb3Blcmx5IHNldCwgYnV0IGEgbm90YWJsZSBkb3duc2lkZSBpcyB0aGF0IFBScyBjYW5ub3QgdXNlIGZpeHVwIG9yIHNxdWFzaCBjb21taXRzLlxuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZSB8IG51bGw+IHtcbiAgICBjb25zdCB7Z2l0aHViVGFyZ2V0QnJhbmNoLCBwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXB9ID1cbiAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KCh0KSA9PiB0ICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1pc21hdGNoaW5nVGFyZ2V0QnJhbmNoKHRhcmdldEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlcyB3aGVyZSBhIHJlcXVpcmVkIGJhc2UgY29tbWl0IGlzIHNwZWNpZmllZCBmb3IgdGhpcyBwdWxsIHJlcXVlc3QsIGNoZWNrIGlmXG4gICAgLy8gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyB0aGUgZ2l2ZW4gY29tbWl0LiBJZiBub3QsIHJldHVybiBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlLlxuICAgIC8vIFRoaXMgY2hlY2sgaXMgdXNlZnVsIGZvciBlbmZvcmNpbmcgdGhhdCBQUnMgYXJlIHJlYmFzZWQgb24gdG9wIG9mIGEgZ2l2ZW4gY29tbWl0LlxuICAgIC8vIGUuZy4gYSBjb21taXQgdGhhdCBjaGFuZ2VzIHRoZSBjb2RlIG93bmVyc2hpcCB2YWxpZGF0aW9uLiBQUnMgd2hpY2ggYXJlIG5vdCByZWJhc2VkXG4gICAgLy8gY291bGQgYnlwYXNzIG5ldyBjb2Rlb3duZXIgc2hpcCBydWxlcy5cbiAgICBpZiAocmVxdWlyZWRCYXNlU2hhICYmICF0aGlzLmdpdC5oYXNDb21taXQoVEVNUF9QUl9IRUFEX0JSQU5DSCwgcmVxdWlyZWRCYXNlU2hhKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bnNhdGlzZmllZEJhc2VTaGEoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRob2QgPSB0aGlzLl9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdChwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzID0gdGFyZ2V0QnJhbmNoZXMuZmlsdGVyKChiKSA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBPY3Rva2l0TWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5pbnN1ZmZpY2llbnRQZXJtaXNzaW9uc1RvTWVyZ2UoKTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92My9wdWxscy8jcmVzcG9uc2UtaWYtbWVyZ2UtY2Fubm90LWJlLXBlcmZvcm1lZFxuICAgIC8vIFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGR1ZSB0byBtZXJnZSBjb25mbGljdHMuXG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSA9PT0gNDA1KSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcbiAgICB9XG4gICAgaWYgKG1lcmdlU3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVua25vd25NZXJnZUVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIFBSIGRvZXMgIG5vdCBuZWVkIHRvIGJlIG1lcmdlZCBpbnRvIGFueSBvdGhlciB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gd2UgZXhpdCBoZXJlIGFzIHdlIGFscmVhZHkgY29tcGxldGVkIHRoZSBtZXJnZS5cbiAgICBpZiAoIWNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIFJlZnJlc2ggdGhlIHRhcmdldCBicmFuY2ggdGhlIFBSIGhhcyBiZWVuIG1lcmdlZCBpbnRvIHRocm91Z2ggdGhlIEFQSS4gV2UgbmVlZFxuICAgIC8vIHRvIHJlLWZldGNoIGFzIG90aGVyd2lzZSB3ZSBjYW5ub3QgY2hlcnJ5LXBpY2sgdGhlIG5ldyBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZ1xuICAgIC8vIHRhcmdldCBicmFuY2hlcy5cbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuXG4gICAgLy8gTnVtYmVyIG9mIGNvbW1pdHMgdGhhdCBoYXZlIGxhbmRlZCBpbiB0aGUgdGFyZ2V0IGJyYW5jaC4gVGhpcyBjb3VsZCB2YXJ5IGZyb21cbiAgICAvLyB0aGUgY291bnQgb2YgY29tbWl0cyBpbiB0aGUgUFIgZHVlIHRvIHNxdWFzaGluZy5cbiAgICBjb25zdCB0YXJnZXRDb21taXRzQ291bnQgPSBtZXRob2QgPT09ICdzcXVhc2gnID8gMSA6IHB1bGxSZXF1ZXN0LmNvbW1pdENvdW50O1xuXG4gICAgLy8gQ2hlcnJ5IHBpY2sgdGhlIG1lcmdlZCBjb21taXRzIGludG8gdGhlIHJlbWFpbmluZyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSBhd2FpdCB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMoXG4gICAgICBgJHt0YXJnZXRTaGF9fiR7dGFyZ2V0Q29tbWl0c0NvdW50fS4uJHt0YXJnZXRTaGF9YCxcbiAgICAgIGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyxcbiAgICAgIHtcbiAgICAgICAgLy8gQ29tbWl0cyB0aGF0IGhhdmUgYmVlbiBjcmVhdGVkIGJ5IHRoZSBHaXRodWIgQVBJIGRvIG5vdCBuZWNlc3NhcmlseSBjb250YWluXG4gICAgICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZSBzb3VyY2UgcHVsbCByZXF1ZXN0ICh1bmxlc3MgdGhlIHNxdWFzaCBzdHJhdGVneSBpcyB1c2VkKS5cbiAgICAgICAgLy8gVG8gZW5zdXJlIHRoYXQgb3JpZ2luYWwgY29tbWl0cyBjYW4gYmUgZm91bmQgd2hlbiBhIGNvbW1pdCBpcyB2aWV3ZWQgaW4gYVxuICAgICAgICAvLyB0YXJnZXQgYnJhbmNoLCB3ZSBhZGQgYSBsaW5rIHRvIHRoZSBvcmlnaW5hbCBjb21taXRzIHdoZW4gY2hlcnJ5LXBpY2tpbmcuXG4gICAgICAgIGxpbmtUb09yaWdpbmFsQ29tbWl0czogdHJ1ZSxcbiAgICAgIH0sXG4gICAgKTtcblxuICAgIC8vIFdlIGFscmVhZHkgY2hlY2tlZCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMsXG4gICAgLy8gYnV0IGluIGNhc2UgdGhlIGNoZXJyeS1waWNrIHNvbWVob3cgZmFpbHMsIHdlIHN0aWxsIGhhbmRsZSB0aGUgY29uZmxpY3RzIGhlcmUuIFRoZVxuICAgIC8vIGNvbW1pdHMgY3JlYXRlZCB0aHJvdWdoIHRoZSBHaXRodWIgQVBJIGNvdWxkIGJlIGRpZmZlcmVudCAoaS5lLiB0aHJvdWdoIHNxdWFzaCkuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbShjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHRoZSBjb21taXQgbWVzc2FnZSBjaGFuZ2VzLiBVbmxpa2UgYXMgaW4gdGhlIGF1dG9zcXVhc2ggbWVyZ2VcbiAgICogc3RyYXRlZ3ksIHdlIGNhbm5vdCBzdGFydCBhbiBpbnRlcmFjdGl2ZSByZWJhc2UgYmVjYXVzZSB3ZSBtZXJnZSB1c2luZyB0aGUgR2l0aHViIEFQSS5cbiAgICogVGhlIEdpdGh1YiBBUEkgb25seSBhbGxvd3MgbW9kaWZpY2F0aW9ucyB0byBQUiB0aXRsZSBhbmQgYm9keSBmb3Igc3F1YXNoIG1lcmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KFxuICAgIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCxcbiAgICBtZXJnZU9wdGlvbnM6IE9jdG9raXRNZXJnZVBhcmFtcyxcbiAgKSB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGF3YWl0IHRoaXMuX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCB7cmVzdWx0fSA9IGF3YWl0IHByb21wdDx7cmVzdWx0OiBzdHJpbmd9Pih7XG4gICAgICB0eXBlOiAnZWRpdG9yJyxcbiAgICAgIG5hbWU6ICdyZXN1bHQnLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSB1cGRhdGUgdGhlIGNvbW1pdCBtZXNzYWdlJyxcbiAgICAgIGRlZmF1bHQ6IGNvbW1pdE1lc3NhZ2UsXG4gICAgfSk7XG5cbiAgICAvLyBTcGxpdCB0aGUgbmV3IG1lc3NhZ2UgaW50byB0aXRsZSBhbmQgbWVzc2FnZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSB0aGVcbiAgICAvLyBHaXRodWIgQVBJIGV4cGVjdHMgdGl0bGUgYW5kIG1lc3NhZ2UgdG8gYmUgcGFzc2VkIHNlcGFyYXRlbHkuXG4gICAgY29uc3QgW25ld1RpdGxlLCAuLi5uZXdNZXNzYWdlXSA9IHJlc3VsdC5zcGxpdChDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG5cbiAgICAvLyBVcGRhdGUgdGhlIG1lcmdlIG9wdGlvbnMgc28gdGhhdCB0aGUgY2hhbmdlcyBhcmUgcmVmbGVjdGVkIGluIHRoZXJlLlxuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfdGl0bGUgPSBgJHtuZXdUaXRsZX0gKCMke3B1bGxSZXF1ZXN0LnByTnVtYmVyfSlgO1xuICAgIG1lcmdlT3B0aW9ucy5jb21taXRfbWVzc2FnZSA9IG5ld01lc3NhZ2Uuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIGNvbW1pdCBtZXNzYWdlIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiBHaXRodWIgYnkgZGVmYXVsdCBjb25jYXRlbmF0ZXNcbiAgICogbXVsdGlwbGUgY29tbWl0IG1lc3NhZ2VzIGlmIGEgUFIgaXMgbWVyZ2VkIGluIHNxdWFzaCBtb2RlLiBXZSB0cnkgdG8gcmVwbGljYXRlIHRoaXNcbiAgICogYmVoYXZpb3IgaGVyZSBzbyB0aGF0IHdlIGhhdmUgYSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlIHRoYXQgY2FuIGJlIGZpeGVkIHVwLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBjb21taXRzID0gKGF3YWl0IHRoaXMuX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMocHVsbFJlcXVlc3QpKS5tYXAoKG1lc3NhZ2UpID0+ICh7XG4gICAgICBtZXNzYWdlLFxuICAgICAgcGFyc2VkOiBwYXJzZUNvbW1pdE1lc3NhZ2UobWVzc2FnZSksXG4gICAgfSkpO1xuICAgIGNvbnN0IG1lc3NhZ2VCYXNlID0gYCR7cHVsbFJlcXVlc3QudGl0bGV9JHtDT01NSVRfSEVBREVSX1NFUEFSQVRPUn1gO1xuICAgIGlmIChjb21taXRzLmxlbmd0aCA8PSAxKSB7XG4gICAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtjb21taXRzWzBdLnBhcnNlZC5ib2R5fWA7XG4gICAgfVxuICAgIGNvbnN0IGpvaW5lZE1lc3NhZ2VzID0gY29tbWl0cy5tYXAoKGMpID0+IGAqICR7Yy5tZXNzYWdlfWApLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2pvaW5lZE1lc3NhZ2VzfWA7XG4gIH1cblxuICAvKiogR2V0cyBhbGwgY29tbWl0IG1lc3NhZ2VzIG9mIGNvbW1pdHMgaW4gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyh7cHJOdW1iZXJ9OiBQdWxsUmVxdWVzdCkge1xuICAgIGNvbnN0IGFsbENvbW1pdHMgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucGFnaW5hdGUodGhpcy5naXQuZ2l0aHViLnB1bGxzLmxpc3RDb21taXRzLCB7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgfSk7XG4gICAgcmV0dXJuIGFsbENvbW1pdHMubWFwKCh7Y29tbWl0fSkgPT4gY29tbWl0Lm1lc3NhZ2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBnaXZlbiBwdWxsIHJlcXVlc3QgY291bGQgYmUgbWVyZ2VkIGludG8gaXRzIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpZiBpdCB0aGUgUFIgY291bGQgbm90IGJlIG1lcmdlZC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NoZWNrTWVyZ2FiaWxpdHkoXG4gICAgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LFxuICAgIHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXSxcbiAgKTogUHJvbWlzZTxudWxsIHwgUHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gICAgY29uc3QgcmV2aXNpb25SYW5nZSA9IHRoaXMuZ2V0UHVsbFJlcXVlc3RSZXZpc2lvblJhbmdlKHB1bGxSZXF1ZXN0KTtcbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcywge1xuICAgICAgZHJ5UnVuOiB0cnVlLFxuICAgIH0pO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIERldGVybWluZXMgdGhlIG1lcmdlIGFjdGlvbiBmcm9tIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgX2dldE1lcmdlQWN0aW9uRnJvbVB1bGxSZXF1ZXN0KHtsYWJlbHN9OiBQdWxsUmVxdWVzdCk6IEdpdGh1YkFwaU1lcmdlTWV0aG9kIHtcbiAgICBpZiAodGhpcy5fY29uZmlnLmxhYmVscykge1xuICAgICAgY29uc3QgbWF0Y2hpbmdMYWJlbCA9IHRoaXMuX2NvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PlxuICAgICAgICBsYWJlbHMuc29tZSgobCkgPT4gbWF0Y2hlc1BhdHRlcm4obCwgcGF0dGVybikpLFxuICAgICAgKTtcbiAgICAgIGlmIChtYXRjaGluZ0xhYmVsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoaW5nTGFiZWwubWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fY29uZmlnLmRlZmF1bHQ7XG4gIH1cbn1cbiJdfQ==