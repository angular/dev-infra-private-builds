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
                            console_1.error(console_1.red("The following files could not be formatted:"));
                            failures.forEach(function (_a) {
                                var filePath = _a.filePath, message = _a.message;
                                console_1.info("  \u2022 " + filePath + ": " + message);
                            });
                            console_1.error(console_1.red("Formatting failed, see errors above for more information."));
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
            var failures, failures_1, failures_1_1, filePath, runFormatter;
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
                                filePath = failures_1_1.value.filePath;
                                console_1.info("  \u2022 " + filePath);
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
                        return [4 /*yield*/, formatFiles(failures.map(function (f) { return f.filePath; }))];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUFpRTtJQUVqRSxpR0FBK0Q7SUFFL0Q7O09BRUc7SUFDSCxTQUFzQixXQUFXLENBQUMsS0FBZTs7Ozs7NEJBRWhDLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELFFBQVEsR0FBRyxTQUE2Qzt3QkFFNUQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQzs0QkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsNkVBQTZFO3dCQUM3RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN6QixlQUFLLENBQUMsYUFBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQW1CO29DQUFsQixRQUFRLGNBQUEsRUFBRSxPQUFPLGFBQUE7Z0NBQ2xDLGNBQUksQ0FBQyxjQUFPLFFBQVEsVUFBSyxPQUFTLENBQUMsQ0FBQzs0QkFDdEMsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsZUFBSyxDQUFDLGFBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDLENBQUM7NEJBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyw4QkFBeUIsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQXBCRCxrQ0FvQkM7SUFFRDs7T0FFRztJQUNILFNBQXNCLFVBQVUsQ0FBQyxLQUFlOzs7Ozs7NEJBRTdCLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBQTs7d0JBQXZELFFBQVEsR0FBRyxTQUE0Qzt3QkFFN0QsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs0QkFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBRUcsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUN2RCxLQUF5QixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBdkIsUUFBUSw4QkFBQTtnQ0FDbEIsY0FBSSxDQUFDLGNBQU8sUUFBVSxDQUFDLENBQUM7NkJBQ3pCOzs7Ozs7Ozs7d0JBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzt3QkFHSCxZQUFZLEdBQUcsS0FBSyxDQUFDOzZCQUNyQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQWxCLHdCQUFrQjt3QkFDTCxxQkFBTSx1QkFBYSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxFQUFBOzt3QkFBakUsWUFBWSxHQUFHLFNBQWtELENBQUM7Ozs2QkFHaEUsWUFBWSxFQUFaLHdCQUFZO3dCQUNkLHlDQUF5Qzt3QkFDekMscUJBQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxFQUFWLENBQVUsQ0FBQyxDQUFDLEVBQUE7O3dCQURoRCx5Q0FBeUM7d0JBQ3pDLFNBQWdELENBQUM7d0JBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozt3QkFFaEIsaURBQWlEO3dCQUNqRCxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQzt3QkFDOUQsY0FBSSxDQUFDLGdDQUE4QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7d0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBR2xCLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3dCQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7S0FFbkI7SUF2Q0QsZ0NBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3IsIGluZm8sIHByb21wdENvbmZpcm0sIHJlZH0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7cnVuRm9ybWF0dGVySW5QYXJhbGxlbH0gZnJvbSAnLi9ydW4tY29tbWFuZHMtcGFyYWxsZWwnO1xuXG4vKipcbiAqIEZvcm1hdCBwcm92aWRlZCBmaWxlcyBpbiBwbGFjZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcm1hdEZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBXaGV0aGVyIGFueSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBsZXQgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnZm9ybWF0Jyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGluZm8oJ05vIGZpbGVzIG1hdGNoZWQgZm9yIGZvcm1hdHRpbmcuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIGV4aXQgYXMgYSBmYWlsdXJlIGlmIGFueSBvZiB0aGUgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHJlZChgVGhlIGZvbGxvd2luZyBmaWxlcyBjb3VsZCBub3QgYmUgZm9ybWF0dGVkOmApKTtcbiAgICBmYWlsdXJlcy5mb3JFYWNoKCh7ZmlsZVBhdGgsIG1lc3NhZ2V9KSA9PiB7XG4gICAgICBpbmZvKGAgIOKAoiAke2ZpbGVQYXRofTogJHttZXNzYWdlfWApO1xuICAgIH0pO1xuICAgIGVycm9yKHJlZChgRm9ybWF0dGluZyBmYWlsZWQsIHNlZSBlcnJvcnMgYWJvdmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBpbmZvKGDiiJogIEZvcm1hdHRpbmcgY29tcGxldGUuYCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuLyoqXG4gKiBDaGVjayBwcm92aWRlZCBmaWxlcyBmb3IgZm9ybWF0dGluZyBjb3JyZWN0bmVzcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgbm90IGZvcm1hdHRlZCBjb3JyZWN0bHkuXG4gIGNvbnN0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2NoZWNrJyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGluZm8oJ05vIGZpbGVzIG1hdGNoZWQgZm9yIGZvcm1hdHRpbmcgY2hlY2suJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCkge1xuICAgIC8vIFByb3ZpZGUgb3V0cHV0IGV4cHJlc3Npbmcgd2hpY2ggZmlsZXMgYXJlIGZhaWxpbmcgZm9ybWF0dGluZy5cbiAgICBpbmZvLmdyb3VwKCdcXG5UaGUgZm9sbG93aW5nIGZpbGVzIGFyZSBvdXQgb2YgZm9ybWF0OicpO1xuICAgIGZvciAoY29uc3Qge2ZpbGVQYXRofSBvZiBmYWlsdXJlcykge1xuICAgICAgaW5mbyhgICDigKIgJHtmaWxlUGF0aH1gKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcblxuICAgIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gICAgbGV0IHJ1bkZvcm1hdHRlciA9IGZhbHNlO1xuICAgIGlmICghcHJvY2Vzcy5lbnZbJ0NJJ10pIHtcbiAgICAgIHJ1bkZvcm1hdHRlciA9IGF3YWl0IHByb21wdENvbmZpcm0oJ0Zvcm1hdCB0aGUgZmlsZXMgbm93PycsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChydW5Gb3JtYXR0ZXIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgZmFpbGluZyBmaWxlcyBhcyByZXF1ZXN0ZWQuXG4gICAgICBhd2FpdCBmb3JtYXRGaWxlcyhmYWlsdXJlcy5tYXAoZiA9PiBmLmZpbGVQYXRoKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluZm9ybSB1c2VyIGhvdyB0byBmb3JtYXQgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgIGluZm8oKTtcbiAgICAgIGluZm8oYFRvIGZvcm1hdCB0aGUgZmFpbGluZyBmaWxlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgICBpbmZvKGAgIHlhcm4gbmctZGV2IGZvcm1hdCBmaWxlcyAke2ZhaWx1cmVzLmpvaW4oJyAnKX1gKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5mbygn4oiaICBBbGwgZmlsZXMgY29ycmVjdGx5IGZvcm1hdHRlZC4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbn1cbiJdfQ==