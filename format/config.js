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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtFQUF1RTtJQVV2RSwwREFBMEQ7SUFDMUQsU0FBZ0IsZUFBZTs7UUFDN0Isb0RBQW9EO1FBQ3BELElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUM1QixpQ0FBaUM7UUFDakMsSUFBTSxNQUFNLEdBQWlELGtCQUFTLEVBQUUsQ0FBQztRQUV6RSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUMseUNBQXVDLENBQUMsQ0FBQztTQUN0RDs7WUFFRCxLQUEyQixJQUFBLEtBQUEsaUJBQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQWhELElBQUEsS0FBQSwyQkFBWSxFQUFYLEdBQUcsUUFBQSxFQUFFLEtBQUssUUFBQTtnQkFDcEIsUUFBUSxPQUFPLEtBQUssRUFBRTtvQkFDcEIsS0FBSyxTQUFTO3dCQUNaLE1BQU07b0JBQ1IsS0FBSyxRQUFRO3dCQUNYLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ3pDLE1BQU07b0JBQ1I7d0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxjQUFXLEdBQUcsNENBQXdDLENBQUMsQ0FBQztpQkFDdkU7YUFDRjs7Ozs7Ozs7O1FBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QixPQUFPLE1BQWlDLENBQUM7SUFDM0MsQ0FBQztJQXhCRCwwQ0F3QkM7SUFFRCwrQ0FBK0M7SUFDL0MsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXLEVBQUUsTUFBMEIsRUFBRSxNQUFnQjtRQUNyRixJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQW1CLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztTQUN2RDtJQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW50ZXJmYWNlIEZvcm1hdHRlciB7XG4gIG1hdGNoZXJzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRDb25maWcge1xuICBba2V5OiBzdHJpbmddOiBib29sZWFufEZvcm1hdHRlcjtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCB2YWxpZGF0ZSB0aGUgY29uZmlnIGFzIGBGb3JtYXRDb25maWdgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZvcm1hdENvbmZpZygpIHtcbiAgLy8gTGlzdCBvZiBlcnJvcnMgZW5jb3VudGVyZWQgdmFsaWRhdGluZyB0aGUgY29uZmlnLlxuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIC8vIFRoZSB1bnZhbGlkYXRlZCBjb25maWcgb2JqZWN0LlxuICBjb25zdCBjb25maWc6IFBhcnRpYWw8TmdEZXZDb25maWc8e2Zvcm1hdDogRm9ybWF0Q29uZmlnfT4+ID0gZ2V0Q29uZmlnKCk7XG5cbiAgaWYgKGNvbmZpZy5mb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBObyBjb25maWd1cmF0aW9uIGRlZmluZWQgZm9yIFwiZm9ybWF0XCJgKTtcbiAgfVxuXG4gIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGNvbmZpZy5mb3JtYXQhKSkge1xuICAgIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgICBjYXNlICdib29sZWFuJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICBjaGVja0Zvcm1hdHRlckNvbmZpZyhrZXksIHZhbHVlLCBlcnJvcnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGVycm9ycy5wdXNoKGBcImZvcm1hdC4ke2tleX1cIiBpcyBub3QgYSBib29sZWFuIG9yIEZvcm1hdHRlciBvYmplY3RgKTtcbiAgICB9XG4gIH1cblxuICBhc3NlcnROb0Vycm9ycyhlcnJvcnMpO1xuICByZXR1cm4gY29uZmlnIGFzIFJlcXVpcmVkPHR5cGVvZiBjb25maWc+O1xufVxuXG4vKiogVmFsaWRhdGUgYW4gaW5kaXZpZHVhbCBGb3JtYXR0ZXIgY29uZmlnLiAqL1xuZnVuY3Rpb24gY2hlY2tGb3JtYXR0ZXJDb25maWcoa2V5OiBzdHJpbmcsIGNvbmZpZzogUGFydGlhbDxGb3JtYXR0ZXI+LCBlcnJvcnM6IHN0cmluZ1tdKSB7XG4gIGlmIChjb25maWcubWF0Y2hlcnMgPT09IHVuZGVmaW5lZCkge1xuICAgIGVycm9ycy5wdXNoKGBNaXNzaW5nIFwiZm9ybWF0LiR7a2V5fS5tYXRjaGVyc1wiIHZhbHVlYCk7XG4gIH1cbn1cbiJdfQ==