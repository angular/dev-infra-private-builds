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
        define("@angular/dev-infra-private/release/publish/actions", ["require", "exports", "tslib", "fs", "ora", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/external-commands", "@angular/dev-infra-private/release/publish/graphql-queries", "@angular/dev-infra-private/release/publish/pull-request-state", "@angular/dev-infra-private/release/publish/release-notes"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseAction = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var Ora = require("ora");
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
    var release_notes_1 = require("@angular/dev-infra-private/release/publish/release-notes");
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
                                "status checks. Please make sure this commit passes all checks before re-running."));
                            console_1.error("      Please have a look at: " + branchCommitsUrl);
                            return [4 /*yield*/, console_1.promptConfirm('Do you want to ignore the Github status and proceed?')];
                        case 3:
                            if (_a.sent()) {
                                console_1.info(console_1.yellow("  \u26A0   Upstream commit is failing CI checks, but status has been " +
                                    "forcibly ignored."));
                                return [2 /*return*/];
                            }
                            throw new actions_error_1.UserAbortedReleaseActionError();
                        case 4:
                            if (!(state === 'pending')) return [3 /*break*/, 6];
                            console_1.error(console_1.red("  \u2718   Commit \"" + commitSha + "\" still has pending github statuses that " +
                                "need to succeed before staging a release."));
                            console_1.error(console_1.red("      Please have a look at: " + branchCommitsUrl));
                            return [4 /*yield*/, console_1.promptConfirm('Do you want to ignore the Github status and proceed?')];
                        case 5:
                            if (_a.sent()) {
                                console_1.info(console_1.yellow("  \u26A0   Upstream commit is pending CI, but status has been " +
                                    "forcibly ignored."));
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
                            console_1.info(console_1.yellow("  \u26A0   Please review the changelog and ensure that the log contains only changes " +
                                "that apply to the public API surface. Manual changes can be made. When done, please " +
                                "proceed with the prompt below."));
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
                                console_1.error(console_1.red("  \u2718   Unable to find fork for currently authenticated user."));
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
                            this.git.run(tslib_1.__spread(['push', repoGitUrl, "HEAD:refs/heads/" + branchName], pushArgs));
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
                            var spinner = Ora().start("Waiting for pull request #" + id + " to be merged.");
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
                    this.git.run(['fetch', this.git.repoGitUrl, branchName]);
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
                    this.git.run(tslib_1.__spread(['commit', '--no-verify', '-m', message], files));
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
                var nextBranch, commitMessage, url;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nextBranch = this.active.next.branchName;
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(newVersion);
                            // Checkout the next branch.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 1:
                            // Checkout the next branch.
                            _a.sent();
                            return [4 /*yield*/, this.createCherryPickReleaseNotesCommitFrom(newVersion, stagingBranch)];
                        case 2:
                            // Cherry-pick the release notes into the current branch. If it fails,
                            // ask the user to manually copy the release notes into the next branch.
                            if (!(_a.sent())) {
                                console_1.error(console_1.yellow("  \u2718   Could not cherry-pick release notes for v" + newVersion + "."));
                                console_1.error(console_1.yellow("      Please copy the release notes manually into the \"" + nextBranch + "\" branch."));
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "changelog-cherry-pick-" + newVersion, commitMessage, "Cherry-picks the changelog from the \"" + stagingBranch + "\" branch to the next " +
                                    ("branch (" + nextBranch + ")."))];
                        case 3:
                            url = (_a.sent()).url;
                            console_1.info(console_1.green("  \u2713   Pull request for cherry-picking the changelog into \"" + nextBranch + "\" " +
                                "has been created."));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + url + "."));
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Creates a Github release for the specified version in the configured project.
         * The release is created by tagging the specified commit SHA.
         */
        ReleaseAction.prototype._createGithubReleaseForVersion = function (newVersion, versionBumpCommitSha) {
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
                            return [4 /*yield*/, this.git.github.repos.createRelease(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { name: "v" + newVersion, tag_name: tagName }))];
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
                                console_1.error(console_1.red("      Please make sure the staging pull request has been merged."));
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
                            return [4 /*yield*/, external_commands_1.invokeReleaseBuildCommand()];
                        case 5:
                            builtPackages = _b.sent();
                            // Create a Github release for the new version.
                            return [4 /*yield*/, this._createGithubReleaseForVersion(newVersion, versionBumpCommitSha)];
                        case 6:
                            // Create a Github release for the new version.
                            _b.sent();
                            _b.label = 7;
                        case 7:
                            _b.trys.push([7, 12, 13, 14]);
                            builtPackages_1 = tslib_1.__values(builtPackages), builtPackages_1_1 = builtPackages_1.next();
                            _b.label = 8;
                        case 8:
                            if (!!builtPackages_1_1.done) return [3 /*break*/, 11];
                            builtPackage = builtPackages_1_1.value;
                            return [4 /*yield*/, this._publishBuiltPackageToNpm(builtPackage, npmDistTag)];
                        case 9:
                            _b.sent();
                            _b.label = 10;
                        case 10:
                            builtPackages_1_1 = builtPackages_1.next();
                            return [3 /*break*/, 8];
                        case 11: return [3 /*break*/, 14];
                        case 12:
                            e_2_1 = _b.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 14];
                        case 13:
                            try {
                                if (builtPackages_1_1 && !builtPackages_1_1.done && (_a = builtPackages_1.return)) _a.call(builtPackages_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 14:
                            console_1.info(console_1.green("  \u2713   Published all packages successfully"));
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
                            spinner = Ora().start("Publishing \"" + pkg.name + "\"");
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
        return ReleaseAction;
    }());
    exports.ReleaseAction = ReleaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFHMUIsb0VBQWdHO0lBQ2hHLGdGQUEyRjtJQUkzRix5RkFBd0Q7SUFFeEQsMEZBQXVGO0lBQ3ZGLDRGQUFtRztJQUNuRyxrRkFBdUY7SUFDdkYsa0dBQXdGO0lBQ3hGLDhGQUE0RDtJQUM1RCxvR0FBeUQ7SUFDekQsMEZBQWdHO0lBNEJoRzs7OztPQUlHO0lBQ0g7UUFrQkUsdUJBQ2MsTUFBMkIsRUFBWSxHQUFjLEVBQ3JELE1BQXFCLEVBQVksVUFBa0I7WUFEbkQsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7WUFBWSxRQUFHLEdBQUgsR0FBRyxDQUFXO1lBQ3JELFdBQU0sR0FBTixNQUFNLENBQWU7WUFBWSxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBTGpFLG1EQUFtRDtZQUMzQyxvQkFBZSxHQUFvQixJQUFJLENBQUM7UUFJb0IsQ0FBQztRQW5CckUsc0RBQXNEO1FBQy9DLHNCQUFRLEdBQWYsVUFBZ0IsT0FBNEI7WUFDMUMsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBa0JELHdFQUF3RTtRQUN4RCw0Q0FBb0IsR0FBcEMsVUFBcUMsVUFBeUI7Ozs7Ozs0QkFDdEQsV0FBVyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLDJCQUFlLENBQUMsQ0FBQzs0QkFDM0MsS0FBQSxDQUFBLEtBQUEsSUFBSSxDQUFBLENBQUMsS0FBSyxDQUFBOzRCQUFDLHFCQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFBM0QsT0FBTyxHQUFHLGNBQVcsU0FBc0Ms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LEVBQUUsU0FBUyxJQUFFLEVBQUE7OzRCQUQ5RSxJQUFJLEdBQ1AsQ0FBQSxTQUFpRixDQUFBLEtBRDFFOzRCQUVYLHNCQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQywyQ0FBMEIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDOzs7O1NBQzVFO1FBQ0gsb0JBQUM7SUFBRCxDQUFDLEFBbmVELElBbWVDO0lBbmVxQixzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGZzfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBPcmEgZnJvbSAnb3JhJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2dldExpc3RDb21taXRzSW5CcmFuY2hVcmwsIGdldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3J1bk5wbVB1Ymxpc2h9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuXG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UsIGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2V9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRoLCBwYWNrYWdlSnNvblBhdGgsIHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2ludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge2ZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnl9IGZyb20gJy4vZ3JhcGhxbC1xdWVyaWVzJztcbmltcG9ydCB7Z2V0UHVsbFJlcXVlc3RTdGF0ZX0gZnJvbSAnLi9wdWxsLXJlcXVlc3Qtc3RhdGUnO1xuaW1wb3J0IHtnZXREZWZhdWx0RXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4sIGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGh9IGZyb20gJy4vcmVsZWFzZS1ub3Rlcyc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBhIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEdpdENsaWVudCwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudCxcbiAgICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBwcm9qZWN0RGlyOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSk7XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZGF0YToge2NvbW1pdH19ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgICBgc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy5gKSk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICBgICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gYCArXG4gICAgICAgICAgICBgZm9yY2libHkgaWdub3JlZC5gKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgICBgbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS5gKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICBgICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgcGVuZGluZyBDSSwgYnV0IHN0YXR1cyBoYXMgYmVlbiBgICtcbiAgICAgICAgICAgIGBmb3JjaWJseSBpZ25vcmVkLmApKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBVcHN0cmVhbSBjb21taXQgaXMgcGFzc2luZyBhbGwgZ2l0aHViIHN0YXR1cyBjaGVja3MuJykpO1xuICB9XG5cbiAgLyoqIEdlbmVyYXRlcyB0aGUgY2hhbmdlbG9nIGZvciB0aGUgc3BlY2lmaWVkIGZvciB0aGUgY3VycmVudCBgSEVBRGAuICovXG4gIHByaXZhdGUgYXN5bmMgX2dlbmVyYXRlUmVsZWFzZU5vdGVzRm9ySGVhZCh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgY2hhbmdlbG9nUGF0aCA9IGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBhd2FpdCB0aGlzLmNvbmZpZy5nZW5lcmF0ZVJlbGVhc2VOb3Rlc0ZvckhlYWQoY2hhbmdlbG9nUGF0aCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7dmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKiogRXh0cmFjdCB0aGUgcmVsZWFzZSBub3RlcyBmb3IgdGhlIGdpdmVuIHZlcnNpb24gZnJvbSB0aGUgY2hhbmdlbG9nIGZpbGUuICovXG4gIHByaXZhdGUgX2V4dHJhY3RSZWxlYXNlTm90ZXNGb3JWZXJzaW9uKGNoYW5nZWxvZ0NvbnRlbnQ6IHN0cmluZywgdmVyc2lvbjogc2VtdmVyLlNlbVZlcik6IHN0cmluZ1xuICAgICAgfG51bGwge1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLmNvbmZpZy5leHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybiAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgdGhpcy5jb25maWcuZXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4odmVyc2lvbikgOlxuICAgICAgICBnZXREZWZhdWx0RXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4odmVyc2lvbik7XG4gICAgY29uc3QgbWF0Y2hlZE5vdGVzID0gcGF0dGVybi5leGVjKGNoYW5nZWxvZ0NvbnRlbnQpO1xuICAgIHJldHVybiBtYXRjaGVkTm90ZXMgPT09IG51bGwgPyBudWxsIDogbWF0Y2hlZE5vdGVzWzFdO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oeWVsbG93KFxuICAgICAgICBgICDimqAgICBQbGVhc2UgcmV2aWV3IHRoZSBjaGFuZ2Vsb2cgYW5kIGVuc3VyZSB0aGF0IHRoZSBsb2cgY29udGFpbnMgb25seSBjaGFuZ2VzIGAgK1xuICAgICAgICBgdGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgYCArXG4gICAgICAgIGBwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy5gKSk7XG5cbiAgICBpZiAoIWF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHByb2NlZWQgYW5kIGNvbW1pdCB0aGUgY2hhbmdlcz8nKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoLCBjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcmVsZWFzZSBjb21taXQgZm9yOiBcIiR7bmV3VmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvd25lZCBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IG9mIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIEFib3J0cyB0aGVcbiAgICogcHJvY2VzcyB3aXRoIGFuIGVycm9yIGlmIG5vIGZvcmsgY291bGQgYmUgZm91bmQuIEFsc28gY2FjaGVzIHRoZSBkZXRlcm1pbmVkIGZvcmtcbiAgICogcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsLnF1ZXJ5KGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnksIHtvd25lciwgbmFtZX0pO1xuICAgIGNvbnN0IGZvcmtzID0gcmVzdWx0LnJlcG9zaXRvcnkuZm9ya3Mubm9kZXM7XG5cbiAgICBpZiAoZm9ya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci5gKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX07XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBicmFuY2ggbmFtZSBpcyByZXNlcnZlZCBpbiB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG86IEdpdGh1YlJlcG8sIG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBicmFuY2g6IG5hbWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElmIHRoZSBlcnJvciBoYXMgYSBgc3RhdHVzYCBwcm9wZXJ0eSBzZXQgdG8gYDQwNGAsIHRoZW4gd2Uga25vdyB0aGF0IHRoZSBicmFuY2hcbiAgICAgIC8vIGRvZXMgbm90IGV4aXN0LiBPdGhlcndpc2UsIGl0IG1pZ2h0IGJlIGFuIEFQSSBlcnJvciB0aGF0IHdlIHdhbnQgdG8gcmVwb3J0L3JlLXRocm93LlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKiogRmluZHMgYSBub24tcmVzZXJ2ZWQgYnJhbmNoIG5hbWUgaW4gdGhlIHJlcG9zaXRvcnkgd2l0aCByZXNwZWN0IHRvIGEgYmFzZSBuYW1lLiAqL1xuICBwcml2YXRlIGFzeW5jIF9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShyZXBvOiBHaXRodWJSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgY3VycmVudE5hbWUgPSBiYXNlTmFtZTtcbiAgICBsZXQgc3VmZml4TnVtID0gMDtcbiAgICB3aGlsZSAoYXdhaXQgdGhpcy5faXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbywgY3VycmVudE5hbWUpKSB7XG4gICAgICBzdWZmaXhOdW0rKztcbiAgICAgIGN1cnJlbnROYW1lID0gYCR7YmFzZU5hbWV9XyR7c3VmZml4TnVtfWA7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50TmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbG9jYWwgYnJhbmNoIGZyb20gdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gV2lsbCBvdmVycmlkZVxuICAgKiBleGlzdGluZyBicmFuY2hlcyBpbiBjYXNlIG9mIGEgY29sbGlzaW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLUInLCBicmFuY2hOYW1lXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gdGhlIGdpdmVuIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hIZWFkVG9SZW1vdGVCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LnJlcG9HaXRVcmwsIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLCB0cmFja0xvY2FsQnJhbmNoOiBib29sZWFuKTpcbiAgICAgIFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9XG4gICAgICAgIGdldFJlcG9zaXRvcnlHaXRVcmwoey4uLmZvcmssIHVzZVNzaDogdGhpcy5naXQucmVtb3RlQ29uZmlnLnVzZVNzaH0sIHRoaXMuZ2l0LmdpdGh1YlRva2VuKTtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gYXdhaXQgdGhpcy5fZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUoZm9yaywgcHJvcG9zZWRCcmFuY2hOYW1lKTtcbiAgICBjb25zdCBwdXNoQXJnczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBJZiBhIGxvY2FsIGJyYW5jaCBzaG91bGQgdHJhY2sgdGhlIHJlbW90ZSBmb3JrIGJyYW5jaCwgY3JlYXRlIGEgYnJhbmNoIG1hdGNoaW5nXG4gICAgLy8gdGhlIHJlbW90ZSBicmFuY2guIExhdGVyIHdpdGggdGhlIGBnaXQgcHVzaGAsIHRoZSByZW1vdGUgaXMgc2V0IGZvciB0aGUgYnJhbmNoLlxuICAgIGlmICh0cmFja0xvY2FsQnJhbmNoKSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZSk7XG4gICAgICBwdXNoQXJncy5wdXNoKCctLXNldC11cHN0cmVhbScpO1xuICAgIH1cbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGZvcmsuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHJlcG9HaXRVcmwsIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWAsIC4uLnB1c2hBcmdzXSk7XG4gICAgcmV0dXJuIHtmb3JrLCBicmFuY2hOYW1lfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgY2hhbmdlcyB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieSB0aGUgY3VycmVudGx5XG4gICAqIGF1dGhlbnRpY2F0ZWQgdXNlci4gQSBwdWxsIHJlcXVlc3QgaXMgdGhlbiBjcmVhdGVkIGZvciB0aGUgcHVzaGVkIGNoYW5nZXMgb24gdGhlXG4gICAqIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IHRhcmdldHMgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHRhcmdldEJyYW5jaDogc3RyaW5nLCBwcm9wb3NlZEZvcmtCcmFuY2hOYW1lOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsXG4gICAgICBib2R5Pzogc3RyaW5nKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBwdWxsIHJlcXVlc3QgIyR7ZGF0YS5udW1iZXJ9IGluICR7cmVwb1NsdWd9LmApKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRhdGEubnVtYmVyLFxuICAgICAgdXJsOiBkYXRhLmh0bWxfdXJsLFxuICAgICAgZm9yayxcbiAgICAgIGZvcmtCcmFuY2g6IGJyYW5jaE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCB0byBiZSBtZXJnZWQuIERlZmF1bHQgaW50ZXJ2YWwgZm9yIGNoZWNraW5nIHRoZSBHaXRodWJcbiAgICogQVBJIGlzIDEwIHNlY29uZHMgKHRvIG5vdCBleGNlZWQgYW55IHJhdGUgbGltaXRzKS4gSWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBjbG9zZWQgd2l0aG91dFxuICAgKiBtZXJnZSwgdGhlIHNjcmlwdCB3aWxsIGFib3J0IGdyYWNlZnVsbHkgKGNvbnNpZGVyaW5nIGEgbWFudWFsIHVzZXIgYWJvcnQpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQ6IG51bWJlciwgaW50ZXJ2YWwgPSB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbCk6XG4gICAgICBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gT3JhKCkuc3RhcnQoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuICAgICAgY29uc3QgaW50ZXJ2YWxJZCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgcHJTdGF0ZSA9IGF3YWl0IGdldFB1bGxSZXF1ZXN0U3RhdGUodGhpcy5naXQsIGlkKTtcbiAgICAgICAgaWYgKHByU3RhdGUgPT09ICdtZXJnZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgaW5mbyhncmVlbihgICDinJMgICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIG1lcmdlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJTdGF0ZSA9PT0gJ2Nsb3NlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICB3YXJuKHllbGxvdyhgICDinJggICBQdWxsIHJlcXVlc3QgIyR7aWR9IGhhcyBiZWVuIGNsb3NlZC5gKSk7XG4gICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElkKTtcbiAgICAgICAgICByZWplY3QobmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCkpO1xuICAgICAgICB9XG4gICAgICB9LCBpbnRlcnZhbCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcGVuZCByZWxlYXNlcyBub3RlcyBmb3IgYSB2ZXJzaW9uIHB1Ymxpc2hlZCBpbiBhIGdpdmVuIGJyYW5jaCB0byB0aGUgY2hhbmdlbG9nIGluXG4gICAqIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFRoaXMgaXMgdXNlZnVsIGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLlxuICAgKiBAcmV0dXJucyBBIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSByZWxlYXNlIG5vdGVzIGhhdmUgYmVlbiBwcmVwZW5kZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHJlcGVuZFJlbGVhc2VOb3Rlc0Zyb21WZXJzaW9uQnJhbmNoKFxuICAgICAgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29udGFpbmluZ0JyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbnRlbnRzKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBwYXRoOiAnLycgKyBjaGFuZ2Vsb2dQYXRoLCByZWY6IGNvbnRhaW5pbmdCcmFuY2h9KTtcbiAgICBjb25zdCBicmFuY2hDaGFuZ2Vsb2cgPSBCdWZmZXIuZnJvbShkYXRhLmNvbnRlbnQsICdiYXNlNjQnKS50b1N0cmluZygpO1xuICAgIGxldCByZWxlYXNlTm90ZXMgPSB0aGlzLl9leHRyYWN0UmVsZWFzZU5vdGVzRm9yVmVyc2lvbihicmFuY2hDaGFuZ2Vsb2csIHZlcnNpb24pO1xuICAgIC8vIElmIG5vIHJlbGVhc2Ugbm90ZXMgY291bGQgYmUgZXh0cmFjdGVkLCByZXR1cm4gXCJmYWxzZVwiIHNvIHRoYXQgdGhlIGNhbGxlclxuICAgIC8vIGNhbiB0ZWxsIHRoYXQgY2hhbmdlbG9nIHByZXBlbmRpbmcgZmFpbGVkLlxuICAgIGlmIChyZWxlYXNlTm90ZXMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2dQYXRoID0gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nID0gYXdhaXQgZnMucmVhZEZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCAndXRmOCcpO1xuICAgIC8vIElmIHRoZSBleHRyYWN0ZWQgcmVsZWFzZSBub3RlcyBkbyBub3QgaGF2ZSBhbnkgbmV3IGxpbmVzIGF0IHRoZSBlbmQgYW5kIHRoZVxuICAgIC8vIGxvY2FsIGNoYW5nZWxvZyBpcyBub3QgZW1wdHksIHdlIGFkZCBsaW5lcyBtYW51YWxseSBzbyB0aGF0IHRoZXJlIGlzIHNwYWNlXG4gICAgLy8gYmV0d2VlbiB0aGUgcHJldmlvdXMgYW5kIGNoZXJyeS1waWNrZWQgcmVsZWFzZSBub3Rlcy5cbiAgICBpZiAoIS9bXFxyXFxuXSskLy50ZXN0KHJlbGVhc2VOb3RlcykgJiYgbG9jYWxDaGFuZ2Vsb2cgIT09ICcnKSB7XG4gICAgICByZWxlYXNlTm90ZXMgPSBgJHtyZWxlYXNlTm90ZXN9XFxuXFxuYDtcbiAgICB9XG4gICAgLy8gUHJlcGVuZCB0aGUgZXh0cmFjdGVkIHJlbGVhc2Ugbm90ZXMgdG8gdGhlIGxvY2FsIGNoYW5nZWxvZyBhbmQgd3JpdGUgaXQgYmFjay5cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCByZWxlYXNlTm90ZXMgKyBsb2NhbENoYW5nZWxvZyk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKiogQ2hlY2tzIG91dCBhbiB1cHN0cmVhbSBicmFuY2ggd2l0aCBhIGRldGFjaGVkIGhlYWQuICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dFVwc3RyZWFtQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2ZldGNoJywgdGhpcy5naXQucmVwb0dpdFVybCwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNvbW1pdChtZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNoZXJyeS1waWNrIGNvbW1pdCBmb3IgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIHRoYXRcbiAgICogaGFzIGJlZW4gcHVzaGVkIHRvIHRoZSBnaXZlbiBicmFuY2guXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIGNvbW1pdCBoYXMgYmVlbiBjcmVhdGVkIHN1Y2Nlc3NmdWxseS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDaGVycnlQaWNrUmVsZWFzZU5vdGVzQ29tbWl0RnJvbShcbiAgICAgIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHZlcnNpb24pO1xuXG4gICAgLy8gRmV0Y2gsIGV4dHJhY3QgYW5kIHByZXBlbmQgdGhlIHJlbGVhc2Ugbm90ZXMgdG8gdGhlIGxvY2FsIGNoYW5nZWxvZy4gSWYgdGhhdCBpcyBub3RcbiAgICAvLyBwb3NzaWJsZSwgYWJvcnQgc28gdGhhdCB3ZSBjYW4gYXNrIHRoZSB1c2VyIHRvIG1hbnVhbGx5IGNoZXJyeS1waWNrIHRoZSBjaGFuZ2Vsb2cuXG4gICAgaWYgKCFhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNGcm9tVmVyc2lvbkJyYW5jaCh2ZXJzaW9uLCBicmFuY2hOYW1lKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3ZlcnNpb259XCIuYCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YWdlcyB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCBicmFuY2ggYW5kIGNyZWF0ZXMgYVxuICAgKiBwdWxsIHJlcXVlc3QgdGhhdCB0YXJnZXRzIHRoZSBnaXZlbiBiYXNlIGJyYW5jaC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHVsbFJlcXVlc3RCYXNlQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLl9nZW5lcmF0ZVJlbGVhc2VOb3Rlc0ZvckhlYWQobmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaCwgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICAgIGBCdW1wIHZlcnNpb24gdG8gXCJ2JHtuZXdWZXJzaW9ufVwiIHdpdGggY2hhbmdlbG9nLmApO1xuXG4gICAgaW5mbyhncmVlbignICDinJMgICBSZWxlYXNlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICByZXR1cm4gcHVsbFJlcXVlc3Q7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKHN0YWdpbmdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChzdGFnaW5nQnJhbmNoKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBzdGFnaW5nQnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgYSB2ZXJzaW9uIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCB0byBhIGdpdmVuIGJyYW5jaFxuICAgKiBpbnRvIHRoZSBgbmV4dGAgcHJpbWFyeSBkZXZlbG9wbWVudCBicmFuY2guIEEgcHVsbCByZXF1ZXN0IGlzIGNyZWF0ZWQgZm9yIHRoaXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3NmdWwgY3JlYXRpb24gb2YgdGhlIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2goXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKG5ld1ZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIC8vIENoZXJyeS1waWNrIHRoZSByZWxlYXNlIG5vdGVzIGludG8gdGhlIGN1cnJlbnQgYnJhbmNoLiBJZiBpdCBmYWlscyxcbiAgICAvLyBhc2sgdGhlIHVzZXIgdG8gbWFudWFsbHkgY29weSB0aGUgcmVsZWFzZSBub3RlcyBpbnRvIHRoZSBuZXh0IGJyYW5jaC5cbiAgICBpZiAoIWF3YWl0IHRoaXMuY3JlYXRlQ2hlcnJ5UGlja1JlbGVhc2VOb3Rlc0NvbW1pdEZyb20obmV3VmVyc2lvbiwgc3RhZ2luZ0JyYW5jaCkpIHtcbiAgICAgIGVycm9yKHllbGxvdyhgICDinJggICBDb3VsZCBub3QgY2hlcnJ5LXBpY2sgcmVsZWFzZSBub3RlcyBmb3IgdiR7bmV3VmVyc2lvbn0uYCkpO1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgeWVsbG93KGAgICAgICBQbGVhc2UgY29weSB0aGUgcmVsZWFzZSBub3RlcyBtYW51YWxseSBpbnRvIHRoZSBcIiR7bmV4dEJyYW5jaH1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCB7dXJsfSA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgbmV4dEJyYW5jaCwgYGNoYW5nZWxvZy1jaGVycnktcGljay0ke25ld1ZlcnNpb259YCwgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmApO1xuXG4gICAgaW5mbyhncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgIGBoYXMgYmVlbiBjcmVhdGVkLmApKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3VybH0uYCkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAqIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWQgYnkgdGFnZ2luZyB0aGUgc3BlY2lmaWVkIGNvbW1pdCBTSEEuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHZlcnNpb25CdW1wQ29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB0YWdOYW1lID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ2l0LmNyZWF0ZVJlZih7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICByZWY6IGByZWZzL3RhZ3MvJHt0YWdOYW1lfWAsXG4gICAgICBzaGE6IHZlcnNpb25CdW1wQ29tbWl0U2hhLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVGFnZ2VkIHYke25ld1ZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke25ld1ZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgIH0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCB2JHtuZXdWZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSBuZXdWZXJzaW9uIFRoZSBuZXcgdmVyc2lvbiB0byBiZSBwdWJsaXNoZWQuXG4gICAqIEBwYXJhbSBwdWJsaXNoQnJhbmNoIE5hbWUgb2YgdGhlIGJyYW5jaCB0aGF0IGNvbnRhaW5zIHRoZSBuZXcgdmVyc2lvbi5cbiAgICogQHBhcmFtIG5wbURpc3RUYWcgTlBNIGRpc3QgdGFnIHdoZXJlIHRoZSB2ZXJzaW9uIHNob3VsZCBiZSBwdWJsaXNoZWQgdG8uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgYnVpbGRBbmRQdWJsaXNoKFxuICAgICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHVibGlzaEJyYW5jaDogc3RyaW5nLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBjb25zdCB2ZXJzaW9uQnVtcENvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKG5ld1ZlcnNpb24sIHZlcnNpb25CdW1wQ29tbWl0U2hhKSkge1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIExhdGVzdCBjb21taXQgaW4gXCIke3B1Ymxpc2hCcmFuY2h9XCIgYnJhbmNoIGlzIG5vdCBhIHN0YWdpbmcgY29tbWl0LmApKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB0aGUgc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gbWVyZ2VkLmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENoZWNrb3V0IHRoZSBwdWJsaXNoIGJyYW5jaCBhbmQgYnVpbGQgdGhlIHJlbGVhc2UgcGFja2FnZXMuXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgLy8gSW5zdGFsbCB0aGUgcHJvamVjdCBkZXBlbmRlbmNpZXMgZm9yIHRoZSBwdWJsaXNoIGJyYW5jaCwgYW5kIHRoZW4gYnVpbGQgdGhlIHJlbGVhc2VcbiAgICAvLyBwYWNrYWdlcy4gTm90ZSB0aGF0IHdlIGRvIG5vdCBkaXJlY3RseSBjYWxsIHRoZSBidWlsZCBwYWNrYWdlcyBmdW5jdGlvbiBmcm9tIHRoZSByZWxlYXNlXG4gICAgLy8gY29uZmlnLiBXZSBvbmx5IHdhbnQgdG8gYnVpbGQgYW5kIHB1Ymxpc2ggcGFja2FnZXMgdGhhdCBoYXZlIGJlZW4gY29uZmlndXJlZCBpbiB0aGUgZ2l2ZW5cbiAgICAvLyBwdWJsaXNoIGJyYW5jaC4gZS5nLiBjb25zaWRlciB3ZSBwdWJsaXNoIHBhdGNoIHZlcnNpb24gYW5kIGEgbmV3IHBhY2thZ2UgaGFzIGJlZW5cbiAgICAvLyBjcmVhdGVkIGluIHRoZSBgbmV4dGAgYnJhbmNoLiBUaGUgbmV3IHBhY2thZ2Ugd291bGQgbm90IGJlIHBhcnQgb2YgdGhlIHBhdGNoIGJyYW5jaCxcbiAgICAvLyBzbyB3ZSBjYW5ub3QgYnVpbGQgYW5kIHB1Ymxpc2ggaXQuXG4gICAgYXdhaXQgaW52b2tlWWFybkluc3RhbGxDb21tYW5kKHRoaXMucHJvamVjdERpcik7XG4gICAgY29uc3QgYnVpbHRQYWNrYWdlcyA9IGF3YWl0IGludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQoKTtcblxuICAgIC8vIENyZWF0ZSBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgbmV3IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24obmV3VmVyc2lvbiwgdmVyc2lvbkJ1bXBDb21taXRTaGEpO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBidWlsdCBwYWNrYWdlcyBhbmQgcHVibGlzaCB0aGVtIHRvIE5QTS5cbiAgICBmb3IgKGNvbnN0IGJ1aWx0UGFja2FnZSBvZiBidWlsdFBhY2thZ2VzKSB7XG4gICAgICBhd2FpdCB0aGlzLl9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0oYnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1Ymxpc2hlZCBhbGwgcGFja2FnZXMgc3VjY2Vzc2Z1bGx5YCkpO1xuICB9XG5cbiAgLyoqIFB1Ymxpc2hlcyB0aGUgZ2l2ZW4gYnVpbHQgcGFja2FnZSB0byBOUE0gd2l0aCB0aGUgc3BlY2lmaWVkIE5QTSBkaXN0IHRhZy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKHBrZzogQnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IE9yYSgpLnN0YXJ0KGBQdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cImApO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHJ1bk5wbVB1Ymxpc2gocGtnLm91dHB1dFBhdGgsIG5wbURpc3RUYWcsIHRoaXMuY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgU3VjY2Vzc2Z1bGx5IHB1Ymxpc2hlZCBcIiR7cGtnLm5hbWV9LmApKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgIGVycm9yKGUpO1xuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIEFuIGVycm9yIG9jY3VycmVkIHdoaWxlIHB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiLmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gY29tbWl0IHJlcHJlc2VudHMgYSBzdGFnaW5nIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGNvbW1pdFNoYTogc3RyaW5nKSB7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbW1pdCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIHJldHVybiBkYXRhLmNvbW1pdC5tZXNzYWdlLnN0YXJ0c1dpdGgoZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UodmVyc2lvbikpO1xuICB9XG59XG4iXX0=