/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { error, green, info, red } from '../../utils/console';
import { getReleaseConfig } from '../config/index';
import { buildReleaseOutput } from './index';
/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv) {
    return argv
        .option('json', {
        type: 'boolean',
        description: 'Whether the built packages should be printed to stdout as JSON.',
        default: false,
    })
        .option('stampForRelease', {
        type: 'boolean',
        description: 'Whether the built packages should be stamped for release.',
        default: false,
    });
}
/** Yargs command handler for building a release. */
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { npmPackages } = getReleaseConfig();
        let builtPackages = yield buildReleaseOutput(args.stampForRelease);
        // If package building failed, print an error and exit with an error code.
        if (builtPackages === null) {
            error(red(`  ✘   Could not build release output. Please check output above.`));
            process.exit(1);
        }
        // If no packages have been built, we assume that this is never correct
        // and exit with an error code.
        if (builtPackages.length === 0) {
            error(red(`  ✘   No release packages have been built. Please ensure that the`));
            error(red(`      build script is configured correctly in ".ng-dev".`));
            process.exit(1);
        }
        const missingPackages = npmPackages.filter(pkgName => !builtPackages.find(b => b.name === pkgName));
        // Check for configured release packages which have not been built. We want to
        // error and exit if any configured package has not been built.
        if (missingPackages.length > 0) {
            error(red(`  ✘   Release output missing for the following packages:`));
            missingPackages.forEach(pkgName => error(red(`      - ${pkgName}`)));
            process.exit(1);
        }
        if (args.json) {
            process.stdout.write(JSON.stringify(builtPackages, null, 2));
        }
        else {
            info(green('  ✓   Built release packages.'));
            builtPackages.forEach(({ name }) => info(green(`      - ${name}`)));
        }
    });
}
/** CLI command module for building release output. */
export const ReleaseBuildCommandModule = {
    builder,
    handler,
    command: 'build',
    describe: 'Builds the release output for the current branch.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFLSCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFlLE1BQU0scUJBQXFCLENBQUM7QUFDMUUsT0FBTyxFQUFlLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFL0QsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBUTNDLGdGQUFnRjtBQUNoRixTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNOLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZCxJQUFJLEVBQUUsU0FBUztRQUNmLFdBQVcsRUFBRSxpRUFBaUU7UUFDOUUsT0FBTyxFQUFFLEtBQUs7S0FDZixDQUFDO1NBQ0QsTUFBTSxDQUFDLGlCQUFpQixFQUFFO1FBQ3pCLElBQUksRUFBRSxTQUFTO1FBQ2YsV0FBVyxFQUFFLDJEQUEyRDtRQUN4RSxPQUFPLEVBQUUsS0FBSztLQUNmLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxvREFBb0Q7QUFDcEQsU0FBZSxPQUFPLENBQUMsSUFBb0M7O1FBQ3pELE1BQU0sRUFBQyxXQUFXLEVBQUMsR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3pDLElBQUksYUFBYSxHQUFHLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBRW5FLDBFQUEwRTtRQUMxRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7WUFDMUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDLENBQUM7WUFDL0UsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELHVFQUF1RTtRQUN2RSwrQkFBK0I7UUFDL0IsSUFBSSxhQUFhLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUM5QixLQUFLLENBQUMsR0FBRyxDQUFDLG1FQUFtRSxDQUFDLENBQUMsQ0FBQztZQUNoRixLQUFLLENBQUMsR0FBRyxDQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQztZQUN2RSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxlQUFlLEdBQ2pCLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFFakYsOEVBQThFO1FBQzlFLCtEQUErRDtRQUMvRCxJQUFJLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzlCLEtBQUssQ0FBQyxHQUFHLENBQUMsMERBQTBELENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLGVBQWUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlEO2FBQU07WUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQztZQUM3QyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25FO0lBQ0gsQ0FBQztDQUFBO0FBRUQsc0RBQXNEO0FBQ3RELE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUEyQztJQUMvRSxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFFBQVEsRUFBRSxtREFBbUQ7Q0FDOUQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgZ2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtidWlsZFJlbGVhc2VPdXRwdXR9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUJ1aWxkT3B0aW9ucyB7XG4gIGpzb246IGJvb2xlYW47XG4gIHN0YW1wRm9yUmVsZWFzZTogYm9vbGVhbjtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZUJ1aWxkT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndlxuICAgICAgLm9wdGlvbignanNvbicsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBwcmludGVkIHRvIHN0ZG91dCBhcyBKU09OLicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ3N0YW1wRm9yUmVsZWFzZScsIHtcbiAgICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdGhlIGJ1aWx0IHBhY2thZ2VzIHNob3VsZCBiZSBzdGFtcGVkIGZvciByZWxlYXNlLicsXG4gICAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoYXJnczogQXJndW1lbnRzPFJlbGVhc2VCdWlsZE9wdGlvbnM+KSB7XG4gIGNvbnN0IHtucG1QYWNrYWdlc30gPSBnZXRSZWxlYXNlQ29uZmlnKCk7XG4gIGxldCBidWlsdFBhY2thZ2VzID0gYXdhaXQgYnVpbGRSZWxlYXNlT3V0cHV0KGFyZ3Muc3RhbXBGb3JSZWxlYXNlKTtcblxuICAvLyBJZiBwYWNrYWdlIGJ1aWxkaW5nIGZhaWxlZCwgcHJpbnQgYW4gZXJyb3IgYW5kIGV4aXQgd2l0aCBhbiBlcnJvciBjb2RlLlxuICBpZiAoYnVpbHRQYWNrYWdlcyA9PT0gbnVsbCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBDb3VsZCBub3QgYnVpbGQgcmVsZWFzZSBvdXRwdXQuIFBsZWFzZSBjaGVjayBvdXRwdXQgYWJvdmUuYCkpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuXG4gIC8vIElmIG5vIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdCwgd2UgYXNzdW1lIHRoYXQgdGhpcyBpcyBuZXZlciBjb3JyZWN0XG4gIC8vIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMubGVuZ3RoID09PSAwKSB7XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vIHJlbGVhc2UgcGFja2FnZXMgaGF2ZSBiZWVuIGJ1aWx0LiBQbGVhc2UgZW5zdXJlIHRoYXQgdGhlYCkpO1xuICAgIGVycm9yKHJlZChgICAgICAgYnVpbGQgc2NyaXB0IGlzIGNvbmZpZ3VyZWQgY29ycmVjdGx5IGluIFwiLm5nLWRldlwiLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBjb25zdCBtaXNzaW5nUGFja2FnZXMgPVxuICAgICAgbnBtUGFja2FnZXMuZmlsdGVyKHBrZ05hbWUgPT4gIWJ1aWx0UGFja2FnZXMhLmZpbmQoYiA9PiBiLm5hbWUgPT09IHBrZ05hbWUpKTtcblxuICAvLyBDaGVjayBmb3IgY29uZmlndXJlZCByZWxlYXNlIHBhY2thZ2VzIHdoaWNoIGhhdmUgbm90IGJlZW4gYnVpbHQuIFdlIHdhbnQgdG9cbiAgLy8gZXJyb3IgYW5kIGV4aXQgaWYgYW55IGNvbmZpZ3VyZWQgcGFja2FnZSBoYXMgbm90IGJlZW4gYnVpbHQuXG4gIGlmIChtaXNzaW5nUGFja2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBSZWxlYXNlIG91dHB1dCBtaXNzaW5nIGZvciB0aGUgZm9sbG93aW5nIHBhY2thZ2VzOmApKTtcbiAgICBtaXNzaW5nUGFja2FnZXMuZm9yRWFjaChwa2dOYW1lID0+IGVycm9yKHJlZChgICAgICAgLSAke3BrZ05hbWV9YCkpKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICBpZiAoYXJncy5qc29uKSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoSlNPTi5zdHJpbmdpZnkoYnVpbHRQYWNrYWdlcywgbnVsbCwgMikpO1xuICB9IGVsc2Uge1xuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgQnVpbHQgcmVsZWFzZSBwYWNrYWdlcy4nKSk7XG4gICAgYnVpbHRQYWNrYWdlcy5mb3JFYWNoKCh7bmFtZX0pID0+IGluZm8oZ3JlZW4oYCAgICAgIC0gJHtuYW1lfWApKSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgYnVpbGRpbmcgcmVsZWFzZSBvdXRwdXQuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZUJ1aWxkQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgUmVsZWFzZUJ1aWxkT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdidWlsZCcsXG4gIGRlc2NyaWJlOiAnQnVpbGRzIHRoZSByZWxlYXNlIG91dHB1dCBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoLicsXG59O1xuIl19