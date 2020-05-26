(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/config"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateCommitMessage = exports.parseCommitMessage = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
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
        function printError(errorMessage) {
            console_1.error("INVALID COMMIT MSG: \n" +
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
                printError('The commit must be manually squashed into the target commit');
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
                printError('Unable to find match for fixup commit among prior commits: ' +
                    (options.nonFixupCommitHeaders.map(function (x) { return "\n      " + x; }).join('') || '-'));
                return false;
            }
            return true;
        }
        ////////////////////////////
        // Checking commit header //
        ////////////////////////////
        if (commit.header.length > config.maxLineLength) {
            printError("The commit message header is longer than " + config.maxLineLength + " characters");
            return false;
        }
        if (!commit.type) {
            printError("The commit message header does not match the expected format.");
            return false;
        }
        if (!config.types.includes(commit.type)) {
            printError("'" + commit.type + "' is not an allowed type.\n => TYPES: " + config.types.join(', '));
            return false;
        }
        if (commit.scope && !config.scopes.includes(commit.scope)) {
            printError("'" + commit.scope + "' is not an allowed scope.\n => SCOPES: " + config.scopes.join(', '));
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
            printError("The commit message body does not meet the minimum length of " + config.minBodyLength + " characters");
            return false;
        }
        var bodyByLine = commit.body.split('\n');
        if (bodyByLine.some(function (line) { return line.length > config.maxLineLength; })) {
            printError("The commit messsage body contains lines greater than " + config.maxLineLength + " characters");
            return false;
        }
        return true;
    }
    exports.validateCommitMessage = validateCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRDtJQVFoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsSUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztJQUNuRixJQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQztJQUN0QyxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2QyxJQUFNLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCxJQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztJQUNsQyxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztJQUUzQyw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsU0FBaUI7UUFDbEQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNwQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQztpQkFDL0IsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJ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O1NBQ2Q7UUFFRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQWxDLENBQWtDLENBQUMsRUFBRTtZQUMvRCxVQUFVLENBQ04sMERBQXdELE1BQU0sQ0FBQyxhQUFhLGdCQUFhLENBQUMsQ0FBQztZQUMvRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBcEdELHNEQW9HQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Z2V0Q29tbWl0TWVzc2FnZUNvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG4vKiogT3B0aW9ucyBmb3IgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGRpc2FsbG93U3F1YXNoPzogYm9vbGVhbjtcbiAgbm9uRml4dXBDb21taXRIZWFkZXJzPzogc3RyaW5nW107XG59XG5cbmNvbnN0IEZJWFVQX1BSRUZJWF9SRSA9IC9eZml4dXAhIC9pO1xuY29uc3QgR0lUSFVCX0xJTktJTkdfUkUgPSAvKChjbG9zZWQ/cz8pfChmaXgoZXMpPyhlZCk/KXwocmVzb2x2ZWQ/cz8pKVxcc1xcIyhcXGQrKS9pZztcbmNvbnN0IFNRVUFTSF9QUkVGSVhfUkUgPSAvXnNxdWFzaCEgL2k7XG5jb25zdCBSRVZFUlRfUFJFRklYX1JFID0gL15yZXZlcnQ6PyAvaTtcbmNvbnN0IFRZUEVfU0NPUEVfUkUgPSAvXihcXHcrKSg/OlxcKChbXildKylcXCkpP1xcOlxccyguKykkLztcbmNvbnN0IENPTU1JVF9IRUFERVJfUkUgPSAvXiguKikvaTtcbmNvbnN0IENPTU1JVF9CT0RZX1JFID0gL14uKlxcblxcbihbXFxzXFxTXSopJC87XG5cbi8qKiBQYXJzZSBhIGZ1bGwgY29tbWl0IG1lc3NhZ2UgaW50byBpdHMgY29tcG9zaXRlIHBhcnRzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2c6IHN0cmluZykge1xuICBsZXQgaGVhZGVyID0gJyc7XG4gIGxldCBib2R5ID0gJyc7XG4gIGxldCBib2R5V2l0aG91dExpbmtpbmcgPSAnJztcbiAgbGV0IHR5cGUgPSAnJztcbiAgbGV0IHNjb3BlID0gJyc7XG4gIGxldCBzdWJqZWN0ID0gJyc7XG5cbiAgaWYgKENPTU1JVF9IRUFERVJfUkUudGVzdChjb21taXRNc2cpKSB7XG4gICAgaGVhZGVyID0gQ09NTUlUX0hFQURFUl9SRS5leGVjKGNvbW1pdE1zZykhWzFdXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKEZJWFVQX1BSRUZJWF9SRSwgJycpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKFNRVUFTSF9QUkVGSVhfUkUsICcnKTtcbiAgfVxuICBpZiAoQ09NTUlUX0JPRFlfUkUudGVzdChjb21taXRNc2cpKSB7XG4gICAgYm9keSA9IENPTU1JVF9CT0RZX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV07XG4gICAgYm9keVdpdGhvdXRMaW5raW5nID0gYm9keS5yZXBsYWNlKEdJVEhVQl9MSU5LSU5HX1JFLCAnJyk7XG4gIH1cblxuICBpZiAoVFlQRV9TQ09QRV9SRS50ZXN0KGhlYWRlcikpIHtcbiAgICBjb25zdCBwYXJzZWRDb21taXRIZWFkZXIgPSBUWVBFX1NDT1BFX1JFLmV4ZWMoaGVhZGVyKSE7XG4gICAgdHlwZSA9IHBhcnNlZENvbW1pdEhlYWRlclsxXTtcbiAgICBzY29wZSA9IHBhcnNlZENvbW1pdEhlYWRlclsyXTtcbiAgICBzdWJqZWN0ID0gcGFyc2VkQ29tbWl0SGVhZGVyWzNdO1xuICB9XG4gIHJldHVybiB7XG4gICAgaGVhZGVyLFxuICAgIGJvZHksXG4gICAgYm9keVdpdGhvdXRMaW5raW5nLFxuICAgIHR5cGUsXG4gICAgc2NvcGUsXG4gICAgc3ViamVjdCxcbiAgICBpc0ZpeHVwOiBGSVhVUF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzU3F1YXNoOiBTUVVBU0hfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1JldmVydDogUkVWRVJUX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gIH07XG59XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nLCBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pIHtcbiAgZnVuY3Rpb24gcHJpbnRFcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZykge1xuICAgIGVycm9yKFxuICAgICAgICBgSU5WQUxJRCBDT01NSVQgTVNHOiBcXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYCR7Y29tbWl0TXNnfVxcbmAgK1xuICAgICAgICBgJHsn4pSAJy5yZXBlYXQoNDApfVxcbmAgK1xuICAgICAgICBgRVJST1I6IFxcbmAgK1xuICAgICAgICBgICAke2Vycm9yTWVzc2FnZX1gICtcbiAgICAgICAgYFxcblxcbmAgK1xuICAgICAgICBgVGhlIGV4cGVjdGVkIGZvcm1hdCBmb3IgYSBjb21taXQgaXM6IFxcbmAgK1xuICAgICAgICBgPHR5cGU+KDxzY29wZT4pOiA8c3ViamVjdD5cXG5cXG48Ym9keT5gKTtcbiAgfVxuXG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbW1pdE1lc3NhZ2VDb25maWcoKS5jb21taXRNZXNzYWdlO1xuICBjb25zdCBjb21taXQgPSBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKTtcblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIC8vIEFsbCByZXZlcnQgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZC5cbiAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gIGlmIChjb21taXQuaXNTcXVhc2gpIHtcbiAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgcHJpbnRFcnJvcignVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBGaXh1cHMgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgdW5sZXNzIG5vbkZpeHVwQ29tbWl0SGVhZGVycyBhcmUgcHJvdmlkZWQgdG8gY2hlY2tcbiAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgLy8gc3RyaXBwaW5nIHRoZSBgZml4dXAhIGAgcHJlZml4KSwgb3RoZXJ3aXNlIHdlIGFzc3VtZSB0aGlzIHZlcmlmaWNhdGlvbiB3aWxsIGhhcHBlbiBpbiBhbm90aGVyXG4gIC8vIGNoZWNrLlxuICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICBpZiAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMgJiYgIW9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLmluY2x1ZGVzKGNvbW1pdC5oZWFkZXIpKSB7XG4gICAgICBwcmludEVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyBjb21taXQgaGVhZGVyIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICBwcmludEVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgcHJpbnRFcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29uZmlnLnR5cGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKSkge1xuICAgIHByaW50RXJyb3IoYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7Y29uZmlnLnR5cGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgcHJpbnRFcnJvcihcbiAgICAgICAgYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENvbW1pdHMgd2l0aCB0aGUgdHlwZSBvZiBgcmVsZWFzZWAgZG8gbm90IHJlcXVpcmUgYSBjb21taXQgYm9keS5cbiAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgaWYgKGNvbW1pdC5ib2R5V2l0aG91dExpbmtpbmcudHJpbSgpLmxlbmd0aCA8IGNvbmZpZy5taW5Cb2R5TGVuZ3RoKSB7XG4gICAgcHJpbnRFcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgZG9lcyBub3QgbWVldCB0aGUgbWluaW11bSBsZW5ndGggb2YgJHtcbiAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICBpZiAoYm9keUJ5TGluZS5zb21lKGxpbmUgPT4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkpIHtcbiAgICBwcmludEVycm9yKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=