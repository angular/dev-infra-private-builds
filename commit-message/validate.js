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
    exports.printValidationErrors = exports.validateCommitMessage = void 0;
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
        if (options === void 0) { options = {}; }
        var config = config_1.getCommitMessageConfig().commitMessage;
        var commit = typeof commitMsg === 'string' ? parse_1.parseCommitMessage(commitMsg) : commitMsg;
        var errors = [];
        /** Perform the validation checks against the parsed commit. */
        function validateCommitAndCollectErrors() {
            // TODO(josephperrott): Remove early return calls when commit message errors are found
            var _a;
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
                    errors.push('The commit must be manually squashed into the target commit');
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
                    errors.push('Unable to find match for fixup commit among prior commits: ' +
                        (options.nonFixupCommitHeaders.map(function (x) { return "\n      " + x; }).join('') || '-'));
                    return false;
                }
                return true;
            }
            ////////////////////////////
            // Checking commit header //
            ////////////////////////////
            if (commit.header.length > config.maxLineLength) {
                errors.push("The commit message header is longer than " + config.maxLineLength + " characters");
                return false;
            }
            if (!commit.type) {
                errors.push("The commit message header does not match the expected format.");
                return false;
            }
            if (config_1.COMMIT_TYPES[commit.type] === undefined) {
                errors.push("'" + commit.type + "' is not an allowed type.\n => TYPES: " + Object.keys(config_1.COMMIT_TYPES).join(', '));
                return false;
            }
            /** The scope requirement level for the provided type of the commit message. */
            var scopeRequirementForType = config_1.COMMIT_TYPES[commit.type].scope;
            if (scopeRequirementForType === config_1.ScopeRequirement.Forbidden && commit.scope) {
                errors.push("Scopes are forbidden for commits with type '" + commit.type + "', but a scope of '" + commit.scope + "' was provided.");
                return false;
            }
            if (scopeRequirementForType === config_1.ScopeRequirement.Required && !commit.scope) {
                errors.push("Scopes are required for commits with type '" + commit.type + "', but no scope was provided.");
                return false;
            }
            if (commit.scope && !config.scopes.includes(commit.scope)) {
                errors.push("'" + commit.scope + "' is not an allowed scope.\n => SCOPES: " + config.scopes.join(', '));
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
                errors.push("The commit message body does not meet the minimum length of " + config.minBodyLength + " characters");
                return false;
            }
            var bodyByLine = commit.body.split('\n');
            var lineExceedsMaxLength = bodyByLine.some(function (line) {
                // Check if any line exceeds the max line length limit. The limit is ignored for
                // lines that just contain an URL (as these usually cannot be wrapped or shortened).
                return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
            });
            if (lineExceedsMaxLength) {
                errors.push("The commit message body contains lines greater than " + config.maxLineLength + " characters");
                return false;
            }
            return true;
        }
        return { valid: validateCommitAndCollectErrors(), errors: errors, commit: commit };
    }
    exports.validateCommitMessage = validateCommitMessage;
    /** Print the error messages from the commit message validation to the console. */
    function printValidationErrors(errors, print) {
        if (print === void 0) { print = console_1.error; }
        print.group("Error" + (errors.length === 1 ? '' : 's') + ":");
        errors.forEach(function (line) { return print(line); });
        print.groupEnd();
        print();
        print('The expected format for a commit is: ');
        print('<type>(<scope>): <summary>');
        print();
        print('<body>');
        print();
    }
    exports.printValidationErrors = printValidationErrors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRjtJQUNoRix5RUFBZ0U7SUFlaEUsMkRBQTJEO0lBQzNELElBQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQUM7SUFFbEQsdUVBQXVFO0lBQ3ZFLFNBQWdCLHFCQUFxQixDQUNqQyxTQUFxQyxFQUNyQyxPQUEwQztRQUExQyx3QkFBQSxFQUFBLFlBQTBDO1FBQzVDLElBQU0sTUFBTSxHQUFHLCtCQUFzQixFQUFFLENBQUMsYUFBYSxDQUFDO1FBQ3RELElBQU0sTUFBTSxHQUFHLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsMEJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN6RixJQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFNUIsK0RBQStEO1FBQy9ELFNBQVMsOEJBQThCO1lBQ3JDLHNGQUFzRjs7WUFFdEYsb0NBQW9DO1lBQ3BDLG9DQUFvQztZQUNwQyxvQ0FBb0M7WUFFcEMsMkNBQTJDO1lBQzNDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELG9GQUFvRjtZQUNwRixtRkFBbUY7WUFDbkYsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO2dCQUNuQixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7b0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsNkRBQTZELENBQUMsQ0FBQztvQkFDM0UsT0FBTyxLQUFLLENBQUM7aUJBQ2Q7Z0JBQ0QsT0FBTyxJQUFJLENBQUM7YUFDYjtZQUVELDBGQUEwRjtZQUMxRiw4RkFBOEY7WUFDOUYsMEZBQTBGO1lBQzFGLGdH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Q1IsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7UUFDL0MsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7UUFDcEMsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDaEIsS0FBSyxFQUFFLENBQUM7SUFDVixDQUFDO0lBVkQsc0RBVUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZywgU2NvcGVSZXF1aXJlbWVudH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtwYXJzZUNvbW1pdE1lc3NhZ2UsIFBhcnNlZENvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcGFyc2UnO1xuXG4vKiogT3B0aW9ucyBmb3IgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGRpc2FsbG93U3F1YXNoPzogYm9vbGVhbjtcbiAgbm9uRml4dXBDb21taXRIZWFkZXJzPzogc3RyaW5nW107XG59XG5cbi8qKiBUaGUgcmVzdWx0IG9mIGEgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiBjaGVjay4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlUmVzdWx0IHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yczogc3RyaW5nW107XG4gIGNvbW1pdDogUGFyc2VkQ29tbWl0TWVzc2FnZTtcbn1cblxuLyoqIFJlZ2V4IG1hdGNoaW5nIGEgVVJMIGZvciBhbiBlbnRpcmUgY29tbWl0IGJvZHkgbGluZS4gKi9cbmNvbnN0IENPTU1JVF9CT0RZX1VSTF9MSU5FX1JFID0gL15odHRwcz86XFwvXFwvLiokLztcblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmd8UGFyc2VkQ29tbWl0TWVzc2FnZSxcbiAgICBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gdHlwZW9mIGNvbW1pdE1zZyA9PT0gJ3N0cmluZycgPyBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKSA6IGNvbW1pdE1zZztcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBQZXJmb3JtIHRoZSB2YWxpZGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHRoZSBwYXJzZWQgY29tbWl0LiAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSB7XG4gICAgLy8gVE9ETyhqb3NlcGhwZXJyb3R0KTogUmVtb3ZlIGVhcmx5IHJldHVybiBjYWxscyB3aGVuIGNvbW1pdCBtZXNzYWdlIGVycm9ycyBhcmUgZm91bmRcblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICAgIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAgIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gICAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAgIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgICAvLyBjaGVjay5cbiAgICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDaGVja2luZyBjb21taXQgaGVhZGVyIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFjb21taXQudHlwZSkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoQ09NTUlUX1RZUEVTW2NvbW1pdC50eXBlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhDT01NSVRfVFlQRVMpLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIFRoZSBzY29wZSByZXF1aXJlbWVudCBsZXZlbCBmb3IgdGhlIHByb3ZpZGVkIHR5cGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICAgIGNvbnN0IHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID0gQ09NTUlUX1RZUEVTW2NvbW1pdC50eXBlXS5zY29wZTtcblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4gJiYgY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChgU2NvcGVzIGFyZSBmb3JiaWRkZW4gZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBhIHNjb3BlIG9mICcke1xuICAgICAgICAgIGNvbW1pdC5zY29wZX0nIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQgJiYgIWNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgYFNjb3BlcyBhcmUgcmVxdWlyZWQgZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBubyBzY29wZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgJyR7Y29tbWl0LnNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICAgIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIGlmICghY29uZmlnLm1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/LmluY2x1ZGVzKGNvbW1pdC50eXBlKSAmJlxuICAgICAgICBjb21taXQuYm9keVdpdGhvdXRMaW5raW5nLnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxpbmVFeGNlZWRzTWF4TGVuZ3RoID0gYm9keUJ5TGluZS5zb21lKGxpbmUgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgZXhjZWVkcyB0aGUgbWF4IGxpbmUgbGVuZ3RoIGxpbWl0LiBUaGUgbGltaXQgaXMgaWdub3JlZCBmb3JcbiAgICAgIC8vIGxpbmVzIHRoYXQganVzdCBjb250YWluIGFuIFVSTCAoYXMgdGhlc2UgdXN1YWxseSBjYW5ub3QgYmUgd3JhcHBlZCBvciBzaG9ydGVuZWQpLlxuICAgICAgcmV0dXJuIGxpbmUubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGggJiYgIUNPTU1JVF9CT0RZX1VSTF9MSU5FX1JFLnRlc3QobGluZSk7XG4gICAgfSk7XG5cbiAgICBpZiAobGluZUV4Y2VlZHNNYXhMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHt2YWxpZDogdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCksIGVycm9ycywgY29tbWl0fTtcbn1cblxuXG4vKiogUHJpbnQgdGhlIGVycm9yIG1lc3NhZ2VzIGZyb20gdGhlIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gdG8gdGhlIGNvbnNvbGUuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRWYWxpZGF0aW9uRXJyb3JzKGVycm9yczogc3RyaW5nW10sIHByaW50ID0gZXJyb3IpIHtcbiAgcHJpbnQuZ3JvdXAoYEVycm9yJHtlcnJvcnMubGVuZ3RoID09PSAxID8gJycgOiAncyd9OmApO1xuICBlcnJvcnMuZm9yRWFjaChsaW5lID0+IHByaW50KGxpbmUpKTtcbiAgcHJpbnQuZ3JvdXBFbmQoKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJ1RoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiAnKTtcbiAgcHJpbnQoJzx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KCc8Ym9keT4nKTtcbiAgcHJpbnQoKTtcbn1cbiJdfQ==