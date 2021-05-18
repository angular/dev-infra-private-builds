/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { writeFileSync } from 'fs';
import { debug, log } from '../../utils/console';
import { loadCommitMessageDraft } from './commit-message-draft';
/**
 * Restore the commit message draft to the git to be used as the default commit message.
 *
 * The source provided may be one of the sources described in
 *   https://git-scm.com/docs/githooks#_prepare_commit_msg
 */
export function restoreCommitMessage(filePath, source) {
    if (!!source) {
        log('Skipping commit message restoration attempt');
        if (source === 'message') {
            debug('A commit message was already provided via the command with a -m or -F flag');
        }
        if (source === 'template') {
            debug('A commit message was already provided via the -t flag or config.template setting');
        }
        if (source === 'squash') {
            debug('A commit message was already provided as a merge action or via .git/MERGE_MSG');
        }
        if (source === 'commit') {
            debug('A commit message was already provided through a revision specified via --fixup, -c,');
            debug('-C or --amend flag');
        }
        process.exit(0);
    }
    /** A draft of a commit message. */
    const commitMessage = loadCommitMessageDraft(filePath);
    // If the commit message draft has content, restore it into the provided filepath.
    if (commitMessage) {
        writeFileSync(filePath, commitMessage);
    }
    // Exit the process
    process.exit(0);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzdG9yZS1jb21taXQtbWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS9yZXN0b3JlLWNvbW1pdC1tZXNzYWdlL3Jlc3RvcmUtY29tbWl0LW1lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLElBQUksQ0FBQztBQUVqQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBRS9DLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRzlEOzs7OztHQUtHO0FBQ0gsTUFBTSxVQUFVLG9CQUFvQixDQUFDLFFBQWdCLEVBQUUsTUFBd0I7SUFDN0UsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ1osR0FBRyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7UUFDbkQsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3hCLEtBQUssQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO1NBQ3JGO1FBQ0QsSUFBSSxNQUFNLEtBQUssVUFBVSxFQUFFO1lBQ3pCLEtBQUssQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO1NBQzNGO1FBQ0QsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQ3ZCLEtBQUssQ0FBQywrRUFBK0UsQ0FBQyxDQUFDO1NBQ3hGO1FBQ0QsSUFBSSxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQ3ZCLEtBQUssQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDO1lBQzdGLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNqQjtJQUNELG1DQUFtQztJQUNuQyxNQUFNLGFBQWEsR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUV2RCxrRkFBa0Y7SUFDbEYsSUFBSSxhQUFhLEVBQUU7UUFDakIsYUFBYSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsQ0FBQztLQUN4QztJQUNELG1CQUFtQjtJQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHt3cml0ZUZpbGVTeW5jfSBmcm9tICdmcyc7XG5cbmltcG9ydCB7ZGVidWcsIGxvZ30gZnJvbSAnLi4vLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7bG9hZENvbW1pdE1lc3NhZ2VEcmFmdH0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1kcmFmdCc7XG5pbXBvcnQge0NvbW1pdE1zZ1NvdXJjZX0gZnJvbSAnLi9jb21taXQtbWVzc2FnZS1zb3VyY2UnO1xuXG4vKipcbiAqIFJlc3RvcmUgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IHRvIHRoZSBnaXQgdG8gYmUgdXNlZCBhcyB0aGUgZGVmYXVsdCBjb21taXQgbWVzc2FnZS5cbiAqXG4gKiBUaGUgc291cmNlIHByb3ZpZGVkIG1heSBiZSBvbmUgb2YgdGhlIHNvdXJjZXMgZGVzY3JpYmVkIGluXG4gKiAgIGh0dHBzOi8vZ2l0LXNjbS5jb20vZG9jcy9naXRob29rcyNfcHJlcGFyZV9jb21taXRfbXNnXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXN0b3JlQ29tbWl0TWVzc2FnZShmaWxlUGF0aDogc3RyaW5nLCBzb3VyY2U/OiBDb21taXRNc2dTb3VyY2UpIHtcbiAgaWYgKCEhc291cmNlKSB7XG4gICAgbG9nKCdTa2lwcGluZyBjb21taXQgbWVzc2FnZSByZXN0b3JhdGlvbiBhdHRlbXB0Jyk7XG4gICAgaWYgKHNvdXJjZSA9PT0gJ21lc3NhZ2UnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCB2aWEgdGhlIGNvbW1hbmQgd2l0aCBhIC1tIG9yIC1GIGZsYWcnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ3RlbXBsYXRlJykge1xuICAgICAgZGVidWcoJ0EgY29tbWl0IG1lc3NhZ2Ugd2FzIGFscmVhZHkgcHJvdmlkZWQgdmlhIHRoZSAtdCBmbGFnIG9yIGNvbmZpZy50ZW1wbGF0ZSBzZXR0aW5nJyk7XG4gICAgfVxuICAgIGlmIChzb3VyY2UgPT09ICdzcXVhc2gnKSB7XG4gICAgICBkZWJ1ZygnQSBjb21taXQgbWVzc2FnZSB3YXMgYWxyZWFkeSBwcm92aWRlZCBhcyBhIG1lcmdlIGFjdGlvbiBvciB2aWEgLmdpdC9NRVJHRV9NU0cnKTtcbiAgICB9XG4gICAgaWYgKHNvdXJjZSA9PT0gJ2NvbW1pdCcpIHtcbiAgICAgIGRlYnVnKCdBIGNvbW1pdCBtZXNzYWdlIHdhcyBhbHJlYWR5IHByb3ZpZGVkIHRocm91Z2ggYSByZXZpc2lvbiBzcGVjaWZpZWQgdmlhIC0tZml4dXAsIC1jLCcpO1xuICAgICAgZGVidWcoJy1DIG9yIC0tYW1lbmQgZmxhZycpO1xuICAgIH1cbiAgICBwcm9jZXNzLmV4aXQoMCk7XG4gIH1cbiAgLyoqIEEgZHJhZnQgb2YgYSBjb21taXQgbWVzc2FnZS4gKi9cbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IGxvYWRDb21taXRNZXNzYWdlRHJhZnQoZmlsZVBhdGgpO1xuXG4gIC8vIElmIHRoZSBjb21taXQgbWVzc2FnZSBkcmFmdCBoYXMgY29udGVudCwgcmVzdG9yZSBpdCBpbnRvIHRoZSBwcm92aWRlZCBmaWxlcGF0aC5cbiAgaWYgKGNvbW1pdE1lc3NhZ2UpIHtcbiAgICB3cml0ZUZpbGVTeW5jKGZpbGVQYXRoLCBjb21taXRNZXNzYWdlKTtcbiAgfVxuICAvLyBFeGl0IHRoZSBwcm9jZXNzXG4gIHByb2Nlc3MuZXhpdCgwKTtcbn1cbiJdfQ==