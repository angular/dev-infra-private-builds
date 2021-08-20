"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidReleaseConfig = void 0;
const config_1 = require("../../utils/config");
/** Asserts that the given configuration is a valid `DevInfraReleaseConfig`. */
function assertValidReleaseConfig(config) {
    // List of errors encountered validating the config.
    const errors = [];
    if (config.release === undefined) {
        throw new config_1.ConfigValidationError('No configuration provided for `release`');
    }
    if (config.release.npmPackages === undefined) {
        errors.push(`No "npmPackages" configured for releasing.`);
    }
    if (config.release.buildPackages === undefined) {
        errors.push(`No "buildPackages" function configured for releasing.`);
    }
    if (errors.length) {
        throw new config_1.ConfigValidationError('Invalid `release` configuration', errors);
    }
}
exports.assertValidReleaseConfig = assertValidReleaseConfig;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9jb25maWcvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBR0gsK0NBQW9GO0FBNERwRiwrRUFBK0U7QUFDL0UsU0FBZ0Isd0JBQXdCLENBQ3RDLE1BQTBDO0lBRTFDLG9EQUFvRDtJQUNwRCxNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFFNUIsSUFBSSxNQUFNLENBQUMsT0FBTyxLQUFLLFNBQVMsRUFBRTtRQUNoQyxNQUFNLElBQUksOEJBQXFCLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUM1RTtJQUVELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEtBQUssU0FBUyxFQUFFO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztLQUMzRDtJQUNELElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEtBQUssU0FBUyxFQUFFO1FBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQztLQUN0RTtJQUNELElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNqQixNQUFNLElBQUksOEJBQXFCLENBQUMsaUNBQWlDLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDNUU7QUFDSCxDQUFDO0FBbkJELDREQW1CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcbmltcG9ydCB7YXNzZXJ0Tm9FcnJvcnMsIENvbmZpZ1ZhbGlkYXRpb25FcnJvciwgZ2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBidWlsdCBwYWNrYWdlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBCdWlsdFBhY2thZ2Uge1xuICAvKiogTmFtZSBvZiB0aGUgcGFja2FnZS4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogUGF0aCB0byB0aGUgcGFja2FnZSBvdXRwdXQgZGlyZWN0b3J5LiAqL1xuICBvdXRwdXRQYXRoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBzdGFnaW5nIGFuZCBwdWJsaXNoaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUNvbmZpZyB7XG4gIC8qKiBSZWdpc3RyeSBVUkwgdXNlZCBmb3IgcHVibGlzaGluZyByZWxlYXNlIHBhY2thZ2VzLiBEZWZhdWx0cyB0byB0aGUgTlBNIHJlZ2lzdHJ5LiAqL1xuICBwdWJsaXNoUmVnaXN0cnk/OiBzdHJpbmc7XG4gIC8qKiBMaXN0IG9mIE5QTSBwYWNrYWdlcyB0aGF0IGFyZSBwdWJsaXNoZWQgYXMgcGFydCBvZiB0aGlzIHByb2plY3QuICovXG4gIG5wbVBhY2thZ2VzOiBzdHJpbmdbXTtcbiAgLyoqIEJ1aWxkcyByZWxlYXNlIHBhY2thZ2VzIGFuZCByZXR1cm5zIGEgbGlzdCBvZiBwYXRocyBwb2ludGluZyB0byB0aGUgb3V0cHV0LiAqL1xuICBidWlsZFBhY2thZ2VzOiAoc3RhbXBGb3JSZWxlYXNlPzogYm9vbGVhbikgPT4gUHJvbWlzZTxCdWlsdFBhY2thZ2VbXSB8IG51bGw+O1xuICAvKiogVGhlIGxpc3Qgb2YgZ2l0aHViIGxhYmVscyB0byBhZGQgdG8gdGhlIHJlbGVhc2UgUFJzLiAqL1xuICByZWxlYXNlUHJMYWJlbHM/OiBzdHJpbmdbXTtcbiAgLyoqIENvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIHJlbGVhc2Ugbm90ZXMgZHVyaW5nIHB1Ymxpc2hpbmcuICovXG4gIHJlbGVhc2VOb3Rlcz86IFJlbGVhc2VOb3Rlc0NvbmZpZztcbn1cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIHJlbGVhc2Ugbm90ZXMgZHVyaW5nIHB1Ymxpc2hpbmcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VOb3Rlc0NvbmZpZyB7XG4gIC8qKiBXaGV0aGVyIHRvIHByb21wdCBmb3IgYW5kIGluY2x1ZGUgYSByZWxlYXNlIHRpdGxlIGluIHRoZSBnZW5lcmF0ZWQgcmVsZWFzZSBub3Rlcy4gKi9cbiAgdXNlUmVsZWFzZVRpdGxlPzogYm9vbGVhbjtcbiAgLyoqIExpc3Qgb2YgY29tbWl0IHNjb3BlcyB0byBleGNsdWRlIGZyb20gZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMuICovXG4gIGhpZGRlblNjb3Blcz86IHN0cmluZ1tdO1xuICAvKiogT3B0aW9uYWwgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byBjYXRlZ29yaXplIGNvbW1pdHMgZm9yIHRoZSByZWxlYXNlIG5vdGVzLiAqL1xuICBjYXRlZ29yaXplQ29tbWl0PzogKGNvbW1pdDogQ29tbWl0RnJvbUdpdExvZykgPT4ge1xuICAgIC8qKlxuICAgICAqIE5hbWUgb2YgdGhlIGdyb3VwIHRoZSBjb21taXQgc2hvdWxkIGJlIGRpc3BsYXllZCB3aXRoaW4uIElmIG5vdCBzcGVjaWZpZWQsXG4gICAgICogY29tbWl0cyB3aWxsIGJlIGdyb3VwZWQgYmFzZWQgb24gdGhlaXIgc2NvcGUuXG4gICAgICovXG4gICAgZ3JvdXBOYW1lPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIERlc2NyaXB0aW9uIG9mIHRoZSBjb21taXQuIFRoaXMgb3B0aW9uIGFsbG93cyBjb25zdW1lcnMgdG8gaW5jb3Jwb3JhdGUgYWRkaXRpb25hbFxuICAgICAqIGluZm9ybWF0aW9uIGZvciBjb21taXRzIHRoYXQgd291bGQgb3RoZXJ3aXNlIG5vdCBiZSBjYXB0dXJlZC5cbiAgICAgKlxuICAgICAqIElmIG5vdCBzcGVjaWZpZWQsIHRoZSBjb21taXQgc3ViamVjdCBpcyB1c2VkIGFzIGRlc2NyaXB0aW9uLiBpLmUuIHRoZSBkZXNjcmlwdGlvbiBkb2VzXG4gICAgICogbm90IGluY2x1ZGUgdGhlIHR5cGUgYW5kIHNjb3BlLiBlLmcuIGBmaXgoYSk6IDxkZXNjPmAgd2lsbCB0dXJuIGludG8gYDxkZXNjPmAuXG4gICAgICovXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIH07XG4gIC8qKlxuICAgKiBMaXN0IHRoYXQgY2FuIGJlIHNldCB0byBjb250cm9sIHRoZSBvcmRlciBvZiBob3cgZ3JvdXBzIGFwcGVhciBpbiB0aGUgcmVsZWFzZVxuICAgKiBub3Rlcy4gRWxlbWVudHMgaW4gdGhlIGxpc3QgbmVlZCB0byBtYXRjaCB3aXRoIHRoZSBncm91cHMgYXMgZGV0ZXJtaW5lZCBhY2NvcmRpbmdcbiAgICogdG8gdGhlIGBjb21taXRUb0dyb3VwYCBvcHRpb24uXG4gICAqXG4gICAqIEVhY2ggZ3JvdXAgZm9yIHRoZSByZWxlYXNlIG5vdGVzLCB3aWxsIGFwcGVhciBpbiB0aGUgb3JkZXIgcHJvdmlkZWQgaW4gYGdyb3VwT3JkZXJgXG4gICAqIGFuZCBhbnkgb3RoZXIgZ3JvdXBzIHdpbGwgYXBwZWFyIGFmdGVyIHRoZXNlIGdyb3Vwcywgc29ydGVkIGFscGhhbnVtZXJpY2FsbHkuXG4gICAqL1xuICBncm91cE9yZGVyPzogc3RyaW5nW107XG59XG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciByZWxlYXNlcyBpbiB0aGUgZGV2LWluZnJhIGNvbmZpZ3VyYXRpb24uICovXG5leHBvcnQgdHlwZSBEZXZJbmZyYVJlbGVhc2VDb25maWcgPSB7cmVsZWFzZTogUmVsZWFzZUNvbmZpZ307XG5cbi8qKiBBc3NlcnRzIHRoYXQgdGhlIGdpdmVuIGNvbmZpZ3VyYXRpb24gaXMgYSB2YWxpZCBgRGV2SW5mcmFSZWxlYXNlQ29uZmlnYC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWc8VD4oXG4gIGNvbmZpZzogVCAmIFBhcnRpYWw8RGV2SW5mcmFSZWxlYXNlQ29uZmlnPixcbik6IGFzc2VydHMgY29uZmlnIGlzIFQgJiBEZXZJbmZyYVJlbGVhc2VDb25maWcge1xuICAvLyBMaXN0IG9mIGVycm9ycyBlbmNvdW50ZXJlZCB2YWxpZGF0aW5nIHRoZSBjb25maWcuXG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAoY29uZmlnLnJlbGVhc2UgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBDb25maWdWYWxpZGF0aW9uRXJyb3IoJ05vIGNvbmZpZ3VyYXRpb24gcHJvdmlkZWQgZm9yIGByZWxlYXNlYCcpO1xuICB9XG5cbiAgaWYgKGNvbmZpZy5yZWxlYXNlLm5wbVBhY2thZ2VzID09PSB1bmRlZmluZWQpIHtcbiAgICBlcnJvcnMucHVzaChgTm8gXCJucG1QYWNrYWdlc1wiIGNvbmZpZ3VyZWQgZm9yIHJlbGVhc2luZy5gKTtcbiAgfVxuICBpZiAoY29uZmlnLnJlbGVhc2UuYnVpbGRQYWNrYWdlcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZXJyb3JzLnB1c2goYE5vIFwiYnVpbGRQYWNrYWdlc1wiIGZ1bmN0aW9uIGNvbmZpZ3VyZWQgZm9yIHJlbGVhc2luZy5gKTtcbiAgfVxuICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBDb25maWdWYWxpZGF0aW9uRXJyb3IoJ0ludmFsaWQgYHJlbGVhc2VgIGNvbmZpZ3VyYXRpb24nLCBlcnJvcnMpO1xuICB9XG59XG4iXX0=