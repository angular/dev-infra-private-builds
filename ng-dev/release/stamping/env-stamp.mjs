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
            const { version: experimentalVersion } = (0, semver_2.createExperimentalSemver)(version);
            return {
                version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
                experimentalVersion: `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
            };
        }
        else {
            const packageJsonPath = (0, path_1.join)(git.baseDir, 'package.json');
            const { version } = new semver_1.SemVer(require(packageJsonPath).version);
            const { version: experimentalVersion } = (0, semver_2.createExperimentalSemver)(new semver_1.SemVer(version));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUMxQixtQ0FBOEI7QUFDOUIsMkRBQXFEO0FBQ3JELCtDQUE0RDtBQUk1RDs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7SUFDOUMsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxJQUFJLENBQUMsb0JBQW9CLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwRSxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxNQUFNLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLG1CQUFtQixFQUFFLENBQUMs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Q0FBQyxHQUFjO0lBQ3ZDLElBQUk7UUFDRixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQztRQUN4RixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQztRQUMzRixPQUFPLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDO0tBQ3JDO0lBQUMsTUFBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcblxuZXhwb3J0IHR5cGUgRW52U3RhbXBNb2RlID0gJ3NuYXBzaG90JyB8ICdyZWxlYXNlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcChtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0NPTU1JVF9TSEEgJHtnZXRDdXJyZW50U2hhKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50U2hhKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0JSQU5DSCAke2dldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0xPQ0FMX0NIQU5HRVMgJHtoYXNMb2NhbENoYW5nZXMoZ2l0KX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVVNFUiAke2dldEN1cnJlbnRHaXRVc2VyKGdpdCl9YCk7XG4gIGNvbnN0IHt2ZXJzaW9uLCBleHBlcmltZW50YWxWZXJzaW9ufSA9IGdldFNDTVZlcnNpb25zKGdpdCwgbW9kZSk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1ZFUlNJT04gJHt2ZXJzaW9ufWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9FWFBFUklNRU5UQUxfVkVSU0lPTiAke2V4cGVyaW1lbnRhbFZlcnNpb259YCk7XG4gIHByb2Nlc3MuZXhpdCgpO1xufVxuXG4vKiogV2hldGhlciB0aGUgcmVwbyBoYXMgbG9jYWwgY2hhbmdlcy4gKi9cbmZ1bmN0aW9uIGhhc0xvY2FsQ2hhbmdlcyhnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSB2ZXJzaW9ucyBmb3IgZ2VuZXJhdGVkIHBhY2thZ2VzLlxuICpcbiAqIEluIHNuYXBzaG90IG1vZGUsIHRoZSB2ZXJzaW9uIGlzIGJhc2VkIG9uIHRoZSBtb3N0IHJlY2VudCBzZW12ZXIgdGFnLlxuICogSW4gcmVsZWFzZSBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgYmFzZSBwYWNrYWdlLmpzb24gdmVyc2lvbi5cbiAqL1xuZnVuY3Rpb24gZ2V0U0NNVmVyc2lvbnMoXG4gIGdpdDogR2l0Q2xpZW50LFxuICBtb2RlOiBFbnZTdGFtcE1vZGUsXG4pOiB7dmVyc2lvbjogc3RyaW5nOyBleHBlcmltZW50YWxWZXJzaW9uOiBzdHJpbmd9IHtcbiAgdHJ5IHtcbiAgICBpZiAobW9kZSA9PT0gJ3NuYXBzaG90Jykge1xuICAgICAgY29uc3QgbG9jYWxDaGFuZ2VzID0gaGFzTG9jYWxDaGFuZ2VzKGdpdCkgPyAnLndpdGgtbG9jYWwtY2hhbmdlcycgOiAnJztcbiAgICAgIGNvbnN0IHtzdGRvdXQ6IHJhd1ZlcnNpb259ID0gZ2l0LnJ1bihbXG4gICAgICAgICdkZXNjcmliZScsXG4gICAgICAgICctLW1hdGNoJyxcbiAgICAgICAgJypbMC05XSouWzAtOV0qLlswLTldKicsXG4gICAgICAgICctLWFiYnJldj03JyxcbiAgICAgICAgJy0tdGFncycsXG4gICAgICAgICdIRUFEJyxcbiAgICAgIF0pO1xuICAgICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyYXdWZXJzaW9uKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBleHBlcmltZW50YWxWZXJzaW9ufSA9IGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcih2ZXJzaW9uKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb246IGAke3ZlcnNpb24ucmVwbGFjZSgvLShbMC05XSspLWcvLCAnKyQxLnNoYS0nKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgICAgICBleHBlcmltZW50YWxWZXJzaW9uOiBgJHtleHBlcmltZW50YWxWZXJzaW9uLnJlcGxhY2UoXG4gICAgICAgICAgLy0oWzAtOV0rKS1nLyxcbiAgICAgICAgICAnKyQxLnNoYS0nLFxuICAgICAgICApfSR7bG9jYWxDaGFuZ2VzfWAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAncGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCB7dmVyc2lvbn0gPSBuZXcgU2VtVmVyKHJlcXVpcmUocGFja2FnZUpzb25QYXRoKS52ZXJzaW9uKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBleHBlcmltZW50YWxWZXJzaW9ufSA9IGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcihuZXcgU2VtVmVyKHZlcnNpb24pKTtcbiAgICAgIHJldHVybiB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn07XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJycsXG4gICAgICBleHBlcmltZW50YWxWZXJzaW9uOiAnJyxcbiAgICB9O1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgU0hBIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50U2hhKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBicmFuY2ggb3IgcmV2aXNpb24gb2YgSEVBRC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2goZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0LnJ1bihbJ3N5bWJvbGljLXJlZicsICctLXNob3J0JywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgZ2l0IHVzZXIgYmFzZWQgb24gdGhlIGdpdCBjb25maWcuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50R2l0VXNlcihnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIGxldCB1c2VyTmFtZSA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLm5hbWUnXSkuc3Rkb3V0LnRyaW0oKSB8fCAnVW5rbm93biBVc2VyJztcbiAgICBsZXQgdXNlckVtYWlsID0gZ2l0LnJ1bkdyYWNlZnVsKFsnY29uZmlnJywgJ3VzZXIuZW1haWwnXSkuc3Rkb3V0LnRyaW0oKSB8fCAndW5rbm93bl9lbWFpbCc7XG4gICAgcmV0dXJuIGAke3VzZXJOYW1lfSA8JHt1c2VyRW1haWx9PmA7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuIl19