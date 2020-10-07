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
                                console.error(e_1.message);
                                console.error(e_1.stack);
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
                            console_1.info("Please select the type of release you want to perform.");
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
                        console_1.error(console_1.red("  \u2718   There are changes which are not committed and should be " +
                            "discarded."));
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
                                console_1.error(console_1.red("  \u2718   Running release tool from an outdated local branch."));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxxQ0FBbUQ7SUFHbkQsb0VBQWtFO0lBQ2xFLG9FQUFnRDtJQUVoRCw2R0FBa0g7SUFDbEgseUdBQTJFO0lBSTNFLDBGQUF1RjtJQUN2RixrRkFBd0M7SUFFeEMsSUFBWSxlQUlYO0lBSkQsV0FBWSxlQUFlO1FBQ3pCLDJEQUFPLENBQUE7UUFDUCxtRUFBVyxDQUFBO1FBQ1gsNkVBQWdCLENBQUE7SUFDbEIsQ0FBQyxFQUpXLGVBQWUsR0FBZix1QkFBZSxLQUFmLHVCQUFlLFFBSTFCO0lBRUQ7UUFJRSxxQkFDYyxPQUFzQixFQUFZLE9BQXFCLEVBQ3ZELFlBQW9CLEVBQVksWUFBb0I7WUFEcEQsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFZLFlBQU8sR0FBUCxPQUFPLENBQWM7WUFDdkQsaUJBQVksR0FBWixZQUFZLENBQVE7WUFBWSxpQkFBWSxHQUFaLFlBQVksQ0FBUTtZQUxsRSw0RUFBNEU7WUFDcEUsU0FBSSxHQUFHLElBQUksaUJBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUMsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFJdEIsQ0FBQztRQUV0RSx5Q0FBeUM7UUFDbkMseUJBQUcsR0FBVDs7Ozs7OzRCQUNFLGFBQUcsRUFBRSxDQUFDOzRCQUNOLGFBQUcsQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQzs0QkFDNUQsYUFBRyxDQUFDLGdCQUFNLENBQUMsNENBQTRDLENBQUMsQ0FBQyxDQUFDOzRCQUMxRCxhQUFHLENBQUMsZ0JBQU0sQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7NEJBQzVELGFB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IEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtMaXN0Q2hvaWNlT3B0aW9ucywgcHJvbXB0fSBmcm9tICdpbnF1aXJlcic7XG5cbmltcG9ydCB7R2l0aHViQ29uZmlnfSBmcm9tICcuLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgaW5mbywgbG9nLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnJztcbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWlucywgZmV0Y2hBY3RpdmVSZWxlYXNlVHJhaW5zLCBuZXh0QnJhbmNoTmFtZX0gZnJvbSAnLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtwcmludEFjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uL3ZlcnNpb25pbmcvcHJpbnQtYWN0aXZlLXRyYWlucyc7XG5pbXBvcnQge0dpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi92ZXJzaW9uaW5nL3ZlcnNpb24tYnJhbmNoZXMnO1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge0ZhdGFsUmVsZWFzZUFjdGlvbkVycm9yLCBVc2VyQWJvcnRlZFJlbGVhc2VBY3Rpb25FcnJvcn0gZnJvbSAnLi9hY3Rpb25zLWVycm9yJztcbmltcG9ydCB7YWN0aW9uc30gZnJvbSAnLi9hY3Rpb25zL2luZGV4JztcblxuZXhwb3J0IGVudW0gQ29tcGxldGlvblN0YXRlIHtcbiAgU1VDQ0VTUyxcbiAgRkFUQUxfRVJST1IsXG4gIE1BTlVBTExZX0FCT1JURUQsXG59XG5cbmV4cG9ydCBjbGFzcyBSZWxlYXNlVG9vbCB7XG4gIC8qKiBDbGllbnQgZm9yIGludGVyYWN0aW5nIHdpdGggdGhlIEdpdGh1YiBBUEkgYW5kIHRoZSBsb2NhbCBHaXQgY29tbWFuZC4gKi9cbiAgcHJpdmF0ZSBfZ2l0ID0gbmV3IEdpdENsaWVudCh0aGlzLl9naXRodWJUb2tlbiwge2dpdGh1YjogdGhpcy5fZ2l0aHVifSwgdGhpcy5fcHJvamVjdFJvb3QpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJvdGVjdGVkIF9jb25maWc6IFJlbGVhc2VDb25maWcsIHByb3RlY3RlZCBfZ2l0aHViOiBHaXRodWJDb25maWcsXG4gICAgICBwcm90ZWN0ZWQgX2dpdGh1YlRva2VuOiBzdHJpbmcsIHByb3RlY3RlZCBfcHJvamVjdFJvb3Q6IHN0cmluZykge31cblxuICAvKiogUnVucyB0aGUgaW50ZXJhY3RpdmUgcmVsZWFzZSB0b29sLiAqL1xuICBhc3luYyBydW4oKTogUHJvbWlzZTxDb21wbGV0aW9uU3RhdGU+IHtcbiAgICBsb2coKTtcbiAgICBsb2coeWVsbG93KCctLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLScpKTtcbiAgICBsb2coeWVsbG93KCcgIEFuZ3VsYXIgRGV2LUluZnJhIHJlbGVhc2Ugc3RhZ2luZyBzY3JpcHQnKSk7XG4gICAgbG9nKHllbGxvdygnLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nKSk7XG4gICAgbG9nKCk7XG5cbiAgICBpZiAoIWF3YWl0IHRoaXMuX3ZlcmlmeU5vVW5jb21taXR0ZWRDaGFuZ2VzKCkgfHwgIWF3YWl0IHRoaXMuX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpKSB7XG4gICAgICByZXR1cm4gQ29tcGxldGlvblN0YXRlLkZBVEFMX0VSUk9SO1xuICAgIH1cblxuICAgIGNvbnN0IHtvd25lciwgbmFtZX0gPSB0aGlzLl9naXRodWI7XG4gICAgY29uc3QgcmVwbzogR2l0aHViUmVwb1dpdGhBcGkgPSB7b3duZXIsIG5hbWUsIGFwaTogdGhpcy5fZ2l0LmdpdGh1Yn07XG4gICAgY29uc3QgcmVsZWFzZVRyYWlucyA9IGF3YWl0IGZldGNoQWN0aXZlUmVsZWFzZVRyYWlucyhyZXBvKTtcblxuICAgIC8vIFByaW50IHRoZSBhY3RpdmUgcmVsZWFzZSB0cmFpbnMgc28gdGhhdCB0aGUgY2FyZXRha2VyIGNhbiBhY2Nlc3NcbiAgICAvLyB0aGUgY3VycmVudCBwcm9qZWN0IGJyYW5jaGluZyBzdGF0ZSB3aXRob3V0IHN3aXRjaGluZyBjb250ZXh0LlxuICAgIGF3YWl0IHByaW50QWN0aXZlUmVsZWFzZVRyYWlucyhyZWxlYXNlVHJhaW5zLCB0aGlzLl9jb25maWcpO1xuXG4gICAgY29uc3QgYWN0aW9uID0gYXdhaXQgdGhpcy5fcHJvbXB0Rm9yUmVsZWFzZUFjdGlvbihyZWxlYXNlVHJhaW5zKTtcbiAgICBjb25zdCBwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24gPSB0aGlzLl9naXQuZ2V0Q3VycmVudEJyYW5jaE9yUmV2aXNpb24oKTtcblxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBhY3Rpb24ucGVyZm9ybSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGlmIChlIGluc3RhbmNlb2YgVXNlckFib3J0ZWRSZWxlYXNlQWN0aW9uRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIENvbXBsZXRpb25TdGF0ZS5NQU5VQUxMWV9BQk9SVEVEO1xuICAgICAgfVxuICAgICAgLy8gT25seSBwcmludCB0aGUgZXJyb3IgbWVzc2FnZSBhbmQgc3RhY2sgaWYgdGhlIGVycm9yIGlzIG5vdCBhIGtub3duIGZhdGFsIHJlbGVhc2VcbiAgICAgIC8vIGFjdGlvbiBlcnJvciAoZm9yIHdoaWNoIHdlIHByaW50IHRoZSBlcnJvciBncmFjZWZ1bGx5IHRvIHRoZSBjb25zb2xlIHdpdGggY29sb3JzKS5cbiAgICAgIGlmICghKGUgaW5zdGFuY2VvZiBGYXRhbFJlbGVhc2VBY3Rpb25FcnJvcikgJiYgZSBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihlLnN0YWNrKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuRkFUQUxfRVJST1I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuX2dpdC5jaGVja291dChwcmV2aW91c0dpdEJyYW5jaE9yUmV2aXNpb24sIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiBDb21wbGV0aW9uU3RhdGUuU1VDQ0VTUztcbiAgfVxuXG4gIC8qKiBQcm9tcHRzIHRoZSBjYXJldGFrZXIgZm9yIGEgcmVsZWFzZSBhY3Rpb24gdGhhdCBzaG91bGQgYmUgcGVyZm9ybWVkLiAqL1xuICBwcml2YXRlIGFzeW5jIF9wcm9tcHRGb3JSZWxlYXNlQWN0aW9uKGFjdGl2ZVRyYWluczogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIGNvbnN0IGNob2ljZXM6IExpc3RDaG9pY2VPcHRpb25zW10gPSBbXTtcblxuICAgIC8vIEZpbmQgYW5kIGluc3RhbnRpYXRlIGFsbCByZWxlYXNlIGFjdGlvbnMgd2hpY2ggYXJlIGN1cnJlbnRseSB2YWxpZC5cbiAgICBmb3IgKGxldCBhY3Rpb25UeXBlIG9mIGFjdGlvbnMpIHtcbiAgICAgIGlmIChhd2FpdCBhY3Rpb25UeXBlLmlzQWN0aXZlKGFjdGl2ZVRyYWlucykpIHtcbiAgICAgICAgY29uc3QgYWN0aW9uOiBSZWxlYXNlQWN0aW9uID1cbiAgICAgICAgICAgIG5ldyBhY3Rpb25UeXBlKGFjdGl2ZVRyYWlucywgdGhpcy5fZ2l0LCB0aGlzLl9jb25maWcsIHRoaXMuX3Byb2plY3RSb290KTtcbiAgICAgICAgY2hvaWNlcy5wdXNoKHtuYW1lOiBhd2FpdCBhY3Rpb24uZ2V0RGVzY3JpcHRpb24oKSwgdmFsdWU6IGFjdGlvbn0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGluZm8oYFBsZWFzZSBzZWxlY3QgdGhlIHR5cGUgb2YgcmVsZWFzZSB5b3Ugd2FudCB0byBwZXJmb3JtLmApO1xuXG4gICAgY29uc3Qge3JlbGVhc2VBY3Rpb259ID0gYXdhaXQgcHJvbXB0PHtyZWxlYXNlQWN0aW9uOiBSZWxlYXNlQWN0aW9ufT4oe1xuICAgICAgbmFtZTogJ3JlbGVhc2VBY3Rpb24nLFxuICAgICAgbWVzc2FnZTogJ1BsZWFzZSBzZWxlY3QgYW4gYWN0aW9uOicsXG4gICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICBjaG9pY2VzLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlbGVhc2VBY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogVmVyaWZpZXMgdGhhdCB0aGVyZSBhcmUgbm8gdW5jb21taXR0ZWQgY2hhbmdlcyBpbiB0aGUgcHJvamVjdC5cbiAgICogQHJldHVybnMgYSBib29sZWFuIGluZGljYXRpbmcgc3VjY2VzcyBvciBmYWlsdXJlLlxuICAgKi9cbiAgcHJpdmF0ZSBhc3luYyBfdmVyaWZ5Tm9VbmNvbW1pdHRlZENoYW5nZXMoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgaWYgKHRoaXMuX2dpdC5oYXNVbmNvbW1pdHRlZENoYW5nZXMoKSkge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgcmVkKGAgIOKcmCAgIFRoZXJlIGFyZSBjaGFuZ2VzIHdoaWNoIGFyZSBub3QgY29tbWl0dGVkIGFuZCBzaG91bGQgYmUgYCArXG4gICAgICAgICAgICAgIGBkaXNjYXJkZWQuYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZmllcyB0aGF0IHRoZSBuZXh0IGJyYW5jaCBmcm9tIHRoZSBjb25maWd1cmVkIHJlcG9zaXRvcnkgaXMgY2hlY2tlZCBvdXQuXG4gICAqIEByZXR1cm5zIGEgYm9vbGVhbiBpbmRpY2F0aW5nIHN1Y2Nlc3Mgb3IgZmFpbHVyZS5cbiAgICovXG4gIHByaXZhdGUgYXN5bmMgX3ZlcmlmeVJ1bm5pbmdGcm9tTmV4dEJyYW5jaCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBoZWFkU2hhID0gdGhpcy5fZ2l0LnJ1bihbJ3Jldi1wYXJzZScsICdIRUFEJ10pLnN0ZG91dC50cmltKCk7XG4gICAgY29uc3Qge2RhdGF9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5fZ2l0LmdpdGh1Yi5yZXBvcy5nZXRCcmFuY2goey4uLnRoaXMuX2dpdC5yZW1vdGVQYXJhbXMsIGJyYW5jaDogbmV4dEJyYW5jaE5hbWV9KTtcblxuICAgIGlmIChoZWFkU2hhICE9PSBkYXRhLmNvbW1pdC5zaGEpIHtcbiAgICAgIGVycm9yKHJlZChgICDinJggICBSdW5uaW5nIHJlbGVhc2UgdG9vbCBmcm9tIGFuIG91dGRhdGVkIGxvY2FsIGJyYW5jaC5gKSk7XG4gICAgICBlcnJvcihyZWQoYCAgICAgIFBsZWFzZSBtYWtlIHN1cmUgeW91IGFyZSBydW5uaW5nIGZyb20gdGhlIFwiJHtuZXh0QnJhbmNoTmFtZX1cIiBicmFuY2guYCkpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19