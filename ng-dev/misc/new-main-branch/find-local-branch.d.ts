/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClient } from '../../utils/git/git-client';
/** Finds a non-reserved branch name in the repository with respect to a base name. */
export declare function findAvailableLocalBranchName(git: GitClient, baseName: string): string;
/** Gets whether the given branch exists locally. */
export declare function hasLocalBranch(git: GitClient, branchName: string): boolean;
