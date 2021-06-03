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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUtILHNDQUFzQztBQUN0QyxNQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztBQUtuQyx5REFBeUQ7QUFDekQsTUFBTSxVQUFnQixtQkFBbUIsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7UUFDbEUsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxpQ0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLFdBQVcsRUFBRSxFQUFFLElBQUUsQ0FBQztRQUNsRixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDZixPQUFPLFFBQVEsQ0FBQztTQUNqQjtRQUNELDRGQUE0RjtRQUM1RiwyRUFBMkU7UUFDM0UsZ0dBQWdHO1FBQ2hHLDhCQUE4QjtRQUM5QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSTtZQUN2QixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsRUFBRTtZQUM1RSxPQUFPLENBQUEsTUFBTSx1Q0FBdUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO1NBQ3JGO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDaEIsQ0FBQztDQUFBO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFlLHVDQUF1QyxDQUFDLEdBQWMsRUFBRSxFQUFVOztRQUMvRSxNQUFNLE9BQU8sR0FDVCxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssaUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxZQUFZLEVBQUUsRUFBRSxJQUFFLENBQUM7UUFDekYsTUFBTSxNQUFNLEdBQXFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDcEYsc0ZBQXNGO1FBQ3RGLHNGQUFzRjtRQUN0RixvRkFBb0Y7UUFDcEYsNEZBQTRGO1FBQzVGLEtBQUssSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQyxNQUFNLEVBQUMsS0FBSyxFQUFFLFNBQVMsRUFBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxxRkFBcUY7WUFDckYsc0ZBQXNGO1lBQ3RGLElBQUksS0FBSyxLQUFLLFVBQVUsRUFBRTtnQkFDeEIsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELDhFQUE4RTtZQUM5RSxvQ0FBb0M7WUFDcEMsSUFBSSxLQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsRUFBRTtnQkFDbkMsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUNELGtGQUFrRjtZQUNsRixxRkFBcUY7WUFDckYsdUZBQXVGO1lBQ3ZGLDRFQUE0RTtZQUM1RSx5SUFBeUk7WUFDekksSUFBSSxLQUFLLEtBQUssWUFBWSxJQUFJLFNBQVM7aUJBQ25DLE1BQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQSxFQUFFO2dCQUN4RCxPQUFPLElBQUksQ0FBQzthQUNiO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7Q0FBQTtBQUVELDZFQUE2RTtBQUM3RSxTQUFlLDBCQUEwQixDQUFDLEdBQWMsRUFBRSxHQUFXLEVBQUUsRUFBVTs7UUFDL0UsTUFBTSxFQUFDLElBQUksRUFBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyxpQ0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLEdBQUcsRUFBRSxHQUFHLElBQUUsQ0FBQztRQUNqRixpRUFBaUU7UUFDakUscUhBQXFIO1FBQ3JILE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUM1QixJQUFJLE1BQU0sQ0FBQyxnREFBZ0QsRUFBRSxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtPY3Rva2l0fSBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbi8qKiBUaGlydHkgc2Vjb25kcyBpbiBtaWxsaXNlY29uZHMuICovXG5jb25zdCBUSElSVFlfU0VDT05EU19JTl9NUyA9IDMwMDAwO1xuXG4vKiogU3RhdGUgb2YgYSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RTdGF0ZSA9ICdtZXJnZWQnfCdjbG9zZWQnfCdvcGVuJztcblxuLyoqIEdldHMgd2hldGhlciBhIGdpdmVuIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVsbFJlcXVlc3RTdGF0ZShhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcik6IFByb21pc2U8UHVsbFJlcXVlc3RTdGF0ZT4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnB1bGxzLmdldCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IGlkfSk7XG4gIGlmIChkYXRhLm1lcmdlZCkge1xuICAgIHJldHVybiAnbWVyZ2VkJztcbiAgfVxuICAvLyBDaGVjayBpZiB0aGUgUFIgd2FzIGNsb3NlZCBtb3JlIHRoYW4gMzAgc2Vjb25kcyBhZ28sIHRoaXMgZXh0cmEgdGltZSBnaXZlcyBHaXRodWIgdGltZSB0b1xuICAvLyB1cGRhdGUgdGhlIGNsb3NlZCBwdWxsIHJlcXVlc3QgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjbG9zaW5nIGNvbW1pdC5cbiAgLy8gTm90ZTogYSBEYXRlIGNvbnN0cnVjdGVkIHdpdGggYG51bGxgIGNyZWF0ZXMgYW4gb2JqZWN0IGF0IDAgdGltZSwgd2hpY2ggd2lsbCBuZXZlciBiZSBncmVhdGVyXG4gIC8vIHRoYW4gdGhlIGN1cnJlbnQgZGF0ZSB0aW1lLlxuICBpZiAoZGF0YS5jbG9zZWRfYXQgIT09IG51bGwgJiZcbiAgICAgIChuZXcgRGF0ZShkYXRhLmNsb3NlZF9hdCkuZ2V0VGltZSgpIDwgRGF0ZS5ub3coKSAtIFRISVJUWV9TRUNPTkRTX0lOX01TKSkge1xuICAgIHJldHVybiBhd2FpdCBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpLCBpZCkgPyAnbWVyZ2VkJyA6ICdjbG9zZWQnO1xuICB9XG4gIHJldHVybiAnb3Blbic7XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNsb3NlZCB3aXRoIGFuIGFzc29jaWF0ZWQgY29tbWl0LiBUaGlzIGlzIHVzdWFsbHlcbiAqIHRoZSBjYXNlIGlmIGEgUFIgaGFzIGJlZW4gbWVyZ2VkIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHNjcmlwdCBzdHJhdGVneS4gU2luY2VcbiAqIHRoZSBtZXJnZSBpcyBub3QgZmFzdC1mb3J3YXJkLCBHaXRodWIgZG9lcyBub3QgY29uc2lkZXIgdGhlIFBSIGFzIG1lcmdlZCBhbmQgaW5zdGVhZFxuICogc2hvd3MgdGhlIFBSIGFzIGNsb3NlZC4gU2VlIGZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzc5MTguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcikge1xuICBjb25zdCByZXF1ZXN0ID1cbiAgICAgIGFwaS5naXRodWIuaXNzdWVzLmxpc3RFdmVudHMuZW5kcG9pbnQubWVyZ2Uoey4uLmFwaS5yZW1vdGVQYXJhbXMsIGlzc3VlX251bWJlcjogaWR9KTtcbiAgY29uc3QgZXZlbnRzOiBPY3Rva2l0Lklzc3Vlc0xpc3RFdmVudHNSZXNwb25zZSA9IGF3YWl0IGFwaS5naXRodWIucGFnaW5hdGUocmVxdWVzdCk7XG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZXZlbnRzIG9mIHRoZSBwdWxsIHJlcXVlc3QgaW4gcmV2ZXJzZS4gV2Ugd2FudCB0byBmaW5kIHRoZSBtb3N0XG4gIC8vIHJlY2VudCBldmVudHMgYW5kIGNoZWNrIGlmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhIGNvbW1pdCBhc3NvY2lhdGVkIHdpdGggaXQuXG4gIC8vIElmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgdGhyb3VnaCBhIGNvbW1pdCwgd2UgYXNzdW1lIHRoYXQgdGhlIFBSIGhhcyBiZWVuIG1lcmdlZFxuICAvLyB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzdHJhdGVneS4gRm9yIG1vcmUgZGV0YWlscy4gU2VlIHRoZSBgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3lgLlxuICBmb3IgKGxldCBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qge2V2ZW50LCBjb21taXRfaWR9ID0gZXZlbnRzW2ldO1xuICAgIC8vIElmIHdlIGNvbWUgYWNyb3NzIGEgXCJyZW9wZW5lZFwiIGV2ZW50LCB3ZSBhYm9ydCBsb29raW5nIGZvciByZWZlcmVuY2VkIGNvbW1pdHMuIEFueVxuICAgIC8vIGNvbW1pdHMgdGhhdCBjbG9zZWQgdGhlIFBSIGJlZm9yZSwgYXJlIG5vIGxvbmdlciByZWxldmFudCBhbmQgZGlkIG5vdCBjbG9zZSB0aGUgUFIuXG4gICAgaWYgKGV2ZW50ID09PSAncmVvcGVuZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIGEgYGNsb3NlZGAgZXZlbnQgaXMgY2FwdHVyZWQgd2l0aCBhIGNvbW1pdCBhc3NpZ25lZCwgdGhlbiB3ZSBhc3N1bWUgdGhhdFxuICAgIC8vIHRoaXMgUFIgaGFzIGJlZW4gbWVyZ2VkIHByb3Blcmx5LlxuICAgIGlmIChldmVudCA9PT0gJ2Nsb3NlZCcgJiYgY29tbWl0X2lkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIHJlZmVyZW5jZWQgYnkgYSBjb21taXQsIGNoZWNrIGlmIHRoZSBjb21taXQgY2xvc2VzIHRoaXMgcHVsbFxuICAgIC8vIHJlcXVlc3QuIE5vdGUgdGhhdCB0aGlzIGlzIG5lZWRlZCBiZXNpZGVzIGNoZWNraW5nIGBjbG9zZWRgIGFzIFBScyBjb3VsZCBiZSBtZXJnZWRcbiAgICAvLyBpbnRvIGFueSBub24tZGVmYXVsdCBicmFuY2ggd2hlcmUgdGhlIGBDbG9zZXMgPC4uPmAga2V5d29yZCBkb2VzIG5vdCB3b3JrIGFuZCB0aGUgUFJcbiAgICAvLyBpcyBzaW1wbHkgY2xvc2VkIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBgY29tbWl0X2lkYC4gRm9yIG1vcmUgZGV0YWlscyBzZWU6XG4gICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMjOn46dGV4dD1ub24tZGVmYXVsdC5cbiAgICBpZiAoZXZlbnQgPT09ICdyZWZlcmVuY2VkJyAmJiBjb21taXRfaWQgJiZcbiAgICAgICAgYXdhaXQgaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpLCBjb21taXRfaWQsIGlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGlzIGNsb3NpbmcgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzQ29tbWl0Q2xvc2luZ1B1bGxSZXF1ZXN0KGFwaTogR2l0Q2xpZW50LCBzaGE6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcmVmOiBzaGF9KTtcbiAgLy8gTWF0Y2hlcyB0aGUgY2xvc2luZyBrZXl3b3JkIHN1cHBvcnRlZCBpbiBjb21taXQgbWVzc2FnZXMuIFNlZTpcbiAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMuXG4gIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLm1hdGNoKFxuICAgICAgbmV3IFJlZ0V4cChgKD86Y2xvc2Vbc2RdP3xmaXgoPzplW3NkXT8pfHJlc29sdmVbc2RdPyk6PyAjJHtpZH0oPyFcXFxcZClgLCAnaScpKTtcbn1cbiJdfQ==