/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/release/versioning/next-prerelease-version" />
import * as semver from 'semver';
import { ReleaseConfig } from '../config/index';
import { ActiveReleaseTrains } from './active-release-trains';
/** Computes the new pre-release version for the next release-train. */
export declare function computeNewPrereleaseVersionForNext(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<semver.SemVer>;
