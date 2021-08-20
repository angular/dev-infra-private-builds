"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidFormatConfig = void 0;
const config_1 = require("../utils/config");
/** Retrieve and validate the config as `FormatConfig`. */
function assertValidFormatConfig(config) {
    // List of errors encountered validating the config.
    const errors = [];
    if (config.format === undefined) {
        throw new config_1.ConfigValidationError(`No configuration defined for "format"`);
    }
    for (const [key, value] of Object.entries(config.format)) {
        switch (typeof value) {
            case 'boolean':
                break;
            case 'object':
                checkFormatterConfig(key, value, errors);
                break;
            default:
                errors.push(`"format.${key}" is not a boolean or Formatter object`);
        }
    }
    if (errors.length) {
        throw new config_1.ConfigValidationError('Invalid "format" configuration', errors);
    }
}
exports.assertValidFormatConfig = assertValidFormatConfig;
/** Validate an individual Formatter config. */
function checkFormatterConfig(key, config, errors) {
    if (config.matchers === undefined) {
        errors.push(`Missing "format.${key}.matchers" value`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQXNEO0FBVXRELDBEQUEwRDtBQUMxRCxTQUFnQix1QkFBdUIsQ0FDckMsTUFBMkM7SUFFM0Msb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO1FBQy9CLE1BQU0sSUFBSSw4QkFBcUIsQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQzFFO0lBRUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxFQUFFO1FBQ3pELFFBQVEsT0FBTyxLQUFLLEVBQUU7WUFDcEIsS0FBSyxTQUFTO2dCQUNaLE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUNSO2dCQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLHdDQUF3QyxDQUFDLENBQUM7U0FDdkU7S0FDRjtJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNqQixNQUFNLElBQUksOEJBQXFCLENBQUMsZ0NBQWdDLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0U7QUFDSCxDQUFDO0FBdkJELDBEQXVCQztBQUVELCtDQUErQztBQUMvQyxTQUFTLG9CQUFvQixDQUFDLEdBQVcsRUFBRSxNQUEwQixFQUFFLE1BQWdCO0lBQ3JGLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbmZpZ1ZhbGlkYXRpb25FcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW50ZXJmYWNlIEZvcm1hdHRlciB7XG4gIG1hdGNoZXJzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRDb25maWcge1xuICBba2V5OiBzdHJpbmddOiBib29sZWFuIHwgRm9ybWF0dGVyO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYEZvcm1hdENvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWRGb3JtYXRDb25maWc8VD4oXG4gIGNvbmZpZzogVCAmIFBhcnRpYWw8e2Zvcm1hdDogRm9ybWF0Q29uZmlnfT4sXG4pOiBhc3NlcnRzIGNvbmZpZyBpcyBUICYge2Zvcm1hdDogRm9ybWF0Q29uZmlnfSB7XG4gIC8vIExpc3Qgb2YgZXJyb3JzIGVuY291bnRlcmVkIHZhbGlkYXRpbmcgdGhlIGNvbmZpZy5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBpZiAoY29uZmlnLmZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IENvbmZpZ1ZhbGlkYXRpb25FcnJvcihgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImZvcm1hdFwiYCk7XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb25maWcuZm9ybWF0ISkpIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgY2hlY2tGb3JtYXR0ZXJDb25maWcoa2V5LCB2YWx1ZSwgZXJyb3JzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBlcnJvcnMucHVzaChgXCJmb3JtYXQuJHtrZXl9XCIgaXMgbm90IGEgYm9vbGVhbiBvciBGb3JtYXR0ZXIgb2JqZWN0YCk7XG4gICAgfVxuICB9XG4gIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IENvbmZpZ1ZhbGlkYXRpb25FcnJvcignSW52YWxpZCBcImZvcm1hdFwiIGNvbmZpZ3VyYXRpb24nLCBlcnJvcnMpO1xuICB9XG59XG5cbi8qKiBWYWxpZGF0ZSBhbiBpbmRpdmlkdWFsIEZvcm1hdHRlciBjb25maWcuICovXG5mdW5jdGlvbiBjaGVja0Zvcm1hdHRlckNvbmZpZyhrZXk6IHN0cmluZywgY29uZmlnOiBQYXJ0aWFsPEZvcm1hdHRlcj4sIGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGNvbmZpZy5tYXRjaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE1pc3NpbmcgXCJmb3JtYXQuJHtrZXl9Lm1hdGNoZXJzXCIgdmFsdWVgKTtcbiAgfVxufVxuIl19