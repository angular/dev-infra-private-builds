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
        var config = config_1.getAngularDevConfig().commitMessage;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxrRUFBb0Q7SUFTcEQsSUFBTSxlQUFlLEdBQUcsV0FBVyxDQUFDO0lBQ3BDLElBQU0saUJBQWlCLEdBQUcsd0RBQXdELENBQUM7SUFDbkYsSUFBTSxnQkFBZ0IsR0FBRyxZQUFZLENBQUM7SUFDdEMsSUFBTSxnQkFBZ0IsR0FBRyxhQUFhLENBQUM7SUFDdkMsSUFBTSxhQUFhLEdBQUcsaUNBQWlDLENBQUM7SUFDeEQsSUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUM7SUFDbEMsSUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUM7SUFFM0MsNERBQTREO0lBQzVELFNBQWdCLGtCQUFrQixDQUFDLFNBQWlCO1FBQ2xELElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUNoQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLGtCQUFrQixHQUFHLEVBQUUsQ0FBQztRQUM1QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDZixJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFakIsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDcEMsTUFBTSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUUsQ0FBQyxDQUFDLENBQUM7aUJBQy9CLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDO2lCQUM1QixPQUFPLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDN0M7UUFDRCxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDbEMsSUFBSSxHQUFHLGNBQWMs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VUFBVSxDQUFDLElBQUksQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBbEMsQ0FBa0MsQ0FBQyxFQUFFO1lBQy9ELEtBQUssQ0FDRCwwREFBd0QsTUFBTSxDQUFDLGFBQWEsZ0JBQWEsQ0FBQyxDQUFDO1lBQy9GLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUE5RkQsc0RBOEZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtnZXRBbmd1bGFyRGV2Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtDb21taXRNZXNzYWdlQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuY29uc3QgRklYVVBfUFJFRklYX1JFID0gL15maXh1cCEgL2k7XG5jb25zdCBHSVRIVUJfTElOS0lOR19SRSA9IC8oKGNsb3NlZD9zPyl8KGZpeChlcyk/KGVkKT8pfChyZXNvbHZlZD9zPykpXFxzXFwjKFxcZCspL2lnO1xuY29uc3QgU1FVQVNIX1BSRUZJWF9SRSA9IC9ec3F1YXNoISAvaTtcbmNvbnN0IFJFVkVSVF9QUkVGSVhfUkUgPSAvXnJldmVydDo/IC9pO1xuY29uc3QgVFlQRV9TQ09QRV9SRSA9IC9eKFxcdyspKD86XFwoKFteKV0rKVxcKSk/XFw6XFxzKC4rKSQvO1xuY29uc3QgQ09NTUlUX0hFQURFUl9SRSA9IC9eKC4qKS9pO1xuY29uc3QgQ09NTUlUX0JPRFlfUkUgPSAvXi4qXFxuXFxuKFtcXHNcXFNdKikkLztcblxuLyoqIFBhcnNlIGEgZnVsbCBjb21taXQgbWVzc2FnZSBpbnRvIGl0cyBjb21wb3NpdGUgcGFydHMuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZzogc3RyaW5nKSB7XG4gIGxldCBoZWFkZXIgPSAnJztcbiAgbGV0IGJvZHkgPSAnJztcbiAgbGV0IGJvZHlXaXRob3V0TGlua2luZyA9ICcnO1xuICBsZXQgdHlwZSA9ICcnO1xuICBsZXQgc2NvcGUgPSAnJztcbiAgbGV0IHN1YmplY3QgPSAnJztcblxuICBpZiAoQ09NTUlUX0hFQURFUl9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBoZWFkZXIgPSBDT01NSVRfSEVBREVSX1JFLmV4ZWMoY29tbWl0TXNnKSFbMV1cbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoRklYVVBfUFJFRklYX1JFLCAnJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoU1FVQVNIX1BSRUZJWF9SRSwgJycpO1xuICB9XG4gIGlmIChDT01NSVRfQk9EWV9SRS50ZXN0KGNvbW1pdE1zZykpIHtcbiAgICBib2R5ID0gQ09NTUlUX0JPRFlfUkUuZXhlYyhjb21taXRNc2cpIVsxXTtcbiAgICBib2R5V2l0aG91dExpbmtpbmcgPSBib2R5LnJlcGxhY2UoR0lUSFVCX0xJTktJTkdfUkUsICcnKTtcbiAgfVxuXG4gIGlmIChUWVBFX1NDT1BFX1JFLnRlc3QoaGVhZGVyKSkge1xuICAgIGNvbnN0IHBhcnNlZENvbW1pdEhlYWRlciA9IFRZUEVfU0NPUEVfUkUuZXhlYyhoZWFkZXIpITtcbiAgICB0eXBlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzFdO1xuICAgIHNjb3BlID0gcGFyc2VkQ29tbWl0SGVhZGVyWzJdO1xuICAgIHN1YmplY3QgPSBwYXJzZWRDb21taXRIZWFkZXJbM107XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBoZWFkZXIsXG4gICAgYm9keSxcbiAgICBib2R5V2l0aG91dExpbmtpbmcsXG4gICAgdHlwZSxcbiAgICBzY29wZSxcbiAgICBzdWJqZWN0LFxuICAgIGlzRml4dXA6IEZJWFVQX1BSRUZJWF9SRS50ZXN0KGNvbW1pdE1zZyksXG4gICAgaXNTcXVhc2g6IFNRVUFTSF9QUkVGSVhfUkUudGVzdChjb21taXRNc2cpLFxuICAgIGlzUmV2ZXJ0OiBSRVZFUlRfUFJFRklYX1JFLnRlc3QoY29tbWl0TXNnKSxcbiAgfTtcbn1cblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmcsIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSkge1xuICBmdW5jdGlvbiBlcnJvcihlcnJvck1lc3NhZ2U6IHN0cmluZykge1xuICAgIGNvbnNvbGUuZXJyb3IoXG4gICAgICAgIGBJTlZBTElEIENPTU1JVCBNU0c6IFxcbmAgK1xuICAgICAgICBgJHsn4pSAJy5yZXBlYXQoNDApfVxcbmAgK1xuICAgICAgICBgJHtjb21taXRNc2d9XFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGBFUlJPUjogXFxuYCArXG4gICAgICAgIGAgICR7ZXJyb3JNZXNzYWdlfWAgK1xuICAgICAgICBgXFxuXFxuYCArXG4gICAgICAgIGBUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogXFxuYCArXG4gICAgICAgIGA8dHlwZT4oPHNjb3BlPik6IDxzdWJqZWN0Plxcblxcbjxib2R5PmApO1xuICB9XG5cbiAgY29uc3QgY29uZmlnID0gZ2V0QW5ndWxhckRldkNvbmZpZzwnY29tbWl0TWVzc2FnZScsIENvbW1pdE1lc3NhZ2VDb25maWc+KCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZyk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgIGVycm9yKCdUaGUgY29tbWl0IG11c3QgYmUgbWFudWFsbHkgc3F1YXNoZWQgaW50byB0aGUgdGFyZ2V0IGNvbW1pdCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAvLyBhZ2FpbnN0LiBJZiBgbm9uRml4dXBDb21taXRIZWFkZXJzYCBpcyBub3QgZW1wdHksIHdlIGNoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nXG4gIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgLy8gY2hlY2suXG4gIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgIGVycm9yKFxuICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAvLyBDaGVja2luZyBjb21taXQgaGVhZGVyIC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICBlcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb21taXQudHlwZSkge1xuICAgIGVycm9yKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb25maWcudHlwZXMuaW5jbHVkZXMoY29tbWl0LnR5cGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7Y29uZmlnLnR5cGVzLmpvaW4oJywgJyl9YCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgZXJyb3IoYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgaWYgKGNvbW1pdC5ib2R5V2l0aG91dExpbmtpbmcudHJpbSgpLmxlbmd0aCA8IGNvbmZpZy5taW5Cb2R5TGVuZ3RoKSB7XG4gICAgZXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgaWYgKGJvZHlCeUxpbmUuc29tZShsaW5lID0+IGxpbmUubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpKSB7XG4gICAgZXJyb3IoXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cbiJdfQ==