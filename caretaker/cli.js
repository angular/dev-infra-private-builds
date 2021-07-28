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
        define("@angular/dev-infra-private/caretaker/cli", ["require", "exports", "@angular/dev-infra-private/caretaker/check/cli", "@angular/dev-infra-private/caretaker/handoff/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCaretakerParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/caretaker/check/cli");
    var cli_2 = require("@angular/dev-infra-private/caretaker/handoff/cli");
    /** Build the parser for the caretaker commands. */
    function buildCaretakerParser(yargs) {
        return yargs.command(cli_1.CheckModule).command(cli_2.HandoffModule);
    }
    exports.buildCaretakerParser = buildCaretakerParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBR0gsc0VBQXdDO0lBQ3hDLHdFQUE0QztJQUc1QyxtREFBbUQ7SUFDbkQsU0FBZ0Isb0JBQW9CLENBQUMsS0FBVztRQUM5QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsaUJBQVcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxtQkFBYSxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUZELG9EQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtDaGVja01vZHVsZX0gZnJvbSAnLi9jaGVjay9jbGknO1xuaW1wb3J0IHtIYW5kb2ZmTW9kdWxlfSBmcm9tICcuL2hhbmRvZmYvY2xpJztcblxuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNhcmV0YWtlciBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENhcmV0YWtlclBhcnNlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3MuY29tbWFuZChDaGVja01vZHVsZSkuY29tbWFuZChIYW5kb2ZmTW9kdWxlKTtcbn1cbiJdfQ==