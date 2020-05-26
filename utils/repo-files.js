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
    exports.allFiles = exports.allChangedFilesSince = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVwby1maWxlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS91dGlscy9yZXBvLWZpbGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxtQ0FBNkI7SUFDN0Isa0VBQXdDO0lBRXhDOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxHQUFZO1FBQVosb0JBQUEsRUFBQSxZQUFZO1FBQy9DLElBQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLDBDQUF3QyxHQUFLLENBQUMsQ0FBQztRQUNsRixJQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ3BGLHlGQUF5RjtRQUN6RixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLGtCQUFLLFNBQVMsRUFBSyxjQUFjLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFMRCxvREFLQztJQUVELFNBQWdCLFFBQVE7UUFDdEIsT0FBTyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRkQsNEJBRUM7SUFHRCxTQUFTLGdCQUFnQixDQUFDLEdBQVc7UUFDbkMsT0FBTyxjQUFJLENBQUMsR0FBRyxFQUFFLEVBQUMsR0FBRyxFQUFFLHVCQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUM7YUFDbEQsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNYLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUM7YUFDbEIsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsRUFBSCxDQUFHLENBQUMsQ0FBQztJQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4ZWN9IGZyb20gJ3NoZWxsanMnO1xuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi9jb25maWcnO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBhbGwgZmlsZXMgY3VycmVudGx5IGluIHRoZSByZXBvIHdoaWNoIGhhdmUgYmVlbiBtb2RpZmllZCBzaW5jZSB0aGUgcHJvdmlkZWQgc2hhLlxuICpcbiAqIGdpdCBkaWZmXG4gKiBEZWxldGVkIGZpbGVzICgtLWRpZmYtZmlsdGVyPWQpIGFyZSBub3QgaW5jbHVkZWQgYXMgdGhleSBhcmUgbm90IGxvbmdlciBwcmVzZW50IGluIHRoZSByZXBvXG4gKiBhbmQgY2FuIG5vdCBiZSBjaGVja2VkIGFueW1vcmUuXG4gKlxuICogZ2l0IGxzLWZpbGVzXG4gKiBVbnRyYWNrZWQgZmlsZXMgKC0tb3RoZXJzKSwgd2hpY2ggYXJlIG5vdCBtYXRjaGVkIGJ5IC5naXRpZ25vcmUgKC0tZXhjbHVkZS1zdGFuZGFyZClcbiAqIGFzIHRoZXkgYXJlIGV4cGVjdGVkIHRvIGJlY29tZSB0cmFja2VkIGZpbGVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsQ2hhbmdlZEZpbGVzU2luY2Uoc2hhID0gJ0hFQUQnKSB7XG4gIGNvbnN0IGRpZmZGaWxlcyA9IGdpdE91dHB1dEFzQXJyYXkoYGdpdCBkaWZmIC0tbmFtZS1vbmx5IC0tZGlmZi1maWx0ZXI9ZCAke3NoYX1gKTtcbiAgY29uc3QgdW50cmFja2VkRmlsZXMgPSBnaXRPdXRwdXRBc0FycmF5KGBnaXQgbHMtZmlsZXMgLS1vdGhlcnMgLS1leGNsdWRlLXN0YW5kYXJkYCk7XG4gIC8vIFVzZSBhIHNldCB0byBkZWR1cGxpY2F0ZSB0aGUgbGlzdCBhcyBpdHMgcG9zc2libGUgZm9yIGEgZmlsZSB0byBzaG93IHVwIGluIGJvdGggbGlzdHMuXG4gIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoWy4uLmRpZmZGaWxlcywgLi4udW50cmFja2VkRmlsZXNdKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhbGxGaWxlcygpIHtcbiAgcmV0dXJuIGdpdE91dHB1dEFzQXJyYXkoYGdpdCBscy1maWxlc2ApO1xufVxuXG5cbmZ1bmN0aW9uIGdpdE91dHB1dEFzQXJyYXkoY21kOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGV4ZWMoY21kLCB7Y3dkOiBnZXRSZXBvQmFzZURpcigpLCBzaWxlbnQ6IHRydWV9KVxuICAgICAgLnNwbGl0KCdcXG4nKVxuICAgICAgLm1hcCh4ID0+IHgudHJpbSgpKVxuICAgICAgLmZpbHRlcih4ID0+ICEheCk7XG59XG4iXX0=