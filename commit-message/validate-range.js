(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range", ["require", "exports", "shelljs", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var shelljs_1 = require("shelljs");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    // Whether the provided commit is a fixup commit.
    var isNonFixup = function (m) { return !validate_1.parseCommitMessage(m).isFixup; };
    /** Validate all commits in a provided git commit range. */
    function validateCommitRange(range) {
        // A random value is used as a string to allow for a definite split point in the git log result.
        var randomValueSeparator = "" + Math.random();
        // Custom git log format that provides the commit header and body, separated as expected with
        // the custom separator as the trailing value.
        var gitLogFormat = "%s%n%n%b" + randomValueSeparator;
        // Retrieve the commits in the provided range.
        var result = shelljs_1.exec("git log --reverse --format=" + gitLogFormat + " " + range, { silent: true });
        if (result.code) {
            throw new Error("Failed to get all commits in the range: \n  " + result.stderr);
        }
        // Separate the commits from a single string into individual commits
        var commits = result.split(randomValueSeparator).map(function (l) { return l.trim(); }).filter(function (line) { return !!line; });
        console.info("Examining " + commits.length + " commit(s) in the provided range: " + range);
        // Check each commit in the commit range.  Commits are allowed to be fixup commits for other
        // commits in the provided commit range.
        var allCommitsInRangeValid = commits.every(function (m, i) {
            var options = {
                disallowSquash: true,
                nonFixupCommitHeaders: isNonFixup(m) ? undefined : commits.slice(0, i).filter(isNonFixup)
            };
            return validate_1.validateCommitMessage(m, options);
        });
        if (allCommitsInRangeValid) {
            console.info('√  All commit messages in range valid.');
        }
    }
    exports.validateCommitRange = validateCommitRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxtQ0FBNkI7SUFFN0IsK0VBQW1HO0lBR25HLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsNkJBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUE5QixDQUE4QixDQUFDO0lBRWpFLDJEQUEyRDtJQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFhO1FBQy9DLGdHQUFnRztRQUNoRyxJQUFNLG9CQUFvQixHQUFHLEtBQUcsSUFBSSxDQUFDLE1BQU0sRUFBSSxDQUFDO1FBQ2hELDZGQUE2RjtRQUM3Riw4Q0FBOEM7UUFDOUMsSUFBTSxZQUFZLEdBQUcsYUFBVyxvQkFBc0IsQ0FBQztRQUV2RCw4Q0FBOEM7UUFDOUMsSUFBTSxNQUFNLEdBQUcsY0FBSSxDQUFDLGdDQUE4QixZQUFZLFNBQUksS0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBK0MsTUFBTSxDQUFDLE1BQVEsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsb0VBQW9FO1FBQ3BFLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQztRQUU3RixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWEsT0FBTyxDQUFDLE1BQU0sMENBQXFDLEtBQU8sQ0FBQyxDQUFDO1FBRXRGLDRGQUE0RjtRQUM1Rix3Q0FBd0M7UUFDeEMsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEQsSUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7YUFDMUYsQ0FBQztZQUNGLE9BQU8sZ0NBQXFCLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxzQkFBc0IsRUFBRTtZQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDeEQ7SUFDSCxDQUFDO0lBOUJELGtEQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbmltcG9ydCB7VmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucywgcGFyc2VDb21taXRNZXNzYWdlLCB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vdmFsaWRhdGUnO1xuXG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAobTogc3RyaW5nKSA9PiAhcGFyc2VDb21taXRNZXNzYWdlKG0pLmlzRml4dXA7XG5cbi8qKiBWYWxpZGF0ZSBhbGwgY29tbWl0cyBpbiBhIHByb3ZpZGVkIGdpdCBjb21taXQgcmFuZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRSYW5nZShyYW5nZTogc3RyaW5nKSB7XG4gIC8vIEEgcmFuZG9tIHZhbHVlIGlzIHVzZWQgYXMgYSBzdHJpbmcgdG8gYWxsb3cgZm9yIGEgZGVmaW5pdGUgc3BsaXQgcG9pbnQgaW4gdGhlIGdpdCBsb2cgcmVzdWx0LlxuICBjb25zdCByYW5kb21WYWx1ZVNlcGFyYXRvciA9IGAke01hdGgucmFuZG9tKCl9YDtcbiAgLy8gQ3VzdG9tIGdpdCBsb2cgZm9ybWF0IHRoYXQgcHJvdmlkZXMgdGhlIGNvbW1pdCBoZWFkZXIgYW5kIGJvZHksIHNlcGFyYXRlZCBhcyBleHBlY3RlZCB3aXRoXG4gIC8vIHRoZSBjdXN0b20gc2VwYXJhdG9yIGFzIHRoZSB0cmFpbGluZyB2YWx1ZS5cbiAgY29uc3QgZ2l0TG9nRm9ybWF0ID0gYCVzJW4lbiViJHtyYW5kb21WYWx1ZVNlcGFyYXRvcn1gO1xuXG4gIC8vIFJldHJpZXZlIHRoZSBjb21taXRzIGluIHRoZSBwcm92aWRlZCByYW5nZS5cbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IGxvZyAtLXJldmVyc2UgLS1mb3JtYXQ9JHtnaXRMb2dGb3JtYXR9ICR7cmFuZ2V9YCwge3NpbGVudDogdHJ1ZX0pO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlOiBcXG4gICR7cmVzdWx0LnN0ZGVycn1gKTtcbiAgfVxuXG4gIC8vIFNlcGFyYXRlIHRoZSBjb21taXRzIGZyb20gYSBzaW5nbGUgc3RyaW5nIGludG8gaW5kaXZpZHVhbCBjb21taXRzXG4gIGNvbnN0IGNvbW1pdHMgPSByZXN1bHQuc3BsaXQocmFuZG9tVmFsdWVTZXBhcmF0b3IpLm1hcChsID0+IGwudHJpbSgpKS5maWx0ZXIobGluZSA9PiAhIWxpbmUpO1xuXG4gIGNvbnNvbGUuaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBjb21taXQgaW4gdGhlIGNvbW1pdCByYW5nZS4gIENvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgLy8gY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgobSwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChtKSA/IHVuZGVmaW5lZCA6IGNvbW1pdHMuc2xpY2UoMCwgaSkuZmlsdGVyKGlzTm9uRml4dXApXG4gICAgfTtcbiAgICByZXR1cm4gdmFsaWRhdGVDb21taXRNZXNzYWdlKG0sIG9wdGlvbnMpO1xuICB9KTtcbiAgaWYgKGFsbENvbW1pdHNJblJhbmdlVmFsaWQpIHtcbiAgICBjb25zb2xlLmluZm8oJ+KImiAgQWxsIGNvbW1pdCBtZXNzYWdlcyBpbiByYW5nZSB2YWxpZC4nKTtcbiAgfVxufVxuIl19