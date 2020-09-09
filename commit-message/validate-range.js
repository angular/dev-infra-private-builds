(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/shelljs", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/commit-message/validate"], factory);
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
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    // Whether the provided commit is a fixup commit.
    var isNonFixup = function (m) { return !parse_1.parseCommitMessage(m).isFixup; };
    // Extracts commit header (first line of commit message).
    var extractCommitHeader = function (m) { return parse_1.parseCommitMessage(m).header; };
    /** Validate all commits in a provided git commit range. */
    function validateCommitRange(range) {
        /**
         * A random value is used as a string to allow for a definite split point in the git log result.
         */
        var randomValueSeparator = "" + Math.random();
        /**
         * Custom git log format that provides the commit header and body, separated as expected with the
         * custom separator as the trailing value.
         */
        var gitLogFormat = "%s%n%n%b" + randomValueSeparator;
        /**
         * A list of tuples containing a commit header string and the list of error messages for the
         * commit.
         */
        var errors = [];
        // Retrieve the commits in the provided range.
        var result = shelljs_1.exec("git log --reverse --format=" + gitLogFormat + " " + range);
        if (result.code) {
            throw new Error("Failed to get all commits in the range: \n  " + result.stderr);
        }
        // Separate the commits from a single string into individual commits
        var commits = result.split(randomValueSeparator).map(function (l) { return l.trim(); }).filter(function (line) { return !!line; });
        console_1.info("Examining " + commits.length + " commit(s) in the provided range: " + range);
        // Check each commit in the commit range.  Commits are allowed to be fixup commits for other
        // commits in the provided commit range.
        var allCommitsInRangeValid = commits.every(function (m, i) {
            var options = {
                disallowSquash: true,
                nonFixupCommitHeaders: isNonFixup(m) ?
                    undefined :
                    commits.slice(0, i).filter(isNonFixup).map(extractCommitHeader)
            };
            var _a = validate_1.validateCommitMessage(m, options), valid = _a.valid, localErrors = _a.errors, commit = _a.commit;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUE2QztJQUM3QyxvRUFBc0M7SUFFdEMseUVBQTJDO0lBQzNDLCtFQUFzRztJQUV0RyxpREFBaUQ7SUFDakQsSUFBTSxVQUFVLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLDBCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBOUIsQ0FBOEIsQ0FBQztJQUVqRSx5REFBeUQ7SUFDekQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLDBCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBNUIsQ0FBNEIsQ0FBQztJQUV4RSwyREFBMkQ7SUFDM0QsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYTtRQUMvQzs7V0FFRztRQUNILElBQU0sb0JBQW9CLEdBQUcsS0FBRyxJQUFJLENBQUMsTUFBTSxFQUFJLENBQUM7UUFDaEQ7OztXQUdHO1FBQ0gsSUFBTSxZQUFZLEdBQUcsYUFBVyxvQkFBc0IsQ0FBQztRQUN2RDs7O1dBR0c7UUFDSCxJQUFNLE1BQU0sR0FBK0MsRUFBRSxDQUFDO1FBRTlELDhDQUE4QztRQUM5QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsZ0NBQThCLFlBQVksU0FBSSxLQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyxNQUFNLENBQUMsTUFBUSxDQUFDLENBQUM7U0FDakY7UUFFRCxvRUFBb0U7UUFDcEUsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO1FBRTdGLGNBQUksQ0FBQyxlQUFhLE9BQU8sQ0FBQyxNQUFNLDBDQUFxQyxLQUFPLENBQUMsQ0FBQztRQUU5RSw0RkFBNEY7UUFDNUYsd0NBQXdDO1FBQ3hDLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hELElBQU0sT0FBTyxHQUFpQztnQkFDNUMsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxTQUFTLENBQUMsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ3BFLENBQUM7WUFDSSxJQUFBLEtBQXVDLGdDQUFxQixDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBdkUsS0FBSyxXQUFBLEVBQVUsV0FBVyxZQUFBLEVBQUUsTUFBTSxZQUFxQyxDQUFDO1lBQy9FLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUMzQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLHNCQUFzQixFQUFFO1lBQzFCLGNBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDTCxlQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBMEI7b0JBQTFCLEtBQUEscUJBQTBCLEVBQXpCLE1BQU0sUUFBQSxFQUFFLGdCQUFnQixRQUFBO2dCQUN2QyxlQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixnQ0FBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN4QyxlQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxpRUFBaUU7WUFDakUsbUJBQW1CO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBeERELGtEQXdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uL3V0aWxzL3NoZWxsanMnO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChtOiBzdHJpbmcpID0+ICFwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKG06IHN0cmluZykgPT4gcGFyc2VDb21taXRNZXNzYWdlKG0pLmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLyoqXG4gICAqIEEgcmFuZG9tIHZhbHVlIGlzIHVzZWQgYXMgYSBzdHJpbmcgdG8gYWxsb3cgZm9yIGEgZGVmaW5pdGUgc3BsaXQgcG9pbnQgaW4gdGhlIGdpdCBsb2cgcmVzdWx0LlxuICAgKi9cbiAgY29uc3QgcmFuZG9tVmFsdWVTZXBhcmF0b3IgPSBgJHtNYXRoLnJhbmRvbSgpfWA7XG4gIC8qKlxuICAgKiBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGggdGhlXG4gICAqIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICAgKi9cbiAgY29uc3QgZ2l0TG9nRm9ybWF0ID0gYCVzJW4lbiViJHtyYW5kb21WYWx1ZVNlcGFyYXRvcn1gO1xuICAvKipcbiAgICogQSBsaXN0IG9mIHR1cGxlcyBjb250YWluaW5nIGEgY29tbWl0IGhlYWRlciBzdHJpbmcgYW5kIHRoZSBsaXN0IG9mIGVycm9yIG1lc3NhZ2VzIGZvciB0aGVcbiAgICogY29tbWl0LlxuICAgKi9cbiAgY29uc3QgZXJyb3JzOiBbY29tbWl0SGVhZGVyOiBzdHJpbmcsIGVycm9yczogc3RyaW5nW11dW10gPSBbXTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgcmFuZ2UuXG4gIGNvbnN0IHJlc3VsdCA9IGV4ZWMoYGdpdCBsb2cgLS1yZXZlcnNlIC0tZm9ybWF0PSR7Z2l0TG9nRm9ybWF0fSAke3JhbmdlfWApO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlOiBcXG4gICR7cmVzdWx0LnN0ZGVycn1gKTtcbiAgfVxuXG4gIC8vIFNlcGFyYXRlIHRoZSBjb21taXRzIGZyb20gYSBzaW5nbGUgc3RyaW5nIGludG8gaW5kaXZpZHVhbCBjb21taXRzXG4gIGNvbnN0IGNvbW1pdHMgPSByZXN1bHQuc3BsaXQocmFuZG9tVmFsdWVTZXBhcmF0b3IpLm1hcChsID0+IGwudHJpbSgpKS5maWx0ZXIobGluZSA9PiAhIWxpbmUpO1xuXG4gIGluZm8oYEV4YW1pbmluZyAke2NvbW1pdHMubGVuZ3RofSBjb21taXQocykgaW4gdGhlIHByb3ZpZGVkIHJhbmdlOiAke3JhbmdlfWApO1xuXG4gIC8vIENoZWNrIGVhY2ggY29tbWl0IGluIHRoZSBjb21taXQgcmFuZ2UuICBDb21taXRzIGFyZSBhbGxvd2VkIHRvIGJlIGZpeHVwIGNvbW1pdHMgZm9yIG90aGVyXG4gIC8vIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIGNvbW1pdCByYW5nZS5cbiAgY29uc3QgYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCA9IGNvbW1pdHMuZXZlcnkoKG0sIGkpID0+IHtcbiAgICBjb25zdCBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge1xuICAgICAgZGlzYWxsb3dTcXVhc2g6IHRydWUsXG4gICAgICBub25GaXh1cENvbW1pdEhlYWRlcnM6IGlzTm9uRml4dXAobSkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZSgwLCBpKS5maWx0ZXIoaXNOb25GaXh1cCkubWFwKGV4dHJhY3RDb21taXRIZWFkZXIpXG4gICAgfTtcbiAgICBjb25zdCB7dmFsaWQsIGVycm9yczogbG9jYWxFcnJvcnMsIGNvbW1pdH0gPSB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UobSwgb3B0aW9ucyk7XG4gICAgaWYgKGxvY2FsRXJyb3JzLmxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goW2NvbW1pdC5oZWFkZXIsIGxvY2FsRXJyb3JzXSk7XG4gICAgfVxuICAgIHJldHVybiB2YWxpZDtcbiAgfSk7XG5cbiAgaWYgKGFsbENvbW1pdHNJblJhbmdlVmFsaWQpIHtcbiAgICBpbmZvKCfiiJogIEFsbCBjb21taXQgbWVzc2FnZXMgaW4gcmFuZ2UgdmFsaWQuJyk7XG4gIH0gZWxzZSB7XG4gICAgZXJyb3IoJ+KcmCAgSW52YWxpZCBjb21taXQgbWVzc2FnZScpO1xuICAgIGVycm9ycy5mb3JFYWNoKChbaGVhZGVyLCB2YWxpZGF0aW9uRXJyb3JzXSkgPT4ge1xuICAgICAgZXJyb3IuZ3JvdXAoaGVhZGVyKTtcbiAgICAgIHByaW50VmFsaWRhdGlvbkVycm9ycyh2YWxpZGF0aW9uRXJyb3JzKTtcbiAgICAgIGVycm9yLmdyb3VwRW5kKCk7XG4gICAgfSk7XG4gICAgLy8gRXhpdCB3aXRoIGEgbm9uLXplcm8gZXhpdCBjb2RlIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIGhhdmVcbiAgICAvLyBiZWVuIGRpc2NvdmVyZWQuXG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=