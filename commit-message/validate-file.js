(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/commit-message/validate-file", ["require", "exports", "fs", "path", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/commit-message/validate"], factory);
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
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var validate_1 = require("@angular/dev-infra-private/commit-message/validate");
    /** Validate commit message at the provided file path. */
    function validateFile(filePath) {
        var commitMessage = fs_1.readFileSync(path_1.resolve(config_1.getRepoBaseDir(), filePath), 'utf8');
        if (validate_1.validateCommitMessage(commitMessage)) {
            console_1.info('√  Valid commit message');
            return;
        }
        // If the validation did not return true, exit as a failure.
        process.exit(1);
    }
    exports.validateFile = validateFile;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBQy9DLG9FQUFzQztJQUV0QywrRUFBaUQ7SUFFakQseURBQXlEO0lBQ3pELFNBQWdCLFlBQVksQ0FBQyxRQUFnQjtRQUMzQyxJQUFNLGFBQWEsR0FBRyxpQkFBWSxDQUFDLGNBQU8sQ0FBQyx1QkFBYyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEYsSUFBSSxnQ0FBcUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN4QyxjQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNoQyxPQUFPO1NBQ1I7UUFDRCw0REFBNEQ7UUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBUkQsb0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge3Jlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2dldFJlcG9CYXNlRGlyfSBmcm9tICcuLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vdmFsaWRhdGUnO1xuXG4vKiogVmFsaWRhdGUgY29tbWl0IG1lc3NhZ2UgYXQgdGhlIHByb3ZpZGVkIGZpbGUgcGF0aC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoZ2V0UmVwb0Jhc2VEaXIoKSwgZmlsZVBhdGgpLCAndXRmOCcpO1xuICBpZiAodmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2UpKSB7XG4gICAgaW5mbygn4oiaICBWYWxpZCBjb21taXQgbWVzc2FnZScpO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBJZiB0aGUgdmFsaWRhdGlvbiBkaWQgbm90IHJldHVybiB0cnVlLCBleGl0IGFzIGEgZmFpbHVyZS5cbiAgcHJvY2Vzcy5leGl0KDEpO1xufVxuIl19