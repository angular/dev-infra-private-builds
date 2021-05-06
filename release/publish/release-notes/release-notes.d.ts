/// <amd-module name="@angular/dev-infra-private/release/publish/release-notes/release-notes" />
import * as semver from 'semver';
import { ReleaseConfig } from '../../config/index';
/** Gets the path for the changelog file in a given project. */
export declare function getLocalChangelogFilePath(projectDir: string): string;
/** Release note generation. */
export declare class ReleaseNotes {
    readonly version: semver.SemVer;
    private config;
    /** Construct a release note generation instance. */
    static fromLatestTagToHead(version: semver.SemVer, config: ReleaseConfig): Promise<ReleaseNotes>;
    /** An instance of GitClient. */
    private git;
    /** The RenderContext to be used during rendering. */
    private renderContext;
    /** The title to use for the release. */
    private title;
    /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
    private commits;
    private constructor();
    /** Retrieve the release note generated for a Github Release. */
    getGithubReleaseEntry(): Promise<string>;
    /** Retrieve the release note generated for a CHANGELOG entry. */
    getChangelogEntry(): Promise<string>;
    /**
     * Prompt the user for a title for the release, if the project's configuration is defined to use a
     * title.
     */
    promptForReleaseTitle(): Promise<string | false>;
    /** Build the render context data object for constructing the RenderContext instance. */
    private generateRenderContext;
}
