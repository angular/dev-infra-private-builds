"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateFileModule = void 0;
const config_1 = require("../../utils/config");
const validate_file_1 = require("./validate-file");
/** Builds the command. */
function builder(yargs) {
    return yargs
        .option('file', {
        type: 'string',
        conflicts: ['file-env-variable'],
        description: 'The path of the commit message file.',
    })
        .option('file-env-variable', {
        type: 'string',
        conflicts: ['file'],
        description: 'The key of the environment variable for the path of the commit message file.',
        coerce: (arg) => {
            if (arg === undefined) {
                return arg;
            }
            const file = process.env[arg];
            if (!file) {
                throw new Error(`Provided environment variable "${arg}" was not found.`);
            }
            return file;
        },
    })
        .option('error', {
        type: 'boolean',
        description: 'Whether invalid commit messages should be treated as failures rather than a warning',
        default: !!(0, config_1.getUserConfig)().commitMessage?.errorOnInvalidMessage || !!process.env['CI'],
    });
}
/** Handles the command. */
async function handler({ error, file, fileEnvVariable }) {
    const filePath = file || fileEnvVariable || '.git/COMMIT_EDITMSG';
    (0, validate_file_1.validateFile)(filePath, error);
}
/** yargs command module describing the command. */
exports.ValidateFileModule = {
    handler,
    builder,
    command: 'pre-commit-validate',
    describe: 'Validate the most recent commit message',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLWZpbGUvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUFpRDtBQUVqRCxtREFBNkM7QUFRN0MsMEJBQTBCO0FBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7SUFDMUIsT0FBTyxLQUFLO1NBQ1QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUM7UUFDaEMsV0FBVyxFQUFFLHNDQUFzQztLQUNwRCxDQUFDO1NBQ0QsTUFBTSxDQUFDLG1CQUF3QyxFQUFFO1FBQ2hELElBQUksRUFBRSxRQUFRO1FBQ2QsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDO1FBQ25CLFdBQVcsRUFBRSw4RUFBOEU7UUFDM0YsTUFBTSxFQUFFLENBQUMsR0FBdUIsRUFBRSxFQUFFO1lBQ2xDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtnQkFDckIsT0FBTyxHQUFHLENBQUM7YUFDWjtZQUNELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxHQUFHLGtCQUFrQixDQUFDLENBQUM7YUFDMUU7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNkLENBQUM7S0FDRixDQUFDO1NBQ0QsTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNmLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUNULHFGQUFxRjtRQUN2RixPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUEsc0JBQWEsR0FBRSxDQUFDLGFBQWEsRUFBRSxxQkFBcUIsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7S0FDdkYsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELDJCQUEyQjtBQUMzQixLQUFLLFVBQVUsT0FBTyxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxlQUFlLEVBQWlDO0lBQ25GLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxlQUFlLElBQUkscUJBQXFCLENBQUM7SUFDbEUsSUFBQSw0QkFBWSxFQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBRUQsbURBQW1EO0FBQ3RDLFFBQUEsa0JBQWtCLEdBQTJDO0lBQ3hFLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLHFCQUFxQjtJQUM5QixRQUFRLEVBQUUseUNBQXlDO0NBQ3BELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRVc2VyQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge3ZhbGlkYXRlRmlsZX0gZnJvbSAnLi92YWxpZGF0ZS1maWxlJztcblxuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUZpbGVPcHRpb25zIHtcbiAgZmlsZT86IHN0cmluZztcbiAgZmlsZUVudlZhcmlhYmxlPzogc3RyaW5nO1xuICBlcnJvcjogYm9vbGVhbjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgLm9wdGlvbignZmlsZScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUtZW52LXZhcmlhYmxlJ10sXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgfSlcbiAgICAub3B0aW9uKCdmaWxlLWVudi12YXJpYWJsZScgYXMgJ2ZpbGVFbnZWYXJpYWJsZScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUnXSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGtleSBvZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgZm9yIHRoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICBjb2VyY2U6IChhcmc6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4ge1xuICAgICAgICBpZiAoYXJnID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICByZXR1cm4gYXJnO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZpbGUgPSBwcm9jZXNzLmVudlthcmddO1xuICAgICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgIH0sXG4gICAgfSlcbiAgICAub3B0aW9uKCdlcnJvcicsIHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnV2hldGhlciBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBzaG91bGQgYmUgdHJlYXRlZCBhcyBmYWlsdXJlcyByYXRoZXIgdGhhbiBhIHdhcm5pbmcnLFxuICAgICAgZGVmYXVsdDogISFnZXRVc2VyQ29uZmlnKCkuY29tbWl0TWVzc2FnZT8uZXJyb3JPbkludmFsaWRNZXNzYWdlIHx8ICEhcHJvY2Vzcy5lbnZbJ0NJJ10sXG4gICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7ZXJyb3IsIGZpbGUsIGZpbGVFbnZWYXJpYWJsZX06IEFyZ3VtZW50czxWYWxpZGF0ZUZpbGVPcHRpb25zPikge1xuICBjb25zdCBmaWxlUGF0aCA9IGZpbGUgfHwgZmlsZUVudlZhcmlhYmxlIHx8ICcuZ2l0L0NPTU1JVF9FRElUTVNHJztcbiAgdmFsaWRhdGVGaWxlKGZpbGVQYXRoLCBlcnJvcik7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IFZhbGlkYXRlRmlsZU1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgVmFsaWRhdGVGaWxlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdwcmUtY29tbWl0LXZhbGlkYXRlJyxcbiAgZGVzY3JpYmU6ICdWYWxpZGF0ZSB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG1lc3NhZ2UnLFxufTtcbiJdfQ==