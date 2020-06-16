/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/pull-request" />
import { PullRequestFailure } from './failures';
import { PullRequestMergeTask } from './task';
/** Interface that describes a pull request. */
export interface PullRequest {
    /** URL to the pull request. */
    url: string;
    /** Number of the pull request. */
    prNumber: number;
    /** Title of the pull request. */
    title: string;
    /** Labels applied to the pull request. */
    labels: string[];
    /** List of branches this PR should be merged into. */
    targetBranches: string[];
    /** Branch that the PR targets in the Github UI. */
    githubTargetBranch: string;
    /** Count of commits in this pull request. */
    commitCount: number;
    /** Optional SHA that this pull request needs to be based on. */
    requiredBaseSha?: string;
    /** Whether the pull request commit message fixup. */
    needsCommitMessageFixup: boolean;
    /** Whether the pull request has a caretaker note. */
    hasCaretakerNote: boolean;
}
/**
 * Loads and validates the specified pull request against the given configuration.
 * If the pull requests fails, a pull request failure is returned.
 */
export declare function loadAndValidatePullRequest({ git, config }: PullRequestMergeTask, prNumber: number, ignoreNonFatalFailures?: boolean): Promise<PullRequest | PullRequestFailure>;
/** Whether the specified value resolves to a pull request. */
export declare function isPullRequest(v: PullRequestFailure | PullRequest): v is PullRequest;
