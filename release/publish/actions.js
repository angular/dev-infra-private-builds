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
                                'has been created.'));
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
                            return [4 /*yield*/, external_commands_1.invokeReleaseBuildCommand()];
                        case 5:
                            builtPackages = _b.sent();
                            // Verify the packages built are the correct version.
                            return [4 /*yield*/, this._verifyPackageVersions(newVersion, builtPackages)];
                        case 6:
                            // Verify the packages built are the correct version.
                            _b.sent();
                            // Create a Github release for the new version.
                            return [4 /*yield*/, this._createGithubReleaseForVersion(newVersion, versionBumpCommitSha)];
                        case 7:
                            // Create a Github release for the new version.
                            _b.sent();
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 13, 14, 15]);
                            builtPackages_1 = tslib_1.__values(builtPackages), builtPackages_1_1 = builtPackages_1.next();
                            _b.label = 9;
                        case 9:
                            if (!!builtPackages_1_1.done) return [3 /*break*/, 12];
                            builtPackage = builtPackages_1_1.value;
                            return [4 /*yield*/, this._publishBuiltPackageToNpm(builtPackage, npmDistTag)];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            builtPackages_1_1 = builtPackages_1.next();
                            return [3 /*break*/, 9];
                        case 12: return [3 /*break*/, 15];
                        case 13:
                            e_2_1 = _b.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 15];
                        case 14:
                            try {
                                if (builtPackages_1_1 && !builtPackages_1_1.done && (_a = builtPackages_1.return)) _a.call(builtPackages_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 15:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFHMUIsb0VBQWdHO0lBQ2hHLGdGQUEyRjtJQUkzRix5RkFBd0Q7SUFFeEQsMEZBQXVGO0lBQ3ZGLDRGQUFtRztJQUNuRyxrRkFBdUY7SUFDdkYsa0dBQXdGO0lBQ3hGLDhGQUE0RDtJQUM1RCxvR0FBeUQ7SUFDekQsMEZBQWdHO0lBNEJoRzs7OztPQUlHO0lBQ0g7UUFrQkUsdUJBQ2MsTUFBMkIsRUFBWSxHQUFjLEVBQ3JELE1BQXFCLEVBQVksVUFBa0I7WUFEbkQsV0FBTSxHQUFOLE1BQU0sQ0FBcUI7WUFBWSxRQUFHLEdBQUgsR0FBRyxDQUFXO1lBQ3JELFdBQU0sR0FBTixNQUFNLENBQWU7WUFBWSxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBTGpFLG1EQUFtRDtZQUMzQyxvQkFBZSxHQUFvQixJQUFJLENBQUM7UUFJb0IsQ0FBQztRQW5CckUsc0RBQXNEO1FBQy9DLHNCQUFRLEdBQWYsVUFBZ0IsT0FBNEI7WUFDMUMsTUFBTSxLQUFLLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBa0JELHdFQUF3RTtRQUN4RCw0Q0FBb0IsR0FBcEMsVUFBcUMsVUFBeUI7Ozs7Ozs0QkFDdEQsV0FBVyxHQUFHLFdBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLDJCQUFlLENBQUMsQ0FBQzs0QkFDM0MsS0FBQSxDQUFBLEtBQUEsSUFBSSxDQUFBLENBQUMsS0FBSyxDQUFBOzRCQUFDLHFCQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFBM0QsT0FBTyxHQUFHLGNBQVcsU0FBc0Ms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QUFHLENBQUMsc0VBQXNFLENBQUMsQ0FBQyxDQUFDO2dDQUNuRixlQUFLLENBQUMsMEJBQXdCLE9BQU8sQ0FBQyxPQUFTLENBQUMsQ0FBQztnQ0FDakQsZUFBSyxDQUFDLDBCQUF3QixrQkFBb0IsQ0FBQyxDQUFDO2dDQUNwRCxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs2QkFDckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBRUo7UUFDSCxvQkFBQztJQUFELENBQUMsQUExZkQsSUEwZkM7SUExZnFCLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgZnN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Z2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCwgZ2V0UmVwb3NpdG9yeUdpdFVybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtCdWlsdFBhY2thZ2UsIFJlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aCwgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7aW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5pbXBvcnQge2dldERlZmF1bHRFeHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybiwgZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aH0gZnJvbSAnLi9yZWxlYXNlLW5vdGVzJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICBvd25lcjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIHB1bGwgcmVxdWVzdCAoaS5lLiB0aGUgUFIgbnVtYmVyKS4gKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIEZvcmsgY29udGFpbmluZyB0aGUgaGVhZCBicmFuY2ggb2YgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcms6IEdpdGh1YlJlcG87XG4gIC8qKiBCcmFuY2ggbmFtZSBpbiB0aGUgZm9yayB0aGF0IGRlZmluZXMgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcmtCcmFuY2g6IHN0cmluZztcbn1cblxuLyoqIENvbnN0cnVjdG9yIHR5cGUgZm9yIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEdpdENsaWVudCwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudCxcbiAgICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBwcm9qZWN0RGlyOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID0gSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSk7XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZGF0YToge2NvbW1pdH19ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgICAnc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy4nKSk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIHBlbmRpbmcgQ0ksIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgVXBzdHJlYW0gY29tbWl0IGlzIHBhc3NpbmcgYWxsIGdpdGh1YiBzdGF0dXMgY2hlY2tzLicpKTtcbiAgfVxuXG4gIC8qKiBHZW5lcmF0ZXMgdGhlIGNoYW5nZWxvZyBmb3IgdGhlIHNwZWNpZmllZCBmb3IgdGhlIGN1cnJlbnQgYEhFQURgLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZW5lcmF0ZVJlbGVhc2VOb3Rlc0ZvckhlYWQodmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IGNoYW5nZWxvZ1BhdGggPSBnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoKHRoaXMucHJvamVjdERpcik7XG4gICAgYXdhaXQgdGhpcy5jb25maWcuZ2VuZXJhdGVSZWxlYXNlTm90ZXNGb3JIZWFkKGNoYW5nZWxvZ1BhdGgpO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCB0aGUgY2hhbmdlbG9nIHRvIGNhcHR1cmUgY2hhbmdlcyBmb3IgXCIke3ZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIEV4dHJhY3QgdGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSBnaXZlbiB2ZXJzaW9uIGZyb20gdGhlIGNoYW5nZWxvZyBmaWxlLiAqL1xuICBwcml2YXRlIF9leHRyYWN0UmVsZWFzZU5vdGVzRm9yVmVyc2lvbihjaGFuZ2Vsb2dDb250ZW50OiBzdHJpbmcsIHZlcnNpb246IHNlbXZlci5TZW1WZXIpOiBzdHJpbmdcbiAgICAgIHxudWxsIHtcbiAgICBjb25zdCBwYXR0ZXJuID0gdGhpcy5jb25maWcuZXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4gIT09IHVuZGVmaW5lZCA/XG4gICAgICAgIHRoaXMuY29uZmlnLmV4dHJhY3RSZWxlYXNlTm90ZXNQYXR0ZXJuKHZlcnNpb24pIDpcbiAgICAgICAgZ2V0RGVmYXVsdEV4dHJhY3RSZWxlYXNlTm90ZXNQYXR0ZXJuKHZlcnNpb24pO1xuICAgIGNvbnN0IG1hdGNoZWROb3RlcyA9IHBhdHRlcm4uZXhlYyhjaGFuZ2Vsb2dDb250ZW50KTtcbiAgICByZXR1cm4gbWF0Y2hlZE5vdGVzID09PSBudWxsID8gbnVsbCA6IG1hdGNoZWROb3Rlc1sxXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBwb3RlbnRpYWwgcmVsZWFzZSBub3RlcyBlZGl0cyB0aGF0IG5lZWQgdG8gYmUgbWFkZS4gT25jZVxuICAgKiBjb25maXJtZWQsIGEgbmV3IGNvbW1pdCBmb3IgdGhlIHJlbGVhc2UgcG9pbnQgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgJyAg4pqgICAgUGxlYXNlIHJldmlldyB0aGUgY2hhbmdlbG9nIGFuZCBlbnN1cmUgdGhhdCB0aGUgbG9nIGNvbnRhaW5zIG9ubHkgY2hhbmdlcyAnICtcbiAgICAgICAgJ3RoYXQgYXBwbHkgdG8gdGhlIHB1YmxpYyBBUEkgc3VyZmFjZS4gTWFudWFsIGNoYW5nZXMgY2FuIGJlIG1hZGUuIFdoZW4gZG9uZSwgcGxlYXNlICcgK1xuICAgICAgICAncHJvY2VlZCB3aXRoIHRoZSBwcm9tcHQgYmVsb3cuJykpO1xuXG4gICAgaWYgKCFhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIGFuZCBjb21taXQgdGhlIGNoYW5nZXM/JykpIHtcbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENvbW1pdCBtZXNzYWdlIGZvciB0aGUgcmVsZWFzZSBwb2ludC5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UobmV3VmVyc2lvbik7XG4gICAgLy8gQ3JlYXRlIGEgcmVsZWFzZSBzdGFnaW5nIGNvbW1pdCBpbmNsdWRpbmcgY2hhbmdlbG9nIGFuZCB2ZXJzaW9uIGJ1bXAuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aCwgY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHJlbGVhc2UgY29tbWl0IGZvcjogXCIke25ld1ZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb3duZWQgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCBvZiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBBYm9ydHMgdGhlXG4gICAqIHByb2Nlc3Mgd2l0aCBhbiBlcnJvciBpZiBubyBmb3JrIGNvdWxkIGJlIGZvdW5kLiBBbHNvIGNhY2hlcyB0aGUgZGV0ZXJtaW5lZCBmb3JrXG4gICAqIHJlcG9zaXRvcnkgYXMgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlciBjYW5ub3QgY2hhbmdlIGR1cmluZyBhY3Rpb24gZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTogUHJvbWlzZTxHaXRodWJSZXBvPiB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZEZvcmtSZXBvICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG87XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ3JhcGhxbC5xdWVyeShmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5LCB7b3duZXIsIG5hbWV9KTtcbiAgICBjb25zdCBmb3JrcyA9IHJlc3VsdC5yZXBvc2l0b3J5LmZvcmtzLm5vZGVzO1xuXG4gICAgaWYgKGZvcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFVuYWJsZSB0byBmaW5kIGZvcmsgZm9yIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgZW5zdXJlIHlvdSBjcmVhdGVkIGEgZm9yayBvZjogJHtvd25lcn0vJHtuYW1lfS5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3JrID0gZm9ya3NbMF07XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvID0ge293bmVyOiBmb3JrLm93bmVyLmxvZ2luLCBuYW1lOiBmb3JrLm5hbWV9O1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYnJhbmNoIG5hbWUgaXMgcmVzZXJ2ZWQgaW4gdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5LiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvOiBHaXRodWJSZXBvLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgYnJhbmNoOiBuYW1lfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiB0aGUgZXJyb3IgaGFzIGEgYHN0YXR1c2AgcHJvcGVydHkgc2V0IHRvIGA0MDRgLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgYnJhbmNoXG4gICAgICAvLyBkb2VzIG5vdCBleGlzdC4gT3RoZXJ3aXNlLCBpdCBtaWdodCBiZSBhbiBBUEkgZXJyb3IgdGhhdCB3ZSB3YW50IHRvIHJlcG9ydC9yZS10aHJvdy5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCB0aGlzLmdpdC5yZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gXSk7XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnlcbiAgICogdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gSWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBleGlzdHMgaW4gdGhlIGZvcmsgYWxyZWFkeSwgYVxuICAgKiB1bmlxdWUgb25lIHdpbGwgYmUgZ2VuZXJhdGVkIGJhc2VkIG9uIHRoZSBwcm9wb3NlZCBuYW1lIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSBwcm9wb3NlZEJyYW5jaE5hbWUgUHJvcG9zZWQgYnJhbmNoIG5hbWUgZm9yIHRoZSBmb3JrLlxuICAgKiBAcGFyYW0gdHJhY2tMb2NhbEJyYW5jaCBXaGV0aGVyIHRoZSBmb3JrIGJyYW5jaCBzaG91bGQgYmUgdHJhY2tlZCBsb2NhbGx5LiBpLmUuIHdoZXRoZXJcbiAgICogICBhIGxvY2FsIGJyYW5jaCB3aXRoIHJlbW90ZSB0cmFja2luZyBzaG91bGQgYmUgc2V0IHVwLlxuICAgKiBAcmV0dXJucyBUaGUgZm9yayBhbmQgYnJhbmNoIG5hbWUgY29udGFpbmluZyB0aGUgcHVzaGVkIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEJyYW5jaE5hbWU6IHN0cmluZywgdHJhY2tMb2NhbEJyYW5jaDogYm9vbGVhbik6XG4gICAgICBQcm9taXNlPHtmb3JrOiBHaXRodWJSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgZm9yayA9IGF3YWl0IHRoaXMuX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk7XG4gICAgLy8gQ29tcHV0ZSBhIHJlcG9zaXRvcnkgVVJMIGZvciBwdXNoaW5nIHRvIHRoZSBmb3JrLiBOb3RlIHRoYXQgd2Ugd2FudCB0byByZXNwZWN0XG4gICAgLy8gdGhlIFNTSCBvcHRpb24gZnJvbSB0aGUgZGV2LWluZnJhIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICAgIGNvbnN0IHJlcG9HaXRVcmwgPVxuICAgICAgICBnZXRSZXBvc2l0b3J5R2l0VXJsKHsuLi5mb3JrLCB1c2VTc2g6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZy51c2VTc2h9LCB0aGlzLmdpdC5naXRodWJUb2tlbik7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICB0YXJnZXRCcmFuY2g6IHN0cmluZywgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLCB0aXRsZTogc3RyaW5nLFxuICAgICAgYm9keT86IHN0cmluZyk6IFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBjb25zdCByZXBvU2x1ZyA9IGAke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5vd25lcn0vJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMucmVwb31gO1xuICAgIGNvbnN0IHtmb3JrLCBicmFuY2hOYW1lfSA9IGF3YWl0IHRoaXMuX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkRm9ya0JyYW5jaE5hbWUsIHRydWUpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgaGVhZDogYCR7Zm9yay5vd25lcn06JHticmFuY2hOYW1lfWAsXG4gICAgICBiYXNlOiB0YXJnZXRCcmFuY2gsXG4gICAgICBib2R5LFxuICAgICAgdGl0bGUsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbGFiZWxzIHRvIHRoZSBuZXdseSBjcmVhdGVkIFBSIGlmIHByb3ZpZGVkIGluIHRoZSBjb25maWd1cmF0aW9uLlxuICAgIGlmICh0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5hZGRMYWJlbHMoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogZGF0YS5udW1iZXIsXG4gICAgICAgIGxhYmVsczogdGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHB1bGwgcmVxdWVzdCAjJHtkYXRhLm51bWJlcn0gaW4gJHtyZXBvU2x1Z30uYCkpO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogZGF0YS5udW1iZXIsXG4gICAgICB1cmw6IGRhdGEuaHRtbF91cmwsXG4gICAgICBmb3JrLFxuICAgICAgZm9ya0JyYW5jaDogYnJhbmNoTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IHRvIGJlIG1lcmdlZC4gRGVmYXVsdCBpbnRlcnZhbCBmb3IgY2hlY2tpbmcgdGhlIEdpdGh1YlxuICAgKiBBUEkgaXMgMTAgc2Vjb25kcyAodG8gbm90IGV4Y2VlZCBhbnkgcmF0ZSBsaW1pdHMpLiBJZiB0aGUgcHVsbCByZXF1ZXN0IGlzIGNsb3NlZCB3aXRob3V0XG4gICAqIG1lcmdlLCB0aGUgc2NyaXB0IHdpbGwgYWJvcnQgZ3JhY2VmdWxseSAoY29uc2lkZXJpbmcgYSBtYW51YWwgdXNlciBhYm9ydCkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZDogbnVtYmVyLCBpbnRlcnZhbCA9IHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsKTpcbiAgICAgIFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNGcm9tVmVyc2lvbkJyYW5jaChcbiAgICAgIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIGNvbnRhaW5pbmdCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb250ZW50cyhcbiAgICAgICAgey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcGF0aDogJy8nICsgY2hhbmdlbG9nUGF0aCwgcmVmOiBjb250YWluaW5nQnJhbmNofSk7XG4gICAgY29uc3QgYnJhbmNoQ2hhbmdlbG9nID0gQnVmZmVyLmZyb20oZGF0YS5jb250ZW50LCAnYmFzZTY0JykudG9TdHJpbmcoKTtcbiAgICBsZXQgcmVsZWFzZU5vdGVzID0gdGhpcy5fZXh0cmFjdFJlbGVhc2VOb3Rlc0ZvclZlcnNpb24oYnJhbmNoQ2hhbmdlbG9nLCB2ZXJzaW9uKTtcbiAgICAvLyBJZiBubyByZWxlYXNlIG5vdGVzIGNvdWxkIGJlIGV4dHJhY3RlZCwgcmV0dXJuIFwiZmFsc2VcIiBzbyB0aGF0IHRoZSBjYWxsZXJcbiAgICAvLyBjYW4gdGVsbCB0aGF0IGNoYW5nZWxvZyBwcmVwZW5kaW5nIGZhaWxlZC5cbiAgICBpZiAocmVsZWFzZU5vdGVzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICAvLyBJZiB0aGUgZXh0cmFjdGVkIHJlbGVhc2Ugbm90ZXMgZG8gbm90IGhhdmUgYW55IG5ldyBsaW5lcyBhdCB0aGUgZW5kIGFuZCB0aGVcbiAgICAvLyBsb2NhbCBjaGFuZ2Vsb2cgaXMgbm90IGVtcHR5LCB3ZSBhZGQgbGluZXMgbWFudWFsbHkgc28gdGhhdCB0aGVyZSBpcyBzcGFjZVxuICAgIC8vIGJldHdlZW4gdGhlIHByZXZpb3VzIGFuZCBjaGVycnktcGlja2VkIHJlbGVhc2Ugbm90ZXMuXG4gICAgaWYgKCEvW1xcclxcbl0rJC8udGVzdChyZWxlYXNlTm90ZXMpICYmIGxvY2FsQ2hhbmdlbG9nICE9PSAnJykge1xuICAgICAgcmVsZWFzZU5vdGVzID0gYCR7cmVsZWFzZU5vdGVzfVxcblxcbmA7XG4gICAgfVxuICAgIC8vIFByZXBlbmQgdGhlIGV4dHJhY3RlZCByZWxlYXNlIG5vdGVzIHRvIHRoZSBsb2NhbCBjaGFuZ2Vsb2cgYW5kIHdyaXRlIGl0IGJhY2suXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgcmVsZWFzZU5vdGVzICsgbG9jYWxDaGFuZ2Vsb2cpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LnJlcG9HaXRVcmwsIGJyYW5jaE5hbWVdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICdGRVRDSF9IRUFEJywgJy0tZGV0YWNoJ10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgZmlsZXMgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSBmb3IgdGhlIGNyZWF0ZWQgY29tbWl0XG4gICAqIEBwYXJhbSBmaWxlcyBMaXN0IG9mIHByb2plY3QtcmVsYXRpdmUgZmlsZSBwYXRocyB0byBiZSBjb21taXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjaGVycnktcGljayBjb21taXQgZm9yIHRoZSByZWxlYXNlIG5vdGVzIG9mIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiB0aGF0XG4gICAqIGhhcyBiZWVuIHB1c2hlZCB0byB0aGUgZ2l2ZW4gYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb21taXQgaGFzIGJlZW4gY3JlYXRlZCBzdWNjZXNzZnVsbHkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlQ2hlcnJ5UGlja1JlbGVhc2VOb3Rlc0NvbW1pdEZyb20oXG4gICAgICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZSh2ZXJzaW9uKTtcblxuICAgIC8vIEZldGNoLCBleHRyYWN0IGFuZCBwcmVwZW5kIHRoZSByZWxlYXNlIG5vdGVzIHRvIHRoZSBsb2NhbCBjaGFuZ2Vsb2cuIElmIHRoYXQgaXMgbm90XG4gICAgLy8gcG9zc2libGUsIGFib3J0IHNvIHRoYXQgd2UgY2FuIGFzayB0aGUgdXNlciB0byBtYW51YWxseSBjaGVycnktcGljayB0aGUgY2hhbmdlbG9nLlxuICAgIGlmICghYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzRnJvbVZlcnNpb25CcmFuY2godmVyc2lvbiwgYnJhbmNoTmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdCBmb3I6IFwiJHt2ZXJzaW9ufVwiLmApKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFnZXMgdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFuZCBjcmVhdGVzIGFcbiAgICogcHVsbCByZXF1ZXN0IHRoYXQgdGFyZ2V0cyB0aGUgZ2l2ZW4gYmFzZSBicmFuY2guXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5fZ2VuZXJhdGVSZWxlYXNlTm90ZXNGb3JIZWFkKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uKTtcblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBwdWxsUmVxdWVzdEJhc2VCcmFuY2gsIGByZWxlYXNlLXN0YWdlLSR7bmV3VmVyc2lvbn1gLFxuICAgICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUmVsZWFzZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgcmV0dXJuIHB1bGxSZXF1ZXN0O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLCB2ZXJpZmllcyBpdHMgQ0kgc3RhdHVzIGFuZCBzdGFnZXNcbiAgICogdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBpbiBvcmRlciB0byBjcmVhdGUgYSBwdWxsIHJlcXVlc3QuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOlxuICAgICAgUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGF3YWl0IHRoaXMudmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhzdGFnaW5nQnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2goc3RhZ2luZ0JyYW5jaCk7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgc3RhZ2luZ0JyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlcnJ5LXBpY2tzIHRoZSByZWxlYXNlIG5vdGVzIG9mIGEgdmVyc2lvbiB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgdG8gYSBnaXZlbiBicmFuY2hcbiAgICogaW50byB0aGUgYG5leHRgIHByaW1hcnkgZGV2ZWxvcG1lbnQgYnJhbmNoLiBBIHB1bGwgcmVxdWVzdCBpcyBjcmVhdGVkIGZvciB0aGlzLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzZnVsIGNyZWF0aW9uIG9mIHRoZSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKFxuICAgICAgbmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgbmV4dEJyYW5jaCA9IHRoaXMuYWN0aXZlLm5leHQuYnJhbmNoTmFtZTtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZShuZXdWZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICAvLyBDaGVycnktcGljayB0aGUgcmVsZWFzZSBub3RlcyBpbnRvIHRoZSBjdXJyZW50IGJyYW5jaC4gSWYgaXQgZmFpbHMsXG4gICAgLy8gYXNrIHRoZSB1c2VyIHRvIG1hbnVhbGx5IGNvcHkgdGhlIHJlbGVhc2Ugbm90ZXMgaW50byB0aGUgbmV4dCBicmFuY2guXG4gICAgaWYgKCFhd2FpdCB0aGlzLmNyZWF0ZUNoZXJyeVBpY2tSZWxlYXNlTm90ZXNDb21taXRGcm9tKG5ld1ZlcnNpb24sIHN0YWdpbmdCcmFuY2gpKSB7XG4gICAgICBlcnJvcih5ZWxsb3coYCAg4pyYICAgQ291bGQgbm90IGNoZXJyeS1waWNrIHJlbGVhc2Ugbm90ZXMgZm9yIHYke25ld1ZlcnNpb259LmApKTtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHllbGxvdyhgICAgICAgUGxlYXNlIGNvcHkgdGhlIHJlbGVhc2Ugbm90ZXMgbWFudWFsbHkgaW50byB0aGUgXCIke25leHRCcmFuY2h9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkIGJ5IHRoZSBjYXJldGFrZXIuXG4gICAgY29uc3Qge3VybH0gPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIG5leHRCcmFuY2gsIGBjaGFuZ2Vsb2ctY2hlcnJ5LXBpY2stJHtuZXdWZXJzaW9ufWAsIGNvbW1pdE1lc3NhZ2UsXG4gICAgICAgIGBDaGVycnktcGlja3MgdGhlIGNoYW5nZWxvZyBmcm9tIHRoZSBcIiR7c3RhZ2luZ0JyYW5jaH1cIiBicmFuY2ggdG8gdGhlIG5leHQgYCArXG4gICAgICAgICAgICBgYnJhbmNoICgke25leHRCcmFuY2h9KS5gKTtcblxuICAgIGluZm8oZ3JlZW4oXG4gICAgICAgIGAgIOKckyAgIFB1bGwgcmVxdWVzdCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZyBpbnRvIFwiJHtuZXh0QnJhbmNofVwiIGAgK1xuICAgICAgICAnaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHt1cmx9LmApKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbiBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgKiBUaGUgcmVsZWFzZSBpcyBjcmVhdGVkIGJ5IHRhZ2dpbmcgdGhlIHNwZWNpZmllZCBjb21taXQgU0hBLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24oXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IG5ld1ZlcnNpb24uZm9ybWF0KCk7XG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdpdC5jcmVhdGVSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBgcmVmcy90YWdzLyR7dGFnTmFtZX1gLFxuICAgICAgc2hhOiB2ZXJzaW9uQnVtcENvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFRhZ2dlZCB2JHtuZXdWZXJzaW9ufSByZWxlYXNlIHVwc3RyZWFtLmApKTtcblxuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5jcmVhdGVSZWxlYXNlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIG5hbWU6IGB2JHtuZXdWZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgdiR7bmV3VmVyc2lvbn0gcmVsZWFzZSBpbiBHaXRodWIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1aWxkcyBhbmQgcHVibGlzaGVzIHRoZSBnaXZlbiB2ZXJzaW9uIGluIHRoZSBzcGVjaWZpZWQgYnJhbmNoLlxuICAgKiBAcGFyYW0gbmV3VmVyc2lvbiBUaGUgbmV3IHZlcnNpb24gdG8gYmUgcHVibGlzaGVkLlxuICAgKiBAcGFyYW0gcHVibGlzaEJyYW5jaCBOYW1lIG9mIHRoZSBicmFuY2ggdGhhdCBjb250YWlucyB0aGUgbmV3IHZlcnNpb24uXG4gICAqIEBwYXJhbSBucG1EaXN0VGFnIE5QTSBkaXN0IHRhZyB3aGVyZSB0aGUgdmVyc2lvbiBzaG91bGQgYmUgcHVibGlzaGVkIHRvLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGJ1aWxkQW5kUHVibGlzaChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHB1Ymxpc2hCcmFuY2g6IHN0cmluZywgbnBtRGlzdFRhZzogc3RyaW5nKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5faXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyhuZXdWZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhuZXdWZXJzaW9uLCBidWlsdFBhY2thZ2VzKTtcblxuICAgIC8vIENyZWF0ZSBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgbmV3IHZlcnNpb24uXG4gICAgYXdhaXQgdGhpcy5fY3JlYXRlR2l0aHViUmVsZWFzZUZvclZlcnNpb24obmV3VmVyc2lvbiwgdmVyc2lvbkJ1bXBDb21taXRTaGEpO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBidWlsdCBwYWNrYWdlcyBhbmQgcHVibGlzaCB0aGVtIHRvIE5QTS5cbiAgICBmb3IgKGNvbnN0IGJ1aWx0UGFja2FnZSBvZiBidWlsdFBhY2thZ2VzKSB7XG4gICAgICBhd2FpdCB0aGlzLl9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0oYnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFB1Ymxpc2hlZCBhbGwgcGFja2FnZXMgc3VjY2Vzc2Z1bGx5JykpO1xuICB9XG5cbiAgLyoqIFB1Ymxpc2hlcyB0aGUgZ2l2ZW4gYnVpbHQgcGFja2FnZSB0byBOUE0gd2l0aCB0aGUgc3BlY2lmaWVkIE5QTSBkaXN0IHRhZy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKHBrZzogQnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgaW5mbyhncmVlbihgICDinJMgICBTdWNjZXNzZnVsbHkgcHVibGlzaGVkIFwiJHtwa2cubmFtZX0uYCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPVxuICAgICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpKTtcbiAgICAgIGlmICh2ZXJzaW9uLmNvbXBhcmUocGFja2FnZUpzb25WZXJzaW9uKSAhPT0gMCkge1xuICAgICAgICBlcnJvcihyZWQoJ1RoZSBidWlsdCBwYWNrYWdlIHZlcnNpb24gZG9lcyBub3QgbWF0Y2ggdGhlIHZlcnNpb24gYmVpbmcgcmVsZWFzZWQuJykpO1xuICAgICAgICBlcnJvcihgICBSZWxlYXNlIFZlcnNpb246ICAgJHt2ZXJzaW9uLnZlcnNpb259YCk7XG4gICAgICAgIGVycm9yKGAgIEdlbmVyYXRlZCBWZXJzaW9uOiAke3BhY2thZ2VKc29uVmVyc2lvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=