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
        define("@angular/dev-infra-private/utils/semver", ["require", "exports", "semver"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createExperimentalSemver = exports.semverInc = void 0;
    var semver = require("semver");
    /**
     * Increments a specified SemVer version. Compared to the original increment in SemVer,
     * the version is cloned to not modify the original version instance.
     */
    function semverInc(version, release, identifier) {
        var clone = new semver.SemVer(version.version);
        return clone.inc(release, identifier);
    }
    exports.semverInc = semverInc;
    /** Creates the equivalent experimental version for a provided SemVer. */
    function createExperimentalSemver(version) {
        version = new semver.SemVer(version);
        var experimentalVersion = new semver.SemVer(version.format());
        experimentalVersion.major = 0;
        experimentalVersion.minor = version.major * 100 + version.minor;
        return new semver.SemVer(experimentalVersion.format());
    }
    exports.createExperimentalSemver = createExperimentalSemver;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VtdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL3NlbXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFFakM7OztPQUdHO0lBQ0gsU0FBZ0IsU0FBUyxDQUNyQixPQUFzQixFQUFFLE9BQTJCLEVBQUUsVUFBbUI7UUFDMUUsSUFBTSxLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNqRCxPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFKRCw4QkFJQztJQUVELHlFQUF5RTtJQUN6RSxTQUFnQix3QkFBd0IsQ0FBQyxPQUE2QjtRQUNwRSxPQUFPLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3JDLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO1FBQ2hFLG1CQUFtQixDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDOUIsbUJBQW1CLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDaEUsT0FBTyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBTkQsNERBTUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5cbi8qKlxuICogSW5jcmVtZW50cyBhIHNwZWNpZmllZCBTZW1WZXIgdmVyc2lvbi4gQ29tcGFyZWQgdG8gdGhlIG9yaWdpbmFsIGluY3JlbWVudCBpbiBTZW1WZXIsXG4gKiB0aGUgdmVyc2lvbiBpcyBjbG9uZWQgdG8gbm90IG1vZGlmeSB0aGUgb3JpZ2luYWwgdmVyc2lvbiBpbnN0YW5jZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNlbXZlckluYyhcbiAgICB2ZXJzaW9uOiBzZW12ZXIuU2VtVmVyLCByZWxlYXNlOiBzZW12ZXIuUmVsZWFzZVR5cGUsIGlkZW50aWZpZXI/OiBzdHJpbmcpIHtcbiAgY29uc3QgY2xvbmUgPSBuZXcgc2VtdmVyLlNlbVZlcih2ZXJzaW9uLnZlcnNpb24pO1xuICByZXR1cm4gY2xvbmUuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpO1xufVxuXG4vKiogQ3JlYXRlcyB0aGUgZXF1aXZhbGVudCBleHBlcmltZW50YWwgdmVyc2lvbiBmb3IgYSBwcm92aWRlZCBTZW1WZXIuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRXhwZXJpbWVudGFsU2VtdmVyKHZlcnNpb246IHN0cmluZ3xzZW12ZXIuU2VtVmVyKTogc2VtdmVyLlNlbVZlciB7XG4gIHZlcnNpb24gPSBuZXcgc2VtdmVyLlNlbVZlcih2ZXJzaW9uKTtcbiAgY29uc3QgZXhwZXJpbWVudGFsVmVyc2lvbiA9IG5ldyBzZW12ZXIuU2VtVmVyKHZlcnNpb24uZm9ybWF0KCkpO1xuICBleHBlcmltZW50YWxWZXJzaW9uLm1ham9yID0gMDtcbiAgZXhwZXJpbWVudGFsVmVyc2lvbi5taW5vciA9IHZlcnNpb24ubWFqb3IgKiAxMDAgKyB2ZXJzaW9uLm1pbm9yO1xuICByZXR1cm4gbmV3IHNlbXZlci5TZW1WZXIoZXhwZXJpbWVudGFsVmVyc2lvbi5mb3JtYXQoKSk7XG59XG4iXX0=