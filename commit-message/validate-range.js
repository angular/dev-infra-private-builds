(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-range", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/shelljs", "@angular/dev-infra-private/commit-message/parse", "@angular/dev-infra-private/commit-message/validate"], factory);
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
        // A random value is used as a string to allow for a definite split point in the git log result.
        var randomValueSeparator = "" + Math.random();
        // Custom git log format that provides the commit header and body, separated as expected with
        // the custom separator as the trailing value.
        var gitLogFormat = "%s%n%n%b" + randomValueSeparator;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtcmFuZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUtcmFuZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXNDO0lBQ3RDLG9FQUFzQztJQUV0Qyx5RUFBMkM7SUFDM0MsK0VBQStFO0lBRS9FLGlEQUFpRDtJQUNqRCxJQUFNLFVBQVUsR0FBRyxVQUFDLENBQVMsSUFBSyxPQUFBLENBQUMsMEJBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUE5QixDQUE4QixDQUFDO0lBRWpFLHlEQUF5RDtJQUN6RCxJQUFNLG1CQUFtQixHQUFHLFVBQUMsQ0FBUyxJQUFLLE9BQUEsMEJBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUE1QixDQUE0QixDQUFDO0lBRXhFLDJEQUEyRDtJQUMzRCxTQUFnQixtQkFBbUIsQ0FBQyxLQUFhO1FBQy9DLGdHQUFnRztRQUNoRyxJQUFNLG9CQUFvQixHQUFHLEtBQUcsSUFBSSxDQUFDLE1BQU0sRUFBSSxDQUFDO1FBQ2hELDZGQUE2RjtRQUM3Riw4Q0FBOEM7UUFDOUMsSUFBTSxZQUFZLEdBQUcsYUFBVyxvQkFBc0IsQ0FBQztRQUV2RCw4Q0FBOEM7UUFDOUMsSUFBTSxNQUFNLEdBQUcsY0FBSSxDQUFDLGdDQUE4QixZQUFZLFNBQUksS0FBTyxDQUFDLENBQUM7UUFDM0UsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxpREFBK0MsTUFBTSxDQUFDLE1BQVEsQ0FBQyxDQUFDO1NBQ2pGO1FBRUQsb0VBQW9FO1FBQ3BFLElBQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsQ0FBQztRQUU3RixjQUFJLENBQUMsZUFBYSxPQUFPLENBQUMsTUFBTSwwQ0FBcUMsS0FBTyxDQUFDLENBQUM7UUFFOUUsNEZBQTRGO1FBQzVGLHdDQUF3QztRQUN4QyxJQUFNLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQztZQUNoRCxJQUFNLE9BQU8sR0FBaUM7Z0JBQzVDLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixxQkFBcUIsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDbEMsU0FBUyxDQUFDLENBQUM7b0JBQ1gsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQzthQUNwRSxDQUFDO1lBQ0YsT0FBTyxnQ0FBcUIsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLHNCQUFzQixFQUFFO1lBQzFCLGNBQUksQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQ2hEO2FBQU07WUFDTCxpRUFBaUU7WUFDakUsbUJBQW1CO1lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBckNELGtEQXFDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vdXRpbHMvc2hlbGxqcyc7XG5cbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcbmltcG9ydCB7dmFsaWRhdGVDb21taXRNZXNzYWdlLCBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLy8gV2hldGhlciB0aGUgcHJvdmlkZWQgY29tbWl0IGlzIGEgZml4dXAgY29tbWl0LlxuY29uc3QgaXNOb25GaXh1cCA9IChtOiBzdHJpbmcpID0+ICFwYXJzZUNvbW1pdE1lc3NhZ2UobSkuaXNGaXh1cDtcblxuLy8gRXh0cmFjdHMgY29tbWl0IGhlYWRlciAoZmlyc3QgbGluZSBvZiBjb21taXQgbWVzc2FnZSkuXG5jb25zdCBleHRyYWN0Q29tbWl0SGVhZGVyID0gKG06IHN0cmluZykgPT4gcGFyc2VDb21taXRNZXNzYWdlKG0pLmhlYWRlcjtcblxuLyoqIFZhbGlkYXRlIGFsbCBjb21taXRzIGluIGEgcHJvdmlkZWQgZ2l0IGNvbW1pdCByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdFJhbmdlKHJhbmdlOiBzdHJpbmcpIHtcbiAgLy8gQSByYW5kb20gdmFsdWUgaXMgdXNlZCBhcyBhIHN0cmluZyB0byBhbGxvdyBmb3IgYSBkZWZpbml0ZSBzcGxpdCBwb2ludCBpbiB0aGUgZ2l0IGxvZyByZXN1bHQuXG4gIGNvbnN0IHJhbmRvbVZhbHVlU2VwYXJhdG9yID0gYCR7TWF0aC5yYW5kb20oKX1gO1xuICAvLyBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGhcbiAgLy8gdGhlIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICBjb25zdCBnaXRMb2dGb3JtYXQgPSBgJXMlbiVuJWIke3JhbmRvbVZhbHVlU2VwYXJhdG9yfWA7XG5cbiAgLy8gUmV0cmlldmUgdGhlIGNvbW1pdHMgaW4gdGhlIHByb3ZpZGVkIHJhbmdlLlxuICBjb25zdCByZXN1bHQgPSBleGVjKGBnaXQgbG9nIC0tcmV2ZXJzZSAtLWZvcm1hdD0ke2dpdExvZ0Zvcm1hdH0gJHtyYW5nZX1gKTtcbiAgaWYgKHJlc3VsdC5jb2RlKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBGYWlsZWQgdG8gZ2V0IGFsbCBjb21taXRzIGluIHRoZSByYW5nZTogXFxuICAke3Jlc3VsdC5zdGRlcnJ9YCk7XG4gIH1cblxuICAvLyBTZXBhcmF0ZSB0aGUgY29tbWl0cyBmcm9tIGEgc2luZ2xlIHN0cmluZyBpbnRvIGluZGl2aWR1YWwgY29tbWl0c1xuICBjb25zdCBjb21taXRzID0gcmVzdWx0LnNwbGl0KHJhbmRvbVZhbHVlU2VwYXJhdG9yKS5tYXAobCA9PiBsLnRyaW0oKSkuZmlsdGVyKGxpbmUgPT4gISFsaW5lKTtcblxuICBpbmZvKGBFeGFtaW5pbmcgJHtjb21taXRzLmxlbmd0aH0gY29tbWl0KHMpIGluIHRoZSBwcm92aWRlZCByYW5nZTogJHtyYW5nZX1gKTtcblxuICAvLyBDaGVjayBlYWNoIGNvbW1pdCBpbiB0aGUgY29tbWl0IHJhbmdlLiAgQ29tbWl0cyBhcmUgYWxsb3dlZCB0byBiZSBmaXh1cCBjb21taXRzIGZvciBvdGhlclxuICAvLyBjb21taXRzIGluIHRoZSBwcm92aWRlZCBjb21taXQgcmFuZ2UuXG4gIGNvbnN0IGFsbENvbW1pdHNJblJhbmdlVmFsaWQgPSBjb21taXRzLmV2ZXJ5KChtLCBpKSA9PiB7XG4gICAgY29uc3Qgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHtcbiAgICAgIGRpc2FsbG93U3F1YXNoOiB0cnVlLFxuICAgICAgbm9uRml4dXBDb21taXRIZWFkZXJzOiBpc05vbkZpeHVwKG0pID9cbiAgICAgICAgICB1bmRlZmluZWQgOlxuICAgICAgICAgIGNvbW1pdHMuc2xpY2UoMCwgaSkuZmlsdGVyKGlzTm9uRml4dXApLm1hcChleHRyYWN0Q29tbWl0SGVhZGVyKVxuICAgIH07XG4gICAgcmV0dXJuIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShtLCBvcHRpb25zKTtcbiAgfSk7XG5cbiAgaWYgKGFsbENvbW1pdHNJblJhbmdlVmFsaWQpIHtcbiAgICBpbmZvKCfiiJogIEFsbCBjb21taXQgbWVzc2FnZXMgaW4gcmFuZ2UgdmFsaWQuJyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRXhpdCB3aXRoIGEgbm9uLXplcm8gZXhpdCBjb2RlIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzIGhhdmVcbiAgICAvLyBiZWVuIGRpc2NvdmVyZWQuXG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=