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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jaGVjay9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGtGQUFrRTtJQUVsRSwwRUFBNkM7SUFPN0MsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTyxtQ0FBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRUQsMkJBQTJCO0lBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQStDO1lBQTlDLFdBQVcsaUJBQUE7Ozs7NEJBQ2pDLHFCQUFNLDRCQUFvQixDQUFDLFdBQVcsQ0FBQyxFQUFBOzt3QkFBdkMsU0FBdUMsQ0FBQzs7Ozs7S0FDekM7SUFFRCwrRUFBK0U7SUFDbEUsUUFBQSxXQUFXLEdBQTZDO1FBQ25FLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLFFBQVEsRUFBRSwwRUFBMEU7S0FDckYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHtjaGVja1NlcnZpY2VTdGF0dXNlc30gZnJvbSAnLi9jaGVjayc7XG5cblxuZXhwb3J0IGludGVyZmFjZSBDYXJldGFrZXJDaGVja09wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3MpO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2dpdGh1YlRva2VufTogQXJndW1lbnRzPENhcmV0YWtlckNoZWNrT3B0aW9ucz4pIHtcbiAgYXdhaXQgY2hlY2tTZXJ2aWNlU3RhdHVzZXMoZ2l0aHViVG9rZW4pO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZm9yIGNoZWNraW5nIHN0YXR1cyBpbmZvcm1hdGlvbiBmb3IgdGhlIHJlcG9zaXRvcnkgICovXG5leHBvcnQgY29uc3QgQ2hlY2tNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIENhcmV0YWtlckNoZWNrT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdjaGVjaycsXG4gIGRlc2NyaWJlOiAnQ2hlY2sgdGhlIHN0YXR1cyBvZiBpbmZvcm1hdGlvbiB0aGUgY2FyZXRha2VyIG1hbmFnZXMgZm9yIHRoZSByZXBvc2l0b3J5Jyxcbn07XG4iXX0=