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
        define("@angular/dev-infra-private/format/format", ["require", "exports", "tslib", "inquirer", "multimatch", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/format/run-commands-parallel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var multimatch = require("multimatch");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var run_commands_parallel_1 = require("@angular/dev-infra-private/format/run-commands-parallel");
    /** By default, run the formatter on all javascript and typescript files. */
    var DEFAULT_MATCHERS = ['**/*.{t,j}s'];
    /**
     * Format provided files in place.
     */
    function formatFiles(unfilteredFiles) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var formatFailed, files;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formatFailed = false;
                        files = filterFilesByMatchers(unfilteredFiles);
                        console.info("Formatting " + files.length + " file(s)");
                        // Run the formatter to format the files in place, split across (number of available
                        // cpu threads - 1) processess. The task is done in multiple processess to speed up
                        // the overall time of the task, as running across entire repositories takes a large
                        // amount of time.
                        // As a data point for illustration, using 8 process rather than 1 cut the execution
                        // time from 276 seconds to 39 seconds for the same 2700 files
                        return [4 /*yield*/, run_commands_parallel_1.runInParallel(files, getFormatterBinary() + " -i -style=file", function (file, code, _, stderr) {
                                if (code !== 0) {
                                    formatFailed = true;
                                    console.error("Error running clang-format on: " + file);
                                    console.error(stderr);
                                    console.error();
                                }
                            })];
                    case 1:
                        // Run the formatter to format the files in place, split across (number of available
                        // cpu threads - 1) processess. The task is done in multiple processess to speed up
                        // the overall time of the task, as running across entire repositories takes a large
                        // amount of time.
                        // As a data point for illustration, using 8 process rather than 1 cut the execution
                        // time from 276 seconds to 39 seconds for the same 2700 files
                        _a.sent();
                        // The process should exit as a failure if any of the files failed to format.
                        if (formatFailed) {
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
    function checkFiles(unfilteredFiles) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var files, failures, failures_1, failures_1_1, file, runFormatter;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        files = filterFilesByMatchers(unfilteredFiles);
                        failures = [];
                        console.info("Checking format of " + files.length + " file(s)");
                        // Run the formatter to check the format of files, split across (number of available
                        // cpu threads - 1) processess. The task is done in multiple processess to speed up
                        // the overall time of the task, as running across entire repositories takes a large
                        // amount of time.
                        // As a data point for illustration, using 8 process rather than 1 cut the execution
                        // time from 276 seconds to 39 seconds for the same 2700 files.
                        return [4 /*yield*/, run_commands_parallel_1.runInParallel(files, getFormatterBinary() + " --Werror -n -style=file", function (file, code) {
                                // Add any files failing format checks to the list.
                                if (code !== 0) {
                                    failures.push(file);
                                }
                            })];
                    case 1:
                        // Run the formatter to check the format of files, split across (number of available
                        // cpu threads - 1) processess. The task is done in multiple processess to speed up
                        // the overall time of the task, as running across entire repositories takes a large
                        // amount of time.
                        // As a data point for illustration, using 8 process rather than 1 cut the execution
                        // time from 276 seconds to 39 seconds for the same 2700 files.
                        _b.sent();
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
    /** Get the full path of the formatter binary to execute. */
    function getFormatterBinary() {
        return path_1.join(config_1.getRepoBaseDir(), 'node_modules/.bin/clang-format');
    }
    /** Filter a list of files to only contain files which are expected to be formatted. */
    function filterFilesByMatchers(allFiles) {
        var matchers = config_1.getAngularDevConfig().format.matchers || DEFAULT_MATCHERS;
        var files = multimatch(allFiles, matchers, { dot: true });
        console.info("Formatting enforced on " + files.length + " of " + allFiles.length + " file(s)");
        return files;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgscUNBQWdDO0lBQ2hDLHVDQUF5QztJQUN6Qyw2QkFBMEI7SUFFMUIsa0VBQW9FO0lBR3BFLGlHQUFzRDtJQUV0RCw0RUFBNEU7SUFDNUUsSUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBRXpDOztPQUVHO0lBQ0gsU0FBc0IsV0FBVyxDQUFDLGVBQXlCOzs7Ozs7d0JBRXJELFlBQVksR0FBRyxLQUFLLENBQUM7d0JBRW5CLEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFFckQsT0FBTyxDQUFDLElBQUksQ0FBQyxnQkFBYyxLQUFLLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQzt3QkFHbkQsb0ZBQW9GO3dCQUNwRixtRkFBbUY7d0JBQ25GLG9GQUFvRjt3QkFDcEYsa0JBQWtCO3dCQUNsQixvRkFBb0Y7d0JBQ3BGLDhEQUE4RDt3QkFDOUQscUJBQU0scUNBQWEsQ0FBQyxLQUFLLEVBQUssa0JBQWtCLEVBQUUsb0JBQWlCLEVBQUUsVUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxNQUFNO2dDQUN6RixJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7b0NBQ2QsWUFBWSxHQUFHLElBQUksQ0FBQztvQ0FDcEIsT0FBTyxDQUFDLEtBQUssQ0FBQyxvQ0FBa0MsSUFBTSxDQUFDLENBQUM7b0NBQ3hELE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7b0NBQ3RCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQ0FDakI7NEJBQ0gsQ0FBQyxDQUFDLEVBQUE7O3dCQWJGLG9GQUFvRjt3QkFDcEYsbUZBQW1GO3dCQUNuRixvRkFBb0Y7d0JBQ3BGLGtCQUFrQjt3QkFDbEIsb0ZBQW9GO3dCQUNwRiw4REFBOEQ7d0JBQzlELFNBT0UsQ0FBQzt3QkFFSCw2RUFBNkU7d0JBQzdFLElBQUksWUFBWSxFQUFFOzRCQUNoQixPQUFPLENBQUMsS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7NEJBQzNFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7eUJBQ2pCO3dCQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsOEJBQXlCLENBQUMsQ0FBQzt3QkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7S0FDakI7SUEvQkQsa0NBK0JDO0lBRUQ7O09BRUc7SUFDSCxTQUFzQixVQUFVLENBQUMsZUFBeUI7Ozs7Ozs7d0JBRWxELEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFFL0MsUUFBUSxHQUFhLEVBQUUsQ0FBQzt3QkFFOUIsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBc0IsS0FBSyxDQUFDLE1BQU0sYUFBVSxDQUFDLENBQUM7d0JBRTNELG9GQUFvRjt3QkFDcEYsbUZBQW1GO3dCQUNuRixvRkFBb0Y7d0JBQ3BGLGtCQUFrQjt3QkFDbEIsb0ZBQW9GO3dCQUNwRiwrREFBK0Q7d0JBQy9ELHFCQUFNLHFDQUFhLENBQUMsS0FBSyxFQUFLLGtCQUFrQixFQUFFLDZCQUEwQixFQUFFLFVBQUMsSUFBSSxFQUFFLElBQUk7Z0NBQ3ZGLG1EQUFtRDtnQ0FDbkQsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFO29DQUNkLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUNBQ3JCOzRCQUNILENBQUMsQ0FBQyxFQUFBOzt3QkFYRixvRkFBb0Y7d0JBQ3BGLG1GQUFtRjt3QkFDbkYsb0ZBQW9GO3dCQUNwRixrQkFBa0I7d0JBQ2xCLG9GQUFvRjt3QkFDcEYsK0RBQStEO3dCQUMvRCxTQUtFLENBQUM7NkJBRUMsUUFBUSxDQUFDLE1BQU0sRUFBZix3QkFBZTt3QkFDakIsZ0VBQWdFO3dCQUNoRSxPQUFPLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7OzRCQUMxRCxLQUFtQixhQUFBLGlCQUFBLFFBQVEsQ0FBQSwwRkFBRTtnQ0FBbEIsSUFBSTtnQ0FDYixPQUFPLENBQUMsSUFBSSxDQUFDLFNBQU8sSUFBTSxDQUFDLENBQUM7NkJBQzdCOzs7Ozs7Ozs7d0JBQ0QsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUNuQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7d0JBR1gsWUFBWSxHQUFHLEtBQUssQ0FBQzs2QkFDckIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFsQix3QkFBa0I7d0JBQ0oscUJBQU0saUJBQU0sQ0FBQztnQ0FDWixJQUFJLEVBQUUsU0FBUztnQ0FDZixJQUFJLEVBQUUsY0FBYztnQ0FDcEIsT0FBTyxFQUFFLHVCQUF1Qjs2QkFDakMsQ0FBQyxFQUFBOzt3QkFKakIsWUFBWSxHQUFHLENBQUMsU0FJQyxDQUFDLENBQUMsWUFBWSxDQUFDOzs7NkJBRzlCLFlBQVksRUFBWix3QkFBWTt3QkFDZCx5Q0FBeUM7d0JBQ3pDLHFCQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsRUFBQTs7d0JBRDNCLHlDQUF5Qzt3QkFDekMsU0FBMkIsQ0FBQzt3QkFDNUIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O3dCQUVoQixpREFBaUQ7d0JBQ2pELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQzt3QkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7d0JBQ3RFLE9BQU8sQ0FBQyxJQUFJLENBQUMsZ0NBQThCLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFHLENBQUMsQ0FBQzt3QkFDakUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozt3QkFHbEIsT0FBTyxDQUFDLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO3dCQUNsRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7Ozs7S0FFbkI7SUF2REQsZ0NBdURDO0lBRUQsNERBQTREO0lBQzVELFNBQVMsa0JBQWtCO1FBQ3pCLE9BQU8sV0FBSSxDQUFDLHVCQUFjLEVBQUUsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRCx1RkFBdUY7SUFDdkYsU0FBUyxxQkFBcUIsQ0FBQyxRQUFrQjtRQUMvQyxJQUFNLFFBQVEsR0FDViw0QkFBbUIsRUFBMEIsQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLGdCQUFnQixDQUFDO1FBQ3RGLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFFMUQsT0FBTyxDQUFDLElBQUksQ0FBQyw0QkFBMEIsS0FBSyxDQUFDLE1BQU0sWUFBTyxRQUFRLENBQUMsTUFBTSxhQUFVLENBQUMsQ0FBQztRQUNyRixPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRBbmd1bGFyRGV2Q29uZmlnLCBnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW1wb3J0IHtGb3JtYXRDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7cnVuSW5QYXJhbGxlbH0gZnJvbSAnLi9ydW4tY29tbWFuZHMtcGFyYWxsZWwnO1xuXG4vKiogQnkgZGVmYXVsdCwgcnVuIHRoZSBmb3JtYXR0ZXIgb24gYWxsIGphdmFzY3JpcHQgYW5kIHR5cGVzY3JpcHQgZmlsZXMuICovXG5jb25zdCBERUZBVUxUX01BVENIRVJTID0gWycqKi8qLnt0LGp9cyddO1xuXG4vKipcbiAqIEZvcm1hdCBwcm92aWRlZCBmaWxlcyBpbiBwbGFjZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcm1hdEZpbGVzKHVuZmlsdGVyZWRGaWxlczogc3RyaW5nW10pIHtcbiAgLy8gV2hldGhlciBhbnkgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgbGV0IGZvcm1hdEZhaWxlZCA9IGZhbHNlO1xuICAvLyBBbGwgZmlsZXMgd2hpY2ggZm9ybWF0dGluZyBzaG91bGQgYmUgYXBwbGllZCB0by5cbiAgY29uc3QgZmlsZXMgPSBmaWx0ZXJGaWxlc0J5TWF0Y2hlcnModW5maWx0ZXJlZEZpbGVzKTtcblxuICBjb25zb2xlLmluZm8oYEZvcm1hdHRpbmcgJHtmaWxlcy5sZW5ndGh9IGZpbGUocylgKTtcblxuXG4gIC8vIFJ1biB0aGUgZm9ybWF0dGVyIHRvIGZvcm1hdCB0aGUgZmlsZXMgaW4gcGxhY2UsIHNwbGl0IGFjcm9zcyAobnVtYmVyIG9mIGF2YWlsYWJsZVxuICAvLyBjcHUgdGhyZWFkcyAtIDEpIHByb2Nlc3Nlc3MuIFRoZSB0YXNrIGlzIGRvbmUgaW4gbXVsdGlwbGUgcHJvY2Vzc2VzcyB0byBzcGVlZCB1cFxuICAvLyB0aGUgb3ZlcmFsbCB0aW1lIG9mIHRoZSB0YXNrLCBhcyBydW5uaW5nIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2VcbiAgLy8gYW1vdW50IG9mIHRpbWUuXG4gIC8vIEFzIGEgZGF0YSBwb2ludCBmb3IgaWxsdXN0cmF0aW9uLCB1c2luZyA4IHByb2Nlc3MgcmF0aGVyIHRoYW4gMSBjdXQgdGhlIGV4ZWN1dGlvblxuICAvLyB0aW1lIGZyb20gMjc2IHNlY29uZHMgdG8gMzkgc2Vjb25kcyBmb3IgdGhlIHNhbWUgMjcwMCBmaWxlc1xuICBhd2FpdCBydW5JblBhcmFsbGVsKGZpbGVzLCBgJHtnZXRGb3JtYXR0ZXJCaW5hcnkoKX0gLWkgLXN0eWxlPWZpbGVgLCAoZmlsZSwgY29kZSwgXywgc3RkZXJyKSA9PiB7XG4gICAgaWYgKGNvZGUgIT09IDApIHtcbiAgICAgIGZvcm1hdEZhaWxlZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKGBFcnJvciBydW5uaW5nIGNsYW5nLWZvcm1hdCBvbjogJHtmaWxlfWApO1xuICAgICAgY29uc29sZS5lcnJvcihzdGRlcnIpO1xuICAgICAgY29uc29sZS5lcnJvcigpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIGV4aXQgYXMgYSBmYWlsdXJlIGlmIGFueSBvZiB0aGUgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgaWYgKGZvcm1hdEZhaWxlZCkge1xuICAgIGNvbnNvbGUuZXJyb3IoYEZvcm1hdHRpbmcgZmFpbGVkLCBzZWUgZXJyb3JzIGFib3ZlIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBjb25zb2xlLmluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKipcbiAqIENoZWNrIHByb3ZpZGVkIGZpbGVzIGZvciBmb3JtYXR0aW5nIGNvcnJlY3RuZXNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGaWxlcyh1bmZpbHRlcmVkRmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIEFsbCBmaWxlcyB3aGljaCBmb3JtYXR0aW5nIHNob3VsZCBiZSBhcHBsaWVkIHRvLlxuICBjb25zdCBmaWxlcyA9IGZpbHRlckZpbGVzQnlNYXRjaGVycyh1bmZpbHRlcmVkRmlsZXMpO1xuICAvLyBGaWxlcyB3aGljaCBhcmUgY3VycmVudGx5IG5vdCBmb3JtYXR0ZWQgY29ycmVjdGx5LlxuICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcblxuICBjb25zb2xlLmluZm8oYENoZWNraW5nIGZvcm1hdCBvZiAke2ZpbGVzLmxlbmd0aH0gZmlsZShzKWApO1xuXG4gIC8vIFJ1biB0aGUgZm9ybWF0dGVyIHRvIGNoZWNrIHRoZSBmb3JtYXQgb2YgZmlsZXMsIHNwbGl0IGFjcm9zcyAobnVtYmVyIG9mIGF2YWlsYWJsZVxuICAvLyBjcHUgdGhyZWFkcyAtIDEpIHByb2Nlc3Nlc3MuIFRoZSB0YXNrIGlzIGRvbmUgaW4gbXVsdGlwbGUgcHJvY2Vzc2VzcyB0byBzcGVlZCB1cFxuICAvLyB0aGUgb3ZlcmFsbCB0aW1lIG9mIHRoZSB0YXNrLCBhcyBydW5uaW5nIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2VcbiAgLy8gYW1vdW50IG9mIHRpbWUuXG4gIC8vIEFzIGEgZGF0YSBwb2ludCBmb3IgaWxsdXN0cmF0aW9uLCB1c2luZyA4IHByb2Nlc3MgcmF0aGVyIHRoYW4gMSBjdXQgdGhlIGV4ZWN1dGlvblxuICAvLyB0aW1lIGZyb20gMjc2IHNlY29uZHMgdG8gMzkgc2Vjb25kcyBmb3IgdGhlIHNhbWUgMjcwMCBmaWxlcy5cbiAgYXdhaXQgcnVuSW5QYXJhbGxlbChmaWxlcywgYCR7Z2V0Rm9ybWF0dGVyQmluYXJ5KCl9IC0tV2Vycm9yIC1uIC1zdHlsZT1maWxlYCwgKGZpbGUsIGNvZGUpID0+IHtcbiAgICAvLyBBZGQgYW55IGZpbGVzIGZhaWxpbmcgZm9ybWF0IGNoZWNrcyB0byB0aGUgbGlzdC5cbiAgICBpZiAoY29kZSAhPT0gMCkge1xuICAgICAgZmFpbHVyZXMucHVzaChmaWxlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAvLyBQcm92aWRlIG91dHB1dCBleHByZXNzaW5nIHdoaWNoIGZpbGVzIGFyZSBmYWlsaW5nIGZvcm1hdHRpbmcuXG4gICAgY29uc29sZS5ncm91cCgnXFxuVGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgb3V0IG9mIGZvcm1hdDonKTtcbiAgICBmb3IgKGNvbnN0IGZpbGUgb2YgZmFpbHVyZXMpIHtcbiAgICAgIGNvbnNvbGUuaW5mbyhgICAtICR7ZmlsZX1gKTtcbiAgICB9XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICAgIGNvbnNvbGUuaW5mbygpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgICBsZXQgcnVuRm9ybWF0dGVyID0gZmFsc2U7XG4gICAgaWYgKCFwcm9jZXNzLmVudlsnQ0knXSkge1xuICAgICAgcnVuRm9ybWF0dGVyID0gKGF3YWl0IHByb21wdCh7XG4gICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdjb25maXJtJyxcbiAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ3J1bkZvcm1hdHRlcicsXG4gICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdGb3JtYXQgdGhlIGZpbGVzIG5vdz8nLFxuICAgICAgICAgICAgICAgICAgICAgfSkpLnJ1bkZvcm1hdHRlcjtcbiAgICB9XG5cbiAgICBpZiAocnVuRm9ybWF0dGVyKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGZhaWxpbmcgZmlsZXMgYXMgcmVxdWVzdGVkLlxuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoZmFpbHVyZXMpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBjb25zb2xlLmluZm8oKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgVG8gZm9ybWF0IHRoZSBmYWlsaW5nIGZpbGUgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5qb2luKCcgJyl9YCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGNvbnNvbGUuaW5mbygn4oiaICBBbGwgZmlsZXMgY29ycmVjdGx5IGZvcm1hdHRlZC4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgZnVsbCBwYXRoIG9mIHRoZSBmb3JtYXR0ZXIgYmluYXJ5IHRvIGV4ZWN1dGUuICovXG5mdW5jdGlvbiBnZXRGb3JtYXR0ZXJCaW5hcnkoKSB7XG4gIHJldHVybiBqb2luKGdldFJlcG9CYXNlRGlyKCksICdub2RlX21vZHVsZXMvLmJpbi9jbGFuZy1mb3JtYXQnKTtcbn1cblxuLyoqIEZpbHRlciBhIGxpc3Qgb2YgZmlsZXMgdG8gb25seSBjb250YWluIGZpbGVzIHdoaWNoIGFyZSBleHBlY3RlZCB0byBiZSBmb3JtYXR0ZWQuICovXG5mdW5jdGlvbiBmaWx0ZXJGaWxlc0J5TWF0Y2hlcnMoYWxsRmlsZXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IG1hdGNoZXJzID1cbiAgICAgIGdldEFuZ3VsYXJEZXZDb25maWc8J2Zvcm1hdCcsIEZvcm1hdENvbmZpZz4oKS5mb3JtYXQubWF0Y2hlcnMgfHwgREVGQVVMVF9NQVRDSEVSUztcbiAgY29uc3QgZmlsZXMgPSBtdWx0aW1hdGNoKGFsbEZpbGVzLCBtYXRjaGVycywge2RvdDogdHJ1ZX0pO1xuXG4gIGNvbnNvbGUuaW5mbyhgRm9ybWF0dGluZyBlbmZvcmNlZCBvbiAke2ZpbGVzLmxlbmd0aH0gb2YgJHthbGxGaWxlcy5sZW5ndGh9IGZpbGUocylgKTtcbiAgcmV0dXJuIGZpbGVzO1xufVxuIl19