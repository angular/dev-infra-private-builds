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
 * Regex matching a breaking change.
 *
 * - Starts with BREAKING CHANGE
 * - Followed by a colon
 * - Followed by a single space or two consecutive new lines
 *
 * NB: Anything after `BREAKING CHANGE` is optional to facilitate the validation.
 */
const COMMIT_BODY_BREAKING_CHANGE_RE = /^BREAKING CHANGE(:( |\n{2}))?/m;
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
        const hasBreakingChange = COMMIT_BODY_BREAKING_CHANGE_RE.exec(commit.fullText);
        if (hasBreakingChange !== null) {
            const [, breakingChangeDescription] = hasBreakingChange;
            if (!breakingChangeDescription) {
                // Not followed by :, space or two consecutive new lines,
                errors.push(`The commit message body contains an invalid breaking change description.`);
                return false;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvdmFsaWRhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRXZDLE9BQU8sRUFBQyxZQUFZLEVBQUUsc0JBQXNCLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDaEYsT0FBTyxFQUFTLGtCQUFrQixFQUFDLE1BQU0sU0FBUyxDQUFDO0FBZW5ELDJEQUEyRDtBQUMzRCxNQUFNLHVCQUF1QixHQUFHLGlCQUFpQixDQUFDO0FBQ2xEOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxnQ0FBZ0MsQ0FBQztBQUV4RSx1RUFBdUU7QUFDdkUsTUFBTSxVQUFVLHFCQUFxQixDQUNqQyxTQUF3QixFQUN4QixVQUF3QyxFQUFFO0lBQzVDLE1BQU0sTUFBTSxHQUFHLHNCQUFzQixFQUFFLENBQUMsYUFBYSxDQUFDO0lBQ3RELE1BQU0sTUFBTSxHQUFHLE9BQU8sU0FBUyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztJQUN6RixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFFNUIsK0RBQStEO0lBQy9ELFNBQVMsOEJBQThCO1FBQ3JDLG9DQUFvQztRQUNwQyxvQ0FBb0M7UUFDcEMsb0NBQW9DOztRQUVwQywyQ0FBMkM7UUFDM0MsSUFBSSxNQUFNLENBQUMsUUFBUSxFQUFFO1lBQ25CLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxvRkFBb0Y7UUFDcEYsbUZBQW1GO1FBQ25GLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRTtZQUNuQixJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7Z0JBQzFCLE1BQU0sQ0FBQyxJQUFJLENBQUMsNkRBQTZELENBQUMsQ0FBQztnQkFDM0UsT0FBTyxLQUFLLENBQUM7YUFDZDtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCwwRkFBMEY7UUFDMUYsOEZBQThGO1FBQzlGLDBGQUEwRjtRQUMxRixnR0FBZ0c7UUFDaEcsU0FBUztRQUNULElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtZQUNsQixJQUFJLE9BQU8sQ0FBQyxxQkFBcUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUMzRixNQUFNLENBQUMsSUFBSSxDQUNQLDZEQUE2RDtvQkFDN0QsQ0FBQyxPQUFPLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5RSxPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELDRCQUE0QjtRQUM1Qiw0QkFBNEI7UUFDNUIsNEJBQTRCO1FBQzVCLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLGFBQWEsRUFBRTtZQUMvQyxNQUFNLENBQUMsSUFBSSxDQUFDLDRDQUE0QyxNQUFNLENBQUMsYUFBYSxhQUFhLENBQUMsQ0FBQztZQUMzRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssU0FBUyxFQUFFO1lBQzNDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSx5Q0FDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVDLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCwrRUFBK0U7UUFDL0UsTUFBTSx1QkFBdUIsR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUVoRSxJQUFJLHVCQUF1QixLQUFLLGdCQUFnQixDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFO1lBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsK0NBQStDLE1BQU0sQ0FBQyxJQUFJLHNCQUNsRSxNQUFNLENBQUMsS0FBSyxpQkFBaUIsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxJQUFJLHVCQUF1QixLQUFLLGdCQUFnQixDQUFDLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUU7WUFDMUUsTUFBTSxDQUFDLElBQUksQ0FDUCw4Q0FBOEMsTUFBTSxDQUFDLElBQUksK0JBQStCLENBQUMsQ0FBQztZQUM5RixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUN4RixJQUFJLFNBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ25ELE1BQU0sQ0FBQyxJQUFJLENBQ1AsSUFBSSxTQUFTLDJDQUEyQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDeEYsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELG1FQUFtRTtRQUNuRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO1lBQzdCLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCwwQkFBMEI7UUFDMUIsMEJBQTBCO1FBQzFCLDBCQUEwQjtRQUUxQiw2RkFBNkY7UUFDN0YsK0ZBQStGO1FBQy9GLDhGQUE4RjtRQUM5RixxQkFBcUI7UUFDckIsTUFBTSxtQkFBbUIsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1FBRTdFLElBQUksQ0FBQyxDQUFBLE1BQUEsTUFBTSxDQUFDLHlCQUF5QiwwQ0FBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3hELG1CQUFtQixDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFO1lBQ3JELE1BQU0sQ0FBQyxJQUFJLENBQUMsK0RBQ1IsTUFBTSxDQUFDLGFBQWEsYUFBYSxDQUFDLENBQUM7WUFDdkMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNDLE1BQU0sb0JBQW9CLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQVksRUFBRSxFQUFFO1lBQzVELGdGQUFnRjtZQUNoRixvRkFBb0Y7WUFDcEYsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxhQUFhLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLG9CQUFvQixFQUFFO1lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsdURBQ1IsTUFBTSxDQUFDLGFBQWEsY0FBYyxDQUFDLENBQUM7WUFDeEMsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELGtCQUFrQjtRQUNsQix5RUFBeUU7UUFDekUseUhBQXlIO1FBQ3pILE1BQU0saUJBQWlCLEdBQUcsOEJBQThCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMvRSxJQUFJLGlCQUFpQixLQUFLLElBQUksRUFBRTtZQUM5QixNQUFNLENBQUMsRUFBRSx5QkFBeUIsQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1lBQ3hELElBQUksQ0FBQyx5QkFBeUIsRUFBRTtnQkFDOUIseURBQXlEO2dCQUN6RCxNQUFNLENBQUMsSUFBSSxDQUFDLDBFQUEwRSxDQUFDLENBQUM7Z0JBQ3hGLE9BQU8sS0FBSyxDQUFDO2FBQ2Q7U0FDRjtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE9BQU8sRUFBQyxLQUFLLEVBQUUsOEJBQThCLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFDLENBQUM7QUFDbkUsQ0FBQztBQUdELGtGQUFrRjtBQUNsRixNQUFNLFVBQVUscUJBQXFCLENBQUMsTUFBZ0IsRUFBRSxLQUFLLEdBQUcsS0FBSztJQUNuRSxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUN2RCxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDcEMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ2pCLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxDQUFDLHVDQUF1QyxDQUFDLENBQUM7SUFDL0MsS0FBSyxDQUFDLDRCQUE0QixDQUFDLENBQUM7SUFDcEMsS0FBSyxFQUFFLENBQUM7SUFDUixLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEIsS0FBSyxFQUFFLENBQUM7SUFDUixLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUNwRCxLQUFLLEVBQUUsQ0FBQztJQUNSLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ3ZDLEtBQUssRUFBRSxDQUFDO0lBQ1IsS0FBSyxFQUFFLENBQUM7QUFDVixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge0NPTU1JVF9UWVBFUywgZ2V0Q29tbWl0TWVzc2FnZUNvbmZpZywgU2NvcGVSZXF1aXJlbWVudH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtDb21taXQsIHBhcnNlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi9wYXJzZSc7XG5cbi8qKiBPcHRpb25zIGZvciBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zIHtcbiAgZGlzYWxsb3dTcXVhc2g/OiBib29sZWFuO1xuICBub25GaXh1cENvbW1pdEhlYWRlcnM/OiBzdHJpbmdbXTtcbn1cblxuLyoqIFRoZSByZXN1bHQgb2YgYSBjb21taXQgbWVzc2FnZSB2YWxpZGF0aW9uIGNoZWNrLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICB2YWxpZDogYm9vbGVhbjtcbiAgZXJyb3JzOiBzdHJpbmdbXTtcbiAgY29tbWl0OiBDb21taXQ7XG59XG5cbi8qKiBSZWdleCBtYXRjaGluZyBhIFVSTCBmb3IgYW4gZW50aXJlIGNvbW1pdCBib2R5IGxpbmUuICovXG5jb25zdCBDT01NSVRfQk9EWV9VUkxfTElORV9SRSA9IC9eaHR0cHM/OlxcL1xcLy4qJC87XG4vKipcbiAqIFJlZ2V4IG1hdGNoaW5nIGEgYnJlYWtpbmcgY2hhbmdlLlxuICpcbiAqIC0gU3RhcnRzIHdpdGggQlJFQUtJTkcgQ0hBTkdFXG4gKiAtIEZvbGxvd2VkIGJ5IGEgY29sb25cbiAqIC0gRm9sbG93ZWQgYnkgYSBzaW5nbGUgc3BhY2Ugb3IgdHdvIGNvbnNlY3V0aXZlIG5ldyBsaW5lc1xuICpcbiAqIE5COiBBbnl0aGluZyBhZnRlciBgQlJFQUtJTkcgQ0hBTkdFYCBpcyBvcHRpb25hbCB0byBmYWNpbGl0YXRlIHRoZSB2YWxpZGF0aW9uLlxuICovXG5jb25zdCBDT01NSVRfQk9EWV9CUkVBS0lOR19DSEFOR0VfUkUgPSAvXkJSRUFLSU5HIENIQU5HRSg6KCB8XFxuezJ9KSk/L207XG5cbi8qKiBWYWxpZGF0ZSBhIGNvbW1pdCBtZXNzYWdlIGFnYWluc3QgdXNpbmcgdGhlIGxvY2FsIHJlcG8ncyBjb25maWcuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVDb21taXRNZXNzYWdlKFxuICAgIGNvbW1pdE1zZzogc3RyaW5nfENvbW1pdCxcbiAgICBvcHRpb25zOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VPcHRpb25zID0ge30pOiBWYWxpZGF0ZUNvbW1pdE1lc3NhZ2VSZXN1bHQge1xuICBjb25zdCBjb25maWcgPSBnZXRDb21taXRNZXNzYWdlQ29uZmlnKCkuY29tbWl0TWVzc2FnZTtcbiAgY29uc3QgY29tbWl0ID0gdHlwZW9mIGNvbW1pdE1zZyA9PT0gJ3N0cmluZycgPyBwYXJzZUNvbW1pdE1lc3NhZ2UoY29tbWl0TXNnKSA6IGNvbW1pdE1zZztcbiAgY29uc3QgZXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIC8qKiBQZXJmb3JtIHRoZSB2YWxpZGF0aW9uIGNoZWNrcyBhZ2FpbnN0IHRoZSBwYXJzZWQgY29tbWl0LiAqL1xuICBmdW5jdGlvbiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSB7XG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gQ2hlY2tpbmcgcmV2ZXJ0LCBzcXVhc2gsIGZpeHVwIC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvLyBBbGwgcmV2ZXJ0IGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQuXG4gICAgaWYgKGNvbW1pdC5pc1JldmVydCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gQWxsIHNxdWFzaGVzIGFyZSBjb25zaWRlcmVkIHZhbGlkLCBhcyB0aGUgY29tbWl0IHdpbGwgYmUgc3F1YXNoZWQgaW50byBhbm90aGVyIGluXG4gICAgLy8gdGhlIGdpdCBoaXN0b3J5IGFueXdheSwgdW5sZXNzIHRoZSBvcHRpb25zIHByb3ZpZGVkIHRvIG5vdCBhbGxvdyBzcXVhc2ggY29tbWl0cy5cbiAgICBpZiAoY29tbWl0LmlzU3F1YXNoKSB7XG4gICAgICBpZiAob3B0aW9ucy5kaXNhbGxvd1NxdWFzaCkge1xuICAgICAgICBlcnJvcnMucHVzaCgnVGhlIGNvbW1pdCBtdXN0IGJlIG1hbnVhbGx5IHNxdWFzaGVkIGludG8gdGhlIHRhcmdldCBjb21taXQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRml4dXBzIGNvbW1pdHMgYXJlIGNvbnNpZGVyZWQgdmFsaWQsIHVubGVzcyBub25GaXh1cENvbW1pdEhlYWRlcnMgYXJlIHByb3ZpZGVkIHRvIGNoZWNrXG4gICAgLy8gYWdhaW5zdC4gSWYgYG5vbkZpeHVwQ29tbWl0SGVhZGVyc2AgaXMgbm90IGVtcHR5LCB3ZSBjaGVjayB3aGV0aGVyIHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZ1xuICAgIC8vIG5vbi1maXh1cCBjb21taXQgKGkuZS4gYSBjb21taXQgd2hvc2UgaGVhZGVyIGlzIGlkZW50aWNhbCB0byB0aGlzIGNvbW1pdCdzIGhlYWRlciBhZnRlclxuICAgIC8vIHN0cmlwcGluZyB0aGUgYGZpeHVwISBgIHByZWZpeCksIG90aGVyd2lzZSB3ZSBhc3N1bWUgdGhpcyB2ZXJpZmljYXRpb24gd2lsbCBoYXBwZW4gaW4gYW5vdGhlclxuICAgIC8vIGNoZWNrLlxuICAgIGlmIChjb21taXQuaXNGaXh1cCkge1xuICAgICAgaWYgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzICYmICFvcHRpb25zLm5vbkZpeHVwQ29tbWl0SGVhZGVycy5pbmNsdWRlcyhjb21taXQuaGVhZGVyKSkge1xuICAgICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICAgICdVbmFibGUgdG8gZmluZCBtYXRjaCBmb3IgZml4dXAgY29tbWl0IGFtb25nIHByaW9yIGNvbW1pdHM6ICcgK1xuICAgICAgICAgICAgKG9wdGlvbnMubm9uRml4dXBDb21taXRIZWFkZXJzLm1hcCh4ID0+IGBcXG4gICAgICAke3h9YCkuam9pbignJykgfHwgJy0nKSk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBoZWFkZXIgLy9cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgaWYgKGNvbW1pdC5oZWFkZXIubGVuZ3RoID4gY29uZmlnLm1heExpbmVMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgaGVhZGVyIGlzIGxvbmdlciB0aGFuICR7Y29uZmlnLm1heExpbmVMZW5ndGh9IGNoYXJhY3RlcnNgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoIWNvbW1pdC50eXBlKSB7XG4gICAgICBlcnJvcnMucHVzaChgVGhlIGNvbW1pdCBtZXNzYWdlIGhlYWRlciBkb2VzIG5vdCBtYXRjaCB0aGUgZXhwZWN0ZWQgZm9ybWF0LmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9ycy5wdXNoKGAnJHtjb21taXQudHlwZX0nIGlzIG5vdCBhbiBhbGxvd2VkIHR5cGUuXFxuID0+IFRZUEVTOiAke1xuICAgICAgICAgIE9iamVjdC5rZXlzKENPTU1JVF9UWVBFUykuam9pbignLCAnKX1gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKiogVGhlIHNjb3BlIHJlcXVpcmVtZW50IGxldmVsIGZvciB0aGUgcHJvdmlkZWQgdHlwZSBvZiB0aGUgY29tbWl0IG1lc3NhZ2UuICovXG4gICAgY29uc3Qgc2NvcGVSZXF1aXJlbWVudEZvclR5cGUgPSBDT01NSVRfVFlQRVNbY29tbWl0LnR5cGVdLnNjb3BlO1xuXG4gICAgaWYgKHNjb3BlUmVxdWlyZW1lbnRGb3JUeXBlID09PSBTY29wZVJlcXVpcmVtZW50LkZvcmJpZGRlbiAmJiBjb21taXQuc2NvcGUpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBTY29wZXMgYXJlIGZvcmJpZGRlbiBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IGEgc2NvcGUgb2YgJyR7XG4gICAgICAgICAgY29tbWl0LnNjb3BlfScgd2FzIHByb3ZpZGVkLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzY29wZVJlcXVpcmVtZW50Rm9yVHlwZSA9PT0gU2NvcGVSZXF1aXJlbWVudC5SZXF1aXJlZCAmJiAhY29tbWl0LnNjb3BlKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgU2NvcGVzIGFyZSByZXF1aXJlZCBmb3IgY29tbWl0cyB3aXRoIHR5cGUgJyR7Y29tbWl0LnR5cGV9JywgYnV0IG5vIHNjb3BlIHdhcyBwcm92aWRlZC5gKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBmdWxsU2NvcGUgPSBjb21taXQubnBtU2NvcGUgPyBgJHtjb21taXQubnBtU2NvcGV9LyR7Y29tbWl0LnNjb3BlfWAgOiBjb21taXQuc2NvcGU7XG4gICAgaWYgKGZ1bGxTY29wZSAmJiAhY29uZmlnLnNjb3Blcy5pbmNsdWRlcyhmdWxsU2NvcGUpKSB7XG4gICAgICBlcnJvcnMucHVzaChcbiAgICAgICAgICBgJyR7ZnVsbFNjb3BlfScgaXMgbm90IGFuIGFsbG93ZWQgc2NvcGUuXFxuID0+IFNDT1BFUzogJHtjb25maWcuc2NvcGVzLmpvaW4oJywgJyl9YCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gQ29tbWl0cyB3aXRoIHRoZSB0eXBlIG9mIGByZWxlYXNlYCBkbyBub3QgcmVxdWlyZSBhIGNvbW1pdCBib2R5LlxuICAgIGlmIChjb21taXQudHlwZSA9PT0gJ3JlbGVhc2UnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIENoZWNraW5nIGNvbW1pdCBib2R5IC8vXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8vIER1ZSB0byBhbiBpc3N1ZSBpbiB3aGljaCBjb252ZW50aW9uYWwtY29tbWl0cy1wYXJzZXIgY29uc2lkZXJzIGFsbCBwYXJ0cyBvZiBhIGNvbW1pdCBhZnRlclxuICAgIC8vIGEgYCNgIHJlZmVyZW5jZSB0byBiZSB0aGUgZm9vdGVyLCB3ZSBjaGVjayB0aGUgbGVuZ3RoIG9mIGFsbCBvZiB0aGUgY29tbWl0IGNvbnRlbnQgYWZ0ZXIgdGhlXG4gICAgLy8gaGVhZGVyLiBJbiB0aGUgZnV0dXJlLCB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBjaGVjayBvbmx5IHRoZSBib2R5IG9uY2UgdGhlIHBhcnNlciBwcm9wZXJseVxuICAgIC8vIGhhbmRsZXMgdGhpcyBjYXNlLlxuICAgIGNvbnN0IGFsbE5vbkhlYWRlckNvbnRlbnQgPSBgJHtjb21taXQuYm9keS50cmltKCl9XFxuJHtjb21taXQuZm9vdGVyLnRyaW0oKX1gO1xuXG4gICAgaWYgKCFjb25maWcubWluQm9keUxlbmd0aFR5cGVFeGNsdWRlcz8uaW5jbHVkZXMoY29tbWl0LnR5cGUpICYmXG4gICAgICAgIGFsbE5vbkhlYWRlckNvbnRlbnQubGVuZ3RoIDwgY29uZmlnLm1pbkJvZHlMZW5ndGgpIHtcbiAgICAgIGVycm9ycy5wdXNoKGBUaGUgY29tbWl0IG1lc3NhZ2UgYm9keSBkb2VzIG5vdCBtZWV0IHRoZSBtaW5pbXVtIGxlbmd0aCBvZiAke1xuICAgICAgICAgIGNvbmZpZy5taW5Cb2R5TGVuZ3RofSBjaGFyYWN0ZXJzYCk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgYm9keUJ5TGluZSA9IGNvbW1pdC5ib2R5LnNwbGl0KCdcXG4nKTtcbiAgICBjb25zdCBsaW5lRXhjZWVkc01heExlbmd0aCA9IGJvZHlCeUxpbmUuc29tZSgobGluZTogc3RyaW5nKSA9PiB7XG4gICAgICAvLyBDaGVjayBpZiBhbnkgbGluZSBleGNlZWRzIHRoZSBtYXggbGluZSBsZW5ndGggbGltaXQuIFRoZSBsaW1pdCBpcyBpZ25vcmVkIGZvclxuICAgICAgLy8gbGluZXMgdGhhdCBqdXN0IGNvbnRhaW4gYW4gVVJMIChhcyB0aGVzZSB1c3VhbGx5IGNhbm5vdCBiZSB3cmFwcGVkIG9yIHNob3J0ZW5lZCkuXG4gICAgICByZXR1cm4gbGluZS5sZW5ndGggPiBjb25maWcubWF4TGluZUxlbmd0aCAmJiAhQ09NTUlUX0JPRFlfVVJMX0xJTkVfUkUudGVzdChsaW5lKTtcbiAgICB9KTtcblxuICAgIGlmIChsaW5lRXhjZWVkc01heExlbmd0aCkge1xuICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGxpbmVzIGdyZWF0ZXIgdGhhbiAke1xuICAgICAgICAgIGNvbmZpZy5tYXhMaW5lTGVuZ3RofSBjaGFyYWN0ZXJzLmApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIEJyZWFraW5nIGNoYW5nZVxuICAgIC8vIENoZWNrIGlmIHRoZSBjb21taXQgbWVzc2FnZSBjb250YWlucyBhIHZhbGlkIGJyZWFrIGNoYW5nZSBkZXNjcmlwdGlvbi5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyL2Jsb2IvODhmYmMwNjY3NzVhYjFhMmY2YThjNzVmOTMzMzc1YjQ2ZDhmYTlhNC9DT05UUklCVVRJTkcubWQjY29tbWl0LW1lc3NhZ2UtZm9vdGVyXG4gICAgY29uc3QgaGFzQnJlYWtpbmdDaGFuZ2UgPSBDT01NSVRfQk9EWV9CUkVBS0lOR19DSEFOR0VfUkUuZXhlYyhjb21taXQuZnVsbFRleHQpO1xuICAgIGlmIChoYXNCcmVha2luZ0NoYW5nZSAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgWywgYnJlYWtpbmdDaGFuZ2VEZXNjcmlwdGlvbl0gPSBoYXNCcmVha2luZ0NoYW5nZTtcbiAgICAgIGlmICghYnJlYWtpbmdDaGFuZ2VEZXNjcmlwdGlvbikge1xuICAgICAgICAvLyBOb3QgZm9sbG93ZWQgYnkgOiwgc3BhY2Ugb3IgdHdvIGNvbnNlY3V0aXZlIG5ldyBsaW5lcyxcbiAgICAgICAgZXJyb3JzLnB1c2goYFRoZSBjb21taXQgbWVzc2FnZSBib2R5IGNvbnRhaW5zIGFuIGludmFsaWQgYnJlYWtpbmcgY2hhbmdlIGRlc2NyaXB0aW9uLmApO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4ge3ZhbGlkOiB2YWxpZGF0ZUNvbW1pdEFuZENvbGxlY3RFcnJvcnMoKSwgZXJyb3JzLCBjb21taXR9O1xufVxuXG5cbi8qKiBQcmludCB0aGUgZXJyb3IgbWVzc2FnZXMgZnJvbSB0aGUgY29tbWl0IG1lc3NhZ2UgdmFsaWRhdGlvbiB0byB0aGUgY29uc29sZS4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcmludFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzOiBzdHJpbmdbXSwgcHJpbnQgPSBlcnJvcikge1xuICBwcmludC5ncm91cChgRXJyb3Ike2Vycm9ycy5sZW5ndGggPT09IDEgPyAnJyA6ICdzJ306YCk7XG4gIGVycm9ycy5mb3JFYWNoKGxpbmUgPT4gcHJpbnQobGluZSkpO1xuICBwcmludC5ncm91cEVuZCgpO1xuICBwcmludCgpO1xuICBwcmludCgnVGhlIGV4cGVjdGVkIGZvcm1hdCBmb3IgYSBjb21taXQgaXM6ICcpO1xuICBwcmludCgnPHR5cGU+KDxzY29wZT4pOiA8c3VtbWFyeT4nKTtcbiAgcHJpbnQoKTtcbiAgcHJpbnQoJzxib2R5PicpO1xuICBwcmludCgpO1xuICBwcmludChgQlJFQUtJTkcgQ0hBTkdFOiA8YnJlYWtpbmcgY2hhbmdlIHN1bW1hcnk+YCk7XG4gIHByaW50KCk7XG4gIHByaW50KGA8YnJlYWtpbmcgY2hhbmdlIGRlc2NyaXB0aW9uPmApO1xuICBwcmludCgpO1xuICBwcmludCgpO1xufVxuIl19