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
        define("@angular/dev-infra-private/release/versioning/long-term-support", ["require", "exports", "tslib", "semver", "@angular/dev-infra-private/release/versioning/npm-registry"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLtsNpmDistTagOfMajor = exports.computeLtsEndDateOfMajor = exports.fetchLongTermSupportBranchesFromNpm = exports.ltsNpmDistTagRegex = exports.majorActiveTermSupportDuration = exports.majorActiveSupportDuration = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var npm_registry_1 = require("@angular/dev-infra-private/release/versioning/npm-registry");
    /**
     * Number of months a major version in Angular is actively supported. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    exports.majorActiveSupportDuration = 6;
    /**
     * Number of months a major version has active long-term support. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    exports.majorActiveTermSupportDuration = 12;
    /** Regular expression that matches LTS NPM dist tags. */
    exports.ltsNpmDistTagRegex = /^v(\d+)-lts$/;
    /** Finds all long-term support release trains from the specified NPM package. */
    function fetchLongTermSupportBranchesFromNpm(config) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a, distTags, time, today, active, inactive, npmDistTag, version, branchName, majorReleaseDate, ltsEndDate, ltsBranch;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, npm_registry_1.fetchProjectNpmPackageInfo(config)];
                    case 1:
                        _a = _b.sent(), distTags = _a["dist-tags"], time = _a.time;
                        today = new Date();
                        active = [];
                        inactive = [];
                        // Iterate through the NPM package information and determine active/inactive LTS versions with
                        // their corresponding branches. We assume that a LTS tagged version in NPM belongs to the
                        // last-minor branch of a given major (i.e. we assume there are no outdated LTS NPM dist tags).
                        for (npmDistTag in distTags) {
                            if (exports.ltsNpmDistTagRegex.test(npmDistTag)) {
                                version = semver.parse(distTags[npmDistTag]);
                                branchName = version.major + "." + version.minor + ".x";
                                majorReleaseDate = new Date(time[version.major + ".0.0"]);
                                ltsEndDate = computeLtsEndDateOfMajor(majorReleaseDate);
                                ltsBranch = { name: branchName, version: version, npmDistTag: npmDistTag };
                                // Depending on whether the LTS phase is still active, add the branch
                                // the list of active or inactive LTS branches.
                                if (today <= ltsEndDate) {
                                    active.push(ltsBranch);
                                }
                                else {
                                    inactive.push(ltsBranch);
                                }
                            }
                        }
                        // Sort LTS branches in descending order. i.e. most recent ones first.
                        active.sort(function (a, b) { return semver.rcompare(a.version, b.version); });
                        inactive.sort(function (a, b) { return semver.rcompare(a.version, b.version); });
                        return [2 /*return*/, { active: active, inactive: inactive }];
                }
            });
        });
    }
    exports.fetchLongTermSupportBranchesFromNpm = fetchLongTermSupportBranchesFromNpm;
    /**
     * Computes the date when long-term support ends for a major released at the
     * specified date.
     */
    function computeLtsEndDateOfMajor(majorReleaseDate) {
        return new Date(majorReleaseDate.getFullYear(), majorReleaseDate.getMonth() + exports.majorActiveSupportDuration + exports.majorActiveTermSupportDuration, majorReleaseDate.getDate(), majorReleaseDate.getHours(), majorReleaseDate.getMinutes(), majorReleaseDate.getSeconds(), majorReleaseDate.getMilliseconds());
    }
    exports.computeLtsEndDateOfMajor = computeLtsEndDateOfMajor;
    /** Gets the long-term support NPM dist tag for a given major version. */
    function getLtsNpmDistTagOfMajor(major) {
        // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
        return "v" + major + "-lts";
    }
    exports.getLtsNpmDistTagOfMajor = getLtsNpmDistTagOfMajor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9uZy10ZXJtLXN1cHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFJakMsMkZBQTBEO0lBb0IxRDs7O09BR0c7SUFDVSxRQUFBLDBCQUEwQixHQUFHLENBQUMsQ0FBQztJQUU1Qzs7O09BR0c7SUFDVSxRQUFBLDhCQUE4QixHQUFHLEVBQUUsQ0FBQztJQUVqRCx5REFBeUQ7SUFDNUMsUUFBQSxrQkFBa0IsR0FBRyxjQUFjLENBQUM7SUFFakQsaUZBQWlGO0lBQ2pGLFNBQXNCLG1DQUFtQyxDQUFDLE1BQXFCOzs7Ozs0QkFFdkMscUJBQU0seUNBQTBCLENBQUMsTUFBTSxDQUFDLEVBQUE7O3dCQUF4RSxLQUFnQyxTQUF3QyxFQUExRCxRQUFRLGtCQUFBLEVBQUUsSUFBSSxVQUFBO3dCQUM1QixLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDbkIsTUFBTSxHQUFnQixFQUFFLENBQUM7d0JBQ3pCLFFBQVEsR0FBZ0IsRUFBRSxDQUFDO3dCQUVqQyw4RkFBOEY7d0JBQzlGLDBGQUEwRjt3QkFDMUYsK0ZBQStGO3dCQUMvRixLQUFXLFVBQVUsSUFBSSxRQUFRLEVBQUU7NEJBQ2pDLElBQUksMEJBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dDQUNqQyxPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUUsQ0FBQztnQ0FDOUMsVUFBVSxHQUFNLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQUssT0FBSSxDQUFDO2dDQUNuRCxnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLEtBQUssU0FBTSxDQUFDLENBQUMsQ0FBQztnQ0FDMUQsVUFBVSxHQUFHLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0NBQ3hELFNBQVMsR0FBYyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxTQUFBLEVBQUUsVUFBVSxZQUFBLEVBQUMsQ0FBQztnQ0FDckUscUVBQXFFO2dDQUNyRSwrQ0FBK0M7Z0NBQy9DLElBQUksS0FBSyxJQUFJLFVBQVUsRUFBRTtvQ0FDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQ0FDeEI7cUNBQU07b0NBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQ0FDMUI7NkJBQ0Y7eUJBQ0Y7d0JBRUQsc0VBQXNFO3dCQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQzt3QkFDN0QsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7d0JBRS9ELHNCQUFPLEVBQUMsTUFBTSxRQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUMsRUFBQzs7OztLQUMzQjtJQWhDRCxrRkFnQ0M7SUFFRDs7O09BR0c7SUFDSCxTQUFnQix3QkFBd0IsQ0FBQyxnQkFBc0I7UUFDN0QsT0FBTyxJQUFJLElBQUksQ0FDWCxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsRUFDOUIsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLEdBQUcsa0NBQTBCLEdBQUcsc0NBQThCLEVBQ3pGLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxFQUFFLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxFQUFFLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxFQUN0RixnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLENBQUM7SUFORCw0REFNQztJQUVELHlFQUF5RTtJQUN6RSxTQUFnQix1QkFBdUIsQ0FBQyxLQUFhO1FBQ25ELGdGQUFnRjtRQUNoRixPQUFPLE1BQUksS0FBSyxTQUFNLENBQUM7SUFDekIsQ0FBQztJQUhELDBEQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHNlbXZlciBmcm9tICdzZW12ZXInO1xuXG5pbXBvcnQge1JlbGVhc2VDb25maWd9IGZyb20gJy4uL2NvbmZpZy9pbmRleCc7XG5cbmltcG9ydCB7ZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm99IGZyb20gJy4vbnBtLXJlZ2lzdHJ5JztcblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGRldGVybWluZWQgTFRTIGJyYW5jaGVzLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMdHNCcmFuY2hlcyB7XG4gIC8qKiBMaXN0IG9mIGFjdGl2ZSBMVFMgdmVyc2lvbiBicmFuY2hlcy4gKi9cbiAgYWN0aXZlOiBMdHNCcmFuY2hbXTtcbiAgLyoqIExpc3Qgb2YgaW5hY3RpdmUgTFRTIHZlcnNpb24gYnJhbmNoZXMuICovXG4gIGluYWN0aXZlOiBMdHNCcmFuY2hbXTtcbn1cblxuLyoqIEludGVyZmFjZSBkZXNjcmliaW5nIGFuIExUUyB2ZXJzaW9uIGJyYW5jaC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTHRzQnJhbmNoIHtcbiAgLyoqIE5hbWUgb2YgdGhlIGJyYW5jaC4gKi9cbiAgbmFtZTogc3RyaW5nO1xuICAvKiogTW9zdCByZWNlbnQgdmVyc2lvbiBmb3IgdGhlIGdpdmVuIExUUyBicmFuY2guICovXG4gIHZlcnNpb246IHNlbXZlci5TZW1WZXI7XG4gIC8qKiBOUE0gZGlzdCB0YWcgZm9yIHRoZSBMVFMgdmVyc2lvbi4gKi9cbiAgbnBtRGlzdFRhZzogc3RyaW5nO1xufVxuXG4vKipcbiAqIE51bWJlciBvZiBtb250aHMgYSBtYWpvciB2ZXJzaW9uIGluIEFuZ3VsYXIgaXMgYWN0aXZlbHkgc3VwcG9ydGVkLiBTZWU6XG4gKiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvcmVsZWFzZXMjc3VwcG9ydC1wb2xpY3ktYW5kLXNjaGVkdWxlLlxuICovXG5leHBvcnQgY29uc3QgbWFqb3JBY3RpdmVTdXBwb3J0RHVyYXRpb24gPSA2O1xuXG4vKipcbiAqIE51bWJlciBvZiBtb250aHMgYSBtYWpvciB2ZXJzaW9uIGhhcyBhY3RpdmUgbG9uZy10ZXJtIHN1cHBvcnQuIFNlZTpcbiAqIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9yZWxlYXNlcyNzdXBwb3J0LXBvbGljeS1hbmQtc2NoZWR1bGUuXG4gKi9cbmV4cG9ydCBjb25zdCBtYWpvckFjdGl2ZVRlcm1TdXBwb3J0RHVyYXRpb24gPSAxMjtcblxuLyoqIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgTFRTIE5QTSBkaXN0IHRhZ3MuICovXG5leHBvcnQgY29uc3QgbHRzTnBtRGlzdFRhZ1JlZ2V4ID0gL152KFxcZCspLWx0cyQvO1xuXG4vKiogRmluZHMgYWxsIGxvbmctdGVybSBzdXBwb3J0IHJlbGVhc2UgdHJhaW5zIGZyb20gdGhlIHNwZWNpZmllZCBOUE0gcGFja2FnZS4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmZXRjaExvbmdUZXJtU3VwcG9ydEJyYW5jaGVzRnJvbU5wbShjb25maWc6IFJlbGVhc2VDb25maWcpOlxuICAgIFByb21pc2U8THRzQnJhbmNoZXM+IHtcbiAgY29uc3QgeydkaXN0LXRhZ3MnOiBkaXN0VGFncywgdGltZX0gPSBhd2FpdCBmZXRjaFByb2plY3ROcG1QYWNrYWdlSW5mbyhjb25maWcpO1xuICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gIGNvbnN0IGFjdGl2ZTogTHRzQnJhbmNoW10gPSBbXTtcbiAgY29uc3QgaW5hY3RpdmU6IEx0c0JyYW5jaFtdID0gW107XG5cbiAgLy8gSXRlcmF0ZSB0aHJvdWdoIHRoZSBOUE0gcGFja2FnZSBpbmZvcm1hdGlvbiBhbmQgZGV0ZXJtaW5lIGFjdGl2ZS9pbmFjdGl2ZSBMVFMgdmVyc2lvbnMgd2l0aFxuICAvLyB0aGVpciBjb3JyZXNwb25kaW5nIGJyYW5jaGVzLiBXZSBhc3N1bWUgdGhhdCBhIExUUyB0YWdnZWQgdmVyc2lvbiBpbiBOUE0gYmVsb25ncyB0byB0aGVcbiAgLy8gbGFzdC1taW5vciBicmFuY2ggb2YgYSBnaXZlbiBtYWpvciAoaS5lLiB3ZSBhc3N1bWUgdGhlcmUgYXJlIG5vIG91dGRhdGVkIExUUyBOUE0gZGlzdCB0YWdzKS5cbiAgZm9yIChjb25zdCBucG1EaXN0VGFnIGluIGRpc3RUYWdzKSB7XG4gICAgaWYgKGx0c05wbURpc3RUYWdSZWdleC50ZXN0KG5wbURpc3RUYWcpKSB7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKGRpc3RUYWdzW25wbURpc3RUYWddKSE7XG4gICAgICBjb25zdCBicmFuY2hOYW1lID0gYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS54YDtcbiAgICAgIGNvbnN0IG1ham9yUmVsZWFzZURhdGUgPSBuZXcgRGF0ZSh0aW1lW2Ake3ZlcnNpb24ubWFqb3J9LjAuMGBdKTtcbiAgICAgIGNvbnN0IGx0c0VuZERhdGUgPSBjb21wdXRlTHRzRW5kRGF0ZU9mTWFqb3IobWFqb3JSZWxlYXNlRGF0ZSk7XG4gICAgICBjb25zdCBsdHNCcmFuY2g6IEx0c0JyYW5jaCA9IHtuYW1lOiBicmFuY2hOYW1lLCB2ZXJzaW9uLCBucG1EaXN0VGFnfTtcbiAgICAgIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBMVFMgcGhhc2UgaXMgc3RpbGwgYWN0aXZlLCBhZGQgdGhlIGJyYW5jaFxuICAgICAgLy8gdGhlIGxpc3Qgb2YgYWN0aXZlIG9yIGluYWN0aXZlIExUUyBicmFuY2hlcy5cbiAgICAgIGlmICh0b2RheSA8PSBsdHNFbmREYXRlKSB7XG4gICAgICAgIGFjdGl2ZS5wdXNoKGx0c0JyYW5jaCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmFjdGl2ZS5wdXNoKGx0c0JyYW5jaCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBMVFMgYnJhbmNoZXMgaW4gZGVzY2VuZGluZyBvcmRlci4gaS5lLiBtb3N0IHJlY2VudCBvbmVzIGZpcnN0LlxuICBhY3RpdmUuc29ydCgoYSwgYikgPT4gc2VtdmVyLnJjb21wYXJlKGEudmVyc2lvbiwgYi52ZXJzaW9uKSk7XG4gIGluYWN0aXZlLnNvcnQoKGEsIGIpID0+IHNlbXZlci5yY29tcGFyZShhLnZlcnNpb24sIGIudmVyc2lvbikpO1xuXG4gIHJldHVybiB7YWN0aXZlLCBpbmFjdGl2ZX07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGRhdGUgd2hlbiBsb25nLXRlcm0gc3VwcG9ydCBlbmRzIGZvciBhIG1ham9yIHJlbGVhc2VkIGF0IHRoZVxuICogc3BlY2lmaWVkIGRhdGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wdXRlTHRzRW5kRGF0ZU9mTWFqb3IobWFqb3JSZWxlYXNlRGF0ZTogRGF0ZSk6IERhdGUge1xuICByZXR1cm4gbmV3IERhdGUoXG4gICAgICBtYWpvclJlbGVhc2VEYXRlLmdldEZ1bGxZZWFyKCksXG4gICAgICBtYWpvclJlbGVhc2VEYXRlLmdldE1vbnRoKCkgKyBtYWpvckFjdGl2ZVN1cHBvcnREdXJhdGlvbiArIG1ham9yQWN0aXZlVGVybVN1cHBvcnREdXJhdGlvbixcbiAgICAgIG1ham9yUmVsZWFzZURhdGUuZ2V0RGF0ZSgpLCBtYWpvclJlbGVhc2VEYXRlLmdldEhvdXJzKCksIG1ham9yUmVsZWFzZURhdGUuZ2V0TWludXRlcygpLFxuICAgICAgbWFqb3JSZWxlYXNlRGF0ZS5nZXRTZWNvbmRzKCksIG1ham9yUmVsZWFzZURhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xufVxuXG4vKiogR2V0cyB0aGUgbG9uZy10ZXJtIHN1cHBvcnQgTlBNIGRpc3QgdGFnIGZvciBhIGdpdmVuIG1ham9yIHZlcnNpb24uICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IobWFqb3I6IG51bWJlcik6IHN0cmluZyB7XG4gIC8vIExUUyB2ZXJzaW9ucyBzaG91bGQgYmUgdGFnZ2VkIGluIE5QTSBpbiB0aGUgZm9sbG93aW5nIGZvcm1hdDogYHZ7bWFqb3J9LWx0c2AuXG4gIHJldHVybiBgdiR7bWFqb3J9LWx0c2A7XG59XG4iXX0=