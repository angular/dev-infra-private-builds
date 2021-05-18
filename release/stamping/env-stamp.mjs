/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { join } from 'path';
import { GitClient } from '../../utils/git/index';
import { exec as _exec } from '../../utils/shelljs';
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
    console.info(`BUILD_SCM_COMMIT_SHA ${getCurrentSha()}`);
    console.info(`BUILD_SCM_HASH ${getCurrentSha()}`);
    console.info(`BUILD_SCM_LOCAL_CHANGES ${hasLocalChanges()}`);
    console.info(`BUILD_SCM_USER ${getCurrentGitUser()}`);
    console.info(`BUILD_SCM_VERSION ${getSCMVersion(mode)}`);
    process.exit(0);
}
/** Run the exec command and return the stdout as a trimmed string. */
function exec(cmd) {
    return _exec(cmd).trim();
}
/** Whether the repo has local changes. */
function hasLocalChanges() {
    return !!exec(`git status --untracked-files=no --porcelain`);
}
/**
 * Get the version for generated packages.
 *
 * In snapshot mode, the version is based on the most recent semver tag.
 * In release mode, the version is based on the base package.json version.
 */
function getSCMVersion(mode) {
    if (mode === 'release') {
        const git = GitClient.getInstance();
        const packageJsonPath = join(git.baseDir, 'package.json');
        const { version } = require(packageJsonPath);
        return version;
    }
    if (mode === 'snapshot') {
        const version = exec(`git describe --match [0-9]*.[0-9]*.[0-9]* --abbrev=7 --tags HEAD`);
        return `${version.replace(/-([0-9]+)-g/, '+$1.sha-')}${(hasLocalChanges() ? '.with-local-changes' : '')}`;
    }
    return '0.0.0';
}
/** Get the current SHA of HEAD. */
function getCurrentSha() {
    return exec(`git rev-parse HEAD`);
}
/** Get the currently checked out branch. */
function getCurrentBranch() {
    return exec(`git symbolic-ref --short HEAD`);
}
/** Get the current git user based on the git config. */
function getCurrentGitUser() {
    const userName = exec(`git config user.name`);
    const userEmail = exec(`git config user.email`);
    return `${userName} <${userEmail}>`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW52LXN0YW1wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc3RhbXBpbmcvZW52LXN0YW1wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWhELE9BQU8sRUFBQyxJQUFJLElBQUksS0FBSyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFJbEQ7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSxVQUFVLGFBQWEsQ0FBQyxJQUFrQjtJQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLG9CQUFvQixnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2RCxPQUFPLENBQUMsSUFBSSxDQUFDLHdCQUF3QixhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsYUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxJQUFJLENBQUMsMkJBQTJCLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLHFCQUFxQixhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQUVELHNFQUFzRTtBQUN0RSxTQUFTLElBQUksQ0FBQyxHQUFXO0lBQ3ZCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzNCLENBQUM7QUFFRCwwQ0FBMEM7QUFDMUMsU0FBUyxlQUFlO0lBQ3RCLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILFNBQVMsYUFBYSxDQUFDLElBQWtCO0lBQ3ZDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRTtRQUN0QixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDcEMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDMUQsTUFBTSxFQUFDLE9BQU8sRUFBQyxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMzQyxPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUNELElBQUksSUFBSSxLQUFLLFVBQVUsRUFBRTtRQUN2QixNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsa0VBQWtFLENBQUMsQ0FBQztRQUN6RixPQUFPLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEdBQ2hELENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0tBQ3hEO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQUVELG1DQUFtQztBQUNuQyxTQUFTLGFBQWE7SUFDcEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBRUQsNENBQTRDO0FBQzVDLFNBQVMsZ0JBQWdCO0lBQ3ZCLE9BQU8sSUFBSSxDQUFDLCtCQUErQixDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUVELHdEQUF3RDtBQUN4RCxTQUFTLGlCQUFpQjtJQUN4QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUM5QyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUVoRCxPQUFPLEdBQUcsUUFBUSxLQUFLLFNBQVMsR0FBRyxDQUFDO0FBQ3RDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG5pbXBvcnQge2V4ZWMgYXMgX2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG5leHBvcnQgdHlwZSBFbnZTdGFtcE1vZGUgPSAnc25hcHNob3QnfCdyZWxlYXNlJztcblxuLyoqXG4gKiBMb2cgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBleHBlY3RlZCBieSBiYXplbCBmb3Igc3RhbXBpbmcuXG4gKlxuICogU2VlIHRoZSBzZWN0aW9uIG9uIHN0YW1waW5nIGluIGRvY3MgLyBCQVpFTC5tZFxuICpcbiAqIFRoaXMgc2NyaXB0IG11c3QgYmUgYSBOb2RlSlMgc2NyaXB0IGluIG9yZGVyIHRvIGJlIGNyb3NzLXBsYXRmb3JtLlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9iYXplbGJ1aWxkL2JhemVsL2lzc3Vlcy81OTU4XG4gKiBOb3RlOiBnaXQgb3BlcmF0aW9ucywgZXNwZWNpYWxseSBnaXQgc3RhdHVzLCB0YWtlIGEgbG9uZyB0aW1lIGluc2lkZSBtb3VudGVkIGRvY2tlciB2b2x1bWVzXG4gKiBpbiBXaW5kb3dzIG9yIE9TWCBob3N0cyAoaHR0cHM6Ly9naXRodWIuY29tL2RvY2tlci9mb3Itd2luL2lzc3Vlcy8xODgpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYnVpbGRFbnZTdGFtcChtb2RlOiBFbnZTdGFtcE1vZGUpIHtcbiAgY29uc29sZS5pbmZvKGBCVUlMRF9TQ01fQlJBTkNIICR7Z2V0Q3VycmVudEJyYW5jaCgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9DT01NSVRfU0hBICR7Z2V0Q3VycmVudFNoYSgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9IQVNIICR7Z2V0Q3VycmVudFNoYSgpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9MT0NBTF9DSEFOR0VTICR7aGFzTG9jYWxDaGFuZ2VzKCl9YCk7XG4gIGNvbnNvbGUuaW5mbyhgQlVJTERfU0NNX1VTRVIgJHtnZXRDdXJyZW50R2l0VXNlcigpfWApO1xuICBjb25zb2xlLmluZm8oYEJVSUxEX1NDTV9WRVJTSU9OICR7Z2V0U0NNVmVyc2lvbihtb2RlKX1gKTtcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuXG4vKiogUnVuIHRoZSBleGVjIGNvbW1hbmQgYW5kIHJldHVybiB0aGUgc3Rkb3V0IGFzIGEgdHJpbW1lZCBzdHJpbmcuICovXG5mdW5jdGlvbiBleGVjKGNtZDogc3RyaW5nKSB7XG4gIHJldHVybiBfZXhlYyhjbWQpLnRyaW0oKTtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIHJlcG8gaGFzIGxvY2FsIGNoYW5nZXMuICovXG5mdW5jdGlvbiBoYXNMb2NhbENoYW5nZXMoKSB7XG4gIHJldHVybiAhIWV4ZWMoYGdpdCBzdGF0dXMgLS11bnRyYWNrZWQtZmlsZXM9bm8gLS1wb3JjZWxhaW5gKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIHZlcnNpb24gZm9yIGdlbmVyYXRlZCBwYWNrYWdlcy5cbiAqXG4gKiBJbiBzbmFwc2hvdCBtb2RlLCB0aGUgdmVyc2lvbiBpcyBiYXNlZCBvbiB0aGUgbW9zdCByZWNlbnQgc2VtdmVyIHRhZy5cbiAqIEluIHJlbGVhc2UgbW9kZSwgdGhlIHZlcnNpb24gaXMgYmFzZWQgb24gdGhlIGJhc2UgcGFja2FnZS5qc29uIHZlcnNpb24uXG4gKi9cbmZ1bmN0aW9uIGdldFNDTVZlcnNpb24obW9kZTogRW52U3RhbXBNb2RlKSB7XG4gIGlmIChtb2RlID09PSAncmVsZWFzZScpIHtcbiAgICBjb25zdCBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBqb2luKGdpdC5iYXNlRGlyLCAncGFja2FnZS5qc29uJyk7XG4gICAgY29uc3Qge3ZlcnNpb259ID0gcmVxdWlyZShwYWNrYWdlSnNvblBhdGgpO1xuICAgIHJldHVybiB2ZXJzaW9uO1xuICB9XG4gIGlmIChtb2RlID09PSAnc25hcHNob3QnKSB7XG4gICAgY29uc3QgdmVyc2lvbiA9IGV4ZWMoYGdpdCBkZXNjcmliZSAtLW1hdGNoIFswLTldKi5bMC05XSouWzAtOV0qIC0tYWJicmV2PTcgLS10YWdzIEhFQURgKTtcbiAgICByZXR1cm4gYCR7dmVyc2lvbi5yZXBsYWNlKC8tKFswLTldKyktZy8sICcrJDEuc2hhLScpfSR7XG4gICAgICAgIChoYXNMb2NhbENoYW5nZXMoKSA/ICcud2l0aC1sb2NhbC1jaGFuZ2VzJyA6ICcnKX1gO1xuICB9XG4gIHJldHVybiAnMC4wLjAnO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50IFNIQSBvZiBIRUFELiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudFNoYSgpIHtcbiAgcmV0dXJuIGV4ZWMoYGdpdCByZXYtcGFyc2UgSEVBRGApO1xufVxuXG4vKiogR2V0IHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEJyYW5jaCgpIHtcbiAgcmV0dXJuIGV4ZWMoYGdpdCBzeW1ib2xpYy1yZWYgLS1zaG9ydCBIRUFEYCk7XG59XG5cbi8qKiBHZXQgdGhlIGN1cnJlbnQgZ2l0IHVzZXIgYmFzZWQgb24gdGhlIGdpdCBjb25maWcuICovXG5mdW5jdGlvbiBnZXRDdXJyZW50R2l0VXNlcigpIHtcbiAgY29uc3QgdXNlck5hbWUgPSBleGVjKGBnaXQgY29uZmlnIHVzZXIubmFtZWApO1xuICBjb25zdCB1c2VyRW1haWwgPSBleGVjKGBnaXQgY29uZmlnIHVzZXIuZW1haWxgKTtcblxuICByZXR1cm4gYCR7dXNlck5hbWV9IDwke3VzZXJFbWFpbH0+YDtcbn1cbiJdfQ==