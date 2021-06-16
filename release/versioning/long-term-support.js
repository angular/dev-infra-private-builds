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
    exports.getLtsNpmDistTagOfMajor = exports.computeLtsEndDateOfMajor = exports.isLtsDistTag = exports.fetchLongTermSupportBranchesFromNpm = void 0;
    var tslib_1 = require("tslib");
    var semver = require("semver");
    var npm_registry_1 = require("@angular/dev-infra-private/release/versioning/npm-registry");
    /**
     * Number of months a major version in Angular is actively supported. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    var majorActiveSupportDuration = 6;
    /**
     * Number of months a major version has active long-term support. See:
     * https://angular.io/guide/releases#support-policy-and-schedule.
     */
    var majorLongTermSupportDuration = 12;
    /** Regular expression that matches LTS NPM dist tags. */
    var ltsNpmDistTagRegex = /^v(\d+)-lts$/;
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
                        // their corresponding branches. We assume that an LTS tagged version in NPM belongs to the
                        // last-minor branch of a given major (i.e. we assume there are no outdated LTS NPM dist tags).
                        for (npmDistTag in distTags) {
                            if (isLtsDistTag(npmDistTag)) {
                                version = semver.parse(distTags[npmDistTag]);
                                branchName = version.major + "." + version.minor + ".x";
                                majorReleaseDate = new Date(time[version.major + ".0.0"]);
                                ltsEndDate = computeLtsEndDateOfMajor(majorReleaseDate);
                                ltsBranch = { name: branchName, version: version, npmDistTag: npmDistTag };
                                // Depending on whether the LTS phase is still active, add the branch
                                // to the list of active or inactive LTS branches.
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
    /** Gets whether the specified tag corresponds to a LTS dist tag. */
    function isLtsDistTag(tagName) {
        return ltsNpmDistTagRegex.test(tagName);
    }
    exports.isLtsDistTag = isLtsDistTag;
    /**
     * Computes the date when long-term support ends for a major released at the
     * specified date.
     */
    function computeLtsEndDateOfMajor(majorReleaseDate) {
        return new Date(majorReleaseDate.getFullYear(), majorReleaseDate.getMonth() + majorActiveSupportDuration + majorLongTermSupportDuration, majorReleaseDate.getDate(), majorReleaseDate.getHours(), majorReleaseDate.getMinutes(), majorReleaseDate.getSeconds(), majorReleaseDate.getMilliseconds());
    }
    exports.computeLtsEndDateOfMajor = computeLtsEndDateOfMajor;
    /** Gets the long-term support NPM dist tag for a given major version. */
    function getLtsNpmDistTagOfMajor(major) {
        // LTS versions should be tagged in NPM in the following format: `v{major}-lts`.
        return "v" + major + "-lts";
    }
    exports.getLtsNpmDistTagOfMajor = getLtsNpmDistTagOfMajor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9uZy10ZXJtLXN1cHBvcnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcmVsZWFzZS92ZXJzaW9uaW5nL2xvbmctdGVybS1zdXBwb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFJakMsMkZBQTBEO0lBdUIxRDs7O09BR0c7SUFDSCxJQUFNLDBCQUEwQixHQUFHLENBQUMsQ0FBQztJQUVyQzs7O09BR0c7SUFDSCxJQUFNLDRCQUE0QixHQUFHLEVBQUUsQ0FBQztJQUV4Qyx5REFBeUQ7SUFDekQsSUFBTSxrQkFBa0IsR0FBRyxjQUFjLENBQUM7SUFFMUMsaUZBQWlGO0lBQ2pGLFNBQXNCLG1DQUFtQyxDQUFDLE1BQXFCOzs7Ozs0QkFFdkMscUJBQU0seUNBQTBCLENBQUMsTUFBTSxDQUFDLEVBQUE7O3dCQUF4RSxLQUFnQyxTQUF3QyxFQUExRCxRQUFRLGtCQUFBLEVBQUUsSUFBSSxVQUFBO3dCQUM1QixLQUFLLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQzt3QkFDbkIsTUFBTSxHQUFnQixFQUFFLENBQUM7d0JBQ3pCLFFBQVEsR0FBZ0IsRUFBRSxDQUFDO3dCQUVqQyw4RkFBOEY7d0JBQzlGLDJGQUEyRjt3QkFDM0YsK0ZBQStGO3dCQUMvRixLQUFXLFVBQVUsSUFBSSxRQUFRLEVBQUU7NEJBQ2pDLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dDQUN0QixPQUFPLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUUsQ0FBQztnQ0FDOUMsVUFBVSxHQUFNLE9BQU8sQ0FBQyxLQUFLLFNBQUksT0FBTyxDQUFDLEtBQUssT0FBSSxDQUFDO2dDQUNuRCxnQkFBZ0IsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLEtBQUssU0FBTSxDQUFDLENBQUMsQ0FBQztnQ0FDMUQsVUFBVSxHQUFHLHdCQUF3QixDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0NBQ3hELFNBQVMsR0FBYyxFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsT0FBTyxTQUFBLEVBQUUsVUFBVSxZQUFBLEVBQUMsQ0FBQztnQ0FDckUscUVBQXFFO2dDQUNyRSxrREFBa0Q7Z0NBQ2xELElBQUksS0FBSyxJQUFJLFVBQVUsRUFBRTtvQ0FDdkIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQ0FDeEI7cUNBQU07b0NBQ0wsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQ0FDMUI7NkJBQ0Y7eUJBQ0Y7d0JBRUQsc0VBQXNFO3dCQUN0RSxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSyxPQUFBLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQXJDLENBQXFDLENBQUMsQ0FBQzt3QkFDN0QsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFyQyxDQUFxQyxDQUFDLENBQUM7d0JBRS9ELHNCQUFPLEVBQUMsTUFBTSxRQUFBLEVBQUUsUUFBUSxVQUFBLEVBQUMsRUFBQzs7OztLQUMzQjtJQWhDRCxrRkFnQ0M7SUFFRCxvRUFBb0U7SUFDcEUsU0FBZ0IsWUFBWSxDQUFDLE9BQWU7UUFDMUMsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUZELG9DQUVDO0lBRUQ7OztPQUdHO0lBQ0gsU0FBZ0Isd0JBQXdCLENBQUMsZ0JBQXNCO1FBQzdELE9BQU8sSUFBSSxJQUFJLENBQ1gsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLEVBQzlCLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxHQUFHLDBCQUEwQixHQUFHLDRCQUE0QixFQUN2RixnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsRUFDdEYsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLEVBQUUsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBTkQsNERBTUM7SUFFRCx5RUFBeUU7SUFDekUsU0FBZ0IsdUJBQXVCLENBQUMsS0FBYTtRQUNuRCxnRkFBZ0Y7UUFDaEYsT0FBTyxNQUFJLEtBQUssU0FBZSxDQUFDO0lBQ2xDLENBQUM7SUFIRCwwREFHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcblxuaW1wb3J0IHtSZWxlYXNlQ29uZmlnfSBmcm9tICcuLi9jb25maWcvaW5kZXgnO1xuXG5pbXBvcnQge2ZldGNoUHJvamVjdE5wbVBhY2thZ2VJbmZvfSBmcm9tICcuL25wbS1yZWdpc3RyeSc7XG5cbi8qKiBUeXBlIGRlc2NyaWJpbmcgYSBOUE0gZGlzdCB0YWcgaW5kaWNhdGluZyBsb25nLXRlcm0gc3VwcG9ydC4gKi9cbmV4cG9ydCB0eXBlIEx0c05wbURpc3RUYWcgPSBgdiR7bnVtYmVyfS1sdHNgO1xuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgZGV0ZXJtaW5lZCBMVFMgYnJhbmNoZXMuICovXG5leHBvcnQgaW50ZXJmYWNlIEx0c0JyYW5jaGVzIHtcbiAgLyoqIExpc3Qgb2YgYWN0aXZlIExUUyB2ZXJzaW9uIGJyYW5jaGVzLiAqL1xuICBhY3RpdmU6IEx0c0JyYW5jaFtdO1xuICAvKiogTGlzdCBvZiBpbmFjdGl2ZSBMVFMgdmVyc2lvbiBicmFuY2hlcy4gKi9cbiAgaW5hY3RpdmU6IEx0c0JyYW5jaFtdO1xufVxuXG4vKiogSW50ZXJmYWNlIGRlc2NyaWJpbmcgYW4gTFRTIHZlcnNpb24gYnJhbmNoLiAqL1xuZXhwb3J0IGludGVyZmFjZSBMdHNCcmFuY2gge1xuICAvKiogTmFtZSBvZiB0aGUgYnJhbmNoLiAqL1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBNb3N0IHJlY2VudCB2ZXJzaW9uIGZvciB0aGUgZ2l2ZW4gTFRTIGJyYW5jaC4gKi9cbiAgdmVyc2lvbjogc2VtdmVyLlNlbVZlcjtcbiAgLyoqIE5QTSBkaXN0IHRhZyBmb3IgdGhlIExUUyB2ZXJzaW9uLiAqL1xuICBucG1EaXN0VGFnOiBMdHNOcG1EaXN0VGFnO1xufVxuXG4vKipcbiAqIE51bWJlciBvZiBtb250aHMgYSBtYWpvciB2ZXJzaW9uIGluIEFuZ3VsYXIgaXMgYWN0aXZlbHkgc3VwcG9ydGVkLiBTZWU6XG4gKiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvcmVsZWFzZXMjc3VwcG9ydC1wb2xpY3ktYW5kLXNjaGVkdWxlLlxuICovXG5jb25zdCBtYWpvckFjdGl2ZVN1cHBvcnREdXJhdGlvbiA9IDY7XG5cbi8qKlxuICogTnVtYmVyIG9mIG1vbnRocyBhIG1ham9yIHZlcnNpb24gaGFzIGFjdGl2ZSBsb25nLXRlcm0gc3VwcG9ydC4gU2VlOlxuICogaHR0cHM6Ly9hbmd1bGFyLmlvL2d1aWRlL3JlbGVhc2VzI3N1cHBvcnQtcG9saWN5LWFuZC1zY2hlZHVsZS5cbiAqL1xuY29uc3QgbWFqb3JMb25nVGVybVN1cHBvcnREdXJhdGlvbiA9IDEyO1xuXG4vKiogUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBMVFMgTlBNIGRpc3QgdGFncy4gKi9cbmNvbnN0IGx0c05wbURpc3RUYWdSZWdleCA9IC9edihcXGQrKS1sdHMkLztcblxuLyoqIEZpbmRzIGFsbCBsb25nLXRlcm0gc3VwcG9ydCByZWxlYXNlIHRyYWlucyBmcm9tIHRoZSBzcGVjaWZpZWQgTlBNIHBhY2thZ2UuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hMb25nVGVybVN1cHBvcnRCcmFuY2hlc0Zyb21OcG0oY29uZmlnOiBSZWxlYXNlQ29uZmlnKTpcbiAgICBQcm9taXNlPEx0c0JyYW5jaGVzPiB7XG4gIGNvbnN0IHsnZGlzdC10YWdzJzogZGlzdFRhZ3MsIHRpbWV9ID0gYXdhaXQgZmV0Y2hQcm9qZWN0TnBtUGFja2FnZUluZm8oY29uZmlnKTtcbiAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBjb25zdCBhY3RpdmU6IEx0c0JyYW5jaFtdID0gW107XG4gIGNvbnN0IGluYWN0aXZlOiBMdHNCcmFuY2hbXSA9IFtdO1xuXG4gIC8vIEl0ZXJhdGUgdGhyb3VnaCB0aGUgTlBNIHBhY2thZ2UgaW5mb3JtYXRpb24gYW5kIGRldGVybWluZSBhY3RpdmUvaW5hY3RpdmUgTFRTIHZlcnNpb25zIHdpdGhcbiAgLy8gdGhlaXIgY29ycmVzcG9uZGluZyBicmFuY2hlcy4gV2UgYXNzdW1lIHRoYXQgYW4gTFRTIHRhZ2dlZCB2ZXJzaW9uIGluIE5QTSBiZWxvbmdzIHRvIHRoZVxuICAvLyBsYXN0LW1pbm9yIGJyYW5jaCBvZiBhIGdpdmVuIG1ham9yIChpLmUuIHdlIGFzc3VtZSB0aGVyZSBhcmUgbm8gb3V0ZGF0ZWQgTFRTIE5QTSBkaXN0IHRhZ3MpLlxuICBmb3IgKGNvbnN0IG5wbURpc3RUYWcgaW4gZGlzdFRhZ3MpIHtcbiAgICBpZiAoaXNMdHNEaXN0VGFnKG5wbURpc3RUYWcpKSB7XG4gICAgICBjb25zdCB2ZXJzaW9uID0gc2VtdmVyLnBhcnNlKGRpc3RUYWdzW25wbURpc3RUYWddKSE7XG4gICAgICBjb25zdCBicmFuY2hOYW1lID0gYCR7dmVyc2lvbi5tYWpvcn0uJHt2ZXJzaW9uLm1pbm9yfS54YDtcbiAgICAgIGNvbnN0IG1ham9yUmVsZWFzZURhdGUgPSBuZXcgRGF0ZSh0aW1lW2Ake3ZlcnNpb24ubWFqb3J9LjAuMGBdKTtcbiAgICAgIGNvbnN0IGx0c0VuZERhdGUgPSBjb21wdXRlTHRzRW5kRGF0ZU9mTWFqb3IobWFqb3JSZWxlYXNlRGF0ZSk7XG4gICAgICBjb25zdCBsdHNCcmFuY2g6IEx0c0JyYW5jaCA9IHtuYW1lOiBicmFuY2hOYW1lLCB2ZXJzaW9uLCBucG1EaXN0VGFnfTtcbiAgICAgIC8vIERlcGVuZGluZyBvbiB3aGV0aGVyIHRoZSBMVFMgcGhhc2UgaXMgc3RpbGwgYWN0aXZlLCBhZGQgdGhlIGJyYW5jaFxuICAgICAgLy8gdG8gdGhlIGxpc3Qgb2YgYWN0aXZlIG9yIGluYWN0aXZlIExUUyBicmFuY2hlcy5cbiAgICAgIGlmICh0b2RheSA8PSBsdHNFbmREYXRlKSB7XG4gICAgICAgIGFjdGl2ZS5wdXNoKGx0c0JyYW5jaCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbmFjdGl2ZS5wdXNoKGx0c0JyYW5jaCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gU29ydCBMVFMgYnJhbmNoZXMgaW4gZGVzY2VuZGluZyBvcmRlci4gaS5lLiBtb3N0IHJlY2VudCBvbmVzIGZpcnN0LlxuICBhY3RpdmUuc29ydCgoYSwgYikgPT4gc2VtdmVyLnJjb21wYXJlKGEudmVyc2lvbiwgYi52ZXJzaW9uKSk7XG4gIGluYWN0aXZlLnNvcnQoKGEsIGIpID0+IHNlbXZlci5yY29tcGFyZShhLnZlcnNpb24sIGIudmVyc2lvbikpO1xuXG4gIHJldHVybiB7YWN0aXZlLCBpbmFjdGl2ZX07XG59XG5cbi8qKiBHZXRzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCB0YWcgY29ycmVzcG9uZHMgdG8gYSBMVFMgZGlzdCB0YWcuICovXG5leHBvcnQgZnVuY3Rpb24gaXNMdHNEaXN0VGFnKHRhZ05hbWU6IHN0cmluZyk6IHRhZ05hbWUgaXMgTHRzTnBtRGlzdFRhZyB7XG4gIHJldHVybiBsdHNOcG1EaXN0VGFnUmVnZXgudGVzdCh0YWdOYW1lKTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgZGF0ZSB3aGVuIGxvbmctdGVybSBzdXBwb3J0IGVuZHMgZm9yIGEgbWFqb3IgcmVsZWFzZWQgYXQgdGhlXG4gKiBzcGVjaWZpZWQgZGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXB1dGVMdHNFbmREYXRlT2ZNYWpvcihtYWpvclJlbGVhc2VEYXRlOiBEYXRlKTogRGF0ZSB7XG4gIHJldHVybiBuZXcgRGF0ZShcbiAgICAgIG1ham9yUmVsZWFzZURhdGUuZ2V0RnVsbFllYXIoKSxcbiAgICAgIG1ham9yUmVsZWFzZURhdGUuZ2V0TW9udGgoKSArIG1ham9yQWN0aXZlU3VwcG9ydER1cmF0aW9uICsgbWFqb3JMb25nVGVybVN1cHBvcnREdXJhdGlvbixcbiAgICAgIG1ham9yUmVsZWFzZURhdGUuZ2V0RGF0ZSgpLCBtYWpvclJlbGVhc2VEYXRlLmdldEhvdXJzKCksIG1ham9yUmVsZWFzZURhdGUuZ2V0TWludXRlcygpLFxuICAgICAgbWFqb3JSZWxlYXNlRGF0ZS5nZXRTZWNvbmRzKCksIG1ham9yUmVsZWFzZURhdGUuZ2V0TWlsbGlzZWNvbmRzKCkpO1xufVxuXG4vKiogR2V0cyB0aGUgbG9uZy10ZXJtIHN1cHBvcnQgTlBNIGRpc3QgdGFnIGZvciBhIGdpdmVuIG1ham9yIHZlcnNpb24uICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0THRzTnBtRGlzdFRhZ09mTWFqb3IobWFqb3I6IG51bWJlcik6IEx0c05wbURpc3RUYWcge1xuICAvLyBMVFMgdmVyc2lvbnMgc2hvdWxkIGJlIHRhZ2dlZCBpbiBOUE0gaW4gdGhlIGZvbGxvd2luZyBmb3JtYXQ6IGB2e21ham9yfS1sdHNgLlxuICByZXR1cm4gYHYke21ham9yfS1sdHNgIGFzIGNvbnN0O1xufVxuIl19