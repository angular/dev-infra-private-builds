/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommitFromGitLog } from '../../commit-message/parse';
import { GitClientConfig } from '../../utils/config';
import { ReleaseNotesConfig } from '../config/index';
/** Data used for context during rendering. */
export interface RenderContextData {
    title: string | false;
    groupOrder?: ReleaseNotesConfig['groupOrder'];
    hiddenScopes?: ReleaseNotesConfig['hiddenScopes'];
    date?: Date;
    commits: CommitFromGitLog[];
    version: string;
    github: GitClientConfig;
}
/** Context class used for rendering release notes. */
export declare class RenderContext {
    private readonly data;
    /** An array of group names in sort order if defined. */
    private readonly groupOrder;
    /** An array of scopes to hide from the release entry output. */
    private readonly hiddenScopes;
    /** The title of the release, or `false` if no title should be used. */
    readonly title: string | false;
    /** An array of commits in the release period. */
    readonly commits: CommitFromGitLog[];
    /** The version of the release. */
    readonly version: string;
    /** The date stamp string for use in the release notes entry. */
    readonly dateStamp: string;
    /** URL fragment that is used to create an anchor for the release. */
    readonly urlFragmentForRelease: string;
    constructor(data: RenderContextData);
    /**
     * Organizes and sorts the commits into groups of commits.
     *
     * Groups are sorted either by default `Array.sort` order, or using the provided group order from
     * the configuration. Commits are order in the same order within each groups commit list as they
     * appear in the provided list of commits.
     * */
    asCommitGroups(commits: CommitFromGitLog[]): {
        title: string;
        commits: CommitFromGitLog[];
    }[];
    /** Whether the specified commit contains breaking changes. */
    hasBreakingChanges(commit: CommitFromGitLog): boolean;
    /** Whether the specified commit contains deprecations. */
    hasDeprecations(commit: CommitFromGitLog): boolean;
    /**
     * A filter function for filtering a list of commits to only include commits which
     * should appear in release notes.
     */
    includeInReleaseNotes(): (commit: CommitFromGitLog) => boolean;
    /**
     * A filter function for filtering a list of commits to only include commits which contain a
     * unique value for the provided field across all commits in the list.
     */
    unique(field: keyof CommitFromGitLog): (commit: CommitFromGitLog) => boolean;
    /**
     * Convert a commit object to a Markdown link.
     */
    commitToLink(commit: CommitFromGitLog): string;
    /**
     * Convert a pull request number to a Markdown link.
     */
    pullRequestToLink(prNumber: number): string;
    /**
     * Transform a commit message header by replacing the parenthesized pull request reference at the
     * end of the line (which is added by merge tooling) to a Markdown link.
     */
    replaceCommitHeaderPullRequestNumber(header: string): string;
    /**
     * Bulletize a paragraph.
     */
    bulletizeText(text: string): string;
    /**
     * Returns unique, sorted and filtered commit authors.
     */
    commitAuthors(commits: CommitFromGitLog[]): string[];
    /**
     * Convert a commit object to a Markdown linked badged.
     */
    commitToBadge(commit: CommitFromGitLog): string;
}
/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
export declare function buildDateStamp(date?: Date): string;
