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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILG9FQUFnRDtJQUVoRCx5RUFBMEU7SUFDMUUsK0VBQXVHO0lBRXZHLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLE1BQTJCLElBQUssT0FBQSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQWYsQ0FBZSxDQUFDO0lBRXBFLHlEQUF5RDtJQUN6RCxJQUFNLG1CQUFtQixHQUFHLFVBQUMsTUFBMkIsSUFBSyxPQUFBLE1BQU0sQ0FBQyxNQUFNLEVBQWIsQ0FBYSxDQUFDO0lBRTNFLDJEQUEyRDtJQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFhO1FBQy9DLGdHQUFnRztRQUNoRyxJQUFNLE1BQU0sR0FBK0MsRUFBRSxDQUFDO1FBQzlELHVEQUF1RDtRQUN2RCxJQUFNLE9BQU8sR0FBRyxtQ0FBMkIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNuRCxjQUFJLENBQUMsZUFBYSxPQUFPLENBQUMsTUFBTSwwQ0FBcUMsS0FBTyxDQUFDLENBQUM7UUFFOUU7OztXQUdHO1FBQ0gsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTSxFQUFFLENBQUM7WUFDckQsSUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQ3ZDLFNBQVMsQ0FBQyxDQUFDO29CQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7YUFDcEUsQ0FBQztZQUNJLElBQUEsS0FBK0IsZ0NBQXFCLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxFQUFwRSxLQUFLLFdBQUEsRUFBVSxXQUFXLFlBQTBDLENBQUM7WUFDNUUsSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFO2dCQUN0QixNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO2FBQzNDO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksc0JBQXNCLEVBQUU7WUFDMUIsY0FBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLGVBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1lBQ25DLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQyxFQUEwQjtvQkFBMUIsS0FBQSxxQkFBMEIsRUFBekIsTUFBTSxRQUFBLEVBQUUsZ0JBQWdCLFFBQUE7Z0JBQ3ZDLGVBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3BCLGdDQUFxQixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3hDLGVBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixDQUFDLENBQUMsQ0FBQztZQUNILGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUF0Q0Qsa0RBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2VzRm9yUmFuZ2UsIFBhcnNlZENvbW1pdE1lc3NhZ2V9IGZyb20gJy4uL3BhcnNlJztcbmltcG9ydCB7cHJpbnRWYWxpZGF0aW9uRXJyb3JzLCB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UsIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnN9IGZyb20gJy4uL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChjb21taXQ6IFBhcnNlZENvbW1pdE1lc3NhZ2UpID0+ICFjb21taXQuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKGNvbW1pdDogUGFyc2VkQ29tbWl0TWVzc2FnZSkgPT4gY29tbWl0LmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLyoqIEEgbGlzdCBvZiB0dXBsZXMgb2YgdGhlIGNvbW1pdCBoZWFkZXIgc3RyaW5nIGFuZCBhIGxpc3Qgb2YgZXJyb3IgbWVzc2FnZXMgZm9yIHRoZSBjb21taXQuICovXG4gIGNvbnN0IGVycm9yczogW2NvbW1pdEhlYWRlcjogc3RyaW5nLCBlcnJvcnM6IHN0cmluZ1tdXVtdID0gW107XG4gIC8qKiBBIGxpc3Qgb2YgcGFyc2VkIGNvbW1pdCBtZXNzYWdlcyBmcm9tIHRoZSByYW5nZS4gKi9cbiAgY29uc3QgY29tbWl0cyA9IHBhcnNlQ29tbWl0TWVzc2FnZXNGb3JSYW5nZShyYW5nZSk7XG4gIGluZm8oYEV4YW1pbmluZyAke2NvbW1pdHMubGVuZ3RofSBjb21taXQocykgaW4gdGhlIHByb3ZpZGVkIHJhbmdlOiAke3JhbmdlfWApO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIGFsbCBjb21taXRzIGluIHRoZSByYW5nZSBhcmUgdmFsaWQsIGNvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgICogY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICAgKi9cbiAgY29uc3QgYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCA9IGNvbW1pdHMuZXZlcnkoKGNvbW1pdCwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChjb21taXQpID9cbiAgICAgICAgICB1bmRlZmluZWQgOlxuICAgICAgICAgIGNvbW1pdHMuc2xpY2UoMCwgaSkuZmlsdGVyKGlzTm9uRml4dXApLm1hcChleHRyYWN0Q29tbWl0SGVhZGVyKVxuICAgIH07XG4gICAgY29uc3Qge3ZhbGlkLCBlcnJvcnM6IGxvY2FsRXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXQsIG9wdGlvbnMpO1xuICAgIGlmIChsb2NhbEVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFtjb21taXQuaGVhZGVyLCBsb2NhbEVycm9yc10pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsaWQ7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbygn4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpO1xuICB9IGVsc2Uge1xuICAgIGVycm9yKCfinJggIEludmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICBlcnJvcnMuZm9yRWFjaCgoW2hlYWRlciwgdmFsaWRhdGlvbkVycm9yc10pID0+IHtcbiAgICAgIGVycm9yLmdyb3VwKGhlYWRlcik7XG4gICAgICBwcmludFZhbGlkYXRpb25FcnJvcnModmFsaWRhdGlvbkVycm9ycyk7XG4gICAgICBlcnJvci5ncm91cEVuZCgpO1xuICAgIH0pO1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19