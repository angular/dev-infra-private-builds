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
        define("@angular/dev-infra-private/release/publish/actions", ["require", "exports", "tslib", "fs", "ora", "path", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/release/notes/release-notes", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/external-commands", "@angular/dev-infra-private/release/publish/graphql-queries", "@angular/dev-infra-private/release/publish/pull-request-state"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseAction = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var ora = require("ora");
    var path_1 = require("path");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var github_urls_1 = require("@angular/dev-infra-private/utils/git/github-urls");
    var release_notes_1 = require("@angular/dev-infra-private/release/notes/release-notes");
    var npm_publish_1 = require("@angular/dev-infra-private/release/versioning/npm-publish");
    var actions_error_1 = require("@angular/dev-infra-private/release/publish/actions-error");
    var commit_message_1 = require("@angular/dev-infra-private/release/publish/commit-message");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    var external_commands_1 = require("@angular/dev-infra-private/release/publish/external-commands");
    var graphql_queries_1 = require("@angular/dev-infra-private/release/publish/graphql-queries");
    var pull_request_state_1 = require("@angular/dev-infra-private/release/publish/pull-request-state");
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
        ReleaseAction.isActive = function (_trains, _config) {
            throw Error('Not implemented.');
        };
        /** Retrieves the version in the project top-level `package.json` file. */
        ReleaseAction.prototype.getProjectVersion = function () {
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
                            return [2 /*return*/, new semver.SemVer(pkgJson.version)];
                    }
                });
            });
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
                            return [4 /*yield*/, this.git.github.graphql(graphql_queries_1.findOwnedForksOfRepoQuery, { owner: owner, name: name })];
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
                    this.git.run(['checkout', '-q', '-B', branchName]);
                    return [2 /*return*/];
                });
            });
        };
        /** Pushes the current Git `HEAD` to the given remote branch in the configured project. */
        ReleaseAction.prototype.pushHeadToRemoteBranch = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Push the local `HEAD` to the remote branch in the configured project.
                    this.git.run(['push', '-q', this.git.getRepoGitUrl(), "HEAD:refs/heads/" + branchName]);
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
                            this.git.run(tslib_1.__spreadArray(['push', '-q', repoGitUrl, "HEAD:refs/heads/" + branchName], tslib_1.__read(pushArgs)));
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
                            return [4 /*yield*/, this.git.github.pulls.create(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { head: fork.owner + ":" + branchName, base: targetBranch, body: body, title: title }))];
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
        ReleaseAction.prototype.waitForPullRequestToBeMerged = function (_a, interval) {
            var id = _a.id;
            if (interval === void 0) { interval = constants_1.waitForPullRequestInterval; }
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _this = this;
                return tslib_1.__generator(this, function (_b) {
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
        ReleaseAction.prototype.prependReleaseNotesToChangelog = function (releaseNotes) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var localChangelogPath, localChangelog, releaseNotesEntry;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            localChangelogPath = path_1.join(this.projectDir, constants_1.changelogPath);
                            return [4 /*yield*/, fs_1.promises.readFile(localChangelogPath, 'utf8')];
                        case 1:
                            localChangelog = _a.sent();
                            return [4 /*yield*/, releaseNotes.getChangelogEntry()];
                        case 2:
                            releaseNotesEntry = _a.sent();
                            return [4 /*yield*/, fs_1.promises.writeFile(localChangelogPath, releaseNotesEntry + "\n\n" + localChangelog)];
                        case 3:
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Updated the changelog to capture changes for \"" + releaseNotes.version + "\"."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Checks out an upstream branch with a detached head. */
        ReleaseAction.prototype.checkoutUpstreamBranch = function (branchName) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    this.git.run(['fetch', '-q', this.git.getRepoGitUrl(), branchName]);
                    this.git.run(['checkout', '-q', 'FETCH_HEAD', '--detach']);
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
                    this.git.run(tslib_1.__spreadArray(['commit', '-q', '--no-verify', '-m', message], tslib_1.__read(files)));
                    return [2 /*return*/];
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
                var currentVersion, _a, _b, releaseNotes, pullRequest;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = this.git).getMatchingTagForSemver;
                            return [4 /*yield*/, this.getProjectVersion()];
                        case 1:
                            currentVersion = _b.apply(_a, [_c.sent()]);
                            return [4 /*yield*/, release_notes_1.ReleaseNotes.fromRange(newVersion, currentVersion, 'HEAD')];
                        case 2:
                            releaseNotes = _c.sent();
                            return [4 /*yield*/, this.updateProjectVersion(newVersion)];
                        case 3:
                            _c.sent();
                            return [4 /*yield*/, this.prependReleaseNotesToChangelog(releaseNotes)];
                        case 4:
                            _c.sent();
                            return [4 /*yield*/, this.waitForEditsAndCreateReleaseCommit(newVersion)];
                        case 5:
                            _c.sent();
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, "release-stage-" + newVersion, "Bump version to \"v" + newVersion + "\" with changelog.")];
                        case 6:
                            pullRequest = _c.sent();
                            console_1.info(console_1.green('  ✓   Release staging pull request has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + pullRequest.url + "."));
                            return [2 /*return*/, { releaseNotes: releaseNotes, pullRequest: pullRequest }];
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
        ReleaseAction.prototype.cherryPickChangelogIntoNextBranch = function (releaseNotes, stagingBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var nextBranch, commitMessage, pullRequest;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            nextBranch = this.active.next.branchName;
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
                            // Checkout the next branch.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 1:
                            // Checkout the next branch.
                            _a.sent();
                            return [4 /*yield*/, this.prependReleaseNotesToChangelog(releaseNotes)];
                        case 2:
                            _a.sent();
                            // Create a changelog cherry-pick commit.
                            return [4 /*yield*/, this.createCommit(commitMessage, [constants_1.changelogPath])];
                        case 3:
                            // Create a changelog cherry-pick commit.
                            _a.sent();
                            console_1.info(console_1.green("  \u2713   Created changelog cherry-pick commit for: \"" + releaseNotes.version + "\"."));
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "changelog-cherry-pick-" + releaseNotes.version, commitMessage, "Cherry-picks the changelog from the \"" + stagingBranch + "\" branch to the next " +
                                    ("branch (" + nextBranch + ")."))];
                        case 4:
                            pullRequest = _a.sent();
                            console_1.info(console_1.green("  \u2713   Pull request for cherry-picking the changelog into \"" + nextBranch + "\" " +
                                'has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + pullRequest.url + "."));
                            // Wait for the Pull Request to be merged.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(pullRequest)];
                        case 5:
                            // Wait for the Pull Request to be merged.
                            _a.sent();
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Creates a Github release for the specified version in the configured project.
         * The release is created by tagging the specified commit SHA.
         */
        ReleaseAction.prototype._createGithubReleaseForVersion = function (releaseNotes, versionBumpCommitSha, prerelease) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var tagName, _a, _b, _c;
                var _d;
                return tslib_1.__generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            tagName = releaseNotes.version.format();
                            return [4 /*yield*/, this.git.github.git.createRef(tslib_1.__assign(tslib_1.__assign({}, this.git.remoteParams), { ref: "refs/tags/" + tagName, sha: versionBumpCommitSha }))];
                        case 1:
                            _e.sent();
                            console_1.info(console_1.green("  \u2713   Tagged v" + releaseNotes.version + " release upstream."));
                            _b = (_a = this.git.github.repos).createRelease;
                            _c = [tslib_1.__assign({}, this.git.remoteParams)];
                            _d = { name: "v" + releaseNotes.version, tag_name: tagName, prerelease: prerelease };
                            return [4 /*yield*/, releaseNotes.getGithubReleaseEntry()];
                        case 2: return [4 /*yield*/, _b.apply(_a, [tslib_1.__assign.apply(void 0, _c.concat([(_d.body = _e.sent(), _d)]))])];
                        case 3:
                            _e.sent();
                            console_1.info(console_1.green("  \u2713   Created v" + releaseNotes.version + " release in Github."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Builds and publishes the given version in the specified branch.
         * @param releaseNotes The release notes for the version being published.
         * @param publishBranch Name of the branch that contains the new version.
         * @param npmDistTag NPM dist tag where the version should be published to.
         */
        ReleaseAction.prototype.buildAndPublish = function (releaseNotes, publishBranch, npmDistTag) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var versionBumpCommitSha, builtPackages, builtPackages_1, builtPackages_1_1, builtPackage, e_2_1;
                var e_2, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, this._getCommitOfBranch(publishBranch)];
                        case 1:
                            versionBumpCommitSha = _b.sent();
                            return [4 /*yield*/, this._isCommitForVersionStaging(releaseNotes.version, versionBumpCommitSha)];
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
                            return [4 /*yield*/, this._verifyPackageVersions(releaseNotes.version, builtPackages)];
                        case 6:
                            // Verify the packages built are the correct version.
                            _b.sent();
                            // Create a Github release for the new version.
                            return [4 /*yield*/, this._createGithubReleaseForVersion(releaseNotes, versionBumpCommitSha, npmDistTag === 'next')];
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
                var experimentalVersion, packages_1, packages_1_1, pkg, packageJsonVersion, _a, _b, mismatchesVersion, mismatchesExperimental, e_4_1;
                var e_4, _c;
                return tslib_1.__generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            experimentalVersion = new semver.SemVer("0." + (version.major * 100 + version.minor) + "." + version.patch);
                            _d.label = 1;
                        case 1:
                            _d.trys.push([1, 6, 7, 8]);
                            packages_1 = tslib_1.__values(packages), packages_1_1 = packages_1.next();
                            _d.label = 2;
                        case 2:
                            if (!!packages_1_1.done) return [3 /*break*/, 5];
                            pkg = packages_1_1.value;
                            _b = (_a = JSON).parse;
                            return [4 /*yield*/, fs_1.promises.readFile(path_1.join(pkg.outputPath, 'package.json'), 'utf8')];
                        case 3:
                            packageJsonVersion = _b.apply(_a, [_d.sent()]).version;
                            mismatchesVersion = version.compare(packageJsonVersion) !== 0;
                            mismatchesExperimental = experimentalVersion.compare(packageJsonVersion) !== 0;
                            if (mismatchesExperimental && mismatchesVersion) {
                                console_1.error(console_1.red('The built package version does not match the version being released.'));
                                console_1.error("  Release Version:   " + version.version + " (" + experimentalVersion.version + ")");
                                console_1.error("  Generated Version: " + packageJsonVersion);
                                throw new actions_error_1.FatalReleaseActionError();
                            }
                            _d.label = 4;
                        case 4:
                            packages_1_1 = packages_1.next();
                            return [3 /*break*/, 2];
                        case 5: return [3 /*break*/, 8];
                        case 6:
                            e_4_1 = _d.sent();
                            e_4 = { error: e_4_1 };
                            return [3 /*break*/, 8];
                        case 7:
                            try {
                                if (packages_1_1 && !packages_1_1.done && (_c = packages_1.return)) _c.call(packages_1);
                            }
                            finally { if (e_4) throw e_4.error; }
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        };
        return ReleaseAction;
    }());
    exports.ReleaseAction = ReleaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFDMUIsK0JBQWlDO0lBRWpDLG9FQUFnRztJQUVoRyxnRkFBMkY7SUFFM0Ysd0ZBQW9EO0lBR3BELHlGQUF3RDtJQUV4RCwwRkFBdUY7SUFDdkYsNEZBQW1HO0lBQ25HLGtGQUF1RjtJQUN2RixrR0FBd0Y7SUFDeEYsOEZBQTREO0lBQzVELG9HQUF5RDtJQTRCekQ7Ozs7T0FJRztJQUNIO1FBa0JFLHVCQUNjLE1BQTJCLEVBQVksR0FBMkIsRUFDbEUsTUFBcUIsRUFBWSxVQUFrQjtZQURuRCxXQUFNLEdBQU4sTUFBTSxDQUFxQjtZQUFZLFFBQUcsR0FBSCxHQUFHLENBQXdCO1lBQ2xFLFdBQU0sR0FBTixNQUFNLENBQWU7WUFBWSxlQUFVLEdBQVYsVUFBVSxDQUFRO1lBTGpFLG1EQUFtRDtZQUMzQyxvQkFBZSxHQUFvQixJQUFJLENBQUM7UUFJb0IsQ0FBQztRQW5CckUsc0RBQXNEO1FBQy9DLHNCQUFRLEdBQWYsVUFBZ0IsT0FBNEIsRUFBRSxPQUFzQjtZQUNsRSxNQUFNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFrQkQsMEVBQTBFO1FBQzVELHlDQUFpQixHQUEvQjs7Ozs7OzRCQUNRLFdBQVcsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSwyQkFBZSxDQUFDLENBQUM7NEJBRXZELEtBQUEsQ0FBQSxLQUFBLElBQUksQ0FBQSxDQUFDLEtBQUssQ0FBQTs0QkFBQyxxQkFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBQTs7NEJBRC9DLE9BQU8sR0FD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QUFNLENBQUMsTUFBTSxDQUFDLFFBQUssT0FBTyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDLEtBQUssVUFBSSxPQUFPLENBQUMsS0FBTyxDQUFDLENBQUM7Ozs7NEJBQ2pFLGFBQUEsaUJBQUEsUUFBUSxDQUFBOzs7OzRCQUFmLEdBQUc7NEJBRVIsS0FBQSxDQUFBLEtBQUEsSUFBSSxDQUFBLENBQUMsS0FBSyxDQUFBOzRCQUFDLHFCQUFNLGFBQUUsQ0FBQyxRQUFRLENBQUMsV0FBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUE7OzRCQUQ5RCxrQkFBa0IsR0FDOUIsY0FBVyxTQUErRCxFQUNyQyxRQUZQOzRCQUk1QixpQkFBaUIsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUM5RCxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRXJGLElBQUksc0JBQXNCLElBQUksaUJBQWlCLEVBQUU7Z0NBQy9DLGVBQUssQ0FBQyxhQUFHLENBQUMsc0VBQXNFLENBQUMsQ0FBQyxDQUFDO2dDQUNuRixlQUFLLENBQUMsMEJBQXdCLE9BQU8sQ0FBQyxPQUFPLFVBQUssbUJBQW1CLENBQUMsT0FBTyxNQUFHLENBQUMsQ0FBQztnQ0FDbEYsZUFBSyxDQUFDLDBCQUF3QixrQkFBb0IsQ0FBQyxDQUFDO2dDQUNwRCxNQUFNLElBQUksdUNBQXVCLEVBQUUsQ0FBQzs2QkFDckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1NBRUo7UUFDSCxvQkFBQztJQUFELENBQUMsQUFqZUQsSUFpZUM7SUFqZXFCLHNDQUFhIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cHJvbWlzZXMgYXMgZnN9IGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIG9yYSBmcm9tICdvcmEnO1xuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2RlYnVnLCBlcnJvciwgZ3JlZW4sIGluZm8sIHByb21wdENvbmZpcm0sIHJlZCwgd2FybiwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge2dldExpc3RDb21taXRzSW5CcmFuY2hVcmwsIGdldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0J1aWx0UGFja2FnZSwgUmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7UmVsZWFzZU5vdGVzfSBmcm9tICcuLi9ub3Rlcy9yZWxlYXNlLW5vdGVzJztcbmltcG9ydCB7TnBtRGlzdFRhZ30gZnJvbSAnLi4vdmVyc2lvbmluZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cnVuTnBtUHVibGlzaH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5cbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSwgZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGgsIHBhY2thZ2VKc29uUGF0aCwgd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWx9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7aW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuL2V4dGVybmFsLWNvbW1hbmRzJztcbmltcG9ydCB7ZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeX0gZnJvbSAnLi9ncmFwaHFsLXF1ZXJpZXMnO1xuaW1wb3J0IHtnZXRQdWxsUmVxdWVzdFN0YXRlfSBmcm9tICcuL3B1bGwtcmVxdWVzdC1zdGF0ZSc7XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvIHtcbiAgb3duZXI6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYSBHaXRodWIgcHVsbCByZXF1ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsUmVxdWVzdCB7XG4gIC8qKiBVbmlxdWUgaWQgZm9yIHRoZSBwdWxsIHJlcXVlc3QgKGkuZS4gdGhlIFBSIG51bWJlcikuICovXG4gIGlkOiBudW1iZXI7XG4gIC8qKiBVUkwgdGhhdCByZXNvbHZlcyB0byB0aGUgcHVsbCByZXF1ZXN0IGluIEdpdGh1Yi4gKi9cbiAgdXJsOiBzdHJpbmc7XG4gIC8qKiBGb3JrIGNvbnRhaW5pbmcgdGhlIGhlYWQgYnJhbmNoIG9mIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrOiBHaXRodWJSZXBvO1xuICAvKiogQnJhbmNoIG5hbWUgaW4gdGhlIGZvcmsgdGhhdCBkZWZpbmVzIHRoaXMgcHVsbCByZXF1ZXN0LiAqL1xuICBmb3JrQnJhbmNoOiBzdHJpbmc7XG59XG5cbi8qKiBDb25zdHJ1Y3RvciB0eXBlIGZvciBpbnN0YW50aWF0aW5nIGEgcmVsZWFzZSBhY3Rpb24gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yPFQgZXh0ZW5kcyBSZWxlYXNlQWN0aW9uID0gUmVsZWFzZUFjdGlvbj4ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsIFJlbGVhc2VDb25maWcsIHN0cmluZ10pOiBUO1xufVxuXG4vKipcbiAqIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGEgcmVsZWFzZSBhY3Rpb24uIEEgcmVsZWFzZSBhY3Rpb24gaXMgc2VsZWN0YWJsZSBieSB0aGUgY2FyZXRha2VyXG4gKiBpZiBhY3RpdmUsIGFuZCBjYW4gcGVyZm9ybSBjaGFuZ2VzIGZvciByZWxlYXNpbmcsIHN1Y2ggYXMgc3RhZ2luZyBhIHJlbGVhc2UsIGJ1bXBpbmcgdGhlXG4gKiB2ZXJzaW9uLCBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nLCBicmFuY2hpbmcgb2ZmIGZyb20gbWFzdGVyLiBldGMuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHJlbGVhc2UgYWN0aW9uIGlzIGN1cnJlbnRseSBhY3RpdmUuICovXG4gIHN0YXRpYyBpc0FjdGl2ZShfdHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdGhyb3cgRXJyb3IoJ05vdCBpbXBsZW1lbnRlZC4nKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBkZXNjcmlwdGlvbiBmb3IgYSByZWxlYXNlIGFjdGlvbi4gKi9cbiAgYWJzdHJhY3QgZ2V0RGVzY3JpcHRpb24oKTogUHJvbWlzZTxzdHJpbmc+O1xuICAvKipcbiAgICogUGVyZm9ybXMgdGhlIGdpdmVuIHJlbGVhc2UgYWN0aW9uLlxuICAgKiBAdGhyb3dzIHtVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gV2hlbiB0aGUgdXNlciBtYW51YWxseSBhYm9ydGVkIHRoZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSBhY3Rpb24gaGFzIGJlZW4gYWJvcnRlZCBkdWUgdG8gYSBmYXRhbCBlcnJvci5cbiAgICovXG4gIGFic3RyYWN0IHBlcmZvcm0oKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKiogQ2FjaGVkIGZvdW5kIGZvcmsgb2YgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJpdmF0ZSBfY2FjaGVkRm9ya1JlcG86IEdpdGh1YlJlcG98bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcm90ZWN0ZWQgYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zLCBwcm90ZWN0ZWQgZ2l0OiBBdXRoZW50aWNhdGVkR2l0Q2xpZW50LFxuICAgICAgcHJvdGVjdGVkIGNvbmZpZzogUmVsZWFzZUNvbmZpZywgcHJvdGVjdGVkIHByb2plY3REaXI6IHN0cmluZykge31cblxuICAvKiogUmV0cmlldmVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdldFByb2plY3RWZXJzaW9uKCkge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9XG4gICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgcmV0dXJuIG5ldyBzZW12ZXIuU2VtVmVyKHBrZ0pzb24udmVyc2lvbik7XG4gIH1cblxuICAvKiogVXBkYXRlcyB0aGUgdmVyc2lvbiBpbiB0aGUgcHJvamVjdCB0b3AtbGV2ZWwgYHBhY2thZ2UuanNvbmAgZmlsZS4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBjb25zdCBwa2dKc29uUGF0aCA9IGpvaW4odGhpcy5wcm9qZWN0RGlyLCBwYWNrYWdlSnNvblBhdGgpO1xuICAgIGNvbnN0IHBrZ0pzb24gPVxuICAgICAgICBKU09OLnBhcnNlKGF3YWl0IGZzLnJlYWRGaWxlKHBrZ0pzb25QYXRoLCAndXRmOCcpKSBhcyB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICAgIHBrZ0pzb24udmVyc2lvbiA9IG5ld1ZlcnNpb24uZm9ybWF0KCk7XG4gICAgLy8gV3JpdGUgdGhlIGBwYWNrYWdlLmpzb25gIGZpbGUuIE5vdGUgdGhhdCB3ZSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZVxuICAgIC8vIHRvIGF2b2lkIHVubmVjZXNzYXJ5IGRpZmYuIElERXMgdXN1YWxseSBhZGQgYSB0cmFpbGluZyBuZXcgbGluZS5cbiAgICBhd2FpdCBmcy53cml0ZUZpbGUocGtnSnNvblBhdGgsIGAke0pTT04uc3RyaW5naWZ5KHBrZ0pzb24sIG51bGwsIDIpfVxcbmApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCBwcm9qZWN0IHZlcnNpb24gdG8gJHtwa2dKc29uLnZlcnNpb259YCkpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG1vc3QgcmVjZW50IGNvbW1pdCBvZiBhIHNwZWNpZmllZCBicmFuY2guICovXG4gIHByaXZhdGUgYXN5bmMgX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qge2RhdGE6IHtjb21taXR9fSA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBicmFuY2hOYW1lfSk7XG4gICAgcmV0dXJuIGNvbW1pdC5zaGE7XG4gIH1cblxuICAvKiogVmVyaWZpZXMgdGhhdCB0aGUgbGF0ZXN0IGNvbW1pdCBmb3IgdGhlIGdpdmVuIGJyYW5jaCBpcyBwYXNzaW5nIGFsbCBzdGF0dXNlcy4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgY29tbWl0U2hhID0gYXdhaXQgdGhpcy5fZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZSk7XG4gICAgY29uc3Qge2RhdGE6IHtzdGF0ZX19ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldENvbWJpbmVkU3RhdHVzRm9yUmVmKFxuICAgICAgICB7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCByZWY6IGNvbW1pdFNoYX0pO1xuICAgIGNvbnN0IGJyYW5jaENvbW1pdHNVcmwgPSBnZXRMaXN0Q29tbWl0c0luQnJhbmNoVXJsKHRoaXMuZ2l0LCBicmFuY2hOYW1lKTtcblxuICAgIGlmIChzdGF0ZSA9PT0gJ2ZhaWx1cmUnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICByZWQoYCAg4pyYICAgQ2Fubm90IHN0YWdlIHJlbGVhc2UuIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIGRvZXMgbm90IHBhc3MgYWxsIGdpdGh1YiBgICtcbiAgICAgICAgICAgICAgJ3N0YXR1cyBjaGVja3MuIFBsZWFzZSBtYWtlIHN1cmUgdGhpcyBjb21taXQgcGFzc2VzIGFsbCBjaGVja3MgYmVmb3JlIHJlLXJ1bm5pbmcuJykpO1xuICAgICAgZXJyb3IoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApO1xuXG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KFxuICAgICAgICAgICAgJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIGZhaWxpbmcgQ0kgY2hlY2tzLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9IGVsc2UgaWYgKHN0YXRlID09PSAncGVuZGluZycpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBzdGlsbCBoYXMgcGVuZGluZyBnaXRodWIgc3RhdHVzZXMgdGhhdCBgICtcbiAgICAgICAgICAgICAgJ25lZWQgdG8gc3VjY2VlZCBiZWZvcmUgc3RhZ2luZyBhIHJlbGVhc2UuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKSk7XG4gICAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gaWdub3JlIHRoZSBHaXRodWIgc3RhdHVzIGFuZCBwcm9jZWVkPycpKSB7XG4gICAgICAgIGluZm8oeWVsbG93KCcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwZW5kaW5nIENJLCBidXQgc3RhdHVzIGhhcyBiZWVuIGZvcmNpYmx5IGlnbm9yZWQuJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFVwc3RyZWFtIGNvbW1pdCBpcyBwYXNzaW5nIGFsbCBnaXRodWIgc3RhdHVzIGNoZWNrcy4nKSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBQcm9tcHRzIHRoZSB1c2VyIGZvciBwb3RlbnRpYWwgcmVsZWFzZSBub3RlcyBlZGl0cyB0aGF0IG5lZWQgdG8gYmUgbWFkZS4gT25jZVxuICAgKiBjb25maXJtZWQsIGEgbmV3IGNvbW1pdCBmb3IgdGhlIHJlbGVhc2UgcG9pbnQgaXMgY3JlYXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgJyAg4pqgICAgUGxlYXNlIHJldmlldyB0aGUgY2hhbmdlbG9nIGFuZCBlbnN1cmUgdGhhdCB0aGUgbG9nIGNvbnRhaW5zIG9ubHkgY2hhbmdlcyAnICtcbiAgICAgICAgJ3RoYXQgYXBwbHkgdG8gdGhlIHB1YmxpYyBBUEkgc3VyZmFjZS4gTWFudWFsIGNoYW5nZXMgY2FuIGJlIG1hZGUuIFdoZW4gZG9uZSwgcGxlYXNlICcgK1xuICAgICAgICAncHJvY2VlZCB3aXRoIHRoZSBwcm9tcHQgYmVsb3cuJykpO1xuXG4gICAgaWYgKCFhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBwcm9jZWVkIGFuZCBjb21taXQgdGhlIGNoYW5nZXM/JykpIHtcbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIC8vIENvbW1pdCBtZXNzYWdlIGZvciB0aGUgcmVsZWFzZSBwb2ludC5cbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UobmV3VmVyc2lvbik7XG4gICAgLy8gQ3JlYXRlIGEgcmVsZWFzZSBzdGFnaW5nIGNvbW1pdCBpbmNsdWRpbmcgY2hhbmdlbG9nIGFuZCB2ZXJzaW9uIGJ1bXAuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW3BhY2thZ2VKc29uUGF0aCwgY2hhbmdlbG9nUGF0aF0pO1xuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHJlbGVhc2UgY29tbWl0IGZvcjogXCIke25ld1ZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gb3duZWQgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCBvZiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBBYm9ydHMgdGhlXG4gICAqIHByb2Nlc3Mgd2l0aCBhbiBlcnJvciBpZiBubyBmb3JrIGNvdWxkIGJlIGZvdW5kLiBBbHNvIGNhY2hlcyB0aGUgZGV0ZXJtaW5lZCBmb3JrXG4gICAqIHJlcG9zaXRvcnkgYXMgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlciBjYW5ub3QgY2hhbmdlIGR1cmluZyBhY3Rpb24gZXhlY3V0aW9uLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTogUHJvbWlzZTxHaXRodWJSZXBvPiB7XG4gICAgaWYgKHRoaXMuX2NhY2hlZEZvcmtSZXBvICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG87XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZztcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmdpdC5naXRodWIuZ3JhcGhxbChmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5LCB7b3duZXIsIG5hbWV9KTtcbiAgICBjb25zdCBmb3JrcyA9IHJlc3VsdC5yZXBvc2l0b3J5LmZvcmtzLm5vZGVzO1xuXG4gICAgaWYgKGZvcmtzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFVuYWJsZSB0byBmaW5kIGZvcmsgZm9yIGN1cnJlbnRseSBhdXRoZW50aWNhdGVkIHVzZXIuJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgZW5zdXJlIHlvdSBjcmVhdGVkIGEgZm9yayBvZjogJHtvd25lcn0vJHtuYW1lfS5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICBjb25zdCBmb3JrID0gZm9ya3NbMF07XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvID0ge293bmVyOiBmb3JrLm93bmVyLmxvZ2luLCBuYW1lOiBmb3JrLm5hbWV9O1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIGEgZ2l2ZW4gYnJhbmNoIG5hbWUgaXMgcmVzZXJ2ZWQgaW4gdGhlIHNwZWNpZmllZCByZXBvc2l0b3J5LiAqL1xuICBwcml2YXRlIGFzeW5jIF9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvOiBHaXRodWJSZXBvLCBuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgYnJhbmNoOiBuYW1lfSk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBJZiB0aGUgZXJyb3IgaGFzIGEgYHN0YXR1c2AgcHJvcGVydHkgc2V0IHRvIGA0MDRgLCB0aGVuIHdlIGtub3cgdGhhdCB0aGUgYnJhbmNoXG4gICAgICAvLyBkb2VzIG5vdCBleGlzdC4gT3RoZXJ3aXNlLCBpdCBtaWdodCBiZSBhbiBBUEkgZXJyb3IgdGhhdCB3ZSB3YW50IHRvIHJlcG9ydC9yZS10aHJvdy5cbiAgICAgIGlmIChlLnN0YXR1cyA9PT0gNDA0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHRocm93IGU7XG4gICAgfVxuICB9XG5cbiAgLyoqIEZpbmRzIGEgbm9uLXJlc2VydmVkIGJyYW5jaCBuYW1lIGluIHRoZSByZXBvc2l0b3J5IHdpdGggcmVzcGVjdCB0byBhIGJhc2UgbmFtZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUocmVwbzogR2l0aHViUmVwbywgYmFzZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgbGV0IGN1cnJlbnROYW1lID0gYmFzZU5hbWU7XG4gICAgbGV0IHN1ZmZpeE51bSA9IDA7XG4gICAgd2hpbGUgKGF3YWl0IHRoaXMuX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG8sIGN1cnJlbnROYW1lKSkge1xuICAgICAgc3VmZml4TnVtKys7XG4gICAgICBjdXJyZW50TmFtZSA9IGAke2Jhc2VOYW1lfV8ke3N1ZmZpeE51bX1gO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudE5hbWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGxvY2FsIGJyYW5jaCBmcm9tIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAuIFdpbGwgb3ZlcnJpZGVcbiAgICogZXhpc3RpbmcgYnJhbmNoZXMgaW4gY2FzZSBvZiBhIGNvbGxpc2lvbi5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJy1xJywgJy1CJywgYnJhbmNoTmFtZV0pO1xuICB9XG5cbiAgLyoqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIHRoZSBnaXZlbiByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoSGVhZFRvUmVtb3RlQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWBdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieVxuICAgKiB0aGUgYXV0aGVudGljYXRlZCB1c2VyLiBJZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGV4aXN0cyBpbiB0aGUgZm9yayBhbHJlYWR5LCBhXG4gICAqIHVuaXF1ZSBvbmUgd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIHByb3Bvc2VkIG5hbWUgdG8gYXZvaWQgY29sbGlzaW9ucy5cbiAgICogQHBhcmFtIHByb3Bvc2VkQnJhbmNoTmFtZSBQcm9wb3NlZCBicmFuY2ggbmFtZSBmb3IgdGhlIGZvcmsuXG4gICAqIEBwYXJhbSB0cmFja0xvY2FsQnJhbmNoIFdoZXRoZXIgdGhlIGZvcmsgYnJhbmNoIHNob3VsZCBiZSB0cmFja2VkIGxvY2FsbHkuIGkuZS4gd2hldGhlclxuICAgKiAgIGEgbG9jYWwgYnJhbmNoIHdpdGggcmVtb3RlIHRyYWNraW5nIHNob3VsZCBiZSBzZXQgdXAuXG4gICAqIEByZXR1cm5zIFRoZSBmb3JrIGFuZCBicmFuY2ggbmFtZSBjb250YWluaW5nIHRoZSBwdXNoZWQgY2hhbmdlcy5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkQnJhbmNoTmFtZTogc3RyaW5nLCB0cmFja0xvY2FsQnJhbmNoOiBib29sZWFuKTpcbiAgICAgIFByb21pc2U8e2Zvcms6IEdpdGh1YlJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZ30+IHtcbiAgICBjb25zdCBmb3JrID0gYXdhaXQgdGhpcy5fZ2V0Rm9ya09mQXV0aGVudGljYXRlZFVzZXIoKTtcbiAgICAvLyBDb21wdXRlIGEgcmVwb3NpdG9yeSBVUkwgZm9yIHB1c2hpbmcgdG8gdGhlIGZvcmsuIE5vdGUgdGhhdCB3ZSB3YW50IHRvIHJlc3BlY3RcbiAgICAvLyB0aGUgU1NIIG9wdGlvbiBmcm9tIHRoZSBkZXYtaW5mcmEgZ2l0aHViIGNvbmZpZ3VyYXRpb24uXG4gICAgY29uc3QgcmVwb0dpdFVybCA9XG4gICAgICAgIGdldFJlcG9zaXRvcnlHaXRVcmwoey4uLmZvcmssIHVzZVNzaDogdGhpcy5naXQucmVtb3RlQ29uZmlnLnVzZVNzaH0sIHRoaXMuZ2l0LmdpdGh1YlRva2VuKTtcbiAgICBjb25zdCBicmFuY2hOYW1lID0gYXdhaXQgdGhpcy5fZmluZEF2YWlsYWJsZUJyYW5jaE5hbWUoZm9yaywgcHJvcG9zZWRCcmFuY2hOYW1lKTtcbiAgICBjb25zdCBwdXNoQXJnczogc3RyaW5nW10gPSBbXTtcbiAgICAvLyBJZiBhIGxvY2FsIGJyYW5jaCBzaG91bGQgdHJhY2sgdGhlIHJlbW90ZSBmb3JrIGJyYW5jaCwgY3JlYXRlIGEgYnJhbmNoIG1hdGNoaW5nXG4gICAgLy8gdGhlIHJlbW90ZSBicmFuY2guIExhdGVyIHdpdGggdGhlIGBnaXQgcHVzaGAsIHRoZSByZW1vdGUgaXMgc2V0IGZvciB0aGUgYnJhbmNoLlxuICAgIGlmICh0cmFja0xvY2FsQnJhbmNoKSB7XG4gICAgICBhd2FpdCB0aGlzLmNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZSk7XG4gICAgICBwdXNoQXJncy5wdXNoKCctLXNldC11cHN0cmVhbScpO1xuICAgIH1cbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGZvcmsuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsICctcScsIHJlcG9HaXRVcmwsIGBIRUFEOnJlZnMvaGVhZHMvJHticmFuY2hOYW1lfWAsIC4uLnB1c2hBcmdzXSk7XG4gICAgcmV0dXJuIHtmb3JrLCBicmFuY2hOYW1lfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQdXNoZXMgY2hhbmdlcyB0byBhIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3QgdGhhdCBpcyBvd25lZCBieSB0aGUgY3VycmVudGx5XG4gICAqIGF1dGhlbnRpY2F0ZWQgdXNlci4gQSBwdWxsIHJlcXVlc3QgaXMgdGhlbiBjcmVhdGVkIGZvciB0aGUgcHVzaGVkIGNoYW5nZXMgb24gdGhlXG4gICAqIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IHRhcmdldHMgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIHRhcmdldEJyYW5jaDogc3RyaW5nLCBwcm9wb3NlZEZvcmtCcmFuY2hOYW1lOiBzdHJpbmcsIHRpdGxlOiBzdHJpbmcsXG4gICAgICBib2R5Pzogc3RyaW5nKTogUHJvbWlzZTxQdWxsUmVxdWVzdD4ge1xuICAgIGNvbnN0IHJlcG9TbHVnID0gYCR7dGhpcy5naXQucmVtb3RlUGFyYW1zLm93bmVyfS8ke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5yZXBvfWA7XG4gICAgY29uc3Qge2ZvcmssIGJyYW5jaE5hbWV9ID0gYXdhaXQgdGhpcy5fcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRGb3JrQnJhbmNoTmFtZSwgdHJ1ZSk7XG4gICAgY29uc3Qge2RhdGF9ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLnB1bGxzLmNyZWF0ZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBoZWFkOiBgJHtmb3JrLm93bmVyfToke2JyYW5jaE5hbWV9YCxcbiAgICAgIGJhc2U6IHRhcmdldEJyYW5jaCxcbiAgICAgIGJvZHksXG4gICAgICB0aXRsZSxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBsYWJlbHMgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgUFIgaWYgcHJvdmlkZWQgaW4gdGhlIGNvbmZpZ3VyYXRpb24uXG4gICAgaWYgKHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIuaXNzdWVzLmFkZExhYmVscyh7XG4gICAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgICAgaXNzdWVfbnVtYmVyOiBkYXRhLm51bWJlcixcbiAgICAgICAgbGFiZWxzOiB0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMsXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcHVsbCByZXF1ZXN0ICMke2RhdGEubnVtYmVyfSBpbiAke3JlcG9TbHVnfS5gKSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGlkOiBkYXRhLm51bWJlcixcbiAgICAgIHVybDogZGF0YS5odG1sX3VybCxcbiAgICAgIGZvcmssXG4gICAgICBmb3JrQnJhbmNoOiBicmFuY2hOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogV2FpdHMgZm9yIHRoZSBnaXZlbiBwdWxsIHJlcXVlc3QgdG8gYmUgbWVyZ2VkLiBEZWZhdWx0IGludGVydmFsIGZvciBjaGVja2luZyB0aGUgR2l0aHViXG4gICAqIEFQSSBpcyAxMCBzZWNvbmRzICh0byBub3QgZXhjZWVkIGFueSByYXRlIGxpbWl0cykuIElmIHRoZSBwdWxsIHJlcXVlc3QgaXMgY2xvc2VkIHdpdGhvdXRcbiAgICogbWVyZ2UsIHRoZSBzY3JpcHQgd2lsbCBhYm9ydCBncmFjZWZ1bGx5IChjb25zaWRlcmluZyBhIG1hbnVhbCB1c2VyIGFib3J0KS5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyB3YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKFxuICAgICAge2lkfTogUHVsbFJlcXVlc3QsIGludGVydmFsID0gd2FpdEZvclB1bGxSZXF1ZXN0SW50ZXJ2YWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gbWVyZ2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwclN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIHdhcm4oeWVsbG93KGAgIOKcmCAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gY2xvc2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlamVjdChuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIHJlbGVhc2VzIG5vdGVzIGZvciBhIHZlcnNpb24gcHVibGlzaGVkIGluIGEgZ2l2ZW4gYnJhbmNoIHRvIHRoZSBjaGFuZ2Vsb2cgaW5cbiAgICogdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cuXG4gICAqIEByZXR1cm5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHJlbGVhc2Ugbm90ZXMgaGF2ZSBiZWVuIHByZXBlbmRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZ1BhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgY2hhbmdlbG9nUGF0aCk7XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2cgPSBhd2FpdCBmcy5yZWFkRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsICd1dGY4Jyk7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzRW50cnkgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCBgJHtyZWxlYXNlTm90ZXNFbnRyeX1cXG5cXG4ke2xvY2FsQ2hhbmdlbG9nfWApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCB0aGUgY2hhbmdlbG9nIHRvIGNhcHR1cmUgY2hhbmdlcyBmb3IgXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgb3V0IGFuIHVwc3RyZWFtIGJyYW5jaCB3aXRoIGEgZGV0YWNoZWQgaGVhZC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0VXBzdHJlYW1CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGJyYW5jaE5hbWVdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctcScsICdGRVRDSF9IRUFEJywgJy0tZGV0YWNoJ10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgZmlsZXMgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSBmb3IgdGhlIGNyZWF0ZWQgY29tbWl0XG4gICAqIEBwYXJhbSBmaWxlcyBMaXN0IG9mIHByb2plY3QtcmVsYXRpdmUgZmlsZSBwYXRocyB0byBiZSBjb21taXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLXEnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhXG4gICAqIHB1bGwgcmVxdWVzdCB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwdWxsUmVxdWVzdEJhc2VCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPHtyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0fT4ge1xuICAgIC8qKlxuICAgICAqIFRoZSBjdXJyZW50IHZlcnNpb24gb2YgdGhlIHByb2plY3QgZm9yIHRoZSBicmFuY2ggZnJvbSB0aGUgcm9vdCBwYWNrYWdlLmpzb24uIFRoaXMgbXVzdCBiZVxuICAgICAqIHJldHJpZXZlZCBwcmlvciB0byB1cGRhdGluZyB0aGUgcHJvamVjdCB2ZXJzaW9uLlxuICAgICAqL1xuICAgIGNvbnN0IGN1cnJlbnRWZXJzaW9uID0gdGhpcy5naXQuZ2V0TWF0Y2hpbmdUYWdGb3JTZW12ZXIoYXdhaXQgdGhpcy5nZXRQcm9qZWN0VmVyc2lvbigpKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXMgPSBhd2FpdCBSZWxlYXNlTm90ZXMuZnJvbVJhbmdlKG5ld1ZlcnNpb24sIGN1cnJlbnRWZXJzaW9uLCAnSEVBRCcpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbik7XG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcbiAgICBhd2FpdCB0aGlzLndhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbik7XG5cbiAgICBjb25zdCBwdWxsUmVxdWVzdCA9IGF3YWl0IHRoaXMucHVzaENoYW5nZXNUb0ZvcmtBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgICAgcHVsbFJlcXVlc3RCYXNlQnJhbmNoLCBgcmVsZWFzZS1zdGFnZS0ke25ld1ZlcnNpb259YCxcbiAgICAgICAgYEJ1bXAgdmVyc2lvbiB0byBcInYke25ld1ZlcnNpb259XCIgd2l0aCBjaGFuZ2Vsb2cuYCk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFJlbGVhc2Ugc3RhZ2luZyBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcblxuICAgIHJldHVybiB7cmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdH07XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2gsIHZlcmlmaWVzIGl0cyBDSSBzdGF0dXMgYW5kIHN0YWdlc1xuICAgKiB0aGUgc3BlY2lmaWVkIG5ldyB2ZXJzaW9uIGluIG9yZGVyIHRvIGNyZWF0ZSBhIHB1bGwgcmVxdWVzdC5cbiAgICogQHJldHVybnMgYW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPHtyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0fT4ge1xuICAgIGF3YWl0IHRoaXMudmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhzdGFnaW5nQnJhbmNoKTtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2goc3RhZ2luZ0JyYW5jaCk7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QobmV3VmVyc2lvbiwgc3RhZ2luZ0JyYW5jaCk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlcnJ5LXBpY2tzIHRoZSByZWxlYXNlIG5vdGVzIG9mIGEgdmVyc2lvbiB0aGF0IGhhdmUgYmVlbiBwdXNoZWQgdG8gYSBnaXZlbiBicmFuY2hcbiAgICogaW50byB0aGUgYG5leHRgIHByaW1hcnkgZGV2ZWxvcG1lbnQgYnJhbmNoLiBBIHB1bGwgcmVxdWVzdCBpcyBjcmVhdGVkIGZvciB0aGlzLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzZnVsIGNyZWF0aW9uIG9mIHRoZSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHN0YWdpbmdCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG5leHRCcmFuY2ggPSB0aGlzLmFjdGl2ZS5uZXh0LmJyYW5jaE5hbWU7XG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2UocmVsZWFzZU5vdGVzLnZlcnNpb24pO1xuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIG5leHQgYnJhbmNoLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChuZXh0QnJhbmNoKTtcblxuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0LlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtjaGFuZ2Vsb2dQYXRoXSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQgZm9yOiBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0IHRoYXQgc2hvdWxkIGJlIG1lcmdlZCBieSB0aGUgY2FyZXRha2VyLlxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgY2hhbmdlbG9nLWNoZXJyeS1waWNrLSR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCwgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmApO1xuXG4gICAgaW5mbyhncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKHB1bGxSZXF1ZXN0KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAqIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWQgYnkgdGFnZ2luZyB0aGUgc3BlY2lmaWVkIGNvbW1pdCBTSEEuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nLCBwcmVyZWxlYXNlOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHJlbGVhc2VOb3Rlcy52ZXJzaW9uLmZvcm1hdCgpO1xuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5naXQuY3JlYXRlUmVmKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogYHJlZnMvdGFncy8ke3RhZ05hbWV9YCxcbiAgICAgIHNoYTogdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBUYWdnZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICAgIHByZXJlbGVhc2UsXG4gICAgICBib2R5OiBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCksXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSByZWxlYXNlTm90ZXMgVGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2ZXJzaW9uIGJlaW5nIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHB1Ymxpc2hCcmFuY2ggTmFtZSBvZiB0aGUgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIG5ldyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gbnBtRGlzdFRhZyBOUE0gZGlzdCB0YWcgd2hlcmUgdGhlIHZlcnNpb24gc2hvdWxkIGJlIHB1Ymxpc2hlZCB0by5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZEFuZFB1Ymxpc2goXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVibGlzaEJyYW5jaDogc3RyaW5nLCBucG1EaXN0VGFnOiBOcG1EaXN0VGFnKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5faXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgdmVyc2lvbkJ1bXBDb21taXRTaGEpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgTGF0ZXN0IGNvbW1pdCBpbiBcIiR7cHVibGlzaEJyYW5jaH1cIiBicmFuY2ggaXMgbm90IGEgc3RhZ2luZyBjb21taXQuYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuJykpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIHB1Ymxpc2ggYnJhbmNoIGFuZCBidWlsZCB0aGUgcmVsZWFzZSBwYWNrYWdlcy5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwcm9qZWN0IGRlcGVuZGVuY2llcyBmb3IgdGhlIHB1Ymxpc2ggYnJhbmNoLCBhbmQgdGhlbiBidWlsZCB0aGUgcmVsZWFzZVxuICAgIC8vIHBhY2thZ2VzLiBOb3RlIHRoYXQgd2UgZG8gbm90IGRpcmVjdGx5IGNhbGwgdGhlIGJ1aWxkIHBhY2thZ2VzIGZ1bmN0aW9uIGZyb20gdGhlIHJlbGVhc2VcbiAgICAvLyBjb25maWcuIFdlIG9ubHkgd2FudCB0byBidWlsZCBhbmQgcHVibGlzaCBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGluIHRoZSBnaXZlblxuICAgIC8vIHB1Ymxpc2ggYnJhbmNoLiBlLmcuIGNvbnNpZGVyIHdlIHB1Ymxpc2ggcGF0Y2ggdmVyc2lvbiBhbmQgYSBuZXcgcGFja2FnZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgaW4gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBuZXcgcGFja2FnZSB3b3VsZCBub3QgYmUgcGFydCBvZiB0aGUgcGF0Y2ggYnJhbmNoLFxuICAgIC8vIHNvIHdlIGNhbm5vdCBidWlsZCBhbmQgcHVibGlzaCBpdC5cbiAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMocmVsZWFzZU5vdGVzLnZlcnNpb24sIGJ1aWx0UGFja2FnZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBuZXcgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgICAgcmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSwgbnBtRGlzdFRhZyA9PT0gJ25leHQnKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGRlYnVnKGBTdGFydGluZyBwdWJsaXNoIG9mIFwiJHtwa2cubmFtZX1cIi5gKTtcbiAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgUHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCJgKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5OcG1QdWJsaXNoKHBrZy5vdXRwdXRQYXRoLCBucG1EaXN0VGFnLCB0aGlzLmNvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFN1Y2Nlc3NmdWxseSBwdWJsaXNoZWQgXCIke3BrZy5uYW1lfS5gKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBwdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cIi5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGNvbW1pdCByZXByZXNlbnRzIGEgc3RhZ2luZyBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb21taXRTaGE6IHN0cmluZykge1xuICAgIGNvbnN0IHtkYXRhfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcmVmOiBjb21taXRTaGF9KTtcbiAgICByZXR1cm4gZGF0YS5jb21taXQubWVzc2FnZS5zdGFydHNXaXRoKGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKHZlcnNpb24pKTtcbiAgfVxuXG4gIC8qKiBWZXJpZnkgdGhlIHZlcnNpb24gb2YgZWFjaCBnZW5lcmF0ZWQgcGFja2FnZSBleGFjdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UGFja2FnZVZlcnNpb25zKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHBhY2thZ2VzOiBCdWlsdFBhY2thZ2VbXSkge1xuICAgIC8qKiBFeHBlcmltZW50YWwgZXF1aXZhbGVudCB2ZXJzaW9uIGZvciBwYWNrYWdlcyBjcmVhdGVkIHdpdGggdGhlIHByb3ZpZGVkIHZlcnNpb24uICovXG4gICAgY29uc3QgZXhwZXJpbWVudGFsVmVyc2lvbiA9XG4gICAgICAgIG5ldyBzZW12ZXIuU2VtVmVyKGAwLiR7dmVyc2lvbi5tYWpvciAqIDEwMCArIHZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH1gKTtcbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPVxuICAgICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpKSBhc1xuICAgICAgICAgIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG5cbiAgICAgIGNvbnN0IG1pc21hdGNoZXNWZXJzaW9uID0gdmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG4gICAgICBjb25zdCBtaXNtYXRjaGVzRXhwZXJpbWVudGFsID0gZXhwZXJpbWVudGFsVmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDA7XG5cbiAgICAgIGlmIChtaXNtYXRjaGVzRXhwZXJpbWVudGFsICYmIG1pc21hdGNoZXNWZXJzaW9uKSB7XG4gICAgICAgIGVycm9yKHJlZCgnVGhlIGJ1aWx0IHBhY2thZ2UgdmVyc2lvbiBkb2VzIG5vdCBtYXRjaCB0aGUgdmVyc2lvbiBiZWluZyByZWxlYXNlZC4nKSk7XG4gICAgICAgIGVycm9yKGAgIFJlbGVhc2UgVmVyc2lvbjogICAke3ZlcnNpb24udmVyc2lvbn0gKCR7ZXhwZXJpbWVudGFsVmVyc2lvbi52ZXJzaW9ufSlgKTtcbiAgICAgICAgZXJyb3IoYCAgR2VuZXJhdGVkIFZlcnNpb246ICR7cGFja2FnZUpzb25WZXJzaW9ufWApO1xuICAgICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==