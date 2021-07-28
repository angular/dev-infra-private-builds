/// <amd-module name="@angular/dev-infra-private/release/notes/release-notes" />
import * as semver from 'semver';
import { CommitFromGitLog } from '../../commit-message/parse';
import { DevInfraReleaseConfig } from '../config/index';
/** Release note generation. */
export declare class ReleaseNotes {
    version: semver.SemVer;
    private startingRef;
    private endingRef;
    static fromRange(version: semver.SemVer, startingRef: string, endingRef: string): Promise<ReleaseNotes>;
    /** An instance of GitClient. */
    private git;
    /** The RenderContext to be used during rendering. */
    private renderContext;
    /** The title to use for the release. */
    private title;
    /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
    private commits;
    /** The configuration for release notes. */
    private config;
    protected constructor(version: semver.SemVer, startingRef: string, endingRef: string);
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
    protected getCommitsInRange(from: string, to?: string): Promise<CommitFromGitLog[]>;
    protected getReleaseConfig(config?: Partial<DevInfraReleaseConfig>): import("@angular/dev-infra-private/release/config").ReleaseConfig;
}
