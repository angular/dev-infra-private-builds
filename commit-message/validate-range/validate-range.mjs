import { __awaiter } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { error, green, info, red } from '../../utils/console';
import { getCommitsInRange } from '../utils';
import { printValidationErrors, validateCommitMessage } from '../validate';
// Whether the provided commit is a fixup commit.
const isNonFixup = (commit) => !commit.isFixup;
// Extracts commit header (first line of commit message).
const extractCommitHeader = (commit) => commit.header;
/** Validate all commits in a provided git commit range. */
export function validateCommitRange(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        /** A list of tuples of the commit header string and a list of error messages for the commit. */
        const errors = [];
        /** A list of parsed commit messages from the range. */
        const commits = yield getCommitsInRange(from, to);
        info(`Examining ${commits.length} commit(s) in the provided range: ${from}..${to}`);
        /**
         * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
         * commits in the provided commit range.
         */
        const allCommitsInRangeValid = commits.every((commit, i) => {
            const options = {
                disallowSquash: true,
                nonFixupCommitHeaders: isNonFixup(commit) ?
                    undefined :
                    commits.slice(i + 1).filter(isNonFixup).map(extractCommitHeader)
            };
            const { valid, errors: localErrors } = validateCommitMessage(commit, options);
            if (localErrors.length) {
                errors.push([commit.header, localErrors]);
            }
            return valid;
        });
        if (allCommitsInRangeValid) {
            info(green('√  All commit messages in range valid.'));
        }
        else {
            error(red('✘  Invalid commit message'));
            errors.forEach(([header, validationErrors]) => {
                error.group(header);
                printValidationErrors(validationErrors);
                error.groupEnd();
            });
            // Exit with a non-zero exit code if invalid commit messages have
            // been discovered.
            process.exit(1);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUU1RCxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDM0MsT0FBTyxFQUFDLHFCQUFxQixFQUFFLHFCQUFxQixFQUErQixNQUFNLGFBQWEsQ0FBQztBQUV2RyxpREFBaUQ7QUFDakQsTUFBTSxVQUFVLEdBQUcsQ0FBQyxNQUFjLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUV2RCx5REFBeUQ7QUFDekQsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLE1BQWMsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUU5RCwyREFBMkQ7QUFDM0QsTUFBTSxVQUFnQixtQkFBbUIsQ0FBQyxJQUFZLEVBQUUsRUFBVTs7UUFDaEUsZ0dBQWdHO1FBQ2hHLE1BQU0sTUFBTSxHQUErQyxFQUFFLENBQUM7UUFFOUQsdURBQXVEO1FBQ3ZELE1BQU0sT0FBTyxHQUFHLE1BQU0saUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ2xELElBQUksQ0FBQyxhQUFhLE9BQU8sQ0FBQyxNQUFNLHFDQUFxQyxJQUFJLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVwRjs7O1dBR0c7UUFDSCxNQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDekQsTUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLFNBQVMsQ0FBQyxDQUFDO29CQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7YUFDckUsQ0FBQztZQUNGLE1BQU0sRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxHQUFHLHFCQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztZQUM1RSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQ3RCLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7YUFDM0M7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxzQkFBc0IsRUFBRTtZQUMxQixJQUFJLENBQUMsS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUMsQ0FBQztTQUN2RDthQUFNO1lBQ0wsS0FBSyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7WUFDeEMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsRUFBRTtnQkFDNUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEIscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDeEMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ25CLENBQUMsQ0FBQyxDQUFDO1lBQ0gsaUVBQWlFO1lBQ2pFLG1CQUFtQjtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Q29tbWl0fSBmcm9tICcuLi9wYXJzZSc7XG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi91dGlscyc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuLi92YWxpZGF0ZSc7XG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAoY29tbWl0OiBDb21taXQpID0+ICFjb21taXQuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKGNvbW1pdDogQ29tbWl0KSA9PiBjb21taXQuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UoZnJvbTogc3RyaW5nLCB0bzogc3RyaW5nKSB7XG4gIC8qKiBBIGxpc3Qgb2YgdHVwbGVzIG9mIHRoZSBjb21taXQgaGVhZGVyIHN0cmluZyBhbmQgYSBsaXN0IG9mIGVycm9yIG1lc3NhZ2VzIGZvciB0aGUgY29tbWl0LiAqL1xuICBjb25zdCBlcnJvcnM6IFtjb21taXRIZWFkZXI6IHN0cmluZywgZXJyb3JzOiBzdHJpbmdbXV1bXSA9IFtdO1xuXG4gIC8qKiBBIGxpc3Qgb2YgcGFyc2VkIGNvbW1pdCBtZXNzYWdlcyBmcm9tIHRoZSByYW5nZS4gKi9cbiAgY29uc3QgY29tbWl0cyA9IGF3YWl0IGdldENvbW1pdHNJblJhbmdlKGZyb20sIHRvKTtcbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7ZnJvbX0uLiR7dG99YCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlIGFyZSB2YWxpZCwgY29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAgKiBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gICAqL1xuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgoY29tbWl0LCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKGNvbW1pdCkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZShpICsgMSkuZmlsdGVyKGlzTm9uRml4dXApLm1hcChleHRyYWN0Q29tbWl0SGVhZGVyKVxuICAgIH07XG4gICAgY29uc3Qge3ZhbGlkLCBlcnJvcnM6IGxvY2FsRXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXQsIG9wdGlvbnMpO1xuICAgIGlmIChsb2NhbEVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFtjb21taXQuaGVhZGVyLCBsb2NhbEVycm9yc10pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbyhncmVlbign4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpKTtcbiAgfSBlbHNlIHtcbiAgICBlcnJvcihyZWQoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpKTtcbiAgICBlcnJvcnMuZm9yRWFjaCgoW2hlYWRlciwgdmFsaWRhdGlvbkVycm9yc10pID0+IHtcbiAgICAgIGVycm9yLmdyb3VwKGhlYWRlcik7XG4gICAgICBwcmludFZhbGlkYXRpb25FcnJvcnModmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICBlcnJvci5ncm91cEVuZCgpO1xuICAgIH0pO1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19