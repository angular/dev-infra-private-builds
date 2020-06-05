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
        define("@angular/dev-infra-private/release/env-stamp", ["require", "exports", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildEnvStamp = void 0;
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
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
        return shelljs_1.exec(cmd).trim();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUErQztJQUUvQzs7Ozs7Ozs7O09BU0c7SUFDSCxTQUFnQixhQUFhO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQW9CLGdCQUFnQixFQUFJLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUF3QixhQUFhLEVBQUksQ0FBQyxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQWtCLGFBQWEsRUFBSSxDQUFDLENBQUM7UUFDbEQsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBMkIsZUFBZSxFQUFJLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFrQixpQkFBaUIsRUFBSSxDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLElBQUksQ0FBQyx1QkFBcUIsYUFBYSxFQUFJLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFSRCxzQ0FRQztJQUVELHNFQUFzRTtJQUN0RSxTQUFTLElBQUksQ0FBQyxHQUFXO1FBQ3ZCLE9BQU8sY0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsU0FBUyxlQUFlO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCwyREFBMkQ7SUFDM0QsU0FBUyxhQUFhO1FBQ3BCLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sS0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxVQUFVLENBQUMsR0FDaEQsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBRyxDQUFDO0lBQ3pELENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsU0FBUyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxTQUFTLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsU0FBUyxpQkFBaUI7UUFDeEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDOUMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFaEQsT0FBVSxRQUFRLFVBQUssU0FBUyxNQUFHLENBQUM7SUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2V4ZWMgYXMgX2V4ZWN9IGZyb20gJy4uL3V0aWxzL3NoZWxsanMnO1xuXG4vKipcbiAqIExvZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGV4cGVjdGVkIGJ5IGJhemVsIGZvciBzdGFtcGluZy5cbiAqXG4gKiBTZWUgdGhlIHNlY3Rpb24gb24gc3RhbXBpbmcgaW4gZG9jcyAvIEJBWkVMLm1kXG4gKlxuICogVGhpcyBzY3JpcHQgbXVzdCBiZSBhIE5vZGVKUyBzY3JpcHQgaW4gb3JkZXIgdG8gYmUgY3Jvc3MtcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2JhemVsYnVpbGQvYmF6ZWwvaXNzdWVzLzU5NThcbiAqIE5vdGU6IGdpdCBvcGVyYXRpb25zLCBlc3BlY2lhbGx5IGdpdCBzdGF0dXMsIHRha2UgYSBsb25nIHRpbWUgaW5zaWRlIG1vdW50ZWQgZG9ja2VyIHZvbHVtZXNcbiAqIGluIFdpbmRvd3Mgb3IgT1NYIGhvc3RzIChodHRwczovL2dpdGh1Yi5jb20vZG9ja2VyL2Zvci13aW4vaXNzdWVzLzE4OCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEVudlN0YW1wKCkge1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0NPTU1JVF9TSEEgJHtnZXRDdXJyZW50U2hhKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50U2hhKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0xPQ0FMX0NIQU5HRVMgJHtoYXNMb2NhbENoYW5nZXMoKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVVNFUiAke2dldEN1cnJlbnRHaXRVc2VyKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1ZFUlNJT04gJHtnZXRTQ01WZXJzaW9uKCl9YCk7XG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cblxuLyoqIFJ1biB0aGUgZXhlYyBjb21tYW5kIGFuZCByZXR1cm4gdGhlIHN0ZG91dCBhcyBhIHRyaW1tZWQgc3RyaW5nLiAqL1xuZnVuY3Rpb24gZXhlYyhjbWQ6IHN0cmluZykge1xuICByZXR1cm4gX2V4ZWMoY21kKS50cmltKCk7XG59XG5cbi8qKiBXaGV0aGVyIHRoZSByZXBvIGhhcyBsb2NhbCBjaGFuZ2VzLiAqL1xuZnVuY3Rpb24gaGFzTG9jYWxDaGFuZ2VzKCkge1xuICByZXR1cm4gISFleGVjKGBnaXQgc3RhdHVzIC0tdW50cmFja2VkLWZpbGVzPW5vIC0tcG9yY2VsYWluYCk7XG59XG5cbi8qKiBHZXQgdGhlIHZlcnNpb24gYmFzZWQgb24gdGhlIG1vc3QgcmVjZW50IHNlbXZlciB0YWcuICovXG5mdW5jdGlvbiBnZXRTQ01WZXJzaW9uKCkge1xuICBjb25zdCB2ZXJzaW9uID0gZXhlYyhgZ2l0IGRlc2NyaWJlIC0tbWF0Y2ggWzAtOV0qLlswLTldKi5bMC05XSogLS1hYmJyZXY9NyAtLXRhZ3MgSEVBRGApO1xuICByZXR1cm4gYCR7dmVyc2lvbi5yZXBsYWNlKC8tKFswLTldKyktZy8sICcrJDEuc2hhLScpfSR7XG4gICAgICAoaGFzTG9jYWxDaGFuZ2VzKCkgPyAnLndpdGgtbG9jYWwtY2hhbmdlcycgOiAnJyl9YDtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBTSEEgb2YgSEVBRC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRTaGEoKSB7XG4gIHJldHVybiBleGVjKGBnaXQgcmV2LXBhcnNlIEhFQURgKTtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2goKSB7XG4gIHJldHVybiBleGVjKGBnaXQgc3ltYm9saWMtcmVmIC0tc2hvcnQgSEVBRGApO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGdpdCB1c2VyIGJhc2VkIG9uIHRoZSBnaXQgY29uZmlnLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEdpdFVzZXIoKSB7XG4gIGNvbnN0IHVzZXJOYW1lID0gZXhlYyhgZ2l0IGNvbmZpZyB1c2VyLm5hbWVgKTtcbiAgY29uc3QgdXNlckVtYWlsID0gZXhlYyhgZ2l0IGNvbmZpZyB1c2VyLmVtYWlsYCk7XG5cbiAgcmV0dXJuIGAke3VzZXJOYW1lfSA8JHt1c2VyRW1haWx9PmA7XG59XG4iXX0=