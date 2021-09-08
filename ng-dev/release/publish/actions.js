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
        await this.createCommit(commitMessage, [constants_1.packageJsonPath, constants_1.changelogPath]);
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
        const localChangelogPath = (0, path_1.join)(this.projectDir, constants_1.changelogPath);
        const localChangelog = await fs_1.promises.readFile(localChangelogPath, 'utf8');
        const releaseNotesEntry = await releaseNotes.getChangelogEntry();
        await fs_1.promises.writeFile(localChangelogPath, `${releaseNotesEntry}\n\n${localChangelog}`);
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
        await this.createCommit(commitMessage, [constants_1.changelogPath]);
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
        const baseUrl = (0, github_urls_1.getFileContentsUrl)(this.git, ref, constants_1.changelogPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBa0M7QUFDbEMsK0JBQTBCO0FBQzFCLGlDQUFpQztBQUVqQyxpREFBZ0c7QUFDaEcsaURBQTRDO0FBRTVDLDZEQUlxQztBQUNyQywrQ0FBNEQ7QUFFNUQsMERBQW9EO0FBR3BELDJEQUF3RDtBQUV4RCxtREFBdUY7QUFDdkYscURBQW1HO0FBQ25HLDJDQUtxQjtBQUNyQiwyREFBd0Y7QUFDeEYsdURBQTREO0FBQzVELDZEQUF5RDtBQUN6RCw2REFBbUU7QUFDbkUsbURBQTZEO0FBNEI3RDs7OztHQUlHO0FBQ0gsTUFBc0IsYUFBYTtJQWtCakMsWUFDWSxNQUEyQixFQUMzQixHQUEyQixFQUMzQixNQUFxQixFQUNyQixVQUFrQjtRQUhsQixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUMzQixRQUFHLEdBQUgsR0FBRyxDQUF3QjtRQUMzQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFQOUIsbURBQW1EO1FBQzNDLG9CQUFlLEdBQXNCLElBQUksQ0FBQztJQU8vQyxDQUFDO0lBdEJKLHNEQUFzRDtJQUN0RCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQTRCLEVBQUUsT0FBc0I7UUFDbEUsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBcUJELDBFQUEwRTtJQUNsRSxLQUFLLENBQUMsaUJBQWlCO1FBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsMkJBQWUsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdB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QUFDLHdCQUF3QixrQkFBa0IsRUFBRSxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDO2FBQ3JDO1NBQ0Y7SUFDSCxDQUFDO0NBQ0Y7QUE5a0JELHNDQThrQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7U3Bpbm5lcn0gZnJvbSAnLi4vLi4vdXRpbHMvc3Bpbm5lcic7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtcbiAgZ2V0RmlsZUNvbnRlbnRzVXJsLFxuICBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsLFxuICBnZXRSZXBvc2l0b3J5R2l0VXJsLFxufSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtjcmVhdGVFeHBlcmltZW50YWxTZW12ZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge1xuICBjaGFuZ2Vsb2dQYXRoLFxuICBnaXRodWJSZWxlYXNlQm9keUxpbWl0LFxuICBwYWNrYWdlSnNvblBhdGgsXG4gIHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsLFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2ludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge2ZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnl9IGZyb20gJy4vZ3JhcGhxbC1xdWVyaWVzJztcbmltcG9ydCB7Z2V0UHVsbFJlcXVlc3RTdGF0ZX0gZnJvbSAnLi9wdWxsLXJlcXVlc3Qtc3RhdGUnO1xuaW1wb3J0IHtnZXRSZWxlYXNlVGFnRm9yVmVyc2lvbn0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLXRhZ3MnO1xuaW1wb3J0IHtHaXRodWJBcGlSZXF1ZXN0RXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIG93bmVyOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVW5pcXVlIGlkIGZvciB0aGUgcHVsbCByZXF1ZXN0IChpLmUuIHRoZSBQUiBudW1iZXIpLiAqL1xuICBpZDogbnVtYmVyO1xuICAvKiogVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHB1bGwgcmVxdWVzdCBpbiBHaXRodWIuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogRm9yayBjb250YWluaW5nIHRoZSBoZWFkIGJyYW5jaCBvZiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgZm9yazogR2l0aHViUmVwbztcbiAgLyoqIEJyYW5jaCBuYW1lIGluIHRoZSBmb3JrIHRoYXQgZGVmaW5lcyB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgZm9ya0JyYW5jaDogc3RyaW5nO1xufVxuXG4vKiogQ29uc3RydWN0b3IgdHlwZSBmb3IgaW5zdGFudGlhdGluZyBhIHJlbGVhc2UgYWN0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VBY3Rpb25Db25zdHJ1Y3RvcjxUIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiA9IFJlbGVhc2VBY3Rpb24+IHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucywgY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPjtcbiAgLyoqIENvbnN0cnVjdHMgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgbmV3ICguLi5hcmdzOiBbQWN0aXZlUmVsZWFzZVRyYWlucywgQXV0aGVudGljYXRlZEdpdENsaWVudCwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSB0aGUgbWFpbiBicmFuY2guIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIF9jb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwbyB8IG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsXG4gICAgcHJvdGVjdGVkIGdpdDogQXV0aGVudGljYXRlZEdpdENsaWVudCxcbiAgICBwcm90ZWN0ZWQgY29uZmlnOiBSZWxlYXNlQ29uZmlnLFxuICAgIHByb3RlY3RlZCBwcm9qZWN0RGlyOiBzdHJpbmcsXG4gICkge31cblxuICAvKiogUmV0cmlldmVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdldFByb2plY3RWZXJzaW9uKCkge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9IEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHtcbiAgICAgIHZlcnNpb246IHN0cmluZztcbiAgICAgIFtrZXk6IHN0cmluZ106IGFueTtcbiAgICB9O1xuICAgIHJldHVybiBuZXcgc2VtdmVyLlNlbVZlcihwa2dKc29uLnZlcnNpb24pO1xuICB9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge1xuICAgICAgdmVyc2lvbjogc3RyaW5nO1xuICAgICAgW2tleTogc3RyaW5nXTogYW55O1xuICAgIH07XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhOiB7Y29tbWl0fSxcbiAgICB9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhOiB7c3RhdGV9LFxuICAgIH0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBjb21taXRTaGEsXG4gICAgfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoXG4gICAgICAgICAgYCAg4pyYICAgQ2Fubm90IHN0YWdlIHJlbGVhc2UuIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIGRvZXMgbm90IHBhc3MgYWxsIGdpdGh1YiBgICtcbiAgICAgICAgICAgICdzdGF0dXMgY2hlY2tzLiBQbGVhc2UgbWFrZSBzdXJlIHRoaXMgY29tbWl0IHBhc3NlcyBhbGwgY2hlY2tzIGJlZm9yZSByZS1ydW5uaW5nLicsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgZXJyb3IoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApO1xuXG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oXG4gICAgICAgICAgeWVsbG93KFxuICAgICAgICAgICAgJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIGZhaWxpbmcgQ0kgY2hlY2tzLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoXG4gICAgICAgICAgYCAg4pyYICAgQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgc3RpbGwgaGFzIHBlbmRpbmcgZ2l0aHViIHN0YXR1c2VzIHRoYXQgYCArXG4gICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCkpO1xuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdygnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgcGVuZGluZyBDSSwgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBVcHN0cmVhbSBjb21taXQgaXMgcGFzc2luZyBhbGwgZ2l0aHViIHN0YXR1cyBjaGVja3MuJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oXG4gICAgICB5ZWxsb3coXG4gICAgICAgICcgIOKaoCAgIFBsZWFzZSByZXZpZXcgdGhlIGNoYW5nZWxvZyBhbmQgZW5zdXJlIHRoYXQgdGhlIGxvZyBjb250YWlucyBvbmx5IGNoYW5nZXMgJyArXG4gICAgICAgICAgJ3RoYXQgYXBwbHkgdG8gdGhlIHB1YmxpYyBBUEkgc3VyZmFjZS4gTWFudWFsIGNoYW5nZXMgY2FuIGJlIG1hZGUuIFdoZW4gZG9uZSwgcGxlYXNlICcgK1xuICAgICAgICAgICdwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy4nLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgaWYgKCEoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gcHJvY2VlZCBhbmQgY29tbWl0IHRoZSBjaGFuZ2VzPycpKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoLCBjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcmVsZWFzZSBjb21taXQgZm9yOiBcIiR7bmV3VmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvd25lZCBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IG9mIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIEFib3J0cyB0aGVcbiAgICogcHJvY2VzcyB3aXRoIGFuIGVycm9yIGlmIG5vIGZvcmsgY291bGQgYmUgZm91bmQuIEFsc28gY2FjaGVzIHRoZSBkZXRlcm1pbmVkIGZvcmtcbiAgICogcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnksIHtvd25lciwgbmFtZX0pO1xuICAgIGNvbnN0IGZvcmtzID0gcmVzdWx0LnJlcG9zaXRvcnkuZm9ya3Mubm9kZXM7XG5cbiAgICBpZiAoZm9ya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gKHRoaXMuX2NhY2hlZEZvcmtSZXBvID0ge293bmVyOiBmb3JrLm93bmVyLmxvZ2luLCBuYW1lOiBmb3JrLm5hbWV9KTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGJyYW5jaCBuYW1lIGlzIHJlc2VydmVkIGluIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbzogR2l0aHViUmVwbywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIGJyYW5jaDogbmFtZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgdGhlIGVycm9yIGhhcyBhIGBzdGF0dXNgIHByb3BlcnR5IHNldCB0byBgNDA0YCwgdGhlbiB3ZSBrbm93IHRoYXQgdGhlIGJyYW5jaFxuICAgICAgLy8gZG9lcyBub3QgZXhpc3QuIE90aGVyd2lzZSwgaXQgbWlnaHQgYmUgYW4gQVBJIGVycm9yIHRoYXQgd2Ugd2FudCB0byByZXBvcnQvcmUtdGhyb3cuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKFxuICAgIHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG87IGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwoXG4gICAgICB7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSxcbiAgICAgIHRoaXMuZ2l0LmdpdGh1YlRva2VuLFxuICAgICk7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICAgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgYm9keT86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKFxuICAgIHtpZH06IFB1bGxSZXF1ZXN0LFxuICAgIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcihgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIG1lcmdlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJTdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdHRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICAvLyBOb3RlOiBgZ2l0IGFkZGAgd291bGQgbm90IGJlIG5lZWRlZCBpZiB0aGUgZmlsZXMgYXJlIGFscmVhZHkga25vd24gdG9cbiAgICAvLyBHaXQsIGJ1dCB0aGUgc3BlY2lmaWVkIGZpbGVzIGNvdWxkIGFsc28gYmUgbmV3bHkgY3JlYXRlZCwgYW5kIHVua25vd24uXG4gICAgdGhpcy5naXQucnVuKFsnYWRkJywgLi4uZmlsZXNdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLXEnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YWdlcyB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCBicmFuY2ggYW5kIGNyZWF0ZXMgYSBwdWxsIHJlcXVlc3RcbiAgICogdGhhdCB0YXJnZXRzIHRoZSBnaXZlbiBiYXNlIGJyYW5jaC4gQXNzdW1lcyB0aGUgc3RhZ2luZyBicmFuY2ggaXMgYWxyZWFkeSBjaGVja2VkLW91dC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgIGBIRUFEYCBpbiBvcmRlciBidWlsZCB0aGUgcmVsZWFzZSBub3Rlcy5cbiAgICogQHBhcmFtIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoIEJyYW5jaCB0aGUgcHVsbCByZXF1ZXN0IHNob3VsZCB0YXJnZXQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzOyBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzQ29tcGFyZVRhZyA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzKTtcblxuICAgIC8vIEZldGNoIHRoZSBjb21wYXJlIHRhZyBzbyB0aGF0IGNvbW1pdHMgZm9yIHRoZSByZWxlYXNlIG5vdGVzIGNhbiBiZSBkZXRlcm1pbmVkLlxuICAgIC8vIFdlIGZvcmNpYmx5IG92ZXJyaWRlIGV4aXN0aW5nIGxvY2FsIHRhZ3MgdGhhdCBhcmUgbmFtZWQgc2ltaWxhciBhcyB3ZSB3aWxsIGZldGNoXG4gICAgLy8gdGhlIGNvcnJlY3QgdGFnIGZvciByZWxlYXNlIG5vdGVzIGNvbXBhcmlzb24gZnJvbSB0aGUgdXBzdHJlYW0gcmVtb3RlLlxuICAgIHRoaXMuZ2l0LnJ1bihbXG4gICAgICAnZmV0Y2gnLFxuICAgICAgJy0tZm9yY2UnLFxuICAgICAgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLFxuICAgICAgYHJlZnMvdGFncy8ke3JlbGVhc2VOb3Rlc0NvbXBhcmVUYWd9OnJlZnMvdGFncy8ke3JlbGVhc2VOb3Rlc0NvbXBhcmVUYWd9YCxcbiAgICBdKTtcblxuICAgIC8vIEJ1aWxkIHJlbGVhc2Ugbm90ZXMgZm9yIGNvbW1pdHMgZnJvbSBgPHJlbGVhc2VOb3Rlc0NvbXBhcmVUYWc+Li5IRUFEYC5cbiAgICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZm9yUmFuZ2UobmV3VmVyc2lvbiwgcmVsZWFzZU5vdGVzQ29tcGFyZVRhZywgJ0hFQUQnKTtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoLFxuICAgICAgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gLFxuICAgICk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiB7cmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCBgSEVBRGAgb2ZcbiAgICogICB0aGUgc3RhZ2luZyBicmFuY2ggaW4gb3JkZXIgYnVpbGQgdGhlIHJlbGVhc2Ugbm90ZXMuXG4gICAqIEBwYXJhbSBzdGFnaW5nQnJhbmNoIEJyYW5jaCB3aXRoaW4gdGhlIG5ldyB2ZXJzaW9uIHNob3VsZCBiZSBzdGFnZWQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHN0YWdpbmdCcmFuY2g6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXM7IHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzLFxuICAgICAgc3RhZ2luZ0JyYW5jaCxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBzdGFnaW5nQnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQgZm9yOiBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZCBieSB0aGUgY2FyZXRha2VyLlxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV4dEJyYW5jaCxcbiAgICAgIGBjaGFuZ2Vsb2ctY2hlcnJ5LXBpY2stJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLFxuICAgICAgY29tbWl0TWVzc2FnZSxcbiAgICAgIGBDaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmcm9tIHRoZSBcIiR7c3RhZ2luZ0JyYW5jaH1cIiBicmFuY2ggdG8gdGhlIG5leHQgYCArXG4gICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmAsXG4gICAgKTtcblxuICAgIGluZm8oXG4gICAgICBncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICAgJ2hhcyBiZWVuIGNyZWF0ZWQuJyxcbiAgICAgICksXG4gICAgKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkXG4gICAqIGJ5IHRhZ2dpbmcgdGhlIHZlcnNpb24gYnVtcCBjb21taXQsIGFuZCBieSBjcmVhdGluZyB0aGUgcmVsZWFzZSBlbnRyeS5cbiAgICpcbiAgICogRXhwZWN0cyB0aGUgdmVyc2lvbiBidW1wIGNvbW1pdCBhbmQgY2hhbmdlbG9nIHRvIGJlIGF2YWlsYWJsZSBpbiB0aGVcbiAgICogdXBzdHJlYW0gcmVtb3RlLlxuICAgKlxuICAgKiBAcGFyYW0gcmVsZWFzZU5vdGVzIFRoZSByZWxlYXNlIG5vdGVzIGZvciB0aGUgdmVyc2lvbiBiZWluZyBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSB2ZXJzaW9uQnVtcENvbW1pdFNoYSBDb21taXQgdGhhdCBidW1wZWQgdGhlIHZlcnNpb24uIFRoZSByZWxlYXNlIHRhZ1xuICAgKiAgIHdpbGwgcG9pbnQgdG8gdGhpcyBjb21taXQuXG4gICAqIEBwYXJhbSBpc1ByZXJlbGVhc2UgV2hldGhlciB0aGUgbmV3IHZlcnNpb24gaXMgcHVibGlzaGVkIGFzIGEgcHJlLXJlbGVhc2UuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nLFxuICAgIGlzUHJlcmVsZWFzZTogYm9vbGVhbixcbiAgKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIHVwc3RyZWFtLmApKTtcblxuICAgIGxldCByZWxlYXNlQm9keSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKTtcblxuICAgIC8vIElmIHRoZSByZWxlYXNlIGJvZHkgZXhjZWVkcyB0aGUgR2l0aHViIGJvZHkgbGltaXQsIHdlIGp1c3QgcHJvdmlkZVxuICAgIC8vIGEgbGluayB0byB0aGUgY2hhbmdlbG9nIGVudHJ5IGluIHRoZSBHaXRodWIgcmVsZWFzZSBlbnRyeS5cbiAgICBpZiAocmVsZWFzZUJvZHkubGVuZ3RoID4gZ2l0aHViUmVsZWFzZUJvZHlMaW1pdCkge1xuICAgICAgY29uc3QgcmVsZWFzZU5vdGVzVXJsID0gYXdhaXQgdGhpcy5fZ2V0R2l0aHViQ2hhbmdlbG9nVXJsRm9yUmVmKHJlbGVhc2VOb3RlcywgdGFnTmFtZSk7XG4gICAgICByZWxlYXNlQm9keSA9XG4gICAgICAgIGBSZWxlYXNlIG5vdGVzIGFyZSB0b28gbGFyZ2UgdG8gYmUgY2FwdHVyZWQgaGVyZS4gYCArXG4gICAgICAgIGBbVmlldyBhbGwgY2hhbmdlcyBoZXJlXSgke3JlbGVhc2VOb3Rlc1VybH0pLmA7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICAgIHByZXJlbGVhc2U6IGlzUHJlcmVsZWFzZSxcbiAgICAgIGJvZHk6IHJlbGVhc2VCb2R5LFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSBpbiBHaXRodWIuYCkpO1xuICB9XG5cbiAgLyoqIEdldHMgYSBHaXRodWIgVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHJlbGVhc2Ugbm90ZXMgaW4gdGhlIGdpdmVuIHJlZi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0R2l0aHViQ2hhbmdlbG9nVXJsRm9yUmVmKHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCByZWY6IHN0cmluZykge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBnZXRGaWxlQ29udGVudHNVcmwodGhpcy5naXQsIHJlZiwgY2hhbmdlbG9nUGF0aCk7XG4gICAgY29uc3QgdXJsRnJhZ21lbnQgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0VXJsRnJhZ21lbnRGb3JSZWxlYXNlKCk7XG4gICAgcmV0dXJuIGAke2Jhc2VVcmx9IyR7dXJsRnJhZ21lbnR9YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHB1Ymxpc2hlcyB0aGUgZ2l2ZW4gdmVyc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJyYW5jaC5cbiAgICogQHBhcmFtIHJlbGVhc2VOb3RlcyBUaGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIHZlcnNpb24gYmVpbmcgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gcHVibGlzaEJyYW5jaCBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgbmV3IHZlcnNpb24uXG4gICAqIEBwYXJhbSBucG1EaXN0VGFnIE5QTSBkaXN0IHRhZyB3aGVyZSB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcHVibGlzaGVkIHRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkQW5kUHVibGlzaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBwdWJsaXNoQnJhbmNoOiBzdHJpbmcsXG4gICAgbnBtRGlzdFRhZzogTnBtRGlzdFRhZyxcbiAgKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghKGF3YWl0IHRoaXMuX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcocmVsZWFzZU5vdGVzLnZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgcmVsZWFzZU5vdGVzLFxuICAgICAgdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgICBucG1EaXN0VGFnID09PSAnbmV4dCcsXG4gICAgKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGRlYnVnKGBTdGFydGluZyBwdWJsaXNoIG9mIFwiJHtwa2cubmFtZX1cIi5gKTtcbiAgICBjb25zdCBzcGlubmVyID0gbmV3IFNwaW5uZXIoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuY29tcGxldGUoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBwdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cIi5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGNvbW1pdCByZXByZXNlbnRzIGEgc3RhZ2luZyBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb21taXRTaGE6IHN0cmluZykge1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBjb21taXRTaGEsXG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICAvKiogRXhwZXJpbWVudGFsIGVxdWl2YWxlbnQgdmVyc2lvbiBmb3IgcGFja2FnZXMgY3JlYXRlZCB3aXRoIHRoZSBwcm92aWRlZCB2ZXJzaW9uLiAqL1xuICAgIGNvbnN0IGV4cGVyaW1lbnRhbFZlcnNpb24gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG5cbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPSBKU09OLnBhcnNlKFxuICAgICAgICBhd2FpdCBmcy5yZWFkRmlsZShqb2luKHBrZy5vdXRwdXRQYXRoLCAncGFja2FnZS5qc29uJyksICd1dGY4JyksXG4gICAgICApIGFzIHt2ZXJzaW9uOiBzdHJpbmc7IFtrZXk6IHN0cmluZ106IGFueX07XG5cbiAgICAgIGNvbnN0IG1pc21hdGNoZXNWZXJzaW9uID0gdmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG4gICAgICBjb25zdCBtaXNtYXRjaGVzRXhwZXJpbWVudGFsID0gZXhwZXJpbWVudGFsVmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG5cbiAgICAgIGlmIChtaXNtYXRjaGVzRXhwZXJpbWVudGFsICYmIG1pc21hdGNoZXNWZXJzaW9uKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn0gKCR7ZXhwZXJpbWVudGFsVmVyc2lvbi52ZXJzaW9ufSlgKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==