/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/task" />
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { MergeConfigWithRemote } from './config';
import { PullRequestFailure } from './failures';
/** Describes the status of a pull request merge. */
export declare const enum MergeStatus {
    UNKNOWN_GIT_ERROR = 0,
    DIRTY_WORKING_DIR = 1,
    SUCCESS = 2,
    FAILED = 3,
    USER_ABORTED = 4,
    GITHUB_ERROR = 5
}
/** Result of a pull request merge. */
export interface MergeResult {
    /** Overall status of the merge. */
    status: MergeStatus;
    /** List of pull request failures. */
    failure?: PullRequestFailure;
}
export interface PullRequestMergeTaskFlags {
    branchPrompt: boolean;
}
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export declare class PullRequestMergeTask {
    config: MergeConfigWithRemote;
    git: AuthenticatedGitClient;
    private flags;
    constructor(config: MergeConfigWithRemote, git: AuthenticatedGitClient, flags: Partial<PullRequestMergeTaskFlags>);
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    merge(prNumber: number, force?: boolean): Promise<MergeResult>;
}
