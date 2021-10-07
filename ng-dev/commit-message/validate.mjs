"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.printValidationErrors = exports.validateCommitMessage = void 0;
const config_1 = require("../utils/config");
const console_1 = require("../utils/console");
const config_2 = require("./config");
const parse_1 = require("./parse");
/** Regex matching a URL for an entire commit body line. */
const COMMIT_BODY_URL_LINE_RE = /^https?:\/\/.*$/;
/**
 * Regular expression matching potential misuse of the `BREAKING CHANGE:` marker in a
 * commit message. Commit messages containing one of the following snippets will fail:
 *
 *   - `BREAKING CHANGE <some-content>` | Here we assume the colon is missing by accident.
 *   - `BREAKING-CHANGE: <some-content>` | The wrong keyword is used here.
 *   - `BREAKING CHANGES: <some-content>` | The wrong keyword is used here.
 *   - `BREAKING-CHANGES: <some-content>` | The wrong keyword is used here.
 */
const INCORRECT_BREAKING_CHANGE_BODY_RE = /^(BREAKING CHANGE[^:]|BREAKING-CHANGE|BREAKING[ -]CHANGES)/m;
/**
 * Regular expression matching potential misuse of the `DEPRECATED:` marker in a commit
 * message. Commit messages containing one of the following snippets will fail:
 *
 *   - `DEPRECATED <some-content>` | Here we assume the colon is missing by accident.
 *   - `DEPRECATIONS: <some-content>` | The wrong keyword is used here.
 *   - `DEPRECATION: <some-content>` | The wrong keyword is used here.
 *   - `DEPRECATE: <some-content>` | The wrong keyword is used here.
 *   - `DEPRECATES: <some-content>` | The wrong keyword is used here.
 */
