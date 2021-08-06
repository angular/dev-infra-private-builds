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
const console_1 = require("../utils/console");
const config_1 = require("./config");
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
    const config = config_1.getCommitMessageConfig().commitMessage;
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
        if (config_1.COMMIT_TYPES[commit.type] === undefined) {
            errors.push(`'${commit.type}' is not an allowed type.\n => TYPES: ${Object.keys(config_1.COMMIT_TYPES).join(', ')}`);
            return false;
        }
        /** The scope requirement level for the provided type of the commit message. */
        const scopeRequirementForType = config_1.COMMIT_TYPES[commit.type].scope;
        if (scopeRequirementForType === config_1.ScopeRequirement.Forbidden && commit.scope) {
            errors.push(`Scopes are forbidden for commits with type '${commit.type}', but a scope of '${commit.scope}' was provided.`);
            return false;
        }
        if (scopeRequirementForType === config_1.ScopeRequirement.Required && !commit.scope) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsOENBQXVDO0FBRXZDLHFDQUFnRjtBQUNoRixtQ0FBbUQ7QUFlbkQsMkRBQTJEO0FBQzNELE1BQU0sdUJBQXVCLEdBQUcsaUJBQWlCLENBQUM7QUFFbEQ7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLGlDQUFpQyxHQUNyQyw2REFBNkQsQ0FBQztBQUVoRTs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sNkJBQTZCLEdBQUcsdURBQXVELENBQUM7QUFFOUYsdUVBQXVFO0FBQ3ZFLFNBQWdCLHFCQUFxQixDQUNuQyxTQUEwQixFQUMxQixVQUF3QyxFQUFFO0lBRTFDLE1BQU0sTUFBTSxHQUFHLCtCQUFzQixFQUFFLENBQUMsYUFBYSxDQUFDO0lBQ3RELE1BQU0sTUFBTSxHQUFHLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsMEJBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN6RixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFFNUIsK0RBQStEO0lBQy9ELFNBQVMsOEJBQThCO1FBQ3JDLG9DQUFvQztRQUNwQyxvQ0FBb0M7UUFDcEMsb0NBQW9DO1FBRXBDLDJDQUEyQztRQUMzQyxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUU7WUFDbkIsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELG9GQUFvRjtRQUNwRixtRkFBbUY7UUFDbkYsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ25CLElBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtnQkFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO2dCQUMzRSxPQUFPLEtBQUssQ0FBQzthQUNkO1lBQ0QsT0FBTyxJQUFJ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NkIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQ3ZELE1BQU0sQ0FBQyxJQUFJLENBQUMsK0RBQStELENBQUMsQ0FBQztZQUM3RSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTyxFQUFDLEtBQUssRUFBRSw4QkFBOEIsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUMsQ0FBQztBQUNuRSxDQUFDO0FBckpELHNEQXFKQztBQUVELGtGQUFrRjtBQUNsRixTQUFnQixxQkFBcUIsQ0FBQyxNQUFnQixFQUFFLEtBQUssR0FBRyxlQUFLO0lBQ25FLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3RDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNqQixLQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQy9DLEtBQUssQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQ3BDLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hCLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxDQUFDLDRDQUE0QyxDQUFDLENBQUM7SUFDcEQsS0FBSyxFQUFFLENBQUM7SUFDUixLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUN2QyxLQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUssRUFBRSxDQUFDO0FBQ1YsQ0FBQztBQWZELHNEQWVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZywgU2NvcGVSZXF1aXJlbWVudH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtDb21taXQsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuLyoqIFRoZSByZXN1bHQgb2YgYSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIGNoZWNrLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICB2YWxpZDogYm9vbGVhbjtcbiAgZXJyb3JzOiBzdHJpbmdbXTtcbiAgY29tbWl0OiBDb21taXQ7XG59XG5cbi8qKiBSZWdleCBtYXRjaGluZyBhIFVSTCBmb3IgYW4gZW50aXJlIGNvbW1pdCBib2R5IGxpbmUuICovXG5jb25zdCBDT01NSVRfQk9EWV9VUkxfTElORV9SRSA9IC9eaHR0cHM/OlxcL1xcLy4qJC87XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIG1hdGNoaW5nIHBvdGVudGlhbCBtaXN1c2Ugb2YgdGhlIGBCUkVBS0lORyBDSEFOR0U6YCBtYXJrZXIgaW4gYVxuICogY29tbWl0IG1lc3NhZ2UuIENvbW1pdCBtZXNzYWdlcyBjb250YWluaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIHNuaXBwZXRzIHdpbGwgZmFpbDpcbiAqXG4gKiAgIC0gYEJSRUFLSU5HIENIQU5HRSA8c29tZS1jb250ZW50PmAgfCBIZXJlIHdlIGFzc3VtZSB0aGUgY29sb24gaXMgbWlzc2luZyBieSBhY2NpZGVudC5cbiAqICAgLSBgQlJFQUtJTkctQ0hBTkdFOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKiAgIC0gYEJSRUFLSU5HIENIQU5HRVM6IDxzb21lLWNvbnRlbnQ+YCB8IFRoZSB3cm9uZyBrZXl3b3JkIGlzIHVzZWQgaGVyZS5cbiAqICAgLSBgQlJFQUtJTkctQ0hBTkdFUzogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICovXG5jb25zdCBJTkNPUlJFQ1RfQlJFQUtJTkdfQ0hBTkdFX0JPRFlfUkUgPVxuICAvXihCUkVBS0lORyBDSEFOR0VbXjpdfEJSRUFLSU5HLUNIQU5HRXxCUkVBS0lOR1sgLV1DSEFOR0VTKS9tO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBtYXRjaGluZyBwb3RlbnRpYWwgbWlzdXNlIG9mIHRoZSBgREVQUkVDQVRFRDpgIG1hcmtlciBpbiBhIGNvbW1pdFxuICogbWVzc2FnZS4gQ29tbWl0IG1lc3NhZ2VzIGNvbnRhaW5pbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgc25pcHBldHMgd2lsbCBmYWlsOlxuICpcbiAqICAgLSBgREVQUkVDQVRFRCA8c29tZS1jb250ZW50PmAgfCBIZXJlIHdlIGFzc3VtZSB0aGUgY29sb24gaXMgbWlzc2luZyBieSBhY2NpZGVudC5cbiAqICAgLSBgREVQUkVDQVRJT05TOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKiAgIC0gYERFUFJFQ0FURTogPHNvbWUtY29udGVudD5gIHwgVGhlIHdyb25nIGtleXdvcmQgaXMgdXNlZCBoZXJlLlxuICogICAtIGBERVBSRUNBVEVTOiA8c29tZS1jb250ZW50PmAgfCBUaGUgd3Jvbmcga2V5d29yZCBpcyB1c2VkIGhlcmUuXG4gKi9cbmNvbnN0IElOQ09SUkVDVF9ERVBSRUNBVElPTl9CT0RZX1JFID0gL14oREVQUkVDQVRFRFteOl18REVQUkVDQVRJT05TfERFUFJFQ0FURTp8REVQUkVDQVRFUykvbTtcblxuLyoqIFZhbGlkYXRlIGEgY29tbWl0IG1lc3NhZ2UgYWdhaW5zdCB1c2luZyB0aGUgbG9jYWwgcmVwbydzIGNvbmZpZy4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoXG4gIGNvbW1pdE1zZzogc3RyaW5nIHwgQ29tbWl0LFxuICBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30sXG4pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gdHlwZW9mIGNvbW1pdE1zZyA9PT0gJ3N0cmluZycgPyBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKSA6IGNvbW1pdE1zZztcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBQZXJmb3JtIHRoZSB2YWxpZGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHRoZSBwYXJzZWQgY29tbWl0LiAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSB7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gICAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gICAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgICBlcnJvcnMucHVzaCgnVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gICAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAgIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAgIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAgIC8vIGNoZWNrLlxuICAgIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAnVW5hYmxlIHRvIGZpbmQgbWF0Y2ggZm9yIGZpeHVwIGNvbW1pdCBhbW9uZyBwcmlvciBjb21taXRzOiAnICtcbiAgICAgICAgICAgIChvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5tYXAoKHgpID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGhlYWRlciAvL1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICBpZiAoY29tbWl0LmhlYWRlci5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBoZWFkZXIgaXMgbG9uZ2VyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVyc2ApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmICghY29tbWl0LnR5cGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGRvZXMgbm90IG1hdGNoIHRoZSBleHBlY3RlZCBmb3JtYXQuYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke09iamVjdC5rZXlzKENPTU1JVF9UWVBFUykuam9pbihcbiAgICAgICAgICAnLCAnLFxuICAgICAgICApfWAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8qKiBUaGUgc2NvcGUgcmVxdWlyZW1lbnQgbGV2ZWwgZm9yIHRoZSBwcm92aWRlZCB0eXBlIG9mIHRoZSBjb21taXQgbWVzc2FnZS4gKi9cbiAgICBjb25zdCBzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9IENPTU1JVF9UWVBFU1tjb21taXQudHlwZV0uc2NvcGU7XG5cbiAgICBpZiAoc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPT09IFNjb3BlUmVxdWlyZW1lbnQuRm9yYmlkZGVuICYmIGNvbW1pdC5zY29wZSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBTY29wZXMgYXJlIGZvcmJpZGRlbiBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IGEgc2NvcGUgb2YgJyR7Y29tbWl0LnNjb3BlfScgd2FzIHByb3ZpZGVkLmAsXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCAmJiAhY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgYFNjb3BlcyBhcmUgcmVxdWlyZWQgZm9yIGNvbW1pdHMgd2l0aCB0eXBlICcke2NvbW1pdC50eXBlfScsIGJ1dCBubyBzY29wZSB3YXMgcHJvdmlkZWQuYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgZnVsbFNjb3BlID0gY29tbWl0Lm5wbVNjb3BlID8gYCR7Y29tbWl0Lm5wbVNjb3BlfS8ke2NvbW1pdC5zY29wZX1gIDogY29tbWl0LnNjb3BlO1xuICAgIGlmIChmdWxsU2NvcGUgJiYgIWNvbmZpZy5zY29wZXMuaW5jbHVkZXMoZnVsbFNjb3BlKSkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGAnJHtmdWxsU2NvcGV9JyBpcyBub3QgYW4gYWxsb3dlZCBzY29wZS5cXG4gPT4gU0NPUEVTOiAke2NvbmZpZy5zY29wZXMuam9pbignLCAnKX1gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDb21taXRzIHdpdGggdGhlIHR5cGUgb2YgYHJlbGVhc2VgIGRvIG5vdCByZXF1aXJlIGEgY29tbWl0IGJvZHkuXG4gICAgaWYgKGNvbW1pdC50eXBlID09PSAncmVsZWFzZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgY29tbWl0IGJvZHkgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgLy8gRHVlIHRvIGFuIGlzc3VlIGluIHdoaWNoIGNvbnZlbnRpb25hbC1jb21taXRzLXBhcnNlciBjb25zaWRlcnMgYWxsIHBhcnRzIG9mIGEgY29tbWl0IGFmdGVyXG4gICAgLy8gYSBgI2AgcmVmZXJlbmNlIHRvIGJlIHRoZSBmb290ZXIsIHdlIGNoZWNrIHRoZSBsZW5ndGggb2YgYWxsIG9mIHRoZSBjb21taXQgY29udGVudCBhZnRlciB0aGVcbiAgICAvLyBoZWFkZXIuIEluIHRoZSBmdXR1cmUsIHdlIGV4cGVjdCB0byBiZSBhYmxlIHRvIGNoZWNrIG9ubHkgdGhlIGJvZHkgb25jZSB0aGUgcGFyc2VyIHByb3Blcmx5XG4gICAgLy8gaGFuZGxlcyB0aGlzIGNhc2UuXG4gICAgY29uc3QgYWxsTm9uSGVhZGVyQ29udGVudCA9IGAke2NvbW1pdC5ib2R5LnRyaW0oKX1cXG4ke2NvbW1pdC5mb290ZXIudHJpbSgpfWA7XG5cbiAgICBpZiAoXG4gICAgICAhY29uZmlnLm1pbkJvZHlMZW5ndGhUeXBlRXhjbHVkZXM/LmluY2x1ZGVzKGNvbW1pdC50eXBlKSAmJlxuICAgICAgYWxsTm9uSGVhZGVyQ29udGVudC5sZW5ndGggPCBjb25maWcubWluQm9keUxlbmd0aFxuICAgICkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke2NvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCxcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZSgobGluZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBleGNlZWRzIHRoZSBtYXggbGluZSBsZW5ndGggbGltaXQuIFRoZSBsaW1pdCBpcyBpZ25vcmVkIGZvclxuICAgICAgLy8gbGluZXMgdGhhdCBqdXN0IGNvbnRhaW4gYW4gVVJMIChhcyB0aGVzZSB1c3VhbGx5IGNhbm5vdCBiZSB3cmFwcGVkIG9yIHNob3J0ZW5lZCkuXG4gICAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgICB9KTtcblxuICAgIGlmIChsaW5lRXhjZWVkc01heExlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goXG4gICAgICAgIGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBjb250YWlucyBsaW5lcyBncmVhdGVyIHRoYW4gJHtjb25maWcubWF4TGluZUxlbmd0aH0gY2hhcmFjdGVycy5gLFxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBCcmVha2luZyBjaGFuZ2VcbiAgICAvLyBDaGVjayBpZiB0aGUgY29tbWl0IG1lc3NhZ2UgY29udGFpbnMgYSB2YWxpZCBicmVhayBjaGFuZ2UgZGVzY3JpcHRpb24uXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci9ibG9iLzg4ZmJjMDY2Nzc1YWIxYTJmNmE4Yzc1ZjkzMzM3NWI0NmQ4ZmE5YTQvQ09OVFJJQlVUSU5HLm1kI2NvbW1pdC1tZXNzYWdlLWZvb3RlclxuICAgIGlmIChJTkNPUlJFQ1RfQlJFQUtJTkdfQ0hBTkdFX0JPRFlfUkUudGVzdChjb21taXQuZnVsbFRleHQpKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgYW4gaW52YWxpZCBicmVha2luZyBjaGFuZ2Ugbm90ZS5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoSU5DT1JSRUNUX0RFUFJFQ0FUSU9OX0JPRFlfUkUudGVzdChjb21taXQuZnVsbFRleHQpKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGJvZHkgY29udGFpbnMgYW4gaW52YWxpZCBkZXByZWNhdGlvbiBub3RlLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHt2YWxpZDogdmFsaWRhdGVDb21taXRBbmRDb2xsZWN0RXJyb3JzKCksIGVycm9ycywgY29tbWl0fTtcbn1cblxuLyoqIFByaW50IHRoZSBlcnJvciBtZXNzYWdlcyBmcm9tIHRoZSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIHRvIHRoZSBjb25zb2xlLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByaW50VmFsaWRhdGlvbkVycm9ycyhlcnJvcnM6IHN0cmluZ1tdLCBwcmludCA9IGVycm9yKSB7XG4gIHByaW50Lmdyb3VwKGBFcnJvciR7ZXJyb3JzLmxlbmd0aCA9PT0gMSA/ICcnIDogJ3MnfTpgKTtcbiAgZXJyb3JzLmZvckVhY2goKGxpbmUpID0+IHByaW50KGxpbmUpKTtcbiAgcHJpbnQuZ3JvdXBFbmQoKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJ1RoZSBleHBlY3RlZCBmb3JtYXQgZm9yIGEgY29tbWl0IGlzOiAnKTtcbiAgcHJpbnQoJzx0eXBlPig8c2NvcGU+KTogPHN1bW1hcnk+Jyk7XG4gIHByaW50KCk7XG4gIHByaW50KCc8Ym9keT4nKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoYEJSRUFLSU5HIENIQU5HRTogPGJyZWFraW5nIGNoYW5nZSBzdW1tYXJ5PmApO1xuICBwcmludCgpO1xuICBwcmludChgPGJyZWFraW5nIGNoYW5nZSBkZXNjcmlwdGlvbj5gKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoKTtcbn1cbiJdfQ==