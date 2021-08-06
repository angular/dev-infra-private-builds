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
    const { npmPackages, publishRegistry } = index_1.getReleaseConfig();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBMkI7QUFDM0IsaUNBQWlDO0FBR2pDLGlEQUF5RTtBQUN6RSwyQ0FBaUQ7QUFDakQsMkRBQThEO0FBUTlELFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFJO1NBQ1IsVUFBVSxDQUFDLFNBQVMsRUFBRTtRQUNyQixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSwyQkFBMkI7S0FDekMsQ0FBQztTQUNELFVBQVUsQ0FBQyxlQUFlLEVBQUU7UUFDM0IsSUFBSSxFQUFFLFFBQVE7UUFDZCxZQUFZLEVBQUUsSUFBSTtRQUNsQixXQUFXLEVBQUUsOENBQThDO0tBQzVELENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUF5QztJQUM5RCxNQUFNLEVBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUM7SUFDbEQsTUFBTSxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsR0FBRyx3QkFBZ0IsRUFBRSxDQUFDO0lBQzFELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7SUFFekMsSUFBSSxPQUFPLEtBQUssSUFBSSxFQUFFO1FBQ3BCLGVBQUssQ0FBQyxhQUFHLENBQUMsOEJBQThCLFVBQVUsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzVDLGVBQUssQ0FBQyxZQUFZLE9BQU8sMkNBQTJDLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFFaEYsS0FBSyxNQUFNLE9BQU8sSUFBSSxXQUFXLEVBQUU7UUFDakMsT0FBTyxDQUFDLElBQUksR0FBRyw2QkFBNkIsT0FBTyxHQUFHLENBQUM7UUFDdkQsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWpCLElBQUk7WUFDRixNQUFNLGlDQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3ZFLGVBQUssQ0FBQyxxQkFBcUIsT0FBTyx1QkFBdUIsT0FBTyxJQUFJLENBQUMsQ0FBQztTQUN2RTtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsZUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ1QsZUFBSyxDQUFDLGFBQUcsQ0FBQywrREFBK0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7S0FDRjtJQUVELE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNmLGNBQUksQ0FBQyxlQUFLLENBQUMsa0RBQWtELENBQUMsQ0FBQyxDQUFDO0lBQ2hFLGNBQUksQ0FBQyxlQUFLLENBQUMsU0FBUyxjQUFJLENBQUMsT0FBTyxDQUFDLHNCQUFzQixjQUFJLENBQUMsSUFBSSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xGLENBQUM7QUFFRCxzREFBc0Q7QUFDekMsUUFBQSx3QkFBd0IsR0FBZ0Q7SUFDbkYsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsMENBQTBDO0lBQ25ELFFBQVEsRUFBRSxxREFBcUQ7Q0FDaEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtib2xkLCBkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCByZWR9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtzZXROcG1UYWdGb3JQYWNrYWdlfSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zIHtcbiAgdGFnTmFtZTogc3RyaW5nO1xuICB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJnczogQXJndik6IEFyZ3Y8UmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiB7XG4gIHJldHVybiBhcmdzXG4gICAgLnBvc2l0aW9uYWwoJ3RhZ05hbWUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTmFtZSBvZiB0aGUgTlBNIGRpc3QgdGFnLicsXG4gICAgfSlcbiAgICAucG9zaXRpb25hbCgndGFyZ2V0VmVyc2lvbicsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVtYW5kT3B0aW9uOiB0cnVlLFxuICAgICAgZGVzY3JpcHRpb246ICdWZXJzaW9uIHRvIHdoaWNoIHRoZSBkaXN0IHRhZyBzaG91bGQgYmUgc2V0LicsXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4pIHtcbiAgY29uc3Qge3RhcmdldFZlcnNpb246IHJhd1ZlcnNpb24sIHRhZ05hbWV9ID0gYXJncztcbiAgY29uc3Qge25wbVBhY2thZ2VzLCBwdWJsaXNoUmVnaXN0cnl9ID0gZ2V0UmVsZWFzZUNvbmZpZygpO1xuICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKHJhd1ZlcnNpb24pO1xuXG4gIGlmICh2ZXJzaW9uID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGBJbnZhbGlkIHZlcnNpb24gc3BlY2lmaWVkICgke3Jhd1ZlcnNpb259KS4gVW5hYmxlIHRvIHNldCBOUE0gZGlzdCB0YWcuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KCk7XG4gIGRlYnVnKGBTZXR0aW5nIFwiJHt0YWdOYW1lfVwiIE5QTSBkaXN0IHRhZyBmb3IgcmVsZWFzZSBwYWNrYWdlcyB0byB2JHt2ZXJzaW9ufS5gKTtcblxuICBmb3IgKGNvbnN0IHBrZ05hbWUgb2YgbnBtUGFja2FnZXMpIHtcbiAgICBzcGlubmVyLnRleHQgPSBgU2V0dGluZyBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiYDtcbiAgICBzcGlubmVyLnJlbmRlcigpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNldE5wbVRhZ0ZvclBhY2thZ2UocGtnTmFtZSwgdGFnTmFtZSwgdmVyc2lvbiEsIHB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBkZWJ1ZyhgU3VjY2Vzc2Z1bGx5IHNldCBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIFwiJHtwa2dOYW1lfVwiLmApO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKSk7XG4gICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgfVxuICB9XG5cbiAgc3Bpbm5lci5zdG9wKCk7XG4gIGluZm8oZ3JlZW4oYCAg4pyTICAgU2V0IE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuYCkpO1xuICBpbmZvKGdyZWVuKGAgICAgICAke2JvbGQodGFnTmFtZSl9IHdpbGwgbm93IHBvaW50IHRvICR7Ym9sZChgdiR7dmVyc2lvbn1gKX0uYCkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlU2V0RGlzdFRhZ0NvbW1hbmQ6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VTZXREaXN0VGFnT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdzZXQtZGlzdC10YWcgPHRhZy1uYW1lPiA8dGFyZ2V0LXZlcnNpb24+JyxcbiAgZGVzY3JpYmU6ICdTZXRzIGEgZ2l2ZW4gTlBNIGRpc3QgdGFnIGZvciBhbGwgcmVsZWFzZSBwYWNrYWdlcy4nLFxufTtcbiJdfQ==