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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLW1lcmdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL3N0cmF0ZWdpZXMvYXBpLW1lcmdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILHVDQUFnQztBQUVoQyx5REFBaUU7QUFHakUsMENBQStDO0FBRS9DLHNEQUFpRDtBQUVqRCx5Q0FBOEQ7QUFDOUQsc0RBQWdFO0FBS2hFLHdEQUF3RDtBQUN4RCxNQUFNLHVCQUF1QixHQUFHLE1BQU0sQ0FBQztBQUV2Qzs7Ozs7O0dBTUc7QUFDSCxNQUFhLHNCQUF1QixTQUFRLHdCQUFhO0lBQ3ZELFlBQVksR0FBMkIsRUFBVSxPQUFxQztRQUNwRixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFEb0MsWUFBTyxHQUFQLE9BQU8sQ0FBOEI7SUFFdEYsQ0FBQztJQUVRLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBd0I7UUFDM0MsTUFBTSxFQUFDLGtCQUFrQixFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFDLEdBQzVGLFdBQVcsQ0FBQztRQUNkLGlGQUFpRjtRQUNqRix5Q0FBeUM7UUFDekMsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssa0JBQWtCLENBQUMsRUFBRTtZQUN6RCxPQUFPLDZCQUFrQixDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQ25FO1FBRUQscUZBQXFGO1FBQ3JGLHFGQUFxRjtRQUNyRixvRkFBb0Y7UUFDcEYsc0ZBQXNGO1FBQ3RGLHlDQUF5QztRQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDhCQUFtQixFQUFFLGVBQWUsQ0FBQyxFQUFFO1lBQ2hGLE9BQU8sNkJBQWtCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztT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QUV4QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsMkJBQTJCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEUsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLDRCQUE0QixDQUFDLGFBQWEsRUFBRSxjQUFjLEVBQUU7WUFDdEYsTUFBTSxFQUFFLElBQUk7U0FDYixDQUFDLENBQUM7UUFFSCxJQUFJLGNBQWMsQ0FBQyxNQUFNLEVBQUU7WUFDekIsT0FBTyw2QkFBa0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDMUQ7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCwrREFBK0Q7SUFDdkQsOEJBQThCLENBQUMsRUFBQyxNQUFNLEVBQWM7UUFDMUQsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUN2QixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLE9BQU8sRUFBQyxFQUFFLEVBQUUsQ0FDM0QsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSwrQkFBYyxFQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUMvQyxDQUFDO1lBQ0YsSUFBSSxhQUFhLEtBQUssU0FBUyxFQUFFO2dCQUMvQixPQUFPLGFBQWEsQ0FBQyxNQUFNLENBQUM7YUFDN0I7U0FDRjtRQUNELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7SUFDOUIsQ0FBQztDQUNGO0FBN01ELHdEQTZNQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1Jlc3RFbmRwb2ludE1ldGhvZFR5cGVzfSBmcm9tICdAb2N0b2tpdC9wbHVnaW4tcmVzdC1lbmRwb2ludC1tZXRob2RzJztcbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS9wYXJzZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtHaXRodWJBcGlNZXJnZU1ldGhvZCwgR2l0aHViQXBpTWVyZ2VTdHJhdGVneUNvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi4vc3RyaW5nLXBhdHRlcm4nO1xuXG5pbXBvcnQge01lcmdlU3RyYXRlZ3ksIFRFTVBfUFJfSEVBRF9CUkFOQ0h9IGZyb20gJy4vc3RyYXRlZ3knO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIHRoZSBwYXJhbWV0ZXJzIGZvciB0aGUgT2N0b2tpdCBgbWVyZ2VgIEFQSSBlbmRwb2ludC4gKi9cbnR5cGUgT2N0b2tpdE1lcmdlUGFyYW1zID0gUmVzdEVuZHBvaW50TWV0aG9kVHlwZXNbJ3B1bGxzJ11bJ21lcmdlJ11bJ3BhcmFtZXRlcnMnXTtcblxuLyoqIFNlcGFyYXRvciBiZXR3ZWVuIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBhbmQgYm9keS4gKi9cbmNvbnN0IENPTU1JVF9IRUFERVJfU0VQQVJBVE9SID0gJ1xcblxcbic7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBwcmltYXJpbHkgbGV2ZXJhZ2VzIHRoZSBHaXRodWIgQVBJLiBUaGUgc3RyYXRlZ3kgbWVyZ2VzIGEgZ2l2ZW5cbiAqIHB1bGwgcmVxdWVzdCBpbnRvIGEgdGFyZ2V0IGJyYW5jaCB1c2luZyB0aGUgQVBJLiBUaGlzIGVuc3VyZXMgdGhhdCBHaXRodWIgZGlzcGxheXNcbiAqIHRoZSBwdWxsIHJlcXVlc3QgYXMgbWVyZ2VkLiBUaGUgbWVyZ2VkIGNvbW1pdHMgYXJlIHRoZW4gY2hlcnJ5LXBpY2tlZCBpbnRvIHRoZSByZW1haW5pbmdcbiAqIHRhcmdldCBicmFuY2hlcyB1c2luZyB0aGUgbG9jYWwgR2l0IGluc3RhbmNlLiBUaGUgYmVuZWZpdCBpcyB0aGF0IHRoZSBHaXRodWIgbWVyZ2VkIHN0YXRlXG4gKiBpcyBwcm9wZXJseSBzZXQsIGJ1dCBhIG5vdGFibGUgZG93bnNpZGUgaXMgdGhhdCBQUnMgY2Fubm90IHVzZSBmaXh1cCBvciBzcXVhc2ggY29tbWl0cy5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IoZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LCBwcml2YXRlIF9jb25maWc6IEdpdGh1YkFwaU1lcmdlU3RyYXRlZ3lDb25maWcpIHtcbiAgICBzdXBlcihnaXQpO1xuICB9XG5cbiAgb3ZlcnJpZGUgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmUgfCBudWxsPiB7XG4gICAgY29uc3Qge2dpdGh1YlRhcmdldEJyYW5jaCwgcHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwfSA9XG4gICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJZiB0aGUgcHVsbCByZXF1ZXN0IGRvZXMgbm90IGhhdmUgaXRzIGJhc2UgYnJhbmNoIHNldCB0byBhbnkgZGV0ZXJtaW5lZCB0YXJnZXRcbiAgICAvLyBicmFuY2gsIHdlIGNhbm5vdCBtZXJnZSB1c2luZyB0aGUgQVBJLlxuICAgIGlmICh0YXJnZXRCcmFuY2hlcy5ldmVyeSgodCkgPT4gdCAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5taXNtYXRjaGluZ1RhcmdldEJyYW5jaCh0YXJnZXRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgLy8gSW4gY2FzZXMgd2hlcmUgYSByZXF1aXJlZCBiYXNlIGNvbW1pdCBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZlxuICAgIC8vIHRoZSBwdWxsIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS5cbiAgICAvLyBUaGlzIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBlLmcuIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZSBvd25lcnNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWV0aG9kID0gdGhpcy5fZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3QocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyA9IHRhcmdldEJyYW5jaGVzLmZpbHRlcigoYikgPT4gYiAhPT0gZ2l0aHViVGFyZ2V0QnJhbmNoKTtcblxuICAgIC8vIEZpcnN0IGNoZXJyeS1waWNrIHRoZSBQUiBpbnRvIGFsbCBsb2NhbCB0YXJnZXQgYnJhbmNoZXMgaW4gZHJ5LXJ1biBtb2RlLiBUaGlzIGlzXG4gICAgLy8gcHVyZWx5IGZvciB0ZXN0aW5nIHNvIHRoYXQgd2UgY2FuIGZpZ3VyZSBvdXQgd2hldGhlciB0aGUgUFIgY2FuIGJlIGNoZXJyeS1waWNrZWRcbiAgICAvLyBpbnRvIHRoZSBvdGhlciB0YXJnZXQgYnJhbmNoZXMuIFdlIGRvbid0IHdhbnQgdG8gbWVyZ2UgdGhlIFBSIHRocm91Z2ggdGhlIEFQSSwgYW5kXG4gICAgLy8gdGhlbiBydW4gaW50byBjaGVycnktcGljayBjb25mbGljdHMgYWZ0ZXIgdGhlIGluaXRpYWwgbWVyZ2UgYWxyZWFkeSBjb21wbGV0ZWQuXG4gICAgY29uc3QgZmFpbHVyZSA9IGF3YWl0IHRoaXMuX2NoZWNrTWVyZ2FiaWxpdHkocHVsbFJlcXVlc3QsIGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG5cbiAgICAvLyBJZiB0aGUgUFIgY291bGQgbm90IGJlIGNoZXJyeS1waWNrZWQgaW50byBhbGwgdGFyZ2V0IGJyYW5jaGVzIGxvY2FsbHksIHdlIGtub3cgaXQgY2FuJ3RcbiAgICAvLyBiZSBkb25lIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgZWl0aGVyLiBXZSBhYm9ydCBtZXJnaW5nIGFuZCBwYXNzLXRocm91Z2ggdGhlIGZhaWx1cmUuXG4gICAgaWYgKGZhaWx1cmUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWlsdXJlO1xuICAgIH1cblxuICAgIGNvbnN0IG1lcmdlT3B0aW9uczogT2N0b2tpdE1lcmdlUGFyYW1zID0ge1xuICAgICAgcHVsbF9udW1iZXI6IHByTnVtYmVyLFxuICAgICAgbWVyZ2VfbWV0aG9kOiBtZXRob2QsXG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgfTtcblxuICAgIGlmIChuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCkge1xuICAgICAgLy8gQ29tbWl0IG1lc3NhZ2UgZml4dXAgZG9lcyBub3Qgd29yayB3aXRoIG90aGVyIG1lcmdlIG1ldGhvZHMgYXMgdGhlIEdpdGh1YiBBUEkgb25seVxuICAgICAgLy8gYWxsb3dzIGNvbW1pdCBtZXNzYWdlIG1vZGlmaWNhdGlvbnMgZm9yIHNxdWFzaCBtZXJnaW5nLlxuICAgICAgaWYgKG1ldGhvZCAhPT0gJ3NxdWFzaCcpIHtcbiAgICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bmFibGVUb0ZpeHVwQ29tbWl0TWVzc2FnZVNxdWFzaE9ubHkoKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMuX3Byb21wdENvbW1pdE1lc3NhZ2VFZGl0KHB1bGxSZXF1ZXN0LCBtZXJnZU9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBtZXJnZVN0YXR1c0NvZGU6IG51bWJlcjtcbiAgICBsZXQgdGFyZ2V0U2hhOiBzdHJpbmc7XG5cbiAgICB0cnkge1xuICAgICAgLy8gTWVyZ2UgdGhlIHB1bGwgcmVxdWVzdCB1c2luZyB0aGUgR2l0aHViIEFQSSBpbnRvIHRoZSBzZWxlY3RlZCBiYXNlIGJyYW5jaC5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5tZXJnZShtZXJnZU9wdGlvbnMpO1xuXG4gICAgICBtZXJnZVN0YXR1c0NvZGUgPSByZXN1bHQuc3RhdHVzO1xuICAgICAgdGFyZ2V0U2hhID0gcmVzdWx0LmRhdGEuc2hhO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIE5vdGU6IEdpdGh1YiB1c3VhbGx5IHJldHVybnMgYDQwNGAgYXMgc3RhdHVzIGNvZGUgaWYgdGhlIEFQSSByZXF1ZXN0IHVzZXMgYVxuICAgICAgLy8gdG9rZW4gd2l0aCBpbnN1ZmZpY2llbnQgcGVybWlzc2lvbnMuIEdpdGh1YiBkb2VzIHRoaXMgYmVjYXVzZSBpdCBkb2Vzbid0IHdhbnRcbiAgICAgIC8vIHRvIGxlYWsgd2hldGhlciBhIHJlcG9zaXRvcnkgZXhpc3RzIG9yIG5vdC4gSW4gb3VyIGNhc2Ugd2UgZXhwZWN0IGEgY2VydGFpblxuICAgICAgLy8gcmVwb3NpdG9yeSB0byBleGlzdCwgc28gd2UgYWx3YXlzIHRyZWF0IHRoaXMgYXMgYSBwZXJtaXNzaW9uIGZhaWx1cmUuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiAoZS5zdGF0dXMgPT09IDQwMyB8fCBlLnN0YXR1cyA9PT0gNDA0KSkge1xuICAgICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmluc3VmZmljaWVudFBlcm1pc3Npb25zVG9NZXJnZSgpO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICAvLyBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3YzL3B1bGxzLyNyZXNwb25zZS1pZi1tZXJnZS1jYW5ub3QtYmUtcGVyZm9ybWVkXG4gICAgLy8gUHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBtZXJnZWQgZHVlIHRvIG1lcmdlIGNvbmZsaWN0cy5cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlID09PSA0MDUpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubWVyZ2VDb25mbGljdHMoW2dpdGh1YlRhcmdldEJyYW5jaF0pO1xuICAgIH1cbiAgICBpZiAobWVyZ2VTdGF0dXNDb2RlICE9PSAyMDApIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5rbm93bk1lcmdlRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgUFIgZG9lcyAgbm90IG5lZWQgdG8gYmUgbWVyZ2VkIGludG8gYW55IG90aGVyIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyB3ZSBleGl0IGhlcmUgYXMgd2UgYWxyZWFkeSBjb21wbGV0ZWQgdGhlIG1lcmdlLlxuICAgIGlmICghY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgLy8gUmVmcmVzaCB0aGUgdGFyZ2V0IGJyYW5jaCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkIGludG8gdGhyb3VnaCB0aGUgQVBJLiBXZSBuZWVkXG4gICAgLy8gdG8gcmUtZmV0Y2ggYXMgb3RoZXJ3aXNlIHdlIGNhbm5vdCBjaGVycnktcGljayB0aGUgbmV3IGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nXG4gICAgLy8gdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHRoaXMuZmV0Y2hUYXJnZXRCcmFuY2hlcyhbZ2l0aHViVGFyZ2V0QnJhbmNoXSk7XG5cbiAgICAvLyBOdW1iZXIgb2YgY29tbWl0cyB0aGF0IGhhdmUgbGFuZGVkIGluIHRoZSB0YXJnZXQgYnJhbmNoLiBUaGlzIGNvdWxkIHZhcnkgZnJvbVxuICAgIC8vIHRoZSBjb3VudCBvZiBjb21taXRzIGluIHRoZSBQUiBkdWUgdG8gc3F1YXNoaW5nLlxuICAgIGNvbnN0IHRhcmdldENvbW1pdHNDb3VudCA9IG1ldGhvZCA9PT0gJ3NxdWFzaCcgPyAxIDogcHVsbFJlcXVlc3QuY29tbWl0Q291bnQ7XG5cbiAgICAvLyBDaGVycnkgcGljayB0aGUgbWVyZ2VkIGNvbW1pdHMgaW50byB0aGUgcmVtYWluaW5nIHRhcmdldCBicmFuY2hlcy5cbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IGF3YWl0IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhcbiAgICAgIGAke3RhcmdldFNoYX1+JHt0YXJnZXRDb21taXRzQ291bnR9Li4ke3RhcmdldFNoYX1gLFxuICAgICAgY2hlcnJ5UGlja1RhcmdldEJyYW5jaGVzLFxuICAgICAge1xuICAgICAgICAvLyBDb21taXRzIHRoYXQgaGF2ZSBiZWVuIGNyZWF0ZWQgYnkgdGhlIEdpdGh1YiBBUEkgZG8gbm90IG5lY2Vzc2FyaWx5IGNvbnRhaW5cbiAgICAgICAgLy8gYSByZWZlcmVuY2UgdG8gdGhlIHNvdXJjZSBwdWxsIHJlcXVlc3QgKHVubGVzcyB0aGUgc3F1YXNoIHN0cmF0ZWd5IGlzIHVzZWQpLlxuICAgICAgICAvLyBUbyBlbnN1cmUgdGhhdCBvcmlnaW5hbCBjb21taXRzIGNhbiBiZSBmb3VuZCB3aGVuIGEgY29tbWl0IGlzIHZpZXdlZCBpbiBhXG4gICAgICAgIC8vIHRhcmdldCBicmFuY2gsIHdlIGFkZCBhIGxpbmsgdG8gdGhlIG9yaWdpbmFsIGNvbW1pdHMgd2hlbiBjaGVycnktcGlja2luZy5cbiAgICAgICAgbGlua1RvT3JpZ2luYWxDb21taXRzOiB0cnVlLFxuICAgICAgfSxcbiAgICApO1xuXG4gICAgLy8gV2UgYWxyZWFkeSBjaGVja2VkIHdoZXRoZXIgdGhlIFBSIGNhbiBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcyxcbiAgICAvLyBidXQgaW4gY2FzZSB0aGUgY2hlcnJ5LXBpY2sgc29tZWhvdyBmYWlscywgd2Ugc3RpbGwgaGFuZGxlIHRoZSBjb25mbGljdHMgaGVyZS4gVGhlXG4gICAgLy8gY29tbWl0cyBjcmVhdGVkIHRocm91Z2ggdGhlIEdpdGh1YiBBUEkgY291bGQgYmUgZGlmZmVyZW50IChpLmUuIHRocm91Z2ggc3F1YXNoKS5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKGNoZXJyeVBpY2tUYXJnZXRCcmFuY2hlcyk7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgdGhlIGNvbW1pdCBtZXNzYWdlIGNoYW5nZXMuIFVubGlrZSBhcyBpbiB0aGUgYXV0b3NxdWFzaCBtZXJnZVxuICAgKiBzdHJhdGVneSwgd2UgY2Fubm90IHN0YXJ0IGFuIGludGVyYWN0aXZlIHJlYmFzZSBiZWNhdXNlIHdlIG1lcmdlIHVzaW5nIHRoZSBHaXRodWIgQVBJLlxuICAgKiBUaGUgR2l0aHViIEFQSSBvbmx5IGFsbG93cyBtb2RpZmljYXRpb25zIHRvIFBSIHRpdGxlIGFuZCBib2R5IGZvciBzcXVhc2ggbWVyZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Q29tbWl0TWVzc2FnZUVkaXQoXG4gICAgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0LFxuICAgIG1lcmdlT3B0aW9uczogT2N0b2tpdE1lcmdlUGFyYW1zLFxuICApIHtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gYXdhaXQgdGhpcy5fZ2V0RGVmYXVsdFNxdWFzaENvbW1pdE1lc3NhZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IHtyZXN1bHR9ID0gYXdhaXQgcHJvbXB0PHtyZXN1bHQ6IHN0cmluZ30+KHtcbiAgICAgIHR5cGU6ICdlZGl0b3InLFxuICAgICAgbmFtZTogJ3Jlc3VsdCcsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHVwZGF0ZSB0aGUgY29tbWl0IG1lc3NhZ2UnLFxuICAgICAgZGVmYXVsdDogY29tbWl0TWVzc2FnZSxcbiAgICB9KTtcblxuICAgIC8vIFNwbGl0IHRoZSBuZXcgbWVzc2FnZSBpbnRvIHRpdGxlIGFuZCBtZXNzYWdlLiBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZVxuICAgIC8vIEdpdGh1YiBBUEkgZXhwZWN0cyB0aXRsZSBhbmQgbWVzc2FnZSB0byBiZSBwYXNzZWQgc2VwYXJhdGVseS5cbiAgICBjb25zdCBbbmV3VGl0bGUsIC4uLm5ld01lc3NhZ2VdID0gcmVzdWx0LnNwbGl0KENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcblxuICAgIC8vIFVwZGF0ZSB0aGUgbWVyZ2Ugb3B0aW9ucyBzbyB0aGF0IHRoZSBjaGFuZ2VzIGFyZSByZWZsZWN0ZWQgaW4gdGhlcmUuXG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF90aXRsZSA9IGAke25ld1RpdGxlfSAoIyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9KWA7XG4gICAgbWVyZ2VPcHRpb25zLmNvbW1pdF9tZXNzYWdlID0gbmV3TWVzc2FnZS5qb2luKENPTU1JVF9IRUFERVJfU0VQQVJBVE9SKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGEgY29tbWl0IG1lc3NhZ2UgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuIEdpdGh1YiBieSBkZWZhdWx0IGNvbmNhdGVuYXRlc1xuICAgKiBtdWx0aXBsZSBjb21taXQgbWVzc2FnZXMgaWYgYSBQUiBpcyBtZXJnZWQgaW4gc3F1YXNoIG1vZGUuIFdlIHRyeSB0byByZXBsaWNhdGUgdGhpc1xuICAgKiBiZWhhdmlvciBoZXJlIHNvIHRoYXQgd2UgaGF2ZSBhIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UgdGhhdCBjYW4gYmUgZml4ZWQgdXAuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXREZWZhdWx0U3F1YXNoQ29tbWl0TWVzc2FnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IGNvbW1pdHMgPSAoYXdhaXQgdGhpcy5fZ2V0UHVsbFJlcXVlc3RDb21taXRNZXNzYWdlcyhwdWxsUmVxdWVzdCkpLm1hcCgobWVzc2FnZSkgPT4gKHtcbiAgICAgIG1lc3NhZ2UsXG4gICAgICBwYXJzZWQ6IHBhcnNlQ29tbWl0TWVzc2FnZShtZXNzYWdlKSxcbiAgICB9KSk7XG4gICAgY29uc3QgbWVzc2FnZUJhc2UgPSBgJHtwdWxsUmVxdWVzdC50aXRsZX0ke0NPTU1JVF9IRUFERVJfU0VQQVJBVE9SfWA7XG4gICAgaWYgKGNvbW1pdHMubGVuZ3RoIDw9IDEpIHtcbiAgICAgIHJldHVybiBgJHttZXNzYWdlQmFzZX0ke2NvbW1pdHNbMF0ucGFyc2VkLmJvZHl9YDtcbiAgICB9XG4gICAgY29uc3Qgam9pbmVkTWVzc2FnZXMgPSBjb21taXRzLm1hcCgoYykgPT4gYCogJHtjLm1lc3NhZ2V9YCkuam9pbihDT01NSVRfSEVBREVSX1NFUEFSQVRPUik7XG4gICAgcmV0dXJuIGAke21lc3NhZ2VCYXNlfSR7am9pbmVkTWVzc2FnZXN9YDtcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBjb21taXQgbWVzc2FnZXMgb2YgY29tbWl0cyBpbiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRQdWxsUmVxdWVzdENvbW1pdE1lc3NhZ2VzKHtwck51bWJlcn06IFB1bGxSZXF1ZXN0KSB7XG4gICAgY29uc3QgYWxsQ29tbWl0cyA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wYWdpbmF0ZSh0aGlzLmdpdC5naXRodWIucHVsbHMubGlzdENvbW1pdHMsIHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHB1bGxfbnVtYmVyOiBwck51bWJlcixcbiAgICB9KTtcbiAgICByZXR1cm4gYWxsQ29tbWl0cy5tYXAoKHtjb21taXR9KSA9PiBjb21taXQubWVzc2FnZSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIGdpdmVuIHB1bGwgcmVxdWVzdCBjb3VsZCBiZSBtZXJnZWQgaW50byBpdHMgdGFyZ2V0IGJyYW5jaGVzLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIGlmIGl0IHRoZSBQUiBjb3VsZCBub3QgYmUgbWVyZ2VkLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY2hlY2tNZXJnYWJpbGl0eShcbiAgICBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QsXG4gICAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdLFxuICApOiBQcm9taXNlPG51bGwgfCBQdWxsUmVxdWVzdEZhaWx1cmU+IHtcbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gdGhpcy5nZXRQdWxsUmVxdWVzdFJldmlzaW9uUmFuZ2UocHVsbFJlcXVlc3QpO1xuICAgIGNvbnN0IGZhaWxlZEJyYW5jaGVzID0gdGhpcy5jaGVycnlQaWNrSW50b1RhcmdldEJyYW5jaGVzKHJldmlzaW9uUmFuZ2UsIHRhcmdldEJyYW5jaGVzLCB7XG4gICAgICBkcnlSdW46IHRydWUsXG4gICAgfSk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogRGV0ZXJtaW5lcyB0aGUgbWVyZ2UgYWN0aW9uIGZyb20gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJpdmF0ZSBfZ2V0TWVyZ2VBY3Rpb25Gcm9tUHVsbFJlcXVlc3Qoe2xhYmVsc306IFB1bGxSZXF1ZXN0KTogR2l0aHViQXBpTWVyZ2VNZXRob2Qge1xuICAgIGlmICh0aGlzLl9jb25maWcubGFiZWxzKSB7XG4gICAgICBjb25zdCBtYXRjaGluZ0xhYmVsID0gdGhpcy5fY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+XG4gICAgICAgIGxhYmVscy5zb21lKChsKSA9PiBtYXRjaGVzUGF0dGVybihsLCBwYXR0ZXJuKSksXG4gICAgICApO1xuICAgICAgaWYgKG1hdGNoaW5nTGFiZWwgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbWF0Y2hpbmdMYWJlbC5tZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb25maWcuZGVmYXVsdDtcbiAgfVxufVxuIl19