"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseSetDistTagCommand = void 0;
const semver = require("semver");
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const spinner_1 = require("../../utils/spinner");
const index_1 = require("../config/index");
const npm_publish_1 = require("../versioning/npm-publish");
function builder(args) {
    return args
        .positional('tagName', {
        type: 'string',
        demandOption: true,
        description: 'Name of the NPM dist tag.',
    })
        .positional('targetVersion', {
        type: 'string',
        demandOption: true,
        description: 'Version to which the dist tag should be set.',
    });
}
/** Yargs command handler for building a release. */
async function handler(args) {
    const { targetVersion: rawVersion, tagName } = args;
    const config = config_1.getConfig();
    index_1.assertValidReleaseConfig(config);
    const { npmPackages, publishRegistry } = config.release;
    const version = semver.parse(rawVersion);
    if (version === null) {
        console_1.error(console_1.red(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
        process.exit(1);
    }
    console_1.debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
    const spinner = new spinner_1.Spinner('');
    for (const pkgName of npmPackages) {
        spinner.update(`Setting NPM dist tag for "${pkgName}"`);
        try {
            await npm_publish_1.setNpmTagForPackage(pkgName, tagName, version, publishRegistry);
            console_1.debug(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
        }
        catch (e) {
            spinner.complete();
            console_1.error(e);
            console_1.error(console_1.red(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
            process.exit(1);
        }
    }
    spinner.complete();
    console_1.info(console_1.green(`  ✓   Set NPM dist tag for all release packages.`));
    console_1.info(console_1.green(`      ${console_1.bold(tagName)} will now point to ${console_1.bold(`v${version}`)}.`));
}
/** CLI command module for setting an NPM dist tag. */
exports.ReleaseSetDistTagCommand = {
    builder,
    handler,
    command: 'set-dist-tag <tag-name> <target-version>',
    describe: 'Sets a given NPM dist tag for all release packages.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUFFakMsK0NBQTZDO0FBRTdDLGlEQUF5RTtBQUN6RSxpREFBNEM7QUFDNUMsMkNBQXlEO0FBQ3pELDJEQUE4RDtBQVE5RCxTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNSLFVBQVUsQ0FBQyxTQUFTLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxZQUFZLEVBQUUsSUFBSTtRQUNsQixXQUFXLEVBQUUsMkJBQTJCO0tBQ3pDLENBQUM7U0FDRCxVQUFVLENBQUMsZUFBZSxFQUFFO1FBQzNCLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLDhDQUE4QztLQUM1RCxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELEtBQUssVUFBVSxPQUFPLENBQUMsSUFBeUM7SUFDOUQsTUFBTSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxNQUFNLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDdEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV6QyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDcEIsZUFBSyxDQUFDLGFBQUcsQ0FBQyw4QkFBOEIsVUFBVSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELGVBQUssQ0FBQyxZQUFZLE9BQU8sMkNBQTJDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEYsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhDLEtBQUssTUFBTSxPQUFPLElBQUksV0FBVyxFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxNQUFNLENBQUMsNkJBQTZCLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFFeEQsSUFBSTtZQUNGLE1BQU0saUNBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdkUsZUFBSyxDQUFDLHFCQUFxQixPQUFPLHVCQUF1QixPQUFPLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDbkIsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsZUFBSyxDQUFDLGFBQUcsQ0FBQywrREFBK0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRjtJQUVELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixjQUFJLENBQUMsZUFBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztJQUNoRSxjQUFJLENBQUMsZUFBSyxDQUFDLFNBQVMsY0FBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsY0FBSSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQsc0RBQXNEO0FBQ3pDLFFBQUEsd0JBQXdCLEdBQWdEO0lBQ25GLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDBDQUEwQztJQUNuRCxRQUFRLEVBQUUscURBQXFEO0NBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7c2V0TnBtVGFnRm9yUGFja2FnZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3Igc2V0dGluZyBhbiBOUE0gZGlzdCB0YWcuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucyB7XG4gIHRhZ05hbWU6IHN0cmluZztcbiAgdGFyZ2V0VmVyc2lvbjogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3M6IEFyZ3YpOiBBcmd2PFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4ge1xuICByZXR1cm4gYXJnc1xuICAgIC5wb3NpdGlvbmFsKCd0YWdOYW1lJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjogJ05hbWUgb2YgdGhlIE5QTSBkaXN0IHRhZy4nLFxuICAgIH0pXG4gICAgLnBvc2l0aW9uYWwoJ3RhcmdldFZlcnNpb24nLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVmVyc2lvbiB0byB3aGljaCB0aGUgZGlzdCB0YWcgc2hvdWxkIGJlIHNldC4nLFxuICAgIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKGFyZ3M6IEFyZ3VtZW50czxSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+KSB7XG4gIGNvbnN0IHt0YXJnZXRWZXJzaW9uOiByYXdWZXJzaW9uLCB0YWdOYW1lfSA9IGFyZ3M7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgY29uc3Qge25wbVBhY2thZ2VzLCBwdWJsaXNoUmVnaXN0cnl9ID0gY29uZmlnLnJlbGVhc2U7XG4gIGNvbnN0IHZlcnNpb24gPSBzZW12ZXIucGFyc2UocmF3VmVyc2lvbik7XG5cbiAgaWYgKHZlcnNpb24gPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYEludmFsaWQgdmVyc2lvbiBzcGVjaWZpZWQgKCR7cmF3VmVyc2lvbn0pLiBVbmFibGUgdG8gc2V0IE5QTSBkaXN0IHRhZy5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgZGVidWcoYFNldHRpbmcgXCIke3RhZ05hbWV9XCIgTlBNIGRpc3QgdGFnIGZvciByZWxlYXNlIHBhY2thZ2VzIHRvIHYke3ZlcnNpb259LmApO1xuICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoJycpO1xuXG4gIGZvciAoY29uc3QgcGtnTmFtZSBvZiBucG1QYWNrYWdlcykge1xuICAgIHNwaW5uZXIudXBkYXRlKGBTZXR0aW5nIE5QTSBkaXN0IHRhZyBmb3IgXCIke3BrZ05hbWV9XCJgKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZXROcG1UYWdGb3JQYWNrYWdlKHBrZ05hbWUsIHRhZ05hbWUsIHZlcnNpb24hLCBwdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgZGVidWcoYFN1Y2Nlc3NmdWxseSBzZXQgXCIke3RhZ05hbWV9XCIgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiLmApKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICB9XG4gIH1cblxuICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuYCkpO1xuICBpbmZvKGdyZWVuKGAgICAgICAke2JvbGQodGFnTmFtZSl9IHdpbGwgbm93IHBvaW50IHRvICR7Ym9sZChgdiR7dmVyc2lvbn1gKX0uYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQ6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdzZXQtZGlzdC10YWcgPHRhZy1uYW1lPiA8dGFyZ2V0LXZlcnNpb24+JyxcbiAgZGVzY3JpYmU6ICdTZXRzIGEgZ2l2ZW4gTlBNIGRpc3QgdGFnIGZvciBhbGwgcmVsZWFzZSBwYWNrYWdlcy4nLFxufTtcbiJdfQ==