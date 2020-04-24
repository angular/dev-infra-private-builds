/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/utils/repo-files", ["require", "exports", "tslib", "shelljs", "@angular/dev-infra-private/utils/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var shelljs_1 = require("shelljs");
    var config_1 = require("@angular/dev-infra-private/utils/config");
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
    function allFiles() {
        return gitOutputAsArray("git ls-files");
    }
    exports.allFiles = allFiles;
    function gitOutputAsArray(cmd) {
        return shelljs_1.exec(cmd, { cwd: config_1.getRepoBaseDir(), silent: true })
            .split('\n')
            .map(function (x) { return x.trim(); })
            .filter(function (x) { return !!x; });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwby1maWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9yZXBvLWZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG1DQUE2QjtJQUM3QixrRUFBd0M7SUFFeEM7Ozs7Ozs7Ozs7T0FVRztJQUNILFNBQWdCLG9CQUFvQixDQUFDLEdBQVk7UUFBWixvQkFBQSxFQUFBLFlBQVk7UUFDL0MsSUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsMENBQXdDLEdBQUssQ0FBQyxDQUFDO1FBQ2xGLElBQU0sY0FBYyxHQUFHLGdCQUFnQixDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDcEYseUZBQXlGO1FBQ3pGLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsa0JBQUssU0FBUyxFQUFLLGNBQWMsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUxELG9EQUtDO0lBRUQsU0FBZ0IsUUFBUTtRQUN0QixPQUFPLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFGRCw0QkFFQztJQUdELFNBQVMsZ0JBQWdCLENBQUMsR0FBVztRQUNuQyxPQUFPLGNBQUksQ0FBQyxHQUFHLEVBQUUsRUFBQyxHQUFHLEVBQUUsdUJBQWMsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQzthQUNsRCxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ1gsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFSLENBQVEsQ0FBQzthQUNsQixNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxFQUFILENBQUcsQ0FBQyxDQUFDO0lBQ3hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIGFsbCBmaWxlcyBjdXJyZW50bHkgaW4gdGhlIHJlcG8gd2hpY2ggaGF2ZSBiZWVuIG1vZGlmaWVkIHNpbmNlIHRoZSBwcm92aWRlZCBzaGEuXG4gKlxuICogZ2l0IGRpZmZcbiAqIERlbGV0ZWQgZmlsZXMgKC0tZGlmZi1maWx0ZXI9ZCkgYXJlIG5vdCBpbmNsdWRlZCBhcyB0aGV5IGFyZSBub3QgbG9uZ2VyIHByZXNlbnQgaW4gdGhlIHJlcG9cbiAqIGFuZCBjYW4gbm90IGJlIGNoZWNrZWQgYW55bW9yZS5cbiAqXG4gKiBnaXQgbHMtZmlsZXNcbiAqIFVudHJhY2tlZCBmaWxlcyAoLS1vdGhlcnMpLCB3aGljaCBhcmUgbm90IG1hdGNoZWQgYnkgLmdpdGlnbm9yZSAoLS1leGNsdWRlLXN0YW5kYXJkKVxuICogYXMgdGhleSBhcmUgZXhwZWN0ZWQgdG8gYmVjb21lIHRyYWNrZWQgZmlsZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbGxDaGFuZ2VkRmlsZXNTaW5jZShzaGEgPSAnSEVBRCcpIHtcbiAgY29uc3QgZGlmZkZpbGVzID0gZ2l0T3V0cHV0QXNBcnJheShgZ2l0IGRpZmYgLS1uYW1lLW9ubHkgLS1kaWZmLWZpbHRlcj1kICR7c2hhfWApO1xuICBjb25zdCB1bnRyYWNrZWRGaWxlcyA9IGdpdE91dHB1dEFzQXJyYXkoYGdpdCBscy1maWxlcyAtLW90aGVycyAtLWV4Y2x1ZGUtc3RhbmRhcmRgKTtcbiAgLy8gVXNlIGEgc2V0IHRvIGRlZHVwbGljYXRlIHRoZSBsaXN0IGFzIGl0cyBwb3NzaWJsZSBmb3IgYSBmaWxlIHRvIHNob3cgdXAgaW4gYm90aCBsaXN0cy5cbiAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChbLi4uZGlmZkZpbGVzLCAuLi51bnRyYWNrZWRGaWxlc10pKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFsbEZpbGVzKCkge1xuICByZXR1cm4gZ2l0T3V0cHV0QXNBcnJheShgZ2l0IGxzLWZpbGVzYCk7XG59XG5cblxuZnVuY3Rpb24gZ2l0T3V0cHV0QXNBcnJheShjbWQ6IHN0cmluZykge1xuICByZXR1cm4gZXhlYyhjbWQsIHtjd2Q6IGdldFJlcG9CYXNlRGlyKCksIHNpbGVudDogdHJ1ZX0pXG4gICAgICAuc3BsaXQoJ1xcbicpXG4gICAgICAubWFwKHggPT4geC50cmltKCkpXG4gICAgICAuZmlsdGVyKHggPT4gISF4KTtcbn1cbiJdfQ==