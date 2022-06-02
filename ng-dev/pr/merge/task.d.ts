/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { PullRequestConfig } from '../config';
import { PullRequestFailure } from '../common/validation/failures';
import { GithubConfig } from '../../utils/config';
/** Describes the status of a pull request merge. */
export declare const enum MergeStatus {
    UNKNOWN_GIT_ERROR = 0,
    DIRTY_WORKING_DIR = 1,
    UNEXPECTED_SHALLOW_REPO = 2,
    SUCCESS = 3,
    FAILED = 4,
    USER_ABORTED = 5,
    GITHUB_ERROR = 6
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
    forceManualBranches: boolean;
}
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export declare class PullRequestMergeTask {
    config: {
        pullRequest: PullRequestConfig;
        github: GithubConfig;
    };
    git: AuthenticatedGitClient;
    private flags;
    constructor(config: {
        pullRequest: PullRequestConfig;
        github: GithubConfig;
    }, git: AuthenticatedGitClient, flags: Partial<PullRequestMergeTaskFlags>);
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    merge(prNumber: number, force?: boolean): Promise<MergeResult>;
    /**
     * Modifies the pull request in place with new target branches based on user selection from
     * the available active branches.
     */
    private setTargetedBranchesManually;
}
