"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseNotesCommandModule = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
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
        .option('prependToChangelog', {
        type: 'boolean',
        default: false,
        description: 'Whether to update the changelog with the newly created entry',
    });
}
/** Yargs command handler for generating release notes. */
async function handler({ releaseVersion, from, to, prependToChangelog, type }) {
    /** The ReleaseNotes instance to generate release notes. */
    const releaseNotes = await release_notes_1.ReleaseNotes.forRange(releaseVersion, from, to);
    if (prependToChangelog) {
        await releaseNotes.prependEntryToChangelog();
        (0, console_1.info)(`Added release notes for "${releaseVersion}" to the changelog`);
        return;
    }
    /** The requested release notes entry. */
    const releaseNotesEntry = type === 'changelog'
        ? await releaseNotes.getChangelogEntry()
        : await releaseNotes.getGithubReleaseEntry();
    process.stdout.write(releaseNotesEntry);
}
/** CLI command module for generating release notes. */
exports.ReleaseNotesCommandModule = {
    builder,
    handler,
    command: 'notes',
    describe: 'Generate release notes',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7R0FNRztBQUNILG1DQUE4QjtBQUc5QixpREFBeUM7QUFFekMsbURBQTZDO0FBVzdDLGdGQUFnRjtBQUNoRixTQUFTLE9BQU8sQ0FBQyxJQUFVO0lBQ3pCLE9BQU8sSUFBSTtTQUNSLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRTtRQUN4QixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxPQUFPO1FBQ2hCLE1BQU0sRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxlQUFNLENBQUMsT0FBTyxDQUFDO0tBQ2pELENBQUM7U0FDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLFlBQVksRUFBRSxJQUFJO0tBQ25CLENBQUM7U0FDRCxNQUFNLENBQUMsSUFBSSxFQUFFO1FBQ1osSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsb0RBQW9EO1FBQ2pFLE9BQU8sRUFBRSxNQUFNO0tBQ2hCLENBQUM7U0FDRCxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUscUNBQXFDO1FBQ2xELE9BQU8sRUFBRSxDQUFDLGdCQUFnQixFQUFFLFdBQVcsQ0FBVTtRQUNqRCxPQUFPLEVBQUUsV0FBb0I7S0FDOUIsQ0FBQztTQUNELE1BQU0sQ0FBQyxvQkFBb0IsRUFBRTtRQUM1QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxLQUFLO1FBQ2QsV0FBVyxFQUFFLDhEQUE4RDtLQUM1RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQsMERBQTBEO0FBQzFELEtBQUssVUFBVSxPQUFPLENBQUMsRUFBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQXFCO0lBQzdGLDJEQUEyRDtJQUMzRCxNQUFNLFlBQVksR0FBRyxNQUFNLDRCQUFZLENBQUMsUUFBUSxDQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFFM0UsSUFBSSxrQkFBa0IsRUFBRTtRQUN0QixNQUFNLFlBQVksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO1FBQzdDLElBQUEsY0FBSSxFQUFDLDRCQUE0QixjQUFjLG9CQUFvQixDQUFDLENBQUM7UUFDckUsT0FBTztLQUNSO0lBRUQseUNBQXlDO0lBQ3pDLE1BQU0saUJBQWlCLEdBQ3JCLElBQUksS0FBSyxXQUFXO1FBQ2xCLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxpQkFBaUIsRUFBRTtRQUN4QyxDQUFDLENBQUMsTUFBTSxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQztJQUVqRCxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzFDLENBQUM7QUFFRCx1REFBdUQ7QUFDMUMsUUFBQSx5QkFBeUIsR0FBK0I7SUFDbkUsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsd0JBQXdCO0NBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7U2VtVmVyfSBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtBcmd1bWVudHMsIEFyZ3YsIENvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4vcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgZnJvbTogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBwcmVwZW5kVG9DaGFuZ2Vsb2c6IGJvb2xlYW47XG4gIHJlbGVhc2VWZXJzaW9uOiBTZW1WZXI7XG4gIHR5cGU6ICdnaXRodWItcmVsZWFzZScgfCAnY2hhbmdlbG9nJztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8T3B0aW9ucz4ge1xuICByZXR1cm4gYXJndlxuICAgIC5vcHRpb24oJ3JlbGVhc2VWZXJzaW9uJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnMC4wLjAnLFxuICAgICAgY29lcmNlOiAodmVyc2lvbjogc3RyaW5nKSA9PiBuZXcgU2VtVmVyKHZlcnNpb24pLFxuICAgIH0pXG4gICAgLm9wdGlvbignZnJvbScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gc3RhcnQgdGhlIGNoYW5nZWxvZyBlbnRyeSBmcm9tJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3RvJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBnaXQgdGFnIG9yIHJlZiB0byBlbmQgdGhlIGNoYW5nZWxvZyBlbnRyeSB3aXRoJyxcbiAgICAgIGRlZmF1bHQ6ICdIRUFEJyxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3R5cGUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHR5cGUgb2YgcmVsZWFzZSBub3RlcyB0byBjcmVhdGUnLFxuICAgICAgY2hvaWNlczogWydnaXRodWItcmVsZWFzZScsICdjaGFuZ2Vsb2cnXSBhcyBjb25zdCxcbiAgICAgIGRlZmF1bHQ6ICdjaGFuZ2Vsb2cnIGFzIGNvbnN0LFxuICAgIH0pXG4gICAgLm9wdGlvbigncHJlcGVuZFRvQ2hhbmdlbG9nJywge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gdXBkYXRlIHRoZSBjaGFuZ2Vsb2cgd2l0aCB0aGUgbmV3bHkgY3JlYXRlZCBlbnRyeScsXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3JlbGVhc2VWZXJzaW9uLCBmcm9tLCB0bywgcHJlcGVuZFRvQ2hhbmdlbG9nLCB0eXBlfTogQXJndW1lbnRzPE9wdGlvbnM+KSB7XG4gIC8qKiBUaGUgUmVsZWFzZU5vdGVzIGluc3RhbmNlIHRvIGdlbmVyYXRlIHJlbGVhc2Ugbm90ZXMuICovXG4gIGNvbnN0IHJlbGVhc2VOb3RlcyA9IGF3YWl0IFJlbGVhc2VOb3Rlcy5mb3JSYW5nZShyZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8pO1xuXG4gIGlmIChwcmVwZW5kVG9DaGFuZ2Vsb2cpIHtcbiAgICBhd2FpdCByZWxlYXNlTm90ZXMucHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2coKTtcbiAgICBpbmZvKGBBZGRlZCByZWxlYXNlIG5vdGVzIGZvciBcIiR7cmVsZWFzZVZlcnNpb259XCIgdG8gdGhlIGNoYW5nZWxvZ2ApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKiBUaGUgcmVxdWVzdGVkIHJlbGVhc2Ugbm90ZXMgZW50cnkuICovXG4gIGNvbnN0IHJlbGVhc2VOb3Rlc0VudHJ5ID1cbiAgICB0eXBlID09PSAnY2hhbmdlbG9nJ1xuICAgICAgPyBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKVxuICAgICAgOiBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk7XG5cbiAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocmVsZWFzZU5vdGVzRW50cnkpO1xufVxuXG4vKiogQ0xJIGNvbW1hbmQgbW9kdWxlIGZvciBnZW5lcmF0aW5nIHJlbGVhc2Ugbm90ZXMuICovXG5leHBvcnQgY29uc3QgUmVsZWFzZU5vdGVzQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZTx7fSwgT3B0aW9ucz4gPSB7XG4gIGJ1aWxkZXIsXG4gIGhhbmRsZXIsXG4gIGNvbW1hbmQ6ICdub3RlcycsXG4gIGRlc2NyaWJlOiAnR2VuZXJhdGUgcmVsZWFzZSBub3RlcycsXG59O1xuIl19