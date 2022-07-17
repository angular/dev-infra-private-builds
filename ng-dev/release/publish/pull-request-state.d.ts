/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClient } from '../../utils/git/git-client.js';
/** State of a pull request in Github. */
export declare type PullRequestState = 'merged' | 'unknown';
/**
 * Gets whether a given pull request has been merged.
 *
 * Note: There are situations where GitHub still processes the merging or
 * closing action and temporarily this function would return `false`. Make
 * sure to account for this when logic relies on this method.
 *
 * More details here: https://github.com/angular/angular/pull/40181.
 *
 * @throws {GithubApiRequestError} May throw Github API request errors if e.g. a pull request
 *   cannot be found, or the repository is not existing/visible.
 */
export declare function isPullRequestMerged(api: GitClient, id: number): Promise<boolean>;
