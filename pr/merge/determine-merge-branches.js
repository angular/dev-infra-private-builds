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
    exports.determineMergeBranches = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGV0ZXJtaW5lLW1lcmdlLWJyYW5jaGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL2RldGVybWluZS1tZXJnZS1icmFuY2hlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFFSCwrQkFBaUM7SUFDakMsb0VBQXlDO0lBRXpDOzs7Ozs7Ozs7O09BVUc7SUFDSCxTQUFnQixzQkFBc0IsQ0FDbEMsY0FBc0IsRUFBRSxjQUFzQjtRQUNoRCxJQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3BELElBQUksY0FBYyxLQUFLLElBQUksRUFBRTtZQUMzQixNQUFNLEtBQUssQ0FBQywwREFBMEQsQ0FBQyxDQUFDO1NBQ3pFO1FBQ00sSUFBQSxLQUFLLEdBQThCLGNBQWMsTUFBNUMsRUFBRSxLQUFLLEdBQXVCLGNBQWMsTUFBckMsRUFBRSxLQUFLLEdBQWdCLGNBQWMsTUFBOUIsRUFBRSxVQUFVLEdBQUksY0FBYyxXQUFsQixDQUFtQjtRQUN6RCxJQUFNLE9BQU8sR0FBRyxLQUFLLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUM7UUFDM0MsSUFBTSxPQUFPLEdBQUcsS0FBSyxLQUFLLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDO1FBRTNDLDRFQUE0RTtRQUM1RSwwQ0FBMEM7UUFDMUMsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUMzQixPQUFPLEVBQUMsS0FBSyxFQUFLLEtBQUssT0FBSSxFQUFFLEtBQUssRUFBSyxLQUFLLFNBQUksS0FBSyxPQUFJLEVBQUMsQ0FBQztTQUM1RDtRQUVELHFGQUFxRjtRQUNyRixtRkFBbUY7UUFDbkYsK0JBQStCO1FBQy9CLElBQUksT0FBTyxFQUFFO1lBQ1gsT0FBTyxFQUFDLEtBQUssRUFBSyxLQUFLLE9BQUksRUFBRSxLQUFLLEVBQUssS0FBSyxVQUFJLEtBQUssR0FBRyxDQUFDLFFBQUksRUFBQyxDQUFDO1NBQ2hFO2FBQU0sSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNuQixNQUFNLEtBQUssQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1NBQzlFO1FBRUQsdUZBQXVGO1FBQ3ZGLHlGQUF5RjtRQUN6Riw0RkFBNEY7UUFDNUYsOEZBQThGO1FBQzlGLDRFQUE0RTtRQUM1RSxJQUFNLGFBQWEsR0FBRyxjQUFJLENBQUMsa0JBQWdCLGNBQWMsc0JBQW1CLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNyRixJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ2xCLE1BQU0sS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7U0FDL0Q7UUFDRCxJQUFNLGFBQWEsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQU0sbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN4RCxJQUFJLG1CQUFtQixLQUFLLElBQUksRUFBRTtZQUNoQyxNQUFNLEtBQUssQ0FBQyx1REFBcUQsYUFBZSxDQUFDLENBQUM7U0FDbkY7YUFBTSxJQUFJLG1CQUFtQixDQUFDLEtBQUssS0FBSyxhQUFhLEVBQUU7WUFDdEQsTUFBTSxLQUFLLENBQ1AscURBQW1ELGFBQWEsT0FBSTtpQkFDcEUsZUFBYSxhQUFlLENBQUEsQ0FBQyxDQUFDO1NBQ25DO1FBRUQsT0FBTyxFQUFDLEtBQUssRUFBSyxhQUFhLFNBQUksbUJBQW1CLENBQUMsS0FBSyxPQUFJLEVBQUUsS0FBSyxFQUFLLGFBQWEsT0FBSSxFQUFDLENBQUM7SUFDakcsQ0FBQztJQTdDRCx3REE2Q0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0ICogYXMgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge2V4ZWN9IGZyb20gJy4uLy4uL3V0aWxzL3NoZWxsanMnO1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVybWluZSBtZXJnZSBicmFuY2hlcyBiYXNlZCBvbiBhIGdpdmVuXG4gKiBwcm9qZWN0IHZlcnNpb24uIFRoZSBmdW5jdGlvbiBkZXRlcm1pbmVzIG1lcmdlIGJyYW5jaGVzIHByaW1hcmlseSB0aHJvdWdoIHRoZVxuICogc3BlY2lmaWVkIHZlcnNpb24sIGJ1dCBmYWxscyBiYWNrIHRvIGNvbnN1bHRpbmcgdGhlIE5QTSByZWdpc3RyeSB3aGVuIG5lZWRlZC5cbiAqXG4gKiBDb25zdWx0aW5nIHRoZSBOUE0gcmVnaXN0cnkgZm9yIGRldGVybWluaW5nIHRoZSBwYXRjaCBicmFuY2ggbWF5IHNsb3cgZG93biBtZXJnaW5nLFxuICogc28gd2hlbmV2ZXIgcG9zc2libGUsIHRoZSBicmFuY2hlcyBhcmUgZGV0ZXJtaW5lZCBzdGF0aWNhbGx5IGJhc2VkIG9uIHRoZSBjdXJyZW50XG4gKiB2ZXJzaW9uLiBJbiBzb21lIGNhc2VzLCBjb25zdWx0aW5nIHRoZSBOUE0gcmVnaXN0cnkgaXMgaW5ldml0YWJsZSBiZWNhdXNlIGZvciBtYWpvclxuICogcHJlLXJlbGVhc2VzLCB3ZSBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBsYXRlc3Qgc3RhYmxlIG1pbm9yIHZlcnNpb24gZnJvbSB0aGUgY3VycmVudFxuICogcHJlLXJlbGVhc2UgdmVyc2lvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZU1lcmdlQnJhbmNoZXMoXG4gICAgY3VycmVudFZlcnNpb246IHN0cmluZywgbnBtUGFja2FnZU5hbWU6IHN0cmluZyk6IHttaW5vcjogc3RyaW5nLCBwYXRjaDogc3RyaW5nfSB7XG4gIGNvbnN0IHByb2plY3RWZXJzaW9uID0gc2VtdmVyLnBhcnNlKGN1cnJlbnRWZXJzaW9uKTtcbiAgaWYgKHByb2plY3RWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoJ0Nhbm5vdCBwYXJzZSB2ZXJzaW9uIHNldCBpbiBwcm9qZWN0IFwicGFja2FnZS5qc29uXCIgZmlsZS4nKTtcbiAgfVxuICBjb25zdCB7bWFqb3IsIG1pbm9yLCBwYXRjaCwgcHJlcmVsZWFzZX0gPSBwcm9qZWN0VmVyc2lvbjtcbiAgY29uc3QgaXNNYWpvciA9IG1pbm9yID09PSAwICYmIHBhdGNoID09PSAwO1xuICBjb25zdCBpc01pbm9yID0gbWlub3IgIT09IDAgJiYgcGF0Y2ggPT09IDA7XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gcHJlcmVsZWFzZSwgdGhlbiB3ZSBjb21wdXRlIHBhdGNoIGFuZCBtaW5vciBicmFuY2hlcyBiYXNlZFxuICAvLyBvbiB0aGUgY3VycmVudCB2ZXJzaW9uIG1ham9yIGFuZCBtaW5vci5cbiAgaWYgKHByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIHttaW5vcjogYCR7bWFqb3J9LnhgLCBwYXRjaDogYCR7bWFqb3J9LiR7bWlub3J9LnhgfTtcbiAgfVxuXG4gIC8vIElmIGN1cnJlbnQgdmVyc2lvbiBpcyBzZXQgdG8gYSBtaW5vciBwcmVyZWxlYXNlLCB3ZSBjYW4gY29tcHV0ZSB0aGUgbWVyZ2UgYnJhbmNoZXNcbiAgLy8gc3RhdGljYWxseS4gZS5nLiBpZiB3ZSBhcmUgc2V0IHRvIGA5LjMuMC1uZXh0LjBgLCB0aGVuIG91ciBtZXJnZSBicmFuY2hlcyBzaG91bGRcbiAgLy8gYmUgc2V0IHRvIGA5LnhgIGFuZCBgOS4yLnhgLlxuICBpZiAoaXNNaW5vcikge1xuICAgIHJldHVybiB7bWlub3I6IGAke21ham9yfS54YCwgcGF0Y2g6IGAke21ham9yfS4ke21pbm9yIC0gMX0ueGB9O1xuICB9IGVsc2UgaWYgKCFpc01ham9yKSB7XG4gICAgdGhyb3cgRXJyb3IoJ1VuZXhwZWN0ZWQgdmVyc2lvbi4gQ2Fubm90IGhhdmUgcHJlcmVsZWFzZSBmb3IgcGF0Y2ggdmVyc2lvbi4nKTtcbiAgfVxuXG4gIC8vIElmIHdlIGFyZSBzZXQgdG8gYSBtYWpvciBwcmVyZWxlYXNlLCB3ZSBjYW5ub3Qgc3RhdGljYWxseSBkZXRlcm1pbmUgdGhlIHN0YWJsZSBwYXRjaFxuICAvLyBicmFuY2ggKGFzIHRoZSBsYXRlc3QgbWlub3Igc2VnbWVudCBpcyB1bmtub3duKS4gV2UgZGV0ZXJtaW5lIGl0IGJ5IGxvb2tpbmcgaW4gdGhlIE5QTVxuICAvLyByZWdpc3RyeSBmb3IgdGhlIGxhdGVzdCBzdGFibGUgcmVsZWFzZSB0aGF0IHdpbGwgdGVsbCB1cyBhYm91dCB0aGUgY3VycmVudCBtaW5vciBzZWdtZW50LlxuICAvLyBlLmcuIGlmIHRoZSBjdXJyZW50IG1ham9yIGlzIGB2MTAuMC4wLW5leHQuMGAsIHRoZW4gd2UgbmVlZCB0byBsb29rIGZvciB0aGUgbGF0ZXN0IHJlbGVhc2UuXG4gIC8vIExldCdzIHNheSB0aGlzIGlzIGB2OS4yLjZgLiBPdXIgcGF0Y2ggYnJhbmNoIHdpbGwgdGhlbiBiZSBjYWxsZWQgYDkuMi54YC5cbiAgY29uc3QgbGF0ZXN0VmVyc2lvbiA9IGV4ZWMoYHlhcm4gLXMgaW5mbyAke25wbVBhY2thZ2VOYW1lfSBkaXN0LXRhZ3MubGF0ZXN0YCkudHJpbSgpO1xuICBpZiAoIWxhdGVzdFZlcnNpb24pIHtcbiAgICB0aHJvdyBFcnJvcignQ291bGQgbm90IGRldGVybWluZSB2ZXJzaW9uIG9mIGxhdGVzdCByZWxlYXNlLicpO1xuICB9XG4gIGNvbnN0IGV4cGVjdGVkTWFqb3IgPSBtYWpvciAtIDE7XG4gIGNvbnN0IHBhcnNlZExhdGVzdFZlcnNpb24gPSBzZW12ZXIucGFyc2UobGF0ZXN0VmVyc2lvbik7XG4gIGlmIChwYXJzZWRMYXRlc3RWZXJzaW9uID09PSBudWxsKSB7XG4gICAgdGhyb3cgRXJyb3IoYENvdWxkIG5vdCBwYXJzZSBsYXRlc3QgdmVyc2lvbiBmcm9tIE5QTSByZWdpc3RyeTogJHtsYXRlc3RWZXJzaW9ufWApO1xuICB9IGVsc2UgaWYgKHBhcnNlZExhdGVzdFZlcnNpb24ubWFqb3IgIT09IGV4cGVjdGVkTWFqb3IpIHtcbiAgICB0aHJvdyBFcnJvcihcbiAgICAgICAgYEV4cGVjdGVkIGxhdGVzdCByZWxlYXNlIHRvIGhhdmUgbWFqb3IgdmVyc2lvbjogdiR7ZXhwZWN0ZWRNYWpvcn0sIGAgK1xuICAgICAgICBgYnV0IGdvdDogdiR7bGF0ZXN0VmVyc2lvbn1gKTtcbiAgfVxuXG4gIHJldHVybiB7cGF0Y2g6IGAke2V4cGVjdGVkTWFqb3J9LiR7cGFyc2VkTGF0ZXN0VmVyc2lvbi5taW5vcn0ueGAsIG1pbm9yOiBgJHtleHBlY3RlZE1ham9yfS54YH07XG59XG4iXX0=