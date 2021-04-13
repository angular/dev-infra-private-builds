(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/release-notes/release-notes", ["require", "exports", "tslib", "ejs", "path", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/config", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/release-notes/context"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotes = exports.getLocalChangelogFilePath = exports.getDefaultExtractReleaseNotesPattern = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ejs_1 = require("ejs");
    var path_1 = require("path");
    var utils_1 = require("@angular/dev-infra-private/commit-message/utils");
    var config_1 = require("@angular/dev-infra-private/utils/config");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var index_2 = require("@angular/dev-infra-private/release/config");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    var context_1 = require("@angular/dev-infra-private/release/publish/release-notes/context");
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
    /** Release note generation. */
    var ReleaseNotes = /** @class */ (function () {
        function ReleaseNotes(version) {
            this.version = version;
            /** An instance of GitClient. */
            this.git = index_1.GitClient.getInstance();
            /** The github configuration. */
            this.github = config_1.getConfig().github;
            /** The configuration for the release notes generation. */
            // TODO(josephperrott): Remove non-null assertion after usage of ReleaseNotes is integrated into
            // release publish tooling.
            this.config = index_2.getReleaseConfig().releaseNotes || {};
            /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
            this.commits = utils_1.getCommitsInRange(this.git.getLatestSemverTag().format(), 'HEAD');
        }
        /** Retrieve the release note generated for a Github Release. */
        ReleaseNotes.prototype.getGithubReleaseEntry = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = ejs_1.renderFile;
                            _b = [path_1.join(__dirname, 'templates/github-release.ejs')];
                            return [4 /*yield*/, this.generateRenderContext()];
                        case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                        case 2: return [2 /*return*/, _c.sent()];
                    }
                });
            });
        };
        /** Retrieve the release note generated for a CHANGELOG entry. */
        ReleaseNotes.prototype.getChangelogEntry = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = ejs_1.renderFile;
                            _b = [path_1.join(__dirname, 'templates/changelog.ejs')];
                            return [4 /*yield*/, this.generateRenderContext()];
                        case 1: return [4 /*yield*/, _a.apply(void 0, _b.concat([_c.sent()]))];
                        case 2: return [2 /*return*/, _c.sent()];
                    }
                });
            });
        };
        /**
         * Prompt the user for a title for the release, if the project's configuration is defined to use a
         * title.
         */
        ReleaseNotes.prototype.promptForReleaseTitle = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!(this.title === undefined)) return [3 /*break*/, 3];
                            if (!this.config.useReleaseTitle) return [3 /*break*/, 2];
                            _a = this;
                            return [4 /*yield*/, console_1.promptInput('Please provide a title for the release:')];
                        case 1:
                            _a.title = _b.sent();
                            return [3 /*break*/, 3];
                        case 2:
                            this.title = false;
                            _b.label = 3;
                        case 3: return [2 /*return*/, this.title];
                    }
                });
            });
        };
        /** Build the render context data object for constructing the RenderContext instance. */
        ReleaseNotes.prototype.generateRenderContext = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b;
                var _c;
                return tslib_1.__generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            if (!!this.renderContext) return [3 /*break*/, 3];
                            _a = this;
                            _b = context_1.RenderContext.bind;
                            _c = {};
                            return [4 /*yield*/, this.commits];
                        case 1:
                            _c.commits = _d.sent(),
                                _c.github = config_1.getConfig().github,
                                _c.version = this.version.format(),
                                _c.groupOrder = this.config.groupOrder,
                                _c.hiddenScopes = this.config.hiddenScopes;
                            return [4 /*yield*/, this.promptForReleaseTitle()];
                        case 2:
                            _a.renderContext = new (_b.apply(context_1.RenderContext, [void 0, (_c.title = _d.sent(),
                                    _c)]))();
                            _d.label = 3;
                        case 3: return [2 /*return*/, this.renderContext];
                    }
                });
            });
        };
        return ReleaseNotes;
    }());
    exports.ReleaseNotes = ReleaseNotes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBK0I7SUFDL0IsNkJBQTBCO0lBRzFCLHlFQUFnRTtJQUNoRSxrRUFBZ0Q7SUFDaEQsb0VBQW1EO0lBQ25ELG9FQUFtRDtJQUNuRCxtRUFBb0Q7SUFDcEQsa0ZBQTJDO0lBQzNDLDRGQUF3QztJQUd4Qzs7O09BR0c7SUFDSCxTQUFnQixvQ0FBb0MsQ0FBQyxPQUFzQjtRQUN6RSxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCx5RkFBeUY7UUFDekYsNkZBQTZGO1FBQzdGLE9BQU8sSUFBSSxNQUFNLENBQUMsZ0JBQWEsY0FBYyxnQ0FBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBTEQsb0ZBS0M7SUFFRCwrREFBK0Q7SUFDL0QsU0FBZ0IseUJBQXlCLENBQUMsVUFBa0I7UUFDMUQsT0FBTyxXQUFJLENBQUMsVUFBVSxFQUFFLHlCQUFhLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRkQsOERBRUM7SUFHRCwrQkFBK0I7SUFDL0I7UUFnQkUsc0JBQW9CLE9BQXNCO1lBQXRCLFlBQU8sR0FBUCxPQUFPLENBQWU7WUFmMUMsZ0NBQWdDO1lBQ3hCLFFBQUcsR0FBRyxpQkFBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3RDLGdDQUFnQztZQUNmLFdBQU0sR0FBRyxrQkFBUyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQzdDLDBEQUEwRDtZQUMxRCxnR0FBZ0c7WUFDaEcsMkJBQTJCO1lBQ1YsV0FBTSxHQUFHLHdCQUFnQixFQUFFLENBQUMsWUFBYSxJQUFJLEVBQUUsQ0FBQztZQUNqRSwwRkFBMEY7WUFDbEYsWUFBTyxHQUFHLHlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQU12QyxDQUFDO1FBRTlDLGdFQUFnRTtRQUMxRCw0Q0FBcUIsR0FBM0I7Ozs7Ozs0QkFDZSxLQUFBLGdCQUFVLENBQUE7a0NBQ25CLFdBQUksQ0FBQyxTQUFTLEVBQUUsOEJBQThCLENBQUM7NEJBQUUscUJBQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUE7Z0NBRGhGLHFCQUFNLDRCQUN3QyxTQUFrQyxHQUFDLEVBQUE7Z0NBRHhGLHNCQUFPLFNBQ2lGLEVBQUM7Ozs7U0FDMUY7UUFFRCxpRUFBaUU7UUFDM0Qsd0NBQWlCLEdBQXZCOzs7Ozs7NEJBQ2UsS0FBQSxnQkFBVSxDQUFBO2tDQUNuQixXQUFJLENBQUMsU0FBUyxFQUFFLHlCQUF5QixDQUFDOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQUQzRSxxQkFBTSw0QkFDbUMsU0FBa0MsR0FBQyxFQUFBO2dDQURuRixzQkFBTyxTQUM0RSxFQUFDOzs7O1NBQ3JGO1FBRUQ7OztXQUdHO1FBQ0csNENBQXFCLEdBQTNCOzs7Ozs7aUNBQ00sQ0FBQSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsQ0FBQSxFQUF4Qix3QkFBd0I7aUNBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUEzQix3QkFBMkI7NEJBQzdCLEtBQUEsSUFBSSxDQUFBOzRCQUFTLHFCQUFNLHFCQUFXLENBQUMseUNBQXlDLENBQUMsRUFBQTs7NEJBQXpFLEdBQUssS0FBSyxHQUFHLFNBQTRELENBQUM7Ozs0QkFFMUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7O2dDQUd2QixzQkFBTyxJQUFJLENBQUMsS0FBSyxFQUFDOzs7O1NBQ25CO1FBRUQsd0ZBQXdGO1FBQzFFLDRDQUFxQixHQUFuQzs7Ozs7OztpQ0FDTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQW5CLHdCQUFtQjs0QkFDckIsS0FBQSxJQUFJLENBQUE7aUNBQXFCLHVCQUFhOzs0QkFDM0IscUJBQU0sSUFBSSxDQUFDLE9BQU8sRUFBQTs7NEJBQTNCLFVBQU8sR0FBRSxTQUFrQjtnQ0FDM0IsU0FBTSxHQUFFLGtCQUFTLEVBQUUsQ0FBQyxNQUFNO2dDQUMxQixVQUFPLEdBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0NBQzlCLGFBQVUsR0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0NBQ2xDLGVBQVksR0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7NEJBQy9CLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBOzs0QkFOM0MsR0FBSyxhQUFhLEdBQUcsY0FBSSx1QkFBYSxZQU1wQyxRQUFLLEdBQUUsU0FBa0M7NENBQ3pDLENBQUM7O2dDQUVMLHNCQUFPLElBQUksQ0FBQyxhQUFhLEVBQUM7Ozs7U0FDM0I7UUFDSCxtQkFBQztJQUFELENBQUMsQUEzREQsSUEyREM7SUEzRFksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyRmlsZX0gZnJvbSAnZWpzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtnZXRDb25maWd9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbmZpZyc7XG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtnZXRSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtjaGFuZ2Vsb2dQYXRofSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5cbi8qKlxuICogR2V0cyB0aGUgZGVmYXVsdCBwYXR0ZXJuIGZvciBleHRyYWN0aW5nIHJlbGVhc2Ugbm90ZXMgZm9yIHRoZSBnaXZlbiB2ZXJzaW9uLlxuICogVGhpcyBwYXR0ZXJuIG1hdGNoZXMgZm9yIHRoZSBjb252ZW50aW9uYWwtY2hhbmdlbG9nIEFuZ3VsYXIgcHJlc2V0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEV4dHJhY3RSZWxlYXNlTm90ZXNQYXR0ZXJuKHZlcnNpb246IHNlbXZlci5TZW1WZXIpOiBSZWdFeHAge1xuICBjb25zdCBlc2NhcGVkVmVyc2lvbiA9IHZlcnNpb24uZm9ybWF0KCkucmVwbGFjZSgnLicsICdcXFxcLicpO1xuICAvLyBUT0RPOiBDaGFuZ2UgdGhpcyBvbmNlIHdlIGhhdmUgYSBjYW5vbmljYWwgY2hhbmdlbG9nIGdlbmVyYXRpb24gdG9vbC4gQWxzbyB1cGRhdGUgdGhpc1xuICAvLyBiYXNlZCBvbiB0aGUgY29udmVudGlvbmFsLWNoYW5nZWxvZyB2ZXJzaW9uLiBUaGV5IHJlbW92ZWQgYW5jaG9ycyBpbiBtb3JlIHJlY2VudCB2ZXJzaW9ucy5cbiAgcmV0dXJuIG5ldyBSZWdFeHAoYCg8YSBuYW1lPVwiJHtlc2NhcGVkVmVyc2lvbn1cIj48L2E+Lio/KSg/OjxhIG5hbWU9XCJ8JClgLCAncycpO1xufVxuXG4vKiogR2V0cyB0aGUgcGF0aCBmb3IgdGhlIGNoYW5nZWxvZyBmaWxlIGluIGEgZ2l2ZW4gcHJvamVjdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRMb2NhbENoYW5nZWxvZ0ZpbGVQYXRoKHByb2plY3REaXI6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBqb2luKHByb2plY3REaXIsIGNoYW5nZWxvZ1BhdGgpO1xufVxuXG5cbi8qKiBSZWxlYXNlIG5vdGUgZ2VuZXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBSZWxlYXNlTm90ZXMge1xuICAvKiogQW4gaW5zdGFuY2Ugb2YgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAvKiogVGhlIGdpdGh1YiBjb25maWd1cmF0aW9uLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IGdpdGh1YiA9IGdldENvbmZpZygpLmdpdGh1YjtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgcmVsZWFzZSBub3RlcyBnZW5lcmF0aW9uLiAqL1xuICAvLyBUT0RPKGpvc2VwaHBlcnJvdHQpOiBSZW1vdmUgbm9uLW51bGwgYXNzZXJ0aW9uIGFmdGVyIHVzYWdlIG9mIFJlbGVhc2VOb3RlcyBpcyBpbnRlZ3JhdGVkIGludG9cbiAgLy8gcmVsZWFzZSBwdWJsaXNoIHRvb2xpbmcuXG4gIHByaXZhdGUgcmVhZG9ubHkgY29uZmlnID0gZ2V0UmVsZWFzZUNvbmZpZygpLnJlbGVhc2VOb3RlcyEgfHwge307XG4gIC8qKiBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgbGlzdCBvZiBDb21taXRzIHNpbmNlIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoLiAqL1xuICBwcml2YXRlIGNvbW1pdHMgPSBnZXRDb21taXRzSW5SYW5nZSh0aGlzLmdpdC5nZXRMYXRlc3RTZW12ZXJUYWcoKS5mb3JtYXQoKSwgJ0hFQUQnKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0fHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmd8ZmFsc2V8dW5kZWZpbmVkO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdmVyc2lvbjogc2VtdmVyLlNlbVZlcikge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBhd2FpdCByZW5kZXJGaWxlKFxuICAgICAgICBqb2luKF9fZGlybmFtZSwgJ3RlbXBsYXRlcy9naXRodWItcmVsZWFzZS5lanMnKSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gYXdhaXQgcmVuZGVyRmlsZShcbiAgICAgICAgam9pbihfX2Rpcm5hbWUsICd0ZW1wbGF0ZXMvY2hhbmdlbG9nLmVqcycpLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcudXNlUmVsZWFzZVRpdGxlKSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBhd2FpdCBwcm9tcHRJbnB1dCgnUGxlYXNlIHByb3ZpZGUgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2U6Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpdGxlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnRpdGxlO1xuICB9XG5cbiAgLyoqIEJ1aWxkIHRoZSByZW5kZXIgY29udGV4dCBkYXRhIG9iamVjdCBmb3IgY29uc3RydWN0aW5nIHRoZSBSZW5kZXJDb250ZXh0IGluc3RhbmNlLiAqL1xuICBwcml2YXRlIGFzeW5jIGdlbmVyYXRlUmVuZGVyQ29udGV4dCgpOiBQcm9taXNlPFJlbmRlckNvbnRleHQ+IHtcbiAgICBpZiAoIXRoaXMucmVuZGVyQ29udGV4dCkge1xuICAgICAgdGhpcy5yZW5kZXJDb250ZXh0ID0gbmV3IFJlbmRlckNvbnRleHQoe1xuICAgICAgICBjb21taXRzOiBhd2FpdCB0aGlzLmNvbW1pdHMsXG4gICAgICAgIGdpdGh1YjogZ2V0Q29uZmlnKCkuZ2l0aHViLFxuICAgICAgICB2ZXJzaW9uOiB0aGlzLnZlcnNpb24uZm9ybWF0KCksXG4gICAgICAgIGdyb3VwT3JkZXI6IHRoaXMuY29uZmlnLmdyb3VwT3JkZXIsXG4gICAgICAgIGhpZGRlblNjb3BlczogdGhpcy5jb25maWcuaGlkZGVuU2NvcGVzLFxuICAgICAgICB0aXRsZTogYXdhaXQgdGhpcy5wcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb250ZXh0O1xuICB9XG59XG4iXX0=