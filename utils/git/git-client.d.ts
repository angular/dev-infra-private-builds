/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/utils/git/git-client" />
/// <reference types="node" />
import { SpawnSyncOptions, SpawnSyncReturns } from 'child_process';
import { SemVer } from 'semver';
import { GithubConfig } from '../config';
import { GithubClient } from './github';
/** Error for failed Git commands. */
export declare class GitCommandError extends Error {
    args: string[];
    constructor(client: GitClient, args: string[]);
}
/** The options available for the `GitClient``run` and `runGraceful` methods. */
declare type GitCommandRunOptions = SpawnSyncOptions & {
    verboseLogging?: boolean;
};
/** Class that can be used to perform Git interactions with a given remote. **/
export declare class GitClient {
    /** The full path to the root of the repository base. */
    readonly baseDir: string;
    /** The configuration, containing the github specific configuration. */
    readonly config: {
        github: GithubConfig;
    };
    /** Short-hand for accessing the default remote configuration. */
    readonly remoteConfig: GithubConfig;
    /** Octokit request parameters object for targeting the configured remote. */
    readonly remoteParams: {
        owner: string;
        repo: string;
    };
    /** Instance of the Github client. */
    readonly github: GithubClient;
    constructor(
    /** The full path to the root of the repository base. */
    baseDir?: string, 
    /** The configuration, containing the github specific configuration. */
    config?: {
        github: GithubConfig;
    });
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
    /** Gets the latest git tag on the current branch that matches SemVer. */
    getLatestSemverTag(): SemVer;
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
    /** Whether verbose logging of Git actions should be used. */
    private static verboseLogging;
    /** The singleton instance of the unauthenticated `GitClient`. */
    private static _unauthenticatedInstance;
    /** Set the verbose logging state of all git client instances. */
    static setVerboseLoggingState(verbose: boolean): void;
    /**
     * Static method to get the singleton instance of the `GitClient`, creating it
     * if it has not yet been created.
     */
    static get(): GitClient;
}
export {};
