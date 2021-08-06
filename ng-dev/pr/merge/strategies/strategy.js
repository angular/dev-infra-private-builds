"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeStrategy = exports.TEMP_PR_HEAD_BRANCH = void 0;
/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
exports.TEMP_PR_HEAD_BRANCH = 'merge_pr_head';
/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
class MergeStrategy {
    constructor(git) {
        this.git = git;
    }
    /**
     * Prepares a merge of the given pull request. The strategy by default will
     * fetch all target branches and the pull request into local temporary branches.
     */
    async prepare(pullRequest) {
        this.fetchTargetBranches(pullRequest.targetBranches, `pull/${pullRequest.prNumber}/head:${exports.TEMP_PR_HEAD_BRANCH}`);
    }
    /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
    async cleanup(pullRequest) {
        // Delete all temporary target branches.
        pullRequest.targetBranches.forEach((branchName) => this.git.run(['branch', '-D', this.getLocalTargetBranchName(branchName)]));
        // Delete temporary branch for the pull request head.
        this.git.run(['branch', '-D', exports.TEMP_PR_HEAD_BRANCH]);
    }
    /** Gets the revision range for all commits in the given pull request. */
    getPullRequestRevisionRange(pullRequest) {
        return `${this.getPullRequestBaseRevision(pullRequest)}..${exports.TEMP_PR_HEAD_BRANCH}`;
    }
    /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
    getPullRequestBaseRevision(pullRequest) {
        return `${exports.TEMP_PR_HEAD_BRANCH}~${pullRequest.commitCount}`;
    }
    /** Gets a deterministic local branch name for a given branch. */
    getLocalTargetBranchName(targetBranch) {
        return `merge_pr_target_${targetBranch.replace(/\//g, '_')}`;
    }
    /**
     * Cherry-picks the given revision range into the specified target branches.
     * @returns A list of branches for which the revisions could not be cherry-picked into.
     */
    cherryPickIntoTargetBranches(revisionRange, targetBranches, options = {}) {
        const cherryPickArgs = [revisionRange];
        const failedBranches = [];
        if (options.dryRun) {
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt---no-commit
            // This causes `git cherry-pick` to not generate any commits. Instead, the changes are
            // applied directly in the working tree. This allow us to easily discard the changes
            // for dry-run purposes.
            cherryPickArgs.push('--no-commit');
        }
        if (options.linkToOriginalCommits) {
            // We add `-x` when cherry-picking as that will allow us to easily jump to original
            // commits for cherry-picked commits. With that flag set, Git will automatically append
            // the original SHA/revision to the commit message. e.g. `(cherry picked from commit <..>)`.
            // https://git-scm.com/docs/git-cherry-pick#Documentation/git-cherry-pick.txt--x.
            cherryPickArgs.push('-x');
        }
        // Cherry-pick the refspec into all determined target branches.
        for (const branchName of targetBranches) {
            const localTargetBranch = this.getLocalTargetBranchName(branchName);
            // Checkout the local target branch.
            this.git.run(['checkout', localTargetBranch]);
            // Cherry-pick the refspec into the target branch.
            if (this.git.runGraceful(['cherry-pick', ...cherryPickArgs]).status !== 0) {
                // Abort the failed cherry-pick. We do this because Git persists the failed
                // cherry-pick state globally in the repository. This could prevent future
                // pull request merges as a Git thinks a cherry-pick is still in progress.
                this.git.runGraceful(['cherry-pick', '--abort']);
                failedBranches.push(branchName);
            }
            // If we run with dry run mode, we reset the local target branch so that all dry-run
            // cherry-pick changes are discard. Changes are applied to the working tree and index.
            if (options.dryRun) {
                this.git.run(['reset', '--hard', 'HEAD']);
            }
        }
        return failedBranches;
    }
    /**
     * Fetches the given target branches. Also accepts a list of additional refspecs that
     * should be fetched. This is helpful as multiple slow fetches could be avoided.
     */
    fetchTargetBranches(names, ...extraRefspecs) {
        const fetchRefspecs = names.map((targetBranch) => {
            const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
            return `refs/heads/${targetBranch}:${localTargetBranch}`;
        });
        // Fetch all target branches with a single command. We don't want to fetch them
        // individually as that could cause an unnecessary slow-down.
        this.git.run([
            'fetch',
            '-q',
            '-f',
            this.git.getRepoGitUrl(),
            ...fetchRefspecs,
            ...extraRefspecs,
        ]);
    }
    /** Pushes the given target branches upstream. */
    pushTargetBranchesUpstream(names) {
        const pushRefspecs = names.map((targetBranch) => {
            const localTargetBranch = this.getLocalTargetBranchName(targetBranch);
            return `${localTargetBranch}:refs/heads/${targetBranch}`;
        });
        // Push all target branches with a single command if we don't run in dry-run mode.
        // We don't want to push them individually as that could cause an unnecessary slow-down.
        this.git.run(['push', this.git.getRepoGitUrl(), ...pushRefspecs]);
    }
}
exports.MergeStrategy = MergeStrategy;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvbWVyZ2Uvc3RyYXRlZ2llcy9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFNSDs7OztHQUlHO0FBQ1UsUUFBQSxtQkFBbUIsR0FBRyxlQUFlLENBQUM7QUFFbkQ7OztHQUdHO0FBQ0gsTUFBc0IsYUFBYTtJQUNqQyxZQUFzQixHQUEyQjtRQUEzQixRQUFHLEdBQUgsR0FBRyxDQUF3QjtJQUFHLENBQUM7SUFFckQ7OztPQUdHO0lBQ0gsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUF3QjtRQUNwQyxJQUFJLENBQUMsbUJBQW1CLENBQ3RCLFdBQVcsQ0FBQyxjQUFjLEVBQzFCLFFBQVEsV0FBVyxDQUFDLFFBQVEsU0FBUywyQkFBbUIsRUFBRSxDQUMzRCxDQUFDO0lBQ0osQ0FBQztJQVFELGdGQUFnRjtJQUNoRixLQUFLLENBQUMsT0FBTyxDQUFDLFdBQXdCO1FBQ3BDLHdDQUF3QztRQUN4QyxXQUFXLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQ2hELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsd0JBQXdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUMxRSxDQUFDO1FBRUYscURBQXFEO1FBQ3JELElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSwyQkFBbUIsQ0FBQyxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUVELHlFQUF5RTtJQUMvRCwyQkFBMkIsQ0FBQyxXQUF3QjtRQUM1RCxPQUFPLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFdBQVcsQ0FBQyxLQUFLLDJCQUFtQixFQUFFLENBQUM7SUFDbkYsQ0FBQztJQUVE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Q0FBQyx3QkFBd0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUN0RSxPQUFPLEdBQUcsaUJBQWlCLGVBQWUsWUFBWSxFQUFFLENBQUM7UUFDM0QsQ0FBQyxDQUFDLENBQUM7UUFDSCxrRkFBa0Y7UUFDbEYsd0ZBQXdGO1FBQ3hGLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7Q0FDRjtBQWxJRCxzQ0FrSUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuLi9mYWlsdXJlcyc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0fSBmcm9tICcuLi9wdWxsLXJlcXVlc3QnO1xuXG4vKipcbiAqIE5hbWUgb2YgYSB0ZW1wb3JhcnkgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIGhlYWQgb2YgYSBjdXJyZW50bHktcHJvY2Vzc2VkIFBSLiBOb3RlXG4gKiB0aGF0IGEgYnJhbmNoIG5hbWUgc2hvdWxkIGJlIHVzZWQgdGhhdCBtb3N0IGxpa2VseSBkb2VzIG5vdCBjb25mbGljdCB3aXRoIG90aGVyIGxvY2FsXG4gKiBkZXZlbG9wbWVudCBicmFuY2hlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IFRFTVBfUFJfSEVBRF9CUkFOQ0ggPSAnbWVyZ2VfcHJfaGVhZCc7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgbWVyZ2Ugc3RyYXRlZ2llcy4gQSBtZXJnZSBzdHJhdGVneSBhY2NlcHRzIGEgcHVsbCByZXF1ZXN0IGFuZFxuICogbWVyZ2VzIGl0IGludG8gdGhlIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgTWVyZ2VTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQpIHt9XG5cbiAgLyoqXG4gICAqIFByZXBhcmVzIGEgbWVyZ2Ugb2YgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gVGhlIHN0cmF0ZWd5IGJ5IGRlZmF1bHQgd2lsbFxuICAgKiBmZXRjaCBhbGwgdGFyZ2V0IGJyYW5jaGVzIGFuZCB0aGUgcHVsbCByZXF1ZXN0IGludG8gbG9jYWwgdGVtcG9yYXJ5IGJyYW5jaGVzLlxuICAgKi9cbiAgYXN5bmMgcHJlcGFyZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpIHtcbiAgICB0aGlzLmZldGNoVGFyZ2V0QnJhbmNoZXMoXG4gICAgICBwdWxsUmVxdWVzdC50YXJnZXRCcmFuY2hlcyxcbiAgICAgIGBwdWxsLyR7cHVsbFJlcXVlc3QucHJOdW1iZXJ9L2hlYWQ6JHtURU1QX1BSX0hFQURfQlJBTkNIfWAsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgbWVyZ2Ugb2YgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gVGhpcyBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZFxuICAgKiBieSBpbmRpdmlkdWFsIG1lcmdlIHN0cmF0ZWdpZXMuXG4gICAqL1xuICBhYnN0cmFjdCBtZXJnZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBQcm9taXNlPG51bGwgfCBQdWxsUmVxdWVzdEZhaWx1cmU+O1xuXG4gIC8qKiBDbGVhbnMgdXAgdGhlIHB1bGwgcmVxdWVzdCBtZXJnZS4gZS5nLiBkZWxldGluZyB0ZW1wb3JhcnkgbG9jYWwgYnJhbmNoZXMuICovXG4gIGFzeW5jIGNsZWFudXAocHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0KSB7XG4gICAgLy8gRGVsZXRlIGFsbCB0ZW1wb3JhcnkgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIHB1bGxSZXF1ZXN0LnRhcmdldEJyYW5jaGVzLmZvckVhY2goKGJyYW5jaE5hbWUpID0+XG4gICAgICB0aGlzLmdpdC5ydW4oWydicmFuY2gnLCAnLUQnLCB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShicmFuY2hOYW1lKV0pLFxuICAgICk7XG5cbiAgICAvLyBEZWxldGUgdGVtcG9yYXJ5IGJyYW5jaCBmb3IgdGhlIHB1bGwgcmVxdWVzdCBoZWFkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2JyYW5jaCcsICctRCcsIFRFTVBfUFJfSEVBRF9CUkFOQ0hdKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByZXZpc2lvbiByYW5nZSBmb3IgYWxsIGNvbW1pdHMgaW4gdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJvdGVjdGVkIGdldFB1bGxSZXF1ZXN0UmV2aXNpb25SYW5nZShwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLmdldFB1bGxSZXF1ZXN0QmFzZVJldmlzaW9uKHB1bGxSZXF1ZXN0KX0uLiR7VEVNUF9QUl9IRUFEX0JSQU5DSH1gO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGJhc2UgcmV2aXNpb24gb2YgYSBwdWxsIHJlcXVlc3QuIGkuZS4gdGhlIGNvbW1pdCB0aGUgUFIgaXMgYmFzZWQgb24uICovXG4gIHByb3RlY3RlZCBnZXRQdWxsUmVxdWVzdEJhc2VSZXZpc2lvbihwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3QpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtURU1QX1BSX0hFQURfQlJBTkNIfX4ke3B1bGxSZXF1ZXN0LmNvbW1pdENvdW50fWA7XG4gIH1cblxuICAvKiogR2V0cyBhIGRldGVybWluaXN0aWMgbG9jYWwgYnJhbmNoIG5hbWUgZm9yIGEgZ2l2ZW4gYnJhbmNoLiAqL1xuICBwcm90ZWN0ZWQgZ2V0TG9jYWxUYXJnZXRCcmFuY2hOYW1lKHRhcmdldEJyYW5jaDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYG1lcmdlX3ByX3RhcmdldF8ke3RhcmdldEJyYW5jaC5yZXBsYWNlKC9cXC8vZywgJ18nKX1gO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgZ2l2ZW4gcmV2aXNpb24gcmFuZ2UgaW50byB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2hlcy5cbiAgICogQHJldHVybnMgQSBsaXN0IG9mIGJyYW5jaGVzIGZvciB3aGljaCB0aGUgcmV2aXNpb25zIGNvdWxkIG5vdCBiZSBjaGVycnktcGlja2VkIGludG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgY2hlcnJ5UGlja0ludG9UYXJnZXRCcmFuY2hlcyhcbiAgICByZXZpc2lvblJhbmdlOiBzdHJpbmcsXG4gICAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdLFxuICAgIG9wdGlvbnM6IHtcbiAgICAgIGRyeVJ1bj86IGJvb2xlYW47XG4gICAgICBsaW5rVG9PcmlnaW5hbENvbW1pdHM/OiBib29sZWFuO1xuICAgIH0gPSB7fSxcbiAgKSB7XG4gICAgY29uc3QgY2hlcnJ5UGlja0FyZ3MgPSBbcmV2aXNpb25SYW5nZV07XG4gICAgY29uc3QgZmFpbGVkQnJhbmNoZXM6IHN0cmluZ1tdID0gW107XG5cbiAgICBpZiAob3B0aW9ucy5kcnlSdW4pIHtcbiAgICAgIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtY2hlcnJ5LXBpY2sjRG9jdW1lbnRhdGlvbi9naXQtY2hlcnJ5LXBpY2sudHh0LS0tbm8tY29tbWl0XG4gICAgICAvLyBUaGlzIGNhdXNlcyBgZ2l0IGNoZXJyeS1waWNrYCB0byBub3QgZ2VuZXJhdGUgYW55IGNvbW1pdHMuIEluc3RlYWQsIHRoZSBjaGFuZ2VzIGFyZVxuICAgICAgLy8gYXBwbGllZCBkaXJlY3RseSBpbiB0aGUgd29ya2luZyB0cmVlLiBUaGlzIGFsbG93IHVzIHRvIGVhc2lseSBkaXNjYXJkIHRoZSBjaGFuZ2VzXG4gICAgICAvLyBmb3IgZHJ5LXJ1biBwdXJwb3Nlcy5cbiAgICAgIGNoZXJyeVBpY2tBcmdzLnB1c2goJy0tbm8tY29tbWl0Jyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMubGlua1RvT3JpZ2luYWxDb21taXRzKSB7XG4gICAgICAvLyBXZSBhZGQgYC14YCB3aGVuIGNoZXJyeS1waWNraW5nIGFzIHRoYXQgd2lsbCBhbGxvdyB1cyB0byBlYXNpbHkganVtcCB0byBvcmlnaW5hbFxuICAgICAgLy8gY29tbWl0cyBmb3IgY2hlcnJ5LXBpY2tlZCBjb21taXRzLiBXaXRoIHRoYXQgZmxhZyBzZXQsIEdpdCB3aWxsIGF1dG9tYXRpY2FsbHkgYXBwZW5kXG4gICAgICAvLyB0aGUgb3JpZ2luYWwgU0hBL3JldmlzaW9uIHRvIHRoZSBjb21taXQgbWVzc2FnZS4gZS5nLiBgKGNoZXJyeSBwaWNrZWQgZnJvbSBjb21taXQgPC4uPilgLlxuICAgICAgLy8gaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdC1jaGVycnktcGljayNEb2N1bWVudGF0aW9uL2dpdC1jaGVycnktcGljay50eHQtLXguXG4gICAgICBjaGVycnlQaWNrQXJncy5wdXNoKCcteCcpO1xuICAgIH1cblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSByZWZzcGVjIGludG8gYWxsIGRldGVybWluZWQgdGFyZ2V0IGJyYW5jaGVzLlxuICAgIGZvciAoY29uc3QgYnJhbmNoTmFtZSBvZiB0YXJnZXRCcmFuY2hlcykge1xuICAgICAgY29uc3QgbG9jYWxUYXJnZXRCcmFuY2ggPSB0aGlzLmdldExvY2FsVGFyZ2V0QnJhbmNoTmFtZShicmFuY2hOYW1lKTtcbiAgICAgIC8vIENoZWNrb3V0IHRoZSBsb2NhbCB0YXJnZXQgYnJhbmNoLlxuICAgICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCBsb2NhbFRhcmdldEJyYW5jaF0pO1xuICAgICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHJlZnNwZWMgaW50byB0aGUgdGFyZ2V0IGJyYW5jaC5cbiAgICAgIGlmICh0aGlzLmdpdC5ydW5HcmFjZWZ1bChbJ2NoZXJyeS1waWNrJywgLi4uY2hlcnJ5UGlja0FyZ3NdKS5zdGF0dXMgIT09IDApIHtcbiAgICAgICAgLy8gQWJvcnQgdGhlIGZhaWxlZCBjaGVycnktcGljay4gV2UgZG8gdGhpcyBiZWNhdXNlIEdpdCBwZXJzaXN0cyB0aGUgZmFpbGVkXG4gICAgICAgIC8vIGNoZXJyeS1waWNrIHN0YXRlIGdsb2JhbGx5IGluIHRoZSByZXBvc2l0b3J5LiBUaGlzIGNvdWxkIHByZXZlbnQgZnV0dXJlXG4gICAgICAgIC8vIHB1bGwgcmVxdWVzdCBtZXJnZXMgYXMgYSBHaXQgdGhpbmtzIGEgY2hlcnJ5LXBpY2sgaXMgc3RpbGwgaW4gcHJvZ3Jlc3MuXG4gICAgICAgIHRoaXMuZ2l0LnJ1bkdyYWNlZnVsKFsnY2hlcnJ5LXBpY2snLCAnLS1hYm9ydCddKTtcbiAgICAgICAgZmFpbGVkQnJhbmNoZXMucHVzaChicmFuY2hOYW1lKTtcbiAgICAgIH1cbiAgICAgIC8vIElmIHdlIHJ1biB3aXRoIGRyeSBydW4gbW9kZSwgd2UgcmVzZXQgdGhlIGxvY2FsIHRhcmdldCBicmFuY2ggc28gdGhhdCBhbGwgZHJ5LXJ1blxuICAgICAgLy8gY2hlcnJ5LXBpY2sgY2hhbmdlcyBhcmUgZGlzY2FyZC4gQ2hhbmdlcyBhcmUgYXBwbGllZCB0byB0aGUgd29ya2luZyB0cmVlIGFuZCBpbmRleC5cbiAgICAgIGlmIChvcHRpb25zLmRyeVJ1bikge1xuICAgICAgICB0aGlzLmdpdC5ydW4oWydyZXNldCcsICctLWhhcmQnLCAnSEVBRCddKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhaWxlZEJyYW5jaGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgdGhlIGdpdmVuIHRhcmdldCBicmFuY2hlcy4gQWxzbyBhY2NlcHRzIGEgbGlzdCBvZiBhZGRpdGlvbmFsIHJlZnNwZWNzIHRoYXRcbiAgICogc2hvdWxkIGJlIGZldGNoZWQuIFRoaXMgaXMgaGVscGZ1bCBhcyBtdWx0aXBsZSBzbG93IGZldGNoZXMgY291bGQgYmUgYXZvaWRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBmZXRjaFRhcmdldEJyYW5jaGVzKG5hbWVzOiBzdHJpbmdbXSwgLi4uZXh0cmFSZWZzcGVjczogc3RyaW5nW10pIHtcbiAgICBjb25zdCBmZXRjaFJlZnNwZWNzID0gbmFtZXMubWFwKCh0YXJnZXRCcmFuY2gpID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgcmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH06JHtsb2NhbFRhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIEZldGNoIGFsbCB0YXJnZXQgYnJhbmNoZXMgd2l0aCBhIHNpbmdsZSBjb21tYW5kLiBXZSBkb24ndCB3YW50IHRvIGZldGNoIHRoZW1cbiAgICAvLyBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFtcbiAgICAgICdmZXRjaCcsXG4gICAgICAnLXEnLFxuICAgICAgJy1mJyxcbiAgICAgIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSxcbiAgICAgIC4uLmZldGNoUmVmc3BlY3MsXG4gICAgICAuLi5leHRyYVJlZnNwZWNzLFxuICAgIF0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgZ2l2ZW4gdGFyZ2V0IGJyYW5jaGVzIHVwc3RyZWFtLiAqL1xuICBwcm90ZWN0ZWQgcHVzaFRhcmdldEJyYW5jaGVzVXBzdHJlYW0obmFtZXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgcHVzaFJlZnNwZWNzID0gbmFtZXMubWFwKCh0YXJnZXRCcmFuY2gpID0+IHtcbiAgICAgIGNvbnN0IGxvY2FsVGFyZ2V0QnJhbmNoID0gdGhpcy5nZXRMb2NhbFRhcmdldEJyYW5jaE5hbWUodGFyZ2V0QnJhbmNoKTtcbiAgICAgIHJldHVybiBgJHtsb2NhbFRhcmdldEJyYW5jaH06cmVmcy9oZWFkcy8ke3RhcmdldEJyYW5jaH1gO1xuICAgIH0pO1xuICAgIC8vIFB1c2ggYWxsIHRhcmdldCBicmFuY2hlcyB3aXRoIGEgc2luZ2xlIGNvbW1hbmQgaWYgd2UgZG9uJ3QgcnVuIGluIGRyeS1ydW4gbW9kZS5cbiAgICAvLyBXZSBkb24ndCB3YW50IHRvIHB1c2ggdGhlbSBpbmRpdmlkdWFsbHkgYXMgdGhhdCBjb3VsZCBjYXVzZSBhbiB1bm5lY2Vzc2FyeSBzbG93LWRvd24uXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgLi4ucHVzaFJlZnNwZWNzXSk7XG4gIH1cbn1cbiJdfQ==