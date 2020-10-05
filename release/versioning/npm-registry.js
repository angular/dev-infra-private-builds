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
        define("@angular/dev-infra-private/release/versioning/npm-registry", ["require", "exports", "tslib", "node-fetch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isVersionPublishedToNpm = exports.fetchProjectNpmPackageInfo = exports._npmPackageInfoCache = void 0;
    var tslib_1 = require("tslib");
    var node_fetch_1 = require("node-fetch");
    /**
     * Cache for requested NPM package information. A cache is desirable as the NPM
     * registry requests are usually very large and slow.
     */
    exports._npmPackageInfoCache = {};
    /**
     * Fetches the NPM package representing the project. Angular repositories usually contain
     * multiple packages in a monorepo scheme, but packages dealt with as part of the release
     * tooling are released together with the same versioning and branching. This means that
     * a single package can be used as source of truth for NPM package queries.
     */
    function fetchProjectNpmPackageInfo(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var pkgName;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pkgName = getRepresentativeNpmPackage(config);
                        return [4 /*yield*/, fetchPackageInfoFromNpmRegistry(pkgName)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
    exports.fetchProjectNpmPackageInfo = fetchProjectNpmPackageInfo;
    /** Gets whether the given version is published to NPM or not */
    function isVersionPublishedToNpm(version, config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var versions;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetchProjectNpmPackageInfo(config)];
                    case 1:
                        versions = (_a.sent()).versions;
                        return [2 /*return*/, versions[version.format()] !== undefined];
                }
            });
        });
    }
    exports.isVersionPublishedToNpm = isVersionPublishedToNpm;
    /**
     * Gets the representative NPM package for the specified release configuration. Angular
     * repositories usually contain multiple packages in a monorepo scheme, but packages dealt with
     * as part of the release tooling are released together with the same versioning and branching.
     * This means that a single package can be used as source of truth for NPM package queries.
     */
    function getRepresentativeNpmPackage(config) {
        return config.npmPackages[0];
    }
    /** Fetches the specified NPM package from the NPM registry. */
    function fetchPackageInfoFromNpmRegistry(pkgName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var result;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(exports._npmPackageInfoCache[pkgName] !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, exports._npmPackageInfoCache[pkgName]];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        result = exports._npmPackageInfoCache[pkgName] =
                            node_fetch_1.default("https://registry.npmjs.org/" + pkgName).then(function (r) { return r.json(); });
                        return [4 /*yield*/, result];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9ucG0tcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHlDQUErQjtJQWUvQjs7O09BR0c7SUFDVSxRQUFBLG9CQUFvQixHQUFpRCxFQUFFLENBQUM7SUFFckY7Ozs7O09BS0c7SUFDSCxTQUFzQiwwQkFBMEIsQ0FBQyxNQUFxQjs7Ozs7O3dCQUM5RCxPQUFPLEdBQUcsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUM7d0JBQzdDLHFCQUFNLCtCQUErQixDQUFDLE9BQU8sQ0FBQyxFQUFBOzRCQUFyRCxzQkFBTyxTQUE4QyxFQUFDOzs7O0tBQ3ZEO0lBSEQsZ0VBR0M7SUFFRCxnRUFBZ0U7SUFDaEUsU0FBc0IsdUJBQXVCLENBQ3pDLE9BQXNCLEVBQUUsTUFBcUI7Ozs7OzRCQUM1QixxQkFBTSwwQkFBMEIsQ0FBQyxNQUFNLENBQUMsRUFBQTs7d0JBQXBELFFBQVEsR0FBSSxDQUFBLFNBQXdDLENBQUEsU0FBNUM7d0JBQ2Ysc0JBQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLFNBQVMsRUFBQzs7OztLQUNqRDtJQUpELDBEQUlDO0lBRUQ7Ozs7O09BS0c7SUFDSCxTQUFTLDJCQUEyQixDQUFDLE1BQXFCO1FBQ3hELE9BQU8sTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsK0RBQStEO0lBQy9ELFNBQWUsK0JBQStCLENBQUMsT0FBZTs7Ozs7OzZCQUN4RCxDQUFBLDRCQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLFNBQVMsQ0FBQSxFQUEzQyx3QkFBMkM7d0JBQ3RDLHFCQUFNLDRCQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFBOzRCQUExQyxzQkFBTyxTQUFtQyxFQUFDOzt3QkFFdkMsTUFBTSxHQUFHLDRCQUFvQixDQUFDLE9BQU8sQ0FBQzs0QkFDeEMsb0JBQUssQ0FBQyxnQ0FBOEIsT0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFSLENBQVEsQ0FBQyxDQUFDO3dCQUNoRSxxQkFBTSxNQUFNLEVBQUE7NEJBQW5CLHNCQUFPLFNBQVksRUFBQzs7OztLQUNyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgZmV0Y2ggZnJvbSAnbm9kZS1mZXRjaCc7XG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIGFuIE5QTSBwYWNrYWdlIGZldGNoZWQgZnJvbSB0aGUgcmVnaXN0cnkuICovXG5leHBvcnQgaW50ZXJmYWNlIE5wbVBhY2thZ2VJbmZvIHtcbiAgLyoqIE1hcHMgb2YgdmVyc2lvbnMgYW5kIHRoZWlyIHBhY2thZ2UgSlNPTiBvYmplY3RzLiAqL1xuICAndmVyc2lvbnMnOiB7W25hbWU6IHN0cmluZ106IHVuZGVmaW5lZHxvYmplY3R9O1xuICAvKiogTWFwIG9mIE5QTSBkaXN0LXRhZ3MgYW5kIHRoZWlyIGNob3NlbiB2ZXJzaW9uLiAqL1xuICAnZGlzdC10YWdzJzoge1t0YWdOYW1lOiBzdHJpbmddOiBzdHJpbmd8dW5kZWZpbmVkfTtcbiAgLyoqIE1hcCBvZiB2ZXJzaW9ucyBhbmQgdGhlaXIgSVNPIHJlbGVhc2UgdGltZS4gKi9cbiAgJ3RpbWUnOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ307XG59XG5cbi8qKlxuICogQ2FjaGUgZm9yIHJlcXVlc3RlZCBOUE0gcGFja2FnZSBpbmZvcm1hdGlvbi4gQSBjYWNoZSBpcyBkZXNpcmFibGUgYXMgdGhlIE5QTVxuICogcmVnaXN0cnkgcmVxdWVzdHMgYXJlIHVzdWFsbHkgdmVyeSBsYXJnZSBhbmQgc2xvdy5cbiAqL1xuZXhwb3J0IGNvbnN0IF9ucG1QYWNrYWdlSW5mb0NhY2hlOiB7W3BrZ05hbWU6IHN0cmluZ106IFByb21pc2U8TnBtUGFja2FnZUluZm8+fSA9IHt9O1xuXG4vKipcbiAqIEZldGNoZXMgdGhlIE5QTSBwYWNrYWdlIHJlcHJlc2VudGluZyB0aGUgcHJvamVjdC4gQW5ndWxhciByZXBvc2l0b3JpZXMgdXN1YWxseSBjb250YWluXG4gKiBtdWx0aXBsZSBwYWNrYWdlcyBpbiBhIG1vbm9yZXBvIHNjaGVtZSwgYnV0IHBhY2thZ2VzIGRlYWx0IHdpdGggYXMgcGFydCBvZiB0aGUgcmVsZWFzZVxuICogdG9vbGluZyBhcmUgcmVsZWFzZWQgdG9nZXRoZXIgd2l0aCB0aGUgc2FtZSB2ZXJzaW9uaW5nIGFuZCBicmFuY2hpbmcuIFRoaXMgbWVhbnMgdGhhdFxuICogYSBzaW5nbGUgcGFja2FnZSBjYW4gYmUgdXNlZCBhcyBzb3VyY2Ugb2YgdHJ1dGggZm9yIE5QTSBwYWNrYWdlIHF1ZXJpZXMuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPE5wbVBhY2thZ2VJbmZvPiB7XG4gIGNvbnN0IHBrZ05hbWUgPSBnZXRSZXByZXNlbnRhdGl2ZU5wbVBhY2thZ2UoY29uZmlnKTtcbiAgcmV0dXJuIGF3YWl0IGZldGNoUGFja2FnZUluZm9Gcm9tTnBtUmVnaXN0cnkocGtnTmFtZSk7XG59XG5cbi8qKiBHZXRzIHdoZXRoZXIgdGhlIGdpdmVuIHZlcnNpb24gaXMgcHVibGlzaGVkIHRvIE5QTSBvciBub3QgKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpc1ZlcnNpb25QdWJsaXNoZWRUb05wbShcbiAgICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCBjb25maWc6IFJlbGVhc2VDb25maWcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgY29uc3Qge3ZlcnNpb25zfSA9IGF3YWl0IGZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvKGNvbmZpZyk7XG4gIHJldHVybiB2ZXJzaW9uc1t2ZXJzaW9uLmZvcm1hdCgpXSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHJlcHJlc2VudGF0aXZlIE5QTSBwYWNrYWdlIGZvciB0aGUgc3BlY2lmaWVkIHJlbGVhc2UgY29uZmlndXJhdGlvbi4gQW5ndWxhclxuICogcmVwb3NpdG9yaWVzIHVzdWFsbHkgY29udGFpbiBtdWx0aXBsZSBwYWNrYWdlcyBpbiBhIG1vbm9yZXBvIHNjaGVtZSwgYnV0IHBhY2thZ2VzIGRlYWx0IHdpdGhcbiAqIGFzIHBhcnQgb2YgdGhlIHJlbGVhc2UgdG9vbGluZyBhcmUgcmVsZWFzZWQgdG9nZXRoZXIgd2l0aCB0aGUgc2FtZSB2ZXJzaW9uaW5nIGFuZCBicmFuY2hpbmcuXG4gKiBUaGlzIG1lYW5zIHRoYXQgYSBzaW5nbGUgcGFja2FnZSBjYW4gYmUgdXNlZCBhcyBzb3VyY2Ugb2YgdHJ1dGggZm9yIE5QTSBwYWNrYWdlIHF1ZXJpZXMuXG4gKi9cbmZ1bmN0aW9uIGdldFJlcHJlc2VudGF0aXZlTnBtUGFja2FnZShjb25maWc6IFJlbGVhc2VDb25maWcpIHtcbiAgcmV0dXJuIGNvbmZpZy5ucG1QYWNrYWdlc1swXTtcbn1cblxuLyoqIEZldGNoZXMgdGhlIHNwZWNpZmllZCBOUE0gcGFja2FnZSBmcm9tIHRoZSBOUE0gcmVnaXN0cnkuICovXG5hc3luYyBmdW5jdGlvbiBmZXRjaFBhY2thZ2VJbmZvRnJvbU5wbVJlZ2lzdHJ5KHBrZ05hbWU6IHN0cmluZyk6IFByb21pc2U8TnBtUGFja2FnZUluZm8+IHtcbiAgaWYgKF9ucG1QYWNrYWdlSW5mb0NhY2hlW3BrZ05hbWVdICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gYXdhaXQgX25wbVBhY2thZ2VJbmZvQ2FjaGVbcGtnTmFtZV07XG4gIH1cbiAgY29uc3QgcmVzdWx0ID0gX25wbVBhY2thZ2VJbmZvQ2FjaGVbcGtnTmFtZV0gPVxuICAgICAgZmV0Y2goYGh0dHBzOi8vcmVnaXN0cnkubnBtanMub3JnLyR7cGtnTmFtZX1gKS50aGVuKHIgPT4gci5qc29uKCkpO1xuICByZXR1cm4gYXdhaXQgcmVzdWx0O1xufVxuIl19