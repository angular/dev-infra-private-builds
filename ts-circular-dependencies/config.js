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
        define("@angular/dev-infra-private/ts-circular-dependencies/config", ["require", "exports", "path", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadTestConfig = void 0;
    var path_1 = require("path");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /**
     * Loads the configuration for the circular dependencies test. If the config cannot be
     * loaded, an error will be printed and the process exists with a non-zero exit code.
     */
    function loadTestConfig(configPath) {
        var configBaseDir = path_1.dirname(configPath);
        var resolveRelativePath = function (relativePath) { return path_1.resolve(configBaseDir, relativePath); };
        try {
            var config_1 = require(configPath);
            if (!path_1.isAbsolute(config_1.baseDir)) {
                config_1.baseDir = resolveRelativePath(config_1.baseDir);
            }
            if (!path_1.isAbsolute(config_1.goldenFile)) {
                config_1.goldenFile = resolveRelativePath(config_1.goldenFile);
            }
            if (!path_1.isAbsolute(config_1.glob)) {
                config_1.glob = resolveRelativePath(config_1.glob);
            }
            return config_1;
        }
        catch (e) {
            console_1.error('Could not load test configuration file at: ' + configPath);
            console_1.error("Failed with: " + e.message);
            process.exit(1);
        }
    }
    exports.loadTestConfig = loadTestConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQWtEO0lBRWxELG9FQUF1QztJQXlCdkM7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLFVBQWtCO1FBQy9DLElBQU0sYUFBYSxHQUFHLGNBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxJQUFNLG1CQUFtQixHQUFHLFVBQUMsWUFBb0IsSUFBSyxPQUFBLGNBQU8sQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLEVBQXBDLENBQW9DLENBQUM7UUFFM0YsSUFBSTtZQUNGLElBQU0sUUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQW1DLENBQUM7WUFDckUsSUFBSSxDQUFDLGlCQUFVLENBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMvQixRQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDLFFBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0RDtZQUNELElBQUksQ0FBQyxpQkFBVSxDQUFDLFFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbEMsUUFBTSxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxRQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxJQUFJLENBQUMsaUJBQVUsQ0FBQyxRQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLFFBQU0sQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsUUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsT0FBTyxRQUFNLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsZUFBSyxDQUFDLDZDQUE2QyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2xFLGVBQUssQ0FBQyxrQkFBZ0IsQ0FBQyxDQUFDLE9BQVMsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBckJELHdDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Rpcm5hbWUsIGlzQWJzb2x1dGUsIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtNb2R1bGVSZXNvbHZlcn0gZnJvbSAnLi9hbmFseXplcic7XG5cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIGEgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZyB7XG4gIC8qKiBCYXNlIGRpcmVjdG9yeSB1c2VkIGZvciBzaG9ydGVuaW5nIHBhdGhzIGluIHRoZSBnb2xkZW4gZmlsZS4gKi9cbiAgYmFzZURpcjogc3RyaW5nO1xuICAvKiogUGF0aCB0byB0aGUgZ29sZGVuIGZpbGUgdGhhdCBpcyB1c2VkIGZvciBjaGVja2luZyBhbmQgYXBwcm92aW5nLiAqL1xuICBnb2xkZW5GaWxlOiBzdHJpbmc7XG4gIC8qKiBHbG9iIHRoYXQgcmVzb2x2ZXMgc291cmNlIGZpbGVzIHdoaWNoIHNob3VsZCBiZSBjaGVja2VkLiAqL1xuICBnbG9iOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBPcHRpb25hbCBtb2R1bGUgcmVzb2x2ZXIgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZXNvbHZlIG1vZHVsZXNcbiAgICogdG8gYWJzb2x1dGUgZmlsZSBwYXRocy5cbiAgICovXG4gIHJlc29sdmVNb2R1bGU/OiBNb2R1bGVSZXNvbHZlcjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsIGNvbW1hbmQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpZiB0aGUgZ29sZGVuIGNoZWNrIGZhaWxlZC4gVGhpcyBjYW4gYmUgdXNlZFxuICAgKiB0byBjb25zaXN0ZW50bHkgdXNlIHNjcmlwdCBhbGlhc2VzIGZvciBjaGVja2luZy9hcHByb3ZpbmcgdGhlIGdvbGRlbi5cbiAgICovXG4gIGFwcHJvdmVDb21tYW5kPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIExvYWRzIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuIElmIHRoZSBjb25maWcgY2Fubm90IGJlXG4gKiBsb2FkZWQsIGFuIGVycm9yIHdpbGwgYmUgcHJpbnRlZCBhbmQgdGhlIHByb2Nlc3MgZXhpc3RzIHdpdGggYSBub24temVybyBleGl0IGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoOiBzdHJpbmcpOiBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcge1xuICBjb25zdCBjb25maWdCYXNlRGlyID0gZGlybmFtZShjb25maWdQYXRoKTtcbiAgY29uc3QgcmVzb2x2ZVJlbGF0aXZlUGF0aCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShjb25maWdCYXNlRGlyLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gcmVxdWlyZShjb25maWdQYXRoKSBhcyBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWc7XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5iYXNlRGlyKSkge1xuICAgICAgY29uZmlnLmJhc2VEaXIgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5iYXNlRGlyKTtcbiAgICB9XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5nb2xkZW5GaWxlKSkge1xuICAgICAgY29uZmlnLmdvbGRlbkZpbGUgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5nb2xkZW5GaWxlKTtcbiAgICB9XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5nbG9iKSkge1xuICAgICAgY29uZmlnLmdsb2IgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5nbG9iKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSBjYXRjaCAoZSkge1xuICAgIGVycm9yKCdDb3VsZCBub3QgbG9hZCB0ZXN0IGNvbmZpZ3VyYXRpb24gZmlsZSBhdDogJyArIGNvbmZpZ1BhdGgpO1xuICAgIGVycm9yKGBGYWlsZWQgd2l0aDogJHtlLm1lc3NhZ2V9YCk7XG4gICAgcHJvY2Vzcy5leGl0KDEpO1xuICB9XG59XG4iXX0=