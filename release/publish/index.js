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
        define("@angular/dev-infra-private/release/publish", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/versioning/print-active-trains", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/actions/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseTool = exports.CompletionState = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var active_release_trains_1 = require("@angular/dev-infra-private/release/versioning/active-release-trains");
    var npm_publish_1 = require("@angular/dev-infra-private/release/versioning/npm-publish");
    var print_active_trains_1 = require("@angular/dev-infra-private/release/versioning/print-active-trains");
    var actions_error_1 = require("@angular/dev-infra-private/release/publish/actions-error");
    var index_2 = require("@angular/dev-infra-private/release/publish/actions/index");
    var CompletionState;
    (function (CompletionState) {
        CompletionState[CompletionState["SUCCESS"] = 0] = "SUCCESS";
        CompletionState[CompletionState["FATAL_ERROR"] = 1] = "FATAL_ERROR";
        CompletionState[CompletionState["MANUALLY_ABORTED"] = 2] = "MANUALLY_ABORTED";
    })(CompletionState = exports.CompletionState || (exports.CompletionState = {}));
    var ReleaseTool = /** @class */ (function () {
        function ReleaseTool(_config, _github, _projectRoot) {
            this._config = _config;
            this._github = _github;
            this._projectRoot = _projectRoot;
            /** The singleton instance of the GitClient. */
            this._git = index_1.GitClient.getAuthenticatedInstance();
            /** The previous git commit to return back to after the release tool runs. */
            this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
        }
        /** Runs the interactive release tool. */
        ReleaseTool.prototype.run = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, owner, name, repo, releaseTrains, action, e_1;
                return tslib_1.__generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            console_1.log();
                            console_1.log(console_1.yellow('--------------------------------------------'));
                            console_1.log(console_1.yellow('  Angular Dev-Infra release staging script'));
                            console_1.log(console_1.yellow('--------------------------------------------'));
                            console_1.log();
                            return [4 /*yield*/, this._verifyEnvironmentHasPython3Symlink()];
                        case 1:
                            _b = !(_d.sent());
                            if (_b) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._verifyNoUncommittedChanges()];
                        case 2:
                            _b = !(_d.sent());
                            _d.label = 3;
                        case 3:
                            _a = _b;
                            if (_a) return [3 /*break*/, 5];
                            return [4 /*yield*/, this._verifyRunningFromNextBranch()];
                        case 4:
                            _a = !(_d.sent());
                            _d.label = 5;
                        case 5:
                            if (_a) {
                                return [2 /*return*/, CompletionState.FATAL_ERROR];
                            }
                            return [4 /*yield*/, this._verifyNpmLoginState()];
                        case 6:
                            if (!(_d.sent())) {
                                return [2 /*return*/, CompletionState.MANUALLY_ABORTED];
                            }
                            _c = this._github, owner = _c.owner, name = _c.name;
                            repo = { owner: owner, name: name, api: this._git.github };
                            return [4 /*yield*/, active_release_trains_1.fetchActiveReleaseTrains(repo)];
                        case 7:
                            releaseTrains = _d.sent();
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            return [4 /*yield*/, print_active_trains_1.printActiveReleaseTrains(releaseTrains, this._config)];
                        case 8:
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            _d.sent();
                            return [4 /*yield*/, this._promptForReleaseAction(releaseTrains)];
                        case 9:
                            action = _d.sent();
                            _d.label = 10;
                        case 10:
                            _d.trys.push([10, 12, 13, 15]);
                            return [4 /*yield*/, action.perform()];
                        case 11:
                            _d.sent();
                            return [3 /*break*/, 15];
                        case 12:
                            e_1 = _d.sent();
                            if (e_1 instanceof actions_error_1.UserAbortedReleaseActionError) {
                                return [2 /*return*/, CompletionState.MANUALLY_ABORTED];
                            }
                            // Only print the error message and stack if the error is not a known fatal release
                            // action error (for which we print the error gracefully to the console with colors).
                            if (!(e_1 instanceof actions_error_1.FatalReleaseActionError) && e_1 instanceof Error) {
                                console.error(e_1);
                            }
                            return [2 /*return*/, CompletionState.FATAL_ERROR];
                        case 13: return [4 /*yield*/, this.cleanup()];
                        case 14:
                            _d.sent();
                            return [7 /*endfinally*/];
                        case 15: return [2 /*return*/, CompletionState.SUCCESS];
                    }
                });
            });
        };
        /** Run post release tool cleanups. */
        ReleaseTool.prototype.cleanup = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Return back to the git state from before the release tool ran.
                            this._git.checkout(this.previousGitBranchOrRevision, true);
                            // Ensure log out of NPM.
                            return [4 /*yield*/, npm_publish_1.npmLogout(this._config.publishRegistry)];
                        case 1:
                            // Ensure log out of NPM.
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Prompts the caretaker for a release action that should be performed. */
        ReleaseTool.prototype._promptForReleaseAction = function (activeTrains) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var choices, actions_1, actions_1_1, actionType, action, _a, _b, e_2_1, releaseAction;
                var e_2, _c, _d;
                return tslib_1.__generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            choices = [];
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 7, 8, 9]);
                            actions_1 = tslib_1.__values(index_2.actions), actions_1_1 = actions_1.next();
                            _e.label = 2;
                        case 2:
                            if (!!actions_1_1.done) return [3 /*break*/, 6];
                            actionType = actions_1_1.value;
                            return [4 /*yield*/, actionType.isActive(activeTrains, this._config)];
                        case 3:
                            if (!_e.sent()) return [3 /*break*/, 5];
                            action = new actionType(activeTrains, this._git, this._config, this._projectRoot);
                            _b = (_a = choices).push;
                            _d = {};
                            return [4 /*yield*/, action.getDescription()];
                        case 4:
                            _b.apply(_a, [(_d.name = _e.sent(), _d.value = action, _d)]);
                            _e.label = 5;
                        case 5:
                            actions_1_1 = actions_1.next();
                            return [3 /*break*/, 2];
                        case 6: return [3 /*break*/, 9];
                        case 7:
                            e_2_1 = _e.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 9];
                        case 8:
                            try {
                                if (actions_1_1 && !actions_1_1.done && (_c = actions_1.return)) _c.call(actions_1);
                            }
                            finally { if (e_2) throw e_2.error; }
                            return [7 /*endfinally*/];
                        case 9:
                            console_1.info('Please select the type of release you want to perform.');
                            return [4 /*yield*/, inquirer_1.prompt({
                                    name: 'releaseAction',
                                    message: 'Please select an action:',
                                    type: 'list',
                                    choices: choices,
                                })];
                        case 10:
                            releaseAction = (_e.sent()).releaseAction;
                            return [2 /*return*/, releaseAction];
                    }
                });
            });
        };
        /**
         * Verifies that there are no uncommitted changes in the project.
         * @returns a boolean indicating success or failure.
         */
        ReleaseTool.prototype._verifyNoUncommittedChanges = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    if (this._git.hasUncommittedChanges()) {
                        console_1.error(console_1.red('  ✘   There are changes which are not committed and should be discarded.'));
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                });
            });
        };
        /**
         * Verifies that Python can be resolved within scripts and points to a compatible version. Python
         * is required in Bazel actions as there can be tools (such as `skydoc`) that rely on it.
         * @returns a boolean indicating success or failure.
         */
        ReleaseTool.prototype._verifyEnvironmentHasPython3Symlink = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var pyVersion, version, _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, child_process_1.spawnWithDebugOutput('env', ['python', '--version'], { mode: 'silent' })];
                        case 1:
                            pyVersion = _b.sent();
                            version = pyVersion.stdout.trim() || pyVersion.stderr.trim();
                            if (version.startsWith('Python 3.')) {
                                console_1.debug("Local python version: " + version);
                                return [2 /*return*/, true];
                            }
                            console_1.error(console_1.red("  \u2718   `/usr/bin/python` is currently symlinked to \"" + version + "\", please update"));
                            console_1.error(console_1.red('      the symlink to link instead to Python3'));
                            console_1.error();
                            console_1.error(console_1.red('      Googlers: please run the following command to symlink python to python3:'));
                            console_1.error(console_1.red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
                            return [2 /*return*/, false];
                        case 2:
                            _a = _b.sent();
                            console_1.error(console_1.red('  ✘   `/usr/bin/python` does not exist, please ensure `/usr/bin/python` is'));
                            console_1.error(console_1.red('      symlinked to Python3.'));
                            console_1.error();
                            console_1.error(console_1.red('      Googlers: please run the following command to symlink python to python3:'));
                            console_1.error(console_1.red('        sudo ln -s /usr/bin/python3 /usr/bin/python'));
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/, false];
                    }
                });
            });
        };
        /**
         * Verifies that the next branch from the configured repository is checked out.
         * @returns a boolean indicating success or failure.
         */
        ReleaseTool.prototype._verifyRunningFromNextBranch = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var headSha, data;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            headSha = this._git.run(['rev-parse', 'HEAD']).stdout.trim();
                            return [4 /*yield*/, this._git.github.repos.getBranch(tslib_1.__assign(tslib_1.__assign({}, this._git.remoteParams), { branch: active_release_trains_1.nextBranchName }))];
                        case 1:
                            data = (_a.sent()).data;
                            if (headSha !== data.commit.sha) {
                                console_1.error(console_1.red('  ✘   Running release tool from an outdated local branch.'));
                                console_1.error(console_1.red("      Please make sure you are running from the \"" + active_release_trains_1.nextBranchName + "\" branch."));
                                return [2 /*return*/, false];
                            }
                            return [2 /*return*/, true];
                    }
                });
            });
        };
        /**
         * Verifies that the user is logged into NPM at the correct registry, if defined for the release.
         * @returns a boolean indicating whether the user is logged into NPM.
         */
        ReleaseTool.prototype._verifyNpmLoginState = function () {
            var _a, _b;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var registry, _c, shouldLogin, _d;
                return tslib_1.__generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            registry = "NPM at the " + ((_a = this._config.publishRegistry) !== null && _a !== void 0 ? _a : 'default NPM') + " registry";
                            if (!((_b = this._config.publishRegistry) === null || _b === void 0 ? void 0 : _b.includes('wombat-dressing-room.appspot.com'))) return [3 /*break*/, 5];
                            console_1.info('Unable to determine NPM login state for wombat proxy, requiring login now.');
                            _e.label = 1;
                        case 1:
                            _e.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, npm_publish_1.npmLogin(this._config.publishRegistry)];
                        case 2:
                            _e.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            _c = _e.sent();
                            return [2 /*return*/, false];
                        case 4: return [2 /*return*/, true];
                        case 5: return [4 /*yield*/, npm_publish_1.npmIsLoggedIn(this._config.publishRegistry)];
                        case 6:
                            if (_e.sent()) {
                                console_1.debug("Already logged into " + registry + ".");
                                return [2 /*return*/, true];
                            }
                            console_1.error(console_1.red("  \u2718   Not currently logged into " + registry + "."));
                            return [4 /*yield*/, console_1.promptConfirm('Would you like to log into NPM now?')];
                        case 7:
                            shouldLogin = _e.sent();
                            if (!shouldLogin) return [3 /*break*/, 12];
                            console_1.debug('Starting NPM login.');
                            _e.label = 8;
                        case 8:
                            _e.trys.push([8, 10, , 11]);
                            return [4 /*yield*/, npm_publish_1.npmLogin(this._config.publishRegistry)];
                        case 9:
                            _e.sent();
                            return [3 /*break*/, 11];
                        case 10:
                            _d = _e.sent();
                            return [2 /*return*/, false];
                        case 11: return [2 /*return*/, true];
                        case 12: return [2 /*return*/, false];
                    }
                });
            });
        };
        return ReleaseTool;
    }());
    exports.ReleaseTool = ReleaseTool;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFFbkQsZ0ZBQStEO0lBRS9ELG9FQUF3RjtJQUN4RixvRUFBZ0Q7SUFFaEQsNkdBQWtIO0lBQ2xILHlGQUE2RTtJQUM3RSx5R0FBMkU7SUFJM0UsMEZBQXVGO0lBQ3ZGLGtGQUF3QztJQUV4QyxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDekIsMkRBQU8sQ0FBQTtRQUNQLG1FQUFXLENBQUE7UUFDWCw2RUFBZ0IsQ0FBQTtJQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7SUFFRDtRQU1FLHFCQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7WUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFQbEMsK0NBQStDO1lBQ3ZDLFNBQUksR0FBRyxpQkFBUyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDcEQsNkVBQTZFO1lBQ3JFLGdDQUEyQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUl4QyxDQUFDO1FBRXRDLHlDQUF5QztRQUNuQyx5QkFBRyxHQUFUOzs7Ozs7NEJBQ0UsYUFBRyxFQUFFLENBQUM7NEJBQ04sYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDOzRCQUM1RCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7NEJBQzFELGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQzs0QkFDNUQsYUFBRyxFQUFFLENBQUM7NEJB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QkFBcUIsQ0FBQyxDQUFDOzs7OzRCQUUzQixxQkFBTSxzQkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUE7OzRCQUE1QyxTQUE0QyxDQUFDOzs7OzRCQUU3QyxzQkFBTyxLQUFLLEVBQUM7aUNBRWYsc0JBQU8sSUFBSSxFQUFDO2lDQUVkLHNCQUFPLEtBQUssRUFBQzs7OztTQUNkO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBeExELElBd0xDO0lBeExZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge3NwYXduV2l0aERlYnVnT3V0cHV0fSBmcm9tICcuLi8uLi91dGlscy9jaGlsZC1wcm9jZXNzJztcbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtkZWJ1ZywgZXJyb3IsIGluZm8sIGxvZywgcHJvbXB0Q29uZmlybSwgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7R2l0aHViUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gR2l0Q2xpZW50LmdldEF1dGhlbnRpY2F0ZWRJbnN0YW5jZSgpO1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIF9jb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgICBwcm90ZWN0ZWQgX3Byb2plY3RSb290OiBzdHJpbmcpIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCkgfHxcbiAgICAgICAgIWF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkgfHwgIWF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5TnBtTG9naW5TdGF0ZSgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSA9IHtvd25lciwgbmFtZSwgYXBpOiB0aGlzLl9naXQuZ2l0aHVifTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gICAgLy8gUHJpbnQgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBzbyB0aGF0IHRoZSBjYXJldGFrZXIgY2FuIGFjY2Vzc1xuICAgIC8vIHRoZSBjdXJyZW50IHByb2plY3QgYnJhbmNoaW5nIHN0YXRlIHdpdGhvdXQgc3dpdGNoaW5nIGNvbnRleHQuXG4gICAgYXdhaXQgcHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zKHJlbGVhc2VUcmFpbnMsIHRoaXMuX2NvbmZpZyk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBhd2FpdCB0aGlzLl9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKHJlbGVhc2VUcmFpbnMpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFjdGlvbi5wZXJmb3JtKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcikge1xuICAgICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgICB9XG4gICAgICAvLyBPbmx5IHByaW50IHRoZSBlcnJvciBtZXNzYWdlIGFuZCBzdGFjayBpZiB0aGUgZXJyb3IgaXMgbm90IGEga25vd24gZmF0YWwgcmVsZWFzZVxuICAgICAgLy8gYWN0aW9uIGVycm9yIChmb3Igd2hpY2ggd2UgcHJpbnQgdGhlIGVycm9yIGdyYWNlZnVsbHkgdG8gdGhlIGNvbnNvbGUgd2l0aCBjb2xvcnMpLlxuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKSAmJiBlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRoaXMuY2xlYW51cCgpO1xuICAgIH1cblxuICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKiBSdW4gcG9zdCByZWxlYXNlIHRvb2wgY2xlYW51cHMuICovXG4gIHByaXZhdGUgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSZXR1cm4gYmFjayB0byB0aGUgZ2l0IHN0YXRlIGZyb20gYmVmb3JlIHRoZSByZWxlYXNlIHRvb2wgcmFuLlxuICAgIHRoaXMuX2dpdC5jaGVja291dCh0aGlzLnByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgLy8gRW5zdXJlIGxvZyBvdXQgb2YgTlBNLlxuICAgIGF3YWl0IG5wbUxvZ291dCh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSBjYXJldGFrZXIgZm9yIGEgcmVsZWFzZSBhY3Rpb24gdGhhdCBzaG91bGQgYmUgcGVyZm9ybWVkLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKGFjdGl2ZVRyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIGNvbnN0IGNob2ljZXM6IExpc3RDaG9pY2VPcHRpb25zW10gPSBbXTtcblxuICAgIC8vIEZpbmQgYW5kIGluc3RhbnRpYXRlIGFsbCByZWxlYXNlIGFjdGlvbnMgd2hpY2ggYXJlIGN1cnJlbnRseSB2YWxpZC5cbiAgICBmb3IgKGxldCBhY3Rpb25UeXBlIG9mIGFjdGlvbnMpIHtcbiAgICAgIGlmIChhd2FpdCBhY3Rpb25UeXBlLmlzQWN0aXZlKGFjdGl2ZVRyYWlucywgdGhpcy5fY29uZmlnKSkge1xuICAgICAgICBjb25zdCBhY3Rpb246IFJlbGVhc2VBY3Rpb24gPVxuICAgICAgICAgICAgbmV3IGFjdGlvblR5cGUoYWN0aXZlVHJhaW5zLCB0aGlzLl9naXQsIHRoaXMuX2NvbmZpZywgdGhpcy5fcHJvamVjdFJvb3QpO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IFB5dGhvbiBjYW4gYmUgcmVzb2x2ZWQgd2l0aGluIHNjcmlwdHMgYW5kIHBvaW50cyB0byBhIGNvbXBhdGlibGUgdmVyc2lvbi4gUHl0aG9uXG4gICAqIGlzIHJlcXVpcmVkIGluIEJhemVsIGFjdGlvbnMgYXMgdGhlcmUgY2FuIGJlIHRvb2xzIChzdWNoIGFzIGBza3lkb2NgKSB0aGF0IHJlbHkgb24gaXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeUVudmlyb25tZW50SGFzUHl0aG9uM1N5bWxpbmsoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIE5vdGU6IFdlIGRvIG5vdCByZWx5IG9uIGAvdXNyL2Jpbi9lbnZgIGJ1dCByYXRoZXIgYWNjZXNzIHRoZSBgZW52YCBiaW5hcnkgZGlyZWN0bHkgYXMgaXRcbiAgICAgIC8vIHNob3VsZCBiZSBwYXJ0IG9mIHRoZSBzaGVsbCdzIGAkUEFUSGAuIFRoaXMgaXMgbmVjZXNzYXJ5IGZvciBjb21wYXRpYmlsaXR5IHdpdGggV2luZG93cy5cbiAgICAgIGNvbnN0IHB5VmVyc2lvbiA9XG4gICAgICAgICAgYXdhaXQgc3Bhd25XaXRoRGVidWdPdXRwdXQoJ2VudicsIFsncHl0aG9uJywgJy0tdmVyc2lvbiddLCB7bW9kZTogJ3NpbGVudCd9KTtcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBweVZlcnNpb24uc3Rkb3V0LnRyaW0oKSB8fCBweVZlcnNpb24uc3RkZXJyLnRyaW0oKTtcbiAgICAgIGlmICh2ZXJzaW9uLnN0YXJ0c1dpdGgoJ1B5dGhvbiAzLicpKSB7XG4gICAgICAgIGRlYnVnKGBMb2NhbCBweXRob24gdmVyc2lvbjogJHt2ZXJzaW9ufWApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGVycm9yKHJlZChgICDinJggICBcXGAvdXNyL2Jpbi9weXRob25cXGAgaXMgY3VycmVudGx5IHN5bWxpbmtlZCB0byBcIiR7dmVyc2lvbn1cIiwgcGxlYXNlIHVwZGF0ZWApKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgdGhlIHN5bWxpbmsgdG8gbGluayBpbnN0ZWFkIHRvIFB5dGhvbjMnKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBgL3Vzci9iaW4vcHl0aG9uYCBkb2VzIG5vdCBleGlzdCwgcGxlYXNlIGVuc3VyZSBgL3Vzci9iaW4vcHl0aG9uYCBpcycpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgc3ltbGlua2VkIHRvIFB5dGhvbjMuJykpO1xuICAgICAgZXJyb3IoKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgR29vZ2xlcnM6IHBsZWFzZSBydW4gdGhlIGZvbGxvd2luZyBjb21tYW5kIHRvIHN5bWxpbmsgcHl0aG9uIHRvIHB5dGhvbjM6JykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICAgIHN1ZG8gbG4gLXMgL3Vzci9iaW4vcHl0aG9uMyAvdXNyL2Jpbi9weXRob24nKSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoZWFkU2hhID0gdGhpcy5fZ2l0LnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5fZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogbmV4dEJyYW5jaE5hbWV9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTSBhdCB0aGUgY29ycmVjdCByZWdpc3RyeSwgaWYgZGVmaW5lZCBmb3IgdGhlIHJlbGVhc2UuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5TnBtTG9naW5TdGF0ZSgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCByZWdpc3RyeSA9IGBOUE0gYXQgdGhlICR7dGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSA/PyAnZGVmYXVsdCBOUE0nfSByZWdpc3RyeWA7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogcmVtb3ZlIHdvbWJhdCBzcGVjaWZpYyBibG9jayBvbmNlIHdvbWJvdCBhbGxvd3MgYG5wbSB3aG9hbWlgIGNoZWNrIHRvXG4gICAgLy8gY2hlY2sgdGhlIHN0YXR1cyBvZiB0aGUgbG9jYWwgdG9rZW4gaW4gdGhlIC5ucG1yYyBmaWxlLlxuICAgIGlmICh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5Py5pbmNsdWRlcygnd29tYmF0LWRyZXNzaW5nLXJvb20uYXBwc3BvdC5jb20nKSkge1xuICAgICAgaW5mbygnVW5hYmxlIHRvIGRldGVybWluZSBOUE0gbG9naW4gc3RhdGUgZm9yIHdvbWJhdCBwcm94eSwgcmVxdWlyaW5nIGxvZ2luIG5vdy4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=