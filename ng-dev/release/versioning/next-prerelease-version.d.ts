/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as semver from 'semver';
import { SemVer } from 'semver';
import { ReleaseConfig } from '../config/index';
import { ActiveReleaseTrains } from './active-release-trains';
/**
 * Gets a version that can be used to build release notes for the next
 * release train.
 */
export declare function getReleaseNotesCompareVersionForNext(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<SemVer>;
/** Computes the new pre-release version for the next release-train. */
export declare function computeNewPrereleaseVersionForNext(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<semver.SemVer>;
