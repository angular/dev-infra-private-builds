/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import { GithubConfig } from '../config.js';
import { SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { GithubClient } from './github.js';
/** Error for failed Git commands. */
export declare class GitCommandError extends Error {
    constructor(client: GitClient, unsanitizedArgs: string[]);
}
/** The options available for the `GitClient``run` and `runGraceful` methods. */
declare type GitCommandRunOptions = SpawnSyncOptions;
/** Class that can be used to perform Git interactions with a given remote. **/
export declare class GitClient {
    /** The full path to the root of the repository base. */
    readonly baseDir: string;
    /** Short-hand for accessing the default remote configuration. */
    readonly remoteConfig: GithubConfig;
    /** Octokit request parameters object for targeting the configured remote. */
    readonly remoteParams: {
        owner: string;
        repo: string;
    };
    /** Name of the primary branch of the upstream remote. */
    readonly mainBranchName: string;
    /** Instance of the Github client. */
    readonly github: GithubClient;
    /** The configuration, containing the github specific configuration. */
    readonly config: {
        github: GithubConfig;
    };
    /**
     * Path to the Git executable. By default, `git` is assumed to exist
     * in the shell environment (using `$PATH`).
     */
    readonly gitBinPath: string;
    constructor(
    /** The configuration, containing the github specific configuration. */
    config: {
        github: GithubConfig;
    }, 
    /** The full path to the root of the repository base. */
    baseDir?: string);
    /** Executes the given git command. Throws if the command fails. */
    run(args: string[], options?: GitCommandRunOptions): Omit<SpawnSyncReturns<string>, 'status'>;
    /**
     * Spawns a given Git command process. Does not throw if the command fails. Additionally,
     * if there is any stderr output, the output will be printed. This makes it easier to
     * info failed commands.
     */
    runGraceful(args: string[], options?: GitCommandRunOptions): SpawnSyncReturns<string>;
    /** Git URL that resolves to the configured repository. */
    getRepoGitUrl(): string;
    /** Whether the given branch contains the specified SHA. */
    hasCommit(branchName: string, sha: string): boolean;
    /** Whether the local repository is configured as shallow. */
    isShallowRepo(): boolean;
    /** Gets the currently checked out branch or revision. */
    getCurrentBranchOrRevision(): string;
    /** Gets whether the current Git repository has uncommitted changes. */
    hasUncommittedChanges(): boolean;
    /**
     * Checks out a requested branch or revision, optionally cleaning the state of the repository
     * before attempting the checking. Returns a boolean indicating whether the branch or revision
     * was cleanly checked out.
     */
    checkout(branchOrRevision: string, cleanState: boolean): boolean;
    /** Retrieve a list of all files in the repository changed since the provided shaOrRef. */
    allChangesFilesSince(shaOrRef?: string): string[];
    /** Retrieve a list of all files currently staged in the repostitory. */
    allStagedFiles(): string[];
    /** Retrieve a list of all files tracked in the repository. */
    allFiles(): string[];
    /**
     * Sanitizes the given console message. This method can be overridden by
     * derived classes. e.g. to sanitize access tokens from Git commands.
     */
    sanitizeConsoleOutput(value: string): string;
    /** The singleton instance of the unauthenticated `GitClient`. */
    private static _unauthenticatedInstance;
    /**
     * Static method to get the singleton instance of the `GitClient`,
     * creating it, if not created yet.
     */
    static get(): Promise<GitClient>;
}
/** Determines the repository base directory from the current working directory. */
export declare function determineRepoBaseDirFromCwd(): string;
export {};
