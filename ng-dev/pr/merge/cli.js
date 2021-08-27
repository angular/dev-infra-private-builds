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
    return (0, github_yargs_1.addGithubTokenOption)(yargs)
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
    await (0, index_1.mergePullRequest)(pr, { branchPrompt });
}
/** yargs command module describing the command. */
exports.MergeCommandModule = {
    handler,
    builder,
    command: 'merge <pr>',
    describe: 'Merge a PR into its targeted branches.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3ByL21lcmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFJSCwrREFBa0U7QUFFbEUsbUNBQXlDO0FBU3pDLDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sSUFBQSxtQ0FBb0IsRUFBQyxLQUFLLENBQUM7U0FDL0IsSUFBSSxFQUFFO1NBQ04sTUFBTSxFQUFFO1NBQ1IsVUFBVSxDQUFDLElBQUksRUFBRTtRQUNoQixZQUFZLEVBQUUsSUFBSTtRQUNsQixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxzQkFBc0I7S0FDcEMsQ0FBQztTQUNELE1BQU0sQ0FBQyxlQUFpQyxFQUFFO1FBQ3pDLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixXQUFXLEVBQUUsaUVBQWlFO0tBQy9FLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCwyQkFBMkI7QUFDM0IsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLEVBQUUsRUFBRSxZQUFZLEVBQWlDO0lBQ3ZFLE1BQU0sSUFBQSx3QkFBZ0IsRUFBQyxFQUFFLEVBQUUsRUFBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSxrQkFBa0IsR0FBMkM7SUFDeEUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsWUFBWTtJQUNyQixRQUFRLEVBQUUsd0NBQXdDO0NBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHthZGRHaXRodWJUb2tlbk9wdGlvbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi15YXJncyc7XG5cbmltcG9ydCB7bWVyZ2VQdWxsUmVxdWVzdH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBUaGUgb3B0aW9ucyBhdmFpbGFibGUgdG8gdGhlIG1lcmdlIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTWVyZ2VDb21tYW5kT3B0aW9ucyB7XG4gIGdpdGh1YlRva2VuOiBzdHJpbmc7XG4gIHByOiBudW1iZXI7XG4gIGJyYW5jaFByb21wdDogYm9vbGVhbjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIGFkZEdpdGh1YlRva2VuT3B0aW9uKHlhcmdzKVxuICAgIC5oZWxwKClcbiAgICAuc3RyaWN0KClcbiAgICAucG9zaXRpb25hbCgncHInLCB7XG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIFBSIHRvIGJlIG1lcmdlZC4nLFxuICAgIH0pXG4gICAgLm9wdGlvbignYnJhbmNoLXByb21wdCcgYXMgJ2JyYW5jaFByb21wdCcsIHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gcHJvbXB0IHRvIGNvbmZpcm0gdGhlIGJyYW5jaGVzIGEgUFIgd2lsbCBtZXJnZSBpbnRvLicsXG4gICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cHIsIGJyYW5jaFByb21wdH06IEFyZ3VtZW50czxNZXJnZUNvbW1hbmRPcHRpb25zPikge1xuICBhd2FpdCBtZXJnZVB1bGxSZXF1ZXN0KHByLCB7YnJhbmNoUHJvbXB0fSk7XG59XG5cbi8qKiB5YXJncyBjb21tYW5kIG1vZHVsZSBkZXNjcmliaW5nIHRoZSBjb21tYW5kLiAqL1xuZXhwb3J0IGNvbnN0IE1lcmdlQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgTWVyZ2VDb21tYW5kT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICdtZXJnZSA8cHI+JyxcbiAgZGVzY3JpYmU6ICdNZXJnZSBhIFBSIGludG8gaXRzIHRhcmdldGVkIGJyYW5jaGVzLicsXG59O1xuIl19