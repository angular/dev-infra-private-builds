/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/inc-semver" />
import * as semver from 'semver';
/**
 * Increments a specified SemVer version. Compared to the original increment in SemVer,
 * the version is cloned to not modify the original version instance.
 */
export declare function semverInc(version: semver.SemVer, release: semver.ReleaseType, identifier?: string): semver.SemVer;
