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
        define("@angular/dev-infra-private/pr/merge/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/git/github-yargs", "@angular/dev-infra-private/pr/merge"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MergeCommandModule = void 0;
    var tslib_1 = require("tslib");
    var github_yargs_1 = require("@angular/dev-infra-private/utils/git/github-yargs");
    var index_1 = require("@angular/dev-infra-private/pr/merge");
    /** Builds the command. */
    function builder(yargs) {
        return github_yargs_1.addGithubTokenOption(yargs)
            .help()
            .strict()
            .positional('pr', {
            demandOption: true,
            type: 'number',
            description: 'The PR to be merged.',
        })
            .option('branch-prompt', {
            type: 'boolean',
            default: true,
            description: 'Whether to prompt to confirm the branches a PR will merge into.',
        });
    }
    /** Handles the command. */
    function handler(_a) {
        var pr = _a.pr, githubToken = _a.githubToken, branchPrompt = _a.branchPrompt;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, index_1.mergePullRequest(pr, githubToken, { branchPrompt: branchPrompt })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module describing the command.  */
    exports.MergeCommandModule = {
        handler: handler,
        builder: builder,
        command: 'merge <pr>',
        describe: 'Merge a PR into its targeted branches.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsa0ZBQWtFO0lBRWxFLDZEQUF5QztJQVN6QywwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQzthQUM3QixJQUFJLEVBQUU7YUFDTixNQUFNLEVBQUU7YUFDUixVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLHNCQUFzQjtTQUNwQyxDQUFDO2FBQ0QsTUFBTSxDQUFDLGVBQWlDLEVBQUU7WUFDekMsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxpRUFBaUU7U0FDL0UsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixTQUFlLE9BQU8sQ0FBQyxFQUErRDtZQUE5RCxFQUFFLFFBQUEsRUFBRSxXQUFXLGlCQUFBLEVBQUUsWUFBWSxrQkFBQTs7Ozs0QkFDbkQscUJBQU0sd0JBQWdCLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxFQUFDLFlBQVksY0FBQSxFQUFDLENBQUMsRUFBQTs7d0JBQXZELFNBQXVELENBQUM7Ozs7O0tBQ3pEO0lBRUQsb0RBQW9EO0lBQ3ZDLFFBQUEsa0JBQWtCLEdBQTJDO1FBQ3hFLE9BQU8sU0FBQTtRQUNQLE9BQU8sU0FBQTtRQUNQLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLFFBQVEsRUFBRSx3Q0FBd0M7S0FDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHttZXJnZVB1bGxSZXF1ZXN0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSB0byB0aGUgbWVyZ2UgY29tbWFuZCB2aWEgQ0xJLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZUNvbW1hbmRPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbiAgcHI6IG51bWJlcjtcbiAgYnJhbmNoUHJvbXB0OiBib29sZWFuO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3MpXG4gICAgICAuaGVscCgpXG4gICAgICAuc3RyaWN0KClcbiAgICAgIC5wb3NpdGlvbmFsKCdwcicsIHtcbiAgICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgUFIgdG8gYmUgbWVyZ2VkLicsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignYnJhbmNoLXByb21wdCcgYXMgJ2JyYW5jaFByb21wdCcsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZWZhdWx0OiB0cnVlLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gcHJvbXB0IHRvIGNvbmZpcm0gdGhlIGJyYW5jaGVzIGEgUFIgd2lsbCBtZXJnZSBpbnRvLicsXG4gICAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtwciwgZ2l0aHViVG9rZW4sIGJyYW5jaFByb21wdH06IEFyZ3VtZW50czxNZXJnZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCBtZXJnZVB1bGxSZXF1ZXN0KHByLCBnaXRodWJUb2tlbiwge2JyYW5jaFByb21wdH0pO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gICovXG5leHBvcnQgY29uc3QgTWVyZ2VDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBNZXJnZUNvbW1hbmRPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ21lcmdlIDxwcj4nLFxuICBkZXNjcmliZTogJ01lcmdlIGEgUFIgaW50byBpdHMgdGFyZ2V0ZWQgYnJhbmNoZXMuJyxcbn07XG4iXX0=