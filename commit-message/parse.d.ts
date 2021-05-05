/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/parse" />
import { Commit as ParsedCommit } from 'conventional-commits-parser';
/** A parsed commit, containing the information needed to validate the commit. */
export interface Commit {
    /** The full raw text of the commit. */
    fullText: string;
    /** The header line of the commit, will be used in the changelog entries. */
    header: string;
    /** The full body of the commit, not including the footer. */
    body: string;
    /** The footer of the commit, containing issue references and note sections. */
    footer: string;
    /** A list of the references to other issues made throughout the commit message. */
    references: ParsedCommit.Reference[];
    /** The type of the commit message. */
    type: string;
    /** The scope of the commit message. */
    scope: string;
    /** The npm scope of the commit message. */
    npmScope: string;
    /** The subject of the commit message. */
    subject: string;
    /** A list of breaking change notes in the commit message. */
    breakingChanges: ParsedCommit.Note[];
    /** A list of deprecation notes in the commit message. */
    deprecations: ParsedCommit.Note[];
    /** Whether the commit is a fixup commit. */
    isFixup: boolean;
    /** Whether the commit is a squash commit. */
    isSquash: boolean;
    /** Whether the commit is a revert commit. */
    isRevert: boolean;
}
/** Parse a full commit message into its composite parts. */
export declare function parseCommitMessage(fullText: string): Commit;
/** Retrieve and parse each commit message in a provide range. */
export declare function parseCommitMessagesForRange(range: string): Commit[];
