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
    const isNextPublishedToNpm = await (0, npm_registry_1.isVersionPublishedToNpm)(next.version, config);
    const nextTrainType = next.isMajor ? 'major' : 'minor';
    const ltsBranches = await (0, long_term_support_1.fetchLongTermSupportBranchesFromNpm)(config);
    (0, console_1.info)();
    (0, console_1.info)((0, console_1.blue)('Current version branches in the project:'));
    // Print information for release trains in the feature-freeze/release-candidate phase.
    if (releaseCandidate !== null) {
        const rcVersion = releaseCandidate.version;
        const rcTrainType = releaseCandidate.isMajor ? 'major' : 'minor';
        const rcTrainPhase = rcVersion.prerelease[0] === 'next' ? 'feature-freeze' : 'release-candidate';
        (0, console_1.info)(` • ${(0, console_1.bold)(releaseCandidate.branchName)} contains changes for an upcoming ` +
            `${rcTrainType} that is currently in ${(0, console_1.bold)(rcTrainPhase)} phase.`);
        (0, console_1.info)(`   Most recent pre-release for this branch is "${(0, console_1.bold)(`v${rcVersion}`)}".`);
    }
    // Print information about the release-train in the latest phase. i.e. the patch branch.
    (0, console_1.info)(` • ${(0, console_1.bold)(latest.branchName)} contains changes for the most recent patch.`);
    (0, console_1.info)(`   Most recent patch version for this branch is "${(0, console_1.bold)(`v${latest.version}`)}".`);
    // Print information about the release-train in the next phase.
    (0, console_1.info)(` • ${(0, console_1.bold)(next.branchName)} contains changes for a ${nextTrainType} ` +
        `currently in active development.`);
    // Note that there is a special case for versions in the next release-train. The version in
    // the next branch is not always published to NPM. This can happen when we recently branched
    // off for a feature-freeze release-train. More details are in the next pre-release action.
    if (isNextPublishedToNpm) {
        (0, console_1.info)(`   Most recent pre-release version for this branch is "${(0, console_1.bold)(`v${next.version}`)}".`);
    }
    else {
        (0, console_1.info)(`   Version is currently set to "${(0, console_1.bold)(`v${next.version}`)}", but has not been ` +
            `published yet.`);
    }
    // If no release-train in release-candidate or feature-freeze phase is active,
    // we print a message as last bullet point to make this clear.
    if (releaseCandidate === null) {
        (0, console_1.info)(' • No release-candidate or feature-freeze branch currently active.');
    }
    (0, console_1.info)();
    (0, console_1.info)((0, console_1.blue)('Current active LTS version branches:'));
    // Print all active LTS branches (each branch as own bullet point).
    if (ltsBranches.active.length !== 0) {
        for (const ltsBranch of ltsBranches.active) {
            (0, console_1.info)(` • ${(0, console_1.bold)(ltsBranch.name)} is currently in active long-term support phase.`);
            (0, console_1.info)(`   Most recent patch version for this branch is "${(0, console_1.bold)(`v${ltsBranch.version}`)}".`);
        }
    }
    (0, console_1.info)();
}
exports.printActiveReleaseTrains = printActiveReleaseTrains;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtYWN0aXZlLXRyYWlucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCxpREFBcUQ7QUFJckQsMkRBQXdFO0FBQ3hFLGlEQUF1RDtBQUV2RDs7OztHQUlHO0FBQ0ksS0FBSyxVQUFVLHdCQUF3QixDQUM1QyxNQUEyQixFQUMzQixNQUFxQjtJQUVyQixNQUFNLEVBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUNoRCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sSUFBQSxzQ0FBdUIsRUFBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2pGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3ZELE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSx1REFBbUMsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUV0RSxJQUFBLGNBQUksR0FBRSxDQUFDO0lBQ1AsSUFBQSxjQUFJLEVBQUMsSUFBQSxjQUFJLEVBQUMsMENBQTBDLENBQUMsQ0FBQyxDQUFDO0lBRXZELHNGQUFzRjtJQUN0RixJQUFJLGdCQUFnQixLQUFLLElBQUksRUFBRTtRQUM3QixNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUNqRSxNQUFNLFlBQVksR0FDaEIsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQztRQUM5RSxJQUFBLGNBQUksRUFDRixNQUFNLElBQUEsY0FBSSxFQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxvQ0FBb0M7WUFDekUsR0FBRyxXQUFXLHlCQUF5QixJQUFBLGNBQUksRUFBQyxZQUFZLENBQUMsU0FBUyxDQUNyRSxDQUFDO1FBQ0YsSUFBQSxjQUFJLEVBQUMsa0RBQWtELElBQUEsY0FBSSxFQUFDLElBQUksU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbkY7SUFFRCx3RkFBd0Y7SUFDeEYsSUFBQSxjQUFJLEVBQUMsTUFBTSxJQUFBLGNBQUksRUFBQyxNQUFNLENBQUMsVUFBVSxDQUFDLDhDQUE4QyxDQUFDLENBQUM7SUFDbEYsSUFBQSxjQUFJLEVBQUMsb0RBQW9ELElBQUEsY0FBSSxFQUFDLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXpGLCtEQUErRDtJQUMvRCxJQUFBLGNBQUksRUFDRixNQUFNLElBQUEsY0FBSSxFQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsMkJBQTJCLGFBQWEsR0FBRztRQUNwRSxrQ0FBa0MsQ0FDckMsQ0FBQztJQUNGLDJGQUEyRjtJQUMzRiw0RkFBNEY7SUFDNUYsMkZBQTJGO0lBQzNGLElBQUksb0JBQW9CLEVBQUU7UUFDeEIsSUFBQSxjQUFJLEVBQUMsMERBQTBELElBQUEsY0FBSSxFQUFDLElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQzlGO1NBQU07UUFDTCxJQUFBLGNBQUksRUFDRixtQ0FBbUMsSUFBQSxjQUFJLEVBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsc0JBQXNCO1lBQy9FLGdCQUFnQixDQUNuQixDQUFDO0tBQ0g7SUFFRCw4RUFBOEU7SUFDOUUsOERBQThEO0lBQzlELElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO1FBQzdCLElBQUEsY0FBSSxFQUFDLG9FQUFvRSxDQUFDLENBQUM7S0FDNUU7SUFFRCxJQUFBLGNBQUksR0FBRSxDQUFDO0lBQ1AsSUFBQSxjQUFJLEVBQUMsSUFBQSxjQUFJLEVBQUMsc0NBQXNDLENBQUMsQ0FBQyxDQUFDO0lBRW5ELG1FQUFtRTtJQUNuRSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQyxLQUFLLE1BQU0sU0FBUyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUU7WUFDMUMsSUFBQSxjQUFJLEVBQUMsTUFBTSxJQUFBLGNBQUksRUFBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7WUFDbkYsSUFBQSxjQUFJLEVBQUMsb0RBQW9ELElBQUEsY0FBSSxFQUFDLElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzdGO0tBQ0Y7SUFFRCxJQUFBLGNBQUksR0FBRSxDQUFDO0FBQ1QsQ0FBQztBQWhFRCw0REFnRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtibHVlLCBib2xkLCBpbmZvfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2ZldGNoTG9uZ1Rlcm1TdXBwb3J0QnJhbmNoZXNGcm9tTnBtfSBmcm9tICcuL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7aXNWZXJzaW9uUHVibGlzaGVkVG9OcG19IGZyb20gJy4vbnBtLXJlZ2lzdHJ5JztcblxuLyoqXG4gKiBQcmludHMgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyB0byB0aGUgY29uc29sZS5cbiAqIEBwYXJhbXMgYWN0aXZlIEFjdGl2ZSByZWxlYXNlIHRyYWlucyB0aGF0IHNob3VsZCBiZSBwcmludGVkLlxuICogQHBhcmFtcyBjb25maWcgUmVsZWFzZSBjb25maWd1cmF0aW9uIHVzZWQgZm9yIHF1ZXJ5aW5nIE5QTSBvbiBwdWJsaXNoZWQgdmVyc2lvbnMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMoXG4gIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHtyZWxlYXNlQ2FuZGlkYXRlLCBuZXh0LCBsYXRlc3R9ID0gYWN0aXZlO1xuICBjb25zdCBpc05leHRQdWJsaXNoZWRUb05wbSA9IGF3YWl0IGlzVmVyc2lvblB1Ymxpc2hlZFRvTnBtKG5leHQudmVyc2lvbiwgY29uZmlnKTtcbiAgY29uc3QgbmV4dFRyYWluVHlwZSA9IG5leHQuaXNNYWpvciA/ICdtYWpvcicgOiAnbWlub3InO1xuICBjb25zdCBsdHNCcmFuY2hlcyA9IGF3YWl0IGZldGNoTG9uZ1Rlcm1TdXBwb3J0QnJhbmNoZXNGcm9tTnBtKGNvbmZpZyk7XG5cbiAgaW5mbygpO1xuICBpbmZvKGJsdWUoJ0N1cnJlbnQgdmVyc2lvbiBicmFuY2hlcyBpbiB0aGUgcHJvamVjdDonKSk7XG5cbiAgLy8gUHJpbnQgaW5mb3JtYXRpb24gZm9yIHJlbGVhc2UgdHJhaW5zIGluIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS5cbiAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICBjb25zdCByY1ZlcnNpb24gPSByZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb247XG4gICAgY29uc3QgcmNUcmFpblR5cGUgPSByZWxlYXNlQ2FuZGlkYXRlLmlzTWFqb3IgPyAnbWFqb3InIDogJ21pbm9yJztcbiAgICBjb25zdCByY1RyYWluUGhhc2UgPVxuICAgICAgcmNWZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICduZXh0JyA/ICdmZWF0dXJlLWZyZWV6ZScgOiAncmVsZWFzZS1jYW5kaWRhdGUnO1xuICAgIGluZm8oXG4gICAgICBgIOKAoiAke2JvbGQocmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lKX0gY29udGFpbnMgY2hhbmdlcyBmb3IgYW4gdXBjb21pbmcgYCArXG4gICAgICAgIGAke3JjVHJhaW5UeXBlfSB0aGF0IGlzIGN1cnJlbnRseSBpbiAke2JvbGQocmNUcmFpblBoYXNlKX0gcGhhc2UuYCxcbiAgICApO1xuICAgIGluZm8oYCAgIE1vc3QgcmVjZW50IHByZS1yZWxlYXNlIGZvciB0aGlzIGJyYW5jaCBpcyBcIiR7Ym9sZChgdiR7cmNWZXJzaW9ufWApfVwiLmApO1xuICB9XG5cbiAgLy8gUHJpbnQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIGxhdGVzdCBwaGFzZS4gaS5lLiB0aGUgcGF0Y2ggYnJhbmNoLlxuICBpbmZvKGAg4oCiICR7Ym9sZChsYXRlc3QuYnJhbmNoTmFtZSl9IGNvbnRhaW5zIGNoYW5nZXMgZm9yIHRoZSBtb3N0IHJlY2VudCBwYXRjaC5gKTtcbiAgaW5mbyhgICAgTW9zdCByZWNlbnQgcGF0Y2ggdmVyc2lvbiBmb3IgdGhpcyBicmFuY2ggaXMgXCIke2JvbGQoYHYke2xhdGVzdC52ZXJzaW9ufWApfVwiLmApO1xuXG4gIC8vIFByaW50IGluZm9ybWF0aW9uIGFib3V0IHRoZSByZWxlYXNlLXRyYWluIGluIHRoZSBuZXh0IHBoYXNlLlxuICBpbmZvKFxuICAgIGAg4oCiICR7Ym9sZChuZXh0LmJyYW5jaE5hbWUpfSBjb250YWlucyBjaGFuZ2VzIGZvciBhICR7bmV4dFRyYWluVHlwZX0gYCArXG4gICAgICBgY3VycmVudGx5IGluIGFjdGl2ZSBkZXZlbG9wbWVudC5gLFxuICApO1xuICAvLyBOb3RlIHRoYXQgdGhlcmUgaXMgYSBzcGVjaWFsIGNhc2UgZm9yIHZlcnNpb25zIGluIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4uIFRoZSB2ZXJzaW9uIGluXG4gIC8vIHRoZSBuZXh0IGJyYW5jaCBpcyBub3QgYWx3YXlzIHB1Ymxpc2hlZCB0byBOUE0uIFRoaXMgY2FuIGhhcHBlbiB3aGVuIHdlIHJlY2VudGx5IGJyYW5jaGVkXG4gIC8vIG9mZiBmb3IgYSBmZWF0dXJlLWZyZWV6ZSByZWxlYXNlLXRyYWluLiBNb3JlIGRldGFpbHMgYXJlIGluIHRoZSBuZXh0IHByZS1yZWxlYXNlIGFjdGlvbi5cbiAgaWYgKGlzTmV4dFB1Ymxpc2hlZFRvTnBtKSB7XG4gICAgaW5mbyhgICAgTW9zdCByZWNlbnQgcHJlLXJlbGVhc2UgdmVyc2lvbiBmb3IgdGhpcyBicmFuY2ggaXMgXCIke2JvbGQoYHYke25leHQudmVyc2lvbn1gKX1cIi5gKTtcbiAgfSBlbHNlIHtcbiAgICBpbmZvKFxuICAgICAgYCAgIFZlcnNpb24gaXMgY3VycmVudGx5IHNldCB0byBcIiR7Ym9sZChgdiR7bmV4dC52ZXJzaW9ufWApfVwiLCBidXQgaGFzIG5vdCBiZWVuIGAgK1xuICAgICAgICBgcHVibGlzaGVkIHlldC5gLFxuICAgICk7XG4gIH1cblxuICAvLyBJZiBubyByZWxlYXNlLXRyYWluIGluIHJlbGVhc2UtY2FuZGlkYXRlIG9yIGZlYXR1cmUtZnJlZXplIHBoYXNlIGlzIGFjdGl2ZSxcbiAgLy8gd2UgcHJpbnQgYSBtZXNzYWdlIGFzIGxhc3QgYnVsbGV0IHBvaW50IHRvIG1ha2UgdGhpcyBjbGVhci5cbiAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgPT09IG51bGwpIHtcbiAgICBpbmZvKCcg4oCiIE5vIHJlbGVhc2UtY2FuZGlkYXRlIG9yIGZlYXR1cmUtZnJlZXplIGJyYW5jaCBjdXJyZW50bHkgYWN0aXZlLicpO1xuICB9XG5cbiAgaW5mbygpO1xuICBpbmZvKGJsdWUoJ0N1cnJlbnQgYWN0aXZlIExUUyB2ZXJzaW9uIGJyYW5jaGVzOicpKTtcblxuICAvLyBQcmludCBhbGwgYWN0aXZlIExUUyBicmFuY2hlcyAoZWFjaCBicmFuY2ggYXMgb3duIGJ1bGxldCBwb2ludCkuXG4gIGlmIChsdHNCcmFuY2hlcy5hY3RpdmUubGVuZ3RoICE9PSAwKSB7XG4gICAgZm9yIChjb25zdCBsdHNCcmFuY2ggb2YgbHRzQnJhbmNoZXMuYWN0aXZlKSB7XG4gICAgICBpbmZvKGAg4oCiICR7Ym9sZChsdHNCcmFuY2gubmFtZSl9IGlzIGN1cnJlbnRseSBpbiBhY3RpdmUgbG9uZy10ZXJtIHN1cHBvcnQgcGhhc2UuYCk7XG4gICAgICBpbmZvKGAgICBNb3N0IHJlY2VudCBwYXRjaCB2ZXJzaW9uIGZvciB0aGlzIGJyYW5jaCBpcyBcIiR7Ym9sZChgdiR7bHRzQnJhbmNoLnZlcnNpb259YCl9XCIuYCk7XG4gICAgfVxuICB9XG5cbiAgaW5mbygpO1xufVxuIl19