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
        define("@angular/dev-infra-private/release/publish", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/npm-publish", "@angular/dev-infra-private/release/versioning/print-active-trains", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/actions/index"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseTool = exports.CompletionState = void 0;
    var tslib_1 = require("tslib");
    var inquirer_1 = require("inquirer");
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
        function ReleaseTool(_config, _github, _githubToken, _projectRoot) {
            this._config = _config;
            this._github = _github;
            this._githubToken = _githubToken;
            this._projectRoot = _projectRoot;
            /** Client for interacting with the Github API and the local Git command. */
            this._git = new index_1.GitClient(this._githubToken, { github: this._github }, this._projectRoot);
            /** The previous git commit to return back to after the release tool runs. */
            this.previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
        }
        /** Runs the interactive release tool. */
        ReleaseTool.prototype.run = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b, owner, name, repo, releaseTrains, action, e_1;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            console_1.log();
                            console_1.log(console_1.yellow('--------------------------------------------'));
                            console_1.log(console_1.yellow('  Angular Dev-Infra release staging script'));
                            console_1.log(console_1.yellow('--------------------------------------------'));
                            console_1.log();
                            return [4 /*yield*/, this._verifyNoUncommittedChanges()];
                        case 1:
                            _a = !(_c.sent());
                            if (_a) return [3 /*break*/, 3];
                            return [4 /*yield*/, this._verifyRunningFromNextBranch()];
                        case 2:
                            _a = !(_c.sent());
                            _c.label = 3;
                        case 3:
                            if (_a) {
                                return [2 /*return*/, CompletionState.FATAL_ERROR];
                            }
                            return [4 /*yield*/, this._verifyNpmLoginState()];
                        case 4:
                            if (!(_c.sent())) {
                                return [2 /*return*/, CompletionState.MANUALLY_ABORTED];
                            }
                            _b = this._github, owner = _b.owner, name = _b.name;
                            repo = { owner: owner, name: name, api: this._git.github };
                            return [4 /*yield*/, active_release_trains_1.fetchActiveReleaseTrains(repo)];
                        case 5:
                            releaseTrains = _c.sent();
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            return [4 /*yield*/, print_active_trains_1.printActiveReleaseTrains(releaseTrains, this._config)];
                        case 6:
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            _c.sent();
                            return [4 /*yield*/, this._promptForReleaseAction(releaseTrains)];
                        case 7:
                            action = _c.sent();
                            _c.label = 8;
                        case 8:
                            _c.trys.push([8, 10, 11, 13]);
                            return [4 /*yield*/, action.perform()];
                        case 9:
                            _c.sent();
                            return [3 /*break*/, 13];
                        case 10:
                            e_1 = _c.sent();
                            if (e_1 instanceof actions_error_1.UserAbortedReleaseActionError) {
                                return [2 /*return*/, CompletionState.MANUALLY_ABORTED];
                            }
                            // Only print the error message and stack if the error is not a known fatal release
                            // action error (for which we print the error gracefully to the console with colors).
                            if (!(e_1 instanceof actions_error_1.FatalReleaseActionError) && e_1 instanceof Error) {
                                console.error(e_1);
                            }
                            return [2 /*return*/, CompletionState.FATAL_ERROR];
                        case 11: return [4 /*yield*/, this.cleanup()];
                        case 12:
                            _c.sent();
                            return [7 /*endfinally*/];
                        case 13: return [2 /*return*/, CompletionState.SUCCESS];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFHbkQsb0VBQXdGO0lBQ3hGLG9FQUFnRDtJQUVoRCw2R0FBa0g7SUFDbEgseUZBQTZFO0lBQzdFLHlHQUEyRTtJQUkzRSwwRkFBdUY7SUFDdkYsa0ZBQXdDO0lBRXhDLElBQVksZUFJWDtJQUpELFdBQVksZUFBZTtRQUN6QiwyREFBTyxDQUFBO1FBQ1AsbUVBQVcsQ0FBQTtRQUNYLDZFQUFnQixDQUFBO0lBQ2xCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtJQUVEO1FBTUUscUJBQ2MsT0FBc0IsRUFBWSxPQUFxQixFQUN2RCxZQUFvQixFQUFZLFlBQW9CO1lBRHBELFlBQU8sR0FBUCxPQUFPLENBQWU7WUFBWSxZQUFPLEdBQVAsT0FBTyxDQUFjO1lBQ3ZELGlCQUFZLEdBQVosWUFBWSxDQUFRO1lBQVksaUJBQVksR0FBWixZQUFZLENBQVE7WUFQbEUsNEVBQTRFO1lBQ3BFLFNBQUksR0FBRyxJQUFJLGlCQUFTLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzNGLDZFQUE2RTtZQUNyRSxnQ0FBMkIsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFJUixDQUFDO1FBRXRFLHlDQUF5QztRQUNuQyx5QkFBRyxHQUFUOzs7Ozs7NEJBQ0UsYUFBRyxFQUFFLENBQUM7NEJBQ04sYUFBRyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDOzRCQUM1RCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw0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QkFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUE7OzRCQUE1QyxTQUE0QyxDQUFDOzs7OzRCQUU3QyxzQkFBTyxLQUFLLEVBQUM7aUNBRWYsc0JBQU8sSUFBSSxFQUFDO2lDQUVkLHNCQUFPLEtBQUssRUFBQzs7OztTQUNkO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBdkpELElBdUpDO0lBdkpZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZGVidWcsIGVycm9yLCBpbmZvLCBsb2csIHByb21wdENvbmZpcm0sIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zLCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMsIG5leHRCcmFuY2hOYW1lfSBmcm9tICcuLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge25wbUlzTG9nZ2VkSW4sIG5wbUxvZ2luLCBucG1Mb2dvdXR9IGZyb20gJy4uL3ZlcnNpb25pbmcvbnBtLXB1Ymxpc2gnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge0dpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tYnJhbmNoZXMnO1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7YWN0aW9uc30gZnJvbSAnLi9hY3Rpb25zL2luZGV4JztcblxuZXhwb3J0IGVudW0gQ29tcGxldGlvblN0YXRlIHtcbiAgU1VDQ0VTUyxcbiAgRkFUQUxfRVJST1IsXG4gIE1BTlVBTExZX0FCT1JURUQsXG59XG5cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVG9vbCB7XG4gIC8qKiBDbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUEkgYW5kIHRoZSBsb2NhbCBHaXQgY29tbWFuZC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gbmV3IEdpdENsaWVudCh0aGlzLl9naXRodWJUb2tlbiwge2dpdGh1YjogdGhpcy5fZ2l0aHVifSwgdGhpcy5fcHJvamVjdFJvb3QpO1xuICAvKiogVGhlIHByZXZpb3VzIGdpdCBjb21taXQgdG8gcmV0dXJuIGJhY2sgdG8gYWZ0ZXIgdGhlIHJlbGVhc2UgdG9vbCBydW5zLiAqL1xuICBwcml2YXRlIHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiA9IHRoaXMuX2dpdC5nZXRDdXJyZW50QnJhbmNoT3JSZXZpc2lvbigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIF9jb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgICBwcm90ZWN0ZWQgX2dpdGh1YlRva2VuOiBzdHJpbmcsIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZykge31cblxuICAvKiogUnVucyB0aGUgaW50ZXJhY3RpdmUgcmVsZWFzZSB0b29sLiAqL1xuICBhc3luYyBydW4oKTogUHJvbWlzZTxDb21wbGV0aW9uU3RhdGU+IHtcbiAgICBsb2coKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coeWVsbG93KCcgIEFuZ3VsYXIgRGV2LUluZnJhIHJlbGVhc2Ugc3RhZ2luZyBzY3JpcHQnKSk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkgfHwgIWF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGlmICghYXdhaXQgdGhpcy5fdmVyaWZ5TnBtTG9naW5TdGF0ZSgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgfVxuXG4gICAgY29uc3Qge293bmVyLCBuYW1lfSA9IHRoaXMuX2dpdGh1YjtcbiAgICBjb25zdCByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSA9IHtvd25lciwgbmFtZSwgYXBpOiB0aGlzLl9naXQuZ2l0aHVifTtcbiAgICBjb25zdCByZWxlYXNlVHJhaW5zID0gYXdhaXQgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zKHJlcG8pO1xuXG4gICAgLy8gUHJpbnQgdGhlIGFjdGl2ZSByZWxlYXNlIHRyYWlucyBzbyB0aGF0IHRoZSBjYXJldGFrZXIgY2FuIGFjY2Vzc1xuICAgIC8vIHRoZSBjdXJyZW50IHByb2plY3QgYnJhbmNoaW5nIHN0YXRlIHdpdGhvdXQgc3dpdGNoaW5nIGNvbnRleHQuXG4gICAgYXdhaXQgcHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zKHJlbGVhc2VUcmFpbnMsIHRoaXMuX2NvbmZpZyk7XG5cbiAgICBjb25zdCBhY3Rpb24gPSBhd2FpdCB0aGlzLl9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKHJlbGVhc2VUcmFpbnMpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGFjdGlvbi5wZXJmb3JtKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcikge1xuICAgICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLk1BTlVBTExZX0FCT1JURUQ7XG4gICAgICB9XG4gICAgICAvLyBPbmx5IHByaW50IHRoZSBlcnJvciBtZXNzYWdlIGFuZCBzdGFjayBpZiB0aGUgZXJyb3IgaXMgbm90IGEga25vd24gZmF0YWwgcmVsZWFzZVxuICAgICAgLy8gYWN0aW9uIGVycm9yIChmb3Igd2hpY2ggd2UgcHJpbnQgdGhlIGVycm9yIGdyYWNlZnVsbHkgdG8gdGhlIGNvbnNvbGUgd2l0aCBjb2xvcnMpLlxuICAgICAgaWYgKCEoZSBpbnN0YW5jZW9mIEZhdGFsUmVsZWFzZUFjdGlvbkVycm9yKSAmJiBlIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGF3YWl0IHRoaXMuY2xlYW51cCgpO1xuICAgIH1cblxuICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKiBSdW4gcG9zdCByZWxlYXNlIHRvb2wgY2xlYW51cHMuICovXG4gIHByaXZhdGUgYXN5bmMgY2xlYW51cCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBSZXR1cm4gYmFjayB0byB0aGUgZ2l0IHN0YXRlIGZyb20gYmVmb3JlIHRoZSByZWxlYXNlIHRvb2wgcmFuLlxuICAgIHRoaXMuX2dpdC5jaGVja291dCh0aGlzLnByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgLy8gRW5zdXJlIGxvZyBvdXQgb2YgTlBNLlxuICAgIGF3YWl0IG5wbUxvZ291dCh0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSBjYXJldGFrZXIgZm9yIGEgcmVsZWFzZSBhY3Rpb24gdGhhdCBzaG91bGQgYmUgcGVyZm9ybWVkLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKGFjdGl2ZVRyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIGNvbnN0IGNob2ljZXM6IExpc3RDaG9pY2VPcHRpb25zW10gPSBbXTtcblxuICAgIC8vIEZpbmQgYW5kIGluc3RhbnRpYXRlIGFsbCByZWxlYXNlIGFjdGlvbnMgd2hpY2ggYXJlIGN1cnJlbnRseSB2YWxpZC5cbiAgICBmb3IgKGxldCBhY3Rpb25UeXBlIG9mIGFjdGlvbnMpIHtcbiAgICAgIGlmIChhd2FpdCBhY3Rpb25UeXBlLmlzQWN0aXZlKGFjdGl2ZVRyYWlucykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oJ1BsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLicpO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IocmVkKCcgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgZGlzY2FyZGVkLicpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgbmV4dCBicmFuY2ggZnJvbSB0aGUgY29uZmlndXJlZCByZXBvc2l0b3J5IGlzIGNoZWNrZWQgb3V0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgaGVhZFNoYSA9IHRoaXMuX2dpdC5ydW4oWydyZXYtcGFyc2UnLCAnSEVBRCddKS5zdGRvdXQudHJpbSgpO1xuICAgIGNvbnN0IHtkYXRhfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuX2dpdC5naXRodWIucmVwb3MuZ2V0QnJhbmNoKHsuLi50aGlzLl9naXQucmVtb3RlUGFyYW1zLCBicmFuY2g6IG5leHRCcmFuY2hOYW1lfSk7XG5cbiAgICBpZiAoaGVhZFNoYSAhPT0gZGF0YS5jb21taXQuc2hhKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgUnVubmluZyByZWxlYXNlIHRvb2wgZnJvbSBhbiBvdXRkYXRlZCBsb2NhbCBicmFuY2guJykpO1xuICAgICAgZXJyb3IocmVkKGAgICAgICBQbGVhc2UgbWFrZSBzdXJlIHlvdSBhcmUgcnVubmluZyBmcm9tIHRoZSBcIiR7bmV4dEJyYW5jaE5hbWV9XCIgYnJhbmNoLmApKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGUgdXNlciBpcyBsb2dnZWQgaW50byBOUE0gYXQgdGhlIGNvcnJlY3QgcmVnaXN0cnksIGlmIGRlZmluZWQgZm9yIHRoZSByZWxlYXNlLlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB1c2VyIGlzIGxvZ2dlZCBpbnRvIE5QTS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeU5wbUxvZ2luU3RhdGUoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3QgcmVnaXN0cnkgPSBgTlBNIGF0IHRoZSAke3RoaXMuX2NvbmZpZy5wdWJsaXNoUmVnaXN0cnkgPz8gJ2RlZmF1bHQgTlBNJ30gcmVnaXN0cnlgO1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IHJlbW92ZSB3b21iYXQgc3BlY2lmaWMgYmxvY2sgb25jZSB3b21ib3QgYWxsb3dzIGBucG0gd2hvYW1pYCBjaGVjayB0b1xuICAgIC8vIGNoZWNrIHRoZSBzdGF0dXMgb2YgdGhlIGxvY2FsIHRva2VuIGluIHRoZSAubnBtcmMgZmlsZS5cbiAgICBpZiAodGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeT8uaW5jbHVkZXMoJ3dvbWJhdC1kcmVzc2luZy1yb29tLmFwcHNwb3QuY29tJykpIHtcbiAgICAgIGluZm8oJ1VuYWJsZSB0byBkZXRlcm1pbmUgTlBNIGxvZ2luIHN0YXRlIGZvciB3b21iYXQgcHJveHksIHJlcXVpcmluZyBsb2dpbiBub3cuJyk7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBucG1Mb2dpbih0aGlzLl9jb25maWcucHVibGlzaFJlZ2lzdHJ5KTtcbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGF3YWl0IG5wbUlzTG9nZ2VkSW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSkpIHtcbiAgICAgIGRlYnVnKGBBbHJlYWR5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVycm9yKHJlZChgICDinJggICBOb3QgY3VycmVudGx5IGxvZ2dlZCBpbnRvICR7cmVnaXN0cnl9LmApKTtcbiAgICBjb25zdCBzaG91bGRMb2dpbiA9IGF3YWl0IHByb21wdENvbmZpcm0oJ1dvdWxkIHlvdSBsaWtlIHRvIGxvZyBpbnRvIE5QTSBub3c/Jyk7XG4gICAgaWYgKHNob3VsZExvZ2luKSB7XG4gICAgICBkZWJ1ZygnU3RhcnRpbmcgTlBNIGxvZ2luLicpO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgbnBtTG9naW4odGhpcy5fY29uZmlnLnB1Ymxpc2hSZWdpc3RyeSk7XG4gICAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuIl19