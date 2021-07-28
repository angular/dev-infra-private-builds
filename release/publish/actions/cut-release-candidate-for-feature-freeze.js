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
        define("@angular/dev-infra-private/release/publish/actions/cut-release-candidate-for-feature-freeze", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/semver", "@angular/dev-infra-private/release/publish/actions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutReleaseCandidateForFeatureFreezeAction = void 0;
    var tslib_1 = require("tslib");
    var semver_1 = require("@angular/dev-infra-private/utils/semver");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    /**
     * Cuts the first release candidate for a release-train currently in the
     * feature-freeze phase. The version is bumped from `next` to `rc.0`.
     */
    var CutReleaseCandidateForFeatureFreezeAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutReleaseCandidateForFeatureFreezeAction, _super);
        function CutReleaseCandidateForFeatureFreezeAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = semver_1.semverInc(_this.active.releaseCandidate.version, 'prerelease', 'rc');
            return _this;
        }
        CutReleaseCandidateForFeatureFreezeAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion;
                return tslib_1.__generator(this, function (_a) {
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Cut a first release-candidate for the feature-freeze branch (v" + newVersion + ")."];
                });
            });
        };
        CutReleaseCandidateForFeatureFreezeAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, _a, pullRequest, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            _a = _b.sent(), pullRequest = _a.pullRequest, releaseNotes = _a.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(pullRequest)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, branchName, 'next')];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName)];
                        case 4:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        CutReleaseCandidateForFeatureFreezeAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // A release-candidate can be cut for an active release-train currently
                    // in the feature-freeze phase.
                    return [2 /*return*/, active.releaseCandidate !== null &&
                            active.releaseCandidate.version.prerelease[0] === 'next'];
                });
            });
        };
        return CutReleaseCandidateForFeatureFreezeAction;
    }(actions_1.ReleaseAction));
    exports.CutReleaseCandidateForFeatureFreezeAction = CutReleaseCandidateForFeatureFreezeAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLWZvci1mZWF0dXJlLWZyZWV6ZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtcmVsZWFzZS1jYW5kaWRhdGUtZm9yLWZlYXR1cmUtZnJlZXplLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCxrRUFBZ0Q7SUFFaEQsOEVBQXlDO0lBRXpDOzs7T0FHRztJQUNIO1FBQStELHFFQUFhO1FBQTVFO1lBQUEscUVBMEJDO1lBekJTLGlCQUFXLEdBQUcsa0JBQVMsQ0FBQyxLQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7O1FBeUI3RixDQUFDO1FBdkJnQixrRUFBYyxHQUE3Qjs7OztvQkFDUSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsc0JBQU8sbUVBQWlFLFVBQVUsT0FBSSxFQUFDOzs7U0FDeEY7UUFFYywyREFBTyxHQUF0Qjs7Ozs7OzRCQUNTLFVBQVUsR0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFpQixXQUFqQyxDQUFrQzs0QkFDN0MsVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7NEJBR2hDLHFCQUFNLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUQ5RCxLQUNGLFNBQWdFLEVBRDdELFdBQVcsaUJBQUEsRUFBRSxZQUFZLGtCQUFBOzRCQUdoQyxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsV0FBVyxDQUFDLEVBQUE7OzRCQUFwRCxTQUFvRCxDQUFDOzRCQUNyRCxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUE7OzRCQUE1RCxTQUE0RCxDQUFDOzRCQUM3RCxxQkFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsU0FBc0UsQ0FBQzs7Ozs7U0FDeEU7UUFFcUIsa0RBQVEsR0FBOUIsVUFBK0IsTUFBMkI7OztvQkFDeEQsdUVBQXVFO29CQUN2RSwrQkFBK0I7b0JBQy9CLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJOzRCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUM7OztTQUM5RDtRQUNILGdEQUFDO0lBQUQsQ0FBQyxBQTFCRCxDQUErRCx1QkFBYSxHQTBCM0U7SUExQlksOEZBQXlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi8uLi91dGlscy9zZW12ZXInO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIEN1dHMgdGhlIGZpcnN0IHJlbGVhc2UgY2FuZGlkYXRlIGZvciBhIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICogZmVhdHVyZS1mcmVlemUgcGhhc2UuIFRoZSB2ZXJzaW9uIGlzIGJ1bXBlZCBmcm9tIGBuZXh0YCB0byBgcmMuMGAuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRSZWxlYXNlQ2FuZGlkYXRlRm9yRmVhdHVyZUZyZWV6ZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gc2VtdmVySW5jKHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhLnZlcnNpb24sICdwcmVyZWxlYXNlJywgJ3JjJyk7XG5cbiAgb3ZlcnJpZGUgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBmaXJzdCByZWxlYXNlLWNhbmRpZGF0ZSBmb3IgdGhlIGZlYXR1cmUtZnJlZXplIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgY29uc3Qge3B1bGxSZXF1ZXN0LCByZWxlYXNlTm90ZXN9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChwdWxsUmVxdWVzdCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICBzdGF0aWMgb3ZlcnJpZGUgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSByZWxlYXNlLWNhbmRpZGF0ZSBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHlcbiAgICAvLyBpbiB0aGUgZmVhdHVyZS1mcmVlemUgcGhhc2UuXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmXG4gICAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuICB9XG59XG4iXX0=