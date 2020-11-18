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
                throw new Error('No file path and commit message source provide.  Provide values via positional command ' +
                    'arguments, or via the --file-env-variable flag');
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.RestoreCommitMessageModule = {
        handler: handler,
        builder: builder,
        command: 'restore-commit-message-draft [file] [source]',
        // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
        // No describe is defiend to hide the command from the --help.
        describe: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFNSCxrSUFBOEQ7SUFROUQsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTyxLQUFLO2FBQ1AsTUFBTSxDQUFDLG1CQUF3QyxFQUFFO1lBQ2hELElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLDBFQUEwRTtnQkFDbkYsOENBQThDO2dCQUM5Qyx1REFBdUQ7U0FDNUQsQ0FBQzthQUNELFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBQyxJQUFJLEVBQUUsUUFBUSxFQUFDLENBQUM7YUFDcEMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBdUU7WUFBdEUsZUFBZSxxQkFBQSxFQUFFLElBQUksVUFBQSxFQUFFLE1BQU0sWUFBQTs7OztnQkFDbkQsMERBQTBEO2dCQUMxRCxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7b0JBQ3RCLDZDQUFvQixDQUFDLElBQUksRUFBRSxNQUF5QixDQUFDLENBQUM7b0JBQ3RELHNCQUFPO2lCQUNSO2dCQUVELDBFQUEwRTtnQkFDMUUsSUFBSSxlQUFlLEtBQUssU0FBUyxFQUFFO29CQUMzQixLQUFBLGVBQStCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFnQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLEVBQTlFLFdBQVcsUUFBQSxFQUFFLGFBQWEsUUFBQSxDQUFxRDtvQkFDdEYsSUFBSSxDQUFDLFdBQVcsRUFBRTt3QkFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBa0MsZUFBZSxzQkFBa0IsQ0FBQyxDQUFDO3FCQUN0RjtvQkFDRCw2Q0FBb0IsQ0FBQyxXQUFXLEVBQUUsYUFBZ0MsQ0FBQyxDQUFDO29CQUNwRSxzQkFBTztpQkFDUjtnQkFFRCxNQUFNLElBQUksS0FBSyxDQUNYLHlGQUF5RjtvQkFDekYsZ0RBQWdELENBQUMsQ0FBQzs7O0tBQ3ZEO0lBRUQsb0RBQW9EO0lBQ3ZDLFFBQUEsMEJBQTBCLEdBQW1EO1FBQ3hGLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSw4Q0FBOEM7UUFDdkQsa0dBQWtHO1FBQ2xHLDhEQUE4RDtRQUM5RCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Q29tbWl0TXNnU291cmNlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG5pbXBvcnQge3Jlc3RvcmVDb21taXRNZXNzYWdlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGZpbGU/OiBzdHJpbmc7XG4gIHNvdXJjZT86IHN0cmluZztcbiAgZmlsZUVudlZhcmlhYmxlPzogc3RyaW5nO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3NcbiAgICAgIC5vcHRpb24oJ2ZpbGUtZW52LXZhcmlhYmxlJyBhcyAnZmlsZUVudlZhcmlhYmxlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUga2V5IGZvciB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgd2hpY2ggaG9sZHMgdGhlIGFyZ3VtZW50cyBmb3IgdGhlXFxuJyArXG4gICAgICAgICAgICAncHJlcGFyZS1jb21taXQtbXNnIGhvb2sgYXMgZGVzY3JpYmVkIGhlcmU6XFxuJyArXG4gICAgICAgICAgICAnaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2cnXG4gICAgICB9KVxuICAgICAgLnBvc2l0aW9uYWwoJ2ZpbGUnLCB7dHlwZTogJ3N0cmluZyd9KVxuICAgICAgLnBvc2l0aW9uYWwoJ3NvdXJjZScsIHt0eXBlOiAnc3RyaW5nJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgY29tbWFuZC4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe2ZpbGVFbnZWYXJpYWJsZSwgZmlsZSwgc291cmNlfTogQXJndW1lbnRzPFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4pIHtcbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyBjb21tYW5kIGxpbmUgcGFyYW1ldGVyc1xuICBpZiAoZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZSwgc291cmNlIGFzIENvbW1pdE1zZ1NvdXJjZSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gRmlsZSBhbmQgc291cmNlIGFyZSBwcm92aWRlZCBhcyB2YWx1ZXMgaGVsZCBpbiBhbiBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgaWYgKGZpbGVFbnZWYXJpYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3QgW2ZpbGVGcm9tRW52LCBzb3VyY2VGcm9tRW52XSA9IChwcm9jZXNzLmVudltmaWxlRW52VmFyaWFibGUhXSB8fCAnJykuc3BsaXQoJyAnKTtcbiAgICBpZiAoIWZpbGVGcm9tRW52KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHtmaWxlRW52VmFyaWFibGV9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICB9XG4gICAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZUZyb21FbnYsIHNvdXJjZUZyb21FbnYgYXMgQ29tbWl0TXNnU291cmNlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnTm8gZmlsZSBwYXRoIGFuZCBjb21taXQgbWVzc2FnZSBzb3VyY2UgcHJvdmlkZS4gIFByb3ZpZGUgdmFsdWVzIHZpYSBwb3NpdGlvbmFsIGNvbW1hbmQgJyArXG4gICAgICAnYXJndW1lbnRzLCBvciB2aWEgdGhlIC0tZmlsZS1lbnYtdmFyaWFibGUgZmxhZycpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gICovXG5leHBvcnQgY29uc3QgUmVzdG9yZUNvbW1pdE1lc3NhZ2VNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdyZXN0b3JlLWNvbW1pdC1tZXNzYWdlLWRyYWZ0IFtmaWxlXSBbc291cmNlXScsXG4gIC8vIERlc2NyaXB0aW9uOiBSZXN0b3JlIGEgY29tbWl0IG1lc3NhZ2UgZHJhZnQgaWYgb25lIGhhcyBiZWVuIHNhdmVkIGZyb20gYSBmYWlsZWQgY29tbWl0IGF0dGVtcHQuXG4gIC8vIE5vIGRlc2NyaWJlIGlzIGRlZmllbmQgdG8gaGlkZSB0aGUgY29tbWFuZCBmcm9tIHRoZSAtLWhlbHAuXG4gIGRlc2NyaWJlOiBmYWxzZSxcbn07XG4iXX0=