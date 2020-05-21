(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range", ["require", "exports", "shelljs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateCommitRange = void 0;
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var shelljs_1 = require("shelljs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    // Whether the provided commit is a fixup commit.
    var isNonFixup = function (m) { return !validate_1.parseCommitMessage(m).isFixup; };
    // Extracts commit header (first line of commit message).
    var extractCommitHeader = function (m) { return validate_1.parseCommitMessage(m).header; };
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
            return validate_1.validateCommitMessage(m, options);
        });
        if (allCommitsInRangeValid) {
            console_1.info('√  All commit messages in range valid.');
        }
        else {
            // Exit with a non-zero exit code if invalid commit messages have
            // been discovered.
            process.exit(1);
        }
    }
    exports.validateCommitRange = validateCommitRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsbUNBQTZCO0lBRTdCLG9FQUFzQztJQUV0QywrRUFBbUc7SUFFbkcsaURBQWlEO0lBQ2pELElBQU0sVUFBVSxHQUFHLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyw2QkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQTlCLENBQThCLENBQUM7SUFFakUseURBQXlEO0lBQ3pELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSw2QkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQTVCLENBQTRCLENBQUM7SUFFeEUsMkRBQTJEO0lBQzNELFNBQWdCLG1CQUFtQixDQUFDLEtBQWE7UUFDL0MsZ0dBQWdHO1FBQ2hHLElBQU0sb0JBQW9CLEdBQUcsS0FBRyxJQUFJLENBQUMsTUFBTSxFQUFJLENBQUM7UUFDaEQsNkZBQTZGO1FBQzdGLDhDQUE4QztRQUM5QyxJQUFNLFlBQVksR0FBRyxhQUFXLG9CQUFzQixDQUFDO1FBRXZELDhDQUE4QztRQUM5QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsZ0NBQThCLFlBQVksU0FBSSxLQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyxNQUFNLENBQUMsTUFBUSxDQUFDLENBQUM7U0FDakY7UUFFRCxvRUFBb0U7UUFDcEUsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO1FBRTdGLGNBQUksQ0FBQyxlQUFhLE9BQU8sQ0FBQyxNQUFNLDBDQUFxQyxLQUFPLENBQUMsQ0FBQztRQUU5RSw0RkFBNEY7UUFDNUYsd0NBQXdDO1FBQ3hDLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hELElBQU0sT0FBTyxHQUFpQztnQkFDNUMsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxTQUFTLENBQUMsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ3BFLENBQUM7WUFDRixPQUFPLGdDQUFxQixDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksc0JBQXNCLEVBQUU7WUFDMUIsY0FBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFyQ0Qsa0RBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2UsIHZhbGlkYXRlQ29tbWl0TWVzc2FnZSwgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9uc30gZnJvbSAnLi92YWxpZGF0ZSc7XG5cbi8vIFdoZXRoZXIgdGhlIHByb3ZpZGVkIGNvbW1pdCBpcyBhIGZpeHVwIGNvbW1pdC5cbmNvbnN0IGlzTm9uRml4dXAgPSAobTogc3RyaW5nKSA9PiAhcGFyc2VDb21taXRNZXNzYWdlKG0pLmlzRml4dXA7XG5cbi8vIEV4dHJhY3RzIGNvbW1pdCBoZWFkZXIgKGZpcnN0IGxpbmUgb2YgY29tbWl0IG1lc3NhZ2UpLlxuY29uc3QgZXh0cmFjdENvbW1pdEhlYWRlciA9IChtOiBzdHJpbmcpID0+IHBhcnNlQ29tbWl0TWVzc2FnZShtKS5oZWFkZXI7XG5cbi8qKiBWYWxpZGF0ZSBhbGwgY29tbWl0cyBpbiBhIHByb3ZpZGVkIGdpdCBjb21taXQgcmFuZ2UuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRSYW5nZShyYW5nZTogc3RyaW5nKSB7XG4gIC8vIEEgcmFuZG9tIHZhbHVlIGlzIHVzZWQgYXMgYSBzdHJpbmcgdG8gYWxsb3cgZm9yIGEgZGVmaW5pdGUgc3BsaXQgcG9pbnQgaW4gdGhlIGdpdCBsb2cgcmVzdWx0LlxuICBjb25zdCByYW5kb21WYWx1ZVNlcGFyYXRvciA9IGAke01hdGgucmFuZG9tKCl9YDtcbiAgLy8gQ3VzdG9tIGdpdCBsb2cgZm9ybWF0IHRoYXQgcHJvdmlkZXMgdGhlIGNvbW1pdCBoZWFkZXIgYW5kIGJvZHksIHNlcGFyYXRlZCBhcyBleHBlY3RlZCB3aXRoXG4gIC8vIHRoZSBjdXN0b20gc2VwYXJhdG9yIGFzIHRoZSB0cmFpbGluZyB2YWx1ZS5cbiAgY29uc3QgZ2l0TG9nRm9ybWF0ID0gYCVzJW4lbiViJHtyYW5kb21WYWx1ZVNlcGFyYXRvcn1gO1xuXG4gIC8vIFJldHJpZXZlIHRoZSBjb21taXRzIGluIHRoZSBwcm92aWRlZCByYW5nZS5cbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IGxvZyAtLXJldmVyc2UgLS1mb3JtYXQ9JHtnaXRMb2dGb3JtYXR9ICR7cmFuZ2V9YCwge3NpbGVudDogdHJ1ZX0pO1xuICBpZiAocmVzdWx0LmNvZGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYEZhaWxlZCB0byBnZXQgYWxsIGNvbW1pdHMgaW4gdGhlIHJhbmdlOiBcXG4gICR7cmVzdWx0LnN0ZGVycn1gKTtcbiAgfVxuXG4gIC8vIFNlcGFyYXRlIHRoZSBjb21taXRzIGZyb20gYSBzaW5nbGUgc3RyaW5nIGludG8gaW5kaXZpZHVhbCBjb21taXRzXG4gIGNvbnN0IGNvbW1pdHMgPSByZXN1bHQuc3BsaXQocmFuZG9tVmFsdWVTZXBhcmF0b3IpLm1hcChsID0+IGwudHJpbSgpKS5maWx0ZXIobGluZSA9PiAhIWxpbmUpO1xuXG4gIGluZm8oYEV4YW1pbmluZyAke2NvbW1pdHMubGVuZ3RofSBjb21taXQocykgaW4gdGhlIHByb3ZpZGVkIHJhbmdlOiAke3JhbmdlfWApO1xuXG4gIC8vIENoZWNrIGVhY2ggY29tbWl0IGluIHRoZSBjb21taXQgcmFuZ2UuICBDb21taXRzIGFyZSBhbGxvd2VkIHRvIGJlIGZpeHVwIGNvbW1pdHMgZm9yIG90aGVyXG4gIC8vIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIGNvbW1pdCByYW5nZS5cbiAgY29uc3QgYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCA9IGNvbW1pdHMuZXZlcnkoKG0sIGkpID0+IHtcbiAgICBjb25zdCBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge1xuICAgICAgZGlzYWxsb3dTcXVhc2g6IHRydWUsXG4gICAgICBub25GaXh1cENvbW1pdEhlYWRlcnM6IGlzTm9uRml4dXAobSkgP1xuICAgICAgICAgIHVuZGVmaW5lZCA6XG4gICAgICAgICAgY29tbWl0cy5zbGljZSgwLCBpKS5maWx0ZXIoaXNOb25GaXh1cCkubWFwKGV4dHJhY3RDb21taXRIZWFkZXIpXG4gICAgfTtcbiAgICByZXR1cm4gdmFsaWRhdGVDb21taXRNZXNzYWdlKG0sIG9wdGlvbnMpO1xuICB9KTtcblxuICBpZiAoYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCkge1xuICAgIGluZm8oJ+KImiAgQWxsIGNvbW1pdCBtZXNzYWdlcyBpbiByYW5nZSB2YWxpZC4nKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBFeGl0IHdpdGggYSBub24temVybyBleGl0IGNvZGUgaWYgaW52YWxpZCBjb21taXQgbWVzc2FnZXMgaGF2ZVxuICAgIC8vIGJlZW4gZGlzY292ZXJlZC5cbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==