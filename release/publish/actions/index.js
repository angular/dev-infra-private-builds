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
        define("@angular/dev-infra-private/release/publish/actions/index", ["require", "exports", "@angular/dev-infra-private/release/publish/actions/cut-lts-patch", "@angular/dev-infra-private/release/publish/actions/cut-new-patch", "@angular/dev-infra-private/release/publish/actions/cut-next-prerelease", "@angular/dev-infra-private/release/publish/actions/cut-release-candidate", "@angular/dev-infra-private/release/publish/actions/cut-stable", "@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze", "@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.actions = void 0;
    var cut_lts_patch_1 = require("@angular/dev-infra-private/release/publish/actions/cut-lts-patch");
    var cut_new_patch_1 = require("@angular/dev-infra-private/release/publish/actions/cut-new-patch");
    var cut_next_prerelease_1 = require("@angular/dev-infra-private/release/publish/actions/cut-next-prerelease");
    var cut_release_candidate_1 = require("@angular/dev-infra-private/release/publish/actions/cut-release-candidate");
    var cut_stable_1 = require("@angular/dev-infra-private/release/publish/actions/cut-stable");
    var move_next_into_feature_freeze_1 = require("@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze");
    var tag_recent_major_as_latest_1 = require("@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest");
    /**
     * List of release actions supported by the release staging tool. These are sorted
     * by priority. Actions which are selectable are sorted based on this declaration order.
     */
    exports.actions = [
        tag_recent_major_as_latest_1.TagRecentMajorAsLatest,
        cut_stable_1.CutStableAction,
        cut_release_candidate_1.CutReleaseCandidateAction,
        cut_new_patch_1.CutNewPatchAction,
        cut_next_prerelease_1.CutNextPrereleaseAction,
        move_next_into_feature_freeze_1.MoveNextIntoFeatureFreezeAction,
        cut_lts_patch_1.CutLongTermSupportPatchAction,
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsa0dBQThEO0lBQzlELGtHQUFrRDtJQUNsRCw4R0FBOEQ7SUFDOUQsa0hBQWtFO0lBQ2xFLDRGQUE2QztJQUM3QyxrSUFBZ0Y7SUFDaEYsNEhBQW9FO0lBRXBFOzs7T0FHRztJQUNVLFFBQUEsT0FBTyxHQUErQjtRQUNqRCxtREFBc0I7UUFDdEIsNEJBQWU7UUFDZixpREFBeUI7UUFDekIsaUNBQWlCO1FBQ2pCLDZDQUF1QjtRQUN2QiwrREFBK0I7UUFDL0IsNkNBQTZCO0tBQzlCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3J9IGZyb20gJy4uL2FjdGlvbnMnO1xuXG5pbXBvcnQge0N1dExvbmdUZXJtU3VwcG9ydFBhdGNoQWN0aW9ufSBmcm9tICcuL2N1dC1sdHMtcGF0Y2gnO1xuaW1wb3J0IHtDdXROZXdQYXRjaEFjdGlvbn0gZnJvbSAnLi9jdXQtbmV3LXBhdGNoJztcbmltcG9ydCB7Q3V0TmV4dFByZXJlbGVhc2VBY3Rpb259IGZyb20gJy4vY3V0LW5leHQtcHJlcmVsZWFzZSc7XG5pbXBvcnQge0N1dFJlbGVhc2VDYW5kaWRhdGVBY3Rpb259IGZyb20gJy4vY3V0LXJlbGVhc2UtY2FuZGlkYXRlJztcbmltcG9ydCB7Q3V0U3RhYmxlQWN0aW9ufSBmcm9tICcuL2N1dC1zdGFibGUnO1xuaW1wb3J0IHtNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9ufSBmcm9tICcuL21vdmUtbmV4dC1pbnRvLWZlYXR1cmUtZnJlZXplJztcbmltcG9ydCB7VGFnUmVjZW50TWFqb3JBc0xhdGVzdH0gZnJvbSAnLi90YWctcmVjZW50LW1ham9yLWFzLWxhdGVzdCc7XG5cbi8qKlxuICogTGlzdCBvZiByZWxlYXNlIGFjdGlvbnMgc3VwcG9ydGVkIGJ5IHRoZSByZWxlYXNlIHN0YWdpbmcgdG9vbC4gVGhlc2UgYXJlIHNvcnRlZFxuICogYnkgcHJpb3JpdHkuIEFjdGlvbnMgd2hpY2ggYXJlIHNlbGVjdGFibGUgYXJlIHNvcnRlZCBiYXNlZCBvbiB0aGlzIGRlY2xhcmF0aW9uIG9yZGVyLlxuICovXG5leHBvcnQgY29uc3QgYWN0aW9uczogUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yW10gPSBbXG4gIFRhZ1JlY2VudE1ham9yQXNMYXRlc3QsXG4gIEN1dFN0YWJsZUFjdGlvbixcbiAgQ3V0UmVsZWFzZUNhbmRpZGF0ZUFjdGlvbixcbiAgQ3V0TmV3UGF0Y2hBY3Rpb24sXG4gIEN1dE5leHRQcmVyZWxlYXNlQWN0aW9uLFxuICBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uLFxuICBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbixcbl07XG4iXX0=