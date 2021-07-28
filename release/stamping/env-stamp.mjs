/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { join } from 'path';
import { SemVer } from 'semver';
import { GitClient } from '../../utils/git/git-client';
import { createExperimentalSemver } from '../../utils/semver';
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
export function buildEnvStamp(mode) {
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
/** Whether the repo has local changes. */
function hasLocalChanges() {
    try {
        const git = GitClient.get();
        return git.hasUncommittedChanges();
    }
    catch (_a) {
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
        const git = GitClient.get();
        if (mode === 'snapshot') {
            const localChanges = hasLocalChanges() ? '.with-local-changes' : '';
            const { stdout: rawVersion } = git.run(['describe', '--match', '*[0-9]*.[0-9]*.[0-9]*', '--abbrev=7', '--tags', 'HEAD~100']);
            const { version } = new SemVer(rawVersion);
            const { version: experimentalVersion } = createExperimentalSemver(version);
            return {
                version: `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
                experimentalVersion: `${experimentalVersion.replace(/-([0-9]+)-g/, '+$1.sha-')}${localChanges}`,
            };
        }
        else {
            const packageJsonPath = join(git.baseDir, 'package.json');
            const { version } = new SemVer(require(packageJsonPath).version);
            const { version: experimentalVersion } = createExperimentalSemver(new SemVer(version));
            return { version, experimentalVersion };
        }
    }
    catch (_a) {
        return {
            version: '',
            experimentalVersion: '',
        };
    }
}
/** Get the current branch or revision of HEAD. */
function getCurrentBranchOrRevision() {
    try {
        const git = GitClient.get();
        return git.getCurrentBranchOrRevision();
    }
    catch (_a) {
        return '';
    }
}
/** Get the currently checked out branch. */
function getCurrentBranch() {
    try {
        const git = GitClient.get();
        return git.run(['symbolic-ref', '--short', 'HEAD']).stdout.trim();
    }
    catch (_a) {
        return '';
    }
}
/** Get the current git user based on the git config. */
function getCurrentGitUser() {
    try {
        const git = GitClient.get();
        let userName = git.runGraceful(['config', 'user.name']).stdout.trim() || 'Unknown User';
        let userEmail = git.runGraceful(['config', 'user.email']).stdout.trim() || 'unknown_email';
        return `${userName} <${userEmail}>`;
    }
    catch (_a) {
        return '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFDckQsT0FBTyxFQUFDLHdCQUF3QixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFJNUQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUFrQjtJQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QiwwQkFBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyRSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQiwwQkFBMEIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUMvRCxPQUFPLENBQUMsSUFBSSxDQUFDLDJCQUEyQixlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDN0QsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEQsTUFBTSxFQUFDLE9BQU8sRUFBRSxtQkFBbUIsRUFBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0NBQWtDLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUN0RSxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDakIsQ0FBQztBQUVE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LElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQztRQUN4RixJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLGVBQWUsQ0FBQztRQUMzRixPQUFPLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDO0tBQ3JDO0lBQUMsV0FBTTtRQUNOLE9BQU8sRUFBRSxDQUFDO0tBQ1g7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcblxuZXhwb3J0IHR5cGUgRW52U3RhbXBNb2RlID0gJ3NuYXBzaG90J3wncmVsZWFzZSc7XG5cbi8qKlxuICogTG9nIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgZXhwZWN0ZWQgYnkgYmF6ZWwgZm9yIHN0YW1waW5nLlxuICpcbiAqIFNlZSB0aGUgc2VjdGlvbiBvbiBzdGFtcGluZyBpbiBkb2NzIC8gQkFaRUwubWRcbiAqXG4gKiBUaGlzIHNjcmlwdCBtdXN0IGJlIGEgTm9kZUpTIHNjcmlwdCBpbiBvcmRlciB0byBiZSBjcm9zcy1wbGF0Zm9ybS5cbiAqIFNlZSBodHRwczovL2dpdGh1Yi5jb20vYmF6ZWxidWlsZC9iYXplbC9pc3N1ZXMvNTk1OFxuICogTm90ZTogZ2l0IG9wZXJhdGlvbnMsIGVzcGVjaWFsbHkgZ2l0IHN0YXR1cywgdGFrZSBhIGxvbmcgdGltZSBpbnNpZGUgbW91bnRlZCBkb2NrZXIgdm9sdW1lc1xuICogaW4gV2luZG93cyBvciBPU1ggaG9zdHMgKGh0dHBzOi8vZ2l0aHViLmNvbS9kb2NrZXIvZm9yLXdpbi9pc3N1ZXMvMTg4KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJ1aWxkRW52U3RhbXAobW9kZTogRW52U3RhbXBNb2RlKSB7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0JSQU5DSCAke2dldEN1cnJlbnRCcmFuY2goKX1gKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQ09NTUlUX1NIQSAke2dldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0hBU0ggJHtnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcigpfWApO1xuICBjb25zdCB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn0gPSBnZXRTQ01WZXJzaW9ucyhtb2RlKTtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fVkVSU0lPTiAke3ZlcnNpb259YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX0VYUEVSSU1FTlRBTF9WRVJTSU9OICR7ZXhwZXJpbWVudGFsVmVyc2lvbn1gKTtcbiAgcHJvY2Vzcy5leGl0KCk7XG59XG5cbi8qKiBXaGV0aGVyIHRoZSByZXBvIGhhcyBsb2NhbCBjaGFuZ2VzLiAqL1xuZnVuY3Rpb24gaGFzTG9jYWxDaGFuZ2VzKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICByZXR1cm4gZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgdmVyc2lvbnMgZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb25zKG1vZGU6IEVudlN0YW1wTW9kZSk6IHt2ZXJzaW9uOiBzdHJpbmcsIGV4cGVyaW1lbnRhbFZlcnNpb246IHN0cmluZ30ge1xuICB0cnkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICBpZiAobW9kZSA9PT0gJ3NuYXBzaG90Jykge1xuICAgICAgY29uc3QgbG9jYWxDaGFuZ2VzID0gaGFzTG9jYWxDaGFuZ2VzKCkgPyAnLndpdGgtbG9jYWwtY2hhbmdlcycgOiAnJztcbiAgICAgIGNvbnN0IHtzdGRvdXQ6IHJhd1ZlcnNpb259ID0gZ2l0LnJ1bihcbiAgICAgICAgICBbJ2Rlc2NyaWJlJywgJy0tbWF0Y2gnLCAnKlswLTldKi5bMC05XSouWzAtOV0qJywgJy0tYWJicmV2PTcnLCAnLS10YWdzJywgJ0hFQUR+MTAwJ10pO1xuICAgICAgY29uc3Qge3ZlcnNpb259ID0gbmV3IFNlbVZlcihyYXdWZXJzaW9uKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBleHBlcmltZW50YWxWZXJzaW9ufSA9IGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcih2ZXJzaW9uKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb246IGAke3ZlcnNpb24ucmVwbGFjZSgvLShbMC05XSspLWcvLCAnKyQxLnNoYS0nKX0ke2xvY2FsQ2hhbmdlc31gLFxuICAgICAgICBleHBlcmltZW50YWxWZXJzaW9uOlxuICAgICAgICAgICAgYCR7ZXhwZXJpbWVudGFsVmVyc2lvbi5yZXBsYWNlKC8tKFswLTldKyktZy8sICcrJDEuc2hhLScpfSR7bG9jYWxDaGFuZ2VzfWAsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAncGFja2FnZS5qc29uJyk7XG4gICAgICBjb25zdCB7dmVyc2lvbn0gPSBuZXcgU2VtVmVyKHJlcXVpcmUocGFja2FnZUpzb25QYXRoKS52ZXJzaW9uKTtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBleHBlcmltZW50YWxWZXJzaW9ufSA9IGNyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcihuZXcgU2VtVmVyKHZlcnNpb24pKTtcbiAgICAgIHJldHVybiB7dmVyc2lvbiwgZXhwZXJpbWVudGFsVmVyc2lvbn07XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge1xuICAgICAgdmVyc2lvbjogJycsXG4gICAgICBleHBlcmltZW50YWxWZXJzaW9uOiAnJyxcbiAgICB9O1xuICB9XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgYnJhbmNoIG9yIHJldmlzaW9uIG9mIEhFQUQuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gICAgcmV0dXJuIGdpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRCcmFuY2goKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAgIHJldHVybiBnaXQucnVuKFsnc3ltYm9saWMtcmVmJywgJy0tc2hvcnQnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqIEdldCB0aGUgY3VycmVudCBnaXQgdXNlciBiYXNlZCBvbiB0aGUgZ2l0IGNvbmZpZy4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRHaXRVc2VyKCkge1xuICB0cnkge1xuICAgIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgICBsZXQgdXNlck5hbWUgPSBnaXQucnVuR3JhY2VmdWwoWydjb25maWcnLCAndXNlci5uYW1lJ10pLnN0ZG91dC50cmltKCkgfHwgJ1Vua25vd24gVXNlcic7XG4gICAgbGV0IHVzZXJFbWFpbCA9IGdpdC5ydW5HcmFjZWZ1bChbJ2NvbmZpZycsICd1c2VyLmVtYWlsJ10pLnN0ZG91dC50cmltKCkgfHwgJ3Vua25vd25fZW1haWwnO1xuICAgIHJldHVybiBgJHt1c2VyTmFtZX0gPCR7dXNlckVtYWlsfT5gO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cbiJdfQ==