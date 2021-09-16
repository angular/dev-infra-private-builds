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
const git_client_1 = require("../../utils/git/git-client");
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
    /** Git client to use for generating the release notes. */
    const git = git_client_1.GitClient.get();
    /** The ReleaseNotes instance to generate release notes. */
    const releaseNotes = await release_notes_1.ReleaseNotes.forRange(git, releaseVersion, from, to);
    if (prependToChangelog) {
        await releaseNotes.prependEntryToChangelogFile();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7R0FNRztBQUNILG1DQUE4QjtBQUc5QixpREFBeUM7QUFFekMsbURBQTZDO0FBQzdDLDJEQUFxRDtBQVdyRCxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDUixNQUFNLENBQUMsZ0JBQWdCLEVBQUU7UUFDeEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsT0FBTztRQUNoQixNQUFNLEVBQUUsQ0FBQyxPQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksZUFBTSxDQUFDLE9BQU8sQ0FBQztLQUNqRCxDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHNEQUFzRDtRQUNuRSxZQUFZLEVBQUUsSUFBSTtLQUNuQixDQUFDO1NBQ0QsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQVU7UUFDakQsT0FBTyxFQUFFLFdBQW9CO0tBQzlCLENBQUM7U0FDRCxNQUFNLENBQUMsb0JBQW9CLEVBQUU7UUFDNUIsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsS0FBSztRQUNkLFdBQVcsRUFBRSw4REFBOEQ7S0FDNUUsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQUVELDBEQUEwRDtBQUMxRCxLQUFLLFVBQVUsT0FBTyxDQUFDLEVBQUMsY0FBYyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFxQjtJQUM3RiwwREFBMEQ7SUFDMUQsTUFBTSxHQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QiwyREFBMkQ7SUFDM0QsTUFBTSxZQUFZLEdBQUcsTUFBTSw0QkFBWSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUVoRixJQUFJLGtCQUFrQixFQUFFO1FBQ3RCLE1BQU0sWUFBWSxDQUFDLDJCQUEyQixFQUFFLENBQUM7UUFDakQsSUFBQSxjQUFJLEVBQUMsNEJBQTRCLGNBQWMsb0JBQW9CLENBQUMsQ0FBQztRQUNyRSxPQUFPO0tBQ1I7SUFFRCx5Q0FBeUM7SUFDekMsTUFBTSxpQkFBaUIsR0FDckIsSUFBSSxLQUFLLFdBQVc7UUFDbEIsQ0FBQyxDQUFDLE1BQU0sWUFBWSxDQUFDLGlCQUFpQixFQUFFO1FBQ3hDLENBQUMsQ0FBQyxNQUFNLFlBQVksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBRWpELE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVELHVEQUF1RDtBQUMxQyxRQUFBLHlCQUF5QixHQUErQjtJQUNuRSxPQUFPO0lBQ1AsT0FBTztJQUNQLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFFBQVEsRUFBRSx3QkFBd0I7Q0FDbkMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge1JlbGVhc2VOb3Rlc30gZnJvbSAnLi9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zIHtcbiAgZnJvbTogc3RyaW5nO1xuICB0bzogc3RyaW5nO1xuICBwcmVwZW5kVG9DaGFuZ2Vsb2c6IGJvb2xlYW47XG4gIHJlbGVhc2VWZXJzaW9uOiBTZW1WZXI7XG4gIHR5cGU6ICdnaXRodWItcmVsZWFzZScgfCAnY2hhbmdlbG9nJztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8T3B0aW9ucz4ge1xuICByZXR1cm4gYXJndlxuICAgIC5vcHRpb24oJ3JlbGVhc2VWZXJzaW9uJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZWZhdWx0OiAnMC4wLjAnLFxuICAgICAgY29lcmNlOiAodmVyc2lvbjogc3RyaW5nKSA9PiBuZXcgU2VtVmVyKHZlcnNpb24pLFxuICAgIH0pXG4gICAgLm9wdGlvbignZnJvbScsIHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gc3RhcnQgdGhlIGNoYW5nZWxvZyBlbnRyeSBmcm9tJyxcbiAgICAgIGRlbWFuZE9wdGlvbjogdHJ1ZSxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3RvJywge1xuICAgICAgdHlwZTogJ3N0cmluZycsXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBnaXQgdGFnIG9yIHJlZiB0byBlbmQgdGhlIGNoYW5nZWxvZyBlbnRyeSB3aXRoJyxcbiAgICAgIGRlZmF1bHQ6ICdIRUFEJyxcbiAgICB9KVxuICAgIC5vcHRpb24oJ3R5cGUnLCB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnVGhlIHR5cGUgb2YgcmVsZWFzZSBub3RlcyB0byBjcmVhdGUnLFxuICAgICAgY2hvaWNlczogWydnaXRodWItcmVsZWFzZScsICdjaGFuZ2Vsb2cnXSBhcyBjb25zdCxcbiAgICAgIGRlZmF1bHQ6ICdjaGFuZ2Vsb2cnIGFzIGNvbnN0LFxuICAgIH0pXG4gICAgLm9wdGlvbigncHJlcGVuZFRvQ2hhbmdlbG9nJywge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgZGVmYXVsdDogZmFsc2UsXG4gICAgICBkZXNjcmlwdGlvbjogJ1doZXRoZXIgdG8gdXBkYXRlIHRoZSBjaGFuZ2Vsb2cgd2l0aCB0aGUgbmV3bHkgY3JlYXRlZCBlbnRyeScsXG4gICAgfSk7XG59XG5cbi8qKiBZYXJncyBjb21tYW5kIGhhbmRsZXIgZm9yIGdlbmVyYXRpbmcgcmVsZWFzZSBub3Rlcy4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoe3JlbGVhc2VWZXJzaW9uLCBmcm9tLCB0bywgcHJlcGVuZFRvQ2hhbmdlbG9nLCB0eXBlfTogQXJndW1lbnRzPE9wdGlvbnM+KSB7XG4gIC8qKiBHaXQgY2xpZW50IHRvIHVzZSBmb3IgZ2VuZXJhdGluZyB0aGUgcmVsZWFzZSBub3Rlcy4gKi9cbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICAvKiogVGhlIFJlbGVhc2VOb3RlcyBpbnN0YW5jZSB0byBnZW5lcmF0ZSByZWxlYXNlIG5vdGVzLiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZm9yUmFuZ2UoZ2l0LCByZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8pO1xuXG4gIGlmIChwcmVwZW5kVG9DaGFuZ2Vsb2cpIHtcbiAgICBhd2FpdCByZWxlYXNlTm90ZXMucHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKCk7XG4gICAgaW5mbyhgQWRkZWQgcmVsZWFzZSBub3RlcyBmb3IgXCIke3JlbGVhc2VWZXJzaW9ufVwiIHRvIHRoZSBjaGFuZ2Vsb2dgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKiogVGhlIHJlcXVlc3RlZCByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9XG4gICAgdHlwZSA9PT0gJ2NoYW5nZWxvZydcbiAgICAgID8gYXdhaXQgcmVsZWFzZU5vdGVzLmdldENoYW5nZWxvZ0VudHJ5KClcbiAgICAgIDogYXdhaXQgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpO1xuXG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHJlbGVhc2VOb3Rlc0VudHJ5KTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VOb3Rlc0NvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIE9wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnbm90ZXMnLFxuICBkZXNjcmliZTogJ0dlbmVyYXRlIHJlbGVhc2Ugbm90ZXMnLFxufTtcbiJdfQ==