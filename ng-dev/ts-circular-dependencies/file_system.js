"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPathToForwardSlash = exports.getFileStatus = void 0;
const fs_1 = require("fs");
/** Gets the status of the specified file. Returns null if the file does not exist. */
function getFileStatus(filePath) {
    try {
        return fs_1.statSync(filePath);
    }
    catch {
        return null;
    }
}
exports.getFileStatus = getFileStatus;
/** Ensures that the specified path uses forward slashes as delimiter. */
function convertPathToForwardSlash(path) {
    return path.replace(/\\/g, '/');
}
exports.convertPathToForwardSlash = convertPathToForwardSlash;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFtQztBQUVuQyxzRkFBc0Y7QUFDdEYsU0FBZ0IsYUFBYSxDQUFDLFFBQWdCO0lBQzVDLElBQUk7UUFDRixPQUFPLGFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzQjtJQUFDLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQztLQUNiO0FBQ0gsQ0FBQztBQU5ELHNDQU1DO0FBRUQseUVBQXlFO0FBQ3pFLFNBQWdCLHlCQUF5QixDQUFDLElBQVk7SUFDcEQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNsQyxDQUFDO0FBRkQsOERBRUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtTdGF0cywgc3RhdFN5bmN9IGZyb20gJ2ZzJztcblxuLyoqIEdldHMgdGhlIHN0YXR1cyBvZiB0aGUgc3BlY2lmaWVkIGZpbGUuIFJldHVybnMgbnVsbCBpZiB0aGUgZmlsZSBkb2VzIG5vdCBleGlzdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWxlU3RhdHVzKGZpbGVQYXRoOiBzdHJpbmcpOiBTdGF0cyB8IG51bGwge1xuICB0cnkge1xuICAgIHJldHVybiBzdGF0U3luYyhmaWxlUGF0aCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKiBFbnN1cmVzIHRoYXQgdGhlIHNwZWNpZmllZCBwYXRoIHVzZXMgZm9yd2FyZCBzbGFzaGVzIGFzIGRlbGltaXRlci4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHBhdGg6IHN0cmluZykge1xuICByZXR1cm4gcGF0aC5yZXBsYWNlKC9cXFxcL2csICcvJyk7XG59XG4iXX0=