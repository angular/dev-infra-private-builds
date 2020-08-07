/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/defaults/labels" />
import { GithubConfig } from '../../../utils/config';
import { GithubClient } from '../../../utils/git/github';
import { TargetLabel } from '../config';
/**
 * Gets a label configuration for the merge tooling that reflects the default Angular
 * organization-wide labeling and branching semantics as outlined in the specification.
 *
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU
 */
export declare function getDefaultTargetLabelConfiguration(api: GithubClient, github: GithubConfig, npmPackageName: string): Promise<TargetLabel[]>;
