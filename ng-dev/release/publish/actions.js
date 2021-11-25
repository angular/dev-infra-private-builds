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
const pull_request_state_1 = require("./pull-request-state");
const version_tags_1 = require("../versioning/version-tags");
const github_1 = require("../../utils/git/github");
const constants_2 = require("../../utils/constants");
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
        const pkgJsonPath = (0, path_1.join)(this.projectDir, constants_2.workspaceRelativePackageJsonPath);
        const pkgJson = JSON.parse(await fs_1.promises.readFile(pkgJsonPath, 'utf8'));
        return new semver.SemVer(pkgJson.version);
    }
    /** Updates the version in the project top-level `package.json` file. */
    async updateProjectVersion(newVersion) {
        const pkgJsonPath = (0, path_1.join)(this.projectDir, constants_2.workspaceRelativePackageJsonPath);
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
        await this.createCommit(commitMessage, [
            constants_2.workspaceRelativePackageJsonPath,
            release_notes_1.workspaceRelativeChangelogPath,
        ]);
        (0, console_1.info)((0, console_1.green)(`  ✓   Created release commit for: "${newVersion}".`));
    }
    /**
     * Gets an owned fork for the configured project of the authenticated user. Aborts the
     * process with an error if no fork could be found.
     */
    async _getForkOfAuthenticatedUser() {
        try {
            return this.git.getForkOfAuthenticatedUser();
        }
        catch {
            const { owner, name } = this.git.remoteConfig;
            (0, console_1.error)((0, console_1.red)('  ✘   Unable to find fork for currently authenticated user.'));
            (0, console_1.error)((0, console_1.red)(`      Please ensure you created a fork of: ${owner}/${name}.`));
            throw new actions_error_1.FatalReleaseActionError();
        }
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
    /** Installs all Yarn dependencies in the current branch. */
    async installDependenciesForCurrentBranch() {
        const nodeModulesDir = (0, path_1.join)(this.projectDir, 'node_modules');
        // Note: We delete all contents of the `node_modules` first. This is necessary
        // because Yarn could preserve extraneous/outdated nested modules that will cause
        // unexpected build failures with the NodeJS Bazel `@npm` workspace generation.
        // This is a workaround for: https://github.com/yarnpkg/yarn/issues/8146. Even though
        // we might be able to fix this with Yarn 2+, it is reasonable ensuring clean node modules.
        await fs_1.promises.rm(nodeModulesDir, { force: true, recursive: true, maxRetries: 3 });
        await (0, external_commands_1.invokeYarnInstallCommand)(this.projectDir);
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
        // Note: `--no-verify` skips the majority of commit hooks here, but there are hooks
        // like `prepare-commit-message` which still run. We have set the `HUSKY=0` environment
        // variable at the start of the publish command to ignore such hooks as well.
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
        const releaseNotes = await release_notes_1.ReleaseNotes.forRange(this.git, newVersion, releaseNotesCompareTag, 'HEAD');
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
        await this.createCommit(commitMessage, [release_notes_1.workspaceRelativeChangelogPath]);
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
        const baseUrl = (0, github_urls_1.getFileContentsUrl)(this.git, ref, release_notes_1.workspaceRelativeChangelogPath);
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
        // Install the project dependencies for the publish branch.
        await this.installDependenciesForCurrentBranch();
        // Note that we do not directly call the build packages function from the release
        // config. We only want to build and publish packages that have been configured in the given
        // publish branch. e.g. consider we publish patch version and a new package has been
        // created in the `next` branch. The new package would not be part of the patch branch,
        // so we cannot build and publish it.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBa0M7QUFDbEMsK0JBQTBCO0FBQzFCLGlDQUFpQztBQUVqQyxpREFBZ0c7QUFDaEcsaURBQTRDO0FBRTVDLDZEQUlxQztBQUNyQywrQ0FBNEQ7QUFFNUQsMERBQW9GO0FBR3BGLDJEQUF3RDtBQUV4RCxtREFBdUY7QUFDdkYscURBQW1HO0FBQ25HLDJDQUErRTtBQUMvRSwyREFBd0Y7QUFDeEYsNkRBQXlEO0FBQ3pELDZEQUFtRTtBQUNuRSxtREFBNkQ7QUFDN0QscURBQXVFO0FBNEJ2RTs7OztHQUlHO0FBQ0gsTUFBc0IsYUFBYTtJQWtCakMsWUFDWSxNQUEyQixFQUMzQixHQUEyQixFQUMzQixNQUFxQixFQUNyQixVQUFrQjtRQUhsQixXQUFNLEdBQU4sTUFBTSxDQUFxQjtRQUMzQixRQUFHLEdBQUgsR0FBRyxDQUF3QjtRQUMzQixXQUFNLEdBQU4sTUFBTSxDQUFlO1FBQ3JCLGVBQVUsR0FBVixVQUFVLENBQVE7UUFQOUIsbURBQW1EO1FBQzNDLG9CQUFlLEdBQXNCLElBQUksQ0FBQztJQU8vQyxDQUFDO0lBdEJKLHNEQUFzRDtJQUN0RCxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQTRCLEVBQUUsT0FBc0I7UUFDbEUsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBcUJELDBFQUEwRTtJQUNsRSxLQUFLLENBQUMsaUJBQWlCO1FBQzdCLE1BQU0sV0FBVyxHQUFHLElBQUEsV0FBSSxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsNENBQWdDLENBQUMsQ0FBQztRQUM1RSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxX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LENBQUM7SUFDN0UsQ0FBQztJQUVELHdGQUF3RjtJQUNoRixLQUFLLENBQUMsc0JBQXNCLENBQUMsT0FBc0IsRUFBRSxRQUF3QjtRQUNuRixzRkFBc0Y7UUFDdEYsTUFBTSxtQkFBbUIsR0FBRyxJQUFBLGlDQUF3QixFQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTlELEtBQUssTUFBTSxHQUFHLElBQUksUUFBUSxFQUFFO1lBQzFCLE1BQU0sRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUM5QyxNQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsSUFBQSxXQUFJLEVBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDdkIsQ0FBQztZQUUzQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEUsTUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckYsSUFBSSxzQkFBc0IsSUFBSSxpQkFBaUIsRUFBRTtnQkFDL0MsSUFBQSxlQUFLLEVBQUMsSUFBQSxhQUFHLEVBQUMsc0VBQXNFLENBQUMsQ0FBQyxDQUFDO2dCQUNuRixJQUFBLGVBQUssRUFBQyx3QkFBd0IsT0FBTyxDQUFDLE9BQU8sS0FBSyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRixJQUFBLGVBQUssRUFBQyx3QkFBd0Isa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzthQUNyQztTQUNGO0lBQ0gsQ0FBQztDQUNGO0FBemxCRCxzQ0F5bEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgZnN9IGZyb20gJ2ZzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1NwaW5uZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NwaW5uZXInO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7XG4gIGdldEZpbGVDb250ZW50c1VybCxcbiAgZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCxcbiAgZ2V0UmVwb3NpdG9yeUdpdFVybCxcbn0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7Y3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyfSBmcm9tICcuLi8uLi91dGlscy9zZW12ZXInO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2UsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge1JlbGVhc2VOb3Rlcywgd29ya3NwYWNlUmVsYXRpdmVDaGFuZ2Vsb2dQYXRofSBmcm9tICcuLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2dpdGh1YlJlbGVhc2VCb2R5TGltaXQsIHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2ludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcbmltcG9ydCB7Z2V0UmVsZWFzZVRhZ0ZvclZlcnNpb259IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi10YWdzJztcbmltcG9ydCB7R2l0aHViQXBpUmVxdWVzdEVycm9yfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcbmltcG9ydCB7d29ya3NwYWNlUmVsYXRpdmVQYWNrYWdlSnNvblBhdGh9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnN0YW50cyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcgKC4uLmFyZ3M6IFtBY3RpdmVSZWxlYXNlVHJhaW5zLCBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LCBSZWxlYXNlQ29uZmlnLCBzdHJpbmddKTogVDtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhIHJlbGVhc2UgYWN0aW9uLiBBIHJlbGVhc2UgYWN0aW9uIGlzIHNlbGVjdGFibGUgYnkgdGhlIGNhcmV0YWtlclxuICogaWYgYWN0aXZlLCBhbmQgY2FuIHBlcmZvcm0gY2hhbmdlcyBmb3IgcmVsZWFzaW5nLCBzdWNoIGFzIHN0YWdpbmcgYSByZWxlYXNlLCBidW1waW5nIHRoZVxuICogdmVyc2lvbiwgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZywgYnJhbmNoaW5nIG9mZiBmcm9tIHRoZSBtYWluIGJyYW5jaC4gZXRjLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBzdGF0aWMgaXNBY3RpdmUoX3RyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucywgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIGFic3RyYWN0IGdldERlc2NyaXB0aW9uKCk6IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBnaXZlbiByZWxlYXNlIGFjdGlvbi5cbiAgICogQHRocm93cyB7VXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIHVzZXIgbWFudWFsbHkgYWJvcnRlZCB0aGUgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGEgZmF0YWwgZXJyb3IuXG4gICAqL1xuICBhYnN0cmFjdCBwZXJmb3JtKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqIENhY2hlZCBmb3VuZCBmb3JrIG9mIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByaXZhdGUgX2NhY2hlZEZvcmtSZXBvOiBHaXRodWJSZXBvIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgICBwcm90ZWN0ZWQgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsXG4gICAgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0UHJvamVjdFZlcnNpb24oKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgd29ya3NwYWNlUmVsYXRpdmVQYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPSBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7XG4gICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICAgfTtcbiAgICByZXR1cm4gbmV3IHNlbXZlci5TZW1WZXIocGtnSnNvbi52ZXJzaW9uKTtcbiAgfVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHdvcmtzcGFjZVJlbGF0aXZlUGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge1xuICAgICAgdmVyc2lvbjogc3RyaW5nO1xuICAgICAgW2tleTogc3RyaW5nXTogYW55O1xuICAgIH07XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhOiB7Y29tbWl0fSxcbiAgICB9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7XG4gICAgICBkYXRhOiB7c3RhdGV9LFxuICAgIH0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBjb21taXRTaGEsXG4gICAgfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoXG4gICAgICAgICAgYCAg4pyYICAgQ2Fubm90IHN0YWdlIHJlbGVhc2UuIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIGRvZXMgbm90IHBhc3MgYWxsIGdpdGh1YiBgICtcbiAgICAgICAgICAgICdzdGF0dXMgY2hlY2tzLiBQbGVhc2UgbWFrZSBzdXJlIHRoaXMgY29tbWl0IHBhc3NlcyBhbGwgY2hlY2tzIGJlZm9yZSByZS1ydW5uaW5nLicsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgZXJyb3IoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApO1xuXG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oXG4gICAgICAgICAgeWVsbG93KFxuICAgICAgICAgICAgJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIGZhaWxpbmcgQ0kgY2hlY2tzLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJyxcbiAgICAgICAgICApLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICByZWQoXG4gICAgICAgICAgYCAg4pyYICAgQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgc3RpbGwgaGFzIHBlbmRpbmcgZ2l0aHViIHN0YXR1c2VzIHRoYXQgYCArXG4gICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCkpO1xuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdygnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgcGVuZGluZyBDSSwgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBVcHN0cmVhbSBjb21taXQgaXMgcGFzc2luZyBhbGwgZ2l0aHViIHN0YXR1cyBjaGVja3MuJykpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oXG4gICAgICB5ZWxsb3coXG4gICAgICAgICcgIOKaoCAgIFBsZWFzZSByZXZpZXcgdGhlIGNoYW5nZWxvZyBhbmQgZW5zdXJlIHRoYXQgdGhlIGxvZyBjb250YWlucyBvbmx5IGNoYW5nZXMgJyArXG4gICAgICAgICAgJ3RoYXQgYXBwbHkgdG8gdGhlIHB1YmxpYyBBUEkgc3VyZmFjZS4gTWFudWFsIGNoYW5nZXMgY2FuIGJlIG1hZGUuIFdoZW4gZG9uZSwgcGxlYXNlICcgK1xuICAgICAgICAgICdwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy4nLFxuICAgICAgKSxcbiAgICApO1xuXG4gICAgaWYgKCEoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gcHJvY2VlZCBhbmQgY29tbWl0IHRoZSBjaGFuZ2VzPycpKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbXG4gICAgICB3b3Jrc3BhY2VSZWxhdGl2ZVBhY2thZ2VKc29uUGF0aCxcbiAgICAgIHdvcmtzcGFjZVJlbGF0aXZlQ2hhbmdlbG9nUGF0aCxcbiAgICBdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdGhpcy5naXQuZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGJyYW5jaCBuYW1lIGlzIHJlc2VydmVkIGluIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbzogR2l0aHViUmVwbywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIGJyYW5jaDogbmFtZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgdGhlIGVycm9yIGhhcyBhIGBzdGF0dXNgIHByb3BlcnR5IHNldCB0byBgNDA0YCwgdGhlbiB3ZSBrbm93IHRoYXQgdGhlIGJyYW5jaFxuICAgICAgLy8gZG9lcyBub3QgZXhpc3QuIE90aGVyd2lzZSwgaXQgbWlnaHQgYmUgYW4gQVBJIGVycm9yIHRoYXQgd2Ugd2FudCB0byByZXBvcnQvcmUtdGhyb3cuXG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIEdpdGh1YkFwaVJlcXVlc3RFcnJvciAmJiBlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKFxuICAgIHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG87IGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwoXG4gICAgICB7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSxcbiAgICAgIHRoaXMuZ2l0LmdpdGh1YlRva2VuLFxuICAgICk7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICAgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgYm9keT86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKFxuICAgIHtpZH06IFB1bGxSZXF1ZXN0LFxuICAgIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBuZXcgU3Bpbm5lcihgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIG1lcmdlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJTdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHJlbGVhc2VOb3Rlcy5wcmVwZW5kRW50cnlUb0NoYW5nZWxvZ0ZpbGUoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgdGhlIGNoYW5nZWxvZyB0byBjYXB0dXJlIGNoYW5nZXMgZm9yIFwiJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIG91dCBhbiB1cHN0cmVhbSBicmFuY2ggd2l0aCBhIGRldGFjaGVkIGhlYWQuICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dFVwc3RyZWFtQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBicmFuY2hOYW1lXSk7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLXEnLCAnRkVUQ0hfSEVBRCcsICctLWRldGFjaCddKTtcbiAgfVxuXG4gIC8qKiBJbnN0YWxscyBhbGwgWWFybiBkZXBlbmRlbmNpZXMgaW4gdGhlIGN1cnJlbnQgYnJhbmNoLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgaW5zdGFsbERlcGVuZGVuY2llc0ZvckN1cnJlbnRCcmFuY2goKSB7XG4gICAgY29uc3Qgbm9kZU1vZHVsZXNEaXIgPSBqb2luKHRoaXMucHJvamVjdERpciwgJ25vZGVfbW9kdWxlcycpO1xuICAgIC8vIE5vdGU6IFdlIGRlbGV0ZSBhbGwgY29udGVudHMgb2YgdGhlIGBub2RlX21vZHVsZXNgIGZpcnN0LiBUaGlzIGlzIG5lY2Vzc2FyeVxuICAgIC8vIGJlY2F1c2UgWWFybiBjb3VsZCBwcmVzZXJ2ZSBleHRyYW5lb3VzL291dGRhdGVkIG5lc3RlZCBtb2R1bGVzIHRoYXQgd2lsbCBjYXVzZVxuICAgIC8vIHVuZXhwZWN0ZWQgYnVpbGQgZmFpbHVyZXMgd2l0aCB0aGUgTm9kZUpTIEJhemVsIGBAbnBtYCB3b3Jrc3BhY2UgZ2VuZXJhdGlvbi5cbiAgICAvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBmb3I6IGh0dHBzOi8vZ2l0aHViLmNvbS95YXJucGtnL3lhcm4vaXNzdWVzLzgxNDYuIEV2ZW4gdGhvdWdoXG4gICAgLy8gd2UgbWlnaHQgYmUgYWJsZSB0byBmaXggdGhpcyB3aXRoIFlhcm4gMissIGl0IGlzIHJlYXNvbmFibGUgZW5zdXJpbmcgY2xlYW4gbm9kZSBtb2R1bGVzLlxuICAgIGF3YWl0IGZzLnJtKG5vZGVNb2R1bGVzRGlyLCB7Zm9yY2U6IHRydWUsIHJlY3Vyc2l2ZTogdHJ1ZSwgbWF4UmV0cmllczogM30pO1xuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgZmlsZXMgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSBmb3IgdGhlIGNyZWF0ZWQgY29tbWl0XG4gICAqIEBwYXJhbSBmaWxlcyBMaXN0IG9mIHByb2plY3QtcmVsYXRpdmUgZmlsZSBwYXRocyB0byBiZSBjb21taXR0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlQ29tbWl0KG1lc3NhZ2U6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgLy8gTm90ZTogYGdpdCBhZGRgIHdvdWxkIG5vdCBiZSBuZWVkZWQgaWYgdGhlIGZpbGVzIGFyZSBhbHJlYWR5IGtub3duIHRvXG4gICAgLy8gR2l0LCBidXQgdGhlIHNwZWNpZmllZCBmaWxlcyBjb3VsZCBhbHNvIGJlIG5ld2x5IGNyZWF0ZWQsIGFuZCB1bmtub3duLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2FkZCcsIC4uLmZpbGVzXSk7XG4gICAgLy8gTm90ZTogYC0tbm8tdmVyaWZ5YCBza2lwcyB0aGUgbWFqb3JpdHkgb2YgY29tbWl0IGhvb2tzIGhlcmUsIGJ1dCB0aGVyZSBhcmUgaG9va3NcbiAgICAvLyBsaWtlIGBwcmVwYXJlLWNvbW1pdC1tZXNzYWdlYCB3aGljaCBzdGlsbCBydW4uIFdlIGhhdmUgc2V0IHRoZSBgSFVTS1k9MGAgZW52aXJvbm1lbnRcbiAgICAvLyB2YXJpYWJsZSBhdCB0aGUgc3RhcnQgb2YgdGhlIHB1Ymxpc2ggY29tbWFuZCB0byBpZ25vcmUgc3VjaCBob29rcyBhcyB3ZWxsLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctcScsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhIHB1bGwgcmVxdWVzdFxuICAgKiB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLiBBc3N1bWVzIHRoZSBzdGFnaW5nIGJyYW5jaCBpcyBhbHJlYWR5IGNoZWNrZWQtb3V0LlxuICAgKlxuICAgKiBAcGFyYW0gbmV3VmVyc2lvbiBOZXcgdmVyc2lvbiB0byBiZSBzdGFnZWQuXG4gICAqIEBwYXJhbSBjb21wYXJlVmVyc2lvbkZvclJlbGVhc2VOb3RlcyBWZXJzaW9uIHVzZWQgZm9yIGNvbXBhcmluZyB3aXRoIHRoZSBjdXJyZW50XG4gICAqICAgYEhFQURgIGluIG9yZGVyIGJ1aWxkIHRoZSByZWxlYXNlIG5vdGVzLlxuICAgKiBAcGFyYW0gcHVsbFJlcXVlc3RUYXJnZXRCcmFuY2ggQnJhbmNoIHRoZSBwdWxsIHJlcXVlc3Qgc2hvdWxkIHRhcmdldC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsXG4gICAgY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXM6IHNlbXZlci5TZW1WZXIsXG4gICAgcHVsbFJlcXVlc3RUYXJnZXRCcmFuY2g6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXM7IHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNDb21wYXJlVGFnID0gZ2V0UmVsZWFzZVRhZ0ZvclZlcnNpb24oY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gRmV0Y2ggdGhlIGNvbXBhcmUgdGFnIHNvIHRoYXQgY29tbWl0cyBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMgY2FuIGJlIGRldGVybWluZWQuXG4gICAgLy8gV2UgZm9yY2libHkgb3ZlcnJpZGUgZXhpc3RpbmcgbG9jYWwgdGFncyB0aGF0IGFyZSBuYW1lZCBzaW1pbGFyIGFzIHdlIHdpbGwgZmV0Y2hcbiAgICAvLyB0aGUgY29ycmVjdCB0YWcgZm9yIHJlbGVhc2Ugbm90ZXMgY29tcGFyaXNvbiBmcm9tIHRoZSB1cHN0cmVhbSByZW1vdGUuXG4gICAgdGhpcy5naXQucnVuKFtcbiAgICAgICdmZXRjaCcsXG4gICAgICAnLS1mb3JjZScsXG4gICAgICB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksXG4gICAgICBgcmVmcy90YWdzLyR7cmVsZWFzZU5vdGVzQ29tcGFyZVRhZ306cmVmcy90YWdzLyR7cmVsZWFzZU5vdGVzQ29tcGFyZVRhZ31gLFxuICAgIF0pO1xuXG4gICAgLy8gQnVpbGQgcmVsZWFzZSBub3RlcyBmb3IgY29tbWl0cyBmcm9tIGA8cmVsZWFzZU5vdGVzQ29tcGFyZVRhZz4uLkhFQURgLlxuICAgIGNvbnN0IHJlbGVhc2VOb3RlcyA9IGF3YWl0IFJlbGVhc2VOb3Rlcy5mb3JSYW5nZShcbiAgICAgIHRoaXMuZ2l0LFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIHJlbGVhc2VOb3Rlc0NvbXBhcmVUYWcsXG4gICAgICAnSEVBRCcsXG4gICAgKTtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHB1bGxSZXF1ZXN0VGFyZ2V0QnJhbmNoLFxuICAgICAgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gLFxuICAgICk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiB7cmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICpcbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gTmV3IHZlcnNpb24gdG8gYmUgc3RhZ2VkLlxuICAgKiBAcGFyYW0gY29tcGFyZVZlcnNpb25Gb3JSZWxlYXNlTm90ZXMgVmVyc2lvbiB1c2VkIGZvciBjb21wYXJpbmcgd2l0aCBgSEVBRGAgb2ZcbiAgICogICB0aGUgc3RhZ2luZyBicmFuY2ggaW4gb3JkZXIgYnVpbGQgdGhlIHJlbGVhc2Ugbm90ZXMuXG4gICAqIEBwYXJhbSBzdGFnaW5nQnJhbmNoIEJyYW5jaCB3aXRoaW4gdGhlIG5ldyB2ZXJzaW9uIHNob3VsZCBiZSBzdGFnZWQuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihcbiAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLFxuICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzOiBzZW12ZXIuU2VtVmVyLFxuICAgIHN0YWdpbmdCcmFuY2g6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXM7IHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV3VmVyc2lvbixcbiAgICAgIGNvbXBhcmVWZXJzaW9uRm9yUmVsZWFzZU5vdGVzLFxuICAgICAgc3RhZ2luZ0JyYW5jaCxcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBzdGFnaW5nQnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFt3b3Jrc3BhY2VSZWxhdGl2ZUNoYW5nZWxvZ1BhdGhdKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdCBmb3I6IFwiJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1cIi5gKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkIGJ5IHRoZSBjYXJldGFrZXIuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBuZXh0QnJhbmNoLFxuICAgICAgYGNoYW5nZWxvZy1jaGVycnktcGljay0ke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICBjb21taXRNZXNzYWdlLFxuICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgYGJyYW5jaCAoJHtuZXh0QnJhbmNofSkuYCxcbiAgICApO1xuXG4gICAgaW5mbyhcbiAgICAgIGdyZWVuKFxuICAgICAgICBgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cgaW50byBcIiR7bmV4dEJyYW5jaH1cIiBgICtcbiAgICAgICAgICAnaGFzIGJlZW4gY3JlYXRlZC4nLFxuICAgICAgKSxcbiAgICApO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgUHVsbCBSZXF1ZXN0IHRvIGJlIG1lcmdlZC5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQocHVsbFJlcXVlc3QpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWRcbiAgICogYnkgdGFnZ2luZyB0aGUgdmVyc2lvbiBidW1wIGNvbW1pdCwgYW5kIGJ5IGNyZWF0aW5nIHRoZSByZWxlYXNlIGVudHJ5LlxuICAgKlxuICAgKiBFeHBlY3RzIHRoZSB2ZXJzaW9uIGJ1bXAgY29tbWl0IGFuZCBjaGFuZ2Vsb2cgdG8gYmUgYXZhaWxhYmxlIGluIHRoZVxuICAgKiB1cHN0cmVhbSByZW1vdGUuXG4gICAqXG4gICAqIEBwYXJhbSByZWxlYXNlTm90ZXMgVGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2ZXJzaW9uIGJlaW5nIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHZlcnNpb25CdW1wQ29tbWl0U2hhIENvbW1pdCB0aGF0IGJ1bXBlZCB0aGUgdmVyc2lvbi4gVGhlIHJlbGVhc2UgdGFnXG4gICAqICAgd2lsbCBwb2ludCB0byB0aGlzIGNvbW1pdC5cbiAgICogQHBhcmFtIGlzUHJlcmVsZWFzZSBXaGV0aGVyIHRoZSBuZXcgdmVyc2lvbiBpcyBwdWJsaXNoZWQgYXMgYSBwcmUtcmVsZWFzZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLFxuICAgIHZlcnNpb25CdW1wQ29tbWl0U2hhOiBzdHJpbmcsXG4gICAgaXNQcmVyZWxlYXNlOiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCB0YWdOYW1lID0gZ2V0UmVsZWFzZVRhZ0ZvclZlcnNpb24ocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5naXQuY3JlYXRlUmVmKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogYHJlZnMvdGFncy8ke3RhZ05hbWV9YCxcbiAgICAgIHNoYTogdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBUYWdnZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgbGV0IHJlbGVhc2VCb2R5ID0gYXdhaXQgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpO1xuXG4gICAgLy8gSWYgdGhlIHJlbGVhc2UgYm9keSBleGNlZWRzIHRoZSBHaXRodWIgYm9keSBsaW1pdCwgd2UganVzdCBwcm92aWRlXG4gICAgLy8gYSBsaW5rIHRvIHRoZSBjaGFuZ2Vsb2cgZW50cnkgaW4gdGhlIEdpdGh1YiByZWxlYXNlIGVudHJ5LlxuICAgIGlmIChyZWxlYXNlQm9keS5sZW5ndGggPiBnaXRodWJSZWxlYXNlQm9keUxpbWl0KSB7XG4gICAgICBjb25zdCByZWxlYXNlTm90ZXNVcmwgPSBhd2FpdCB0aGlzLl9nZXRHaXRodWJDaGFuZ2Vsb2dVcmxGb3JSZWYocmVsZWFzZU5vdGVzLCB0YWdOYW1lKTtcbiAgICAgIHJlbGVhc2VCb2R5ID1cbiAgICAgICAgYFJlbGVhc2Ugbm90ZXMgYXJlIHRvbyBsYXJnZSB0byBiZSBjYXB0dXJlZCBoZXJlLiBgICtcbiAgICAgICAgYFtWaWV3IGFsbCBjaGFuZ2VzIGhlcmVdKCR7cmVsZWFzZU5vdGVzVXJsfSkuYDtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuY3JlYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBuYW1lOiBgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgICAgcHJlcmVsZWFzZTogaXNQcmVyZWxlYXNlLFxuICAgICAgYm9keTogcmVsZWFzZUJvZHksXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKiogR2V0cyBhIEdpdGh1YiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcmVsZWFzZSBub3RlcyBpbiB0aGUgZ2l2ZW4gcmVmLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRHaXRodWJDaGFuZ2Vsb2dVcmxGb3JSZWYocmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHJlZjogc3RyaW5nKSB7XG4gICAgY29uc3QgYmFzZVVybCA9IGdldEZpbGVDb250ZW50c1VybCh0aGlzLmdpdCwgcmVmLCB3b3Jrc3BhY2VSZWxhdGl2ZUNoYW5nZWxvZ1BhdGgpO1xuICAgIGNvbnN0IHVybEZyYWdtZW50ID0gYXdhaXQgcmVsZWFzZU5vdGVzLmdldFVybEZyYWdtZW50Rm9yUmVsZWFzZSgpO1xuICAgIHJldHVybiBgJHtiYXNlVXJsfSMke3VybEZyYWdtZW50fWA7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSByZWxlYXNlTm90ZXMgVGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2ZXJzaW9uIGJlaW5nIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHB1Ymxpc2hCcmFuY2ggTmFtZSBvZiB0aGUgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIG5ldyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gbnBtRGlzdFRhZyBOUE0gZGlzdCB0YWcgd2hlcmUgdGhlIHZlcnNpb24gc2hvdWxkIGJlIHB1Ymxpc2hlZCB0by5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZEFuZFB1Ymxpc2goXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgcHVibGlzaEJyYW5jaDogc3RyaW5nLFxuICAgIG5wbURpc3RUYWc6IE5wbURpc3RUYWcsXG4gICkge1xuICAgIGNvbnN0IHZlcnNpb25CdW1wQ29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICBpZiAoIShhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSkpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgTGF0ZXN0IGNvbW1pdCBpbiBcIiR7cHVibGlzaEJyYW5jaH1cIiBicmFuY2ggaXMgbm90IGEgc3RhZ2luZyBjb21taXQuYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuJykpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIHB1Ymxpc2ggYnJhbmNoIGFuZCBidWlsZCB0aGUgcmVsZWFzZSBwYWNrYWdlcy5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHVibGlzaEJyYW5jaCk7XG4gICAgLy8gSW5zdGFsbCB0aGUgcHJvamVjdCBkZXBlbmRlbmNpZXMgZm9yIHRoZSBwdWJsaXNoIGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmluc3RhbGxEZXBlbmRlbmNpZXNGb3JDdXJyZW50QnJhbmNoKCk7XG5cbiAgICAvLyBOb3RlIHRoYXQgd2UgZG8gbm90IGRpcmVjdGx5IGNhbGwgdGhlIGJ1aWxkIHBhY2thZ2VzIGZ1bmN0aW9uIGZyb20gdGhlIHJlbGVhc2VcbiAgICAvLyBjb25maWcuIFdlIG9ubHkgd2FudCB0byBidWlsZCBhbmQgcHVibGlzaCBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGluIHRoZSBnaXZlblxuICAgIC8vIHB1Ymxpc2ggYnJhbmNoLiBlLmcuIGNvbnNpZGVyIHdlIHB1Ymxpc2ggcGF0Y2ggdmVyc2lvbiBhbmQgYSBuZXcgcGFja2FnZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgaW4gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBuZXcgcGFja2FnZSB3b3VsZCBub3QgYmUgcGFydCBvZiB0aGUgcGF0Y2ggYnJhbmNoLFxuICAgIC8vIHNvIHdlIGNhbm5vdCBidWlsZCBhbmQgcHVibGlzaCBpdC5cbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMocmVsZWFzZU5vdGVzLnZlcnNpb24sIGJ1aWx0UGFja2FnZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBuZXcgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIHJlbGVhc2VOb3RlcyxcbiAgICAgIHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgICAgbnBtRGlzdFRhZyA9PT0gJ25leHQnLFxuICAgICk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGJ1aWx0IHBhY2thZ2VzIGFuZCBwdWJsaXNoIHRoZW0gdG8gTlBNLlxuICAgIGZvciAoY29uc3QgYnVpbHRQYWNrYWdlIG9mIGJ1aWx0UGFja2FnZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShidWlsdFBhY2thZ2UsIG5wbURpc3RUYWcpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUHVibGlzaGVkIGFsbCBwYWNrYWdlcyBzdWNjZXNzZnVsbHknKSk7XG4gIH1cblxuICAvKiogUHVibGlzaGVzIHRoZSBnaXZlbiBidWlsdCBwYWNrYWdlIHRvIE5QTSB3aXRoIHRoZSBzcGVjaWZpZWQgTlBNIGRpc3QgdGFnLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0ocGtnOiBCdWlsdFBhY2thZ2UsIG5wbURpc3RUYWc6IE5wbURpc3RUYWcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG5ldyBTcGlubmVyKGBQdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bk5wbVB1Ymxpc2gocGtnLm91dHB1dFBhdGgsIG5wbURpc3RUYWcsIHRoaXMuY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBzcGlubmVyLmNvbXBsZXRlKCk7XG4gICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFN1Y2Nlc3NmdWxseSBwdWJsaXNoZWQgXCIke3BrZy5uYW1lfS5gKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3Bpbm5lci5jb21wbGV0ZSgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogY29tbWl0U2hhLFxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG5cbiAgLyoqIFZlcmlmeSB0aGUgdmVyc2lvbiBvZiBlYWNoIGdlbmVyYXRlZCBwYWNrYWdlIGV4YWN0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlQYWNrYWdlVmVyc2lvbnModmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdKSB7XG4gICAgLyoqIEV4cGVyaW1lbnRhbCBlcXVpdmFsZW50IHZlcnNpb24gZm9yIHBhY2thZ2VzIGNyZWF0ZWQgd2l0aCB0aGUgcHJvdmlkZWQgdmVyc2lvbi4gKi9cbiAgICBjb25zdCBleHBlcmltZW50YWxWZXJzaW9uID0gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKHZlcnNpb24pO1xuXG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID0gSlNPTi5wYXJzZShcbiAgICAgICAgYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpLFxuICAgICAgKSBhcyB7dmVyc2lvbjogc3RyaW5nOyBba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gICAgICBjb25zdCBtaXNtYXRjaGVzVmVyc2lvbiA9IHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuICAgICAgY29uc3QgbWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCA9IGV4cGVyaW1lbnRhbFZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuXG4gICAgICBpZiAobWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCAmJiBtaXNtYXRjaGVzVmVyc2lvbikge1xuICAgICAgICBlcnJvcihyZWQoJ1RoZSBidWlsdCBwYWNrYWdlIHZlcnNpb24gZG9lcyBub3QgbWF0Y2ggdGhlIHZlcnNpb24gYmVpbmcgcmVsZWFzZWQuJykpO1xuICAgICAgICBlcnJvcihgICBSZWxlYXNlIFZlcnNpb246ICAgJHt2ZXJzaW9uLnZlcnNpb259ICgke2V4cGVyaW1lbnRhbFZlcnNpb24udmVyc2lvbn0pYCk7XG4gICAgICAgIGVycm9yKGAgIEdlbmVyYXRlZCBWZXJzaW9uOiAke3BhY2thZ2VKc29uVmVyc2lvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=