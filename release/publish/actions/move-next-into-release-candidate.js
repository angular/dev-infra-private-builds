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
        define("@angular/dev-infra-private/release/publish/actions/move-next-into-release-candidate", ["require", "exports", "tslib", "@angular/dev-infra-private/release/publish/actions/branch-off-next-branch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MoveNextIntoReleaseCandidateAction = void 0;
    var tslib_1 = require("tslib");
    var branch_off_next_branch_1 = require("@angular/dev-infra-private/release/publish/actions/branch-off-next-branch");
    /**
     * Release action that moves the next release-train into the release-candidate phase. This means
     * that a new version branch is created from the next branch, and the first release candidate
     * version is cut indicating the new phase.
     */
    var MoveNextIntoReleaseCandidateAction = /** @class */ (function (_super) {
        tslib_1.__extends(MoveNextIntoReleaseCandidateAction, _super);
        function MoveNextIntoReleaseCandidateAction() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.newPhaseName = 'release-candidate';
            return _this;
        }
        MoveNextIntoReleaseCandidateAction.isActive = function (active) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    // Directly switching a next release-train into the `release-candidate`
                    // phase is only allowed for minor releases. Major version always need to
                    // go through the `feature-freeze` phase.
                    return [2 /*return*/, active.releaseCandidate === null && !active.next.isMajor];
                });
            });
        };
        return MoveNextIntoReleaseCandidateAction;
    }(branch_off_next_branch_1.BranchOffNextBranchBaseAction));
    exports.MoveNextIntoReleaseCandidateAction = MoveNextIntoReleaseCandidateAction;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW92ZS1uZXh0LWludG8tcmVsZWFzZS1jYW5kaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvbW92ZS1uZXh0LWludG8tcmVsZWFzZS1jYW5kaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUlILG9IQUF1RTtJQUV2RTs7OztPQUlHO0lBQ0g7UUFBd0QsOERBQTZCO1FBQXJGO1lBQUEscUVBU0M7WUFSVSxrQkFBWSxHQUFHLG1CQUE0QixDQUFDOztRQVF2RCxDQUFDO1FBTnVCLDJDQUFRLEdBQTlCLFVBQStCLE1BQTJCOzs7b0JBQ3hELHVFQUF1RTtvQkFDdkUseUVBQXlFO29CQUN6RSx5Q0FBeUM7b0JBQ3pDLHNCQUFPLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBQzs7O1NBQ2pFO1FBQ0gseUNBQUM7SUFBRCxDQUFDLEFBVEQsQ0FBd0Qsc0RBQTZCLEdBU3BGO0lBVFksZ0ZBQWtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QWN0aXZlUmVsZWFzZVRyYWluc30gZnJvbSAnLi4vLi4vdmVyc2lvbmluZyc7XG5cbmltcG9ydCB7QnJhbmNoT2ZmTmV4dEJyYW5jaEJhc2VBY3Rpb259IGZyb20gJy4vYnJhbmNoLW9mZi1uZXh0LWJyYW5jaCc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCBtb3ZlcyB0aGUgbmV4dCByZWxlYXNlLXRyYWluIGludG8gdGhlIHJlbGVhc2UtY2FuZGlkYXRlIHBoYXNlLiBUaGlzIG1lYW5zXG4gKiB0aGF0IGEgbmV3IHZlcnNpb24gYnJhbmNoIGlzIGNyZWF0ZWQgZnJvbSB0aGUgbmV4dCBicmFuY2gsIGFuZCB0aGUgZmlyc3QgcmVsZWFzZSBjYW5kaWRhdGVcbiAqIHZlcnNpb24gaXMgY3V0IGluZGljYXRpbmcgdGhlIG5ldyBwaGFzZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1vdmVOZXh0SW50b1JlbGVhc2VDYW5kaWRhdGVBY3Rpb24gZXh0ZW5kcyBCcmFuY2hPZmZOZXh0QnJhbmNoQmFzZUFjdGlvbiB7XG4gIG92ZXJyaWRlIG5ld1BoYXNlTmFtZSA9ICdyZWxlYXNlLWNhbmRpZGF0ZScgYXMgY29uc3Q7XG5cbiAgc3RhdGljIG92ZXJyaWRlIGFzeW5jIGlzQWN0aXZlKGFjdGl2ZTogQWN0aXZlUmVsZWFzZVRyYWlucykge1xuICAgIC8vIERpcmVjdGx5IHN3aXRjaGluZyBhIG5leHQgcmVsZWFzZS10cmFpbiBpbnRvIHRoZSBgcmVsZWFzZS1jYW5kaWRhdGVgXG4gICAgLy8gcGhhc2UgaXMgb25seSBhbGxvd2VkIGZvciBtaW5vciByZWxlYXNlcy4gTWFqb3IgdmVyc2lvbiBhbHdheXMgbmVlZCB0b1xuICAgIC8vIGdvIHRocm91Z2ggdGhlIGBmZWF0dXJlLWZyZWV6ZWAgcGhhc2UuXG4gICAgcmV0dXJuIGFjdGl2ZS5yZWxlYXNlQ2FuZGlkYXRlID09PSBudWxsICYmICFhY3RpdmUubmV4dC5pc01ham9yO1xuICB9XG59XG4iXX0=