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
        define("@angular/dev-infra-private/release/versioning/next-prerelease-version", ["require", "exports", "tslib", "@angular/dev-infra-private/release/versioning/inc-semver", "@angular/dev-infra-private/release/versioning/npm-registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.computeNewPrereleaseVersionForNext = void 0;
    var tslib_1 = require("tslib");
    var inc_semver_1 = require("@angular/dev-infra-private/release/versioning/inc-semver");
    var npm_registry_1 = require("@angular/dev-infra-private/release/versioning/npm-registry");
    /** Computes the new pre-release version for the next release-train. */
    function computeNewPrereleaseVersionForNext(active, config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var nextVersion, isNextPublishedToNpm;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        nextVersion = active.next.version;
                        return [4 /*yield*/, npm_registry_1.isVersionPublishedToNpm(nextVersion, config)];
                    case 1:
                        isNextPublishedToNpm = _a.sent();
                        // Special-case where the version in the `next` release-train is not published yet. This
                        // happens when we recently branched off for feature-freeze. We already bump the version to
                        // the next minor or major, but do not publish immediately. Cutting a release immediately would
                        // be not helpful as there are no other changes than in the feature-freeze branch. If we happen
                        // to detect this case, we stage the release as usual but do not increment the version.
                        if (isNextPublishedToNpm) {
                            return [2 /*return*/, inc_semver_1.semverInc(nextVersion, 'prerelease')];
                        }
                        else {
                            return [2 /*return*/, nextVersion];
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.computeNewPrereleaseVersionForNext = computeNewPrereleaseVersionForNext;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV4dC1wcmVyZWxlYXNlLXZlcnNpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL25leHQtcHJlcmVsZWFzZS12ZXJzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFPSCx1RkFBdUM7SUFDdkMsMkZBQXVEO0lBRXZELHVFQUF1RTtJQUN2RSxTQUFzQixrQ0FBa0MsQ0FDcEQsTUFBMkIsRUFBRSxNQUFxQjs7Ozs7O3dCQUNwQyxXQUFXLEdBQUksTUFBTSxDQUFDLElBQUksUUFBZixDQUFnQjt3QkFDZCxxQkFBTSxzQ0FBdUIsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQUE7O3dCQUF6RSxvQkFBb0IsR0FBRyxTQUFrRDt3QkFDL0Usd0ZBQXdGO3dCQUN4RiwyRkFBMkY7d0JBQzNGLCtGQUErRjt3QkFDL0YsK0ZBQStGO3dCQUMvRix1RkFBdUY7d0JBQ3ZGLElBQUksb0JBQW9CLEVBQUU7NEJBQ3hCLHNCQUFPLHNCQUFTLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxFQUFDO3lCQUM3Qzs2QkFBTTs0QkFDTCxzQkFBTyxXQUFXLEVBQUM7eUJBQ3BCOzs7OztLQUNGO0lBZEQsZ0ZBY0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vY29uZmlnL2luZGV4JztcblxuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge3NlbXZlckluY30gZnJvbSAnLi9pbmMtc2VtdmVyJztcbmltcG9ydCB7aXNWZXJzaW9uUHVibGlzaGVkVG9OcG19IGZyb20gJy4vbnBtLXJlZ2lzdHJ5JztcblxuLyoqIENvbXB1dGVzIHRoZSBuZXcgcHJlLXJlbGVhc2UgdmVyc2lvbiBmb3IgdGhlIG5leHQgcmVsZWFzZS10cmFpbi4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb21wdXRlTmV3UHJlcmVsZWFzZVZlcnNpb25Gb3JOZXh0KFxuICAgIGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucywgY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHt2ZXJzaW9uOiBuZXh0VmVyc2lvbn0gPSBhY3RpdmUubmV4dDtcbiAgY29uc3QgaXNOZXh0UHVibGlzaGVkVG9OcG0gPSBhd2FpdCBpc1ZlcnNpb25QdWJsaXNoZWRUb05wbShuZXh0VmVyc2lvbiwgY29uZmlnKTtcbiAgLy8gU3BlY2lhbC1jYXNlIHdoZXJlIHRoZSB2ZXJzaW9uIGluIHRoZSBgbmV4dGAgcmVsZWFzZS10cmFpbiBpcyBub3QgcHVibGlzaGVkIHlldC4gVGhpc1xuICAvLyBoYXBwZW5zIHdoZW4gd2UgcmVjZW50bHkgYnJhbmNoZWQgb2ZmIGZvciBmZWF0dXJlLWZyZWV6ZS4gV2UgYWxyZWFkeSBidW1wIHRoZSB2ZXJzaW9uIHRvXG4gIC8vIHRoZSBuZXh0IG1pbm9yIG9yIG1ham9yLCBidXQgZG8gbm90IHB1Ymxpc2ggaW1tZWRpYXRlbHkuIEN1dHRpbmcgYSByZWxlYXNlIGltbWVkaWF0ZWx5IHdvdWxkXG4gIC8vIGJlIG5vdCBoZWxwZnVsIGFzIHRoZXJlIGFyZSBubyBvdGhlciBjaGFuZ2VzIHRoYW4gaW4gdGhlIGZlYXR1cmUtZnJlZXplIGJyYW5jaC4gSWYgd2UgaGFwcGVuXG4gIC8vIHRvIGRldGVjdCB0aGlzIGNhc2UsIHdlIHN0YWdlIHRoZSByZWxlYXNlIGFzIHVzdWFsIGJ1dCBkbyBub3QgaW5jcmVtZW50IHRoZSB2ZXJzaW9uLlxuICBpZiAoaXNOZXh0UHVibGlzaGVkVG9OcG0pIHtcbiAgICByZXR1cm4gc2VtdmVySW5jKG5leHRWZXJzaW9uLCAncHJlcmVsZWFzZScpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXh0VmVyc2lvbjtcbiAgfVxufVxuIl19