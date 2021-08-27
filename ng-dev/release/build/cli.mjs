"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseBuildCommandModule = void 0;
const config_1 = require("../../utils/config");
const console_1 = require("../../utils/console");
const index_1 = require("../config/index");
const index_2 = require("./index");
/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv) {
    return argv.option('json', {
        type: 'boolean',
        description: 'Whether the built packages should be printed to stdout as JSON.',
        default: false,
    });
}
/** Yargs command handler for building a release. */
async function handler(args) {
    const config = (0, config_1.getConfig)();
    (0, index_1.assertValidReleaseConfig)(config);
    const { npmPackages } = config.release;
    let builtPackages = await (0, index_2.buildReleaseOutput)(true);
    // If package building failed, print an error and exit with an error code.
    if (builtPackages === null) {
        (0, console_1.error)((0, console_1.red)(`  ✘   Could not build release output. Please check output above.`));
        process.exit(1);
    }
    // If no packages have been built, we assume that this is never correct
    // and exit with an error code.
    if (builtPackages.length === 0) {
        (0, console_1.error)((0, console_1.red)(`  ✘   No release packages have been built. Please ensure that the`));
        (0, console_1.error)((0, console_1.red)(`      build script is configured correctly in ".ng-dev".`));
        process.exit(1);
    }
    const missingPackages = npmPackages.filter((pkgName) => !builtPackages.find((b) => b.name === pkgName));
    // Check for configured release packages which have not been built. We want to
    // error and exit if any configured package has not been built.
    if (missingPackages.length > 0) {
        (0, console_1.error)((0, console_1.red)(`  ✘   Release output missing for the following packages:`));
        missingPackages.forEach((pkgName) => (0, console_1.error)((0, console_1.red)(`      - ${pkgName}`)));
        process.exit(1);
    }
    if (args.json) {
        process.stdout.write(JSON.stringify(builtPackages, null, 2));
    }
    else {
        (0, console_1.info)((0, console_1.green)('  ✓   Built release packages.'));
        builtPackages.forEach(({ name }) => (0, console_1.info)((0, console_1.green)(`      - ${name}`)));
    }
}
/** CLI command module for building release output. */
exports.ReleaseBuildCommandModule = {
    builder,
    handler,
    command: 'build',
    describe: 'Builds the release output for the current branch.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUE2QztBQUM3QyxpREFBNEQ7QUFDNUQsMkNBQXlEO0FBRXpELG1DQUEyQztBQU8zQyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLGlFQUFpRTtRQUM5RSxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUFvQztJQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sRUFBQyxXQUFXLEVBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3JDLElBQUksYUFBYSxHQUFHLE1BQU0sSUFBQSwwQkFBa0IsRUFBQyxJQUFJLENBQUMsQ0FBQztJQUVuRCwwRUFBMEU7SUFDMUUsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1FBQzFCLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLGtFQUFrRSxDQUFDLENBQUMsQ0FBQztRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLCtCQUErQjtJQUMvQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzlCLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLG1FQUFtRSxDQUFDLENBQUMsQ0FBQztRQUNoRixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQywwREFBMEQsQ0FBQyxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQ3hDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLGFBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQzdELENBQUM7SUFFRiw4RUFBOEU7SUFDOUUsK0RBQStEO0lBQy9ELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDOUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsMERBQTBELENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtRQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzlEO1NBQU07UUFDTCxJQUFBLGNBQUksRUFBQyxJQUFBLGVBQUssRUFBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkU7QUFDSCxDQUFDO0FBRUQsc0RBQXNEO0FBQ3pDLFFBQUEseUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE9BQU87SUFDaEIsUUFBUSxFQUFFLG1EQUFtRDtDQUM5RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZH0gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2Fzc2VydFZhbGlkUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtidWlsZFJlbGVhc2VPdXRwdXR9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUJ1aWxkT3B0aW9ucyB7XG4gIGpzb246IGJvb2xlYW47XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VCdWlsZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3Yub3B0aW9uKCdqc29uJywge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBwcmludGVkIHRvIHN0ZG91dCBhcyBKU09OLicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKGFyZ3M6IEFyZ3VtZW50czxSZWxlYXNlQnVpbGRPcHRpb25zPikge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHtucG1QYWNrYWdlc30gPSBjb25maWcucmVsZWFzZTtcbiAgbGV0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQodHJ1ZSk7XG5cbiAgLy8gSWYgcGFja2FnZSBidWlsZGluZyBmYWlsZWQsIHByaW50IGFuIGVycm9yIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGJ1aWxkIHJlbGVhc2Ugb3V0cHV0LiBQbGVhc2UgY2hlY2sgb3V0cHV0IGFib3ZlLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBJZiBubyBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQsIHdlIGFzc3VtZSB0aGF0IHRoaXMgaXMgbmV2ZXIgY29ycmVjdFxuICAvLyBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBObyByZWxlYXNlIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdC4gUGxlYXNlIGVuc3VyZSB0aGF0IHRoZWApKTtcbiAgICBlcnJvcihyZWQoYCAgICAgIGJ1aWxkIHNjcmlwdCBpcyBjb25maWd1cmVkIGNvcnJlY3RseSBpbiBcIi5uZy1kZXZcIi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgbWlzc2luZ1BhY2thZ2VzID0gbnBtUGFja2FnZXMuZmlsdGVyKFxuICAgIChwa2dOYW1lKSA9PiAhYnVpbHRQYWNrYWdlcyEuZmluZCgoYikgPT4gYi5uYW1lID09PSBwa2dOYW1lKSxcbiAgKTtcblxuICAvLyBDaGVjayBmb3IgY29uZmlndXJlZCByZWxlYXNlIHBhY2thZ2VzIHdoaWNoIGhhdmUgbm90IGJlZW4gYnVpbHQuIFdlIHdhbnQgdG9cbiAgLy8gZXJyb3IgYW5kIGV4aXQgaWYgYW55IGNvbmZpZ3VyZWQgcGFja2FnZSBoYXMgbm90IGJlZW4gYnVpbHQuXG4gIGlmIChtaXNzaW5nUGFja2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBSZWxlYXNlIG91dHB1dCBtaXNzaW5nIGZvciB0aGUgZm9sbG93aW5nIHBhY2thZ2VzOmApKTtcbiAgICBtaXNzaW5nUGFja2FnZXMuZm9yRWFjaCgocGtnTmFtZSkgPT4gZXJyb3IocmVkKGAgICAgICAtICR7cGtnTmFtZX1gKSkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGlmIChhcmdzLmpzb24pIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShKU09OLnN0cmluZ2lmeShidWlsdFBhY2thZ2VzLCBudWxsLCAyKSk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhncmVlbignICDinJMgICBCdWlsdCByZWxlYXNlIHBhY2thZ2VzLicpKTtcbiAgICBidWlsdFBhY2thZ2VzLmZvckVhY2goKHtuYW1lfSkgPT4gaW5mbyhncmVlbihgICAgICAgLSAke25hbWV9YCkpKTtcbiAgfVxufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBidWlsZGluZyByZWxlYXNlIG91dHB1dC4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlQnVpbGRDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlQnVpbGRPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2J1aWxkJyxcbiAgZGVzY3JpYmU6ICdCdWlsZHMgdGhlIHJlbGVhc2Ugb3V0cHV0IGZvciB0aGUgY3VycmVudCBicmFuY2guJyxcbn07XG4iXX0=