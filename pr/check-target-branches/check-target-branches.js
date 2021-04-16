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
        define("@angular/dev-infra-private/pr/check-target-branches/check-target-branches", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/pr/merge/config", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printTargetBranchesForPr = exports.getTargetBranchesForPr = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
                        git = index_1.GitClient.getInstance();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUE2QztJQUM3QyxvRUFBcUQ7SUFDckQsb0VBQWdEO0lBQ2hELHFFQUFtRTtJQUNuRSxpRkFBeUg7SUFFekgsU0FBc0Isc0JBQXNCLENBQUMsUUFBZ0I7Ozs7Ozt3QkFFckQsTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQzt3QkFFckIsS0FBc0IsTUFBTSxDQUFDLE1BQU0sRUFBbEMsS0FBSyxXQUFBLEVBQVEsSUFBSSxVQUFBLENBQWtCO3dCQUVwQyxHQUFHLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQzt3QkFFRSxxQkFBTSw4QkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBL0UsS0FBZ0MsU0FBK0MsRUFBdEUsV0FBVyxZQUFBLEVBQUUsTUFBTSxZQUFBO3dCQUNsQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7NEJBQ3hCLE1BQU0sS0FBSyxDQUFDLGtDQUFnQyxNQUFRLENBQUMsQ0FBQzt5QkFDdkQ7d0JBRWUscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxPQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUExRSxNQUFNLEdBQUcsQ0FBQyxTQUFnRSxDQUFDLENBQUMsSUFBSTt3QkFFaEYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQzt3QkFFeEMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBSTNDLElBQUk7NEJBQ0YsV0FBVyxHQUFHLDRDQUE2QixDQUFDLFdBQVksRUFBRSxNQUFNLENBQUMsQ0FBQzt5QkFDbkU7d0JBQUMsT0FBTyxDQUFDLEVBQUU7NEJBQ1YsSUFBSSxDQUFDLFlBQVksc0NBQXVCLEVBQUU7Z0NBQ3hDLGVBQUssQ0FBQyxhQUFHLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7Z0NBQzdCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO2dDQUNyQixzQkFBTzs2QkFDUjs0QkFDRCxNQUFNLENBQUMsQ0FBQzt5QkFDVDt3QkFFTSxxQkFBTSx5Q0FBMEIsQ0FBQyxXQUFXLEVBQUUsa0JBQWtCLENBQUMsRUFBQTs7b0JBRHhFLDJGQUEyRjtvQkFDM0Ysc0JBQU8sU0FBaUUsRUFBQzs7OztLQUMxRTtJQWpDRCx3REFpQ0M7SUFHRCxTQUFzQix3QkFBd0IsQ0FBQyxRQUFnQjs7Ozs7NEJBQzdDLHFCQUFNLHNCQUFzQixDQUFDLFFBQVEsQ0FBQyxFQUFBOzt3QkFBaEQsT0FBTyxHQUFHLFNBQXNDO3dCQUN0RCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7NEJBQ3pCLHNCQUFPO3lCQUNSO3dCQUNELGNBQUksQ0FBQyxLQUFLLENBQUMsU0FBTyxRQUFRLHNCQUFtQixDQUFDLENBQUM7d0JBQy9DLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxjQUFJLENBQUMsT0FBSyxNQUFRLENBQUMsRUFBbkIsQ0FBbUIsQ0FBQyxDQUFDO3dCQUMvQyxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Ozs7O0tBQ2pCO0lBUkQsNERBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge2xvYWRBbmRWYWxpZGF0ZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4uL21lcmdlL2NvbmZpZyc7XG5pbXBvcnQge2dldEJyYW5jaGVzRnJvbVRhcmdldExhYmVsLCBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdCwgSW52YWxpZFRhcmdldExhYmVsRXJyb3J9IGZyb20gJy4uL21lcmdlL3RhcmdldC1sYWJlbCc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyOiBudW1iZXIpIHtcbiAgLyoqIFRoZSBuZy1kZXYgY29uZmlndXJhdGlvbi4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8qKiBSZXBvIG93bmVyIGFuZCBuYW1lIGZvciB0aGUgZ2l0aHViIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSBjb25maWcuZ2l0aHViO1xuICAvKiogVGhlIHNpbmdsZXRvbiBpbnN0YW5jZSBvZiB0aGUgR2l0Q2xpZW50LiAqL1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgLyoqIFRoZSB2YWxpZGF0ZWQgbWVyZ2UgY29uZmlnLiAqL1xuICBjb25zdCB7Y29uZmlnOiBtZXJnZUNvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhjb25maWcsIGdpdC5naXRodWIpO1xuICBpZiAoZXJyb3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvdW5kOiAke2Vycm9yc31gKTtcbiAgfVxuICAvKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHJEYXRhID0gKGF3YWl0IGdpdC5naXRodWIucHVsbHMuZ2V0KHtvd25lciwgcmVwbywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSkpLmRhdGE7XG4gIC8qKiBUaGUgbGlzdCBvZiBsYWJlbHMgb24gdGhlIFBSIGFzIHN0cmluZ3MuICovXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubWFwKGwgPT4gbC5uYW1lKTtcbiAgLyoqIFRoZSBicmFuY2ggdGFyZ2V0dGVkIHZpYSB0aGUgR2l0aHViIFVJLiAqL1xuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZS5yZWY7XG4gIC8qKiBUaGUgYWN0aXZlIGxhYmVsIHdoaWNoIGlzIGJlaW5nIHVzZWQgZm9yIHRhcmdldHRpbmcgdGhlIFBSLiAqL1xuICBsZXQgdGFyZ2V0TGFiZWw6IFRhcmdldExhYmVsO1xuXG4gIHRyeSB7XG4gICAgdGFyZ2V0TGFiZWwgPSBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChtZXJnZUNvbmZpZyEsIGxhYmVscyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoZSBpbnN0YW5jZW9mIEludmFsaWRUYXJnZXRMYWJlbEVycm9yKSB7XG4gICAgICBlcnJvcihyZWQoZS5mYWlsdXJlTWVzc2FnZSkpO1xuICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IDE7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbiAgLyoqIFRoZSB0YXJnZXQgYnJhbmNoZXMgYmFzZWQgb24gdGhlIHRhcmdldCBsYWJlbCBhbmQgYnJhbmNoIHRhcmdldHRlZCBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICByZXR1cm4gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG59XG5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyKTtcbiAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IGluZm8oYC0gJHt0YXJnZXR9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG59XG4iXX0=