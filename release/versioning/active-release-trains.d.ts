/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/active-release-trains" />
import * as semver from 'semver';
import { ReleaseTrain } from './release-trains';
import { GithubRepoWithApi, VersionBranch } from './version-branches';
/** Interface describing determined active release trains for a project. */
export interface ActiveReleaseTrains {
    /** Release-train currently in the "release-candidate" or "feature-freeze" phase. */
    releaseCandidate: ReleaseTrain | null;
    /** Release-train currently in the "latest" phase. */
    latest: ReleaseTrain;
    /** Release-train in the `next` phase. */
    next: ReleaseTrain;
}
/** Branch name for the `next` branch. */
export declare const nextBranchName = "master";
/** Fetches the active release trains for the configured project. */
export declare function fetchActiveReleaseTrains(repo: GithubRepoWithApi): Promise<ActiveReleaseTrains>;
/** Finds the currently active release trains from the specified version branches. */
export declare function findActiveReleaseTrainsFromVersionBranches(repo: GithubRepoWithApi, nextVersion: semver.SemVer, branches: VersionBranch[], expectedReleaseCandidateMajor: number): Promise<{
    latest: ReleaseTrain | null;
    releaseCandidate: ReleaseTrain | null;
}>;
