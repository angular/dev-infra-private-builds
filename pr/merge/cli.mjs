/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator } from "tslib";
import { addGithubTokenOption } from '../../utils/git/github-yargs';
import { mergePullRequest } from './index';
/** Builds the command. */
function builder(yargs) {
    return addGithubTokenOption(yargs)
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
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, mergePullRequest(pr, { branchPrompt: branchPrompt })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/** yargs command module describing the command. */
export var MergeCommandModule = {
    handler: handler,
    builder: builder,
    command: 'merge <pr>',
    describe: 'Merge a PR into its targeted branches.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFDLG9CQUFvQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFFbEUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBU3pDLDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sb0JBQW9CLENBQUMsS0FBSyxDQUFDO1NBQzdCLElBQUksRUFBRTtTQUNOLE1BQU0sRUFBRTtTQUNSLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDaEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0JBQXNCO0tBQ3BDLENBQUM7U0FDRCxNQUFNLENBQUMsZUFBaUMsRUFBRTtRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsV0FBVyxFQUFFLGlFQUFpRTtLQUMvRSxDQUFDLENBQUM7QUFDVCxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQWtEO1FBQWpELEVBQUUsUUFBQSxFQUFFLFlBQVksa0JBQUE7Ozs7d0JBQ3RDLHFCQUFNLGdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFDLFlBQVksY0FBQSxFQUFDLENBQUMsRUFBQTs7b0JBQTFDLFNBQTBDLENBQUM7Ozs7O0NBQzVDO0FBRUQsbURBQW1EO0FBQ25ELE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUEyQztJQUN4RSxPQUFPLFNBQUE7SUFDUCxPQUFPLFNBQUE7SUFDUCxPQUFPLEVBQUUsWUFBWTtJQUNyQixRQUFRLEVBQUUsd0NBQXdDO0NBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5cbmltcG9ydCB7bWVyZ2VQdWxsUmVxdWVzdH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIG1lcmdlIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VDb21tYW5kT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG4gIHByOiBudW1iZXI7XG4gIGJyYW5jaFByb21wdDogYm9vbGVhbjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKVxuICAgICAgLmhlbHAoKVxuICAgICAgLnN0cmljdCgpXG4gICAgICAucG9zaXRpb25hbCgncHInLCB7XG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgICAgdHlwZTogJ251bWJlcicsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFBSIHRvIGJlIG1lcmdlZC4nLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ2JyYW5jaC1wcm9tcHQnIGFzICdicmFuY2hQcm9tcHQnLCB7XG4gICAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRvIHByb21wdCB0byBjb25maXJtIHRoZSBicmFuY2hlcyBhIFBSIHdpbGwgbWVyZ2UgaW50by4nLFxuICAgICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHIsIGJyYW5jaFByb21wdH06IEFyZ3VtZW50czxNZXJnZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCBtZXJnZVB1bGxSZXF1ZXN0KHByLCB7YnJhbmNoUHJvbXB0fSk7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IE1lcmdlQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgTWVyZ2VDb21tYW5kT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdtZXJnZSA8cHI+JyxcbiAgZGVzY3JpYmU6ICdNZXJnZSBhIFBSIGludG8gaXRzIHRhcmdldGVkIGJyYW5jaGVzLicsXG59O1xuIl19