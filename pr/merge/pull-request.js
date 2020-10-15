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
    exports.isPullRequest = exports.loadAndValidatePullRequest = void 0;
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
            var prData, labels, targetLabel, state, githubTargetBranch, requiredBaseSha, needsCommitMessageFixup, hasCaretakerNote, targetBranches, error_1;
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
                        return [4 /*yield*/, git.github.repos.getCombinedStatusForRef(tslib_1.__assign(tslib_1.__assign({}, git.remoteParams), { ref: prData.head.sha }))];
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
                        hasCaretakerNote = !!config.caretakerNoteLabel &&
                            labels.some(function (name) { return string_pattern_1.matchesPattern(name, config.caretakerNoteLabel); });
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                    case 4:
                        targetBranches = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        if (error_1 instanceof target_label_1.InvalidTargetBranchError || error_1 instanceof target_label_1.InvalidTargetLabelError) {
                            return [2 /*return*/, new failures_1.PullRequestFailure(error_1.failureMessage)];
                        }
                        throw error_1;
                    case 6: return [2 /*return*/, {
                            url: prData.html_url,
                            prNumber: prNumber,
                            labels: labels,
                            requiredBaseSha: requiredBaseSha,
                            githubTargetBranch: githubTargetBranch,
                            needsCommitMessageFixup: needsCommitMessageFixup,
                            hasCaretakerNote: hasCaretakerNote,
                            targetBranches: targetBranches,
                            title: prData.title,
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
                        return [4 /*yield*/, git.github.pulls.get(tslib_1.__assign(tslib_1.__assign({}, git.remoteParams), { pull_number: prNumber }))];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUgseUVBQThDO0lBQzlDLHFGQUFnRDtJQUNoRCxpRkFBNEk7SUEyQjVJOzs7T0FHRztJQUNILFNBQXNCLDBCQUEwQixDQUM1QyxFQUFtQyxFQUFFLFFBQWdCLEVBQ3JELHNCQUE4QjtZQUQ3QixHQUFHLFNBQUEsRUFBRSxNQUFNLFlBQUE7UUFDWix1Q0FBQSxFQUFBLDhCQUE4Qjs7Ozs7NEJBQ2pCLHFCQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELE1BQU0sR0FBRyxTQUErQzt3QkFFOUQsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFOzRCQUNuQixzQkFBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBQzt5QkFDdEM7d0JBRUssTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQzt3QkFFOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQTVDLENBQTRDLENBQUMsRUFBRTs0QkFDdEUsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLEVBQUU7NEJBQ3JFLHNCQUFPLDZCQUFrQixDQUFD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QzlELFNBQWdCLGFBQWEsQ0FBQyxDQUFpQztRQUM3RCxPQUFRLENBQWlCLENBQUMsY0FBYyxLQUFLLFNBQVMsQ0FBQztJQUN6RCxDQUFDO0lBRkQsc0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgT2N0b2tpdCBmcm9tICdAb2N0b2tpdC9yZXN0JztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5cbmltcG9ydCB7UHVsbFJlcXVlc3RGYWlsdXJlfSBmcm9tICcuL2ZhaWx1cmVzJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QsIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4vdGFyZ2V0LWxhYmVsJztcbmltcG9ydCB7UHVsbFJlcXVlc3RNZXJnZVRhc2t9IGZyb20gJy4vdGFzayc7XG5cbi8qKiBJbnRlcmZhY2UgdGhhdCBkZXNjcmliZXMgYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVSTCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIE51bWJlciBvZiB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBwck51bWJlcjogbnVtYmVyO1xuICAvKiogVGl0bGUgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdGl0bGU6IHN0cmluZztcbiAgLyoqIExhYmVscyBhcHBsaWVkIHRvIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIGxhYmVsczogc3RyaW5nW107XG4gIC8qKiBMaXN0IG9mIGJyYW5jaGVzIHRoaXMgUFIgc2hvdWxkIGJlIG1lcmdlZCBpbnRvLiAqL1xuICB0YXJnZXRCcmFuY2hlczogc3RyaW5nW107XG4gIC8qKiBCcmFuY2ggdGhhdCB0aGUgUFIgdGFyZ2V0cyBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZztcbiAgLyoqIENvdW50IG9mIGNvbW1pdHMgaW4gdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGNvbW1pdENvdW50OiBudW1iZXI7XG4gIC8qKiBPcHRpb25hbCBTSEEgdGhhdCB0aGlzIHB1bGwgcmVxdWVzdCBuZWVkcyB0byBiZSBiYXNlZCBvbi4gKi9cbiAgcmVxdWlyZWRCYXNlU2hhPzogc3RyaW5nO1xuICAvKiogV2hldGhlciB0aGUgcHVsbCByZXF1ZXN0IGNvbW1pdCBtZXNzYWdlIGZpeHVwLiAqL1xuICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cDogYm9vbGVhbjtcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZS4gKi9cbiAgaGFzQ2FyZXRha2VyTm90ZTogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBMb2FkcyBhbmQgdmFsaWRhdGVzIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGFnYWluc3QgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24uXG4gKiBJZiB0aGUgcHVsbCByZXF1ZXN0cyBmYWlscywgYSBwdWxsIHJlcXVlc3QgZmFpbHVyZSBpcyByZXR1cm5lZC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRBbmRWYWxpZGF0ZVB1bGxSZXF1ZXN0KFxuICAgIHtnaXQsIGNvbmZpZ306IFB1bGxSZXF1ZXN0TWVyZ2VUYXNrLCBwck51bWJlcjogbnVtYmVyLFxuICAgIGlnbm9yZU5vbkZhdGFsRmFpbHVyZXMgPSBmYWxzZSk6IFByb21pc2U8UHVsbFJlcXVlc3R8UHVsbFJlcXVlc3RGYWlsdXJlPiB7XG4gIGNvbnN0IHByRGF0YSA9IGF3YWl0IGZldGNoUHVsbFJlcXVlc3RGcm9tR2l0aHViKGdpdCwgcHJOdW1iZXIpO1xuXG4gIGlmIChwckRhdGEgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdEZvdW5kKCk7XG4gIH1cblxuICBjb25zdCBsYWJlbHMgPSBwckRhdGEubGFiZWxzLm1hcChsID0+IGwubmFtZSk7XG5cbiAgaWYgKCFsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5tZXJnZVJlYWR5TGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUubm90TWVyZ2VSZWFkeSgpO1xuICB9XG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2xhU2lnbmVkTGFiZWwpKSkge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuY2xhVW5zaWduZWQoKTtcbiAgfVxuXG4gIGNvbnN0IHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICBpZiAodGFyZ2V0TGFiZWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vVGFyZ2V0TGFiZWwoKTtcbiAgfVxuXG4gIGNvbnN0IHtkYXRhOiB7c3RhdGV9fSA9XG4gICAgICBhd2FpdCBnaXQuZ2l0aHViLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKHsuLi5naXQucmVtb3RlUGFyYW1zLCByZWY6IHByRGF0YS5oZWFkLnNoYX0pO1xuXG4gIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5mYWlsaW5nQ2lKb2JzKCk7XG4gIH1cbiAgaWYgKHN0YXRlID09PSAncGVuZGluZycgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLnBlbmRpbmdDaUpvYnMoKTtcbiAgfVxuXG4gIGNvbnN0IGdpdGh1YlRhcmdldEJyYW5jaCA9IHByRGF0YS5iYXNlLnJlZjtcbiAgY29uc3QgcmVxdWlyZWRCYXNlU2hhID1cbiAgICAgIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzICYmIGNvbmZpZy5yZXF1aXJlZEJhc2VDb21taXRzW2dpdGh1YlRhcmdldEJyYW5jaF07XG4gIGNvbnN0IG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwID0gISFjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsKSk7XG4gIGNvbnN0IGhhc0NhcmV0YWtlck5vdGUgPSAhIWNvbmZpZy5jYXJldGFrZXJOb3RlTGFiZWwgJiZcbiAgICAgIGxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCEpKTtcbiAgbGV0IHRhcmdldEJyYW5jaGVzOiBzdHJpbmdbXTtcblxuICAvLyBJZiBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBmb3IgYSBnaXZlbiB0YXJnZXQgbGFiZWwsIGNhcHR1cmUgZXJyb3JzIHRoYXQgYXJlXG4gIC8vIHRocm93biBhcyBwYXJ0IG9mIGJyYW5jaCBjb21wdXRhdGlvbi4gVGhpcyBpcyBleHBlY3RlZCBiZWNhdXNlIGEgbWVyZ2UgY29uZmlndXJhdGlvblxuICAvLyBjYW4gbGF6aWx5IGNvbXB1dGUgYnJhbmNoZXMgZm9yIGEgdGFyZ2V0IGxhYmVsIGFuZCB0aHJvdy4gZS5nLiBpZiBhbiBpbnZhbGlkIHRhcmdldFxuICAvLyBsYWJlbCBpcyBhcHBsaWVkLCB3ZSB3YW50IHRvIGV4aXQgdGhlIHNjcmlwdCBncmFjZWZ1bGx5IHdpdGggYW4gZXJyb3IgbWVzc2FnZS5cbiAgdHJ5IHtcbiAgICB0YXJnZXRCcmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB8fCBlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB1cmw6IHByRGF0YS5odG1sX3VybCxcbiAgICBwck51bWJlcixcbiAgICBsYWJlbHMsXG4gICAgcmVxdWlyZWRCYXNlU2hhLFxuICAgIGdpdGh1YlRhcmdldEJyYW5jaCxcbiAgICBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCxcbiAgICBoYXNDYXJldGFrZXJOb3RlLFxuICAgIHRhcmdldEJyYW5jaGVzLFxuICAgIHRpdGxlOiBwckRhdGEudGl0bGUsXG4gICAgY29tbWl0Q291bnQ6IHByRGF0YS5jb21taXRzLFxuICB9O1xufVxuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoXG4gICAgZ2l0OiBHaXRDbGllbnQsIHByTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPE9jdG9raXQuUHVsbHNHZXRSZXNwb25zZXxudWxsPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2l0LmdpdGh1Yi5wdWxscy5nZXQoey4uLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kLCB3ZSB3YW50IHRvIHJldHVybiBgbnVsbGAgc29cbiAgICAvLyB0aGF0IHRoZSBlcnJvciBjYW4gYmUgaGFuZGxlZCBncmFjZWZ1bGx5LlxuICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIHJlc29sdmVzIHRvIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3QodjogUHVsbFJlcXVlc3RGYWlsdXJlfFB1bGxSZXF1ZXN0KTogdiBpcyBQdWxsUmVxdWVzdCB7XG4gIHJldHVybiAodiBhcyBQdWxsUmVxdWVzdCkudGFyZ2V0QnJhbmNoZXMgIT09IHVuZGVmaW5lZDtcbn1cbiJdfQ==