(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate", ["require", "exports", "@angular/dev-infra-private/commit-message/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var config_1 = require("@angular/dev-infra-private/commit-message/config");
    var FIXUP_PREFIX_RE = /^fixup! /i;
    var GITHUB_LINKING_RE = /((closed?s?)|(fix(es)?(ed)?)|(resolved?s?))\s\#(\d+)/ig;
    var SQUASH_PREFIX_RE = /^squash! /i;
    var REVERT_PREFIX_RE = /^revert:? /i;
    var TYPE_SCOPE_RE = /^(\w+)(?:\(([^)]+)\))?\:\s(.+)$/;
    var COMMIT_HEADER_RE = /^(.*)/i;
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
    /** Validate a commit message against using the local repo's config. */
    function validateCommitMessage(commitMsg, options) {
        if (options === void 0) { options = {}; }
        function error(errorMessage) {
            console.error("INVALID COMMIT MSG: \n" +
                ('─'.repeat(40) + "\n") +
                (commitMsg + "\n") +
                ('─'.repeat(40) + "\n") +
                "ERROR: \n" +
                ("  " + errorMessage) +
                "\n\n" +
                "The expected format for a commit is: \n" +
                "<type>(<scope>): <subject>\n\n<body>");
        }
        var config = config_1.getCommitMessageConfig().commitMessage;
        var commit = parseCommitMessage(commitMsg);
        ////////////////////////////////////
        // Checking revert, squash, fixup //
        ////////////////////////////////////
        // All revert commits are considered valid.
        if (commit.isRevert) {
            return true;
        }
        // All squashes are considered valid, as the commit will be squashed into another in
        // the git history anyway, unless the options provided to not allow squash commits.
        if (commit.isSquash) {
            if (options.disallowSquash) {
                error('The commit must be manually squashed into the target commit');
                return false;
            }
            return true;
        }
        // Fixups commits are considered valid, unless nonFixupCommitHeaders are provided to check
        // against. If `nonFixupCommitHeaders` is not empty, we check whether there is a corresponding
        // non-fixup commit (i.e. a commit whose header is identical to this commit's header after
        // stripping the `fixup! ` prefix), otherwise we assume this verification will happen in another
        // check.
        if (commit.isFixup) {
            if (options.nonFixupCommitHeaders && !options.nonFixupCommitHeaders.includes(commit.header)) {
                error('Unable to find match for fixup commit among prior commits: ' +
                    (options.nonFixupCommitHeaders.map(function (x) { return "\n      " + x; }).join('') || '-'));
                return false;
            }
            return true;
        }
        ////////////////////////////
        // Checking commit header //
        ////////////////////////////
        if (commit.header.length > config.maxLineLength) {
            error("The commit message header is longer than " + config.maxLineLength + " characters");
            return false;
        }
        if (!commit.type) {
            error("The commit message header does not match the expected format.");
            return false;
        }
        if (!config.types.includes(commit.type)) {
            error("'" + commit.type + "' is not an allowed type.\n => TYPES: " + config.types.join(', '));
            return false;
        }
        if (commit.scope && !config.scopes.includes(commit.scope)) {
            error("'" + commit.scope + "' is not an allowed scope.\n => SCOPES: " + config.scopes.join(', '));
            return false;
        }
        //////////////////////////
        // Checking commit body //
        //////////////////////////
        if (commit.bodyWithoutLinking.trim().length < config.minBodyLength) {
            error("The commit message body does not meet the minimum length of " + config.minBodyLength + " characters");
            return false;
        }
        var bodyByLine = commit.body.split('\n');
        if (bodyByLine.some(function (line) { return line.length > config.maxLineLength; })) {
            error("The commit messsage body contains lines greater than " + config.maxLineLength + " characters");
            return false;
        }
        return true;
    }
    exports.validateCommitMessage = validateCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyRUFBZ0Q7SUFRaEQsSUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLElBQU0saUJBQWlCLEdBQUcsd0RBQXdELENBQUM7SUFDbkYsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7SUFDdkMsSUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsSUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUM7SUFFM0MsNERBQTREO0lBQzVELFNBQWdCLGtCQUFrQixDQUFDLFNBQWlCO1FBQ2xELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFakIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQy9CLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2lCQUM1QixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDN0M7UUFDRCxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxHQUFHLGNBQWMs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QUFVLENBQUMsSUFBSSxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFsQyxDQUFrQyxDQUFDLEVBQUU7WUFDL0QsS0FBSyxDQUNELDBEQUF3RCxNQUFNLENBQUMsYUFBYSxnQkFBYSxDQUFDLENBQUM7WUFDL0YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQTlGRCxzREE4RkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VDb25maWd9IGZyb20gJy4vY29uZmlnJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG5jb25zdCBGSVhVUF9QUkVGSVhfUkUgPSAvXmZpeHVwISAvaTtcbmNvbnN0IEdJVEhVQl9MSU5LSU5HX1JFID0gLygoY2xvc2VkP3M/KXwoZml4KGVzKT8oZWQpPyl8KHJlc29sdmVkP3M/KSlcXHNcXCMoXFxkKykvaWc7XG5jb25zdCBTUVVBU0hfUFJFRklYX1JFID0gL15zcXVhc2ghIC9pO1xuY29uc3QgUkVWRVJUX1BSRUZJWF9SRSA9IC9ecmV2ZXJ0Oj8gL2k7XG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG5jb25zdCBDT01NSVRfSEVBREVSX1JFID0gL14oLiopL2k7XG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oW1xcc1xcU10qKSQvO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpIHtcbiAgbGV0IGhlYWRlciA9ICcnO1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgYm9keVdpdGhvdXRMaW5raW5nID0gJyc7XG4gIGxldCB0eXBlID0gJyc7XG4gIGxldCBzY29wZSA9ICcnO1xuICBsZXQgc3ViamVjdCA9ICcnO1xuXG4gIGlmIChDT01NSVRfSEVBREVSX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGhlYWRlciA9IENPTU1JVF9IRUFERVJfUkUuZXhlYyhjb21taXRNc2cpIVsxXVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShGSVhVUF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShTUVVBU0hfUFJFRklYX1JFLCAnJyk7XG4gIH1cbiAgaWYgKENPTU1JVF9CT0RZX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGJvZHkgPSBDT01NSVRfQk9EWV9SRS5leGVjKGNvbW1pdE1zZykhWzFdO1xuICAgIGJvZHlXaXRob3V0TGlua2luZyA9IGJvZHkucmVwbGFjZShHSVRIVUJfTElOS0lOR19SRSwgJycpO1xuICB9XG5cbiAgaWYgKFRZUEVfU0NPUEVfUkUudGVzdChoZWFkZXIpKSB7XG4gICAgY29uc3QgcGFyc2VkQ29tbWl0SGVhZGVyID0gVFlQRV9TQ09QRV9SRS5leGVjKGhlYWRlcikhO1xuICAgIHR5cGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMV07XG4gICAgc2NvcGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMl07XG4gICAgc3ViamVjdCA9IHBhcnNlZENvbW1pdEhlYWRlclszXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhlYWRlcixcbiAgICBib2R5LFxuICAgIGJvZHlXaXRob3V0TGlua2luZyxcbiAgICB0eXBlLFxuICAgIHNjb3BlLFxuICAgIHN1YmplY3QsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1NxdWFzaDogU1FVQVNIX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNSZXZlcnQ6IFJFVkVSVF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICB9O1xufVxuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgICBjb21taXRNc2c6IHN0cmluZywgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHt9KSB7XG4gIGZ1bmN0aW9uIGVycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYElOVkFMSUQgQ09NTUlUIE1TRzogXFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGAke2NvbW1pdE1zZ31cXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYEVSUk9SOiBcXG5gICtcbiAgICAgICAgYCAgJHtlcnJvck1lc3NhZ2V9YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYFRoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiBcXG5gICtcbiAgICAgICAgYDx0eXBlPig8c2NvcGU+KTogPHN1YmplY3Q+XFxuXFxuPGJvZHk+YCk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZyk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgIGVycm9yKCdUaGUgY29tbWl0IG11c3QgYmUgbWFudWFsbHkgc3F1YXNoZWQgaW50byB0aGUgdGFyZ2V0IGNvbW1pdCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAvLyBhZ2FpbnN0LiBJZiBgbm9uRml4dXBDb21taXRIZWFkZXJzYCBpcyBub3QgZW1wdHksIHdlIGNoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nXG4gIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgLy8gY2hlY2suXG4gIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyBjb21taXQgaGVhZGVyIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb21taXQudHlwZSkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb25maWcudHlwZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7Y29uZmlnLnR5cGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgaWYgKGNvbW1pdC5ib2R5V2l0aG91dExpbmtpbmcudHJpbSgpLmxlbmd0aCA8IGNvbmZpZy5taW5Cb2R5TGVuZ3RoKSB7XG4gICAgZXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgaWYgKGJvZHlCeUxpbmUuc29tZShsaW5lID0+IGxpbmUubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==