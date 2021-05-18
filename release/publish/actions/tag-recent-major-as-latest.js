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
        define("@angular/dev-infra-private/release/publish/actions/tag-recent-major-as-latest", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning/npm-registry", "@angular/dev-infra-private/release/publish/actions", "@angular/dev-infra-private/release/publish/external-commands"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TagRecentMajorAsLatest = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var npm_registry_1 = require("@angular/dev-infra-private/release/versioning/npm-registry");
    var actions_1 = require("@angular/dev-infra-private/release/publish/actions");
    var external_commands_1 = require("@angular/dev-infra-private/release/publish/external-commands");
    /**
     * Release action that tags the recently published major as latest within the NPM
     * registry. Major versions are published to the `next` NPM dist tag initially and
     * can be re-tagged to the `latest` NPM dist tag. This allows caretakers to make major
     * releases available at the same time. e.g. Framework, Tooling and Components
     * are able to publish v12 to `@latest` at the same time. This wouldn't be possible if
     * we directly publish to `@latest` because Tooling and Components needs to wait
     * for the major framework release to be available on NPM.
     * @see {CutStableAction#perform} for more details.
     */
    var TagRecentMajorAsLatest = /** @class */ (function (_super) {
        tslib_1.__extends(TagRecentMajorAsLatest, _super);
        function TagRecentMajorAsLatest() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        TagRecentMajorAsLatest.prototype.getDescription = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    return [2 /*return*/, "Tag recently published major v" + this.active.latest.version + " as \"next\" in NPM."];
                });
            });
        };
        TagRecentMajorAsLatest.prototype.perform = function () {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.checkoutUpstreamBranch(this.active.latest.branchName)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, external_commands_1.invokeYarnInstallCommand(this.projectDir)];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, external_commands_1.invokeSetNpmDistCommand('latest', this.active.latest.version)];
                        case 3:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        TagRecentMajorAsLatest.isActive = function (_a, config) {
            var latest = _a.latest;
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var packageInfo, npmLatestVersion;
                return tslib_1.__generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // If the latest release-train does currently not have a major version as version. e.g.
                            // the latest branch is `10.0.x` with the version being `10.0.2`. In such cases, a major
                            // has not been released recently, and this action should never become active.
                            if (latest.version.minor !== 0 || latest.version.patch !== 0) {
                                return [2 /*return*/, false];
                            }
                            return [4 /*yield*/, npm_registry_1.fetchProjectNpmPackageInfo(config)];
                        case 1:
                            packageInfo = _b.sent();
                            npmLatestVersion = semver.parse(packageInfo['dist-tags']['latest']);
                            // This action only becomes active if a major just has been released recently, but is
                            // not set to the `latest` NPM dist tag in the NPM registry. Note that we only allow
                            // re-tagging if the current `@latest` in NPM is the previous major version.
                            return [2 /*return*/, npmLatestVersion !== null && npmLatestVersion.major === latest.version.major - 1];
                    }
                });
            });
        };
        return TagRecentMajorAsLatest;
    }(actions_1.ReleaseAction));
    exports.TagRecentMajorAsLatest = TagRecentMajorAsLatest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS9wdWJsaXNoL2FjdGlvbnMvdGFnLXJlY2VudC1tYWpvci1hcy1sYXRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUlqQywyRkFBeUU7SUFDekUsOEVBQXlDO0lBQ3pDLGtHQUF1RjtJQUV2Rjs7Ozs7Ozs7O09BU0c7SUFDSDtRQUE0QyxrREFBYTtRQUF6RDs7UUEwQkEsQ0FBQztRQXpCTywrQ0FBYyxHQUFwQjs7O29CQUNFLHNCQUFPLG1DQUFpQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLHlCQUFvQixFQUFDOzs7U0FDeEY7UUFFSyx3Q0FBTyxHQUFiOzs7O2dDQUNFLHFCQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBQWhFLFNBQWdFLENBQUM7NEJBQ2pFLHFCQUFNLDRDQUF3QixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQTs7NEJBQS9DLFNBQStDLENBQUM7NEJBQ2hELHFCQUFNLDJDQUF1QixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBQTs7NEJBQW5FLFNBQW1FLENBQUM7Ozs7O1NBQ3JFO1FBRVksK0JBQVEsR0FBckIsVUFBc0IsRUFBNkIsRUFBRSxNQUFxQjtnQkFBbkQsTUFBTSxZQUFBOzs7Ozs7NEJBQzNCLHVGQUF1Rjs0QkFDdkYsd0ZBQXdGOzRCQUN4Riw4RUFBOEU7NEJBQzlFLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLENBQUMsRUFBRTtnQ0FDNUQsc0JBQU8sS0FBSyxFQUFDOzZCQUNkOzRCQUVtQixxQkFBTSx5Q0FBMEIsQ0FBQyxNQUFNLENBQUMsRUFBQTs7NEJBQXRELFdBQVcsR0FBRyxTQUF3Qzs0QkFDdEQsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzs0QkFDMUUscUZBQXFGOzRCQUNyRixvRkFBb0Y7NEJBQ3BGLDRFQUE0RTs0QkFDNUUsc0JBQU8sZ0JBQWdCLEtBQUssSUFBSSxJQUFJLGdCQUFnQixDQUFDLEtBQUssS0FBSyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUM7Ozs7U0FDekY7UUFDSCw2QkFBQztJQUFELENBQUMsQUExQkQsQ0FBNEMsdUJBQWEsR0EwQnhEO0lBMUJZLHdEQUFzQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi9jb25maWcnO1xuaW1wb3J0IHtBY3RpdmVSZWxlYXNlVHJhaW5zfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL2FjdGl2ZS1yZWxlYXNlLXRyYWlucyc7XG5pbXBvcnQge2ZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvfSBmcm9tICcuLi8uLi92ZXJzaW9uaW5nL25wbS1yZWdpc3RyeSc7XG5pbXBvcnQge1JlbGVhc2VBY3Rpb259IGZyb20gJy4uL2FjdGlvbnMnO1xuaW1wb3J0IHtpbnZva2VTZXROcG1EaXN0Q29tbWFuZCwgaW52b2tlWWFybkluc3RhbGxDb21tYW5kfSBmcm9tICcuLi9leHRlcm5hbC1jb21tYW5kcyc7XG5cbi8qKlxuICogUmVsZWFzZSBhY3Rpb24gdGhhdCB0YWdzIHRoZSByZWNlbnRseSBwdWJsaXNoZWQgbWFqb3IgYXMgbGF0ZXN0IHdpdGhpbiB0aGUgTlBNXG4gKiByZWdpc3RyeS4gTWFqb3IgdmVyc2lvbnMgYXJlIHB1Ymxpc2hlZCB0byB0aGUgYG5leHRgIE5QTSBkaXN0IHRhZyBpbml0aWFsbHkgYW5kXG4gKiBjYW4gYmUgcmUtdGFnZ2VkIHRvIHRoZSBgbGF0ZXN0YCBOUE0gZGlzdCB0YWcuIFRoaXMgYWxsb3dzIGNhcmV0YWtlcnMgdG8gbWFrZSBtYWpvclxuICogcmVsZWFzZXMgYXZhaWxhYmxlIGF0IHRoZSBzYW1lIHRpbWUuIGUuZy4gRnJhbWV3b3JrLCBUb29saW5nIGFuZCBDb21wb25lbnRzXG4gKiBhcmUgYWJsZSB0byBwdWJsaXNoIHYxMiB0byBgQGxhdGVzdGAgYXQgdGhlIHNhbWUgdGltZS4gVGhpcyB3b3VsZG4ndCBiZSBwb3NzaWJsZSBpZlxuICogd2UgZGlyZWN0bHkgcHVibGlzaCB0byBgQGxhdGVzdGAgYmVjYXVzZSBUb29saW5nIGFuZCBDb21wb25lbnRzIG5lZWRzIHRvIHdhaXRcbiAqIGZvciB0aGUgbWFqb3IgZnJhbWV3b3JrIHJlbGVhc2UgdG8gYmUgYXZhaWxhYmxlIG9uIE5QTS5cbiAqIEBzZWUge0N1dFN0YWJsZUFjdGlvbiNwZXJmb3JtfSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgY2xhc3MgVGFnUmVjZW50TWFqb3JBc0xhdGVzdCBleHRlbmRzIFJlbGVhc2VBY3Rpb24ge1xuICBhc3luYyBnZXREZXNjcmlwdGlvbigpIHtcbiAgICByZXR1cm4gYFRhZyByZWNlbnRseSBwdWJsaXNoZWQgbWFqb3IgdiR7dGhpcy5hY3RpdmUubGF0ZXN0LnZlcnNpb259IGFzIFwibmV4dFwiIGluIE5QTS5gO1xuICB9XG5cbiAgYXN5bmMgcGVyZm9ybSgpIHtcbiAgICBhd2FpdCB0aGlzLmNoZWNrb3V0VXBzdHJlYW1CcmFuY2godGhpcy5hY3RpdmUubGF0ZXN0LmJyYW5jaE5hbWUpO1xuICAgIGF3YWl0IGludm9rZVlhcm5JbnN0YWxsQ29tbWFuZCh0aGlzLnByb2plY3REaXIpO1xuICAgIGF3YWl0IGludm9rZVNldE5wbURpc3RDb21tYW5kKCdsYXRlc3QnLCB0aGlzLmFjdGl2ZS5sYXRlc3QudmVyc2lvbik7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgaXNBY3RpdmUoe2xhdGVzdH06IEFjdGl2ZVJlbGVhc2VUcmFpbnMsIGNvbmZpZzogUmVsZWFzZUNvbmZpZykge1xuICAgIC8vIElmIHRoZSBsYXRlc3QgcmVsZWFzZS10cmFpbiBkb2VzIGN1cnJlbnRseSBub3QgaGF2ZSBhIG1ham9yIHZlcnNpb24gYXMgdmVyc2lvbi4gZS5nLlxuICAgIC8vIHRoZSBsYXRlc3QgYnJhbmNoIGlzIGAxMC4wLnhgIHdpdGggdGhlIHZlcnNpb24gYmVpbmcgYDEwLjAuMmAuIEluIHN1Y2ggY2FzZXMsIGEgbWFqb3JcbiAgICAvLyBoYXMgbm90IGJlZW4gcmVsZWFzZWQgcmVjZW50bHksIGFuZCB0aGlzIGFjdGlvbiBzaG91bGQgbmV2ZXIgYmVjb21lIGFjdGl2ZS5cbiAgICBpZiAobGF0ZXN0LnZlcnNpb24ubWlub3IgIT09IDAgfHwgbGF0ZXN0LnZlcnNpb24ucGF0Y2ggIT09IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBjb25zdCBwYWNrYWdlSW5mbyA9IGF3YWl0IGZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvKGNvbmZpZyk7XG4gICAgY29uc3QgbnBtTGF0ZXN0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShwYWNrYWdlSW5mb1snZGlzdC10YWdzJ11bJ2xhdGVzdCddKTtcbiAgICAvLyBUaGlzIGFjdGlvbiBvbmx5IGJlY29tZXMgYWN0aXZlIGlmIGEgbWFqb3IganVzdCBoYXMgYmVlbiByZWxlYXNlZCByZWNlbnRseSwgYnV0IGlzXG4gICAgLy8gbm90IHNldCB0byB0aGUgYGxhdGVzdGAgTlBNIGRpc3QgdGFnIGluIHRoZSBOUE0gcmVnaXN0cnkuIE5vdGUgdGhhdCB3ZSBvbmx5IGFsbG93XG4gICAgLy8gcmUtdGFnZ2luZyBpZiB0aGUgY3VycmVudCBgQGxhdGVzdGAgaW4gTlBNIGlzIHRoZSBwcmV2aW91cyBtYWpvciB2ZXJzaW9uLlxuICAgIHJldHVybiBucG1MYXRlc3RWZXJzaW9uICE9PSBudWxsICYmIG5wbUxhdGVzdFZlcnNpb24ubWFqb3IgPT09IGxhdGVzdC52ZXJzaW9uLm1ham9yIC0gMTtcbiAgfVxufVxuIl19