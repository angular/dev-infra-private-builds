/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/utils/repo-files", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.allFiles = exports.allStagedFiles = exports.allChangedFilesSince = void 0;
    var tslib_1 = require("tslib");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /**
     * A list of all files currently in the repo which have been modified since the provided sha.
     *
     * git diff
     * Deleted files (--diff-filter=d) are not included as they are not longer present in the repo
     * and can not be checked anymore.
     *
     * git ls-files
     * Untracked files (--others), which are not matched by .gitignore (--exclude-standard)
     * as they are expected to become tracked files.
     */
    function allChangedFilesSince(sha) {
        if (sha === void 0) { sha = 'HEAD'; }
        var diffFiles = gitOutputAsArray("git diff --name-only --diff-filter=d " + sha);
        var untrackedFiles = gitOutputAsArray("git ls-files --others --exclude-standard");
        // Use a set to deduplicate the list as its possible for a file to show up in both lists.
        return Array.from(new Set(tslib_1.__spread(diffFiles, untrackedFiles)));
    }
    exports.allChangedFilesSince = allChangedFilesSince;
    /**
     * A list of all staged files which have been modified.
     *
     * Only added, created and modified files are listed as others (deleted, renamed, etc) aren't
     * changed or available as content to act upon.
     */
    function allStagedFiles() {
        return gitOutputAsArray("git diff --staged --name-only --diff-filter=ACM");
    }
    exports.allStagedFiles = allStagedFiles;
    function allFiles() {
        return gitOutputAsArray("git ls-files");
    }
    exports.allFiles = allFiles;
    function gitOutputAsArray(cmd) {
        return shelljs_1.exec(cmd, { cwd: config_1.getRepoBaseDir() }).split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return !!x; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwby1maWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9yZXBvLWZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBd0M7SUFDeEMsb0VBQStCO0lBRS9COzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxHQUFZO1FBQVosb0JBQUEsRUFBQSxZQUFZO1FBQy9DLElBQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLDBDQUF3QyxHQUFLLENBQUMsQ0FBQztRQUNsRixJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3BGLHlGQUF5RjtRQUN6RixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFLLFNBQVMsRUFBSyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFMRCxvREFLQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBZ0IsY0FBYztRQUM1QixPQUFPLGdCQUFnQixDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUZELHdDQUVDO0lBSUQsU0FBZ0IsUUFBUTtRQUN0QixPQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFGRCw0QkFFQztJQUdELFNBQVMsZ0JBQWdCLENBQUMsR0FBVztRQUNuQyxPQUFPLGNBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsdUJBQWMsRUFBRSxFQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLEVBQUgsQ0FBRyxDQUFDLENBQUM7SUFDNUYsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4vc2hlbGxqcyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgaW4gdGhlIHJlcG8gd2hpY2ggaGF2ZSBiZWVuIG1vZGlmaWVkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGEuXG4gKlxuICogZ2l0IGRpZmZcbiAqIERlbGV0ZWQgZmlsZXMgKC0tZGlmZi1maWx0ZXI9ZCkgYXJlIG5vdCBpbmNsdWRlZCBhcyB0aGV5IGFyZSBub3QgbG9uZ2VyIHByZXNlbnQgaW4gdGhlIHJlcG9cbiAqIGFuZCBjYW4gbm90IGJlIGNoZWNrZWQgYW55bW9yZS5cbiAqXG4gKiBnaXQgbHMtZmlsZXNcbiAqIFVudHJhY2tlZCBmaWxlcyAoLS1vdGhlcnMpLCB3aGljaCBhcmUgbm90IG1hdGNoZWQgYnkgLmdpdGlnbm9yZSAoLS1leGNsdWRlLXN0YW5kYXJkKVxuICogYXMgdGhleSBhcmUgZXhwZWN0ZWQgdG8gYmVjb21lIHRyYWNrZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxDaGFuZ2VkRmlsZXNTaW5jZShzaGEgPSAnSEVBRCcpIHtcbiAgY29uc3QgZGlmZkZpbGVzID0gZ2l0T3V0cHV0QXNBcnJheShgZ2l0IGRpZmYgLS1uYW1lLW9ubHkgLS1kaWZmLWZpbHRlcj1kICR7c2hhfWApO1xuICBjb25zdCB1bnRyYWNrZWRGaWxlcyA9IGdpdE91dHB1dEFzQXJyYXkoYGdpdCBscy1maWxlcyAtLW90aGVycyAtLWV4Y2x1ZGUtc3RhbmRhcmRgKTtcbiAgLy8gVXNlIGEgc2V0IHRvIGRlZHVwbGljYXRlIHRoZSBsaXN0IGFzIGl0cyBwb3NzaWJsZSBmb3IgYSBmaWxlIHRvIHNob3cgdXAgaW4gYm90aCBsaXN0cy5cbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbLi4uZGlmZkZpbGVzLCAuLi51bnRyYWNrZWRGaWxlc10pKTtcbn1cblxuLyoqXG4gKiBBIGxpc3Qgb2YgYWxsIHN0YWdlZCBmaWxlcyB3aGljaCBoYXZlIGJlZW4gbW9kaWZpZWQuXG4gKlxuICogT25seSBhZGRlZCwgY3JlYXRlZCBhbmQgbW9kaWZpZWQgZmlsZXMgYXJlIGxpc3RlZCBhcyBvdGhlcnMgKGRlbGV0ZWQsIHJlbmFtZWQsIGV0YykgYXJlbid0XG4gKiBjaGFuZ2VkIG9yIGF2YWlsYWJsZSBhcyBjb250ZW50IHRvIGFjdCB1cG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsU3RhZ2VkRmlsZXMoKSB7XG4gIHJldHVybiBnaXRPdXRwdXRBc0FycmF5KGBnaXQgZGlmZiAtLXN0YWdlZCAtLW5hbWUtb25seSAtLWRpZmYtZmlsdGVyPUFDTWApO1xufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbEZpbGVzKCkge1xuICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheShgZ2l0IGxzLWZpbGVzYCk7XG59XG5cblxuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShjbWQ6IHN0cmluZykge1xuICByZXR1cm4gZXhlYyhjbWQsIHtjd2Q6IGdldFJlcG9CYXNlRGlyKCl9KS5zcGxpdCgnXFxuJykubWFwKHggPT4geC50cmltKCkpLmZpbHRlcih4ID0+ICEheCk7XG59XG4iXX0=