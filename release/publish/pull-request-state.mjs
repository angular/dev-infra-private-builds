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
        const events = yield api.github.paginate(api.github.issues.listEvents, Object.assign(Object.assign({}, api.remoteParams), { issue_number: id }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUlILHNDQUFzQztBQUN0QyxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztBQUtuQyx5REFBeUQ7QUFDekQsTUFBTSxVQUFnQixtQkFBbUIsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7UUFDbEUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxpQ0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLFdBQVcsRUFBRSxFQUFFLElBQUUsQ0FBQztRQUNsRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPLFFBQVEsQ0FBQztTQUNqQjtRQUNELDRGQUE0RjtRQUM1RiwyRUFBMkU7UUFDM0UsZ0dBQWdHO1FBQ2hHLDhCQUE4QjtRQUM5QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSTtZQUN2QixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsRUFBRTtZQUM1RSxPQUFPLENBQUEsTUFBTSx1Q0FBdUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JGO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQUFBO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFlLHVDQUF1QyxDQUFDLEdBQWMsRUFBRSxFQUFVOztRQUMvRSxNQUFNLE1BQU0sR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUNwQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLGtDQUFNLEdBQUcsQ0FBQyxZQUFZLEtBQUUsWUFBWSxFQUFFLEVBQUUsSUFBRSxDQUFDO1FBQzNFLHNGQUFzRjtRQUN0RixzRkFBc0Y7UUFDdEYsb0ZBQW9GO1FBQ3BGLDRGQUE0RjtRQUM1RixLQUFLLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0MsTUFBTSxFQUFDLEtBQUssRUFBRSxTQUFTLEVBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMscUZBQXFGO1lBQ3JGLHNGQUFzRjtZQUN0RixJQUFJLEtBQUssS0FBSyxVQUFVLEVBQUU7Z0JBQ3hCLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7WUFDRCw4RUFBOEU7WUFDOUUsb0NBQW9DO1lBQ3BDLElBQUksS0FBSyxLQUFLLFFBQVEsSUFBSSxTQUFTLEVBQUU7Z0JBQ25DLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFDRCxrRkFBa0Y7WUFDbEYscUZBQXFGO1lBQ3JGLHVGQUF1RjtZQUN2Riw0RUFBNEU7WUFDNUUseUlBQXlJO1lBQ3pJLElBQUksS0FBSyxLQUFLLFlBQVksSUFBSSxTQUFTO2lCQUNuQyxNQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLENBQUEsRUFBRTtnQkFDeEQsT0FBTyxJQUFJLENBQUM7YUFDYjtTQUNGO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBQUE7QUFFRCw2RUFBNkU7QUFDN0UsU0FBZSwwQkFBMEIsQ0FBQyxHQUFjLEVBQUUsR0FBVyxFQUFFLEVBQVU7O1FBQy9FLE1BQU0sRUFBQyxJQUFJLEVBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsaUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxHQUFHLEVBQUUsR0FBRyxJQUFFLENBQUM7UUFDakYsaUVBQWlFO1FBQ2pFLHFIQUFxSDtRQUNySCxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FDNUIsSUFBSSxNQUFNLENBQUMsZ0RBQWdELEVBQUUsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEYsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbi8qKiBUaGlydHkgc2Vjb25kcyBpbiBtaWxsaXNlY29uZHMuICovXG5jb25zdCBUSElSVFlfU0VDT05EU19JTl9NUyA9IDMwMDAwO1xuXG4vKiogU3RhdGUgb2YgYSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RTdGF0ZSA9ICdtZXJnZWQnfCdjbG9zZWQnfCdvcGVuJztcblxuLyoqIEdldHMgd2hldGhlciBhIGdpdmVuIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVsbFJlcXVlc3RTdGF0ZShhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcik6IFByb21pc2U8UHVsbFJlcXVlc3RTdGF0ZT4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnB1bGxzLmdldCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IGlkfSk7XG4gIGlmIChkYXRhLm1lcmdlZCkge1xuICAgIHJldHVybiAnbWVyZ2VkJztcbiAgfVxuICAvLyBDaGVjayBpZiB0aGUgUFIgd2FzIGNsb3NlZCBtb3JlIHRoYW4gMzAgc2Vjb25kcyBhZ28sIHRoaXMgZXh0cmEgdGltZSBnaXZlcyBHaXRodWIgdGltZSB0b1xuICAvLyB1cGRhdGUgdGhlIGNsb3NlZCBwdWxsIHJlcXVlc3QgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjbG9zaW5nIGNvbW1pdC5cbiAgLy8gTm90ZTogYSBEYXRlIGNvbnN0cnVjdGVkIHdpdGggYG51bGxgIGNyZWF0ZXMgYW4gb2JqZWN0IGF0IDAgdGltZSwgd2hpY2ggd2lsbCBuZXZlciBiZSBncmVhdGVyXG4gIC8vIHRoYW4gdGhlIGN1cnJlbnQgZGF0ZSB0aW1lLlxuICBpZiAoZGF0YS5jbG9zZWRfYXQgIT09IG51bGwgJiZcbiAgICAgIChuZXcgRGF0ZShkYXRhLmNsb3NlZF9hdCkuZ2V0VGltZSgpIDwgRGF0ZS5ub3coKSAtIFRISVJUWV9TRUNPTkRTX0lOX01TKSkge1xuICAgIHJldHVybiBhd2FpdCBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpLCBpZCkgPyAnbWVyZ2VkJyA6ICdjbG9zZWQnO1xuICB9XG4gIHJldHVybiAnb3Blbic7XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNsb3NlZCB3aXRoIGFuIGFzc29jaWF0ZWQgY29tbWl0LiBUaGlzIGlzIHVzdWFsbHlcbiAqIHRoZSBjYXNlIGlmIGEgUFIgaGFzIGJlZW4gbWVyZ2VkIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHNjcmlwdCBzdHJhdGVneS4gU2luY2VcbiAqIHRoZSBtZXJnZSBpcyBub3QgZmFzdC1mb3J3YXJkLCBHaXRodWIgZG9lcyBub3QgY29uc2lkZXIgdGhlIFBSIGFzIG1lcmdlZCBhbmQgaW5zdGVhZFxuICogc2hvd3MgdGhlIFBSIGFzIGNsb3NlZC4gU2VlIGZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzc5MTguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcikge1xuICBjb25zdCBldmVudHMgPSBhd2FpdCBhcGkuZ2l0aHViLnBhZ2luYXRlKFxuICAgICAgYXBpLmdpdGh1Yi5pc3N1ZXMubGlzdEV2ZW50cywgey4uLmFwaS5yZW1vdGVQYXJhbXMsIGlzc3VlX251bWJlcjogaWR9KTtcbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBldmVudHMgb2YgdGhlIHB1bGwgcmVxdWVzdCBpbiByZXZlcnNlLiBXZSB3YW50IHRvIGZpbmQgdGhlIG1vc3RcbiAgLy8gcmVjZW50IGV2ZW50cyBhbmQgY2hlY2sgaWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB3aXRoIGEgY29tbWl0IGFzc29jaWF0ZWQgd2l0aCBpdC5cbiAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIGNsb3NlZCB0aHJvdWdoIGEgY29tbWl0LCB3ZSBhc3N1bWUgdGhhdCB0aGUgUFIgaGFzIGJlZW4gbWVyZ2VkXG4gIC8vIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHN0cmF0ZWd5LiBGb3IgbW9yZSBkZXRhaWxzLiBTZWUgdGhlIGBBdXRvc3F1YXNoTWVyZ2VTdHJhdGVneWAuXG4gIGZvciAobGV0IGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBjb25zdCB7ZXZlbnQsIGNvbW1pdF9pZH0gPSBldmVudHNbaV07XG4gICAgLy8gSWYgd2UgY29tZSBhY3Jvc3MgYSBcInJlb3BlbmVkXCIgZXZlbnQsIHdlIGFib3J0IGxvb2tpbmcgZm9yIHJlZmVyZW5jZWQgY29tbWl0cy4gQW55XG4gICAgLy8gY29tbWl0cyB0aGF0IGNsb3NlZCB0aGUgUFIgYmVmb3JlLCBhcmUgbm8gbG9uZ2VyIHJlbGV2YW50IGFuZCBkaWQgbm90IGNsb3NlIHRoZSBQUi5cbiAgICBpZiAoZXZlbnQgPT09ICdyZW9wZW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy8gSWYgYSBgY2xvc2VkYCBldmVudCBpcyBjYXB0dXJlZCB3aXRoIGEgY29tbWl0IGFzc2lnbmVkLCB0aGVuIHdlIGFzc3VtZSB0aGF0XG4gICAgLy8gdGhpcyBQUiBoYXMgYmVlbiBtZXJnZWQgcHJvcGVybHkuXG4gICAgaWYgKGV2ZW50ID09PSAnY2xvc2VkJyAmJiBjb21taXRfaWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgUFIgaGFzIGJlZW4gcmVmZXJlbmNlZCBieSBhIGNvbW1pdCwgY2hlY2sgaWYgdGhlIGNvbW1pdCBjbG9zZXMgdGhpcyBwdWxsXG4gICAgLy8gcmVxdWVzdC4gTm90ZSB0aGF0IHRoaXMgaXMgbmVlZGVkIGJlc2lkZXMgY2hlY2tpbmcgYGNsb3NlZGAgYXMgUFJzIGNvdWxkIGJlIG1lcmdlZFxuICAgIC8vIGludG8gYW55IG5vbi1kZWZhdWx0IGJyYW5jaCB3aGVyZSB0aGUgYENsb3NlcyA8Li4+YCBrZXl3b3JkIGRvZXMgbm90IHdvcmsgYW5kIHRoZSBQUlxuICAgIC8vIGlzIHNpbXBseSBjbG9zZWQgd2l0aG91dCBhbiBhc3NvY2lhdGVkIGBjb21taXRfaWRgLiBGb3IgbW9yZSBkZXRhaWxzIHNlZTpcbiAgICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3JkcyM6fjp0ZXh0PW5vbi1kZWZhdWx0LlxuICAgIGlmIChldmVudCA9PT0gJ3JlZmVyZW5jZWQnICYmIGNvbW1pdF9pZCAmJlxuICAgICAgICBhd2FpdCBpc0NvbW1pdENsb3NpbmdQdWxsUmVxdWVzdChhcGksIGNvbW1pdF9pZCwgaWQpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBjb21taXQgaXMgY2xvc2luZyB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0LiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpOiBHaXRDbGllbnQsIHNoYTogc3RyaW5nLCBpZDogbnVtYmVyKSB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IGFwaS5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi5hcGkucmVtb3RlUGFyYW1zLCByZWY6IHNoYX0pO1xuICAvLyBNYXRjaGVzIHRoZSBjbG9zaW5nIGtleXdvcmQgc3VwcG9ydGVkIGluIGNvbW1pdCBtZXNzYWdlcy4gU2VlOlxuICAvLyBodHRwczovL2RvY3MuZ2l0aHViLmNvbS9lbi9lbnRlcnByaXNlLzIuMTYvdXNlci9naXRodWIvbWFuYWdpbmcteW91ci13b3JrLW9uLWdpdGh1Yi9jbG9zaW5nLWlzc3Vlcy11c2luZy1rZXl3b3Jkcy5cbiAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2UubWF0Y2goXG4gICAgICBuZXcgUmVnRXhwKGAoPzpjbG9zZVtzZF0/fGZpeCg/OmVbc2RdPyl8cmVzb2x2ZVtzZF0/KTo/ICMke2lkfSg/IVxcXFxkKWAsICdpJykpO1xufVxuIl19