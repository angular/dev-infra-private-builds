import semver from 'semver';
import { CommitFromGitLog } from '../../commit-message/parse.js';
import { GitClient } from '../../utils/git/git-client.js';
import { ReleaseConfig } from '../config/index.js';
import { NgDevConfig } from '../../utils/config.js';
/** Workspace-relative path for the changelog file. */
export declare const workspaceRelativeChangelogPath = "CHANGELOG.md";
/** Release note generation. */
export declare class ReleaseNotes {
    config: NgDevConfig<{
        release: ReleaseConfig;
    }>;
    version: semver.SemVer;
    private commits;
    private git;
    static forRange(git: GitClient, version: semver.SemVer, baseRef: string, headRef: string): Promise<ReleaseNotes>;
    /** The RenderContext to be used during rendering. */
    private renderContext;
    /** The title to use for the release. */
    private title;
    protected constructor(config: NgDevConfig<{
        release: ReleaseConfig;
    }>, version: semver.SemVer, commits: CommitFromGitLog[], git: GitClient);
    /** Retrieve the release note generated for a Github Release. */
    getGithubReleaseEntry(): Promise<string>;
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry(): Promise<string>;
    /**
     * Prepend generated release note to the CHANGELOG.md file in the base directory of the repository
     * provided by the GitClient. Removes entries for related prerelease entries as appropriate.
     */
    prependEntryToChangelogFile(): Promise<void>;
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
    /** Gets the configuration for the release notes. */
    private _getNotesConfig;
}
