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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxtQ0FBNkI7SUFDN0IsK0VBQW1HO0lBRW5HLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsNkJBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUE5QixDQUE4QixDQUFDO0lBRWpFLDJEQUEyRDtJQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFhO1FBQy9DLGdHQUFnRztRQUNoRyxJQUFNLG9CQUFvQixHQUFHLEtBQUcsSUFBSSxDQUFDLE1BQU0sRUFBSSxDQUFDO1FBQ2hELDZGQUE2RjtRQUM3Riw4Q0FBOEM7UUFDOUMsSUFBTSxZQUFZLEdBQUcsYUFBVyxvQkFBc0IsQ0FBQztRQUV2RCw4Q0FBOEM7UUFDOUMsSUFBTSxNQUFNLEdBQUcsY0FBSSxDQUFDLGdDQUE4QixZQUFZLFNBQUksS0FBTyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7UUFDM0YsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBK0MsTUFBTSxDQUFDLE1BQVEsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsb0VBQW9FO1FBQ3BFLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQztRQUU3RixPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWEsT0FBTyxDQUFDLE1BQU0sMENBQXFDLEtBQU8sQ0FBQyxDQUFDO1FBRXRGLDRGQUE0RjtRQUM1Rix3Q0FBd0M7UUFDeEMsSUFBTSxzQkFBc0IsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7WUFDaEQsSUFBTSxPQUFPLEdBQWlDO2dCQUM1QyxjQUFjLEVBQUUsSUFBSTtnQkFDcEIscUJBQXFCLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7YUFDMUYsQ0FBQztZQUNGLE9BQU8sZ0NBQXFCLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxzQkFBc0IsRUFBRTtZQUMxQixPQUFPLENBQUMsSUFBSSxDQUFDLHdDQUF3QyxDQUFDLENBQUM7U0FDeEQ7SUFDSCxDQUFDO0lBOUJELGtEQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQge3BhcnNlQ29tbWl0TWVzc2FnZSwgdmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChtOiBzdHJpbmcpID0+ICFwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaXNGaXh1cDtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLy8gQSByYW5kb20gdmFsdWUgaXMgdXNlZCBhcyBhIHN0cmluZyB0byBhbGxvdyBmb3IgYSBkZWZpbml0ZSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuXG4gIGNvbnN0IHJhbmRvbVZhbHVlU2VwYXJhdG9yID0gYCR7TWF0aC5yYW5kb20oKX1gO1xuICAvLyBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGhcbiAgLy8gdGhlIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICBjb25zdCBnaXRMb2dGb3JtYXQgPSBgJXMlbiVuJWIke3JhbmRvbVZhbHVlU2VwYXJhdG9yfWA7XG5cbiAgLy8gUmV0cmlldmUgdGhlIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIHJhbmdlLlxuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgbG9nIC0tcmV2ZXJzZSAtLWZvcm1hdD0ke2dpdExvZ0Zvcm1hdH0gJHtyYW5nZX1gLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6IFxcbiAgJHtyZXN1bHQuc3RkZXJyfWApO1xuICB9XG5cbiAgLy8gU2VwYXJhdGUgdGhlIGNvbW1pdHMgZnJvbSBhIHNpbmdsZSBzdHJpbmcgaW50byBpbmRpdmlkdWFsIGNvbW1pdHNcbiAgY29uc3QgY29tbWl0cyA9IHJlc3VsdC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcikubWFwKGwgPT4gbC50cmltKCkpLmZpbHRlcihsaW5lID0+ICEhbGluZSk7XG5cbiAgY29uc29sZS5pbmZvKGBFeGFtaW5pbmcgJHtjb21taXRzLmxlbmd0aH0gY29tbWl0KHMpIGluIHRoZSBwcm92aWRlZCByYW5nZTogJHtyYW5nZX1gKTtcblxuICAvLyBDaGVjayBlYWNoIGNvbW1pdCBpbiB0aGUgY29tbWl0IHJhbmdlLiAgQ29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAvLyBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gIGNvbnN0IGFsbENvbW1pdHNJblJhbmdlVmFsaWQgPSBjb21taXRzLmV2ZXJ5KChtLCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKG0pID8gdW5kZWZpbmVkIDogY29tbWl0cy5zbGljZSgwLCBpKS5maWx0ZXIoaXNOb25GaXh1cClcbiAgICB9O1xuICAgIHJldHVybiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UobSwgb3B0aW9ucyk7XG4gIH0pO1xuICBpZiAoYWxsQ29tbWl0c0luUmFuZ2VWYWxpZCkge1xuICAgIGNvbnNvbGUuaW5mbygn4oiaICBBbGwgY29tbWl0IG1lc3NhZ2VzIGluIHJhbmdlIHZhbGlkLicpO1xuICB9XG59XG4iXX0=