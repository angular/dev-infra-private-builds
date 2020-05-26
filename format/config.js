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
        define("@angular/dev-infra-private/format/config", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getFormatConfig = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    /** Retrieve and validate the config as `FormatConfig`. */
    function getFormatConfig() {
        var e_1, _a;
        // List of errors encountered validating the config.
        var errors = [];
        // The unvalidated config object.
        var config = config_1.getConfig();
        if (config.format === undefined) {
            errors.push("No configuration defined for \"format\"");
        }
        try {
            for (var _b = tslib_1.__values(Object.entries(config.format)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = tslib_1.__read(_c.value, 2), key = _d[0], value = _d[1];
                switch (typeof value) {
                    case 'boolean':
                        break;
                    case 'object':
                        checkFormatterConfig(key, value, errors);
                        break;
                    default:
                        errors.push("\"format." + key + "\" is not a boolean or Formatter object");
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        config_1.assertNoErrors(errors);
        return config;
    }
    exports.getFormatConfig = getFormatConfig;
    /** Validate an individual Formatter config. */
    function checkFormatterConfig(key, config, errors) {
        if (config.matchers === undefined) {
            errors.push("Missing \"format." + key + ".matchers\" value");
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUF1RTtJQVV2RSwwREFBMEQ7SUFDMUQsU0FBZ0IsZUFBZTs7UUFDN0Isb0RBQW9EO1FBQ3BELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixpQ0FBaUM7UUFDakMsSUFBTSxNQUFNLEdBQWlELGtCQUFTLEVBQUUsQ0FBQztRQUV6RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXVDLENBQUMsQ0FBQztTQUN0RDs7WUFFRCxLQUEyQixJQUFBLEtBQUEsaUJBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQWhELElBQUEsS0FBQSwyQkFBWSxFQUFYLEdBQUcsUUFBQSxFQUFFLEtBQUssUUFBQTtnQkFDcEIsUUFBUSxPQUFPLEtBQUssRUFBRTtvQkFDcEIsS0FBSyxTQUFTO3dCQUNaLE1BQU07b0JBQ1IsS0FBSyxRQUFRO3dCQUNYLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ3pDLE1BQU07b0JBQ1I7d0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFXLEdBQUcsNENBQXdDLENBQUMsQ0FBQztpQkFDdkU7YUFDRjs7Ozs7Ozs7O1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQXhCRCwwQ0F3QkM7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXLEVBQUUsTUFBMEIsRUFBRSxNQUFnQjtRQUNyRixJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQW1CLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztTQUN2RDtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW50ZXJmYWNlIEZvcm1hdHRlciB7XG4gIG1hdGNoZXJzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRDb25maWcge1xuICBba2V5b2Y6IHN0cmluZ106IGJvb2xlYW58Rm9ybWF0dGVyO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYEZvcm1hdENvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9ybWF0Q29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIHVudmFsaWRhdGVkIGNvbmZpZyBvYmplY3QuXG4gIGNvbnN0IGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZzx7Zm9ybWF0OiBGb3JtYXRDb25maWd9Pj4gPSBnZXRDb25maWcoKTtcblxuICBpZiAoY29uZmlnLmZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgXCJmb3JtYXRcImApO1xuICB9XG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmZvcm1hdCEpKSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIGNoZWNrRm9ybWF0dGVyQ29uZmlnKGtleSwgdmFsdWUsIGVycm9ycyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZXJyb3JzLnB1c2goYFwiZm9ybWF0LiR7a2V5fVwiIGlzIG5vdCBhIGJvb2xlYW4gb3IgRm9ybWF0dGVyIG9iamVjdGApO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgUmVxdWlyZWQ8dHlwZW9mIGNvbmZpZz47XG59XG5cbi8qKiBWYWxpZGF0ZSBhbiBpbmRpdmlkdWFsIEZvcm1hdHRlciBjb25maWcuICovXG5mdW5jdGlvbiBjaGVja0Zvcm1hdHRlckNvbmZpZyhrZXk6IHN0cmluZywgY29uZmlnOiBQYXJ0aWFsPEZvcm1hdHRlcj4sIGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGNvbmZpZy5tYXRjaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE1pc3NpbmcgXCJmb3JtYXQuJHtrZXl9Lm1hdGNoZXJzXCIgdmFsdWVgKTtcbiAgfVxufVxuIl19