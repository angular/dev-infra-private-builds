/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import semver from 'semver';
import { ReleaseConfig } from '../config/index.js';
import { ActiveReleaseTrains } from './active-release-trains.js';
/**
 * Gets a version that can be used to build release notes for the next
 * release train.
 */
export declare function getReleaseNotesCompareVersionForNext(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<semver.SemVer>;
/** Computes the new pre-release version for the next release-train. */
export declare function computeNewPrereleaseVersionForNext(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<semver.SemVer>;
