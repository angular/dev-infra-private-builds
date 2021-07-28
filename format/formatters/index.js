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
        define("@angular/dev-infra-private/format/formatters/index", ["require", "exports", "@angular/dev-infra-private/format/config", "@angular/dev-infra-private/format/formatters/buildifier", "@angular/dev-infra-private/format/formatters/clang-format", "@angular/dev-infra-private/format/formatters/prettier", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Formatter = exports.getActiveFormatters = void 0;
    var config_1 = require("@angular/dev-infra-private/format/config");
    var buildifier_1 = require("@angular/dev-infra-private/format/formatters/buildifier");
    var clang_format_1 = require("@angular/dev-infra-private/format/formatters/clang-format");
    var prettier_1 = require("@angular/dev-infra-private/format/formatters/prettier");
    /**
     * Get all defined formatters which are active based on the current loaded config.
     */
    function getActiveFormatters() {
        var config = config_1.getFormatConfig().format;
        return [
            new prettier_1.Prettier(config),
            new buildifier_1.Buildifier(config),
            new clang_format_1.ClangFormat(config),
        ].filter(function (formatter) { return formatter.isEnabled(); });
    }
    exports.getActiveFormatters = getActiveFormatters;
    // Rexport symbols used for types elsewhere.
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return base_formatter_1.Formatter; } });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsbUVBQTBDO0lBRTFDLHNGQUF3QztJQUN4QywwRkFBMkM7SUFDM0Msa0ZBQW9DO0lBRXBDOztPQUVHO0lBQ0gsU0FBZ0IsbUJBQW1CO1FBQ2pDLElBQU0sTUFBTSxHQUFHLHdCQUFlLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDeEMsT0FBTztZQUNMLElBQUksbUJBQVEsQ0FBQyxNQUFNLENBQUM7WUFDcEIsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQztZQUN0QixJQUFJLDBCQUFXLENBQUMsTUFBTSxDQUFDO1NBQ3hCLENBQUMsTUFBTSxDQUFDLFVBQUMsU0FBUyxJQUFLLE9BQUEsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFyQixDQUFxQixDQUFDLENBQUM7SUFDakQsQ0FBQztJQVBELGtEQU9DO0lBRUQsNENBQTRDO0lBQzVDLDhGQUE0RDtJQUFwRCwyR0FBQSxTQUFTLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRGb3JtYXRDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7QnVpbGRpZmllcn0gZnJvbSAnLi9idWlsZGlmaWVyJztcbmltcG9ydCB7Q2xhbmdGb3JtYXR9IGZyb20gJy4vY2xhbmctZm9ybWF0JztcbmltcG9ydCB7UHJldHRpZXJ9IGZyb20gJy4vcHJldHRpZXInO1xuXG4vKipcbiAqIEdldCBhbGwgZGVmaW5lZCBmb3JtYXR0ZXJzIHdoaWNoIGFyZSBhY3RpdmUgYmFzZWQgb24gdGhlIGN1cnJlbnQgbG9hZGVkIGNvbmZpZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2ZUZvcm1hdHRlcnMoKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldEZvcm1hdENvbmZpZygpLmZvcm1hdDtcbiAgcmV0dXJuIFtcbiAgICBuZXcgUHJldHRpZXIoY29uZmlnKSxcbiAgICBuZXcgQnVpbGRpZmllcihjb25maWcpLFxuICAgIG5ldyBDbGFuZ0Zvcm1hdChjb25maWcpLFxuICBdLmZpbHRlcigoZm9ybWF0dGVyKSA9PiBmb3JtYXR0ZXIuaXNFbmFibGVkKCkpO1xufVxuXG4vLyBSZXhwb3J0IHN5bWJvbHMgdXNlZCBmb3IgdHlwZXMgZWxzZXdoZXJlLlxuZXhwb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG4iXX0=