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
            var events, i, _a, event_1, commit_id, _b;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, api.github.paginate(api.github.issues.listEvents, tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { issue_number: id }))];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILHNDQUFzQztJQUN0QyxJQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztJQUtuQyx5REFBeUQ7SUFDekQsU0FBc0IsbUJBQW1CLENBQUMsR0FBYyxFQUFFLEVBQVU7Ozs7OzRCQUNuRCxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsV0FBVyxFQUFFLEVBQUUsSUFBRSxFQUFBOzt3QkFBMUUsSUFBSSxHQUFJLENBQUEsU0FBa0UsQ0FBQSxLQUF0RTt3QkFDWCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7NEJBQ2Ysc0JBQU8sUUFBUSxFQUFDO3lCQUNqQjs2QkFLRyxDQUFBLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSTs0QkFDdkIsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLG9CQUFvQixDQUFDLENBQUEsRUFEeEUsd0JBQ3dFO3dCQUNuRSxxQkFBTSx1Q0FBdUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUE7NEJBQTdELHNCQUFPLENBQUEsU0FBc0QsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUM7NEJBRXRGLHNCQUFPLE1BQU0sRUFBQzs7OztLQUNmO0lBZEQsa0RBY0M7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWUsdUNBQXVDLENBQUMsR0FBYyxFQUFFLEVBQVU7Ozs7OzRCQUNoRSxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FDcEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSx3Q0FBTSxHQUFHLENBQUMsWUFBWSxLQUFFLFlBQVksRUFBRSxFQUFFLElBQUUsRUFBQTs7d0JBRHBFLE1BQU0sR0FBRyxTQUMyRDt3QkFLakUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQzs7OzZCQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsQ0FBQTt3QkFDOUIsS0FBcUIsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUE3QixrQkFBSyxFQUFFLFNBQVMsZUFBQSxDQUFjO3dCQUNyQyxxRkFBcUY7d0JBQ3JGLHNGQUFzRjt3QkFDdEYsSUFBSSxPQUFLLEtBQUssVUFBVSxFQUFFOzRCQUN4QixzQkFBTyxLQUFLLEVBQUM7eUJBQ2Q7d0JBQ0QsOEVBQThFO3dCQUM5RSxvQ0FBb0M7d0JBQ3BDLElBQUksT0FBSyxLQUFLLFFBQVEsSUFBSSxTQUFTLEVBQUU7NEJBQ25DLHNCQUFPLElBQUksRUFBQzt5QkFDYjt3QkFNRyxLQUFBLE9BQUssS0FBSyxZQUFZLElBQUksU0FBUyxDQUFBO2lDQUFuQyx3QkFBbUM7d0JBQ25DLHFCQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUE7OzhCQUFwRCxTQUFvRDs7O3dCQU54RCxrRkFBa0Y7d0JBQ2xGLHFGQUFxRjt3QkFDckYsdUZBQXVGO3dCQUN2Riw0RUFBNEU7d0JBQzVFLHlJQUF5STt3QkFDekksUUFDMEQ7NEJBQ3hELHNCQUFPLElBQUksRUFBQzt5QkFDYjs7O3dCQXBCcUMsQ0FBQyxFQUFFLENBQUE7OzRCQXNCM0Msc0JBQU8sS0FBSyxFQUFDOzs7O0tBQ2Q7SUFFRCw2RUFBNkU7SUFDN0UsU0FBZSwwQkFBMEIsQ0FBQyxHQUFjLEVBQUUsR0FBVyxFQUFFLEVBQVU7Ozs7OzRCQUNoRSxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsR0FBRyxFQUFFLEdBQUcsSUFBRSxFQUFBOzt3QkFBekUsSUFBSSxHQUFJLENBQUEsU0FBaUUsQ0FBQSxLQUFyRTt3QkFDWCxpRUFBaUU7d0JBQ2pFLHFIQUFxSDt3QkFDckgsc0JBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUM1QixJQUFJLE1BQU0sQ0FBQyxrREFBZ0QsRUFBRSxZQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBQzs7OztLQUNuRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG4vKiogVGhpcnR5IHNlY29uZHMgaW4gbWlsbGlzZWNvbmRzLiAqL1xuY29uc3QgVEhJUlRZX1NFQ09ORFNfSU5fTVMgPSAzMDAwMDtcblxuLyoqIFN0YXRlIG9mIGEgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbmV4cG9ydCB0eXBlIFB1bGxSZXF1ZXN0U3RhdGUgPSAnbWVyZ2VkJ3wnY2xvc2VkJ3wnb3Blbic7XG5cbi8qKiBHZXRzIHdoZXRoZXIgYSBnaXZlbiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1bGxSZXF1ZXN0U3RhdGUoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpOiBQcm9taXNlPFB1bGxSZXF1ZXN0U3RhdGU+IHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5wdWxscy5nZXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBpZH0pO1xuICBpZiAoZGF0YS5tZXJnZWQpIHtcbiAgICByZXR1cm4gJ21lcmdlZCc7XG4gIH1cbiAgLy8gQ2hlY2sgaWYgdGhlIFBSIHdhcyBjbG9zZWQgbW9yZSB0aGFuIDMwIHNlY29uZHMgYWdvLCB0aGlzIGV4dHJhIHRpbWUgZ2l2ZXMgR2l0aHViIHRpbWUgdG9cbiAgLy8gdXBkYXRlIHRoZSBjbG9zZWQgcHVsbCByZXF1ZXN0IHRvIGJlIGFzc29jaWF0ZWQgd2l0aCB0aGUgY2xvc2luZyBjb21taXQuXG4gIC8vIE5vdGU6IGEgRGF0ZSBjb25zdHJ1Y3RlZCB3aXRoIGBudWxsYCBjcmVhdGVzIGFuIG9iamVjdCBhdCAwIHRpbWUsIHdoaWNoIHdpbGwgbmV2ZXIgYmUgZ3JlYXRlclxuICAvLyB0aGFuIHRoZSBjdXJyZW50IGRhdGUgdGltZS5cbiAgaWYgKGRhdGEuY2xvc2VkX2F0ICE9PSBudWxsICYmXG4gICAgICAobmV3IERhdGUoZGF0YS5jbG9zZWRfYXQpLmdldFRpbWUoKSA8IERhdGUubm93KCkgLSBUSElSVFlfU0VDT05EU19JTl9NUykpIHtcbiAgICByZXR1cm4gYXdhaXQgaXNQdWxsUmVxdWVzdENsb3NlZFdpdGhBc3NvY2lhdGVkQ29tbWl0KGFwaSwgaWQpID8gJ21lcmdlZCcgOiAnY2xvc2VkJztcbiAgfVxuICByZXR1cm4gJ29wZW4nO1xufVxuXG4vKipcbiAqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhbiBhc3NvY2lhdGVkIGNvbW1pdC4gVGhpcyBpcyB1c3VhbGx5XG4gKiB0aGUgY2FzZSBpZiBhIFBSIGhhcyBiZWVuIG1lcmdlZCB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzY3JpcHQgc3RyYXRlZ3kuIFNpbmNlXG4gKiB0aGUgbWVyZ2UgaXMgbm90IGZhc3QtZm9yd2FyZCwgR2l0aHViIGRvZXMgbm90IGNvbnNpZGVyIHRoZSBQUiBhcyBtZXJnZWQgYW5kIGluc3RlYWRcbiAqIHNob3dzIHRoZSBQUiBhcyBjbG9zZWQuIFNlZSBmb3IgZXhhbXBsZTogaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9wdWxsLzM3OTE4LlxuICovXG5hc3luYyBmdW5jdGlvbiBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpIHtcbiAgY29uc3QgZXZlbnRzID0gYXdhaXQgYXBpLmdpdGh1Yi5wYWdpbmF0ZShcbiAgICAgIGFwaS5naXRodWIuaXNzdWVzLmxpc3RFdmVudHMsIHsuLi5hcGkucmVtb3RlUGFyYW1zLCBpc3N1ZV9udW1iZXI6IGlkfSk7XG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZXZlbnRzIG9mIHRoZSBwdWxsIHJlcXVlc3QgaW4gcmV2ZXJzZS4gV2Ugd2FudCB0byBmaW5kIHRoZSBtb3N0XG4gIC8vIHJlY2VudCBldmVudHMgYW5kIGNoZWNrIGlmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhIGNvbW1pdCBhc3NvY2lhdGVkIHdpdGggaXQuXG4gIC8vIElmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgdGhyb3VnaCBhIGNvbW1pdCwgd2UgYXNzdW1lIHRoYXQgdGhlIFBSIGhhcyBiZWVuIG1lcmdlZFxuICAvLyB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzdHJhdGVneS4gRm9yIG1vcmUgZGV0YWlscy4gU2VlIHRoZSBgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3lgLlxuICBmb3IgKGxldCBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qge2V2ZW50LCBjb21taXRfaWR9ID0gZXZlbnRzW2ldO1xuICAgIC8vIElmIHdlIGNvbWUgYWNyb3NzIGEgXCJyZW9wZW5lZFwiIGV2ZW50LCB3ZSBhYm9ydCBsb29raW5nIGZvciByZWZlcmVuY2VkIGNvbW1pdHMuIEFueVxuICAgIC8vIGNvbW1pdHMgdGhhdCBjbG9zZWQgdGhlIFBSIGJlZm9yZSwgYXJlIG5vIGxvbmdlciByZWxldmFudCBhbmQgZGlkIG5vdCBjbG9zZSB0aGUgUFIuXG4gICAgaWYgKGV2ZW50ID09PSAncmVvcGVuZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIGEgYGNsb3NlZGAgZXZlbnQgaXMgY2FwdHVyZWQgd2l0aCBhIGNvbW1pdCBhc3NpZ25lZCwgdGhlbiB3ZSBhc3N1bWUgdGhhdFxuICAgIC8vIHRoaXMgUFIgaGFzIGJlZW4gbWVyZ2VkIHByb3Blcmx5LlxuICAgIGlmIChldmVudCA9PT0gJ2Nsb3NlZCcgJiYgY29tbWl0X2lkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIHJlZmVyZW5jZWQgYnkgYSBjb21taXQsIGNoZWNrIGlmIHRoZSBjb21taXQgY2xvc2VzIHRoaXMgcHVsbFxuICAgIC8vIHJlcXVlc3QuIE5vdGUgdGhhdCB0aGlzIGlzIG5lZWRlZCBiZXNpZGVzIGNoZWNraW5nIGBjbG9zZWRgIGFzIFBScyBjb3VsZCBiZSBtZXJnZWRcbiAgICAvLyBpbnRvIGFueSBub24tZGVmYXVsdCBicmFuY2ggd2hlcmUgdGhlIGBDbG9zZXMgPC4uPmAga2V5d29yZCBkb2VzIG5vdCB3b3JrIGFuZCB0aGUgUFJcbiAgICAvLyBpcyBzaW1wbHkgY2xvc2VkIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBgY29tbWl0X2lkYC4gRm9yIG1vcmUgZGV0YWlscyBzZWU6XG4gICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMjOn46dGV4dD1ub24tZGVmYXVsdC5cbiAgICBpZiAoZXZlbnQgPT09ICdyZWZlcmVuY2VkJyAmJiBjb21taXRfaWQgJiZcbiAgICAgICAgYXdhaXQgaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpLCBjb21taXRfaWQsIGlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGlzIGNsb3NpbmcgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzQ29tbWl0Q2xvc2luZ1B1bGxSZXF1ZXN0KGFwaTogR2l0Q2xpZW50LCBzaGE6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcmVmOiBzaGF9KTtcbiAgLy8gTWF0Y2hlcyB0aGUgY2xvc2luZyBrZXl3b3JkIHN1cHBvcnRlZCBpbiBjb21taXQgbWVzc2FnZXMuIFNlZTpcbiAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMuXG4gIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLm1hdGNoKFxuICAgICAgbmV3IFJlZ0V4cChgKD86Y2xvc2Vbc2RdP3xmaXgoPzplW3NkXT8pfHJlc29sdmVbc2RdPyk6PyAjJHtpZH0oPyFcXFxcZClgLCAnaScpKTtcbn1cbiJdfQ==