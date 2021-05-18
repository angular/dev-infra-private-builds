/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __awaiter, __generator } from "tslib";
import * as semver from 'semver';
import { computeLtsEndDateOfMajor, fetchProjectNpmPackageInfo, getLtsNpmDistTagOfMajor, getVersionOfBranch } from '../../../release/versioning';
import { promptConfirm, red, warn, yellow } from '../../../utils/console';
import { InvalidTargetBranchError } from '../target-label';
/**
 * Asserts that the given branch corresponds to an active LTS version-branch that can receive
 * backport fixes. Throws an error if LTS expired or an invalid branch is selected.
 *
 * @param repo Repository containing the given branch. Used for Github API queries.
 * @param releaseConfig Configuration for releases. Used to query NPM about past publishes.
 * @param branchName Branch that is checked to be an active LTS version-branch.
 * */
export function assertActiveLtsBranch(repo, releaseConfig, branchName) {
    return __awaiter(this, void 0, void 0, function () {
        var version, _a, distTags, time, ltsNpmTag, ltsVersion, today, majorReleaseDate, ltsEndDate, ltsEndDateText;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getVersionOfBranch(repo, branchName)];
                case 1:
                    version = _b.sent();
                    return [4 /*yield*/, fetchProjectNpmPackageInfo(releaseConfig)];
                case 2:
                    _a = _b.sent(), distTags = _a["dist-tags"], time = _a.time;
                    ltsNpmTag = getLtsNpmDistTagOfMajor(version.major);
                    ltsVersion = semver.parse(distTags[ltsNpmTag]);
                    // Ensure that there is an LTS version tagged for the given version-branch major. e.g.
                    // if the version branch is `9.2.x` then we want to make sure that there is an LTS
                    // version tagged in NPM for `v9`, following the `v{major}-lts` tag convention.
                    if (ltsVersion === null) {
                        throw new InvalidTargetBranchError("No LTS version tagged for v" + version.major + " in NPM.");
                    }
                    // Ensure that the correct branch is used for the LTS version. We do not want to merge
                    // changes to older minor version branches that do not reflect the current LTS version.
                    if (branchName !== ltsVersion.major + "." + ltsVersion.minor + ".x") {
                        throw new InvalidTargetBranchError("Not using last-minor branch for v" + version.major + " LTS version. PR " +
                            ("should be updated to target: " + ltsVersion.major + "." + ltsVersion.minor + ".x"));
                    }
                    today = new Date();
                    majorReleaseDate = new Date(time[version.major + ".0.0"]);
                    ltsEndDate = computeLtsEndDateOfMajor(majorReleaseDate);
                    if (!(today > ltsEndDate)) return [3 /*break*/, 4];
                    ltsEndDateText = ltsEndDate.toLocaleDateString();
                    warn(red("Long-term support ended for v" + version.major + " on " + ltsEndDateText + "."));
                    warn(yellow("Merging of pull requests for this major is generally not " +
                        "desired, but can be forcibly ignored."));
                    return [4 /*yield*/, promptConfirm('Do you want to forcibly proceed with merging?')];
                case 3:
                    if (_b.sent()) {
                        return [2 /*return*/];
                    }
                    throw new InvalidTargetBranchError("Long-term supported ended for v" + version.major + " on " + ltsEndDateText + ". " +
                        ("Pull request cannot be merged into the " + branchName + " branch."));
                case 4: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibHRzLWJyYW5jaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wci9tZXJnZS9kZWZhdWx0cy9sdHMtYnJhbmNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7QUFFSCxPQUFPLEtBQUssTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUdqQyxPQUFPLEVBQUMsd0JBQXdCLEVBQUUsMEJBQTBCLEVBQUUsdUJBQXVCLEVBQUUsa0JBQWtCLEVBQW9CLE1BQU0sNkJBQTZCLENBQUM7QUFDakssT0FBTyxFQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3hFLE9BQU8sRUFBQyx3QkFBd0IsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBRXpEOzs7Ozs7O0tBT0s7QUFDTCxNQUFNLFVBQWdCLHFCQUFxQixDQUN2QyxJQUF1QixFQUFFLGFBQTRCLEVBQUUsVUFBa0I7Ozs7O3dCQUMzRCxxQkFBTSxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLEVBQUE7O29CQUFwRCxPQUFPLEdBQUcsU0FBMEM7b0JBQ3BCLHFCQUFNLDBCQUEwQixDQUFDLGFBQWEsQ0FBQyxFQUFBOztvQkFBL0UsS0FBZ0MsU0FBK0MsRUFBakUsUUFBUSxrQkFBQSxFQUFFLElBQUksVUFBQTtvQkFHNUIsU0FBUyxHQUFHLHVCQUF1QixDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDbkQsVUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBRXJELHNGQUFzRjtvQkFDdEYsa0ZBQWtGO29CQUNsRiwrRUFBK0U7b0JBQy9FLElBQUksVUFBVSxLQUFLLElBQUksRUFBRTt3QkFDdkIsTUFBTSxJQUFJLHdCQUF3QixDQUFDLGdDQUE4QixPQUFPLENBQUMsS0FBSyxhQUFVLENBQUMsQ0FBQztxQkFDM0Y7b0JBRUQsc0ZBQXNGO29CQUN0Rix1RkFBdUY7b0JBQ3ZGLElBQUksVUFBVSxLQUFRLFVBQVUsQ0FBQyxLQUFLLFNBQUksVUFBVSxDQUFDLEtBQUssT0FBSSxFQUFFO3dCQUM5RCxNQUFNLElBQUksd0JBQXdCLENBQzlCLHNDQUFvQyxPQUFPLENBQUMsS0FBSyxzQkFBbUI7NkJBQ3BFLGtDQUFnQyxVQUFVLENBQUMsS0FBSyxTQUFJLFVBQVUsQ0FBQyxLQUFLLE9BQUksQ0FBQSxDQUFDLENBQUM7cUJBQy9FO29CQUVLLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNuQixnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLEtBQUssU0FBTSxDQUFDLENBQUMsQ0FBQztvQkFDMUQsVUFBVSxHQUFHLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7eUJBSzFELENBQUEsS0FBSyxHQUFHLFVBQVUsQ0FBQSxFQUFsQix3QkFBa0I7b0JBQ2QsY0FBYyxHQUFHLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO29CQUN2RCxJQUFJLENBQUMsR0FBRyxDQUFDLGtDQUFnQyxPQUFPLENBQUMsS0FBSyxZQUFPLGNBQWMsTUFBRyxDQUFDLENBQUMsQ0FBQztvQkFDakYsSUFBSSxDQUFDLE1BQU0sQ0FDUCwyREFBMkQ7d0JBQzNELHVDQUF1QyxDQUFDLENBQUMsQ0FBQztvQkFDMUMscUJBQU0sYUFBYSxDQUFDLCtDQUErQyxDQUFDLEVBQUE7O29CQUF4RSxJQUFJLFNBQW9FLEVBQUU7d0JBQ3hFLHNCQUFPO3FCQUNSO29CQUNELE1BQU0sSUFBSSx3QkFBd0IsQ0FDOUIsb0NBQWtDLE9BQU8sQ0FBQyxLQUFLLFlBQU8sY0FBYyxPQUFJO3lCQUN4RSw0Q0FBMEMsVUFBVSxhQUFVLENBQUEsQ0FBQyxDQUFDOzs7OztDQUV2RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge2NvbXB1dGVMdHNFbmREYXRlT2ZNYWpvciwgZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm8sIGdldEx0c05wbURpc3RUYWdPZk1ham9yLCBnZXRWZXJzaW9uT2ZCcmFuY2gsIEdpdGh1YlJlcG9XaXRoQXBpfSBmcm9tICcuLi8uLi8uLi9yZWxlYXNlL3ZlcnNpb25pbmcnO1xuaW1wb3J0IHtwcm9tcHRDb25maXJtLCByZWQsIHdhcm4sIHllbGxvd30gZnJvbSAnLi4vLi4vLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge0ludmFsaWRUYXJnZXRCcmFuY2hFcnJvcn0gZnJvbSAnLi4vdGFyZ2V0LWxhYmVsJztcblxuLyoqXG4gKiBBc3NlcnRzIHRoYXQgdGhlIGdpdmVuIGJyYW5jaCBjb3JyZXNwb25kcyB0byBhbiBhY3RpdmUgTFRTIHZlcnNpb24tYnJhbmNoIHRoYXQgY2FuIHJlY2VpdmVcbiAqIGJhY2twb3J0IGZpeGVzLiBUaHJvd3MgYW4gZXJyb3IgaWYgTFRTIGV4cGlyZWQgb3IgYW4gaW52YWxpZCBicmFuY2ggaXMgc2VsZWN0ZWQuXG4gKlxuICogQHBhcmFtIHJlcG8gUmVwb3NpdG9yeSBjb250YWluaW5nIHRoZSBnaXZlbiBicmFuY2guIFVzZWQgZm9yIEdpdGh1YiBBUEkgcXVlcmllcy5cbiAqIEBwYXJhbSByZWxlYXNlQ29uZmlnIENvbmZpZ3VyYXRpb24gZm9yIHJlbGVhc2VzLiBVc2VkIHRvIHF1ZXJ5IE5QTSBhYm91dCBwYXN0IHB1Ymxpc2hlcy5cbiAqIEBwYXJhbSBicmFuY2hOYW1lIEJyYW5jaCB0aGF0IGlzIGNoZWNrZWQgdG8gYmUgYW4gYWN0aXZlIExUUyB2ZXJzaW9uLWJyYW5jaC5cbiAqICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXNzZXJ0QWN0aXZlTHRzQnJhbmNoKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCByZWxlYXNlQ29uZmlnOiBSZWxlYXNlQ29uZmlnLCBicmFuY2hOYW1lOiBzdHJpbmcpIHtcbiAgY29uc3QgdmVyc2lvbiA9IGF3YWl0IGdldFZlcnNpb25PZkJyYW5jaChyZXBvLCBicmFuY2hOYW1lKTtcbiAgY29uc3QgeydkaXN0LXRhZ3MnOiBkaXN0VGFncywgdGltZX0gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhyZWxlYXNlQ29uZmlnKTtcblxuICAvLyBMVFMgdmVyc2lvbnMgc2hvdWxkIGJlIHRhZ2dlZCBpbiBOUE0gaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6IGB2e21ham9yfS1sdHNgLlxuICBjb25zdCBsdHNOcG1UYWcgPSBnZXRMdHNOcG1EaXN0VGFnT2ZNYWpvcih2ZXJzaW9uLm1ham9yKTtcbiAgY29uc3QgbHRzVmVyc2lvbiA9IHNlbXZlci5wYXJzZShkaXN0VGFnc1tsdHNOcG1UYWddKTtcblxuICAvLyBFbnN1cmUgdGhhdCB0aGVyZSBpcyBhbiBMVFMgdmVyc2lvbiB0YWdnZWQgZm9yIHRoZSBnaXZlbiB2ZXJzaW9uLWJyYW5jaCBtYWpvci4gZS5nLlxuICAvLyBpZiB0aGUgdmVyc2lvbiBicmFuY2ggaXMgYDkuMi54YCB0aGVuIHdlIHdhbnQgdG8gbWFrZSBzdXJlIHRoYXQgdGhlcmUgaXMgYW4gTFRTXG4gIC8vIHZlcnNpb24gdGFnZ2VkIGluIE5QTSBmb3IgYHY5YCwgZm9sbG93aW5nIHRoZSBgdnttYWpvcn0tbHRzYCB0YWcgY29udmVudGlvbi5cbiAgaWYgKGx0c1ZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKGBObyBMVFMgdmVyc2lvbiB0YWdnZWQgZm9yIHYke3ZlcnNpb24ubWFqb3J9IGluIE5QTS5gKTtcbiAgfVxuXG4gIC8vIEVuc3VyZSB0aGF0IHRoZSBjb3JyZWN0IGJyYW5jaCBpcyB1c2VkIGZvciB0aGUgTFRTIHZlcnNpb24uIFdlIGRvIG5vdCB3YW50IHRvIG1lcmdlXG4gIC8vIGNoYW5nZXMgdG8gb2xkZXIgbWlub3IgdmVyc2lvbiBicmFuY2hlcyB0aGF0IGRvIG5vdCByZWZsZWN0IHRoZSBjdXJyZW50IExUUyB2ZXJzaW9uLlxuICBpZiAoYnJhbmNoTmFtZSAhPT0gYCR7bHRzVmVyc2lvbi5tYWpvcn0uJHtsdHNWZXJzaW9uLm1pbm9yfS54YCkge1xuICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3IoXG4gICAgICAgIGBOb3QgdXNpbmcgbGFzdC1taW5vciBicmFuY2ggZm9yIHYke3ZlcnNpb24ubWFqb3J9IExUUyB2ZXJzaW9uLiBQUiBgICtcbiAgICAgICAgYHNob3VsZCBiZSB1cGRhdGVkIHRvIHRhcmdldDogJHtsdHNWZXJzaW9uLm1ham9yfS4ke2x0c1ZlcnNpb24ubWlub3J9LnhgKTtcbiAgfVxuXG4gIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgY29uc3QgbWFqb3JSZWxlYXNlRGF0ZSA9IG5ldyBEYXRlKHRpbWVbYCR7dmVyc2lvbi5tYWpvcn0uMC4wYF0pO1xuICBjb25zdCBsdHNFbmREYXRlID0gY29tcHV0ZUx0c0VuZERhdGVPZk1ham9yKG1ham9yUmVsZWFzZURhdGUpO1xuXG4gIC8vIENoZWNrIGlmIExUUyBoYXMgYWxyZWFkeSBleHBpcmVkIGZvciB0aGUgdGFyZ2V0ZWQgbWFqb3IgdmVyc2lvbi4gSWYgc28sIHdlIGRvIG5vdFxuICAvLyBhbGxvdyB0aGUgbWVyZ2UgYXMgcGVyIG91ciBMVFMgZ3VhcmFudGVlcy4gQ2FuIGJlIGZvcmNpYmx5IG92ZXJyaWRkZW4gaWYgZGVzaXJlZC5cbiAgLy8gU2VlOiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvcmVsZWFzZXMjc3VwcG9ydC1wb2xpY3ktYW5kLXNjaGVkdWxlLlxuICBpZiAodG9kYXkgPiBsdHNFbmREYXRlKSB7XG4gICAgY29uc3QgbHRzRW5kRGF0ZVRleHQgPSBsdHNFbmREYXRlLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgIHdhcm4ocmVkKGBMb25nLXRlcm0gc3VwcG9ydCBlbmRlZCBmb3IgdiR7dmVyc2lvbi5tYWpvcn0gb24gJHtsdHNFbmREYXRlVGV4dH0uYCkpO1xuICAgIHdhcm4oeWVsbG93KFxuICAgICAgICBgTWVyZ2luZyBvZiBwdWxsIHJlcXVlc3RzIGZvciB0aGlzIG1ham9yIGlzIGdlbmVyYWxseSBub3QgYCArXG4gICAgICAgIGBkZXNpcmVkLCBidXQgY2FuIGJlIGZvcmNpYmx5IGlnbm9yZWQuYCkpO1xuICAgIGlmIChhd2FpdCBwcm9tcHRDb25maXJtKCdEbyB5b3Ugd2FudCB0byBmb3JjaWJseSBwcm9jZWVkIHdpdGggbWVyZ2luZz8nKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldEJyYW5jaEVycm9yKFxuICAgICAgICBgTG9uZy10ZXJtIHN1cHBvcnRlZCBlbmRlZCBmb3IgdiR7dmVyc2lvbi5tYWpvcn0gb24gJHtsdHNFbmREYXRlVGV4dH0uIGAgK1xuICAgICAgICBgUHVsbCByZXF1ZXN0IGNhbm5vdCBiZSBtZXJnZWQgaW50byB0aGUgJHticmFuY2hOYW1lfSBicmFuY2guYCk7XG4gIH1cbn1cbiJdfQ==