"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkFiles = exports.formatFiles = void 0;
const console_1 = require("../utils/console");
const run_commands_parallel_1 = require("./run-commands-parallel");
/**
 * Format provided files in place.
 *
 * @returns a status code indicating whether the formatting run was successful.
 */
async function formatFiles(files) {
    // Whether any files failed to format.
    let failures = await (0, run_commands_parallel_1.runFormatterInParallel)(files, 'format');
    if (failures === false) {
        (0, console_1.info)('No files matched for formatting.');
        return 0;
    }
    // The process should exit as a failure if any of the files failed to format.
    if (failures.length !== 0) {
        (0, console_1.error)((0, console_1.red)(`The following files could not be formatted:`));
        failures.forEach(({ filePath, message }) => {
            (0, console_1.info)(`  • ${filePath}: ${message}`);
        });
        (0, console_1.error)((0, console_1.red)(`Formatting failed, see errors above for more information.`));
        return 1;
    }
    (0, console_1.info)(`√  Formatting complete.`);
    return 0;
}
exports.formatFiles = formatFiles;
/**
 * Check provided files for formatting correctness.
 *
 * @returns a status code indicating whether the format check run was successful.
 */
async function checkFiles(files) {
    // Files which are currently not formatted correctly.
    const failures = await (0, run_commands_parallel_1.runFormatterInParallel)(files, 'check');
    if (failures === false) {
        (0, console_1.info)('No files matched for formatting check.');
        return 0;
    }
    if (failures.length) {
        // Provide output expressing which files are failing formatting.
        console_1.info.group('\nThe following files are out of format:');
        for (const { filePath } of failures) {
            (0, console_1.info)(`  • ${filePath}`);
        }
        console_1.info.groupEnd();
        (0, console_1.info)();
        // If the command is run in a non-CI environment, prompt to format the files immediately.
        let runFormatter = false;
        if (!process.env['CI']) {
            runFormatter = await (0, console_1.promptConfirm)('Format the files now?', true);
        }
        if (runFormatter) {
            // Format the failing files as requested.
            return (await formatFiles(failures.map((f) => f.filePath))) || 0;
        }
        else {
            // Inform user how to format files in the future.
            (0, console_1.info)();
            (0, console_1.info)(`To format the failing file run the following command:`);
            (0, console_1.info)(`  yarn ng-dev format files ${failures.map((f) => f.filePath).join(' ')}`);
            return 1;
        }
    }
    else {
        (0, console_1.info)('√  All files correctly formatted.');
        return 0;
    }
}
exports.checkFiles = checkFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQWlFO0FBRWpFLG1FQUErRDtBQUUvRDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLFdBQVcsQ0FBQyxLQUFlO0lBQy9DLHNDQUFzQztJQUN0QyxJQUFJLFFBQVEsR0FBRyxNQUFNLElBQUEsOENBQXNCLEVBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBRTdELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtRQUN0QixJQUFBLGNBQUksRUFBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxDQUFDO0tBQ1Y7SUFFRCw2RUFBNkU7SUFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN6QixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyw2Q0FBNkMsQ0FBQyxDQUFDLENBQUM7UUFDMUQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsUUFBUSxFQUFFLE9BQU8sRUFBQyxFQUFFLEVBQUU7WUFDdkMsSUFBQSxjQUFJLEVBQUMsT0FBTyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNILElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztRQUN4RSxPQUFPLENBQUMsQ0FBQztLQUNWO0lBQ0QsSUFBQSxjQUFJLEVBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNoQyxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFwQkQsa0NBb0JDO0FBRUQ7Ozs7R0FJRztBQUNJLEtBQUssVUFBVSxVQUFVLENBQUMsS0FBZTtJQUM5QyxxREFBcUQ7SUFDckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFBLDhDQUFzQixFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUU5RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7UUFDdEIsSUFBQSxjQUFJLEVBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsQ0FBQztLQUNWO0lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ25CLGdFQUFnRTtRQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDdkQsS0FBSyxNQUFNLEVBQUMsUUFBUSxFQUFDLElBQUksUUFBUSxFQUFFO1lBQ2pDLElBQUEsY0FBSSxFQUFDLE9BQU8sUUFBUSxFQUFFLENBQUMsQ0FBQztTQUN6QjtRQUNELGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNoQixJQUFBLGNBQUksR0FBRSxDQUFDO1FBRVAseUZBQXlGO1FBQ3pGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztRQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN0QixZQUFZLEdBQUcsTUFBTSxJQUFBLHVCQUFhLEVBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbkU7UUFFRCxJQUFJLFlBQVksRUFBRTtZQUNoQix5Q0FBeUM7WUFDekMsT0FBTyxDQUFDLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ2xFO2FBQU07WUFDTCxpREFBaUQ7WUFDakQsSUFBQSxjQUFJLEdBQUUsQ0FBQztZQUNQLElBQUEsY0FBSSxFQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDOUQsSUFBQSxjQUFJLEVBQUMsOEJBQThCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sQ0FBQyxDQUFDO1NBQ1Y7S0FDRjtTQUFNO1FBQ0wsSUFBQSxjQUFJLEVBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsQ0FBQztLQUNWO0FBQ0gsQ0FBQztBQXRDRCxnQ0FzQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICpcbiAqIEByZXR1cm5zIGEgc3RhdHVzIGNvZGUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBmb3JtYXR0aW5nIHJ1biB3YXMgc3VjY2Vzc2Z1bC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZvcm1hdEZpbGVzKGZpbGVzOiBzdHJpbmdbXSk6IFByb21pc2U8MSB8IDA+IHtcbiAgLy8gV2hldGhlciBhbnkgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgbGV0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2Zvcm1hdCcpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nLicpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgLy8gVGhlIHByb2Nlc3Mgc2hvdWxkIGV4aXQgYXMgYSBmYWlsdXJlIGlmIGFueSBvZiB0aGUgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCAhPT0gMCkge1xuICAgIGVycm9yKHJlZChgVGhlIGZvbGxvd2luZyBmaWxlcyBjb3VsZCBub3QgYmUgZm9ybWF0dGVkOmApKTtcbiAgICBmYWlsdXJlcy5mb3JFYWNoKCh7ZmlsZVBhdGgsIG1lc3NhZ2V9KSA9PiB7XG4gICAgICBpbmZvKGAgIOKAoiAke2ZpbGVQYXRofTogJHttZXNzYWdlfWApO1xuICAgIH0pO1xuICAgIGVycm9yKHJlZChgRm9ybWF0dGluZyBmYWlsZWQsIHNlZSBlcnJvcnMgYWJvdmUgZm9yIG1vcmUgaW5mb3JtYXRpb24uYCkpO1xuICAgIHJldHVybiAxO1xuICB9XG4gIGluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcmV0dXJuIDA7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvdmlkZWQgZmlsZXMgZm9yIGZvcm1hdHRpbmcgY29ycmVjdG5lc3MuXG4gKlxuICogQHJldHVybnMgYSBzdGF0dXMgY29kZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGZvcm1hdCBjaGVjayBydW4gd2FzIHN1Y2Nlc3NmdWwuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0ZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBGaWxlcyB3aGljaCBhcmUgY3VycmVudGx5IG5vdCBmb3JtYXR0ZWQgY29ycmVjdGx5LlxuICBjb25zdCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdjaGVjaycpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nIGNoZWNrLicpO1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCkge1xuICAgIC8vIFByb3ZpZGUgb3V0cHV0IGV4cHJlc3Npbmcgd2hpY2ggZmlsZXMgYXJlIGZhaWxpbmcgZm9ybWF0dGluZy5cbiAgICBpbmZvLmdyb3VwKCdcXG5UaGUgZm9sbG93aW5nIGZpbGVzIGFyZSBvdXQgb2YgZm9ybWF0OicpO1xuICAgIGZvciAoY29uc3Qge2ZpbGVQYXRofSBvZiBmYWlsdXJlcykge1xuICAgICAgaW5mbyhgICDigKIgJHtmaWxlUGF0aH1gKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcblxuICAgIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gICAgbGV0IHJ1bkZvcm1hdHRlciA9IGZhbHNlO1xuICAgIGlmICghcHJvY2Vzcy5lbnZbJ0NJJ10pIHtcbiAgICAgIHJ1bkZvcm1hdHRlciA9IGF3YWl0IHByb21wdENvbmZpcm0oJ0Zvcm1hdCB0aGUgZmlsZXMgbm93PycsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChydW5Gb3JtYXR0ZXIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgZmFpbGluZyBmaWxlcyBhcyByZXF1ZXN0ZWQuXG4gICAgICByZXR1cm4gKGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzLm1hcCgoZikgPT4gZi5maWxlUGF0aCkpKSB8fCAwO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBpbmZvKCk7XG4gICAgICBpbmZvKGBUbyBmb3JtYXQgdGhlIGZhaWxpbmcgZmlsZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgICAgaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5tYXAoKGYpID0+IGYuZmlsZVBhdGgpLmpvaW4oJyAnKX1gKTtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpbmZvKCfiiJogIEFsbCBmaWxlcyBjb3JyZWN0bHkgZm9ybWF0dGVkLicpO1xuICAgIHJldHVybiAwO1xuICB9XG59XG4iXX0=