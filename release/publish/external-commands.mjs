/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as ora from 'ora';
import { spawnWithDebugOutput } from '../../utils/child-process';
import { error, green, info, red } from '../../utils/console';
import { FatalReleaseActionError } from './actions-error';
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
export function invokeSetNpmDistCommand(npmDistTag, version) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Note: No progress indicator needed as that is the responsibility of the command.
            yield spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'set-dist-tag', npmDistTag, version.format()]);
            info(green(`  ✓   Set "${npmDistTag}" NPM dist tag for all packages to v${version}.`));
        }
        catch (e) {
            error(e);
            error(red(`  ✘   An error occurred while setting the NPM dist tag for "${npmDistTag}".`));
            throw new FatalReleaseActionError();
        }
    });
}
/**
 * Invokes the `ng-dev release build` command in order to build the release
 * packages for the currently checked out branch.
 */
export function invokeReleaseBuildCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora.call(undefined).start('Building release output.');
        try {
            // Since we expect JSON to be printed from the `ng-dev release build` command,
            // we spawn the process in silent mode. We have set up an Ora progress spinner.
            const { stdout } = yield spawnWithDebugOutput('yarn', ['--silent', 'ng-dev', 'release', 'build', '--json'], { mode: 'silent' });
            spinner.stop();
            info(green('  ✓   Built release output for all packages.'));
            // The `ng-dev release build` command prints a JSON array to stdout
            // that represents the built release packages and their output paths.
            return JSON.parse(stdout.trim());
        }
        catch (e) {
            spinner.stop();
            error(e);
            error(red('  ✘   An error occurred while building the release packages.'));
            throw new FatalReleaseActionError();
        }
    });
}
/**
 * Invokes the `yarn install` command in order to install dependencies for
 * the configured project with the currently checked out revision.
 */
