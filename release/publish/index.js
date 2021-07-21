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
        define("@angular/dev-infra-private/release/publish", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/child-process", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/authenticated-git-client", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/versioning/print-active-trains", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/actions/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseTool = exports.CompletionState = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
    var child_process_1 = require("@angular/dev-infra-private/utils/child-process");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var authenticated_git_client_1 = require("@angular/dev-infra-private/utils/git/authenticated-git-client");
    var active_release_trains_1 = require("@angular/dev-infra-private/release/versioning/active-release-trains");
    var npm_publish_1 = require("@angular/dev-infra-private/release/versioning/npm-publish");
    var print_active_trains_1 = require("@angular/dev-infra-private/release/versioning/print-active-trains");
    var actions_error_1 = require("@angular/dev-infra-private/release/publish/actions-error");
    var index_1 = require("@angular/dev-infra-private/release/publish/actions/index");
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
            /** The singleton instance of the authenticated git client. */
            this._git = authenticated_git_client_1.AuthenticatedGitClient.get();
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
                            actions_1 = tslib_1.__values(index_1.actions), actions_1_1 = actions_1.next();
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
                            return [4 /*yield*/, child_process_1.spawn('env', ['python', '--version'], { mode: 'silent' })];
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
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var registry, shouldLogin, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            registry = "NPM at the " + ((_a = this._config.publishRegistry) !== null && _a !== void 0 ? _a : 'default NPM') + " registry";
                            return [4 /*yield*/, npm_publish_1.npmIsLoggedIn(this._config.publishRegistry)];
                        case 1:
                            if (_c.sent()) {
                                console_1.debug("Already logged into " + registry + ".");
                                return [2 /*return*/, true];
                            }
                            console_1.error(console_1.red("  \u2718   Not currently logged into " + registry + "."));
                            return [4 /*yield*/, console_1.promptConfirm('Would you like to log into NPM now?')];
                        case 2:
                            shouldLogin = _c.sent();
                            if (!shouldLogin) return [3 /*break*/, 7];
                            console_1.debug('Starting NPM login.');
                            _c.label = 3;
                        case 3:
                            _c.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, npm_publish_1.npmLogin(this._config.publishRegistry)];
                        case 4:
                            _c.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            _b = _c.sent();
                            return [2 /*return*/, false];
                        case 6: return [2 /*return*/, true];
                        case 7: return [2 /*return*/, false];
                    }
                });
            });
        };
        return ReleaseTool;
    }());
    exports.ReleaseTool = ReleaseTool;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFFbkQsZ0ZBQWdEO0lBRWhELG9FQUF3RjtJQUN4RiwwR0FBZ0Y7SUFFaEYsNkdBQWtIO0lBQ2xILHlGQUE2RTtJQUM3RSx5R0FBMkU7SUFJM0UsMEZBQXVGO0lBQ3ZGLGtGQUF3QztJQUV4QyxJQUFZLGVBSVg7SUFKRCxXQUFZLGVBQWU7UUFDekIsMkRBQU8sQ0FBQTtRQUNQLG1FQUFXLENBQUE7UUFDWCw2RUFBZ0IsQ0FBQTtJQUNsQixDQUFDLEVBSlcsZUFBZSxHQUFmLHVCQUFlLEtBQWYsdUJBQWUsUUFJMUI7SUFFRDtRQU1FLHFCQUNjLE9BQXNCLEVBQVksT0FBcUIsRUFDdkQsWUFBb0I7WUFEcEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFQbEMsOERBQThEO1lBQ3RELFNBQUksR0FBRyxpREFBc0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUM1Qyw2RUFBNkU7WUFDckUsZ0NBQTJCLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1FBSXhDLENBQUM7UUFFdEMseUNBQXlDO1FBQ25DLHlCQUFHLEdBQVQ7Ozs7Ozs0QkFDRSxhQUFHLEVBQUUsQ0FBQzs0QkFDTixhQUFHLENBQUMsZ0JBQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7NEJBQzVELGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQzs0QkFDMUQsYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDOzRCQUM1RCxhQUFHLEVBQUUsQ0FBQzs0QkFF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Y2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xpc3RDaG9pY2VPcHRpb25zLCBwcm9tcHR9IGZyb20gJ2lucXVpcmVyJztcblxuaW1wb3J0IHtzcGF3bn0gZnJvbSAnLi4vLi4vdXRpbHMvY2hpbGQtcHJvY2Vzcyc7XG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7QXV0aGVudGljYXRlZEdpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2F1dGhlbnRpY2F0ZWQtZ2l0LWNsaWVudCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7bnBtSXNMb2dnZWRJbiwgbnBtTG9naW4sIG5wbUxvZ291dH0gZnJvbSAnLi4vdmVyc2lvbmluZy9ucG0tcHVibGlzaCc7XG5pbXBvcnQge3ByaW50QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vdmVyc2lvbmluZy9wcmludC1hY3RpdmUtdHJhaW5zJztcbmltcG9ydCB7R2l0aHViUmVwb1dpdGhBcGl9IGZyb20gJy4uL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcyc7XG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9hY3Rpb25zJztcbmltcG9ydCB7RmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IsIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yfSBmcm9tICcuL2FjdGlvbnMtZXJyb3InO1xuaW1wb3J0IHthY3Rpb25zfSBmcm9tICcuL2FjdGlvbnMvaW5kZXgnO1xuXG5leHBvcnQgZW51bSBDb21wbGV0aW9uU3RhdGUge1xuICBTVUNDRVNTLFxuICBGQVRBTF9FUlJPUixcbiAgTUFOVUFMTFlfQUJPUlRFRCxcbn1cblxuZXhwb3J0IGNsYXNzIFJlbGVhc2VUb29sIHtcbiAgLyoqIFRoZSBzaW5nbGV0b24gaW5zdGFuY2Ugb2YgdGhlIGF1dGhlbnRpY2F0ZWQgZ2l0IGNsaWVudC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gQXV0aGVudGljYXRlZEdpdENsaWVudC5nZXQoKTtcbiAgLyoqIFRoZSBwcmV2aW91cyBnaXQgY29tbWl0IHRvIHJldHVybiBiYWNrIHRvIGFmdGVyIHRoZSByZWxlYXNlIHRvb2wgcnVucy4gKi9cbiAgcHJpdmF0ZSBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgICAgcHJvdGVjdGVkIF9wcm9qZWN0Um9vdDogc3RyaW5nKSB7fVxuXG4gIC8qKiBSdW5zIHRoZSBpbnRlcmFjdGl2ZSByZWxlYXNlIHRvb2wuICovXG4gIGFzeW5jIHJ1bigpOiBQcm9taXNlPENvbXBsZXRpb25TdGF0ZT4ge1xuICAgIGxvZygpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZyh5ZWxsb3coJyAgQW5ndWxhciBEZXYtSW5mcmEgcmVsZWFzZSBzdGFnaW5nIHNjcmlwdCcpKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coKTtcblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5RW52aXJvbm1lbnRIYXNQeXRob24zU3ltbGluaygpIHx8XG4gICAgICAgICFhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpIHx8ICFhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgcmVwbzogR2l0aHViUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1Yn07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBhd2FpdCB0aGlzLmNsZWFudXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLlNVQ0NFU1M7XG4gIH1cblxuICAvKiogUnVuIHBvc3QgcmVsZWFzZSB0b29sIGNsZWFudXBzLiAqL1xuICBwcml2YXRlIGFzeW5jIGNsZWFudXAoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gUmV0dXJuIGJhY2sgdG8gdGhlIGdpdCBzdGF0ZSBmcm9tIGJlZm9yZSB0aGUgcmVsZWFzZSB0b29sIHJhbi5cbiAgICB0aGlzLl9naXQuY2hlY2tvdXQodGhpcy5wcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIC8vIEVuc3VyZSBsb2cgb3V0IG9mIE5QTS5cbiAgICBhd2FpdCBucG1Mb2dvdXQodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gIH1cblxuICAvKiogUHJvbXB0cyB0aGUgY2FyZXRha2VyIGZvciBhIHJlbGVhc2UgYWN0aW9uIHRoYXQgc2hvdWxkIGJlIHBlcmZvcm1lZC4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihhY3RpdmVUcmFpbnM6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICBjb25zdCBjaG9pY2VzOiBMaXN0Q2hvaWNlT3B0aW9uc1tdID0gW107XG5cbiAgICAvLyBGaW5kIGFuZCBpbnN0YW50aWF0ZSBhbGwgcmVsZWFzZSBhY3Rpb25zIHdoaWNoIGFyZSBjdXJyZW50bHkgdmFsaWQuXG4gICAgZm9yIChsZXQgYWN0aW9uVHlwZSBvZiBhY3Rpb25zKSB7XG4gICAgICBpZiAoYXdhaXQgYWN0aW9uVHlwZS5pc0FjdGl2ZShhY3RpdmVUcmFpbnMsIHRoaXMuX2NvbmZpZykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCBQeXRob24gY2FuIGJlIHJlc29sdmVkIHdpdGhpbiBzY3JpcHRzIGFuZCBwb2ludHMgdG8gYSBjb21wYXRpYmxlIHZlcnNpb24uIFB5dGhvblxuICAgKiBpcyByZXF1aXJlZCBpbiBCYXplbCBhY3Rpb25zIGFzIHRoZXJlIGNhbiBiZSB0b29scyAoc3VjaCBhcyBgc2t5ZG9jYCkgdGhhdCByZWx5IG9uIGl0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlFbnZpcm9ubWVudEhhc1B5dGhvbjNTeW1saW5rKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHRyeSB7XG4gICAgICAvLyBOb3RlOiBXZSBkbyBub3QgcmVseSBvbiBgL3Vzci9iaW4vZW52YCBidXQgcmF0aGVyIGFjY2VzcyB0aGUgYGVudmAgYmluYXJ5IGRpcmVjdGx5IGFzIGl0XG4gICAgICAvLyBzaG91bGQgYmUgcGFydCBvZiB0aGUgc2hlbGwncyBgJFBBVEhgLiBUaGlzIGlzIG5lY2Vzc2FyeSBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIFdpbmRvd3MuXG4gICAgICBjb25zdCBweVZlcnNpb24gPSBhd2FpdCBzcGF3bignZW52JywgWydweXRob24nLCAnLS12ZXJzaW9uJ10sIHttb2RlOiAnc2lsZW50J30pO1xuICAgICAgY29uc3QgdmVyc2lvbiA9IHB5VmVyc2lvbi5zdGRvdXQudHJpbSgpIHx8IHB5VmVyc2lvbi5zdGRlcnIudHJpbSgpO1xuICAgICAgaWYgKHZlcnNpb24uc3RhcnRzV2l0aCgnUHl0aG9uIDMuJykpIHtcbiAgICAgICAgZGVidWcoYExvY2FsIHB5dGhvbiB2ZXJzaW9uOiAke3ZlcnNpb259YCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgZXJyb3IocmVkKGAgIOKcmCAgIFxcYC91c3IvYmluL3B5dGhvblxcYCBpcyBjdXJyZW50bHkgc3ltbGlua2VkIHRvIFwiJHt2ZXJzaW9ufVwiLCBwbGVhc2UgdXBkYXRlYCkpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICB0aGUgc3ltbGluayB0byBsaW5rIGluc3RlYWQgdG8gUHl0aG9uMycpKTtcbiAgICAgIGVycm9yKCk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgIEdvb2dsZXJzOiBwbGVhc2UgcnVuIHRoZSBmb2xsb3dpbmcgY29tbWFuZCB0byBzeW1saW5rIHB5dGhvbiB0byBweXRob24zOicpKTtcbiAgICAgIGVycm9yKHJlZCgnICAgICAgICBzdWRvIGxuIC1zIC91c3IvYmluL3B5dGhvbjMgL3Vzci9iaW4vcHl0aG9uJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gY2F0Y2gge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIGAvdXNyL2Jpbi9weXRob25gIGRvZXMgbm90IGV4aXN0LCBwbGVhc2UgZW5zdXJlIGAvdXNyL2Jpbi9weXRob25gIGlzJykpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBzeW1saW5rZWQgdG8gUHl0aG9uMy4nKSk7XG4gICAgICBlcnJvcigpO1xuICAgICAgZXJyb3IocmVkKCcgICAgICBHb29nbGVyczogcGxlYXNlIHJ1biB0aGUgZm9sbG93aW5nIGNvbW1hbmQgdG8gc3ltbGluayBweXRob24gdG8gcHl0aG9uMzonKSk7XG4gICAgICBlcnJvcihyZWQoJyAgICAgICAgc3VkbyBsbiAtcyAvdXNyL2Jpbi9weXRob24zIC91c3IvYmluL3B5dGhvbicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIG5leHQgYnJhbmNoIGZyb20gdGhlIGNvbmZpZ3VyZWQgcmVwb3NpdG9yeSBpcyBjaGVja2VkIG91dC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5UnVubmluZ0Zyb21OZXh0QnJhbmNoKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IGhlYWRTaGEgPSB0aGlzLl9naXQucnVuKFsncmV2LXBhcnNlJywgJ0hFQUQnXSkuc3Rkb3V0LnRyaW0oKTtcbiAgICBjb25zdCB7ZGF0YX0gPVxuICAgICAgICBhd2FpdCB0aGlzLl9naXQuZ2l0aHViLnJlcG9zLmdldEJyYW5jaCh7Li4udGhpcy5fZ2l0LnJlbW90ZVBhcmFtcywgYnJhbmNoOiBuZXh0QnJhbmNoTmFtZX0pO1xuXG4gICAgaWYgKGhlYWRTaGEgIT09IGRhdGEuY29tbWl0LnNoYSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFJ1bm5pbmcgcmVsZWFzZSB0b29sIGZyb20gYW4gb3V0ZGF0ZWQgbG9jYWwgYnJhbmNoLicpKTtcbiAgICAgIGVycm9yKHJlZChgICAgICAgUGxlYXNlIG1ha2Ugc3VyZSB5b3UgYXJlIHJ1bm5pbmcgZnJvbSB0aGUgXCIke25leHRCcmFuY2hOYW1lfVwiIGJyYW5jaC5gKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLyoqXG4gICAqIFZlcmlmaWVzIHRoYXQgdGhlIHVzZXIgaXMgbG9nZ2VkIGludG8gTlBNIGF0IHRoZSBjb3JyZWN0IHJlZ2lzdHJ5LCBpZiBkZWZpbmVkIGZvciB0aGUgcmVsZWFzZS5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0uXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOcG1Mb2dpblN0YXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IHJlZ2lzdHJ5ID0gYE5QTSBhdCB0aGUgJHt0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5ID8/ICdkZWZhdWx0IE5QTSd9IHJlZ2lzdHJ5YDtcbiAgICBpZiAoYXdhaXQgbnBtSXNMb2dnZWRJbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KSkge1xuICAgICAgZGVidWcoYEFscmVhZHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCk7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgZXJyb3IocmVkKGAgIOKcmCAgIE5vdCBjdXJyZW50bHkgbG9nZ2VkIGludG8gJHtyZWdpc3RyeX0uYCkpO1xuICAgIGNvbnN0IHNob3VsZExvZ2luID0gYXdhaXQgcHJvbXB0Q29uZmlybSgnV291bGQgeW91IGxpa2UgdG8gbG9nIGludG8gTlBNIG5vdz8nKTtcbiAgICBpZiAoc2hvdWxkTG9naW4pIHtcbiAgICAgIGRlYnVnKCdTdGFydGluZyBOUE0gbG9naW4uJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG4iXX0=