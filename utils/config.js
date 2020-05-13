/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
        define("@angular/dev-infra-private/utils/config", ["require", "exports", "path", "shelljs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var path_1 = require("path");
    var shelljs_1 = require("shelljs");
    // The filename expected for creating the ng-dev config, without the file
    // extension to allow either a typescript or javascript file to be used.
    var CONFIG_FILE_NAME = '.ng-dev-config';
    /**
     * Gets the path of the directory for the repository base.
     */
    function getRepoBaseDir() {
        var baseRepoDir = shelljs_1.exec("git rev-parse --show-toplevel", { silent: true });
        if (baseRepoDir.code) {
            throw Error("Unable to find the path to the base directory of the repository.\n" +
                "Was the command run from inside of the repo?\n\n" +
                ("ERROR:\n " + baseRepoDir.stderr));
        }
        return baseRepoDir.trim();
    }
    exports.getRepoBaseDir = getRepoBaseDir;
    /**
     * Retrieve the configuration from the .ng-dev-config.js file.
     */
    function getAngularDevConfig(supressError) {
        if (supressError === void 0) { supressError = false; }
        var configPath = path_1.join(getRepoBaseDir(), CONFIG_FILE_NAME);
        try {
            return require(configPath);
        }
        catch (err) {
            if (!supressError) {
                throw Error("Unable to load config file at:\n  " + configPath);
            }
        }
        return {};
    }
    exports.getAngularDevConfig = getAngularDevConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixtQ0FBNkI7SUFFN0IseUVBQXlFO0lBQ3pFLHdFQUF3RTtJQUN4RSxJQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0lBRTFDOztPQUVHO0lBQ0gsU0FBZ0IsY0FBYztRQUM1QixJQUFNLFdBQVcsR0FBRyxjQUFJLENBQUMsK0JBQStCLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFJLFdBQVcsQ0FBQyxJQUFJLEVBQUU7WUFDcEIsTUFBTSxLQUFLLENBQ1Asb0VBQW9FO2dCQUNwRSxrREFBa0Q7aUJBQ2xELGNBQVksV0FBVyxDQUFDLE1BQVEsQ0FBQSxDQUFDLENBQUM7U0FDdkM7UUFDRCxPQUFPLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBVEQsd0NBU0M7SUFFRDs7T0FFRztJQUNILFNBQWdCLG1CQUFtQixDQUFPLFlBQW9CO1FBQXBCLDZCQUFBLEVBQUEsb0JBQW9CO1FBQzVELElBQU0sVUFBVSxHQUFHLFdBQUksQ0FBQyxjQUFjLEVBQUUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVELElBQUk7WUFDRixPQUFPLE9BQU8sQ0FBQyxVQUFVLENBQXlCLENBQUM7U0FDcEQ7UUFBQyxPQUFPLEdBQUcsRUFBRTtZQUNaLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2pCLE1BQU0sS0FBSyxDQUFDLHVDQUFxQyxVQUFZLENBQUMsQ0FBQzthQUNoRTtTQUNGO1FBQ0QsT0FBTyxFQUEwQixDQUFDO0lBQ3BDLENBQUM7SUFWRCxrREFVQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtqb2lufSBmcm9tICdwYXRoJztcbmltcG9ydCB7ZXhlY30gZnJvbSAnc2hlbGxqcyc7XG5cbi8vIFRoZSBmaWxlbmFtZSBleHBlY3RlZCBmb3IgY3JlYXRpbmcgdGhlIG5nLWRldiBjb25maWcsIHdpdGhvdXQgdGhlIGZpbGVcbi8vIGV4dGVuc2lvbiB0byBhbGxvdyBlaXRoZXIgYSB0eXBlc2NyaXB0IG9yIGphdmFzY3JpcHQgZmlsZSB0byBiZSB1c2VkLlxuY29uc3QgQ09ORklHX0ZJTEVfTkFNRSA9ICcubmctZGV2LWNvbmZpZyc7XG5cbi8qKlxuICogR2V0cyB0aGUgcGF0aCBvZiB0aGUgZGlyZWN0b3J5IGZvciB0aGUgcmVwb3NpdG9yeSBiYXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmVwb0Jhc2VEaXIoKSB7XG4gIGNvbnN0IGJhc2VSZXBvRGlyID0gZXhlYyhgZ2l0IHJldi1wYXJzZSAtLXNob3ctdG9wbGV2ZWxgLCB7c2lsZW50OiB0cnVlfSk7XG4gIGlmIChiYXNlUmVwb0Rpci5jb2RlKSB7XG4gICAgdGhyb3cgRXJyb3IoXG4gICAgICAgIGBVbmFibGUgdG8gZmluZCB0aGUgcGF0aCB0byB0aGUgYmFzZSBkaXJlY3Rvcnkgb2YgdGhlIHJlcG9zaXRvcnkuXFxuYCArXG4gICAgICAgIGBXYXMgdGhlIGNvbW1hbmQgcnVuIGZyb20gaW5zaWRlIG9mIHRoZSByZXBvP1xcblxcbmAgK1xuICAgICAgICBgRVJST1I6XFxuICR7YmFzZVJlcG9EaXIuc3RkZXJyfWApO1xuICB9XG4gIHJldHVybiBiYXNlUmVwb0Rpci50cmltKCk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGNvbmZpZ3VyYXRpb24gZnJvbSB0aGUgLm5nLWRldi1jb25maWcuanMgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZ3VsYXJEZXZDb25maWc8SywgVD4oc3VwcmVzc0Vycm9yID0gZmFsc2UpOiBEZXZJbmZyYUNvbmZpZzxLLCBUPiB7XG4gIGNvbnN0IGNvbmZpZ1BhdGggPSBqb2luKGdldFJlcG9CYXNlRGlyKCksIENPTkZJR19GSUxFX05BTUUpO1xuICB0cnkge1xuICAgIHJldHVybiByZXF1aXJlKGNvbmZpZ1BhdGgpIGFzIERldkluZnJhQ29uZmlnPEssIFQ+O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIXN1cHJlc3NFcnJvcikge1xuICAgICAgdGhyb3cgRXJyb3IoYFVuYWJsZSB0byBsb2FkIGNvbmZpZyBmaWxlIGF0OlxcbiAgJHtjb25maWdQYXRofWApO1xuICAgIH1cbiAgfVxuICByZXR1cm4ge30gYXMgRGV2SW5mcmFDb25maWc8SywgVD47XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGV4cmVzc2luZyB0aGUgZXhwZWN0ZWQgc3RydWN0dXJlIG9mIHRoZSBEZXZJbmZyYUNvbmZpZy5cbiAqIEFsbG93cyBmb3IgcHJvdmlkaW5nIGEgdHlwaW5nIGZvciBhIHBhcnQgb2YgdGhlIGNvbmZpZyB0byByZWFkLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERldkluZnJhQ29uZmlnPEssIFQ+IHtcbiAgW0s6IHN0cmluZ106IFQ7XG59XG4iXX0=