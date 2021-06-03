/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/pull-request-state", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getPullRequestState = void 0;
    var tslib_1 = require("tslib");
    /** Thirty seconds in milliseconds. */
    var THIRTY_SECONDS_IN_MS = 30000;
    /** Gets whether a given pull request has been merged. */
    function getPullRequestState(api, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.github.pulls.get(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { pull_number: id }))];
                    case 1:
                        data = (_a.sent()).data;
                        if (data.merged) {
                            return [2 /*return*/, 'merged'];
                        }
                        if (!(data.closed_at !== null &&
                            (new Date(data.closed_at).getTime() < Date.now() - THIRTY_SECONDS_IN_MS))) return [3 /*break*/, 3];
                        return [4 /*yield*/, isPullRequestClosedWithAssociatedCommit(api, id)];
                    case 2: return [2 /*return*/, (_a.sent()) ? 'merged' : 'closed'];
                    case 3: return [2 /*return*/, 'open'];
                }
            });
        });
    }
    exports.getPullRequestState = getPullRequestState;
    /**
     * Whether the pull request has been closed with an associated commit. This is usually
     * the case if a PR has been merged using the autosquash merge script strategy. Since
     * the merge is not fast-forward, Github does not consider the PR as merged and instead
     * shows the PR as closed. See for example: https://github.com/angular/angular/pull/37918.
     */
    function isPullRequestClosedWithAssociatedCommit(api, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var request, events, i, _a, event_1, commit_id, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        request = api.github.issues.listEvents.endpoint.merge(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { issue_number: id }));
                        return [4 /*yield*/, api.github.paginate(request)];
                    case 1:
                        events = _c.sent();
                        i = events.length - 1;
                        _c.label = 2;
                    case 2:
                        if (!(i >= 0)) return [3 /*break*/, 6];
                        _a = events[i], event_1 = _a.event, commit_id = _a.commit_id;
                        // If we come across a "reopened" event, we abort looking for referenced commits. Any
                        // commits that closed the PR before, are no longer relevant and did not close the PR.
                        if (event_1 === 'reopened') {
                            return [2 /*return*/, false];
                        }
                        // If a `closed` event is captured with a commit assigned, then we assume that
                        // this PR has been merged properly.
                        if (event_1 === 'closed' && commit_id) {
                            return [2 /*return*/, true];
                        }
                        _b = event_1 === 'referenced' && commit_id;
                        if (!_b) return [3 /*break*/, 4];
                        return [4 /*yield*/, isCommitClosingPullRequest(api, commit_id, id)];
                    case 3:
                        _b = (_c.sent());
                        _c.label = 4;
                    case 4:
                        // If the PR has been referenced by a commit, check if the commit closes this pull
                        // request. Note that this is needed besides checking `closed` as PRs could be merged
                        // into any non-default branch where the `Closes <..>` keyword does not work and the PR
                        // is simply closed without an associated `commit_id`. For more details see:
                        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords#:~:text=non-default.
                        if (_b) {
                            return [2 /*return*/, true];
                        }
                        _c.label = 5;
                    case 5:
                        i--;
                        return [3 /*break*/, 2];
                    case 6: return [2 /*return*/, false];
                }
            });
        });
    }
    /** Checks whether the specified commit is closing the given pull request. */
    function isCommitClosingPullRequest(api, sha, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.github.repos.getCommit(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { ref: sha }))];
                    case 1:
                        data = (_a.sent()).data;
                        // Matches the closing keyword supported in commit messages. See:
                        // https://docs.github.com/en/enterprise/2.16/user/github/managing-your-work-on-github/closing-issues-using-keywords.
                        return [2 /*return*/, data.commit.message.match(new RegExp("(?:close[sd]?|fix(?:e[sd]?)|resolve[sd]?):? #" + id + "(?!\\d)", 'i'))];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUtILHNDQUFzQztJQUN0QyxJQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztJQUtuQyx5REFBeUQ7SUFDekQsU0FBc0IsbUJBQW1CLENBQUMsR0FBYyxFQUFFLEVBQVU7Ozs7OzRCQUNuRCxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsV0FBVyxFQUFFLEVBQUUsSUFBRSxFQUFBOzt3QkFBMUUsSUFBSSxHQUFJLENBQUEsU0FBa0UsQ0FBQSxLQUF0RTt3QkFDWCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ2Ysc0JBQU8sUUFBUSxFQUFDO3lCQUNqQjs2QkFLRyxDQUFBLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSTs0QkFDdkIsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLG9CQUFvQixDQUFDLENBQUEsRUFEeEUsd0JBQ3dFO3dCQUNuRSxxQkFBTSx1Q0FBdUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUE7NEJBQTdELHNCQUFPLENBQUEsU0FBc0QsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUM7NEJBRXRGLHNCQUFPLE1BQU0sRUFBQzs7OztLQUNmO0lBZEQsa0RBY0M7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWUsdUNBQXVDLENBQUMsR0FBYyxFQUFFLEVBQVU7Ozs7Ozt3QkFDekUsT0FBTyxHQUNULEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyx1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLFlBQVksRUFBRSxFQUFFLElBQUUsQ0FBQzt3QkFDeEMscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUE7O3dCQUE3RSxNQUFNLEdBQXFDLFNBQWtDO3dCQUsxRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7NkJBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUM5QixLQUFxQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQTdCLGtCQUFLLEVBQUUsU0FBUyxlQUFBLENBQWM7d0JBQ3JDLHFGQUFxRjt3QkFDckYsc0ZBQXNGO3dCQUN0RixJQUFJLE9BQUssS0FBSyxVQUFVLEVBQUU7NEJBQ3hCLHNCQUFPLEtBQUssRUFBQzt5QkFDZDt3QkFDRCw4RUFBOEU7d0JBQzlFLG9DQUFvQzt3QkFDcEMsSUFBSSxPQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsRUFBRTs0QkFDbkMsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQU1HLEtBQUEsT0FBSyxLQUFLLFlBQVksSUFBSSxTQUFTLENBQUE7aUNBQW5DLHdCQUFtQzt3QkFDbkMscUJBQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBQTs7OEJBQXBELFNBQW9EOzs7d0JBTnhELGtGQUFrRjt3QkFDbEYscUZBQXFGO3dCQUNyRix1RkFBdUY7d0JBQ3ZGLDRFQUE0RTt3QkFDNUUseUlBQXlJO3dCQUN6SSxRQUMwRDs0QkFDeEQsc0JBQU8sSUFBSSxFQUFDO3lCQUNiOzs7d0JBcEJxQyxDQUFDLEVBQUUsQ0FBQTs7NEJBc0IzQyxzQkFBTyxLQUFLLEVBQUM7Ozs7S0FDZDtJQUVELDZFQUE2RTtJQUM3RSxTQUFlLDBCQUEwQixDQUFDLEdBQWMsRUFBRSxHQUFXLEVBQUUsRUFBVTs7Ozs7NEJBQ2hFLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxHQUFHLEVBQUUsR0FBRyxJQUFFLEVBQUE7O3dCQUF6RSxJQUFJLEdBQUksQ0FBQSxTQUFpRSxDQUFBLEtBQXJFO3dCQUNYLGlFQUFpRTt3QkFDakUscUhBQXFIO3dCQUNySCxzQkFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQzVCLElBQUksTUFBTSxDQUFDLGtEQUFnRCxFQUFFLFlBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFDOzs7O0tBQ25GIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7T2N0b2tpdH0gZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogVGhpcnR5IHNlY29uZHMgaW4gbWlsbGlzZWNvbmRzLiAqL1xuY29uc3QgVEhJUlRZX1NFQ09ORFNfSU5fTVMgPSAzMDAwMDtcblxuLyoqIFN0YXRlIG9mIGEgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbmV4cG9ydCB0eXBlIFB1bGxSZXF1ZXN0U3RhdGUgPSAnbWVyZ2VkJ3wnY2xvc2VkJ3wnb3Blbic7XG5cbi8qKiBHZXRzIHdoZXRoZXIgYSBnaXZlbiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1bGxSZXF1ZXN0U3RhdGUoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpOiBQcm9taXNlPFB1bGxSZXF1ZXN0U3RhdGU+IHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5wdWxscy5nZXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBpZH0pO1xuICBpZiAoZGF0YS5tZXJnZWQpIHtcbiAgICByZXR1cm4gJ21lcmdlZCc7XG4gIH1cbiAgLy8gQ2hlY2sgaWYgdGhlIFBSIHdhcyBjbG9zZWQgbW9yZSB0aGFuIDMwIHNlY29uZHMgYWdvLCB0aGlzIGV4dHJhIHRpbWUgZ2l2ZXMgR2l0aHViIHRpbWUgdG9cbiAgLy8gdXBkYXRlIHRoZSBjbG9zZWQgcHVsbCByZXF1ZXN0IHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2xvc2luZyBjb21taXQuXG4gIC8vIE5vdGU6IGEgRGF0ZSBjb25zdHJ1Y3RlZCB3aXRoIGBudWxsYCBjcmVhdGVzIGFuIG9iamVjdCBhdCAwIHRpbWUsIHdoaWNoIHdpbGwgbmV2ZXIgYmUgZ3JlYXRlclxuICAvLyB0aGFuIHRoZSBjdXJyZW50IGRhdGUgdGltZS5cbiAgaWYgKGRhdGEuY2xvc2VkX2F0ICE9PSBudWxsICYmXG4gICAgICAobmV3IERhdGUoZGF0YS5jbG9zZWRfYXQpLmdldFRpbWUoKSA8IERhdGUubm93KCkgLSBUSElSVFlfU0VDT05EU19JTl9NUykpIHtcbiAgICByZXR1cm4gYXdhaXQgaXNQdWxsUmVxdWVzdENsb3NlZFdpdGhBc3NvY2lhdGVkQ29tbWl0KGFwaSwgaWQpID8gJ21lcmdlZCcgOiAnY2xvc2VkJztcbiAgfVxuICByZXR1cm4gJ29wZW4nO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhbiBhc3NvY2lhdGVkIGNvbW1pdC4gVGhpcyBpcyB1c3VhbGx5XG4gKiB0aGUgY2FzZSBpZiBhIFBSIGhhcyBiZWVuIG1lcmdlZCB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzY3JpcHQgc3RyYXRlZ3kuIFNpbmNlXG4gKiB0aGUgbWVyZ2UgaXMgbm90IGZhc3QtZm9yd2FyZCwgR2l0aHViIGRvZXMgbm90IGNvbnNpZGVyIHRoZSBQUiBhcyBtZXJnZWQgYW5kIGluc3RlYWRcbiAqIHNob3dzIHRoZSBQUiBhcyBjbG9zZWQuIFNlZSBmb3IgZXhhbXBsZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9wdWxsLzM3OTE4LlxuICovXG5hc3luYyBmdW5jdGlvbiBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpIHtcbiAgY29uc3QgcmVxdWVzdCA9XG4gICAgICBhcGkuZ2l0aHViLmlzc3Vlcy5saXN0RXZlbnRzLmVuZHBvaW50Lm1lcmdlKHsuLi5hcGkucmVtb3RlUGFyYW1zLCBpc3N1ZV9udW1iZXI6IGlkfSk7XG4gIGNvbnN0IGV2ZW50czogT2N0b2tpdC5Jc3N1ZXNMaXN0RXZlbnRzUmVzcG9uc2UgPSBhd2FpdCBhcGkuZ2l0aHViLnBhZ2luYXRlKHJlcXVlc3QpO1xuICAvLyBJdGVyYXRlIHRocm91Z2ggdGhlIGV2ZW50cyBvZiB0aGUgcHVsbCByZXF1ZXN0IGluIHJldmVyc2UuIFdlIHdhbnQgdG8gZmluZCB0aGUgbW9zdFxuICAvLyByZWNlbnQgZXZlbnRzIGFuZCBjaGVjayBpZiB0aGUgUFIgaGFzIGJlZW4gY2xvc2VkIHdpdGggYSBjb21taXQgYXNzb2NpYXRlZCB3aXRoIGl0LlxuICAvLyBJZiB0aGUgUFIgaGFzIGJlZW4gY2xvc2VkIHRocm91Z2ggYSBjb21taXQsIHdlIGFzc3VtZSB0aGF0IHRoZSBQUiBoYXMgYmVlbiBtZXJnZWRcbiAgLy8gdXNpbmcgdGhlIGF1dG9zcXVhc2ggbWVyZ2Ugc3RyYXRlZ3kuIEZvciBtb3JlIGRldGFpbHMuIFNlZSB0aGUgYEF1dG9zcXVhc2hNZXJnZVN0cmF0ZWd5YC5cbiAgZm9yIChsZXQgaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGNvbnN0IHtldmVudCwgY29tbWl0X2lkfSA9IGV2ZW50c1tpXTtcbiAgICAvLyBJZiB3ZSBjb21lIGFjcm9zcyBhIFwicmVvcGVuZWRcIiBldmVudCwgd2UgYWJvcnQgbG9va2luZyBmb3IgcmVmZXJlbmNlZCBjb21taXRzLiBBbnlcbiAgICAvLyBjb21taXRzIHRoYXQgY2xvc2VkIHRoZSBQUiBiZWZvcmUsIGFyZSBubyBsb25nZXIgcmVsZXZhbnQgYW5kIGRpZCBub3QgY2xvc2UgdGhlIFBSLlxuICAgIGlmIChldmVudCA9PT0gJ3Jlb3BlbmVkJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAvLyBJZiBhIGBjbG9zZWRgIGV2ZW50IGlzIGNhcHR1cmVkIHdpdGggYSBjb21taXQgYXNzaWduZWQsIHRoZW4gd2UgYXNzdW1lIHRoYXRcbiAgICAvLyB0aGlzIFBSIGhhcyBiZWVuIG1lcmdlZCBwcm9wZXJseS5cbiAgICBpZiAoZXZlbnQgPT09ICdjbG9zZWQnICYmIGNvbW1pdF9pZCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIC8vIElmIHRoZSBQUiBoYXMgYmVlbiByZWZlcmVuY2VkIGJ5IGEgY29tbWl0LCBjaGVjayBpZiB0aGUgY29tbWl0IGNsb3NlcyB0aGlzIHB1bGxcbiAgICAvLyByZXF1ZXN0LiBOb3RlIHRoYXQgdGhpcyBpcyBuZWVkZWQgYmVzaWRlcyBjaGVja2luZyBgY2xvc2VkYCBhcyBQUnMgY291bGQgYmUgbWVyZ2VkXG4gICAgLy8gaW50byBhbnkgbm9uLWRlZmF1bHQgYnJhbmNoIHdoZXJlIHRoZSBgQ2xvc2VzIDwuLj5gIGtleXdvcmQgZG9lcyBub3Qgd29yayBhbmQgdGhlIFBSXG4gICAgLy8gaXMgc2ltcGx5IGNsb3NlZCB3aXRob3V0IGFuIGFzc29jaWF0ZWQgYGNvbW1pdF9pZGAuIEZvciBtb3JlIGRldGFpbHMgc2VlOlxuICAgIC8vIGh0dHBzOi8vZG9jcy5naXRodWIuY29tL2VuL2VudGVycHJpc2UvMi4xNi91c2VyL2dpdGh1Yi9tYW5hZ2luZy15b3VyLXdvcmstb24tZ2l0aHViL2Nsb3NpbmctaXNzdWVzLXVzaW5nLWtleXdvcmRzIzp+OnRleHQ9bm9uLWRlZmF1bHQuXG4gICAgaWYgKGV2ZW50ID09PSAncmVmZXJlbmNlZCcgJiYgY29tbWl0X2lkICYmXG4gICAgICAgIGF3YWl0IGlzQ29tbWl0Q2xvc2luZ1B1bGxSZXF1ZXN0KGFwaSwgY29tbWl0X2lkLCBpZCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIGNvbW1pdCBpcyBjbG9zaW5nIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QuICovXG5hc3luYyBmdW5jdGlvbiBpc0NvbW1pdENsb3NpbmdQdWxsUmVxdWVzdChhcGk6IEdpdENsaWVudCwgc2hhOiBzdHJpbmcsIGlkOiBudW1iZXIpIHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHJlZjogc2hhfSk7XG4gIC8vIE1hdGNoZXMgdGhlIGNsb3Npbmcga2V5d29yZCBzdXBwb3J0ZWQgaW4gY29tbWl0IG1lc3NhZ2VzLiBTZWU6XG4gIC8vIGh0dHBzOi8vZG9jcy5naXRodWIuY29tL2VuL2VudGVycHJpc2UvMi4xNi91c2VyL2dpdGh1Yi9tYW5hZ2luZy15b3VyLXdvcmstb24tZ2l0aHViL2Nsb3NpbmctaXNzdWVzLXVzaW5nLWtleXdvcmRzLlxuICByZXR1cm4gZGF0YS5jb21taXQubWVzc2FnZS5tYXRjaChcbiAgICAgIG5ldyBSZWdFeHAoYCg/OmNsb3NlW3NkXT98Zml4KD86ZVtzZF0/KXxyZXNvbHZlW3NkXT8pOj8gIyR7aWR9KD8hXFxcXGQpYCwgJ2knKSk7XG59XG4iXX0=