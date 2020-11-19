(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/commit-message-draft", ["require", "exports", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.saveCommitMessageDraft = exports.deleteCommitMessageDraft = exports.loadCommitMessageDraft = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    /** Load the commit message draft from the file system if it exists. */
    function loadCommitMessageDraft(basePath) {
        var commitMessageDraftPath = basePath + ".ngDevSave";
        if (fs_1.existsSync(commitMessageDraftPath)) {
            return fs_1.readFileSync(commitMessageDraftPath).toString();
        }
        return '';
    }
    exports.loadCommitMessageDraft = loadCommitMessageDraft;
    /** Remove the commit message draft from the file system. */
    function deleteCommitMessageDraft(basePath) {
        var commitMessageDraftPath = basePath + ".ngDevSave";
        if (fs_1.existsSync(commitMessageDraftPath)) {
            fs_1.unlinkSync(commitMessageDraftPath);
        }
    }
    exports.deleteCommitMessageDraft = deleteCommitMessageDraft;
    /** Save the commit message draft to the file system for later retrieval. */
    function saveCommitMessageDraft(basePath, commitMessage) {
        fs_1.writeFileSync(basePath + ".ngDevSave", commitMessage);
    }
    exports.saveCommitMessageDraft = saveCommitMessageDraft;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWl0LW1lc3NhZ2UtZHJhZnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvY29tbWl0LW1lc3NhZ2UtZHJhZnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQXVFO0lBRXZFLHVFQUF1RTtJQUN2RSxTQUFnQixzQkFBc0IsQ0FBQyxRQUFnQjtRQUNyRCxJQUFNLHNCQUFzQixHQUFNLFFBQVEsZUFBWSxDQUFDO1FBQ3ZELElBQUksZUFBVSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDdEMsT0FBTyxpQkFBWSxDQUFDLHNCQUFzQixDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDeEQ7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNaLENBQUM7SUFORCx3REFNQztJQUVELDREQUE0RDtJQUM1RCxTQUFnQix3QkFBd0IsQ0FBQyxRQUFnQjtRQUN2RCxJQUFNLHNCQUFzQixHQUFNLFFBQVEsZUFBWSxDQUFDO1FBQ3ZELElBQUksZUFBVSxDQUFDLHNCQUFzQixDQUFDLEVBQUU7WUFDdEMsZUFBVSxDQUFDLHNCQUFzQixDQUFDLENBQUM7U0FDcEM7SUFDSCxDQUFDO0lBTEQsNERBS0M7SUFFRCw0RUFBNEU7SUFDNUUsU0FBZ0Isc0JBQXNCLENBQUMsUUFBZ0IsRUFBRSxhQUFxQjtRQUM1RSxrQkFBYSxDQUFJLFFBQVEsZUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFGRCx3REFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMsIHVubGlua1N5bmMsIHdyaXRlRmlsZVN5bmN9IGZyb20gJ2ZzJztcblxuLyoqIExvYWQgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGZyb20gdGhlIGZpbGUgc3lzdGVtIGlmIGl0IGV4aXN0cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkQ29tbWl0TWVzc2FnZURyYWZ0KGJhc2VQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tbWl0TWVzc2FnZURyYWZ0UGF0aCA9IGAke2Jhc2VQYXRofS5uZ0RldlNhdmVgO1xuICBpZiAoZXhpc3RzU3luYyhjb21taXRNZXNzYWdlRHJhZnRQYXRoKSkge1xuICAgIHJldHVybiByZWFkRmlsZVN5bmMoY29tbWl0TWVzc2FnZURyYWZ0UGF0aCkudG9TdHJpbmcoKTtcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbi8qKiBSZW1vdmUgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IGZyb20gdGhlIGZpbGUgc3lzdGVtLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUNvbW1pdE1lc3NhZ2VEcmFmdChiYXNlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2VEcmFmdFBhdGggPSBgJHtiYXNlUGF0aH0ubmdEZXZTYXZlYDtcbiAgaWYgKGV4aXN0c1N5bmMoY29tbWl0TWVzc2FnZURyYWZ0UGF0aCkpIHtcbiAgICB1bmxpbmtTeW5jKGNvbW1pdE1lc3NhZ2VEcmFmdFBhdGgpO1xuICB9XG59XG5cbi8qKiBTYXZlIHRoZSBjb21taXQgbWVzc2FnZSBkcmFmdCB0byB0aGUgZmlsZSBzeXN0ZW0gZm9yIGxhdGVyIHJldHJpZXZhbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzYXZlQ29tbWl0TWVzc2FnZURyYWZ0KGJhc2VQYXRoOiBzdHJpbmcsIGNvbW1pdE1lc3NhZ2U6IHN0cmluZykge1xuICB3cml0ZUZpbGVTeW5jKGAke2Jhc2VQYXRofS5uZ0RldlNhdmVgLCBjb21taXRNZXNzYWdlKTtcbn1cbiJdfQ==