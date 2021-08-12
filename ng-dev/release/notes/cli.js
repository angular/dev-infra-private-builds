"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseNotesCommandModule = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const semver_1 = require("semver");
const console_1 = require("../../utils/console");
const release_notes_1 = require("./release-notes");
/** Yargs command builder for configuring the `ng-dev release build` command. */
function builder(argv) {
    return argv
        .option('releaseVersion', {
        type: 'string',
        default: '0.0.0',
        coerce: (version) => new semver_1.SemVer(version),
    })
        .option('from', {
        type: 'string',
        description: 'The git tag or ref to start the changelog entry from',
        demandOption: true,
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
        coerce: (filePath) => (filePath ? path_1.join(process.cwd(), filePath) : undefined),
    });
}
/** Yargs command handler for generating release notes. */
async function handler({ releaseVersion, from, to, outFile, type }) {
    /** The ReleaseNotes instance to generate release notes. */
    const releaseNotes = await release_notes_1.ReleaseNotes.forRange(releaseVersion, from, to);
    /** The requested release notes entry. */
    const releaseNotesEntry = await (type === 'changelog'
        ? releaseNotes.getChangelogEntry()
        : releaseNotes.getGithubReleaseEntry());
    if (outFile) {
        fs_1.writeFileSync(outFile, releaseNotesEntry);
        console_1.info(`Generated release notes for "${releaseVersion}" written to ${outFile}`);
    }
    else {
        process.stdout.write(releaseNotesEntry);
    }
}
/** CLI command module for generating release notes. */
exports.ReleaseNotesCommandModule = {
    builder,
    handler,
    command: 'notes',
    describe: 'Generate release notes',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFpQztBQUNqQywrQkFBMEI7QUFDMUIsbUNBQThCO0FBRzlCLGlEQUF5QztBQUV6QyxtREFBNkM7QUFXN0MsZ0ZBQWdGO0FBQ2hGLFNBQVMsT0FBTyxDQUFDLElBQVU7SUFDekIsT0FBTyxJQUFJO1NBQ1IsTUFBTSxDQUFDLGdCQUFnQixFQUFFO1FBQ3hCLElBQUksRUFBRSxRQUFRO1FBQ2QsT0FBTyxFQUFFLE9BQU87UUFDaEIsTUFBTSxFQUFFLENBQUMsT0FBZSxFQUFFLEVBQUUsQ0FBQyxJQUFJLGVBQU0sQ0FBQyxPQUFPLENBQUM7S0FDakQsQ0FBQztTQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZCxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxzREFBc0Q7UUFDbkUsWUFBWSxFQUFFLElBQUk7S0FDbkIsQ0FBQztTQUNELE1BQU0sQ0FBQyxJQUFJLEVBQUU7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxvREFBb0Q7UUFDakUsT0FBTyxFQUFFLE1BQU07S0FDaEIsQ0FBQztTQUNELE1BQU0sQ0FBQyxNQUFNLEVBQUU7UUFDZCxJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSxxQ0FBcUM7UUFDbEQsT0FBTyxFQUFFLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxDQUFVO1FBQ2pELE9BQU8sRUFBRSxXQUFvQjtLQUM5QixDQUFDO1NBQ0QsTUFBTSxDQUFDLFNBQVMsRUFBRTtRQUNqQixJQUFJLEVBQUUsUUFBUTtRQUNkLFdBQVcsRUFBRSx1REFBdUQ7UUFDcEUsTUFBTSxFQUFFLENBQUMsUUFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztLQUN0RixDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFpQztJQUM5RiwyREFBMkQ7SUFDM0QsTUFBTSxZQUFZLEdBQUcsTUFBTSw0QkFBWSxDQUFDLFFBQVEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBRTNFLHlDQUF5QztJQUN6QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxJQUFJLEtBQUssV0FBVztRQUNuRCxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFO1FBQ2xDLENBQUMsQ0FBQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO0lBRTFDLElBQUksT0FBTyxFQUFFO1FBQ1gsa0JBQWEsQ0FBQyxPQUFPLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztRQUMxQyxjQUFJLENBQUMsZ0NBQWdDLGNBQWMsZ0JBQWdCLE9BQU8sRUFBRSxDQUFDLENBQUM7S0FDL0U7U0FBTTtRQUNMLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7S0FDekM7QUFDSCxDQUFDO0FBRUQsdURBQXVEO0FBQzFDLFFBQUEseUJBQXlCLEdBQTJDO0lBQy9FLE9BQU87SUFDUCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE9BQU87SUFDaEIsUUFBUSxFQUFFLHdCQUF3QjtDQUNuQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7d3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4vcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlTm90ZXNPcHRpb25zIHtcbiAgZnJvbTogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xuICByZWxlYXNlVmVyc2lvbjogU2VtVmVyO1xuICB0eXBlOiAnZ2l0aHViLXJlbGVhc2UnIHwgJ2NoYW5nZWxvZyc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VOb3Rlc09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3ZcbiAgICAub3B0aW9uKCdyZWxlYXNlVmVyc2lvbicsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJzAuMC4wJyxcbiAgICAgIGNvZXJjZTogKHZlcnNpb246IHN0cmluZykgPT4gbmV3IFNlbVZlcih2ZXJzaW9uKSxcbiAgICB9KVxuICAgIC5vcHRpb24oJ2Zyb20nLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIHN0YXJ0IHRoZSBjaGFuZ2Vsb2cgZW50cnkgZnJvbScsXG4gICAgICBkZW1hbmRPcHRpb246IHRydWUsXG4gICAgfSlcbiAgICAub3B0aW9uKCd0bycsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gZW5kIHRoZSBjaGFuZ2Vsb2cgZW50cnkgd2l0aCcsXG4gICAgICBkZWZhdWx0OiAnSEVBRCcsXG4gICAgfSlcbiAgICAub3B0aW9uKCd0eXBlJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSB0eXBlIG9mIHJlbGVhc2Ugbm90ZXMgdG8gY3JlYXRlJyxcbiAgICAgIGNob2ljZXM6IFsnZ2l0aHViLXJlbGVhc2UnLCAnY2hhbmdlbG9nJ10gYXMgY29uc3QsXG4gICAgICBkZWZhdWx0OiAnY2hhbmdlbG9nJyBhcyBjb25zdCxcbiAgICB9KVxuICAgIC5vcHRpb24oJ291dEZpbGUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnRmlsZSBsb2NhdGlvbiB0byB3cml0ZSB0aGUgZ2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMgdG8nLFxuICAgICAgY29lcmNlOiAoZmlsZVBhdGg/OiBzdHJpbmcpID0+IChmaWxlUGF0aCA/IGpvaW4ocHJvY2Vzcy5jd2QoKSwgZmlsZVBhdGgpIDogdW5kZWZpbmVkKSxcbiAgICB9KTtcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgaGFuZGxlciBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcih7cmVsZWFzZVZlcnNpb24sIGZyb20sIHRvLCBvdXRGaWxlLCB0eXBlfTogQXJndW1lbnRzPFJlbGVhc2VOb3Rlc09wdGlvbnM+KSB7XG4gIC8qKiBUaGUgUmVsZWFzZU5vdGVzIGluc3RhbmNlIHRvIGdlbmVyYXRlIHJlbGVhc2Ugbm90ZXMuICovXG4gIGNvbnN0IHJlbGVhc2VOb3RlcyA9IGF3YWl0IFJlbGVhc2VOb3Rlcy5mb3JSYW5nZShyZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8pO1xuXG4gIC8qKiBUaGUgcmVxdWVzdGVkIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIGNvbnN0IHJlbGVhc2VOb3Rlc0VudHJ5ID0gYXdhaXQgKHR5cGUgPT09ICdjaGFuZ2Vsb2cnXG4gICAgPyByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKVxuICAgIDogcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpKTtcblxuICBpZiAob3V0RmlsZSkge1xuICAgIHdyaXRlRmlsZVN5bmMob3V0RmlsZSwgcmVsZWFzZU5vdGVzRW50cnkpO1xuICAgIGluZm8oYEdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIGZvciBcIiR7cmVsZWFzZVZlcnNpb259XCIgd3JpdHRlbiB0byAke291dEZpbGV9YCk7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmVsZWFzZU5vdGVzRW50cnkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlTm90ZXNPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ25vdGVzJyxcbiAgZGVzY3JpYmU6ICdHZW5lcmF0ZSByZWxlYXNlIG5vdGVzJyxcbn07XG4iXX0=