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
const ora = require("ora");
const path_1 = require("path");
const semver = require("semver");
const console_1 = require("../../utils/console");
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
        const pkgJsonPath = path_1.join(this.projectDir, constants_1.packageJsonPath);
        const pkgJson = JSON.parse(await fs_1.promises.readFile(pkgJsonPath, 'utf8'));
        return new semver.SemVer(pkgJson.version);
    }
    /** Updates the version in the project top-level `package.json` file. */
    async updateProjectVersion(newVersion) {
        const pkgJsonPath = path_1.join(this.projectDir, constants_1.packageJsonPath);
        const pkgJson = JSON.parse(await fs_1.promises.readFile(pkgJsonPath, 'utf8'));
        pkgJson.version = newVersion.format();
        // Write the `package.json` file. Note that we add a trailing new line
        // to avoid unnecessary diff. IDEs usually add a trailing new line.
        await fs_1.promises.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
        console_1.info(console_1.green(`  ✓   Updated project version to ${pkgJson.version}`));
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
        const branchCommitsUrl = github_urls_1.getListCommitsInBranchUrl(this.git, branchName);
        if (state === 'failure') {
            console_1.error(console_1.red(`  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
                'status checks. Please make sure this commit passes all checks before re-running.'));
            console_1.error(`      Please have a look at: ${branchCommitsUrl}`);
            if (await console_1.promptConfirm('Do you want to ignore the Github status and proceed?')) {
                console_1.info(console_1.yellow('  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.'));
                return;
            }
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        else if (state === 'pending') {
            console_1.error(console_1.red(`  ✘   Commit "${commitSha}" still has pending github statuses that ` +
                'need to succeed before staging a release.'));
            console_1.error(console_1.red(`      Please have a look at: ${branchCommitsUrl}`));
            if (await console_1.promptConfirm('Do you want to ignore the Github status and proceed?')) {
                console_1.info(console_1.yellow('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
                return;
            }
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        console_1.info(console_1.green('  ✓   Upstream commit is passing all github status checks.'));
    }
    /**
     * Prompts the user for potential release notes edits that need to be made. Once
     * confirmed, a new commit for the release point is created.
     */
    async waitForEditsAndCreateReleaseCommit(newVersion) {
        console_1.info(console_1.yellow('  ⚠   Please review the changelog and ensure that the log contains only changes ' +
            'that apply to the public API surface. Manual changes can be made. When done, please ' +
            'proceed with the prompt below.'));
        if (!(await console_1.promptConfirm('Do you want to proceed and commit the changes?'))) {
            throw new actions_error_1.UserAbortedReleaseActionError();
        }
        // Commit message for the release point.
        const commitMessage = commit_message_1.getCommitMessageForRelease(newVersion);
        // Create a release staging commit including changelog and version bump.
        await this.createCommit(commitMessage, [constants_1.packageJsonPath, constants_1.changelogPath]);
        console_1.info(console_1.green(`  ✓   Created release commit for: "${newVersion}".`));
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
            console_1.error(console_1.red('  ✘   Unable to find fork for currently authenticated user.'));
            console_1.error(console_1.red(`      Please ensure you created a fork of: ${owner}/${name}.`));
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
            if (e.status === 404) {
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
        const repoGitUrl = github_urls_1.getRepositoryGitUrl({ ...fork, useSsh: this.git.remoteConfig.useSsh }, this.git.githubToken);
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
        console_1.info(console_1.green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
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
            console_1.debug(`Waiting for pull request #${id} to be merged.`);
            const spinner = ora.call(undefined).start(`Waiting for pull request #${id} to be merged.`);
            const intervalId = setInterval(async () => {
                const prState = await pull_request_state_1.getPullRequestState(this.git, id);
                if (prState === 'merged') {
                    spinner.stop();
                    console_1.info(console_1.green(`  ✓   Pull request #${id} has been merged.`));
                    clearInterval(intervalId);
                    resolve();
                }
                else if (prState === 'closed') {
                    spinner.stop();
                    console_1.warn(console_1.yellow(`  ✘   Pull request #${id} has been closed.`));
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
        const localChangelogPath = path_1.join(this.projectDir, constants_1.changelogPath);
        const localChangelog = await fs_1.promises.readFile(localChangelogPath, 'utf8');
        const releaseNotesEntry = await releaseNotes.getChangelogEntry();
        await fs_1.promises.writeFile(localChangelogPath, `${releaseNotesEntry}\n\n${localChangelog}`);
        console_1.info(console_1.green(`  ✓   Updated the changelog to capture changes for "${releaseNotes.version}".`));
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
        const releaseNotesCompareTag = version_tags_1.getReleaseTagForVersion(compareVersionForReleaseNotes);
        // Fetch the compare tag so that commits for the release notes can be determined.
        this.git.run(['fetch', this.git.getRepoGitUrl(), `refs/tags/${releaseNotesCompareTag}`]);
        // Build release notes for commits from `<releaseNotesCompareTag>..HEAD`.
        const releaseNotes = await release_notes_1.ReleaseNotes.forRange(newVersion, releaseNotesCompareTag, 'HEAD');
        await this.updateProjectVersion(newVersion);
        await this.prependReleaseNotesToChangelog(releaseNotes);
        await this.waitForEditsAndCreateReleaseCommit(newVersion);
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(pullRequestTargetBranch, `release-stage-${newVersion}`, `Bump version to "v${newVersion}" with changelog.`);
        console_1.info(console_1.green('  ✓   Release staging pull request has been created.'));
        console_1.info(console_1.yellow(`      Please ask team members to review: ${pullRequest.url}.`));
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
        const commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
        // Checkout the next branch.
        await this.checkoutUpstreamBranch(nextBranch);
        await this.prependReleaseNotesToChangelog(releaseNotes);
        // Create a changelog cherry-pick commit.
        await this.createCommit(commitMessage, [constants_1.changelogPath]);
        console_1.info(console_1.green(`  ✓   Created changelog cherry-pick commit for: "${releaseNotes.version}".`));
        // Create a cherry-pick pull request that should be merged by the caretaker.
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(nextBranch, `changelog-cherry-pick-${releaseNotes.version}`, commitMessage, `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
            `branch (${nextBranch}).`);
        console_1.info(console_1.green(`  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
            'has been created.'));
        console_1.info(console_1.yellow(`      Please ask team members to review: ${pullRequest.url}.`));
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
        const tagName = version_tags_1.getReleaseTagForVersion(releaseNotes.version);
        await this.git.github.git.createRef({
            ...this.git.remoteParams,
            ref: `refs/tags/${tagName}`,
            sha: versionBumpCommitSha,
        });
        console_1.info(console_1.green(`  ✓   Tagged v${releaseNotes.version} release upstream.`));
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
        console_1.info(console_1.green(`  ✓   Created v${releaseNotes.version} release in Github.`));
    }
    /** Gets a Github URL that resolves to the release notes in the given ref. */
    async _getGithubChangelogUrlForRef(releaseNotes, ref) {
        const baseUrl = github_urls_1.getFileContentsUrl(this.git, ref, constants_1.changelogPath);
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
            console_1.error(console_1.red(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`));
            console_1.error(console_1.red('      Please make sure the staging pull request has been merged.'));
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
        await external_commands_1.invokeYarnInstallCommand(this.projectDir);
        const builtPackages = await external_commands_1.invokeReleaseBuildCommand();
        // Verify the packages built are the correct version.
        await this._verifyPackageVersions(releaseNotes.version, builtPackages);
        // Create a Github release for the new version.
        await this._createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, npmDistTag === 'next');
        // Walk through all built packages and publish them to NPM.
        for (const builtPackage of builtPackages) {
            await this._publishBuiltPackageToNpm(builtPackage, npmDistTag);
        }
        console_1.info(console_1.green('  ✓   Published all packages successfully'));
    }
    /** Publishes the given built package to NPM with the specified NPM dist tag. */
    async _publishBuiltPackageToNpm(pkg, npmDistTag) {
        console_1.debug(`Starting publish of "${pkg.name}".`);
        const spinner = ora.call(undefined).start(`Publishing "${pkg.name}"`);
        try {
            await npm_publish_1.runNpmPublish(pkg.outputPath, npmDistTag, this.config.publishRegistry);
            spinner.stop();
            console_1.info(console_1.green(`  ✓   Successfully published "${pkg.name}.`));
        }
        catch (e) {
            spinner.stop();
            console_1.error(e);
            console_1.error(console_1.red(`  ✘   An error occurred while publishing "${pkg.name}".`));
            throw new actions_error_1.FatalReleaseActionError();
        }
    }
    /** Checks whether the given commit represents a staging commit for the specified version. */
    async _isCommitForVersionStaging(version, commitSha) {
        const { data } = await this.git.github.repos.getCommit({
            ...this.git.remoteParams,
            ref: commitSha,
        });
        return data.commit.message.startsWith(commit_message_1.getCommitMessageForRelease(version));
    }
    /** Verify the version of each generated package exact matches the specified version. */
    async _verifyPackageVersions(version, packages) {
        /** Experimental equivalent version for packages created with the provided version. */
        const experimentalVersion = semver_1.createExperimentalSemver(version);
        for (const pkg of packages) {
            const { version: packageJsonVersion } = JSON.parse(await fs_1.promises.readFile(path_1.join(pkg.outputPath, 'package.json'), 'utf8'));
            const mismatchesVersion = version.compare(packageJsonVersion) !== 0;
            const mismatchesExperimental = experimentalVersion.compare(packageJsonVersion) !== 0;
            if (mismatchesExperimental && mismatchesVersion) {
                console_1.error(console_1.red('The built package version does not match the version being released.'));
                console_1.error(`  Release Version:   ${version.version} (${experimentalVersion.version})`);
                console_1.error(`  Generated Version: ${packageJsonVersion}`);
                throw new actions_error_1.FatalReleaseActionError();
            }
        }
    }
}
exports.ReleaseAction = ReleaseAction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBa0M7QUFDbEMsMkJBQTJCO0FBQzNCLCtCQUEwQjtBQUMxQixpQ0FBaUM7QUFFakMsaURBQWdHO0FBRWhHLDZEQUlxQztBQUNyQywrQ0FBNEQ7QUFFNUQsMERBQW9EO0FBR3BELDJEQUF3RDtBQUV4RCxtREFBdUY7QUFDdkYscURBQW1HO0FBQ25HLDJDQUtxQjtBQUNyQiwyREFBd0Y7QUFDeEYsdURBQTREO0FBQzVELDZEQUF5RDtBQUN6RCw2REFBbUU7QUE0Qm5FOzs7O0dBSUc7QUFDSCxNQUFzQixhQUFhO0lBa0JqQyxZQUNZLE1BQTJCLEVBQzNCLEdBQTJCLEVBQzNCLE1BQXFCLEVBQ3JCLFVBQWtCO1FBSGxCLFdBQU0sR0FBTixNQUFNLENBQXFCO1FBQzNCLFFBQUcsR0FBSCxHQUFHLENBQXdCO1FBQzNCLFdBQU0sR0FBTixNQUFNLENBQWU7UUFDckIsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQVA5QixtREFBbUQ7UUFDM0Msb0JBQWUsR0FBc0IsSUFBSSxDQUFDO0lBTy9DLENBQUM7SUF0Qkosc0RBQXNEO0lBQ3RELE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBNEIsRUFBRSxPQUFzQjtRQUNsRSxNQUFNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFxQkQsMEVBQTBFO0lBQ2xFLEtBQUssQ0FBQyxpQkFBaUI7UUFDN0IsTUFBTSxXQUFXLEdBQUcsV0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsMkJBQWUsQ0FBQyxDQUFDO1FBQzNELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMs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LEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDOUMsTUFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUN2QixDQUFDO1lBRTNDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRSxNQUFNLHNCQUFzQixHQUFHLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVyRixJQUFJLHNCQUFzQixJQUFJLGlCQUFpQixFQUFFO2dCQUMvQyxlQUFLLENBQUMsYUFBRyxDQUFDLHNFQUFzRSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsZUFBSyxDQUFDLHdCQUF3QixPQUFPLENBQUMsT0FBTyxLQUFLLG1CQUFtQixDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ2xGLGVBQUssQ0FBQyx3QkFBd0Isa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzthQUNyQztTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBdmtCRCxzQ0F1a0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgZnN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1xuICBnZXRGaWxlQ29udGVudHNVcmwsXG4gIGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwsXG4gIGdldFJlcG9zaXRvcnlHaXRVcmwsXG59IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge2NyZWF0ZUV4cGVyaW1lbnRhbFNlbXZlcn0gZnJvbSAnLi4vLi4vdXRpbHMvc2VtdmVyJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7XG4gIGNoYW5nZWxvZ1BhdGgsXG4gIGdpdGh1YlJlbGVhc2VCb2R5TGltaXQsXG4gIHBhY2thZ2VKc29uUGF0aCxcbiAgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7aW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5pbXBvcnQge2dldFJlbGVhc2VUYWdGb3JWZXJzaW9ufSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tdGFncyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcgKC4uLmFyZ3M6IFtBY3RpdmVSZWxlYXNlVHJhaW5zLCBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LCBSZWxlYXNlQ29uZmlnLCBzdHJpbmddKTogVDtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhIHJlbGVhc2UgYWN0aW9uLiBBIHJlbGVhc2UgYWN0aW9uIGlzIHNlbGVjdGFibGUgYnkgdGhlIGNhcmV0YWtlclxuICogaWYgYWN0aXZlLCBhbmQgY2FuIHBlcmZvcm0gY2hhbmdlcyBmb3IgcmVsZWFzaW5nLCBzdWNoIGFzIHN0YWdpbmcgYSByZWxlYXNlLCBidW1waW5nIHRoZVxuICogdmVyc2lvbiwgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZywgYnJhbmNoaW5nIG9mZiBmcm9tIHRoZSBtYWluIGJyYW5jaC4gZXRjLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBzdGF0aWMgaXNBY3RpdmUoX3RyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucywgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIGFic3RyYWN0IGdldERlc2NyaXB0aW9uKCk6IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBnaXZlbiByZWxlYXNlIGFjdGlvbi5cbiAgICogQHRocm93cyB7VXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIHVzZXIgbWFudWFsbHkgYWJvcnRlZCB0aGUgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGEgZmF0YWwgZXJyb3IuXG4gICAqL1xuICBhYnN0cmFjdCBwZXJmb3JtKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqIENhY2hlZCBmb3VuZCBmb3JrIG9mIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByaXZhdGUgX2NhY2hlZEZvcmtSZXBvOiBHaXRodWJSZXBvIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgICBwcm90ZWN0ZWQgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsXG4gICAgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0UHJvamVjdFZlcnNpb24oKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge1xuICAgICAgdmVyc2lvbjogc3RyaW5nO1xuICAgICAgW2tleTogc3RyaW5nXTogYW55O1xuICAgIH07XG4gICAgcmV0dXJuIG5ldyBzZW12ZXIuU2VtVmVyKHBrZ0pzb24udmVyc2lvbik7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPSBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7XG4gICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICAgfTtcbiAgICBwa2dKc29uLnZlcnNpb24gPSBuZXdWZXJzaW9uLmZvcm1hdCgpO1xuICAgIC8vIFdyaXRlIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLiBOb3RlIHRoYXQgd2UgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmVcbiAgICAvLyB0byBhdm9pZCB1bm5lY2Vzc2FyeSBkaWZmLiBJREVzIHVzdWFsbHkgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmUuXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHBrZ0pzb25QYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwa2dKc29uLCBudWxsLCAyKX1cXG5gKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgcHJvamVjdCB2ZXJzaW9uIHRvICR7cGtnSnNvbi52ZXJzaW9ufWApKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtb3N0IHJlY2VudCBjb21taXQgb2YgYSBzcGVjaWZpZWQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHtjb21taXR9LFxuICAgIH0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogYnJhbmNoTmFtZX0pO1xuICAgIHJldHVybiBjb21taXQuc2hhO1xuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgdGhlIGxhdGVzdCBjb21taXQgZm9yIHRoZSBnaXZlbiBicmFuY2ggaXMgcGFzc2luZyBhbGwgc3RhdHVzZXMuICovXG4gIHByb3RlY3RlZCBhc3luYyB2ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHtzdGF0ZX0sXG4gICAgfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21iaW5lZFN0YXR1c0ZvclJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGNvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBjb25zdCBicmFuY2hDb21taXRzVXJsID0gZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCh0aGlzLmdpdCwgYnJhbmNoTmFtZSk7XG5cbiAgICBpZiAoc3RhdGUgPT09ICdmYWlsdXJlJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgIHJlZChcbiAgICAgICAgICBgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgJ3N0YXR1cyBjaGVja3MuIFBsZWFzZSBtYWtlIHN1cmUgdGhpcyBjb21taXQgcGFzc2VzIGFsbCBjaGVja3MgYmVmb3JlIHJlLXJ1bm5pbmcuJyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyhcbiAgICAgICAgICB5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgIHJlZChcbiAgICAgICAgICBgICDinJggICBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBzdGlsbCBoYXMgcGVuZGluZyBnaXRodWIgc3RhdHVzZXMgdGhhdCBgICtcbiAgICAgICAgICAgICduZWVkIHRvIHN1Y2NlZWQgYmVmb3JlIHN0YWdpbmcgYSByZWxlYXNlLicsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKSk7XG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KCcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwZW5kaW5nIENJLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwYXNzaW5nIGFsbCBnaXRodWIgc3RhdHVzIGNoZWNrcy4nKSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgcG90ZW50aWFsIHJlbGVhc2Ugbm90ZXMgZWRpdHMgdGhhdCBuZWVkIHRvIGJlIG1hZGUuIE9uY2VcbiAgICogY29uZmlybWVkLCBhIG5ldyBjb21taXQgZm9yIHRoZSByZWxlYXNlIHBvaW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgaW5mbyhcbiAgICAgIHllbGxvdyhcbiAgICAgICAgJyAg4pqgICAgUGxlYXNlIHJldmlldyB0aGUgY2hhbmdlbG9nIGFuZCBlbnN1cmUgdGhhdCB0aGUgbG9nIGNvbnRhaW5zIG9ubHkgY2hhbmdlcyAnICtcbiAgICAgICAgICAndGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgJyArXG4gICAgICAgICAgJ3Byb2NlZWQgd2l0aCB0aGUgcHJvbXB0IGJlbG93LicsXG4gICAgICApLFxuICAgICk7XG5cbiAgICBpZiAoIShhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIGFuZCBjb21taXQgdGhlIGNoYW5nZXM/JykpKSB7XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDb21taXQgbWVzc2FnZSBmb3IgdGhlIHJlbGVhc2UgcG9pbnQuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKG5ld1ZlcnNpb24pO1xuICAgIC8vIENyZWF0ZSBhIHJlbGVhc2Ugc3RhZ2luZyBjb21taXQgaW5jbHVkaW5nIGNoYW5nZWxvZyBhbmQgdmVyc2lvbiBidW1wLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGgsIGNoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC4gQWxzbyBjYWNoZXMgdGhlIGRldGVybWluZWQgZm9ya1xuICAgKiByZXBvc2l0b3J5IGFzIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgY2Fubm90IGNoYW5nZSBkdXJpbmcgYWN0aW9uIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZWRGb3JrUmVwbyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwoZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSwge293bmVyLCBuYW1lfSk7XG4gICAgY29uc3QgZm9ya3MgPSByZXN1bHQucmVwb3NpdG9yeS5mb3Jrcy5ub2RlcztcblxuICAgIGlmIChmb3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGVuc3VyZSB5b3UgY3JlYXRlZCBhIGZvcmsgb2Y6ICR7b3duZXJ9LyR7bmFtZX0uYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9yayA9IGZvcmtzWzBdO1xuICAgIHJldHVybiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX0pO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYnJhbmNoIG5hbWUgaXMgcmVzZXJ2ZWQgaW4gdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5LiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvOiBHaXRodWJSZXBvLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgYnJhbmNoOiBuYW1lfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiB0aGUgZXJyb3IgaGFzIGEgYHN0YXR1c2AgcHJvcGVydHkgc2V0IHRvIGA0MDRgLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgYnJhbmNoXG4gICAgICAvLyBkb2VzIG5vdCBleGlzdC4gT3RoZXJ3aXNlLCBpdCBtaWdodCBiZSBhbiBBUEkgZXJyb3IgdGhhdCB3ZSB3YW50IHRvIHJlcG9ydC9yZS10aHJvdy5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKFxuICAgIHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG87IGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwoXG4gICAgICB7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSxcbiAgICAgIHRoaXMuZ2l0LmdpdGh1YlRva2VuLFxuICAgICk7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICAgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgYm9keT86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKFxuICAgIHtpZH06IFB1bGxSZXF1ZXN0LFxuICAgIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdHRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICAvLyBOb3RlOiBgZ2l0IGFkZGAgd291bGQgbm90IGJlIG5lZWRlZCBpZiB0aGUgZmlsZXMgYXJlIGFscmVhZHkga25vd24gdG9cbiAgICAvLyBHaXQsIGJ1dCB0aGUgc3BlY2lmaWVkIGZpbGVzIGNvdWxkIGFsc28gYmUgbmV3bHkgY3JlYXRlZCwgYW5kIHVua25vd24uXG4gICAgdGhpcy5naXQucnVuKFsnYWRkJywgLi4uZmlsZXNdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLXEnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YWdlcyB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCBicmFuY2ggYW5kIGNyZWF0ZXMgYSBwdWxsIHJlcXVlc3RcbiAgICogdGhhdCB0YXJnZXRzIHRoZSBnaXZlbiBiYXNlIGJyYW5jaC4gQXNzdW1lcyB0aGUgc3RhZ2luZyBicmFuY2ggaXMgYWxyZWFkeSBjaGVja2VkLW91dC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCB0aGUgY3VycmVudFxuICAgKiAgIGBIRUFEYCBpbiBvcmRlciBidWlsZCB0aGUgcmVsZWFzZSBub3Rlcy5cbiAgICogQHBhcmFtIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoIEJyYW5jaCB0aGUgcHVsbCByZXF1ZXN0IHNob3VsZCB0YXJnZXQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzOyBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzQ29tcGFyZVRhZyA9IGdldFJlbGVhc2VUYWdGb3JWZXJzaW9uKGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzKTtcblxuICAgIC8vIEZldGNoIHRoZSBjb21wYXJlIHRhZyBzbyB0aGF0IGNvbW1pdHMgZm9yIHRoZSByZWxlYXNlIG5vdGVzIGNhbiBiZSBkZXRlcm1pbmVkLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2ZldGNoJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBgcmVmcy90YWdzLyR7cmVsZWFzZU5vdGVzQ29tcGFyZVRhZ31gXSk7XG5cbiAgICAvLyBCdWlsZCByZWxlYXNlIG5vdGVzIGZvciBjb21taXRzIGZyb20gYDxyZWxlYXNlTm90ZXNDb21wYXJlVGFnPi4uSEVBRGAuXG4gICAgY29uc3QgcmVsZWFzZU5vdGVzID0gYXdhaXQgUmVsZWFzZU5vdGVzLmZvclJhbmdlKG5ld1ZlcnNpb24sIHJlbGVhc2VOb3Rlc0NvbXBhcmVUYWcsICdIRUFEJyk7XG5cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBwdWxsUmVxdWVzdFRhcmdldEJyYW5jaCxcbiAgICAgIGByZWxlYXNlLXN0YWdlLSR7bmV3VmVyc2lvbn1gLFxuICAgICAgYEJ1bXAgdmVyc2lvbiB0byBcInYke25ld1ZlcnNpb259XCIgd2l0aCBjaGFuZ2Vsb2cuYCxcbiAgICApO1xuXG4gICAgaW5mbyhncmVlbignICDinJMgICBSZWxlYXNlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICByZXR1cm4ge3JlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3R9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLCB2ZXJpZmllcyBpdHMgQ0kgc3RhdHVzIGFuZCBzdGFnZXNcbiAgICogdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBpbiBvcmRlciB0byBjcmVhdGUgYSBwdWxsIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSBuZXdWZXJzaW9uIE5ldyB2ZXJzaW9uIHRvIGJlIHN0YWdlZC5cbiAgICogQHBhcmFtIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzIFZlcnNpb24gdXNlZCBmb3IgY29tcGFyaW5nIHdpdGggYEhFQURgIG9mXG4gICAqICAgdGhlIHN0YWdpbmcgYnJhbmNoIGluIG9yZGVyIGJ1aWxkIHRoZSByZWxlYXNlIG5vdGVzLlxuICAgKiBAcGFyYW0gc3RhZ2luZ0JyYW5jaCBCcmFuY2ggd2l0aGluIHRoZSBuZXcgdmVyc2lvbiBzaG91bGQgYmUgc3RhZ2VkLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24oXG4gICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgICBjb21wYXJlVmVyc2lvbkZvclJlbGVhc2VOb3Rlczogc2VtdmVyLlNlbVZlcixcbiAgICBzdGFnaW5nQnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzOyBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKHN0YWdpbmdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChzdGFnaW5nQnJhbmNoKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5ld1ZlcnNpb24sXG4gICAgICBjb21wYXJlVmVyc2lvbkZvclJlbGVhc2VOb3RlcyxcbiAgICAgIHN0YWdpbmdCcmFuY2gsXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgYSB2ZXJzaW9uIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCB0byBhIGdpdmVuIGJyYW5jaFxuICAgKiBpbnRvIHRoZSBgbmV4dGAgcHJpbWFyeSBkZXZlbG9wbWVudCBicmFuY2guIEEgcHVsbCByZXF1ZXN0IGlzIGNyZWF0ZWQgZm9yIHRoaXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3NmdWwgY3JlYXRpb24gb2YgdGhlIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2goXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgc3RhZ2luZ0JyYW5jaDogc3RyaW5nLFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5leHRCcmFuY2gsXG4gICAgICBgY2hhbmdlbG9nLWNoZXJyeS1waWNrLSR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgICBgQ2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZnJvbSB0aGUgXCIke3N0YWdpbmdCcmFuY2h9XCIgYnJhbmNoIHRvIHRoZSBuZXh0IGAgK1xuICAgICAgICBgYnJhbmNoICgke25leHRCcmFuY2h9KS5gLFxuICAgICk7XG5cbiAgICBpbmZvKFxuICAgICAgZ3JlZW4oXG4gICAgICAgIGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZyBpbnRvIFwiJHtuZXh0QnJhbmNofVwiIGAgK1xuICAgICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicsXG4gICAgICApLFxuICAgICk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBQdWxsIFJlcXVlc3QgdG8gYmUgbWVyZ2VkLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gVGhlIHJlbGVhc2UgaXMgY3JlYXRlZFxuICAgKiBieSB0YWdnaW5nIHRoZSB2ZXJzaW9uIGJ1bXAgY29tbWl0LCBhbmQgYnkgY3JlYXRpbmcgdGhlIHJlbGVhc2UgZW50cnkuXG4gICAqXG4gICAqIEV4cGVjdHMgdGhlIHZlcnNpb24gYnVtcCBjb21taXQgYW5kIGNoYW5nZWxvZyB0byBiZSBhdmFpbGFibGUgaW4gdGhlXG4gICAqIHVwc3RyZWFtIHJlbW90ZS5cbiAgICpcbiAgICogQHBhcmFtIHJlbGVhc2VOb3RlcyBUaGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIHZlcnNpb24gYmVpbmcgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gdmVyc2lvbkJ1bXBDb21taXRTaGEgQ29tbWl0IHRoYXQgYnVtcGVkIHRoZSB2ZXJzaW9uLiBUaGUgcmVsZWFzZSB0YWdcbiAgICogICB3aWxsIHBvaW50IHRvIHRoaXMgY29tbWl0LlxuICAgKiBAcGFyYW0gaXNQcmVyZWxlYXNlIFdoZXRoZXIgdGhlIG5ldyB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhcyBhIHByZS1yZWxlYXNlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgdmVyc2lvbkJ1bXBDb21taXRTaGE6IHN0cmluZyxcbiAgICBpc1ByZXJlbGVhc2U6IGJvb2xlYW4sXG4gICkge1xuICAgIGNvbnN0IHRhZ05hbWUgPSBnZXRSZWxlYXNlVGFnRm9yVmVyc2lvbihyZWxlYXNlTm90ZXMudmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdpdC5jcmVhdGVSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBgcmVmcy90YWdzLyR7dGFnTmFtZX1gLFxuICAgICAgc2hhOiB2ZXJzaW9uQnVtcENvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFRhZ2dlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSB1cHN0cmVhbS5gKSk7XG5cbiAgICBsZXQgcmVsZWFzZUJvZHkgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk7XG5cbiAgICAvLyBJZiB0aGUgcmVsZWFzZSBib2R5IGV4Y2VlZHMgdGhlIEdpdGh1YiBib2R5IGxpbWl0LCB3ZSBqdXN0IHByb3ZpZGVcbiAgICAvLyBhIGxpbmsgdG8gdGhlIGNoYW5nZWxvZyBlbnRyeSBpbiB0aGUgR2l0aHViIHJlbGVhc2UgZW50cnkuXG4gICAgaWYgKHJlbGVhc2VCb2R5Lmxlbmd0aCA+IGdpdGh1YlJlbGVhc2VCb2R5TGltaXQpIHtcbiAgICAgIGNvbnN0IHJlbGVhc2VOb3Rlc1VybCA9IGF3YWl0IHRoaXMuX2dldEdpdGh1YkNoYW5nZWxvZ1VybEZvclJlZihyZWxlYXNlTm90ZXMsIHRhZ05hbWUpO1xuICAgICAgcmVsZWFzZUJvZHkgPVxuICAgICAgICBgUmVsZWFzZSBub3RlcyBhcmUgdG9vIGxhcmdlIHRvIGJlIGNhcHR1cmVkIGhlcmUuIGAgK1xuICAgICAgICBgW1ZpZXcgYWxsIGNoYW5nZXMgaGVyZV0oJHtyZWxlYXNlTm90ZXNVcmx9KS5gO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5jcmVhdGVSZWxlYXNlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIG5hbWU6IGB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLFxuICAgICAgdGFnX25hbWU6IHRhZ05hbWUsXG4gICAgICBwcmVyZWxlYXNlOiBpc1ByZXJlbGVhc2UsXG4gICAgICBib2R5OiByZWxlYXNlQm9keSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgaW4gR2l0aHViLmApKTtcbiAgfVxuXG4gIC8qKiBHZXRzIGEgR2l0aHViIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSByZWxlYXNlIG5vdGVzIGluIHRoZSBnaXZlbiByZWYuICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEdpdGh1YkNoYW5nZWxvZ1VybEZvclJlZihyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcmVmOiBzdHJpbmcpIHtcbiAgICBjb25zdCBiYXNlVXJsID0gZ2V0RmlsZUNvbnRlbnRzVXJsKHRoaXMuZ2l0LCByZWYsIGNoYW5nZWxvZ1BhdGgpO1xuICAgIGNvbnN0IHVybEZyYWdtZW50ID0gYXdhaXQgcmVsZWFzZU5vdGVzLmdldFVybEZyYWdtZW50Rm9yUmVsZWFzZSgpO1xuICAgIHJldHVybiBgJHtiYXNlVXJsfSMke3VybEZyYWdtZW50fWA7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSByZWxlYXNlTm90ZXMgVGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2ZXJzaW9uIGJlaW5nIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHB1Ymxpc2hCcmFuY2ggTmFtZSBvZiB0aGUgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIG5ldyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gbnBtRGlzdFRhZyBOUE0gZGlzdCB0YWcgd2hlcmUgdGhlIHZlcnNpb24gc2hvdWxkIGJlIHB1Ymxpc2hlZCB0by5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZEFuZFB1Ymxpc2goXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgcHVibGlzaEJyYW5jaDogc3RyaW5nLFxuICAgIG5wbURpc3RUYWc6IE5wbURpc3RUYWcsXG4gICkge1xuICAgIGNvbnN0IHZlcnNpb25CdW1wQ29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSkpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgTGF0ZXN0IGNvbW1pdCBpbiBcIiR7cHVibGlzaEJyYW5jaH1cIiBicmFuY2ggaXMgbm90IGEgc3RhZ2luZyBjb21taXQuYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuJykpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIHB1Ymxpc2ggYnJhbmNoIGFuZCBidWlsZCB0aGUgcmVsZWFzZSBwYWNrYWdlcy5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwcm9qZWN0IGRlcGVuZGVuY2llcyBmb3IgdGhlIHB1Ymxpc2ggYnJhbmNoLCBhbmQgdGhlbiBidWlsZCB0aGUgcmVsZWFzZVxuICAgIC8vIHBhY2thZ2VzLiBOb3RlIHRoYXQgd2UgZG8gbm90IGRpcmVjdGx5IGNhbGwgdGhlIGJ1aWxkIHBhY2thZ2VzIGZ1bmN0aW9uIGZyb20gdGhlIHJlbGVhc2VcbiAgICAvLyBjb25maWcuIFdlIG9ubHkgd2FudCB0byBidWlsZCBhbmQgcHVibGlzaCBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGluIHRoZSBnaXZlblxuICAgIC8vIHB1Ymxpc2ggYnJhbmNoLiBlLmcuIGNvbnNpZGVyIHdlIHB1Ymxpc2ggcGF0Y2ggdmVyc2lvbiBhbmQgYSBuZXcgcGFja2FnZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgaW4gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBuZXcgcGFja2FnZSB3b3VsZCBub3QgYmUgcGFydCBvZiB0aGUgcGF0Y2ggYnJhbmNoLFxuICAgIC8vIHNvIHdlIGNhbm5vdCBidWlsZCBhbmQgcHVibGlzaCBpdC5cbiAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMocmVsZWFzZU5vdGVzLnZlcnNpb24sIGJ1aWx0UGFja2FnZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBuZXcgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIHJlbGVhc2VOb3RlcyxcbiAgICAgIHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgICAgbnBtRGlzdFRhZyA9PT0gJ25leHQnLFxuICAgICk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGJ1aWx0IHBhY2thZ2VzIGFuZCBwdWJsaXNoIHRoZW0gdG8gTlBNLlxuICAgIGZvciAoY29uc3QgYnVpbHRQYWNrYWdlIG9mIGJ1aWx0UGFja2FnZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShidWlsdFBhY2thZ2UsIG5wbURpc3RUYWcpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUHVibGlzaGVkIGFsbCBwYWNrYWdlcyBzdWNjZXNzZnVsbHknKSk7XG4gIH1cblxuICAvKiogUHVibGlzaGVzIHRoZSBnaXZlbiBidWlsdCBwYWNrYWdlIHRvIE5QTSB3aXRoIHRoZSBzcGVjaWZpZWQgTlBNIGRpc3QgdGFnLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0ocGtnOiBCdWlsdFBhY2thZ2UsIG5wbURpc3RUYWc6IE5wbURpc3RUYWcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgaW5mbyhncmVlbihgICDinJMgICBTdWNjZXNzZnVsbHkgcHVibGlzaGVkIFwiJHtwa2cubmFtZX0uYCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogY29tbWl0U2hhLFxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG5cbiAgLyoqIFZlcmlmeSB0aGUgdmVyc2lvbiBvZiBlYWNoIGdlbmVyYXRlZCBwYWNrYWdlIGV4YWN0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlQYWNrYWdlVmVyc2lvbnModmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdKSB7XG4gICAgLyoqIEV4cGVyaW1lbnRhbCBlcXVpdmFsZW50IHZlcnNpb24gZm9yIHBhY2thZ2VzIGNyZWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgdmVyc2lvbi4gKi9cbiAgICBjb25zdCBleHBlcmltZW50YWxWZXJzaW9uID0gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKHZlcnNpb24pO1xuXG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID0gSlNPTi5wYXJzZShcbiAgICAgICAgYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpLFxuICAgICAgKSBhcyB7dmVyc2lvbjogc3RyaW5nOyBba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gICAgICBjb25zdCBtaXNtYXRjaGVzVmVyc2lvbiA9IHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuICAgICAgY29uc3QgbWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCA9IGV4cGVyaW1lbnRhbFZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuXG4gICAgICBpZiAobWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCAmJiBtaXNtYXRjaGVzVmVyc2lvbikge1xuICAgICAgICBlcnJvcihyZWQoJ1RoZSBidWlsdCBwYWNrYWdlIHZlcnNpb24gZG9lcyBub3QgbWF0Y2ggdGhlIHZlcnNpb24gYmVpbmcgcmVsZWFzZWQuJykpO1xuICAgICAgICBlcnJvcihgICBSZWxlYXNlIFZlcnNpb246ICAgJHt2ZXJzaW9uLnZlcnNpb259ICgke2V4cGVyaW1lbnRhbFZlcnNpb24udmVyc2lvbn0pYCk7XG4gICAgICAgIGVycm9yKGAgIEdlbmVyYXRlZCBWZXJzaW9uOiAke3BhY2thZ2VKc29uVmVyc2lvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=