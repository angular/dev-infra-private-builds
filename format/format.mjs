/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { error, info, promptConfirm } from '../utils/console';
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
            error(`Formatting failed, see errors above for more information.`);
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
            for (const file of failures) {
                info(`  - ${file}`);
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
                yield formatFiles(failures);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRTVELE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDO0FBRS9EOztHQUVHO0FBQ0gsTUFBTSxVQUFnQixXQUFXLENBQUMsS0FBZTs7UUFDL0Msc0NBQXNDO1FBQ3RDLElBQUksUUFBUSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRTdELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsa0NBQWtDLENBQUMsQ0FBQztZQUN6QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsNkVBQTZFO1FBQzdFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDekIsS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUM7WUFDbkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUNELElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztDQUFBO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLFVBQWdCLFVBQVUsQ0FBQyxLQUFlOztRQUM5QyxxREFBcUQ7UUFDckQsTUFBTSxRQUFRLEdBQUcsTUFBTSxzQkFBc0IsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUQsSUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO1lBQ3RCLElBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1lBQy9DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDbkIsZ0VBQWdFO1lBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztZQUN2RCxLQUFLLE1BQU0sSUFBSSxJQUFJLFFBQVEsRUFBRTtnQkFDM0IsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNyQjtZQUNELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNoQixJQUFJLEVBQUUsQ0FBQztZQUVQLHlGQUF5RjtZQUN6RixJQUFJLFlBQVksR0FBRyxLQUFLLENBQUM7WUFDekIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQ3RCLFlBQVksR0FBRyxNQUFNLGFBQWEsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsQ0FBQzthQUNuRTtZQUVELElBQUksWUFBWSxFQUFFO2dCQUNoQix5Q0FBeUM7Z0JBQ3pDLE1BQU0sV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLGlEQUFpRDtnQkFDakQsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyw4QkFBOEIsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDRjthQUFNO1lBQ0wsSUFBSSxDQUFDLG1DQUFtQyxDQUFDLENBQUM7WUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yLCBpbmZvLCBwcm9tcHRDb25maXJtfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgZXhpdCBhcyBhIGZhaWx1cmUgaWYgYW55IG9mIHRoZSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBpZiAoZmFpbHVyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IoYEZvcm1hdHRpbmcgZmFpbGVkLCBzZWUgZXJyb3JzIGFib3ZlIGZvciBtb3JlIGluZm9ybWF0aW9uLmApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBpbmZvKGDiiJogIEZvcm1hdHRpbmcgY29tcGxldGUuYCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuLyoqXG4gKiBDaGVjayBwcm92aWRlZCBmaWxlcyBmb3IgZm9ybWF0dGluZyBjb3JyZWN0bmVzcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNoZWNrRmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIEZpbGVzIHdoaWNoIGFyZSBjdXJyZW50bHkgbm90IGZvcm1hdHRlZCBjb3JyZWN0bHkuXG4gIGNvbnN0IGZhaWx1cmVzID0gYXdhaXQgcnVuRm9ybWF0dGVySW5QYXJhbGxlbChmaWxlcywgJ2NoZWNrJyk7XG5cbiAgaWYgKGZhaWx1cmVzID09PSBmYWxzZSkge1xuICAgIGluZm8oJ05vIGZpbGVzIG1hdGNoZWQgZm9yIGZvcm1hdHRpbmcgY2hlY2suJyk7XG4gICAgcHJvY2Vzcy5leGl0KDApO1xuICB9XG5cbiAgaWYgKGZhaWx1cmVzLmxlbmd0aCkge1xuICAgIC8vIFByb3ZpZGUgb3V0cHV0IGV4cHJlc3Npbmcgd2hpY2ggZmlsZXMgYXJlIGZhaWxpbmcgZm9ybWF0dGluZy5cbiAgICBpbmZvLmdyb3VwKCdcXG5UaGUgZm9sbG93aW5nIGZpbGVzIGFyZSBvdXQgb2YgZm9ybWF0OicpO1xuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmYWlsdXJlcykge1xuICAgICAgaW5mbyhgICAtICR7ZmlsZX1gKTtcbiAgICB9XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICAgIGluZm8oKTtcblxuICAgIC8vIElmIHRoZSBjb21tYW5kIGlzIHJ1biBpbiBhIG5vbi1DSSBlbnZpcm9ubWVudCwgcHJvbXB0IHRvIGZvcm1hdCB0aGUgZmlsZXMgaW1tZWRpYXRlbHkuXG4gICAgbGV0IHJ1bkZvcm1hdHRlciA9IGZhbHNlO1xuICAgIGlmICghcHJvY2Vzcy5lbnZbJ0NJJ10pIHtcbiAgICAgIHJ1bkZvcm1hdHRlciA9IGF3YWl0IHByb21wdENvbmZpcm0oJ0Zvcm1hdCB0aGUgZmlsZXMgbm93PycsIHRydWUpO1xuICAgIH1cblxuICAgIGlmIChydW5Gb3JtYXR0ZXIpIHtcbiAgICAgIC8vIEZvcm1hdCB0aGUgZmFpbGluZyBmaWxlcyBhcyByZXF1ZXN0ZWQuXG4gICAgICBhd2FpdCBmb3JtYXRGaWxlcyhmYWlsdXJlcyk7XG4gICAgICBwcm9jZXNzLmV4aXQoMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEluZm9ybSB1c2VyIGhvdyB0byBmb3JtYXQgZmlsZXMgaW4gdGhlIGZ1dHVyZS5cbiAgICAgIGluZm8oKTtcbiAgICAgIGluZm8oYFRvIGZvcm1hdCB0aGUgZmFpbGluZyBmaWxlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQ6YCk7XG4gICAgICBpbmZvKGAgIHlhcm4gbmctZGV2IGZvcm1hdCBmaWxlcyAke2ZhaWx1cmVzLmpvaW4oJyAnKX1gKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaW5mbygn4oiaICBBbGwgZmlsZXMgY29ycmVjdGx5IGZvcm1hdHRlZC4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbn1cbiJdfQ==