(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "tslib", "yargs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/restore-commit-message", "@angular/dev-infra-private/commit-message/validate-file", "@angular/dev-infra-private/commit-message/validate-range"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var restore_commit_message_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message");
    var validate_file_1 = require("@angular/dev-infra-private/commit-message/validate-file");
    var validate_range_1 = require("@angular/dev-infra-private/commit-message/validate-range");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        return localYargs.help()
            .strict()
            .command('restore-commit-message-draft', false, {
            'file-env-variable': {
                type: 'string',
                conflicts: ['file'],
                required: true,
                description: 'The key for the environment variable which holds the arguments for the ' +
                    'prepare-commit-msg hook as described here: ' +
                    'https://git-scm.com/docs/githooks#_prepare_commit_msg',
                coerce: function (arg) {
                    var _a = tslib_1.__read((process.env[arg] || '').split(' '), 2), file = _a[0], source = _a[1];
                    if (!file) {
                        throw new Error("Provided environment variable \"" + arg + "\" was not found.");
                    }
                    return [file, source];
                },
            }
        }, function (args) {
            restore_commit_message_1.restoreCommitMessage(args.fileEnvVariable[0], args.fileEnvVariable[1]);
        })
            .command('pre-commit-validate', 'Validate the most recent commit message', {
            'file': {
                type: 'string',
                conflicts: ['file-env-variable'],
                description: 'The path of the commit message file.',
            },
            'file-env-variable': {
                type: 'string',
                conflicts: ['file'],
                description: 'The key of the environment variable for the path of the commit message file.',
                coerce: function (arg) {
                    var file = process.env[arg];
                    if (!file) {
                        throw new Error("Provided environment variable \"" + arg + "\" was not found.");
                    }
                    return file;
                },
            }
        }, function (args) {
            var file = args.file || args.fileEnvVariable || '.git/COMMIT_EDITMSG';
            validate_file_1.validateFile(file);
        })
            .command('validate-range', 'Validate a range of commit messages', {
            'range': {
                description: 'The range of commits to check, e.g. --range abc123..xyz456',
                demandOption: '  A range must be provided, e.g. --range abc123..xyz456',
                type: 'string',
                requiresArg: true,
            },
        }, function (argv) {
            // If on CI, and not pull request number is provided, assume the branch
            // being run on is an upstream branch.
            if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
                console_1.info("Since valid commit messages are enforced by PR linting on CI, we do not");
                console_1.info("need to validate commit messages on CI runs on upstream branches.");
                console_1.info();
                console_1.info("Skipping check of provided commit range");
                return;
            }
            validate_range_1.validateCommitRange(argv.range);
        });
    }
    exports.buildCommitMessageParser = buildCommitMessageParser;
    if (require.main == module) {
        buildCommitMessageParser(yargs).parse();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLG9FQUFzQztJQUV0QywyR0FBOEQ7SUFDOUQseUZBQTZDO0lBQzdDLDJGQUFxRDtJQUVyRCx3REFBd0Q7SUFDeEQsU0FBZ0Isd0JBQXdCLENBQUMsVUFBc0I7UUFDN0QsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLE9BQU8sQ0FDSiw4QkFBOEIsRUFBRSxLQUFLLEVBQUU7WUFDckMsbUJBQW1CLEVBQUU7Z0JBQ25CLElBQUksRUFBRSxRQUFRO2dCQUNkLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsV0FBVyxFQUNQLHlFQUF5RTtvQkFDekUsNkNBQTZDO29CQUM3Qyx1REFBdUQ7Z0JBQzNELE1BQU0sRUFBRSxVQUFBLEdBQUc7b0JBQ0gsSUFBQSxLQUFBLGVBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUEsRUFBbkQsSUFBSSxRQUFBLEVBQUUsTUFBTSxRQUF1QyxDQUFDO29CQUMzRCxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztxQkFDMUU7b0JBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEIsQ0FBQzthQUNGO1NBQ0YsRUFDRCxVQUFBLElBQUk7WUFDRiw2Q0FBb0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN6RSxDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0oscUJBQXFCLEVBQUUseUNBQXlDLEVBQUU7WUFDaEUsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO2dCQUNoQyxXQUFXLEVBQUUsc0NBQXNDO2FBQ3BEO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CLElBQUksRUFBRSxRQUFRO2dCQUNkLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsV0FBVyxFQUNQLDhFQUE4RTtnQkFDbEYsTUFBTSxFQUFFLFVBQUEsR0FBRztvQkFDVCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztxQkFDMUU7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQzthQUNGO1NBQ0YsRUFDRCxVQUFBLElBQUk7WUFDRixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUkscUJBQXFCLENBQUM7WUFDeEUsNEJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osZ0JBQWdCLEVBQUUscUNBQXFDLEVBQUU7WUFDdkQsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSw0REFBNEQ7Z0JBQ3pFLFlBQVksRUFBRSx5REFBeUQ7Z0JBQ3ZFLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1NBQ0YsRUFDRCxVQUFBLElBQUk7WUFDRix1RUFBdUU7WUFDdkUsc0NBQXNDO1lBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxFQUFFO2dCQUNuRSxjQUFJLENBQUMseUVBQXlFLENBQUMsQ0FBQztnQkFDaEYsY0FBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7Z0JBQzFFLGNBQUksRUFBRSxDQUFDO2dCQUNQLGNBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPO2FBQ1I7WUFDRCxvQ0FBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBdkVELDREQXVFQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7UUFDMUIsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDekMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCAqIGFzIHlhcmdzIGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtyZXN0b3JlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7dmFsaWRhdGVGaWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUnO1xuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdFJhbmdlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjb21taXQtbWVzc2FnZSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UtZHJhZnQnLCBmYWxzZSwge1xuICAgICAgICAgICAgJ2ZpbGUtZW52LXZhcmlhYmxlJzoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUnXSxcbiAgICAgICAgICAgICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1RoZSBrZXkgZm9yIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSB3aGljaCBob2xkcyB0aGUgYXJndW1lbnRzIGZvciB0aGUgJyArXG4gICAgICAgICAgICAgICAgICAncHJlcGFyZS1jb21taXQtbXNnIGhvb2sgYXMgZGVzY3JpYmVkIGhlcmU6ICcgK1xuICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJyxcbiAgICAgICAgICAgICAgY29lcmNlOiBhcmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtmaWxlLCBzb3VyY2VdID0gKHByb2Nlc3MuZW52W2FyZ10gfHwgJycpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaWxlLCBzb3VyY2VdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJncyA9PiB7XG4gICAgICAgICAgICByZXN0b3JlQ29tbWl0TWVzc2FnZShhcmdzLmZpbGVFbnZWYXJpYWJsZVswXSwgYXJncy5maWxlRW52VmFyaWFibGVbMV0pO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncHJlLWNvbW1pdC12YWxpZGF0ZScsICdWYWxpZGF0ZSB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG1lc3NhZ2UnLCB7XG4gICAgICAgICAgICAnZmlsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlLWVudi12YXJpYWJsZSddLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2ZpbGUtZW52LXZhcmlhYmxlJzoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAnVGhlIGtleSBvZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgZm9yIHRoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICAgICAgICAgIGNvZXJjZTogYXJnID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gcHJvY2Vzcy5lbnZbYXJnXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2FyZ31cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGFyZ3MuZmlsZSB8fCBhcmdzLmZpbGVFbnZWYXJpYWJsZSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gICAgICAgICAgICB2YWxpZGF0ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICd2YWxpZGF0ZS1yYW5nZScsICdWYWxpZGF0ZSBhIHJhbmdlIG9mIGNvbW1pdCBtZXNzYWdlcycsIHtcbiAgICAgICAgICAgICdyYW5nZSc6IHtcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmFuZ2Ugb2YgY29tbWl0cyB0byBjaGVjaywgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiAnICBBIHJhbmdlIG11c3QgYmUgcHJvdmlkZWQsIGUuZy4gLS1yYW5nZSBhYmMxMjMuLnh5ejQ1NicsXG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmd2ID0+IHtcbiAgICAgICAgICAgIC8vIElmIG9uIENJLCBhbmQgbm90IHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gICAgICAgICAgICAvLyBiZWluZyBydW4gb24gaXMgYW4gdXBzdHJlYW0gYnJhbmNoLlxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICBpbmZvKGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdGApO1xuICAgICAgICAgICAgICBpbmZvKGBuZWVkIHRvIHZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlcyBvbiBDSSBydW5zIG9uIHVwc3RyZWFtIGJyYW5jaGVzLmApO1xuICAgICAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgICAgIGluZm8oYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0ZUNvbW1pdFJhbmdlKGFyZ3YucmFuZ2UpO1xuICAgICAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09IG1vZHVsZSkge1xuICBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=