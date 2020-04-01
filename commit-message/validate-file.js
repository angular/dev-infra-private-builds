(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-file", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/commit-message/validate"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var fs_1 = require("fs");
    var path_1 = require("path");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    /** Validate commit message at the provided file path. */
    function validateFile(filePath) {
        var commitMessage = fs_1.readFileSync(path_1.join(config_1.getRepoBaseDir(), filePath), 'utf8');
        if (validate_1.validateCommitMessage(commitMessage)) {
            console.info('√  Valid commit message');
        }
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDZCQUEwQjtJQUUxQixrRUFBK0M7SUFFL0MsK0VBQWlEO0lBRWpELHlEQUF5RDtJQUN6RCxTQUFnQixZQUFZLENBQUMsUUFBZ0I7UUFDM0MsSUFBTSxhQUFhLEdBQUcsaUJBQVksQ0FBQyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLElBQUksZ0NBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1NBQ3pDO0lBQ0gsQ0FBQztJQUxELG9DQUtDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7Z2V0UmVwb0Jhc2VEaXJ9IGZyb20gJy4uL3V0aWxzL2NvbmZpZyc7XG5cbmltcG9ydCB7dmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLyoqIFZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlIGF0IHRoZSBwcm92aWRlZCBmaWxlIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IHJlYWRGaWxlU3luYyhqb2luKGdldFJlcG9CYXNlRGlyKCksIGZpbGVQYXRoKSwgJ3V0ZjgnKTtcbiAgaWYgKHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKSkge1xuICAgIGNvbnNvbGUuaW5mbygn4oiaICBWYWxpZCBjb21taXQgbWVzc2FnZScpO1xuICB9XG59XG4iXX0=