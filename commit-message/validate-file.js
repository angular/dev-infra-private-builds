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
    function validateFile(filePath) {
        var commitMessage = fs_1.readFileSync(path_1.resolve(config_1.getRepoBaseDir(), filePath), 'utf8');
        var _a = validate_1.validateCommitMessage(commitMessage), valid = _a.valid, errors = _a.errors;
        if (valid) {
            console_1.info(console_1.green('√') + "  Valid commit message");
            commit_message_draft_1.deleteCommitMessageDraft(filePath);
            return;
        }
        console_1.error(console_1.red('✘') + "  Invalid commit message");
        validate_1.printValidationErrors(errors);
        console_1.error('Aborting commit attempt due to invalid commit message.');
        // On all invalid commit messages, the commit message should be saved as a draft to be
        // restored on the next commit attempt.
        commit_message_draft_1.saveCommitMessageDraft(filePath, commitMessage);
        // If the validation did not return true, exit as a failure.
        process.exit(1);
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBQy9DLG9FQUF5RDtJQUV6RCx1R0FBd0Y7SUFDeEYsK0VBQXdFO0lBRXhFLHlEQUF5RDtJQUN6RCxTQUFnQixZQUFZLENBQUMsUUFBZ0I7UUFDM0MsSUFBTSxhQUFhLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsdUJBQWMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzFFLElBQUEsS0FBa0IsZ0NBQXFCLENBQUMsYUFBYSxDQUFDLEVBQXJELEtBQUssV0FBQSxFQUFFLE1BQU0sWUFBd0MsQ0FBQztRQUM3RCxJQUFJLEtBQUssRUFBRTtZQUNULGNBQUksQ0FBSSxlQUFLLENBQUMsR0FBRyxDQUFDLDJCQUF3QixDQUFDLENBQUM7WUFDNUMsK0NBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsT0FBTztTQUNSO1FBRUQsZUFBSyxDQUFJLGFBQUcsQ0FBQyxHQUFHLENBQUMsNkJBQTBCLENBQUMsQ0FBQztRQUM3QyxnQ0FBcUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM5QixlQUFLLENBQUMsd0RBQXdELENBQUMsQ0FBQztRQUVoRSxzRkFBc0Y7UUFDdEYsdUNBQXVDO1FBQ3ZDLDZDQUFzQixDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUNoRCw0REFBNEQ7UUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBbEJELG9DQWtCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7cmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge2Vycm9yLCBncmVlbiwgaW5mbywgcmVkfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtkZWxldGVDb21taXRNZXNzYWdlRHJhZnQsIHNhdmVDb21taXRNZXNzYWdlRHJhZnR9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UtZHJhZnQnO1xuaW1wb3J0IHtwcmludFZhbGlkYXRpb25FcnJvcnMsIHZhbGlkYXRlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi92YWxpZGF0ZSc7XG5cbi8qKiBWYWxpZGF0ZSBjb21taXQgbWVzc2FnZSBhdCB0aGUgcHJvdmlkZWQgZmlsZSBwYXRoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSByZWFkRmlsZVN5bmMocmVzb2x2ZShnZXRSZXBvQmFzZURpcigpLCBmaWxlUGF0aCksICd1dGY4Jyk7XG4gIGNvbnN0IHt2YWxpZCwgZXJyb3JzfSA9IHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKTtcbiAgaWYgKHZhbGlkKSB7XG4gICAgaW5mbyhgJHtncmVlbign4oiaJyl9ICBWYWxpZCBjb21taXQgbWVzc2FnZWApO1xuICAgIGRlbGV0ZUNvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZXJyb3IoYCR7cmVkKCfinJgnKX0gIEludmFsaWQgY29tbWl0IG1lc3NhZ2VgKTtcbiAgcHJpbnRWYWxpZGF0aW9uRXJyb3JzKGVycm9ycyk7XG4gIGVycm9yKCdBYm9ydGluZyBjb21taXQgYXR0ZW1wdCBkdWUgdG8gaW52YWxpZCBjb21taXQgbWVzc2FnZS4nKTtcblxuICAvLyBPbiBhbGwgaW52YWxpZCBjb21taXQgbWVzc2FnZXMsIHRoZSBjb21taXQgbWVzc2FnZSBzaG91bGQgYmUgc2F2ZWQgYXMgYSBkcmFmdCB0byBiZVxuICAvLyByZXN0b3JlZCBvbiB0aGUgbmV4dCBjb21taXQgYXR0ZW1wdC5cbiAgc2F2ZUNvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCwgY29tbWl0TWVzc2FnZSk7XG4gIC8vIElmIHRoZSB2YWxpZGF0aW9uIGRpZCBub3QgcmV0dXJuIHRydWUsIGV4aXQgYXMgYSBmYWlsdXJlLlxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=