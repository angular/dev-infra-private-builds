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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFnRDtBQUNoRCxpREFBNEQ7QUFDNUQsaURBQTRDO0FBRzVDLG1EQUF3RDtBQUN4RCxtRUFBeUU7QUFJekU7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUg7Ozs7OztHQU1HO0FBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUMzQyxVQUFrQixFQUNsQixVQUFzQixFQUN0QixPQUFzQixFQUN0QixVQUErQyxFQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBQztJQUVoRiw2RUFBNkU7SUFDN0UsbUZBQW1GO0lBQ25GLDJFQUEyRTtJQUMzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOENBQTJCLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFFbEUsSUFBSTtRQUNGLG1GQUFtRjtRQUNuRixNQUFNLElBQUEscUJBQUssRUFDVCxXQUFXLENBQUMsTUFBTSxFQUNsQjtZQUNFLEdBQUcsV0FBVyxDQUFDLElBQUk7WUFDbkIsVUFBVTtZQUNWLFFBQVE7WUFDUixTQUFTO1lBQ1QsY0FBYztZQUNkLFVBQVU7WUFDVixPQUFPLENBQUMsTUFBTSxFQUFFO1lBQ2hCLGdDQUFnQyxPQUFPLENBQUMsd0JBQXdCLEVBQUU7U0FDbkUsRUFDRCxFQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUMsQ0FDbEIsQ0FBQztRQUNGLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLGNBQWMsVUFBVSx1Q0FBdUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3hGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFD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RUFDbEIsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEVBQzFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUNsQixDQUFDO1FBQ0YsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO0tBQ3REO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFwQkQsNERBb0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtTcGlubmVyfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge3Jlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdH0gZnJvbSAnLi4vLi4vdXRpbHMvcmVzb2x2ZS15YXJuLWJpbic7XG5pbXBvcnQge1JlbGVhc2VCdWlsZEpzb25TdGRvdXR9IGZyb20gJy4uL2J1aWxkL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VJbmZvSnNvblN0ZG91dH0gZnJvbSAnLi4vaW5mby9jbGknO1xuXG4vKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGhlbHBlcnMgZm9yIGludm9raW5nIGV4dGVybmFsIGBuZy1kZXZgIGNvbW1hbmRzLiBBIHN1YnNldCBvZiBhY3Rpb25zLFxuICogbGlrZSBidWlsZGluZyByZWxlYXNlIG91dHB1dCBvciBzZXR0aW5nIGHOvSBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMsIGNhbm5vdCBiZVxuICogcGVyZm9ybWVkIGRpcmVjdGx5IGFzIHBhcnQgb2YgdGhlIHJlbGVhc2UgdG9vbCBhbmQgbmVlZCB0byBiZSBkZWxlZ2F0ZWQgdG8gZXh0ZXJuYWwgYG5nLWRldmBcbiAqIGNvbW1hbmRzIHRoYXQgZXhpc3QgYWNyb3NzIGFyYml0cmFyeSB2ZXJzaW9uIGJyYW5jaGVzLlxuICpcbiAqIEluIGEgY29uY3JldGUgZXhhbXBsZTogQ29uc2lkZXIgYSBuZXcgcGF0Y2ggdmVyc2lvbiBpcyByZWxlYXNlZCBhbmQgdGhhdCBhIG5ldyByZWxlYXNlXG4gKiBwYWNrYWdlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgcGF0Y2ggYnJhbmNoIHdpbGwgbm90IGNvbnRhaW4gdGhlIG5ld1xuICogcmVsZWFzZSBwYWNrYWdlLCBzbyB3ZSBjb3VsZCBub3QgYnVpbGQgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciBpdC4gVG8gd29yayBhcm91bmQgdGhpcywgd2VcbiAqIGNhbGwgdGhlIG5nLWRldiBidWlsZCBjb21tYW5kIGZvciB0aGUgcGF0Y2ggdmVyc2lvbiBicmFuY2ggYW5kIGV4cGVjdCBpdCB0byByZXR1cm4gYSBsaXN0XG4gKiBvZiBidWlsdCBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgcmVsZWFzZWQgYXMgcGFydCBvZiB0aGlzIHJlbGVhc2UgdHJhaW4uXG4gKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKi9cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2Ugc2V0LWRpc3QtdGFnYCBjb21tYW5kIGluIG9yZGVyIHRvIHNldCB0aGUgc3BlY2lmaWVkXG4gKiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyBpbiB0aGUgY2hlY2tlZCBvdXQgYnJhbmNoIHRvIHRoZSBnaXZlbiB2ZXJzaW9uLlxuICpcbiAqIE9wdGlvbmFsbHksIHRoZSBOUE0gZGlzdCB0YWcgdXBkYXRlIGNhbiBiZSBza2lwcGVkIGZvciBleHBlcmltZW50YWwgcGFja2FnZXMuIFRoaXNcbiAqIGlzIHVzZWZ1bCB3aGVuIHRhZ2dpbmcgbG9uZy10ZXJtLXN1cHBvcnQgcGFja2FnZXMgd2l0aGluIE5QTS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVNldE5wbURpc3RDb21tYW5kKFxuICBwcm9qZWN0RGlyOiBzdHJpbmcsXG4gIG5wbURpc3RUYWc6IE5wbURpc3RUYWcsXG4gIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gIG9wdGlvbnM6IHtza2lwRXhwZXJpbWVudGFsUGFja2FnZXM6IGJvb2xlYW59ID0ge3NraXBFeHBlcmltZW50YWxQYWNrYWdlczogZmFsc2V9LFxuKSB7XG4gIC8vIE5vdGU6IFdlIGNhbm5vdCB1c2UgYHlhcm5gIGRpcmVjdGx5IGFzIGNvbW1hbmQgYmVjYXVzZSB3ZSBtaWdodCBvcGVyYXRlIGluXG4gIC8vIGEgZGlmZmVyZW50IHB1Ymxpc2ggYnJhbmNoIGFuZCB0aGUgY3VycmVudCBgUEFUSGAgd2lsbCBwb2ludCB0byB0aGUgWWFybiB2ZXJzaW9uXG4gIC8vIHRoYXQgaW52b2tlZCB0aGUgcmVsZWFzZSB0b29sLiBNb3JlIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICBjb25zdCB5YXJuQ29tbWFuZCA9IGF3YWl0IHJlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdChwcm9qZWN0RGlyKTtcblxuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgYXdhaXQgc3Bhd24oXG4gICAgICB5YXJuQ29tbWFuZC5iaW5hcnksXG4gICAgICBbXG4gICAgICAgIC4uLnlhcm5Db21tYW5kLmFyZ3MsXG4gICAgICAgICctLXNpbGVudCcsXG4gICAgICAgICduZy1kZXYnLFxuICAgICAgICAncmVsZWFzZScsXG4gICAgICAgICdzZXQtZGlzdC10YWcnLFxuICAgICAgICBucG1EaXN0VGFnLFxuICAgICAgICB2ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBgLS1za2lwLWV4cGVyaW1lbnRhbC1wYWNrYWdlcz0ke29wdGlvbnMuc2tpcEV4cGVyaW1lbnRhbFBhY2thZ2VzfWAsXG4gICAgICBdLFxuICAgICAge2N3ZDogcHJvamVjdERpcn0sXG4gICAgKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFNldCBcIiR7bnBtRGlzdFRhZ31cIiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7bnBtRGlzdFRhZ31cIi5gKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQgaW4gb3JkZXIgdG8gYnVpbGQgdGhlIHJlbGVhc2VcbiAqIHBhY2thZ2VzIGZvciB0aGUgY3VycmVudGx5IGNoZWNrZWQgb3V0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQoXG4gIHByb2plY3REaXI6IHN0cmluZyxcbik6IFByb21pc2U8UmVsZWFzZUJ1aWxkSnNvblN0ZG91dD4ge1xuICAvLyBOb3RlOiBXZSBjYW5ub3QgdXNlIGB5YXJuYCBkaXJlY3RseSBhcyBjb21tYW5kIGJlY2F1c2Ugd2UgbWlnaHQgb3BlcmF0ZSBpblxuICAvLyBhIGRpZmZlcmVudCBwdWJsaXNoIGJyYW5jaCBhbmQgdGhlIGN1cnJlbnQgYFBBVEhgIHdpbGwgcG9pbnQgdG8gdGhlIFlhcm4gdmVyc2lvblxuICAvLyB0aGF0IGludm9rZWQgdGhlIHJlbGVhc2UgdG9vbC4gTW9yZSBkZXRhaWxzIGluIHRoZSBmdW5jdGlvbiBkZXNjcmlwdGlvbi5cbiAgY29uc3QgeWFybkNvbW1hbmQgPSBhd2FpdCByZXNvbHZlWWFyblNjcmlwdEZvclByb2plY3QocHJvamVjdERpcik7XG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcignQnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuJyk7XG5cbiAgdHJ5IHtcbiAgICAvLyBTaW5jZSB3ZSBleHBlY3QgSlNPTiB0byBiZSBwcmludGVkIGZyb20gdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCxcbiAgICAvLyB3ZSBzcGF3biB0aGUgcHJvY2VzcyBpbiBzaWxlbnQgbW9kZS4gV2UgaGF2ZSBzZXQgdXAgYW4gT3JhIHByb2dyZXNzIHNwaW5uZXIuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sXG4gICAgICB7XG4gICAgICAgIGN3ZDogcHJvamVjdERpcixcbiAgICAgICAgbW9kZTogJ3NpbGVudCcsXG4gICAgICB9LFxuICAgICk7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIFJlbGVhc2VCdWlsZEpzb25TdGRvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBpbmZvYCBjb21tYW5kIGluIG9yZGVyIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uXG4gKiBhYm91dCB0aGUgcmVsZWFzZSBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkLW91dCBicmFuY2guXG4gKlxuICogVGhpcyBpcyB1c2VmdWwgdG8gZS5nLiBkZXRlcm1pbmUgd2hldGhlciBhIGJ1aWx0IHBhY2thZ2UgaXMgY3VycmVudGx5XG4gKiBkZW5vdGVkIGFzIGV4cGVyaW1lbnRhbCBvciBub3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlSW5mb0NvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTxSZWxlYXNlSW5mb0pzb25TdGRvdXQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIGV4cGVjdGVkIHRvIGJlIGEgZmFzdCBvcGVyYXRpb24uXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnaW5mbycsICctLWpzb24nXSxcbiAgICAgIHtcbiAgICAgICAgY3dkOiBwcm9qZWN0RGlyLFxuICAgICAgICBtb2RlOiAnc2lsZW50JyxcbiAgICAgIH0sXG4gICAgKTtcbiAgICAvLyBUaGUgYG5nLWRldiByZWxlYXNlIGluZm9gIGNvbW1hbmQgcHJpbnRzIGEgSlNPTiBvYmplY3QgdG8gc3Rkb3V0LlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIFJlbGVhc2VJbmZvSnNvblN0ZG91dDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKFxuICAgICAgcmVkKFxuICAgICAgICBgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSByZXRyaWV2aW5nIHRoZSByZWxlYXNlIGluZm9ybWF0aW9uIGZvciBgICtcbiAgICAgICAgICBgdGhlIGN1cnJlbnRseSBjaGVja2VkLW91dCBicmFuY2guYCxcbiAgICAgICksXG4gICAgKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGluc3RhbGxgIGNvbW1hbmQgaW4gb3JkZXIgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgZm9yXG4gKiB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHdpdGggdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZChwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB0aGUgY29tbWFuZC5cbiAgICAvLyBUT0RPOiBDb25zaWRlciB1c2luZyBhbiBPcmEgc3Bpbm5lciBpbnN0ZWFkIHRvIGVuc3VyZSBtaW5pbWFsIGNvbnNvbGUgb3V0cHV0LlxuICAgIGF3YWl0IHNwYXduKFxuICAgICAgeWFybkNvbW1hbmQuYmluYXJ5LFxuICAgICAgWy4uLnlhcm5Db21tYW5kLmFyZ3MsICdpbnN0YWxsJywgJy0tZnJvemVuLWxvY2tmaWxlJywgJy0tbm9uLWludGVyYWN0aXZlJ10sXG4gICAgICB7Y3dkOiBwcm9qZWN0RGlyfSxcbiAgICApO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgSW5zdGFsbGVkIHByb2plY3QgZGVwZW5kZW5jaWVzLicpKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKGUpO1xuICAgIGVycm9yKHJlZCgnICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBpbnN0YWxsaW5nIGRlcGVuZGVuY2llcy4nKSk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cbiJdfQ==