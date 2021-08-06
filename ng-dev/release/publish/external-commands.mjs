"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeYarnInstallCommand = exports.invokeReleaseBuildCommand = exports.invokeSetNpmDistCommand = void 0;
const ora = require("ora");
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
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
        await child_process_1.spawn('yarn', [
            '--silent',
            'ng-dev',
            'release',
            'set-dist-tag',
            npmDistTag,
            version.format(),
        ]);
        console_1.info(console_1.green(`  ✓   Set "${npmDistTag}" NPM dist tag for all packages to v${version}.`));
    }
    catch (e) {
        console_1.error(e);
        console_1.error(console_1.red(`  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".`));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeSetNpmDistCommand = invokeSetNpmDistCommand;
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
async function invokeReleaseBuildCommand() {
    const spinner = ora.call(undefined).start('Building release output.');
    try {
        // Since we expect JSON to be printed from the `ng-dev release build` command,
        // we spawn the process in silent mode. We have set up an Ora progress spinner.
        const { stdout } = await child_process_1.spawn('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], {
            mode: 'silent',
        });
        spinner.stop();
        console_1.info(console_1.green('  ✓   Built release output for all packages.'));
        // The `ng-dev release build` command prints a JSON array to stdout
        // that represents the built release packages and their output paths.
        return JSON.parse(stdout.trim());
    }
    catch (e) {
        spinner.stop();
        console_1.error(e);
        console_1.error(console_1.red('  ✘   An error occurred while building the release packages.'));
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
        await child_process_1.spawn('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
        console_1.info(console_1.green('  ✓   Installed project dependencies.'));
    }
    catch (e) {
        console_1.error(e);
        console_1.error(console_1.red('  ✘   An error occurred while installing dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnInstallCommand = invokeYarnInstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUEyQjtBQUczQiw2REFBZ0Q7QUFDaEQsaURBQTREO0FBSTVELG1EQUF3RDtBQUV4RDs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFFSDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsdUJBQXVCLENBQUMsVUFBc0IsRUFBRSxPQUFzQjtJQUMxRixJQUFJO1FBQ0YsbUZBQW1GO1FBQ25GLE1BQU0scUJBQUssQ0FBQyxNQUFNLEVBQUU7WUFDbEIsVUFBVTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsY0FBYztZQUNkLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxFQUFFO1NBQ2pCLENBQUMsQ0FBQztRQUNILGNBQUksQ0FBQyxlQUFLLENBQUMsY0FBYyxVQUFVLHVDQUF1QyxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUM7S0FDeEY7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLGVBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULGVBQUssQ0FBQyxhQUFHLENBQUMsK0RBQStELFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMxRixNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFqQkQsMERBaUJDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLHlCQUF5QjtJQUM3QyxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBQ3RFLElBQUk7UUFDRiw4RUFBOEU7UUFDOUUsK0VBQStFO1FBQy9FLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxNQUFNLHFCQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFO1lBQ3pGLElBQUksRUFBRSxRQUFRO1NBQ2YsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2YsY0FBSSxDQUFDLGVBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7UUFDNUQsbUVBQW1FO1FBQ25FLHFFQUFxRTtRQUNyRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFtQixDQUFDO0tBQ3BEO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLDhEQUE4RCxDQUFDLENBQUMsQ0FBQztRQUMzRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFuQkQsOERBbUJDO0FBRUQ7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLHdCQUF3QixDQUFDLFVBQWtCO0lBQy9ELElBQUk7UUFDRixtRkFBbUY7UUFDbkYsZ0ZBQWdGO1FBQ2hGLE1BQU0scUJBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQzlGLGNBQUksQ0FBQyxlQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO0tBQ3REO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFYRCw0REFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2V9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge05wbURpc3RUYWd9IGZyb20gJy4uL3ZlcnNpb25pbmcnO1xuXG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuXG4vKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGhlbHBlcnMgZm9yIGludm9raW5nIGV4dGVybmFsIGBuZy1kZXZgIGNvbW1hbmRzLiBBIHN1YnNldCBvZiBhY3Rpb25zLFxuICogbGlrZSBidWlsZGluZyByZWxlYXNlIG91dHB1dCBvciBzZXR0aW5nIGHOvSBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMsIGNhbm5vdCBiZVxuICogcGVyZm9ybWVkIGRpcmVjdGx5IGFzIHBhcnQgb2YgdGhlIHJlbGVhc2UgdG9vbCBhbmQgbmVlZCB0byBiZSBkZWxlZ2F0ZWQgdG8gZXh0ZXJuYWwgYG5nLWRldmBcbiAqIGNvbW1hbmRzIHRoYXQgZXhpc3QgYWNyb3NzIGFyYml0cmFyeSB2ZXJzaW9uIGJyYW5jaGVzLlxuICpcbiAqIEluIGEgY29uY3JldGUgZXhhbXBsZTogQ29uc2lkZXIgYSBuZXcgcGF0Y2ggdmVyc2lvbiBpcyByZWxlYXNlZCBhbmQgdGhhdCBhIG5ldyByZWxlYXNlXG4gKiBwYWNrYWdlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgcGF0Y2ggYnJhbmNoIHdpbGwgbm90IGNvbnRhaW4gdGhlIG5ld1xuICogcmVsZWFzZSBwYWNrYWdlLCBzbyB3ZSBjb3VsZCBub3QgYnVpbGQgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciBpdC4gVG8gd29yayBhcm91bmQgdGhpcywgd2VcbiAqIGNhbGwgdGhlIG5nLWRldiBidWlsZCBjb21tYW5kIGZvciB0aGUgcGF0Y2ggdmVyc2lvbiBicmFuY2ggYW5kIGV4cGVjdCBpdCB0byByZXR1cm4gYSBsaXN0XG4gKiBvZiBidWlsdCBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgcmVsZWFzZWQgYXMgcGFydCBvZiB0aGlzIHJlbGVhc2UgdHJhaW4uXG4gKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKi9cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2Ugc2V0LWRpc3QtdGFnYCBjb21tYW5kIGluIG9yZGVyIHRvIHNldCB0aGUgc3BlY2lmaWVkXG4gKiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyBpbiB0aGUgY2hlY2tlZCBvdXQgYnJhbmNoIHRvIHRoZSBnaXZlbiB2ZXJzaW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlU2V0TnBtRGlzdENvbW1hbmQobnBtRGlzdFRhZzogTnBtRGlzdFRhZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbXG4gICAgICAnLS1zaWxlbnQnLFxuICAgICAgJ25nLWRldicsXG4gICAgICAncmVsZWFzZScsXG4gICAgICAnc2V0LWRpc3QtdGFnJyxcbiAgICAgIG5wbURpc3RUYWcsXG4gICAgICB2ZXJzaW9uLmZvcm1hdCgpLFxuICAgIF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IFwiJHtucG1EaXN0VGFnfVwiIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIHRvIHYke3ZlcnNpb259LmApKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgZm9yIFwiJHtucG1EaXN0VGFnfVwiLmApKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBpbiBvcmRlciB0byBidWlsZCB0aGUgcmVsZWFzZVxuICogcGFja2FnZXMgZm9yIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpOiBQcm9taXNlPEJ1aWx0UGFja2FnZVtdPiB7XG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KCdCdWlsZGluZyByZWxlYXNlIG91dHB1dC4nKTtcbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bigneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sIHtcbiAgICAgIG1vZGU6ICdzaWxlbnQnLFxuICAgIH0pO1xuICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIEJ1aWx0UGFja2FnZVtdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGluc3RhbGxgIGNvbW1hbmQgaW4gb3JkZXIgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgZm9yXG4gKiB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHdpdGggdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZChwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBOb3RlOiBObyBwcm9ncmVzcyBpbmRpY2F0b3IgbmVlZGVkIGFzIHRoYXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb21tYW5kLlxuICAgIC8vIFRPRE86IENvbnNpZGVyIHVzaW5nIGFuIE9yYSBzcGlubmVyIGluc3RlYWQgdG8gZW5zdXJlIG1pbmltYWwgY29uc29sZSBvdXRwdXQuXG4gICAgYXdhaXQgc3Bhd24oJ3lhcm4nLCBbJ2luc3RhbGwnLCAnLS1mcm96ZW4tbG9ja2ZpbGUnLCAnLS1ub24taW50ZXJhY3RpdmUnXSwge2N3ZDogcHJvamVjdERpcn0pO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==