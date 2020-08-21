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
        define("@angular/dev-infra-private/commit-message/parse", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCommitMessage = void 0;
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
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBZUgsZ0RBQWdEO0lBQ2hELElBQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQztJQUNwQyw4Q0FBOEM7SUFDOUMsSUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztJQUNuRixpREFBaUQ7SUFDakQsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLDJEQUEyRDtJQUMzRCxJQUFNLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCw4REFBOEQ7SUFDOUQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsZ0RBQWdEO0lBQ2hELElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDO0lBRTNDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxnR0FBZ0c7UUFDaEcsNkRBQTZEO1FBQzdELFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVuRixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsSUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBQ3ZELElBQUksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsT0FBTyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTztZQUNMLE1BQU0sUUFBQTtZQUNOLElBQUksTUFBQTtZQUNKLGtCQUFrQixvQkFBQTtZQUNsQixJQUFJLE1BQUE7WUFDSixLQUFLLE9BQUE7WUFDTCxPQUFPLFNBQUE7WUFDUCxPQUFPLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDeEMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDMUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDM0MsQ0FBQztJQUNKLENBQUM7SUF2Q0QsZ0RBdUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBBIHBhcnNlZCBjb21taXQgbWVzc2FnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tbWl0TWVzc2FnZSB7XG4gIGhlYWRlcjogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGJvZHlXaXRob3V0TGlua2luZzogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIHNjb3BlOiBzdHJpbmc7XG4gIHN1YmplY3Q6IHN0cmluZztcbiAgaXNGaXh1cDogYm9vbGVhbjtcbiAgaXNTcXVhc2g6IGJvb2xlYW47XG4gIGlzUmV2ZXJ0OiBib29sZWFuO1xufVxuXG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSBmaXh1cC4gKi9cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuLyoqIFJlZ2V4IGZpbmRpbmcgYWxsIGdpdGh1YiBrZXl3b3JkIGxpbmtzLiAqL1xuY29uc3QgR0lUSFVCX0xJTktJTkdfUkUgPSAvKChjbG9zZWQ/cz8pfChmaXgoZXMpPyhlZCk/KXwocmVzb2x2ZWQ/cz8pKVxcc1xcIyhcXGQrKS9pZztcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHNxdWFzaC4gKi9cbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSByZXZlcnQuICovXG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyB0aGUgc2NvcGUgb2YgYSBjb21taXQgaWYgcHJvdmlkZWQuICovXG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgdGhlIGVudGlyZSBoZWFkZXIgbGluZSBvZiB0aGUgY29tbWl0LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuLyoqIFJlZ2V4IGRldGVybWluaW5nIHRoZSBib2R5IG9mIHRoZSBjb21taXQuICovXG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oW1xcc1xcU10qKSQvO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpOiBQYXJzZWRDb21taXRNZXNzYWdlIHtcbiAgLy8gSWdub3JlIGNvbW1lbnRzIChpLmUuIGxpbmVzIHN0YXJ0aW5nIHdpdGggYCNgKS4gQ29tbWVudHMgYXJlIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBieSBnaXQgYW5kXG4gIC8vIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCBwYXJ0IG9mIHRoZSBmaW5hbCBjb21taXQgbWVzc2FnZS5cbiAgY29tbWl0TXNnID0gY29tbWl0TXNnLnNwbGl0KCdcXG4nKS5maWx0ZXIobGluZSA9PiAhbGluZS5zdGFydHNXaXRoKCcjJykpLmpvaW4oJ1xcbicpO1xuXG4gIGxldCBoZWFkZXIgPSAnJztcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IGJvZHlXaXRob3V0TGlua2luZyA9ICcnO1xuICBsZXQgdHlwZSA9ICcnO1xuICBsZXQgc2NvcGUgPSAnJztcbiAgbGV0IHN1YmplY3QgPSAnJztcblxuICBpZiAoQ09NTUlUX0hFQURFUl9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBoZWFkZXIgPSBDT01NSVRfSEVBREVSX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV1cbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpO1xuICB9XG4gIGlmIChDT01NSVRfQk9EWV9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBib2R5ID0gQ09NTUlUX0JPRFlfUkUuZXhlYyhjb21taXRNc2cpIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpITtcbiAgICB0eXBlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzFdO1xuICAgIHNjb3BlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzJdO1xuICAgIHN1YmplY3QgPSBwYXJzZWRDb21taXRIZWFkZXJbM107XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBoZWFkZXIsXG4gICAgYm9keSxcbiAgICBib2R5V2l0aG91dExpbmtpbmcsXG4gICAgdHlwZSxcbiAgICBzY29wZSxcbiAgICBzdWJqZWN0LFxuICAgIGlzRml4dXA6IEZJWFVQX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgfTtcbn1cbiJdfQ==