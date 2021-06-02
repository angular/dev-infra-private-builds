/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { error } from '../utils/console';
import { COMMIT_TYPES, getCommitMessageConfig, ScopeRequirement } from './config';
import { parseCommitMessage } from './parse';
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
export function validateCommitMessage(commitMsg, options = {}) {
    const config = getCommitMessageConfig().commitMessage;
    const commit = typeof commitMsg === 'string' ? parseCommitMessage(commitMsg) : commitMsg;
    const errors = [];
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
                    (options.nonFixupCommitHeaders.map(x => `\n      ${x}`).join('') || '-'));
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
        if (COMMIT_TYPES[commit.type] === undefined) {
            errors.push(`'${commit.type}' is not an allowed type.\n => TYPES: ${Object.keys(COMMIT_TYPES).join(', ')}`);
            return false;
        }
        /** The scope requirement level for the provided type of the commit message. */
        const scopeRequirementForType = COMMIT_TYPES[commit.type].scope;
        if (scopeRequirementForType === ScopeRequirement.Forbidden && commit.scope) {
            errors.push(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${commit.scope}' was provided.`);
            return false;
        }
        if (scopeRequirementForType === ScopeRequirement.Required && !commit.scope) {
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
        if (!((_a = config.minBodyLengthTypeExcludes) === null || _a === void 0 ? void 0 : _a.includes(commit.type)) &&
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
/** Print the error messages from the commit message validation to the console. */
export function printValidationErrors(errors, print = error) {
    print.group(`Error${errors.length === 1 ? '' : 's'}:`);
    errors.forEach(line => print(line));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZDLE9BQU8sRUFBQyxZQUFZLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEYsT0FBTyxFQUFTLGtCQUFrQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBZW5ELDJEQUEyRDtBQUMzRCxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0FBRWxEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxpQ0FBaUMsR0FDbkMsNkRBQTZELENBQUM7QUFFbEU7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLDZCQUE2QixHQUFHLHVEQUF1RCxDQUFDO0FBRTlGLHVFQUF1RTtBQUN2RSxNQUFNLFVBQVUscUJBQXFCLENBQ2pDLFNBQXdCLEVBQ3hCLFVBQXdDLEVBQUU7SUFDNUMsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQyxhQUFhLENBQUM7SUFDdEQsTUFBTSxNQUFNLEdBQUcsT0FBTyxTQUFTLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ3pGLE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUU1QiwrREFBK0Q7SUFDL0QsU0FBUyw4QkFBOEI7UUFDckMsb0NBQW9DO1FBQ3BDLG9DQUFvQztRQUNwQyxvQ0FBb0M7O1FBRXBDLDJDQUEyQztRQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELG9GQUFvRjtRQUNwRixtRkFBbUY7UUFDbkYsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFF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LEVBQUUsQ0FBQztBQUNWLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7Q09NTUlUX1RZUEVTLCBnZXRDb21taXRNZXNzYWdlQ29uZmlnLCBTY29wZVJlcXVpcmVtZW50fSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge0NvbW1pdCwgcGFyc2VDb21taXRNZXNzYWdlfSBmcm9tICcuL3BhcnNlJztcblxuLyoqIE9wdGlvbnMgZm9yIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24uICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZU9wdGlvbnMge1xuICBkaXNhbGxvd1NxdWFzaD86IGJvb2xlYW47XG4gIG5vbkZpeHVwQ29tbWl0SGVhZGVycz86IHN0cmluZ1tdO1xufVxuXG4vKiogVGhlIHJlc3VsdCBvZiBhIGNvbW1pdCBtZXNzYWdlIHZhbGlkYXRpb24gY2hlY2suICovXG5leHBvcnQgaW50ZXJmYWNlIFZhbGlkYXRlQ29tbWl0TWVzc2FnZVJlc3VsdCB7XG4gIHZhbGlkOiBib29sZWFuO1xuICBlcnJvcnM6IHN0cmluZ1tdO1xuICBjb21taXQ6IENvbW1pdDtcbn1cblxuLyoqIFJlZ2V4IG1hdGNoaW5nIGEgVVJMIGZvciBhbiBlbnRpcmUgY29tbWl0IGJvZHkgbGluZS4gKi9cbmNvbnN0IENPTU1JVF9CT0RZX1VSTF9MSU5FX1JFID0gL15odHRwcz86XFwvXFwvLiokLztcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hpbmcgcG90ZW50aWFsIG1pc3VzZSBvZiB0aGUgYEJSRUFLSU5HIENIQU5HRTpgIG1hcmtlciBpbiBhXG4gKiBjb21taXQgbWVzc2FnZS4gQ29tbWl0IG1lc3NhZ2VzIGNvbnRhaW5pbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgc25pcHBldHMgd2lsbCBmYWlsOlxuICpcbiAqICAgLSBgQlJFQUtJTkcgQ0hBTkdFIDxzb21lLWNvbnRlbnQ+YCB8IEhlcmUgd2UgYXNzdW1lIHRoZSBjb2xvbiBpcyBtaXNzaW5nIGJ5IGFjY2lkZW50LlxuICogICAtIGBCUkVBS0lORy1DSEFOR0U6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgQlJFQUtJTkcgQ0hBTkdFUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBCUkVBS0lORy1DSEFOR0VTOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKi9cbmNvbnN0IElOQ09SUkVDVF9CUkVBS0lOR19DSEFOR0VfQk9EWV9SRSA9XG4gICAgL14oQlJFQUtJTkcgQ0hBTkdFW146XXxCUkVBS0lORy1DSEFOR0V8QlJFQUtJTkdbIC1dQ0hBTkdFUykvbTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gbWF0Y2hpbmcgcG90ZW50aWFsIG1pc3VzZSBvZiB0aGUgYERFUFJFQ0FURUQ6YCBtYXJrZXIgaW4gYSBjb21taXRcbiAqIG1lc3NhZ2UuIENvbW1pdCBtZXNzYWdlcyBjb250YWluaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIHNuaXBwZXRzIHdpbGwgZmFpbDpcbiAqXG4gKiAgIC0gYERFUFJFQ0FURUQgPHNvbWUtY29udGVudD5gIHwgSGVyZSB3ZSBhc3N1bWUgdGhlIGNvbG9uIGlzIG1pc3NpbmcgYnkgYWNjaWRlbnQuXG4gKiAgIC0gYERFUFJFQ0FUSU9OUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBERVBSRUNBVEU6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgREVQUkVDQVRFUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICovXG5jb25zdCBJTkNPUlJFQ1RfREVQUkVDQVRJT05fQk9EWV9SRSA9IC9eKERFUFJFQ0FURURbXjpdfERFUFJFQ0FUSU9OU3xERVBSRUNBVEU6fERFUFJFQ0FURVMpL207XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nfENvbW1pdCxcbiAgICBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gdHlwZW9mIGNvbW1pdE1zZyA9PT0gJ3N0cmluZycgPyBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKSA6IGNvbW1pdE1zZztcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBQZXJmb3JtIHRoZSB2YWxpZGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHRoZSBwYXJzZWQgY29tbWl0LiAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSB7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gICAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gICAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgICBlcnJvcnMucHVzaCgnVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gICAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAgIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAgIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAgIC8vIGNoZWNrLlxuICAgIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgICAgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLm1hcCh4ID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke1xuICAgICAgICAgIE9iamVjdC5rZXlzKENPTU1JVF9UWVBFUykuam9pbignLCAnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gICAgY29uc3Qgc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPSBDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdLnNjb3BlO1xuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbiAmJiBjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBTY29wZXMgYXJlIGZvcmJpZGRlbiBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IGEgc2NvcGUgb2YgJyR7XG4gICAgICAgICAgY29tbWl0LnNjb3BlfScgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCAmJiAhY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgU2NvcGVzIGFyZSByZXF1aXJlZCBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IG5vIHNjb3BlIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBmdWxsU2NvcGUgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgaWYgKGZ1bGxTY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhmdWxsU2NvcGUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgJyR7ZnVsbFNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICAgIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIER1ZSB0byBhbiBpc3N1ZSBpbiB3aGljaCBjb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXIgY29uc2lkZXJzIGFsbCBwYXJ0cyBvZiBhIGNvbW1pdCBhZnRlclxuICAgIC8vIGEgYCNgIHJlZmVyZW5jZSB0byBiZSB0aGUgZm9vdGVyLCB3ZSBjaGVjayB0aGUgbGVuZ3RoIG9mIGFsbCBvZiB0aGUgY29tbWl0IGNvbnRlbnQgYWZ0ZXIgdGhlXG4gICAgLy8gaGVhZGVyLiBJbiB0aGUgZnV0dXJlLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBjaGVjayBvbmx5IHRoZSBib2R5IG9uY2UgdGhlIHBhcnNlciBwcm9wZXJseVxuICAgIC8vIGhhbmRsZXMgdGhpcyBjYXNlLlxuICAgIGNvbnN0IGFsbE5vbkhlYWRlckNvbnRlbnQgPSBgJHtjb21taXQuYm9keS50cmltKCl9XFxuJHtjb21taXQuZm9vdGVyLnRyaW0oKX1gO1xuXG4gICAgaWYgKCFjb25maWcubWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz8uaW5jbHVkZXMoY29tbWl0LnR5cGUpICYmXG4gICAgICAgIGFsbE5vbkhlYWRlckNvbnRlbnQubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZSgobGluZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBleGNlZWRzIHRoZSBtYXggbGluZSBsZW5ndGggbGltaXQuIFRoZSBsaW1pdCBpcyBpZ25vcmVkIGZvclxuICAgICAgLy8gbGluZXMgdGhhdCBqdXN0IGNvbnRhaW4gYW4gVVJMIChhcyB0aGVzZSB1c3VhbGx5IGNhbm5vdCBiZSB3cmFwcGVkIG9yIHNob3J0ZW5lZCkuXG4gICAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgICB9KTtcblxuICAgIGlmIChsaW5lRXhjZWVkc01heExlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke1xuICAgICAgICAgIGNvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEJyZWFraW5nIGNoYW5nZVxuICAgIC8vIENoZWNrIGlmIHRoZSBjb21taXQgbWVzc2FnZSBjb250YWlucyBhIHZhbGlkIGJyZWFrIGNoYW5nZSBkZXNjcmlwdGlvbi5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvODhmYmMwNjY3NzVhYjFhMmY2YThjNzVmOTMzMzc1YjQ2ZDhmYTlhNC9DT05UUklCVVRJTkcubWQjY29tbWl0LW1lc3NhZ2UtZm9vdGVyXG4gICAgaWYgKElOQ09SUkVDVF9CUkVBS0lOR19DSEFOR0VfQk9EWV9SRS50ZXN0KGNvbW1pdC5mdWxsVGV4dCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBhbiBpbnZhbGlkIGJyZWFraW5nIGNoYW5nZSBub3RlLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChJTkNPUlJFQ1RfREVQUkVDQVRJT05fQk9EWV9SRS50ZXN0KGNvbW1pdC5mdWxsVGV4dCkpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBhbiBpbnZhbGlkIGRlcHJlY2F0aW9uIG5vdGUuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4ge3ZhbGlkOiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSwgZXJyb3JzLCBjb21taXR9O1xufVxuXG5cbi8qKiBQcmludCB0aGUgZXJyb3IgbWVzc2FnZXMgZnJvbSB0aGUgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiB0byB0aGUgY29uc29sZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmludFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSwgcHJpbnQgPSBlcnJvcikge1xuICBwcmludC5ncm91cChgRXJyb3Ike2Vycm9ycy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ306YCk7XG4gIGVycm9ycy5mb3JFYWNoKGxpbmUgPT4gcHJpbnQobGluZSkpO1xuICBwcmludC5ncm91cEVuZCgpO1xuICBwcmludCgpO1xuICBwcmludCgnVGhlIGV4cGVjdGVkIGZvcm1hdCBmb3IgYSBjb21taXQgaXM6ICcpO1xuICBwcmludCgnPHR5cGU+KDxzY29wZT4pOiA8c3VtbWFyeT4nKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJzxib2R5PicpO1xuICBwcmludCgpO1xuICBwcmludChgQlJFQUtJTkcgQ0hBTkdFOiA8YnJlYWtpbmcgY2hhbmdlIHN1bW1hcnk+YCk7XG4gIHByaW50KCk7XG4gIHByaW50KGA8YnJlYWtpbmcgY2hhbmdlIGRlc2NyaXB0aW9uPmApO1xuICBwcmludCgpO1xuICBwcmludCgpO1xufVxuIl19