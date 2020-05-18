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
        define("@angular/dev-infra-private/pr/merge/string-pattern", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.matchesPattern = void 0;
    /** Checks whether the specified value matches the given pattern. */
    function matchesPattern(value, pattern) {
        return typeof pattern === 'string' ? value === pattern : pattern.test(value);
    }
    exports.matchesPattern = matchesPattern;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXBhdHRlcm4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyaW5nLXBhdHRlcm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQW9FO0lBQ3BFLFNBQWdCLGNBQWMsQ0FBQyxLQUFhLEVBQUUsT0FBc0I7UUFDbEUsT0FBTyxPQUFPLE9BQU8sS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUZELHdDQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIHZhbHVlIG1hdGNoZXMgdGhlIGdpdmVuIHBhdHRlcm4uICovXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlc1BhdHRlcm4odmFsdWU6IHN0cmluZywgcGF0dGVybjogUmVnRXhwfHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gdHlwZW9mIHBhdHRlcm4gPT09ICdzdHJpbmcnID8gdmFsdWUgPT09IHBhdHRlcm4gOiBwYXR0ZXJuLnRlc3QodmFsdWUpO1xufVxuIl19