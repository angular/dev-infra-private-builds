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
            if (!((_a = config.minBodyLengthTypeExcludes) === null || _a === void 0 ? void 0 : _a.includes(commit.type)) &&
                commit.body.trim().length < config.minBodyLength) {
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
    }
    exports.printValidationErrors = printValidationErrors;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUF1QztJQUV2QywyRUFBZ0Y7SUFDaEYseUVBQW1EO0lBZW5ELDJEQUEyRDtJQUMzRCxJQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0lBQ2xEOzs7Ozs7OztPQVFHO0lBQ0gsSUFBTSw4QkFBOEIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUV4RSx1RUFBdUU7SUFDdkUsU0FBZ0IscUJBQXFCLENBQ2pDLFNBQXdCLEVBQ3hCLE9BQTBDO1FBQTFDLHdCQUFBLEVBQUEsWUFBMEM7UUFDNUMsSUFBTSxNQUFNLEdBQUcsK0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQywwQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pGLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUU1QiwrREFBK0Q7UUFDL0QsU0FBUyw4QkFBOEI7WUFDckMsb0NBQW9DO1lBQ3BDLG9DQUFvQztZQUNwQyxvQ0FBb0M7O1lBRXBDLDJDQUEyQztZQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxvRkFBb0Y7WUFDcEYsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO29CQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCww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Q0FBQztJQUNuRSxDQUFDO0lBbElELHNEQWtJQztJQUdELGtGQUFrRjtJQUNsRixTQUFnQixxQkFBcUIsQ0FBQyxNQUFnQixFQUFFLEtBQWE7UUFBYixzQkFBQSxFQUFBLFFBQVEsZUFBSztRQUNuRSxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVEsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFHLENBQUMsQ0FBQztRQUN2RCxNQUFNLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxJQUFJLE9BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFYLENBQVcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQztRQUNSLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQy9DLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxDQUFDO0lBQ1YsQ0FBQztJQVZELHNEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZywgU2NvcGVSZXF1aXJlbWVudH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtDb21taXQsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuLyoqIFRoZSByZXN1bHQgb2YgYSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIGNoZWNrLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICB2YWxpZDogYm9vbGVhbjtcbiAgZXJyb3JzOiBzdHJpbmdbXTtcbiAgY29tbWl0OiBDb21taXQ7XG59XG5cbi8qKiBSZWdleCBtYXRjaGluZyBhIFVSTCBmb3IgYW4gZW50aXJlIGNvbW1pdCBib2R5IGxpbmUuICovXG5jb25zdCBDT01NSVRfQk9EWV9VUkxfTElORV9SRSA9IC9eaHR0cHM/OlxcL1xcLy4qJC87XG4vKipcbiAqIFJlZ2V4IG1hdGNoaW5nIGEgYnJlYWtpbmcgY2hhbmdlLlxuICpcbiAqIC0gU3RhcnRzIHdpdGggQlJFQUtJTkcgQ0hBTkdFXG4gKiAtIEZvbGxvd2VkIGJ5IGEgY29sb25cbiAqIC0gRm9sbG93ZWQgYnkgYSBzaW5nbGUgc3BhY2Ugb3IgdHdvIGNvbnNlY3V0aXZlIG5ldyBsaW5lc1xuICpcbiAqIE5COiBBbnl0aGluZyBhZnRlciBgQlJFQUtJTkcgQ0hBTkdFYCBpcyBvcHRpb25hbCB0byBmYWNpbGl0YXRlIHRoZSB2YWxpZGF0aW9uLlxuICovXG5jb25zdCBDT01NSVRfQk9EWV9CUkVBS0lOR19DSEFOR0VfUkUgPSAvXkJSRUFLSU5HIENIQU5HRSg6KCB8XFxuezJ9KSk/L207XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nfENvbW1pdCxcbiAgICBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gdHlwZW9mIGNvbW1pdE1zZyA9PT0gJ3N0cmluZycgPyBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKSA6IGNvbW1pdE1zZztcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBQZXJmb3JtIHRoZSB2YWxpZGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHRoZSBwYXJzZWQgY29tbWl0LiAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSB7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gICAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gICAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgICBlcnJvcnMucHVzaCgnVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gICAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAgIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAgIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAgIC8vIGNoZWNrLlxuICAgIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgICAgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLm1hcCh4ID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke1xuICAgICAgICAgIE9iamVjdC5rZXlzKENPTU1JVF9UWVBFUykuam9pbignLCAnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gICAgY29uc3Qgc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPSBDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdLnNjb3BlO1xuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbiAmJiBjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBTY29wZXMgYXJlIGZvcmJpZGRlbiBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IGEgc2NvcGUgb2YgJyR7XG4gICAgICAgICAgY29tbWl0LnNjb3BlfScgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCAmJiAhY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgU2NvcGVzIGFyZSByZXF1aXJlZCBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IG5vIHNjb3BlIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoY29tbWl0LnNjb3BlICYmICFjb25maWcuc2NvcGVzLmluY2x1ZGVzKGNvbW1pdC5zY29wZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGAnJHtjb21taXQuc2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gICAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgaWYgKCFjb25maWcubWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz8uaW5jbHVkZXMoY29tbWl0LnR5cGUpICYmXG4gICAgICAgIGNvbW1pdC5ib2R5LnRyaW0oKS5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxpbmVFeGNlZWRzTWF4TGVuZ3RoID0gYm9keUJ5TGluZS5zb21lKChsaW5lOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGV4Y2VlZHMgdGhlIG1heCBsaW5lIGxlbmd0aCBsaW1pdC4gVGhlIGxpbWl0IGlzIGlnbm9yZWQgZm9yXG4gICAgICAvLyBsaW5lcyB0aGF0IGp1c3QgY29udGFpbiBhbiBVUkwgKGFzIHRoZXNlIHVzdWFsbHkgY2Fubm90IGJlIHdyYXBwZWQgb3Igc2hvcnRlbmVkKS5cbiAgICAgIHJldHVybiBsaW5lLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoICYmICFDT01NSVRfQk9EWV9VUkxfTElORV9SRS50ZXN0KGxpbmUpO1xuICAgIH0pO1xuXG4gICAgaWYgKGxpbmVFeGNlZWRzTWF4TGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBCcmVha2luZyBjaGFuZ2VcbiAgICAvLyBDaGVjayBpZiB0aGUgY29tbWl0IG1lc3NhZ2UgY29udGFpbnMgYSB2YWxpZCBicmVhayBjaGFuZ2UgZGVzY3JpcHRpb24uXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzg4ZmJjMDY2Nzc1YWIxYTJmNmE4Yzc1ZjkzMzM3NWI0NmQ4ZmE5YTQvQ09OVFJJQlVUSU5HLm1kI2NvbW1pdC1tZXNzYWdlLWZvb3RlclxuICAgIGNvbnN0IGhhc0JyZWFraW5nQ2hhbmdlID0gQ09NTUlUX0JPRFlfQlJFQUtJTkdfQ0hBTkdFX1JFLmV4ZWMoY29tbWl0LmZ1bGxUZXh0KTtcbiAgICBpZiAoaGFzQnJlYWtpbmdDaGFuZ2UgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IFssIGJyZWFraW5nQ2hhbmdlRGVzY3JpcHRpb25dID0gaGFzQnJlYWtpbmdDaGFuZ2U7XG4gICAgICBpZiAoIWJyZWFraW5nQ2hhbmdlRGVzY3JpcHRpb24pIHtcbiAgICAgICAgLy8gTm90IGZvbGxvd2VkIGJ5IDosIHNwYWNlIG9yIHR3byBjb25zZWN1dGl2ZSBuZXcgbGluZXMsXG4gICAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBhbiBpbnZhbGlkIGJyZWFraW5nIGNoYW5nZSBkZXNjcmlwdGlvbi5gKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHt2YWxpZDogdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCksIGVycm9ycywgY29tbWl0fTtcbn1cblxuXG4vKiogUHJpbnQgdGhlIGVycm9yIG1lc3NhZ2VzIGZyb20gdGhlIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gdG8gdGhlIGNvbnNvbGUuICovXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRWYWxpZGF0aW9uRXJyb3JzKGVycm9yczogc3RyaW5nW10sIHByaW50ID0gZXJyb3IpIHtcbiAgcHJpbnQuZ3JvdXAoYEVycm9yJHtlcnJvcnMubGVuZ3RoID09PSAxID8gJycgOiAncyd9OmApO1xuICBlcnJvcnMuZm9yRWFjaChsaW5lID0+IHByaW50KGxpbmUpKTtcbiAgcHJpbnQuZ3JvdXBFbmQoKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJ1RoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiAnKTtcbiAgcHJpbnQoJzx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KCc8Ym9keT4nKTtcbiAgcHJpbnQoKTtcbn1cbiJdfQ==