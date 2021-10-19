"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeYarnVerifyTreeCheck = exports.invokeYarnIntegrityCheck = exports.invokeYarnInstallCommand = exports.invokeReleaseBuildCommand = exports.invokeSetNpmDistCommand = void 0;
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
const spinner_1 = require("../../utils/spinner");
const actions_error_1 = require("./actions-error");
/*
 * ###############################################################
 *
 * This file contains helpers for invoking external `ng-dev` commands. A subset of actions,
 * like building release output or setting aν NPM dist tag for release packages, cannot be
 * performed directly as part of the release tool and need to be delegated to external `ng-dev`
 * commands that exist across arbitrary version branches.
 *
 * In a concrete example: Consider a new patch version is released and that a new release
 * package has been added to the `next` branch. The patch branch will not contain the new
 * release package, so we could not build the release output for it. To work around this, we
 * call the ng-dev build command for the patch version branch and expect it to return a list
 * of built packages that need to be released as part of this release train.
 *
 * ###############################################################
 */
/**
 * Invokes the `ng-dev release set-dist-tag` command in order to set the specified
 * NPM dist tag for all packages in the checked out branch to the given version.
 */
async function invokeSetNpmDistCommand(npmDistTag, version) {
    try {
        // Note: No progress indicator needed as that is the responsibility of the command.
        await (0, child_process_1.spawn)('yarn', [
            '--silent',
            'ng-dev',
            'release',
            'set-dist-tag',
            npmDistTag,
            version.format(),
        ]);
        (0, console_1.info)((0, console_1.green)(`  ✓   Set "${npmDistTag}" NPM dist tag for all packages to v${version}.`));
    }
    catch (e) {
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)(`  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".`));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeSetNpmDistCommand = invokeSetNpmDistCommand;
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
async function invokeReleaseBuildCommand() {
    const spinner = new spinner_1.Spinner('Building release output.');
    try {
        // Since we expect JSON to be printed from the `ng-dev release build` command,
        // we spawn the process in silent mode. We have set up an Ora progress spinner.
        const { stdout } = await (0, child_process_1.spawn)('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], {
            mode: 'silent',
        });
        spinner.complete();
        (0, console_1.info)((0, console_1.green)('  ✓   Built release output for all packages.'));
        // The `ng-dev release build` command prints a JSON array to stdout
        // that represents the built release packages and their output paths.
        return JSON.parse(stdout.trim());
    }
    catch (e) {
        spinner.complete();
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)('  ✘   An error occurred while building the release packages.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeReleaseBuildCommand = invokeReleaseBuildCommand;
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
async function invokeYarnInstallCommand(projectDir) {
    try {
        // Note: No progress indicator needed as that is the responsibility of the command.
        // TODO: Consider using an Ora spinner instead to ensure minimal console output.
        await (0, child_process_1.spawn)('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
        (0, console_1.info)((0, console_1.green)('  ✓   Installed project dependencies.'));
    }
    catch (e) {
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)('  ✘   An error occurred while installing dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnInstallCommand = invokeYarnInstallCommand;
/**
 * Invokes the `yarn check --integrity` command in order to verify up to date dependencies.
 */
async function invokeYarnIntegrityCheck(projectDir) {
    try {
        await (0, child_process_1.spawn)('yarn', ['check', '--integrity'], { cwd: projectDir, mode: 'silent' });
        (0, console_1.info)((0, console_1.green)('  ✓   Confirmed dependencies from package.json match those in yarn.lock.'));
    }
    catch (e) {
        (0, console_1.error)((0, console_1.red)('  ✘   Failed yarn integrity check, your installed dependencies are likely out of'));
        (0, console_1.error)((0, console_1.red)('      date. Please run `yarn install` to update your installed dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnIntegrityCheck = invokeYarnIntegrityCheck;
/**
 * Invokes the `yarn check --verify-tree` command in order to verify up to date dependencies.
 */
async function invokeYarnVerifyTreeCheck(projectDir) {
    try {
        await (0, child_process_1.spawn)('yarn', ['check', '--verify-tree'], { cwd: projectDir, mode: 'silent' });
        (0, console_1.info)((0, console_1.green)('  ✓   Confirmed installed dependencies match those defined in package.json.'));
    }
    catch (e) {
        (0, console_1.error)((0, console_1.red)('  ✘   Failed yarn verify tree check, your installed dependencies are likely out'));
        (0, console_1.error)((0, console_1.red)('      of date. Please run `yarn install` to update your installed dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnVerifyTreeCheck = invokeYarnVerifyTreeCheck;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFnRDtBQUNoRCxpREFBNEQ7QUFDNUQsaURBQTRDO0FBSTVDLG1EQUF3RDtBQUV4RDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsdUJBQXVCLENBQUMsVUFBc0IsRUFBRSxPQUFzQjtJQUMxRixJQUFJO1FBQ0YsbUZBQW1GO1FBQ25GLE1BQU0sSUFBQSxxQkFBSyxFQUFDLE1BQU0sRUFBRTtZQUNsQixVQUFVO1lBQ1YsUUFBUTtZQUNSLFNBQVM7WUFDVCxjQUFjO1lBQ2QsVUFBVTtZQUNWLE9BQU8sQ0FBQyxNQUFNLEVBQUU7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsY0FBYyxVQUFVLHVDQUF1QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDeEY7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsK0RBQStELFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRixNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFqQkQsMERBaUJDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLHlCQUF5QjtJQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUN4RCxJQUFJO1FBQ0YsOEVBQThFO1FBQzlFLCtFQUErRTtRQUMvRSxNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxJQUFBLHFCQUFLLEVB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InNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQge0J1aWx0UGFja2FnZX0gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5cbi8qXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgaGVscGVycyBmb3IgaW52b2tpbmcgZXh0ZXJuYWwgYG5nLWRldmAgY29tbWFuZHMuIEEgc3Vic2V0IG9mIGFjdGlvbnMsXG4gKiBsaWtlIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0IG9yIHNldHRpbmcgYc69IE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcywgY2Fubm90IGJlXG4gKiBwZXJmb3JtZWQgZGlyZWN0bHkgYXMgcGFydCBvZiB0aGUgcmVsZWFzZSB0b29sIGFuZCBuZWVkIHRvIGJlIGRlbGVnYXRlZCB0byBleHRlcm5hbCBgbmctZGV2YFxuICogY29tbWFuZHMgdGhhdCBleGlzdCBhY3Jvc3MgYXJiaXRyYXJ5IHZlcnNpb24gYnJhbmNoZXMuXG4gKlxuICogSW4gYSBjb25jcmV0ZSBleGFtcGxlOiBDb25zaWRlciBhIG5ldyBwYXRjaCB2ZXJzaW9uIGlzIHJlbGVhc2VkIGFuZCB0aGF0IGEgbmV3IHJlbGVhc2VcbiAqIHBhY2thZ2UgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBwYXRjaCBicmFuY2ggd2lsbCBub3QgY29udGFpbiB0aGUgbmV3XG4gKiByZWxlYXNlIHBhY2thZ2UsIHNvIHdlIGNvdWxkIG5vdCBidWlsZCB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIGl0LiBUbyB3b3JrIGFyb3VuZCB0aGlzLCB3ZVxuICogY2FsbCB0aGUgbmctZGV2IGJ1aWxkIGNvbW1hbmQgZm9yIHRoZSBwYXRjaCB2ZXJzaW9uIGJyYW5jaCBhbmQgZXhwZWN0IGl0IHRvIHJldHVybiBhIGxpc3RcbiAqIG9mIGJ1aWx0IHBhY2thZ2VzIHRoYXQgbmVlZCB0byBiZSByZWxlYXNlZCBhcyBwYXJ0IG9mIHRoaXMgcmVsZWFzZSB0cmFpbi5cbiAqXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqL1xuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBzZXQtZGlzdC10YWdgIGNvbW1hbmQgaW4gb3JkZXIgdG8gc2V0IHRoZSBzcGVjaWZpZWRcbiAqIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIGluIHRoZSBjaGVja2VkIG91dCBicmFuY2ggdG8gdGhlIGdpdmVuIHZlcnNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VTZXROcG1EaXN0Q29tbWFuZChucG1EaXN0VGFnOiBOcG1EaXN0VGFnLCB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICBhd2FpdCBzcGF3bigneWFybicsIFtcbiAgICAgICctLXNpbGVudCcsXG4gICAgICAnbmctZGV2JyxcbiAgICAgICdyZWxlYXNlJyxcbiAgICAgICdzZXQtZGlzdC10YWcnLFxuICAgICAgbnBtRGlzdFRhZyxcbiAgICAgIHZlcnNpb24uZm9ybWF0KCksXG4gICAgXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBTZXQgXCIke25wbURpc3RUYWd9XCIgTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke25wbURpc3RUYWd9XCIuYCkpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kIGluIG9yZGVyIHRvIGJ1aWxkIHRoZSByZWxlYXNlXG4gKiBwYWNrYWdlcyBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk6IFByb21pc2U8QnVpbHRQYWNrYWdlW10+IHtcbiAgY29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKCdCdWlsZGluZyByZWxlYXNlIG91dHB1dC4nKTtcbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bigneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sIHtcbiAgICAgIG1vZGU6ICdzaWxlbnQnLFxuICAgIH0pO1xuICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEJ1aWx0IHJlbGVhc2Ugb3V0cHV0IGZvciBhbGwgcGFja2FnZXMuJykpO1xuICAgIC8vIFRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQgcHJpbnRzIGEgSlNPTiBhcnJheSB0byBzdGRvdXRcbiAgICAvLyB0aGF0IHJlcHJlc2VudHMgdGhlIGJ1aWx0IHJlbGVhc2UgcGFja2FnZXMgYW5kIHRoZWlyIG91dHB1dCBwYXRocy5cbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdGRvdXQudHJpbSgpKSBhcyBCdWlsdFBhY2thZ2VbXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgYnVpbGRpbmcgdGhlIHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYHlhcm4gaW5zdGFsbGAgY29tbWFuZCBpbiBvcmRlciB0byBpbnN0YWxsIGRlcGVuZGVuY2llcyBmb3JcbiAqIHRoZSBjb25maWd1cmVkIHByb2plY3Qgd2l0aCB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IHJldmlzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHByb2plY3REaXI6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgdXNpbmcgYW4gT3JhIHNwaW5uZXIgaW5zdGVhZCB0byBlbnN1cmUgbWluaW1hbCBjb25zb2xlIG91dHB1dC5cbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnaW5zdGFsbCcsICctLWZyb3plbi1sb2NrZmlsZScsICctLW5vbi1pbnRlcmFjdGl2ZSddLCB7Y3dkOiBwcm9qZWN0RGlyfSk7XG4gICAgaW5mbyhncmVlbignICDinJMgICBJbnN0YWxsZWQgcHJvamVjdCBkZXBlbmRlbmNpZXMuJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGluc3RhbGxpbmcgZGVwZW5kZW5jaWVzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGNoZWNrIC0taW50ZWdyaXR5YCBjb21tYW5kIGluIG9yZGVyIHRvIHZlcmlmeSB1cCB0byBkYXRlIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnRlZ3JpdHlDaGVjayhwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHJ5IHtcbiAgICBhd2FpdCBzcGF3bigneWFybicsIFsnY2hlY2snLCAnLS1pbnRlZ3JpdHknXSwge2N3ZDogcHJvamVjdERpciwgbW9kZTogJ3NpbGVudCd9KTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIENvbmZpcm1lZCBkZXBlbmRlbmNpZXMgZnJvbSBwYWNrYWdlLmpzb24gbWF0Y2ggdGhvc2UgaW4geWFybi5sb2NrLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKHJlZCgnICDinJggICBGYWlsZWQgeWFybiBpbnRlZ3JpdHkgY2hlY2ssIHlvdXIgaW5zdGFsbGVkIGRlcGVuZGVuY2llcyBhcmUgbGlrZWx5IG91dCBvZicpKTtcbiAgICBlcnJvcihyZWQoJyAgICAgIGRhdGUuIFBsZWFzZSBydW4gYHlhcm4gaW5zdGFsbGAgdG8gdXBkYXRlIHlvdXIgaW5zdGFsbGVkIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgeWFybiBjaGVjayAtLXZlcmlmeS10cmVlYCBjb21tYW5kIGluIG9yZGVyIHRvIHZlcmlmeSB1cCB0byBkYXRlIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5WZXJpZnlUcmVlQ2hlY2socHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIHRyeSB7XG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbJ2NoZWNrJywgJy0tdmVyaWZ5LXRyZWUnXSwge2N3ZDogcHJvamVjdERpciwgbW9kZTogJ3NpbGVudCd9KTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIENvbmZpcm1lZCBpbnN0YWxsZWQgZGVwZW5kZW5jaWVzIG1hdGNoIHRob3NlIGRlZmluZWQgaW4gcGFja2FnZS5qc29uLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKHJlZCgnICDinJggICBGYWlsZWQgeWFybiB2ZXJpZnkgdHJlZSBjaGVjaywgeW91ciBpbnN0YWxsZWQgZGVwZW5kZW5jaWVzIGFyZSBsaWtlbHkgb3V0JykpO1xuICAgIGVycm9yKHJlZCgnICAgICAgb2YgZGF0ZS4gUGxlYXNlIHJ1biBgeWFybiBpbnN0YWxsYCB0byB1cGRhdGUgeW91ciBpbnN0YWxsZWQgZGVwZW5kZW5jaWVzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuIl19