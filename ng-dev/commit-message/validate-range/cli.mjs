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
        (0, console_1.info)(`Since valid commit messages are enforced by PR linting on CI, we do not`);
        (0, console_1.info)(`need to validate commit messages on CI runs on upstream branches.`);
        (0, console_1.info)();
        (0, console_1.info)(`Skipping check of provided commit range`);
        return;
    }
    await (0, validate_range_1.validateCommitRange)(startingRef, endingRef);
}
/** yargs command module describing the command. */
exports.ValidateRangeModule = {
    handler,
    builder,
    command: 'validate-range <starting-ref> [ending-ref]',
    describe: 'Validate a range of commit messages',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L2NvbW1pdC1tZXNzYWdlL3ZhbGlkYXRlLXJhbmdlL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFJSCxpREFBeUM7QUFFekMscURBQXFEO0FBT3JELDBCQUEwQjtBQUMxQixTQUFTLE9BQU8sQ0FBQyxLQUFXO0lBQzFCLE9BQU8sS0FBSztTQUNULFVBQVUsQ0FBQyxhQUFhLEVBQUU7UUFDekIsV0FBVyxFQUFFLHNDQUFzQztRQUNuRCxJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7U0FDRCxVQUFVLENBQUMsV0FBVyxFQUFFO1FBQ3ZCLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsMkJBQTJCO0FBQzNCLEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxXQUFXLEVBQUUsU0FBUyxFQUFrQztJQUM5RSxzRUFBc0U7SUFDdEUsc0NBQXNDO0lBQ3RDLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEtBQUssT0FBTyxFQUFFO1FBQ25FLElBQUEsY0FBSSxFQUFDLHlFQUF5RSxDQUFDLENBQUM7UUFDaEYsSUFBQSxjQUFJLEVBQUMsbUVBQW1FLENBQUMsQ0FBQztRQUMxRSxJQUFBLGNBQUksR0FBRSxDQUFDO1FBQ1AsSUFBQSxjQUFJLEVBQUMseUNBQXlDLENBQUMsQ0FBQztRQUNoRCxPQUFPO0tBQ1I7SUFDRCxNQUFNLElBQUEsb0NBQW1CLEVBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3BELENBQUM7QUFFRCxtREFBbUQ7QUFDdEMsUUFBQSxtQkFBbUIsR0FBNEM7SUFDMUUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsNENBQTRDO0lBQ3JELFFBQVEsRUFBRSxxQ0FBcUM7Q0FDaEQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0UmFuZ2V9IGZyb20gJy4vdmFsaWRhdGUtcmFuZ2UnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlUmFuZ2VPcHRpb25zIHtcbiAgc3RhcnRpbmdSZWY6IHN0cmluZztcbiAgZW5kaW5nUmVmOiBzdHJpbmc7XG59XG5cbi8qKiBCdWlsZHMgdGhlIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKHlhcmdzOiBBcmd2KSB7XG4gIHJldHVybiB5YXJnc1xuICAgIC5wb3NpdGlvbmFsKCdzdGFydGluZ1JlZicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGZpcnN0IHJlZiBpbiB0aGUgcmFuZ2UgdG8gc2VsZWN0JyxcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgIH0pXG4gICAgLnBvc2l0aW9uYWwoJ2VuZGluZ1JlZicsIHtcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGxhc3QgcmVmIGluIHRoZSByYW5nZSB0byBzZWxlY3QnLFxuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnSEVBRCcsXG4gICAgfSk7XG59XG5cbi8qKiBIYW5kbGVzIHRoZSBjb21tYW5kLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7c3RhcnRpbmdSZWYsIGVuZGluZ1JlZn06IEFyZ3VtZW50czxWYWxpZGF0ZVJhbmdlT3B0aW9ucz4pIHtcbiAgLy8gSWYgb24gQ0ksIGFuZCBubyBwdWxsIHJlcXVlc3QgbnVtYmVyIGlzIHByb3ZpZGVkLCBhc3N1bWUgdGhlIGJyYW5jaFxuICAvLyBiZWluZyBydW4gb24gaXMgYW4gdXBzdHJlYW0gYnJhbmNoLlxuICBpZiAocHJvY2Vzcy5lbnZbJ0NJJ10gJiYgcHJvY2Vzcy5lbnZbJ0NJX1BVTExfUkVRVUVTVCddID09PSAnZmFsc2UnKSB7XG4gICAgaW5mbyhgU2luY2UgdmFsaWQgY29tbWl0IG1lc3NhZ2VzIGFyZSBlbmZvcmNlZCBieSBQUiBsaW50aW5nIG9uIENJLCB3ZSBkbyBub3RgKTtcbiAgICBpbmZvKGBuZWVkIHRvIHZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlcyBvbiBDSSBydW5zIG9uIHVwc3RyZWFtIGJyYW5jaGVzLmApO1xuICAgIGluZm8oKTtcbiAgICBpbmZvKGBTa2lwcGluZyBjaGVjayBvZiBwcm92aWRlZCBjb21taXQgcmFuZ2VgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgYXdhaXQgdmFsaWRhdGVDb21taXRSYW5nZShzdGFydGluZ1JlZiwgZW5kaW5nUmVmKTtcbn1cblxuLyoqIHlhcmdzIGNvbW1hbmQgbW9kdWxlIGRlc2NyaWJpbmcgdGhlIGNvbW1hbmQuICovXG5leHBvcnQgY29uc3QgVmFsaWRhdGVSYW5nZU1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgVmFsaWRhdGVSYW5nZU9wdGlvbnM+ID0ge1xuICBoYW5kbGVyLFxuICBidWlsZGVyLFxuICBjb21tYW5kOiAndmFsaWRhdGUtcmFuZ2UgPHN0YXJ0aW5nLXJlZj4gW2VuZGluZy1yZWZdJyxcbiAgZGVzY3JpYmU6ICdWYWxpZGF0ZSBhIHJhbmdlIG9mIGNvbW1pdCBtZXNzYWdlcycsXG59O1xuIl19