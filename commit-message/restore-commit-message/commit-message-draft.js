(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/restore-commit-message/commit-message-draft", ["require", "exports", "fs"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWl0LW1lc3NhZ2UtZHJhZnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvY29tbWl0LW1lc3NhZ2UvcmVzdG9yZS1jb21taXQtbWVzc2FnZS9jb21taXQtbWVzc2FnZS1kcmFmdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCx5QkFBdUU7SUFFdkUsdUVBQXVFO0lBQ3ZFLFNBQWdCLHNCQUFzQixDQUFDLFFBQWdCO1FBQ3JELElBQU0sc0JBQXNCLEdBQU0sUUFBUSxlQUFZLENBQUM7UUFDdkQsSUFBSSxlQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRTtZQUN0QyxPQUFPLGlCQUFZLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUN4RDtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQU5ELHdEQU1DO0lBRUQsNERBQTREO0lBQzVELFNBQWdCLHdCQUF3QixDQUFDLFFBQWdCO1FBQ3ZELElBQU0sc0JBQXNCLEdBQU0sUUFBUSxlQUFZLENBQUM7UUFDdkQsSUFBSSxlQUFVLENBQUMsc0JBQXNCLENBQUMsRUFBRTtZQUN0QyxlQUFVLENBQUMsc0JBQXNCLENBQUMsQ0FBQztTQUNwQztJQUNILENBQUM7SUFMRCw0REFLQztJQUVELDRFQUE0RTtJQUM1RSxTQUFnQixzQkFBc0IsQ0FBQyxRQUFnQixFQUFFLGFBQXFCO1FBQzVFLGtCQUFhLENBQUksUUFBUSxlQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDeEQsQ0FBQztJQUZELHdEQUVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2V4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgdW5saW5rU3luYywgd3JpdGVGaWxlU3luY30gZnJvbSAnZnMnO1xuXG4vKiogTG9hZCB0aGUgY29tbWl0IG1lc3NhZ2UgZHJhZnQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0gaWYgaXQgZXhpc3RzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRDb21taXRNZXNzYWdlRHJhZnQoYmFzZVBhdGg6IHN0cmluZykge1xuICBjb25zdCBjb21taXRNZXNzYWdlRHJhZnRQYXRoID0gYCR7YmFzZVBhdGh9Lm5nRGV2U2F2ZWA7XG4gIGlmIChleGlzdHNTeW5jKGNvbW1pdE1lc3NhZ2VEcmFmdFBhdGgpKSB7XG4gICAgcmV0dXJuIHJlYWRGaWxlU3luYyhjb21taXRNZXNzYWdlRHJhZnRQYXRoKS50b1N0cmluZygpO1xuICB9XG4gIHJldHVybiAnJztcbn1cblxuLyoqIFJlbW92ZSB0aGUgY29tbWl0IG1lc3NhZ2UgZHJhZnQgZnJvbSB0aGUgZmlsZSBzeXN0ZW0uICovXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlQ29tbWl0TWVzc2FnZURyYWZ0KGJhc2VQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tbWl0TWVzc2FnZURyYWZ0UGF0aCA9IGAke2Jhc2VQYXRofS5uZ0RldlNhdmVgO1xuICBpZiAoZXhpc3RzU3luYyhjb21taXRNZXNzYWdlRHJhZnRQYXRoKSkge1xuICAgIHVubGlua1N5bmMoY29tbWl0TWVzc2FnZURyYWZ0UGF0aCk7XG4gIH1cbn1cblxuLyoqIFNhdmUgdGhlIGNvbW1pdCBtZXNzYWdlIGRyYWZ0IHRvIHRoZSBmaWxlIHN5c3RlbSBmb3IgbGF0ZXIgcmV0cmlldmFsLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNhdmVDb21taXRNZXNzYWdlRHJhZnQoYmFzZVBhdGg6IHN0cmluZywgY29tbWl0TWVzc2FnZTogc3RyaW5nKSB7XG4gIHdyaXRlRmlsZVN5bmMoYCR7YmFzZVBhdGh9Lm5nRGV2U2F2ZWAsIGNvbW1pdE1lc3NhZ2UpO1xufVxuIl19