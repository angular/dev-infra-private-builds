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
    // The filename expected for creating the ng-dev config.
    var CONFIG_FILE_NAME = '.ng-dev-config.js';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3V0aWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDZCQUEwQjtJQUMxQixtQ0FBNkI7SUFFN0Isd0RBQXdEO0lBQ3hELElBQU0sZ0JBQWdCLEdBQUcsbUJBQW1CLENBQUM7SUFFN0M7O09BRUc7SUFDSCxTQUFnQixjQUFjO1FBQzVCLElBQU0sV0FBVyxHQUFHLGNBQUksQ0FBQywrQkFBK0IsRUFBRSxFQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksV0FBVyxDQUFDLElBQUksRUFBRTtZQUNwQixNQUFNLEtBQUssQ0FDUCxvRUFBb0U7Z0JBQ3BFLGtEQUFrRDtpQkFDbEQsY0FBWSxXQUFXLENBQUMsTUFBUSxDQUFBLENBQUMsQ0FBQztTQUN2QztRQUNELE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFURCx3Q0FTQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsbUJBQW1CLENBQU8sWUFBb0I7UUFBcEIsNkJBQUEsRUFBQSxvQkFBb0I7UUFDNUQsSUFBTSxVQUFVLEdBQUcsV0FBSSxDQUFDLGNBQWMsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDNUQsSUFBSTtZQUNGLE9BQU8sT0FBTyxDQUFDLFVBQVUsQ0FBeUIsQ0FBQztTQUNwRDtRQUFDLE9BQU8sR0FBRyxFQUFFO1lBQ1osSUFBSSxDQUFDLFlBQVksRUFBRTtnQkFDakIsTUFBTSxLQUFLLENBQUMsdUNBQXFDLFVBQVksQ0FBQyxDQUFDO2FBQ2hFO1NBQ0Y7UUFDRCxPQUFPLEVBQTBCLENBQUM7SUFDcEMsQ0FBQztJQVZELGtEQVVDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGVjfSBmcm9tICdzaGVsbGpzJztcblxuLy8gVGhlIGZpbGVuYW1lIGV4cGVjdGVkIGZvciBjcmVhdGluZyB0aGUgbmctZGV2IGNvbmZpZy5cbmNvbnN0IENPTkZJR19GSUxFX05BTUUgPSAnLm5nLWRldi1jb25maWcuanMnO1xuXG4vKipcbiAqIEdldHMgdGhlIHBhdGggb2YgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIHJlcG9zaXRvcnkgYmFzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFJlcG9CYXNlRGlyKCkge1xuICBjb25zdCBiYXNlUmVwb0RpciA9IGV4ZWMoYGdpdCByZXYtcGFyc2UgLS1zaG93LXRvcGxldmVsYCwge3NpbGVudDogdHJ1ZX0pO1xuICBpZiAoYmFzZVJlcG9EaXIuY29kZSkge1xuICAgIHRocm93IEVycm9yKFxuICAgICAgICBgVW5hYmxlIHRvIGZpbmQgdGhlIHBhdGggdG8gdGhlIGJhc2UgZGlyZWN0b3J5IG9mIHRoZSByZXBvc2l0b3J5LlxcbmAgK1xuICAgICAgICBgV2FzIHRoZSBjb21tYW5kIHJ1biBmcm9tIGluc2lkZSBvZiB0aGUgcmVwbz9cXG5cXG5gICtcbiAgICAgICAgYEVSUk9SOlxcbiAke2Jhc2VSZXBvRGlyLnN0ZGVycn1gKTtcbiAgfVxuICByZXR1cm4gYmFzZVJlcG9EaXIudHJpbSgpO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb25maWd1cmF0aW9uIGZyb20gdGhlIC5uZy1kZXYtY29uZmlnLmpzIGZpbGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBbmd1bGFyRGV2Q29uZmlnPEssIFQ+KHN1cHJlc3NFcnJvciA9IGZhbHNlKTogRGV2SW5mcmFDb25maWc8SywgVD4ge1xuICBjb25zdCBjb25maWdQYXRoID0gam9pbihnZXRSZXBvQmFzZURpcigpLCBDT05GSUdfRklMRV9OQU1FKTtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcmVxdWlyZShjb25maWdQYXRoKSBhcyBEZXZJbmZyYUNvbmZpZzxLLCBUPjtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFzdXByZXNzRXJyb3IpIHtcbiAgICAgIHRocm93IEVycm9yKGBVbmFibGUgdG8gbG9hZCBjb25maWcgZmlsZSBhdDpcXG4gICR7Y29uZmlnUGF0aH1gKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHt9IGFzIERldkluZnJhQ29uZmlnPEssIFQ+O1xufVxuXG4vKipcbiAqIEludGVyZmFjZSBleHJlc3NpbmcgdGhlIGV4cGVjdGVkIHN0cnVjdHVyZSBvZiB0aGUgRGV2SW5mcmFDb25maWcuXG4gKiBBbGxvd3MgZm9yIHByb3ZpZGluZyBhIHR5cGluZyBmb3IgYSBwYXJ0IG9mIHRoZSBjb25maWcgdG8gcmVhZC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEZXZJbmZyYUNvbmZpZzxLLCBUPiB7XG4gIFtLOiBzdHJpbmddOiBUO1xufVxuIl19