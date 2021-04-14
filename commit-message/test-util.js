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
        define("@angular/dev-infra-private/commit-message/test-util", ["require", "exports", "tslib"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.commitMessageBuilder = void 0;
    var tslib_1 = require("tslib");
    /**
     * Generate a commit message builder function, using the provided defaults.
     */
    function commitMessageBuilder(defaults) {
        return function (params) {
            if (params === void 0) { params = {}; }
            var _a = tslib_1.__assign(tslib_1.__assign({}, defaults), params), prefix = _a.prefix, type = _a.type, npmScope = _a.npmScope, scope = _a.scope, summary = _a.summary, body = _a.body, footer = _a.footer;
            var scopeSlug = npmScope ? npmScope + "/" + scope : scope;
            return "" + prefix + type + (scopeSlug ? '(' + scopeSlug + ')' : '') + ": " + summary + "\n\n" + body + "\n\n" + footer;
        };
    }
    exports.commitMessageBuilder = commitMessageBuilder;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3Rlc3QtdXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBYUg7O09BRUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxRQUE0QjtRQUMvRCxPQUFPLFVBQUMsTUFBd0M7WUFBeEMsdUJBQUEsRUFBQSxXQUF3QztZQUN4QyxJQUFBLDJDQUE2RCxRQUFRLEdBQUssTUFBTSxDQUFDLEVBQWhGLE1BQU0sWUFBQSxFQUFFLElBQUksVUFBQSxFQUFFLFFBQVEsY0FBQSxFQUFFLEtBQUssV0FBQSxFQUFFLE9BQU8sYUFBQSxFQUFFLElBQUksVUFBQSxFQUFFLE1BQU0sWUFBNEIsQ0FBQztZQUN4RixJQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFJLFFBQVEsU0FBSSxLQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztZQUM1RCxPQUFPLEtBQUcsTUFBTSxHQUFHLElBQUksSUFBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQUssT0FBTyxZQUFPLElBQUksWUFDbkYsTUFBUSxDQUFDO1FBQ2YsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVBELG9EQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBUaGUgcGFydHMgdGhhdCBtYWtlIHVwIGEgY29tbWl0IG1lc3NhZ2UgZm9yIGNyZWF0aW5nIGEgY29tbWl0IG1lc3NhZ2Ugc3RyaW5nLiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21taXRNZXNzYWdlUGFydHMge1xuICBwcmVmaXg6IHN0cmluZztcbiAgdHlwZTogc3RyaW5nO1xuICBucG1TY29wZTogc3RyaW5nO1xuICBzY29wZTogc3RyaW5nO1xuICBzdW1tYXJ5OiBzdHJpbmc7XG4gIGJvZHk6IHN0cmluZztcbiAgZm9vdGVyOiBzdHJpbmc7XG59XG5cbi8qKlxuICogR2VuZXJhdGUgYSBjb21taXQgbWVzc2FnZSBidWlsZGVyIGZ1bmN0aW9uLCB1c2luZyB0aGUgcHJvdmlkZWQgZGVmYXVsdHMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21taXRNZXNzYWdlQnVpbGRlcihkZWZhdWx0czogQ29tbWl0TWVzc2FnZVBhcnRzKSB7XG4gIHJldHVybiAocGFyYW1zOiBQYXJ0aWFsPENvbW1pdE1lc3NhZ2VQYXJ0cz4gPSB7fSkgPT4ge1xuICAgIGNvbnN0IHtwcmVmaXgsIHR5cGUsIG5wbVNjb3BlLCBzY29wZSwgc3VtbWFyeSwgYm9keSwgZm9vdGVyfSA9IHsuLi5kZWZhdWx0cywgLi4ucGFyYW1zfTtcbiAgICBjb25zdCBzY29wZVNsdWcgPSBucG1TY29wZSA/IGAke25wbVNjb3BlfS8ke3Njb3BlfWAgOiBzY29wZTtcbiAgICByZXR1cm4gYCR7cHJlZml4fSR7dHlwZX0ke3Njb3BlU2x1ZyA/ICcoJyArIHNjb3BlU2x1ZyArICcpJyA6ICcnfTogJHtzdW1tYXJ5fVxcblxcbiR7Ym9keX1cXG5cXG4ke1xuICAgICAgICBmb290ZXJ9YDtcbiAgfTtcbn1cbiJdfQ==