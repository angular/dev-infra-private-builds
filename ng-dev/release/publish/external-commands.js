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
        // TODO: detect yarn berry and handle flag differences properly.
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
        // TODO: detect yarn berry and handle flag differences properly.
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
        // TODO: detect yarn berry and handle flag differences properly.
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
        await (0, child_process_1.spawn)(yarnCommand.binary, 
        // TODO: detect yarn berry and handle flag differences properly.
        [...yarnCommand.args, 'install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
        (0, console_1.info)((0, console_1.green)('  ✓   Installed project dependencies.'));
    }
    catch (e) {
        (0, console_1.error)(e);
        (0, console_1.error)((0, console_1.red)('  ✘   An error occurred while installing dependencies.'));
        throw new actions_error_1.FatalReleaseActionError();
    }
}
exports.invokeYarnInstallCommand = invokeYarnInstallCommand;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9uZy1kZXYvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILDZEQUFnRDtBQUNoRCxpREFBNEQ7QUFDNUQsaURBQTRDO0FBRzVDLG1EQUF3RDtBQUN4RCxtRUFBeUU7QUFJekU7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUg7Ozs7OztHQU1HO0FBQ0ksS0FBSyxVQUFVLHVCQUF1QixDQUMzQyxVQUFrQixFQUNsQixVQUFzQixFQUN0QixPQUFzQixFQUN0QixVQUErQyxFQUFDLHdCQUF3QixFQUFFLEtBQUssRUFBQztJQUVoRiw2RUFBNkU7SUFDN0UsbUZBQW1GO0lBQ25GLDJFQUEyRTtJQUMzRSxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUEsOENBQTJCLEVBQUMsVUFBVSxDQUFDLENBQUM7SUFFbEUsSUFBSTtRQUNGLG1GQUFtRjtRQUNuRixnRUFBZ0U7UUFDaEUsTUFBTSxJQUFBLHFCQUFLLEVBQ1QsV0FBVyxDQUFDLE1BQU0sRUFDbEI7WUFDRSxHQUFHLFdBQVcsQ0FBQyxJQUFJO1lBQ25CLFVBQVU7WUFDVixRQUFRO1lBQ1IsU0FBUztZQUNULGNBQWM7WUFDZCxVQUFVO1lBQ1YsT0FBTyxDQUFDLE1BQU0sRUFBRTtZQUNoQixnQ0FBZ0MsT0FBTyxDQUFDLHdCQUF3QixFQUFFO1NBQ25FLEVBQ0QsRUFBQyxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQ2xCLENBQUM7UUFDRixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyxjQUFjLFVBQVUsdUNBQXVDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUN4RjtJQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ1YsSUFBQSxlQUFLLEVBQUMsQ0FBQyxDQUFDLENBQUM7UUFDVCxJQUFBLGVBQUssRUFBQyxJ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Q0YsbUZBQW1GO1FBQ25GLGdGQUFnRjtRQUNoRixNQUFNLElBQUEscUJBQUssRUFDVCxXQUFXLENBQUMsTUFBTTtRQUNsQixnRUFBZ0U7UUFDaEUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixFQUFFLG1CQUFtQixDQUFDLEVBQzFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUNsQixDQUFDO1FBQ0YsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO0tBQ3REO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztRQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztRQUNyRSxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQztLQUNyQztBQUNILENBQUM7QUFyQkQsNERBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NwYXdufSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtTcGlubmVyfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge3Jlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdH0gZnJvbSAnLi4vLi4vdXRpbHMvcmVzb2x2ZS15YXJuLWJpbic7XG5pbXBvcnQge1JlbGVhc2VCdWlsZEpzb25TdGRvdXR9IGZyb20gJy4uL2J1aWxkL2NsaSc7XG5pbXBvcnQge1JlbGVhc2VJbmZvSnNvblN0ZG91dH0gZnJvbSAnLi4vaW5mby9jbGknO1xuXG4vKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIGhlbHBlcnMgZm9yIGludm9raW5nIGV4dGVybmFsIGBuZy1kZXZgIGNvbW1hbmRzLiBBIHN1YnNldCBvZiBhY3Rpb25zLFxuICogbGlrZSBidWlsZGluZyByZWxlYXNlIG91dHB1dCBvciBzZXR0aW5nIGHOvSBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMsIGNhbm5vdCBiZVxuICogcGVyZm9ybWVkIGRpcmVjdGx5IGFzIHBhcnQgb2YgdGhlIHJlbGVhc2UgdG9vbCBhbmQgbmVlZCB0byBiZSBkZWxlZ2F0ZWQgdG8gZXh0ZXJuYWwgYG5nLWRldmBcbiAqIGNvbW1hbmRzIHRoYXQgZXhpc3QgYWNyb3NzIGFyYml0cmFyeSB2ZXJzaW9uIGJyYW5jaGVzLlxuICpcbiAqIEluIGEgY29uY3JldGUgZXhhbXBsZTogQ29uc2lkZXIgYSBuZXcgcGF0Y2ggdmVyc2lvbiBpcyByZWxlYXNlZCBhbmQgdGhhdCBhIG5ldyByZWxlYXNlXG4gKiBwYWNrYWdlIGhhcyBiZWVuIGFkZGVkIHRvIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgcGF0Y2ggYnJhbmNoIHdpbGwgbm90IGNvbnRhaW4gdGhlIG5ld1xuICogcmVsZWFzZSBwYWNrYWdlLCBzbyB3ZSBjb3VsZCBub3QgYnVpbGQgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciBpdC4gVG8gd29yayBhcm91bmQgdGhpcywgd2VcbiAqIGNhbGwgdGhlIG5nLWRldiBidWlsZCBjb21tYW5kIGZvciB0aGUgcGF0Y2ggdmVyc2lvbiBicmFuY2ggYW5kIGV4cGVjdCBpdCB0byByZXR1cm4gYSBsaXN0XG4gKiBvZiBidWlsdCBwYWNrYWdlcyB0aGF0IG5lZWQgdG8gYmUgcmVsZWFzZWQgYXMgcGFydCBvZiB0aGlzIHJlbGVhc2UgdHJhaW4uXG4gKlxuICogIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG4gKi9cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgbmctZGV2IHJlbGVhc2Ugc2V0LWRpc3QtdGFnYCBjb21tYW5kIGluIG9yZGVyIHRvIHNldCB0aGUgc3BlY2lmaWVkXG4gKiBOUE0gZGlzdCB0YWcgZm9yIGFsbCBwYWNrYWdlcyBpbiB0aGUgY2hlY2tlZCBvdXQgYnJhbmNoIHRvIHRoZSBnaXZlbiB2ZXJzaW9uLlxuICpcbiAqIE9wdGlvbmFsbHksIHRoZSBOUE0gZGlzdCB0YWcgdXBkYXRlIGNhbiBiZSBza2lwcGVkIGZvciBleHBlcmltZW50YWwgcGFja2FnZXMuIFRoaXNcbiAqIGlzIHVzZWZ1bCB3aGVuIHRhZ2dpbmcgbG9uZy10ZXJtLXN1cHBvcnQgcGFja2FnZXMgd2l0aGluIE5QTS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVNldE5wbURpc3RDb21tYW5kKFxuICBwcm9qZWN0RGlyOiBzdHJpbmcsXG4gIG5wbURpc3RUYWc6IE5wbURpc3RUYWcsXG4gIHZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gIG9wdGlvbnM6IHtza2lwRXhwZXJpbWVudGFsUGFja2FnZXM6IGJvb2xlYW59ID0ge3NraXBFeHBlcmltZW50YWxQYWNrYWdlczogZmFsc2V9LFxuKSB7XG4gIC8vIE5vdGU6IFdlIGNhbm5vdCB1c2UgYHlhcm5gIGRpcmVjdGx5IGFzIGNvbW1hbmQgYmVjYXVzZSB3ZSBtaWdodCBvcGVyYXRlIGluXG4gIC8vIGEgZGlmZmVyZW50IHB1Ymxpc2ggYnJhbmNoIGFuZCB0aGUgY3VycmVudCBgUEFUSGAgd2lsbCBwb2ludCB0byB0aGUgWWFybiB2ZXJzaW9uXG4gIC8vIHRoYXQgaW52b2tlZCB0aGUgcmVsZWFzZSB0b29sLiBNb3JlIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICBjb25zdCB5YXJuQ29tbWFuZCA9IGF3YWl0IHJlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdChwcm9qZWN0RGlyKTtcblxuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogZGV0ZWN0IHlhcm4gYmVycnkgYW5kIGhhbmRsZSBmbGFnIGRpZmZlcmVuY2VzIHByb3Blcmx5LlxuICAgIGF3YWl0IHNwYXduKFxuICAgICAgeWFybkNvbW1hbmQuYmluYXJ5LFxuICAgICAgW1xuICAgICAgICAuLi55YXJuQ29tbWFuZC5hcmdzLFxuICAgICAgICAnLS1zaWxlbnQnLFxuICAgICAgICAnbmctZGV2JyxcbiAgICAgICAgJ3JlbGVhc2UnLFxuICAgICAgICAnc2V0LWRpc3QtdGFnJyxcbiAgICAgICAgbnBtRGlzdFRhZyxcbiAgICAgICAgdmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgYC0tc2tpcC1leHBlcmltZW50YWwtcGFja2FnZXM9JHtvcHRpb25zLnNraXBFeHBlcmltZW50YWxQYWNrYWdlc31gLFxuICAgICAgXSxcbiAgICAgIHtjd2Q6IHByb2plY3REaXJ9LFxuICAgICk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBTZXQgXCIke25wbURpc3RUYWd9XCIgTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke25wbURpc3RUYWd9XCIuYCkpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kIGluIG9yZGVyIHRvIGJ1aWxkIHRoZSByZWxlYXNlXG4gKiBwYWNrYWdlcyBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKFxuICBwcm9qZWN0RGlyOiBzdHJpbmcsXG4pOiBQcm9taXNlPFJlbGVhc2VCdWlsZEpzb25TdGRvdXQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuICAvLyBOb3RlOiBXZSBleHBsaWNpdGx5IG1lbnRpb24gdGhhdCB0aGlzIGNhbiB0YWtlIGEgZmV3IG1pbnV0ZXMsIHNvIHRoYXQgaXQncyBvYnZpb3VzXG4gIC8vIHRvIGNhcmV0YWtlcnMgdGhhdCBpdCBjYW4gdGFrZSBsb25nZXIgdGhhbiBqdXN0IGEgZmV3IHNlY29uZHMuXG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcignQnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuIFRoaXMgY2FuIHRha2UgYSBmZXcgbWludXRlcy4nKTtcblxuICB0cnkge1xuICAgIC8vIFNpbmNlIHdlIGV4cGVjdCBKU09OIHRvIGJlIHByaW50ZWQgZnJvbSB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLFxuICAgIC8vIHdlIHNwYXduIHRoZSBwcm9jZXNzIGluIHNpbGVudCBtb2RlLiBXZSBoYXZlIHNldCB1cCBhbiBPcmEgcHJvZ3Jlc3Mgc3Bpbm5lci5cbiAgICAvLyBUT0RPOiBkZXRlY3QgeWFybiBiZXJyeSBhbmQgaGFuZGxlIGZsYWcgZGlmZmVyZW5jZXMgcHJvcGVybHkuXG4gICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sXG4gICAgICB7XG4gICAgICAgIGN3ZDogcHJvamVjdERpcixcbiAgICAgICAgbW9kZTogJ3NpbGVudCcsXG4gICAgICB9LFxuICAgICk7XG4gICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIFJlbGVhc2VCdWlsZEpzb25TdGRvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGBuZy1kZXYgcmVsZWFzZSBpbmZvYCBjb21tYW5kIGluIG9yZGVyIHRvIHJldHJpZXZlIGluZm9ybWF0aW9uXG4gKiBhYm91dCB0aGUgcmVsZWFzZSBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkLW91dCBicmFuY2guXG4gKlxuICogVGhpcyBpcyB1c2VmdWwgdG8gZS5nLiBkZXRlcm1pbmUgd2hldGhlciBhIGJ1aWx0IHBhY2thZ2UgaXMgY3VycmVudGx5XG4gKiBkZW5vdGVkIGFzIGV4cGVyaW1lbnRhbCBvciBub3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlSW5mb0NvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTxSZWxlYXNlSW5mb0pzb25TdGRvdXQ+IHtcbiAgLy8gTm90ZTogV2UgY2Fubm90IHVzZSBgeWFybmAgZGlyZWN0bHkgYXMgY29tbWFuZCBiZWNhdXNlIHdlIG1pZ2h0IG9wZXJhdGUgaW5cbiAgLy8gYSBkaWZmZXJlbnQgcHVibGlzaCBicmFuY2ggYW5kIHRoZSBjdXJyZW50IGBQQVRIYCB3aWxsIHBvaW50IHRvIHRoZSBZYXJuIHZlcnNpb25cbiAgLy8gdGhhdCBpbnZva2VkIHRoZSByZWxlYXNlIHRvb2wuIE1vcmUgZGV0YWlscyBpbiB0aGUgZnVuY3Rpb24gZGVzY3JpcHRpb24uXG4gIGNvbnN0IHlhcm5Db21tYW5kID0gYXdhaXQgcmVzb2x2ZVlhcm5TY3JpcHRGb3JQcm9qZWN0KHByb2plY3REaXIpO1xuXG4gIHRyeSB7XG4gICAgLy8gTm90ZTogTm8gcHJvZ3Jlc3MgaW5kaWNhdG9yIG5lZWRlZCBhcyB0aGF0IGlzIGV4cGVjdGVkIHRvIGJlIGEgZmFzdCBvcGVyYXRpb24uXG4gICAgLy8gVE9ETzogZGV0ZWN0IHlhcm4gYmVycnkgYW5kIGhhbmRsZSBmbGFnIGRpZmZlcmVuY2VzIHByb3Blcmx5LlxuICAgIGNvbnN0IHtzdGRvdXR9ID0gYXdhaXQgc3Bhd24oXG4gICAgICB5YXJuQ29tbWFuZC5iaW5hcnksXG4gICAgICBbLi4ueWFybkNvbW1hbmQuYXJncywgJy0tc2lsZW50JywgJ25nLWRldicsICdyZWxlYXNlJywgJ2luZm8nLCAnLS1qc29uJ10sXG4gICAgICB7XG4gICAgICAgIGN3ZDogcHJvamVjdERpcixcbiAgICAgICAgbW9kZTogJ3NpbGVudCcsXG4gICAgICB9LFxuICAgICk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBpbmZvYCBjb21tYW5kIHByaW50cyBhIEpTT04gb2JqZWN0IHRvIHN0ZG91dC5cbiAgICByZXR1cm4gSlNPTi5wYXJzZShzdGRvdXQudHJpbSgpKSBhcyBSZWxlYXNlSW5mb0pzb25TdGRvdXQ7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihcbiAgICAgIHJlZChcbiAgICAgICAgYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcmV0cmlldmluZyB0aGUgcmVsZWFzZSBpbmZvcm1hdGlvbiBmb3IgYCArXG4gICAgICAgICAgYHRoZSBjdXJyZW50bHkgY2hlY2tlZC1vdXQgYnJhbmNoLmAsXG4gICAgICApLFxuICAgICk7XG4gICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBJbnZva2VzIHRoZSBgeWFybiBpbnN0YWxsYCBjb21tYW5kIGluIG9yZGVyIHRvIGluc3RhbGwgZGVwZW5kZW5jaWVzIGZvclxuICogdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB3aXRoIHRoZSBjdXJyZW50bHkgY2hlY2tlZCBvdXQgcmV2aXNpb24uXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQocHJvamVjdERpcjogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIC8vIE5vdGU6IFdlIGNhbm5vdCB1c2UgYHlhcm5gIGRpcmVjdGx5IGFzIGNvbW1hbmQgYmVjYXVzZSB3ZSBtaWdodCBvcGVyYXRlIGluXG4gIC8vIGEgZGlmZmVyZW50IHB1Ymxpc2ggYnJhbmNoIGFuZCB0aGUgY3VycmVudCBgUEFUSGAgd2lsbCBwb2ludCB0byB0aGUgWWFybiB2ZXJzaW9uXG4gIC8vIHRoYXQgaW52b2tlZCB0aGUgcmVsZWFzZSB0b29sLiBNb3JlIGRldGFpbHMgaW4gdGhlIGZ1bmN0aW9uIGRlc2NyaXB0aW9uLlxuICBjb25zdCB5YXJuQ29tbWFuZCA9IGF3YWl0IHJlc29sdmVZYXJuU2NyaXB0Rm9yUHJvamVjdChwcm9qZWN0RGlyKTtcblxuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgLy8gVE9ETzogQ29uc2lkZXIgdXNpbmcgYW4gT3JhIHNwaW5uZXIgaW5zdGVhZCB0byBlbnN1cmUgbWluaW1hbCBjb25zb2xlIG91dHB1dC5cbiAgICBhd2FpdCBzcGF3bihcbiAgICAgIHlhcm5Db21tYW5kLmJpbmFyeSxcbiAgICAgIC8vIFRPRE86IGRldGVjdCB5YXJuIGJlcnJ5IGFuZCBoYW5kbGUgZmxhZyBkaWZmZXJlbmNlcyBwcm9wZXJseS5cbiAgICAgIFsuLi55YXJuQ29tbWFuZC5hcmdzLCAnaW5zdGFsbCcsICctLWZyb3plbi1sb2NrZmlsZScsICctLW5vbi1pbnRlcmFjdGl2ZSddLFxuICAgICAge2N3ZDogcHJvamVjdERpcn0sXG4gICAgKTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEluc3RhbGxlZCBwcm9qZWN0IGRlcGVuZGVuY2llcy4nKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaW5zdGFsbGluZyBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG4iXX0=