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
        define("@angular/dev-infra-private/format/run-commands-parallel", ["require", "exports", "cli-progress", "os", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var cli_progress_1 = require("cli-progress");
    var os_1 = require("os");
    var shelljs_1 = require("shelljs");
    var AVAILABLE_THREADS = Math.max(os_1.cpus().length - 1, 1);
    /**
     * Run the provided commands in parallel for each provided file.
     *
     * A promise is returned, completed when the command has completed running for each file.
     */
    function runInParallel(providedFiles, cmd, callback) {
        return new Promise(function (resolve) {
            if (providedFiles.length === 0) {
                return resolve();
            }
            // The progress bar instance to use for progress tracking.
            var progressBar = new cli_progress_1.Bar({ format: "[{bar}] ETA: {eta}s | {value}/{total} files", clearOnComplete: true });
            // A local copy of the files to run the command on.
            var files = providedFiles.slice();
            // An array to represent the current usage state of each of the threads for parallelization.
            var threads = new Array(AVAILABLE_THREADS).fill(false);
            // Recursively run the command on the next available file from the list using the provided
            // thread.
            function runCommandInThread(thread) {
                // Get the next file.
                var file = files.pop();
                // If no file was pulled from the array, return as there are no more files to run against.
                if (!file) {
                    return;
                }
                shelljs_1.exec(cmd + " " + file, { async: true, silent: true }, function (code, stdout, stderr) {
                    // Run the provided callback function.
                    callback(file, code, stdout, stderr);
                    // Note in the progress bar another file being completed.
                    progressBar.increment(1);
                    // If more files exist in the list, run again to work on the next file,
                    // using the same slot.
                    if (files.length) {
                        return runCommandInThread(thread);
                    }
                    // If not more files are available, mark the thread as unused.
                    threads[thread] = false;
                    // If all of the threads are false, as they are unused, mark the progress bar
                    // completed and resolve the promise.
                    if (threads.every(function (active) { return !active; })) {
                        progressBar.stop();
                        resolve();
                    }
                });
                // Mark the thread as in use as the command execution has been started.
                threads[thread] = true;
            }
            // Start the progress bar
            progressBar.start(files.length, 0);
            // Start running the command on files from the least in each available thread.
            threads.forEach(function (_, idx) { return runCommandInThread(idx); });
        });
    }
    exports.runInParallel = runInParallel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCw2Q0FBaUM7SUFDakMseUJBQXdCO0lBQ3hCLG1DQUE2QjtJQUU3QixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUl6RDs7OztPQUlHO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLGFBQXVCLEVBQUUsR0FBVyxFQUFFLFFBQTBCO1FBQzVGLE9BQU8sSUFBSSxPQUFPLENBQU8sVUFBQyxPQUFPO1lBQy9CLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7Z0JBQzlCLE9BQU8sT0FBTyxFQUFFLENBQUM7YUFDbEI7WUFDRCwwREFBMEQ7WUFDMUQsSUFBTSxXQUFXLEdBQ2IsSUFBSSxrQkFBRyxDQUFDLEVBQUMsTUFBTSxFQUFFLDZDQUE2QyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1lBQzVGLG1EQUFtRDtZQUNuRCxJQUFNLEtBQUssR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDcEMsNEZBQTRGO1lBQzVGLElBQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFVLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRWxFLDBGQUEwRjtZQUMxRixVQUFVO1lBQ1YsU0FBUyxrQkFBa0IsQ0FBQyxNQUFjO2dCQUN4QyxxQkFBcUI7Z0JBQ3JCLElBQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDekIsMEZBQTBGO2dCQUMxRixJQUFJLENBQUMsSUFBSSxFQUFFO29CQUNULE9BQU87aUJBQ1I7Z0JBRUQsY0FBSSxDQUNHLEdBQUcsU0FBSSxJQUFNLEVBQ2hCLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLEVBQzNCLFVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNO29CQUNuQixzQ0FBc0M7b0JBQ3RDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztvQkFDckMseURBQXlEO29CQUN6RCxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6Qix1RUFBdUU7b0JBQ3ZFLHVCQUF1QjtvQkFDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFO3dCQUNoQixPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3FCQUNuQztvQkFDRCw4REFBOEQ7b0JBQzlELE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLDZFQUE2RTtvQkFDN0UscUNBQXFDO29CQUNyQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxDQUFDLE1BQU0sRUFBUCxDQUFPLENBQUMsRUFBRTt3QkFDcEMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUNuQixPQUFPLEVBQUUsQ0FBQztxQkFDWDtnQkFDSCxDQUFDLENBQ0osQ0FBQztnQkFDRix1RUFBdUU7Z0JBQ3ZFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDekIsQ0FBQztZQUVELHlCQUF5QjtZQUN6QixXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkMsOEVBQThFO1lBQzlFLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBQyxDQUFDLEVBQUUsR0FBRyxJQUFLLE9BQUEsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEVBQXZCLENBQXVCLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUF2REQsc0NBdURDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Jhcn0gZnJvbSAnY2xpLXByb2dyZXNzJztcbmltcG9ydCB7Y3B1c30gZnJvbSAnb3MnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuY29uc3QgQVZBSUxBQkxFX1RIUkVBRFMgPSBNYXRoLm1heChjcHVzKCkubGVuZ3RoIC0gMSwgMSk7XG5cbnR5cGUgQ2FsbGJhY2tGdW5jdGlvbiA9IChmaWxlOiBzdHJpbmcsIGNvZGU/OiBudW1iZXIsIHN0ZG91dD86IHN0cmluZywgc3RkZXJyPzogc3RyaW5nKSA9PiB2b2lkO1xuXG4vKipcbiAqIFJ1biB0aGUgcHJvdmlkZWQgY29tbWFuZHMgaW4gcGFyYWxsZWwgZm9yIGVhY2ggcHJvdmlkZWQgZmlsZS5cbiAqXG4gKiBBIHByb21pc2UgaXMgcmV0dXJuZWQsIGNvbXBsZXRlZCB3aGVuIHRoZSBjb21tYW5kIGhhcyBjb21wbGV0ZWQgcnVubmluZyBmb3IgZWFjaCBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcnVuSW5QYXJhbGxlbChwcm92aWRlZEZpbGVzOiBzdHJpbmdbXSwgY21kOiBzdHJpbmcsIGNhbGxiYWNrOiBDYWxsYmFja0Z1bmN0aW9uKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuICAgIGlmIChwcm92aWRlZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICB9XG4gICAgLy8gVGhlIHByb2dyZXNzIGJhciBpbnN0YW5jZSB0byB1c2UgZm9yIHByb2dyZXNzIHRyYWNraW5nLlxuICAgIGNvbnN0IHByb2dyZXNzQmFyID1cbiAgICAgICAgbmV3IEJhcih7Zm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfSBmaWxlc2AsIGNsZWFyT25Db21wbGV0ZTogdHJ1ZX0pO1xuICAgIC8vIEEgbG9jYWwgY29weSBvZiB0aGUgZmlsZXMgdG8gcnVuIHRoZSBjb21tYW5kIG9uLlxuICAgIGNvbnN0IGZpbGVzID0gcHJvdmlkZWRGaWxlcy5zbGljZSgpO1xuICAgIC8vIEFuIGFycmF5IHRvIHJlcHJlc2VudCB0aGUgY3VycmVudCB1c2FnZSBzdGF0ZSBvZiBlYWNoIG9mIHRoZSB0aHJlYWRzIGZvciBwYXJhbGxlbGl6YXRpb24uXG4gICAgY29uc3QgdGhyZWFkcyA9IG5ldyBBcnJheTxib29sZWFuPihBVkFJTEFCTEVfVEhSRUFEUykuZmlsbChmYWxzZSk7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBydW4gdGhlIGNvbW1hbmQgb24gdGhlIG5leHQgYXZhaWxhYmxlIGZpbGUgZnJvbSB0aGUgbGlzdCB1c2luZyB0aGUgcHJvdmlkZWRcbiAgICAvLyB0aHJlYWQuXG4gICAgZnVuY3Rpb24gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZDogbnVtYmVyKSB7XG4gICAgICAvLyBHZXQgdGhlIG5leHQgZmlsZS5cbiAgICAgIGNvbnN0IGZpbGUgPSBmaWxlcy5wb3AoKTtcbiAgICAgIC8vIElmIG5vIGZpbGUgd2FzIHB1bGxlZCBmcm9tIHRoZSBhcnJheSwgcmV0dXJuIGFzIHRoZXJlIGFyZSBubyBtb3JlIGZpbGVzIHRvIHJ1biBhZ2FpbnN0LlxuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgZXhlYyhcbiAgICAgICAgICBgJHtjbWR9ICR7ZmlsZX1gLFxuICAgICAgICAgIHthc3luYzogdHJ1ZSwgc2lsZW50OiB0cnVlfSxcbiAgICAgICAgICAoY29kZSwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICAgIC8vIFJ1biB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAgICBjYWxsYmFjayhmaWxlLCBjb2RlLCBzdGRvdXQsIHN0ZGVycik7XG4gICAgICAgICAgICAvLyBOb3RlIGluIHRoZSBwcm9ncmVzcyBiYXIgYW5vdGhlciBmaWxlIGJlaW5nIGNvbXBsZXRlZC5cbiAgICAgICAgICAgIHByb2dyZXNzQmFyLmluY3JlbWVudCgxKTtcbiAgICAgICAgICAgIC8vIElmIG1vcmUgZmlsZXMgZXhpc3QgaW4gdGhlIGxpc3QsIHJ1biBhZ2FpbiB0byB3b3JrIG9uIHRoZSBuZXh0IGZpbGUsXG4gICAgICAgICAgICAvLyB1c2luZyB0aGUgc2FtZSBzbG90LlxuICAgICAgICAgICAgaWYgKGZpbGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICByZXR1cm4gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBJZiBub3QgbW9yZSBmaWxlcyBhcmUgYXZhaWxhYmxlLCBtYXJrIHRoZSB0aHJlYWQgYXMgdW51c2VkLlxuICAgICAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBJZiBhbGwgb2YgdGhlIHRocmVhZHMgYXJlIGZhbHNlLCBhcyB0aGV5IGFyZSB1bnVzZWQsIG1hcmsgdGhlIHByb2dyZXNzIGJhclxuICAgICAgICAgICAgLy8gY29tcGxldGVkIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgICAgaWYgKHRocmVhZHMuZXZlcnkoYWN0aXZlID0+ICFhY3RpdmUpKSB7XG4gICAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICApO1xuICAgICAgLy8gTWFyayB0aGUgdGhyZWFkIGFzIGluIHVzZSBhcyB0aGUgY29tbWFuZCBleGVjdXRpb24gaGFzIGJlZW4gc3RhcnRlZC5cbiAgICAgIHRocmVhZHNbdGhyZWFkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICAgIHByb2dyZXNzQmFyLnN0YXJ0KGZpbGVzLmxlbmd0aCwgMCk7XG4gICAgLy8gU3RhcnQgcnVubmluZyB0aGUgY29tbWFuZCBvbiBmaWxlcyBmcm9tIHRoZSBsZWFzdCBpbiBlYWNoIGF2YWlsYWJsZSB0aHJlYWQuXG4gICAgdGhyZWFkcy5mb3JFYWNoKChfLCBpZHgpID0+IHJ1bkNvbW1hbmRJblRocmVhZChpZHgpKTtcbiAgfSk7XG59XG4iXX0=