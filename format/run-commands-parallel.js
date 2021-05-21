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
    var index_1 = require("@angular/dev-infra-private/format/formatters/index");
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
            var formatters = index_1.getActiveFormatters();
            var failures = [];
            var pendingCommands = [];
            var _loop_1 = function (formatter) {
                pendingCommands.push.apply(pendingCommands, tslib_1.__spreadArray([], tslib_1.__read(multimatch.call(undefined, allFiles, formatter.getFileMatcher(), { dot: true })
                    .map(function (file) { return ({ formatter: formatter, file: file }); }))));
            };
            try {
                for (var formatters_1 = tslib_1.__values(formatters), formatters_1_1 = formatters_1.next(); !formatters_1_1.done; formatters_1_1 = formatters_1.next()) {
                    var formatter = formatters_1_1.value;
                    _loop_1(formatter);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (formatters_1_1 && !formatters_1_1.done && (_a = formatters_1.return)) _a.call(formatters_1);
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
                        failures.push({ filePath: file, message: stderr });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyx1Q0FBeUM7SUFDekMseUJBQXdCO0lBQ3hCLG1DQUE2QjtJQUU3QixvRUFBc0M7SUFFdEMsNEVBQW1GO0lBRW5GLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBVXpEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsUUFBa0IsRUFBRSxNQUF1QjtRQUNoRixPQUFPLElBQUksT0FBTyxDQUF3QixVQUFDLE9BQU87O1lBQ2hELElBQU0sVUFBVSxHQUFHLDJCQUFtQixFQUFFLENBQUM7WUFDekMsSUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztZQUNyQyxJQUFNLGVBQWUsR0FBMkMsRUFBRSxDQUFDO29DQUV4RCxTQUFTO2dCQUNsQixlQUFlLENBQUMsSUFBSSxPQUFwQixlQUFlLDJDQUNSLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7cUJBQzNFLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsRUFBQyxTQUFTLFdBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsSUFBRTs7O2dCQUg3QyxLQUF3QixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBO29CQUE3QixJQUFNLFNBQVMsdUJBQUE7NEJBQVQsU0FBUztpQkFJbkI7Ozs7Ozs7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LE9BQU8sQ0FBQyxVQUFDLENBQUMsRUFBRSxHQUFHLElBQUssT0FBQSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQyxDQUFDO1FBQ3ZELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQXBGRCx3REFvRkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXJ9IGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtjcHVzfSBmcm9tICdvcyc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlciwgRm9ybWF0dGVyQWN0aW9uLCBnZXRBY3RpdmVGb3JtYXR0ZXJzfSBmcm9tICcuL2Zvcm1hdHRlcnMvaW5kZXgnO1xuXG5jb25zdCBBVkFJTEFCTEVfVEhSRUFEUyA9IE1hdGgubWF4KGNwdXMoKS5sZW5ndGggLSAxLCAxKTtcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgZmFpbHVyZSBvY2N1cnJlZCBkdXJpbmcgZm9ybWF0dGluZyBvZiBhIGZpbGUuICovXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdEZhaWx1cmUge1xuICAvKiogUGF0aCB0byB0aGUgZmlsZSB0aGF0IGZhaWxlZC4gKi9cbiAgZmlsZVBhdGg6IHN0cmluZztcbiAgLyoqIEVycm9yIG1lc3NhZ2UgcmVwb3J0ZWQgYnkgdGhlIGZvcm1hdHRlci4gKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgcHJvdmlkZWQgY29tbWFuZHMgaW4gcGFyYWxsZWwgZm9yIGVhY2ggcHJvdmlkZWQgZmlsZS5cbiAqXG4gKiBSdW5uaW5nIHRoZSBmb3JtYXR0ZXIgaXMgc3BsaXQgYWNyb3NzIChudW1iZXIgb2YgYXZhaWxhYmxlIGNwdSB0aHJlYWRzIC0gMSkgcHJvY2Vzc2Vzcy5cbiAqIFRoZSB0YXNrIGlzIGRvbmUgaW4gbXVsdGlwbGUgcHJvY2Vzc2VzcyB0byBzcGVlZCB1cCB0aGUgb3ZlcmFsbCB0aW1lIG9mIHRoZSB0YXNrLCBhcyBydW5uaW5nXG4gKiBhY3Jvc3MgZW50aXJlIHJlcG9zaXRvcmllcyB0YWtlcyBhIGxhcmdlIGFtb3VudCBvZiB0aW1lLlxuICogQXMgYSBkYXRhIHBvaW50IGZvciBpbGx1c3RyYXRpb24sIHVzaW5nIDggcHJvY2VzcyByYXRoZXIgdGhhbiAxIGN1dCB0aGUgZXhlY3V0aW9uXG4gKiB0aW1lIGZyb20gMjc2IHNlY29uZHMgdG8gMzkgc2Vjb25kcyBmb3IgdGhlIHNhbWUgMjcwMCBmaWxlcy5cbiAqXG4gKiBBIHByb21pc2UgaXMgcmV0dXJuZWQsIGNvbXBsZXRlZCB3aGVuIHRoZSBjb21tYW5kIGhhcyBjb21wbGV0ZWQgcnVubmluZyBmb3IgZWFjaCBmaWxlLlxuICogVGhlIHByb21pc2UgcmVzb2x2ZXMgd2l0aCBhIGxpc3Qgb2YgZmFpbHVyZXMsIG9yIGBmYWxzZWAgaWYgbm8gZm9ybWF0dGVycyBoYXZlIG1hdGNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGFsbEZpbGVzOiBzdHJpbmdbXSwgYWN0aW9uOiBGb3JtYXR0ZXJBY3Rpb24pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGZhbHNlfEZvcm1hdEZhaWx1cmVbXT4oKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBmb3JtYXR0ZXJzID0gZ2V0QWN0aXZlRm9ybWF0dGVycygpO1xuICAgIGNvbnN0IGZhaWx1cmVzOiBGb3JtYXRGYWlsdXJlW10gPSBbXTtcbiAgICBjb25zdCBwZW5kaW5nQ29tbWFuZHM6IHtmb3JtYXR0ZXI6IEZvcm1hdHRlciwgZmlsZTogc3RyaW5nfVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKSB7XG4gICAgICBwZW5kaW5nQ29tbWFuZHMucHVzaChcbiAgICAgICAgICAuLi5tdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBhbGxGaWxlcywgZm9ybWF0dGVyLmdldEZpbGVNYXRjaGVyKCksIHtkb3Q6IHRydWV9KVxuICAgICAgICAgICAgICAubWFwKGZpbGUgPT4gKHtmb3JtYXR0ZXIsIGZpbGV9KSkpO1xuICAgIH1cblxuICAgIC8vIElmIG5vIGNvbW1hbmRzIGFyZSBnZW5lcmF0ZWQsIHJlc29sdmUgdGhlIHByb21pc2UgYXMgYGZhbHNlYCBhcyBubyBmaWxlc1xuICAgIC8vIHdlcmUgcnVuIGFnYWluc3QgdGhlIGFueSBmb3JtYXR0ZXJzLlxuICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAgIGluZm8oYEZvcm1hdHRpbmcgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICBpbmZvKGBDaGVja2luZyBmb3JtYXQgb2YgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZm9ybWF0IGFjdGlvbiBcIiR7YWN0aW9ufVwiOiBhbGxvd2VkIGFjdGlvbnMgYXJlIFwiZm9ybWF0XCIgYW5kIFwiY2hlY2tcImApO1xuICAgIH1cblxuICAgIC8vIFRoZSBwcm9ncmVzcyBiYXIgaW5zdGFuY2UgdG8gdXNlIGZvciBwcm9ncmVzcyB0cmFja2luZy5cbiAgICBjb25zdCBwcm9ncmVzc0JhciA9XG4gICAgICAgIG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH0gZmlsZXNgLCBjbGVhck9uQ29tcGxldGU6IHRydWV9KTtcbiAgICAvLyBBIGxvY2FsIGNvcHkgb2YgdGhlIGZpbGVzIHRvIHJ1biB0aGUgY29tbWFuZCBvbi5cbiAgICAvLyBBbiBhcnJheSB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdXNhZ2Ugc3RhdGUgb2YgZWFjaCBvZiB0aGUgdGhyZWFkcyBmb3IgcGFyYWxsZWxpemF0aW9uLlxuICAgIGNvbnN0IHRocmVhZHMgPSBuZXcgQXJyYXk8Ym9vbGVhbj4oQVZBSUxBQkxFX1RIUkVBRFMpLmZpbGwoZmFsc2UpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgcnVuIHRoZSBjb21tYW5kIG9uIHRoZSBuZXh0IGF2YWlsYWJsZSBmaWxlIGZyb20gdGhlIGxpc3QgdXNpbmcgdGhlIHByb3ZpZGVkXG4gICAgLy8gdGhyZWFkLlxuICAgIGZ1bmN0aW9uIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQ6IG51bWJlcikge1xuICAgICAgY29uc3QgbmV4dENvbW1hbmQgPSBwZW5kaW5nQ29tbWFuZHMucG9wKCk7XG4gICAgICAvLyBJZiBubyBmaWxlIHdhcyBwdWxsZWQgZnJvbSB0aGUgYXJyYXksIHJldHVybiBhcyB0aGVyZSBhcmUgbm8gbW9yZSBmaWxlcyB0byBydW4gYWdhaW5zdC5cbiAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgZmlsZSBhbmQgZm9ybWF0dGVyIGZvciB0aGUgbmV4dCBjb21tYW5kLlxuICAgICAgY29uc3Qge2ZpbGUsIGZvcm1hdHRlcn0gPSBuZXh0Q29tbWFuZDtcblxuICAgICAgZXhlYyhcbiAgICAgICAgICBgJHtmb3JtYXR0ZXIuY29tbWFuZEZvcihhY3Rpb24pfSAke2ZpbGV9YCxcbiAgICAgICAgICB7YXN5bmM6IHRydWUsIHNpbGVudDogdHJ1ZX0sXG4gICAgICAgICAgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gZm9ybWF0dGVyLmNhbGxiYWNrRm9yKGFjdGlvbikoZmlsZSwgY29kZSwgc3Rkb3V0LCBzdGRlcnIpO1xuICAgICAgICAgICAgaWYgKGZhaWxlZCkge1xuICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKHtmaWxlUGF0aDogZmlsZSwgbWVzc2FnZTogc3RkZXJyfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBOb3RlIGluIHRoZSBwcm9ncmVzcyBiYXIgYW5vdGhlciBmaWxlIGJlaW5nIGNvbXBsZXRlZC5cbiAgICAgICAgICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgICAgICAgICAgIC8vIElmIG1vcmUgZmlsZXMgZXhpc3QgaW4gdGhlIGxpc3QsIHJ1biBhZ2FpbiB0byB3b3JrIG9uIHRoZSBuZXh0IGZpbGUsXG4gICAgICAgICAgICAvLyB1c2luZyB0aGUgc2FtZSBzbG90LlxuICAgICAgICAgICAgaWYgKHBlbmRpbmdDb21tYW5kcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgbm90IG1vcmUgZmlsZXMgYXJlIGF2YWlsYWJsZSwgbWFyayB0aGUgdGhyZWFkIGFzIHVudXNlZC5cbiAgICAgICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gSWYgYWxsIG9mIHRoZSB0aHJlYWRzIGFyZSBmYWxzZSwgYXMgdGhleSBhcmUgdW51c2VkLCBtYXJrIHRoZSBwcm9ncmVzcyBiYXJcbiAgICAgICAgICAgIC8vIGNvbXBsZXRlZCBhbmQgcmVzb2x2ZSB0aGUgcHJvbWlzZS5cbiAgICAgICAgICAgIGlmICh0aHJlYWRzLmV2ZXJ5KGFjdGl2ZSA9PiAhYWN0aXZlKSkge1xuICAgICAgICAgICAgICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gICAgICAgICAgICAgIHJlc29sdmUoZmFpbHVyZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICApO1xuICAgICAgLy8gTWFyayB0aGUgdGhyZWFkIGFzIGluIHVzZSBhcyB0aGUgY29tbWFuZCBleGVjdXRpb24gaGFzIGJlZW4gc3RhcnRlZC5cbiAgICAgIHRocmVhZHNbdGhyZWFkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICAgIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdDb21tYW5kcy5sZW5ndGgsIDApO1xuICAgIC8vIFN0YXJ0IHJ1bm5pbmcgdGhlIGNvbW1hbmQgb24gZmlsZXMgZnJvbSB0aGUgbGVhc3QgaW4gZWFjaCBhdmFpbGFibGUgdGhyZWFkLlxuICAgIHRocmVhZHMuZm9yRWFjaCgoXywgaWR4KSA9PiBydW5Db21tYW5kSW5UaHJlYWQoaWR4KSk7XG4gIH0pO1xufVxuIl19