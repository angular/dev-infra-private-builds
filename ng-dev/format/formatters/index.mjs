"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Formatter = exports.getActiveFormatters = void 0;
const config_1 = require("../../utils/config");
const config_2 = require("../config");
const buildifier_1 = require("./buildifier");
const clang_format_1 = require("./clang-format");
const prettier_1 = require("./prettier");
/**
 * Get all defined formatters which are active based on the current loaded config.
 */
function getActiveFormatters() {
    const config = (0, config_1.getConfig)();
    (0, config_2.assertValidFormatConfig)(config);
    return [
        new prettier_1.Prettier(config.format),
        new buildifier_1.Buildifier(config.format),
        new clang_format_1.ClangFormat(config.format),
    ].filter((formatter) => formatter.isEnabled());
}
exports.getActiveFormatters = getActiveFormatters;
// Rexport symbols used for types elsewhere.
var base_formatter_1 = require("./base-formatter");
Object.defineProperty(exports, "Formatter", { enumerable: true, get: function () { return base_formatter_1.Formatter; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZDO0FBQzdDLHNDQUFrRDtBQUVsRCw2Q0FBd0M7QUFDeEMsaURBQTJDO0FBQzNDLHlDQUFvQztBQUVwQzs7R0FFRztBQUNILFNBQWdCLG1CQUFtQjtJQUNqQyxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF1QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRWhDLE9BQU87UUFDTCxJQUFJLG1CQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUMzQixJQUFJLHVCQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUM3QixJQUFJLDBCQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztLQUMvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7QUFDakQsQ0FBQztBQVRELGtEQVNDO0FBRUQsNENBQTRDO0FBQzVDLG1EQUE0RDtBQUFwRCwyR0FBQSxTQUFTLE9BQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Fzc2VydFZhbGlkRm9ybWF0Q29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuXG5pbXBvcnQge0J1aWxkaWZpZXJ9IGZyb20gJy4vYnVpbGRpZmllcic7XG5pbXBvcnQge0NsYW5nRm9ybWF0fSBmcm9tICcuL2NsYW5nLWZvcm1hdCc7XG5pbXBvcnQge1ByZXR0aWVyfSBmcm9tICcuL3ByZXR0aWVyJztcblxuLyoqXG4gKiBHZXQgYWxsIGRlZmluZWQgZm9ybWF0dGVycyB3aGljaCBhcmUgYWN0aXZlIGJhc2VkIG9uIHRoZSBjdXJyZW50IGxvYWRlZCBjb25maWcuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmVGb3JtYXR0ZXJzKCkge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRGb3JtYXRDb25maWcoY29uZmlnKTtcblxuICByZXR1cm4gW1xuICAgIG5ldyBQcmV0dGllcihjb25maWcuZm9ybWF0KSxcbiAgICBuZXcgQnVpbGRpZmllcihjb25maWcuZm9ybWF0KSxcbiAgICBuZXcgQ2xhbmdGb3JtYXQoY29uZmlnLmZvcm1hdCksXG4gIF0uZmlsdGVyKChmb3JtYXR0ZXIpID0+IGZvcm1hdHRlci5pc0VuYWJsZWQoKSk7XG59XG5cbi8vIFJleHBvcnQgc3ltYm9scyB1c2VkIGZvciB0eXBlcyBlbHNld2hlcmUuXG5leHBvcnQge0Zvcm1hdHRlciwgRm9ybWF0dGVyQWN0aW9ufSBmcm9tICcuL2Jhc2UtZm9ybWF0dGVyJztcbiJdfQ==