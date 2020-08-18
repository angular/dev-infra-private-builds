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
            .command('restore-commit-message-draft', false, function (args) {
            return args.option('file-env-variable', {
                type: 'string',
                array: true,
                conflicts: ['file'],
                required: true,
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
        }, function (args) {
            restore_commit_message_1.restoreCommitMessage(args['file-env-variable'][0], args['file-env-variable'][1]);
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
            var file = args.file || args['file-env-variable'] || '.git/COMMIT_EDITMSG';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLG9FQUFzQztJQUV0QywyR0FBOEQ7SUFDOUQseUZBQTZDO0lBQzdDLDJGQUFxRDtJQUVyRCx3REFBd0Q7SUFDeEQsU0FBZ0Isd0JBQXdCLENBQUMsVUFBc0I7UUFDN0QsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLE9BQU8sQ0FDSiw4QkFBOEIsRUFBRSxLQUFLLEVBQ3JDLFVBQUEsSUFBSTtZQUNGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRTtnQkFDdEMsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUNuQixRQUFRLEVBQUUsSUFBSTtnQkFDZCxXQUFXLEVBQ1AsMEVBQTBFO29CQUMxRSw4Q0FBOEM7b0JBQzlDLHVEQUF1RDtnQkFDM0QsTUFBTSxFQUFFLFVBQUEsR0FBRztvQkFDSCxJQUFBLEtBQUEsZUFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBQSxFQUFuRCxJQUFJLFFBQUEsRUFBRSxNQUFNLFFBQXVDLENBQUM7b0JBQzNELElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBa0MsR0FBRyxzQkFBa0IsQ0FBQyxDQUFDO3FCQUMxRTtvQkFDRCxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxFQUNELFVBQUEsSUFBSTtZQUNGLDZDQUFvQixDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBUSxDQUFDLENBQUM7UUFDMUYsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLHFCQUFxQixFQUFFLHlDQUF5QyxFQUFFO1lBQ2hFLE1BQU0sRUFBRTtnQkFDTixJQUFJLEVBQUUsUUFBUTtnQkFDZCxTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQztnQkFDaEMsV0FBVyxFQUFFLHNDQUFzQzthQUNwRDtZQUNELG1CQUFtQixFQUFFO2dCQUNuQixJQUFJLEVBQUUsUUFBUTtnQkFDZCxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLFdBQVcsRUFDUCw4RUFBOEU7Z0JBQ2xGLE1BQU0sRUFBRSxVQUFBLEdBQUc7b0JBQ1QsSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDOUIsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFrQyxHQUFHLHNCQUFrQixDQUFDLENBQUM7cUJBQzFFO29CQUNELE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7YUFDRjtTQUNGLEVBQ0QsVUFBQSxJQUFJO1lBQ0YsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxxQkFBcUIsQ0FBQztZQUM3RSw0QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FDSixnQkFBZ0IsRUFBRSxxQ0FBcUMsRUFBRTtZQUN2RCxPQUFPLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLDREQUE0RDtnQkFDekUsWUFBWSxFQUFFLHlEQUF5RDtnQkFDdkUsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLElBQUk7YUFDbEI7U0FDRixFQUNELFVBQUEsSUFBSTtZQUNGLHVFQUF1RTtZQUN2RSxzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsS0FBSyxPQUFPLEVBQUU7Z0JBQ25FLGNBQUksQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO2dCQUNoRixjQUFJLENBQUMsbUVBQW1FLENBQUMsQ0FBQztnQkFDMUUsY0FBSSxFQUFFLENBQUM7Z0JBQ1AsY0FBSSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7Z0JBQ2hELE9BQU87YUFDUjtZQUNELG9DQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUF6RUQsNERBeUVDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUMxQix3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN6QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3Jlc3RvcmVDb21taXRNZXNzYWdlfSBmcm9tICcuL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHt2YWxpZGF0ZUZpbGV9IGZyb20gJy4vdmFsaWRhdGUtZmlsZSc7XG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0UmFuZ2V9IGZyb20gJy4vdmFsaWRhdGUtcmFuZ2UnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNvbW1pdC1tZXNzYWdlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCcsIGZhbHNlLFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3Mub3B0aW9uKCdmaWxlLWVudi12YXJpYWJsZScsIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGFycmF5OiB0cnVlLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAnVGhlIGtleSBmb3IgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHdoaWNoIGhvbGRzIHRoZSBhcmd1bWVudHMgZm9yIHRoZVxcbicgK1xuICAgICAgICAgICAgICAgICAgJ3ByZXBhcmUtY29tbWl0LW1zZyBob29rIGFzIGRlc2NyaWJlZCBoZXJlOlxcbicgK1xuICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJyxcbiAgICAgICAgICAgICAgY29lcmNlOiBhcmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtmaWxlLCBzb3VyY2VdID0gKHByb2Nlc3MuZW52W2FyZ10gfHwgJycpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaWxlLCBzb3VyY2VdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIHJlc3RvcmVDb21taXRNZXNzYWdlKGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMF0sIGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMV0gYXMgYW55KTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ByZS1jb21taXQtdmFsaWRhdGUnLCAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJywge1xuICAgICAgICAgICAgJ2ZpbGUnOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdmaWxlLWVudi12YXJpYWJsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlJ10sXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgICBjb2VyY2U6IGFyZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHByb2Nlc3MuZW52W2FyZ107XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhcmdzLmZpbGUgfHwgYXJnc1snZmlsZS1lbnYtdmFyaWFibGUnXSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gICAgICAgICAgICB2YWxpZGF0ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICd2YWxpZGF0ZS1yYW5nZScsICdWYWxpZGF0ZSBhIHJhbmdlIG9mIGNvbW1pdCBtZXNzYWdlcycsIHtcbiAgICAgICAgICAgICdyYW5nZSc6IHtcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmFuZ2Ugb2YgY29tbWl0cyB0byBjaGVjaywgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiAnICBBIHJhbmdlIG11c3QgYmUgcHJvdmlkZWQsIGUuZy4gLS1yYW5nZSBhYmMxMjMuLnh5ejQ1NicsXG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmd2ID0+IHtcbiAgICAgICAgICAgIC8vIElmIG9uIENJLCBhbmQgbm90IHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gICAgICAgICAgICAvLyBiZWluZyBydW4gb24gaXMgYW4gdXBzdHJlYW0gYnJhbmNoLlxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICBpbmZvKGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdGApO1xuICAgICAgICAgICAgICBpbmZvKGBuZWVkIHRvIHZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlcyBvbiBDSSBydW5zIG9uIHVwc3RyZWFtIGJyYW5jaGVzLmApO1xuICAgICAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgICAgIGluZm8oYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0ZUNvbW1pdFJhbmdlKGFyZ3YucmFuZ2UpO1xuICAgICAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09IG1vZHVsZSkge1xuICBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=