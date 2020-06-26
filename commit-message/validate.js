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
        var _a;
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
        if (!((_a = config.minBodyLengthTypeExcludes) === null || _a === void 0 ? void 0 : _a.includes(commit.type)) &&
            commit.bodyWithoutLinking.trim().length < config.minBodyLength) {
            printError("The commit message body does not meet the minimum length of " + config.minBodyLength + " characters");
            return false;
        }
        var bodyByLine = commit.body.split('\n');
        if (bodyByLine.some(function (line) { return line.length > config.maxLineLength; })) {
            printError("The commit message body contains lines greater than " + config.maxLineLength + " characters");
            return false;
        }
        return true;
    }
    exports.validateCommitMessage = validateCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRDtJQVFoRCxJQUFNLGVBQWUsR0FBRyxXQUFXLENBQUM7SUFDcEMsSUFBTSxpQkFBaUIsR0FBRyx3REFBd0QsQ0FBQztJQUNuRixJQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQztJQUN0QyxJQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQztJQUN2QyxJQUFNLGFBQWEsR0FBRyxpQ0FBaUMsQ0FBQztJQUN4RCxJQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQztJQUNsQyxJQUFNLGNBQWMsR0FBRyxtQkFBbUIsQ0FBQztJQUUzQyw0REFBNEQ7SUFDNUQsU0FBZ0Isa0JBQWtCLENBQUMsU0FBaUI7UUFDbEQsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksa0JBQWtCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNkLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVqQixJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNwQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBRSxDQUFDLENBQUMsQ0FBQztpQkFDL0IsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUM7aUJBQzVCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUM3QztRQUNELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUNsQyxJ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QVUsQ0FBQyxpRUFDUCxNQUFNLENBQUMsYUFBYSxnQkFBYSxDQUFDLENBQUM7WUFDdkMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBbEMsQ0FBa0MsQ0FBQyxFQUFFO1lBQy9ELFVBQVUsQ0FDTix5REFBdUQsTUFBTSxDQUFDLGFBQWEsZ0JBQWEsQ0FBQyxDQUFDO1lBQzlGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFyR0Qsc0RBcUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtnZXRDb21taXRNZXNzYWdlQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgRklYVVBfUFJFRklYX1JFID0gL15maXh1cCEgL2k7XG5jb25zdCBHSVRIVUJfTElOS0lOR19SRSA9IC8oKGNsb3NlZD9zPyl8KGZpeChlcyk/KGVkKT8pfChyZXNvbHZlZD9zPykpXFxzXFwjKFxcZCspL2lnO1xuY29uc3QgU1FVQVNIX1BSRUZJWF9SRSA9IC9ec3F1YXNoISAvaTtcbmNvbnN0IFJFVkVSVF9QUkVGSVhfUkUgPSAvXnJldmVydDo/IC9pO1xuY29uc3QgVFlQRV9TQ09QRV9SRSA9IC9eKFxcdyspKD86XFwoKFteKV0rKVxcKSk/XFw6XFxzKC4rKSQvO1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuY29uc3QgQ09NTUlUX0JPRFlfUkUgPSAvXi4qXFxuXFxuKFtcXHNcXFNdKikkLztcblxuLyoqIFBhcnNlIGEgZnVsbCBjb21taXQgbWVzc2FnZSBpbnRvIGl0cyBjb21wb3NpdGUgcGFydHMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZzogc3RyaW5nKSB7XG4gIGxldCBoZWFkZXIgPSAnJztcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IGJvZHlXaXRob3V0TGlua2luZyA9ICcnO1xuICBsZXQgdHlwZSA9ICcnO1xuICBsZXQgc2NvcGUgPSAnJztcbiAgbGV0IHN1YmplY3QgPSAnJztcblxuICBpZiAoQ09NTUlUX0hFQURFUl9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBoZWFkZXIgPSBDT01NSVRfSEVBREVSX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV1cbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpO1xuICB9XG4gIGlmIChDT01NSVRfQk9EWV9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBib2R5ID0gQ09NTUlUX0JPRFlfUkUuZXhlYyhjb21taXRNc2cpIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpITtcbiAgICB0eXBlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzFdO1xuICAgIHNjb3BlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzJdO1xuICAgIHN1YmplY3QgPSBwYXJzZWRDb21taXRIZWFkZXJbM107XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBoZWFkZXIsXG4gICAgYm9keSxcbiAgICBib2R5V2l0aG91dExpbmtpbmcsXG4gICAgdHlwZSxcbiAgICBzY29wZSxcbiAgICBzdWJqZWN0LFxuICAgIGlzRml4dXA6IEZJWFVQX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgfTtcbn1cblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmcsIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSkge1xuICBmdW5jdGlvbiBwcmludEVycm9yKGVycm9yTWVzc2FnZTogc3RyaW5nKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBJTlZBTElEIENPTU1JVCBNU0c6IFxcbmAgK1xuICAgICAgICBgJHsn4pSAJy5yZXBlYXQoNDApfVxcbmAgK1xuICAgICAgICBgJHtjb21taXRNc2d9XFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGBFUlJPUjogXFxuYCArXG4gICAgICAgIGAgICR7ZXJyb3JNZXNzYWdlfWAgK1xuICAgICAgICBgXFxuXFxuYCArXG4gICAgICAgIGBUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogXFxuYCArXG4gICAgICAgIGA8dHlwZT4oPHNjb3BlPik6IDxzdWJqZWN0Plxcblxcbjxib2R5PmApO1xuICB9XG5cbiAgY29uc3QgY29uZmlnID0gZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZygpLmNvbW1pdE1lc3NhZ2U7XG4gIGNvbnN0IGNvbW1pdCA9IHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2cpO1xuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyByZXZlcnQsIHNxdWFzaCwgZml4dXAgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBBbGwgc3F1YXNoZXMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIGFzIHRoZSBjb21taXQgd2lsbCBiZSBzcXVhc2hlZCBpbnRvIGFub3RoZXIgaW5cbiAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgIGlmIChvcHRpb25zLmRpc2FsbG93U3F1YXNoKSB7XG4gICAgICBwcmludEVycm9yKCdUaGUgY29tbWl0IG11c3QgYmUgbWFudWFsbHkgc3F1YXNoZWQgaW50byB0aGUgdGFyZ2V0IGNvbW1pdCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAvLyBhZ2FpbnN0LiBJZiBgbm9uRml4dXBDb21taXRIZWFkZXJzYCBpcyBub3QgZW1wdHksIHdlIGNoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nXG4gIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgLy8gY2hlY2suXG4gIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgIHByaW50RXJyb3IoXG4gICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLm1hcCh4ID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICBpZiAoY29tbWl0LmhlYWRlci5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkge1xuICAgIHByaW50RXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICBwcmludEVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb25maWcudHlwZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgcHJpbnRFcnJvcihgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtjb25maWcudHlwZXMuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoY29tbWl0LnNjb3BlICYmICFjb25maWcuc2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICBwcmludEVycm9yKFxuICAgICAgICBgJyR7Y29tbWl0LnNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICBpZiAoY29tbWl0LnR5cGUgPT09ICdyZWxlYXNlJykge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICBpZiAoIWNvbmZpZy5taW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPy5pbmNsdWRlcyhjb21taXQudHlwZSkgJiZcbiAgICAgIGNvbW1pdC5ib2R5V2l0aG91dExpbmtpbmcudHJpbSgpLmxlbmd0aCA8IGNvbmZpZy5taW5Cb2R5TGVuZ3RoKSB7XG4gICAgcHJpbnRFcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgZG9lcyBub3QgbWVldCB0aGUgbWluaW11bSBsZW5ndGggb2YgJHtcbiAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICBpZiAoYm9keUJ5TGluZS5zb21lKGxpbmUgPT4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkpIHtcbiAgICBwcmludEVycm9yKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==