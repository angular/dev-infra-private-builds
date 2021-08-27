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
const MSG_FILTER_SCRIPT = (0, path_1.join)(__dirname, './commit-message-filter.js').replace(/\\/g, '/');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b3NxdWFzaC1tZXJnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9wci9tZXJnZS9zdHJhdGVnaWVzL2F1dG9zcXVhc2gtbWVyZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQTBCO0FBQzFCLDBDQUErQztBQUUvQyx5Q0FBOEQ7QUFFOUQsK0ZBQStGO0FBQy9GLE1BQU0saUJBQWlCLEdBQUcsSUFBQSxXQUFJLEVBQUMsU0FBUyxFQUFFLDRCQUE0QixDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUU1Rjs7Ozs7O0dBTUc7QUFDSCxNQUFhLHVCQUF3QixTQUFRLHdCQUFhO0lBQ3hEOzs7Ozs7OztPQVFHO0lBQ00sS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUF3QjtRQUMzQyxNQUFNLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQUMsR0FDNUYsV0FBVyxDQUFDO1FBQ2QsZ0ZBQWdGO1FBQ2hGLGlGQUFpRjtRQUNqRixvRkFBb0Y7UUFDcEYsaUZBQWlGO1FBQ2pGLHlDQUF5QztRQUN6QyxJQUFJLGVBQWUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLDhCQUFtQixFQUFFLGVBQWUsQ0FBQyxFQUFFO1lBQ2hGLE9BQU8sNkJBQWtCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUNoRDtRQUVELCtFQUErRTtRQUMvRSxrRkFBa0Y7UUFDbEYsa0ZBQWtGO1FBQ2xGLGlGQUFpRjtRQUNqRixxRkFBcUY7UUFDckYsaURBQWlEO1FBQ2pELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHO2FBQ3JCLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsMEJBQTBCLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUNoRSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDakIsNERBQTREO1FBQzVELE1BQU0sYUFBYSxHQUFHLEdBQUcsT0FBTyxLQUFLLDhCQUFtQixFQUFFLENBQUM7UUFFM0Qsc0ZBQXNGO1FBQ3RGLHNGQUFzRjtRQUN0RixxRkFBcUY7UUFDckYsc0ZBQXNGO1FBQ3RGLCtFQUErRTtRQUMvRSxtRkFBbUY7UUFDbkYsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFDM0UsTUFBTSxTQUFTLEdBQUcsdUJBQXVCO1lBQ3ZDLENBQUMsQ0FBQyxTQUFTO1lBQ1gsQ0FBQyxDQUFDLEVBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLGVBQWUsRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLDhCQUFtQixDQUFDLEVBQUU7WUFDdEYsS0FBSyxFQUFFLFNBQVM7WUFDaEIsR0FBRyxFQUFFLFNBQVM7U0FDZixDQUFDLENBQUM7UUFFSCxnRkFBZ0Y7UUFDaEYsa0ZBQWtGO1FBQ2xGLG1GQUFtRjtRQUNuRixzRkFBc0Y7UUFDdEYseUZBQXlGO1FBQ3pGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksRUFBRSw0QkFBNEIsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDWCxlQUFlO1lBQ2YsSUFBSTtZQUNKLGNBQWM7WUFDZCxHQUFHLGlCQUFpQixJQUFJLFFBQVEsRUFBRTtZQUNsQyxhQUFhO1NBQ2QsQ0FBQyxDQUFDO1FBRUgsb0VBQW9FO1FBQ3BFLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFFeEYsSUFBSSxjQUFjLENBQUMsTUFBTSxFQUFFO1lBQ3pCLE9BQU8sNkJBQWtCLENBQUMsY0FBYyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsSUFBSSxDQUFDLDBCQUEwQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRWhELHlGQUF5RjtRQUN6RixzRkFBc0Y7UUFDdEYsK0ZBQStGO1FBQy9GLHFDQUFxQztRQUNyQyxJQUFJLGtCQUFrQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFO1lBQ2xELDJEQUEyRDtZQUMzRCxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztZQUN0RSw4RUFBOEU7WUFDOUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkUsd0RBQXdEO1lBQ3hELE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztnQkFDekMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7Z0JBQ3hCLFlBQVksRUFBRSxXQUFXLENBQUMsUUFBUTtnQkFDbEMsSUFBSSxFQUFFLG9CQUFvQixHQUFHLEVBQUU7YUFDaEMsQ0FBQyxDQUFDO1lBQ0gseUJBQXlCO1lBQ3pCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztnQkFDakMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7Z0JBQ3hCLFdBQVcsRUFBRSxXQUFXLENBQUMsUUFBUTtnQkFDakMsS0FBSyxFQUFFLFFBQVE7YUFDaEIsQ0FBQyxDQUFDO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQWpHRCwwREFpR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuaW1wb3J0IHtNZXJnZVN0cmF0ZWd5LCBURU1QX1BSX0hFQURfQlJBTkNIfSBmcm9tICcuL3N0cmF0ZWd5JztcblxuLyoqIFBhdGggdG8gdGhlIGNvbW1pdCBtZXNzYWdlIGZpbHRlciBzY3JpcHQuIEdpdCBleHBlY3RzIHRoaXMgcGF0aHMgdG8gdXNlIGZvcndhcmQgc2xhc2hlcy4gKi9cbmNvbnN0IE1TR19GSUxURVJfU0NSSVBUID0gam9pbihfX2Rpcm5hbWUsICcuL2NvbW1pdC1tZXNzYWdlLWZpbHRlci5qcycpLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcblxuLyoqXG4gKiBNZXJnZSBzdHJhdGVneSB0aGF0IGRvZXMgbm90IHVzZSB0aGUgR2l0aHViIEFQSSBmb3IgbWVyZ2luZy4gSW5zdGVhZCwgaXQgZmV0Y2hlc1xuICogYWxsIHRhcmdldCBicmFuY2hlcyBhbmQgdGhlIFBSIGxvY2FsbHkuIFRoZSBQUiBpcyB0aGVuIGNoZXJyeS1waWNrZWQgd2l0aCBhdXRvc3F1YXNoXG4gKiBlbmFibGVkIGludG8gdGhlIHRhcmdldCBicmFuY2hlcy4gVGhlIGJlbmVmaXQgaXMgdGhlIHN1cHBvcnQgZm9yIGZpeHVwIGFuZCBzcXVhc2ggY29tbWl0cy5cbiAqIEEgbm90YWJsZSBkb3duc2lkZSB0aG91Z2ggaXMgdGhhdCBHaXRodWIgZG9lcyBub3Qgc2hvdyB0aGUgUFIgYXMgYE1lcmdlZGAgZHVlIHRvIG5vblxuICogZmFzdC1mb3J3YXJkIG1lcmdlc1xuICovXG5leHBvcnQgY2xhc3MgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3kgZXh0ZW5kcyBNZXJnZVN0cmF0ZWd5IHtcbiAgLyoqXG4gICAqIE1lcmdlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBpbnRvIHRoZSB0YXJnZXQgYnJhbmNoZXMgYW5kIHB1c2hlcyB0aGUgdGFyZ2V0XG4gICAqIGJyYW5jaGVzIHVwc3RyZWFtLiBUaGlzIG1ldGhvZCByZXF1aXJlcyB0aGUgdGVtcG9yYXJ5IHRhcmdldCBicmFuY2hlcyB0byBiZSBmZXRjaGVkXG4gICAqIGFscmVhZHkgYXMgd2UgZG9uJ3Qgd2FudCB0byBmZXRjaCB0aGUgdGFyZ2V0IGJyYW5jaGVzIHBlciBwdWxsIHJlcXVlc3QgbWVyZ2UuIFRoaXNcbiAgICogd291bGQgY2F1c2VzIHVubmVjZXNzYXJ5IG11bHRpcGxlIGZldGNoIHJlcXVlc3RzIHdoZW4gbXVsdGlwbGUgUFJzIGFyZSBtZXJnZWQuXG4gICAqIEB0aHJvd3Mge0dpdENvbW1hbmRFcnJvcn0gQW4gdW5rbm93biBHaXQgY29tbWFuZCBlcnJvciBvY2N1cnJlZCB0aGF0IGlzIG5vdFxuICAgKiAgIHNwZWNpZmljIHRvIHRoZSBwdWxsIHJlcXVlc3QgbWVyZ2UuXG4gICAqIEByZXR1cm5zIEEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgb3IgbnVsbCBpbiBjYXNlIG9mIHN1Y2Nlc3MuXG4gICAqL1xuICBvdmVycmlkZSBhc3luYyBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPFB1bGxSZXF1ZXN0RmFpbHVyZSB8IG51bGw+IHtcbiAgICBjb25zdCB7cHJOdW1iZXIsIHRhcmdldEJyYW5jaGVzLCByZXF1aXJlZEJhc2VTaGEsIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLCBnaXRodWJUYXJnZXRCcmFuY2h9ID1cbiAgICAgIHB1bGxSZXF1ZXN0O1xuICAgIC8vIEluIGNhc2UgYSByZXF1aXJlZCBiYXNlIGlzIHNwZWNpZmllZCBmb3IgdGhpcyBwdWxsIHJlcXVlc3QsIGNoZWNrIGlmIHRoZSBwdWxsXG4gICAgLy8gcmVxdWVzdCBjb250YWlucyB0aGUgZ2l2ZW4gY29tbWl0LiBJZiBub3QsIHJldHVybiBhIHB1bGwgcmVxdWVzdCBmYWlsdXJlLiBUaGlzXG4gICAgLy8gY2hlY2sgaXMgdXNlZnVsIGZvciBlbmZvcmNpbmcgdGhhdCBQUnMgYXJlIHJlYmFzZWQgb24gdG9wIG9mIGEgZ2l2ZW4gY29tbWl0LiBlLmcuXG4gICAgLy8gYSBjb21taXQgdGhhdCBjaGFuZ2VzIHRoZSBjb2Rlb3duZXIgc2hpcCB2YWxpZGF0aW9uLiBQUnMgd2hpY2ggYXJlIG5vdCByZWJhc2VkXG4gICAgLy8gY291bGQgYnlwYXNzIG5ldyBjb2Rlb3duZXIgc2hpcCBydWxlcy5cbiAgICBpZiAocmVxdWlyZWRCYXNlU2hhICYmICF0aGlzLmdpdC5oYXNDb21taXQoVEVNUF9QUl9IRUFEX0JSQU5DSCwgcmVxdWlyZWRCYXNlU2hhKSkge1xuICAgICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS51bnNhdGlzZmllZEJhc2VTaGEoKTtcbiAgICB9XG5cbiAgICAvLyBTSEEgZm9yIHRoZSBmaXJzdCBjb21taXQgdGhlIHB1bGwgcmVxdWVzdCBpcyBiYXNlZCBvbi4gVXN1YWxseSB3ZSB3b3VsZCBhYmxlXG4gICAgLy8gdG8ganVzdCByZWx5IG9uIHRoZSBiYXNlIHJldmlzaW9uIHByb3ZpZGVkIGJ5IGBnZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbmAsIGJ1dFxuICAgIC8vIHRoZSByZXZpc2lvbiB3b3VsZCByZWx5IG9uIHRoZSBhbW91bnQgb2YgY29tbWl0cyBpbiBhIHB1bGwgcmVxdWVzdC4gVGhpcyBpcyBub3RcbiAgICAvLyByZWxpYWJsZSBhcyB3ZSByZWJhc2UgdGhlIFBSIHdpdGggYXV0b3NxdWFzaCB3aGVyZSB0aGUgYW1vdW50IG9mIGNvbW1pdHMgY291bGRcbiAgICAvLyBjaGFuZ2UuIFdlIHdvcmsgYXJvdW5kIHRoaXMgYnkgcGFyc2luZyB0aGUgYmFzZSByZXZpc2lvbiBzbyB0aGF0IHdlIGhhdmUgYSBmaXhhdGVkXG4gICAgLy8gU0hBIGJlZm9yZSB0aGUgYXV0b3NxdWFzaCByZWJhc2UgaXMgcGVyZm9ybWVkLlxuICAgIGNvbnN0IGJhc2VTaGEgPSB0aGlzLmdpdFxuICAgICAgLnJ1bihbJ3Jldi1wYXJzZScsIHRoaXMuZ2V0UHVsbFJlcXVlc3RCYXNlUmV2aXNpb24ocHVsbFJlcXVlc3QpXSlcbiAgICAgIC5zdGRvdXQudHJpbSgpO1xuICAgIC8vIEdpdCByZXZpc2lvbiByYW5nZSB0aGF0IG1hdGNoZXMgdGhlIHB1bGwgcmVxdWVzdCBjb21taXRzLlxuICAgIGNvbnN0IHJldmlzaW9uUmFuZ2UgPSBgJHtiYXNlU2hhfS4uJHtURU1QX1BSX0hFQURfQlJBTkNIfWA7XG5cbiAgICAvLyBXZSBhbHdheXMgcmViYXNlIHRoZSBwdWxsIHJlcXVlc3Qgc28gdGhhdCBmaXh1cCBvciBzcXVhc2ggY29tbWl0cyBhcmUgYXV0b21hdGljYWxseVxuICAgIC8vIGNvbGxhcHNlZC4gR2l0J3MgYXV0b3NxdWFzaCBmdW5jdGlvbmFsaXR5IGRvZXMgb25seSB3b3JrIGluIGludGVyYWN0aXZlIHJlYmFzZXMsIHNvXG4gICAgLy8gb3VyIHJlYmFzZSBpcyBhbHdheXMgaW50ZXJhY3RpdmUuIEluIHJlYWxpdHkgdGhvdWdoLCB1bmxlc3MgYSBjb21taXQgbWVzc2FnZSBmaXh1cFxuICAgIC8vIGlzIGRlc2lyZWQsIHdlIHNldCB0aGUgYEdJVF9TRVFVRU5DRV9FRElUT1JgIGVudmlyb25tZW50IHZhcmlhYmxlIHRvIGB0cnVlYCBzbyB0aGF0XG4gICAgLy8gdGhlIHJlYmFzZSBzZWVtcyBpbnRlcmFjdGl2ZSB0byBHaXQsIHdoaWxlIGl0J3Mgbm90IGludGVyYWN0aXZlIHRvIHRoZSB1c2VyLlxuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2dpdC9naXQvY29tbWl0Lzg5MWQ0YTAzMTNlZGMwM2Y3ZTJlY2I5NmVkZWM1ZDMwZGMxODIyOTQuXG4gICAgY29uc3QgYnJhbmNoT3JSZXZpc2lvbkJlZm9yZVJlYmFzZSA9IHRoaXMuZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gICAgY29uc3QgcmViYXNlRW52ID0gbmVlZHNDb21taXRNZXNzYWdlRml4dXBcbiAgICAgID8gdW5kZWZpbmVkXG4gICAgICA6IHsuLi5wcm9jZXNzLmVudiwgR0lUX1NFUVVFTkNFX0VESVRPUjogJ3RydWUnfTtcbiAgICB0aGlzLmdpdC5ydW4oWydyZWJhc2UnLCAnLS1pbnRlcmFjdGl2ZScsICctLWF1dG9zcXVhc2gnLCBiYXNlU2hhLCBURU1QX1BSX0hFQURfQlJBTkNIXSwge1xuICAgICAgc3RkaW86ICdpbmhlcml0JyxcbiAgICAgIGVudjogcmViYXNlRW52LFxuICAgIH0pO1xuXG4gICAgLy8gVXBkYXRlIHB1bGwgcmVxdWVzdHMgY29tbWl0cyB0byByZWZlcmVuY2UgdGhlIHB1bGwgcmVxdWVzdC4gVGhpcyBtYXRjaGVzIHdoYXRcbiAgICAvLyBHaXRodWIgZG9lcyB3aGVuIHB1bGwgcmVxdWVzdHMgYXJlIG1lcmdlZCB0aHJvdWdoIHRoZSBXZWIgVUkuIFRoZSBtb3RpdmF0aW9uIGlzXG4gICAgLy8gdGhhdCBpdCBzaG91bGQgYmUgZWFzeSB0byBkZXRlcm1pbmUgd2hpY2ggcHVsbCByZXF1ZXN0IGNvbnRhaW5lZCBhIGdpdmVuIGNvbW1pdC5cbiAgICAvLyBOb3RlOiBUaGUgZmlsdGVyLWJyYW5jaCBjb21tYW5kIHJlbGllcyBvbiB0aGUgd29ya2luZyB0cmVlLCBzbyB3ZSB3YW50IHRvIG1ha2Ugc3VyZVxuICAgIC8vIHRoYXQgd2UgYXJlIG9uIHRoZSBpbml0aWFsIGJyYW5jaCBvciByZXZpc2lvbiB3aGVyZSB0aGUgbWVyZ2Ugc2NyaXB0IGhhcyBiZWVuIGludm9rZWQuXG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLWYnLCBicmFuY2hPclJldmlzaW9uQmVmb3JlUmViYXNlXSk7XG4gICAgdGhpcy5naXQucnVuKFtcbiAgICAgICdmaWx0ZXItYnJhbmNoJyxcbiAgICAgICctZicsXG4gICAgICAnLS1tc2ctZmlsdGVyJyxcbiAgICAgIGAke01TR19GSUxURVJfU0NSSVBUfSAke3ByTnVtYmVyfWAsXG4gICAgICByZXZpc2lvblJhbmdlLFxuICAgIF0pO1xuXG4gICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHB1bGwgcmVxdWVzdCBpbnRvIGFsbCBkZXRlcm1pbmVkIHRhcmdldCBicmFuY2hlcy5cbiAgICBjb25zdCBmYWlsZWRCcmFuY2hlcyA9IHRoaXMuY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhyZXZpc2lvblJhbmdlLCB0YXJnZXRCcmFuY2hlcyk7XG5cbiAgICBpZiAoZmFpbGVkQnJhbmNoZXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm1lcmdlQ29uZmxpY3RzKGZhaWxlZEJyYW5jaGVzKTtcbiAgICB9XG5cbiAgICB0aGlzLnB1c2hUYXJnZXRCcmFuY2hlc1Vwc3RyZWFtKHRhcmdldEJyYW5jaGVzKTtcblxuICAgIC8vIEZvciBQUnMgd2hpY2ggZG8gbm90IHRhcmdldCB0aGUgYG1haW5gIGJyYW5jaCBvbiBHaXRodWIsIEdpdGh1YiBkb2VzIG5vdCBhdXRvbWF0aWNhbGx5XG4gICAgLy8gY2xvc2UgdGhlIFBSIHdoZW4gaXRzIGNvbW1pdCBpcyBwdXNoZWQgaW50byB0aGUgcmVwb3NpdG9yeS4gVG8gZW5zdXJlIHRoZXNlIFBScyBhcmVcbiAgICAvLyBjb3JyZWN0bHkgbWFya2VkIGFzIGNsb3NlZCwgd2UgbXVzdCBkZXRlY3QgdGhpcyBzaXR1YXRpb24gYW5kIGNsb3NlIHRoZSBQUiB2aWEgdGhlIEFQSSBhZnRlclxuICAgIC8vIHRoZSB1cHN0cmVhbSBwdXNoZXMgYXJlIGNvbXBsZXRlZC5cbiAgICBpZiAoZ2l0aHViVGFyZ2V0QnJhbmNoICE9PSB0aGlzLmdpdC5tYWluQnJhbmNoTmFtZSkge1xuICAgICAgLyoqIFRoZSBsb2NhbCBicmFuY2ggbmFtZSBvZiB0aGUgZ2l0aHViIHRhcmdldGVkIGJyYW5jaC4gKi9cbiAgICAgIGNvbnN0IGxvY2FsQnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUoZ2l0aHViVGFyZ2V0QnJhbmNoKTtcbiAgICAgIC8qKiBUaGUgU0hBIG9mIHRoZSBjb21taXQgcHVzaGVkIHRvIGdpdGh1YiB3aGljaCByZXByZXNlbnRzIGNsb3NpbmcgdGhlIFBSLiAqL1xuICAgICAgY29uc3Qgc2hhID0gdGhpcy5naXQucnVuKFsncmV2LXBhcnNlJywgbG9jYWxCcmFuY2hdKS5zdGRvdXQudHJpbSgpO1xuICAgICAgLy8gQ3JlYXRlIGEgY29tbWVudCBzYXlpbmcgdGhlIFBSIHdhcyBjbG9zZWQgYnkgdGhlIFNIQS5cbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5pc3N1ZXMuY3JlYXRlQ29tbWVudCh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBwdWxsUmVxdWVzdC5wck51bWJlcixcbiAgICAgICAgYm9keTogYENsb3NlZCBieSBjb21taXQgJHtzaGF9YCxcbiAgICAgIH0pO1xuICAgICAgLy8gQWN0dWFsbHkgY2xvc2UgdGhlIFBSLlxuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLnVwZGF0ZSh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgcHVsbF9udW1iZXI6IHB1bGxSZXF1ZXN0LnByTnVtYmVyLFxuICAgICAgICBzdGF0ZTogJ2Nsb3NlZCcsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19