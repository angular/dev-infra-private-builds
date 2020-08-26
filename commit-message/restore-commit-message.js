/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/restore-commit-message", ["require", "exports", "console", "fs", "@angular/dev-infra-private/commit-message/commit-message-draft"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.restoreCommitMessage = void 0;
    var console_1 = require("console");
    var fs_1 = require("fs");
    var commit_message_draft_1 = require("@angular/dev-infra-private/commit-message/commit-message-draft");
    /**
     * Restore the commit message draft to the git to be used as the default commit message.
     *
     * The source provided may be one of the sources described in
     *   https://git-scm.com/docs/githooks#_prepare_commit_msg
     */
    function restoreCommitMessage(filePath, source) {
        if (!!source) {
            console_1.info('Skipping commit message restoration attempt');
            if (source === 'message') {
                console_1.info('A commit message was already provided via the command with a -m or -F flag');
            }
            if (source === 'template') {
                console_1.info('A commit message was already provided via the -t flag or config.template setting');
            }
            if (source === 'squash') {
                console_1.info('A commit message was already provided as a merge action or via .git/MERGE_MSG');
            }
            if (source === 'commit') {
                console_1.info('A commit message was already provided through a revision specified via --fixup, -c,');
                console_1.info('-C or --amend flag');
            }
            process.exit(0);
        }
        /** A draft of a commit message. */
        var commitMessage = commit_message_draft_1.loadCommitMessageDraft(filePath);
        // If the commit message draft has content, restore it into the provided filepath.
        if (commitMessage) {
            fs_1.writeFileSync(filePath, commitMessage);
        }
        // Exit the process
        process.exit(0);
    }
    exports.restoreCommitMessage = restoreCommitMessage;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS1jb21taXQtbWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG1DQUE2QjtJQUM3Qix5QkFBaUM7SUFFakMsdUdBQThEO0lBRTlEOzs7OztPQUtHO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQ2hDLFFBQWdCLEVBQUUsTUFBK0M7UUFDbkUsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ1osY0FBSSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFDcEQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN4QixjQUFJLENBQUMsNEVBQTRFLENBQUMsQ0FBQzthQUNwRjtZQUNELElBQUksTUFBTSxLQUFLLFVBQVUsRUFBRTtnQkFDekIsY0FBSSxDQUFDLGtGQUFrRixDQUFDLENBQUM7YUFDMUY7WUFDRCxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZCLGNBQUksQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO2FBQ3ZGO1lBQ0QsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUN2QixjQUFJLENBQUMscUZBQXFGLENBQUMsQ0FBQztnQkFDNUYsY0FBSSxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsbUNBQW1DO1FBQ25DLElBQU0sYUFBYSxHQUFHLDZDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZELGtGQUFrRjtRQUNsRixJQUFJLGFBQWEsRUFBRTtZQUNqQixrQkFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUN4QztRQUNELG1CQUFtQjtRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUE1QkQsb0RBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5mb30gZnJvbSAnY29uc29sZSc7XG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcblxuaW1wb3J0IHtsb2FkQ29tbWl0TWVzc2FnZURyYWZ0fSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlLWRyYWZ0JztcblxuLyoqXG4gKiBSZXN0b3JlIHRoZSBjb21taXQgbWVzc2FnZSBkcmFmdCB0byB0aGUgZ2l0IHRvIGJlIHVzZWQgYXMgdGhlIGRlZmF1bHQgY29tbWl0IG1lc3NhZ2UuXG4gKlxuICogVGhlIHNvdXJjZSBwcm92aWRlZCBtYXkgYmUgb25lIG9mIHRoZSBzb3VyY2VzIGRlc2NyaWJlZCBpblxuICogICBodHRwczovL2dpdC1zY20uY29tL2RvY3MvZ2l0aG9va3MjX3ByZXBhcmVfY29tbWl0X21zZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gcmVzdG9yZUNvbW1pdE1lc3NhZ2UoXG4gICAgZmlsZVBhdGg6IHN0cmluZywgc291cmNlPzogJ21lc3NhZ2UnfCd0ZW1wbGF0ZSd8J3NxdWFzaCd8J2NvbW1pdCcpIHtcbiAgaWYgKCEhc291cmNlKSB7XG4gICAgaW5mbygnU2tpcHBpbmcgY29tbWl0IG1lc3NhZ2UgcmVzdG9yYXRpb24gYXR0ZW1wdCcpO1xuICAgIGlmIChzb3VyY2UgPT09ICdtZXNzYWdlJykge1xuICAgICAgaW5mbygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIGNvbW1hbmQgd2l0aCBhIC1tIG9yIC1GIGZsYWcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgaW5mbygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIC10IGZsYWcgb3IgY29uZmlnLnRlbXBsYXRlIHNldHRpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3NxdWFzaCcpIHtcbiAgICAgIGluZm8oJ0EgY29tbWl0IG1lc3NhZ2Ugd2FzIGFscmVhZHkgcHJvdmlkZWQgYXMgYSBtZXJnZSBhY3Rpb24gb3IgdmlhIC5naXQvTUVSR0VfTVNHJyk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UgPT09ICdjb21taXQnKSB7XG4gICAgICBpbmZvKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIHRocm91Z2ggYSByZXZpc2lvbiBzcGVjaWZpZWQgdmlhIC0tZml4dXAsIC1jLCcpO1xuICAgICAgaW5mbygnLUMgb3IgLS1hbWVuZCBmbGFnJyk7XG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuICAvKiogQSBkcmFmdCBvZiBhIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gbG9hZENvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG5cbiAgLy8gSWYgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGhhcyBjb250ZW50LCByZXN0b3JlIGl0IGludG8gdGhlIHByb3ZpZGVkIGZpbGVwYXRoLlxuICBpZiAoY29tbWl0TWVzc2FnZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xuICB9XG4gIC8vIEV4aXQgdGhlIHByb2Nlc3NcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuIl19