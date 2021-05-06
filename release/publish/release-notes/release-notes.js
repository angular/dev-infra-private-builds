(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/release-notes/release-notes", ["require", "exports", "tslib", "ejs", "path", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/release-notes/context"], factory);
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
    var constants_1 = require("@angular/dev-infra-private/release/publish/constants");
    var context_1 = require("@angular/dev-infra-private/release/publish/release-notes/context");
    /** Gets the path for the changelog file in a given project. */
    function getLocalChangelogFilePath(projectDir) {
        return path_1.join(projectDir, constants_1.changelogPath);
    }
    exports.getLocalChangelogFilePath = getLocalChangelogFilePath;
    /** Release note generation. */
    var ReleaseNotes = /** @class */ (function () {
        function ReleaseNotes(version, config) {
            this.version = version;
            this.config = config;
            /** An instance of GitClient. */
            this.git = index_1.GitClient.getInstance();
            /** A promise resolving to a list of Commits since the latest semver tag on the branch. */
            this.commits = utils_1.getCommitsInRange(this.git.getLatestSemverTag().format(), 'HEAD');
        }
        /** Construct a release note generation instance. */
        ReleaseNotes.fromLatestTagToHead = function (version, config) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, new ReleaseNotes(version, config)];
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
                            _a = ejs_1.renderFile;
                            _b = [path_1.join(__dirname, 'templates/github-release.ejs')];
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
                            _a = ejs_1.renderFile;
                            _b = [path_1.join(__dirname, 'templates/changelog.ejs')];
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
                            if (!this.config.releaseNotes.useReleaseTitle) return [3 /*break*/, 2];
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
                                _c.groupOrder = this.config.releaseNotes.groupOrder,
                                _c.hiddenScopes = this.config.releaseNotes.hiddenScopes;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBK0I7SUFDL0IsNkJBQTBCO0lBRzFCLHlFQUFnRTtJQUNoRSxvRUFBbUQ7SUFDbkQsb0VBQW1EO0lBRW5ELGtGQUEyQztJQUMzQyw0RkFBd0M7SUFFeEMsK0RBQStEO0lBQy9ELFNBQWdCLHlCQUF5QixDQUFDLFVBQWtCO1FBQzFELE9BQU8sV0FBSSxDQUFDLFVBQVUsRUFBRSx5QkFBYSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUZELDhEQUVDO0lBR0QsK0JBQStCO0lBQy9CO1FBZ0JFLHNCQUFvQyxPQUFzQixFQUFVLE1BQXFCO1lBQXJELFlBQU8sR0FBUCxPQUFPLENBQWU7WUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFlO1lBVHpGLGdDQUFnQztZQUN4QixRQUFHLEdBQUcsaUJBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUt0QywwRkFBMEY7WUFDbEYsWUFBTyxHQUFHLHlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUVRLENBQUM7UUFmN0Ysb0RBQW9EO1FBQ3ZDLGdDQUFtQixHQUFoQyxVQUFpQyxPQUFzQixFQUFFLE1BQXFCOzs7b0JBRTVFLHNCQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsRUFBQzs7O1NBQzFDO1FBYUQsZ0VBQWdFO1FBQzFELDRDQUFxQixHQUEzQjs7Ozs7OzRCQUNTLEtBQUEsZ0JBQVUsQ0FBQTtrQ0FDYixXQUFJLENBQUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQUR2RixzQkFBTyw0QkFDOEMsU0FBa0MsRUFDbkYsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLEdBQUMsRUFBQzs7OztTQUMzQjtRQUVELGlFQUFpRTtRQUMzRCx3Q0FBaUIsR0FBdkI7Ozs7Ozs0QkFDUyxLQUFBLGdCQUFVLENBQUE7a0NBQ2IsV0FBSSxDQUFDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQzs0QkFBRSxxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTtnQ0FEbEYsc0JBQU8sNEJBQ3lDLFNBQWtDLEVBQzlFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxHQUFDLEVBQUM7Ozs7U0FDM0I7UUFFRDs7O1dBR0c7UUFDRyw0Q0FBcUIsR0FBM0I7Ozs7OztpQ0FDTSxDQUFBLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFBLEVBQXhCLHdCQUF3QjtpQ0FDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZUFBZSxFQUF4Qyx3QkFBd0M7NEJBQzFDLEtBQUEsSUFBSSxDQUFBOzRCQUFTLHFCQUFNLHFCQUFXLENBQUMseUNBQXlDLENBQUMsRUFBQTs7NEJBQXpFLEdBQUssS0FBSyxHQUFHLFNBQTRELENBQUM7Ozs0QkFFMUUsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7O2dDQUd2QixzQkFBTyxJQUFJLENBQUMsS0FBSyxFQUFDOzs7O1NBQ25CO1FBRUQsd0ZBQXdGO1FBQzFFLDRDQUFxQixHQUFuQzs7Ozs7OztpQ0FDTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQW5CLHdCQUFtQjs0QkFDckIsS0FBQSxJQUFJLENBQUE7aUNBQXFCLHVCQUFhOzs0QkFDM0IscUJBQU0sSUFBSSxDQUFDLE9BQU8sRUFBQTs7NEJBQTNCLFVBQU8sR0FBRSxTQUFrQjtnQ0FDM0IsU0FBTSxHQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWTtnQ0FDN0IsVUFBTyxHQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFO2dDQUM5QixhQUFVLEdBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBVTtnQ0FDL0MsZUFBWSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLFlBQVk7NEJBQzVDLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBOzs0QkFOM0MsR0FBSyxhQUFhLEdBQUcsY0FBSSx1QkFBYSxZQU1wQyxRQUFLLEdBQUUsU0FBa0M7NENBQ3pDLENBQUM7O2dDQUVMLHNCQUFPLElBQUksQ0FBQyxhQUFhLEVBQUM7Ozs7U0FDM0I7UUFDSCxtQkFBQztJQUFELENBQUMsQUE3REQsSUE2REM7SUE3RFksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyRmlsZX0gZnJvbSAnZWpzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtnZXRDb21taXRzSW5SYW5nZX0gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvdXRpbHMnO1xuaW1wb3J0IHtwcm9tcHRJbnB1dH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0dpdENsaWVudH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZ2l0L2luZGV4JztcbmltcG9ydCB7UmVsZWFzZUNvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuLyoqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgZmlsZSBpbiBhIGdpdmVuIHByb2plY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aChwcm9qZWN0RGlyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pbihwcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbn1cblxuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgLyoqIENvbnN0cnVjdCBhIHJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uIGluc3RhbmNlLiAqL1xuICBzdGF0aWMgYXN5bmMgZnJvbUxhdGVzdFRhZ1RvSGVhZCh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb25maWc6IFJlbGVhc2VDb25maWcpOlxuICAgICAgUHJvbWlzZTxSZWxlYXNlTm90ZXM+IHtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBjb25maWcpO1xuICB9XG5cbiAgLyoqIEFuIGluc3RhbmNlIG9mIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBnaXQgPSBHaXRDbGllbnQuZ2V0SW5zdGFuY2UoKTtcbiAgLyoqIFRoZSBSZW5kZXJDb250ZXh0IHRvIGJlIHVzZWQgZHVyaW5nIHJlbmRlcmluZy4gKi9cbiAgcHJpdmF0ZSByZW5kZXJDb250ZXh0OiBSZW5kZXJDb250ZXh0fHVuZGVmaW5lZDtcbiAgLyoqIFRoZSB0aXRsZSB0byB1c2UgZm9yIHRoZSByZWxlYXNlLiAqL1xuICBwcml2YXRlIHRpdGxlOiBzdHJpbmd8ZmFsc2V8dW5kZWZpbmVkO1xuICAvKiogQSBwcm9taXNlIHJlc29sdmluZyB0byBhIGxpc3Qgb2YgQ29tbWl0cyBzaW5jZSB0aGUgbGF0ZXN0IHNlbXZlciB0YWcgb24gdGhlIGJyYW5jaC4gKi9cbiAgcHJpdmF0ZSBjb21taXRzID0gZ2V0Q29tbWl0c0luUmFuZ2UodGhpcy5naXQuZ2V0TGF0ZXN0U2VtdmVyVGFnKCkuZm9ybWF0KCksICdIRUFEJyk7XG5cbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgcHJpdmF0ZSBjb25maWc6IFJlbGVhc2VDb25maWcpIHt9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIEdpdGh1YiBSZWxlYXNlLiAqL1xuICBhc3luYyBnZXRHaXRodWJSZWxlYXNlRW50cnkoKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICByZXR1cm4gcmVuZGVyRmlsZShcbiAgICAgICAgam9pbihfX2Rpcm5hbWUsICd0ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UuZWpzJyksIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksXG4gICAgICAgIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSB0aGUgcmVsZWFzZSBub3RlIGdlbmVyYXRlZCBmb3IgYSBDSEFOR0VMT0cgZW50cnkuICovXG4gIGFzeW5jIGdldENoYW5nZWxvZ0VudHJ5KCkge1xuICAgIHJldHVybiByZW5kZXJGaWxlKFxuICAgICAgICBqb2luKF9fZGlybmFtZSwgJ3RlbXBsYXRlcy9jaGFuZ2Vsb2cuZWpzJyksIGF3YWl0IHRoaXMuZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCksXG4gICAgICAgIHtybVdoaXRlc3BhY2U6IHRydWV9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9tcHQgdGhlIHVzZXIgZm9yIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlLCBpZiB0aGUgcHJvamVjdCdzIGNvbmZpZ3VyYXRpb24gaXMgZGVmaW5lZCB0byB1c2UgYVxuICAgKiB0aXRsZS5cbiAgICovXG4gIGFzeW5jIHByb21wdEZvclJlbGVhc2VUaXRsZSgpIHtcbiAgICBpZiAodGhpcy50aXRsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodGhpcy5jb25maWcucmVsZWFzZU5vdGVzLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogYXdhaXQgdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLmNvbmZpZy5yZWxlYXNlTm90ZXMuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5yZWxlYXNlTm90ZXMuaGlkZGVuU2NvcGVzLFxuICAgICAgICB0aXRsZTogYXdhaXQgdGhpcy5wcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5yZW5kZXJDb250ZXh0O1xuICB9XG59XG4iXX0=