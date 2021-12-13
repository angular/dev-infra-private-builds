"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyNgDevToolIsUpToDate = void 0;
const path = require("path");
const fs = require("fs");
const lockfile_1 = require("@yarnpkg/lockfile");
const constants_1 = require("./constants");
const console_1 = require("./console");
/**
 * Verifies that the `ng-dev` tool is up-to-date in the workspace. The check will compare
 * the local version of the tool against the requested version in the workspace lock file.
 *
 * This check is helpful ensuring that the caretaker does not accidentally run with an older
 * local version of `ng-dev` due to not running `yarn` after checking out new revisions.
 *
 * @returns a boolean indicating success or failure.
 */
async function verifyNgDevToolIsUpToDate(workspacePath) {
    // The placeholder will be replaced by the `pkg_npm` substitutions.
    const localVersion = `0.0.0-31d2265e034fb4208d57de565995a3027a6cf416`;
    const workspacePackageJsonFile = path.join(workspacePath, constants_1.workspaceRelativePackageJsonPath);
    const workspaceDirLockFile = path.join(workspacePath, constants_1.workspaceRelativeYarnLockFilePath);
    try {
        const lockFileContent = fs.readFileSync(workspaceDirLockFile, 'utf8');
        const packageJson = JSON.parse(fs.readFileSync(workspacePackageJsonFile, 'utf8'));
        const lockFile = (0, lockfile_1.parse)(lockFileContent);
        if (lockFile.type !== 'success') {
            throw Error('Unable to parse workspace lock file. Please ensure the file is valid.');
        }
        // If we are operating in the actual dev-infra repo, always return `true`.
        if (packageJson.name === constants_1.ngDevNpmPackageName) {
            return true;
        }
        const lockFileObject = lockFile.object;
        const devInfraPkgVersion = packageJson?.dependencies?.[constants_1.ngDevNpmPackageName] ??
            packageJson?.devDependencies?.[constants_1.ngDevNpmPackageName] ??
            packageJson?.optionalDependencies?.[constants_1.ngDevNpmPackageName];
        const expectedVersion = lockFileObject[`${constants_1.ngDevNpmPackageName}@${devInfraPkgVersion}`].version;
        if (localVersion !== expectedVersion) {
            (0, console_1.error)((0, console_1.red)('  ✘   Your locally installed version of the `ng-dev` tool is outdated and not'));
            (0, console_1.error)((0, console_1.red)('      matching with the version in the `package.json` file.'));
            (0, console_1.error)((0, console_1.red)('      Re-install the dependencies to ensure you are using the correct version.'));
            return false;
        }
        return true;
    }
    catch (e) {
        (0, console_1.error)(e);
        return false;
    }
}
exports.verifyNgDevToolIsUpToDate = verifyNgDevToolIsUpToDate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1jaGVjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi91dGlscy92ZXJzaW9uLWNoZWNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDZCQUE2QjtBQUM3Qix5QkFBeUI7QUFDekIsZ0RBQTZFO0FBQzdFLDJDQUlxQjtBQUNyQix1Q0FBcUM7QUFFckM7Ozs7Ozs7O0dBUUc7QUFDSSxLQUFLLFVBQVUseUJBQXlCLENBQUMsYUFBcUI7SUFDbkUsbUVBQW1FO0lBQ25FLE1BQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDO0lBQzVDLE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsNENBQWdDLENBQUMsQ0FBQztJQUM1RixNQUFNLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLDZDQUFpQyxDQUFDLENBQUM7SUFFekYsSUFBSTtRQUNGLE1BQU0sZUFBZSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsb0JBQW9CLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLHdCQUF3QixFQUFFLE1BQU0sQ0FBQyxDQUFRLENBQUM7UUFDekYsTUFBTSxRQUFRLEdBQUcsSUFBQSxnQkFBaUIsRUFBQyxlQUFlLENBQUMsQ0FBQztRQUVwRCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQy9CLE1BQU0sS0FBSyxDQUFDLHVFQUF1RSxDQUFDLENBQUM7U0FDdEY7UUFFRCwwRUFBMEU7UUFDMUUsSUFBSSxXQUFXLENBQUMsSUFBSSxLQUFLLCtCQUFtQixFQUFFO1lBQzVDLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsTUFBd0IsQ0FBQztRQUN6RCxNQUFNLGtCQUFrQixHQUN0QixXQUFXLEVBQUUsWUFBWSxFQUFFLENBQUMsK0JBQW1CLENBQUM7WUFDaEQsV0FBVyxFQUFFLGVBQWUsRUFBRSxDQUFDLCtCQUFtQixDQUFDO1lBQ25ELFdBQVcsRUFBRSxvQkFBb0IsRUFBRSxDQUFDLCtCQUFtQixDQUFDLENBQUM7UUFDM0QsTUFBTSxlQUFlLEdBQUcsY0FBYyxDQUFDLEdBQUcsK0JBQW1CLElBQUksa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUUvRixJQUFJLFlBQVksS0FBSyxlQUFlLEVBQUU7WUFDcEMsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsK0VBQStFLENBQUMsQ0FBQyxDQUFDO1lBQzVGLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDZEQUE2RCxDQUFDLENBQUMsQ0FBQztZQUMxRSxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyxnRkFBZ0YsQ0FBQyxDQUFDLENBQUM7WUFDN0YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUNELE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsT0FBTyxLQUFLLENBQUM7S0FDZDtBQUNILENBQUM7QUF0Q0QsOERBc0NDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcyc7XG5pbXBvcnQge0xvY2tGaWxlT2JqZWN0LCBwYXJzZSBhcyBwYXJzZVlhcm5Mb2NrZmlsZX0gZnJvbSAnQHlhcm5wa2cvbG9ja2ZpbGUnO1xuaW1wb3J0IHtcbiAgbmdEZXZOcG1QYWNrYWdlTmFtZSxcbiAgd29ya3NwYWNlUmVsYXRpdmVQYWNrYWdlSnNvblBhdGgsXG4gIHdvcmtzcGFjZVJlbGF0aXZlWWFybkxvY2tGaWxlUGF0aCxcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtlcnJvciwgcmVkfSBmcm9tICcuL2NvbnNvbGUnO1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBuZy1kZXZgIHRvb2wgaXMgdXAtdG8tZGF0ZSBpbiB0aGUgd29ya3NwYWNlLiBUaGUgY2hlY2sgd2lsbCBjb21wYXJlXG4gKiB0aGUgbG9jYWwgdmVyc2lvbiBvZiB0aGUgdG9vbCBhZ2FpbnN0IHRoZSByZXF1ZXN0ZWQgdmVyc2lvbiBpbiB0aGUgd29ya3NwYWNlIGxvY2sgZmlsZS5cbiAqXG4gKiBUaGlzIGNoZWNrIGlzIGhlbHBmdWwgZW5zdXJpbmcgdGhhdCB0aGUgY2FyZXRha2VyIGRvZXMgbm90IGFjY2lkZW50YWxseSBydW4gd2l0aCBhbiBvbGRlclxuICogbG9jYWwgdmVyc2lvbiBvZiBgbmctZGV2YCBkdWUgdG8gbm90IHJ1bm5pbmcgYHlhcm5gIGFmdGVyIGNoZWNraW5nIG91dCBuZXcgcmV2aXNpb25zLlxuICpcbiAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHZlcmlmeU5nRGV2VG9vbElzVXBUb0RhdGUod29ya3NwYWNlUGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIC8vIFRoZSBwbGFjZWhvbGRlciB3aWxsIGJlIHJlcGxhY2VkIGJ5IHRoZSBgcGtnX25wbWAgc3Vic3RpdHV0aW9ucy5cbiAgY29uc3QgbG9jYWxWZXJzaW9uID0gYDAuMC4wLXtTQ01fSEVBRF9TSEF9YDtcbiAgY29uc3Qgd29ya3NwYWNlUGFja2FnZUpzb25GaWxlID0gcGF0aC5qb2luKHdvcmtzcGFjZVBhdGgsIHdvcmtzcGFjZVJlbGF0aXZlUGFja2FnZUpzb25QYXRoKTtcbiAgY29uc3Qgd29ya3NwYWNlRGlyTG9ja0ZpbGUgPSBwYXRoLmpvaW4od29ya3NwYWNlUGF0aCwgd29ya3NwYWNlUmVsYXRpdmVZYXJuTG9ja0ZpbGVQYXRoKTtcblxuICB0cnkge1xuICAgIGNvbnN0IGxvY2tGaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyh3b3Jrc3BhY2VEaXJMb2NrRmlsZSwgJ3V0ZjgnKTtcbiAgICBjb25zdCBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHdvcmtzcGFjZVBhY2thZ2VKc29uRmlsZSwgJ3V0ZjgnKSkgYXMgYW55O1xuICAgIGNvbnN0IGxvY2tGaWxlID0gcGFyc2VZYXJuTG9ja2ZpbGUobG9ja0ZpbGVDb250ZW50KTtcblxuICAgIGlmIChsb2NrRmlsZS50eXBlICE9PSAnc3VjY2VzcycpIHtcbiAgICAgIHRocm93IEVycm9yKCdVbmFibGUgdG8gcGFyc2Ugd29ya3NwYWNlIGxvY2sgZmlsZS4gUGxlYXNlIGVuc3VyZSB0aGUgZmlsZSBpcyB2YWxpZC4nKTtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBhcmUgb3BlcmF0aW5nIGluIHRoZSBhY3R1YWwgZGV2LWluZnJhIHJlcG8sIGFsd2F5cyByZXR1cm4gYHRydWVgLlxuICAgIGlmIChwYWNrYWdlSnNvbi5uYW1lID09PSBuZ0Rldk5wbVBhY2thZ2VOYW1lKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBsb2NrRmlsZU9iamVjdCA9IGxvY2tGaWxlLm9iamVjdCBhcyBMb2NrRmlsZU9iamVjdDtcbiAgICBjb25zdCBkZXZJbmZyYVBrZ1ZlcnNpb24gPVxuICAgICAgcGFja2FnZUpzb24/LmRlcGVuZGVuY2llcz8uW25nRGV2TnBtUGFja2FnZU5hbWVdID8/XG4gICAgICBwYWNrYWdlSnNvbj8uZGV2RGVwZW5kZW5jaWVzPy5bbmdEZXZOcG1QYWNrYWdlTmFtZV0gPz9cbiAgICAgIHBhY2thZ2VKc29uPy5vcHRpb25hbERlcGVuZGVuY2llcz8uW25nRGV2TnBtUGFja2FnZU5hbWVdO1xuICAgIGNvbnN0IGV4cGVjdGVkVmVyc2lvbiA9IGxvY2tGaWxlT2JqZWN0W2Ake25nRGV2TnBtUGFja2FnZU5hbWV9QCR7ZGV2SW5mcmFQa2dWZXJzaW9ufWBdLnZlcnNpb247XG5cbiAgICBpZiAobG9jYWxWZXJzaW9uICE9PSBleHBlY3RlZFZlcnNpb24pIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBZb3VyIGxvY2FsbHkgaW5zdGFsbGVkIHZlcnNpb24gb2YgdGhlIGBuZy1kZXZgIHRvb2wgaXMgb3V0ZGF0ZWQgYW5kIG5vdCcpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgbWF0Y2hpbmcgd2l0aCB0aGUgdmVyc2lvbiBpbiB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4nKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFJlLWluc3RhbGwgdGhlIGRlcGVuZGVuY2llcyB0byBlbnN1cmUgeW91IGFyZSB1c2luZyB0aGUgY29ycmVjdCB2ZXJzaW9uLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==