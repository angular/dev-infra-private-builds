/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/config", "@angular/dev-infra-private/commit-message/parse"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.printValidationErrors = exports.validateCommitMessage = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var config_1 = require("@angular/dev-infra-private/commit-message/config");
    var parse_1 = require("@angular/dev-infra-private/commit-message/parse");
    /** Regex matching a URL for an entire commit body line. */
    var COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;
    /**
     * Regex matching a breaking change.
     *
     * - Starts with BREAKING CHANGE
     * - Followed by a colon
     * - Followed by a single space or two consecutive new lines
     *
     * NB: Anything after `BREAKING CHANGE` is optional to facilitate the validation.
     */
    var COMMIT_BODY_BREAKING_CHANGE_RE = /^BREAKING CHANGE(:( |\n{2}))?/m;
    /** Validate a commit message against using the local repo's config. */
    function validateCommitMessage(commitMsg, options) {
        if (options === void 0) { options = {}; }
        var config = config_1.getCommitMessageConfig().commitMessage;
        var commit = typeof commitMsg === 'string' ? parse_1.parseCommitMessage(commitMsg) : commitMsg;
        var errors = [];
        /** Perform the validation checks against the parsed commit. */
        function validateCommitAndCollectErrors() {
            ////////////////////////////////////
            // Checking revert, squash, fixup //
            ////////////////////////////////////
            var _a;
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
            // Due to an issue in which conventional-commits-parser considers all parts of a commit after
            // a `#` reference to be the footer, we check the length of all of the commit content after the
            // header. In the future, we expect to be able to check only the body once the parser properly
            // handles this case.
            var allNonHeaderContent = commit.body.trim() + "\n" + commit.footer.trim();
            if (!((_a = config.minBodyLengthTypeExcludes) === null || _a === void 0 ? void 0 : _a.includes(commit.type)) &&
                allNonHeaderContent.length < config.minBodyLength) {
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
                errors.push("The commit message body contains lines greater than " + config.maxLineLength + " characters.");
                return false;
            }
            // Breaking change
            // Check if the commit message contains a valid break change description.
            // https://github.com/angular/angular/blob/88fbc066775ab1a2f6a8c75f933375b46d8fa9a4/CONTRIBUTING.md#commit-message-footer
            var hasBreakingChange = COMMIT_BODY_BREAKING_CHANGE_RE.exec(commit.fullText);
            if (hasBreakingChange !== null) {
                var _b = tslib_1.__read(hasBreakingChange, 2), breakingChangeDescription = _b[1];
                if (!breakingChangeDescription) {
                    // Not followed by :, space or two consecutive new lines,
                    errors.push("The commit message body contains an invalid breaking change description.");
                    return false;
                }
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
        print("BREAKING CHANGE: <breaking change summary>");
        print();
        print("<breaking change description>");
        print();
        print();
    }
    exports.printValidationErrors = printValidationErrors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUF1QztJQUV2QywyRUFBZ0Y7SUFDaEYseUVBQW1EO0lBZW5ELDJEQUEyRDtJQUMzRCxJQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0lBQ2xEOzs7Ozs7OztPQVFHO0lBQ0gsSUFBTSw4QkFBOEIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUV4RSx1RUFBdUU7SUFDdkUsU0FBZ0IscUJBQXFCLENBQ2pDLFNBQXdCLEVBQ3hCLE9BQTBDO1FBQTFDLHdCQUFBLEVBQUEsWUFBMEM7UUFDNUMsSUFBTSxNQUFNLEdBQUcsK0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQywwQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pGLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUU1QiwrREFBK0Q7UUFDL0QsU0FBUyw4QkFBOEI7WUFDckMsb0NBQW9DO1lBQ3BDLG9DQUFvQztZQUNwQyxvQ0FBb0M7O1lBRXBDLDJDQUEyQztZQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxvRkFBb0Y7WUFDcEYsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO29CQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCww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O29CQUN4RixPQUFPLEtBQUssQ0FBQztpQkFDZDthQUNGO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSw4QkFBOEIsRUFBRSxFQUFFLE1BQU0sUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFDLENBQUM7SUFDbkUsQ0FBQztJQXhJRCxzREF3SUM7SUFHRCxrRkFBa0Y7SUFDbEYsU0FBZ0IscUJBQXFCLENBQUMsTUFBZ0IsRUFBRSxLQUFhO1FBQWIsc0JBQUEsRUFBQSxRQUFRLGVBQUs7UUFDbkUsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFRLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBRyxDQUFDLENBQUM7UUFDdkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksSUFBSSxPQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBWCxDQUFXLENBQUMsQ0FBQztRQUNwQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztRQUMvQyxLQUFLLENBQUMsNEJBQTRCLENBQUMsQ0FBQztRQUNwQyxLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO1FBQ3BELEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7UUFDdkMsS0FBSyxFQUFFLENBQUM7UUFDUixLQUFLLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFmRCxzREFlQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIGdldENvbW1pdE1lc3NhZ2VDb25maWcsIFNjb3BlUmVxdWlyZW1lbnR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7Q29tbWl0LCBwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcGFyc2UnO1xuXG4vKiogT3B0aW9ucyBmb3IgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGRpc2FsbG93U3F1YXNoPzogYm9vbGVhbjtcbiAgbm9uRml4dXBDb21taXRIZWFkZXJzPzogc3RyaW5nW107XG59XG5cbi8qKiBUaGUgcmVzdWx0IG9mIGEgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiBjaGVjay4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlUmVzdWx0IHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yczogc3RyaW5nW107XG4gIGNvbW1pdDogQ29tbWl0O1xufVxuXG4vKiogUmVnZXggbWF0Y2hpbmcgYSBVUkwgZm9yIGFuIGVudGlyZSBjb21taXQgYm9keSBsaW5lLiAqL1xuY29uc3QgQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUgPSAvXmh0dHBzPzpcXC9cXC8uKiQvO1xuLyoqXG4gKiBSZWdleCBtYXRjaGluZyBhIGJyZWFraW5nIGNoYW5nZS5cbiAqXG4gKiAtIFN0YXJ0cyB3aXRoIEJSRUFLSU5HIENIQU5HRVxuICogLSBGb2xsb3dlZCBieSBhIGNvbG9uXG4gKiAtIEZvbGxvd2VkIGJ5IGEgc2luZ2xlIHNwYWNlIG9yIHR3byBjb25zZWN1dGl2ZSBuZXcgbGluZXNcbiAqXG4gKiBOQjogQW55dGhpbmcgYWZ0ZXIgYEJSRUFLSU5HIENIQU5HRWAgaXMgb3B0aW9uYWwgdG8gZmFjaWxpdGF0ZSB0aGUgdmFsaWRhdGlvbi5cbiAqL1xuY29uc3QgQ09NTUlUX0JPRFlfQlJFQUtJTkdfQ0hBTkdFX1JFID0gL15CUkVBS0lORyBDSEFOR0UoOiggfFxcbnsyfSkpPy9tO1xuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgICBjb21taXRNc2c6IHN0cmluZ3xDb21taXQsXG4gICAgb3B0aW9uczogVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyA9IHt9KTogVmFsaWRhdGVDb21taXRNZXNzYWdlUmVzdWx0IHtcbiAgY29uc3QgY29uZmlnID0gZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZygpLmNvbW1pdE1lc3NhZ2U7XG4gIGNvbnN0IGNvbW1pdCA9IHR5cGVvZiBjb21taXRNc2cgPT09ICdzdHJpbmcnID8gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZykgOiBjb21taXRNc2c7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogUGVyZm9ybSB0aGUgdmFsaWRhdGlvbiBjaGVja3MgYWdhaW5zdCB0aGUgcGFyc2VkIGNvbW1pdC4gKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCkge1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICAgIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAgIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gICAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAgIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgICAvLyBjaGVjay5cbiAgICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoeCA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJykpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDaGVja2luZyBjb21taXQgaGVhZGVyIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIGlmIChjb21taXQuaGVhZGVyLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBpcyBsb25nZXIgdGhhbiAke2NvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKCFjb21taXQudHlwZSkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgZG9lcyBub3QgbWF0Y2ggdGhlIGV4cGVjdGVkIGZvcm1hdC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoQ09NTUlUX1RZUEVTW2NvbW1pdC50eXBlXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvcnMucHVzaChgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhDT01NSVRfVFlQRVMpLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLyoqIFRoZSBzY29wZSByZXF1aXJlbWVudCBsZXZlbCBmb3IgdGhlIHByb3ZpZGVkIHR5cGUgb2YgdGhlIGNvbW1pdCBtZXNzYWdlLiAqL1xuICAgIGNvbnN0IHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID0gQ09NTUlUX1RZUEVTW2NvbW1pdC50eXBlXS5zY29wZTtcblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5Gb3JiaWRkZW4gJiYgY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChgU2NvcGVzIGFyZSBmb3JiaWRkZW4gZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBhIHNjb3BlIG9mICcke1xuICAgICAgICAgIGNvbW1pdC5zY29wZX0nIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQgJiYgIWNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgYFNjb3BlcyBhcmUgcmVxdWlyZWQgZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBubyBzY29wZSB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1pdC5zY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhjb21taXQuc2NvcGUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgJyR7Y29tbWl0LnNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICAgIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIER1ZSB0byBhbiBpc3N1ZSBpbiB3aGljaCBjb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXIgY29uc2lkZXJzIGFsbCBwYXJ0cyBvZiBhIGNvbW1pdCBhZnRlclxuICAgIC8vIGEgYCNgIHJlZmVyZW5jZSB0byBiZSB0aGUgZm9vdGVyLCB3ZSBjaGVjayB0aGUgbGVuZ3RoIG9mIGFsbCBvZiB0aGUgY29tbWl0IGNvbnRlbnQgYWZ0ZXIgdGhlXG4gICAgLy8gaGVhZGVyLiBJbiB0aGUgZnV0dXJlLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBjaGVjayBvbmx5IHRoZSBib2R5IG9uY2UgdGhlIHBhcnNlciBwcm9wZXJseVxuICAgIC8vIGhhbmRsZXMgdGhpcyBjYXNlLlxuICAgIGNvbnN0IGFsbE5vbkhlYWRlckNvbnRlbnQgPSBgJHtjb21taXQuYm9keS50cmltKCl9XFxuJHtjb21taXQuZm9vdGVyLnRyaW0oKX1gO1xuXG4gICAgaWYgKCFjb25maWcubWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz8uaW5jbHVkZXMoY29tbWl0LnR5cGUpICYmXG4gICAgICAgIGFsbE5vbkhlYWRlckNvbnRlbnQubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZSgobGluZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBleGNlZWRzIHRoZSBtYXggbGluZSBsZW5ndGggbGltaXQuIFRoZSBsaW1pdCBpcyBpZ25vcmVkIGZvclxuICAgICAgLy8gbGluZXMgdGhhdCBqdXN0IGNvbnRhaW4gYW4gVVJMIChhcyB0aGVzZSB1c3VhbGx5IGNhbm5vdCBiZSB3cmFwcGVkIG9yIHNob3J0ZW5lZCkuXG4gICAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgICB9KTtcblxuICAgIGlmIChsaW5lRXhjZWVkc01heExlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke1xuICAgICAgICAgIGNvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEJyZWFraW5nIGNoYW5nZVxuICAgIC8vIENoZWNrIGlmIHRoZSBjb21taXQgbWVzc2FnZSBjb250YWlucyBhIHZhbGlkIGJyZWFrIGNoYW5nZSBkZXNjcmlwdGlvbi5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvODhmYmMwNjY3NzVhYjFhMmY2YThjNzVmOTMzMzc1YjQ2ZDhmYTlhNC9DT05UUklCVVRJTkcubWQjY29tbWl0LW1lc3NhZ2UtZm9vdGVyXG4gICAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2UgPSBDT01NSVRfQk9EWV9CUkVBS0lOR19DSEFOR0VfUkUuZXhlYyhjb21taXQuZnVsbFRleHQpO1xuICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgWywgYnJlYWtpbmdDaGFuZ2VEZXNjcmlwdGlvbl0gPSBoYXNCcmVha2luZ0NoYW5nZTtcbiAgICAgIGlmICghYnJlYWtpbmdDaGFuZ2VEZXNjcmlwdGlvbikge1xuICAgICAgICAvLyBOb3QgZm9sbG93ZWQgYnkgOiwgc3BhY2Ugb3IgdHdvIGNvbnNlY3V0aXZlIG5ldyBsaW5lcyxcbiAgICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGFuIGludmFsaWQgYnJlYWtpbmcgY2hhbmdlIGRlc2NyaXB0aW9uLmApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4ge3ZhbGlkOiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSwgZXJyb3JzLCBjb21taXR9O1xufVxuXG5cbi8qKiBQcmludCB0aGUgZXJyb3IgbWVzc2FnZXMgZnJvbSB0aGUgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiB0byB0aGUgY29uc29sZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmludFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSwgcHJpbnQgPSBlcnJvcikge1xuICBwcmludC5ncm91cChgRXJyb3Ike2Vycm9ycy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ306YCk7XG4gIGVycm9ycy5mb3JFYWNoKGxpbmUgPT4gcHJpbnQobGluZSkpO1xuICBwcmludC5ncm91cEVuZCgpO1xuICBwcmludCgpO1xuICBwcmludCgnVGhlIGV4cGVjdGVkIGZvcm1hdCBmb3IgYSBjb21taXQgaXM6ICcpO1xuICBwcmludCgnPHR5cGU+KDxzY29wZT4pOiA8c3VtbWFyeT4nKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJzxib2R5PicpO1xuICBwcmludCgpO1xuICBwcmludChgQlJFQUtJTkcgQ0hBTkdFOiA8YnJlYWtpbmcgY2hhbmdlIHN1bW1hcnk+YCk7XG4gIHByaW50KCk7XG4gIHByaW50KGA8YnJlYWtpbmcgY2hhbmdlIGRlc2NyaXB0aW9uPmApO1xuICBwcmludCgpO1xuICBwcmludCgpO1xufVxuIl19