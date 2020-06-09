/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git" />
/// <reference types="node" />
import * as Octokit from '@octokit/rest';
import { SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { NgDevConfig } from './config';
/** Error for failed Github API requests. */
export declare class GithubApiRequestError extends Error {
    status: number;
    constructor(status: number, message: string);
}
/** Error for failed Git commands. */
export declare class GitCommandError extends Error {
    args: string[];
    constructor(client: GitClient, args: string[]);
}
/**
 * Common client for performing Git interactions.
 *
 * Takes in two optional arguements:
 *   _githubToken: the token used for authentifation in github interactions, by default empty
 *     allowing readonly actions.
 *   _config: The dev-infra configuration containing GitClientConfig information, by default
 *     loads the config from the default location.
 **/
export declare class GitClient {
    private _githubToken;
    private _config;
    /** Short-hand for accessing the remote configuration. */
    remoteConfig: import("@angular/dev-infra-private/utils/config").GithubConfig;
    /** Octokit request parameters object for targeting the configured remote. */
    remoteParams: {
        owner: string;
        repo: string;
    };
    /** URL that resolves to the configured repository. */
    repoGitUrl: string;
    /** Instance of the authenticated Github octokit API. */
    api: Octokit;
    /** The file path of project's root directory. */
    private _projectRoot;
    /** The OAuth scopes available for the provided Github token. */
    private _oauthScopes;
    /** Regular expression that matches the provided Github token. */
    private _tokenRegex;
    constructor(_githubToken?: string, _config?: Pick<NgDevConfig, 'github'>);
    /** Executes the given git command. Throws if the command fails. */
    run(args: string[], options?: SpawnSyncOptions): Omit<SpawnSyncReturns<string>, 'status'>;
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * debug failed commands.
     */
    runGraceful(args: string[], options?: SpawnSyncOptions): SpawnSyncReturns<string>;
    /** Whether the given branch contains the specified SHA. */
    hasCommit(branchName: string, sha: string): boolean;
    /** Gets the currently checked out branch. */
    getCurrentBranch(): string;
    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges(): boolean;
    /** Whether the repo has any local changes. */
    hasLocalChanges(): boolean;
    /** Sanitizes a given message by omitting the provided Github token if present. */
    omitGithubTokenFromMessage(value: string): string;
    /**
     * Assert the GitClient instance is using a token with permissions for the all of the
     * provided OAuth scopes.
     */
    hasOauthScopes(...requestedScopes: string[]): Promise<true | {
        error: string;
    }>;
    /**
     * Retrieves the OAuth scopes for the loaded Github token, returning the already
     * retrieved list of OAuth scopes if available.
     **/
    private getAuthScopesForToken;
}
