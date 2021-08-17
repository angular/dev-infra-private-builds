import * as semver from 'semver';
import { CommitFromGitLog } from '../../commit-message/parse';
import { DevInfraReleaseConfig } from '../config/index';
/** Release note generation. */
export declare class ReleaseNotes {
    version: semver.SemVer;
    private commits;
    static forRange(version: semver.SemVer, baseRef: string, headRef: string): Promise<ReleaseNotes>;
    /** An instance of GitClient. */
    private git;
    /** The RenderContext to be used during rendering. */
    private renderContext;
    /** The title to use for the release. */
    private title;
    /** The configuration for release notes. */
    private config;
    protected constructor(version: semver.SemVer, commits: CommitFromGitLog[]);
    /** Retrieve the release note generated for a Github Release. */
    getGithubReleaseEntry(): Promise<string>;
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry(): Promise<string>;
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
    protected getReleaseConfig(config?: Partial<DevInfraReleaseConfig>): import("../config/index").ReleaseConfig;
}
