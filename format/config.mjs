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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBRSxTQUFTLEVBQWMsTUFBTSxpQkFBaUIsQ0FBQztBQVV2RSwwREFBMEQ7QUFDMUQsTUFBTSxVQUFVLGVBQWU7SUFDN0Isb0RBQW9EO0lBQ3BELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixpQ0FBaUM7SUFDakMsTUFBTSxNQUFNLEdBQWlELFNBQVMsRUFBRSxDQUFDO0lBRXpFLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0tBQ3REO0lBRUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU8sQ0FBQyxFQUFFO1FBQ3pELFFBQVEsT0FBTyxLQUFLLEVBQUU7WUFDcEIsS0FBSyxTQUFTO2dCQUNaLE1BQU07WUFDUixLQUFLLFFBQVE7Z0JBQ1gsb0JBQW9CLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDekMsTUFBTTtZQUNSO2dCQUNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLHdDQUF3QyxDQUFDLENBQUM7U0FDdkU7S0FDRjtJQUVELGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixPQUFPLE1BQWlDLENBQUM7QUFDM0MsQ0FBQztBQUVELCtDQUErQztBQUMvQyxTQUFTLG9CQUFvQixDQUFDLEdBQVcsRUFBRSxNQUEwQixFQUFFLE1BQWdCO0lBQ3JGLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxTQUFTLEVBQUU7UUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Fzc2VydE5vRXJyb3JzLCBnZXRDb25maWcsIE5nRGV2Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5pbnRlcmZhY2UgRm9ybWF0dGVyIHtcbiAgbWF0Y2hlcnM6IHN0cmluZ1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdENvbmZpZyB7XG4gIFtrZXlvZjogc3RyaW5nXTogYm9vbGVhbnxGb3JtYXR0ZXI7XG59XG5cbi8qKiBSZXRyaWV2ZSBhbmQgdmFsaWRhdGUgdGhlIGNvbmZpZyBhcyBgRm9ybWF0Q29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb3JtYXRDb25maWcoKSB7XG4gIC8vIExpc3Qgb2YgZXJyb3JzIGVuY291bnRlcmVkIHZhbGlkYXRpbmcgdGhlIGNvbmZpZy5cbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUaGUgdW52YWxpZGF0ZWQgY29uZmlnIG9iamVjdC5cbiAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE5nRGV2Q29uZmlnPHtmb3JtYXQ6IEZvcm1hdENvbmZpZ30+PiA9IGdldENvbmZpZygpO1xuXG4gIGlmIChjb25maWcuZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gY29uZmlndXJhdGlvbiBkZWZpbmVkIGZvciBcImZvcm1hdFwiYCk7XG4gIH1cblxuICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjb25maWcuZm9ybWF0ISkpIHtcbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgY2hlY2tGb3JtYXR0ZXJDb25maWcoa2V5LCB2YWx1ZSwgZXJyb3JzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBlcnJvcnMucHVzaChgXCJmb3JtYXQuJHtrZXl9XCIgaXMgbm90IGEgYm9vbGVhbiBvciBGb3JtYXR0ZXIgb2JqZWN0YCk7XG4gICAgfVxuICB9XG5cbiAgYXNzZXJ0Tm9FcnJvcnMoZXJyb3JzKTtcbiAgcmV0dXJuIGNvbmZpZyBhcyBSZXF1aXJlZDx0eXBlb2YgY29uZmlnPjtcbn1cblxuLyoqIFZhbGlkYXRlIGFuIGluZGl2aWR1YWwgRm9ybWF0dGVyIGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGNoZWNrRm9ybWF0dGVyQ29uZmlnKGtleTogc3RyaW5nLCBjb25maWc6IFBhcnRpYWw8Rm9ybWF0dGVyPiwgZXJyb3JzOiBzdHJpbmdbXSkge1xuICBpZiAoY29uZmlnLm1hdGNoZXJzID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTWlzc2luZyBcImZvcm1hdC4ke2tleX0ubWF0Y2hlcnNcIiB2YWx1ZWApO1xuICB9XG59XG4iXX0=