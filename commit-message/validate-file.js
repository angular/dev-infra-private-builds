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
     * Copyright Google Inc. All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBQy9DLG9FQUFzQztJQUV0QywrRUFBaUQ7SUFFakQseURBQXlEO0lBQ3pELFNBQWdCLFlBQVksQ0FBQyxRQUFnQjtRQUMzQyxJQUFNLGFBQWEsR0FBRyxpQkFBWSxDQUFDLGNBQU8sQ0FBQyx1QkFBYyxFQUFFLEVBQUUsUUFBUSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDaEYsSUFBSSxnQ0FBcUIsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUN4QyxjQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUNoQyxPQUFPO1NBQ1I7UUFDRCw0REFBNEQ7UUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBUkQsb0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5cbmltcG9ydCB7dmFsaWRhdGVDb21taXRNZXNzYWdlfSBmcm9tICcuL3ZhbGlkYXRlJztcblxuLyoqIFZhbGlkYXRlIGNvbW1pdCBtZXNzYWdlIGF0IHRoZSBwcm92aWRlZCBmaWxlIHBhdGguICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVGaWxlKGZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tbWl0TWVzc2FnZSA9IHJlYWRGaWxlU3luYyhyZXNvbHZlKGdldFJlcG9CYXNlRGlyKCksIGZpbGVQYXRoKSwgJ3V0ZjgnKTtcbiAgaWYgKHZhbGlkYXRlQ29tbWl0TWVzc2FnZShjb21taXRNZXNzYWdlKSkge1xuICAgIGluZm8oJ+KImiAgVmFsaWQgY29tbWl0IG1lc3NhZ2UnKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gSWYgdGhlIHZhbGlkYXRpb24gZGlkIG5vdCByZXR1cm4gdHJ1ZSwgZXhpdCBhcyBhIGZhaWx1cmUuXG4gIHByb2Nlc3MuZXhpdCgxKTtcbn1cbiJdfQ==