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
    const config = (0, config_1.getConfig)();
    (0, index_1.assertValidReleaseConfig)(config);
    const { npmPackages, publishRegistry } = config.release;
    const version = semver.parse(rawVersion);
    if (version === null) {
        (0, console_1.error)((0, console_1.red)(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
        process.exit(1);
    }
    (0, console_1.debug)(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
    const spinner = new spinner_1.Spinner('');
    for (const pkgName of npmPackages) {
        spinner.update(`Setting NPM dist tag for "${pkgName}"`);
        try {
            await (0, npm_publish_1.setNpmTagForPackage)(pkgName, tagName, version, publishRegistry);
            (0, console_1.debug)(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
        }
        catch (e) {
            spinner.complete();
            (0, console_1.error)(e);
            (0, console_1.error)((0, console_1.red)(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
            process.exit(1);
        }
    }
    spinner.complete();
    (0, console_1.info)((0, console_1.green)(`  ✓   Set NPM dist tag for all release packages.`));
    (0, console_1.info)((0, console_1.green)(`      ${(0, console_1.bold)(tagName)} will now point to ${(0, console_1.bold)(`v${version}`)}.`));
}
/** CLI command module for setting an NPM dist tag. */
exports.ReleaseSetDistTagCommand = {
    builder,
    handler,
    command: 'set-dist-tag <tag-name> <target-version>',
    describe: 'Sets a given NPM dist tag for all release packages.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUFFakMsK0NBQTZDO0FBRTdDLGlEQUF5RTtBQUN6RSxpREFBNEM7QUFDNUMsMkNBQXlEO0FBQ3pELDJEQUE4RDtBQVE5RCxTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNSLFVBQVUsQ0FBQyxTQUFTLEVBQUU7UUFDckIsSUFBSSxFQUFFLFFBQVE7UUFDZCxZQUFZLEVBQUUsSUFBSTtRQUNsQixXQUFXLEVBQUUsMkJBQTJCO0tBQ3pDLENBQUM7U0FDRCxVQUFVLENBQUMsZUFBZSxFQUFFO1FBQzNCLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLDhDQUE4QztLQUM1RCxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsb0RBQW9EO0FBQ3BELEtBQUssVUFBVSxPQUFPLENBQUMsSUFBeUM7SUFDOUQsTUFBTSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2xELE1BQU0sTUFBTSxHQUFHLElBQUEsa0JBQVMsR0FBRSxDQUFDO0lBQzNCLElBQUEsZ0NBQXdCLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsTUFBTSxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3RELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFekMsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1FBQ3BCLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDhCQUE4QixVQUFVLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztRQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsSUFBQSxlQUFLLEVBQUMsWUFBWSxPQUFPLDJDQUEyQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVoQyxLQUFLLE1BQU0sT0FBTyxJQUFJLFdBQVcsRUFBRTtRQUNqQyxPQUFPLENBQUMsTUFBTSxDQUFDLDZCQUE2QixPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRXhELElBQUk7WUFDRixNQUFNLElBQUEsaUNBQW1CLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7WUFDdkUsSUFBQSxlQUFLLEVBQUMscUJBQXFCLE9BQU8sdUJBQXVCLE9BQU8sSUFBSSxDQUFDLENBQUM7U0FDdkU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztZQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLCtEQUErRCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDdkYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtLQUNGO0lBRUQsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ25CLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztJQUNoRSxJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyxTQUFTLElBQUEsY0FBSSxFQUFDLE9BQU8sQ0FBQyxzQkFBc0IsSUFBQSxjQUFJLEVBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRCxzREFBc0Q7QUFDekMsUUFBQSx3QkFBd0IsR0FBZ0Q7SUFDbkYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsMENBQTBDO0lBQ25ELFFBQVEsRUFBRSxxREFBcUQ7Q0FDaEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtTcGlubmVyfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtzZXROcG1UYWdGb3JQYWNrYWdlfSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zIHtcbiAgdGFnTmFtZTogc3RyaW5nO1xuICB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJnczogQXJndik6IEFyZ3Y8UmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiB7XG4gIHJldHVybiBhcmdzXG4gICAgLnBvc2l0aW9uYWwoJ3RhZ05hbWUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiB0aGUgTlBNIGRpc3QgdGFnLicsXG4gICAgfSlcbiAgICAucG9zaXRpb25hbCgndGFyZ2V0VmVyc2lvbicsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdWZXJzaW9uIHRvIHdoaWNoIHRoZSBkaXN0IHRhZyBzaG91bGQgYmUgc2V0LicsXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWV9ID0gYXJncztcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIGFzc2VydFZhbGlkUmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICBjb25zdCB7bnBtUGFja2FnZXMsIHB1Ymxpc2hSZWdpc3RyeX0gPSBjb25maWcucmVsZWFzZTtcbiAgY29uc3QgdmVyc2lvbiA9IHNlbXZlci5wYXJzZShyYXdWZXJzaW9uKTtcblxuICBpZiAodmVyc2lvbiA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgSW52YWxpZCB2ZXJzaW9uIHNwZWNpZmllZCAoJHtyYXdWZXJzaW9ufSkuIFVuYWJsZSB0byBzZXQgTlBNIGRpc3QgdGFnLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBkZWJ1ZyhgU2V0dGluZyBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCk7XG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcignJyk7XG5cbiAgZm9yIChjb25zdCBwa2dOYW1lIG9mIG5wbVBhY2thZ2VzKSB7XG4gICAgc3Bpbm5lci51cGRhdGUoYFNldHRpbmcgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldE5wbVRhZ0ZvclBhY2thZ2UocGtnTmFtZSwgdGFnTmFtZSwgdmVyc2lvbiEsIHB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBkZWJ1ZyhgU3VjY2Vzc2Z1bGx5IHNldCBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiLmApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke3BrZ05hbWV9XCIuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfVxuXG4gIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgaW5mbyhncmVlbihgICDinJMgICBTZXQgTlBNIGRpc3QgdGFnIGZvciBhbGwgcmVsZWFzZSBwYWNrYWdlcy5gKSk7XG4gIGluZm8oZ3JlZW4oYCAgICAgICR7Ym9sZCh0YWdOYW1lKX0gd2lsbCBub3cgcG9pbnQgdG8gJHtib2xkKGB2JHt2ZXJzaW9ufWApfS5gKSk7XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHNldHRpbmcgYW4gTlBNIGRpc3QgdGFnLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VTZXREaXN0VGFnQ29tbWFuZDogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3NldC1kaXN0LXRhZyA8dGFnLW5hbWU+IDx0YXJnZXQtdmVyc2lvbj4nLFxuICBkZXNjcmliZTogJ1NldHMgYSBnaXZlbiBOUE0gZGlzdCB0YWcgZm9yIGFsbCByZWxlYXNlIHBhY2thZ2VzLicsXG59O1xuIl19