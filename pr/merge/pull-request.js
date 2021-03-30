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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVsbC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3B1bGwtcmVxdWVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBTUgseUVBQThDO0lBQzlDLHFGQUFnRDtJQUNoRCxpRkFBeUY7SUF1QnpGOzs7T0FHRztJQUNILFNBQXNCLDBCQUEwQixDQUM1QyxFQUFtQyxFQUFFLFFBQWdCLEVBQ3JELHNCQUE4QjtZQUQ3QixHQUFHLFNBQUEsRUFBRSxNQUFNLFlBQUE7UUFDWix1Q0FBQSxFQUFBLDhCQUE4Qjs7Ozs7NEJBQ2pCLHFCQUFNLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELE1BQU0sR0FBRyxTQUErQzt3QkFFOUQsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFOzRCQUNuQixzQkFBTyw2QkFBa0IsQ0FBQyxRQUFRLEVBQUUsRUFBQzt5QkFDdEM7d0JBRUssTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQzt3QkFFOUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSwrQkFBYyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQTVDLENBQTRDLENBQUMsRUFBRTs0QkFDdEUsc0JBQU8sNkJBQWtCLENBQUMsYUFBYSxFQUFFLEVBQUM7eUJBQzNDO3dCQUNELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDLEVBQUU7NEJBQ3JFLHNCQUFPLDZCQUFrQixDQUFDLFdBQVcsRUFBRSxFQUFDO3lCQUN6Qzt3QkFFSyxXQUFXLEdBQUcsNENBQTZCLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUNsRSxJQUFJLFdBQVcsS0FBSyxJQUFJLEVBQUU7NEJBQ3hCLHNCQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3lCQUMzQzt3QkFHRyxxQkFBTSxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUUsRUFBQTs7d0JBRDlFLEtBQUssR0FDZixDQUFBLFNBQXdGLENBQUEsV0FEekU7d0JBR25CLElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxDQUFDLHNCQUFzQixFQUFFOzRCQUNsRCxzQkFBTyw2QkFBa0IsQ0FBQyxhQUFhLEVBQUUsRUFBQzt5QkFDM0M7d0JBQ0QsSUFBSSxLQUFLLEtBQUssU0FBUyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7NEJBQ2xELHNCQUFPLDZCQUFrQixDQUFDLGFBQWEsRUFBRSxFQUFDO3lCQUMzQzt3QkFFSyxrQkFBa0IsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQzt3QkFDckMsZUFBZSxHQUNqQixNQUFNLENBQUMsbUJBQW1CLElBQUksTUFBTSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLENBQUM7d0JBQzNFLHVCQUF1QixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsdUJBQXVCOzRCQUM1RCxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsK0JBQWMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLHVCQUF1QixDQUFDLEVBQXBELENBQW9ELENBQUMsQ0FBQzt3QkFFOUUsc0JBQU87Z0NBQ0wsUUFBUSxVQUFBO2dDQUNSLE1BQU0sUUFBQTtnQ0FDTixlQUFlLGlCQUFBO2dDQUNmLGtCQUFrQixvQkFBQTtnQ0FDbEIsdUJBQXVCLHlCQUFBO2dDQUN2QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7Z0NBQ25CLGNBQWMsRUFBRSx5Q0FBMEIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUM7Z0NBQzNFLFdBQVcsRUFBRSxNQUFNLENBQUMsT0FBTzs2QkFDNUIsRUFBQzs7OztLQUNIO0lBakRELGdFQWlEQztJQUVELDZFQUE2RTtJQUM3RSxTQUFlLDBCQUEwQixDQUNyQyxHQUFjLEVBQUUsUUFBZ0I7Ozs7Ozs7d0JBRWpCLHFCQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsdUNBQUssR0FBRyxDQUFDLFlBQVksS0FBRSxXQUFXLEVBQUUsUUFBUSxJQUFFLEVBQUE7O3dCQUE5RSxNQUFNLEdBQUcsU0FBcUU7d0JBQ3BGLHNCQUFPLE1BQU0sQ0FBQyxJQUFJLEVBQUM7Ozt3QkFFbkIsc0VBQXNFO3dCQUN0RSw0Q0FBNEM7d0JBQzVDLElBQUksR0FBQyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7NEJBQ3BCLHNCQUFPLElBQUksRUFBQzt5QkFDYjt3QkFDRCxNQUFNLEdBQUMsQ0FBQzs7Ozs7S0FFWDtJQUVELDhEQUE4RDtJQUM5RCxTQUFnQixhQUFhLENBQUMsQ0FBaUM7UUFDN0QsT0FBUSxDQUFpQixDQUFDLGNBQWMsS0FBSyxTQUFTLENBQUM7SUFDekQsQ0FBQztJQUZELHNDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIE9jdG9raXQgZnJvbSAnQG9jdG9raXQvcmVzdCc7XG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQnO1xuXG5pbXBvcnQge1B1bGxSZXF1ZXN0RmFpbHVyZX0gZnJvbSAnLi9mYWlsdXJlcyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0fSBmcm9tICcuL3RhcmdldC1sYWJlbCc7XG5pbXBvcnQge1B1bGxSZXF1ZXN0TWVyZ2VUYXNrfSBmcm9tICcuL3Rhc2snO1xuXG4vKiogSW50ZXJmYWNlIHRoYXQgZGVzY3JpYmVzIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBOdW1iZXIgb2YgdGhlIHB1bGwgcmVxdWVzdC4gKi9cbiAgcHJOdW1iZXI6IG51bWJlcjtcbiAgLyoqIFRpdGxlIG9mIHRoZSBwdWxsIHJlcXVlc3QuICovXG4gIHRpdGxlOiBzdHJpbmc7XG4gIC8qKiBMYWJlbHMgYXBwbGllZCB0byB0aGUgcHVsbCByZXF1ZXN0LiAqL1xuICBsYWJlbHM6IHN0cmluZ1tdO1xuICAvKiogTGlzdCBvZiBicmFuY2hlcyB0aGlzIFBSIHNob3VsZCBiZSBtZXJnZWQgaW50by4gKi9cbiAgdGFyZ2V0QnJhbmNoZXM6IHN0cmluZ1tdO1xuICAvKiogQnJhbmNoIHRoYXQgdGhlIFBSIHRhcmdldHMgaW4gdGhlIEdpdGh1YiBVSS4gKi9cbiAgZ2l0aHViVGFyZ2V0QnJhbmNoOiBzdHJpbmc7XG4gIC8qKiBDb3VudCBvZiBjb21taXRzIGluIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBjb21taXRDb3VudDogbnVtYmVyO1xuICAvKiogT3B0aW9uYWwgU0hBIHRoYXQgdGhpcyBwdWxsIHJlcXVlc3QgbmVlZHMgdG8gYmUgYmFzZWQgb24uICovXG4gIHJlcXVpcmVkQmFzZVNoYT86IHN0cmluZztcbiAgLyoqIFdoZXRoZXIgdGhlIHB1bGwgcmVxdWVzdCBjb21taXQgbWVzc2FnZSBmaXh1cC4gKi9cbiAgbmVlZHNDb21taXRNZXNzYWdlRml4dXA6IGJvb2xlYW47XG59XG5cbi8qKlxuICogTG9hZHMgYW5kIHZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBhZ2FpbnN0IHRoZSBnaXZlbiBjb25maWd1cmF0aW9uLlxuICogSWYgdGhlIHB1bGwgcmVxdWVzdHMgZmFpbHMsIGEgcHVsbCByZXF1ZXN0IGZhaWx1cmUgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQW5kVmFsaWRhdGVQdWxsUmVxdWVzdChcbiAgICB7Z2l0LCBjb25maWd9OiBQdWxsUmVxdWVzdE1lcmdlVGFzaywgcHJOdW1iZXI6IG51bWJlcixcbiAgICBpZ25vcmVOb25GYXRhbEZhaWx1cmVzID0gZmFsc2UpOiBQcm9taXNlPFB1bGxSZXF1ZXN0fFB1bGxSZXF1ZXN0RmFpbHVyZT4ge1xuICBjb25zdCBwckRhdGEgPSBhd2FpdCBmZXRjaFB1bGxSZXF1ZXN0RnJvbUdpdGh1YihnaXQsIHByTnVtYmVyKTtcblxuICBpZiAocHJEYXRhID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub3RGb3VuZCgpO1xuICB9XG5cbiAgY29uc3QgbGFiZWxzID0gcHJEYXRhLmxhYmVscy5tYXAobCA9PiBsLm5hbWUpO1xuXG4gIGlmICghbGFiZWxzLnNvbWUobmFtZSA9PiBtYXRjaGVzUGF0dGVybihuYW1lLCBjb25maWcubWVyZ2VSZWFkeUxhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLm5vdE1lcmdlUmVhZHkoKTtcbiAgfVxuICBpZiAoIWxhYmVscy5zb21lKG5hbWUgPT4gbWF0Y2hlc1BhdHRlcm4obmFtZSwgY29uZmlnLmNsYVNpZ25lZExhYmVsKSkpIHtcbiAgICByZXR1cm4gUHVsbFJlcXVlc3RGYWlsdXJlLmNsYVVuc2lnbmVkKCk7XG4gIH1cblxuICBjb25zdCB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KGNvbmZpZywgbGFiZWxzKTtcbiAgaWYgKHRhcmdldExhYmVsID09PSBudWxsKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5ub1RhcmdldExhYmVsKCk7XG4gIH1cblxuICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPVxuICAgICAgYXdhaXQgZ2l0LmFwaS5yZXBvcy5nZXRDb21iaW5lZFN0YXR1c0ZvclJlZih7Li4uZ2l0LnJlbW90ZVBhcmFtcywgcmVmOiBwckRhdGEuaGVhZC5zaGF9KTtcblxuICBpZiAoc3RhdGUgPT09ICdmYWlsdXJlJyAmJiAhaWdub3JlTm9uRmF0YWxGYWlsdXJlcykge1xuICAgIHJldHVybiBQdWxsUmVxdWVzdEZhaWx1cmUuZmFpbGluZ0NpSm9icygpO1xuICB9XG4gIGlmIChzdGF0ZSA9PT0gJ3BlbmRpbmcnICYmICFpZ25vcmVOb25GYXRhbEZhaWx1cmVzKSB7XG4gICAgcmV0dXJuIFB1bGxSZXF1ZXN0RmFpbHVyZS5wZW5kaW5nQ2lKb2JzKCk7XG4gIH1cblxuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZS5yZWY7XG4gIGNvbnN0IHJlcXVpcmVkQmFzZVNoYSA9XG4gICAgICBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0cyAmJiBjb25maWcucmVxdWlyZWRCYXNlQ29tbWl0c1tnaXRodWJUYXJnZXRCcmFuY2hdO1xuICBjb25zdCBuZWVkc0NvbW1pdE1lc3NhZ2VGaXh1cCA9ICEhY29uZmlnLmNvbW1pdE1lc3NhZ2VGaXh1cExhYmVsICYmXG4gICAgICBsYWJlbHMuc29tZShuYW1lID0+IG1hdGNoZXNQYXR0ZXJuKG5hbWUsIGNvbmZpZy5jb21taXRNZXNzYWdlRml4dXBMYWJlbCkpO1xuXG4gIHJldHVybiB7XG4gICAgcHJOdW1iZXIsXG4gICAgbGFiZWxzLFxuICAgIHJlcXVpcmVkQmFzZVNoYSxcbiAgICBnaXRodWJUYXJnZXRCcmFuY2gsXG4gICAgbmVlZHNDb21taXRNZXNzYWdlRml4dXAsXG4gICAgdGl0bGU6IHByRGF0YS50aXRsZSxcbiAgICB0YXJnZXRCcmFuY2hlczogZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCksXG4gICAgY29tbWl0Q291bnQ6IHByRGF0YS5jb21taXRzLFxuICB9O1xufVxuXG4vKiogRmV0Y2hlcyBhIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gUmV0dXJucyBudWxsIGlmIGFuIGVycm9yIG9jY3VycmVkLiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQdWxsUmVxdWVzdEZyb21HaXRodWIoXG4gICAgZ2l0OiBHaXRDbGllbnQsIHByTnVtYmVyOiBudW1iZXIpOiBQcm9taXNlPE9jdG9raXQuUHVsbHNHZXRSZXNwb25zZXxudWxsPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2l0LmFwaS5wdWxscy5nZXQoey4uLmdpdC5yZW1vdGVQYXJhbXMsIHB1bGxfbnVtYmVyOiBwck51bWJlcn0pO1xuICAgIHJldHVybiByZXN1bHQuZGF0YTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIC8vIElmIHRoZSBwdWxsIHJlcXVlc3QgY291bGQgbm90IGJlIGZvdW5kLCB3ZSB3YW50IHRvIHJldHVybiBgbnVsbGAgc29cbiAgICAvLyB0aGF0IHRoZSBlcnJvciBjYW4gYmUgaGFuZGxlZCBncmFjZWZ1bGx5LlxuICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufVxuXG4vKiogV2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIHJlc29sdmVzIHRvIGEgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUHVsbFJlcXVlc3QodjogUHVsbFJlcXVlc3RGYWlsdXJlfFB1bGxSZXF1ZXN0KTogdiBpcyBQdWxsUmVxdWVzdCB7XG4gIHJldHVybiAodiBhcyBQdWxsUmVxdWVzdCkudGFyZ2V0QnJhbmNoZXMgIT09IHVuZGVmaW5lZDtcbn1cbiJdfQ==