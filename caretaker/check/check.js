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
        define("@angular/dev-infra-private/caretaker/service-statuses/check", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/index", "angular/dev-infra/caretaker/config", "@angular/dev-infra-private/caretaker/service-statuses/g3", "@angular/dev-infra-private/caretaker/service-statuses/github", "@angular/dev-infra-private/caretaker/service-statuses/services"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkServiceStatuses = void 0;
    var tslib_1 = require("tslib");
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
    var config_1 = require("angular/dev-infra/caretaker/config");
    var g3_1 = require("@angular/dev-infra-private/caretaker/service-statuses/g3");
    var github_1 = require("@angular/dev-infra-private/caretaker/service-statuses/github");
    var services_1 = require("@angular/dev-infra-private/caretaker/service-statuses/services");
    /** Check the status of services which Angular caretakers need to monitor. */
    function checkServiceStatuses(githubToken) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, git;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = config_1.getCaretakerConfig();
                        git = new git_1.GitClient(githubToken, config);
                        return [4 /*yield*/, services_1.printServiceStatuses()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, github_1.printGithubTasks(git, config.caretaker)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, g3_1.printG3Comparison(git)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.checkServiceStatuses = checkServiceStatuses;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBMEM7SUFDMUMsNkRBQTZDO0lBRTdDLCtFQUF1QztJQUN2Qyx1RkFBMEM7SUFDMUMsMkZBQWdEO0lBR2hELDZFQUE2RTtJQUM3RSxTQUFzQixvQkFBb0IsQ0FBQyxXQUFtQjs7Ozs7O3dCQUV0RCxNQUFNLEdBQUcsMkJBQWtCLEVBQUUsQ0FBQzt3QkFFOUIsR0FBRyxHQUFHLElBQUksZUFBUyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQzt3QkFFL0MscUJBQU0sK0JBQW9CLEVBQUUsRUFBQTs7d0JBQTVCLFNBQTRCLENBQUM7d0JBQzdCLHFCQUFNLHlCQUFnQixDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQUE7O3dCQUE3QyxTQUE2QyxDQUFDO3dCQUM5QyxxQkFBTSxzQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQTVCLFNBQTRCLENBQUM7Ozs7O0tBQzlCO0lBVEQsb0RBU0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2dldENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IHtwcmludEczQ29tcGFyaXNvbn0gZnJvbSAnLi9nMyc7XG5pbXBvcnQge3ByaW50R2l0aHViVGFza3N9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7cHJpbnRTZXJ2aWNlU3RhdHVzZXN9IGZyb20gJy4vc2VydmljZXMnO1xuXG5cbi8qKiBDaGVjayB0aGUgc3RhdHVzIG9mIHNlcnZpY2VzIHdoaWNoIEFuZ3VsYXIgY2FyZXRha2VycyBuZWVkIHRvIG1vbml0b3IuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tTZXJ2aWNlU3RhdHVzZXMoZ2l0aHViVG9rZW46IHN0cmluZykge1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjYXJldGFrZXIgY29tbWFuZHMuICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENhcmV0YWtlckNvbmZpZygpO1xuICAvKiogVGhlIEdpdENsaWVudCBmb3IgaW50ZXJhY3Rpbmcgd2l0aCBnaXQgYW5kIEdpdGh1Yi4gKi9cbiAgY29uc3QgZ2l0ID0gbmV3IEdpdENsaWVudChnaXRodWJUb2tlbiwgY29uZmlnKTtcblxuICBhd2FpdCBwcmludFNlcnZpY2VTdGF0dXNlcygpO1xuICBhd2FpdCBwcmludEdpdGh1YlRhc2tzKGdpdCwgY29uZmlnLmNhcmV0YWtlcik7XG4gIGF3YWl0IHByaW50RzNDb21wYXJpc29uKGdpdCk7XG59XG4iXX0=