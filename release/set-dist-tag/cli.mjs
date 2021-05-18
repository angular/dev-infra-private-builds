/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as ora from 'ora';
import * as semver from 'semver';
import { bold, debug, error, green, info, red } from '../../utils/console';
import { getReleaseConfig } from '../config/index';
import { setNpmTagForPackage } from '../versioning/npm-publish';
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
        description: 'Version to which the dist tag should be set.'
    });
}
/** Yargs command handler for building a release. */
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { targetVersion: rawVersion, tagName } = args;
        const { npmPackages, publishRegistry } = getReleaseConfig();
        const version = semver.parse(rawVersion);
        if (version === null) {
            error(red(`Invalid version specified (${rawVersion}). Unable to set NPM dist tag.`));
            process.exit(1);
        }
        const spinner = ora.call(undefined).start();
        debug(`Setting "${tagName}" NPM dist tag for release packages to v${version}.`);
        for (const pkgName of npmPackages) {
            spinner.text = `Setting NPM dist tag for "${pkgName}"`;
            spinner.render();
            try {
                yield setNpmTagForPackage(pkgName, tagName, version, publishRegistry);
                debug(`Successfully set "${tagName}" NPM dist tag for "${pkgName}".`);
            }
            catch (e) {
                spinner.stop();
                error(e);
                error(red(`  ✘   An error occurred while setting the NPM dist tag for "${pkgName}".`));
                process.exit(1);
            }
        }
        spinner.stop();
        info(green(`  ✓   Set NPM dist tag for all release packages.`));
        info(green(`      ${bold(tagName)} will now point to ${bold(`v${version}`)}.`));
    });
}
/** CLI command module for setting an NPM dist tag. */
export const ReleaseSetDistTagCommand = {
    builder,
    handler,
    command: 'set-dist-tag <tag-name> <target-version>',
    describe: 'Sets a given NPM dist tag for all release packages.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvc2V0LWRpc3QtdGFnL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDM0IsT0FBTyxLQUFLLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFHakMsT0FBTyxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFTOUQsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDTixVQUFVLENBQUMsU0FBUyxFQUFFO1FBQ3JCLElBQUksRUFBRSxRQUFRO1FBQ2QsWUFBWSxFQUFFLElBQUk7UUFDbEIsV0FBVyxFQUFFLDJCQUEyQjtLQUN6QyxDQUFDO1NBQ0QsVUFBVSxDQUFDLGVBQWUsRUFBRTtRQUMzQixJQUFJLEVBQUUsUUFBUTtRQUNkLFlBQVksRUFBRSxJQUFJO1FBQ2xCLFdBQVcsRUFBRSw4Q0FBOEM7S0FDNUQsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxTQUFlLE9BQU8sQ0FBQyxJQUF5Qzs7UUFDOUQsTUFBTSxFQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ2xELE1BQU0sRUFBQyxXQUFXLEVBQUUsZUFBZSxFQUFDLEdBQUcsZ0JBQWdCLEVBQUUsQ0FBQztRQUMxRCxNQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXpDLElBQUksT0FBTyxLQUFLLElBQUksRUFBRTtZQUNwQixLQUFLLENBQUMsR0FBRyxDQUFDLDhCQUE4QixVQUFVLGdDQUFnQyxDQUFDLENBQUMsQ0FBQztZQUNyRixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM1QyxLQUFLLENBQUMsWUFBWSxPQUFPLDJDQUEyQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRWhGLEtBQUssTUFBTSxPQUFPLElBQUksV0FBVyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsNkJBQTZCLE9BQU8sR0FBRyxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVqQixJQUFJO2dCQUNGLE1BQU0sbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFRLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQ3ZFLEtBQUssQ0FBQyxxQkFBcUIsT0FBTyx1QkFBdUIsT0FBTyxJQUFJLENBQUMsQ0FBQzthQUN2RTtZQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNWLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDZixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ1QsS0FBSyxDQUFDLEdBQUcsQ0FBQywrREFBK0QsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN2RixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ2pCO1NBQ0Y7UUFFRCxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDZixJQUFJLENBQUMsS0FBSyxDQUFDLGtEQUFrRCxDQUFDLENBQUMsQ0FBQztRQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsSUFBSSxDQUFDLElBQUksT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQUE7QUFFRCxzREFBc0Q7QUFDdEQsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQWdEO0lBQ25GLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLDBDQUEwQztJQUNuRCxRQUFRLEVBQUUscURBQXFEO0NBQ2hFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Ym9sZCwgZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7c2V0TnBtVGFnRm9yUGFja2FnZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBzZXR0aW5nIGFuIE5QTSBkaXN0IHRhZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZVNldERpc3RUYWdPcHRpb25zIHtcbiAgdGFnTmFtZTogc3RyaW5nO1xuICB0YXJnZXRWZXJzaW9uOiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJnczogQXJndik6IEFyZ3Y8UmVsZWFzZVNldERpc3RUYWdPcHRpb25zPiB7XG4gIHJldHVybiBhcmdzXG4gICAgICAucG9zaXRpb25hbCgndGFnTmFtZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdOYW1lIG9mIHRoZSBOUE0gZGlzdCB0YWcuJyxcbiAgICAgIH0pXG4gICAgICAucG9zaXRpb25hbCgndGFyZ2V0VmVyc2lvbicsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICAgICAgZGVzY3JpcHRpb246ICdWZXJzaW9uIHRvIHdoaWNoIHRoZSBkaXN0IHRhZyBzaG91bGQgYmUgc2V0LidcbiAgICAgIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKGFyZ3M6IEFyZ3VtZW50czxSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+KSB7XG4gIGNvbnN0IHt0YXJnZXRWZXJzaW9uOiByYXdWZXJzaW9uLCB0YWdOYW1lfSA9IGFyZ3M7XG4gIGNvbnN0IHtucG1QYWNrYWdlcywgcHVibGlzaFJlZ2lzdHJ5fSA9IGdldFJlbGVhc2VDb25maWcoKTtcbiAgY29uc3QgdmVyc2lvbiA9IHNlbXZlci5wYXJzZShyYXdWZXJzaW9uKTtcblxuICBpZiAodmVyc2lvbiA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgSW52YWxpZCB2ZXJzaW9uIHNwZWNpZmllZCAoJHtyYXdWZXJzaW9ufSkuIFVuYWJsZSB0byBzZXQgTlBNIGRpc3QgdGFnLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydCgpO1xuICBkZWJ1ZyhgU2V0dGluZyBcIiR7dGFnTmFtZX1cIiBOUE0gZGlzdCB0YWcgZm9yIHJlbGVhc2UgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCk7XG5cbiAgZm9yIChjb25zdCBwa2dOYW1lIG9mIG5wbVBhY2thZ2VzKSB7XG4gICAgc3Bpbm5lci50ZXh0ID0gYFNldHRpbmcgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cImA7XG4gICAgc3Bpbm5lci5yZW5kZXIoKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZXROcG1UYWdGb3JQYWNrYWdlKHBrZ05hbWUsIHRhZ05hbWUsIHZlcnNpb24hLCBwdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgZGVidWcoYFN1Y2Nlc3NmdWxseSBzZXQgXCIke3RhZ05hbWV9XCIgTlBNIGRpc3QgdGFnIGZvciBcIiR7cGtnTmFtZX1cIi5gKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke3BrZ05hbWV9XCIuYCkpO1xuICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgIH1cbiAgfVxuXG4gIHNwaW5uZXIuc3RvcCgpO1xuICBpbmZvKGdyZWVuKGAgIOKckyAgIFNldCBOUE0gZGlzdCB0YWcgZm9yIGFsbCByZWxlYXNlIHBhY2thZ2VzLmApKTtcbiAgaW5mbyhncmVlbihgICAgICAgJHtib2xkKHRhZ05hbWUpfSB3aWxsIG5vdyBwb2ludCB0byAke2JvbGQoYHYke3ZlcnNpb259YCl9LmApKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3Igc2V0dGluZyBhbiBOUE0gZGlzdCB0YWcuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZVNldERpc3RUYWdDb21tYW5kOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlU2V0RGlzdFRhZ09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnc2V0LWRpc3QtdGFnIDx0YWctbmFtZT4gPHRhcmdldC12ZXJzaW9uPicsXG4gIGRlc2NyaWJlOiAnU2V0cyBhIGdpdmVuIE5QTSBkaXN0IHRhZyBmb3IgYWxsIHJlbGVhc2UgcGFja2FnZXMuJyxcbn07XG4iXX0=