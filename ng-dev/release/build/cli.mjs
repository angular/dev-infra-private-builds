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
    const config = config_1.getConfig();
    index_1.assertValidReleaseConfig(config);
    const { npmPackages } = config.release;
    let builtPackages = await index_2.buildReleaseOutput(true);
    // If package building failed, print an error and exit with an error code.
    if (builtPackages === null) {
        console_1.error(console_1.red(`  ✘   Could not build release output. Please check output above.`));
        process.exit(1);
    }
    // If no packages have been built, we assume that this is never correct
    // and exit with an error code.
    if (builtPackages.length === 0) {
        console_1.error(console_1.red(`  ✘   No release packages have been built. Please ensure that the`));
        console_1.error(console_1.red(`      build script is configured correctly in ".ng-dev".`));
        process.exit(1);
    }
    const missingPackages = npmPackages.filter((pkgName) => !builtPackages.find((b) => b.name === pkgName));
    // Check for configured release packages which have not been built. We want to
    // error and exit if any configured package has not been built.
    if (missingPackages.length > 0) {
        console_1.error(console_1.red(`  ✘   Release output missing for the following packages:`));
        missingPackages.forEach((pkgName) => console_1.error(console_1.red(`      - ${pkgName}`)));
        process.exit(1);
    }
    if (args.json) {
        process.stdout.write(JSON.stringify(builtPackages, null, 2));
    }
    else {
        console_1.info(console_1.green('  ✓   Built release packages.'));
        builtPackages.forEach(({ name }) => console_1.info(console_1.green(`      - ${name}`)));
    }
}
/** CLI command module for building release output. */
exports.ReleaseBuildCommandModule = {
    builder,
    handler,
    command: 'build',
    describe: 'Builds the release output for the current branch.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUE2QztBQUM3QyxpREFBNEQ7QUFDNUQsMkNBQXlEO0FBRXpELG1DQUEyQztBQU8zQyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLGlFQUFpRTtRQUM5RSxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUFvQztJQUN6RCxNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsZ0NBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsTUFBTSxFQUFDLFdBQVcsRUFBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDckMsSUFBSSxhQUFhLEdBQUcsTUFBTSwwQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVuRCwwRUFBMEU7SUFDMUUsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1FBQzFCLGVBQUssQ0FBQyxhQUFHLENBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCx1RUFBdUU7SUFDdkUsK0JBQStCO0lBQy9CLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUIsZUFBSyxDQUFDLGFBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDLENBQUM7UUFDaEYsZUFBSyxDQUFDLGFBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUVELE1BQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQ3hDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLGFBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQzdELENBQUM7SUFFRiw4RUFBOEU7SUFDOUUsK0RBQStEO0lBQy9ELElBQUksZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDOUIsZUFBSyxDQUFDLGFBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFDLENBQUM7UUFDdkUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsZUFBSyxDQUFDLGFBQUcsQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDYixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM5RDtTQUFNO1FBQ0wsY0FBSSxDQUFDLGVBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7UUFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLGNBQUksQ0FBQyxlQUFLLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRTtBQUNILENBQUM7QUFFRCxzREFBc0Q7QUFDekMsUUFBQSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsbURBQW1EO0NBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQnVpbGRPcHRpb25zIHtcbiAganNvbjogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZUJ1aWxkT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndi5vcHRpb24oJ2pzb24nLCB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgYnVpbHQgcGFja2FnZXMgc2hvdWxkIGJlIHByaW50ZWQgdG8gc3Rkb3V0IGFzIEpTT04uJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VCdWlsZE9wdGlvbnM+KSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgY29uc3Qge25wbVBhY2thZ2VzfSA9IGNvbmZpZy5yZWxlYXNlO1xuICBsZXQgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGJ1aWxkUmVsZWFzZU91dHB1dCh0cnVlKTtcblxuICAvLyBJZiBwYWNrYWdlIGJ1aWxkaW5nIGZhaWxlZCwgcHJpbnQgYW4gZXJyb3IgYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIElmIG5vIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdCwgd2UgYXNzdW1lIHRoYXQgdGhpcyBpcyBuZXZlciBjb3JyZWN0XG4gIC8vIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vIHJlbGVhc2UgcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LiBQbGVhc2UgZW5zdXJlIHRoYXQgdGhlYCkpO1xuICAgIGVycm9yKHJlZChgICAgICAgYnVpbGQgc2NyaXB0IGlzIGNvbmZpZ3VyZWQgY29ycmVjdGx5IGluIFwiLm5nLWRldlwiLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nUGFja2FnZXMgPSBucG1QYWNrYWdlcy5maWx0ZXIoXG4gICAgKHBrZ05hbWUpID0+ICFidWlsdFBhY2thZ2VzIS5maW5kKChiKSA9PiBiLm5hbWUgPT09IHBrZ05hbWUpLFxuICApO1xuXG4gIC8vIENoZWNrIGZvciBjb25maWd1cmVkIHJlbGVhc2UgcGFja2FnZXMgd2hpY2ggaGF2ZSBub3QgYmVlbiBidWlsdC4gV2Ugd2FudCB0b1xuICAvLyBlcnJvciBhbmQgZXhpdCBpZiBhbnkgY29uZmlndXJlZCBwYWNrYWdlIGhhcyBub3QgYmVlbiBidWlsdC5cbiAgaWYgKG1pc3NpbmdQYWNrYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIFJlbGVhc2Ugb3V0cHV0IG1pc3NpbmcgZm9yIHRoZSBmb2xsb3dpbmcgcGFja2FnZXM6YCkpO1xuICAgIG1pc3NpbmdQYWNrYWdlcy5mb3JFYWNoKChwa2dOYW1lKSA9PiBlcnJvcihyZWQoYCAgICAgIC0gJHtwa2dOYW1lfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgaWYgKGFyZ3MuanNvbikge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KGJ1aWx0UGFja2FnZXMsIG51bGwsIDIpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEJ1aWx0IHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIGJ1aWx0UGFja2FnZXMuZm9yRWFjaCgoe25hbWV9KSA9PiBpbmZvKGdyZWVuKGAgICAgICAtICR7bmFtZX1gKSkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VCdWlsZE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQnLFxuICBkZXNjcmliZTogJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIHRoZSBjdXJyZW50IGJyYW5jaC4nLFxufTtcbiJdfQ==