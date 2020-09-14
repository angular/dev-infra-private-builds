(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-file", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/commit-message-draft", "@angular/dev-infra-private/commit-message/validate"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQThEO0lBQzlELG9FQUFzRTtJQUV0RSx1R0FBd0Y7SUFDeEYsK0VBQXdFO0lBRXhFLHlEQUF5RDtJQUN6RCxTQUFnQixZQUFZLENBQUMsUUFBZ0IsRUFBRSxXQUFvQjtRQUNqRSxJQUFNLGFBQWEsR0FBRyxpQkFBWSxDQUFDLGNBQU8sQ0FBQyx1QkFBYyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDMUUsSUFBQSxLQUFrQixnQ0FBcUIsQ0FBQyxhQUFhLENBQUMsRUFBckQsS0FBSyxXQUFBLEVBQUUsTUFBTSxZQUF3QyxDQUFDO1FBQzdELElBQUksS0FBSyxFQUFFO1lBQ1QsY0FBSSxDQUFJLGVBQUssQ0FBQyxHQUFHLENBQUMsMkJBQXdCLENBQUMsQ0FBQztZQUM1QywrQ0FBd0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNyQixPQUFPO1NBQ1I7UUFFRCxpREFBaUQ7UUFDakQsSUFBSSxPQUFPLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxlQUFLLENBQUMsQ0FBQyxDQUFDLGFBQUcsQ0FBQztRQUV4QyxPQUFPLENBQUMsQ0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLGFBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQU0sQ0FBQyxHQUFHLENBQUMsOEJBQTBCLENBQUMsQ0FBQztRQUMzRSxnQ0FBcUIsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkMsSUFBSSxXQUFXLEVBQUU7WUFDZixPQUFPLENBQUMsYUFBRyxDQUFDLHdEQUF3RCxDQUFDLENBQUMsQ0FBQztZQUN2RSxPQUFPLENBQ0gsYUFBRyxDQUFDLG1GQUFtRixDQUFDLENBQUMsQ0FBQztTQUMvRjthQUFNO1lBQ0wsT0FBTyxDQUFDLGdCQUFNLENBQUMsMkVBQTJFLENBQUMsQ0FBQyxDQUFDO1lBQzdGLE9BQU8sQ0FBQyxnQkFBTSxDQUFDLDhDQUE4QyxDQUFDLENBQUMsQ0FBQztTQUNqRTtRQUVELHNGQUFzRjtRQUN0Rix1Q0FBdUM7UUFDdkMsNkNBQXNCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2hELDRFQUE0RTtRQUM1RSxPQUFPLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQTdCRCxvQ0E2QkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyLCBnZXRVc2VyQ29uZmlnfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtlcnJvciwgZ3JlZW4sIGluZm8sIGxvZywgcmVkLCB5ZWxsb3d9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2RlbGV0ZUNvbW1pdE1lc3NhZ2VEcmFmdCwgc2F2ZUNvbW1pdE1lc3NhZ2VEcmFmdH0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1kcmFmdCc7XG5pbXBvcnQge3ByaW50VmFsaWRhdGlvbkVycm9ycywgdmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLyoqIFZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlIGF0IHRoZSBwcm92aWRlZCBmaWxlIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcsIGlzRXJyb3JNb2RlOiBib29sZWFuKSB7XG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSByZWFkRmlsZVN5bmMocmVzb2x2ZShnZXRSZXBvQmFzZURpcigpLCBmaWxlUGF0aCksICd1dGY4Jyk7XG4gIGNvbnN0IHt2YWxpZCwgZXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKTtcbiAgaWYgKHZhbGlkKSB7XG4gICAgaW5mbyhgJHtncmVlbign4oiaJyl9ICBWYWxpZCBjb21taXQgbWVzc2FnZWApO1xuICAgIGRlbGV0ZUNvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG4gICAgcHJvY2Vzcy5leGl0Q29kZSA9IDA7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLyoqIEZ1bmN0aW9uIHVzZWQgdG8gcHJpbnQgdG8gdGhlIGNvbnNvbGUgbG9nLiAqL1xuICBsZXQgcHJpbnRGbiA9IGlzRXJyb3JNb2RlID8gZXJyb3IgOiBsb2c7XG5cbiAgcHJpbnRGbihgJHtpc0Vycm9yTW9kZSA/IHJlZCgn4pyYJykgOiB5ZWxsb3coJyEnKX0gIEludmFsaWQgY29tbWl0IG1lc3NhZ2VgKTtcbiAgcHJpbnRWYWxpZGF0aW9uRXJyb3JzKGVycm9ycywgcHJpbnRGbik7XG4gIGlmIChpc0Vycm9yTW9kZSkge1xuICAgIHByaW50Rm4ocmVkKCdBYm9ydGluZyBjb21taXQgYXR0ZW1wdCBkdWUgdG8gaW52YWxpZCBjb21taXQgbWVzc2FnZS4nKSk7XG4gICAgcHJpbnRGbihcbiAgICAgICAgcmVkKCdDb21taXQgbWVzc2FnZSBhYm9ydGVkIGFzIGZhaWx1cmUgcmF0aGVyIHRoYW4gd2FybmluZyBkdWUgdG8gbG9jYWwgY29uZmlndXJhdGlvbi4nKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJpbnRGbih5ZWxsb3coJ0JlZm9yZSB0aGlzIGNvbW1pdCBjYW4gYmUgbWVyZ2VkIGludG8gdGhlIHVwc3RyZWFtIHJlcG9zaXRvcnksIGl0IG11c3QgYmUnKSk7XG4gICAgcHJpbnRGbih5ZWxsb3coJ2FtZW5kZWQgdG8gZm9sbG93IGNvbW1pdCBtZXNzYWdlIGd1aWRlbGluZXMuJykpO1xuICB9XG5cbiAgLy8gT24gYWxsIGludmFsaWQgY29tbWl0IG1lc3NhZ2VzLCB0aGUgY29tbWl0IG1lc3NhZ2Ugc2hvdWxkIGJlIHNhdmVkIGFzIGEgZHJhZnQgdG8gYmVcbiAgLy8gcmVzdG9yZWQgb24gdGhlIG5leHQgY29tbWl0IGF0dGVtcHQuXG4gIHNhdmVDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xuICAvLyBTZXQgdGhlIGNvcnJlY3QgZXhpdCBjb2RlIGJhc2VkIG9uIGlmIGludmFsaWQgY29tbWl0IG1lc3NhZ2UgaXMgYW4gZXJyb3IuXG4gIHByb2Nlc3MuZXhpdENvZGUgPSBpc0Vycm9yTW9kZSA/IDEgOiAwO1xufVxuIl19