/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
/** Gets whether the given version denotes an experimental SemVer version. */
export declare function isExperimentalSemver(version: semver.SemVer): boolean;
/** Creates the equivalent experimental version for a provided SemVer. */
export declare function createExperimentalSemver(version: string | semver.SemVer): semver.SemVer;
