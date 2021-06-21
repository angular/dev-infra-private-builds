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
        define("@angular/dev-infra-private/release/publish/actions", ["require", "exports", "tslib", "fs", "ora", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/github-urls", "@angular/dev-infra-private/release/notes/release-notes", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/external-commands", "@angular/dev-infra-private/release/publish/graphql-queries", "@angular/dev-infra-private/release/publish/pull-request-state"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWtDO0lBQ2xDLHlCQUEyQjtJQUMzQiw2QkFBMEI7SUFHMUIsb0VBQWdHO0lBRWhHLGdGQUEyRjtJQUUzRix3RkFBb0Q7SUFHcEQseUZBQXdEO0lBRXhELDBGQUF1RjtJQUN2Riw0RkFBbUc7SUFDbkcsa0ZBQXVGO0lBQ3ZGLGtHQUF3RjtJQUN4Riw4RkFBNEQ7SUFDNUQsb0dBQXlEO0lBNEJ6RDs7OztPQUlHO0lBQ0g7UUFrQkUsdUJBQ2MsTUFBMkIsRUFBWSxHQUEyQixFQUNsRSxNQUFxQixFQUFZLFVBQWtCO1lBRG5ELFdBQU0sR0FBTixNQUFNLENBQXFCO1lBQVksUUFBRyxHQUFILEdBQUcsQ0FBd0I7WUFDbEUsV0FBTSxHQUFOLE1BQU0sQ0FBZTtZQUFZLGVBQVUsR0FBVixVQUFVLENBQVE7WUFMakUsbURBQW1EO1lBQzNDLG9CQUFlLEdBQW9CLElBQUksQ0FBQztRQUlvQixDQUFDO1FBbkJyRSxzREFBc0Q7UUFDL0Msc0JBQVEsR0FBZixVQUFnQixPQUE0QixFQUFFLE9BQXNCO1lBQ2xFLE1BQU0sS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDbEMsQ0FBQztRQWtCRCx3RUFBd0U7UUFDeEQsNENBQW9CLEdBQXBDLFVBQXFDLFVBQXlCOzs7Ozs7NEJBQ3RELFdBQVcsR0FBRyxXQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSwyQkFBZSxDQUFDLENBQUM7NEJBRXZELEtBQUEsQ0FBQSxLQUFBLElBQUksQ0FBQSxDQUFDLEtBQUssQ0FBQTs0QkFBQyxxQkFBTSxhQUFFLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFBQTs7NEJBRC9DLE9BQU8sR0FD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LG9CQUFDO0lBQUQsQ0FBQyxBQTljRCxJQThjQztJQTljcUIsc0NBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtwcm9taXNlcyBhcyBmc30gZnJvbSAnZnMnO1xuaW1wb3J0ICogYXMgb3JhIGZyb20gJ29yYSc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7ZGVidWcsIGVycm9yLCBncmVlbiwgaW5mbywgcHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBdXRoZW50aWNhdGVkR2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvYXV0aGVudGljYXRlZC1naXQtY2xpZW50JztcbmltcG9ydCB7Z2V0TGlzdENvbW1pdHNJbkJyYW5jaFVybCwgZ2V0UmVwb3NpdG9yeUdpdFVybH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yi11cmxzJztcbmltcG9ydCB7QnVpbHRQYWNrYWdlLCBSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZWxlYXNlTm90ZXN9IGZyb20gJy4uL25vdGVzL3JlbGVhc2Utbm90ZXMnO1xuaW1wb3J0IHtOcG1EaXN0VGFnfSBmcm9tICcuLi92ZXJzaW9uaW5nJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtydW5OcG1QdWJsaXNofSBmcm9tICcuLi92ZXJzaW9uaW5nL25wbS1wdWJsaXNoJztcblxuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlLCBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlJztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aCwgcGFja2FnZUpzb25QYXRoLCB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbH0gZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHtpbnZva2VSZWxlYXNlQnVpbGRDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuaW1wb3J0IHtmaW5kT3duZWRGb3Jrc09mUmVwb1F1ZXJ5fSBmcm9tICcuL2dyYXBocWwtcXVlcmllcyc7XG5pbXBvcnQge2dldFB1bGxSZXF1ZXN0U3RhdGV9IGZyb20gJy4vcHVsbC1yZXF1ZXN0LXN0YXRlJztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG8ge1xuICBvd25lcjogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG59XG5cbi8qKiBJbnRlcmZhY2UgZGVzY3JpYmluZyBhIEdpdGh1YiBwdWxsIHJlcXVlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxSZXF1ZXN0IHtcbiAgLyoqIFVuaXF1ZSBpZCBmb3IgdGhlIHB1bGwgcmVxdWVzdCAoaS5lLiB0aGUgUFIgbnVtYmVyKS4gKi9cbiAgaWQ6IG51bWJlcjtcbiAgLyoqIFVSTCB0aGF0IHJlc29sdmVzIHRvIHRoZSBwdWxsIHJlcXVlc3QgaW4gR2l0aHViLiAqL1xuICB1cmw6IHN0cmluZztcbiAgLyoqIEZvcmsgY29udGFpbmluZyB0aGUgaGVhZCBicmFuY2ggb2YgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcms6IEdpdGh1YlJlcG87XG4gIC8qKiBCcmFuY2ggbmFtZSBpbiB0aGUgZm9yayB0aGF0IGRlZmluZXMgdGhpcyBwdWxsIHJlcXVlc3QuICovXG4gIGZvcmtCcmFuY2g6IHN0cmluZztcbn1cblxuLyoqIENvbnN0cnVjdG9yIHR5cGUgZm9yIGluc3RhbnRpYXRpbmcgYSByZWxlYXNlIGFjdGlvbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3I8VCBleHRlbmRzIFJlbGVhc2VBY3Rpb24gPSBSZWxlYXNlQWN0aW9uPiB7XG4gIC8qKiBXaGV0aGVyIHRoZSByZWxlYXNlIGFjdGlvbiBpcyBjdXJyZW50bHkgYWN0aXZlLiAqL1xuICBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZyk6IFByb21pc2U8Ym9vbGVhbj47XG4gIC8qKiBDb25zdHJ1Y3RzIGEgcmVsZWFzZSBhY3Rpb24uICovXG4gIG5ldyguLi5hcmdzOiBbQWN0aXZlUmVsZWFzZVRyYWlucywgQXV0aGVudGljYXRlZEdpdENsaWVudCwgUmVsZWFzZUNvbmZpZywgc3RyaW5nXSk6IFQ7XG59XG5cbi8qKlxuICogQWJzdHJhY3QgYmFzZSBjbGFzcyBmb3IgYSByZWxlYXNlIGFjdGlvbi4gQSByZWxlYXNlIGFjdGlvbiBpcyBzZWxlY3RhYmxlIGJ5IHRoZSBjYXJldGFrZXJcbiAqIGlmIGFjdGl2ZSwgYW5kIGNhbiBwZXJmb3JtIGNoYW5nZXMgZm9yIHJlbGVhc2luZywgc3VjaCBhcyBzdGFnaW5nIGEgcmVsZWFzZSwgYnVtcGluZyB0aGVcbiAqIHZlcnNpb24sIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2csIGJyYW5jaGluZyBvZmYgZnJvbSBtYXN0ZXIuIGV0Yy5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogV2hldGhlciB0aGUgcmVsZWFzZSBhY3Rpb24gaXMgY3VycmVudGx5IGFjdGl2ZS4gKi9cbiAgc3RhdGljIGlzQWN0aXZlKF90cmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIF9jb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0aHJvdyBFcnJvcignTm90IGltcGxlbWVudGVkLicpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBhYnN0cmFjdCBnZXREZXNjcmlwdGlvbigpOiBQcm9taXNlPHN0cmluZz47XG4gIC8qKlxuICAgKiBQZXJmb3JtcyB0aGUgZ2l2ZW4gcmVsZWFzZSBhY3Rpb24uXG4gICAqIEB0aHJvd3Mge1VzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBXaGVuIHRoZSB1c2VyIG1hbnVhbGx5IGFib3J0ZWQgdGhlIGFjdGlvbi5cbiAgICogQHRocm93cyB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3J9IFdoZW4gdGhlIGFjdGlvbiBoYXMgYmVlbiBhYm9ydGVkIGR1ZSB0byBhIGZhdGFsIGVycm9yLlxuICAgKi9cbiAgYWJzdHJhY3QgcGVyZm9ybSgpOiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKiBDYWNoZWQgZm91bmQgZm9yayBvZiB0aGUgY29uZmlndXJlZCBwcm9qZWN0LiAqL1xuICBwcml2YXRlIF9jYWNoZWRGb3JrUmVwbzogR2l0aHViUmVwb3xudWxsID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIHByb3RlY3RlZCBnaXQ6IEF1dGhlbnRpY2F0ZWRHaXRDbGllbnQsXG4gICAgICBwcm90ZWN0ZWQgY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgcHJvamVjdERpcjogc3RyaW5nKSB7fVxuXG4gIC8qKiBVcGRhdGVzIHRoZSB2ZXJzaW9uIGluIHRoZSBwcm9qZWN0IHRvcC1sZXZlbCBgcGFja2FnZS5qc29uYCBmaWxlLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlUHJvamVjdFZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGNvbnN0IHBrZ0pzb25QYXRoID0gam9pbih0aGlzLnByb2plY3REaXIsIHBhY2thZ2VKc29uUGF0aCk7XG4gICAgY29uc3QgcGtnSnNvbiA9XG4gICAgICAgIEpTT04ucGFyc2UoYXdhaXQgZnMucmVhZEZpbGUocGtnSnNvblBhdGgsICd1dGY4JykpIGFzIHt2ZXJzaW9uOiBzdHJpbmcsIFtrZXk6IHN0cmluZ106IGFueX07XG4gICAgcGtnSnNvbi52ZXJzaW9uID0gbmV3VmVyc2lvbi5mb3JtYXQoKTtcbiAgICAvLyBXcml0ZSB0aGUgYHBhY2thZ2UuanNvbmAgZmlsZS4gTm90ZSB0aGF0IHdlIGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lXG4gICAgLy8gdG8gYXZvaWQgdW5uZWNlc3NhcnkgZGlmZi4gSURFcyB1c3VhbGx5IGFkZCBhIHRyYWlsaW5nIG5ldyBsaW5lLlxuICAgIGF3YWl0IGZzLndyaXRlRmlsZShwa2dKc29uUGF0aCwgYCR7SlNPTi5zdHJpbmdpZnkocGtnSnNvbiwgbnVsbCwgMil9XFxuYCk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBVcGRhdGVkIHByb2plY3QgdmVyc2lvbiB0byAke3BrZ0pzb24udmVyc2lvbn1gKSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbW9zdCByZWNlbnQgY29tbWl0IG9mIGEgc3BlY2lmaWVkIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfZ2V0Q29tbWl0T2ZCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB7ZGF0YToge2NvbW1pdH19ID1cbiAgICAgICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IGJyYW5jaE5hbWV9KTtcbiAgICByZXR1cm4gY29tbWl0LnNoYTtcbiAgfVxuXG4gIC8qKiBWZXJpZmllcyB0aGF0IHRoZSBsYXRlc3QgY29tbWl0IGZvciB0aGUgZ2l2ZW4gYnJhbmNoIGlzIHBhc3NpbmcgYWxsIHN0YXR1c2VzLiAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgdmVyaWZ5UGFzc2luZ0dpdGh1YlN0YXR1cyhicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBjb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBjb25zdCB7ZGF0YToge3N0YXRlfX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0Q29tYmluZWRTdGF0dXNGb3JSZWYoXG4gICAgICAgIHsuLi50aGlzLmdpdC5yZW1vdGVQYXJhbXMsIHJlZjogY29tbWl0U2hhfSk7XG4gICAgY29uc3QgYnJhbmNoQ29tbWl0c1VybCA9IGdldExpc3RDb21taXRzSW5CcmFuY2hVcmwodGhpcy5naXQsIGJyYW5jaE5hbWUpO1xuXG4gICAgaWYgKHN0YXRlID09PSAnZmFpbHVyZScpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgIHJlZChgICDinJggICBDYW5ub3Qgc3RhZ2UgcmVsZWFzZS4gQ29tbWl0IFwiJHtjb21taXRTaGF9XCIgZG9lcyBub3QgcGFzcyBhbGwgZ2l0aHViIGAgK1xuICAgICAgICAgICAgICAnc3RhdHVzIGNoZWNrcy4gUGxlYXNlIG1ha2Ugc3VyZSB0aGlzIGNvbW1pdCBwYXNzZXMgYWxsIGNoZWNrcyBiZWZvcmUgcmUtcnVubmluZy4nKSk7XG4gICAgICBlcnJvcihgICAgICAgUGxlYXNlIGhhdmUgYSBsb29rIGF0OiAke2JyYW5jaENvbW1pdHNVcmx9YCk7XG5cbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coXG4gICAgICAgICAgICAnICDimqAgICBVcHN0cmVhbSBjb21taXQgaXMgZmFpbGluZyBDSSBjaGVja3MsIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09ICdwZW5kaW5nJykge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIENvbW1pdCBcIiR7Y29tbWl0U2hhfVwiIHN0aWxsIGhhcyBwZW5kaW5nIGdpdGh1YiBzdGF0dXNlcyB0aGF0IGAgK1xuICAgICAgICAgICAgICAnbmVlZCB0byBzdWNjZWVkIGJlZm9yZSBzdGFnaW5nIGEgcmVsZWFzZS4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBoYXZlIGEgbG9vayBhdDogJHticmFuY2hDb21taXRzVXJsfWApKTtcbiAgICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBpZ25vcmUgdGhlIEdpdGh1YiBzdGF0dXMgYW5kIHByb2NlZWQ/JykpIHtcbiAgICAgICAgaW5mbyh5ZWxsb3coJyAg4pqgICAgVXBzdHJlYW0gY29tbWl0IGlzIHBlbmRpbmcgQ0ksIGJ1dCBzdGF0dXMgaGFzIGJlZW4gZm9yY2libHkgaWdub3JlZC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgVXBzdHJlYW0gY29tbWl0IGlzIHBhc3NpbmcgYWxsIGdpdGh1YiBzdGF0dXMgY2hlY2tzLicpKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFByb21wdHMgdGhlIHVzZXIgZm9yIHBvdGVudGlhbCByZWxlYXNlIG5vdGVzIGVkaXRzIHRoYXQgbmVlZCB0byBiZSBtYWRlLiBPbmNlXG4gICAqIGNvbmZpcm1lZCwgYSBuZXcgY29tbWl0IGZvciB0aGUgcmVsZWFzZSBwb2ludCBpcyBjcmVhdGVkLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JFZGl0c0FuZENyZWF0ZVJlbGVhc2VDb21taXQobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICAgIGluZm8oeWVsbG93KFxuICAgICAgICAnICDimqAgICBQbGVhc2UgcmV2aWV3IHRoZSBjaGFuZ2Vsb2cgYW5kIGVuc3VyZSB0aGF0IHRoZSBsb2cgY29udGFpbnMgb25seSBjaGFuZ2VzICcgK1xuICAgICAgICAndGhhdCBhcHBseSB0byB0aGUgcHVibGljIEFQSSBzdXJmYWNlLiBNYW51YWwgY2hhbmdlcyBjYW4gYmUgbWFkZS4gV2hlbiBkb25lLCBwbGVhc2UgJyArXG4gICAgICAgICdwcm9jZWVkIHdpdGggdGhlIHByb21wdCBiZWxvdy4nKSk7XG5cbiAgICBpZiAoIWF3YWl0IHByb21wdENvbmZpcm0oJ0RvIHlvdSB3YW50IHRvIHByb2NlZWQgYW5kIGNvbW1pdCB0aGUgY2hhbmdlcz8nKSkge1xuICAgICAgdGhyb3cgbmV3IFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0IG1lc3NhZ2UgZm9yIHRoZSByZWxlYXNlIHBvaW50LlxuICAgIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSBnZXRDb21taXRNZXNzYWdlRm9yUmVsZWFzZShuZXdWZXJzaW9uKTtcbiAgICAvLyBDcmVhdGUgYSByZWxlYXNlIHN0YWdpbmcgY29tbWl0IGluY2x1ZGluZyBjaGFuZ2Vsb2cgYW5kIHZlcnNpb24gYnVtcC5cbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNvbW1pdChjb21taXRNZXNzYWdlLCBbcGFja2FnZUpzb25QYXRoLCBjaGFuZ2Vsb2dQYXRoXSk7XG5cbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgcmVsZWFzZSBjb21taXQgZm9yOiBcIiR7bmV3VmVyc2lvbn1cIi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbiBvd25lZCBmb3JrIGZvciB0aGUgY29uZmlndXJlZCBwcm9qZWN0IG9mIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIEFib3J0cyB0aGVcbiAgICogcHJvY2VzcyB3aXRoIGFuIGVycm9yIGlmIG5vIGZvcmsgY291bGQgYmUgZm91bmQuIEFsc28gY2FjaGVzIHRoZSBkZXRlcm1pbmVkIGZvcmtcbiAgICogcmVwb3NpdG9yeSBhcyB0aGUgYXV0aGVudGljYXRlZCB1c2VyIGNhbm5vdCBjaGFuZ2UgZHVyaW5nIGFjdGlvbiBleGVjdXRpb24uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpOiBQcm9taXNlPEdpdGh1YlJlcG8+IHtcbiAgICBpZiAodGhpcy5fY2FjaGVkRm9ya1JlcG8gIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRGb3JrUmVwbztcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5naXQucmVtb3RlQ29uZmlnO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5ncmFwaHFsKGZpbmRPd25lZEZvcmtzT2ZSZXBvUXVlcnksIHtvd25lciwgbmFtZX0pO1xuICAgIGNvbnN0IGZvcmtzID0gcmVzdWx0LnJlcG9zaXRvcnkuZm9ya3Mubm9kZXM7XG5cbiAgICBpZiAoZm9ya3MubGVuZ3RoID09PSAwKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVW5hYmxlIHRvIGZpbmQgZm9yayBmb3IgY3VycmVudGx5IGF1dGhlbnRpY2F0ZWQgdXNlci4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBlbnN1cmUgeW91IGNyZWF0ZWQgYSBmb3JrIG9mOiAke293bmVyfS8ke25hbWV9LmApKTtcbiAgICAgIHRocm93IG5ldyBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcigpO1xuICAgIH1cblxuICAgIGNvbnN0IGZvcmsgPSBmb3Jrc1swXTtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVkRm9ya1JlcG8gPSB7b3duZXI6IGZvcmsub3duZXIubG9naW4sIG5hbWU6IGZvcmsubmFtZX07XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBicmFuY2ggbmFtZSBpcyByZXNlcnZlZCBpbiB0aGUgc3BlY2lmaWVkIHJlcG9zaXRvcnkuICovXG4gIHByaXZhdGUgYXN5bmMgX2lzQnJhbmNoTmFtZVJlc2VydmVkSW5SZXBvKHJlcG86IEdpdGh1YlJlcG8sIG5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLmdpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBicmFuY2g6IG5hbWV9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIC8vIElmIHRoZSBlcnJvciBoYXMgYSBgc3RhdHVzYCBwcm9wZXJ0eSBzZXQgdG8gYDQwNGAsIHRoZW4gd2Uga25vdyB0aGF0IHRoZSBicmFuY2hcbiAgICAgIC8vIGRvZXMgbm90IGV4aXN0LiBPdGhlcndpc2UsIGl0IG1pZ2h0IGJlIGFuIEFQSSBlcnJvciB0aGF0IHdlIHdhbnQgdG8gcmVwb3J0L3JlLXRocm93LlxuICAgICAgaWYgKGUuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdGhyb3cgZTtcbiAgICB9XG4gIH1cblxuICAvKiogRmluZHMgYSBub24tcmVzZXJ2ZWQgYnJhbmNoIG5hbWUgaW4gdGhlIHJlcG9zaXRvcnkgd2l0aCByZXNwZWN0IHRvIGEgYmFzZSBuYW1lLiAqL1xuICBwcml2YXRlIGFzeW5jIF9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShyZXBvOiBHaXRodWJSZXBvLCBiYXNlTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBsZXQgY3VycmVudE5hbWUgPSBiYXNlTmFtZTtcbiAgICBsZXQgc3VmZml4TnVtID0gMDtcbiAgICB3aGlsZSAoYXdhaXQgdGhpcy5faXNCcmFuY2hOYW1lUmVzZXJ2ZWRJblJlcG8ocmVwbywgY3VycmVudE5hbWUpKSB7XG4gICAgICBzdWZmaXhOdW0rKztcbiAgICAgIGN1cnJlbnROYW1lID0gYCR7YmFzZU5hbWV9XyR7c3VmZml4TnVtfWA7XG4gICAgfVxuICAgIHJldHVybiBjdXJyZW50TmFtZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbG9jYWwgYnJhbmNoIGZyb20gdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gV2lsbCBvdmVycmlkZVxuICAgKiBleGlzdGluZyBicmFuY2hlcyBpbiBjYXNlIG9mIGEgY29sbGlzaW9uLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNyZWF0ZUxvY2FsQnJhbmNoRnJvbUhlYWQoYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnY2hlY2tvdXQnLCAnLUInLCBicmFuY2hOYW1lXSk7XG4gIH1cblxuICAvKiogUHVzaGVzIHRoZSBjdXJyZW50IEdpdCBgSEVBRGAgdG8gdGhlIGdpdmVuIHJlbW90ZSBicmFuY2ggaW4gdGhlIGNvbmZpZ3VyZWQgcHJvamVjdC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHB1c2hIZWFkVG9SZW1vdGVCcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgLy8gUHVzaCB0aGUgbG9jYWwgYEhFQURgIHRvIHRoZSByZW1vdGUgYnJhbmNoIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAgdGhpcy5naXQucnVuKFsncHVzaCcsIHRoaXMuZ2l0LmdldFJlcG9HaXRVcmwoKSwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YF0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyB0aGUgY3VycmVudCBHaXQgYEhFQURgIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5XG4gICAqIHRoZSBhdXRoZW50aWNhdGVkIHVzZXIuIElmIHRoZSBzcGVjaWZpZWQgYnJhbmNoIG5hbWUgZXhpc3RzIGluIHRoZSBmb3JrIGFscmVhZHksIGFcbiAgICogdW5pcXVlIG9uZSB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgcHJvcG9zZWQgbmFtZSB0byBhdm9pZCBjb2xsaXNpb25zLlxuICAgKiBAcGFyYW0gcHJvcG9zZWRCcmFuY2hOYW1lIFByb3Bvc2VkIGJyYW5jaCBuYW1lIGZvciB0aGUgZm9yay5cbiAgICogQHBhcmFtIHRyYWNrTG9jYWxCcmFuY2ggV2hldGhlciB0aGUgZm9yayBicmFuY2ggc2hvdWxkIGJlIHRyYWNrZWQgbG9jYWxseS4gaS5lLiB3aGV0aGVyXG4gICAqICAgYSBsb2NhbCBicmFuY2ggd2l0aCByZW1vdGUgdHJhY2tpbmcgc2hvdWxkIGJlIHNldCB1cC5cbiAgICogQHJldHVybnMgVGhlIGZvcmsgYW5kIGJyYW5jaCBuYW1lIGNvbnRhaW5pbmcgdGhlIHB1c2hlZCBjaGFuZ2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHVzaEhlYWRUb0ZvcmsocHJvcG9zZWRCcmFuY2hOYW1lOiBzdHJpbmcsIHRyYWNrTG9jYWxCcmFuY2g6IGJvb2xlYW4pOlxuICAgICAgUHJvbWlzZTx7Zm9yazogR2l0aHViUmVwbywgYnJhbmNoTmFtZTogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGZvcmsgPSBhd2FpdCB0aGlzLl9nZXRGb3JrT2ZBdXRoZW50aWNhdGVkVXNlcigpO1xuICAgIC8vIENvbXB1dGUgYSByZXBvc2l0b3J5IFVSTCBmb3IgcHVzaGluZyB0byB0aGUgZm9yay4gTm90ZSB0aGF0IHdlIHdhbnQgdG8gcmVzcGVjdFxuICAgIC8vIHRoZSBTU0ggb3B0aW9uIGZyb20gdGhlIGRldi1pbmZyYSBnaXRodWIgY29uZmlndXJhdGlvbi5cbiAgICBjb25zdCByZXBvR2l0VXJsID1cbiAgICAgICAgZ2V0UmVwb3NpdG9yeUdpdFVybCh7Li4uZm9yaywgdXNlU3NoOiB0aGlzLmdpdC5yZW1vdGVDb25maWcudXNlU3NofSwgdGhpcy5naXQuZ2l0aHViVG9rZW4pO1xuICAgIGNvbnN0IGJyYW5jaE5hbWUgPSBhd2FpdCB0aGlzLl9maW5kQXZhaWxhYmxlQnJhbmNoTmFtZShmb3JrLCBwcm9wb3NlZEJyYW5jaE5hbWUpO1xuICAgIGNvbnN0IHB1c2hBcmdzOiBzdHJpbmdbXSA9IFtdO1xuICAgIC8vIElmIGEgbG9jYWwgYnJhbmNoIHNob3VsZCB0cmFjayB0aGUgcmVtb3RlIGZvcmsgYnJhbmNoLCBjcmVhdGUgYSBicmFuY2ggbWF0Y2hpbmdcbiAgICAvLyB0aGUgcmVtb3RlIGJyYW5jaC4gTGF0ZXIgd2l0aCB0aGUgYGdpdCBwdXNoYCwgdGhlIHJlbW90ZSBpcyBzZXQgZm9yIHRoZSBicmFuY2guXG4gICAgaWYgKHRyYWNrTG9jYWxCcmFuY2gpIHtcbiAgICAgIGF3YWl0IHRoaXMuY3JlYXRlTG9jYWxCcmFuY2hGcm9tSGVhZChicmFuY2hOYW1lKTtcbiAgICAgIHB1c2hBcmdzLnB1c2goJy0tc2V0LXVwc3RyZWFtJyk7XG4gICAgfVxuICAgIC8vIFB1c2ggdGhlIGxvY2FsIGBIRUFEYCB0byB0aGUgcmVtb3RlIGJyYW5jaCBpbiB0aGUgZm9yay5cbiAgICB0aGlzLmdpdC5ydW4oWydwdXNoJywgcmVwb0dpdFVybCwgYEhFQUQ6cmVmcy9oZWFkcy8ke2JyYW5jaE5hbWV9YCwgLi4ucHVzaEFyZ3NdKTtcbiAgICByZXR1cm4ge2ZvcmssIGJyYW5jaE5hbWV9O1xuICB9XG5cbiAgLyoqXG4gICAqIFB1c2hlcyBjaGFuZ2VzIHRvIGEgZm9yayBmb3IgdGhlIGNvbmZpZ3VyZWQgcHJvamVjdCB0aGF0IGlzIG93bmVkIGJ5IHRoZSBjdXJyZW50bHlcbiAgICogYXV0aGVudGljYXRlZCB1c2VyLiBBIHB1bGwgcmVxdWVzdCBpcyB0aGVuIGNyZWF0ZWQgZm9yIHRoZSBwdXNoZWQgY2hhbmdlcyBvbiB0aGVcbiAgICogY29uZmlndXJlZCBwcm9qZWN0IHRoYXQgdGFyZ2V0cyB0aGUgc3BlY2lmaWVkIHRhcmdldCBicmFuY2guXG4gICAqIEByZXR1cm5zIEFuIG9iamVjdCBkZXNjcmliaW5nIHRoZSBjcmVhdGVkIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgdGFyZ2V0QnJhbmNoOiBzdHJpbmcsIHByb3Bvc2VkRm9ya0JyYW5jaE5hbWU6IHN0cmluZywgdGl0bGU6IHN0cmluZyxcbiAgICAgIGJvZHk/OiBzdHJpbmcpOiBQcm9taXNlPFB1bGxSZXF1ZXN0PiB7XG4gICAgY29uc3QgcmVwb1NsdWcgPSBgJHt0aGlzLmdpdC5yZW1vdGVQYXJhbXMub3duZXJ9LyR7dGhpcy5naXQucmVtb3RlUGFyYW1zLnJlcG99YDtcbiAgICBjb25zdCB7Zm9yaywgYnJhbmNoTmFtZX0gPSBhd2FpdCB0aGlzLl9wdXNoSGVhZFRvRm9yayhwcm9wb3NlZEZvcmtCcmFuY2hOYW1lLCB0cnVlKTtcbiAgICBjb25zdCB7ZGF0YX0gPSBhd2FpdCB0aGlzLmdpdC5naXRodWIucHVsbHMuY3JlYXRlKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIGhlYWQ6IGAke2Zvcmsub3duZXJ9OiR7YnJhbmNoTmFtZX1gLFxuICAgICAgYmFzZTogdGFyZ2V0QnJhbmNoLFxuICAgICAgYm9keSxcbiAgICAgIHRpdGxlLFxuICAgIH0pO1xuXG4gICAgLy8gQWRkIGxhYmVscyB0byB0aGUgbmV3bHkgY3JlYXRlZCBQUiBpZiBwcm92aWRlZCBpbiB0aGUgY29uZmlndXJhdGlvbi5cbiAgICBpZiAodGhpcy5jb25maWcucmVsZWFzZVByTGFiZWxzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5pc3N1ZXMuYWRkTGFiZWxzKHtcbiAgICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgICBpc3N1ZV9udW1iZXI6IGRhdGEubnVtYmVyLFxuICAgICAgICBsYWJlbHM6IHRoaXMuY29uZmlnLnJlbGVhc2VQckxhYmVscyxcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgQ3JlYXRlZCBwdWxsIHJlcXVlc3QgIyR7ZGF0YS5udW1iZXJ9IGluICR7cmVwb1NsdWd9LmApKTtcbiAgICByZXR1cm4ge1xuICAgICAgaWQ6IGRhdGEubnVtYmVyLFxuICAgICAgdXJsOiBkYXRhLmh0bWxfdXJsLFxuICAgICAgZm9yayxcbiAgICAgIGZvcmtCcmFuY2g6IGJyYW5jaE5hbWUsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXYWl0cyBmb3IgdGhlIGdpdmVuIHB1bGwgcmVxdWVzdCB0byBiZSBtZXJnZWQuIERlZmF1bHQgaW50ZXJ2YWwgZm9yIGNoZWNraW5nIHRoZSBHaXRodWJcbiAgICogQVBJIGlzIDEwIHNlY29uZHMgKHRvIG5vdCBleGNlZWQgYW55IHJhdGUgbGltaXRzKS4gSWYgdGhlIHB1bGwgcmVxdWVzdCBpcyBjbG9zZWQgd2l0aG91dFxuICAgKiBtZXJnZSwgdGhlIHNjcmlwdCB3aWxsIGFib3J0IGdyYWNlZnVsbHkgKGNvbnNpZGVyaW5nIGEgbWFudWFsIHVzZXIgYWJvcnQpLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHdhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQ6IG51bWJlciwgaW50ZXJ2YWwgPSB3YWl0Rm9yUHVsbFJlcXVlc3RJbnRlcnZhbCk6XG4gICAgICBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZGVidWcoYFdhaXRpbmcgZm9yIHB1bGwgcmVxdWVzdCAjJHtpZH0gdG8gYmUgbWVyZ2VkLmApO1xuXG4gICAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgV2FpdGluZyBmb3IgcHVsbCByZXF1ZXN0ICMke2lkfSB0byBiZSBtZXJnZWQuYCk7XG4gICAgICBjb25zdCBpbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBwclN0YXRlID0gYXdhaXQgZ2V0UHVsbFJlcXVlc3RTdGF0ZSh0aGlzLmdpdCwgaWQpO1xuICAgICAgICBpZiAocHJTdGF0ZSA9PT0gJ21lcmdlZCcpIHtcbiAgICAgICAgICBzcGlubmVyLnN0b3AoKTtcbiAgICAgICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gbWVyZ2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChwclN0YXRlID09PSAnY2xvc2VkJykge1xuICAgICAgICAgIHNwaW5uZXIuc3RvcCgpO1xuICAgICAgICAgIHdhcm4oeWVsbG93KGAgIOKcmCAgIFB1bGwgcmVxdWVzdCAjJHtpZH0gaGFzIGJlZW4gY2xvc2VkLmApKTtcbiAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgICAgIHJlamVjdChuZXcgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IoKSk7XG4gICAgICAgIH1cbiAgICAgIH0sIGludGVydmFsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwZW5kIHJlbGVhc2VzIG5vdGVzIGZvciBhIHZlcnNpb24gcHVibGlzaGVkIGluIGEgZ2l2ZW4gYnJhbmNoIHRvIHRoZSBjaGFuZ2Vsb2cgaW5cbiAgICogdGhlIGN1cnJlbnQgR2l0IGBIRUFEYC4gVGhpcyBpcyB1c2VmdWwgZm9yIGNoZXJyeS1waWNraW5nIHRoZSBjaGFuZ2Vsb2cuXG4gICAqIEByZXR1cm5zIEEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHJlbGVhc2Ugbm90ZXMgaGF2ZSBiZWVuIHByZXBlbmRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBwcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzOiBSZWxlYXNlTm90ZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBsb2NhbENoYW5nZWxvZ1BhdGggPSBqb2luKHRoaXMucHJvamVjdERpciwgY2hhbmdlbG9nUGF0aCk7XG4gICAgY29uc3QgbG9jYWxDaGFuZ2Vsb2cgPSBhd2FpdCBmcy5yZWFkRmlsZShsb2NhbENoYW5nZWxvZ1BhdGgsICd1dGY4Jyk7XG4gICAgY29uc3QgcmVsZWFzZU5vdGVzRW50cnkgPSBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0Q2hhbmdlbG9nRW50cnkoKTtcbiAgICBhd2FpdCBmcy53cml0ZUZpbGUobG9jYWxDaGFuZ2Vsb2dQYXRoLCBgJHtyZWxlYXNlTm90ZXNFbnRyeX1cXG5cXG4ke2xvY2FsQ2hhbmdlbG9nfWApO1xuICAgIGluZm8oZ3JlZW4oYCAg4pyTICAgVXBkYXRlZCB0aGUgY2hhbmdlbG9nIHRvIGNhcHR1cmUgY2hhbmdlcyBmb3IgXCIke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufVwiLmApKTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgb3V0IGFuIHVwc3RyZWFtIGJyYW5jaCB3aXRoIGEgZGV0YWNoZWQgaGVhZC4gKi9cbiAgcHJvdGVjdGVkIGFzeW5jIGNoZWNrb3V0VXBzdHJlYW1CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5naXQucnVuKFsnZmV0Y2gnLCAnLXEnLCB0aGlzLmdpdC5nZXRSZXBvR2l0VXJsKCksIGJyYW5jaE5hbWVdKTtcbiAgICB0aGlzLmdpdC5ydW4oWydjaGVja291dCcsICdGRVRDSF9IRUFEJywgJy0tZGV0YWNoJ10pO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgZmlsZXMgd2l0aCB0aGUgZ2l2ZW4gbWVzc2FnZS5cbiAgICogQHBhcmFtIG1lc3NhZ2UgTWVzc2FnZSBmb3IgdGhlIGNyZWF0ZWQgY29tbWl0XG4gICAqIEBwYXJhbSBmaWxlcyBMaXN0IG9mIHByb2plY3QtcmVsYXRpdmUgZmlsZSBwYXRocyB0byBiZSBjb21taXRlZC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjcmVhdGVDb21taXQobWVzc2FnZTogc3RyaW5nLCBmaWxlczogc3RyaW5nW10pIHtcbiAgICB0aGlzLmdpdC5ydW4oWydjb21taXQnLCAnLS1uby12ZXJpZnknLCAnLW0nLCBtZXNzYWdlLCAuLi5maWxlc10pO1xuICB9XG5cblxuICAvKipcbiAgICogU3RhZ2VzIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IGJyYW5jaCBhbmQgY3JlYXRlcyBhXG4gICAqIHB1bGwgcmVxdWVzdCB0aGF0IHRhcmdldHMgdGhlIGdpdmVuIGJhc2UgYnJhbmNoLlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgc3RhZ2VWZXJzaW9uRm9yQnJhbmNoQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICBuZXdWZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwdWxsUmVxdWVzdEJhc2VCcmFuY2g6IHN0cmluZyk6XG4gICAgICBQcm9taXNlPHtyZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVsbFJlcXVlc3Q6IFB1bGxSZXF1ZXN0fT4ge1xuICAgIGNvbnN0IHJlbGVhc2VOb3RlcyA9XG4gICAgICAgIGF3YWl0IFJlbGVhc2VOb3Rlcy5mcm9tUmFuZ2UobmV3VmVyc2lvbiwgdGhpcy5naXQuZ2V0TGF0ZXN0U2VtdmVyVGFnKCkuZm9ybWF0KCksICdIRUFEJyk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVQcm9qZWN0VmVyc2lvbihuZXdWZXJzaW9uKTtcbiAgICBhd2FpdCB0aGlzLnByZXBlbmRSZWxlYXNlTm90ZXNUb0NoYW5nZWxvZyhyZWxlYXNlTm90ZXMpO1xuICAgIGF3YWl0IHRoaXMud2FpdEZvckVkaXRzQW5kQ3JlYXRlUmVsZWFzZUNvbW1pdChuZXdWZXJzaW9uKTtcblxuICAgIGNvbnN0IHB1bGxSZXF1ZXN0ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBwdWxsUmVxdWVzdEJhc2VCcmFuY2gsIGByZWxlYXNlLXN0YWdlLSR7bmV3VmVyc2lvbn1gLFxuICAgICAgICBgQnVtcCB2ZXJzaW9uIHRvIFwidiR7bmV3VmVyc2lvbn1cIiB3aXRoIGNoYW5nZWxvZy5gKTtcblxuICAgIGluZm8oZ3JlZW4oJyAg4pyTICAgUmVsZWFzZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3B1bGxSZXF1ZXN0LnVybH0uYCkpO1xuXG4gICAgcmV0dXJuIHtyZWxlYXNlTm90ZXMsIHB1bGxSZXF1ZXN0fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgb3V0IHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGJyYW5jaCwgdmVyaWZpZXMgaXRzIENJIHN0YXR1cyBhbmQgc3RhZ2VzXG4gICAqIHRoZSBzcGVjaWZpZWQgbmV3IHZlcnNpb24gaW4gb3JkZXIgdG8gY3JlYXRlIGEgcHVsbCByZXF1ZXN0LlxuICAgKiBAcmV0dXJucyBhbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgY3JlYXRlZCBwdWxsIHJlcXVlc3QuXG4gICAqL1xuICBwcm90ZWN0ZWQgYXN5bmMgY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTpcbiAgICAgIFByb21pc2U8e3JlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCBwdWxsUmVxdWVzdDogUHVsbFJlcXVlc3R9PiB7XG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKHN0YWdpbmdCcmFuY2gpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChzdGFnaW5nQnJhbmNoKTtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zdGFnZVZlcnNpb25Gb3JCcmFuY2hBbmRDcmVhdGVQdWxsUmVxdWVzdChuZXdWZXJzaW9uLCBzdGFnaW5nQnJhbmNoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVycnktcGlja3MgdGhlIHJlbGVhc2Ugbm90ZXMgb2YgYSB2ZXJzaW9uIHRoYXQgaGF2ZSBiZWVuIHB1c2hlZCB0byBhIGdpdmVuIGJyYW5jaFxuICAgKiBpbnRvIHRoZSBgbmV4dGAgcHJpbWFyeSBkZXZlbG9wbWVudCBicmFuY2guIEEgcHVsbCByZXF1ZXN0IGlzIGNyZWF0ZWQgZm9yIHRoaXMuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3NmdWwgY3JlYXRpb24gb2YgdGhlIGNoZXJyeS1waWNrIHB1bGwgcmVxdWVzdC5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBjaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2goXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3Rlcywgc3RhZ2luZ0JyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgbmV4dEJyYW5jaCA9IHRoaXMuYWN0aXZlLm5leHQuYnJhbmNoTmFtZTtcbiAgICBjb25zdCBjb21taXRNZXNzYWdlID0gZ2V0UmVsZWFzZU5vdGVDaGVycnlQaWNrQ29tbWl0TWVzc2FnZShyZWxlYXNlTm90ZXMudmVyc2lvbik7XG5cbiAgICAvLyBDaGVja291dCB0aGUgbmV4dCBicmFuY2guXG4gICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKG5leHRCcmFuY2gpO1xuXG4gICAgYXdhaXQgdGhpcy5wcmVwZW5kUmVsZWFzZU5vdGVzVG9DaGFuZ2Vsb2cocmVsZWFzZU5vdGVzKTtcblxuICAgIC8vIENyZWF0ZSBhIGNoYW5nZWxvZyBjaGVycnktcGljayBjb21taXQuXG4gICAgYXdhaXQgdGhpcy5jcmVhdGVDb21taXQoY29tbWl0TWVzc2FnZSwgW2NoYW5nZWxvZ1BhdGhdKTtcbiAgICBpbmZvKGdyZWVuKGAgIOKckyAgIENyZWF0ZWQgY2hhbmdlbG9nIGNoZXJyeS1waWNrIGNvbW1pdCBmb3I6IFwiJHtyZWxlYXNlTm90ZXMudmVyc2lvbn1cIi5gKSk7XG5cbiAgICAvLyBDcmVhdGUgYSBjaGVycnktcGljayBwdWxsIHJlcXVlc3QgdGhhdCBzaG91bGQgYmUgbWVyZ2VkIGJ5IHRoZSBjYXJldGFrZXIuXG4gICAgY29uc3Qge3VybCwgaWR9ID0gYXdhaXQgdGhpcy5wdXNoQ2hhbmdlc1RvRm9ya0FuZENyZWF0ZVB1bGxSZXF1ZXN0KFxuICAgICAgICBuZXh0QnJhbmNoLCBgY2hhbmdlbG9nLWNoZXJyeS1waWNrLSR7cmVsZWFzZU5vdGVzLnZlcnNpb259YCwgY29tbWl0TWVzc2FnZSxcbiAgICAgICAgYENoZXJyeS1waWNrcyB0aGUgY2hhbmdlbG9nIGZyb20gdGhlIFwiJHtzdGFnaW5nQnJhbmNofVwiIGJyYW5jaCB0byB0aGUgbmV4dCBgICtcbiAgICAgICAgICAgIGBicmFuY2ggKCR7bmV4dEJyYW5jaH0pLmApO1xuXG4gICAgaW5mbyhncmVlbihcbiAgICAgICAgYCAg4pyTICAgUHVsbCByZXF1ZXN0IGZvciBjaGVycnktcGlja2luZyB0aGUgY2hhbmdlbG9nIGludG8gXCIke25leHRCcmFuY2h9XCIgYCArXG4gICAgICAgICdoYXMgYmVlbiBjcmVhdGVkLicpKTtcbiAgICBpbmZvKHllbGxvdyhgICAgICAgUGxlYXNlIGFzayB0ZWFtIG1lbWJlcnMgdG8gcmV2aWV3OiAke3VybH0uYCkpO1xuXG4gICAgLy8gV2FpdCBmb3IgdGhlIFB1bGwgUmVxdWVzdCB0byBiZSBtZXJnZWQuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBHaXRodWIgcmVsZWFzZSBmb3IgdGhlIHNwZWNpZmllZCB2ZXJzaW9uIGluIHRoZSBjb25maWd1cmVkIHByb2plY3QuXG4gICAqIFRoZSByZWxlYXNlIGlzIGNyZWF0ZWQgYnkgdGFnZ2luZyB0aGUgc3BlY2lmaWVkIGNvbW1pdCBTSEEuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgIHJlbGVhc2VOb3RlczogUmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYTogc3RyaW5nLCBwcmVyZWxlYXNlOiBib29sZWFuKSB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHJlbGVhc2VOb3Rlcy52ZXJzaW9uLmZvcm1hdCgpO1xuICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5naXQuY3JlYXRlUmVmKHtcbiAgICAgIC4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcyxcbiAgICAgIHJlZjogYHJlZnMvdGFncy8ke3RhZ05hbWV9YCxcbiAgICAgIHNoYTogdmVyc2lvbkJ1bXBDb21taXRTaGEsXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBUYWdnZWQgdiR7cmVsZWFzZU5vdGVzLnZlcnNpb259IHJlbGVhc2UgdXBzdHJlYW0uYCkpO1xuXG4gICAgYXdhaXQgdGhpcy5naXQuZ2l0aHViLnJlcG9zLmNyZWF0ZVJlbGVhc2Uoe1xuICAgICAgLi4udGhpcy5naXQucmVtb3RlUGFyYW1zLFxuICAgICAgbmFtZTogYHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufWAsXG4gICAgICB0YWdfbmFtZTogdGFnTmFtZSxcbiAgICAgIHByZXJlbGVhc2UsXG4gICAgICBib2R5OiBhd2FpdCByZWxlYXNlTm90ZXMuZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCksXG4gICAgfSk7XG4gICAgaW5mbyhncmVlbihgICDinJMgICBDcmVhdGVkIHYke3JlbGVhc2VOb3Rlcy52ZXJzaW9ufSByZWxlYXNlIGluIEdpdGh1Yi5gKSk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCBwdWJsaXNoZXMgdGhlIGdpdmVuIHZlcnNpb24gaW4gdGhlIHNwZWNpZmllZCBicmFuY2guXG4gICAqIEBwYXJhbSByZWxlYXNlTm90ZXMgVGhlIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2ZXJzaW9uIGJlaW5nIHB1Ymxpc2hlZC5cbiAgICogQHBhcmFtIHB1Ymxpc2hCcmFuY2ggTmFtZSBvZiB0aGUgYnJhbmNoIHRoYXQgY29udGFpbnMgdGhlIG5ldyB2ZXJzaW9uLlxuICAgKiBAcGFyYW0gbnBtRGlzdFRhZyBOUE0gZGlzdCB0YWcgd2hlcmUgdGhlIHZlcnNpb24gc2hvdWxkIGJlIHB1Ymxpc2hlZCB0by5cbiAgICovXG4gIHByb3RlY3RlZCBhc3luYyBidWlsZEFuZFB1Ymxpc2goXG4gICAgICByZWxlYXNlTm90ZXM6IFJlbGVhc2VOb3RlcywgcHVibGlzaEJyYW5jaDogc3RyaW5nLCBucG1EaXN0VGFnOiBOcG1EaXN0VGFnKSB7XG4gICAgY29uc3QgdmVyc2lvbkJ1bXBDb21taXRTaGEgPSBhd2FpdCB0aGlzLl9nZXRDb21taXRPZkJyYW5jaChwdWJsaXNoQnJhbmNoKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5faXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyhyZWxlYXNlTm90ZXMudmVyc2lvbiwgdmVyc2lvbkJ1bXBDb21taXRTaGEpKSB7XG4gICAgICBlcnJvcihyZWQoYCAg4pyYICAgTGF0ZXN0IGNvbW1pdCBpbiBcIiR7cHVibGlzaEJyYW5jaH1cIiBicmFuY2ggaXMgbm90IGEgc3RhZ2luZyBjb21taXQuYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBQbGVhc2UgbWFrZSBzdXJlIHRoZSBzdGFnaW5nIHB1bGwgcmVxdWVzdCBoYXMgYmVlbiBtZXJnZWQuJykpO1xuICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2tvdXQgdGhlIHB1Ymxpc2ggYnJhbmNoIGFuZCBidWlsZCB0aGUgcmVsZWFzZSBwYWNrYWdlcy5cbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHVibGlzaEJyYW5jaCk7XG5cbiAgICAvLyBJbnN0YWxsIHRoZSBwcm9qZWN0IGRlcGVuZGVuY2llcyBmb3IgdGhlIHB1Ymxpc2ggYnJhbmNoLCBhbmQgdGhlbiBidWlsZCB0aGUgcmVsZWFzZVxuICAgIC8vIHBhY2thZ2VzLiBOb3RlIHRoYXQgd2UgZG8gbm90IGRpcmVjdGx5IGNhbGwgdGhlIGJ1aWxkIHBhY2thZ2VzIGZ1bmN0aW9uIGZyb20gdGhlIHJlbGVhc2VcbiAgICAvLyBjb25maWcuIFdlIG9ubHkgd2FudCB0byBidWlsZCBhbmQgcHVibGlzaCBwYWNrYWdlcyB0aGF0IGhhdmUgYmVlbiBjb25maWd1cmVkIGluIHRoZSBnaXZlblxuICAgIC8vIHB1Ymxpc2ggYnJhbmNoLiBlLmcuIGNvbnNpZGVyIHdlIHB1Ymxpc2ggcGF0Y2ggdmVyc2lvbiBhbmQgYSBuZXcgcGFja2FnZSBoYXMgYmVlblxuICAgIC8vIGNyZWF0ZWQgaW4gdGhlIGBuZXh0YCBicmFuY2guIFRoZSBuZXcgcGFja2FnZSB3b3VsZCBub3QgYmUgcGFydCBvZiB0aGUgcGF0Y2ggYnJhbmNoLFxuICAgIC8vIHNvIHdlIGNhbm5vdCBidWlsZCBhbmQgcHVibGlzaCBpdC5cbiAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICBjb25zdCBidWlsdFBhY2thZ2VzID0gYXdhaXQgaW52b2tlUmVsZWFzZUJ1aWxkQ29tbWFuZCgpO1xuXG4gICAgLy8gVmVyaWZ5IHRoZSBwYWNrYWdlcyBidWlsdCBhcmUgdGhlIGNvcnJlY3QgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl92ZXJpZnlQYWNrYWdlVmVyc2lvbnMocmVsZWFzZU5vdGVzLnZlcnNpb24sIGJ1aWx0UGFja2FnZXMpO1xuXG4gICAgLy8gQ3JlYXRlIGEgR2l0aHViIHJlbGVhc2UgZm9yIHRoZSBuZXcgdmVyc2lvbi5cbiAgICBhd2FpdCB0aGlzLl9jcmVhdGVHaXRodWJSZWxlYXNlRm9yVmVyc2lvbihcbiAgICAgICAgcmVsZWFzZU5vdGVzLCB2ZXJzaW9uQnVtcENvbW1pdFNoYSwgbnBtRGlzdFRhZyA9PT0gJ25leHQnKTtcblxuICAgIC8vIFdhbGsgdGhyb3VnaCBhbGwgYnVpbHQgcGFja2FnZXMgYW5kIHB1Ymxpc2ggdGhlbSB0byBOUE0uXG4gICAgZm9yIChjb25zdCBidWlsdFBhY2thZ2Ugb2YgYnVpbHRQYWNrYWdlcykge1xuICAgICAgYXdhaXQgdGhpcy5fcHVibGlzaEJ1aWx0UGFja2FnZVRvTnBtKGJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZyk7XG4gICAgfVxuXG4gICAgaW5mbyhncmVlbignICDinJMgICBQdWJsaXNoZWQgYWxsIHBhY2thZ2VzIHN1Y2Nlc3NmdWxseScpKTtcbiAgfVxuXG4gIC8qKiBQdWJsaXNoZXMgdGhlIGdpdmVuIGJ1aWx0IHBhY2thZ2UgdG8gTlBNIHdpdGggdGhlIHNwZWNpZmllZCBOUE0gZGlzdCB0YWcuICovXG4gIHByaXZhdGUgYXN5bmMgX3B1Ymxpc2hCdWlsdFBhY2thZ2VUb05wbShwa2c6IEJ1aWx0UGFja2FnZSwgbnBtRGlzdFRhZzogTnBtRGlzdFRhZykge1xuICAgIGRlYnVnKGBTdGFydGluZyBwdWJsaXNoIG9mIFwiJHtwa2cubmFtZX1cIi5gKTtcbiAgICBjb25zdCBzcGlubmVyID0gb3JhLmNhbGwodW5kZWZpbmVkKS5zdGFydChgUHVibGlzaGluZyBcIiR7cGtnLm5hbWV9XCJgKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5OcG1QdWJsaXNoKHBrZy5vdXRwdXRQYXRoLCBucG1EaXN0VGFnLCB0aGlzLmNvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBpbmZvKGdyZWVuKGAgIOKckyAgIFN1Y2Nlc3NmdWxseSBwdWJsaXNoZWQgXCIke3BrZy5uYW1lfS5gKSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgc3Bpbm5lci5zdG9wKCk7XG4gICAgICBlcnJvcihlKTtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSBwdWJsaXNoaW5nIFwiJHtwa2cubmFtZX1cIi5gKSk7XG4gICAgICB0aHJvdyBuZXcgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQ2hlY2tzIHdoZXRoZXIgdGhlIGdpdmVuIGNvbW1pdCByZXByZXNlbnRzIGEgc3RhZ2luZyBjb21taXQgZm9yIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfaXNDb21taXRGb3JWZXJzaW9uU3RhZ2luZyh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb21taXRTaGE6IHN0cmluZykge1xuICAgIGNvbnN0IHtkYXRhfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuZ2l0LmdpdGh1Yi5yZXBvcy5nZXRDb21taXQoey4uLnRoaXMuZ2l0LnJlbW90ZVBhcmFtcywgcmVmOiBjb21taXRTaGF9KTtcbiAgICByZXR1cm4gZGF0YS5jb21taXQubWVzc2FnZS5zdGFydHNXaXRoKGdldENvbW1pdE1lc3NhZ2VGb3JSZWxlYXNlKHZlcnNpb24pKTtcbiAgfVxuXG4gIC8qKiBWZXJpZnkgdGhlIHZlcnNpb24gb2YgZWFjaCBnZW5lcmF0ZWQgcGFja2FnZSBleGFjdCBtYXRjaGVzIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UGFja2FnZVZlcnNpb25zKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHBhY2thZ2VzOiBCdWlsdFBhY2thZ2VbXSkge1xuICAgIGZvciAoY29uc3QgcGtnIG9mIHBhY2thZ2VzKSB7XG4gICAgICBjb25zdCB7dmVyc2lvbjogcGFja2FnZUpzb25WZXJzaW9ufSA9XG4gICAgICAgICAgSlNPTi5wYXJzZShhd2FpdCBmcy5yZWFkRmlsZShqb2luKHBrZy5vdXRwdXRQYXRoLCAncGFja2FnZS5qc29uJyksICd1dGY4JykpIGFzXG4gICAgICAgICAge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgICAgIGlmICh2ZXJzaW9uLmNvbXBhcmUocGFja2FnZUpzb25WZXJzaW9uKSAhPT0gMCkge1xuICAgICAgICBlcnJvcihyZWQoJ1RoZSBidWlsdCBwYWNrYWdlIHZlcnNpb24gZG9lcyBub3QgbWF0Y2ggdGhlIHZlcnNpb24gYmVpbmcgcmVsZWFzZWQuJykpO1xuICAgICAgICBlcnJvcihgICBSZWxlYXNlIFZlcnNpb246ICAgJHt2ZXJzaW9uLnZlcnNpb259YCk7XG4gICAgICAgIGVycm9yKGAgIEdlbmVyYXRlZCBWZXJzaW9uOiAke3BhY2thZ2VKc29uVmVyc2lvbn1gKTtcbiAgICAgICAgdGhyb3cgbmV3IEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=