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
        if (validate_1.validateCommitMessage(commitMessage)) {
            console_1.info('√  Valid commit message');
            commit_message_draft_1.deleteCommitMessageDraft(filePath);
            return;
        }
        // On all invalid commit messages, the commit message should be saved as a draft to be
        // restored on the next commit attempt.
        commit_message_draft_1.saveCommitMessageDraft(filePath, commitMessage);
        // If the validation did not return true, exit as a failure.
        process.exit(1);
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBQy9DLG9FQUFzQztJQUV0Qyx1R0FBd0Y7SUFDeEYsK0VBQWlEO0lBRWpELHlEQUF5RDtJQUN6RCxTQUFnQixZQUFZLENBQUMsUUFBZ0I7UUFDM0MsSUFBTSxhQUFhLEdBQUcsaUJBQVksQ0FBQyxjQUFPLENBQUMsdUJBQWMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hGLElBQUksZ0NBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDeEMsY0FBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7WUFDaEMsK0NBQXdCLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbkMsT0FBTztTQUNSO1FBQ0Qsc0ZBQXNGO1FBQ3RGLHVDQUF1QztRQUN2Qyw2Q0FBc0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDaEQsNERBQTREO1FBQzVELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEIsQ0FBQztJQVpELG9DQVlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7ZGVsZXRlQ29tbWl0TWVzc2FnZURyYWZ0LCBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0fSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlLWRyYWZ0JztcbmltcG9ydCB7dmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLyoqIFZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlIGF0IHRoZSBwcm92aWRlZCBmaWxlIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGdldFJlcG9CYXNlRGlyKCksIGZpbGVQYXRoKSwgJ3V0ZjgnKTtcbiAgaWYgKHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKSkge1xuICAgIGluZm8oJ+KImiAgVmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICBkZWxldGVDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBPbiBhbGwgaW52YWxpZCBjb21taXQgbWVzc2FnZXMsIHRoZSBjb21taXQgbWVzc2FnZSBzaG91bGQgYmUgc2F2ZWQgYXMgYSBkcmFmdCB0byBiZVxuICAvLyByZXN0b3JlZCBvbiB0aGUgbmV4dCBjb21taXQgYXR0ZW1wdC5cbiAgc2F2ZUNvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCwgY29tbWl0TWVzc2FnZSk7XG4gIC8vIElmIHRoZSB2YWxpZGF0aW9uIGRpZCBub3QgcmV0dXJuIHRydWUsIGV4aXQgYXMgYSBmYWlsdXJlLlxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=