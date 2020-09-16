/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/defaults/lts-branch" />
import { GithubRepo } from './branches';
/**
 * Asserts that the given branch corresponds to an active LTS version-branch that can receive
 * backported fixes. Throws an error if LTS expired or an invalid branch is selected.
 */
export declare function assertActiveLtsBranch(repo: GithubRepo, branchName: string): Promise<void>;
