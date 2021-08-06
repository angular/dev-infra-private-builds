"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MergeCommandModule = void 0;
const github_yargs_1 = require("../../utils/git/github-yargs");
const index_1 = require("./index");
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
async function handler({ pr, branchPrompt }) {
    await index_1.mergePullRequest(pr, { branchPrompt });
}
/** yargs command module describing the command. */
exports.MergeCommandModule = {
    handler,
    builder,
    command: 'merge <pr>',
    describe: 'Merge a PR into its targeted branches.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFJSCwrREFBa0U7QUFFbEUsbUNBQXlDO0FBU3pDLDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sbUNBQW9CLENBQUMsS0FBSyxDQUFDO1NBQy9CLElBQUksRUFBRTtTQUNOLE1BQU0sRUFBRTtTQUNSLFVBQVUsQ0FBQyxJQUFJLEVBQUU7UUFDaEIsWUFBWSxFQUFFLElBQUk7UUFDbEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0JBQXNCO0tBQ3BDLENBQUM7U0FDRCxNQUFNLENBQUMsZUFBaUMsRUFBRTtRQUN6QyxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsV0FBVyxFQUFFLGlFQUFpRTtLQUMvRSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxFQUFFLEVBQUUsWUFBWSxFQUFpQztJQUN2RSxNQUFNLHdCQUFnQixDQUFDLEVBQUUsRUFBRSxFQUFDLFlBQVksRUFBQyxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVELG1EQUFtRDtBQUN0QyxRQUFBLGtCQUFrQixHQUEyQztJQUN4RSxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSxZQUFZO0lBQ3JCLFFBQVEsRUFBRSx3Q0FBd0M7Q0FDbkQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2FkZEdpdGh1YlRva2VuT3B0aW9ufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXlhcmdzJztcblxuaW1wb3J0IHttZXJnZVB1bGxSZXF1ZXN0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIFRoZSBvcHRpb25zIGF2YWlsYWJsZSB0byB0aGUgbWVyZ2UgY29tbWFuZCB2aWEgQ0xJLiAqL1xuZXhwb3J0IGludGVyZmFjZSBNZXJnZUNvbW1hbmRPcHRpb25zIHtcbiAgZ2l0aHViVG9rZW46IHN0cmluZztcbiAgcHI6IG51bWJlcjtcbiAgYnJhbmNoUHJvbXB0OiBib29sZWFuO1xufVxuXG4vKiogQnVpbGRzIHRoZSBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcih5YXJnczogQXJndikge1xuICByZXR1cm4gYWRkR2l0aHViVG9rZW5PcHRpb24oeWFyZ3MpXG4gICAgLmhlbHAoKVxuICAgIC5zdHJpY3QoKVxuICAgIC5wb3NpdGlvbmFsKCdwcicsIHtcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIHR5cGU6ICdudW1iZXInLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgUFIgdG8gYmUgbWVyZ2VkLicsXG4gICAgfSlcbiAgICAub3B0aW9uKCdicmFuY2gtcHJvbXB0JyBhcyAnYnJhbmNoUHJvbXB0Jywge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0byBwcm9tcHQgdG8gY29uZmlybSB0aGUgYnJhbmNoZXMgYSBQUiB3aWxsIG1lcmdlIGludG8uJyxcbiAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtwciwgYnJhbmNoUHJvbXB0fTogQXJndW1lbnRzPE1lcmdlQ29tbWFuZE9wdGlvbnM+KSB7XG4gIGF3YWl0IG1lcmdlUHVsbFJlcXVlc3QocHIsIHticmFuY2hQcm9tcHR9KTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgTWVyZ2VDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBNZXJnZUNvbW1hbmRPcHRpb25zPiA9IHtcbiAgaGFuZGxlcixcbiAgYnVpbGRlcixcbiAgY29tbWFuZDogJ21lcmdlIDxwcj4nLFxuICBkZXNjcmliZTogJ01lcmdlIGEgUFIgaW50byBpdHMgdGFyZ2V0ZWQgYnJhbmNoZXMuJyxcbn07XG4iXX0=