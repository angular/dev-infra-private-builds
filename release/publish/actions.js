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
                    this.git.run(['push', this.git.getRepoGitUrl(), "HEAD:refs/heads/" + branchName]);
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
        ReleaseAction.prototype.prependReleaseNotesToChangelog = function (releaseNotes) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var localChangelogPath, localChangelog, releaseNotesEntry;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            localChangelogPath = release_notes_1.getLocalChangelogFilePath(this.projectDir);
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
         * Stages the specified new version for the current branch and creates a
         * pull request that targets the given base branch.
         * @returns an object describing the created pull request.
         */
        ReleaseAction.prototype.stageVersionForBranchAndCreatePullRequest = function (newVersion, pullRequestBaseBranch) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var releaseNotes, pullRequest;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, release_notes_1.ReleaseNotes.fromRange(newVersion, this.git.getLatestSemverTag().format(), 'HEAD')];
                        case 1:
                            releaseNotes = _a.sent();
                            return [4 /*yield*/, this.updateProjectVersion(newVersion)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.prependReleaseNotesToChangelog(releaseNotes)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.waitForEditsAndCreateReleaseCommit(newVersion)];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(pullRequestBaseBranch, "release-stage-" + newVersion, "Bump version to \"v" + newVersion + "\" with changelog.")];
                        case 5:
                            pullRequest = _a.sent();
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
                var nextBranch, commitMessage, _a, url, id;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            nextBranch = this.active.next.branchName;
                            commitMessage = commit_message_1.getReleaseNoteCherryPickCommitMessage(releaseNotes.version);
                            // Checkout the next branch.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(nextBranch)];
                        case 1:
                            // Checkout the next branch.
                            _b.sent();
                            return [4 /*yield*/, this.prependReleaseNotesToChangelog(releaseNotes)];
                        case 2:
                            _b.sent();
                            // Create a changelog cherry-pick commit.
                            return [4 /*yield*/, this.createCommit(commitMessage, [constants_1.changelogPath])];
                        case 3:
                            // Create a changelog cherry-pick commit.
                            _b.sent();
                            console_1.info(console_1.green("  \u2713   Created changelog cherry-pick commit for: \"" + releaseNotes.version + "\"."));
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(nextBranch, "changelog-cherry-pick-" + releaseNotes.version, commitMessage, "Cherry-picks the changelog from the \"" + stagingBranch + "\" branch to the next " +
                                    ("branch (" + nextBranch + ")."))];
                        case 4:
                            _a = _b.sent(), url = _a.url, id = _a.id;
                            console_1.info(console_1.green("  \u2713   Pull request for cherry-picking the changelog into \"" + nextBranch + "\" " +
                                'has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + url + "."));
                            // Wait for the Pull Request to be merged.
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 5:
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
         * @param newVersion The new version to be published.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFHMUIsb0VBQWdHO0lBQ2hHLGdGQUEyRjtJQUkzRix5RkFBd0Q7SUFFeEQsMEZBQXVGO0lBQ3ZGLDRGQUFtRztJQUNuRyxrRkFBdUY7SUFDdkYsa0dBQXdGO0lBQ3hGLDhGQUE0RDtJQUM1RCxvR0FBeUQ7SUFDekQsd0dBQXNGO0lBNEJ0Rjs7OztPQUlHO0lBQ0g7UUFrQkUsdUJBQ2MsTUFBMkIsRUFBWSxHQUFvQixFQUMzRCxNQUFxQixFQUFZLFVBQWtCO1lBRG5ELFdBQU0sR0FBTixNQUFNLENBQXFCO1lBQVksUUFBRyxHQUFILEdBQUcsQ0FBaUI7WUFDM0QsV0FBTSxHQUFOLE1BQU0sQ0FBZTtZQUFZLGVBQVUsR0FBVixVQUFVLENBQVE7WUFMakUsbURBQW1EO1lBQzNDLG9CQUFlLEdBQW9CLElBQUksQ0FBQztRQUlvQixDQUFDO1FBbkJyRSxzREFBc0Q7UUFDL0Msc0JBQVEsR0FBZixVQUFnQixPQUE0QjtZQUMxQyxNQUFNLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFrQkQsd0VBQXdFO1FBQ3hELDRDQUFvQixHQUFwQyxVQUFxQyxVQUF5Qjs7Ozs7OzRCQUN0RCxXQUFXLEdBQUcsV0FBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsMkJBQWUsQ0FBQyxDQUFDOzRCQUV2RCxLQUFBLENBQUEsS0FBQSxJQUFJLENBQUEsQ0FBQyxLQUFLLENBQUE7NEJBQUMscUJBQU0sYUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUE7OzRCQUQvQyxPQUFPLEdBQ1QsY0FBVyxTQUFz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OWNELElBOGNDO0lBOWNxQixzQ0FBYSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3Byb21pc2VzIGFzIGZzfSBmcm9tICdmcyc7XG5pbXBvcnQgKiBhcyBvcmEgZnJvbSAnb3JhJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGdyZWVuLCBpbmZvLCBwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2dldExpc3RDb21taXRzSW5CcmFuY2hVcmwsIGdldFJlcG9zaXRvcnlHaXRVcmx9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWItdXJscyc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3J1bk5wbVB1Ymxpc2h9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuXG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UsIGdldFJlbGVhc2VOb3RlQ2hlcnJ5UGlja0NvbW1pdE1lc3NhZ2V9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRoLCBwYWNrYWdlSnNvblBhdGgsIHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsfSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQge2ludm9rZVJlbGVhc2VCdWlsZENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi9leHRlcm5hbC1jb21tYW5kcyc7XG5pbXBvcnQge2ZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnl9IGZyb20gJy4vZ3JhcGhxbC1xdWVyaWVzJztcbmltcG9ydCB7Z2V0UHVsbFJlcXVlc3RTdGF0ZX0gZnJvbSAnLi9wdWxsLXJlcXVlc3Qtc3RhdGUnO1xuaW1wb3J0IHtnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoLCBSZWxlYXNlTm90ZXN9IGZyb20gJy4vcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICBvd25lcjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIHB1bGwgcmVxdWVzdCAoaS5lLiB0aGUgUFIgbnVtYmVyKS4gKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIEZvcmsgY29udGFpbmluZyB0aGUgaGVhZCBicmFuY2ggb2YgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcms6IEdpdGh1YlJlcG87XG4gIC8qKiBCcmFuY2ggbmFtZSBpbiB0aGUgZm9yayB0aGF0IGRlZmluZXMgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcmtCcmFuY2g6IHN0cmluZztcbn1cblxuLyoqIENvbnN0cnVjdG9yIHR5cGUgZm9yIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+O1xuICAvKiogQ29uc3RydWN0cyBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBuZXcoLi4uYXJnczogW0FjdGl2ZVJlbGVhc2VUcmFpbnMsIEdpdENsaWVudDx0cnVlPiwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEdpdENsaWVudDx0cnVlPixcbiAgICAgIHByb3RlY3RlZCBjb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBwcm9qZWN0RGlyOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFVwZGF0ZXMgdGhlIHZlcnNpb24gaW4gdGhlIHByb2plY3QgdG9wLWxldmVsIGBwYWNrYWdlLmpzb25gIGZpbGUuICovXG4gIHByb3RlY3RlZCBhc3luYyB1cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgY29uc3QgcGtnSnNvblBhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgcGFja2FnZUpzb25QYXRoKTtcbiAgICBjb25zdCBwa2dKc29uID1cbiAgICAgICAgSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShwa2dKc29uUGF0aCwgJ3V0ZjgnKSkgYXMge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgICBwa2dKc29uLnZlcnNpb24gPSBuZXdWZXJzaW9uLmZvcm1hdCgpO1xuICAgIC8vIFdyaXRlIHRoZSBgcGFja2FnZS5qc29uYCBmaWxlLiBOb3RlIHRoYXQgd2UgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmVcbiAgICAvLyB0byBhdm9pZCB1bm5lY2Vzc2FyeSBkaWZmLiBJREVzIHVzdWFsbHkgYWRkIGEgdHJhaWxpbmcgbmV3IGxpbmUuXG4gICAgYXdhaXQgZnMud3JpdGVGaWxlKHBrZ0pzb25QYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwa2dKc29uLCBudWxsLCAyKX1cXG5gKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFVwZGF0ZWQgcHJvamVjdCB2ZXJzaW9uIHRvICR7cGtnSnNvbi52ZXJzaW9ufWApKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBtb3N0IHJlY2VudCBjb21taXQgb2YgYSBzcGVjaWZpZWQgYnJhbmNoLiAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHtkYXRhOiB7Y29tbWl0fX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogYnJhbmNoTmFtZX0pO1xuICAgIHJldHVybiBjb21taXQuc2hhO1xuICB9XG5cbiAgLyoqIFZlcmlmaWVzIHRoYXQgdGhlIGxhdGVzdCBjb21taXQgZm9yIHRoZSBnaXZlbiBicmFuY2ggaXMgcGFzc2luZyBhbGwgc3RhdHVzZXMuICovXG4gIHByb3RlY3RlZCBhc3luYyB2ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWU6IHN0cmluZykge1xuICAgIGNvbnN0IGNvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKGJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHtkYXRhOiB7c3RhdGV9fSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21iaW5lZFN0YXR1c0ZvclJlZihcbiAgICAgICAgey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcmVmOiBjb21taXRTaGF9KTtcbiAgICBjb25zdCBicmFuY2hDb21taXRzVXJsID0gZ2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCh0aGlzLmdpdCwgYnJhbmNoTmFtZSk7XG5cbiAgICBpZiAoc3RhdGUgPT09ICdmYWlsdXJlJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENhbm5vdCBzdGFnZSByZWxlYXNlLiBDb21taXQgXCIke2NvbW1pdFNoYX1cIiBkb2VzIG5vdCBwYXNzIGFsbCBnaXRodWIgYCArXG4gICAgICAgICAgICAgICdzdGF0dXMgY2hlY2tzLiBQbGVhc2UgbWFrZSBzdXJlIHRoaXMgY29tbWl0IHBhc3NlcyBhbGwgY2hlY2tzIGJlZm9yZSByZS1ydW5uaW5nLicpKTtcbiAgICAgIGVycm9yKGAgICAgICBQbGVhc2UgaGF2ZSBhIGxvb2sgYXQ6ICR7YnJhbmNoQ29tbWl0c1VybH1gKTtcblxuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdyhcbiAgICAgICAgICAgICcgIOKaoCAgIFVwc3RyZWFtIGNvbW1pdCBpcyBmYWlsaW5nIENJIGNoZWNrcywgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICByZWQoYCAg4pyYICAgQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgc3RpbGwgaGFzIHBlbmRpbmcgZ2l0aHViIHN0YXR1c2VzIHRoYXQgYCArXG4gICAgICAgICAgICAgICduZWVkIHRvIHN1Y2NlZWQgYmVmb3JlIHN0YWdpbmcgYSByZWxlYXNlLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCkpO1xuICAgICAgaWYgKGF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIGlnbm9yZSB0aGUgR2l0aHViIHN0YXR1cyBhbmQgcHJvY2VlZD8nKSkge1xuICAgICAgICBpbmZvKHllbGxvdygnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgcGVuZGluZyBDSSwgYnV0IHN0YXR1cyBoYXMgYmVlbiBmb3JjaWJseSBpZ25vcmVkLicpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBVcHN0cmVhbSBjb21taXQgaXMgcGFzc2luZyBhbGwgZ2l0aHViIHN0YXR1cyBjaGVja3MuJykpO1xuICB9XG5cblxuICAvKipcbiAgICogUHJvbXB0cyB0aGUgdXNlciBmb3IgcG90ZW50aWFsIHJlbGVhc2Ugbm90ZXMgZWRpdHMgdGhhdCBuZWVkIHRvIGJlIG1hZGUuIE9uY2VcbiAgICogY29uZmlybWVkLCBhIG5ldyBjb21taXQgZm9yIHRoZSByZWxlYXNlIHBvaW50IGlzIGNyZWF0ZWQuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7XG4gICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICcgIOKaoCAgIFBsZWFzZSByZXZpZXcgdGhlIGNoYW5nZWxvZyBhbmQgZW5zdXJlIHRoYXQgdGhlIGxvZyBjb250YWlucyBvbmx5IGNoYW5nZXMgJyArXG4gICAgICAgICd0aGF0IGFwcGx5IHRvIHRoZSBwdWJsaWMgQVBJIHN1cmZhY2UuIE1hbnVhbCBjaGFuZ2VzIGNhbiBiZSBtYWRlLiBXaGVuIGRvbmUsIHBsZWFzZSAnICtcbiAgICAgICAgJ3Byb2NlZWQgd2l0aCB0aGUgcHJvbXB0IGJlbG93LicpKTtcblxuICAgIGlmICghYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gcHJvY2VlZCBhbmQgY29tbWl0IHRoZSBjaGFuZ2VzPycpKSB7XG4gICAgICB0aHJvdyBuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDb21taXQgbWVzc2FnZSBmb3IgdGhlIHJlbGVhc2UgcG9pbnQuXG4gICAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKG5ld1ZlcnNpb24pO1xuICAgIC8vIENyZWF0ZSBhIHJlbGVhc2Ugc3RhZ2luZyBjb21taXQgaW5jbHVkaW5nIGNoYW5nZWxvZyBhbmQgdmVyc2lvbiBidW1wLlxuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KGNvbW1pdE1lc3NhZ2UsIFtwYWNrYWdlSnNvblBhdGgsIGNoYW5nZWxvZ1BhdGhdKTtcblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCByZWxlYXNlIGNvbW1pdCBmb3I6IFwiJHtuZXdWZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIG93bmVkIGZvcmsgZm9yIHRoZSBjb25maWd1cmVkIHByb2plY3Qgb2YgdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gQWJvcnRzIHRoZVxuICAgKiBwcm9jZXNzIHdpdGggYW4gZXJyb3IgaWYgbm8gZm9yayBjb3VsZCBiZSBmb3VuZC4gQWxzbyBjYWNoZXMgdGhlIGRldGVybWluZWQgZm9ya1xuICAgKiByZXBvc2l0b3J5IGFzIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIgY2Fubm90IGNoYW5nZSBkdXJpbmcgYWN0aW9uIGV4ZWN1dGlvbi5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk6IFByb21pc2U8R2l0aHViUmVwbz4ge1xuICAgIGlmICh0aGlzLl9jYWNoZWRGb3JrUmVwbyAhPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEZvcmtSZXBvO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLmdpdC5yZW1vdGVDb25maWc7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdyYXBocWwoZmluZE93bmVkRm9ya3NPZlJlcG9RdWVyeSwge293bmVyLCBuYW1lfSk7XG4gICAgY29uc3QgZm9ya3MgPSByZXN1bHQucmVwb3NpdG9yeS5mb3Jrcy5ub2RlcztcblxuICAgIGlmIChmb3Jrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBVbmFibGUgdG8gZmluZCBmb3JrIGZvciBjdXJyZW50bHkgYXV0aGVudGljYXRlZCB1c2VyLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIGVuc3VyZSB5b3UgY3JlYXRlZCBhIGZvcmsgb2Y6ICR7b3duZXJ9LyR7bmFtZX0uYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgY29uc3QgZm9yayA9IGZvcmtzWzBdO1xuICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbyA9IHtvd25lcjogZm9yay5vd25lci5sb2dpbiwgbmFtZTogZm9yay5uYW1lfTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGJyYW5jaCBuYW1lIGlzIHJlc2VydmVkIGluIHRoZSBzcGVjaWZpZWQgcmVwb3NpdG9yeS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbzogR2l0aHViUmVwbywgbmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIGJyYW5jaDogbmFtZX0pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLy8gSWYgdGhlIGVycm9yIGhhcyBhIGBzdGF0dXNgIHByb3BlcnR5IHNldCB0byBgNDA0YCwgdGhlbiB3ZSBrbm93IHRoYXQgdGhlIGJyYW5jaFxuICAgICAgLy8gZG9lcyBub3QgZXhpc3QuIE90aGVyd2lzZSwgaXQgbWlnaHQgYmUgYW4gQVBJIGVycm9yIHRoYXQgd2Ugd2FudCB0byByZXBvcnQvcmUtdGhyb3cuXG4gICAgICBpZiAoZS5zdGF0dXMgPT09IDQwNCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBlO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBGaW5kcyBhIG5vbi1yZXNlcnZlZCBicmFuY2ggbmFtZSBpbiB0aGUgcmVwb3NpdG9yeSB3aXRoIHJlc3BlY3QgdG8gYSBiYXNlIG5hbWUuICovXG4gIHByaXZhdGUgYXN5bmMgX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKHJlcG86IEdpdGh1YlJlcG8sIGJhc2VOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGxldCBjdXJyZW50TmFtZSA9IGJhc2VOYW1lO1xuICAgIGxldCBzdWZmaXhOdW0gPSAwO1xuICAgIHdoaWxlIChhd2FpdCB0aGlzLl9pc0JyYW5jaE5hbWVSZXNlcnZlZEluUmVwbyhyZXBvLCBjdXJyZW50TmFtZSkpIHtcbiAgICAgIHN1ZmZpeE51bSsrO1xuICAgICAgY3VycmVudE5hbWUgPSBgJHtiYXNlTmFtZX1fJHtzdWZmaXhOdW19YDtcbiAgICB9XG4gICAgcmV0dXJuIGN1cnJlbnROYW1lO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBsb2NhbCBicmFuY2ggZnJvbSB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBXaWxsIG92ZXJyaWRlXG4gICAqIGV4aXN0aW5nIGJyYW5jaGVzIGluIGNhc2Ugb2YgYSBjb2xsaXNpb24uXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICctQicsIGJyYW5jaE5hbWVdKTtcbiAgfVxuXG4gIC8qKiBQdXNoZXMgdGhlIGN1cnJlbnQgR2l0IGBIRUFEYCB0byB0aGUgZ2l2ZW4gcmVtb3RlIGJyYW5jaCBpbiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgcHVzaEhlYWRUb1JlbW90ZUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBQdXNoIHRoZSBsb2NhbCBgSEVBRGAgdG8gdGhlIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgdGhpcy5naXQuZ2V0UmVwb0dpdFVybCgpLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gXSk7XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnlcbiAgICogdGhlIGF1dGhlbnRpY2F0ZWQgdXNlci4gSWYgdGhlIHNwZWNpZmllZCBicmFuY2ggbmFtZSBleGlzdHMgaW4gdGhlIGZvcmsgYWxyZWFkeSwgYVxuICAgKiB1bmlxdWUgb25lIHdpbGwgYmUgZ2VuZXJhdGVkIGJhc2VkIG9uIHRoZSBwcm9wb3NlZCBuYW1lIHRvIGF2b2lkIGNvbGxpc2lvbnMuXG4gICAqIEBwYXJhbSBwcm9wb3NlZEJyYW5jaE5hbWUgUHJvcG9zZWQgYnJhbmNoIG5hbWUgZm9yIHRoZSBmb3JrLlxuICAgKiBAcGFyYW0gdHJhY2tMb2NhbEJyYW5jaCBXaGV0aGVyIHRoZSBmb3JrIGJyYW5jaCBzaG91bGQgYmUgdHJhY2tlZCBsb2NhbGx5LiBpLmUuIHdoZXRoZXJcbiAgICogICBhIGxvY2FsIGJyYW5jaCB3aXRoIHJlbW90ZSB0cmFja2luZyBzaG91bGQgYmUgc2V0IHVwLlxuICAgKiBAcmV0dXJucyBUaGUgZm9yayBhbmQgYnJhbmNoIG5hbWUgY29udGFpbmluZyB0aGUgcHVzaGVkIGNoYW5nZXMuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEJyYW5jaE5hbWU6IHN0cmluZywgdHJhY2tMb2NhbEJyYW5jaDogYm9vbGVhbik6XG4gICAgICBQcm9taXNlPHtmb3JrOiBHaXRodWJSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgZm9yayA9IGF3YWl0IHRoaXMuX2dldEZvcmtPZkF1dGhlbnRpY2F0ZWRVc2VyKCk7XG4gICAgLy8gQ29tcHV0ZSBhIHJlcG9zaXRvcnkgVVJMIGZvciBwdXNoaW5nIHRvIHRoZSBmb3JrLiBOb3RlIHRoYXQgd2Ugd2FudCB0byByZXNwZWN0XG4gICAgLy8gdGhlIFNTSCBvcHRpb24gZnJvbSB0aGUgZGV2LWluZnJhIGdpdGh1YiBjb25maWd1cmF0aW9uLlxuICAgIGNvbnN0IHJlcG9HaXRVcmwgPVxuICAgICAgICBnZXRSZXBvc2l0b3J5R2l0VXJsKHsuLi5mb3JrLCB1c2VTc2g6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZy51c2VTc2h9LCB0aGlzLmdpdC5naXRodWJUb2tlbik7XG4gICAgY29uc3QgYnJhbmNoTmFtZSA9IGF3YWl0IHRoaXMuX2ZpbmRBdmFpbGFibGVCcmFuY2hOYW1lKGZvcmssIHByb3Bvc2VkQnJhbmNoTmFtZSk7XG4gICAgY29uc3QgcHVzaEFyZ3M6IHN0cmluZ1tdID0gW107XG4gICAgLy8gSWYgYSBsb2NhbCBicmFuY2ggc2hvdWxkIHRyYWNrIHRoZSByZW1vdGUgZm9yayBicmFuY2gsIGNyZWF0ZSBhIGJyYW5jaCBtYXRjaGluZ1xuICAgIC8vIHRoZSByZW1vdGUgYnJhbmNoLiBMYXRlciB3aXRoIHRoZSBgZ2l0IHB1c2hgLCB0aGUgcmVtb3RlIGlzIHNldCBmb3IgdGhlIGJyYW5jaC5cbiAgICBpZiAodHJhY2tMb2NhbEJyYW5jaCkge1xuICAgICAgYXdhaXQgdGhpcy5jcmVhdGVMb2NhbEJyYW5jaEZyb21IZWFkKGJyYW5jaE5hbWUpO1xuICAgICAgcHVzaEFyZ3MucHVzaCgnLS1zZXQtdXBzdHJlYW0nKTtcbiAgICB9XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBmb3JrLlxuICAgIHRoaXMuZ2l0LnJ1bihbJ3B1c2gnLCByZXBvR2l0VXJsLCBgSEVBRDpyZWZzL2hlYWRzLyR7YnJhbmNoTmFtZX1gLCAuLi5wdXNoQXJnc10pO1xuICAgIHJldHVybiB7Zm9yaywgYnJhbmNoTmFtZX07XG4gIH1cblxuICAvKipcbiAgICogUHVzaGVzIGNoYW5nZXMgdG8gYSBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgaXMgb3duZWQgYnkgdGhlIGN1cnJlbnRseVxuICAgKiBhdXRoZW50aWNhdGVkIHVzZXIuIEEgcHVsbCByZXF1ZXN0IGlzIHRoZW4gY3JlYXRlZCBmb3IgdGhlIHB1c2hlZCBjaGFuZ2VzIG9uIHRoZVxuICAgKiBjb25maWd1cmVkIHByb2plY3QgdGhhdCB0YXJnZXRzIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaC5cbiAgICogQHJldHVybnMgQW4gb2JqZWN0IGRlc2NyaWJpbmcgdGhlIGNyZWF0ZWQgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICB0YXJnZXRCcmFuY2g6IHN0cmluZywgcHJvcG9zZWRGb3JrQnJhbmNoTmFtZTogc3RyaW5nLCB0aXRsZTogc3RyaW5nLFxuICAgICAgYm9keT86IHN0cmluZyk6IFByb21pc2U8UHVsbFJlcXVlc3Q+IHtcbiAgICBjb25zdCByZXBvU2x1ZyA9IGAke3RoaXMuZ2l0LnJlbW90ZVBhcmFtcy5vd25lcn0vJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMucmVwb31gO1xuICAgIGNvbnN0IHtmb3JrLCBicmFuY2hOYW1lfSA9IGF3YWl0IHRoaXMuX3B1c2hIZWFkVG9Gb3JrKHByb3Bvc2VkRm9ya0JyYW5jaE5hbWUsIHRydWUpO1xuICAgIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5wdWxscy5jcmVhdGUoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgaGVhZDogYCR7Zm9yay5vd25lcn06JHticmFuY2hOYW1lfWAsXG4gICAgICBiYXNlOiB0YXJnZXRCcmFuY2gsXG4gICAgICBib2R5LFxuICAgICAgdGl0bGUsXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbGFiZWxzIHRvIHRoZSBuZXdseSBjcmVhdGVkIFBSIGlmIHByb3ZpZGVkIGluIHRoZSBjb25maWd1cmF0aW9uLlxuICAgIGlmICh0aGlzLmNvbmZpZy5yZWxlYXNlUHJMYWJlbHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmlzc3Vlcy5hZGRMYWJlbHMoe1xuICAgICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICAgIGlzc3VlX251bWJlcjogZGF0YS5udW1iZXIsXG4gICAgICAgIGxhYmVsczogdGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHB1bGwgcmVxdWVzdCAjJHtkYXRhLm51bWJlcn0gaW4gJHtyZXBvU2x1Z30uYCkpO1xuICAgIHJldHVybiB7XG4gICAgICBpZDogZGF0YS5udW1iZXIsXG4gICAgICB1cmw6IGRhdGEuaHRtbF91cmwsXG4gICAgICBmb3JrLFxuICAgICAgZm9ya0JyYW5jaDogYnJhbmNoTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFdhaXRzIGZvciB0aGUgZ2l2ZW4gcHVsbCByZXF1ZXN0IHRvIGJlIG1lcmdlZC4gRGVmYXVsdCBpbnRlcnZhbCBmb3IgY2hlY2tpbmcgdGhlIEdpdGh1YlxuICAgKiBBUEkgaXMgMTAgc2Vjb25kcyAodG8gbm90IGV4Y2VlZCBhbnkgcmF0ZSBsaW1pdHMpLiBJZiB0aGUgcHVsbCByZXF1ZXN0IGlzIGNsb3NlZCB3aXRob3V0XG4gICAqIG1lcmdlLCB0aGUgc2NyaXB0IHdpbGwgYWJvcnQgZ3JhY2VmdWxseSAoY29uc2lkZXJpbmcgYSBtYW51YWwgdXNlciBhYm9ydCkuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgd2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZDogbnVtYmVyLCBpbnRlcnZhbCA9IHdhaXRGb3JQdWxsUmVxdWVzdEludGVydmFsKTpcbiAgICAgIFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkZWJ1ZyhgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG5cbiAgICAgIGNvbnN0IHNwaW5uZXIgPSBvcmEuY2FsbCh1bmRlZmluZWQpLnN0YXJ0KGBXYWl0aW5nIGZvciBwdWxsIHJlcXVlc3QgIyR7aWR9IHRvIGJlIG1lcmdlZC5gKTtcbiAgICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHByU3RhdGUgPSBhd2FpdCBnZXRQdWxsUmVxdWVzdFN0YXRlKHRoaXMuZ2l0LCBpZCk7XG4gICAgICAgIGlmIChwclN0YXRlID09PSAnbWVyZ2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBtZXJnZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHByU3RhdGUgPT09ICdjbG9zZWQnKSB7XG4gICAgICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICAgICAgd2Fybih5ZWxsb3coYCAg4pyYICAgUHVsbCByZXF1ZXN0ICMke2lkfSBoYXMgYmVlbiBjbG9zZWQuYCkpO1xuICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWxJZCk7XG4gICAgICAgICAgcmVqZWN0KG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpKTtcbiAgICAgICAgfVxuICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXBlbmQgcmVsZWFzZXMgbm90ZXMgZm9yIGEgdmVyc2lvbiBwdWJsaXNoZWQgaW4gYSBnaXZlbiBicmFuY2ggdG8gdGhlIGNoYW5nZWxvZyBpblxuICAgKiB0aGUgY3VycmVudCBHaXQgYEhFQURgLiBUaGlzIGlzIHVzZWZ1bCBmb3IgY2hlcnJ5LXBpY2tpbmcgdGhlIGNoYW5nZWxvZy5cbiAgICogQHJldHVybnMgQSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgcmVsZWFzZSBub3RlcyBoYXZlIGJlZW4gcHJlcGVuZGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxvY2FsQ2hhbmdlbG9nUGF0aCA9IGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZyA9IGF3YWl0IGZzLnJlYWRGaWxlKGxvY2FsQ2hhbmdlbG9nUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCByZWxlYXNlTm90ZXNFbnRyeSA9IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRDaGFuZ2Vsb2dFbnRyeSgpO1xuICAgIGF3YWl0IGZzLndyaXRlRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsIGAke3JlbGVhc2VOb3Rlc0VudHJ5fVxcblxcbiR7bG9jYWxDaGFuZ2Vsb2d9YCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHRoZSBjaGFuZ2Vsb2cgdG8gY2FwdHVyZSBjaGFuZ2VzIGZvciBcIiR7cmVsZWFzZU5vdGVzLnZlcnNpb259XCIuYCkpO1xuICB9XG5cbiAgLyoqIENoZWNrcyBvdXQgYW4gdXBzdHJlYW0gYnJhbmNoIHdpdGggYSBkZXRhY2hlZCBoZWFkLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICB0aGlzLmdpdC5ydW4oWydmZXRjaCcsICctcScsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYnJhbmNoTmFtZV0pO1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NoZWNrb3V0JywgJ0ZFVENIX0hFQUQnLCAnLS1kZXRhY2gnXSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGNvbW1pdCBmb3IgdGhlIHNwZWNpZmllZCBmaWxlcyB3aXRoIHRoZSBnaXZlbiBtZXNzYWdlLlxuICAgKiBAcGFyYW0gbWVzc2FnZSBNZXNzYWdlIGZvciB0aGUgY3JlYXRlZCBjb21taXRcbiAgICogQHBhcmFtIGZpbGVzIExpc3Qgb2YgcHJvamVjdC1yZWxhdGl2ZSBmaWxlIHBhdGhzIHRvIGJlIGNvbW1pdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUNvbW1pdChtZXNzYWdlOiBzdHJpbmcsIGZpbGVzOiBzdHJpbmdbXSkge1xuICAgIHRoaXMuZ2l0LnJ1bihbJ2NvbW1pdCcsICctLW5vLXZlcmlmeScsICctbScsIG1lc3NhZ2UsIC4uLmZpbGVzXSk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBTdGFnZXMgdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgYnJhbmNoIGFuZCBjcmVhdGVzIGFcbiAgICogcHVsbCByZXF1ZXN0IHRoYXQgdGFyZ2V0cyB0aGUgZ2l2ZW4gYmFzZSBicmFuY2guXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBzdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChcbiAgICAgIG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIsIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzID1cbiAgICAgICAgYXdhaXQgUmVsZWFzZU5vdGVzLmZyb21SYW5nZShuZXdWZXJzaW9uLCB0aGlzLmdpdC5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKSwgJ0hFQUQnKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMucHJlcGVuZFJlbGVhc2VOb3Rlc1RvQ2hhbmdlbG9nKHJlbGVhc2VOb3Rlcyk7XG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yRWRpdHNBbmRDcmVhdGVSZWxlYXNlQ29tbWl0KG5ld1ZlcnNpb24pO1xuXG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIHB1bGxSZXF1ZXN0QmFzZUJyYW5jaCwgYHJlbGVhc2Utc3RhZ2UtJHtuZXdWZXJzaW9ufWAsXG4gICAgICAgIGBCdW1wIHZlcnNpb24gdG8gXCJ2JHtuZXdWZXJzaW9ufVwiIHdpdGggY2hhbmdlbG9nLmApO1xuXG4gICAgaW5mbyhncmVlbignICDinJMgICBSZWxlYXNlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7cHVsbFJlcXVlc3QudXJsfS5gKSk7XG5cbiAgICByZXR1cm4ge3JlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3R9O1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBvdXQgdGhlIHNwZWNpZmllZCB0YXJnZXQgYnJhbmNoLCB2ZXJpZmllcyBpdHMgQ0kgc3RhdHVzIGFuZCBzdGFnZXNcbiAgICogdGhlIHNwZWNpZmllZCBuZXcgdmVyc2lvbiBpbiBvcmRlciB0byBjcmVhdGUgYSBwdWxsIHJlcXVlc3QuXG4gICAqIEByZXR1cm5zIGFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOlxuICAgICAgUHJvbWlzZTx7cmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0OiBQdWxsUmVxdWVzdH0+IHtcbiAgICBhd2FpdCB0aGlzLnZlcmlmeVBhc3NpbmdHaXRodWJTdGF0dXMoc3RhZ2luZ0JyYW5jaCk7XG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHN0YWdpbmdCcmFuY2gpO1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnN0YWdlVmVyc2lvbkZvckJyYW5jaEFuZENyZWF0ZVB1bGxSZXF1ZXN0KG5ld1ZlcnNpb24sIHN0YWdpbmdCcmFuY2gpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZXJyeS1waWNrcyB0aGUgcmVsZWFzZSBub3RlcyBvZiBhIHZlcnNpb24gdGhhdCBoYXZlIGJlZW4gcHVzaGVkIHRvIGEgZ2l2ZW4gYnJhbmNoXG4gICAqIGludG8gdGhlIGBuZXh0YCBwcmltYXJ5IGRldmVsb3BtZW50IGJyYW5jaC4gQSBwdWxsIHJlcXVlc3QgaXMgY3JlYXRlZCBmb3IgdGhpcy5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2Vzc2Z1bCBjcmVhdGlvbiBvZiB0aGUgY2hlcnJ5LXBpY2sgcHVsbCByZXF1ZXN0LlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBzdGFnaW5nQnJhbmNoOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBuZXh0QnJhbmNoID0gdGhpcy5hY3RpdmUubmV4dC5icmFuY2hOYW1lO1xuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKHJlbGVhc2VOb3Rlcy52ZXJzaW9uKTtcblxuICAgIC8vIENoZWNrb3V0IHRoZSBuZXh0IGJyYW5jaC5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gobmV4dEJyYW5jaCk7XG5cbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbY2hhbmdlbG9nUGF0aF0pO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBjaGFuZ2Vsb2cgY2hlcnJ5LXBpY2sgY29tbWl0IGZvcjogXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdCB0aGF0IHNob3VsZCBiZSBtZXJnZWQgYnkgdGhlIGNhcmV0YWtlci5cbiAgICBjb25zdCB7dXJsLCBpZH0gPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIG5leHRCcmFuY2gsIGBjaGFuZ2Vsb2ctY2hlcnJ5LXBpY2stJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1gLCBjb21taXRNZXNzYWdlLFxuICAgICAgICBgQ2hlcnJ5LXBpY2tzIHRoZSBjaGFuZ2Vsb2cgZnJvbSB0aGUgXCIke3N0YWdpbmdCcmFuY2h9XCIgYnJhbmNoIHRvIHRoZSBuZXh0IGAgK1xuICAgICAgICAgICAgYGJyYW5jaCAoJHtuZXh0QnJhbmNofSkuYCk7XG5cbiAgICBpbmZvKGdyZWVuKFxuICAgICAgICBgICDinJMgICBQdWxsIHJlcXVlc3QgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cgaW50byBcIiR7bmV4dEJyYW5jaH1cIiBgICtcbiAgICAgICAgJ2hhcyBiZWVuIGNyZWF0ZWQuJykpO1xuICAgIGluZm8oeWVsbG93KGAgICAgICBQbGVhc2UgYXNrIHRlYW0gbWVtYmVycyB0byByZXZpZXc6ICR7dXJsfS5gKSk7XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgUHVsbCBSZXF1ZXN0IHRvIGJlIG1lcmdlZC5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIEdpdGh1YiByZWxlYXNlIGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24gaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC5cbiAgICogVGhlIHJlbGVhc2UgaXMgY3JlYXRlZCBieSB0YWdnaW5nIHRoZSBzcGVjaWZpZWQgY29tbWl0IFNIQS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgcmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMsIHZlcnNpb25CdW1wQ29tbWl0U2hhOiBzdHJpbmcsIHByZXJlbGVhc2U6IGJvb2xlYW4pIHtcbiAgICBjb25zdCB0YWdOYW1lID0gcmVsZWFzZU5vdGVzLnZlcnNpb24uZm9ybWF0KCk7XG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLmdpdC5jcmVhdGVSZWYoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgcmVmOiBgcmVmcy90YWdzLyR7dGFnTmFtZX1gLFxuICAgICAgc2hhOiB2ZXJzaW9uQnVtcENvbW1pdFNoYSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFRhZ2dlZCB2JHtyZWxlYXNlTm90ZXMudmVyc2lvbn0gcmVsZWFzZSB1cHN0cmVhbS5gKSk7XG5cbiAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuY3JlYXRlUmVsZWFzZSh7XG4gICAgICAuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsXG4gICAgICBuYW1lOiBgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCxcbiAgICAgIHRhZ19uYW1lOiB0YWdOYW1lLFxuICAgICAgcHJlcmVsZWFzZSxcbiAgICAgIGJvZHk6IGF3YWl0IHJlbGVhc2VOb3Rlcy5nZXRHaXRodWJSZWxlYXNlRW50cnkoKSxcbiAgICB9KTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgaW4gR2l0aHViLmApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCdWlsZHMgYW5kIHB1Ymxpc2hlcyB0aGUgZ2l2ZW4gdmVyc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJyYW5jaC5cbiAgICogQHBhcmFtIG5ld1ZlcnNpb24gVGhlIG5ldyB2ZXJzaW9uIHRvIGJlIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHB1Ymxpc2hCcmFuY2ggTmFtZSBvZiB0aGUgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIG5ldyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gbnBtRGlzdFRhZyBOUE0gZGlzdCB0YWcgd2hlcmUgdGhlIHZlcnNpb24gc2hvdWxkIGJlIHB1Ymxpc2hlZCB0by5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZEFuZFB1Ymxpc2goXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVibGlzaEJyYW5jaDogc3RyaW5nLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBjb25zdCB2ZXJzaW9uQnVtcENvbW1pdFNoYSA9IGF3YWl0IHRoaXMuX2dldENvbW1pdE9mQnJhbmNoKHB1Ymxpc2hCcmFuY2gpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl9pc0NvbW1pdEZvclZlcnNpb25TdGFnaW5nKHJlbGVhc2VOb3Rlcy52ZXJzaW9uLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSkpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBMYXRlc3QgY29tbWl0IGluIFwiJHtwdWJsaXNoQnJhbmNofVwiIGJyYW5jaCBpcyBub3QgYSBzdGFnaW5nIGNvbW1pdC5gKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIFBsZWFzZSBtYWtlIHN1cmUgdGhlIHN0YWdpbmcgcHVsbCByZXF1ZXN0IGhhcyBiZWVuIG1lcmdlZC4nKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG5cbiAgICAvLyBDaGVja291dCB0aGUgcHVibGlzaCBicmFuY2ggYW5kIGJ1aWxkIHRoZSByZWxlYXNlIHBhY2thZ2VzLlxuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIC8vIEluc3RhbGwgdGhlIHByb2plY3QgZGVwZW5kZW5jaWVzIGZvciB0aGUgcHVibGlzaCBicmFuY2gsIGFuZCB0aGVuIGJ1aWxkIHRoZSByZWxlYXNlXG4gICAgLy8gcGFja2FnZXMuIE5vdGUgdGhhdCB3ZSBkbyBub3QgZGlyZWN0bHkgY2FsbCB0aGUgYnVpbGQgcGFja2FnZXMgZnVuY3Rpb24gZnJvbSB0aGUgcmVsZWFzZVxuICAgIC8vIGNvbmZpZy4gV2Ugb25seSB3YW50IHRvIGJ1aWxkIGFuZCBwdWJsaXNoIHBhY2thZ2VzIHRoYXQgaGF2ZSBiZWVuIGNvbmZpZ3VyZWQgaW4gdGhlIGdpdmVuXG4gICAgLy8gcHVibGlzaCBicmFuY2guIGUuZy4gY29uc2lkZXIgd2UgcHVibGlzaCBwYXRjaCB2ZXJzaW9uIGFuZCBhIG5ldyBwYWNrYWdlIGhhcyBiZWVuXG4gICAgLy8gY3JlYXRlZCBpbiB0aGUgYG5leHRgIGJyYW5jaC4gVGhlIG5ldyBwYWNrYWdlIHdvdWxkIG5vdCBiZSBwYXJ0IG9mIHRoZSBwYXRjaCBicmFuY2gsXG4gICAgLy8gc28gd2UgY2Fubm90IGJ1aWxkIGFuZCBwdWJsaXNoIGl0LlxuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGNvbnN0IGJ1aWx0UGFja2FnZXMgPSBhd2FpdCBpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kKCk7XG5cbiAgICAvLyBWZXJpZnkgdGhlIHBhY2thZ2VzIGJ1aWx0IGFyZSB0aGUgY29ycmVjdCB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgYnVpbHRQYWNrYWdlcyk7XG5cbiAgICAvLyBDcmVhdGUgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIG5ldyB2ZXJzaW9uLlxuICAgIGF3YWl0IHRoaXMuX2NyZWF0ZUdpdGh1YlJlbGVhc2VGb3JWZXJzaW9uKFxuICAgICAgICByZWxlYXNlTm90ZXMsIHZlcnNpb25CdW1wQ29tbWl0U2hhLCBucG1EaXN0VGFnID09PSAnbmV4dCcpO1xuXG4gICAgLy8gV2FsayB0aHJvdWdoIGFsbCBidWlsdCBwYWNrYWdlcyBhbmQgcHVibGlzaCB0aGVtIHRvIE5QTS5cbiAgICBmb3IgKGNvbnN0IGJ1aWx0UGFja2FnZSBvZiBidWlsdFBhY2thZ2VzKSB7XG4gICAgICBhd2FpdCB0aGlzLl9wdWJsaXNoQnVpbHRQYWNrYWdlVG9OcG0oYnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnKTtcbiAgICB9XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIFB1Ymxpc2hlZCBhbGwgcGFja2FnZXMgc3VjY2Vzc2Z1bGx5JykpO1xuICB9XG5cbiAgLyoqIFB1Ymxpc2hlcyB0aGUgZ2l2ZW4gYnVpbHQgcGFja2FnZSB0byBOUE0gd2l0aCB0aGUgc3BlY2lmaWVkIE5QTSBkaXN0IHRhZy4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKHBrZzogQnVpbHRQYWNrYWdlLCBucG1EaXN0VGFnOiBzdHJpbmcpIHtcbiAgICBkZWJ1ZyhgU3RhcnRpbmcgcHVibGlzaCBvZiBcIiR7cGtnLm5hbWV9XCIuYCk7XG4gICAgY29uc3Qgc3Bpbm5lciA9IG9yYS5jYWxsKHVuZGVmaW5lZCkuc3RhcnQoYFB1Ymxpc2hpbmcgXCIke3BrZy5uYW1lfVwiYCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgcnVuTnBtUHVibGlzaChwa2cub3V0cHV0UGF0aCwgbnBtRGlzdFRhZywgdGhpcy5jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgaW5mbyhncmVlbihgICDinJMgICBTdWNjZXNzZnVsbHkgcHVibGlzaGVkIFwiJHtwa2cubmFtZX0uYCkpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgZXJyb3IoZSk7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgcHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCIuYCkpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBnaXZlbiBjb21taXQgcmVwcmVzZW50cyBhIHN0YWdpbmcgY29tbWl0IGZvciB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQ29tbWl0Rm9yVmVyc2lvblN0YWdpbmcodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29tbWl0U2hhOiBzdHJpbmcpIHtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tbWl0KHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgcmV0dXJuIGRhdGEuY29tbWl0Lm1lc3NhZ2Uuc3RhcnRzV2l0aChnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZSh2ZXJzaW9uKSk7XG4gIH1cblxuICAvKiogVmVyaWZ5IHRoZSB2ZXJzaW9uIG9mIGVhY2ggZ2VuZXJhdGVkIHBhY2thZ2UgZXhhY3QgbWF0Y2hlcyB0aGUgc3BlY2lmaWVkIHZlcnNpb24uICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVBhY2thZ2VWZXJzaW9ucyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwYWNrYWdlczogQnVpbHRQYWNrYWdlW10pIHtcbiAgICBmb3IgKGNvbnN0IHBrZyBvZiBwYWNrYWdlcykge1xuICAgICAgY29uc3Qge3ZlcnNpb246IHBhY2thZ2VKc29uVmVyc2lvbn0gPVxuICAgICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUoam9pbihwa2cub3V0cHV0UGF0aCwgJ3BhY2thZ2UuanNvbicpLCAndXRmOCcpKSBhc1xuICAgICAgICAgIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgICBpZiAodmVyc2lvbi5jb21wYXJlKHBhY2thZ2VKc29uVmVyc2lvbikgIT09IDApIHtcbiAgICAgICAgZXJyb3IocmVkKCdUaGUgYnVpbHQgcGFja2FnZSB2ZXJzaW9uIGRvZXMgbm90IG1hdGNoIHRoZSB2ZXJzaW9uIGJlaW5nIHJlbGVhc2VkLicpKTtcbiAgICAgICAgZXJyb3IoYCAgUmVsZWFzZSBWZXJzaW9uOiAgICR7dmVyc2lvbi52ZXJzaW9ufWApO1xuICAgICAgICBlcnJvcihgICBHZW5lcmF0ZWQgVmVyc2lvbjogJHtwYWNrYWdlSnNvblZlcnNpb259YCk7XG4gICAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19