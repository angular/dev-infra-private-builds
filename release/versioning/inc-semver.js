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
        define("@angular/dev-infra-private/release/versioning/inc-semver", ["require", "exports", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.semverInc = void 0;
    var semver = require("semver");
    /**
     * Increments a specified SemVer version. Compared to the original increment in SemVer,
     * the version is cloned to not modify the original version instance.
     */
    function semverInc(version, release, identifier) {
        var clone = new semver.SemVer(version.version);
        return clone.inc(release, identifier);
    }
    exports.semverInc = semverInc;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5jLXNlbXZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvaW5jLXNlbXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakM7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUyxDQUNyQixPQUFzQixFQUFFLE9BQTJCLEVBQUUsVUFBbUI7UUFDMUUsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFKRCw4QkFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuLyoqXG4gKiBJbmNyZW1lbnRzIGEgc3BlY2lmaWVkIFNlbVZlciB2ZXJzaW9uLiBDb21wYXJlZCB0byB0aGUgb3JpZ2luYWwgaW5jcmVtZW50IGluIFNlbVZlcixcbiAqIHRoZSB2ZXJzaW9uIGlzIGNsb25lZCB0byBub3QgbW9kaWZ5IHRoZSBvcmlnaW5hbCB2ZXJzaW9uIGluc3RhbmNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VtdmVySW5jKFxuICAgIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHJlbGVhc2U6IHNlbXZlci5SZWxlYXNlVHlwZSwgaWRlbnRpZmllcj86IHN0cmluZykge1xuICBjb25zdCBjbG9uZSA9IG5ldyBzZW12ZXIuU2VtVmVyKHZlcnNpb24udmVyc2lvbik7XG4gIHJldHVybiBjbG9uZS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcik7XG59XG4iXX0=