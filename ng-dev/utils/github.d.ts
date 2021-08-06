/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from './git/authenticated-git-client';
/** Get a PR from github  */
export declare function getPr<PrSchema>(prSchema: PrSchema, prNumber: number, git: AuthenticatedGitClient): Promise<PrSchema>;
/** Get all pending PRs from github  */
export declare function getPendingPrs<PrSchema>(prSchema: PrSchema, git: AuthenticatedGitClient): Promise<PrSchema[]>;
