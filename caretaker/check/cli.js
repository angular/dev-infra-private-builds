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
        define("@angular/dev-infra-private/caretaker/service-statuses/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/yargs", "@angular/dev-infra-private/caretaker/service-statuses/check"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckModule = exports.GITHUB_TOKEN_GENERATE_URL = void 0;
    var tslib_1 = require("tslib");
    var yargs_1 = require("@angular/dev-infra-private/utils/yargs");
    var check_1 = require("@angular/dev-infra-private/caretaker/service-statuses/check");
    /** URL to the Github page where personal access tokens can be generated. */
    exports.GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens";
    /** Builds the command. */
    function builder(yargs) {
        return yargs_1.addGithubTokenFlag(yargs);
    }
    /** Handles the command. */
    function handler(_a) {
        var githubToken = _a.githubToken;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, check_1.checkServiceStatuses(githubToken)];
                    case 1:
                        _b.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGdFQUFxRDtJQUVyRCxxRkFBNkM7SUFPN0MsNEVBQTRFO0lBQy9ELFFBQUEseUJBQXlCLEdBQUcsb0NBQW9DLENBQUM7SUFFOUUsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTywwQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQStDO1lBQTlDLFdBQVcsaUJBQUE7Ozs7NEJBQ2pDLHFCQUFNLDRCQUFvQixDQUFDLFdBQVcsQ0FBQyxFQUFBOzt3QkFBdkMsU0FBdUMsQ0FBQzs7Ozs7S0FDekM7SUFFRCwrRUFBK0U7SUFDbEUsUUFBQSxXQUFXLEdBQTZDO1FBQ25FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSwwRUFBMEU7S0FDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuRmxhZ30gZnJvbSAnLi4vLi4vdXRpbHMveWFyZ3MnO1xuXG5pbXBvcnQge2NoZWNrU2VydmljZVN0YXR1c2VzfSBmcm9tICcuL2NoZWNrJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIENhcmV0YWtlckNoZWNrT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG59XG5cbi8qKiBVUkwgdG8gdGhlIEdpdGh1YiBwYWdlIHdoZXJlIHBlcnNvbmFsIGFjY2VzcyB0b2tlbnMgY2FuIGJlIGdlbmVyYXRlZC4gKi9cbmV4cG9ydCBjb25zdCBHSVRIVUJfVE9LRU5fR0VORVJBVEVfVVJMID0gYGh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNgO1xuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5GbGFnKHlhcmdzKTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtnaXRodWJUb2tlbn06IEFyZ3VtZW50czxDYXJldGFrZXJDaGVja09wdGlvbnM+KSB7XG4gIGF3YWl0IGNoZWNrU2VydmljZVN0YXR1c2VzKGdpdGh1YlRva2VuKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGZvciBjaGVja2luZyBzdGF0dXMgaW5mb3JtYXRpb24gZm9yIHRoZSByZXBvc2l0b3J5ICAqL1xuZXhwb3J0IGNvbnN0IENoZWNrTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBDYXJldGFrZXJDaGVja09wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAnY2hlY2snLFxuICBkZXNjcmliZTogJ0NoZWNrIHRoZSBzdGF0dXMgb2YgaW5mb3JtYXRpb24gdGhlIGNhcmV0YWtlciBtYW5hZ2VzIGZvciB0aGUgcmVwb3NpdG9yeScsXG59O1xuIl19