/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/restore-commit-message/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/commit-message/restore-commit-message/restore-commit-message"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RestoreCommitMessageModule = void 0;
    var tslib_1 = require("tslib");
    var restore_commit_message_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message/restore-commit-message");
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
    function handler(_a) {
        var fileEnvVariable = _a.fileEnvVariable, file = _a.file, source = _a.source;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _b, fileFromEnv, sourceFromEnv;
            return tslib_1.__generator(this, function (_c) {
                // File and source are provided as command line parameters
                if (file !== undefined) {
                    restore_commit_message_1.restoreCommitMessage(file, source);
                    return [2 /*return*/];
                }
                // File and source are provided as values held in an environment variable.
                if (fileEnvVariable !== undefined) {
                    _b = tslib_1.__read((process.env[fileEnvVariable] || '').split(' '), 2), fileFromEnv = _b[0], sourceFromEnv = _b[1];
                    if (!fileFromEnv) {
                        throw new Error("Provided environment variable \"" + fileEnvVariable + "\" was not found.");
                    }
                    restore_commit_message_1.restoreCommitMessage(fileFromEnv, sourceFromEnv);
                    return [2 /*return*/];
                }
                throw new Error('No file path and commit message source provide. Provide values via positional command ' +
                    'arguments, or via the --file-env-variable flag');
            });
        });
    }
    /** yargs command module describing the command. */
    exports.RestoreCommitMessageModule = {
        handler: handler,
        builder: builder,
        command: 'restore-commit-message-draft [file] [source]',
        // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
        // No describe is defiend to hide the command from the --help.
        describe: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFNSCxrSUFBOEQ7SUFROUQsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTyxLQUFLO2FBQ1AsTUFBTSxDQUFDLG1CQUF3QyxFQUFFO1lBQ2hELElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDBFQUEwRTtnQkFDbkYsOENBQThDO2dCQUM5Qyx1REFBdUQ7U0FDNUQsQ0FBQzthQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7YUFDcEMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBdUU7WUFBdEUsZUFBZSxxQkFBQSxFQUFFLElBQUksVUFBQSxFQUFFLE1BQU0sWUFBQTs7OztnQkFDbkQsMERBQTBEO2dCQUMxRCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3RCLDZDQUFvQixDQUFDLElBQUksRUFBRSxNQUF5QixDQUFDLENBQUM7b0JBQ3RELHNCQUFPO2lCQUNSO2dCQUVELDBFQUEwRTtnQkFDMUUsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO29CQUMzQixLQUFBLGVBQStCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLEVBQTlFLFdBQVcsUUFBQSxFQUFFLGFBQWEsUUFBQSxDQUFxRDtvQkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBa0MsZUFBZSxzQkFBa0IsQ0FBQyxDQUFDO3FCQUN0RjtvQkFDRCw2Q0FBb0IsQ0FBQyxXQUFXLEVBQUUsYUFBZ0MsQ0FBQyxDQUFDO29CQUNwRSxzQkFBTztpQkFDUjtnQkFFRCxNQUFNLElBQUksS0FBSyxDQUNYLHdGQUF3RjtvQkFDeEYsZ0RBQWdELENBQUMsQ0FBQzs7O0tBQ3ZEO0lBRUQsbURBQW1EO0lBQ3RDLFFBQUEsMEJBQTBCLEdBQW1EO1FBQ3hGLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSw4Q0FBOEM7UUFDdkQsa0dBQWtHO1FBQ2xHLDhEQUE4RDtRQUM5RCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Q29tbWl0TXNnU291cmNlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlLXNvdXJjZSc7XG5cbmltcG9ydCB7cmVzdG9yZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcmVzdG9yZS1jb21taXQtbWVzc2FnZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdG9yZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZmlsZT86IHN0cmluZztcbiAgc291cmNlPzogc3RyaW5nO1xuICBmaWxlRW52VmFyaWFibGU/OiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLm9wdGlvbignZmlsZS1lbnYtdmFyaWFibGUnIGFzICdmaWxlRW52VmFyaWFibGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBrZXkgZm9yIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB3aGljaCBob2xkcyB0aGUgYXJndW1lbnRzIGZvciB0aGVcXG4nICtcbiAgICAgICAgICAgICdwcmVwYXJlLWNvbW1pdC1tc2cgaG9vayBhcyBkZXNjcmliZWQgaGVyZTpcXG4nICtcbiAgICAgICAgICAgICdodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0aG9va3MjX3ByZXBhcmVfY29tbWl0X21zZydcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgnZmlsZScsIHt0eXBlOiAnc3RyaW5nJ30pXG4gICAgICAucG9zaXRpb25hbCgnc291cmNlJywge3R5cGU6ICdzdHJpbmcnfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7ZmlsZUVudlZhcmlhYmxlLCBmaWxlLCBzb3VyY2V9OiBBcmd1bWVudHM8UmVzdG9yZUNvbW1pdE1lc3NhZ2VPcHRpb25zPikge1xuICAvLyBGaWxlIGFuZCBzb3VyY2UgYXJlIHByb3ZpZGVkIGFzIGNvbW1hbmQgbGluZSBwYXJhbWV0ZXJzXG4gIGlmIChmaWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlLCBzb3VyY2UgYXMgQ29tbWl0TXNnU291cmNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBGaWxlIGFuZCBzb3VyY2UgYXJlIHByb3ZpZGVkIGFzIHZhbHVlcyBoZWxkIGluIGFuIGVudmlyb25tZW50IHZhcmlhYmxlLlxuICBpZiAoZmlsZUVudlZhcmlhYmxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBbZmlsZUZyb21FbnYsIHNvdXJjZUZyb21FbnZdID0gKHByb2Nlc3MuZW52W2ZpbGVFbnZWYXJpYWJsZSFdIHx8ICcnKS5zcGxpdCgnICcpO1xuICAgIGlmICghZmlsZUZyb21FbnYpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2ZpbGVFbnZWYXJpYWJsZX1cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgIH1cbiAgICByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlRnJvbUVudiwgc291cmNlRnJvbUVudiBhcyBDb21taXRNc2dTb3VyY2UpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdObyBmaWxlIHBhdGggYW5kIGNvbW1pdCBtZXNzYWdlIHNvdXJjZSBwcm92aWRlLiBQcm92aWRlIHZhbHVlcyB2aWEgcG9zaXRpb25hbCBjb21tYW5kICcgK1xuICAgICAgJ2FyZ3VtZW50cywgb3IgdmlhIHRoZSAtLWZpbGUtZW52LXZhcmlhYmxlIGZsYWcnKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgUmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdyZXN0b3JlLWNvbW1pdC1tZXNzYWdlLWRyYWZ0IFtmaWxlXSBbc291cmNlXScsXG4gIC8vIERlc2NyaXB0aW9uOiBSZXN0b3JlIGEgY29tbWl0IG1lc3NhZ2UgZHJhZnQgaWYgb25lIGhhcyBiZWVuIHNhdmVkIGZyb20gYSBmYWlsZWQgY29tbWl0IGF0dGVtcHQuXG4gIC8vIE5vIGRlc2NyaWJlIGlzIGRlZmllbmQgdG8gaGlkZSB0aGUgY29tbWFuZCBmcm9tIHRoZSAtLWhlbHAuXG4gIGRlc2NyaWJlOiBmYWxzZSxcbn07XG4iXX0=