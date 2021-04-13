/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/pr/discover-new-conflicts" />
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
export declare function discoverNewConflictsForPr(newPrNumber: number, updatedAfter: number): Promise<void>;
/** Reset git back to the provided branch or revision. */
export declare function cleanUpGitState(previousBranchOrRevision: string): void;
