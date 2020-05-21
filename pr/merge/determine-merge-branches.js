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
        define("@angular/dev-infra-private/pr/merge/determine-merge-branches", ["require", "exports", "semver", "@angular/dev-infra-private/utils/shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var semver = require("semver");
    var shelljs_1 = require("@angular/dev-infra-private/utils/shelljs");
    /**
     * Helper function that can be used to determine merge branches based on a given
     * project version. The function determines merge branches primarily through the
     * specified version, but falls back to consulting the NPM registry when needed.
     *
     * Consulting the NPM registry for determining the patch branch may slow down merging,
     * so whenever possible, the branches are determined statically based on the current
     * version. In some cases, consulting the NPM registry is inevitable because for major
     * pre-releases, we cannot determine the latest stable minor version from the current
     * pre-release version.
     */
    function determineMergeBranches(currentVersion, npmPackageName) {
        var projectVersion = semver.parse(currentVersion);
        if (projectVersion === null) {
            throw Error('Cannot parse version set in project "package.json" file.');
        }
        var major = projectVersion.major, minor = projectVersion.minor, patch = projectVersion.patch, prerelease = projectVersion.prerelease;
        var isMajor = minor === 0 && patch === 0;
        var isMinor = minor !== 0 && patch === 0;
        // If there is no prerelease, then we compute patch and minor branches based
        // on the current version major and minor.
        if (prerelease.length === 0) {
            return { minor: major + ".x", patch: major + "." + minor + ".x" };
        }
        // If current version is set to a minor prerelease, we can compute the merge branches
        // statically. e.g. if we are set to `9.3.0-next.0`, then our merge branches should
        // be set to `9.x` and `9.2.x`.
        if (isMinor) {
            return { minor: major + ".x", patch: major + "." + (minor - 1) + ".x" };
        }
        else if (!isMajor) {
            throw Error('Unexpected version. Cannot have prerelease for patch version.');
        }
        // If we are set to a major prerelease, we cannot statically determine the stable patch
        // branch (as the latest minor segment is unknown). We determine it by looking in the NPM
        // registry for the latest stable release that will tell us about the current minor segment.
        // e.g. if the current major is `v10.0.0-next.0`, then we need to look for the latest release.
        // Let's say this is `v9.2.6`. Our patch branch will then be called `9.2.x`.
        var latestVersion = shelljs_1.exec("yarn -s info " + npmPackageName + " dist-tags.latest").trim();
        if (!latestVersion) {
            throw Error('Could not determine version of latest release.');
        }
        var expectedMajor = major - 1;
        var parsedLatestVersion = semver.parse(latestVersion);
        if (parsedLatestVersion === null) {
            throw Error("Could not parse latest version from NPM registry: " + latestVersion);
        }
        else if (parsedLatestVersion.major !== expectedMajor) {
            throw Error("Expected latest release to have major version: v" + expectedMajor + ", " +
                ("but got: v" + latestVersion));
        }
        return { patch: expectedMajor + "." + parsedLatestVersion.minor + ".x", minor: expectedMajor + ".x" };
    }
    exports.determineMergeBranches = determineMergeBranches;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0ZXJtaW5lLW1lcmdlLWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2RldGVybWluZS1tZXJnZS1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILCtCQUFpQztJQUNqQyxvRUFBeUM7SUFFekM7Ozs7Ozs7Ozs7T0FVRztJQUNILFNBQWdCLHNCQUFzQixDQUNsQyxjQUFzQixFQUFFLGNBQXNCO1FBQ2hELElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDcEQsSUFBSSxjQUFjLEtBQUssSUFBSSxFQUFFO1lBQzNCLE1BQU0sS0FBSyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7U0FDekU7UUFDTSxJQUFBLDRCQUFLLEVBQUUsNEJBQUssRUFBRSw0QkFBSyxFQUFFLHNDQUFVLENBQW1CO1FBQ3pELElBQU0sT0FBTyxHQUFHLEtBQUssS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQztRQUMzQyxJQUFNLE9BQU8sR0FBRyxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUM7UUFFM0MsNEVBQTRFO1FBQzVFLDBDQUEwQztRQUMxQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE9BQU8sRUFBQyxLQUFLLEVBQUssS0FBSyxPQUFJLEVBQUUsS0FBSyxFQUFLLEtBQUssU0FBSSxLQUFLLE9BQUksRUFBQyxDQUFDO1NBQzVEO1FBRUQscUZBQXFGO1FBQ3JGLG1GQUFtRjtRQUNuRiwrQkFBK0I7UUFDL0IsSUFBSSxPQUFPLEVBQUU7WUFDWCxPQUFPLEVBQUMsS0FBSyxFQUFLLEtBQUssT0FBSSxFQUFFLEtBQUssRUFBSyxLQUFLLFVBQUksS0FBSyxHQUFHLENBQUMsUUFBSSxFQUFDLENBQUM7U0FDaEU7YUFBTSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ25CLE1BQU0sS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUM7U0FDOUU7UUFFRCx1RkFBdUY7UUFDdkYseUZBQXlGO1FBQ3pGLDRGQUE0RjtRQUM1Riw4RkFBOEY7UUFDOUYsNEVBQTRFO1FBQzVFLElBQU0sYUFBYSxHQUFHLGNBQUksQ0FBQyxrQkFBZ0IsY0FBYyxzQkFBbUIsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ3JGLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDbEIsTUFBTSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztTQUMvRDtRQUNELElBQU0sYUFBYSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDaEMsSUFBTSxtQkFBbUIsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3hELElBQUksbUJBQW1CLEtBQUssSUFBSSxFQUFFO1lBQ2hDLE1BQU0sS0FBSyxDQUFDLHVEQUFxRCxhQUFlLENBQUMsQ0FBQztTQUNuRjthQUFNLElBQUksbUJBQW1CLENBQUMsS0FBSyxLQUFLLGFBQWEsRUFBRTtZQUN0RCxNQUFNLEtBQUssQ0FDUCxxREFBbUQsYUFBYSxPQUFJO2lCQUNwRSxlQUFhLGFBQWUsQ0FBQSxDQUFDLENBQUM7U0FDbkM7UUFFRCxPQUFPLEVBQUMsS0FBSyxFQUFLLGFBQWEsU0FBSSxtQkFBbUIsQ0FBQyxLQUFLLE9BQUksRUFBRSxLQUFLLEVBQUssYUFBYSxPQUFJLEVBQUMsQ0FBQztJQUNqRyxDQUFDO0lBN0NELHdEQTZDQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnLi4vLi4vdXRpbHMvc2hlbGxqcyc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGV0ZXJtaW5lIG1lcmdlIGJyYW5jaGVzIGJhc2VkIG9uIGEgZ2l2ZW5cbiAqIHByb2plY3QgdmVyc2lvbi4gVGhlIGZ1bmN0aW9uIGRldGVybWluZXMgbWVyZ2UgYnJhbmNoZXMgcHJpbWFyaWx5IHRocm91Z2ggdGhlXG4gKiBzcGVjaWZpZWQgdmVyc2lvbiwgYnV0IGZhbGxzIGJhY2sgdG8gY29uc3VsdGluZyB0aGUgTlBNIHJlZ2lzdHJ5IHdoZW4gbmVlZGVkLlxuICpcbiAqIENvbnN1bHRpbmcgdGhlIE5QTSByZWdpc3RyeSBmb3IgZGV0ZXJtaW5pbmcgdGhlIHBhdGNoIGJyYW5jaCBtYXkgc2xvdyBkb3duIG1lcmdpbmcsXG4gKiBzbyB3aGVuZXZlciBwb3NzaWJsZSwgdGhlIGJyYW5jaGVzIGFyZSBkZXRlcm1pbmVkIHN0YXRpY2FsbHkgYmFzZWQgb24gdGhlIGN1cnJlbnRcbiAqIHZlcnNpb24uIEluIHNvbWUgY2FzZXMsIGNvbnN1bHRpbmcgdGhlIE5QTSByZWdpc3RyeSBpcyBpbmV2aXRhYmxlIGJlY2F1c2UgZm9yIG1ham9yXG4gKiBwcmUtcmVsZWFzZXMsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGxhdGVzdCBzdGFibGUgbWlub3IgdmVyc2lvbiBmcm9tIHRoZSBjdXJyZW50XG4gKiBwcmUtcmVsZWFzZSB2ZXJzaW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGV0ZXJtaW5lTWVyZ2VCcmFuY2hlcyhcbiAgICBjdXJyZW50VmVyc2lvbjogc3RyaW5nLCBucG1QYWNrYWdlTmFtZTogc3RyaW5nKToge21pbm9yOiBzdHJpbmcsIHBhdGNoOiBzdHJpbmd9IHtcbiAgY29uc3QgcHJvamVjdFZlcnNpb24gPSBzZW12ZXIucGFyc2UoY3VycmVudFZlcnNpb24pO1xuICBpZiAocHJvamVjdFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcignQ2Fubm90IHBhcnNlIHZlcnNpb24gc2V0IGluIHByb2plY3QgXCJwYWNrYWdlLmpzb25cIiBmaWxlLicpO1xuICB9XG4gIGNvbnN0IHttYWpvciwgbWlub3IsIHBhdGNoLCBwcmVyZWxlYXNlfSA9IHByb2plY3RWZXJzaW9uO1xuICBjb25zdCBpc01ham9yID0gbWlub3IgPT09IDAgJiYgcGF0Y2ggPT09IDA7XG4gIGNvbnN0IGlzTWlub3IgPSBtaW5vciAhPT0gMCAmJiBwYXRjaCA9PT0gMDtcblxuICAvLyBJZiB0aGVyZSBpcyBubyBwcmVyZWxlYXNlLCB0aGVuIHdlIGNvbXB1dGUgcGF0Y2ggYW5kIG1pbm9yIGJyYW5jaGVzIGJhc2VkXG4gIC8vIG9uIHRoZSBjdXJyZW50IHZlcnNpb24gbWFqb3IgYW5kIG1pbm9yLlxuICBpZiAocHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge21pbm9yOiBgJHttYWpvcn0ueGAsIHBhdGNoOiBgJHttYWpvcn0uJHttaW5vcn0ueGB9O1xuICB9XG5cbiAgLy8gSWYgY3VycmVudCB2ZXJzaW9uIGlzIHNldCB0byBhIG1pbm9yIHByZXJlbGVhc2UsIHdlIGNhbiBjb21wdXRlIHRoZSBtZXJnZSBicmFuY2hlc1xuICAvLyBzdGF0aWNhbGx5LiBlLmcuIGlmIHdlIGFyZSBzZXQgdG8gYDkuMy4wLW5leHQuMGAsIHRoZW4gb3VyIG1lcmdlIGJyYW5jaGVzIHNob3VsZFxuICAvLyBiZSBzZXQgdG8gYDkueGAgYW5kIGA5LjIueGAuXG4gIGlmIChpc01pbm9yKSB7XG4gICAgcmV0dXJuIHttaW5vcjogYCR7bWFqb3J9LnhgLCBwYXRjaDogYCR7bWFqb3J9LiR7bWlub3IgLSAxfS54YH07XG4gIH0gZWxzZSBpZiAoIWlzTWFqb3IpIHtcbiAgICB0aHJvdyBFcnJvcignVW5leHBlY3RlZCB2ZXJzaW9uLiBDYW5ub3QgaGF2ZSBwcmVyZWxlYXNlIGZvciBwYXRjaCB2ZXJzaW9uLicpO1xuICB9XG5cbiAgLy8gSWYgd2UgYXJlIHNldCB0byBhIG1ham9yIHByZXJlbGVhc2UsIHdlIGNhbm5vdCBzdGF0aWNhbGx5IGRldGVybWluZSB0aGUgc3RhYmxlIHBhdGNoXG4gIC8vIGJyYW5jaCAoYXMgdGhlIGxhdGVzdCBtaW5vciBzZWdtZW50IGlzIHVua25vd24pLiBXZSBkZXRlcm1pbmUgaXQgYnkgbG9va2luZyBpbiB0aGUgTlBNXG4gIC8vIHJlZ2lzdHJ5IGZvciB0aGUgbGF0ZXN0IHN0YWJsZSByZWxlYXNlIHRoYXQgd2lsbCB0ZWxsIHVzIGFib3V0IHRoZSBjdXJyZW50IG1pbm9yIHNlZ21lbnQuXG4gIC8vIGUuZy4gaWYgdGhlIGN1cnJlbnQgbWFqb3IgaXMgYHYxMC4wLjAtbmV4dC4wYCwgdGhlbiB3ZSBuZWVkIHRvIGxvb2sgZm9yIHRoZSBsYXRlc3QgcmVsZWFzZS5cbiAgLy8gTGV0J3Mgc2F5IHRoaXMgaXMgYHY5LjIuNmAuIE91ciBwYXRjaCBicmFuY2ggd2lsbCB0aGVuIGJlIGNhbGxlZCBgOS4yLnhgLlxuICBjb25zdCBsYXRlc3RWZXJzaW9uID0gZXhlYyhgeWFybiAtcyBpbmZvICR7bnBtUGFja2FnZU5hbWV9IGRpc3QtdGFncy5sYXRlc3RgKS50cmltKCk7XG4gIGlmICghbGF0ZXN0VmVyc2lvbikge1xuICAgIHRocm93IEVycm9yKCdDb3VsZCBub3QgZGV0ZXJtaW5lIHZlcnNpb24gb2YgbGF0ZXN0IHJlbGVhc2UuJyk7XG4gIH1cbiAgY29uc3QgZXhwZWN0ZWRNYWpvciA9IG1ham9yIC0gMTtcbiAgY29uc3QgcGFyc2VkTGF0ZXN0VmVyc2lvbiA9IHNlbXZlci5wYXJzZShsYXRlc3RWZXJzaW9uKTtcbiAgaWYgKHBhcnNlZExhdGVzdFZlcnNpb24gPT09IG51bGwpIHtcbiAgICB0aHJvdyBFcnJvcihgQ291bGQgbm90IHBhcnNlIGxhdGVzdCB2ZXJzaW9uIGZyb20gTlBNIHJlZ2lzdHJ5OiAke2xhdGVzdFZlcnNpb259YCk7XG4gIH0gZWxzZSBpZiAocGFyc2VkTGF0ZXN0VmVyc2lvbi5tYWpvciAhPT0gZXhwZWN0ZWRNYWpvcikge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgRXhwZWN0ZWQgbGF0ZXN0IHJlbGVhc2UgdG8gaGF2ZSBtYWpvciB2ZXJzaW9uOiB2JHtleHBlY3RlZE1ham9yfSwgYCArXG4gICAgICAgIGBidXQgZ290OiB2JHtsYXRlc3RWZXJzaW9ufWApO1xuICB9XG5cbiAgcmV0dXJuIHtwYXRjaDogYCR7ZXhwZWN0ZWRNYWpvcn0uJHtwYXJzZWRMYXRlc3RWZXJzaW9uLm1pbm9yfS54YCwgbWlub3I6IGAke2V4cGVjdGVkTWFqb3J9LnhgfTtcbn1cbiJdfQ==