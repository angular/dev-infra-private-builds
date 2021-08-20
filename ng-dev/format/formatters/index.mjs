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
    const config = config_1.getConfig();
    config_2.assertValidFormatConfig(config);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvZm9ybWF0L2Zvcm1hdHRlcnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQTZDO0FBQzdDLHNDQUFrRDtBQUVsRCw2Q0FBd0M7QUFDeEMsaURBQTJDO0FBQzNDLHlDQUFvQztBQUVwQzs7R0FFRztBQUNILFNBQWdCLG1CQUFtQjtJQUNqQyxNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsZ0NBQXVCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFaEMsT0FBTztRQUNMLElBQUksbUJBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzNCLElBQUksdUJBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzdCLElBQUksMEJBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0tBQy9CLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBVEQsa0RBU0M7QUFFRCw0Q0FBNEM7QUFDNUMsbURBQTREO0FBQXBELDJHQUFBLFNBQVMsT0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRGb3JtYXRDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5cbmltcG9ydCB7QnVpbGRpZmllcn0gZnJvbSAnLi9idWlsZGlmaWVyJztcbmltcG9ydCB7Q2xhbmdGb3JtYXR9IGZyb20gJy4vY2xhbmctZm9ybWF0JztcbmltcG9ydCB7UHJldHRpZXJ9IGZyb20gJy4vcHJldHRpZXInO1xuXG4vKipcbiAqIEdldCBhbGwgZGVmaW5lZCBmb3JtYXR0ZXJzIHdoaWNoIGFyZSBhY3RpdmUgYmFzZWQgb24gdGhlIGN1cnJlbnQgbG9hZGVkIGNvbmZpZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGl2ZUZvcm1hdHRlcnMoKSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZEZvcm1hdENvbmZpZyhjb25maWcpO1xuXG4gIHJldHVybiBbXG4gICAgbmV3IFByZXR0aWVyKGNvbmZpZy5mb3JtYXQpLFxuICAgIG5ldyBCdWlsZGlmaWVyKGNvbmZpZy5mb3JtYXQpLFxuICAgIG5ldyBDbGFuZ0Zvcm1hdChjb25maWcuZm9ybWF0KSxcbiAgXS5maWx0ZXIoKGZvcm1hdHRlcikgPT4gZm9ybWF0dGVyLmlzRW5hYmxlZCgpKTtcbn1cblxuLy8gUmV4cG9ydCBzeW1ib2xzIHVzZWQgZm9yIHR5cGVzIGVsc2V3aGVyZS5cbmV4cG9ydCB7Rm9ybWF0dGVyLCBGb3JtYXR0ZXJBY3Rpb259IGZyb20gJy4vYmFzZS1mb3JtYXR0ZXInO1xuIl19