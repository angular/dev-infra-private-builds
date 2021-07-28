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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2Uvbm90ZXMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sSUFBSSxDQUFDO0FBQ2pDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDMUIsT0FBTyxFQUFDLE1BQU0sRUFBQyxNQUFNLFFBQVEsQ0FBQztBQUc5QixPQUFPLEVBQUMsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDekMsT0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLDRCQUE0QixDQUFDO0FBRXJELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVc3QyxnRkFBZ0Y7QUFDaEYsU0FBUyxPQUFPLENBQUMsSUFBVTtJQUN6QixPQUFPLElBQUk7U0FDTixNQUFNLENBQ0gsZ0JBQWdCLEVBQ2hCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDLE9BQWUsRUFBRSxFQUFFLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQztTQUN4RixNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxFQUFFLFFBQVE7UUFDZCxXQUFXLEVBQUUsc0RBQXNEO1FBQ25FLGtCQUFrQixFQUFFLHVCQUF1QjtLQUM1QyxDQUFDO1NBQ0QsTUFBTSxDQUFDLElBQUksRUFBRTtRQUNaLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLG9EQUFvRDtRQUNqRSxPQUFPLEVBQUUsTUFBTTtLQUNoQixDQUFDO1NBQ0QsTUFBTSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHFDQUFxQztRQUNsRCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLENBQVU7UUFDakQsT0FBTyxFQUFFLFdBQW9CO0tBQzlCLENBQUM7U0FDRCxNQUFNLENBQUMsU0FBUyxFQUFFO1FBQ2pCLElBQUksRUFBRSxRQUFRO1FBQ2QsV0FBVyxFQUFFLHVEQUF1RDtRQUNwRSxNQUFNLEVBQUUsQ0FBQyxRQUFpQixFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVM7S0FDcEYsQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELDBEQUEwRDtBQUMxRCxTQUFlLE9BQU8sQ0FBQyxFQUFDLGNBQWMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQWlDOztRQUM5RixnR0FBZ0c7UUFDaEcsNERBQTREO1FBQzVELElBQUksR0FBRyxJQUFJLElBQUksU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDN0QsMkRBQTJEO1FBQzNELE1BQU0sWUFBWSxHQUFHLE1BQU0sWUFBWSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRTVFLHlDQUF5QztRQUN6QyxNQUFNLGlCQUFpQixHQUFHLE1BQU0sQ0FDNUIsSUFBSSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQztZQUNsQyxZQUFZLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxDQUFDO1FBRWpFLElBQUksT0FBTyxFQUFFO1lBQ1gsYUFBYSxDQUFDLE9BQU8sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1lBQzFDLElBQUksQ0FBQyxnQ0FBZ0MsY0FBYyxnQkFBZ0IsT0FBTyxFQUFFLENBQUMsQ0FBQztTQUMvRTthQUFNO1lBQ0wsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUM7Q0FBQTtBQUVELHVEQUF1RDtBQUN2RCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FBMkM7SUFDL0UsT0FBTztJQUNQLE9BQU87SUFDUCxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsd0JBQXdCO0NBQ25DLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtTZW1WZXJ9IGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0FyZ3VtZW50cywgQXJndiwgQ29tbWFuZE1vZHVsZX0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcblxuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4vcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBDb21tYW5kIGxpbmUgb3B0aW9ucyBmb3IgYnVpbGRpbmcgYSByZWxlYXNlLiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlTm90ZXNPcHRpb25zIHtcbiAgZnJvbT86IHN0cmluZztcbiAgdG86IHN0cmluZztcbiAgb3V0RmlsZT86IHN0cmluZztcbiAgcmVsZWFzZVZlcnNpb246IFNlbVZlcjtcbiAgdHlwZTogJ2dpdGh1Yi1yZWxlYXNlJ3wnY2hhbmdlbG9nJztcbn1cblxuLyoqIFlhcmdzIGNvbW1hbmQgYnVpbGRlciBmb3IgY29uZmlndXJpbmcgdGhlIGBuZy1kZXYgcmVsZWFzZSBidWlsZGAgY29tbWFuZC4gKi9cbmZ1bmN0aW9uIGJ1aWxkZXIoYXJndjogQXJndik6IEFyZ3Y8UmVsZWFzZU5vdGVzT3B0aW9ucz4ge1xuICByZXR1cm4gYXJndlxuICAgICAgLm9wdGlvbihcbiAgICAgICAgICAncmVsZWFzZVZlcnNpb24nLFxuICAgICAgICAgIHt0eXBlOiAnc3RyaW5nJywgZGVmYXVsdDogJzAuMC4wJywgY29lcmNlOiAodmVyc2lvbjogc3RyaW5nKSA9PiBuZXcgU2VtVmVyKHZlcnNpb24pfSlcbiAgICAgIC5vcHRpb24oJ2Zyb20nLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1RoZSBnaXQgdGFnIG9yIHJlZiB0byBzdGFydCB0aGUgY2hhbmdlbG9nIGVudHJ5IGZyb20nLFxuICAgICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICdUaGUgbGF0ZXN0IHNlbXZlciB0YWcnLFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ3RvJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgZ2l0IHRhZyBvciByZWYgdG8gZW5kIHRoZSBjaGFuZ2Vsb2cgZW50cnkgd2l0aCcsXG4gICAgICAgIGRlZmF1bHQ6ICdIRUFEJyxcbiAgICAgIH0pXG4gICAgICAub3B0aW9uKCd0eXBlJywge1xuICAgICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdUaGUgdHlwZSBvZiByZWxlYXNlIG5vdGVzIHRvIGNyZWF0ZScsXG4gICAgICAgIGNob2ljZXM6IFsnZ2l0aHViLXJlbGVhc2UnLCAnY2hhbmdlbG9nJ10gYXMgY29uc3QsXG4gICAgICAgIGRlZmF1bHQ6ICdjaGFuZ2Vsb2cnIGFzIGNvbnN0LFxuICAgICAgfSlcbiAgICAgIC5vcHRpb24oJ291dEZpbGUnLCB7XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0ZpbGUgbG9jYXRpb24gdG8gd3JpdGUgdGhlIGdlbmVyYXRlZCByZWxlYXNlIG5vdGVzIHRvJyxcbiAgICAgICAgY29lcmNlOiAoZmlsZVBhdGg/OiBzdHJpbmcpID0+IGZpbGVQYXRoID8gam9pbihwcm9jZXNzLmN3ZCgpLCBmaWxlUGF0aCkgOiB1bmRlZmluZWRcbiAgICAgIH0pO1xufVxuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBnZW5lcmF0aW5nIHJlbGVhc2Ugbm90ZXMuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVyKHtyZWxlYXNlVmVyc2lvbiwgZnJvbSwgdG8sIG91dEZpbGUsIHR5cGV9OiBBcmd1bWVudHM8UmVsZWFzZU5vdGVzT3B0aW9ucz4pIHtcbiAgLy8gU2luY2UgYHlhcmdzYCBldmFsdWF0ZXMgZGVmYXVsdHMgZXZlbiBpZiBhIHZhbHVlIGFzIGJlZW4gcHJvdmlkZWQsIGlmIG5vIHZhbHVlIGlzIHByb3ZpZGVkIHRvXG4gIC8vIHRoZSBoYW5kbGVyLCB0aGUgbGF0ZXN0IHNlbXZlciB0YWcgb24gdGhlIGJyYW5jaCBpcyB1c2VkLlxuICBmcm9tID0gZnJvbSB8fCBHaXRDbGllbnQuZ2V0KCkuZ2V0TGF0ZXN0U2VtdmVyVGFnKCkuZm9ybWF0KCk7XG4gIC8qKiBUaGUgUmVsZWFzZU5vdGVzIGluc3RhbmNlIHRvIGdlbmVyYXRlIHJlbGVhc2Ugbm90ZXMuICovXG4gIGNvbnN0IHJlbGVhc2VOb3RlcyA9IGF3YWl0IFJlbGVhc2VOb3Rlcy5mcm9tUmFuZ2UocmVsZWFzZVZlcnNpb24sIGZyb20sIHRvKTtcblxuICAvKiogVGhlIHJlcXVlc3RlZCByZWxlYXNlIG5vdGVzIGVudHJ5LiAqL1xuICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IChcbiAgICAgIHR5cGUgPT09ICdjaGFuZ2Vsb2cnID8gcmVsZWFzZU5vdGVzLmdldENoYW5nZWxvZ0VudHJ5KCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCkpO1xuXG4gIGlmIChvdXRGaWxlKSB7XG4gICAgd3JpdGVGaWxlU3luYyhvdXRGaWxlLCByZWxlYXNlTm90ZXNFbnRyeSk7XG4gICAgaW5mbyhgR2VuZXJhdGVkIHJlbGVhc2Ugbm90ZXMgZm9yIFwiJHtyZWxlYXNlVmVyc2lvbn1cIiB3cml0dGVuIHRvICR7b3V0RmlsZX1gKTtcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShyZWxlYXNlTm90ZXNFbnRyeSk7XG4gIH1cbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgZ2VuZXJhdGluZyByZWxlYXNlIG5vdGVzLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VOb3Rlc0NvbW1hbmRNb2R1bGU6IENvbW1hbmRNb2R1bGU8e30sIFJlbGVhc2VOb3Rlc09wdGlvbnM+ID0ge1xuICBidWlsZGVyLFxuICBoYW5kbGVyLFxuICBjb21tYW5kOiAnbm90ZXMnLFxuICBkZXNjcmliZTogJ0dlbmVyYXRlIHJlbGVhc2Ugbm90ZXMnLFxufTtcbiJdfQ==