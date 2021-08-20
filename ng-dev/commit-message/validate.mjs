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
 *   - `DEPRECATE: <some-content>` | The wrong keyword is used here.
 *   - `DEPRECATES: <some-content>` | The wrong keyword is used here.
 */
const INCORRECT_DEPRECATION_BODY_RE = /^(DEPRECATED[^:]|DEPRECATIONS|DEPRECATE:|DEPRECATES)/m;
/** Validate a commit message against using the local repo's config. */
function validateCommitMessage(commitMsg, options = {}) {
    const _config = config_1.getConfig();
    config_2.assertValidCommitMessageConfig(_config);
    const config = _config.commitMessage;
    const commit = typeof commitMsg === 'string' ? parse_1.parseCommitMessage(commitMsg) : commitMsg;
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
        const fullScope = commit.npmScope ? `${commit.npmScope}/${commit.scope}` : commit.scope;
        if (fullScope && !config.scopes.includes(fullScope)) {
            errors.push(`'${fullScope}' is not an allowed scope.\n => SCOPES: ${config.scopes.join(', ')}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsNENBQTBDO0FBQzFDLDhDQUF1QztBQUV2QyxxQ0FBd0Y7QUFDeEYsbUNBQW1EO0FBZW5ELDJEQUEyRDtBQUMzRCxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxpQ0FBaUMsR0FDckMsNkRBQTZELENBQUM7QUFFaEU7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLDZCQUE2QixHQUFHLHVEQUF1RCxDQUFDO0FBRTlGLHVFQUF1RTtBQUN2RSxTQUFnQixxQkFBcUIsQ0FDbkMsU0FBMEIsRUFDMUIsVUFBd0MsRUFBRTtJQUUxQyxNQUFNLE9BQU8sR0FBRyxrQkFBUyxFQUFFLENBQUM7SUFDNUIsdUNBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDeEMsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQztJQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFPLFNBQVMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLDBCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDekYsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBRTVCLCtEQUErRDtJQUMvRCxTQUFTLDhCQUE4QjtRQUNyQyxvQ0FBb0M7UUFDcEMsb0NBQW9DO1FBQ3BDLG9DQUFvQztRQUVwQywyQ0FBMkM7UUFDM0MsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxvRkFBb0Y7UUFDcEYsbUZBQW1GO1FBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNuQixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7Z0JBQzFCLE1B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InNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2Fzc2VydFZhbGlkQ29tbWl0TWVzc2FnZUNvbmZpZywgQ09NTUlUX1RZUEVTLCBTY29wZVJlcXVpcmVtZW50fSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG4vKiogVGhlIHJlc3VsdCBvZiBhIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gY2hlY2suICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xuICBjb21taXQ6IENvbW1pdDtcbn1cblxuLyoqIFJlZ2V4IG1hdGNoaW5nIGEgVVJMIGZvciBhbiBlbnRpcmUgY29tbWl0IGJvZHkgbGluZS4gKi9cbmNvbnN0IENPTU1JVF9CT0RZX1VSTF9MSU5FX1JFID0gL15odHRwcz86XFwvXFwvLiokLztcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hpbmcgcG90ZW50aWFsIG1pc3VzZSBvZiB0aGUgYEJSRUFLSU5HIENIQU5HRTpgIG1hcmtlciBpbiBhXG4gKiBjb21taXQgbWVzc2FnZS4gQ29tbWl0IG1lc3NhZ2VzIGNvbnRhaW5pbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgc25pcHBldHMgd2lsbCBmYWlsOlxuICpcbiAqICAgLSBgQlJFQUtJTkcgQ0hBTkdFIDxzb21lLWNvbnRlbnQ+YCB8IEhlcmUgd2UgYXNzdW1lIHRoZSBjb2xvbiBpcyBtaXNzaW5nIGJ5IGFjY2lkZW50LlxuICogICAtIGBCUkVBS0lORy1DSEFOR0U6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgQlJFQUtJTkcgQ0hBTkdFUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBCUkVBS0lORy1DSEFOR0VTOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKi9cbmNvbnN0IElOQ09SUkVDVF9CUkVBS0lOR19DSEFOR0VfQk9EWV9SRSA9XG4gIC9eKEJSRUFLSU5HIENIQU5HRVteOl18QlJFQUtJTkctQ0hBTkdFfEJSRUFLSU5HWyAtXUNIQU5HRVMpL207XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIG1hdGNoaW5nIHBvdGVudGlhbCBtaXN1c2Ugb2YgdGhlIGBERVBSRUNBVEVEOmAgbWFya2VyIGluIGEgY29tbWl0XG4gKiBtZXNzYWdlLiBDb21taXQgbWVzc2FnZXMgY29udGFpbmluZyBvbmUgb2YgdGhlIGZvbGxvd2luZyBzbmlwcGV0cyB3aWxsIGZhaWw6XG4gKlxuICogICAtIGBERVBSRUNBVEVEIDxzb21lLWNvbnRlbnQ+YCB8IEhlcmUgd2UgYXNzdW1lIHRoZSBjb2xvbiBpcyBtaXNzaW5nIGJ5IGFjY2lkZW50LlxuICogICAtIGBERVBSRUNBVElPTlM6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgREVQUkVDQVRFOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKiAgIC0gYERFUFJFQ0FURVM6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqL1xuY29uc3QgSU5DT1JSRUNUX0RFUFJFQ0FUSU9OX0JPRFlfUkUgPSAvXihERVBSRUNBVEVEW146XXxERVBSRUNBVElPTlN8REVQUkVDQVRFOnxERVBSRUNBVEVTKS9tO1xuXG4vKiogVmFsaWRhdGUgYSBjb21taXQgbWVzc2FnZSBhZ2FpbnN0IHVzaW5nIHRoZSBsb2NhbCByZXBvJ3MgY29uZmlnLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQ29tbWl0TWVzc2FnZShcbiAgY29tbWl0TXNnOiBzdHJpbmcgfCBDb21taXQsXG4gIG9wdGlvbnM6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMgPSB7fSxcbik6IFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIGNvbnN0IF9jb25maWcgPSBnZXRDb25maWcoKTtcbiAgYXNzZXJ0VmFsaWRDb21taXRNZXNzYWdlQ29uZmlnKF9jb25maWcpO1xuICBjb25zdCBjb25maWcgPSBfY29uZmlnLmNvbW1pdE1lc3NhZ2U7XG4gIGNvbnN0IGNvbW1pdCA9IHR5cGVvZiBjb21taXRNc2cgPT09ICdzdHJpbmcnID8gcGFyc2VDb21taXRNZXNzYWdlKGNvbW1pdE1zZykgOiBjb21taXRNc2c7XG4gIGNvbnN0IGVycm9yczogc3RyaW5nW10gPSBbXTtcblxuICAvKiogUGVyZm9ybSB0aGUgdmFsaWRhdGlvbiBjaGVja3MgYWdhaW5zdCB0aGUgcGFyc2VkIGNvbW1pdC4gKi9cbiAgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCkge1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIHJldmVydCwgc3F1YXNoLCBmaXh1cCAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gQWxsIHJldmVydCBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLlxuICAgIGlmIChjb21taXQuaXNSZXZlcnQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEFsbCBzcXVhc2hlcyBhcmUgY29uc2lkZXJlZCB2YWxpZCwgYXMgdGhlIGNvbW1pdCB3aWxsIGJlIHNxdWFzaGVkIGludG8gYW5vdGhlciBpblxuICAgIC8vIHRoZSBnaXQgaGlzdG9yeSBhbnl3YXksIHVubGVzcyB0aGUgb3B0aW9ucyBwcm92aWRlZCB0byBub3QgYWxsb3cgc3F1YXNoIGNvbW1pdHMuXG4gICAgaWYgKGNvbW1pdC5pc1NxdWFzaCkge1xuICAgICAgaWYgKG9wdGlvbnMuZGlzYWxsb3dTcXVhc2gpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goJ1RoZSBjb21taXQgbXVzdCBiZSBtYW51YWxseSBzcXVhc2hlZCBpbnRvIHRoZSB0YXJnZXQgY29tbWl0Jyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZpeHVwcyBjb21taXRzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCB1bmxlc3Mgbm9uRml4dXBDb21taXRIZWFkZXJzIGFyZSBwcm92aWRlZCB0byBjaGVja1xuICAgIC8vIGFnYWluc3QuIElmIGBub25GaXh1cENvbW1pdEhlYWRlcnNgIGlzIG5vdCBlbXB0eSwgd2UgY2hlY2sgd2hldGhlciB0aGVyZSBpcyBhIGNvcnJlc3BvbmRpbmdcbiAgICAvLyBub24tZml4dXAgY29tbWl0IChpLmUuIGEgY29tbWl0IHdob3NlIGhlYWRlciBpcyBpZGVudGljYWwgdG8gdGhpcyBjb21taXQncyBoZWFkZXIgYWZ0ZXJcbiAgICAvLyBzdHJpcHBpbmcgdGhlIGBmaXh1cCEgYCBwcmVmaXgpLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHRoaXMgdmVyaWZpY2F0aW9uIHdpbGwgaGFwcGVuIGluIGFub3RoZXJcbiAgICAvLyBjaGVjay5cbiAgICBpZiAoY29tbWl0LmlzRml4dXApIHtcbiAgICAgIGlmIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycyAmJiAhb3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMuaW5jbHVkZXMoY29tbWl0LmhlYWRlcikpIHtcbiAgICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgICAgJ1VuYWJsZSB0byBmaW5kIG1hdGNoIGZvciBmaXh1cCBjb21taXQgYW1vbmcgcHJpb3IgY29tbWl0czogJyArXG4gICAgICAgICAgICAob3B0aW9ucy5ub25GaXh1cENvbW1pdEhlYWRlcnMubWFwKCh4KSA9PiBgXFxuICAgICAgJHt4fWApLmpvaW4oJycpIHx8ICctJyksXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgJyR7Y29tbWl0LnR5cGV9JyBpcyBub3QgYW4gYWxsb3dlZCB0eXBlLlxcbiA9PiBUWVBFUzogJHtPYmplY3Qua2V5cyhDT01NSVRfVFlQRVMpLmpvaW4oXG4gICAgICAgICAgJywgJyxcbiAgICAgICAgKX1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gICAgY29uc3Qgc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPSBDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdLnNjb3BlO1xuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbiAmJiBjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgU2NvcGVzIGFyZSBmb3JiaWRkZW4gZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBhIHNjb3BlIG9mICcke2NvbW1pdC5zY29wZX0nIHdhcyBwcm92aWRlZC5gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuUmVxdWlyZWQgJiYgIWNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBTY29wZXMgYXJlIHJlcXVpcmVkIGZvciBjb21taXRzIHdpdGggdHlwZSAnJHtjb21taXQudHlwZX0nLCBidXQgbm8gc2NvcGUgd2FzIHByb3ZpZGVkLmAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGZ1bGxTY29wZSA9IGNvbW1pdC5ucG1TY29wZSA/IGAke2NvbW1pdC5ucG1TY29wZX0vJHtjb21taXQuc2NvcGV9YCA6IGNvbW1pdC5zY29wZTtcbiAgICBpZiAoZnVsbFNjb3BlICYmICFjb25maWcuc2NvcGVzLmluY2x1ZGVzKGZ1bGxTY29wZSkpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgJyR7ZnVsbFNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICAgIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIER1ZSB0byBhbiBpc3N1ZSBpbiB3aGljaCBjb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXIgY29uc2lkZXJzIGFsbCBwYXJ0cyBvZiBhIGNvbW1pdCBhZnRlclxuICAgIC8vIGEgYCNgIHJlZmVyZW5jZSB0byBiZSB0aGUgZm9vdGVyLCB3ZSBjaGVjayB0aGUgbGVuZ3RoIG9mIGFsbCBvZiB0aGUgY29tbWl0IGNvbnRlbnQgYWZ0ZXIgdGhlXG4gICAgLy8gaGVhZGVyLiBJbiB0aGUgZnV0dXJlLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBjaGVjayBvbmx5IHRoZSBib2R5IG9uY2UgdGhlIHBhcnNlciBwcm9wZXJseVxuICAgIC8vIGhhbmRsZXMgdGhpcyBjYXNlLlxuICAgIGNvbnN0IGFsbE5vbkhlYWRlckNvbnRlbnQgPSBgJHtjb21taXQuYm9keS50cmltKCl9XFxuJHtjb21taXQuZm9vdGVyLnRyaW0oKX1gO1xuXG4gICAgaWYgKFxuICAgICAgIWNvbmZpZy5taW5Cb2R5TGVuZ3RoVHlwZUV4Y2x1ZGVzPy5pbmNsdWRlcyhjb21taXQudHlwZSkgJiZcbiAgICAgIGFsbE5vbkhlYWRlckNvbnRlbnQubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGhcbiAgICApIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgZG9lcyBub3QgbWVldCB0aGUgbWluaW11bSBsZW5ndGggb2YgJHtjb25maWcubWluQm9keUxlbmd0aH0gY2hhcmFjdGVyc2AsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHlCeUxpbmUgPSBjb21taXQuYm9keS5zcGxpdCgnXFxuJyk7XG4gICAgY29uc3QgbGluZUV4Y2VlZHNNYXhMZW5ndGggPSBib2R5QnlMaW5lLnNvbWUoKGxpbmU6IHN0cmluZykgPT4ge1xuICAgICAgLy8gQ2hlY2sgaWYgYW55IGxpbmUgZXhjZWVkcyB0aGUgbWF4IGxpbmUgbGVuZ3RoIGxpbWl0LiBUaGUgbGltaXQgaXMgaWdub3JlZCBmb3JcbiAgICAgIC8vIGxpbmVzIHRoYXQganVzdCBjb250YWluIGFuIFVSTCAoYXMgdGhlc2UgdXN1YWxseSBjYW5ub3QgYmUgd3JhcHBlZCBvciBzaG9ydGVuZWQpLlxuICAgICAgcmV0dXJuIGxpbmUubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGggJiYgIUNPTU1JVF9CT0RZX1VSTF9MSU5FX1JFLnRlc3QobGluZSk7XG4gICAgfSk7XG5cbiAgICBpZiAobGluZUV4Y2VlZHNNYXhMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKFxuICAgICAgICBgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgbGluZXMgZ3JlYXRlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnMuYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQnJlYWtpbmcgY2hhbmdlXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGNvbW1pdCBtZXNzYWdlIGNvbnRhaW5zIGEgdmFsaWQgYnJlYWsgY2hhbmdlIGRlc2NyaXB0aW9uLlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIvYmxvYi84OGZiYzA2Njc3NWFiMWEyZjZhOGM3NWY5MzMzNzViNDZkOGZhOWE0L0NPTlRSSUJVVElORy5tZCNjb21taXQtbWVzc2FnZS1mb290ZXJcbiAgICBpZiAoSU5DT1JSRUNUX0JSRUFLSU5HX0NIQU5HRV9CT0RZX1JFLnRlc3QoY29tbWl0LmZ1bGxUZXh0KSkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGFuIGludmFsaWQgYnJlYWtpbmcgY2hhbmdlIG5vdGUuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKElOQ09SUkVDVF9ERVBSRUNBVElPTl9CT0RZX1JFLnRlc3QoY29tbWl0LmZ1bGxUZXh0KSkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGFuIGludmFsaWQgZGVwcmVjYXRpb24gbm90ZS5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB7dmFsaWQ6IHZhbGlkYXRlQ29tbWl0QW5kQ29sbGVjdEVycm9ycygpLCBlcnJvcnMsIGNvbW1pdH07XG59XG5cbi8qKiBQcmludCB0aGUgZXJyb3IgbWVzc2FnZXMgZnJvbSB0aGUgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiB0byB0aGUgY29uc29sZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmludFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSwgcHJpbnQgPSBlcnJvcikge1xuICBwcmludC5ncm91cChgRXJyb3Ike2Vycm9ycy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ306YCk7XG4gIGVycm9ycy5mb3JFYWNoKChsaW5lKSA9PiBwcmludChsaW5lKSk7XG4gIHByaW50Lmdyb3VwRW5kKCk7XG4gIHByaW50KCk7XG4gIHByaW50KCdUaGUgZXhwZWN0ZWQgZm9ybWF0IGZvciBhIGNvbW1pdCBpczogJyk7XG4gIHByaW50KCc8dHlwZT4oPHNjb3BlPik6IDxzdW1tYXJ5PicpO1xuICBwcmludCgpO1xuICBwcmludCgnPGJvZHk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KGBCUkVBS0lORyBDSEFOR0U6IDxicmVha2luZyBjaGFuZ2Ugc3VtbWFyeT5gKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoYDxicmVha2luZyBjaGFuZ2UgZGVzY3JpcHRpb24+YCk7XG4gIHByaW50KCk7XG4gIHByaW50KCk7XG59XG4iXX0=