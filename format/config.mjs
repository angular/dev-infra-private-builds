/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { assertNoErrors, getConfig } from '../utils/config';
/** Retrieve and validate the config as `FormatConfig`. */
export function getFormatConfig() {
    // List of errors encountered validating the config.
    const errors = [];
    // The unvalidated config object.
    const config = getConfig();
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
    assertNoErrors(errors);
    return config;
}
/** Validate an individual Formatter config. */
function checkFormatterConfig(key, config, errors) {
    if (config.matchers === undefined) {
        errors.push(`Missing "format.${key}.matchers" value`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQVV2RSwwREFBMEQ7QUFDMUQsTUFBTSxVQUFVLGVBQWU7SUFDN0Isb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixpQ0FBaUM7SUFDakMsTUFBTSxNQUFNLEdBQWlELFNBQVMsRUFBRSxDQUFDO0lBRXpFLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxFQUFFO1FBQ3pELFFBQVEsT0FBTyxLQUFLLEVBQUU7WUFDcEIsS0FBSyxTQUFTO2dCQUNaLE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUNSO2dCQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLHdDQUF3QyxDQUFDLENBQUM7U0FDdkU7S0FDRjtJQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQWlDLENBQUM7QUFDM0MsQ0FBQztBQUVELCtDQUErQztBQUMvQyxTQUFTLG9CQUFvQixDQUFDLEdBQVcsRUFBRSxNQUEwQixFQUFFLE1BQWdCO0lBQ3JGLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydE5vRXJyb3JzLCBnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5pbnRlcmZhY2UgRm9ybWF0dGVyIHtcbiAgbWF0Y2hlcnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdENvbmZpZyB7XG4gIFtrZXk6IHN0cmluZ106IGJvb2xlYW58Rm9ybWF0dGVyO1xufVxuXG4vKiogUmV0cmlldmUgYW5kIHZhbGlkYXRlIHRoZSBjb25maWcgYXMgYEZvcm1hdENvbmZpZ2AuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Rm9ybWF0Q29uZmlnKCkge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgLy8gVGhlIHVudmFsaWRhdGVkIGNvbmZpZyBvYmplY3QuXG4gIGNvbnN0IGNvbmZpZzogUGFydGlhbDxOZ0RldkNvbmZpZzx7Zm9ybWF0OiBGb3JtYXRDb25maWd9Pj4gPSBnZXRDb25maWcoKTtcblxuICBpZiAoY29uZmlnLmZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIGNvbmZpZ3VyYXRpb24gZGVmaW5lZCBmb3IgXCJmb3JtYXRcImApO1xuICB9XG5cbiAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoY29uZmlnLmZvcm1hdCEpKSB7XG4gICAgc3dpdGNoICh0eXBlb2YgdmFsdWUpIHtcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ29iamVjdCc6XG4gICAgICAgIGNoZWNrRm9ybWF0dGVyQ29uZmlnKGtleSwgdmFsdWUsIGVycm9ycyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZXJyb3JzLnB1c2goYFwiZm9ybWF0LiR7a2V5fVwiIGlzIG5vdCBhIGJvb2xlYW4gb3IgRm9ybWF0dGVyIG9iamVjdGApO1xuICAgIH1cbiAgfVxuXG4gIGFzc2VydE5vRXJyb3JzKGVycm9ycyk7XG4gIHJldHVybiBjb25maWcgYXMgUmVxdWlyZWQ8dHlwZW9mIGNvbmZpZz47XG59XG5cbi8qKiBWYWxpZGF0ZSBhbiBpbmRpdmlkdWFsIEZvcm1hdHRlciBjb25maWcuICovXG5mdW5jdGlvbiBjaGVja0Zvcm1hdHRlckNvbmZpZyhrZXk6IHN0cmluZywgY29uZmlnOiBQYXJ0aWFsPEZvcm1hdHRlcj4sIGVycm9yczogc3RyaW5nW10pIHtcbiAgaWYgKGNvbmZpZy5tYXRjaGVycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE1pc3NpbmcgXCJmb3JtYXQuJHtrZXl9Lm1hdGNoZXJzXCIgdmFsdWVgKTtcbiAgfVxufVxuIl19