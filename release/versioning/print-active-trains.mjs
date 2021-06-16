/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { blue, bold, info } from '../../utils/console';
import { fetchLongTermSupportBranchesFromNpm } from './long-term-support';
import { isVersionPublishedToNpm } from './npm-registry';
/**
 * Prints the active release trains to the console.
 * @params active Active release trains that should be printed.
 * @params config Release configuration used for querying NPM on published versions.
 */
export function printActiveReleaseTrains(active, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { releaseCandidate, next, latest } = active;
        const isNextPublishedToNpm = yield isVersionPublishedToNpm(next.version, config);
        const nextTrainType = next.isMajor ? 'major' : 'minor';
        const ltsBranches = yield fetchLongTermSupportBranchesFromNpm(config);
        info();
        info(blue('Current version branches in the project:'));
        // Print information for release trains in the feature-freeze/release-candidate phase.
        if (releaseCandidate !== null) {
            const rcVersion = releaseCandidate.version;
            const rcTrainType = releaseCandidate.isMajor ? 'major' : 'minor';
            const rcTrainPhase = rcVersion.prerelease[0] === 'next' ? 'feature-freeze' : 'release-candidate';
            info(` • ${bold(releaseCandidate.branchName)} contains changes for an upcoming ` +
                `${rcTrainType} that is currently in ${bold(rcTrainPhase)} phase.`);
            info(`   Most recent pre-release for this branch is "${bold(`v${rcVersion}`)}".`);
        }
        // Print information about the release-train in the latest phase. i.e. the patch branch.
        info(` • ${bold(latest.branchName)} contains changes for the most recent patch.`);
        info(`   Most recent patch version for this branch is "${bold(`v${latest.version}`)}".`);
        // Print information about the release-train in the next phase.
        info(` • ${bold(next.branchName)} contains changes for a ${nextTrainType} ` +
            `currently in active development.`);
        // Note that there is a special case for versions in the next release-train. The version in
        // the next branch is not always published to NPM. This can happen when we recently branched
        // off for a feature-freeze release-train. More details are in the next pre-release action.
        if (isNextPublishedToNpm) {
            info(`   Most recent pre-release version for this branch is "${bold(`v${next.version}`)}".`);
        }
        else {
            info(`   Version is currently set to "${bold(`v${next.version}`)}", but has not been ` +
                `published yet.`);
        }
        // If no release-train in release-candidate or feature-freeze phase is active,
        // we print a message as last bullet point to make this clear.
        if (releaseCandidate === null) {
            info(' • No release-candidate or feature-freeze branch currently active.');
        }
        info();
        info(blue('Current active LTS version branches:'));
        // Print all active LTS branches (each branch as own bullet point).
        if (ltsBranches.active.length !== 0) {
            for (const ltsBranch of ltsBranches.active) {
                info(` • ${bold(ltsBranch.name)} is currently in active long-term support phase.`);
                info(`   Most recent patch version for this branch is "${bold(`v${ltsBranch.version}`)}".`);
            }
        }
        info();
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtYWN0aXZlLXRyYWlucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFJckQsT0FBTyxFQUFDLG1DQUFtQyxFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEUsT0FBTyxFQUFDLHVCQUF1QixFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBZ0Isd0JBQXdCLENBQzFDLE1BQTJCLEVBQUUsTUFBcUI7O1FBQ3BELE1BQU0sRUFBQyxnQkFBZ0IsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ2hELE1BQU0sb0JBQW9CLEdBQUcsTUFBTSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2pGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO1FBQ3ZELE1BQU0sV0FBVyxHQUFHLE1BQU0sbUNBQW1DLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdEUsSUFBSSxFQUFFLENBQUM7UUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxDQUFDLENBQUMsQ0FBQztRQUV2RCxzRkFBc0Y7UUFDdEYsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7WUFDN0IsTUFBTSxTQUFTLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDO1lBQzNDLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7WUFDakUsTUFBTSxZQUFZLEdBQ2QsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztZQUNoRixJQUFJLENBQ0EsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLG9DQUFvQztnQkFDM0UsR0FBRyxXQUFXLHlCQUF5QixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3hFLElBQUksQ0FBQyxrREFBa0QsSUFBSSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkY7UUFFRCx3RkFBd0Y7UUFDeEYsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsOENBQThDLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUMsb0RBQW9ELElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUV6RiwrREFBK0Q7UUFDL0QsSUFBSSxDQUNBLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsMkJBQTJCLGFBQWEsR0FBRztZQUN0RSxrQ0FBa0MsQ0FBQyxDQUFDO1FBQ3hDLDJGQUEyRjtRQUMzRiw0RkFBNEY7UUFDNUYsMkZBQTJGO1FBQzNGLElBQUksb0JBQW9CLEVBQUU7WUFDeEIsSUFBSSxDQUFDLDBEQUEwRCxJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDOUY7YUFBTTtZQUNMLElBQUksQ0FDQSxtQ0FBbUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLHNCQUFzQjtnQkFDakYsZ0JBQWdCLENBQUMsQ0FBQztTQUN2QjtRQUVELDhFQUE4RTtRQUM5RSw4REFBOEQ7UUFDOUQsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLG9FQUFvRSxDQUFDLENBQUM7U0FDNUU7UUFFRCxJQUFJLEVBQUUsQ0FBQztRQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO1FBRW5ELG1FQUFtRTtRQUNuRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNuQyxLQUFLLE1BQU0sU0FBUyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7Z0JBQzFDLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7Z0JBQ25GLElBQUksQ0FBQyxvREFBb0QsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzdGO1NBQ0Y7UUFFRCxJQUFJLEVBQUUsQ0FBQztJQUNULENBQUM7Q0FBQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2JsdWUsIGJvbGQsIGluZm99IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4vYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7ZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG19IGZyb20gJy4vbG9uZy10ZXJtLXN1cHBvcnQnO1xuaW1wb3J0IHtpc1ZlcnNpb25QdWJsaXNoZWRUb05wbX0gZnJvbSAnLi9ucG0tcmVnaXN0cnknO1xuXG4vKipcbiAqIFByaW50cyB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRvIHRoZSBjb25zb2xlLlxuICogQHBhcmFtcyBhY3RpdmUgQWN0aXZlIHJlbGVhc2UgdHJhaW5zIHRoYXQgc2hvdWxkIGJlIHByaW50ZWQuXG4gKiBAcGFyYW1zIGNvbmZpZyBSZWxlYXNlIGNvbmZpZ3VyYXRpb24gdXNlZCBmb3IgcXVlcnlpbmcgTlBNIG9uIHB1Ymxpc2hlZCB2ZXJzaW9ucy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhcbiAgICBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB7cmVsZWFzZUNhbmRpZGF0ZSwgbmV4dCwgbGF0ZXN0fSA9IGFjdGl2ZTtcbiAgY29uc3QgaXNOZXh0UHVibGlzaGVkVG9OcG0gPSBhd2FpdCBpc1ZlcnNpb25QdWJsaXNoZWRUb05wbShuZXh0LnZlcnNpb24sIGNvbmZpZyk7XG4gIGNvbnN0IG5leHRUcmFpblR5cGUgPSBuZXh0LmlzTWFqb3IgPyAnbWFqb3InIDogJ21pbm9yJztcbiAgY29uc3QgbHRzQnJhbmNoZXMgPSBhd2FpdCBmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbShjb25maWcpO1xuXG4gIGluZm8oKTtcbiAgaW5mbyhibHVlKCdDdXJyZW50IHZlcnNpb24gYnJhbmNoZXMgaW4gdGhlIHByb2plY3Q6JykpO1xuXG4gIC8vIFByaW50IGluZm9ybWF0aW9uIGZvciByZWxlYXNlIHRyYWlucyBpbiB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuXG4gIGlmIChyZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsKSB7XG4gICAgY29uc3QgcmNWZXJzaW9uID0gcmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uO1xuICAgIGNvbnN0IHJjVHJhaW5UeXBlID0gcmVsZWFzZUNhbmRpZGF0ZS5pc01ham9yID8gJ21ham9yJyA6ICdtaW5vcic7XG4gICAgY29uc3QgcmNUcmFpblBoYXNlID1cbiAgICAgICAgcmNWZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JyA/ICdmZWF0dXJlLWZyZWV6ZScgOiAncmVsZWFzZS1jYW5kaWRhdGUnO1xuICAgIGluZm8oXG4gICAgICAgIGAg4oCiICR7Ym9sZChyZWxlYXNlQ2FuZGlkYXRlLmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhbiB1cGNvbWluZyBgICtcbiAgICAgICAgYCR7cmNUcmFpblR5cGV9IHRoYXQgaXMgY3VycmVudGx5IGluICR7Ym9sZChyY1RyYWluUGhhc2UpfSBwaGFzZS5gKTtcbiAgICBpbmZvKGAgICBNb3N0IHJlY2VudCBwcmUtcmVsZWFzZSBmb3IgdGhpcyBicmFuY2ggaXMgXCIke2JvbGQoYHYke3JjVmVyc2lvbn1gKX1cIi5gKTtcbiAgfVxuXG4gIC8vIFByaW50IGluZm9ybWF0aW9uIGFib3V0IHRoZSByZWxlYXNlLXRyYWluIGluIHRoZSBsYXRlc3QgcGhhc2UuIGkuZS4gdGhlIHBhdGNoIGJyYW5jaC5cbiAgaW5mbyhgIOKAoiAke2JvbGQobGF0ZXN0LmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciB0aGUgbW9zdCByZWNlbnQgcGF0Y2guYCk7XG4gIGluZm8oYCAgIE1vc3QgcmVjZW50IHBhdGNoIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtsYXRlc3QudmVyc2lvbn1gKX1cIi5gKTtcblxuICAvLyBQcmludCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBwaGFzZS5cbiAgaW5mbyhcbiAgICAgIGAg4oCiICR7Ym9sZChuZXh0LmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhICR7bmV4dFRyYWluVHlwZX0gYCArXG4gICAgICBgY3VycmVudGx5IGluIGFjdGl2ZSBkZXZlbG9wbWVudC5gKTtcbiAgLy8gTm90ZSB0aGF0IHRoZXJlIGlzIGEgc3BlY2lhbCBjYXNlIGZvciB2ZXJzaW9ucyBpbiB0aGUgbmV4dCByZWxlYXNlLXRyYWluLiBUaGUgdmVyc2lvbiBpblxuICAvLyB0aGUgbmV4dCBicmFuY2ggaXMgbm90IGFsd2F5cyBwdWJsaXNoZWQgdG8gTlBNLiBUaGlzIGNhbiBoYXBwZW4gd2hlbiB3ZSByZWNlbnRseSBicmFuY2hlZFxuICAvLyBvZmYgZm9yIGEgZmVhdHVyZS1mcmVlemUgcmVsZWFzZS10cmFpbi4gTW9yZSBkZXRhaWxzIGFyZSBpbiB0aGUgbmV4dCBwcmUtcmVsZWFzZSBhY3Rpb24uXG4gIGlmIChpc05leHRQdWJsaXNoZWRUb05wbSkge1xuICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHByZS1yZWxlYXNlIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtuZXh0LnZlcnNpb259YCl9XCIuYCk7XG4gIH0gZWxzZSB7XG4gICAgaW5mbyhcbiAgICAgICAgYCAgIFZlcnNpb24gaXMgY3VycmVudGx5IHNldCB0byBcIiR7Ym9sZChgdiR7bmV4dC52ZXJzaW9ufWApfVwiLCBidXQgaGFzIG5vdCBiZWVuIGAgK1xuICAgICAgICBgcHVibGlzaGVkIHlldC5gKTtcbiAgfVxuXG4gIC8vIElmIG5vIHJlbGVhc2UtdHJhaW4gaW4gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgcGhhc2UgaXMgYWN0aXZlLFxuICAvLyB3ZSBwcmludCBhIG1lc3NhZ2UgYXMgbGFzdCBidWxsZXQgcG9pbnQgdG8gbWFrZSB0aGlzIGNsZWFyLlxuICBpZiAocmVsZWFzZUNhbmRpZGF0ZSA9PT0gbnVsbCkge1xuICAgIGluZm8oJyDigKIgTm8gcmVsZWFzZS1jYW5kaWRhdGUgb3IgZmVhdHVyZS1mcmVlemUgYnJhbmNoIGN1cnJlbnRseSBhY3RpdmUuJyk7XG4gIH1cblxuICBpbmZvKCk7XG4gIGluZm8oYmx1ZSgnQ3VycmVudCBhY3RpdmUgTFRTIHZlcnNpb24gYnJhbmNoZXM6JykpO1xuXG4gIC8vIFByaW50IGFsbCBhY3RpdmUgTFRTIGJyYW5jaGVzIChlYWNoIGJyYW5jaCBhcyBvd24gYnVsbGV0IHBvaW50KS5cbiAgaWYgKGx0c0JyYW5jaGVzLmFjdGl2ZS5sZW5ndGggIT09IDApIHtcbiAgICBmb3IgKGNvbnN0IGx0c0JyYW5jaCBvZiBsdHNCcmFuY2hlcy5hY3RpdmUpIHtcbiAgICAgIGluZm8oYCDigKIgJHtib2xkKGx0c0JyYW5jaC5uYW1lKX0gaXMgY3VycmVudGx5IGluIGFjdGl2ZSBsb25nLXRlcm0gc3VwcG9ydCBwaGFzZS5gKTtcbiAgICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHBhdGNoIHZlcnNpb24gZm9yIHRoaXMgYnJhbmNoIGlzIFwiJHtib2xkKGB2JHtsdHNCcmFuY2gudmVyc2lvbn1gKX1cIi5gKTtcbiAgICB9XG4gIH1cblxuICBpbmZvKCk7XG59XG4iXX0=