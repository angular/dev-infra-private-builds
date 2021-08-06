"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestState = void 0;
/** Thirty seconds in milliseconds. */
const THIRTY_SECONDS_IN_MS = 30000;
/** Gets whether a given pull request has been merged. */
async function getPullRequestState(api, id) {
    const { data } = await api.github.pulls.get({ ...api.remoteParams, pull_number: id });
    if (data.merged) {
        return 'merged';
    }
    // Check if the PR was closed more than 30 seconds ago, this extra time gives Github time to
    // update the closed pull request to be associated with the closing commit.
    // Note: a Date constructed with `null` creates an object at 0 time, which will never be greater
    // than the current date time.
    if (data.closed_at !== null &&
        new Date(data.closed_at).getTime() < Date.now() - THIRTY_SECONDS_IN_MS) {
        return (await isPullRequestClosedWithAssociatedCommit(api, id)) ? 'merged' : 'closed';
    }
    return 'open';
}
exports.getPullRequestState = getPullRequestState;
/**
 * Whether the pull request has been closed with an associated commit. This is usually
 * the case if a PR has been merged using the autosquash merge script strategy. Since
 * the merge is not fast-forward, Github does not consider the PR as merged and instead
 * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
 */
async function isPullRequestClosedWithAssociatedCommit(api, id) {
    const events = await api.github.paginate(api.github.issues.listEvents, {
        ...api.remoteParams,
        issue_number: id,
    });
    // Iterate through the events of the pull request in reverse. We want to find the most
    // recent events and check if the PR has been closed with a commit associated with it.
    // If the PR has been closed through a commit, we assume that the PR has been merged
    // using the autosquash merge strategy. For more details. See the `AutosquashMergeStrategy`.
    for (let i = events.length - 1; i >= 0; i--) {
        const { event, commit_id } = events[i];
        // If we come across a "reopened" event, we abort looking for referenced commits. Any
        // commits that closed the PR before, are no longer relevant and did not close the PR.
        if (event === 'reopened') {
            return false;
        }
        // If a `closed` event is captured with a commit assigned, then we assume that
        // this PR has been merged properly.
        if (event === 'closed' && commit_id) {
            return true;
        }
        // If the PR has been referenced by a commit, check if the commit closes this pull
        // request. Note that this is needed besides checking `closed` as PRs could be merged
        // into any non-default branch where the `Closes <..>` keyword does not work and the PR
        // is simply closed without an associated `commit_id`. For more details see:
        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#:~:text=non-default.
        if (event === 'referenced' &&
            commit_id &&
            (await isCommitClosingPullRequest(api, commit_id, id))) {
            return true;
        }
    }
    return false;
}
/** Checks whether the specified commit is closing the given pull request. */
async function isCommitClosingPullRequest(api, sha, id) {
    const { data } = await api.github.repos.getCommit({ ...api.remoteParams, ref: sha });
    // Matches the closing keyword supported in commit messages. See:
    // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
    return data.commit.message.match(new RegExp(`(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #${id}(?!\\d)`, 'i'));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsc0NBQXNDO0FBQ3RDLE1BQU0sb0JBQW9CLEdBQUcsS0FBSyxDQUFDO0FBS25DLHlEQUF5RDtBQUNsRCxLQUFLLFVBQVUsbUJBQW1CLENBQUMsR0FBYyxFQUFFLEVBQVU7SUFDbEUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxHQUFHLENBQUMsWUFBWSxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO0lBQ2xGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNmLE9BQU8sUUFBUSxDQUFDO0tBQ2pCO0lBQ0QsNEZBQTRGO0lBQzVGLDJFQUEyRTtJQUMzRSxnR0FBZ0c7SUFDaEcsOEJBQThCO0lBQzlCLElBQ0UsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJO1FBQ3ZCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsb0JBQW9CLEVBQ3RFO1FBQ0EsT0FBTyxDQUFDLE1BQU0sdUNBQXVDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0tBQ3ZGO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQWhCRCxrREFnQkM7QUFFRDs7Ozs7R0FLRztBQUNILEtBQUssVUFBVSx1Q0FBdUMsQ0FBQyxHQUFjLEVBQUUsRUFBVTtJQUMvRSxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRTtRQUNyRSxHQUFHLEdBQUcsQ0FBQyxZQUFZO1FBQ25CLFlBQVksRUFBRSxFQUFFO0tBQ2pCLENBQUMsQ0FBQztJQUNILHNGQUFzRjtJQUN0RixzRkFBc0Y7SUFDdEYsb0ZBQW9GO0lBQ3BGLDRGQUE0RjtJQUM1RixLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDM0MsTUFBTSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMscUZBQXFGO1FBQ3JGLHNGQUFzRjtRQUN0RixJQUFJLEtBQUssS0FBSyxVQUFVLEVBQUU7WUFDeEIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELDhFQUE4RTtRQUM5RSxvQ0FBb0M7UUFDcEMsSUFBSSxLQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsRUFBRTtZQUNuQyxPQUFPLElBQUksQ0FBQztTQUNiO1FBQ0Qsa0ZBQWtGO1FBQ2xGLHFGQUFxRjtRQUNyRix1RkFBdUY7UUFDdkYsNEVBQTRFO1FBQzVFLHlJQUF5STtRQUN6SSxJQUNFLEtBQUssS0FBSyxZQUFZO1lBQ3RCLFNBQVM7WUFDVCxDQUFDLE1BQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUN0RDtZQUNBLE9BQU8sSUFBSSxDQUFDO1NBQ2I7S0FDRjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVELDZFQUE2RTtBQUM3RSxLQUFLLFVBQVUsMEJBQTBCLENBQUMsR0FBYyxFQUFFLEdBQVcsRUFBRSxFQUFVO0lBQy9FLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxFQUFDLEdBQUcsR0FBRyxDQUFDLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztJQUNqRixpRUFBaUU7SUFDakUscUhBQXFIO0lBQ3JILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUM5QixJQUFJLE1BQU0sQ0FBQyxnREFBZ0QsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQzdFLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbi8qKiBUaGlydHkgc2Vjb25kcyBpbiBtaWxsaXNlY29uZHMuICovXG5jb25zdCBUSElSVFlfU0VDT05EU19JTl9NUyA9IDMwMDAwO1xuXG4vKiogU3RhdGUgb2YgYSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RTdGF0ZSA9ICdtZXJnZWQnIHwgJ2Nsb3NlZCcgfCAnb3Blbic7XG5cbi8qKiBHZXRzIHdoZXRoZXIgYSBnaXZlbiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1bGxSZXF1ZXN0U3RhdGUoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpOiBQcm9taXNlPFB1bGxSZXF1ZXN0U3RhdGU+IHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5wdWxscy5nZXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBpZH0pO1xuICBpZiAoZGF0YS5tZXJnZWQpIHtcbiAgICByZXR1cm4gJ21lcmdlZCc7XG4gIH1cbiAgLy8gQ2hlY2sgaWYgdGhlIFBSIHdhcyBjbG9zZWQgbW9yZSB0aGFuIDMwIHNlY29uZHMgYWdvLCB0aGlzIGV4dHJhIHRpbWUgZ2l2ZXMgR2l0aHViIHRpbWUgdG9cbiAgLy8gdXBkYXRlIHRoZSBjbG9zZWQgcHVsbCByZXF1ZXN0IHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2xvc2luZyBjb21taXQuXG4gIC8vIE5vdGU6IGEgRGF0ZSBjb25zdHJ1Y3RlZCB3aXRoIGBudWxsYCBjcmVhdGVzIGFuIG9iamVjdCBhdCAwIHRpbWUsIHdoaWNoIHdpbGwgbmV2ZXIgYmUgZ3JlYXRlclxuICAvLyB0aGFuIHRoZSBjdXJyZW50IGRhdGUgdGltZS5cbiAgaWYgKFxuICAgIGRhdGEuY2xvc2VkX2F0ICE9PSBudWxsICYmXG4gICAgbmV3IERhdGUoZGF0YS5jbG9zZWRfYXQpLmdldFRpbWUoKSA8IERhdGUubm93KCkgLSBUSElSVFlfU0VDT05EU19JTl9NU1xuICApIHtcbiAgICByZXR1cm4gKGF3YWl0IGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGksIGlkKSkgPyAnbWVyZ2VkJyA6ICdjbG9zZWQnO1xuICB9XG4gIHJldHVybiAnb3Blbic7XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNsb3NlZCB3aXRoIGFuIGFzc29jaWF0ZWQgY29tbWl0LiBUaGlzIGlzIHVzdWFsbHlcbiAqIHRoZSBjYXNlIGlmIGEgUFIgaGFzIGJlZW4gbWVyZ2VkIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHNjcmlwdCBzdHJhdGVneS4gU2luY2VcbiAqIHRoZSBtZXJnZSBpcyBub3QgZmFzdC1mb3J3YXJkLCBHaXRodWIgZG9lcyBub3QgY29uc2lkZXIgdGhlIFBSIGFzIG1lcmdlZCBhbmQgaW5zdGVhZFxuICogc2hvd3MgdGhlIFBSIGFzIGNsb3NlZC4gU2VlIGZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzc5MTguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcikge1xuICBjb25zdCBldmVudHMgPSBhd2FpdCBhcGkuZ2l0aHViLnBhZ2luYXRlKGFwaS5naXRodWIuaXNzdWVzLmxpc3RFdmVudHMsIHtcbiAgICAuLi5hcGkucmVtb3RlUGFyYW1zLFxuICAgIGlzc3VlX251bWJlcjogaWQsXG4gIH0pO1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGV2ZW50cyBvZiB0aGUgcHVsbCByZXF1ZXN0IGluIHJldmVyc2UuIFdlIHdhbnQgdG8gZmluZCB0aGUgbW9zdFxuICAvLyByZWNlbnQgZXZlbnRzIGFuZCBjaGVjayBpZiB0aGUgUFIgaGFzIGJlZW4gY2xvc2VkIHdpdGggYSBjb21taXQgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAvLyBJZiB0aGUgUFIgaGFzIGJlZW4gY2xvc2VkIHRocm91Z2ggYSBjb21taXQsIHdlIGFzc3VtZSB0aGF0IHRoZSBQUiBoYXMgYmVlbiBtZXJnZWRcbiAgLy8gdXNpbmcgdGhlIGF1dG9zcXVhc2ggbWVyZ2Ugc3RyYXRlZ3kuIEZvciBtb3JlIGRldGFpbHMuIFNlZSB0aGUgYEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5YC5cbiAgZm9yIChsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IHtldmVudCwgY29tbWl0X2lkfSA9IGV2ZW50c1tpXTtcbiAgICAvLyBJZiB3ZSBjb21lIGFjcm9zcyBhIFwicmVvcGVuZWRcIiBldmVudCwgd2UgYWJvcnQgbG9va2luZyBmb3IgcmVmZXJlbmNlZCBjb21taXRzLiBBbnlcbiAgICAvLyBjb21taXRzIHRoYXQgY2xvc2VkIHRoZSBQUiBiZWZvcmUsIGFyZSBubyBsb25nZXIgcmVsZXZhbnQgYW5kIGRpZCBub3QgY2xvc2UgdGhlIFBSLlxuICAgIGlmIChldmVudCA9PT0gJ3Jlb3BlbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBJZiBhIGBjbG9zZWRgIGV2ZW50IGlzIGNhcHR1cmVkIHdpdGggYSBjb21taXQgYXNzaWduZWQsIHRoZW4gd2UgYXNzdW1lIHRoYXRcbiAgICAvLyB0aGlzIFBSIGhhcyBiZWVuIG1lcmdlZCBwcm9wZXJseS5cbiAgICBpZiAoZXZlbnQgPT09ICdjbG9zZWQnICYmIGNvbW1pdF9pZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIElmIHRoZSBQUiBoYXMgYmVlbiByZWZlcmVuY2VkIGJ5IGEgY29tbWl0LCBjaGVjayBpZiB0aGUgY29tbWl0IGNsb3NlcyB0aGlzIHB1bGxcbiAgICAvLyByZXF1ZXN0LiBOb3RlIHRoYXQgdGhpcyBpcyBuZWVkZWQgYmVzaWRlcyBjaGVja2luZyBgY2xvc2VkYCBhcyBQUnMgY291bGQgYmUgbWVyZ2VkXG4gICAgLy8gaW50byBhbnkgbm9uLWRlZmF1bHQgYnJhbmNoIHdoZXJlIHRoZSBgQ2xvc2VzIDwuLj5gIGtleXdvcmQgZG9lcyBub3Qgd29yayBhbmQgdGhlIFBSXG4gICAgLy8gaXMgc2ltcGx5IGNsb3NlZCB3aXRob3V0IGFuIGFzc29jaWF0ZWQgYGNvbW1pdF9pZGAuIEZvciBtb3JlIGRldGFpbHMgc2VlOlxuICAgIC8vIGh0dHBzOi8vZG9jcy5naXRodWIuY29tL2VuL2VudGVycHJpc2UvMi4xNi91c2VyL2dpdGh1Yi9tYW5hZ2luZy15b3VyLXdvcmstb24tZ2l0aHViL2Nsb3NpbmctaXNzdWVzLXVzaW5nLWtleXdvcmRzIzp+OnRleHQ9bm9uLWRlZmF1bHQuXG4gICAgaWYgKFxuICAgICAgZXZlbnQgPT09ICdyZWZlcmVuY2VkJyAmJlxuICAgICAgY29tbWl0X2lkICYmXG4gICAgICAoYXdhaXQgaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpLCBjb21taXRfaWQsIGlkKSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBpcyBjbG9zaW5nIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG5hc3luYyBmdW5jdGlvbiBpc0NvbW1pdENsb3NpbmdQdWxsUmVxdWVzdChhcGk6IEdpdENsaWVudCwgc2hhOiBzdHJpbmcsIGlkOiBudW1iZXIpIHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHJlZjogc2hhfSk7XG4gIC8vIE1hdGNoZXMgdGhlIGNsb3Npbmcga2V5d29yZCBzdXBwb3J0ZWQgaW4gY29tbWl0IG1lc3NhZ2VzLiBTZWU6XG4gIC8vIGh0dHBzOi8vZG9jcy5naXRodWIuY29tL2VuL2VudGVycHJpc2UvMi4xNi91c2VyL2dpdGh1Yi9tYW5hZ2luZy15b3VyLXdvcmstb24tZ2l0aHViL2Nsb3NpbmctaXNzdWVzLXVzaW5nLWtleXdvcmRzLlxuICByZXR1cm4gZGF0YS5jb21taXQubWVzc2FnZS5tYXRjaChcbiAgICBuZXcgUmVnRXhwKGAoPzpjbG9zZVtzZF0/fGZpeCg/OmVbc2RdPyl8cmVzb2x2ZVtzZF0/KTo/ICMke2lkfSg/IVxcXFxkKWAsICdpJyksXG4gICk7XG59XG4iXX0=