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
 */
async function invokeSetNpmDistCommand(projectDir, npmDistTag, version) {
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
    const spinner = new spinner_1.Spinner('Building release output.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFnRDtBQUNoRCxpREFBNEQ7QUFDNUQsaURBQTRDO0FBSTVDLG1EQUF3RDtBQUN4RCxtRUFBMEY7QUFFMUY7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUg7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUMzQyxVQUFrQixFQUNsQixVQUFzQixFQUN0QixPQUFzQjtJQUV0Qiw2RUFBNkU7SUFDN0UsbUZBQW1GO0lBQ25GLDJFQUEyRTtJQUMzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOENBQTJCLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFFbEUsSUFBSTtRQUNGLG1GQUFtRjtRQUNuRixNQUFNLElBQUEscUJBQUssRUFDVCxXQUFXLENBQUMsTUFBTSxFQUNsQjtZQUNFLEdBQUcsV0FBVyxDQUFDLElBQUk7WUFDbkIsVUFBVTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsY0FBYztZQUNkLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxFQUFFO1NBQ2pCLEVBQ0QsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQ2xCLENBQUM7UUFDRixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyxjQUFjLFVBQVUsdUNBQXVDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN4RjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBQSxlQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQywrREFBK0QsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzFGLE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQztBQS9CRCwwREErQkM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUseUJBQXlCLENBQUMsVUFBa0I7SUFDaEUsNkVBQTZFO0lBQzdFLG1GQUFtRjtJQUNuRiwyRUFBMkU7SUFDM0UsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLDhDQUEyQixFQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0lBRXhELElBQUk7UUFDRiw4RUFBOEU7UUFDOUUsK0VBQStFO1FBQy9FLE1BQU0sRUFBQyxNQUFNLEVBQUMsR0FBRyxNQUFNLElBQUEscUJBQUssRUFDMUIsV0FBVyxDQUFDLE1BQU0sRUFDbEIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUN6RTtZQUNFLEdBQUcsRUFBRSxVQUFVO1lBQ2YsSUFBSSxFQUFFLFFBQVE7U0FDZixDQUNGLENBQUM7UUFDRixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDbkIsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1FBQzVELG1FQUFtRTtRQUNuRSxxRUFBcUU7UUFDckUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBbUIsQ0FBQztLQUNwRDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ25CLElBQUEsZUFBSyxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ1QsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsOERBQThELENBQUMsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDO0tBQ3JDO0FBQ0gsQ0FBQztBQTdCRCw4REE2QkM7QUFFRDs7O0dBR0c7QUFDSSxLQUFLLFVBQVUsd0JBQXdCLENBQUMsVUFBa0I7SUFDL0QsNkVBQTZFO0lBQzdFLG1GQUFtRjtJQUNuRiwyRUFBMkU7SUFDM0UsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLDhDQUEyQixFQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRWxFLElBQUk7UUFDRixtRkFBbUY7UUFDbkYsZ0ZBQWdGO1FBQ2hGLE1BQU0sSUFBQSxxQkFBSyxFQUNULFdBQVcsQ0FBQyxNQUFNLEVBQ2xCLENBQUMsR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUMxRSxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FDbEIsQ0FBQztRQUNGLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLHVDQUF1QyxDQUFDLENBQUMsQ0FBQztLQUN0RDtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBQSxlQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyx3REFBd0QsQ0FBQyxDQUFDLENBQUM7UUFDckUsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7S0FDckM7QUFDSCxDQUFDO0FBcEJELDREQW9CQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQge0J1aWx0UGFja2FnZX0gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge3Jlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdCwgWWFybkNvbW1hbmRJbmZvfSBmcm9tICcuLi8uLi91dGlscy9yZXNvbHZlLXlhcm4tYmluJztcblxuLypcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICpcbiAqIFRoaXMgZmlsZSBjb250YWlucyBoZWxwZXJzIGZvciBpbnZva2luZyBleHRlcm5hbCBgbmctZGV2YCBjb21tYW5kcy4gQSBzdWJzZXQgb2YgYWN0aW9ucyxcbiAqIGxpa2UgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQgb3Igc2V0dGluZyBhzr0gTlBNIGRpc3QgdGFnIGZvciByZWxlYXNlIHBhY2thZ2VzLCBjYW5ub3QgYmVcbiAqIHBlcmZvcm1lZCBkaXJlY3RseSBhcyBwYXJ0IG9mIHRoZSByZWxlYXNlIHRvb2wgYW5kIG5lZWQgdG8gYmUgZGVsZWdhdGVkIHRvIGV4dGVybmFsIGBuZy1kZXZgXG4gKiBjb21tYW5kcyB0aGF0IGV4aXN0IGFjcm9zcyBhcmJpdHJhcnkgdmVyc2lvbiBicmFuY2hlcy5cbiAqXG4gKiBJbiBhIGNvbmNyZXRlIGV4YW1wbGU6IENvbnNpZGVyIGEgbmV3IHBhdGNoIHZlcnNpb24gaXMgcmVsZWFzZWQgYW5kIHRoYXQgYSBuZXcgcmVsZWFzZVxuICogcGFja2FnZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIHBhdGNoIGJyYW5jaCB3aWxsIG5vdCBjb250YWluIHRoZSBuZXdcbiAqIHJlbGVhc2UgcGFja2FnZSwgc28gd2UgY291bGQgbm90IGJ1aWxkIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgaXQuIFRvIHdvcmsgYXJvdW5kIHRoaXMsIHdlXG4gKiBjYWxsIHRoZSBuZy1kZXYgYnVpbGQgY29tbWFuZCBmb3IgdGhlIHBhdGNoIHZlcnNpb24gYnJhbmNoIGFuZCBleHBlY3QgaXQgdG8gcmV0dXJuIGEgbGlzdFxuICogb2YgYnVpbHQgcGFja2FnZXMgdGhhdCBuZWVkIHRvIGJlIHJlbGVhc2VkIGFzIHBhcnQgb2YgdGhpcyByZWxlYXNlIHRyYWluLlxuICpcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICovXG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIHNldC1kaXN0LXRhZ2AgY29tbWFuZCBpbiBvcmRlciB0byBzZXQgdGhlIHNwZWNpZmllZFxuICogTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgaW4gdGhlIGNoZWNrZWQgb3V0IGJyYW5jaCB0byB0aGUgZ2l2ZW4gdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVNldE5wbURpc3RDb21tYW5kKFxuICBwcm9qZWN0RGlyOiBzdHJpbmcsXG4gIG5wbURpc3RUYWc6IE5wbURpc3RUYWcsXG4gIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4pIHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFtcbiAgICAgICAgLi4ueWFybkNvbW1hbmQuYXJncyxcbiAgICAgICAgJy0tc2lsZW50JyxcbiAgICAgICAgJ25nLWRldicsXG4gICAgICAgICdyZWxlYXNlJyxcbiAgICAgICAgJ3NldC1kaXN0LXRhZycsXG4gICAgICAgIG5wbURpc3RUYWcsXG4gICAgICAgIHZlcnNpb24uZm9ybWF0KCksXG4gICAgICBdLFxuICAgICAge2N3ZDogcHJvamVjdERpcn0sXG4gICAgKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFNldCBcIiR7bnBtRGlzdFRhZ31cIiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7bnBtRGlzdFRhZ31cIi5gKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQgaW4gb3JkZXIgdG8gYnVpbGQgdGhlIHJlbGVhc2VcbiAqIHBhY2thZ2VzIGZvciB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTxCdWlsdFBhY2thZ2VbXT4ge1xuICAvLyBOb3RlOiBXZSBjYW5ub3QgdXNlIGB5YXJuYCBkaXJlY3RseSBhcyBjb21tYW5kIGJlY2F1c2Ugd2UgbWlnaHQgb3BlcmF0ZSBpblxuICAvLyBhIGRpZmZlcmVudCBwdWJsaXNoIGJyYW5jaCBhbmQgdGhlIGN1cnJlbnQgYFBBVEhgIHdpbGwgcG9pbnQgdG8gdGhlIFlhcm4gdmVyc2lvblxuICAvLyB0aGF0IGludm9rZWQgdGhlIHJlbGVhc2UgdG9vbC4gTW9yZSBkZXRhaWxzIGluIHRoZSBmdW5jdGlvbiBkZXNjcmlwdGlvbi5cbiAgY29uc3QgeWFybkNvbW1hbmQgPSBhd2FpdCByZXNvbHZlWWFyblNjcmlwdEZvclByb2plY3QocHJvamVjdERpcik7XG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcignQnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuJyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sXG4gICAgICB7XG4gICAgICAgIGN3ZDogcHJvamVjdERpcixcbiAgICAgICAgbW9kZTogJ3NpbGVudCcsXG4gICAgICB9LFxuICAgICk7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIEJ1aWx0UGFja2FnZVtdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBidWlsZGluZyB0aGUgcmVsZWFzZSBwYWNrYWdlcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgeWFybiBpbnN0YWxsYCBjb21tYW5kIGluIG9yZGVyIHRvIGluc3RhbGwgZGVwZW5kZW5jaWVzIGZvclxuICogdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB3aXRoIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIE5vdGU6IFdlIGNhbm5vdCB1c2UgYHlhcm5gIGRpcmVjdGx5IGFzIGNvbW1hbmQgYmVjYXVzZSB3ZSBtaWdodCBvcGVyYXRlIGluXG4gIC8vIGEgZGlmZmVyZW50IHB1Ymxpc2ggYnJhbmNoIGFuZCB0aGUgY3VycmVudCBgUEFUSGAgd2lsbCBwb2ludCB0byB0aGUgWWFybiB2ZXJzaW9uXG4gIC8vIHRoYXQgaW52b2tlZCB0aGUgcmVsZWFzZSB0b29sLiBNb3JlIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICBjb25zdCB5YXJuQ29tbWFuZCA9IGF3YWl0IHJlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdChwcm9qZWN0RGlyKTtcblxuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgdXNpbmcgYW4gT3JhIHNwaW5uZXIgaW5zdGVhZCB0byBlbnN1cmUgbWluaW1hbCBjb25zb2xlIG91dHB1dC5cbiAgICBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnaW5zdGFsbCcsICctLWZyb3plbi1sb2NrZmlsZScsICctLW5vbi1pbnRlcmFjdGl2ZSddLFxuICAgICAge2N3ZDogcHJvamVjdERpcn0sXG4gICAgKTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEluc3RhbGxlZCBwcm9qZWN0IGRlcGVuZGVuY2llcy4nKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaW5zdGFsbGluZyBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG4iXX0=