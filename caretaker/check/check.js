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
    var git_1 = require("@angular/dev-infra-private/utils/git/index");
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
                        git = new git_1.GitClient(githubToken, config);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBMEM7SUFDMUMsc0VBQTZDO0lBRTdDLG9FQUFtQztJQUNuQyxvRUFBdUM7SUFDdkMsNEVBQTBDO0lBQzFDLGdGQUFnRDtJQUdoRCw2RUFBNkU7SUFDN0UsU0FBc0Isb0JBQW9CLENBQUMsV0FBbUI7Ozs7Ozt3QkFFdEQsTUFBTSxHQUFHLDJCQUFrQixFQUFFLENBQUM7d0JBRTlCLEdBQUcsR0FBRyxJQUFJLGVBQVMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBRS9DLG9FQUFvRTt3QkFDcEUscUJBQU0sK0JBQW9CLEVBQUUsRUFBQTs7d0JBRDVCLG9FQUFvRTt3QkFDcEUsU0FBNEIsQ0FBQzt3QkFDN0IscUJBQU0seUJBQWdCLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBQTs7d0JBQTdDLFNBQTZDLENBQUM7d0JBQzlDLHFCQUFNLHNCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBNUIsU0FBNEIsQ0FBQzt3QkFDN0IscUJBQU0sa0JBQWEsQ0FBQyxHQUFHLENBQUMsRUFBQTs7d0JBQXhCLFNBQXdCLENBQUM7Ozs7O0tBQzFCO0lBWEQsb0RBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdCc7XG5pbXBvcnQge2dldENhcmV0YWtlckNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IHtwcmludENpU3RhdHVzfSBmcm9tICcuL2NpJztcbmltcG9ydCB7cHJpbnRHM0NvbXBhcmlzb259IGZyb20gJy4vZzMnO1xuaW1wb3J0IHtwcmludEdpdGh1YlRhc2tzfSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge3ByaW50U2VydmljZVN0YXR1c2VzfSBmcm9tICcuL3NlcnZpY2VzJztcblxuXG4vKiogQ2hlY2sgdGhlIHN0YXR1cyBvZiBzZXJ2aWNlcyB3aGljaCBBbmd1bGFyIGNhcmV0YWtlcnMgbmVlZCB0byBtb25pdG9yLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrU2VydmljZVN0YXR1c2VzKGdpdGh1YlRva2VuOiBzdHJpbmcpIHtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuICBjb25zdCBjb25maWcgPSBnZXRDYXJldGFrZXJDb25maWcoKTtcbiAgLyoqIFRoZSBHaXRDbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggZ2l0IGFuZCBHaXRodWIuICovXG4gIGNvbnN0IGdpdCA9IG5ldyBHaXRDbGllbnQoZ2l0aHViVG9rZW4sIGNvbmZpZyk7XG5cbiAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogQWxsb3cgdGhlc2UgY2hlY2tzIHRvIGJlIGxvYWRlZCBpbiBwYXJhbGxlbC5cbiAgYXdhaXQgcHJpbnRTZXJ2aWNlU3RhdHVzZXMoKTtcbiAgYXdhaXQgcHJpbnRHaXRodWJUYXNrcyhnaXQsIGNvbmZpZy5jYXJldGFrZXIpO1xuICBhd2FpdCBwcmludEczQ29tcGFyaXNvbihnaXQpO1xuICBhd2FpdCBwcmludENpU3RhdHVzKGdpdCk7XG59XG4iXX0=