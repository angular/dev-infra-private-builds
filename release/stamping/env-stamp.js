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
        define("@angular/dev-infra-private/release/stamping/env-stamp", ["require", "exports", "path", "@angular/dev-infra-private/utils/git/git-client"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buildEnvStamp = void 0;
    var path_1 = require("path");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
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
        console.info("BUILD_SCM_VERSION " + getSCMVersion(mode));
        process.exit();
    }
    exports.buildEnvStamp = buildEnvStamp;
    /** Whether the repo has local changes. */
    function hasLocalChanges() {
        var git = git_client_1.GitClient.get();
        return git.hasUncommittedChanges();
    }
    /**
     * Get the version for generated packages.
     *
     * In snapshot mode, the version is based on the most recent semver tag.
     * In release mode, the version is based on the base package.json version.
     */
    function getSCMVersion(mode) {
        var git = git_client_1.GitClient.get();
        if (mode === 'release') {
            var packageJsonPath = path_1.join(git.baseDir, 'package.json');
            var version = require(packageJsonPath).version;
            return version;
        }
        if (mode === 'snapshot') {
            var version = git.run(['describe', '--match', '[0-9]*.[0-9]*.[0-9]*', '--abbrev=7', '--tags', 'HEAD'])
                .stdout.trim();
            return "" + version.replace(/-([0-9]+)-g/, '+$1.sha-') + (hasLocalChanges() ? '.with-local-changes' : '');
        }
        return '0.0.0';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQiw4RUFBcUQ7SUFJckQ7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBZ0IsYUFBYSxDQUFDLElBQWtCO1FBQzlDLE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQW9CLGdCQUFnQixFQUFJLENBQUMsQ0FBQztRQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLDBCQUF3QiwwQkFBMEIsRUFBSSxDQUFDLENBQUM7UUFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBa0IsMEJBQTBCLEVBQUksQ0FBQyxDQUFDO1FBQy9ELE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTJCLGVBQWUsRUFBSSxDQUFDLENBQUM7UUFDN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBa0IsaUJBQWlCLEVBQUksQ0FBQyxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsdUJBQXFCLGFBQWEsQ0FBQyxJQUFJLENBQUcsQ0FBQyxDQUFDO1FBQ3pELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBUkQsc0NBUUM7SUFFRCwwQ0FBMEM7SUFDMUMsU0FBUyxlQUFlO1FBQ3RCLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLGFBQWEsQ0FBQyxJQUFrQjtRQUN2QyxJQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtZQUN0QixJQUFNLGVBQWUsR0FBRyxXQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUNuRCxJQUFBLE9BQU8sR0FBSSxPQUFPLENBQUMsZUFBZSxDQUFDLFFBQTVCLENBQTZCO1lBQzNDLE9BQU8sT0FBTyxDQUFDO1NBQ2hCO1FBQ0QsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ3ZCLElBQU0sT0FBTyxHQUNULEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7aUJBQ25GLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixPQUFPLEtBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQ2hELENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUcsQ0FBQztTQUN4RDtRQUNELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsU0FBUywwQkFBMEI7UUFDakMsSUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixPQUFPLEdBQUcsQ0FBQywwQkFBMEIsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFRCw0Q0FBNEM7SUFDNUMsU0FBUyxnQkFBZ0I7UUFDdkIsSUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixPQUFPLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3BFLENBQUM7SUFFRCx3REFBd0Q7SUFDeEQsU0FBUyxpQkFBaUI7UUFDeEIsSUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQztRQUN4RixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQztRQUMzRixPQUFVLFFBQVEsVUFBSyxTQUFTLE1BQUcsQ0FBQztJQUN0QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5leHBvcnQgdHlwZSBFbnZTdGFtcE1vZGUgPSAnc25hcHNob3QnfCdyZWxlYXNlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcChtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQlJBTkNIICR7Z2V0Q3VycmVudEJyYW5jaCgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9DT01NSVRfU0hBICR7Z2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fSEFTSCAke2dldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0xPQ0FMX0NIQU5HRVMgJHtoYXNMb2NhbENoYW5nZXMoKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVVNFUiAke2dldEN1cnJlbnRHaXRVc2VyKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1ZFUlNJT04gJHtnZXRTQ01WZXJzaW9uKG1vZGUpfWApO1xuICBwcm9jZXNzLmV4aXQoKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgcmV0dXJuIGdpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHZlcnNpb24gZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb24obW9kZTogRW52U3RhbXBNb2RlKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgaWYgKG1vZGUgPT09ICdyZWxlYXNlJykge1xuICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsICdwYWNrYWdlLmpzb24nKTtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSByZXF1aXJlKHBhY2thZ2VKc29uUGF0aCk7XG4gICAgcmV0dXJuIHZlcnNpb247XG4gIH1cbiAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICBjb25zdCB2ZXJzaW9uID1cbiAgICAgICAgZ2l0LnJ1bihbJ2Rlc2NyaWJlJywgJy0tbWF0Y2gnLCAnWzAtOV0qLlswLTldKi5bMC05XSonLCAnLS1hYmJyZXY9NycsICctLXRhZ3MnLCAnSEVBRCddKVxuICAgICAgICAgICAgLnN0ZG91dC50cmltKCk7XG4gICAgcmV0dXJuIGAke3ZlcnNpb24ucmVwbGFjZSgvLShbMC05XSspLWcvLCAnKyQxLnNoYS0nKX0ke1xuICAgICAgICAoaGFzTG9jYWxDaGFuZ2VzKCkgPyAnLndpdGgtbG9jYWwtY2hhbmdlcycgOiAnJyl9YDtcbiAgfVxuICByZXR1cm4gJzAuMC4wJztcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBicmFuY2ggb3IgcmV2aXNpb24gb2YgSEVBRC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIHJldHVybiBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbn1cblxuLyoqIEdldCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2goKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgcmV0dXJuIGdpdC5ydW4oWydzeW1ib2xpYy1yZWYnLCAnLS1zaG9ydCcsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgZ2l0IHVzZXIgYmFzZWQgb24gdGhlIGdpdCBjb25maWcuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50R2l0VXNlcigpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBsZXQgdXNlck5hbWUgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5uYW1lJ10pLnN0ZG91dC50cmltKCkgfHwgJ1Vua25vd24gVXNlcic7XG4gIGxldCB1c2VyRW1haWwgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5lbWFpbCddKS5zdGRvdXQudHJpbSgpIHx8ICd1bmtub3duX2VtYWlsJztcbiAgcmV0dXJuIGAke3VzZXJOYW1lfSA8JHt1c2VyRW1haWx9PmA7XG59XG4iXX0=