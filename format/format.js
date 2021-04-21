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
        define("@angular/dev-infra-private/format/format", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/run-commands-parallel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkFiles = exports.formatFiles = void 0;
    var tslib_1 = require("tslib");
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
                        return [4 /*yield*/, console_1.promptConfirm('Format the files now?', true)];
                    case 2:
                        runFormatter = _b.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUE0RDtJQUU1RCxpR0FBK0Q7SUFFL0Q7O09BRUc7SUFDSCxTQUFzQixXQUFXLENBQUMsS0FBZTs7Ozs7NEJBRWhDLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELFFBQVEsR0FBRyxTQUE2Qzt3QkFFNUQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQzs0QkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsNkVBQTZFO3dCQUM3RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN6QixlQUFLLENBQUMsMkRBQTJELENBQUMsQ0FBQzs0QkFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBQ0QsY0FBSSxDQUFDLDhCQUF5QixDQUFDLENBQUM7d0JBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pCO0lBaEJELGtDQWdCQztJQUVEOztPQUVHO0lBQ0gsU0FBc0IsVUFBVSxDQUFDLEtBQWU7Ozs7Ozs0QkFFN0IscUJBQU0sOENBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFBOzt3QkFBdkQsUUFBUSxHQUFHLFNBQTRDO3dCQUU3RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7NEJBQ3RCLGNBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDOzRCQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjs2QkFFRyxRQUFRLENBQUMsTUFBTSxFQUFmLHdCQUFlO3dCQUNqQixnRUFBZ0U7d0JBQ2hFLGNBQUksQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQzs7NEJBQ3ZELEtBQW1CLGFBQUEsaUJBQUEsUUFBUSxDQUFBLDBGQUFFO2dDQUFsQixJQUFJO2dDQUNiLGNBQUksQ0FBQyxTQUFPLElBQU0sQ0FBQyxDQUFDOzZCQUNyQjs7Ozs7Ozs7O3dCQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDaEIsY0FBSSxFQUFFLENBQUM7d0JBR0gsWUFBWSxHQUFHLEtBQUssQ0FBQzs2QkFDckIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFsQix3QkFBa0I7d0JBQ0wscUJBQU0sdUJBQWEsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsRUFBQTs7d0JBQWpFLFlBQVksR0FBRyxTQUFrRCxDQUFDOzs7NkJBR2hFLFlBQVksRUFBWix3QkFBWTt3QkFDZCx5Q0FBeUM7d0JBQ3pDLHFCQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBQTs7d0JBRDNCLHlDQUF5Qzt3QkFDekMsU0FBMkIsQ0FBQzt3QkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O3dCQUVoQixpREFBaUQ7d0JBQ2pELGNBQUksRUFBRSxDQUFDO3dCQUNQLGNBQUksQ0FBQyx1REFBdUQsQ0FBQyxDQUFDO3dCQUM5RCxjQUFJLENBQUMsZ0NBQThCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQzt3QkFDekQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFHbEIsY0FBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztLQUVuQjtJQXZDRCxnQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybX0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7cnVuRm9ybWF0dGVySW5QYXJhbGxlbH0gZnJvbSAnLi9ydW4tY29tbWFuZHMtcGFyYWxsZWwnO1xuXG4vKipcbiAqIEZvcm1hdCBwcm92aWRlZCBmaWxlcyBpbiBwbGFjZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcm1hdEZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBXaGV0aGVyIGFueSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBsZXQgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnZm9ybWF0Jyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGluZm8oJ05vIGZpbGVzIG1hdGNoZWQgZm9yIGZvcm1hdHRpbmcuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIGV4aXQgYXMgYSBmYWlsdXJlIGlmIGFueSBvZiB0aGUgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKGBGb3JtYXR0aW5nIGZhaWxlZCwgc2VlIGVycm9ycyBhYm92ZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgaW5mbyhg4oiaICBGb3JtYXR0aW5nIGNvbXBsZXRlLmApO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvdmlkZWQgZmlsZXMgZm9yIGZvcm1hdHRpbmcgY29ycmVjdG5lc3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0ZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBGaWxlcyB3aGljaCBhcmUgY3VycmVudGx5IG5vdCBmb3JtYXR0ZWQgY29ycmVjdGx5LlxuICBjb25zdCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdjaGVjaycpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nIGNoZWNrLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAvLyBQcm92aWRlIG91dHB1dCBleHByZXNzaW5nIHdoaWNoIGZpbGVzIGFyZSBmYWlsaW5nIGZvcm1hdHRpbmcuXG4gICAgaW5mby5ncm91cCgnXFxuVGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgb3V0IG9mIGZvcm1hdDonKTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmFpbHVyZXMpIHtcbiAgICAgIGluZm8oYCAgLSAke2ZpbGV9YCk7XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG5cbiAgICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICAgIGxldCBydW5Gb3JtYXR0ZXIgPSBmYWxzZTtcbiAgICBpZiAoIXByb2Nlc3MuZW52WydDSSddKSB7XG4gICAgICBydW5Gb3JtYXR0ZXIgPSBhd2FpdCBwcm9tcHRDb25maXJtKCdGb3JtYXQgdGhlIGZpbGVzIG5vdz8nLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAocnVuRm9ybWF0dGVyKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGZhaWxpbmcgZmlsZXMgYXMgcmVxdWVzdGVkLlxuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoZmFpbHVyZXMpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBpbmZvKCk7XG4gICAgICBpbmZvKGBUbyBmb3JtYXQgdGhlIGZhaWxpbmcgZmlsZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgICAgaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5qb2luKCcgJyl9YCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluZm8oJ+KImiAgQWxsIGZpbGVzIGNvcnJlY3RseSBmb3JtYXR0ZWQuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG59XG4iXX0=