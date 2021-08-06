"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printActiveReleaseTrains = void 0;
const console_1 = require("../../utils/console");
const long_term_support_1 = require("./long-term-support");
const npm_registry_1 = require("./npm-registry");
/**
 * Prints the active release trains to the console.
 * @params active Active release trains that should be printed.
 * @params config Release configuration used for querying NPM on published versions.
 */
async function printActiveReleaseTrains(active, config) {
    const { releaseCandidate, next, latest } = active;
    const isNextPublishedToNpm = await npm_registry_1.isVersionPublishedToNpm(next.version, config);
    const nextTrainType = next.isMajor ? 'major' : 'minor';
    const ltsBranches = await long_term_support_1.fetchLongTermSupportBranchesFromNpm(config);
    console_1.info();
    console_1.info(console_1.blue('Current version branches in the project:'));
    // Print information for release trains in the feature-freeze/release-candidate phase.
    if (releaseCandidate !== null) {
        const rcVersion = releaseCandidate.version;
        const rcTrainType = releaseCandidate.isMajor ? 'major' : 'minor';
        const rcTrainPhase = rcVersion.prerelease[0] === 'next' ? 'feature-freeze' : 'release-candidate';
        console_1.info(` • ${console_1.bold(releaseCandidate.branchName)} contains changes for an upcoming ` +
            `${rcTrainType} that is currently in ${console_1.bold(rcTrainPhase)} phase.`);
        console_1.info(`   Most recent pre-release for this branch is "${console_1.bold(`v${rcVersion}`)}".`);
    }
    // Print information about the release-train in the latest phase. i.e. the patch branch.
    console_1.info(` • ${console_1.bold(latest.branchName)} contains changes for the most recent patch.`);
    console_1.info(`   Most recent patch version for this branch is "${console_1.bold(`v${latest.version}`)}".`);
    // Print information about the release-train in the next phase.
    console_1.info(` • ${console_1.bold(next.branchName)} contains changes for a ${nextTrainType} ` +
        `currently in active development.`);
    // Note that there is a special case for versions in the next release-train. The version in
    // the next branch is not always published to NPM. This can happen when we recently branched
    // off for a feature-freeze release-train. More details are in the next pre-release action.
    if (isNextPublishedToNpm) {
        console_1.info(`   Most recent pre-release version for this branch is "${console_1.bold(`v${next.version}`)}".`);
    }
    else {
        console_1.info(`   Version is currently set to "${console_1.bold(`v${next.version}`)}", but has not been ` +
            `published yet.`);
    }
    // If no release-train in release-candidate or feature-freeze phase is active,
    // we print a message as last bullet point to make this clear.
    if (releaseCandidate === null) {
        console_1.info(' • No release-candidate or feature-freeze branch currently active.');
    }
    console_1.info();
    console_1.info(console_1.blue('Current active LTS version branches:'));
    // Print all active LTS branches (each branch as own bullet point).
    if (ltsBranches.active.length !== 0) {
        for (const ltsBranch of ltsBranches.active) {
            console_1.info(` • ${console_1.bold(ltsBranch.name)} is currently in active long-term support phase.`);
            console_1.info(`   Most recent patch version for this branch is "${console_1.bold(`v${ltsBranch.version}`)}".`);
        }
    }
    console_1.info();
}
exports.printActiveReleaseTrains = printActiveReleaseTrains;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtYWN0aXZlLXRyYWlucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBcUQ7QUFJckQsMkRBQXdFO0FBQ3hFLGlEQUF1RDtBQUV2RDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHdCQUF3QixDQUM1QyxNQUEyQixFQUMzQixNQUFxQjtJQUVyQixNQUFNLEVBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUNoRCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sc0NBQXVCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztJQUN2RCxNQUFNLFdBQVcsR0FBRyxNQUFNLHVEQUFtQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBRXRFLGNBQUksRUFBRSxDQUFDO0lBQ1AsY0FBSSxDQUFDLGNBQUksQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDLENBQUM7SUFFdkQsc0ZBQXNGO0lBQ3RGLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO1FBQzdCLE1BQU0sU0FBUyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUMzQyxNQUFNLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ2pFLE1BQU0sWUFBWSxHQUNoQixTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDO1FBQzlFLGNBQUksQ0FDRixNQUFNLGNBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsb0NBQW9DO1lBQ3pFLEdBQUcsV0FBVyx5QkFBeUIsY0FBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQ3JFLENBQUM7UUFDRixjQUFJLENBQUMsa0RBQWtELGNBQUksQ0FBQyxJQUFJLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ25GO0lBRUQsd0ZBQXdGO0lBQ3hGLGNBQUksQ0FBQyxNQUFNLGNBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDbEYsY0FBSSxDQUFDLG9EQUFvRCxjQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFekYsK0RBQStEO0lBQy9ELGNBQUksQ0FDRixNQUFNLGNBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLDJCQUEyQixhQUFhLEdBQUc7UUFDcEUsa0NBQWtDLENBQ3JDLENBQUM7SUFDRiwyRkFBMkY7SUFDM0YsNEZBQTRGO0lBQzVGLDJGQUEyRjtJQUMzRixJQUFJLG9CQUFvQixFQUFFO1FBQ3hCLGNBQUksQ0FBQywwREFBMEQsY0FBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlGO1NBQU07UUFDTCxjQUFJLENBQ0YsbUNBQW1DLGNBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxzQkFBc0I7WUFDL0UsZ0JBQWdCLENBQ25CLENBQUM7S0FDSDtJQUVELDhFQUE4RTtJQUM5RSw4REFBOEQ7SUFDOUQsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7UUFDN0IsY0FBSSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7S0FDNUU7SUFFRCxjQUFJLEVBQUUsQ0FBQztJQUNQLGNBQUksQ0FBQyxjQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBRW5ELG1FQUFtRTtJQUNuRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQyxLQUFLLE1BQU0sU0FBUyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDMUMsY0FBSSxDQUFDLE1BQU0sY0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0RBQWtELENBQUMsQ0FBQztZQUNuRixjQUFJLENBQUMsb0RBQW9ELGNBQUksQ0FBQyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3RjtLQUNGO0lBRUQsY0FBSSxFQUFFLENBQUM7QUFDVCxDQUFDO0FBaEVELDREQWdFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2JsdWUsIGJvbGQsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4vYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG19IGZyb20gJy4vbG9uZy10ZXJtLXN1cHBvcnQnO1xuaW1wb3J0IHtpc1ZlcnNpb25QdWJsaXNoZWRUb05wbX0gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKipcbiAqIFByaW50cyB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRvIHRoZSBjb25zb2xlLlxuICogQHBhcmFtcyBhY3RpdmUgQWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRoYXQgc2hvdWxkIGJlIHByaW50ZWQuXG4gKiBAcGFyYW1zIGNvbmZpZyBSZWxlYXNlIGNvbmZpZ3VyYXRpb24gdXNlZCBmb3IgcXVlcnlpbmcgTlBNIG9uIHB1Ymxpc2hlZCB2ZXJzaW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhcbiAgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICBjb25maWc6IFJlbGVhc2VDb25maWcsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3Qge3JlbGVhc2VDYW5kaWRhdGUsIG5leHQsIGxhdGVzdH0gPSBhY3RpdmU7XG4gIGNvbnN0IGlzTmV4dFB1Ymxpc2hlZFRvTnBtID0gYXdhaXQgaXNWZXJzaW9uUHVibGlzaGVkVG9OcG0obmV4dC52ZXJzaW9uLCBjb25maWcpO1xuICBjb25zdCBuZXh0VHJhaW5UeXBlID0gbmV4dC5pc01ham9yID8gJ21ham9yJyA6ICdtaW5vcic7XG4gIGNvbnN0IGx0c0JyYW5jaGVzID0gYXdhaXQgZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0oY29uZmlnKTtcblxuICBpbmZvKCk7XG4gIGluZm8oYmx1ZSgnQ3VycmVudCB2ZXJzaW9uIGJyYW5jaGVzIGluIHRoZSBwcm9qZWN0OicpKTtcblxuICAvLyBQcmludCBpbmZvcm1hdGlvbiBmb3IgcmVsZWFzZSB0cmFpbnMgaW4gdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLlxuICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgIGNvbnN0IHJjVmVyc2lvbiA9IHJlbGVhc2VDYW5kaWRhdGUudmVyc2lvbjtcbiAgICBjb25zdCByY1RyYWluVHlwZSA9IHJlbGVhc2VDYW5kaWRhdGUuaXNNYWpvciA/ICdtYWpvcicgOiAnbWlub3InO1xuICAgIGNvbnN0IHJjVHJhaW5QaGFzZSA9XG4gICAgICByY1ZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnID8gJ2ZlYXR1cmUtZnJlZXplJyA6ICdyZWxlYXNlLWNhbmRpZGF0ZSc7XG4gICAgaW5mbyhcbiAgICAgIGAg4oCiICR7Ym9sZChyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhbiB1cGNvbWluZyBgICtcbiAgICAgICAgYCR7cmNUcmFpblR5cGV9IHRoYXQgaXMgY3VycmVudGx5IGluICR7Ym9sZChyY1RyYWluUGhhc2UpfSBwaGFzZS5gLFxuICAgICk7XG4gICAgaW5mbyhgICAgTW9zdCByZWNlbnQgcHJlLXJlbGVhc2UgZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtyY1ZlcnNpb259YCl9XCIuYCk7XG4gIH1cblxuICAvLyBQcmludCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbGF0ZXN0IHBoYXNlLiBpLmUuIHRoZSBwYXRjaCBicmFuY2guXG4gIGluZm8oYCDigKIgJHtib2xkKGxhdGVzdC5icmFuY2hOYW1lKX0gY29udGFpbnMgY2hhbmdlcyBmb3IgdGhlIG1vc3QgcmVjZW50IHBhdGNoLmApO1xuICBpbmZvKGAgICBNb3N0IHJlY2VudCBwYXRjaCB2ZXJzaW9uIGZvciB0aGlzIGJyYW5jaCBpcyBcIiR7Ym9sZChgdiR7bGF0ZXN0LnZlcnNpb259YCl9XCIuYCk7XG5cbiAgLy8gUHJpbnQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIG5leHQgcGhhc2UuXG4gIGluZm8oXG4gICAgYCDigKIgJHtib2xkKG5leHQuYnJhbmNoTmFtZSl9IGNvbnRhaW5zIGNoYW5nZXMgZm9yIGEgJHtuZXh0VHJhaW5UeXBlfSBgICtcbiAgICAgIGBjdXJyZW50bHkgaW4gYWN0aXZlIGRldmVsb3BtZW50LmAsXG4gICk7XG4gIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBhIHNwZWNpYWwgY2FzZSBmb3IgdmVyc2lvbnMgaW4gdGhlIG5leHQgcmVsZWFzZS10cmFpbi4gVGhlIHZlcnNpb24gaW5cbiAgLy8gdGhlIG5leHQgYnJhbmNoIGlzIG5vdCBhbHdheXMgcHVibGlzaGVkIHRvIE5QTS4gVGhpcyBjYW4gaGFwcGVuIHdoZW4gd2UgcmVjZW50bHkgYnJhbmNoZWRcbiAgLy8gb2ZmIGZvciBhIGZlYXR1cmUtZnJlZXplIHJlbGVhc2UtdHJhaW4uIE1vcmUgZGV0YWlscyBhcmUgaW4gdGhlIG5leHQgcHJlLXJlbGVhc2UgYWN0aW9uLlxuICBpZiAoaXNOZXh0UHVibGlzaGVkVG9OcG0pIHtcbiAgICBpbmZvKGAgICBNb3N0IHJlY2VudCBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIGJyYW5jaCBpcyBcIiR7Ym9sZChgdiR7bmV4dC52ZXJzaW9ufWApfVwiLmApO1xuICB9IGVsc2Uge1xuICAgIGluZm8oXG4gICAgICBgICAgVmVyc2lvbiBpcyBjdXJyZW50bHkgc2V0IHRvIFwiJHtib2xkKGB2JHtuZXh0LnZlcnNpb259YCl9XCIsIGJ1dCBoYXMgbm90IGJlZW4gYCArXG4gICAgICAgIGBwdWJsaXNoZWQgeWV0LmAsXG4gICAgKTtcbiAgfVxuXG4gIC8vIElmIG5vIHJlbGVhc2UtdHJhaW4gaW4gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgcGhhc2UgaXMgYWN0aXZlLFxuICAvLyB3ZSBwcmludCBhIG1lc3NhZ2UgYXMgbGFzdCBidWxsZXQgcG9pbnQgdG8gbWFrZSB0aGlzIGNsZWFyLlxuICBpZiAocmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgIGluZm8oJyDigKIgTm8gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgYnJhbmNoIGN1cnJlbnRseSBhY3RpdmUuJyk7XG4gIH1cblxuICBpbmZvKCk7XG4gIGluZm8oYmx1ZSgnQ3VycmVudCBhY3RpdmUgTFRTIHZlcnNpb24gYnJhbmNoZXM6JykpO1xuXG4gIC8vIFByaW50IGFsbCBhY3RpdmUgTFRTIGJyYW5jaGVzIChlYWNoIGJyYW5jaCBhcyBvd24gYnVsbGV0IHBvaW50KS5cbiAgaWYgKGx0c0JyYW5jaGVzLmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICBmb3IgKGNvbnN0IGx0c0JyYW5jaCBvZiBsdHNCcmFuY2hlcy5hY3RpdmUpIHtcbiAgICAgIGluZm8oYCDigKIgJHtib2xkKGx0c0JyYW5jaC5uYW1lKX0gaXMgY3VycmVudGx5IGluIGFjdGl2ZSBsb25nLXRlcm0gc3VwcG9ydCBwaGFzZS5gKTtcbiAgICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHBhdGNoIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtsdHNCcmFuY2gudmVyc2lvbn1gKX1cIi5gKTtcbiAgICB9XG4gIH1cblxuICBpbmZvKCk7XG59XG4iXX0=