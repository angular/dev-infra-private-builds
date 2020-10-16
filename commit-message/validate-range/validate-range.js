(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range/validate-range", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/shelljs", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/commit-message/validate"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUFnRDtJQUNoRCxvRUFBeUM7SUFFekMseUVBQTRDO0lBQzVDLCtFQUF1RztJQUV2RyxpREFBaUQ7SUFDakQsSUFBTSxVQUFVLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLDBCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBOUIsQ0FBOEIsQ0FBQztJQUVqRSx5REFBeUQ7SUFDekQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLDBCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBNUIsQ0FBNEIsQ0FBQztJQUV4RSwyREFBMkQ7SUFDM0QsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYTtRQUMvQzs7V0FFRztRQUNILElBQU0sb0JBQW9CLEdBQUcsS0FBRyxJQUFJLENBQUMsTUFBTSxFQUFJLENBQUM7UUFDaEQ7OztXQUdHO1FBQ0gsSUFBTSxZQUFZLEdBQUcsYUFBVyxvQkFBc0IsQ0FBQztRQUN2RDs7O1dBR0c7UUFDSCxJQUFNLE1BQU0sR0FBK0MsRUFBRSxDQUFDO1FBRTlELDhDQUE4QztRQUM5QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsZ0NBQThCLFlBQVksU0FBSSxLQUFPLENBQUMsQ0FBQztRQUMzRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyxNQUFNLENBQUMsTUFBUSxDQUFDLENBQUM7U0FDakY7UUFFRCxvRUFBb0U7UUFDcEUsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO1FBRTdGLGNBQUksQ0FBQyxlQUFhLE9BQU8sQ0FBQyxNQUFNLDBDQUFxQyxLQUFPLENBQUMsQ0FBQztRQUU5RSw0RkFBNEY7UUFDNUYsd0NBQXdDO1FBQ3hDLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hELElBQU0sT0FBTyxHQUFpQztnQkFDNUMsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxTQUFTLENBQUMsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ3BFLENBQUM7WUFDSSxJQUFBLEtBQXVDLGdDQUFxQixDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBdkUsS0FBSyxXQUFBLEVBQVUsV0FBVyxZQUFBLEVBQUUsTUFBTSxZQUFxQyxDQUFDO1lBQy9FLElBQUksV0FBVyxDQUFDLE1BQU0sRUFBRTtnQkFDdEIsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQzthQUMzQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLHNCQUFzQixFQUFFO1lBQzFCLGNBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDTCxlQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUMsRUFBMEI7b0JBQTFCLEtBQUEscUJBQTBCLEVBQXpCLE1BQU0sUUFBQSxFQUFFLGdCQUFnQixRQUFBO2dCQUN2QyxlQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixnQ0FBcUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN4QyxlQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUM7WUFDSCxpRUFBaUU7WUFDakUsbUJBQW1CO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBeERELGtEQXdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtlcnJvciwgaW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vcGFyc2UnO1xuaW1wb3J0IHtwcmludFZhbGlkYXRpb25FcnJvcnMsIHZhbGlkYXRlQ29tbWl0TWVzc2FnZSwgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9uc30gZnJvbSAnLi4vdmFsaWRhdGUnO1xuXG4vLyBXaGV0aGVyIHRoZSBwcm92aWRlZCBjb21taXQgaXMgYSBmaXh1cCBjb21taXQuXG5jb25zdCBpc05vbkZpeHVwID0gKG06IHN0cmluZykgPT4gIXBhcnNlQ29tbWl0TWVzc2FnZShtKS5pc0ZpeHVwO1xuXG4vLyBFeHRyYWN0cyBjb21taXQgaGVhZGVyIChmaXJzdCBsaW5lIG9mIGNvbW1pdCBtZXNzYWdlKS5cbmNvbnN0IGV4dHJhY3RDb21taXRIZWFkZXIgPSAobTogc3RyaW5nKSA9PiBwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaGVhZGVyO1xuXG4vKiogVmFsaWRhdGUgYWxsIGNvbW1pdHMgaW4gYSBwcm92aWRlZCBnaXQgY29tbWl0IHJhbmdlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0UmFuZ2UocmFuZ2U6IHN0cmluZykge1xuICAvKipcbiAgICogQSByYW5kb20gdmFsdWUgaXMgdXNlZCBhcyBhIHN0cmluZyB0byBhbGxvdyBmb3IgYSBkZWZpbml0ZSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuXG4gICAqL1xuICBjb25zdCByYW5kb21WYWx1ZVNlcGFyYXRvciA9IGAke01hdGgucmFuZG9tKCl9YDtcbiAgLyoqXG4gICAqIEN1c3RvbSBnaXQgbG9nIGZvcm1hdCB0aGF0IHByb3ZpZGVzIHRoZSBjb21taXQgaGVhZGVyIGFuZCBib2R5LCBzZXBhcmF0ZWQgYXMgZXhwZWN0ZWQgd2l0aCB0aGVcbiAgICogY3VzdG9tIHNlcGFyYXRvciBhcyB0aGUgdHJhaWxpbmcgdmFsdWUuXG4gICAqL1xuICBjb25zdCBnaXRMb2dGb3JtYXQgPSBgJXMlbiVuJWIke3JhbmRvbVZhbHVlU2VwYXJhdG9yfWA7XG4gIC8qKlxuICAgKiBBIGxpc3Qgb2YgdHVwbGVzIGNvbnRhaW5pbmcgYSBjb21taXQgaGVhZGVyIHN0cmluZyBhbmQgdGhlIGxpc3Qgb2YgZXJyb3IgbWVzc2FnZXMgZm9yIHRoZVxuICAgKiBjb21taXQuXG4gICAqL1xuICBjb25zdCBlcnJvcnM6IFtjb21taXRIZWFkZXI6IHN0cmluZywgZXJyb3JzOiBzdHJpbmdbXV1bXSA9IFtdO1xuXG4gIC8vIFJldHJpZXZlIHRoZSBjb21taXRzIGluIHRoZSBwcm92aWRlZCByYW5nZS5cbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IGxvZyAtLXJldmVyc2UgLS1mb3JtYXQ9JHtnaXRMb2dGb3JtYXR9ICR7cmFuZ2V9YCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6IFxcbiAgJHtyZXN1bHQuc3RkZXJyfWApO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgdGhlIGNvbW1pdHMgZnJvbSBhIHNpbmdsZSBzdHJpbmcgaW50byBpbmRpdmlkdWFsIGNvbW1pdHNcbiAgY29uc3QgY29tbWl0cyA9IHJlc3VsdC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcikubWFwKGwgPT4gbC50cmltKCkpLmZpbHRlcihsaW5lID0+ICEhbGluZSk7XG5cbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBjb21taXQgaW4gdGhlIGNvbW1pdCByYW5nZS4gIENvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgLy8gY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgobSwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChtKSA/XG4gICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICBjb21taXRzLnNsaWNlKDAsIGkpLmZpbHRlcihpc05vbkZpeHVwKS5tYXAoZXh0cmFjdENvbW1pdEhlYWRlcilcbiAgICB9O1xuICAgIGNvbnN0IHt2YWxpZCwgZXJyb3JzOiBsb2NhbEVycm9ycywgY29tbWl0fSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShtLCBvcHRpb25zKTtcbiAgICBpZiAobG9jYWxFcnJvcnMubGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChbY29tbWl0LmhlYWRlciwgbG9jYWxFcnJvcnNdKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbGlkO1xuICB9KTtcblxuICBpZiAoYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCkge1xuICAgIGluZm8oJ+KImiAgQWxsIGNvbW1pdCBtZXNzYWdlcyBpbiByYW5nZSB2YWxpZC4nKTtcbiAgfSBlbHNlIHtcbiAgICBlcnJvcign4pyYICBJbnZhbGlkIGNvbW1pdCBtZXNzYWdlJyk7XG4gICAgZXJyb3JzLmZvckVhY2goKFtoZWFkZXIsIHZhbGlkYXRpb25FcnJvcnNdKSA9PiB7XG4gICAgICBlcnJvci5ncm91cChoZWFkZXIpO1xuICAgICAgcHJpbnRWYWxpZGF0aW9uRXJyb3JzKHZhbGlkYXRpb25FcnJvcnMpO1xuICAgICAgZXJyb3IuZ3JvdXBFbmQoKTtcbiAgICB9KTtcbiAgICAvLyBFeGl0IHdpdGggYSBub24temVybyBleGl0IGNvZGUgaWYgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgaGF2ZVxuICAgIC8vIGJlZW4gZGlzY292ZXJlZC5cbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==