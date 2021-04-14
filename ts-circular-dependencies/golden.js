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
        define("@angular/dev-infra-private/ts-circular-dependencies/golden", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/ts-circular-dependencies/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.compareGoldens = exports.convertReferenceChainToGolden = void 0;
    var tslib_1 = require("tslib");
    var path_1 = require("path");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    /**
     * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
     * by default use TypeScript source file objects. In order to make those chains printable,
     * the source file objects are mapped to their relative file names.
     */
    function convertReferenceChainToGolden(refs, baseDir) {
        return refs
            .map(
        // Normalize cycles as the paths can vary based on which node in the cycle is visited
        // first in the analyzer. The paths represent cycles. Hence we can shift nodes in a
        // deterministic way so that the goldens don't change unnecessarily and cycle comparison
        // is simpler.
        function (chain) { return normalizeCircularDependency(chain.map(function (_a) {
            var fileName = _a.fileName;
            return file_system_1.convertPathToForwardSlash(path_1.relative(baseDir, fileName));
        })); })
            // Sort cycles so that the golden doesn't change unnecessarily when cycles are detected
            // in different order (e.g. new imports cause cycles to be detected earlier or later).
            .sort(compareCircularDependency);
    }
    exports.convertReferenceChainToGolden = convertReferenceChainToGolden;
    /**
     * Compares the specified goldens and returns two lists that describe newly
     * added circular dependencies, or fixed circular dependencies.
     */
    function compareGoldens(actual, expected) {
        var newCircularDeps = [];
        var fixedCircularDeps = [];
        actual.forEach(function (a) {
            if (!expected.find(function (e) { return isSameCircularDependency(a, e); })) {
                newCircularDeps.push(a);
            }
        });
        expected.forEach(function (e) {
            if (!actual.find(function (a) { return isSameCircularDependency(e, a); })) {
                fixedCircularDeps.push(e);
            }
        });
        return { newCircularDeps: newCircularDeps, fixedCircularDeps: fixedCircularDeps };
    }
    exports.compareGoldens = compareGoldens;
    /**
     * Normalizes the a circular dependency by ensuring that the path starts with the first
     * node in alphabetical order. Since the path array represents a cycle, we can make a
     * specific node the first element in the path that represents the cycle.
     *
     * This method is helpful because the path of circular dependencies changes based on which
     * file in the path has been visited first by the analyzer. e.g. Assume we have a circular
     * dependency represented as: `A -> B -> C`. The analyzer will detect this cycle when it
     * visits `A`. Though when a source file that is analyzed before `A` starts importing `B`,
     * the cycle path will detected as `B -> C -> A`. This represents the same cycle, but is just
     * different due to a limitation of using a data structure that can be written to a text-based
     * golden file.
     *
     * To account for this non-deterministic behavior in goldens, we shift the circular
     * dependency path to the first node based on alphabetical order. e.g. `A` will always
     * be the first node in the path that represents the cycle.
     */
    function normalizeCircularDependency(path) {
        if (path.length <= 1) {
            return path;
        }
        var indexFirstNode = 0;
        var valueFirstNode = path[0];
        // Find a node in the cycle path that precedes all other elements
        // in terms of alphabetical order.
        for (var i = 1; i < path.length; i++) {
            var value = path[i];
            if (value.localeCompare(valueFirstNode, 'en') < 0) {
                indexFirstNode = i;
                valueFirstNode = value;
            }
        }
        // If the alphabetically first node is already at start of the path, just
        // return the actual path as no changes need to be made.
        if (indexFirstNode === 0) {
            return path;
        }
        // Move the determined first node (as of alphabetical order) to the start of a new
        // path array. The nodes before the first node in the old path are then concatenated
        // to the end of the new path. This is possible because the path represents a cycle.
        return tslib_1.__spreadArray(tslib_1.__spreadArray([], tslib_1.__read(path.slice(indexFirstNode))), tslib_1.__read(path.slice(0, indexFirstNode)));
    }
    /** Checks whether the specified circular dependencies are equal. */
    function isSameCircularDependency(actual, expected) {
        if (actual.length !== expected.length) {
            return false;
        }
        for (var i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }
        return true;
    }
    /**
     * Compares two circular dependencies by respecting the alphabetic order of nodes in the
     * cycle paths. The first nodes which don't match in both paths are decisive on the order.
     */
    function compareCircularDependency(a, b) {
        // Go through nodes in both cycle paths and determine whether `a` should be ordered
        // before `b`. The first nodes which don't match decide on the order.
        for (var i = 0; i < Math.min(a.length, b.length); i++) {
            var compareValue = a[i].localeCompare(b[i], 'en');
            if (compareValue !== 0) {
                return compareValue;
            }
        }
        // If all nodes are equal in the cycles, the order is based on the length of both cycles.
        return a.length - b.length;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILDZCQUE4QjtJQUc5QiwrRkFBd0Q7SUFLeEQ7Ozs7T0FJRztJQUNILFNBQWdCLDZCQUE2QixDQUFDLElBQXNCLEVBQUUsT0FBZTtRQUNuRixPQUFPLElBQUk7YUFDTixHQUFHO1FBQ0EscUZBQXFGO1FBQ3JGLG1GQUFtRjtRQUNuRix3RkFBd0Y7UUFDeEYsY0FBYztRQUNkLFVBQUEsS0FBSyxJQUFJLE9BQUEsMkJBQTJCLENBQ2hDLEtBQUssQ0FBQyxHQUFHLENBQUMsVUFBQyxFQUFVO2dCQUFULFFBQVEsY0FBQTtZQUFNLE9BQUEsdUNBQXlCLENBQUMsZUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztRQUF0RCxDQUFzRCxDQUFDLENBQUMsRUFEN0UsQ0FDNkUsQ0FBQztZQUMzRix1RkFBdUY7WUFDdkYsc0ZBQXNGO2FBQ3JGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFaRCxzRUFZQztJQUVEOzs7T0FHRztJQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7UUFDN0QsSUFBTSxlQUFlLEdBQXlCLEVBQUUsQ0FBQztRQUNqRCxJQUFNLGlCQUFpQixHQUF5QixFQUFFLENBQUM7UUFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7WUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBOUIsQ0FBOEIsQ0FBQyxFQUFFO2dCQUN2RCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3pCO1FBQ0gs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LyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cmVsYXRpdmV9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQge1JlZmVyZW5jZUNoYWlufSBmcm9tICcuL2FuYWx5emVyJztcbmltcG9ydCB7Y29udmVydFBhdGhUb0ZvcndhcmRTbGFzaH0gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5cbmV4cG9ydCB0eXBlIENpcmN1bGFyRGVwZW5kZW5jeSA9IFJlZmVyZW5jZUNoYWluPHN0cmluZz47XG5leHBvcnQgdHlwZSBHb2xkZW4gPSBDaXJjdWxhckRlcGVuZGVuY3lbXTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIGxpc3Qgb2YgcmVmZXJlbmNlIGNoYWlucyB0byBhIEpTT04tY29tcGF0aWJsZSBnb2xkZW4gb2JqZWN0LiBSZWZlcmVuY2UgY2hhaW5zXG4gKiBieSBkZWZhdWx0IHVzZSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlIG9iamVjdHMuIEluIG9yZGVyIHRvIG1ha2UgdGhvc2UgY2hhaW5zIHByaW50YWJsZSxcbiAqIHRoZSBzb3VyY2UgZmlsZSBvYmplY3RzIGFyZSBtYXBwZWQgdG8gdGhlaXIgcmVsYXRpdmUgZmlsZSBuYW1lcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRSZWZlcmVuY2VDaGFpblRvR29sZGVuKHJlZnM6IFJlZmVyZW5jZUNoYWluW10sIGJhc2VEaXI6IHN0cmluZyk6IEdvbGRlbiB7XG4gIHJldHVybiByZWZzXG4gICAgICAubWFwKFxuICAgICAgICAgIC8vIE5vcm1hbGl6ZSBjeWNsZXMgYXMgdGhlIHBhdGhzIGNhbiB2YXJ5IGJhc2VkIG9uIHdoaWNoIG5vZGUgaW4gdGhlIGN5Y2xlIGlzIHZpc2l0ZWRcbiAgICAgICAgICAvLyBmaXJzdCBpbiB0aGUgYW5hbHl6ZXIuIFRoZSBwYXRocyByZXByZXNlbnQgY3ljbGVzLiBIZW5jZSB3ZSBjYW4gc2hpZnQgbm9kZXMgaW4gYVxuICAgICAgICAgIC8vIGRldGVybWluaXN0aWMgd2F5IHNvIHRoYXQgdGhlIGdvbGRlbnMgZG9uJ3QgY2hhbmdlIHVubmVjZXNzYXJpbHkgYW5kIGN5Y2xlIGNvbXBhcmlzb25cbiAgICAgICAgICAvLyBpcyBzaW1wbGVyLlxuICAgICAgICAgIGNoYWluID0+IG5vcm1hbGl6ZUNpcmN1bGFyRGVwZW5kZW5jeShcbiAgICAgICAgICAgICAgY2hhaW4ubWFwKCh7ZmlsZU5hbWV9KSA9PiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIGZpbGVOYW1lKSkpKSlcbiAgICAgIC8vIFNvcnQgY3ljbGVzIHNvIHRoYXQgdGhlIGdvbGRlbiBkb2Vzbid0IGNoYW5nZSB1bm5lY2Vzc2FyaWx5IHdoZW4gY3ljbGVzIGFyZSBkZXRlY3RlZFxuICAgICAgLy8gaW4gZGlmZmVyZW50IG9yZGVyIChlLmcuIG5ldyBpbXBvcnRzIGNhdXNlIGN5Y2xlcyB0byBiZSBkZXRlY3RlZCBlYXJsaWVyIG9yIGxhdGVyKS5cbiAgICAgIC5zb3J0KGNvbXBhcmVDaXJjdWxhckRlcGVuZGVuY3kpO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBzcGVjaWZpZWQgZ29sZGVucyBhbmQgcmV0dXJucyB0d28gbGlzdHMgdGhhdCBkZXNjcmliZSBuZXdseVxuICogYWRkZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLCBvciBmaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlR29sZGVucyhhY3R1YWw6IEdvbGRlbiwgZXhwZWN0ZWQ6IEdvbGRlbikge1xuICBjb25zdCBuZXdDaXJjdWxhckRlcHM6IENpcmN1bGFyRGVwZW5kZW5jeVtdID0gW107XG4gIGNvbnN0IGZpeGVkQ2lyY3VsYXJEZXBzOiBDaXJjdWxhckRlcGVuZGVuY3lbXSA9IFtdO1xuICBhY3R1YWwuZm9yRWFjaChhID0+IHtcbiAgICBpZiAoIWV4cGVjdGVkLmZpbmQoZSA9PiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koYSwgZSkpKSB7XG4gICAgICBuZXdDaXJjdWxhckRlcHMucHVzaChhKTtcbiAgICB9XG4gIH0pO1xuICBleHBlY3RlZC5mb3JFYWNoKGUgPT4ge1xuICAgIGlmICghYWN0dWFsLmZpbmQoYSA9PiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koZSwgYSkpKSB7XG4gICAgICBmaXhlZENpcmN1bGFyRGVwcy5wdXNoKGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7bmV3Q2lyY3VsYXJEZXBzLCBmaXhlZENpcmN1bGFyRGVwc307XG59XG5cbi8qKlxuICogTm9ybWFsaXplcyB0aGUgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJ5IGVuc3VyaW5nIHRoYXQgdGhlIHBhdGggc3RhcnRzIHdpdGggdGhlIGZpcnN0XG4gKiBub2RlIGluIGFscGhhYmV0aWNhbCBvcmRlci4gU2luY2UgdGhlIHBhdGggYXJyYXkgcmVwcmVzZW50cyBhIGN5Y2xlLCB3ZSBjYW4gbWFrZSBhXG4gKiBzcGVjaWZpYyBub2RlIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBwYXRoIHRoYXQgcmVwcmVzZW50cyB0aGUgY3ljbGUuXG4gKlxuICogVGhpcyBtZXRob2QgaXMgaGVscGZ1bCBiZWNhdXNlIHRoZSBwYXRoIG9mIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBjaGFuZ2VzIGJhc2VkIG9uIHdoaWNoXG4gKiBmaWxlIGluIHRoZSBwYXRoIGhhcyBiZWVuIHZpc2l0ZWQgZmlyc3QgYnkgdGhlIGFuYWx5emVyLiBlLmcuIEFzc3VtZSB3ZSBoYXZlIGEgY2lyY3VsYXJcbiAqIGRlcGVuZGVuY3kgcmVwcmVzZW50ZWQgYXM6IGBBIC0+IEIgLT4gQ2AuIFRoZSBhbmFseXplciB3aWxsIGRldGVjdCB0aGlzIGN5Y2xlIHdoZW4gaXRcbiAqIHZpc2l0cyBgQWAuIFRob3VnaCB3aGVuIGEgc291cmNlIGZpbGUgdGhhdCBpcyBhbmFseXplZCBiZWZvcmUgYEFgIHN0YXJ0cyBpbXBvcnRpbmcgYEJgLFxuICogdGhlIGN5Y2xlIHBhdGggd2lsbCBkZXRlY3RlZCBhcyBgQiAtPiBDIC0+IEFgLiBUaGlzIHJlcHJlc2VudHMgdGhlIHNhbWUgY3ljbGUsIGJ1dCBpcyBqdXN0XG4gKiBkaWZmZXJlbnQgZHVlIHRvIGEgbGltaXRhdGlvbiBvZiB1c2luZyBhIGRhdGEgc3RydWN0dXJlIHRoYXQgY2FuIGJlIHdyaXR0ZW4gdG8gYSB0ZXh0LWJhc2VkXG4gKiBnb2xkZW4gZmlsZS5cbiAqXG4gKiBUbyBhY2NvdW50IGZvciB0aGlzIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yIGluIGdvbGRlbnMsIHdlIHNoaWZ0IHRoZSBjaXJjdWxhclxuICogZGVwZW5kZW5jeSBwYXRoIHRvIHRoZSBmaXJzdCBub2RlIGJhc2VkIG9uIGFscGhhYmV0aWNhbCBvcmRlci4gZS5nLiBgQWAgd2lsbCBhbHdheXNcbiAqIGJlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBwYXRoIHRoYXQgcmVwcmVzZW50cyB0aGUgY3ljbGUuXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNpcmN1bGFyRGVwZW5kZW5jeShwYXRoOiBDaXJjdWxhckRlcGVuZGVuY3kpOiBDaXJjdWxhckRlcGVuZGVuY3kge1xuICBpZiAocGF0aC5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgbGV0IGluZGV4Rmlyc3ROb2RlOiBudW1iZXIgPSAwO1xuICBsZXQgdmFsdWVGaXJzdE5vZGU6IHN0cmluZyA9IHBhdGhbMF07XG5cbiAgLy8gRmluZCBhIG5vZGUgaW4gdGhlIGN5Y2xlIHBhdGggdGhhdCBwcmVjZWRlcyBhbGwgb3RoZXIgZWxlbWVudHNcbiAgLy8gaW4gdGVybXMgb2YgYWxwaGFiZXRpY2FsIG9yZGVyLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IHBhdGhbaV07XG4gICAgaWYgKHZhbHVlLmxvY2FsZUNvbXBhcmUodmFsdWVGaXJzdE5vZGUsICdlbicpIDwgMCkge1xuICAgICAgaW5kZXhGaXJzdE5vZGUgPSBpO1xuICAgICAgdmFsdWVGaXJzdE5vZGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgYWxwaGFiZXRpY2FsbHkgZmlyc3Qgbm9kZSBpcyBhbHJlYWR5IGF0IHN0YXJ0IG9mIHRoZSBwYXRoLCBqdXN0XG4gIC8vIHJldHVybiB0aGUgYWN0dWFsIHBhdGggYXMgbm8gY2hhbmdlcyBuZWVkIHRvIGJlIG1hZGUuXG4gIGlmIChpbmRleEZpcnN0Tm9kZSA9PT0gMCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgLy8gTW92ZSB0aGUgZGV0ZXJtaW5lZCBmaXJzdCBub2RlIChhcyBvZiBhbHBoYWJldGljYWwgb3JkZXIpIHRvIHRoZSBzdGFydCBvZiBhIG5ld1xuICAvLyBwYXRoIGFycmF5LiBUaGUgbm9kZXMgYmVmb3JlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBvbGQgcGF0aCBhcmUgdGhlbiBjb25jYXRlbmF0ZWRcbiAgLy8gdG8gdGhlIGVuZCBvZiB0aGUgbmV3IHBhdGguIFRoaXMgaXMgcG9zc2libGUgYmVjYXVzZSB0aGUgcGF0aCByZXByZXNlbnRzIGEgY3ljbGUuXG4gIHJldHVybiBbLi4ucGF0aC5zbGljZShpbmRleEZpcnN0Tm9kZSksIC4uLnBhdGguc2xpY2UoMCwgaW5kZXhGaXJzdE5vZGUpXTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGFyZSBlcXVhbC4gKi9cbmZ1bmN0aW9uIGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShhY3R1YWw6IENpcmN1bGFyRGVwZW5kZW5jeSwgZXhwZWN0ZWQ6IENpcmN1bGFyRGVwZW5kZW5jeSkge1xuICBpZiAoYWN0dWFsLmxlbmd0aCAhPT0gZXhwZWN0ZWQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBieSByZXNwZWN0aW5nIHRoZSBhbHBoYWJldGljIG9yZGVyIG9mIG5vZGVzIGluIHRoZVxuICogY3ljbGUgcGF0aHMuIFRoZSBmaXJzdCBub2RlcyB3aGljaCBkb24ndCBtYXRjaCBpbiBib3RoIHBhdGhzIGFyZSBkZWNpc2l2ZSBvbiB0aGUgb3JkZXIuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVDaXJjdWxhckRlcGVuZGVuY3koYTogQ2lyY3VsYXJEZXBlbmRlbmN5LCBiOiBDaXJjdWxhckRlcGVuZGVuY3kpOiBudW1iZXIge1xuICAvLyBHbyB0aHJvdWdoIG5vZGVzIGluIGJvdGggY3ljbGUgcGF0aHMgYW5kIGRldGVybWluZSB3aGV0aGVyIGBhYCBzaG91bGQgYmUgb3JkZXJlZFxuICAvLyBiZWZvcmUgYGJgLiBUaGUgZmlyc3Qgbm9kZXMgd2hpY2ggZG9uJ3QgbWF0Y2ggZGVjaWRlIG9uIHRoZSBvcmRlci5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpOyBpKyspIHtcbiAgICBjb25zdCBjb21wYXJlVmFsdWUgPSBhW2ldLmxvY2FsZUNvbXBhcmUoYltpXSwgJ2VuJyk7XG4gICAgaWYgKGNvbXBhcmVWYWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIGNvbXBhcmVWYWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gSWYgYWxsIG5vZGVzIGFyZSBlcXVhbCBpbiB0aGUgY3ljbGVzLCB0aGUgb3JkZXIgaXMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiBib3RoIGN5Y2xlcy5cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG4iXX0=