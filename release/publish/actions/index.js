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
        define("@angular/dev-infra-private/release/publish/actions/index", ["require", "exports", "@angular/dev-infra-private/release/publish/actions/cut-lts-patch", "@angular/dev-infra-private/release/publish/actions/cut-new-patch", "@angular/dev-infra-private/release/publish/actions/cut-next-prerelease", "@angular/dev-infra-private/release/publish/actions/cut-release-candidate", "@angular/dev-infra-private/release/publish/actions/cut-stable", "@angular/dev-infra-private/release/publish/actions/move-next-into-feature-freeze"], factory);
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
    /**
     * List of release actions supported by the release staging tool. These are sorted
     * by priority. Actions which are selectable are sorted based on this declaration order.
     */
    exports.actions = [
        cut_stable_1.CutStableAction,
        cut_release_candidate_1.CutReleaseCandidateAction,
        cut_new_patch_1.CutNewPatchAction,
        cut_next_prerelease_1.CutNextPrereleaseAction,
        move_next_into_feature_freeze_1.MoveNextIntoFeatureFreezeAction,
        cut_lts_patch_1.CutLongTermSupportPatchAction,
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBSUgsa0dBQThEO0lBQzlELGtHQUFrRDtJQUNsRCw4R0FBOEQ7SUFDOUQsa0hBQWtFO0lBQ2xFLDRGQUE2QztJQUM3QyxrSUFBZ0Y7SUFFaEY7OztPQUdHO0lBQ1UsUUFBQSxPQUFPLEdBQStCO1FBQ2pELDRCQUFlO1FBQ2YsaURBQXlCO1FBQ3pCLGlDQUFpQjtRQUNqQiw2Q0FBdUI7UUFDdkIsK0RBQStCO1FBQy9CLDZDQUE2QjtLQUM5QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yfSBmcm9tICcuLi9hY3Rpb25zJztcblxuaW1wb3J0IHtDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbn0gZnJvbSAnLi9jdXQtbHRzLXBhdGNoJztcbmltcG9ydCB7Q3V0TmV3UGF0Y2hBY3Rpb259IGZyb20gJy4vY3V0LW5ldy1wYXRjaCc7XG5pbXBvcnQge0N1dE5leHRQcmVyZWxlYXNlQWN0aW9ufSBmcm9tICcuL2N1dC1uZXh0LXByZXJlbGVhc2UnO1xuaW1wb3J0IHtDdXRSZWxlYXNlQ2FuZGlkYXRlQWN0aW9ufSBmcm9tICcuL2N1dC1yZWxlYXNlLWNhbmRpZGF0ZSc7XG5pbXBvcnQge0N1dFN0YWJsZUFjdGlvbn0gZnJvbSAnLi9jdXQtc3RhYmxlJztcbmltcG9ydCB7TW92ZU5leHRJbnRvRmVhdHVyZUZyZWV6ZUFjdGlvbn0gZnJvbSAnLi9tb3ZlLW5leHQtaW50by1mZWF0dXJlLWZyZWV6ZSc7XG5cbi8qKlxuICogTGlzdCBvZiByZWxlYXNlIGFjdGlvbnMgc3VwcG9ydGVkIGJ5IHRoZSByZWxlYXNlIHN0YWdpbmcgdG9vbC4gVGhlc2UgYXJlIHNvcnRlZFxuICogYnkgcHJpb3JpdHkuIEFjdGlvbnMgd2hpY2ggYXJlIHNlbGVjdGFibGUgYXJlIHNvcnRlZCBiYXNlZCBvbiB0aGlzIGRlY2xhcmF0aW9uIG9yZGVyLlxuICovXG5leHBvcnQgY29uc3QgYWN0aW9uczogUmVsZWFzZUFjdGlvbkNvbnN0cnVjdG9yW10gPSBbXG4gIEN1dFN0YWJsZUFjdGlvbixcbiAgQ3V0UmVsZWFzZUNhbmRpZGF0ZUFjdGlvbixcbiAgQ3V0TmV3UGF0Y2hBY3Rpb24sXG4gIEN1dE5leHRQcmVyZWxlYXNlQWN0aW9uLFxuICBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplQWN0aW9uLFxuICBDdXRMb25nVGVybVN1cHBvcnRQYXRjaEFjdGlvbixcbl07XG4iXX0=