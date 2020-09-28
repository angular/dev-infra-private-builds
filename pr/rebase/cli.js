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
        define("@angular/dev-infra-private/pr/rebase/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/pr/rebase"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleRebaseCommand = exports.buildRebaseCommand = void 0;
    var tslib_1 = require("tslib");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var index_1 = require("@angular/dev-infra-private/pr/rebase");
    /** Builds the rebase pull request command. */
    function buildRebaseCommand(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs).positional('prNumber', { type: 'number', demandOption: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL3JlYmFzZS9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILGtGQUFrRTtJQUVsRSw4REFBaUM7SUFRakMsOENBQThDO0lBQzlDLFNBQWdCLGtCQUFrQixDQUFDLEtBQVc7UUFDNUMsT0FBTyxtQ0FBb0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztJQUNsRyxDQUFDO0lBRkQsZ0RBRUM7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBc0IsbUJBQW1CLENBQ3JDLEVBQXdEO1lBQXZELFFBQVEsY0FBQSxFQUFFLFdBQVcsaUJBQUE7Ozs7NEJBQ3hCLHFCQUFNLGdCQUFRLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxFQUFBOzt3QkFBckMsU0FBcUMsQ0FBQzs7Ozs7S0FDdkM7SUFIRCxrREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHtyZWJhc2VQcn0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIHJlYmFzZSBjb21tYW5kIHZpYSBDTEkuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlYmFzZUNvbW1hbmRPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbiAgcHJOdW1iZXI6IG51bWJlcjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgcmViYXNlIHB1bGwgcmVxdWVzdCBjb21tYW5kLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkUmViYXNlQ29tbWFuZCh5YXJnczogQXJndik6IEFyZ3Y8UmViYXNlQ29tbWFuZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKS5wb3NpdGlvbmFsKCdwck51bWJlcicsIHt0eXBlOiAnbnVtYmVyJywgZGVtYW5kT3B0aW9uOiB0cnVlfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSByZWJhc2UgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmViYXNlQ29tbWFuZChcbiAgICB7cHJOdW1iZXIsIGdpdGh1YlRva2VufTogQXJndW1lbnRzPFJlYmFzZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCByZWJhc2VQcihwck51bWJlciwgZ2l0aHViVG9rZW4pO1xufVxuIl19