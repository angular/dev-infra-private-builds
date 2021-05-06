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
        define("@angular/dev-infra-private/release/publish/actions/cut-release-candidate", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning/inc-semver", "@angular/dev-infra-private/release/publish/actions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutReleaseCandidateAction = void 0;
    var tslib_1 = require("tslib");
    var inc_semver_1 = require("@angular/dev-infra-private/release/versioning/inc-semver");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    /**
     * Cuts the first release candidate for a release-train currently in the
     * feature-freeze phase. The version is bumped from `next` to `rc.0`.
     */
    var CutReleaseCandidateAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutReleaseCandidateAction, _super);
        function CutReleaseCandidateAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = inc_semver_1.semverInc(_this.active.releaseCandidate.version, 'prerelease', 'rc');
            return _this;
        }
        CutReleaseCandidateAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var newVersion;
                return tslib_1.__generator(this, function (_a) {
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Cut a first release-candidate for the feature-freeze branch (v" + newVersion + ")."];
                });
            });
        };
        CutReleaseCandidateAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, id;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            id = (_a.sent()).id;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'next')];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(newVersion, branchName)];
                        case 4:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        CutReleaseCandidateAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // A release-candidate can be cut for an active release-train currently
                    // in the feature-freeze phase.
                    return [2 /*return*/, active.releaseCandidate !== null &&
                            active.releaseCandidate.version.prerelease[0] === 'next'];
                });
            });
        };
        return CutReleaseCandidateAction;
    }(actions_1.ReleaseAction));
    exports.CutReleaseCandidateAction = CutReleaseCandidateAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9hY3Rpb25zL2N1dC1yZWxlYXNlLWNhbmRpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gsdUZBQXNEO0lBQ3RELDhFQUF5QztJQUV6Qzs7O09BR0c7SUFDSDtRQUErQyxxREFBYTtRQUE1RDtZQUFBLHFFQXlCQztZQXhCUyxpQkFBVyxHQUFHLHNCQUFTLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDOztRQXdCN0YsQ0FBQztRQXRCTyxrREFBYyxHQUFwQjs7OztvQkFDUSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsc0JBQU8sbUVBQWlFLFVBQVUsT0FBSSxFQUFDOzs7U0FDeEY7UUFFSywyQ0FBTyxHQUFiOzs7Ozs7NEJBQ1MsVUFBVSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLFdBQWpDLENBQWtDOzRCQUM3QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs0QkFFdkIscUJBQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXRFLEVBQUUsR0FBSSxDQUFBLFNBQWdFLENBQUEsR0FBcEU7NEJBRVQscUJBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFBOzs0QkFBM0MsU0FBMkMsQ0FBQzs0QkFDNUMscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFBMUQsU0FBMEQsQ0FBQzs0QkFDM0QscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXBFLFNBQW9FLENBQUM7Ozs7O1NBQ3RFO1FBRVksa0NBQVEsR0FBckIsVUFBc0IsTUFBMkI7OztvQkFDL0MsdUVBQXVFO29CQUN2RSwrQkFBK0I7b0JBQy9CLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJOzRCQUNuQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxNQUFNLEVBQUM7OztTQUM5RDtRQUNILGdDQUFDO0lBQUQsQ0FBQyxBQXpCRCxDQUErQyx1QkFBYSxHQXlCM0Q7SUF6QlksOERBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9hY3RpdmUtcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvaW5jLXNlbXZlcic7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIEN1dHMgdGhlIGZpcnN0IHJlbGVhc2UgY2FuZGlkYXRlIGZvciBhIHJlbGVhc2UtdHJhaW4gY3VycmVudGx5IGluIHRoZVxuICogZmVhdHVyZS1mcmVlemUgcGhhc2UuIFRoZSB2ZXJzaW9uIGlzIGJ1bXBlZCBmcm9tIGBuZXh0YCB0byBgcmMuMGAuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXRSZWxlYXNlQ2FuZGlkYXRlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIHByaXZhdGUgX25ld1ZlcnNpb24gPSBzZW12ZXJJbmModGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSEudmVyc2lvbiwgJ3ByZXJlbGVhc2UnLCAncmMnKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIGZpcnN0IHJlbGVhc2UtY2FuZGlkYXRlIGZvciB0aGUgZmVhdHVyZS1mcmVlemUgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSE7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7aWR9ID0gYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gobmV3VmVyc2lvbiwgYnJhbmNoTmFtZSwgJ25leHQnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcbiAgfVxuXG4gIHN0YXRpYyBhc3luYyBpc0FjdGl2ZShhY3RpdmU6IEFjdGl2ZVJlbGVhc2VUcmFpbnMpIHtcbiAgICAvLyBBIHJlbGVhc2UtY2FuZGlkYXRlIGNhbiBiZSBjdXQgZm9yIGFuIGFjdGl2ZSByZWxlYXNlLXRyYWluIGN1cnJlbnRseVxuICAgIC8vIGluIHRoZSBmZWF0dXJlLWZyZWV6ZSBwaGFzZS5cbiAgICByZXR1cm4gYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgIT09IG51bGwgJiZcbiAgICAgICAgYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUudmVyc2lvbi5wcmVyZWxlYXNlWzBdID09PSAnbmV4dCc7XG4gIH1cbn1cbiJdfQ==