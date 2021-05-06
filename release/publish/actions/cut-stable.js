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
                var branchName, newVersion, isNewMajor, _b, id, releaseNotes, previousPatch, ltsTagForPatch;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            isNewMajor = (_a = this.active.releaseCandidate) === null || _a === void 0 ? void 0 : _a.isMajor;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            _b = _c.sent(), id = _b.pullRequest.id, releaseNotes = _b.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _c.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'latest')];
                        case 3:
                            _c.sent();
                            if (!isNewMajor) return [3 /*break*/, 7];
                            previousPatch = this.active.latest;
                            ltsTagForPatch = long_term_support_1.getLtsNpmDistTagOfMajor(previousPatch.version.major);
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            return [4 /*yield*/, this.checkoutUpstreamBranch(previousPatch.branchName)];
                        case 4:
                            // Instead of directly setting the NPM dist tags, we invoke the ng-dev command for
                            // setting the NPM dist tag to the specified version. We do this because release NPM
                            // packages could be different in the previous patch branch, and we want to set the
                            // LTS tag for all packages part of the last major. It would not be possible to set the
                            // NPM dist tag for new packages part of the released major, nor would it be acceptable
                            // to skip the LTS tag for packages which are no longer part of the new major.
                            _c.sent();
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 5:
                            _c.sent();
                            return [4 /*yield*/, external_commands_1.invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version)];
                        case 6:
                            _c.sent();
                            _c.label = 7;
                        case 7: return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName)];
                        case 8:
                            _c.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMscUdBQTJFO0lBQzNFLDhFQUF5QztJQUN6QyxrR0FBdUY7SUFFdkY7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7WUFBQSxxRUFxREM7WUFwRFMsaUJBQVcsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7UUFvRGxELENBQUM7UUFsRE8sd0NBQWMsR0FBcEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLHNCQUFPLDZEQUEyRCxVQUFVLE9BQUksRUFBQzs7O1NBQ2xGO1FBRUssaUNBQU8sR0FBYjs7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsV0FBakMsQ0FBa0M7NEJBQzdDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOzRCQUM5QixVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUM7NEJBSXJELHFCQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUQ5RCxLQUNGLFNBQWdFLEVBRC9DLEVBQUUsb0JBQUEsRUFBRyxZQUFZLGtCQUFBOzRCQUd0QyxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUE7OzRCQUEzQyxTQUEyQyxDQUFDOzRCQUM1QyxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxDQUFDLEVBQUE7OzRCQUE1RCxTQUE0RCxDQUFDO2lDQUl6RCxVQUFVLEVBQVYsd0JBQVU7NEJBQ04sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDOzRCQUNuQyxjQUFjLEdBQUcsMkNBQXVCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFFNUUsa0ZBQWtGOzRCQUNsRixvRkFBb0Y7NEJBQ3BGLG1GQUFtRjs0QkFDbkYsdUZBQXVGOzRCQUN2Rix1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUscUJBQU0sSUFBSSxDQUFDLHNCQUFzQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBTjNELGtGQUFrRjs0QkFDbEYsb0ZBQW9GOzRCQUNwRixtRkFBbUY7NEJBQ25GLHVGQUF1Rjs0QkFDdkYsdUZBQXVGOzRCQUN2Riw4RUFBOEU7NEJBQzlFLFNBQTJELENBQUM7NEJBQzVELHFCQUFNLDRDQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBQS9DLFNBQStDLENBQUM7NEJBQ2hELHFCQUFNLDJDQUF1QixDQUFDLGNBQWMsRUFBRSxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUE7OzRCQUFwRSxTQUFvRSxDQUFDOztnQ0FHdkUscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXRFLFNBQXNFLENBQUM7Ozs7O1NBQ3hFO1FBRUQsMEVBQTBFO1FBQ2xFLDRDQUFrQixHQUExQjtZQUNTLElBQUEsT0FBTyxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLFFBQWpDLENBQWtDO1lBQ2hELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBSSxPQUFPLENBQUMsS0FBSyxTQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQU8sQ0FBRSxDQUFDO1FBQzdFLENBQUM7UUFFWSx3QkFBUSxHQUFyQixVQUFzQixNQUEyQjs7O29CQUMvQywyRUFBMkU7b0JBQzNFLDZFQUE2RTtvQkFDN0UsOENBQThDO29CQUM5QyxzQkFBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSTs0QkFDbkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFDOzs7U0FDNUQ7UUFDSCxzQkFBQztJQUFELENBQUMsQUFyREQsQ0FBcUMsdUJBQWEsR0FxRGpEO0lBckRZLDBDQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7Z2V0THRzTnBtRGlzdFRhZ09mTWFqb3J9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbG9uZy10ZXJtLXN1cHBvcnQnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcbmltcG9ydCB7aW52b2tlU2V0TnBtRGlzdENvbW1hbmQsIGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZH0gZnJvbSAnLi4vZXh0ZXJuYWwtY29tbWFuZHMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIHN0YWJsZSB2ZXJzaW9uIGZvciB0aGUgY3VycmVudCByZWxlYXNlLXRyYWluIGluIHRoZSByZWxlYXNlXG4gKiBjYW5kaWRhdGUgcGhhc2UuIFRoZSBwcmUtcmVsZWFzZSByZWxlYXNlLWNhbmRpZGF0ZSB2ZXJzaW9uIGxhYmVsIGlzIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRTdGFibGVBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBzdGFibGUgcmVsZWFzZSBmb3IgdGhlIHJlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIGNvbnN0IGlzTmV3TWFqb3IgPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlPy5pc01ham9yO1xuXG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lLCAnbGF0ZXN0Jyk7XG5cbiAgICAvLyBJZiBhIG5ldyBtYWpvciB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhbmQgYmVjb21lcyB0aGUgXCJsYXRlc3RcIiByZWxlYXNlLXRyYWluLCB3ZSBuZWVkXG4gICAgLy8gdG8gc2V0IHRoZSBMVFMgbnBtIGRpc3QgdGFnIGZvciB0aGUgcHJldmlvdXMgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gKHRoZSBjdXJyZW50IHBhdGNoKS5cbiAgICBpZiAoaXNOZXdNYWpvcikge1xuICAgICAgY29uc3QgcHJldmlvdXNQYXRjaCA9IHRoaXMuYWN0aXZlLmxhdGVzdDtcbiAgICAgIGNvbnN0IGx0c1RhZ0ZvclBhdGNoID0gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IocHJldmlvdXNQYXRjaC52ZXJzaW9uLm1ham9yKTtcblxuICAgICAgLy8gSW5zdGVhZCBvZiBkaXJlY3RseSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWdzLCB3ZSBpbnZva2UgdGhlIG5nLWRldiBjb21tYW5kIGZvclxuICAgICAgLy8gc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gV2UgZG8gdGhpcyBiZWNhdXNlIHJlbGVhc2UgTlBNXG4gICAgICAvLyBwYWNrYWdlcyBjb3VsZCBiZSBkaWZmZXJlbnQgaW4gdGhlIHByZXZpb3VzIHBhdGNoIGJyYW5jaCwgYW5kIHdlIHdhbnQgdG8gc2V0IHRoZVxuICAgICAgLy8gTFRTIHRhZyBmb3IgYWxsIHBhY2thZ2VzIHBhcnQgb2YgdGhlIGxhc3QgbWFqb3IuIEl0IHdvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byBzZXQgdGhlXG4gICAgICAvLyBOUE0gZGlzdCB0YWcgZm9yIG5ldyBwYWNrYWdlcyBwYXJ0IG9mIHRoZSByZWxlYXNlZCBtYWpvciwgbm9yIHdvdWxkIGl0IGJlIGFjY2VwdGFibGVcbiAgICAgIC8vIHRvIHNraXAgdGhlIExUUyB0YWcgZm9yIHBhY2thZ2VzIHdoaWNoIGFyZSBubyBsb25nZXIgcGFydCBvZiB0aGUgbmV3IG1ham9yLlxuICAgICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHByZXZpb3VzUGF0Y2guYnJhbmNoTmFtZSk7XG4gICAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKGx0c1RhZ0ZvclBhdGNoLCBwcmV2aW91c1BhdGNoLnZlcnNpb24pO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgbmV3IHN0YWJsZSB2ZXJzaW9uIG9mIHRoZSByZWxlYXNlIGNhbmRpZGF0ZSByZWxlYXNlLXRyYWluLiAqL1xuICBwcml2YXRlIF9jb21wdXRlTmV3VmVyc2lvbigpOiBzZW12ZXIuU2VtVmVyIHtcbiAgICBjb25zdCB7dmVyc2lvbn0gPSB0aGlzLmFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlITtcbiAgICByZXR1cm4gc2VtdmVyLnBhcnNlKGAke3ZlcnNpb24ubWFqb3J9LiR7dmVyc2lvbi5taW5vcn0uJHt2ZXJzaW9uLnBhdGNofWApITtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIHN0YWJsZSB2ZXJzaW9uIGNhbiBiZSBjdXQgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGVcbiAgICAvLyByZWxlYXNlLWNhbmRpZGF0ZSBwaGFzZS4gTm90ZTogSXQgaXMgbm90IHBvc3NpYmxlIHRvIGRpcmVjdGx5IHJlbGVhc2UgZnJvbVxuICAgIC8vIGZlYXR1cmUtZnJlZXplIHBoYXNlIGludG8gYSBzdGFibGUgdmVyc2lvbi5cbiAgICByZXR1cm4gYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiZcbiAgICAgICAgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUudmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAncmMnO1xuICB9XG59XG4iXX0=