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
            return;
        }
        // If the validation did not return true, exit as a failure.
        process.exit(1);
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gseUJBQWdDO0lBQ2hDLDZCQUEwQjtJQUUxQixrRUFBK0M7SUFFL0MsK0VBQWlEO0lBRWpELHlEQUF5RDtJQUN6RCxTQUFnQixZQUFZLENBQUMsUUFBZ0I7UUFDM0MsSUFBTSxhQUFhLEdBQUcsaUJBQVksQ0FBQyxXQUFJLENBQUMsdUJBQWMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQzdFLElBQUksZ0NBQXFCLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDeEMsT0FBTyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3hDLE9BQU87U0FDUjtRQUNELDREQUE0RDtRQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7SUFSRCxvQ0FRQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi92YWxpZGF0ZSc7XG5cbi8qKiBWYWxpZGF0ZSBjb21taXQgbWVzc2FnZSBhdCB0aGUgcHJvdmlkZWQgZmlsZSBwYXRoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSByZWFkRmlsZVN5bmMoam9pbihnZXRSZXBvQmFzZURpcigpLCBmaWxlUGF0aCksICd1dGY4Jyk7XG4gIGlmICh2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoY29tbWl0TWVzc2FnZSkpIHtcbiAgICBjb25zb2xlLmluZm8oJ+KImiAgVmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIHZhbGlkYXRpb24gZGlkIG5vdCByZXR1cm4gdHJ1ZSwgZXhpdCBhcyBhIGZhaWx1cmUuXG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==