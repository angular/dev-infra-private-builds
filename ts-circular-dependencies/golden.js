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
        define("@angular/dev-infra-private/ts-circular-dependencies/golden", ["require", "exports", "tslib", "path", "@angular/dev-infra-private/ts-circular-dependencies/file_system"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        return tslib_1.__spread(path.slice(indexFirstNode), path.slice(0, indexFirstNode));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsNkJBQThCO0lBRzlCLCtGQUF3RDtJQUt4RDs7OztPQUlHO0lBQ0gsU0FBZ0IsNkJBQTZCLENBQUMsSUFBc0IsRUFBRSxPQUFlO1FBQ25GLE9BQU8sSUFBSTthQUNOLEdBQUc7UUFDQSxxRkFBcUY7UUFDckYsbUZBQW1GO1FBQ25GLHdGQUF3RjtRQUN4RixjQUFjO1FBQ2QsVUFBQSxLQUFLLElBQUksT0FBQSwyQkFBMkIsQ0FDaEMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLEVBQVU7Z0JBQVQsc0JBQVE7WUFBTSxPQUFBLHVDQUF5QixDQUFDLGVBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFBdEQsQ0FBc0QsQ0FBQyxDQUFDLEVBRDdFLENBQzZFLENBQUM7WUFDM0YsdUZBQXVGO1lBQ3ZGLHNGQUFzRjthQUNyRixJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBWkQsc0VBWUM7SUFFRDs7O09BR0c7SUFDSCxTQUFnQixjQUFjLENBQUMsTUFBYyxFQUFFLFFBQWdCO1FBQzdELElBQU0sZUFBZSxHQUF5QixFQUFFLENBQUM7UUFDakQsSUFBTSxpQkFBaUIsR0FBeUIsRUFBRSxDQUFDO1FBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBQSxDQUFDO1lBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQTlCLENBQThCLENBQUMsRUFBRTtnQkFDdkQsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN6QjtRQUNILENBQUMs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KiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3JlbGF0aXZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtSZWZlcmVuY2VDaGFpbn0gZnJvbSAnLi9hbmFseXplcic7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuXG5leHBvcnQgdHlwZSBDaXJjdWxhckRlcGVuZGVuY3kgPSBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgR29sZGVuID0gQ2lyY3VsYXJEZXBlbmRlbmN5W107XG5cbi8qKlxuICogQ29udmVydHMgYSBsaXN0IG9mIHJlZmVyZW5jZSBjaGFpbnMgdG8gYSBKU09OLWNvbXBhdGlibGUgZ29sZGVuIG9iamVjdC4gUmVmZXJlbmNlIGNoYWluc1xuICogYnkgZGVmYXVsdCB1c2UgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZSBvYmplY3RzLiBJbiBvcmRlciB0byBtYWtlIHRob3NlIGNoYWlucyBwcmludGFibGUsXG4gKiB0aGUgc291cmNlIGZpbGUgb2JqZWN0cyBhcmUgbWFwcGVkIHRvIHRoZWlyIHJlbGF0aXZlIGZpbGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihyZWZzOiBSZWZlcmVuY2VDaGFpbltdLCBiYXNlRGlyOiBzdHJpbmcpOiBHb2xkZW4ge1xuICByZXR1cm4gcmVmc1xuICAgICAgLm1hcChcbiAgICAgICAgICAvLyBOb3JtYWxpemUgY3ljbGVzIGFzIHRoZSBwYXRocyBjYW4gdmFyeSBiYXNlZCBvbiB3aGljaCBub2RlIGluIHRoZSBjeWNsZSBpcyB2aXNpdGVkXG4gICAgICAgICAgLy8gZmlyc3QgaW4gdGhlIGFuYWx5emVyLiBUaGUgcGF0aHMgcmVwcmVzZW50IGN5Y2xlcy4gSGVuY2Ugd2UgY2FuIHNoaWZ0IG5vZGVzIGluIGFcbiAgICAgICAgICAvLyBkZXRlcm1pbmlzdGljIHdheSBzbyB0aGF0IHRoZSBnb2xkZW5zIGRvbid0IGNoYW5nZSB1bm5lY2Vzc2FyaWx5IGFuZCBjeWNsZSBjb21wYXJpc29uXG4gICAgICAgICAgLy8gaXMgc2ltcGxlci5cbiAgICAgICAgICBjaGFpbiA9PiBub3JtYWxpemVDaXJjdWxhckRlcGVuZGVuY3koXG4gICAgICAgICAgICAgIGNoYWluLm1hcCgoe2ZpbGVOYW1lfSkgPT4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBmaWxlTmFtZSkpKSkpXG4gICAgICAvLyBTb3J0IGN5Y2xlcyBzbyB0aGF0IHRoZSBnb2xkZW4gZG9lc24ndCBjaGFuZ2UgdW5uZWNlc3NhcmlseSB3aGVuIGN5Y2xlcyBhcmUgZGV0ZWN0ZWRcbiAgICAgIC8vIGluIGRpZmZlcmVudCBvcmRlciAoZS5nLiBuZXcgaW1wb3J0cyBjYXVzZSBjeWNsZXMgdG8gYmUgZGV0ZWN0ZWQgZWFybGllciBvciBsYXRlcikuXG4gICAgICAuc29ydChjb21wYXJlQ2lyY3VsYXJEZXBlbmRlbmN5KTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgc3BlY2lmaWVkIGdvbGRlbnMgYW5kIHJldHVybnMgdHdvIGxpc3RzIHRoYXQgZGVzY3JpYmUgbmV3bHlcbiAqIGFkZGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcywgb3IgZml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZUdvbGRlbnMoYWN0dWFsOiBHb2xkZW4sIGV4cGVjdGVkOiBHb2xkZW4pIHtcbiAgY29uc3QgbmV3Q2lyY3VsYXJEZXBzOiBDaXJjdWxhckRlcGVuZGVuY3lbXSA9IFtdO1xuICBjb25zdCBmaXhlZENpcmN1bGFyRGVwczogQ2lyY3VsYXJEZXBlbmRlbmN5W10gPSBbXTtcbiAgYWN0dWFsLmZvckVhY2goYSA9PiB7XG4gICAgaWYgKCFleHBlY3RlZC5maW5kKGUgPT4gaXNTYW1lQ2lyY3VsYXJEZXBlbmRlbmN5KGEsIGUpKSkge1xuICAgICAgbmV3Q2lyY3VsYXJEZXBzLnB1c2goYSk7XG4gICAgfVxuICB9KTtcbiAgZXhwZWN0ZWQuZm9yRWFjaChlID0+IHtcbiAgICBpZiAoIWFjdHVhbC5maW5kKGEgPT4gaXNTYW1lQ2lyY3VsYXJEZXBlbmRlbmN5KGUsIGEpKSkge1xuICAgICAgZml4ZWRDaXJjdWxhckRlcHMucHVzaChlKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4ge25ld0NpcmN1bGFyRGVwcywgZml4ZWRDaXJjdWxhckRlcHN9O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZXMgdGhlIGEgY2lyY3VsYXIgZGVwZW5kZW5jeSBieSBlbnN1cmluZyB0aGF0IHRoZSBwYXRoIHN0YXJ0cyB3aXRoIHRoZSBmaXJzdFxuICogbm9kZSBpbiBhbHBoYWJldGljYWwgb3JkZXIuIFNpbmNlIHRoZSBwYXRoIGFycmF5IHJlcHJlc2VudHMgYSBjeWNsZSwgd2UgY2FuIG1ha2UgYVxuICogc3BlY2lmaWMgbm9kZSB0aGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgcGF0aCB0aGF0IHJlcHJlc2VudHMgdGhlIGN5Y2xlLlxuICpcbiAqIFRoaXMgbWV0aG9kIGlzIGhlbHBmdWwgYmVjYXVzZSB0aGUgcGF0aCBvZiBjaXJjdWxhciBkZXBlbmRlbmNpZXMgY2hhbmdlcyBiYXNlZCBvbiB3aGljaFxuICogZmlsZSBpbiB0aGUgcGF0aCBoYXMgYmVlbiB2aXNpdGVkIGZpcnN0IGJ5IHRoZSBhbmFseXplci4gZS5nLiBBc3N1bWUgd2UgaGF2ZSBhIGNpcmN1bGFyXG4gKiBkZXBlbmRlbmN5IHJlcHJlc2VudGVkIGFzOiBgQSAtPiBCIC0+IENgLiBUaGUgYW5hbHl6ZXIgd2lsbCBkZXRlY3QgdGhpcyBjeWNsZSB3aGVuIGl0XG4gKiB2aXNpdHMgYEFgLiBUaG91Z2ggd2hlbiBhIHNvdXJjZSBmaWxlIHRoYXQgaXMgYW5hbHl6ZWQgYmVmb3JlIGBBYCBzdGFydHMgaW1wb3J0aW5nIGBCYCxcbiAqIHRoZSBjeWNsZSBwYXRoIHdpbGwgZGV0ZWN0ZWQgYXMgYEIgLT4gQyAtPiBBYC4gVGhpcyByZXByZXNlbnRzIHRoZSBzYW1lIGN5Y2xlLCBidXQgaXMganVzdFxuICogZGlmZmVyZW50IGR1ZSB0byBhIGxpbWl0YXRpb24gb2YgdXNpbmcgYSBkYXRhIHN0cnVjdHVyZSB0aGF0IGNhbiBiZSB3cml0dGVuIHRvIGEgdGV4dC1iYXNlZFxuICogZ29sZGVuIGZpbGUuXG4gKlxuICogVG8gYWNjb3VudCBmb3IgdGhpcyBub24tZGV0ZXJtaW5pc3RpYyBiZWhhdmlvciBpbiBnb2xkZW5zLCB3ZSBzaGlmdCB0aGUgY2lyY3VsYXJcbiAqIGRlcGVuZGVuY3kgcGF0aCB0byB0aGUgZmlyc3Qgbm9kZSBiYXNlZCBvbiBhbHBoYWJldGljYWwgb3JkZXIuIGUuZy4gYEFgIHdpbGwgYWx3YXlzXG4gKiBiZSB0aGUgZmlyc3Qgbm9kZSBpbiB0aGUgcGF0aCB0aGF0IHJlcHJlc2VudHMgdGhlIGN5Y2xlLlxuICovXG5mdW5jdGlvbiBub3JtYWxpemVDaXJjdWxhckRlcGVuZGVuY3kocGF0aDogQ2lyY3VsYXJEZXBlbmRlbmN5KTogQ2lyY3VsYXJEZXBlbmRlbmN5IHtcbiAgaWYgKHBhdGgubGVuZ3RoIDw9IDEpIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIGxldCBpbmRleEZpcnN0Tm9kZTogbnVtYmVyID0gMDtcbiAgbGV0IHZhbHVlRmlyc3ROb2RlOiBzdHJpbmcgPSBwYXRoWzBdO1xuXG4gIC8vIEZpbmQgYSBub2RlIGluIHRoZSBjeWNsZSBwYXRoIHRoYXQgcHJlY2VkZXMgYWxsIG90aGVyIGVsZW1lbnRzXG4gIC8vIGluIHRlcm1zIG9mIGFscGhhYmV0aWNhbCBvcmRlci5cbiAgZm9yIChsZXQgaSA9IDE7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgdmFsdWUgPSBwYXRoW2ldO1xuICAgIGlmICh2YWx1ZS5sb2NhbGVDb21wYXJlKHZhbHVlRmlyc3ROb2RlLCAnZW4nKSA8IDApIHtcbiAgICAgIGluZGV4Rmlyc3ROb2RlID0gaTtcbiAgICAgIHZhbHVlRmlyc3ROb2RlID0gdmFsdWU7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGFscGhhYmV0aWNhbGx5IGZpcnN0IG5vZGUgaXMgYWxyZWFkeSBhdCBzdGFydCBvZiB0aGUgcGF0aCwganVzdFxuICAvLyByZXR1cm4gdGhlIGFjdHVhbCBwYXRoIGFzIG5vIGNoYW5nZXMgbmVlZCB0byBiZSBtYWRlLlxuICBpZiAoaW5kZXhGaXJzdE5vZGUgPT09IDApIHtcbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuXG4gIC8vIE1vdmUgdGhlIGRldGVybWluZWQgZmlyc3Qgbm9kZSAoYXMgb2YgYWxwaGFiZXRpY2FsIG9yZGVyKSB0byB0aGUgc3RhcnQgb2YgYSBuZXdcbiAgLy8gcGF0aCBhcnJheS4gVGhlIG5vZGVzIGJlZm9yZSB0aGUgZmlyc3Qgbm9kZSBpbiB0aGUgb2xkIHBhdGggYXJlIHRoZW4gY29uY2F0ZW5hdGVkXG4gIC8vIHRvIHRoZSBlbmQgb2YgdGhlIG5ldyBwYXRoLiBUaGlzIGlzIHBvc3NpYmxlIGJlY2F1c2UgdGhlIHBhdGggcmVwcmVzZW50cyBhIGN5Y2xlLlxuICByZXR1cm4gWy4uLnBhdGguc2xpY2UoaW5kZXhGaXJzdE5vZGUpLCAuLi5wYXRoLnNsaWNlKDAsIGluZGV4Rmlyc3ROb2RlKV07XG59XG5cbi8qKiBDaGVja3Mgd2hldGhlciB0aGUgc3BlY2lmaWVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBhcmUgZXF1YWwuICovXG5mdW5jdGlvbiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koYWN0dWFsOiBDaXJjdWxhckRlcGVuZGVuY3ksIGV4cGVjdGVkOiBDaXJjdWxhckRlcGVuZGVuY3kpIHtcbiAgaWYgKGFjdHVhbC5sZW5ndGggIT09IGV4cGVjdGVkLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBmb3IgKGxldCBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgIGlmIChhY3R1YWxbaV0gIT09IGV4cGVjdGVkW2ldKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHR3byBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYnkgcmVzcGVjdGluZyB0aGUgYWxwaGFiZXRpYyBvcmRlciBvZiBub2RlcyBpbiB0aGVcbiAqIGN5Y2xlIHBhdGhzLiBUaGUgZmlyc3Qgbm9kZXMgd2hpY2ggZG9uJ3QgbWF0Y2ggaW4gYm90aCBwYXRocyBhcmUgZGVjaXNpdmUgb24gdGhlIG9yZGVyLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQ2lyY3VsYXJEZXBlbmRlbmN5KGE6IENpcmN1bGFyRGVwZW5kZW5jeSwgYjogQ2lyY3VsYXJEZXBlbmRlbmN5KTogbnVtYmVyIHtcbiAgLy8gR28gdGhyb3VnaCBub2RlcyBpbiBib3RoIGN5Y2xlIHBhdGhzIGFuZCBkZXRlcm1pbmUgd2hldGhlciBgYWAgc2hvdWxkIGJlIG9yZGVyZWRcbiAgLy8gYmVmb3JlIGBiYC4gVGhlIGZpcnN0IG5vZGVzIHdoaWNoIGRvbid0IG1hdGNoIGRlY2lkZSBvbiB0aGUgb3JkZXIuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKTsgaSsrKSB7XG4gICAgY29uc3QgY29tcGFyZVZhbHVlID0gYVtpXS5sb2NhbGVDb21wYXJlKGJbaV0sICdlbicpO1xuICAgIGlmIChjb21wYXJlVmFsdWUgIT09IDApIHtcbiAgICAgIHJldHVybiBjb21wYXJlVmFsdWU7XG4gICAgfVxuICB9XG4gIC8vIElmIGFsbCBub2RlcyBhcmUgZXF1YWwgaW4gdGhlIGN5Y2xlcywgdGhlIG9yZGVyIGlzIGJhc2VkIG9uIHRoZSBsZW5ndGggb2YgYm90aCBjeWNsZXMuXG4gIHJldHVybiBhLmxlbmd0aCAtIGIubGVuZ3RoO1xufVxuIl19