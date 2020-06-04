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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQWtEO0lBRWxELG9FQUF1QztJQXlCdkM7OztPQUdHO0lBQ0gsU0FBZ0IsY0FBYyxDQUFDLFVBQWtCO1FBQy9DLElBQU0sYUFBYSxHQUFHLGNBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMxQyxJQUFNLG1CQUFtQixHQUFHLFVBQUMsWUFBb0IsSUFBSyxPQUFBLGNBQU8sQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLEVBQXBDLENBQW9DLENBQUM7UUFFM0YsSUFBSTtZQUNGLElBQU0sUUFBTSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQW1DLENBQUM7WUFDckUsSUFBSSxDQUFDLGlCQUFVLENBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUMvQixRQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDLFFBQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUN0RDtZQUNELElBQUksQ0FBQyxpQkFBVSxDQUFDLFFBQU0sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDbEMsUUFBTSxDQUFDLFVBQVUsR0FBRyxtQkFBbUIsQ0FBQyxRQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDNUQ7WUFDRCxJQUFJLENBQUMsaUJBQVUsQ0FBQyxRQUFNLENBQUMsSUFBSSxDQUFDLEVBQUU7Z0JBQzVCLFFBQU0sQ0FBQyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsUUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ2hEO1lBQ0QsT0FBTyxRQUFNLENBQUM7U0FDZjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1YsZUFBSyxDQUFDLDZDQUE2QyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQ2xFLGVBQUssQ0FBQyxrQkFBZ0IsQ0FBQyxDQUFDLE9BQVMsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7SUFDSCxDQUFDO0lBckJELHdDQXFCQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Rpcm5hbWUsIGlzQWJzb2x1dGUsIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtNb2R1bGVSZXNvbHZlcn0gZnJvbSAnLi9hbmFseXplcic7XG5cblxuLyoqIENvbmZpZ3VyYXRpb24gZm9yIGEgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuICovXG5leHBvcnQgaW50ZXJmYWNlIENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZyB7XG4gIC8qKiBCYXNlIGRpcmVjdG9yeSB1c2VkIGZvciBzaG9ydGVuaW5nIHBhdGhzIGluIHRoZSBnb2xkZW4gZmlsZS4gKi9cbiAgYmFzZURpcjogc3RyaW5nO1xuICAvKiogUGF0aCB0byB0aGUgZ29sZGVuIGZpbGUgdGhhdCBpcyB1c2VkIGZvciBjaGVja2luZyBhbmQgYXBwcm92aW5nLiAqL1xuICBnb2xkZW5GaWxlOiBzdHJpbmc7XG4gIC8qKiBHbG9iIHRoYXQgcmVzb2x2ZXMgc291cmNlIGZpbGVzIHdoaWNoIHNob3VsZCBiZSBjaGVja2VkLiAqL1xuICBnbG9iOiBzdHJpbmdcbiAgLyoqXG4gICAqIE9wdGlvbmFsIG1vZHVsZSByZXNvbHZlciBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHJlc29sdmUgbW9kdWxlc1xuICAgKiB0byBhYnNvbHV0ZSBmaWxlIHBhdGhzLlxuICAgKi9cbiAgcmVzb2x2ZU1vZHVsZT86IE1vZHVsZVJlc29sdmVyO1xuICAvKipcbiAgICogT3B0aW9uYWwgY29tbWFuZCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGlmIHRoZSBnb2xkZW4gY2hlY2sgZmFpbGVkLiBUaGlzIGNhbiBiZSB1c2VkXG4gICAqIHRvIGNvbnNpc3RlbnRseSB1c2Ugc2NyaXB0IGFsaWFzZXMgZm9yIGNoZWNraW5nL2FwcHJvdmluZyB0aGUgZ29sZGVuLlxuICAgKi9cbiAgYXBwcm92ZUNvbW1hbmQ/OiBzdHJpbmc7XG59XG5cbi8qKlxuICogTG9hZHMgdGhlIGNvbmZpZ3VyYXRpb24gZm9yIHRoZSBjaXJjdWxhciBkZXBlbmRlbmNpZXMgdGVzdC4gSWYgdGhlIGNvbmZpZyBjYW5ub3QgYmVcbiAqIGxvYWRlZCwgYW4gZXJyb3Igd2lsbCBiZSBwcmludGVkIGFuZCB0aGUgcHJvY2VzcyBleGlzdHMgd2l0aCBhIG5vbi16ZXJvIGV4aXQgY29kZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvYWRUZXN0Q29uZmlnKGNvbmZpZ1BhdGg6IHN0cmluZyk6IENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZyB7XG4gIGNvbnN0IGNvbmZpZ0Jhc2VEaXIgPSBkaXJuYW1lKGNvbmZpZ1BhdGgpO1xuICBjb25zdCByZXNvbHZlUmVsYXRpdmVQYXRoID0gKHJlbGF0aXZlUGF0aDogc3RyaW5nKSA9PiByZXNvbHZlKGNvbmZpZ0Jhc2VEaXIsIHJlbGF0aXZlUGF0aCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjb25maWcgPSByZXF1aXJlKGNvbmZpZ1BhdGgpIGFzIENpcmN1bGFyRGVwZW5kZW5jaWVzVGVzdENvbmZpZztcbiAgICBpZiAoIWlzQWJzb2x1dGUoY29uZmlnLmJhc2VEaXIpKSB7XG4gICAgICBjb25maWcuYmFzZURpciA9IHJlc29sdmVSZWxhdGl2ZVBhdGgoY29uZmlnLmJhc2VEaXIpO1xuICAgIH1cbiAgICBpZiAoIWlzQWJzb2x1dGUoY29uZmlnLmdvbGRlbkZpbGUpKSB7XG4gICAgICBjb25maWcuZ29sZGVuRmlsZSA9IHJlc29sdmVSZWxhdGl2ZVBhdGgoY29uZmlnLmdvbGRlbkZpbGUpO1xuICAgIH1cbiAgICBpZiAoIWlzQWJzb2x1dGUoY29uZmlnLmdsb2IpKSB7XG4gICAgICBjb25maWcuZ2xvYiA9IHJlc29sdmVSZWxhdGl2ZVBhdGgoY29uZmlnLmdsb2IpO1xuICAgIH1cbiAgICByZXR1cm4gY29uZmlnO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZXJyb3IoJ0NvdWxkIG5vdCBsb2FkIHRlc3QgY29uZmlndXJhdGlvbiBmaWxlIGF0OiAnICsgY29uZmlnUGF0aCk7XG4gICAgZXJyb3IoYEZhaWxlZCB3aXRoOiAke2UubWVzc2FnZX1gKTtcbiAgICBwcm9jZXNzLmV4aXQoMSk7XG4gIH1cbn1cbiJdfQ==