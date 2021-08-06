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
        restore_commit_message_1.restoreCommitMessage(file, source);
        return;
    }
    // File and source are provided as values held in an environment variable.
    if (fileEnvVariable !== undefined) {
        const [fileFromEnv, sourceFromEnv] = (process.env[fileEnvVariable] || '').split(' ');
        if (!fileFromEnv) {
            throw new Error(`Provided environment variable "${fileEnvVariable}" was not found.`);
        }
        restore_commit_message_1.restoreCommitMessage(fileFromEnv, sourceFromEnv);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQU1ILHFFQUE4RDtBQVE5RCwwQkFBMEI7QUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztJQUMxQixPQUFPLEtBQUs7U0FDVCxNQUFNLENBQUMsbUJBQXdDLEVBQUU7UUFDaEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQ1QsMEVBQTBFO1lBQzFFLDhDQUE4QztZQUM5Qyx1REFBdUQ7S0FDMUQsQ0FBQztTQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7U0FDcEMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUF5QztJQUM1RiwwREFBMEQ7SUFDMUQsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1FBQ3RCLDZDQUFvQixDQUFDLElBQUksRUFBRSxNQUF5QixDQUFDLENBQUM7UUFDdEQsT0FBTztLQUNSO0lBRUQsMEVBQTBFO0lBQzFFLElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRTtRQUNqQyxNQUFNLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RGLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsZUFBZSxrQkFBa0IsQ0FBQyxDQUFDO1NBQ3RGO1FBQ0QsNkNBQW9CLENBQUMsV0FBVyxFQUFFLGFBQWdDLENBQUMsQ0FBQztRQUNwRSxPQUFPO0tBQ1I7SUFFRCxNQUFNLElBQUksS0FBSyxDQUNiLHdGQUF3RjtRQUN0RixnREFBZ0QsQ0FDbkQsQ0FBQztBQUNKLENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSwwQkFBMEIsR0FBbUQ7SUFDeEYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsOENBQThDO0lBQ3ZELGtHQUFrRztJQUNsRyw4REFBOEQ7SUFDOUQsUUFBUSxFQUFFLEtBQUs7Q0FDaEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG5pbXBvcnQge3Jlc3RvcmVDb21taXRNZXNzYWdlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIHNvdXJjZT86IHN0cmluZztcbiAgZmlsZUVudlZhcmlhYmxlPzogc3RyaW5nO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3NcbiAgICAub3B0aW9uKCdmaWxlLWVudi12YXJpYWJsZScgYXMgJ2ZpbGVFbnZWYXJpYWJsZScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICdUaGUga2V5IGZvciB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgd2hpY2ggaG9sZHMgdGhlIGFyZ3VtZW50cyBmb3IgdGhlXFxuJyArXG4gICAgICAgICdwcmVwYXJlLWNvbW1pdC1tc2cgaG9vayBhcyBkZXNjcmliZWQgaGVyZTpcXG4nICtcbiAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJyxcbiAgICB9KVxuICAgIC5wb3NpdGlvbmFsKCdmaWxlJywge3R5cGU6ICdzdHJpbmcnfSlcbiAgICAucG9zaXRpb25hbCgnc291cmNlJywge3R5cGU6ICdzdHJpbmcnfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7ZmlsZUVudlZhcmlhYmxlLCBmaWxlLCBzb3VyY2V9OiBBcmd1bWVudHM8UmVzdG9yZUNvbW1pdE1lc3NhZ2VPcHRpb25zPikge1xuICAvLyBGaWxlIGFuZCBzb3VyY2UgYXJlIHByb3ZpZGVkIGFzIGNvbW1hbmQgbGluZSBwYXJhbWV0ZXJzXG4gIGlmIChmaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlLCBzb3VyY2UgYXMgQ29tbWl0TXNnU291cmNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGaWxlIGFuZCBzb3VyY2UgYXJlIHByb3ZpZGVkIGFzIHZhbHVlcyBoZWxkIGluIGFuIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICBpZiAoZmlsZUVudlZhcmlhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBbZmlsZUZyb21FbnYsIHNvdXJjZUZyb21FbnZdID0gKHByb2Nlc3MuZW52W2ZpbGVFbnZWYXJpYWJsZSFdIHx8ICcnKS5zcGxpdCgnICcpO1xuICAgIGlmICghZmlsZUZyb21FbnYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2ZpbGVFbnZWYXJpYWJsZX1cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgIH1cbiAgICByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlRnJvbUVudiwgc291cmNlRnJvbUVudiBhcyBDb21taXRNc2dTb3VyY2UpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAnTm8gZmlsZSBwYXRoIGFuZCBjb21taXQgbWVzc2FnZSBzb3VyY2UgcHJvdmlkZS4gUHJvdmlkZSB2YWx1ZXMgdmlhIHBvc2l0aW9uYWwgY29tbWFuZCAnICtcbiAgICAgICdhcmd1bWVudHMsIG9yIHZpYSB0aGUgLS1maWxlLWVudi12YXJpYWJsZSBmbGFnJyxcbiAgKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgUmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdyZXN0b3JlLWNvbW1pdC1tZXNzYWdlLWRyYWZ0IFtmaWxlXSBbc291cmNlXScsXG4gIC8vIERlc2NyaXB0aW9uOiBSZXN0b3JlIGEgY29tbWl0IG1lc3NhZ2UgZHJhZnQgaWYgb25lIGhhcyBiZWVuIHNhdmVkIGZyb20gYSBmYWlsZWQgY29tbWl0IGF0dGVtcHQuXG4gIC8vIE5vIGRlc2NyaWJlIGlzIGRlZmllbmQgdG8gaGlkZSB0aGUgY29tbWFuZCBmcm9tIHRoZSAtLWhlbHAuXG4gIGRlc2NyaWJlOiBmYWxzZSxcbn07XG4iXX0=