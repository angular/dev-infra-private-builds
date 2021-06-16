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
        const branches = (yield getBranchesForMajorVersions(repo, majorVersionsToConsider));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZlLXJlbGVhc2UtdHJhaW5zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sS0FBSyxNQUFNLE1BQU0sUUFBUSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUM5QyxPQUFPLEVBQUMsMkJBQTJCLEVBQUUsa0JBQWtCLEVBQW1DLE1BQU0sb0JBQW9CLENBQUM7QUFZckgseUNBQXlDO0FBQ3pDLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUM7QUFFdkMsb0VBQW9FO0FBQ3BFLE1BQU0sVUFBZ0Isd0JBQXdCLENBQUMsSUFBdUI7O1FBRXBFLE1BQU0sV0FBVyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLGNBQWMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUMzRCxNQUFNLHVCQUF1QixHQUFhLEVBQUUsQ0FBQztRQUM3QyxJQUFJLDZCQUFxQyxDQUFDO1FBRTFDLHdGQUF3RjtRQUN4RiwwRkFBMEY7UUFDMUYsMkZBQTJGO1FBQzNGLHVGQUF1RjtRQUN2RiwyRkFBMkY7UUFDM0Ysc0ZBQXNGO1FBQ3RGLHVGQUF1RjtRQUN2RixFQUFFO1FBQ0YsdUZBQXVGO1FBQ3ZGLCtGQUErRjtRQUMvRix3RkFBd0Y7UUFDeEYsd0ZBQXdGO1FBQ3hGLDBGQUEwRjtRQUMxRiw0RUFBNEU7UUFDNUUsSUFBSSxXQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtZQUMzQiw2QkFBNkIsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUN0RCx1QkFBdUIsQ0FBQyxJQUFJLENB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TyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLENBQUM7WUFFeEYsSUFBSSxZQUFZLEVBQUU7Z0JBQ2hCLElBQUksZ0JBQWdCLEtBQUssSUFBSSxFQUFFO29CQUM3QixNQUFNLEtBQUssQ0FDUCxrRUFBa0U7d0JBQ2xFLDRFQUE0RSxJQUFJLElBQUk7d0JBQ3BGLFFBQVEsZ0JBQWdCLENBQUMsVUFBVSxtREFBbUQsQ0FBQyxDQUFDO2lCQUM3RjtxQkFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssNkJBQTZCLEVBQUU7b0JBQzFELE1BQU0sS0FBSyxDQUNQLGlGQUFpRjt3QkFDakYsZ0VBQWdFLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2lCQUN2RjtnQkFDRCxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7YUFDakM7aUJBQU07Z0JBQ0wsTUFBTSxHQUFHLFlBQVksQ0FBQztnQkFDdEIsTUFBTTthQUNQO1NBQ0Y7UUFFRCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUUsTUFBTSxFQUFDLENBQUM7SUFDcEMsQ0FBQztDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VUcmFpbn0gZnJvbSAnLi9yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2dldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucywgZ2V0VmVyc2lvbk9mQnJhbmNoLCBHaXRodWJSZXBvV2l0aEFwaSwgVmVyc2lvbkJyYW5jaH0gZnJvbSAnLi92ZXJzaW9uLWJyYW5jaGVzJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGRldGVybWluZWQgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIGZvciBhIHByb2plY3QuICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2ZVJlbGVhc2VUcmFpbnMge1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwicmVsZWFzZS1jYW5kaWRhdGVcIiBvciBcImZlYXR1cmUtZnJlZXplXCIgcGhhc2UuICovXG4gIHJlbGVhc2VDYW5kaWRhdGU6IFJlbGVhc2VUcmFpbnxudWxsO1xuICAvKiogUmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIFwibGF0ZXN0XCIgcGhhc2UuICovXG4gIGxhdGVzdDogUmVsZWFzZVRyYWluO1xuICAvKiogUmVsZWFzZS10cmFpbiBpbiB0aGUgYG5leHRgIHBoYXNlLiAqL1xuICBuZXh0OiBSZWxlYXNlVHJhaW47XG59XG5cbi8qKiBCcmFuY2ggbmFtZSBmb3IgdGhlIGBuZXh0YCBicmFuY2guICovXG5leHBvcnQgY29uc3QgbmV4dEJyYW5jaE5hbWUgPSAnbWFzdGVyJztcblxuLyoqIEZldGNoZXMgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbzogR2l0aHViUmVwb1dpdGhBcGkpOlxuICAgIFByb21pc2U8QWN0aXZlUmVsZWFzZVRyYWlucz4ge1xuICBjb25zdCBuZXh0VmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBuZXh0QnJhbmNoTmFtZSk7XG4gIGNvbnN0IG5leHQgPSBuZXcgUmVsZWFzZVRyYWluKG5leHRCcmFuY2hOYW1lLCBuZXh0VmVyc2lvbik7XG4gIGNvbnN0IG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyOiBudW1iZXJbXSA9IFtdO1xuICBsZXQgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3I6IG51bWJlcjtcblxuICAvLyBJZiB0aGUgYG5leHRgIGJyYW5jaCAoaS5lLiBgbWFzdGVyYCBicmFuY2gpIGlzIGZvciBhbiB1cGNvbWluZyBtYWpvciB2ZXJzaW9uLCB3ZSBrbm93XG4gIC8vIHRoYXQgdGhlcmUgaXMgbm8gcGF0Y2ggYnJhbmNoIG9yIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBmb3IgdGhpcyBtYWpvclxuICAvLyBkaWdpdC4gSWYgdGhlIGN1cnJlbnQgYG5leHRgIHZlcnNpb24gaXMgdGhlIGZpcnN0IG1pbm9yIG9mIGEgbWFqb3IgdmVyc2lvbiwgd2Uga25vdyB0aGF0XG4gIC8vIHRoZSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggY2FuIG9ubHkgYmUgdGhlIGFjdHVhbCBtYWpvciBicmFuY2guIFRoZVxuICAvLyBwYXRjaCBicmFuY2ggaXMgYmFzZWQgb24gdGhhdCwgZWl0aGVyIHRoZSBhY3R1YWwgbWFqb3IgYnJhbmNoIG9yIHRoZSBsYXN0IG1pbm9yIGZyb20gdGhlXG4gIC8vIHByZWNlZGluZyBtYWpvciB2ZXJzaW9uLiBJbiBhbGwgb3RoZXIgY2FzZXMsIHRoZSBwYXRjaCBicmFuY2ggYW5kIGZlYXR1cmUtZnJlZXplIG9yXG4gIC8vIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCBhcmUgcGFydCBvZiB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLiBDb25zaWRlciB0aGUgZm9sbG93aW5nOlxuICAvL1xuICAvLyAgQ0FTRSAxLiBuZXh0OiAxMS4wLjAtbmV4dC4wOiBwYXRjaCBhbmQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgY2FuIG9ubHkgYmVcbiAgLy8gICAgICAgICAgbW9zdCByZWNlbnQgYDEwLjw+LnhgIGJyYW5jaGVzLiBUaGUgRkYvUkMgYnJhbmNoIGNhbiBvbmx5IGJlIHRoZSBsYXN0LW1pbm9yIG9mIHYxMC5cbiAgLy8gIENBU0UgMi4gbmV4dDogMTEuMS4wLW5leHQuMDogcGF0Y2ggY2FuIGJlIGVpdGhlciBgMTEuMC54YCBvciBsYXN0LW1pbm9yIGluIHYxMCBiYXNlZFxuICAvLyAgICAgICAgICBvbiB3aGV0aGVyIHRoZXJlIGlzIGEgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICg9PiBgMTEuMC54YCkuXG4gIC8vICBDQVNFIDMuIG5leHQ6IDEwLjYuMC1uZXh0LjA6IHBhdGNoIGNhbiBiZSBlaXRoZXIgYDEwLjUueGAgb3IgYDEwLjQueGAgYmFzZWQgb24gd2hldGhlclxuICAvLyAgICAgICAgICB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAoPT4gYDEwLjUueGApXG4gIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMCkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3IgLSAxO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIGlmIChuZXh0VmVyc2lvbi5taW5vciA9PT0gMSkge1xuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yID0gbmV4dFZlcnNpb24ubWFqb3I7XG4gICAgbWFqb3JWZXJzaW9uc1RvQ29uc2lkZXIucHVzaChuZXh0VmVyc2lvbi5tYWpvciwgbmV4dFZlcnNpb24ubWFqb3IgLSAxKTtcbiAgfSBlbHNlIHtcbiAgICBleHBlY3RlZFJlbGVhc2VDYW5kaWRhdGVNYWpvciA9IG5leHRWZXJzaW9uLm1ham9yO1xuICAgIG1ham9yVmVyc2lvbnNUb0NvbnNpZGVyLnB1c2gobmV4dFZlcnNpb24ubWFqb3IpO1xuICB9XG5cbiAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgbGF0ZXN0IHZlcnNpb24tYnJhbmNoLFxuICAvLyBvciB0aGUgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUuXG4gIGNvbnN0IGJyYW5jaGVzID0gKGF3YWl0IGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhyZXBvLCBtYWpvclZlcnNpb25zVG9Db25zaWRlcikpO1xuICBjb25zdCB7bGF0ZXN0LCByZWxlYXNlQ2FuZGlkYXRlfSA9IGF3YWl0IGZpbmRBY3RpdmVSZWxlYXNlVHJhaW5zRnJvbVZlcnNpb25CcmFuY2hlcyhcbiAgICAgIHJlcG8sIG5leHRWZXJzaW9uLCBicmFuY2hlcywgZXhwZWN0ZWRSZWxlYXNlQ2FuZGlkYXRlTWFqb3IpO1xuXG4gIGlmIChsYXRlc3QgPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYFVuYWJsZSB0byBkZXRlcm1pbmUgdGhlIGxhdGVzdCByZWxlYXNlLXRyYWluLiBUaGUgZm9sbG93aW5nIGJyYW5jaGVzIGAgK1xuICAgICAgICBgaGF2ZSBiZWVuIGNvbnNpZGVyZWQ6IFske2JyYW5jaGVzLm1hcChiID0+IGIubmFtZSkuam9pbignLCAnKX1dYCk7XG4gIH1cblxuICByZXR1cm4ge3JlbGVhc2VDYW5kaWRhdGUsIGxhdGVzdCwgbmV4dH07XG59XG5cbi8qKiBGaW5kcyB0aGUgY3VycmVudGx5IGFjdGl2ZSByZWxlYXNlIHRyYWlucyBmcm9tIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBicmFuY2hlcy4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaW5kQWN0aXZlUmVsZWFzZVRyYWluc0Zyb21WZXJzaW9uQnJhbmNoZXMoXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIG5leHRWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdLFxuICAgIGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yOiBudW1iZXIpOiBQcm9taXNlPHtcbiAgbGF0ZXN0OiBSZWxlYXNlVHJhaW4gfCBudWxsLFxuICByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW4gfCBudWxsLFxufT4ge1xuICAvLyBWZXJzaW9uIHJlcHJlc2VudGluZyB0aGUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlIG5leHQgcGhhc2UuIE5vdGUgdGhhdCB3ZSBpZ25vcmVcbiAgLy8gcGF0Y2ggYW5kIHByZS1yZWxlYXNlIHNlZ21lbnRzIGluIG9yZGVyIHRvIGJlIGFibGUgdG8gY29tcGFyZSB0aGUgbmV4dCByZWxlYXNlIHRyYWluIHRvXG4gIC8vIG90aGVyIHJlbGVhc2UgdHJhaW5zIGZyb20gdmVyc2lvbiBicmFuY2hlcyAod2hpY2ggZm9sbG93IHRoZSBgTi5OLnhgIHBhdHRlcm4pLlxuICBjb25zdCBuZXh0UmVsZWFzZVRyYWluVmVyc2lvbiA9IHNlbXZlci5wYXJzZShgJHtuZXh0VmVyc2lvbi5tYWpvcn0uJHtuZXh0VmVyc2lvbi5taW5vcn0uMGApITtcblxuICBsZXQgbGF0ZXN0OiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG4gIGxldCByZWxlYXNlQ2FuZGlkYXRlOiBSZWxlYXNlVHJhaW58bnVsbCA9IG51bGw7XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBjYXB0dXJlZCBicmFuY2hlcyBhbmQgZmluZCB0aGUgbGF0ZXN0IG5vbi1wcmVyZWxlYXNlIGJyYW5jaCBhbmQgYVxuICAvLyBwb3RlbnRpYWwgcmVsZWFzZSBjYW5kaWRhdGUgYnJhbmNoLiBGcm9tIHRoZSBjb2xsZWN0ZWQgYnJhbmNoZXMgd2UgaXRlcmF0ZSBkZXNjZW5kaW5nXG4gIC8vIG9yZGVyIChtb3N0IHJlY2VudCBzZW1hbnRpYyB2ZXJzaW9uLWJyYW5jaCBmaXJzdCkuIFRoZSBmaXJzdCBicmFuY2ggaXMgZWl0aGVyIHRoZSBsYXRlc3RcbiAgLy8gYWN0aXZlIHZlcnNpb24gYnJhbmNoIChpLmUuIHBhdGNoKSBvciBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaC4gQSBGRi9SQ1xuICAvLyBicmFuY2ggY2Fubm90IGJlIG9sZGVyIHRoYW4gdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2gsIHNvIHdlIHN0b3AgaXRlcmF0aW5nIG9uY2VcbiAgLy8gd2UgZm91bmQgc3VjaCBhIGJyYW5jaC4gT3RoZXJ3aXNlLCBpZiB3ZSBmb3VuZCBhIEZGL1JDIGJyYW5jaCwgd2UgY29udGludWUgbG9va2luZyBmb3IgdGhlXG4gIC8vIG5leHQgdmVyc2lvbi1icmFuY2ggYXMgdGhhdCBvbmUgaXMgc3VwcG9zZWQgdG8gYmUgdGhlIGxhdGVzdCBhY3RpdmUgdmVyc2lvbi1icmFuY2guIElmIGl0XG4gIC8vIGlzIG5vdCwgdGhlbiBhbiBlcnJvciB3aWxsIGJlIHRocm93biBkdWUgdG8gdHdvIEZGL1JDIGJyYW5jaGVzIGV4aXN0aW5nIGF0IHRoZSBzYW1lIHRpbWUuXG4gIGZvciAoY29uc3Qge25hbWUsIHBhcnNlZH0gb2YgYnJhbmNoZXMpIHtcbiAgICAvLyBJdCBjYW4gaGFwcGVuIHRoYXQgdmVyc2lvbiBicmFuY2hlcyBoYXZlIGJlZW4gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgd2hpY2ggYXJlIG1vcmUgcmVjZW50XG4gICAgLy8gdGhhbiB0aGUgcmVsZWFzZS10cmFpbiBpbiB0aGUgbmV4dCBicmFuY2ggKGkuZS4gYG1hc3RlcmApLiBXZSBjb3VsZCBpZ25vcmUgc3VjaCBicmFuY2hlc1xuICAgIC8vIHNpbGVudGx5LCBidXQgaXQgbWlnaHQgYmUgc3ltcHRvbWF0aWMgZm9yIGFuIG91dGRhdGVkIHZlcnNpb24gaW4gdGhlIGBuZXh0YCBicmFuY2gsIG9yIGFuXG4gICAgLy8gYWNjaWRlbnRhbGx5IGNyZWF0ZWQgYnJhbmNoIGJ5IHRoZSBjYXJldGFrZXIuIEluIGVpdGhlciB3YXkgd2Ugd2FudCB0byByYWlzZSBhd2FyZW5lc3MuXG4gICAgaWYgKHNlbXZlci5ndChwYXJzZWQsIG5leHRSZWxlYXNlVHJhaW5WZXJzaW9uKSkge1xuICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCB2ZXJzaW9uLWJyYW5jaCBcIiR7bmFtZX1cIiBmb3IgYSByZWxlYXNlLXRyYWluIHRoYXQgaXMgYCArXG4gICAgICAgICAgYG1vcmUgcmVjZW50IHRoYW4gdGhlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLiBgICtcbiAgICAgICAgICBgUGxlYXNlIGVpdGhlciBkZWxldGUgdGhlIGJyYW5jaCBpZiBjcmVhdGVkIGJ5IGFjY2lkZW50LCBvciB1cGRhdGUgdGhlIG91dGRhdGVkIGAgK1xuICAgICAgICAgIGB2ZXJzaW9uIGluIHRoZSBuZXh0IGJyYW5jaCAoJHtuZXh0QnJhbmNoTmFtZX0pLmApO1xuICAgIH0gZWxzZSBpZiAoc2VtdmVyLmVxKHBhcnNlZCwgbmV4dFJlbGVhc2VUcmFpblZlcnNpb24pKSB7XG4gICAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgICBgRGlzY292ZXJlZCB1bmV4cGVjdGVkIHZlcnNpb24tYnJhbmNoIFwiJHtuYW1lfVwiIGZvciBhIHJlbGVhc2UtdHJhaW4gdGhhdCBpcyBhbHJlYWR5IGAgK1xuICAgICAgICAgIGBhY3RpdmUgaW4gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guIFBsZWFzZSBlaXRoZXIgZGVsZXRlIHRoZSBicmFuY2ggaWYgYCArXG4gICAgICAgICAgYGNyZWF0ZWQgYnkgYWNjaWRlbnQsIG9yIHVwZGF0ZSB0aGUgdmVyc2lvbiBpbiB0aGUgbmV4dCBicmFuY2ggKCR7bmV4dEJyYW5jaE5hbWV9KS5gKTtcbiAgICB9XG5cbiAgICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIG5hbWUpO1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IG5ldyBSZWxlYXNlVHJhaW4obmFtZSwgdmVyc2lvbik7XG4gICAgY29uc3QgaXNQcmVyZWxlYXNlID0gdmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnIHx8IHZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuXG4gICAgaWYgKGlzUHJlcmVsZWFzZSkge1xuICAgICAgaWYgKHJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgRXJyb3IoXG4gICAgICAgICAgICBgVW5hYmxlIHRvIGRldGVybWluZSBsYXRlc3QgcmVsZWFzZS10cmFpbi4gRm91bmQgdHdvIGNvbnNlY3V0aXZlIGAgK1xuICAgICAgICAgICAgYGJyYW5jaGVzIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBEaWQgbm90IGV4cGVjdCBib3RoIFwiJHtuYW1lfVwiIGAgK1xuICAgICAgICAgICAgYGFuZCBcIiR7cmVsZWFzZUNhbmRpZGF0ZS5icmFuY2hOYW1lfVwiIHRvIGJlIGluIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIG1vZGUuYCk7XG4gICAgICB9IGVsc2UgaWYgKHZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkUmVsZWFzZUNhbmRpZGF0ZU1ham9yKSB7XG4gICAgICAgIHRocm93IEVycm9yKFxuICAgICAgICAgICAgYERpc2NvdmVyZWQgdW5leHBlY3RlZCBvbGQgZmVhdHVyZS1mcmVlemUvcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoLiBFeHBlY3RlZCBubyBgICtcbiAgICAgICAgICAgIGB2ZXJzaW9uLWJyYW5jaCBpbiBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBtb2RlIGZvciB2JHt2ZXJzaW9uLm1ham9yfS5gKTtcbiAgICAgIH1cbiAgICAgIHJlbGVhc2VDYW5kaWRhdGUgPSByZWxlYXNlVHJhaW47XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhdGVzdCA9IHJlbGVhc2VUcmFpbjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7cmVsZWFzZUNhbmRpZGF0ZSwgbGF0ZXN0fTtcbn1cbiJdfQ==