/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import * as ts from 'typescript';
import { getFileStatus } from './file_system';
import { getModuleReferences } from './parser';
/** Default extensions that the analyzer uses for resolving imports. */
const DEFAULT_EXTENSIONS = ['ts', 'js', 'd.ts'];
/**
 * Analyzer that can be used to detect import cycles within source files. It supports
 * custom module resolution, source file caching and collects unresolved specifiers.
 */
export class Analyzer {
    constructor(resolveModuleFn, extensions = DEFAULT_EXTENSIONS) {
        this.resolveModuleFn = resolveModuleFn;
        this.extensions = extensions;
        this._sourceFileCache = new Map();
        this.unresolvedModules = new Set();
        this.unresolvedFiles = new Map();
    }
    /** Finds all cycles in the specified source file. */
    findCycles(sf, visited = new WeakSet(), path = []) {
        const previousIndex = path.indexOf(sf);
        // If the given node is already part of the current path, then a cycle has
        // been found. Add the reference chain which represents the cycle to the results.
        if (previousIndex !== -1) {
            return [path.slice(previousIndex)];
        }
        // If the node has already been visited, then it's not necessary to go check its edges
        // again. Cycles would have been already detected and collected in the first check.
        if (visited.has(sf)) {
            return [];
        }
        path.push(sf);
        visited.add(sf);
        // Go through all edges, which are determined through import/exports, and collect cycles.
        const result = [];
        for (const ref of getModuleReferences(sf)) {
            const targetFile = this._resolveImport(ref, sf.fileName);
            if (targetFile !== null) {
                result.push(...this.findCycles(this.getSourceFile(targetFile), visited, path.slice()));
            }
        }
        return result;
    }
    /** Gets the TypeScript source file of the specified path. */
    getSourceFile(filePath) {
        const resolvedPath = resolve(filePath);
        if (this._sourceFileCache.has(resolvedPath)) {
            return this._sourceFileCache.get(resolvedPath);
        }
        const fileContent = readFileSync(resolvedPath, 'utf8');
        const sourceFile = ts.createSourceFile(resolvedPath, fileContent, ts.ScriptTarget.Latest, false);
        this._sourceFileCache.set(resolvedPath, sourceFile);
        return sourceFile;
    }
    /** Resolves the given import specifier with respect to the specified containing file path. */
    _resolveImport(specifier, containingFilePath) {
        if (specifier.charAt(0) === '.') {
            const resolvedPath = this._resolveFileSpecifier(specifier, containingFilePath);
            if (resolvedPath === null) {
                this._trackUnresolvedFileImport(specifier, containingFilePath);
            }
            return resolvedPath;
        }
        if (this.resolveModuleFn) {
            const targetFile = this.resolveModuleFn(specifier);
            if (targetFile !== null) {
                const resolvedPath = this._resolveFileSpecifier(targetFile);
                if (resolvedPath !== null) {
                    return resolvedPath;
                }
            }
        }
        this.unresolvedModules.add(specifier);
        return null;
    }
    /** Tracks the given file import as unresolved. */
    _trackUnresolvedFileImport(specifier, originFilePath) {
        if (!this.unresolvedFiles.has(originFilePath)) {
            this.unresolvedFiles.set(originFilePath, [specifier]);
        }
        this.unresolvedFiles.get(originFilePath).push(specifier);
    }
    /** Resolves the given import specifier to the corresponding source file. */
    _resolveFileSpecifier(specifier, containingFilePath) {
        const importFullPath = containingFilePath !== undefined ? join(dirname(containingFilePath), specifier) : specifier;
        const stat = getFileStatus(importFullPath);
        if (stat && stat.isFile()) {
            return importFullPath;
        }
        for (const extension of this.extensions) {
            const pathWithExtension = `${importFullPath}.${extension}`;
            const stat = getFileStatus(pathWithExtension);
            if (stat && stat.isFile()) {
                return pathWithExtension;
            }
        }
        // Directories should be considered last. TypeScript first looks for source files, then
        // falls back to directories if no file with appropriate extension could be found.
        if (stat && stat.isDirectory()) {
            return this._resolveFileSpecifier(join(importFullPath, 'index'));
        }
        return null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxJQUFJLENBQUM7QUFDaEMsT0FBTyxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFDLE1BQU0sTUFBTSxDQUFDO0FBQzVDLE9BQU8sS0FBSyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRWpDLE9BQU8sRUFBQyxhQUFhLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDNUMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBVzdDLHVFQUF1RTtBQUN2RSxNQUFNLGtCQUFrQixHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztBQUVoRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sUUFBUTtJQU1uQixZQUNXLGVBQWdDLEVBQVMsYUFBdUIsa0JBQWtCO1FBQWxGLG9CQUFlLEdBQWYsZUFBZSxDQUFpQjtRQUFTLGVBQVUsR0FBVixVQUFVLENBQStCO1FBTnJGLHFCQUFnQixHQUFHLElBQUksR0FBRyxFQUF5QixDQUFDO1FBRTVELHNCQUFpQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7UUFDdEMsb0JBQWUsR0FBRyxJQUFJLEdBQUcsRUFBb0IsQ0FBQztJQUdrRCxDQUFDO0lBRWpHLHFEQUFxRDtJQUNyRCxVQUFVLENBQUMsRUFBaUIsRUFBRSxVQUFVLElBQUksT0FBTyxFQUFpQixFQUFFLE9BQXVCLEVBQUU7UUFFN0YsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QywwRUFBMEU7UUFDMUUsaUZBQWlGO1FBQ2pGLElBQUksYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFDRCxzRkFBc0Y7UUFDdEYsbUZBQW1GO1FBQ25GLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNkLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDaEIseUZBQXlGO1FBQ3pGLE1BQU0sTUFBTSxHQUFxQixFQUFFLENBQUM7UUFDcEMsS0FBSyxNQUFNLEdBQUcsSUFBSSxtQkFBbUIsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUN6QyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDekQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN2QixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ3hGO1NBQ0Y7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsNkRBQTZEO0lBQzdELGFBQWEsQ0FBQyxRQUFnQjtRQUM1QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQzNDLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUUsQ0FBQztTQUNqRDtRQUNELE1BQU0sV0FBVyxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdkQsTUFBTSxVQUFVLEdBQ1osRUFBRSxDQUFDLGdCQUFnQixDQUFDLFlBQVksRUFBRSxXQUFXLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDcEQsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQUVELDhGQUE4RjtJQUN0RixjQUFjLENBQUMsU0FBaUIsRUFBRSxrQkFBMEI7UUFDbEUsSUFBSSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtZQUMvQixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7WUFDL0UsSUFBSSxZQUFZLEtBQUssSUFBSSxFQUFFO2dCQUN6QixJQUFJLENBQUMsMEJBQTBCLENBQUMsU0FBUyxFQUFFLGtCQUFrQixDQUFDLENBQUM7YUFDaEU7WUFDRCxPQUFPLFlBQVksQ0FBQztTQUNyQjtRQUNELElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUN4QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ25ELElBQUksVUFBVSxLQUFLLElBQUksRUFBRTtnQkFDdkIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFVBQVUsQ0FBQyxDQUFDO2dCQUM1RCxJQUFJLFlBQVksS0FBSyxJQUFJLEVBQUU7b0JBQ3pCLE9BQU8sWUFBWSxDQUFDO2lCQUNyQjthQUNGO1NBQ0Y7UUFDRCxJQUFJLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELGtEQUFrRDtJQUMxQywwQkFBMEIsQ0FBQyxTQUFpQixFQUFFLGNBQXNCO1FBQzFFLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsRUFBRTtZQUM3QyxJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1NBQ3ZEO1FBQ0QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFFLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCw0RUFBNEU7SUFDcEUscUJBQXFCLENBQUMsU0FBaUIsRUFBRSxrQkFBMkI7UUFDMUUsTUFBTSxjQUFjLEdBQ2hCLGtCQUFrQixLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDaEcsTUFBTSxJQUFJLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN6QixPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUNELEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUN2QyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsY0FBYyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDekIsT0FBTyxpQkFBaUIsQ0FBQzthQUMxQjtTQUNGO1FBQ0QsdUZBQXVGO1FBQ3ZGLGtGQUFrRjtRQUNsRixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRGaWxlU3RhdHVzfSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Z2V0TW9kdWxlUmVmZXJlbmNlc30gZnJvbSAnLi9wYXJzZXInO1xuXG5leHBvcnQgdHlwZSBNb2R1bGVSZXNvbHZlciA9IChzcGVjaWZpZXI6IHN0cmluZykgPT4gc3RyaW5nfG51bGw7XG5cbi8qKlxuICogUmVmZXJlbmNlIGNoYWlucyBkZXNjcmliZSBhIHNlcXVlbmNlIG9mIHNvdXJjZSBmaWxlcyB3aGljaCBhcmUgY29ubmVjdGVkIHRocm91Z2ggaW1wb3J0cy5cbiAqIGUuZy4gYGZpbGVfYS50c2AgaW1wb3J0cyBgZmlsZV9iLnRzYCwgd2hlcmVhcyBgZmlsZV9iLnRzYCBpbXBvcnRzIGBmaWxlX2MudHNgLiBUaGUgcmVmZXJlbmNlXG4gKiBjaGFpbiBkYXRhIHN0cnVjdHVyZSBjb3VsZCBiZSB1c2VkIHRvIHJlcHJlc2VudCB0aGlzIGltcG9ydCBzZXF1ZW5jZS5cbiAqL1xuZXhwb3J0IHR5cGUgUmVmZXJlbmNlQ2hhaW48VCA9IHRzLlNvdXJjZUZpbGU+ID0gVFtdO1xuXG4vKiogRGVmYXVsdCBleHRlbnNpb25zIHRoYXQgdGhlIGFuYWx5emVyIHVzZXMgZm9yIHJlc29sdmluZyBpbXBvcnRzLiAqL1xuY29uc3QgREVGQVVMVF9FWFRFTlNJT05TID0gWyd0cycsICdqcycsICdkLnRzJ107XG5cbi8qKlxuICogQW5hbHl6ZXIgdGhhdCBjYW4gYmUgdXNlZCB0byBkZXRlY3QgaW1wb3J0IGN5Y2xlcyB3aXRoaW4gc291cmNlIGZpbGVzLiBJdCBzdXBwb3J0c1xuICogY3VzdG9tIG1vZHVsZSByZXNvbHV0aW9uLCBzb3VyY2UgZmlsZSBjYWNoaW5nIGFuZCBjb2xsZWN0cyB1bnJlc29sdmVkIHNwZWNpZmllcnMuXG4gKi9cbmV4cG9ydCBjbGFzcyBBbmFseXplciB7XG4gIHByaXZhdGUgX3NvdXJjZUZpbGVDYWNoZSA9IG5ldyBNYXA8c3RyaW5nLCB0cy5Tb3VyY2VGaWxlPigpO1xuXG4gIHVucmVzb2x2ZWRNb2R1bGVzID0gbmV3IFNldDxzdHJpbmc+KCk7XG4gIHVucmVzb2x2ZWRGaWxlcyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyByZXNvbHZlTW9kdWxlRm4/OiBNb2R1bGVSZXNvbHZlciwgcHVibGljIGV4dGVuc2lvbnM6IHN0cmluZ1tdID0gREVGQVVMVF9FWFRFTlNJT05TKSB7fVxuXG4gIC8qKiBGaW5kcyBhbGwgY3ljbGVzIGluIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUuICovXG4gIGZpbmRDeWNsZXMoc2Y6IHRzLlNvdXJjZUZpbGUsIHZpc2l0ZWQgPSBuZXcgV2Vha1NldDx0cy5Tb3VyY2VGaWxlPigpLCBwYXRoOiBSZWZlcmVuY2VDaGFpbiA9IFtdKTpcbiAgICAgIFJlZmVyZW5jZUNoYWluW10ge1xuICAgIGNvbnN0IHByZXZpb3VzSW5kZXggPSBwYXRoLmluZGV4T2Yoc2YpO1xuICAgIC8vIElmIHRoZSBnaXZlbiBub2RlIGlzIGFscmVhZHkgcGFydCBvZiB0aGUgY3VycmVudCBwYXRoLCB0aGVuIGEgY3ljbGUgaGFzXG4gICAgLy8gYmVlbiBmb3VuZC4gQWRkIHRoZSByZWZlcmVuY2UgY2hhaW4gd2hpY2ggcmVwcmVzZW50cyB0aGUgY3ljbGUgdG8gdGhlIHJlc3VsdHMuXG4gICAgaWYgKHByZXZpb3VzSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gW3BhdGguc2xpY2UocHJldmlvdXNJbmRleCldO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgbm9kZSBoYXMgYWxyZWFkeSBiZWVuIHZpc2l0ZWQsIHRoZW4gaXQncyBub3QgbmVjZXNzYXJ5IHRvIGdvIGNoZWNrIGl0cyBlZGdlc1xuICAgIC8vIGFnYWluLiBDeWNsZXMgd291bGQgaGF2ZSBiZWVuIGFscmVhZHkgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZCBpbiB0aGUgZmlyc3QgY2hlY2suXG4gICAgaWYgKHZpc2l0ZWQuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBwYXRoLnB1c2goc2YpO1xuICAgIHZpc2l0ZWQuYWRkKHNmKTtcbiAgICAvLyBHbyB0aHJvdWdoIGFsbCBlZGdlcywgd2hpY2ggYXJlIGRldGVybWluZWQgdGhyb3VnaCBpbXBvcnQvZXhwb3J0cywgYW5kIGNvbGxlY3QgY3ljbGVzLlxuICAgIGNvbnN0IHJlc3VsdDogUmVmZXJlbmNlQ2hhaW5bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgcmVmIG9mIGdldE1vZHVsZVJlZmVyZW5jZXMoc2YpKSB7XG4gICAgICBjb25zdCB0YXJnZXRGaWxlID0gdGhpcy5fcmVzb2x2ZUltcG9ydChyZWYsIHNmLmZpbGVOYW1lKTtcbiAgICAgIGlmICh0YXJnZXRGaWxlICE9PSBudWxsKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKC4uLnRoaXMuZmluZEN5Y2xlcyh0aGlzLmdldFNvdXJjZUZpbGUodGFyZ2V0RmlsZSksIHZpc2l0ZWQsIHBhdGguc2xpY2UoKSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIFR5cGVTY3JpcHQgc291cmNlIGZpbGUgb2YgdGhlIHNwZWNpZmllZCBwYXRoLiAqL1xuICBnZXRTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKGZpbGVQYXRoKTtcbiAgICBpZiAodGhpcy5fc291cmNlRmlsZUNhY2hlLmhhcyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc291cmNlRmlsZUNhY2hlLmdldChyZXNvbHZlZFBhdGgpITtcbiAgICB9XG4gICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMocmVzb2x2ZWRQYXRoLCAndXRmOCcpO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPVxuICAgICAgICB0cy5jcmVhdGVTb3VyY2VGaWxlKHJlc29sdmVkUGF0aCwgZmlsZUNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIGZhbHNlKTtcbiAgICB0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuc2V0KHJlc29sdmVkUGF0aCwgc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gIH1cblxuICAvKiogUmVzb2x2ZXMgdGhlIGdpdmVuIGltcG9ydCBzcGVjaWZpZXIgd2l0aCByZXNwZWN0IHRvIHRoZSBzcGVjaWZpZWQgY29udGFpbmluZyBmaWxlIHBhdGguICovXG4gIHByaXZhdGUgX3Jlc29sdmVJbXBvcnQoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmIChzcGVjaWZpZXIuY2hhckF0KDApID09PSAnLicpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMuX3Jlc29sdmVGaWxlU3BlY2lmaWVyKHNwZWNpZmllciwgY29udGFpbmluZ0ZpbGVQYXRoKTtcbiAgICAgIGlmIChyZXNvbHZlZFBhdGggPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fdHJhY2tVbnJlc29sdmVkRmlsZUltcG9ydChzcGVjaWZpZXIsIGNvbnRhaW5pbmdGaWxlUGF0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXNvbHZlTW9kdWxlRm4pIHtcbiAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLnJlc29sdmVNb2R1bGVGbihzcGVjaWZpZXIpO1xuICAgICAgaWYgKHRhcmdldEZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fcmVzb2x2ZUZpbGVTcGVjaWZpZXIodGFyZ2V0RmlsZSk7XG4gICAgICAgIGlmIChyZXNvbHZlZFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudW5yZXNvbHZlZE1vZHVsZXMuYWRkKHNwZWNpZmllcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogVHJhY2tzIHRoZSBnaXZlbiBmaWxlIGltcG9ydCBhcyB1bnJlc29sdmVkLiAqL1xuICBwcml2YXRlIF90cmFja1VucmVzb2x2ZWRGaWxlSW1wb3J0KHNwZWNpZmllcjogc3RyaW5nLCBvcmlnaW5GaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnVucmVzb2x2ZWRGaWxlcy5oYXMob3JpZ2luRmlsZVBhdGgpKSB7XG4gICAgICB0aGlzLnVucmVzb2x2ZWRGaWxlcy5zZXQob3JpZ2luRmlsZVBhdGgsIFtzcGVjaWZpZXJdKTtcbiAgICB9XG4gICAgdGhpcy51bnJlc29sdmVkRmlsZXMuZ2V0KG9yaWdpbkZpbGVQYXRoKSEucHVzaChzcGVjaWZpZXIpO1xuICB9XG5cbiAgLyoqIFJlc29sdmVzIHRoZSBnaXZlbiBpbXBvcnQgc3BlY2lmaWVyIHRvIHRoZSBjb3JyZXNwb25kaW5nIHNvdXJjZSBmaWxlLiAqL1xuICBwcml2YXRlIF9yZXNvbHZlRmlsZVNwZWNpZmllcihzcGVjaWZpZXI6IHN0cmluZywgY29udGFpbmluZ0ZpbGVQYXRoPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGNvbnN0IGltcG9ydEZ1bGxQYXRoID1cbiAgICAgICAgY29udGFpbmluZ0ZpbGVQYXRoICE9PSB1bmRlZmluZWQgPyBqb2luKGRpcm5hbWUoY29udGFpbmluZ0ZpbGVQYXRoKSwgc3BlY2lmaWVyKSA6IHNwZWNpZmllcjtcbiAgICBjb25zdCBzdGF0ID0gZ2V0RmlsZVN0YXR1cyhpbXBvcnRGdWxsUGF0aCk7XG4gICAgaWYgKHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgcmV0dXJuIGltcG9ydEZ1bGxQYXRoO1xuICAgIH1cbiAgICBmb3IgKGNvbnN0IGV4dGVuc2lvbiBvZiB0aGlzLmV4dGVuc2lvbnMpIHtcbiAgICAgIGNvbnN0IHBhdGhXaXRoRXh0ZW5zaW9uID0gYCR7aW1wb3J0RnVsbFBhdGh9LiR7ZXh0ZW5zaW9ufWA7XG4gICAgICBjb25zdCBzdGF0ID0gZ2V0RmlsZVN0YXR1cyhwYXRoV2l0aEV4dGVuc2lvbik7XG4gICAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRmlsZSgpKSB7XG4gICAgICAgIHJldHVybiBwYXRoV2l0aEV4dGVuc2lvbjtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gRGlyZWN0b3JpZXMgc2hvdWxkIGJlIGNvbnNpZGVyZWQgbGFzdC4gVHlwZVNjcmlwdCBmaXJzdCBsb29rcyBmb3Igc291cmNlIGZpbGVzLCB0aGVuXG4gICAgLy8gZmFsbHMgYmFjayB0byBkaXJlY3RvcmllcyBpZiBubyBmaWxlIHdpdGggYXBwcm9wcmlhdGUgZXh0ZW5zaW9uIGNvdWxkIGJlIGZvdW5kLlxuICAgIGlmIChzdGF0ICYmIHN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVGaWxlU3BlY2lmaWVyKGpvaW4oaW1wb3J0RnVsbFBhdGgsICdpbmRleCcpKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiJdfQ==