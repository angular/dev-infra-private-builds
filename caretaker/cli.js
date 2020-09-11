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
        define("@angular/dev-infra-private/caretaker/cli", ["require", "exports", "@angular/dev-infra-private/caretaker/check/cli"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCaretakerParser = void 0;
    var cli_1 = require("@angular/dev-infra-private/caretaker/check/cli");
    /** Build the parser for the caretaker commands. */
    function buildCaretakerParser(yargs) {
        return yargs.command(cli_1.CheckModule);
    }
    exports.buildCaretakerParser = buildCaretakerParser;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NhcmV0YWtlci9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBR0gsc0VBQXdDO0lBR3hDLG1EQUFtRDtJQUNuRCxTQUFnQixvQkFBb0IsQ0FBQyxLQUFXO1FBQzlDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxpQkFBVyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUZELG9EQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndn0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtDaGVja01vZHVsZX0gZnJvbSAnLi9jaGVjay9jbGknO1xuXG5cbi8qKiBCdWlsZCB0aGUgcGFyc2VyIGZvciB0aGUgY2FyZXRha2VyIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ2FyZXRha2VyUGFyc2VyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5jb21tYW5kKENoZWNrTW9kdWxlKTtcbn1cbiJdfQ==