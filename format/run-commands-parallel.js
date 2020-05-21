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
        define("@angular/dev-infra-private/format/run-commands-parallel", ["require", "exports", "tslib", "cli-progress", "multimatch", "os", "shelljs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runFormatterInParallel = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var multimatch = require("multimatch");
    var os_1 = require("os");
    var shelljs_1 = require("shelljs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var formatters_1 = require("@angular/dev-infra-private/format/formatters/index");
    var AVAILABLE_THREADS = Math.max(os_1.cpus().length - 1, 1);
    /**
     * Run the provided commands in parallel for each provided file.
     *
     * Running the formatter is split across (number of available cpu threads - 1) processess.
     * The task is done in multiple processess to speed up the overall time of the task, as running
     * across entire repositories takes a large amount of time.
     * As a data point for illustration, using 8 process rather than 1 cut the execution
     * time from 276 seconds to 39 seconds for the same 2700 files.
     *
     * A promise is returned, completed when the command has completed running for each file.
     * The promise resolves with a list of failures, or `false` if no formatters have matched.
     */
    function runFormatterInParallel(allFiles, action) {
        return new Promise(function (resolve) {
            var e_1, _a;
            var formatters = formatters_1.getActiveFormatters();
            var failures = [];
            var pendingCommands = [];
            var _loop_1 = function (formatter) {
                pendingCommands.push.apply(pendingCommands, tslib_1.__spread(multimatch(allFiles, formatter.getFileMatcher(), {
                    dot: true
                }).map(function (file) { return ({ formatter: formatter, file: file }); })));
            };
            try {
                for (var formatters_2 = tslib_1.__values(formatters), formatters_2_1 = formatters_2.next(); !formatters_2_1.done; formatters_2_1 = formatters_2.next()) {
                    var formatter = formatters_2_1.value;
                    _loop_1(formatter);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (formatters_2_1 && !formatters_2_1.done && (_a = formatters_2.return)) _a.call(formatters_2);
                }
                finally { if (e_1) throw e_1.error; }
            }
            // If no commands are generated, resolve the promise as `false` as no files
            // were run against the any formatters.
            if (pendingCommands.length === 0) {
                return resolve(false);
            }
            switch (action) {
                case 'format':
                    console_1.info("Formatting " + pendingCommands.length + " file(s)");
                    break;
                case 'check':
                    console_1.info("Checking format of " + pendingCommands.length + " file(s)");
                    break;
                default:
                    throw Error("Invalid format action \"" + action + "\": allowed actions are \"format\" and \"check\"");
            }
            // The progress bar instance to use for progress tracking.
            var progressBar = new cli_progress_1.Bar({ format: "[{bar}] ETA: {eta}s | {value}/{total} files", clearOnComplete: true });
            // A local copy of the files to run the command on.
            // An array to represent the current usage state of each of the threads for parallelization.
            var threads = new Array(AVAILABLE_THREADS).fill(false);
            // Recursively run the command on the next available file from the list using the provided
            // thread.
            function runCommandInThread(thread) {
                var nextCommand = pendingCommands.pop();
                // If no file was pulled from the array, return as there are no more files to run against.
                if (nextCommand === undefined) {
                    threads[thread] = false;
                    return;
                }
                // Get the file and formatter for the next command.
                var file = nextCommand.file, formatter = nextCommand.formatter;
                shelljs_1.exec(formatter.commandFor(action) + " " + file, { async: true, silent: true }, function (code, stdout, stderr) {
                    // Run the provided callback function.
                    var failed = formatter.callbackFor(action)(file, code, stdout, stderr);
                    if (failed) {
                        failures.push(file);
                    }
                    // Note in the progress bar another file being completed.
                    progressBar.increment(1);
                    // If more files exist in the list, run again to work on the next file,
                    // using the same slot.
                    if (pendingCommands.length) {
                        return runCommandInThread(thread);
                    }
                    // If not more files are available, mark the thread as unused.
                    threads[thread] = false;
                    // If all of the threads are false, as they are unused, mark the progress bar
                    // completed and resolve the promise.
                    if (threads.every(function (active) { return !active; })) {
                        progressBar.stop();
                        resolve(failures);
                    }
                });
                // Mark the thread as in use as the command execution has been started.
                threads[thread] = true;
            }
            // Start the progress bar
            progressBar.start(pendingCommands.length, 0);
            // Start running the command on files from the least in each available thread.
            threads.forEach(function (_, idx) { return runCommandInThread(idx); });
        });
    }
    exports.runFormatterInParallel = runFormatterInParallel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyx1Q0FBeUM7SUFDekMseUJBQXdCO0lBQ3hCLG1DQUE2QjtJQUU3QixvRUFBc0M7SUFFdEMsaUZBQTZFO0lBRTdFLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBRXpEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsUUFBa0IsRUFBRSxNQUF1QjtRQUNoRixPQUFPLElBQUksT0FBTyxDQUFpQixVQUFDLE9BQU87O1lBQ3pDLElBQU0sVUFBVSxHQUFHLGdDQUFtQixFQUFFLENBQUM7WUFDekMsSUFBTSxRQUFRLEdBQWEsRUFBRSxDQUFDO1lBQzlCLElBQU0sZUFBZSxHQUEyQyxFQUFFLENBQUM7b0NBRXhELFNBQVM7Z0JBQ2xCLGVBQWUsQ0FBQyxJQUFJLE9BQXBCLGVBQWUsbUJBQVMsVUFBVSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUU7b0JBQ2xELEdBQUcsRUFBRSxJQUFJO2lCQUNWLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLEVBQUMsU0FBUyxXQUFBLEVBQUUsSUFBSSxNQUFBLEVBQUMsQ0FBQyxFQUFuQixDQUFtQixDQUFDLEdBQUU7OztnQkFINUQsS0FBd0IsSUFBQSxlQUFBLGlCQUFBLFVBQVUsQ0FBQSxzQ0FBQTtvQkFBN0IsSUFBTSxTQUFTLHVCQUFBOzRCQUFULFNBQVM7aUJBSW5COzs7Ozs7Ozs7WUFFRCwyRUFBMkU7WUFDM0Us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QUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQXBGRCx3REFvRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0ICogYXMgbXVsdGltYXRjaCBmcm9tICdtdWx0aW1hdGNoJztcbmltcG9ydCB7Y3B1c30gZnJvbSAnb3MnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbiwgZ2V0QWN0aXZlRm9ybWF0dGVyc30gZnJvbSAnLi9mb3JtYXR0ZXJzJztcblxuY29uc3QgQVZBSUxBQkxFX1RIUkVBRFMgPSBNYXRoLm1heChjcHVzKCkubGVuZ3RoIC0gMSwgMSk7XG5cbi8qKlxuICogUnVuIHRoZSBwcm92aWRlZCBjb21tYW5kcyBpbiBwYXJhbGxlbCBmb3IgZWFjaCBwcm92aWRlZCBmaWxlLlxuICpcbiAqIFJ1bm5pbmcgdGhlIGZvcm1hdHRlciBpcyBzcGxpdCBhY3Jvc3MgKG51bWJlciBvZiBhdmFpbGFibGUgY3B1IHRocmVhZHMgLSAxKSBwcm9jZXNzZXNzLlxuICogVGhlIHRhc2sgaXMgZG9uZSBpbiBtdWx0aXBsZSBwcm9jZXNzZXNzIHRvIHNwZWVkIHVwIHRoZSBvdmVyYWxsIHRpbWUgb2YgdGhlIHRhc2ssIGFzIHJ1bm5pbmdcbiAqIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2UgYW1vdW50IG9mIHRpbWUuXG4gKiBBcyBhIGRhdGEgcG9pbnQgZm9yIGlsbHVzdHJhdGlvbiwgdXNpbmcgOCBwcm9jZXNzIHJhdGhlciB0aGFuIDEgY3V0IHRoZSBleGVjdXRpb25cbiAqIHRpbWUgZnJvbSAyNzYgc2Vjb25kcyB0byAzOSBzZWNvbmRzIGZvciB0aGUgc2FtZSAyNzAwIGZpbGVzLlxuICpcbiAqIEEgcHJvbWlzZSBpcyByZXR1cm5lZCwgY29tcGxldGVkIHdoZW4gdGhlIGNvbW1hbmQgaGFzIGNvbXBsZXRlZCBydW5uaW5nIGZvciBlYWNoIGZpbGUuXG4gKiBUaGUgcHJvbWlzZSByZXNvbHZlcyB3aXRoIGEgbGlzdCBvZiBmYWlsdXJlcywgb3IgYGZhbHNlYCBpZiBubyBmb3JtYXR0ZXJzIGhhdmUgbWF0Y2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoYWxsRmlsZXM6IHN0cmluZ1tdLCBhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICByZXR1cm4gbmV3IFByb21pc2U8ZmFsc2V8c3RyaW5nW10+KChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVycyA9IGdldEFjdGl2ZUZvcm1hdHRlcnMoKTtcbiAgICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBwZW5kaW5nQ29tbWFuZHM6IHtmb3JtYXR0ZXI6IEZvcm1hdHRlciwgZmlsZTogc3RyaW5nfVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKSB7XG4gICAgICBwZW5kaW5nQ29tbWFuZHMucHVzaCguLi5tdWx0aW1hdGNoKGFsbEZpbGVzLCBmb3JtYXR0ZXIuZ2V0RmlsZU1hdGNoZXIoKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3Q6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLm1hcChmaWxlID0+ICh7Zm9ybWF0dGVyLCBmaWxlfSkpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBjb21tYW5kcyBhcmUgZ2VuZXJhdGVkLCByZXNvbHZlIHRoZSBwcm9taXNlIGFzIGBmYWxzZWAgYXMgbm8gZmlsZXNcbiAgICAvLyB3ZXJlIHJ1biBhZ2FpbnN0IHRoZSBhbnkgZm9ybWF0dGVycy5cbiAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICBpbmZvKGBGb3JtYXR0aW5nICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgaW5mbyhgQ2hlY2tpbmcgZm9ybWF0IG9mICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGZvcm1hdCBhY3Rpb24gXCIke2FjdGlvbn1cIjogYWxsb3dlZCBhY3Rpb25zIGFyZSBcImZvcm1hdFwiIGFuZCBcImNoZWNrXCJgKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcHJvZ3Jlc3MgYmFyIGluc3RhbmNlIHRvIHVzZSBmb3IgcHJvZ3Jlc3MgdHJhY2tpbmcuXG4gICAgY29uc3QgcHJvZ3Jlc3NCYXIgPVxuICAgICAgICBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9IGZpbGVzYCwgY2xlYXJPbkNvbXBsZXRlOiB0cnVlfSk7XG4gICAgLy8gQSBsb2NhbCBjb3B5IG9mIHRoZSBmaWxlcyB0byBydW4gdGhlIGNvbW1hbmQgb24uXG4gICAgLy8gQW4gYXJyYXkgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW50IHVzYWdlIHN0YXRlIG9mIGVhY2ggb2YgdGhlIHRocmVhZHMgZm9yIHBhcmFsbGVsaXphdGlvbi5cbiAgICBjb25zdCB0aHJlYWRzID0gbmV3IEFycmF5PGJvb2xlYW4+KEFWQUlMQUJMRV9USFJFQURTKS5maWxsKGZhbHNlKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IHJ1biB0aGUgY29tbWFuZCBvbiB0aGUgbmV4dCBhdmFpbGFibGUgZmlsZSBmcm9tIHRoZSBsaXN0IHVzaW5nIHRoZSBwcm92aWRlZFxuICAgIC8vIHRocmVhZC5cbiAgICBmdW5jdGlvbiBydW5Db21tYW5kSW5UaHJlYWQodGhyZWFkOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IG5leHRDb21tYW5kID0gcGVuZGluZ0NvbW1hbmRzLnBvcCgpO1xuICAgICAgLy8gSWYgbm8gZmlsZSB3YXMgcHVsbGVkIGZyb20gdGhlIGFycmF5LCByZXR1cm4gYXMgdGhlcmUgYXJlIG5vIG1vcmUgZmlsZXMgdG8gcnVuIGFnYWluc3QuXG4gICAgICBpZiAobmV4dENvbW1hbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJlYWRzW3RocmVhZF0gPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGZpbGUgYW5kIGZvcm1hdHRlciBmb3IgdGhlIG5leHQgY29tbWFuZC5cbiAgICAgIGNvbnN0IHtmaWxlLCBmb3JtYXR0ZXJ9ID0gbmV4dENvbW1hbmQ7XG5cbiAgICAgIGV4ZWMoXG4gICAgICAgICAgYCR7Zm9ybWF0dGVyLmNvbW1hbmRGb3IoYWN0aW9uKX0gJHtmaWxlfWAsXG4gICAgICAgICAge2FzeW5jOiB0cnVlLCBzaWxlbnQ6IHRydWV9LFxuICAgICAgICAgIChjb2RlLCBzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgICAgICAgLy8gUnVuIHRoZSBwcm92aWRlZCBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IGZhaWxlZCA9IGZvcm1hdHRlci5jYWxsYmFja0ZvcihhY3Rpb24pKGZpbGUsIGNvZGUsIHN0ZG91dCwgc3RkZXJyKTtcbiAgICAgICAgICAgIGlmIChmYWlsZWQpIHtcbiAgICAgICAgICAgICAgZmFpbHVyZXMucHVzaChmaWxlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGUgaW4gdGhlIHByb2dyZXNzIGJhciBhbm90aGVyIGZpbGUgYmVpbmcgY29tcGxldGVkLlxuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICAgICAgICAgICAgLy8gSWYgbW9yZSBmaWxlcyBleGlzdCBpbiB0aGUgbGlzdCwgcnVuIGFnYWluIHRvIHdvcmsgb24gdGhlIG5leHQgZmlsZSxcbiAgICAgICAgICAgIC8vIHVzaW5nIHRoZSBzYW1lIHNsb3QuXG4gICAgICAgICAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm4gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBub3QgbW9yZSBmaWxlcyBhcmUgYXZhaWxhYmxlLCBtYXJrIHRoZSB0aHJlYWQgYXMgdW51c2VkLlxuICAgICAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBJZiBhbGwgb2YgdGhlIHRocmVhZHMgYXJlIGZhbHNlLCBhcyB0aGV5IGFyZSB1bnVzZWQsIG1hcmsgdGhlIHByb2dyZXNzIGJhclxuICAgICAgICAgICAgLy8gY29tcGxldGVkIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgICAgaWYgKHRocmVhZHMuZXZlcnkoYWN0aXZlID0+ICFhY3RpdmUpKSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWlsdXJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICk7XG4gICAgICAvLyBNYXJrIHRoZSB0aHJlYWQgYXMgaW4gdXNlIGFzIHRoZSBjb21tYW5kIGV4ZWN1dGlvbiBoYXMgYmVlbiBzdGFydGVkLlxuICAgICAgdGhyZWFkc1t0aHJlYWRdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCwgMCk7XG4gICAgLy8gU3RhcnQgcnVubmluZyB0aGUgY29tbWFuZCBvbiBmaWxlcyBmcm9tIHRoZSBsZWFzdCBpbiBlYWNoIGF2YWlsYWJsZSB0aHJlYWQuXG4gICAgdGhyZWFkcy5mb3JFYWNoKChfLCBpZHgpID0+IHJ1bkNvbW1hbmRJblRocmVhZChpZHgpKTtcbiAgfSk7XG59XG4iXX0=