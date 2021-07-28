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
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (exports._npmPackageInfoCache[pkgName] === undefined) {
                            exports._npmPackageInfoCache[pkgName] =
                                node_fetch_1.default("https://registry.npmjs.org/" + pkgName).then(function (r) { return r.json(); });
                        }
                        return [4 /*yield*/, exports._npmPackageInfoCache[pkgName]];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLXJlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3JlbGVhc2UvdmVyc2lvbmluZy9ucG0tcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILHlDQUErQjtJQW1CL0I7OztPQUdHO0lBQ1UsUUFBQSxvQkFBb0IsR0FBaUQsRUFBRSxDQUFDO0lBRXJGOzs7OztPQUtHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQUMsTUFBcUI7Ozs7Ozt3QkFDOUQsT0FBTyxHQUFHLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUM3QyxxQkFBTSwrQkFBK0IsQ0FBQyxPQUFPLENBQUMsRUFBQTs0QkFBckQsc0JBQU8sU0FBOEMsRUFBQzs7OztLQUN2RDtJQUhELGdFQUdDO0lBRUQsZ0VBQWdFO0lBQ2hFLFNBQXNCLHVCQUF1QixDQUN6QyxPQUFzQixFQUFFLE1BQXFCOzs7Ozs0QkFDNUIscUJBQU0sMEJBQTBCLENBQUMsTUFBTSxDQUFDLEVBQUE7O3dCQUFwRCxRQUFRLEdBQUksQ0FBQSxTQUF3QyxDQUFBLFNBQTVDO3dCQUNmLHNCQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxTQUFTLEVBQUM7Ozs7S0FDakQ7SUFKRCwwREFJQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBUywyQkFBMkIsQ0FBQyxNQUFxQjtRQUN4RCxPQUFPLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELCtEQUErRDtJQUMvRCxTQUFlLCtCQUErQixDQUFDLE9BQWU7Ozs7O3dCQUM1RCxJQUFJLDRCQUFvQixDQUFDLE9BQU8sQ0FBQyxLQUFLLFNBQVMsRUFBRTs0QkFDL0MsNEJBQW9CLENBQUMsT0FBTyxDQUFDO2dDQUN6QixvQkFBSyxDQUFDLGdDQUE4QixPQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQVIsQ0FBUSxDQUFDLENBQUM7eUJBQ3hFO3dCQUNNLHFCQUFNLDRCQUFvQixDQUFDLE9BQU8sQ0FBQyxFQUFBOzRCQUExQyxzQkFBTyxTQUFtQyxFQUFDOzs7O0tBQzVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCBmZXRjaCBmcm9tICdub2RlLWZldGNoJztcbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5pbXBvcnQge0x0c05wbURpc3RUYWd9IGZyb20gJy4vbG9uZy10ZXJtLXN1cHBvcnQnO1xuXG4vKiogVHlwZSBkZXNjcmliaW5nIHRoZSBwb3NzaWJsZSBOUE0gZGlzdCB0YWdzIHVzZWQgYnkgQW5ndWxhciBwYWNrYWdlcy4gKi9cbmV4cG9ydCB0eXBlIE5wbURpc3RUYWcgPSAnbGF0ZXN0J3wnbmV4dCd8THRzTnBtRGlzdFRhZztcblxuLyoqIFR5cGUgZGVzY3JpYmluZyBhbiBOUE0gcGFja2FnZSBmZXRjaGVkIGZyb20gdGhlIHJlZ2lzdHJ5LiAqL1xuZXhwb3J0IGludGVyZmFjZSBOcG1QYWNrYWdlSW5mbyB7XG4gIC8qKiBNYXBzIG9mIHZlcnNpb25zIGFuZCB0aGVpciBwYWNrYWdlIEpTT04gb2JqZWN0cy4gKi9cbiAgJ3ZlcnNpb25zJzoge1tuYW1lOiBzdHJpbmddOiB1bmRlZmluZWR8b2JqZWN0fTtcbiAgLyoqIE1hcCBvZiBOUE0gZGlzdC10YWdzIGFuZCB0aGVpciBjaG9zZW4gdmVyc2lvbi4gKi9cbiAgJ2Rpc3QtdGFncyc6IHtbdGFnTmFtZTogc3RyaW5nXTogc3RyaW5nfHVuZGVmaW5lZH07XG4gIC8qKiBNYXAgb2YgdmVyc2lvbnMgYW5kIHRoZWlyIElTTyByZWxlYXNlIHRpbWUuICovXG4gICd0aW1lJzoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9O1xufVxuXG4vKipcbiAqIENhY2hlIGZvciByZXF1ZXN0ZWQgTlBNIHBhY2thZ2UgaW5mb3JtYXRpb24uIEEgY2FjaGUgaXMgZGVzaXJhYmxlIGFzIHRoZSBOUE1cbiAqIHJlZ2lzdHJ5IHJlcXVlc3RzIGFyZSB1c3VhbGx5IHZlcnkgbGFyZ2UgYW5kIHNsb3cuXG4gKi9cbmV4cG9ydCBjb25zdCBfbnBtUGFja2FnZUluZm9DYWNoZToge1twa2dOYW1lOiBzdHJpbmddOiBQcm9taXNlPE5wbVBhY2thZ2VJbmZvPn0gPSB7fTtcblxuLyoqXG4gKiBGZXRjaGVzIHRoZSBOUE0gcGFja2FnZSByZXByZXNlbnRpbmcgdGhlIHByb2plY3QuIEFuZ3VsYXIgcmVwb3NpdG9yaWVzIHVzdWFsbHkgY29udGFpblxuICogbXVsdGlwbGUgcGFja2FnZXMgaW4gYSBtb25vcmVwbyBzY2hlbWUsIGJ1dCBwYWNrYWdlcyBkZWFsdCB3aXRoIGFzIHBhcnQgb2YgdGhlIHJlbGVhc2VcbiAqIHRvb2xpbmcgYXJlIHJlbGVhc2VkIHRvZ2V0aGVyIHdpdGggdGhlIHNhbWUgdmVyc2lvbmluZyBhbmQgYnJhbmNoaW5nLiBUaGlzIG1lYW5zIHRoYXRcbiAqIGEgc2luZ2xlIHBhY2thZ2UgY2FuIGJlIHVzZWQgYXMgc291cmNlIG9mIHRydXRoIGZvciBOUE0gcGFja2FnZSBxdWVyaWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm8oY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxOcG1QYWNrYWdlSW5mbz4ge1xuICBjb25zdCBwa2dOYW1lID0gZ2V0UmVwcmVzZW50YXRpdmVOcG1QYWNrYWdlKGNvbmZpZyk7XG4gIHJldHVybiBhd2FpdCBmZXRjaFBhY2thZ2VJbmZvRnJvbU5wbVJlZ2lzdHJ5KHBrZ05hbWUpO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIHRoZSBnaXZlbiB2ZXJzaW9uIGlzIHB1Ymxpc2hlZCB0byBOUE0gb3Igbm90ICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNWZXJzaW9uUHVibGlzaGVkVG9OcG0oXG4gICAgdmVyc2lvbjogc2VtdmVyLlNlbVZlciwgY29uZmlnOiBSZWxlYXNlQ29uZmlnKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIGNvbnN0IHt2ZXJzaW9uc30gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWcpO1xuICByZXR1cm4gdmVyc2lvbnNbdmVyc2lvbi5mb3JtYXQoKV0gIT09IHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSByZXByZXNlbnRhdGl2ZSBOUE0gcGFja2FnZSBmb3IgdGhlIHNwZWNpZmllZCByZWxlYXNlIGNvbmZpZ3VyYXRpb24uIEFuZ3VsYXJcbiAqIHJlcG9zaXRvcmllcyB1c3VhbGx5IGNvbnRhaW4gbXVsdGlwbGUgcGFja2FnZXMgaW4gYSBtb25vcmVwbyBzY2hlbWUsIGJ1dCBwYWNrYWdlcyBkZWFsdCB3aXRoXG4gKiBhcyBwYXJ0IG9mIHRoZSByZWxlYXNlIHRvb2xpbmcgYXJlIHJlbGVhc2VkIHRvZ2V0aGVyIHdpdGggdGhlIHNhbWUgdmVyc2lvbmluZyBhbmQgYnJhbmNoaW5nLlxuICogVGhpcyBtZWFucyB0aGF0IGEgc2luZ2xlIHBhY2thZ2UgY2FuIGJlIHVzZWQgYXMgc291cmNlIG9mIHRydXRoIGZvciBOUE0gcGFja2FnZSBxdWVyaWVzLlxuICovXG5mdW5jdGlvbiBnZXRSZXByZXNlbnRhdGl2ZU5wbVBhY2thZ2UoY29uZmlnOiBSZWxlYXNlQ29uZmlnKSB7XG4gIHJldHVybiBjb25maWcubnBtUGFja2FnZXNbMF07XG59XG5cbi8qKiBGZXRjaGVzIHRoZSBzcGVjaWZpZWQgTlBNIHBhY2thZ2UgZnJvbSB0aGUgTlBNIHJlZ2lzdHJ5LiAqL1xuYXN5bmMgZnVuY3Rpb24gZmV0Y2hQYWNrYWdlSW5mb0Zyb21OcG1SZWdpc3RyeShwa2dOYW1lOiBzdHJpbmcpOiBQcm9taXNlPE5wbVBhY2thZ2VJbmZvPiB7XG4gIGlmIChfbnBtUGFja2FnZUluZm9DYWNoZVtwa2dOYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgX25wbVBhY2thZ2VJbmZvQ2FjaGVbcGtnTmFtZV0gPVxuICAgICAgICBmZXRjaChgaHR0cHM6Ly9yZWdpc3RyeS5ucG1qcy5vcmcvJHtwa2dOYW1lfWApLnRoZW4ociA9PiByLmpzb24oKSk7XG4gIH1cbiAgcmV0dXJuIGF3YWl0IF9ucG1QYWNrYWdlSW5mb0NhY2hlW3BrZ05hbWVdO1xufVxuIl19