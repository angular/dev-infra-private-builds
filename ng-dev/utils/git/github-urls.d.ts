/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GitClientConfig } from '../config';
import { GitClient } from './git-client';
/** URL to the Github page where personal access tokens can be managed. */
export declare const GITHUB_TOKEN_SETTINGS_URL = "https://github.com/settings/tokens";
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens/new";
/** Adds the provided token to the given Github HTTPs remote url. */
export declare function addTokenToGitHttpsUrl(githubHttpsUrl: string, token: string): string;
/** Gets the repository Git URL for the given github config. */
export declare function getRepositoryGitUrl(config: Pick<GitClientConfig, 'name' | 'owner' | 'useSsh'>, githubToken?: string): string;
/** Gets a Github URL that refers to a list of recent commits within a specified branch. */
export declare function getListCommitsInBranchUrl(client: GitClient, branchName: string): string;
/** Gets a Github URL for viewing the file contents of a specified file for the given ref. */
export declare function getFileContentsUrl(client: GitClient, ref: string, relativeFilePath: string): string;
