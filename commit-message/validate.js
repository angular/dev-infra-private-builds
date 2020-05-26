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
     * Copyright Google LLC All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsMkVBQWdEO0lBUWhELElBQU0sZUFBZSxHQUFHLFdBQVcsQ0FBQztJQUNwQyxJQUFNLGlCQUFpQixHQUFHLHdEQUF3RCxDQUFDO0lBQ25GLElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLElBQU0sZ0JBQWdCLEdBQUcsYUFBYSxDQUFDO0lBQ3ZDLElBQU0sYUFBYSxHQUFHLGlDQUFpQyxDQUFDO0lBQ3hELElBQU0sZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0lBQ2xDLElBQU0sY0FBYyxHQUFHLG1CQUFtQixDQUFDO0lBRTNDLDREQUE0RDtJQUM1RCxTQUFnQixrQkFBa0IsQ0FBQyxTQUFpQjtRQUNsRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLE1BQU0sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFFLENBQUMsQ0FBQyxDQUFDO2lCQUMvQixPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQztpQkFDNUIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdDO1FBQ0QsSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ2xDLElBQUksR0FBRyxjQUFj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Q2Q7UUFFRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLEVBQWxDLENBQWtDLENBQUMsRUFBRTtZQUMvRCxLQUFLLENBQ0QsMERBQXdELE1BQU0sQ0FBQyxhQUFhLGdCQUFhLENBQUMsQ0FBQztZQUMvRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBbkdELHNEQW1HQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgRklYVVBfUFJFRklYX1JFID0gL15maXh1cCEgL2k7XG5jb25zdCBHSVRIVUJfTElOS0lOR19SRSA9IC8oKGNsb3NlZD9zPyl8KGZpeChlcyk/KGVkKT8pfChyZXNvbHZlZD9zPykpXFxzXFwjKFxcZCspL2lnO1xuY29uc3QgU1FVQVNIX1BSRUZJWF9SRSA9IC9ec3F1YXNoISAvaTtcbmNvbnN0IFJFVkVSVF9QUkVGSVhfUkUgPSAvXnJldmVydDo/IC9pO1xuY29uc3QgVFlQRV9TQ09QRV9SRSA9IC9eKFxcdyspKD86XFwoKFteKV0rKVxcKSk/XFw6XFxzKC4rKSQvO1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuY29uc3QgQ09NTUlUX0JPRFlfUkUgPSAvXi4qXFxuXFxuKFtcXHNcXFNdKikkLztcblxuLyoqIFBhcnNlIGEgZnVsbCBjb21taXQgbWVzc2FnZSBpbnRvIGl0cyBjb21wb3NpdGUgcGFydHMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZzogc3RyaW5nKSB7XG4gIGxldCBoZWFkZXIgPSAnJztcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IGJvZHlXaXRob3V0TGlua2luZyA9ICcnO1xuICBsZXQgdHlwZSA9ICcnO1xuICBsZXQgc2NvcGUgPSAnJztcbiAgbGV0IHN1YmplY3QgPSAnJztcblxuICBpZiAoQ09NTUlUX0hFQURFUl9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBoZWFkZXIgPSBDT01NSVRfSEVBREVSX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV1cbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpO1xuICB9XG4gIGlmIChDT01NSVRfQk9EWV9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBib2R5ID0gQ09NTUlUX0JPRFlfUkUuZXhlYyhjb21taXRNc2cpIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpITtcbiAgICB0eXBlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzFdO1xuICAgIHNjb3BlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzJdO1xuICAgIHN1YmplY3QgPSBwYXJzZWRDb21taXRIZWFkZXJbM107XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBoZWFkZXIsXG4gICAgYm9keSxcbiAgICBib2R5V2l0aG91dExpbmtpbmcsXG4gICAgdHlwZSxcbiAgICBzY29wZSxcbiAgICBzdWJqZWN0LFxuICAgIGlzRml4dXA6IEZJWFVQX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgfTtcbn1cblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmcsIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSkge1xuICBmdW5jdGlvbiBlcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZykge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBJTlZBTElEIENPTU1JVCBNU0c6IFxcbmAgK1xuICAgICAgICBgJHsn4pSAJy5yZXBlYXQoNDApfVxcbmAgK1xuICAgICAgICBgJHtjb21taXRNc2d9XFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGBFUlJPUjogXFxuYCArXG4gICAgICAgIGAgICR7ZXJyb3JNZXNzYWdlfWAgK1xuICAgICAgICBgXFxuXFxuYCArXG4gICAgICAgIGBUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogXFxuYCArXG4gICAgICAgIGA8dHlwZT4oPHNjb3BlPik6IDxzdWJqZWN0Plxcblxcbjxib2R5PmApO1xuICB9XG5cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZygpLmNvbW1pdE1lc3NhZ2U7XG4gIGNvbnN0IGNvbW1pdCA9IHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2cpO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyByZXZlcnQsIHNxdWFzaCwgZml4dXAgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBBbGwgc3F1YXNoZXMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIGFzIHRoZSBjb21taXQgd2lsbCBiZSBzcXVhc2hlZCBpbnRvIGFub3RoZXIgaW5cbiAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgIGlmIChvcHRpb25zLmRpc2FsbG93U3F1YXNoKSB7XG4gICAgICBlcnJvcignVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBGaXh1cHMgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgdW5sZXNzIG5vbkZpeHVwQ29tbWl0SGVhZGVycyBhcmUgcHJvdmlkZWQgdG8gY2hlY2tcbiAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgLy8gc3RyaXBwaW5nIHRoZSBgZml4dXAhIGAgcHJlZml4KSwgb3RoZXJ3aXNlIHdlIGFzc3VtZSB0aGlzIHZlcmlmaWNhdGlvbiB3aWxsIGhhcHBlbiBpbiBhbm90aGVyXG4gIC8vIGNoZWNrLlxuICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICBpZiAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMgJiYgIW9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLmluY2x1ZGVzKGNvbW1pdC5oZWFkZXIpKSB7XG4gICAgICBlcnJvcihcbiAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgZXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29uZmlnLnR5cGVzLmluY2x1ZGVzKGNvbW1pdC50eXBlKSkge1xuICAgIGVycm9yKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke2NvbmZpZy50eXBlcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChjb21taXQuc2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgIGVycm9yKGAnJHtjb21taXQuc2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyBjb21taXQgYm9keSAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gIGlmIChjb21taXQuYm9keVdpdGhvdXRMaW5raW5nLnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICBjb25maWcubWluQm9keUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IGJvZHlCeUxpbmUgPSBjb21taXQuYm9keS5zcGxpdCgnXFxuJyk7XG4gIGlmIChib2R5QnlMaW5lLnNvbWUobGluZSA9PiBsaW5lLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSkge1xuICAgIGVycm9yKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=