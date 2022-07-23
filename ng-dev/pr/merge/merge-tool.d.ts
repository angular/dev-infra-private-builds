/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client.js';
import { PullRequestConfig } from '../config/index.js';
import { GithubConfig, NgDevConfig } from '../../utils/config.js';
import { PullRequestValidationConfig } from '../common/validation/validation-config.js';
export interface PullRequestMergeFlags {
    branchPrompt: boolean;
    forceManualBranches: boolean;
}
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export declare class MergeTool {
    config: NgDevConfig<{
        pullRequest: PullRequestConfig;
        github: GithubConfig;
    }>;
    git: AuthenticatedGitClient;
    private flags;
    constructor(config: NgDevConfig<{
        pullRequest: PullRequestConfig;
        github: GithubConfig;
    }>, git: AuthenticatedGitClient, flags: Partial<PullRequestMergeFlags>);
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param validationConfig Pull request validation config. Can be modified to skip
     *   certain non-fatal validations.
     */
    merge(prNumber: number, validationConfig: PullRequestValidationConfig): Promise<void>;
    /**
     * Modifies the pull request in place with new target branches based on user
     * selection from the available active branches.
     */
    private updatePullRequestTargetedBranchesFromPrompt;
}
