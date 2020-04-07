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
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
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
            .command('pre-commit-validate', 'Validate the most recent commit message', {}, function () {
            validate_file_1.validateFile('.git/COMMIT_EDITMSG');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDZCQUErQjtJQUMvQix5RkFBNkM7SUFDN0MsMkZBQXFEO0lBRXJELHdEQUF3RDtJQUN4RCxTQUFnQix3QkFBd0IsQ0FBQyxVQUFzQjtRQUM3RCxPQUFPLFVBQVUsQ0FBQyxJQUFJLEVBQUU7YUFDbkIsTUFBTSxFQUFFO2FBQ1IsT0FBTyxDQUNKLHFCQUFxQixFQUFFLHlDQUF5QyxFQUFFLEVBQUUsRUFDcEU7WUFDRSw0QkFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDO2FBQ0wsT0FBTyxDQUNKLGdCQUFnQixFQUFFLHFDQUFxQyxFQUFFO1lBQ3ZELE9BQU8sRUFBRTtnQkFDUCxXQUFXLEVBQUUsNERBQTREO2dCQUN6RSxZQUFZLEVBQUUseURBQXlEO2dCQUN2RSxJQUFJLEVBQUUsUUFBUTtnQkFDZCxXQUFXLEVBQUUsSUFBSTthQUNsQjtTQUNGLEVBQ0QsVUFBQSxJQUFJO1lBQ0YsdUVBQXVFO1lBQ3ZFLHNDQUFzQztZQUN0QyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLE9BQU8sRUFBRTtnQkFDbkUsT0FBTyxDQUFDLElBQUksQ0FDUiwyRUFBMkU7b0JBQzNFLHVFQUF1RTtvQkFDdkUseUNBQXlDLENBQUMsQ0FBQztnQkFDL0MsT0FBTzthQUNSO1lBQ0Qsb0NBQW1CLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2xDLENBQUMsQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQTdCRCw0REE2QkM7SUFFRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksTUFBTSxFQUFFO1FBQzFCLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHt2YWxpZGF0ZUZpbGV9IGZyb20gJy4vdmFsaWRhdGUtZmlsZSc7XG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0UmFuZ2V9IGZyb20gJy4vdmFsaWRhdGUtcmFuZ2UnO1xuXG4vKiogQnVpbGQgdGhlIHBhcnNlciBmb3IgdGhlIGNvbW1pdC1tZXNzYWdlIGNvbW1hbmRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcihsb2NhbFlhcmdzOiB5YXJncy5Bcmd2KSB7XG4gIHJldHVybiBsb2NhbFlhcmdzLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAuY29tbWFuZChcbiAgICAgICAgICAncHJlLWNvbW1pdC12YWxpZGF0ZScsICdWYWxpZGF0ZSB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG1lc3NhZ2UnLCB7fSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICB2YWxpZGF0ZUZpbGUoJy5naXQvQ09NTUlUX0VESVRNU0cnKTtcbiAgICAgICAgICB9KVxuICAgICAgLmNvbW1hbmQoXG4gICAgICAgICAgJ3ZhbGlkYXRlLXJhbmdlJywgJ1ZhbGlkYXRlIGEgcmFuZ2Ugb2YgY29tbWl0IG1lc3NhZ2VzJywge1xuICAgICAgICAgICAgJ3JhbmdlJzoge1xuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSByYW5nZSBvZiBjb21taXRzIHRvIGNoZWNrLCBlLmcuIC0tcmFuZ2UgYWJjMTIzLi54eXo0NTYnLFxuICAgICAgICAgICAgICBkZW1hbmRPcHRpb246ICcgIEEgcmFuZ2UgbXVzdCBiZSBwcm92aWRlZCwgZS5nLiAtLXJhbmdlIGFiYzEyMy4ueHl6NDU2JyxcbiAgICAgICAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgICAgICAgIHJlcXVpcmVzQXJnOiB0cnVlLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGFyZ3YgPT4ge1xuICAgICAgICAgICAgLy8gSWYgb24gQ0ksIGFuZCBub3QgcHVsbCByZXF1ZXN0IG51bWJlciBpcyBwcm92aWRlZCwgYXNzdW1lIHRoZSBicmFuY2hcbiAgICAgICAgICAgIC8vIGJlaW5nIHJ1biBvbiBpcyBhbiB1cHN0cmVhbSBicmFuY2guXG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnZbJ0NJJ10gJiYgcHJvY2Vzcy5lbnZbJ0NJX1BVTExfUkVRVUVTVCddID09PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuaW5mbyhcbiAgICAgICAgICAgICAgICAgIGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdFxcbmAgK1xuICAgICAgICAgICAgICAgICAgYG5lZWQgdG8gdmFsaWRhdGUgY29tbWl0IG1lc3NhZ2VzIG9uIENJIHJ1bnMgb24gdXBzdHJlYW0gYnJhbmNoZXMuXFxuXFxuYCArXG4gICAgICAgICAgICAgICAgICBgU2tpcHBpbmcgY2hlY2sgb2YgcHJvdmlkZWQgY29tbWl0IHJhbmdlYCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbGlkYXRlQ29tbWl0UmFuZ2UoYXJndi5yYW5nZSk7XG4gICAgICAgICAgfSk7XG59XG5cbmlmIChyZXF1aXJlLm1haW4gPT0gbW9kdWxlKSB7XG4gIGJ1aWxkQ29tbWl0TWVzc2FnZVBhcnNlcih5YXJncykucGFyc2UoKTtcbn1cbiJdfQ==