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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LXN0YXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9wdWxsLXJlcXVlc3Qtc3RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUtILHNDQUFzQztJQUN0QyxJQUFNLG9CQUFvQixHQUFHLEtBQUssQ0FBQztJQUtuQyx5REFBeUQ7SUFDekQsU0FBc0IsbUJBQW1CLENBQ3JDLEdBQXVCLEVBQUUsRUFBVTs7Ozs7NEJBQ3RCLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsRUFBRSxJQUFFLEVBQUE7O3dCQUExRSxJQUFJLEdBQUksQ0FBQSxTQUFrRSxDQUFBLEtBQXRFO3dCQUNYLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTs0QkFDZixzQkFBTyxRQUFRLEVBQUM7eUJBQ2pCOzZCQUtHLENBQUEsSUFBSSxDQUFDLFNBQVMsS0FBSyxJQUFJOzRCQUN2QixDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsb0JBQW9CLENBQUMsQ0FBQSxFQUR4RSx3QkFDd0U7d0JBQ25FLHFCQUFNLHVDQUF1QyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsRUFBQTs0QkFBN0Qsc0JBQU8sQ0FBQSxTQUFzRCxFQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBQzs0QkFFdEYsc0JBQU8sTUFBTSxFQUFDOzs7O0tBQ2Y7SUFmRCxrREFlQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZSx1Q0FBdUMsQ0FBQyxHQUF1QixFQUFFLEVBQVU7Ozs7Ozt3QkFDbEYsT0FBTyxHQUNULEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyx1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLFlBQVksRUFBRSxFQUFFLElBQUUsQ0FBQzt3QkFDeEMscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUE7O3dCQUE3RSxNQUFNLEdBQXFDLFNBQWtDO3dCQUsxRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDOzs7NkJBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxDQUFBO3dCQUM5QixLQUFxQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQTdCLGtCQUFLLEVBQUUsU0FBUyxlQUFBLENBQWM7d0JBQ3JDLHFGQUFxRjt3QkFDckYsc0ZBQXNGO3dCQUN0RixJQUFJLE9BQUssS0FBSyxVQUFVLEVBQUU7NEJBQ3hCLHNCQUFPLEtBQUssRUFBQzt5QkFDZDt3QkFDRCw4RUFBOEU7d0JBQzlFLG9DQUFvQzt3QkFDcEMsSUFBSSxPQUFLLEtBQUssUUFBUSxJQUFJLFNBQVMsRUFBRTs0QkFDbkMsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQU1HLEtBQUEsT0FBSyxLQUFLLFlBQVksSUFBSSxTQUFTLENBQUE7aUNBQW5DLHdCQUFtQzt3QkFDbkMscUJBQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFNBQVMsRUFBRSxFQUFFLENBQUMsRUFBQTs7OEJBQXBELFNBQW9EOzs7d0JBTnhELGtGQUFrRjt3QkFDbEYscUZBQXFGO3dCQUNyRix1RkFBdUY7d0JBQ3ZGLDRFQUE0RTt3QkFDNUUseUlBQXlJO3dCQUN6SSxRQUMwRDs0QkFDeEQsc0JBQU8sSUFBSSxFQUFDO3lCQUNiOzs7d0JBcEJxQyxDQUFDLEVBQUUsQ0FBQTs7NEJBc0IzQyxzQkFBTyxLQUFLLEVBQUM7Ozs7S0FDZDtJQUVELDZFQUE2RTtJQUM3RSxTQUFlLDBCQUEwQixDQUFDLEdBQXVCLEVBQUUsR0FBVyxFQUFFLEVBQVU7Ozs7OzRCQUN6RSxxQkFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsR0FBRyxFQUFFLEdBQUcsSUFBRSxFQUFBOzt3QkFBekUsSUFBSSxHQUFJLENBQUEsU0FBaUUsQ0FBQSxLQUFyRTt3QkFDWCxpRUFBaUU7d0JBQ2pFLHFIQUFxSDt3QkFDckgsc0JBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUM1QixJQUFJLE1BQU0sQ0FBQyxrREFBZ0QsRUFBRSxZQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBQzs7OztLQUNuRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBPY3Rva2l0IGZyb20gJ0BvY3Rva2l0L3Jlc3QnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5cbi8qKiBUaGlydHkgc2Vjb25kcyBpbiBtaWxsaXNlY29uZHMuICovXG5jb25zdCBUSElSVFlfU0VDT05EU19JTl9NUyA9IDMwMDAwO1xuXG4vKiogU3RhdGUgb2YgYSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuZXhwb3J0IHR5cGUgUHVsbFJlcXVlc3RTdGF0ZSA9ICdtZXJnZWQnfCdjbG9zZWQnfCdvcGVuJztcblxuLyoqIEdldHMgd2hldGhlciBhIGdpdmVuIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UHVsbFJlcXVlc3RTdGF0ZShcbiAgICBhcGk6IEdpdENsaWVudDxib29sZWFuPiwgaWQ6IG51bWJlcik6IFByb21pc2U8UHVsbFJlcXVlc3RTdGF0ZT4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnB1bGxzLmdldCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IGlkfSk7XG4gIGlmIChkYXRhLm1lcmdlZCkge1xuICAgIHJldHVybiAnbWVyZ2VkJztcbiAgfVxuICAvLyBDaGVjayBpZiB0aGUgUFIgd2FzIGNsb3NlZCBtb3JlIHRoYW4gMzAgc2Vjb25kcyBhZ28sIHRoaXMgZXh0cmEgdGltZSBnaXZlcyBHaXRodWIgdGltZSB0b1xuICAvLyB1cGRhdGUgdGhlIGNsb3NlZCBwdWxsIHJlcXVlc3QgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIHRoZSBjbG9zaW5nIGNvbW1pdC5cbiAgLy8gTm90ZTogYSBEYXRlIGNvbnN0cnVjdGVkIHdpdGggYG51bGxgIGNyZWF0ZXMgYW4gb2JqZWN0IGF0IDAgdGltZSwgd2hpY2ggd2lsbCBuZXZlciBiZSBncmVhdGVyXG4gIC8vIHRoYW4gdGhlIGN1cnJlbnQgZGF0ZSB0aW1lLlxuICBpZiAoZGF0YS5jbG9zZWRfYXQgIT09IG51bGwgJiZcbiAgICAgIChuZXcgRGF0ZShkYXRhLmNsb3NlZF9hdCkuZ2V0VGltZSgpIDwgRGF0ZS5ub3coKSAtIFRISVJUWV9TRUNPTkRTX0lOX01TKSkge1xuICAgIHJldHVybiBhd2FpdCBpc1B1bGxSZXF1ZXN0Q2xvc2VkV2l0aEFzc29jaWF0ZWRDb21taXQoYXBpLCBpZCkgPyAnbWVyZ2VkJyA6ICdjbG9zZWQnO1xuICB9XG4gIHJldHVybiAnb3Blbic7XG59XG5cbi8qKlxuICogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNsb3NlZCB3aXRoIGFuIGFzc29jaWF0ZWQgY29tbWl0LiBUaGlzIGlzIHVzdWFsbHlcbiAqIHRoZSBjYXNlIGlmIGEgUFIgaGFzIGJlZW4gbWVyZ2VkIHVzaW5nIHRoZSBhdXRvc3F1YXNoIG1lcmdlIHNjcmlwdCBzdHJhdGVneS4gU2luY2VcbiAqIHRoZSBtZXJnZSBpcyBub3QgZmFzdC1mb3J3YXJkLCBHaXRodWIgZG9lcyBub3QgY29uc2lkZXIgdGhlIFBSIGFzIG1lcmdlZCBhbmQgaW5zdGVhZFxuICogc2hvd3MgdGhlIFBSIGFzIGNsb3NlZC4gU2VlIGZvciBleGFtcGxlOiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL3B1bGwvMzc5MTguXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3RDbG9zZWRXaXRoQXNzb2NpYXRlZENvbW1pdChhcGk6IEdpdENsaWVudDxib29sZWFuPiwgaWQ6IG51bWJlcikge1xuICBjb25zdCByZXF1ZXN0ID1cbiAgICAgIGFwaS5naXRodWIuaXNzdWVzLmxpc3RFdmVudHMuZW5kcG9pbnQubWVyZ2Uoey4uLmFwaS5yZW1vdGVQYXJhbXMsIGlzc3VlX251bWJlcjogaWR9KTtcbiAgY29uc3QgZXZlbnRzOiBPY3Rva2l0Lklzc3Vlc0xpc3RFdmVudHNSZXNwb25zZSA9IGF3YWl0IGFwaS5naXRodWIucGFnaW5hdGUocmVxdWVzdCk7XG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgZXZlbnRzIG9mIHRoZSBwdWxsIHJlcXVlc3QgaW4gcmV2ZXJzZS4gV2Ugd2FudCB0byBmaW5kIHRoZSBtb3N0XG4gIC8vIHJlY2VudCBldmVudHMgYW5kIGNoZWNrIGlmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgd2l0aCBhIGNvbW1pdCBhc3NvY2lhdGVkIHdpdGggaXQuXG4gIC8vIElmIHRoZSBQUiBoYXMgYmVlbiBjbG9zZWQgdGhyb3VnaCBhIGNvbW1pdCwgd2UgYXNzdW1lIHRoYXQgdGhlIFBSIGhhcyBiZWVuIG1lcmdlZFxuICAvLyB1c2luZyB0aGUgYXV0b3NxdWFzaCBtZXJnZSBzdHJhdGVneS4gRm9yIG1vcmUgZGV0YWlscy4gU2VlIHRoZSBgQXV0b3NxdWFzaE1lcmdlU3RyYXRlZ3lgLlxuICBmb3IgKGxldCBpID0gZXZlbnRzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgY29uc3Qge2V2ZW50LCBjb21taXRfaWR9ID0gZXZlbnRzW2ldO1xuICAgIC8vIElmIHdlIGNvbWUgYWNyb3NzIGEgXCJyZW9wZW5lZFwiIGV2ZW50LCB3ZSBhYm9ydCBsb29raW5nIGZvciByZWZlcmVuY2VkIGNvbW1pdHMuIEFueVxuICAgIC8vIGNvbW1pdHMgdGhhdCBjbG9zZWQgdGhlIFBSIGJlZm9yZSwgYXJlIG5vIGxvbmdlciByZWxldmFudCBhbmQgZGlkIG5vdCBjbG9zZSB0aGUgUFIuXG4gICAgaWYgKGV2ZW50ID09PSAncmVvcGVuZWQnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIElmIGEgYGNsb3NlZGAgZXZlbnQgaXMgY2FwdHVyZWQgd2l0aCBhIGNvbW1pdCBhc3NpZ25lZCwgdGhlbiB3ZSBhc3N1bWUgdGhhdFxuICAgIC8vIHRoaXMgUFIgaGFzIGJlZW4gbWVyZ2VkIHByb3Blcmx5LlxuICAgIGlmIChldmVudCA9PT0gJ2Nsb3NlZCcgJiYgY29tbWl0X2lkKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIFBSIGhhcyBiZWVuIHJlZmVyZW5jZWQgYnkgYSBjb21taXQsIGNoZWNrIGlmIHRoZSBjb21taXQgY2xvc2VzIHRoaXMgcHVsbFxuICAgIC8vIHJlcXVlc3QuIE5vdGUgdGhhdCB0aGlzIGlzIG5lZWRlZCBiZXNpZGVzIGNoZWNraW5nIGBjbG9zZWRgIGFzIFBScyBjb3VsZCBiZSBtZXJnZWRcbiAgICAvLyBpbnRvIGFueSBub24tZGVmYXVsdCBicmFuY2ggd2hlcmUgdGhlIGBDbG9zZXMgPC4uPmAga2V5d29yZCBkb2VzIG5vdCB3b3JrIGFuZCB0aGUgUFJcbiAgICAvLyBpcyBzaW1wbHkgY2xvc2VkIHdpdGhvdXQgYW4gYXNzb2NpYXRlZCBgY29tbWl0X2lkYC4gRm9yIG1vcmUgZGV0YWlscyBzZWU6XG4gICAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMjOn46dGV4dD1ub24tZGVmYXVsdC5cbiAgICBpZiAoZXZlbnQgPT09ICdyZWZlcmVuY2VkJyAmJiBjb21taXRfaWQgJiZcbiAgICAgICAgYXdhaXQgaXNDb21taXRDbG9zaW5nUHVsbFJlcXVlc3QoYXBpLCBjb21taXRfaWQsIGlkKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY29tbWl0IGlzIGNsb3NpbmcgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGlzQ29tbWl0Q2xvc2luZ1B1bGxSZXF1ZXN0KGFwaTogR2l0Q2xpZW50PGJvb2xlYW4+LCBzaGE6IHN0cmluZywgaWQ6IG51bWJlcikge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCBhcGkuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4uYXBpLnJlbW90ZVBhcmFtcywgcmVmOiBzaGF9KTtcbiAgLy8gTWF0Y2hlcyB0aGUgY2xvc2luZyBrZXl3b3JkIHN1cHBvcnRlZCBpbiBjb21taXQgbWVzc2FnZXMuIFNlZTpcbiAgLy8gaHR0cHM6Ly9kb2NzLmdpdGh1Yi5jb20vZW4vZW50ZXJwcmlzZS8yLjE2L3VzZXIvZ2l0aHViL21hbmFnaW5nLXlvdXItd29yay1vbi1naXRodWIvY2xvc2luZy1pc3N1ZXMtdXNpbmcta2V5d29yZHMuXG4gIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLm1hdGNoKFxuICAgICAgbmV3IFJlZ0V4cChgKD86Y2xvc2Vbc2RdP3xmaXgoPzplW3NkXT8pfHJlc29sdmVbc2RdPyk6PyAjJHtpZH0oPyFcXFxcZClgLCAnaScpKTtcbn1cbiJdfQ==