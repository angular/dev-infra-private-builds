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
        define("@angular/dev-infra-private/pr/merge/defaults/lts-branch", ["require", "exports", "tslib", "node-fetch", "semver", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge/target-label", "@angular/dev-infra-private/pr/merge/defaults/branches"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertActiveLtsBranch = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    var semver = require("semver");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    var branches_1 = require("@angular/dev-infra-private/pr/merge/defaults/branches");
    /**
     * Number of months a major version in Angular is actively supported. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    var majorActiveSupportDuration = 6;
    /**
     * Number of months a major version has active long-term support. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    var majorActiveTermSupportDuration = 12;
    /**
     * Asserts that the given branch corresponds to an active LTS version-branch that can receive
     * backported fixes. Throws an error if LTS expired or an invalid branch is selected.
     */
    function assertActiveLtsBranch(repo, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var version, _a, distTags, time, ltsVersion, today, releaseDate, ltsEndDate, ltsEndDateText;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, branches_1.getVersionOfBranch(repo, branchName)];
                    case 1:
                        version = _b.sent();
                        return [4 /*yield*/, node_fetch_1.default("https://registry.npmjs.org/" + repo.npmPackageName)];
                    case 2: return [4 /*yield*/, (_b.sent()).json()];
                    case 3:
                        _a = _b.sent(), distTags = _a["dist-tags"], time = _a.time;
                        ltsVersion = semver.parse(distTags["v" + version.major + "-lts"]);
                        // Ensure that there is a LTS version tagged for the given version-branch major. e.g.
                        // if the version branch is `9.2.x` then we want to make sure that there is a LTS
                        // version tagged in NPM for `v9`, following the `v{major}-lts` tag convention.
                        if (ltsVersion === null) {
                            throw new target_label_1.InvalidTargetBranchError("No LTS version tagged for v" + version.major + " in NPM.");
                        }
                        // Ensure that the correct branch is used for the LTS version. We do not want to merge
                        // changes to older minor version branches that do not reflect the current LTS version.
                        if (branchName !== ltsVersion.major + "." + ltsVersion.minor + ".x") {
                            throw new target_label_1.InvalidTargetBranchError("Not using last-minor branch for v" + version.major + " LTS version. PR " +
                                ("should be updated to target: " + ltsVersion.major + "." + ltsVersion.minor + ".x"));
                        }
                        today = new Date();
                        releaseDate = new Date(time[version.major + ".0.0"]);
                        ltsEndDate = new Date(releaseDate.getFullYear(), releaseDate.getMonth() + majorActiveSupportDuration + majorActiveTermSupportDuration, releaseDate.getDate(), releaseDate.getHours(), releaseDate.getMinutes(), releaseDate.getSeconds(), releaseDate.getMilliseconds());
                        if (!(today > ltsEndDate)) return [3 /*break*/, 5];
                        ltsEndDateText = ltsEndDate.toLocaleDateString();
                        console_1.warn(console_1.red("Long-term support ended for v" + version.major + " on " + ltsEndDateText + "."));
                        console_1.warn(console_1.yellow("Merging of pull requests for this major is generally not " +
                            "desired, but can be forcibly ignored."));
                        return [4 /*yield*/, console_1.promptConfirm('Do you want to forcibly proceed with merging?')];
                    case 4:
                        if (_b.sent()) {
                            return [2 /*return*/];
                        }
                        throw new target_label_1.InvalidTargetBranchError("Long-term supported ended for v" + version.major + " on " + ltsEndDateText + ". " +
                            ("Pull request cannot be merged into the " + branchName + " branch."));
                    case 5: return [2 /*return*/];
                }
            });
        });
    }
    exports.assertActiveLtsBranch = assertActiveLtsBranch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHRzLWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9kZWZhdWx0cy9sdHMtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5Q0FBK0I7SUFDL0IsK0JBQWlDO0lBRWpDLG9FQUF3RTtJQUN4RSxpRkFBeUQ7SUFFekQsa0ZBQTBEO0lBRTFEOzs7T0FHRztJQUNILElBQU0sMEJBQTBCLEdBQUcsQ0FBQyxDQUFDO0lBRXJDOzs7T0FHRztJQUNILElBQU0sOEJBQThCLEdBQUcsRUFBRSxDQUFDO0lBRTFDOzs7T0FHRztJQUNILFNBQXNCLHFCQUFxQixDQUFDLElBQWdCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5RCxxQkFBTSw2QkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUE7O3dCQUFwRCxPQUFPLEdBQUcsU0FBMEM7d0JBRS9DLHFCQUFNLG9CQUFLLENBQUMsZ0NBQThCLElBQUksQ0FBQyxjQUFnQixDQUFDLEVBQUE7NEJBQXZFLHFCQUFNLENBQUMsU0FBZ0UsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFBOzt3QkFEN0UsS0FDRixTQUErRSxFQUQvRCxRQUFRLGtCQUFBLEVBQUUsSUFBSSxVQUFBO3dCQUk1QixVQUFVLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBSSxPQUFPLENBQUMsS0FBSyxTQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUVuRSxxRkFBcUY7d0JBQ3JGLGlGQUFpRjt3QkFDakYsK0VBQStFO3dCQUMvRSxJQUFJLFVBQVUsS0FBSyxJQUFJLEVBQUU7NEJBQ3ZCLE1BQU0sSUFBSSx1Q0FBd0IsQ0FBQyxnQ0FBOEIsT0FBTyxDQUFDLEtBQUssYUFBVSxDQUFDLENBQUM7eUJBQzNGO3dCQUVELHNGQUFzRjt3QkFDdEYsdUZBQXVGO3dCQUN2RixJQUFJLFVBQVUsS0FBUSxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksRUFBRTs0QkFDOUQsTUFBTSxJQUFJLHVDQUF3QixDQUM5QixzQ0FBb0MsT0FBTyxDQUFDLEtBQUssc0JBQW1CO2lDQUNwRSxrQ0FBZ0MsVUFBVSxDQUFDLEtBQUssU0FBSSxVQUFVLENBQUMsS0FBSyxPQUFJLENBQUEsQ0FBQyxDQUFDO3lCQUMvRTt3QkFFSyxLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDbkIsV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBSSxPQUFPLENBQUMsS0FBSyxTQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUNyRCxVQUFVLEdBQUcsSUFBSSxJQUFJLENBQ3ZCLFdBQVcsQ0FBQyxXQUFXLEVBQUUsRUFDekIsV0FBVyxDQUFDLFFBQVEsRUFBRSxHQUFHLDBCQUEwQixHQUFHLDhCQUE4QixFQUNwRixXQUFXLENBQUMsT0FBTyxFQUFFLEVBQUUsV0FBVyxDQUFDLFFBQVEsRUFBRSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsRUFDdkUsV0FBVyxDQUFDLFVBQVUsRUFBRSxFQUFFLFdBQVcsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDOzZCQUt6RCxDQUFBLEtBQUssR0FBRyxVQUFVLENBQUEsRUFBbEIsd0JBQWtCO3dCQUNkLGNBQWMsR0FBRyxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQzt3QkFDdkQsY0FBSSxDQUFDLGFBQUcsQ0FBQyxrQ0FBZ0MsT0FBTyxDQUFDLEtBQUssWUFBTyxjQUFjLE1BQUcsQ0FBQyxDQUFDLENBQUM7d0JBQ2pGLGNBQUksQ0FBQyxnQkFBTSxDQUNQLDJEQUEyRDs0QkFDM0QsdUNBQXVDLENBQUMsQ0FBQyxDQUFDO3dCQUMxQyxxQkFBTSx1QkFBYSxDQUFDLCtDQUErQyxDQUFDLEVBQUE7O3dCQUF4RSxJQUFJLFNBQW9FLEVBQUU7NEJBQ3hFLHNCQUFPO3lCQUNSO3dCQUNELE1BQU0sSUFBSSx1Q0FBd0IsQ0FDOUIsb0NBQWtDLE9BQU8sQ0FBQyxLQUFLLFlBQU8sY0FBYyxPQUFJOzZCQUN4RSw0Q0FBMEMsVUFBVSxhQUFVLENBQUEsQ0FBQyxDQUFDOzs7OztLQUV2RTtJQS9DRCxzREErQ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbmltcG9ydCB7cHJvbXB0Q29uZmlybSwgcmVkLCB3YXJuLCB5ZWxsb3d9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3J9IGZyb20gJy4uL3RhcmdldC1sYWJlbCc7XG5cbmltcG9ydCB7Z2V0VmVyc2lvbk9mQnJhbmNoLCBHaXRodWJSZXBvfSBmcm9tICcuL2JyYW5jaGVzJztcblxuLyoqXG4gKiBOdW1iZXIgb2YgbW9udGhzIGEgbWFqb3IgdmVyc2lvbiBpbiBBbmd1bGFyIGlzIGFjdGl2ZWx5IHN1cHBvcnRlZC4gU2VlOlxuICogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3JlbGVhc2VzI3N1cHBvcnQtcG9saWN5LWFuZC1zY2hlZHVsZS5cbiAqL1xuY29uc3QgbWFqb3JBY3RpdmVTdXBwb3J0RHVyYXRpb24gPSA2O1xuXG4vKipcbiAqIE51bWJlciBvZiBtb250aHMgYSBtYWpvciB2ZXJzaW9uIGhhcyBhY3RpdmUgbG9uZy10ZXJtIHN1cHBvcnQuIFNlZTpcbiAqIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9yZWxlYXNlcyNzdXBwb3J0LXBvbGljeS1hbmQtc2NoZWR1bGUuXG4gKi9cbmNvbnN0IG1ham9yQWN0aXZlVGVybVN1cHBvcnREdXJhdGlvbiA9IDEyO1xuXG4vKipcbiAqIEFzc2VydHMgdGhhdCB0aGUgZ2l2ZW4gYnJhbmNoIGNvcnJlc3BvbmRzIHRvIGFuIGFjdGl2ZSBMVFMgdmVyc2lvbi1icmFuY2ggdGhhdCBjYW4gcmVjZWl2ZVxuICogYmFja3BvcnRlZCBmaXhlcy4gVGhyb3dzIGFuIGVycm9yIGlmIExUUyBleHBpcmVkIG9yIGFuIGludmFsaWQgYnJhbmNoIGlzIHNlbGVjdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKHJlcG86IEdpdGh1YlJlcG8sIGJyYW5jaE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2ZXJzaW9uID0gYXdhaXQgZ2V0VmVyc2lvbk9mQnJhbmNoKHJlcG8sIGJyYW5jaE5hbWUpO1xuICBjb25zdCB7J2Rpc3QtdGFncyc6IGRpc3RUYWdzLCB0aW1lfSA9XG4gICAgICBhd2FpdCAoYXdhaXQgZmV0Y2goYGh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnLyR7cmVwby5ucG1QYWNrYWdlTmFtZX1gKSkuanNvbigpO1xuXG4gIC8vIExUUyB2ZXJzaW9ucyBzaG91bGQgYmUgdGFnZ2VkIGluIE5QTSBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDogYHZ7bWFqb3J9LWx0c2AuXG4gIGNvbnN0IGx0c1ZlcnNpb24gPSBzZW12ZXIucGFyc2UoZGlzdFRhZ3NbYHYke3ZlcnNpb24ubWFqb3J9LWx0c2BdKTtcblxuICAvLyBFbnN1cmUgdGhhdCB0aGVyZSBpcyBhIExUUyB2ZXJzaW9uIHRhZ2dlZCBmb3IgdGhlIGdpdmVuIHZlcnNpb24tYnJhbmNoIG1ham9yLiBlLmcuXG4gIC8vIGlmIHRoZSB2ZXJzaW9uIGJyYW5jaCBpcyBgOS4yLnhgIHRoZW4gd2Ugd2FudCB0byBtYWtlIHN1cmUgdGhhdCB0aGVyZSBpcyBhIExUU1xuICAvLyB2ZXJzaW9uIHRhZ2dlZCBpbiBOUE0gZm9yIGB2OWAsIGZvbGxvd2luZyB0aGUgYHZ7bWFqb3J9LWx0c2AgdGFnIGNvbnZlbnRpb24uXG4gIGlmIChsdHNWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihgTm8gTFRTIHZlcnNpb24gdGFnZ2VkIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBpbiBOUE0uYCk7XG4gIH1cblxuICAvLyBFbnN1cmUgdGhhdCB0aGUgY29ycmVjdCBicmFuY2ggaXMgdXNlZCBmb3IgdGhlIExUUyB2ZXJzaW9uLiBXZSBkbyBub3Qgd2FudCB0byBtZXJnZVxuICAvLyBjaGFuZ2VzIHRvIG9sZGVyIG1pbm9yIHZlcnNpb24gYnJhbmNoZXMgdGhhdCBkbyBub3QgcmVmbGVjdCB0aGUgY3VycmVudCBMVFMgdmVyc2lvbi5cbiAgaWYgKGJyYW5jaE5hbWUgIT09IGAke2x0c1ZlcnNpb24ubWFqb3J9LiR7bHRzVmVyc2lvbi5taW5vcn0ueGApIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICBgTm90IHVzaW5nIGxhc3QtbWlub3IgYnJhbmNoIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBMVFMgdmVyc2lvbi4gUFIgYCArXG4gICAgICAgIGBzaG91bGQgYmUgdXBkYXRlZCB0byB0YXJnZXQ6ICR7bHRzVmVyc2lvbi5tYWpvcn0uJHtsdHNWZXJzaW9uLm1pbm9yfS54YCk7XG4gIH1cblxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IHJlbGVhc2VEYXRlID0gbmV3IERhdGUodGltZVtgJHt2ZXJzaW9uLm1ham9yfS4wLjBgXSk7XG4gIGNvbnN0IGx0c0VuZERhdGUgPSBuZXcgRGF0ZShcbiAgICAgIHJlbGVhc2VEYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICByZWxlYXNlRGF0ZS5nZXRNb250aCgpICsgbWFqb3JBY3RpdmVTdXBwb3J0RHVyYXRpb24gKyBtYWpvckFjdGl2ZVRlcm1TdXBwb3J0RHVyYXRpb24sXG4gICAgICByZWxlYXNlRGF0ZS5nZXREYXRlKCksIHJlbGVhc2VEYXRlLmdldEhvdXJzKCksIHJlbGVhc2VEYXRlLmdldE1pbnV0ZXMoKSxcbiAgICAgIHJlbGVhc2VEYXRlLmdldFNlY29uZHMoKSwgcmVsZWFzZURhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xuXG4gIC8vIENoZWNrIGlmIExUUyBoYXMgYWxyZWFkeSBleHBpcmVkIGZvciB0aGUgdGFyZ2V0ZWQgbWFqb3IgdmVyc2lvbi4gSWYgc28sIHdlIGRvIG5vdFxuICAvLyBhbGxvdyB0aGUgbWVyZ2UgYXMgcGVyIG91ciBMVFMgZ3VhcmFudGVlcy4gQ2FuIGJlIGZvcmNpYmx5IG92ZXJyaWRkZW4gaWYgZGVzaXJlZC5cbiAgLy8gU2VlOiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvcmVsZWFzZXMjc3VwcG9ydC1wb2xpY3ktYW5kLXNjaGVkdWxlLlxuICBpZiAodG9kYXkgPiBsdHNFbmREYXRlKSB7XG4gICAgY29uc3QgbHRzRW5kRGF0ZVRleHQgPSBsdHNFbmREYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgIHdhcm4ocmVkKGBMb25nLXRlcm0gc3VwcG9ydCBlbmRlZCBmb3IgdiR7dmVyc2lvbi5tYWpvcn0gb24gJHtsdHNFbmREYXRlVGV4dH0uYCkpO1xuICAgIHdhcm4oeWVsbG93KFxuICAgICAgICBgTWVyZ2luZyBvZiBwdWxsIHJlcXVlc3RzIGZvciB0aGlzIG1ham9yIGlzIGdlbmVyYWxseSBub3QgYCArXG4gICAgICAgIGBkZXNpcmVkLCBidXQgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQuYCkpO1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICBgTG9uZy10ZXJtIHN1cHBvcnRlZCBlbmRlZCBmb3IgdiR7dmVyc2lvbi5tYWpvcn0gb24gJHtsdHNFbmREYXRlVGV4dH0uIGAgK1xuICAgICAgICBgUHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBtZXJnZWQgaW50byB0aGUgJHticmFuY2hOYW1lfSBicmFuY2guYCk7XG4gIH1cbn1cbiJdfQ==