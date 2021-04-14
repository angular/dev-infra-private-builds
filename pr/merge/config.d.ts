/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/config" />
import { GitClientConfig, NgDevConfig } from '../../utils/config';
import { GithubClient } from '../../utils/git/github';
import { GithubApiMergeStrategyConfig } from './strategies/api-merge';
/** Describes possible values that can be returned for `branches` of a target label. */
export declare type TargetLabelBranchResult = string[] | Promise<string[]>;
/**
 * Possible merge methods supported by the Github API.
 * https://developer.github.com/v3/pulls/#merge-a-pull-request-merge-button.
 */
export declare type GithubApiMergeMethod = 'merge' | 'squash' | 'rebase';
/**
 * Target labels represent Github pull requests labels. These labels instruct the merge
 * script into which branches a given pull request should be merged to.
 */
export interface TargetLabel {
    /** Pattern that matches the given target label. */
    pattern: RegExp | string;
    /**
     * List of branches a pull request with this target label should be merged into.
     * Can also be wrapped in a function that accepts the target branch specified in the
     * Github Web UI. This is useful for supporting labels like `target: development-branch`.
     *
     * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
     * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
     */
    branches: TargetLabelBranchResult | ((githubTargetBranch: string) => TargetLabelBranchResult);
}
/**
 * Configuration for the merge script with all remote options specified. The
 * default `MergeConfig` has does not require any of these options as defaults
 * are provided by the common dev-infra github configuration.
 */
export declare type MergeConfigWithRemote = MergeConfig & {
    remote: GitClientConfig;
};
/** Configuration for the merge script. */
export interface MergeConfig {
    /**
     * Configuration for the upstream remote. All of these options are optional as
     * defaults are provided by the common dev-infra github configuration.
     */
    remote?: GitClientConfig;
    /** List of target labels. */
    labels: TargetLabel[];
    /** Required base commits for given branches. */
    requiredBaseCommits?: {
        [branchName: string]: string;
    };
    /** Pattern that matches labels which imply a signed CLA. */
    claSignedLabel: string | RegExp;
    /** Pattern that matches labels which imply a merge ready pull request. */
    mergeReadyLabel: string | RegExp;
    /** Label that is applied when special attention from the caretaker is required. */
    caretakerNoteLabel?: string | RegExp;
    /** Label which can be applied to fixup commit messages in the merge script. */
    commitMessageFixupLabel: string | RegExp;
    /** Label that is applied when a breaking change is made in the pull request. */
    breakingChangeLabel?: string;
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
}
/**
 * Configuration of the merge script in the dev-infra configuration. Note that the
 * merge configuration is retrieved lazily as usually these configurations rely
 * on branch name computations. We don't want to run these immediately whenever
 * the dev-infra configuration is loaded as that could slow-down other commands.
 */
export declare type DevInfraMergeConfig = NgDevConfig<{
    'merge': (api: GithubClient) => MergeConfig | Promise<MergeConfig>;
}>;
/** Loads and validates the merge configuration. */
export declare function loadAndValidateConfig(config: Partial<DevInfraMergeConfig>, api: GithubClient): Promise<{
    config?: MergeConfig;
    errors?: string[];
}>;
