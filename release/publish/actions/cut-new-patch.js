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
                var branchName, newVersion, _a, id, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            branchName = this.active.latest.branchName;
                            newVersion = this._newVersion;
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 1:
                            _a = _b.sent(), id = _a.pullRequest.id, releaseNotes = _a.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 2:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, branchName, 'latest')];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5ldy1wYXRjaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV3LXBhdGNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCx1RkFBc0Q7SUFDdEQsOEVBQXlDO0lBRXpDOzs7O09BSUc7SUFDSDtRQUF1Qyw2Q0FBYTtRQUFwRDtZQUFBLHFFQTBCQztZQXpCUyxpQkFBVyxHQUFHLHNCQUFTLENBQUMsS0FBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDOztRQXlCdkUsQ0FBQztRQXZCTywwQ0FBYyxHQUFwQjs7OztvQkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQXRCLENBQXVCO29CQUNsQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztvQkFDcEMsc0JBQU8sdUNBQW9DLFVBQVUsb0JBQWMsVUFBVSxPQUFJLEVBQUM7OztTQUNuRjtRQUVLLG1DQUFPLEdBQWI7Ozs7Ozs0QkFDUyxVQUFVLEdBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLFdBQXRCLENBQXVCOzRCQUNsQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQzs0QkFHaEMscUJBQU0sSUFBSSxDQUFDLDZCQUE2QixDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBQTs7NEJBRDlELEtBQ0YsU0FBZ0UsRUFEL0MsRUFBRSxvQkFBQSxFQUFHLFlBQVksa0JBQUE7NEJBR3RDLHFCQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxFQUFFLENBQUMsRUFBQTs7NEJBQTNDLFNBQTJDLENBQUM7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsRUFBQTs7NEJBQTlELFNBQThELENBQUM7NEJBQy9ELHFCQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUF0RSxTQUFzRSxDQUFDOzs7OztTQUN4RTtRQUVZLDBCQUFRLEdBQXJCLFVBQXNCLE1BQTJCOzs7b0JBQy9DLDhDQUE4QztvQkFDOUMsbUVBQW1FO29CQUNuRSxzQkFBTyxJQUFJLEVBQUM7OztTQUNiO1FBQ0gsd0JBQUM7SUFBRCxDQUFDLEFBMUJELENBQXVDLHVCQUFhLEdBMEJuRDtJQTFCWSw4Q0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIHRoZSBjdXJyZW50IGxhdGVzdCByZWxlYXNlLXRyYWluIHZlcnNpb25cbiAqIGJyYW5jaCAoaS5lLiB0aGUgcGF0Y2ggYnJhbmNoKS4gVGhlIHBhdGNoIHNlZ21lbnQgaXMgaW5jcmVtZW50ZWQuIFRoZSBjaGFuZ2Vsb2cgaXMgZ2VuZXJhdGVkXG4gKiBmb3IgdGhlIG5ldyBwYXRjaCB2ZXJzaW9uLCBidXQgYWxzbyBuZWVkcyB0byBiZSBjaGVycnktcGlja2VkIGludG8gdGhlIG5leHQgZGV2ZWxvcG1lbnQgYnJhbmNoLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0TmV3UGF0Y2hBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbiA9IHNlbXZlckluYyh0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbiwgJ3BhdGNoJyk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5hY3RpdmUubGF0ZXN0O1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IHBhdGNoIHJlbGVhc2UgZm9yIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLmFjdGl2ZS5sYXRlc3Q7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUsICdsYXRlc3QnKTtcbiAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIFBhdGNoIHZlcnNpb25zIGNhbiBiZSBjdXQgYXQgYW55IHRpbWUuIFNlZTpcbiAgICAvLyBodHRwczovL2hhY2ttZC5pby8yTGU4bGVxMFM2R19SNVZFVlROSzlBI1JlbGVhc2UtcHJvbXB0LW9wdGlvbnMuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==