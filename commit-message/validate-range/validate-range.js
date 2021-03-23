(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range/validate-range", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/commit-message/validate"], factory);
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
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
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
        var commits = parse_1.parseCommitMessagesForRange(range);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUFnRDtJQUNoRCx5RUFBNkQ7SUFDN0QsK0VBQXVHO0lBRXZHLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLE1BQWMsSUFBSyxPQUFBLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBZixDQUFlLENBQUM7SUFFdkQseURBQXlEO0lBQ3pELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxNQUFjLElBQUssT0FBQSxNQUFNLENBQUMsTUFBTSxFQUFiLENBQWEsQ0FBQztJQUU5RCwyREFBMkQ7SUFDM0QsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYTtRQUMvQyxnR0FBZ0c7UUFDaEcsSUFBTSxNQUFNLEdBQStDLEVBQUUsQ0FBQztRQUM5RCx1REFBdUQ7UUFDdkQsSUFBTSxPQUFPLEdBQUcsbUNBQTJCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkQsY0FBSSxDQUFDLGVBQWEsT0FBTyxDQUFDLE1BQU0sMENBQXFDLEtBQU8sQ0FBQyxDQUFDO1FBRTlFOzs7V0FHRztRQUNILElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3JELElBQU0sT0FBTyxHQUFpQztnQkFDNUMsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO29CQUN2QyxTQUFTLENBQUMsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ3BFLENBQUM7WUFDSSxJQUFBLEtBQStCLGdDQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsRUFBcEUsS0FBSyxXQUFBLEVBQVUsV0FBVyxZQUEwQyxDQUFDO1lBQzVFLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUMzQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLHNCQUFzQixFQUFFO1lBQzFCLGNBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDTCxlQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBMEI7b0JBQTFCLEtBQUEscUJBQTBCLEVBQXpCLE1BQU0sUUFBQSxFQUFFLGdCQUFnQixRQUFBO2dCQUN2QyxlQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixnQ0FBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN4QyxlQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxpRUFBaUU7WUFDakUsbUJBQW1CO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBdENELGtEQXNDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlfSBmcm9tICcuLi9wYXJzZSc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuLi92YWxpZGF0ZSc7XG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAoY29tbWl0OiBDb21taXQpID0+ICFjb21taXQuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKGNvbW1pdDogQ29tbWl0KSA9PiBjb21taXQuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UocmFuZ2U6IHN0cmluZykge1xuICAvKiogQSBsaXN0IG9mIHR1cGxlcyBvZiB0aGUgY29tbWl0IGhlYWRlciBzdHJpbmcgYW5kIGEgbGlzdCBvZiBlcnJvciBtZXNzYWdlcyBmb3IgdGhlIGNvbW1pdC4gKi9cbiAgY29uc3QgZXJyb3JzOiBbY29tbWl0SGVhZGVyOiBzdHJpbmcsIGVycm9yczogc3RyaW5nW11dW10gPSBbXTtcbiAgLyoqIEEgbGlzdCBvZiBwYXJzZWQgY29tbWl0IG1lc3NhZ2VzIGZyb20gdGhlIHJhbmdlLiAqL1xuICBjb25zdCBjb21taXRzID0gcGFyc2VDb21taXRNZXNzYWdlc0ZvclJhbmdlKHJhbmdlKTtcbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlIGFyZSB2YWxpZCwgY29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAgKiBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gICAqL1xuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgoY29tbWl0LCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKGNvbW1pdCkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZSgwLCBpKS5maWx0ZXIoaXNOb25GaXh1cCkubWFwKGV4dHJhY3RDb21taXRIZWFkZXIpXG4gICAgfTtcbiAgICBjb25zdCB7dmFsaWQsIGVycm9yczogbG9jYWxFcnJvcnN9ID0gdmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdCwgb3B0aW9ucyk7XG4gICAgaWYgKGxvY2FsRXJyb3JzLmxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goW2NvbW1pdC5oZWFkZXIsIGxvY2FsRXJyb3JzXSk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZDtcbiAgfSk7XG5cbiAgaWYgKGFsbENvbW1pdHNJblJhbmdlVmFsaWQpIHtcbiAgICBpbmZvKCfiiJogIEFsbCBjb21taXQgbWVzc2FnZXMgaW4gcmFuZ2UgdmFsaWQuJyk7XG4gIH0gZWxzZSB7XG4gICAgZXJyb3IoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpO1xuICAgIGVycm9ycy5mb3JFYWNoKChbaGVhZGVyLCB2YWxpZGF0aW9uRXJyb3JzXSkgPT4ge1xuICAgICAgZXJyb3IuZ3JvdXAoaGVhZGVyKTtcbiAgICAgIHByaW50VmFsaWRhdGlvbkVycm9ycyh2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgIGVycm9yLmdyb3VwRW5kKCk7XG4gICAgfSk7XG4gICAgLy8gRXhpdCB3aXRoIGEgbm9uLXplcm8gZXhpdCBjb2RlIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIGhhdmVcbiAgICAvLyBiZWVuIGRpc2NvdmVyZWQuXG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=