/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/parse" />
/** A parsed commit message. */
export interface ParsedCommitMessage {
    header: string;
    body: string;
    bodyWithoutLinking: string;
    type: string;
    scope: string;
    subject: string;
    isFixup: boolean;
    isSquash: boolean;
    isRevert: boolean;
}
/** Parse a full commit message into its composite parts. */
export declare function parseCommitMessage(commitMsg: string): ParsedCommitMessage;
