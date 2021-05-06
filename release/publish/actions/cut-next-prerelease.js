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
        define("@angular/dev-infra-private/release/publish/actions/cut-next-prerelease", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning/inc-semver", "@angular/dev-infra-private/release/versioning/next-prerelease-version", "@angular/dev-infra-private/release/publish/actions"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CutNextPrereleaseAction = void 0;
    var tslib_1 = require("tslib");
    var inc_semver_1 = require("@angular/dev-infra-private/release/versioning/inc-semver");
    var next_prerelease_version_1 = require("@angular/dev-infra-private/release/versioning/next-prerelease-version");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    /**
     * Release action that cuts a prerelease for the next branch. A version in the next
     * branch can have an arbitrary amount of next pre-releases.
     */
    var CutNextPrereleaseAction = /** @class */ (function (_super) {
        tslib_1.__extends(CutNextPrereleaseAction, _super);
        function CutNextPrereleaseAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /** Promise resolving with the new version if a NPM next pre-release is cut. */
            _this._newVersion = _this._computeNewVersion();
            return _this;
        }
        CutNextPrereleaseAction.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var branchName, newVersion;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            branchName = this._getActivePrereleaseTrain().branchName;
                            return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _a.sent();
                            return [2 /*return*/, "Cut a new next pre-release for the \"" + branchName + "\" branch (v" + newVersion + ")."];
                    }
                });
            });
        };
        CutNextPrereleaseAction.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var releaseTrain, branchName, newVersion, _a, id, releaseNotes;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            releaseTrain = this._getActivePrereleaseTrain();
                            branchName = releaseTrain.branchName;
                            return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _b.sent();
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 2:
                            _a = _b.sent(), id = _a.pullRequest.id, releaseNotes = _a.releaseNotes;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 3:
                            _b.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'next')];
                        case 4:
                            _b.sent();
                            if (!(releaseTrain !== this.active.next)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(releaseNotes, branchName)];
                        case 5:
                            _b.sent();
                            _b.label = 6;
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /** Gets the release train for which NPM next pre-releases should be cut. */
        CutNextPrereleaseAction.prototype._getActivePrereleaseTrain = function () {
            var _a;
            return (_a = this.active.releaseCandidate) !== null && _a !== void 0 ? _a : this.active.next;
        };
        /** Gets the new pre-release version for this release action. */
        CutNextPrereleaseAction.prototype._computeNewVersion = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var releaseTrain;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            releaseTrain = this._getActivePrereleaseTrain();
                            if (!(releaseTrain === this.active.next)) return [3 /*break*/, 2];
                            return [4 /*yield*/, next_prerelease_version_1.computeNewPrereleaseVersionForNext(this.active, this.config)];
                        case 1: return [2 /*return*/, _a.sent()];
                        case 2: return [2 /*return*/, inc_semver_1.semverInc(releaseTrain.version, 'prerelease')];
                    }
                });
            });
        };
        CutNextPrereleaseAction.isActive = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Pre-releases for the `next` NPM dist tag can always be cut. Depending on whether
                    // there is a feature-freeze/release-candidate branch, the next pre-releases are either
                    // cut from such a branch, or from the actual `next` release-train branch (i.e. master).
                    return [2 /*return*/, true];
                });
            });
        };
        return CutNextPrereleaseAction;
    }(actions_1.ReleaseAction));
    exports.CutNextPrereleaseAction = CutNextPrereleaseAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCx1RkFBc0Q7SUFDdEQsaUhBQTRGO0lBRTVGLDhFQUF5QztJQUV6Qzs7O09BR0c7SUFDSDtRQUE2QyxtREFBYTtRQUExRDtZQUFBLHFFQXFEQztZQXBEQywrRUFBK0U7WUFDdkUsaUJBQVcsR0FBMkIsS0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O1FBbUQxRSxDQUFDO1FBakRPLGdEQUFjLEdBQXBCOzs7Ozs7NEJBQ1MsVUFBVSxHQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxXQUFwQyxDQUFxQzs0QkFDbkMscUJBQU0sSUFBSSxDQUFDLFdBQVcsRUFBQTs7NEJBQW5DLFVBQVUsR0FBRyxTQUFzQjs0QkFDekMsc0JBQU8sMENBQXVDLFVBQVUsb0JBQWMsVUFBVSxPQUFJLEVBQUM7Ozs7U0FDdEY7UUFFSyx5Q0FBTyxHQUFiOzs7Ozs7NEJBQ1EsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDOzRCQUMvQyxVQUFVLEdBQUksWUFBWSxXQUFoQixDQUFpQjs0QkFDZixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFBOzs0QkFBbkMsVUFBVSxHQUFHLFNBQXNCOzRCQUdyQyxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFEOUQsS0FDRixTQUFnRSxFQUQvQyxFQUFFLG9CQUFBLEVBQUcsWUFBWSxrQkFBQTs0QkFHdEMscUJBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFBOzs0QkFBM0MsU0FBMkMsQ0FBQzs0QkFDNUMscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFBMUQsU0FBMEQsQ0FBQztpQ0FLdkQsQ0FBQSxZQUFZLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsRUFBakMsd0JBQWlDOzRCQUNuQyxxQkFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsU0FBc0UsQ0FBQzs7Ozs7O1NBRTFFO1FBRUQsNEVBQTRFO1FBQ3BFLDJEQUF5QixHQUFqQzs7WUFDRSxhQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLG1DQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQzFELENBQUM7UUFFRCxnRUFBZ0U7UUFDbEQsb0RBQWtCLEdBQWhDOzs7Ozs7NEJBQ1EsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO2lDQUlsRCxDQUFBLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxFQUFqQyx3QkFBaUM7NEJBQzVCLHFCQUFNLDREQUFrQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFBO2dDQUF6RSxzQkFBTyxTQUFrRSxFQUFDO2dDQUUxRSxzQkFBTyxzQkFBUyxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxDQUFDLEVBQUM7Ozs7U0FFeEQ7UUFFWSxnQ0FBUSxHQUFyQjs7O29CQUNFLG1GQUFtRjtvQkFDbkYsdUZBQXVGO29CQUN2Rix3RkFBd0Y7b0JBQ3hGLHNCQUFPLElBQUksRUFBQzs7O1NBQ2I7UUFDSCw4QkFBQztJQUFELENBQUMsQUFyREQsQ0FBNkMsdUJBQWEsR0FxRHpEO0lBckRZLDBEQUF1QiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtzZW12ZXJJbmN9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvaW5jLXNlbXZlcic7XG5pbXBvcnQge2NvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHR9IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvbmV4dC1wcmVyZWxlYXNlLXZlcnNpb24nO1xuaW1wb3J0IHtSZWxlYXNlVHJhaW59IGZyb20gJy4uLy4uL3ZlcnNpb25pbmcvcmVsZWFzZS10cmFpbnMnO1xuaW1wb3J0IHtSZWxlYXNlQWN0aW9ufSBmcm9tICcuLi9hY3Rpb25zJztcblxuLyoqXG4gKiBSZWxlYXNlIGFjdGlvbiB0aGF0IGN1dHMgYSBwcmVyZWxlYXNlIGZvciB0aGUgbmV4dCBicmFuY2guIEEgdmVyc2lvbiBpbiB0aGUgbmV4dFxuICogYnJhbmNoIGNhbiBoYXZlIGFuIGFyYml0cmFyeSBhbW91bnQgb2YgbmV4dCBwcmUtcmVsZWFzZXMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDdXROZXh0UHJlcmVsZWFzZUFjdGlvbiBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICAvKiogUHJvbWlzZSByZXNvbHZpbmcgd2l0aCB0aGUgbmV3IHZlcnNpb24gaWYgYSBOUE0gbmV4dCBwcmUtcmVsZWFzZSBpcyBjdXQuICovXG4gIHByaXZhdGUgX25ld1ZlcnNpb246IFByb21pc2U8c2VtdmVyLlNlbVZlcj4gPSB0aGlzLl9jb21wdXRlTmV3VmVyc2lvbigpO1xuXG4gIGFzeW5jIGdldERlc2NyaXB0aW9uKCkge1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuICAgIHJldHVybiBgQ3V0IGEgbmV3IG5leHQgcHJlLXJlbGVhc2UgZm9yIHRoZSBcIiR7YnJhbmNoTmFtZX1cIiBicmFuY2ggKHYke25ld1ZlcnNpb259KS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSByZWxlYXNlVHJhaW47XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG5cbiAgICBjb25zdCB7cHVsbFJlcXVlc3Q6IHtpZH0sIHJlbGVhc2VOb3Rlc30gPVxuICAgICAgICBhd2FpdCB0aGlzLmNoZWNrb3V0QnJhbmNoQW5kU3RhZ2VWZXJzaW9uKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUpO1xuXG4gICAgYXdhaXQgdGhpcy53YWl0Rm9yUHVsbFJlcXVlc3RUb0JlTWVyZ2VkKGlkKTtcbiAgICBhd2FpdCB0aGlzLmJ1aWxkQW5kUHVibGlzaChuZXdWZXJzaW9uLCBicmFuY2hOYW1lLCAnbmV4dCcpO1xuXG4gICAgLy8gSWYgdGhlIHByZS1yZWxlYXNlIGhhcyBiZWVuIGN1dCBmcm9tIGEgYnJhbmNoIHRoYXQgaXMgbm90IGNvcnJlc3BvbmRpbmdcbiAgICAvLyB0byB0aGUgbmV4dCByZWxlYXNlLXRyYWluLCBjaGVycnktcGljayB0aGUgY2hhbmdlbG9nIGludG8gdGhlIHByaW1hcnlcbiAgICAvLyBkZXZlbG9wbWVudCBicmFuY2guIGkuZS4gdGhlIGBuZXh0YCBicmFuY2ggdGhhdCBpcyB1c3VhbGx5IGBtYXN0ZXJgLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gIT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIGF3YWl0IHRoaXMuY2hlcnJ5UGlja0NoYW5nZWxvZ0ludG9OZXh0QnJhbmNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJlbGVhc2UgdHJhaW4gZm9yIHdoaWNoIE5QTSBuZXh0IHByZS1yZWxlYXNlcyBzaG91bGQgYmUgY3V0LiAqL1xuICBwcml2YXRlIF9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTogUmVsZWFzZVRyYWluIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA/PyB0aGlzLmFjdGl2ZS5uZXh0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jb21wdXRlTmV3VmVyc2lvbigpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICAvLyBJZiBhIHByZS1yZWxlYXNlIGlzIGN1dCBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgdGhlIG5ldyB2ZXJzaW9uIGlzIGNvbXB1dGVkXG4gICAgLy8gd2l0aCByZXNwZWN0IHRvIHNwZWNpYWwgY2FzZXMgc3VyZmFjaW5nIHdpdGggRkYvUkMgYnJhbmNoZXMuIE90aGVyd2lzZSwgdGhlIGJhc2ljXG4gICAgLy8gcHJlLXJlbGVhc2UgaW5jcmVtZW50IG9mIHRoZSB2ZXJzaW9uIGlzIHVzZWQgYXMgbmV3IHZlcnNpb24uXG4gICAgaWYgKHJlbGVhc2VUcmFpbiA9PT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyhyZWxlYXNlVHJhaW4udmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoKSB7XG4gICAgLy8gUHJlLXJlbGVhc2VzIGZvciB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBjYW4gYWx3YXlzIGJlIGN1dC4gRGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAgICAvLyB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCwgdGhlIG5leHQgcHJlLXJlbGVhc2VzIGFyZSBlaXRoZXJcbiAgICAvLyBjdXQgZnJvbSBzdWNoIGEgYnJhbmNoLCBvciBmcm9tIHRoZSBhY3R1YWwgYG5leHRgIHJlbGVhc2UtdHJhaW4gYnJhbmNoIChpLmUuIG1hc3RlcikuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==