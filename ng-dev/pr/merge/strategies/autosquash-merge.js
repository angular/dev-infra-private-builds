"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutosquashMergeStrategy = void 0;
const path_1 = require("path");
const failures_1 = require("../failures");
const strategy_1 = require("./strategy");
/** Path to the commit message filter script. Git expects this paths to use forward slashes. */
const MSG_FILTER_SCRIPT = path_1.join(__dirname, './commit-message-filter.js').replace(/\\/g, '/');
/**
 * Merge strategy that does not use the Github API for merging. Instead, it fetches
 * all target branches and the PR locally. The PR is then cherry-picked with autosquash
 * enabled into the target branches. The benefit is the support for fixup and squash commits.
 * A notable downside though is that Github does not show the PR as `Merged` due to non
 * fast-forward merges
 */
class AutosquashMergeStrategy extends strategy_1.MergeStrategy {
    /**
     * Merges the specified pull request into the target branches and pushes the target
     * branches upstream. This method requires the temporary target branches to be fetched
     * already as we don't want to fetch the target branches per pull request merge. This
     * would causes unnecessary multiple fetch requests when multiple PRs are merged.
     * @throws {GitCommandError} An unknown Git command error occurred that is not
     *   specific to the pull request merge.
     * @returns A pull request failure or null in case of success.
     */
    async merge(pullRequest) {
        const { prNumber, targetBranches, requiredBaseSha, needsCommitMessageFixup, githubTargetBranch } = pullRequest;
        // In case a required base is specified for this pull request, check if the pull
        // request contains the given commit. If not, return a pull request failure. This
        // check is useful for enforcing that PRs are rebased on top of a given commit. e.g.
        // a commit that changes the codeowner ship validation. PRs which are not rebased
        // could bypass new codeowner ship rules.
        if (requiredBaseSha && !this.git.hasCommit(strategy_1.TEMP_PR_HEAD_BRANCH, requiredBaseSha)) {
            return failures_1.PullRequestFailure.unsatisfiedBaseSha();
        }
        // SHA for the first commit the pull request is based on. Usually we would able
        // to just rely on the base revision provided by `getPullRequestBaseRevision`, but
        // the revision would rely on the amount of commits in a pull request. This is not
        // reliable as we rebase the PR with autosquash where the amount of commits could
        // change. We work around this by parsing the base revision so that we have a fixated
        // SHA before the autosquash rebase is performed.
        const baseSha = this.git
            .run(['rev-parse', this.getPullRequestBaseRevision(pullRequest)])
            .stdout.trim();
        // Git revision range that matches the pull request commits.
        const revisionRange = `${baseSha}..${strategy_1.TEMP_PR_HEAD_BRANCH}`;
        // We always rebase the pull request so that fixup or squash commits are automatically
        // collapsed. Git's autosquash functionality does only work in interactive rebases, so
        // our rebase is always interactive. In reality though, unless a commit message fixup
        // is desired, we set the `GIT_SEQUENCE_EDITOR` environment variable to `true` so that
        // the rebase seems interactive to Git, while it's not interactive to the user.
        // See: https://github.com/git/git/commit/891d4a0313edc03f7e2ecb96edec5d30dc182294.
        const branchOrRevisionBeforeRebase = this.git.getCurrentBranchOrRevision();
        const rebaseEnv = needsCommitMessageFixup
            ? undefined
            : { ...process.env, GIT_SEQUENCE_EDITOR: 'true' };
        this.git.run(['rebase', '--interactive', '--autosquash', baseSha, strategy_1.TEMP_PR_HEAD_BRANCH], {
            stdio: 'inherit',
            env: rebaseEnv,
        });
        // Update pull requests commits to reference the pull request. This matches what
        // Github does when pull requests are merged through the Web UI. The motivation is
        // that it should be easy to determine which pull request contained a given commit.
        // Note: The filter-branch command relies on the working tree, so we want to make sure
        // that we are on the initial branch or revision where the merge script has been invoked.
        this.git.run(['checkout', '-f', branchOrRevisionBeforeRebase]);
        this.git.run([
            'filter-branch',
            '-f',
            '--msg-filter',
            `${MSG_FILTER_SCRIPT} ${prNumber}`,
            revisionRange,
        ]);
        // Cherry-pick the pull request into all determined target branches.
        const failedBranches = this.cherryPickIntoTargetBranches(revisionRange, targetBranches);
        if (failedBranches.length) {
            return failures_1.PullRequestFailure.mergeConflicts(failedBranches);
        }
        this.pushTargetBranchesUpstream(targetBranches);
        // For PRs which do not target the `main` branch on Github, Github does not automatically
        // close the PR when its commit is pushed into the repository. To ensure these PRs are
        // correctly marked as closed, we must detect this situation and close the PR via the API after
        // the upstream pushes are completed.
        if (githubTargetBranch !== this.git.mainBranchName) {
            /** The local branch name of the github targeted branch. */
            const localBranch = this.getLocalTargetBranchName(githubTargetBranch);
            /** The SHA of the commit pushed to github which represents closing the PR. */
            const sha = this.git.run(['rev-parse', localBranch]).stdout.trim();
            // Create a comment saying the PR was closed by the SHA.
            await this.git.github.issues.createComment({
                ...this.git.remoteParams,
                issue_number: pullRequest.prNumber,
                body: `Closed by commit ${sha}`,
            });
            // Actually close the PR.
            await this.git.github.pulls.update({
                ...this.git.remoteParams,
                pull_number: pullRequest.prNumber,
                state: 'closed',
            });
        }
        return null;
    }
}
exports.AutosquashMergeStrategy = AutosquashMergeStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBQzFCLDBDQUErQztBQUUvQyx5Q0FBOEQ7QUFFOUQsK0ZBQStGO0FBQy9GLE1BQU0saUJBQWlCLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFFNUY7Ozs7OztHQU1HO0FBQ0gsTUFBYSx1QkFBd0IsU0FBUSx3QkFBYTtJQUN4RDs7Ozs7Ozs7T0FRRztJQUNNLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBd0I7UUFDM0MsTUFBTSxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUUsZUFBZSxFQUFFLHVCQUF1QixFQUFFLGtCQUFrQixFQUFDLEdBQzVGLFdBQVcsQ0FBQztRQUNkLGdGQUFnRjtRQUNoRixpRkFBaUY7UUFDakYsb0ZBQW9GO1FBQ3BGLGlGQUFpRjtRQUNqRix5Q0FBeUM7UUFDekMsSUFBSSxlQUFlLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw4QkFBbUIsRUFBRSxlQUFlLENBQUMsRUFBRTtZQUNoRixPQUFPLDZCQUFrQixDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDaEQ7UUFFRCwrRUFBK0U7UUFDL0Usa0ZBQWtGO1FBQ2xGLGtGQUFrRjtRQUNsRixpRkFBaUY7UUFDakYscUZBQXFGO1FBQ3JGLGlEQUFpRDtRQUNqRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRzthQUNyQixHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDaEUsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2pCLDREQUE0RDtRQUM1RCxNQUFNLGFBQWEsR0FBRyxHQUFHLE9BQU8sS0FBSyw4QkFBbUIsRUFBRSxDQUFDO1FBRTNELHNGQUFzRjtRQUN0RixzRkFBc0Y7UUFDdEYscUZBQXFGO1FBQ3JGLHNGQUFzRjtRQUN0RiwrRUFBK0U7UUFDL0UsbUZBQW1GO1FBQ25GLE1BQU0sNEJBQTRCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBQzNFLE1BQU0sU0FBUyxHQUFHLHVCQUF1QjtZQUN2QyxDQUFDLENBQUMsU0FBUztZQUNYLENBQUMsQ0FBQyxFQUFDLEdBQUcsT0FBTyxDQUFDLEdBQUcsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLEVBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxlQUFlLEVBQUUsY0FBYyxFQUFFLE9BQU8sRUFBRSw4QkFBbUIsQ0FBQyxFQUFFO1lBQ3RGLEtBQUssRUFBRSxTQUFTO1lBQ2hCLEdBQUcsRUFBRSxTQUFTO1NBQ2YsQ0FBQyxDQUFDO1FBRUgsZ0ZBQWdGO1FBQ2hGLGtGQUFrRjtRQUNsRixtRkFBbUY7UUFDbkYsc0ZBQXNGO1FBQ3RGLHlGQUF5RjtRQUN6RixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUUsNEJBQTRCLENBQUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO1lBQ1gsZUFBZTtZQUNmLElBQUk7WUFDSixjQUFjO1lBQ2QsR0FBRyxpQkFBaUIsSUFBSSxRQUFRLEVBQUU7WUFDbEMsYUFBYTtTQUNkLENBQUMsQ0FBQztRQUVILG9FQUFvRTtRQUNwRSxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsNEJBQTRCLENBQUMsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBRXhGLElBQUksY0FBYyxDQUFDLE1BQU0sRUFBRTtZQUN6QixPQUFPLDZCQUFrQixDQUFDLGNBQWMsQ0FBQyxjQUFjLENBQUMsQ0FBQztTQUMxRDtRQUVELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUVoRCx5RkFBeUY7UUFDekYsc0ZBQXNGO1FBQ3RGLCtGQUErRjtRQUMvRixxQ0FBcUM7UUFDckMsSUFBSSxrQkFBa0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRTtZQUNsRCwyREFBMkQ7WUFDM0QsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLHdCQUF3QixDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDdEUsOEVBQThFO1lBQzlFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ25FLHdEQUF3RDtZQUN4RCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7Z0JBQ3pDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dCQUN4QixZQUFZLEVBQUUsV0FBVyxDQUFDLFFBQVE7Z0JBQ2xDLElBQUksRUFBRSxvQkFBb0IsR0FBRyxFQUFFO2FBQ2hDLENBQUMsQ0FBQztZQUNILHlCQUF5QjtZQUN6QixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ2pDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dCQUN4QixXQUFXLEVBQUUsV0FBVyxDQUFDLFFBQVE7Z0JBQ2pDLEtBQUssRUFBRSxRQUFRO2FBQ2hCLENBQUMsQ0FBQztTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0Y7QUFqR0QsMERBaUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi4vZmFpbHVyZXMnO1xuaW1wb3J0IHtQdWxsUmVxdWVzdH0gZnJvbSAnLi4vcHVsbC1yZXF1ZXN0JztcbmltcG9ydCB7TWVyZ2VTdHJhdGVneSwgVEVNUF9QUl9IRUFEX0JSQU5DSH0gZnJvbSAnLi9zdHJhdGVneSc7XG5cbi8qKiBQYXRoIHRvIHRoZSBjb21taXQgbWVzc2FnZSBmaWx0ZXIgc2NyaXB0LiBHaXQgZXhwZWN0cyB0aGlzIHBhdGhzIHRvIHVzZSBmb3J3YXJkIHNsYXNoZXMuICovXG5jb25zdCBNU0dfRklMVEVSX1NDUklQVCA9IGpvaW4oX19kaXJuYW1lLCAnLi9jb21taXQtbWVzc2FnZS1maWx0ZXIuanMnKS5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG5cbi8qKlxuICogTWVyZ2Ugc3RyYXRlZ3kgdGhhdCBkb2VzIG5vdCB1c2UgdGhlIEdpdGh1YiBBUEkgZm9yIG1lcmdpbmcuIEluc3RlYWQsIGl0IGZldGNoZXNcbiAqIGFsbCB0YXJnZXQgYnJhbmNoZXMgYW5kIHRoZSBQUiBsb2NhbGx5LiBUaGUgUFIgaXMgdGhlbiBjaGVycnktcGlja2VkIHdpdGggYXV0b3NxdWFzaFxuICogZW5hYmxlZCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMuIFRoZSBiZW5lZml0IGlzIHRoZSBzdXBwb3J0IGZvciBmaXh1cCBhbmQgc3F1YXNoIGNvbW1pdHMuXG4gKiBBIG5vdGFibGUgZG93bnNpZGUgdGhvdWdoIGlzIHRoYXQgR2l0aHViIGRvZXMgbm90IHNob3cgdGhlIFBSIGFzIGBNZXJnZWRgIGR1ZSB0byBub25cbiAqIGZhc3QtZm9yd2FyZCBtZXJnZXNcbiAqL1xuZXhwb3J0IGNsYXNzIEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5IGV4dGVuZHMgTWVyZ2VTdHJhdGVneSB7XG4gIC8qKlxuICAgKiBNZXJnZXMgdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgaW50byB0aGUgdGFyZ2V0IGJyYW5jaGVzIGFuZCBwdXNoZXMgdGhlIHRhcmdldFxuICAgKiBicmFuY2hlcyB1cHN0cmVhbS4gVGhpcyBtZXRob2QgcmVxdWlyZXMgdGhlIHRlbXBvcmFyeSB0YXJnZXQgYnJhbmNoZXMgdG8gYmUgZmV0Y2hlZFxuICAgKiBhbHJlYWR5IGFzIHdlIGRvbid0IHdhbnQgdG8gZmV0Y2ggdGhlIHRhcmdldCBicmFuY2hlcyBwZXIgcHVsbCByZXF1ZXN0IG1lcmdlLiBUaGlzXG4gICAqIHdvdWxkIGNhdXNlcyB1bm5lY2Vzc2FyeSBtdWx0aXBsZSBmZXRjaCByZXF1ZXN0cyB3aGVuIG11bHRpcGxlIFBScyBhcmUgbWVyZ2VkLlxuICAgKiBAdGhyb3dzIHtHaXRDb21tYW5kRXJyb3J9IEFuIHVua25vd24gR2l0IGNvbW1hbmQgZXJyb3Igb2NjdXJyZWQgdGhhdCBpcyBub3RcbiAgICogICBzcGVjaWZpYyB0byB0aGUgcHVsbCByZXF1ZXN0IG1lcmdlLlxuICAgKiBAcmV0dXJucyBBIHB1bGwgcmVxdWVzdCBmYWlsdXJlIG9yIG51bGwgaW4gY2FzZSBvZiBzdWNjZXNzLlxuICAgKi9cbiAgb3ZlcnJpZGUgYXN5bmMgbWVyZ2UocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KTogUHJvbWlzZTxQdWxsUmVxdWVzdEZhaWx1cmUgfCBudWxsPiB7XG4gICAgY29uc3Qge3ByTnVtYmVyLCB0YXJnZXRCcmFuY2hlcywgcmVxdWlyZWRCYXNlU2hhLCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCwgZ2l0aHViVGFyZ2V0QnJhbmNofSA9XG4gICAgICBwdWxsUmVxdWVzdDtcbiAgICAvLyBJbiBjYXNlIGEgcmVxdWlyZWQgYmFzZSBpcyBzcGVjaWZpZWQgZm9yIHRoaXMgcHVsbCByZXF1ZXN0LCBjaGVjayBpZiB0aGUgcHVsbFxuICAgIC8vIHJlcXVlc3QgY29udGFpbnMgdGhlIGdpdmVuIGNvbW1pdC4gSWYgbm90LCByZXR1cm4gYSBwdWxsIHJlcXVlc3QgZmFpbHVyZS4gVGhpc1xuICAgIC8vIGNoZWNrIGlzIHVzZWZ1bCBmb3IgZW5mb3JjaW5nIHRoYXQgUFJzIGFyZSByZWJhc2VkIG9uIHRvcCBvZiBhIGdpdmVuIGNvbW1pdC4gZS5nLlxuICAgIC8vIGEgY29tbWl0IHRoYXQgY2hhbmdlcyB0aGUgY29kZW93bmVyIHNoaXAgdmFsaWRhdGlvbi4gUFJzIHdoaWNoIGFyZSBub3QgcmViYXNlZFxuICAgIC8vIGNvdWxkIGJ5cGFzcyBuZXcgY29kZW93bmVyIHNoaXAgcnVsZXMuXG4gICAgaWYgKHJlcXVpcmVkQmFzZVNoYSAmJiAhdGhpcy5naXQuaGFzQ29tbWl0KFRFTVBfUFJfSEVBRF9CUkFOQ0gsIHJlcXVpcmVkQmFzZVNoYSkpIHtcbiAgICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUudW5zYXRpc2ZpZWRCYXNlU2hhKCk7XG4gICAgfVxuXG4gICAgLy8gU0hBIGZvciB0aGUgZmlyc3QgY29tbWl0IHRoZSBwdWxsIHJlcXVlc3QgaXMgYmFzZWQgb24uIFVzdWFsbHkgd2Ugd291bGQgYWJsZVxuICAgIC8vIHRvIGp1c3QgcmVseSBvbiB0aGUgYmFzZSByZXZpc2lvbiBwcm92aWRlZCBieSBgZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb25gLCBidXRcbiAgICAvLyB0aGUgcmV2aXNpb24gd291bGQgcmVseSBvbiB0aGUgYW1vdW50IG9mIGNvbW1pdHMgaW4gYSBwdWxsIHJlcXVlc3QuIFRoaXMgaXMgbm90XG4gICAgLy8gcmVsaWFibGUgYXMgd2UgcmViYXNlIHRoZSBQUiB3aXRoIGF1dG9zcXVhc2ggd2hlcmUgdGhlIGFtb3VudCBvZiBjb21taXRzIGNvdWxkXG4gICAgLy8gY2hhbmdlLiBXZSB3b3JrIGFyb3VuZCB0aGlzIGJ5IHBhcnNpbmcgdGhlIGJhc2UgcmV2aXNpb24gc28gdGhhdCB3ZSBoYXZlIGEgZml4YXRlZFxuICAgIC8vIFNIQSBiZWZvcmUgdGhlIGF1dG9zcXVhc2ggcmViYXNlIGlzIHBlcmZvcm1lZC5cbiAgICBjb25zdCBiYXNlU2hhID0gdGhpcy5naXRcbiAgICAgIC5ydW4oWydyZXYtcGFyc2UnLCB0aGlzLmdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0KV0pXG4gICAgICAuc3Rkb3V0LnRyaW0oKTtcbiAgICAvLyBHaXQgcmV2aXNpb24gcmFuZ2UgdGhhdCBtYXRjaGVzIHRoZSBwdWxsIHJlcXVlc3QgY29tbWl0cy5cbiAgICBjb25zdCByZXZpc2lvblJhbmdlID0gYCR7YmFzZVNoYX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuXG4gICAgLy8gV2UgYWx3YXlzIHJlYmFzZSB0aGUgcHVsbCByZXF1ZXN0IHNvIHRoYXQgZml4dXAgb3Igc3F1YXNoIGNvbW1pdHMgYXJlIGF1dG9tYXRpY2FsbHlcbiAgICAvLyBjb2xsYXBzZWQuIEdpdCdzIGF1dG9zcXVhc2ggZnVuY3Rpb25hbGl0eSBkb2VzIG9ubHkgd29yayBpbiBpbnRlcmFjdGl2ZSByZWJhc2VzLCBzb1xuICAgIC8vIG91ciByZWJhc2UgaXMgYWx3YXlzIGludGVyYWN0aXZlLiBJbiByZWFsaXR5IHRob3VnaCwgdW5sZXNzIGEgY29tbWl0IG1lc3NhZ2UgZml4dXBcbiAgICAvLyBpcyBkZXNpcmVkLCB3ZSBzZXQgdGhlIGBHSVRfU0VRVUVOQ0VfRURJVE9SYCBlbnZpcm9ubWVudCB2YXJpYWJsZSB0byBgdHJ1ZWAgc28gdGhhdFxuICAgIC8vIHRoZSByZWJhc2Ugc2VlbXMgaW50ZXJhY3RpdmUgdG8gR2l0LCB3aGlsZSBpdCdzIG5vdCBpbnRlcmFjdGl2ZSB0byB0aGUgdXNlci5cbiAgICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9naXQvZ2l0L2NvbW1pdC84OTFkNGEwMzEzZWRjMDNmN2UyZWNiOTZlZGVjNWQzMGRjMTgyMjk0LlxuICAgIGNvbnN0IGJyYW5jaE9yUmV2aXNpb25CZWZvcmVSZWJhc2UgPSB0aGlzLmdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICAgIGNvbnN0IHJlYmFzZUVudiA9IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwXG4gICAgICA/IHVuZGVmaW5lZFxuICAgICAgOiB7Li4ucHJvY2Vzcy5lbnYsIEdJVF9TRVFVRU5DRV9FRElUT1I6ICd0cnVlJ307XG4gICAgdGhpcy5naXQucnVuKFsncmViYXNlJywgJy0taW50ZXJhY3RpdmUnLCAnLS1hdXRvc3F1YXNoJywgYmFzZVNoYSwgVEVNUF9QUl9IRUFEX0JSQU5DSF0sIHtcbiAgICAgIHN0ZGlvOiAnaW5oZXJpdCcsXG4gICAgICBlbnY6IHJlYmFzZUVudixcbiAgICB9KTtcblxuICAgIC8vIFVwZGF0ZSBwdWxsIHJlcXVlc3RzIGNvbW1pdHMgdG8gcmVmZXJlbmNlIHRoZSBwdWxsIHJlcXVlc3QuIFRoaXMgbWF0Y2hlcyB3aGF0XG4gICAgLy8gR2l0aHViIGRvZXMgd2hlbiBwdWxsIHJlcXVlc3RzIGFyZSBtZXJnZWQgdGhyb3VnaCB0aGUgV2ViIFVJLiBUaGUgbW90aXZhdGlvbiBpc1xuICAgIC8vIHRoYXQgaXQgc2hvdWxkIGJlIGVhc3kgdG8gZGV0ZXJtaW5lIHdoaWNoIHB1bGwgcmVxdWVzdCBjb250YWluZWQgYSBnaXZlbiBjb21taXQuXG4gICAgLy8gTm90ZTogVGhlIGZpbHRlci1icmFuY2ggY29tbWFuZCByZWxpZXMgb24gdGhlIHdvcmtpbmcgdHJlZSwgc28gd2Ugd2FudCB0byBtYWtlIHN1cmVcbiAgICAvLyB0aGF0IHdlIGFyZSBvbiB0aGUgaW5pdGlhbCBicmFuY2ggb3IgcmV2aXNpb24gd2hlcmUgdGhlIG1lcmdlIHNjcmlwdCBoYXMgYmVlbiBpbnZva2VkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1mJywgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbXG4gICAgICAnZmlsdGVyLWJyYW5jaCcsXG4gICAgICAnLWYnLFxuICAgICAgJy0tbXNnLWZpbHRlcicsXG4gICAgICBgJHtNU0dfRklMVEVSX1NDUklQVH0gJHtwck51bWJlcn1gLFxuICAgICAgcmV2aXNpb25SYW5nZSxcbiAgICBdKTtcblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSBwdWxsIHJlcXVlc3QgaW50byBhbGwgZGV0ZXJtaW5lZCB0YXJnZXQgYnJhbmNoZXMuXG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXMgPSB0aGlzLmNoZXJyeVBpY2tJbnRvVGFyZ2V0QnJhbmNoZXMocmV2aXNpb25SYW5nZSwgdGFyZ2V0QnJhbmNoZXMpO1xuXG4gICAgaWYgKGZhaWxlZEJyYW5jaGVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5tZXJnZUNvbmZsaWN0cyhmYWlsZWRCcmFuY2hlcyk7XG4gICAgfVxuXG4gICAgdGhpcy5wdXNoVGFyZ2V0QnJhbmNoZXNVcHN0cmVhbSh0YXJnZXRCcmFuY2hlcyk7XG5cbiAgICAvLyBGb3IgUFJzIHdoaWNoIGRvIG5vdCB0YXJnZXQgdGhlIGBtYWluYCBicmFuY2ggb24gR2l0aHViLCBHaXRodWIgZG9lcyBub3QgYXV0b21hdGljYWxseVxuICAgIC8vIGNsb3NlIHRoZSBQUiB3aGVuIGl0cyBjb21taXQgaXMgcHVzaGVkIGludG8gdGhlIHJlcG9zaXRvcnkuIFRvIGVuc3VyZSB0aGVzZSBQUnMgYXJlXG4gICAgLy8gY29ycmVjdGx5IG1hcmtlZCBhcyBjbG9zZWQsIHdlIG11c3QgZGV0ZWN0IHRoaXMgc2l0dWF0aW9uIGFuZCBjbG9zZSB0aGUgUFIgdmlhIHRoZSBBUEkgYWZ0ZXJcbiAgICAvLyB0aGUgdXBzdHJlYW0gcHVzaGVzIGFyZSBjb21wbGV0ZWQuXG4gICAgaWYgKGdpdGh1YlRhcmdldEJyYW5jaCAhPT0gdGhpcy5naXQubWFpbkJyYW5jaE5hbWUpIHtcbiAgICAgIC8qKiBUaGUgbG9jYWwgYnJhbmNoIG5hbWUgb2YgdGhlIGdpdGh1YiB0YXJnZXRlZCBicmFuY2guICovXG4gICAgICBjb25zdCBsb2NhbEJyYW5jaCA9IHRoaXMuZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gICAgICAvKiogVGhlIFNIQSBvZiB0aGUgY29tbWl0IHB1c2hlZCB0byBnaXRodWIgd2hpY2ggcmVwcmVzZW50cyBjbG9zaW5nIHRoZSBQUi4gKi9cbiAgICAgIGNvbnN0IHNoYSA9IHRoaXMuZ2l0LnJ1bihbJ3Jldi1wYXJzZScsIGxvY2FsQnJhbmNoXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICAgIC8vIENyZWF0ZSBhIGNvbW1lbnQgc2F5aW5nIHRoZSBQUiB3YXMgY2xvc2VkIGJ5IHRoZSBTSEEuXG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmNyZWF0ZUNvbW1lbnQoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogcHVsbFJlcXVlc3QucHJOdW1iZXIsXG4gICAgICAgIGJvZHk6IGBDbG9zZWQgYnkgY29tbWl0ICR7c2hhfWAsXG4gICAgICB9KTtcbiAgICAgIC8vIEFjdHVhbGx5IGNsb3NlIHRoZSBQUi5cbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy51cGRhdGUoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIHB1bGxfbnVtYmVyOiBwdWxsUmVxdWVzdC5wck51bWJlcixcbiAgICAgICAgc3RhdGU6ICdjbG9zZWQnLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==