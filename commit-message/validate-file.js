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
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    /** Validate commit message at the provided file path. */
    function validateFile(filePath) {
        var commitMessage = fs_1.readFileSync(path_1.resolve(config_1.getRepoBaseDir(), filePath), 'utf8');
        if (validate_1.validateCommitMessage(commitMessage)) {
            console.info('√  Valid commit message');
            return;
        }
        // If the validation did not return true, exit as a failure.
        process.exit(1);
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBRS9DLCtFQUFpRDtJQUVqRCx5REFBeUQ7SUFDekQsU0FBZ0IsWUFBWSxDQUFDLFFBQWdCO1FBQzNDLElBQU0sYUFBYSxHQUFHLGlCQUFZLENBQUMsY0FBTyxDQUFDLHVCQUFjLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRixJQUFJLGdDQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN4QyxPQUFPO1NBQ1I7UUFDRCw0REFBNEQ7UUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBUkQsb0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuXG5pbXBvcnQge3ZhbGlkYXRlQ29tbWl0TWVzc2FnZX0gZnJvbSAnLi92YWxpZGF0ZSc7XG5cbi8qKiBWYWxpZGF0ZSBjb21taXQgbWVzc2FnZSBhdCB0aGUgcHJvdmlkZWQgZmlsZSBwYXRoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlRmlsZShmaWxlUGF0aDogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbW1pdE1lc3NhZ2UgPSByZWFkRmlsZVN5bmMocmVzb2x2ZShnZXRSZXBvQmFzZURpcigpLCBmaWxlUGF0aCksICd1dGY4Jyk7XG4gIGlmICh2YWxpZGF0ZUNvbW1pdE1lc3NhZ2UoY29tbWl0TWVzc2FnZSkpIHtcbiAgICBjb25zb2xlLmluZm8oJ+KImiAgVmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIHZhbGlkYXRpb24gZGlkIG5vdCByZXR1cm4gdHJ1ZSwgZXhpdCBhcyBhIGZhaWx1cmUuXG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==