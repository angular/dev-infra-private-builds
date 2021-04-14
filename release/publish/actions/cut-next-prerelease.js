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
                var releaseTrain, branchName, newVersion, id;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            releaseTrain = this._getActivePrereleaseTrain();
                            branchName = releaseTrain.branchName;
                            return [4 /*yield*/, this._newVersion];
                        case 1:
                            newVersion = _a.sent();
                            return [4 /*yield*/, this.checkoutBranchAndStageVersion(newVersion, branchName)];
                        case 2:
                            id = (_a.sent()).id;
                            return [4 /*yield*/, this.waitForPullRequestToBeMerged(id)];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, this.buildAndPublish(newVersion, branchName, 'next')];
                        case 4:
                            _a.sent();
                            if (!(releaseTrain !== this.active.next)) return [3 /*break*/, 6];
                            return [4 /*yield*/, this.cherryPickChangelogIntoNextBranch(newVersion, branchName)];
                        case 5:
                            _a.sent();
                            _a.label = 6;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3V0LW5leHQtcHJlcmVsZWFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvYWN0aW9ucy9jdXQtbmV4dC1wcmVyZWxlYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCx1RkFBc0Q7SUFDdEQsaUhBQTRGO0lBRTVGLDhFQUF5QztJQUV6Qzs7O09BR0c7SUFDSDtRQUE2QyxtREFBYTtRQUExRDtZQUFBLHFFQW9EQztZQW5EQywrRUFBK0U7WUFDdkUsaUJBQVcsR0FBMkIsS0FBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7O1FBa0QxRSxDQUFDO1FBaERPLGdEQUFjLEdBQXBCOzs7Ozs7NEJBQ1MsVUFBVSxHQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxXQUFwQyxDQUFxQzs0QkFDbkMscUJBQU0sSUFBSSxDQUFDLFdBQVcsRUFBQTs7NEJBQW5DLFVBQVUsR0FBRyxTQUFzQjs0QkFDekMsc0JBQU8sMENBQXVDLFVBQVUsb0JBQWMsVUFBVSxPQUFJLEVBQUM7Ozs7U0FDdEY7UUFFSyx5Q0FBTyxHQUFiOzs7Ozs7NEJBQ1EsWUFBWSxHQUFHLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDOzRCQUMvQyxVQUFVLEdBQUksWUFBWSxXQUFoQixDQUFpQjs0QkFDZixxQkFBTSxJQUFJLENBQUMsV0FBVyxFQUFBOzs0QkFBbkMsVUFBVSxHQUFHLFNBQXNCOzRCQUU1QixxQkFBTSxJQUFJLENBQUMsNkJBQTZCLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzs0QkFBdEUsRUFBRSxHQUFJLENBQUEsU0FBZ0UsQ0FBQSxHQUFwRTs0QkFFVCxxQkFBTSxJQUFJLENBQUMsNEJBQTRCLENBQUMsRUFBRSxDQUFDLEVBQUE7OzRCQUEzQyxTQUEyQyxDQUFDOzRCQUM1QyxxQkFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUE7OzRCQUExRCxTQUEwRCxDQUFDO2lDQUt2RCxDQUFBLFlBQVksS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQSxFQUFqQyx3QkFBaUM7NEJBQ25DLHFCQUFNLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLEVBQUE7OzRCQUFwRSxTQUFvRSxDQUFDOzs7Ozs7U0FFeEU7UUFFRCw0RUFBNEU7UUFDcEUsMkRBQXlCLEdBQWpDOztZQUNFLE9BQU8sTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixtQ0FBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxRCxDQUFDO1FBRUQsZ0VBQWdFO1FBQ2xELG9EQUFrQixHQUFoQzs7Ozs7OzRCQUNRLFlBQVksR0FBRyxJQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQztpQ0FJbEQsQ0FBQSxZQUFZLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUEsRUFBakMsd0JBQWlDOzRCQUM1QixxQkFBTSw0REFBa0MsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBQTtnQ0FBekUsc0JBQU8sU0FBa0UsRUFBQztnQ0FFMUUsc0JBQU8sc0JBQVMsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFlBQVksQ0FBQyxFQUFDOzs7O1NBRXhEO1FBRVksZ0NBQVEsR0FBckI7OztvQkFDRSxtRkFBbUY7b0JBQ25GLHVGQUF1RjtvQkFDdkYsd0ZBQXdGO29CQUN4RixzQkFBTyxJQUFJLEVBQUM7OztTQUNiO1FBQ0gsOEJBQUM7SUFBRCxDQUFDLEFBcERELENBQTZDLHVCQUFhLEdBb0R6RDtJQXBEWSwwREFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7c2VtdmVySW5jfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2luYy1zZW12ZXInO1xuaW1wb3J0IHtjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0fSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uJztcbmltcG9ydCB7UmVsZWFzZVRyYWlufSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL3JlbGVhc2UtdHJhaW5zJztcbmltcG9ydCB7UmVsZWFzZUFjdGlvbn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBjdXRzIGEgcHJlcmVsZWFzZSBmb3IgdGhlIG5leHQgYnJhbmNoLiBBIHZlcnNpb24gaW4gdGhlIG5leHRcbiAqIGJyYW5jaCBjYW4gaGF2ZSBhbiBhcmJpdHJhcnkgYW1vdW50IG9mIG5leHQgcHJlLXJlbGVhc2VzLlxuICovXG5leHBvcnQgY2xhc3MgQ3V0TmV4dFByZXJlbGVhc2VBY3Rpb24gZXh0ZW5kcyBSZWxlYXNlQWN0aW9uIHtcbiAgLyoqIFByb21pc2UgcmVzb2x2aW5nIHdpdGggdGhlIG5ldyB2ZXJzaW9uIGlmIGEgTlBNIG5leHQgcHJlLXJlbGVhc2UgaXMgY3V0LiAqL1xuICBwcml2YXRlIF9uZXdWZXJzaW9uOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+ID0gdGhpcy5fY29tcHV0ZU5ld1ZlcnNpb24oKTtcblxuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICBjb25zdCB7YnJhbmNoTmFtZX0gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICBjb25zdCBuZXdWZXJzaW9uID0gYXdhaXQgdGhpcy5fbmV3VmVyc2lvbjtcbiAgICByZXR1cm4gYEN1dCBhIG5ldyBuZXh0IHByZS1yZWxlYXNlIGZvciB0aGUgXCIke2JyYW5jaE5hbWV9XCIgYnJhbmNoICh2JHtuZXdWZXJzaW9ufSkuYDtcbiAgfVxuXG4gIGFzeW5jIHBlcmZvcm0oKSB7XG4gICAgY29uc3QgcmVsZWFzZVRyYWluID0gdGhpcy5fZ2V0QWN0aXZlUHJlcmVsZWFzZVRyYWluKCk7XG4gICAgY29uc3Qge2JyYW5jaE5hbWV9ID0gcmVsZWFzZVRyYWluO1xuICAgIGNvbnN0IG5ld1ZlcnNpb24gPSBhd2FpdCB0aGlzLl9uZXdWZXJzaW9uO1xuXG4gICAgY29uc3Qge2lkfSA9IGF3YWl0IHRoaXMuY2hlY2tvdXRCcmFuY2hBbmRTdGFnZVZlcnNpb24obmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG5cbiAgICBhd2FpdCB0aGlzLndhaXRGb3JQdWxsUmVxdWVzdFRvQmVNZXJnZWQoaWQpO1xuICAgIGF3YWl0IHRoaXMuYnVpbGRBbmRQdWJsaXNoKG5ld1ZlcnNpb24sIGJyYW5jaE5hbWUsICduZXh0Jyk7XG5cbiAgICAvLyBJZiB0aGUgcHJlLXJlbGVhc2UgaGFzIGJlZW4gY3V0IGZyb20gYSBicmFuY2ggdGhhdCBpcyBub3QgY29ycmVzcG9uZGluZ1xuICAgIC8vIHRvIHRoZSBuZXh0IHJlbGVhc2UtdHJhaW4sIGNoZXJyeS1waWNrIHRoZSBjaGFuZ2Vsb2cgaW50byB0aGUgcHJpbWFyeVxuICAgIC8vIGRldmVsb3BtZW50IGJyYW5jaC4gaS5lLiB0aGUgYG5leHRgIGJyYW5jaCB0aGF0IGlzIHVzdWFsbHkgYG1hc3RlcmAuXG4gICAgaWYgKHJlbGVhc2VUcmFpbiAhPT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgYXdhaXQgdGhpcy5jaGVycnlQaWNrQ2hhbmdlbG9nSW50b05leHRCcmFuY2gobmV3VmVyc2lvbiwgYnJhbmNoTmFtZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgdGhlIHJlbGVhc2UgdHJhaW4gZm9yIHdoaWNoIE5QTSBuZXh0IHByZS1yZWxlYXNlcyBzaG91bGQgYmUgY3V0LiAqL1xuICBwcml2YXRlIF9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTogUmVsZWFzZVRyYWluIHtcbiAgICByZXR1cm4gdGhpcy5hY3RpdmUucmVsZWFzZUNhbmRpZGF0ZSA/PyB0aGlzLmFjdGl2ZS5uZXh0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIG5ldyBwcmUtcmVsZWFzZSB2ZXJzaW9uIGZvciB0aGlzIHJlbGVhc2UgYWN0aW9uLiAqL1xuICBwcml2YXRlIGFzeW5jIF9jb21wdXRlTmV3VmVyc2lvbigpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgICBjb25zdCByZWxlYXNlVHJhaW4gPSB0aGlzLl9nZXRBY3RpdmVQcmVyZWxlYXNlVHJhaW4oKTtcbiAgICAvLyBJZiBhIHByZS1yZWxlYXNlIGlzIGN1dCBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbiwgdGhlIG5ldyB2ZXJzaW9uIGlzIGNvbXB1dGVkXG4gICAgLy8gd2l0aCByZXNwZWN0IHRvIHNwZWNpYWwgY2FzZXMgc3VyZmFjaW5nIHdpdGggRkYvUkMgYnJhbmNoZXMuIE90aGVyd2lzZSwgdGhlIGJhc2ljXG4gICAgLy8gcHJlLXJlbGVhc2UgaW5jcmVtZW50IG9mIHRoZSB2ZXJzaW9uIGlzIHVzZWQgYXMgbmV3IHZlcnNpb24uXG4gICAgaWYgKHJlbGVhc2VUcmFpbiA9PT0gdGhpcy5hY3RpdmUubmV4dCkge1xuICAgICAgcmV0dXJuIGF3YWl0IGNvbXB1dGVOZXdQcmVyZWxlYXNlVmVyc2lvbkZvck5leHQodGhpcy5hY3RpdmUsIHRoaXMuY29uZmlnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbXZlckluYyhyZWxlYXNlVHJhaW4udmVyc2lvbiwgJ3ByZXJlbGVhc2UnKTtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoKSB7XG4gICAgLy8gUHJlLXJlbGVhc2VzIGZvciB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBjYW4gYWx3YXlzIGJlIGN1dC4gRGVwZW5kaW5nIG9uIHdoZXRoZXJcbiAgICAvLyB0aGVyZSBpcyBhIGZlYXR1cmUtZnJlZXplL3JlbGVhc2UtY2FuZGlkYXRlIGJyYW5jaCwgdGhlIG5leHQgcHJlLXJlbGVhc2VzIGFyZSBlaXRoZXJcbiAgICAvLyBjdXQgZnJvbSBzdWNoIGEgYnJhbmNoLCBvciBmcm9tIHRoZSBhY3R1YWwgYG5leHRgIHJlbGVhc2UtdHJhaW4gYnJhbmNoIChpLmUuIG1hc3RlcikuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cbiJdfQ==