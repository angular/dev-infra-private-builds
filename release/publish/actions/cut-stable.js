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
                var branchName, newVersion, isNewMajor, id, previousPatch, ltsTagForPatch;
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
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 5:
                            _b.sent();
                            return [4 /*yield*/, external_commands_1.invokeSetNpmDistCommand(ltsTagForPatch, previousPatch.version)];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7: return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(newVersion, branchName)];
                        case 8:
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMscUdBQTJFO0lBQzNFLDhFQUF5QztJQUN6QyxrR0FBdUY7SUFFdkY7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7WUFBQSxxRUFvREM7WUFuRFMsaUJBQVcsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7UUFtRGxELENBQUM7UUFqRE8sd0NBQWMsR0FBcEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLHNCQUFPLDZEQUEyRCxVQUFVLE9BQUksRUFBQzs7O1NBQ2xGO1FBRUssaUNBQU8sR0FBYjs7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsV0FBakMsQ0FBa0M7NEJBQzdDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOzRCQUM5QixVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUM7NEJBRzVDLHFCQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUF0RSxFQUFFLEdBQUksQ0FBQSxTQUFnRSxDQUFBLEdBQXBFOzRCQUVULHFCQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsRUFBQTs7NEJBQTNDLFNBQTJDLENBQUM7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBQTs7NEJBQTVELFNBQTRELENBQUM7aUNBSXpELFVBQVUsRUFBVix3QkFBVTs0QkFDTixhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7NEJBQ25DLGNBQWMsR0FBRywyQ0FBdUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUU1RSxrRkFBa0Y7NEJBQ2xGLG9GQUFvRjs0QkFDcEYsbUZBQW1GOzRCQUNuRix1RkFBdUY7NEJBQ3ZGLHVGQUF1Rjs0QkFDdkYsOEVBQThFOzRCQUM5RSxxQkFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFOM0Qsa0ZBQWtGOzRCQUNsRixvRkFBb0Y7NEJBQ3BGLG1GQUFtRjs0QkFDbkYsdUZBQXVGOzRCQUN2Rix1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsU0FBMkQsQ0FBQzs0QkFDNUQscUJBQU0sNENBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBL0MsU0FBK0MsQ0FBQzs0QkFDaEQscUJBQU0sMkNBQXVCLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQTs7NEJBQXBFLFNBQW9FLENBQUM7O2dDQUd2RSxxQkFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBcEUsU0FBb0UsQ0FBQzs7Ozs7U0FDdEU7UUFFRCwwRUFBMEU7UUFDbEUsNENBQWtCLEdBQTFCO1lBQ1MsSUFBQSxPQUFPLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsUUFBakMsQ0FBa0M7WUFDaEQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQUssU0FBSSxPQUFPLENBQUMsS0FBTyxDQUFFLENBQUM7UUFDN0UsQ0FBQztRQUVZLHdCQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLDJFQUEyRTtvQkFDM0UsNkVBQTZFO29CQUM3RSw4Q0FBOEM7b0JBQzlDLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJOzRCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUM7OztTQUM1RDtRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQXBERCxDQUFxQyx1QkFBYSxHQW9EakQ7SUFwRFksMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgc3RhYmxlIHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IHJlbGVhc2UtdHJhaW4gaW4gdGhlIHJlbGVhc2VcbiAqIGNhbmRpZGF0ZSBwaGFzZS4gVGhlIHByZS1yZWxlYXNlIHJlbGVhc2UtY2FuZGlkYXRlIHZlcnNpb24gbGFiZWwgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFN0YWJsZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIHN0YWJsZSByZWxlYXNlIGZvciB0aGUgcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgaXNOZXdNYWpvciA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGU/LmlzTWFqb3I7XG5cblxuICAgIGNvbnN0IHtpZH0gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lLCAnbGF0ZXN0Jyk7XG5cbiAgICAvLyBJZiBhIG5ldyBtYWpvciB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCBhbmQgYmVjb21lcyB0aGUgXCJsYXRlc3RcIiByZWxlYXNlLXRyYWluLCB3ZSBuZWVkXG4gICAgLy8gdG8gc2V0IHRoZSBMVFMgbnBtIGRpc3QgdGFnIGZvciB0aGUgcHJldmlvdXMgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gKHRoZSBjdXJyZW50IHBhdGNoKS5cbiAgICBpZiAoaXNOZXdNYWpvcikge1xuICAgICAgY29uc3QgcHJldmlvdXNQYXRjaCA9IHRoaXMuYWN0aXZlLmxhdGVzdDtcbiAgICAgIGNvbnN0IGx0c1RhZ0ZvclBhdGNoID0gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IocHJldmlvdXNQYXRjaC52ZXJzaW9uLm1ham9yKTtcblxuICAgICAgLy8gSW5zdGVhZCBvZiBkaXJlY3RseSBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWdzLCB3ZSBpbnZva2UgdGhlIG5nLWRldiBjb21tYW5kIGZvclxuICAgICAgLy8gc2V0dGluZyB0aGUgTlBNIGRpc3QgdGFnIHRvIHRoZSBzcGVjaWZpZWQgdmVyc2lvbi4gV2UgZG8gdGhpcyBiZWNhdXNlIHJlbGVhc2UgTlBNXG4gICAgICAvLyBwYWNrYWdlcyBjb3VsZCBiZSBkaWZmZXJlbnQgaW4gdGhlIHByZXZpb3VzIHBhdGNoIGJyYW5jaCwgYW5kIHdlIHdhbnQgdG8gc2V0IHRoZVxuICAgICAgLy8gTFRTIHRhZyBmb3IgYWxsIHBhY2thZ2VzIHBhcnQgb2YgdGhlIGxhc3QgbWFqb3IuIEl0IHdvdWxkIG5vdCBiZSBwb3NzaWJsZSB0byBzZXQgdGhlXG4gICAgICAvLyBOUE0gZGlzdCB0YWcgZm9yIG5ldyBwYWNrYWdlcyBwYXJ0IG9mIHRoZSByZWxlYXNlZCBtYWpvciwgbm9yIHdvdWxkIGl0IGJlIGFjY2VwdGFibGVcbiAgICAgIC8vIHRvIHNraXAgdGhlIExUUyB0YWcgZm9yIHBhY2thZ2VzIHdoaWNoIGFyZSBubyBsb25nZXIgcGFydCBvZiB0aGUgbmV3IG1ham9yLlxuICAgICAgYXdhaXQgdGhpcy5jaGVja291dFVwc3RyZWFtQnJhbmNoKHByZXZpb3VzUGF0Y2guYnJhbmNoTmFtZSk7XG4gICAgICBhd2FpdCBpbnZva2VZYXJuSW5zdGFsbENvbW1hbmQodGhpcy5wcm9qZWN0RGlyKTtcbiAgICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKGx0c1RhZ0ZvclBhdGNoLCBwcmV2aW91c1BhdGNoLnZlcnNpb24pO1xuICAgIH1cblxuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBzdGFibGUgdmVyc2lvbiBvZiB0aGUgcmVsZWFzZSBjYW5kaWRhdGUgcmVsZWFzZS10cmFpbi4gKi9cbiAgcHJpdmF0ZSBfY29tcHV0ZU5ld1ZlcnNpb24oKTogc2VtdmVyLlNlbVZlciB7XG4gICAgY29uc3Qge3ZlcnNpb259ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgcmV0dXJuIHNlbXZlci5wYXJzZShgJHt2ZXJzaW9uLm1ham9yfS4ke3ZlcnNpb24ubWlub3J9LiR7dmVyc2lvbi5wYXRjaH1gKSE7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSBzdGFibGUgdmVyc2lvbiBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHkgaW4gdGhlXG4gICAgLy8gcmVsZWFzZS1jYW5kaWRhdGUgcGhhc2UuIE5vdGU6IEl0IGlzIG5vdCBwb3NzaWJsZSB0byBkaXJlY3RseSByZWxlYXNlIGZyb21cbiAgICAvLyBmZWF0dXJlLWZyZWV6ZSBwaGFzZSBpbnRvIGEgc3RhYmxlIHZlcnNpb24uXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmXG4gICAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ3JjJztcbiAgfVxufVxuIl19