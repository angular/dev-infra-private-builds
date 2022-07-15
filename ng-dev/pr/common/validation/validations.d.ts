/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Commit } from '../../../commit-message/parse.js';
import { TargetLabel } from '../targeting/target-label.js';
import { PullRequestConfig } from '../../config/index.js';
import { PullRequestFromGithub } from '../fetch-pull-request.js';
import { ActiveReleaseTrains } from '../../../release/versioning/index.js';
/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
export declare function assertChangesAllowForTargetLabel(commits: Commit[], label: TargetLabel, config: PullRequestConfig, releaseTrains: ActiveReleaseTrains, labelsOnPullRequest: string[]): void;
/**
 * Assert the pull request has the proper label for breaking changes if there are breaking change
 * commits, and only has the label if there are breaking change commits.
 * @throws {PullRequestFailure}
 */
export declare function assertCorrectBreakingChangeLabeling(commits: Commit[], pullRequestLabels: string[]): void;
/**
 * Assert the pull request is pending, not closed, merged or in draft.
 * @throws {PullRequestFailure} if the pull request is not pending.
 */
export declare function assertPendingState(pullRequest: PullRequestFromGithub): void;
/**
 * Assert the pull request has all necessary CLAs signed.
 * @throws {PullRequestFailure} if the pull request is missing a necessary CLA signature.
 */
export declare function assertSignedCla(pullRequest: PullRequestFromGithub): void;
/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
export declare function assertMergeReady(pullRequest: PullRequestFromGithub, config: PullRequestConfig): boolean;
/**
 * Assert the pull request has been marked ready for merge by the author.
 * @throws {PullRequestFailure} if the pull request is missing the merge ready label.
 */
export declare function assertPassingCi(pullRequest: PullRequestFromGithub): void;
