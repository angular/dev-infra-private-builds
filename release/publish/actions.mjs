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
import * as semver from 'semver';
import { debug, error, green, info, promptConfirm, red, warn, yellow } from '../../utils/console';
import { getListCommitsInBranchUrl, getRepositoryGitUrl } from '../../utils/git/github-urls';
import { ReleaseNotes } from '../notes/release-notes';
import { runNpmPublish } from '../versioning/npm-publish';
import { FatalReleaseActionError, UserAbortedReleaseActionError } from './actions-error';
import { getCommitMessageForRelease, getReleaseNoteCherryPickCommitMessage } from './commit-message';
import { changelogPath, packageJsonPath, waitForPullRequestInterval } from './constants';
import { invokeReleaseBuildCommand, invokeYarnInstallCommand } from './external-commands';
import { findOwnedForksOfRepoQuery } from './graphql-queries';
import { getPullRequestState } from './pull-request-state';
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
            this.git.run(['checkout', '-q', '-B', branchName]);
        });
    }
    /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
    pushHeadToRemoteBranch(branchName) {
        return __awaiter(this, void 0, void 0, function* () {
            // Push the local `HEAD` to the remote branch in the configured project.
            this.git.run(['push', '-q', this.git.getRepoGitUrl(), `HEAD:refs/heads/${branchName}`]);
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
            this.git.run(['push', '-q', repoGitUrl, `HEAD:refs/heads/${branchName}`, ...pushArgs]);
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
    waitForPullRequestToBeMerged({ id }, interval = waitForPullRequestInterval) {
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
            const localChangelogPath = join(this.projectDir, changelogPath);
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
            this.git.run(['checkout', '-q', 'FETCH_HEAD', '--detach']);
        });
    }
    /**
     * Creates a commit for the specified files with the given message.
     * @param message Message for the created commit
     * @param files List of project-relative file paths to be commited.
     */
    createCommit(message, files) {
        return __awaiter(this, void 0, void 0, function* () {
            this.git.run(['commit', '-q', '--no-verify', '-m', message, ...files]);
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
            const pullRequest = yield this.pushChangesToForkAndCreatePullRequest(nextBranch, `changelog-cherry-pick-${releaseNotes.version}`, commitMessage, `Cherry-picks the changelog from the "${stagingBranch}" branch to the next ` +
                `branch (${nextBranch}).`);
            info(green(`  ✓   Pull request for cherry-picking the changelog into "${nextBranch}" ` +
                'has been created.'));
            info(yellow(`      Please ask team members to review: ${pullRequest.url}.`));
            // Wait for the Pull Request to be merged.
            yield this.waitForPullRequestToBeMerged(pullRequest);
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
            /** Experimental equivalent version for packages created with the provided version. */
            const experimentalVersion = new semver.SemVer(`0.${version.major * 100 + version.minor}.${version.patch}`);
            for (const pkg of packages) {
                const { version: packageJsonVersion } = JSON.parse(yield fs.readFile(join(pkg.outputPath, 'package.json'), 'utf8'));
                const mismatchesVersion = version.compare(packageJsonVersion) !== 0;
                const mismatchesExperimental = experimentalVersion.compare(packageJsonVersion) !== 0;
                if (mismatchesExperimental && mismatchesVersion) {
                    error(red('The built package version does not match the version being released.'));
                    error(`  Release Version:   ${version.version} (${experimentalVersion.version})`);
                    error(`  Generated Version: ${packageJsonVersion}`);
                    throw new FatalReleaseActionError();
                }
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDbEMsT0FBTyxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDM0IsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUMxQixPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUVqQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWhHLE9BQU8sRUFBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBRTNGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUdwRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDZCQUE2QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLDBCQUEwQixFQUFFLHFDQUFxQyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDbkcsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkYsT0FBTyxFQUFDLHlCQUF5QixFQUFFLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7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RSxDQUFDO0tBQUE7SUFFRCx3RkFBd0Y7SUFDMUUsc0JBQXNCLENBQUMsT0FBc0IsRUFBRSxRQUF3Qjs7WUFDbkYsc0ZBQXNGO1lBQ3RGLE1BQU0sbUJBQW1CLEdBQ3JCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7WUFDbkYsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLEVBQUU7Z0JBQzFCLE1BQU0sRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUMsR0FDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQ3JDLENBQUM7Z0JBRTFDLE1BQU0saUJBQWlCLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXJGLElBQUksc0JBQXNCLElBQUksaUJBQWlCLEVBQUU7b0JBQy9DLEtBQUssQ0FBQyxHQUFHLENBQUMsc0VBQXNFLENBQUMsQ0FBQyxDQUFDO29CQUNuRixLQUFLLENBQUMsd0JBQXdCLE9BQU8sQ0FBQyxPQUFPLEtBQUssbUJBQW1CLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztvQkFDbEYsS0FBSyxDQUFDLHdCQUF3QixrQkFBa0IsRUFBRSxDQUFDLENBQUM7b0JBQ3BELE1BQU0sSUFBSSx1QkFBdUIsRUFBRSxDQUFDO2lCQUNyQzthQUNGO1FBQ0gsQ0FBQztLQUFBO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7Z2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCwgZ2V0UmVwb3NpdG9yeUdpdFVybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuaW1wb3J0IHtmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5fSBmcm9tICcuL2dyYXBocWwtcXVlcmllcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICBvd25lcjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIHB1bGwgcmVxdWVzdCAoaS5lLiB0aGUgUFIgbnVtYmVyKS4gKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIEZvcmsgY29udGFpbmluZyB0aGUgaGVhZCBicmFuY2ggb2YgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcms6IEdpdGh1YlJlcG87XG4gIC8qKiBCcmFuY2ggbmFtZSBpbiB0aGUgZm9yayB0aGF0IGRlZmluZXMgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcmtCcmFuY2g6IHN0cmluZztcbn1cblxuLyoqIENvbnN0cnVjdG9yIHR5cGUgZm9yIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIC8qKiBDb25zdHJ1Y3RzIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIG5ldyguLi5hcmdzOiBbQWN0aXZlUmVsZWFzZVRyYWlucywgQXV0aGVudGljYXRlZEdpdENsaWVudCwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIF9jb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gICAgICBwcm90ZWN0ZWQgY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgcHJvamVjdERpcjogc3RyaW5nKSB7fVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9XG4gICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZGF0YToge2NvbW1pdH19ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgICAnc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy4nKSk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIHBlbmRpbmcgQ0ksIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgVXBzdHJlYW0gY29tbWl0IGlzIHBhc3NpbmcgYWxsIGdpdGh1YiBzdGF0dXMgY2hlY2tzLicpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oeWVsbG93KFxuICAgICAgICAnICDimqAgICBQbGVhc2UgcmV2aWV3IHRoZSBjaGFuZ2Vsb2cgYW5kIGVuc3VyZSB0aGF0IHRoZSBsb2cgY29udGFpbnMgb25seSBjaGFuZ2VzICcgK1xuICAgICAgICAndGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgJyArXG4gICAgICAgICdwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy4nKSk7XG5cbiAgICBpZiAoIWF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHByb2NlZWQgYW5kIGNvbW1pdCB0aGUgY2hhbmdlcz8nKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoLCBjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcmVsZWFzZSBjb21taXQgZm9yOiBcIiR7bmV3VmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvd25lZCBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IG9mIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIEFib3J0cyB0aGVcbiAgICogcHJvY2VzcyB3aXRoIGFuIGVycm9yIGlmIG5vIGZvcmsgY291bGQgYmUgZm91bmQuIEFsc28gY2FjaGVzIHRoZSBkZXRlcm1pbmVkIGZvcmtcbiAgICogcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnksIHtvd25lciwgbmFtZX0pO1xuICAgIGNvbnN0IGZvcmtzID0gcmVzdWx0LnJlcG9zaXRvcnkuZm9ya3Mubm9kZXM7XG5cbiAgICBpZiAoZm9ya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX07XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBicmFuY2ggbmFtZSBpcyByZXNlcnZlZCBpbiB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG86IEdpdGh1YlJlcG8sIG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBicmFuY2g6IG5hbWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElmIHRoZSBlcnJvciBoYXMgYSBgc3RhdHVzYCBwcm9wZXJ0eSBzZXQgdG8gYDQwNGAsIHRoZW4gd2Uga25vdyB0aGF0IHRoZSBicmFuY2hcbiAgICAgIC8vIGRvZXMgbm90IGV4aXN0LiBPdGhlcndpc2UsIGl0IG1pZ2h0IGJlIGFuIEFQSSBlcnJvciB0aGF0IHdlIHdhbnQgdG8gcmVwb3J0L3JlLXRocm93LlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKiogRmluZHMgYSBub24tcmVzZXJ2ZWQgYnJhbmNoIG5hbWUgaW4gdGhlIHJlcG9zaXRvcnkgd2l0aCByZXNwZWN0IHRvIGEgYmFzZSBuYW1lLiAqL1xuICBwcml2YXRlIGFzeW5jIF9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShyZXBvOiBHaXRodWJSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgY3VycmVudE5hbWUgPSBiYXNlTmFtZTtcbiAgICBsZXQgc3VmZml4TnVtID0gMDtcbiAgICB3aGlsZSAoYXdhaXQgdGhpcy5faXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbywgY3VycmVudE5hbWUpKSB7XG4gICAgICBzdWZmaXhOdW0rKztcbiAgICAgIGN1cnJlbnROYW1lID0gYCR7YmFzZU5hbWV9XyR7c3VmZml4TnVtfWA7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50TmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbG9jYWwgYnJhbmNoIGZyb20gdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gV2lsbCBvdmVycmlkZVxuICAgKiBleGlzdGluZyBicmFuY2hlcyBpbiBjYXNlIG9mIGEgY29sbGlzaW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLXEnLCAnLUInLCBicmFuY2hOYW1lXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gdGhlIGdpdmVuIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hIZWFkVG9SZW1vdGVCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5XG4gICAqIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIElmIHRoZSBzcGVjaWZpZWQgYnJhbmNoIG5hbWUgZXhpc3RzIGluIHRoZSBmb3JrIGFscmVhZHksIGFcbiAgICogdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgcHJvcG9zZWQgbmFtZSB0byBhdm9pZCBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0gcHJvcG9zZWRCcmFuY2hOYW1lIFByb3Bvc2VkIGJyYW5jaCBuYW1lIGZvciB0aGUgZm9yay5cbiAgICogQHBhcmFtIHRyYWNrTG9jYWxCcmFuY2ggV2hldGhlciB0aGUgZm9yayBicmFuY2ggc2hvdWxkIGJlIHRyYWNrZWQgbG9jYWxseS4gaS5lLiB3aGV0aGVyXG4gICAqICAgYSBsb2NhbCBicmFuY2ggd2l0aCByZW1vdGUgdHJhY2tpbmcgc2hvdWxkIGJlIHNldCB1cC5cbiAgICogQHJldHVybnMgVGhlIGZvcmsgYW5kIGJyYW5jaCBuYW1lIGNvbnRhaW5pbmcgdGhlIHB1c2hlZCBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRCcmFuY2hOYW1lOiBzdHJpbmcsIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4pOlxuICAgICAgUHJvbWlzZTx7Zm9yazogR2l0aHViUmVwbywgYnJhbmNoTmFtZTogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGZvcmsgPSBhd2FpdCB0aGlzLl9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpO1xuICAgIC8vIENvbXB1dGUgYSByZXBvc2l0b3J5IFVSTCBmb3IgcHVzaGluZyB0byB0aGUgZm9yay4gTm90ZSB0aGF0IHdlIHdhbnQgdG8gcmVzcGVjdFxuICAgIC8vIHRoZSBTU0ggb3B0aW9uIGZyb20gdGhlIGRldi1pbmZyYSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgICBjb25zdCByZXBvR2l0VXJsID1cbiAgICAgICAgZ2V0UmVwb3NpdG9yeUdpdFVybCh7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSwgdGhpcy5naXQuZ2l0aHViVG9rZW4pO1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCB0aGlzLl9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShmb3JrLCBwcm9wb3NlZEJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHB1c2hBcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIElmIGEgbG9jYWwgYnJhbmNoIHNob3VsZCB0cmFjayB0aGUgcmVtb3RlIGZvcmsgYnJhbmNoLCBjcmVhdGUgYSBicmFuY2ggbWF0Y2hpbmdcbiAgICAvLyB0aGUgcmVtb3RlIGJyYW5jaC4gTGF0ZXIgd2l0aCB0aGUgYGdpdCBwdXNoYCwgdGhlIHJlbW90ZSBpcyBzZXQgZm9yIHRoZSBicmFuY2guXG4gICAgaWYgKHRyYWNrTG9jYWxCcmFuY2gpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lKTtcbiAgICAgIHB1c2hBcmdzLnB1c2goJy0tc2V0LXVwc3RyZWFtJyk7XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgZm9yay5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgJy1xJywgcmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YCwgLi4ucHVzaEFyZ3NdKTtcbiAgICByZXR1cm4ge2ZvcmssIGJyYW5jaE5hbWV9O1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBjaGFuZ2VzIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5IHRoZSBjdXJyZW50bHlcbiAgICogYXV0aGVudGljYXRlZCB1c2VyLiBBIHB1bGwgcmVxdWVzdCBpcyB0aGVuIGNyZWF0ZWQgZm9yIHRoZSBwdXNoZWQgY2hhbmdlcyBvbiB0aGVcbiAgICogY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2guXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsIHByb3Bvc2VkRm9ya0JyYW5jaE5hbWU6IHN0cmluZywgdGl0bGU6IHN0cmluZyxcbiAgICAgIGJvZHk/OiBzdHJpbmcpOiBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgY29uc3QgcmVwb1NsdWcgPSBgJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMub3duZXJ9LyR7dGhpcy5naXQucmVtb3RlUGFyYW1zLnJlcG99YDtcbiAgICBjb25zdCB7Zm9yaywgYnJhbmNoTmFtZX0gPSBhd2FpdCB0aGlzLl9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEZvcmtCcmFuY2hOYW1lLCB0cnVlKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMuY3JlYXRlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIGhlYWQ6IGAke2Zvcmsub3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgYmFzZTogdGFyZ2V0QnJhbmNoLFxuICAgICAgYm9keSxcbiAgICAgIHRpdGxlLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGxhYmVscyB0byB0aGUgbmV3bHkgY3JlYXRlZCBQUiBpZiBwcm92aWRlZCBpbiB0aGUgY29uZmlndXJhdGlvbi5cbiAgICBpZiAodGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5pc3N1ZXMuYWRkTGFiZWxzKHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IGRhdGEubnVtYmVyLFxuICAgICAgICBsYWJlbHM6IHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBwdWxsIHJlcXVlc3QgIyR7ZGF0YS5udW1iZXJ9IGluICR7cmVwb1NsdWd9LmApKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRhdGEubnVtYmVyLFxuICAgICAgdXJsOiBkYXRhLmh0bWxfdXJsLFxuICAgICAgZm9yayxcbiAgICAgIGZvcmtCcmFuY2g6IGJyYW5jaE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCB0byBiZSBtZXJnZWQuIERlZmF1bHQgaW50ZXJ2YWwgZm9yIGNoZWNraW5nIHRoZSBHaXRodWJcbiAgICogQVBJIGlzIDEwIHNlY29uZHMgKHRvIG5vdCBleGNlZWQgYW55IHJhdGUgbGltaXRzKS4gSWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBjbG9zZWQgd2l0aG91dFxuICAgKiBtZXJnZSwgdGhlIHNjcmlwdCB3aWxsIGFib3J0IGdyYWNlZnVsbHkgKGNvbnNpZGVyaW5nIGEgbWFudWFsIHVzZXIgYWJvcnQpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoXG4gICAgICB7aWR9OiBQdWxsUmVxdWVzdCwgaW50ZXJ2YWwgPSB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNvbW1pdChtZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctcScsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdGFnZXMgdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFuZCBjcmVhdGVzIGFcbiAgICogcHVsbCByZXF1ZXN0IHRoYXQgdGFyZ2V0cyB0aGUgZ2l2ZW4gYmFzZSBicmFuY2guXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzID1cbiAgICAgICAgYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShuZXdWZXJzaW9uLCB0aGlzLmdpdC5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKSwgJ0hFQUQnKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaCwgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICAgIGBCdW1wIHZlcnNpb24gdG8gXCJ2JHtuZXdWZXJzaW9ufVwiIHdpdGggY2hhbmdlbG9nLmApO1xuXG4gICAgaW5mbyhncmVlbignICDinJMgICBSZWxlYXNlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICByZXR1cm4ge3JlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3R9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLCB2ZXJpZmllcyBpdHMgQ0kgc3RhdHVzIGFuZCBzdGFnZXNcbiAgICogdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBpbiBvcmRlciB0byBjcmVhdGUgYSBwdWxsIHJlcXVlc3QuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOlxuICAgICAgUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIHN0YWdpbmdCcmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYGNoYW5nZWxvZy1jaGVycnktcGljay0ke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsIGNvbW1pdE1lc3NhZ2UsXG4gICAgICAgIGBDaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmcm9tIHRoZSBcIiR7c3RhZ2luZ0JyYW5jaH1cIiBicmFuY2ggdG8gdGhlIG5leHQgYCArXG4gICAgICAgICAgICBgYnJhbmNoICgke25leHRCcmFuY2h9KS5gKTtcblxuICAgIGluZm8oZ3JlZW4oXG4gICAgICAgIGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZyBpbnRvIFwiJHtuZXh0QnJhbmNofVwiIGAgK1xuICAgICAgICAnaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBQdWxsIFJlcXVlc3QgdG8gYmUgbWVyZ2VkLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgKiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkIGJ5IHRhZ2dpbmcgdGhlIHNwZWNpZmllZCBjb21taXQgU0hBLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgdmVyc2lvbkJ1bXBDb21taXRTaGE6IHN0cmluZywgcHJlcmVsZWFzZTogYm9vbGVhbikge1xuICAgIGNvbnN0IHRhZ05hbWUgPSByZWxlYXNlTm90ZXMudmVyc2lvbi5mb3JtYXQoKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIHVwc3RyZWFtLmApKTtcblxuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5jcmVhdGVSZWxlYXNlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIG5hbWU6IGB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLFxuICAgICAgdGFnX25hbWU6IHRhZ05hbWUsXG4gICAgICBwcmVyZWxlYXNlLFxuICAgICAgYm9keTogYXdhaXQgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSBpbiBHaXRodWIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcHVibGlzaGVzIHRoZSBnaXZlbiB2ZXJzaW9uIGluIHRoZSBzcGVjaWZpZWQgYnJhbmNoLlxuICAgKiBAcGFyYW0gcmVsZWFzZU5vdGVzIFRoZSByZWxlYXNlIG5vdGVzIGZvciB0aGUgdmVyc2lvbiBiZWluZyBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSBwdWJsaXNoQnJhbmNoIE5hbWUgb2YgdGhlIGJyYW5jaCB0aGF0IGNvbnRhaW5zIHRoZSBuZXcgdmVyc2lvbi5cbiAgICogQHBhcmFtIG5wbURpc3RUYWcgTlBNIGRpc3QgdGFnIHdoZXJlIHRoZSB2ZXJzaW9uIHNob3VsZCBiZSBwdWJsaXNoZWQgdG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGRBbmRQdWJsaXNoKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1Ymxpc2hCcmFuY2g6IHN0cmluZywgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGNvbnN0IHZlcnNpb25CdW1wQ29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcocmVsZWFzZU5vdGVzLnZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIExhdGVzdCBjb21taXQgaW4gXCIke3B1Ymxpc2hCcmFuY2h9XCIgYnJhbmNoIGlzIG5vdCBhIHN0YWdpbmcgY29tbWl0LmApKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB0aGUgc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLicpKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrb3V0IHRoZSBwdWJsaXNoIGJyYW5jaCBhbmQgYnVpbGQgdGhlIHJlbGVhc2UgcGFja2FnZXMuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgLy8gSW5zdGFsbCB0aGUgcHJvamVjdCBkZXBlbmRlbmNpZXMgZm9yIHRoZSBwdWJsaXNoIGJyYW5jaCwgYW5kIHRoZW4gYnVpbGQgdGhlIHJlbGVhc2VcbiAgICAvLyBwYWNrYWdlcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCBkaXJlY3RseSBjYWxsIHRoZSBidWlsZCBwYWNrYWdlcyBmdW5jdGlvbiBmcm9tIHRoZSByZWxlYXNlXG4gICAgLy8gY29uZmlnLiBXZSBvbmx5IHdhbnQgdG8gYnVpbGQgYW5kIHB1Ymxpc2ggcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW5cbiAgICAvLyBwdWJsaXNoIGJyYW5jaC4gZS5nLiBjb25zaWRlciB3ZSBwdWJsaXNoIHBhdGNoIHZlcnNpb24gYW5kIGEgbmV3IHBhY2thZ2UgaGFzIGJlZW5cbiAgICAvLyBjcmVhdGVkIGluIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgbmV3IHBhY2thZ2Ugd291bGQgbm90IGJlIHBhcnQgb2YgdGhlIHBhdGNoIGJyYW5jaCxcbiAgICAvLyBzbyB3ZSBjYW5ub3QgYnVpbGQgYW5kIHB1Ymxpc2ggaXQuXG4gICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgY29uc3QgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQoKTtcblxuICAgIC8vIFZlcmlmeSB0aGUgcGFja2FnZXMgYnVpbHQgYXJlIHRoZSBjb3JyZWN0IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fdmVyaWZ5UGFja2FnZVZlcnNpb25zKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCBidWlsdFBhY2thZ2VzKTtcblxuICAgIC8vIENyZWF0ZSBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgbmV3IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgICAgIHJlbGVhc2VOb3RlcywgdmVyc2lvbkJ1bXBDb21taXRTaGEsIG5wbURpc3RUYWcgPT09ICduZXh0Jyk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGJ1aWx0IHBhY2thZ2VzIGFuZCBwdWJsaXNoIHRoZW0gdG8gTlBNLlxuICAgIGZvciAoY29uc3QgYnVpbHRQYWNrYWdlIG9mIGJ1aWx0UGFja2FnZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShidWlsdFBhY2thZ2UsIG5wbURpc3RUYWcpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUHVibGlzaGVkIGFsbCBwYWNrYWdlcyBzdWNjZXNzZnVsbHknKSk7XG4gIH1cblxuICAvKiogUHVibGlzaGVzIHRoZSBnaXZlbiBidWlsdCBwYWNrYWdlIHRvIE5QTSB3aXRoIHRoZSBzcGVjaWZpZWQgTlBNIGRpc3QgdGFnLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0ocGtnOiBCdWlsdFBhY2thZ2UsIG5wbURpc3RUYWc6IE5wbURpc3RUYWcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgaW5mbyhncmVlbihgICDinJMgICBTdWNjZXNzZnVsbHkgcHVibGlzaGVkIFwiJHtwa2cubmFtZX0uYCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICAvKiogRXhwZXJpbWVudGFsIGVxdWl2YWxlbnQgdmVyc2lvbiBmb3IgcGFja2FnZXMgY3JlYXRlZCB3aXRoIHRoZSBwcm92aWRlZCB2ZXJzaW9uLiAqL1xuICAgIGNvbnN0IGV4cGVyaW1lbnRhbFZlcnNpb24gPVxuICAgICAgICBuZXcgc2VtdmVyLlNlbVZlcihgMC4ke3ZlcnNpb24ubWFqb3IgKiAxMDAgKyB2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YCk7XG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID1cbiAgICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKGpvaW4ocGtnLm91dHB1dFBhdGgsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKSkgYXNcbiAgICAgICAgICB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gICAgICBjb25zdCBtaXNtYXRjaGVzVmVyc2lvbiA9IHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuICAgICAgY29uc3QgbWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCA9IGV4cGVyaW1lbnRhbFZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwO1xuXG4gICAgICBpZiAobWlzbWF0Y2hlc0V4cGVyaW1lbnRhbCAmJiBtaXNtYXRjaGVzVmVyc2lvbikge1xuICAgICAgICBlcnJvcihyZWQoJ1RoZSBidWlsdCBwYWNrYWdlIHZlcnNpb24gZG9lcyBub3QgbWF0Y2ggdGhlIHZlcnNpb24gYmVpbmcgcmVsZWFzZWQuJykpO1xuICAgICAgICBlcnJvcihgICBSZWxlYXNlIFZlcnNpb246ICAgJHt2ZXJzaW9uLnZlcnNpb259ICgke2V4cGVyaW1lbnRhbFZlcnNpb24udmVyc2lvbn0pYCk7XG4gICAgICAgIGVycm9yKGAgIEdlbmVyYXRlZCBWZXJzaW9uOiAke3BhY2thZ2VKc29uVmVyc2lvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=