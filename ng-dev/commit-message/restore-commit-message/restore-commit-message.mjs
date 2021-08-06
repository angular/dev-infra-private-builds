"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreCommitMessage = void 0;
const fs_1 = require("fs");
const console_1 = require("../../utils/console");
const commit_message_draft_1 = require("./commit-message-draft");
/**
 * Restore the commit message draft to the git to be used as the default commit message.
 *
 * The source provided may be one of the sources described in
 *   https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
function restoreCommitMessage(filePath, source) {
    if (!!source) {
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
    const commitMessage = commit_message_draft_1.loadCommitMessageDraft(filePath);
    // If the commit message draft has content, restore it into the provided filepath.
    if (commitMessage) {
        fs_1.writeFileSync(filePath, commitMessage);
    }
    // Exit the process
    process.exit(0);
}
exports.restoreCommitMessage = restoreCommitMessage;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS1jb21taXQtbWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL25nLWRldi9jb21taXQtbWVzc2FnZS9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsMkJBQWlDO0FBRWpDLGlEQUErQztBQUUvQyxpRUFBOEQ7QUFHOUQ7Ozs7O0dBS0c7QUFDSCxTQUFnQixvQkFBb0IsQ0FBQyxRQUFnQixFQUFFLE1BQXdCO0lBQzdFLElBQUksQ0FBQyxDQUFDLE1BQU0sRUFBRTtRQUNaLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN4QixlQUFLLENBQUMsNEVBQTRFLENBQUMsQ0FBQztTQUNyRjtRQUNELElBQUksTUFBTSxLQUFLLFVBQVUsRUFBRTtZQUN6QixlQUFLLENBQUMsa0ZBQWtGLENBQUMsQ0FBQztTQUMzRjtRQUNELElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUN2QixlQUFLLENBQUMsK0VBQStFLENBQUMsQ0FBQztTQUN4RjtRQUNELElBQUksTUFBTSxLQUFLLFFBQVEsRUFBRTtZQUN2QixlQUFLLENBQUMscUZBQXFGLENBQUMsQ0FBQztZQUM3RixlQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUM3QjtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDakI7SUFDRCxtQ0FBbUM7SUFDbkMsTUFBTSxhQUFhLEdBQUcsNkNBQXNCLENBQUMsUUFBUSxDQUFDLENBQUM7SUFFdkQsa0ZBQWtGO0lBQ2xGLElBQUksYUFBYSxFQUFFO1FBQ2pCLGtCQUFhLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsbUJBQW1CO0lBQ25CLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEIsQ0FBQztBQTFCRCxvREEwQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5cbmltcG9ydCB7ZGVidWcsIGxvZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7bG9hZENvbW1pdE1lc3NhZ2VEcmFmdH0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1kcmFmdCc7XG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG4vKipcbiAqIFJlc3RvcmUgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IHRvIHRoZSBnaXQgdG8gYmUgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb21taXQgbWVzc2FnZS5cbiAqXG4gKiBUaGUgc291cmNlIHByb3ZpZGVkIG1heSBiZSBvbmUgb2YgdGhlIHNvdXJjZXMgZGVzY3JpYmVkIGluXG4gKiAgIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlUGF0aDogc3RyaW5nLCBzb3VyY2U/OiBDb21taXRNc2dTb3VyY2UpIHtcbiAgaWYgKCEhc291cmNlKSB7XG4gICAgaWYgKHNvdXJjZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIGNvbW1hbmQgd2l0aCBhIC1tIG9yIC1GIGZsYWcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgZGVidWcoJ0EgY29tbWl0IG1lc3NhZ2Ugd2FzIGFscmVhZHkgcHJvdmlkZWQgdmlhIHRoZSAtdCBmbGFnIG9yIGNvbmZpZy50ZW1wbGF0ZSBzZXR0aW5nJyk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UgPT09ICdzcXVhc2gnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCBhcyBhIG1lcmdlIGFjdGlvbiBvciB2aWEgLmdpdC9NRVJHRV9NU0cnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ2NvbW1pdCcpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIHRocm91Z2ggYSByZXZpc2lvbiBzcGVjaWZpZWQgdmlhIC0tZml4dXAsIC1jLCcpO1xuICAgICAgZGVidWcoJy1DIG9yIC0tYW1lbmQgZmxhZycpO1xuICAgIH1cbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbiAgLyoqIEEgZHJhZnQgb2YgYSBjb21taXQgbWVzc2FnZS4gKi9cbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGxvYWRDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgpO1xuXG4gIC8vIElmIHRoZSBjb21taXQgbWVzc2FnZSBkcmFmdCBoYXMgY29udGVudCwgcmVzdG9yZSBpdCBpbnRvIHRoZSBwcm92aWRlZCBmaWxlcGF0aC5cbiAgaWYgKGNvbW1pdE1lc3NhZ2UpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb21taXRNZXNzYWdlKTtcbiAgfVxuICAvLyBFeGl0IHRoZSBwcm9jZXNzXG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cbiJdfQ==