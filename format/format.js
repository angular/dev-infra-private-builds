/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFDQUFnQztJQUVoQyxvRUFBNkM7SUFFN0MsaUdBQStEO0lBRS9EOztPQUVHO0lBQ0gsU0FBc0IsV0FBVyxDQUFDLEtBQWU7Ozs7OzRCQUVoQyxxQkFBTSw4Q0FBc0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEVBQUE7O3dCQUF4RCxRQUFRLEdBQUcsU0FBNkM7d0JBRTVELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTs0QkFDdEIsY0FBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7NEJBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELDZFQUE2RTt3QkFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDekIsZUFBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7NEJBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELGNBQUksQ0FBQyw4QkFBeUIsQ0FBQyxDQUFDO3dCQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7OztLQUNqQjtJQWhCRCxrQ0FnQkM7SUFFRDs7T0FFRztJQUNILFNBQXNCLFVBQVUsQ0FBQyxLQUFlOzs7Ozs7NEJBRTdCLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBQTs7d0JBQXZELFFBQVEsR0FBRyxTQUE0Qzt3QkFFN0QsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs0QkFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBRUcsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUN2RCxLQUFtQixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBbEIsSUFBSTtnQ0FDYixjQUFJLENBQUMsU0FBTyxJQUFNLENBQUMsQ0FBQzs2QkFDckI7Ozs7Ozs7Ozt3QkFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7d0JBQ2hCLGNBQUksRUFBRSxDQUFDO3dCQUdILFlBQVksR0FBRyxLQUFLLENBQUM7NkJBQ3JCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBbEIsd0JBQWtCO3dCQUNKLHFCQUFNLGlCQUFNLENBQUM7Z0NBQ1osSUFBSSxFQUFFLFNBQVM7Z0NBQ2YsSUFBSSxFQUFFLGNBQWM7Z0NBQ3BCLE9BQU8sRUFBRSx1QkFBdUI7NkJBQ2pDLENBQUMsRUFBQTs7d0JBSmpCLFlBQVksR0FBRyxDQUFDLFNBSUMsQ0FBQyxDQUFDLFlBQVksQ0FBQzs7OzZCQUc5QixZQUFZLEVBQVosd0JBQVk7d0JBQ2QseUNBQXlDO3dCQUN6QyxxQkFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUQzQix5Q0FBeUM7d0JBQ3pDLFNBQTJCLENBQUM7d0JBQzVCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozt3QkFFaEIsaURBQWlEO3dCQUNqRCxjQUFJLEVBQUUsQ0FBQzt3QkFDUCxjQUFJLENBQUMsdURBQXVELENBQUMsQ0FBQzt3QkFDOUQsY0FBSSxDQUFDLGdDQUE4QixRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDLENBQUM7d0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7d0JBR2xCLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3dCQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7S0FFbkI7SUEzQ0QsZ0NBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgZXhpdCBhcyBhIGZhaWx1cmUgaWYgYW55IG9mIHRoZSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBpZiAoZmFpbHVyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoYEZvcm1hdHRpbmcgZmFpbGVkLCBzZWUgZXJyb3JzIGFib3ZlIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBpbmZvKGDiiJogIEZvcm1hdHRpbmcgY29tcGxldGUuYCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuLyoqXG4gKiBDaGVjayBwcm92aWRlZCBmaWxlcyBmb3IgZm9ybWF0dGluZyBjb3JyZWN0bmVzcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgbm90IGZvcm1hdHRlZCBjb3JyZWN0bHkuXG4gIGNvbnN0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2NoZWNrJyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGluZm8oJ05vIGZpbGVzIG1hdGNoZWQgZm9yIGZvcm1hdHRpbmcgY2hlY2suJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCkge1xuICAgIC8vIFByb3ZpZGUgb3V0cHV0IGV4cHJlc3Npbmcgd2hpY2ggZmlsZXMgYXJlIGZhaWxpbmcgZm9ybWF0dGluZy5cbiAgICBpbmZvLmdyb3VwKCdcXG5UaGUgZm9sbG93aW5nIGZpbGVzIGFyZSBvdXQgb2YgZm9ybWF0OicpO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmYWlsdXJlcykge1xuICAgICAgaW5mbyhgICAtICR7ZmlsZX1gKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcblxuICAgIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gICAgbGV0IHJ1bkZvcm1hdHRlciA9IGZhbHNlO1xuICAgIGlmICghcHJvY2Vzcy5lbnZbJ0NJJ10pIHtcbiAgICAgIHJ1bkZvcm1hdHRlciA9IChhd2FpdCBwcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdydW5Gb3JtYXR0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnRm9ybWF0IHRoZSBmaWxlcyBub3c/JyxcbiAgICAgICAgICAgICAgICAgICAgIH0pKS5ydW5Gb3JtYXR0ZXI7XG4gICAgfVxuXG4gICAgaWYgKHJ1bkZvcm1hdHRlcikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBmYWlsaW5nIGZpbGVzIGFzIHJlcXVlc3RlZC5cbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW5mb3JtIHVzZXIgaG93IHRvIGZvcm1hdCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgaW5mbygpO1xuICAgICAgaW5mbyhgVG8gZm9ybWF0IHRoZSBmYWlsaW5nIGZpbGUgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICAgIGluZm8oYCAgeWFybiBuZy1kZXYgZm9ybWF0IGZpbGVzICR7ZmFpbHVyZXMuam9pbignICcpfWApO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpbmZvKCfiiJogIEFsbCBmaWxlcyBjb3JyZWN0bHkgZm9ybWF0dGVkLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufVxuIl19