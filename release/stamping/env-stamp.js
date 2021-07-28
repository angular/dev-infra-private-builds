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
        define("@angular/dev-infra-private/release/stamping/env-stamp", ["require", "exports", "path", "semver", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/utils/semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildEnvStamp = void 0;
    var path_1 = require("path");
    var semver_1 = require("semver");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var semver_2 = require("@angular/dev-infra-private/utils/semver");
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
        console.info("BUILD_SCM_COMMIT_SHA " + getCurrentBranchOrRevision());
        console.info("BUILD_SCM_HASH " + getCurrentBranchOrRevision());
        console.info("BUILD_SCM_LOCAL_CHANGES " + hasLocalChanges());
        console.info("BUILD_SCM_USER " + getCurrentGitUser());
        var _a = getSCMVersions(mode), version = _a.version, experimentalVersion = _a.experimentalVersion;
        console.info("BUILD_SCM_VERSION " + version);
        console.info("BUILD_SCM_EXPERIMENTAL_VERSION " + experimentalVersion);
        process.exit();
    }
    exports.buildEnvStamp = buildEnvStamp;
    /** Whether the repo has local changes. */
    function hasLocalChanges() {
        var git = git_client_1.GitClient.get();
        return git.hasUncommittedChanges();
    }
    /**
     * Get the versions for generated packages.
     *
     * In snapshot mode, the version is based on the most recent semver tag.
     * In release mode, the version is based on the base package.json version.
     */
    function getSCMVersions(mode) {
        var git = git_client_1.GitClient.get();
        if (mode === 'release') {
            var packageJsonPath = path_1.join(git.baseDir, 'package.json');
            var version = new semver_1.SemVer(require(packageJsonPath).version).version;
            var experimentalVersion = semver_2.createExperimentalSemver(new semver_1.SemVer(version)).version;
            return { version: version, experimentalVersion: experimentalVersion };
        }
        if (mode === 'snapshot') {
            var localChanges = hasLocalChanges() ? '.with-local-changes' : '';
            var rawVersion = git.run(['describe', '--match', '*[0-9]*.[0-9]*.[0-9]*', '--abbrev=7', '--tags', 'HEAD~100']).stdout;
            var version = new semver_1.SemVer(rawVersion).version;
            var experimentalVersion = semver_2.createExperimentalSemver(version).version;
            return {
                version: "" + version.replace(/-([0-9]+)-g/, '+$1.sha-') + localChanges,
                experimentalVersion: "" + experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-') + localChanges,
            };
        }
        throw Error('No environment stamp mode was provided.');
    }
    /** Get the current branch or revision of HEAD. */
    function getCurrentBranchOrRevision() {
        var git = git_client_1.GitClient.get();
        return git.getCurrentBranchOrRevision();
    }
    /** Get the currently checked out branch. */
    function getCurrentBranch() {
        var git = git_client_1.GitClient.get();
        return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
    }
    /** Get the current git user based on the git config. */
    function getCurrentGitUser() {
        var git = git_client_1.GitClient.get();
        var userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
        var userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
        return userName + " <" + userEmail + ">";
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixpQ0FBOEI7SUFDOUIsOEVBQXFEO0lBQ3JELGtFQUE0RDtJQUk1RDs7Ozs7Ozs7O09BU0c7SUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7UUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxzQkFBb0IsZ0JBQWdCLEVBQUksQ0FBQyxDQUFDO1FBQ3ZELE9BQU8sQ0FBQyxJQUFJLENBQUMsMEJBQXdCLDBCQUEwQixFQUFJLENBQUMsQ0FBQztRQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFrQiwwQkFBMEIsRUFBSSxDQUFDLENBQUM7UUFDL0QsT0FBTyxDQUFDLElBQUksQ0FBQyw2QkFBMkIsZUFBZSxFQUFJLENBQUMsQ0FBQztRQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFrQixpQkFBaUIsRUFBSSxDQUFDLENBQUM7UUFDaEQsSUFBQSxLQUFpQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQXBELE9BQU8sYUFBQSxFQUFFLG1CQUFtQix5QkFBd0IsQ0FBQztRQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLHVCQUFxQixPQUFTLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLG9DQUFrQyxtQkFBcUIsQ0FBQyxDQUFDO1FBQ3RFLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBVkQsc0NBVUM7SUFFRCwwQ0FBMEM7SUFDMUMsU0FBUyxlQUFlO1FBQ3RCLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLGNBQWMsQ0FBQyxJQUFrQjtRQUN4QyxJQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN0QixJQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNuRCxJQUFBLE9BQU8sR0FBSSxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQWhELENBQWlEO1lBQ3hELElBQVMsbUJBQW1CLEdBQUksaUNBQXdCLENBQUMsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBakQsQ0FBa0Q7WUFDckYsT0FBTyxFQUFDLE9BQU8sU0FBQSxFQUFFLG1CQUFtQixxQkFBQSxFQUFDLENBQUM7U0FDdkM7UUFDRCxJQUFJLElBQUksS0FBSyxVQUFVLEVBQUU7WUFDdkIsSUFBTSxZQUFZLEdBQUcsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDN0QsSUFBUSxVQUFVLEdBQUksR0FBRyxDQUFDLEdBQUcsQ0FDaEMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLHVCQUF1QixFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUMsT0FEaEUsQ0FDaUU7WUFDbkYsSUFBQSxPQUFPLEdBQUksSUFBSSxlQUFNLENBQUMsVUFBVSxDQUFDLFFBQTFCLENBQTJCO1lBQ2xDLElBQVMsbUJBQW1CLEdBQUksaUNBQXdCLENBQUMsT0FBTyxDQUFDLFFBQXJDLENBQXNDO1lBQ3pFLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEtBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQUcsWUFBYztnQkFDdkUsbUJBQW1CLEVBQ2YsS0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxHQUFHLFlBQWM7YUFDL0UsQ0FBQztTQUNIO1FBQ0QsTUFBTSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsa0RBQWtEO0lBQ2xELFNBQVMsMEJBQTBCO1FBQ2pDLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztJQUMxQyxDQUFDO0lBRUQsNENBQTRDO0lBQzVDLFNBQVMsZ0JBQWdCO1FBQ3ZCLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNwRSxDQUFDO0lBRUQsd0RBQXdEO0lBQ3hELFNBQVMsaUJBQWlCO1FBQ3hCLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxRQUFRLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxjQUFjLENBQUM7UUFDeEYsSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxlQUFlLENBQUM7UUFDM0YsT0FBVSxRQUFRLFVBQUssU0FBUyxNQUFHLENBQUM7SUFDdEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtjcmVhdGVFeHBlcmltZW50YWxTZW12ZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NlbXZlcic7XG5cbmV4cG9ydCB0eXBlIEVudlN0YW1wTW9kZSA9ICdzbmFwc2hvdCd8J3JlbGVhc2UnO1xuXG4vKipcbiAqIExvZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGV4cGVjdGVkIGJ5IGJhemVsIGZvciBzdGFtcGluZy5cbiAqXG4gKiBTZWUgdGhlIHNlY3Rpb24gb24gc3RhbXBpbmcgaW4gZG9jcyAvIEJBWkVMLm1kXG4gKlxuICogVGhpcyBzY3JpcHQgbXVzdCBiZSBhIE5vZGVKUyBzY3JpcHQgaW4gb3JkZXIgdG8gYmUgY3Jvc3MtcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2JhemVsYnVpbGQvYmF6ZWwvaXNzdWVzLzU5NThcbiAqIE5vdGU6IGdpdCBvcGVyYXRpb25zLCBlc3BlY2lhbGx5IGdpdCBzdGF0dXMsIHRha2UgYSBsb25nIHRpbWUgaW5zaWRlIG1vdW50ZWQgZG9ja2VyIHZvbHVtZXNcbiAqIGluIFdpbmRvd3Mgb3IgT1NYIGhvc3RzIChodHRwczovL2dpdGh1Yi5jb20vZG9ja2VyL2Zvci13aW4vaXNzdWVzLzE4OCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEVudlN0YW1wKG1vZGU6IEVudlN0YW1wTW9kZSkge1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0NPTU1JVF9TSEEgJHtnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9IQVNIICR7Z2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fTE9DQUxfQ0hBTkdFUyAke2hhc0xvY2FsQ2hhbmdlcygpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9VU0VSICR7Z2V0Q3VycmVudEdpdFVzZXIoKX1gKTtcbiAgY29uc3Qge3ZlcnNpb24sIGV4cGVyaW1lbnRhbFZlcnNpb259ID0gZ2V0U0NNVmVyc2lvbnMobW9kZSk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1ZFUlNJT04gJHt2ZXJzaW9ufWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9FWFBFUklNRU5UQUxfVkVSU0lPTiAke2V4cGVyaW1lbnRhbFZlcnNpb259YCk7XG4gIHByb2Nlc3MuZXhpdCgpO1xufVxuXG4vKiogV2hldGhlciB0aGUgcmVwbyBoYXMgbG9jYWwgY2hhbmdlcy4gKi9cbmZ1bmN0aW9uIGhhc0xvY2FsQ2hhbmdlcygpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICByZXR1cm4gZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbnMgZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb25zKG1vZGU6IEVudlN0YW1wTW9kZSk6IHt2ZXJzaW9uOiBzdHJpbmcsIGV4cGVyaW1lbnRhbFZlcnNpb246IHN0cmluZ30ge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIGlmIChtb2RlID09PSAncmVsZWFzZScpIHtcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAncGFja2FnZS5qc29uJyk7XG4gICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyZXF1aXJlKHBhY2thZ2VKc29uUGF0aCkudmVyc2lvbik7XG4gICAgY29uc3Qge3ZlcnNpb246IGV4cGVyaW1lbnRhbFZlcnNpb259ID0gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKG5ldyBTZW1WZXIodmVyc2lvbikpO1xuICAgIHJldHVybiB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn07XG4gIH1cbiAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICBjb25zdCBsb2NhbENoYW5nZXMgPSBoYXNMb2NhbENoYW5nZXMoKSA/ICcud2l0aC1sb2NhbC1jaGFuZ2VzJyA6ICcnO1xuICAgIGNvbnN0IHtzdGRvdXQ6IHJhd1ZlcnNpb259ID0gZ2l0LnJ1bihcbiAgICAgICAgWydkZXNjcmliZScsICctLW1hdGNoJywgJypbMC05XSouWzAtOV0qLlswLTldKicsICctLWFiYnJldj03JywgJy0tdGFncycsICdIRUFEfjEwMCddKTtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSBuZXcgU2VtVmVyKHJhd1ZlcnNpb24pO1xuICAgIGNvbnN0IHt2ZXJzaW9uOiBleHBlcmltZW50YWxWZXJzaW9ufSA9IGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcih2ZXJzaW9uKTtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogYCR7dmVyc2lvbi5yZXBsYWNlKC8tKFswLTldKyktZy8sICcrJDEuc2hhLScpfSR7bG9jYWxDaGFuZ2VzfWAsXG4gICAgICBleHBlcmltZW50YWxWZXJzaW9uOlxuICAgICAgICAgIGAke2V4cGVyaW1lbnRhbFZlcnNpb24ucmVwbGFjZSgvLShbMC05XSspLWcvLCAnKyQxLnNoYS0nKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgIH07XG4gIH1cbiAgdGhyb3cgRXJyb3IoJ05vIGVudmlyb25tZW50IHN0YW1wIG1vZGUgd2FzIHByb3ZpZGVkLicpO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGJyYW5jaCBvciByZXZpc2lvbiBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgcmV0dXJuIGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaCgpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICByZXR1cm4gZ2l0LnJ1bihbJ3N5bWJvbGljLXJlZicsICctLXNob3J0JywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKCkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIGxldCB1c2VyTmFtZSA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLm5hbWUnXSkuc3Rkb3V0LnRyaW0oKSB8fCAnVW5rbm93biBVc2VyJztcbiAgbGV0IHVzZXJFbWFpbCA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLmVtYWlsJ10pLnN0ZG91dC50cmltKCkgfHwgJ3Vua25vd25fZW1haWwnO1xuICByZXR1cm4gYCR7dXNlck5hbWV9IDwke3VzZXJFbWFpbH0+YDtcbn1cbiJdfQ==