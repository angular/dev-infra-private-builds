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
     * Copyright Google LLC All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsbUNBQTZCO0lBRTdCLG9FQUFzQztJQUV0QywrRUFBbUc7SUFFbkcsaURBQWlEO0lBQ2pELElBQU0sVUFBVSxHQUFHLFVBQUMsQ0FBUyxJQUFLLE9BQUEsQ0FBQyw2QkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQTlCLENBQThCLENBQUM7SUFFakUseURBQXlEO0lBQ3pELElBQU0sbUJBQW1CLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSw2QkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQTVCLENBQTRCLENBQUM7SUFFeEUsMkRBQTJEO0lBQzNELFNBQWdCLG1CQUFtQixDQUFDLEtBQWE7UUFDL0MsZ0dBQWdHO1FBQ2hHLElBQU0sb0JBQW9CLEdBQUcsS0FBRyxJQUFJLENBQUMsTUFBTSxFQUFJLENBQUM7UUFDaEQsNkZBQTZGO1FBQzdGLDhDQUE4QztRQUM5QyxJQUFNLFlBQVksR0FBRyxhQUFXLG9CQUFzQixDQUFDO1FBRXZELDhDQUE4QztRQUM5QyxJQUFNLE1BQU0sR0FBRyxjQUFJLENBQUMsZ0NBQThCLFlBQVksU0FBSSxLQUFPLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMzRixJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDZixNQUFNLElBQUksS0FBSyxDQUFDLGlEQUErQyxNQUFNLENBQUMsTUFBUSxDQUFDLENBQUM7U0FDakY7UUFFRCxvRUFBb0U7UUFDcEUsSUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFOLENBQU0sQ0FBQyxDQUFDO1FBRTdGLGNBQUksQ0FBQyxlQUFhLE9BQU8sQ0FBQyxNQUFNLDBDQUFxQyxLQUFPLENBQUMsQ0FBQztRQUU5RSw0RkFBNEY7UUFDNUYsd0NBQXdDO1FBQ3hDLElBQU0sc0JBQXNCLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDO1lBQ2hELElBQU0sT0FBTyxHQUFpQztnQkFDNUMsY0FBYyxFQUFFLElBQUk7Z0JBQ3BCLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNsQyxTQUFTLENBQUMsQ0FBQztvQkFDWCxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLG1CQUFtQixDQUFDO2FBQ3BFLENBQUM7WUFDRixPQUFPLGdDQUFxQixDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksc0JBQXNCLEVBQUU7WUFDMUIsY0FBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDaEQ7YUFBTTtZQUNMLGlFQUFpRTtZQUNqRSxtQkFBbUI7WUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFyQ0Qsa0RBcUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2V4ZWN9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZSwgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChtOiBzdHJpbmcpID0+ICFwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKG06IHN0cmluZykgPT4gcGFyc2VDb21taXRNZXNzYWdlKG0pLmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLy8gQSByYW5kb20gdmFsdWUgaXMgdXNlZCBhcyBhIHN0cmluZyB0byBhbGxvdyBmb3IgYSBkZWZpbml0ZSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuXG4gIGNvbnN0IHJhbmRvbVZhbHVlU2VwYXJhdG9yID0gYCR7TWF0aC5yYW5kb20oKX1gO1xuICAvLyBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGhcbiAgLy8gdGhlIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICBjb25zdCBnaXRMb2dGb3JtYXQgPSBgJXMlbiVuJWIke3JhbmRvbVZhbHVlU2VwYXJhdG9yfWA7XG5cbiAgLy8gUmV0cmlldmUgdGhlIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIHJhbmdlLlxuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgbG9nIC0tcmV2ZXJzZSAtLWZvcm1hdD0ke2dpdExvZ0Zvcm1hdH0gJHtyYW5nZX1gLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6IFxcbiAgJHtyZXN1bHQuc3RkZXJyfWApO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgdGhlIGNvbW1pdHMgZnJvbSBhIHNpbmdsZSBzdHJpbmcgaW50byBpbmRpdmlkdWFsIGNvbW1pdHNcbiAgY29uc3QgY29tbWl0cyA9IHJlc3VsdC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcikubWFwKGwgPT4gbC50cmltKCkpLmZpbHRlcihsaW5lID0+ICEhbGluZSk7XG5cbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBjb21taXQgaW4gdGhlIGNvbW1pdCByYW5nZS4gIENvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgLy8gY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgobSwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChtKSA/XG4gICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICBjb21taXRzLnNsaWNlKDAsIGkpLmZpbHRlcihpc05vbkZpeHVwKS5tYXAoZXh0cmFjdENvbW1pdEhlYWRlcilcbiAgICB9O1xuICAgIHJldHVybiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UobSwgb3B0aW9ucyk7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbygn4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpO1xuICB9IGVsc2Uge1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19