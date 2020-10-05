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
        define("@angular/dev-infra-private/format/formatters/index", ["require", "exports", "@angular/dev-infra-private/format/config", "@angular/dev-infra-private/format/formatters/buildifier", "@angular/dev-infra-private/format/formatters/clang-format", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Formatter = exports.getActiveFormatters = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsbUVBQTBDO0lBRTFDLHNGQUF3QztJQUN4QywwRkFBMkM7SUFFM0M7O09BRUc7SUFDSCxTQUFnQixtQkFBbUI7UUFDakMsSUFBTSxNQUFNLEdBQUcsd0JBQWUsRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUN4QyxPQUFPLENBQUMsSUFBSSx1QkFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLElBQUksMEJBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FDM0QsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLENBQUMsU0FBUyxFQUFFLEVBQXJCLENBQXFCLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSkQsa0RBSUM7SUFFRCw0Q0FBNEM7SUFDNUMsOEZBQTREO0lBQXBELDJHQUFBLFNBQVMsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldEZvcm1hdENvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcblxuaW1wb3J0IHtCdWlsZGlmaWVyfSBmcm9tICcuL2J1aWxkaWZpZXInO1xuaW1wb3J0IHtDbGFuZ0Zvcm1hdH0gZnJvbSAnLi9jbGFuZy1mb3JtYXQnO1xuXG4vKipcbiAqIEdldCBhbGwgZGVmaW5lZCBmb3JtYXR0ZXJzIHdoaWNoIGFyZSBhY3RpdmUgYmFzZWQgb24gdGhlIGN1cnJlbnQgbG9hZGVkIGNvbmZpZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2ZUZvcm1hdHRlcnMoKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldEZvcm1hdENvbmZpZygpLmZvcm1hdDtcbiAgcmV0dXJuIFtuZXcgQnVpbGRpZmllcihjb25maWcpLCBuZXcgQ2xhbmdGb3JtYXQoY29uZmlnKV0uZmlsdGVyKFxuICAgICAgZm9ybWF0dGVyID0+IGZvcm1hdHRlci5pc0VuYWJsZWQoKSk7XG59XG5cbi8vIFJleHBvcnQgc3ltYm9scyB1c2VkIGZvciB0eXBlcyBlbHNld2hlcmUuXG5leHBvcnQge0Zvcm1hdHRlciwgRm9ybWF0dGVyQWN0aW9ufSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcbiJdfQ==