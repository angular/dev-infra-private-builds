/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { info } from '../../utils/console';
import { validateCommitRange } from './validate-range';
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
function handler({ startingRef, endingRef }) {
    return __awaiter(this, void 0, void 0, function* () {
        // If on CI, and no pull request number is provided, assume the branch
        // being run on is an upstream branch.
        if (process.env['CI'] && process.env['CI_PULL_REQUEST'] === 'false') {
            info(`Since valid commit messages are enforced by PR linting on CI, we do not`);
            info(`need to validate commit messages on CI runs on upstream branches.`);
            info();
            info(`Skipping check of provided commit range`);
            return;
        }
        yield validateCommitRange(startingRef, endingRef);
    });
}
/** yargs command module describing the command. */
export const ValidateRangeModule = {
    handler,
    builder,
    command: 'validate-range <starting-ref> [ending-ref]',
    describe: 'Validate a range of commit messages',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLXJhbmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBSUgsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRXpDLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBUXJELDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sS0FBSztTQUNQLFVBQVUsQ0FBQyxhQUFhLEVBQUU7UUFDekIsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7U0FDRCxVQUFVLENBQUMsV0FBVyxFQUFFO1FBQ3ZCLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDLENBQUM7QUFDVCxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLFNBQWUsT0FBTyxDQUFDLEVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBa0M7O1FBQzlFLHNFQUFzRTtRQUN0RSxzQ0FBc0M7UUFDdEMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsS0FBSyxPQUFPLEVBQUU7WUFDbkUsSUFBSSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7WUFDaEYsSUFBSSxDQUFDLG1FQUFtRSxDQUFDLENBQUM7WUFDMUUsSUFBSSxFQUFFLENBQUM7WUFDUCxJQUFJLENBQUMseUNBQXlDLENBQUMsQ0FBQztZQUNoRCxPQUFPO1NBQ1I7UUFDRCxNQUFNLG1CQUFtQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNwRCxDQUFDO0NBQUE7QUFFRCxtREFBbUQ7QUFDbkQsTUFBTSxDQUFDLE1BQU0sbUJBQW1CLEdBQTRDO0lBQzFFLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDRDQUE0QztJQUNyRCxRQUFRLEVBQUUscUNBQXFDO0NBQ2hELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdFJhbmdlfSBmcm9tICcuL3ZhbGlkYXRlLXJhbmdlJztcblxuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlUmFuZ2VPcHRpb25zIHtcbiAgc3RhcnRpbmdSZWY6IHN0cmluZztcbiAgZW5kaW5nUmVmOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLnBvc2l0aW9uYWwoJ3N0YXJ0aW5nUmVmJywge1xuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBmaXJzdCByZWYgaW4gdGhlIHJhbmdlIHRvIHNlbGVjdCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICB9KVxuICAgICAgLnBvc2l0aW9uYWwoJ2VuZGluZ1JlZicsIHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgbGFzdCByZWYgaW4gdGhlIHJhbmdlIHRvIHNlbGVjdCcsXG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZWZhdWx0OiAnSEVBRCcsXG4gICAgICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGNvbW1hbmQuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtzdGFydGluZ1JlZiwgZW5kaW5nUmVmfTogQXJndW1lbnRzPFZhbGlkYXRlUmFuZ2VPcHRpb25zPikge1xuICAvLyBJZiBvbiBDSSwgYW5kIG5vIHB1bGwgcmVxdWVzdCBudW1iZXIgaXMgcHJvdmlkZWQsIGFzc3VtZSB0aGUgYnJhbmNoXG4gIC8vIGJlaW5nIHJ1biBvbiBpcyBhbiB1cHN0cmVhbSBicmFuY2guXG4gIGlmIChwcm9jZXNzLmVudlsnQ0knXSAmJiBwcm9jZXNzLmVudlsnQ0lfUFVMTF9SRVFVRVNUJ10gPT09ICdmYWxzZScpIHtcbiAgICBpbmZvKGBTaW5jZSB2YWxpZCBjb21taXQgbWVzc2FnZXMgYXJlIGVuZm9yY2VkIGJ5IFBSIGxpbnRpbmcgb24gQ0ksIHdlIGRvIG5vdGApO1xuICAgIGluZm8oYG5lZWQgdG8gdmFsaWRhdGUgY29tbWl0IG1lc3NhZ2VzIG9uIENJIHJ1bnMgb24gdXBzdHJlYW0gYnJhbmNoZXMuYCk7XG4gICAgaW5mbygpO1xuICAgIGluZm8oYFNraXBwaW5nIGNoZWNrIG9mIHByb3ZpZGVkIGNvbW1pdCByYW5nZWApO1xuICAgIHJldHVybjtcbiAgfVxuICBhd2FpdCB2YWxpZGF0ZUNvbW1pdFJhbmdlKHN0YXJ0aW5nUmVmLCBlbmRpbmdSZWYpO1xufVxuXG4vKiogeWFyZ3MgY29tbWFuZCBtb2R1bGUgZGVzY3JpYmluZyB0aGUgY29tbWFuZC4gKi9cbmV4cG9ydCBjb25zdCBWYWxpZGF0ZVJhbmdlTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBWYWxpZGF0ZVJhbmdlT3B0aW9ucz4gPSB7XG4gIGhhbmRsZXIsXG4gIGJ1aWxkZXIsXG4gIGNvbW1hbmQ6ICd2YWxpZGF0ZS1yYW5nZSA8c3RhcnRpbmctcmVmPiBbZW5kaW5nLXJlZl0nLFxuICBkZXNjcmliZTogJ1ZhbGlkYXRlIGEgcmFuZ2Ugb2YgY29tbWl0IG1lc3NhZ2VzJyxcbn07XG4iXX0=