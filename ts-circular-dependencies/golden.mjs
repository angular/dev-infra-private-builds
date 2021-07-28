/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { relative } from 'path';
import { convertPathToForwardSlash } from './file_system';
/**
 * Converts a list of reference chains to a JSON-compatible golden object. Reference chains
 * by default use TypeScript source file objects. In order to make those chains printable,
 * the source file objects are mapped to their relative file names.
 */
export function convertReferenceChainToGolden(refs, baseDir) {
    return refs
        .map(
    // Normalize cycles as the paths can vary based on which node in the cycle is visited
    // first in the analyzer. The paths represent cycles. Hence we can shift nodes in a
    // deterministic way so that the goldens don't change unnecessarily and cycle comparison
    // is simpler.
    chain => normalizeCircularDependency(chain.map(({ fileName }) => convertPathToForwardSlash(relative(baseDir, fileName)))))
        // Sort cycles so that the golden doesn't change unnecessarily when cycles are detected
        // in different order (e.g. new imports cause cycles to be detected earlier or later).
        .sort(compareCircularDependency);
}
/**
 * Compares the specified goldens and returns two lists that describe newly
 * added circular dependencies, or fixed circular dependencies.
 */
export function compareGoldens(actual, expected) {
    const newCircularDeps = [];
    const fixedCircularDeps = [];
    actual.forEach(a => {
        if (!expected.find(e => isSameCircularDependency(a, e))) {
            newCircularDeps.push(a);
        }
    });
    expected.forEach(e => {
        if (!actual.find(a => isSameCircularDependency(e, a))) {
            fixedCircularDeps.push(e);
        }
    });
    return { newCircularDeps, fixedCircularDeps };
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ29sZGVuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9nb2xkZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUc5QixPQUFPLEVBQUMseUJBQXlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFLeEQ7Ozs7R0FJRztBQUNILE1BQU0sVUFBVSw2QkFBNkIsQ0FBQyxJQUFzQixFQUFFLE9BQWU7SUFDbkYsT0FBTyxJQUFJO1NBQ04sR0FBRztJQUNBLHFGQUFxRjtJQUNyRixtRkFBbUY7SUFDbkYsd0ZBQXdGO0lBQ3hGLGNBQWM7SUFDZCxLQUFLLENBQUMsRUFBRSxDQUFDLDJCQUEyQixDQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxRQUFRLEVBQUMsRUFBRSxFQUFFLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRix1RkFBdUY7UUFDdkYsc0ZBQXNGO1NBQ3JGLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLE1BQWMsRUFBRSxRQUFnQjtJQUM3RCxNQUFNLGVBQWUsR0FBeUIsRUFBRSxDQUFDO0lBQ2pELE1BQU0saUJBQWlCLEdBQXlCLEVBQUUsQ0FBQztJQUNuRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO1FBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdkQsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN6QjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNuQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLHdCQUF3QixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3JELGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzQjtJQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxFQUFDLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxDQUFDO0FBQzlDLENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFNBQVMsMkJBQTJCLENBQUMsSUFBd0I7SUFDM0QsSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsRUFBRTtRQUNwQixPQUFPLElBQUksQ0FBQztLQUNiO0lBRUQsSUFBSSxjQUFjLEdBQVcsQ0FBQyxDQUFDO0lBQy9CLElBQUksY0FBYyxHQUFXLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUVyQyxpRUFBaUU7SUFDakUsa0NBQWtDO0lBQ2xDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QixJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqRCxjQUFjLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLGNBQWMsR0FBRyxLQUFLLENBQUM7U0FDeEI7S0FDRjtJQUVELHlFQUF5RTtJQUN6RSx3REFBd0Q7SUFDeEQsSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFO1FBQ3hCLE9BQU8sSUFBSSxDQUFDO0tBQ2I7SUFFRCxrRkFBa0Y7SUFDbEYsb0ZBQW9GO0lBQ3BGLG9GQUFvRjtJQUNwRixPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsY0FBYyxDQUFDLENBQUMsQ0FBQztBQUMzRSxDQUFDO0FBRUQsb0VBQW9FO0FBQ3BFLFNBQVMsd0JBQXdCLENBQUMsTUFBMEIsRUFBRSxRQUE0QjtJQUN4RixJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUNyQyxPQUFPLEtBQUssQ0FBQztLQUNkO0lBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDdEMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzdCLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7S0FDRjtJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsQ0FBcUIsRUFBRSxDQUFxQjtJQUM3RSxtRkFBbUY7SUFDbkYscUVBQXFFO0lBQ3JFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3JELE1BQU0sWUFBWSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BELElBQUksWUFBWSxLQUFLLENBQUMsRUFBRTtZQUN0QixPQUFPLFlBQVksQ0FBQztTQUNyQjtLQUNGO0lBQ0QseUZBQXlGO0lBQ3pGLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzdCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWxhdGl2ZX0gZnJvbSAncGF0aCc7XG5cbmltcG9ydCB7UmVmZXJlbmNlQ2hhaW59IGZyb20gJy4vYW5hbHl6ZXInO1xuaW1wb3J0IHtjb252ZXJ0UGF0aFRvRm9yd2FyZFNsYXNofSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcblxuZXhwb3J0IHR5cGUgQ2lyY3VsYXJEZXBlbmRlbmN5ID0gUmVmZXJlbmNlQ2hhaW48c3RyaW5nPjtcbmV4cG9ydCB0eXBlIEdvbGRlbiA9IENpcmN1bGFyRGVwZW5kZW5jeVtdO1xuXG4vKipcbiAqIENvbnZlcnRzIGEgbGlzdCBvZiByZWZlcmVuY2UgY2hhaW5zIHRvIGEgSlNPTi1jb21wYXRpYmxlIGdvbGRlbiBvYmplY3QuIFJlZmVyZW5jZSBjaGFpbnNcbiAqIGJ5IGRlZmF1bHQgdXNlIFR5cGVTY3JpcHQgc291cmNlIGZpbGUgb2JqZWN0cy4gSW4gb3JkZXIgdG8gbWFrZSB0aG9zZSBjaGFpbnMgcHJpbnRhYmxlLFxuICogdGhlIHNvdXJjZSBmaWxlIG9iamVjdHMgYXJlIG1hcHBlZCB0byB0aGVpciByZWxhdGl2ZSBmaWxlIG5hbWVzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydFJlZmVyZW5jZUNoYWluVG9Hb2xkZW4ocmVmczogUmVmZXJlbmNlQ2hhaW5bXSwgYmFzZURpcjogc3RyaW5nKTogR29sZGVuIHtcbiAgcmV0dXJuIHJlZnNcbiAgICAgIC5tYXAoXG4gICAgICAgICAgLy8gTm9ybWFsaXplIGN5Y2xlcyBhcyB0aGUgcGF0aHMgY2FuIHZhcnkgYmFzZWQgb24gd2hpY2ggbm9kZSBpbiB0aGUgY3ljbGUgaXMgdmlzaXRlZFxuICAgICAgICAgIC8vIGZpcnN0IGluIHRoZSBhbmFseXplci4gVGhlIHBhdGhzIHJlcHJlc2VudCBjeWNsZXMuIEhlbmNlIHdlIGNhbiBzaGlmdCBub2RlcyBpbiBhXG4gICAgICAgICAgLy8gZGV0ZXJtaW5pc3RpYyB3YXkgc28gdGhhdCB0aGUgZ29sZGVucyBkb24ndCBjaGFuZ2UgdW5uZWNlc3NhcmlseSBhbmQgY3ljbGUgY29tcGFyaXNvblxuICAgICAgICAgIC8vIGlzIHNpbXBsZXIuXG4gICAgICAgICAgY2hhaW4gPT4gbm9ybWFsaXplQ2lyY3VsYXJEZXBlbmRlbmN5KFxuICAgICAgICAgICAgICBjaGFpbi5tYXAoKHtmaWxlTmFtZX0pID0+IGNvbnZlcnRQYXRoVG9Gb3J3YXJkU2xhc2gocmVsYXRpdmUoYmFzZURpciwgZmlsZU5hbWUpKSkpKVxuICAgICAgLy8gU29ydCBjeWNsZXMgc28gdGhhdCB0aGUgZ29sZGVuIGRvZXNuJ3QgY2hhbmdlIHVubmVjZXNzYXJpbHkgd2hlbiBjeWNsZXMgYXJlIGRldGVjdGVkXG4gICAgICAvLyBpbiBkaWZmZXJlbnQgb3JkZXIgKGUuZy4gbmV3IGltcG9ydHMgY2F1c2UgY3ljbGVzIHRvIGJlIGRldGVjdGVkIGVhcmxpZXIgb3IgbGF0ZXIpLlxuICAgICAgLnNvcnQoY29tcGFyZUNpcmN1bGFyRGVwZW5kZW5jeSk7XG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIHNwZWNpZmllZCBnb2xkZW5zIGFuZCByZXR1cm5zIHR3byBsaXN0cyB0aGF0IGRlc2NyaWJlIG5ld2x5XG4gKiBhZGRlZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMsIG9yIGZpeGVkIGNpcmN1bGFyIGRlcGVuZGVuY2llcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBhcmVHb2xkZW5zKGFjdHVhbDogR29sZGVuLCBleHBlY3RlZDogR29sZGVuKSB7XG4gIGNvbnN0IG5ld0NpcmN1bGFyRGVwczogQ2lyY3VsYXJEZXBlbmRlbmN5W10gPSBbXTtcbiAgY29uc3QgZml4ZWRDaXJjdWxhckRlcHM6IENpcmN1bGFyRGVwZW5kZW5jeVtdID0gW107XG4gIGFjdHVhbC5mb3JFYWNoKGEgPT4ge1xuICAgIGlmICghZXhwZWN0ZWQuZmluZChlID0+IGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShhLCBlKSkpIHtcbiAgICAgIG5ld0NpcmN1bGFyRGVwcy5wdXNoKGEpO1xuICAgIH1cbiAgfSk7XG4gIGV4cGVjdGVkLmZvckVhY2goZSA9PiB7XG4gICAgaWYgKCFhY3R1YWwuZmluZChhID0+IGlzU2FtZUNpcmN1bGFyRGVwZW5kZW5jeShlLCBhKSkpIHtcbiAgICAgIGZpeGVkQ2lyY3VsYXJEZXBzLnB1c2goZSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtuZXdDaXJjdWxhckRlcHMsIGZpeGVkQ2lyY3VsYXJEZXBzfTtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemVzIHRoZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYnkgZW5zdXJpbmcgdGhhdCB0aGUgcGF0aCBzdGFydHMgd2l0aCB0aGUgZmlyc3RcbiAqIG5vZGUgaW4gYWxwaGFiZXRpY2FsIG9yZGVyLiBTaW5jZSB0aGUgcGF0aCBhcnJheSByZXByZXNlbnRzIGEgY3ljbGUsIHdlIGNhbiBtYWtlIGFcbiAqIHNwZWNpZmljIG5vZGUgdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHBhdGggdGhhdCByZXByZXNlbnRzIHRoZSBjeWNsZS5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBoZWxwZnVsIGJlY2F1c2UgdGhlIHBhdGggb2YgY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGNoYW5nZXMgYmFzZWQgb24gd2hpY2hcbiAqIGZpbGUgaW4gdGhlIHBhdGggaGFzIGJlZW4gdmlzaXRlZCBmaXJzdCBieSB0aGUgYW5hbHl6ZXIuIGUuZy4gQXNzdW1lIHdlIGhhdmUgYSBjaXJjdWxhclxuICogZGVwZW5kZW5jeSByZXByZXNlbnRlZCBhczogYEEgLT4gQiAtPiBDYC4gVGhlIGFuYWx5emVyIHdpbGwgZGV0ZWN0IHRoaXMgY3ljbGUgd2hlbiBpdFxuICogdmlzaXRzIGBBYC4gVGhvdWdoIHdoZW4gYSBzb3VyY2UgZmlsZSB0aGF0IGlzIGFuYWx5emVkIGJlZm9yZSBgQWAgc3RhcnRzIGltcG9ydGluZyBgQmAsXG4gKiB0aGUgY3ljbGUgcGF0aCB3aWxsIGRldGVjdGVkIGFzIGBCIC0+IEMgLT4gQWAuIFRoaXMgcmVwcmVzZW50cyB0aGUgc2FtZSBjeWNsZSwgYnV0IGlzIGp1c3RcbiAqIGRpZmZlcmVudCBkdWUgdG8gYSBsaW1pdGF0aW9uIG9mIHVzaW5nIGEgZGF0YSBzdHJ1Y3R1cmUgdGhhdCBjYW4gYmUgd3JpdHRlbiB0byBhIHRleHQtYmFzZWRcbiAqIGdvbGRlbiBmaWxlLlxuICpcbiAqIFRvIGFjY291bnQgZm9yIHRoaXMgbm9uLWRldGVybWluaXN0aWMgYmVoYXZpb3IgaW4gZ29sZGVucywgd2Ugc2hpZnQgdGhlIGNpcmN1bGFyXG4gKiBkZXBlbmRlbmN5IHBhdGggdG8gdGhlIGZpcnN0IG5vZGUgYmFzZWQgb24gYWxwaGFiZXRpY2FsIG9yZGVyLiBlLmcuIGBBYCB3aWxsIGFsd2F5c1xuICogYmUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIHBhdGggdGhhdCByZXByZXNlbnRzIHRoZSBjeWNsZS5cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplQ2lyY3VsYXJEZXBlbmRlbmN5KHBhdGg6IENpcmN1bGFyRGVwZW5kZW5jeSk6IENpcmN1bGFyRGVwZW5kZW5jeSB7XG4gIGlmIChwYXRoLmxlbmd0aCA8PSAxKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBsZXQgaW5kZXhGaXJzdE5vZGU6IG51bWJlciA9IDA7XG4gIGxldCB2YWx1ZUZpcnN0Tm9kZTogc3RyaW5nID0gcGF0aFswXTtcblxuICAvLyBGaW5kIGEgbm9kZSBpbiB0aGUgY3ljbGUgcGF0aCB0aGF0IHByZWNlZGVzIGFsbCBvdGhlciBlbGVtZW50c1xuICAvLyBpbiB0ZXJtcyBvZiBhbHBoYWJldGljYWwgb3JkZXIuXG4gIGZvciAobGV0IGkgPSAxOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHZhbHVlID0gcGF0aFtpXTtcbiAgICBpZiAodmFsdWUubG9jYWxlQ29tcGFyZSh2YWx1ZUZpcnN0Tm9kZSwgJ2VuJykgPCAwKSB7XG4gICAgICBpbmRleEZpcnN0Tm9kZSA9IGk7XG4gICAgICB2YWx1ZUZpcnN0Tm9kZSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBhbHBoYWJldGljYWxseSBmaXJzdCBub2RlIGlzIGFscmVhZHkgYXQgc3RhcnQgb2YgdGhlIHBhdGgsIGp1c3RcbiAgLy8gcmV0dXJuIHRoZSBhY3R1YWwgcGF0aCBhcyBubyBjaGFuZ2VzIG5lZWQgdG8gYmUgbWFkZS5cbiAgaWYgKGluZGV4Rmlyc3ROb2RlID09PSAwKSB7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICAvLyBNb3ZlIHRoZSBkZXRlcm1pbmVkIGZpcnN0IG5vZGUgKGFzIG9mIGFscGhhYmV0aWNhbCBvcmRlcikgdG8gdGhlIHN0YXJ0IG9mIGEgbmV3XG4gIC8vIHBhdGggYXJyYXkuIFRoZSBub2RlcyBiZWZvcmUgdGhlIGZpcnN0IG5vZGUgaW4gdGhlIG9sZCBwYXRoIGFyZSB0aGVuIGNvbmNhdGVuYXRlZFxuICAvLyB0byB0aGUgZW5kIG9mIHRoZSBuZXcgcGF0aC4gVGhpcyBpcyBwb3NzaWJsZSBiZWNhdXNlIHRoZSBwYXRoIHJlcHJlc2VudHMgYSBjeWNsZS5cbiAgcmV0dXJuIFsuLi5wYXRoLnNsaWNlKGluZGV4Rmlyc3ROb2RlKSwgLi4ucGF0aC5zbGljZSgwLCBpbmRleEZpcnN0Tm9kZSldO1xufVxuXG4vKiogQ2hlY2tzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBjaXJjdWxhciBkZXBlbmRlbmNpZXMgYXJlIGVxdWFsLiAqL1xuZnVuY3Rpb24gaXNTYW1lQ2lyY3VsYXJEZXBlbmRlbmN5KGFjdHVhbDogQ2lyY3VsYXJEZXBlbmRlbmN5LCBleHBlY3RlZDogQ2lyY3VsYXJEZXBlbmRlbmN5KSB7XG4gIGlmIChhY3R1YWwubGVuZ3RoICE9PSBleHBlY3RlZC5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhY3R1YWwubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYWN0dWFsW2ldICE9PSBleHBlY3RlZFtpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0d28gY2lyY3VsYXIgZGVwZW5kZW5jaWVzIGJ5IHJlc3BlY3RpbmcgdGhlIGFscGhhYmV0aWMgb3JkZXIgb2Ygbm9kZXMgaW4gdGhlXG4gKiBjeWNsZSBwYXRocy4gVGhlIGZpcnN0IG5vZGVzIHdoaWNoIGRvbid0IG1hdGNoIGluIGJvdGggcGF0aHMgYXJlIGRlY2lzaXZlIG9uIHRoZSBvcmRlci5cbiAqL1xuZnVuY3Rpb24gY29tcGFyZUNpcmN1bGFyRGVwZW5kZW5jeShhOiBDaXJjdWxhckRlcGVuZGVuY3ksIGI6IENpcmN1bGFyRGVwZW5kZW5jeSk6IG51bWJlciB7XG4gIC8vIEdvIHRocm91Z2ggbm9kZXMgaW4gYm90aCBjeWNsZSBwYXRocyBhbmQgZGV0ZXJtaW5lIHdoZXRoZXIgYGFgIHNob3VsZCBiZSBvcmRlcmVkXG4gIC8vIGJlZm9yZSBgYmAuIFRoZSBmaXJzdCBub2RlcyB3aGljaCBkb24ndCBtYXRjaCBkZWNpZGUgb24gdGhlIG9yZGVyLlxuICBmb3IgKGxldCBpID0gMDsgaSA8IE1hdGgubWluKGEubGVuZ3RoLCBiLmxlbmd0aCk7IGkrKykge1xuICAgIGNvbnN0IGNvbXBhcmVWYWx1ZSA9IGFbaV0ubG9jYWxlQ29tcGFyZShiW2ldLCAnZW4nKTtcbiAgICBpZiAoY29tcGFyZVZhbHVlICE9PSAwKSB7XG4gICAgICByZXR1cm4gY29tcGFyZVZhbHVlO1xuICAgIH1cbiAgfVxuICAvLyBJZiBhbGwgbm9kZXMgYXJlIGVxdWFsIGluIHRoZSBjeWNsZXMsIHRoZSBvcmRlciBpcyBiYXNlZCBvbiB0aGUgbGVuZ3RoIG9mIGJvdGggY3ljbGVzLlxuICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbn1cbiJdfQ==