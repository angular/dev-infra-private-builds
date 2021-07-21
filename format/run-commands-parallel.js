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
        define("@angular/dev-infra-private/format/run-commands-parallel", ["require", "exports", "tslib", "cli-progress", "multimatch", "os", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/format/formatters/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.runFormatterInParallel = void 0;
    var tslib_1 = require("tslib");
    var cli_progress_1 = require("cli-progress");
    var multimatch = require("multimatch");
    var os_1 = require("os");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
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
                var _a = tslib_1.__read(tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(formatter.commandFor(action).split(' '))), [file])), spawnCmd = _a[0], spawnArgs = _a.slice(1);
                child_process_1.spawn(spawnCmd, spawnArgs, { suppressErrorOnFailingExitCode: true, mode: 'silent' })
                    .then(function (_a) {
                    var stdout = _a.stdout, stderr = _a.stderr, status = _a.status;
                    // Run the provided callback function.
                    var failed = formatter.callbackFor(action)(file, status, stdout, stderr);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZDQUFpQztJQUNqQyx1Q0FBeUM7SUFDekMseUJBQXdCO0lBRXhCLGdGQUEwRDtJQUMxRCxvRUFBc0M7SUFFdEMsNEVBQW1GO0lBRW5GLElBQU0saUJBQWlCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFJLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBVXpEOzs7Ozs7Ozs7OztPQVdHO0lBQ0gsU0FBZ0Isc0JBQXNCLENBQUMsUUFBa0IsRUFBRSxNQUF1QjtRQUNoRixPQUFPLElBQUksT0FBTyxDQUF3QixVQUFDLE9BQU87O1lBQ2hELElBQU0sVUFBVSxHQUFHLDJCQUFtQixFQUFFLENBQUM7WUFDekMsSUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztZQUNyQyxJQUFNLGVBQWUsR0FBMkMsRUFBRSxDQUFDO29DQUV4RCxTQUFTO2dCQUNsQixlQUFlLENBQUMsSUFBSSxPQUFwQixlQUFlLDJDQUNSLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7cUJBQzNFLEdBQUcsQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsRUFBQyxTQUFTLFdBQUEsRUFBRSxJQUFJLE1BQUEsRUFBQyxDQUFDLEVBQW5CLENBQW1CLENBQUMsSUFBRTs7O2dCQUg3QyxLQUF3QixJQUFBLGVBQUEsaUJBQUEsVUFBVSxDQUFBLHNDQUFBO29CQUE3QixJQUFNLFNBQVMsdUJBQUE7NEJBQVQsU0FBUztpQkFJbkI7Ozs7Ozs7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QUN2RSxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3pCLENBQUM7WUFFRCx5QkFBeUI7WUFDekIsV0FBVyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLDhFQUE4RTtZQUM5RSxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSyxPQUFBLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUF2QixDQUF1QixDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBbEZELHdEQWtGQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCAqIGFzIG11bHRpbWF0Y2ggZnJvbSAnbXVsdGltYXRjaCc7XG5pbXBvcnQge2NwdXN9IGZyb20gJ29zJztcblxuaW1wb3J0IHtzcGF3biwgU3Bhd25SZXN1bHR9IGZyb20gJy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbiwgZ2V0QWN0aXZlRm9ybWF0dGVyc30gZnJvbSAnLi9mb3JtYXR0ZXJzL2luZGV4JztcblxuY29uc3QgQVZBSUxBQkxFX1RIUkVBRFMgPSBNYXRoLm1heChjcHVzKCkubGVuZ3RoIC0gMSwgMSk7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIGZhaWx1cmUgb2NjdXJyZWQgZHVyaW5nIGZvcm1hdHRpbmcgb2YgYSBmaWxlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBGb3JtYXRGYWlsdXJlIHtcbiAgLyoqIFBhdGggdG8gdGhlIGZpbGUgdGhhdCBmYWlsZWQuICovXG4gIGZpbGVQYXRoOiBzdHJpbmc7XG4gIC8qKiBFcnJvciBtZXNzYWdlIHJlcG9ydGVkIGJ5IHRoZSBmb3JtYXR0ZXIuICovXG4gIG1lc3NhZ2U6IHN0cmluZztcbn1cblxuLyoqXG4gKiBSdW4gdGhlIHByb3ZpZGVkIGNvbW1hbmRzIGluIHBhcmFsbGVsIGZvciBlYWNoIHByb3ZpZGVkIGZpbGUuXG4gKlxuICogUnVubmluZyB0aGUgZm9ybWF0dGVyIGlzIHNwbGl0IGFjcm9zcyAobnVtYmVyIG9mIGF2YWlsYWJsZSBjcHUgdGhyZWFkcyAtIDEpIHByb2Nlc3Nlc3MuXG4gKiBUaGUgdGFzayBpcyBkb25lIGluIG11bHRpcGxlIHByb2Nlc3Nlc3MgdG8gc3BlZWQgdXAgdGhlIG92ZXJhbGwgdGltZSBvZiB0aGUgdGFzaywgYXMgcnVubmluZ1xuICogYWNyb3NzIGVudGlyZSByZXBvc2l0b3JpZXMgdGFrZXMgYSBsYXJnZSBhbW91bnQgb2YgdGltZS5cbiAqIEFzIGEgZGF0YSBwb2ludCBmb3IgaWxsdXN0cmF0aW9uLCB1c2luZyA4IHByb2Nlc3MgcmF0aGVyIHRoYW4gMSBjdXQgdGhlIGV4ZWN1dGlvblxuICogdGltZSBmcm9tIDI3NiBzZWNvbmRzIHRvIDM5IHNlY29uZHMgZm9yIHRoZSBzYW1lIDI3MDAgZmlsZXMuXG4gKlxuICogQSBwcm9taXNlIGlzIHJldHVybmVkLCBjb21wbGV0ZWQgd2hlbiB0aGUgY29tbWFuZCBoYXMgY29tcGxldGVkIHJ1bm5pbmcgZm9yIGVhY2ggZmlsZS5cbiAqIFRoZSBwcm9taXNlIHJlc29sdmVzIHdpdGggYSBsaXN0IG9mIGZhaWx1cmVzLCBvciBgZmFsc2VgIGlmIG5vIGZvcm1hdHRlcnMgaGF2ZSBtYXRjaGVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuRm9ybWF0dGVySW5QYXJhbGxlbChhbGxGaWxlczogc3RyaW5nW10sIGFjdGlvbjogRm9ybWF0dGVyQWN0aW9uKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTxmYWxzZXxGb3JtYXRGYWlsdXJlW10+KChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVycyA9IGdldEFjdGl2ZUZvcm1hdHRlcnMoKTtcbiAgICBjb25zdCBmYWlsdXJlczogRm9ybWF0RmFpbHVyZVtdID0gW107XG4gICAgY29uc3QgcGVuZGluZ0NvbW1hbmRzOiB7Zm9ybWF0dGVyOiBGb3JtYXR0ZXIsIGZpbGU6IHN0cmluZ31bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBmb3JtYXR0ZXIgb2YgZm9ybWF0dGVycykge1xuICAgICAgcGVuZGluZ0NvbW1hbmRzLnB1c2goXG4gICAgICAgICAgLi4ubXVsdGltYXRjaC5jYWxsKHVuZGVmaW5lZCwgYWxsRmlsZXMsIGZvcm1hdHRlci5nZXRGaWxlTWF0Y2hlcigpLCB7ZG90OiB0cnVlfSlcbiAgICAgICAgICAgICAgLm1hcChmaWxlID0+ICh7Zm9ybWF0dGVyLCBmaWxlfSkpKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBjb21tYW5kcyBhcmUgZ2VuZXJhdGVkLCByZXNvbHZlIHRoZSBwcm9taXNlIGFzIGBmYWxzZWAgYXMgbm8gZmlsZXNcbiAgICAvLyB3ZXJlIHJ1biBhZ2FpbnN0IHRoZSBhbnkgZm9ybWF0dGVycy5cbiAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICBpbmZvKGBGb3JtYXR0aW5nICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgaW5mbyhgQ2hlY2tpbmcgZm9ybWF0IG9mICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGZvcm1hdCBhY3Rpb24gXCIke2FjdGlvbn1cIjogYWxsb3dlZCBhY3Rpb25zIGFyZSBcImZvcm1hdFwiIGFuZCBcImNoZWNrXCJgKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcHJvZ3Jlc3MgYmFyIGluc3RhbmNlIHRvIHVzZSBmb3IgcHJvZ3Jlc3MgdHJhY2tpbmcuXG4gICAgY29uc3QgcHJvZ3Jlc3NCYXIgPVxuICAgICAgICBuZXcgQmFyKHtmb3JtYXQ6IGBbe2Jhcn1dIEVUQToge2V0YX1zIHwge3ZhbHVlfS97dG90YWx9IGZpbGVzYCwgY2xlYXJPbkNvbXBsZXRlOiB0cnVlfSk7XG4gICAgLy8gQSBsb2NhbCBjb3B5IG9mIHRoZSBmaWxlcyB0byBydW4gdGhlIGNvbW1hbmQgb24uXG4gICAgLy8gQW4gYXJyYXkgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW50IHVzYWdlIHN0YXRlIG9mIGVhY2ggb2YgdGhlIHRocmVhZHMgZm9yIHBhcmFsbGVsaXphdGlvbi5cbiAgICBjb25zdCB0aHJlYWRzID0gbmV3IEFycmF5PGJvb2xlYW4+KEFWQUlMQUJMRV9USFJFQURTKS5maWxsKGZhbHNlKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IHJ1biB0aGUgY29tbWFuZCBvbiB0aGUgbmV4dCBhdmFpbGFibGUgZmlsZSBmcm9tIHRoZSBsaXN0IHVzaW5nIHRoZSBwcm92aWRlZFxuICAgIC8vIHRocmVhZC5cbiAgICBmdW5jdGlvbiBydW5Db21tYW5kSW5UaHJlYWQodGhyZWFkOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IG5leHRDb21tYW5kID0gcGVuZGluZ0NvbW1hbmRzLnBvcCgpO1xuICAgICAgLy8gSWYgbm8gZmlsZSB3YXMgcHVsbGVkIGZyb20gdGhlIGFycmF5LCByZXR1cm4gYXMgdGhlcmUgYXJlIG5vIG1vcmUgZmlsZXMgdG8gcnVuIGFnYWluc3QuXG4gICAgICBpZiAobmV4dENvbW1hbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJlYWRzW3RocmVhZF0gPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGZpbGUgYW5kIGZvcm1hdHRlciBmb3IgdGhlIG5leHQgY29tbWFuZC5cbiAgICAgIGNvbnN0IHtmaWxlLCBmb3JtYXR0ZXJ9ID0gbmV4dENvbW1hbmQ7XG5cbiAgICAgIGNvbnN0IFtzcGF3bkNtZCwgLi4uc3Bhd25BcmdzXSA9IFsuLi5mb3JtYXR0ZXIuY29tbWFuZEZvcihhY3Rpb24pLnNwbGl0KCcgJyksIGZpbGVdO1xuICAgICAgc3Bhd24oc3Bhd25DbWQsIHNwYXduQXJncywge3N1cHByZXNzRXJyb3JPbkZhaWxpbmdFeGl0Q29kZTogdHJ1ZSwgbW9kZTogJ3NpbGVudCd9KVxuICAgICAgICAgIC50aGVuKCh7c3Rkb3V0LCBzdGRlcnIsIHN0YXR1c306IFNwYXduUmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gZm9ybWF0dGVyLmNhbGxiYWNrRm9yKGFjdGlvbikoZmlsZSwgc3RhdHVzLCBzdGRvdXQsIHN0ZGVycik7XG4gICAgICAgICAgICBpZiAoZmFpbGVkKSB7XG4gICAgICAgICAgICAgIGZhaWx1cmVzLnB1c2goe2ZpbGVQYXRoOiBmaWxlLCBtZXNzYWdlOiBzdGRlcnJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIE5vdGUgaW4gdGhlIHByb2dyZXNzIGJhciBhbm90aGVyIGZpbGUgYmVpbmcgY29tcGxldGVkLlxuICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICAgICAgICAgICAgLy8gSWYgbW9yZSBmaWxlcyBleGlzdCBpbiB0aGUgbGlzdCwgcnVuIGFnYWluIHRvIHdvcmsgb24gdGhlIG5leHQgZmlsZSxcbiAgICAgICAgICAgIC8vIHVzaW5nIHRoZSBzYW1lIHNsb3QuXG4gICAgICAgICAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm4gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBub3QgbW9yZSBmaWxlcyBhcmUgYXZhaWxhYmxlLCBtYXJrIHRoZSB0aHJlYWQgYXMgdW51c2VkLlxuICAgICAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBJZiBhbGwgb2YgdGhlIHRocmVhZHMgYXJlIGZhbHNlLCBhcyB0aGV5IGFyZSB1bnVzZWQsIG1hcmsgdGhlIHByb2dyZXNzIGJhclxuICAgICAgICAgICAgLy8gY29tcGxldGVkIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgICAgaWYgKHRocmVhZHMuZXZlcnkoYWN0aXZlID0+ICFhY3RpdmUpKSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZShmYWlsdXJlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAvLyBNYXJrIHRoZSB0aHJlYWQgYXMgaW4gdXNlIGFzIHRoZSBjb21tYW5kIGV4ZWN1dGlvbiBoYXMgYmVlbiBzdGFydGVkLlxuICAgICAgdGhyZWFkc1t0aHJlYWRdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCwgMCk7XG4gICAgLy8gU3RhcnQgcnVubmluZyB0aGUgY29tbWFuZCBvbiBmaWxlcyBmcm9tIHRoZSBsZWFzdCBpbiBlYWNoIGF2YWlsYWJsZSB0aHJlYWQuXG4gICAgdGhyZWFkcy5mb3JFYWNoKChfLCBpZHgpID0+IHJ1bkNvbW1hbmRJblRocmVhZChpZHgpKTtcbiAgfSk7XG59XG4iXX0=