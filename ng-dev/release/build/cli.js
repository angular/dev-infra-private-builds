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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUlILCtDQUE2QztBQUM3QyxpREFBNEQ7QUFDNUQsMkNBQXlEO0FBRXpELG1DQUEyQztBQU8zQyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLGlFQUFpRTtRQUM5RSxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxJQUFvQztJQUN6RCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtCQUFTLEdBQUUsQ0FBQztJQUMzQixJQUFBLGdDQUF3QixFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sRUFBQyxXQUFXLEVBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3JDLElBQUksYUFBYSxHQUFHLE1BQU0sSUFBQSwwQkFBa0IsR0FBRSxDQUFDO0lBRS9DLDBFQUEwRTtJQUMxRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7UUFDMUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCx1RUFBdUU7SUFDdkUsK0JBQStCO0lBQy9CLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUIsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsbUVBQW1FLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsTUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FDeEMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsYUFBYyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FDN0QsQ0FBQztJQUVGLDhFQUE4RTtJQUM5RSwrREFBK0Q7SUFDL0QsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtRQUM5QixJQUFBLGVBQUssRUFBQyxJQUFBLGFBQUcsRUFBQywwREFBMEQsQ0FBQyxDQUFDLENBQUM7UUFDdkUsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsV0FBVyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUQ7U0FBTTtRQUNMLElBQUEsY0FBSSxFQUFDLElBQUEsZUFBSyxFQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztRQUM3QyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxjQUFJLEVBQUMsSUFBQSxlQUFLLEVBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRTtBQUNILENBQUM7QUFFRCxzREFBc0Q7QUFDekMsUUFBQSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsbURBQW1EO0NBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQnVpbGRPcHRpb25zIHtcbiAganNvbjogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZUJ1aWxkT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndi5vcHRpb24oJ2pzb24nLCB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgYnVpbHQgcGFja2FnZXMgc2hvdWxkIGJlIHByaW50ZWQgdG8gc3Rkb3V0IGFzIEpTT04uJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VCdWlsZE9wdGlvbnM+KSB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbmZpZygpO1xuICBhc3NlcnRWYWxpZFJlbGVhc2VDb25maWcoY29uZmlnKTtcbiAgY29uc3Qge25wbVBhY2thZ2VzfSA9IGNvbmZpZy5yZWxlYXNlO1xuICBsZXQgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGJ1aWxkUmVsZWFzZU91dHB1dCgpO1xuXG4gIC8vIElmIHBhY2thZ2UgYnVpbGRpbmcgZmFpbGVkLCBwcmludCBhbiBlcnJvciBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBidWlsZCByZWxlYXNlIG91dHB1dC4gUGxlYXNlIGNoZWNrIG91dHB1dCBhYm92ZS5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gSWYgbm8gcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LCB3ZSBhc3N1bWUgdGhhdCB0aGlzIGlzIG5ldmVyIGNvcnJlY3RcbiAgLy8gYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm8gcmVsZWFzZSBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQuIFBsZWFzZSBlbnN1cmUgdGhhdCB0aGVgKSk7XG4gICAgZXJyb3IocmVkKGAgICAgICBidWlsZCBzY3JpcHQgaXMgY29uZmlndXJlZCBjb3JyZWN0bHkgaW4gXCIubmctZGV2XCIuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IG1pc3NpbmdQYWNrYWdlcyA9IG5wbVBhY2thZ2VzLmZpbHRlcihcbiAgICAocGtnTmFtZSkgPT4gIWJ1aWx0UGFja2FnZXMhLmZpbmQoKGIpID0+IGIubmFtZSA9PT0gcGtnTmFtZSksXG4gICk7XG5cbiAgLy8gQ2hlY2sgZm9yIGNvbmZpZ3VyZWQgcmVsZWFzZSBwYWNrYWdlcyB3aGljaCBoYXZlIG5vdCBiZWVuIGJ1aWx0LiBXZSB3YW50IHRvXG4gIC8vIGVycm9yIGFuZCBleGl0IGlmIGFueSBjb25maWd1cmVkIHBhY2thZ2UgaGFzIG5vdCBiZWVuIGJ1aWx0LlxuICBpZiAobWlzc2luZ1BhY2thZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgUmVsZWFzZSBvdXRwdXQgbWlzc2luZyBmb3IgdGhlIGZvbGxvd2luZyBwYWNrYWdlczpgKSk7XG4gICAgbWlzc2luZ1BhY2thZ2VzLmZvckVhY2goKHBrZ05hbWUpID0+IGVycm9yKHJlZChgICAgICAgLSAke3BrZ05hbWV9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBpZiAoYXJncy5qc29uKSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoSlNPTi5zdHJpbmdpZnkoYnVpbHRQYWNrYWdlcywgbnVsbCwgMikpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBwYWNrYWdlcy4nKSk7XG4gICAgYnVpbHRQYWNrYWdlcy5mb3JFYWNoKCh7bmFtZX0pID0+IGluZm8oZ3JlZW4oYCAgICAgIC0gJHtuYW1lfWApKSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZUJ1aWxkT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZCcsXG4gIGRlc2NyaWJlOiAnQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoLicsXG59O1xuIl19