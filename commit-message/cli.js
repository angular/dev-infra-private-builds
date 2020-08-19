(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "tslib", "yargs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/restore-commit-message", "@angular/dev-infra-private/commit-message/validate-file", "@angular/dev-infra-private/commit-message/validate-range", "@angular/dev-infra-private/commit-message/wizard"], factory);
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
    var wizard_1 = require("@angular/dev-infra-private/commit-message/wizard");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        var _this = this;
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
            .command('wizard <filePath> [source] [commitSha]', '', (function (args) {
            return args
                .positional('filePath', { description: 'The file path to write the generated commit message into' })
                .positional('source', {
                choices: ['message', 'template', 'merge', 'squash', 'commit'],
                description: 'The source of the commit message as described here: ' +
                    'https://git-scm.com/docs/githooks#_prepare_commit_msg'
            })
                .positional('commitSha', { description: 'The commit sha if source is set to `commit`' });
        }), function (args) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, wizard_1.runWizard(args)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); })
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBRS9CLG9FQUFzQztJQUV0QywyR0FBOEQ7SUFDOUQseUZBQTZDO0lBQzdDLDJGQUFxRDtJQUNyRCwyRUFBbUM7SUFFbkMsd0RBQXdEO0lBQ3hELFNBQWdCLHdCQUF3QixDQUFDLFVBQXNCO1FBQS9ELGlCQTBGQztRQXpGQyxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsT0FBTyxDQUNKLDhCQUE4QixFQUFFLEtBQUssRUFDckMsVUFBQSxJQUFJO1lBQ0YsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLG1CQUFtQixFQUFFO2dCQUN0QyxJQUFJLEVBQUUsUUFBUTtnQkFDZCxLQUFLLEVBQUUsSUFBSTtnQkFDWCxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ25CLFFBQVEsRUFBRSxJQUFJO2dCQUNkLFdBQVcsRUFDUCwwRUFBMEU7b0JBQzFFLDhDQUE4QztvQkFDOUMsdURBQXVEO2dCQUMzRCxNQUFNLEVBQUUsVUFBQSxHQUFHO29CQUNILElBQUEsS0FBQSxlQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFBLEVBQW5ELElBQUksUUFBQSxFQUFFLE1BQU0sUUFBdUMsQ0FBQztvQkFDM0QsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFrQyxHQUFHLHNCQUFrQixDQUFDLENBQUM7cUJBQzFFO29CQUNELE9BQU8sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7YUFDRixDQUFDLENBQUM7UUFD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OlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7cmVzdG9yZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcmVzdG9yZS1jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge3ZhbGlkYXRlRmlsZX0gZnJvbSAnLi92YWxpZGF0ZS1maWxlJztcbmltcG9ydCB7dmFsaWRhdGVDb21taXRSYW5nZX0gZnJvbSAnLi92YWxpZGF0ZS1yYW5nZSc7XG5pbXBvcnQge3J1bldpemFyZH0gZnJvbSAnLi93aXphcmQnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNvbW1pdC1tZXNzYWdlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCcsIGZhbHNlLFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3Mub3B0aW9uKCdmaWxlLWVudi12YXJpYWJsZScsIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGFycmF5OiB0cnVlLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAnVGhlIGtleSBmb3IgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHdoaWNoIGhvbGRzIHRoZSBhcmd1bWVudHMgZm9yIHRoZVxcbicgK1xuICAgICAgICAgICAgICAgICAgJ3ByZXBhcmUtY29tbWl0LW1zZyBob29rIGFzIGRlc2NyaWJlZCBoZXJlOlxcbicgK1xuICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJyxcbiAgICAgICAgICAgICAgY29lcmNlOiBhcmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtmaWxlLCBzb3VyY2VdID0gKHByb2Nlc3MuZW52W2FyZ10gfHwgJycpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaWxlLCBzb3VyY2VdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIHJlc3RvcmVDb21taXRNZXNzYWdlKGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMF0sIGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMV0gYXMgYW55KTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3dpemFyZCA8ZmlsZVBhdGg+IFtzb3VyY2VdIFtjb21taXRTaGFdJywgJycsICgoYXJnczogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXJnc1xuICAgICAgICAgICAgICAgIC5wb3NpdGlvbmFsKFxuICAgICAgICAgICAgICAgICAgICAnZmlsZVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB7ZGVzY3JpcHRpb246ICdUaGUgZmlsZSBwYXRoIHRvIHdyaXRlIHRoZSBnZW5lcmF0ZWQgY29tbWl0IG1lc3NhZ2UgaW50byd9KVxuICAgICAgICAgICAgICAgIC5wb3NpdGlvbmFsKCdzb3VyY2UnLCB7XG4gICAgICAgICAgICAgICAgICBjaG9pY2VzOiBbJ21lc3NhZ2UnLCAndGVtcGxhdGUnLCAnbWVyZ2UnLCAnc3F1YXNoJywgJ2NvbW1pdCddLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgc291cmNlIG9mIHRoZSBjb21taXQgbWVzc2FnZSBhcyBkZXNjcmliZWQgaGVyZTogJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJ1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnBvc2l0aW9uYWwoXG4gICAgICAgICAgICAgICAgICAgICdjb21taXRTaGEnLCB7ZGVzY3JpcHRpb246ICdUaGUgY29tbWl0IHNoYSBpZiBzb3VyY2UgaXMgc2V0IHRvIGBjb21taXRgJ30pO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGFzeW5jIChhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHJ1bldpemFyZChhcmdzKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ByZS1jb21taXQtdmFsaWRhdGUnLCAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJywge1xuICAgICAgICAgICAgJ2ZpbGUnOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdmaWxlLWVudi12YXJpYWJsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlJ10sXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgICBjb2VyY2U6IGFyZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHByb2Nlc3MuZW52W2FyZ107XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhcmdzLmZpbGUgfHwgYXJnc1snZmlsZS1lbnYtdmFyaWFibGUnXSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gICAgICAgICAgICB2YWxpZGF0ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICd2YWxpZGF0ZS1yYW5nZScsICdWYWxpZGF0ZSBhIHJhbmdlIG9mIGNvbW1pdCBtZXNzYWdlcycsIHtcbiAgICAgICAgICAgICdyYW5nZSc6IHtcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmFuZ2Ugb2YgY29tbWl0cyB0byBjaGVjaywgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiAnICBBIHJhbmdlIG11c3QgYmUgcHJvdmlkZWQsIGUuZy4gLS1yYW5nZSBhYmMxMjMuLnh5ejQ1NicsXG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmd2ID0+IHtcbiAgICAgICAgICAgIC8vIElmIG9uIENJLCBhbmQgbm90IHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gICAgICAgICAgICAvLyBiZWluZyBydW4gb24gaXMgYW4gdXBzdHJlYW0gYnJhbmNoLlxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICBpbmZvKGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdGApO1xuICAgICAgICAgICAgICBpbmZvKGBuZWVkIHRvIHZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlcyBvbiBDSSBydW5zIG9uIHVwc3RyZWFtIGJyYW5jaGVzLmApO1xuICAgICAgICAgICAgICBpbmZvKCk7XG4gICAgICAgICAgICAgIGluZm8oYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0ZUNvbW1pdFJhbmdlKGFyZ3YucmFuZ2UpO1xuICAgICAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09IG1vZHVsZSkge1xuICBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=