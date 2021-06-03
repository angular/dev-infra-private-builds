(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/notes/release-notes", ["require", "exports", "tslib", "ejs", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/git-client", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/notes/context", "@angular/dev-infra-private/release/notes/templates/changelog", "@angular/dev-infra-private/release/notes/templates/github-release"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ReleaseNotes = void 0;
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var ejs_1 = require("ejs");
    var utils_1 = require("@angular/dev-infra-private/commit-message/utils");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var git_client_1 = require("@angular/dev-infra-private/utils/git/git-client");
    var index_1 = require("@angular/dev-infra-private/release/config");
    var context_1 = require("@angular/dev-infra-private/release/notes/context");
    var changelog_1 = require("@angular/dev-infra-private/release/notes/templates/changelog");
    var github_release_1 = require("@angular/dev-infra-private/release/notes/templates/github-release");
    /** Release note generation. */
    var ReleaseNotes = /** @class */ (function () {
        function ReleaseNotes(version, startingRef, endingRef) {
            this.version = version;
            this.startingRef = startingRef;
            this.endingRef = endingRef;
            /** An instance of GitClient. */
            this.git = git_client_1.GitClient.get();
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
            return index_1.getReleaseConfig(config);
        };
        return ReleaseNotes;
    }());
    exports.ReleaseNotes = ReleaseNotes;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL25vdGVzL3JlbGVhc2Utbm90ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQUFBOzs7Ozs7T0FNRztJQUNILDJCQUEyQjtJQUkzQix5RUFBNkQ7SUFDN0Qsb0VBQWdEO0lBQ2hELDhFQUFxRDtJQUNyRCxtRUFBNEY7SUFDNUYsNEVBQXdDO0lBRXhDLDBGQUFzRDtJQUN0RCxvR0FBK0Q7SUFFL0QsK0JBQStCO0lBQy9CO1FBaUJFLHNCQUNXLE9BQXNCLEVBQVUsV0FBbUIsRUFBVSxTQUFpQjtZQUE5RSxZQUFPLEdBQVAsT0FBTyxDQUFlO1lBQVUsZ0JBQVcsR0FBWCxXQUFXLENBQVE7WUFBVSxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBYnpGLGdDQUFnQztZQUN4QixRQUFHLEdBQUcsc0JBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUs5QiwwRkFBMEY7WUFDbEYsWUFBTyxHQUNYLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RCwyQ0FBMkM7WUFDbkMsV0FBTSxHQUF1QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFHa0IsQ0FBQztRQWpCaEYsc0JBQVMsR0FBdEIsVUFBdUIsT0FBc0IsRUFBRSxXQUFtQixFQUFFLFNBQWlCOzs7b0JBQ25GLHNCQUFPLElBQUksWUFBWSxDQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUM7OztTQUMxRDtRQWlCRCxnRUFBZ0U7UUFDMUQsNENBQXFCLEdBQTNCOzs7Ozs7NEJBQ1MsS0FBQSxZQUFNLENBQUE7a0NBQUMsd0JBQXFCOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQUF2RSxzQkFBTyw0QkFBOEIsU0FBa0MsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsR0FBQyxFQUFDOzs7O1NBQ2hHO1FBRUQsaUVBQWlFO1FBQzNELHdDQUFpQixHQUF2Qjs7Ozs7OzRCQUNTLEtBQUEsWUFBTSxDQUFBO2tDQUFDLG1CQUFpQjs0QkFBRSxxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTtnQ0FBbkUsc0JBQU8sNEJBQTBCLFNBQWtDLEVBQUUsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLEdBQUMsRUFBQzs7OztTQUM1RjtRQUVEOzs7V0FHRztRQUNHLDRDQUFxQixHQUEzQjs7Ozs7O2lDQUNNLENBQUEsSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUEsRUFBeEIsd0JBQXdCO2lDQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBM0Isd0JBQTJCOzRCQUM3QixLQUFBLElBQUksQ0FBQTs0QkFBUyxxQkFBTSxxQkFBVyxDQUFDLHlDQUF5QyxDQUFDLEVBQUE7OzRCQUF6RSxHQUFLLEtBQUssR0FBRyxTQUE0RCxDQUFDOzs7NEJBRTFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDOztnQ0FHdkIsc0JBQU8sSUFBSSxDQUFDLEtBQUssRUFBQzs7OztTQUNuQjtRQUVELHdGQUF3RjtRQUMxRSw0Q0FBcUIsR0FBbkM7Ozs7Ozs7aUNBQ00sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFuQix3QkFBbUI7NEJBQ3JCLEtBQUEsSUFBSSxDQUFBO2lDQUFxQix1QkFBYTs7NEJBQzNCLHFCQUFNLElBQUksQ0FBQyxPQUFPLEVBQUE7OzRCQUEzQixVQUFPLEdBQUUsU0FBa0I7Z0NBQzNCLFNBQU0sR0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7Z0NBQzdCLFVBQU8sR0FBRSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtnQ0FDOUIsYUFBVSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVTtnQ0FDbEMsZUFBWSxHQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWTs0QkFDL0IscUJBQU0sSUFBSSxDQUFDLHFCQUFxQixFQUFFLEVBQUE7OzRCQU4zQyxHQUFLLGFBQWEsR0FBRyxjQUFJLHVCQUFhLFlBTXBDLFFBQUssR0FBRSxTQUFrQzs0Q0FDekMsQ0FBQzs7Z0NBRUwsc0JBQU8sSUFBSSxDQUFDLGFBQWEsRUFBQzs7OztTQUMzQjtRQUdELHVGQUF1RjtRQUN2Riw0Q0FBNEM7UUFDNUIsd0NBQWlCLEdBQWpDLFVBQWtDLElBQVksRUFBRSxFQUFXOzs7b0JBQ3pELHNCQUFPLHlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBQzs7O1NBQ3BDO1FBRVMsdUNBQWdCLEdBQTFCLFVBQTJCLE1BQXVDO1lBQ2hFLE9BQU8sd0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUNILG1CQUFDO0lBQUQsQ0FBQyxBQXRFRCxJQXNFQztJQXRFWSxvQ0FBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtyZW5kZXJ9IGZyb20gJ2Vqcyc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi8uLi9jb21taXQtbWVzc2FnZS91dGlscyc7XG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0LWNsaWVudCc7XG5pbXBvcnQge0RldkluZnJhUmVsZWFzZUNvbmZpZywgZ2V0UmVsZWFzZUNvbmZpZywgUmVsZWFzZU5vdGVzQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuaW1wb3J0IHtSZW5kZXJDb250ZXh0fSBmcm9tICcuL2NvbnRleHQnO1xuXG5pbXBvcnQgY2hhbmdlbG9nVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvY2hhbmdlbG9nJztcbmltcG9ydCBnaXRodWJSZWxlYXNlVGVtcGxhdGUgZnJvbSAnLi90ZW1wbGF0ZXMvZ2l0aHViLXJlbGVhc2UnO1xuXG4vKiogUmVsZWFzZSBub3RlIGdlbmVyYXRpb24uICovXG5leHBvcnQgY2xhc3MgUmVsZWFzZU5vdGVzIHtcbiAgc3RhdGljIGFzeW5jIGZyb21SYW5nZSh2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBzdGFydGluZ1JlZjogc3RyaW5nLCBlbmRpbmdSZWY6IHN0cmluZykge1xuICAgIHJldHVybiBuZXcgUmVsZWFzZU5vdGVzKHZlcnNpb24sIHN0YXJ0aW5nUmVmLCBlbmRpbmdSZWYpO1xuICB9XG5cbiAgLyoqIEFuIGluc3RhbmNlIG9mIEdpdENsaWVudC4gKi9cbiAgcHJpdmF0ZSBnaXQgPSBHaXRDbGllbnQuZ2V0KCk7XG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dHx1bmRlZmluZWQ7XG4gIC8qKiBUaGUgdGl0bGUgdG8gdXNlIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nfGZhbHNlfHVuZGVmaW5lZDtcbiAgLyoqIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBsaXN0IG9mIENvbW1pdHMgc2luY2UgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2guICovXG4gIHByaXZhdGUgY29tbWl0czogUHJvbWlzZTxDb21taXRGcm9tR2l0TG9nW10+ID1cbiAgICAgIHRoaXMuZ2V0Q29tbWl0c0luUmFuZ2UodGhpcy5zdGFydGluZ1JlZiwgdGhpcy5lbmRpbmdSZWYpO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXM7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHByaXZhdGUgc3RhcnRpbmdSZWY6IHN0cmluZywgcHJpdmF0ZSBlbmRpbmdSZWY6IHN0cmluZykge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXIoZ2l0aHViUmVsZWFzZVRlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgQ0hBTkdFTE9HIGVudHJ5LiAqL1xuICBhc3luYyBnZXRDaGFuZ2Vsb2dFbnRyeSgpIHtcbiAgICByZXR1cm4gcmVuZGVyKGNoYW5nZWxvZ1RlbXBsYXRlLCBhd2FpdCB0aGlzLmdlbmVyYXRlUmVuZGVyQ29udGV4dCgpLCB7cm1XaGl0ZXNwYWNlOiB0cnVlfSk7XG4gIH1cblxuICAvKipcbiAgICogUHJvbXB0IHRoZSB1c2VyIGZvciBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZSwgaWYgdGhlIHByb2plY3QncyBjb25maWd1cmF0aW9uIGlzIGRlZmluZWQgdG8gdXNlIGFcbiAgICogdGl0bGUuXG4gICAqL1xuICBhc3luYyBwcm9tcHRGb3JSZWxlYXNlVGl0bGUoKSB7XG4gICAgaWYgKHRoaXMudGl0bGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHRoaXMuY29uZmlnLnVzZVJlbGVhc2VUaXRsZSkge1xuICAgICAgICB0aGlzLnRpdGxlID0gYXdhaXQgcHJvbXB0SW5wdXQoJ1BsZWFzZSBwcm92aWRlIGEgdGl0bGUgZm9yIHRoZSByZWxlYXNlOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy50aXRsZTtcbiAgfVxuXG4gIC8qKiBCdWlsZCB0aGUgcmVuZGVyIGNvbnRleHQgZGF0YSBvYmplY3QgZm9yIGNvbnN0cnVjdGluZyB0aGUgUmVuZGVyQ29udGV4dCBpbnN0YW5jZS4gKi9cbiAgcHJpdmF0ZSBhc3luYyBnZW5lcmF0ZVJlbmRlckNvbnRleHQoKTogUHJvbWlzZTxSZW5kZXJDb250ZXh0PiB7XG4gICAgaWYgKCF0aGlzLnJlbmRlckNvbnRleHQpIHtcbiAgICAgIHRoaXMucmVuZGVyQ29udGV4dCA9IG5ldyBSZW5kZXJDb250ZXh0KHtcbiAgICAgICAgY29tbWl0czogYXdhaXQgdGhpcy5jb21taXRzLFxuICAgICAgICBnaXRodWI6IHRoaXMuZ2l0LnJlbW90ZUNvbmZpZyxcbiAgICAgICAgdmVyc2lvbjogdGhpcy52ZXJzaW9uLmZvcm1hdCgpLFxuICAgICAgICBncm91cE9yZGVyOiB0aGlzLmNvbmZpZy5ncm91cE9yZGVyLFxuICAgICAgICBoaWRkZW5TY29wZXM6IHRoaXMuY29uZmlnLmhpZGRlblNjb3BlcyxcbiAgICAgICAgdGl0bGU6IGF3YWl0IHRoaXMucHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCksXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ29udGV4dDtcbiAgfVxuXG5cbiAgLy8gVGhlc2UgbWV0aG9kcyBhcmUgdXNlZCBmb3IgYWNjZXNzIHRvIHRoZSB1dGlsaXR5IGZ1bmN0aW9ucyB3aGlsZSBhbGxvd2luZyB0aGVtIHRvIGJlXG4gIC8vIG92ZXJ3cml0dGVuIGluIHN1YmNsYXNzZXMgZHVyaW5nIHRlc3RpbmcuXG4gIHByb3RlY3RlZCBhc3luYyBnZXRDb21taXRzSW5SYW5nZShmcm9tOiBzdHJpbmcsIHRvPzogc3RyaW5nKSB7XG4gICAgcmV0dXJuIGdldENvbW1pdHNJblJhbmdlKGZyb20sIHRvKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZz86IFBhcnRpYWw8RGV2SW5mcmFSZWxlYXNlQ29uZmlnPikge1xuICAgIHJldHVybiBnZXRSZWxlYXNlQ29uZmlnKGNvbmZpZyk7XG4gIH1cbn1cbiJdfQ==