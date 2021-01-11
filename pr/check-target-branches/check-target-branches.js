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
                        git = new index_1.GitClient(undefined, config);
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
                        targetLabel = target_label_1.getTargetLabelFromPullRequest(mergeConfig, labels);
                        if (targetLabel === null) {
                            console_1.error(console_1.red("No target label was found on pr #" + prNumber));
                            process.exitCode = 1;
                            return [2 /*return*/];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2stdGFyZ2V0LWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2NoZWNrLXRhcmdldC1icmFuY2hlcy9jaGVjay10YXJnZXQtYnJhbmNoZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUE2QztJQUM3QyxvRUFBcUQ7SUFDckQsb0VBQWdEO0lBQ2hELHFFQUFzRDtJQUN0RCxpRkFBZ0c7SUFFaEcsU0FBc0Isc0JBQXNCLENBQUMsUUFBZ0I7Ozs7Ozt3QkFFckQsTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQzt3QkFFckIsS0FBc0IsTUFBTSxDQUFDLE1BQU0sRUFBbEMsS0FBSyxXQUFBLEVBQVEsSUFBSSxVQUFBLENBQWtCO3dCQUVwQyxHQUFHLEdBQUcsSUFBSSxpQkFBUyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFFUCxxQkFBTSw4QkFBcUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFBOzt3QkFBL0UsS0FBZ0MsU0FBK0MsRUFBdEUsV0FBVyxZQUFBLEVBQUUsTUFBTSxZQUFBO3dCQUNsQyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7NEJBQ3hCLE1BQU0sS0FBSyxDQUFDLGtDQUFnQyxNQUFRLENBQUMsQ0FBQzt5QkFDdkQ7d0JBRWUscUJBQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxPQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBQyxDQUFDLEVBQUE7O3dCQUExRSxNQUFNLEdBQUcsQ0FBQyxTQUFnRSxDQUFDLENBQUMsSUFBSTt3QkFFaEYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQzt3QkFFeEMsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7d0JBRXJDLFdBQVcsR0FBRyw0Q0FBNkIsQ0FBQyxXQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ3hFLElBQUksV0FBVyxLQUFLLElBQUksRUFBRTs0QkFDeEIsZUFBSyxDQUFDLGFBQUcsQ0FBQyxzQ0FBb0MsUUFBVSxDQUFDLENBQUMsQ0FBQzs0QkFDM0QsT0FBTyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7NEJBQ3JCLHNCQUFPO3lCQUNSO3dCQUVNLHFCQUFNLHlDQUEwQixDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxFQUFBOztvQkFEeEUsMkZBQTJGO29CQUMzRixzQkFBTyxTQUFpRSxFQUFDOzs7O0tBQzFFO0lBM0JELHdEQTJCQztJQUdELFNBQXNCLHdCQUF3QixDQUFDLFFBQWdCOzs7Ozs0QkFDN0MscUJBQU0sc0JBQXNCLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUFoRCxPQUFPLEdBQUcsU0FBc0M7d0JBQ3RELElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTs0QkFDekIsc0JBQU87eUJBQ1I7d0JBQ0QsY0FBSSxDQUFDLEtBQUssQ0FBQyxTQUFPLFFBQVEsc0JBQW1CLENBQUMsQ0FBQzt3QkFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLGNBQUksQ0FBQyxPQUFLLE1BQVEsQ0FBQyxFQUFuQixDQUFtQixDQUFDLENBQUM7d0JBQy9DLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzs7Ozs7S0FDakI7SUFSRCw0REFRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7bG9hZEFuZFZhbGlkYXRlQ29uZmlnfSBmcm9tICcuLi9tZXJnZS9jb25maWcnO1xuaW1wb3J0IHtnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbCwgZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3R9IGZyb20gJy4uL21lcmdlL3RhcmdldC1sYWJlbCc7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyOiBudW1iZXIpIHtcbiAgLyoqIFRoZSBuZy1kZXYgY29uZmlndXJhdGlvbi4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8qKiBSZXBvIG93bmVyIGFuZCBuYW1lIGZvciB0aGUgZ2l0aHViIHJlcG9zaXRvcnkuICovXG4gIGNvbnN0IHtvd25lciwgbmFtZTogcmVwb30gPSBjb25maWcuZ2l0aHViO1xuICAvKiogVGhlIGdpdCBjbGllbnQgdG8gZ2V0IGEgR2l0aHViIEFQSSBzZXJ2aWNlIGluc3RhbmNlLiAqL1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KHVuZGVmaW5lZCwgY29uZmlnKTtcbiAgLyoqIFRoZSB2YWxpZGF0ZWQgbWVyZ2UgY29uZmlnLiAqL1xuICBjb25zdCB7Y29uZmlnOiBtZXJnZUNvbmZpZywgZXJyb3JzfSA9IGF3YWl0IGxvYWRBbmRWYWxpZGF0ZUNvbmZpZyhjb25maWcsIGdpdC5naXRodWIpO1xuICBpZiAoZXJyb3JzICE9PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBjb25maWd1cmF0aW9uIGZvdW5kOiAke2Vycm9yc31gKTtcbiAgfVxuICAvKiogVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIHB1bGwgcmVxdWVzdCBmcm9tIEdpdGh1Yi4gKi9cbiAgY29uc3QgcHJEYXRhID0gKGF3YWl0IGdpdC5naXRodWIucHVsbHMuZ2V0KHtvd25lciwgcmVwbywgcHVsbF9udW1iZXI6IHByTnVtYmVyfSkpLmRhdGE7XG4gIC8qKiBUaGUgbGlzdCBvZiBsYWJlbHMgb24gdGhlIFBSIGFzIHN0cmluZ3MuICovXG4gIGNvbnN0IGxhYmVscyA9IHByRGF0YS5sYWJlbHMubWFwKGwgPT4gbC5uYW1lKTtcbiAgLyoqIFRoZSBicmFuY2ggdGFyZ2V0dGVkIHZpYSB0aGUgR2l0aHViIFVJLiAqL1xuICBjb25zdCBnaXRodWJUYXJnZXRCcmFuY2ggPSBwckRhdGEuYmFzZS5yZWY7XG4gIC8qKiBUaGUgYWN0aXZlIGxhYmVsIHdoaWNoIGlzIGJlaW5nIHVzZWQgZm9yIHRhcmdldHRpbmcgdGhlIFBSLiAqL1xuICBjb25zdCB0YXJnZXRMYWJlbCA9IGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KG1lcmdlQ29uZmlnISwgbGFiZWxzKTtcbiAgaWYgKHRhcmdldExhYmVsID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGBObyB0YXJnZXQgbGFiZWwgd2FzIGZvdW5kIG9uIHByICMke3ByTnVtYmVyfWApKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMTtcbiAgICByZXR1cm47XG4gIH1cbiAgLyoqIFRoZSB0YXJnZXQgYnJhbmNoZXMgYmFzZWQgb24gdGhlIHRhcmdldCBsYWJlbCBhbmQgYnJhbmNoIHRhcmdldHRlZCBpbiB0aGUgR2l0aHViIFVJLiAqL1xuICByZXR1cm4gYXdhaXQgZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwodGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaCk7XG59XG5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50VGFyZ2V0QnJhbmNoZXNGb3JQcihwck51bWJlcjogbnVtYmVyKSB7XG4gIGNvbnN0IHRhcmdldHMgPSBhd2FpdCBnZXRUYXJnZXRCcmFuY2hlc0ZvclByKHByTnVtYmVyKTtcbiAgaWYgKHRhcmdldHMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbmZvLmdyb3VwKGBQUiAjJHtwck51bWJlcn0gd2lsbCBtZXJnZSBpbnRvOmApO1xuICB0YXJnZXRzLmZvckVhY2godGFyZ2V0ID0+IGluZm8oYC0gJHt0YXJnZXR9YCkpO1xuICBpbmZvLmdyb3VwRW5kKCk7XG59XG4iXX0=