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
        define("@angular/dev-infra-private/format/formatters/index", ["require", "exports", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/format/formatters/buildifier", "@angular/dev-infra-private/format/formatters/clang-format", "@angular/dev-infra-private/format/formatters/base-formatter"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var buildifier_1 = require("@angular/dev-infra-private/format/formatters/buildifier");
    var clang_format_1 = require("@angular/dev-infra-private/format/formatters/clang-format");
    /**
     * Get all defined formatters which are active based on the current loaded config.
     */
    function getActiveFormatters() {
        var config = {};
        try {
            config = config_1.getAngularDevConfig().format || {};
        }
        catch (_a) {
        }
        return [new buildifier_1.Buildifier(config), new clang_format_1.ClangFormat(config)].filter(function (formatter) { return formatter.isEnabled(); });
    }
    exports.getActiveFormatters = getActiveFormatters;
    // Rexport symbols used for types elsewhere.
    var base_formatter_1 = require("@angular/dev-infra-private/format/formatters/base-formatter");
    exports.Formatter = base_formatter_1.Formatter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxrRUFBdUQ7SUFHdkQsc0ZBQXdDO0lBQ3hDLDBGQUEyQztJQUUzQzs7T0FFRztJQUNILFNBQWdCLG1CQUFtQjtRQUNqQyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSTtZQUNGLE1BQU0sR0FBRyw0QkFBbUIsRUFBMEIsQ0FBQyxNQUFNLElBQUksRUFBRSxDQUFDO1NBQ3JFO1FBQUMsV0FBTTtTQUNQO1FBQ0QsT0FBTyxDQUFDLElBQUksdUJBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLDBCQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQzNELFVBQUEsU0FBUyxJQUFJLE9BQUEsU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFyQixDQUFxQixDQUFDLENBQUM7SUFDMUMsQ0FBQztJQVJELGtEQVFDO0lBRUQsNENBQTRDO0lBQzVDLDhGQUE0RDtJQUFwRCxxQ0FBQSxTQUFTLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0QW5ndWxhckRldkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7Rm9ybWF0Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge0J1aWxkaWZpZXJ9IGZyb20gJy4vYnVpbGRpZmllcic7XG5pbXBvcnQge0NsYW5nRm9ybWF0fSBmcm9tICcuL2NsYW5nLWZvcm1hdCc7XG5cbi8qKlxuICogR2V0IGFsbCBkZWZpbmVkIGZvcm1hdHRlcnMgd2hpY2ggYXJlIGFjdGl2ZSBiYXNlZCBvbiB0aGUgY3VycmVudCBsb2FkZWQgY29uZmlnLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWN0aXZlRm9ybWF0dGVycygpIHtcbiAgbGV0IGNvbmZpZyA9IHt9O1xuICB0cnkge1xuICAgIGNvbmZpZyA9IGdldEFuZ3VsYXJEZXZDb25maWc8J2Zvcm1hdCcsIEZvcm1hdENvbmZpZz4oKS5mb3JtYXQgfHwge307XG4gIH0gY2F0Y2gge1xuICB9XG4gIHJldHVybiBbbmV3IEJ1aWxkaWZpZXIoY29uZmlnKSwgbmV3IENsYW5nRm9ybWF0KGNvbmZpZyldLmZpbHRlcihcbiAgICAgIGZvcm1hdHRlciA9PiBmb3JtYXR0ZXIuaXNFbmFibGVkKCkpO1xufVxuXG4vLyBSZXhwb3J0IHN5bWJvbHMgdXNlZCBmb3IgdHlwZXMgZWxzZXdoZXJlLlxuZXhwb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbn0gZnJvbSAnLi9iYXNlLWZvcm1hdHRlcic7XG4iXX0=