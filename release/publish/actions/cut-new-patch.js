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
        define("@angular/dev-infra-private/release/publish/actions/cut-new-patch", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning/inc-semver", "@angular/dev-infra-private/release/publish/actions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutNewPatchAction = void 0;
    var tslib_1 = require("tslib");
    var inc_semver_1 = require("@angular/dev-infra-private/release/versioning/inc-semver");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    /**
     * Release action that cuts a new patch release for the current latest release-train version
     * branch (i.e. the patch branch). The patch segment is incremented. The changelog is generated
     * for the new patch version, but also needs to be cherry-picked into the next development branch.
     */
    var CutNewPatchAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutNewPatchAction, _super);
        function CutNewPatchAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._newVersion = inc_semver_1.semverInc(_this.active.latest.version, 'patch');
            return _this;
        }
        CutNewPatchAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion;
                return tslib_1.__generator(this, function (_a) {
                    branchName = this.active.latest.branchName;
                    newVersion = this._newVersion;
                    return [2 /*return*/, "Cut a new patch release for the \"" + branchName + "\" branch (v" + newVersion + ")."];
                });
            });
        };
        CutNewPatchAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion, id;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this.active.latest.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            id = (_a.sent()).id;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'latest')];
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
        CutNewPatchAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Patch versions can be cut at any time. See:
                    // https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A#Release-prompt-options.
                    return [2 /*return*/, true];
                });
            });
        };
        return CutNewPatchAction;
    }(actions_1.ReleaseAction));
    exports.CutNewPatchAction = CutNewPatchAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5ldy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV3LXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCx1RkFBc0Q7SUFDdEQsOEVBQXlDO0lBRXpDOzs7O09BSUc7SUFDSDtRQUF1Qyw2Q0FBYTtRQUFwRDtZQUFBLHFFQXlCQztZQXhCUyxpQkFBVyxHQUFHLHNCQUFTLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztRQXdCdkUsQ0FBQztRQXRCTywwQ0FBYyxHQUFwQjs7OztvQkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQXRCLENBQXVCO29CQUNsQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsc0JBQU8sdUNBQW9DLFVBQVUsb0JBQWMsVUFBVSxPQUFJLEVBQUM7OztTQUNuRjtRQUVLLG1DQUFPLEdBQWI7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQXRCLENBQXVCOzRCQUNsQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs0QkFFdkIscUJBQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXRFLEVBQUUsR0FBSSxDQUFBLFNBQWdFLENBQUEsR0FBcEU7NEJBRVQscUJBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFBOzs0QkFBM0MsU0FBMkMsQ0FBQzs0QkFDNUMscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxFQUFBOzs0QkFBNUQsU0FBNEQsQ0FBQzs0QkFDN0QscUJBQU0sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBQXBFLFNBQW9FLENBQUM7Ozs7O1NBQ3RFO1FBRVksMEJBQVEsR0FBckIsVUFBc0IsTUFBMkI7OztvQkFDL0MsOENBQThDO29CQUM5QyxtRUFBbUU7b0JBQ25FLHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFDSCx3QkFBQztJQUFELENBQUMsQUF6QkQsQ0FBdUMsdUJBQWEsR0F5Qm5EO0lBekJZLDhDQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FjdGl2ZVJlbGVhc2VUcmFpbnN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvYWN0aXZlLXJlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBuZXcgcGF0Y2ggcmVsZWFzZSBmb3IgdGhlIGN1cnJlbnQgbGF0ZXN0IHJlbGVhc2UtdHJhaW4gdmVyc2lvblxuICogYnJhbmNoIChpLmUuIHRoZSBwYXRjaCBicmFuY2gpLiBUaGUgcGF0Y2ggc2VnbWVudCBpcyBpbmNyZW1lbnRlZC4gVGhlIGNoYW5nZWxvZyBpcyBnZW5lcmF0ZWRcbiAqIGZvciB0aGUgbmV3IHBhdGNoIHZlcnNpb24sIGJ1dCBhbHNvIG5lZWRzIHRvIGJlIGNoZXJyeS1waWNrZWQgaW50byB0aGUgbmV4dCBkZXZlbG9wbWVudCBicmFuY2guXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXROZXdQYXRjaEFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBwcml2YXRlIF9uZXdWZXJzaW9uID0gc2VtdmVySW5jKHRoaXMuYWN0aXZlLmxhdGVzdC52ZXJzaW9uLCAncGF0Y2gnKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBuZXcgcGF0Y2ggcmVsZWFzZSBmb3IgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuYWN0aXZlLmxhdGVzdDtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gdGhpcy5fbmV3VmVyc2lvbjtcblxuICAgIGNvbnN0IHtpZH0gPSBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lLCAnbGF0ZXN0Jyk7XG4gICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gobmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoYWN0aXZlOiBBY3RpdmVSZWxlYXNlVHJhaW5zKSB7XG4gICAgLy8gUGF0Y2ggdmVyc2lvbnMgY2FuIGJlIGN1dCBhdCBhbnkgdGltZS4gU2VlOlxuICAgIC8vIGh0dHBzOi8vaGFja21kLmlvLzJMZThsZXEwUzZHX1I1VkVWVE5LOUEjUmVsZWFzZS1wcm9tcHQtb3B0aW9ucy5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuIl19