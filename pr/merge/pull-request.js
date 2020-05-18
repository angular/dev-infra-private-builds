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
        define("@angular/dev-infra-private/pr/merge/pull-request", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/merge/failures", "@angular/dev-infra-private/pr/merge/string-pattern", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var failures_1 = require("@angular/dev-infra-private/pr/merge/failures");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    /**
     * Loads and validates the specified pull request against the given configuration.
     * If the pull requests fails, a pull request failure is returned.
     */
    function loadAndValidatePullRequest(_a, prNumber, ignoreNonFatalFailures) {
        var git = _a.git, config = _a.config;
        if (ignoreNonFatalFailures === void 0) { ignoreNonFatalFailures = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var prData, labels, targetLabel, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetchPullRequestFromGithub(git, prNumber)];
                    case 1:
                        prData = _b.sent();
                        if (prData === null) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notFound()];
                        }
                        labels = prData.labels.map(function (l) { return l.name; });
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.mergeReadyLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.notMergeReady()];
                        }
                        if (!labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.claSignedLabel); })) {
                            return [2 /*return*/, failures_1.PullRequestFailure.claUnsigned()];
                        }
                        targetLabel = target_label_1.getTargetLabelFromPullRequest(config, labels);
                        if (targetLabel === null) {
                            return [2 /*return*/, failures_1.PullRequestFailure.noTargetLabel()];
                        }
                        return [4 /*yield*/, git.api.repos.getCombinedStatusForRef(tslib_1.__assign(tslib_1.__assign({}, git.remoteParams), { ref: prData.head.sha }))];
                    case 2:
                        state = (_b.sent()).data.state;
                        if (state === 'failure' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.failingCiJobs()];
                        }
                        if (state === 'pending' && !ignoreNonFatalFailures) {
                            return [2 /*return*/, failures_1.PullRequestFailure.pendingCiJobs()];
                        }
                        githubTargetBranch = prData.base.ref;
                        requiredBaseSha = config.requiredBaseCommits && config.requiredBaseCommits[githubTargetBranch];
                        needsCommitMessageFixup = !!config.commitMessageFixupLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.commitMessageFixupLabel); });
                        return [2 /*return*/, {
                                prNumber: prNumber,
                                labels: labels,
                                requiredBaseSha: requiredBaseSha,
                                githubTargetBranch: githubTargetBranch,
                                needsCommitMessageFixup: needsCommitMessageFixup,
                                title: prData.title,
                                targetBranches: target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch),
                                commitCount: prData.commits,
                            }];
                }
            });
        });
    }
    exports.loadAndValidatePullRequest = loadAndValidatePullRequest;
    /** Fetches a pull request from Github. Returns null if an error occurred. */
    function fetchPullRequestFromGithub(git, prNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, git.api.pulls.get(tslib_1.__assign(tslib_1.__assign({}, git.remoteParams), { pull_number: prNumber }))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.data];
                    case 2:
                        e_1 = _a.sent();
                        // If the pull request could not be found, we want to return `null` so
                        // that the error can be handled gracefully.
                        if (e_1.status === 404) {
                            return [2 /*return*/, null];
                        }
                        throw e_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    /** Whether the specified value resolves to a pull request. */
    function isPullRequest(v) {
        return v.targetBranches !== undefined;
    }
    exports.isPullRequest = isPullRequest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFJSCx5RUFBOEM7SUFFOUMscUZBQWdEO0lBQ2hELGlGQUF5RjtJQXVCekY7OztPQUdHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQzVDLEVBQW1DLEVBQUUsUUFBZ0IsRUFDckQsc0JBQThCO1lBRDdCLFlBQUcsRUFBRSxrQkFBTTtRQUNaLHVDQUFBLEVBQUEsOEJBQThCOzs7Ozs0QkFDakIscUJBQU0sMEJBQTBCLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxFQUFBOzt3QkFBeEQsTUFBTSxHQUFHLFNBQStDO3dCQUU5RCxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7NEJBQ25CLHNCQUFPLDZCQUFrQixDQUFDLFFBQVEsRUFBRSxFQUFDO3lCQUN0Qzt3QkFFSyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO3dCQUU5QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBNUMsQ0FBNEMsQ0FBQyxFQUFFOzRCQUN0RSxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQTNDLENBQTJDLENBQUMsRUFBRTs0QkFDckUsc0JBQU8sNkJBQWtCLENBQUMsV0FBVyxFQUFFLEVBQUM7eUJBQ3pDO3dCQUVLLFdBQVcsR0FBRyw0Q0FBNkIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ2xFLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTs0QkFDeEIsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUdHLHFCQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHVCQUF1Qix1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBRSxFQUFBOzt3QkFEOUUsS0FBSyxHQUNmLENBQUEsU0FBd0YsQ0FBQSxXQUR6RTt3QkFHbkIsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7NEJBQ2xELHNCQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3lCQUMzQzt3QkFDRCxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxzQkFBc0IsRUFBRTs0QkFDbEQsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUVLLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3dCQUNyQyxlQUFlLEdBQ2pCLE1BQU0sQ0FBQyxtQkFBbUIsSUFBSSxNQUFNLENBQUMsbUJBQW1CLENBQUMsa0JBQWtCLENBQUMsQ0FBQzt3QkFDM0UsdUJBQXVCLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUI7NEJBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsdUJBQXVCLENBQUMsRUFBcEQsQ0FBb0QsQ0FBQyxDQUFDO3dCQUU5RSxzQkFBTztnQ0FDTCxRQUFRLFVBQUE7Z0NBQ1IsTUFBTSxRQUFBO2dDQUNOLGVBQWUsaUJBQUE7Z0NBQ2Ysa0JBQWtCLG9CQUFBO2dDQUNsQix1QkFBdUIseUJBQUE7Z0NBQ3ZCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztnQ0FDbkIsY0FBYyxFQUFFLHlDQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQztnQ0FDM0UsV0FBVyxFQUFFLE1BQU0sQ0FBQyxPQUFPOzZCQUM1QixFQUFDOzs7O0tBQ0g7SUFqREQsZ0VBaURDO0lBRUQsNkVBQTZFO0lBQzdFLFNBQWUsMEJBQTBCLENBQ3JDLEdBQWMsRUFBRSxRQUFnQjs7Ozs7Ozt3QkFFakIscUJBQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyx1Q0FBSyxHQUFHLENBQUMsWUFBWSxLQUFFLFdBQVcsRUFBRSxRQUFRLElBQUUsRUFBQTs7d0JBQTlFLE1BQU0sR0FBRyxTQUFxRTt3QkFDcEYsc0JBQU8sTUFBTSxDQUFDLElBQUksRUFBQzs7O3dCQUVuQixzRUFBc0U7d0JBQ3RFLDRDQUE0Qzt3QkFDNUMsSUFBSSxHQUFDLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRTs0QkFDcEIsc0JBQU8sSUFBSSxFQUFDO3lCQUNiO3dCQUNELE1BQU0sR0FBQyxDQUFDOzs7OztLQUVYO0lBRUQsOERBQThEO0lBQzlELFNBQWdCLGFBQWEsQ0FBQyxDQUFpQztRQUM3RCxPQUFRLENBQWlCLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQztJQUN6RCxDQUFDO0lBRkQsc0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcblxuaW1wb3J0IHtQdWxsUmVxdWVzdEZhaWx1cmV9IGZyb20gJy4vZmFpbHVyZXMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4vZ2l0JztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3R9IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICAgIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBwck51bWJlcjogbnVtYmVyLFxuICAgIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSk6IFByb21pc2U8UHVsbFJlcXVlc3R8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm1hcChsID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICBpZiAodGFyZ2V0TGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vVGFyZ2V0TGFiZWwoKTtcbiAgfVxuXG4gIGNvbnN0IHtkYXRhOiB7c3RhdGV9fSA9XG4gICAgICBhd2FpdCBnaXQuYXBpLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKHsuLi5naXQucmVtb3RlUGFyYW1zLCByZWY6IHByRGF0YS5oZWFkLnNoYX0pO1xuXG4gIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAncGVuZGluZycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlLnJlZjtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID0gISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG5cbiAgcmV0dXJuIHtcbiAgICBwck51bWJlcixcbiAgICBsYWJlbHMsXG4gICAgcmVxdWlyZWRCYXNlU2hhLFxuICAgIGdpdGh1YlRhcmdldEJyYW5jaCxcbiAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCxcbiAgICB0aXRsZTogcHJEYXRhLnRpdGxlLFxuICAgIHRhcmdldEJyYW5jaGVzOiBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCh0YXJnZXRMYWJlbCwgZ2l0aHViVGFyZ2V0QnJhbmNoKSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMsXG4gIH07XG59XG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgICBnaXQ6IEdpdENsaWVudCwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8T2N0b2tpdC5QdWxsc0dldFJlc3BvbnNlfG51bGw+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnaXQuYXBpLnB1bGxzLmdldCh7Li4uZ2l0LnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSk7XG4gICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuIl19