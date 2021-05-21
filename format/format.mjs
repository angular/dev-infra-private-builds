/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { error, info, promptConfirm, red } from '../utils/console';
import { runFormatterInParallel } from './run-commands-parallel';
/**
 * Format provided files in place.
 */
export function formatFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // Whether any files failed to format.
        let failures = yield runFormatterInParallel(files, 'format');
        if (failures === false) {
            info('No files matched for formatting.');
            process.exit(0);
        }
        // The process should exit as a failure if any of the files failed to format.
        if (failures.length !== 0) {
            error(red(`The following files could not be formatted:`));
            failures.forEach(({ filePath, message }) => {
                info(`  • ${filePath}: ${message}`);
            });
            error(red(`Formatting failed, see errors above for more information.`));
            process.exit(1);
        }
        info(`√  Formatting complete.`);
        process.exit(0);
    });
}
/**
 * Check provided files for formatting correctness.
 */
export function checkFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        // Files which are currently not formatted correctly.
        const failures = yield runFormatterInParallel(files, 'check');
        if (failures === false) {
            info('No files matched for formatting check.');
            process.exit(0);
        }
        if (failures.length) {
            // Provide output expressing which files are failing formatting.
            info.group('\nThe following files are out of format:');
            for (const { filePath } of failures) {
                info(`  • ${filePath}`);
            }
            info.groupEnd();
            info();
            // If the command is run in a non-CI environment, prompt to format the files immediately.
            let runFormatter = false;
            if (!process.env['CI']) {
                runFormatter = yield promptConfirm('Format the files now?', true);
            }
            if (runFormatter) {
                // Format the failing files as requested.
                yield formatFiles(failures.map(f => f.filePath));
                process.exit(0);
            }
            else {
                // Inform user how to format files in the future.
                info();
                info(`To format the failing file run the following command:`);
                info(`  yarn ng-dev format files ${failures.join(' ')}`);
                process.exit(1);
            }
        }
        else {
            info('√  All files correctly formatted.');
            process.exit(0);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUUvRDs7R0FFRztBQUNILE1BQU0sVUFBZ0IsV0FBVyxDQUFDLEtBQWU7O1FBQy9DLHNDQUFzQztRQUN0QyxJQUFJLFFBQVEsR0FBRyxNQUFNLHNCQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELDZFQUE2RTtRQUM3RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxDQUFDO1lBQzFELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsT0FBTyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFDRCxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFnQixVQUFVLENBQUMsS0FBZTs7UUFDOUMscURBQXFEO1FBQ3JELE1BQU0sUUFBUSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTlELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ25CLGdFQUFnRTtZQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsS0FBSyxNQUFNLEVBQUMsUUFBUSxFQUFDLElBQUksUUFBUSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsT0FBTyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxDQUFDO1lBRVAseUZBQXlGO1lBQ3pGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEIsWUFBWSxHQUFHLE1BQU0sYUFBYSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25FO1lBRUQsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLHlDQUF5QztnQkFDekMsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLGlEQUFpRDtnQkFDakQsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyw4QkFBOEIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWR9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3J1bkZvcm1hdHRlckluUGFyYWxsZWx9IGZyb20gJy4vcnVuLWNvbW1hbmRzLXBhcmFsbGVsJztcblxuLyoqXG4gKiBGb3JtYXQgcHJvdmlkZWQgZmlsZXMgaW4gcGxhY2UuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmb3JtYXRGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gV2hldGhlciBhbnkgZmlsZXMgZmFpbGVkIHRvIGZvcm1hdC5cbiAgbGV0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2Zvcm1hdCcpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIC8vIFRoZSBwcm9jZXNzIHNob3VsZCBleGl0IGFzIGEgZmFpbHVyZSBpZiBhbnkgb2YgdGhlIGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGggIT09IDApIHtcbiAgICBlcnJvcihyZWQoYFRoZSBmb2xsb3dpbmcgZmlsZXMgY291bGQgbm90IGJlIGZvcm1hdHRlZDpgKSk7XG4gICAgZmFpbHVyZXMuZm9yRWFjaCgoe2ZpbGVQYXRoLCBtZXNzYWdlfSkgPT4ge1xuICAgICAgaW5mbyhgICDigKIgJHtmaWxlUGF0aH06ICR7bWVzc2FnZX1gKTtcbiAgICB9KTtcbiAgICBlcnJvcihyZWQoYEZvcm1hdHRpbmcgZmFpbGVkLCBzZWUgZXJyb3JzIGFib3ZlIGZvciBtb3JlIGluZm9ybWF0aW9uLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbiAgaW5mbyhg4oiaICBGb3JtYXR0aW5nIGNvbXBsZXRlLmApO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59XG5cbi8qKlxuICogQ2hlY2sgcHJvdmlkZWQgZmlsZXMgZm9yIGZvcm1hdHRpbmcgY29ycmVjdG5lc3MuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjaGVja0ZpbGVzKGZpbGVzOiBzdHJpbmdbXSkge1xuICAvLyBGaWxlcyB3aGljaCBhcmUgY3VycmVudGx5IG5vdCBmb3JtYXR0ZWQgY29ycmVjdGx5LlxuICBjb25zdCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdjaGVjaycpO1xuXG4gIGlmIChmYWlsdXJlcyA9PT0gZmFsc2UpIHtcbiAgICBpbmZvKCdObyBmaWxlcyBtYXRjaGVkIGZvciBmb3JtYXR0aW5nIGNoZWNrLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuXG4gIGlmIChmYWlsdXJlcy5sZW5ndGgpIHtcbiAgICAvLyBQcm92aWRlIG91dHB1dCBleHByZXNzaW5nIHdoaWNoIGZpbGVzIGFyZSBmYWlsaW5nIGZvcm1hdHRpbmcuXG4gICAgaW5mby5ncm91cCgnXFxuVGhlIGZvbGxvd2luZyBmaWxlcyBhcmUgb3V0IG9mIGZvcm1hdDonKTtcbiAgICBmb3IgKGNvbnN0IHtmaWxlUGF0aH0gb2YgZmFpbHVyZXMpIHtcbiAgICAgIGluZm8oYCAg4oCiICR7ZmlsZVBhdGh9YCk7XG4gICAgfVxuICAgIGluZm8uZ3JvdXBFbmQoKTtcbiAgICBpbmZvKCk7XG5cbiAgICAvLyBJZiB0aGUgY29tbWFuZCBpcyBydW4gaW4gYSBub24tQ0kgZW52aXJvbm1lbnQsIHByb21wdCB0byBmb3JtYXQgdGhlIGZpbGVzIGltbWVkaWF0ZWx5LlxuICAgIGxldCBydW5Gb3JtYXR0ZXIgPSBmYWxzZTtcbiAgICBpZiAoIXByb2Nlc3MuZW52WydDSSddKSB7XG4gICAgICBydW5Gb3JtYXR0ZXIgPSBhd2FpdCBwcm9tcHRDb25maXJtKCdGb3JtYXQgdGhlIGZpbGVzIG5vdz8nLCB0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAocnVuRm9ybWF0dGVyKSB7XG4gICAgICAvLyBGb3JtYXQgdGhlIGZhaWxpbmcgZmlsZXMgYXMgcmVxdWVzdGVkLlxuICAgICAgYXdhaXQgZm9ybWF0RmlsZXMoZmFpbHVyZXMubWFwKGYgPT4gZi5maWxlUGF0aCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJbmZvcm0gdXNlciBob3cgdG8gZm9ybWF0IGZpbGVzIGluIHRoZSBmdXR1cmUuXG4gICAgICBpbmZvKCk7XG4gICAgICBpbmZvKGBUbyBmb3JtYXQgdGhlIGZhaWxpbmcgZmlsZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kOmApO1xuICAgICAgaW5mbyhgICB5YXJuIG5nLWRldiBmb3JtYXQgZmlsZXMgJHtmYWlsdXJlcy5qb2luKCcgJyl9YCk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGluZm8oJ+KImiAgQWxsIGZpbGVzIGNvcnJlY3RseSBmb3JtYXR0ZWQuJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG59XG4iXX0=