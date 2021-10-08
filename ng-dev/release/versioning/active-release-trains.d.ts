/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as semver from 'semver';
import { ReleaseTrain } from './release-trains';
import { ReleaseRepoWithApi, VersionBranch } from './version-branches';
/** The active release trains for a project. */
export declare class ActiveReleaseTrains {
    private trains;
    /** Release-train currently in the "release-candidate" or "feature-freeze" phase. */
    readonly releaseCandidate: ReleaseTrain | null;
    /** Release-train in the `next` phase. */
    readonly next: ReleaseTrain;
    /** Release-train currently in the "latest" phase. */
    readonly latest: ReleaseTrain;
    constructor(trains: {
        releaseCandidate: ReleaseTrain | null;
        next: ReleaseTrain;
        latest: ReleaseTrain;
    });
    /** Whether the active release trains indicate the repository is in a feature freeze state. */
    isFeatureFreeze(): boolean;
}
/** Fetches the active release trains for the configured project. */
export declare function fetchActiveReleaseTrains(repo: ReleaseRepoWithApi): Promise<ActiveReleaseTrains>;
/** Finds the currently active release trains from the specified version branches. */
export declare function findActiveReleaseTrainsFromVersionBranches(repo: ReleaseRepoWithApi, nextVersion: semver.SemVer, branches: VersionBranch[], expectedReleaseCandidateMajor: number): Promise<{
    latest: ReleaseTrain | null;
    releaseCandidate: ReleaseTrain | null;
}>;
