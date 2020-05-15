/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/utils/git", ["require", "exports", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCurrentBranch = exports.hasLocalChanges = void 0;
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /** Whether the repo has any local changes. */
    function hasLocalChanges() {
        return !!shelljs_1.exec("git status --porcelain").trim();
    }
    exports.hasLocalChanges = hasLocalChanges;
    /** Get the currently checked out branch. */
    function getCurrentBranch() {
        return shelljs_1.exec("git symbolic-ref --short HEAD").trim();
    }
    exports.getCurrentBranch = getCurrentBranch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2l0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2dpdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCxvRUFBc0M7SUFHdEMsOENBQThDO0lBQzlDLFNBQWdCLGVBQWU7UUFDN0IsT0FBTyxDQUFDLENBQUMsY0FBSSxDQUFDLHdCQUF3QixDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDakQsQ0FBQztJQUZELDBDQUVDO0lBRUQsNENBQTRDO0lBQzVDLFNBQWdCLGdCQUFnQjtRQUM5QixPQUFPLGNBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFGRCw0Q0FFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGVjfSBmcm9tICcuLi91dGlscy9zaGVsbGpzJztcblxuXG4vKiogV2hldGhlciB0aGUgcmVwbyBoYXMgYW55IGxvY2FsIGNoYW5nZXMuICovXG5leHBvcnQgZnVuY3Rpb24gaGFzTG9jYWxDaGFuZ2VzKCkge1xuICByZXR1cm4gISFleGVjKGBnaXQgc3RhdHVzIC0tcG9yY2VsYWluYCkudHJpbSgpO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2goKSB7XG4gIHJldHVybiBleGVjKGBnaXQgc3ltYm9saWMtcmVmIC0tc2hvcnQgSEVBRGApLnRyaW0oKTtcbn1cbiJdfQ==