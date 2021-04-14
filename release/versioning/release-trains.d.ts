/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/release-trains" />
import * as semver from 'semver';
/** Class describing a release-train. */
export declare class ReleaseTrain {
    /** Name of the branch for this release-train. */
    branchName: string;
    /** Most recent version for this release train. */
    version: semver.SemVer;
    /** Whether the release train is currently targeting a major. */
    isMajor: boolean;
    constructor(
    /** Name of the branch for this release-train. */
    branchName: string, 
    /** Most recent version for this release train. */
    version: semver.SemVer);
}
