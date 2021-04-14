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
        var pr = _a.pr, branchPrompt = _a.branchPrompt;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, index_1.mergePullRequest(pr, { branchPrompt: branchPrompt })];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    /** yargs command module describing the command. */
    exports.MergeCommandModule = {
        handler: handler,
        builder: builder,
        command: 'merge <pr>',
        describe: 'Merge a PR into its targeted branches.',
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBSUgsa0ZBQWtFO0lBRWxFLDZEQUF5QztJQVN6QywwQkFBMEI7SUFDMUIsU0FBUyxPQUFPLENBQUMsS0FBVztRQUMxQixPQUFPLG1DQUFvQixDQUFDLEtBQUssQ0FBQzthQUM3QixJQUFJLEVBQUU7YUFDTixNQUFNLEVBQUU7YUFDUixVQUFVLENBQUMsSUFBSSxFQUFFO1lBQ2hCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLElBQUksRUFBRSxRQUFRO1lBQ2QsV0FBVyxFQUFFLHNCQUFzQjtTQUNwQyxDQUFDO2FBQ0QsTUFBTSxDQUFDLGVBQWlDLEVBQUU7WUFDekMsSUFBSSxFQUFFLFNBQVM7WUFDZixPQUFPLEVBQUUsSUFBSTtZQUNiLFdBQVcsRUFBRSxpRUFBaUU7U0FDL0UsQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELDJCQUEyQjtJQUMzQixTQUFlLE9BQU8sQ0FBQyxFQUFrRDtZQUFqRCxFQUFFLFFBQUEsRUFBRSxZQUFZLGtCQUFBOzs7OzRCQUN0QyxxQkFBTSx3QkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBQyxZQUFZLGNBQUEsRUFBQyxDQUFDLEVBQUE7O3dCQUExQyxTQUEwQyxDQUFDOzs7OztLQUM1QztJQUVELG1EQUFtRDtJQUN0QyxRQUFBLGtCQUFrQixHQUEyQztRQUN4RSxPQUFPLFNBQUE7UUFDUCxPQUFPLFNBQUE7UUFDUCxPQUFPLEVBQUUsWUFBWTtRQUNyQixRQUFRLEVBQUUsd0NBQXdDO0tBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5cbmltcG9ydCB7bWVyZ2VQdWxsUmVxdWVzdH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIG1lcmdlIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VDb21tYW5kT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG4gIHByOiBudW1iZXI7XG4gIGJyYW5jaFByb21wdDogYm9vbGVhbjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKVxuICAgICAgLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAucG9zaXRpb25hbCgncHInLCB7XG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFBSIHRvIGJlIG1lcmdlZC4nLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2JyYW5jaC1wcm9tcHQnIGFzICdicmFuY2hQcm9tcHQnLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIHByb21wdCB0byBjb25maXJtIHRoZSBicmFuY2hlcyBhIFBSIHdpbGwgbWVyZ2UgaW50by4nLFxuICAgICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHIsIGJyYW5jaFByb21wdH06IEFyZ3VtZW50czxNZXJnZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCBtZXJnZVB1bGxSZXF1ZXN0KHByLCB7YnJhbmNoUHJvbXB0fSk7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IE1lcmdlQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgTWVyZ2VDb21tYW5kT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdtZXJnZSA8cHI+JyxcbiAgZGVzY3JpYmU6ICdNZXJnZSBhIFBSIGludG8gaXRzIHRhcmdldGVkIGJyYW5jaGVzLicsXG59O1xuIl19