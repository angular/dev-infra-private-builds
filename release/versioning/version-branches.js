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
        define("@angular/dev-infra-private/release/versioning/version-branches", ["require", "exports", "tslib", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBranchesForMajorVersions = exports.getVersionForVersionBranch = exports.isVersionBranch = exports.getVersionOfBranch = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    /** Regular expression that matches version-branches. */
    var versionBranchNameRegex = /^(\d+)\.(\d+)\.x$/;
    /** Gets the version of a given branch by reading the `package.json` upstream. */
    function getVersionOfBranch(repo, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, content, version, parsedVersion;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repo.api.repos.getContents({ owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName })];
                    case 1:
                        data = (_a.sent()).data;
                        content = Array.isArray(data) ? '' : data.content || '';
                        version = JSON.parse(Buffer.from(content, 'base64').toString()).version;
                        parsedVersion = semver.parse(version);
                        if (parsedVersion === null) {
                            throw Error("Invalid version detected in following branch: " + branchName + ".");
                        }
                        return [2 /*return*/, parsedVersion];
                }
            });
        });
    }
    exports.getVersionOfBranch = getVersionOfBranch;
    /** Whether the given branch corresponds to a version branch. */
    function isVersionBranch(branchName) {
        return versionBranchNameRegex.test(branchName);
    }
    exports.isVersionBranch = isVersionBranch;
    /**
     * Converts a given version-branch into a SemVer version that can be used with SemVer
     * utilities. e.g. to determine semantic order, extract major digit, compare.
     *
     * For example `10.0.x` will become `10.0.0` in SemVer. The patch digit is not
     * relevant but needed for parsing. SemVer does not allow `x` as patch digit.
     */
    function getVersionForVersionBranch(branchName) {
        return semver.parse(branchName.replace(versionBranchNameRegex, '$1.$2.0'));
    }
    exports.getVersionForVersionBranch = getVersionForVersionBranch;
    /**
     * Gets the version branches for the specified major versions in descending
     * order. i.e. latest version branches first.
     */
    function getBranchesForMajorVersions(repo, majorVersions) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var branchData, branches, branchData_1, branchData_1_1, name_1, parsed;
            var e_1, _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, repo.api.repos.listBranches({ owner: repo.owner, repo: repo.name, protected: true, per_page: 100 })];
                    case 1:
                        branchData = (_b.sent()).data;
                        branches = [];
                        try {
                            for (branchData_1 = tslib_1.__values(branchData), branchData_1_1 = branchData_1.next(); !branchData_1_1.done; branchData_1_1 = branchData_1.next()) {
                                name_1 = branchData_1_1.value.name;
                                if (!isVersionBranch(name_1)) {
                                    continue;
                                }
                                parsed = getVersionForVersionBranch(name_1);
                                // Collect all version-branches that match the specified major versions.
                                if (parsed !== null && majorVersions.includes(parsed.major)) {
                                    branches.push({ name: name_1, parsed: parsed });
                                }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (branchData_1_1 && !branchData_1_1.done && (_a = branchData_1.return)) _a.call(branchData_1);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        // Sort captured version-branches in descending order.
                        return [2 /*return*/, branches.sort(function (a, b) { return semver.rcompare(a.parsed, b.parsed); })];
                }
            });
        });
    }
    exports.getBranchesForMajorVersions = getBranchesForMajorVersions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBcUJqQyx3REFBd0Q7SUFDeEQsSUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQztJQUVuRCxpRkFBaUY7SUFDakYsU0FBc0Isa0JBQWtCLENBQ3BDLElBQXVCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzNDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBRDFFLElBQUksR0FBSSxDQUFBLFNBQ2tFLENBQUEsS0FEdEU7d0JBRUwsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7d0JBQ3ZELE9BQU8sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUM3QixRQUQzQixDQUM0Qjt3QkFDcEMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVDLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTs0QkFDMUIsTUFBTSxLQUFLLENBQUMsbURBQWlELFVBQVUsTUFBRyxDQUFDLENBQUM7eUJBQzdFO3dCQUNELHNCQUFPLGFBQWEsRUFBQzs7OztLQUN0QjtJQVpELGdEQVlDO0lBRUQsZ0VBQWdFO0lBQ2hFLFNBQWdCLGVBQWUsQ0FBQyxVQUFrQjtRQUNoRCxPQUFPLHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsMENBRUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxTQUFnQiwwQkFBMEIsQ0FBQyxVQUFrQjtRQUMzRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFGRCxnRUFFQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLDJCQUEyQixDQUM3QyxJQUF1QixFQUFFLGFBQXVCOzs7Ozs7NEJBR3ZCLHFCQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FDeEQsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxFQUFBOzt3QkFENUQsVUFBVSxHQUFJLENBQUEsU0FDOEMsQ0FBQSxLQURsRDt3QkFFakIsUUFBUSxHQUFvQixFQUFFLENBQUM7OzRCQUVyQyxLQUFxQixlQUFBLGlCQUFBLFVBQVUsQ0FBQSxvR0FBRTtnQ0FBckIsa0NBQUk7Z0NBQ2QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFJLENBQUMsRUFBRTtvQ0FDMUIsU0FBUztpQ0FDVjtnQ0FHSyxNQUFNLEdBQUcsMEJBQTBCLENBQUMsTUFBSSxDQUFDLENBQUM7Z0NBQ2hELHdFQUF3RTtnQ0FDeEUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO29DQUMzRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO2lDQUMvQjs2QkFDRjs7Ozs7Ozs7O3dCQUVELHNEQUFzRDt3QkFDdEQsc0JBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLEVBQUM7Ozs7S0FDckU7SUF2QkQsa0VBdUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtHaXRodWJDbGllbnQsIEdpdGh1YlJlcG99IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkgd2l0aCBjb3JyZXNwb25kaW5nIEFQSSBjbGllbnQuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG9XaXRoQXBpIGV4dGVuZHMgR2l0aHViUmVwbyB7XG4gIC8qKiBBUEkgY2xpZW50IHRoYXQgY2FuIGFjY2VzcyB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgYXBpOiBHaXRodWJDbGllbnQ7XG59XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSB2ZXJzaW9uLWJyYW5jaC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbkJyYW5jaCB7XG4gIC8qKiBOYW1lIG9mIHRoZSBicmFuY2ggaW4gR2l0LiBlLmcuIGAxMC4wLnhgLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBQYXJzZWQgU2VtVmVyIHZlcnNpb24gZm9yIHRoZSB2ZXJzaW9uLWJyYW5jaC4gVmVyc2lvbiBicmFuY2hlcyB0ZWNobmljYWxseSBkb1xuICAgKiBub3QgZm9sbG93IHRoZSBTZW1WZXIgZm9ybWF0LCBidXQgd2UgY2FuIGhhdmUgcmVwcmVzZW50YXRpdmUgU2VtVmVyIHZlcnNpb25zXG4gICAqIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGNvbXBhcmlzb25zLCBzb3J0aW5nIGFuZCBvdGhlciBjaGVja3MuXG4gICAqL1xuICBwYXJzZWQ6IHNlbXZlci5TZW1WZXI7XG59XG5cbi8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHZlcnNpb24tYnJhbmNoZXMuICovXG5jb25zdCB2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4ID0gL14oXFxkKylcXC4oXFxkKylcXC54JC87XG5cbi8qKiBHZXRzIHRoZSB2ZXJzaW9uIG9mIGEgZ2l2ZW4gYnJhbmNoIGJ5IHJlYWRpbmcgdGhlIGBwYWNrYWdlLmpzb25gIHVwc3RyZWFtLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlcnNpb25PZkJyYW5jaChcbiAgICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSwgYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHJlcG8uYXBpLnJlcG9zLmdldENvbnRlbnRzKFxuICAgICAge293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHBhdGg6ICcvcGFja2FnZS5qc29uJywgcmVmOiBicmFuY2hOYW1lfSk7XG4gIGNvbnN0IGNvbnRlbnQgPSBBcnJheS5pc0FycmF5KGRhdGEpID8gJycgOiBkYXRhLmNvbnRlbnQgfHwgJyc7XG4gIGNvbnN0IHt2ZXJzaW9ufSA9IEpTT04ucGFyc2UoQnVmZmVyLmZyb20oY29udGVudCwgJ2Jhc2U2NCcpLnRvU3RyaW5nKCkpIGFzXG4gICAgICB7dmVyc2lvbjogc3RyaW5nLCBba2V5OiBzdHJpbmddOiBhbnl9O1xuICBjb25zdCBwYXJzZWRWZXJzaW9uID0gc2VtdmVyLnBhcnNlKHZlcnNpb24pO1xuICBpZiAocGFyc2VkVmVyc2lvbiA9PT0gbnVsbCkge1xuICAgIHRocm93IEVycm9yKGBJbnZhbGlkIHZlcnNpb24gZGV0ZWN0ZWQgaW4gZm9sbG93aW5nIGJyYW5jaDogJHticmFuY2hOYW1lfS5gKTtcbiAgfVxuICByZXR1cm4gcGFyc2VkVmVyc2lvbjtcbn1cblxuLyoqIFdoZXRoZXIgdGhlIGdpdmVuIGJyYW5jaCBjb3JyZXNwb25kcyB0byBhIHZlcnNpb24gYnJhbmNoLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzVmVyc2lvbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHZlcnNpb25CcmFuY2hOYW1lUmVnZXgudGVzdChicmFuY2hOYW1lKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggU2VtVmVyXG4gKiB1dGlsaXRpZXMuIGUuZy4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLCBleHRyYWN0IG1ham9yIGRpZ2l0LCBjb21wYXJlLlxuICpcbiAqIEZvciBleGFtcGxlIGAxMC4wLnhgIHdpbGwgYmVjb21lIGAxMC4wLjBgIGluIFNlbVZlci4gVGhlIHBhdGNoIGRpZ2l0IGlzIG5vdFxuICogcmVsZXZhbnQgYnV0IG5lZWRlZCBmb3IgcGFyc2luZy4gU2VtVmVyIGRvZXMgbm90IGFsbG93IGB4YCBhcyBwYXRjaCBkaWdpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFZlcnNpb25Gb3JWZXJzaW9uQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IHNlbXZlci5TZW1WZXJ8bnVsbCB7XG4gIHJldHVybiBzZW12ZXIucGFyc2UoYnJhbmNoTmFtZS5yZXBsYWNlKHZlcnNpb25CcmFuY2hOYW1lUmVnZXgsICckMS4kMi4wJykpO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHZlcnNpb24gYnJhbmNoZXMgZm9yIHRoZSBzcGVjaWZpZWQgbWFqb3IgdmVyc2lvbnMgaW4gZGVzY2VuZGluZ1xuICogb3JkZXIuIGkuZS4gbGF0ZXN0IHZlcnNpb24gYnJhbmNoZXMgZmlyc3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCcmFuY2hlc0Zvck1ham9yVmVyc2lvbnMoXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIG1ham9yVmVyc2lvbnM6IG51bWJlcltdKTogUHJvbWlzZTxWZXJzaW9uQnJhbmNoW10+IHtcbiAgLy8gVE9ETyhhbHhodWIpOiBhY3R1YWxseSBwYWdpbmF0ZSB0aGlzLCBzaW5jZSBldmVudHVhbGx5IHRoZSBudW1iZXIgb2YgYnJhbmNoZXMgd2UgaGF2ZSB3aWxsIHJ1blxuICAvLyBvZmYgdGhlIGVuZCBvZiB0aGUgZmlyc3QgcGFnZSBvZiBkYXRhIHJldHVybmVkIGJ5IGBsaXN0QnJhbmNoZXNgLlxuICBjb25zdCB7ZGF0YTogYnJhbmNoRGF0YX0gPSBhd2FpdCByZXBvLmFwaS5yZXBvcy5saXN0QnJhbmNoZXMoXG4gICAgICB7b3duZXI6IHJlcG8ub3duZXIsIHJlcG86IHJlcG8ubmFtZSwgcHJvdGVjdGVkOiB0cnVlLCBwZXJfcGFnZTogMTAwfSk7XG4gIGNvbnN0IGJyYW5jaGVzOiBWZXJzaW9uQnJhbmNoW10gPSBbXTtcblxuICBmb3IgKGNvbnN0IHtuYW1lfSBvZiBicmFuY2hEYXRhKSB7XG4gICAgaWYgKCFpc1ZlcnNpb25CcmFuY2gobmFtZSkpIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICAvLyBDb252ZXJ0IHRoZSB2ZXJzaW9uLWJyYW5jaCBpbnRvIGEgU2VtVmVyIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIHRoZVxuICAgIC8vIFNlbVZlciB1dGlsaXRpZXMuIGUuZy4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLCBjb21wYXJlIHZlcnNpb25zLlxuICAgIGNvbnN0IHBhcnNlZCA9IGdldFZlcnNpb25Gb3JWZXJzaW9uQnJhbmNoKG5hbWUpO1xuICAgIC8vIENvbGxlY3QgYWxsIHZlcnNpb24tYnJhbmNoZXMgdGhhdCBtYXRjaCB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb25zLlxuICAgIGlmIChwYXJzZWQgIT09IG51bGwgJiYgbWFqb3JWZXJzaW9ucy5pbmNsdWRlcyhwYXJzZWQubWFqb3IpKSB7XG4gICAgICBicmFuY2hlcy5wdXNoKHtuYW1lLCBwYXJzZWR9KTtcbiAgICB9XG4gIH1cblxuICAvLyBTb3J0IGNhcHR1cmVkIHZlcnNpb24tYnJhbmNoZXMgaW4gZGVzY2VuZGluZyBvcmRlci5cbiAgcmV0dXJuIGJyYW5jaGVzLnNvcnQoKGEsIGIpID0+IHNlbXZlci5yY29tcGFyZShhLnBhcnNlZCwgYi5wYXJzZWQpKTtcbn1cbiJdfQ==