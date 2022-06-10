/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CommitFromGitLog } from '../../commit-message/parse.js';
import { GithubConfig } from '../../utils/config.js';
import { ReleaseNotesConfig } from '../config/index.js';
/** Data used for context during rendering. */
export interface RenderContextData {
    title: string | false;
    groupOrder: ReleaseNotesConfig['groupOrder'];
    hiddenScopes: ReleaseNotesConfig['hiddenScopes'];
    categorizeCommit: ReleaseNotesConfig['categorizeCommit'];
    commits: CommitFromGitLog[];
    version: string;
    github: GithubConfig;
    date?: Date;
}
/** Interface describing an categorized commit. */
export interface CategorizedCommit extends CommitFromGitLog {
    groupName: string;
    description: string;
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
    /** The version of the release. */
    readonly version: string;
    /** The date stamp string for use in the release notes entry. */
    readonly dateStamp: string;
    /** URL fragment that is used to create an anchor for the release. */
    readonly urlFragmentForRelease: string;
    /** List of categorized commits in the release period. */
    readonly commits: CategorizedCommit[];
    constructor(data: RenderContextData);
    /** Gets a list of categorized commits from all commits in the release period. */
    _categorizeCommits(commits: CommitFromGitLog[]): CategorizedCommit[];
    /**
     * Comparator used for sorting commits within a release notes group. Commits
     * are sorted alphabetically based on their type. Commits having the same type
     * will be sorted alphabetically based on their determined description
     */
    private _commitsWithinGroupComparator;
    /**
     * Organizes and sorts the commits into groups of commits.
     *
     * Groups are sorted either by default `Array.sort` order, or using the provided group order from
     * the configuration. Commits are order in the same order within each groups commit list as they
     * appear in the provided list of commits.
     * */
    asCommitGroups(commits: CategorizedCommit[]): {
        title: string;
        commits: CategorizedCommit[];
    }[];
    /** Whether the specified commit contains breaking changes. */
    hasBreakingChanges(commit: CategorizedCommit): boolean;
    /** Whether the specified commit contains deprecations. */
    hasDeprecations(commit: CategorizedCommit): boolean;
    /**
     * A filter function for filtering a list of commits to only include commits which
     * should appear in release notes.
     */
    includeInReleaseNotes(): (commit: CategorizedCommit) => boolean;
    /**
     * A filter function for filtering a list of commits to only include commits which contain a
     * unique value for the provided field across all commits in the list.
     */
    unique(field: keyof CategorizedCommit): (commit: CategorizedCommit) => boolean;
    /**
     * Convert a commit object to a Markdown link.
     */
    commitToLink(commit: CategorizedCommit): string;
    /**
     * Convert a pull request number to a Markdown link.
     */
    pullRequestToLink(prNumber: number): string;
    /**
     * Transform a given string by replacing any pull request references with their
     * equivalent markdown links.
     *
     * This is useful for the changelog output. Github transforms pull request references
     * automatically in release note entries, issues and pull requests, but not for plain
     * markdown files (like the changelog file).
     */
    convertPullRequestReferencesToLinks(content: string): string;
    /**
     * Bulletize a paragraph.
     */
    bulletizeText(text: string): string;
    /**
     * Returns unique, sorted and filtered commit authors.
     */
    commitAuthors(commits: CategorizedCommit[]): string[];
    /**
     * Convert a commit object to a Markdown linked badged.
     */
    commitToBadge(commit: CategorizedCommit): string;
}
/**
 * Builds a date stamp for stamping in release notes.
 *
 * Uses the current date, or a provided date in the format of YYYY-MM-DD, i.e. 1970-11-05.
 */
export declare function buildDateStamp(date?: Date): string;
