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
    function checkServiceStatuses(githubToken) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var config, git, caretakerCheckModules, caretakerCheckModules_1, caretakerCheckModules_1_1, module_1, e_1_1;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        config = config_1.getCaretakerConfig();
                        git = new index_1.GitClient(githubToken, config);
                        // Prevent logging of the git commands being executed during the check.
                        index_1.GitClient.LOG_COMMANDS = false;
                        caretakerCheckModules = moduleList.map(function (module) { return new module(git, config); });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBZ0Q7SUFDaEQsc0VBQTZDO0lBRTdDLG9FQUE4QjtJQUM5QixvRUFBOEI7SUFDOUIsNEVBQTZDO0lBQzdDLGdGQUEwQztJQUUxQywrREFBK0Q7SUFDL0QsSUFBTSxVQUFVLEdBQUc7UUFDakIsNEJBQW1CO1FBQ25CLHlCQUFjO1FBQ2QsYUFBUTtRQUNSLGFBQVE7S0FDVCxDQUFDO0lBRUYsNkVBQTZFO0lBQzdFLFNBQXNCLG9CQUFvQixDQUFDLFdBQW1COzs7Ozs7O3dCQUV0RCxNQUFNLEdBQUcsMkJBQWtCLEVBQUUsQ0FBQzt3QkFFOUIsR0FBRyxHQUFHLElBQUksaUJBQVMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQy9DLHVFQUF1RTt3QkFDdkUsaUJBQVMsQ0FBQyxZQUFZLEdBQUcsS0FBSyxDQUFDO3dCQUV6QixxQkFBcUIsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUF2QixDQUF1QixDQUFDLENBQUM7d0JBRWhGLGdHQUFnRzt3QkFDaEcsOEZBQThGO3dCQUM5RixZQUFZO3dCQUNaLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQXdCLEVBQS9CLENBQStCLENBQUMsQ0FBQyxFQUFBOzt3QkFIdkYsZ0dBQWdHO3dCQUNoRyw4RkFBOEY7d0JBQzlGLFlBQVk7d0JBQ1osU0FBdUYsQ0FBQzs7Ozt3QkFFbkUsMEJBQUEsaUJBQUEscUJBQXFCLENBQUE7Ozs7d0JBQXJDO3dCQUNILHFCQUFNLFFBQU0sQ0FBQyxlQUFlLEVBQUUsRUFBQTs7d0JBQTlCLFNBQThCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBRWxDO0lBbEJELG9EQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0Q2FyZXRha2VyQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge0NpTW9kdWxlfSBmcm9tICcuL2NpJztcbmltcG9ydCB7RzNNb2R1bGV9IGZyb20gJy4vZzMnO1xuaW1wb3J0IHtHaXRodWJRdWVyaWVzTW9kdWxlfSBmcm9tICcuL2dpdGh1Yic7XG5pbXBvcnQge1NlcnZpY2VzTW9kdWxlfSBmcm9tICcuL3NlcnZpY2VzJztcblxuLyoqIExpc3Qgb2YgbW9kdWxlcyBjaGVja2VkIGZvciB0aGUgY2FyZXRha2VyIGNoZWNrIGNvbW1hbmQuICovXG5jb25zdCBtb2R1bGVMaXN0ID0gW1xuICBHaXRodWJRdWVyaWVzTW9kdWxlLFxuICBTZXJ2aWNlc01vZHVsZSxcbiAgQ2lNb2R1bGUsXG4gIEczTW9kdWxlLFxuXTtcblxuLyoqIENoZWNrIHRoZSBzdGF0dXMgb2Ygc2VydmljZXMgd2hpY2ggQW5ndWxhciBjYXJldGFrZXJzIG5lZWQgdG8gbW9uaXRvci4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja1NlcnZpY2VTdGF0dXNlcyhnaXRodWJUb2tlbjogc3RyaW5nKSB7XG4gIC8qKiBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNhcmV0YWtlciBjb21tYW5kcy4gKi9cbiAgY29uc3QgY29uZmlnID0gZ2V0Q2FyZXRha2VyQ29uZmlnKCk7XG4gIC8qKiBUaGUgR2l0Q2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIGdpdCBhbmQgR2l0aHViLiAqL1xuICBjb25zdCBnaXQgPSBuZXcgR2l0Q2xpZW50KGdpdGh1YlRva2VuLCBjb25maWcpO1xuICAvLyBQcmV2ZW50IGxvZ2dpbmcgb2YgdGhlIGdpdCBjb21tYW5kcyBiZWluZyBleGVjdXRlZCBkdXJpbmcgdGhlIGNoZWNrLlxuICBHaXRDbGllbnQuTE9HX0NPTU1BTkRTID0gZmFsc2U7XG4gIC8qKiBMaXN0IG9mIGluc3RhbmNlcyBvZiBDYXJldGFrZXIgQ2hlY2sgbW9kdWxlcyAqL1xuICBjb25zdCBjYXJldGFrZXJDaGVja01vZHVsZXMgPSBtb2R1bGVMaXN0Lm1hcChtb2R1bGUgPT4gbmV3IG1vZHVsZShnaXQsIGNvbmZpZykpO1xuXG4gIC8vIE1vZHVsZSdzIGBkYXRhYCBpcyBjYXN0ZWQgYXMgUHJvbWlzZTx1bmtub3duPiBiZWNhdXNlIHRoZSBkYXRhIHR5cGVzIG9mIHRoZSBgbW9kdWxlYCdzIGBkYXRhYFxuICAvLyBwcm9taXNlcyBkbyBub3QgbWF0Y2ggdHlwaW5ncywgaG93ZXZlciBvdXIgdXNhZ2UgaGVyZSBpcyBvbmx5IHRvIGRldGVybWluZSB3aGVuIHRoZSBwcm9taXNlXG4gIC8vIHJlc29sdmVzLlxuICBhd2FpdCBQcm9taXNlLmFsbChjYXJldGFrZXJDaGVja01vZHVsZXMubWFwKG1vZHVsZSA9PiBtb2R1bGUuZGF0YSBhcyBQcm9taXNlPHVua25vd24+KSk7XG5cbiAgZm9yIChjb25zdCBtb2R1bGUgb2YgY2FyZXRha2VyQ2hlY2tNb2R1bGVzKSB7XG4gICAgYXdhaXQgbW9kdWxlLnByaW50VG9UZXJtaW5hbCgpO1xuICB9XG59XG4iXX0=