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
    let builtPackages = await (0, index_2.buildReleaseOutput)();
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
    const missingPackages = npmPackages.filter((pkg) => !builtPackages.find((b) => b.name === pkg.name));
    // Check for configured release packages which have not been built. We want to
    // error and exit if any configured package has not been built.
    if (missingPackages.length > 0) {
        (0, console_1.error)((0, console_1.red)(`  ✘   Release output missing for the following packages:`));
        missingPackages.forEach((pkg) => (0, console_1.error)((0, console_1.red)(`      - ${pkg.name}`)));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUE2QztBQUM3QyxpREFBNEQ7QUFDNUQsMkNBQXVFO0FBRXZFLG1DQUEyQztBQWUzQyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLGlFQUFpRTtRQUM5RSxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUFvQztJQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sRUFBQyxXQUFXLEVBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3JDLElBQUksYUFBYSxHQUFHLE1BQU0sSUFBQSwwQkFBa0IsR0FBRSxDQUFDO0lBRS9DLDBFQUEwRTtJQUMxRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7UUFDMUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCx1RUFBdUU7SUFDdkUsK0JBQStCO0lBQy9CLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsbUVBQW1FLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FDeEMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsYUFBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQzFELENBQUM7SUFFRiw4RUFBOEU7SUFDOUUsK0RBQStEO0lBQy9ELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDOUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsMERBQTBELENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLFdBQVcsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDYixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUF5QixhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdEY7U0FBTTtRQUNMLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztRQUM3QyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRTtBQUNILENBQUM7QUFFRCxzREFBc0Q7QUFDekMsUUFBQSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsbURBQW1EO0NBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnLCBCdWlsdFBhY2thZ2V9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7YnVpbGRSZWxlYXNlT3V0cHV0fSBmcm9tICcuL2luZGV4JztcblxuLyoqXG4gKiBUeXBlIGRlc2NyaWJpbmcgdGhlIEpTT04gb3V0cHV0IG9mIHRoaXMgY29tbWFuZC5cbiAqXG4gKiBAaW1wb3J0YW50IFdoZW4gY2hhbmdpbmcgdGhpcywgbWFrZSBzdXJlIHRoZSByZWxlYXNlIGFjdGlvblxuICogICBpbnZvY2F0aW9uIGlzIHVwZGF0ZWQgYXMgd2VsbC5cbiAqL1xuZXhwb3J0IHR5cGUgUmVsZWFzZUJ1aWxkSnNvblN0ZG91dCA9IEJ1aWx0UGFja2FnZVtdO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUJ1aWxkT3B0aW9ucyB7XG4gIGpzb246IGJvb2xlYW47XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VCdWlsZE9wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3Yub3B0aW9uKCdqc29uJywge1xuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBwcmludGVkIHRvIHN0ZG91dCBhcyBKU09OLicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKGFyZ3M6IEFyZ3VtZW50czxSZWxlYXNlQnVpbGRPcHRpb25zPikge1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIGNvbnN0IHtucG1QYWNrYWdlc30gPSBjb25maWcucmVsZWFzZTtcbiAgbGV0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQoKTtcblxuICAvLyBJZiBwYWNrYWdlIGJ1aWxkaW5nIGZhaWxlZCwgcHJpbnQgYW4gZXJyb3IgYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIElmIG5vIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdCwgd2UgYXNzdW1lIHRoYXQgdGhpcyBpcyBuZXZlciBjb3JyZWN0XG4gIC8vIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vIHJlbGVhc2UgcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LiBQbGVhc2UgZW5zdXJlIHRoYXQgdGhlYCkpO1xuICAgIGVycm9yKHJlZChgICAgICAgYnVpbGQgc2NyaXB0IGlzIGNvbmZpZ3VyZWQgY29ycmVjdGx5IGluIFwiLm5nLWRldlwiLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nUGFja2FnZXMgPSBucG1QYWNrYWdlcy5maWx0ZXIoXG4gICAgKHBrZykgPT4gIWJ1aWx0UGFja2FnZXMhLmZpbmQoKGIpID0+IGIubmFtZSA9PT0gcGtnLm5hbWUpLFxuICApO1xuXG4gIC8vIENoZWNrIGZvciBjb25maWd1cmVkIHJlbGVhc2UgcGFja2FnZXMgd2hpY2ggaGF2ZSBub3QgYmVlbiBidWlsdC4gV2Ugd2FudCB0b1xuICAvLyBlcnJvciBhbmQgZXhpdCBpZiBhbnkgY29uZmlndXJlZCBwYWNrYWdlIGhhcyBub3QgYmVlbiBidWlsdC5cbiAgaWYgKG1pc3NpbmdQYWNrYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIFJlbGVhc2Ugb3V0cHV0IG1pc3NpbmcgZm9yIHRoZSBmb2xsb3dpbmcgcGFja2FnZXM6YCkpO1xuICAgIG1pc3NpbmdQYWNrYWdlcy5mb3JFYWNoKChwa2cpID0+IGVycm9yKHJlZChgICAgICAgLSAke3BrZy5uYW1lfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgaWYgKGFyZ3MuanNvbikge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KDxSZWxlYXNlQnVpbGRKc29uU3Rkb3V0PmJ1aWx0UGFja2FnZXMsIG51bGwsIDIpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEJ1aWx0IHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIGJ1aWx0UGFja2FnZXMuZm9yRWFjaCgoe25hbWV9KSA9PiBpbmZvKGdyZWVuKGAgICAgICAtICR7bmFtZX1gKSkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VCdWlsZE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQnLFxuICBkZXNjcmliZTogJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIHRoZSBjdXJyZW50IGJyYW5jaC4nLFxufTtcbiJdfQ==