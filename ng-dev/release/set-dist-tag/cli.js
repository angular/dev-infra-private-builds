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
const ora = require("ora");
const semver = require("semver");
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
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
    const spinner = ora.call(undefined).start();
    console_1.debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
    for (const pkgName of npmPackages) {
        spinner.text = `Setting NPM dist tag for "${pkgName}"`;
        spinner.render();
        try {
            await npm_publish_1.setNpmTagForPackage(pkgName, tagName, version, publishRegistry);
            console_1.debug(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
        }
        catch (e) {
            spinner.stop();
            console_1.error(e);
            console_1.error(console_1.red(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
            process.exit(1);
        }
    }
    spinner.stop();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBRWpDLCtDQUE2QztBQUU3QyxpREFBeUU7QUFDekUsMkNBQXlEO0FBQ3pELDJEQUE4RDtBQVE5RCxTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNSLFVBQVUsQ0FBQyxTQUFTLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxZQUFZLEVBQUUsSUFBSTtRQUNsQixXQUFXLEVBQUUsMkJBQTJCO0tBQ3pDLENBQUM7U0FDRCxVQUFVLENBQUMsZUFBZSxFQUFFO1FBQzNCLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLDhDQUE4QztLQUM1RCxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELEtBQUssVUFBVSxPQUFPLENBQUMsSUFBeUM7SUFDOUQsTUFBTSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE1BQU0sTUFBTSxHQUFHLGtCQUFTLEVBQUUsQ0FBQztJQUMzQixnQ0FBd0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxNQUFNLEVBQUMsV0FBVyxFQUFFLGVBQWUsRUFBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDdEQsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUV6QyxJQUFJLE9BQU8sS0FBSyxJQUFJLEVBQUU7UUFDcEIsZUFBSyxDQUFDLGFBQUcsQ0FBQyw4QkFBOEIsVUFBVSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDNUMsZUFBSyxDQUFDLFlBQVksT0FBTywyQ0FBMkMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUVoRixLQUFLLE1BQU0sT0FBTyxJQUFJLFdBQVcsRUFBRTtRQUNqQyxPQUFPLENBQUMsSUFBSSxHQUFHLDZCQUE2QixPQUFPLEdBQUcsQ0FBQztRQUN2RCxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFakIsSUFBSTtZQUNGLE1BQU0saUNBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdkUsZUFBSyxDQUFDLHFCQUFxQixPQUFPLHVCQUF1QixPQUFPLElBQUksQ0FBQyxDQUFDO1NBQ3ZFO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixlQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxlQUFLLENBQUMsYUFBRyxDQUFDLCtEQUErRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNGO0lBRUQsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsY0FBSSxDQUFDLGVBQUssQ0FBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDaEUsY0FBSSxDQUFDLGVBQUssQ0FBQyxTQUFTLGNBQUksQ0FBQyxPQUFPLENBQUMsc0JBQXNCLGNBQUksQ0FBQyxJQUFJLE9BQU8sRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEYsQ0FBQztBQUVELHNEQUFzRDtBQUN6QyxRQUFBLHdCQUF3QixHQUFnRDtJQUNuRixPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSwwQ0FBMEM7SUFDbkQsUUFBUSxFQUFFLHFEQUFxRDtDQUNoRSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtzZXROcG1UYWdGb3JQYWNrYWdlfSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zIHtcbiAgdGFnTmFtZTogc3RyaW5nO1xuICB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJnczogQXJndik6IEFyZ3Y8UmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiB7XG4gIHJldHVybiBhcmdzXG4gICAgLnBvc2l0aW9uYWwoJ3RhZ05hbWUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiB0aGUgTlBNIGRpc3QgdGFnLicsXG4gICAgfSlcbiAgICAucG9zaXRpb25hbCgndGFyZ2V0VmVyc2lvbicsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdWZXJzaW9uIHRvIHdoaWNoIHRoZSBkaXN0IHRhZyBzaG91bGQgYmUgc2V0LicsXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWV9ID0gYXJncztcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBjb25zdCB7bnBtUGFja2FnZXMsIHB1Ymxpc2hSZWdpc3RyeX0gPSBjb25maWcucmVsZWFzZTtcbiAgY29uc3QgdmVyc2lvbiA9IHNlbXZlci5wYXJzZShyYXdWZXJzaW9uKTtcblxuICBpZiAodmVyc2lvbiA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgSW52YWxpZCB2ZXJzaW9uIHNwZWNpZmllZCAoJHtyYXdWZXJzaW9ufSkuIFVuYWJsZSB0byBzZXQgTlBNIGRpc3QgdGFnLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydCgpO1xuICBkZWJ1ZyhgU2V0dGluZyBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCk7XG5cbiAgZm9yIChjb25zdCBwa2dOYW1lIG9mIG5wbVBhY2thZ2VzKSB7XG4gICAgc3Bpbm5lci50ZXh0ID0gYFNldHRpbmcgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cImA7XG4gICAgc3Bpbm5lci5yZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZXROcG1UYWdGb3JQYWNrYWdlKHBrZ05hbWUsIHRhZ05hbWUsIHZlcnNpb24hLCBwdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgZGVidWcoYFN1Y2Nlc3NmdWxseSBzZXQgXCIke3RhZ05hbWV9XCIgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke3BrZ05hbWV9XCIuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfVxuXG4gIHNwaW5uZXIuc3RvcCgpO1xuICBpbmZvKGdyZWVuKGAgIOKckyAgIFNldCBOUE0gZGlzdCB0YWcgZm9yIGFsbCByZWxlYXNlIHBhY2thZ2VzLmApKTtcbiAgaW5mbyhncmVlbihgICAgICAgJHtib2xkKHRhZ05hbWUpfSB3aWxsIG5vdyBwb2ludCB0byAke2JvbGQoYHYke3ZlcnNpb259YCl9LmApKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3Igc2V0dGluZyBhbiBOUE0gZGlzdCB0YWcuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZVNldERpc3RUYWdDb21tYW5kOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnc2V0LWRpc3QtdGFnIDx0YWctbmFtZT4gPHRhcmdldC12ZXJzaW9uPicsXG4gIGRlc2NyaWJlOiAnU2V0cyBhIGdpdmVuIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuJyxcbn07XG4iXX0=