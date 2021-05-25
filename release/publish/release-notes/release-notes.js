(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/release-notes/release-notes", ["require", "exports", "tslib", "ejs", "path", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/release-notes/context", "@angular/dev-infra-private/release/publish/release-notes/templates/changelog", "@angular/dev-infra-private/release/publish/release-notes/templates/github-release"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotes = exports.getLocalChangelogFilePath = void 0;
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
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/utils/git/index");
    var index_2 = require("@angular/dev-infra-private/release/config");
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    var context_1 = require("@angular/dev-infra-private/release/publish/release-notes/context");
    var changelog_1 = require("@angular/dev-infra-private/release/publish/release-notes/templates/changelog");
    var github_release_1 = require("@angular/dev-infra-private/release/publish/release-notes/templates/github-release");
    /** Gets the path for the changelog file in a given project. */
    function getLocalChangelogFilePath(projectDir) {
        return path_1.join(projectDir, constants_1.changelogPath);
    }
    exports.getLocalChangelogFilePath = getLocalChangelogFilePath;
    /** Release note generation. */
    var ReleaseNotes = /** @class */ (function () {
        function ReleaseNotes(version, startingRef, endingRef) {
            this.version = version;
            this.startingRef = startingRef;
            this.endingRef = endingRef;
            /** An instance of GitClient. */
            this.git = index_1.GitClient.getInstance();
            /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
            this.commits = this.getCommitsInRange(this.startingRef, this.endingRef);
            /** The configuration for release notes. */
            this.config = this.getReleaseConfig().releaseNotes;
        }
        ReleaseNotes.fromRange = function (version, startingRef, endingRef) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, new ReleaseNotes(version, startingRef, endingRef)];
                });
            });
        };
        /** Retrieve the release note generated for a Github Release. */
        ReleaseNotes.prototype.getGithubReleaseEntry = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return tslib_1.__generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _a = ejs_1.render;
                            _b = [github_release_1.default];
                            return [4 /*yield*/, this.generateRenderContext()];
                        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), { rmWhitespace: true }]))];
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
                            _a = ejs_1.render;
                            _b = [changelog_1.default];
                            return [4 /*yield*/, this.generateRenderContext()];
                        case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent(), { rmWhitespace: true }]))];
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
                                _c.github = this.git.remoteConfig,
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
        // These methods are used for access to the utility functions while allowing them to be
        // overwritten in subclasses during testing.
        ReleaseNotes.prototype.getCommitsInRange = function (from, to) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, utils_1.getCommitsInRange(from, to)];
                });
            });
        };
        ReleaseNotes.prototype.getReleaseConfig = function (config) {
            return index_2.getReleaseConfig(config);
        };
        return ReleaseNotes;
    }());
    exports.ReleaseNotes = ReleaseNotes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBMkI7SUFDM0IsNkJBQTBCO0lBSTFCLHlFQUFnRTtJQUNoRSxvRUFBbUQ7SUFDbkQsb0VBQW1EO0lBQ25ELG1FQUErRjtJQUMvRixrRkFBMkM7SUFDM0MsNEZBQXdDO0lBRXhDLDBHQUFzRDtJQUN0RCxvSEFBK0Q7SUFFL0QsK0RBQStEO0lBQy9ELFNBQWdCLHlCQUF5QixDQUFDLFVBQWtCO1FBQzFELE9BQU8sV0FBSSxDQUFDLFVBQVUsRUFBRSx5QkFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUZELDhEQUVDO0lBRUQsK0JBQStCO0lBQy9CO1FBaUJFLHNCQUNXLE9BQXNCLEVBQVUsV0FBbUIsRUFBVSxTQUFpQjtZQUE5RSxZQUFPLEdBQVAsT0FBTyxDQUFlO1lBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBYnpGLGdDQUFnQztZQUN4QixRQUFHLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUt0QywwRkFBMEY7WUFDbEYsWUFBTyxHQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RCwyQ0FBMkM7WUFDbkMsV0FBTSxHQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFHa0IsQ0FBQztRQWpCaEYsc0JBQVMsR0FBdEIsVUFBdUIsT0FBc0IsRUFBRSxXQUFtQixFQUFFLFNBQWlCOzs7b0JBQ25GLHNCQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUM7OztTQUMxRDtRQWlCRCxnRUFBZ0U7UUFDMUQsNENBQXFCLEdBQTNCOzs7Ozs7NEJBQ1MsS0FBQSxZQUFNLENBQUE7a0NBQUMsd0JBQXFCOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQUF2RSxzQkFBTyw0QkFBOEIsU0FBa0MsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsR0FBQyxFQUFDOzs7O1NBQ2hHO1FBRUQsaUVBQWlFO1FBQzNELHdDQUFpQixHQUF2Qjs7Ozs7OzRCQUNTLEtBQUEsWUFBTSxDQUFBO2tDQUFDLG1CQUFpQjs0QkFBRSxxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTtnQ0FBbkUsc0JBQU8sNEJBQTBCLFNBQWtDLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLEdBQUMsRUFBQzs7OztTQUM1RjtRQUVEOzs7V0FHRztRQUNHLDRDQUFxQixHQUEzQjs7Ozs7O2lDQUNNLENBQUEsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUEsRUFBeEIsd0JBQXdCO2lDQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBM0Isd0JBQTJCOzRCQUM3QixLQUFBLElBQUksQ0FBQTs0QkFBUyxxQkFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLEVBQUE7OzRCQUF6RSxHQUFLLEtBQUssR0FBRyxTQUE0RCxDQUFDOzs7NEJBRTFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztnQ0FHdkIsc0JBQU8sSUFBSSxDQUFDLEtBQUssRUFBQzs7OztTQUNuQjtRQUVELHdGQUF3RjtRQUMxRSw0Q0FBcUIsR0FBbkM7Ozs7Ozs7aUNBQ00sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFuQix3QkFBbUI7NEJBQ3JCLEtBQUEsSUFBSSxDQUFBO2lDQUFxQix1QkFBYTs7NEJBQzNCLHFCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUE7OzRCQUEzQixVQUFPLEdBQUUsU0FBa0I7Z0NBQzNCLFNBQU0sR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7Z0NBQzdCLFVBQU8sR0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQ0FDOUIsYUFBVSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtnQ0FDbEMsZUFBWSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTs0QkFDL0IscUJBQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUE7OzRCQU4zQyxHQUFLLGFBQWEsR0FBRyxjQUFJLHVCQUFhLFlBTXBDLFFBQUssR0FBRSxTQUFrQzs0Q0FDekMsQ0FBQzs7Z0NBRUwsc0JBQU8sSUFBSSxDQUFDLGFBQWEsRUFBQzs7OztTQUMzQjtRQUdELHVGQUF1RjtRQUN2Riw0Q0FBNEM7UUFDNUIsd0NBQWlCLEdBQWpDLFVBQWtDLElBQVksRUFBRSxFQUFXOzs7b0JBQ3pELHNCQUFPLHlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBQzs7O1NBQ3BDO1FBRVMsdUNBQWdCLEdBQTFCLFVBQTJCLE1BQXVDO1lBQ2hFLE9BQU8sd0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQXRFRCxJQXNFQztJQXRFWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0NvbW1pdEZyb21HaXRMb2d9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3BhcnNlJztcblxuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7RGV2SW5mcmFSZWxlYXNlQ29uZmlnLCBnZXRSZWxlYXNlQ29uZmlnLCBSZWxlYXNlTm90ZXNDb25maWd9IGZyb20gJy4uLy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge2NoYW5nZWxvZ1BhdGh9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge1JlbmRlckNvbnRleHR9IGZyb20gJy4vY29udGV4dCc7XG5cbmltcG9ydCBjaGFuZ2Vsb2dUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9jaGFuZ2Vsb2cnO1xuaW1wb3J0IGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSBmcm9tICcuL3RlbXBsYXRlcy9naXRodWItcmVsZWFzZSc7XG5cbi8qKiBHZXRzIHRoZSBwYXRoIGZvciB0aGUgY2hhbmdlbG9nIGZpbGUgaW4gYSBnaXZlbiBwcm9qZWN0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldExvY2FsQ2hhbmdlbG9nRmlsZVBhdGgocHJvamVjdERpcjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGpvaW4ocHJvamVjdERpciwgY2hhbmdlbG9nUGF0aCk7XG59XG5cbi8qKiBSZWxlYXNlIG5vdGUgZ2VuZXJhdGlvbi4gKi9cbmV4cG9ydCBjbGFzcyBSZWxlYXNlTm90ZXMge1xuICBzdGF0aWMgYXN5bmMgZnJvbVJhbmdlKHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHN0YXJ0aW5nUmVmOiBzdHJpbmcsIGVuZGluZ1JlZjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIG5ldyBSZWxlYXNlTm90ZXModmVyc2lvbiwgc3RhcnRpbmdSZWYsIGVuZGluZ1JlZik7XG4gIH1cblxuICAvKiogQW4gaW5zdGFuY2Ugb2YgR2l0Q2xpZW50LiAqL1xuICBwcml2YXRlIGdpdCA9IEdpdENsaWVudC5nZXRJbnN0YW5jZSgpO1xuICAvKiogVGhlIFJlbmRlckNvbnRleHQgdG8gYmUgdXNlZCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIHJlbmRlckNvbnRleHQ6IFJlbmRlckNvbnRleHR8dW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZ3xmYWxzZXx1bmRlZmluZWQ7XG4gIC8qKiBBIHByb21pc2UgcmVzb2x2aW5nIHRvIGEgbGlzdCBvZiBDb21taXRzIHNpbmNlIHRoZSBsYXRlc3Qgc2VtdmVyIHRhZyBvbiB0aGUgYnJhbmNoLiAqL1xuICBwcml2YXRlIGNvbW1pdHM6IFByb21pc2U8Q29tbWl0RnJvbUdpdExvZ1tdPiA9XG4gICAgICB0aGlzLmdldENvbW1pdHNJblJhbmdlKHRoaXMuc3RhcnRpbmdSZWYsIHRoaXMuZW5kaW5nUmVmKTtcbiAgLyoqIFRoZSBjb25maWd1cmF0aW9uIGZvciByZWxlYXNlIG5vdGVzLiAqL1xuICBwcml2YXRlIGNvbmZpZzogUmVsZWFzZU5vdGVzQ29uZmlnID0gdGhpcy5nZXRSZWxlYXNlQ29uZmlnKCkucmVsZWFzZU5vdGVzO1xuXG4gIHByb3RlY3RlZCBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBwcml2YXRlIHN0YXJ0aW5nUmVmOiBzdHJpbmcsIHByaXZhdGUgZW5kaW5nUmVmOiBzdHJpbmcpIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyKGdpdGh1YlJlbGVhc2VUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlcihjaGFuZ2Vsb2dUZW1wbGF0ZSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSwge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAvLyBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bz86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRDb21taXRzSW5SYW5nZShmcm9tLCB0byk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=