/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { GithubConfig, NgDevConfig } from '../../utils/config.js';
/**
 * Possible merge methods supported by the Github API.
 * https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button.
 */
export declare type GithubApiMergeMethod = 'merge' | 'squash' | 'rebase';
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
/** Configuration for the merge script. */
export interface PullRequestConfig {
    /**
     * Configuration for the upstream remote. All of these options are optional as
     * defaults are provided by the common dev-infra github configuration.
     */
    remote?: GithubConfig;
    /** List of target labels. */
    noTargetLabeling?: boolean;
    /** Required base commits for given branches. */
    requiredBaseCommits?: {
        [branchName: string]: string;
    };
    /** Pattern that matches labels which imply a merge ready pull request. */
    mergeReadyLabel: string;
    /** Label that is applied when special attention from the caretaker is required. */
    caretakerNoteLabel?: string;
    /** Label which can be applied to fixup commit messages in the merge script. */
    commitMessageFixupLabel: string;
    /**
     * Whether pull requests should be merged using the Github API. This can be enabled
     * if projects want to have their pull requests show up as `Merged` in the Github UI.
     * The downside is that fixup or squash commits no longer work as the Github API does
     * not support this.
     */
    githubApiMerge: false | GithubApiMergeStrategyConfig;
    /**
     * List of commit scopes which are exempted from target label content requirements. i.e. no `feat`
     * scopes in patch branches, no breaking changes in minor or patch changes.
     */
    targetLabelExemptScopes?: string[];
    /**
     * Special flag that should **NOT** be used without confirming with the dev-infra team.
     * This flag turns the RC/FF release-train into an exceptional minor release-train by:
     *
     *    - changing `target: minor` to point to `target: rc` (without the RC merge restrictions)
     */
    __specialTreatRcAsExceptionalMinor?: boolean;
}
/** Loads and validates the merge configuration. */
export declare function assertValidPullRequestConfig<T extends NgDevConfig>(config: T & Partial<{
    pullRequest: PullRequestConfig;
}>): asserts config is T & {
    pullRequest: PullRequestConfig;
};
/** Label for pull requests containing a breaking change. */
export declare const breakingChangeLabel = "flag: breaking change";
/** Label for pull requests containing a deprecation. */
export declare const deprecationLabel = "flag: deprecation";
