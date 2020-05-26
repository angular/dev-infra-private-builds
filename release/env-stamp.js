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
        define("@angular/dev-infra-private/release/env-stamp", ["require", "exports", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildEnvStamp = void 0;
    var shelljs_1 = require("shelljs");
    /**
     * Log the environment variables expected by bazel for stamping.
     *
     * See the section on stamping in docs / BAZEL.md
     *
     * This script must be a NodeJS script in order to be cross-platform.
     * See https://github.com/bazelbuild/bazel/issues/5958
     * Note: git operations, especially git status, take a long time inside mounted docker volumes
     * in Windows or OSX hosts (https://github.com/docker/for-win/issues/188).
     */
    function buildEnvStamp() {
        console.info("BUILD_SCM_BRANCH " + getCurrentBranch());
        console.info("BUILD_SCM_COMMIT_SHA " + getCurrentSha());
        console.info("BUILD_SCM_HASH " + getCurrentSha());
        console.info("BUILD_SCM_LOCAL_CHANGES " + hasLocalChanges());
        console.info("BUILD_SCM_USER " + getCurrentGitUser());
        console.info("BUILD_SCM_VERSION " + getSCMVersion());
        process.exit(0);
    }
    exports.buildEnvStamp = buildEnvStamp;
    /** Run the exec command and return the stdout as a trimmed string. */
    function exec(cmd) {
        return shelljs_1.exec(cmd, { silent: true }).toString().trim();
    }
    /** Whether the repo has local changes. */
    function hasLocalChanges() {
        return !!exec("git status --untracked-files=no --porcelain");
    }
    /** Get the version based on the most recent semver tag. */
    function getSCMVersion() {
        var version = exec("git describe --match [0-9]*.[0-9]*.[0-9]* --abbrev=7 --tags HEAD");
        return "" + version.replace(/-([0-9]+)-g/, '+$1.sha-') + (hasLocalChanges() ? '.with-local-changes' : '');
    }
    /** Get the current SHA of HEAD. */
    function getCurrentSha() {
        return exec("git rev-parse HEAD");
    }
    /** Get the currently checked out branch. */
    function getCurrentBranch() {
        return exec("git symbolic-ref --short HEAD");
    }
    /** Get the current git user based on the git config. */
    function getCurrentGitUser() {
        var userName = exec("git config user.name");
        var userEmail = exec("git config user.email");
        return userName + " <" + userEmail + ">";
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG1DQUFzQztJQUl0Qzs7Ozs7Ozs7O09BU0c7SUFDSCxTQUFnQixhQUFhO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQW9CLGdCQUFnQixFQUFJLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUF3QixhQUFhLEVBQUksQ0FBQyxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQWtCLGFBQWEsRUFBSSxDQUFDLENBQUM7UUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBMkIsZUFBZSxFQUFJLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFrQixpQkFBaUIsRUFBSSxDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBcUIsYUFBYSxFQUFJLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFSRCxzQ0FRQztJQUVELHNFQUFzRTtJQUN0RSxTQUFTLElBQUksQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sY0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsU0FBUyxlQUFlO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsU0FBUyxhQUFhO1FBQ3BCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sS0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsR0FDaEQsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRyxDQUFDO0lBQ3pELENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsU0FBUyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxTQUFTLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsU0FBUyxpQkFBaUI7UUFDeEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDOUMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFaEQsT0FBVSxRQUFRLFVBQUssU0FBUyxNQUFHLENBQUM7SUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtleGVjIGFzIF9leGVjfSBmcm9tICdzaGVsbGpzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcCgpIHtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQlJBTkNIICR7Z2V0Q3VycmVudEJyYW5jaCgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9DT01NSVRfU0hBICR7Z2V0Q3VycmVudFNoYSgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9IQVNIICR7Z2V0Q3VycmVudFNoYSgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcigpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7Z2V0U0NNVmVyc2lvbigpfWApO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59XG5cbi8qKiBSdW4gdGhlIGV4ZWMgY29tbWFuZCBhbmQgcmV0dXJuIHRoZSBzdGRvdXQgYXMgYSB0cmltbWVkIHN0cmluZy4gKi9cbmZ1bmN0aW9uIGV4ZWMoY21kOiBzdHJpbmcpIHtcbiAgcmV0dXJuIF9leGVjKGNtZCwge3NpbGVudDogdHJ1ZX0pLnRvU3RyaW5nKCkudHJpbSgpO1xufVxuXG4vKiogV2hldGhlciB0aGUgcmVwbyBoYXMgbG9jYWwgY2hhbmdlcy4gKi9cbmZ1bmN0aW9uIGhhc0xvY2FsQ2hhbmdlcygpIHtcbiAgcmV0dXJuICEhZXhlYyhgZ2l0IHN0YXR1cyAtLXVudHJhY2tlZC1maWxlcz1ubyAtLXBvcmNlbGFpbmApO1xufVxuXG4vKiogR2V0IHRoZSB2ZXJzaW9uIGJhc2VkIG9uIHRoZSBtb3N0IHJlY2VudCBzZW12ZXIgdGFnLiAqL1xuZnVuY3Rpb24gZ2V0U0NNVmVyc2lvbigpIHtcbiAgY29uc3QgdmVyc2lvbiA9IGV4ZWMoYGdpdCBkZXNjcmliZSAtLW1hdGNoIFswLTldKi5bMC05XSouWzAtOV0qIC0tYWJicmV2PTcgLS10YWdzIEhFQURgKTtcbiAgcmV0dXJuIGAke3ZlcnNpb24ucmVwbGFjZSgvLShbMC05XSspLWcvLCAnKyQxLnNoYS0nKX0ke1xuICAgICAgKGhhc0xvY2FsQ2hhbmdlcygpID8gJy53aXRoLWxvY2FsLWNoYW5nZXMnIDogJycpfWA7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgU0hBIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50U2hhKCkge1xuICByZXR1cm4gZXhlYyhgZ2l0IHJldi1wYXJzZSBIRUFEYCk7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QnJhbmNoKCkge1xuICByZXR1cm4gZXhlYyhgZ2l0IHN5bWJvbGljLXJlZiAtLXNob3J0IEhFQURgKTtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKCkge1xuICBjb25zdCB1c2VyTmFtZSA9IGV4ZWMoYGdpdCBjb25maWcgdXNlci5uYW1lYCk7XG4gIGNvbnN0IHVzZXJFbWFpbCA9IGV4ZWMoYGdpdCBjb25maWcgdXNlci5lbWFpbGApO1xuXG4gIHJldHVybiBgJHt1c2VyTmFtZX0gPCR7dXNlckVtYWlsfT5gO1xufVxuIl19