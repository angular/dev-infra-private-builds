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
                var branchName, newVersion, _a, id, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            branchName = this.active.releaseCandidate.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            _a = _b.sent(), id = _a.pullRequest.id, releaseNotes = _a.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LXJlbGVhc2UtY2FuZGlkYXRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvcHVibGlzaC9hY3Rpb25zL2N1dC1yZWxlYXNlLWNhbmRpZGF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gsdUZBQXNEO0lBQ3RELDhFQUF5QztJQUV6Qzs7O09BR0c7SUFDSDtRQUErQyxxREFBYTtRQUE1RDtZQUFBLHFFQTBCQztZQXpCUyxpQkFBVyxHQUFHLHNCQUFTLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDOztRQXlCN0YsQ0FBQztRQXZCTyxrREFBYyxHQUFwQjs7OztvQkFDUSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsc0JBQU8sbUVBQWlFLFVBQVUsT0FBSSxFQUFDOzs7U0FDeEY7UUFFSywyQ0FBTyxHQUFiOzs7Ozs7NEJBQ1MsVUFBVSxHQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWlCLFdBQWpDLENBQWtDOzRCQUM3QyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs0QkFHaEMscUJBQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBRDlELEtBQ0YsU0FBZ0UsRUFEL0MsRUFBRSxvQkFBQSxFQUFHLFlBQVksa0JBQUE7NEJBR3RDLHFCQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsRUFBQTs7NEJBQTNDLFNBQTJDLENBQUM7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsRUFBQTs7NEJBQTVELFNBQTRELENBQUM7NEJBQzdELHFCQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUF0RSxTQUFzRSxDQUFDOzs7OztTQUN4RTtRQUVZLGtDQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLHVFQUF1RTtvQkFDdkUsK0JBQStCO29CQUMvQixzQkFBTyxNQUFNLENBQUMsZ0JBQWdCLEtBQUssSUFBSTs0QkFDbkMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssTUFBTSxFQUFDOzs7U0FDOUQ7UUFDSCxnQ0FBQztJQUFELENBQUMsQUExQkQsQ0FBK0MsdUJBQWEsR0EwQjNEO0lBMUJZLDhEQUF5QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBDdXRzIHRoZSBmaXJzdCByZWxlYXNlIGNhbmRpZGF0ZSBmb3IgYSByZWxlYXNlLXRyYWluIGN1cnJlbnRseSBpbiB0aGVcbiAqIGZlYXR1cmUtZnJlZXplIHBoYXNlLiBUaGUgdmVyc2lvbiBpcyBidW1wZWQgZnJvbSBgbmV4dGAgdG8gYHJjLjBgLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0UmVsZWFzZUNhbmRpZGF0ZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gc2VtdmVySW5jKHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhLnZlcnNpb24sICdwcmVyZWxlYXNlJywgJ3JjJyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBmaXJzdCByZWxlYXNlLWNhbmRpZGF0ZSBmb3IgdGhlIGZlYXR1cmUtZnJlZXplIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUhO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgY29uc3Qge3B1bGxSZXF1ZXN0OiB7aWR9LCByZWxlYXNlTm90ZXN9ID1cbiAgICAgICAgYXdhaXQgdGhpcy5jaGVja291dEJyYW5jaEFuZFN0YWdlVmVyc2lvbihuZXdWZXJzaW9uLCBicmFuY2hOYW1lKTtcblxuICAgIGF3YWl0IHRoaXMud2FpdEZvclB1bGxSZXF1ZXN0VG9CZU1lcmdlZChpZCk7XG4gICAgYXdhaXQgdGhpcy5idWlsZEFuZFB1Ymxpc2gocmVsZWFzZU5vdGVzLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gQSByZWxlYXNlLWNhbmRpZGF0ZSBjYW4gYmUgY3V0IGZvciBhbiBhY3RpdmUgcmVsZWFzZS10cmFpbiBjdXJyZW50bHlcbiAgICAvLyBpbiB0aGUgZmVhdHVyZS1mcmVlemUgcGhhc2UuXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlICE9PSBudWxsICYmXG4gICAgICAgIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlLnZlcnNpb24ucHJlcmVsZWFzZVswXSA9PT0gJ25leHQnO1xuICB9XG59XG4iXX0=