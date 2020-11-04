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
        var commit = parse_1.parseCommitMessage(commitMsg);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsb0VBQXVDO0lBRXZDLDJFQUFnRjtJQUNoRix5RUFBZ0U7SUFlaEUsMkRBQTJEO0lBQzNELElBQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQUM7SUFFbEQsdUVBQXVFO0lBQ3ZFLFNBQWdCLHFCQUFxQixDQUNqQyxTQUFpQixFQUFFLE9BQTBDO1FBQTFDLHdCQUFBLEVBQUEsWUFBMEM7UUFDL0QsSUFBTSxNQUFNLEdBQUcsK0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFDdEQsSUFBTSxNQUFNLEdBQUcsMEJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0MsSUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO1FBRTVCLCtEQUErRDtRQUMvRCxTQUFTLDhCQUE4QjtZQUNyQyxzRkFBc0Y7O1lBRXRGLG9DQUFvQztZQUNwQyxvQ0FBb0M7WUFDcEMsb0NBQW9DO1lBRXBDLDJDQUEyQztZQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7Z0JBQ25CLE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCxvRkFBb0Y7WUFDcEYsbUZBQW1GO1lBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtnQkFDbkIsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO29CQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLDZEQUE2RCxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDO2lCQUNkO2dCQUNELE9BQU8sSUFBSSxDQUFDO2FBQ2I7WUFFRCwwRkFBMEY7WUFDMUYsOEZBQThGO1lBQzlGLDBGQUEwRjtZQUMxRixnR0FBZ0c7WUFDaEcsU0FBUztZQUNULElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtnQkFDbEIsSUFB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QyxDQUFDO1FBQ3BDLEtBQUssRUFBRSxDQUFDO1FBQ1IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hCLEtBQUssRUFBRSxDQUFDO0lBQ1YsQ0FBQztJQVZELHNEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtDT01NSVRfVFlQRVMsIGdldENvbW1pdE1lc3NhZ2VDb25maWcsIFNjb3BlUmVxdWlyZW1lbnR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7cGFyc2VDb21taXRNZXNzYWdlLCBQYXJzZWRDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG4vKiogVGhlIHJlc3VsdCBvZiBhIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gY2hlY2suICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xuICBjb21taXQ6IFBhcnNlZENvbW1pdE1lc3NhZ2U7XG59XG5cbi8qKiBSZWdleCBtYXRjaGluZyBhIFVSTCBmb3IgYW4gZW50aXJlIGNvbW1pdCBib2R5IGxpbmUuICovXG5jb25zdCBDT01NSVRfQk9EWV9VUkxfTElORV9SRSA9IC9eaHR0cHM/OlxcL1xcLy4qJC87XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nLCBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZyk7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogUGVyZm9ybSB0aGUgdmFsaWRhdGlvbiBjaGVja3MgYWdhaW5zdCB0aGUgcGFyc2VkIGNvbW1pdC4gKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCkge1xuICAgIC8vIFRPRE8oam9zZXBocGVycm90dCk6IFJlbW92ZSBlYXJseSByZXR1cm4gY2FsbHMgd2hlbiBjb21taXQgbWVzc2FnZSBlcnJvcnMgYXJlIGZvdW5kXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDaGVja2luZyByZXZlcnQsIHNxdWFzaCwgZml4dXAgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIEFsbCByZXZlcnQgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZC5cbiAgICBpZiAoY29tbWl0LmlzUmV2ZXJ0KSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBBbGwgc3F1YXNoZXMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIGFzIHRoZSBjb21taXQgd2lsbCBiZSBzcXVhc2hlZCBpbnRvIGFub3RoZXIgaW5cbiAgICAvLyB0aGUgZ2l0IGhpc3RvcnkgYW55d2F5LCB1bmxlc3MgdGhlIG9wdGlvbnMgcHJvdmlkZWQgdG8gbm90IGFsbG93IHNxdWFzaCBjb21taXRzLlxuICAgIGlmIChjb21taXQuaXNTcXVhc2gpIHtcbiAgICAgIGlmIChvcHRpb25zLmRpc2FsbG93U3F1YXNoKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKCdUaGUgY29tbWl0IG11c3QgYmUgbWFudWFsbHkgc3F1YXNoZWQgaW50byB0aGUgdGFyZ2V0IGNvbW1pdCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBGaXh1cHMgY29tbWl0cyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgdW5sZXNzIG5vbkZpeHVwQ29tbWl0SGVhZGVycyBhcmUgcHJvdmlkZWQgdG8gY2hlY2tcbiAgICAvLyBhZ2FpbnN0LiBJZiBgbm9uRml4dXBDb21taXRIZWFkZXJzYCBpcyBub3QgZW1wdHksIHdlIGNoZWNrIHdoZXRoZXIgdGhlcmUgaXMgYSBjb3JyZXNwb25kaW5nXG4gICAgLy8gbm9uLWZpeHVwIGNvbW1pdCAoaS5lLiBhIGNvbW1pdCB3aG9zZSBoZWFkZXIgaXMgaWRlbnRpY2FsIHRvIHRoaXMgY29tbWl0J3MgaGVhZGVyIGFmdGVyXG4gICAgLy8gc3RyaXBwaW5nIHRoZSBgZml4dXAhIGAgcHJlZml4KSwgb3RoZXJ3aXNlIHdlIGFzc3VtZSB0aGlzIHZlcmlmaWNhdGlvbiB3aWxsIGhhcHBlbiBpbiBhbm90aGVyXG4gICAgLy8gY2hlY2suXG4gICAgaWYgKGNvbW1pdC5pc0ZpeHVwKSB7XG4gICAgICBpZiAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMgJiYgIW9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLmluY2x1ZGVzKGNvbW1pdC5oZWFkZXIpKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKHggPT4gYFxcbiAgICAgICR7eH1gKS5qb2luKCcnKSB8fCAnLScpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBpZiAoY29tbWl0LmhlYWRlci5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goYCcke2NvbW1pdC50eXBlfScgaXMgbm90IGFuIGFsbG93ZWQgdHlwZS5cXG4gPT4gVFlQRVM6ICR7XG4gICAgICAgICAgT2JqZWN0LmtleXMoQ09NTUlUX1RZUEVTKS5qb2luKCcsICcpfWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBUaGUgc2NvcGUgcmVxdWlyZW1lbnQgbGV2ZWwgZm9yIHRoZSBwcm92aWRlZCB0eXBlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgICBjb25zdCBzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9IENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0uc2NvcGU7XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuICYmIGNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goYFNjb3BlcyBhcmUgZm9yYmlkZGVuIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgYSBzY29wZSBvZiAnJHtcbiAgICAgICAgICBjb21taXQuc2NvcGV9JyB3YXMgcHJvdmlkZWQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LlJlcXVpcmVkICYmICFjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICAgIGBTY29wZXMgYXJlIHJlcXVpcmVkIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgbm8gc2NvcGUgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjb21taXQuc2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgYCcke2NvbW1pdC5zY29wZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHNjb3BlLlxcbiA9PiBTQ09QRVM6ICR7Y29uZmlnLnNjb3Blcy5qb2luKCcsICcpfWApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENvbW1pdHMgd2l0aCB0aGUgdHlwZSBvZiBgcmVsZWFzZWAgZG8gbm90IHJlcXVpcmUgYSBjb21taXQgYm9keS5cbiAgICBpZiAoY29tbWl0LnR5cGUgPT09ICdyZWxlYXNlJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBDaGVja2luZyBjb21taXQgYm9keSAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICBpZiAoIWNvbmZpZy5taW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPy5pbmNsdWRlcyhjb21taXQudHlwZSkgJiZcbiAgICAgICAgY29tbWl0LmJvZHlXaXRob3V0TGlua2luZy50cmltKCkubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZShsaW5lID0+IHtcbiAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGV4Y2VlZHMgdGhlIG1heCBsaW5lIGxlbmd0aCBsaW1pdC4gVGhlIGxpbWl0IGlzIGlnbm9yZWQgZm9yXG4gICAgICAvLyBsaW5lcyB0aGF0IGp1c3QgY29udGFpbiBhbiBVUkwgKGFzIHRoZXNlIHVzdWFsbHkgY2Fubm90IGJlIHdyYXBwZWQgb3Igc2hvcnRlbmVkKS5cbiAgICAgIHJldHVybiBsaW5lLmxlbmd0aCA+IGNvbmZpZy5tYXhMaW5lTGVuZ3RoICYmICFDT01NSVRfQk9EWV9VUkxfTElORV9SRS50ZXN0KGxpbmUpO1xuICAgIH0pO1xuXG4gICAgaWYgKGxpbmVFeGNlZWRzTWF4TGVuZ3RoKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB7dmFsaWQ6IHZhbGlkYXRlQ29tbWl0QW5kQ29sbGVjdEVycm9ycygpLCBlcnJvcnMsIGNvbW1pdH07XG59XG5cblxuLyoqIFByaW50IHRoZSBlcnJvciBtZXNzYWdlcyBmcm9tIHRoZSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIHRvIHRoZSBjb25zb2xlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW50VmFsaWRhdGlvbkVycm9ycyhlcnJvcnM6IHN0cmluZ1tdLCBwcmludCA9IGVycm9yKSB7XG4gIHByaW50Lmdyb3VwKGBFcnJvciR7ZXJyb3JzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnfTpgKTtcbiAgZXJyb3JzLmZvckVhY2gobGluZSA9PiBwcmludChsaW5lKSk7XG4gIHByaW50Lmdyb3VwRW5kKCk7XG4gIHByaW50KCk7XG4gIHByaW50KCdUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogJyk7XG4gIHByaW50KCc8dHlwZT4oPHNjb3BlPik6IDxzdW1tYXJ5PicpO1xuICBwcmludCgpO1xuICBwcmludCgnPGJvZHk+Jyk7XG4gIHByaW50KCk7XG59XG4iXX0=