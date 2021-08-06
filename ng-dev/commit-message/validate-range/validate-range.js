"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCommitRange = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const console_1 = require("../../utils/console");
const utils_1 = require("../utils");
const validate_1 = require("../validate");
// Whether the provided commit is a fixup commit.
const isNonFixup = (commit) => !commit.isFixup;
// Extracts commit header (first line of commit message).
const extractCommitHeader = (commit) => commit.header;
/** Validate all commits in a provided git commit range. */
async function validateCommitRange(from, to) {
    /** A list of tuples of the commit header string and a list of error messages for the commit. */
    const errors = [];
    /** A list of parsed commit messages from the range. */
    const commits = await utils_1.getCommitsInRange(from, to);
    console_1.info(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);
    /**
     * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
     * commits in the provided commit range.
     */
    const allCommitsInRangeValid = commits.every((commit, i) => {
        const options = {
            disallowSquash: true,
            nonFixupCommitHeaders: isNonFixup(commit)
                ? undefined
                : commits
                    .slice(i + 1)
                    .filter(isNonFixup)
                    .map(extractCommitHeader),
        };
        const { valid, errors: localErrors } = validate_1.validateCommitMessage(commit, options);
        if (localErrors.length) {
            errors.push([commit.header, localErrors]);
        }
        return valid;
    });
    if (allCommitsInRangeValid) {
        console_1.info(console_1.green('√  All commit messages in range valid.'));
    }
    else {
        console_1.error(console_1.red('✘  Invalid commit message'));
        errors.forEach(([header, validationErrors]) => {
            console_1.error.group(header);
            validate_1.printValidationErrors(validationErrors);
            console_1.error.groupEnd();
        });
        // Exit with a non-zero exit code if invalid commit messages have
        // been discovered.
        process.exit(1);
    }
}
exports.validateCommitRange = validateCommitRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsaURBQTREO0FBRTVELG9DQUEyQztBQUMzQywwQ0FJcUI7QUFFckIsaURBQWlEO0FBQ2pELE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFFdkQseURBQXlEO0FBQ3pELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFFOUQsMkRBQTJEO0FBQ3BELEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsRUFBVTtJQUNoRSxnR0FBZ0c7SUFDaEcsTUFBTSxNQUFNLEdBQStDLEVBQUUsQ0FBQztJQUU5RCx1REFBdUQ7SUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSx5QkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbEQsY0FBSSxDQUFDLGFBQWEsT0FBTyxDQUFDLE1BQU0scUNBQXFDLElBQUksS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRXBGOzs7T0FHRztJQUNILE1BQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN6RCxNQUFNLE9BQU8sR0FBaUM7WUFDNUMsY0FBYyxFQUFFLElBQUk7WUFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQztnQkFDdkMsQ0FBQyxDQUFDLFNBQVM7Z0JBQ1gsQ0FBQyxDQUFDLE9BQU87cUJBQ0osS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQ1osTUFBTSxDQUFDLFVBQVUsQ0FBQztxQkFDbEIsR0FBRyxDQUFDLG1CQUFtQixDQUFDO1NBQ2hDLENBQUM7UUFDRixNQUFNLEVBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUMsR0FBRyxnQ0FBcUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUUsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxzQkFBc0IsRUFBRTtRQUMxQixjQUFJLENBQUMsZUFBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsQ0FBQztLQUN2RDtTQUFNO1FBQ0wsZUFBSyxDQUFDLGFBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtZQUM1QyxlQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3BCLGdDQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDeEMsZUFBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO1FBQ0gsaUVBQWlFO1FBQ2pFLG1CQUFtQjtRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0FBQ0gsQ0FBQztBQTFDRCxrREEwQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtDb21taXR9IGZyb20gJy4uL3BhcnNlJztcbmltcG9ydCB7Z2V0Q29tbWl0c0luUmFuZ2V9IGZyb20gJy4uL3V0aWxzJztcbmltcG9ydCB7XG4gIHByaW50VmFsaWRhdGlvbkVycm9ycyxcbiAgdmFsaWRhdGVDb21taXRNZXNzYWdlLFxuICBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zLFxufSBmcm9tICcuLi92YWxpZGF0ZSc7XG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAoY29tbWl0OiBDb21taXQpID0+ICFjb21taXQuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKGNvbW1pdDogQ29tbWl0KSA9PiBjb21taXQuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKSB7XG4gIC8qKiBBIGxpc3Qgb2YgdHVwbGVzIG9mIHRoZSBjb21taXQgaGVhZGVyIHN0cmluZyBhbmQgYSBsaXN0IG9mIGVycm9yIG1lc3NhZ2VzIGZvciB0aGUgY29tbWl0LiAqL1xuICBjb25zdCBlcnJvcnM6IFtjb21taXRIZWFkZXI6IHN0cmluZywgZXJyb3JzOiBzdHJpbmdbXV1bXSA9IFtdO1xuXG4gIC8qKiBBIGxpc3Qgb2YgcGFyc2VkIGNvbW1pdCBtZXNzYWdlcyBmcm9tIHRoZSByYW5nZS4gKi9cbiAgY29uc3QgY29tbWl0cyA9IGF3YWl0IGdldENvbW1pdHNJblJhbmdlKGZyb20sIHRvKTtcbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7ZnJvbX0uLiR7dG99YCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlIGFyZSB2YWxpZCwgY29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAgKiBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gICAqL1xuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgoY29tbWl0LCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKGNvbW1pdClcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiBjb21taXRzXG4gICAgICAgICAgICAuc2xpY2UoaSArIDEpXG4gICAgICAgICAgICAuZmlsdGVyKGlzTm9uRml4dXApXG4gICAgICAgICAgICAubWFwKGV4dHJhY3RDb21taXRIZWFkZXIpLFxuICAgIH07XG4gICAgY29uc3Qge3ZhbGlkLCBlcnJvcnM6IGxvY2FsRXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXQsIG9wdGlvbnMpO1xuICAgIGlmIChsb2NhbEVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFtjb21taXQuaGVhZGVyLCBsb2NhbEVycm9yc10pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbyhncmVlbign4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpKTtcbiAgfSBlbHNlIHtcbiAgICBlcnJvcihyZWQoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpKTtcbiAgICBlcnJvcnMuZm9yRWFjaCgoW2hlYWRlciwgdmFsaWRhdGlvbkVycm9yc10pID0+IHtcbiAgICAgIGVycm9yLmdyb3VwKGhlYWRlcik7XG4gICAgICBwcmludFZhbGlkYXRpb25FcnJvcnModmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICBlcnJvci5ncm91cEVuZCgpO1xuICAgIH0pO1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19