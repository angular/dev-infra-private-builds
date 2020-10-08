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
        define("@angular/dev-infra-private/pr/merge/defaults/lts-branch", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/merge/target-label"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertActiveLtsBranch = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var versioning_1 = require("@angular/dev-infra-private/release/versioning");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var target_label_1 = require("@angular/dev-infra-private/pr/merge/target-label");
    /**
     * Asserts that the given branch corresponds to an active LTS version-branch that can receive
     * backport fixes. Throws an error if LTS expired or an invalid branch is selected.
     *
     * @param repo Repository containing the given branch. Used for Github API queries.
     * @param releaseConfig Configuration for releases. Used to query NPM about past publishes.
     * @param branchName Branch that is checked to be an active LTS version-branch.
     * */
    function assertActiveLtsBranch(repo, releaseConfig, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var version, _a, distTags, time, ltsNpmTag, ltsVersion, today, majorReleaseDate, ltsEndDate, ltsEndDateText;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, versioning_1.getVersionOfBranch(repo, branchName)];
                    case 1:
                        version = _b.sent();
                        return [4 /*yield*/, versioning_1.fetchProjectNpmPackageInfo(releaseConfig)];
                    case 2:
                        _a = _b.sent(), distTags = _a["dist-tags"], time = _a.time;
                        ltsNpmTag = versioning_1.getLtsNpmDistTagOfMajor(version.major);
                        ltsVersion = semver.parse(distTags[ltsNpmTag]);
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
                        majorReleaseDate = new Date(time[version.major + ".0.0"]);
                        ltsEndDate = versioning_1.computeLtsEndDateOfMajor(majorReleaseDate);
                        if (!(today > ltsEndDate)) return [3 /*break*/, 4];
                        ltsEndDateText = ltsEndDate.toLocaleDateString();
                        console_1.warn(console_1.red("Long-term support ended for v" + version.major + " on " + ltsEndDateText + "."));
                        console_1.warn(console_1.yellow("Merging of pull requests for this major is generally not " +
                            "desired, but can be forcibly ignored."));
                        return [4 /*yield*/, console_1.promptConfirm('Do you want to forcibly proceed with merging?')];
                    case 3:
                        if (_b.sent()) {
                            return [2 /*return*/];
                        }
                        throw new target_label_1.InvalidTargetBranchError("Long-term supported ended for v" + version.major + " on " + ltsEndDateText + ". " +
                            ("Pull request cannot be merged into the " + branchName + " branch."));
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    exports.assertActiveLtsBranch = assertActiveLtsBranch;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHRzLWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9kZWZhdWx0cy9sdHMtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFHakMsNEVBQWlLO0lBQ2pLLG9FQUF3RTtJQUN4RSxpRkFBeUQ7SUFFekQ7Ozs7Ozs7U0FPSztJQUNMLFNBQXNCLHFCQUFxQixDQUN2QyxJQUF1QixFQUFFLGFBQTRCLEVBQUUsVUFBa0I7Ozs7OzRCQUMzRCxxQkFBTSwrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUE7O3dCQUFwRCxPQUFPLEdBQUcsU0FBMEM7d0JBQ3BCLHFCQUFNLHVDQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFBOzt3QkFBL0UsS0FBZ0MsU0FBK0MsRUFBakUsUUFBUSxrQkFBQSxFQUFFLElBQUksVUFBQTt3QkFHNUIsU0FBUyxHQUFHLG9DQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkQsVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7d0JBRXJELHFGQUFxRjt3QkFDckYsaUZBQWlGO3dCQUNqRiwrRUFBK0U7d0JBQy9FLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTs0QkFDdkIsTUFBTSxJQUFJLHVDQUF3QixDQUFDLGdDQUE4QixPQUFPLENBQUMsS0FBSyxhQUFVLENBQUMsQ0FBQzt5QkFDM0Y7d0JBRUQsc0ZBQXNGO3dCQUN0Rix1RkFBdUY7d0JBQ3ZGLElBQUksVUFBVSxLQUFRLFVBQVUsQ0FBQyxLQUFLLFNBQUksVUFBVSxDQUFDLEtBQUssT0FBSSxFQUFFOzRCQUM5RCxNQUFNLElBQUksdUNBQXdCLENBQzlCLHNDQUFvQyxPQUFPLENBQUMsS0FBSyxzQkFBbUI7aUNBQ3BFLGtDQUFnQyxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQSxDQUFDLENBQUM7eUJBQy9FO3dCQUVLLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO3dCQUNuQixnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLEtBQUssU0FBTSxDQUFDLENBQUMsQ0FBQzt3QkFDMUQsVUFBVSxHQUFHLHFDQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7NkJBSzFELENBQUEsS0FBSyxHQUFHLFVBQVUsQ0FBQSxFQUFsQix3QkFBa0I7d0JBQ2QsY0FBYyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO3dCQUN2RCxjQUFJLENBQUMsYUFBRyxDQUFDLGtDQUFnQyxPQUFPLENBQUMsS0FBSyxZQUFPLGNBQWMsTUFBRyxDQUFDLENBQUMsQ0FBQzt3QkFDakYsY0FBSSxDQUFDLGdCQUFNLENBQ1AsMkRBQTJEOzRCQUMzRCx1Q0FBdUMsQ0FBQyxDQUFDLENBQUM7d0JBQzFDLHFCQUFNLHVCQUFhLENBQUMsK0NBQStDLENBQUMsRUFBQTs7d0JBQXhFLElBQUksU0FBb0UsRUFBRTs0QkFDeEUsc0JBQU87eUJBQ1I7d0JBQ0QsTUFBTSxJQUFJLHVDQUF3QixDQUM5QixvQ0FBa0MsT0FBTyxDQUFDLEtBQUssWUFBTyxjQUFjLE9BQUk7NkJBQ3hFLDRDQUEwQyxVQUFVLGFBQVUsQ0FBQSxDQUFDLENBQUM7Ozs7O0tBRXZFO0lBNUNELHNEQTRDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge2NvbXB1dGVMdHNFbmREYXRlT2ZNYWpvciwgZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm8sIGdldEx0c05wbURpc3RUYWdPZk1ham9yLCBnZXRWZXJzaW9uT2ZCcmFuY2gsIEdpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuaW1wb3J0IHtwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0ludmFsaWRUYXJnZXRCcmFuY2hFcnJvcn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGdpdmVuIGJyYW5jaCBjb3JyZXNwb25kcyB0byBhbiBhY3RpdmUgTFRTIHZlcnNpb24tYnJhbmNoIHRoYXQgY2FuIHJlY2VpdmVcbiAqIGJhY2twb3J0IGZpeGVzLiBUaHJvd3MgYW4gZXJyb3IgaWYgTFRTIGV4cGlyZWQgb3IgYW4gaW52YWxpZCBicmFuY2ggaXMgc2VsZWN0ZWQuXG4gKlxuICogQHBhcmFtIHJlcG8gUmVwb3NpdG9yeSBjb250YWluaW5nIHRoZSBnaXZlbiBicmFuY2guIFVzZWQgZm9yIEdpdGh1YiBBUEkgcXVlcmllcy5cbiAqIEBwYXJhbSByZWxlYXNlQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2VzLiBVc2VkIHRvIHF1ZXJ5IE5QTSBhYm91dCBwYXN0IHB1Ymxpc2hlcy5cbiAqIEBwYXJhbSBicmFuY2hOYW1lIEJyYW5jaCB0aGF0IGlzIGNoZWNrZWQgdG8gYmUgYW4gYWN0aXZlIExUUyB2ZXJzaW9uLWJyYW5jaC5cbiAqICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCByZWxlYXNlQ29uZmlnOiBSZWxlYXNlQ29uZmlnLCBicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBicmFuY2hOYW1lKTtcbiAgY29uc3QgeydkaXN0LXRhZ3MnOiBkaXN0VGFncywgdGltZX0gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhyZWxlYXNlQ29uZmlnKTtcblxuICAvLyBMVFMgdmVyc2lvbnMgc2hvdWxkIGJlIHRhZ2dlZCBpbiBOUE0gaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6IGB2e21ham9yfS1sdHNgLlxuICBjb25zdCBsdHNOcG1UYWcgPSBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcih2ZXJzaW9uLm1ham9yKTtcbiAgY29uc3QgbHRzVmVyc2lvbiA9IHNlbXZlci5wYXJzZShkaXN0VGFnc1tsdHNOcG1UYWddKTtcblxuICAvLyBFbnN1cmUgdGhhdCB0aGVyZSBpcyBhIExUUyB2ZXJzaW9uIHRhZ2dlZCBmb3IgdGhlIGdpdmVuIHZlcnNpb24tYnJhbmNoIG1ham9yLiBlLmcuXG4gIC8vIGlmIHRoZSB2ZXJzaW9uIGJyYW5jaCBpcyBgOS4yLnhgIHRoZW4gd2Ugd2FudCB0byBtYWtlIHN1cmUgdGhhdCB0aGVyZSBpcyBhIExUU1xuICAvLyB2ZXJzaW9uIHRhZ2dlZCBpbiBOUE0gZm9yIGB2OWAsIGZvbGxvd2luZyB0aGUgYHZ7bWFqb3J9LWx0c2AgdGFnIGNvbnZlbnRpb24uXG4gIGlmIChsdHNWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihgTm8gTFRTIHZlcnNpb24gdGFnZ2VkIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBpbiBOUE0uYCk7XG4gIH1cblxuICAvLyBFbnN1cmUgdGhhdCB0aGUgY29ycmVjdCBicmFuY2ggaXMgdXNlZCBmb3IgdGhlIExUUyB2ZXJzaW9uLiBXZSBkbyBub3Qgd2FudCB0byBtZXJnZVxuICAvLyBjaGFuZ2VzIHRvIG9sZGVyIG1pbm9yIHZlcnNpb24gYnJhbmNoZXMgdGhhdCBkbyBub3QgcmVmbGVjdCB0aGUgY3VycmVudCBMVFMgdmVyc2lvbi5cbiAgaWYgKGJyYW5jaE5hbWUgIT09IGAke2x0c1ZlcnNpb24ubWFqb3J9LiR7bHRzVmVyc2lvbi5taW5vcn0ueGApIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICBgTm90IHVzaW5nIGxhc3QtbWlub3IgYnJhbmNoIGZvciB2JHt2ZXJzaW9uLm1ham9yfSBMVFMgdmVyc2lvbi4gUFIgYCArXG4gICAgICAgIGBzaG91bGQgYmUgdXBkYXRlZCB0byB0YXJnZXQ6ICR7bHRzVmVyc2lvbi5tYWpvcn0uJHtsdHNWZXJzaW9uLm1pbm9yfS54YCk7XG4gIH1cblxuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IG1ham9yUmVsZWFzZURhdGUgPSBuZXcgRGF0ZSh0aW1lW2Ake3ZlcnNpb24ubWFqb3J9LjAuMGBdKTtcbiAgY29uc3QgbHRzRW5kRGF0ZSA9IGNvbXB1dGVMdHNFbmREYXRlT2ZNYWpvcihtYWpvclJlbGVhc2VEYXRlKTtcblxuICAvLyBDaGVjayBpZiBMVFMgaGFzIGFscmVhZHkgZXhwaXJlZCBmb3IgdGhlIHRhcmdldGVkIG1ham9yIHZlcnNpb24uIElmIHNvLCB3ZSBkbyBub3RcbiAgLy8gYWxsb3cgdGhlIG1lcmdlIGFzIHBlciBvdXIgTFRTIGd1YXJhbnRlZXMuIENhbiBiZSBmb3JjaWJseSBvdmVycmlkZGVuIGlmIGRlc2lyZWQuXG4gIC8vIFNlZTogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3JlbGVhc2VzI3N1cHBvcnQtcG9saWN5LWFuZC1zY2hlZHVsZS5cbiAgaWYgKHRvZGF5ID4gbHRzRW5kRGF0ZSkge1xuICAgIGNvbnN0IGx0c0VuZERhdGVUZXh0ID0gbHRzRW5kRGF0ZS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICB3YXJuKHJlZChgTG9uZy10ZXJtIHN1cHBvcnQgZW5kZWQgZm9yIHYke3ZlcnNpb24ubWFqb3J9IG9uICR7bHRzRW5kRGF0ZVRleHR9LmApKTtcbiAgICB3YXJuKHllbGxvdyhcbiAgICAgICAgYE1lcmdpbmcgb2YgcHVsbCByZXF1ZXN0cyBmb3IgdGhpcyBtYWpvciBpcyBnZW5lcmFsbHkgbm90IGAgK1xuICAgICAgICBgZGVzaXJlZCwgYnV0IGNhbiBiZSBmb3JjaWJseSBpZ25vcmVkLmApKTtcbiAgICBpZiAoYXdhaXQgcHJvbXB0Q29uZmlybSgnRG8geW91IHdhbnQgdG8gZm9yY2libHkgcHJvY2VlZCB3aXRoIG1lcmdpbmc/JykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEludmFsaWRUYXJnZXRCcmFuY2hFcnJvcihcbiAgICAgICAgYExvbmctdGVybSBzdXBwb3J0ZWQgZW5kZWQgZm9yIHYke3ZlcnNpb24ubWFqb3J9IG9uICR7bHRzRW5kRGF0ZVRleHR9LiBgICtcbiAgICAgICAgYFB1bGwgcmVxdWVzdCBjYW5ub3QgYmUgbWVyZ2VkIGludG8gdGhlICR7YnJhbmNoTmFtZX0gYnJhbmNoLmApO1xuICB9XG59XG4iXX0=