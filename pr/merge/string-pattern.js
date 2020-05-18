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
    /** Checks whether the specified value matches the given pattern. */
    function matchesPattern(value, pattern) {
        return typeof pattern === 'string' ? value === pattern : pattern.test(value);
    }
    exports.matchesPattern = matchesPattern;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RyaW5nLXBhdHRlcm4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHIvbWVyZ2Uvc3RyaW5nLXBhdHRlcm4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxvRUFBb0U7SUFDcEUsU0FBZ0IsY0FBYyxDQUFDLEtBQWEsRUFBRSxPQUFzQjtRQUNsRSxPQUFPLE9BQU8sT0FBTyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMvRSxDQUFDO0lBRkQsd0NBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgdmFsdWUgbWF0Y2hlcyB0aGUgZ2l2ZW4gcGF0dGVybi4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXRjaGVzUGF0dGVybih2YWx1ZTogc3RyaW5nLCBwYXR0ZXJuOiBSZWdFeHB8c3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB0eXBlb2YgcGF0dGVybiA9PT0gJ3N0cmluZycgPyB2YWx1ZSA9PT0gcGF0dGVybiA6IHBhdHRlcm4udGVzdCh2YWx1ZSk7XG59XG4iXX0=