(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-file/validate-file", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
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
    var fs_1 = require("fs");
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var commit_message_draft_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    /** Validate commit message at the provided file path. */
    function validateFile(filePath, isErrorMode) {
        var git = git_client_1.GitClient.get();
        var commitMessage = fs_1.readFileSync(path_1.resolve(git.baseDir, filePath), 'utf8');
        var _a = validate_1.validateCommitMessage(commitMessage), valid = _a.valid, errors = _a.errors;
        if (valid) {
            console_1.info(console_1.green('√') + "  Valid commit message");
            commit_message_draft_1.deleteCommitMessageDraft(filePath);
            process.exitCode = 0;
            return;
        }
        /** Function used to print to the console log. */
        var printFn = isErrorMode ? console_1.error : console_1.log;
        printFn((isErrorMode ? console_1.red('✘') : console_1.yellow('!')) + "  Invalid commit message");
        validate_1.printValidationErrors(errors, printFn);
        if (isErrorMode) {
            printFn(console_1.red('Aborting commit attempt due to invalid commit message.'));
            printFn(console_1.red('Commit message aborted as failure rather than warning due to local configuration.'));
        }
        else {
            printFn(console_1.yellow('Before this commit can be merged into the upstream repository, it must be'));
            printFn(console_1.yellow('amended to follow commit message guidelines.'));
        }
        // On all invalid commit messages, the commit message should be saved as a draft to be
        // restored on the next commit attempt.
        commit_message_draft_1.saveCommitMessageDraft(filePath, commitMessage);
        // Set the correct exit code based on if invalid commit message is an error.
        process.exitCode = isErrorMode ? 1 : 0;
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlL3ZhbGlkYXRlLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDZCQUE2QjtJQUU3QixvRUFBeUU7SUFDekUsOEVBQXFEO0lBRXJELDhIQUFnSDtJQUNoSCwrRUFBeUU7SUFFekUseURBQXlEO0lBQ3pELFNBQWdCLFlBQVksQ0FBQyxRQUFnQixFQUFFLFdBQW9CO1FBQ2pFLElBQU0sR0FBRyxHQUFHLHNCQUFTLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDNUIsSUFBTSxhQUFhLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNyRSxJQUFBLEtBQWtCLGdDQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFyRCxLQUFLLFdBQUEsRUFBRSxNQUFNLFlBQXdDLENBQUM7UUFDN0QsSUFBSSxLQUFLLEVBQUU7WUFDVCxjQUFJLENBQUksZUFBSyxDQUFDLEdBQUcsQ0FBQywyQkFBd0IsQ0FBQyxDQUFDO1lBQzVDLCtDQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDUjtRQUVELGlEQUFpRDtRQUNqRCxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDO1FBRXhDLE9BQU8sQ0FBQyxDQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBMEIsQ0FBQyxDQUFDO1FBQzNFLGdDQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLFdBQVcsRUFBRTtZQUNmLE9BQU8sQ0FBQyxhQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sQ0FDSCxhQUFHLENBQUMsbUZBQW1GLENBQUMsQ0FBQyxDQUFDO1NBQy9GO2FBQU07WUFDTCxPQUFPLENBQUMsZ0JBQU0sQ0FBQywyRUFBMkUsQ0FBQyxDQUFDLENBQUM7WUFDN0YsT0FBTyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsc0ZBQXNGO1FBQ3RGLHVDQUF1QztRQUN2Qyw2Q0FBc0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDaEQsNEVBQTRFO1FBQzVFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBOUJELG9DQThCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7ZXJyb3IsIGdyZWVuLCBpbmZvLCBsb2csIHJlZCwgeWVsbG93fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5cbmltcG9ydCB7ZGVsZXRlQ29tbWl0TWVzc2FnZURyYWZ0LCBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0fSBmcm9tICcuLi9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlL2NvbW1pdC1tZXNzYWdlLWRyYWZ0JztcbmltcG9ydCB7cHJpbnRWYWxpZGF0aW9uRXJyb3JzLCB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4uL3ZhbGlkYXRlJztcblxuLyoqIFZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlIGF0IHRoZSBwcm92aWRlZCBmaWxlIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGlzRXJyb3JNb2RlOiBib29sZWFuKSB7XG4gIGNvbnN0IGdpdCA9IEdpdENsaWVudC5nZXQoKTtcbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGdpdC5iYXNlRGlyLCBmaWxlUGF0aCksICd1dGY4Jyk7XG4gIGNvbnN0IHt2YWxpZCwgZXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKTtcbiAgaWYgKHZhbGlkKSB7XG4gICAgaW5mbyhgJHtncmVlbign4oiaJyl9ICBWYWxpZCBjb21taXQgbWVzc2FnZWApO1xuICAgIGRlbGV0ZUNvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDA7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIEZ1bmN0aW9uIHVzZWQgdG8gcHJpbnQgdG8gdGhlIGNvbnNvbGUgbG9nLiAqL1xuICBsZXQgcHJpbnRGbiA9IGlzRXJyb3JNb2RlID8gZXJyb3IgOiBsb2c7XG5cbiAgcHJpbnRGbihgJHtpc0Vycm9yTW9kZSA/IHJlZCgn4pyYJykgOiB5ZWxsb3coJyEnKX0gIEludmFsaWQgY29tbWl0IG1lc3NhZ2VgKTtcbiAgcHJpbnRWYWxpZGF0aW9uRXJyb3JzKGVycm9ycywgcHJpbnRGbik7XG4gIGlmIChpc0Vycm9yTW9kZSkge1xuICAgIHByaW50Rm4ocmVkKCdBYm9ydGluZyBjb21taXQgYXR0ZW1wdCBkdWUgdG8gaW52YWxpZCBjb21taXQgbWVzc2FnZS4nKSk7XG4gICAgcHJpbnRGbihcbiAgICAgICAgcmVkKCdDb21taXQgbWVzc2FnZSBhYm9ydGVkIGFzIGZhaWx1cmUgcmF0aGVyIHRoYW4gd2FybmluZyBkdWUgdG8gbG9jYWwgY29uZmlndXJhdGlvbi4nKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJpbnRGbih5ZWxsb3coJ0JlZm9yZSB0aGlzIGNvbW1pdCBjYW4gYmUgbWVyZ2VkIGludG8gdGhlIHVwc3RyZWFtIHJlcG9zaXRvcnksIGl0IG11c3QgYmUnKSk7XG4gICAgcHJpbnRGbih5ZWxsb3coJ2FtZW5kZWQgdG8gZm9sbG93IGNvbW1pdCBtZXNzYWdlIGd1aWRlbGluZXMuJykpO1xuICB9XG5cbiAgLy8gT24gYWxsIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzLCB0aGUgY29tbWl0IG1lc3NhZ2Ugc2hvdWxkIGJlIHNhdmVkIGFzIGEgZHJhZnQgdG8gYmVcbiAgLy8gcmVzdG9yZWQgb24gdGhlIG5leHQgY29tbWl0IGF0dGVtcHQuXG4gIHNhdmVDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xuICAvLyBTZXQgdGhlIGNvcnJlY3QgZXhpdCBjb2RlIGJhc2VkIG9uIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2UgaXMgYW4gZXJyb3IuXG4gIHByb2Nlc3MuZXhpdENvZGUgPSBpc0Vycm9yTW9kZSA/IDEgOiAwO1xufVxuIl19