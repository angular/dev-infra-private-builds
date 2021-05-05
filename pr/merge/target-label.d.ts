/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/target-label" />
import { MergeConfig, TargetLabel } from './config';
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
export declare function getTargetLabelFromPullRequest(config: Pick<MergeConfig, 'labels'>, labels: string[]): TargetLabel;
/**
 * Gets the branches from the specified target label.
 *
 * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
 * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
 */
export declare function getBranchesFromTargetLabel(label: TargetLabel, githubTargetBranch: string): Promise<string[]>;
