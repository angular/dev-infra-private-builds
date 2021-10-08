"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findActiveReleaseTrainsFromVersionBranches = exports.fetchActiveReleaseTrains = exports.ActiveReleaseTrains = void 0;
const semver = require("semver");
const release_trains_1 = require("./release-trains");
const version_branches_1 = require("./version-branches");
/** The active release trains for a project. */
class ActiveReleaseTrains {
    constructor(trains) {
        this.trains = trains;
        /** Release-train currently in the "release-candidate" or "feature-freeze" phase. */
        this.releaseCandidate = this.trains.releaseCandidate || null;
        /** Release-train in the `next` phase. */
        this.next = this.trains.next;
        /** Release-train currently in the "latest" phase. */
        this.latest = this.trains.latest;
    }
    /** Whether the active release trains indicate the repository is in a feature freeze state. */
    isFeatureFreeze() {
        return this.releaseCandidate !== null && this.releaseCandidate.version.prerelease[0] === 'next';
    }
}
exports.ActiveReleaseTrains = ActiveReleaseTrains;
/** Fetches the active release trains for the configured project. */
async function fetchActiveReleaseTrains(repo) {
    const nextBranchName = repo.nextBranchName;
    const nextVersion = await (0, version_branches_1.getVersionOfBranch)(repo, nextBranchName);
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
    const branches = await (0, version_branches_1.getBranchesForMajorVersions)(repo, majorVersionsToConsider);
    const { latest, releaseCandidate } = await findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor);
    if (latest === null) {
        throw Error(`Unable to determine the latest release-train. The following branches ` +
            `have been considered: [${branches.map((b) => b.name).join(', ')}]`);
    }
    return new ActiveReleaseTrains({ releaseCandidate, next, latest });
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
        const version = await (0, version_branches_1.getVersionOfBranch)(repo, name);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vbmctZGV2L3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDLHFEQUE4QztBQUM5Qyx5REFLNEI7QUFFNUIsK0NBQStDO0FBQy9DLE1BQWEsbUJBQW1CO0lBUTlCLFlBQ1UsTUFJUDtRQUpPLFdBQU0sR0FBTixNQUFNLENBSWI7UUFaSCxvRkFBb0Y7UUFDM0UscUJBQWdCLEdBQXdCLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDO1FBQ3RGLHlDQUF5QztRQUNoQyxTQUFJLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQy9DLHFEQUFxRDtRQUM1QyxXQUFNLEdBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0lBUWhELENBQUM7SUFFSiw4RkFBOEY7SUFDOUYsZUFBZTtRQUNiLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUM7SUFDbEcsQ0FBQztDQUNGO0FBcEJELGtEQW9CQztBQUVELG9FQUFvRTtBQUM3RCxLQUFLLFVBQVUsd0JBQXdCLENBQzVDLElBQXdCO0lBRXhCLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7SUFDM0MsTUFBTSxXQUFXLEdBQUcsTUFBTSxJQUFBLHFDQUFrQixFQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztJQUNuRSxNQUFNLElBQUksR0FBRyxJQUFJLDZCQUFZLENBQUMsY0FBYyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQzNELE1BQU0sdUJBQXVCLEdB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ICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4vcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtcbiAgZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zLFxuICBnZXRWZXJzaW9uT2ZCcmFuY2gsXG4gIFJlbGVhc2VSZXBvV2l0aEFwaSxcbiAgVmVyc2lvbkJyYW5jaCxcbn0gZnJvbSAnLi92ZXJzaW9uLWJyYW5jaGVzJztcblxuLyoqIFRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZm9yIGEgcHJvamVjdC4gKi9cbmV4cG9ydCBjbGFzcyBBY3RpdmVSZWxlYXNlVHJhaW5zIHtcbiAgLyoqIFJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcInJlbGVhc2UtY2FuZGlkYXRlXCIgb3IgXCJmZWF0dXJlLWZyZWV6ZVwiIHBoYXNlLiAqL1xuICByZWFkb25seSByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsID0gdGhpcy50cmFpbnMucmVsZWFzZUNhbmRpZGF0ZSB8fCBudWxsO1xuICAvKiogUmVsZWFzZS10cmFpbiBpbiB0aGUgYG5leHRgIHBoYXNlLiAqL1xuICByZWFkb25seSBuZXh0OiBSZWxlYXNlVHJhaW4gPSB0aGlzLnRyYWlucy5uZXh0O1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwibGF0ZXN0XCIgcGhhc2UuICovXG4gIHJlYWRvbmx5IGxhdGVzdDogUmVsZWFzZVRyYWluID0gdGhpcy50cmFpbnMubGF0ZXN0O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgdHJhaW5zOiB7XG4gICAgICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsO1xuICAgICAgbmV4dDogUmVsZWFzZVRyYWluO1xuICAgICAgbGF0ZXN0OiBSZWxlYXNlVHJhaW47XG4gICAgfSxcbiAgKSB7fVxuXG4gIC8qKiBXaGV0aGVyIHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgaW5kaWNhdGUgdGhlIHJlcG9zaXRvcnkgaXMgaW4gYSBmZWF0dXJlIGZyZWV6ZSBzdGF0ZS4gKi9cbiAgaXNGZWF0dXJlRnJlZXplKCkge1xuICAgIHJldHVybiB0aGlzLnJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiYgdGhpcy5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuICB9XG59XG5cbi8qKiBGZXRjaGVzIHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKFxuICByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGksXG4pOiBQcm9taXNlPEFjdGl2ZVJlbGVhc2VUcmFpbnM+IHtcbiAgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSByZXBvLm5leHRCcmFuY2hOYW1lO1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IG5leHQgPSBuZXcgUmVsZWFzZVRyYWluKG5leHRCcmFuY2hOYW1lLCBuZXh0VmVyc2lvbik7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFpbmAgYnJhbmNoKSBpcyBmb3IgYW4gdXBjb21pbmcgbWFqb3IgdmVyc2lvbiwgd2VcbiAgLy8ga25vdyB0aGF0IHRoZXJlIGlzIG5vIHBhdGNoIGJyYW5jaCBvciBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggZm9yIHRoaXMgbWFqb3JcbiAgLy8gZGlnaXQuIElmIHRoZSBjdXJyZW50IGBuZXh0YCB2ZXJzaW9uIGlzIHRoZSBmaXJzdCBtaW5vciBvZiBhIG1ham9yIHZlcnNpb24sIHdlIGtub3cgdGhhdFxuICAvLyB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoLiBUaGVcbiAgLy8gcGF0Y2ggYnJhbmNoIGlzIGJhc2VkIG9uIHRoYXQsIGVpdGhlciB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaCBvciB0aGUgbGFzdCBtaW5vciBmcm9tIHRoZVxuICAvLyBwcmVjZWRpbmcgbWFqb3IgdmVyc2lvbi4gSW4gYWxsIG90aGVyIGNhc2VzLCB0aGUgcGF0Y2ggYnJhbmNoIGFuZCBmZWF0dXJlLWZyZWV6ZSBvclxuICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggYXJlIHBhcnQgb2YgdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi4gQ29uc2lkZXIgdGhlIGZvbGxvd2luZzpcbiAgLy9cbiAgLy8gIENBU0UgMS4gbmV4dDogMTEuMC4wLW5leHQuMDogcGF0Y2ggYW5kIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGNhbiBvbmx5IGJlXG4gIC8vICAgICAgICAgIG1vc3QgcmVjZW50IGAxMC48Pi54YCBicmFuY2hlcy4gVGhlIEZGL1JDIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgbGFzdC1taW5vciBvZiB2MTAuXG4gIC8vICBDQVNFIDIuIG5leHQ6IDExLjEuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDExLjAueGAgb3IgbGFzdC1taW5vciBpbiB2MTAgYmFzZWRcbiAgLy8gICAgICAgICAgb24gd2hldGhlciB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDExLjAueGApLlxuICAvLyAgQ0FTRSAzLiBuZXh0OiAxMC42LjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMC41LnhgIG9yIGAxMC40LnhgIGJhc2VkIG9uIHdoZXRoZXJcbiAgLy8gICAgICAgICAgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMC41LnhgKVxuICBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDApIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yIC0gMTtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSBpZiAobmV4dFZlcnNpb24ubWlub3IgPT09IDEpIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IsIG5leHRWZXJzaW9uLm1ham9yIC0gMSk7XG4gIH0gZWxzZSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yKTtcbiAgfVxuXG4gIC8vIENvbGxlY3QgYWxsIHZlcnNpb24tYnJhbmNoZXMgdGhhdCBzaG91bGQgYmUgY29uc2lkZXJlZCBmb3IgdGhlIGxhdGVzdCB2ZXJzaW9uLWJyYW5jaCxcbiAgLy8gb3IgdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlLlxuICBjb25zdCBicmFuY2hlcyA9IGF3YWl0IGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhyZXBvLCBtYWpvclZlcnNpb25zVG9Db25zaWRlcik7XG4gIGNvbnN0IHtsYXRlc3QsIHJlbGVhc2VDYW5kaWRhdGV9ID0gYXdhaXQgZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICAgIHJlcG8sXG4gICAgbmV4dFZlcnNpb24sXG4gICAgYnJhbmNoZXMsXG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IsXG4gICk7XG5cbiAgaWYgKGxhdGVzdCA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLm1hcCgoYikgPT4gYi5uYW1lKS5qb2luKCcsICcpfV1gLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gbmV3IEFjdGl2ZVJlbGVhc2VUcmFpbnMoe3JlbGVhc2VDYW5kaWRhdGUsIG5leHQsIGxhdGVzdH0pO1xufVxuXG4vKiogRmluZHMgdGhlIGN1cnJlbnRseSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZnJvbSB0aGUgc3BlY2lmaWVkIHZlcnNpb24gYnJhbmNoZXMuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluZEFjdGl2ZVJlbGVhc2VUcmFpbnNGcm9tVmVyc2lvbkJyYW5jaGVzKFxuICByZXBvOiBSZWxlYXNlUmVwb1dpdGhBcGksXG4gIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdLFxuICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyLFxuKTogUHJvbWlzZTx7XG4gIGxhdGVzdDogUmVsZWFzZVRyYWluIHwgbnVsbDtcbiAgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWluIHwgbnVsbDtcbn0+IHtcbiAgLy8gVmVyc2lvbiByZXByZXNlbnRpbmcgdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBuZXh0IHBoYXNlLiBOb3RlIHRoYXQgd2UgaWdub3JlXG4gIC8vIHBhdGNoIGFuZCBwcmUtcmVsZWFzZSBzZWdtZW50cyBpbiBvcmRlciB0byBiZSBhYmxlIHRvIGNvbXBhcmUgdGhlIG5leHQgcmVsZWFzZSB0cmFpbiB0b1xuICAvLyBvdGhlciByZWxlYXNlIHRyYWlucyBmcm9tIHZlcnNpb24gYnJhbmNoZXMgKHdoaWNoIGZvbGxvdyB0aGUgYE4uTi54YCBwYXR0ZXJuKS5cbiAgY29uc3QgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7bmV4dFZlcnNpb24ubWFqb3J9LiR7bmV4dFZlcnNpb24ubWlub3J9LjBgKSE7XG4gIGNvbnN0IG5leHRCcmFuY2hOYW1lID0gcmVwby5uZXh0QnJhbmNoTmFtZTtcblxuICBsZXQgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsID0gbnVsbDtcbiAgbGV0IHJlbGVhc2VDYW5kaWRhdGU6IFJlbGVhc2VUcmFpbiB8IG51bGwgPSBudWxsO1xuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgY2FwdHVyZWQgYnJhbmNoZXMgYW5kIGZpbmQgdGhlIGxhdGVzdCBub24tcHJlcmVsZWFzZSBicmFuY2ggYW5kIGFcbiAgLy8gcG90ZW50aWFsIHJlbGVhc2UgY2FuZGlkYXRlIGJyYW5jaC4gRnJvbSB0aGUgY29sbGVjdGVkIGJyYW5jaGVzIHdlIGl0ZXJhdGUgZGVzY2VuZGluZ1xuICAvLyBvcmRlciAobW9zdCByZWNlbnQgc2VtYW50aWMgdmVyc2lvbi1icmFuY2ggZmlyc3QpLiBUaGUgZmlyc3QgYnJhbmNoIGlzIGVpdGhlciB0aGUgbGF0ZXN0XG4gIC8vIGFjdGl2ZSB2ZXJzaW9uIGJyYW5jaCAoaS5lLiBwYXRjaCkgb3IgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2guIEEgRkYvUkNcbiAgLy8gYnJhbmNoIGNhbm5vdCBiZSBvbGRlciB0aGFuIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLCBzbyB3ZSBzdG9wIGl0ZXJhdGluZyBvbmNlXG4gIC8vIHdlIGZvdW5kIHN1Y2ggYSBicmFuY2guIE90aGVyd2lzZSwgaWYgd2UgZm91bmQgYSBGRi9SQyBicmFuY2gsIHdlIGNvbnRpbnVlIGxvb2tpbmcgZm9yIHRoZVxuICAvLyBuZXh0IHZlcnNpb24tYnJhbmNoIGFzIHRoYXQgb25lIGlzIHN1cHBvc2VkIHRvIGJlIHRoZSBsYXRlc3QgYWN0aXZlIHZlcnNpb24tYnJhbmNoLiBJZiBpdFxuICAvLyBpcyBub3QsIHRoZW4gYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24gZHVlIHRvIHR3byBGRi9SQyBicmFuY2hlcyBleGlzdGluZyBhdCB0aGUgc2FtZSB0aW1lLlxuICBmb3IgKGNvbnN0IHtuYW1lLCBwYXJzZWR9IG9mIGJyYW5jaGVzKSB7XG4gICAgLy8gSXQgY2FuIGhhcHBlbiB0aGF0IHZlcnNpb24gYnJhbmNoZXMgaGF2ZSBiZWVuIGFjY2lkZW50YWxseSBjcmVhdGVkIHdoaWNoIGFyZSBtb3JlIHJlY2VudFxuICAgIC8vIHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gaW4gdGhlIG5leHQgYnJhbmNoIChpLmUuIGBtYXN0ZXJgKS4gV2UgY291bGQgaWdub3JlIHN1Y2ggYnJhbmNoZXNcbiAgICAvLyBzaWxlbnRseSwgYnV0IGl0IG1pZ2h0IGJlIHN5bXB0b21hdGljIGZvciBhbiBvdXRkYXRlZCB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgYnJhbmNoLCBvciBhblxuICAgIC8vIGFjY2lkZW50YWxseSBjcmVhdGVkIGJyYW5jaCBieSB0aGUgY2FyZXRha2VyLiBJbiBlaXRoZXIgd2F5IHdlIHdhbnQgdG8gcmFpc2UgYXdhcmVuZXNzLlxuICAgIGlmIChzZW12ZXIuZ3QocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBgICtcbiAgICAgICAgICBgbW9yZSByZWNlbnQgdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIGAgK1xuICAgICAgICAgIGBQbGVhc2UgZWl0aGVyIGRlbGV0ZSB0aGUgYnJhbmNoIGlmIGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgb3V0ZGF0ZWQgYCArXG4gICAgICAgICAgYHZlcnNpb24gaW4gdGhlIG5leHQgYnJhbmNoICgke25leHRCcmFuY2hOYW1lfSkuYCxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzZW12ZXIuZXEocGFyc2VkLCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbikpIHtcbiAgICAgIHRocm93IEVycm9yKFxuICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IG5ldyBSZWxlYXNlVHJhaW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3QgaXNQcmVyZWxlYXNlID0gdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnIHx8IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuXG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgbGF0ZXN0IHJlbGVhc2UtdHJhaW4uIEZvdW5kIHR3byBjb25zZWN1dGl2ZSBgICtcbiAgICAgICAgICAgIGBicmFuY2hlcyBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gRGlkIG5vdCBleHBlY3QgYm90aCBcIiR7bmFtZX1cIiBgICtcbiAgICAgICAgICAgIGBhbmQgXCIke3JlbGVhc2VDYW5kaWRhdGUuYnJhbmNoTmFtZX1cIiB0byBiZSBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlLmAsXG4gICAgICAgICk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgIGBEaXNjb3ZlcmVkIHVuZXhwZWN0ZWQgb2xkIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gRXhwZWN0ZWQgbm8gYCArXG4gICAgICAgICAgICBgdmVyc2lvbi1icmFuY2ggaW4gZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgbW9kZSBmb3IgdiR7dmVyc2lvbi5tYWpvcn0uYCxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGUgPSByZWxlYXNlVHJhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhdGVzdCA9IHJlbGVhc2VUcmFpbjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZSwgbGF0ZXN0fTtcbn1cbiJdfQ==