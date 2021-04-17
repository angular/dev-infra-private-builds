/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <amd-module name="@angular/dev-infra-private/commit-message/parse" />
/// <reference types="node" />
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
/** A parsed commit which originated from a Git Log entry */
export interface CommitFromGitLog extends Commit {
    author: string;
    hash: string;
    shortHash: string;
}
/**
 * A list of tuples expressing the fields to extract from each commit log entry. The tuple contains
 * two values, the first is the key for the property and the second is the template shortcut for the
 * git log command.
 */
declare const commitFields: {
    hash: string;
    shortHash: string;
    author: string;
};
/** The additional fields to be included in commit log entries for parsing. */
export declare type CommitFields = typeof commitFields;
/** The commit fields described as git log format entries for parsing. */
export declare const commitFieldsAsFormat: (fields: CommitFields) => string;
/**
 * The git log format template to create git log entries for parsing.
 *
 * The conventional commits parser expects to parse the standard git log raw body (%B) into its
 * component parts. Additionally it will parse additional fields with keys defined by
 * `-{key name}-` separated by new lines.
 * */
export declare const gitLogFormatForParsing: string;
/** Parse a commit message into its composite parts. */
export declare const parseCommitMessage: (fullText: string) => Commit;
/** Parse a commit message from a git log entry into its composite parts. */
export declare const parseCommitFromGitLog: (fullText: Buffer) => CommitFromGitLog;
export {};
