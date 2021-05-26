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
    return argv.option('json', {
        type: 'boolean',
        description: 'Whether the built packages should be printed to stdout as JSON.',
        default: false,
    });
}
/** Yargs command handler for building a release. */
function handler(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const { npmPackages } = getReleaseConfig();
        let builtPackages = yield buildReleaseOutput(true);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvYnVpbGQvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFLSCxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFlLE1BQU0scUJBQXFCLENBQUM7QUFDMUUsT0FBTyxFQUFlLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFL0QsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBTzNDLGdGQUFnRjtBQUNoRixTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDekIsSUFBSSxFQUFFLFNBQVM7UUFDZixXQUFXLEVBQUUsaUVBQWlFO1FBQzlFLE9BQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVELG9EQUFvRDtBQUNwRCxTQUFlLE9BQU8sQ0FBQyxJQUFvQzs7UUFDekQsTUFBTSxFQUFDLFdBQVcsRUFBQyxHQUFHLGdCQUFnQixFQUFFLENBQUM7UUFDekMsSUFBSSxhQUFhLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRCwwRUFBMEU7UUFDMUUsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFO1lBQzFCLEtBQUssQ0FBQyxHQUFHLENBQUMsa0VBQWtFLENBQUMsQ0FBQyxDQUFDO1lBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCx1RUFBdUU7UUFDdkUsK0JBQStCO1FBQy9CLElBQUksYUFBYSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDOUIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDLENBQUM7WUFDaEYsS0FBSyxDQUFDLEdBQUcsQ0FBQywwREFBMEQsQ0FBQyxDQUFDLENBQUM7WUFDdkUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUVELE1BQU0sZUFBZSxHQUNqQixXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxhQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBRWpGLDhFQUE4RTtRQUM5RSwrREFBK0Q7UUFDL0QsSUFBSSxlQUFlLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUM5QixLQUFLLENBQUMsR0FBRyxDQUFDLDBEQUEwRCxDQUFDLENBQUMsQ0FBQztZQUN2RSxlQUFlLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFFRCxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDYixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUM5RDthQUFNO1lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUM7WUFDN0MsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNuRTtJQUNILENBQUM7Q0FBQTtBQUVELHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsbURBQW1EO0NBQzlELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2UsIGdldFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7YnVpbGRSZWxlYXNlT3V0cHV0fSBmcm9tICcuL2luZGV4JztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VCdWlsZE9wdGlvbnMge1xuICBqc29uOiBib29sZWFuO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlQnVpbGRPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2Lm9wdGlvbignanNvbicsIHtcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVzY3JpcHRpb246ICdXaGV0aGVyIHRoZSBidWlsdCBwYWNrYWdlcyBzaG91bGQgYmUgcHJpbnRlZCB0byBzdGRvdXQgYXMgSlNPTi4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihhcmdzOiBBcmd1bWVudHM8UmVsZWFzZUJ1aWxkT3B0aW9ucz4pIHtcbiAgY29uc3Qge25wbVBhY2thZ2VzfSA9IGdldFJlbGVhc2VDb25maWcoKTtcbiAgbGV0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBidWlsZFJlbGVhc2VPdXRwdXQodHJ1ZSk7XG5cbiAgLy8gSWYgcGFja2FnZSBidWlsZGluZyBmYWlsZWQsIHByaW50IGFuIGVycm9yIGFuZCBleGl0IHdpdGggYW4gZXJyb3IgY29kZS5cbiAgaWYgKGJ1aWx0UGFja2FnZXMgPT09IG51bGwpIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgQ291bGQgbm90IGJ1aWxkIHJlbGVhc2Ugb3V0cHV0LiBQbGVhc2UgY2hlY2sgb3V0cHV0IGFib3ZlLmApKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cblxuICAvLyBJZiBubyBwYWNrYWdlcyBoYXZlIGJlZW4gYnVpbHQsIHdlIGFzc3VtZSB0aGF0IHRoaXMgaXMgbmV2ZXIgY29ycmVjdFxuICAvLyBhbmQgZXhpdCB3aXRoIGFuIGVycm9yIGNvZGUuXG4gIGlmIChidWlsdFBhY2thZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIGVycm9yKHJlZChgICDinJggICBObyByZWxlYXNlIHBhY2thZ2VzIGhhdmUgYmVlbiBidWlsdC4gUGxlYXNlIGVuc3VyZSB0aGF0IHRoZWApKTtcbiAgICBlcnJvcihyZWQoYCAgICAgIGJ1aWxkIHNjcmlwdCBpcyBjb25maWd1cmVkIGNvcnJlY3RseSBpbiBcIi5uZy1kZXZcIi5gKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgY29uc3QgbWlzc2luZ1BhY2thZ2VzID1cbiAgICAgIG5wbVBhY2thZ2VzLmZpbHRlcihwa2dOYW1lID0+ICFidWlsdFBhY2thZ2VzIS5maW5kKGIgPT4gYi5uYW1lID09PSBwa2dOYW1lKSk7XG5cbiAgLy8gQ2hlY2sgZm9yIGNvbmZpZ3VyZWQgcmVsZWFzZSBwYWNrYWdlcyB3aGljaCBoYXZlIG5vdCBiZWVuIGJ1aWx0LiBXZSB3YW50IHRvXG4gIC8vIGVycm9yIGFuZCBleGl0IGlmIGFueSBjb25maWd1cmVkIHBhY2thZ2UgaGFzIG5vdCBiZWVuIGJ1aWx0LlxuICBpZiAobWlzc2luZ1BhY2thZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBlcnJvcihyZWQoYCAg4pyYICAgUmVsZWFzZSBvdXRwdXQgbWlzc2luZyBmb3IgdGhlIGZvbGxvd2luZyBwYWNrYWdlczpgKSk7XG4gICAgbWlzc2luZ1BhY2thZ2VzLmZvckVhY2gocGtnTmFtZSA9PiBlcnJvcihyZWQoYCAgICAgIC0gJHtwa2dOYW1lfWApKSk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG5cbiAgaWYgKGFyZ3MuanNvbikge1xuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKEpTT04uc3RyaW5naWZ5KGJ1aWx0UGFja2FnZXMsIG51bGwsIDIpKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIEJ1aWx0IHJlbGVhc2UgcGFja2FnZXMuJykpO1xuICAgIGJ1aWx0UGFja2FnZXMuZm9yRWFjaCgoe25hbWV9KSA9PiBpbmZvKGdyZWVuKGAgICAgICAtICR7bmFtZX1gKSkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGJ1aWxkaW5nIHJlbGVhc2Ugb3V0cHV0LiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VCdWlsZENvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VCdWlsZE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnYnVpbGQnLFxuICBkZXNjcmliZTogJ0J1aWxkcyB0aGUgcmVsZWFzZSBvdXRwdXQgZm9yIHRoZSBjdXJyZW50IGJyYW5jaC4nLFxufTtcbiJdfQ==