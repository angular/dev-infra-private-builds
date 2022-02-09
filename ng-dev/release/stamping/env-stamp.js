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
    console.info(`BUILD_SCM_ABBREV_HASH ${getCurrentAbbrevSha(git)}`);
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
/** Get the current abbreviated SHA of HEAD. */
function getCurrentAbbrevSha(git) {
    try {
        return git.run(['rev-parse', '--short', 'HEAD']).stdout.trim();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUMxQixtQ0FBOEI7QUFDOUIsMkRBQXFEO0FBQ3JELDBGQUF3RjtBQUl4Rjs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7SUFDOUMsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JELE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQiwwQkFBMEIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEUsT0FBTyxDQUFDLElBQUksQ0FBQywyQkFBMkIsZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDekQsTUFBTSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLGNBQWMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakUsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBcUIs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TUFBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLFNBQVMsZ0JBQWdCLENBQUMsR0FBYztJQUN0QyxJQUFJO1FBQ0YsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNuRTtJQUFDLE1BQU07UUFDTixPQUFPLEVBQUUsQ0FBQztLQUNYO0FBQ0gsQ0FBQztBQUVELHdEQUF3RDtBQUN4RCxTQUFTLGlCQUFpQixDQUFDLEdBQWM7SUFDdkMsSUFBSTtRQUNGLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksY0FBYyxDQUFDO1FBQ3hGLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksZUFBZSxDQUFDO1FBQzNGLE9BQU8sR0FBRyxRQUFRLEtBQUssU0FBUyxHQUFHLENBQUM7S0FDckM7SUFBQyxNQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7Y3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyfSBmcm9tICcuLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcvZXhwZXJpbWVudGFsLXZlcnNpb25zJztcblxuZXhwb3J0IHR5cGUgRW52U3RhbXBNb2RlID0gJ3NuYXBzaG90JyB8ICdyZWxlYXNlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcChtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0NPTU1JVF9TSEEgJHtnZXRDdXJyZW50U2hhKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50U2hhKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0FCQlJFVl9IQVNIICR7Z2V0Q3VycmVudEFiYnJldlNoYShnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9CUkFOQ0ggJHtnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbihnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcihnaXQpfWApO1xuICBjb25zdCB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBnZXRTQ01WZXJzaW9ucyhnaXQsIG1vZGUpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7dmVyc2lvbn1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fRVhQRVJJTUVOVEFMX1ZFUlNJT04gJHtleHBlcmltZW50YWxWZXJzaW9ufWApO1xuICBwcm9jZXNzLmV4aXQoKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbnMgZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb25zKFxuICBnaXQ6IEdpdENsaWVudCxcbiAgbW9kZTogRW52U3RhbXBNb2RlLFxuKToge3ZlcnNpb246IHN0cmluZzsgZXhwZXJpbWVudGFsVmVyc2lvbjogc3RyaW5nfSB7XG4gIHRyeSB7XG4gICAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICAgIGNvbnN0IGxvY2FsQ2hhbmdlcyA9IGhhc0xvY2FsQ2hhbmdlcyhnaXQpID8gJy53aXRoLWxvY2FsLWNoYW5nZXMnIDogJyc7XG4gICAgICBjb25zdCB7c3Rkb3V0OiByYXdWZXJzaW9ufSA9IGdpdC5ydW4oW1xuICAgICAgICAnZGVzY3JpYmUnLFxuICAgICAgICAnLS1tYXRjaCcsXG4gICAgICAgICcqWzAtOV0qLlswLTldKi5bMC05XSonLFxuICAgICAgICAnLS1hYmJyZXY9NycsXG4gICAgICAgICctLXRhZ3MnLFxuICAgICAgICAnSEVBRCcsXG4gICAgICBdKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9ufSA9IG5ldyBTZW1WZXIocmF3VmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uOiBgJHt2ZXJzaW9uLnJlcGxhY2UoLy0oWzAtOV0rKS1nLywgJyskMS5zaGEtJyl9JHtsb2NhbENoYW5nZXN9YCxcbiAgICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogYCR7ZXhwZXJpbWVudGFsVmVyc2lvbi5yZXBsYWNlKFxuICAgICAgICAgIC8tKFswLTldKyktZy8sXG4gICAgICAgICAgJyskMS5zaGEtJyxcbiAgICAgICAgKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihnaXQuYmFzZURpciwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyZXF1aXJlKHBhY2thZ2VKc29uUGF0aCkudmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIobmV3IFNlbVZlcih2ZXJzaW9uKSk7XG4gICAgICByZXR1cm4ge3ZlcnNpb24sIGV4cGVyaW1lbnRhbFZlcnNpb259O1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICcnLFxuICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogJycsXG4gICAgfTtcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IFNIQSBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudFNoYShnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgYWJicmV2aWF0ZWQgU0hBIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QWJicmV2U2hhKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdpdC5ydW4oWydyZXYtcGFyc2UnLCAnLS1zaG9ydCcsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGJyYW5jaCBvciByZXZpc2lvbiBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaChnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQucnVuKFsnc3ltYm9saWMtcmVmJywgJy0tc2hvcnQnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgbGV0IHVzZXJOYW1lID0gZ2l0LnJ1bkdyYWNlZnVsKFsnY29uZmlnJywgJ3VzZXIubmFtZSddKS5zdGRvdXQudHJpbSgpIHx8ICdVbmtub3duIFVzZXInO1xuICAgIGxldCB1c2VyRW1haWwgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5lbWFpbCddKS5zdGRvdXQudHJpbSgpIHx8ICd1bmtub3duX2VtYWlsJztcbiAgICByZXR1cm4gYCR7dXNlck5hbWV9IDwke3VzZXJFbWFpbH0+YDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG4iXX0=