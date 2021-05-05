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
                            return [4 /*yield*/, actionType.isActive(activeTrains)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFFbkQsZ0ZBQStEO0lBRS9ELG9FQUF3RjtJQUN4RixvRUFBZ0Q7SUFFaEQsNkdBQWtIO0lBQ2xILHlGQUE2RTtJQUM3RSx5R0FBMkU7SUFJM0UsMEZBQXVGO0lBQ3ZGLGtGQUF3QztJQUV4QyxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDekIsMkRBQU8sQ0FBQTtRQUNQLG1FQUFXLENBQUE7UUFDWCw2RUFBZ0IsQ0FBQTtJQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7SUFFRDtRQU1FLHFCQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7WUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFQbEMsK0NBQStDO1lBQ3ZDLFNBQUksR0FBRyxpQkFBUyxDQUFDLHdCQUF3QixFQUFFLENBQUM7WUFDcEQsNkVBQTZFO1lBQ3JFLGdDQUEyQixHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEVBQUUsQ0FBQztRQUl4QyxDQUFDO1FBRXRDLHlDQUF5QztRQUNuQyx5QkFBRyxHQUFUOzs7Ozs7NEJBQ0UsYUFBRyxFQUFFLENBQUM7NEJBQ04sYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDOzRCQUM1RCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDLENBQUM7NEJBQzFELGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQzs0QkFDNUQsYUFBRyxFQUFFLENBQUM7NEJB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QkFFM0IscUJBQU0sc0JBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxFQUFBOzs0QkFBNUMsU0FBNEMsQ0FBQzs7Ozs0QkFFN0Msc0JBQU8sS0FBSyxFQUFDO2lDQUVmLHNCQUFPLElBQUksRUFBQztpQ0FFZCxzQkFBTyxLQUFLLEVBQUM7Ozs7U0FDZDtRQUNILGtCQUFDO0lBQUQsQ0FBQyxBQXhMRCxJQXdMQztJQXhMWSxrQ0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzcGF3bldpdGhEZWJ1Z091dHB1dH0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsIG5leHRCcmFuY2hOYW1lfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge25wbUlzTG9nZ2VkSW4sIG5wbUxvZ2luLCBucG1Mb2dvdXR9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge0dpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tYnJhbmNoZXMnO1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7YWN0aW9uc30gZnJvbSAnLi9hY3Rpb25zL2luZGV4JztcblxuZXhwb3J0IGVudW0gQ29tcGxldGlvblN0YXRlIHtcbiAgU1VDQ0VTUyxcbiAgRkFUQUxfRVJST1IsXG4gIE1BTlVBTExZX0FCT1JURUQsXG59XG5cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVG9vbCB7XG4gIC8qKiBUaGUgc2luZ2xldG9uIGluc3RhbmNlIG9mIHRoZSBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgX2dpdCA9IEdpdENsaWVudC5nZXRBdXRoZW50aWNhdGVkSW5zdGFuY2UoKTtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpIHx8XG4gICAgICAgICFhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpIHx8ICFhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgcmVwbzogR2l0aHViUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1Yn07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMpKSB7XG4gICAgICAgIGNvbnN0IGFjdGlvbjogUmVsZWFzZUFjdGlvbiA9XG4gICAgICAgICAgICBuZXcgYWN0aW9uVHlwZShhY3RpdmVUcmFpbnMsIHRoaXMuX2dpdCwgdGhpcy5fY29uZmlnLCB0aGlzLl9wcm9qZWN0Um9vdCk7XG4gICAgICAgIGNob2ljZXMucHVzaCh7bmFtZTogYXdhaXQgYWN0aW9uLmdldERlc2NyaXB0aW9uKCksIHZhbHVlOiBhY3Rpb259KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbmZvKCdQbGVhc2Ugc2VsZWN0IHRoZSB0eXBlIG9mIHJlbGVhc2UgeW91IHdhbnQgdG8gcGVyZm9ybS4nKTtcblxuICAgIGNvbnN0IHtyZWxlYXNlQWN0aW9ufSA9IGF3YWl0IHByb21wdDx7cmVsZWFzZUFjdGlvbjogUmVsZWFzZUFjdGlvbn0+KHtcbiAgICAgIG5hbWU6ICdyZWxlYXNlQWN0aW9uJyxcbiAgICAgIG1lc3NhZ2U6ICdQbGVhc2Ugc2VsZWN0IGFuIGFjdGlvbjonLFxuICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgY2hvaWNlcyxcbiAgICB9KTtcblxuICAgIHJldHVybiByZWxlYXNlQWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgYXJlIG5vIHVuY29tbWl0dGVkIGNoYW5nZXMgaW4gdGhlIHByb2plY3QuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmICh0aGlzLl9naXQuaGFzVW5jb21taXR0ZWRDaGFuZ2VzKCkpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBUaGVyZSBhcmUgY2hhbmdlcyB3aGljaCBhcmUgbm90IGNvbW1pdHRlZCBhbmQgc2hvdWxkIGJlIGRpc2NhcmRlZC4nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgUHl0aG9uIGNhbiBiZSByZXNvbHZlZCB3aXRoaW4gc2NyaXB0cyBhbmQgcG9pbnRzIHRvIGEgY29tcGF0aWJsZSB2ZXJzaW9uLiBQeXRob25cbiAgICogaXMgcmVxdWlyZWQgaW4gQmF6ZWwgYWN0aW9ucyBhcyB0aGVyZSBjYW4gYmUgdG9vbHMgKHN1Y2ggYXMgYHNreWRvY2ApIHRoYXQgcmVseSBvbiBpdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB0cnkge1xuICAgICAgLy8gTm90ZTogV2UgZG8gbm90IHJlbHkgb24gYC91c3IvYmluL2VudmAgYnV0IHJhdGhlciBhY2Nlc3MgdGhlIGBlbnZgIGJpbmFyeSBkaXJlY3RseSBhcyBpdFxuICAgICAgLy8gc2hvdWxkIGJlIHBhcnQgb2YgdGhlIHNoZWxsJ3MgYCRQQVRIYC4gVGhpcyBpcyBuZWNlc3NhcnkgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBXaW5kb3dzLlxuICAgICAgY29uc3QgcHlWZXJzaW9uID1cbiAgICAgICAgICBhd2FpdCBzcGF3bldpdGhEZWJ1Z091dHB1dCgnZW52JywgWydweXRob24nLCAnLS12ZXJzaW9uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IHB5VmVyc2lvbi5zdGRvdXQudHJpbSgpIHx8IHB5VmVyc2lvbi5zdGRlcnIudHJpbSgpO1xuICAgICAgaWYgKHZlcnNpb24uc3RhcnRzV2l0aCgnUHl0aG9uIDMuJykpIHtcbiAgICAgICAgZGVidWcoYExvY2FsIHB5dGhvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFxcYC91c3IvYmluL3B5dGhvblxcYCBpcyBjdXJyZW50bHkgc3ltbGlua2VkIHRvIFwiJHt2ZXJzaW9ufVwiLCBwbGVhc2UgdXBkYXRlYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICB0aGUgc3ltbGluayB0byBsaW5rIGluc3RlYWQgdG8gUHl0aG9uMycpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIGAvdXNyL2Jpbi9weXRob25gIGRvZXMgbm90IGV4aXN0LCBwbGVhc2UgZW5zdXJlIGAvdXNyL2Jpbi9weXRob25gIGlzJykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBzeW1saW5rZWQgdG8gUHl0aG9uMy4nKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBuZXh0QnJhbmNoTmFtZX0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiByZW1vdmUgd29tYmF0IHNwZWNpZmljIGJsb2NrIG9uY2Ugd29tYm90IGFsbG93cyBgbnBtIHdob2FtaWAgY2hlY2sgdG9cbiAgICAvLyBjaGVjayB0aGUgc3RhdHVzIG9mIHRoZSBsb2NhbCB0b2tlbiBpbiB0aGUgLm5wbXJjIGZpbGUuXG4gICAgaWYgKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnk/LmluY2x1ZGVzKCd3b21iYXQtZHJlc3Npbmctcm9vbS5hcHBzcG90LmNvbScpKSB7XG4gICAgICBpbmZvKCdVbmFibGUgdG8gZGV0ZXJtaW5lIE5QTSBsb2dpbiBzdGF0ZSBmb3Igd29tYmF0IHByb3h5LCByZXF1aXJpbmcgbG9naW4gbm93LicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGlmIChhd2FpdCBucG1Jc0xvZ2dlZEluKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpKSB7XG4gICAgICBkZWJ1ZyhgQWxyZWFkeSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlcnJvcihyZWQoYCAg4pyYICAgTm90IGN1cnJlbnRseSBsb2dnZWQgaW50byAke3JlZ2lzdHJ5fS5gKSk7XG4gICAgY29uc3Qgc2hvdWxkTG9naW4gPSBhd2FpdCBwcm9tcHRDb25maXJtKCdXb3VsZCB5b3UgbGlrZSB0byBsb2cgaW50byBOUE0gbm93PycpO1xuICAgIGlmIChzaG91bGRMb2dpbikge1xuICAgICAgZGVidWcoJ1N0YXJ0aW5nIE5QTSBsb2dpbi4nKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IG5wbUxvZ2luKHRoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cbiJdfQ==