"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReleaseAction = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const semver = require("semver");
const console_1 = require("../../utils/console");
const spinner_1 = require("../../utils/spinner");
const github_urls_1 = require("../../utils/git/github-urls");
const semver_1 = require("../../utils/semver");
const release_notes_1 = require("../notes/release-notes");
const npm_publish_1 = require("../versioning/npm-publish");
const actions_error_1 = require("./actions-error");
const commit_message_1 = require("./commit-message");
const constants_1 = require("./constants");
const external_commands_1 = require("./external-commands");
const graphql_queries_1 = require("./graphql-queries");
const pull_request_state_1 = require("./pull-request-state");
const version_tags_1 = require("../versioning/version-tags");
const github_1 = require("../../utils/git/github");
/**
 * Abstract base class for a release action. A release action is selectable by the caretaker
 * if active, and can perform changes for releasing, such as staging a release, bumping the
 * version, cherry-picking the changelog, branching off from the main branch. etc.
 */
class ReleaseAction {
    constructor(active, git, config, projectDir) {
        this.active = active;
        this.git = git;
        this.config = config;
        this.projectDir = projectDir;
        /** Cached found fork of the configured project. */
        this._cachedForkRepo = null;
    }
    /** Whether the release action is currently active. */
    static isActive(_trains, _config) {
        throw Error('Not implemented.');
    }
    /** Retrieves the version in the project top-level `package.json` file. */
    async getProjectVersion() {
        const pkgJsonPath = (0, path_1.join)(this.projectDir, constants_1.packageJsonPath);
        const pkgJson = JSON.parse(await fs_1.promises.readFile(pkgJsonPath, 'utf8'));
        return new semver.SemVer(pkgJson.version);
    }
    /** Updates the version in the project top-level `package.json` file. */
    async updateProjectVersion(newVersion) {
        const pkgJsonPath = (0, path_1.join)(this.projectDir, constants_1.packageJsonPath);
        const pkgJson = JSON.parse(await fs_1.promises.readFile(pkgJsonPath, 'utf8'));
        pkgJson.version = newVersion.format();
        // Write the `package.json` file. Note that we add a trailing new line
        // to avoid unnecessary diff. IDEs usually add a trailing new line.
        await fs_1.promises.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
        (0, console_1.info)((0, console_1.green)(`  ✓   Updated project version to ${pkgJson.version}`));
    }
    /** Gets the most recent commit of a specified branch. */
    async _getCommitOfBranch(branchName) {
        const { data: { commit }, } = await this.git.github.repos.getBranch({ ...this.git.remoteParams, branch: branchName });
        return commit.sha;
    }
    /** Verifies that the latest commit for the given branch is passing all statuses. */
    async verifyPassingGithubStatus(branchName) {
        const commitSha = await this._getCommitOfBranch(branchName);
        const { data: { state }, } = await this.git.github.repos.getCombinedStatusForRef({
            ...this.git.remoteParams,
            ref: commitSha,
        });
        const branchCommitsUrl = (0, github_urls_1.getListCommitsInBranchUrl)(this.git, branchName);
        if (state === 'failure') {
            (0, console_1.error)((0, console_1.red)(`  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
                'status checks. Please make sure this commit passes all checks before re-running.'));
            (0, console_1.error)(`      Please have a look at: ${branchCommitsUrl}`);
            if (await (0, console_1.promptConfirm)('Do you want to ignore the Github status and proceed?')) {
                (0, console_1.info)((0, console_1.yellow)('  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.'));
                return;
            }
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        else if (state === 'pending') {
            (0, console_1.error)((0, console_1.red)(`  ✘   Commit "${commitSha}" still has pending github statuses that ` +
                'need to succeed before staging a release.'));
            (0, console_1.error)((0, console_1.red)(`      Please have a look at: ${branchCommitsUrl}`));
            if (await (0, console_1.promptConfirm)('Do you want to ignore the Github status and proceed?')) {
                (0, console_1.info)((0, console_1.yellow)('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
                return;
            }
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        (0, console_1.info)((0, console_1.green)('  ✓   Upstream commit is passing all github status checks.'));
    }
    /**
     * Prompts the user for potential release notes edits that need to be made. Once
     * confirmed, a new commit for the release point is created.
     */
    async waitForEditsAndCreateReleaseCommit(newVersion) {
        (0, console_1.info)((0, console_1.yellow)('  ⚠   Please review the changelog and ensure that the log contains only changes ' +
            'that apply to the public API surface. Manual changes can be made. When done, please ' +
            'proceed with the prompt below.'));
        if (!(await (0, console_1.promptConfirm)('Do you want to proceed and commit the changes?'))) {
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        // Commit message for the release point.
        const commitMessage = (0, commit_message_1.getCommitMessageForRelease)(newVersion);
        // Create a release staging commit including changelog and version bump.
        await this.createCommit(commitMessage, [constants_1.packageJsonPath, release_notes_1.changelogPath]);
        (0, console_1.info)((0, console_1.green)(`  ✓   Created release commit for: "${newVersion}".`));
    }
    /**
     * Gets an owned fork for the configured project of the authenticated user. Aborts the
     * process with an error if no fork could be found. Also caches the determined fork
     * repository as the authenticated user cannot change during action execution.
     */
    async _getForkOfAuthenticatedUser() {
        if (this._cachedForkRepo !== null) {
            return this._cachedForkRepo;
        }
        const { owner, name } = this.git.remoteConfig;
        const result = await this.git.github.graphql(graphql_queries_1.findOwnedForksOfRepoQuery, { owner, name });
        const forks = result.repository.forks.nodes;
        if (forks.length === 0) {
            (0, console_1.error)((0, console_1.red)('  ✘   Unable to find fork for currently authenticated user.'));
            (0, console_1.error)((0, console_1.red)(`      Please ensure you created a fork of: ${owner}/${name}.`));
            throw new actions_error_1.FatalReleaseActionError();
        }
        const fork = forks[0];
        return (this._cachedForkRepo = { owner: fork.owner.login, name: fork.name });
    }
    /** Checks whether a given branch name is reserved in the specified repository. */
    async _isBranchNameReservedInRepo(repo, name) {
        try {
            await this.git.github.repos.getBranch({ owner: repo.owner, repo: repo.name, branch: name });
            return true;
        }
        catch (e) {
            // If the error has a `status` property set to `404`, then we know that the branch
            // does not exist. Otherwise, it might be an API error that we want to report/re-throw.
            if (e instanceof github_1.GithubApiRequestError && e.status === 404) {
                return false;
            }
            throw e;
        }
    }
    /** Finds a non-reserved branch name in the repository with respect to a base name. */
    async _findAvailableBranchName(repo, baseName) {
        let currentName = baseName;
        let suffixNum = 0;
        while (await this._isBranchNameReservedInRepo(repo, currentName)) {
            suffixNum++;
            currentName = `${baseName}_${suffixNum}`;
        }
        return currentName;
    }
    /**
     * Creates a local branch from the current Git `HEAD`. Will override
     * existing branches in case of a collision.
     */
    async createLocalBranchFromHead(branchName) {
        this.git.run(['checkout', '-q', '-B', branchName]);
    }
    /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
    async pushHeadToRemoteBranch(branchName) {
        // Push the local `HEAD` to the remote branch in the configured project.
        this.git.run(['push', '-q', this.git.getRepoGitUrl(), `HEAD:refs/heads/${branchName}`]);
    }
    /**
     * Pushes the current Git `HEAD` to a fork for the configured project that is owned by
     * the authenticated user. If the specified branch name exists in the fork already, a
     * unique one will be generated based on the proposed name to avoid collisions.
     * @param proposedBranchName Proposed branch name for the fork.
     * @param trackLocalBranch Whether the fork branch should be tracked locally. i.e. whether
     *   a local branch with remote tracking should be set up.
     * @returns The fork and branch name containing the pushed changes.
     */
    async _pushHeadToFork(proposedBranchName, trackLocalBranch) {
        const fork = await this._getForkOfAuthenticatedUser();
        // Compute a repository URL for pushing to the fork. Note that we want to respect
        // the SSH option from the dev-infra github configuration.
        const repoGitUrl = (0, github_urls_1.getRepositoryGitUrl)({ ...fork, useSsh: this.git.remoteConfig.useSsh }, this.git.githubToken);
        const branchName = await this._findAvailableBranchName(fork, proposedBranchName);
        const pushArgs = [];
        // If a local branch should track the remote fork branch, create a branch matching
        // the remote branch. Later with the `git push`, the remote is set for the branch.
        if (trackLocalBranch) {
            await this.createLocalBranchFromHead(branchName);
            pushArgs.push('--set-upstream');
        }
        // Push the local `HEAD` to the remote branch in the fork.
        this.git.run(['push', '-q', repoGitUrl, `HEAD:refs/heads/${branchName}`, ...pushArgs]);
        return { fork, branchName };
    }
    /**
     * Pushes changes to a fork for the configured project that is owned by the currently
     * authenticated user. A pull request is then created for the pushed changes on the
     * configured project that targets the specified target branch.
     * @returns An object describing the created pull request.
     */
    async pushChangesToForkAndCreatePullRequest(targetBranch, proposedForkBranchName, title, body) {
        const repoSlug = `${this.git.remoteParams.owner}/${this.git.remoteParams.repo}`;
        const { fork, branchName } = await this._pushHeadToFork(proposedForkBranchName, true);
        const { data } = await this.git.github.pulls.create({
            ...this.git.remoteParams,
            head: `${fork.owner}:${branchName}`,
            base: targetBranch,
            body,
            title,
        });
        // Add labels to the newly created PR if provided in the configuration.
        if (this.config.releasePrLabels !== undefined) {
            await this.git.github.issues.addLabels({
                ...this.git.remoteParams,
                issue_number: data.number,
                labels: this.config.releasePrLabels,
            });
        }
        (0, console_1.info)((0, console_1.green)(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
        return {
            id: data.number,
            url: data.html_url,
            fork,
            forkBranch: branchName,
        };
    }
    /**
     * Waits for the given pull request to be merged. Default interval for checking the Github
     * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
     * merge, the script will abort gracefully (considering a manual user abort).
     */
    async waitForPullRequestToBeMerged({ id }, interval = constants_1.waitForPullRequestInterval) {
        return new Promise((resolve, reject) => {
            (0, console_1.debug)(`Waiting for pull request #${id} to be merged.`);
            const spinner = new spinner_1.Spinner(`Waiting for pull request #${id} to be merged.`);
            const intervalId = setInterval(async () => {
                const prState = await (0, pull_request_state_1.getPullRequestState)(this.git, id);
                if (prState === 'merged') {
                    spinner.complete();
                    (0, console_1.info)((0, console_1.green)(`  ✓   Pull request #${id} has been merged.`));
                    clearInterval(intervalId);
                    resolve();
                }
                else if (prState === 'closed') {
                    spinner.complete();
                    (0, console_1.warn)((0, console_1.yellow)(`  ✘   Pull request #${id} has been closed.`));
                    clearInterval(intervalId);
                    reject(new actions_error_1.UserAbortedReleaseActionError());
                }
            }, interval);
        });
    }
    /**
     * Prepend releases notes for a version published in a given branch to the changelog in
     * the current Git `HEAD`. This is useful for cherry-picking the changelog.
     * @returns A boolean indicating whether the release notes have been prepended.
     */
    async prependReleaseNotesToChangelog(releaseNotes) {
        await releaseNotes.prependEntryToChangelogFile();
        (0, console_1.info)((0, console_1.green)(`  ✓   Updated the changelog to capture changes for "${releaseNotes.version}".`));
    }
    /** Checks out an upstream branch with a detached head. */
    async checkoutUpstreamBranch(branchName) {
        this.git.run(['fetch', '-q', this.git.getRepoGitUrl(), branchName]);
        this.git.run(['checkout', '-q', 'FETCH_HEAD', '--detach']);
    }
    /**
     * Creates a commit for the specified files with the given message.
     * @param message Message for the created commit
     * @param files List of project-relative file paths to be committed.
     */
    async createCommit(message, files) {
        // Note: `git add` would not be needed if the files are already known to
        // Git, but the specified files could also be newly created, and unknown.
        this.git.run(['add', ...files]);
        this.git.run(['commit', '-q', '--no-verify', '-m', message, ...files]);
    }
    /**
     * Stages the specified new version for the current branch and creates a pull request
     * that targets the given base branch. Assumes the staging branch is already checked-out.
     *
     * @param newVersion New version to be staged.
     * @param compareVersionForReleaseNotes Version used for comparing with the current
     *   `HEAD` in order build the release notes.
     * @param pullRequestTargetBranch Branch the pull request should target.
     * @returns an object describing the created pull request.
     */
    async stageVersionForBranchAndCreatePullRequest(newVersion, compareVersionForReleaseNotes, pullRequestTargetBranch) {
        const releaseNotesCompareTag = (0, version_tags_1.getReleaseTagForVersion)(compareVersionForReleaseNotes);
        // Fetch the compare tag so that commits for the release notes can be determined.
        // We forcibly override existing local tags that are named similar as we will fetch
        // the correct tag for release notes comparison from the upstream remote.
        this.git.run([
            'fetch',
            '--force',
            this.git.getRepoGitUrl(),
            `refs/tags/${releaseNotesCompareTag}:refs/tags/${releaseNotesCompareTag}`,
        ]);
        // Build release notes for commits from `<releaseNotesCompareTag>..HEAD`.
        const releaseNotes = await release_notes_1.ReleaseNotes.forRange(newVersion, releaseNotesCompareTag, 'HEAD');
        await this.updateProjectVersion(newVersion);
        await this.prependReleaseNotesToChangelog(releaseNotes);
        await this.waitForEditsAndCreateReleaseCommit(newVersion);
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(pullRequestTargetBranch, `release-stage-${newVersion}`, `Bump version to "v${newVersion}" with changelog.`);
        (0, console_1.info)((0, console_1.green)('  ✓   Release staging pull request has been created.'));
        (0, console_1.info)((0, console_1.yellow)(`      Please ask team members to review: ${pullRequest.url}.`));
        return { releaseNotes, pullRequest };
    }
    /**
     * Checks out the specified target branch, verifies its CI status and stages
     * the specified new version in order to create a pull request.
     *
     * @param newVersion New version to be staged.
     * @param compareVersionForReleaseNotes Version used for comparing with `HEAD` of
     *   the staging branch in order build the release notes.
     * @param stagingBranch Branch within the new version should be staged.
     * @returns an object describing the created pull request.
     */
    async checkoutBranchAndStageVersion(newVersion, compareVersionForReleaseNotes, stagingBranch) {
        await this.verifyPassingGithubStatus(stagingBranch);
        await this.checkoutUpstreamBranch(stagingBranch);
        return await this.stageVersionForBranchAndCreatePullRequest(newVersion, compareVersionForReleaseNotes, stagingBranch);
    }
    /**
     * Cherry-picks the release notes of a version that have been pushed to a given branch
     * into the `next` primary development branch. A pull request is created for this.
     * @returns a boolean indicating successful creation of the cherry-pick pull request.
     */
    async cherryPickChangelogIntoNextBranch(releaseNotes, stagingBranch) {
        const nextBranch = this.active.next.branchName;
        const commitMessage = (0, commit_message_1.getReleaseNoteCherryPickCommitMessage)(releaseNotes.version);
        // Checkout the next branch.
        await this.checkoutUpstreamBranch(nextBranch);
        await this.prependReleaseNotesToChangelog(releaseNotes);
        // Create a changelog cherry-pick commit.
        await this.createCommit(commitMessage, [release_notes_1.changelogPath]);
        (0, console_1.info)((0, console_1.green)(`  ✓   Created changelog cherry-pick commit for: "${releaseNotes.version}".`));
        // Create a cherry-pick pull request that should be merged by the caretaker.
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(nextBranch, `changelog-cherry-pick-${releaseNotes.version}`, commitMessage, `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
            `branch (${nextBranch}).`);
        (0, console_1.info)((0, console_1.green)(`  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
            'has been created.'));
        (0, console_1.info)((0, console_1.yellow)(`      Please ask team members to review: ${pullRequest.url}.`));
        // Wait for the Pull Request to be merged.
        await this.waitForPullRequestToBeMerged(pullRequest);
        return true;
    }
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
    async _createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, isPrerelease) {
        const tagName = (0, version_tags_1.getReleaseTagForVersion)(releaseNotes.version);
        await this.git.github.git.createRef({
            ...this.git.remoteParams,
            ref: `refs/tags/${tagName}`,
            sha: versionBumpCommitSha,
        });
        (0, console_1.info)((0, console_1.green)(`  ✓   Tagged v${releaseNotes.version} release upstream.`));
        let releaseBody = await releaseNotes.getGithubReleaseEntry();
        // If the release body exceeds the Github body limit, we just provide
        // a link to the changelog entry in the Github release entry.
        if (releaseBody.length > constants_1.githubReleaseBodyLimit) {
            const releaseNotesUrl = await this._getGithubChangelogUrlForRef(releaseNotes, tagName);
            releaseBody =
                `Release notes are too large to be captured here. ` +
                    `[View all changes here](${releaseNotesUrl}).`;
        }
        await this.git.github.repos.createRelease({
            ...this.git.remoteParams,
            name: `v${releaseNotes.version}`,
            tag_name: tagName,
            prerelease: isPrerelease,
            body: releaseBody,
        });
        (0, console_1.info)((0, console_1.green)(`  ✓   Created v${releaseNotes.version} release in Github.`));
    }
    /** Gets a Github URL that resolves to the release notes in the given ref. */
    async _getGithubChangelogUrlForRef(releaseNotes, ref) {
        const baseUrl = (0, github_urls_1.getFileContentsUrl)(this.git, ref, release_notes_1.changelogPath);
        const urlFragment = await releaseNotes.getUrlFragmentForRelease();
        return `${baseUrl}#${urlFragment}`;
    }
    /**
     * Builds and publishes the given version in the specified branch.
     * @param releaseNotes The release notes for the version being published.
     * @param publishBranch Name of the branch that contains the new version.
     * @param npmDistTag NPM dist tag where the version should be published to.
     */
    async buildAndPublish(releaseNotes, publishBranch, npmDistTag) {
        const versionBumpCommitSha = await this._getCommitOfBranch(publishBranch);
        if (!(await this._isCommitForVersionStaging(releaseNotes.version, versionBumpCommitSha))) {
            (0, console_1.error)((0, console_1.red)(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`));
            (0, console_1.error)((0, console_1.red)('      Please make sure the staging pull request has been merged.'));
            throw new actions_error_1.FatalReleaseActionError();
        }
        // Checkout the publish branch and build the release packages.
        await this.checkoutUpstreamBranch(publishBranch);
        // Install the project dependencies for the publish branch, and then build the release
        // packages. Note that we do not directly call the build packages function from the release
        // config. We only want to build and publish packages that have been configured in the given
        // publish branch. e.g. consider we publish patch version and a new package has been
        // created in the `next` branch. The new package would not be part of the patch branch,
        // so we cannot build and publish it.
        await (0, external_commands_1.invokeYarnInstallCommand)(this.projectDir);
        const builtPackages = await (0, external_commands_1.invokeReleaseBuildCommand)();
        // Verify the packages built are the correct version.
        await this._verifyPackageVersions(releaseNotes.version, builtPackages);
        // Create a Github release for the new version.
        await this._createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, npmDistTag === 'next');
        // Walk through all built packages and publish them to NPM.
        for (const builtPackage of builtPackages) {
            await this._publishBuiltPackageToNpm(builtPackage, npmDistTag);
        }
        (0, console_1.info)((0, console_1.green)('  ✓   Published all packages successfully'));
    }
    /** Publishes the given built package to NPM with the specified NPM dist tag. */
    async _publishBuiltPackageToNpm(pkg, npmDistTag) {
        (0, console_1.debug)(`Starting publish of "${pkg.name}".`);
        const spinner = new spinner_1.Spinner(`Publishing "${pkg.name}"`);
        try {
            await (0, npm_publish_1.runNpmPublish)(pkg.outputPath, npmDistTag, this.config.publishRegistry);
            spinner.complete();
            (0, console_1.info)((0, console_1.green)(`  ✓   Successfully published "${pkg.name}.`));
        }
        catch (e) {
            spinner.complete();
            (0, console_1.error)(e);
            (0, console_1.error)((0, console_1.red)(`  ✘   An error occurred while publishing "${pkg.name}".`));
            throw new actions_error_1.FatalReleaseActionError();
        }
    }
    /** Checks whether the given commit represents a staging commit for the specified version. */
    async _isCommitForVersionStaging(version, commitSha) {
        const { data } = await this.git.github.repos.getCommit({
            ...this.git.remoteParams,
            ref: commitSha,
        });
        return data.commit.message.startsWith((0, commit_message_1.getCommitMessageForRelease)(version));
    }
    /** Verify the version of each generated package exact matches the specified version. */
    async _verifyPackageVersions(version, packages) {
        /** Experimental equivalent version for packages created with the provided version. */
        const experimentalVersion = (0, semver_1.createExperimentalSemver)(version);
        for (const pkg of packages) {
            const { version: packageJsonVersion } = JSON.parse(await fs_1.promises.readFile((0, path_1.join)(pkg.outputPath, 'package.json'), 'utf8'));
            const mismatchesVersion = version.compare(packageJsonVersion) !== 0;
            const mismatchesExperimental = experimentalVersion.compare(packageJsonVersion) !== 0;
            if (mismatchesExperimental && mismatchesVersion) {
                (0, console_1.error)((0, console_1.red)('The built package version does not match the version being released.'));
                (0, console_1.error)(`  Release Version:   ${version.version} (${experimentalVersion.version})`);
                (0, console_1.error)(`  Generated Version: ${packageJsonVersion}`);
                throw new actions_error_1.FatalReleaseActionError();
            }
        }
    }
}
exports.ReleaseAction = ReleaseAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBa0M7QUFDbEMsK0JBQTBCO0FBQzFCLGlDQUFpQztBQUVqQyxpREFBZ0c7QUFDaEcsaURBQTRDO0FBRTVDLDZEQUlxQztBQUNyQywrQ0FBNEQ7QUFFNUQsMERBQW1FO0FBR25FLDJEQUF3RDtBQUV4RCxtREFBdUY7QUFDdkYscURBQW1HO0FBQ25HLDJDQUFnRztBQUNoRywyREFBd0Y7QUFDeEYsdURBQTREO0FBQzVELDZEQUF5RDtBQUN6RCw2REFBbUU7QUFDbkUsbURBQTZEO0FBNEI3RDs7OztHQUlHO0FBQ0gsTUFBc0IsYUFBYTtJQWtCakMsWUFDWSxNQUEyQixFQUMzQixHQUEyQixFQUMzQixNQUFxQixFQUNyQixVQUFrQjtRQUhsQixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUMzQixRQUFHLEdBQUgsR0FBRyxDQUF3QjtRQUMzQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFQOUIsbURBQW1EO1FBQzNDLG9CQUFlLEdBQXNCLElBQUksQ0FBQztJQU8vQyxDQUFDO0lBdEJKLHNEQUFzRDtJQUN0RCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQTRCLEVBQUUsT0FBc0I7UUFDbEUsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBcUJELDBFQUEwRTtJQUNsRSxLQUFLLENBQUMsaUJBQWlCO1FBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsMkJBQWUsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdB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SUFFRCx3RkFBd0Y7SUFDaEYsS0FBSyxDQUFDLHNCQUFzQixDQUFDLE9BQXNCLEVBQUUsUUFBd0I7UUFDbkYsc0ZBQXNGO1FBQ3RGLE1BQU0sbUJBQW1CLEdBQUcsSUFBQSxpQ0FBd0IsRUFBQyxPQUFPLENBQUMsQ0FBQztRQUU5RCxLQUFLLE1BQU0sR0FBRyxJQUFJLFFBQVEsRUFBRTtZQUMxQixNQUFNLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDOUMsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLElBQUEsV0FBSSxFQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQ3ZCLENBQUM7WUFFM0MsTUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BFLE1BQU0sc0JBQXNCLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXJGLElBQUksc0JBQXNCLElBQUksaUJBQWlCLEVBQUU7Z0JBQy9DLElBQUEsZUFBSyxFQUFDLElBQUEsYUFBRyxFQUFDLHNFQUFzRSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsSUFBQSxlQUFLLEVBQUMsd0JBQXdCLE9BQU8sQ0FBQyxPQUFPLEtBQUssbUJBQW1CLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztnQkFDbEYsSUFBQSxlQUFLLEVBQUMsd0JBQXdCLGtCQUFrQixFQUFFLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7YUFDckM7U0FDRjtJQUNILENBQUM7Q0FDRjtBQTNrQkQsc0NBMmtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGZzfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtTcGlubmVyfSBmcm9tICcuLi8uLi91dGlscy9zcGlubmVyJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1xuICBnZXRGaWxlQ29udGVudHNVcmwsXG4gIGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwsXG4gIGdldFJlcG9zaXRvcnlHaXRVcmwsXG59IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRoLCBSZWxlYXNlTm90ZXN9IGZyb20gJy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Z2l0aHViUmVsZWFzZUJvZHlMaW1pdCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuaW1wb3J0IHtmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5fSBmcm9tICcuL2dyYXBocWwtcXVlcmllcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcbmltcG9ydCB7Z2V0UmVsZWFzZVRhZ0ZvclZlcnNpb259IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi10YWdzJztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICBvd25lcjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIHB1bGwgcmVxdWVzdCAoaS5lLiB0aGUgUFIgbnVtYmVyKS4gKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIEZvcmsgY29udGFpbmluZyB0aGUgaGVhZCBicmFuY2ggb2YgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcms6IEdpdGh1YlJlcG87XG4gIC8qKiBCcmFuY2ggbmFtZSBpbiB0aGUgZm9yayB0aGF0IGRlZmluZXMgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcmtCcmFuY2g6IHN0cmluZztcbn1cblxuLyoqIENvbnN0cnVjdG9yIHR5cGUgZm9yIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIC8qKiBDb25zdHJ1Y3RzIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIG5ldyAoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIFJlbGVhc2VDb25maWcsIHN0cmluZ10pOiBUO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGEgcmVsZWFzZSBhY3Rpb24uIEEgcmVsZWFzZSBhY3Rpb24gaXMgc2VsZWN0YWJsZSBieSB0aGUgY2FyZXRha2VyXG4gKiBpZiBhY3RpdmUsIGFuZCBjYW4gcGVyZm9ybSBjaGFuZ2VzIGZvciByZWxlYXNpbmcsIHN1Y2ggYXMgc3RhZ2luZyBhIHJlbGVhc2UsIGJ1bXBpbmcgdGhlXG4gKiB2ZXJzaW9uLCBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLCBicmFuY2hpbmcgb2ZmIGZyb20gdGhlIG1haW4gYnJhbmNoLiBldGMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIHN0YXRpYyBpc0FjdGl2ZShfdHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiBmb3IgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgYWJzdHJhY3QgZ2V0RGVzY3JpcHRpb24oKTogUHJvbWlzZTxzdHJpbmc+O1xuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGdpdmVuIHJlbGVhc2UgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgdXNlciBtYW51YWxseSBhYm9ydGVkIHRoZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gYSBmYXRhbCBlcnJvci5cbiAgICovXG4gIGFic3RyYWN0IHBlcmZvcm0oKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogQ2FjaGVkIGZvdW5kIGZvcmsgb2YgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkRm9ya1JlcG86IEdpdGh1YlJlcG8gfCBudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcm90ZWN0ZWQgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLFxuICAgIHByb3RlY3RlZCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gICAgcHJvdGVjdGVkIGNvbmZpZzogUmVsZWFzZUNvbmZpZyxcbiAgICBwcm90ZWN0ZWQgcHJvamVjdERpcjogc3RyaW5nLFxuICApIHt9XG5cbiAgLyoqIFJldHJpZXZlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZXRQcm9qZWN0VmVyc2lvbigpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPSBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7XG4gICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IHNlbXZlci5TZW1WZXIocGtnSnNvbi52ZXJzaW9uKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9IEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHtcbiAgICAgIHZlcnNpb246IHN0cmluZztcbiAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcbiAgICB9O1xuICAgIHBrZ0pzb24udmVyc2lvbiA9IG5ld1ZlcnNpb24uZm9ybWF0KCk7XG4gICAgLy8gV3JpdGUgdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuIE5vdGUgdGhhdCB3ZSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZVxuICAgIC8vIHRvIGF2b2lkIHVubmVjZXNzYXJ5IGRpZmYuIElERXMgdXN1YWxseSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZS5cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGtnSnNvblBhdGgsIGAke0pTT04uc3RyaW5naWZ5KHBrZ0pzb24sIG51bGwsIDIpfVxcbmApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCBwcm9qZWN0IHZlcnNpb24gdG8gJHtwa2dKc29uLnZlcnNpb259YCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBvZiBhIHNwZWNpZmllZCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge1xuICAgICAgZGF0YToge2NvbW1pdH0sXG4gICAgfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBicmFuY2hOYW1lfSk7XG4gICAgcmV0dXJuIGNvbW1pdC5zaGE7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCB0aGUgbGF0ZXN0IGNvbW1pdCBmb3IgdGhlIGdpdmVuIGJyYW5jaCBpcyBwYXNzaW5nIGFsbCBzdGF0dXNlcy4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZSk7XG4gICAgY29uc3Qge1xuICAgICAgZGF0YToge3N0YXRlfSxcbiAgICB9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogY29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGNvbnN0IGJyYW5jaENvbW1pdHNVcmwgPSBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHRoaXMuZ2l0LCBicmFuY2hOYW1lKTtcblxuICAgIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgcmVkKFxuICAgICAgICAgIGAgIOKcmCAgIENhbm5vdCBzdGFnZSByZWxlYXNlLiBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBkb2VzIG5vdCBwYXNzIGFsbCBnaXRodWIgYCArXG4gICAgICAgICAgICAnc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy4nLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGVycm9yKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKTtcblxuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKFxuICAgICAgICAgIHllbGxvdyhcbiAgICAgICAgICAgICcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBmYWlsaW5nIENJIGNoZWNrcywgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgcmVkKFxuICAgICAgICAgIGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgJ25lZWQgdG8gc3VjY2VlZCBiZWZvcmUgc3RhZ2luZyBhIHJlbGVhc2UuJyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIHBlbmRpbmcgQ0ksIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgVXBzdHJlYW0gY29tbWl0IGlzIHBhc3NpbmcgYWxsIGdpdGh1YiBzdGF0dXMgY2hlY2tzLicpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBwb3RlbnRpYWwgcmVsZWFzZSBub3RlcyBlZGl0cyB0aGF0IG5lZWQgdG8gYmUgbWFkZS4gT25jZVxuICAgKiBjb25maXJtZWQsIGEgbmV3IGNvbW1pdCBmb3IgdGhlIHJlbGVhc2UgcG9pbnQgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBpbmZvKFxuICAgICAgeWVsbG93KFxuICAgICAgICAnICDimqAgICBQbGVhc2UgcmV2aWV3IHRoZSBjaGFuZ2Vsb2cgYW5kIGVuc3VyZSB0aGF0IHRoZSBsb2cgY29udGFpbnMgb25seSBjaGFuZ2VzICcgK1xuICAgICAgICAgICd0aGF0IGFwcGx5IHRvIHRoZSBwdWJsaWMgQVBJIHN1cmZhY2UuIE1hbnVhbCBjaGFuZ2VzIGNhbiBiZSBtYWRlLiBXaGVuIGRvbmUsIHBsZWFzZSAnICtcbiAgICAgICAgICAncHJvY2VlZCB3aXRoIHRoZSBwcm9tcHQgYmVsb3cuJyxcbiAgICAgICksXG4gICAgKTtcblxuICAgIGlmICghKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHByb2NlZWQgYW5kIGNvbW1pdCB0aGUgY2hhbmdlcz8nKSkpIHtcbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENvbW1pdCBtZXNzYWdlIGZvciB0aGUgcmVsZWFzZSBwb2ludC5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UobmV3VmVyc2lvbik7XG4gICAgLy8gQ3JlYXRlIGEgcmVsZWFzZSBzdGFnaW5nIGNvbW1pdCBpbmNsdWRpbmcgY2hhbmdlbG9nIGFuZCB2ZXJzaW9uIGJ1bXAuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aCwgY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHJlbGVhc2UgY29tbWl0IGZvcjogXCIke25ld1ZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb3duZWQgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCBvZiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBBYm9ydHMgdGhlXG4gICAqIHByb2Nlc3Mgd2l0aCBhbiBlcnJvciBpZiBubyBmb3JrIGNvdWxkIGJlIGZvdW5kLiBBbHNvIGNhY2hlcyB0aGUgZGV0ZXJtaW5lZCBmb3JrXG4gICAqIHJlcG9zaXRvcnkgYXMgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlciBjYW5ub3QgY2hhbmdlIGR1cmluZyBhY3Rpb24gZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTogUHJvbWlzZTxHaXRodWJSZXBvPiB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZEZvcmtSZXBvICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG87XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ3JhcGhxbChmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5LCB7b3duZXIsIG5hbWV9KTtcbiAgICBjb25zdCBmb3JrcyA9IHJlc3VsdC5yZXBvc2l0b3J5LmZvcmtzLm5vZGVzO1xuXG4gICAgaWYgKGZvcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFVuYWJsZSB0byBmaW5kIGZvcmsgZm9yIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgZW5zdXJlIHlvdSBjcmVhdGVkIGEgZm9yayBvZjogJHtvd25lcn0vJHtuYW1lfS5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3JrID0gZm9ya3NbMF07XG4gICAgcmV0dXJuICh0aGlzLl9jYWNoZWRGb3JrUmVwbyA9IHtvd25lcjogZm9yay5vd25lci5sb2dpbiwgbmFtZTogZm9yay5uYW1lfSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBicmFuY2ggbmFtZSBpcyByZXNlcnZlZCBpbiB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG86IEdpdGh1YlJlcG8sIG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBicmFuY2g6IG5hbWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElmIHRoZSBlcnJvciBoYXMgYSBgc3RhdHVzYCBwcm9wZXJ0eSBzZXQgdG8gYDQwNGAsIHRoZW4gd2Uga25vdyB0aGF0IHRoZSBicmFuY2hcbiAgICAgIC8vIGRvZXMgbm90IGV4aXN0LiBPdGhlcndpc2UsIGl0IG1pZ2h0IGJlIGFuIEFQSSBlcnJvciB0aGF0IHdlIHdhbnQgdG8gcmVwb3J0L3JlLXRocm93LlxuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBHaXRodWJBcGlSZXF1ZXN0RXJyb3IgJiYgZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGaW5kcyBhIG5vbi1yZXNlcnZlZCBicmFuY2ggbmFtZSBpbiB0aGUgcmVwb3NpdG9yeSB3aXRoIHJlc3BlY3QgdG8gYSBiYXNlIG5hbWUuICovXG4gIHByaXZhdGUgYXN5bmMgX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKHJlcG86IEdpdGh1YlJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBjdXJyZW50TmFtZSA9IGJhc2VOYW1lO1xuICAgIGxldCBzdWZmaXhOdW0gPSAwO1xuICAgIHdoaWxlIChhd2FpdCB0aGlzLl9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvLCBjdXJyZW50TmFtZSkpIHtcbiAgICAgIHN1ZmZpeE51bSsrO1xuICAgICAgY3VycmVudE5hbWUgPSBgJHtiYXNlTmFtZX1fJHtzdWZmaXhOdW19YDtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnROYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBsb2NhbCBicmFuY2ggZnJvbSB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBXaWxsIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIGJyYW5jaGVzIGluIGNhc2Ugb2YgYSBjb2xsaXNpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctcScsICctQicsIGJyYW5jaE5hbWVdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byB0aGUgZ2l2ZW4gcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaEhlYWRUb1JlbW90ZUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgJy1xJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gXSk7XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnlcbiAgICogdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gSWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBleGlzdHMgaW4gdGhlIGZvcmsgYWxyZWFkeSwgYVxuICAgKiB1bmlxdWUgb25lIHdpbGwgYmUgZ2VuZXJhdGVkIGJhc2VkIG9uIHRoZSBwcm9wb3NlZCBuYW1lIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSBwcm9wb3NlZEJyYW5jaE5hbWUgUHJvcG9zZWQgYnJhbmNoIG5hbWUgZm9yIHRoZSBmb3JrLlxuICAgKiBAcGFyYW0gdHJhY2tMb2NhbEJyYW5jaCBXaGV0aGVyIHRoZSBmb3JrIGJyYW5jaCBzaG91bGQgYmUgdHJhY2tlZCBsb2NhbGx5LiBpLmUuIHdoZXRoZXJcbiAgICogICBhIGxvY2FsIGJyYW5jaCB3aXRoIHJlbW90ZSB0cmFja2luZyBzaG91bGQgYmUgc2V0IHVwLlxuICAgKiBAcmV0dXJucyBUaGUgZm9yayBhbmQgYnJhbmNoIG5hbWUgY29udGFpbmluZyB0aGUgcHVzaGVkIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wdXNoSGVhZFRvRm9yayhcbiAgICBwcm9wb3NlZEJyYW5jaE5hbWU6IHN0cmluZyxcbiAgICB0cmFja0xvY2FsQnJhbmNoOiBib29sZWFuLFxuICApOiBQcm9taXNlPHtmb3JrOiBHaXRodWJSZXBvOyBicmFuY2hOYW1lOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgZm9yayA9IGF3YWl0IHRoaXMuX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk7XG4gICAgLy8gQ29tcHV0ZSBhIHJlcG9zaXRvcnkgVVJMIGZvciBwdXNoaW5nIHRvIHRoZSBmb3JrLiBOb3RlIHRoYXQgd2Ugd2FudCB0byByZXNwZWN0XG4gICAgLy8gdGhlIFNTSCBvcHRpb24gZnJvbSB0aGUgZGV2LWluZnJhIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICAgIGNvbnN0IHJlcG9HaXRVcmwgPSBnZXRSZXBvc2l0b3J5R2l0VXJsKFxuICAgICAgey4uLmZvcmssIHVzZVNzaDogdGhpcy5naXQucmVtb3RlQ29uZmlnLnVzZVNzaH0sXG4gICAgICB0aGlzLmdpdC5naXRodWJUb2tlbixcbiAgICApO1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCB0aGlzLl9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShmb3JrLCBwcm9wb3NlZEJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHB1c2hBcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIElmIGEgbG9jYWwgYnJhbmNoIHNob3VsZCB0cmFjayB0aGUgcmVtb3RlIGZvcmsgYnJhbmNoLCBjcmVhdGUgYSBicmFuY2ggbWF0Y2hpbmdcbiAgICAvLyB0aGUgcmVtb3RlIGJyYW5jaC4gTGF0ZXIgd2l0aCB0aGUgYGdpdCBwdXNoYCwgdGhlIHJlbW90ZSBpcyBzZXQgZm9yIHRoZSBicmFuY2guXG4gICAgaWYgKHRyYWNrTG9jYWxCcmFuY2gpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lKTtcbiAgICAgIHB1c2hBcmdzLnB1c2goJy0tc2V0LXVwc3RyZWFtJyk7XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgZm9yay5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgJy1xJywgcmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YCwgLi4ucHVzaEFyZ3NdKTtcbiAgICByZXR1cm4ge2ZvcmssIGJyYW5jaE5hbWV9O1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBjaGFuZ2VzIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5IHRoZSBjdXJyZW50bHlcbiAgICogYXV0aGVudGljYXRlZCB1c2VyLiBBIHB1bGwgcmVxdWVzdCBpcyB0aGVuIGNyZWF0ZWQgZm9yIHRoZSBwdXNoZWQgY2hhbmdlcyBvbiB0aGVcbiAgICogY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2guXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgIHRhcmdldEJyYW5jaDogc3RyaW5nLFxuICAgIHByb3Bvc2VkRm9ya0JyYW5jaE5hbWU6IHN0cmluZyxcbiAgICB0aXRsZTogc3RyaW5nLFxuICAgIGJvZHk/OiBzdHJpbmcsXG4gICk6IFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBjb25zdCByZXBvU2x1ZyA9IGAke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5vd25lcn0vJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMucmVwb31gO1xuICAgIGNvbnN0IHtmb3JrLCBicmFuY2hOYW1lfSA9IGF3YWl0IHRoaXMuX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkRm9ya0JyYW5jaE5hbWUsIHRydWUpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgaGVhZDogYCR7Zm9yay5vd25lcn06JHticmFuY2hOYW1lfWAsXG4gICAgICBiYXNlOiB0YXJnZXRCcmFuY2gsXG4gICAgICBib2R5LFxuICAgICAgdGl0bGUsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbGFiZWxzIHRvIHRoZSBuZXdseSBjcmVhdGVkIFBSIGlmIHByb3ZpZGVkIGluIHRoZSBjb25maWd1cmF0aW9uLlxuICAgIGlmICh0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5hZGRMYWJlbHMoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogZGF0YS5udW1iZXIsXG4gICAgICAgIGxhYmVsczogdGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHB1bGwgcmVxdWVzdCAjJHtkYXRhLm51bWJlcn0gaW4gJHtyZXBvU2x1Z30uYCkpO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogZGF0YS5udW1iZXIsXG4gICAgICB1cmw6IGRhdGEuaHRtbF91cmwsXG4gICAgICBmb3JrLFxuICAgICAgZm9ya0JyYW5jaDogYnJhbmNoTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IHRvIGJlIG1lcmdlZC4gRGVmYXVsdCBpbnRlcnZhbCBmb3IgY2hlY2tpbmcgdGhlIEdpdGh1YlxuICAgKiBBUEkgaXMgMTAgc2Vjb25kcyAodG8gbm90IGV4Y2VlZCBhbnkgcmF0ZSBsaW1pdHMpLiBJZiB0aGUgcHVsbCByZXF1ZXN0IGlzIGNsb3NlZCB3aXRob3V0XG4gICAqIG1lcmdlLCB0aGUgc2NyaXB0IHdpbGwgYWJvcnQgZ3JhY2VmdWxseSAoY29uc2lkZXJpbmcgYSBtYW51YWwgdXNlciBhYm9ydCkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChcbiAgICB7aWR9OiBQdWxsUmVxdWVzdCxcbiAgICBpbnRlcnZhbCA9IHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsLFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuICAgICAgY29uc3QgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJTdGF0ZSA9IGF3YWl0IGdldFB1bGxSZXF1ZXN0U3RhdGUodGhpcy5naXQsIGlkKTtcbiAgICAgICAgaWYgKHByU3RhdGUgPT09ICdtZXJnZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgICAgICAgIHdhcm4oeWVsbG93KGAgIOKcmCAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gY2xvc2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlamVjdChuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIHJlbGVhc2VzIG5vdGVzIGZvciBhIHZlcnNpb24gcHVibGlzaGVkIGluIGEgZ2l2ZW4gYnJhbmNoIHRvIHRoZSBjaGFuZ2Vsb2cgaW5cbiAgICogdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cuXG4gICAqIEByZXR1cm5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHJlbGVhc2Ugbm90ZXMgaGF2ZSBiZWVuIHByZXBlbmRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCByZWxlYXNlTm90ZXMucHJlcGVuZEVudHJ5VG9DaGFuZ2Vsb2dGaWxlKCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdHRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICAvLyBOb3RlOiBgZ2l0IGFkZGAgd291bGQgbm90IGJlIG5lZWRlZCBpZiB0aGUgZmlsZXMgYXJlIGFscmVhZHkga25vd24gdG9cbiAgICAvLyBHaXQsIGJ1dCB0aGUgc3BlY2lmaWVkIGZpbGVzIGNvdWxkIGFsc28gYmUgbmV3bHkgY3JlYXRlZCwgYW5kIHVua25vd24uXG4gICAgdGhpcy5naXQucnVuKFsnYWRkJywgLi4uZmlsZXNdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLXEnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YWdlcyB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCBicmFuY2ggYW5kIGNyZWF0ZXMgYSBwdWxsIHJlcXVlc3RcbiAgICogdGhhdCB0YXJnZXRzIHRoZSBnaXZlbiBiYXNlIGJyYW5jaC4gQXNzdW1lcyB0aGUgc3RhZ2luZyBicmFuY2ggaXMgYWxyZWFkeSBjaGVja2VkLW91dC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgIGBIRUFEYCBpbiBvcmRlciBidWlsZCB0aGUgcmVsZWFzZSBub3Rlcy5cbiAgICogQHBhcmFtIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoIEJyYW5jaCB0aGUgcHVsbCByZXF1ZXN0IHNob3VsZCB0YXJnZXQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzOyBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzQ29tcGFyZVRhZyA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzKTtcblxuICAgIC8vIEZldGNoIHRoZSBjb21wYXJlIHRhZyBzbyB0aGF0IGNvbW1pdHMgZm9yIHRoZSByZWxlYXNlIG5vdGVzIGNhbiBiZSBkZXRlcm1pbmVkLlxuICAgIC8vIFdlIGZvcmNpYmx5IG92ZXJyaWRlIGV4aXN0aW5nIGxvY2FsIHRhZ3MgdGhhdCBhcmUgbmFtZWQgc2ltaWxhciBhcyB3ZSB3aWxsIGZldGNoXG4gICAgLy8gdGhlIGNvcnJlY3QgdGFnIGZvciByZWxlYXNlIG5vdGVzIGNvbXBhcmlzb24gZnJvbSB0aGUgdXBzdHJlYW0gcmVtb3RlLlxuICAgIHRoaXMuZ2l0LnJ1bihbXG4gICAgICAnZmV0Y2gnLFxuICAgICAgJy0tZm9yY2UnLFxuICAgICAgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLFxuICAgICAgYHJlZnMvdGFncy8ke3JlbGVhc2VOb3Rlc0NvbXBhcmVUYWd9OnJlZnMvdGFncy8ke3JlbGVhc2VOb3Rlc0NvbXBhcmVUYWd9YCxcbiAgICBdKTtcblxuICAgIC8vIEJ1aWxkIHJlbGVhc2Ugbm90ZXMgZm9yIGNvbW1pdHMgZnJvbSBgPHJlbGVhc2VOb3Rlc0NvbXBhcmVUYWc+Li5IRUFEYC5cbiAgICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZm9yUmFuZ2UobmV3VmVyc2lvbiwgcmVsZWFzZU5vdGVzQ29tcGFyZVRhZywgJ0hFQUQnKTtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoLFxuICAgICAgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gLFxuICAgICk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiB7cmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCBgSEVBRGAgb2ZcbiAgICogICB0aGUgc3RhZ2luZyBicmFuY2ggaW4gb3JkZXIgYnVpbGQgdGhlIHJlbGVhc2Ugbm90ZXMuXG4gICAqIEBwYXJhbSBzdGFnaW5nQnJhbmNoIEJyYW5jaCB3aXRoaW4gdGhlIG5ldyB2ZXJzaW9uIHNob3VsZCBiZSBzdGFnZWQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHN0YWdpbmdCcmFuY2g6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXM7IHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzLFxuICAgICAgc3RhZ2luZ0JyYW5jaCxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBzdGFnaW5nQnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQgZm9yOiBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZCBieSB0aGUgY2FyZXRha2VyLlxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV4dEJyYW5jaCxcbiAgICAgIGBjaGFuZ2Vsb2ctY2hlcnJ5LXBpY2stJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLFxuICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgIGBDaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmcm9tIHRoZSBcIiR7c3RhZ2luZ0JyYW5jaH1cIiBicmFuY2ggdG8gdGhlIG5leHQgYCArXG4gICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmAsXG4gICAgKTtcblxuICAgIGluZm8oXG4gICAgICBncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICAgJ2hhcyBiZWVuIGNyZWF0ZWQuJyxcbiAgICAgICksXG4gICAgKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkXG4gICAqIGJ5IHRhZ2dpbmcgdGhlIHZlcnNpb24gYnVtcCBjb21taXQsIGFuZCBieSBjcmVhdGluZyB0aGUgcmVsZWFzZSBlbnRyeS5cbiAgICpcbiAgICogRXhwZWN0cyB0aGUgdmVyc2lvbiBidW1wIGNvbW1pdCBhbmQgY2hhbmdlbG9nIHRvIGJlIGF2YWlsYWJsZSBpbiB0aGVcbiAgICogdXBzdHJlYW0gcmVtb3RlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVsZWFzZU5vdGVzIFRoZSByZWxlYXNlIG5vdGVzIGZvciB0aGUgdmVyc2lvbiBiZWluZyBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSB2ZXJzaW9uQnVtcENvbW1pdFNoYSBDb21taXQgdGhhdCBidW1wZWQgdGhlIHZlcnNpb24uIFRoZSByZWxlYXNlIHRhZ1xuICAgKiAgIHdpbGwgcG9pbnQgdG8gdGhpcyBjb21taXQuXG4gICAqIEBwYXJhbSBpc1ByZXJlbGVhc2UgV2hldGhlciB0aGUgbmV3IHZlcnNpb24gaXMgcHVibGlzaGVkIGFzIGEgcHJlLXJlbGVhc2UuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nLFxuICAgIGlzUHJlcmVsZWFzZTogYm9vbGVhbixcbiAgKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIHVwc3RyZWFtLmApKTtcblxuICAgIGxldCByZWxlYXNlQm9keSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKTtcblxuICAgIC8vIElmIHRoZSByZWxlYXNlIGJvZHkgZXhjZWVkcyB0aGUgR2l0aHViIGJvZHkgbGltaXQsIHdlIGp1c3QgcHJvdmlkZVxuICAgIC8vIGEgbGluayB0byB0aGUgY2hhbmdlbG9nIGVudHJ5IGluIHRoZSBHaXRodWIgcmVsZWFzZSBlbnRyeS5cbiAgICBpZiAocmVsZWFzZUJvZHkubGVuZ3RoID4gZ2l0aHViUmVsZWFzZUJvZHlMaW1pdCkge1xuICAgICAgY29uc3QgcmVsZWFzZU5vdGVzVXJsID0gYXdhaXQgdGhpcy5fZ2V0R2l0aHViQ2hhbmdlbG9nVXJsRm9yUmVmKHJlbGVhc2VOb3RlcywgdGFnTmFtZSk7XG4gICAgICByZWxlYXNlQm9keSA9XG4gICAgICAgIGBSZWxlYXNlIG5vdGVzIGFyZSB0b28gbGFyZ2UgdG8gYmUgY2FwdHVyZWQgaGVyZS4gYCArXG4gICAgICAgIGBbVmlldyBhbGwgY2hhbmdlcyBoZXJlXSgke3JlbGVhc2VOb3Rlc1VybH0pLmA7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICAgIHByZXJlbGVhc2U6IGlzUHJlcmVsZWFzZSxcbiAgICAgIGJvZHk6IHJlbGVhc2VCb2R5LFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSBpbiBHaXRodWIuYCkpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBHaXRodWIgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlbGVhc2Ugbm90ZXMgaW4gdGhlIGdpdmVuIHJlZi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0R2l0aHViQ2hhbmdlbG9nVXJsRm9yUmVmKHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCByZWY6IHN0cmluZykge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRGaWxlQ29udGVudHNVcmwodGhpcy5naXQsIHJlZiwgY2hhbmdlbG9nUGF0aCk7XG4gICAgY29uc3QgdXJsRnJhZ21lbnQgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0VXJsRnJhZ21lbnRGb3JSZWxlYXNlKCk7XG4gICAgcmV0dXJuIGAke2Jhc2VVcmx9IyR7dXJsRnJhZ21lbnR9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHB1Ymxpc2hlcyB0aGUgZ2l2ZW4gdmVyc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJyYW5jaC5cbiAgICogQHBhcmFtIHJlbGVhc2VOb3RlcyBUaGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIHZlcnNpb24gYmVpbmcgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gcHVibGlzaEJyYW5jaCBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgbmV3IHZlcnNpb24uXG4gICAqIEBwYXJhbSBucG1EaXN0VGFnIE5QTSBkaXN0IHRhZyB3aGVyZSB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcHVibGlzaGVkIHRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkQW5kUHVibGlzaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBwdWJsaXNoQnJhbmNoOiBzdHJpbmcsXG4gICAgbnBtRGlzdFRhZzogTnBtRGlzdFRhZyxcbiAgKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghKGF3YWl0IHRoaXMuX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcocmVsZWFzZU5vdGVzLnZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgcmVsZWFzZU5vdGVzLFxuICAgICAgdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgICBucG1EaXN0VGFnID09PSAnbmV4dCcsXG4gICAgKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGRlYnVnKGBTdGFydGluZyBwdWJsaXNoIG9mIFwiJHtwa2cubmFtZX1cIi5gKTtcbiAgICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBwdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cIi5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGNvbW1pdCByZXByZXNlbnRzIGEgc3RhZ2luZyBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb21taXRTaGE6IHN0cmluZykge1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBjb21taXRTaGEsXG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICAvKiogRXhwZXJpbWVudGFsIGVxdWl2YWxlbnQgdmVyc2lvbiBmb3IgcGFja2FnZXMgY3JlYXRlZCB3aXRoIHRoZSBwcm92aWRlZCB2ZXJzaW9uLiAqL1xuICAgIGNvbnN0IGV4cGVyaW1lbnRhbFZlcnNpb24gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG5cbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPSBKU09OLnBhcnNlKFxuICAgICAgICBhd2FpdCBmcy5yZWFkRmlsZShqb2luKHBrZy5vdXRwdXRQYXRoLCAncGFja2FnZS5qc29uJyksICd1dGY4JyksXG4gICAgICApIGFzIHt2ZXJzaW9uOiBzdHJpbmc7IFtrZXk6IHN0cmluZ106IGFueX07XG5cbiAgICAgIGNvbnN0IG1pc21hdGNoZXNWZXJzaW9uID0gdmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG4gICAgICBjb25zdCBtaXNtYXRjaGVzRXhwZXJpbWVudGFsID0gZXhwZXJpbWVudGFsVmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG5cbiAgICAgIGlmIChtaXNtYXRjaGVzRXhwZXJpbWVudGFsICYmIG1pc21hdGNoZXNWZXJzaW9uKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn0gKCR7ZXhwZXJpbWVudGFsVmVyc2lvbi52ZXJzaW9ufSlgKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==