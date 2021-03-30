/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/task" />
import { GitClient } from '../../utils/git';
import { MergeConfigWithRemote } from './config';
import { PullRequestFailure } from './failures';
/** Describes the status of a pull request merge. */
export declare const enum MergeStatus {
    UNKNOWN_GIT_ERROR = 0,
    DIRTY_WORKING_DIR = 1,
    SUCCESS = 2,
    FAILED = 3,
    GITHUB_ERROR = 4
}
/** Result of a pull request merge. */
export interface MergeResult {
    /** Overall status of the merge. */
    status: MergeStatus;
    /** List of pull request failures. */
    failure?: PullRequestFailure;
}
/**
 * Class that accepts a merge script configuration and Github token. It provides
 * a programmatic interface for merging multiple pull requests based on their
 * labels that have been resolved through the merge script configuration.
 */
export declare class PullRequestMergeTask {
    projectRoot: string;
    config: MergeConfigWithRemote;
    private _githubToken;
    /** Git client that can be used to execute Git commands. */
    git: GitClient;
    constructor(projectRoot: string, config: MergeConfigWithRemote, _githubToken: string);
    /**
     * Merges the given pull request and pushes it upstream.
     * @param prNumber Pull request that should be merged.
     * @param force Whether non-critical pull request failures should be ignored.
     */
    merge(prNumber: number, force?: boolean): Promise<MergeResult>;
}
