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
            this.git = new index_1.GitClient();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBK0I7SUFDL0IsNkJBQTBCO0lBRzFCLHlFQUFnRTtJQUNoRSxrRUFBZ0Q7SUFDaEQsb0VBQW1EO0lBQ25ELG9FQUFtRDtJQUNuRCxtRUFBb0Q7SUFDcEQsa0ZBQTJDO0lBQzNDLDRGQUF3QztJQUd4Qzs7O09BR0c7SUFDSCxTQUFnQixvQ0FBb0MsQ0FBQyxPQUFzQjtRQUN6RSxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCx5RkFBeUY7UUFDekYsNkZBQTZGO1FBQzdGLE9BQU8sSUFBSSxNQUFNLENBQUMsZ0JBQWEsY0FBYyxnQ0FBMkIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBTEQsb0ZBS0M7SUFFRCwrREFBK0Q7SUFDL0QsU0FBZ0IseUJBQXlCLENBQUMsVUFBa0I7UUFDMUQsT0FBTyxXQUFJLENBQUMsVUFBVSxFQUFFLHlCQUFhLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRkQsOERBRUM7SUFHRCwrQkFBK0I7SUFDL0I7UUFnQkUsc0JBQW9CLE9BQXNCO1lBQXRCLFlBQU8sR0FBUCxPQUFPLENBQWU7WUFmMUMsZ0NBQWdDO1lBQ3hCLFFBQUcsR0FBRyxJQUFJLGlCQUFTLEVBQUUsQ0FBQztZQUM5QixnQ0FBZ0M7WUFDZixXQUFNLEdBQUcsa0JBQVMsRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUM3QywwREFBMEQ7WUFDMUQsZ0dBQWdHO1lBQ2hHLDJCQUEyQjtZQUNWLFdBQU0sR0FBRyx3QkFBZ0IsRUFBRSxDQUFDLFlBQWEsSUFBSSxFQUFFLENBQUM7WUFDakUsMEZBQTBGO1lBQ2xGLFlBQU8sR0FBRyx5QkFBaUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGtCQUFrQixFQUFFLENBQUMsTUFBTSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFNdkMsQ0FBQztRQUU5QyxnRUFBZ0U7UUFDMUQsNENBQXFCLEdBQTNCOzs7Ozs7NEJBQ2UsS0FBQSxnQkFBVSxDQUFBO2tDQUNuQixXQUFJLENBQUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQURoRixxQkFBTSw0QkFDd0MsU0FBa0MsR0FBQyxFQUFBO2dDQUR4RixzQkFBTyxTQUNpRixFQUFDOzs7O1NBQzFGO1FBRUQsaUVBQWlFO1FBQzNELHdDQUFpQixHQUF2Qjs7Ozs7OzRCQUNlLEtBQUEsZ0JBQVUsQ0FBQTtrQ0FDbkIsV0FBSSxDQUFDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQzs0QkFBRSxxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTtnQ0FEM0UscUJBQU0sNEJBQ21DLFNBQWtDLEdBQUMsRUFBQTtnQ0FEbkYsc0JBQU8sU0FDNEUsRUFBQzs7OztTQUNyRjtRQUVEOzs7V0FHRztRQUNHLDRDQUFxQixHQUEzQjs7Ozs7O2lDQUNNLENBQUEsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUEsRUFBeEIsd0JBQXdCO2lDQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBM0Isd0JBQTJCOzRCQUM3QixLQUFBLElBQUksQ0FBQTs0QkFBUyxxQkFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLEVBQUE7OzRCQUF6RSxHQUFLLEtBQUssR0FBRyxTQUE0RCxDQUFDOzs7NEJBRTFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztnQ0FHdkIsc0JBQU8sSUFBSSxDQUFDLEtBQUssRUFBQzs7OztTQUNuQjtRQUVELHdGQUF3RjtRQUMxRSw0Q0FBcUIsR0FBbkM7Ozs7Ozs7aUNBQ00sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFuQix3QkFBbUI7NEJBQ3JCLEtBQUEsSUFBSSxDQUFBO2lDQUFxQix1QkFBYTs7NEJBQzNCLHFCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUE7OzRCQUEzQixVQUFPLEdBQUUsU0FBa0I7Z0NBQzNCLFNBQU0sR0FBRSxrQkFBUyxFQUFFLENBQUMsTUFBTTtnQ0FDMUIsVUFBTyxHQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dDQUM5QixhQUFVLEdBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO2dDQUNsQyxlQUFZLEdBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZOzRCQUMvQixxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTs7NEJBTjNDLEdBQUssYUFBYSxHQUFHLGNBQUksdUJBQWEsWUFNcEMsUUFBSyxHQUFFLFNBQWtDOzRDQUN6QyxDQUFDOztnQ0FFTCxzQkFBTyxJQUFJLENBQUMsYUFBYSxFQUFDOzs7O1NBQzNCO1FBQ0gsbUJBQUM7SUFBRCxDQUFDLEFBM0RELElBMkRDO0lBM0RZLG9DQUFZIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge3JlbmRlckZpbGV9IGZyb20gJ2Vqcyc7XG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7Z2V0Q29tbWl0c0luUmFuZ2V9IGZyb20gJy4uLy4uLy4uL2NvbW1pdC1tZXNzYWdlL3V0aWxzJztcbmltcG9ydCB7Z2V0Q29uZmlnfSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25maWcnO1xuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7Z2V0UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuXG4vKipcbiAqIEdldHMgdGhlIGRlZmF1bHQgcGF0dGVybiBmb3IgZXh0cmFjdGluZyByZWxlYXNlIG5vdGVzIGZvciB0aGUgZ2l2ZW4gdmVyc2lvbi5cbiAqIFRoaXMgcGF0dGVybiBtYXRjaGVzIGZvciB0aGUgY29udmVudGlvbmFsLWNoYW5nZWxvZyBBbmd1bGFyIHByZXNldC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRFeHRyYWN0UmVsZWFzZU5vdGVzUGF0dGVybih2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKTogUmVnRXhwIHtcbiAgY29uc3QgZXNjYXBlZFZlcnNpb24gPSB2ZXJzaW9uLmZvcm1hdCgpLnJlcGxhY2UoJy4nLCAnXFxcXC4nKTtcbiAgLy8gVE9ETzogQ2hhbmdlIHRoaXMgb25jZSB3ZSBoYXZlIGEgY2Fub25pY2FsIGNoYW5nZWxvZyBnZW5lcmF0aW9uIHRvb2wuIEFsc28gdXBkYXRlIHRoaXNcbiAgLy8gYmFzZWQgb24gdGhlIGNvbnZlbnRpb25hbC1jaGFuZ2Vsb2cgdmVyc2lvbi4gVGhleSByZW1vdmVkIGFuY2hvcnMgaW4gbW9yZSByZWNlbnQgdmVyc2lvbnMuXG4gIHJldHVybiBuZXcgUmVnRXhwKGAoPGEgbmFtZT1cIiR7ZXNjYXBlZFZlcnNpb259XCI+PC9hPi4qPykoPzo8YSBuYW1lPVwifCQpYCwgJ3MnKTtcbn1cblxuLyoqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgZmlsZSBpbiBhIGdpdmVuIHByb2plY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aChwcm9qZWN0RGlyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pbihwcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbn1cblxuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgLyoqIEFuIGluc3RhbmNlIG9mIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBnaXQgPSBuZXcgR2l0Q2xpZW50KCk7XG4gIC8qKiBUaGUgZ2l0aHViIGNvbmZpZ3VyYXRpb24uICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZ2l0aHViID0gZ2V0Q29uZmlnKCkuZ2l0aHViO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSByZWxlYXNlIG5vdGVzIGdlbmVyYXRpb24uICovXG4gIC8vIFRPRE8oam9zZXBocGVycm90dCk6IFJlbW92ZSBub24tbnVsbCBhc3NlcnRpb24gYWZ0ZXIgdXNhZ2Ugb2YgUmVsZWFzZU5vdGVzIGlzIGludGVncmF0ZWQgaW50b1xuICAvLyByZWxlYXNlIHB1Ymxpc2ggdG9vbGluZy5cbiAgcHJpdmF0ZSByZWFkb25seSBjb25maWcgPSBnZXRSZWxlYXNlQ29uZmlnKCkucmVsZWFzZU5vdGVzISB8fCB7fTtcbiAgLyoqIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBsaXN0IG9mIENvbW1pdHMgc2luY2UgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2guICovXG4gIHByaXZhdGUgY29tbWl0cyA9IGdldENvbW1pdHNJblJhbmdlKHRoaXMuZ2l0LmdldExhdGVzdFNlbXZlclRhZygpLmZvcm1hdCgpLCAnSEVBRCcpO1xuICAvKiogVGhlIFJlbmRlckNvbnRleHQgdG8gYmUgdXNlZCBkdXJpbmcgcmVuZGVyaW5nLiAqL1xuICBwcml2YXRlIHJlbmRlckNvbnRleHQ6IFJlbmRlckNvbnRleHR8dW5kZWZpbmVkO1xuICAvKiogVGhlIHRpdGxlIHRvIHVzZSBmb3IgdGhlIHJlbGVhc2UuICovXG4gIHByaXZhdGUgdGl0bGU6IHN0cmluZ3xmYWxzZXx1bmRlZmluZWQ7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyKSB7fVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBHaXRodWIgUmVsZWFzZS4gKi9cbiAgYXN5bmMgZ2V0R2l0aHViUmVsZWFzZUVudHJ5KCk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIGF3YWl0IHJlbmRlckZpbGUoXG4gICAgICAgIGpvaW4oX19kaXJuYW1lLCAndGVtcGxhdGVzL2dpdGh1Yi1yZWxlYXNlLmVqcycpLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpKTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBDSEFOR0VMT0cgZW50cnkuICovXG4gIGFzeW5jIGdldENoYW5nZWxvZ0VudHJ5KCkge1xuICAgIHJldHVybiBhd2FpdCByZW5kZXJGaWxlKFxuICAgICAgICBqb2luKF9fZGlybmFtZSwgJ3RlbXBsYXRlcy9jaGFuZ2Vsb2cuZWpzJyksIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiBnZXRDb25maWcoKS5naXRodWIsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cbn1cbiJdfQ==