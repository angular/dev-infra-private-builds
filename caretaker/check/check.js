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
        define("@angular/dev-infra-private/caretaker/check/check", ["require", "exports", "tslib", "@angular/dev-infra-private/caretaker/config", "@angular/dev-infra-private/caretaker/check/ci", "@angular/dev-infra-private/caretaker/check/g3", "@angular/dev-infra-private/caretaker/check/github", "@angular/dev-infra-private/caretaker/check/services"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkServiceStatuses = void 0;
    var tslib_1 = require("tslib");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY2FyZXRha2VyL2NoZWNrL2NoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxzRUFBNkM7SUFFN0Msb0VBQThCO0lBQzlCLG9FQUE4QjtJQUM5Qiw0RUFBNkM7SUFDN0MsZ0ZBQTBDO0lBRTFDLCtEQUErRDtJQUMvRCxJQUFNLFVBQVUsR0FBRztRQUNqQiw0QkFBbUI7UUFDbkIseUJBQWM7UUFDZCxhQUFRO1FBQ1IsYUFBUTtLQUNULENBQUM7SUFFRiw2RUFBNkU7SUFDN0UsU0FBc0Isb0JBQW9COzs7Ozs7O3dCQUVsQyxNQUFNLEdBQUcsMkJBQWtCLEVBQUUsQ0FBQzt3QkFFOUIscUJBQXFCLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7d0JBRTNFLGdHQUFnRzt3QkFDaEcsOEZBQThGO3dCQUM5RixZQUFZO3dCQUNaLHFCQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLFVBQUEsTUFBTSxJQUFJLE9BQUEsTUFBTSxDQUFDLElBQXdCLEVBQS9CLENBQStCLENBQUMsQ0FBQyxFQUFBOzt3QkFIdkYsZ0dBQWdHO3dCQUNoRyw4RkFBOEY7d0JBQzlGLFlBQVk7d0JBQ1osU0FBdUYsQ0FBQzs7Ozt3QkFFbkUsMEJBQUEsaUJBQUEscUJBQXFCLENBQUE7Ozs7d0JBQXJDO3dCQUNILHFCQUFNLFFBQU0sQ0FBQyxlQUFlLEVBQUUsRUFBQTs7d0JBQTlCLFNBQThCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBRWxDO0lBZEQsb0RBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDYXJldGFrZXJDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7Q2lNb2R1bGV9IGZyb20gJy4vY2knO1xuaW1wb3J0IHtHM01vZHVsZX0gZnJvbSAnLi9nMyc7XG5pbXBvcnQge0dpdGh1YlF1ZXJpZXNNb2R1bGV9IGZyb20gJy4vZ2l0aHViJztcbmltcG9ydCB7U2VydmljZXNNb2R1bGV9IGZyb20gJy4vc2VydmljZXMnO1xuXG4vKiogTGlzdCBvZiBtb2R1bGVzIGNoZWNrZWQgZm9yIHRoZSBjYXJldGFrZXIgY2hlY2sgY29tbWFuZC4gKi9cbmNvbnN0IG1vZHVsZUxpc3QgPSBbXG4gIEdpdGh1YlF1ZXJpZXNNb2R1bGUsXG4gIFNlcnZpY2VzTW9kdWxlLFxuICBDaU1vZHVsZSxcbiAgRzNNb2R1bGUsXG5dO1xuXG4vKiogQ2hlY2sgdGhlIHN0YXR1cyBvZiBzZXJ2aWNlcyB3aGljaCBBbmd1bGFyIGNhcmV0YWtlcnMgbmVlZCB0byBtb25pdG9yLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrU2VydmljZVN0YXR1c2VzKCkge1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjYXJldGFrZXIgY29tbWFuZHMuICovXG4gIGNvbnN0IGNvbmZpZyA9IGdldENhcmV0YWtlckNvbmZpZygpO1xuICAvKiogTGlzdCBvZiBpbnN0YW5jZXMgb2YgQ2FyZXRha2VyIENoZWNrIG1vZHVsZXMgKi9cbiAgY29uc3QgY2FyZXRha2VyQ2hlY2tNb2R1bGVzID0gbW9kdWxlTGlzdC5tYXAobW9kdWxlID0+IG5ldyBtb2R1bGUoY29uZmlnKSk7XG5cbiAgLy8gTW9kdWxlJ3MgYGRhdGFgIGlzIGNhc3RlZCBhcyBQcm9taXNlPHVua25vd24+IGJlY2F1c2UgdGhlIGRhdGEgdHlwZXMgb2YgdGhlIGBtb2R1bGVgJ3MgYGRhdGFgXG4gIC8vIHByb21pc2VzIGRvIG5vdCBtYXRjaCB0eXBpbmdzLCBob3dldmVyIG91ciB1c2FnZSBoZXJlIGlzIG9ubHkgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIHByb21pc2VcbiAgLy8gcmVzb2x2ZXMuXG4gIGF3YWl0IFByb21pc2UuYWxsKGNhcmV0YWtlckNoZWNrTW9kdWxlcy5tYXAobW9kdWxlID0+IG1vZHVsZS5kYXRhIGFzIFByb21pc2U8dW5rbm93bj4pKTtcblxuICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBjYXJldGFrZXJDaGVja01vZHVsZXMpIHtcbiAgICBhd2FpdCBtb2R1bGUucHJpbnRUb1Rlcm1pbmFsKCk7XG4gIH1cbn1cbiJdfQ==