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
const git_client_1 = require("../../utils/git/git-client");
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
        coerce: (filePath) => (filePath ? path_1.join(process.cwd(), filePath) : undefined),
    });
}
/** Yargs command handler for generating release notes. */
async function handler({ releaseVersion, from, to, outFile, type }) {
    // Since `yargs` evaluates defaults even if a value as been provided, if no value is provided to
    // the handler, the latest semver tag on the branch is used.
    from = from || git_client_1.GitClient.get().getLatestSemverTag().format();
    /** The ReleaseNotes instance to generate release notes. */
    const releaseNotes = await release_notes_1.ReleaseNotes.fromRange(releaseVersion, from, to);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFpQztBQUNqQywrQkFBMEI7QUFDMUIsbUNBQThCO0FBRzlCLGlEQUF5QztBQUN6QywyREFBcUQ7QUFFckQsbURBQTZDO0FBVzdDLGdGQUFnRjtBQUNoRixTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNSLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN4QixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDO0tBQ2pELENBQUM7U0FDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLGtCQUFrQixFQUFFLHVCQUF1QjtLQUM1QyxDQUFDO1NBQ0QsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQVU7UUFDakQsT0FBTyxFQUFFLFdBQW9CO0tBQzlCLENBQUM7U0FDRCxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ2pCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHVEQUF1RDtRQUNwRSxNQUFNLEVBQUUsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0tBQ3RGLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCwwREFBMEQ7QUFDMUQsS0FBSyxVQUFVLE9BQU8sQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQWlDO0lBQzlGLGdHQUFnRztJQUNoRyw0REFBNEQ7SUFDNUQsSUFBSSxHQUFHLElBQUksSUFBSSxzQkFBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7SUFDN0QsMkRBQTJEO0lBQzNELE1BQU0sWUFBWSxHQUFHLE1BQU0sNEJBQVksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUU1RSx5Q0FBeUM7SUFDekMsTUFBTSxpQkFBaUIsR0FBRyxNQUFNLENBQUMsSUFBSSxLQUFLLFdBQVc7UUFDbkQsQ0FBQyxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRTtRQUNsQyxDQUFDLENBQUMsWUFBWSxDQUFDLHFCQUFxQixFQUFFLENBQUMsQ0FBQztJQUUxQyxJQUFJLE9BQU8sRUFBRTtRQUNYLGtCQUFhLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDLENBQUM7UUFDMUMsY0FBSSxDQUFDLGdDQUFnQyxjQUFjLGdCQUFnQixPQUFPLEVBQUUsQ0FBQyxDQUFDO0tBQy9FO1NBQU07UUFDTCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0tBQ3pDO0FBQ0gsQ0FBQztBQUVELHVEQUF1RDtBQUMxQyxRQUFBLHlCQUF5QixHQUEyQztJQUMvRSxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFFBQVEsRUFBRSx3QkFBd0I7Q0FDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQge1NlbVZlcn0gZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2LCBDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi9yZWxlYXNlLW5vdGVzJztcblxuLyoqIENvbW1hbmQgbGluZSBvcHRpb25zIGZvciBidWlsZGluZyBhIHJlbGVhc2UuICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VOb3Rlc09wdGlvbnMge1xuICBmcm9tPzogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBvdXRGaWxlPzogc3RyaW5nO1xuICByZWxlYXNlVmVyc2lvbjogU2VtVmVyO1xuICB0eXBlOiAnZ2l0aHViLXJlbGVhc2UnIHwgJ2NoYW5nZWxvZyc7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGJ1aWxkZXIgZm9yIGNvbmZpZ3VyaW5nIHRoZSBgbmctZGV2IHJlbGVhc2UgYnVpbGRgIGNvbW1hbmQuICovXG5mdW5jdGlvbiBidWlsZGVyKGFyZ3Y6IEFyZ3YpOiBBcmd2PFJlbGVhc2VOb3Rlc09wdGlvbnM+IHtcbiAgcmV0dXJuIGFyZ3ZcbiAgICAub3B0aW9uKCdyZWxlYXNlVmVyc2lvbicsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVmYXVsdDogJzAuMC4wJyxcbiAgICAgIGNvZXJjZTogKHZlcnNpb246IHN0cmluZykgPT4gbmV3IFNlbVZlcih2ZXJzaW9uKSxcbiAgICB9KVxuICAgIC5vcHRpb24oJ2Zyb20nLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIHN0YXJ0IHRoZSBjaGFuZ2Vsb2cgZW50cnkgZnJvbScsXG4gICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICdUaGUgbGF0ZXN0IHNlbXZlciB0YWcnLFxuICAgIH0pXG4gICAgLm9wdGlvbigndG8nLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIGdpdCB0YWcgb3IgcmVmIHRvIGVuZCB0aGUgY2hhbmdlbG9nIGVudHJ5IHdpdGgnLFxuICAgICAgZGVmYXVsdDogJ0hFQUQnLFxuICAgIH0pXG4gICAgLm9wdGlvbigndHlwZScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgdHlwZSBvZiByZWxlYXNlIG5vdGVzIHRvIGNyZWF0ZScsXG4gICAgICBjaG9pY2VzOiBbJ2dpdGh1Yi1yZWxlYXNlJywgJ2NoYW5nZWxvZyddIGFzIGNvbnN0LFxuICAgICAgZGVmYXVsdDogJ2NoYW5nZWxvZycgYXMgY29uc3QsXG4gICAgfSlcbiAgICAub3B0aW9uKCdvdXRGaWxlJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZXNjcmlwdGlvbjogJ0ZpbGUgbG9jYXRpb24gdG8gd3JpdGUgdGhlIGdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIHRvJyxcbiAgICAgIGNvZXJjZTogKGZpbGVQYXRoPzogc3RyaW5nKSA9PiAoZmlsZVBhdGggPyBqb2luKHByb2Nlc3MuY3dkKCksIGZpbGVQYXRoKSA6IHVuZGVmaW5lZCksXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3JlbGVhc2VWZXJzaW9uLCBmcm9tLCB0bywgb3V0RmlsZSwgdHlwZX06IEFyZ3VtZW50czxSZWxlYXNlTm90ZXNPcHRpb25zPikge1xuICAvLyBTaW5jZSBgeWFyZ3NgIGV2YWx1YXRlcyBkZWZhdWx0cyBldmVuIGlmIGEgdmFsdWUgYXMgYmVlbiBwcm92aWRlZCwgaWYgbm8gdmFsdWUgaXMgcHJvdmlkZWQgdG9cbiAgLy8gdGhlIGhhbmRsZXIsIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoIGlzIHVzZWQuXG4gIGZyb20gPSBmcm9tIHx8IEdpdENsaWVudC5nZXQoKS5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKTtcbiAgLyoqIFRoZSBSZWxlYXNlTm90ZXMgaW5zdGFuY2UgdG8gZ2VuZXJhdGUgcmVsZWFzZSBub3Rlcy4gKi9cbiAgY29uc3QgcmVsZWFzZU5vdGVzID0gYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShyZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8pO1xuXG4gIC8qKiBUaGUgcmVxdWVzdGVkIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIGNvbnN0IHJlbGVhc2VOb3Rlc0VudHJ5ID0gYXdhaXQgKHR5cGUgPT09ICdjaGFuZ2Vsb2cnXG4gICAgPyByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKVxuICAgIDogcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpKTtcblxuICBpZiAob3V0RmlsZSkge1xuICAgIHdyaXRlRmlsZVN5bmMob3V0RmlsZSwgcmVsZWFzZU5vdGVzRW50cnkpO1xuICAgIGluZm8oYEdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIGZvciBcIiR7cmVsZWFzZVZlcnNpb259XCIgd3JpdHRlbiB0byAke291dEZpbGV9YCk7XG4gIH0gZWxzZSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmVsZWFzZU5vdGVzRW50cnkpO1xuICB9XG59XG5cbi8qKiBDTEkgY29tbWFuZCBtb2R1bGUgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmV4cG9ydCBjb25zdCBSZWxlYXNlTm90ZXNDb21tYW5kTW9kdWxlOiBDb21tYW5kTW9kdWxlPHt9LCBSZWxlYXNlTm90ZXNPcHRpb25zPiA9IHtcbiAgYnVpbGRlcixcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ25vdGVzJyxcbiAgZGVzY3JpYmU6ICdHZW5lcmF0ZSByZWxlYXNlIG5vdGVzJyxcbn07XG4iXX0=