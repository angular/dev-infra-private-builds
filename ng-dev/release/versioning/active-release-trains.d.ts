/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReleaseTrain } from './release-trains.js';
import { ReleaseRepoWithApi } from './version-branches.js';
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
    /** Fetches the active release trains for the configured project. */
    static fetch(repo: ReleaseRepoWithApi): Promise<ActiveReleaseTrains>;
}
