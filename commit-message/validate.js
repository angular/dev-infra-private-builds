(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate", ["require", "exports", "@angular/dev-infra-private/utils/config"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var FIXUP_PREFIX_RE = /^fixup! /i;
    var GITHUB_LINKING_RE = /((closed?s?)|(fix(es)?(ed)?)|(resolved?s?))\s\#(\d+)/ig;
    var SQUASH_PREFIX_RE = /^squash! /i;
    var REVERT_PREFIX_RE = /^revert:? /i;
    var TYPE_SCOPE_RE = /^(\w+)(?:\(([^)]+)\))?\:\s(.+)$/;
    var COMMIT_HEADER_RE = /^(.*)/i;
    var COMMIT_BODY_RE = /^.*\n\n(.*)/i;
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
        var config = config_1.getAngularDevConfig().commitMessage;
        var commit = parseCommitMessage(commitMsg);
        if (commit.isRevert) {
            return true;
        }
        if (commit.isSquash && options.disallowSquash) {
            error('The commit must be manually squashed into the target commit');
            return false;
        }
        // If it is a fixup commit and `nonFixupCommitHeaders` is not empty, we only care to check whether
        // there is a corresponding non-fixup commit (i.e. a commit whose header is identical to this
        // commit's header after stripping the `fixup! ` prefix).
        if (commit.isFixup && options.nonFixupCommitHeaders) {
            if (!options.nonFixupCommitHeaders.includes(commit.header)) {
                error('Unable to find match for fixup commit among prior commits: ' +
                    (options.nonFixupCommitHeaders.map(function (x) { return "\n      " + x; }).join('') || '-'));
                return false;
            }
            return true;
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxrRUFBb0Q7SUFTcEQsSUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLElBQU0saUJBQWlCLEdBQUcsd0RBQXdELENBQUM7SUFDbkYsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7SUFDdkMsSUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsSUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBRXRDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFjLENB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Iiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtnZXRBbmd1bGFyRGV2Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtDb21taXRNZXNzYWdlQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgRklYVVBfUFJFRklYX1JFID0gL15maXh1cCEgL2k7XG5jb25zdCBHSVRIVUJfTElOS0lOR19SRSA9IC8oKGNsb3NlZD9zPyl8KGZpeChlcyk/KGVkKT8pfChyZXNvbHZlZD9zPykpXFxzXFwjKFxcZCspL2lnO1xuY29uc3QgU1FVQVNIX1BSRUZJWF9SRSA9IC9ec3F1YXNoISAvaTtcbmNvbnN0IFJFVkVSVF9QUkVGSVhfUkUgPSAvXnJldmVydDo/IC9pO1xuY29uc3QgVFlQRV9TQ09QRV9SRSA9IC9eKFxcdyspKD86XFwoKFteKV0rKVxcKSk/XFw6XFxzKC4rKSQvO1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuY29uc3QgQ09NTUlUX0JPRFlfUkUgPSAvXi4qXFxuXFxuKC4qKS9pO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpIHtcbiAgbGV0IGhlYWRlciA9ICcnO1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgYm9keVdpdGhvdXRMaW5raW5nID0gJyc7XG4gIGxldCB0eXBlID0gJyc7XG4gIGxldCBzY29wZSA9ICcnO1xuICBsZXQgc3ViamVjdCA9ICcnO1xuXG4gIGlmIChDT01NSVRfSEVBREVSX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGhlYWRlciA9IENPTU1JVF9IRUFERVJfUkUuZXhlYyhjb21taXRNc2cpIVsxXVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShGSVhVUF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShTUVVBU0hfUFJFRklYX1JFLCAnJyk7XG4gIH1cbiAgaWYgKENPTU1JVF9CT0RZX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGJvZHkgPSBDT01NSVRfQk9EWV9SRS5leGVjKGNvbW1pdE1zZykhWzFdO1xuICAgIGJvZHlXaXRob3V0TGlua2luZyA9IGJvZHkucmVwbGFjZShHSVRIVUJfTElOS0lOR19SRSwgJycpO1xuICB9XG5cbiAgaWYgKFRZUEVfU0NPUEVfUkUudGVzdChoZWFkZXIpKSB7XG4gICAgY29uc3QgcGFyc2VkQ29tbWl0SGVhZGVyID0gVFlQRV9TQ09QRV9SRS5leGVjKGhlYWRlcikhO1xuICAgIHR5cGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMV07XG4gICAgc2NvcGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMl07XG4gICAgc3ViamVjdCA9IHBhcnNlZENvbW1pdEhlYWRlclszXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhlYWRlcixcbiAgICBib2R5LFxuICAgIGJvZHlXaXRob3V0TGlua2luZyxcbiAgICB0eXBlLFxuICAgIHNjb3BlLFxuICAgIHN1YmplY3QsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1NxdWFzaDogU1FVQVNIX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNSZXZlcnQ6IFJFVkVSVF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICB9O1xufVxuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgICBjb21taXRNc2c6IHN0cmluZywgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHt9KSB7XG4gIGZ1bmN0aW9uIGVycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYElOVkFMSUQgQ09NTUlUIE1TRzogXFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGAke2NvbW1pdE1zZ31cXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYEVSUk9SOiBcXG5gICtcbiAgICAgICAgYCAgJHtlcnJvck1lc3NhZ2V9YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYFRoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiBcXG5gICtcbiAgICAgICAgYDx0eXBlPig8c2NvcGU+KTogPHN1YmplY3Q+XFxuXFxuPGJvZHk+YCk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRBbmd1bGFyRGV2Q29uZmlnPCdjb21taXRNZXNzYWdlJywgQ29tbWl0TWVzc2FnZUNvbmZpZz4oKS5jb21taXRNZXNzYWdlO1xuICBjb25zdCBjb21taXQgPSBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKTtcblxuICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoY29tbWl0LmlzU3F1YXNoICYmIG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICBlcnJvcignVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBJZiBpdCBpcyBhIGZpeHVwIGNvbW1pdCBhbmQgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBvbmx5IGNhcmUgdG8gY2hlY2sgd2hldGhlclxuICAvLyB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmcgbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXNcbiAgLy8gY29tbWl0J3MgaGVhZGVyIGFmdGVyIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCkuXG4gIGlmIChjb21taXQuaXNGaXh1cCAmJiBvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycykge1xuICAgIGlmICghb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb21taXQudHlwZSkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb25maWcudHlwZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7Y29uZmlnLnR5cGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb21taXQuYm9keVdpdGhvdXRMaW5raW5nLnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICBjb25maWcubWluQm9keUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGJvZHlCeUxpbmUgPSBjb21taXQuYm9keS5zcGxpdCgnXFxuJyk7XG4gIGlmIChib2R5QnlMaW5lLnNvbWUobGluZSA9PiBsaW5lLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSkge1xuICAgIGVycm9yKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=