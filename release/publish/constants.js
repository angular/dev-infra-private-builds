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
        define("@angular/dev-infra-private/release/publish/constants", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.waitForPullRequestInterval = exports.changelogPath = exports.packageJsonPath = void 0;
    /** Project-relative path for the "package.json" file. */
    exports.packageJsonPath = 'package.json';
    /** Project-relative path for the changelog file. */
    exports.changelogPath = 'CHANGELOG.md';
    /** Default interval in milliseconds to check whether a pull request has been merged. */
    exports.waitForPullRequestInterval = 10000;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9jb25zdGFudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgseURBQXlEO0lBQzVDLFFBQUEsZUFBZSxHQUFHLGNBQWMsQ0FBQztJQUU5QyxvREFBb0Q7SUFDdkMsUUFBQSxhQUFhLEdBQUcsY0FBYyxDQUFDO0lBRTVDLHdGQUF3RjtJQUMzRSxRQUFBLDBCQUEwQixHQUFHLEtBQUssQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKiogUHJvamVjdC1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgXCJwYWNrYWdlLmpzb25cIiBmaWxlLiAqL1xuZXhwb3J0IGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9ICdwYWNrYWdlLmpzb24nO1xuXG4vKiogUHJvamVjdC1yZWxhdGl2ZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG5leHBvcnQgY29uc3QgY2hhbmdlbG9nUGF0aCA9ICdDSEFOR0VMT0cubWQnO1xuXG4vKiogRGVmYXVsdCBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMgdG8gY2hlY2sgd2hldGhlciBhIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuICovXG5leHBvcnQgY29uc3Qgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwgPSAxMDAwMDtcbiJdfQ==