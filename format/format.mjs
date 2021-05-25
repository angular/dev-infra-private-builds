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
                info(`  yarn ng-dev format files ${failures.map(f => f.filePath).join(' ')}`);
                process.exit(1);
            }
        }
        else {
            info('√  All files correctly formatted.');
            process.exit(0);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2Zvcm1hdC9mb3JtYXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUVqRSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSx5QkFBeUIsQ0FBQztBQUUvRDs7R0FFRztBQUNILE1BQU0sVUFBZ0IsV0FBVyxDQUFDLEtBQWU7O1FBQy9DLHNDQUFzQztRQUN0QyxJQUFJLFFBQVEsR0FBRyxNQUFNLHNCQUFzQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUU3RCxJQUFJLFFBQVEsS0FBSyxLQUFLLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGtDQUFrQyxDQUFDLENBQUM7WUFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELDZFQUE2RTtRQUM3RSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxDQUFDO1lBQzFELFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsRUFBRSxFQUFFO2dCQUN2QyxJQUFJLENBQUMsT0FBTyxRQUFRLEtBQUssT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0QyxDQUFDLENBQUMsQ0FBQztZQUNILEtBQUssQ0FBQyxHQUFHLENBQUMsMkRBQTJELENBQUMsQ0FBQyxDQUFDO1lBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFDRCxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUNoQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7Q0FBQTtBQUVEOztHQUVHO0FBQ0gsTUFBTSxVQUFnQixVQUFVLENBQUMsS0FBZTs7UUFDOUMscURBQXFEO1FBQ3JELE1BQU0sUUFBUSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRTlELElBQUksUUFBUSxLQUFLLEtBQUssRUFBRTtZQUN0QixJQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztZQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsSUFBSSxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQ25CLGdFQUFnRTtZQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7WUFDdkQsS0FBSyxNQUFNLEVBQUMsUUFBUSxFQUFDLElBQUksUUFBUSxFQUFFO2dCQUNqQyxJQUFJLENBQUMsT0FBTyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2FBQ3pCO1lBQ0QsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2hCLElBQUksRUFBRSxDQUFDO1lBRVAseUZBQXlGO1lBQ3pGLElBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDdEIsWUFBWSxHQUFHLE1BQU0sYUFBYSxDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ25FO1lBRUQsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLHlDQUF5QztnQkFDekMsTUFBTSxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNqRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO2lCQUFNO2dCQUNMLGlEQUFpRDtnQkFDakQsSUFBSSxFQUFFLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLHVEQUF1RCxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyw4QkFBOEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM5RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Y7YUFBTTtZQUNMLElBQUksQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvciwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtydW5Gb3JtYXR0ZXJJblBhcmFsbGVsfSBmcm9tICcuL3J1bi1jb21tYW5kcy1wYXJhbGxlbCc7XG5cbi8qKlxuICogRm9ybWF0IHByb3ZpZGVkIGZpbGVzIGluIHBsYWNlLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZm9ybWF0RmlsZXMoZmlsZXM6IHN0cmluZ1tdKSB7XG4gIC8vIFdoZXRoZXIgYW55IGZpbGVzIGZhaWxlZCB0byBmb3JtYXQuXG4gIGxldCBmYWlsdXJlcyA9IGF3YWl0IHJ1bkZvcm1hdHRlckluUGFyYWxsZWwoZmlsZXMsICdmb3JtYXQnKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZy4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICAvLyBUaGUgcHJvY2VzcyBzaG91bGQgZXhpdCBhcyBhIGZhaWx1cmUgaWYgYW55IG9mIHRoZSBmaWxlcyBmYWlsZWQgdG8gZm9ybWF0LlxuICBpZiAoZmFpbHVyZXMubGVuZ3RoICE9PSAwKSB7XG4gICAgZXJyb3IocmVkKGBUaGUgZm9sbG93aW5nIGZpbGVzIGNvdWxkIG5vdCBiZSBmb3JtYXR0ZWQ6YCkpO1xuICAgIGZhaWx1cmVzLmZvckVhY2goKHtmaWxlUGF0aCwgbWVzc2FnZX0pID0+IHtcbiAgICAgIGluZm8oYCAg4oCiICR7ZmlsZVBhdGh9OiAke21lc3NhZ2V9YCk7XG4gICAgfSk7XG4gICAgZXJyb3IocmVkKGBGb3JtYXR0aW5nIGZhaWxlZCwgc2VlIGVycm9ycyBhYm92ZSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG4gIGluZm8oYOKImiAgRm9ybWF0dGluZyBjb21wbGV0ZS5gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKipcbiAqIENoZWNrIHByb3ZpZGVkIGZpbGVzIGZvciBmb3JtYXR0aW5nIGNvcnJlY3RuZXNzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2hlY2tGaWxlcyhmaWxlczogc3RyaW5nW10pIHtcbiAgLy8gRmlsZXMgd2hpY2ggYXJlIGN1cnJlbnRseSBub3QgZm9ybWF0dGVkIGNvcnJlY3RseS5cbiAgY29uc3QgZmFpbHVyZXMgPSBhd2FpdCBydW5Gb3JtYXR0ZXJJblBhcmFsbGVsKGZpbGVzLCAnY2hlY2snKTtcblxuICBpZiAoZmFpbHVyZXMgPT09IGZhbHNlKSB7XG4gICAgaW5mbygnTm8gZmlsZXMgbWF0Y2hlZCBmb3IgZm9ybWF0dGluZyBjaGVjay4nKTtcbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cblxuICBpZiAoZmFpbHVyZXMubGVuZ3RoKSB7XG4gICAgLy8gUHJvdmlkZSBvdXRwdXQgZXhwcmVzc2luZyB3aGljaCBmaWxlcyBhcmUgZmFpbGluZyBmb3JtYXR0aW5nLlxuICAgIGluZm8uZ3JvdXAoJ1xcblRoZSBmb2xsb3dpbmcgZmlsZXMgYXJlIG91dCBvZiBmb3JtYXQ6Jyk7XG4gICAgZm9yIChjb25zdCB7ZmlsZVBhdGh9IG9mIGZhaWx1cmVzKSB7XG4gICAgICBpbmZvKGAgIOKAoiAke2ZpbGVQYXRofWApO1xuICAgIH1cbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gICAgaW5mbygpO1xuXG4gICAgLy8gSWYgdGhlIGNvbW1hbmQgaXMgcnVuIGluIGEgbm9uLUNJIGVudmlyb25tZW50LCBwcm9tcHQgdG8gZm9ybWF0IHRoZSBmaWxlcyBpbW1lZGlhdGVseS5cbiAgICBsZXQgcnVuRm9ybWF0dGVyID0gZmFsc2U7XG4gICAgaWYgKCFwcm9jZXNzLmVudlsnQ0knXSkge1xuICAgICAgcnVuRm9ybWF0dGVyID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnRm9ybWF0IHRoZSBmaWxlcyBub3c/JywgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHJ1bkZvcm1hdHRlcikge1xuICAgICAgLy8gRm9ybWF0IHRoZSBmYWlsaW5nIGZpbGVzIGFzIHJlcXVlc3RlZC5cbiAgICAgIGF3YWl0IGZvcm1hdEZpbGVzKGZhaWx1cmVzLm1hcChmID0+IGYuZmlsZVBhdGgpKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSW5mb3JtIHVzZXIgaG93IHRvIGZvcm1hdCBmaWxlcyBpbiB0aGUgZnV0dXJlLlxuICAgICAgaW5mbygpO1xuICAgICAgaW5mbyhgVG8gZm9ybWF0IHRoZSBmYWlsaW5nIGZpbGUgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZDpgKTtcbiAgICAgIGluZm8oYCAgeWFybiBuZy1kZXYgZm9ybWF0IGZpbGVzICR7ZmFpbHVyZXMubWFwKGYgPT4gZi5maWxlUGF0aCkuam9pbignICcpfWApO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpbmZvKCfiiJogIEFsbCBmaWxlcyBjb3JyZWN0bHkgZm9ybWF0dGVkLicpO1xuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxufVxuIl19