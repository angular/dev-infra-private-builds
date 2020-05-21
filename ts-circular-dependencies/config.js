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
        define("@angular/dev-infra-private/ts-circular-dependencies/config", ["require", "exports", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadTestConfig = void 0;
    var path_1 = require("path");
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
            console.error('Could not load test configuration file at: ' + configPath);
            console.error("Failed with: " + e.message);
            process.exit(1);
        }
    }
    exports.loadTestConfig = loadTestConfig;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQWtEO0lBeUJsRDs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsVUFBa0I7UUFDL0MsSUFBTSxhQUFhLEdBQUcsY0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzFDLElBQU0sbUJBQW1CLEdBQUcsVUFBQyxZQUFvQixJQUFLLE9BQUEsY0FBTyxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQztRQUUzRixJQUFJO1lBQ0YsSUFBTSxRQUFNLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBbUMsQ0FBQztZQUNyRSxJQUFJLENBQUMsaUJBQVUsQ0FBQyxRQUFNLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQy9CLFFBQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMsUUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ3REO1lBQ0QsSUFBSSxDQUFDLGlCQUFVLENBQUMsUUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFO2dCQUNsQyxRQUFNLENBQUMsVUFBVSxHQUFHLG1CQUFtQixDQUFDLFFBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUM1RDtZQUNELElBQUksQ0FBQyxpQkFBVSxDQUFDLFFBQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDNUIsUUFBTSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQyxRQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDaEQ7WUFDRCxPQUFPLFFBQU0sQ0FBQztTQUNmO1FBQUMsT0FBTyxDQUFDLEVBQUU7WUFDVixPQUFPLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1lBQzFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0JBQWdCLENBQUMsQ0FBQyxPQUFTLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQXJCRCx3Q0FxQkMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZGlybmFtZSwgaXNBYnNvbHV0ZSwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7TW9kdWxlUmVzb2x2ZXJ9IGZyb20gJy4vYW5hbHl6ZXInO1xuXG5cbi8qKiBDb25maWd1cmF0aW9uIGZvciBhIGNpcmN1bGFyIGRlcGVuZGVuY2llcyB0ZXN0LiAqL1xuZXhwb3J0IGludGVyZmFjZSBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcge1xuICAvKiogQmFzZSBkaXJlY3RvcnkgdXNlZCBmb3Igc2hvcnRlbmluZyBwYXRocyBpbiB0aGUgZ29sZGVuIGZpbGUuICovXG4gIGJhc2VEaXI6IHN0cmluZztcbiAgLyoqIFBhdGggdG8gdGhlIGdvbGRlbiBmaWxlIHRoYXQgaXMgdXNlZCBmb3IgY2hlY2tpbmcgYW5kIGFwcHJvdmluZy4gKi9cbiAgZ29sZGVuRmlsZTogc3RyaW5nO1xuICAvKiogR2xvYiB0aGF0IHJlc29sdmVzIHNvdXJjZSBmaWxlcyB3aGljaCBzaG91bGQgYmUgY2hlY2tlZC4gKi9cbiAgZ2xvYjogc3RyaW5nXG4gIC8qKlxuICAgKiBPcHRpb25hbCBtb2R1bGUgcmVzb2x2ZXIgZnVuY3Rpb24gdGhhdCBjYW4gYmUgdXNlZCB0byByZXNvbHZlIG1vZHVsZXNcbiAgICogdG8gYWJzb2x1dGUgZmlsZSBwYXRocy5cbiAgICovXG4gIHJlc29sdmVNb2R1bGU/OiBNb2R1bGVSZXNvbHZlcjtcbiAgLyoqXG4gICAqIE9wdGlvbmFsIGNvbW1hbmQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBpZiB0aGUgZ29sZGVuIGNoZWNrIGZhaWxlZC4gVGhpcyBjYW4gYmUgdXNlZFxuICAgKiB0byBjb25zaXN0ZW50bHkgdXNlIHNjcmlwdCBhbGlhc2VzIGZvciBjaGVja2luZy9hcHByb3ZpbmcgdGhlIGdvbGRlbi5cbiAgICovXG4gIGFwcHJvdmVDb21tYW5kPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIExvYWRzIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIHRlc3QuIElmIHRoZSBjb25maWcgY2Fubm90IGJlXG4gKiBsb2FkZWQsIGFuIGVycm9yIHdpbGwgYmUgcHJpbnRlZCBhbmQgdGhlIHByb2Nlc3MgZXhpc3RzIHdpdGggYSBub24temVybyBleGl0IGNvZGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkVGVzdENvbmZpZyhjb25maWdQYXRoOiBzdHJpbmcpOiBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWcge1xuICBjb25zdCBjb25maWdCYXNlRGlyID0gZGlybmFtZShjb25maWdQYXRoKTtcbiAgY29uc3QgcmVzb2x2ZVJlbGF0aXZlUGF0aCA9IChyZWxhdGl2ZVBhdGg6IHN0cmluZykgPT4gcmVzb2x2ZShjb25maWdCYXNlRGlyLCByZWxhdGl2ZVBhdGgpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgY29uZmlnID0gcmVxdWlyZShjb25maWdQYXRoKSBhcyBDaXJjdWxhckRlcGVuZGVuY2llc1Rlc3RDb25maWc7XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5iYXNlRGlyKSkge1xuICAgICAgY29uZmlnLmJhc2VEaXIgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5iYXNlRGlyKTtcbiAgICB9XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5nb2xkZW5GaWxlKSkge1xuICAgICAgY29uZmlnLmdvbGRlbkZpbGUgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5nb2xkZW5GaWxlKTtcbiAgICB9XG4gICAgaWYgKCFpc0Fic29sdXRlKGNvbmZpZy5nbG9iKSkge1xuICAgICAgY29uZmlnLmdsb2IgPSByZXNvbHZlUmVsYXRpdmVQYXRoKGNvbmZpZy5nbG9iKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBsb2FkIHRlc3QgY29uZmlndXJhdGlvbiBmaWxlIGF0OiAnICsgY29uZmlnUGF0aCk7XG4gICAgY29uc29sZS5lcnJvcihgRmFpbGVkIHdpdGg6ICR7ZS5tZXNzYWdlfWApO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxufVxuIl19