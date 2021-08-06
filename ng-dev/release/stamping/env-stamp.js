"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildEnvStamp = void 0;
const path_1 = require("path");
const semver_1 = require("semver");
const git_client_1 = require("../../utils/git/git-client");
const semver_2 = require("../../utils/semver");
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
    console.info(`BUILD_SCM_BRANCH ${getCurrentBranch()}`);
    console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentBranchOrRevision()}`);
    console.info(`BUILD_SCM_HASH ${getCurrentBranchOrRevision()}`);
    console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
    console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
    const { version, experimentalVersion } = getSCMVersions(mode);
    console.info(`BUILD_SCM_VERSION ${version}`);
    console.info(`BUILD_SCM_EXPERIMENTAL_VERSION ${experimentalVersion}`);
    process.exit();
}
exports.buildEnvStamp = buildEnvStamp;
/** Whether the repo has local changes. */
function hasLocalChanges() {
    try {
        const git = git_client_1.GitClient.get();
        return git.hasUncommittedChanges();
    }
    catch {
        return true;
    }
}
/**
 * Get the versions for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the base package.json version.
 */
function getSCMVersions(mode) {
    try {
        const git = git_client_1.GitClient.get();
        if (mode === 'snapshot') {
            const localChanges = hasLocalChanges() ? '.with-local-changes' : '';
            const { stdout: rawVersion } = git.run([
                'describe',
                '--match',
                '*[0-9]*.[0-9]*.[0-9]*',
                '--abbrev=7',
                '--tags',
                'HEAD',
            ]);
            const { version } = new semver_1.SemVer(rawVersion);
            const { version: experimentalVersion } = semver_2.createExperimentalSemver(version);
            return {
                version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
                experimentalVersion: `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
            };
        }
        else {
            const packageJsonPath = path_1.join(git.baseDir, 'package.json');
            const { version } = new semver_1.SemVer(require(packageJsonPath).version);
            const { version: experimentalVersion } = semver_2.createExperimentalSemver(new semver_1.SemVer(version));
            return { version, experimentalVersion };
        }
    }
    catch {
        return {
            version: '',
            experimentalVersion: '',
        };
    }
}
/** Get the current branch or revision of HEAD. */
function getCurrentBranchOrRevision() {
    try {
        const git = git_client_1.GitClient.get();
        return git.getCurrentBranchOrRevision();
    }
    catch {
        return '';
    }
}
/** Get the currently checked out branch. */
function getCurrentBranch() {
    try {
        const git = git_client_1.GitClient.get();
        return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
    }
    catch {
        return '';
    }
}
/** Get the current git user based on the git config. */
function getCurrentGitUser() {
    try {
        const git = git_client_1.GitClient.get();
        let userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
        let userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
        return `${userName} <${userEmail}>`;
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUMxQixtQ0FBOEI7QUFDOUIsMkRBQXFEO0FBQ3JELCtDQUE0RDtBQUk1RDs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7SUFDOUMsT0FBTyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdkQsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsMEJBQTBCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0QsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzdELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3RELE1BQU0sRUFBQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUMsR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUM3QyxPQUFPLENBQUMsSUFBSSxDQUFDLGtDQUFrQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7SUFDdEUsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2pCLENBQUM7QUFWRCxzQ0FVQztBQUVELDBDQUEwQztBQUMxQyxTQUFTLGVBQWU7SUFDdEIsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQztLQUNwQztJQUFDLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxjQUFjLENBQUMsSUFBa0I7SUFDeEMsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFO1lBQ3ZCLE1BQU0sWUFBWSxHQUFHLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3BFLE1BQU0sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFDLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQztnQkFDbkMsVUFBVTtnQkFDVixTQUFTO2dCQUNULHVCQUF1QjtnQkFDdkIsWUFBWTtnQkFDWixRQUFRO2dCQUNSLE1BQU07YUFDUCxDQUFDLENBQUM7WUFDSCxNQUFNLEVBQUMsT0FBTyxFQUFDLEdBQUcsSUFBSSxlQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDekMsTUFBTSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLGlDQUF3QixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pFLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQUcsWUFBWSxFQUFFO2dCQUN2RSxtQkFBbUIsRUFBRSxHQUFHLG1CQUFtQixDQUFDLE9BQU8sQ0FDakQsYUFBYSxFQUNiLFVBQVUsQ0FDWCxHQUFHLFlBQVksRUFBRTthQUNuQixDQUFDO1NBQ0g7YUFBTTtZQUNMLE1BQU0sZUFBZSxHQUFHLFdBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsTUFBTSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLGlDQUF3QixDQUFDLElBQUksZUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDckYsT0FBTyxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxDQUFDO1NBQ3ZDO0tBQ0Y7SUFBQyxNQUFNO1FBQ04sT0FBTztZQUNMLE9BQU8sRUFBRSxFQUFFO1lBQ1gsbUJBQW1CLEVBQUUsRUFBRTtTQUN4QixDQUFDO0tBQ0g7QUFDSCxDQUFDO0FBRUQsa0RBQWtEO0FBQ2xELFNBQVMsMEJBQTBCO0lBQ2pDLElBQUk7UUFDRixNQUFNLEdBQUcsR0FBRyxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLE9BQU8sR0FBRyxDQUFDLDBCQUEwQixFQUFFLENBQUM7S0FDekM7SUFBQyxNQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUM7QUFFRCw0Q0FBNEM7QUFDNUMsU0FBUyxnQkFBZ0I7SUFDdkIsSUFBSTtRQUNGLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNuRTtJQUFDLE1BQU07UUFDTixPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQztBQUVELHdEQUF3RDtBQUN4RCxTQUFTLGlCQUFpQjtJQUN4QixJQUFJO1FBQ0YsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQztRQUN4RixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQztRQUMzRixPQUFPLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDO0tBQ3JDO0lBQUMsTUFBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcblxuZXhwb3J0IHR5cGUgRW52U3RhbXBNb2RlID0gJ3NuYXBzaG90JyB8ICdyZWxlYXNlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcChtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQlJBTkNIICR7Z2V0Q3VycmVudEJyYW5jaCgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9DT01NSVRfU0hBICR7Z2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fSEFTSCAke2dldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0xPQ0FMX0NIQU5HRVMgJHtoYXNMb2NhbENoYW5nZXMoKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVVNFUiAke2dldEN1cnJlbnRHaXRVc2VyKCl9YCk7XG4gIGNvbnN0IHt2ZXJzaW9uLCBleHBlcmltZW50YWxWZXJzaW9ufSA9IGdldFNDTVZlcnNpb25zKG1vZGUpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7dmVyc2lvbn1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fRVhQRVJJTUVOVEFMX1ZFUlNJT04gJHtleHBlcmltZW50YWxWZXJzaW9ufWApO1xuICBwcm9jZXNzLmV4aXQoKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIHJldHVybiBnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSB2ZXJzaW9ucyBmb3IgZ2VuZXJhdGVkIHBhY2thZ2VzLlxuICpcbiAqIEluIHNuYXBzaG90IG1vZGUsIHRoZSB2ZXJzaW9uIGlzIGJhc2VkIG9uIHRoZSBtb3N0IHJlY2VudCBzZW12ZXIgdGFnLlxuICogSW4gcmVsZWFzZSBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgYmFzZSBwYWNrYWdlLmpzb24gdmVyc2lvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0U0NNVmVyc2lvbnMobW9kZTogRW52U3RhbXBNb2RlKToge3ZlcnNpb246IHN0cmluZzsgZXhwZXJpbWVudGFsVmVyc2lvbjogc3RyaW5nfSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIGlmIChtb2RlID09PSAnc25hcHNob3QnKSB7XG4gICAgICBjb25zdCBsb2NhbENoYW5nZXMgPSBoYXNMb2NhbENoYW5nZXMoKSA/ICcud2l0aC1sb2NhbC1jaGFuZ2VzJyA6ICcnO1xuICAgICAgY29uc3Qge3N0ZG91dDogcmF3VmVyc2lvbn0gPSBnaXQucnVuKFtcbiAgICAgICAgJ2Rlc2NyaWJlJyxcbiAgICAgICAgJy0tbWF0Y2gnLFxuICAgICAgICAnKlswLTldKi5bMC05XSouWzAtOV0qJyxcbiAgICAgICAgJy0tYWJicmV2PTcnLFxuICAgICAgICAnLS10YWdzJyxcbiAgICAgICAgJ0hFQUQnLFxuICAgICAgXSk7XG4gICAgICBjb25zdCB7dmVyc2lvbn0gPSBuZXcgU2VtVmVyKHJhd1ZlcnNpb24pO1xuICAgICAgY29uc3Qge3ZlcnNpb246IGV4cGVyaW1lbnRhbFZlcnNpb259ID0gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKHZlcnNpb24pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmVyc2lvbjogYCR7dmVyc2lvbi5yZXBsYWNlKC8tKFswLTldKyktZy8sICcrJDEuc2hhLScpfSR7bG9jYWxDaGFuZ2VzfWAsXG4gICAgICAgIGV4cGVyaW1lbnRhbFZlcnNpb246IGAke2V4cGVyaW1lbnRhbFZlcnNpb24ucmVwbGFjZShcbiAgICAgICAgICAvLShbMC05XSspLWcvLFxuICAgICAgICAgICcrJDEuc2hhLScsXG4gICAgICAgICl9JHtsb2NhbENoYW5nZXN9YCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHBhY2thZ2VKc29uUGF0aCA9IGpvaW4oZ2l0LmJhc2VEaXIsICdwYWNrYWdlLmpzb24nKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9ufSA9IG5ldyBTZW1WZXIocmVxdWlyZShwYWNrYWdlSnNvblBhdGgpLnZlcnNpb24pO1xuICAgICAgY29uc3Qge3ZlcnNpb246IGV4cGVyaW1lbnRhbFZlcnNpb259ID0gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKG5ldyBTZW1WZXIodmVyc2lvbikpO1xuICAgICAgcmV0dXJuIHt2ZXJzaW9uLCBleHBlcmltZW50YWxWZXJzaW9ufTtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiAnJyxcbiAgICAgIGV4cGVyaW1lbnRhbFZlcnNpb246ICcnLFxuICAgIH07XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBicmFuY2ggb3IgcmV2aXNpb24gb2YgSEVBRC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICByZXR1cm4gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaCgpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgcmV0dXJuIGdpdC5ydW4oWydzeW1ib2xpYy1yZWYnLCAnLS1zaG9ydCcsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGdpdCB1c2VyIGJhc2VkIG9uIHRoZSBnaXQgY29uZmlnLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEdpdFVzZXIoKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIGxldCB1c2VyTmFtZSA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLm5hbWUnXSkuc3Rkb3V0LnRyaW0oKSB8fCAnVW5rbm93biBVc2VyJztcbiAgICBsZXQgdXNlckVtYWlsID0gZ2l0LnJ1bkdyYWNlZnVsKFsnY29uZmlnJywgJ3VzZXIuZW1haWwnXSkuc3Rkb3V0LnRyaW0oKSB8fCAndW5rbm93bl9lbWFpbCc7XG4gICAgcmV0dXJuIGAke3VzZXJOYW1lfSA8JHt1c2VyRW1haWx9PmA7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuIl19