(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pr/merge/messages", ["require", "exports", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCaretakerNotePromptMessage = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
    function getCaretakerNotePromptMessage(pullRequest) {
        return console_1.red('Pull request has a caretaker note applied. Please make sure you read it.') +
            ("\nQuick link to PR: " + pullRequest.url);
    }
    exports.getCaretakerNotePromptMessage = getCaretakerNotePromptMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2UvbWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXdDO0lBSXhDLFNBQWdCLDZCQUE2QixDQUFDLFdBQXdCO1FBQ3BFLE9BQU8sYUFBRyxDQUFDLDBFQUEwRSxDQUFDO2FBQ2xGLHlCQUF1QixXQUFXLENBQUMsR0FBSyxDQUFBLENBQUM7SUFDL0MsQ0FBQztJQUhELHNFQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7UHVsbFJlcXVlc3R9IGZyb20gJy4vcHVsbC1yZXF1ZXN0JztcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENhcmV0YWtlck5vdGVQcm9tcHRNZXNzYWdlKHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdCk6IHN0cmluZyB7XG4gIHJldHVybiByZWQoJ1B1bGwgcmVxdWVzdCBoYXMgYSBjYXJldGFrZXIgbm90ZSBhcHBsaWVkLiBQbGVhc2UgbWFrZSBzdXJlIHlvdSByZWFkIGl0LicpICtcbiAgICAgIGBcXG5RdWljayBsaW5rIHRvIFBSOiAke3B1bGxSZXF1ZXN0LnVybH1gO1xufVxuIl19