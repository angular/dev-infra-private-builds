/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PullRequestConfig } from '../../config';
import { GithubConfig } from '../../../utils/config';
import { Commit } from '../../../commit-message/parse';
import { GithubClient } from '../../../utils/git/github';
/**
 * Enum capturing available target label names in the Angular organization. A target
 * label is set on a pull request to specify where its changes should land.
 *
 * More details can be found here:
 * https://docs.google.com/document/d/197kVillDwx-RZtSVOBtPb4BBIAw0E9RT3q3v6DZkykU#heading=h.lkuypj38h15d
 */
export declare enum TargetLabelName {
    MAJOR = "target: major",
    MINOR = "target: minor",
    PATCH = "target: patch",
    RELEASE_CANDIDATE = "target: rc",
    LONG_TERM_SUPPORT = "target: lts"
}
/**
 * Describes a label that can be applied to a pull request to mark into
 * which branches it should be merged into.
 */
export interface TargetLabel {
    /** Name of the target label. Needs to match with the name of the label on Github. */
    name: TargetLabelName;
    /**
     * List of branches a pull request with this target label should be merged into.
     * Can also be wrapped in a function that accepts the target branch specified in the
     * Github Web UI. This is useful for supporting labels like `target: development-branch`.
     *
     * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
     * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
     */
    branches: (githubTargetBranch: string) => string[] | Promise<string[]>;
}
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid branch is targeted.
 */
export declare class InvalidTargetBranchError {
    failureMessage: string;
    constructor(failureMessage: string);
}
/**
 * Unique error that can be thrown in the merge configuration if an
 * invalid label has been applied to a pull request.
 */
export declare class InvalidTargetLabelError {
    failureMessage: string;
    constructor(failureMessage: string);
}
/** Gets the target label from the specified pull request labels. */
export declare function getMatchingTargetLabelForPullRequest(config: Pick<PullRequestConfig, 'noTargetLabeling'>, labelsOnPullRequest: string[], allTargetLabels: TargetLabel[]): Promise<TargetLabel>;
/** Get the branches the pull request should be merged into. */
export declare function getTargetBranchesForPullRequest(api: GithubClient, config: {
    pullRequest: PullRequestConfig;
    github: GithubConfig;
}, labelsOnPullRequest: string[], githubTargetBranch: string, commits: Commit[]): Promise<string[]>;
/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
export declare function getBranchesFromTargetLabel(label: TargetLabel, githubTargetBranch: string): Promise<string[]>;
