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
    console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentBranchOrRevision(git)}`);
    console.info(`BUILD_SCM_HASH ${getCurrentBranchOrRevision(git)}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILCtCQUEwQjtBQUMxQixtQ0FBOEI7QUFDOUIsMkRBQXFEO0FBQ3JELCtDQUE0RDtBQUk1RDs7Ozs7Ozs7O0dBU0c7QUFDSCxTQUFnQixhQUFhLENBQUMsSUFBa0I7SUFDOUMsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUQsT0FBTyxDQUFDLElBQUksQ0FBQyx3QkFBd0IsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRSxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixlQUFlLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6RCxNQUFNLEVBQUMsT0FBTyxFQUFFLG1CQUFtQixFQUFDLEdBQUcsY0FBYyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNqRSxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUN0RSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQVhELHNDQVdDO0FBRUQsMENB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RyxRQUFRLEtBQUssU0FBUyxHQUFHLENBQUM7S0FDckM7SUFBQyxNQUFNO1FBQ04sT0FBTyxFQUFFLENBQUM7S0FDWDtBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7Y3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyfSBmcm9tICcuLi8uLi91dGlscy9zZW12ZXInO1xuXG5leHBvcnQgdHlwZSBFbnZTdGFtcE1vZGUgPSAnc25hcHNob3QnIHwgJ3JlbGVhc2UnO1xuXG4vKipcbiAqIExvZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzIGV4cGVjdGVkIGJ5IGJhemVsIGZvciBzdGFtcGluZy5cbiAqXG4gKiBTZWUgdGhlIHNlY3Rpb24gb24gc3RhbXBpbmcgaW4gZG9jcyAvIEJBWkVMLm1kXG4gKlxuICogVGhpcyBzY3JpcHQgbXVzdCBiZSBhIE5vZGVKUyBzY3JpcHQgaW4gb3JkZXIgdG8gYmUgY3Jvc3MtcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2JhemVsYnVpbGQvYmF6ZWwvaXNzdWVzLzU5NThcbiAqIE5vdGU6IGdpdCBvcGVyYXRpb25zLCBlc3BlY2lhbGx5IGdpdCBzdGF0dXMsIHRha2UgYSBsb25nIHRpbWUgaW5zaWRlIG1vdW50ZWQgZG9ja2VyIHZvbHVtZXNcbiAqIGluIFdpbmRvd3Mgb3IgT1NYIGhvc3RzIChodHRwczovL2dpdGh1Yi5jb20vZG9ja2VyL2Zvci13aW4vaXNzdWVzLzE4OCkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZEVudlN0YW1wKG1vZGU6IEVudlN0YW1wTW9kZSkge1xuICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0JSQU5DSCAke2dldEN1cnJlbnRCcmFuY2goZ2l0KX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQ09NTUlUX1NIQSAke2dldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbihnaXQpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKGdpdCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcihnaXQpfWApO1xuICBjb25zdCB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBnZXRTQ01WZXJzaW9ucyhnaXQsIG1vZGUpO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7dmVyc2lvbn1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fRVhQRVJJTUVOVEFMX1ZFUlNJT04gJHtleHBlcmltZW50YWxWZXJzaW9ufWApO1xuICBwcm9jZXNzLmV4aXQoKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbnMgZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb25zKFxuICBnaXQ6IEdpdENsaWVudCxcbiAgbW9kZTogRW52U3RhbXBNb2RlLFxuKToge3ZlcnNpb246IHN0cmluZzsgZXhwZXJpbWVudGFsVmVyc2lvbjogc3RyaW5nfSB7XG4gIHRyeSB7XG4gICAgaWYgKG1vZGUgPT09ICdzbmFwc2hvdCcpIHtcbiAgICAgIGNvbnN0IGxvY2FsQ2hhbmdlcyA9IGhhc0xvY2FsQ2hhbmdlcyhnaXQpID8gJy53aXRoLWxvY2FsLWNoYW5nZXMnIDogJyc7XG4gICAgICBjb25zdCB7c3Rkb3V0OiByYXdWZXJzaW9ufSA9IGdpdC5ydW4oW1xuICAgICAgICAnZGVzY3JpYmUnLFxuICAgICAgICAnLS1tYXRjaCcsXG4gICAgICAgICcqWzAtOV0qLlswLTldKi5bMC05XSonLFxuICAgICAgICAnLS1hYmJyZXY9NycsXG4gICAgICAgICctLXRhZ3MnLFxuICAgICAgICAnSEVBRCcsXG4gICAgICBdKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9ufSA9IG5ldyBTZW1WZXIocmF3VmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uOiBgJHt2ZXJzaW9uLnJlcGxhY2UoLy0oWzAtOV0rKS1nLywgJyskMS5zaGEtJyl9JHtsb2NhbENoYW5nZXN9YCxcbiAgICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogYCR7ZXhwZXJpbWVudGFsVmVyc2lvbi5yZXBsYWNlKFxuICAgICAgICAgIC8tKFswLTldKyktZy8sXG4gICAgICAgICAgJyskMS5zaGEtJyxcbiAgICAgICAgKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihnaXQuYmFzZURpciwgJ3BhY2thZ2UuanNvbicpO1xuICAgICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyZXF1aXJlKHBhY2thZ2VKc29uUGF0aCkudmVyc2lvbik7XG4gICAgICBjb25zdCB7dmVyc2lvbjogZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIobmV3IFNlbVZlcih2ZXJzaW9uKSk7XG4gICAgICByZXR1cm4ge3ZlcnNpb24sIGV4cGVyaW1lbnRhbFZlcnNpb259O1xuICAgIH1cbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZlcnNpb246ICcnLFxuICAgICAgZXhwZXJpbWVudGFsVmVyc2lvbjogJycsXG4gICAgfTtcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IGJyYW5jaCBvciByZXZpc2lvbiBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oZ2l0OiBHaXRDbGllbnQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaChnaXQ6IEdpdENsaWVudCkge1xuICB0cnkge1xuICAgIHJldHVybiBnaXQucnVuKFsnc3ltYm9saWMtcmVmJywgJy0tc2hvcnQnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKGdpdDogR2l0Q2xpZW50KSB7XG4gIHRyeSB7XG4gICAgbGV0IHVzZXJOYW1lID0gZ2l0LnJ1bkdyYWNlZnVsKFsnY29uZmlnJywgJ3VzZXIubmFtZSddKS5zdGRvdXQudHJpbSgpIHx8ICdVbmtub3duIFVzZXInO1xuICAgIGxldCB1c2VyRW1haWwgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5lbWFpbCddKS5zdGRvdXQudHJpbSgpIHx8ICd1bmtub3duX2VtYWlsJztcbiAgICByZXR1cm4gYCR7dXNlck5hbWV9IDwke3VzZXJFbWFpbH0+YDtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG4iXX0=