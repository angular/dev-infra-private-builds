/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/merge/target-label" />
import { MergeConfig, TargetLabel } from './config';
/** Gets the target label from the specified pull request labels. */
export declare function getTargetLabelFromPullRequest(config: MergeConfig, labels: string[]): TargetLabel | null;
/** Gets the branches from the specified target label. */
export declare function getBranchesFromTargetLabel(label: TargetLabel, githubTargetBranch: string): string[];
