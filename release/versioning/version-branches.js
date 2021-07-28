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
                    case 0: return [4 /*yield*/, repo.api.repos.getContent({ owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName })];
                    case 1:
                        data = (_a.sent()).data;
                        content = data.content;
                        if (!content) {
                            throw Error("Unable to read \"package.json\" file from repository.");
                        }
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
                    case 0: return [4 /*yield*/, repo.api.paginate(repo.api.repos.listBranches, { owner: repo.owner, repo: repo.name, protected: true })];
                    case 1:
                        branchData = _b.sent();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBcUJqQyx3REFBd0Q7SUFDeEQsSUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQztJQUVuRCxpRkFBaUY7SUFDakYsU0FBc0Isa0JBQWtCLENBQ3BDLElBQXVCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQzFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBRDFFLElBQUksR0FBSSxDQUFBLFNBQ2tFLENBQUEsS0FEdEU7d0JBSUwsT0FBTyxHQUFJLElBQTJCLENBQUMsT0FBTyxDQUFDO3dCQUNyRCxJQUFJLENBQUMsT0FBTyxFQUFFOzRCQUNaLE1BQU0sS0FBSyxDQUFDLHVEQUFxRCxDQUFDLENBQUM7eUJBQ3BFO3dCQUNNLE9BQU8sR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUM3QixRQUQzQixDQUM0Qjt3QkFDcEMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQzVDLElBQUksYUFBYSxLQUFLLElBQUksRUFBRTs0QkFDMUIsTUFBTSxLQUFLLENBQUMsbURBQWlELFVBQVUsTUFBRyxDQUFDLENBQUM7eUJBQzdFO3dCQUNELHNCQUFPLGFBQWEsRUFBQzs7OztLQUN0QjtJQWpCRCxnREFpQkM7SUFFRCxnRUFBZ0U7SUFDaEUsU0FBZ0IsZUFBZSxDQUFDLFVBQWtCO1FBQ2hELE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCwwQ0FFQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQWdCLDBCQUEwQixDQUFDLFVBQWtCO1FBQzNELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUZELGdFQUVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsMkJBQTJCLENBQzdDLElBQXVCLEVBQUUsYUFBdUI7Ozs7Ozs0QkFDL0IscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQ3RDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUMsQ0FBQyxFQUFBOzt3QkFEakYsVUFBVSxHQUFHLFNBQ29FO3dCQUNqRixRQUFRLEdBQW9CLEVBQUUsQ0FBQzs7NEJBRXJDLEtBQXFCLGVBQUEsaUJBQUEsVUFBVSxDQUFBLG9HQUFFO2dDQUFyQixrQ0FBSTtnQ0FDZCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQUksQ0FBQyxFQUFFO29DQUMxQixTQUFTO2lDQUNWO2dDQUdLLE1BQU0sR0FBRywwQkFBMEIsQ0FBQyxNQUFJLENBQUMsQ0FBQztnQ0FDaEQsd0VBQXdFO2dDQUN4RSxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0NBQzNELFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7aUNBQy9COzZCQUNGOzs7Ozs7Ozs7d0JBRUQsc0RBQXNEO3dCQUN0RCxzQkFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFBQzs7OztLQUNyRTtJQXJCRCxrRUFxQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0dpdGh1YkNsaWVudCwgR2l0aHViUmVwb30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeSB3aXRoIGNvcnJlc3BvbmRpbmcgQVBJIGNsaWVudC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwb1dpdGhBcGkgZXh0ZW5kcyBHaXRodWJSZXBvIHtcbiAgLyoqIEFQSSBjbGllbnQgdGhhdCBjYW4gYWNjZXNzIHRoZSByZXBvc2l0b3J5LiAqL1xuICBhcGk6IEdpdGh1YkNsaWVudDtcbn1cblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIHZlcnNpb24tYnJhbmNoLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQnJhbmNoIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGJyYW5jaCBpbiBHaXQuIGUuZy4gYDEwLjAueGAuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFBhcnNlZCBTZW1WZXIgdmVyc2lvbiBmb3IgdGhlIHZlcnNpb24tYnJhbmNoLiBWZXJzaW9uIGJyYW5jaGVzIHRlY2huaWNhbGx5IGRvXG4gICAqIG5vdCBmb2xsb3cgdGhlIFNlbVZlciBmb3JtYXQsIGJ1dCB3ZSBjYW4gaGF2ZSByZXByZXNlbnRhdGl2ZSBTZW1WZXIgdmVyc2lvbnNcbiAgICogdGhhdCBjYW4gYmUgdXNlZCBmb3IgY29tcGFyaXNvbnMsIHNvcnRpbmcgYW5kIG90aGVyIGNoZWNrcy5cbiAgICovXG4gIHBhcnNlZDogc2VtdmVyLlNlbVZlcjtcbn1cblxuLyoqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdmVyc2lvbi1icmFuY2hlcy4gKi9cbmNvbnN0IHZlcnNpb25CcmFuY2hOYW1lUmVnZXggPSAvXihcXGQrKVxcLihcXGQrKVxcLngkLztcblxuLyoqIEdldHMgdGhlIHZlcnNpb24gb2YgYSBnaXZlbiBicmFuY2ggYnkgcmVhZGluZyB0aGUgYHBhY2thZ2UuanNvbmAgdXBzdHJlYW0uICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VmVyc2lvbk9mQnJhbmNoKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBicmFuY2hOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHNlbXZlci5TZW1WZXI+IHtcbiAgY29uc3Qge2RhdGF9ID0gYXdhaXQgcmVwby5hcGkucmVwb3MuZ2V0Q29udGVudChcbiAgICAgIHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBwYXRoOiAnL3BhY2thZ2UuanNvbicsIHJlZjogYnJhbmNoTmFtZX0pO1xuICAvLyBXb3JrYXJvdW5kIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL29jdG9raXQvcmVzdC5qcy9pc3N1ZXMvMzIuXG4gIC8vIFRPRE86IFJlbW92ZSBjYXN0IG9uY2UgdHlwZXMgb2YgT2N0b2tpdCBgZ2V0Q29udGVudGAgYXJlIGZpeGVkLlxuICBjb25zdCBjb250ZW50ID0gKGRhdGEgYXMge2NvbnRlbnQ/OiBzdHJpbmd9KS5jb250ZW50O1xuICBpZiAoIWNvbnRlbnQpIHtcbiAgICB0aHJvdyBFcnJvcihgVW5hYmxlIHRvIHJlYWQgXCJwYWNrYWdlLmpzb25cIiBmaWxlIGZyb20gcmVwb3NpdG9yeS5gKTtcbiAgfVxuICBjb25zdCB7dmVyc2lvbn0gPSBKU09OLnBhcnNlKEJ1ZmZlci5mcm9tKGNvbnRlbnQsICdiYXNlNjQnKS50b1N0cmluZygpKSBhc1xuICAgICAge3ZlcnNpb246IHN0cmluZywgW2tleTogc3RyaW5nXTogYW55fTtcbiAgY29uc3QgcGFyc2VkVmVyc2lvbiA9IHNlbXZlci5wYXJzZSh2ZXJzaW9uKTtcbiAgaWYgKHBhcnNlZFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihgSW52YWxpZCB2ZXJzaW9uIGRldGVjdGVkIGluIGZvbGxvd2luZyBicmFuY2g6ICR7YnJhbmNoTmFtZX0uYCk7XG4gIH1cbiAgcmV0dXJuIHBhcnNlZFZlcnNpb247XG59XG5cbi8qKiBXaGV0aGVyIHRoZSBnaXZlbiBicmFuY2ggY29ycmVzcG9uZHMgdG8gYSB2ZXJzaW9uIGJyYW5jaC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1ZlcnNpb25CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiB2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LnRlc3QoYnJhbmNoTmFtZSk7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiB2ZXJzaW9uLWJyYW5jaCBpbnRvIGEgU2VtVmVyIHZlcnNpb24gdGhhdCBjYW4gYmUgdXNlZCB3aXRoIFNlbVZlclxuICogdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgZXh0cmFjdCBtYWpvciBkaWdpdCwgY29tcGFyZS5cbiAqXG4gKiBGb3IgZXhhbXBsZSBgMTAuMC54YCB3aWxsIGJlY29tZSBgMTAuMC4wYCBpbiBTZW1WZXIuIFRoZSBwYXRjaCBkaWdpdCBpcyBub3RcbiAqIHJlbGV2YW50IGJ1dCBuZWVkZWQgZm9yIHBhcnNpbmcuIFNlbVZlciBkb2VzIG5vdCBhbGxvdyBgeGAgYXMgcGF0Y2ggZGlnaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChicmFuY2hOYW1lOiBzdHJpbmcpOiBzZW12ZXIuU2VtVmVyfG51bGwge1xuICByZXR1cm4gc2VtdmVyLnBhcnNlKGJyYW5jaE5hbWUucmVwbGFjZSh2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LCAnJDEuJDIuMCcpKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2ZXJzaW9uIGJyYW5jaGVzIGZvciB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb25zIGluIGRlc2NlbmRpbmdcbiAqIG9yZGVyLiBpLmUuIGxhdGVzdCB2ZXJzaW9uIGJyYW5jaGVzIGZpcnN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBtYWpvclZlcnNpb25zOiBudW1iZXJbXSk6IFByb21pc2U8VmVyc2lvbkJyYW5jaFtdPiB7XG4gIGNvbnN0IGJyYW5jaERhdGEgPSBhd2FpdCByZXBvLmFwaS5wYWdpbmF0ZShcbiAgICAgIHJlcG8uYXBpLnJlcG9zLmxpc3RCcmFuY2hlcywge293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHByb3RlY3RlZDogdHJ1ZX0pO1xuICBjb25zdCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdID0gW107XG5cbiAgZm9yIChjb25zdCB7bmFtZX0gb2YgYnJhbmNoRGF0YSkge1xuICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKG5hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQ29udmVydCB0aGUgdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGVcbiAgICAvLyBTZW1WZXIgdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgY29tcGFyZSB2ZXJzaW9ucy5cbiAgICBjb25zdCBwYXJzZWQgPSBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChuYW1lKTtcbiAgICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucy5cbiAgICBpZiAocGFyc2VkICE9PSBudWxsICYmIG1ham9yVmVyc2lvbnMuaW5jbHVkZXMocGFyc2VkLm1ham9yKSkge1xuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZSwgcGFyc2VkfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBjYXB0dXJlZCB2ZXJzaW9uLWJyYW5jaGVzIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gIHJldHVybiBicmFuY2hlcy5zb3J0KChhLCBiKSA9PiBzZW12ZXIucmNvbXBhcmUoYS5wYXJzZWQsIGIucGFyc2VkKSk7XG59XG4iXX0=