(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/utils", ["require", "exports", "minimatch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getOrCreateGlob = void 0;
    /**
     * @license
     * Copyright Google LLC All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var minimatch_1 = require("minimatch");
    /** Map that holds patterns and their corresponding Minimatch globs. */
    var patternCache = new Map();
    /**
     * Gets a glob for the given pattern. The cached glob will be returned
     * if available. Otherwise a new glob will be created and cached.
     */
    function getOrCreateGlob(pattern) {
        if (patternCache.has(pattern)) {
            return patternCache.get(pattern);
        }
        var glob = new minimatch_1.Minimatch(pattern, { dot: true });
        patternCache.set(pattern, glob);
        return glob;
    }
    exports.getOrCreateGlob = getOrCreateGlob;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsdUNBQWdEO0lBRWhELHVFQUF1RTtJQUN2RSxJQUFNLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBc0IsQ0FBQztJQUVuRDs7O09BR0c7SUFDSCxTQUFnQixlQUFlLENBQUMsT0FBZTtRQUM3QyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDO1NBQ25DO1FBQ0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxxQkFBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ2pELFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVBELDBDQU9DIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0lNaW5pbWF0Y2gsIE1pbmltYXRjaH0gZnJvbSAnbWluaW1hdGNoJztcblxuLyoqIE1hcCB0aGF0IGhvbGRzIHBhdHRlcm5zIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIE1pbmltYXRjaCBnbG9icy4gKi9cbmNvbnN0IHBhdHRlcm5DYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCBJTWluaW1hdGNoPigpO1xuXG4vKipcbiAqIEdldHMgYSBnbG9iIGZvciB0aGUgZ2l2ZW4gcGF0dGVybi4gVGhlIGNhY2hlZCBnbG9iIHdpbGwgYmUgcmV0dXJuZWRcbiAqIGlmIGF2YWlsYWJsZS4gT3RoZXJ3aXNlIGEgbmV3IGdsb2Igd2lsbCBiZSBjcmVhdGVkIGFuZCBjYWNoZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPckNyZWF0ZUdsb2IocGF0dGVybjogc3RyaW5nKSB7XG4gIGlmIChwYXR0ZXJuQ2FjaGUuaGFzKHBhdHRlcm4pKSB7XG4gICAgcmV0dXJuIHBhdHRlcm5DYWNoZS5nZXQocGF0dGVybikhO1xuICB9XG4gIGNvbnN0IGdsb2IgPSBuZXcgTWluaW1hdGNoKHBhdHRlcm4sIHtkb3Q6IHRydWV9KTtcbiAgcGF0dGVybkNhY2hlLnNldChwYXR0ZXJuLCBnbG9iKTtcbiAgcmV0dXJuIGdsb2I7XG59XG4iXX0=