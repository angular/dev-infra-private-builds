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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxtQ0FBNkI7SUFFN0Isb0VBQXNDO0lBRXRDLCtFQUFtRztJQUVuRyxpREFBaUQ7SUFDakQsSUFBTSxVQUFVLEdBQUcsVUFBQyxDQUFTLElBQUssT0FBQSxDQUFDLDZCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBOUIsQ0FBOEIsQ0FBQztJQUVqRSx5REFBeUQ7SUFDekQsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLDZCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBNUIsQ0FBNEIsQ0FBQztJQUV4RSwyREFBMkQ7SUFDM0QsU0FBZ0IsbUJBQW1CLENBQUMsS0FBYTtRQUMvQyxnR0FBZ0c7UUFDaEcsSUFBTSxvQkFBb0IsR0FBRyxLQUFHLElBQUksQ0FBQyxNQUFNLEVBQUksQ0FBQztRQUNoRCw2RkFBNkY7UUFDN0YsOENBQThDO1FBQzlDLElBQU0sWUFBWSxHQUFHLGFBQVcsb0JBQXNCLENBQUM7UUFFdkQsOENBQThDO1FBQzlDLElBQU0sTUFBTSxHQUFHLGNBQUksQ0FBQyxnQ0FBOEIsWUFBWSxTQUFJLEtBQU8sRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzNGLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsaURBQStDLE1BQU0sQ0FBQyxNQUFRLENBQUMsQ0FBQztTQUNqRjtRQUVELG9FQUFvRTtRQUNwRSxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLENBQUM7UUFFN0YsY0FBSSxDQUFDLGVBQWEsT0FBTyxDQUFDLE1BQU0sMENBQXFDLEtBQU8sQ0FBQyxDQUFDO1FBRTlFLDRGQUE0RjtRQUM1Rix3Q0FBd0M7UUFDeEMsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEQsSUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2xDLFNBQVMsQ0FBQyxDQUFDO29CQUNYLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7YUFDcEUsQ0FBQztZQUNGLE9BQU8sZ0NBQXFCLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxzQkFBc0IsRUFBRTtZQUMxQixjQUFJLENBQUMsd0NBQXdDLENBQUMsQ0FBQztTQUNoRDthQUFNO1lBQ0wsaUVBQWlFO1lBQ2pFLG1CQUFtQjtZQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQXJDRCxrREFxQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2V4ZWN9IGZyb20gJ3NoZWxsanMnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZSwgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChtOiBzdHJpbmcpID0+ICFwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKG06IHN0cmluZykgPT4gcGFyc2VDb21taXRNZXNzYWdlKG0pLmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLy8gQSByYW5kb20gdmFsdWUgaXMgdXNlZCBhcyBhIHN0cmluZyB0byBhbGxvdyBmb3IgYSBkZWZpbml0ZSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuXG4gIGNvbnN0IHJhbmRvbVZhbHVlU2VwYXJhdG9yID0gYCR7TWF0aC5yYW5kb20oKX1gO1xuICAvLyBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGhcbiAgLy8gdGhlIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICBjb25zdCBnaXRMb2dGb3JtYXQgPSBgJXMlbiVuJWIke3JhbmRvbVZhbHVlU2VwYXJhdG9yfWA7XG5cbiAgLy8gUmV0cmlldmUgdGhlIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIHJhbmdlLlxuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgbG9nIC0tcmV2ZXJzZSAtLWZvcm1hdD0ke2dpdExvZ0Zvcm1hdH0gJHtyYW5nZX1gLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6IFxcbiAgJHtyZXN1bHQuc3RkZXJyfWApO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgdGhlIGNvbW1pdHMgZnJvbSBhIHNpbmdsZSBzdHJpbmcgaW50byBpbmRpdmlkdWFsIGNvbW1pdHNcbiAgY29uc3QgY29tbWl0cyA9IHJlc3VsdC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcikubWFwKGwgPT4gbC50cmltKCkpLmZpbHRlcihsaW5lID0+ICEhbGluZSk7XG5cbiAgaW5mbyhgRXhhbWluaW5nICR7Y29tbWl0cy5sZW5ndGh9IGNvbW1pdChzKSBpbiB0aGUgcHJvdmlkZWQgcmFuZ2U6ICR7cmFuZ2V9YCk7XG5cbiAgLy8gQ2hlY2sgZWFjaCBjb21taXQgaW4gdGhlIGNvbW1pdCByYW5nZS4gIENvbW1pdHMgYXJlIGFsbG93ZWQgdG8gYmUgZml4dXAgY29tbWl0cyBmb3Igb3RoZXJcbiAgLy8gY29tbWl0cyBpbiB0aGUgcHJvdmlkZWQgY29tbWl0IHJhbmdlLlxuICBjb25zdCBhbGxDb21taXRzSW5SYW5nZVZhbGlkID0gY29tbWl0cy5ldmVyeSgobSwgaSkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7XG4gICAgICBkaXNhbGxvd1NxdWFzaDogdHJ1ZSxcbiAgICAgIG5vbkZpeHVwQ29tbWl0SGVhZGVyczogaXNOb25GaXh1cChtKSA/XG4gICAgICAgICAgdW5kZWZpbmVkIDpcbiAgICAgICAgICBjb21taXRzLnNsaWNlKDAsIGkpLmZpbHRlcihpc05vbkZpeHVwKS5tYXAoZXh0cmFjdENvbW1pdEhlYWRlcilcbiAgICB9O1xuICAgIHJldHVybiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UobSwgb3B0aW9ucyk7XG4gIH0pO1xuXG4gIGlmIChhbGxDb21taXRzSW5SYW5nZVZhbGlkKSB7XG4gICAgaW5mbygn4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpO1xuICB9IGVsc2Uge1xuICAgIC8vIEV4aXQgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZSBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcyBoYXZlXG4gICAgLy8gYmVlbiBkaXNjb3ZlcmVkLlxuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19