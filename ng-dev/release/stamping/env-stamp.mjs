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
const experimental_versions_1 = require("../../release/versioning/experimental-versions");
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
    const git = git_client_1.GitClient.get();
    console.info(`BUILD_SCM_BRANCH ${getCurrentBranch(git)}`);
    console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha(git)}`);
    console.info(`BUILD_SCM_HASH ${getCurrentSha(git)}`);
    console.info(`BUILD_SCM_BRANCH ${getCurrentBranchOrRevision(git)}`);
    console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges(git)}`);
    console.info(`BUILD_SCM_USER ${getCurrentGitUser(git)}`);
    const { version, experimentalVersion } = getSCMVersions(git, mode);
    console.info(`BUILD_SCM_VERSION ${version}`);
    console.info(`BUILD_SCM_EXPERIMENTAL_VERSION ${experimentalVersion}`);
    process.exit();
}
exports.buildEnvStamp = buildEnvStamp;
/** Whether the repo has local changes. */
function hasLocalChanges(git) {
    try {
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
function getSCMVersions(git, mode) {
    try {
        if (mode === 'snapshot') {
            const localChanges = hasLocalChanges(git) ? '.with-local-changes' : '';
            const { stdout: rawVersion } = git.run([
                'describe',
                '--match',
                '*[0-9]*.[0-9]*.[0-9]*',
                '--abbrev=7',
                '--tags',
                'HEAD',
            ]);
            const { version } = new semver_1.SemVer(rawVersion);
            const { version: experimentalVersion } = (0, experimental_versions_1.createExperimentalSemver)(version);
            return {
                version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
                experimentalVersion: `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
            };
        }
        else {
            const packageJsonPath = (0, path_1.join)(git.baseDir, 'package.json');
            const { version } = new semver_1.SemVer(require(packageJsonPath).version);
            const { version: experimentalVersion } = (0, experimental_versions_1.createExperimentalSemver)(new semver_1.SemVer(version));
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
/** Get the current SHA of HEAD. */
function getCurrentSha(git) {
    try {
        return git.run(['rev-parse', 'HEAD']).stdout.trim();
    }
    catch {
        return '';
    }
}
/** Get the current branch or revision of HEAD. */
function getCurrentBranchOrRevision(git) {
    try {
        return git.getCurrentBranchOrRevision();
    }
    catch {
        return '';
    }
}
/** Get the currently checked out branch. */
function getCurrentBranch(git) {
    try {
        return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
    }
    catch {
        return '';
    }
}
/** Get the current git user based on the git config. */
function getCurrentGitUser(git) {
    try {
        let userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
        let userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
        return `${userName} <${userEmail}>`;
    }
    catch {
        return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUMxQixtQ0FBOEI7QUFDOUIsMkRBQXFEO0FBQ3JELDBGQUF3RjtBQUl4Rjs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7SUFDOUMsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxNQUFNLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUN0RSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQVpELHNDQVlDO0FBRUQsMENBQTBDO0FBQzFDLFNBQVMsZUFBZSxDQUFDLEdBQWM7SUFDckMsSUFBSTtRQUNGLE9BQU8sR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUM7S0FDcEM7SUFBQyxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUM7S0FDYjtBQUNILENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsY0FBYyxDQUNyQixHQUFjLEVBQ2QsSUFBa0I7SUFFbEIsSUFBSTtRQUNGLElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUN2QixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDdkUsTUFBTSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDO2dCQUNuQyxVQUFVO2dCQUNWLFNBQVM7Z0JBQ1QsdUJBQXVCO2dCQUN2QixZQUFZO2dCQUNaLFFBQVE7Z0JBQ1IsTUFBTTthQUNQLENBQUMsQ0FBQztZQUNILE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6QyxNQUFNLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLEdBQUcsSUFBQSxnREFBd0IsRUFBQyxPQUFPLENBQUMsQ0FBQztZQUN6RSxPQUFPO2dCQUNMLE9BQU8sRUFBRSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxHQUFHLFlBQVksRUFBRTtnQkFDdkUsbUJBQW1CLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQ2pELGFBQWEsRUFDYixVQUFVLENBQ1gsR0FBRyxZQUFZLEVBQUU7YUFDbkIsQ0FBQztTQUNIO2FBQU07WUFDTCxNQUFNLGVBQWUsR0FBRyxJQUFBLFdBQUksRUFBQyxHQUFHLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBQzFELE1BQU0sRUFBQyxPQUFPLEVBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDL0QsTUFBTSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLElBQUEsZ0RBQXdCLEVBQUMsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNyRixPQUFPLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLENBQUM7U0FDdkM7S0FDRjtJQUFDLE1BQU07UUFDTixPQUFPO1lBQ0wsT0FBTyxFQUFFLEVBQUU7WUFDWCxtQkFBbUIsRUFBRSxFQUFFO1NBQ3hCLENBQUM7S0FDSDtBQUNILENBQUM7QUFFRCxtQ0FBbUM7QUFDbkMsU0FBUyxhQUFhLENBQUMsR0FBYztJQUNuQyxJQUFJO1FBQ0YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3JEO0lBQUMsTUFBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBRUQsa0RBQWtEO0FBQ2xELFNBQVMsMEJBQTBCLENBQUMsR0FBYztJQUNoRCxJQUFJO1FBQ0YsT0FBTyxHQUFHLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztLQUN6QztJQUFDLE1BQU07UUFDTixPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQztBQUVELDRDQUE0QztBQUM1QyxTQUFTLGdCQUFnQixDQUFDLEdBQWM7SUFDdEMsSUFBSTtRQUNGLE9BQU8sR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDbkU7SUFBQyxNQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUM7QUFFRCx3REFBd0Q7QUFDeEQsU0FBUyxpQkFBaUIsQ0FBQyxHQUFjO0lBQ3ZDLElBQUk7UUFDRixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQztRQUN4RixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQztRQUMzRixPQUFPLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDO0tBQ3JDO0lBQUMsTUFBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vcmVsZWFzZS92ZXJzaW9uaW5nL2V4cGVyaW1lbnRhbC12ZXJzaW9ucyc7XG5cbmV4cG9ydCB0eXBlIEVudlN0YW1wTW9kZSA9ICdzbmFwc2hvdCcgfCAncmVsZWFzZSc7XG5cbi8qKlxuICogTG9nIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZXhwZWN0ZWQgYnkgYmF6ZWwgZm9yIHN0YW1waW5nLlxuICpcbiAqIFNlZSB0aGUgc2VjdGlvbiBvbiBzdGFtcGluZyBpbiBkb2NzIC8gQkFaRUwubWRcbiAqXG4gKiBUaGlzIHNjcmlwdCBtdXN0IGJlIGEgTm9kZUpTIHNjcmlwdCBpbiBvcmRlciB0byBiZSBjcm9zcy1wbGF0Zm9ybS5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYmF6ZWxidWlsZC9iYXplbC9pc3N1ZXMvNTk1OFxuICogTm90ZTogZ2l0IG9wZXJhdGlvbnMsIGVzcGVjaWFsbHkgZ2l0IHN0YXR1cywgdGFrZSBhIGxvbmcgdGltZSBpbnNpZGUgbW91bnRlZCBkb2NrZXIgdm9sdW1lc1xuICogaW4gV2luZG93cyBvciBPU1ggaG9zdHMgKGh0dHBzOi8vZ2l0aHViLmNvbS9kb2NrZXIvZm9yLXdpbi9pc3N1ZXMvMTg4KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRW52U3RhbXAobW9kZTogRW52U3RhbXBNb2RlKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQlJBTkNIICR7Z2V0Q3VycmVudEJyYW5jaChnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9DT01NSVRfU0hBICR7Z2V0Q3VycmVudFNoYShnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9IQVNIICR7Z2V0Q3VycmVudFNoYShnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbihnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcihnaXQpfWApO1xuICBjb25zdCB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBnZXRTQ01WZXJzaW9ucyhnaXQsIG1vZGUpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7dmVyc2lvbn1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fRVhQRVJJTUVOVEFMX1ZFUlNJT04gJHtleHBlcmltZW50YWxWZXJzaW9ufWApO1xuICBwcm9jZXNzLmV4aXQoKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbnMgZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb25zKFxuICBnaXQ6IEdpdENsaWVudCxcbiAgbW9kZTogRW52U3RhbXBNb2RlLFxuKToge3ZlcnNpb246IHN0cmluZzsgZXhwZXJpbWVudGFsVmVyc2lvbjogc3RyaW5nfSB7XG4gIHRyeSB7XG4gICAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICAgIGNvbnN0IGxvY2FsQ2hhbmdlcyA9IGhhc0xvY2FsQ2hhbmdlcyhnaXQpID8gJy53aXRoLWxvY2FsLWNoYW5nZXMnIDogJyc7XG4gICAgICBjb25zdCB7c3Rkb3V0OiByYXdWZXJzaW9ufSA9IGdpdC5ydW4oW1xuICAgICAgICAnZGVzY3JpYmUnLFxuICAgICAgICAnLS1tYXRjaCcsXG4gICAgICAgICcqWzAtOV0qLlswLTldKi5bMC05XSonLFxuICAgICAgICAnLS1hYmJyZXY9NycsXG4gICAgICAgICctLXRhZ3MnLFxuICAgICAgICAnSEVBRCcsXG4gICAgICBdKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9ufSA9IG5ldyBTZW1WZXIocmF3VmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uOiBgJHt2ZXJzaW9uLnJlcGxhY2UoLy0oWzAtOV0rKS1nLywgJyskMS5zaGEtJyl9JHtsb2NhbENoYW5nZXN9YCxcbiAgICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogYCR7ZXhwZXJpbWVudGFsVmVyc2lvbi5yZXBsYWNlKFxuICAgICAgICAgIC8tKFswLTldKyktZy8sXG4gICAgICAgICAgJyskMS5zaGEtJyxcbiAgICAgICAgKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihnaXQuYmFzZURpciwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyZXF1aXJlKHBhY2thZ2VKc29uUGF0aCkudmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIobmV3IFNlbVZlcih2ZXJzaW9uKSk7XG4gICAgICByZXR1cm4ge3ZlcnNpb24sIGV4cGVyaW1lbnRhbFZlcnNpb259O1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICcnLFxuICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogJycsXG4gICAgfTtcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IFNIQSBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudFNoYShnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgYnJhbmNoIG9yIHJldmlzaW9uIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbihnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QnJhbmNoKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdpdC5ydW4oWydzeW1ib2xpYy1yZWYnLCAnLS1zaG9ydCcsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGdpdCB1c2VyIGJhc2VkIG9uIHRoZSBnaXQgY29uZmlnLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEdpdFVzZXIoZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICBsZXQgdXNlck5hbWUgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5uYW1lJ10pLnN0ZG91dC50cmltKCkgfHwgJ1Vua25vd24gVXNlcic7XG4gICAgbGV0IHVzZXJFbWFpbCA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLmVtYWlsJ10pLnN0ZG91dC50cmltKCkgfHwgJ3Vua25vd25fZW1haWwnO1xuICAgIHJldHVybiBgJHt1c2VyTmFtZX0gPCR7dXNlckVtYWlsfT5gO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiJdfQ==