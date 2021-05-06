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
                            return [4 /*yield*/, this.buildAndPublish(releaseNotes, branchName, 'next')];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCx1RkFBc0Q7SUFDdEQsaUhBQTRGO0lBRTVGLDhFQUF5QztJQUV6Qzs7O09BR0c7SUFDSDtRQUE2QyxtREFBYTtRQUExRDtZQUFBLHFFQXFEQztZQXBEQywrRUFBK0U7WUFDdkUsaUJBQVcsR0FBMkIsS0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O1FBbUQxRSxDQUFDO1FBakRPLGdEQUFjLEdBQXBCOzs7Ozs7NEJBQ1MsVUFBVSxHQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxXQUFwQyxDQUFxQzs0QkFDbkMscUJBQU0sSUFBSSxDQUFDLFdBQVcsRUFBQTs7NEJBQW5DLFVBQVUsR0FBRyxTQUFzQjs0QkFDekMsc0JBQU8sMENBQXVDLFVBQVUsb0JBQWMsVUFBVSxPQUFJLEVBQUM7Ozs7U0FDdEY7UUFFSyx5Q0FBTyxHQUFiOzs7Ozs7NEJBQ1EsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDOzRCQUMvQyxVQUFVLEdBQUksWUFBWSxXQUFoQixDQUFpQjs0QkFDZixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFBOzs0QkFBbkMsVUFBVSxHQUFHLFNBQXNCOzRCQUdyQyxxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFEOUQsS0FDRixTQUFnRSxFQUQvQyxFQUFFLG9CQUFBLEVBQUcsWUFBWSxrQkFBQTs0QkFHdEMscUJBQU0sSUFBSSxDQUFDLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxFQUFBOzs0QkFBM0MsU0FBMkMsQ0FBQzs0QkFDNUMscUJBQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFBOzs0QkFBNUQsU0FBNEQsQ0FBQztpQ0FLekQsQ0FBQSxZQUFZLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsRUFBakMsd0JBQWlDOzRCQUNuQyxxQkFBTSxJQUFJLENBQUMsaUNBQWlDLENBQUMsWUFBWSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsU0FBc0UsQ0FBQzs7Ozs7O1NBRTFFO1FBRUQsNEVBQTRFO1FBQ3BFLDJEQUF5QixHQUFqQzs7WUFDRSxPQUFPLE1BQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsbUNBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUQsQ0FBQztRQUVELGdFQUFnRTtRQUNsRCxvREFBa0IsR0FBaEM7Ozs7Ozs0QkFDUSxZQUFZLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7aUNBSWxELENBQUEsWUFBWSxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFBLEVBQWpDLHdCQUFpQzs0QkFDNUIscUJBQU0sNERBQWtDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUE7Z0NBQXpFLHNCQUFPLFNBQWtFLEVBQUM7Z0NBRTFFLHNCQUFPLHNCQUFTLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxZQUFZLENBQUMsRUFBQzs7OztTQUV4RDtRQUVZLGdDQUFRLEdBQXJCOzs7b0JBQ0UsbUZBQW1GO29CQUNuRix1RkFBdUY7b0JBQ3ZGLHdGQUF3RjtvQkFDeEYsc0JBQU8sSUFBSSxFQUFDOzs7U0FDYjtRQUNILDhCQUFDO0lBQUQsQ0FBQyxBQXJERCxDQUE2Qyx1QkFBYSxHQXFEekQ7SUFyRFksMERBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9pbmMtc2VtdmVyJztcbmltcG9ydCB7Y29tcHV0ZU5ld1ByZXJlbGVhc2VWZXJzaW9uRm9yTmV4dH0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9uZXh0LXByZXJlbGVhc2UtdmVyc2lvbic7XG5pbXBvcnQge1JlbGVhc2VUcmFpbn0gZnJvbSAnLi4vLi4vdmVyc2lvbmluZy9yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuXG4vKipcbiAqIFJlbGVhc2UgYWN0aW9uIHRoYXQgY3V0cyBhIHByZXJlbGVhc2UgZm9yIHRoZSBuZXh0IGJyYW5jaC4gQSB2ZXJzaW9uIGluIHRoZSBuZXh0XG4gKiBicmFuY2ggY2FuIGhhdmUgYW4gYXJiaXRyYXJ5IGFtb3VudCBvZiBuZXh0IHByZS1yZWxlYXNlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIEN1dE5leHRQcmVyZWxlYXNlQWN0aW9uIGV4dGVuZHMgUmVsZWFzZUFjdGlvbiB7XG4gIC8qKiBQcm9taXNlIHJlc29sdmluZyB3aXRoIHRoZSBuZXcgdmVyc2lvbiBpZiBhIE5QTSBuZXh0IHByZS1yZWxlYXNlIGlzIGN1dC4gKi9cbiAgcHJpdmF0ZSBfbmV3VmVyc2lvbjogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiA9IHRoaXMuX2NvbXB1dGVOZXdWZXJzaW9uKCk7XG5cbiAgYXN5bmMgZ2V0RGVzY3JpcHRpb24oKSB7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgY29uc3QgbmV3VmVyc2lvbiA9IGF3YWl0IHRoaXMuX25ld1ZlcnNpb247XG4gICAgcmV0dXJuIGBDdXQgYSBuZXcgbmV4dCBwcmUtcmVsZWFzZSBmb3IgdGhlIFwiJHticmFuY2hOYW1lfVwiIGJyYW5jaCAodiR7bmV3VmVyc2lvbn0pLmA7XG4gIH1cblxuICBhc3luYyBwZXJmb3JtKCkge1xuICAgIGNvbnN0IHJlbGVhc2VUcmFpbiA9IHRoaXMuX2dldEFjdGl2ZVByZXJlbGVhc2VUcmFpbigpO1xuICAgIGNvbnN0IHticmFuY2hOYW1lfSA9IHJlbGVhc2VUcmFpbjtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcblxuICAgIGNvbnN0IHtwdWxsUmVxdWVzdDoge2lkfSwgcmVsZWFzZU5vdGVzfSA9XG4gICAgICAgIGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKHJlbGVhc2VOb3RlcywgYnJhbmNoTmFtZSwgJ25leHQnKTtcblxuICAgIC8vIElmIHRoZSBwcmUtcmVsZWFzZSBoYXMgYmVlbiBjdXQgZnJvbSBhIGJyYW5jaCB0aGF0IGlzIG5vdCBjb3JyZXNwb25kaW5nXG4gICAgLy8gdG8gdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgY2hlcnJ5LXBpY2sgdGhlIGNoYW5nZWxvZyBpbnRvIHRoZSBwcmltYXJ5XG4gICAgLy8gZGV2ZWxvcG1lbnQgYnJhbmNoLiBpLmUuIHRoZSBgbmV4dGAgYnJhbmNoIHRoYXQgaXMgdXN1YWxseSBgbWFzdGVyYC5cbiAgICBpZiAocmVsZWFzZVRyYWluICE9PSB0aGlzLmFjdGl2ZS5uZXh0KSB7XG4gICAgICBhd2FpdCB0aGlzLmNoZXJyeVBpY2tDaGFuZ2Vsb2dJbnRvTmV4dEJyYW5jaChyZWxlYXNlTm90ZXMsIGJyYW5jaE5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSByZWxlYXNlIHRyYWluIGZvciB3aGljaCBOUE0gbmV4dCBwcmUtcmVsZWFzZXMgc2hvdWxkIGJlIGN1dC4gKi9cbiAgcHJpdmF0ZSBfZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk6IFJlbGVhc2VUcmFpbiB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZlLnJlbGVhc2VDYW5kaWRhdGUgPz8gdGhpcy5hY3RpdmUubmV4dDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBuZXcgcHJlLXJlbGVhc2UgdmVyc2lvbiBmb3IgdGhpcyByZWxlYXNlIGFjdGlvbi4gKi9cbiAgcHJpdmF0ZSBhc3luYyBfY29tcHV0ZU5ld1ZlcnNpb24oKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gICAgY29uc3QgcmVsZWFzZVRyYWluID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgLy8gSWYgYSBwcmUtcmVsZWFzZSBpcyBjdXQgZm9yIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4sIHRoZSBuZXcgdmVyc2lvbiBpcyBjb21wdXRlZFxuICAgIC8vIHdpdGggcmVzcGVjdCB0byBzcGVjaWFsIGNhc2VzIHN1cmZhY2luZyB3aXRoIEZGL1JDIGJyYW5jaGVzLiBPdGhlcndpc2UsIHRoZSBiYXNpY1xuICAgIC8vIHByZS1yZWxlYXNlIGluY3JlbWVudCBvZiB0aGUgdmVyc2lvbiBpcyB1c2VkIGFzIG5ldyB2ZXJzaW9uLlxuICAgIGlmIChyZWxlYXNlVHJhaW4gPT09IHRoaXMuYWN0aXZlLm5leHQpIHtcbiAgICAgIHJldHVybiBhd2FpdCBjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0KHRoaXMuYWN0aXZlLCB0aGlzLmNvbmZpZyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzZW12ZXJJbmMocmVsZWFzZVRyYWluLnZlcnNpb24sICdwcmVyZWxlYXNlJyk7XG4gICAgfVxuICB9XG5cbiAgc3RhdGljIGFzeW5jIGlzQWN0aXZlKCkge1xuICAgIC8vIFByZS1yZWxlYXNlcyBmb3IgdGhlIGBuZXh0YCBOUE0gZGlzdCB0YWcgY2FuIGFsd2F5cyBiZSBjdXQuIERlcGVuZGluZyBvbiB3aGV0aGVyXG4gICAgLy8gdGhlcmUgaXMgYSBmZWF0dXJlLWZyZWV6ZS9yZWxlYXNlLWNhbmRpZGF0ZSBicmFuY2gsIHRoZSBuZXh0IHByZS1yZWxlYXNlcyBhcmUgZWl0aGVyXG4gICAgLy8gY3V0IGZyb20gc3VjaCBhIGJyYW5jaCwgb3IgZnJvbSB0aGUgYWN0dWFsIGBuZXh0YCByZWxlYXNlLXRyYWluIGJyYW5jaCAoaS5lLiBtYXN0ZXIpLlxuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG4iXX0=