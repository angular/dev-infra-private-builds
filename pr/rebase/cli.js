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
        define("@angular/dev-infra-private/pr/rebase/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/yargs", "@angular/dev-infra-private/pr/rebase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleRebaseCommand = exports.buildRebaseCommand = void 0;
    var tslib_1 = require("tslib");
    var yargs_1 = require("@angular/dev-infra-private/utils/yargs");
    var index_1 = require("@angular/dev-infra-private/pr/rebase");
    /** Builds the rebase pull request command. */
    function buildRebaseCommand(yargs) {
        return yargs_1.addGithubTokenFlag(yargs).positional('prNumber', { type: 'number', demandOption: true });
    }
    exports.buildRebaseCommand = buildRebaseCommand;
    /** Handles the rebase pull request command. */
    function handleRebaseCommand(_a) {
        var prNumber = _a.prNumber, githubToken = _a.githubToken;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, index_1.rebasePr(prNumber, githubToken)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleRebaseCommand = handleRebaseCommand;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGdFQUFxRDtJQUVyRCw4REFBaUM7SUFRakMsOENBQThDO0lBQzlDLFNBQWdCLGtCQUFrQixDQUFDLEtBQVc7UUFDNUMsT0FBTywwQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNoRyxDQUFDO0lBRkQsZ0RBRUM7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBc0IsbUJBQW1CLENBQ3JDLEVBQXdEO1lBQXZELFFBQVEsY0FBQSxFQUFFLFdBQVcsaUJBQUE7Ozs7NEJBQ3hCLHFCQUFNLGdCQUFRLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBckMsU0FBcUMsQ0FBQzs7Ozs7S0FDdkM7SUFIRCxrREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuRmxhZ30gZnJvbSAnLi4vLi4vdXRpbHMveWFyZ3MnO1xuXG5pbXBvcnQge3JlYmFzZVByfSBmcm9tICcuL2luZGV4JztcblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSB0byB0aGUgcmViYXNlIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmViYXNlQ29tbWFuZE9wdGlvbnMge1xuICBnaXRodWJUb2tlbjogc3RyaW5nO1xuICBwck51bWJlcjogbnVtYmVyO1xufVxuXG4vKiogQnVpbGRzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRSZWJhc2VDb21tYW5kKHlhcmdzOiBBcmd2KTogQXJndjxSZWJhc2VDb21tYW5kT3B0aW9ucz4ge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5GbGFnKHlhcmdzKS5wb3NpdGlvbmFsKCdwck51bWJlcicsIHt0eXBlOiAnbnVtYmVyJywgZGVtYW5kT3B0aW9uOiB0cnVlfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmViYXNlQ29tbWFuZChcbiAgICB7cHJOdW1iZXIsIGdpdGh1YlRva2VufTogQXJndW1lbnRzPFJlYmFzZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCByZWJhc2VQcihwck51bWJlciwgZ2l0aHViVG9rZW4pO1xufVxuIl19