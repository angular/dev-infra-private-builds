/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as semver from 'semver';
import { AuthenticatedGitClient } from '../../utils/git/authenticated-git-client';
import { BuiltPackageWithInfo, ReleaseConfig } from '../config/index';
import { ReleaseNotes } from '../notes/release-notes';
import { NpmDistTag } from '../versioning';
import { ActiveReleaseTrains } from '../versioning/active-release-trains';
/** Interface describing a Github repository. */
export interface GithubRepo {
    owner: string;
    name: string;
}
/** Interface describing a Github pull request. */
export interface PullRequest {
    /** Unique id for the pull request (i.e. the PR number). */
    id: number;
    /** URL that resolves to the pull request in Github. */
    url: string;
    /** Fork containing the head branch of this pull request. */
    fork: GithubRepo;
    /** Branch name in the fork that defines this pull request. */
    forkBranch: string;
}
/** Constructor type for instantiating a release action */
export interface ReleaseActionConstructor<T extends ReleaseAction = ReleaseAction> {
    /** Whether the release action is currently active. */
    isActive(active: ActiveReleaseTrains, config: ReleaseConfig): Promise<boolean>;
    /** Constructs a release action. */
    new (...args: [ActiveReleaseTrains, AuthenticatedGitClient, ReleaseConfig, string]): T;
}
/**
 * Abstract base class for a release action. A release action is selectable by the caretaker
 * if active, and can perform changes for releasing, such as staging a release, bumping the
 * version, cherry-picking the changelog, branching off from the main branch. etc.
 */
