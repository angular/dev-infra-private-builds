/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { MergeTool } from './merge-tool.js';
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
 *
 * @throws {PullRequestFailure} A pull request failure if the pull request does not
 *   pass the validation.
 * @throws {FatalMergeToolError} A fatal error might be thrown when e.g. the pull request
 *   does not exist upstream.
 */
export declare function loadAndValidatePullRequest({ git, config }: MergeTool, prNumber: number, ignoreNonFatalFailures?: boolean): Promise<PullRequest>;
