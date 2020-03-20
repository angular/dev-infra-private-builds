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
    function validateCommitMessage(commitMsg, disallowSquash, nonFixupCommitHeaders) {
        if (disallowSquash === void 0) { disallowSquash = false; }
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
        if (commit.isSquash && disallowSquash) {
            error('The commit must be manually squashed into the target commit');
            return false;
        }
        // If it is a fixup commit and `nonFixupCommitHeaders` is not empty, we only care to check whether
        // there is a corresponding non-fixup commit (i.e. a commit whose header is identical to this
        // commit's header after stripping the `fixup! ` prefix).
        if (commit.isFixup && nonFixupCommitHeaders) {
            if (!nonFixupCommitHeaders.includes(commit.header)) {
                error('Unable to find match for fixup commit among prior commits: ' +
                    (nonFixupCommitHeaders.map(function (x) { return "\n      " + x; }).join('') || '-'));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxrRUFBb0Q7SUFHcEQsSUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLElBQU0saUJBQWlCLEdBQUcsd0RBQXdELENBQUM7SUFDbkYsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7SUFDdkMsSUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsSUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDO0lBRXRDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNoQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFjLENB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ICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Z2V0QW5ndWxhckRldkNvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7Q29tbWl0TWVzc2FnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG5jb25zdCBGSVhVUF9QUkVGSVhfUkUgPSAvXmZpeHVwISAvaTtcbmNvbnN0IEdJVEhVQl9MSU5LSU5HX1JFID0gLygoY2xvc2VkP3M/KXwoZml4KGVzKT8oZWQpPyl8KHJlc29sdmVkP3M/KSlcXHNcXCMoXFxkKykvaWc7XG5jb25zdCBTUVVBU0hfUFJFRklYX1JFID0gL15zcXVhc2ghIC9pO1xuY29uc3QgUkVWRVJUX1BSRUZJWF9SRSA9IC9ecmV2ZXJ0Oj8gL2k7XG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG5jb25zdCBDT01NSVRfSEVBREVSX1JFID0gL14oLiopL2k7XG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oLiopL2k7XG5cbi8qKiBQYXJzZSBhIGZ1bGwgY29tbWl0IG1lc3NhZ2UgaW50byBpdHMgY29tcG9zaXRlIHBhcnRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2c6IHN0cmluZykge1xuICBsZXQgaGVhZGVyID0gJyc7XG4gIGxldCBib2R5ID0gJyc7XG4gIGxldCBib2R5V2l0aG91dExpbmtpbmcgPSAnJztcbiAgbGV0IHR5cGUgPSAnJztcbiAgbGV0IHNjb3BlID0gJyc7XG4gIGxldCBzdWJqZWN0ID0gJyc7XG5cbiAgaWYgKENPTU1JVF9IRUFERVJfUkUudGVzdChjb21taXRNc2cpKSB7XG4gICAgaGVhZGVyID0gQ09NTUlUX0hFQURFUl9SRS5leGVjKGNvbW1pdE1zZykgIVsxXVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShGSVhVUF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShTUVVBU0hfUFJFRklYX1JFLCAnJyk7XG4gIH1cbiAgaWYgKENPTU1JVF9CT0RZX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGJvZHkgPSBDT01NSVRfQk9EWV9SRS5leGVjKGNvbW1pdE1zZykgIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpICE7XG4gICAgdHlwZSA9IHBhcnNlZENvbW1pdEhlYWRlclsxXTtcbiAgICBzY29wZSA9IHBhcnNlZENvbW1pdEhlYWRlclsyXTtcbiAgICBzdWJqZWN0ID0gcGFyc2VkQ29tbWl0SGVhZGVyWzNdO1xuICB9XG4gIHJldHVybiB7XG4gICAgaGVhZGVyLFxuICAgIGJvZHksXG4gICAgYm9keVdpdGhvdXRMaW5raW5nLFxuICAgIHR5cGUsXG4gICAgc2NvcGUsXG4gICAgc3ViamVjdCxcbiAgICBpc0ZpeHVwOiBGSVhVUF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1JldmVydDogUkVWRVJUX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gIH07XG59XG5cblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmcsIGRpc2FsbG93U3F1YXNoOiBib29sZWFuID0gZmFsc2UsIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdKSB7XG4gIGZ1bmN0aW9uIGVycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgY29uc29sZS5lcnJvcihcbiAgICAgICAgYElOVkFMSUQgQ09NTUlUIE1TRzogXFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGAke2NvbW1pdE1zZ31cXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYEVSUk9SOiBcXG5gICtcbiAgICAgICAgYCAgJHtlcnJvck1lc3NhZ2V9YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYFRoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiBcXG5gICtcbiAgICAgICAgYDx0eXBlPig8c2NvcGU+KTogPHN1YmplY3Q+XFxuXFxuPGJvZHk+YCk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRBbmd1bGFyRGV2Q29uZmlnPCdjb21taXRNZXNzYWdlJywgQ29tbWl0TWVzc2FnZUNvbmZpZz4oKS5jb21taXRNZXNzYWdlO1xuICBjb25zdCBjb21taXQgPSBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKTtcblxuICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoY29tbWl0LmlzU3F1YXNoICYmIGRpc2FsbG93U3F1YXNoKSB7XG4gICAgZXJyb3IoJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gSWYgaXQgaXMgYSBmaXh1cCBjb21taXQgYW5kIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2Ugb25seSBjYXJlIHRvIGNoZWNrIHdoZXRoZXJcbiAgLy8gdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzXG4gIC8vIGNvbW1pdCdzIGhlYWRlciBhZnRlciBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLlxuICBpZiAoY29tbWl0LmlzRml4dXAgJiYgbm9uRml4dXBDb21taXRIZWFkZXJzKSB7XG4gICAgaWYgKCFub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgIChub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgZXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29uZmlnLnR5cGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKSkge1xuICAgIGVycm9yKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke2NvbmZpZy50eXBlcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb21taXQuc2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgIGVycm9yKGAnJHtjb21taXQuc2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29tbWl0LmJvZHlXaXRob3V0TGlua2luZy50cmltKCkubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7Y29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICBpZiAoYm9keUJ5TGluZS5zb21lKGxpbmUgPT4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYFRoZSBjb21taXQgbWVzc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19