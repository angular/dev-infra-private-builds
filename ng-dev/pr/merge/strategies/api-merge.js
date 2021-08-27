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
const github_1 = require("../../../utils/git/github");
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
            if (e instanceof github_1.GithubApiRequestError && (e.status === 403 || e.status === 404)) {
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
        const { result } = await (0, inquirer_1.prompt)({
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
            parsed: (0, parse_1.parseCommitMessage)(message),
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
            const matchingLabel = this._config.labels.find(({ pattern }) => labels.some((l) => (0, string_pattern_1.matchesPattern)(l, pattern)));
            if (matchingLabel !== undefined) {
                return matchingLabel.method;
            }
        }
        return this._config.default;
    }
}
exports.GithubApiMergeStrategy = GithubApiMergeStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILHVDQUFnQztBQUVoQyx5REFBaUU7QUFHakUsMENBQStDO0FBRS9DLHNEQUFpRDtBQUVqRCx5Q0FBOEQ7QUFDOUQsc0RBQWdFO0FBYWhFLHdEQUF3RDtBQUN4RCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztBQUV2Qzs7Ozs7O0dBTUc7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHdCQUFhO0lBQ3ZELFlBQVksR0FBMkIsRUFBVSxPQUFxQztRQUNwRixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFEb0MsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7SUFFdEYsQ0FBQztJQUVRLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBd0I7UUFDM0MsTUFBTSxFQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLEdBQzVGLFdBQVcsQ0FBQztRQUNkLGlGQUFpRjtRQUNqRix5Q0FBeUM7UUFDekMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssa0JBQWtCLENBQUMsRUFBRTtZQUN6RCxPQUFPLDZCQUFrQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ25FO1FBRUQscUZBQXFGO1FBQ3JGLHFGQUFxRjtRQUNyRixvRkFBb0Y7UUFDcEYsc0ZBQXNGO1FBQ3RGLHlDQUF5QztRQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDhCQUFtQixFQUFFLGVBQWUsQ0FBQyxFQUFFO1lBQ2hGLE9BQU8sNkJBQWtCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztT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QUV4QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUU7WUFDdEYsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7UUFFSCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7WUFDekIsT0FBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCwrREFBK0Q7SUFDdkQsOEJBQThCLENBQUMsRUFBQyxNQUFNLEVBQWM7UUFDMUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUUsQ0FDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSwrQkFBYyxFQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUMvQyxDQUFDO1lBQ0YsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDN0I7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQztDQUNGO0FBN01ELHdEQTZNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Jlc3RFbmRwb2ludE1ldGhvZFR5cGVzfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZH0gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgT2N0b2tpdCBgbWVyZ2VgIEFQSSBlbmRwb2ludC4gKi9cbnR5cGUgT2N0b2tpdE1lcmdlUGFyYW1zID0gUmVzdEVuZHBvaW50TWV0aG9kVHlwZXNbJ3B1bGxzJ11bJ21lcmdlJ11bJ3BhcmFtZXRlcnMnXTtcblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIHRoZSBHaXRodWIgQVBJIG1lcmdlIHN0cmF0ZWd5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJBcGlNZXJnZVN0cmF0ZWd5Q29uZmlnIHtcbiAgLyoqIERlZmF1bHQgbWV0aG9kIHVzZWQgZm9yIG1lcmdpbmcgcHVsbCByZXF1ZXN0cyAqL1xuICBkZWZhdWx0OiBHaXRodWJBcGlNZXJnZU1ldGhvZDtcbiAgLyoqIExhYmVscyB3aGljaCBzcGVjaWZ5IGEgZGlmZmVyZW50IG1lcmdlIG1ldGhvZCB0aGFuIHRoZSBkZWZhdWx0LiAqL1xuICBsYWJlbHM/OiB7cGF0dGVybjogc3RyaW5nOyBtZXRob2Q6IEdpdGh1YkFwaU1lcmdlTWV0aG9kfVtdO1xufVxuXG4vKiogU2VwYXJhdG9yIGJldHdlZW4gY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGFuZCBib2R5LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IgPSAnXFxuXFxuJztcblxuLyoqXG4gKiBNZXJnZSBzdHJhdGVneSB0aGF0IHByaW1hcmlseSBsZXZlcmFnZXMgdGhlIEdpdGh1YiBBUEkuIFRoZSBzdHJhdGVneSBtZXJnZXMgYSBnaXZlblxuICogcHVsbCByZXF1ZXN0IGludG8gYSB0YXJnZXQgYnJhbmNoIHVzaW5nIHRoZSBBUEkuIFRoaXMgZW5zdXJlcyB0aGF0IEdpdGh1YiBkaXNwbGF5c1xuICogdGhlIHB1bGwgcmVxdWVzdCBhcyBtZXJnZWQuIFRoZSBtZXJnZWQgY29tbWl0cyBhcmUgdGhlbiBjaGVycnktcGlja2VkIGludG8gdGhlIHJlbWFpbmluZ1xuICogdGFyZ2V0IGJyYW5jaGVzIHVzaW5nIHRoZSBsb2NhbCBHaXQgaW5zdGFuY2UuIFRoZSBiZW5lZml0IGlzIHRoYXQgdGhlIEdpdGh1YiBtZXJnZWQgc3RhdGVcbiAqIGlzIHByb3Blcmx5IHNldCwgYnV0IGEgbm90YWJsZSBkb3duc2lkZSBpcyB0aGF0IFBScyBjYW5ub3QgdXNlIGZpeHVwIG9yIHNxdWFzaCBjb21taXRzLlxuICovXG5leHBvcnQgY2xhc3MgR2l0aHViQXBpTWVyZ2VTdHJhdGVneSBleHRlbmRzIE1lcmdlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIHByaXZhdGUgX2NvbmZpZzogR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZykge1xuICAgIHN1cGVyKGdpdCk7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZSB8IG51bGw+IHtcbiAgICBjb25zdCB7Z2l0aHViVGFyZ2V0QnJhbmNoLCBwck51bWJlciwgdGFyZ2V0QnJhbmNoZXMsIHJlcXVpcmVkQmFzZVNoYSwgbmVlZHNDb21taXRNZXNzYWdlRml4dXB9ID1cbiAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgZG9lcyBub3QgaGF2ZSBpdHMgYmFzZSBicmFuY2ggc2V0IHRvIGFueSBkZXRlcm1pbmVkIHRhcmdldFxuICAgIC8vIGJyYW5jaCwgd2UgY2Fubm90IG1lcmdlIHVzaW5nIHRoZSBBUEkuXG4gICAgaWYgKHRhcmdldEJyYW5jaGVzLmV2ZXJ5KCh0KSA9PiB0ICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1pc21hdGNoaW5nVGFyZ2V0QnJhbmNoKHRhcmdldEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICAvLyBJbiBjYXNlcyB3aGVyZSBhIHJlcXVpcmVkIGJhc2UgY29tbWl0IGlzIHNwZWNpZmllZCBmb3IgdGhpcyBwdWxsIHJlcXVlc3QsIGNoZWNrIGlmXG4gICAgLy8gdGhlIHB1bGwgcmVxdWVzdCBjb250YWlucyB0aGUgZ2l2ZW4gY29tbWl0LiBJZiBub3QsIHJldHVybiBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlLlxuICAgIC8vIFRoaXMgY2hlY2sgaXMgdXNlZnVsIGZvciBlbmZvcmNpbmcgdGhhdCBQUnMgYXJlIHJlYmFzZWQgb24gdG9wIG9mIGEgZ2l2ZW4gY29tbWl0LlxuICAgIC8vIGUuZy4gYSBjb21taXQgdGhhdCBjaGFuZ2VzIHRoZSBjb2RlIG93bmVyc2hpcCB2YWxpZGF0aW9uLiBQUnMgd2hpY2ggYXJlIG5vdCByZWJhc2VkXG4gICAgLy8gY291bGQgYnlwYXNzIG5ldyBjb2Rlb3duZXIgc2hpcCBydWxlcy5cbiAgICBpZiAocmVxdWlyZWRCYXNlU2hhICYmICF0aGlzLmdpdC5oYXNDb21taXQoVEVNUF9QUl9IRUFEX0JSQU5DSCwgcmVxdWlyZWRCYXNlU2hhKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bnNhdGlzZmllZEJhc2VTaGEoKTtcbiAgICB9XG5cbiAgICBjb25zdCBtZXRob2QgPSB0aGlzLl9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdChwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzID0gdGFyZ2V0QnJhbmNoZXMuZmlsdGVyKChiKSA9PiBiICE9PSBnaXRodWJUYXJnZXRCcmFuY2gpO1xuXG4gICAgLy8gRmlyc3QgY2hlcnJ5LXBpY2sgdGhlIFBSIGludG8gYWxsIGxvY2FsIHRhcmdldCBicmFuY2hlcyBpbiBkcnktcnVuIG1vZGUuIFRoaXMgaXNcbiAgICAvLyBwdXJlbHkgZm9yIHRlc3Rpbmcgc28gdGhhdCB3ZSBjYW4gZmlndXJlIG91dCB3aGV0aGVyIHRoZSBQUiBjYW4gYmUgY2hlcnJ5LXBpY2tlZFxuICAgIC8vIGludG8gdGhlIG90aGVyIHRhcmdldCBicmFuY2hlcy4gV2UgZG9uJ3Qgd2FudCB0byBtZXJnZSB0aGUgUFIgdGhyb3VnaCB0aGUgQVBJLCBhbmRcbiAgICAvLyB0aGVuIHJ1biBpbnRvIGNoZXJyeS1waWNrIGNvbmZsaWN0cyBhZnRlciB0aGUgaW5pdGlhbCBtZXJnZSBhbHJlYWR5IGNvbXBsZXRlZC5cbiAgICBjb25zdCBmYWlsdXJlID0gYXdhaXQgdGhpcy5fY2hlY2tNZXJnYWJpbGl0eShwdWxsUmVxdWVzdCwgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIElmIHRoZSBQUiBjb3VsZCBub3QgYmUgY2hlcnJ5LXBpY2tlZCBpbnRvIGFsbCB0YXJnZXQgYnJhbmNoZXMgbG9jYWxseSwgd2Uga25vdyBpdCBjYW4ndFxuICAgIC8vIGJlIGRvbmUgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBlaXRoZXIuIFdlIGFib3J0IG1lcmdpbmcgYW5kIHBhc3MtdGhyb3VnaCB0aGUgZmFpbHVyZS5cbiAgICBpZiAoZmFpbHVyZSAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhaWx1cmU7XG4gICAgfVxuXG4gICAgY29uc3QgbWVyZ2VPcHRpb25zOiBPY3Rva2l0TWVyZ2VQYXJhbXMgPSB7XG4gICAgICBwdWxsX251bWJlcjogcHJOdW1iZXIsXG4gICAgICBtZXJnZV9tZXRob2Q6IG1ldGhvZCxcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICB9O1xuXG4gICAgaWYgKG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwKSB7XG4gICAgICAvLyBDb21taXQgbWVzc2FnZSBmaXh1cCBkb2VzIG5vdCB3b3JrIHdpdGggb3RoZXIgbWVyZ2UgbWV0aG9kcyBhcyB0aGUgR2l0aHViIEFQSSBvbmx5XG4gICAgICAvLyBhbGxvd3MgY29tbWl0IG1lc3NhZ2UgbW9kaWZpY2F0aW9ucyBmb3Igc3F1YXNoIG1lcmdpbmcuXG4gICAgICBpZiAobWV0aG9kICE9PSAnc3F1YXNoJykge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnVuYWJsZVRvRml4dXBDb21taXRNZXNzYWdlU3F1YXNoT25seSgpO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5fcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQocHVsbFJlcXVlc3QsIG1lcmdlT3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IG1lcmdlU3RhdHVzQ29kZTogbnVtYmVyO1xuICAgIGxldCB0YXJnZXRTaGE6IHN0cmluZztcblxuICAgIHRyeSB7XG4gICAgICAvLyBNZXJnZSB0aGUgcHVsbCByZXF1ZXN0IHVzaW5nIHRoZSBHaXRodWIgQVBJIGludG8gdGhlIHNlbGVjdGVkIGJhc2UgYnJhbmNoLlxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLm1lcmdlKG1lcmdlT3B0aW9ucyk7XG5cbiAgICAgIG1lcmdlU3RhdHVzQ29kZSA9IHJlc3VsdC5zdGF0dXM7XG4gICAgICB0YXJnZXRTaGEgPSByZXN1bHQuZGF0YS5zaGE7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gTm90ZTogR2l0aHViIHVzdWFsbHkgcmV0dXJucyBgNDA0YCBhcyBzdGF0dXMgY29kZSBpZiB0aGUgQVBJIHJlcXVlc3QgdXNlcyBhXG4gICAgICAvLyB0b2tlbiB3aXRoIGluc3VmZmljaWVudCBwZXJtaXNzaW9ucy4gR2l0aHViIGRvZXMgdGhpcyBiZWNhdXNlIGl0IGRvZXNuJ3Qgd2FudFxuICAgICAgLy8gdG8gbGVhayB3aGV0aGVyIGEgcmVwb3NpdG9yeSBleGlzdHMgb3Igbm90LiBJbiBvdXIgY2FzZSB3ZSBleHBlY3QgYSBjZXJ0YWluXG4gICAgICAvLyByZXBvc2l0b3J5IHRvIGV4aXN0LCBzbyB3ZSBhbHdheXMgdHJlYXQgdGhpcyBhcyBhIHBlcm1pc3Npb24gZmFpbHVyZS5cbiAgICAgIGlmIChlIGluc3RhbmNlb2YgR2l0aHViQXBpUmVxdWVzdEVycm9yICYmIChlLnN0YXR1cyA9PT0gNDAzIHx8IGUuc3RhdHVzID09PSA0MDQpKSB7XG4gICAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuaW5zdWZmaWNpZW50UGVybWlzc2lvbnNUb01lcmdlKCk7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjMvcHVsbHMvI3Jlc3BvbnNlLWlmLW1lcmdlLWNhbm5vdC1iZS1wZXJmb3JtZWRcbiAgICAvLyBQdWxsIHJlcXVlc3QgY2Fubm90IGJlIG1lcmdlZCBkdWUgdG8gbWVyZ2UgY29uZmxpY3RzLlxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgPT09IDQwNSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG4gICAgfVxuICAgIGlmIChtZXJnZVN0YXR1c0NvZGUgIT09IDIwMCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmtub3duTWVyZ2VFcnJvcigpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBQUiBkb2VzICBub3QgbmVlZCB0byBiZSBtZXJnZWQgaW50byBhbnkgb3RoZXIgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIHdlIGV4aXQgaGVyZSBhcyB3ZSBhbHJlYWR5IGNvbXBsZXRlZCB0aGUgbWVyZ2UuXG4gICAgaWYgKCFjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBSZWZyZXNoIHRoZSB0YXJnZXQgYnJhbmNoIHRoZSBQUiBoYXMgYmVlbiBtZXJnZWQgaW50byB0aHJvdWdoIHRoZSBBUEkuIFdlIG5lZWRcbiAgICAvLyB0byByZS1mZXRjaCBhcyBvdGhlcndpc2Ugd2UgY2Fubm90IGNoZXJyeS1waWNrIHRoZSBuZXcgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmdcbiAgICAvLyB0YXJnZXQgYnJhbmNoZXMuXG4gICAgdGhpcy5mZXRjaFRhcmdldEJyYW5jaGVzKFtnaXRodWJUYXJnZXRCcmFuY2hdKTtcblxuICAgIC8vIE51bWJlciBvZiBjb21taXRzIHRoYXQgaGF2ZSBsYW5kZWQgaW4gdGhlIHRhcmdldCBicmFuY2guIFRoaXMgY291bGQgdmFyeSBmcm9tXG4gICAgLy8gdGhlIGNvdW50IG9mIGNvbW1pdHMgaW4gdGhlIFBSIGR1ZSB0byBzcXVhc2hpbmcuXG4gICAgY29uc3QgdGFyZ2V0Q29tbWl0c0NvdW50ID0gbWV0aG9kID09PSAnc3F1YXNoJyA/IDEgOiBwdWxsUmVxdWVzdC5jb21taXRDb3VudDtcblxuICAgIC8vIENoZXJyeSBwaWNrIHRoZSBtZXJnZWQgY29tbWl0cyBpbnRvIHRoZSByZW1haW5pbmcgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gYXdhaXQgdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKFxuICAgICAgYCR7dGFyZ2V0U2hhfX4ke3RhcmdldENvbW1pdHNDb3VudH0uLiR7dGFyZ2V0U2hhfWAsXG4gICAgICBjaGVycnlQaWNrVGFyZ2V0QnJhbmNoZXMsXG4gICAgICB7XG4gICAgICAgIC8vIENvbW1pdHMgdGhhdCBoYXZlIGJlZW4gY3JlYXRlZCBieSB0aGUgR2l0aHViIEFQSSBkbyBub3QgbmVjZXNzYXJpbHkgY29udGFpblxuICAgICAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGUgc291cmNlIHB1bGwgcmVxdWVzdCAodW5sZXNzIHRoZSBzcXVhc2ggc3RyYXRlZ3kgaXMgdXNlZCkuXG4gICAgICAgIC8vIFRvIGVuc3VyZSB0aGF0IG9yaWdpbmFsIGNvbW1pdHMgY2FuIGJlIGZvdW5kIHdoZW4gYSBjb21taXQgaXMgdmlld2VkIGluIGFcbiAgICAgICAgLy8gdGFyZ2V0IGJyYW5jaCwgd2UgYWRkIGEgbGluayB0byB0aGUgb3JpZ2luYWwgY29tbWl0cyB3aGVuIGNoZXJyeS1waWNraW5nLlxuICAgICAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM6IHRydWUsXG4gICAgICB9LFxuICAgICk7XG5cbiAgICAvLyBXZSBhbHJlYWR5IGNoZWNrZWQgd2hldGhlciB0aGUgUFIgY2FuIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzLFxuICAgIC8vIGJ1dCBpbiBjYXNlIHRoZSBjaGVycnktcGljayBzb21laG93IGZhaWxzLCB3ZSBzdGlsbCBoYW5kbGUgdGhlIGNvbmZsaWN0cyBoZXJlLiBUaGVcbiAgICAvLyBjb21taXRzIGNyZWF0ZWQgdGhyb3VnaCB0aGUgR2l0aHViIEFQSSBjb3VsZCBiZSBkaWZmZXJlbnQgKGkuZS4gdGhyb3VnaCBzcXVhc2gpLlxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cblxuICAgIHRoaXMucHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0oY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciB0aGUgY29tbWl0IG1lc3NhZ2UgY2hhbmdlcy4gVW5saWtlIGFzIGluIHRoZSBhdXRvc3F1YXNoIG1lcmdlXG4gICAqIHN0cmF0ZWd5LCB3ZSBjYW5ub3Qgc3RhcnQgYW4gaW50ZXJhY3RpdmUgcmViYXNlIGJlY2F1c2Ugd2UgbWVyZ2UgdXNpbmcgdGhlIEdpdGh1YiBBUEkuXG4gICAqIFRoZSBHaXRodWIgQVBJIG9ubHkgYWxsb3dzIG1vZGlmaWNhdGlvbnMgdG8gUFIgdGl0bGUgYW5kIGJvZHkgZm9yIHNxdWFzaCBtZXJnZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRDb21taXRNZXNzYWdlRWRpdChcbiAgICBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsXG4gICAgbWVyZ2VPcHRpb25zOiBPY3Rva2l0TWVyZ2VQYXJhbXMsXG4gICkge1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3Qge3Jlc3VsdH0gPSBhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogc3RyaW5nfT4oe1xuICAgICAgdHlwZTogJ2VkaXRvcicsXG4gICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2UgdXBkYXRlIHRoZSBjb21taXQgbWVzc2FnZScsXG4gICAgICBkZWZhdWx0OiBjb21taXRNZXNzYWdlLFxuICAgIH0pO1xuXG4gICAgLy8gU3BsaXQgdGhlIG5ldyBtZXNzYWdlIGludG8gdGl0bGUgYW5kIG1lc3NhZ2UuIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlXG4gICAgLy8gR2l0aHViIEFQSSBleHBlY3RzIHRpdGxlIGFuZCBtZXNzYWdlIHRvIGJlIHBhc3NlZCBzZXBhcmF0ZWx5LlxuICAgIGNvbnN0IFtuZXdUaXRsZSwgLi4ubmV3TWVzc2FnZV0gPSByZXN1bHQuc3BsaXQoQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBtZXJnZSBvcHRpb25zIHNvIHRoYXQgdGhlIGNoYW5nZXMgYXJlIHJlZmxlY3RlZCBpbiB0aGVyZS5cbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X3RpdGxlID0gYCR7bmV3VGl0bGV9ICgjJHtwdWxsUmVxdWVzdC5wck51bWJlcn0pYDtcbiAgICBtZXJnZU9wdGlvbnMuY29tbWl0X21lc3NhZ2UgPSBuZXdNZXNzYWdlLmpvaW4oQ09NTUlUX0hFQURFUl9TRVBBUkFUT1IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb21taXQgbWVzc2FnZSBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gR2l0aHViIGJ5IGRlZmF1bHQgY29uY2F0ZW5hdGVzXG4gICAqIG11bHRpcGxlIGNvbW1pdCBtZXNzYWdlcyBpZiBhIFBSIGlzIG1lcmdlZCBpbiBzcXVhc2ggbW9kZS4gV2UgdHJ5IHRvIHJlcGxpY2F0ZSB0aGlzXG4gICAqIGJlaGF2aW9yIGhlcmUgc28gdGhhdCB3ZSBoYXZlIGEgZGVmYXVsdCBjb21taXQgbWVzc2FnZSB0aGF0IGNhbiBiZSBmaXhlZCB1cC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldERlZmF1bHRTcXVhc2hDb21taXRNZXNzYWdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgY29tbWl0cyA9IChhd2FpdCB0aGlzLl9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHB1bGxSZXF1ZXN0KSkubWFwKChtZXNzYWdlKSA9PiAoe1xuICAgICAgbWVzc2FnZSxcbiAgICAgIHBhcnNlZDogcGFyc2VDb21taXRNZXNzYWdlKG1lc3NhZ2UpLFxuICAgIH0pKTtcbiAgICBjb25zdCBtZXNzYWdlQmFzZSA9IGAke3B1bGxSZXF1ZXN0LnRpdGxlfSR7Q09NTUlUX0hFQURFUl9TRVBBUkFUT1J9YDtcbiAgICBpZiAoY29tbWl0cy5sZW5ndGggPD0gMSkge1xuICAgICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7Y29tbWl0c1swXS5wYXJzZWQuYm9keX1gO1xuICAgIH1cbiAgICBjb25zdCBqb2luZWRNZXNzYWdlcyA9IGNvbW1pdHMubWFwKChjKSA9PiBgKiAke2MubWVzc2FnZX1gKS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgICByZXR1cm4gYCR7bWVzc2FnZUJhc2V9JHtqb2luZWRNZXNzYWdlc31gO1xuICB9XG5cbiAgLyoqIEdldHMgYWxsIGNvbW1pdCBtZXNzYWdlcyBvZiBjb21taXRzIGluIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldFB1bGxSZXF1ZXN0Q29tbWl0TWVzc2FnZXMoe3ByTnVtYmVyfTogUHVsbFJlcXVlc3QpIHtcbiAgICBjb25zdCBhbGxDb21taXRzID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnBhZ2luYXRlKHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5saXN0Q29tbWl0cywge1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcHVsbF9udW1iZXI6IHByTnVtYmVyLFxuICAgIH0pO1xuICAgIHJldHVybiBhbGxDb21taXRzLm1hcCgoe2NvbW1pdH0pID0+IGNvbW1pdC5tZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgZ2l2ZW4gcHVsbCByZXF1ZXN0IGNvdWxkIGJlIG1lcmdlZCBpbnRvIGl0cyB0YXJnZXQgYnJhbmNoZXMuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaWYgaXQgdGhlIFBSIGNvdWxkIG5vdCBiZSBtZXJnZWQuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jaGVja01lcmdhYmlsaXR5KFxuICAgIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCxcbiAgICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW10sXG4gICk6IFByb21pc2U8bnVsbCB8IFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSB0aGlzLmdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdCk7XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMsIHtcbiAgICAgIGRyeVJ1bjogdHJ1ZSxcbiAgICB9KTtcblxuICAgIGlmIChmYWlsZWRCcmFuY2hlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoZmFpbGVkQnJhbmNoZXMpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBEZXRlcm1pbmVzIHRoZSBtZXJnZSBhY3Rpb24gZnJvbSB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIF9nZXRNZXJnZUFjdGlvbkZyb21QdWxsUmVxdWVzdCh7bGFiZWxzfTogUHVsbFJlcXVlc3QpOiBHaXRodWJBcGlNZXJnZU1ldGhvZCB7XG4gICAgaWYgKHRoaXMuX2NvbmZpZy5sYWJlbHMpIHtcbiAgICAgIGNvbnN0IG1hdGNoaW5nTGFiZWwgPSB0aGlzLl9jb25maWcubGFiZWxzLmZpbmQoKHtwYXR0ZXJufSkgPT5cbiAgICAgICAgbGFiZWxzLnNvbWUoKGwpID0+IG1hdGNoZXNQYXR0ZXJuKGwsIHBhdHRlcm4pKSxcbiAgICAgICk7XG4gICAgICBpZiAobWF0Y2hpbmdMYWJlbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBtYXRjaGluZ0xhYmVsLm1ldGhvZDtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2NvbmZpZy5kZWZhdWx0O1xuICB9XG59XG4iXX0=