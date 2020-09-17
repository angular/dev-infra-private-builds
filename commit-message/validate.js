(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/config", "@angular/dev-infra-private/commit-message/parse"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validateCommitMessage = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var config_1 = require("@angular/dev-infra-private/commit-message/config");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    /** Regex matching a URL for an entire commit body line. */
    var COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;
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
        var commit = parse_1.parseCommitMessage(commitMsg);
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
        if (config_1.COMMIT_TYPES[commit.type] === undefined) {
            printError("'" + commit.type + "' is not an allowed type.\n => TYPES: " + Object.keys(config_1.COMMIT_TYPES).join(', '));
            return false;
        }
        /** The scope requirement level for the provided type of the commit message. */
        var scopeRequirementForType = config_1.COMMIT_TYPES[commit.type].scope;
        if (scopeRequirementForType === config_1.ScopeRequirement.Forbidden && commit.scope) {
            printError("Scopes are forbidden for commits with type '" + commit.type + "', but a scope of '" + commit.scope + "' was provided.");
            return false;
        }
        if (scopeRequirementForType === config_1.ScopeRequirement.Required && !commit.scope) {
            printError("Scopes are required for commits with type '" + commit.type + "', but no scope was provided.");
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
        var lineExceedsMaxLength = bodyByLine.some(function (line) {
            // Check if any line exceeds the max line length limit. The limit is ignored for
            // lines that just contain an URL (as these usually cannot be wrapped or shortened).
            return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
        });
        if (lineExceedsMaxLength) {
            printError("The commit message body contains lines greater than " + config.maxLineLength + " characters");
            return false;
        }
        return true;
    }
    exports.validateCommitMessage = validateCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRjtJQUNoRix5RUFBMkM7SUFRM0MsMkRBQTJEO0lBQzNELElBQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQUM7SUFFbEQsdUVBQXVFO0lBQ3ZFLFNBQWdCLHFCQUFxQixDQUNqQyxTQUFpQixFQUFFLE9BQTBDOztRQUExQyx3QkFBQSxFQUFBLFlBQTBDO1FBQy9ELFNBQVMsVUFBVSxDQUFDLFlBQW9CO1lBQ3RDLGVBQUssQ0FDRCx3QkFBd0I7aUJBQ3JCLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQUksQ0FBQTtpQkFDbEIsU0FBUyxPQUFJLENBQUE7aUJBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBSSxDQUFBO2dCQUNyQixXQUFXO2lCQUNYLE9BQUssWUFBYyxDQUFBO2dCQUNuQixNQUFNO2dCQUNOLHlDQUF5QztnQkFDekMsc0NBQXNDLENBQUMsQ0FBQztRQUM5QyxDQUFDO1FBRUQsSUFBTSxNQUFNLEdBQUcsK0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsMEJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFN0Msb0NBQW9DO1FBQ3BDLG9DQUFvQztRQUNwQyxvQ0FBb0M7UUFFcEMsMkNBQTJDO1FBQzNDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsb0ZBQW9GO1FBQ3BGLG1GQUFtRjtRQUNuRixJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDbkIsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO2dCQUMxQixVQUFVLENBQUMsNkRB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QUNsRSxVQUFVLENBQUMsaUVBQ1AsTUFBTSxDQUFDLGFBQWEsZ0JBQWEsQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQyxJQUFNLG9CQUFvQixHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBQSxJQUFJO1lBQy9DLGdGQUFnRjtZQUNoRixvRkFBb0Y7WUFDcEYsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLG9CQUFvQixFQUFFO1lBQ3hCLFVBQVUsQ0FDTix5REFBdUQsTUFBTSxDQUFDLGFBQWEsZ0JBQWEsQ0FBQyxDQUFDO1lBQzlGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUE3SEQsc0RBNkhDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIGdldENvbW1pdE1lc3NhZ2VDb25maWcsIFNjb3BlUmVxdWlyZW1lbnR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG4vKiogUmVnZXggbWF0Y2hpbmcgYSBVUkwgZm9yIGFuIGVudGlyZSBjb21taXQgYm9keSBsaW5lLiAqL1xuY29uc3QgQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUgPSAvXmh0dHBzPzpcXC9cXC8uKiQvO1xuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgICBjb21taXRNc2c6IHN0cmluZywgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHt9KSB7XG4gIGZ1bmN0aW9uIHByaW50RXJyb3IoZXJyb3JNZXNzYWdlOiBzdHJpbmcpIHtcbiAgICBlcnJvcihcbiAgICAgICAgYElOVkFMSUQgQ09NTUlUIE1TRzogXFxuYCArXG4gICAgICAgIGAkeyfilIAnLnJlcGVhdCg0MCl9XFxuYCArXG4gICAgICAgIGAke2NvbW1pdE1zZ31cXG5gICtcbiAgICAgICAgYCR7J+KUgCcucmVwZWF0KDQwKX1cXG5gICtcbiAgICAgICAgYEVSUk9SOiBcXG5gICtcbiAgICAgICAgYCAgJHtlcnJvck1lc3NhZ2V9YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYFRoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiBcXG5gICtcbiAgICAgICAgYDx0eXBlPig8c2NvcGU+KTogPHN1YmplY3Q+XFxuXFxuPGJvZHk+YCk7XG4gIH1cblxuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZyk7XG5cbiAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgIHByaW50RXJyb3IoJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgLy8gbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXMgY29tbWl0J3MgaGVhZGVyIGFmdGVyXG4gIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAvLyBjaGVjay5cbiAgaWYgKGNvbW1pdC5pc0ZpeHVwKSB7XG4gICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgcHJpbnRFcnJvcihcbiAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgcHJpbnRFcnJvcihgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKCFjb21taXQudHlwZSkge1xuICAgIHByaW50RXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdC5gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuXG5cbiAgaWYgKENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0gPT09IHVuZGVmaW5lZCkge1xuICAgIHByaW50RXJyb3IoYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7XG4gICAgICAgIE9iamVjdC5rZXlzKENPTU1JVF9UWVBFUykuam9pbignLCAnKX1gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gIGNvbnN0IHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID0gQ09NTUlUX1RZUEVTW2NvbW1pdC50eXBlXS5zY29wZTtcblxuICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuICYmIGNvbW1pdC5zY29wZSkge1xuICAgIHByaW50RXJyb3IoYFNjb3BlcyBhcmUgZm9yYmlkZGVuIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgYSBzY29wZSBvZiAnJHtcbiAgICAgICAgY29tbWl0LnNjb3BlfScgd2FzIHByb3ZpZGVkLmApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCAmJiAhY29tbWl0LnNjb3BlKSB7XG4gICAgcHJpbnRFcnJvcihcbiAgICAgICAgYFNjb3BlcyBhcmUgcmVxdWlyZWQgZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBubyBzY29wZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgcHJpbnRFcnJvcihcbiAgICAgICAgYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIENvbW1pdHMgd2l0aCB0aGUgdHlwZSBvZiBgcmVsZWFzZWAgZG8gbm90IHJlcXVpcmUgYSBjb21taXQgYm9keS5cbiAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgaWYgKCFjb25maWcubWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz8uaW5jbHVkZXMoY29tbWl0LnR5cGUpICYmXG4gICAgICBjb21taXQuYm9keVdpdGhvdXRMaW5raW5nLnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgIHByaW50RXJyb3IoYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgY29uc3QgbGluZUV4Y2VlZHNNYXhMZW5ndGggPSBib2R5QnlMaW5lLnNvbWUobGluZSA9PiB7XG4gICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgZXhjZWVkcyB0aGUgbWF4IGxpbmUgbGVuZ3RoIGxpbWl0LiBUaGUgbGltaXQgaXMgaWdub3JlZCBmb3JcbiAgICAvLyBsaW5lcyB0aGF0IGp1c3QgY29udGFpbiBhbiBVUkwgKGFzIHRoZXNlIHVzdWFsbHkgY2Fubm90IGJlIHdyYXBwZWQgb3Igc2hvcnRlbmVkKS5cbiAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgfSk7XG5cbiAgaWYgKGxpbmVFeGNlZWRzTWF4TGVuZ3RoKSB7XG4gICAgcHJpbnRFcnJvcihcbiAgICAgICAgYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iXX0=