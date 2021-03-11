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
        define("@angular/dev-infra-private/release/publish/commit-message", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getReleaseNoteCherryPickCommitMessage = exports.getCommitMessageForNextBranchMajorSwitch = exports.getCommitMessageForExceptionalNextVersionBump = exports.getCommitMessageForRelease = void 0;
    /** Gets the commit message for a new release point in the project. */
    function getCommitMessageForRelease(newVersion) {
        return "release: cut the v" + newVersion + " release";
    }
    exports.getCommitMessageForRelease = getCommitMessageForRelease;
    /**
     * Gets the commit message for an exceptional version bump in the next branch. The next
     * branch version will be bumped without the release being published in some situations.
     * More details can be found in the `MoveNextIntoFeatureFreeze` release action and in:
     * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
     */
    function getCommitMessageForExceptionalNextVersionBump(newVersion) {
        return "release: bump the next branch to v" + newVersion;
    }
    exports.getCommitMessageForExceptionalNextVersionBump = getCommitMessageForExceptionalNextVersionBump;
    /**
     * Gets the commit message for a version update in the next branch to a major version. The next
     * branch version will be updated without the release being published if the branch is configured
     * as a major. More details can be found in the `ConfigureNextAsMajor` release action and in:
     * https://hackmd.io/2Le8leq0S6G_R5VEVTNK9A.
     */
    function getCommitMessageForNextBranchMajorSwitch(newVersion) {
        return "release: switch the next branch to v" + newVersion;
    }
    exports.getCommitMessageForNextBranchMajorSwitch = getCommitMessageForNextBranchMajorSwitch;
    /** Gets the commit message for a release notes cherry-pick commit */
    function getReleaseNoteCherryPickCommitMessage(newVersion) {
        return "docs: release notes for the v" + newVersion + " release";
    }
    exports.getReleaseNoteCherryPickCommitMessage = getReleaseNoteCherryPickCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWl0LW1lc3NhZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2NvbW1pdC1tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILHNFQUFzRTtJQUN0RSxTQUFnQiwwQkFBMEIsQ0FBQyxVQUF5QjtRQUNsRSxPQUFPLHVCQUFxQixVQUFVLGFBQVUsQ0FBQztJQUNuRCxDQUFDO0lBRkQsZ0VBRUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLDZDQUE2QyxDQUFDLFVBQXlCO1FBQ3JGLE9BQU8sdUNBQXFDLFVBQVksQ0FBQztJQUMzRCxDQUFDO0lBRkQsc0dBRUM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQWdCLHdDQUF3QyxDQUFDLFVBQXlCO1FBQ2hGLE9BQU8seUNBQXVDLFVBQVksQ0FBQztJQUM3RCxDQUFDO0lBRkQsNEZBRUM7SUFFRCxxRUFBcUU7SUFDckUsU0FBZ0IscUNBQXFDLENBQUMsVUFBeUI7UUFDN0UsT0FBTyxrQ0FBZ0MsVUFBVSxhQUFVLENBQUM7SUFDOUQsQ0FBQztJQUZELHNGQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG4vKiogR2V0cyB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIGEgbmV3IHJlbGVhc2UgcG9pbnQgaW4gdGhlIHByb2plY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0TWVzc2FnZUZvclJlbGVhc2UobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcik6IHN0cmluZyB7XG4gIHJldHVybiBgcmVsZWFzZTogY3V0IHRoZSB2JHtuZXdWZXJzaW9ufSByZWxlYXNlYDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBjb21taXQgbWVzc2FnZSBmb3IgYW4gZXhjZXB0aW9uYWwgdmVyc2lvbiBidW1wIGluIHRoZSBuZXh0IGJyYW5jaC4gVGhlIG5leHRcbiAqIGJyYW5jaCB2ZXJzaW9uIHdpbGwgYmUgYnVtcGVkIHdpdGhvdXQgdGhlIHJlbGVhc2UgYmVpbmcgcHVibGlzaGVkIGluIHNvbWUgc2l0dWF0aW9ucy5cbiAqIE1vcmUgZGV0YWlscyBjYW4gYmUgZm91bmQgaW4gdGhlIGBNb3ZlTmV4dEludG9GZWF0dXJlRnJlZXplYCByZWxlYXNlIGFjdGlvbiBhbmQgaW46XG4gKiBodHRwczovL2hhY2ttZC5pby8yTGU4bGVxMFM2R19SNVZFVlROSzlBLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tbWl0TWVzc2FnZUZvckV4Y2VwdGlvbmFsTmV4dFZlcnNpb25CdW1wKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpIHtcbiAgcmV0dXJuIGByZWxlYXNlOiBidW1wIHRoZSBuZXh0IGJyYW5jaCB0byB2JHtuZXdWZXJzaW9ufWA7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIGEgdmVyc2lvbiB1cGRhdGUgaW4gdGhlIG5leHQgYnJhbmNoIHRvIGEgbWFqb3IgdmVyc2lvbi4gVGhlIG5leHRcbiAqIGJyYW5jaCB2ZXJzaW9uIHdpbGwgYmUgdXBkYXRlZCB3aXRob3V0IHRoZSByZWxlYXNlIGJlaW5nIHB1Ymxpc2hlZCBpZiB0aGUgYnJhbmNoIGlzIGNvbmZpZ3VyZWRcbiAqIGFzIGEgbWFqb3IuIE1vcmUgZGV0YWlscyBjYW4gYmUgZm91bmQgaW4gdGhlIGBDb25maWd1cmVOZXh0QXNNYWpvcmAgcmVsZWFzZSBhY3Rpb24gYW5kIGluOlxuICogaHR0cHM6Ly9oYWNrbWQuaW8vMkxlOGxlcTBTNkdfUjVWRVZUTks5QS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENvbW1pdE1lc3NhZ2VGb3JOZXh0QnJhbmNoTWFqb3JTd2l0Y2gobmV3VmVyc2lvbjogc2VtdmVyLlNlbVZlcikge1xuICByZXR1cm4gYHJlbGVhc2U6IHN3aXRjaCB0aGUgbmV4dCBicmFuY2ggdG8gdiR7bmV3VmVyc2lvbn1gO1xufVxuXG4vKiogR2V0cyB0aGUgY29tbWl0IG1lc3NhZ2UgZm9yIGEgcmVsZWFzZSBub3RlcyBjaGVycnktcGljayBjb21taXQgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSZWxlYXNlTm90ZUNoZXJyeVBpY2tDb21taXRNZXNzYWdlKG5ld1ZlcnNpb246IHNlbXZlci5TZW1WZXIpOiBzdHJpbmcge1xuICByZXR1cm4gYGRvY3M6IHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSB2JHtuZXdWZXJzaW9ufSByZWxlYXNlYDtcbn1cbiJdfQ==