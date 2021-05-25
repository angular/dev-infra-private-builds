/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { writeFileSync } from 'fs';
import { join } from 'path';
import { SemVer } from 'semver';
import { info } from '../../utils/console';
import { GitClient } from '../../utils/git/index';
import { ReleaseNotes } from './release-notes';
/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv) {
    return argv
        .option('releaseVersion', { type: 'string', default: '0.0.0', coerce: (version) => new SemVer(version) })
        .option('from', {
        type: 'string',
        description: 'The git tag or ref to start the changelog entry from',
        defaultDescription: 'The latest semver tag',
    })
        .option('to', {
        type: 'string',
        description: 'The git tag or ref to end the changelog entry with',
        default: 'HEAD',
    })
        .option('type', {
        type: 'string',
        description: 'The type of release notes to create',
        choices: ['github-release', 'changelog'],
        default: 'changelog',
    })
        .option('outFile', {
        type: 'string',
        description: 'File location to write the generated release notes to',
        coerce: (filePath) => filePath ? join(process.cwd(), filePath) : undefined
    });
}
/** Yargs command handler for generating release notes. */
function handler({ releaseVersion, from, to, outFile, type }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Since `yargs` evaluates defaults even if a value as been provided, if no value is provided to
        // the handler, the latest semver tag on the branch is used.
        from = from || GitClient.getInstance().getLatestSemverTag().format();
        /** The ReleaseNotes instance to generate release notes. */
        const releaseNotes = yield ReleaseNotes.fromRange(releaseVersion, from, to);
        /** The requested release notes entry. */
        const releaseNotesEntry = yield (type === 'changelog' ? releaseNotes.getChangelogEntry() :
            releaseNotes.getGithubReleaseEntry());
        if (outFile) {
            writeFileSync(outFile, releaseNotesEntry);
            info(`Generated release notes for "${releaseVersion}" written to ${outFile}`);
        }
        else {
            process.stdout.write(releaseNotesEntry);
        }
    });
}
/** CLI command module for generating release notes. */
export const ReleaseNotesCommandModule = {
    builder,
    handler,
    command: 'notes',
    describe: 'Generate release notes',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUc5QixPQUFPLEVBQVEsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBRWhELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVc3QyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDTixNQUFNLENBQ0gsZ0JBQWdCLEVBQ2hCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUN4RixNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLGtCQUFrQixFQUFFLHVCQUF1QjtLQUM1QyxDQUFDO1NBQ0QsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQVU7UUFDakQsT0FBTyxFQUFFLFdBQW9CO0tBQzlCLENBQUM7U0FDRCxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ2pCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHVEQUF1RDtRQUNwRSxNQUFNLEVBQUUsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7S0FDcEYsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELDBEQUEwRDtBQUMxRCxTQUFlLE9BQU8sQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQWlDOztRQUM5RixnR0FBZ0c7UUFDaEcsNERBQTREO1FBQzVELElBQUksR0FBRyxJQUFJLElBQUksU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDckUsMkRBQTJEO1FBQzNELE1BQU0sWUFBWSxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLHlDQUF5QztRQUN6QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FDNUIsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNsQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBRWpFLElBQUksT0FBTyxFQUFFO1lBQ1gsYUFBYSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxnQ0FBZ0MsY0FBYyxnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMvRTthQUFNO1lBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUM7Q0FBQTtBQUVELHVEQUF1RDtBQUN2RCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsd0JBQXdCO0NBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuXG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi9yZWxlYXNlLW5vdGVzJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VOb3Rlc09wdGlvbnMge1xuICBmcm9tPzogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xuICByZWxlYXNlVmVyc2lvbjogU2VtVmVyO1xuICB0eXBlOiAnZ2l0aHViLXJlbGVhc2UnfCdjaGFuZ2Vsb2cnO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBidWlsZGVyIGZvciBjb25maWd1cmluZyB0aGUgYG5nLWRldiByZWxlYXNlIGJ1aWxkYCBjb21tYW5kLiAqL1xuZnVuY3Rpb24gYnVpbGRlcihhcmd2OiBBcmd2KTogQXJndjxSZWxlYXNlTm90ZXNPcHRpb25zPiB7XG4gIHJldHVybiBhcmd2XG4gICAgICAub3B0aW9uKFxuICAgICAgICAgICdyZWxlYXNlVmVyc2lvbicsXG4gICAgICAgICAge3R5cGU6ICdzdHJpbmcnLCBkZWZhdWx0OiAnMC4wLjAnLCBjb2VyY2U6ICh2ZXJzaW9uOiBzdHJpbmcpID0+IG5ldyBTZW1WZXIodmVyc2lvbil9KVxuICAgICAgLm9wdGlvbignZnJvbScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIHN0YXJ0IHRoZSBjaGFuZ2Vsb2cgZW50cnkgZnJvbScsXG4gICAgICAgIGRlZmF1bHREZXNjcmlwdGlvbjogJ1RoZSBsYXRlc3Qgc2VtdmVyIHRhZycsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbigndG8nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBnaXQgdGFnIG9yIHJlZiB0byBlbmQgdGhlIGNoYW5nZWxvZyBlbnRyeSB3aXRoJyxcbiAgICAgICAgZGVmYXVsdDogJ0hFQUQnLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ3R5cGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0eXBlIG9mIHJlbGVhc2Ugbm90ZXMgdG8gY3JlYXRlJyxcbiAgICAgICAgY2hvaWNlczogWydnaXRodWItcmVsZWFzZScsICdjaGFuZ2Vsb2cnXSBhcyBjb25zdCxcbiAgICAgICAgZGVmYXVsdDogJ2NoYW5nZWxvZycgYXMgY29uc3QsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbignb3V0RmlsZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnRmlsZSBsb2NhdGlvbiB0byB3cml0ZSB0aGUgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMgdG8nLFxuICAgICAgICBjb2VyY2U6IChmaWxlUGF0aD86IHN0cmluZykgPT4gZmlsZVBhdGggPyBqb2luKHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKSA6IHVuZGVmaW5lZFxuICAgICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3JlbGVhc2VWZXJzaW9uLCBmcm9tLCB0bywgb3V0RmlsZSwgdHlwZX06IEFyZ3VtZW50czxSZWxlYXNlTm90ZXNPcHRpb25zPikge1xuICAvLyBTaW5jZSBgeWFyZ3NgIGV2YWx1YXRlcyBkZWZhdWx0cyBldmVuIGlmIGEgdmFsdWUgYXMgYmVlbiBwcm92aWRlZCwgaWYgbm8gdmFsdWUgaXMgcHJvdmlkZWQgdG9cbiAgLy8gdGhlIGhhbmRsZXIsIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoIGlzIHVzZWQuXG4gIGZyb20gPSBmcm9tIHx8IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpLmdldExhdGVzdFNlbXZlclRhZygpLmZvcm1hdCgpO1xuICAvKiogVGhlIFJlbGVhc2VOb3RlcyBpbnN0YW5jZSB0byBnZW5lcmF0ZSByZWxlYXNlIG5vdGVzLiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZnJvbVJhbmdlKHJlbGVhc2VWZXJzaW9uLCBmcm9tLCB0byk7XG5cbiAgLyoqIFRoZSByZXF1ZXN0ZWQgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgY29uc3QgcmVsZWFzZU5vdGVzRW50cnkgPSBhd2FpdCAoXG4gICAgICB0eXBlID09PSAnY2hhbmdlbG9nJyA/IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpKTtcblxuICBpZiAob3V0RmlsZSkge1xuICAgIHdyaXRlRmlsZVN5bmMob3V0RmlsZSwgcmVsZWFzZU5vdGVzRW50cnkpO1xuICAgIGluZm8oYEdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIGZvciBcIiR7cmVsZWFzZVZlcnNpb259XCIgd3JpdHRlbiB0byAke291dEZpbGV9YCk7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmVsZWFzZU5vdGVzRW50cnkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlTm90ZXNPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ25vdGVzJyxcbiAgZGVzY3JpYmU6ICdHZW5lcmF0ZSByZWxlYXNlIG5vdGVzJyxcbn07XG4iXX0=