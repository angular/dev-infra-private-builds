"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormatConfig = void 0;
const config_1 = require("../utils/config");
/** Retrieve and validate the config as `FormatConfig`. */
function getFormatConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The unvalidated config object.
    const config = config_1.getConfig();
    if (config.format === undefined) {
        errors.push(`No configuration defined for "format"`);
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
    config_1.assertNoErrors(errors);
    return config;
}
exports.getFormatConfig = getFormatConfig;
/** Validate an individual Formatter config. */
function checkFormatterConfig(key, config, errors) {
    if (config.matchers === undefined) {
        errors.push(`Missing "format.${key}.matchers" value`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQXVFO0FBVXZFLDBEQUEwRDtBQUMxRCxTQUFnQixlQUFlO0lBQzdCLG9EQUFvRDtJQUNwRCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFDNUIsaUNBQWlDO0lBQ2pDLE1BQU0sTUFBTSxHQUFpRCxrQkFBUyxFQUFFLENBQUM7SUFFekUsSUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtRQUMvQixNQUFNLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7S0FDdEQ7SUFFRCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTyxDQUFDLEVBQUU7UUFDekQsUUFBUSxPQUFPLEtBQUssRUFBRTtZQUNwQixLQUFLLFNBQVM7Z0JBQ1osTUFBTTtZQUNSLEtBQUssUUFBUTtnQkFDWCxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN6QyxNQUFNO1lBQ1I7Z0JBQ0UsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLEdBQUcsd0NBQXdDLENBQUMsQ0FBQztTQUN2RTtLQUNGO0lBRUQsdUJBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQWlDLENBQUM7QUFDM0MsQ0FBQztBQXhCRCwwQ0F3QkM7QUFFRCwrQ0FBK0M7QUFDL0MsU0FBUyxvQkFBb0IsQ0FBQyxHQUFXLEVBQUUsTUFBMEIsRUFBRSxNQUFnQjtJQUNyRixJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssU0FBUyxFQUFFO1FBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsa0JBQWtCLENBQUMsQ0FBQztLQUN2RDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHthc3NlcnROb0Vycm9ycywgZ2V0Q29uZmlnLCBOZ0RldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW50ZXJmYWNlIEZvcm1hdHRlciB7XG4gIG1hdGNoZXJzOiBzdHJpbmdbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRDb25maWcge1xuICBba2V5OiBzdHJpbmddOiBib29sZWFuIHwgRm9ybWF0dGVyO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYEZvcm1hdENvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9ybWF0Q29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIHVudmFsaWRhdGVkIGNvbmZpZyBvYmplY3QuXG4gIGNvbnN0IGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZzx7Zm9ybWF0OiBGb3JtYXRDb25maWd9Pj4gPSBnZXRDb25maWcoKTtcblxuICBpZiAoY29uZmlnLmZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgXCJmb3JtYXRcImApO1xuICB9XG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmZvcm1hdCEpKSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIGNoZWNrRm9ybWF0dGVyQ29uZmlnKGtleSwgdmFsdWUsIGVycm9ycyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZXJyb3JzLnB1c2goYFwiZm9ybWF0LiR7a2V5fVwiIGlzIG5vdCBhIGJvb2xlYW4gb3IgRm9ybWF0dGVyIG9iamVjdGApO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgUmVxdWlyZWQ8dHlwZW9mIGNvbmZpZz47XG59XG5cbi8qKiBWYWxpZGF0ZSBhbiBpbmRpdmlkdWFsIEZvcm1hdHRlciBjb25maWcuICovXG5mdW5jdGlvbiBjaGVja0Zvcm1hdHRlckNvbmZpZyhrZXk6IHN0cmluZywgY29uZmlnOiBQYXJ0aWFsPEZvcm1hdHRlcj4sIGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGNvbmZpZy5tYXRjaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE1pc3NpbmcgXCJmb3JtYXQuJHtrZXl9Lm1hdGNoZXJzXCIgdmFsdWVgKTtcbiAgfVxufVxuIl19