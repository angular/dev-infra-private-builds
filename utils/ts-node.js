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
        define("@angular/dev-infra-private/utils/ts-node", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isTsNodeAvailable = void 0;
    /** Whether ts-node has been installed and is available to ng-dev. */
    function isTsNodeAvailable() {
        try {
            require.resolve('ts-node');
            return true;
        }
        catch (_a) {
            return false;
        }
    }
    exports.isTsNodeAvailable = isTsNodeAvailable;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHMtbm9kZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy90cy1ub2RlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHFFQUFxRTtJQUNyRSxTQUFnQixpQkFBaUI7UUFDL0IsSUFBSTtZQUNGLE9BQU8sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUFDLFdBQU07WUFDTixPQUFPLEtBQUssQ0FBQztTQUNkO0lBQ0gsQ0FBQztJQVBELDhDQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBXaGV0aGVyIHRzLW5vZGUgaGFzIGJlZW4gaW5zdGFsbGVkIGFuZCBpcyBhdmFpbGFibGUgdG8gbmctZGV2LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVHNOb2RlQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICB0cnkge1xuICAgIHJlcXVpcmUucmVzb2x2ZSgndHMtbm9kZScpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==