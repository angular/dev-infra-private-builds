/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client.js';
import { PullRequest } from './actions.js';
/**
 * Prints the pull request to the console and informs the user about
 * the process of getting the pull request merged.
 *
 * The user will then be prompted, allowing the user to initiate the
 * merging. The tool will then attempt to merge the pull request
 * automatically.
 */
export declare function promptToInitiatePullRequestMerge(git: AuthenticatedGitClient, { id, url }: PullRequest): Promise<void>;
