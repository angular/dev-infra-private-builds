"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = void 0;
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs_1 = require("fs");
const path_1 = require("path");
const console_1 = require("../../utils/console");
const git_client_1 = require("../../utils/git/git-client");
const commit_message_draft_1 = require("../restore-commit-message/commit-message-draft");
const validate_1 = require("../validate");
/** Validate commit message at the provided file path. */
function validateFile(filePath, isErrorMode) {
    const git = git_client_1.GitClient.get();
    const commitMessage = (0, fs_1.readFileSync)((0, path_1.resolve)(git.baseDir, filePath), 'utf8');
    const { valid, errors } = (0, validate_1.validateCommitMessage)(commitMessage);
    if (valid) {
        (0, console_1.info)(`${(0, console_1.green)('√')}  Valid commit message`);
        (0, commit_message_draft_1.deleteCommitMessageDraft)(filePath);
        process.exitCode = 0;
        return;
    }
    /** Function used to print to the console log. */
    let printFn = isErrorMode ? console_1.error : console_1.log;
    printFn(`${isErrorMode ? (0, console_1.red)('✘') : (0, console_1.yellow)('!')}  Invalid commit message`);
    (0, validate_1.printValidationErrors)(errors, printFn);
    if (isErrorMode) {
        printFn((0, console_1.red)('Aborting commit attempt due to invalid commit message.'));
        printFn((0, console_1.red)('Commit message aborted as failure rather than warning due to local configuration.'));
    }
    else {
        printFn((0, console_1.yellow)('Before this commit can be merged into the upstream repository, it must be'));
        printFn((0, console_1.yellow)('amended to follow commit message guidelines.'));
    }
    // On all invalid commit messages, the commit message should be saved as a draft to be
    // restored on the next commit attempt.
    (0, commit_message_draft_1.saveCommitMessageDraft)(filePath, commitMessage);
    // Set the correct exit code based on if invalid commit message is an error.
    process.exitCode = isErrorMode ? 1 : 0;
}
exports.validateFile = validateFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlL3ZhbGlkYXRlLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7OztHQU1HO0FBQ0gsMkJBQWdDO0FBQ2hDLCtCQUE2QjtBQUU3QixpREFBeUU7QUFDekUsMkRBQXFEO0FBRXJELHlGQUd3RDtBQUN4RCwwQ0FBeUU7QUFFekUseURBQXlEO0FBQ3pELFNBQWdCLFlBQVksQ0FBQyxRQUFnQixFQUFFLFdBQW9CO0lBQ2pFLE1BQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDNUIsTUFBTSxhQUFhLEdBQUcsSUFBQSxpQkFBWSxFQUFDLElBQUEsY0FBTyxFQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0UsTUFBTSxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsR0FBRyxJQUFBLGdDQUFxQixFQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdELElBQUksS0FBSyxFQUFFO1FBQ1QsSUFBQSxjQUFJLEVBQUMsR0FBRyxJQUFBLGVBQUssRUFBQyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQztRQUM1QyxJQUFBLCtDQUF3QixFQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ3JCLE9BQU87S0FDUjtJQUVELGlEQUFpRDtJQUNqRCxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDO0lBRXhDLE9BQU8sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBQSxhQUFHLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUEsZ0JBQU0sRUFBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztJQUMzRSxJQUFBLGdDQUFxQixFQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN2QyxJQUFJLFdBQVcsRUFBRTtRQUNmLE9BQU8sQ0FBQyxJQUFBLGFBQUcsRUFBQyx3REFBd0QsQ0FBQyxDQUFDLENBQUM7UUFDdkUsT0FBTyxDQUNMLElBQUEsYUFBRyxFQUFDLG1GQUFtRixDQUFDLENBQ3pGLENBQUM7S0FDSDtTQUFNO1FBQ0wsT0FBTyxDQUFDLElBQUEsZ0JBQU0sRUFBQywyRUFBMkUsQ0FBQyxDQUFDLENBQUM7UUFDN0YsT0FBTyxDQUFDLElBQUEsZ0JBQU0sRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDLENBQUM7S0FDakU7SUFFRCxzRkFBc0Y7SUFDdEYsdUNBQXVDO0lBQ3ZDLElBQUEsNkNBQXNCLEVBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ2hELDRFQUE0RTtJQUM1RSxPQUFPLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDekMsQ0FBQztBQS9CRCxvQ0ErQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgbG9nLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdC1jbGllbnQnO1xuXG5pbXBvcnQge1xuICBkZWxldGVDb21taXRNZXNzYWdlRHJhZnQsXG4gIHNhdmVDb21taXRNZXNzYWdlRHJhZnQsXG59IGZyb20gJy4uL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UvY29tbWl0LW1lc3NhZ2UtZHJhZnQnO1xuaW1wb3J0IHtwcmludFZhbGlkYXRpb25FcnJvcnMsIHZhbGlkYXRlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi4vdmFsaWRhdGUnO1xuXG4vKiogVmFsaWRhdGUgY29tbWl0IG1lc3NhZ2UgYXQgdGhlIHByb3ZpZGVkIGZpbGUgcGF0aC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZywgaXNFcnJvck1vZGU6IGJvb2xlYW4pIHtcbiAgY29uc3QgZ2l0ID0gR2l0Q2xpZW50LmdldCgpO1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoZ2l0LmJhc2VEaXIsIGZpbGVQYXRoKSwgJ3V0ZjgnKTtcbiAgY29uc3Qge3ZhbGlkLCBlcnJvcnN9ID0gdmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2UpO1xuICBpZiAodmFsaWQpIHtcbiAgICBpbmZvKGAke2dyZWVuKCfiiJonKX0gIFZhbGlkIGNvbW1pdCBtZXNzYWdlYCk7XG4gICAgZGVsZXRlQ29tbWl0TWVzc2FnZURyYWZ0KGZpbGVQYXRoKTtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMDtcbiAgICByZXR1cm47XG4gIH1cblxuICAvKiogRnVuY3Rpb24gdXNlZCB0byBwcmludCB0byB0aGUgY29uc29sZSBsb2cuICovXG4gIGxldCBwcmludEZuID0gaXNFcnJvck1vZGUgPyBlcnJvciA6IGxvZztcblxuICBwcmludEZuKGAke2lzRXJyb3JNb2RlID8gcmVkKCfinJgnKSA6IHllbGxvdygnIScpfSAgSW52YWxpZCBjb21taXQgbWVzc2FnZWApO1xuICBwcmludFZhbGlkYXRpb25FcnJvcnMoZXJyb3JzLCBwcmludEZuKTtcbiAgaWYgKGlzRXJyb3JNb2RlKSB7XG4gICAgcHJpbnRGbihyZWQoJ0Fib3J0aW5nIGNvbW1pdCBhdHRlbXB0IGR1ZSB0byBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlLicpKTtcbiAgICBwcmludEZuKFxuICAgICAgcmVkKCdDb21taXQgbWVzc2FnZSBhYm9ydGVkIGFzIGZhaWx1cmUgcmF0aGVyIHRoYW4gd2FybmluZyBkdWUgdG8gbG9jYWwgY29uZmlndXJhdGlvbi4nKSxcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIHByaW50Rm4oeWVsbG93KCdCZWZvcmUgdGhpcyBjb21taXQgY2FuIGJlIG1lcmdlZCBpbnRvIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5LCBpdCBtdXN0IGJlJykpO1xuICAgIHByaW50Rm4oeWVsbG93KCdhbWVuZGVkIHRvIGZvbGxvdyBjb21taXQgbWVzc2FnZSBndWlkZWxpbmVzLicpKTtcbiAgfVxuXG4gIC8vIE9uIGFsbCBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcywgdGhlIGNvbW1pdCBtZXNzYWdlIHNob3VsZCBiZSBzYXZlZCBhcyBhIGRyYWZ0IHRvIGJlXG4gIC8vIHJlc3RvcmVkIG9uIHRoZSBuZXh0IGNvbW1pdCBhdHRlbXB0LlxuICBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0KGZpbGVQYXRoLCBjb21taXRNZXNzYWdlKTtcbiAgLy8gU2V0IHRoZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlIGlzIGFuIGVycm9yLlxuICBwcm9jZXNzLmV4aXRDb2RlID0gaXNFcnJvck1vZGUgPyAxIDogMDtcbn1cbiJdfQ==