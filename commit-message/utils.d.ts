/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/utils" />
import { ParsedCommitMessage } from './parse';
/** Retrieve and parse each commit message in a provide range. */
export declare function parseCommitMessagesForRange(range: string): ParsedCommitMessage[];
