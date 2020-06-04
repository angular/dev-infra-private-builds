/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/git" />
/// <reference types="node" />
import * as Octokit from '@octokit/rest';
import { SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { MergeConfigWithRemote } from './config';
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
export declare class GitClient {
    private _projectRoot;
    private _githubToken;
    private _config;
    /** Short-hand for accessing the remote configuration. */
    remoteConfig: Partial<import("@angular/dev-infra-private/pr/merge/config").MergeRemote> & import("@angular/dev-infra-private/pr/merge/config").MergeRemote;
    /** Octokit request parameters object for targeting the configured remote. */
    remoteParams: {
        owner: string;
        repo: string;
    };
    /** URL that resolves to the configured repository. */
    repoGitUrl: string;
    /** Instance of the authenticated Github octokit API. */
    api: Octokit;
    /** The OAuth scopes available for the provided Github token. */
    private _oauthScopes;
    /** Regular expression that matches the provided Github token. */
    private _tokenRegex;
    constructor(_projectRoot: string, _githubToken: string, _config: MergeConfigWithRemote);
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
