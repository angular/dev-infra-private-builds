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
        define("@angular/dev-infra-private/utils/console", ["require", "exports", "tslib", "inquirer"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    /** Prompts the user with a confirmation question and a specified message. */
    function promptConfirm(message, defaultValue) {
        if (defaultValue === void 0) { defaultValue = false; }
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, inquirer_1.prompt({
                            type: 'confirm',
                            name: 'result',
                            message: message,
                            default: defaultValue,
                        })];
                    case 1: return [2 /*return*/, (_a.sent())
                            .result];
                }
            });
        });
    }
    exports.promptConfirm = promptConfirm;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9jb25zb2xlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHFDQUFnQztJQUVoQyw2RUFBNkU7SUFDN0UsU0FBc0IsYUFBYSxDQUFDLE9BQWUsRUFBRSxZQUFvQjtRQUFwQiw2QkFBQSxFQUFBLG9CQUFvQjs7Ozs0QkFDL0QscUJBQU0saUJBQU0sQ0FBb0I7NEJBQy9CLElBQUksRUFBRSxTQUFTOzRCQUNmLElBQUksRUFBRSxRQUFROzRCQUNkLE9BQU8sRUFBRSxPQUFPOzRCQUNoQixPQUFPLEVBQUUsWUFBWTt5QkFDdEIsQ0FBQyxFQUFBOzRCQUxULHNCQUFPLENBQUMsU0FLQyxDQUFDOzZCQUNMLE1BQU0sRUFBQzs7OztLQUNiO0lBUkQsc0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuLyoqIFByb21wdHMgdGhlIHVzZXIgd2l0aCBhIGNvbmZpcm1hdGlvbiBxdWVzdGlvbiBhbmQgYSBzcGVjaWZpZWQgbWVzc2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcm9tcHRDb25maXJtKG1lc3NhZ2U6IHN0cmluZywgZGVmYXVsdFZhbHVlID0gZmFsc2UpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgcmV0dXJuIChhd2FpdCBwcm9tcHQ8e3Jlc3VsdDogYm9vbGVhbn0+KHtcbiAgICAgICAgICAgdHlwZTogJ2NvbmZpcm0nLFxuICAgICAgICAgICBuYW1lOiAncmVzdWx0JyxcbiAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgZGVmYXVsdDogZGVmYXVsdFZhbHVlLFxuICAgICAgICAgfSkpXG4gICAgICAucmVzdWx0O1xufVxuIl19