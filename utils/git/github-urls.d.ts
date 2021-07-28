/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/github-urls" />
import { GithubConfig } from '../config';
import { GitClient } from './git-client';
/** URL to the Github page where personal access tokens can be managed. */
export declare const GITHUB_TOKEN_SETTINGS_URL = "https://github.com/settings/tokens";
/** URL to the Github page where personal access tokens can be generated. */
export declare const GITHUB_TOKEN_GENERATE_URL = "https://github.com/settings/tokens/new";
/** Adds the provided token to the given Github HTTPs remote url. */
export declare function addTokenToGitHttpsUrl(githubHttpsUrl: string, token: string): string;
/** Gets the repository Git URL for the given github config. */
export declare function getRepositoryGitUrl(config: GithubConfig, githubToken?: string): string;
/** Gets a Github URL that refers to a list of recent commits within a specified branch. */
export declare function getListCommitsInBranchUrl({ remoteParams }: GitClient, branchName: string): string;
