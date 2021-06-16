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
                            // If a new major version is published, we publish to the `next` NPM dist tag temporarily.
                            // We do this because for major versions, we want all main Angular projects to have their
                            // new major become available at the same time. Publishing immediately to the `latest` NPM
                            // dist tag could cause inconsistent versions when users install packages with `@latest`.
                            // For example: Consider Angular Framework releases v12. CLI and Components would need to
                            // wait for that release to complete. Once done, they can update their dependencies to point
                            // to v12. Afterwards they could start the release process. In the meanwhile though, the FW
                            // dependencies were already available as `@latest`, so users could end up installing v12 while
                            // still having the older (but currently still latest) CLI version that is incompatible.
                            // The major release can be re-tagged to `latest` through a separate release action.
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, branchName, isNewMajor ? 'next' : 'latest')];
                        case 3:
                            // If a new major version is published, we publish to the `next` NPM dist tag temporarily.
                            // We do this because for major versions, we want all main Angular projects to have their
                            // new major become available at the same time. Publishing immediately to the `latest` NPM
                            // dist tag could cause inconsistent versions when users install packages with `@latest`.
                            // For example: Consider Angular Framework releases v12. CLI and Components would need to
                            // wait for that release to complete. Once done, they can update their dependencies to point
                            // to v12. Afterwards they could start the release process. In the meanwhile though, the FW
                            // dependencies were already available as `@latest`, so users could end up installing v12 while
                            // still having the older (but currently still latest) CLI version that is incompatible.
                            // The major release can be re-tagged to `latest` through a separate release action.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtc3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMscUdBQTJFO0lBQzNFLDhFQUF5QztJQUN6QyxrR0FBdUY7SUFFdkY7OztPQUdHO0lBQ0g7UUFBcUMsMkNBQWE7UUFBbEQ7WUFBQSxxRUErREM7WUE5RFMsaUJBQVcsR0FBRyxLQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzs7UUE4RGxELENBQUM7UUE1RE8sd0NBQWMsR0FBcEI7Ozs7b0JBQ1EsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7b0JBQ3BDLHNCQUFPLDZEQUEyRCxVQUFVLE9BQUksRUFBQzs7O1NBQ2xGO1FBRUssaUNBQU8sR0FBYjs7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsV0FBakMsQ0FBa0M7NEJBQzdDLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDOzRCQUM5QixVQUFVLEdBQUcsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQiwwQ0FBRSxPQUFPLENBQUM7NEJBR3JELHFCQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUQ5RCxLQUNGLFNBQWdFLEVBRC9DLEVBQUUsb0JBQUEsRUFBRyxZQUFZLGtCQUFBOzRCQUd0QyxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUE7OzRCQUEzQyxTQUEyQyxDQUFDOzRCQUU1QywwRkFBMEY7NEJBQzFGLHlGQUF5Rjs0QkFDekYsMEZBQTBGOzRCQUMxRix5RkFBeUY7NEJBQ3pGLHlGQUF5Rjs0QkFDekYsNEZBQTRGOzRCQUM1RiwyRkFBMkY7NEJBQzNGLCtGQUErRjs0QkFDL0Ysd0ZBQXdGOzRCQUN4RixvRkFBb0Y7NEJBQ3BGLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUE7OzRCQVZwRiwwRkFBMEY7NEJBQzFGLHlGQUF5Rjs0QkFDekYsMEZBQTBGOzRCQUMxRix5RkFBeUY7NEJBQ3pGLHlGQUF5Rjs0QkFDekYsNEZBQTRGOzRCQUM1RiwyRkFBMkY7NEJBQzNGLCtGQUErRjs0QkFDL0Ysd0ZBQXdGOzRCQUN4RixvRkFBb0Y7NEJBQ3BGLFNBQW9GLENBQUM7aUNBSWpGLFVBQVUsRUFBVix3QkFBVTs0QkFDTixhQUFhLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7NEJBQ25DLGNBQWMsR0FBRywyQ0FBdUIsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzRCQUU1RSxrRkFBa0Y7NEJBQ2xGLG9GQUFvRjs0QkFDcEYsbUZBQW1GOzRCQUNuRix1RkFBdUY7NEJBQ3ZGLHVGQUF1Rjs0QkFDdkYsOEVBQThFOzRCQUM5RSxxQkFBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFOM0Qsa0ZBQWtGOzRCQUNsRixvRkFBb0Y7NEJBQ3BGLG1GQUFtRjs0QkFDbkYsdUZBQXVGOzRCQUN2Rix1RkFBdUY7NEJBQ3ZGLDhFQUE4RTs0QkFDOUUsU0FBMkQsQ0FBQzs0QkFDNUQscUJBQU0sNENBQXdCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFBOzs0QkFBL0MsU0FBK0MsQ0FBQzs0QkFDaEQscUJBQU0sMkNBQXVCLENBQUMsY0FBYyxFQUFFLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBQTs7NEJBQXBFLFNBQW9FLENBQUM7O2dDQUd2RSxxQkFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsU0FBc0UsQ0FBQzs7Ozs7U0FDeEU7UUFFRCwwRUFBMEU7UUFDbEUsNENBQWtCLEdBQTFCO1lBQ1MsSUFBQSxPQUFPLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsUUFBakMsQ0FBa0M7WUFDaEQsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQUssU0FBSSxPQUFPLENBQUMsS0FBTyxDQUFFLENBQUM7UUFDN0UsQ0FBQztRQUVZLHdCQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLDJFQUEyRTtvQkFDM0UsNkVBQTZFO29CQUM3RSw4Q0FBOEM7b0JBQzlDLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJOzRCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUM7OztTQUM1RDtRQUNILHNCQUFDO0lBQUQsQ0FBQyxBQS9ERCxDQUFxQyx1QkFBYSxHQStEakQ7SUEvRFksMENBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9sb25nLXRlcm0tc3VwcG9ydCc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgc3RhYmxlIHZlcnNpb24gZm9yIHRoZSBjdXJyZW50IHJlbGVhc2UtdHJhaW4gaW4gdGhlIHJlbGVhc2VcbiAqIGNhbmRpZGF0ZSBwaGFzZS4gVGhlIHByZS1yZWxlYXNlIHJlbGVhc2UtY2FuZGlkYXRlIHZlcnNpb24gbGFiZWwgaXMgcmVtb3ZlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dFN0YWJsZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIHN0YWJsZSByZWxlYXNlIGZvciB0aGUgcmVsZWFzZS1jYW5kaWRhdGUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgY29uc3QgaXNOZXdNYWpvciA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGU/LmlzTWFqb3I7XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcblxuICAgIC8vIElmIGEgbmV3IG1ham9yIHZlcnNpb24gaXMgcHVibGlzaGVkLCB3ZSBwdWJsaXNoIHRvIHRoZSBgbmV4dGAgTlBNIGRpc3QgdGFnIHRlbXBvcmFyaWx5LlxuICAgIC8vIFdlIGRvIHRoaXMgYmVjYXVzZSBmb3IgbWFqb3IgdmVyc2lvbnMsIHdlIHdhbnQgYWxsIG1haW4gQW5ndWxhciBwcm9qZWN0cyB0byBoYXZlIHRoZWlyXG4gICAgLy8gbmV3IG1ham9yIGJlY29tZSBhdmFpbGFibGUgYXQgdGhlIHNhbWUgdGltZS4gUHVibGlzaGluZyBpbW1lZGlhdGVseSB0byB0aGUgYGxhdGVzdGAgTlBNXG4gICAgLy8gZGlzdCB0YWcgY291bGQgY2F1c2UgaW5jb25zaXN0ZW50IHZlcnNpb25zIHdoZW4gdXNlcnMgaW5zdGFsbCBwYWNrYWdlcyB3aXRoIGBAbGF0ZXN0YC5cbiAgICAvLyBGb3IgZXhhbXBsZTogQ29uc2lkZXIgQW5ndWxhciBGcmFtZXdvcmsgcmVsZWFzZXMgdjEyLiBDTEkgYW5kIENvbXBvbmVudHMgd291bGQgbmVlZCB0b1xuICAgIC8vIHdhaXQgZm9yIHRoYXQgcmVsZWFzZSB0byBjb21wbGV0ZS4gT25jZSBkb25lLCB0aGV5IGNhbiB1cGRhdGUgdGhlaXIgZGVwZW5kZW5jaWVzIHRvIHBvaW50XG4gICAgLy8gdG8gdjEyLiBBZnRlcndhcmRzIHRoZXkgY291bGQgc3RhcnQgdGhlIHJlbGVhc2UgcHJvY2Vzcy4gSW4gdGhlIG1lYW53aGlsZSB0aG91Z2gsIHRoZSBGV1xuICAgIC8vIGRlcGVuZGVuY2llcyB3ZXJlIGFscmVhZHkgYXZhaWxhYmxlIGFzIGBAbGF0ZXN0YCwgc28gdXNlcnMgY291bGQgZW5kIHVwIGluc3RhbGxpbmcgdjEyIHdoaWxlXG4gICAgLy8gc3RpbGwgaGF2aW5nIHRoZSBvbGRlciAoYnV0IGN1cnJlbnRseSBzdGlsbCBsYXRlc3QpIENMSSB2ZXJzaW9uIHRoYXQgaXMgaW5jb21wYXRpYmxlLlxuICAgIC8vIFRoZSBtYWpvciByZWxlYXNlIGNhbiBiZSByZS10YWdnZWQgdG8gYGxhdGVzdGAgdGhyb3VnaCBhIHNlcGFyYXRlIHJlbGVhc2UgYWN0aW9uLlxuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgaXNOZXdNYWpvciA/ICduZXh0JyA6ICdsYXRlc3QnKTtcblxuICAgIC8vIElmIGEgbmV3IG1ham9yIHZlcnNpb24gaXMgcHVibGlzaGVkIGFuZCBiZWNvbWVzIHRoZSBcImxhdGVzdFwiIHJlbGVhc2UtdHJhaW4sIHdlIG5lZWRcbiAgICAvLyB0byBzZXQgdGhlIExUUyBucG0gZGlzdCB0YWcgZm9yIHRoZSBwcmV2aW91cyBsYXRlc3QgcmVsZWFzZS10cmFpbiAodGhlIGN1cnJlbnQgcGF0Y2gpLlxuICAgIGlmIChpc05ld01ham9yKSB7XG4gICAgICBjb25zdCBwcmV2aW91c1BhdGNoID0gdGhpcy5hY3RpdmUubGF0ZXN0O1xuICAgICAgY29uc3QgbHRzVGFnRm9yUGF0Y2ggPSBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcihwcmV2aW91c1BhdGNoLnZlcnNpb24ubWFqb3IpO1xuXG4gICAgICAvLyBJbnN0ZWFkIG9mIGRpcmVjdGx5IHNldHRpbmcgdGhlIE5QTSBkaXN0IHRhZ3MsIHdlIGludm9rZSB0aGUgbmctZGV2IGNvbW1hbmQgZm9yXG4gICAgICAvLyBzZXR0aW5nIHRoZSBOUE0gZGlzdCB0YWcgdG8gdGhlIHNwZWNpZmllZCB2ZXJzaW9uLiBXZSBkbyB0aGlzIGJlY2F1c2UgcmVsZWFzZSBOUE1cbiAgICAgIC8vIHBhY2thZ2VzIGNvdWxkIGJlIGRpZmZlcmVudCBpbiB0aGUgcHJldmlvdXMgcGF0Y2ggYnJhbmNoLCBhbmQgd2Ugd2FudCB0byBzZXQgdGhlXG4gICAgICAvLyBMVFMgdGFnIGZvciBhbGwgcGFja2FnZXMgcGFydCBvZiB0aGUgbGFzdCBtYWpvci4gSXQgd291bGQgbm90IGJlIHBvc3NpYmxlIHRvIHNldCB0aGVcbiAgICAgIC8vIE5QTSBkaXN0IHRhZyBmb3IgbmV3IHBhY2thZ2VzIHBhcnQgb2YgdGhlIHJlbGVhc2VkIG1ham9yLCBub3Igd291bGQgaXQgYmUgYWNjZXB0YWJsZVxuICAgICAgLy8gdG8gc2tpcCB0aGUgTFRTIHRhZyBmb3IgcGFja2FnZXMgd2hpY2ggYXJlIG5vIGxvbmdlciBwYXJ0IG9mIHRoZSBuZXcgbWFqb3IuXG4gICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2gocHJldmlvdXNQYXRjaC5icmFuY2hOYW1lKTtcbiAgICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgICAgYXdhaXQgaW52b2tlU2V0TnBtRGlzdENvbW1hbmQobHRzVGFnRm9yUGF0Y2gsIHByZXZpb3VzUGF0Y2gudmVyc2lvbik7XG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lKTtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuZXcgc3RhYmxlIHZlcnNpb24gb2YgdGhlIHJlbGVhc2UgY2FuZGlkYXRlIHJlbGVhc2UtdHJhaW4uICovXG4gIHByaXZhdGUgX2NvbXB1dGVOZXdWZXJzaW9uKCk6IHNlbXZlci5TZW1WZXIge1xuICAgIGNvbnN0IHt2ZXJzaW9ufSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIHJldHVybiBzZW12ZXIucGFyc2UoYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS4ke3ZlcnNpb24ucGF0Y2h9YCkhO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIEEgc3RhYmxlIHZlcnNpb24gY2FuIGJlIGN1dCBmb3IgYW4gYWN0aXZlIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICAgIC8vIHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBOb3RlOiBJdCBpcyBub3QgcG9zc2libGUgdG8gZGlyZWN0bHkgcmVsZWFzZSBmcm9tXG4gICAgLy8gZmVhdHVyZS1mcmVlemUgcGhhc2UgaW50byBhIHN0YWJsZSB2ZXJzaW9uLlxuICAgIHJldHVybiBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSAhPT0gbnVsbCAmJlxuICAgICAgICBhY3RpdmUucmVsZWFzZUNhbmRpZGF0ZS52ZXJzaW9uLnByZXJlbGVhc2VbMF0gPT09ICdyYyc7XG4gIH1cbn1cbiJdfQ==