(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "tslib", "yargs", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/restore-commit-message", "@angular/dev-infra-private/commit-message/validate-file", "@angular/dev-infra-private/commit-message/validate-range", "@angular/dev-infra-private/commit-message/wizard"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var restore_commit_message_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message");
    var validate_file_1 = require("@angular/dev-infra-private/commit-message/validate-file");
    var validate_range_1 = require("@angular/dev-infra-private/commit-message/validate-range");
    var wizard_1 = require("@angular/dev-infra-private/commit-message/wizard");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        var _this = this;
        var _a;
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
            },
            'error': {
                type: 'boolean',
                description: 'Whether invalid commit messages should be treated as failures rather than a warning',
                default: !!((_a = config_1.getUserConfig().commitMessage) === null || _a === void 0 ? void 0 : _a.errorOnInvalidMessage) || !!process.env['CI']
            }
        }, function (args) {
            var file = args.file || args['file-env-variable'] || '.git/COMMIT_EDITMSG';
            validate_file_1.validateFile(file, args.error);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsNkJBQStCO0lBQy9CLGtFQUE4QztJQUU5QyxvRUFBc0M7SUFFdEMsMkdBQThEO0lBQzlELHlGQUE2QztJQUM3QywyRkFBcUQ7SUFDckQsMkVBQW1DO0lBRW5DLHdEQUF3RDtJQUN4RCxTQUFnQix3QkFBd0IsQ0FBQyxVQUFzQjtRQUEvRCxpQkFnR0M7O1FBL0ZDLE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixPQUFPLENBQ0osOEJBQThCLEVBQUUsS0FBSyxFQUNyQyxVQUFBLElBQUk7WUFDRixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsbUJBQW1CLEVBQUU7Z0JBQ3RDLElBQUksRUFBRSxRQUFRO2dCQUNkLEtBQUssRUFBRSxJQUFJO2dCQUNYLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsUUFBUSxFQUFFLElBQUk7Z0JBQ2QsV0FBVyxFQUNQLDBFQUEwRTtvQkFDMUUsOENBQThDO29CQUM5Qyx1REFBdUQ7Z0JBQzNELE1BQU0sRUFBRSxVQUFBLEdBQUc7b0JBQ0gsSUFBQSxLQUFBLGVBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUEsRUFBbkQsSUFBSSxRQUFBLEVBQUUsTUFBTSxRQUF1QyxDQUFDO29CQUMzRCxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztxQkFDMUU7b0JBQ0QsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEIsQ0FBQzthQUNG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aEQsT0FBTzthQUNSO1lBQ0Qsb0NBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQWhHRCw0REFnR0M7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO1FBQzFCLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5pbXBvcnQge2dldFVzZXJDb25maWd9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7cmVzdG9yZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcmVzdG9yZS1jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge3ZhbGlkYXRlRmlsZX0gZnJvbSAnLi92YWxpZGF0ZS1maWxlJztcbmltcG9ydCB7dmFsaWRhdGVDb21taXRSYW5nZX0gZnJvbSAnLi92YWxpZGF0ZS1yYW5nZSc7XG5pbXBvcnQge3J1bldpemFyZH0gZnJvbSAnLi93aXphcmQnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNvbW1pdC1tZXNzYWdlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncmVzdG9yZS1jb21taXQtbWVzc2FnZS1kcmFmdCcsIGZhbHNlLFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFyZ3Mub3B0aW9uKCdmaWxlLWVudi12YXJpYWJsZScsIHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGFycmF5OiB0cnVlLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZSddLFxuICAgICAgICAgICAgICByZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAnVGhlIGtleSBmb3IgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIHdoaWNoIGhvbGRzIHRoZSBhcmd1bWVudHMgZm9yIHRoZVxcbicgK1xuICAgICAgICAgICAgICAgICAgJ3ByZXBhcmUtY29tbWl0LW1zZyBob29rIGFzIGRlc2NyaWJlZCBoZXJlOlxcbicgK1xuICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJyxcbiAgICAgICAgICAgICAgY29lcmNlOiBhcmcgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IFtmaWxlLCBzb3VyY2VdID0gKHByb2Nlc3MuZW52W2FyZ10gfHwgJycpLnNwbGl0KCcgJyk7XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtmaWxlLCBzb3VyY2VdO1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIHJlc3RvcmVDb21taXRNZXNzYWdlKGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMF0sIGFyZ3NbJ2ZpbGUtZW52LXZhcmlhYmxlJ11bMV0gYXMgYW55KTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3dpemFyZCA8ZmlsZVBhdGg+IFtzb3VyY2VdIFtjb21taXRTaGFdJywgJycsICgoYXJnczogYW55KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYXJnc1xuICAgICAgICAgICAgICAgIC5wb3NpdGlvbmFsKFxuICAgICAgICAgICAgICAgICAgICAnZmlsZVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB7ZGVzY3JpcHRpb246ICdUaGUgZmlsZSBwYXRoIHRvIHdyaXRlIHRoZSBnZW5lcmF0ZWQgY29tbWl0IG1lc3NhZ2UgaW50byd9KVxuICAgICAgICAgICAgICAgIC5wb3NpdGlvbmFsKCdzb3VyY2UnLCB7XG4gICAgICAgICAgICAgICAgICBjaG9pY2VzOiBbJ21lc3NhZ2UnLCAndGVtcGxhdGUnLCAnbWVyZ2UnLCAnc3F1YXNoJywgJ2NvbW1pdCddLFxuICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgc291cmNlIG9mIHRoZSBjb21taXQgbWVzc2FnZSBhcyBkZXNjcmliZWQgaGVyZTogJyArXG4gICAgICAgICAgICAgICAgICAgICAgJ2h0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnJ1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnBvc2l0aW9uYWwoXG4gICAgICAgICAgICAgICAgICAgICdjb21taXRTaGEnLCB7ZGVzY3JpcHRpb246ICdUaGUgY29tbWl0IHNoYSBpZiBzb3VyY2UgaXMgc2V0IHRvIGBjb21taXRgJ30pO1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGFzeW5jIChhcmdzOiBhbnkpID0+IHtcbiAgICAgICAgICAgIGF3YWl0IHJ1bldpemFyZChhcmdzKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ByZS1jb21taXQtdmFsaWRhdGUnLCAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJywge1xuICAgICAgICAgICAgJ2ZpbGUnOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdmaWxlLWVudi12YXJpYWJsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlJ10sXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgICBjb2VyY2U6IGFyZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHByb2Nlc3MuZW52W2FyZ107XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2Vycm9yJzoge1xuICAgICAgICAgICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1doZXRoZXIgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZmFpbHVyZXMgcmF0aGVyIHRoYW4gYSB3YXJuaW5nJyxcbiAgICAgICAgICAgICAgZGVmYXVsdDogISFnZXRVc2VyQ29uZmlnKCkuY29tbWl0TWVzc2FnZT8uZXJyb3JPbkludmFsaWRNZXNzYWdlIHx8ICEhcHJvY2Vzcy5lbnZbJ0NJJ11cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGFyZ3MuZmlsZSB8fCBhcmdzWydmaWxlLWVudi12YXJpYWJsZSddIHx8ICcuZ2l0L0NPTU1JVF9FRElUTVNHJztcbiAgICAgICAgICAgIHZhbGlkYXRlRmlsZShmaWxlLCBhcmdzLmVycm9yKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ZhbGlkYXRlLXJhbmdlJywgJ1ZhbGlkYXRlIGEgcmFuZ2Ugb2YgY29tbWl0IG1lc3NhZ2VzJywge1xuICAgICAgICAgICAgJ3JhbmdlJzoge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSByYW5nZSBvZiBjb21taXRzIHRvIGNoZWNrLCBlLmcuIC0tcmFuZ2UgYWJjMTIzLi54eXo0NTYnLFxuICAgICAgICAgICAgICBkZW1hbmRPcHRpb246ICcgIEEgcmFuZ2UgbXVzdCBiZSBwcm92aWRlZCwgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyZ3YgPT4ge1xuICAgICAgICAgICAgLy8gSWYgb24gQ0ksIGFuZCBub3QgcHVsbCByZXF1ZXN0IG51bWJlciBpcyBwcm92aWRlZCwgYXNzdW1lIHRoZSBicmFuY2hcbiAgICAgICAgICAgIC8vIGJlaW5nIHJ1biBvbiBpcyBhbiB1cHN0cmVhbSBicmFuY2guXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnZbJ0NJJ10gJiYgcHJvY2Vzcy5lbnZbJ0NJX1BVTExfUkVRVUVTVCddID09PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgIGluZm8oYFNpbmNlIHZhbGlkIGNvbW1pdCBtZXNzYWdlcyBhcmUgZW5mb3JjZWQgYnkgUFIgbGludGluZyBvbiBDSSwgd2UgZG8gbm90YCk7XG4gICAgICAgICAgICAgIGluZm8oYG5lZWQgdG8gdmFsaWRhdGUgY29tbWl0IG1lc3NhZ2VzIG9uIENJIHJ1bnMgb24gdXBzdHJlYW0gYnJhbmNoZXMuYCk7XG4gICAgICAgICAgICAgIGluZm8oKTtcbiAgICAgICAgICAgICAgaW5mbyhgU2tpcHBpbmcgY2hlY2sgb2YgcHJvdmlkZWQgY29tbWl0IHJhbmdlYCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbGlkYXRlQ29tbWl0UmFuZ2UoYXJndi5yYW5nZSk7XG4gICAgICAgICAgfSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT0gbW9kdWxlKSB7XG4gIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==