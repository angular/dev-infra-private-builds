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
const AVAILABLE_THREADS = Math.max(os_1.cpus().length - 1, 1);
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
        const formatters = index_1.getActiveFormatters();
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
                console_1.info(`Formatting ${pendingCommands.length} file(s)`);
                break;
            case 'check':
                console_1.info(`Checking format of ${pendingCommands.length} file(s)`);
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
            child_process_1.spawn(spawnCmd, spawnArgs, { suppressErrorOnFailingExitCode: true, mode: 'silent' }).then(({ stdout, stderr, status }) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0NBQWlDO0FBQ2pDLHlDQUF5QztBQUN6QywyQkFBd0I7QUFFeEIsMERBQTBEO0FBQzFELDhDQUFzQztBQUV0Qyw4Q0FBbUY7QUFFbkYsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQUksRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFVekQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxTQUFnQixzQkFBc0IsQ0FBQyxRQUFrQixFQUFFLE1BQXVCO0lBQ2hGLE9BQU8sSUFBSSxPQUFPLENBQTBCLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDdEQsTUFBTSxVQUFVLEdBQUcsMkJBQW1CLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sZUFBZSxHQUEyQyxFQUFFLENBQUM7UUFFbkUsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUU7WUFDbEMsZUFBZSxDQUFDLElBQUksQ0FDbEIsR0FBRyxVQUFVO2lCQUNWLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxFQUFFLFNBQVMsQ0FBQyxjQUFjLEVBQUUsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQztpQkFDbEUsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUMsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FDdEMsQ0FBQztTQUNIO1FBRUQsMkVBQTJFO1FBQzNFLHVDQUF1QztRQUN2QyxJQUFJLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ3ZCO1FBRUQsUUFBUSxNQUFNLEVBQUU7WUFDZCxLQUFLLFFBQVE7Z0JBQ1gsY0FBSSxDQUFDLGNBQWMsZUFBZSxDQUFDLE1BQU0sVUFBVSxDQUFDLENBQUM7Z0JBQ3JELE1BQU07WUFDUixLQUFLLE9BQU87Z0JBQ1YsY0FBSSxDQUFDLHNCQUFzQixlQUFlLENBQUMsTUFBTSxVQUFVLENBQUMsQ0FBQztnQkFDN0QsTUFBTTtZQUNSO2dCQUNFLE1BQU0sS0FBSyxDQUFDLDBCQUEwQixNQUFNLDZDQUE2QyxDQUFDLENBQUM7U0FDOUY7UUFFRCwwREFBMEQ7UUFDMUQsTUFBTSxXQUFXLEdBQUcsSUFBSSxrQkFBRyxDQUFDO1lBQzFCLE1BQU0sRUFBRSw2Q0FBNkM7WUFDckQsZUFBZSxFQUFFLElBQUk7U0FDdEIsQ0FBQyxDQUFDO1FBQ0gsbURBQW1EO1FBQ25ELDRGQUE0RjtRQUM1RixNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBVSxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUVsRSwwRkFBMEY7UUFDMUYsVUFBVTtRQUNWLFNBQVMsa0JBQWtCLENBQUMsTUFBYztZQUN4QyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDMUMsMEZBQTBGO1lBQzFGLElBQUksV0FBVyxLQUFLLFNBQVMsRUFBRTtnQkFDN0IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDeEIsT0FBTzthQUNSO1lBRUQsbURBQW1EO1lBQ25ELE1BQU0sRUFBQyxJQUFJLEVBQUUsU0FBUyxFQUFDLEdBQUcsV0FBVyxDQUFDO1lBRXRDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEYscUJBQUssQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLEVBQUMsOEJBQThCLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDLElBQUksQ0FDckYsQ0FBQyxFQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFjLEVBQUUsRUFBRTtnQkFDeEMsc0NBQXNDO2dCQUN0QyxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMzRSxJQUFJLE1BQU0sRUFBRTtvQkFDVixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQztpQkFDbEQ7Z0JBQ0QseURBQXlEO2dCQUN6RCxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6Qix1RUFBdUU7Z0JBQ3ZFLHVCQUF1QjtnQkFDdkIsSUFBSSxlQUFlLENBQUMsTUFBTSxFQUFFO29CQUMxQixPQUFPLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNuQztnQkFDRCw4REFBOEQ7Z0JBQzlELE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ3hCLDZFQUE2RTtnQkFDN0UscUNBQXFDO2dCQUNyQyxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3RDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDbkIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNuQjtZQUNILENBQUMsQ0FDRixDQUFDO1lBQ0YsdUVBQXVFO1lBQ3ZFLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDekIsQ0FBQztRQUVELHlCQUF5QjtRQUN6QixXQUFXLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDN0MsOEVBQThFO1FBQzlFLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQXZGRCx3REF1RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtCYXJ9IGZyb20gJ2NsaS1wcm9ncmVzcyc7XG5pbXBvcnQgKiBhcyBtdWx0aW1hdGNoIGZyb20gJ211bHRpbWF0Y2gnO1xuaW1wb3J0IHtjcHVzfSBmcm9tICdvcyc7XG5cbmltcG9ydCB7c3Bhd24sIFNwYXduUmVzdWx0fSBmcm9tICcuLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Rm9ybWF0dGVyLCBGb3JtYXR0ZXJBY3Rpb24sIGdldEFjdGl2ZUZvcm1hdHRlcnN9IGZyb20gJy4vZm9ybWF0dGVycy9pbmRleCc7XG5cbmNvbnN0IEFWQUlMQUJMRV9USFJFQURTID0gTWF0aC5tYXgoY3B1cygpLmxlbmd0aCAtIDEsIDEpO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBmYWlsdXJlIG9jY3VycmVkIGR1cmluZyBmb3JtYXR0aW5nIG9mIGEgZmlsZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRm9ybWF0RmFpbHVyZSB7XG4gIC8qKiBQYXRoIHRvIHRoZSBmaWxlIHRoYXQgZmFpbGVkLiAqL1xuICBmaWxlUGF0aDogc3RyaW5nO1xuICAvKiogRXJyb3IgbWVzc2FnZSByZXBvcnRlZCBieSB0aGUgZm9ybWF0dGVyLiAqL1xuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogUnVuIHRoZSBwcm92aWRlZCBjb21tYW5kcyBpbiBwYXJhbGxlbCBmb3IgZWFjaCBwcm92aWRlZCBmaWxlLlxuICpcbiAqIFJ1bm5pbmcgdGhlIGZvcm1hdHRlciBpcyBzcGxpdCBhY3Jvc3MgKG51bWJlciBvZiBhdmFpbGFibGUgY3B1IHRocmVhZHMgLSAxKSBwcm9jZXNzZXNzLlxuICogVGhlIHRhc2sgaXMgZG9uZSBpbiBtdWx0aXBsZSBwcm9jZXNzZXNzIHRvIHNwZWVkIHVwIHRoZSBvdmVyYWxsIHRpbWUgb2YgdGhlIHRhc2ssIGFzIHJ1bm5pbmdcbiAqIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2UgYW1vdW50IG9mIHRpbWUuXG4gKiBBcyBhIGRhdGEgcG9pbnQgZm9yIGlsbHVzdHJhdGlvbiwgdXNpbmcgOCBwcm9jZXNzIHJhdGhlciB0aGFuIDEgY3V0IHRoZSBleGVjdXRpb25cbiAqIHRpbWUgZnJvbSAyNzYgc2Vjb25kcyB0byAzOSBzZWNvbmRzIGZvciB0aGUgc2FtZSAyNzAwIGZpbGVzLlxuICpcbiAqIEEgcHJvbWlzZSBpcyByZXR1cm5lZCwgY29tcGxldGVkIHdoZW4gdGhlIGNvbW1hbmQgaGFzIGNvbXBsZXRlZCBydW5uaW5nIGZvciBlYWNoIGZpbGUuXG4gKiBUaGUgcHJvbWlzZSByZXNvbHZlcyB3aXRoIGEgbGlzdCBvZiBmYWlsdXJlcywgb3IgYGZhbHNlYCBpZiBubyBmb3JtYXR0ZXJzIGhhdmUgbWF0Y2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoYWxsRmlsZXM6IHN0cmluZ1tdLCBhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICByZXR1cm4gbmV3IFByb21pc2U8ZmFsc2UgfCBGb3JtYXRGYWlsdXJlW10+KChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVycyA9IGdldEFjdGl2ZUZvcm1hdHRlcnMoKTtcbiAgICBjb25zdCBmYWlsdXJlczogRm9ybWF0RmFpbHVyZVtdID0gW107XG4gICAgY29uc3QgcGVuZGluZ0NvbW1hbmRzOiB7Zm9ybWF0dGVyOiBGb3JtYXR0ZXI7IGZpbGU6IHN0cmluZ31bXSA9IFtdO1xuXG4gICAgZm9yIChjb25zdCBmb3JtYXR0ZXIgb2YgZm9ybWF0dGVycykge1xuICAgICAgcGVuZGluZ0NvbW1hbmRzLnB1c2goXG4gICAgICAgIC4uLm11bHRpbWF0Y2hcbiAgICAgICAgICAuY2FsbCh1bmRlZmluZWQsIGFsbEZpbGVzLCBmb3JtYXR0ZXIuZ2V0RmlsZU1hdGNoZXIoKSwge2RvdDogdHJ1ZX0pXG4gICAgICAgICAgLm1hcCgoZmlsZSkgPT4gKHtmb3JtYXR0ZXIsIGZpbGV9KSksXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIElmIG5vIGNvbW1hbmRzIGFyZSBnZW5lcmF0ZWQsIHJlc29sdmUgdGhlIHByb21pc2UgYXMgYGZhbHNlYCBhcyBubyBmaWxlc1xuICAgIC8vIHdlcmUgcnVuIGFnYWluc3QgdGhlIGFueSBmb3JtYXR0ZXJzLlxuICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAgIGluZm8oYEZvcm1hdHRpbmcgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICBpbmZvKGBDaGVja2luZyBmb3JtYXQgb2YgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZm9ybWF0IGFjdGlvbiBcIiR7YWN0aW9ufVwiOiBhbGxvd2VkIGFjdGlvbnMgYXJlIFwiZm9ybWF0XCIgYW5kIFwiY2hlY2tcImApO1xuICAgIH1cblxuICAgIC8vIFRoZSBwcm9ncmVzcyBiYXIgaW5zdGFuY2UgdG8gdXNlIGZvciBwcm9ncmVzcyB0cmFja2luZy5cbiAgICBjb25zdCBwcm9ncmVzc0JhciA9IG5ldyBCYXIoe1xuICAgICAgZm9ybWF0OiBgW3tiYXJ9XSBFVEE6IHtldGF9cyB8IHt2YWx1ZX0ve3RvdGFsfSBmaWxlc2AsXG4gICAgICBjbGVhck9uQ29tcGxldGU6IHRydWUsXG4gICAgfSk7XG4gICAgLy8gQSBsb2NhbCBjb3B5IG9mIHRoZSBmaWxlcyB0byBydW4gdGhlIGNvbW1hbmQgb24uXG4gICAgLy8gQW4gYXJyYXkgdG8gcmVwcmVzZW50IHRoZSBjdXJyZW50IHVzYWdlIHN0YXRlIG9mIGVhY2ggb2YgdGhlIHRocmVhZHMgZm9yIHBhcmFsbGVsaXphdGlvbi5cbiAgICBjb25zdCB0aHJlYWRzID0gbmV3IEFycmF5PGJvb2xlYW4+KEFWQUlMQUJMRV9USFJFQURTKS5maWxsKGZhbHNlKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IHJ1biB0aGUgY29tbWFuZCBvbiB0aGUgbmV4dCBhdmFpbGFibGUgZmlsZSBmcm9tIHRoZSBsaXN0IHVzaW5nIHRoZSBwcm92aWRlZFxuICAgIC8vIHRocmVhZC5cbiAgICBmdW5jdGlvbiBydW5Db21tYW5kSW5UaHJlYWQodGhyZWFkOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IG5leHRDb21tYW5kID0gcGVuZGluZ0NvbW1hbmRzLnBvcCgpO1xuICAgICAgLy8gSWYgbm8gZmlsZSB3YXMgcHVsbGVkIGZyb20gdGhlIGFycmF5LCByZXR1cm4gYXMgdGhlcmUgYXJlIG5vIG1vcmUgZmlsZXMgdG8gcnVuIGFnYWluc3QuXG4gICAgICBpZiAobmV4dENvbW1hbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJlYWRzW3RocmVhZF0gPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIGZpbGUgYW5kIGZvcm1hdHRlciBmb3IgdGhlIG5leHQgY29tbWFuZC5cbiAgICAgIGNvbnN0IHtmaWxlLCBmb3JtYXR0ZXJ9ID0gbmV4dENvbW1hbmQ7XG5cbiAgICAgIGNvbnN0IFtzcGF3bkNtZCwgLi4uc3Bhd25BcmdzXSA9IFsuLi5mb3JtYXR0ZXIuY29tbWFuZEZvcihhY3Rpb24pLnNwbGl0KCcgJyksIGZpbGVdO1xuICAgICAgc3Bhd24oc3Bhd25DbWQsIHNwYXduQXJncywge3N1cHByZXNzRXJyb3JPbkZhaWxpbmdFeGl0Q29kZTogdHJ1ZSwgbW9kZTogJ3NpbGVudCd9KS50aGVuKFxuICAgICAgICAoe3N0ZG91dCwgc3RkZXJyLCBzdGF0dXN9OiBTcGF3blJlc3VsdCkgPT4ge1xuICAgICAgICAgIC8vIFJ1biB0aGUgcHJvdmlkZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICAgICAgY29uc3QgZmFpbGVkID0gZm9ybWF0dGVyLmNhbGxiYWNrRm9yKGFjdGlvbikoZmlsZSwgc3RhdHVzLCBzdGRvdXQsIHN0ZGVycik7XG4gICAgICAgICAgaWYgKGZhaWxlZCkge1xuICAgICAgICAgICAgZmFpbHVyZXMucHVzaCh7ZmlsZVBhdGg6IGZpbGUsIG1lc3NhZ2U6IHN0ZGVycn0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBOb3RlIGluIHRoZSBwcm9ncmVzcyBiYXIgYW5vdGhlciBmaWxlIGJlaW5nIGNvbXBsZXRlZC5cbiAgICAgICAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gICAgICAgICAgLy8gSWYgbW9yZSBmaWxlcyBleGlzdCBpbiB0aGUgbGlzdCwgcnVuIGFnYWluIHRvIHdvcmsgb24gdGhlIG5leHQgZmlsZSxcbiAgICAgICAgICAvLyB1c2luZyB0aGUgc2FtZSBzbG90LlxuICAgICAgICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gcnVuQ29tbWFuZEluVGhyZWFkKHRocmVhZCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIElmIG5vdCBtb3JlIGZpbGVzIGFyZSBhdmFpbGFibGUsIG1hcmsgdGhlIHRocmVhZCBhcyB1bnVzZWQuXG4gICAgICAgICAgdGhyZWFkc1t0aHJlYWRdID0gZmFsc2U7XG4gICAgICAgICAgLy8gSWYgYWxsIG9mIHRoZSB0aHJlYWRzIGFyZSBmYWxzZSwgYXMgdGhleSBhcmUgdW51c2VkLCBtYXJrIHRoZSBwcm9ncmVzcyBiYXJcbiAgICAgICAgICAvLyBjb21wbGV0ZWQgYW5kIHJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgaWYgKHRocmVhZHMuZXZlcnkoKGFjdGl2ZSkgPT4gIWFjdGl2ZSkpIHtcbiAgICAgICAgICAgIHByb2dyZXNzQmFyLnN0b3AoKTtcbiAgICAgICAgICAgIHJlc29sdmUoZmFpbHVyZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgICAvLyBNYXJrIHRoZSB0aHJlYWQgYXMgaW4gdXNlIGFzIHRoZSBjb21tYW5kIGV4ZWN1dGlvbiBoYXMgYmVlbiBzdGFydGVkLlxuICAgICAgdGhyZWFkc1t0aHJlYWRdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgcHJvZ3Jlc3NCYXIuc3RhcnQocGVuZGluZ0NvbW1hbmRzLmxlbmd0aCwgMCk7XG4gICAgLy8gU3RhcnQgcnVubmluZyB0aGUgY29tbWFuZCBvbiBmaWxlcyBmcm9tIHRoZSBsZWFzdCBpbiBlYWNoIGF2YWlsYWJsZSB0aHJlYWQuXG4gICAgdGhyZWFkcy5mb3JFYWNoKChfLCBpZHgpID0+IHJ1bkNvbW1hbmRJblRocmVhZChpZHgpKTtcbiAgfSk7XG59XG4iXX0=