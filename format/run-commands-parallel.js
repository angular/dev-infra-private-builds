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
        define("@angular/dev-infra-private/format/run-commands-parallel", ["require", "exports", "tslib", "cli-progress", "multimatch", "os", "shelljs", "@angular/dev-infra-private/format/formatters/index"], factory);
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
                    console.info("Formatting " + pendingCommands.length + " file(s)");
                    break;
                case 'check':
                    console.info("Checking format of " + pendingCommands.length + " file(s)");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyx1Q0FBeUM7SUFDekMseUJBQXdCO0lBQ3hCLG1DQUE2QjtJQUU3QixpRkFBNkU7SUFFN0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFekQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxRQUFrQixFQUFFLE1BQXVCO1FBQ2hGLE9BQU8sSUFBSSxPQUFPLENBQWlCLFVBQUMsT0FBTzs7WUFDekMsSUFBTSxVQUFVLEdBQUcsZ0NBQW1CLEVBQUUsQ0FBQztZQUN6QyxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7WUFDOUIsSUFBTSxlQUFlLEdBQTJDLEVBQUUsQ0FBQztvQ0FFeEQsU0FBUztnQkFDbEIsZUFBZSxDQUFDLElBQUksT0FBcEIsZUFBZSxtQkFBUyxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDbEQsR0FBRyxFQUFFLElBQUk7aUJBQ1YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsRUFBQyxTQUFTLFdBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsR0FBRTs7O2dCQUg1RCxLQUF3QixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBO29CQUE3QixJQUFNLFNBQVMsdUJBQUE7NEJBQVQsU0FBUztpQkFJbkI7Ozs7Ozs7OztZQUVELDJFQUEyRTtZQUMzRSx1Q0FBdUM7WUFDdkMs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R0FBRyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFwRkQsd0RBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0ICogYXMgbXVsdGltYXRjaCBmcm9tICdtdWx0aW1hdGNoJztcbmltcG9ydCB7Y3B1c30gZnJvbSAnb3MnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbiwgZ2V0QWN0aXZlRm9ybWF0dGVyc30gZnJvbSAnLi9mb3JtYXR0ZXJzJztcblxuY29uc3QgQVZBSUxBQkxFX1RIUkVBRFMgPSBNYXRoLm1heChjcHVzKCkubGVuZ3RoIC0gMSwgMSk7XG5cbi8qKlxuICogUnVuIHRoZSBwcm92aWRlZCBjb21tYW5kcyBpbiBwYXJhbGxlbCBmb3IgZWFjaCBwcm92aWRlZCBmaWxlLlxuICpcbiAqIFJ1bm5pbmcgdGhlIGZvcm1hdHRlciBpcyBzcGxpdCBhY3Jvc3MgKG51bWJlciBvZiBhdmFpbGFibGUgY3B1IHRocmVhZHMgLSAxKSBwcm9jZXNzZXNzLlxuICogVGhlIHRhc2sgaXMgZG9uZSBpbiBtdWx0aXBsZSBwcm9jZXNzZXNzIHRvIHNwZWVkIHVwIHRoZSBvdmVyYWxsIHRpbWUgb2YgdGhlIHRhc2ssIGFzIHJ1bm5pbmdcbiAqIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2UgYW1vdW50IG9mIHRpbWUuXG4gKiBBcyBhIGRhdGEgcG9pbnQgZm9yIGlsbHVzdHJhdGlvbiwgdXNpbmcgOCBwcm9jZXNzIHJhdGhlciB0aGFuIDEgY3V0IHRoZSBleGVjdXRpb25cbiAqIHRpbWUgZnJvbSAyNzYgc2Vjb25kcyB0byAzOSBzZWNvbmRzIGZvciB0aGUgc2FtZSAyNzAwIGZpbGVzLlxuICpcbiAqIEEgcHJvbWlzZSBpcyByZXR1cm5lZCwgY29tcGxldGVkIHdoZW4gdGhlIGNvbW1hbmQgaGFzIGNvbXBsZXRlZCBydW5uaW5nIGZvciBlYWNoIGZpbGUuXG4gKiBUaGUgcHJvbWlzZSByZXNvbHZlcyB3aXRoIGEgbGlzdCBvZiBmYWlsdXJlcywgb3IgYGZhbHNlYCBpZiBubyBmb3JtYXR0ZXJzIGhhdmUgbWF0Y2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoYWxsRmlsZXM6IHN0cmluZ1tdLCBhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICByZXR1cm4gbmV3IFByb21pc2U8ZmFsc2V8c3RyaW5nW10+KChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVycyA9IGdldEFjdGl2ZUZvcm1hdHRlcnMoKTtcbiAgICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBwZW5kaW5nQ29tbWFuZHM6IHtmb3JtYXR0ZXI6IEZvcm1hdHRlciwgZmlsZTogc3RyaW5nfVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKSB7XG4gICAgICBwZW5kaW5nQ29tbWFuZHMucHVzaCguLi5tdWx0aW1hdGNoKGFsbEZpbGVzLCBmb3JtYXR0ZXIuZ2V0RmlsZU1hdGNoZXIoKSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb3Q6IHRydWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLm1hcChmaWxlID0+ICh7Zm9ybWF0dGVyLCBmaWxlfSkpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBjb21tYW5kcyBhcmUgZ2VuZXJhdGVkLCByZXNvbHZlIHRoZSBwcm9taXNlIGFzIGBmYWxzZWAgYXMgbm8gZmlsZXNcbiAgICAvLyB3ZXJlIHJ1biBhZ2FpbnN0IHRoZSBhbnkgZm9ybWF0dGVycy5cbiAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICBjb25zb2xlLmluZm8oYEZvcm1hdHRpbmcgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICBjb25zb2xlLmluZm8oYENoZWNraW5nIGZvcm1hdCBvZiAke3BlbmRpbmdDb21tYW5kcy5sZW5ndGh9IGZpbGUocylgKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBmb3JtYXQgYWN0aW9uIFwiJHthY3Rpb259XCI6IGFsbG93ZWQgYWN0aW9ucyBhcmUgXCJmb3JtYXRcIiBhbmQgXCJjaGVja1wiYCk7XG4gICAgfVxuXG4gICAgLy8gVGhlIHByb2dyZXNzIGJhciBpbnN0YW5jZSB0byB1c2UgZm9yIHByb2dyZXNzIHRyYWNraW5nLlxuICAgIGNvbnN0IHByb2dyZXNzQmFyID1cbiAgICAgICAgbmV3IEJhcih7Zm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfSBmaWxlc2AsIGNsZWFyT25Db21wbGV0ZTogdHJ1ZX0pO1xuICAgIC8vIEEgbG9jYWwgY29weSBvZiB0aGUgZmlsZXMgdG8gcnVuIHRoZSBjb21tYW5kIG9uLlxuICAgIC8vIEFuIGFycmF5IHRvIHJlcHJlc2VudCB0aGUgY3VycmVudCB1c2FnZSBzdGF0ZSBvZiBlYWNoIG9mIHRoZSB0aHJlYWRzIGZvciBwYXJhbGxlbGl6YXRpb24uXG4gICAgY29uc3QgdGhyZWFkcyA9IG5ldyBBcnJheTxib29sZWFuPihBVkFJTEFCTEVfVEhSRUFEUykuZmlsbChmYWxzZSk7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBydW4gdGhlIGNvbW1hbmQgb24gdGhlIG5leHQgYXZhaWxhYmxlIGZpbGUgZnJvbSB0aGUgbGlzdCB1c2luZyB0aGUgcHJvdmlkZWRcbiAgICAvLyB0aHJlYWQuXG4gICAgZnVuY3Rpb24gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZDogbnVtYmVyKSB7XG4gICAgICBjb25zdCBuZXh0Q29tbWFuZCA9IHBlbmRpbmdDb21tYW5kcy5wb3AoKTtcbiAgICAgIC8vIElmIG5vIGZpbGUgd2FzIHB1bGxlZCBmcm9tIHRoZSBhcnJheSwgcmV0dXJuIGFzIHRoZXJlIGFyZSBubyBtb3JlIGZpbGVzIHRvIHJ1biBhZ2FpbnN0LlxuICAgICAgaWYgKG5leHRDb21tYW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBmaWxlIGFuZCBmb3JtYXR0ZXIgZm9yIHRoZSBuZXh0IGNvbW1hbmQuXG4gICAgICBjb25zdCB7ZmlsZSwgZm9ybWF0dGVyfSA9IG5leHRDb21tYW5kO1xuXG4gICAgICBleGVjKFxuICAgICAgICAgIGAke2Zvcm1hdHRlci5jb21tYW5kRm9yKGFjdGlvbil9ICR7ZmlsZX1gLFxuICAgICAgICAgIHthc3luYzogdHJ1ZSwgc2lsZW50OiB0cnVlfSxcbiAgICAgICAgICAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAgICBjb25zdCBmYWlsZWQgPSBmb3JtYXR0ZXIuY2FsbGJhY2tGb3IoYWN0aW9uKShmaWxlLCBjb2RlLCBzdGRvdXQsIHN0ZGVycik7XG4gICAgICAgICAgICBpZiAoZmFpbGVkKSB7XG4gICAgICAgICAgICAgIGZhaWx1cmVzLnB1c2goZmlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3RlIGluIHRoZSBwcm9ncmVzcyBiYXIgYW5vdGhlciBmaWxlIGJlaW5nIGNvbXBsZXRlZC5cbiAgICAgICAgICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgICAgICAgICAgIC8vIElmIG1vcmUgZmlsZXMgZXhpc3QgaW4gdGhlIGxpc3QsIHJ1biBhZ2FpbiB0byB3b3JrIG9uIHRoZSBuZXh0IGZpbGUsXG4gICAgICAgICAgICAvLyB1c2luZyB0aGUgc2FtZSBzbG90LlxuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb21tYW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgbm90IG1vcmUgZmlsZXMgYXJlIGF2YWlsYWJsZSwgbWFyayB0aGUgdGhyZWFkIGFzIHVudXNlZC5cbiAgICAgICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gSWYgYWxsIG9mIHRoZSB0aHJlYWRzIGFyZSBmYWxzZSwgYXMgdGhleSBhcmUgdW51c2VkLCBtYXJrIHRoZSBwcm9ncmVzcyBiYXJcbiAgICAgICAgICAgIC8vIGNvbXBsZXRlZCBhbmQgcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICAgIGlmICh0aHJlYWRzLmV2ZXJ5KGFjdGl2ZSA9PiAhYWN0aXZlKSkge1xuICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFpbHVyZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICApO1xuICAgICAgLy8gTWFyayB0aGUgdGhyZWFkIGFzIGluIHVzZSBhcyB0aGUgY29tbWFuZCBleGVjdXRpb24gaGFzIGJlZW4gc3RhcnRlZC5cbiAgICAgIHRocmVhZHNbdGhyZWFkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICAgIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdDb21tYW5kcy5sZW5ndGgsIDApO1xuICAgIC8vIFN0YXJ0IHJ1bm5pbmcgdGhlIGNvbW1hbmQgb24gZmlsZXMgZnJvbSB0aGUgbGVhc3QgaW4gZWFjaCBhdmFpbGFibGUgdGhyZWFkLlxuICAgIHRocmVhZHMuZm9yRWFjaCgoXywgaWR4KSA9PiBydW5Db21tYW5kSW5UaHJlYWQoaWR4KSk7XG4gIH0pO1xufVxuIl19