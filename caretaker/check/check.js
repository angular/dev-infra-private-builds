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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBZ0Q7SUFDaEQsc0VBQTZDO0lBRTdDLG9FQUFtQztJQUNuQyxvRUFBdUM7SUFDdkMsNEVBQTBDO0lBQzFDLGdGQUFnRDtJQUdoRCw2RUFBNkU7SUFDN0UsU0FBc0Isb0JBQW9CLENBQUMsV0FBbUI7Ozs7Ozt3QkFFdEQsTUFBTSxHQUFHLDJCQUFrQixFQUFFLENBQUM7d0JBRTlCLEdBQUcsR0FBRyxJQUFJLGlCQUFTLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUUvQyxvRUFBb0U7d0JBQ3BFLHFCQUFNLCtCQUFvQixFQUFFLEVBQUE7O3dCQUQ1QixvRUFBb0U7d0JBQ3BFLFNBQTRCLENBQUM7d0JBQzdCLHFCQUFNLHlCQUFnQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUE7O3dCQUE3QyxTQUE2QyxDQUFDO3dCQUM5QyxxQkFBTSxzQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQTVCLFNBQTRCLENBQUM7d0JBQzdCLHFCQUFNLGtCQUFhLENBQUMsR0FBRyxDQUFDLEVBQUE7O3dCQUF4QixTQUF3QixDQUFDOzs7OztLQUMxQjtJQVhELG9EQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7cHJpbnRDaVN0YXR1c30gZnJvbSAnLi9jaSc7XG5pbXBvcnQge3ByaW50RzNDb21wYXJpc29ufSBmcm9tICcuL2czJztcbmltcG9ydCB7cHJpbnRHaXRodWJUYXNrc30gZnJvbSAnLi9naXRodWInO1xuaW1wb3J0IHtwcmludFNlcnZpY2VTdGF0dXNlc30gZnJvbSAnLi9zZXJ2aWNlcyc7XG5cblxuLyoqIENoZWNrIHRoZSBzdGF0dXMgb2Ygc2VydmljZXMgd2hpY2ggQW5ndWxhciBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1NlcnZpY2VTdGF0dXNlcyhnaXRodWJUb2tlbjogc3RyaW5nKSB7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNhcmV0YWtlciBjb21tYW5kcy4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q2FyZXRha2VyQ29uZmlnKCk7XG4gIC8qKiBUaGUgR2l0Q2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIGdpdCBhbmQgR2l0aHViLiAqL1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuLCBjb25maWcpO1xuXG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IEFsbG93IHRoZXNlIGNoZWNrcyB0byBiZSBsb2FkZWQgaW4gcGFyYWxsZWwuXG4gIGF3YWl0IHByaW50U2VydmljZVN0YXR1c2VzKCk7XG4gIGF3YWl0IHByaW50R2l0aHViVGFza3MoZ2l0LCBjb25maWcuY2FyZXRha2VyKTtcbiAgYXdhaXQgcHJpbnRHM0NvbXBhcmlzb24oZ2l0KTtcbiAgYXdhaXQgcHJpbnRDaVN0YXR1cyhnaXQpO1xufVxuIl19