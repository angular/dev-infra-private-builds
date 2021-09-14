import * as semver from 'semver';
import { CommitFromGitLog } from '../../commit-message/parse';
import { GitClient } from '../../utils/git/git-client';
/** Project-relative path for the changelog file. */
export declare const changelogPath = "CHANGELOG.md";
/** Release note generation. */
export declare class ReleaseNotes {
    version: semver.SemVer;
    private commits;
    private git;
    static forRange(version: semver.SemVer, baseRef: string, headRef: string): Promise<ReleaseNotes>;
    /** The changelog writer. */
    private changelog;
    /** The RenderContext to be used during rendering. */
    private renderContext;
    /** The title to use for the release. */
    private title;
    /** The configuration ng-dev. */
    private config;
    /** The configuration for the release notes. */
    private get notesConfig();
    protected constructor(version: semver.SemVer, commits: CommitFromGitLog[], git: GitClient);
    /** Retrieve the release note generated for a Github Release. */
    getGithubReleaseEntry(): Promise<string>;
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry(): Promise<string>;
    /**
     * Prepend generated release note to the CHANGELOG.md file in the base directory of the repository
     * provided by the GitClient.
     */
    prependEntryToChangelog(): Promise<void>;
    /** Retrieve the number of commits included in the release notes after filtering and deduping. */
    getCommitCountInReleaseNotes(): Promise<number>;
    /**
     * Gets the URL fragment for the release notes. The URL fragment identifier
     * can be used to point to a specific changelog entry through an URL.
     */
    getUrlFragmentForRelease(): Promise<string>;
    /**
     * Prompt the user for a title for the release, if the project's configuration is defined to use a
     * title.
     */
    promptForReleaseTitle(): Promise<string | false>;
    /** Build the render context data object for constructing the RenderContext instance. */
    private generateRenderContext;
}
