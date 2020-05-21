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
     * Copyright Google Inc. All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRDtJQVFoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsSUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztJQUNuRixJQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQztJQUN0QyxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2QyxJQUFNLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCxJQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztJQUNsQyxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztJQUUzQyw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsU0FBaUI7UUFDbEQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNwQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQztpQkFDL0IsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJ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O1NBQ2Q7UUFFRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQWxDLENBQWtDLENBQUMsRUFBRTtZQUMvRCxVQUFVLENBQ04sMERBQXdELE1BQU0sQ0FBQyxhQUFhLGdCQUFhLENBQUMsQ0FBQztZQUMvRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBcEdELHNEQW9HQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2dldENvbW1pdE1lc3NhZ2VDb25maWd9IGZyb20gJy4vY29uZmlnJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG5jb25zdCBGSVhVUF9QUkVGSVhfUkUgPSAvXmZpeHVwISAvaTtcbmNvbnN0IEdJVEhVQl9MSU5LSU5HX1JFID0gLygoY2xvc2VkP3M/KXwoZml4KGVzKT8oZWQpPyl8KHJlc29sdmVkP3M/KSlcXHNcXCMoXFxkKykvaWc7XG5jb25zdCBTUVVBU0hfUFJFRklYX1JFID0gL15zcXVhc2ghIC9pO1xuY29uc3QgUkVWRVJUX1BSRUZJWF9SRSA9IC9ecmV2ZXJ0Oj8gL2k7XG5jb25zdCBUWVBFX1NDT1BFX1JFID0gL14oXFx3KykoPzpcXCgoW14pXSspXFwpKT9cXDpcXHMoLispJC87XG5jb25zdCBDT01NSVRfSEVBREVSX1JFID0gL14oLiopL2k7XG5jb25zdCBDT01NSVRfQk9EWV9SRSA9IC9eLipcXG5cXG4oW1xcc1xcU10qKSQvO1xuXG4vKiogUGFyc2UgYSBmdWxsIGNvbW1pdCBtZXNzYWdlIGludG8gaXRzIGNvbXBvc2l0ZSBwYXJ0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnOiBzdHJpbmcpIHtcbiAgbGV0IGhlYWRlciA9ICcnO1xuICBsZXQgYm9keSA9ICcnO1xuICBsZXQgYm9keVdpdGhvdXRMaW5raW5nID0gJyc7XG4gIGxldCB0eXBlID0gJyc7XG4gIGxldCBzY29wZSA9ICcnO1xuICBsZXQgc3ViamVjdCA9ICcnO1xuXG4gIGlmIChDT01NSVRfSEVBREVSX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGhlYWRlciA9IENPTU1JVF9IRUFERVJfUkUuZXhlYyhjb21taXRNc2cpIVsxXVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShGSVhVUF9QUkVGSVhfUkUsICcnKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZShTUVVBU0hfUFJFRklYX1JFLCAnJyk7XG4gIH1cbiAgaWYgKENPTU1JVF9CT0RZX1JFLnRlc3QoY29tbWl0TXNnKSkge1xuICAgIGJvZHkgPSBDT01NSVRfQk9EWV9SRS5leGVjKGNvbW1pdE1zZykhWzFdO1xuICAgIGJvZHlXaXRob3V0TGlua2luZyA9IGJvZHkucmVwbGFjZShHSVRIVUJfTElOS0lOR19SRSwgJycpO1xuICB9XG5cbiAgaWYgKFRZUEVfU0NPUEVfUkUudGVzdChoZWFkZXIpKSB7XG4gICAgY29uc3QgcGFyc2VkQ29tbWl0SGVhZGVyID0gVFlQRV9TQ09QRV9SRS5leGVjKGhlYWRlcikhO1xuICAgIHR5cGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMV07XG4gICAgc2NvcGUgPSBwYXJzZWRDb21taXRIZWFkZXJbMl07XG4gICAgc3ViamVjdCA9IHBhcnNlZENvbW1pdEhlYWRlclszXTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGhlYWRlcixcbiAgICBib2R5LFxuICAgIGJvZHlXaXRob3V0TGlua2luZyxcbiAgICB0eXBlLFxuICAgIHNjb3BlLFxuICAgIHN1YmplY3QsXG4gICAgaXNGaXh1cDogRklYVVBfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgICBpc1NxdWFzaDogU1FVQVNIX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNSZXZlcnQ6IFJFVkVSVF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICB9O1xufVxuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgICBjb21taXRNc2c6IHN0cmluZywgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHt9KSB7XG4gIGZ1bmN0aW9uIHByaW50RXJyb3IoZXJyb3JNZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYElOVkFMSUQgQ09NTUlUIE1TRzogXFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGAke2NvbW1pdE1zZ31cXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYEVSUk9SOiBcXG5gICtcbiAgICAgICAgYCAgJHtlcnJvck1lc3NhZ2V9YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYFRoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiBcXG5gICtcbiAgICAgICAgYDx0eXBlPig8c2NvcGU+KTogPHN1YmplY3Q+XFxuXFxuPGJvZHk+YCk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZyk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgIHByaW50RXJyb3IoJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgLy8gbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXMgY29tbWl0J3MgaGVhZGVyIGFmdGVyXG4gIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAvLyBjaGVjay5cbiAgaWYgKGNvbW1pdC5pc0ZpeHVwKSB7XG4gICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgcHJpbnRFcnJvcihcbiAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgcHJpbnRFcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb21taXQudHlwZSkge1xuICAgIHByaW50RXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdC5gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIWNvbmZpZy50eXBlcy5pbmNsdWRlcyhjb21taXQudHlwZSkpIHtcbiAgICBwcmludEVycm9yKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke2NvbmZpZy50eXBlcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb21taXQuc2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgIHByaW50RXJyb3IoXG4gICAgICAgIGAnJHtjb21taXQuc2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyBjb21taXQgYm9keSAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIGlmIChjb21taXQuYm9keVdpdGhvdXRMaW5raW5nLnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgIHByaW50RXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgaWYgKGJvZHlCeUxpbmUuc29tZShsaW5lID0+IGxpbmUubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpKSB7XG4gICAgcHJpbnRFcnJvcihcbiAgICAgICAgYFRoZSBjb21taXQgbWVzc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuIl19