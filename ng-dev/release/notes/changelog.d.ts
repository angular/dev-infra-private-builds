import * as semver from 'semver';
import { GitClient } from '../../utils/git/git-client';
/** A marker used to split a CHANGELOG.md file into individual entries. */
export declare const splitMarker = "<!-- CHANGELOG SPLIT MARKER -->";
export declare class Changelog {
    private git;
    /** Prepend a changelog entry to the current changelog file. */
    static prependEntryToChangelogFile(git: GitClient, entry: string): void;
    /**
     * Move all changelog entries from the CHANGELOG.md file for versions prior to the provided
     * version to the changelog archive.
     *
     * Versions should be used to determine which entries are moved to archive as versions are the
     * most accurate piece of context found within a changelog entry to determine its relationship to
     * other changelog entries.  This allows for example, moving all changelog entries out of the
     * main changelog when a version moves out of support.
     */
    static moveEntriesPriorToVersionToArchive(git: GitClient, version: semver.SemVer): void;
    /** Retrieve the file paths for the changelog files. */
    static getChangelogFilePaths(git: GitClient): Changelog;
    /** The absolute path to the changelog file. */
    readonly filePath: string;
    /** The absolute path to the changelog archive file. */
    readonly archiveFilePath: string;
    /**
     * The changelog entries in the CHANGELOG.md file.
     * Delays reading the CHANGELOG.md file until it is actually used.
     */
    private get entries();
    private _entries;
    /**
     * The changelog entries in the CHANGELOG_ARCHIVE.md file.
     * Delays reading the CHANGELOG_ARCHIVE.md file until it is actually used.
     */
    private get archiveEntries();
    private _archiveEntries;
    private constructor();
    /** Prepend a changelog entry to the changelog. */
    private prependEntryToChangelogFile;
    /**
     * Move all changelog entries from the CHANGELOG.md file for versions prior to the provided
     * version to the changelog archive.
     *
     * Versions should be used to determine which entries are moved to archive as versions are the
     * most accurate piece of context found within a changelog entry to determine its relationship to
     * other changelog entries.  This allows for example, moving all changelog entries out of the
     * main changelog when a version moves out of support.
     */
    private moveEntriesPriorToVersionToArchive;
    /** Update the changelog archive file with the known changelog archive entries. */
    private writeToChangelogArchiveFile;
    /** Update the changelog file with the known changelog entries. */
    private writeToChangelogFile;
    /**
     * Retrieve the changelog entries for the provide changelog path, if the file does not exist an
     * empty array is returned.
     */
    private getEntriesFor;
}
