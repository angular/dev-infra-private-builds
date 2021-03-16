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
        define("@angular/dev-infra-private/commit-message/parse", ["require", "exports", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommitMessagesForRange = exports.parseCommitMessage = void 0;
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /** Regex determining if a commit is a fixup. */
    var FIXUP_PREFIX_RE = /^fixup! /i;
    /** Regex finding all github keyword links. */
    var GITHUB_LINKING_RE = /((closed?s?)|(fix(es)?(ed)?)|(resolved?s?))\s\#(\d+)/ig;
    /** Regex determining if a commit is a squash. */
    var SQUASH_PREFIX_RE = /^squash! /i;
    /** Regex determining if a commit is a revert. */
    var REVERT_PREFIX_RE = /^revert:? /i;
    /** Regex determining the scope of a commit if provided. */
    var TYPE_SCOPE_RE = /^(\w+)(?:\(([^)]+)\))?\:\s(.+)$/;
    /** Regex determining the entire header line of the commit. */
    var COMMIT_HEADER_RE = /^(.*)/i;
    /** Regex determining the body of the commit. */
    var COMMIT_BODY_RE = /^.*\n\n([\s\S]*)$/;
    /** Parse a full commit message into its composite parts. */
    function parseCommitMessage(commitMsg) {
        // Ignore comments (i.e. lines starting with `#`). Comments are automatically removed by git and
        // should not be considered part of the final commit message.
        commitMsg = commitMsg.split('\n').filter(function (line) { return !line.startsWith('#'); }).join('\n');
        var header = '';
        var body = '';
        var bodyWithoutLinking = '';
        var type = '';
        var scope = '';
        var subject = '';
        if (COMMIT_HEADER_RE.test(commitMsg)) {
            header = COMMIT_HEADER_RE.exec(commitMsg)[1]
                .replace(FIXUP_PREFIX_RE, '')
                .replace(SQUASH_PREFIX_RE, '');
        }
        if (COMMIT_BODY_RE.test(commitMsg)) {
            body = COMMIT_BODY_RE.exec(commitMsg)[1];
            bodyWithoutLinking = body.replace(GITHUB_LINKING_RE, '');
        }
        if (TYPE_SCOPE_RE.test(header)) {
            var parsedCommitHeader = TYPE_SCOPE_RE.exec(header);
            type = parsedCommitHeader[1];
            scope = parsedCommitHeader[2];
            subject = parsedCommitHeader[3];
        }
        return {
            header: header,
            body: body,
            bodyWithoutLinking: bodyWithoutLinking,
            type: type,
            scope: scope,
            subject: subject,
            isFixup: FIXUP_PREFIX_RE.test(commitMsg),
            isSquash: SQUASH_PREFIX_RE.test(commitMsg),
            isRevert: REVERT_PREFIX_RE.test(commitMsg),
        };
    }
    exports.parseCommitMessage = parseCommitMessage;
    /** Retrieve and parse each commit message in a provide range. */
    function parseCommitMessagesForRange(range) {
        /** A random number used as a split point in the git log result. */
        var randomValueSeparator = "" + Math.random();
        /**
         * Custom git log format that provides the commit header and body, separated as expected with the
         * custom separator as the trailing value.
         */
        var gitLogFormat = "%s%n%n%b" + randomValueSeparator;
        // Retrieve the commits in the provided range.
        var result = shelljs_1.exec("git log --reverse --format=" + gitLogFormat + " " + range);
        if (result.code) {
            throw new Error("Failed to get all commits in the range:\n  " + result.stderr);
        }
        return result
            // Separate the commits from a single string into individual commits.
            .split(randomValueSeparator)
            // Remove extra space before and after each commit message.
            .map(function (l) { return l.trim(); })
            // Remove any superfluous lines which remain from the split.
            .filter(function (line) { return !!line; })
            // Parse each commit message.
            .map(function (commit) { return parseCommitMessage(commit); });
    }
    exports.parseCommitMessagesForRange = parseCommitMessagesForRange;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXNDO0lBZXRDLGdEQUFnRDtJQUNoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsOENBQThDO0lBQzlDLElBQU0saUJBQWlCLEdBQUcsd0RBQXdELENBQUM7SUFDbkYsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLGlEQUFpRDtJQUNqRCxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2QywyREFBMkQ7SUFDM0QsSUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsOERBQThEO0lBQzlELElBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0lBQ2xDLGdEQUFnRDtJQUNoRCxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztJQUUzQyw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsU0FBaUI7UUFDbEQsZ0dBQWdHO1FBQ2hHLDZEQUE2RDtRQUM3RCxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQXJCLENBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbkYsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNwQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQztpQkFDL0IsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJQUFJLEdBQUcsY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzFEO1FBRUQsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQzlCLElBQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUUsQ0FBQztZQUN2RCxJQUFJLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDN0IsS0FBSyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU87WUFDTCxNQUFNLFFBQUE7WUFDTixJQUFJLE1BQUE7WUFDSixrQkFBa0Isb0JBQUE7WUFDbEIsSUFBSSxNQUFBO1lBQ0osS0FBSyxPQUFBO1lBQ0wsT0FBTyxTQUFBO1lBQ1AsT0FBTyxFQUFFLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ3hDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQzFDLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1NBQzNDLENBQUM7SUFDSixDQUFDO0lBdkNELGdEQXVDQztJQUVELGlFQUFpRTtJQUNqRSxTQUFnQiwyQkFBMkIsQ0FBQyxLQUFhO1FBQ3ZELG1FQUFtRTtRQUNuRSxJQUFNLG9CQUFvQixHQUFHLEtBQUcsSUFBSSxDQUFDLE1BQU0sRUFBSSxDQUFDO1FBQ2hEOzs7V0FHRztRQUNILElBQU0sWUFBWSxHQUFHLGFBQVcsb0JBQXNCLENBQUM7UUFFdkQsOENBQThDO1FBQzlDLElBQU0sTUFBTSxHQUFHLGNBQUksQ0FBQyxnQ0FBOEIsWUFBWSxTQUFJLEtBQU8sQ0FBQyxDQUFDO1FBQzNFLElBQUksTUFBTSxDQUFDLElBQUksRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQThDLE1BQU0sQ0FBQyxNQUFRLENBQUMsQ0FBQztTQUNoRjtRQUVELE9BQU8sTUFBTTtZQUNULHFFQUFxRTthQUNwRSxLQUFLLENBQUMsb0JBQW9CLENBQUM7WUFDNUIsMkRBQTJEO2FBQzFELEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBUixDQUFRLENBQUM7WUFDbkIsNERBQTREO2FBQzNELE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDO1lBQ3ZCLDZCQUE2QjthQUM1QixHQUFHLENBQUMsVUFBQSxNQUFNLElBQUksT0FBQSxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsRUFBMUIsQ0FBMEIsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUF4QkQsa0VBd0JDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vdXRpbHMvc2hlbGxqcyc7XG5cbi8qKiBBIHBhcnNlZCBjb21taXQgbWVzc2FnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tbWl0TWVzc2FnZSB7XG4gIGhlYWRlcjogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGJvZHlXaXRob3V0TGlua2luZzogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIHNjb3BlOiBzdHJpbmc7XG4gIHN1YmplY3Q6IHN0cmluZztcbiAgaXNGaXh1cDogYm9vbGVhbjtcbiAgaXNTcXVhc2g6IGJvb2xlYW47XG4gIGlzUmV2ZXJ0OiBib29sZWFuO1xufVxuXG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSBmaXh1cC4gKi9cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuLyoqIFJlZ2V4IGZpbmRpbmcgYWxsIGdpdGh1YiBrZXl3b3JkIGxpbmtzLiAqL1xuY29uc3QgR0lUSFVCX0xJTktJTkdfUkUgPSAvKChjbG9zZWQ/cz8pfChmaXgoZXMpPyhlZCk/KXwocmVzb2x2ZWQ/cz8pKVxcc1xcIyhcXGQrKS9pZztcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHNxdWFzaC4gKi9cbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSByZXZlcnQuICovXG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyB0aGUgc2NvcGUgb2YgYSBjb21taXQgaWYgcHJvdmlkZWQuICovXG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgdGhlIGVudGlyZSBoZWFkZXIgbGluZSBvZiB0aGUgY29tbWl0LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuLyoqIFJlZ2V4IGRldGVybWluaW5nIHRoZSBib2R5IG9mIHRoZSBjb21taXQuICovXG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oW1xcc1xcU10qKSQvO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpOiBQYXJzZWRDb21taXRNZXNzYWdlIHtcbiAgLy8gSWdub3JlIGNvbW1lbnRzIChpLmUuIGxpbmVzIHN0YXJ0aW5nIHdpdGggYCNgKS4gQ29tbWVudHMgYXJlIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBieSBnaXQgYW5kXG4gIC8vIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBmaW5hbCBjb21taXQgbWVzc2FnZS5cbiAgY29tbWl0TXNnID0gY29tbWl0TXNnLnNwbGl0KCdcXG4nKS5maWx0ZXIobGluZSA9PiAhbGluZS5zdGFydHNXaXRoKCcjJykpLmpvaW4oJ1xcbicpO1xuXG4gIGxldCBoZWFkZXIgPSAnJztcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IGJvZHlXaXRob3V0TGlua2luZyA9ICcnO1xuICBsZXQgdHlwZSA9ICcnO1xuICBsZXQgc2NvcGUgPSAnJztcbiAgbGV0IHN1YmplY3QgPSAnJztcblxuICBpZiAoQ09NTUlUX0hFQURFUl9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBoZWFkZXIgPSBDT01NSVRfSEVBREVSX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV1cbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpO1xuICB9XG4gIGlmIChDT01NSVRfQk9EWV9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBib2R5ID0gQ09NTUlUX0JPRFlfUkUuZXhlYyhjb21taXRNc2cpIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpITtcbiAgICB0eXBlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzFdO1xuICAgIHNjb3BlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzJdO1xuICAgIHN1YmplY3QgPSBwYXJzZWRDb21taXRIZWFkZXJbM107XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBoZWFkZXIsXG4gICAgYm9keSxcbiAgICBib2R5V2l0aG91dExpbmtpbmcsXG4gICAgdHlwZSxcbiAgICBzY29wZSxcbiAgICBzdWJqZWN0LFxuICAgIGlzRml4dXA6IEZJWFVQX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgfTtcbn1cblxuLyoqIFJldHJpZXZlIGFuZCBwYXJzZSBlYWNoIGNvbW1pdCBtZXNzYWdlIGluIGEgcHJvdmlkZSByYW5nZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2VzRm9yUmFuZ2UocmFuZ2U6IHN0cmluZyk6IFBhcnNlZENvbW1pdE1lc3NhZ2VbXSB7XG4gIC8qKiBBIHJhbmRvbSBudW1iZXIgdXNlZCBhcyBhIHNwbGl0IHBvaW50IGluIHRoZSBnaXQgbG9nIHJlc3VsdC4gKi9cbiAgY29uc3QgcmFuZG9tVmFsdWVTZXBhcmF0b3IgPSBgJHtNYXRoLnJhbmRvbSgpfWA7XG4gIC8qKlxuICAgKiBDdXN0b20gZ2l0IGxvZyBmb3JtYXQgdGhhdCBwcm92aWRlcyB0aGUgY29tbWl0IGhlYWRlciBhbmQgYm9keSwgc2VwYXJhdGVkIGFzIGV4cGVjdGVkIHdpdGggdGhlXG4gICAqIGN1c3RvbSBzZXBhcmF0b3IgYXMgdGhlIHRyYWlsaW5nIHZhbHVlLlxuICAgKi9cbiAgY29uc3QgZ2l0TG9nRm9ybWF0ID0gYCVzJW4lbiViJHtyYW5kb21WYWx1ZVNlcGFyYXRvcn1gO1xuXG4gIC8vIFJldHJpZXZlIHRoZSBjb21taXRzIGluIHRoZSBwcm92aWRlZCByYW5nZS5cbiAgY29uc3QgcmVzdWx0ID0gZXhlYyhgZ2l0IGxvZyAtLXJldmVyc2UgLS1mb3JtYXQ9JHtnaXRMb2dGb3JtYXR9ICR7cmFuZ2V9YCk7XG4gIGlmIChyZXN1bHQuY29kZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGdldCBhbGwgY29tbWl0cyBpbiB0aGUgcmFuZ2U6XFxuICAke3Jlc3VsdC5zdGRlcnJ9YCk7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0XG4gICAgICAvLyBTZXBhcmF0ZSB0aGUgY29tbWl0cyBmcm9tIGEgc2luZ2xlIHN0cmluZyBpbnRvIGluZGl2aWR1YWwgY29tbWl0cy5cbiAgICAgIC5zcGxpdChyYW5kb21WYWx1ZVNlcGFyYXRvcilcbiAgICAgIC8vIFJlbW92ZSBleHRyYSBzcGFjZSBiZWZvcmUgYW5kIGFmdGVyIGVhY2ggY29tbWl0IG1lc3NhZ2UuXG4gICAgICAubWFwKGwgPT4gbC50cmltKCkpXG4gICAgICAvLyBSZW1vdmUgYW55IHN1cGVyZmx1b3VzIGxpbmVzIHdoaWNoIHJlbWFpbiBmcm9tIHRoZSBzcGxpdC5cbiAgICAgIC5maWx0ZXIobGluZSA9PiAhIWxpbmUpXG4gICAgICAvLyBQYXJzZSBlYWNoIGNvbW1pdCBtZXNzYWdlLlxuICAgICAgLm1hcChjb21taXQgPT4gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdCkpO1xufVxuIl19