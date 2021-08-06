/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Checks if the provided PR will cause new conflicts in other pending PRs. */
export declare function discoverNewConflictsForPr(newPrNumber: number, updatedAfter: number): Promise<void>;
