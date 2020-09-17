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
        define("@angular/dev-infra-private/commit-message/restore-commit-message", ["require", "exports", "fs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/commit-message-draft"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.restoreCommitMessage = void 0;
    var fs_1 = require("fs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var commit_message_draft_1 = require("@angular/dev-infra-private/commit-message/commit-message-draft");
    /**
     * Restore the commit message draft to the git to be used as the default commit message.
     *
     * The source provided may be one of the sources described in
     *   https://git-scm.com/docs/githooks#_prepare_commit_msg
     */
    function restoreCommitMessage(filePath, source) {
        if (!!source) {
            console_1.log('Skipping commit message restoration attempt');
            if (source === 'message') {
                console_1.debug('A commit message was already provided via the command with a -m or -F flag');
            }
            if (source === 'template') {
                console_1.debug('A commit message was already provided via the -t flag or config.template setting');
            }
            if (source === 'squash') {
                console_1.debug('A commit message was already provided as a merge action or via .git/MERGE_MSG');
            }
            if (source === 'commit') {
                console_1.debug('A commit message was already provided through a revision specified via --fixup, -c,');
                console_1.debug('-C or --amend flag');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS1jb21taXQtbWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlCQUFpQztJQUVqQyxvRUFBNEM7SUFFNUMsdUdBQThEO0lBRTlEOzs7OztPQUtHO0lBQ0gsU0FBZ0Isb0JBQW9CLENBQ2hDLFFBQWdCLEVBQUUsTUFBK0M7UUFDbkUsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1lBQ1osYUFBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFDbkQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO2dCQUN4QixlQUFLLENBQUMsNEVBQTRFLENBQUMsQ0FBQzthQUNyRjtZQUNELElBQUksTUFBTSxLQUFLLFVBQVUsRUFBRTtnQkFDekIsZUFBSyxDQUFDLGtGQUFrRixDQUFDLENBQUM7YUFDM0Y7WUFDRCxJQUFJLE1BQU0sS0FBSyxRQUFRLEVBQUU7Z0JBQ3ZCLGVBQUssQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO2FBQ3hGO1lBQ0QsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUN2QixlQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztnQkFDN0YsZUFBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7YUFDN0I7WUFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO1FBQ0QsbUNBQW1DO1FBQ25DLElBQU0sYUFBYSxHQUFHLDZDQUFzQixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXZELGtGQUFrRjtRQUNsRixJQUFJLGFBQWEsRUFBRTtZQUNqQixrQkFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztTQUN4QztRQUNELG1CQUFtQjtRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUE1QkQsb0RBNEJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7d3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuXG5pbXBvcnQge2RlYnVnLCBsb2d9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2xvYWRDb21taXRNZXNzYWdlRHJhZnR9IGZyb20gJy4vY29tbWl0LW1lc3NhZ2UtZHJhZnQnO1xuXG4vKipcbiAqIFJlc3RvcmUgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IHRvIHRoZSBnaXQgdG8gYmUgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb21taXQgbWVzc2FnZS5cbiAqXG4gKiBUaGUgc291cmNlIHByb3ZpZGVkIG1heSBiZSBvbmUgb2YgdGhlIHNvdXJjZXMgZGVzY3JpYmVkIGluXG4gKiAgIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlQ29tbWl0TWVzc2FnZShcbiAgICBmaWxlUGF0aDogc3RyaW5nLCBzb3VyY2U/OiAnbWVzc2FnZSd8J3RlbXBsYXRlJ3wnc3F1YXNoJ3wnY29tbWl0Jykge1xuICBpZiAoISFzb3VyY2UpIHtcbiAgICBsb2coJ1NraXBwaW5nIGNvbW1pdCBtZXNzYWdlIHJlc3RvcmF0aW9uIGF0dGVtcHQnKTtcbiAgICBpZiAoc291cmNlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIHZpYSB0aGUgY29tbWFuZCB3aXRoIGEgLW0gb3IgLUYgZmxhZycpO1xuICAgIH1cbiAgICBpZiAoc291cmNlID09PSAndGVtcGxhdGUnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIC10IGZsYWcgb3IgY29uZmlnLnRlbXBsYXRlIHNldHRpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3NxdWFzaCcpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIGFzIGEgbWVyZ2UgYWN0aW9uIG9yIHZpYSAuZ2l0L01FUkdFX01TRycpO1xuICAgIH1cbiAgICBpZiAoc291cmNlID09PSAnY29tbWl0Jykge1xuICAgICAgZGVidWcoJ0EgY29tbWl0IG1lc3NhZ2Ugd2FzIGFscmVhZHkgcHJvdmlkZWQgdGhyb3VnaCBhIHJldmlzaW9uIHNwZWNpZmllZCB2aWEgLS1maXh1cCwgLWMsJyk7XG4gICAgICBkZWJ1ZygnLUMgb3IgLS1hbWVuZCBmbGFnJyk7XG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuICAvKiogQSBkcmFmdCBvZiBhIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gbG9hZENvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG5cbiAgLy8gSWYgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGhhcyBjb250ZW50LCByZXN0b3JlIGl0IGludG8gdGhlIHByb3ZpZGVkIGZpbGVwYXRoLlxuICBpZiAoY29tbWl0TWVzc2FnZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xuICB9XG4gIC8vIEV4aXQgdGhlIHByb2Nlc3NcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuIl19