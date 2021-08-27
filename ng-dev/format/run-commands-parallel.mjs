"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFormatterInParallel = void 0;
const cli_progress_1 = require("cli-progress");
const multimatch = require("multimatch");
const os_1 = require("os");
const child_process_1 = require("../utils/child-process");
const console_1 = require("../utils/console");
const index_1 = require("./formatters/index");
const AVAILABLE_THREADS = Math.max((0, os_1.cpus)().length - 1, 1);
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
    return new Promise((resolve) => {
        const formatters = (0, index_1.getActiveFormatters)();
        const failures = [];
        const pendingCommands = [];
        for (const formatter of formatters) {
            pendingCommands.push(...multimatch
                .call(undefined, allFiles, formatter.getFileMatcher(), { dot: true })
                .map((file) => ({ formatter, file })));
        }
        // If no commands are generated, resolve the promise as `false` as no files
        // were run against the any formatters.
        if (pendingCommands.length === 0) {
            return resolve(false);
        }
        switch (action) {
            case 'format':
                (0, console_1.info)(`Formatting ${pendingCommands.length} file(s)`);
                break;
            case 'check':
                (0, console_1.info)(`Checking format of ${pendingCommands.length} file(s)`);
                break;
            default:
                throw Error(`Invalid format action "${action}": allowed actions are "format" and "check"`);
        }
        // The progress bar instance to use for progress tracking.
        const progressBar = new cli_progress_1.Bar({
            format: `[{bar}] ETA: {eta}s | {value}/{total} files`,
            clearOnComplete: true,
        });
        // A local copy of the files to run the command on.
        // An array to represent the current usage state of each of the threads for parallelization.
        const threads = new Array(AVAILABLE_THREADS).fill(false);
        // Recursively run the command on the next available file from the list using the provided
        // thread.
        function runCommandInThread(thread) {
            const nextCommand = pendingCommands.pop();
            // If no file was pulled from the array, return as there are no more files to run against.
            if (nextCommand === undefined) {
                threads[thread] = false;
                return;
            }
            // Get the file and formatter for the next command.
            const { file, formatter } = nextCommand;
            const [spawnCmd, ...spawnArgs] = [...formatter.commandFor(action).split(' '), file];
            (0, child_process_1.spawn)(spawnCmd, spawnArgs, { suppressErrorOnFailingExitCode: true, mode: 'silent' }).then(({ stdout, stderr, status }) => {
                // Run the provided callback function.
                const failed = formatter.callbackFor(action)(file, status, stdout, stderr);
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
                if (threads.every((active) => !active)) {
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
        threads.forEach((_, idx) => runCommandInThread(idx));
    });
}
exports.runFormatterInParallel = runFormatterInParallel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQWlDO0FBQ2pDLHlDQUF5QztBQUN6QywyQkFBd0I7QUFFeEIsMERBQTBEO0FBQzFELDhDQUFzQztBQUV0Qyw4Q0FBbUY7QUFFbkYsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUEsU0FBSSxHQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQVV6RDs7Ozs7Ozs7Ozs7R0FXRztBQUNILFNBQWdCLHNCQUFzQixDQUFDLFFBQWtCLEVBQUUsTUFBdUI7SUFDaEYsT0FBTyxJQUFJLE9BQU8sQ0FBMEIsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUN0RCxNQUFNLFVBQVUsR0FBRyxJQUFBLDJCQUFtQixHQUFFLENBQUM7UUFDekMsTUFBTSxRQUFRLEdBQW9CLEVBQUUsQ0FBQztRQUNyQyxNQUFNLGVBQWUsR0FBMkMsRUFBRSxDQUFDO1FBRW5FLEtBQUssTUFBTSxTQUFTLElBQUksVUFBVSxFQUFFO1lBQ2xDLGVBQWUsQ0FBQyxJQUFJLENBQ2xCLEdBQUcsVUFBVTtpQkFDVixJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQ2xFLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQ3RDLENBQUM7U0FDSDtRQUVELDJFQUEyRTtRQUMzRSx1Q0FBdUM7UUFDdkMsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQyxPQUFP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TSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdDLDhFQUE4RTtRQUM5RSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDLENBQUMsQ0FBQztBQUNMLENBQUM7QUF2RkQsd0RBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0ICogYXMgbXVsdGltYXRjaCBmcm9tICdtdWx0aW1hdGNoJztcbmltcG9ydCB7Y3B1c30gZnJvbSAnb3MnO1xuXG5pbXBvcnQge3NwYXduLCBTcGF3blJlc3VsdH0gZnJvbSAnLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0Zvcm1hdHRlciwgRm9ybWF0dGVyQWN0aW9uLCBnZXRBY3RpdmVGb3JtYXR0ZXJzfSBmcm9tICcuL2Zvcm1hdHRlcnMvaW5kZXgnO1xuXG5jb25zdCBBVkFJTEFCTEVfVEhSRUFEUyA9IE1hdGgubWF4KGNwdXMoKS5sZW5ndGggLSAxLCAxKTtcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgZmFpbHVyZSBvY2N1cnJlZCBkdXJpbmcgZm9ybWF0dGluZyBvZiBhIGZpbGUuICovXG5leHBvcnQgaW50ZXJmYWNlIEZvcm1hdEZhaWx1cmUge1xuICAvKiogUGF0aCB0byB0aGUgZmlsZSB0aGF0IGZhaWxlZC4gKi9cbiAgZmlsZVBhdGg6IHN0cmluZztcbiAgLyoqIEVycm9yIG1lc3NhZ2UgcmVwb3J0ZWQgYnkgdGhlIGZvcm1hdHRlci4gKi9cbiAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJ1biB0aGUgcHJvdmlkZWQgY29tbWFuZHMgaW4gcGFyYWxsZWwgZm9yIGVhY2ggcHJvdmlkZWQgZmlsZS5cbiAqXG4gKiBSdW5uaW5nIHRoZSBmb3JtYXR0ZXIgaXMgc3BsaXQgYWNyb3NzIChudW1iZXIgb2YgYXZhaWxhYmxlIGNwdSB0aHJlYWRzIC0gMSkgcHJvY2Vzc2Vzcy5cbiAqIFRoZSB0YXNrIGlzIGRvbmUgaW4gbXVsdGlwbGUgcHJvY2Vzc2VzcyB0byBzcGVlZCB1cCB0aGUgb3ZlcmFsbCB0aW1lIG9mIHRoZSB0YXNrLCBhcyBydW5uaW5nXG4gKiBhY3Jvc3MgZW50aXJlIHJlcG9zaXRvcmllcyB0YWtlcyBhIGxhcmdlIGFtb3VudCBvZiB0aW1lLlxuICogQXMgYSBkYXRhIHBvaW50IGZvciBpbGx1c3RyYXRpb24sIHVzaW5nIDggcHJvY2VzcyByYXRoZXIgdGhhbiAxIGN1dCB0aGUgZXhlY3V0aW9uXG4gKiB0aW1lIGZyb20gMjc2IHNlY29uZHMgdG8gMzkgc2Vjb25kcyBmb3IgdGhlIHNhbWUgMjcwMCBmaWxlcy5cbiAqXG4gKiBBIHByb21pc2UgaXMgcmV0dXJuZWQsIGNvbXBsZXRlZCB3aGVuIHRoZSBjb21tYW5kIGhhcyBjb21wbGV0ZWQgcnVubmluZyBmb3IgZWFjaCBmaWxlLlxuICogVGhlIHByb21pc2UgcmVzb2x2ZXMgd2l0aCBhIGxpc3Qgb2YgZmFpbHVyZXMsIG9yIGBmYWxzZWAgaWYgbm8gZm9ybWF0dGVycyBoYXZlIG1hdGNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGFsbEZpbGVzOiBzdHJpbmdbXSwgYWN0aW9uOiBGb3JtYXR0ZXJBY3Rpb24pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGZhbHNlIHwgRm9ybWF0RmFpbHVyZVtdPigocmVzb2x2ZSkgPT4ge1xuICAgIGNvbnN0IGZvcm1hdHRlcnMgPSBnZXRBY3RpdmVGb3JtYXR0ZXJzKCk7XG4gICAgY29uc3QgZmFpbHVyZXM6IEZvcm1hdEZhaWx1cmVbXSA9IFtdO1xuICAgIGNvbnN0IHBlbmRpbmdDb21tYW5kczoge2Zvcm1hdHRlcjogRm9ybWF0dGVyOyBmaWxlOiBzdHJpbmd9W10gPSBbXTtcblxuICAgIGZvciAoY29uc3QgZm9ybWF0dGVyIG9mIGZvcm1hdHRlcnMpIHtcbiAgICAgIHBlbmRpbmdDb21tYW5kcy5wdXNoKFxuICAgICAgICAuLi5tdWx0aW1hdGNoXG4gICAgICAgICAgLmNhbGwodW5kZWZpbmVkLCBhbGxGaWxlcywgZm9ybWF0dGVyLmdldEZpbGVNYXRjaGVyKCksIHtkb3Q6IHRydWV9KVxuICAgICAgICAgIC5tYXAoKGZpbGUpID0+ICh7Zm9ybWF0dGVyLCBmaWxlfSkpLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBJZiBubyBjb21tYW5kcyBhcmUgZ2VuZXJhdGVkLCByZXNvbHZlIHRoZSBwcm9taXNlIGFzIGBmYWxzZWAgYXMgbm8gZmlsZXNcbiAgICAvLyB3ZXJlIHJ1biBhZ2FpbnN0IHRoZSBhbnkgZm9ybWF0dGVycy5cbiAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHJlc29sdmUoZmFsc2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoYWN0aW9uKSB7XG4gICAgICBjYXNlICdmb3JtYXQnOlxuICAgICAgICBpbmZvKGBGb3JtYXR0aW5nICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NoZWNrJzpcbiAgICAgICAgaW5mbyhgQ2hlY2tpbmcgZm9ybWF0IG9mICR7cGVuZGluZ0NvbW1hbmRzLmxlbmd0aH0gZmlsZShzKWApO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IEVycm9yKGBJbnZhbGlkIGZvcm1hdCBhY3Rpb24gXCIke2FjdGlvbn1cIjogYWxsb3dlZCBhY3Rpb25zIGFyZSBcImZvcm1hdFwiIGFuZCBcImNoZWNrXCJgKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgcHJvZ3Jlc3MgYmFyIGluc3RhbmNlIHRvIHVzZSBmb3IgcHJvZ3Jlc3MgdHJhY2tpbmcuXG4gICAgY29uc3QgcHJvZ3Jlc3NCYXIgPSBuZXcgQmFyKHtcbiAgICAgIGZvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH0gZmlsZXNgLFxuICAgICAgY2xlYXJPbkNvbXBsZXRlOiB0cnVlLFxuICAgIH0pO1xuICAgIC8vIEEgbG9jYWwgY29weSBvZiB0aGUgZmlsZXMgdG8gcnVuIHRoZSBjb21tYW5kIG9uLlxuICAgIC8vIEFuIGFycmF5IHRvIHJlcHJlc2VudCB0aGUgY3VycmVudCB1c2FnZSBzdGF0ZSBvZiBlYWNoIG9mIHRoZSB0aHJlYWRzIGZvciBwYXJhbGxlbGl6YXRpb24uXG4gICAgY29uc3QgdGhyZWFkcyA9IG5ldyBBcnJheTxib29sZWFuPihBVkFJTEFCTEVfVEhSRUFEUykuZmlsbChmYWxzZSk7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBydW4gdGhlIGNvbW1hbmQgb24gdGhlIG5leHQgYXZhaWxhYmxlIGZpbGUgZnJvbSB0aGUgbGlzdCB1c2luZyB0aGUgcHJvdmlkZWRcbiAgICAvLyB0aHJlYWQuXG4gICAgZnVuY3Rpb24gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZDogbnVtYmVyKSB7XG4gICAgICBjb25zdCBuZXh0Q29tbWFuZCA9IHBlbmRpbmdDb21tYW5kcy5wb3AoKTtcbiAgICAgIC8vIElmIG5vIGZpbGUgd2FzIHB1bGxlZCBmcm9tIHRoZSBhcnJheSwgcmV0dXJuIGFzIHRoZXJlIGFyZSBubyBtb3JlIGZpbGVzIHRvIHJ1biBhZ2FpbnN0LlxuICAgICAgaWYgKG5leHRDb21tYW5kID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBmaWxlIGFuZCBmb3JtYXR0ZXIgZm9yIHRoZSBuZXh0IGNvbW1hbmQuXG4gICAgICBjb25zdCB7ZmlsZSwgZm9ybWF0dGVyfSA9IG5leHRDb21tYW5kO1xuXG4gICAgICBjb25zdCBbc3Bhd25DbWQsIC4uLnNwYXduQXJnc10gPSBbLi4uZm9ybWF0dGVyLmNvbW1hbmRGb3IoYWN0aW9uKS5zcGxpdCgnICcpLCBmaWxlXTtcbiAgICAgIHNwYXduKHNwYXduQ21kLCBzcGF3bkFyZ3MsIHtzdXBwcmVzc0Vycm9yT25GYWlsaW5nRXhpdENvZGU6IHRydWUsIG1vZGU6ICdzaWxlbnQnfSkudGhlbihcbiAgICAgICAgKHtzdGRvdXQsIHN0ZGVyciwgc3RhdHVzfTogU3Bhd25SZXN1bHQpID0+IHtcbiAgICAgICAgICAvLyBSdW4gdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgIGNvbnN0IGZhaWxlZCA9IGZvcm1hdHRlci5jYWxsYmFja0ZvcihhY3Rpb24pKGZpbGUsIHN0YXR1cywgc3Rkb3V0LCBzdGRlcnIpO1xuICAgICAgICAgIGlmIChmYWlsZWQpIHtcbiAgICAgICAgICAgIGZhaWx1cmVzLnB1c2goe2ZpbGVQYXRoOiBmaWxlLCBtZXNzYWdlOiBzdGRlcnJ9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90ZSBpbiB0aGUgcHJvZ3Jlc3MgYmFyIGFub3RoZXIgZmlsZSBiZWluZyBjb21wbGV0ZWQuXG4gICAgICAgICAgcHJvZ3Jlc3NCYXIuaW5jcmVtZW50KDEpO1xuICAgICAgICAgIC8vIElmIG1vcmUgZmlsZXMgZXhpc3QgaW4gdGhlIGxpc3QsIHJ1biBhZ2FpbiB0byB3b3JrIG9uIHRoZSBuZXh0IGZpbGUsXG4gICAgICAgICAgLy8gdXNpbmcgdGhlIHNhbWUgc2xvdC5cbiAgICAgICAgICBpZiAocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBJZiBub3QgbW9yZSBmaWxlcyBhcmUgYXZhaWxhYmxlLCBtYXJrIHRoZSB0aHJlYWQgYXMgdW51c2VkLlxuICAgICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICAgIC8vIElmIGFsbCBvZiB0aGUgdGhyZWFkcyBhcmUgZmFsc2UsIGFzIHRoZXkgYXJlIHVudXNlZCwgbWFyayB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgICAgICAgLy8gY29tcGxldGVkIGFuZCByZXNvbHZlIHRoZSBwcm9taXNlLlxuICAgICAgICAgIGlmICh0aHJlYWRzLmV2ZXJ5KChhY3RpdmUpID0+ICFhY3RpdmUpKSB7XG4gICAgICAgICAgICBwcm9ncmVzc0Jhci5zdG9wKCk7XG4gICAgICAgICAgICByZXNvbHZlKGZhaWx1cmVzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICApO1xuICAgICAgLy8gTWFyayB0aGUgdGhyZWFkIGFzIGluIHVzZSBhcyB0aGUgY29tbWFuZCBleGVjdXRpb24gaGFzIGJlZW4gc3RhcnRlZC5cbiAgICAgIHRocmVhZHNbdGhyZWFkXSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gU3RhcnQgdGhlIHByb2dyZXNzIGJhclxuICAgIHByb2dyZXNzQmFyLnN0YXJ0KHBlbmRpbmdDb21tYW5kcy5sZW5ndGgsIDApO1xuICAgIC8vIFN0YXJ0IHJ1bm5pbmcgdGhlIGNvbW1hbmQgb24gZmlsZXMgZnJvbSB0aGUgbGVhc3QgaW4gZWFjaCBhdmFpbGFibGUgdGhyZWFkLlxuICAgIHRocmVhZHMuZm9yRWFjaCgoXywgaWR4KSA9PiBydW5Db21tYW5kSW5UaHJlYWQoaWR4KSk7XG4gIH0pO1xufVxuIl19