"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestoreCommitMessageModule = void 0;
const restore_commit_message_1 = require("./restore-commit-message");
/** Builds the command. */
function builder(yargs) {
    return yargs
        .option('file-env-variable', {
        type: 'string',
        description: 'The key for the environment variable which holds the arguments for the\n' +
            'prepare-commit-msg hook as described here:\n' +
            'https://git-scm.com/docs/githooks#_prepare_commit_msg',
    })
        .positional('file', { type: 'string' })
        .positional('source', { type: 'string' });
}
/** Handles the command. */
async function handler({ fileEnvVariable, file, source }) {
    // File and source are provided as command line parameters
    if (file !== undefined) {
        (0, restore_commit_message_1.restoreCommitMessage)(file, source);
        return;
    }
    // File and source are provided as values held in an environment variable.
    if (fileEnvVariable !== undefined) {
        const [fileFromEnv, sourceFromEnv] = (process.env[fileEnvVariable] || '').split(' ');
        if (!fileFromEnv) {
            throw new Error(`Provided environment variable "${fileEnvVariable}" was not found.`);
        }
        (0, restore_commit_message_1.restoreCommitMessage)(fileFromEnv, sourceFromEnv);
        return;
    }
    throw new Error('No file path and commit message source provide. Provide values via positional command ' +
        'arguments, or via the --file-env-variable flag');
}
/** yargs command module describing the command. */
exports.RestoreCommitMessageModule = {
    handler,
    builder,
    command: 'restore-commit-message-draft [file] [source]',
    // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
    // No describe is defiend to hide the command from the --help.
    describe: false,
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQU1ILHFFQUE4RDtBQVE5RCwwQkFBMEI7QUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztJQUMxQixPQUFPLEtBQUs7U0FDVCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7UUFDaEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQ1QsMEVBQTBFO1lBQzFFLDhDQUE4QztZQUM5Qyx1REFBdUQ7S0FDMUQsQ0FBQztTQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7U0FDcEMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUF5QztJQUM1RiwwREFBMEQ7SUFDMUQsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3RCLElBQUEsNkNBQW9CLEVBQUMsSUFBSSxFQUFFLE1BQXlCLENBQUMsQ0FBQztRQUN0RCxPQUFPO0tBQ1I7SUFFRCwwRUFBMEU7SUFDMUUsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO1FBQ2pDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxlQUFlLGtCQUFrQixDQUFDLENBQUM7U0FDdEY7UUFDRCxJQUFBLDZDQUFvQixFQUFDLFdBQVcsRUFBRSxhQUFnQyxDQUFDLENBQUM7UUFDcEUsT0FBTztLQUNSO0lBRUQsTUFBTSxJQUFJLEtBQUssQ0FDYix3RkFBd0Y7UUFDdEYsZ0RBQWdELENBQ25ELENBQUM7QUFDSixDQUFDO0FBRUQsbURBQW1EO0FBQ3RDLFFBQUEsMEJBQTBCLEdBQW1EO0lBQ3hGLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDhDQUE4QztJQUN2RCxrR0FBa0c7SUFDbEcsOERBQThEO0lBQzlELFFBQVEsRUFBRSxLQUFLO0NBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtDb21taXRNc2dTb3VyY2V9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2Utc291cmNlJztcblxuaW1wb3J0IHtyZXN0b3JlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlJztcblxuZXhwb3J0IGludGVyZmFjZSBSZXN0b3JlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBmaWxlPzogc3RyaW5nO1xuICBzb3VyY2U/OiBzdHJpbmc7XG4gIGZpbGVFbnZWYXJpYWJsZT86IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgLm9wdGlvbignZmlsZS1lbnYtdmFyaWFibGUnIGFzICdmaWxlRW52VmFyaWFibGUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAnVGhlIGtleSBmb3IgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHdoaWNoIGhvbGRzIHRoZSBhcmd1bWVudHMgZm9yIHRoZVxcbicgK1xuICAgICAgICAncHJlcGFyZS1jb21taXQtbXNnIGhvb2sgYXMgZGVzY3JpYmVkIGhlcmU6XFxuJyArXG4gICAgICAgICdodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0aG9va3MjX3ByZXBhcmVfY29tbWl0X21zZycsXG4gICAgfSlcbiAgICAucG9zaXRpb25hbCgnZmlsZScsIHt0eXBlOiAnc3RyaW5nJ30pXG4gICAgLnBvc2l0aW9uYWwoJ3NvdXJjZScsIHt0eXBlOiAnc3RyaW5nJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2ZpbGVFbnZWYXJpYWJsZSwgZmlsZSwgc291cmNlfTogQXJndW1lbnRzPFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4pIHtcbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyBjb21tYW5kIGxpbmUgcGFyYW1ldGVyc1xuICBpZiAoZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZSwgc291cmNlIGFzIENvbW1pdE1zZ1NvdXJjZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyB2YWx1ZXMgaGVsZCBpbiBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgaWYgKGZpbGVFbnZWYXJpYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgW2ZpbGVGcm9tRW52LCBzb3VyY2VGcm9tRW52XSA9IChwcm9jZXNzLmVudltmaWxlRW52VmFyaWFibGUhXSB8fCAnJykuc3BsaXQoJyAnKTtcbiAgICBpZiAoIWZpbGVGcm9tRW52KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHtmaWxlRW52VmFyaWFibGV9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICB9XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZUZyb21FbnYsIHNvdXJjZUZyb21FbnYgYXMgQ29tbWl0TXNnU291cmNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgJ05vIGZpbGUgcGF0aCBhbmQgY29tbWl0IG1lc3NhZ2Ugc291cmNlIHByb3ZpZGUuIFByb3ZpZGUgdmFsdWVzIHZpYSBwb3NpdGlvbmFsIGNvbW1hbmQgJyArXG4gICAgICAnYXJndW1lbnRzLCBvciB2aWEgdGhlIC0tZmlsZS1lbnYtdmFyaWFibGUgZmxhZycsXG4gICk7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IFJlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZXN0b3JlQ29tbWl0TWVzc2FnZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCBbZmlsZV0gW3NvdXJjZV0nLFxuICAvLyBEZXNjcmlwdGlvbjogUmVzdG9yZSBhIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGlmIG9uZSBoYXMgYmVlbiBzYXZlZCBmcm9tIGEgZmFpbGVkIGNvbW1pdCBhdHRlbXB0LlxuICAvLyBObyBkZXNjcmliZSBpcyBkZWZpZW5kIHRvIGhpZGUgdGhlIGNvbW1hbmQgZnJvbSB0aGUgLS1oZWxwLlxuICBkZXNjcmliZTogZmFsc2UsXG59O1xuIl19