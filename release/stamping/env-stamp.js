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
        define("@angular/dev-infra-private/release/stamping/env-stamp", ["require", "exports", "path", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildEnvStamp = void 0;
    var path_1 = require("path");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
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
    function buildEnvStamp(mode) {
        console.info("BUILD_SCM_BRANCH " + getCurrentBranch());
        console.info("BUILD_SCM_COMMIT_SHA " + getCurrentSha());
        console.info("BUILD_SCM_HASH " + getCurrentSha());
        console.info("BUILD_SCM_LOCAL_CHANGES " + hasLocalChanges());
        console.info("BUILD_SCM_USER " + getCurrentGitUser());
        console.info("BUILD_SCM_VERSION " + getSCMVersion(mode));
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
    /**
     * Get the version for generated packages.
     *
     * In snapshot mode, the version is based on the most recent semver tag.
     * In release mode, the version is based on the base package.json version.
     */
    function getSCMVersion(mode) {
        if (mode === 'release') {
            var git = index_1.GitClient.getInstance();
            var packageJsonPath = path_1.join(git.baseDir, 'package.json');
            var version = require(packageJsonPath).version;
            return version;
        }
        if (mode === 'snapshot') {
            var version = exec("git describe --match [0-9]*.[0-9]*.[0-9]* --abbrev=7 --tags HEAD");
            return "" + version.replace(/-([0-9]+)-g/, '+$1.sha-') + (hasLocalChanges() ? '.with-local-changes' : '');
        }
        return '0.0.0';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixvRUFBZ0Q7SUFFaEQsb0VBQWtEO0lBSWxEOzs7Ozs7Ozs7T0FTRztJQUNILFNBQWdCLGFBQWEsQ0FBQyxJQUFrQjtRQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLHNCQUFvQixnQkFBZ0IsRUFBSSxDQUFDLENBQUM7UUFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQywwQkFBd0IsYUFBYSxFQUFJLENBQUMsQ0FBQztRQUN4RCxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFrQixhQUFhLEVBQUksQ0FBQyxDQUFDO1FBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTJCLGVBQWUsRUFBSSxDQUFDLENBQUM7UUFDN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBa0IsaUJBQWlCLEVBQUksQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXFCLGFBQWEsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVJELHNDQVFDO0lBRUQsc0VBQXNFO0lBQ3RFLFNBQVMsSUFBSSxDQUFDLEdBQVc7UUFDdkIsT0FBTyxjQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELDBDQUEwQztJQUMxQyxTQUFTLGVBQWU7UUFDdEIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUyxhQUFhLENBQUMsSUFBa0I7UUFDdkMsSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQ3RCLElBQU0sR0FBRyxHQUFHLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDcEMsSUFBTSxlQUFlLEdBQUcsV0FBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7WUFDbkQsSUFBQSxPQUFPLEdBQUksT0FBTyxDQUFDLGVBQWUsQ0FBQyxRQUE1QixDQUE2QjtZQUMzQyxPQUFPLE9BQU8sQ0FBQztTQUNoQjtRQUNELElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUN2QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0VBQWtFLENBQUMsQ0FBQztZQUN6RixPQUFPLEtBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQ2hELENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUcsQ0FBQztTQUN4RDtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxtQ0FBbUM7SUFDbkMsU0FBUyxhQUFhO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxTQUFTLGdCQUFnQjtRQUN2QixPQUFPLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsU0FBUyxpQkFBaUI7UUFDeEIsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDOUMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFaEQsT0FBVSxRQUFRLFVBQUssU0FBUyxNQUFHLENBQUM7SUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5cbmltcG9ydCB7ZXhlYyBhcyBfZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cbmV4cG9ydCB0eXBlIEVudlN0YW1wTW9kZSA9ICdzbmFwc2hvdCd8J3JlbGVhc2UnO1xuXG4vKipcbiAqIExvZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGV4cGVjdGVkIGJ5IGJhemVsIGZvciBzdGFtcGluZy5cbiAqXG4gKiBTZWUgdGhlIHNlY3Rpb24gb24gc3RhbXBpbmcgaW4gZG9jcyAvIEJBWkVMLm1kXG4gKlxuICogVGhpcyBzY3JpcHQgbXVzdCBiZSBhIE5vZGVKUyBzY3JpcHQgaW4gb3JkZXIgdG8gYmUgY3Jvc3MtcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2JhemVsYnVpbGQvYmF6ZWwvaXNzdWVzLzU5NThcbiAqIE5vdGU6IGdpdCBvcGVyYXRpb25zLCBlc3BlY2lhbGx5IGdpdCBzdGF0dXMsIHRha2UgYSBsb25nIHRpbWUgaW5zaWRlIG1vdW50ZWQgZG9ja2VyIHZvbHVtZXNcbiAqIGluIFdpbmRvd3Mgb3IgT1NYIGhvc3RzIChodHRwczovL2dpdGh1Yi5jb20vZG9ja2VyL2Zvci13aW4vaXNzdWVzLzE4OCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEVudlN0YW1wKG1vZGU6IEVudlN0YW1wTW9kZSkge1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0NPTU1JVF9TSEEgJHtnZXRDdXJyZW50U2hhKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50U2hhKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0xPQ0FMX0NIQU5HRVMgJHtoYXNMb2NhbENoYW5nZXMoKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVVNFUiAke2dldEN1cnJlbnRHaXRVc2VyKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1ZFUlNJT04gJHtnZXRTQ01WZXJzaW9uKG1vZGUpfWApO1xuICBwcm9jZXNzLmV4aXQoMCk7XG59XG5cbi8qKiBSdW4gdGhlIGV4ZWMgY29tbWFuZCBhbmQgcmV0dXJuIHRoZSBzdGRvdXQgYXMgYSB0cmltbWVkIHN0cmluZy4gKi9cbmZ1bmN0aW9uIGV4ZWMoY21kOiBzdHJpbmcpIHtcbiAgcmV0dXJuIF9leGVjKGNtZCkudHJpbSgpO1xufVxuXG4vKiogV2hldGhlciB0aGUgcmVwbyBoYXMgbG9jYWwgY2hhbmdlcy4gKi9cbmZ1bmN0aW9uIGhhc0xvY2FsQ2hhbmdlcygpIHtcbiAgcmV0dXJuICEhZXhlYyhgZ2l0IHN0YXR1cyAtLXVudHJhY2tlZC1maWxlcz1ubyAtLXBvcmNlbGFpbmApO1xufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbiBmb3IgZ2VuZXJhdGVkIHBhY2thZ2VzLlxuICpcbiAqIEluIHNuYXBzaG90IG1vZGUsIHRoZSB2ZXJzaW9uIGlzIGJhc2VkIG9uIHRoZSBtb3N0IHJlY2VudCBzZW12ZXIgdGFnLlxuICogSW4gcmVsZWFzZSBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgYmFzZSBwYWNrYWdlLmpzb24gdmVyc2lvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0U0NNVmVyc2lvbihtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgaWYgKG1vZGUgPT09ICdyZWxlYXNlJykge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsICdwYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSByZXF1aXJlKHBhY2thZ2VKc29uUGF0aCk7XG4gICAgcmV0dXJuIHZlcnNpb247XG4gIH1cbiAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICBjb25zdCB2ZXJzaW9uID0gZXhlYyhgZ2l0IGRlc2NyaWJlIC0tbWF0Y2ggWzAtOV0qLlswLTldKi5bMC05XSogLS1hYmJyZXY9NyAtLXRhZ3MgSEVBRGApO1xuICAgIHJldHVybiBgJHt2ZXJzaW9uLnJlcGxhY2UoLy0oWzAtOV0rKS1nLywgJyskMS5zaGEtJyl9JHtcbiAgICAgICAgKGhhc0xvY2FsQ2hhbmdlcygpID8gJy53aXRoLWxvY2FsLWNoYW5nZXMnIDogJycpfWA7XG4gIH1cbiAgcmV0dXJuICcwLjAuMCc7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgU0hBIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50U2hhKCkge1xuICByZXR1cm4gZXhlYyhgZ2l0IHJldi1wYXJzZSBIRUFEYCk7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QnJhbmNoKCkge1xuICByZXR1cm4gZXhlYyhgZ2l0IHN5bWJvbGljLXJlZiAtLXNob3J0IEhFQURgKTtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKCkge1xuICBjb25zdCB1c2VyTmFtZSA9IGV4ZWMoYGdpdCBjb25maWcgdXNlci5uYW1lYCk7XG4gIGNvbnN0IHVzZXJFbWFpbCA9IGV4ZWMoYGdpdCBjb25maWcgdXNlci5lbWFpbGApO1xuXG4gIHJldHVybiBgJHt1c2VyTmFtZX0gPCR7dXNlckVtYWlsfT5gO1xufVxuIl19