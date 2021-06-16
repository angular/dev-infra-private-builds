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
                    case 0: return [4 /*yield*/, repo.api.repos.listBranches({ owner: repo.owner, repo: repo.name, protected: true })];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBcUJqQyx3REFBd0Q7SUFDeEQsSUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQztJQUVuRCxpRkFBaUY7SUFDakYsU0FBc0Isa0JBQWtCLENBQ3BDLElBQXVCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzNDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBRDFFLElBQUksR0FBSSxDQUFBLFNBQ2tFLENBQUEsS0FEdEU7d0JBRUwsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7d0JBQ3ZELE9BQU8sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUM3QixRQUQzQixDQUM0Qjt3QkFDcEMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVDLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTs0QkFDMUIsTUFBTSxLQUFLLENBQUMsbURBQWlELFVBQVUsTUFBRyxDQUFDLENBQUM7eUJBQzdFO3dCQUNELHNCQUFPLGFBQWEsRUFBQzs7OztLQUN0QjtJQVpELGdEQVlDO0lBRUQsZ0VBQWdFO0lBQ2hFLFNBQWdCLGVBQWUsQ0FBQyxVQUFrQjtRQUNoRCxPQUFPLHNCQUFzQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRkQsMENBRUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxTQUFnQiwwQkFBMEIsQ0FBQyxVQUFrQjtRQUMzRCxPQUFPLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFGRCxnRUFFQztJQUVEOzs7T0FHRztJQUNILFNBQXNCLDJCQUEyQixDQUM3QyxJQUF1QixFQUFFLGFBQXVCOzs7Ozs7NEJBRTlDLHFCQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFBOzt3QkFEL0UsVUFBVSxHQUNuQixDQUFBLFNBQXdGLENBQUEsS0FEckU7d0JBRWpCLFFBQVEsR0FBb0IsRUFBRSxDQUFDOzs0QkFFckMsS0FBcUIsZUFBQSxpQkFBQSxVQUFVLENBQUEsb0dBQUU7Z0NBQXJCLGtDQUFJO2dDQUNkLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBSSxDQUFDLEVBQUU7b0NBQzFCLFNBQVM7aUNBQ1Y7Z0NBR0ssTUFBTSxHQUFHLDBCQUEwQixDQUFDLE1BQUksQ0FBQyxDQUFDO2dDQUNoRCx3RUFBd0U7Z0NBQ3hFLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQ0FDM0QsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksUUFBQSxFQUFFLE1BQU0sUUFBQSxFQUFDLENBQUMsQ0FBQztpQ0FDL0I7NkJBQ0Y7Ozs7Ozs7Ozt3QkFFRCxzREFBc0Q7d0JBQ3RELHNCQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQyxFQUFDOzs7O0tBQ3JFO0lBckJELGtFQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7R2l0aHViQ2xpZW50LCBHaXRodWJSZXBvfSBmcm9tICcuLi8uLi91dGlscy9naXQvZ2l0aHViJztcblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIEdpdGh1YiByZXBvc2l0b3J5IHdpdGggY29ycmVzcG9uZGluZyBBUEkgY2xpZW50LiAqL1xuZXhwb3J0IGludGVyZmFjZSBHaXRodWJSZXBvV2l0aEFwaSBleHRlbmRzIEdpdGh1YlJlcG8ge1xuICAvKiogQVBJIGNsaWVudCB0aGF0IGNhbiBhY2Nlc3MgdGhlIHJlcG9zaXRvcnkuICovXG4gIGFwaTogR2l0aHViQ2xpZW50O1xufVxuXG4vKiogVHlwZSBkZXNjcmliaW5nIGEgdmVyc2lvbi1icmFuY2guICovXG5leHBvcnQgaW50ZXJmYWNlIFZlcnNpb25CcmFuY2gge1xuICAvKiogTmFtZSBvZiB0aGUgYnJhbmNoIGluIEdpdC4gZS5nLiBgMTAuMC54YC4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKipcbiAgICogUGFyc2VkIFNlbVZlciB2ZXJzaW9uIGZvciB0aGUgdmVyc2lvbi1icmFuY2guIFZlcnNpb24gYnJhbmNoZXMgdGVjaG5pY2FsbHkgZG9cbiAgICogbm90IGZvbGxvdyB0aGUgU2VtVmVyIGZvcm1hdCwgYnV0IHdlIGNhbiBoYXZlIHJlcHJlc2VudGF0aXZlIFNlbVZlciB2ZXJzaW9uc1xuICAgKiB0aGF0IGNhbiBiZSB1c2VkIGZvciBjb21wYXJpc29ucywgc29ydGluZyBhbmQgb3RoZXIgY2hlY2tzLlxuICAgKi9cbiAgcGFyc2VkOiBzZW12ZXIuU2VtVmVyO1xufVxuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyB2ZXJzaW9uLWJyYW5jaGVzLiAqL1xuY29uc3QgdmVyc2lvbkJyYW5jaE5hbWVSZWdleCA9IC9eKFxcZCspXFwuKFxcZCspXFwueCQvO1xuXG4vKiogR2V0cyB0aGUgdmVyc2lvbiBvZiBhIGdpdmVuIGJyYW5jaCBieSByZWFkaW5nIHRoZSBgcGFja2FnZS5qc29uYCB1cHN0cmVhbS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRWZXJzaW9uT2ZCcmFuY2goXG4gICAgcmVwbzogR2l0aHViUmVwb1dpdGhBcGksIGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8c2VtdmVyLlNlbVZlcj4ge1xuICBjb25zdCB7ZGF0YX0gPSBhd2FpdCByZXBvLmFwaS5yZXBvcy5nZXRDb250ZW50cyhcbiAgICAgIHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBwYXRoOiAnL3BhY2thZ2UuanNvbicsIHJlZjogYnJhbmNoTmFtZX0pO1xuICBjb25zdCBjb250ZW50ID0gQXJyYXkuaXNBcnJheShkYXRhKSA/ICcnIDogZGF0YS5jb250ZW50IHx8ICcnO1xuICBjb25zdCB7dmVyc2lvbn0gPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKGNvbnRlbnQsICdiYXNlNjQnKS50b1N0cmluZygpKSBhc1xuICAgICAge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgY29uc3QgcGFyc2VkVmVyc2lvbiA9IHNlbXZlci5wYXJzZSh2ZXJzaW9uKTtcbiAgaWYgKHBhcnNlZFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCB2ZXJzaW9uIGRldGVjdGVkIGluIGZvbGxvd2luZyBicmFuY2g6ICR7YnJhbmNoTmFtZX0uYCk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFZlcnNpb247XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29ycmVzcG9uZHMgdG8gYSB2ZXJzaW9uIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZlcnNpb25CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LnRlc3QoYnJhbmNoTmFtZSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiB2ZXJzaW9uLWJyYW5jaCBpbnRvIGEgU2VtVmVyIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIFNlbVZlclxuICogdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgZXh0cmFjdCBtYWpvciBkaWdpdCwgY29tcGFyZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSBgMTAuMC54YCB3aWxsIGJlY29tZSBgMTAuMC4wYCBpbiBTZW1WZXIuIFRoZSBwYXRjaCBkaWdpdCBpcyBub3RcbiAqIHJlbGV2YW50IGJ1dCBuZWVkZWQgZm9yIHBhcnNpbmcuIFNlbVZlciBkb2VzIG5vdCBhbGxvdyBgeGAgYXMgcGF0Y2ggZGlnaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBzZW12ZXIuU2VtVmVyfG51bGwge1xuICByZXR1cm4gc2VtdmVyLnBhcnNlKGJyYW5jaE5hbWUucmVwbGFjZSh2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LCAnJDEuJDIuMCcpKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2ZXJzaW9uIGJyYW5jaGVzIGZvciB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb25zIGluIGRlc2NlbmRpbmdcbiAqIG9yZGVyLiBpLmUuIGxhdGVzdCB2ZXJzaW9uIGJyYW5jaGVzIGZpcnN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBtYWpvclZlcnNpb25zOiBudW1iZXJbXSk6IFByb21pc2U8VmVyc2lvbkJyYW5jaFtdPiB7XG4gIGNvbnN0IHtkYXRhOiBicmFuY2hEYXRhfSA9XG4gICAgICBhd2FpdCByZXBvLmFwaS5yZXBvcy5saXN0QnJhbmNoZXMoe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHByb3RlY3RlZDogdHJ1ZX0pO1xuICBjb25zdCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdID0gW107XG5cbiAgZm9yIChjb25zdCB7bmFtZX0gb2YgYnJhbmNoRGF0YSkge1xuICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKG5hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQ29udmVydCB0aGUgdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGVcbiAgICAvLyBTZW1WZXIgdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgY29tcGFyZSB2ZXJzaW9ucy5cbiAgICBjb25zdCBwYXJzZWQgPSBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChuYW1lKTtcbiAgICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucy5cbiAgICBpZiAocGFyc2VkICE9PSBudWxsICYmIG1ham9yVmVyc2lvbnMuaW5jbHVkZXMocGFyc2VkLm1ham9yKSkge1xuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZSwgcGFyc2VkfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBjYXB0dXJlZCB2ZXJzaW9uLWJyYW5jaGVzIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gIHJldHVybiBicmFuY2hlcy5zb3J0KChhLCBiKSA9PiBzZW12ZXIucmNvbXBhcmUoYS5wYXJzZWQsIGIucGFyc2VkKSk7XG59XG4iXX0=