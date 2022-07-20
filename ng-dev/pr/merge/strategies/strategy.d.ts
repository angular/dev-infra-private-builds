/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { AuthenticatedGitClient } from '../../../utils/git/authenticated-git-client.js';
import { PullRequest } from '../pull-request.js';
/**
 * Name of a temporary branch that contains the head of a currently-processed PR. Note
 * that a branch name should be used that most likely does not conflict with other local
 * development branches.
 */
export declare const TEMP_PR_HEAD_BRANCH = "merge_pr_head";
/**
 * Base class for merge strategies. A merge strategy accepts a pull request and
 * merges it into the determined target branches.
 */
export declare abstract class MergeStrategy {
    protected git: AuthenticatedGitClient;
    constructor(git: AuthenticatedGitClient);
    /**
     * Prepares a merge of the given pull request. The strategy by default will
     * fetch all target branches and the pull request into local temporary branches.
     */
    prepare(pullRequest: PullRequest): Promise<void>;
    /**
     * Performs the merge of the given pull request. This needs to be implemented
     * by individual merge strategies.
     *
     * @throws {PullRequestFailure} A pull request failure if the the pull request could not
     *   be merged and the pull request is misconfigured.
     * @throws {FatalMergeToolError} A fatal error has occurred when attempting to merge the
     *   pull request.
     */
    abstract merge(pullRequest: PullRequest): Promise<void>;
    /** Cleans up the pull request merge. e.g. deleting temporary local branches. */
    cleanup(pullRequest: PullRequest): Promise<void>;
    /** Gets the revision range for all commits in the given pull request. */
    protected getPullRequestRevisionRange(pullRequest: PullRequest): string;
    /** Gets the base revision of a pull request. i.e. the commit the PR is based on. */
    protected getPullRequestBaseRevision(pullRequest: PullRequest): string;
    /** Gets a deterministic local branch name for a given branch. */
    protected getLocalTargetBranchName(targetBranch: string): string;
    /**
     * Cherry-picks the given revision range into the specified target branches.
     * @returns A list of branches for which the revisions could not be cherry-picked into.
     */
    protected cherryPickIntoTargetBranches(revisionRange: string, targetBranches: string[], options?: {
        dryRun?: boolean;
        linkToOriginalCommits?: boolean;
    }): string[];
    /**
     * Fetches the given target branches. Also accepts a list of additional refspecs that
     * should be fetched. This is helpful as multiple slow fetches could be avoided.
     */
    protected fetchTargetBranches(names: string[], ...extraRefspecs: string[]): void;
    /** Pushes the given target branches upstream. */
    protected pushTargetBranchesUpstream(names: string[]): void;
}
