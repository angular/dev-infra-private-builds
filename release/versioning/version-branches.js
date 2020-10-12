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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVyc2lvbi1icmFuY2hlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9yZWxlYXNlL3ZlcnNpb25pbmcvdmVyc2lvbi1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBcUJqQyx3REFBd0Q7SUFDeEQsSUFBTSxzQkFBc0IsR0FBRyxtQkFBbUIsQ0FBQztJQUVuRCxpRkFBaUY7SUFDakYsU0FBc0Isa0JBQWtCLENBQ3BDLElBQXVCLEVBQUUsVUFBa0I7Ozs7OzRCQUM5QixxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQzNDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLGVBQWUsRUFBRSxHQUFHLEVBQUUsVUFBVSxFQUFDLENBQUMsRUFBQTs7d0JBRDFFLElBQUksR0FBSSxDQUFBLFNBQ2tFLENBQUEsS0FEdEU7d0JBRUosT0FBTyxHQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQTlELENBQStEO3dCQUN2RSxhQUFhLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDNUMsSUFBSSxhQUFhLEtBQUssSUFBSSxFQUFFOzRCQUMxQixNQUFNLEtBQUssQ0FBQyxtREFBaUQsVUFBVSxNQUFHLENBQUMsQ0FBQzt5QkFDN0U7d0JBQ0Qsc0JBQU8sYUFBYSxFQUFDOzs7O0tBQ3RCO0lBVkQsZ0RBVUM7SUFFRCxnRUFBZ0U7SUFDaEUsU0FBZ0IsZUFBZSxDQUFDLFVBQWtCO1FBQ2hELE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFGRCwwQ0FFQztJQUVEOzs7Ozs7T0FNRztJQUNILFNBQWdCLDBCQUEwQixDQUFDLFVBQWtCO1FBQzNELE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLHNCQUFzQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUZELGdFQUVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBc0IsMkJBQTJCLENBQzdDLElBQXVCLEVBQUUsYUFBdUI7Ozs7Ozs0QkFFOUMscUJBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBQyxDQUFDLEVBQUE7O3dCQUQvRSxVQUFVLEdBQ25CLENBQUEsU0FBd0YsQ0FBQSxLQURyRTt3QkFFakIsUUFBUSxHQUFvQixFQUFFLENBQUM7OzRCQUVyQyxLQUFxQixlQUFBLGlCQUFBLFVBQVUsQ0FBQSxvR0FBRTtnQ0FBckIsa0NBQUk7Z0NBQ2QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFJLENBQUMsRUFBRTtvQ0FDMUIsU0FBUztpQ0FDVjtnQ0FHSyxNQUFNLEdBQUcsMEJBQTBCLENBQUMsTUFBSSxDQUFDLENBQUM7Z0NBQ2hELHdFQUF3RTtnQ0FDeEUsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLGFBQWEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO29DQUMzRCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxRQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO2lDQUMvQjs2QkFDRjs7Ozs7Ozs7O3dCQUVELHNEQUFzRDt3QkFDdEQsc0JBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLEVBQUM7Ozs7S0FDckU7SUFyQkQsa0VBcUJDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuaW1wb3J0IHtHaXRodWJDbGllbnQsIEdpdGh1YlJlcG99IGZyb20gJy4uLy4uL3V0aWxzL2dpdC9naXRodWInO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIGEgR2l0aHViIHJlcG9zaXRvcnkgd2l0aCBjb3JyZXNwb25kaW5nIEFQSSBjbGllbnQuICovXG5leHBvcnQgaW50ZXJmYWNlIEdpdGh1YlJlcG9XaXRoQXBpIGV4dGVuZHMgR2l0aHViUmVwbyB7XG4gIC8qKiBBUEkgY2xpZW50IHRoYXQgY2FuIGFjY2VzcyB0aGUgcmVwb3NpdG9yeS4gKi9cbiAgYXBpOiBHaXRodWJDbGllbnQ7XG59XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSB2ZXJzaW9uLWJyYW5jaC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVmVyc2lvbkJyYW5jaCB7XG4gIC8qKiBOYW1lIG9mIHRoZSBicmFuY2ggaW4gR2l0LiBlLmcuIGAxMC4wLnhgLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBQYXJzZWQgU2VtVmVyIHZlcnNpb24gZm9yIHRoZSB2ZXJzaW9uLWJyYW5jaC4gVmVyc2lvbiBicmFuY2hlcyB0ZWNobmljYWxseSBkb1xuICAgKiBub3QgZm9sbG93IHRoZSBTZW1WZXIgZm9ybWF0LCBidXQgd2UgY2FuIGhhdmUgcmVwcmVzZW50YXRpdmUgU2VtVmVyIHZlcnNpb25zXG4gICAqIHRoYXQgY2FuIGJlIHVzZWQgZm9yIGNvbXBhcmlzb25zLCBzb3J0aW5nIGFuZCBvdGhlciBjaGVja3MuXG4gICAqL1xuICBwYXJzZWQ6IHNlbXZlci5TZW1WZXI7XG59XG5cbi8qKiBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIHZlcnNpb24tYnJhbmNoZXMuICovXG5jb25zdCB2ZXJzaW9uQnJhbmNoTmFtZVJlZ2V4ID0gL14oXFxkKylcXC4oXFxkKylcXC54JC87XG5cbi8qKiBHZXRzIHRoZSB2ZXJzaW9uIG9mIGEgZ2l2ZW4gYnJhbmNoIGJ5IHJlYWRpbmcgdGhlIGBwYWNrYWdlLmpzb25gIHVwc3RyZWFtLiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZlcnNpb25PZkJyYW5jaChcbiAgICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSwgYnJhbmNoTmFtZTogc3RyaW5nKTogUHJvbWlzZTxzZW12ZXIuU2VtVmVyPiB7XG4gIGNvbnN0IHtkYXRhfSA9IGF3YWl0IHJlcG8uYXBpLnJlcG9zLmdldENvbnRlbnRzKFxuICAgICAge293bmVyOiByZXBvLm93bmVyLCByZXBvOiByZXBvLm5hbWUsIHBhdGg6ICcvcGFja2FnZS5qc29uJywgcmVmOiBicmFuY2hOYW1lfSk7XG4gIGNvbnN0IHt2ZXJzaW9ufSA9IEpTT04ucGFyc2UoQnVmZmVyLmZyb20oZGF0YS5jb250ZW50LCAnYmFzZTY0JykudG9TdHJpbmcoKSk7XG4gIGNvbnN0IHBhcnNlZFZlcnNpb24gPSBzZW12ZXIucGFyc2UodmVyc2lvbik7XG4gIGlmIChwYXJzZWRWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoYEludmFsaWQgdmVyc2lvbiBkZXRlY3RlZCBpbiBmb2xsb3dpbmcgYnJhbmNoOiAke2JyYW5jaE5hbWV9LmApO1xuICB9XG4gIHJldHVybiBwYXJzZWRWZXJzaW9uO1xufVxuXG4vKiogV2hldGhlciB0aGUgZ2l2ZW4gYnJhbmNoIGNvcnJlc3BvbmRzIHRvIGEgdmVyc2lvbiBicmFuY2guICovXG5leHBvcnQgZnVuY3Rpb24gaXNWZXJzaW9uQnJhbmNoKGJyYW5jaE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gdmVyc2lvbkJyYW5jaE5hbWVSZWdleC50ZXN0KGJyYW5jaE5hbWUpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gdmVyc2lvbi1icmFuY2ggaW50byBhIFNlbVZlciB2ZXJzaW9uIHRoYXQgY2FuIGJlIHVzZWQgd2l0aCBTZW1WZXJcbiAqIHV0aWxpdGllcy4gZS5nLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIsIGV4dHJhY3QgbWFqb3IgZGlnaXQsIGNvbXBhcmUuXG4gKlxuICogRm9yIGV4YW1wbGUgYDEwLjAueGAgd2lsbCBiZWNvbWUgYDEwLjAuMGAgaW4gU2VtVmVyLiBUaGUgcGF0Y2ggZGlnaXQgaXMgbm90XG4gKiByZWxldmFudCBidXQgbmVlZGVkIGZvciBwYXJzaW5nLiBTZW1WZXIgZG9lcyBub3QgYWxsb3cgYHhgIGFzIHBhdGNoIGRpZ2l0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmVyc2lvbkZvclZlcnNpb25CcmFuY2goYnJhbmNoTmFtZTogc3RyaW5nKTogc2VtdmVyLlNlbVZlcnxudWxsIHtcbiAgcmV0dXJuIHNlbXZlci5wYXJzZShicmFuY2hOYW1lLnJlcGxhY2UodmVyc2lvbkJyYW5jaE5hbWVSZWdleCwgJyQxLiQyLjAnKSk7XG59XG5cbi8qKlxuICogR2V0cyB0aGUgdmVyc2lvbiBicmFuY2hlcyBmb3IgdGhlIHNwZWNpZmllZCBtYWpvciB2ZXJzaW9ucyBpbiBkZXNjZW5kaW5nXG4gKiBvcmRlci4gaS5lLiBsYXRlc3QgdmVyc2lvbiBicmFuY2hlcyBmaXJzdC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEJyYW5jaGVzRm9yTWFqb3JWZXJzaW9ucyhcbiAgICByZXBvOiBHaXRodWJSZXBvV2l0aEFwaSwgbWFqb3JWZXJzaW9uczogbnVtYmVyW10pOiBQcm9taXNlPFZlcnNpb25CcmFuY2hbXT4ge1xuICBjb25zdCB7ZGF0YTogYnJhbmNoRGF0YX0gPVxuICAgICAgYXdhaXQgcmVwby5hcGkucmVwb3MubGlzdEJyYW5jaGVzKHtvd25lcjogcmVwby5vd25lciwgcmVwbzogcmVwby5uYW1lLCBwcm90ZWN0ZWQ6IHRydWV9KTtcbiAgY29uc3QgYnJhbmNoZXM6IFZlcnNpb25CcmFuY2hbXSA9IFtdO1xuXG4gIGZvciAoY29uc3Qge25hbWV9IG9mIGJyYW5jaERhdGEpIHtcbiAgICBpZiAoIWlzVmVyc2lvbkJyYW5jaChuYW1lKSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIC8vIENvbnZlcnQgdGhlIHZlcnNpb24tYnJhbmNoIGludG8gYSBTZW1WZXIgdmVyc2lvbiB0aGF0IGNhbiBiZSB1c2VkIHdpdGggdGhlXG4gICAgLy8gU2VtVmVyIHV0aWxpdGllcy4gZS5nLiB0byBkZXRlcm1pbmUgc2VtYW50aWMgb3JkZXIsIGNvbXBhcmUgdmVyc2lvbnMuXG4gICAgY29uc3QgcGFyc2VkID0gZ2V0VmVyc2lvbkZvclZlcnNpb25CcmFuY2gobmFtZSk7XG4gICAgLy8gQ29sbGVjdCBhbGwgdmVyc2lvbi1icmFuY2hlcyB0aGF0IG1hdGNoIHRoZSBzcGVjaWZpZWQgbWFqb3IgdmVyc2lvbnMuXG4gICAgaWYgKHBhcnNlZCAhPT0gbnVsbCAmJiBtYWpvclZlcnNpb25zLmluY2x1ZGVzKHBhcnNlZC5tYWpvcikpIHtcbiAgICAgIGJyYW5jaGVzLnB1c2goe25hbWUsIHBhcnNlZH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFNvcnQgY2FwdHVyZWQgdmVyc2lvbi1icmFuY2hlcyBpbiBkZXNjZW5kaW5nIG9yZGVyLlxuICByZXR1cm4gYnJhbmNoZXMuc29ydCgoYSwgYikgPT4gc2VtdmVyLnJjb21wYXJlKGEucGFyc2VkLCBiLnBhcnNlZCkpO1xufVxuIl19