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
        define("@angular/dev-infra-private/format/format", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/format/run-commands-parallel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkFiles = exports.formatFiles = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
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
                            console.info('No files matched for formatting.');
                            process.exit(0);
                        }
                        // The process should exit as a failure if any of the files failed to format.
                        if (failures.length !== 0) {
                            console.error("Formatting failed, see errors above for more information.");
                            process.exit(1);
                        }
                        console.info("\u221A  Formatting complete.");
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
                            console.info('No files matched for formatting check.');
                            process.exit(0);
                        }
                        if (!failures.length) return [3 /*break*/, 7];
                        // Provide output expressing which files are failing formatting.
                        console.group('\nThe following files are out of format:');
                        try {
                            for (failures_1 = tslib_1.__values(failures), failures_1_1 = failures_1.next(); !failures_1_1.done; failures_1_1 = failures_1.next()) {
                                file = failures_1_1.value;
                                console.info("  - " + file);
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (failures_1_1 && !failures_1_1.done && (_a = failures_1.return)) _a.call(failures_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        console.groupEnd();
                        console.info();
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
                        console.info();
                        console.info("To format the failing file run the following command:");
                        console.info("  yarn ng-dev format files " + failures.join(' '));
                        process.exit(1);
                        _b.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        console.info('√  All files correctly formatted.');
                        process.exit(0);
                        _b.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    exports.checkFiles = checkFiles;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHFDQUFnQztJQUNoQyxpR0FBK0Q7SUFFL0Q7O09BRUc7SUFDSCxTQUFzQixXQUFXLENBQUMsS0FBZTs7Ozs7NEJBRWhDLHFCQUFNLDhDQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBQTs7d0JBQXhELFFBQVEsR0FBRyxTQUE2Qzt3QkFFNUQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFOzRCQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7NEJBQ2pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUVELDZFQUE2RTt3QkFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs0QkFDekIsT0FBTyxDQUFDLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDOzRCQUMzRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLDhCQUF5QixDQUFDLENBQUM7d0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7O0tBQ2pCO0lBaEJELGtDQWdCQztJQUVEOztPQUVHO0lBQ0gsU0FBc0IsVUFBVSxDQUFDLEtBQWU7Ozs7Ozs0QkFFN0IscUJBQU0sOENBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFBOzt3QkFBdkQsUUFBUSxHQUFHLFNBQTRDO3dCQUU3RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7NEJBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQzs0QkFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7NkJBRUcsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUMxRCxLQUFtQixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBbEIsSUFBSTtnQ0FDYixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQU8sSUFBTSxDQUFDLENBQUM7NkJBQzdCOzs7Ozs7Ozs7d0JBQ0QsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNuQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBR1gsWUFBWSxHQUFHLEtBQUssQ0FBQzs2QkFDckIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFsQix3QkFBa0I7d0JBQ0oscUJBQU0saUJBQU0sQ0FBQztnQ0FDWixJQUFJLEVBQUUsU0FBUztnQ0FDZixJQUFJLEVBQUUsY0FBYztnQ0FDcEIsT0FBTyxFQUFFLHVCQUF1Qjs2QkFDakMsQ0FBQyxFQUFBOzt3QkFKakIsWUFBWSxHQUFHLENBQUMsU0FJQyxDQUFDLENBQUMsWUFBWSxDQUFDOzs7NkJBRzlCLFlBQVksRUFBWix3QkFBWTt3QkFDZCx5Q0FBeUM7d0JBQ3pDLHFCQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBQTs7d0JBRDNCLHlDQUF5Qzt3QkFDekMsU0FBMkIsQ0FBQzt3QkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O3dCQUVoQixpREFBaUQ7d0JBQ2pELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7d0JBQ3RFLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQThCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQzt3QkFDakUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFHbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3dCQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7S0FFbkI7SUEzQ0QsZ0NBMkNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgY29uc29sZS5pbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIFRoZSBwcm9jZXNzIHNob3VsZCBleGl0IGFzIGEgZmFpbHVyZSBpZiBhbnkgb2YgdGhlIGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGggIT09IDApIHtcbiAgICBjb25zb2xlLmVycm9yKGBGb3JtYXR0aW5nIGZhaWxlZCwgc2VlIGVycm9ycyBhYm92ZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgY29uc29sZS5pbmZvKGDiiJogIEZvcm1hdHRpbmcgY29tcGxldGUuYCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuLyoqXG4gKiBDaGVjayBwcm92aWRlZCBmaWxlcyBmb3IgZm9ybWF0dGluZyBjb3JyZWN0bmVzcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgbm90IGZvcm1hdHRlZCBjb3JyZWN0bHkuXG4gIGNvbnN0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2NoZWNrJyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGNvbnNvbGUuaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZyBjaGVjay4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgLy8gUHJvdmlkZSBvdXRwdXQgZXhwcmVzc2luZyB3aGljaCBmaWxlcyBhcmUgZmFpbGluZyBmb3JtYXR0aW5nLlxuICAgIGNvbnNvbGUuZ3JvdXAoJ1xcblRoZSBmb2xsb3dpbmcgZmlsZXMgYXJlIG91dCBvZiBmb3JtYXQ6Jyk7XG4gICAgZm9yIChjb25zdCBmaWxlIG9mIGZhaWx1cmVzKSB7XG4gICAgICBjb25zb2xlLmluZm8oYCAgLSAke2ZpbGV9YCk7XG4gICAgfVxuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgICBjb25zb2xlLmluZm8oKTtcblxuICAgIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gICAgbGV0IHJ1bkZvcm1hdHRlciA9IGZhbHNlO1xuICAgIGlmICghcHJvY2Vzcy5lbnZbJ0NJJ10pIHtcbiAgICAgIHJ1bkZvcm1hdHRlciA9IChhd2FpdCBwcm9tcHQoe1xuICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnY29uZmlybScsXG4gICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdydW5Gb3JtYXR0ZXInLFxuICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnRm9ybWF0IHRoZSBmaWxlcyBub3c/JyxcbiAgICAgICAgICAgICAgICAgICAgIH0pKS5ydW5Gb3JtYXR0ZXI7XG4gICAgfVxuXG4gICAgaWYgKHJ1bkZvcm1hdHRlcikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBmYWlsaW5nIGZpbGVzIGFzIHJlcXVlc3RlZC5cbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW5mb3JtIHVzZXIgaG93IHRvIGZvcm1hdCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgY29uc29sZS5pbmZvKCk7XG4gICAgICBjb25zb2xlLmluZm8oYFRvIGZvcm1hdCB0aGUgZmFpbGluZyBmaWxlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgICBjb25zb2xlLmluZm8oYCAgeWFybiBuZy1kZXYgZm9ybWF0IGZpbGVzICR7ZmFpbHVyZXMuam9pbignICcpfWApO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmluZm8oJ+KImiAgQWxsIGZpbGVzIGNvcnJlY3RseSBmb3JtYXR0ZWQuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG59XG4iXX0=