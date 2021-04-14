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
import { SemVer } from 'semver';
import { GithubClient } from './github';
/** Describes a function that can be used to test for given Github OAuth scopes. */
export declare type OAuthScopeTestFunction = (scopes: string[], missing: string[]) => void;
/** Error for failed Git commands. */
export declare class GitCommandError extends Error {
    args: string[];
    constructor(client: GitClient<boolean>, args: string[]);
}
/**
 * Common client for performing Git interactions with a given remote.
 *
 * Takes in two optional arguments:
 *   `githubToken`: the token used for authentication in Github interactions, by default empty
 *     allowing readonly actions.
 *   `config`: The dev-infra configuration containing information about the remote. By default
 *     the dev-infra configuration is loaded with its Github configuration.
 **/
export declare class GitClient<Authenticated extends boolean> {
    githubToken: Authenticated extends true ? string : undefined;
    private _config;
    private _projectRoot;
    /*************************************************
     * Singleton definition and configuration.       *
     *************************************************/
    /** The singleton instance of the authenticated GitClient. */
    private static authenticated;
    /** The singleton instance of the unauthenticated GitClient. */
    private static unauthenticated;
    /**
     * Static method to get the singleton instance of the unauthorized GitClient, creating it if it
     * has not yet been created.
     */
    static getInstance(): GitClient<false>;
    /**
     * Static method to get the singleton instance of the authenticated GitClient if it has been
     * generated.
     */
    static getAuthenticatedInstance(): GitClient<true>;
    /** Build the authenticated GitClient instance. */
    static authenticateWithToken(token: string): void;
    /** Whether verbose logging of Git actions should be used. */
    private verboseLogging;
    /** The OAuth scopes available for the provided Github token. */
    private _cachedOauthScopes;
    /**
     * Regular expression that matches the provided Github token. Used for
     * sanitizing the token from Git child process output.
     */
    private _githubTokenRegex;
    /** Short-hand for accessing the default remote configuration. */
    remoteConfig: import("@angular/dev-infra-private/utils/config").GithubConfig;
    /** Octokit request parameters object for targeting the configured remote. */
    remoteParams: {
        owner: string;
        repo: string;
    };
    /** Instance of the authenticated Github octokit API. */
    github: GithubClient;
    /**
     * @param githubToken The github token used for authentication, if provided.
     * @param _config The configuration, containing the github specific configuration.
     * @param _projectRoot The full path to the root of the repository base.
     */
    protected constructor(githubToken: Authenticated extends true ? string : undefined, _config?: {
        github: import("@angular/dev-infra-private/utils/config").GithubConfig;
    }, _projectRoot?: string);
    /** Set the verbose logging state of the GitClient instance. */
    setVerboseLoggingState(verbose: boolean): this;
    /** Executes the given git command. Throws if the command fails. */
    run(args: string[], options?: SpawnSyncOptions): Omit<SpawnSyncReturns<string>, 'status'>;
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    runGraceful(args: string[], options?: SpawnSyncOptions): SpawnSyncReturns<string>;
    /** Git URL that resolves to the configured repository. */
    getRepoGitUrl(): string;
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
    /** Gets the latest git tag on the current branch that matches SemVer. */
    getLatestSemverTag(): SemVer;
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
