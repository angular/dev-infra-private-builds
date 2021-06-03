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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsSUFBSSxFQUFFLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDbEMsT0FBTyxLQUFLLEdBQUcsTUFBTSxLQUFLLENBQUM7QUFDM0IsT0FBTyxFQUFDLElBQUksRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUcxQixPQUFPLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRWhHLE9BQU8sRUFBQyx5QkFBeUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLDZCQUE2QixDQUFDO0FBRTNGLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUdwRCxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sMkJBQTJCLENBQUM7QUFFeEQsT0FBTyxFQUFDLHVCQUF1QixFQUFFLDZCQUE2QixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDdkYsT0FBTyxFQUFDLDBCQUEwQixFQUFFLHFDQUFxQyxFQUFDLE1BQU0sa0JBQWtCLENBQUM7QUFDbkcsT0FBTyxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsMEJBQTBCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkYsT0FBTyxFQUFDLHlCQUF5QixFQUFFLHdCQUF3QixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDeEYsT0FBTyxFQUFDLHlCQUF5QixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUE0QnpEOzs7O0dBSUc7QUFDSCxNQUFNLE9BQWdCLGFBQWE7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QUFRLEVBQUU7Z0JBQzFCLE1BQU0sRUFBQyxPQUFPLEVBQUUsa0JBQWtCLEVBQUMsR0FDL0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQ3JDLENBQUM7Z0JBQzFDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDN0MsS0FBSyxDQUFDLEdBQUcsQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDLENBQUM7b0JBQ25GLEtBQUssQ0FBQyx3QkFBd0IsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ2pELEtBQUssQ0FBQyx3QkFBd0Isa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO29CQUNwRCxNQUFNLElBQUksdUJBQXVCLEVBQUUsQ0FBQztpQkFDckM7YUFDRjtRQUNILENBQUM7S0FBQTtDQUNGIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgZnN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldExpc3RDb21taXRzSW5CcmFuY2hVcmwsIGdldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aCwgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7aW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIFJlbGVhc2VDb25maWcsIHN0cmluZ10pOiBUO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGEgcmVsZWFzZSBhY3Rpb24uIEEgcmVsZWFzZSBhY3Rpb24gaXMgc2VsZWN0YWJsZSBieSB0aGUgY2FyZXRha2VyXG4gKiBpZiBhY3RpdmUsIGFuZCBjYW4gcGVyZm9ybSBjaGFuZ2VzIGZvciByZWxlYXNpbmcsIHN1Y2ggYXMgc3RhZ2luZyBhIHJlbGVhc2UsIGJ1bXBpbmcgdGhlXG4gKiB2ZXJzaW9uLCBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLCBicmFuY2hpbmcgb2ZmIGZyb20gbWFzdGVyLiBldGMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIHN0YXRpYyBpc0FjdGl2ZShfdHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiBmb3IgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgYWJzdHJhY3QgZ2V0RGVzY3JpcHRpb24oKTogUHJvbWlzZTxzdHJpbmc+O1xuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGdpdmVuIHJlbGVhc2UgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgdXNlciBtYW51YWxseSBhYm9ydGVkIHRoZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gYSBmYXRhbCBlcnJvci5cbiAgICovXG4gIGFic3RyYWN0IHBlcmZvcm0oKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogQ2FjaGVkIGZvdW5kIGZvcmsgb2YgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkRm9ya1JlcG86IEdpdGh1YlJlcG98bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBwcm90ZWN0ZWQgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgICAgcHJvdGVjdGVkIGNvbmZpZzogUmVsZWFzZUNvbmZpZywgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZykge31cblxuICAvKiogVXBkYXRlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPVxuICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgIHBrZ0pzb24udmVyc2lvbiA9IG5ld1ZlcnNpb24uZm9ybWF0KCk7XG4gICAgLy8gV3JpdGUgdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuIE5vdGUgdGhhdCB3ZSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZVxuICAgIC8vIHRvIGF2b2lkIHVubmVjZXNzYXJ5IGRpZmYuIElERXMgdXN1YWxseSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZS5cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGtnSnNvblBhdGgsIGAke0pTT04uc3RyaW5naWZ5KHBrZ0pzb24sIG51bGwsIDIpfVxcbmApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCBwcm9qZWN0IHZlcnNpb24gdG8gJHtwa2dKc29uLnZlcnNpb259YCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBvZiBhIHNwZWNpZmllZCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2RhdGE6IHtjb21taXR9fSA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBicmFuY2hOYW1lfSk7XG4gICAgcmV0dXJuIGNvbW1pdC5zaGE7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCB0aGUgbGF0ZXN0IGNvbW1pdCBmb3IgdGhlIGdpdmVuIGJyYW5jaCBpcyBwYXNzaW5nIGFsbCBzdGF0dXNlcy4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZSk7XG4gICAgY29uc3Qge2RhdGE6IHtzdGF0ZX19ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIGNvbnN0IGJyYW5jaENvbW1pdHNVcmwgPSBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHRoaXMuZ2l0LCBicmFuY2hOYW1lKTtcblxuICAgIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICByZWQoYCAg4pyYICAgQ2Fubm90IHN0YWdlIHJlbGVhc2UuIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIGRvZXMgbm90IHBhc3MgYWxsIGdpdGh1YiBgICtcbiAgICAgICAgICAgICAgJ3N0YXR1cyBjaGVja3MuIFBsZWFzZSBtYWtlIHN1cmUgdGhpcyBjb21taXQgcGFzc2VzIGFsbCBjaGVja3MgYmVmb3JlIHJlLXJ1bm5pbmcuJykpO1xuICAgICAgZXJyb3IoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApO1xuXG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KFxuICAgICAgICAgICAgJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIGZhaWxpbmcgQ0kgY2hlY2tzLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBzdGlsbCBoYXMgcGVuZGluZyBnaXRodWIgc3RhdHVzZXMgdGhhdCBgICtcbiAgICAgICAgICAgICAgJ25lZWQgdG8gc3VjY2VlZCBiZWZvcmUgc3RhZ2luZyBhIHJlbGVhc2UuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKSk7XG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KCcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwZW5kaW5nIENJLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwYXNzaW5nIGFsbCBnaXRodWIgc3RhdHVzIGNoZWNrcy4nKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBwb3RlbnRpYWwgcmVsZWFzZSBub3RlcyBlZGl0cyB0aGF0IG5lZWQgdG8gYmUgbWFkZS4gT25jZVxuICAgKiBjb25maXJtZWQsIGEgbmV3IGNvbW1pdCBmb3IgdGhlIHJlbGVhc2UgcG9pbnQgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgJyAg4pqgICAgUGxlYXNlIHJldmlldyB0aGUgY2hhbmdlbG9nIGFuZCBlbnN1cmUgdGhhdCB0aGUgbG9nIGNvbnRhaW5zIG9ubHkgY2hhbmdlcyAnICtcbiAgICAgICAgJ3RoYXQgYXBwbHkgdG8gdGhlIHB1YmxpYyBBUEkgc3VyZmFjZS4gTWFudWFsIGNoYW5nZXMgY2FuIGJlIG1hZGUuIFdoZW4gZG9uZSwgcGxlYXNlICcgK1xuICAgICAgICAncHJvY2VlZCB3aXRoIHRoZSBwcm9tcHQgYmVsb3cuJykpO1xuXG4gICAgaWYgKCFhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIGFuZCBjb21taXQgdGhlIGNoYW5nZXM/JykpIHtcbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENvbW1pdCBtZXNzYWdlIGZvciB0aGUgcmVsZWFzZSBwb2ludC5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UobmV3VmVyc2lvbik7XG4gICAgLy8gQ3JlYXRlIGEgcmVsZWFzZSBzdGFnaW5nIGNvbW1pdCBpbmNsdWRpbmcgY2hhbmdlbG9nIGFuZCB2ZXJzaW9uIGJ1bXAuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aCwgY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHJlbGVhc2UgY29tbWl0IGZvcjogXCIke25ld1ZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb3duZWQgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCBvZiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBBYm9ydHMgdGhlXG4gICAqIHByb2Nlc3Mgd2l0aCBhbiBlcnJvciBpZiBubyBmb3JrIGNvdWxkIGJlIGZvdW5kLiBBbHNvIGNhY2hlcyB0aGUgZGV0ZXJtaW5lZCBmb3JrXG4gICAqIHJlcG9zaXRvcnkgYXMgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlciBjYW5ub3QgY2hhbmdlIGR1cmluZyBhY3Rpb24gZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTogUHJvbWlzZTxHaXRodWJSZXBvPiB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZEZvcmtSZXBvICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG87XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ3JhcGhxbChmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5LCB7b3duZXIsIG5hbWV9KTtcbiAgICBjb25zdCBmb3JrcyA9IHJlc3VsdC5yZXBvc2l0b3J5LmZvcmtzLm5vZGVzO1xuXG4gICAgaWYgKGZvcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFVuYWJsZSB0byBmaW5kIGZvcmsgZm9yIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgZW5zdXJlIHlvdSBjcmVhdGVkIGEgZm9yayBvZjogJHtvd25lcn0vJHtuYW1lfS5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3JrID0gZm9ya3NbMF07XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvID0ge293bmVyOiBmb3JrLm93bmVyLmxvZ2luLCBuYW1lOiBmb3JrLm5hbWV9O1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYnJhbmNoIG5hbWUgaXMgcmVzZXJ2ZWQgaW4gdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5LiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvOiBHaXRodWJSZXBvLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgYnJhbmNoOiBuYW1lfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiB0aGUgZXJyb3IgaGFzIGEgYHN0YXR1c2AgcHJvcGVydHkgc2V0IHRvIGA0MDRgLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgYnJhbmNoXG4gICAgICAvLyBkb2VzIG5vdCBleGlzdC4gT3RoZXJ3aXNlLCBpdCBtaWdodCBiZSBhbiBBUEkgZXJyb3IgdGhhdCB3ZSB3YW50IHRvIHJlcG9ydC9yZS10aHJvdy5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLCB0cmFja0xvY2FsQnJhbmNoOiBib29sZWFuKTpcbiAgICAgIFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9XG4gICAgICAgIGdldFJlcG9zaXRvcnlHaXRVcmwoey4uLmZvcmssIHVzZVNzaDogdGhpcy5naXQucmVtb3RlQ29uZmlnLnVzZVNzaH0sIHRoaXMuZ2l0LmdpdGh1YlRva2VuKTtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gYXdhaXQgdGhpcy5fZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUoZm9yaywgcHJvcG9zZWRCcmFuY2hOYW1lKTtcbiAgICBjb25zdCBwdXNoQXJnczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBJZiBhIGxvY2FsIGJyYW5jaCBzaG91bGQgdHJhY2sgdGhlIHJlbW90ZSBmb3JrIGJyYW5jaCwgY3JlYXRlIGEgYnJhbmNoIG1hdGNoaW5nXG4gICAgLy8gdGhlIHJlbW90ZSBicmFuY2guIExhdGVyIHdpdGggdGhlIGBnaXQgcHVzaGAsIHRoZSByZW1vdGUgaXMgc2V0IGZvciB0aGUgYnJhbmNoLlxuICAgIGlmICh0cmFja0xvY2FsQnJhbmNoKSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZSk7XG4gICAgICBwdXNoQXJncy5wdXNoKCctLXNldC11cHN0cmVhbScpO1xuICAgIH1cbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGZvcmsuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHJlcG9HaXRVcmwsIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWAsIC4uLnB1c2hBcmdzXSk7XG4gICAgcmV0dXJuIHtmb3JrLCBicmFuY2hOYW1lfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgY2hhbmdlcyB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieSB0aGUgY3VycmVudGx5XG4gICAqIGF1dGhlbnRpY2F0ZWQgdXNlci4gQSBwdWxsIHJlcXVlc3QgaXMgdGhlbiBjcmVhdGVkIGZvciB0aGUgcHVzaGVkIGNoYW5nZXMgb24gdGhlXG4gICAqIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IHRhcmdldHMgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHRhcmdldEJyYW5jaDogc3RyaW5nLCBwcm9wb3NlZEZvcmtCcmFuY2hOYW1lOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsXG4gICAgICBib2R5Pzogc3RyaW5nKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkOiBudW1iZXIsIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwpOlxuICAgICAgUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGRlYnVnKGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcblxuICAgICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuICAgICAgY29uc3QgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJTdGF0ZSA9IGF3YWl0IGdldFB1bGxSZXF1ZXN0U3RhdGUodGhpcy5naXQsIGlkKTtcbiAgICAgICAgaWYgKHByU3RhdGUgPT09ICdtZXJnZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIG1lcmdlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJTdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICB3YXJuKHllbGxvdyhgICDinJggICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIGNsb3NlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZWplY3QobmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCkpO1xuICAgICAgICB9XG4gICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGVuZCByZWxlYXNlcyBub3RlcyBmb3IgYSB2ZXJzaW9uIHB1Ymxpc2hlZCBpbiBhIGdpdmVuIGJyYW5jaCB0byB0aGUgY2hhbmdlbG9nIGluXG4gICAqIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFRoaXMgaXMgdXNlZnVsIGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLlxuICAgKiBAcmV0dXJucyBBIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSByZWxlYXNlIG5vdGVzIGhhdmUgYmVlbiBwcmVwZW5kZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2dQYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIGNoYW5nZWxvZ1BhdGgpO1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nID0gYXdhaXQgZnMucmVhZEZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCAndXRmOCcpO1xuICAgIGNvbnN0IHJlbGVhc2VOb3Rlc0VudHJ5ID0gYXdhaXQgcmVsZWFzZU5vdGVzLmdldENoYW5nZWxvZ0VudHJ5KCk7XG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgYCR7cmVsZWFzZU5vdGVzRW50cnl9XFxuXFxuJHtsb2NhbENoYW5nZWxvZ31gKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgdGhlIGNoYW5nZWxvZyB0byBjYXB0dXJlIGNoYW5nZXMgZm9yIFwiJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKiogQ2hlY2tzIG91dCBhbiB1cHN0cmVhbSBicmFuY2ggd2l0aCBhIGRldGFjaGVkIGhlYWQuICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dFVwc3RyZWFtQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2ZldGNoJywgJy1xJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBicmFuY2hOYW1lXSk7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnRkVUQ0hfSEVBRCcsICctLWRldGFjaCddKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIGZpbGVzIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgZm9yIHRoZSBjcmVhdGVkIGNvbW1pdFxuICAgKiBAcGFyYW0gZmlsZXMgTGlzdCBvZiBwcm9qZWN0LXJlbGF0aXZlIGZpbGUgcGF0aHMgdG8gYmUgY29tbWl0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlQ29tbWl0KG1lc3NhZ2U6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY29tbWl0JywgJy0tbm8tdmVyaWZ5JywgJy1tJywgbWVzc2FnZSwgLi4uZmlsZXNdKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFN0YWdlcyB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCBicmFuY2ggYW5kIGNyZWF0ZXMgYVxuICAgKiBwdWxsIHJlcXVlc3QgdGhhdCB0YXJnZXRzIHRoZSBnaXZlbiBiYXNlIGJyYW5jaC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHVsbFJlcXVlc3RCYXNlQnJhbmNoOiBzdHJpbmcpOlxuICAgICAgUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBjb25zdCByZWxlYXNlTm90ZXMgPVxuICAgICAgICBhd2FpdCBSZWxlYXNlTm90ZXMuZnJvbVJhbmdlKG5ld1ZlcnNpb24sIHRoaXMuZ2l0LmdldExhdGVzdFNlbXZlclRhZygpLmZvcm1hdCgpLCAnSEVBRCcpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgcHVsbFJlcXVlc3RCYXNlQnJhbmNoLCBgcmVsZWFzZS1zdGFnZS0ke25ld1ZlcnNpb259YCxcbiAgICAgICAgYEJ1bXAgdmVyc2lvbiB0byBcInYke25ld1ZlcnNpb259XCIgd2l0aCBjaGFuZ2Vsb2cuYCk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiB7cmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPHtyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0fT4ge1xuICAgIGF3YWl0IHRoaXMudmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhzdGFnaW5nQnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2goc3RhZ2luZ0JyYW5jaCk7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgc3RhZ2luZ0JyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlcnJ5LXBpY2tzIHRoZSByZWxlYXNlIG5vdGVzIG9mIGEgdmVyc2lvbiB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgdG8gYSBnaXZlbiBicmFuY2hcbiAgICogaW50byB0aGUgYG5leHRgIHByaW1hcnkgZGV2ZWxvcG1lbnQgYnJhbmNoLiBBIHB1bGwgcmVxdWVzdCBpcyBjcmVhdGVkIGZvciB0aGlzLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzZnVsIGNyZWF0aW9uIG9mIHRoZSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQgZm9yOiBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZCBieSB0aGUgY2FyZXRha2VyLlxuICAgIGNvbnN0IHt1cmwsIGlkfSA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYGNoYW5nZWxvZy1jaGVycnktcGljay0ke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsIGNvbW1pdE1lc3NhZ2UsXG4gICAgICAgIGBDaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmcm9tIHRoZSBcIiR7c3RhZ2luZ0JyYW5jaH1cIiBicmFuY2ggdG8gdGhlIG5leHQgYCArXG4gICAgICAgICAgICBgYnJhbmNoICgke25leHRCcmFuY2h9KS5gKTtcblxuICAgIGluZm8oZ3JlZW4oXG4gICAgICAgIGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZyBpbnRvIFwiJHtuZXh0QnJhbmNofVwiIGAgK1xuICAgICAgICAnaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHt1cmx9LmApKTtcblxuICAgIC8vIFdhaXQgZm9yIHRoZSBQdWxsIFJlcXVlc3QgdG8gYmUgbWVyZ2VkLlxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgKiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkIGJ5IHRhZ2dpbmcgdGhlIHNwZWNpZmllZCBjb21taXQgU0hBLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgdmVyc2lvbkJ1bXBDb21taXRTaGE6IHN0cmluZywgcHJlcmVsZWFzZTogYm9vbGVhbikge1xuICAgIGNvbnN0IHRhZ05hbWUgPSByZWxlYXNlTm90ZXMudmVyc2lvbi5mb3JtYXQoKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIHVwc3RyZWFtLmApKTtcblxuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5jcmVhdGVSZWxlYXNlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIG5hbWU6IGB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLFxuICAgICAgdGFnX25hbWU6IHRhZ05hbWUsXG4gICAgICBwcmVyZWxlYXNlLFxuICAgICAgYm9keTogYXdhaXQgcmVsZWFzZU5vdGVzLmdldEdpdGh1YlJlbGVhc2VFbnRyeSgpLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSBpbiBHaXRodWIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcHVibGlzaGVzIHRoZSBnaXZlbiB2ZXJzaW9uIGluIHRoZSBzcGVjaWZpZWQgYnJhbmNoLlxuICAgKiBAcGFyYW0gcmVsZWFzZU5vdGVzIFRoZSByZWxlYXNlIG5vdGVzIGZvciB0aGUgdmVyc2lvbiBiZWluZyBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSBwdWJsaXNoQnJhbmNoIE5hbWUgb2YgdGhlIGJyYW5jaCB0aGF0IGNvbnRhaW5zIHRoZSBuZXcgdmVyc2lvbi5cbiAgICogQHBhcmFtIG5wbURpc3RUYWcgTlBNIGRpc3QgdGFnIHdoZXJlIHRoZSB2ZXJzaW9uIHNob3VsZCBiZSBwdWJsaXNoZWQgdG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGRBbmRQdWJsaXNoKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1Ymxpc2hCcmFuY2g6IHN0cmluZywgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGNvbnN0IHZlcnNpb25CdW1wQ29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcocmVsZWFzZU5vdGVzLnZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIExhdGVzdCBjb21taXQgaW4gXCIke3B1Ymxpc2hCcmFuY2h9XCIgYnJhbmNoIGlzIG5vdCBhIHN0YWdpbmcgY29tbWl0LmApKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB0aGUgc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLicpKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrb3V0IHRoZSBwdWJsaXNoIGJyYW5jaCBhbmQgYnVpbGQgdGhlIHJlbGVhc2UgcGFja2FnZXMuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgLy8gSW5zdGFsbCB0aGUgcHJvamVjdCBkZXBlbmRlbmNpZXMgZm9yIHRoZSBwdWJsaXNoIGJyYW5jaCwgYW5kIHRoZW4gYnVpbGQgdGhlIHJlbGVhc2VcbiAgICAvLyBwYWNrYWdlcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCBkaXJlY3RseSBjYWxsIHRoZSBidWlsZCBwYWNrYWdlcyBmdW5jdGlvbiBmcm9tIHRoZSByZWxlYXNlXG4gICAgLy8gY29uZmlnLiBXZSBvbmx5IHdhbnQgdG8gYnVpbGQgYW5kIHB1Ymxpc2ggcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW5cbiAgICAvLyBwdWJsaXNoIGJyYW5jaC4gZS5nLiBjb25zaWRlciB3ZSBwdWJsaXNoIHBhdGNoIHZlcnNpb24gYW5kIGEgbmV3IHBhY2thZ2UgaGFzIGJlZW5cbiAgICAvLyBjcmVhdGVkIGluIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgbmV3IHBhY2thZ2Ugd291bGQgbm90IGJlIHBhcnQgb2YgdGhlIHBhdGNoIGJyYW5jaCxcbiAgICAvLyBzbyB3ZSBjYW5ub3QgYnVpbGQgYW5kIHB1Ymxpc2ggaXQuXG4gICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgY29uc3QgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQoKTtcblxuICAgIC8vIFZlcmlmeSB0aGUgcGFja2FnZXMgYnVpbHQgYXJlIHRoZSBjb3JyZWN0IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fdmVyaWZ5UGFja2FnZVZlcnNpb25zKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCBidWlsdFBhY2thZ2VzKTtcblxuICAgIC8vIENyZWF0ZSBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgbmV3IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgICAgIHJlbGVhc2VOb3RlcywgdmVyc2lvbkJ1bXBDb21taXRTaGEsIG5wbURpc3RUYWcgPT09ICduZXh0Jyk7XG5cbiAgICAvLyBXYWxrIHRocm91Z2ggYWxsIGJ1aWx0IHBhY2thZ2VzIGFuZCBwdWJsaXNoIHRoZW0gdG8gTlBNLlxuICAgIGZvciAoY29uc3QgYnVpbHRQYWNrYWdlIG9mIGJ1aWx0UGFja2FnZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMuX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShidWlsdFBhY2thZ2UsIG5wbURpc3RUYWcpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUHVibGlzaGVkIGFsbCBwYWNrYWdlcyBzdWNjZXNzZnVsbHknKSk7XG4gIH1cblxuICAvKiogUHVibGlzaGVzIHRoZSBnaXZlbiBidWlsdCBwYWNrYWdlIHRvIE5QTSB3aXRoIHRoZSBzcGVjaWZpZWQgTlBNIGRpc3QgdGFnLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0ocGtnOiBCdWlsdFBhY2thZ2UsIG5wbURpc3RUYWc6IE5wbURpc3RUYWcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgaW5mbyhncmVlbihgICDinJMgICBTdWNjZXNzZnVsbHkgcHVibGlzaGVkIFwiJHtwa2cubmFtZX0uYCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPVxuICAgICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpKSBhc1xuICAgICAgICAgIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgICBpZiAodmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDApIHtcbiAgICAgICAgZXJyb3IocmVkKCdUaGUgYnVpbHQgcGFja2FnZSB2ZXJzaW9uIGRvZXMgbm90IG1hdGNoIHRoZSB2ZXJzaW9uIGJlaW5nIHJlbGVhc2VkLicpKTtcbiAgICAgICAgZXJyb3IoYCAgUmVsZWFzZSBWZXJzaW9uOiAgICR7dmVyc2lvbi52ZXJzaW9ufWApO1xuICAgICAgICBlcnJvcihgICBHZW5lcmF0ZWQgVmVyc2lvbjogJHtwYWNrYWdlSnNvblZlcnNpb259YCk7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19