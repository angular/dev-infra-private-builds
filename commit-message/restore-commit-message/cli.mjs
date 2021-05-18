/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { restoreCommitMessage } from './restore-commit-message';
/** Builds the command. */
function builder(yargs) {
    return yargs
        .option('file-env-variable', {
        type: 'string',
        description: 'The key for the environment variable which holds the arguments for the\n' +
            'prepare-commit-msg hook as described here:\n' +
            'https://git-scm.com/docs/githooks#_prepare_commit_msg'
    })
        .positional('file', { type: 'string' })
        .positional('source', { type: 'string' });
}
/** Handles the command. */
function handler({ fileEnvVariable, file, source }) {
    return __awaiter(this, void 0, void 0, function* () {
        // File and source are provided as command line parameters
        if (file !== undefined) {
            restoreCommitMessage(file, source);
            return;
        }
        // File and source are provided as values held in an environment variable.
        if (fileEnvVariable !== undefined) {
            const [fileFromEnv, sourceFromEnv] = (process.env[fileEnvVariable] || '').split(' ');
            if (!fileFromEnv) {
                throw new Error(`Provided environment variable "${fileEnvVariable}" was not found.`);
            }
            restoreCommitMessage(fileFromEnv, sourceFromEnv);
            return;
        }
        throw new Error('No file path and commit message source provide. Provide values via positional command ' +
            'arguments, or via the --file-env-variable flag');
    });
}
/** yargs command module describing the command. */
export const RestoreCommitMessageModule = {
    handler,
    builder,
    command: 'restore-commit-message-draft [file] [source]',
    // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
    // No describe is defiend to hide the command from the --help.
    describe: false,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFNSCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQVE5RCwwQkFBMEI7QUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztJQUMxQixPQUFPLEtBQUs7U0FDUCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7UUFDaEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsMEVBQTBFO1lBQ25GLDhDQUE4QztZQUM5Qyx1REFBdUQ7S0FDNUQsQ0FBQztTQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7U0FDcEMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0FBQzlDLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBeUM7O1FBQzVGLDBEQUEwRDtRQUMxRCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7WUFDdEIsb0JBQW9CLENBQUMsSUFBSSxFQUFFLE1BQXlCLENBQUMsQ0FBQztZQUN0RCxPQUFPO1NBQ1I7UUFFRCwwRUFBMEU7UUFDMUUsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTtnQkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsZUFBZSxrQkFBa0IsQ0FBQyxDQUFDO2FBQ3RGO1lBQ0Qsb0JBQW9CLENBQUMsV0FBVyxFQUFFLGFBQWdDLENBQUMsQ0FBQztZQUNwRSxPQUFPO1NBQ1I7UUFFRCxNQUFNLElBQUksS0FBSyxDQUNYLHdGQUF3RjtZQUN4RixnREFBZ0QsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FBQTtBQUVELG1EQUFtRDtBQUNuRCxNQUFNLENBQUMsTUFBTSwwQkFBMEIsR0FBbUQ7SUFDeEYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsOENBQThDO0lBQ3ZELGtHQUFrRztJQUNsRyw4REFBOEQ7SUFDOUQsUUFBUSxFQUFFLEtBQUs7Q0FDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG5pbXBvcnQge3Jlc3RvcmVDb21taXRNZXNzYWdlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIHNvdXJjZT86IHN0cmluZztcbiAgZmlsZUVudlZhcmlhYmxlPzogc3RyaW5nO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3NcbiAgICAgIC5vcHRpb24oJ2ZpbGUtZW52LXZhcmlhYmxlJyBhcyAnZmlsZUVudlZhcmlhYmxlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUga2V5IGZvciB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgd2hpY2ggaG9sZHMgdGhlIGFyZ3VtZW50cyBmb3IgdGhlXFxuJyArXG4gICAgICAgICAgICAncHJlcGFyZS1jb21taXQtbXNnIGhvb2sgYXMgZGVzY3JpYmVkIGhlcmU6XFxuJyArXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2cnXG4gICAgICB9KVxuICAgICAgLnBvc2l0aW9uYWwoJ2ZpbGUnLCB7dHlwZTogJ3N0cmluZyd9KVxuICAgICAgLnBvc2l0aW9uYWwoJ3NvdXJjZScsIHt0eXBlOiAnc3RyaW5nJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2ZpbGVFbnZWYXJpYWJsZSwgZmlsZSwgc291cmNlfTogQXJndW1lbnRzPFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4pIHtcbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyBjb21tYW5kIGxpbmUgcGFyYW1ldGVyc1xuICBpZiAoZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZSwgc291cmNlIGFzIENvbW1pdE1zZ1NvdXJjZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyB2YWx1ZXMgaGVsZCBpbiBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgaWYgKGZpbGVFbnZWYXJpYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgW2ZpbGVGcm9tRW52LCBzb3VyY2VGcm9tRW52XSA9IChwcm9jZXNzLmVudltmaWxlRW52VmFyaWFibGUhXSB8fCAnJykuc3BsaXQoJyAnKTtcbiAgICBpZiAoIWZpbGVGcm9tRW52KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHtmaWxlRW52VmFyaWFibGV9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICB9XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZUZyb21FbnYsIHNvdXJjZUZyb21FbnYgYXMgQ29tbWl0TXNnU291cmNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnTm8gZmlsZSBwYXRoIGFuZCBjb21taXQgbWVzc2FnZSBzb3VyY2UgcHJvdmlkZS4gUHJvdmlkZSB2YWx1ZXMgdmlhIHBvc2l0aW9uYWwgY29tbWFuZCAnICtcbiAgICAgICdhcmd1bWVudHMsIG9yIHZpYSB0aGUgLS1maWxlLWVudi12YXJpYWJsZSBmbGFnJyk7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IFJlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZXN0b3JlQ29tbWl0TWVzc2FnZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCBbZmlsZV0gW3NvdXJjZV0nLFxuICAvLyBEZXNjcmlwdGlvbjogUmVzdG9yZSBhIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGlmIG9uZSBoYXMgYmVlbiBzYXZlZCBmcm9tIGEgZmFpbGVkIGNvbW1pdCBhdHRlbXB0LlxuICAvLyBObyBkZXNjcmliZSBpcyBkZWZpZW5kIHRvIGhpZGUgdGhlIGNvbW1hbmQgZnJvbSB0aGUgLS1oZWxwLlxuICBkZXNjcmliZTogZmFsc2UsXG59O1xuIl19