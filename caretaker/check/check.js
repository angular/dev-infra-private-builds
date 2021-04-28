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
    /** List of modules checked for the caretaker check command. */
    var moduleList = [
        github_1.GithubQueriesModule,
        services_1.ServicesModule,
        ci_1.CiModule,
        g3_1.G3Module,
    ];
    /** Check the status of services which Angular caretakers need to monitor. */
    function checkServiceStatuses() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, caretakerCheckModules, caretakerCheckModules_1, caretakerCheckModules_1_1, module_1, e_1_1;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Set the verbose logging state of the GitClient.
                        index_1.GitClient.getAuthenticatedInstance().setVerboseLoggingState(false);
                        config = config_1.getCaretakerConfig();
                        caretakerCheckModules = moduleList.map(function (module) { return new module(config); });
                        // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
                        // promises do not match typings, however our usage here is only to determine when the promise
                        // resolves.
                        return [4 /*yield*/, Promise.all(caretakerCheckModules.map(function (module) { return module.data; }))];
                    case 1:
                        // Module's `data` is casted as Promise<unknown> because the data types of the `module`'s `data`
                        // promises do not match typings, however our usage here is only to determine when the promise
                        // resolves.
                        _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 7, 8, 9]);
                        caretakerCheckModules_1 = tslib_1.__values(caretakerCheckModules), caretakerCheckModules_1_1 = caretakerCheckModules_1.next();
                        _b.label = 3;
                    case 3:
                        if (!!caretakerCheckModules_1_1.done) return [3 /*break*/, 6];
                        module_1 = caretakerCheckModules_1_1.value;
                        return [4 /*yield*/, module_1.printToTerminal()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        caretakerCheckModules_1_1 = caretakerCheckModules_1.next();
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 9];
                    case 8:
                        try {
                            if (caretakerCheckModules_1_1 && !caretakerCheckModules_1_1.done && (_a = caretakerCheckModules_1.return)) _a.call(caretakerCheckModules_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    }
    exports.checkServiceStatuses = checkServiceStatuses;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBZ0Q7SUFDaEQsc0VBQTZDO0lBRTdDLG9FQUE4QjtJQUM5QixvRUFBOEI7SUFDOUIsNEVBQTZDO0lBQzdDLGdGQUEwQztJQUUxQywrREFBK0Q7SUFDL0QsSUFBTSxVQUFVLEdBQUc7UUFDakIsNEJBQW1CO1FBQ25CLHlCQUFjO1FBQ2QsYUFBUTtRQUNSLGFBQVE7S0FDVCxDQUFDO0lBRUYsNkVBQTZFO0lBQzdFLFNBQXNCLG9CQUFvQjs7Ozs7Ozt3QkFDeEMsa0RBQWtEO3dCQUNsRCxpQkFBUyxDQUFDLHdCQUF3QixFQUFFLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBRTdELE1BQU0sR0FBRywyQkFBa0IsRUFBRSxDQUFDO3dCQUU5QixxQkFBcUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQzt3QkFFM0UsZ0dBQWdHO3dCQUNoRyw4RkFBOEY7d0JBQzlGLFlBQVk7d0JBQ1oscUJBQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxNQUFNLENBQUMsSUFBd0IsRUFBL0IsQ0FBK0IsQ0FBQyxDQUFDLEVBQUE7O3dCQUh2RixnR0FBZ0c7d0JBQ2hHLDhGQUE4Rjt3QkFDOUYsWUFBWTt3QkFDWixTQUF1RixDQUFDOzs7O3dCQUVuRSwwQkFBQSxpQkFBQSxxQkFBcUIsQ0FBQTs7Ozt3QkFBckM7d0JBQ0gscUJBQU0sUUFBTSxDQUFDLGVBQWUsRUFBRSxFQUFBOzt3QkFBOUIsU0FBOEIsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FFbEM7SUFoQkQsb0RBZ0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7Q2lNb2R1bGV9IGZyb20gJy4vY2knO1xuaW1wb3J0IHtHM01vZHVsZX0gZnJvbSAnLi9nMyc7XG5pbXBvcnQge0dpdGh1YlF1ZXJpZXNNb2R1bGV9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7U2VydmljZXNNb2R1bGV9IGZyb20gJy4vc2VydmljZXMnO1xuXG4vKiogTGlzdCBvZiBtb2R1bGVzIGNoZWNrZWQgZm9yIHRoZSBjYXJldGFrZXIgY2hlY2sgY29tbWFuZC4gKi9cbmNvbnN0IG1vZHVsZUxpc3QgPSBbXG4gIEdpdGh1YlF1ZXJpZXNNb2R1bGUsXG4gIFNlcnZpY2VzTW9kdWxlLFxuICBDaU1vZHVsZSxcbiAgRzNNb2R1bGUsXG5dO1xuXG4vKiogQ2hlY2sgdGhlIHN0YXR1cyBvZiBzZXJ2aWNlcyB3aGljaCBBbmd1bGFyIGNhcmV0YWtlcnMgbmVlZCB0byBtb25pdG9yLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrU2VydmljZVN0YXR1c2VzKCkge1xuICAvLyBTZXQgdGhlIHZlcmJvc2UgbG9nZ2luZyBzdGF0ZSBvZiB0aGUgR2l0Q2xpZW50LlxuICBHaXRDbGllbnQuZ2V0QXV0aGVudGljYXRlZEluc3RhbmNlKCkuc2V0VmVyYm9zZUxvZ2dpbmdTdGF0ZShmYWxzZSk7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNhcmV0YWtlciBjb21tYW5kcy4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q2FyZXRha2VyQ29uZmlnKCk7XG4gIC8qKiBMaXN0IG9mIGluc3RhbmNlcyBvZiBDYXJldGFrZXIgQ2hlY2sgbW9kdWxlcyAqL1xuICBjb25zdCBjYXJldGFrZXJDaGVja01vZHVsZXMgPSBtb2R1bGVMaXN0Lm1hcChtb2R1bGUgPT4gbmV3IG1vZHVsZShjb25maWcpKTtcblxuICAvLyBNb2R1bGUncyBgZGF0YWAgaXMgY2FzdGVkIGFzIFByb21pc2U8dW5rbm93bj4gYmVjYXVzZSB0aGUgZGF0YSB0eXBlcyBvZiB0aGUgYG1vZHVsZWAncyBgZGF0YWBcbiAgLy8gcHJvbWlzZXMgZG8gbm90IG1hdGNoIHR5cGluZ3MsIGhvd2V2ZXIgb3VyIHVzYWdlIGhlcmUgaXMgb25seSB0byBkZXRlcm1pbmUgd2hlbiB0aGUgcHJvbWlzZVxuICAvLyByZXNvbHZlcy5cbiAgYXdhaXQgUHJvbWlzZS5hbGwoY2FyZXRha2VyQ2hlY2tNb2R1bGVzLm1hcChtb2R1bGUgPT4gbW9kdWxlLmRhdGEgYXMgUHJvbWlzZTx1bmtub3duPikpO1xuXG4gIGZvciAoY29uc3QgbW9kdWxlIG9mIGNhcmV0YWtlckNoZWNrTW9kdWxlcykge1xuICAgIGF3YWl0IG1vZHVsZS5wcmludFRvVGVybWluYWwoKTtcbiAgfVxufVxuIl19