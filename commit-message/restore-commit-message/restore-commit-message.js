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
        define("@angular/dev-infra-private/commit-message/restore-commit-message/restore-commit-message", ["require", "exports", "fs", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.restoreCommitMessage = void 0;
    var fs_1 = require("fs");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var commit_message_draft_1 = require("@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS1jb21taXQtbWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgseUJBQWlDO0lBRWpDLG9FQUErQztJQUUvQyw4SEFBOEQ7SUFHOUQ7Ozs7O09BS0c7SUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxRQUFnQixFQUFFLE1BQXdCO1FBQzdFLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRTtZQUNaLGFBQUcsQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1lBQ25ELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtnQkFDeEIsZUFBSyxDQUFDLDRFQUE0RSxDQUFDLENBQUM7YUFDckY7WUFDRCxJQUFJLE1BQU0sS0FBSyxVQUFVLEVBQUU7Z0JBQ3pCLGVBQUssQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO2FBQzNGO1lBQ0QsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO2dCQUN2QixlQUFLLENBQUMsK0VBQStFLENBQUMsQ0FBQzthQUN4RjtZQUNELElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtnQkFDdkIsZUFBSyxDQUFDLHFGQUFxRixDQUFDLENBQUM7Z0JBQzdGLGVBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO2FBQzdCO1lBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNqQjtRQUNELG1DQUFtQztRQUNuQyxJQUFNLGFBQWEsR0FBRyw2Q0FBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUV2RCxrRkFBa0Y7UUFDbEYsSUFBSSxhQUFhLEVBQUU7WUFDakIsa0JBQWEsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7U0FDeEM7UUFDRCxtQkFBbUI7UUFDbkIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBM0JELG9EQTJCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3dyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcblxuaW1wb3J0IHtkZWJ1ZywgbG9nfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtsb2FkQ29tbWl0TWVzc2FnZURyYWZ0fSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlLWRyYWZ0JztcbmltcG9ydCB7Q29tbWl0TXNnU291cmNlfSBmcm9tICcuL2NvbW1pdC1tZXNzYWdlLXNvdXJjZSc7XG5cbi8qKlxuICogUmVzdG9yZSB0aGUgY29tbWl0IG1lc3NhZ2UgZHJhZnQgdG8gdGhlIGdpdCB0byBiZSB1c2VkIGFzIHRoZSBkZWZhdWx0IGNvbW1pdCBtZXNzYWdlLlxuICpcbiAqIFRoZSBzb3VyY2UgcHJvdmlkZWQgbWF5IGJlIG9uZSBvZiB0aGUgc291cmNlcyBkZXNjcmliZWQgaW5cbiAqICAgaHR0cHM6Ly9naXQtc2NtLmNvbS9kb2NzL2dpdGhvb2tzI19wcmVwYXJlX2NvbW1pdF9tc2dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc3RvcmVDb21taXRNZXNzYWdlKGZpbGVQYXRoOiBzdHJpbmcsIHNvdXJjZT86IENvbW1pdE1zZ1NvdXJjZSkge1xuICBpZiAoISFzb3VyY2UpIHtcbiAgICBsb2coJ1NraXBwaW5nIGNvbW1pdCBtZXNzYWdlIHJlc3RvcmF0aW9uIGF0dGVtcHQnKTtcbiAgICBpZiAoc291cmNlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIHZpYSB0aGUgY29tbWFuZCB3aXRoIGEgLW0gb3IgLUYgZmxhZycpO1xuICAgIH1cbiAgICBpZiAoc291cmNlID09PSAndGVtcGxhdGUnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIC10IGZsYWcgb3IgY29uZmlnLnRlbXBsYXRlIHNldHRpbmcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3NxdWFzaCcpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIGFzIGEgbWVyZ2UgYWN0aW9uIG9yIHZpYSAuZ2l0L01FUkdFX01TRycpO1xuICAgIH1cbiAgICBpZiAoc291cmNlID09PSAnY29tbWl0Jykge1xuICAgICAgZGVidWcoJ0EgY29tbWl0IG1lc3NhZ2Ugd2FzIGFscmVhZHkgcHJvdmlkZWQgdGhyb3VnaCBhIHJldmlzaW9uIHNwZWNpZmllZCB2aWEgLS1maXh1cCwgLWMsJyk7XG4gICAgICBkZWJ1ZygnLUMgb3IgLS1hbWVuZCBmbGFnJyk7XG4gICAgfVxuICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgfVxuICAvKiogQSBkcmFmdCBvZiBhIGNvbW1pdCBtZXNzYWdlLiAqL1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gbG9hZENvbW1pdE1lc3NhZ2VEcmFmdChmaWxlUGF0aCk7XG5cbiAgLy8gSWYgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGhhcyBjb250ZW50LCByZXN0b3JlIGl0IGludG8gdGhlIHByb3ZpZGVkIGZpbGVwYXRoLlxuICBpZiAoY29tbWl0TWVzc2FnZSkge1xuICAgIHdyaXRlRmlsZVN5bmMoZmlsZVBhdGgsIGNvbW1pdE1lc3NhZ2UpO1xuICB9XG4gIC8vIEV4aXQgdGhlIHByb2Nlc3NcbiAgcHJvY2Vzcy5leGl0KDApO1xufVxuIl19