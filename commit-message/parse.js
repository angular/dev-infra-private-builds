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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcGFyc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBZUgsZ0RBQWdEO0lBQ2hELElBQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQztJQUNwQyw4Q0FBOEM7SUFDOUMsSUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztJQUNuRixpREFBaUQ7SUFDakQsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsaURBQWlEO0lBQ2pELElBQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLDJEQUEyRDtJQUMzRCxJQUFNLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCw4REFBOEQ7SUFDOUQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsZ0RBQWdEO0lBQ2hELElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDO0lBRTNDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUIsSUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBRSxDQUFDO1lBQ3ZELElBQUksR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QixLQUFLLEdBQUcsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUIsT0FBTyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pDO1FBQ0QsT0FBTztZQUNMLE1BQU0sUUFBQTtZQUNOLElBQUksTUFBQTtZQUNKLGtCQUFrQixvQkFBQTtZQUNsQixJQUFJLE1BQUE7WUFDSixLQUFLLE9BQUE7WUFDTCxPQUFPLFNBQUE7WUFDUCxPQUFPLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDeEMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDMUMsUUFBUSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7U0FDM0MsQ0FBQztJQUNKLENBQUM7SUFuQ0QsZ0RBbUNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKiBBIHBhcnNlZCBjb21taXQgbWVzc2FnZS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGFyc2VkQ29tbWl0TWVzc2FnZSB7XG4gIGhlYWRlcjogc3RyaW5nO1xuICBib2R5OiBzdHJpbmc7XG4gIGJvZHlXaXRob3V0TGlua2luZzogc3RyaW5nO1xuICB0eXBlOiBzdHJpbmc7XG4gIHNjb3BlOiBzdHJpbmc7XG4gIHN1YmplY3Q6IHN0cmluZztcbiAgaXNGaXh1cDogYm9vbGVhbjtcbiAgaXNTcXVhc2g6IGJvb2xlYW47XG4gIGlzUmV2ZXJ0OiBib29sZWFuO1xufVxuXG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSBmaXh1cC4gKi9cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuLyoqIFJlZ2V4IGZpbmRpbmcgYWxsIGdpdGh1YiBrZXl3b3JkIGxpbmtzLiAqL1xuY29uc3QgR0lUSFVCX0xJTktJTkdfUkUgPSAvKChjbG9zZWQ/cz8pfChmaXgoZXMpPyhlZCk/KXwocmVzb2x2ZWQ/cz8pKVxcc1xcIyhcXGQrKS9pZztcbi8qKiBSZWdleCBkZXRlcm1pbmluZyBpZiBhIGNvbW1pdCBpcyBhIHNxdWFzaC4gKi9cbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgaWYgYSBjb21taXQgaXMgYSByZXZlcnQuICovXG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbi8qKiBSZWdleCBkZXRlcm1pbmluZyB0aGUgc2NvcGUgb2YgYSBjb21taXQgaWYgcHJvdmlkZWQuICovXG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG4vKiogUmVnZXggZGV0ZXJtaW5pbmcgdGhlIGVudGlyZSBoZWFkZXIgbGluZSBvZiB0aGUgY29tbWl0LiAqL1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuLyoqIFJlZ2V4IGRldGVybWluaW5nIHRoZSBib2R5IG9mIHRoZSBjb21taXQuICovXG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oW1xcc1xcU10qKSQvO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpOiBQYXJzZWRDb21taXRNZXNzYWdlIHtcbiAgbGV0IGhlYWRlciA9ICcnO1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgYm9keVdpdGhvdXRMaW5raW5nID0gJyc7XG4gIGxldCB0eXBlID0gJyc7XG4gIGxldCBzY29wZSA9ICcnO1xuICBsZXQgc3ViamVjdCA9ICcnO1xuXG4gIGlmIChDT01NSVRfSEVBREVSX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGhlYWRlciA9IENPTU1JVF9IRUFERVJfUkUuZXhlYyhjb21taXRNc2cpIVsxXVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShGSVhVUF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShTUVVBU0hfUFJFRklYX1JFLCAnJyk7XG4gIH1cbiAgaWYgKENPTU1JVF9CT0RZX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGJvZHkgPSBDT01NSVRfQk9EWV9SRS5leGVjKGNvbW1pdE1zZykhWzFdO1xuICAgIGJvZHlXaXRob3V0TGlua2luZyA9IGJvZHkucmVwbGFjZShHSVRIVUJfTElOS0lOR19SRSwgJycpO1xuICB9XG5cbiAgaWYgKFRZUEVfU0NPUEVfUkUudGVzdChoZWFkZXIpKSB7XG4gICAgY29uc3QgcGFyc2VkQ29tbWl0SGVhZGVyID0gVFlQRV9TQ09QRV9SRS5leGVjKGhlYWRlcikhO1xuICAgIHR5cGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMV07XG4gICAgc2NvcGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMl07XG4gICAgc3ViamVjdCA9IHBhcnNlZENvbW1pdEhlYWRlclszXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhlYWRlcixcbiAgICBib2R5LFxuICAgIGJvZHlXaXRob3V0TGlua2luZyxcbiAgICB0eXBlLFxuICAgIHNjb3BlLFxuICAgIHN1YmplY3QsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1NxdWFzaDogU1FVQVNIX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNSZXZlcnQ6IFJFVkVSVF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICB9O1xufVxuIl19