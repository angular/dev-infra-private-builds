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
        define("@angular/dev-infra-private/release/publish", ["require", "exports", "tslib", "inquirer", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/versioning/active-release-trains", "@angular/dev-infra-private/release/versioning/print-active-trains", "@angular/dev-infra-private/release/publish/actions-error", "@angular/dev-infra-private/release/publish/actions/index"], factory);
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
        }
        /** Runs the interactive release tool. */
        ReleaseTool.prototype.run = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b, owner, name, repo, releaseTrains, action, previousGitBranchOrRevision, e_1;
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
                            _b = this._github, owner = _b.owner, name = _b.name;
                            repo = { owner: owner, name: name, api: this._git.github };
                            return [4 /*yield*/, active_release_trains_1.fetchActiveReleaseTrains(repo)];
                        case 4:
                            releaseTrains = _c.sent();
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            return [4 /*yield*/, print_active_trains_1.printActiveReleaseTrains(releaseTrains, this._config)];
                        case 5:
                            // Print the active release trains so that the caretaker can access
                            // the current project branching state without switching context.
                            _c.sent();
                            return [4 /*yield*/, this._promptForReleaseAction(releaseTrains)];
                        case 6:
                            action = _c.sent();
                            previousGitBranchOrRevision = this._git.getCurrentBranchOrRevision();
                            _c.label = 7;
                        case 7:
                            _c.trys.push([7, 9, 10, 11]);
                            return [4 /*yield*/, action.perform()];
                        case 8:
                            _c.sent();
                            return [3 /*break*/, 11];
                        case 9:
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
                        case 10:
                            this._git.checkout(previousGitBranchOrRevision, true);
                            return [7 /*endfinally*/];
                        case 11: return [2 /*return*/, CompletionState.SUCCESS];
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
        return ReleaseTool;
    }());
    exports.ReleaseTool = ReleaseTool;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFHbkQsb0VBQWtFO0lBQ2xFLG9FQUFnRDtJQUVoRCw2R0FBa0g7SUFDbEgseUdBQTJFO0lBSTNFLDBGQUF1RjtJQUN2RixrRkFBd0M7SUFFeEMsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQ3pCLDJEQUFPLENBQUE7UUFDUCxtRUFBVyxDQUFBO1FBQ1gsNkVBQWdCLENBQUE7SUFDbEIsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0lBRUQ7UUFJRSxxQkFDYyxPQUFzQixFQUFZLE9BQXFCLEVBQ3ZELFlBQW9CLEVBQVksWUFBb0I7WUFEcEQsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFBWSxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUxsRSw0RUFBNEU7WUFDcEUsU0FBSSxHQUFHLElBQUksaUJBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFJdEIsQ0FBQztRQUV0RSx5Q0FBeUM7UUFDbkMseUJBQUcsR0FBVDs7Ozs7OzRCQUNFLGFBQUcsRUFBRSxDQUFDOzRCQUNOLGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQzs0QkFDNUQsYUFBRyxDQUFDLGdCQUFNLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDOzRCQUMxRCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7NEJBQzVELGFB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S3RCLENBQUEsY0FMa0I7NEJBT3BCLHNCQUFPLGFBQWEsRUFBQzs7OztTQUN0QjtRQUVEOzs7V0FHRztRQUNXLGlEQUEyQixHQUF6Qzs7O29CQUNFLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFO3dCQUNyQyxlQUFLLENBQUMsYUFBRyxDQUFDLDBFQUEwRSxDQUFDLENBQUMsQ0FBQzt3QkFDdkYsc0JBQU8sS0FBSyxFQUFDO3FCQUNkO29CQUNELHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFFRDs7O1dBR0c7UUFDVyxrREFBNEIsR0FBMUM7Ozs7Ozs0QkFDUSxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7NEJBRS9ELHFCQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLHVDQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxLQUFFLE1BQU0sRUFBRSxzQ0FBYyxJQUFFLEVBQUE7OzRCQUR4RixJQUFJLEdBQ1AsQ0FBQSxTQUEyRixDQUFBLEtBRHBGOzRCQUdYLElBQUksT0FBTyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFO2dDQUMvQixlQUFLLENBQUMsYUFBRyxDQUFDLDJEQUEyRCxDQUFDLENBQUMsQ0FBQztnQ0FDeEUsZUFBSyxDQUFDLGFBQUcsQ0FBQyx1REFBb0Qsc0NBQWMsZUFBVyxDQUFDLENBQUMsQ0FBQztnQ0FDMUYsc0JBQU8sS0FBSyxFQUFDOzZCQUNkOzRCQUNELHNCQUFPLElBQUksRUFBQzs7OztTQUNiO1FBQ0gsa0JBQUM7SUFBRCxDQUFDLEFBdkdELElBdUdDO0lBdkdZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TGlzdENob2ljZU9wdGlvbnMsIHByb21wdH0gZnJvbSAnaW5xdWlyZXInO1xuXG5pbXBvcnQge0dpdGh1YkNvbmZpZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3IsIGluZm8sIGxvZywgcmVkLCB5ZWxsb3d9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtHaXRDbGllbnR9IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9pbmRleCc7XG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZyc7XG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnMsIGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucywgbmV4dEJyYW5jaE5hbWV9IGZyb20gJy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7cHJpbnRBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ByaW50LWFjdGl2ZS10cmFpbnMnO1xuaW1wb3J0IHtHaXRodWJSZXBvV2l0aEFwaX0gZnJvbSAnLi4vdmVyc2lvbmluZy92ZXJzaW9uLWJyYW5jaGVzJztcblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtGYXRhbFJlbGVhc2VBY3Rpb25FcnJvciwgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3J9IGZyb20gJy4vYWN0aW9ucy1lcnJvcic7XG5pbXBvcnQge2FjdGlvbnN9IGZyb20gJy4vYWN0aW9ucy9pbmRleCc7XG5cbmV4cG9ydCBlbnVtIENvbXBsZXRpb25TdGF0ZSB7XG4gIFNVQ0NFU1MsXG4gIEZBVEFMX0VSUk9SLFxuICBNQU5VQUxMWV9BQk9SVEVELFxufVxuXG5leHBvcnQgY2xhc3MgUmVsZWFzZVRvb2wge1xuICAvKiogQ2xpZW50IGZvciBpbnRlcmFjdGluZyB3aXRoIHRoZSBHaXRodWIgQVBJIGFuZCB0aGUgbG9jYWwgR2l0IGNvbW1hbmQuICovXG4gIHByaXZhdGUgX2dpdCA9IG5ldyBHaXRDbGllbnQodGhpcy5fZ2l0aHViVG9rZW4sIHtnaXRodWI6IHRoaXMuX2dpdGh1Yn0sIHRoaXMuX3Byb2plY3RSb290KTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBfY29uZmlnOiBSZWxlYXNlQ29uZmlnLCBwcm90ZWN0ZWQgX2dpdGh1YjogR2l0aHViQ29uZmlnLFxuICAgICAgcHJvdGVjdGVkIF9naXRodWJUb2tlbjogc3RyaW5nLCBwcm90ZWN0ZWQgX3Byb2plY3RSb290OiBzdHJpbmcpIHt9XG5cbiAgLyoqIFJ1bnMgdGhlIGludGVyYWN0aXZlIHJlbGVhc2UgdG9vbC4gKi9cbiAgYXN5bmMgcnVuKCk6IFByb21pc2U8Q29tcGxldGlvblN0YXRlPiB7XG4gICAgbG9nKCk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKHllbGxvdygnICBBbmd1bGFyIERldi1JbmZyYSByZWxlYXNlIHN0YWdpbmcgc2NyaXB0JykpO1xuICAgIGxvZyh5ZWxsb3coJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tJykpO1xuICAgIGxvZygpO1xuXG4gICAgaWYgKCFhd2FpdCB0aGlzLl92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpIHx8ICFhd2FpdCB0aGlzLl92ZXJpZnlSdW5uaW5nRnJvbU5leHRCcmFuY2goKSkge1xuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9XG5cbiAgICBjb25zdCB7b3duZXIsIG5hbWV9ID0gdGhpcy5fZ2l0aHViO1xuICAgIGNvbnN0IHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpID0ge293bmVyLCBuYW1lLCBhcGk6IHRoaXMuX2dpdC5naXRodWJ9O1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbnMgPSBhd2FpdCBmZXRjaEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVwbyk7XG5cbiAgICAvLyBQcmludCB0aGUgYWN0aXZlIHJlbGVhc2UgdHJhaW5zIHNvIHRoYXQgdGhlIGNhcmV0YWtlciBjYW4gYWNjZXNzXG4gICAgLy8gdGhlIGN1cnJlbnQgcHJvamVjdCBicmFuY2hpbmcgc3RhdGUgd2l0aG91dCBzd2l0Y2hpbmcgY29udGV4dC5cbiAgICBhd2FpdCBwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnMocmVsZWFzZVRyYWlucywgdGhpcy5fY29uZmlnKTtcblxuICAgIGNvbnN0IGFjdGlvbiA9IGF3YWl0IHRoaXMuX3Byb21wdEZvclJlbGVhc2VBY3Rpb24ocmVsZWFzZVRyYWlucyk7XG4gICAgY29uc3QgcHJldmlvdXNHaXRCcmFuY2hPclJldmlzaW9uID0gdGhpcy5fZ2l0LmdldEN1cnJlbnRCcmFuY2hPclJldmlzaW9uKCk7XG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgYWN0aW9uLnBlcmZvcm0oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBpZiAoZSBpbnN0YW5jZW9mIFVzZXJBYm9ydGVkUmVsZWFzZUFjdGlvbkVycm9yKSB7XG4gICAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuTUFOVUFMTFlfQUJPUlRFRDtcbiAgICAgIH1cbiAgICAgIC8vIE9ubHkgcHJpbnQgdGhlIGVycm9yIG1lc3NhZ2UgYW5kIHN0YWNrIGlmIHRoZSBlcnJvciBpcyBub3QgYSBrbm93biBmYXRhbCByZWxlYXNlXG4gICAgICAvLyBhY3Rpb24gZXJyb3IgKGZvciB3aGljaCB3ZSBwcmludCB0aGUgZXJyb3IgZ3JhY2VmdWxseSB0byB0aGUgY29uc29sZSB3aXRoIGNvbG9ycykuXG4gICAgICBpZiAoIShlIGluc3RhbmNlb2YgRmF0YWxSZWxlYXNlQWN0aW9uRXJyb3IpICYmIGUgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5GQVRBTF9FUlJPUjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5fZ2l0LmNoZWNrb3V0KHByZXZpb3VzR2l0QnJhbmNoT3JSZXZpc2lvbiwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5TVUNDRVNTO1xuICB9XG5cbiAgLyoqIFByb21wdHMgdGhlIGNhcmV0YWtlciBmb3IgYSByZWxlYXNlIGFjdGlvbiB0aGF0IHNob3VsZCBiZSBwZXJmb3JtZWQuICovXG4gIHByaXZhdGUgYXN5bmMgX3Byb21wdEZvclJlbGVhc2VBY3Rpb24oYWN0aXZlVHJhaW5zOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgY29uc3QgY2hvaWNlczogTGlzdENob2ljZU9wdGlvbnNbXSA9IFtdO1xuXG4gICAgLy8gRmluZCBhbmQgaW5zdGFudGlhdGUgYWxsIHJlbGVhc2UgYWN0aW9ucyB3aGljaCBhcmUgY3VycmVudGx5IHZhbGlkLlxuICAgIGZvciAobGV0IGFjdGlvblR5cGUgb2YgYWN0aW9ucykge1xuICAgICAgaWYgKGF3YWl0IGFjdGlvblR5cGUuaXNBY3RpdmUoYWN0aXZlVHJhaW5zKSkge1xuICAgICAgICBjb25zdCBhY3Rpb246IFJlbGVhc2VBY3Rpb24gPVxuICAgICAgICAgICAgbmV3IGFjdGlvblR5cGUoYWN0aXZlVHJhaW5zLCB0aGlzLl9naXQsIHRoaXMuX2NvbmZpZywgdGhpcy5fcHJvamVjdFJvb3QpO1xuICAgICAgICBjaG9pY2VzLnB1c2goe25hbWU6IGF3YWl0IGFjdGlvbi5nZXREZXNjcmlwdGlvbigpLCB2YWx1ZTogYWN0aW9ufSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5mbygnUGxlYXNlIHNlbGVjdCB0aGUgdHlwZSBvZiByZWxlYXNlIHlvdSB3YW50IHRvIHBlcmZvcm0uJyk7XG5cbiAgICBjb25zdCB7cmVsZWFzZUFjdGlvbn0gPSBhd2FpdCBwcm9tcHQ8e3JlbGVhc2VBY3Rpb246IFJlbGVhc2VBY3Rpb259Pih7XG4gICAgICBuYW1lOiAncmVsZWFzZUFjdGlvbicsXG4gICAgICBtZXNzYWdlOiAnUGxlYXNlIHNlbGVjdCBhbiBhY3Rpb246JyxcbiAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgIGNob2ljZXMsXG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVsZWFzZUFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZXJlIGFyZSBubyB1bmNvbW1pdHRlZCBjaGFuZ2VzIGluIHRoZSBwcm9qZWN0LlxuICAgKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyBzdWNjZXNzIG9yIGZhaWx1cmUuXG4gICAqL1xuICBwcml2YXRlIGFzeW5jIF92ZXJpZnlOb1VuY29tbWl0dGVkQ2hhbmdlcygpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5fZ2l0Lmhhc1VuY29tbWl0dGVkQ2hhbmdlcygpKSB7XG4gICAgICBlcnJvcihyZWQoJyAg4pyYICAgVGhlcmUgYXJlIGNoYW5nZXMgd2hpY2ggYXJlIG5vdCBjb21taXR0ZWQgYW5kIHNob3VsZCBiZSBkaXNjYXJkZWQuJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoZWFkU2hhID0gdGhpcy5fZ2l0LnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5fZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogbmV4dEJyYW5jaE5hbWV9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZCgnICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC4nKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19