"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveReleaseTrainsFromVersionBranches = exports.fetchActiveReleaseTrains = void 0;
const semver = require("semver");
const release_trains_1 = require("./release-trains");
const version_branches_1 = require("./version-branches");
/** Fetches the active release trains for the configured project. */
async function fetchActiveReleaseTrains(repo) {
    const nextBranchName = repo.nextBranchName;
    const nextVersion = await version_branches_1.getVersionOfBranch(repo, nextBranchName);
    const next = new release_trains_1.ReleaseTrain(nextBranchName, nextVersion);
    const majorVersionsToConsider = [];
    let expectedReleaseCandidateMajor;
    // If the `next` branch (i.e. `main` branch) is for an upcoming major version, we
    // know that there is no patch branch or feature-freeze/release-candidate branch for this major
    // digit. If the current `next` version is the first minor of a major version, we know that
    // the feature-freeze/release-candidate branch can only be the actual major branch. The
    // patch branch is based on that, either the actual major branch or the last minor from the
    // preceding major version. In all other cases, the patch branch and feature-freeze or
    // release-candidate branch are part of the same major version. Consider the following:
    //
    //  CASE 1. next: 11.0.0-next.0: patch and feature-freeze/release-candidate can only be
    //          most recent `10.<>.x` branches. The FF/RC branch can only be the last-minor of v10.
    //  CASE 2. next: 11.1.0-next.0: patch can be either `11.0.x` or last-minor in v10 based
    //          on whether there is a feature-freeze/release-candidate branch (=> `11.0.x`).
    //  CASE 3. next: 10.6.0-next.0: patch can be either `10.5.x` or `10.4.x` based on whether
    //          there is a feature-freeze/release-candidate branch (=> `10.5.x`)
    if (nextVersion.minor === 0) {
        expectedReleaseCandidateMajor = nextVersion.major - 1;
        majorVersionsToConsider.push(nextVersion.major - 1);
    }
    else if (nextVersion.minor === 1) {
        expectedReleaseCandidateMajor = nextVersion.major;
        majorVersionsToConsider.push(nextVersion.major, nextVersion.major - 1);
    }
    else {
        expectedReleaseCandidateMajor = nextVersion.major;
        majorVersionsToConsider.push(nextVersion.major);
    }
    // Collect all version-branches that should be considered for the latest version-branch,
    // or the feature-freeze/release-candidate.
    const branches = await version_branches_1.getBranchesForMajorVersions(repo, majorVersionsToConsider);
    const { latest, releaseCandidate } = await findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor);
    if (latest === null) {
        throw Error(`Unable to determine the latest release-train. The following branches ` +
            `have been considered: [${branches.map((b) => b.name).join(', ')}]`);
    }
    return { releaseCandidate, latest, next };
}
exports.fetchActiveReleaseTrains = fetchActiveReleaseTrains;
/** Finds the currently active release trains from the specified version branches. */
async function findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
    // Version representing the release-train currently in the next phase. Note that we ignore
    // patch and pre-release segments in order to be able to compare the next release train to
    // other release trains from version branches (which follow the `N.N.x` pattern).
    const nextReleaseTrainVersion = semver.parse(`${nextVersion.major}.${nextVersion.minor}.0`);
    const nextBranchName = repo.nextBranchName;
    let latest = null;
    let releaseCandidate = null;
    // Iterate through the captured branches and find the latest non-prerelease branch and a
    // potential release candidate branch. From the collected branches we iterate descending
    // order (most recent semantic version-branch first). The first branch is either the latest
    // active version branch (i.e. patch) or a feature-freeze/release-candidate branch. A FF/RC
    // branch cannot be older than the latest active version-branch, so we stop iterating once
    // we found such a branch. Otherwise, if we found a FF/RC branch, we continue looking for the
    // next version-branch as that one is supposed to be the latest active version-branch. If it
    // is not, then an error will be thrown due to two FF/RC branches existing at the same time.
    for (const { name, parsed } of branches) {
        // It can happen that version branches have been accidentally created which are more recent
        // than the release-train in the next branch (i.e. `master`). We could ignore such branches
        // silently, but it might be symptomatic for an outdated version in the `next` branch, or an
        // accidentally created branch by the caretaker. In either way we want to raise awareness.
        if (semver.gt(parsed, nextReleaseTrainVersion)) {
            throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is ` +
                `more recent than the release-train currently in the "${nextBranchName}" branch. ` +
                `Please either delete the branch if created by accident, or update the outdated ` +
                `version in the next branch (${nextBranchName}).`);
        }
        else if (semver.eq(parsed, nextReleaseTrainVersion)) {
            throw Error(`Discovered unexpected version-branch "${name}" for a release-train that is already ` +
                `active in the "${nextBranchName}" branch. Please either delete the branch if ` +
                `created by accident, or update the version in the next branch (${nextBranchName}).`);
        }
        const version = await version_branches_1.getVersionOfBranch(repo, name);
        const releaseTrain = new release_trains_1.ReleaseTrain(name, version);
        const isPrerelease = version.prerelease[0] === 'rc' || version.prerelease[0] === 'next';
        if (isPrerelease) {
            if (releaseCandidate !== null) {
                throw Error(`Unable to determine latest release-train. Found two consecutive ` +
                    `branches in feature-freeze/release-candidate phase. Did not expect both "${name}" ` +
                    `and "${releaseCandidate.branchName}" to be in feature-freeze/release-candidate mode.`);
            }
            else if (version.major !== expectedReleaseCandidateMajor) {
                throw Error(`Discovered unexpected old feature-freeze/release-candidate branch. Expected no ` +
                    `version-branch in feature-freeze/release-candidate mode for v${version.major}.`);
            }
            releaseCandidate = releaseTrain;
        }
        else {
            latest = releaseTrain;
            break;
        }
    }
    return { releaseCandidate, latest };
}
exports.findActiveReleaseTrainsFromVersionBranches = findActiveReleaseTrainsFromVersionBranches;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLHFEQUE4QztBQUM5Qyx5REFLNEI7QUFZNUIsb0VBQW9FO0FBQzdELEtBQUssVUFBVSx3QkFBd0IsQ0FDNUMsSUFBd0I7SUFFeEIsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQztJQUMzQyxNQUFNLFdBQVcsR0FBRyxNQUFNLHFDQUFrQixDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLDZCQUFZLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNELE1BQU0sdUJBQXVCLEdBQWEsRUFBRSxDQUFDO0lBQzdDLElBQUksNkJBQXFDLENBQUM7SUFFMUMsaUZBQWlGO0lBQ2pGLCtGQUErRjtJQUMvRiwyRkFBMkY7SUFDM0YsdUZBQXVGO0lBQ3ZGLDJGQUEyRjtJQUMzRixzRkFBc0Y7SUFDdEYsdUZBQXVGO0lBQ3ZGLEVBQUU7SUFDRix1RkFBdUY7SUFDdkYsK0ZBQStGO0lBQy9GLHdGQUF3RjtJQUN4Rix3RkFBd0Y7SUFDeEYsMEZBQTBGO0lBQzFGLDRFQUE0RTtJQUM1RSxJQUFJLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFFO1FBQzNCLDZCQUE2QixHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQ3JEO1NBQU0sSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtRQUNsQyw2QkFBNkIsR0FBRyxXQUFXLENBQUMs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QUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO2dCQUM3QixNQUFNLEtBQUssQ0FDVCxrRUFBa0U7b0JBQ2hFLDRFQUE0RSxJQUFJLElBQUk7b0JBQ3BGLFFBQVEsZ0JBQWdCLENBQUMsVUFBVSxtREFBbUQsQ0FDekYsQ0FBQzthQUNIO2lCQUFNLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyw2QkFBNkIsRUFBRTtnQkFDMUQsTUFBTSxLQUFLLENBQ1QsaUZBQWlGO29CQUMvRSxnRUFBZ0UsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUNuRixDQUFDO2FBQ0g7WUFDRCxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7U0FDakM7YUFBTTtZQUNMLE1BQU0sR0FBRyxZQUFZLENBQUM7WUFDdEIsTUFBTTtTQUNQO0tBQ0Y7SUFFRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFDLENBQUM7QUFDcEMsQ0FBQztBQXZFRCxnR0F1RUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZVRyYWlufSBmcm9tICcuL3JlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7XG4gIGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyxcbiAgZ2V0VmVyc2lvbk9mQnJhbmNoLFxuICBSZWxlYXNlUmVwb1dpdGhBcGksXG4gIFZlcnNpb25CcmFuY2gsXG59IGZyb20gJy4vdmVyc2lvbi1icmFuY2hlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBkZXRlcm1pbmVkIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgYSBwcm9qZWN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmVSZWxlYXNlVHJhaW5zIHtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcInJlbGVhc2UtY2FuZGlkYXRlXCIgb3IgXCJmZWF0dXJlLWZyZWV6ZVwiIHBoYXNlLiAqL1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsO1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwibGF0ZXN0XCIgcGhhc2UuICovXG4gIGxhdGVzdDogUmVsZWFzZVRyYWluO1xuICAvKiogUmVsZWFzZS10cmFpbiBpbiB0aGUgYG5leHRgIHBoYXNlLiAqL1xuICBuZXh0OiBSZWxlYXNlVHJhaW47XG59XG5cbi8qKiBGZXRjaGVzIHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKFxuICByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGksXG4pOiBQcm9taXNlPEFjdGl2ZVJlbGVhc2VUcmFpbnM+IHtcbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSByZXBvLm5leHRCcmFuY2hOYW1lO1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IG5leHQgPSBuZXcgUmVsZWFzZVRyYWluKG5leHRCcmFuY2hOYW1lLCBuZXh0VmVyc2lvbik7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFpbmAgYnJhbmNoKSBpcyBmb3IgYW4gdXBjb21pbmcgbWFqb3IgdmVyc2lvbiwgd2VcbiAgLy8ga25vdyB0aGF0IHRoZXJlIGlzIG5vIHBhdGNoIGJyYW5jaCBvciBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggZm9yIHRoaXMgbWFqb3JcbiAgLy8gZGlnaXQuIElmIHRoZSBjdXJyZW50IGBuZXh0YCB2ZXJzaW9uIGlzIHRoZSBmaXJzdCBtaW5vciBvZiBhIG1ham9yIHZlcnNpb24sIHdlIGtub3cgdGhhdFxuICAvLyB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoLiBUaGVcbiAgLy8gcGF0Y2ggYnJhbmNoIGlzIGJhc2VkIG9uIHRoYXQsIGVpdGhlciB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaCBvciB0aGUgbGFzdCBtaW5vciBmcm9tIHRoZVxuICAvLyBwcmVjZWRpbmcgbWFqb3IgdmVyc2lvbi4gSW4gYWxsIG90aGVyIGNhc2VzLCB0aGUgcGF0Y2ggYnJhbmNoIGFuZCBmZWF0dXJlLWZyZWV6ZSBvclxuICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggYXJlIHBhcnQgb2YgdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZzpcbiAgLy9cbiAgLy8gIENBU0UgMS4gbmV4dDogMTEuMC4wLW5leHQuMDogcGF0Y2ggYW5kIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGNhbiBvbmx5IGJlXG4gIC8vICAgICAgICAgIG1vc3QgcmVjZW50IGAxMC48Pi54YCBicmFuY2hlcy4gVGhlIEZGL1JDIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgbGFzdC1taW5vciBvZiB2MTAuXG4gIC8vICBDQVNFIDIuIG5leHQ6IDExLjEuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDExLjAueGAgb3IgbGFzdC1taW5vciBpbiB2MTAgYmFzZWRcbiAgLy8gICAgICAgICAgb24gd2hldGhlciB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDExLjAueGApLlxuICAvLyAgQ0FTRSAzLiBuZXh0OiAxMC42LjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMC41LnhgIG9yIGAxMC40LnhgIGJhc2VkIG9uIHdoZXRoZXJcbiAgLy8gICAgICAgICAgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMC41LnhgKVxuICBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDApIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yIC0gMTtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDEpIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IsIG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yKTtcbiAgfVxuXG4gIC8vIENvbGxlY3QgYWxsIHZlcnNpb24tYnJhbmNoZXMgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3IgdGhlIGxhdGVzdCB2ZXJzaW9uLWJyYW5jaCxcbiAgLy8gb3IgdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlLlxuICBjb25zdCBicmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhyZXBvLCBtYWpvclZlcnNpb25zVG9Db25zaWRlcik7XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGV9ID0gYXdhaXQgZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICAgIHJlcG8sXG4gICAgbmV4dFZlcnNpb24sXG4gICAgYnJhbmNoZXMsXG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IsXG4gICk7XG5cbiAgaWYgKGxhdGVzdCA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLm1hcCgoYikgPT4gYi5uYW1lKS5qb2luKCcsICcpfV1gLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdCwgbmV4dH07XG59XG5cbi8qKiBGaW5kcyB0aGUgY3VycmVudGx5IGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmcm9tIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBicmFuY2hlcy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gIHJlcG86IFJlbGVhc2VSZXBvV2l0aEFwaSxcbiAgbmV4dFZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gIGJyYW5jaGVzOiBWZXJzaW9uQnJhbmNoW10sXG4gIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIsXG4pOiBQcm9taXNlPHtcbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsO1xuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsO1xufT4ge1xuICAvLyBWZXJzaW9uIHJlcHJlc2VudGluZyB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIG5leHQgcGhhc2UuIE5vdGUgdGhhdCB3ZSBpZ25vcmVcbiAgLy8gcGF0Y2ggYW5kIHByZS1yZWxlYXNlIHNlZ21lbnRzIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gY29tcGFyZSB0aGUgbmV4dCByZWxlYXNlIHRyYWluIHRvXG4gIC8vIG90aGVyIHJlbGVhc2UgdHJhaW5zIGZyb20gdmVyc2lvbiBicmFuY2hlcyAod2hpY2ggZm9sbG93IHRoZSBgTi5OLnhgIHBhdHRlcm4pLlxuICBjb25zdCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHtuZXh0VmVyc2lvbi5tYWpvcn0uJHtuZXh0VmVyc2lvbi5taW5vcn0uMGApITtcbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSByZXBvLm5leHRCcmFuY2hOYW1lO1xuXG4gIGxldCBsYXRlc3Q6IFJlbGVhc2VUcmFpbiB8IG51bGwgPSBudWxsO1xuICBsZXQgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWluIHwgbnVsbCA9IG51bGw7XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjYXB0dXJlZCBicmFuY2hlcyBhbmQgZmluZCB0aGUgbGF0ZXN0IG5vbi1wcmVyZWxlYXNlIGJyYW5jaCBhbmQgYVxuICAvLyBwb3RlbnRpYWwgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBGcm9tIHRoZSBjb2xsZWN0ZWQgYnJhbmNoZXMgd2UgaXRlcmF0ZSBkZXNjZW5kaW5nXG4gIC8vIG9yZGVyIChtb3N0IHJlY2VudCBzZW1hbnRpYyB2ZXJzaW9uLWJyYW5jaCBmaXJzdCkuIFRoZSBmaXJzdCBicmFuY2ggaXMgZWl0aGVyIHRoZSBsYXRlc3RcbiAgLy8gYWN0aXZlIHZlcnNpb24gYnJhbmNoIChpLmUuIHBhdGNoKSBvciBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gQSBGRi9SQ1xuICAvLyBicmFuY2ggY2Fubm90IGJlIG9sZGVyIHRoYW4gdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2gsIHNvIHdlIHN0b3AgaXRlcmF0aW5nIG9uY2VcbiAgLy8gd2UgZm91bmQgc3VjaCBhIGJyYW5jaC4gT3RoZXJ3aXNlLCBpZiB3ZSBmb3VuZCBhIEZGL1JDIGJyYW5jaCwgd2UgY29udGludWUgbG9va2luZyBmb3IgdGhlXG4gIC8vIG5leHQgdmVyc2lvbi1icmFuY2ggYXMgdGhhdCBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2guIElmIGl0XG4gIC8vIGlzIG5vdCwgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93biBkdWUgdG8gdHdvIEZGL1JDIGJyYW5jaGVzIGV4aXN0aW5nIGF0IHRoZSBzYW1lIHRpbWUuXG4gIGZvciAoY29uc3Qge25hbWUsIHBhcnNlZH0gb2YgYnJhbmNoZXMpIHtcbiAgICAvLyBJdCBjYW4gaGFwcGVuIHRoYXQgdmVyc2lvbiBicmFuY2hlcyBoYXZlIGJlZW4gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgd2hpY2ggYXJlIG1vcmUgcmVjZW50XG4gICAgLy8gdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBicmFuY2ggKGkuZS4gYG1hc3RlcmApLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlc1xuICAgIC8vIHNpbGVudGx5LCBidXQgaXQgbWlnaHQgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndChwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgdmVyc2lvbi1icmFuY2ggXCIke25hbWV9XCIgZm9yIGEgcmVsZWFzZS10cmFpbiB0aGF0IGlzIGAgK1xuICAgICAgICAgIGBtb3JlIHJlY2VudCB0aGFuIHRoZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC4gYCArXG4gICAgICAgICAgYFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgY3JlYXRlZCBieSBhY2NpZGVudCwgb3IgdXBkYXRlIHRoZSBvdXRkYXRlZCBgICtcbiAgICAgICAgICBgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gLFxuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKHNlbXZlci5lcShwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgdmVyc2lvbi1icmFuY2ggXCIke25hbWV9XCIgZm9yIGEgcmVsZWFzZS10cmFpbiB0aGF0IGlzIGFscmVhZHkgYCArXG4gICAgICAgICAgYGFjdGl2ZSBpbiB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC4gUGxlYXNlIGVpdGhlciBkZWxldGUgdGhlIGJyYW5jaCBpZiBgICtcbiAgICAgICAgICBgY3JlYXRlZCBieSBhY2NpZGVudCwgb3IgdXBkYXRlIHRoZSB2ZXJzaW9uIGluIHRoZSBuZXh0IGJyYW5jaCAoJHtuZXh0QnJhbmNoTmFtZX0pLmAsXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHZlcnNpb24gPSBhd2FpdCBnZXRWZXJzaW9uT2ZCcmFuY2gocmVwbywgbmFtZSk7XG4gICAgY29uc3QgcmVsZWFzZVRyYWluID0gbmV3IFJlbGVhc2VUcmFpbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBpc1ByZXJlbGVhc2UgPSB2ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYycgfHwgdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAnbmV4dCc7XG5cbiAgICBpZiAoaXNQcmVyZWxlYXNlKSB7XG4gICAgICBpZiAocmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gRm91bmQgdHdvIGNvbnNlY3V0aXZlIGAgK1xuICAgICAgICAgICAgYGJyYW5jaGVzIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBEaWQgbm90IGV4cGVjdCBib3RoIFwiJHtuYW1lfVwiIGAgK1xuICAgICAgICAgICAgYGFuZCBcIiR7cmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lfVwiIHRvIGJlIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIG1vZGUuYCxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSBpZiAodmVyc2lvbi5tYWpvciAhPT0gZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCBvbGQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBFeHBlY3RlZCBubyBgICtcbiAgICAgICAgICAgIGB2ZXJzaW9uLWJyYW5jaCBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlIGZvciB2JHt2ZXJzaW9uLm1ham9yfS5gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmVsZWFzZUNhbmRpZGF0ZSA9IHJlbGVhc2VUcmFpbjtcbiAgICB9IGVsc2Uge1xuICAgICAgbGF0ZXN0ID0gcmVsZWFzZVRyYWluO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtyZWxlYXNlQ2FuZGlkYXRlLCBsYXRlc3R9O1xufVxuIl19