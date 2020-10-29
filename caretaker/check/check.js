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
        define("@angular/dev-infra-private/caretaker/check/check", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/caretaker/config", "@angular/dev-infra-private/caretaker/check/ci", "@angular/dev-infra-private/caretaker/check/g3", "@angular/dev-infra-private/caretaker/check/github", "@angular/dev-infra-private/caretaker/check/services"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkServiceStatuses = void 0;
    var tslib_1 = require("tslib");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var config_1 = require("@angular/dev-infra-private/caretaker/config");
    var ci_1 = require("@angular/dev-infra-private/caretaker/check/ci");
    var g3_1 = require("@angular/dev-infra-private/caretaker/check/g3");
    var github_1 = require("@angular/dev-infra-private/caretaker/check/github");
    var services_1 = require("@angular/dev-infra-private/caretaker/check/services");
    /** Check the status of services which Angular caretakers need to monitor. */
    function checkServiceStatuses(githubToken) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, git;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = config_1.getCaretakerConfig();
                        git = new index_1.GitClient(githubToken, config);
                        // Prevent logging of the git commands being executed during the check.
                        index_1.GitClient.LOG_COMMANDS = false;
                        // TODO(josephperrott): Allow these checks to be loaded in parallel.
                        return [4 /*yield*/, services_1.printServiceStatuses()];
                    case 1:
                        // TODO(josephperrott): Allow these checks to be loaded in parallel.
                        _a.sent();
                        return [4 /*yield*/, github_1.printGithubTasks(git, config.caretaker)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, g3_1.printG3Comparison(git)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, ci_1.printCiStatus(git)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.checkServiceStatuses = checkServiceStatuses;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBZ0Q7SUFDaEQsc0VBQTZDO0lBRTdDLG9FQUFtQztJQUNuQyxvRUFBdUM7SUFDdkMsNEVBQTBDO0lBQzFDLGdGQUFnRDtJQUdoRCw2RUFBNkU7SUFDN0UsU0FBc0Isb0JBQW9CLENBQUMsV0FBbUI7Ozs7Ozt3QkFFdEQsTUFBTSxHQUFHLDJCQUFrQixFQUFFLENBQUM7d0JBRTlCLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUMvQyx1RUFBdUU7d0JBQ3ZFLGlCQUFTLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQzt3QkFFL0Isb0VBQW9FO3dCQUNwRSxxQkFBTSwrQkFBb0IsRUFBRSxFQUFBOzt3QkFENUIsb0VBQW9FO3dCQUNwRSxTQUE0QixDQUFDO3dCQUM3QixxQkFBTSx5QkFBZ0IsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUFBOzt3QkFBN0MsU0FBNkMsQ0FBQzt3QkFDOUMscUJBQU0sc0JBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dCQUE1QixTQUE0QixDQUFDO3dCQUM3QixxQkFBTSxrQkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBeEIsU0FBd0IsQ0FBQzs7Ozs7S0FDMUI7SUFiRCxvREFhQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge3ByaW50Q2lTdGF0dXN9IGZyb20gJy4vY2knO1xuaW1wb3J0IHtwcmludEczQ29tcGFyaXNvbn0gZnJvbSAnLi9nMyc7XG5pbXBvcnQge3ByaW50R2l0aHViVGFza3N9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7cHJpbnRTZXJ2aWNlU3RhdHVzZXN9IGZyb20gJy4vc2VydmljZXMnO1xuXG5cbi8qKiBDaGVjayB0aGUgc3RhdHVzIG9mIHNlcnZpY2VzIHdoaWNoIEFuZ3VsYXIgY2FyZXRha2VycyBuZWVkIHRvIG1vbml0b3IuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tTZXJ2aWNlU3RhdHVzZXMoZ2l0aHViVG9rZW46IHN0cmluZykge1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjYXJldGFrZXIgY29tbWFuZHMuICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENhcmV0YWtlckNvbmZpZygpO1xuICAvKiogVGhlIEdpdENsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBnaXQgYW5kIEdpdGh1Yi4gKi9cbiAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbiwgY29uZmlnKTtcbiAgLy8gUHJldmVudCBsb2dnaW5nIG9mIHRoZSBnaXQgY29tbWFuZHMgYmVpbmcgZXhlY3V0ZWQgZHVyaW5nIHRoZSBjaGVjay5cbiAgR2l0Q2xpZW50LkxPR19DT01NQU5EUyA9IGZhbHNlO1xuXG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IEFsbG93IHRoZXNlIGNoZWNrcyB0byBiZSBsb2FkZWQgaW4gcGFyYWxsZWwuXG4gIGF3YWl0IHByaW50U2VydmljZVN0YXR1c2VzKCk7XG4gIGF3YWl0IHByaW50R2l0aHViVGFza3MoZ2l0LCBjb25maWcuY2FyZXRha2VyKTtcbiAgYXdhaXQgcHJpbnRHM0NvbXBhcmlzb24oZ2l0KTtcbiAgYXdhaXQgcHJpbnRDaVN0YXR1cyhnaXQpO1xufVxuIl19