export declare abstract class ReleaseAction {
    protected active: ActiveReleaseTrains;
    protected git: AuthenticatedGitClient;
    protected config: ReleaseConfig;
    protected projectDir: string;
    /** Whether the release action is currently active. */
    static isActive(_trains: ActiveReleaseTrains, _config: ReleaseConfig): Promise<boolean>;
    /** Gets the description for a release action. */
    abstract getDescription(): Promise<string>;
    /**
     * Performs the given release action.
     * @throws {UserAbortedReleaseActionError} When the user manually aborted the action.
     * @throws {FatalReleaseActionError} When the action has been aborted due to a fatal error.
     */
    abstract perform(): Promise<void>;
    constructor(active: ActiveReleaseTrains, git: AuthenticatedGitClient, config: ReleaseConfig, projectDir: string);
    /** Updates the version in the project top-level `package.json` file. */
    protected updateProjectVersion(newVersion: semver.SemVer): Promise<void>;
    /** Gets the most recent commit of a specified branch. */
    protected getLatestCommitOfBranch(branchName: string): Promise<string>;
    /** Checks whether the given revision is ahead to the base by the specified amount. */
    private _isRevisionAheadOfBase;
    /**
     * Verifies that the given commit has passing all statuses.
     *
     * Upon error, a link to the branch containing the commit is printed,
     * allowing the caretaker to quickly inspect the GitHub commit status failures.
     */
    protected assertPassingGithubStatus(commitSha: string, branchNameForError: string): Promise<void>;
    /**
     * Prompts the user for potential release notes edits that need to be made. Once
     * confirmed, a new commit for the release point is created.
     */
    protected waitForEditsAndCreateReleaseCommit(newVersion: semver.SemVer): Promise<void>;
    /**
     * Gets an owned fork for the configured project of the authenticated user. Aborts the
     * process with an error if no fork could be found.
     */
    private _getForkOfAuthenticatedUser;
    /** Checks whether a given branch name is reserved in the specified repository. */
    private _isBranchNameReservedInRepo;
    /** Finds a non-reserved branch name in the repository with respect to a base name. */
    private _findAvailableBranchName;
    /**
     * Creates a local branch from the current Git `HEAD`. Will override
     * existing branches in case of a collision.
     */
    protected createLocalBranchFromHead(branchName: string): Promise<void>;
    /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
    protected pushHeadToRemoteBranch(branchName: string): Promise<void>;
    /**
     * Pushes the current Git `HEAD` to a fork for the configured project that is owned by
     * the authenticated user. If the specified branch name exists in the fork already, a
     * unique one will be generated based on the proposed name to avoid collisions.
     * @param proposedBranchName Proposed branch name for the fork.
     * @param trackLocalBranch Whether the fork branch should be tracked locally. i.e. whether
     *   a local branch with remote tracking should be set up.
     * @returns The fork and branch name containing the pushed changes.
     */
    private _pushHeadToFork;
    /**
     * Pushes changes to a fork for the configured project that is owned by the currently
     * authenticated user. A pull request is then created for the pushed changes on the
     * configured project that targets the specified target branch.
     * @returns An object describing the created pull request.
     */
    protected pushChangesToForkAndCreatePullRequest(targetBranch: string, proposedForkBranchName: string, title: string, body?: string): Promise<PullRequest>;
    /**
     * Waits for the given pull request to be merged. Default interval for checking the Github
     * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
     * merge, the script will abort gracefully (considering a manual user abort).
     */
    protected waitForPullRequestToBeMerged({ id }: PullRequest, interval?: number): Promise<void>;
    /**
     * Prepend releases notes for a version published in a given branch to the changelog in
     * the current Git `HEAD`. This is useful for cherry-picking the changelog.
     * @returns A boolean indicating whether the release notes have been prepended.
     */
    protected prependReleaseNotesToChangelog(releaseNotes: ReleaseNotes): Promise<void>;
    /** Checks out an upstream branch with a detached head. */
    protected checkoutUpstreamBranch(branchName: string): Promise<void>;
    /** Installs all Yarn dependencies in the current branch. */
    protected installDependenciesForCurrentBranch(): Promise<void>;
    /**
     * Creates a commit for the specified files with the given message.
     * @param message Message for the created commit
     * @param files List of project-relative file paths to be committed.
     */
    protected createCommit(message: string, files: string[]): Promise<void>;
    /**
     * Builds the release output for the current branch. Assumes the node modules
     * to be already installed for the current branch.
     *
     * @returns A list of built release packages.
     */
    protected buildReleaseForCurrentBranch(): Promise<BuiltPackageWithInfo[]>;
    /**
     * Stages the specified new version for the current branch, builds the release output,
     * verifies its output and creates a pull request  that targets the given base branch.
     *
     * This method assumes the staging branch is already checked-out.
     *
     * @param newVersion New version to be staged.
     * @param compareVersionForReleaseNotes Version used for comparing with the current
     *   `HEAD` in order build the release notes.
     * @param pullRequestTargetBranch Branch the pull request should target.
     * @returns an object capturing actions performed as part of staging.
     */
    protected stageVersionForBranchAndCreatePullRequest(newVersion: semver.SemVer, compareVersionForReleaseNotes: semver.SemVer, pullRequestTargetBranch: string): Promise<{
        releaseNotes: ReleaseNotes;
        pullRequest: PullRequest;
        builtPackagesWithInfo: BuiltPackageWithInfo[];
    }>;
    /**
     * Checks out the specified target branch, verifies its CI status and stages
     * the specified new version in order to create a pull request.
     *
     * @param newVersion New version to be staged.
     * @param compareVersionForReleaseNotes Version used for comparing with `HEAD` of
     *   the staging branch in order build the release notes.
     * @param stagingBranch Branch within the new version should be staged.
     * @returns an object capturing actions performed as part of staging.
     */
    protected checkoutBranchAndStageVersion(newVersion: semver.SemVer, compareVersionForReleaseNotes: semver.SemVer, stagingBranch: string): Promise<{
        releaseNotes: ReleaseNotes;
        pullRequest: PullRequest;
        builtPackagesWithInfo: BuiltPackageWithInfo[];
        beforeStagingSha: string;
    }>;
    /**
     * Cherry-picks the release notes of a version that have been pushed to a given branch
     * into the `next` primary development branch. A pull request is created for this.
     * @returns a boolean indicating successful creation of the cherry-pick pull request.
     */
    protected cherryPickChangelogIntoNextBranch(releaseNotes: ReleaseNotes, stagingBranch: string): Promise<boolean>;
    /**
     * Creates a Github release for the specified version. The release is created
     * by tagging the version bump commit, and by creating the release entry.
     *
     * Expects the version bump commit and changelog to be available in the
     * upstream remote.
     *
     * @param releaseNotes The release notes for the version being published.
     * @param versionBumpCommitSha Commit that bumped the version. The release tag
     *   will point to this commit.
     * @param isPrerelease Whether the new version is published as a pre-release.
     */
    private _createGithubReleaseForVersion;
    /** Gets a Github URL that resolves to the release notes in the given ref. */
    private _getGithubChangelogUrlForRef;
    /**
     * Publishes the given packages to the registry and makes the releases
     * available on GitHub.
     *
     * @param builtPackagesWithInfo List of built packages that will be published.
     * @param releaseNotes The release notes for the version being published.
     * @param beforeStagingSha Commit SHA that is expected to be the most recent one after
     *   the actual version bump commit. This exists to ensure that caretakers do not land
     *   additional changes after the release output has been built locally.
     * @param publishBranch Name of the branch that contains the new version.
     * @param npmDistTag NPM dist tag where the version should be published to.
     * @param additionalOptions Additional options for building and publishing.
     */
    protected publish(builtPackagesWithInfo: BuiltPackageWithInfo[], releaseNotes: ReleaseNotes, beforeStagingSha: string, publishBranch: string, npmDistTag: NpmDistTag, additionalOptions?: {
        skipExperimentalPackages?: boolean;
    }): Promise<void>;
    /** Publishes the given built package to NPM with the specified NPM dist tag. */
    private _publishBuiltPackageToNpm;
    /** Checks whether the given commit represents a staging commit for the specified version. */
    private _isCommitForVersionStaging;
    /** Verify the version of each generated package exact matches the specified version. */
    private _verifyPackageVersions;
}
