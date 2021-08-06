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
    const { npmPackages } = index_1.getReleaseConfig();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUtILGlEQUEwRTtBQUMxRSwyQ0FBK0Q7QUFFL0QsbUNBQTJDO0FBTzNDLGdGQUFnRjtBQUNoRixTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDekIsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsaUVBQWlFO1FBQzlFLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxLQUFLLFVBQVUsT0FBTyxDQUFDLElBQW9DO0lBQ3pELE1BQU0sRUFBQyxXQUFXLEVBQUMsR0FBRyx3QkFBZ0IsRUFBRSxDQUFDO0lBQ3pDLElBQUksYUFBYSxHQUFHLE1BQU0sMEJBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbkQsMEVBQTBFO0lBQzFFLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTtRQUMxQixlQUFLLENBQUMsYUFBRyxDQUFDLGtFQUFrRSxDQUFDLENBQUMsQ0FBQztRQUMvRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsdUVBQXVFO0lBQ3ZFLCtCQUErQjtJQUMvQixJQUFJLGFBQWEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzlCLGVBQUssQ0FBQyxhQUFHLENBQUMsbUVBQW1FLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLGVBQUssQ0FBQyxhQUFHLENBQUMsMERBQTBELENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFFRCxNQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUN4QyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxhQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUM3RCxDQUFDO0lBRUYsOEVBQThFO0lBQzlFLCtEQUErRDtJQUMvRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQzlCLGVBQUssQ0FBQyxhQUFHLENBQUMsMERBQTBELENBQUMsQ0FBQyxDQUFDO1FBQ3ZFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLGVBQUssQ0FBQyxhQUFHLENBQUMsV0FBVyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2pCO0lBRUQsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQ2IsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUQ7U0FBTTtRQUNMLGNBQUksQ0FBQyxlQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDO1FBQzdDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUUsQ0FBQyxjQUFJLENBQUMsZUFBSyxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDbkU7QUFDSCxDQUFDO0FBRUQsc0RBQXNEO0FBQ3pDLFFBQUEseUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE9BQU87SUFDaEIsUUFBUSxFQUFFLG1EQUFtRDtDQUM5RCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge2J1aWxkUmVsZWFzZU91dHB1dH0gZnJvbSAnLi9pbmRleCc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQnVpbGRPcHRpb25zIHtcbiAganNvbjogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZUJ1aWxkT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndi5vcHRpb24oJ2pzb24nLCB7XG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hldGhlciB0aGUgYnVpbHQgcGFja2FnZXMgc2hvdWxkIGJlIHByaW50ZWQgdG8gc3Rkb3V0IGFzIEpTT04uJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VCdWlsZE9wdGlvbnM+KSB7XG4gIGNvbnN0IHtucG1QYWNrYWdlc30gPSBnZXRSZWxlYXNlQ29uZmlnKCk7XG4gIGxldCBidWlsdFBhY2thZ2VzID0gYXdhaXQgYnVpbGRSZWxlYXNlT3V0cHV0KHRydWUpO1xuXG4gIC8vIElmIHBhY2thZ2UgYnVpbGRpbmcgZmFpbGVkLCBwcmludCBhbiBlcnJvciBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzID09PSBudWxsKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIENvdWxkIG5vdCBidWlsZCByZWxlYXNlIG91dHB1dC4gUGxlYXNlIGNoZWNrIG91dHB1dCBhYm92ZS5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgLy8gSWYgbm8gcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LCB3ZSBhc3N1bWUgdGhhdCB0aGlzIGlzIG5ldmVyIGNvcnJlY3RcbiAgLy8gYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcy5sZW5ndGggPT09IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm8gcmVsZWFzZSBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQuIFBsZWFzZSBlbnN1cmUgdGhhdCB0aGVgKSk7XG4gICAgZXJyb3IocmVkKGAgICAgICBidWlsZCBzY3JpcHQgaXMgY29uZmlndXJlZCBjb3JyZWN0bHkgaW4gXCIubmctZGV2XCIuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIGNvbnN0IG1pc3NpbmdQYWNrYWdlcyA9IG5wbVBhY2thZ2VzLmZpbHRlcihcbiAgICAocGtnTmFtZSkgPT4gIWJ1aWx0UGFja2FnZXMhLmZpbmQoKGIpID0+IGIubmFtZSA9PT0gcGtnTmFtZSksXG4gICk7XG5cbiAgLy8gQ2hlY2sgZm9yIGNvbmZpZ3VyZWQgcmVsZWFzZSBwYWNrYWdlcyB3aGljaCBoYXZlIG5vdCBiZWVuIGJ1aWx0LiBXZSB3YW50IHRvXG4gIC8vIGVycm9yIGFuZCBleGl0IGlmIGFueSBjb25maWd1cmVkIHBhY2thZ2UgaGFzIG5vdCBiZWVuIGJ1aWx0LlxuICBpZiAobWlzc2luZ1BhY2thZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgUmVsZWFzZSBvdXRwdXQgbWlzc2luZyBmb3IgdGhlIGZvbGxvd2luZyBwYWNrYWdlczpgKSk7XG4gICAgbWlzc2luZ1BhY2thZ2VzLmZvckVhY2goKHBrZ05hbWUpID0+IGVycm9yKHJlZChgICAgICAgLSAke3BrZ05hbWV9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBpZiAoYXJncy5qc29uKSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoSlNPTi5zdHJpbmdpZnkoYnVpbHRQYWNrYWdlcywgbnVsbCwgMikpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBwYWNrYWdlcy4nKSk7XG4gICAgYnVpbHRQYWNrYWdlcy5mb3JFYWNoKCh7bmFtZX0pID0+IGluZm8oZ3JlZW4oYCAgICAgIC0gJHtuYW1lfWApKSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZUJ1aWxkT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZCcsXG4gIGRlc2NyaWJlOiAnQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoLicsXG59O1xuIl19