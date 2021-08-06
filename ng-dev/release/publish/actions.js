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
     * @param files List of project-relative file paths to be commited.
     */
    async createCommit(message, files) {
        this.git.run(['commit', '-q', '--no-verify', '-m', message, ...files]);
    }
    /**
     * Stages the specified new version for the current branch and creates a
     * pull request that targets the given base branch.
     * @returns an object describing the created pull request.
     */
    async stageVersionForBranchAndCreatePullRequest(newVersion, pullRequestBaseBranch) {
        /**
         * The current version of the project for the branch from the root package.json. This must be
         * retrieved prior to updating the project version.
         */
        const currentVersion = this.git.getMatchingTagForSemver(await this.getProjectVersion());
        const releaseNotes = await release_notes_1.ReleaseNotes.fromRange(newVersion, currentVersion, 'HEAD');
        await this.updateProjectVersion(newVersion);
        await this.prependReleaseNotesToChangelog(releaseNotes);
        await this.waitForEditsAndCreateReleaseCommit(newVersion);
        const pullRequest = await this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, `release-stage-${newVersion}`, `Bump version to "v${newVersion}" with changelog.`);
        console_1.info(console_1.green('  ✓   Release staging pull request has been created.'));
        console_1.info(console_1.yellow(`      Please ask team members to review: ${pullRequest.url}.`));
        return { releaseNotes, pullRequest };
    }
    /**
     * Checks out the specified target branch, verifies its CI status and stages
     * the specified new version in order to create a pull request.
     * @returns an object describing the created pull request.
     */
    async checkoutBranchAndStageVersion(newVersion, stagingBranch) {
        await this.verifyPassingGithubStatus(stagingBranch);
        await this.checkoutUpstreamBranch(stagingBranch);
        return await this.stageVersionForBranchAndCreatePullRequest(newVersion, stagingBranch);
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
     * Creates a Github release for the specified version in the configured project.
     * The release is created by tagging the specified commit SHA.
     */
    async _createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, prerelease) {
        const tagName = releaseNotes.version.format();
        await this.git.github.git.createRef({
            ...this.git.remoteParams,
            ref: `refs/tags/${tagName}`,
            sha: versionBumpCommitSha,
        });
        console_1.info(console_1.green(`  ✓   Tagged v${releaseNotes.version} release upstream.`));
        await this.git.github.repos.createRelease({
            ...this.git.remoteParams,
            name: `v${releaseNotes.version}`,
            tag_name: tagName,
            prerelease,
            body: await releaseNotes.getGithubReleaseEntry(),
        });
        console_1.info(console_1.green(`  ✓   Created v${releaseNotes.version} release in Github.`));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7OztHQU1HOzs7QUFFSCwyQkFBa0M7QUFDbEMsMkJBQTJCO0FBQzNCLCtCQUEwQjtBQUMxQixpQ0FBaUM7QUFFakMsaURBQWdHO0FBRWhHLDZEQUEyRjtBQUMzRiwrQ0FBNEQ7QUFFNUQsMERBQW9EO0FBR3BELDJEQUF3RDtBQUV4RCxtREFBdUY7QUFDdkYscURBQW1HO0FBQ25HLDJDQUF1RjtBQUN2RiwyREFBd0Y7QUFDeEYsdURBQTREO0FBQzVELDZEQUF5RDtBQTRCekQ7Ozs7R0FJRztBQUNILE1BQXNCLGFBQWE7SUFrQmpDLFlBQ1ksTUFBMkIsRUFDM0IsR0FBMkIsRUFDM0IsTUFBcUIsRUFDckIsVUFBa0I7UUFIbEIsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7UUFDM0IsUUFBRyxHQUFILEdBQUcsQ0FBd0I7UUFDM0IsV0FBTSxHQUFOLE1BQU0sQ0FBZTtRQUNyQixlQUFVLEdBQVYsVUFBVSxDQUFRO1FBUDlCLG1EQUFtRDtRQUMzQyxvQkFBZSxHQUFzQixJQUFJLENBQUM7SUFPL0MsQ0FBQztJQXRCSixzREFBc0Q7SUFDdEQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUE0QixFQUFFLE9BQXNCO1FBQ2xFLE1BQU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDbEMsQ0FBQztJQXFCRCwwRUFBMEU7SUFDbEUsS0FBSyxDQUFDLGlCQUFpQjtRQUM3QixNQUFNLFdBQVcsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSwyQkFBZSxDQUFDLENBQUM7UUFDM0QsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUdoRSxDQUFDO1FB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S0FBSyxDQUFDLHNCQUFzQixDQUFDLE9BQXNCLEVBQUUsUUFBd0I7UUFDbkYsc0ZBQXNGO1FBQ3RGLE1BQU0sbUJBQW1CLEdBQUcsaUNBQXdCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFFOUQsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLEVBQUU7WUFDMUIsTUFBTSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQzlDLE1BQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDdkIsQ0FBQztZQUUzQyxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEUsTUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFckYsSUFBSSxzQkFBc0IsSUFBSSxpQkFBaUIsRUFBRTtnQkFDL0MsZUFBSyxDQUFDLGFBQUcsQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLGVBQUssQ0FBQyx3QkFBd0IsT0FBTyxDQUFDLE9BQU8sS0FBSyxtQkFBbUIsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO2dCQUNsRixlQUFLLENBQUMsd0JBQXdCLGtCQUFrQixFQUFFLENBQUMsQ0FBQztnQkFDcEQsTUFBTSxJQUFJLHVDQUF1QixFQUFFLENBQUM7YUFDckM7U0FDRjtJQUNILENBQUM7Q0FDRjtBQXhoQkQsc0NBd2hCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGZzfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0F1dGhlbnRpY2F0ZWRHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9hdXRoZW50aWNhdGVkLWdpdC1jbGllbnQnO1xuaW1wb3J0IHtnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsLCBnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtjcmVhdGVFeHBlcmltZW50YWxTZW12ZXJ9IGZyb20gJy4uLy4uL3V0aWxzL3NlbXZlcic7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aCwgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7aW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcgKC4uLmFyZ3M6IFtBY3RpdmVSZWxlYXNlVHJhaW5zLCBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LCBSZWxlYXNlQ29uZmlnLCBzdHJpbmddKTogVDtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhIHJlbGVhc2UgYWN0aW9uLiBBIHJlbGVhc2UgYWN0aW9uIGlzIHNlbGVjdGFibGUgYnkgdGhlIGNhcmV0YWtlclxuICogaWYgYWN0aXZlLCBhbmQgY2FuIHBlcmZvcm0gY2hhbmdlcyBmb3IgcmVsZWFzaW5nLCBzdWNoIGFzIHN0YWdpbmcgYSByZWxlYXNlLCBidW1waW5nIHRoZVxuICogdmVyc2lvbiwgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZywgYnJhbmNoaW5nIG9mZiBmcm9tIHRoZSBtYWluIGJyYW5jaC4gZXRjLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBzdGF0aWMgaXNBY3RpdmUoX3RyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucywgX2NvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIGFic3RyYWN0IGdldERlc2NyaXB0aW9uKCk6IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBnaXZlbiByZWxlYXNlIGFjdGlvbi5cbiAgICogQHRocm93cyB7VXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIHVzZXIgbWFudWFsbHkgYWJvcnRlZCB0aGUgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGEgZmF0YWwgZXJyb3IuXG4gICAqL1xuICBhYnN0cmFjdCBwZXJmb3JtKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqIENhY2hlZCBmb3VuZCBmb3JrIG9mIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByaXZhdGUgX2NhY2hlZEZvcmtSZXBvOiBHaXRodWJSZXBvIHwgbnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyxcbiAgICBwcm90ZWN0ZWQgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsXG4gICAgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZyxcbiAgKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByaXZhdGUgYXN5bmMgZ2V0UHJvamVjdFZlcnNpb24oKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge1xuICAgICAgdmVyc2lvbjogc3RyaW5nO1xuICAgICAgW2tleTogc3RyaW5nXTogYW55O1xuICAgIH07XG4gICAgcmV0dXJuIG5ldyBzZW12ZXIuU2VtVmVyKHBrZ0pzb24udmVyc2lvbik7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPSBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7XG4gICAgICB2ZXJzaW9uOiBzdHJpbmc7XG4gICAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gICAgfTtcbiAgICBwa2dKc29uLnZlcnNpb24gPSBuZXdWZXJzaW9uLmZvcm1hdCgpO1xuICAgIC8vIFdyaXRlIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLiBOb3RlIHRoYXQgd2UgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmVcbiAgICAvLyB0byBhdm9pZCB1bm5lY2Vzc2FyeSBkaWZmLiBJREVzIHVzdWFsbHkgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmUuXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHBrZ0pzb25QYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwa2dKc29uLCBudWxsLCAyKX1cXG5gKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgcHJvamVjdCB2ZXJzaW9uIHRvICR7cGtnSnNvbi52ZXJzaW9ufWApKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtb3N0IHJlY2VudCBjb21taXQgb2YgYSBzcGVjaWZpZWQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHtjb21taXR9LFxuICAgIH0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogYnJhbmNoTmFtZX0pO1xuICAgIHJldHVybiBjb21taXQuc2hhO1xuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgdGhlIGxhdGVzdCBjb21taXQgZm9yIHRoZSBnaXZlbiBicmFuY2ggaXMgcGFzc2luZyBhbGwgc3RhdHVzZXMuICovXG4gIHByb3RlY3RlZCBhc3luYyB2ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHtcbiAgICAgIGRhdGE6IHtzdGF0ZX0sXG4gICAgfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21iaW5lZFN0YXR1c0ZvclJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGNvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBjb25zdCBicmFuY2hDb21taXRzVXJsID0gZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCh0aGlzLmdpdCwgYnJhbmNoTmFtZSk7XG5cbiAgICBpZiAoc3RhdGUgPT09ICdmYWlsdXJlJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgIHJlZChcbiAgICAgICAgICBgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgJ3N0YXR1cyBjaGVja3MuIFBsZWFzZSBtYWtlIHN1cmUgdGhpcyBjb21taXQgcGFzc2VzIGFsbCBjaGVja3MgYmVmb3JlIHJlLXJ1bm5pbmcuJyxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyhcbiAgICAgICAgICB5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nLFxuICAgICAgICAgICksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgIHJlZChcbiAgICAgICAgICBgICDinJggICBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBzdGlsbCBoYXMgcGVuZGluZyBnaXRodWIgc3RhdHVzZXMgdGhhdCBgICtcbiAgICAgICAgICAgICduZWVkIHRvIHN1Y2NlZWQgYmVmb3JlIHN0YWdpbmcgYSByZWxlYXNlLicsXG4gICAgICAgICksXG4gICAgICApO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKSk7XG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KCcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwZW5kaW5nIENJLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwYXNzaW5nIGFsbCBnaXRodWIgc3RhdHVzIGNoZWNrcy4nKSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgcG90ZW50aWFsIHJlbGVhc2Ugbm90ZXMgZWRpdHMgdGhhdCBuZWVkIHRvIGJlIG1hZGUuIE9uY2VcbiAgICogY29uZmlybWVkLCBhIG5ldyBjb21taXQgZm9yIHRoZSByZWxlYXNlIHBvaW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgaW5mbyhcbiAgICAgIHllbGxvdyhcbiAgICAgICAgJyAg4pqgICAgUGxlYXNlIHJldmlldyB0aGUgY2hhbmdlbG9nIGFuZCBlbnN1cmUgdGhhdCB0aGUgbG9nIGNvbnRhaW5zIG9ubHkgY2hhbmdlcyAnICtcbiAgICAgICAgICAndGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgJyArXG4gICAgICAgICAgJ3Byb2NlZWQgd2l0aCB0aGUgcHJvbXB0IGJlbG93LicsXG4gICAgICApLFxuICAgICk7XG5cbiAgICBpZiAoIShhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIGFuZCBjb21taXQgdGhlIGNoYW5nZXM/JykpKSB7XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDb21taXQgbWVzc2FnZSBmb3IgdGhlIHJlbGVhc2UgcG9pbnQuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKG5ld1ZlcnNpb24pO1xuICAgIC8vIENyZWF0ZSBhIHJlbGVhc2Ugc3RhZ2luZyBjb21taXQgaW5jbHVkaW5nIGNoYW5nZWxvZyBhbmQgdmVyc2lvbiBidW1wLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGgsIGNoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC4gQWxzbyBjYWNoZXMgdGhlIGRldGVybWluZWQgZm9ya1xuICAgKiByZXBvc2l0b3J5IGFzIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgY2Fubm90IGNoYW5nZSBkdXJpbmcgYWN0aW9uIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZWRGb3JrUmVwbyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwoZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSwge293bmVyLCBuYW1lfSk7XG4gICAgY29uc3QgZm9ya3MgPSByZXN1bHQucmVwb3NpdG9yeS5mb3Jrcy5ub2RlcztcblxuICAgIGlmIChmb3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGVuc3VyZSB5b3UgY3JlYXRlZCBhIGZvcmsgb2Y6ICR7b3duZXJ9LyR7bmFtZX0uYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9yayA9IGZvcmtzWzBdO1xuICAgIHJldHVybiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX0pO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYnJhbmNoIG5hbWUgaXMgcmVzZXJ2ZWQgaW4gdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5LiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvOiBHaXRodWJSZXBvLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgYnJhbmNoOiBuYW1lfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiB0aGUgZXJyb3IgaGFzIGEgYHN0YXR1c2AgcHJvcGVydHkgc2V0IHRvIGA0MDRgLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgYnJhbmNoXG4gICAgICAvLyBkb2VzIG5vdCBleGlzdC4gT3RoZXJ3aXNlLCBpdCBtaWdodCBiZSBhbiBBUEkgZXJyb3IgdGhhdCB3ZSB3YW50IHRvIHJlcG9ydC9yZS10aHJvdy5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKFxuICAgIHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4sXG4gICk6IFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG87IGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9IGdldFJlcG9zaXRvcnlHaXRVcmwoXG4gICAgICB7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSxcbiAgICAgIHRoaXMuZ2l0LmdpdGh1YlRva2VuLFxuICAgICk7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsXG4gICAgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLFxuICAgIHRpdGxlOiBzdHJpbmcsXG4gICAgYm9keT86IHN0cmluZyxcbiAgKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKFxuICAgIHtpZH06IFB1bGxSZXF1ZXN0LFxuICAgIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwsXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNvbW1pdChtZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctcScsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhXG4gICAqIHB1bGwgcmVxdWVzdCB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgICBwdWxsUmVxdWVzdEJhc2VCcmFuY2g6IHN0cmluZyxcbiAgKTogUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXM7IHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICAvKipcbiAgICAgKiBUaGUgY3VycmVudCB2ZXJzaW9uIG9mIHRoZSBwcm9qZWN0IGZvciB0aGUgYnJhbmNoIGZyb20gdGhlIHJvb3QgcGFja2FnZS5qc29uLiBUaGlzIG11c3QgYmVcbiAgICAgKiByZXRyaWV2ZWQgcHJpb3IgdG8gdXBkYXRpbmcgdGhlIHByb2plY3QgdmVyc2lvbi5cbiAgICAgKi9cbiAgICBjb25zdCBjdXJyZW50VmVyc2lvbiA9IHRoaXMuZ2l0LmdldE1hdGNoaW5nVGFnRm9yU2VtdmVyKGF3YWl0IHRoaXMuZ2V0UHJvamVjdFZlcnNpb24oKSk7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzID0gYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShuZXdWZXJzaW9uLCBjdXJyZW50VmVyc2lvbiwgJ0hFQUQnKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBwdWxsUmVxdWVzdEJhc2VCcmFuY2gsXG4gICAgICBgcmVsZWFzZS1zdGFnZS0ke25ld1ZlcnNpb259YCxcbiAgICAgIGBCdW1wIHZlcnNpb24gdG8gXCJ2JHtuZXdWZXJzaW9ufVwiIHdpdGggY2hhbmdlbG9nLmAsXG4gICAgKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUmVsZWFzZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgcmV0dXJuIHtyZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaCwgdmVyaWZpZXMgaXRzIENJIHN0YXR1cyBhbmQgc3RhZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gaW4gb3JkZXIgdG8gY3JlYXRlIGEgcHVsbCByZXF1ZXN0LlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24oXG4gICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcixcbiAgICBzdGFnaW5nQnJhbmNoOiBzdHJpbmcsXG4gICk6IFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzOyBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKHN0YWdpbmdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChzdGFnaW5nQnJhbmNoKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBzdGFnaW5nQnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgYSB2ZXJzaW9uIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCB0byBhIGdpdmVuIGJyYW5jaFxuICAgKiBpbnRvIHRoZSBgbmV4dGAgcHJpbWFyeSBkZXZlbG9wbWVudCBicmFuY2guIEEgcHVsbCByZXF1ZXN0IGlzIGNyZWF0ZWQgZm9yIHRoaXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3NmdWwgY3JlYXRpb24gb2YgdGhlIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2goXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgc3RhZ2luZ0JyYW5jaDogc3RyaW5nLFxuICApOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5leHRCcmFuY2gsXG4gICAgICBgY2hhbmdlbG9nLWNoZXJyeS1waWNrLSR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIGNvbW1pdE1lc3NhZ2UsXG4gICAgICBgQ2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZnJvbSB0aGUgXCIke3N0YWdpbmdCcmFuY2h9XCIgYnJhbmNoIHRvIHRoZSBuZXh0IGAgK1xuICAgICAgICBgYnJhbmNoICgke25leHRCcmFuY2h9KS5gLFxuICAgICk7XG5cbiAgICBpbmZvKFxuICAgICAgZ3JlZW4oXG4gICAgICAgIGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZyBpbnRvIFwiJHtuZXh0QnJhbmNofVwiIGAgK1xuICAgICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicsXG4gICAgICApLFxuICAgICk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBQdWxsIFJlcXVlc3QgdG8gYmUgbWVyZ2VkLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgKiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkIGJ5IHRhZ2dpbmcgdGhlIHNwZWNpZmllZCBjb21taXQgU0hBLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsXG4gICAgdmVyc2lvbkJ1bXBDb21taXRTaGE6IHN0cmluZyxcbiAgICBwcmVyZWxlYXNlOiBib29sZWFuLFxuICApIHtcbiAgICBjb25zdCB0YWdOYW1lID0gcmVsZWFzZU5vdGVzLnZlcnNpb24uZm9ybWF0KCk7XG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdpdC5jcmVhdGVSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBgcmVmcy90YWdzLyR7dGFnTmFtZX1gLFxuICAgICAgc2hhOiB2ZXJzaW9uQnVtcENvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFRhZ2dlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSB1cHN0cmVhbS5gKSk7XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuY3JlYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBuYW1lOiBgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgICAgcHJlcmVsZWFzZSxcbiAgICAgIGJvZHk6IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgaW4gR2l0aHViLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHB1Ymxpc2hlcyB0aGUgZ2l2ZW4gdmVyc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJyYW5jaC5cbiAgICogQHBhcmFtIHJlbGVhc2VOb3RlcyBUaGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIHZlcnNpb24gYmVpbmcgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gcHVibGlzaEJyYW5jaCBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgbmV3IHZlcnNpb24uXG4gICAqIEBwYXJhbSBucG1EaXN0VGFnIE5QTSBkaXN0IHRhZyB3aGVyZSB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcHVibGlzaGVkIHRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkQW5kUHVibGlzaChcbiAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcyxcbiAgICBwdWJsaXNoQnJhbmNoOiBzdHJpbmcsXG4gICAgbnBtRGlzdFRhZzogTnBtRGlzdFRhZyxcbiAgKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghKGF3YWl0IHRoaXMuX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcocmVsZWFzZU5vdGVzLnZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgcmVsZWFzZU5vdGVzLFxuICAgICAgdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgICBucG1EaXN0VGFnID09PSAnbmV4dCcsXG4gICAgKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGRlYnVnKGBTdGFydGluZyBwdWJsaXNoIG9mIFwiJHtwa2cubmFtZX1cIi5gKTtcbiAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgUHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCJgKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5OcG1QdWJsaXNoKHBrZy5vdXRwdXRQYXRoLCBucG1EaXN0VGFnLCB0aGlzLmNvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFN1Y2Nlc3NmdWxseSBwdWJsaXNoZWQgXCIke3BrZy5uYW1lfS5gKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBwdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cIi5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGNvbW1pdCByZXByZXNlbnRzIGEgc3RhZ2luZyBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb21taXRTaGE6IHN0cmluZykge1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBjb21taXRTaGEsXG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICAvKiogRXhwZXJpbWVudGFsIGVxdWl2YWxlbnQgdmVyc2lvbiBmb3IgcGFja2FnZXMgY3JlYXRlZCB3aXRoIHRoZSBwcm92aWRlZCB2ZXJzaW9uLiAqL1xuICAgIGNvbnN0IGV4cGVyaW1lbnRhbFZlcnNpb24gPSBjcmVhdGVFeHBlcmltZW50YWxTZW12ZXIodmVyc2lvbik7XG5cbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPSBKU09OLnBhcnNlKFxuICAgICAgICBhd2FpdCBmcy5yZWFkRmlsZShqb2luKHBrZy5vdXRwdXRQYXRoLCAncGFja2FnZS5qc29uJyksICd1dGY4JyksXG4gICAgICApIGFzIHt2ZXJzaW9uOiBzdHJpbmc7IFtrZXk6IHN0cmluZ106IGFueX07XG5cbiAgICAgIGNvbnN0IG1pc21hdGNoZXNWZXJzaW9uID0gdmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG4gICAgICBjb25zdCBtaXNtYXRjaGVzRXhwZXJpbWVudGFsID0gZXhwZXJpbWVudGFsVmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG5cbiAgICAgIGlmIChtaXNtYXRjaGVzRXhwZXJpbWVudGFsICYmIG1pc21hdGNoZXNWZXJzaW9uKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn0gKCR7ZXhwZXJpbWVudGFsVmVyc2lvbi52ZXJzaW9ufSlgKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==