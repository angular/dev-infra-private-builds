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
 */
async function formatFiles(files) {
    // Whether any files failed to format.
    let failures = await (0, run_commands_parallel_1.runFormatterInParallel)(files, 'format');
    if (failures === false) {
        (0, console_1.info)('No files matched for formatting.');
        process.exit(0);
    }
    // The process should exit as a failure if any of the files failed to format.
    if (failures.length !== 0) {
        (0, console_1.error)((0, console_1.red)(`The following files could not be formatted:`));
        failures.forEach(({ filePath, message }) => {
            (0, console_1.info)(`  • ${filePath}: ${message}`);
        });
        (0, console_1.error)((0, console_1.red)(`Formatting failed, see errors above for more information.`));
        process.exit(1);
    }
    (0, console_1.info)(`√  Formatting complete.`);
    process.exit(0);
}
exports.formatFiles = formatFiles;
/**
 * Check provided files for formatting correctness.
 */
async function checkFiles(files) {
    // Files which are currently not formatted correctly.
    const failures = await (0, run_commands_parallel_1.runFormatterInParallel)(files, 'check');
    if (failures === false) {
        (0, console_1.info)('No files matched for formatting check.');
        process.exit(0);
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
            await formatFiles(failures.map((f) => f.filePath));
            process.exit(0);
        }
        else {
            // Inform user how to format files in the future.
            (0, console_1.info)();
            (0, console_1.info)(`To format the failing file run the following command:`);
            (0, console_1.info)(`  yarn ng-dev format files ${failures.map((f) => f.filePath).join(' ')}`);
            process.exit(1);
        }
    }
    else {
        (0, console_1.info)('√  All files correctly formatted.');
        process.exit(0);
    }
}
exports.checkFiles = checkFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQWlFO0FBRWpFLG1FQUErRDtBQUUvRDs7R0FFRztBQUNJLEtBQUssVUFBVSxXQUFXLENBQUMsS0FBZTtJQUMvQyxzQ0FBc0M7SUFDdEMsSUFBSSxRQUFRLEdBQUcsTUFBTSxJQUFBLDhDQUFzQixFQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztJQUU3RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7UUFDdEIsSUFBQSxjQUFJLEVBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsNkVBQTZFO0lBQzdFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDekIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsNkNBQTZDLENBQUMsQ0FBQyxDQUFDO1FBQzFELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsRUFBRSxFQUFFO1lBQ3ZDLElBQUEsY0FBSSxFQUFDLE9BQU8sUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQywyREFBMkQsQ0FBQyxDQUFDLENBQUM7UUFDeEUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUNELElBQUEsY0FBSSxFQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQixDQUFDO0FBcEJELGtDQW9CQztBQUVEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLFVBQVUsQ0FBQyxLQUFlO0lBQzlDLHFEQUFxRDtJQUNyRCxNQUFNLFFBQVEsR0FBRyxNQUFNLElBQUEsOENBQXNCLEVBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTlELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtRQUN0QixJQUFBLGNBQUksRUFBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDbkIsZ0VBQWdFO1FBQ2hFLGNBQUksQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUN2RCxLQUFLLE1BQU0sRUFBQyxRQUFRLEVBQUMsSUFBSSxRQUFRLEVBQUU7WUFDakMsSUFBQSxjQUFJLEVBQUMsT0FBTyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ3pCO1FBQ0QsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hCLElBQUEsY0FBSSxHQUFFLENBQUM7UUFFUCx5RkFBeUY7UUFDekYsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLFlBQVksR0FBRyxNQUFNLElBQUEsdUJBQWEsRUFBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNuRTtRQUVELElBQUksWUFBWSxFQUFFO1lBQ2hCLHlDQUF5QztZQUN6QyxNQUFNLFdBQVcsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO2FBQU07WUFDTCxpREFBaUQ7WUFDakQsSUFBQSxjQUFJLEdBQUUsQ0FBQztZQUNQLElBQUEsY0FBSSxFQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDOUQsSUFBQSxjQUFJLEVBQUMsOEJBQThCLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRjtTQUFNO1FBQ0wsSUFBQSxjQUFJLEVBQUMsbUNBQW1DLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQztBQXZDRCxnQ0F1Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgZXhpdCBhcyBhIGZhaWx1cmUgaWYgYW55IG9mIHRoZSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBpZiAoZmFpbHVyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IocmVkKGBUaGUgZm9sbG93aW5nIGZpbGVzIGNvdWxkIG5vdCBiZSBmb3JtYXR0ZWQ6YCkpO1xuICAgIGZhaWx1cmVzLmZvckVhY2goKHtmaWxlUGF0aCwgbWVzc2FnZX0pID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7ZmlsZVBhdGh9OiAke21lc3NhZ2V9YCk7XG4gICAgfSk7XG4gICAgZXJyb3IocmVkKGBGb3JtYXR0aW5nIGZhaWxlZCwgc2VlIGVycm9ycyBhYm92ZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKipcbiAqIENoZWNrIHByb3ZpZGVkIGZpbGVzIGZvciBmb3JtYXR0aW5nIGNvcnJlY3RuZXNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBub3QgZm9ybWF0dGVkIGNvcnJlY3RseS5cbiAgY29uc3QgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnY2hlY2snKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZyBjaGVjay4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgLy8gUHJvdmlkZSBvdXRwdXQgZXhwcmVzc2luZyB3aGljaCBmaWxlcyBhcmUgZmFpbGluZyBmb3JtYXR0aW5nLlxuICAgIGluZm8uZ3JvdXAoJ1xcblRoZSBmb2xsb3dpbmcgZmlsZXMgYXJlIG91dCBvZiBmb3JtYXQ6Jyk7XG4gICAgZm9yIChjb25zdCB7ZmlsZVBhdGh9IG9mIGZhaWx1cmVzKSB7XG4gICAgICBpbmZvKGAgIOKAoiAke2ZpbGVQYXRofWApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgICBsZXQgcnVuRm9ybWF0dGVyID0gZmFsc2U7XG4gICAgaWYgKCFwcm9jZXNzLmVudlsnQ0knXSkge1xuICAgICAgcnVuRm9ybWF0dGVyID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnRm9ybWF0IHRoZSBmaWxlcyBub3c/JywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bkZvcm1hdHRlcikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBmYWlsaW5nIGZpbGVzIGFzIHJlcXVlc3RlZC5cbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzLm1hcCgoZikgPT4gZi5maWxlUGF0aCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBpbmZvKCk7XG4gICAgICBpbmZvKGBUbyBmb3JtYXQgdGhlIGZhaWxpbmcgZmlsZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgICAgaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5tYXAoKGYpID0+IGYuZmlsZVBhdGgpLmpvaW4oJyAnKX1gKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5mbygn4oiaICBBbGwgZmlsZXMgY29ycmVjdGx5IGZvcm1hdHRlZC4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbn1cbiJdfQ==