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
    let failures = await run_commands_parallel_1.runFormatterInParallel(files, 'format');
    if (failures === false) {
        console_1.info('No files matched for formatting.');
        process.exit(0);
    }
    // The process should exit as a failure if any of the files failed to format.
    if (failures.length !== 0) {
        console_1.error(console_1.red(`The following files could not be formatted:`));
        failures.forEach(({ filePath, message }) => {
            console_1.info(`  • ${filePath}: ${message}`);
        });
        console_1.error(console_1.red(`Formatting failed, see errors above for more information.`));
        process.exit(1);
    }
    console_1.info(`√  Formatting complete.`);
    process.exit(0);
}
exports.formatFiles = formatFiles;
/**
 * Check provided files for formatting correctness.
 */
async function checkFiles(files) {
    // Files which are currently not formatted correctly.
    const failures = await run_commands_parallel_1.runFormatterInParallel(files, 'check');
    if (failures === false) {
        console_1.info('No files matched for formatting check.');
        process.exit(0);
    }
    if (failures.length) {
        // Provide output expressing which files are failing formatting.
        console_1.info.group('\nThe following files are out of format:');
        for (const { filePath } of failures) {
            console_1.info(`  • ${filePath}`);
        }
        console_1.info.groupEnd();
        console_1.info();
        // If the command is run in a non-CI environment, prompt to format the files immediately.
        let runFormatter = false;
        if (!process.env['CI']) {
            runFormatter = await console_1.promptConfirm('Format the files now?', true);
        }
        if (runFormatter) {
            // Format the failing files as requested.
            await formatFiles(failures.map((f) => f.filePath));
            process.exit(0);
        }
        else {
            // Inform user how to format files in the future.
            console_1.info();
            console_1.info(`To format the failing file run the following command:`);
            console_1.info(`  yarn ng-dev format files ${failures.map((f) => f.filePath).join(' ')}`);
            process.exit(1);
        }
    }
    else {
        console_1.info('√  All files correctly formatted.');
        process.exit(0);
    }
}
exports.checkFiles = checkFiles;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQWlFO0FBRWpFLG1FQUErRDtBQUUvRDs7R0FFRztBQUNJLEtBQUssVUFBVSxXQUFXLENBQUMsS0FBZTtJQUMvQyxzQ0FBc0M7SUFDdEMsSUFBSSxRQUFRLEdBQUcsTUFBTSw4Q0FBc0IsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFFN0QsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO1FBQ3RCLGNBQUksQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCw2RUFBNkU7SUFDN0UsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN6QixlQUFLLENBQUMsYUFBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsQ0FBQztRQUMxRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFDLEVBQUUsRUFBRTtZQUN2QyxjQUFJLENBQUMsT0FBTyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztRQUN0QyxDQUFDLENBQUMsQ0FBQztRQUNILGVBQUssQ0FBQyxhQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFDRCxjQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFwQkQsa0NBb0JDO0FBRUQ7O0dBRUc7QUFDSSxLQUFLLFVBQVUsVUFBVSxDQUFDLEtBQWU7SUFDOUMscURBQXFEO0lBQ3JELE1BQU0sUUFBUSxHQUFHLE1BQU0sOENBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRTlELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtRQUN0QixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ25CLGdFQUFnRTtRQUNoRSxjQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDdkQsS0FBSyxNQUFNLEVBQUMsUUFBUSxFQUFDLElBQUksUUFBUSxFQUFFO1lBQ2pDLGNBQUksQ0FBQyxPQUFPLFFBQVEsRUFBRSxDQUFDLENBQUM7U0FDekI7UUFDRCxjQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDaEIsY0FBSSxFQUFFLENBQUM7UUFFUCx5RkFBeUY7UUFDekYsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3RCLFlBQVksR0FBRyxNQUFNLHVCQUFhLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDbkU7UUFFRCxJQUFJLFlBQVksRUFBRTtZQUNoQix5Q0FBeUM7WUFDekMsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDbkQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjthQUFNO1lBQ0wsaURBQWlEO1lBQ2pELGNBQUksRUFBRSxDQUFDO1lBQ1AsY0FBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7WUFDOUQsY0FBSSxDQUFDLDhCQUE4QixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNoRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0tBQ0Y7U0FBTTtRQUNMLGNBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7QUFDSCxDQUFDO0FBdkNELGdDQXVDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWR9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3J1bkZvcm1hdHRlckluUGFyYWxsZWx9IGZyb20gJy4vcnVuLWNvbW1hbmRzLXBhcmFsbGVsJztcblxuLyoqXG4gKiBGb3JtYXQgcHJvdmlkZWQgZmlsZXMgaW4gcGxhY2UuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb3JtYXRGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gV2hldGhlciBhbnkgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgbGV0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2Zvcm1hdCcpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIFRoZSBwcm9jZXNzIHNob3VsZCBleGl0IGFzIGEgZmFpbHVyZSBpZiBhbnkgb2YgdGhlIGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcihyZWQoYFRoZSBmb2xsb3dpbmcgZmlsZXMgY291bGQgbm90IGJlIGZvcm1hdHRlZDpgKSk7XG4gICAgZmFpbHVyZXMuZm9yRWFjaCgoe2ZpbGVQYXRoLCBtZXNzYWdlfSkgPT4ge1xuICAgICAgaW5mbyhgICDigKIgJHtmaWxlUGF0aH06ICR7bWVzc2FnZX1gKTtcbiAgICB9KTtcbiAgICBlcnJvcihyZWQoYEZvcm1hdHRpbmcgZmFpbGVkLCBzZWUgZXJyb3JzIGFib3ZlIGZvciBtb3JlIGluZm9ybWF0aW9uLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgaW5mbyhg4oiaICBGb3JtYXR0aW5nIGNvbXBsZXRlLmApO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvdmlkZWQgZmlsZXMgZm9yIGZvcm1hdHRpbmcgY29ycmVjdG5lc3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0ZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBGaWxlcyB3aGljaCBhcmUgY3VycmVudGx5IG5vdCBmb3JtYXR0ZWQgY29ycmVjdGx5LlxuICBjb25zdCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdjaGVjaycpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nIGNoZWNrLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAvLyBQcm92aWRlIG91dHB1dCBleHByZXNzaW5nIHdoaWNoIGZpbGVzIGFyZSBmYWlsaW5nIGZvcm1hdHRpbmcuXG4gICAgaW5mby5ncm91cCgnXFxuVGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgb3V0IG9mIGZvcm1hdDonKTtcbiAgICBmb3IgKGNvbnN0IHtmaWxlUGF0aH0gb2YgZmFpbHVyZXMpIHtcbiAgICAgIGluZm8oYCAg4oCiICR7ZmlsZVBhdGh9YCk7XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG5cbiAgICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICAgIGxldCBydW5Gb3JtYXR0ZXIgPSBmYWxzZTtcbiAgICBpZiAoIXByb2Nlc3MuZW52WydDSSddKSB7XG4gICAgICBydW5Gb3JtYXR0ZXIgPSBhd2FpdCBwcm9tcHRDb25maXJtKCdGb3JtYXQgdGhlIGZpbGVzIG5vdz8nLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAocnVuRm9ybWF0dGVyKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGZhaWxpbmcgZmlsZXMgYXMgcmVxdWVzdGVkLlxuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoZmFpbHVyZXMubWFwKChmKSA9PiBmLmZpbGVQYXRoKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluZm9ybSB1c2VyIGhvdyB0byBmb3JtYXQgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgIGluZm8oKTtcbiAgICAgIGluZm8oYFRvIGZvcm1hdCB0aGUgZmFpbGluZyBmaWxlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgICBpbmZvKGAgIHlhcm4gbmctZGV2IGZvcm1hdCBmaWxlcyAke2ZhaWx1cmVzLm1hcCgoZikgPT4gZi5maWxlUGF0aCkuam9pbignICcpfWApO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpbmZvKCfiiJogIEFsbCBmaWxlcyBjb3JyZWN0bHkgZm9ybWF0dGVkLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufVxuIl19