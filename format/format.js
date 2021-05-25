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
                        console_1.info("  yarn ng-dev format files " + failures.map(function (f) { return f.filePath; }).join(' '));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUFpRTtJQUVqRSxpR0FBK0Q7SUFFL0Q7O09BRUc7SUFDSCxTQUFzQixXQUFXLENBQUMsS0FBZTs7Ozs7NEJBRWhDLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELFFBQVEsR0FBRyxTQUE2Qzt3QkFFNUQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQzs0QkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBRUQsNkVBQTZFO3dCQUM3RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFOzRCQUN6QixlQUFLLENBQUMsYUFBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLEVBQW1CO29DQUFsQixRQUFRLGNBQUEsRUFBRSxPQUFPLGFBQUE7Z0NBQ2xDLGNBQUksQ0FBQyxjQUFPLFFBQVEsVUFBSyxPQUFTLENBQUMsQ0FBQzs0QkFDdEMsQ0FBQyxDQUFDLENBQUM7NEJBQ0gsZUFBSyxDQUFDLGFBQUcsQ0FBQywyREFBMkQsQ0FBQyxDQUFDLENBQUM7NEJBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyw4QkFBeUIsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQXBCRCxrQ0FvQkM7SUFFRDs7T0FFRztJQUNILFNBQXNCLFVBQVUsQ0FBQyxLQUFlOzs7Ozs7NEJBRTdCLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBQTs7d0JBQXZELFFBQVEsR0FBRyxTQUE0Qzt3QkFFN0QsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs0QkFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBRUcsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUN2RCxLQUF5QixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBdkIsUUFBUSw4QkFBQTtnQ0FDbEIsY0FBSSxDQUFDLGNBQU8sUUFBVSxDQUFDLENBQUM7NkJBQ3pCOzs7Ozs7Ozs7d0JBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNoQixjQUFJLEVBQUUsQ0FBQzt3QkFHSCxZQUFZLEdBQUcsS0FBSyxDQUFDOzZCQUNyQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQWxCLHdCQUFrQjt3QkFDTCxxQkFBTSx1QkFBYSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxFQUFBOzt3QkFBakUsWUFBWSxHQUFHLFNBQWtELENBQUM7Ozs2QkFHaEUsWUFBWSxFQUFaLHdCQUFZO3dCQUNkLHlDQUF5Qzt3QkFDekMscUJBQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsUUFBUSxFQUFWLENBQVUsQ0FBQyxDQUFDLEVBQUE7O3dCQURoRCx5Q0FBeUM7d0JBQ3pDLFNBQWdELENBQUM7d0JBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozt3QkFFaEIsaURBQWlEO3dCQUNqRCxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQzt3QkFDOUQsY0FBSSxDQUFDLGdDQUE4QixRQUFRLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLFFBQVEsRUFBVixDQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQzt3QkFDOUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFHbEIsY0FBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7d0JBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7OztLQUVuQjtJQXZDRCxnQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgZXhpdCBhcyBhIGZhaWx1cmUgaWYgYW55IG9mIHRoZSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBpZiAoZmFpbHVyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IocmVkKGBUaGUgZm9sbG93aW5nIGZpbGVzIGNvdWxkIG5vdCBiZSBmb3JtYXR0ZWQ6YCkpO1xuICAgIGZhaWx1cmVzLmZvckVhY2goKHtmaWxlUGF0aCwgbWVzc2FnZX0pID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7ZmlsZVBhdGh9OiAke21lc3NhZ2V9YCk7XG4gICAgfSk7XG4gICAgZXJyb3IocmVkKGBGb3JtYXR0aW5nIGZhaWxlZCwgc2VlIGVycm9ycyBhYm92ZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKipcbiAqIENoZWNrIHByb3ZpZGVkIGZpbGVzIGZvciBmb3JtYXR0aW5nIGNvcnJlY3RuZXNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBub3QgZm9ybWF0dGVkIGNvcnJlY3RseS5cbiAgY29uc3QgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnY2hlY2snKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZyBjaGVjay4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgLy8gUHJvdmlkZSBvdXRwdXQgZXhwcmVzc2luZyB3aGljaCBmaWxlcyBhcmUgZmFpbGluZyBmb3JtYXR0aW5nLlxuICAgIGluZm8uZ3JvdXAoJ1xcblRoZSBmb2xsb3dpbmcgZmlsZXMgYXJlIG91dCBvZiBmb3JtYXQ6Jyk7XG4gICAgZm9yIChjb25zdCB7ZmlsZVBhdGh9IG9mIGZhaWx1cmVzKSB7XG4gICAgICBpbmZvKGAgIOKAoiAke2ZpbGVQYXRofWApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgICBsZXQgcnVuRm9ybWF0dGVyID0gZmFsc2U7XG4gICAgaWYgKCFwcm9jZXNzLmVudlsnQ0knXSkge1xuICAgICAgcnVuRm9ybWF0dGVyID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnRm9ybWF0IHRoZSBmaWxlcyBub3c/JywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bkZvcm1hdHRlcikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBmYWlsaW5nIGZpbGVzIGFzIHJlcXVlc3RlZC5cbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzLm1hcChmID0+IGYuZmlsZVBhdGgpKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW5mb3JtIHVzZXIgaG93IHRvIGZvcm1hdCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgaW5mbygpO1xuICAgICAgaW5mbyhgVG8gZm9ybWF0IHRoZSBmYWlsaW5nIGZpbGUgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICAgIGluZm8oYCAgeWFybiBuZy1kZXYgZm9ybWF0IGZpbGVzICR7ZmFpbHVyZXMubWFwKGYgPT4gZi5maWxlUGF0aCkuam9pbignICcpfWApO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpbmZvKCfiiJogIEFsbCBmaWxlcyBjb3JyZWN0bHkgZm9ybWF0dGVkLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufVxuIl19