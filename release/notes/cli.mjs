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
import { GitClient } from '../../utils/git/git-client';
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
        from = from || GitClient.get().getLatestSemverTag().format();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUc5QixPQUFPLEVBQVEsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDaEQsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRXJELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVc3QyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDTixNQUFNLENBQ0gsZ0JBQWdCLEVBQ2hCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUN4RixNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLGtCQUFrQixFQUFFLHVCQUF1QjtLQUM1QyxDQUFDO1NBQ0QsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQVU7UUFDakQsT0FBTyxFQUFFLFdBQW9CO0tBQzlCLENBQUM7U0FDRCxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ2pCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHVEQUF1RDtRQUNwRSxNQUFNLEVBQUUsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7S0FDcEYsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELDBEQUEwRDtBQUMxRCxTQUFlLE9BQU8sQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQWlDOztRQUM5RixnR0FBZ0c7UUFDaEcsNERBQTREO1FBQzVELElBQUksR0FBRyxJQUFJLElBQUksU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0QsMkRBQTJEO1FBQzNELE1BQU0sWUFBWSxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLHlDQUF5QztRQUN6QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FDNUIsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNsQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBRWpFLElBQUksT0FBTyxFQUFFO1lBQ1gsYUFBYSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxnQ0FBZ0MsY0FBYyxnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMvRTthQUFNO1lBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUM7Q0FBQTtBQUVELHVEQUF1RDtBQUN2RCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsd0JBQXdCO0NBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2RlYnVnLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuL3JlbGVhc2Utbm90ZXMnO1xuXG4vKiogQ29tbWFuZCBsaW5lIG9wdGlvbnMgZm9yIGJ1aWxkaW5nIGEgcmVsZWFzZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZU5vdGVzT3B0aW9ucyB7XG4gIGZyb20/OiBzdHJpbmc7XG4gIHRvOiBzdHJpbmc7XG4gIG91dEZpbGU/OiBzdHJpbmc7XG4gIHJlbGVhc2VWZXJzaW9uOiBTZW1WZXI7XG4gIHR5cGU6ICdnaXRodWItcmVsZWFzZSd8J2NoYW5nZWxvZyc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VOb3Rlc09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3ZcbiAgICAgIC5vcHRpb24oXG4gICAgICAgICAgJ3JlbGVhc2VWZXJzaW9uJyxcbiAgICAgICAgICB7dHlwZTogJ3N0cmluZycsIGRlZmF1bHQ6ICcwLjAuMCcsIGNvZXJjZTogKHZlcnNpb246IHN0cmluZykgPT4gbmV3IFNlbVZlcih2ZXJzaW9uKX0pXG4gICAgICAub3B0aW9uKCdmcm9tJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gc3RhcnQgdGhlIGNoYW5nZWxvZyBlbnRyeSBmcm9tJyxcbiAgICAgICAgZGVmYXVsdERlc2NyaXB0aW9uOiAnVGhlIGxhdGVzdCBzZW12ZXIgdGFnJyxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCd0bycsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIGVuZCB0aGUgY2hhbmdlbG9nIGVudHJ5IHdpdGgnLFxuICAgICAgICBkZWZhdWx0OiAnSEVBRCcsXG4gICAgICB9KVxuICAgICAgLm9wdGlvbigndHlwZScsIHtcbiAgICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHR5cGUgb2YgcmVsZWFzZSBub3RlcyB0byBjcmVhdGUnLFxuICAgICAgICBjaG9pY2VzOiBbJ2dpdGh1Yi1yZWxlYXNlJywgJ2NoYW5nZWxvZyddIGFzIGNvbnN0LFxuICAgICAgICBkZWZhdWx0OiAnY2hhbmdlbG9nJyBhcyBjb25zdCxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCdvdXRGaWxlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGaWxlIGxvY2F0aW9uIHRvIHdyaXRlIHRoZSBnZW5lcmF0ZWQgcmVsZWFzZSBub3RlcyB0bycsXG4gICAgICAgIGNvZXJjZTogKGZpbGVQYXRoPzogc3RyaW5nKSA9PiBmaWxlUGF0aCA/IGpvaW4ocHJvY2Vzcy5jd2QoKSwgZmlsZVBhdGgpIDogdW5kZWZpbmVkXG4gICAgICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cmVsZWFzZVZlcnNpb24sIGZyb20sIHRvLCBvdXRGaWxlLCB0eXBlfTogQXJndW1lbnRzPFJlbGVhc2VOb3Rlc09wdGlvbnM+KSB7XG4gIC8vIFNpbmNlIGB5YXJnc2AgZXZhbHVhdGVzIGRlZmF1bHRzIGV2ZW4gaWYgYSB2YWx1ZSBhcyBiZWVuIHByb3ZpZGVkLCBpZiBubyB2YWx1ZSBpcyBwcm92aWRlZCB0b1xuICAvLyB0aGUgaGFuZGxlciwgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2ggaXMgdXNlZC5cbiAgZnJvbSA9IGZyb20gfHwgR2l0Q2xpZW50LmdldCgpLmdldExhdGVzdFNlbXZlclRhZygpLmZvcm1hdCgpO1xuICAvKiogVGhlIFJlbGVhc2VOb3RlcyBpbnN0YW5jZSB0byBnZW5lcmF0ZSByZWxlYXNlIG5vdGVzLiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZnJvbVJhbmdlKHJlbGVhc2VWZXJzaW9uLCBmcm9tLCB0byk7XG5cbiAgLyoqIFRoZSByZXF1ZXN0ZWQgcmVsZWFzZSBub3RlcyBlbnRyeS4gKi9cbiAgY29uc3QgcmVsZWFzZU5vdGVzRW50cnkgPSBhd2FpdCAoXG4gICAgICB0eXBlID09PSAnY2hhbmdlbG9nJyA/IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpKTtcblxuICBpZiAob3V0RmlsZSkge1xuICAgIHdyaXRlRmlsZVN5bmMob3V0RmlsZSwgcmVsZWFzZU5vdGVzRW50cnkpO1xuICAgIGluZm8oYEdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIGZvciBcIiR7cmVsZWFzZVZlcnNpb259XCIgd3JpdHRlbiB0byAke291dEZpbGV9YCk7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmVsZWFzZU5vdGVzRW50cnkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlTm90ZXNPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ25vdGVzJyxcbiAgZGVzY3JpYmU6ICdHZW5lcmF0ZSByZWxlYXNlIG5vdGVzJyxcbn07XG4iXX0=