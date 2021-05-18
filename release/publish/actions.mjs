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
    static isActive(_trains) {
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
     * @param newVersion The new version to be published.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDbEMsT0FBTyxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDM0IsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUcxQixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ2hHLE9BQU8sRUFBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBSTNGLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxPQUFPLEVBQUMsdUJBQXVCLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN2RixPQUFPLEVBQUMsMEJBQTBCLEVBQUUscUNBQXFDLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRyxPQUFPLEVBQUMsYUFBYSxFQUFFLGVBQWUsRUFBRSwwQkFBMEIsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2RixPQUFPLEVBQUMseUJBQXlCLEVBQUUsd0JBQXdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN4RixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUM1RCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUMseUJBQXlCLEVBQUUsWUFBWSxFQUFDLE1BQU0sK0JBQStCLENBQUM7QUE0QnRGOzs7O0dBSUc7QUFDSCxNQUFN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RTtnQkFDMUIsTUFBTSxFQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBQyxHQUMvQixJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDckMsQ0FBQztnQkFDMUMsSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxFQUFFO29CQUM3QyxLQUFLLENBQUMsR0FBRyxDQUFDLHNFQUFzRSxDQUFDLENBQUMsQ0FBQztvQkFDbkYsS0FBSyxDQUFDLHdCQUF3QixPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDakQsS0FBSyxDQUFDLHdCQUF3QixrQkFBa0IsRUFBRSxDQUFDLENBQUM7b0JBQ3BELE1BQU0sSUFBSSx1QkFBdUIsRUFBRSxDQUFDO2lCQUNyQzthQUNGO1FBQ0gsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsLCBnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuaW1wb3J0IHtmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5fSBmcm9tICcuL2dyYXBocWwtcXVlcmllcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcbmltcG9ydCB7Z2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aCwgUmVsZWFzZU5vdGVzfSBmcm9tICcuL3JlbGVhc2Utbm90ZXMvcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKTogUHJvbWlzZTxib29sZWFuPjtcbiAgLyoqIENvbnN0cnVjdHMgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgbmV3KC4uLmFyZ3M6IFtBY3RpdmVSZWxlYXNlVHJhaW5zLCBHaXRDbGllbnQ8dHJ1ZT4sIFJlbGVhc2VDb25maWcsIHN0cmluZ10pOiBUO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGEgcmVsZWFzZSBhY3Rpb24uIEEgcmVsZWFzZSBhY3Rpb24gaXMgc2VsZWN0YWJsZSBieSB0aGUgY2FyZXRha2VyXG4gKiBpZiBhY3RpdmUsIGFuZCBjYW4gcGVyZm9ybSBjaGFuZ2VzIGZvciByZWxlYXNpbmcsIHN1Y2ggYXMgc3RhZ2luZyBhIHJlbGVhc2UsIGJ1bXBpbmcgdGhlXG4gKiB2ZXJzaW9uLCBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLCBicmFuY2hpbmcgb2ZmIGZyb20gbWFzdGVyLiBldGMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIHN0YXRpYyBpc0FjdGl2ZShfdHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiBmb3IgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgYWJzdHJhY3QgZ2V0RGVzY3JpcHRpb24oKTogUHJvbWlzZTxzdHJpbmc+O1xuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGdpdmVuIHJlbGVhc2UgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgdXNlciBtYW51YWxseSBhYm9ydGVkIHRoZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gYSBmYXRhbCBlcnJvci5cbiAgICovXG4gIGFic3RyYWN0IHBlcmZvcm0oKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogQ2FjaGVkIGZvdW5kIGZvcmsgb2YgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkRm9ya1JlcG86IEdpdGh1YlJlcG98bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBwcm90ZWN0ZWQgZ2l0OiBHaXRDbGllbnQ8dHJ1ZT4sXG4gICAgICBwcm90ZWN0ZWQgY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgcHJvamVjdERpcjogc3RyaW5nKSB7fVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9XG4gICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZGF0YToge2NvbW1pdH19ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgICAnc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy4nKSk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIHBlbmRpbmcgQ0ksIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgVXBzdHJlYW0gY29tbWl0IGlzIHBhc3NpbmcgYWxsIGdpdGh1YiBzdGF0dXMgY2hlY2tzLicpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oeWVsbG93KFxuICAgICAgICAnICDimqAgICBQbGVhc2UgcmV2aWV3IHRoZSBjaGFuZ2Vsb2cgYW5kIGVuc3VyZSB0aGF0IHRoZSBsb2cgY29udGFpbnMgb25seSBjaGFuZ2VzICcgK1xuICAgICAgICAndGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgJyArXG4gICAgICAgICdwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy4nKSk7XG5cbiAgICBpZiAoIWF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHByb2NlZWQgYW5kIGNvbW1pdCB0aGUgY2hhbmdlcz8nKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoLCBjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcmVsZWFzZSBjb21taXQgZm9yOiBcIiR7bmV3VmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvd25lZCBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IG9mIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIEFib3J0cyB0aGVcbiAgICogcHJvY2VzcyB3aXRoIGFuIGVycm9yIGlmIG5vIGZvcmsgY291bGQgYmUgZm91bmQuIEFsc28gY2FjaGVzIHRoZSBkZXRlcm1pbmVkIGZvcmtcbiAgICogcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnksIHtvd25lciwgbmFtZX0pO1xuICAgIGNvbnN0IGZvcmtzID0gcmVzdWx0LnJlcG9zaXRvcnkuZm9ya3Mubm9kZXM7XG5cbiAgICBpZiAoZm9ya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX07XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBicmFuY2ggbmFtZSBpcyByZXNlcnZlZCBpbiB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG86IEdpdGh1YlJlcG8sIG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBicmFuY2g6IG5hbWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElmIHRoZSBlcnJvciBoYXMgYSBgc3RhdHVzYCBwcm9wZXJ0eSBzZXQgdG8gYDQwNGAsIHRoZW4gd2Uga25vdyB0aGF0IHRoZSBicmFuY2hcbiAgICAgIC8vIGRvZXMgbm90IGV4aXN0LiBPdGhlcndpc2UsIGl0IG1pZ2h0IGJlIGFuIEFQSSBlcnJvciB0aGF0IHdlIHdhbnQgdG8gcmVwb3J0L3JlLXRocm93LlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKiogRmluZHMgYSBub24tcmVzZXJ2ZWQgYnJhbmNoIG5hbWUgaW4gdGhlIHJlcG9zaXRvcnkgd2l0aCByZXNwZWN0IHRvIGEgYmFzZSBuYW1lLiAqL1xuICBwcml2YXRlIGFzeW5jIF9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShyZXBvOiBHaXRodWJSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgY3VycmVudE5hbWUgPSBiYXNlTmFtZTtcbiAgICBsZXQgc3VmZml4TnVtID0gMDtcbiAgICB3aGlsZSAoYXdhaXQgdGhpcy5faXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbywgY3VycmVudE5hbWUpKSB7XG4gICAgICBzdWZmaXhOdW0rKztcbiAgICAgIGN1cnJlbnROYW1lID0gYCR7YmFzZU5hbWV9XyR7c3VmZml4TnVtfWA7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50TmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbG9jYWwgYnJhbmNoIGZyb20gdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gV2lsbCBvdmVycmlkZVxuICAgKiBleGlzdGluZyBicmFuY2hlcyBpbiBjYXNlIG9mIGEgY29sbGlzaW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLUInLCBicmFuY2hOYW1lXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gdGhlIGdpdmVuIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hIZWFkVG9SZW1vdGVCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5XG4gICAqIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIElmIHRoZSBzcGVjaWZpZWQgYnJhbmNoIG5hbWUgZXhpc3RzIGluIHRoZSBmb3JrIGFscmVhZHksIGFcbiAgICogdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgcHJvcG9zZWQgbmFtZSB0byBhdm9pZCBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0gcHJvcG9zZWRCcmFuY2hOYW1lIFByb3Bvc2VkIGJyYW5jaCBuYW1lIGZvciB0aGUgZm9yay5cbiAgICogQHBhcmFtIHRyYWNrTG9jYWxCcmFuY2ggV2hldGhlciB0aGUgZm9yayBicmFuY2ggc2hvdWxkIGJlIHRyYWNrZWQgbG9jYWxseS4gaS5lLiB3aGV0aGVyXG4gICAqICAgYSBsb2NhbCBicmFuY2ggd2l0aCByZW1vdGUgdHJhY2tpbmcgc2hvdWxkIGJlIHNldCB1cC5cbiAgICogQHJldHVybnMgVGhlIGZvcmsgYW5kIGJyYW5jaCBuYW1lIGNvbnRhaW5pbmcgdGhlIHB1c2hlZCBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRCcmFuY2hOYW1lOiBzdHJpbmcsIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4pOlxuICAgICAgUHJvbWlzZTx7Zm9yazogR2l0aHViUmVwbywgYnJhbmNoTmFtZTogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGZvcmsgPSBhd2FpdCB0aGlzLl9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpO1xuICAgIC8vIENvbXB1dGUgYSByZXBvc2l0b3J5IFVSTCBmb3IgcHVzaGluZyB0byB0aGUgZm9yay4gTm90ZSB0aGF0IHdlIHdhbnQgdG8gcmVzcGVjdFxuICAgIC8vIHRoZSBTU0ggb3B0aW9uIGZyb20gdGhlIGRldi1pbmZyYSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgICBjb25zdCByZXBvR2l0VXJsID1cbiAgICAgICAgZ2V0UmVwb3NpdG9yeUdpdFVybCh7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSwgdGhpcy5naXQuZ2l0aHViVG9rZW4pO1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCB0aGlzLl9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShmb3JrLCBwcm9wb3NlZEJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHB1c2hBcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIElmIGEgbG9jYWwgYnJhbmNoIHNob3VsZCB0cmFjayB0aGUgcmVtb3RlIGZvcmsgYnJhbmNoLCBjcmVhdGUgYSBicmFuY2ggbWF0Y2hpbmdcbiAgICAvLyB0aGUgcmVtb3RlIGJyYW5jaC4gTGF0ZXIgd2l0aCB0aGUgYGdpdCBwdXNoYCwgdGhlIHJlbW90ZSBpcyBzZXQgZm9yIHRoZSBicmFuY2guXG4gICAgaWYgKHRyYWNrTG9jYWxCcmFuY2gpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lKTtcbiAgICAgIHB1c2hBcmdzLnB1c2goJy0tc2V0LXVwc3RyZWFtJyk7XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgZm9yay5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgcmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YCwgLi4ucHVzaEFyZ3NdKTtcbiAgICByZXR1cm4ge2ZvcmssIGJyYW5jaE5hbWV9O1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBjaGFuZ2VzIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5IHRoZSBjdXJyZW50bHlcbiAgICogYXV0aGVudGljYXRlZCB1c2VyLiBBIHB1bGwgcmVxdWVzdCBpcyB0aGVuIGNyZWF0ZWQgZm9yIHRoZSBwdXNoZWQgY2hhbmdlcyBvbiB0aGVcbiAgICogY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2guXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsIHByb3Bvc2VkRm9ya0JyYW5jaE5hbWU6IHN0cmluZywgdGl0bGU6IHN0cmluZyxcbiAgICAgIGJvZHk/OiBzdHJpbmcpOiBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgY29uc3QgcmVwb1NsdWcgPSBgJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMub3duZXJ9LyR7dGhpcy5naXQucmVtb3RlUGFyYW1zLnJlcG99YDtcbiAgICBjb25zdCB7Zm9yaywgYnJhbmNoTmFtZX0gPSBhd2FpdCB0aGlzLl9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEZvcmtCcmFuY2hOYW1lLCB0cnVlKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMuY3JlYXRlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIGhlYWQ6IGAke2Zvcmsub3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgYmFzZTogdGFyZ2V0QnJhbmNoLFxuICAgICAgYm9keSxcbiAgICAgIHRpdGxlLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGxhYmVscyB0byB0aGUgbmV3bHkgY3JlYXRlZCBQUiBpZiBwcm92aWRlZCBpbiB0aGUgY29uZmlndXJhdGlvbi5cbiAgICBpZiAodGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5pc3N1ZXMuYWRkTGFiZWxzKHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IGRhdGEubnVtYmVyLFxuICAgICAgICBsYWJlbHM6IHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBwdWxsIHJlcXVlc3QgIyR7ZGF0YS5udW1iZXJ9IGluICR7cmVwb1NsdWd9LmApKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRhdGEubnVtYmVyLFxuICAgICAgdXJsOiBkYXRhLmh0bWxfdXJsLFxuICAgICAgZm9yayxcbiAgICAgIGZvcmtCcmFuY2g6IGJyYW5jaE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCB0byBiZSBtZXJnZWQuIERlZmF1bHQgaW50ZXJ2YWwgZm9yIGNoZWNraW5nIHRoZSBHaXRodWJcbiAgICogQVBJIGlzIDEwIHNlY29uZHMgKHRvIG5vdCBleGNlZWQgYW55IHJhdGUgbGltaXRzKS4gSWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBjbG9zZWQgd2l0aG91dFxuICAgKiBtZXJnZSwgdGhlIHNjcmlwdCB3aWxsIGFib3J0IGdyYWNlZnVsbHkgKGNvbnNpZGVyaW5nIGEgbWFudWFsIHVzZXIgYWJvcnQpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQ6IG51bWJlciwgaW50ZXJ2YWwgPSB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbCk6XG4gICAgICBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gbWVyZ2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwclN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIHdhcm4oeWVsbG93KGAgIOKcmCAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gY2xvc2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlamVjdChuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIHJlbGVhc2VzIG5vdGVzIGZvciBhIHZlcnNpb24gcHVibGlzaGVkIGluIGEgZ2l2ZW4gYnJhbmNoIHRvIHRoZSBjaGFuZ2Vsb2cgaW5cbiAgICogdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cuXG4gICAqIEByZXR1cm5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHJlbGVhc2Ugbm90ZXMgaGF2ZSBiZWVuIHByZXBlbmRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZ1BhdGggPSBnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoKHRoaXMucHJvamVjdERpcik7XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2cgPSBhd2FpdCBmcy5yZWFkRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsICd1dGY4Jyk7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzRW50cnkgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCBgJHtyZWxlYXNlTm90ZXNFbnRyeX1cXG5cXG4ke2xvY2FsQ2hhbmdlbG9nfWApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCB0aGUgY2hhbmdlbG9nIHRvIGNhcHR1cmUgY2hhbmdlcyBmb3IgXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgb3V0IGFuIHVwc3RyZWFtIGJyYW5jaCB3aXRoIGEgZGV0YWNoZWQgaGVhZC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0VXBzdHJlYW1CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGJyYW5jaE5hbWVdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICdGRVRDSF9IRUFEJywgJy0tZGV0YWNoJ10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgZmlsZXMgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSBmb3IgdGhlIGNyZWF0ZWQgY29tbWl0XG4gICAqIEBwYXJhbSBmaWxlcyBMaXN0IG9mIHByb2plY3QtcmVsYXRpdmUgZmlsZSBwYXRocyB0byBiZSBjb21taXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhXG4gICAqIHB1bGwgcmVxdWVzdCB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwdWxsUmVxdWVzdEJhc2VCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPHtyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0fT4ge1xuICAgIGNvbnN0IHJlbGVhc2VOb3RlcyA9XG4gICAgICAgIGF3YWl0IFJlbGVhc2VOb3Rlcy5mcm9tUmFuZ2UobmV3VmVyc2lvbiwgdGhpcy5naXQuZ2V0TGF0ZXN0U2VtdmVyVGFnKCkuZm9ybWF0KCksICdIRUFEJyk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uKTtcblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBwdWxsUmVxdWVzdEJhc2VCcmFuY2gsIGByZWxlYXNlLXN0YWdlLSR7bmV3VmVyc2lvbn1gLFxuICAgICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUmVsZWFzZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgcmV0dXJuIHtyZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaCwgdmVyaWZpZXMgaXRzIENJIHN0YXR1cyBhbmQgc3RhZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gaW4gb3JkZXIgdG8gY3JlYXRlIGEgcHVsbCByZXF1ZXN0LlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKHN0YWdpbmdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChzdGFnaW5nQnJhbmNoKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBzdGFnaW5nQnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgYSB2ZXJzaW9uIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCB0byBhIGdpdmVuIGJyYW5jaFxuICAgKiBpbnRvIHRoZSBgbmV4dGAgcHJpbWFyeSBkZXZlbG9wbWVudCBicmFuY2guIEEgcHVsbCByZXF1ZXN0IGlzIGNyZWF0ZWQgZm9yIHRoaXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3NmdWwgY3JlYXRpb24gb2YgdGhlIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2goXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcywgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgbmV4dEJyYW5jaCA9IHRoaXMuYWN0aXZlLm5leHQuYnJhbmNoTmFtZTtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZShyZWxlYXNlTm90ZXMudmVyc2lvbik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgbmV4dCBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuXG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdCBmb3I6IFwiJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1cIi5gKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkIGJ5IHRoZSBjYXJldGFrZXIuXG4gICAgY29uc3Qge3VybCwgaWR9ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgY2hhbmdlbG9nLWNoZXJyeS1waWNrLSR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCwgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmApO1xuXG4gICAgaW5mbyhncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3VybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAqIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWQgYnkgdGFnZ2luZyB0aGUgc3BlY2lmaWVkIGNvbW1pdCBTSEEuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nLCBwcmVyZWxlYXNlOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHJlbGVhc2VOb3Rlcy52ZXJzaW9uLmZvcm1hdCgpO1xuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5naXQuY3JlYXRlUmVmKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogYHJlZnMvdGFncy8ke3RhZ05hbWV9YCxcbiAgICAgIHNoYTogdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBUYWdnZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICAgIHByZXJlbGVhc2UsXG4gICAgICBib2R5OiBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCksXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSBuZXdWZXJzaW9uIFRoZSBuZXcgdmVyc2lvbiB0byBiZSBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSBwdWJsaXNoQnJhbmNoIE5hbWUgb2YgdGhlIGJyYW5jaCB0aGF0IGNvbnRhaW5zIHRoZSBuZXcgdmVyc2lvbi5cbiAgICogQHBhcmFtIG5wbURpc3RUYWcgTlBNIGRpc3QgdGFnIHdoZXJlIHRoZSB2ZXJzaW9uIHNob3VsZCBiZSBwdWJsaXNoZWQgdG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGRBbmRQdWJsaXNoKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1Ymxpc2hCcmFuY2g6IHN0cmluZywgbnBtRGlzdFRhZzogc3RyaW5nKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5faXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgdmVyc2lvbkJ1bXBDb21taXRTaGEpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgTGF0ZXN0IGNvbW1pdCBpbiBcIiR7cHVibGlzaEJyYW5jaH1cIiBicmFuY2ggaXMgbm90IGEgc3RhZ2luZyBjb21taXQuYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuJykpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIHB1Ymxpc2ggYnJhbmNoIGFuZCBidWlsZCB0aGUgcmVsZWFzZSBwYWNrYWdlcy5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwcm9qZWN0IGRlcGVuZGVuY2llcyBmb3IgdGhlIHB1Ymxpc2ggYnJhbmNoLCBhbmQgdGhlbiBidWlsZCB0aGUgcmVsZWFzZVxuICAgIC8vIHBhY2thZ2VzLiBOb3RlIHRoYXQgd2UgZG8gbm90IGRpcmVjdGx5IGNhbGwgdGhlIGJ1aWxkIHBhY2thZ2VzIGZ1bmN0aW9uIGZyb20gdGhlIHJlbGVhc2VcbiAgICAvLyBjb25maWcuIFdlIG9ubHkgd2FudCB0byBidWlsZCBhbmQgcHVibGlzaCBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGluIHRoZSBnaXZlblxuICAgIC8vIHB1Ymxpc2ggYnJhbmNoLiBlLmcuIGNvbnNpZGVyIHdlIHB1Ymxpc2ggcGF0Y2ggdmVyc2lvbiBhbmQgYSBuZXcgcGFja2FnZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgaW4gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBuZXcgcGFja2FnZSB3b3VsZCBub3QgYmUgcGFydCBvZiB0aGUgcGF0Y2ggYnJhbmNoLFxuICAgIC8vIHNvIHdlIGNhbm5vdCBidWlsZCBhbmQgcHVibGlzaCBpdC5cbiAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMocmVsZWFzZU5vdGVzLnZlcnNpb24sIGJ1aWx0UGFja2FnZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBuZXcgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgICAgcmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSwgbnBtRGlzdFRhZyA9PT0gJ25leHQnKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogc3RyaW5nKSB7XG4gICAgZGVidWcoYFN0YXJ0aW5nIHB1Ymxpc2ggb2YgXCIke3BrZy5uYW1lfVwiLmApO1xuICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBQdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bk5wbVB1Ymxpc2gocGtnLm91dHB1dFBhdGgsIG5wbURpc3RUYWcsIHRoaXMuY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiLmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gY29tbWl0IHJlcHJlc2VudHMgYSBzdGFnaW5nIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGNvbW1pdFNoYTogc3RyaW5nKSB7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG5cbiAgLyoqIFZlcmlmeSB0aGUgdmVyc2lvbiBvZiBlYWNoIGdlbmVyYXRlZCBwYWNrYWdlIGV4YWN0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlQYWNrYWdlVmVyc2lvbnModmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdKSB7XG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID1cbiAgICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKGpvaW4ocGtnLm91dHB1dFBhdGgsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKSkgYXNcbiAgICAgICAgICB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgaWYgKHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn1gKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==