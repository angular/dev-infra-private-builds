"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareGoldens = exports.convertReferenceChainToGolden = void 0;
const path_1 = require("path");
const file_system_1 = require("./file_system");
/**
 * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
 * by default use TypeScript source file objects. In order to make those chains printable,
 * the source file objects are mapped to their relative file names.
 */
function convertReferenceChainToGolden(refs, baseDir) {
    return (refs
        .map(
    // Normalize cycles as the paths can vary based on which node in the cycle is visited
    // first in the analyzer. The paths represent cycles. Hence we can shift nodes in a
    // deterministic way so that the goldens don't change unnecessarily and cycle comparison
    // is simpler.
    (chain) => normalizeCircularDependency(chain.map(({ fileName }) => file_system_1.convertPathToForwardSlash(path_1.relative(baseDir, fileName)))))
        // Sort cycles so that the golden doesn't change unnecessarily when cycles are detected
        // in different order (e.g. new imports cause cycles to be detected earlier or later).
        .sort(compareCircularDependency));
}
exports.convertReferenceChainToGolden = convertReferenceChainToGolden;
/**
 * Compares the specified goldens and returns two lists that describe newly
 * added circular dependencies, or fixed circular dependencies.
 */
function compareGoldens(actual, expected) {
    const newCircularDeps = [];
    const fixedCircularDeps = [];
    actual.forEach((a) => {
        if (!expected.find((e) => isSameCircularDependency(a, e))) {
            newCircularDeps.push(a);
        }
    });
    expected.forEach((e) => {
        if (!actual.find((a) => isSameCircularDependency(e, a))) {
            fixedCircularDeps.push(e);
        }
    });
    return { newCircularDeps, fixedCircularDeps };
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
    let indexFirstNode = 0;
    let valueFirstNode = path[0];
    // Find a node in the cycle path that precedes all other elements
    // in terms of alphabetical order.
    for (let i = 1; i < path.length; i++) {
        const value = path[i];
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
    return [...path.slice(indexFirstNode), ...path.slice(0, indexFirstNode)];
}
/** Checks whether the specified circular dependencies are equal. */
function isSameCircularDependency(actual, expected) {
    if (actual.length !== expected.length) {
        return false;
    }
    for (let i = 0; i < actual.length; i++) {
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
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        const compareValue = a[i].localeCompare(b[i], 'en');
        if (compareValue !== 0) {
            return compareValue;
        }
    }
    // If all nodes are equal in the cycles, the order is based on the length of both cycles.
    return a.length - b.length;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQThCO0FBRzlCLCtDQUF3RDtBQUt4RDs7OztHQUlHO0FBQ0gsU0FBZ0IsNkJBQTZCLENBQUMsSUFBc0IsRUFBRSxPQUFlO0lBQ25GLE9BQU8sQ0FDTCxJQUFJO1NBQ0QsR0FBRztJQUNGLHFGQUFxRjtJQUNyRixtRkFBbUY7SUFDbkYsd0ZBQXdGO0lBQ3hGLGNBQWM7SUFDZCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ1IsMkJBQTJCLENBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUUsQ0FBQyx1Q0FBeUIsQ0FBQyxlQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDbEYsQ0FDSjtRQUNELHVGQUF1RjtRQUN2RixzRkFBc0Y7U0FDckYsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQ25DLENBQUM7QUFDSixDQUFDO0FBakJELHNFQWlCQztBQUVEOzs7R0FHRztBQUNILFNBQWdCLGNBQWMsQ0FBQyxNQUFjLEVBQUUsUUFBZ0I7SUFDN0QsTUFBTSxlQUFlLEdBQXlCLEVBQUUsQ0FBQztJQUNqRCxNQUFNLGlCQUFpQixHQUF5QixFQUFFLENBQUM7SUFDbkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQ25CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN6RCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDSCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3ZELGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO0FBQzlDLENBQUM7QUFkRCx3Q0FjQztBQUVEOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0JHO0FBQ0gsU0FBUywyQkFBMkIsQ0FBQyxJQUF3QjtJQUMzRCxJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1FBQ3BCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxJQUFJLGNBQWMsR0FBVyxDQUFDLENBQUM7SUFDL0IsSUFBSSxjQUFjLEdBQVcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBRXJDLGlFQUFpRTtJQUNqRSxrQ0FBa0M7SUFDbEMsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDcEMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RCLElBQUksS0FBSyxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELGNBQWMsR0FBRyxDQUFDLENBQUM7WUFDbkIsY0FBYyxHQUFHLEtBQUssQ0FBQztTQUN4QjtLQUNGO0lBRUQseUVBQXlFO0lBQ3pFLHdEQUF3RDtJQUN4RCxJQUFJLGNBQWMsS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUVELGtGQUFrRjtJQUNsRixvRkFBb0Y7SUFDcEYsb0ZBQW9GO0lBQ3BGLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDO0FBQzNFLENBQUM7QUFFRCxvRUFBb0U7QUFDcEUsU0FBUyx3QkFBd0IsQ0FBQyxNQUEwQixFQUFFLFFBQTRCO0lBQ3hGLElBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxRQUFRLENBQUMsTUFBTSxFQUFFO1FBQ3JDLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxLQUFLLENBQUM7U0FDZDtLQUNGO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx5QkFBeUIsQ0FBQyxDQUFxQixFQUFFLENBQXFCO0lBQzdFLG1GQUFtRjtJQUNuRixxRUFBcUU7SUFDckUsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDckQsTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcEQsSUFBSSxZQUFZLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO0tBQ0Y7SUFDRCx5RkFBeUY7SUFDekYsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3JlbGF0aXZlfSBmcm9tICdwYXRoJztcblxuaW1wb3J0IHtSZWZlcmVuY2VDaGFpbn0gZnJvbSAnLi9hbmFseXplcic7XG5pbXBvcnQge2NvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2h9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuXG5leHBvcnQgdHlwZSBDaXJjdWxhckRlcGVuZGVuY3kgPSBSZWZlcmVuY2VDaGFpbjxzdHJpbmc+O1xuZXhwb3J0IHR5cGUgR29sZGVuID0gQ2lyY3VsYXJEZXBlbmRlbmN5W107XG5cbi8qKlxuICogQ29udmVydHMgYSBsaXN0IG9mIHJlZmVyZW5jZSBjaGFpbnMgdG8gYSBKU09OLWNvbXBhdGlibGUgZ29sZGVuIG9iamVjdC4gUmVmZXJlbmNlIGNoYWluc1xuICogYnkgZGVmYXVsdCB1c2UgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZSBvYmplY3RzLiBJbiBvcmRlciB0byBtYWtlIHRob3NlIGNoYWlucyBwcmludGFibGUsXG4gKiB0aGUgc291cmNlIGZpbGUgb2JqZWN0cyBhcmUgbWFwcGVkIHRvIHRoZWlyIHJlbGF0aXZlIGZpbGUgbmFtZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0UmVmZXJlbmNlQ2hhaW5Ub0dvbGRlbihyZWZzOiBSZWZlcmVuY2VDaGFpbltdLCBiYXNlRGlyOiBzdHJpbmcpOiBHb2xkZW4ge1xuICByZXR1cm4gKFxuICAgIHJlZnNcbiAgICAgIC5tYXAoXG4gICAgICAgIC8vIE5vcm1hbGl6ZSBjeWNsZXMgYXMgdGhlIHBhdGhzIGNhbiB2YXJ5IGJhc2VkIG9uIHdoaWNoIG5vZGUgaW4gdGhlIGN5Y2xlIGlzIHZpc2l0ZWRcbiAgICAgICAgLy8gZmlyc3QgaW4gdGhlIGFuYWx5emVyLiBUaGUgcGF0aHMgcmVwcmVzZW50IGN5Y2xlcy4gSGVuY2Ugd2UgY2FuIHNoaWZ0IG5vZGVzIGluIGFcbiAgICAgICAgLy8gZGV0ZXJtaW5pc3RpYyB3YXkgc28gdGhhdCB0aGUgZ29sZGVucyBkb24ndCBjaGFuZ2UgdW5uZWNlc3NhcmlseSBhbmQgY3ljbGUgY29tcGFyaXNvblxuICAgICAgICAvLyBpcyBzaW1wbGVyLlxuICAgICAgICAoY2hhaW4pID0+XG4gICAgICAgICAgbm9ybWFsaXplQ2lyY3VsYXJEZXBlbmRlbmN5KFxuICAgICAgICAgICAgY2hhaW4ubWFwKCh7ZmlsZU5hbWV9KSA9PiBjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNoKHJlbGF0aXZlKGJhc2VEaXIsIGZpbGVOYW1lKSkpLFxuICAgICAgICAgICksXG4gICAgICApXG4gICAgICAvLyBTb3J0IGN5Y2xlcyBzbyB0aGF0IHRoZSBnb2xkZW4gZG9lc24ndCBjaGFuZ2UgdW5uZWNlc3NhcmlseSB3aGVuIGN5Y2xlcyBhcmUgZGV0ZWN0ZWRcbiAgICAgIC8vIGluIGRpZmZlcmVudCBvcmRlciAoZS5nLiBuZXcgaW1wb3J0cyBjYXVzZSBjeWNsZXMgdG8gYmUgZGV0ZWN0ZWQgZWFybGllciBvciBsYXRlcikuXG4gICAgICAuc29ydChjb21wYXJlQ2lyY3VsYXJEZXBlbmRlbmN5KVxuICApO1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBzcGVjaWZpZWQgZ29sZGVucyBhbmQgcmV0dXJucyB0d28gbGlzdHMgdGhhdCBkZXNjcmliZSBuZXdseVxuICogYWRkZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLCBvciBmaXhlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb21wYXJlR29sZGVucyhhY3R1YWw6IEdvbGRlbiwgZXhwZWN0ZWQ6IEdvbGRlbikge1xuICBjb25zdCBuZXdDaXJjdWxhckRlcHM6IENpcmN1bGFyRGVwZW5kZW5jeVtdID0gW107XG4gIGNvbnN0IGZpeGVkQ2lyY3VsYXJEZXBzOiBDaXJjdWxhckRlcGVuZGVuY3lbXSA9IFtdO1xuICBhY3R1YWwuZm9yRWFjaCgoYSkgPT4ge1xuICAgIGlmICghZXhwZWN0ZWQuZmluZCgoZSkgPT4gaXNTYW1lQ2lyY3VsYXJEZXBlbmRlbmN5KGEsIGUpKSkge1xuICAgICAgbmV3Q2lyY3VsYXJEZXBzLnB1c2goYSk7XG4gICAgfVxuICB9KTtcbiAgZXhwZWN0ZWQuZm9yRWFjaCgoZSkgPT4ge1xuICAgIGlmICghYWN0dWFsLmZpbmQoKGEpID0+IGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShlLCBhKSkpIHtcbiAgICAgIGZpeGVkQ2lyY3VsYXJEZXBzLnB1c2goZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtuZXdDaXJjdWxhckRlcHMsIGZpeGVkQ2lyY3VsYXJEZXBzfTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIHRoZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgZW5zdXJpbmcgdGhhdCB0aGUgcGF0aCBzdGFydHMgd2l0aCB0aGUgZmlyc3RcbiAqIG5vZGUgaW4gYWxwaGFiZXRpY2FsIG9yZGVyLiBTaW5jZSB0aGUgcGF0aCBhcnJheSByZXByZXNlbnRzIGEgY3ljbGUsIHdlIGNhbiBtYWtlIGFcbiAqIHNwZWNpZmljIG5vZGUgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHBhdGggdGhhdCByZXByZXNlbnRzIHRoZSBjeWNsZS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBoZWxwZnVsIGJlY2F1c2UgdGhlIHBhdGggb2YgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGNoYW5nZXMgYmFzZWQgb24gd2hpY2hcbiAqIGZpbGUgaW4gdGhlIHBhdGggaGFzIGJlZW4gdmlzaXRlZCBmaXJzdCBieSB0aGUgYW5hbHl6ZXIuIGUuZy4gQXNzdW1lIHdlIGhhdmUgYSBjaXJjdWxhclxuICogZGVwZW5kZW5jeSByZXByZXNlbnRlZCBhczogYEEgLT4gQiAtPiBDYC4gVGhlIGFuYWx5emVyIHdpbGwgZGV0ZWN0IHRoaXMgY3ljbGUgd2hlbiBpdFxuICogdmlzaXRzIGBBYC4gVGhvdWdoIHdoZW4gYSBzb3VyY2UgZmlsZSB0aGF0IGlzIGFuYWx5emVkIGJlZm9yZSBgQWAgc3RhcnRzIGltcG9ydGluZyBgQmAsXG4gKiB0aGUgY3ljbGUgcGF0aCB3aWxsIGRldGVjdGVkIGFzIGBCIC0+IEMgLT4gQWAuIFRoaXMgcmVwcmVzZW50cyB0aGUgc2FtZSBjeWNsZSwgYnV0IGlzIGp1c3RcbiAqIGRpZmZlcmVudCBkdWUgdG8gYSBsaW1pdGF0aW9uIG9mIHVzaW5nIGEgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBjYW4gYmUgd3JpdHRlbiB0byBhIHRleHQtYmFzZWRcbiAqIGdvbGRlbiBmaWxlLlxuICpcbiAqIFRvIGFjY291bnQgZm9yIHRoaXMgbm9uLWRldGVybWluaXN0aWMgYmVoYXZpb3IgaW4gZ29sZGVucywgd2Ugc2hpZnQgdGhlIGNpcmN1bGFyXG4gKiBkZXBlbmRlbmN5IHBhdGggdG8gdGhlIGZpcnN0IG5vZGUgYmFzZWQgb24gYWxwaGFiZXRpY2FsIG9yZGVyLiBlLmcuIGBBYCB3aWxsIGFsd2F5c1xuICogYmUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIHBhdGggdGhhdCByZXByZXNlbnRzIHRoZSBjeWNsZS5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplQ2lyY3VsYXJEZXBlbmRlbmN5KHBhdGg6IENpcmN1bGFyRGVwZW5kZW5jeSk6IENpcmN1bGFyRGVwZW5kZW5jeSB7XG4gIGlmIChwYXRoLmxlbmd0aCA8PSAxKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBsZXQgaW5kZXhGaXJzdE5vZGU6IG51bWJlciA9IDA7XG4gIGxldCB2YWx1ZUZpcnN0Tm9kZTogc3RyaW5nID0gcGF0aFswXTtcblxuICAvLyBGaW5kIGEgbm9kZSBpbiB0aGUgY3ljbGUgcGF0aCB0aGF0IHByZWNlZGVzIGFsbCBvdGhlciBlbGVtZW50c1xuICAvLyBpbiB0ZXJtcyBvZiBhbHBoYWJldGljYWwgb3JkZXIuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbHVlID0gcGF0aFtpXTtcbiAgICBpZiAodmFsdWUubG9jYWxlQ29tcGFyZSh2YWx1ZUZpcnN0Tm9kZSwgJ2VuJykgPCAwKSB7XG4gICAgICBpbmRleEZpcnN0Tm9kZSA9IGk7XG4gICAgICB2YWx1ZUZpcnN0Tm9kZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBhbHBoYWJldGljYWxseSBmaXJzdCBub2RlIGlzIGFscmVhZHkgYXQgc3RhcnQgb2YgdGhlIHBhdGgsIGp1c3RcbiAgLy8gcmV0dXJuIHRoZSBhY3R1YWwgcGF0aCBhcyBubyBjaGFuZ2VzIG5lZWQgdG8gYmUgbWFkZS5cbiAgaWYgKGluZGV4Rmlyc3ROb2RlID09PSAwKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICAvLyBNb3ZlIHRoZSBkZXRlcm1pbmVkIGZpcnN0IG5vZGUgKGFzIG9mIGFscGhhYmV0aWNhbCBvcmRlcikgdG8gdGhlIHN0YXJ0IG9mIGEgbmV3XG4gIC8vIHBhdGggYXJyYXkuIFRoZSBub2RlcyBiZWZvcmUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIG9sZCBwYXRoIGFyZSB0aGVuIGNvbmNhdGVuYXRlZFxuICAvLyB0byB0aGUgZW5kIG9mIHRoZSBuZXcgcGF0aC4gVGhpcyBpcyBwb3NzaWJsZSBiZWNhdXNlIHRoZSBwYXRoIHJlcHJlc2VudHMgYSBjeWNsZS5cbiAgcmV0dXJuIFsuLi5wYXRoLnNsaWNlKGluZGV4Rmlyc3ROb2RlKSwgLi4ucGF0aC5zbGljZSgwLCBpbmRleEZpcnN0Tm9kZSldO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYXJlIGVxdWFsLiAqL1xuZnVuY3Rpb24gaXNTYW1lQ2lyY3VsYXJEZXBlbmRlbmN5KGFjdHVhbDogQ2lyY3VsYXJEZXBlbmRlbmN5LCBleHBlY3RlZDogQ2lyY3VsYXJEZXBlbmRlbmN5KSB7XG4gIGlmIChhY3R1YWwubGVuZ3RoICE9PSBleHBlY3RlZC5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGJ5IHJlc3BlY3RpbmcgdGhlIGFscGhhYmV0aWMgb3JkZXIgb2Ygbm9kZXMgaW4gdGhlXG4gKiBjeWNsZSBwYXRocy4gVGhlIGZpcnN0IG5vZGVzIHdoaWNoIGRvbid0IG1hdGNoIGluIGJvdGggcGF0aHMgYXJlIGRlY2lzaXZlIG9uIHRoZSBvcmRlci5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZUNpcmN1bGFyRGVwZW5kZW5jeShhOiBDaXJjdWxhckRlcGVuZGVuY3ksIGI6IENpcmN1bGFyRGVwZW5kZW5jeSk6IG51bWJlciB7XG4gIC8vIEdvIHRocm91Z2ggbm9kZXMgaW4gYm90aCBjeWNsZSBwYXRocyBhbmQgZGV0ZXJtaW5lIHdoZXRoZXIgYGFgIHNob3VsZCBiZSBvcmRlcmVkXG4gIC8vIGJlZm9yZSBgYmAuIFRoZSBmaXJzdCBub2RlcyB3aGljaCBkb24ndCBtYXRjaCBkZWNpZGUgb24gdGhlIG9yZGVyLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aCk7IGkrKykge1xuICAgIGNvbnN0IGNvbXBhcmVWYWx1ZSA9IGFbaV0ubG9jYWxlQ29tcGFyZShiW2ldLCAnZW4nKTtcbiAgICBpZiAoY29tcGFyZVZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gY29tcGFyZVZhbHVlO1xuICAgIH1cbiAgfVxuICAvLyBJZiBhbGwgbm9kZXMgYXJlIGVxdWFsIGluIHRoZSBjeWNsZXMsIHRoZSBvcmRlciBpcyBiYXNlZCBvbiB0aGUgbGVuZ3RoIG9mIGJvdGggY3ljbGVzLlxuICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbn1cbiJdfQ==