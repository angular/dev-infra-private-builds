(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-file/validate-file", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/commit-message-draft", "@angular/dev-infra-private/commit-message/validate"], factory);
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
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var commit_message_draft_1 = require("@angular/dev-infra-private/commit-message/commit-message-draft");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    /** Validate commit message at the provided file path. */
    function validateFile(filePath, isErrorMode) {
        var commitMessage = fs_1.readFileSync(path_1.resolve(config_1.getRepoBaseDir(), filePath), 'utf8');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlL3ZhbGlkYXRlLWZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDZCQUE2QjtJQUU3QixrRUFBa0Q7SUFDbEQsb0VBQXlFO0lBRXpFLHVHQUF5RjtJQUN6RiwrRUFBeUU7SUFFekUseURBQXlEO0lBQ3pELFNBQWdCLFlBQVksQ0FBQyxRQUFnQixFQUFFLFdBQW9CO1FBQ2pFLElBQU0sYUFBYSxHQUFHLGlCQUFZLENBQUMsY0FBTyxDQUFDLHVCQUFjLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMxRSxJQUFBLEtBQWtCLGdDQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFyRCxLQUFLLFdBQUEsRUFBRSxNQUFNLFlBQXdDLENBQUM7UUFDN0QsSUFBSSxLQUFLLEVBQUU7WUFDVCxjQUFJLENBQUksZUFBSyxDQUFDLEdBQUcsQ0FBQywyQkFBd0IsQ0FBQyxDQUFDO1lBQzVDLCtDQUF3QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE9BQU87U0FDUjtRQUVELGlEQUFpRDtRQUNqRCxJQUFJLE9BQU8sR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGVBQUssQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDO1FBRXhDLE9BQU8sQ0FBQyxDQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBMEIsQ0FBQyxDQUFDO1FBQzNFLGdDQUFxQixDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN2QyxJQUFJLFdBQVcsRUFBRTtZQUNmLE9BQU8sQ0FBQyxhQUFHLENBQUMsd0RBQXdELENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLE9BQU8sQ0FDSCxhQUFHLENBQUMsbUZBQW1GLENBQUMsQ0FBQyxDQUFDO1NBQy9GO2FBQU07WUFDTCxPQUFPLENBQUMsZ0JBQU0sQ0FBQywyRUFBMkUsQ0FBQyxDQUFDLENBQUM7WUFDN0YsT0FBTyxDQUFDLGdCQUFNLENBQUMsOENBQThDLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBRUQsc0ZBQXNGO1FBQ3RGLHVDQUF1QztRQUN2Qyw2Q0FBc0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDaEQsNEVBQTRFO1FBQzVFLE9BQU8sQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBN0JELG9DQTZCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgbG9nLCByZWQsIHllbGxvd30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7ZGVsZXRlQ29tbWl0TWVzc2FnZURyYWZ0LCBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0fSBmcm9tICcuLi9jb21taXQtbWVzc2FnZS1kcmFmdCc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuLi92YWxpZGF0ZSc7XG5cbi8qKiBWYWxpZGF0ZSBjb21taXQgbWVzc2FnZSBhdCB0aGUgcHJvdmlkZWQgZmlsZSBwYXRoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nLCBpc0Vycm9yTW9kZTogYm9vbGVhbikge1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoZ2V0UmVwb0Jhc2VEaXIoKSwgZmlsZVBhdGgpLCAndXRmOCcpO1xuICBjb25zdCB7dmFsaWQsIGVycm9yc30gPSB2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoY29tbWl0TWVzc2FnZSk7XG4gIGlmICh2YWxpZCkge1xuICAgIGluZm8oYCR7Z3JlZW4oJ+KImicpfSAgVmFsaWQgY29tbWl0IG1lc3NhZ2VgKTtcbiAgICBkZWxldGVDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgpO1xuICAgIHByb2Nlc3MuZXhpdENvZGUgPSAwO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8qKiBGdW5jdGlvbiB1c2VkIHRvIHByaW50IHRvIHRoZSBjb25zb2xlIGxvZy4gKi9cbiAgbGV0IHByaW50Rm4gPSBpc0Vycm9yTW9kZSA/IGVycm9yIDogbG9nO1xuXG4gIHByaW50Rm4oYCR7aXNFcnJvck1vZGUgPyByZWQoJ+KcmCcpIDogeWVsbG93KCchJyl9ICBJbnZhbGlkIGNvbW1pdCBtZXNzYWdlYCk7XG4gIHByaW50VmFsaWRhdGlvbkVycm9ycyhlcnJvcnMsIHByaW50Rm4pO1xuICBpZiAoaXNFcnJvck1vZGUpIHtcbiAgICBwcmludEZuKHJlZCgnQWJvcnRpbmcgY29tbWl0IGF0dGVtcHQgZHVlIHRvIGludmFsaWQgY29tbWl0IG1lc3NhZ2UuJykpO1xuICAgIHByaW50Rm4oXG4gICAgICAgIHJlZCgnQ29tbWl0IG1lc3NhZ2UgYWJvcnRlZCBhcyBmYWlsdXJlIHJhdGhlciB0aGFuIHdhcm5pbmcgZHVlIHRvIGxvY2FsIGNvbmZpZ3VyYXRpb24uJykpO1xuICB9IGVsc2Uge1xuICAgIHByaW50Rm4oeWVsbG93KCdCZWZvcmUgdGhpcyBjb21taXQgY2FuIGJlIG1lcmdlZCBpbnRvIHRoZSB1cHN0cmVhbSByZXBvc2l0b3J5LCBpdCBtdXN0IGJlJykpO1xuICAgIHByaW50Rm4oeWVsbG93KCdhbWVuZGVkIHRvIGZvbGxvdyBjb21taXQgbWVzc2FnZSBndWlkZWxpbmVzLicpKTtcbiAgfVxuXG4gIC8vIE9uIGFsbCBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlcywgdGhlIGNvbW1pdCBtZXNzYWdlIHNob3VsZCBiZSBzYXZlZCBhcyBhIGRyYWZ0IHRvIGJlXG4gIC8vIHJlc3RvcmVkIG9uIHRoZSBuZXh0IGNvbW1pdCBhdHRlbXB0LlxuICBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0KGZpbGVQYXRoLCBjb21taXRNZXNzYWdlKTtcbiAgLy8gU2V0IHRoZSBjb3JyZWN0IGV4aXQgY29kZSBiYXNlZCBvbiBpZiBpbnZhbGlkIGNvbW1pdCBtZXNzYWdlIGlzIGFuIGVycm9yLlxuICBwcm9jZXNzLmV4aXRDb2RlID0gaXNFcnJvck1vZGUgPyAxIDogMDtcbn1cbiJdfQ==