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
        define("@angular/dev-infra-private/format/formatters/index", ["require", "exports", "@angular/dev-infra-private/format/config", "@angular/dev-infra-private/format/formatters/buildifier", "@angular/dev-infra-private/format/formatters/clang-format", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getActiveFormatters = void 0;
    var config_1 = require("@angular/dev-infra-private/format/config");
    var buildifier_1 = require("@angular/dev-infra-private/format/formatters/buildifier");
    var clang_format_1 = require("@angular/dev-infra-private/format/formatters/clang-format");
    /**
     * Get all defined formatters which are active based on the current loaded config.
     */
    function getActiveFormatters() {
        var config = config_1.getFormatConfig().format;
        return [new buildifier_1.Buildifier(config), new clang_format_1.ClangFormat(config)].filter(function (formatter) { return formatter.isEnabled(); });
    }
    exports.getActiveFormatters = getActiveFormatters;
    // Rexport symbols used for types elsewhere.
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return base_formatter_1.Formatter; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsbUVBQTBDO0lBRTFDLHNGQUF3QztJQUN4QywwRkFBMkM7SUFFM0M7O09BRUc7SUFDSCxTQUFnQixtQkFBbUI7UUFDakMsSUFBTSxNQUFNLEdBQUcsd0JBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUN4QyxPQUFPLENBQUMsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksMEJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDM0QsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSkQsa0RBSUM7SUFFRCw0Q0FBNEM7SUFDNUMsOEZBQTREO0lBQXBELDJHQUFBLFNBQVMsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRGb3JtYXRDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7QnVpbGRpZmllcn0gZnJvbSAnLi9idWlsZGlmaWVyJztcbmltcG9ydCB7Q2xhbmdGb3JtYXR9IGZyb20gJy4vY2xhbmctZm9ybWF0JztcblxuLyoqXG4gKiBHZXQgYWxsIGRlZmluZWQgZm9ybWF0dGVycyB3aGljaCBhcmUgYWN0aXZlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGxvYWRlZCBjb25maWcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmVGb3JtYXR0ZXJzKCkge1xuICBjb25zdCBjb25maWcgPSBnZXRGb3JtYXRDb25maWcoKS5mb3JtYXQ7XG4gIHJldHVybiBbbmV3IEJ1aWxkaWZpZXIoY29uZmlnKSwgbmV3IENsYW5nRm9ybWF0KGNvbmZpZyldLmZpbHRlcihcbiAgICAgIGZvcm1hdHRlciA9PiBmb3JtYXR0ZXIuaXNFbmFibGVkKCkpO1xufVxuXG4vLyBSZXhwb3J0IHN5bWJvbHMgdXNlZCBmb3IgdHlwZXMgZWxzZXdoZXJlLlxuZXhwb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG4iXX0=