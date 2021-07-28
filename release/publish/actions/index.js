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
        define("@angular/dev-infra-private/release/publish/actions/index", ["require", "exports", "@angular/dev-infra-private/release/publish/actions/cut-lts-patch", "@angular/dev-infra-private/release/publish/actions/cut-new-patch", "@angular/dev-infra-private/release/publish/actions/cut-next-prerelease", "@angular/dev-infra-private/release/publish/actions/cut-release-candidate-for-feature-freeze", "@angular/dev-infra-private/release/publish/actions/cut-stable", "@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze", "@angular/dev-infra-private/release/publish/actions/move-next-into-release-candidate", "@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.actions = void 0;
    var cut_lts_patch_1 = require("@angular/dev-infra-private/release/publish/actions/cut-lts-patch");
    var cut_new_patch_1 = require("@angular/dev-infra-private/release/publish/actions/cut-new-patch");
    var cut_next_prerelease_1 = require("@angular/dev-infra-private/release/publish/actions/cut-next-prerelease");
    var cut_release_candidate_for_feature_freeze_1 = require("@angular/dev-infra-private/release/publish/actions/cut-release-candidate-for-feature-freeze");
    var cut_stable_1 = require("@angular/dev-infra-private/release/publish/actions/cut-stable");
    var move_next_into_feature_freeze_1 = require("@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze");
    var move_next_into_release_candidate_1 = require("@angular/dev-infra-private/release/publish/actions/move-next-into-release-candidate");
    var tag_recent_major_as_latest_1 = require("@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest");
    /**
     * List of release actions supported by the release staging tool. These are sorted
     * by priority. Actions which are selectable are sorted based on this declaration order.
     */
    exports.actions = [
        tag_recent_major_as_latest_1.TagRecentMajorAsLatest,
        cut_stable_1.CutStableAction,
        cut_release_candidate_for_feature_freeze_1.CutReleaseCandidateForFeatureFreezeAction,
        cut_new_patch_1.CutNewPatchAction,
        cut_next_prerelease_1.CutNextPrereleaseAction,
        move_next_into_feature_freeze_1.MoveNextIntoFeatureFreezeAction,
        move_next_into_release_candidate_1.MoveNextIntoReleaseCandidateAction,
        cut_lts_patch_1.CutLongTermSupportPatchAction,
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsa0dBQThEO0lBQzlELGtHQUFrRDtJQUNsRCw4R0FBOEQ7SUFDOUQsd0pBQXFHO0lBQ3JHLDRGQUE2QztJQUM3QyxrSUFBZ0Y7SUFDaEYsd0lBQXNGO0lBQ3RGLDRIQUFvRTtJQUVwRTs7O09BR0c7SUFDVSxRQUFBLE9BQU8sR0FBK0I7UUFDakQsbURBQXNCO1FBQ3RCLDRCQUFlO1FBQ2Ysb0ZBQXlDO1FBQ3pDLGlDQUFpQjtRQUNqQiw2Q0FBdUI7UUFDdkIsK0RBQStCO1FBQy9CLHFFQUFrQztRQUNsQyw2Q0FBNkI7S0FDOUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlbGVhc2VBY3Rpb25Db25zdHJ1Y3Rvcn0gZnJvbSAnLi4vYWN0aW9ucyc7XG5cbmltcG9ydCB7Q3V0TG9uZ1Rlcm1TdXBwb3J0UGF0Y2hBY3Rpb259IGZyb20gJy4vY3V0LWx0cy1wYXRjaCc7XG5pbXBvcnQge0N1dE5ld1BhdGNoQWN0aW9ufSBmcm9tICcuL2N1dC1uZXctcGF0Y2gnO1xuaW1wb3J0IHtDdXROZXh0UHJlcmVsZWFzZUFjdGlvbn0gZnJvbSAnLi9jdXQtbmV4dC1wcmVyZWxlYXNlJztcbmltcG9ydCB7Q3V0UmVsZWFzZUNhbmRpZGF0ZUZvckZlYXR1cmVGcmVlemVBY3Rpb259IGZyb20gJy4vY3V0LXJlbGVhc2UtY2FuZGlkYXRlLWZvci1mZWF0dXJlLWZyZWV6ZSc7XG5pbXBvcnQge0N1dFN0YWJsZUFjdGlvbn0gZnJvbSAnLi9jdXQtc3RhYmxlJztcbmltcG9ydCB7TW92ZU5leHRJbnRvRmVhdHVyZUZyZWV6ZUFjdGlvbn0gZnJvbSAnLi9tb3ZlLW5leHQtaW50by1mZWF0dXJlLWZyZWV6ZSc7XG5pbXBvcnQge01vdmVOZXh0SW50b1JlbGVhc2VDYW5kaWRhdGVBY3Rpb259IGZyb20gJy4vbW92ZS1uZXh0LWludG8tcmVsZWFzZS1jYW5kaWRhdGUnO1xuaW1wb3J0IHtUYWdSZWNlbnRNYWpvckFzTGF0ZXN0fSBmcm9tICcuL3RhZy1yZWNlbnQtbWFqb3ItYXMtbGF0ZXN0JztcblxuLyoqXG4gKiBMaXN0IG9mIHJlbGVhc2UgYWN0aW9ucyBzdXBwb3J0ZWQgYnkgdGhlIHJlbGVhc2Ugc3RhZ2luZyB0b29sLiBUaGVzZSBhcmUgc29ydGVkXG4gKiBieSBwcmlvcml0eS4gQWN0aW9ucyB3aGljaCBhcmUgc2VsZWN0YWJsZSBhcmUgc29ydGVkIGJhc2VkIG9uIHRoaXMgZGVjbGFyYXRpb24gb3JkZXIuXG4gKi9cbmV4cG9ydCBjb25zdCBhY3Rpb25zOiBSZWxlYXNlQWN0aW9uQ29uc3RydWN0b3JbXSA9IFtcbiAgVGFnUmVjZW50TWFqb3JBc0xhdGVzdCxcbiAgQ3V0U3RhYmxlQWN0aW9uLFxuICBDdXRSZWxlYXNlQ2FuZGlkYXRlRm9yRmVhdHVyZUZyZWV6ZUFjdGlvbixcbiAgQ3V0TmV3UGF0Y2hBY3Rpb24sXG4gIEN1dE5leHRQcmVyZWxlYXNlQWN0aW9uLFxuICBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uLFxuICBNb3ZlTmV4dEludG9SZWxlYXNlQ2FuZGlkYXRlQWN0aW9uLFxuICBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbixcbl07XG4iXX0=