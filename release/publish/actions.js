/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/actions", ["require", "exports", "tslib", "fs", "ora", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/external-commands", "@angular/dev-infra-private/release/publish/graphql-queries", "@angular/dev-infra-private/release/publish/pull-request-state", "@angular/dev-infra-private/release/publish/release-notes/release-notes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseAction = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var ora = require("ora");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var npm_publish_1 = require("@angular/dev-infra-private/release/versioning/npm-publish");
    var actions_error_1 = require("@angular/dev-infra-private/release/publish/actions-error");
    var commit_message_1 = require("@angular/dev-infra-private/release/publish/commit-message");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    var external_commands_1 = require("@angular/dev-infra-private/release/publish/external-commands");
    var graphql_queries_1 = require("@angular/dev-infra-private/release/publish/graphql-queries");
    var pull_request_state_1 = require("@angular/dev-infra-private/release/publish/pull-request-state");
    var release_notes_1 = require("@angular/dev-infra-private/release/publish/release-notes/release-notes");
    /**
     * Abstract base class for a release action. A release action is selectable by the caretaker
     * if active, and can perform changes for releasing, such as staging a release, bumping the
     * version, cherry-picking the changelog, branching off from master. etc.
     */
    var ReleaseAction = /** @class */ (function () {
        function ReleaseAction(active, git, config, projectDir) {
            this.active = active;
            this.git = git;
            this.config = config;
            this.projectDir = projectDir;
            /** Cached found fork of the configured project. */
            this._cachedForkRepo = null;
        }
        /** Whether the release action is currently active. */
        ReleaseAction.isActive = function (_trains) {
            throw Error('Not implemented.');
        };
        /** Updates the version in the project top-level `package.json` file. */
        ReleaseAction.prototype.updateProjectVersion = function (newVersion) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var pkgJsonPath, pkgJson, _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            pkgJsonPath = path_1.join(this.projectDir, constants_1.packageJsonPath);
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, fs_1.promises.readFile(pkgJsonPath, 'utf8')];
                        case 1:
                            pkgJson = _b.apply(_a, [_c.sent()]);
                            pkgJson.version = newVersion.format();
                            // Write the `package.json` file. Note that we add a trailing new line
                            // to avoid unnecessary diff. IDEs usually add a trailing new line.
                            return [4 /*yield*/, fs_1.promises.writeFile(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n")];
                        case 2:
                            // Write the `package.json` file. Note that we add a trailing new line
                            // to avoid unnecessary diff. IDEs usually add a trailing new line.
                            _c.sent();
                            console_1.info(console_1.green("  \u2713   Updated project version to " + pkgJson.version));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the most recent commit of a specified branch. */
        ReleaseAction.prototype._getCommitOfBranch = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commit;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.git.github.repos.getBranch(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { branch: branchName }))];
                        case 1:
                            commit = (_a.sent()).data.commit;
                            return [2 /*return*/, commit.sha];
                    }
                });
            });
        };
        /** Verifies that the latest commit for the given branch is passing all statuses. */
        ReleaseAction.prototype.verifyPassingGithubStatus = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commitSha, state, branchCommitsUrl;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getCommitOfBranch(branchName)];
                        case 1:
                            commitSha = _a.sent();
                            return [4 /*yield*/, this.git.github.repos.getCombinedStatusForRef(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { ref: commitSha }))];
                        case 2:
                            state = (_a.sent()).data.state;
                            branchCommitsUrl = github_urls_1.getListCommitsInBranchUrl(this.git, branchName);
                            if (!(state === 'failure')) return [3 /*break*/, 4];
                            console_1.error(console_1.red("  \u2718   Cannot stage release. Commit \"" + commitSha + "\" does not pass all github " +
                                'status checks. Please make sure this commit passes all checks before re-running.'));
                            console_1.error("      Please have a look at: " + branchCommitsUrl);
                            return [4 /*yield*/, console_1.promptConfirm('Do you want to ignore the Github status and proceed?')];
                        case 3:
                            if (_a.sent()) {
                                console_1.info(console_1.yellow('  ⚠   Upstream commit is failing CI checks, but status has been forcibly ignored.'));
                                return [2 /*return*/];
                            }
                            throw new actions_error_1.UserAbortedReleaseActionError();
                        case 4:
                            if (!(state === 'pending')) return [3 /*break*/, 6];
                            console_1.error(console_1.red("  \u2718   Commit \"" + commitSha + "\" still has pending github statuses that " +
                                'need to succeed before staging a release.'));
                            console_1.error(console_1.red("      Please have a look at: " + branchCommitsUrl));
                            return [4 /*yield*/, console_1.promptConfirm('Do you want to ignore the Github status and proceed?')];
                        case 5:
                            if (_a.sent()) {
                                console_1.info(console_1.yellow('  ⚠   Upstream commit is pending CI, but status has been forcibly ignored.'));
                                return [2 /*return*/];
                            }
                            throw new actions_error_1.UserAbortedReleaseActionError();
                        case 6:
                            console_1.info(console_1.green('  ✓   Upstream commit is passing all github status checks.'));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Generates the changelog for the specified for the current `HEAD`. */
        ReleaseAction.prototype._generateReleaseNotesForHead = function (version) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var changelogPath;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            changelogPath = release_notes_1.getLocalChangelogFilePath(this.projectDir);
                            return [4 /*yield*/, this.config.generateReleaseNotesForHead(changelogPath)];
                        case 1:
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Updated the changelog to capture changes for \"" + version + "\"."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Extract the release notes for the given version from the changelog file. */
        ReleaseAction.prototype._extractReleaseNotesForVersion = function (changelogContent, version) {
            var pattern = this.config.extractReleaseNotesPattern !== undefined ?
                this.config.extractReleaseNotesPattern(version) :
                release_notes_1.getDefaultExtractReleaseNotesPattern(version);
            var matchedNotes = pattern.exec(changelogContent);
            return matchedNotes === null ? null : matchedNotes[1];
        };
        /**
         * Prompts the user for potential release notes edits that need to be made. Once
         * confirmed, a new commit for the release point is created.
         */
        ReleaseAction.prototype.waitForEditsAndCreateReleaseCommit = function (newVersion) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commitMessage;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console_1.info(console_1.yellow('  ⚠   Please review the changelog and ensure that the log contains only changes ' +
                                'that apply to the public API surface. Manual changes can be made. When done, please ' +
                                'proceed with the prompt below.'));
                            return [4 /*yield*/, console_1.promptConfirm('Do you want to proceed and commit the changes?')];
                        case 1:
                            if (!(_a.sent())) {
                                throw new actions_error_1.UserAbortedReleaseActionError();
                            }
                            commitMessage = commit_message_1.getCommitMessageForRelease(newVersion);
                            // Create a release staging commit including changelog and version bump.
                            return [4 /*yield*/, this.createCommit(commitMessage, [constants_1.packageJsonPath, constants_1.changelogPath])];
                        case 2:
                            // Create a release staging commit including changelog and version bump.
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Created release commit for: \"" + newVersion + "\"."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Gets an owned fork for the configured project of the authenticated user. Aborts the
         * process with an error if no fork could be found. Also caches the determined fork
         * repository as the authenticated user cannot change during action execution.
         */
        ReleaseAction.prototype._getForkOfAuthenticatedUser = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, owner, name, result, forks, fork;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (this._cachedForkRepo !== null) {
                                return [2 /*return*/, this._cachedForkRepo];
                            }
                            _a = this.git.remoteConfig, owner = _a.owner, name = _a.name;
                            return [4 /*yield*/, this.git.github.graphql.query(graphql_queries_1.findOwnedForksOfRepoQuery, { owner: owner, name: name })];
                        case 1:
                            result = _b.sent();
                            forks = result.repository.forks.nodes;
                            if (forks.length === 0) {
                                console_1.error(console_1.red('  ✘   Unable to find fork for currently authenticated user.'));
                                console_1.error(console_1.red("      Please ensure you created a fork of: " + owner + "/" + name + "."));
                                throw new actions_error_1.FatalReleaseActionError();
                            }
                            fork = forks[0];
                            return [2 /*return*/, this._cachedForkRepo = { owner: fork.owner.login, name: fork.name }];
                    }
                });
            });
        };
        /** Checks whether a given branch name is reserved in the specified repository. */
        ReleaseAction.prototype._isBranchNameReservedInRepo = function (repo, name) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var e_1;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.git.github.repos.getBranch({ owner: repo.owner, repo: repo.name, branch: name })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, true];
                        case 2:
                            e_1 = _a.sent();
                            // If the error has a `status` property set to `404`, then we know that the branch
                            // does not exist. Otherwise, it might be an API error that we want to report/re-throw.
                            if (e_1.status === 404) {
                                return [2 /*return*/, false];
                            }
                            throw e_1;
                        case 3: return [2 /*return*/];
                    }
                });
            });
        };
        /** Finds a non-reserved branch name in the repository with respect to a base name. */
        ReleaseAction.prototype._findAvailableBranchName = function (repo, baseName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var currentName, suffixNum;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            currentName = baseName;
                            suffixNum = 0;
                            _a.label = 1;
                        case 1: return [4 /*yield*/, this._isBranchNameReservedInRepo(repo, currentName)];
                        case 2:
                            if (!_a.sent()) return [3 /*break*/, 3];
                            suffixNum++;
                            currentName = baseName + "_" + suffixNum;
                            return [3 /*break*/, 1];
                        case 3: return [2 /*return*/, currentName];
                    }
                });
            });
        };
        /**
         * Creates a local branch from the current Git `HEAD`. Will override
         * existing branches in case of a collision.
         */
        ReleaseAction.prototype.createLocalBranchFromHead = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.git.run(['checkout', '-B', branchName]);
                    return [2 /*return*/];
                });
            });
        };
        /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
        ReleaseAction.prototype.pushHeadToRemoteBranch = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Push the local `HEAD` to the remote branch in the configured project.
                    this.git.run(['push', this.git.repoGitUrl, "HEAD:refs/heads/" + branchName]);
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Pushes the current Git `HEAD` to a fork for the configured project that is owned by
         * the authenticated user. If the specified branch name exists in the fork already, a
         * unique one will be generated based on the proposed name to avoid collisions.
         * @param proposedBranchName Proposed branch name for the fork.
         * @param trackLocalBranch Whether the fork branch should be tracked locally. i.e. whether
         *   a local branch with remote tracking should be set up.
         * @returns The fork and branch name containing the pushed changes.
         */
        ReleaseAction.prototype._pushHeadToFork = function (proposedBranchName, trackLocalBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var fork, repoGitUrl, branchName, pushArgs;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this._getForkOfAuthenticatedUser()];
                        case 1:
                            fork = _a.sent();
                            repoGitUrl = github_urls_1.getRepositoryGitUrl(tslib_1.__assign(tslib_1.__assign({}, fork), { useSsh: this.git.remoteConfig.useSsh }), this.git.githubToken);
                            return [4 /*yield*/, this._findAvailableBranchName(fork, proposedBranchName)];
                        case 2:
                            branchName = _a.sent();
                            pushArgs = [];
                            if (!trackLocalBranch) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.createLocalBranchFromHead(branchName)];
                        case 3:
                            _a.sent();
                            pushArgs.push('--set-upstream');
                            _a.label = 4;
                        case 4:
                            // Push the local `HEAD` to the remote branch in the fork.
                            this.git.run(tslib_1.__spreadArray(['push', repoGitUrl, "HEAD:refs/heads/" + branchName], tslib_1.__read(pushArgs)));
                            return [2 /*return*/, { fork: fork, branchName: branchName }];
                    }
                });
            });
        };
        /**
         * Pushes changes to a fork for the configured project that is owned by the currently
         * authenticated user. A pull request is then created for the pushed changes on the
         * configured project that targets the specified target branch.
         * @returns An object describing the created pull request.
         */
        ReleaseAction.prototype.pushChangesToForkAndCreatePullRequest = function (targetBranch, proposedForkBranchName, title, body) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var repoSlug, _a, fork, branchName, data;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            repoSlug = this.git.remoteParams.owner + "/" + this.git.remoteParams.repo;
                            return [4 /*yield*/, this._pushHeadToFork(proposedForkBranchName, true)];
                        case 1:
                            _a = _b.sent(), fork = _a.fork, branchName = _a.branchName;
                            return [4 /*yield*/, this.git.github.pulls.create(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { head: fork.owner + ":" + branchName, base: targetBranch, body: body,
                                    title: title }))];
                        case 2:
                            data = (_b.sent()).data;
                            if (!(this.config.releasePrLabels !== undefined)) return [3 /*break*/, 4];
                            return [4 /*yield*/, this.git.github.issues.addLabels(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { issue_number: data.number, labels: this.config.releasePrLabels }))];
                        case 3:
                            _b.sent();
                            _b.label = 4;
                        case 4:
                            console_1.info(console_1.green("  \u2713   Created pull request #" + data.number + " in " + repoSlug + "."));
                            return [2 /*return*/, {
                                    id: data.number,
                                    url: data.html_url,
                                    fork: fork,
                                    forkBranch: branchName,
                                }];
                    }
                });
            });
        };
        /**
         * Waits for the given pull request to be merged. Default interval for checking the Github
         * API is 10 seconds (to not exceed any rate limits). If the pull request is closed without
         * merge, the script will abort gracefully (considering a manual user abort).
         */
        ReleaseAction.prototype.waitForPullRequestToBeMerged = function (id, interval) {
            if (interval === void 0) { interval = constants_1.waitForPullRequestInterval; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            console_1.debug("Waiting for pull request #" + id + " to be merged.");
                            var spinner = ora.call(undefined).start("Waiting for pull request #" + id + " to be merged.");
                            var intervalId = setInterval(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var prState;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, pull_request_state_1.getPullRequestState(this.git, id)];
                                        case 1:
                                            prState = _a.sent();
                                            if (prState === 'merged') {
                                                spinner.stop();
                                                console_1.info(console_1.green("  \u2713   Pull request #" + id + " has been merged."));
                                                clearInterval(intervalId);
                                                resolve();
                                            }
                                            else if (prState === 'closed') {
                                                spinner.stop();
                                                console_1.warn(console_1.yellow("  \u2718   Pull request #" + id + " has been closed."));
                                                clearInterval(intervalId);
                                                reject(new actions_error_1.UserAbortedReleaseActionError());
                                            }
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, interval);
                        })];
                });
            });
        };
        /**
         * Prepend releases notes for a version published in a given branch to the changelog in
         * the current Git `HEAD`. This is useful for cherry-picking the changelog.
         * @returns A boolean indicating whether the release notes have been prepended.
         */
        ReleaseAction.prototype.prependReleaseNotesFromVersionBranch = function (version, containingBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var data, branchChangelog, releaseNotes, localChangelogPath, localChangelog;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.git.github.repos.getContents(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { path: '/' + constants_1.changelogPath, ref: containingBranch }))];
                        case 1:
                            data = (_a.sent()).data;
                            branchChangelog = Buffer.from(data.content, 'base64').toString();
                            releaseNotes = this._extractReleaseNotesForVersion(branchChangelog, version);
                            // If no release notes could be extracted, return "false" so that the caller
                            // can tell that changelog prepending failed.
                            if (releaseNotes === null) {
                                return [2 /*return*/, false];
                            }
                            localChangelogPath = release_notes_1.getLocalChangelogFilePath(this.projectDir);
                            return [4 /*yield*/, fs_1.promises.readFile(localChangelogPath, 'utf8')];
                        case 2:
                            localChangelog = _a.sent();
                            // If the extracted release notes do not have any new lines at the end and the
                            // local changelog is not empty, we add lines manually so that there is space
                            // between the previous and cherry-picked release notes.
                            if (!/[\r\n]+$/.test(releaseNotes) && localChangelog !== '') {
                                releaseNotes = releaseNotes + "\n\n";
                            }
                            // Prepend the extracted release notes to the local changelog and write it back.
                            return [4 /*yield*/, fs_1.promises.writeFile(localChangelogPath, releaseNotes + localChangelog)];
                        case 3:
                            // Prepend the extracted release notes to the local changelog and write it back.
                            _a.sent();
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /** Checks out an upstream branch with a detached head. */
        ReleaseAction.prototype.checkoutUpstreamBranch = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.git.run(['fetch', '-q', this.git.repoGitUrl, branchName]);
                    this.git.run(['checkout', 'FETCH_HEAD', '--detach']);
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Creates a commit for the specified files with the given message.
         * @param message Message for the created commit
         * @param files List of project-relative file paths to be commited.
         */
        ReleaseAction.prototype.createCommit = function (message, files) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.git.run(tslib_1.__spreadArray(['commit', '--no-verify', '-m', message], tslib_1.__read(files)));
                    return [2 /*return*/];
                });
            });
        };
        /**
         * Creates a cherry-pick commit for the release notes of the specified version that
         * has been pushed to the given branch.
         * @returns a boolean indicating whether the commit has been created successfully.
         */
        ReleaseAction.prototype.createCherryPickReleaseNotesCommitFrom = function (version, branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var commitMessage;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(version);
                            return [4 /*yield*/, this.prependReleaseNotesFromVersionBranch(version, branchName)];
                        case 1:
                            // Fetch, extract and prepend the release notes to the local changelog. If that is not
                            // possible, abort so that we can ask the user to manually cherry-pick the changelog.
                            if (!(_a.sent())) {
                                return [2 /*return*/, false];
                            }
                            // Create a changelog cherry-pick commit.
                            return [4 /*yield*/, this.createCommit(commitMessage, [constants_1.changelogPath])];
                        case 2:
                            // Create a changelog cherry-pick commit.
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Created changelog cherry-pick commit for: \"" + version + "\"."));
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Stages the specified new version for the current branch and creates a
         * pull request that targets the given base branch.
         * @returns an object describing the created pull request.
         */
        ReleaseAction.prototype.stageVersionForBranchAndCreatePullRequest = function (newVersion, pullRequestBaseBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var pullRequest;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.updateProjectVersion(newVersion)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this._generateReleaseNotesForHead(newVersion)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.waitForEditsAndCreateReleaseCommit(newVersion)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, "release-stage-" + newVersion, "Bump version to \"v" + newVersion + "\" with changelog.")];
                        case 4:
                            pullRequest = _a.sent();
                            console_1.info(console_1.green('  ✓   Release staging pull request has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + pullRequest.url + "."));
                            return [2 /*return*/, pullRequest];
                    }
                });
            });
        };
        /**
         * Checks out the specified target branch, verifies its CI status and stages
         * the specified new version in order to create a pull request.
         * @returns an object describing the created pull request.
         */
        ReleaseAction.prototype.checkoutBranchAndStageVersion = function (newVersion, stagingBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.verifyPassingGithubStatus(stagingBranch)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.checkoutUpstreamBranch(stagingBranch)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.stageVersionForBranchAndCreatePullRequest(newVersion, stagingBranch)];
                        case 3: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Cherry-picks the release notes of a version that have been pushed to a given branch
         * into the `next` primary development branch. A pull request is created for this.
         * @returns a boolean indicating successful creation of the cherry-pick pull request.
         */
        ReleaseAction.prototype.cherryPickChangelogIntoNextBranch = function (newVersion, stagingBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var nextBranch, commitMessage, _a, url, id;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            nextBranch = this.active.next.branchName;
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(newVersion);
                            // Checkout the next branch.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 1:
                            // Checkout the next branch.
                            _b.sent();
                            return [4 /*yield*/, this.createCherryPickReleaseNotesCommitFrom(newVersion, stagingBranch)];
                        case 2:
                            // Cherry-pick the release notes into the current branch. If it fails,
                            // ask the user to manually copy the release notes into the next branch.
                            if (!(_b.sent())) {
                                console_1.error(console_1.yellow("  \u2718   Could not cherry-pick release notes for v" + newVersion + "."));
                                console_1.error(console_1.yellow("      Please copy the release notes manually into the \"" + nextBranch + "\" branch."));
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "changelog-cherry-pick-" + newVersion, commitMessage, "Cherry-picks the changelog from the \"" + stagingBranch + "\" branch to the next " +
                                    ("branch (" + nextBranch + ")."))];
                        case 3:
                            _a = _b.sent(), url = _a.url, id = _a.id;
                            console_1.info(console_1.green("  \u2713   Pull request for cherry-picking the changelog into \"" + nextBranch + "\" " +
                                'has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + url + "."));
                            // Wait for the Pull Request to be merged.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 4:
                            // Wait for the Pull Request to be merged.
                            _b.sent();
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Creates a Github release for the specified version in the configured project.
         * The release is created by tagging the specified commit SHA.
         */
        ReleaseAction.prototype._createGithubReleaseForVersion = function (newVersion, versionBumpCommitSha, prerelease) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var tagName;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tagName = newVersion.format();
                            return [4 /*yield*/, this.git.github.git.createRef(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { ref: "refs/tags/" + tagName, sha: versionBumpCommitSha }))];
                        case 1:
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Tagged v" + newVersion + " release upstream."));
                            return [4 /*yield*/, this.git.github.repos.createRelease(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { name: "v" + newVersion, tag_name: tagName, prerelease: prerelease }))];
                        case 2:
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Created v" + newVersion + " release in Github."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Builds and publishes the given version in the specified branch.
         * @param newVersion The new version to be published.
         * @param publishBranch Name of the branch that contains the new version.
         * @param npmDistTag NPM dist tag where the version should be published to.
         */
        ReleaseAction.prototype.buildAndPublish = function (newVersion, publishBranch, npmDistTag) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var versionBumpCommitSha, builtPackages, builtPackages_1, builtPackages_1_1, builtPackage, e_2_1;
                var e_2, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._getCommitOfBranch(publishBranch)];
                        case 1:
                            versionBumpCommitSha = _b.sent();
                            return [4 /*yield*/, this._isCommitForVersionStaging(newVersion, versionBumpCommitSha)];
                        case 2:
                            if (!(_b.sent())) {
                                console_1.error(console_1.red("  \u2718   Latest commit in \"" + publishBranch + "\" branch is not a staging commit."));
                                console_1.error(console_1.red('      Please make sure the staging pull request has been merged.'));
                                throw new actions_error_1.FatalReleaseActionError();
                            }
                            // Checkout the publish branch and build the release packages.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(publishBranch)];
                        case 3:
                            // Checkout the publish branch and build the release packages.
                            _b.sent();
                            // Install the project dependencies for the publish branch, and then build the release
                            // packages. Note that we do not directly call the build packages function from the release
                            // config. We only want to build and publish packages that have been configured in the given
                            // publish branch. e.g. consider we publish patch version and a new package has been
                            // created in the `next` branch. The new package would not be part of the patch branch,
                            // so we cannot build and publish it.
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 4:
                            // Install the project dependencies for the publish branch, and then build the release
                            // packages. Note that we do not directly call the build packages function from the release
                            // config. We only want to build and publish packages that have been configured in the given
                            // publish branch. e.g. consider we publish patch version and a new package has been
                            // created in the `next` branch. The new package would not be part of the patch branch,
                            // so we cannot build and publish it.
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeBazelCleanCommand(this.projectDir)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeReleaseBuildCommand()];
                        case 6:
                            builtPackages = _b.sent();
                            // Verify the packages built are the correct version.
                            return [4 /*yield*/, this._verifyPackageVersions(newVersion, builtPackages)];
                        case 7:
                            // Verify the packages built are the correct version.
                            _b.sent();
                            // Create a Github release for the new version.
                            return [4 /*yield*/, this._createGithubReleaseForVersion(newVersion, versionBumpCommitSha, npmDistTag === 'next')];
                        case 8:
                            // Create a Github release for the new version.
                            _b.sent();
                            _b.label = 9;
                        case 9:
                            _b.trys.push([9, 14, 15, 16]);
                            builtPackages_1 = tslib_1.__values(builtPackages), builtPackages_1_1 = builtPackages_1.next();
                            _b.label = 10;
                        case 10:
                            if (!!builtPackages_1_1.done) return [3 /*break*/, 13];
                            builtPackage = builtPackages_1_1.value;
                            return [4 /*yield*/, this._publishBuiltPackageToNpm(builtPackage, npmDistTag)];
                        case 11:
                            _b.sent();
                            _b.label = 12;
                        case 12:
                            builtPackages_1_1 = builtPackages_1.next();
                            return [3 /*break*/, 10];
                        case 13: return [3 /*break*/, 16];
                        case 14:
                            e_2_1 = _b.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 16];
                        case 15:
                            try {
                                if (builtPackages_1_1 && !builtPackages_1_1.done && (_a = builtPackages_1.return)) _a.call(builtPackages_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 16:
                            console_1.info(console_1.green('  ✓   Published all packages successfully'));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Publishes the given built package to NPM with the specified NPM dist tag. */
        ReleaseAction.prototype._publishBuiltPackageToNpm = function (pkg, npmDistTag) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var spinner, e_3;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console_1.debug("Starting publish of \"" + pkg.name + "\".");
                            spinner = ora.call(undefined).start("Publishing \"" + pkg.name + "\"");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, npm_publish_1.runNpmPublish(pkg.outputPath, npmDistTag, this.config.publishRegistry)];
                        case 2:
                            _a.sent();
                            spinner.stop();
                            console_1.info(console_1.green("  \u2713   Successfully published \"" + pkg.name + "."));
                            return [3 /*break*/, 4];
                        case 3:
                            e_3 = _a.sent();
                            spinner.stop();
                            console_1.error(e_3);
                            console_1.error(console_1.red("  \u2718   An error occurred while publishing \"" + pkg.name + "\"."));
                            throw new actions_error_1.FatalReleaseActionError();
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        /** Checks whether the given commit represents a staging commit for the specified version. */
        ReleaseAction.prototype._isCommitForVersionStaging = function (version, commitSha) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var data;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.git.github.repos.getCommit(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { ref: commitSha }))];
                        case 1:
                            data = (_a.sent()).data;
                            return [2 /*return*/, data.commit.message.startsWith(commit_message_1.getCommitMessageForRelease(version))];
                    }
                });
            });
        };
        /** Verify the version of each generated package exact matches the specified version. */
        ReleaseAction.prototype._verifyPackageVersions = function (version, packages) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var packages_1, packages_1_1, pkg, packageJsonVersion, _a, _b, e_4_1;
                var e_4, _c;
                return tslib_1.__generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 5, 6, 7]);
                            packages_1 = tslib_1.__values(packages), packages_1_1 = packages_1.next();
                            _d.label = 1;
                        case 1:
                            if (!!packages_1_1.done) return [3 /*break*/, 4];
                            pkg = packages_1_1.value;
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, fs_1.promises.readFile(path_1.join(pkg.outputPath, 'package.json'), 'utf8')];
                        case 2:
                            packageJsonVersion = _b.apply(_a, [_d.sent()]).version;
                            if (version.compare(packageJsonVersion) !== 0) {
                                console_1.error(console_1.red('The built package version does not match the version being released.'));
                                console_1.error("  Release Version:   " + version.version);
                                console_1.error("  Generated Version: " + packageJsonVersion);
                                throw new actions_error_1.FatalReleaseActionError();
                            }
                            _d.label = 3;
                        case 3:
                            packages_1_1 = packages_1.next();
                            return [3 /*break*/, 1];
                        case 4: return [3 /*break*/, 7];
                        case 5:
                            e_4_1 = _d.sent();
                            e_4 = { error: e_4_1 };
                            return [3 /*break*/, 7];
                        case 6:
                            try {
                                if (packages_1_1 && !packages_1_1.done && (_c = packages_1.return)) _c.call(packages_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                            return [7 /*endfinally*/];
                        case 7: return [2 /*return*/];
                    }
                });
            });
        };
        return ReleaseAction;
    }());
    exports.ReleaseAction = ReleaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFHMUIsb0VBQWdHO0lBQ2hHLGdGQUEyRjtJQUkzRix5RkFBd0Q7SUFFeEQsMEZBQXVGO0lBQ3ZGLDRGQUFtRztJQUNuRyxrRkFBdUY7SUFDdkYsa0dBQWlIO0lBQ2pILDhGQUE0RDtJQUM1RCxvR0FBeUQ7SUFDekQsd0dBQThHO0lBNEI5Rzs7OztPQUlHO0lBQ0g7UUFrQkUsdUJBQ2MsTUFBMkIsRUFBWSxHQUFjLEVBQ3JELE1BQXFCLEVBQVksVUFBa0I7WUFEbkQsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7WUFBWSxRQUFHLEdBQUgsR0FBRyxDQUFXO1lBQ3JELFdBQU0sR0FBTixNQUFNLENBQWU7WUFBWSxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBTGpFLG1EQUFtRDtZQUMzQyxvQkFBZSxHQUFvQixJQUFJLENBQUM7UUFJb0IsQ0FBQztRQW5CckUsc0RBQXNEO1FBQy9DLHNCQUFRLEdBQWYsVUFBZ0IsT0FBNEI7WUFDMUMsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBa0JELHdFQUF3RTtRQUN4RCw0Q0FBb0IsR0FBcEMsVUFBcUMsVUFBeUI7Ozs7Ozs0QkFDdEQsV0FBVyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLDJCQUFlLENBQUMsQ0FBQzs0QkFFdkQsS0FBQSxDQUFBLEtBQUEsSUFBSSxDQUFBLENBQUMsS0FBSyxDQUFBOzRCQUFDLHFCQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFEL0MsT0FBTyxHQUNULGNBQVcsU0FBc0Ms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Q0FBQyxLQUFLLENBQUE7NEJBQUMscUJBQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxjQUFjLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBQTs7NEJBRDlELGtCQUFrQixHQUM5QixjQUFXLFNBQStELEVBQ3JDLFFBRlA7NEJBR2xDLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBRTtnQ0FDN0MsZUFBSyxDQUFDLGFBQUcsQ0FBQyxzRUFBc0UsQ0FBQyxDQUFDLENBQUM7Z0NBQ25GLGVBQUssQ0FBQywwQkFBd0IsT0FBTyxDQUFDLE9BQVMsQ0FBQyxDQUFDO2dDQUNqRCxlQUFLLENBQUMsMEJBQXdCLGtCQUFvQixDQUFDLENBQUM7Z0NBQ3BELE1BQU0sSUFBSSx1Q0FBdUIsRUFBRSxDQUFDOzZCQUNyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7U0FFSjtRQUNILG9CQUFDO0lBQUQsQ0FBQyxBQXBnQkQsSUFvZ0JDO0lBcGdCcUIsc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsLCBnZXRSZXBvc2l0b3J5R2l0VXJsfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViLXVybHMnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VCYXplbENsZWFuQ29tbWFuZCwgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5pbXBvcnQge2dldERlZmF1bHRFeHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybiwgZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aH0gZnJvbSAnLi9yZWxlYXNlLW5vdGVzL3JlbGVhc2Utbm90ZXMnO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwbyB7XG4gIG93bmVyOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHB1bGwgcmVxdWVzdC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbFJlcXVlc3Qge1xuICAvKiogVW5pcXVlIGlkIGZvciB0aGUgcHVsbCByZXF1ZXN0IChpLmUuIHRoZSBQUiBudW1iZXIpLiAqL1xuICBpZDogbnVtYmVyO1xuICAvKiogVVJMIHRoYXQgcmVzb2x2ZXMgdG8gdGhlIHB1bGwgcmVxdWVzdCBpbiBHaXRodWIuICovXG4gIHVybDogc3RyaW5nO1xuICAvKiogRm9yayBjb250YWluaW5nIHRoZSBoZWFkIGJyYW5jaCBvZiB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgZm9yazogR2l0aHViUmVwbztcbiAgLyoqIEJyYW5jaCBuYW1lIGluIHRoZSBmb3JrIHRoYXQgZGVmaW5lcyB0aGlzIHB1bGwgcmVxdWVzdC4gKi9cbiAgZm9ya0JyYW5jaDogc3RyaW5nO1xufVxuXG4vKiogQ29uc3RydWN0b3IgdHlwZSBmb3IgaW5zdGFudGlhdGluZyBhIHJlbGVhc2UgYWN0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIFJlbGVhc2VBY3Rpb25Db25zdHJ1Y3RvcjxUIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiA9IFJlbGVhc2VBY3Rpb24+IHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIC8qKiBDb25zdHJ1Y3RzIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIG5ldyguLi5hcmdzOiBbQWN0aXZlUmVsZWFzZVRyYWlucywgR2l0Q2xpZW50LCBSZWxlYXNlQ29uZmlnLCBzdHJpbmddKTogVDtcbn1cblxuLyoqXG4gKiBBYnN0cmFjdCBiYXNlIGNsYXNzIGZvciBhIHJlbGVhc2UgYWN0aW9uLiBBIHJlbGVhc2UgYWN0aW9uIGlzIHNlbGVjdGFibGUgYnkgdGhlIGNhcmV0YWtlclxuICogaWYgYWN0aXZlLCBhbmQgY2FuIHBlcmZvcm0gY2hhbmdlcyBmb3IgcmVsZWFzaW5nLCBzdWNoIGFzIHN0YWdpbmcgYSByZWxlYXNlLCBidW1waW5nIHRoZVxuICogdmVyc2lvbiwgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZywgYnJhbmNoaW5nIG9mZiBmcm9tIG1hc3Rlci4gZXRjLlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBzdGF0aWMgaXNBY3RpdmUoX3RyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRocm93IEVycm9yKCdOb3QgaW1wbGVtZW50ZWQuJyk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgZGVzY3JpcHRpb24gZm9yIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIGFic3RyYWN0IGdldERlc2NyaXB0aW9uKCk6IFByb21pc2U8c3RyaW5nPjtcbiAgLyoqXG4gICAqIFBlcmZvcm1zIHRoZSBnaXZlbiByZWxlYXNlIGFjdGlvbi5cbiAgICogQHRocm93cyB7VXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIHVzZXIgbWFudWFsbHkgYWJvcnRlZCB0aGUgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgYWN0aW9uIGhhcyBiZWVuIGFib3J0ZWQgZHVlIHRvIGEgZmF0YWwgZXJyb3IuXG4gICAqL1xuICBhYnN0cmFjdCBwZXJmb3JtKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLyoqIENhY2hlZCBmb3VuZCBmb3JrIG9mIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByaXZhdGUgX2NhY2hlZEZvcmtSZXBvOiBHaXRodWJSZXBvfG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucywgcHJvdGVjdGVkIGdpdDogR2l0Q2xpZW50LFxuICAgICAgcHJvdGVjdGVkIGNvbmZpZzogUmVsZWFzZUNvbmZpZywgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZykge31cblxuICAvKiogVXBkYXRlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPVxuICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgIHBrZ0pzb24udmVyc2lvbiA9IG5ld1ZlcnNpb24uZm9ybWF0KCk7XG4gICAgLy8gV3JpdGUgdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuIE5vdGUgdGhhdCB3ZSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZVxuICAgIC8vIHRvIGF2b2lkIHVubmVjZXNzYXJ5IGRpZmYuIElERXMgdXN1YWxseSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZS5cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGtnSnNvblBhdGgsIGAke0pTT04uc3RyaW5naWZ5KHBrZ0pzb24sIG51bGwsIDIpfVxcbmApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCBwcm9qZWN0IHZlcnNpb24gdG8gJHtwa2dKc29uLnZlcnNpb259YCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBvZiBhIHNwZWNpZmllZCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2RhdGE6IHtjb21taXR9fSA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBicmFuY2hOYW1lfSk7XG4gICAgcmV0dXJuIGNvbW1pdC5zaGE7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCB0aGUgbGF0ZXN0IGNvbW1pdCBmb3IgdGhlIGdpdmVuIGJyYW5jaCBpcyBwYXNzaW5nIGFsbCBzdGF0dXNlcy4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZSk7XG4gICAgY29uc3Qge2RhdGE6IHtzdGF0ZX19ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIGNvbnN0IGJyYW5jaENvbW1pdHNVcmwgPSBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHRoaXMuZ2l0LCBicmFuY2hOYW1lKTtcblxuICAgIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICByZWQoYCAg4pyYICAgQ2Fubm90IHN0YWdlIHJlbGVhc2UuIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIGRvZXMgbm90IHBhc3MgYWxsIGdpdGh1YiBgICtcbiAgICAgICAgICAgICAgJ3N0YXR1cyBjaGVja3MuIFBsZWFzZSBtYWtlIHN1cmUgdGhpcyBjb21taXQgcGFzc2VzIGFsbCBjaGVja3MgYmVmb3JlIHJlLXJ1bm5pbmcuJykpO1xuICAgICAgZXJyb3IoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApO1xuXG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KFxuICAgICAgICAgICAgJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIGZhaWxpbmcgQ0kgY2hlY2tzLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBzdGlsbCBoYXMgcGVuZGluZyBnaXRodWIgc3RhdHVzZXMgdGhhdCBgICtcbiAgICAgICAgICAgICAgJ25lZWQgdG8gc3VjY2VlZCBiZWZvcmUgc3RhZ2luZyBhIHJlbGVhc2UuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKSk7XG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KCcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwZW5kaW5nIENJLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwYXNzaW5nIGFsbCBnaXRodWIgc3RhdHVzIGNoZWNrcy4nKSk7XG4gIH1cblxuICAvKiogR2VuZXJhdGVzIHRoZSBjaGFuZ2Vsb2cgZm9yIHRoZSBzcGVjaWZpZWQgZm9yIHRoZSBjdXJyZW50IGBIRUFEYC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2VuZXJhdGVSZWxlYXNlTm90ZXNGb3JIZWFkKHZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBjaGFuZ2Vsb2dQYXRoID0gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aCh0aGlzLnByb2plY3REaXIpO1xuICAgIGF3YWl0IHRoaXMuY29uZmlnLmdlbmVyYXRlUmVsZWFzZU5vdGVzRm9ySGVhZChjaGFuZ2Vsb2dQYXRoKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgdGhlIGNoYW5nZWxvZyB0byBjYXB0dXJlIGNoYW5nZXMgZm9yIFwiJHt2ZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKiBFeHRyYWN0IHRoZSByZWxlYXNlIG5vdGVzIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbiBmcm9tIHRoZSBjaGFuZ2Vsb2cgZmlsZS4gKi9cbiAgcHJpdmF0ZSBfZXh0cmFjdFJlbGVhc2VOb3Rlc0ZvclZlcnNpb24oY2hhbmdlbG9nQ29udGVudDogc3RyaW5nLCB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKTogc3RyaW5nXG4gICAgICB8bnVsbCB7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuY29uZmlnLmV4dHJhY3RSZWxlYXNlTm90ZXNQYXR0ZXJuICE9PSB1bmRlZmluZWQgP1xuICAgICAgICB0aGlzLmNvbmZpZy5leHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybih2ZXJzaW9uKSA6XG4gICAgICAgIGdldERlZmF1bHRFeHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybih2ZXJzaW9uKTtcbiAgICBjb25zdCBtYXRjaGVkTm90ZXMgPSBwYXR0ZXJuLmV4ZWMoY2hhbmdlbG9nQ29udGVudCk7XG4gICAgcmV0dXJuIG1hdGNoZWROb3RlcyA9PT0gbnVsbCA/IG51bGwgOiBtYXRjaGVkTm90ZXNbMV07XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgcG90ZW50aWFsIHJlbGVhc2Ugbm90ZXMgZWRpdHMgdGhhdCBuZWVkIHRvIGJlIG1hZGUuIE9uY2VcbiAgICogY29uZmlybWVkLCBhIG5ldyBjb21taXQgZm9yIHRoZSByZWxlYXNlIHBvaW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICcgIOKaoCAgIFBsZWFzZSByZXZpZXcgdGhlIGNoYW5nZWxvZyBhbmQgZW5zdXJlIHRoYXQgdGhlIGxvZyBjb250YWlucyBvbmx5IGNoYW5nZXMgJyArXG4gICAgICAgICd0aGF0IGFwcGx5IHRvIHRoZSBwdWJsaWMgQVBJIHN1cmZhY2UuIE1hbnVhbCBjaGFuZ2VzIGNhbiBiZSBtYWRlLiBXaGVuIGRvbmUsIHBsZWFzZSAnICtcbiAgICAgICAgJ3Byb2NlZWQgd2l0aCB0aGUgcHJvbXB0IGJlbG93LicpKTtcblxuICAgIGlmICghYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gcHJvY2VlZCBhbmQgY29tbWl0IHRoZSBjaGFuZ2VzPycpKSB7XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDb21taXQgbWVzc2FnZSBmb3IgdGhlIHJlbGVhc2UgcG9pbnQuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKG5ld1ZlcnNpb24pO1xuICAgIC8vIENyZWF0ZSBhIHJlbGVhc2Ugc3RhZ2luZyBjb21taXQgaW5jbHVkaW5nIGNoYW5nZWxvZyBhbmQgdmVyc2lvbiBidW1wLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGgsIGNoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC4gQWxzbyBjYWNoZXMgdGhlIGRldGVybWluZWQgZm9ya1xuICAgKiByZXBvc2l0b3J5IGFzIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgY2Fubm90IGNoYW5nZSBkdXJpbmcgYWN0aW9uIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZWRGb3JrUmVwbyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwucXVlcnkoZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSwge293bmVyLCBuYW1lfSk7XG4gICAgY29uc3QgZm9ya3MgPSByZXN1bHQucmVwb3NpdG9yeS5mb3Jrcy5ub2RlcztcblxuICAgIGlmIChmb3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGVuc3VyZSB5b3UgY3JlYXRlZCBhIGZvcmsgb2Y6ICR7b3duZXJ9LyR7bmFtZX0uYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9yayA9IGZvcmtzWzBdO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbyA9IHtvd25lcjogZm9yay5vd25lci5sb2dpbiwgbmFtZTogZm9yay5uYW1lfTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGJyYW5jaCBuYW1lIGlzIHJlc2VydmVkIGluIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbzogR2l0aHViUmVwbywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIGJyYW5jaDogbmFtZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgdGhlIGVycm9yIGhhcyBhIGBzdGF0dXNgIHByb3BlcnR5IHNldCB0byBgNDA0YCwgdGhlbiB3ZSBrbm93IHRoYXQgdGhlIGJyYW5jaFxuICAgICAgLy8gZG9lcyBub3QgZXhpc3QuIE90aGVyd2lzZSwgaXQgbWlnaHQgYmUgYW4gQVBJIGVycm9yIHRoYXQgd2Ugd2FudCB0byByZXBvcnQvcmUtdGhyb3cuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGaW5kcyBhIG5vbi1yZXNlcnZlZCBicmFuY2ggbmFtZSBpbiB0aGUgcmVwb3NpdG9yeSB3aXRoIHJlc3BlY3QgdG8gYSBiYXNlIG5hbWUuICovXG4gIHByaXZhdGUgYXN5bmMgX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKHJlcG86IEdpdGh1YlJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBjdXJyZW50TmFtZSA9IGJhc2VOYW1lO1xuICAgIGxldCBzdWZmaXhOdW0gPSAwO1xuICAgIHdoaWxlIChhd2FpdCB0aGlzLl9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvLCBjdXJyZW50TmFtZSkpIHtcbiAgICAgIHN1ZmZpeE51bSsrO1xuICAgICAgY3VycmVudE5hbWUgPSBgJHtiYXNlTmFtZX1fJHtzdWZmaXhOdW19YDtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnROYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBsb2NhbCBicmFuY2ggZnJvbSB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBXaWxsIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIGJyYW5jaGVzIGluIGNhc2Ugb2YgYSBjb2xsaXNpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctQicsIGJyYW5jaE5hbWVdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byB0aGUgZ2l2ZW4gcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaEhlYWRUb1JlbW90ZUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgdGhpcy5naXQucmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5XG4gICAqIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIElmIHRoZSBzcGVjaWZpZWQgYnJhbmNoIG5hbWUgZXhpc3RzIGluIHRoZSBmb3JrIGFscmVhZHksIGFcbiAgICogdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgcHJvcG9zZWQgbmFtZSB0byBhdm9pZCBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0gcHJvcG9zZWRCcmFuY2hOYW1lIFByb3Bvc2VkIGJyYW5jaCBuYW1lIGZvciB0aGUgZm9yay5cbiAgICogQHBhcmFtIHRyYWNrTG9jYWxCcmFuY2ggV2hldGhlciB0aGUgZm9yayBicmFuY2ggc2hvdWxkIGJlIHRyYWNrZWQgbG9jYWxseS4gaS5lLiB3aGV0aGVyXG4gICAqICAgYSBsb2NhbCBicmFuY2ggd2l0aCByZW1vdGUgdHJhY2tpbmcgc2hvdWxkIGJlIHNldCB1cC5cbiAgICogQHJldHVybnMgVGhlIGZvcmsgYW5kIGJyYW5jaCBuYW1lIGNvbnRhaW5pbmcgdGhlIHB1c2hlZCBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRCcmFuY2hOYW1lOiBzdHJpbmcsIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4pOlxuICAgICAgUHJvbWlzZTx7Zm9yazogR2l0aHViUmVwbywgYnJhbmNoTmFtZTogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGZvcmsgPSBhd2FpdCB0aGlzLl9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpO1xuICAgIC8vIENvbXB1dGUgYSByZXBvc2l0b3J5IFVSTCBmb3IgcHVzaGluZyB0byB0aGUgZm9yay4gTm90ZSB0aGF0IHdlIHdhbnQgdG8gcmVzcGVjdFxuICAgIC8vIHRoZSBTU0ggb3B0aW9uIGZyb20gdGhlIGRldi1pbmZyYSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgICBjb25zdCByZXBvR2l0VXJsID1cbiAgICAgICAgZ2V0UmVwb3NpdG9yeUdpdFVybCh7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSwgdGhpcy5naXQuZ2l0aHViVG9rZW4pO1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCB0aGlzLl9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShmb3JrLCBwcm9wb3NlZEJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHB1c2hBcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIElmIGEgbG9jYWwgYnJhbmNoIHNob3VsZCB0cmFjayB0aGUgcmVtb3RlIGZvcmsgYnJhbmNoLCBjcmVhdGUgYSBicmFuY2ggbWF0Y2hpbmdcbiAgICAvLyB0aGUgcmVtb3RlIGJyYW5jaC4gTGF0ZXIgd2l0aCB0aGUgYGdpdCBwdXNoYCwgdGhlIHJlbW90ZSBpcyBzZXQgZm9yIHRoZSBicmFuY2guXG4gICAgaWYgKHRyYWNrTG9jYWxCcmFuY2gpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lKTtcbiAgICAgIHB1c2hBcmdzLnB1c2goJy0tc2V0LXVwc3RyZWFtJyk7XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgZm9yay5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgcmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YCwgLi4ucHVzaEFyZ3NdKTtcbiAgICByZXR1cm4ge2ZvcmssIGJyYW5jaE5hbWV9O1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBjaGFuZ2VzIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5IHRoZSBjdXJyZW50bHlcbiAgICogYXV0aGVudGljYXRlZCB1c2VyLiBBIHB1bGwgcmVxdWVzdCBpcyB0aGVuIGNyZWF0ZWQgZm9yIHRoZSBwdXNoZWQgY2hhbmdlcyBvbiB0aGVcbiAgICogY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2guXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsIHByb3Bvc2VkRm9ya0JyYW5jaE5hbWU6IHN0cmluZywgdGl0bGU6IHN0cmluZyxcbiAgICAgIGJvZHk/OiBzdHJpbmcpOiBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgY29uc3QgcmVwb1NsdWcgPSBgJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMub3duZXJ9LyR7dGhpcy5naXQucmVtb3RlUGFyYW1zLnJlcG99YDtcbiAgICBjb25zdCB7Zm9yaywgYnJhbmNoTmFtZX0gPSBhd2FpdCB0aGlzLl9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEZvcmtCcmFuY2hOYW1lLCB0cnVlKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMuY3JlYXRlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIGhlYWQ6IGAke2Zvcmsub3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgYmFzZTogdGFyZ2V0QnJhbmNoLFxuICAgICAgYm9keSxcbiAgICAgIHRpdGxlLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGxhYmVscyB0byB0aGUgbmV3bHkgY3JlYXRlZCBQUiBpZiBwcm92aWRlZCBpbiB0aGUgY29uZmlndXJhdGlvbi5cbiAgICBpZiAodGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5pc3N1ZXMuYWRkTGFiZWxzKHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IGRhdGEubnVtYmVyLFxuICAgICAgICBsYWJlbHM6IHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBwdWxsIHJlcXVlc3QgIyR7ZGF0YS5udW1iZXJ9IGluICR7cmVwb1NsdWd9LmApKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRhdGEubnVtYmVyLFxuICAgICAgdXJsOiBkYXRhLmh0bWxfdXJsLFxuICAgICAgZm9yayxcbiAgICAgIGZvcmtCcmFuY2g6IGJyYW5jaE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCB0byBiZSBtZXJnZWQuIERlZmF1bHQgaW50ZXJ2YWwgZm9yIGNoZWNraW5nIHRoZSBHaXRodWJcbiAgICogQVBJIGlzIDEwIHNlY29uZHMgKHRvIG5vdCBleGNlZWQgYW55IHJhdGUgbGltaXRzKS4gSWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBjbG9zZWQgd2l0aG91dFxuICAgKiBtZXJnZSwgdGhlIHNjcmlwdCB3aWxsIGFib3J0IGdyYWNlZnVsbHkgKGNvbnNpZGVyaW5nIGEgbWFudWFsIHVzZXIgYWJvcnQpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQ6IG51bWJlciwgaW50ZXJ2YWwgPSB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbCk6XG4gICAgICBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gbWVyZ2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwclN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIHdhcm4oeWVsbG93KGAgIOKcmCAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gY2xvc2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlamVjdChuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIHJlbGVhc2VzIG5vdGVzIGZvciBhIHZlcnNpb24gcHVibGlzaGVkIGluIGEgZ2l2ZW4gYnJhbmNoIHRvIHRoZSBjaGFuZ2Vsb2cgaW5cbiAgICogdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cuXG4gICAqIEByZXR1cm5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHJlbGVhc2Ugbm90ZXMgaGF2ZSBiZWVuIHByZXBlbmRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwcmVwZW5kUmVsZWFzZU5vdGVzRnJvbVZlcnNpb25CcmFuY2goXG4gICAgICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb250YWluaW5nQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29udGVudHMoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHBhdGg6ICcvJyArIGNoYW5nZWxvZ1BhdGgsIHJlZjogY29udGFpbmluZ0JyYW5jaH0pO1xuICAgIGNvbnN0IGJyYW5jaENoYW5nZWxvZyA9IEJ1ZmZlci5mcm9tKGRhdGEuY29udGVudCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCk7XG4gICAgbGV0IHJlbGVhc2VOb3RlcyA9IHRoaXMuX2V4dHJhY3RSZWxlYXNlTm90ZXNGb3JWZXJzaW9uKGJyYW5jaENoYW5nZWxvZywgdmVyc2lvbik7XG4gICAgLy8gSWYgbm8gcmVsZWFzZSBub3RlcyBjb3VsZCBiZSBleHRyYWN0ZWQsIHJldHVybiBcImZhbHNlXCIgc28gdGhhdCB0aGUgY2FsbGVyXG4gICAgLy8gY2FuIHRlbGwgdGhhdCBjaGFuZ2Vsb2cgcHJlcGVuZGluZyBmYWlsZWQuXG4gICAgaWYgKHJlbGVhc2VOb3RlcyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZ1BhdGggPSBnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoKHRoaXMucHJvamVjdERpcik7XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2cgPSBhd2FpdCBmcy5yZWFkRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsICd1dGY4Jyk7XG4gICAgLy8gSWYgdGhlIGV4dHJhY3RlZCByZWxlYXNlIG5vdGVzIGRvIG5vdCBoYXZlIGFueSBuZXcgbGluZXMgYXQgdGhlIGVuZCBhbmQgdGhlXG4gICAgLy8gbG9jYWwgY2hhbmdlbG9nIGlzIG5vdCBlbXB0eSwgd2UgYWRkIGxpbmVzIG1hbnVhbGx5IHNvIHRoYXQgdGhlcmUgaXMgc3BhY2VcbiAgICAvLyBiZXR3ZWVuIHRoZSBwcmV2aW91cyBhbmQgY2hlcnJ5LXBpY2tlZCByZWxlYXNlIG5vdGVzLlxuICAgIGlmICghL1tcXHJcXG5dKyQvLnRlc3QocmVsZWFzZU5vdGVzKSAmJiBsb2NhbENoYW5nZWxvZyAhPT0gJycpIHtcbiAgICAgIHJlbGVhc2VOb3RlcyA9IGAke3JlbGVhc2VOb3Rlc31cXG5cXG5gO1xuICAgIH1cbiAgICAvLyBQcmVwZW5kIHRoZSBleHRyYWN0ZWQgcmVsZWFzZSBub3RlcyB0byB0aGUgbG9jYWwgY2hhbmdlbG9nIGFuZCB3cml0ZSBpdCBiYWNrLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIHJlbGVhc2VOb3RlcyArIGxvY2FsQ2hhbmdlbG9nKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgb3V0IGFuIHVwc3RyZWFtIGJyYW5jaCB3aXRoIGEgZGV0YWNoZWQgaGVhZC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0VXBzdHJlYW1CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLXEnLCB0aGlzLmdpdC5yZXBvR2l0VXJsLCBicmFuY2hOYW1lXSk7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnRkVUQ0hfSEVBRCcsICctLWRldGFjaCddKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIGZpbGVzIHdpdGggdGhlIGdpdmVuIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgZm9yIHRoZSBjcmVhdGVkIGNvbW1pdFxuICAgKiBAcGFyYW0gZmlsZXMgTGlzdCBvZiBwcm9qZWN0LXJlbGF0aXZlIGZpbGUgcGF0aHMgdG8gYmUgY29tbWl0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlQ29tbWl0KG1lc3NhZ2U6IHN0cmluZywgZmlsZXM6IHN0cmluZ1tdKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY29tbWl0JywgJy0tbm8tdmVyaWZ5JywgJy1tJywgbWVzc2FnZSwgLi4uZmlsZXNdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgY2hlcnJ5LXBpY2sgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBub3RlcyBvZiB0aGUgc3BlY2lmaWVkIHZlcnNpb24gdGhhdFxuICAgKiBoYXMgYmVlbiBwdXNoZWQgdG8gdGhlIGdpdmVuIGJyYW5jaC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgY29tbWl0IGhhcyBiZWVuIGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNoZXJyeVBpY2tSZWxlYXNlTm90ZXNDb21taXRGcm9tKFxuICAgICAgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UodmVyc2lvbik7XG5cbiAgICAvLyBGZXRjaCwgZXh0cmFjdCBhbmQgcHJlcGVuZCB0aGUgcmVsZWFzZSBub3RlcyB0byB0aGUgbG9jYWwgY2hhbmdlbG9nLiBJZiB0aGF0IGlzIG5vdFxuICAgIC8vIHBvc3NpYmxlLCBhYm9ydCBzbyB0aGF0IHdlIGNhbiBhc2sgdGhlIHVzZXIgdG8gbWFudWFsbHkgY2hlcnJ5LXBpY2sgdGhlIGNoYW5nZWxvZy5cbiAgICBpZiAoIWF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc0Zyb21WZXJzaW9uQnJhbmNoKHZlcnNpb24sIGJyYW5jaE5hbWUpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQgZm9yOiBcIiR7dmVyc2lvbn1cIi5gKSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhXG4gICAqIHB1bGwgcmVxdWVzdCB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwdWxsUmVxdWVzdEJhc2VCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuX2dlbmVyYXRlUmVsZWFzZU5vdGVzRm9ySGVhZChuZXdWZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgcHVsbFJlcXVlc3RCYXNlQnJhbmNoLCBgcmVsZWFzZS1zdGFnZS0ke25ld1ZlcnNpb259YCxcbiAgICAgICAgYEJ1bXAgdmVyc2lvbiB0byBcInYke25ld1ZlcnNpb259XCIgd2l0aCBjaGFuZ2Vsb2cuYCk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiBwdWxsUmVxdWVzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaCwgdmVyaWZpZXMgaXRzIENJIHN0YXR1cyBhbmQgc3RhZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gaW4gb3JkZXIgdG8gY3JlYXRlIGEgcHVsbCByZXF1ZXN0LlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIHN0YWdpbmdCcmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UobmV3VmVyc2lvbik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgbmV4dCBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuXG4gICAgLy8gQ2hlcnJ5LXBpY2sgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgY3VycmVudCBicmFuY2guIElmIGl0IGZhaWxzLFxuICAgIC8vIGFzayB0aGUgdXNlciB0byBtYW51YWxseSBjb3B5IHRoZSByZWxlYXNlIG5vdGVzIGludG8gdGhlIG5leHQgYnJhbmNoLlxuICAgIGlmICghYXdhaXQgdGhpcy5jcmVhdGVDaGVycnlQaWNrUmVsZWFzZU5vdGVzQ29tbWl0RnJvbShuZXdWZXJzaW9uLCBzdGFnaW5nQnJhbmNoKSkge1xuICAgICAgZXJyb3IoeWVsbG93KGAgIOKcmCAgIENvdWxkIG5vdCBjaGVycnktcGljayByZWxlYXNlIG5vdGVzIGZvciB2JHtuZXdWZXJzaW9ufS5gKSk7XG4gICAgICBlcnJvcihcbiAgICAgICAgICB5ZWxsb3coYCAgICAgIFBsZWFzZSBjb3B5IHRoZSByZWxlYXNlIG5vdGVzIG1hbnVhbGx5IGludG8gdGhlIFwiJHtuZXh0QnJhbmNofVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGEgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZCBieSB0aGUgY2FyZXRha2VyLlxuICAgIGNvbnN0IHt1cmwsIGlkfSA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYGNoYW5nZWxvZy1jaGVycnktcGljay0ke25ld1ZlcnNpb259YCwgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmApO1xuXG4gICAgaW5mbyhncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3VybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAqIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWQgYnkgdGFnZ2luZyB0aGUgc3BlY2lmaWVkIGNvbW1pdCBTSEEuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHZlcnNpb25CdW1wQ29tbWl0U2hhOiBzdHJpbmcsIHByZXJlbGVhc2U6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB0YWdOYW1lID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke25ld1ZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke25ld1ZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgICAgcHJlcmVsZWFzZSxcblxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtuZXdWZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSBuZXdWZXJzaW9uIFRoZSBuZXcgdmVyc2lvbiB0byBiZSBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSBwdWJsaXNoQnJhbmNoIE5hbWUgb2YgdGhlIGJyYW5jaCB0aGF0IGNvbnRhaW5zIHRoZSBuZXcgdmVyc2lvbi5cbiAgICogQHBhcmFtIG5wbURpc3RUYWcgTlBNIGRpc3QgdGFnIHdoZXJlIHRoZSB2ZXJzaW9uIHNob3VsZCBiZSBwdWJsaXNoZWQgdG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGRBbmRQdWJsaXNoKFxuICAgICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHVibGlzaEJyYW5jaDogc3RyaW5nLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBjb25zdCB2ZXJzaW9uQnVtcENvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKG5ld1ZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIExhdGVzdCBjb21taXQgaW4gXCIke3B1Ymxpc2hCcmFuY2h9XCIgYnJhbmNoIGlzIG5vdCBhIHN0YWdpbmcgY29tbWl0LmApKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB0aGUgc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLicpKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrb3V0IHRoZSBwdWJsaXNoIGJyYW5jaCBhbmQgYnVpbGQgdGhlIHJlbGVhc2UgcGFja2FnZXMuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgLy8gSW5zdGFsbCB0aGUgcHJvamVjdCBkZXBlbmRlbmNpZXMgZm9yIHRoZSBwdWJsaXNoIGJyYW5jaCwgYW5kIHRoZW4gYnVpbGQgdGhlIHJlbGVhc2VcbiAgICAvLyBwYWNrYWdlcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCBkaXJlY3RseSBjYWxsIHRoZSBidWlsZCBwYWNrYWdlcyBmdW5jdGlvbiBmcm9tIHRoZSByZWxlYXNlXG4gICAgLy8gY29uZmlnLiBXZSBvbmx5IHdhbnQgdG8gYnVpbGQgYW5kIHB1Ymxpc2ggcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW5cbiAgICAvLyBwdWJsaXNoIGJyYW5jaC4gZS5nLiBjb25zaWRlciB3ZSBwdWJsaXNoIHBhdGNoIHZlcnNpb24gYW5kIGEgbmV3IHBhY2thZ2UgaGFzIGJlZW5cbiAgICAvLyBjcmVhdGVkIGluIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgbmV3IHBhY2thZ2Ugd291bGQgbm90IGJlIHBhcnQgb2YgdGhlIHBhdGNoIGJyYW5jaCxcbiAgICAvLyBzbyB3ZSBjYW5ub3QgYnVpbGQgYW5kIHB1Ymxpc2ggaXQuXG4gICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgYXdhaXQgaW52b2tlQmF6ZWxDbGVhbkNvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMobmV3VmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgICBuZXdWZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSwgbnBtRGlzdFRhZyA9PT0gJ25leHQnKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogc3RyaW5nKSB7XG4gICAgZGVidWcoYFN0YXJ0aW5nIHB1Ymxpc2ggb2YgXCIke3BrZy5uYW1lfVwiLmApO1xuICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBQdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bk5wbVB1Ymxpc2gocGtnLm91dHB1dFBhdGgsIG5wbURpc3RUYWcsIHRoaXMuY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiLmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gY29tbWl0IHJlcHJlc2VudHMgYSBzdGFnaW5nIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGNvbW1pdFNoYTogc3RyaW5nKSB7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG5cbiAgLyoqIFZlcmlmeSB0aGUgdmVyc2lvbiBvZiBlYWNoIGdlbmVyYXRlZCBwYWNrYWdlIGV4YWN0IG1hdGNoZXMgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlQYWNrYWdlVmVyc2lvbnModmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcGFja2FnZXM6IEJ1aWx0UGFja2FnZVtdKSB7XG4gICAgZm9yIChjb25zdCBwa2cgb2YgcGFja2FnZXMpIHtcbiAgICAgIGNvbnN0IHt2ZXJzaW9uOiBwYWNrYWdlSnNvblZlcnNpb259ID1cbiAgICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKGpvaW4ocGtnLm91dHB1dFBhdGgsICdwYWNrYWdlLmpzb24nKSwgJ3V0ZjgnKSkgYXNcbiAgICAgICAgICB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgICAgaWYgKHZlcnNpb24uY29tcGFyZShwYWNrYWdlSnNvblZlcnNpb24pICE9PSAwKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn1gKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==