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
    /** Gets whether a given pull request has been merged. */
    function getPullRequestState(api, id) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, api.github.pulls.get(tslib_1.__assign(tslib_1.__assign({}, api.remoteParams), { pull_number: id }))];
                    case 1:
                        data = (_a.sent()).data;
                        if (!data.merged) return [3 /*break*/, 2];
                        return [2 /*return*/, 'merged'];
                    case 2:
                        if (!(data.closed_at !== null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, isPullRequestClosedWithAssociatedCommit(api, id)];
                    case 3: return [2 /*return*/, (_a.sent()) ? 'merged' : 'closed'];
                    case 4: return [2 /*return*/, 'open'];
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
                        return [2 /*return*/, data.commit.message.match(new RegExp("close[sd]? #" + id + "[^0-9]?", 'i'))];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQVFILHlEQUF5RDtJQUN6RCxTQUFzQixtQkFBbUIsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7Ozs7NEJBQ25ELHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsRUFBRSxJQUFFLEVBQUE7O3dCQUExRSxJQUFJLEdBQUksQ0FBQSxTQUFrRSxDQUFBLEtBQXRFOzZCQUNQLElBQUksQ0FBQyxNQUFNLEVBQVgsd0JBQVc7d0JBQ2Isc0JBQU8sUUFBUSxFQUFDOzs2QkFDUCxDQUFBLElBQUksQ0FBQyxTQUFTLEtBQUssSUFBSSxDQUFBLEVBQXZCLHdCQUF1Qjt3QkFDekIscUJBQU0sdUNBQXVDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFBOzRCQUE3RCxzQkFBTyxDQUFBLFNBQXNELEVBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFDOzRCQUVwRixzQkFBTyxNQUFNLEVBQUM7Ozs7S0FFakI7SUFURCxrREFTQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZSx1Q0FBdUMsQ0FBQyxHQUFjLEVBQUUsRUFBVTs7Ozs7O3dCQUN6RSxPQUFPLEdBQ1QsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsWUFBWSxFQUFFLEVBQUUsSUFBRSxDQUFDO3dCQUN4QyxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBQTs7d0JBQTdFLE1BQU0sR0FBcUMsU0FBa0M7d0JBSzFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUM7Ozs2QkFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQzlCLEtBQXFCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBN0Isa0JBQUssRUFBRSxTQUFTLGVBQUEsQ0FBYzt3QkFDckMscUZBQXFGO3dCQUNyRixzRkFBc0Y7d0JBQ3RGLElBQUksT0FBSyxLQUFLLFVBQVUsRUFBRTs0QkFDeEIsc0JBQU8sS0FBSyxFQUFDO3lCQUNkO3dCQUNELDhFQUE4RTt3QkFDOUUsb0NBQW9DO3dCQUNwQyxJQUFJLE9BQUssS0FBSyxRQUFRLElBQUksU0FBUyxFQUFFOzRCQUNuQyxzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7d0JBTUcsS0FBQSxPQUFLLEtBQUssWUFBWSxJQUFJLFNBQVMsQ0FBQTtpQ0FBbkMsd0JBQW1DO3dCQUNuQyxxQkFBTSwwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFBOzs4QkFBcEQsU0FBb0Q7Ozt3QkFOeEQsa0ZBQWtGO3dCQUNsRixxRkFBcUY7d0JBQ3JGLHVGQUF1Rjt3QkFDdkYsNEVBQTRFO3dCQUM1RSx5SUFBeUk7d0JBQ3pJLFFBQzBEOzRCQUN4RCxzQkFBTyxJQUFJLEVBQUM7eUJBQ2I7Ozt3QkFwQnFDLENBQUMsRUFBRSxDQUFBOzs0QkFzQjNDLHNCQUFPLEtBQUssRUFBQzs7OztLQUNkO0lBRUQsNkVBQTZFO0lBQzdFLFNBQWUsMEJBQTBCLENBQUMsR0FBYyxFQUFFLEdBQVcsRUFBRSxFQUFVOzs7Ozs0QkFDaEUscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsU0FBUyx1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLEdBQUcsRUFBRSxHQUFHLElBQUUsRUFBQTs7d0JBQXpFLElBQUksR0FBSSxDQUFBLFNBQWlFLENBQUEsS0FBckU7d0JBQ1gsaUVBQWlFO3dCQUNqRSxxSEFBcUg7d0JBQ3JILHNCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxpQkFBZSxFQUFFLFlBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFDOzs7O0tBQy9FIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcblxuLyoqIFN0YXRlIG9mIGEgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbmV4cG9ydCB0eXBlIFB1bGxSZXF1ZXN0U3RhdGUgPSAnbWVyZ2VkJ3wnY2xvc2VkJ3wnb3Blbic7XG5cbi8qKiBHZXRzIHdoZXRoZXIgYSBnaXZlbiBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFB1bGxSZXF1ZXN0U3RhdGUoYXBpOiBHaXRDbGllbnQsIGlkOiBudW1iZXIpOiBQcm9taXNlPFB1bGxSZXF1ZXN0U3RhdGU+IHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgYXBpLmdpdGh1Yi5wdWxscy5nZXQoey4uLmFwaS5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBpZH0pO1xuICBpZiAoZGF0YS5tZXJnZWQpIHtcbiAgICByZXR1cm4gJ21lcmdlZCc7XG4gIH0gZWxzZSBpZiAoZGF0YS5jbG9zZWRfYXQgIT09IG51bGwpIHtcbiAgICByZXR1cm4gYXdhaXQgaXNQdWxsUmVxdWVzdENsb3NlZFdpdGhBc3NvY2lhdGVkQ29tbWl0KGFwaSwgaWQpID8gJ21lcmdlZCcgOiAnY2xvc2VkJztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJ29wZW4nO1xuICB9XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNsb3NlZCB3aXRoIGFuIGFzc29jaWF0ZWQgY29tbWl0LiBUaGlzIGlzIHVzdWFsbHlcbiAqIHRoZSBjYXNlIGlmIGEgUFIgaGFzIGJlZW4gbWVyZ2VkIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHNjcmlwdCBzdHJhdGVneS4gU2luY2VcbiAqIHRoZSBtZXJnZSBpcyBub3QgZmFzdC1mb3J3YXJkLCBHaXRodWIgZG9lcyBub3QgY29uc2lkZXIgdGhlIFBSIGFzIG1lcmdlZCBhbmQgaW5zdGVhZFxuICogc2hvd3MgdGhlIFBSIGFzIGNsb3NlZC4gU2VlIGZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzc5MTguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGk6IEdpdENsaWVudCwgaWQ6IG51bWJlcikge1xuICBjb25zdCByZXF1ZXN0ID1cbiAgICAgIGFwaS5naXRodWIuaXNzdWVzLmxpc3RFdmVudHMuZW5kcG9pbnQubWVyZ2Uoey4uLmFwaS5yZW1vdGVQYXJhbXMsIGlzc3VlX251bWJlcjogaWR9KTtcbiAgY29uc3QgZXZlbnRzOiBPY3Rva2l0Lklzc3Vlc0xpc3RFdmVudHNSZXNwb25zZSA9IGF3YWl0IGFwaS5naXRodWIucGFnaW5hdGUocmVxdWVzdCk7XG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZXZlbnRzIG9mIHRoZSBwdWxsIHJlcXVlc3QgaW4gcmV2ZXJzZS4gV2Ugd2FudCB0byBmaW5kIHRoZSBtb3N0XG4gIC8vIHJlY2VudCBldmVudHMgYW5kIGNoZWNrIGlmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhIGNvbW1pdCBhc3NvY2lhdGVkIHdpdGggaXQuXG4gIC8vIElmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgdGhyb3VnaCBhIGNvbW1pdCwgd2UgYXNzdW1lIHRoYXQgdGhlIFBSIGhhcyBiZWVuIG1lcmdlZFxuICAvLyB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzdHJhdGVneS4gRm9yIG1vcmUgZGV0YWlscy4gU2VlIHRoZSBgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3lgLlxuICBmb3IgKGxldCBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qge2V2ZW50LCBjb21taXRfaWR9ID0gZXZlbnRzW2ldO1xuICAgIC8vIElmIHdlIGNvbWUgYWNyb3NzIGEgXCJyZW9wZW5lZFwiIGV2ZW50LCB3ZSBhYm9ydCBsb29raW5nIGZvciByZWZlcmVuY2VkIGNvbW1pdHMuIEFueVxuICAgIC8vIGNvbW1pdHMgdGhhdCBjbG9zZWQgdGhlIFBSIGJlZm9yZSwgYXJlIG5vIGxvbmdlciByZWxldmFudCBhbmQgZGlkIG5vdCBjbG9zZSB0aGUgUFIuXG4gICAgaWYgKGV2ZW50ID09PSAncmVvcGVuZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIGEgYGNsb3NlZGAgZXZlbnQgaXMgY2FwdHVyZWQgd2l0aCBhIGNvbW1pdCBhc3NpZ25lZCwgdGhlbiB3ZSBhc3N1bWUgdGhhdFxuICAgIC8vIHRoaXMgUFIgaGFzIGJlZW4gbWVyZ2VkIHByb3Blcmx5LlxuICAgIGlmIChldmVudCA9PT0gJ2Nsb3NlZCcgJiYgY29tbWl0X2lkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIHJlZmVyZW5jZWQgYnkgYSBjb21taXQsIGNoZWNrIGlmIHRoZSBjb21taXQgY2xvc2VzIHRoaXMgcHVsbFxuICAgIC8vIHJlcXVlc3QuIE5vdGUgdGhhdCB0aGlzIGlzIG5lZWRlZCBiZXNpZGVzIGNoZWNraW5nIGBjbG9zZWRgIGFzIFBScyBjb3VsZCBiZSBtZXJnZWRcbiAgICAvLyBpbnRvIGFueSBub24tZGVmYXVsdCBicmFuY2ggd2hlcmUgdGhlIGBDbG9zZXMgPC4uPmAga2V5d29yZCBkb2VzIG5vdCB3b3JrIGFuZCB0aGUgUFJcbiAgICAvLyBpcyBzaW1wbHkgY2xvc2VkIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBgY29tbWl0X2lkYC4gRm9yIG1vcmUgZGV0YWlscyBzZWU6XG4gICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMjOn46dGV4dD1ub24tZGVmYXVsdC5cbiAgICBpZiAoZXZlbnQgPT09ICdyZWZlcmVuY2VkJyAmJiBjb21taXRfaWQgJiZcbiAgICAgICAgYXdhaXQgaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpLCBjb21taXRfaWQsIGlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGlzIGNsb3NpbmcgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzQ29tbWl0Q2xvc2luZ1B1bGxSZXF1ZXN0KGFwaTogR2l0Q2xpZW50LCBzaGE6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcmVmOiBzaGF9KTtcbiAgLy8gTWF0Y2hlcyB0aGUgY2xvc2luZyBrZXl3b3JkIHN1cHBvcnRlZCBpbiBjb21taXQgbWVzc2FnZXMuIFNlZTpcbiAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMuXG4gIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLm1hdGNoKG5ldyBSZWdFeHAoYGNsb3NlW3NkXT8gIyR7aWR9W14wLTldP2AsICdpJykpO1xufVxuIl19