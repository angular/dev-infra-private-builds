/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { GitClient } from '../../utils/git/git-client';
import { getReleaseConfig } from '../config/index';
import { fetchActiveReleaseTrains } from '../versioning/active-release-trains';
import { printActiveReleaseTrains } from '../versioning/print-active-trains';
/** Yargs command handler for printing release information. */
function handler() {
    return __awaiter(this, void 0, void 0, function* () {
        const git = GitClient.get();
        const gitRepoWithApi = Object.assign({ api: git.github }, git.remoteConfig);
        const releaseTrains = yield fetchActiveReleaseTrains(gitRepoWithApi);
        // Print the active release trains.
        yield printActiveReleaseTrains(releaseTrains, getReleaseConfig());
    });
}
/** CLI command module for retrieving release information. */
export const ReleaseInfoCommandModule = {
    handler,
    command: 'info',
    describe: 'Prints active release trains to the console.',
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvaW5mby9jbGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUtILE9BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUNyRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUNqRCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxxQ0FBcUMsQ0FBQztBQUM3RSxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUUzRSw4REFBOEQ7QUFDOUQsU0FBZSxPQUFPOztRQUNwQixNQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsTUFBTSxjQUFjLG1CQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsTUFBTSxJQUFLLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM5RCxNQUFNLGFBQWEsR0FBRyxNQUFNLHdCQUF3QixDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXJFLG1DQUFtQztRQUNuQyxNQUFNLHdCQUF3QixDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7SUFDcEUsQ0FBQztDQUFBO0FBRUQsNkRBQTZEO0FBQzdELE1BQU0sQ0FBQyxNQUFNLHdCQUF3QixHQUFrQjtJQUNyRCxPQUFPO0lBQ1AsT0FBTyxFQUFFLE1BQU07SUFDZixRQUFRLEVBQUUsOENBQThDO0NBQ3pELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtDb21tYW5kTW9kdWxlfSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuXG4vKiogWWFyZ3MgY29tbWFuZCBoYW5kbGVyIGZvciBwcmludGluZyByZWxlYXNlIGluZm9ybWF0aW9uLiAqL1xuYXN5bmMgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCBnaXRSZXBvV2l0aEFwaSA9IHthcGk6IGdpdC5naXRodWIsIC4uLmdpdC5yZW1vdGVDb25maWd9O1xuICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKGdpdFJlcG9XaXRoQXBpKTtcblxuICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zLlxuICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgZ2V0UmVsZWFzZUNvbmZpZygpKTtcbn1cblxuLyoqIENMSSBjb21tYW5kIG1vZHVsZSBmb3IgcmV0cmlldmluZyByZWxlYXNlIGluZm9ybWF0aW9uLiAqL1xuZXhwb3J0IGNvbnN0IFJlbGVhc2VJbmZvQ29tbWFuZE1vZHVsZTogQ29tbWFuZE1vZHVsZSA9IHtcbiAgaGFuZGxlcixcbiAgY29tbWFuZDogJ2luZm8nLFxuICBkZXNjcmliZTogJ1ByaW50cyBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgdG8gdGhlIGNvbnNvbGUuJyxcbn07XG4iXX0=