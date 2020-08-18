/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/github" />
import { GitClient } from './git';
/** Get a PR from github  */
export declare function getPr<PrSchema>(prSchema: PrSchema, prNumber: number, git: GitClient): Promise<PrSchema>;
/** Get all pending PRs from github  */
export declare function getPendingPrs<PrSchema>(prSchema: PrSchema, git: GitClient): Promise<PrSchema[]>;
