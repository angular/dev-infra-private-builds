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
    (chain) => normalizeCircularDependency(chain.map(({ fileName }) => (0, file_system_1.convertPathToForwardSlash)((0, path_1.relative)(baseDir, fileName)))))
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsK0JBQThCO0FBRzlCLCtDQUF3RDtBQUt4RDs7OztHQUlHO0FBQ0gsU0FBZ0IsNkJBQTZCLENBQUMsSUFBc0IsRUFBRSxPQUFlO0lBQ25GLE9BQU8sQ0FDTCxJQUFJO1NBQ0QsR0FBRztJQUNGLHFGQUFxRjtJQUNyRixtRkFBbUY7SUFDbkYsd0ZBQXdGO0lBQ3hGLGNBQWM7SUFDZCxDQUFDLEtBQUssRUFBRSxFQUFFLENBQ1IsMkJBQTJCLENBQ3pCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUUsQ0FBQyxJQUFBLHVDQUF5QixFQUFDLElBQUEsZUFBUSxFQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQ2xGLENBQ0o7UUFDRCx1RkFBdUY7UUFDdkYsc0ZBQXNGO1NBQ3JGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUNuQyxDQUFDO0FBQ0osQ0FBQztBQWpCRCxzRUFpQkM7QUFFRDs7O0dBR0c7QUFDSCxTQUFnQixjQUFjLENBQUMsTUFBYyxFQUFFLFFBQWdCO0lBQzdELE1BQU0sZUFBZSxHQUF5QixFQUFFLENBQUM7SUFDakQsTUFBTSxpQkFBaUIsR0FBeUIsRUFBRSxDQUFDO0lBQ25ELE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtRQUNuQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDekQsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QjtJQUNILENBQUMsQ0FB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biAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWxhdGl2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNofSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcblxuZXhwb3J0IHR5cGUgQ2lyY3VsYXJEZXBlbmRlbmN5ID0gUmVmZXJlbmNlQ2hhaW48c3RyaW5nPjtcbmV4cG9ydCB0eXBlIEdvbGRlbiA9IENpcmN1bGFyRGVwZW5kZW5jeVtdO1xuXG4vKipcbiAqIENvbnZlcnRzIGEgbGlzdCBvZiByZWZlcmVuY2UgY2hhaW5zIHRvIGEgSlNPTi1jb21wYXRpYmxlIGdvbGRlbiBvYmplY3QuIFJlZmVyZW5jZSBjaGFpbnNcbiAqIGJ5IGRlZmF1bHQgdXNlIFR5cGVTY3JpcHQgc291cmNlIGZpbGUgb2JqZWN0cy4gSW4gb3JkZXIgdG8gbWFrZSB0aG9zZSBjaGFpbnMgcHJpbnRhYmxlLFxuICogdGhlIHNvdXJjZSBmaWxlIG9iamVjdHMgYXJlIG1hcHBlZCB0byB0aGVpciByZWxhdGl2ZSBmaWxlIG5hbWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4ocmVmczogUmVmZXJlbmNlQ2hhaW5bXSwgYmFzZURpcjogc3RyaW5nKTogR29sZGVuIHtcbiAgcmV0dXJuIChcbiAgICByZWZzXG4gICAgICAubWFwKFxuICAgICAgICAvLyBOb3JtYWxpemUgY3ljbGVzIGFzIHRoZSBwYXRocyBjYW4gdmFyeSBiYXNlZCBvbiB3aGljaCBub2RlIGluIHRoZSBjeWNsZSBpcyB2aXNpdGVkXG4gICAgICAgIC8vIGZpcnN0IGluIHRoZSBhbmFseXplci4gVGhlIHBhdGhzIHJlcHJlc2VudCBjeWNsZXMuIEhlbmNlIHdlIGNhbiBzaGlmdCBub2RlcyBpbiBhXG4gICAgICAgIC8vIGRldGVybWluaXN0aWMgd2F5IHNvIHRoYXQgdGhlIGdvbGRlbnMgZG9uJ3QgY2hhbmdlIHVubmVjZXNzYXJpbHkgYW5kIGN5Y2xlIGNvbXBhcmlzb25cbiAgICAgICAgLy8gaXMgc2ltcGxlci5cbiAgICAgICAgKGNoYWluKSA9PlxuICAgICAgICAgIG5vcm1hbGl6ZUNpcmN1bGFyRGVwZW5kZW5jeShcbiAgICAgICAgICAgIGNoYWluLm1hcCgoe2ZpbGVOYW1lfSkgPT4gY29udmVydFBhdGhUb0ZvcndhcmRTbGFzaChyZWxhdGl2ZShiYXNlRGlyLCBmaWxlTmFtZSkpKSxcbiAgICAgICAgICApLFxuICAgICAgKVxuICAgICAgLy8gU29ydCBjeWNsZXMgc28gdGhhdCB0aGUgZ29sZGVuIGRvZXNuJ3QgY2hhbmdlIHVubmVjZXNzYXJpbHkgd2hlbiBjeWNsZXMgYXJlIGRldGVjdGVkXG4gICAgICAvLyBpbiBkaWZmZXJlbnQgb3JkZXIgKGUuZy4gbmV3IGltcG9ydHMgY2F1c2UgY3ljbGVzIHRvIGJlIGRldGVjdGVkIGVhcmxpZXIgb3IgbGF0ZXIpLlxuICAgICAgLnNvcnQoY29tcGFyZUNpcmN1bGFyRGVwZW5kZW5jeSlcbiAgKTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgc3BlY2lmaWVkIGdvbGRlbnMgYW5kIHJldHVybnMgdHdvIGxpc3RzIHRoYXQgZGVzY3JpYmUgbmV3bHlcbiAqIGFkZGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcywgb3IgZml4ZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tcGFyZUdvbGRlbnMoYWN0dWFsOiBHb2xkZW4sIGV4cGVjdGVkOiBHb2xkZW4pIHtcbiAgY29uc3QgbmV3Q2lyY3VsYXJEZXBzOiBDaXJjdWxhckRlcGVuZGVuY3lbXSA9IFtdO1xuICBjb25zdCBmaXhlZENpcmN1bGFyRGVwczogQ2lyY3VsYXJEZXBlbmRlbmN5W10gPSBbXTtcbiAgYWN0dWFsLmZvckVhY2goKGEpID0+IHtcbiAgICBpZiAoIWV4cGVjdGVkLmZpbmQoKGUpID0+IGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShhLCBlKSkpIHtcbiAgICAgIG5ld0NpcmN1bGFyRGVwcy5wdXNoKGEpO1xuICAgIH1cbiAgfSk7XG4gIGV4cGVjdGVkLmZvckVhY2goKGUpID0+IHtcbiAgICBpZiAoIWFjdHVhbC5maW5kKChhKSA9PiBpc1NhbWVDaXJjdWxhckRlcGVuZGVuY3koZSwgYSkpKSB7XG4gICAgICBmaXhlZENpcmN1bGFyRGVwcy5wdXNoKGUpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiB7bmV3Q2lyY3VsYXJEZXBzLCBmaXhlZENpcmN1bGFyRGVwc307XG59XG5cbi8qKlxuICogTm9ybWFsaXplcyB0aGUgYSBjaXJjdWxhciBkZXBlbmRlbmN5IGJ5IGVuc3VyaW5nIHRoYXQgdGhlIHBhdGggc3RhcnRzIHdpdGggdGhlIGZpcnN0XG4gKiBub2RlIGluIGFscGhhYmV0aWNhbCBvcmRlci4gU2luY2UgdGhlIHBhdGggYXJyYXkgcmVwcmVzZW50cyBhIGN5Y2xlLCB3ZSBjYW4gbWFrZSBhXG4gKiBzcGVjaWZpYyBub2RlIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBwYXRoIHRoYXQgcmVwcmVzZW50cyB0aGUgY3ljbGUuXG4gKlxuICogVGhpcyBtZXRob2QgaXMgaGVscGZ1bCBiZWNhdXNlIHRoZSBwYXRoIG9mIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBjaGFuZ2VzIGJhc2VkIG9uIHdoaWNoXG4gKiBmaWxlIGluIHRoZSBwYXRoIGhhcyBiZWVuIHZpc2l0ZWQgZmlyc3QgYnkgdGhlIGFuYWx5emVyLiBlLmcuIEFzc3VtZSB3ZSBoYXZlIGEgY2lyY3VsYXJcbiAqIGRlcGVuZGVuY3kgcmVwcmVzZW50ZWQgYXM6IGBBIC0+IEIgLT4gQ2AuIFRoZSBhbmFseXplciB3aWxsIGRldGVjdCB0aGlzIGN5Y2xlIHdoZW4gaXRcbiAqIHZpc2l0cyBgQWAuIFRob3VnaCB3aGVuIGEgc291cmNlIGZpbGUgdGhhdCBpcyBhbmFseXplZCBiZWZvcmUgYEFgIHN0YXJ0cyBpbXBvcnRpbmcgYEJgLFxuICogdGhlIGN5Y2xlIHBhdGggd2lsbCBkZXRlY3RlZCBhcyBgQiAtPiBDIC0+IEFgLiBUaGlzIHJlcHJlc2VudHMgdGhlIHNhbWUgY3ljbGUsIGJ1dCBpcyBqdXN0XG4gKiBkaWZmZXJlbnQgZHVlIHRvIGEgbGltaXRhdGlvbiBvZiB1c2luZyBhIGRhdGEgc3RydWN0dXJlIHRoYXQgY2FuIGJlIHdyaXR0ZW4gdG8gYSB0ZXh0LWJhc2VkXG4gKiBnb2xkZW4gZmlsZS5cbiAqXG4gKiBUbyBhY2NvdW50IGZvciB0aGlzIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yIGluIGdvbGRlbnMsIHdlIHNoaWZ0IHRoZSBjaXJjdWxhclxuICogZGVwZW5kZW5jeSBwYXRoIHRvIHRoZSBmaXJzdCBub2RlIGJhc2VkIG9uIGFscGhhYmV0aWNhbCBvcmRlci4gZS5nLiBgQWAgd2lsbCBhbHdheXNcbiAqIGJlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBwYXRoIHRoYXQgcmVwcmVzZW50cyB0aGUgY3ljbGUuXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNpcmN1bGFyRGVwZW5kZW5jeShwYXRoOiBDaXJjdWxhckRlcGVuZGVuY3kpOiBDaXJjdWxhckRlcGVuZGVuY3kge1xuICBpZiAocGF0aC5sZW5ndGggPD0gMSkge1xuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgbGV0IGluZGV4Rmlyc3ROb2RlOiBudW1iZXIgPSAwO1xuICBsZXQgdmFsdWVGaXJzdE5vZGU6IHN0cmluZyA9IHBhdGhbMF07XG5cbiAgLy8gRmluZCBhIG5vZGUgaW4gdGhlIGN5Y2xlIHBhdGggdGhhdCBwcmVjZWRlcyBhbGwgb3RoZXIgZWxlbWVudHNcbiAgLy8gaW4gdGVybXMgb2YgYWxwaGFiZXRpY2FsIG9yZGVyLlxuICBmb3IgKGxldCBpID0gMTsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB2YWx1ZSA9IHBhdGhbaV07XG4gICAgaWYgKHZhbHVlLmxvY2FsZUNvbXBhcmUodmFsdWVGaXJzdE5vZGUsICdlbicpIDwgMCkge1xuICAgICAgaW5kZXhGaXJzdE5vZGUgPSBpO1xuICAgICAgdmFsdWVGaXJzdE5vZGUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgYWxwaGFiZXRpY2FsbHkgZmlyc3Qgbm9kZSBpcyBhbHJlYWR5IGF0IHN0YXJ0IG9mIHRoZSBwYXRoLCBqdXN0XG4gIC8vIHJldHVybiB0aGUgYWN0dWFsIHBhdGggYXMgbm8gY2hhbmdlcyBuZWVkIHRvIGJlIG1hZGUuXG4gIGlmIChpbmRleEZpcnN0Tm9kZSA9PT0gMCkge1xuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgLy8gTW92ZSB0aGUgZGV0ZXJtaW5lZCBmaXJzdCBub2RlIChhcyBvZiBhbHBoYWJldGljYWwgb3JkZXIpIHRvIHRoZSBzdGFydCBvZiBhIG5ld1xuICAvLyBwYXRoIGFycmF5LiBUaGUgbm9kZXMgYmVmb3JlIHRoZSBmaXJzdCBub2RlIGluIHRoZSBvbGQgcGF0aCBhcmUgdGhlbiBjb25jYXRlbmF0ZWRcbiAgLy8gdG8gdGhlIGVuZCBvZiB0aGUgbmV3IHBhdGguIFRoaXMgaXMgcG9zc2libGUgYmVjYXVzZSB0aGUgcGF0aCByZXByZXNlbnRzIGEgY3ljbGUuXG4gIHJldHVybiBbLi4ucGF0aC5zbGljZShpbmRleEZpcnN0Tm9kZSksIC4uLnBhdGguc2xpY2UoMCwgaW5kZXhGaXJzdE5vZGUpXTtcbn1cblxuLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGFyZSBlcXVhbC4gKi9cbmZ1bmN0aW9uIGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShhY3R1YWw6IENpcmN1bGFyRGVwZW5kZW5jeSwgZXhwZWN0ZWQ6IENpcmN1bGFyRGVwZW5kZW5jeSkge1xuICBpZiAoYWN0dWFsLmxlbmd0aCAhPT0gZXhwZWN0ZWQubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYWN0dWFsLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdHdvIGNpcmN1bGFyIGRlcGVuZGVuY2llcyBieSByZXNwZWN0aW5nIHRoZSBhbHBoYWJldGljIG9yZGVyIG9mIG5vZGVzIGluIHRoZVxuICogY3ljbGUgcGF0aHMuIFRoZSBmaXJzdCBub2RlcyB3aGljaCBkb24ndCBtYXRjaCBpbiBib3RoIHBhdGhzIGFyZSBkZWNpc2l2ZSBvbiB0aGUgb3JkZXIuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVDaXJjdWxhckRlcGVuZGVuY3koYTogQ2lyY3VsYXJEZXBlbmRlbmN5LCBiOiBDaXJjdWxhckRlcGVuZGVuY3kpOiBudW1iZXIge1xuICAvLyBHbyB0aHJvdWdoIG5vZGVzIGluIGJvdGggY3ljbGUgcGF0aHMgYW5kIGRldGVybWluZSB3aGV0aGVyIGBhYCBzaG91bGQgYmUgb3JkZXJlZFxuICAvLyBiZWZvcmUgYGJgLiBUaGUgZmlyc3Qgbm9kZXMgd2hpY2ggZG9uJ3QgbWF0Y2ggZGVjaWRlIG9uIHRoZSBvcmRlci5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpOyBpKyspIHtcbiAgICBjb25zdCBjb21wYXJlVmFsdWUgPSBhW2ldLmxvY2FsZUNvbXBhcmUoYltpXSwgJ2VuJyk7XG4gICAgaWYgKGNvbXBhcmVWYWx1ZSAhPT0gMCkge1xuICAgICAgcmV0dXJuIGNvbXBhcmVWYWx1ZTtcbiAgICB9XG4gIH1cbiAgLy8gSWYgYWxsIG5vZGVzIGFyZSBlcXVhbCBpbiB0aGUgY3ljbGVzLCB0aGUgb3JkZXIgaXMgYmFzZWQgb24gdGhlIGxlbmd0aCBvZiBib3RoIGN5Y2xlcy5cbiAgcmV0dXJuIGEubGVuZ3RoIC0gYi5sZW5ndGg7XG59XG4iXX0=