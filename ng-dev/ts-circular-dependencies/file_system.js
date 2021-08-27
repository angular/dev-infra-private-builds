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
        return (0, fs_1.statSync)(filePath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFtQztBQUVuQyxzRkFBc0Y7QUFDdEYsU0FBZ0IsYUFBYSxDQUFDLFFBQWdCO0lBQzVDLElBQUk7UUFDRixPQUFPLElBQUEsYUFBUSxFQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzNCO0lBQUMsTUFBTTtRQUNOLE9BQU8sSUFBSSxDQUFDO0tBQ2I7QUFDSCxDQUFDO0FBTkQsc0NBTUM7QUFFRCx5RUFBeUU7QUFDekUsU0FBZ0IseUJBQXlCLENBQUMsSUFBWTtJQUNwRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFGRCw4REFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1N0YXRzLCBzdGF0U3luY30gZnJvbSAnZnMnO1xuXG4vKiogR2V0cyB0aGUgc3RhdHVzIG9mIHRoZSBzcGVjaWZpZWQgZmlsZS4gUmV0dXJucyBudWxsIGlmIHRoZSBmaWxlIGRvZXMgbm90IGV4aXN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVTdGF0dXMoZmlsZVBhdGg6IHN0cmluZyk6IFN0YXRzIHwgbnVsbCB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHN0YXRTeW5jKGZpbGVQYXRoKTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqIEVuc3VyZXMgdGhhdCB0aGUgc3BlY2lmaWVkIHBhdGggdXNlcyBmb3J3YXJkIHNsYXNoZXMgYXMgZGVsaW1pdGVyLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocGF0aDogc3RyaW5nKSB7XG4gIHJldHVybiBwYXRoLnJlcGxhY2UoL1xcXFwvZywgJy8nKTtcbn1cbiJdfQ==