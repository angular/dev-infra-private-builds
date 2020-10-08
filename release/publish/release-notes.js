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
        define("@angular/dev-infra-private/release/publish/release-notes", ["require", "exports", "path", "@angular/dev-infra-private/release/publish/constants"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLocalChangelogFilePath = exports.getDefaultExtractReleaseNotesPattern = void 0;
    var path_1 = require("path");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    /**
     * Gets the default pattern for extracting release notes for the given version.
     * This pattern matches for the conventional-changelog Angular preset.
     */
    function getDefaultExtractReleaseNotesPattern(version) {
        var escapedVersion = version.format().replace('.', '\\.');
        // TODO: Change this once we have a canonical changelog generation tool. Also update this
        // based on the conventional-changelog version. They removed anchors in more recent versions.
        return new RegExp("(<a name=\"" + escapedVersion + "\"></a>.*?)(?:<a name=\"|$)", 's');
    }
    exports.getDefaultExtractReleaseNotesPattern = getDefaultExtractReleaseNotesPattern;
    /** Gets the path for the changelog file in a given project. */
    function getLocalChangelogFilePath(projectDir) {
        return path_1.join(projectDir, constants_1.changelogPath);
    }
    exports.getLocalChangelogFilePath = getLocalChangelogFilePath;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCw2QkFBMEI7SUFFMUIsa0ZBQTBDO0lBRTFDOzs7T0FHRztJQUNILFNBQWdCLG9DQUFvQyxDQUFDLE9BQXNCO1FBQ3pFLElBQU0sY0FBYyxHQUFHLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELHlGQUF5RjtRQUN6Riw2RkFBNkY7UUFDN0YsT0FBTyxJQUFJLE1BQU0sQ0FBQyxnQkFBYSxjQUFjLGdDQUEyQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFMRCxvRkFLQztJQUVELCtEQUErRDtJQUMvRCxTQUFnQix5QkFBeUIsQ0FBQyxVQUFrQjtRQUMxRCxPQUFPLFdBQUksQ0FBQyxVQUFVLEVBQUUseUJBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFGRCw4REFFQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGh9IGZyb20gJy4vY29uc3RhbnRzJztcblxuLyoqXG4gKiBHZXRzIHRoZSBkZWZhdWx0IHBhdHRlcm4gZm9yIGV4dHJhY3RpbmcgcmVsZWFzZSBub3RlcyBmb3IgdGhlIGdpdmVuIHZlcnNpb24uXG4gKiBUaGlzIHBhdHRlcm4gbWF0Y2hlcyBmb3IgdGhlIGNvbnZlbnRpb25hbC1jaGFuZ2Vsb2cgQW5ndWxhciBwcmVzZXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0RXh0cmFjdFJlbGVhc2VOb3Rlc1BhdHRlcm4odmVyc2lvbjogc2VtdmVyLlNlbVZlcik6IFJlZ0V4cCB7XG4gIGNvbnN0IGVzY2FwZWRWZXJzaW9uID0gdmVyc2lvbi5mb3JtYXQoKS5yZXBsYWNlKCcuJywgJ1xcXFwuJyk7XG4gIC8vIFRPRE86IENoYW5nZSB0aGlzIG9uY2Ugd2UgaGF2ZSBhIGNhbm9uaWNhbCBjaGFuZ2Vsb2cgZ2VuZXJhdGlvbiB0b29sLiBBbHNvIHVwZGF0ZSB0aGlzXG4gIC8vIGJhc2VkIG9uIHRoZSBjb252ZW50aW9uYWwtY2hhbmdlbG9nIHZlcnNpb24uIFRoZXkgcmVtb3ZlZCBhbmNob3JzIGluIG1vcmUgcmVjZW50IHZlcnNpb25zLlxuICByZXR1cm4gbmV3IFJlZ0V4cChgKDxhIG5hbWU9XCIke2VzY2FwZWRWZXJzaW9ufVwiPjwvYT4uKj8pKD86PGEgbmFtZT1cInwkKWAsICdzJyk7XG59XG5cbi8qKiBHZXRzIHRoZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUgaW4gYSBnaXZlbiBwcm9qZWN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgocHJvamVjdERpcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGpvaW4ocHJvamVjdERpciwgY2hhbmdlbG9nUGF0aCk7XG59XG4iXX0=