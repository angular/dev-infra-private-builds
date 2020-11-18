(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range/validate-range", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateCommitRange = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var utils_1 = require("@angular/dev-infra-private/commit-message/utils");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    // Whether the provided commit is a fixup commit.
    var isNonFixup = function (commit) { return !commit.isFixup; };
    // Extracts commit header (first line of commit message).
    var extractCommitHeader = function (commit) { return commit.header; };
    /** Validate all commits in a provided git commit range. */
    function validateCommitRange(range) {
        /** A list of tuples of the commit header string and a list of error messages for the commit. */
        var errors = [];
        /** A list of parsed commit messages from the range. */
        var commits = utils_1.parseCommitMessagesForRange(range);
        console_1.info("Examining " + commits.length + " commit(s) in the provided range: " + range);
        /**
         * Whether all commits in the range are valid, commits are allowed to be fixup commits for other
         * commits in the provided commit range.
         */
        var allCommitsInRangeValid = commits.every(function (commit, i) {
            var options = {
                disallowSquash: true,
                nonFixupCommitHeaders: isNonFixup(commit) ?
                    undefined :
                    commits.slice(0, i).filter(isNonFixup).map(extractCommitHeader)
            };
            var _a = validate_1.validateCommitMessage(commit, options), valid = _a.valid, localErrors = _a.errors;
            if (localErrors.length) {
                errors.push([commit.header, localErrors]);
            }
            return valid;
        });
        if (allCommitsInRangeValid) {
            console_1.info('√  All commit messages in range valid.');
        }
        else {
            console_1.error('✘  Invalid commit message');
            errors.forEach(function (_a) {
                var _b = tslib_1.__read(_a, 2), header = _b[0], validationErrors = _b[1];
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUFnRDtJQUdoRCx5RUFBcUQ7SUFDckQsK0VBQXVHO0lBRXZHLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLE1BQTJCLElBQUssT0FBQSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQWYsQ0FBZSxDQUFDO0lBRXBFLHlEQUF5RDtJQUN6RCxJQUFNLG1CQUFtQixHQUFHLFVBQUMsTUFBMkIsSUFBSyxPQUFBLE1BQU0sQ0FBQyxNQUFNLEVBQWIsQ0FBYSxDQUFDO0lBRTNFLDJEQUEyRDtJQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFhO1FBQy9DLGdHQUFnRztRQUNoRyxJQUFNLE1BQU0sR0FBK0MsRUFBRSxDQUFDO1FBQzlELHVEQUF1RDtRQUN2RCxJQUFNLE9BQU8sR0FBRyxtQ0FBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxjQUFJLENBQUMsZUFBYSxPQUFPLENBQUMsTUFBTSwwQ0FBcUMsS0FBTyxDQUFDLENBQUM7UUFFOUU7OztXQUdHO1FBQ0gsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUM7WUFDckQsSUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLFNBQVMsQ0FBQyxDQUFDO29CQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7YUFDcEUsQ0FBQztZQUNJLElBQUEsS0FBK0IsZ0NBQXFCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFwRSxLQUFLLFdBQUEsRUFBVSxXQUFXLFlBQTBDLENBQUM7WUFDNUUsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksc0JBQXNCLEVBQUU7WUFDMUIsY0FBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLGVBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUEwQjtvQkFBMUIsS0FBQSxxQkFBMEIsRUFBekIsTUFBTSxRQUFBLEVBQUUsZ0JBQWdCLFFBQUE7Z0JBQ3ZDLGVBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLGdDQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3hDLGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUNILGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUF0Q0Qsa0RBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtQYXJzZWRDb21taXRNZXNzYWdlfSBmcm9tICcuLi9wYXJzZSc7XG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZXNGb3JSYW5nZX0gZnJvbSAnLi4vdXRpbHMnO1xuaW1wb3J0IHtwcmludFZhbGlkYXRpb25FcnJvcnMsIHZhbGlkYXRlQ29tbWl0TWVzc2FnZSwgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9uc30gZnJvbSAnLi4vdmFsaWRhdGUnO1xuXG4vLyBXaGV0aGVyIHRoZSBwcm92aWRlZCBjb21taXQgaXMgYSBmaXh1cCBjb21taXQuXG5jb25zdCBpc05vbkZpeHVwID0gKGNvbW1pdDogUGFyc2VkQ29tbWl0TWVzc2FnZSkgPT4gIWNvbW1pdC5pc0ZpeHVwO1xuXG4vLyBFeHRyYWN0cyBjb21taXQgaGVhZGVyIChmaXJzdCBsaW5lIG9mIGNvbW1pdCBtZXNzYWdlKS5cbmNvbnN0IGV4dHJhY3RDb21taXRIZWFkZXIgPSAoY29tbWl0OiBQYXJzZWRDb21taXRNZXNzYWdlKSA9PiBjb21taXQuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UocmFuZ2U6IHN0cmluZykge1xuICAvKiogQSBsaXN0IG9mIHR1cGxlcyBvZiB0aGUgY29tbWl0IGhlYWRlciBzdHJpbmcgYW5kIGEgbGlzdCBvZiBlcnJvciBtZXNzYWdlcyBmb3IgdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZXJyb3JzOiBbY29tbWl0SGVhZGVyOiBzdHJpbmcsIGVycm9yczogc3RyaW5nW11dW10gPSBbXTtcbiAgLyoqIEEgbGlzdCBvZiBwYXJzZWQgY29tbWl0IG1lc3NhZ2VzIGZyb20gdGhlIHJhbmdlLiAqL1xuICBjb25zdCBjb21taXRzID0gcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlKHJhbmdlKTtcbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlIGFyZSB2YWxpZCwgY29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAgKiBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gICAqL1xuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgoY29tbWl0LCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKGNvbW1pdCkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZSgwLCBpKS5maWx0ZXIoaXNOb25GaXh1cCkubWFwKGV4dHJhY3RDb21taXRIZWFkZXIpXG4gICAgfTtcbiAgICBjb25zdCB7dmFsaWQsIGVycm9yczogbG9jYWxFcnJvcnN9ID0gdmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdCwgb3B0aW9ucyk7XG4gICAgaWYgKGxvY2FsRXJyb3JzLmxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goW2NvbW1pdC5oZWFkZXIsIGxvY2FsRXJyb3JzXSk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZDtcbiAgfSk7XG5cbiAgaWYgKGFsbENvbW1pdHNJblJhbmdlVmFsaWQpIHtcbiAgICBpbmZvKCfiiJogIEFsbCBjb21taXQgbWVzc2FnZXMgaW4gcmFuZ2UgdmFsaWQuJyk7XG4gIH0gZWxzZSB7XG4gICAgZXJyb3IoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpO1xuICAgIGVycm9ycy5mb3JFYWNoKChbaGVhZGVyLCB2YWxpZGF0aW9uRXJyb3JzXSkgPT4ge1xuICAgICAgZXJyb3IuZ3JvdXAoaGVhZGVyKTtcbiAgICAgIHByaW50VmFsaWRhdGlvbkVycm9ycyh2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgIGVycm9yLmdyb3VwRW5kKCk7XG4gICAgfSk7XG4gICAgLy8gRXhpdCB3aXRoIGEgbm9uLXplcm8gZXhpdCBjb2RlIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIGhhdmVcbiAgICAvLyBiZWVuIGRpc2NvdmVyZWQuXG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=