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
            var fullScope = commit.npmScope ? commit.npmScope + "/" + commit.scope : commit.scope;
            if (fullScope && !config.scopes.includes(fullScope)) {
                errors.push("'" + fullScope + "' is not an allowed scope.\n => SCOPES: " + config.scopes.join(', '));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUF1QztJQUV2QywyRUFBZ0Y7SUFDaEYseUVBQW1EO0lBZW5ELDJEQUEyRDtJQUMzRCxJQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0lBQ2xEOzs7Ozs7OztPQVFHO0lBQ0gsSUFBTSw4QkFBOEIsR0FBRyxnQ0FBZ0MsQ0FBQztJQUV4RSx1RUFBdUU7SUFDdkUsU0FBZ0IscUJBQXFCLENBQ2pDLFNBQXdCLEVBQ3hCLE9BQTBDO1FBQTFDLHdCQUFBLEVBQUEsWUFBMEM7UUFDNUMsSUFBTSxNQUFNLEdBQUcsK0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQywwQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQ3pGLElBQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztRQUU1QiwrREFBK0Q7UUFDL0QsU0FBUyw4QkFBOEI7WUFDckMsb0NBQW9DO1lBQ3BDLG9DQUFvQztZQUNwQyxvQ0FBb0M7O1lBRXBDLDJDQUEyQztZQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxvRkFBb0Y7WUFDcEYsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO29CQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCww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bnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBnZXRDb21taXRNZXNzYWdlQ29uZmlnLCBTY29wZVJlcXVpcmVtZW50fSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG4vKiogVGhlIHJlc3VsdCBvZiBhIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gY2hlY2suICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xuICBjb21taXQ6IENvbW1pdDtcbn1cblxuLyoqIFJlZ2V4IG1hdGNoaW5nIGEgVVJMIGZvciBhbiBlbnRpcmUgY29tbWl0IGJvZHkgbGluZS4gKi9cbmNvbnN0IENPTU1JVF9CT0RZX1VSTF9MSU5FX1JFID0gL15odHRwcz86XFwvXFwvLiokLztcbi8qKlxuICogUmVnZXggbWF0Y2hpbmcgYSBicmVha2luZyBjaGFuZ2UuXG4gKlxuICogLSBTdGFydHMgd2l0aCBCUkVBS0lORyBDSEFOR0VcbiAqIC0gRm9sbG93ZWQgYnkgYSBjb2xvblxuICogLSBGb2xsb3dlZCBieSBhIHNpbmdsZSBzcGFjZSBvciB0d28gY29uc2VjdXRpdmUgbmV3IGxpbmVzXG4gKlxuICogTkI6IEFueXRoaW5nIGFmdGVyIGBCUkVBS0lORyBDSEFOR0VgIGlzIG9wdGlvbmFsIHRvIGZhY2lsaXRhdGUgdGhlIHZhbGlkYXRpb24uXG4gKi9cbmNvbnN0IENPTU1JVF9CT0RZX0JSRUFLSU5HX0NIQU5HRV9SRSA9IC9eQlJFQUtJTkcgQ0hBTkdFKDooIHxcXG57Mn0pKT8vbTtcblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gICAgY29tbWl0TXNnOiBzdHJpbmd8Q29tbWl0LFxuICAgIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSk6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIGNvbnN0IGNvbmZpZyA9IGdldENvbW1pdE1lc3NhZ2VDb25maWcoKS5jb21taXRNZXNzYWdlO1xuICBjb25zdCBjb21taXQgPSB0eXBlb2YgY29tbWl0TXNnID09PSAnc3RyaW5nJyA/IHBhcnNlQ29tbWl0TWVzc2FnZShjb21taXRNc2cpIDogY29tbWl0TXNnO1xuICBjb25zdCBlcnJvcnM6IHN0cmluZ1tdID0gW107XG5cbiAgLyoqIFBlcmZvcm0gdGhlIHZhbGlkYXRpb24gY2hlY2tzIGFnYWluc3QgdGhlIHBhcnNlZCBjb21taXQuICovXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0QW5kQ29sbGVjdEVycm9ycygpIHtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDaGVja2luZyByZXZlcnQsIHNxdWFzaCwgZml4dXAgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIEFsbCByZXZlcnQgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZC5cbiAgICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBbGwgc3F1YXNoZXMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIGFzIHRoZSBjb21taXQgd2lsbCBiZSBzcXVhc2hlZCBpbnRvIGFub3RoZXIgaW5cbiAgICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICAgIGlmIChjb21taXQuaXNTcXVhc2gpIHtcbiAgICAgIGlmIChvcHRpb25zLmRpc2FsbG93U3F1YXNoKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKCdUaGUgY29tbWl0IG11c3QgYmUgbWFudWFsbHkgc3F1YXNoZWQgaW50byB0aGUgdGFyZ2V0IGNvbW1pdCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBGaXh1cHMgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgdW5sZXNzIG5vbkZpeHVwQ29tbWl0SGVhZGVycyBhcmUgcHJvdmlkZWQgdG8gY2hlY2tcbiAgICAvLyBhZ2FpbnN0LiBJZiBgbm9uRml4dXBDb21taXRIZWFkZXJzYCBpcyBub3QgZW1wdHksIHdlIGNoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nXG4gICAgLy8gbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXMgY29tbWl0J3MgaGVhZGVyIGFmdGVyXG4gICAgLy8gc3RyaXBwaW5nIHRoZSBgZml4dXAhIGAgcHJlZml4KSwgb3RoZXJ3aXNlIHdlIGFzc3VtZSB0aGlzIHZlcmlmaWNhdGlvbiB3aWxsIGhhcHBlbiBpbiBhbm90aGVyXG4gICAgLy8gY2hlY2suXG4gICAgaWYgKGNvbW1pdC5pc0ZpeHVwKSB7XG4gICAgICBpZiAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMgJiYgIW9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLmluY2x1ZGVzKGNvbW1pdC5oZWFkZXIpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBpZiAoY29tbWl0LmhlYWRlci5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7XG4gICAgICAgICAgT2JqZWN0LmtleXMoQ09NTUlUX1RZUEVTKS5qb2luKCcsICcpfWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBUaGUgc2NvcGUgcmVxdWlyZW1lbnQgbGV2ZWwgZm9yIHRoZSBwcm92aWRlZCB0eXBlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgICBjb25zdCBzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9IENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0uc2NvcGU7XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuICYmIGNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goYFNjb3BlcyBhcmUgZm9yYmlkZGVuIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgYSBzY29wZSBvZiAnJHtcbiAgICAgICAgICBjb21taXQuc2NvcGV9JyB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkICYmICFjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGBTY29wZXMgYXJlIHJlcXVpcmVkIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgbm8gc2NvcGUgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGZ1bGxTY29wZSA9IGNvbW1pdC5ucG1TY29wZSA/IGAke2NvbW1pdC5ucG1TY29wZX0vJHtjb21taXQuc2NvcGV9YCA6IGNvbW1pdC5zY29wZTtcbiAgICBpZiAoZnVsbFNjb3BlICYmICFjb25maWcuc2NvcGVzLmluY2x1ZGVzKGZ1bGxTY29wZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGAnJHtmdWxsU2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gICAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gRHVlIHRvIGFuIGlzc3VlIGluIHdoaWNoIGNvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlciBjb25zaWRlcnMgYWxsIHBhcnRzIG9mIGEgY29tbWl0IGFmdGVyXG4gICAgLy8gYSBgI2AgcmVmZXJlbmNlIHRvIGJlIHRoZSBmb290ZXIsIHdlIGNoZWNrIHRoZSBsZW5ndGggb2YgYWxsIG9mIHRoZSBjb21taXQgY29udGVudCBhZnRlciB0aGVcbiAgICAvLyBoZWFkZXIuIEluIHRoZSBmdXR1cmUsIHdlIGV4cGVjdCB0byBiZSBhYmxlIHRvIGNoZWNrIG9ubHkgdGhlIGJvZHkgb25jZSB0aGUgcGFyc2VyIHByb3Blcmx5XG4gICAgLy8gaGFuZGxlcyB0aGlzIGNhc2UuXG4gICAgY29uc3QgYWxsTm9uSGVhZGVyQ29udGVudCA9IGAke2NvbW1pdC5ib2R5LnRyaW0oKX1cXG4ke2NvbW1pdC5mb290ZXIudHJpbSgpfWA7XG5cbiAgICBpZiAoIWNvbmZpZy5taW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPy5pbmNsdWRlcyhjb21taXQudHlwZSkgJiZcbiAgICAgICAgYWxsTm9uSGVhZGVyQ29udGVudC5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGRvZXMgbm90IG1lZXQgdGhlIG1pbmltdW0gbGVuZ3RoIG9mICR7XG4gICAgICAgICAgY29uZmlnLm1pbkJvZHlMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBib2R5QnlMaW5lID0gY29tbWl0LmJvZHkuc3BsaXQoJ1xcbicpO1xuICAgIGNvbnN0IGxpbmVFeGNlZWRzTWF4TGVuZ3RoID0gYm9keUJ5TGluZS5zb21lKChsaW5lOiBzdHJpbmcpID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGV4Y2VlZHMgdGhlIG1heCBsaW5lIGxlbmd0aCBsaW1pdC4gVGhlIGxpbWl0IGlzIGlnbm9yZWQgZm9yXG4gICAgICAvLyBsaW5lcyB0aGF0IGp1c3QgY29udGFpbiBhbiBVUkwgKGFzIHRoZXNlIHVzdWFsbHkgY2Fubm90IGJlIHdyYXBwZWQgb3Igc2hvcnRlbmVkKS5cbiAgICAgIHJldHVybiBsaW5lLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoICYmICFDT01NSVRfQk9EWV9VUkxfTElORV9SRS50ZXN0KGxpbmUpO1xuICAgIH0pO1xuXG4gICAgaWYgKGxpbmVFeGNlZWRzTWF4TGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7XG4gICAgICAgICAgY29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnMuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQnJlYWtpbmcgY2hhbmdlXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGNvbW1pdCBtZXNzYWdlIGNvbnRhaW5zIGEgdmFsaWQgYnJlYWsgY2hhbmdlIGRlc2NyaXB0aW9uLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi84OGZiYzA2Njc3NWFiMWEyZjZhOGM3NWY5MzMzNzViNDZkOGZhOWE0L0NPTlRSSUJVVElORy5tZCNjb21taXQtbWVzc2FnZS1mb290ZXJcbiAgICBjb25zdCBoYXNCcmVha2luZ0NoYW5nZSA9IENPTU1JVF9CT0RZX0JSRUFLSU5HX0NIQU5HRV9SRS5leGVjKGNvbW1pdC5mdWxsVGV4dCk7XG4gICAgaWYgKGhhc0JyZWFraW5nQ2hhbmdlICE9PSBudWxsKSB7XG4gICAgICBjb25zdCBbLCBicmVha2luZ0NoYW5nZURlc2NyaXB0aW9uXSA9IGhhc0JyZWFraW5nQ2hhbmdlO1xuICAgICAgaWYgKCFicmVha2luZ0NoYW5nZURlc2NyaXB0aW9uKSB7XG4gICAgICAgIC8vIE5vdCBmb2xsb3dlZCBieSA6LCBzcGFjZSBvciB0d28gY29uc2VjdXRpdmUgbmV3IGxpbmVzLFxuICAgICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgYW4gaW52YWxpZCBicmVha2luZyBjaGFuZ2UgZGVzY3JpcHRpb24uYCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB7dmFsaWQ6IHZhbGlkYXRlQ29tbWl0QW5kQ29sbGVjdEVycm9ycygpLCBlcnJvcnMsIGNvbW1pdH07XG59XG5cblxuLyoqIFByaW50IHRoZSBlcnJvciBtZXNzYWdlcyBmcm9tIHRoZSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIHRvIHRoZSBjb25zb2xlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW50VmFsaWRhdGlvbkVycm9ycyhlcnJvcnM6IHN0cmluZ1tdLCBwcmludCA9IGVycm9yKSB7XG4gIHByaW50Lmdyb3VwKGBFcnJvciR7ZXJyb3JzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnfTpgKTtcbiAgZXJyb3JzLmZvckVhY2gobGluZSA9PiBwcmludChsaW5lKSk7XG4gIHByaW50Lmdyb3VwRW5kKCk7XG4gIHByaW50KCk7XG4gIHByaW50KCdUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogJyk7XG4gIHByaW50KCc8dHlwZT4oPHNjb3BlPik6IDxzdW1tYXJ5PicpO1xuICBwcmludCgpO1xuICBwcmludCgnPGJvZHk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KGBCUkVBS0lORyBDSEFOR0U6IDxicmVha2luZyBjaGFuZ2Ugc3VtbWFyeT5gKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoYDxicmVha2luZyBjaGFuZ2UgZGVzY3JpcHRpb24+YCk7XG4gIHByaW50KCk7XG4gIHByaW50KCk7XG59XG4iXX0=