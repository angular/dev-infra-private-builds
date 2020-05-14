/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/ts-circular-dependencies/file_system", ["require", "exports", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertPathToForwardSlash = exports.getFileStatus = void 0;
    var fs_1 = require("fs");
    /** Gets the status of the specified file. Returns null if the file does not exist. */
    function getFileStatus(filePath) {
        try {
            return fs_1.statSync(filePath);
        }
        catch (_a) {
            return null;
        }
    }
    exports.getFileStatus = getFileStatus;
    /** Ensures that the specified path uses forward slashes as delimiter. */
    function convertPathToForwardSlash(path) {
        return path.replace(/\\/g, '/');
    }
    exports.convertPathToForwardSlash = convertPathToForwardSlash;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlCQUFtQztJQUVuQyxzRkFBc0Y7SUFDdEYsU0FBZ0IsYUFBYSxDQUFDLFFBQWdCO1FBQzVDLElBQUk7WUFDRixPQUFPLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMzQjtRQUFDLFdBQU07WUFDTixPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQU5ELHNDQU1DO0lBRUQseUVBQXlFO0lBQ3pFLFNBQWdCLHlCQUF5QixDQUFDLElBQVk7UUFDcEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7U3RhdHMsIHN0YXRTeW5jfSBmcm9tICdmcyc7XG5cbi8qKiBHZXRzIHRoZSBzdGF0dXMgb2YgdGhlIHNwZWNpZmllZCBmaWxlLiBSZXR1cm5zIG51bGwgaWYgdGhlIGZpbGUgZG9lcyBub3QgZXhpc3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RmlsZVN0YXR1cyhmaWxlUGF0aDogc3RyaW5nKTogU3RhdHN8bnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIEVuc3VyZXMgdGhhdCB0aGUgc3BlY2lmaWVkIHBhdGggdXNlcyBmb3J3YXJkIHNsYXNoZXMgYXMgZGVsaW1pdGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cbiJdfQ==