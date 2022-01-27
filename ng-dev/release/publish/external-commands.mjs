"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeYarnInstallCommand = exports.invokeReleaseInfoCommand = exports.invokeReleaseBuildCommand = exports.invokeSetNpmDistCommand = void 0;
const child_process_1 = require("../../utils/child-process");
const console_1 = require("../../utils/console");
const spinner_1 = require("../../utils/spinner");
const actions_error_1 = require("./actions-error");
const resolve_yarn_bin_1 = require("../../utils/resolve-yarn-bin");
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
 *
 * Optionally, the NPM dist tag update can be skipped for experimental packages. This
 * is useful when tagging long-term-support packages within NPM.
 */
async function invokeSetNpmDistCommand(projectDir, npmDistTag, version, options = { skipExperimentalPackages: false }) {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await (0, resolve_yarn_bin_1.resolveYarnScriptForProject)(projectDir);
    try {
        // Note: No progress indicator needed as that is the responsibility of the command.
        await (0, child_process_1.spawn)(yarnCommand.binary, [
            ...yarnCommand.args,
            '--silent',
            'ng-dev',
            'release',
            'set-dist-tag',
            npmDistTag,
            version.format(),
            `--skip-experimental-packages=${options.skipExperimentalPackages}`,
        ], { cwd: projectDir });
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
async function invokeReleaseBuildCommand(projectDir) {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await (0, resolve_yarn_bin_1.resolveYarnScriptForProject)(projectDir);
    // Note: We explicitly mention that this can take a few minutes, so that it's obvious
    // to caretakers that it can take longer than just a few seconds.
    const spinner = new spinner_1.Spinner('Building release output. This can take a few minutes.');
    try {
        // Since we expect JSON to be printed from the `ng-dev release build` command,
        // we spawn the process in silent mode. We have set up an Ora progress spinner.
        const { stdout } = await (0, child_process_1.spawn)(yarnCommand.binary, [...yarnCommand.args, '--silent', 'ng-dev', 'release', 'build', '--json'], {
            cwd: projectDir,
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
 * Invokes the `ng-dev release info` command in order to retrieve information
 * about the release for the currently checked-out branch.
 *
 * This is useful to e.g. determine whether a built package is currently
 * denoted as experimental or not.
 */
async function invokeReleaseInfoCommand(projectDir) {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await (0, resolve_yarn_bin_1.resolveYarnScriptForProject)(projectDir);
    try {
        // Note: No progress indicator needed as that is expected to be a fast operation.
        const { stdout } = await (0, child_process_1.spawn)(yarnCommand.binary, [...yarnCommand.args, '--silent', 'ng-dev', 'release', 'info', '--json'], {
            cwd: projectDir,
            mode: 'silent',
        });
        // The `ng-dev release info` command prints a JSON object to stdout.
        return JSON.parse(stdout.trim());
    }
    catch (e) {
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)(`  ✘   An error occurred while retrieving the release information for ` +
            `the currently checked-out branch.`));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeReleaseInfoCommand = invokeReleaseInfoCommand;
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
async function invokeYarnInstallCommand(projectDir) {
    // Note: We cannot use `yarn` directly as command because we might operate in
    // a different publish branch and the current `PATH` will point to the Yarn version
    // that invoked the release tool. More details in the function description.
    const yarnCommand = await (0, resolve_yarn_bin_1.resolveYarnScriptForProject)(projectDir);
    try {
        // Note: No progress indicator needed as that is the responsibility of the command.
        // TODO: Consider using an Ora spinner instead to ensure minimal console output.
        await (0, child_process_1.spawn)(yarnCommand.binary, [...yarnCommand.args, 'install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
        (0, console_1.info)((0, console_1.green)('  ✓   Installed project dependencies.'));
    }
    catch (e) {
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)('  ✘   An error occurred while installing dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnInstallCommand = invokeYarnInstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFnRDtBQUNoRCxpREFBNEQ7QUFDNUQsaURBQTRDO0FBRzVDLG1EQUF3RDtBQUN4RCxtRUFBeUU7QUFJekU7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUg7Ozs7OztHQU1HO0FBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUMzQyxVQUFrQixFQUNsQixVQUFzQixFQUN0QixPQUFzQixFQUN0QixVQUErQyxFQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBQztJQUVoRiw2RUFBNkU7SUFDN0UsbUZBQW1GO0lBQ25GLDJFQUEyRTtJQUMzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOENBQTJCLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFFbEUsSUFBSTtRQUNGLG1GQUFtRjtRQUNuRixNQUFNLElBQUEscUJBQUssRUFDVCxXQUFXLENBQUMsTUFBTSxFQUNsQjtZQUNFLEdBQUcsV0FBVyxDQUFDLElBQUk7WUFDbkIsVUFBVTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsY0FBYztZQUNkLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ2hCLGdDQUFnQyxPQUFPLENBQUMsd0JBQXdCLEVBQUU7U0FDbkUsRUFDRCxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FDbEIsQ0FBQztRQUNGLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLGNBQWMsVUFBVSx1Q0FBdUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3hGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFD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cUJBQUssRUFDVCxXQUFXLENBQUMsTUFBTSxFQUNsQixDQUFDLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUMsRUFDMUUsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQ2xCLENBQUM7UUFDRixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7S0FDdEQ7SUFBQyxPQUFPLENBQUMsRUFBRTtRQUNWLElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQztBQXBCRCw0REFvQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7c3Bhd259IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NwaW5uZXInO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7cmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0fSBmcm9tICcuLi8uLi91dGlscy9yZXNvbHZlLXlhcm4tYmluJztcbmltcG9ydCB7UmVsZWFzZUJ1aWxkSnNvblN0ZG91dH0gZnJvbSAnLi4vYnVpbGQvY2xpJztcbmltcG9ydCB7UmVsZWFzZUluZm9Kc29uU3Rkb3V0fSBmcm9tICcuLi9pbmZvL2NsaSc7XG5cbi8qXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqXG4gKiBUaGlzIGZpbGUgY29udGFpbnMgaGVscGVycyBmb3IgaW52b2tpbmcgZXh0ZXJuYWwgYG5nLWRldmAgY29tbWFuZHMuIEEgc3Vic2V0IG9mIGFjdGlvbnMsXG4gKiBsaWtlIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0IG9yIHNldHRpbmcgYc69IE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcywgY2Fubm90IGJlXG4gKiBwZXJmb3JtZWQgZGlyZWN0bHkgYXMgcGFydCBvZiB0aGUgcmVsZWFzZSB0b29sIGFuZCBuZWVkIHRvIGJlIGRlbGVnYXRlZCB0byBleHRlcm5hbCBgbmctZGV2YFxuICogY29tbWFuZHMgdGhhdCBleGlzdCBhY3Jvc3MgYXJiaXRyYXJ5IHZlcnNpb24gYnJhbmNoZXMuXG4gKlxuICogSW4gYSBjb25jcmV0ZSBleGFtcGxlOiBDb25zaWRlciBhIG5ldyBwYXRjaCB2ZXJzaW9uIGlzIHJlbGVhc2VkIGFuZCB0aGF0IGEgbmV3IHJlbGVhc2VcbiAqIHBhY2thZ2UgaGFzIGJlZW4gYWRkZWQgdG8gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBwYXRjaCBicmFuY2ggd2lsbCBub3QgY29udGFpbiB0aGUgbmV3XG4gKiByZWxlYXNlIHBhY2thZ2UsIHNvIHdlIGNvdWxkIG5vdCBidWlsZCB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIGl0LiBUbyB3b3JrIGFyb3VuZCB0aGlzLCB3ZVxuICogY2FsbCB0aGUgbmctZGV2IGJ1aWxkIGNvbW1hbmQgZm9yIHRoZSBwYXRjaCB2ZXJzaW9uIGJyYW5jaCBhbmQgZXhwZWN0IGl0IHRvIHJldHVybiBhIGxpc3RcbiAqIG9mIGJ1aWx0IHBhY2thZ2VzIHRoYXQgbmVlZCB0byBiZSByZWxlYXNlZCBhcyBwYXJ0IG9mIHRoaXMgcmVsZWFzZSB0cmFpbi5cbiAqXG4gKiAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAqL1xuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBzZXQtZGlzdC10YWdgIGNvbW1hbmQgaW4gb3JkZXIgdG8gc2V0IHRoZSBzcGVjaWZpZWRcbiAqIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIGluIHRoZSBjaGVja2VkIG91dCBicmFuY2ggdG8gdGhlIGdpdmVuIHZlcnNpb24uXG4gKlxuICogT3B0aW9uYWxseSwgdGhlIE5QTSBkaXN0IHRhZyB1cGRhdGUgY2FuIGJlIHNraXBwZWQgZm9yIGV4cGVyaW1lbnRhbCBwYWNrYWdlcy4gVGhpc1xuICogaXMgdXNlZnVsIHdoZW4gdGFnZ2luZyBsb25nLXRlcm0tc3VwcG9ydCBwYWNrYWdlcyB3aXRoaW4gTlBNLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlU2V0TnBtRGlzdENvbW1hbmQoXG4gIHByb2plY3REaXI6IHN0cmluZyxcbiAgbnBtRGlzdFRhZzogTnBtRGlzdFRhZyxcbiAgdmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgb3B0aW9uczoge3NraXBFeHBlcmltZW50YWxQYWNrYWdlczogYm9vbGVhbn0gPSB7c2tpcEV4cGVyaW1lbnRhbFBhY2thZ2VzOiBmYWxzZX0sXG4pIHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFtcbiAgICAgICAgLi4ueWFybkNvbW1hbmQuYXJncyxcbiAgICAgICAgJy0tc2lsZW50JyxcbiAgICAgICAgJ25nLWRldicsXG4gICAgICAgICdyZWxlYXNlJyxcbiAgICAgICAgJ3NldC1kaXN0LXRhZycsXG4gICAgICAgIG5wbURpc3RUYWcsXG4gICAgICAgIHZlcnNpb24uZm9ybWF0KCksXG4gICAgICAgIGAtLXNraXAtZXhwZXJpbWVudGFsLXBhY2thZ2VzPSR7b3B0aW9ucy5za2lwRXhwZXJpbWVudGFsUGFja2FnZXN9YCxcbiAgICAgIF0sXG4gICAgICB7Y3dkOiBwcm9qZWN0RGlyfSxcbiAgICApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IFwiJHtucG1EaXN0VGFnfVwiIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHBhY2thZ2VzIHRvIHYke3ZlcnNpb259LmApKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgZm9yIFwiJHtucG1EaXN0VGFnfVwiLmApKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBpbiBvcmRlciB0byBidWlsZCB0aGUgcmVsZWFzZVxuICogcGFja2FnZXMgZm9yIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgYnJhbmNoLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZChcbiAgcHJvamVjdERpcjogc3RyaW5nLFxuKTogUHJvbWlzZTxSZWxlYXNlQnVpbGRKc29uU3Rkb3V0PiB7XG4gIC8vIE5vdGU6IFdlIGNhbm5vdCB1c2UgYHlhcm5gIGRpcmVjdGx5IGFzIGNvbW1hbmQgYmVjYXVzZSB3ZSBtaWdodCBvcGVyYXRlIGluXG4gIC8vIGEgZGlmZmVyZW50IHB1Ymxpc2ggYnJhbmNoIGFuZCB0aGUgY3VycmVudCBgUEFUSGAgd2lsbCBwb2ludCB0byB0aGUgWWFybiB2ZXJzaW9uXG4gIC8vIHRoYXQgaW52b2tlZCB0aGUgcmVsZWFzZSB0b29sLiBNb3JlIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICBjb25zdCB5YXJuQ29tbWFuZCA9IGF3YWl0IHJlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdChwcm9qZWN0RGlyKTtcbiAgLy8gTm90ZTogV2UgZXhwbGljaXRseSBtZW50aW9uIHRoYXQgdGhpcyBjYW4gdGFrZSBhIGZldyBtaW51dGVzLCBzbyB0aGF0IGl0J3Mgb2J2aW91c1xuICAvLyB0byBjYXJldGFrZXJzIHRoYXQgaXQgY2FuIHRha2UgbG9uZ2VyIHRoYW4ganVzdCBhIGZldyBzZWNvbmRzLlxuICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoJ0J1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LiBUaGlzIGNhbiB0YWtlIGEgZmV3IG1pbnV0ZXMuJyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sXG4gICAgICB7XG4gICAgICAgIGN3ZDogcHJvamVjdERpcixcbiAgICAgICAgbW9kZTogJ3NpbGVudCcsXG4gICAgICB9LFxuICAgICk7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIFJlbGVhc2VCdWlsZEpzb25TdGRvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBpbmZvYCBjb21tYW5kIGluIG9yZGVyIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uXG4gKiBhYm91dCB0aGUgcmVsZWFzZSBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkLW91dCBicmFuY2guXG4gKlxuICogVGhpcyBpcyB1c2VmdWwgdG8gZS5nLiBkZXRlcm1pbmUgd2hldGhlciBhIGJ1aWx0IHBhY2thZ2UgaXMgY3VycmVudGx5XG4gKiBkZW5vdGVkIGFzIGV4cGVyaW1lbnRhbCBvciBub3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlSW5mb0NvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTxSZWxlYXNlSW5mb0pzb25TdGRvdXQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIGV4cGVjdGVkIHRvIGJlIGEgZmFzdCBvcGVyYXRpb24uXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnaW5mbycsICctLWpzb24nXSxcbiAgICAgIHtcbiAgICAgICAgY3dkOiBwcm9qZWN0RGlyLFxuICAgICAgICBtb2RlOiAnc2lsZW50JyxcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLyBUaGUgYG5nLWRldiByZWxlYXNlIGluZm9gIGNvbW1hbmQgcHJpbnRzIGEgSlNPTiBvYmplY3QgdG8gc3Rkb3V0LlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIFJlbGVhc2VJbmZvSnNvblN0ZG91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKFxuICAgICAgcmVkKFxuICAgICAgICBgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSByZXRyaWV2aW5nIHRoZSByZWxlYXNlIGluZm9ybWF0aW9uIGZvciBgICtcbiAgICAgICAgICBgdGhlIGN1cnJlbnRseSBjaGVja2VkLW91dCBicmFuY2guYCxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGluc3RhbGxgIGNvbW1hbmQgaW4gb3JkZXIgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgZm9yXG4gKiB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHdpdGggdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZChwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICAvLyBUT0RPOiBDb25zaWRlciB1c2luZyBhbiBPcmEgc3Bpbm5lciBpbnN0ZWFkIHRvIGVuc3VyZSBtaW5pbWFsIGNvbnNvbGUgb3V0cHV0LlxuICAgIGF3YWl0IHNwYXduKFxuICAgICAgeWFybkNvbW1hbmQuYmluYXJ5LFxuICAgICAgWy4uLnlhcm5Db21tYW5kLmFyZ3MsICdpbnN0YWxsJywgJy0tZnJvemVuLWxvY2tmaWxlJywgJy0tbm9uLWludGVyYWN0aXZlJ10sXG4gICAgICB7Y3dkOiBwcm9qZWN0RGlyfSxcbiAgICApO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==