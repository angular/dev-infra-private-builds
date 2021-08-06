"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRangeModule = void 0;
const console_1 = require("../../utils/console");
const validate_range_1 = require("./validate-range");
/** Builds the command. */
function builder(yargs) {
    return yargs
        .positional('startingRef', {
        description: 'The first ref in the range to select',
        type: 'string',
        demandOption: true,
    })
        .positional('endingRef', {
        description: 'The last ref in the range to select',
        type: 'string',
        default: 'HEAD',
    });
}
/** Handles the command. */
async function handler({ startingRef, endingRef }) {
    // If on CI, and no pull request number is provided, assume the branch
    // being run on is an upstream branch.
    if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
        console_1.info(`Since valid commit messages are enforced by PR linting on CI, we do not`);
        console_1.info(`need to validate commit messages on CI runs on upstream branches.`);
        console_1.info();
        console_1.info(`Skipping check of provided commit range`);
        return;
    }
    await validate_range_1.validateCommitRange(startingRef, endingRef);
}
/** yargs command module describing the command. */
exports.ValidateRangeModule = {
    handler,
    builder,
    command: 'validate-range <starting-ref> [ending-ref]',
    describe: 'Validate a range of commit messages',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLXJhbmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFJSCxpREFBeUM7QUFFekMscURBQXFEO0FBT3JELDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sS0FBSztTQUNULFVBQVUsQ0FBQyxhQUFhLEVBQUU7UUFDekIsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7U0FDRCxVQUFVLENBQUMsV0FBVyxFQUFFO1FBQ3ZCLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQUUsU0FBUyxFQUFrQztJQUM5RSxzRUFBc0U7SUFDdEUsc0NBQXNDO0lBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxFQUFFO1FBQ25FLGNBQUksQ0FBQyx5RUFBeUUsQ0FBQyxDQUFDO1FBQ2hGLGNBQUksQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1FBQzFFLGNBQUksRUFBRSxDQUFDO1FBQ1AsY0FBSSxDQUFDLHlDQUF5QyxDQUFDLENBQUM7UUFDaEQsT0FBTztLQUNSO0lBQ0QsTUFBTSxvQ0FBbUIsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDcEQsQ0FBQztBQUVELG1EQUFtRDtBQUN0QyxRQUFBLG1CQUFtQixHQUE0QztJQUMxRSxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSw0Q0FBNEM7SUFDckQsUUFBUSxFQUFFLHFDQUFxQztDQUNoRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7dmFsaWRhdGVDb21taXRSYW5nZX0gZnJvbSAnLi92YWxpZGF0ZS1yYW5nZSc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVSYW5nZU9wdGlvbnMge1xuICBzdGFydGluZ1JlZjogc3RyaW5nO1xuICBlbmRpbmdSZWY6IHN0cmluZztcbn1cblxuLyoqIEJ1aWxkcyB0aGUgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoeWFyZ3M6IEFyZ3YpIHtcbiAgcmV0dXJuIHlhcmdzXG4gICAgLnBvc2l0aW9uYWwoJ3N0YXJ0aW5nUmVmJywge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZmlyc3QgcmVmIGluIHRoZSByYW5nZSB0byBzZWxlY3QnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgfSlcbiAgICAucG9zaXRpb25hbCgnZW5kaW5nUmVmJywge1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgbGFzdCByZWYgaW4gdGhlIHJhbmdlIHRvIHNlbGVjdCcsXG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlZmF1bHQ6ICdIRUFEJyxcbiAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtzdGFydGluZ1JlZiwgZW5kaW5nUmVmfTogQXJndW1lbnRzPFZhbGlkYXRlUmFuZ2VPcHRpb25zPikge1xuICAvLyBJZiBvbiBDSSwgYW5kIG5vIHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gIC8vIGJlaW5nIHJ1biBvbiBpcyBhbiB1cHN0cmVhbSBicmFuY2guXG4gIGlmIChwcm9jZXNzLmVudlsnQ0knXSAmJiBwcm9jZXNzLmVudlsnQ0lfUFVMTF9SRVFVRVNUJ10gPT09ICdmYWxzZScpIHtcbiAgICBpbmZvKGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdGApO1xuICAgIGluZm8oYG5lZWQgdG8gdmFsaWRhdGUgY29tbWl0IG1lc3NhZ2VzIG9uIENJIHJ1bnMgb24gdXBzdHJlYW0gYnJhbmNoZXMuYCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgIHJldHVybjtcbiAgfVxuICBhd2FpdCB2YWxpZGF0ZUNvbW1pdFJhbmdlKHN0YXJ0aW5nUmVmLCBlbmRpbmdSZWYpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gKi9cbmV4cG9ydCBjb25zdCBWYWxpZGF0ZVJhbmdlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBWYWxpZGF0ZVJhbmdlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICd2YWxpZGF0ZS1yYW5nZSA8c3RhcnRpbmctcmVmPiBbZW5kaW5nLXJlZl0nLFxuICBkZXNjcmliZTogJ1ZhbGlkYXRlIGEgcmFuZ2Ugb2YgY29tbWl0IG1lc3NhZ2VzJyxcbn07XG4iXX0=