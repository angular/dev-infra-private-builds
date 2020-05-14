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
    exports.validateCommitMessage = exports.parseCommitMessage = void 0;
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
        // Commits with the type of `release` do not require a commit body.
        if (commit.type === 'release') {
            return true;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQWdEO0lBUWhELElBQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxJQUFNLGlCQUFpQixHQUFHLHdEQUF3RCxDQUFDO0lBQ25GLElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLElBQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLElBQU0sYUFBYSxHQUFHLGlDQUFpQyxDQUFDO0lBQ3hELElBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0lBQ2xDLElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDO0lBRTNDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFj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Q2Q7UUFFRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQWxDLENBQWtDLENBQUMsRUFBRTtZQUMvRCxLQUFLLENBQ0QsMERBQXdELE1BQU0sQ0FBQyxhQUFhLGdCQUFhLENBQUMsQ0FBQztZQUMvRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBbkdELHNEQW1HQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG4vKiogT3B0aW9ucyBmb3IgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGRpc2FsbG93U3F1YXNoPzogYm9vbGVhbjtcbiAgbm9uRml4dXBDb21taXRIZWFkZXJzPzogc3RyaW5nW107XG59XG5cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuY29uc3QgR0lUSFVCX0xJTktJTkdfUkUgPSAvKChjbG9zZWQ/cz8pfChmaXgoZXMpPyhlZCk/KXwocmVzb2x2ZWQ/cz8pKVxcc1xcIyhcXGQrKS9pZztcbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbmNvbnN0IFRZUEVfU0NPUEVfUkUgPSAvXihcXHcrKSg/OlxcKChbXildKylcXCkpP1xcOlxccyguKykkLztcbmNvbnN0IENPTU1JVF9IRUFERVJfUkUgPSAvXiguKikvaTtcbmNvbnN0IENPTU1JVF9CT0RZX1JFID0gL14uKlxcblxcbihbXFxzXFxTXSopJC87XG5cbi8qKiBQYXJzZSBhIGZ1bGwgY29tbWl0IG1lc3NhZ2UgaW50byBpdHMgY29tcG9zaXRlIHBhcnRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2c6IHN0cmluZykge1xuICBsZXQgaGVhZGVyID0gJyc7XG4gIGxldCBib2R5ID0gJyc7XG4gIGxldCBib2R5V2l0aG91dExpbmtpbmcgPSAnJztcbiAgbGV0IHR5cGUgPSAnJztcbiAgbGV0IHNjb3BlID0gJyc7XG4gIGxldCBzdWJqZWN0ID0gJyc7XG5cbiAgaWYgKENPTU1JVF9IRUFERVJfUkUudGVzdChjb21taXRNc2cpKSB7XG4gICAgaGVhZGVyID0gQ09NTUlUX0hFQURFUl9SRS5leGVjKGNvbW1pdE1zZykhWzFdXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKEZJWFVQX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKFNRVUFTSF9QUkVGSVhfUkUsICcnKTtcbiAgfVxuICBpZiAoQ09NTUlUX0JPRFlfUkUudGVzdChjb21taXRNc2cpKSB7XG4gICAgYm9keSA9IENPTU1JVF9CT0RZX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV07XG4gICAgYm9keVdpdGhvdXRMaW5raW5nID0gYm9keS5yZXBsYWNlKEdJVEhVQl9MSU5LSU5HX1JFLCAnJyk7XG4gIH1cblxuICBpZiAoVFlQRV9TQ09QRV9SRS50ZXN0KGhlYWRlcikpIHtcbiAgICBjb25zdCBwYXJzZWRDb21taXRIZWFkZXIgPSBUWVBFX1NDT1BFX1JFLmV4ZWMoaGVhZGVyKSE7XG4gICAgdHlwZSA9IHBhcnNlZENvbW1pdEhlYWRlclsxXTtcbiAgICBzY29wZSA9IHBhcnNlZENvbW1pdEhlYWRlclsyXTtcbiAgICBzdWJqZWN0ID0gcGFyc2VkQ29tbWl0SGVhZGVyWzNdO1xuICB9XG4gIHJldHVybiB7XG4gICAgaGVhZGVyLFxuICAgIGJvZHksXG4gICAgYm9keVdpdGhvdXRMaW5raW5nLFxuICAgIHR5cGUsXG4gICAgc2NvcGUsXG4gICAgc3ViamVjdCxcbiAgICBpc0ZpeHVwOiBGSVhVUF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1JldmVydDogUkVWRVJUX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gIH07XG59XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nLCBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pIHtcbiAgZnVuY3Rpb24gZXJyb3IoZXJyb3JNZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICBgSU5WQUxJRCBDT01NSVQgTVNHOiBcXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYCR7Y29tbWl0TXNnfVxcbmAgK1xuICAgICAgICBgJHsn4pSAJy5yZXBlYXQoNDApfVxcbmAgK1xuICAgICAgICBgRVJST1I6IFxcbmAgK1xuICAgICAgICBgICAke2Vycm9yTWVzc2FnZX1gICtcbiAgICAgICAgYFxcblxcbmAgK1xuICAgICAgICBgVGhlIGV4cGVjdGVkIGZvcm1hdCBmb3IgYSBjb21taXQgaXM6IFxcbmAgK1xuICAgICAgICBgPHR5cGU+KDxzY29wZT4pOiA8c3ViamVjdD5cXG5cXG48Ym9keT5gKTtcbiAgfVxuXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbW1pdE1lc3NhZ2VDb25maWcoKS5jb21taXRNZXNzYWdlO1xuICBjb25zdCBjb21taXQgPSBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIEFsbCByZXZlcnQgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZC5cbiAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gIGlmIChjb21taXQuaXNTcXVhc2gpIHtcbiAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgZXJyb3IoJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgLy8gbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXMgY29tbWl0J3MgaGVhZGVyIGFmdGVyXG4gIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAvLyBjaGVjay5cbiAgaWYgKGNvbW1pdC5pc0ZpeHVwKSB7XG4gICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgZXJyb3IoXG4gICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLm1hcCh4ID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICBpZiAoY29tbWl0LmhlYWRlci5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgZXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdC5gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWNvbmZpZy50eXBlcy5pbmNsdWRlcyhjb21taXQudHlwZSkpIHtcbiAgICBlcnJvcihgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtjb25maWcudHlwZXMuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29tbWl0LnNjb3BlICYmICFjb25maWcuc2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICBlcnJvcihgJyR7Y29tbWl0LnNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICBpZiAoY29tbWl0LnR5cGUgPT09ICdyZWxlYXNlJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBpZiAoY29tbWl0LmJvZHlXaXRob3V0TGlua2luZy50cmltKCkubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgZG9lcyBub3QgbWVldCB0aGUgbWluaW11bSBsZW5ndGggb2YgJHtcbiAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICBpZiAoYm9keUJ5TGluZS5zb21lKGxpbmUgPT4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYFRoZSBjb21taXQgbWVzc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19