export function invokeYarnInstallCommand(projectDir) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Note: No progress indicator needed as that is the responsibility of the command.
            // TODO: Consider using an Ora spinner instead to ensure minimal console output.
            yield spawnWithDebugOutput('yarn', ['install', '--frozen-lockfile', '--non-interactive'], { cwd: projectDir });
            info(green('  ✓   Installed project dependencies.'));
        }
        catch (e) {
            error(e);
            error(red('  ✘   An error occurred while installing dependencies.'));
            throw new FatalReleaseActionError();
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZXJuYWwtY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2V4dGVybmFsLWNvbW1hbmRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssR0FBRyxNQUFNLEtBQUssQ0FBQztBQUczQixPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUMvRCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFHNUQsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFeEQ7Ozs7Ozs7Ozs7Ozs7OztHQWVHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxVQUFnQix1QkFBdUIsQ0FBQyxVQUFrQixFQUFFLE9BQXNCOztRQUN0RixJQUFJO1lBQ0YsbUZBQW1GO1lBQ25GLE1BQU0sb0JBQW9CLENBQ3RCLE1BQU0sRUFBRSxDQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM3RixJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsVUFBVSx1Q0FBdUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQ3hGO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxLQUFLLENBQUMsR0FBRyxDQUFDLCtEQUErRCxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDMUYsTUFBTSxJQUFJLHVCQUF1QixFQUFFLENBQUM7U0FDckM7SUFDSCxDQUFDO0NBQUE7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQWdCLHlCQUF5Qjs7UUFDN0MsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN0RSxJQUFJO1lBQ0YsOEVBQThFO1lBQzlFLCtFQUErRTtZQUMvRSxNQUFNLEVBQUMsTUFBTSxFQUFDLEdBQUcsTUFBTSxvQkFBb0IsQ0FDdkMsTUFBTSxFQUFFLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7WUFDcEYsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7WUFDNUQsbUVBQW1FO1lBQ25FLHFFQUFxRTtZQUNyRSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFtQixDQUFDO1NBQ3BEO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDZixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDVCxLQUFLLENBQUMsR0FBRyxDQUFDLDhEQUE4RCxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLElBQUksdUJBQXVCLEVBQUUsQ0FBQztTQUNyQztJQUNILENBQUM7Q0FBQTtBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBZ0Isd0JBQXdCLENBQUMsVUFBa0I7O1FBQy9ELElBQUk7WUFDRixtRkFBbUY7WUFDbkYsZ0ZBQWdGO1lBQ2hGLE1BQU0sb0JBQW9CLENBQ3RCLE1BQU0sRUFBRSxDQUFDLFNBQVMsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLFVBQVUsRUFBQyxDQUFDLENBQUM7WUFDdEYsSUFBSSxDQUFDLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7U0FDdEQ7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNWLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNULEtBQUssQ0FBQyxHQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE1BQU0sSUFBSSx1QkFBdUIsRUFBRSxDQUFDO1NBQ3JDO0lBQ0gsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7c3Bhd25XaXRoRGVidWdPdXRwdXR9IGZyb20gJy4uLy4uL3V0aWxzL2NoaWxkLXByb2Nlc3MnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0J1aWx0UGFja2FnZX0gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcblxuLypcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICpcbiAqIFRoaXMgZmlsZSBjb250YWlucyBoZWxwZXJzIGZvciBpbnZva2luZyBleHRlcm5hbCBgbmctZGV2YCBjb21tYW5kcy4gQSBzdWJzZXQgb2YgYWN0aW9ucyxcbiAqIGxpa2UgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQgb3Igc2V0dGluZyBhzr0gTlBNIGRpc3QgdGFnIGZvciByZWxlYXNlIHBhY2thZ2VzLCBjYW5ub3QgYmVcbiAqIHBlcmZvcm1lZCBkaXJlY3RseSBhcyBwYXJ0IG9mIHRoZSByZWxlYXNlIHRvb2wgYW5kIG5lZWQgdG8gYmUgZGVsZWdhdGVkIHRvIGV4dGVybmFsIGBuZy1kZXZgXG4gKiBjb21tYW5kcyB0aGF0IGV4aXN0IGFjcm9zcyBhcmJpdHJhcnkgdmVyc2lvbiBicmFuY2hlcy5cbiAqXG4gKiBJbiBhIGNvbmNyZXRlIGV4YW1wbGU6IENvbnNpZGVyIGEgbmV3IHBhdGNoIHZlcnNpb24gaXMgcmVsZWFzZWQgYW5kIHRoYXQgYSBuZXcgcmVsZWFzZVxuICogcGFja2FnZSBoYXMgYmVlbiBhZGRlZCB0byB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIHBhdGNoIGJyYW5jaCB3aWxsIG5vdCBjb250YWluIHRoZSBuZXdcbiAqIHJlbGVhc2UgcGFja2FnZSwgc28gd2UgY291bGQgbm90IGJ1aWxkIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgaXQuIFRvIHdvcmsgYXJvdW5kIHRoaXMsIHdlXG4gKiBjYWxsIHRoZSBuZy1kZXYgYnVpbGQgY29tbWFuZCBmb3IgdGhlIHBhdGNoIHZlcnNpb24gYnJhbmNoIGFuZCBleHBlY3QgaXQgdG8gcmV0dXJuIGEgbGlzdFxuICogb2YgYnVpbHQgcGFja2FnZXMgdGhhdCBuZWVkIHRvIGJlIHJlbGVhc2VkIGFzIHBhcnQgb2YgdGhpcyByZWxlYXNlIHRyYWluLlxuICpcbiAqICMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuICovXG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIHNldC1kaXN0LXRhZ2AgY29tbWFuZCBpbiBvcmRlciB0byBzZXQgdGhlIHNwZWNpZmllZFxuICogTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgaW4gdGhlIGNoZWNrZWQgb3V0IGJyYW5jaCB0byB0aGUgZ2l2ZW4gdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVNldE5wbURpc3RDb21tYW5kKG5wbURpc3RUYWc6IHN0cmluZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICB0cnkge1xuICAgIC8vIE5vdGU6IE5vIHByb2dyZXNzIGluZGljYXRvciBuZWVkZWQgYXMgdGhhdCBpcyB0aGUgcmVzcG9uc2liaWxpdHkgb2YgdGhlIGNvbW1hbmQuXG4gICAgYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgICAgICd5YXJuJywgWyctLXNpbGVudCcsICduZy1kZXYnLCAncmVsZWFzZScsICdzZXQtZGlzdC10YWcnLCBucG1EaXN0VGFnLCB2ZXJzaW9uLmZvcm1hdCgpXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBTZXQgXCIke25wbURpc3RUYWd9XCIgTlBNIGRpc3QgdGFnIGZvciBhbGwgcGFja2FnZXMgdG8gdiR7dmVyc2lvbn0uYCkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyBmb3IgXCIke25wbURpc3RUYWd9XCIuYCkpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG5cbi8qKlxuICogSW52b2tlcyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kIGluIG9yZGVyIHRvIGJ1aWxkIHRoZSByZWxlYXNlXG4gKiBwYWNrYWdlcyBmb3IgdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCBicmFuY2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk6IFByb21pc2U8QnVpbHRQYWNrYWdlW10+IHtcbiAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoJ0J1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LicpO1xuICB0cnkge1xuICAgIC8vIFNpbmNlIHdlIGV4cGVjdCBKU09OIHRvIGJlIHByaW50ZWQgZnJvbSB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLFxuICAgIC8vIHdlIHNwYXduIHRoZSBwcm9jZXNzIGluIHNpbGVudCBtb2RlLiBXZSBoYXZlIHNldCB1cCBhbiBPcmEgcHJvZ3Jlc3Mgc3Bpbm5lci5cbiAgICBjb25zdCB7c3Rkb3V0fSA9IGF3YWl0IHNwYXduV2l0aERlYnVnT3V0cHV0KFxuICAgICAgICAneWFybicsIFsnLS1zaWxlbnQnLCAnbmctZGV2JywgJ3JlbGVhc2UnLCAnYnVpbGQnLCAnLS1qc29uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBvdXRwdXQgZm9yIGFsbCBwYWNrYWdlcy4nKSk7XG4gICAgLy8gVGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZCBwcmludHMgYSBKU09OIGFycmF5IHRvIHN0ZG91dFxuICAgIC8vIHRoYXQgcmVwcmVzZW50cyB0aGUgYnVpbHQgcmVsZWFzZSBwYWNrYWdlcyBhbmQgdGhlaXIgb3V0cHV0IHBhdGhzLlxuICAgIHJldHVybiBKU09OLnBhcnNlKHN0ZG91dC50cmltKCkpIGFzIEJ1aWx0UGFja2FnZVtdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgZXJyb3IoZSk7XG4gICAgZXJyb3IocmVkKCcgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIGJ1aWxkaW5nIHRoZSByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgfVxufVxuXG4vKipcbiAqIEludm9rZXMgdGhlIGB5YXJuIGluc3RhbGxgIGNvbW1hbmQgaW4gb3JkZXIgdG8gaW5zdGFsbCBkZXBlbmRlbmNpZXMgZm9yXG4gKiB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHdpdGggdGhlIGN1cnJlbnRseSBjaGVja2VkIG91dCByZXZpc2lvbi5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZChwcm9qZWN0RGlyOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgdHJ5IHtcbiAgICAvLyBOb3RlOiBObyBwcm9ncmVzcyBpbmRpY2F0b3IgbmVlZGVkIGFzIHRoYXQgaXMgdGhlIHJlc3BvbnNpYmlsaXR5IG9mIHRoZSBjb21tYW5kLlxuICAgIC8vIFRPRE86IENvbnNpZGVyIHVzaW5nIGFuIE9yYSBzcGlubmVyIGluc3RlYWQgdG8gZW5zdXJlIG1pbmltYWwgY29uc29sZSBvdXRwdXQuXG4gICAgYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoXG4gICAgICAgICd5YXJuJywgWydpbnN0YWxsJywgJy0tZnJvemVuLWxvY2tmaWxlJywgJy0tbm9uLWludGVyYWN0aXZlJ10sIHtjd2Q6IHByb2plY3REaXJ9KTtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEluc3RhbGxlZCBwcm9qZWN0IGRlcGVuZGVuY2llcy4nKSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlcnJvcihlKTtcbiAgICBlcnJvcihyZWQoJyAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgaW5zdGFsbGluZyBkZXBlbmRlbmNpZXMuJykpO1xuICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICB9XG59XG4iXX0=