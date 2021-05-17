(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/release/publish/release-notes/release-notes", ["require", "exports", "tslib", "ejs", "path", "@angular/dev-infra-private/commit-message/utils", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/utils/git/index", "@angular/dev-infra-private/release/config", "@angular/dev-infra-private/release/publish/constants", "@angular/dev-infra-private/release/publish/release-notes/context"], factory);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVsZWFzZS1ub3Rlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3B1Ymxpc2gvcmVsZWFzZS1ub3Rlcy9yZWxlYXNlLW5vdGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCwyQkFBK0I7SUFDL0IsNkJBQTBCO0lBSTFCLHlFQUFnRTtJQUNoRSxvRUFBbUQ7SUFDbkQsb0VBQW1EO0lBQ25ELG1FQUErRjtJQUMvRixrRkFBMkM7SUFDM0MsNEZBQXdDO0lBRXhDLCtEQUErRDtJQUMvRCxTQUFnQix5QkFBeUIsQ0FBQyxVQUFrQjtRQUMxRCxPQUFPLFdBQUksQ0FBQyxVQUFVLEVBQUUseUJBQWEsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFGRCw4REFFQztJQUVELCtCQUErQjtJQUMvQjtRQWlCRSxzQkFDVyxPQUFzQixFQUFVLFdBQW1CLEVBQVUsU0FBaUI7WUFBOUUsWUFBTyxHQUFQLE9BQU8sQ0FBZTtZQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1lBQVUsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQWJ6RixnQ0FBZ0M7WUFDeEIsUUFBRyxHQUFHLGlCQUFTLENBQUMsV0FBVyxFQUFFLENBQUM7WUFLdEMsMEZBQTBGO1lBQ2xGLFlBQU8sR0FDWCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0QsMkNBQTJDO1lBQ25DLFdBQU0sR0FBdUIsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsWUFBWSxDQUFDO1FBR2tCLENBQUM7UUFqQmhGLHNCQUFTLEdBQXRCLFVBQXVCLE9BQXNCLEVBQUUsV0FBbUIsRUFBRSxTQUFpQjs7O29CQUNuRixzQkFBTyxJQUFJLFlBQVksQ0FBQyxPQUFPLEVBQUUsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFDOzs7U0FDMUQ7UUFpQkQsZ0VBQWdFO1FBQzFELDRDQUFxQixHQUEzQjs7Ozs7OzRCQUNTLEtBQUEsZ0JBQVUsQ0FBQTtrQ0FDYixXQUFJLENBQUMsU0FBUyxFQUFFLDhCQUE4QixDQUFDOzRCQUFFLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBO2dDQUR2RixzQkFBTyw0QkFDOEMsU0FBa0MsRUFDbkYsRUFBQyxZQUFZLEVBQUUsSUFBSSxFQUFDLEdBQUMsRUFBQzs7OztTQUMzQjtRQUVELGlFQUFpRTtRQUMzRCx3Q0FBaUIsR0FBdkI7Ozs7Ozs0QkFDUyxLQUFBLGdCQUFVLENBQUE7a0NBQ2IsV0FBSSxDQUFDLFNBQVMsRUFBRSx5QkFBeUIsQ0FBQzs0QkFBRSxxQkFBTSxJQUFJLENBQUMscUJBQXFCLEVBQUUsRUFBQTtnQ0FEbEYsc0JBQU8sNEJBQ3lDLFNBQWtDLEVBQzlFLEVBQUMsWUFBWSxFQUFFLElBQUksRUFBQyxHQUFDLEVBQUM7Ozs7U0FDM0I7UUFFRDs7O1dBR0c7UUFDRyw0Q0FBcUIsR0FBM0I7Ozs7OztpQ0FDTSxDQUFBLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxDQUFBLEVBQXhCLHdCQUF3QjtpQ0FDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQTNCLHdCQUEyQjs0QkFDN0IsS0FBQSxJQUFJLENBQUE7NEJBQVMscUJBQU0scUJBQVcsQ0FBQyx5Q0FBeUMsQ0FBQyxFQUFBOzs0QkFBekUsR0FBSyxLQUFLLEdBQUcsU0FBNEQsQ0FBQzs7OzRCQUUxRSxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQzs7Z0NBR3ZCLHNCQUFPLElBQUksQ0FBQyxLQUFLLEVBQUM7Ozs7U0FDbkI7UUFFRCx3RkFBd0Y7UUFDMUUsNENBQXFCLEdBQW5DOzs7Ozs7O2lDQUNNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBbkIsd0JBQW1COzRCQUNyQixLQUFBLElBQUksQ0FBQTtpQ0FBcUIsdUJBQWE7OzRCQUMzQixxQkFBTSxJQUFJLENBQUMsT0FBTyxFQUFBOzs0QkFBM0IsVUFBTyxHQUFFLFNBQWtCO2dDQUMzQixTQUFNLEdBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZO2dDQUM3QixVQUFPLEdBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0NBQzlCLGFBQVUsR0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVU7Z0NBQ2xDLGVBQVksR0FBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVk7NEJBQy9CLHFCQUFNLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFBOzs0QkFOM0MsR0FBSyxhQUFhLEdBQUcsY0FBSSx1QkFBYSxZQU1wQyxRQUFLLEdBQUUsU0FBa0M7NENBQ3pDLENBQUM7O2dDQUVMLHNCQUFPLElBQUksQ0FBQyxhQUFhLEVBQUM7Ozs7U0FDM0I7UUFHRCx1RkFBdUY7UUFDdkYsNENBQTRDO1FBQzVCLHdDQUFpQixHQUFqQyxVQUFrQyxJQUFZLEVBQUUsRUFBVzs7O29CQUN6RCxzQkFBTyx5QkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUM7OztTQUNwQztRQUVTLHVDQUFnQixHQUExQixVQUEyQixNQUF1QztZQUNoRSxPQUFPLHdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFDSCxtQkFBQztJQUFELENBQUMsQUExRUQsSUEwRUM7SUExRVksb0NBQVkiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7cmVuZGVyRmlsZX0gZnJvbSAnZWpzJztcbmltcG9ydCB7am9pbn0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7Q29tbWl0RnJvbUdpdExvZ30gZnJvbSAnLi4vLi4vLi4vY29tbWl0LW1lc3NhZ2UvcGFyc2UnO1xuXG5pbXBvcnQge2dldENvbW1pdHNJblJhbmdlfSBmcm9tICcuLi8uLi8uLi9jb21taXQtbWVzc2FnZS91dGlscyc7XG5pbXBvcnQge3Byb21wdElucHV0fSBmcm9tICcuLi8uLi8uLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7R2l0Q2xpZW50fSBmcm9tICcuLi8uLi8uLi91dGlscy9naXQvaW5kZXgnO1xuaW1wb3J0IHtEZXZJbmZyYVJlbGVhc2VDb25maWcsIGdldFJlbGVhc2VDb25maWcsIFJlbGVhc2VOb3Rlc0NvbmZpZ30gZnJvbSAnLi4vLi4vY29uZmlnL2luZGV4JztcbmltcG9ydCB7Y2hhbmdlbG9nUGF0aH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbmltcG9ydCB7UmVuZGVyQ29udGV4dH0gZnJvbSAnLi9jb250ZXh0JztcblxuLyoqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBjaGFuZ2Vsb2cgZmlsZSBpbiBhIGdpdmVuIHByb2plY3QuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TG9jYWxDaGFuZ2Vsb2dGaWxlUGF0aChwcm9qZWN0RGlyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gam9pbihwcm9qZWN0RGlyLCBjaGFuZ2Vsb2dQYXRoKTtcbn1cblxuLyoqIFJlbGVhc2Ugbm90ZSBnZW5lcmF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIFJlbGVhc2VOb3RlcyB7XG4gIHN0YXRpYyBhc3luYyBmcm9tUmFuZ2UodmVyc2lvbjogc2VtdmVyLlNlbVZlciwgc3RhcnRpbmdSZWY6IHN0cmluZywgZW5kaW5nUmVmOiBzdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFJlbGVhc2VOb3Rlcyh2ZXJzaW9uLCBzdGFydGluZ1JlZiwgZW5kaW5nUmVmKTtcbiAgfVxuXG4gIC8qKiBBbiBpbnN0YW5jZSBvZiBHaXRDbGllbnQuICovXG4gIHByaXZhdGUgZ2l0ID0gR2l0Q2xpZW50LmdldEluc3RhbmNlKCk7XG4gIC8qKiBUaGUgUmVuZGVyQ29udGV4dCB0byBiZSB1c2VkIGR1cmluZyByZW5kZXJpbmcuICovXG4gIHByaXZhdGUgcmVuZGVyQ29udGV4dDogUmVuZGVyQ29udGV4dHx1bmRlZmluZWQ7XG4gIC8qKiBUaGUgdGl0bGUgdG8gdXNlIGZvciB0aGUgcmVsZWFzZS4gKi9cbiAgcHJpdmF0ZSB0aXRsZTogc3RyaW5nfGZhbHNlfHVuZGVmaW5lZDtcbiAgLyoqIEEgcHJvbWlzZSByZXNvbHZpbmcgdG8gYSBsaXN0IG9mIENvbW1pdHMgc2luY2UgdGhlIGxhdGVzdCBzZW12ZXIgdGFnIG9uIHRoZSBicmFuY2guICovXG4gIHByaXZhdGUgY29tbWl0czogUHJvbWlzZTxDb21taXRGcm9tR2l0TG9nW10+ID1cbiAgICAgIHRoaXMuZ2V0Q29tbWl0c0luUmFuZ2UodGhpcy5zdGFydGluZ1JlZiwgdGhpcy5lbmRpbmdSZWYpO1xuICAvKiogVGhlIGNvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2Ugbm90ZXMuICovXG4gIHByaXZhdGUgY29uZmlnOiBSZWxlYXNlTm90ZXNDb25maWcgPSB0aGlzLmdldFJlbGVhc2VDb25maWcoKS5yZWxlYXNlTm90ZXM7XG5cbiAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHZlcnNpb246IHNlbXZlci5TZW1WZXIsIHByaXZhdGUgc3RhcnRpbmdSZWY6IHN0cmluZywgcHJpdmF0ZSBlbmRpbmdSZWY6IHN0cmluZykge31cblxuICAvKiogUmV0cmlldmUgdGhlIHJlbGVhc2Ugbm90ZSBnZW5lcmF0ZWQgZm9yIGEgR2l0aHViIFJlbGVhc2UuICovXG4gIGFzeW5jIGdldEdpdGh1YlJlbGVhc2VFbnRyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiByZW5kZXJGaWxlKFxuICAgICAgICBqb2luKF9fZGlybmFtZSwgJ3RlbXBsYXRlcy9naXRodWItcmVsZWFzZS5lanMnKSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSxcbiAgICAgICAge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZWxlYXNlIG5vdGUgZ2VuZXJhdGVkIGZvciBhIENIQU5HRUxPRyBlbnRyeS4gKi9cbiAgYXN5bmMgZ2V0Q2hhbmdlbG9nRW50cnkoKSB7XG4gICAgcmV0dXJuIHJlbmRlckZpbGUoXG4gICAgICAgIGpvaW4oX19kaXJuYW1lLCAndGVtcGxhdGVzL2NoYW5nZWxvZy5lanMnKSwgYXdhaXQgdGhpcy5nZW5lcmF0ZVJlbmRlckNvbnRleHQoKSxcbiAgICAgICAge3JtV2hpdGVzcGFjZTogdHJ1ZX0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb21wdCB0aGUgdXNlciBmb3IgYSB0aXRsZSBmb3IgdGhlIHJlbGVhc2UsIGlmIHRoZSBwcm9qZWN0J3MgY29uZmlndXJhdGlvbiBpcyBkZWZpbmVkIHRvIHVzZSBhXG4gICAqIHRpdGxlLlxuICAgKi9cbiAgYXN5bmMgcHJvbXB0Rm9yUmVsZWFzZVRpdGxlKCkge1xuICAgIGlmICh0aGlzLnRpdGxlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0aGlzLmNvbmZpZy51c2VSZWxlYXNlVGl0bGUpIHtcbiAgICAgICAgdGhpcy50aXRsZSA9IGF3YWl0IHByb21wdElucHV0KCdQbGVhc2UgcHJvdmlkZSBhIHRpdGxlIGZvciB0aGUgcmVsZWFzZTonKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGl0bGUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudGl0bGU7XG4gIH1cblxuICAvKiogQnVpbGQgdGhlIHJlbmRlciBjb250ZXh0IGRhdGEgb2JqZWN0IGZvciBjb25zdHJ1Y3RpbmcgdGhlIFJlbmRlckNvbnRleHQgaW5zdGFuY2UuICovXG4gIHByaXZhdGUgYXN5bmMgZ2VuZXJhdGVSZW5kZXJDb250ZXh0KCk6IFByb21pc2U8UmVuZGVyQ29udGV4dD4ge1xuICAgIGlmICghdGhpcy5yZW5kZXJDb250ZXh0KSB7XG4gICAgICB0aGlzLnJlbmRlckNvbnRleHQgPSBuZXcgUmVuZGVyQ29udGV4dCh7XG4gICAgICAgIGNvbW1pdHM6IGF3YWl0IHRoaXMuY29tbWl0cyxcbiAgICAgICAgZ2l0aHViOiB0aGlzLmdpdC5yZW1vdGVDb25maWcsXG4gICAgICAgIHZlcnNpb246IHRoaXMudmVyc2lvbi5mb3JtYXQoKSxcbiAgICAgICAgZ3JvdXBPcmRlcjogdGhpcy5jb25maWcuZ3JvdXBPcmRlcixcbiAgICAgICAgaGlkZGVuU2NvcGVzOiB0aGlzLmNvbmZpZy5oaWRkZW5TY29wZXMsXG4gICAgICAgIHRpdGxlOiBhd2FpdCB0aGlzLnByb21wdEZvclJlbGVhc2VUaXRsZSgpLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnJlbmRlckNvbnRleHQ7XG4gIH1cblxuXG4gIC8vIFRoZXNlIG1ldGhvZHMgYXJlIHVzZWQgZm9yIGFjY2VzcyB0byB0aGUgdXRpbGl0eSBmdW5jdGlvbnMgd2hpbGUgYWxsb3dpbmcgdGhlbSB0byBiZVxuICAvLyBvdmVyd3JpdHRlbiBpbiBzdWJjbGFzc2VzIGR1cmluZyB0ZXN0aW5nLlxuICBwcm90ZWN0ZWQgYXN5bmMgZ2V0Q29tbWl0c0luUmFuZ2UoZnJvbTogc3RyaW5nLCB0bz86IHN0cmluZykge1xuICAgIHJldHVybiBnZXRDb21taXRzSW5SYW5nZShmcm9tLCB0byk7XG4gIH1cblxuICBwcm90ZWN0ZWQgZ2V0UmVsZWFzZUNvbmZpZyhjb25maWc/OiBQYXJ0aWFsPERldkluZnJhUmVsZWFzZUNvbmZpZz4pIHtcbiAgICByZXR1cm4gZ2V0UmVsZWFzZUNvbmZpZyhjb25maWcpO1xuICB9XG59XG4iXX0=