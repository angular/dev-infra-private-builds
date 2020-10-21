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
        return yargs.option('file-env-variable', {
            type: 'string',
            array: true,
            demandOption: true,
            description: 'The key for the environment variable which holds the arguments for the\n' +
                'prepare-commit-msg hook as described here:\n' +
                'https://git-scm.com/docs/githooks#_prepare_commit_msg',
            coerce: function (arg) {
                var _a = tslib_1.__read((process.env[arg] || '').split(' '), 2), file = _a[0], source = _a[1];
                if (!file) {
                    throw new Error("Provided environment variable \"" + arg + "\" was not found.");
                }
                return [file, source];
            },
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var fileEnvVariable = _a.fileEnvVariable;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                restore_commit_message_1.restoreCommitMessage(fileEnvVariable[0], fileEnvVariable[1]);
                return [2 /*return*/];
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.RestoreCommitMessageModule = {
        handler: handler,
        builder: builder,
        command: 'restore-commit-message-draft',
        // Description: Restore a commit message draft if one has been saved from a failed commit attempt.
        // No describe is defiend to hide the command from the --help.
        describe: false,
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFNSCxrSUFBOEQ7SUFNOUQsMEJBQTBCO0lBQzFCLFNBQVMsT0FBTyxDQUFDLEtBQVc7UUFDMUIsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLG1CQUF3QyxFQUFFO1lBQzVELElBQUksRUFBRSxRQUFRO1lBQ2QsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsSUFBSTtZQUNsQixXQUFXLEVBQUUsMEVBQTBFO2dCQUNuRiw4Q0FBOEM7Z0JBQzlDLHVEQUF1RDtZQUMzRCxNQUFNLEVBQUUsVUFBQSxHQUFHO2dCQUNILElBQUEsS0FBQSxlQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLEVBQW5ELElBQUksUUFBQSxFQUFFLE1BQU0sUUFBdUMsQ0FBQztnQkFDM0QsSUFBSSxDQUFDLElBQUksRUFBRTtvQkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFrQyxHQUFHLHNCQUFrQixDQUFDLENBQUM7aUJBQzFFO2dCQUNELE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDeEIsQ0FBQztTQUNGLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCwyQkFBMkI7SUFDM0IsU0FBZSxPQUFPLENBQUMsRUFBeUQ7WUFBeEQsZUFBZSxxQkFBQTs7O2dCQUNyQyw2Q0FBb0IsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLENBQUMsQ0FBb0IsQ0FBQyxDQUFDOzs7O0tBQ2pGO0lBRUQsb0RBQW9EO0lBQ3ZDLFFBQUEsMEJBQTBCLEdBQW1EO1FBQ3hGLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSw4QkFBOEI7UUFDdkMsa0dBQWtHO1FBQ2xHLDhEQUE4RDtRQUM5RCxRQUFRLEVBQUUsS0FBSztLQUNoQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Q29tbWl0TXNnU291cmNlfSBmcm9tICcuLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG5pbXBvcnQge3Jlc3RvcmVDb21taXRNZXNzYWdlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGZpbGVFbnZWYXJpYWJsZTogc3RyaW5nW107XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJncy5vcHRpb24oJ2ZpbGUtZW52LXZhcmlhYmxlJyBhcyAnZmlsZUVudlZhcmlhYmxlJywge1xuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGFycmF5OiB0cnVlLFxuICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICBkZXNjcmlwdGlvbjogJ1RoZSBrZXkgZm9yIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB3aGljaCBob2xkcyB0aGUgYXJndW1lbnRzIGZvciB0aGVcXG4nICtcbiAgICAgICAgJ3ByZXBhcmUtY29tbWl0LW1zZyBob29rIGFzIGRlc2NyaWJlZCBoZXJlOlxcbicgK1xuICAgICAgICAnaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2cnLFxuICAgIGNvZXJjZTogYXJnID0+IHtcbiAgICAgIGNvbnN0IFtmaWxlLCBzb3VyY2VdID0gKHByb2Nlc3MuZW52W2FyZ10gfHwgJycpLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBQcm92aWRlZCBlbnZpcm9ubWVudCB2YXJpYWJsZSBcIiR7YXJnfVwiIHdhcyBub3QgZm91bmQuYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gW2ZpbGUsIHNvdXJjZV07XG4gICAgfSxcbiAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7ZmlsZUVudlZhcmlhYmxlfTogQXJndW1lbnRzPFJlc3RvcmVDb21taXRNZXNzYWdlT3B0aW9ucz4pIHtcbiAgcmVzdG9yZUNvbW1pdE1lc3NhZ2UoZmlsZUVudlZhcmlhYmxlWzBdLCBmaWxlRW52VmFyaWFibGVbMV0gYXMgQ29tbWl0TXNnU291cmNlKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICAqL1xuZXhwb3J0IGNvbnN0IFJlc3RvcmVDb21taXRNZXNzYWdlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZXN0b3JlQ29tbWl0TWVzc2FnZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCcsXG4gIC8vIERlc2NyaXB0aW9uOiBSZXN0b3JlIGEgY29tbWl0IG1lc3NhZ2UgZHJhZnQgaWYgb25lIGhhcyBiZWVuIHNhdmVkIGZyb20gYSBmYWlsZWQgY29tbWl0IGF0dGVtcHQuXG4gIC8vIE5vIGRlc2NyaWJlIGlzIGRlZmllbmQgdG8gaGlkZSB0aGUgY29tbWFuZCBmcm9tIHRoZSAtLWhlbHAuXG4gIGRlc2NyaWJlOiBmYWxzZSxcbn07XG4iXX0=