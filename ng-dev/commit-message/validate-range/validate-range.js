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
    const commits = await (0, utils_1.getCommitsInRange)(from, to);
    (0, console_1.info)(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);
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
        const { valid, errors: localErrors } = (0, validate_1.validateCommitMessage)(commit, options);
        if (localErrors.length) {
            errors.push([commit.header, localErrors]);
        }
        return valid;
    });
    if (allCommitsInRangeValid) {
        (0, console_1.info)((0, console_1.green)('√  All commit messages in range valid.'));
    }
    else {
        (0, console_1.error)((0, console_1.red)('✘  Invalid commit message'));
        errors.forEach(([header, validationErrors]) => {
            console_1.error.group(header);
            (0, validate_1.printValidationErrors)(validationErrors);
            console_1.error.groupEnd();
        });
        // Exit with a non-zero exit code if invalid commit messages have
        // been discovered.
        process.exit(1);
    }
}
exports.validateCommitRange = validateCommitRange;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsaURBQTREO0FBRTVELG9DQUEyQztBQUMzQywwQ0FJcUI7QUFFckIsaURBQWlEO0FBQ2pELE1BQU0sVUFBVSxHQUFHLENBQUMsTUFBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7QUFFdkQseURBQXlEO0FBQ3pELE1BQU0sbUJBQW1CLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFFOUQsMkRBQTJEO0FBQ3BELEtBQUssVUFBVSxtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsRUFBVTtJQUNoRSxnR0FBZ0c7SUFDaEcsTUFBTSxNQUFNLEdBQStDLEVBQUUsQ0FBQztJQUU5RCx1REFBdUQ7SUFDdkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLHlCQUFpQixFQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNsRCxJQUFBLGNBQUksRUFBQyxhQUFhLE9BQU8sQ0FBQyxNQUFNLHFDQUFxQyxJQUFJLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVwRjs7O09BR0c7SUFDSCxNQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDekQsTUFBTSxPQUFPLEdBQWlDO1lBQzVDLGNBQWMsRUFBRSxJQUFJO1lBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUM7Z0JBQ3ZDLENBQUMsQ0FBQyxTQUFTO2dCQUNYLENBQUMsQ0FBQyxPQUFPO3FCQUNKLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO3FCQUNaLE1BQU0sQ0FBQyxVQUFVLENBQUM7cUJBQ2xCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQztTQUNoQyxDQUFDO1FBQ0YsTUFBTSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFDLEdBQUcsSUFBQSxnQ0FBcUIsRUFBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDNUUsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO1lBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7U0FDM0M7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0lBRUgsSUFBSSxzQkFBc0IsRUFBRTtRQUMxQixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyx3Q0FBd0MsQ0FBQyxDQUFDLENBQUM7S0FDdkQ7U0FBTTtRQUNMLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztRQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxFQUFFO1lBQzVDLGVBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEIsSUFBQSxnQ0FBcUIsRUFBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ3hDLGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNuQixDQUFDLENBQUMsQ0FBQztRQUNILGlFQUFpRTtRQUNqRSxtQkFBbUI7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtBQUNILENBQUM7QUExQ0Qsa0RBMENDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Q29tbWl0fSBmcm9tICcuLi9wYXJzZSc7XG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge1xuICBwcmludFZhbGlkYXRpb25FcnJvcnMsXG4gIHZhbGlkYXRlQ29tbWl0TWVzc2FnZSxcbiAgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyxcbn0gZnJvbSAnLi4vdmFsaWRhdGUnO1xuXG4vLyBXaGV0aGVyIHRoZSBwcm92aWRlZCBjb21taXQgaXMgYSBmaXh1cCBjb21taXQuXG5jb25zdCBpc05vbkZpeHVwID0gKGNvbW1pdDogQ29tbWl0KSA9PiAhY29tbWl0LmlzRml4dXA7XG5cbi8vIEV4dHJhY3RzIGNvbW1pdCBoZWFkZXIgKGZpcnN0IGxpbmUgb2YgY29tbWl0IG1lc3NhZ2UpLlxuY29uc3QgZXh0cmFjdENvbW1pdEhlYWRlciA9IChjb21taXQ6IENvbW1pdCkgPT4gY29tbWl0LmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKGZyb206IHN0cmluZywgdG86IHN0cmluZykge1xuICAvKiogQSBsaXN0IG9mIHR1cGxlcyBvZiB0aGUgY29tbWl0IGhlYWRlciBzdHJpbmcgYW5kIGEgbGlzdCBvZiBlcnJvciBtZXNzYWdlcyBmb3IgdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZXJyb3JzOiBbY29tbWl0SGVhZGVyOiBzdHJpbmcsIGVycm9yczogc3RyaW5nW11dW10gPSBbXTtcblxuICAvKiogQSBsaXN0IG9mIHBhcnNlZCBjb21taXQgbWVzc2FnZXMgZnJvbSB0aGUgcmFuZ2UuICovXG4gIGNvbnN0IGNvbW1pdHMgPSBhd2FpdCBnZXRDb21taXRzSW5SYW5nZShmcm9tLCB0byk7XG4gIGluZm8oYEV4YW1pbmluZyAke2NvbW1pdHMubGVuZ3RofSBjb21taXQocykgaW4gdGhlIHByb3ZpZGVkIHJhbmdlOiAke2Zyb219Li4ke3RvfWApO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGFsbCBjb21taXRzIGluIHRoZSByYW5nZSBhcmUgdmFsaWQsIGNvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgICogY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICAgKi9cbiAgY29uc3QgYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCA9IGNvbW1pdHMuZXZlcnkoKGNvbW1pdCwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChjb21taXQpXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogY29tbWl0c1xuICAgICAgICAgICAgLnNsaWNlKGkgKyAxKVxuICAgICAgICAgICAgLmZpbHRlcihpc05vbkZpeHVwKVxuICAgICAgICAgICAgLm1hcChleHRyYWN0Q29tbWl0SGVhZGVyKSxcbiAgICB9O1xuICAgIGNvbnN0IHt2YWxpZCwgZXJyb3JzOiBsb2NhbEVycm9yc30gPSB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoY29tbWl0LCBvcHRpb25zKTtcbiAgICBpZiAobG9jYWxFcnJvcnMubGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChbY29tbWl0LmhlYWRlciwgbG9jYWxFcnJvcnNdKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9KTtcblxuICBpZiAoYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCkge1xuICAgIGluZm8oZ3JlZW4oJ+KImiAgQWxsIGNvbW1pdCBtZXNzYWdlcyBpbiByYW5nZSB2YWxpZC4nKSk7XG4gIH0gZWxzZSB7XG4gICAgZXJyb3IocmVkKCfinJggIEludmFsaWQgY29tbWl0IG1lc3NhZ2UnKSk7XG4gICAgZXJyb3JzLmZvckVhY2goKFtoZWFkZXIsIHZhbGlkYXRpb25FcnJvcnNdKSA9PiB7XG4gICAgICBlcnJvci5ncm91cChoZWFkZXIpO1xuICAgICAgcHJpbnRWYWxpZGF0aW9uRXJyb3JzKHZhbGlkYXRpb25FcnJvcnMpO1xuICAgICAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgICB9KTtcbiAgICAvLyBFeGl0IHdpdGggYSBub24temVybyBleGl0IGNvZGUgaWYgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgaGF2ZVxuICAgIC8vIGJlZW4gZGlzY292ZXJlZC5cbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==