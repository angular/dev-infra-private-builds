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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdGUtZmlsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9jb21taXQtbWVzc2FnZS92YWxpZGF0ZS1maWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILHlCQUFnQztJQUNoQyw2QkFBNkI7SUFFN0Isa0VBQStDO0lBRS9DLCtFQUFpRDtJQUVqRCx5REFBeUQ7SUFDekQsU0FBZ0IsWUFBWSxDQUFDLFFBQWdCO1FBQzNDLElBQU0sYUFBYSxHQUFHLGlCQUFZLENBQUMsY0FBTyxDQUFDLHVCQUFjLEVBQUUsRUFBRSxRQUFRLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNoRixJQUFJLGdDQUFxQixDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUN4QyxPQUFPO1NBQ1I7UUFDRCw0REFBNEQ7UUFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsQixDQUFDO0lBUkQsb0NBUUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtyZXNvbHZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtnZXRSZXBvQmFzZURpcn0gZnJvbSAnLi4vdXRpbHMvY29uZmlnJztcblxuaW1wb3J0IHt2YWxpZGF0ZUNvbW1pdE1lc3NhZ2V9IGZyb20gJy4vdmFsaWRhdGUnO1xuXG4vKiogVmFsaWRhdGUgY29tbWl0IG1lc3NhZ2UgYXQgdGhlIHByb3ZpZGVkIGZpbGUgcGF0aC4gKi9cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUZpbGUoZmlsZVBhdGg6IHN0cmluZykge1xuICBjb25zdCBjb21taXRNZXNzYWdlID0gcmVhZEZpbGVTeW5jKHJlc29sdmUoZ2V0UmVwb0Jhc2VEaXIoKSwgZmlsZVBhdGgpLCAndXRmOCcpO1xuICBpZiAodmFsaWRhdGVDb21taXRNZXNzYWdlKGNvbW1pdE1lc3NhZ2UpKSB7XG4gICAgY29uc29sZS5pbmZvKCfiiJogIFZhbGlkIGNvbW1pdCBtZXNzYWdlJyk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIElmIHRoZSB2YWxpZGF0aW9uIGRpZCBub3QgcmV0dXJuIHRydWUsIGV4aXQgYXMgYSBmYWlsdXJlLlxuICBwcm9jZXNzLmV4aXQoMSk7XG59XG4iXX0=