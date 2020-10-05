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
    var versionBranchNameRegex = /(\d+)\.(\d+)\.x/;
    /** Gets the version of a given branch by reading the `package.json` upstream. */
    function getVersionOfBranch(repo, branchName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var data, version, parsedVersion;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repo.api.repos.getContents({ owner: repo.owner, repo: repo.name, path: '/package.json', ref: branchName })];
                    case 1:
                        data = (_a.sent()).data;
                        version = JSON.parse(Buffer.from(data.content, 'base64').toString()).version;
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
        // Convert a given version-branch into a SemVer version that can be used
        // with the SemVer utilities. i.e. to determine semantic order.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBcUJqQyx3REFBd0Q7SUFDeEQsSUFBTSxzQkFBc0IsR0FBRyxpQkFBaUIsQ0FBQztJQUVqRCxpRkFBaUY7SUFDakYsU0FBc0Isa0JBQWtCLENBQ3BDLElBQXVCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzNDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBRDFFLElBQUksR0FBSSxDQUFBLFNBQ2tFLENBQUEsS0FEdEU7d0JBRUosT0FBTyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQTlELENBQStEO3dCQUN2RSxhQUFhLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFOzRCQUMxQixNQUFNLEtBQUssQ0FBQyxtREFBaUQsVUFBVSxNQUFHLENBQUMsQ0FBQzt5QkFDN0U7d0JBQ0Qsc0JBQU8sYUFBYSxFQUFDOzs7O0tBQ3RCO0lBVkQsZ0RBVUM7SUFFRCxnRUFBZ0U7SUFDaEUsU0FBZ0IsZUFBZSxDQUFDLFVBQWtCO1FBQ2hELE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCwwQ0FFQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQWdCLDBCQUEwQixDQUFDLFVBQWtCO1FBQzNELHdFQUF3RTtRQUN4RSwrREFBK0Q7UUFDL0QsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsc0JBQXNCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBSkQsZ0VBSUM7SUFFRDs7O09BR0c7SUFDSCxTQUFzQiwyQkFBMkIsQ0FDN0MsSUFBdUIsRUFBRSxhQUF1Qjs7Ozs7OzRCQUU5QyxxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLENBQUMsRUFBQTs7d0JBRC9FLFVBQVUsR0FDbkIsQ0FBQSxTQUF3RixDQUFBLEtBRHJFO3dCQUVqQixRQUFRLEdBQW9CLEVBQUUsQ0FBQzs7NEJBRXJDLEtBQXFCLGVBQUEsaUJBQUEsVUFBVSxDQUFBLG9HQUFFO2dDQUFyQixrQ0FBSTtnQ0FDZCxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQUksQ0FBQyxFQUFFO29DQUMxQixTQUFTO2lDQUNWO2dDQUdLLE1BQU0sR0FBRywwQkFBMEIsQ0FBQyxNQUFJLENBQUMsQ0FBQztnQ0FDaEQsd0VBQXdFO2dDQUN4RSxJQUFJLE1BQU0sS0FBSyxJQUFJLElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7b0NBQzNELFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLFFBQUEsRUFBRSxNQUFNLFFBQUEsRUFBQyxDQUFDLENBQUM7aUNBQy9COzZCQUNGOzs7Ozs7Ozs7d0JBRUQsc0RBQXNEO3dCQUN0RCxzQkFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQW5DLENBQW1DLENBQUMsRUFBQzs7OztLQUNyRTtJQXJCRCxrRUFxQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge0dpdGh1YkNsaWVudCwgR2l0aHViUmVwb30gZnJvbSAnLi4vLi4vdXRpbHMvZ2l0L2dpdGh1Yic7XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSBHaXRodWIgcmVwb3NpdG9yeSB3aXRoIGNvcnJlc3BvbmRpbmcgQVBJIGNsaWVudC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR2l0aHViUmVwb1dpdGhBcGkgZXh0ZW5kcyBHaXRodWJSZXBvIHtcbiAgLyoqIEFQSSBjbGllbnQgdGhhdCBjYW4gYWNjZXNzIHRoZSByZXBvc2l0b3J5LiAqL1xuICBhcGk6IEdpdGh1YkNsaWVudDtcbn1cblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhIHZlcnNpb24tYnJhbmNoLiAqL1xuZXhwb3J0IGludGVyZmFjZSBWZXJzaW9uQnJhbmNoIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGJyYW5jaCBpbiBHaXQuIGUuZy4gYDEwLjAueGAuICovXG4gIG5hbWU6IHN0cmluZztcbiAgLyoqXG4gICAqIFBhcnNlZCBTZW1WZXIgdmVyc2lvbiBmb3IgdGhlIHZlcnNpb24tYnJhbmNoLiBWZXJzaW9uIGJyYW5jaGVzIHRlY2huaWNhbGx5IGRvXG4gICAqIG5vdCBmb2xsb3cgdGhlIFNlbVZlciBmb3JtYXQsIGJ1dCB3ZSBjYW4gaGF2ZSByZXByZXNlbnRhdGl2ZSBTZW1WZXIgdmVyc2lvbnNcbiAgICogdGhhdCBjYW4gYmUgdXNlZCBmb3IgY29tcGFyaXNvbnMsIHNvcnRpbmcgYW5kIG90aGVyIGNoZWNrcy5cbiAgICovXG4gIHBhcnNlZDogc2VtdmVyLlNlbVZlcjtcbn1cblxuLyoqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgdmVyc2lvbi1icmFuY2hlcy4gKi9cbmNvbnN0IHZlcnNpb25CcmFuY2hOYW1lUmVnZXggPSAvKFxcZCspXFwuKFxcZCspXFwueC87XG5cbi8qKiBHZXRzIHRoZSB2ZXJzaW9uIG9mIGEgZ2l2ZW4gYnJhbmNoIGJ5IHJlYWRpbmcgdGhlIGBwYWNrYWdlLmpzb25gIHVwc3RyZWFtLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlcnNpb25PZkJyYW5jaChcbiAgICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSwgYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHJlcG8uYXBpLnJlcG9zLmdldENvbnRlbnRzKFxuICAgICAge293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHBhdGg6ICcvcGFja2FnZS5qc29uJywgcmVmOiBicmFuY2hOYW1lfSk7XG4gIGNvbnN0IHt2ZXJzaW9ufSA9IEpTT04ucGFyc2UoQnVmZmVyLmZyb20oZGF0YS5jb250ZW50LCAnYmFzZTY0JykudG9TdHJpbmcoKSk7XG4gIGNvbnN0IHBhcnNlZFZlcnNpb24gPSBzZW12ZXIucGFyc2UodmVyc2lvbik7XG4gIGlmIChwYXJzZWRWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoYEludmFsaWQgdmVyc2lvbiBkZXRlY3RlZCBpbiBmb2xsb3dpbmcgYnJhbmNoOiAke2JyYW5jaE5hbWV9LmApO1xuICB9XG4gIHJldHVybiBwYXJzZWRWZXJzaW9uO1xufVxuXG4vKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvcnJlc3BvbmRzIHRvIGEgdmVyc2lvbiBicmFuY2guICovXG5leHBvcnQgZnVuY3Rpb24gaXNWZXJzaW9uQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmVyc2lvbkJyYW5jaE5hbWVSZWdleC50ZXN0KGJyYW5jaE5hbWUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBTZW1WZXJcbiAqIHV0aWxpdGllcy4gZS5nLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIsIGV4dHJhY3QgbWFqb3IgZGlnaXQsIGNvbXBhcmUuXG4gKlxuICogRm9yIGV4YW1wbGUgYDEwLjAueGAgd2lsbCBiZWNvbWUgYDEwLjAuMGAgaW4gU2VtVmVyLiBUaGUgcGF0Y2ggZGlnaXQgaXMgbm90XG4gKiByZWxldmFudCBidXQgbmVlZGVkIGZvciBwYXJzaW5nLiBTZW1WZXIgZG9lcyBub3QgYWxsb3cgYHhgIGFzIHBhdGNoIGRpZ2l0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvbkZvclZlcnNpb25CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogc2VtdmVyLlNlbVZlcnxudWxsIHtcbiAgLy8gQ29udmVydCBhIGdpdmVuIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkXG4gIC8vIHdpdGggdGhlIFNlbVZlciB1dGlsaXRpZXMuIGkuZS4gdG8gZGV0ZXJtaW5lIHNlbWFudGljIG9yZGVyLlxuICByZXR1cm4gc2VtdmVyLnBhcnNlKGJyYW5jaE5hbWUucmVwbGFjZSh2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4LCAnJDEuJDIuMCcpKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSB2ZXJzaW9uIGJyYW5jaGVzIGZvciB0aGUgc3BlY2lmaWVkIG1ham9yIHZlcnNpb25zIGluIGRlc2NlbmRpbmdcbiAqIG9yZGVyLiBpLmUuIGxhdGVzdCB2ZXJzaW9uIGJyYW5jaGVzIGZpcnN0LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGb3JNYWpvclZlcnNpb25zKFxuICAgIHJlcG86IEdpdGh1YlJlcG9XaXRoQXBpLCBtYWpvclZlcnNpb25zOiBudW1iZXJbXSk6IFByb21pc2U8VmVyc2lvbkJyYW5jaFtdPiB7XG4gIGNvbnN0IHtkYXRhOiBicmFuY2hEYXRhfSA9XG4gICAgICBhd2FpdCByZXBvLmFwaS5yZXBvcy5saXN0QnJhbmNoZXMoe293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHByb3RlY3RlZDogdHJ1ZX0pO1xuICBjb25zdCBicmFuY2hlczogVmVyc2lvbkJyYW5jaFtdID0gW107XG5cbiAgZm9yIChjb25zdCB7bmFtZX0gb2YgYnJhbmNoRGF0YSkge1xuICAgIGlmICghaXNWZXJzaW9uQnJhbmNoKG5hbWUpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgLy8gQ29udmVydCB0aGUgdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCB0aGVcbiAgICAvLyBTZW1WZXIgdXRpbGl0aWVzLiBlLmcuIHRvIGRldGVybWluZSBzZW1hbnRpYyBvcmRlciwgY29tcGFyZSB2ZXJzaW9ucy5cbiAgICBjb25zdCBwYXJzZWQgPSBnZXRWZXJzaW9uRm9yVmVyc2lvbkJyYW5jaChuYW1lKTtcbiAgICAvLyBDb2xsZWN0IGFsbCB2ZXJzaW9uLWJyYW5jaGVzIHRoYXQgbWF0Y2ggdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucy5cbiAgICBpZiAocGFyc2VkICE9PSBudWxsICYmIG1ham9yVmVyc2lvbnMuaW5jbHVkZXMocGFyc2VkLm1ham9yKSkge1xuICAgICAgYnJhbmNoZXMucHVzaCh7bmFtZSwgcGFyc2VkfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBjYXB0dXJlZCB2ZXJzaW9uLWJyYW5jaGVzIGluIGRlc2NlbmRpbmcgb3JkZXIuXG4gIHJldHVybiBicmFuY2hlcy5zb3J0KChhLCBiKSA9PiBzZW12ZXIucmNvbXBhcmUoYS5wYXJzZWQsIGIucGFyc2VkKSk7XG59XG4iXX0=