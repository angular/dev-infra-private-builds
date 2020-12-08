/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/check-target-branches/check-target-branches" />
export declare function getTargetBranchesForPr(prNumber: number): Promise<string[] | undefined>;
export declare function printTargetBranchesForPr(prNumber: number): Promise<void>;
