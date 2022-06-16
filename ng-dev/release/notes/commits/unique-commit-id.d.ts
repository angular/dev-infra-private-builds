/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Commit } from '../../../commit-message/parse.js';
/**
 * Computes an unique id for the given commit using its commit message.
 * This can be helpful for comparisons, if commits differ in SHAs due
 * to cherry-picking.
 */
export declare function computeUniqueIdFromCommitMessage(commit: Commit): string;
