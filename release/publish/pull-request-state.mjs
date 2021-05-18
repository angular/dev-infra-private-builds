/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
/** Thirty seconds in milliseconds. */
const THIRTY_SECONDS_IN_MS = 30000;
/** Gets whether a given pull request has been merged. */
export function getPullRequestState(api, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield api.github.pulls.get(Object.assign(Object.assign({}, api.remoteParams), { pull_number: id }));
        if (data.merged) {
            return 'merged';
        }
        // Check if the PR was closed more than 30 seconds ago, this extra time gives Github time to
        // update the closed pull request to be associated with the closing commit.
        // Note: a Date constructed with `null` creates an object at 0 time, which will never be greater
        // than the current date time.
        if (data.closed_at !== null &&
            (new Date(data.closed_at).getTime() < Date.now() - THIRTY_SECONDS_IN_MS)) {
            return (yield isPullRequestClosedWithAssociatedCommit(api, id)) ? 'merged' : 'closed';
        }
        return 'open';
    });
}
/**
 * Whether the pull request has been closed with an associated commit. This is usually
 * the case if a PR has been merged using the autosquash merge script strategy. Since
 * the merge is not fast-forward, Github does not consider the PR as merged and instead
 * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
 */
function isPullRequestClosedWithAssociatedCommit(api, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const request = api.github.issues.listEvents.endpoint.merge(Object.assign(Object.assign({}, api.remoteParams), { issue_number: id }));
        const events = yield api.github.paginate(request);
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
            if (event === 'referenced' && commit_id &&
                (yield isCommitClosingPullRequest(api, commit_id, id))) {
                return true;
            }
        }
        return false;
    });
}
/** Checks whether the specified commit is closing the given pull request. */
function isCommitClosingPullRequest(api, sha, id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data } = yield api.github.repos.getCommit(Object.assign(Object.assign({}, api.remoteParams), { ref: sha }));
        // Matches the closing keyword supported in commit messages. See:
        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
        return data.commit.message.match(new RegExp(`(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #${id}(?!\\d)`, 'i'));
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUtILHNDQUFzQztBQUN0QyxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztBQUtuQyx5REFBeUQ7QUFDekQsTUFBTSxVQUFnQixtQkFBbUIsQ0FDckMsR0FBdUIsRUFBRSxFQUFVOztRQUNyQyxNQUFNLEVBQUMsSUFBSSxFQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLGlDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsV0FBVyxFQUFFLEVBQUUsSUFBRSxDQUFDO1FBQ2xGLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNmLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO1FBQ0QsNEZBQTRGO1FBQzVGLDJFQUEyRTtRQUMzRSxnR0FBZ0c7UUFDaEcsOEJBQThCO1FBQzlCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJO1lBQ3ZCLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxvQkFBb0IsQ0FBQyxFQUFFO1lBQzVFLE9BQU8sQ0FBQSxNQUFNLHVDQUF1QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7U0FDckY7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0NBQUE7QUFFRDs7Ozs7R0FLRztBQUNILFNBQWUsdUNBQXVDLENBQUMsR0FBdUIsRUFBRSxFQUFVOztRQUN4RixNQUFNLE9BQU8sR0FDVCxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssaUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxZQUFZLEVBQUUsRUFBRSxJQUFFLENBQUM7UUFDekYsTUFBTSxNQUFNLEdBQXFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEYsc0ZBQXNGO1FBQ3RGLHNGQUFzRjtRQUN0RixvRkFBb0Y7UUFDcEYsNEZBQTRGO1FBQzVGLEtBQUssSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxxRkFBcUY7WUFDckYsc0ZBQXNGO1lBQ3RGLElBQUksS0FBSyxLQUFLLFVBQVUsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELDhFQUE4RTtZQUM5RSxvQ0FBb0M7WUFDcEMsSUFBSSxLQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELGtGQUFrRjtZQUNsRixxRkFBcUY7WUFDckYsdUZBQXVGO1lBQ3ZGLDRFQUE0RTtZQUM1RSx5SUFBeUk7WUFDekksSUFBSSxLQUFLLEtBQUssWUFBWSxJQUFJLFNBQVM7aUJBQ25DLE1BQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQSxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FBQTtBQUVELDZFQUE2RTtBQUM3RSxTQUFlLDBCQUEwQixDQUFDLEdBQXVCLEVBQUUsR0FBVyxFQUFFLEVBQVU7O1FBQ3hGLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsaUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxHQUFHLEVBQUUsR0FBRyxJQUFFLENBQUM7UUFDakYsaUVBQWlFO1FBQ2pFLHFIQUFxSDtRQUNySCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDNUIsSUFBSSxNQUFNLENBQUMsZ0RBQWdELEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcblxuLyoqIFRoaXJ0eSBzZWNvbmRzIGluIG1pbGxpc2Vjb25kcy4gKi9cbmNvbnN0IFRISVJUWV9TRUNPTkRTX0lOX01TID0gMzAwMDA7XG5cbi8qKiBTdGF0ZSBvZiBhIHB1bGwgcmVxdWVzdCBpbiBHaXRodWIuICovXG5leHBvcnQgdHlwZSBQdWxsUmVxdWVzdFN0YXRlID0gJ21lcmdlZCd8J2Nsb3NlZCd8J29wZW4nO1xuXG4vKiogR2V0cyB3aGV0aGVyIGEgZ2l2ZW4gcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRQdWxsUmVxdWVzdFN0YXRlKFxuICAgIGFwaTogR2l0Q2xpZW50PGJvb2xlYW4+LCBpZDogbnVtYmVyKTogUHJvbWlzZTxQdWxsUmVxdWVzdFN0YXRlPiB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IGFwaS5naXRodWIucHVsbHMuZ2V0KHsuLi5hcGkucmVtb3RlUGFyYW1zLCBwdWxsX251bWJlcjogaWR9KTtcbiAgaWYgKGRhdGEubWVyZ2VkKSB7XG4gICAgcmV0dXJuICdtZXJnZWQnO1xuICB9XG4gIC8vIENoZWNrIGlmIHRoZSBQUiB3YXMgY2xvc2VkIG1vcmUgdGhhbiAzMCBzZWNvbmRzIGFnbywgdGhpcyBleHRyYSB0aW1lIGdpdmVzIEdpdGh1YiB0aW1lIHRvXG4gIC8vIHVwZGF0ZSB0aGUgY2xvc2VkIHB1bGwgcmVxdWVzdCB0byBiZSBhc3NvY2lhdGVkIHdpdGggdGhlIGNsb3NpbmcgY29tbWl0LlxuICAvLyBOb3RlOiBhIERhdGUgY29uc3RydWN0ZWQgd2l0aCBgbnVsbGAgY3JlYXRlcyBhbiBvYmplY3QgYXQgMCB0aW1lLCB3aGljaCB3aWxsIG5ldmVyIGJlIGdyZWF0ZXJcbiAgLy8gdGhhbiB0aGUgY3VycmVudCBkYXRlIHRpbWUuXG4gIGlmIChkYXRhLmNsb3NlZF9hdCAhPT0gbnVsbCAmJlxuICAgICAgKG5ldyBEYXRlKGRhdGEuY2xvc2VkX2F0KS5nZXRUaW1lKCkgPCBEYXRlLm5vdygpIC0gVEhJUlRZX1NFQ09ORFNfSU5fTVMpKSB7XG4gICAgcmV0dXJuIGF3YWl0IGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGksIGlkKSA/ICdtZXJnZWQnIDogJ2Nsb3NlZCc7XG4gIH1cbiAgcmV0dXJuICdvcGVuJztcbn1cblxuLyoqXG4gKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY2xvc2VkIHdpdGggYW4gYXNzb2NpYXRlZCBjb21taXQuIFRoaXMgaXMgdXN1YWxseVxuICogdGhlIGNhc2UgaWYgYSBQUiBoYXMgYmVlbiBtZXJnZWQgdXNpbmcgdGhlIGF1dG9zcXVhc2ggbWVyZ2Ugc2NyaXB0IHN0cmF0ZWd5LiBTaW5jZVxuICogdGhlIG1lcmdlIGlzIG5vdCBmYXN0LWZvcndhcmQsIEdpdGh1YiBkb2VzIG5vdCBjb25zaWRlciB0aGUgUFIgYXMgbWVyZ2VkIGFuZCBpbnN0ZWFkXG4gKiBzaG93cyB0aGUgUFIgYXMgY2xvc2VkLiBTZWUgZm9yIGV4YW1wbGU6IGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvcHVsbC8zNzkxOC5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdENsb3NlZFdpdGhBc3NvY2lhdGVkQ29tbWl0KGFwaTogR2l0Q2xpZW50PGJvb2xlYW4+LCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHJlcXVlc3QgPVxuICAgICAgYXBpLmdpdGh1Yi5pc3N1ZXMubGlzdEV2ZW50cy5lbmRwb2ludC5tZXJnZSh7Li4uYXBpLnJlbW90ZVBhcmFtcywgaXNzdWVfbnVtYmVyOiBpZH0pO1xuICBjb25zdCBldmVudHM6IE9jdG9raXQuSXNzdWVzTGlzdEV2ZW50c1Jlc3BvbnNlID0gYXdhaXQgYXBpLmdpdGh1Yi5wYWdpbmF0ZShyZXF1ZXN0KTtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBldmVudHMgb2YgdGhlIHB1bGwgcmVxdWVzdCBpbiByZXZlcnNlLiBXZSB3YW50IHRvIGZpbmQgdGhlIG1vc3RcbiAgLy8gcmVjZW50IGV2ZW50cyBhbmQgY2hlY2sgaWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB3aXRoIGEgY29tbWl0IGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB0aHJvdWdoIGEgY29tbWl0LCB3ZSBhc3N1bWUgdGhhdCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkXG4gIC8vIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHN0cmF0ZWd5LiBGb3IgbW9yZSBkZXRhaWxzLiBTZWUgdGhlIGBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneWAuXG4gIGZvciAobGV0IGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCB7ZXZlbnQsIGNvbW1pdF9pZH0gPSBldmVudHNbaV07XG4gICAgLy8gSWYgd2UgY29tZSBhY3Jvc3MgYSBcInJlb3BlbmVkXCIgZXZlbnQsIHdlIGFib3J0IGxvb2tpbmcgZm9yIHJlZmVyZW5jZWQgY29tbWl0cy4gQW55XG4gICAgLy8gY29tbWl0cyB0aGF0IGNsb3NlZCB0aGUgUFIgYmVmb3JlLCBhcmUgbm8gbG9uZ2VyIHJlbGV2YW50IGFuZCBkaWQgbm90IGNsb3NlIHRoZSBQUi5cbiAgICBpZiAoZXZlbnQgPT09ICdyZW9wZW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgYSBgY2xvc2VkYCBldmVudCBpcyBjYXB0dXJlZCB3aXRoIGEgY29tbWl0IGFzc2lnbmVkLCB0aGVuIHdlIGFzc3VtZSB0aGF0XG4gICAgLy8gdGhpcyBQUiBoYXMgYmVlbiBtZXJnZWQgcHJvcGVybHkuXG4gICAgaWYgKGV2ZW50ID09PSAnY2xvc2VkJyAmJiBjb21taXRfaWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgUFIgaGFzIGJlZW4gcmVmZXJlbmNlZCBieSBhIGNvbW1pdCwgY2hlY2sgaWYgdGhlIGNvbW1pdCBjbG9zZXMgdGhpcyBwdWxsXG4gICAgLy8gcmVxdWVzdC4gTm90ZSB0aGF0IHRoaXMgaXMgbmVlZGVkIGJlc2lkZXMgY2hlY2tpbmcgYGNsb3NlZGAgYXMgUFJzIGNvdWxkIGJlIG1lcmdlZFxuICAgIC8vIGludG8gYW55IG5vbi1kZWZhdWx0IGJyYW5jaCB3aGVyZSB0aGUgYENsb3NlcyA8Li4+YCBrZXl3b3JkIGRvZXMgbm90IHdvcmsgYW5kIHRoZSBQUlxuICAgIC8vIGlzIHNpbXBseSBjbG9zZWQgd2l0aG91dCBhbiBhc3NvY2lhdGVkIGBjb21taXRfaWRgLiBGb3IgbW9yZSBkZXRhaWxzIHNlZTpcbiAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3JkcyM6fjp0ZXh0PW5vbi1kZWZhdWx0LlxuICAgIGlmIChldmVudCA9PT0gJ3JlZmVyZW5jZWQnICYmIGNvbW1pdF9pZCAmJlxuICAgICAgICBhd2FpdCBpc0NvbW1pdENsb3NpbmdQdWxsUmVxdWVzdChhcGksIGNvbW1pdF9pZCwgaWQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBjb21taXQgaXMgY2xvc2luZyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpOiBHaXRDbGllbnQ8Ym9vbGVhbj4sIHNoYTogc3RyaW5nLCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IGFwaS5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi5hcGkucmVtb3RlUGFyYW1zLCByZWY6IHNoYX0pO1xuICAvLyBNYXRjaGVzIHRoZSBjbG9zaW5nIGtleXdvcmQgc3VwcG9ydGVkIGluIGNvbW1pdCBtZXNzYWdlcy4gU2VlOlxuICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3Jkcy5cbiAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2UubWF0Y2goXG4gICAgICBuZXcgUmVnRXhwKGAoPzpjbG9zZVtzZF0/fGZpeCg/OmVbc2RdPyl8cmVzb2x2ZVtzZF0/KTo/ICMke2lkfSg/IVxcXFxkKWAsICdpJykpO1xufVxuIl19