/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TargetLabel } from '../targeting/target-label.js';
/**
 * Class that can be used to describe pull request failures.
 *
 * A failure is described by a human-readable message and a flag indicating
 * whether the failure can be forcibly ignore or not.
 */
export declare class PullRequestFailure {
    /** Human-readable message for the failure */
    message: string;
    /** Whether the failure is non-fatal and can be forcibly ignored. */
    canBeIgnoredNonFatal: boolean;
    constructor(
    /** Human-readable message for the failure */
    message: string, 
    /** Whether the failure is non-fatal and can be forcibly ignored. */
    canBeIgnoredNonFatal?: boolean);
    static claUnsigned(): PullRequestFailure;
    static failingCiJobs(): PullRequestFailure;
    static pendingCiJobs(): PullRequestFailure;
    static notMergeReady(): PullRequestFailure;
    static isDraft(): PullRequestFailure;
    static isClosed(): PullRequestFailure;
    static isMerged(): PullRequestFailure;
    static mismatchingTargetBranch(allowedBranches: string[]): PullRequestFailure;
    static unsatisfiedBaseSha(): PullRequestFailure;
    static mergeConflicts(failedBranches: string[]): PullRequestFailure;
    static unknownMergeError(): PullRequestFailure;
    static unableToFixupCommitMessageSquashOnly(): PullRequestFailure;
    static hasBreakingChanges(label: TargetLabel): PullRequestFailure;
    static hasDeprecations(label: TargetLabel): PullRequestFailure;
    static hasFeatureCommits(label: TargetLabel): PullRequestFailure;
    static missingBreakingChangeLabel(): PullRequestFailure;
    static missingBreakingChangeCommit(): PullRequestFailure;
    static failedToManualSelectGithubTargetBranch(branch: string): PullRequestFailure;
}
