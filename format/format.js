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
        define("@angular/dev-infra-private/format/format", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/run-commands-parallel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkFiles = exports.formatFiles = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var run_commands_parallel_1 = require("@angular/dev-infra-private/format/run-commands-parallel");
    /**
     * Format provided files in place.
     */
    function formatFiles(files) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var failures;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, run_commands_parallel_1.runFormatterInParallel(files, 'format')];
                    case 1:
                        failures = _a.sent();
                        if (failures === false) {
                            console_1.info('No files matched for formatting.');
                            process.exit(0);
                        }
                        // The process should exit as a failure if any of the files failed to format.
                        if (failures.length !== 0) {
                            console_1.error("Formatting failed, see errors above for more information.");
                            process.exit(1);
                        }
                        console_1.info("\u221A  Formatting complete.");
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.formatFiles = formatFiles;
    /**
     * Check provided files for formatting correctness.
     */
    function checkFiles(files) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var failures, failures_1, failures_1_1, file, runFormatter;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, run_commands_parallel_1.runFormatterInParallel(files, 'check')];
                    case 1:
                        failures = _b.sent();
                        if (failures === false) {
                            console_1.info('No files matched for formatting check.');
                            process.exit(0);
                        }
                        if (!failures.length) return [3 /*break*/, 7];
                        // Provide output expressing which files are failing formatting.
                        console_1.info.group('\nThe following files are out of format:');
                        try {
                            for (failures_1 = tslib_1.__values(failures), failures_1_1 = failures_1.next(); !failures_1_1.done; failures_1_1 = failures_1.next()) {
                                file = failures_1_1.value;
                                console_1.info("  - " + file);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (failures_1_1 && !failures_1_1.done && (_a = failures_1.return)) _a.call(failures_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        console_1.info.groupEnd();
                        console_1.info();
                        runFormatter = false;
                        if (!!process.env['CI']) return [3 /*break*/, 3];
                        return [4 /*yield*/, inquirer_1.prompt({
                                type: 'confirm',
                                name: 'runFormatter',
                                message: 'Format the files now?',
                            })];
                    case 2:
                        runFormatter = (_b.sent()).runFormatter;
                        _b.label = 3;
                    case 3:
                        if (!runFormatter) return [3 /*break*/, 5];
                        // Format the failing files as requested.
                        return [4 /*yield*/, formatFiles(failures)];
                    case 4:
                        // Format the failing files as requested.
                        _b.sent();
                        process.exit(0);
                        return [3 /*break*/, 6];
                    case 5:
                        // Inform user how to format files in the future.
                        console_1.info();
                        console_1.info("To format the failing file run the following command:");
                        console_1.info("  yarn ng-dev format files " + failures.join(' '));
                        process.exit(1);
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        console_1.info('√  All files correctly formatted.');
                        process.exit(0);
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    exports.checkFiles = checkFiles;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFDQUFnQztJQUVoQyxvRUFBNkM7SUFFN0MsaUdBQStEO0lBRS9EOztPQUVHO0lBQ0gsU0FBc0IsV0FBVyxDQUFDLEtBQWU7Ozs7OzRCQUVoQyxxQkFBTSw4Q0FBc0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxRQUFRLEdBQUcsU0FBNkM7d0JBRTVELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTs0QkFDdEIsY0FBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7NEJBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELDZFQUE2RTt3QkFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDekIsZUFBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7NEJBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyw4QkFBeUIsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQWhCRCxrQ0FnQkM7SUFFRDs7T0FFRztJQUNILFNBQXNCLFVBQVUsQ0FBQyxLQUFlOzs7Ozs7NEJBRTdCLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBQTs7d0JBQXZELFFBQVEsR0FBRyxTQUE0Qzt3QkFFN0QsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs0QkFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBRUcsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUN2RCxLQUFtQixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBbEIsSUFBSTtnQ0FDYixjQUFJLENBQUMsU0FBTyxJQUFNLENBQUMsQ0FBQzs2QkFDckI7Ozs7Ozs7Ozt3QkFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2hCLGNBQUksRUFBRSxDQUFDO3dCQUdILFlBQVksR0FBRyxLQUFLLENBQUM7NkJBQ3JCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBbEIsd0JBQWtCO3dCQUNKLHFCQUFNLGlCQUFNLENBQUM7Z0NBQ1osSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLGNBQWM7Z0NBQ3BCLE9BQU8sRUFBRSx1QkFBdUI7NkJBQ2pDLENBQUMsRUFBQTs7d0JBSmpCLFlBQVksR0FBRyxDQUFDLFNBSUMsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7OzZCQUc5QixZQUFZLEVBQVosd0JBQVk7d0JBQ2QseUNBQXlDO3dCQUN6QyxxQkFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUQzQix5Q0FBeUM7d0JBQ3pDLFNBQTJCLENBQUM7d0JBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozt3QkFFaEIsaURBQWlEO3dCQUNqRCxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQzt3QkFDOUQsY0FBSSxDQUFDLGdDQUE4QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7d0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBR2xCLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3dCQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7S0FFbkI7SUEzQ0QsZ0NBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7ZXJyb3IsIGluZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3J1bkZvcm1hdHRlckluUGFyYWxsZWx9IGZyb20gJy4vcnVuLWNvbW1hbmRzLXBhcmFsbGVsJztcblxuLyoqXG4gKiBGb3JtYXQgcHJvdmlkZWQgZmlsZXMgaW4gcGxhY2UuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb3JtYXRGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gV2hldGhlciBhbnkgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgbGV0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2Zvcm1hdCcpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIFRoZSBwcm9jZXNzIHNob3VsZCBleGl0IGFzIGEgZmFpbHVyZSBpZiBhbnkgb2YgdGhlIGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcihgRm9ybWF0dGluZyBmYWlsZWQsIHNlZSBlcnJvcnMgYWJvdmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uYCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKipcbiAqIENoZWNrIHByb3ZpZGVkIGZpbGVzIGZvciBmb3JtYXR0aW5nIGNvcnJlY3RuZXNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBub3QgZm9ybWF0dGVkIGNvcnJlY3RseS5cbiAgY29uc3QgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnY2hlY2snKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZyBjaGVjay4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgLy8gUHJvdmlkZSBvdXRwdXQgZXhwcmVzc2luZyB3aGljaCBmaWxlcyBhcmUgZmFpbGluZyBmb3JtYXR0aW5nLlxuICAgIGluZm8uZ3JvdXAoJ1xcblRoZSBmb2xsb3dpbmcgZmlsZXMgYXJlIG91dCBvZiBmb3JtYXQ6Jyk7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZhaWx1cmVzKSB7XG4gICAgICBpbmZvKGAgIC0gJHtmaWxlfWApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgICBsZXQgcnVuRm9ybWF0dGVyID0gZmFsc2U7XG4gICAgaWYgKCFwcm9jZXNzLmVudlsnQ0knXSkge1xuICAgICAgcnVuRm9ybWF0dGVyID0gKGF3YWl0IHByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3J1bkZvcm1hdHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdGb3JtYXQgdGhlIGZpbGVzIG5vdz8nLFxuICAgICAgICAgICAgICAgICAgICAgfSkpLnJ1bkZvcm1hdHRlcjtcbiAgICB9XG5cbiAgICBpZiAocnVuRm9ybWF0dGVyKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGZhaWxpbmcgZmlsZXMgYXMgcmVxdWVzdGVkLlxuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoZmFpbHVyZXMpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBpbmZvKCk7XG4gICAgICBpbmZvKGBUbyBmb3JtYXQgdGhlIGZhaWxpbmcgZmlsZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgICAgaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5qb2luKCcgJyl9YCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluZm8oJ+KImiAgQWxsIGZpbGVzIGNvcnJlY3RseSBmb3JtYXR0ZWQuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG59XG4iXX0=