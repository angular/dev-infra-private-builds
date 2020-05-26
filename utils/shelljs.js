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
        define("@angular/dev-infra-private/utils/shelljs", ["require", "exports", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.exec = void 0;
    var shelljs_1 = require("shelljs");
    /* Run an exec command as silent. */
    function exec(cmd) {
        return shelljs_1.exec(cmd, { silent: true });
    }
    exports.exec = exec;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlbGxqcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9zaGVsbGpzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG1DQUFtRDtJQUVuRCxvQ0FBb0M7SUFDcEMsU0FBZ0IsSUFBSSxDQUFDLEdBQVc7UUFDOUIsT0FBTyxjQUFLLENBQUMsR0FBRyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUZELG9CQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhlYyBhcyBfZXhlYywgU2hlbGxTdHJpbmd9IGZyb20gJ3NoZWxsanMnO1xuXG4vKiBSdW4gYW4gZXhlYyBjb21tYW5kIGFzIHNpbGVudC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGVjKGNtZDogc3RyaW5nKTogU2hlbGxTdHJpbmcge1xuICByZXR1cm4gX2V4ZWMoY21kLCB7c2lsZW50OiB0cnVlfSk7XG59XG4iXX0=