/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/index" />
/// <reference types="node" />
import { SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { NgDevConfig } from '../config';
import { GithubClient } from './github';
/** Describes a function that can be used to test for given Github OAuth scopes. */
export declare type OAuthScopeTestFunction = (scopes: string[], missing: string[]) => void;
/** Error for failed Git commands. */
export declare class GitCommandError extends Error {
    args: string[];
    constructor(client: GitClient, args: string[]);
}
/**
 * Common client for performing Git interactions.
 *
 * Takes in two optional arguments:
 *   _githubToken: the token used for authentifation in github interactions, by default empty
 *     allowing readonly actions.
 *   _config: The dev-infra configuration containing GitClientConfig information, by default
 *     loads the config from the default location.
 **/
export declare class GitClient {
    private _githubToken?;
    private _config;
    private _projectRoot;
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
    github: GithubClient;
    /** The OAuth scopes available for the provided Github token. */
    private _oauthScopes;
    /**
     * Regular expression that matches the provided Github token. Used for
     * sanitizing the token from Git child process output.
     */
    private _githubTokenRegex;
    constructor(_githubToken?: string | undefined, _config?: Pick<NgDevConfig, 'github'>, _projectRoot?: string);
    /** Executes the given git command. Throws if the command fails. */
    run(args: string[], options?: SpawnSyncOptions): Omit<SpawnSyncReturns<string>, 'status'>;
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    runGraceful(args: string[], options?: SpawnSyncOptions): SpawnSyncReturns<string>;
    /** Whether the given branch contains the specified SHA. */
    hasCommit(branchName: string, sha: string): boolean;
    /** Gets the currently checked out branch or revision. */
    getCurrentBranchOrRevision(): string;
    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges(): boolean;
    /** Whether the repo has any local changes. */
    hasLocalChanges(): boolean;
    /** Sanitizes a given message by omitting the provided Github token if present. */
    omitGithubTokenFromMessage(value: string): string;
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    checkout(branchOrRevision: string, cleanState: boolean): boolean;
    /**
     * Assert the GitClient instance is using a token with permissions for the all of the
     * provided OAuth scopes.
     */
    hasOauthScopes(testFn: OAuthScopeTestFunction): Promise<true | {
        error: string;
    }>;
    /**
     * Retrieve the OAuth scopes for the loaded Github token.
     **/
    private getAuthScopesForToken;
}
