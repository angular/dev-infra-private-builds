/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import * as semver from 'semver';
import { ReleaseTrain } from './release-trains';
import { getBranchesForMajorVersions, getVersionOfBranch } from './version-branches';
/** Branch name for the `next` branch. */
export const nextBranchName = 'master';
/** Fetches the active release trains for the configured project. */
export function fetchActiveReleaseTrains(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const nextVersion = yield getVersionOfBranch(repo, nextBranchName);
        const next = new ReleaseTrain(nextBranchName, nextVersion);
        const majorVersionsToConsider = [];
        let expectedReleaseCandidateMajor;
        // If the `next` branch (i.e. `master` branch) is for an upcoming major version, we know
        // that there is no patch branch or feature-freeze/release-candidate branch for this major
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
        const branches = yield getBranchesForMajorVersions(repo, majorVersionsToConsider);
        const { latest, releaseCandidate } = yield findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor);
        if (latest === null) {
            throw Error(`Unable to determine the latest release-train. The following branches ` +
                `have been considered: [${branches.map(b => b.name).join(', ')}]`);
        }
        return { releaseCandidate, latest, next };
    });
}
/** Finds the currently active release trains from the specified version branches. */
export function findActiveReleaseTrainsFromVersionBranches(repo, nextVersion, branches, expectedReleaseCandidateMajor) {
    return __awaiter(this, void 0, void 0, function* () {
        // Version representing the release-train currently in the next phase. Note that we ignore
        // patch and pre-release segments in order to be able to compare the next release train to
        // other release trains from version branches (which follow the `N.N.x` pattern).
        const nextReleaseTrainVersion = semver.parse(`${nextVersion.major}.${nextVersion.minor}.0`);
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
            const version = yield getVersionOfBranch(repo, name);
            const releaseTrain = new ReleaseTrain(name, version);
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
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsa0JBQWtCLEVBQW1DLE1BQU0sb0JBQW9CLENBQUM7QUFZckgseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFFdkMsb0VBQW9FO0FBQ3BFLE1BQU0sVUFBZ0Isd0JBQXdCLENBQUMsSUFBdUI7O1FBRXBFLE1BQU0sV0FBVyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMzRCxNQUFNLHVCQUF1QixHQUFhLEVBQUUsQ0FBQztRQUM3QyxJQUFJLDZCQUFxQyxDQUFDO1FBRTFDLHdGQUF3RjtRQUN4RiwwRkFBMEY7UUFDMUYsMkZBQTJGO1FBQzNGLHVGQUF1RjtRQUN2RiwyRkFBMkY7UUFDM0Ysc0ZBQXNGO1FBQ3RGLHVGQUF1RjtRQUN2RixFQUFFO1FBQ0YsdUZBQXVGO1FBQ3ZGLCtGQUErRjtRQUMvRix3RkFBd0Y7UUFDeEYsd0ZBQXdGO1FBQ3hGLDBGQUEwRjtRQUMxRiw0RUFBNEU7UUFDNUUsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtZQUMzQiw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUN0RCx1QkFBdUIsQ0FBQyxJQUFJLENB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VSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQztZQUV4RixJQUFJLFlBQVksRUFBRTtnQkFDaEIsSUFBSSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7b0JBQzdCLE1BQU0sS0FBSyxDQUNQLGtFQUFrRTt3QkFDbEUsNEVBQTRFLElBQUksSUFBSTt3QkFDcEYsUUFBUSxnQkFBZ0IsQ0FBQyxVQUFVLG1EQUFtRCxDQUFDLENBQUM7aUJBQzdGO3FCQUFNLElBQUksT0FBTyxDQUFDLEtBQUssS0FBSyw2QkFBNkIsRUFBRTtvQkFDMUQsTUFBTSxLQUFLLENBQ1AsaUZBQWlGO3dCQUNqRixnRUFBZ0UsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7aUJBQ3ZGO2dCQUNELGdCQUFnQixHQUFHLFlBQVksQ0FBQzthQUNqQztpQkFBTTtnQkFDTCxNQUFNLEdBQUcsWUFBWSxDQUFDO2dCQUN0QixNQUFNO2FBQ1A7U0FDRjtRQUVELE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZVRyYWlufSBmcm9tICcuL3JlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7Z2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zLCBnZXRWZXJzaW9uT2ZCcmFuY2gsIEdpdGh1YlJlcG9XaXRoQXBpLCBWZXJzaW9uQnJhbmNofSBmcm9tICcuL3ZlcnNpb24tYnJhbmNoZXMnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgZGV0ZXJtaW5lZCBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgZm9yIGEgcHJvamVjdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZlUmVsZWFzZVRyYWlucyB7XG4gIC8qKiBSZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgXCJyZWxlYXNlLWNhbmRpZGF0ZVwiIG9yIFwiZmVhdHVyZS1mcmVlemVcIiBwaGFzZS4gKi9cbiAgcmVsZWFzZUNhbmRpZGF0ZTogUmVsZWFzZVRyYWlufG51bGw7XG4gIC8qKiBSZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGUgXCJsYXRlc3RcIiBwaGFzZS4gKi9cbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW47XG4gIC8qKiBSZWxlYXNlLXRyYWluIGluIHRoZSBgbmV4dGAgcGhhc2UuICovXG4gIG5leHQ6IFJlbGVhc2VUcmFpbjtcbn1cblxuLyoqIEJyYW5jaCBuYW1lIGZvciB0aGUgYG5leHRgIGJyYW5jaC4gKi9cbmV4cG9ydCBjb25zdCBuZXh0QnJhbmNoTmFtZSA9ICdtYXN0ZXInO1xuXG4vKiogRmV0Y2hlcyB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvOiBHaXRodWJSZXBvV2l0aEFwaSk6XG4gICAgUHJvbWlzZTxBY3RpdmVSZWxlYXNlVHJhaW5zPiB7XG4gIGNvbnN0IG5leHRWZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5leHRCcmFuY2hOYW1lKTtcbiAgY29uc3QgbmV4dCA9IG5ldyBSZWxlYXNlVHJhaW4obmV4dEJyYW5jaE5hbWUsIG5leHRWZXJzaW9uKTtcbiAgY29uc3QgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXI6IG51bWJlcltdID0gW107XG4gIGxldCBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvcjogbnVtYmVyO1xuXG4gIC8vIElmIHRoZSBgbmV4dGAgYnJhbmNoIChpLmUuIGBtYXN0ZXJgIGJyYW5jaCkgaXMgZm9yIGFuIHVwY29taW5nIG1ham9yIHZlcnNpb24sIHdlIGtub3dcbiAgLy8gdGhhdCB0aGVyZSBpcyBubyBwYXRjaCBicmFuY2ggb3IgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGZvciB0aGlzIG1ham9yXG4gIC8vIGRpZ2l0LiBJZiB0aGUgY3VycmVudCBgbmV4dGAgdmVyc2lvbiBpcyB0aGUgZmlyc3QgbWlub3Igb2YgYSBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93IHRoYXRcbiAgLy8gdGhlIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBjYW4gb25seSBiZSB0aGUgYWN0dWFsIG1ham9yIGJyYW5jaC4gVGhlXG4gIC8vIHBhdGNoIGJyYW5jaCBpcyBiYXNlZCBvbiB0aGF0LCBlaXRoZXIgdGhlIGFjdHVhbCBtYWpvciBicmFuY2ggb3IgdGhlIGxhc3QgbWlub3IgZnJvbSB0aGVcbiAgLy8gcHJlY2VkaW5nIG1ham9yIHZlcnNpb24uIEluIGFsbCBvdGhlciBjYXNlcywgdGhlIHBhdGNoIGJyYW5jaCBhbmQgZmVhdHVyZS1mcmVlemUgb3JcbiAgLy8gcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoIGFyZSBwYXJ0IG9mIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uIENvbnNpZGVyIHRoZSBmb2xsb3dpbmc6XG4gIC8vXG4gIC8vICBDQVNFIDEuIG5leHQ6IDExLjAuMC1uZXh0LjA6IHBhdGNoIGFuZCBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBjYW4gb25seSBiZVxuICAvLyAgICAgICAgICBtb3N0IHJlY2VudCBgMTAuPD4ueGAgYnJhbmNoZXMuIFRoZSBGRi9SQyBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGxhc3QtbWlub3Igb2YgdjEwLlxuICAvLyAgQ0FTRSAyLiBuZXh0OiAxMS4xLjAtbmV4dC4wOiBwYXRjaCBjYW4gYmUgZWl0aGVyIGAxMS4wLnhgIG9yIGxhc3QtbWlub3IgaW4gdjEwIGJhc2VkXG4gIC8vICAgICAgICAgIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKD0+IGAxMS4wLnhgKS5cbiAgLy8gIENBU0UgMy4gbmV4dDogMTAuNi4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTAuNS54YCBvciBgMTAuNC54YCBiYXNlZCBvbiB3aGV0aGVyXG4gIC8vICAgICAgICAgIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTAuNS54YClcbiAgaWYgKG5leHRWZXJzaW9uLm1pbm9yID09PSAwKSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvciAtIDE7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciAtIDEpO1xuICB9IGVsc2UgaWYgKG5leHRWZXJzaW9uLm1pbm9yID09PSAxKSB7XG4gICAgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IgPSBuZXh0VmVyc2lvbi5tYWpvcjtcbiAgICBtYWpvclZlcnNpb25zVG9Db25zaWRlci5wdXNoKG5leHRWZXJzaW9uLm1ham9yLCBuZXh0VmVyc2lvbi5tYWpvciAtIDEpO1xuICB9IGVsc2Uge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvcik7XG4gIH1cblxuICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgc2hvdWxkIGJlIGNvbnNpZGVyZWQgZm9yIHRoZSBsYXRlc3QgdmVyc2lvbi1icmFuY2gsXG4gIC8vIG9yIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZS5cbiAgY29uc3QgYnJhbmNoZXMgPSBhd2FpdCBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMocmVwbywgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIpO1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlfSA9IGF3YWl0IGZpbmRBY3RpdmVSZWxlYXNlVHJhaW5zRnJvbVZlcnNpb25CcmFuY2hlcyhcbiAgICAgIHJlcG8sIG5leHRWZXJzaW9uLCBicmFuY2hlcywgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IpO1xuXG4gIGlmIChsYXRlc3QgPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLm1hcChiID0+IGIubmFtZSkuam9pbignLCAnKX1dYCk7XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdCwgbmV4dH07XG59XG5cbi8qKiBGaW5kcyB0aGUgY3VycmVudGx5IGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmcm9tIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBicmFuY2hlcy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdLFxuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIpOiBQcm9taXNlPHtcbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsLFxuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsLFxufT4ge1xuICAvLyBWZXJzaW9uIHJlcHJlc2VudGluZyB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIG5leHQgcGhhc2UuIE5vdGUgdGhhdCB3ZSBpZ25vcmVcbiAgLy8gcGF0Y2ggYW5kIHByZS1yZWxlYXNlIHNlZ21lbnRzIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gY29tcGFyZSB0aGUgbmV4dCByZWxlYXNlIHRyYWluIHRvXG4gIC8vIG90aGVyIHJlbGVhc2UgdHJhaW5zIGZyb20gdmVyc2lvbiBicmFuY2hlcyAod2hpY2ggZm9sbG93IHRoZSBgTi5OLnhgIHBhdHRlcm4pLlxuICBjb25zdCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHtuZXh0VmVyc2lvbi5tYWpvcn0uJHtuZXh0VmVyc2lvbi5taW5vcn0uMGApITtcblxuICBsZXQgbGF0ZXN0OiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG4gIGxldCByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjYXB0dXJlZCBicmFuY2hlcyBhbmQgZmluZCB0aGUgbGF0ZXN0IG5vbi1wcmVyZWxlYXNlIGJyYW5jaCBhbmQgYVxuICAvLyBwb3RlbnRpYWwgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBGcm9tIHRoZSBjb2xsZWN0ZWQgYnJhbmNoZXMgd2UgaXRlcmF0ZSBkZXNjZW5kaW5nXG4gIC8vIG9yZGVyIChtb3N0IHJlY2VudCBzZW1hbnRpYyB2ZXJzaW9uLWJyYW5jaCBmaXJzdCkuIFRoZSBmaXJzdCBicmFuY2ggaXMgZWl0aGVyIHRoZSBsYXRlc3RcbiAgLy8gYWN0aXZlIHZlcnNpb24gYnJhbmNoIChpLmUuIHBhdGNoKSBvciBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gQSBGRi9SQ1xuICAvLyBicmFuY2ggY2Fubm90IGJlIG9sZGVyIHRoYW4gdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2gsIHNvIHdlIHN0b3AgaXRlcmF0aW5nIG9uY2VcbiAgLy8gd2UgZm91bmQgc3VjaCBhIGJyYW5jaC4gT3RoZXJ3aXNlLCBpZiB3ZSBmb3VuZCBhIEZGL1JDIGJyYW5jaCwgd2UgY29udGludWUgbG9va2luZyBmb3IgdGhlXG4gIC8vIG5leHQgdmVyc2lvbi1icmFuY2ggYXMgdGhhdCBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2guIElmIGl0XG4gIC8vIGlzIG5vdCwgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93biBkdWUgdG8gdHdvIEZGL1JDIGJyYW5jaGVzIGV4aXN0aW5nIGF0IHRoZSBzYW1lIHRpbWUuXG4gIGZvciAoY29uc3Qge25hbWUsIHBhcnNlZH0gb2YgYnJhbmNoZXMpIHtcbiAgICAvLyBJdCBjYW4gaGFwcGVuIHRoYXQgdmVyc2lvbiBicmFuY2hlcyBoYXZlIGJlZW4gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgd2hpY2ggYXJlIG1vcmUgcmVjZW50XG4gICAgLy8gdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBicmFuY2ggKGkuZS4gYG1hc3RlcmApLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlc1xuICAgIC8vIHNpbGVudGx5LCBidXQgaXQgbWlnaHQgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndChwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYCArXG4gICAgICAgICAgYG1vcmUgcmVjZW50IHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGVpdGhlciBkZWxldGUgdGhlIGJyYW5jaCBpZiBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIG91dGRhdGVkIGAgK1xuICAgICAgICAgIGB2ZXJzaW9uIGluIHRoZSBuZXh0IGJyYW5jaCAoJHtuZXh0QnJhbmNoTmFtZX0pLmApO1xuICAgIH0gZWxzZSBpZiAoc2VtdmVyLmVxKHBhcnNlZCwgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24pKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IG5ldyBSZWxlYXNlVHJhaW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3QgaXNQcmVyZWxlYXNlID0gdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnIHx8IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuXG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gRm91bmQgdHdvIGNvbnNlY3V0aXZlIGAgK1xuICAgICAgICAgICAgYGJyYW5jaGVzIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBEaWQgbm90IGV4cGVjdCBib3RoIFwiJHtuYW1lfVwiIGAgK1xuICAgICAgICAgICAgYGFuZCBcIiR7cmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lfVwiIHRvIGJlIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIG1vZGUuYCk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCBvbGQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBFeHBlY3RlZCBubyBgICtcbiAgICAgICAgICAgIGB2ZXJzaW9uLWJyYW5jaCBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlIGZvciB2JHt2ZXJzaW9uLm1ham9yfS5gKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGUgPSByZWxlYXNlVHJhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhdGVzdCA9IHJlbGVhc2VUcmFpbjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZSwgbGF0ZXN0fTtcbn1cbiJdfQ==