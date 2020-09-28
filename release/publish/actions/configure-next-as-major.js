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
        define("@angular/dev-infra-private/release/publish/actions/configure-next-as-major", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/commit-message", "@angular/dev-infra-private/release/publish/constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ConfigureNextAsMajorAction = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var commit_message_1 = require("@angular/dev-infra-private/release/publish/commit-message");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    /**
     * Release action that configures the active next release-train to be for a major
     * version. This means that major changes can land in the next branch.
     */
    var ConfigureNextAsMajorAction = /** @class */ (function (_super) {
        tslib_1.__extends(ConfigureNextAsMajorAction, _super);
        function ConfigureNextAsMajorAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = semver.parse(_this.active.next.version.major + 1 + ".0.0-next.0");
            return _this;
        }
        ConfigureNextAsMajorAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion;
                return tslib_1.__generator(this, function (_a) {
                    branchName = this.active.next.branchName;
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Configure the \"" + branchName + "\" branch to be released as major (v" + newVersion + ")."];
                });
            });
        };
        ConfigureNextAsMajorAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, pullRequest;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this.active.next.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.verifyPassingGithubStatus(branchName)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.checkoutUpstreamBranch(branchName)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.updateProjectVersion(newVersion)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.createCommit(commit_message_1.getCommitMessageForNextBranchMajorSwitch(newVersion), [constants_1.packageJsonPath])];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, this.pushChangesToForkAndCreatePullRequest(branchName, "switch-next-to-major-" + newVersion, "Configure next branch to receive major changes for v" + newVersion)];
                        case 5:
                            pullRequest = _a.sent();
                            console_1.info(console_1.green('  ✓   Next branch update pull request has been created.'));
                            console_1.info(console_1.yellow("      Please ask team members to review: " + pullRequest.url + "."));
                            return [2 /*return*/];
                    }
                });
            });
        };
        ConfigureNextAsMajorAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // The `next` branch can always be switched to a major version, unless it already
                    // is targeting a new major. A major can contain minor changes, so we can always
                    // change the target from a minor to a major.
                    return [2 /*return*/, !active.next.isMajor];
                });
            });
        };
        return ConfigureNextAsMajorAction;
    }(actions_1.ReleaseAction));
    exports.ConfigureNextAsMajorAction = ConfigureNextAsMajorAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJlLW5leHQtYXMtbWFqb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvY29uZmlndXJlLW5leHQtYXMtbWFqb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUVqQyxvRUFBMkQ7SUFFM0QsOEVBQXlDO0lBQ3pDLDRGQUEyRTtJQUMzRSxrRkFBNkM7SUFFN0M7OztPQUdHO0lBQ0g7UUFBZ0Qsc0RBQWE7UUFBN0Q7WUFBQSxxRUFnQ0M7WUEvQlMsaUJBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFJLEtBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsQ0FBQyxnQkFBYSxDQUFFLENBQUM7O1FBK0IxRixDQUFDO1FBN0JPLG1EQUFjLEdBQXBCOzs7O29CQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksV0FBcEIsQ0FBcUI7b0JBQ2hDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUNwQyxzQkFBTyxxQkFBa0IsVUFBVSw0Q0FBc0MsVUFBVSxPQUFJLEVBQUM7OztTQUN6RjtRQUVLLDRDQUFPLEdBQWI7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLFdBQXBCLENBQXFCOzRCQUNoQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs0QkFFcEMscUJBQU0sSUFBSSxDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBaEQsU0FBZ0QsQ0FBQzs0QkFDakQscUJBQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBN0MsU0FBNkMsQ0FBQzs0QkFDOUMscUJBQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBM0MsU0FBMkMsQ0FBQzs0QkFDNUMscUJBQU0sSUFBSSxDQUFDLFlBQVksQ0FDbkIseURBQXdDLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQywyQkFBZSxDQUFDLENBQUMsRUFBQTs7NEJBRDVFLFNBQzRFLENBQUM7NEJBQ3pELHFCQUFNLElBQUksQ0FBQyxxQ0FBcUMsQ0FDaEUsVUFBVSxFQUFFLDBCQUF3QixVQUFZLEVBQ2hELHlEQUF1RCxVQUFZLENBQUMsRUFBQTs7NEJBRmxFLFdBQVcsR0FBRyxTQUVvRDs0QkFFeEUsY0FBSSxDQUFDLGVBQUssQ0FBQyx5REFBeUQsQ0FBQyxDQUFDLENBQUM7NEJBQ3ZFLGNBQUksQ0FBQyxnQkFBTSxDQUFDLDhDQUE0QyxXQUFXLENBQUMsR0FBRyxNQUFHLENBQUMsQ0FBQyxDQUFDOzs7OztTQUM5RTtRQUVZLG1DQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLGlGQUFpRjtvQkFDakYsZ0ZBQWdGO29CQUNoRiw2Q0FBNkM7b0JBQzdDLHNCQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUM7OztTQUM3QjtRQUNILGlDQUFDO0lBQUQsQ0FBQyxBQWhDRCxDQUFnRCx1QkFBYSxHQWdDNUQ7SUFoQ1ksZ0VBQTBCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge2dyZWVuLCBpbmZvLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlRm9yTmV4dEJyYW5jaE1ham9yU3dpdGNofSBmcm9tICcuLi9jb21taXQtbWVzc2FnZSc7XG5pbXBvcnQge3BhY2thZ2VKc29uUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGNvbmZpZ3VyZXMgdGhlIGFjdGl2ZSBuZXh0IHJlbGVhc2UtdHJhaW4gdG8gYmUgZm9yIGEgbWFqb3JcbiAqIHZlcnNpb24uIFRoaXMgbWVhbnMgdGhhdCBtYWpvciBjaGFuZ2VzIGNhbiBsYW5kIGluIHRoZSBuZXh0IGJyYW5jaC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbmZpZ3VyZU5leHRBc01ham9yQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBzZW12ZXIucGFyc2UoYCR7dGhpcy5hY3RpdmUubmV4dC52ZXJzaW9uLm1ham9yICsgMX0uMC4wLW5leHQuMGApITtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ29uZmlndXJlIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggdG8gYmUgcmVsZWFzZWQgYXMgbWFqb3IgKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5uZXh0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgYXdhaXQgdGhpcy52ZXJpZnlQYXNzaW5nR2l0aHViU3RhdHVzKGJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRVcHN0cmVhbUJyYW5jaChicmFuY2hOYW1lKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZVByb2plY3RWZXJzaW9uKG5ld1ZlcnNpb24pO1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ29tbWl0KFxuICAgICAgICBnZXRDb21taXRNZXNzYWdlRm9yTmV4dEJyYW5jaE1ham9yU3dpdGNoKG5ld1ZlcnNpb24pLCBbcGFja2FnZUpzb25QYXRoXSk7XG4gICAgY29uc3QgcHVsbFJlcXVlc3QgPSBhd2FpdCB0aGlzLnB1c2hDaGFuZ2VzVG9Gb3JrQW5kQ3JlYXRlUHVsbFJlcXVlc3QoXG4gICAgICAgIGJyYW5jaE5hbWUsIGBzd2l0Y2gtbmV4dC10by1tYWpvci0ke25ld1ZlcnNpb259YCxcbiAgICAgICAgYENvbmZpZ3VyZSBuZXh0IGJyYW5jaCB0byByZWNlaXZlIG1ham9yIGNoYW5nZXMgZm9yIHYke25ld1ZlcnNpb259YCk7XG5cbiAgICBpbmZvKGdyZWVuKCcgIOKckyAgIE5leHQgYnJhbmNoIHVwZGF0ZSBwdWxsIHJlcXVlc3QgaGFzIGJlZW4gY3JlYXRlZC4nKSk7XG4gICAgaW5mbyh5ZWxsb3coYCAgICAgIFBsZWFzZSBhc2sgdGVhbSBtZW1iZXJzIHRvIHJldmlldzogJHtwdWxsUmVxdWVzdC51cmx9LmApKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBUaGUgYG5leHRgIGJyYW5jaCBjYW4gYWx3YXlzIGJlIHN3aXRjaGVkIHRvIGEgbWFqb3IgdmVyc2lvbiwgdW5sZXNzIGl0IGFscmVhZHlcbiAgICAvLyBpcyB0YXJnZXRpbmcgYSBuZXcgbWFqb3IuIEEgbWFqb3IgY2FuIGNvbnRhaW4gbWlub3IgY2hhbmdlcywgc28gd2UgY2FuIGFsd2F5c1xuICAgIC8vIGNoYW5nZSB0aGUgdGFyZ2V0IGZyb20gYSBtaW5vciB0byBhIG1ham9yLlxuICAgIHJldHVybiAhYWN0aXZlLm5leHQuaXNNYWpvcjtcbiAgfVxufVxuIl19