(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/commit-message/validate-file", "@angular/dev-infra-private/commit-message/validate-range"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var validate_file_1 = require("@angular/dev-infra-private/commit-message/validate-file");
    var validate_range_1 = require("@angular/dev-infra-private/commit-message/validate-range");
    /** Build the parser for the commit-message commands. */
    function buildCommitMessageParser(localYargs) {
        return localYargs.help()
            .strict()
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
                console.info("Since valid commit messages are enforced by PR linting on CI, we do not\n" +
                    "need to validate commit messages on CI runs on upstream branches.\n\n" +
                    "Skipping check of provided commit range");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFDL0IseUZBQTZDO0lBQzdDLDJGQUFxRDtJQUVyRCx3REFBd0Q7SUFDeEQsU0FBZ0Isd0JBQXdCLENBQUMsVUFBc0I7UUFDN0QsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFO2FBQ25CLE1BQU0sRUFBRTthQUNSLE9BQU8sQ0FDSixxQkFBcUIsRUFBRSx5Q0FBeUMsRUFBRTtZQUNoRSxNQUFNLEVBQUU7Z0JBQ04sSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsU0FBUyxFQUFFLENBQUMsbUJBQW1CLENBQUM7Z0JBQ2hDLFdBQVcsRUFBRSxzQ0FBc0M7YUFDcEQ7WUFDRCxtQkFBbUIsRUFBRTtnQkFDbkIsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsU0FBUyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUNuQixXQUFXLEVBQ1AsOEVBQThFO2dCQUNsRixNQUFNLEVBQUUsVUFBQSxHQUFHO29CQUNULElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzlCLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBa0MsR0FBRyxzQkFBa0IsQ0FBQyxDQUFDO3FCQUMxRTtvQkFDRCxPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2FBQ0Y7U0FDRixFQUNELFVBQUEsSUFBSTtZQUNGLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxxQkFBcUIsQ0FBQztZQUN4RSw0QkFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3JCLENBQUMsQ0FBQzthQUNMLE9BQU8sQ0FDSixnQkFBZ0IsRUFBRSxxQ0FBcUMsRUFBRTtZQUN2RCxPQUFPLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFLDREQUE0RDtnQkFDekUsWUFBWSxFQUFFLHlEQUF5RDtnQkFDdkUsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsV0FBVyxFQUFFLElBQUk7YUFDbEI7U0FDRixFQUNELFVBQUEsSUFBSTtZQUNGLHVFQUF1RTtZQUN2RSxzQ0FBc0M7WUFDdEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsS0FBSyxPQUFPLEVBQUU7Z0JBQ25FLE9BQU8sQ0FBQyxJQUFJLENBQ1IsMkVBQTJFO29CQUMzRSx1RUFBdUU7b0JBQ3ZFLHlDQUF5QyxDQUFDLENBQUM7Z0JBQy9DLE9BQU87YUFDUjtZQUNELG9DQUFtQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDLENBQUMsQ0FBQztJQUNiLENBQUM7SUFqREQsNERBaURDO0lBRUQsSUFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUMxQix3QkFBd0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUN6QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt2YWxpZGF0ZUZpbGV9IGZyb20gJy4vdmFsaWRhdGUtZmlsZSc7XG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0UmFuZ2V9IGZyb20gJy4vdmFsaWRhdGUtcmFuZ2UnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNvbW1pdC1tZXNzYWdlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncHJlLWNvbW1pdC12YWxpZGF0ZScsICdWYWxpZGF0ZSB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG1lc3NhZ2UnLCB7XG4gICAgICAgICAgICAnZmlsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlLWVudi12YXJpYWJsZSddLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgJ2ZpbGUtZW52LXZhcmlhYmxlJzoge1xuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgY29uZmxpY3RzOiBbJ2ZpbGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgICAgICAgICAgICAnVGhlIGtleSBvZiB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGUgZm9yIHRoZSBwYXRoIG9mIHRoZSBjb21taXQgbWVzc2FnZSBmaWxlLicsXG4gICAgICAgICAgICAgIGNvZXJjZTogYXJnID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWxlID0gcHJvY2Vzcy5lbnZbYXJnXTtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGUpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUHJvdmlkZWQgZW52aXJvbm1lbnQgdmFyaWFibGUgXCIke2FyZ31cIiB3YXMgbm90IGZvdW5kLmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZmlsZTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyZ3MgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IGFyZ3MuZmlsZSB8fCBhcmdzLmZpbGVFbnZWYXJpYWJsZSB8fCAnLmdpdC9DT01NSVRfRURJVE1TRyc7XG4gICAgICAgICAgICB2YWxpZGF0ZUZpbGUoZmlsZSk7XG4gICAgICAgICAgfSlcbiAgICAgIC5jb21tYW5kKFxuICAgICAgICAgICd2YWxpZGF0ZS1yYW5nZScsICdWYWxpZGF0ZSBhIHJhbmdlIG9mIGNvbW1pdCBtZXNzYWdlcycsIHtcbiAgICAgICAgICAgICdyYW5nZSc6IHtcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcmFuZ2Ugb2YgY29tbWl0cyB0byBjaGVjaywgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgZGVtYW5kT3B0aW9uOiAnICBBIHJhbmdlIG11c3QgYmUgcHJvdmlkZWQsIGUuZy4gLS1yYW5nZSBhYmMxMjMuLnh5ejQ1NicsXG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICByZXF1aXJlc0FyZzogdHJ1ZSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmd2ID0+IHtcbiAgICAgICAgICAgIC8vIElmIG9uIENJLCBhbmQgbm90IHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gICAgICAgICAgICAvLyBiZWluZyBydW4gb24gaXMgYW4gdXBzdHJlYW0gYnJhbmNoLlxuICAgICAgICAgICAgaWYgKHByb2Nlc3MuZW52WydDSSddICYmIHByb2Nlc3MuZW52WydDSV9QVUxMX1JFUVVFU1QnXSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICBjb25zb2xlLmluZm8oXG4gICAgICAgICAgICAgICAgICBgU2luY2UgdmFsaWQgY29tbWl0IG1lc3NhZ2VzIGFyZSBlbmZvcmNlZCBieSBQUiBsaW50aW5nIG9uIENJLCB3ZSBkbyBub3RcXG5gICtcbiAgICAgICAgICAgICAgICAgIGBuZWVkIHRvIHZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlcyBvbiBDSSBydW5zIG9uIHVwc3RyZWFtIGJyYW5jaGVzLlxcblxcbmAgK1xuICAgICAgICAgICAgICAgICAgYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YWxpZGF0ZUNvbW1pdFJhbmdlKGFyZ3YucmFuZ2UpO1xuICAgICAgICAgIH0pO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09IG1vZHVsZSkge1xuICBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIoeWFyZ3MpLnBhcnNlKCk7XG59XG4iXX0=