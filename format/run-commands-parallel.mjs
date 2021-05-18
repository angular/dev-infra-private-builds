/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Bar } from 'cli-progress';
import * as multimatch from 'multimatch';
import { cpus } from 'os';
import { exec } from 'shelljs';
import { info } from '../utils/console';
import { getActiveFormatters } from './formatters/index';
const AVAILABLE_THREADS = Math.max(cpus().length - 1, 1);
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
export function runFormatterInParallel(allFiles, action) {
    return new Promise((resolve) => {
        const formatters = getActiveFormatters();
        const failures = [];
        const pendingCommands = [];
        for (const formatter of formatters) {
            pendingCommands.push(...multimatch.call(undefined, allFiles, formatter.getFileMatcher(), { dot: true })
                .map(file => ({ formatter, file })));
        }
        // If no commands are generated, resolve the promise as `false` as no files
        // were run against the any formatters.
        if (pendingCommands.length === 0) {
            return resolve(false);
        }
        switch (action) {
            case 'format':
                info(`Formatting ${pendingCommands.length} file(s)`);
                break;
            case 'check':
                info(`Checking format of ${pendingCommands.length} file(s)`);
                break;
            default:
                throw Error(`Invalid format action "${action}": allowed actions are "format" and "check"`);
        }
        // The progress bar instance to use for progress tracking.
        const progressBar = new Bar({ format: `[{bar}] ETA: {eta}s | {value}/{total} files`, clearOnComplete: true });
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
            exec(`${formatter.commandFor(action)} ${file}`, { async: true, silent: true }, (code, stdout, stderr) => {
                // Run the provided callback function.
                const failed = formatter.callbackFor(action)(file, code, stdout, stderr);
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
                if (threads.every(active => !active)) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVuLWNvbW1hbmRzLXBhcmFsbGVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9ydW4tY29tbWFuZHMtcGFyYWxsZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEdBQUcsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUNqQyxPQUFPLEtBQUssVUFBVSxNQUFNLFlBQVksQ0FBQztBQUN6QyxPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ3hCLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFFN0IsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXRDLE9BQU8sRUFBNkIsbUJBQW1CLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUVuRixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUV6RDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxRQUFrQixFQUFFLE1BQXVCO0lBQ2hGLE9BQU8sSUFBSSxPQUFPLENBQWlCLENBQUMsT0FBTyxFQUFFLEVBQUU7UUFDN0MsTUFBTSxVQUFVLEdBQUcsbUJBQW1CLEVBQUUsQ0FBQztRQUN6QyxNQUFNLFFBQVEsR0FBYSxFQUFFLENBQUM7UUFDOUIsTUFBTSxlQUFlLEdBQTJDLEVBQUUsQ0FBQztRQUVuRSxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRTtZQUNsQyxlQUFlLENBQUMsSUFBSSxDQUNoQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUMsY0FBYyxFQUFFLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7aUJBQzNFLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBQyxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDNUM7UUFFRCwyRUFBMkU7UUFDM0UsdUNBQXVDO1FBQ3ZDLElBQUksZUFBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDaEMsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkI7UUFFRCxRQUFRLE1BQU0sRUFBRTtZQUNkLEtBQUssUUFBUTtnQkFDWCxJQUFJLENBQUMsY0FBYyxlQUFlLENBQUMsTUFBTSxVQUFVLENBQUMsQ0FBQztnQkFDckQsTUFBTTtZQUNSLEtBQUssT0FBTztnQkFDVixJQUFJLENBQUMsc0JBQXNCLGVBQWUsQ0FBQyxNQUFNLFVBQVUsQ0FBQyxDQUFDO2dCQUM3RCxNQUFNO1lBQ1I7Z0JBQ0UsTUFBTSxLQUFLLENBQUMsMEJBQTBCLE1BQU0sNkNBQTZDLENBQUMsQ0FBQztTQUM5RjtRQUVELDBEQUEwRDtRQUMxRCxNQUFNLFdBQVcsR0FDYixJQUFJLEdBQUcsQ0FBQyxFQUFDLE1BQU0sRUFBRSw2Q0FBNkMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUM1RixtREFBbUQ7UUFDbkQsNEZBQTRGO1FBQzVGLE1BQU0sT0FBTyxHQUFHLElBQUksS0FBSyxDQUFVLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRWxFLDBGQUEwRjtRQUMxRixVQUFVO1FBQ1YsU0FBUyxrQkFBa0IsQ0FBQyxNQUFjO1lBQ3hDLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMxQywwRkFBMEY7WUFDMUYsSUFBSSxXQUFXLEtBQUssU0FBUyxFQUFFO2dCQUM3QixPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUN4QixPQUFPO2FBQ1I7WUFFRCxtREFBbUQ7WUFDbkQsTUFBTSxFQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsR0FBRyxXQUFXLENBQUM7WUFFdEMsSUFBSSxDQUNBLEdBQUcsU0FBUyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLEVBQUUsRUFDekMsRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsRUFDM0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUN2QixzQ0FBc0M7Z0JBQ3RDLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3pFLElBQUksTUFBTSxFQUFFO29CQUNWLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JCO2dCQUNELHlEQUF5RDtnQkFDekQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekIsdUVBQXVFO2dCQUN2RSx1QkFBdUI7Z0JBQ3ZCLElBQUksZUFBZSxDQUFDLE1BQU0sRUFBRTtvQkFDMUIsT0FBTyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztpQkFDbkM7Z0JBQ0QsOERBQThEO2dCQUM5RCxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUN4Qiw2RUFBNkU7Z0JBQzdFLHFDQUFxQztnQkFDckMsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtvQkFDcEMsV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNuQixPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ25CO1lBQ0gsQ0FBQyxDQUNKLENBQUM7WUFDRix1RUFBdUU7WUFDdkUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QixDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLFdBQVcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3Qyw4RUFBOEU7UUFDOUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkQsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QmFyfSBmcm9tICdjbGktcHJvZ3Jlc3MnO1xuaW1wb3J0ICogYXMgbXVsdGltYXRjaCBmcm9tICdtdWx0aW1hdGNoJztcbmltcG9ydCB7Y3B1c30gZnJvbSAnb3MnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtGb3JtYXR0ZXIsIEZvcm1hdHRlckFjdGlvbiwgZ2V0QWN0aXZlRm9ybWF0dGVyc30gZnJvbSAnLi9mb3JtYXR0ZXJzL2luZGV4JztcblxuY29uc3QgQVZBSUxBQkxFX1RIUkVBRFMgPSBNYXRoLm1heChjcHVzKCkubGVuZ3RoIC0gMSwgMSk7XG5cbi8qKlxuICogUnVuIHRoZSBwcm92aWRlZCBjb21tYW5kcyBpbiBwYXJhbGxlbCBmb3IgZWFjaCBwcm92aWRlZCBmaWxlLlxuICpcbiAqIFJ1bm5pbmcgdGhlIGZvcm1hdHRlciBpcyBzcGxpdCBhY3Jvc3MgKG51bWJlciBvZiBhdmFpbGFibGUgY3B1IHRocmVhZHMgLSAxKSBwcm9jZXNzZXNzLlxuICogVGhlIHRhc2sgaXMgZG9uZSBpbiBtdWx0aXBsZSBwcm9jZXNzZXNzIHRvIHNwZWVkIHVwIHRoZSBvdmVyYWxsIHRpbWUgb2YgdGhlIHRhc2ssIGFzIHJ1bm5pbmdcbiAqIGFjcm9zcyBlbnRpcmUgcmVwb3NpdG9yaWVzIHRha2VzIGEgbGFyZ2UgYW1vdW50IG9mIHRpbWUuXG4gKiBBcyBhIGRhdGEgcG9pbnQgZm9yIGlsbHVzdHJhdGlvbiwgdXNpbmcgOCBwcm9jZXNzIHJhdGhlciB0aGFuIDEgY3V0IHRoZSBleGVjdXRpb25cbiAqIHRpbWUgZnJvbSAyNzYgc2Vjb25kcyB0byAzOSBzZWNvbmRzIGZvciB0aGUgc2FtZSAyNzAwIGZpbGVzLlxuICpcbiAqIEEgcHJvbWlzZSBpcyByZXR1cm5lZCwgY29tcGxldGVkIHdoZW4gdGhlIGNvbW1hbmQgaGFzIGNvbXBsZXRlZCBydW5uaW5nIGZvciBlYWNoIGZpbGUuXG4gKiBUaGUgcHJvbWlzZSByZXNvbHZlcyB3aXRoIGEgbGlzdCBvZiBmYWlsdXJlcywgb3IgYGZhbHNlYCBpZiBubyBmb3JtYXR0ZXJzIGhhdmUgbWF0Y2hlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoYWxsRmlsZXM6IHN0cmluZ1tdLCBhY3Rpb246IEZvcm1hdHRlckFjdGlvbikge1xuICByZXR1cm4gbmV3IFByb21pc2U8ZmFsc2V8c3RyaW5nW10+KChyZXNvbHZlKSA9PiB7XG4gICAgY29uc3QgZm9ybWF0dGVycyA9IGdldEFjdGl2ZUZvcm1hdHRlcnMoKTtcbiAgICBjb25zdCBmYWlsdXJlczogc3RyaW5nW10gPSBbXTtcbiAgICBjb25zdCBwZW5kaW5nQ29tbWFuZHM6IHtmb3JtYXR0ZXI6IEZvcm1hdHRlciwgZmlsZTogc3RyaW5nfVtdID0gW107XG5cbiAgICBmb3IgKGNvbnN0IGZvcm1hdHRlciBvZiBmb3JtYXR0ZXJzKSB7XG4gICAgICBwZW5kaW5nQ29tbWFuZHMucHVzaChcbiAgICAgICAgICAuLi5tdWx0aW1hdGNoLmNhbGwodW5kZWZpbmVkLCBhbGxGaWxlcywgZm9ybWF0dGVyLmdldEZpbGVNYXRjaGVyKCksIHtkb3Q6IHRydWV9KVxuICAgICAgICAgICAgICAubWFwKGZpbGUgPT4gKHtmb3JtYXR0ZXIsIGZpbGV9KSkpO1xuICAgIH1cblxuICAgIC8vIElmIG5vIGNvbW1hbmRzIGFyZSBnZW5lcmF0ZWQsIHJlc29sdmUgdGhlIHByb21pc2UgYXMgYGZhbHNlYCBhcyBubyBmaWxlc1xuICAgIC8vIHdlcmUgcnVuIGFnYWluc3QgdGhlIGFueSBmb3JtYXR0ZXJzLlxuICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gcmVzb2x2ZShmYWxzZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoIChhY3Rpb24pIHtcbiAgICAgIGNhc2UgJ2Zvcm1hdCc6XG4gICAgICAgIGluZm8oYEZvcm1hdHRpbmcgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2hlY2snOlxuICAgICAgICBpbmZvKGBDaGVja2luZyBmb3JtYXQgb2YgJHtwZW5kaW5nQ29tbWFuZHMubGVuZ3RofSBmaWxlKHMpYCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZm9ybWF0IGFjdGlvbiBcIiR7YWN0aW9ufVwiOiBhbGxvd2VkIGFjdGlvbnMgYXJlIFwiZm9ybWF0XCIgYW5kIFwiY2hlY2tcImApO1xuICAgIH1cblxuICAgIC8vIFRoZSBwcm9ncmVzcyBiYXIgaW5zdGFuY2UgdG8gdXNlIGZvciBwcm9ncmVzcyB0cmFja2luZy5cbiAgICBjb25zdCBwcm9ncmVzc0JhciA9XG4gICAgICAgIG5ldyBCYXIoe2Zvcm1hdDogYFt7YmFyfV0gRVRBOiB7ZXRhfXMgfCB7dmFsdWV9L3t0b3RhbH0gZmlsZXNgLCBjbGVhck9uQ29tcGxldGU6IHRydWV9KTtcbiAgICAvLyBBIGxvY2FsIGNvcHkgb2YgdGhlIGZpbGVzIHRvIHJ1biB0aGUgY29tbWFuZCBvbi5cbiAgICAvLyBBbiBhcnJheSB0byByZXByZXNlbnQgdGhlIGN1cnJlbnQgdXNhZ2Ugc3RhdGUgb2YgZWFjaCBvZiB0aGUgdGhyZWFkcyBmb3IgcGFyYWxsZWxpemF0aW9uLlxuICAgIGNvbnN0IHRocmVhZHMgPSBuZXcgQXJyYXk8Ym9vbGVhbj4oQVZBSUxBQkxFX1RIUkVBRFMpLmZpbGwoZmFsc2UpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgcnVuIHRoZSBjb21tYW5kIG9uIHRoZSBuZXh0IGF2YWlsYWJsZSBmaWxlIGZyb20gdGhlIGxpc3QgdXNpbmcgdGhlIHByb3ZpZGVkXG4gICAgLy8gdGhyZWFkLlxuICAgIGZ1bmN0aW9uIHJ1bkNvbW1hbmRJblRocmVhZCh0aHJlYWQ6IG51bWJlcikge1xuICAgICAgY29uc3QgbmV4dENvbW1hbmQgPSBwZW5kaW5nQ29tbWFuZHMucG9wKCk7XG4gICAgICAvLyBJZiBubyBmaWxlIHdhcyBwdWxsZWQgZnJvbSB0aGUgYXJyYXksIHJldHVybiBhcyB0aGVyZSBhcmUgbm8gbW9yZSBmaWxlcyB0byBydW4gYWdhaW5zdC5cbiAgICAgIGlmIChuZXh0Q29tbWFuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocmVhZHNbdGhyZWFkXSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgZmlsZSBhbmQgZm9ybWF0dGVyIGZvciB0aGUgbmV4dCBjb21tYW5kLlxuICAgICAgY29uc3Qge2ZpbGUsIGZvcm1hdHRlcn0gPSBuZXh0Q29tbWFuZDtcblxuICAgICAgZXhlYyhcbiAgICAgICAgICBgJHtmb3JtYXR0ZXIuY29tbWFuZEZvcihhY3Rpb24pfSAke2ZpbGV9YCxcbiAgICAgICAgICB7YXN5bmM6IHRydWUsIHNpbGVudDogdHJ1ZX0sXG4gICAgICAgICAgKGNvZGUsIHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgICAgICAvLyBSdW4gdGhlIHByb3ZpZGVkIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmFpbGVkID0gZm9ybWF0dGVyLmNhbGxiYWNrRm9yKGFjdGlvbikoZmlsZSwgY29kZSwgc3Rkb3V0LCBzdGRlcnIpO1xuICAgICAgICAgICAgaWYgKGZhaWxlZCkge1xuICAgICAgICAgICAgICBmYWlsdXJlcy5wdXNoKGZpbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZSBpbiB0aGUgcHJvZ3Jlc3MgYmFyIGFub3RoZXIgZmlsZSBiZWluZyBjb21wbGV0ZWQuXG4gICAgICAgICAgICBwcm9ncmVzc0Jhci5pbmNyZW1lbnQoMSk7XG4gICAgICAgICAgICAvLyBJZiBtb3JlIGZpbGVzIGV4aXN0IGluIHRoZSBsaXN0LCBydW4gYWdhaW4gdG8gd29yayBvbiB0aGUgbmV4dCBmaWxlLFxuICAgICAgICAgICAgLy8gdXNpbmcgdGhlIHNhbWUgc2xvdC5cbiAgICAgICAgICAgIGlmIChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBydW5Db21tYW5kSW5UaHJlYWQodGhyZWFkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIG5vdCBtb3JlIGZpbGVzIGFyZSBhdmFpbGFibGUsIG1hcmsgdGhlIHRocmVhZCBhcyB1bnVzZWQuXG4gICAgICAgICAgICB0aHJlYWRzW3RocmVhZF0gPSBmYWxzZTtcbiAgICAgICAgICAgIC8vIElmIGFsbCBvZiB0aGUgdGhyZWFkcyBhcmUgZmFsc2UsIGFzIHRoZXkgYXJlIHVudXNlZCwgbWFyayB0aGUgcHJvZ3Jlc3MgYmFyXG4gICAgICAgICAgICAvLyBjb21wbGV0ZWQgYW5kIHJlc29sdmUgdGhlIHByb21pc2UuXG4gICAgICAgICAgICBpZiAodGhyZWFkcy5ldmVyeShhY3RpdmUgPT4gIWFjdGl2ZSkpIHtcbiAgICAgICAgICAgICAgcHJvZ3Jlc3NCYXIuc3RvcCgpO1xuICAgICAgICAgICAgICByZXNvbHZlKGZhaWx1cmVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgKTtcbiAgICAgIC8vIE1hcmsgdGhlIHRocmVhZCBhcyBpbiB1c2UgYXMgdGhlIGNvbW1hbmQgZXhlY3V0aW9uIGhhcyBiZWVuIHN0YXJ0ZWQuXG4gICAgICB0aHJlYWRzW3RocmVhZF0gPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFN0YXJ0IHRoZSBwcm9ncmVzcyBiYXJcbiAgICBwcm9ncmVzc0Jhci5zdGFydChwZW5kaW5nQ29tbWFuZHMubGVuZ3RoLCAwKTtcbiAgICAvLyBTdGFydCBydW5uaW5nIHRoZSBjb21tYW5kIG9uIGZpbGVzIGZyb20gdGhlIGxlYXN0IGluIGVhY2ggYXZhaWxhYmxlIHRocmVhZC5cbiAgICB0aHJlYWRzLmZvckVhY2goKF8sIGlkeCkgPT4gcnVuQ29tbWFuZEluVGhyZWFkKGlkeCkpO1xuICB9KTtcbn1cbiJdfQ==