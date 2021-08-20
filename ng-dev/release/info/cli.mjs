"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseInfoCommandModule = void 0;
const git_client_1 = require("../../utils/git/git-client");
const index_1 = require("../config/index");
const active_release_trains_1 = require("../versioning/active-release-trains");
const print_active_trains_1 = require("../versioning/print-active-trains");
const versioning_1 = require("../versioning");
const config_1 = require("../../utils/config");
/** Yargs command handler for printing release information. */
async function handler() {
    const git = git_client_1.GitClient.get();
    const nextBranchName = versioning_1.getNextBranchName(git.config.github);
    const repo = { api: git.github, ...git.remoteConfig, nextBranchName };
    const releaseTrains = await active_release_trains_1.fetchActiveReleaseTrains(repo);
    const config = config_1.getConfig();
    index_1.assertValidReleaseConfig(config);
    // Print the active release trains.
    await print_active_trains_1.printActiveReleaseTrains(releaseTrains, config.release);
}
/** CLI command module for retrieving release information. */
exports.ReleaseInfoCommandModule = {
    handler,
    command: 'info',
    describe: 'Prints active release trains to the console.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvaW5mby9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBSUgsMkRBQXFEO0FBQ3JELDJDQUF5RDtBQUN6RCwrRUFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLDhDQUFvRTtBQUNwRSwrQ0FBNkM7QUFFN0MsOERBQThEO0FBQzlELEtBQUssVUFBVSxPQUFPO0lBQ3BCLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxjQUFjLEdBQUcsOEJBQWlCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1RCxNQUFNLElBQUksR0FBdUIsRUFBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUUsY0FBYyxFQUFDLENBQUM7SUFDeEYsTUFBTSxhQUFhLEdBQUcsTUFBTSxnREFBd0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzRCxNQUFNLE1BQU0sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDM0IsZ0NBQXdCLENBQUMsTUFBTSxDQUFDLENBQUM7SUFFakMsbUNBQW1DO0lBQ25DLE1BQU0sOENBQXdCLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQsNkRBQTZEO0FBQ2hELFFBQUEsd0JBQXdCLEdBQWtCO0lBQ3JELE9BQU87SUFDUCxPQUFPLEVBQUUsTUFBTTtJQUNmLFFBQVEsRUFBRSw4Q0FBOEM7Q0FDekQsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbW1hbmRNb2R1bGV9IGZyb20gJ3lhcmdzJztcblxuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXQtY2xpZW50JztcbmltcG9ydCB7YXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuaW1wb3J0IHtnZXROZXh0QnJhbmNoTmFtZSwgUmVsZWFzZVJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBwcmludGluZyByZWxlYXNlIGluZm9ybWF0aW9uLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCBuZXh0QnJhbmNoTmFtZSA9IGdldE5leHRCcmFuY2hOYW1lKGdpdC5jb25maWcuZ2l0aHViKTtcbiAgY29uc3QgcmVwbzogUmVsZWFzZVJlcG9XaXRoQXBpID0ge2FwaTogZ2l0LmdpdGh1YiwgLi4uZ2l0LnJlbW90ZUNvbmZpZywgbmV4dEJyYW5jaE5hbWV9O1xuICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuICBjb25zdCBjb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG5cbiAgLy8gUHJpbnQgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucy5cbiAgYXdhaXQgcHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zKHJlbGVhc2VUcmFpbnMsIGNvbmZpZy5yZWxlYXNlKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgcmV0cmlldmluZyByZWxlYXNlIGluZm9ybWF0aW9uLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VJbmZvQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZSA9IHtcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2luZm8nLFxuICBkZXNjcmliZTogJ1ByaW50cyBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgdG8gdGhlIGNvbnNvbGUuJyxcbn07XG4iXX0=