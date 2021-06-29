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
        define("@angular/dev-infra-private/pr/check-target-branches/check-target-branches", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printTargetBranchesForPr = exports.getTargetBranchesForPr = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var config_2 = require("@angular/dev-infra-private/pr/merge/config");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    function getTargetBranchesForPr(prNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, _a, owner, repo, git, _b, mergeConfig, errors, prData, labels, githubTargetBranch, targetLabel;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = config_1.getConfig();
                        _a = config.github, owner = _a.owner, repo = _a.name;
                        git = git_client_1.GitClient.get();
                        return [4 /*yield*/, config_2.loadAndValidateConfig(config, git.github)];
                    case 1:
                        _b = _c.sent(), mergeConfig = _b.config, errors = _b.errors;
                        if (errors !== undefined) {
                            throw Error("Invalid configuration found: " + errors);
                        }
                        return [4 /*yield*/, git.github.pulls.get({ owner: owner, repo: repo, pull_number: prNumber })];
                    case 2:
                        prData = (_c.sent()).data;
                        labels = prData.labels.map(function (l) { return l.name; });
                        githubTargetBranch = prData.base.ref;
                        try {
                            targetLabel = target_label_1.getTargetLabelFromPullRequest(mergeConfig, labels);
                        }
                        catch (e) {
                            if (e instanceof target_label_1.InvalidTargetLabelError) {
                                console_1.error(console_1.red(e.failureMessage));
                                process.exitCode = 1;
                                return [2 /*return*/];
                            }
                            throw e;
                        }
                        return [4 /*yield*/, target_label_1.getBranchesFromTargetLabel(targetLabel, githubTargetBranch)];
                    case 3: 
                    /** The target branches based on the target label and branch targetted in the Github UI. */
                    return [2 /*return*/, _c.sent()];
                }
            });
        });
    }
    exports.getTargetBranchesForPr = getTargetBranchesForPr;
    function printTargetBranchesForPr(prNumber) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var targets;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getTargetBranchesForPr(prNumber)];
                    case 1:
                        targets = _a.sent();
                        if (targets === undefined) {
                            return [2 /*return*/];
                        }
                        console_1.info.group("PR #" + prNumber + " will merge into:");
                        targets.forEach(function (target) { return console_1.info("- " + target); });
                        console_1.info.groupEnd();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.printTargetBranchesForPr = printTargetBranchesForPr;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUE2QztJQUM3QyxvRUFBcUQ7SUFDckQsOEVBQXFEO0lBQ3JELHFFQUFtRTtJQUNuRSxpRkFBeUg7SUFFekgsU0FBc0Isc0JBQXNCLENBQUMsUUFBZ0I7Ozs7Ozt3QkFFckQsTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQzt3QkFFckIsS0FBc0IsTUFBTSxDQUFDLE1BQU0sRUFBbEMsS0FBSyxXQUFBLEVBQVEsSUFBSSxVQUFBLENBQWtCO3dCQUVwQyxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt3QkFFVSxxQkFBTSw4QkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBL0UsS0FBZ0MsU0FBK0MsRUFBdEUsV0FBVyxZQUFBLEVBQUUsTUFBTSxZQUFBO3dCQUNsQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7NEJBQ3hCLE1BQU0sS0FBSyxDQUFDLGtDQUFnQyxNQUFRLENBQUMsQ0FBQzt5QkFDdkQ7d0JBRWUscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxPQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUExRSxNQUFNLEdBQUcsQ0FBQyxTQUFnRSxDQUFDLENBQUMsSUFBSTt3QkFNaEYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUssRUFBUCxDQUFPLENBQUMsQ0FBQzt3QkFFekMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBSTNDLElBQUk7NEJBQ0YsV0FBVyxHQUFHLDRDQUE2QixDQUFDLFdBQVksRUFBRSxNQUFNLENBQUMsQ0FBQzt5QkFDbkU7d0JBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFlBQVksc0NBQXVCLEVBQUU7Z0NBQ3hDLGVBQUssQ0FBQyxhQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dDQUNyQixzQkFBTzs2QkFDUjs0QkFDRCxNQUFNLENBQUMsQ0FBQzt5QkFDVDt3QkFFTSxxQkFBTSx5Q0FBMEIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsRUFBQTs7b0JBRHhFLDJGQUEyRjtvQkFDM0Ysc0JBQU8sU0FBaUUsRUFBQzs7OztLQUMxRTtJQXJDRCx3REFxQ0M7SUFHRCxTQUFzQix3QkFBd0IsQ0FBQyxRQUFnQjs7Ozs7NEJBQzdDLHFCQUFNLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFBOzt3QkFBaEQsT0FBTyxHQUFHLFNBQXNDO3dCQUN0RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7NEJBQ3pCLHNCQUFPO3lCQUNSO3dCQUNELGNBQUksQ0FBQyxLQUFLLENBQUMsU0FBTyxRQUFRLHNCQUFtQixDQUFDLENBQUM7d0JBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxjQUFJLENBQUMsT0FBSyxNQUFRLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO3dCQUMvQyxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Ozs7O0tBQ2pCO0lBUkQsNERBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi4vbWVyZ2UvY29uZmlnJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwsIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0LCBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcn0gZnJvbSAnLi4vbWVyZ2UvdGFyZ2V0LWxhYmVsJztcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXI6IG51bWJlcikge1xuICAvKiogVGhlIG5nLWRldiBjb25maWd1cmF0aW9uLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgLyoqIFJlcG8gb3duZXIgYW5kIG5hbWUgZm9yIHRoZSBnaXRodWIgcmVwb3NpdG9yeS4gKi9cbiAgY29uc3Qge293bmVyLCBuYW1lOiByZXBvfSA9IGNvbmZpZy5naXRodWI7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSB2YWxpZGF0ZWQgbWVyZ2UgY29uZmlnLiAqL1xuICBjb25zdCB7Y29uZmlnOiBtZXJnZUNvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhjb25maWcsIGdpdC5naXRodWIpO1xuICBpZiAoZXJyb3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvdW5kOiAke2Vycm9yc31gKTtcbiAgfVxuICAvKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHJEYXRhID0gKGF3YWl0IGdpdC5naXRodWIucHVsbHMuZ2V0KHtvd25lciwgcmVwbywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSkpLmRhdGE7XG4gIC8qKiBUaGUgbGlzdCBvZiBsYWJlbHMgb24gdGhlIFBSIGFzIHN0cmluZ3MuICovXG4gIC8vIE5vdGU6IFRoZSBgbmFtZWAgcHJvcGVydHkgb2YgbGFiZWxzIGlzIGFsd2F5cyBzZXQgYnV0IHRoZSBHaXRodWIgT3BlbkFQSSBzcGVjIGlzIGluY29ycmVjdFxuICAvLyBoZXJlLlxuICAvLyBUT0RPKGRldnZlcnNpb24pOiBSZW1vdmUgdGhlIG5vbi1udWxsIGNhc3Qgb25jZVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZ2l0aHViL3Jlc3QtYXBpLWRlc2NyaXB0aW9uL2lzc3Vlcy8xNjkgaXMgZml4ZWQuXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubWFwKGwgPT4gbC5uYW1lISk7XG4gIC8qKiBUaGUgYnJhbmNoIHRhcmdldHRlZCB2aWEgdGhlIEdpdGh1YiBVSS4gKi9cbiAgY29uc3QgZ2l0aHViVGFyZ2V0QnJhbmNoID0gcHJEYXRhLmJhc2UucmVmO1xuICAvKiogVGhlIGFjdGl2ZSBsYWJlbCB3aGljaCBpcyBiZWluZyB1c2VkIGZvciB0YXJnZXR0aW5nIHRoZSBQUi4gKi9cbiAgbGV0IHRhcmdldExhYmVsOiBUYXJnZXRMYWJlbDtcblxuICB0cnkge1xuICAgIHRhcmdldExhYmVsID0gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QobWVyZ2VDb25maWchLCBsYWJlbHMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcikge1xuICAgICAgZXJyb3IocmVkKGUuZmFpbHVyZU1lc3NhZ2UpKTtcbiAgICAgIHByb2Nlc3MuZXhpdENvZGUgPSAxO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG4gIC8qKiBUaGUgdGFyZ2V0IGJyYW5jaGVzIGJhc2VkIG9uIHRoZSB0YXJnZXQgbGFiZWwgYW5kIGJyYW5jaCB0YXJnZXR0ZWQgaW4gdGhlIEdpdGh1YiBVSS4gKi9cbiAgcmV0dXJuIGF3YWl0IGdldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsKHRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2gpO1xufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmludFRhcmdldEJyYW5jaGVzRm9yUHIocHJOdW1iZXI6IG51bWJlcikge1xuICBjb25zdCB0YXJnZXRzID0gYXdhaXQgZ2V0VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcik7XG4gIGlmICh0YXJnZXRzID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5mby5ncm91cChgUFIgIyR7cHJOdW1iZXJ9IHdpbGwgbWVyZ2UgaW50bzpgKTtcbiAgdGFyZ2V0cy5mb3JFYWNoKHRhcmdldCA9PiBpbmZvKGAtICR7dGFyZ2V0fWApKTtcbiAgaW5mby5ncm91cEVuZCgpO1xufVxuIl19