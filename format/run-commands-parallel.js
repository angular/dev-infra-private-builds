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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyx1Q0FBeUM7SUFDekMseUJBQXdCO0lBQ3hCLG1DQUE2QjtJQUU3QixpRkFBNkU7SUFFN0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFekQ7Ozs7Ozs7Ozs7O09BV0c7SUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxRQUFrQixFQUFFLE1BQXVCO1FBQ2hGLE9BQU8sSUFBSSxPQUFPLENBQWlCLFVBQUMsT0FBTzs7WUFDekMsSUFBTSxVQUFVLEdBQUcsZ0NBQW1CLEVBQUUsQ0FBQztZQUN6QyxJQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7WUFDOUIsSUFBTSxlQUFlLEdBQTJDLEVBQUUsQ0FBQztvQ0FFeEQsU0FBUztnQkFDbEIsZUFBZSxDQUFDLElBQUksT0FBcEIsZUFBZSxtQkFBUyxVQUFVLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDbEQsR0FBRyxFQUFFLElBQUk7aUJBQ1YsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsRUFBQyxTQUFTLFdBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsR0FBRTs7O2dCQUg1RCxLQUF3QixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBO29CQUE3QixJQUFNLFNBQVMsdUJBQUE7NEJBQVQsU0FBUztpQkFJbkI7Ozs7Ozs7OztZQUVELDJFQUEyRTtZQUMzRSx1Q0FBdUM7WUFDdkMs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R0FBRyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFwRkQsd0RBb0ZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2NwdXN9IGZyb20gJ29zJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyLCBGb3JtYXR0ZXJBY3Rpb24sIGdldEFjdGl2ZUZvcm1hdHRlcnN9IGZyb20gJy4vZm9ybWF0dGVycyc7XG5cbmNvbnN0IEFWQUlMQUJMRV9USFJFQURTID0gTWF0aC5tYXgoY3B1cygpLmxlbmd0aCAtIDEsIDEpO1xuXG4vKipcbiAqIFJ1biB0aGUgcHJvdmlkZWQgY29tbWFuZHMgaW4gcGFyYWxsZWwgZm9yIGVhY2ggcHJvdmlkZWQgZmlsZS5cbiAqXG4gKiBSdW5uaW5nIHRoZSBmb3JtYXR0ZXIgaXMgc3BsaXQgYWNyb3NzIChudW1iZXIgb2YgYXZhaWxhYmxlIGNwdSB0aHJlYWRzIC0gMSkgcHJvY2Vzc2Vzcy5cbiAqIFRoZSB0YXNrIGlzIGRvbmUgaW4gbXVsdGlwbGUgcHJvY2Vzc2VzcyB0byBzcGVlZCB1cCB0aGUgb3ZlcmFsbCB0aW1lIG9mIHRoZSB0YXNrLCBhcyBydW5uaW5nXG4gKiBhY3Jvc3MgZW50aXJlIHJlcG9zaXRvcmllcyB0YWtlcyBhIGxhcmdlIGFtb3VudCBvZiB0aW1lLlxuICogQXMgYSBkYXRhIHBvaW50IGZvciBpbGx1c3RyYXRpb24sIHVzaW5nIDggcHJvY2VzcyByYXRoZXIgdGhhbiAxIGN1dCB0aGUgZXhlY3V0aW9uXG4gKiB0aW1lIGZyb20gMjc2IHNlY29uZHMgdG8gMzkgc2Vjb25kcyBmb3IgdGhlIHNhbWUgMjcwMCBmaWxlcy5cbiAqXG4gKiBBIHByb21pc2UgaXMgcmV0dXJuZWQsIGNvbXBsZXRlZCB3aGVuIHRoZSBjb21tYW5kIGhhcyBjb21wbGV0ZWQgcnVubmluZyBmb3IgZWFjaCBmaWxlLlxuICogVGhlIHByb21pc2UgcmVzb2x2ZXMgd2l0aCBhIGxpc3Qgb2YgZmFpbHVyZXMsIG9yIGBmYWxzZWAgaWYgbm8gZm9ybWF0dGVycyBoYXZlIG1hdGNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGFsbEZpbGVzOiBzdHJpbmdbXSwgYWN0aW9uOiBGb3JtYXR0ZXJBY3Rpb24pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGZhbHNlfHN0cmluZ1tdPigocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdHRlcnMgPSBnZXRBY3RpdmVGb3JtYXR0ZXJzKCk7XG4gICAgY29uc3QgZmFpbHVyZXM6IHN0cmluZ1tdID0gW107XG4gICAgY29uc3QgcGVuZGluZ0NvbW1hbmRzOiB7Zm9ybWF0dGVyOiBGb3JtYXR0ZXIsIGZpbGU6IHN0cmluZ31bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBmb3JtYXR0ZXIgb2YgZm9ybWF0dGVycykge1xuICAgICAgcGVuZGluZ0NvbW1hbmRzLnB1c2goLi4ubXVsdGltYXRjaChhbGxGaWxlcywgZm9ybWF0dGVyLmdldEZpbGVNYXRjaGVyKCksIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG90OiB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KS5tYXAoZmlsZSA9PiAoe2Zvcm1hdHRlciwgZmlsZX0pKSk7XG4gICAgfVxuXG4gICAgLy8gSWYgbm8gY29tbWFuZHMgYXJlIGdlbmVyYXRlZCwgcmVzb2x2ZSB0aGUgcHJvbWlzZSBhcyBgZmFsc2VgIGFzIG5vIGZpbGVzXG4gICAgLy8gd2VyZSBydW4gYWdhaW5zdCB0aGUgYW55IGZvcm1hdHRlcnMuXG4gICAgaWYgKHBlbmRpbmdDb21tYW5kcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiByZXNvbHZlKGZhbHNlKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgY2FzZSAnZm9ybWF0JzpcbiAgICAgICAgY29uc29sZS5pbmZvKGBGb3JtYXR0aW5nICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgY29uc29sZS5pbmZvKGBDaGVja2luZyBmb3JtYXQgb2YgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZm9ybWF0IGFjdGlvbiBcIiR7YWN0aW9ufVwiOiBhbGxvd2VkIGFjdGlvbnMgYXJlIFwiZm9ybWF0XCIgYW5kIFwiY2hlY2tcImApO1xuICAgIH1cblxuICAgIC8vIFRoZSBwcm9ncmVzcyBiYXIgaW5zdGFuY2UgdG8gdXNlIGZvciBwcm9ncmVzcyB0cmFja2luZy5cbiAgICBjb25zdCBwcm9ncmVzc0JhciA9XG4gICAgICAgIG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH0gZmlsZXNgLCBjbGVhck9uQ29tcGxldGU6IHRydWV9KTtcbiAgICAvLyBBIGxvY2FsIGNvcHkgb2YgdGhlIGZpbGVzIHRvIHJ1biB0aGUgY29tbWFuZCBvbi5cbiAgICAvLyBBbiBhcnJheSB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdXNhZ2Ugc3RhdGUgb2YgZWFjaCBvZiB0aGUgdGhyZWFkcyBmb3IgcGFyYWxsZWxpemF0aW9uLlxuICAgIGNvbnN0IHRocmVhZHMgPSBuZXcgQXJyYXk8Ym9vbGVhbj4oQVZBSUxBQkxFX1RIUkVBRFMpLmZpbGwoZmFsc2UpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgcnVuIHRoZSBjb21tYW5kIG9uIHRoZSBuZXh0IGF2YWlsYWJsZSBmaWxlIGZyb20gdGhlIGxpc3QgdXNpbmcgdGhlIHByb3ZpZGVkXG4gICAgLy8gdGhyZWFkLlxuICAgIGZ1bmN0aW9uIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQ6IG51bWJlcikge1xuICAgICAgY29uc3QgbmV4dENvbW1hbmQgPSBwZW5kaW5nQ29tbWFuZHMucG9wKCk7XG4gICAgICAvLyBJZiBubyBmaWxlIHdhcyBwdWxsZWQgZnJvbSB0aGUgYXJyYXksIHJldHVybiBhcyB0aGVyZSBhcmUgbm8gbW9yZSBmaWxlcyB0byBydW4gYWdhaW5zdC5cbiAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgZmlsZSBhbmQgZm9ybWF0dGVyIGZvciB0aGUgbmV4dCBjb21tYW5kLlxuICAgICAgY29uc3Qge2ZpbGUsIGZvcm1hdHRlcn0gPSBuZXh0Q29tbWFuZDtcblxuICAgICAgZXhlYyhcbiAgICAgICAgICBgJHtmb3JtYXR0ZXIuY29tbWFuZEZvcihhY3Rpb24pfSAke2ZpbGV9YCxcbiAgICAgICAgICB7YXN5bmM6IHRydWUsIHNpbGVudDogdHJ1ZX0sXG4gICAgICAgICAgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gZm9ybWF0dGVyLmNhbGxiYWNrRm9yKGFjdGlvbikoZmlsZSwgY29kZSwgc3Rkb3V0LCBzdGRlcnIpO1xuICAgICAgICAgICAgaWYgKGZhaWxlZCkge1xuICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZSBpbiB0aGUgcHJvZ3Jlc3MgYmFyIGFub3RoZXIgZmlsZSBiZWluZyBjb21wbGV0ZWQuXG4gICAgICAgICAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gICAgICAgICAgICAvLyBJZiBtb3JlIGZpbGVzIGV4aXN0IGluIHRoZSBsaXN0LCBydW4gYWdhaW4gdG8gd29yayBvbiB0aGUgbmV4dCBmaWxlLFxuICAgICAgICAgICAgLy8gdXNpbmcgdGhlIHNhbWUgc2xvdC5cbiAgICAgICAgICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBydW5Db21tYW5kSW5UaHJlYWQodGhyZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIG5vdCBtb3JlIGZpbGVzIGFyZSBhdmFpbGFibGUsIG1hcmsgdGhlIHRocmVhZCBhcyB1bnVzZWQuXG4gICAgICAgICAgICB0aHJlYWRzW3RocmVhZF0gPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIElmIGFsbCBvZiB0aGUgdGhyZWFkcyBhcmUgZmFsc2UsIGFzIHRoZXkgYXJlIHVudXNlZCwgbWFyayB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgICAgICAgICAvLyBjb21wbGV0ZWQgYW5kIHJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgICBpZiAodGhyZWFkcy5ldmVyeShhY3RpdmUgPT4gIWFjdGl2ZSkpIHtcbiAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICAgICAgICAgICAgICByZXNvbHZlKGZhaWx1cmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgKTtcbiAgICAgIC8vIE1hcmsgdGhlIHRocmVhZCBhcyBpbiB1c2UgYXMgdGhlIGNvbW1hbmQgZXhlY3V0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQuXG4gICAgICB0aHJlYWRzW3RocmVhZF0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgICBwcm9ncmVzc0Jhci5zdGFydChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoLCAwKTtcbiAgICAvLyBTdGFydCBydW5uaW5nIHRoZSBjb21tYW5kIG9uIGZpbGVzIGZyb20gdGhlIGxlYXN0IGluIGVhY2ggYXZhaWxhYmxlIHRocmVhZC5cbiAgICB0aHJlYWRzLmZvckVhY2goKF8sIGlkeCkgPT4gcnVuQ29tbWFuZEluVGhyZWFkKGlkeCkpO1xuICB9KTtcbn1cbiJdfQ==