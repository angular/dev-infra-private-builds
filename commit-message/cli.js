(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/cli", ["require", "exports", "yargs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/validate-file", "@angular/dev-infra-private/commit-message/validate-range"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildCommitMessageParser = void 0;
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var yargs = require("yargs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCw2QkFBK0I7SUFFL0Isb0VBQXNDO0lBRXRDLHlGQUE2QztJQUM3QywyRkFBcUQ7SUFFckQsd0RBQXdEO0lBQ3hELFNBQWdCLHdCQUF3QixDQUFDLFVBQXNCO1FBQzdELE9BQU8sVUFBVSxDQUFDLElBQUksRUFBRTthQUNuQixNQUFNLEVBQUU7YUFDUixPQUFPLENBQ0oscUJBQXFCLEVBQUUseUNBQXlDLEVBQUU7WUFDaEUsTUFBTSxFQUFFO2dCQUNOLElBQUksRUFBRSxRQUFRO2dCQUNkLFNBQVMsRUFBRSxDQUFDLG1CQUFtQixDQUFDO2dCQUNoQyxXQUFXLEVBQUUsc0NBQXNDO2FBQ3BEO1lBQ0QsbUJBQW1CLEVBQUU7Z0JBQ25CLElBQUksRUFBRSxRQUFRO2dCQUNkLFNBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDbkIsV0FBVyxFQUNQLDhFQUE4RTtnQkFDbEYsTUFBTSxFQUFFLFVBQUEsR0FBRztvQkFDVCxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUM5QixJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMscUNBQWtDLEdBQUcsc0JBQWtCLENBQUMsQ0FBQztxQkFDMUU7b0JBQ0QsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQzthQUNGO1NBQ0YsRUFDRCxVQUFBLElBQUk7WUFDRixJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxlQUFlLElBQUkscUJBQXFCLENBQUM7WUFDeEUsNEJBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQixDQUFDLENBQUM7YUFDTCxPQUFPLENBQ0osZ0JBQWdCLEVBQUUscUNBQXFDLEVBQUU7WUFDdkQsT0FBTyxFQUFFO2dCQUNQLFdBQVcsRUFBRSw0REFBNEQ7Z0JBQ3pFLFlBQVksRUFBRSx5REFBeUQ7Z0JBQ3ZFLElBQUksRUFBRSxRQUFRO2dCQUNkLFdBQVcsRUFBRSxJQUFJO2FBQ2xCO1NBQ0YsRUFDRCxVQUFBLElBQUk7WUFDRix1RUFBdUU7WUFDdkUsc0NBQXNDO1lBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxFQUFFO2dCQUNuRSxjQUFJLENBQUMseUVBQXlFLENBQUMsQ0FBQztnQkFDaEYsY0FBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7Z0JBQzFFLGNBQUksRUFBRSxDQUFDO2dCQUNQLGNBQUksQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO2dCQUNoRCxPQUFPO2FBQ1I7WUFDRCxvQ0FBbUIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7SUFDYixDQUFDO0lBakRELDREQWlEQztJQUVELElBQUksT0FBTyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7UUFDMUIsd0JBQXdCLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDekMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgKiBhcyB5YXJncyBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7dmFsaWRhdGVGaWxlfSBmcm9tICcuL3ZhbGlkYXRlLWZpbGUnO1xuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdFJhbmdlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlJztcblxuLyoqIEJ1aWxkIHRoZSBwYXJzZXIgZm9yIHRoZSBjb21taXQtbWVzc2FnZSBjb21tYW5kcy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZENvbW1pdE1lc3NhZ2VQYXJzZXIobG9jYWxZYXJnczogeWFyZ3MuQXJndikge1xuICByZXR1cm4gbG9jYWxZYXJncy5oZWxwKClcbiAgICAgIC5zdHJpY3QoKVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ByZS1jb21taXQtdmFsaWRhdGUnLCAnVmFsaWRhdGUgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBtZXNzYWdlJywge1xuICAgICAgICAgICAgJ2ZpbGUnOiB7XG4gICAgICAgICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICAgICAgICBjb25mbGljdHM6IFsnZmlsZS1lbnYtdmFyaWFibGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdmaWxlLWVudi12YXJpYWJsZSc6IHtcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIGNvbmZsaWN0czogWydmaWxlJ10sXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxuICAgICAgICAgICAgICAgICAgJ1RoZSBrZXkgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlIGZvciB0aGUgcGF0aCBvZiB0aGUgY29tbWl0IG1lc3NhZ2UgZmlsZS4nLFxuICAgICAgICAgICAgICBjb2VyY2U6IGFyZyA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsZSA9IHByb2Nlc3MuZW52W2FyZ107XG4gICAgICAgICAgICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFByb3ZpZGVkIGVudmlyb25tZW50IHZhcmlhYmxlIFwiJHthcmd9XCIgd2FzIG5vdCBmb3VuZC5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpbGU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBhcmdzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbGUgPSBhcmdzLmZpbGUgfHwgYXJncy5maWxlRW52VmFyaWFibGUgfHwgJy5naXQvQ09NTUlUX0VESVRNU0cnO1xuICAgICAgICAgICAgdmFsaWRhdGVGaWxlKGZpbGUpO1xuICAgICAgICAgIH0pXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAndmFsaWRhdGUtcmFuZ2UnLCAnVmFsaWRhdGUgYSByYW5nZSBvZiBjb21taXQgbWVzc2FnZXMnLCB7XG4gICAgICAgICAgICAncmFuZ2UnOiB7XG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHJhbmdlIG9mIGNvbW1pdHMgdG8gY2hlY2ssIGUuZy4gLS1yYW5nZSBhYmMxMjMuLnh5ejQ1NicsXG4gICAgICAgICAgICAgIGRlbWFuZE9wdGlvbjogJyAgQSByYW5nZSBtdXN0IGJlIHByb3ZpZGVkLCBlLmcuIC0tcmFuZ2UgYWJjMTIzLi54eXo0NTYnLFxuICAgICAgICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgICAgICAgcmVxdWlyZXNBcmc6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgICAgYXJndiA9PiB7XG4gICAgICAgICAgICAvLyBJZiBvbiBDSSwgYW5kIG5vdCBwdWxsIHJlcXVlc3QgbnVtYmVyIGlzIHByb3ZpZGVkLCBhc3N1bWUgdGhlIGJyYW5jaFxuICAgICAgICAgICAgLy8gYmVpbmcgcnVuIG9uIGlzIGFuIHVwc3RyZWFtIGJyYW5jaC5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudlsnQ0knXSAmJiBwcm9jZXNzLmVudlsnQ0lfUFVMTF9SRVFVRVNUJ10gPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgaW5mbyhgU2luY2UgdmFsaWQgY29tbWl0IG1lc3NhZ2VzIGFyZSBlbmZvcmNlZCBieSBQUiBsaW50aW5nIG9uIENJLCB3ZSBkbyBub3RgKTtcbiAgICAgICAgICAgICAgaW5mbyhgbmVlZCB0byB2YWxpZGF0ZSBjb21taXQgbWVzc2FnZXMgb24gQ0kgcnVucyBvbiB1cHN0cmVhbSBicmFuY2hlcy5gKTtcbiAgICAgICAgICAgICAgaW5mbygpO1xuICAgICAgICAgICAgICBpbmZvKGBTa2lwcGluZyBjaGVjayBvZiBwcm92aWRlZCBjb21taXQgcmFuZ2VgKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFsaWRhdGVDb21taXRSYW5nZShhcmd2LnJhbmdlKTtcbiAgICAgICAgICB9KTtcbn1cblxuaWYgKHJlcXVpcmUubWFpbiA9PSBtb2R1bGUpIHtcbiAgYnVpbGRDb21taXRNZXNzYWdlUGFyc2VyKHlhcmdzKS5wYXJzZSgpO1xufVxuIl19