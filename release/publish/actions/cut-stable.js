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
        define("@angular/dev-infra-private/release/publish/actions/cut-stable", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning/long-term-support", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/external-commands"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutStableAction = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var long_term_support_1 = require("@angular/dev-infra-private/release/versioning/long-term-support");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var external_commands_1 = require("@angular/dev-infra-private/release/publish/external-commands");
    /**
     * Release action that cuts a stable version for the current release-train in the release
     * candidate phase. The pre-release release-candidate version label is removed.
     */
    var CutStableAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutStableAction, _super);
        function CutStableAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = _this._computeNewVersion();
            return _this;
        }
        CutStableAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion;
                return tslib_1.__generator(this, function (_a) {
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Cut a stable release for the release-candidate branch (v" + newVersion + ")."];
                });
            });
        };
        CutStableAction.prototype.perform = function () {
            var _a;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, isNewMajor, id, previousPatchVersion, ltsTagForPatch;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            isNewMajor = (_a = this.active.releaseCandidate) === null || _a === void 0 ? void 0 : _a.isMajor;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            id = (_b.sent()).id;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'latest')];
                        case 3:
                            _b.sent();
                            if (!isNewMajor) return [3 /*break*/, 6];
                            previousPatchVersion = this.active.latest.version;
                            ltsTagForPatch = long_term_support_1.getLtsNpmDistTagOfMajor(previousPatchVersion.major);
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 4:
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeSetNpmDistCommand(ltsTagForPatch, previousPatchVersion)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(newVersion, branchName)];
                        case 7:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the new stable version of the release candidate release-train. */
        CutStableAction.prototype._computeNewVersion = function () {
            var version = this.active.releaseCandidate.version;
            return semver.parse(version.major + "." + version.minor + "." + version.patch);
        };
        CutStableAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // A stable version can be cut for an active release-train currently in the
                    // release-candidate phase. Note: It is not possible to directly release from
                    // feature-freeze phase into a stable version.
                    return [2 /*return*/, active.releaseCandidate !== null &&
                            active.releaseCandidate.version.prerelease[0] === 'rc'];
                });
            });
        };
        return CutStableAction;
    }(actions_1.ReleaseAction));
    exports.CutStableAction = CutStableAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMscUdBQTJFO0lBQzNFLDhFQUF5QztJQUN6QyxrR0FBdUY7SUFFdkY7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7WUFBQSxxRUFtREM7WUFsRFMsaUJBQVcsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7UUFrRGxELENBQUM7UUFoRE8sd0NBQWMsR0FBcEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLHNCQUFPLDZEQUEyRCxVQUFVLE9BQUksRUFBQzs7O1NBQ2xGO1FBRUssaUNBQU8sR0FBYjs7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsV0FBakMsQ0FBa0M7NEJBQzdDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOzRCQUM5QixVQUFVLFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsMENBQUUsT0FBTyxDQUFDOzRCQUc1QyxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsRUFBRSxHQUFJLENBQUEsU0FBZ0UsQ0FBQSxHQUFwRTs0QkFFVCxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUE7OzRCQUEzQyxTQUEyQyxDQUFDOzRCQUM1QyxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUE7OzRCQUE1RCxTQUE0RCxDQUFDO2lDQUl6RCxVQUFVLEVBQVYsd0JBQVU7NEJBQ04sb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDOzRCQUNsRCxjQUFjLEdBQUcsMkNBQXVCLENBQUMsb0JBQW9CLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBRTNFLGtGQUFrRjs0QkFDbEYsb0ZBQW9GOzRCQUNwRixtRkFBbUY7NEJBQ25GLHVGQUF1Rjs0QkFDdkYsdUZBQXVGOzRCQUN2Riw4RUFBOEU7NEJBQzlFLHFCQUFNLDRDQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBTi9DLGtGQUFrRjs0QkFDbEYsb0ZBQW9GOzRCQUNwRixtRkFBbUY7NEJBQ25GLHVGQUF1Rjs0QkFDdkYsdUZBQXVGOzRCQUN2Riw4RUFBOEU7NEJBQzlFLFNBQStDLENBQUM7NEJBQ2hELHFCQUFNLDJDQUF1QixDQUFDLGNBQWMsRUFBRSxvQkFBb0IsQ0FBQyxFQUFBOzs0QkFBbkUsU0FBbUUsQ0FBQzs7Z0NBR3RFLHFCQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUFwRSxTQUFvRSxDQUFDOzs7OztTQUN0RTtRQUVELDBFQUEwRTtRQUNsRSw0Q0FBa0IsR0FBMUI7WUFDUyxJQUFBLE9BQU8sR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixRQUFqQyxDQUFrQztZQUNoRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUksT0FBTyxDQUFDLEtBQUssU0FBSSxPQUFPLENBQUMsS0FBSyxTQUFJLE9BQU8sQ0FBQyxLQUFPLENBQUUsQ0FBQztRQUM3RSxDQUFDO1FBRVksd0JBQVEsR0FBckIsVUFBc0IsTUFBMkI7OztvQkFDL0MsMkVBQTJFO29CQUMzRSw2RUFBNkU7b0JBQzdFLDhDQUE4QztvQkFDOUMsc0JBQU8sTUFBTSxDQUFDLGdCQUFnQixLQUFLLElBQUk7NEJBQ25DLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBQzs7O1NBQzVEO1FBQ0gsc0JBQUM7SUFBRCxDQUFDLEFBbkRELENBQXFDLHVCQUFhLEdBbURqRDtJQW5EWSwwQ0FBZSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2dldEx0c05wbURpc3RUYWdPZk1ham9yfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0JztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5pbXBvcnQge2ludm9rZVNldE5wbURpc3RDb21tYW5kLCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmR9IGZyb20gJy4uL2V4dGVybmFsLWNvbW1hbmRzJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBzdGFibGUgdmVyc2lvbiBmb3IgdGhlIGN1cnJlbnQgcmVsZWFzZS10cmFpbiBpbiB0aGUgcmVsZWFzZVxuICogY2FuZGlkYXRlIHBoYXNlLiBUaGUgcHJlLXJlbGVhc2UgcmVsZWFzZS1jYW5kaWRhdGUgdmVyc2lvbiBsYWJlbCBpcyByZW1vdmVkLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0U3RhYmxlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgc3RhYmxlIHJlbGVhc2UgZm9yIHRoZSByZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICBjb25zdCBpc05ld01ham9yID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZT8uaXNNYWpvcjtcblxuXG4gICAgY29uc3Qge2lkfSA9IGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUsICdsYXRlc3QnKTtcblxuICAgIC8vIElmIGEgbmV3IG1ham9yIHZlcnNpb24gaXMgcHVibGlzaGVkIGFuZCBiZWNvbWVzIHRoZSBcImxhdGVzdFwiIHJlbGVhc2UtdHJhaW4sIHdlIG5lZWRcbiAgICAvLyB0byBzZXQgdGhlIExUUyBucG0gZGlzdCB0YWcgZm9yIHRoZSBwcmV2aW91cyBsYXRlc3QgcmVsZWFzZS10cmFpbiAodGhlIGN1cnJlbnQgcGF0Y2gpLlxuICAgIGlmIChpc05ld01ham9yKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1BhdGNoVmVyc2lvbiA9IHRoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9uO1xuICAgICAgY29uc3QgbHRzVGFnRm9yUGF0Y2ggPSBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcihwcmV2aW91c1BhdGNoVmVyc2lvbi5tYWpvcik7XG5cbiAgICAgIC8vIEluc3RlYWQgb2YgZGlyZWN0bHkgc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFncywgd2UgaW52b2tlIHRoZSBuZy1kZXYgY29tbWFuZCBmb3JcbiAgICAgIC8vIHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZyB0byB0aGUgc3BlY2lmaWVkIHZlcnNpb24uIFdlIGRvIHRoaXMgYmVjYXVzZSByZWxlYXNlIE5QTVxuICAgICAgLy8gcGFja2FnZXMgY291bGQgYmUgZGlmZmVyZW50IGluIHRoZSBwcmV2aW91cyBwYXRjaCBicmFuY2gsIGFuZCB3ZSB3YW50IHRvIHNldCB0aGVcbiAgICAgIC8vIExUUyB0YWcgZm9yIGFsbCBwYWNrYWdlcyBwYXJ0IG9mIHRoZSBsYXN0IG1ham9yLiBJdCB3b3VsZCBub3QgYmUgcG9zc2libGUgdG8gc2V0IHRoZVxuICAgICAgLy8gTlBNIGRpc3QgdGFnIGZvciBuZXcgcGFja2FnZXMgcGFydCBvZiB0aGUgcmVsZWFzZWQgbWFqb3IsIG5vciB3b3VsZCBpdCBiZSBhY2NlcHRhYmxlXG4gICAgICAvLyB0byBza2lwIHRoZSBMVFMgdGFnIGZvciBwYWNrYWdlcyB3aGljaCBhcmUgbm8gbG9uZ2VyIHBhcnQgb2YgdGhlIG5ldyBtYWpvci5cbiAgICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgICAgYXdhaXQgaW52b2tlU2V0TnBtRGlzdENvbW1hbmQobHRzVGFnRm9yUGF0Y2gsIHByZXZpb3VzUGF0Y2hWZXJzaW9uKTtcbiAgICB9XG5cbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuZXcgc3RhYmxlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UgY2FuZGlkYXRlIHJlbGVhc2UtdHJhaW4uICovXG4gIHByaXZhdGUgX2NvbXB1dGVOZXdWZXJzaW9uKCk6IHNlbXZlci5TZW1WZXIge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIHJldHVybiBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YCkhO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgc3RhYmxlIHZlcnNpb24gY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICAgIC8vIHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gZGlyZWN0bHkgcmVsZWFzZSBmcm9tXG4gICAgLy8gZmVhdHVyZS1mcmVlemUgcGhhc2UgaW50byBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYyc7XG4gIH1cbn1cbiJdfQ==