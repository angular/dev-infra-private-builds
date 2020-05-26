/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlCQUFtQztJQUVuQyxzRkFBc0Y7SUFDdEYsU0FBZ0IsYUFBYSxDQUFDLFFBQWdCO1FBQzVDLElBQUk7WUFDRixPQUFPLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUMzQjtRQUFDLFdBQU07WUFDTixPQUFPLElBQUksQ0FBQztTQUNiO0lBQ0gsQ0FBQztJQU5ELHNDQU1DO0lBRUQseUVBQXlFO0lBQ3pFLFNBQWdCLHlCQUF5QixDQUFDLElBQVk7UUFDcEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0cywgc3RhdFN5bmN9IGZyb20gJ2ZzJztcblxuLyoqIEdldHMgdGhlIHN0YXR1cyBvZiB0aGUgc3BlY2lmaWVkIGZpbGUuIFJldHVybnMgbnVsbCBpZiB0aGUgZmlsZSBkb2VzIG5vdCBleGlzdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlU3RhdHVzKGZpbGVQYXRoOiBzdHJpbmcpOiBTdGF0c3xudWxsIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gc3RhdFN5bmMoZmlsZVBhdGgpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKiogRW5zdXJlcyB0aGF0IHRoZSBzcGVjaWZpZWQgcGF0aCB1c2VzIGZvcndhcmQgc2xhc2hlcyBhcyBkZWxpbWl0ZXIuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChwYXRoOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHBhdGgucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xufVxuIl19