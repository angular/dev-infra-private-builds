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
        define("@angular/dev-infra-private/caretaker/check/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/caretaker/check/check"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckModule = void 0;
    var tslib_1 = require("tslib");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var check_1 = require("@angular/dev-infra-private/caretaker/check/check");
    /** Builds the command. */
    function builder(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs);
    }
    /** Handles the command. */
    function handler() {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, check_1.checkServiceStatuses()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module for checking status information for the repository  */
    exports.CheckModule = {
        handler: handler,
        builder: builder,
        command: 'check',
        describe: 'Check the status of information the caretaker manages for the repository',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGtGQUFrRTtJQUVsRSwwRUFBNkM7SUFPN0MsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTyxtQ0FBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFNBQWUsT0FBTzs7Ozs0QkFDcEIscUJBQU0sNEJBQW9CLEVBQUUsRUFBQTs7d0JBQTVCLFNBQTRCLENBQUM7Ozs7O0tBQzlCO0lBRUQsK0VBQStFO0lBQ2xFLFFBQUEsV0FBVyxHQUE2QztRQUNuRSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsT0FBTztRQUNoQixRQUFRLEVBQUUsMEVBQTBFO0tBQ3JGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7YWRkR2l0aHViVG9rZW5PcHRpb259IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWIteWFyZ3MnO1xuXG5pbXBvcnQge2NoZWNrU2VydmljZVN0YXR1c2VzfSBmcm9tICcuL2NoZWNrJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIENhcmV0YWtlckNoZWNrT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiBhZGRHaXRodWJUb2tlbk9wdGlvbih5YXJncyk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgYXdhaXQgY2hlY2tTZXJ2aWNlU3RhdHVzZXMoKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGZvciBjaGVja2luZyBzdGF0dXMgaW5mb3JtYXRpb24gZm9yIHRoZSByZXBvc2l0b3J5ICAqL1xuZXhwb3J0IGNvbnN0IENoZWNrTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBDYXJldGFrZXJDaGVja09wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAnY2hlY2snLFxuICBkZXNjcmliZTogJ0NoZWNrIHRoZSBzdGF0dXMgb2YgaW5mb3JtYXRpb24gdGhlIGNhcmV0YWtlciBtYW5hZ2VzIGZvciB0aGUgcmVwb3NpdG9yeScsXG59O1xuIl19