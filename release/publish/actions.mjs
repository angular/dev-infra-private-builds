/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter } from "tslib";
import { promises as fs } from 'fs';
import * as ora from 'ora';
import { join } from 'path';
import { debug, error, green, info, promptConfirm, red, warn, yellow } from '../../utils/console';
import { getListCommitsInBranchUrl, getRepositoryGitUrl } from '../../utils/git/github-urls';
import { runNpmPublish } from '../versioning/npm-publish';
import { FatalReleaseActionError, UserAbortedReleaseActionError } from './actions-error';
import { getCommitMessageForRelease, getReleaseNoteCherryPickCommitMessage } from './commit-message';
import { changelogPath, packageJsonPath, waitForPullRequestInterval } from './constants';
import { invokeReleaseBuildCommand, invokeYarnInstallCommand } from './external-commands';
import { findOwnedForksOfRepoQuery } from './graphql-queries';
import { getPullRequestState } from './pull-request-state';
import { getLocalChangelogFilePath, ReleaseNotes } from './release-notes/release-notes';
/**
 * Abstract base class for a release action. A release action is selectable by the caretaker
 * if active, and can perform changes for releasing, such as staging a release, bumping the
 * version, cherry-picking the changelog, branching off from master. etc.
 */
export class ReleaseAction {
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
    /** Updates the version in the project top-level `package.json` file. */
    updateProjectVersion(newVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            const pkgJsonPath = join(this.projectDir, packageJsonPath);
            const pkgJson = JSON.parse(yield fs.readFile(pkgJsonPath, 'utf8'));
            pkgJson.version = newVersion.format();
            // Write the `package.json` file. Note that we add a trailing new line
            // to avoid unnecessary diff. IDEs usually add a trailing new line.
            yield fs.writeFile(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
            info(green(`  ✓   Updated project version to ${pkgJson.version}`));
        });
    }
    /** Gets the most recent commit of a specified branch. */
    _getCommitOfBranch(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data: { commit } } = yield this.git.github.repos.getBranch(Object.assign(Object.assign({}, this.git.remoteParams), { branch: branchName }));
            return commit.sha;
        });
    }
    /** Verifies that the latest commit for the given branch is passing all statuses. */
    verifyPassingGithubStatus(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            const commitSha = yield this._getCommitOfBranch(branchName);
            const { data: { state } } = yield this.git.github.repos.getCombinedStatusForRef(Object.assign(Object.assign({}, this.git.remoteParams), { ref: commitSha }));
            const branchCommitsUrl = getListCommitsInBranchUrl(this.git, branchName);
            if (state === 'failure') {
                error(red(`  ✘   Cannot stage release. Commit "${commitSha}" does not pass all github ` +
                    'status checks. Please make sure this commit passes all checks before re-running.'));
                error(`      Please have a look at: ${branchCommitsUrl}`);
                if (yield promptConfirm('Do you want to ignore the Github status and proceed?')) {
                    info(yellow('  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.'));
                    return;
                }
                throw new UserAbortedReleaseActionError();
            }
            else if (state === 'pending') {
                error(red(`  ✘   Commit "${commitSha}" still has pending github statuses that ` +
                    'need to succeed before staging a release.'));
                error(red(`      Please have a look at: ${branchCommitsUrl}`));
                if (yield promptConfirm('Do you want to ignore the Github status and proceed?')) {
                    info(yellow('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
                    return;
                }
                throw new UserAbortedReleaseActionError();
            }
            info(green('  ✓   Upstream commit is passing all github status checks.'));
        });
    }
    /**
     * Prompts the user for potential release notes edits that need to be made. Once
     * confirmed, a new commit for the release point is created.
     */
    waitForEditsAndCreateReleaseCommit(newVersion) {
        return __awaiter(this, void 0, void 0, function* () {
            info(yellow('  ⚠   Please review the changelog and ensure that the log contains only changes ' +
                'that apply to the public API surface. Manual changes can be made. When done, please ' +
                'proceed with the prompt below.'));
            if (!(yield promptConfirm('Do you want to proceed and commit the changes?'))) {
                throw new UserAbortedReleaseActionError();
            }
            // Commit message for the release point.
            const commitMessage = getCommitMessageForRelease(newVersion);
            // Create a release staging commit including changelog and version bump.
            yield this.createCommit(commitMessage, [packageJsonPath, changelogPath]);
            info(green(`  ✓   Created release commit for: "${newVersion}".`));
        });
    }
    /**
     * Gets an owned fork for the configured project of the authenticated user. Aborts the
     * process with an error if no fork could be found. Also caches the determined fork
     * repository as the authenticated user cannot change during action execution.
     */
    _getForkOfAuthenticatedUser() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._cachedForkRepo !== null) {
                return this._cachedForkRepo;
            }
            const { owner, name } = this.git.remoteConfig;
            const result = yield this.git.github.graphql(findOwnedForksOfRepoQuery, { owner, name });
            const forks = result.repository.forks.nodes;
            if (forks.length === 0) {
                error(red('  ✘   Unable to find fork for currently authenticated user.'));
                error(red(`      Please ensure you created a fork of: ${owner}/${name}.`));
                throw new FatalReleaseActionError();
            }
            const fork = forks[0];
            return this._cachedForkRepo = { owner: fork.owner.login, name: fork.name };
        });
    }
    /** Checks whether a given branch name is reserved in the specified repository. */
    _isBranchNameReservedInRepo(repo, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.git.github.repos.getBranch({ owner: repo.owner, repo: repo.name, branch: name });
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
        });
    }
    /** Finds a non-reserved branch name in the repository with respect to a base name. */
    _findAvailableBranchName(repo, baseName) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentName = baseName;
            let suffixNum = 0;
            while (yield this._isBranchNameReservedInRepo(repo, currentName)) {
                suffixNum++;
                currentName = `${baseName}_${suffixNum}`;
            }
            return currentName;
        });
    }
    /**
     * Creates a local branch from the current Git `HEAD`. Will override
     * existing branches in case of a collision.
     */
    createLocalBranchFromHead(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.git.run(['checkout', '-B', branchName]);
        });
    }
    /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
    pushHeadToRemoteBranch(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Push the local `HEAD` to the remote branch in the configured project.
            this.git.run(['push', this.git.getRepoGitUrl(), `HEAD:refs/heads/${branchName}`]);
        });
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
    _pushHeadToFork(proposedBranchName, trackLocalBranch) {
        return __awaiter(this, void 0, void 0, function* () {
            const fork = yield this._getForkOfAuthenticatedUser();
            // Compute a repository URL for pushing to the fork. Note that we want to respect
            // the SSH option from the dev-infra github configuration.
            const repoGitUrl = getRepositoryGitUrl(Object.assign(Object.assign({}, fork), { useSsh: this.git.remoteConfig.useSsh }), this.git.githubToken);
            const branchName = yield this._findAvailableBranchName(fork, proposedBranchName);
            const pushArgs = [];
            // If a local branch should track the remote fork branch, create a branch matching
            // the remote branch. Later with the `git push`, the remote is set for the branch.
            if (trackLocalBranch) {
                yield this.createLocalBranchFromHead(branchName);
                pushArgs.push('--set-upstream');
            }
            // Push the local `HEAD` to the remote branch in the fork.
            this.git.run(['push', repoGitUrl, `HEAD:refs/heads/${branchName}`, ...pushArgs]);
            return { fork, branchName };
        });
    }
    /**
     * Pushes changes to a fork for the configured project that is owned by the currently
     * authenticated user. A pull request is then created for the pushed changes on the
     * configured project that targets the specified target branch.
     * @returns An object describing the created pull request.
     */
    pushChangesToForkAndCreatePullRequest(targetBranch, proposedForkBranchName, title, body) {
        return __awaiter(this, void 0, void 0, function* () {
            const repoSlug = `${this.git.remoteParams.owner}/${this.git.remoteParams.repo}`;
            const { fork, branchName } = yield this._pushHeadToFork(proposedForkBranchName, true);
            const { data } = yield this.git.github.pulls.create(Object.assign(Object.assign({}, this.git.remoteParams), { head: `${fork.owner}:${branchName}`, base: targetBranch, body,
                title }));
            // Add labels to the newly created PR if provided in the configuration.
            if (this.config.releasePrLabels !== undefined) {
                yield this.git.github.issues.addLabels(Object.assign(Object.assign({}, this.git.remoteParams), { issue_number: data.number, labels: this.config.releasePrLabels }));
            }
            info(green(`  ✓   Created pull request #${data.number} in ${repoSlug}.`));
            return {
                id: data.number,
                url: data.html_url,
                fork,
                forkBranch: branchName,
            };
        });
    }
    /**
     * Waits for the given pull request to be merged. Default interval for checking the Github
     * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
     * merge, the script will abort gracefully (considering a manual user abort).
     */
    waitForPullRequestToBeMerged(id, interval = waitForPullRequestInterval) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                debug(`Waiting for pull request #${id} to be merged.`);
                const spinner = ora.call(undefined).start(`Waiting for pull request #${id} to be merged.`);
                const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const prState = yield getPullRequestState(this.git, id);
                    if (prState === 'merged') {
                        spinner.stop();
                        info(green(`  ✓   Pull request #${id} has been merged.`));
                        clearInterval(intervalId);
                        resolve();
                    }
                    else if (prState === 'closed') {
                        spinner.stop();
                        warn(yellow(`  ✘   Pull request #${id} has been closed.`));
                        clearInterval(intervalId);
                        reject(new UserAbortedReleaseActionError());
                    }
                }), interval);
            });
        });
    }
    /**
     * Prepend releases notes for a version published in a given branch to the changelog in
     * the current Git `HEAD`. This is useful for cherry-picking the changelog.
     * @returns A boolean indicating whether the release notes have been prepended.
     */
    prependReleaseNotesToChangelog(releaseNotes) {
        return __awaiter(this, void 0, void 0, function* () {
            const localChangelogPath = getLocalChangelogFilePath(this.projectDir);
            const localChangelog = yield fs.readFile(localChangelogPath, 'utf8');
            const releaseNotesEntry = yield releaseNotes.getChangelogEntry();
            yield fs.writeFile(localChangelogPath, `${releaseNotesEntry}\n\n${localChangelog}`);
            info(green(`  ✓   Updated the changelog to capture changes for "${releaseNotes.version}".`));
        });
    }
    /** Checks out an upstream branch with a detached head. */
    checkoutUpstreamBranch(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.git.run(['fetch', '-q', this.git.getRepoGitUrl(), branchName]);
            this.git.run(['checkout', 'FETCH_HEAD', '--detach']);
        });
    }
    /**
     * Creates a commit for the specified files with the given message.
     * @param message Message for the created commit
     * @param files List of project-relative file paths to be commited.
     */
    createCommit(message, files) {
        return __awaiter(this, void 0, void 0, function* () {
            this.git.run(['commit', '--no-verify', '-m', message, ...files]);
        });
    }
    /**
     * Stages the specified new version for the current branch and creates a
     * pull request that targets the given base branch.
     * @returns an object describing the created pull request.
     */
    stageVersionForBranchAndCreatePullRequest(newVersion, pullRequestBaseBranch) {
        return __awaiter(this, void 0, void 0, function* () {
            const releaseNotes = yield ReleaseNotes.fromRange(newVersion, this.git.getLatestSemverTag().format(), 'HEAD');
            yield this.updateProjectVersion(newVersion);
            yield this.prependReleaseNotesToChangelog(releaseNotes);
            yield this.waitForEditsAndCreateReleaseCommit(newVersion);
            const pullRequest = yield this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, `release-stage-${newVersion}`, `Bump version to "v${newVersion}" with changelog.`);
            info(green('  ✓   Release staging pull request has been created.'));
            info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
            return { releaseNotes, pullRequest };
        });
    }
    /**
     * Checks out the specified target branch, verifies its CI status and stages
     * the specified new version in order to create a pull request.
     * @returns an object describing the created pull request.
     */
    checkoutBranchAndStageVersion(newVersion, stagingBranch) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyPassingGithubStatus(stagingBranch);
            yield this.checkoutUpstreamBranch(stagingBranch);
            return yield this.stageVersionForBranchAndCreatePullRequest(newVersion, stagingBranch);
        });
    }
    /**
     * Cherry-picks the release notes of a version that have been pushed to a given branch
     * into the `next` primary development branch. A pull request is created for this.
     * @returns a boolean indicating successful creation of the cherry-pick pull request.
     */
    cherryPickChangelogIntoNextBranch(releaseNotes, stagingBranch) {
        return __awaiter(this, void 0, void 0, function* () {
            const nextBranch = this.active.next.branchName;
            const commitMessage = getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
            // Checkout the next branch.
            yield this.checkoutUpstreamBranch(nextBranch);
            yield this.prependReleaseNotesToChangelog(releaseNotes);
            // Create a changelog cherry-pick commit.
            yield this.createCommit(commitMessage, [changelogPath]);
            info(green(`  ✓   Created changelog cherry-pick commit for: "${releaseNotes.version}".`));
            // Create a cherry-pick pull request that should be merged by the caretaker.
            const { url, id } = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `changelog-cherry-pick-${releaseNotes.version}`, commitMessage, `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
                `branch (${nextBranch}).`);
            info(green(`  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
                'has been created.'));
            info(yellow(`      Please ask team members to review: ${url}.`));
            // Wait for the Pull Request to be merged.
            yield this.waitForPullRequestToBeMerged(id);
            return true;
        });
    }
    /**
     * Creates a Github release for the specified version in the configured project.
     * The release is created by tagging the specified commit SHA.
     */
    _createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, prerelease) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagName = releaseNotes.version.format();
            yield this.git.github.git.createRef(Object.assign(Object.assign({}, this.git.remoteParams), { ref: `refs/tags/${tagName}`, sha: versionBumpCommitSha }));
            info(green(`  ✓   Tagged v${releaseNotes.version} release upstream.`));
            yield this.git.github.repos.createRelease(Object.assign(Object.assign({}, this.git.remoteParams), { name: `v${releaseNotes.version}`, tag_name: tagName, prerelease, body: yield releaseNotes.getGithubReleaseEntry() }));
            info(green(`  ✓   Created v${releaseNotes.version} release in Github.`));
        });
    }
    /**
     * Builds and publishes the given version in the specified branch.
     * @param releaseNotes The release notes for the version being published.
     * @param publishBranch Name of the branch that contains the new version.
     * @param npmDistTag NPM dist tag where the version should be published to.
     */
    buildAndPublish(releaseNotes, publishBranch, npmDistTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const versionBumpCommitSha = yield this._getCommitOfBranch(publishBranch);
            if (!(yield this._isCommitForVersionStaging(releaseNotes.version, versionBumpCommitSha))) {
                error(red(`  ✘   Latest commit in "${publishBranch}" branch is not a staging commit.`));
                error(red('      Please make sure the staging pull request has been merged.'));
                throw new FatalReleaseActionError();
            }
            // Checkout the publish branch and build the release packages.
            yield this.checkoutUpstreamBranch(publishBranch);
            // Install the project dependencies for the publish branch, and then build the release
            // packages. Note that we do not directly call the build packages function from the release
            // config. We only want to build and publish packages that have been configured in the given
            // publish branch. e.g. consider we publish patch version and a new package has been
            // created in the `next` branch. The new package would not be part of the patch branch,
            // so we cannot build and publish it.
            yield invokeYarnInstallCommand(this.projectDir);
            const builtPackages = yield invokeReleaseBuildCommand();
            // Verify the packages built are the correct version.
            yield this._verifyPackageVersions(releaseNotes.version, builtPackages);
            // Create a Github release for the new version.
            yield this._createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, npmDistTag === 'next');
            // Walk through all built packages and publish them to NPM.
            for (const builtPackage of builtPackages) {
                yield this._publishBuiltPackageToNpm(builtPackage, npmDistTag);
            }
            info(green('  ✓   Published all packages successfully'));
        });
    }
    /** Publishes the given built package to NPM with the specified NPM dist tag. */
    _publishBuiltPackageToNpm(pkg, npmDistTag) {
        return __awaiter(this, void 0, void 0, function* () {
            debug(`Starting publish of "${pkg.name}".`);
            const spinner = ora.call(undefined).start(`Publishing "${pkg.name}"`);
            try {
                yield runNpmPublish(pkg.outputPath, npmDistTag, this.config.publishRegistry);
                spinner.stop();
                info(green(`  ✓   Successfully published "${pkg.name}.`));
            }
            catch (e) {
                spinner.stop();
                error(e);
                error(red(`  ✘   An error occurred while publishing "${pkg.name}".`));
                throw new FatalReleaseActionError();
            }
        });
    }
    /** Checks whether the given commit represents a staging commit for the specified version. */
    _isCommitForVersionStaging(version, commitSha) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.git.github.repos.getCommit(Object.assign(Object.assign({}, this.git.remoteParams), { ref: commitSha }));
            return data.commit.message.startsWith(getCommitMessageForRelease(version));
        });
    }
    /** Verify the version of each generated package exact matches the specified version. */
    _verifyPackageVersions(version, packages) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const pkg of packages) {
                const { version: packageJsonVersion } = JSON.parse(yield fs.readFile(join(pkg.outputPath, 'package.json'), 'utf8'));
                if (version.compare(packageJsonVersion) !== 0) {
                    error(red('The built package version does not match the version being released.'));
                    error(`  Release Version:   ${version.version}`);
                    error(`  Generated Version: ${packageJsonVersion}`);
                    throw new FatalReleaseActionError();
                }
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDbEMsT0FBTyxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDM0IsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUcxQixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2hHLE9BQU8sRUFBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBSzNGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsMEJBQTBCLEVBQUUscUNBQXFDLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRyxPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2RixPQUFPLEVBQUMseUJBQXlCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUE0QnRGOzs7O0dBSUc7QUFDSCxNQUFN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QUksUUFBUSxFQUFFO2dCQUMxQixNQUFNLEVBQUMsT0FBTyxFQUFFLGtCQUFrQixFQUFDLEdBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxFQUFFLGNBQWMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUNyQyxDQUFDO2dCQUMxQyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQzdDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0VBQXNFLENBQUMsQ0FBQyxDQUFDO29CQUNuRixLQUFLLENBQUMsd0JBQXdCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO29CQUNqRCxLQUFLLENBQUMsd0JBQXdCLGtCQUFrQixFQUFFLENBQUMsQ0FBQztvQkFDcEQsTUFBTSxJQUFJLHVCQUF1QixFQUFFLENBQUM7aUJBQ3JDO2FBQ0Y7UUFDSCxDQUFDO0tBQUE7Q0FDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGZzfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2dldExpc3RDb21taXRzSW5CcmFuY2hVcmwsIGdldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuaW1wb3J0IHtmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5fSBmcm9tICcuL2dyYXBocWwtcXVlcmllcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcbmltcG9ydCB7Z2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aCwgUmVsZWFzZU5vdGVzfSBmcm9tICcuL3JlbGVhc2Utbm90ZXMvcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEdpdENsaWVudDx0cnVlPiwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIF9jb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudDx0cnVlPixcbiAgICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBwcm9qZWN0RGlyOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID1cbiAgICAgICAgSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgICBwa2dKc29uLnZlcnNpb24gPSBuZXdWZXJzaW9uLmZvcm1hdCgpO1xuICAgIC8vIFdyaXRlIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLiBOb3RlIHRoYXQgd2UgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmVcbiAgICAvLyB0byBhdm9pZCB1bm5lY2Vzc2FyeSBkaWZmLiBJREVzIHVzdWFsbHkgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmUuXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHBrZ0pzb25QYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwa2dKc29uLCBudWxsLCAyKX1cXG5gKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgcHJvamVjdCB2ZXJzaW9uIHRvICR7cGtnSnNvbi52ZXJzaW9ufWApKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtb3N0IHJlY2VudCBjb21taXQgb2YgYSBzcGVjaWZpZWQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtkYXRhOiB7Y29tbWl0fX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogYnJhbmNoTmFtZX0pO1xuICAgIHJldHVybiBjb21taXQuc2hhO1xuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgdGhlIGxhdGVzdCBjb21taXQgZm9yIHRoZSBnaXZlbiBicmFuY2ggaXMgcGFzc2luZyBhbGwgc3RhdHVzZXMuICovXG4gIHByb3RlY3RlZCBhc3luYyB2ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHtkYXRhOiB7c3RhdGV9fSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21iaW5lZFN0YXR1c0ZvclJlZihcbiAgICAgICAgey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcmVmOiBjb21taXRTaGF9KTtcbiAgICBjb25zdCBicmFuY2hDb21taXRzVXJsID0gZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCh0aGlzLmdpdCwgYnJhbmNoTmFtZSk7XG5cbiAgICBpZiAoc3RhdGUgPT09ICdmYWlsdXJlJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENhbm5vdCBzdGFnZSByZWxlYXNlLiBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBkb2VzIG5vdCBwYXNzIGFsbCBnaXRodWIgYCArXG4gICAgICAgICAgICAgICdzdGF0dXMgY2hlY2tzLiBQbGVhc2UgbWFrZSBzdXJlIHRoaXMgY29tbWl0IHBhc3NlcyBhbGwgY2hlY2tzIGJlZm9yZSByZS1ydW5uaW5nLicpKTtcbiAgICAgIGVycm9yKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKTtcblxuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgICAgICcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBmYWlsaW5nIENJIGNoZWNrcywgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICByZWQoYCAg4pyYICAgQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgc3RpbGwgaGFzIHBlbmRpbmcgZ2l0aHViIHN0YXR1c2VzIHRoYXQgYCArXG4gICAgICAgICAgICAgICduZWVkIHRvIHN1Y2NlZWQgYmVmb3JlIHN0YWdpbmcgYSByZWxlYXNlLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCkpO1xuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdygnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgcGVuZGluZyBDSSwgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBVcHN0cmVhbSBjb21taXQgaXMgcGFzc2luZyBhbGwgZ2l0aHViIHN0YXR1cyBjaGVja3MuJykpO1xuICB9XG5cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgcG90ZW50aWFsIHJlbGVhc2Ugbm90ZXMgZWRpdHMgdGhhdCBuZWVkIHRvIGJlIG1hZGUuIE9uY2VcbiAgICogY29uZmlybWVkLCBhIG5ldyBjb21taXQgZm9yIHRoZSByZWxlYXNlIHBvaW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICcgIOKaoCAgIFBsZWFzZSByZXZpZXcgdGhlIGNoYW5nZWxvZyBhbmQgZW5zdXJlIHRoYXQgdGhlIGxvZyBjb250YWlucyBvbmx5IGNoYW5nZXMgJyArXG4gICAgICAgICd0aGF0IGFwcGx5IHRvIHRoZSBwdWJsaWMgQVBJIHN1cmZhY2UuIE1hbnVhbCBjaGFuZ2VzIGNhbiBiZSBtYWRlLiBXaGVuIGRvbmUsIHBsZWFzZSAnICtcbiAgICAgICAgJ3Byb2NlZWQgd2l0aCB0aGUgcHJvbXB0IGJlbG93LicpKTtcblxuICAgIGlmICghYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gcHJvY2VlZCBhbmQgY29tbWl0IHRoZSBjaGFuZ2VzPycpKSB7XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDb21taXQgbWVzc2FnZSBmb3IgdGhlIHJlbGVhc2UgcG9pbnQuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKG5ld1ZlcnNpb24pO1xuICAgIC8vIENyZWF0ZSBhIHJlbGVhc2Ugc3RhZ2luZyBjb21taXQgaW5jbHVkaW5nIGNoYW5nZWxvZyBhbmQgdmVyc2lvbiBidW1wLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGgsIGNoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC4gQWxzbyBjYWNoZXMgdGhlIGRldGVybWluZWQgZm9ya1xuICAgKiByZXBvc2l0b3J5IGFzIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgY2Fubm90IGNoYW5nZSBkdXJpbmcgYWN0aW9uIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZWRGb3JrUmVwbyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwoZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSwge293bmVyLCBuYW1lfSk7XG4gICAgY29uc3QgZm9ya3MgPSByZXN1bHQucmVwb3NpdG9yeS5mb3Jrcy5ub2RlcztcblxuICAgIGlmIChmb3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGVuc3VyZSB5b3UgY3JlYXRlZCBhIGZvcmsgb2Y6ICR7b3duZXJ9LyR7bmFtZX0uYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9yayA9IGZvcmtzWzBdO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbyA9IHtvd25lcjogZm9yay5vd25lci5sb2dpbiwgbmFtZTogZm9yay5uYW1lfTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGJyYW5jaCBuYW1lIGlzIHJlc2VydmVkIGluIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbzogR2l0aHViUmVwbywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIGJyYW5jaDogbmFtZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgdGhlIGVycm9yIGhhcyBhIGBzdGF0dXNgIHByb3BlcnR5IHNldCB0byBgNDA0YCwgdGhlbiB3ZSBrbm93IHRoYXQgdGhlIGJyYW5jaFxuICAgICAgLy8gZG9lcyBub3QgZXhpc3QuIE90aGVyd2lzZSwgaXQgbWlnaHQgYmUgYW4gQVBJIGVycm9yIHRoYXQgd2Ugd2FudCB0byByZXBvcnQvcmUtdGhyb3cuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGaW5kcyBhIG5vbi1yZXNlcnZlZCBicmFuY2ggbmFtZSBpbiB0aGUgcmVwb3NpdG9yeSB3aXRoIHJlc3BlY3QgdG8gYSBiYXNlIG5hbWUuICovXG4gIHByaXZhdGUgYXN5bmMgX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKHJlcG86IEdpdGh1YlJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBjdXJyZW50TmFtZSA9IGJhc2VOYW1lO1xuICAgIGxldCBzdWZmaXhOdW0gPSAwO1xuICAgIHdoaWxlIChhd2FpdCB0aGlzLl9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvLCBjdXJyZW50TmFtZSkpIHtcbiAgICAgIHN1ZmZpeE51bSsrO1xuICAgICAgY3VycmVudE5hbWUgPSBgJHtiYXNlTmFtZX1fJHtzdWZmaXhOdW19YDtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnROYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBsb2NhbCBicmFuY2ggZnJvbSB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBXaWxsIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIGJyYW5jaGVzIGluIGNhc2Ugb2YgYSBjb2xsaXNpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctQicsIGJyYW5jaE5hbWVdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byB0aGUgZ2l2ZW4gcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaEhlYWRUb1JlbW90ZUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gXSk7XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnlcbiAgICogdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gSWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBleGlzdHMgaW4gdGhlIGZvcmsgYWxyZWFkeSwgYVxuICAgKiB1bmlxdWUgb25lIHdpbGwgYmUgZ2VuZXJhdGVkIGJhc2VkIG9uIHRoZSBwcm9wb3NlZCBuYW1lIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSBwcm9wb3NlZEJyYW5jaE5hbWUgUHJvcG9zZWQgYnJhbmNoIG5hbWUgZm9yIHRoZSBmb3JrLlxuICAgKiBAcGFyYW0gdHJhY2tMb2NhbEJyYW5jaCBXaGV0aGVyIHRoZSBmb3JrIGJyYW5jaCBzaG91bGQgYmUgdHJhY2tlZCBsb2NhbGx5LiBpLmUuIHdoZXRoZXJcbiAgICogICBhIGxvY2FsIGJyYW5jaCB3aXRoIHJlbW90ZSB0cmFja2luZyBzaG91bGQgYmUgc2V0IHVwLlxuICAgKiBAcmV0dXJucyBUaGUgZm9yayBhbmQgYnJhbmNoIG5hbWUgY29udGFpbmluZyB0aGUgcHVzaGVkIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEJyYW5jaE5hbWU6IHN0cmluZywgdHJhY2tMb2NhbEJyYW5jaDogYm9vbGVhbik6XG4gICAgICBQcm9taXNlPHtmb3JrOiBHaXRodWJSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgZm9yayA9IGF3YWl0IHRoaXMuX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk7XG4gICAgLy8gQ29tcHV0ZSBhIHJlcG9zaXRvcnkgVVJMIGZvciBwdXNoaW5nIHRvIHRoZSBmb3JrLiBOb3RlIHRoYXQgd2Ugd2FudCB0byByZXNwZWN0XG4gICAgLy8gdGhlIFNTSCBvcHRpb24gZnJvbSB0aGUgZGV2LWluZnJhIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICAgIGNvbnN0IHJlcG9HaXRVcmwgPVxuICAgICAgICBnZXRSZXBvc2l0b3J5R2l0VXJsKHsuLi5mb3JrLCB1c2VTc2g6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZy51c2VTc2h9LCB0aGlzLmdpdC5naXRodWJUb2tlbik7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICB0YXJnZXRCcmFuY2g6IHN0cmluZywgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLCB0aXRsZTogc3RyaW5nLFxuICAgICAgYm9keT86IHN0cmluZyk6IFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBjb25zdCByZXBvU2x1ZyA9IGAke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5vd25lcn0vJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMucmVwb31gO1xuICAgIGNvbnN0IHtmb3JrLCBicmFuY2hOYW1lfSA9IGF3YWl0IHRoaXMuX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkRm9ya0JyYW5jaE5hbWUsIHRydWUpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgaGVhZDogYCR7Zm9yay5vd25lcn06JHticmFuY2hOYW1lfWAsXG4gICAgICBiYXNlOiB0YXJnZXRCcmFuY2gsXG4gICAgICBib2R5LFxuICAgICAgdGl0bGUsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbGFiZWxzIHRvIHRoZSBuZXdseSBjcmVhdGVkIFBSIGlmIHByb3ZpZGVkIGluIHRoZSBjb25maWd1cmF0aW9uLlxuICAgIGlmICh0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5hZGRMYWJlbHMoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogZGF0YS5udW1iZXIsXG4gICAgICAgIGxhYmVsczogdGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHB1bGwgcmVxdWVzdCAjJHtkYXRhLm51bWJlcn0gaW4gJHtyZXBvU2x1Z30uYCkpO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogZGF0YS5udW1iZXIsXG4gICAgICB1cmw6IGRhdGEuaHRtbF91cmwsXG4gICAgICBmb3JrLFxuICAgICAgZm9ya0JyYW5jaDogYnJhbmNoTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IHRvIGJlIG1lcmdlZC4gRGVmYXVsdCBpbnRlcnZhbCBmb3IgY2hlY2tpbmcgdGhlIEdpdGh1YlxuICAgKiBBUEkgaXMgMTAgc2Vjb25kcyAodG8gbm90IGV4Y2VlZCBhbnkgcmF0ZSBsaW1pdHMpLiBJZiB0aGUgcHVsbCByZXF1ZXN0IGlzIGNsb3NlZCB3aXRob3V0XG4gICAqIG1lcmdlLCB0aGUgc2NyaXB0IHdpbGwgYWJvcnQgZ3JhY2VmdWxseSAoY29uc2lkZXJpbmcgYSBtYW51YWwgdXNlciBhYm9ydCkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZDogbnVtYmVyLCBpbnRlcnZhbCA9IHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsKTpcbiAgICAgIFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNvbW1pdChtZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdGFnZXMgdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFuZCBjcmVhdGVzIGFcbiAgICogcHVsbCByZXF1ZXN0IHRoYXQgdGFyZ2V0cyB0aGUgZ2l2ZW4gYmFzZSBicmFuY2guXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzID1cbiAgICAgICAgYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShuZXdWZXJzaW9uLCB0aGlzLmdpdC5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKSwgJ0hFQUQnKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaCwgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICAgIGBCdW1wIHZlcnNpb24gdG8gXCJ2JHtuZXdWZXJzaW9ufVwiIHdpdGggY2hhbmdlbG9nLmApO1xuXG4gICAgaW5mbyhncmVlbignICDinJMgICBSZWxlYXNlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICByZXR1cm4ge3JlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3R9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLCB2ZXJpZmllcyBpdHMgQ0kgc3RhdHVzIGFuZCBzdGFnZXNcbiAgICogdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBpbiBvcmRlciB0byBjcmVhdGUgYSBwdWxsIHJlcXVlc3QuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOlxuICAgICAgUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIHN0YWdpbmdCcmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCB7dXJsLCBpZH0gPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIG5leHRCcmFuY2gsIGBjaGFuZ2Vsb2ctY2hlcnJ5LXBpY2stJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLCBjb21taXRNZXNzYWdlLFxuICAgICAgICBgQ2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZnJvbSB0aGUgXCIke3N0YWdpbmdCcmFuY2h9XCIgYnJhbmNoIHRvIHRoZSBuZXh0IGAgK1xuICAgICAgICAgICAgYGJyYW5jaCAoJHtuZXh0QnJhbmNofSkuYCk7XG5cbiAgICBpbmZvKGdyZWVuKFxuICAgICAgICBgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cgaW50byBcIiR7bmV4dEJyYW5jaH1cIiBgICtcbiAgICAgICAgJ2hhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7dXJsfS5gKSk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgUHVsbCBSZXF1ZXN0IHRvIGJlIG1lcmdlZC5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICogVGhlIHJlbGVhc2UgaXMgY3JlYXRlZCBieSB0YWdnaW5nIHRoZSBzcGVjaWZpZWQgY29tbWl0IFNIQS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHZlcnNpb25CdW1wQ29tbWl0U2hhOiBzdHJpbmcsIHByZXJlbGVhc2U6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB0YWdOYW1lID0gcmVsZWFzZU5vdGVzLnZlcnNpb24uZm9ybWF0KCk7XG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdpdC5jcmVhdGVSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBgcmVmcy90YWdzLyR7dGFnTmFtZX1gLFxuICAgICAgc2hhOiB2ZXJzaW9uQnVtcENvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFRhZ2dlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSB1cHN0cmVhbS5gKSk7XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuY3JlYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBuYW1lOiBgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgICAgcHJlcmVsZWFzZSxcbiAgICAgIGJvZHk6IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgaW4gR2l0aHViLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHB1Ymxpc2hlcyB0aGUgZ2l2ZW4gdmVyc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJyYW5jaC5cbiAgICogQHBhcmFtIHJlbGVhc2VOb3RlcyBUaGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIHZlcnNpb24gYmVpbmcgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gcHVibGlzaEJyYW5jaCBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgbmV3IHZlcnNpb24uXG4gICAqIEBwYXJhbSBucG1EaXN0VGFnIE5QTSBkaXN0IHRhZyB3aGVyZSB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcHVibGlzaGVkIHRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkQW5kUHVibGlzaChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWJsaXNoQnJhbmNoOiBzdHJpbmcsIG5wbURpc3RUYWc6IE5wbURpc3RUYWcpIHtcbiAgICBjb25zdCB2ZXJzaW9uQnVtcENvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgICByZWxlYXNlTm90ZXMsIHZlcnNpb25CdW1wQ29tbWl0U2hhLCBucG1EaXN0VGFnID09PSAnbmV4dCcpO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBidWlsdCBwYWNrYWdlcyBhbmQgcHVibGlzaCB0aGVtIHRvIE5QTS5cbiAgICBmb3IgKGNvbnN0IGJ1aWx0UGFja2FnZSBvZiBidWlsdFBhY2thZ2VzKSB7XG4gICAgICBhd2FpdCB0aGlzLl9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0oYnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFB1Ymxpc2hlZCBhbGwgcGFja2FnZXMgc3VjY2Vzc2Z1bGx5JykpO1xuICB9XG5cbiAgLyoqIFB1Ymxpc2hlcyB0aGUgZ2l2ZW4gYnVpbHQgcGFja2FnZSB0byBOUE0gd2l0aCB0aGUgc3BlY2lmaWVkIE5QTSBkaXN0IHRhZy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKHBrZzogQnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnOiBOcG1EaXN0VGFnKSB7XG4gICAgZGVidWcoYFN0YXJ0aW5nIHB1Ymxpc2ggb2YgXCIke3BrZy5uYW1lfVwiLmApO1xuICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBQdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bk5wbVB1Ymxpc2gocGtnLm91dHB1dFBhdGgsIG5wbURpc3RUYWcsIHRoaXMuY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiLmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gY29tbWl0IHJlcHJlc2VudHMgYSBzdGFnaW5nIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGNvbW1pdFNoYTogc3RyaW5nKSB7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG5cbiAgLyoqIFZlcmlmeSB0aGUgdmVyc2lvbiBvZiBlYWNoIGdlbmVyYXRlZCBwYWNrYWdlIGV4YWN0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlQYWNrYWdlVmVyc2lvbnModmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdKSB7XG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID1cbiAgICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKGpvaW4ocGtnLm91dHB1dFBhdGgsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKSkgYXNcbiAgICAgICAgICB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgaWYgKHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn1gKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==