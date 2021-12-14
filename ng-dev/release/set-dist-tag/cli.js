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
const experimental_versions_1 = require("../versioning/experimental-versions");
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
        description: 'Version to which the NPM dist tag should be set.\nThis version will be ' +
            'converted to an experimental version for experimental packages.',
    })
        .option('skipExperimentalPackages', {
        type: 'boolean',
        description: 'Whether the dist tag should not be set for experimental NPM packages.',
        default: false,
    });
}
/** Yargs command handler for setting an NPM dist tag. */
async function handler(args) {
    const { targetVersion: rawVersion, tagName, skipExperimentalPackages } = args;
    const config = (0, config_1.getConfig)();
    (0, index_1.assertValidReleaseConfig)(config);
    const { npmPackages, publishRegistry } = config.release;
    const version = semver.parse(rawVersion);
    if (version === null) {
        (0, console_1.error)((0, console_1.red)(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
        process.exit(1);
    }
    else if ((0, experimental_versions_1.isExperimentalSemver)(version)) {
        (0, console_1.error)((0, console_1.red)(`Unexpected experimental SemVer version specified. This command expects a ` +
            `non-experimental project SemVer version.`));
        process.exit(1);
    }
    (0, console_1.debug)(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
    const spinner = new spinner_1.Spinner('');
    for (const pkg of npmPackages) {
        // If `--skip-experimental-packages` is specified, all NPM packages which
        // are marked as experimental will not receive the NPM dist tag update.
        if (pkg.experimental && skipExperimentalPackages) {
            spinner.update(`Skipping "${pkg.name}" due to it being experimental.`);
            continue;
        }
        spinner.update(`Setting NPM dist tag for "${pkg.name}"`);
        const distTagVersion = pkg.experimental ? (0, experimental_versions_1.createExperimentalSemver)(version) : version;
        try {
            await (0, npm_publish_1.setNpmTagForPackage)(pkg.name, tagName, distTagVersion, publishRegistry);
            (0, console_1.debug)(`Successfully set "${tagName}" NPM dist tag for "${pkg.name}".`);
        }
        catch (e) {
            spinner.complete();
            (0, console_1.error)(e);
            (0, console_1.error)((0, console_1.red)(`  ✘   An error occurred while setting the NPM dist tag for "${pkg.name}".`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpQ0FBaUM7QUFFakMsK0NBQTZDO0FBRTdDLGlEQUF5RTtBQUN6RSxpREFBNEM7QUFDNUMsMkNBQXlEO0FBQ3pELDJEQUE4RDtBQUM5RCwrRUFBbUc7QUFTbkcsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDUixVQUFVLENBQUMsU0FBUyxFQUFFO1FBQ3JCLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLDJCQUEyQjtLQUN6QyxDQUFDO1NBQ0QsVUFBVSxDQUFDLGVBQWUsRUFBRTtRQUMzQixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsRUFDVCx5RUFBeUU7WUFDekUsaUVBQWlFO0tBQ3BFLENBQUM7U0FDRCxNQUFNLENBQUMsMEJBQTBCLEVBQUU7UUFDbEMsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsdUVBQXVFO1FBQ3BGLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELHlEQUF5RDtBQUN6RCxLQUFLLFVBQVUsT0FBTyxDQUFDLElBQXlDO0lBQzlELE1BQU0sRUFBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSx3QkFBd0IsRUFBQyxHQUFHLElBQUksQ0FBQztJQUM1RSxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUN0RCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBRXpDLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtRQUNwQixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQyw4QkFBOEIsVUFBVSxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7UUFDckYsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtTQUFNLElBQUksSUFBQSw0Q0FBb0IsRUFBQyxPQUFPLENBQUMsRUFBRTtRQUN4QyxJQUFBLGVBQUssRUFDSCxJQUFBLGFBQUcsRUFDRCwyRUFBMkU7WUFDekUsMENBQTBDLENBQzdDLENBQ0YsQ0FBQztRQUNGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFBLGVBQUssRUFBQyxZQUFZLE9BQU8sMkNBQTJDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDaEYsTUFBTSxPQUFPLEdBQUcsSUFBSSxpQkFBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRWhDLEtBQUssTUFBTSxHQUFHLElBQUksV0FBVyxFQUFFO1FBQzdCLHlFQUF5RTtRQUN6RSx1RUFBdUU7UUFDdkUsSUFBSSxHQUFHLENBQUMsWUFBWSxJQUFJLHdCQUF3QixFQUFFO1lBQ2hELE9BQU8sQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxpQ0FBaUMsQ0FBQyxDQUFDO1lBQ3ZFLFNBQVM7U0FDVjtRQUVELE9BQU8sQ0FBQyxNQUFNLENBQUMsNkJBQTZCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3pELE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLElBQUEsZ0RBQXdCLEVBQUMsT0FBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQVEsQ0FBQztRQUV4RixJQUFJO1lBQ0YsTUFBTSxJQUFBLGlDQUFtQixFQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztZQUM5RSxJQUFBLGVBQUssRUFBQyxxQkFBcUIsT0FBTyx1QkFBdUIsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7U0FDeEU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQixJQUFBLGVBQUssRUFBQyxDQUFDLENBQUMsQ0FBQztZQUNULElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLCtEQUErRCxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3hGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRjtJQUVELE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNuQixJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQyxrREFBa0QsQ0FBQyxDQUFDLENBQUM7SUFDaEUsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsU0FBUyxJQUFBLGNBQUksRUFBQyxPQUFPLENBQUMsc0JBQXNCLElBQUEsY0FBSSxFQUFDLElBQUksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNsRixDQUFDO0FBRUQsc0RBQXNEO0FBQ3pDLFFBQUEsd0JBQXdCLEdBQWdEO0lBQ25GLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDBDQUEwQztJQUNuRCxRQUFRLEVBQUUscURBQXFEO0NBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7c2V0TnBtVGFnRm9yUGFja2FnZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlciwgaXNFeHBlcmltZW50YWxTZW12ZXJ9IGZyb20gJy4uL3ZlcnNpb25pbmcvZXhwZXJpbWVudGFsLXZlcnNpb25zJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zIHtcbiAgdGFnTmFtZTogc3RyaW5nO1xuICB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG4gIHNraXBFeHBlcmltZW50YWxQYWNrYWdlczogYm9vbGVhbjtcbn1cblxuZnVuY3Rpb24gYnVpbGRlcihhcmdzOiBBcmd2KTogQXJndjxSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3NcbiAgICAucG9zaXRpb25hbCgndGFnTmFtZScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSBOUE0gZGlzdCB0YWcuJyxcbiAgICB9KVxuICAgIC5wb3NpdGlvbmFsKCd0YXJnZXRWZXJzaW9uJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgICBkZXNjcmlwdGlvbjpcbiAgICAgICAgJ1ZlcnNpb24gdG8gd2hpY2ggdGhlIE5QTSBkaXN0IHRhZyBzaG91bGQgYmUgc2V0LlxcblRoaXMgdmVyc2lvbiB3aWxsIGJlICcgK1xuICAgICAgICAnY29udmVydGVkIHRvIGFuIGV4cGVyaW1lbnRhbCB2ZXJzaW9uIGZvciBleHBlcmltZW50YWwgcGFja2FnZXMuJyxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3NraXBFeHBlcmltZW50YWxQYWNrYWdlcycsIHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgZGlzdCB0YWcgc2hvdWxkIG5vdCBiZSBzZXQgZm9yIGV4cGVyaW1lbnRhbCBOUE0gcGFja2FnZXMuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWUsIHNraXBFeHBlcmltZW50YWxQYWNrYWdlc30gPSBhcmdzO1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHtucG1QYWNrYWdlcywgcHVibGlzaFJlZ2lzdHJ5fSA9IGNvbmZpZy5yZWxlYXNlO1xuICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKHJhd1ZlcnNpb24pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGBJbnZhbGlkIHZlcnNpb24gc3BlY2lmaWVkICgke3Jhd1ZlcnNpb259KS4gVW5hYmxlIHRvIHNldCBOUE0gZGlzdCB0YWcuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfSBlbHNlIGlmIChpc0V4cGVyaW1lbnRhbFNlbXZlcih2ZXJzaW9uKSkge1xuICAgIGVycm9yKFxuICAgICAgcmVkKFxuICAgICAgICBgVW5leHBlY3RlZCBleHBlcmltZW50YWwgU2VtVmVyIHZlcnNpb24gc3BlY2lmaWVkLiBUaGlzIGNvbW1hbmQgZXhwZWN0cyBhIGAgK1xuICAgICAgICAgIGBub24tZXhwZXJpbWVudGFsIHByb2plY3QgU2VtVmVyIHZlcnNpb24uYCxcbiAgICAgICksXG4gICAgKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBkZWJ1ZyhgU2V0dGluZyBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCk7XG4gIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcignJyk7XG5cbiAgZm9yIChjb25zdCBwa2cgb2YgbnBtUGFja2FnZXMpIHtcbiAgICAvLyBJZiBgLS1za2lwLWV4cGVyaW1lbnRhbC1wYWNrYWdlc2AgaXMgc3BlY2lmaWVkLCBhbGwgTlBNIHBhY2thZ2VzIHdoaWNoXG4gICAgLy8gYXJlIG1hcmtlZCBhcyBleHBlcmltZW50YWwgd2lsbCBub3QgcmVjZWl2ZSB0aGUgTlBNIGRpc3QgdGFnIHVwZGF0ZS5cbiAgICBpZiAocGtnLmV4cGVyaW1lbnRhbCAmJiBza2lwRXhwZXJpbWVudGFsUGFja2FnZXMpIHtcbiAgICAgIHNwaW5uZXIudXBkYXRlKGBTa2lwcGluZyBcIiR7cGtnLm5hbWV9XCIgZHVlIHRvIGl0IGJlaW5nIGV4cGVyaW1lbnRhbC5gKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIHNwaW5uZXIudXBkYXRlKGBTZXR0aW5nIE5QTSBkaXN0IHRhZyBmb3IgXCIke3BrZy5uYW1lfVwiYCk7XG4gICAgY29uc3QgZGlzdFRhZ1ZlcnNpb24gPSBwa2cuZXhwZXJpbWVudGFsID8gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKHZlcnNpb24hKSA6IHZlcnNpb24hO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldE5wbVRhZ0ZvclBhY2thZ2UocGtnLm5hbWUsIHRhZ05hbWUsIGRpc3RUYWdWZXJzaW9uLCBwdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgZGVidWcoYFN1Y2Nlc3NmdWxseSBzZXQgXCIke3RhZ05hbWV9XCIgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfVxuXG4gIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgaW5mbyhncmVlbihgICDinJMgICBTZXQgTlBNIGRpc3QgdGFnIGZvciBhbGwgcmVsZWFzZSBwYWNrYWdlcy5gKSk7XG4gIGluZm8oZ3JlZW4oYCAgICAgICR7Ym9sZCh0YWdOYW1lKX0gd2lsbCBub3cgcG9pbnQgdG8gJHtib2xkKGB2JHt2ZXJzaW9ufWApfS5gKSk7XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIHNldHRpbmcgYW4gTlBNIGRpc3QgdGFnLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VTZXREaXN0VGFnQ29tbWFuZDogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ3NldC1kaXN0LXRhZyA8dGFnLW5hbWU+IDx0YXJnZXQtdmVyc2lvbj4nLFxuICBkZXNjcmliZTogJ1NldHMgYSBnaXZlbiBOUE0gZGlzdCB0YWcgZm9yIGFsbCByZWxlYXNlIHBhY2thZ2VzLicsXG59O1xuIl19