/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Commit } from '../../commit-message/parse';
import { TargetLabel } from './target-label';
import { MergeConfig } from '../config';
import { RawPullRequest } from '../common/fetch-pull-request';
/**
 * Assert the commits provided are allowed to merge to the provided target label,
 * throwing an error otherwise.
 * @throws {PullRequestFailure}
 */
export declare function assertChangesAllowForTargetLabel(commits: Commit[], label: TargetLabel, config: MergeConfig): void;
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
export declare function assertPendingState(pullRequest: RawPullRequest): void;
