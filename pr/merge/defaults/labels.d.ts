/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/defaults/labels" />
import { ReleaseConfig } from '../../../release/config/index';
import { GithubConfig } from '../../../utils/config';
import { GithubClient } from '../../../utils/git/github';
import { TargetLabel } from '../config';
/**
 * Gets a label configuration for the merge tooling that reflects the default Angular
 * organization-wide labeling and branching semantics as outlined in the specification.
 *
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 *
 * @param api Instance of an authenticated Github client.
 * @param githubConfig Configuration for the Github remote. Used as Git remote
 *   for the release train branches.
 * @param releaseConfig Configuration for the release packages. Used to fetch
 *   NPM version data when LTS version branches are validated.
 */
export declare function getDefaultTargetLabelConfiguration(api: GithubClient, githubConfig: GithubConfig, releaseConfig: ReleaseConfig): Promise<TargetLabel[]>;
