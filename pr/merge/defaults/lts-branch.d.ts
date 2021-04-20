/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/defaults/lts-branch" />
import { ReleaseConfig } from '../../../release/config/index';
import { GithubRepoWithApi } from '../../../release/versioning';
/**
 * Asserts that the given branch corresponds to an active LTS version-branch that can receive
 * backport fixes. Throws an error if LTS expired or an invalid branch is selected.
 *
 * @param repo Repository containing the given branch. Used for Github API queries.
 * @param releaseConfig Configuration for releases. Used to query NPM about past publishes.
 * @param branchName Branch that is checked to be an active LTS version-branch.
 * */
export declare function assertActiveLtsBranch(repo: GithubRepoWithApi, releaseConfig: ReleaseConfig, branchName: string): Promise<void>;
