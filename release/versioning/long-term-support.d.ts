/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/long-term-support" />
import * as semver from 'semver';
import { ReleaseConfig } from '../config/index';
/** Interface describing determined LTS branches. */
export interface LtsBranches {
    /** List of active LTS version branches. */
    active: LtsBranch[];
    /** List of inactive LTS version branches. */
    inactive: LtsBranch[];
}
/** Interface describing an LTS version branch. */
export interface LtsBranch {
    /** Name of the branch. */
    name: string;
    /** Most recent version for the given LTS branch. */
    version: semver.SemVer;
    /** NPM dist tag for the LTS version. */
    npmDistTag: string;
}
/** Finds all long-term support release trains from the specified NPM package. */
export declare function fetchLongTermSupportBranchesFromNpm(config: ReleaseConfig): Promise<LtsBranches>;
/**
 * Computes the date when long-term support ends for a major released at the
 * specified date.
 */
export declare function computeLtsEndDateOfMajor(majorReleaseDate: Date): Date;
/** Gets the long-term support NPM dist tag for a given major version. */
export declare function getLtsNpmDistTagOfMajor(major: number): string;
