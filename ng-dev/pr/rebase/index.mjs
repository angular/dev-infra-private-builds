"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rebasePr = void 0;
const utils_1 = require("../../commit-message/utils");
const console_1 = require("../../utils/console");
const authenticated_git_client_1 = require("../../utils/git/authenticated-git-client");
const github_urls_1 = require("../../utils/git/github-urls");
const fetch_pull_request_1 = require("../common/fetch-pull-request");
/**
 * Rebase the provided PR onto its merge target branch, and push up the resulting
 * commit to the PRs repository.
 *
 * @returns a status code indicating whether the rebase was successful.
 */
async function rebasePr(prNumber, githubToken) {
    /** The singleton instance of the authenticated git client. */
    const git = authenticated_git_client_1.AuthenticatedGitClient.get();
    if (git.hasUncommittedChanges()) {
        (0, console_1.error)('Cannot perform rebase of PR with local changes.');
        return 1;
    }
    /**
     * The branch or revision originally checked out before this method performed
     * any Git operations that may change the working branch.
     */
    const previousBranchOrRevision = git.getCurrentBranchOrRevision();
    /* Get the PR information from Github. */
    const pr = await (0, fetch_pull_request_1.fetchPullRequestFromGithub)(git, prNumber);
    if (pr === null) {
        (0, console_1.error)(`Specified pull request does not exist.`);
        return 1;
    }
    const headRefName = pr.headRef.name;
    const baseRefName = pr.baseRef.name;
    const fullHeadRef = `${pr.headRef.repository.nameWithOwner}:${headRefName}`;
    const fullBaseRef = `${pr.baseRef.repository.nameWithOwner}:${baseRefName}`;
    const headRefUrl = (0, github_urls_1.addTokenToGitHttpsUrl)(pr.headRef.repository.url, githubToken);
    const baseRefUrl = (0, github_urls_1.addTokenToGitHttpsUrl)(pr.baseRef.repository.url, githubToken);
    // Note: Since we use a detached head for rebasing the PR and therefore do not have
    // remote-tracking branches configured, we need to set our expected ref and SHA. This
    // allows us to use `--force-with-lease` for the detached head while ensuring that we
    // never accidentally override upstream changes that have been pushed in the meanwhile.
    // See:
    // https://git-scm.com/docs/git-push#Documentation/git-push.txt---force-with-leaseltrefnamegtltexpectgt
    const forceWithLeaseFlag = `--force-with-lease=${headRefName}:${pr.headRefOid}`;
    // If the PR does not allow maintainers to modify it, exit as the rebased PR cannot
    // be pushed up.
    if (!pr.maintainerCanModify && !pr.viewerDidAuthor) {
        (0, console_1.error)(`Cannot rebase as you did not author the PR and the PR does not allow maintainers` +
            `to modify the PR`);
        return 1;
    }
    try {
        // Fetches are done with --deepen=500 increase the likelihood of finding a common ancestor when
        // a shallow clone is being used.
        // Fetch the branch at the commit of the PR, and check it out in a detached state.
        (0, console_1.info)(`Checking out PR #${prNumber} from ${fullHeadRef}`);
        git.run(['fetch', '-q', headRefUrl, headRefName, '--deepen=500']);
        git.run(['checkout', '-q', '--detach', 'FETCH_HEAD']);
        // Fetch the PRs target branch and rebase onto it.
        (0, console_1.info)(`Fetching ${fullBaseRef} to rebase #${prNumber} on`);
        git.run(['fetch', '-q', baseRefUrl, baseRefName, '--deepen=500']);
        const commonAncestorSha = git.run(['merge-base', 'HEAD', 'FETCH_HEAD']).stdout.trim();
        const commits = await (0, utils_1.getCommitsInRange)(commonAncestorSha, 'HEAD');
        let squashFixups = process.env['CI'] !== undefined ||
            commits.filter((commit) => commit.isFixup).length === 0
            ? false
            : await (0, console_1.promptConfirm)(`PR #${prNumber} contains fixup commits, would you like to squash them during rebase?`, true);
        (0, console_1.info)(`Attempting to rebase PR #${prNumber} on ${fullBaseRef}`);
        /**
         * Tuple of flags to be added to the rebase command and env object to run the git command.
         *
         * Additional flags to perform the autosquashing are added when the user confirm squashing of
         * fixup commits should occur.
         */
        const [flags, env] = squashFixups
            ? [['--interactive', '--autosquash'], { ...process.env, GIT_SEQUENCE_EDITOR: 'true' }]
            : [[], undefined];
        const rebaseResult = git.runGraceful(['rebase', ...flags, 'FETCH_HEAD'], { env: env });
        // If the rebase was clean, push the rebased PR up to the authors fork.
        if (rebaseResult.status === 0) {
            (0, console_1.info)(`Rebase was able to complete automatically without conflicts`);
            (0, console_1.info)(`Pushing rebased PR #${prNumber} to ${fullHeadRef}`);
            git.run(['push', headRefUrl, `HEAD:${headRefName}`, forceWithLeaseFlag]);
            (0, console_1.info)(`Rebased and updated PR #${prNumber}`);
            git.checkout(previousBranchOrRevision, true);
            return 0;
        }
    }
    catch (err) {
        (0, console_1.error)(err);
        git.checkout(previousBranchOrRevision, true);
        return 1;
    }
    // On automatic rebase failures, prompt to choose if the rebase should be continued
    // manually or aborted now.
    (0, console_1.info)(`Rebase was unable to complete automatically without conflicts.`);
    // If the command is run in a non-CI environment, prompt to format the files immediately.
    const continueRebase = process.env['CI'] === undefined && (await (0, console_1.promptConfirm)('Manually complete rebase?'));
    if (continueRebase) {
        (0, console_1.info)(`After manually completing rebase, run the following command to update PR #${prNumber}:`);
        (0, console_1.info)(` $ git push ${pr.headRef.repository.url} HEAD:${headRefName} ${forceWithLeaseFlag}`);
        (0, console_1.info)();
        (0, console_1.info)(`To abort the rebase and return to the state of the repository before this command`);
        (0, console_1.info)(`run the following command:`);
        (0, console_1.info)(` $ git rebase --abort && git reset --hard && git checkout ${previousBranchOrRevision}`);
        return 1;
    }
    else {
        (0, console_1.info)(`Cleaning up git state, and restoring previous state.`);
    }
    git.checkout(previousBranchOrRevision, true);
    return 1;
}
exports.rebasePr = rebasePr;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcHIvcmViYXNlL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQVFBLHNEQUE2RDtBQUM3RCxpREFBK0Q7QUFDL0QsdUZBQWdGO0FBQ2hGLDZEQUFrRTtBQUNsRSxxRUFBd0U7QUFFeEU7Ozs7O0dBS0c7QUFDSSxLQUFLLFVBQVUsUUFBUSxDQUFDLFFBQWdCLEVBQUUsV0FBbUI7SUFDbEUsOERBQThEO0lBQzlELE1BQU0sR0FBRyxHQUFHLGlEQUFzQixDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ3pDLElBQUksR0FBRyxDQUFDLHFCQUFxQixFQUFFLEVBQUU7UUFDL0IsSUFBQSxlQUFLLEVBQUMsaURBQWlELENBQUMsQ0FBQztRQUN6RCxPQUFPLENBQUMsQ0FBQztLQUNWO0lBRUQ7OztPQUdHO0lBQ0gsTUFBTSx3QkFBd0IsR0FBRyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUNsRSx5Q0FBeUM7SUFDekMsTUFBTSxFQUFFLEdBQUcsTUFBTSxJQUFBLCtDQUEwQixFQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUUzRCxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7UUFDZixJQUFBLGVBQUssRUFBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQ2hELE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFFRCxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUNwQyxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUNwQyxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsSUFBSSxXQUFXLEVBQUUsQ0FBQztJQUM1RSxNQUFNLFdBQVcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLGFBQWEsSUFBSSxX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RixJQUFBLGNBQUksRUFBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ25DLElBQUEsY0FBSSxFQUFDLDZEQUE2RCx3QkFBd0IsRUFBRSxDQUFDLENBQUM7UUFDOUYsT0FBTyxDQUFDLENBQUM7S0FDVjtTQUFNO1FBQ0wsSUFBQSxjQUFJLEVBQUMsc0RBQXNELENBQUMsQ0FBQztLQUM5RDtJQUVELEdBQUcsQ0FBQyxRQUFRLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0MsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBeEhELDRCQXdIQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0luUmFuZ2V9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3V0aWxzJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm19IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7YWRkVG9rZW5Ub0dpdEh0dHBzVXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1Yn0gZnJvbSAnLi4vY29tbW9uL2ZldGNoLXB1bGwtcmVxdWVzdCc7XG5cbi8qKlxuICogUmViYXNlIHRoZSBwcm92aWRlZCBQUiBvbnRvIGl0cyBtZXJnZSB0YXJnZXQgYnJhbmNoLCBhbmQgcHVzaCB1cCB0aGUgcmVzdWx0aW5nXG4gKiBjb21taXQgdG8gdGhlIFBScyByZXBvc2l0b3J5LlxuICpcbiAqIEByZXR1cm5zIGEgc3RhdHVzIGNvZGUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSByZWJhc2Ugd2FzIHN1Y2Nlc3NmdWwuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWJhc2VQcihwck51bWJlcjogbnVtYmVyLCBnaXRodWJUb2tlbjogc3RyaW5nKTogUHJvbWlzZTxudW1iZXI+IHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgY29uc3QgZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgaWYgKGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgIGVycm9yKCdDYW5ub3QgcGVyZm9ybSByZWJhc2Ugb2YgUFIgd2l0aCBsb2NhbCBjaGFuZ2VzLicpO1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSBicmFuY2ggb3IgcmV2aXNpb24gb3JpZ2luYWxseSBjaGVja2VkIG91dCBiZWZvcmUgdGhpcyBtZXRob2QgcGVyZm9ybWVkXG4gICAqIGFueSBHaXQgb3BlcmF0aW9ucyB0aGF0IG1heSBjaGFuZ2UgdGhlIHdvcmtpbmcgYnJhbmNoLlxuICAgKi9cbiAgY29uc3QgcHJldmlvdXNCcmFuY2hPclJldmlzaW9uID0gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIC8qIEdldCB0aGUgUFIgaW5mb3JtYXRpb24gZnJvbSBHaXRodWIuICovXG4gIGNvbnN0IHByID0gYXdhaXQgZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoZ2l0LCBwck51bWJlcik7XG5cbiAgaWYgKHByID09PSBudWxsKSB7XG4gICAgZXJyb3IoYFNwZWNpZmllZCBwdWxsIHJlcXVlc3QgZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBjb25zdCBoZWFkUmVmTmFtZSA9IHByLmhlYWRSZWYubmFtZTtcbiAgY29uc3QgYmFzZVJlZk5hbWUgPSBwci5iYXNlUmVmLm5hbWU7XG4gIGNvbnN0IGZ1bGxIZWFkUmVmID0gYCR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5Lm5hbWVXaXRoT3duZXJ9OiR7aGVhZFJlZk5hbWV9YDtcbiAgY29uc3QgZnVsbEJhc2VSZWYgPSBgJHtwci5iYXNlUmVmLnJlcG9zaXRvcnkubmFtZVdpdGhPd25lcn06JHtiYXNlUmVmTmFtZX1gO1xuICBjb25zdCBoZWFkUmVmVXJsID0gYWRkVG9rZW5Ub0dpdEh0dHBzVXJsKHByLmhlYWRSZWYucmVwb3NpdG9yeS51cmwsIGdpdGh1YlRva2VuKTtcbiAgY29uc3QgYmFzZVJlZlVybCA9IGFkZFRva2VuVG9HaXRIdHRwc1VybChwci5iYXNlUmVmLnJlcG9zaXRvcnkudXJsLCBnaXRodWJUb2tlbik7XG5cbiAgLy8gTm90ZTogU2luY2Ugd2UgdXNlIGEgZGV0YWNoZWQgaGVhZCBmb3IgcmViYXNpbmcgdGhlIFBSIGFuZCB0aGVyZWZvcmUgZG8gbm90IGhhdmVcbiAgLy8gcmVtb3RlLXRyYWNraW5nIGJyYW5jaGVzIGNvbmZpZ3VyZWQsIHdlIG5lZWQgdG8gc2V0IG91ciBleHBlY3RlZCByZWYgYW5kIFNIQS4gVGhpc1xuICAvLyBhbGxvd3MgdXMgdG8gdXNlIGAtLWZvcmNlLXdpdGgtbGVhc2VgIGZvciB0aGUgZGV0YWNoZWQgaGVhZCB3aGlsZSBlbnN1cmluZyB0aGF0IHdlXG4gIC8vIG5ldmVyIGFjY2lkZW50YWxseSBvdmVycmlkZSB1cHN0cmVhbSBjaGFuZ2VzIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCBpbiB0aGUgbWVhbndoaWxlLlxuICAvLyBTZWU6XG4gIC8vIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXQtcHVzaCNEb2N1bWVudGF0aW9uL2dpdC1wdXNoLnR4dC0tLWZvcmNlLXdpdGgtbGVhc2VsdHJlZm5hbWVndGx0ZXhwZWN0Z3RcbiAgY29uc3QgZm9yY2VXaXRoTGVhc2VGbGFnID0gYC0tZm9yY2Utd2l0aC1sZWFzZT0ke2hlYWRSZWZOYW1lfToke3ByLmhlYWRSZWZPaWR9YDtcblxuICAvLyBJZiB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnMgdG8gbW9kaWZ5IGl0LCBleGl0IGFzIHRoZSByZWJhc2VkIFBSIGNhbm5vdFxuICAvLyBiZSBwdXNoZWQgdXAuXG4gIGlmICghcHIubWFpbnRhaW5lckNhbk1vZGlmeSAmJiAhcHIudmlld2VyRGlkQXV0aG9yKSB7XG4gICAgZXJyb3IoXG4gICAgICBgQ2Fubm90IHJlYmFzZSBhcyB5b3UgZGlkIG5vdCBhdXRob3IgdGhlIFBSIGFuZCB0aGUgUFIgZG9lcyBub3QgYWxsb3cgbWFpbnRhaW5lcnNgICtcbiAgICAgICAgYHRvIG1vZGlmeSB0aGUgUFJgLFxuICAgICk7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIEZldGNoZXMgYXJlIGRvbmUgd2l0aCAtLWRlZXBlbj01MDAgaW5jcmVhc2UgdGhlIGxpa2VsaWhvb2Qgb2YgZmluZGluZyBhIGNvbW1vbiBhbmNlc3RvciB3aGVuXG4gICAgLy8gYSBzaGFsbG93IGNsb25lIGlzIGJlaW5nIHVzZWQuXG5cbiAgICAvLyBGZXRjaCB0aGUgYnJhbmNoIGF0IHRoZSBjb21taXQgb2YgdGhlIFBSLCBhbmQgY2hlY2sgaXQgb3V0IGluIGEgZGV0YWNoZWQgc3RhdGUuXG4gICAgaW5mbyhgQ2hlY2tpbmcgb3V0IFBSICMke3ByTnVtYmVyfSBmcm9tICR7ZnVsbEhlYWRSZWZ9YCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgaGVhZFJlZlVybCwgaGVhZFJlZk5hbWUsICctLWRlZXBlbj01MDAnXSk7XG4gICAgZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy0tZGV0YWNoJywgJ0ZFVENIX0hFQUQnXSk7XG4gICAgLy8gRmV0Y2ggdGhlIFBScyB0YXJnZXQgYnJhbmNoIGFuZCByZWJhc2Ugb250byBpdC5cbiAgICBpbmZvKGBGZXRjaGluZyAke2Z1bGxCYXNlUmVmfSB0byByZWJhc2UgIyR7cHJOdW1iZXJ9IG9uYCk7XG4gICAgZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgYmFzZVJlZlVybCwgYmFzZVJlZk5hbWUsICctLWRlZXBlbj01MDAnXSk7XG5cbiAgICBjb25zdCBjb21tb25BbmNlc3RvclNoYSA9IGdpdC5ydW4oWydtZXJnZS1iYXNlJywgJ0hFQUQnLCAnRkVUQ0hfSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuXG4gICAgY29uc3QgY29tbWl0cyA9IGF3YWl0IGdldENvbW1pdHNJblJhbmdlKGNvbW1vbkFuY2VzdG9yU2hhLCAnSEVBRCcpO1xuXG4gICAgbGV0IHNxdWFzaEZpeHVwcyA9XG4gICAgICBwcm9jZXNzLmVudlsnQ0knXSAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICBjb21taXRzLmZpbHRlcigoY29tbWl0OiBDb21taXQpID0+IGNvbW1pdC5pc0ZpeHVwKS5sZW5ndGggPT09IDBcbiAgICAgICAgPyBmYWxzZVxuICAgICAgICA6IGF3YWl0IHByb21wdENvbmZpcm0oXG4gICAgICAgICAgICBgUFIgIyR7cHJOdW1iZXJ9IGNvbnRhaW5zIGZpeHVwIGNvbW1pdHMsIHdvdWxkIHlvdSBsaWtlIHRvIHNxdWFzaCB0aGVtIGR1cmluZyByZWJhc2U/YCxcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgKTtcblxuICAgIGluZm8oYEF0dGVtcHRpbmcgdG8gcmViYXNlIFBSICMke3ByTnVtYmVyfSBvbiAke2Z1bGxCYXNlUmVmfWApO1xuXG4gICAgLyoqXG4gICAgICogVHVwbGUgb2YgZmxhZ3MgdG8gYmUgYWRkZWQgdG8gdGhlIHJlYmFzZSBjb21tYW5kIGFuZCBlbnYgb2JqZWN0IHRvIHJ1biB0aGUgZ2l0IGNvbW1hbmQuXG4gICAgICpcbiAgICAgKiBBZGRpdGlvbmFsIGZsYWdzIHRvIHBlcmZvcm0gdGhlIGF1dG9zcXVhc2hpbmcgYXJlIGFkZGVkIHdoZW4gdGhlIHVzZXIgY29uZmlybSBzcXVhc2hpbmcgb2ZcbiAgICAgKiBmaXh1cCBjb21taXRzIHNob3VsZCBvY2N1ci5cbiAgICAgKi9cbiAgICBjb25zdCBbZmxhZ3MsIGVudl0gPSBzcXVhc2hGaXh1cHNcbiAgICAgID8gW1snLS1pbnRlcmFjdGl2ZScsICctLWF1dG9zcXVhc2gnXSwgey4uLnByb2Nlc3MuZW52LCBHSVRfU0VRVUVOQ0VfRURJVE9SOiAndHJ1ZSd9XVxuICAgICAgOiBbW10sIHVuZGVmaW5lZF07XG4gICAgY29uc3QgcmViYXNlUmVzdWx0ID0gZ2l0LnJ1bkdyYWNlZnVsKFsncmViYXNlJywgLi4uZmxhZ3MsICdGRVRDSF9IRUFEJ10sIHtlbnY6IGVudn0pO1xuXG4gICAgLy8gSWYgdGhlIHJlYmFzZSB3YXMgY2xlYW4sIHB1c2ggdGhlIHJlYmFzZWQgUFIgdXAgdG8gdGhlIGF1dGhvcnMgZm9yay5cbiAgICBpZiAocmViYXNlUmVzdWx0LnN0YXR1cyA9PT0gMCkge1xuICAgICAgaW5mbyhgUmViYXNlIHdhcyBhYmxlIHRvIGNvbXBsZXRlIGF1dG9tYXRpY2FsbHkgd2l0aG91dCBjb25mbGljdHNgKTtcbiAgICAgIGluZm8oYFB1c2hpbmcgcmViYXNlZCBQUiAjJHtwck51bWJlcn0gdG8gJHtmdWxsSGVhZFJlZn1gKTtcbiAgICAgIGdpdC5ydW4oWydwdXNoJywgaGVhZFJlZlVybCwgYEhFQUQ6JHtoZWFkUmVmTmFtZX1gLCBmb3JjZVdpdGhMZWFzZUZsYWddKTtcbiAgICAgIGluZm8oYFJlYmFzZWQgYW5kIHVwZGF0ZWQgUFIgIyR7cHJOdW1iZXJ9YCk7XG4gICAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgZXJyb3IoZXJyKTtcbiAgICBnaXQuY2hlY2tvdXQocHJldmlvdXNCcmFuY2hPclJldmlzaW9uLCB0cnVlKTtcbiAgICByZXR1cm4gMTtcbiAgfVxuXG4gIC8vIE9uIGF1dG9tYXRpYyByZWJhc2UgZmFpbHVyZXMsIHByb21wdCB0byBjaG9vc2UgaWYgdGhlIHJlYmFzZSBzaG91bGQgYmUgY29udGludWVkXG4gIC8vIG1hbnVhbGx5IG9yIGFib3J0ZWQgbm93LlxuICBpbmZvKGBSZWJhc2Ugd2FzIHVuYWJsZSB0byBjb21wbGV0ZSBhdXRvbWF0aWNhbGx5IHdpdGhvdXQgY29uZmxpY3RzLmApO1xuICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICBjb25zdCBjb250aW51ZVJlYmFzZSA9XG4gICAgcHJvY2Vzcy5lbnZbJ0NJJ10gPT09IHVuZGVmaW5lZCAmJiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnTWFudWFsbHkgY29tcGxldGUgcmViYXNlPycpKTtcblxuICBpZiAoY29udGludWVSZWJhc2UpIHtcbiAgICBpbmZvKGBBZnRlciBtYW51YWxseSBjb21wbGV0aW5nIHJlYmFzZSwgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byB1cGRhdGUgUFIgIyR7cHJOdW1iZXJ9OmApO1xuICAgIGluZm8oYCAkIGdpdCBwdXNoICR7cHIuaGVhZFJlZi5yZXBvc2l0b3J5LnVybH0gSEVBRDoke2hlYWRSZWZOYW1lfSAke2ZvcmNlV2l0aExlYXNlRmxhZ31gKTtcbiAgICBpbmZvKCk7XG4gICAgaW5mbyhgVG8gYWJvcnQgdGhlIHJlYmFzZSBhbmQgcmV0dXJuIHRvIHRoZSBzdGF0ZSBvZiB0aGUgcmVwb3NpdG9yeSBiZWZvcmUgdGhpcyBjb21tYW5kYCk7XG4gICAgaW5mbyhgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICBpbmZvKGAgJCBnaXQgcmViYXNlIC0tYWJvcnQgJiYgZ2l0IHJlc2V0IC0taGFyZCAmJiBnaXQgY2hlY2tvdXQgJHtwcmV2aW91c0JyYW5jaE9yUmV2aXNpb259YCk7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhgQ2xlYW5pbmcgdXAgZ2l0IHN0YXRlLCBhbmQgcmVzdG9yaW5nIHByZXZpb3VzIHN0YXRlLmApO1xuICB9XG5cbiAgZ2l0LmNoZWNrb3V0KHByZXZpb3VzQnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gIHJldHVybiAxO1xufVxuIl19