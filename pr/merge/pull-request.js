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
                        try {
                            targetLabel = target_label_1.getTargetLabelFromPullRequest(config, labels);
                        }
                        catch (error) {
                            if (error instanceof target_label_1.InvalidTargetLabelError) {
                                return [2 /*return*/, new failures_1.PullRequestFailure(error.failureMessage)];
                            }
                            throw error;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBT0gseUVBQThDO0lBQzlDLHFGQUFnRDtJQUNoRCxpRkFBNEk7SUEyQjVJOzs7T0FHRztJQUNILFNBQXNCLDBCQUEwQixDQUM1QyxFQUFtQyxFQUFFLFFBQWdCLEVBQ3JELHNCQUE4QjtZQUQ3QixHQUFHLFNBQUEsRUFBRSxNQUFNLFlBQUE7UUFDWix1Q0FBQSxFQUFBLDhCQUE4Qjs7Ozs7NEJBQ2pCLHFCQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELE1BQU0sR0FBRyxTQUErQzt3QkFFOUQsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFOzRCQUNuQixzQkFBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBQzt5QkFDdEM7d0JBRUssTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQzt3QkFFOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQTVDLENBQTRDLENBQUMsRUFBRTs0QkFDdEUsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLEVBQUU7NEJBQ3JFLHNCQUFPLDZCQUFrQixDQUFDLFdBQVcsRUFBRSxFQUFDO3lCQUN6Qzt3QkFHRCxJQUFJOzRCQUNGLFdBQVcsR0FBRyw0Q0FBNkIsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7eUJBQzdEO3dCQUFDLE9BQU8sS0FBSyxFQUFFOzRCQUNkLElBQUksS0FBSyxZQUFZLHNDQUF1QixFQUFFO2dDQUM1QyxzQkFBTyxJQUFJLDZCQUFrQixDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsRUFBQzs2QkFDckQ7NEJBQ0QsTUFBTSxLQUFLLENBQUM7eUJBQ2I7d0JBR0cscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLHVDQUFLLEdBQUcsQ0FBQyxZQUFZLEtBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFFLEVBQUE7O3dCQURqRixLQUFLLEdBQ2YsQ0FBQSxTQUEyRixDQUFBLFdBRDVFO3dCQUduQixJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksQ0FBQyxzQkFBc0IsRUFBRTs0QkFDbEQsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUNELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixFQUFFOzRCQUNsRCxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBRUssa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBQ3JDLGVBQWUsR0FDakIsTUFBTSxDQUFDLG1CQUFtQixJQUFJLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO3dCQUMzRSx1QkFBdUIsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLHVCQUF1Qjs0QkFDNUQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLCtCQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxFQUFwRCxDQUFvRCxDQUFDLENBQUM7d0JBQ3hFLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsa0JBQWtCOzRCQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGtCQUFtQixDQUFDLEVBQWhELENBQWdELENBQUMsQ0FBQzs7Ozt3QkFRdkQscUJBQU0seUNBQTBCLENBQUMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLEVBQUE7O3dCQUFsRixjQUFjLEdBQUcsU0FBaUUsQ0FBQzs7Ozt3QkFFbkYsSUFBSSxPQUFLLFlBQVksdUNBQXdCLElBQUksT0FBSyxZQUFZLHNDQUF1QixFQUFFOzRCQUN6RixzQkFBTyxJQUFJLDZCQUFrQixDQUFDLE9BQUssQ0FBQyxjQUFjLENBQUMsRUFBQzt5QkFDckQ7d0JBQ0QsTUFBTSxPQUFLLENBQUM7NEJBR2Qsc0JBQU87NEJBQ0wsR0FBRyxFQUFFLE1BQU0sQ0FBQyxRQUFROzRCQUNwQixRQUFRLFVBQUE7NEJBQ1IsTUFBTSxRQUFBOzRCQUNOLGVBQWUsaUJBQUE7NEJBQ2Ysa0JBQWtCLG9CQUFBOzRCQUNsQix1QkFBdUIseUJBQUE7NEJBQ3ZCLGdCQUFnQixrQkFBQTs0QkFDaEIsY0FBYyxnQkFBQTs0QkFDZCxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7NEJBQ25CLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTzt5QkFDNUIsRUFBQzs7OztLQUNIO0lBeEVELGdFQXdFQztJQUVELDZFQUE2RTtJQUM3RSxTQUFlLDBCQUEwQixDQUNyQyxHQUFjLEVBQUUsUUFBZ0I7Ozs7Ozs7d0JBRWpCLHFCQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsUUFBUSxJQUFFLEVBQUE7O3dCQUFqRixNQUFNLEdBQUcsU0FBd0U7d0JBQ3ZGLHNCQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUM7Ozt3QkFFbkIsc0VBQXNFO3dCQUN0RSw0Q0FBNEM7d0JBQzVDLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7NEJBQ3BCLHNCQUFPLElBQUksRUFBQzt5QkFDYjt3QkFDRCxNQUFNLEdBQUMsQ0FBQzs7Ozs7S0FFWDtJQUVELDhEQUE4RDtJQUM5RCxTQUFnQixhQUFhLENBQUMsQ0FBaUM7UUFDN0QsT0FBUSxDQUFpQixDQUFDLGNBQWMsS0FBSyxTQUFTLENBQUM7SUFDekQsQ0FBQztJQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuXG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LCBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IsIEludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVUkwgdG8gdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJOdW1iZXI6IG51bWJlcjtcbiAgLyoqIFRpdGxlIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBMYWJlbHMgYXBwbGllZCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICAvKiogTGlzdCBvZiBicmFuY2hlcyB0aGlzIFBSIHNob3VsZCBiZSBtZXJnZWQgaW50by4gKi9cbiAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuICAvKiogQnJhbmNoIHRoYXQgdGhlIFBSIHRhcmdldHMgaW4gdGhlIEdpdGh1YiBVSS4gKi9cbiAgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmc7XG4gIC8qKiBDb3VudCBvZiBjb21taXRzIGluIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBjb21taXRDb3VudDogbnVtYmVyO1xuICAvKiogT3B0aW9uYWwgU0hBIHRoYXQgdGhpcyBwdWxsIHJlcXVlc3QgbmVlZHMgdG8gYmUgYmFzZWQgb24uICovXG4gIHJlcXVpcmVkQmFzZVNoYT86IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBjb21taXQgbWVzc2FnZSBmaXh1cC4gKi9cbiAgbmVlZHNDb21taXRNZXNzYWdlRml4dXA6IGJvb2xlYW47XG4gIC8qKiBXaGV0aGVyIHRoZSBwdWxsIHJlcXVlc3QgaGFzIGEgY2FyZXRha2VyIG5vdGUuICovXG4gIGhhc0NhcmV0YWtlck5vdGU6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTG9hZHMgYW5kIHZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBhZ2FpbnN0IHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICogSWYgdGhlIHB1bGwgcmVxdWVzdHMgZmFpbHMsIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdChcbiAgICB7Z2l0LCBjb25maWd9OiBQdWxsUmVxdWVzdE1lcmdlVGFzaywgcHJOdW1iZXI6IG51bWJlcixcbiAgICBpZ25vcmVOb25GYXRhbEZhaWx1cmVzID0gZmFsc2UpOiBQcm9taXNlPFB1bGxSZXF1ZXN0fFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICBjb25zdCBwckRhdGEgPSBhd2FpdCBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihnaXQsIHByTnVtYmVyKTtcblxuICBpZiAocHJEYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RGb3VuZCgpO1xuICB9XG5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5tYXAobCA9PiBsLm5hbWUpO1xuXG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdE1lcmdlUmVhZHkoKTtcbiAgfVxuICBpZiAoIWxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNsYVNpZ25lZExhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG4gIH1cblxuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoY29uZmlnLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICByZXR1cm4gbmV3IFB1bGxSZXF1ZXN0RmFpbHVyZShlcnJvci5mYWlsdXJlTWVzc2FnZSk7XG4gICAgfVxuICAgIHRocm93IGVycm9yO1xuICB9XG5cbiAgY29uc3Qge2RhdGE6IHtzdGF0ZX19ID1cbiAgICAgIGF3YWl0IGdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoey4uLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogcHJEYXRhLmhlYWQuc2hhfSk7XG5cbiAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScgJiYgIWlnbm9yZU5vbkZhdGFsRmFpbHVyZXMpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmZhaWxpbmdDaUpvYnMoKTtcbiAgfVxuICBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUucGVuZGluZ0NpSm9icygpO1xuICB9XG5cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2UucmVmO1xuICBjb25zdCByZXF1aXJlZEJhc2VTaGEgPVxuICAgICAgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHMgJiYgY29uZmlnLnJlcXVpcmVkQmFzZUNvbW1pdHNbZ2l0aHViVGFyZ2V0QnJhbmNoXTtcbiAgY29uc3QgbmVlZHNDb21taXRNZXNzYWdlRml4dXAgPSAhIWNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY29tbWl0TWVzc2FnZUZpeHVwTGFiZWwpKTtcbiAgY29uc3QgaGFzQ2FyZXRha2VyTm90ZSA9ICEhY29uZmlnLmNhcmV0YWtlck5vdGVMYWJlbCAmJlxuICAgICAgbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcuY2FyZXRha2VyTm90ZUxhYmVsISkpO1xuICBsZXQgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuXG4gIC8vIElmIGJyYW5jaGVzIGFyZSBkZXRlcm1pbmVkIGZvciBhIGdpdmVuIHRhcmdldCBsYWJlbCwgY2FwdHVyZSBlcnJvcnMgdGhhdCBhcmVcbiAgLy8gdGhyb3duIGFzIHBhcnQgb2YgYnJhbmNoIGNvbXB1dGF0aW9uLiBUaGlzIGlzIGV4cGVjdGVkIGJlY2F1c2UgYSBtZXJnZSBjb25maWd1cmF0aW9uXG4gIC8vIGNhbiBsYXppbHkgY29tcHV0ZSBicmFuY2hlcyBmb3IgYSB0YXJnZXQgbGFiZWwgYW5kIHRocm93LiBlLmcuIGlmIGFuIGludmFsaWQgdGFyZ2V0XG4gIC8vIGxhYmVsIGlzIGFwcGxpZWQsIHdlIHdhbnQgdG8gZXhpdCB0aGUgc2NyaXB0IGdyYWNlZnVsbHkgd2l0aCBhbiBlcnJvciBtZXNzYWdlLlxuICB0cnkge1xuICAgIHRhcmdldEJyYW5jaGVzID0gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yIHx8IGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFRhcmdldExhYmVsRXJyb3IpIHtcbiAgICAgIHJldHVybiBuZXcgUHVsbFJlcXVlc3RGYWlsdXJlKGVycm9yLmZhaWx1cmVNZXNzYWdlKTtcbiAgICB9XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHVybDogcHJEYXRhLmh0bWxfdXJsLFxuICAgIHByTnVtYmVyLFxuICAgIGxhYmVscyxcbiAgICByZXF1aXJlZEJhc2VTaGEsXG4gICAgZ2l0aHViVGFyZ2V0QnJhbmNoLFxuICAgIG5lZWRzQ29tbWl0TWVzc2FnZUZpeHVwLFxuICAgIGhhc0NhcmV0YWtlck5vdGUsXG4gICAgdGFyZ2V0QnJhbmNoZXMsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICBjb21taXRDb3VudDogcHJEYXRhLmNvbW1pdHMsXG4gIH07XG59XG5cbi8qKiBGZXRjaGVzIGEgcHVsbCByZXF1ZXN0IGZyb20gR2l0aHViLiBSZXR1cm5zIG51bGwgaWYgYW4gZXJyb3Igb2NjdXJyZWQuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihcbiAgICBnaXQ6IEdpdENsaWVudCwgcHJOdW1iZXI6IG51bWJlcik6IFByb21pc2U8T2N0b2tpdC5QdWxsc0dldFJlc3BvbnNlfG51bGw+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnaXQuZ2l0aHViLnB1bGxzLmdldCh7Li4uZ2l0LnJlbW90ZVBhcmFtcywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSk7XG4gICAgcmV0dXJuIHJlc3VsdC5kYXRhO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWYgdGhlIHB1bGwgcmVxdWVzdCBjb3VsZCBub3QgYmUgZm91bmQsIHdlIHdhbnQgdG8gcmV0dXJuIGBudWxsYCBzb1xuICAgIC8vIHRoYXQgdGhlIGVycm9yIGNhbiBiZSBoYW5kbGVkIGdyYWNlZnVsbHkuXG4gICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgcmVzb2x2ZXMgdG8gYSBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgZnVuY3Rpb24gaXNQdWxsUmVxdWVzdCh2OiBQdWxsUmVxdWVzdEZhaWx1cmV8UHVsbFJlcXVlc3QpOiB2IGlzIFB1bGxSZXF1ZXN0IHtcbiAgcmV0dXJuICh2IGFzIFB1bGxSZXF1ZXN0KS50YXJnZXRCcmFuY2hlcyAhPT0gdW5kZWZpbmVkO1xufVxuIl19