const INCORRECT_DEPRECATION_BODY_RE = /^(DEPRECATED[^:]|DEPRECATIONS?|DEPRECATE:|DEPRECATES)/m;
/** Validate a commit message against using the local repo's config. */
function validateCommitMessage(commitMsg, options = {}) {
    const _config = (0, config_1.getConfig)();
    (0, config_2.assertValidCommitMessageConfig)(_config);
    const config = _config.commitMessage;
    const commit = typeof commitMsg === 'string' ? (0, parse_1.parseCommitMessage)(commitMsg) : commitMsg;
    const errors = [];
    /** Perform the validation checks against the parsed commit. */
    function validateCommitAndCollectErrors() {
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
                    (options.nonFixupCommitHeaders.map((x) => `\n      ${x}`).join('') || '-'));
                return false;
            }
            return true;
        }
        ////////////////////////////
        // Checking commit header //
        ////////////////////////////
        if (commit.header.length > config.maxLineLength) {
            errors.push(`The commit message header is longer than ${config.maxLineLength} characters`);
            return false;
        }
        if (!commit.type) {
            errors.push(`The commit message header does not match the expected format.`);
            return false;
        }
        if (config_2.COMMIT_TYPES[commit.type] === undefined) {
            errors.push(`'${commit.type}' is not an allowed type.\n => TYPES: ${Object.keys(config_2.COMMIT_TYPES).join(', ')}`);
            return false;
        }
        /** The scope requirement level for the provided type of the commit message. */
        const scopeRequirementForType = config_2.COMMIT_TYPES[commit.type].scope;
        if (scopeRequirementForType === config_2.ScopeRequirement.Forbidden && commit.scope) {
            errors.push(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${commit.scope}' was provided.`);
            return false;
        }
        if (scopeRequirementForType === config_2.ScopeRequirement.Required && !commit.scope) {
            errors.push(`Scopes are required for commits with type '${commit.type}', but no scope was provided.`);
            return false;
        }
        if (commit.scope && !config.scopes.includes(commit.scope)) {
            errors.push(`'${commit.scope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
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
        const allNonHeaderContent = `${commit.body.trim()}\n${commit.footer.trim()}`;
        if (!config.minBodyLengthTypeExcludes?.includes(commit.type) &&
            allNonHeaderContent.length < config.minBodyLength) {
            errors.push(`The commit message body does not meet the minimum length of ${config.minBodyLength} characters`);
            return false;
        }
        const bodyByLine = commit.body.split('\n');
        const lineExceedsMaxLength = bodyByLine.some((line) => {
            // Check if any line exceeds the max line length limit. The limit is ignored for
            // lines that just contain an URL (as these usually cannot be wrapped or shortened).
            return line.length > config.maxLineLength && !COMMIT_BODY_URL_LINE_RE.test(line);
        });
        if (lineExceedsMaxLength) {
            errors.push(`The commit message body contains lines greater than ${config.maxLineLength} characters.`);
            return false;
        }
        // Breaking change
        // Check if the commit message contains a valid break change description.
        // https://github.com/angular/angular/blob/88fbc066775ab1a2f6a8c75f933375b46d8fa9a4/CONTRIBUTING.md#commit-message-footer
        if (INCORRECT_BREAKING_CHANGE_BODY_RE.test(commit.fullText)) {
            errors.push(`The commit message body contains an invalid breaking change note.`);
            return false;
        }
        if (INCORRECT_DEPRECATION_BODY_RE.test(commit.fullText)) {
            errors.push(`The commit message body contains an invalid deprecation note.`);
            return false;
        }
        return true;
    }
    return { valid: validateCommitAndCollectErrors(), errors, commit };
}
exports.validateCommitMessage = validateCommitMessage;
/** Print the error messages from the commit message validation to the console. */
function printValidationErrors(errors, print = console_1.error) {
    print.group(`Error${errors.length === 1 ? '' : 's'}:`);
    errors.forEach((line) => print(line));
    print.groupEnd();
    print();
    print('The expected format for a commit is: ');
    print('<type>(<scope>): <summary>');
    print();
    print('<body>');
    print();
    print(`BREAKING CHANGE: <breaking change summary>`);
    print();
    print(`<breaking change description>`);
    print();
    print();
}
exports.printValidationErrors = printValidationErrors;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQTBDO0FBQzFDLDhDQUF1QztBQUV2QyxxQ0FBd0Y7QUFDeEYsbUNBQW1EO0FBZW5ELDJEQUEyRDtBQUMzRCxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxpQ0FBaUMsR0FDckMsNkRBQTZELENBQUM7QUFFaEU7Ozs7Ozs7OztHQVNHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRyx3REFBd0QsQ0FBQztBQUUvRix1RUFBdUU7QUFDdkUsU0FBZ0IscUJBQXFCLENBQ25DLFNBQTBCLEVBQzFCLFVBQXdDLEVBQUU7SUFFMUMsTUFBTSxPQUFPLEdBQUcsSUFBQSxrQkFBUyxHQUFFLENBQUM7SUFDNUIsSUFBQSx1Q0FBOEIsRUFBQyxPQUFPLENBQUMsQ0FBQztJQUN4QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQ3JDLE1BQU0sTUFBTSxHQUFHLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBQSwwQkFBa0IsRUFBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3pGLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUU1QiwrREFBK0Q7SUFDL0QsU0FBUyw4QkFBOEI7UUFDckMsb0NBQW9DO1FBQ3BDLG9DQUFvQztRQUNwQyxvQ0FBb0M7UUFFcEMsMkNBQTJDO1FBQzNDLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNuQixPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsb0ZBQW9GO1FBQ3BGLG1GQUFtRjtRQUNuRixJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDbkIsSUFBSSxPQUFPLENBQUMsY0FB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QUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsK0RBQStELENBQUMsQ0FBQztZQUM3RSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSw4QkFBOEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQztBQUNuRSxDQUFDO0FBdEpELHNEQXNKQztBQUVELGtGQUFrRjtBQUNsRixTQUFnQixxQkFBcUIsQ0FBQyxNQUFnQixFQUFFLEtBQUssR0FBRyxlQUFLO0lBQ25FLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQixLQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQy9DLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3BDLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7SUFDcEQsS0FBSyxFQUFFLENBQUM7SUFDUixLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUN2QyxLQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUssRUFBRSxDQUFDO0FBQ1YsQ0FBQztBQWZELHNEQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7YXNzZXJ0VmFsaWRDb21taXRNZXNzYWdlQ29uZmlnLCBDT01NSVRfVFlQRVMsIFNjb3BlUmVxdWlyZW1lbnR9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7Q29tbWl0LCBwYXJzZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vcGFyc2UnO1xuXG4vKiogT3B0aW9ucyBmb3IgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlT3B0aW9ucyB7XG4gIGRpc2FsbG93U3F1YXNoPzogYm9vbGVhbjtcbiAgbm9uRml4dXBDb21taXRIZWFkZXJzPzogc3RyaW5nW107XG59XG5cbi8qKiBUaGUgcmVzdWx0IG9mIGEgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiBjaGVjay4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmFsaWRhdGVDb21taXRNZXNzYWdlUmVzdWx0IHtcbiAgdmFsaWQ6IGJvb2xlYW47XG4gIGVycm9yczogc3RyaW5nW107XG4gIGNvbW1pdDogQ29tbWl0O1xufVxuXG4vKiogUmVnZXggbWF0Y2hpbmcgYSBVUkwgZm9yIGFuIGVudGlyZSBjb21taXQgYm9keSBsaW5lLiAqL1xuY29uc3QgQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUgPSAvXmh0dHBzPzpcXC9cXC8uKiQvO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBtYXRjaGluZyBwb3RlbnRpYWwgbWlzdXNlIG9mIHRoZSBgQlJFQUtJTkcgQ0hBTkdFOmAgbWFya2VyIGluIGFcbiAqIGNvbW1pdCBtZXNzYWdlLiBDb21taXQgbWVzc2FnZXMgY29udGFpbmluZyBvbmUgb2YgdGhlIGZvbGxvd2luZyBzbmlwcGV0cyB3aWxsIGZhaWw6XG4gKlxuICogICAtIGBCUkVBS0lORyBDSEFOR0UgPHNvbWUtY29udGVudD5gIHwgSGVyZSB3ZSBhc3N1bWUgdGhlIGNvbG9uIGlzIG1pc3NpbmcgYnkgYWNjaWRlbnQuXG4gKiAgIC0gYEJSRUFLSU5HLUNIQU5HRTogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBCUkVBS0lORyBDSEFOR0VTOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKiAgIC0gYEJSRUFLSU5HLUNIQU5HRVM6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqL1xuY29uc3QgSU5DT1JSRUNUX0JSRUFLSU5HX0NIQU5HRV9CT0RZX1JFID1cbiAgL14oQlJFQUtJTkcgQ0hBTkdFW146XXxCUkVBS0lORy1DSEFOR0V8QlJFQUtJTkdbIC1dQ0hBTkdFUykvbTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hpbmcgcG90ZW50aWFsIG1pc3VzZSBvZiB0aGUgYERFUFJFQ0FURUQ6YCBtYXJrZXIgaW4gYSBjb21taXRcbiAqIG1lc3NhZ2UuIENvbW1pdCBtZXNzYWdlcyBjb250YWluaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIHNuaXBwZXRzIHdpbGwgZmFpbDpcbiAqXG4gKiAgIC0gYERFUFJFQ0FURUQgPHNvbWUtY29udGVudD5gIHwgSGVyZSB3ZSBhc3N1bWUgdGhlIGNvbG9uIGlzIG1pc3NpbmcgYnkgYWNjaWRlbnQuXG4gKiAgIC0gYERFUFJFQ0FUSU9OUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBERVBSRUNBVElPTjogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBERVBSRUNBVEU6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgREVQUkVDQVRFUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICovXG5jb25zdCBJTkNPUlJFQ1RfREVQUkVDQVRJT05fQk9EWV9SRSA9IC9eKERFUFJFQ0FURURbXjpdfERFUFJFQ0FUSU9OUz98REVQUkVDQVRFOnxERVBSRUNBVEVTKS9tO1xuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgY29tbWl0TXNnOiBzdHJpbmcgfCBDb21taXQsXG4gIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSxcbik6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIGNvbnN0IF9jb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRDb21taXRNZXNzYWdlQ29uZmlnKF9jb25maWcpO1xuICBjb25zdCBjb25maWcgPSBfY29uZmlnLmNvbW1pdE1lc3NhZ2U7XG4gIGNvbnN0IGNvbW1pdCA9IHR5cGVvZiBjb21taXRNc2cgPT09ICdzdHJpbmcnID8gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZykgOiBjb21taXRNc2c7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogUGVyZm9ybSB0aGUgdmFsaWRhdGlvbiBjaGVja3MgYWdhaW5zdCB0aGUgcGFyc2VkIGNvbW1pdC4gKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCkge1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICAgIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAgIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gICAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAgIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgICAvLyBjaGVjay5cbiAgICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKCh4KSA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJyksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtPYmplY3Qua2V5cyhDT01NSVRfVFlQRVMpLmpvaW4oXG4gICAgICAgICAgJywgJyxcbiAgICAgICAgKX1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gICAgY29uc3Qgc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPSBDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdLnNjb3BlO1xuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbiAmJiBjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgU2NvcGVzIGFyZSBmb3JiaWRkZW4gZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBhIHNjb3BlIG9mICcke2NvbW1pdC5zY29wZX0nIHdhcyBwcm92aWRlZC5gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQgJiYgIWNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBTY29wZXMgYXJlIHJlcXVpcmVkIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgbm8gc2NvcGUgd2FzIHByb3ZpZGVkLmAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChjb21taXQuc2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoY29tbWl0LnNjb3BlKSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGAnJHtjb21taXQuc2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gICAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gRHVlIHRvIGFuIGlzc3VlIGluIHdoaWNoIGNvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlciBjb25zaWRlcnMgYWxsIHBhcnRzIG9mIGEgY29tbWl0IGFmdGVyXG4gICAgLy8gYSBgI2AgcmVmZXJlbmNlIHRvIGJlIHRoZSBmb290ZXIsIHdlIGNoZWNrIHRoZSBsZW5ndGggb2YgYWxsIG9mIHRoZSBjb21taXQgY29udGVudCBhZnRlciB0aGVcbiAgICAvLyBoZWFkZXIuIEluIHRoZSBmdXR1cmUsIHdlIGV4cGVjdCB0byBiZSBhYmxlIHRvIGNoZWNrIG9ubHkgdGhlIGJvZHkgb25jZSB0aGUgcGFyc2VyIHByb3Blcmx5XG4gICAgLy8gaGFuZGxlcyB0aGlzIGNhc2UuXG4gICAgY29uc3QgYWxsTm9uSGVhZGVyQ29udGVudCA9IGAke2NvbW1pdC5ib2R5LnRyaW0oKX1cXG4ke2NvbW1pdC5mb290ZXIudHJpbSgpfWA7XG5cbiAgICBpZiAoXG4gICAgICAhY29uZmlnLm1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/LmluY2x1ZGVzKGNvbW1pdC50eXBlKSAmJlxuICAgICAgYWxsTm9uSGVhZGVyQ29udGVudC5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aFxuICAgICkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke2NvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZSgobGluZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBleGNlZWRzIHRoZSBtYXggbGluZSBsZW5ndGggbGltaXQuIFRoZSBsaW1pdCBpcyBpZ25vcmVkIGZvclxuICAgICAgLy8gbGluZXMgdGhhdCBqdXN0IGNvbnRhaW4gYW4gVVJMIChhcyB0aGVzZSB1c3VhbGx5IGNhbm5vdCBiZSB3cmFwcGVkIG9yIHNob3J0ZW5lZCkuXG4gICAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgICB9KTtcblxuICAgIGlmIChsaW5lRXhjZWVkc01heExlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVycy5gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBCcmVha2luZyBjaGFuZ2VcbiAgICAvLyBDaGVjayBpZiB0aGUgY29tbWl0IG1lc3NhZ2UgY29udGFpbnMgYSB2YWxpZCBicmVhayBjaGFuZ2UgZGVzY3JpcHRpb24uXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzg4ZmJjMDY2Nzc1YWIxYTJmNmE4Yzc1ZjkzMzM3NWI0NmQ4ZmE5YTQvQ09OVFJJQlVUSU5HLm1kI2NvbW1pdC1tZXNzYWdlLWZvb3RlclxuICAgIGlmIChJTkNPUlJFQ1RfQlJFQUtJTkdfQ0hBTkdFX0JPRFlfUkUudGVzdChjb21taXQuZnVsbFRleHQpKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgYW4gaW52YWxpZCBicmVha2luZyBjaGFuZ2Ugbm90ZS5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoSU5DT1JSRUNUX0RFUFJFQ0FUSU9OX0JPRFlfUkUudGVzdChjb21taXQuZnVsbFRleHQpKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgYW4gaW52YWxpZCBkZXByZWNhdGlvbiBub3RlLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHt2YWxpZDogdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCksIGVycm9ycywgY29tbWl0fTtcbn1cblxuLyoqIFByaW50IHRoZSBlcnJvciBtZXNzYWdlcyBmcm9tIHRoZSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIHRvIHRoZSBjb25zb2xlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW50VmFsaWRhdGlvbkVycm9ycyhlcnJvcnM6IHN0cmluZ1tdLCBwcmludCA9IGVycm9yKSB7XG4gIHByaW50Lmdyb3VwKGBFcnJvciR7ZXJyb3JzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnfTpgKTtcbiAgZXJyb3JzLmZvckVhY2goKGxpbmUpID0+IHByaW50KGxpbmUpKTtcbiAgcHJpbnQuZ3JvdXBFbmQoKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJ1RoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiAnKTtcbiAgcHJpbnQoJzx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KCc8Ym9keT4nKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoYEJSRUFLSU5HIENIQU5HRTogPGJyZWFraW5nIGNoYW5nZSBzdW1tYXJ5PmApO1xuICBwcmludCgpO1xuICBwcmludChgPGJyZWFraW5nIGNoYW5nZSBkZXNjcmlwdGlvbj5gKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoKTtcbn1cbiJdfQ==