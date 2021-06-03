/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/strategies/api-merge" />
import { AuthenticatedGitClient } from '../../../utils/git/authenticated-git-client';
import { GithubApiMergeMethod } from '../config';
import { PullRequestFailure } from '../failures';
import { PullRequest } from '../pull-request';
import { MergeStrategy } from './strategy';
/** Configuration for the Github API merge strategy. */
export interface GithubApiMergeStrategyConfig {
    /** Default method used for merging pull requests */
    default: GithubApiMergeMethod;
    /** Labels which specify a different merge method than the default. */
    labels?: {
        pattern: string;
        method: GithubApiMergeMethod;
    }[];
}
/**
 * Merge strategy that primarily leverages the Github API. The strategy merges a given
 * pull request into a target branch using the API. This ensures that Github displays
 * the pull request as merged. The merged commits are then cherry-picked into the remaining
 * target branches using the local Git instance. The benefit is that the Github merged state
 * is properly set, but a notable downside is that PRs cannot use fixup or squash commits.
 */
export declare class GithubApiMergeStrategy extends MergeStrategy {
    private _config;
    constructor(git: AuthenticatedGitClient, _config: GithubApiMergeStrategyConfig);
    merge(pullRequest: PullRequest): Promise<PullRequestFailure | null>;
    /**
     * Prompts the user for the commit message changes. Unlike as in the autosquash merge
     * strategy, we cannot start an interactive rebase because we merge using the Github API.
     * The Github API only allows modifications to PR title and body for squash merges.
     */
    private _promptCommitMessageEdit;
    /**
     * Gets a commit message for the given pull request. Github by default concatenates
     * multiple commit messages if a PR is merged in squash mode. We try to replicate this
     * behavior here so that we have a default commit message that can be fixed up.
     */
    private _getDefaultSquashCommitMessage;
    /** Gets all commit messages of commits in the pull request. */
    private _getPullRequestCommitMessages;
    /**
     * Checks if given pull request could be merged into its target branches.
     * @returns A pull request failure if it the PR could not be merged.
     */
    private _checkMergability;
    /** Determines the merge action from the given pull request. */
    private _getMergeActionFromPullRequest;
}
