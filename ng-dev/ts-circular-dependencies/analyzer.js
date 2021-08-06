"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analyzer = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const ts = require("typescript");
const file_system_1 = require("./file_system");
const parser_1 = require("./parser");
/** Default extensions that the analyzer uses for resolving imports. */
const DEFAULT_EXTENSIONS = ['ts', 'js', 'd.ts'];
/**
 * Analyzer that can be used to detect import cycles within source files. It supports
 * custom module resolution, source file caching and collects unresolved specifiers.
 */
class Analyzer {
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
        for (const ref of parser_1.getModuleReferences(sf)) {
            const targetFile = this._resolveImport(ref, sf.fileName);
            if (targetFile !== null) {
                result.push(...this.findCycles(this.getSourceFile(targetFile), visited, path.slice()));
            }
        }
        return result;
    }
    /** Gets the TypeScript source file of the specified path. */
    getSourceFile(filePath) {
        const resolvedPath = path_1.resolve(filePath);
        if (this._sourceFileCache.has(resolvedPath)) {
            return this._sourceFileCache.get(resolvedPath);
        }
        const fileContent = fs_1.readFileSync(resolvedPath, 'utf8');
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
        const importFullPath = containingFilePath !== undefined ? path_1.join(path_1.dirname(containingFilePath), specifier) : specifier;
        const stat = file_system_1.getFileStatus(importFullPath);
        if (stat && stat.isFile()) {
            return importFullPath;
        }
        for (const extension of this.extensions) {
            const pathWithExtension = `${importFullPath}.${extension}`;
            const stat = file_system_1.getFileStatus(pathWithExtension);
            if (stat && stat.isFile()) {
                return pathWithExtension;
            }
        }
        // Directories should be considered last. TypeScript first looks for source files, then
        // falls back to directories if no file with appropriate extension could be found.
        if (stat && stat.isDirectory()) {
            return this._resolveFileSpecifier(path_1.join(importFullPath, 'index'));
        }
        return null;
    }
}
exports.Analyzer = Analyzer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFnQztBQUNoQywrQkFBNEM7QUFDNUMsaUNBQWlDO0FBRWpDLCtDQUE0QztBQUM1QyxxQ0FBNkM7QUFXN0MsdUVBQXVFO0FBQ3ZFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRWhEOzs7R0FHRztBQUNILE1BQWEsUUFBUTtJQU1uQixZQUNTLGVBQWdDLEVBQ2hDLGFBQXVCLGtCQUFrQjtRQUR6QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBK0I7UUFQMUMscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7UUFFNUQsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN0QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBSzNDLENBQUM7SUFFSixxREFBcUQ7SUFDckQsVUFBVSxDQUNSLEVBQWlCLEVBQ2pCLFVBQVUsSUFBSSxPQUFPLEVBQWlCLEVBQ3RDLE9BQXVCLEVBQUU7UUFFekIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QywwRUFBMEU7UUFDMUUsaUZBQWlGO1FBQ2pGLElBQUksYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFDRCxzRkFBc0Y7UUFDdEYsbUZBQW1GO1FBQ25GLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsQ0FBQztT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LENBQUM7SUFDNUQsQ0FBQztJQUVELDRFQUE0RTtJQUNwRSxxQkFBcUIsQ0FBQyxTQUFpQixFQUFFLGtCQUEyQjtRQUMxRSxNQUFNLGNBQWMsR0FDbEIsa0JBQWtCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFJLENBQUMsY0FBTyxDQUFDLGtCQUFrQixDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM5RixNQUFNLElBQUksR0FBRywyQkFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN6QixPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUNELEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUN2QyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsY0FBYyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLDJCQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUM5QyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUU7Z0JBQ3pCLE9BQU8saUJBQWlCLENBQUM7YUFDMUI7U0FDRjtRQUNELHVGQUF1RjtRQUN2RixrRkFBa0Y7UUFDbEYsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLFdBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztTQUNsRTtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztDQUNGO0FBOUdELDRCQThHQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3JlYWRGaWxlU3luY30gZnJvbSAnZnMnO1xuaW1wb3J0IHtkaXJuYW1lLCBqb2luLCByZXNvbHZlfSBmcm9tICdwYXRoJztcbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG5pbXBvcnQge2dldEZpbGVTdGF0dXN9IGZyb20gJy4vZmlsZV9zeXN0ZW0nO1xuaW1wb3J0IHtnZXRNb2R1bGVSZWZlcmVuY2VzfSBmcm9tICcuL3BhcnNlcic7XG5cbmV4cG9ydCB0eXBlIE1vZHVsZVJlc29sdmVyID0gKHNwZWNpZmllcjogc3RyaW5nKSA9PiBzdHJpbmcgfCBudWxsO1xuXG4vKipcbiAqIFJlZmVyZW5jZSBjaGFpbnMgZGVzY3JpYmUgYSBzZXF1ZW5jZSBvZiBzb3VyY2UgZmlsZXMgd2hpY2ggYXJlIGNvbm5lY3RlZCB0aHJvdWdoIGltcG9ydHMuXG4gKiBlLmcuIGBmaWxlX2EudHNgIGltcG9ydHMgYGZpbGVfYi50c2AsIHdoZXJlYXMgYGZpbGVfYi50c2AgaW1wb3J0cyBgZmlsZV9jLnRzYC4gVGhlIHJlZmVyZW5jZVxuICogY2hhaW4gZGF0YSBzdHJ1Y3R1cmUgY291bGQgYmUgdXNlZCB0byByZXByZXNlbnQgdGhpcyBpbXBvcnQgc2VxdWVuY2UuXG4gKi9cbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUNoYWluPFQgPSB0cy5Tb3VyY2VGaWxlPiA9IFRbXTtcblxuLyoqIERlZmF1bHQgZXh0ZW5zaW9ucyB0aGF0IHRoZSBhbmFseXplciB1c2VzIGZvciByZXNvbHZpbmcgaW1wb3J0cy4gKi9cbmNvbnN0IERFRkFVTFRfRVhURU5TSU9OUyA9IFsndHMnLCAnanMnLCAnZC50cyddO1xuXG4vKipcbiAqIEFuYWx5emVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGV0ZWN0IGltcG9ydCBjeWNsZXMgd2l0aGluIHNvdXJjZSBmaWxlcy4gSXQgc3VwcG9ydHNcbiAqIGN1c3RvbSBtb2R1bGUgcmVzb2x1dGlvbiwgc291cmNlIGZpbGUgY2FjaGluZyBhbmQgY29sbGVjdHMgdW5yZXNvbHZlZCBzcGVjaWZpZXJzLlxuICovXG5leHBvcnQgY2xhc3MgQW5hbHl6ZXIge1xuICBwcml2YXRlIF9zb3VyY2VGaWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4oKTtcblxuICB1bnJlc29sdmVkTW9kdWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB1bnJlc29sdmVkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlc29sdmVNb2R1bGVGbj86IE1vZHVsZVJlc29sdmVyLFxuICAgIHB1YmxpYyBleHRlbnNpb25zOiBzdHJpbmdbXSA9IERFRkFVTFRfRVhURU5TSU9OUyxcbiAgKSB7fVxuXG4gIC8qKiBGaW5kcyBhbGwgY3ljbGVzIGluIHRoZSBzcGVjaWZpZWQgc291cmNlIGZpbGUuICovXG4gIGZpbmRDeWNsZXMoXG4gICAgc2Y6IHRzLlNvdXJjZUZpbGUsXG4gICAgdmlzaXRlZCA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCksXG4gICAgcGF0aDogUmVmZXJlbmNlQ2hhaW4gPSBbXSxcbiAgKTogUmVmZXJlbmNlQ2hhaW5bXSB7XG4gICAgY29uc3QgcHJldmlvdXNJbmRleCA9IHBhdGguaW5kZXhPZihzZik7XG4gICAgLy8gSWYgdGhlIGdpdmVuIG5vZGUgaXMgYWxyZWFkeSBwYXJ0IG9mIHRoZSBjdXJyZW50IHBhdGgsIHRoZW4gYSBjeWNsZSBoYXNcbiAgICAvLyBiZWVuIGZvdW5kLiBBZGQgdGhlIHJlZmVyZW5jZSBjaGFpbiB3aGljaCByZXByZXNlbnRzIHRoZSBjeWNsZSB0byB0aGUgcmVzdWx0cy5cbiAgICBpZiAocHJldmlvdXNJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBbcGF0aC5zbGljZShwcmV2aW91c0luZGV4KV07XG4gICAgfVxuICAgIC8vIElmIHRoZSBub2RlIGhhcyBhbHJlYWR5IGJlZW4gdmlzaXRlZCwgdGhlbiBpdCdzIG5vdCBuZWNlc3NhcnkgdG8gZ28gY2hlY2sgaXRzIGVkZ2VzXG4gICAgLy8gYWdhaW4uIEN5Y2xlcyB3b3VsZCBoYXZlIGJlZW4gYWxyZWFkeSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkIGluIHRoZSBmaXJzdCBjaGVjay5cbiAgICBpZiAodmlzaXRlZC5oYXMoc2YpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHBhdGgucHVzaChzZik7XG4gICAgdmlzaXRlZC5hZGQoc2YpO1xuICAgIC8vIEdvIHRocm91Z2ggYWxsIGVkZ2VzLCB3aGljaCBhcmUgZGV0ZXJtaW5lZCB0aHJvdWdoIGltcG9ydC9leHBvcnRzLCBhbmQgY29sbGVjdCBjeWNsZXMuXG4gICAgY29uc3QgcmVzdWx0OiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gICAgZm9yIChjb25zdCByZWYgb2YgZ2V0TW9kdWxlUmVmZXJlbmNlcyhzZikpIHtcbiAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLl9yZXNvbHZlSW1wb3J0KHJlZiwgc2YuZmlsZU5hbWUpO1xuICAgICAgaWYgKHRhcmdldEZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4udGhpcy5maW5kQ3ljbGVzKHRoaXMuZ2V0U291cmNlRmlsZSh0YXJnZXRGaWxlKSwgdmlzaXRlZCwgcGF0aC5zbGljZSgpKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZSBvZiB0aGUgc3BlY2lmaWVkIHBhdGguICovXG4gIGdldFNvdXJjZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoZmlsZVBhdGgpO1xuICAgIGlmICh0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuaGFzKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuZ2V0KHJlc29sdmVkUGF0aCkhO1xuICAgIH1cbiAgICBjb25zdCBmaWxlQ29udGVudCA9IHJlYWRGaWxlU3luYyhyZXNvbHZlZFBhdGgsICd1dGY4Jyk7XG4gICAgY29uc3Qgc291cmNlRmlsZSA9IHRzLmNyZWF0ZVNvdXJjZUZpbGUoXG4gICAgICByZXNvbHZlZFBhdGgsXG4gICAgICBmaWxlQ29udGVudCxcbiAgICAgIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsXG4gICAgICBmYWxzZSxcbiAgICApO1xuICAgIHRoaXMuX3NvdXJjZUZpbGVDYWNoZS5zZXQocmVzb2x2ZWRQYXRoLCBzb3VyY2VGaWxlKTtcbiAgICByZXR1cm4gc291cmNlRmlsZTtcbiAgfVxuXG4gIC8qKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gaW1wb3J0IHNwZWNpZmllciB3aXRoIHJlc3BlY3QgdG8gdGhlIHNwZWNpZmllZCBjb250YWluaW5nIGZpbGUgcGF0aC4gKi9cbiAgcHJpdmF0ZSBfcmVzb2x2ZUltcG9ydChzcGVjaWZpZXI6IHN0cmluZywgY29udGFpbmluZ0ZpbGVQYXRoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBpZiAoc3BlY2lmaWVyLmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcihzcGVjaWZpZXIsIGNvbnRhaW5pbmdGaWxlUGF0aCk7XG4gICAgICBpZiAocmVzb2x2ZWRQYXRoID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3RyYWNrVW5yZXNvbHZlZEZpbGVJbXBvcnQoc3BlY2lmaWVyLCBjb250YWluaW5nRmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVzb2x2ZU1vZHVsZUZuKSB7XG4gICAgICBjb25zdCB0YXJnZXRGaWxlID0gdGhpcy5yZXNvbHZlTW9kdWxlRm4oc3BlY2lmaWVyKTtcbiAgICAgIGlmICh0YXJnZXRGaWxlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMuX3Jlc29sdmVGaWxlU3BlY2lmaWVyKHRhcmdldEZpbGUpO1xuICAgICAgICBpZiAocmVzb2x2ZWRQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVucmVzb2x2ZWRNb2R1bGVzLmFkZChzcGVjaWZpZXIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFRyYWNrcyB0aGUgZ2l2ZW4gZmlsZSBpbXBvcnQgYXMgdW5yZXNvbHZlZC4gKi9cbiAgcHJpdmF0ZSBfdHJhY2tVbnJlc29sdmVkRmlsZUltcG9ydChzcGVjaWZpZXI6IHN0cmluZywgb3JpZ2luRmlsZVBhdGg6IHN0cmluZykge1xuICAgIGlmICghdGhpcy51bnJlc29sdmVkRmlsZXMuaGFzKG9yaWdpbkZpbGVQYXRoKSkge1xuICAgICAgdGhpcy51bnJlc29sdmVkRmlsZXMuc2V0KG9yaWdpbkZpbGVQYXRoLCBbc3BlY2lmaWVyXSk7XG4gICAgfVxuICAgIHRoaXMudW5yZXNvbHZlZEZpbGVzLmdldChvcmlnaW5GaWxlUGF0aCkhLnB1c2goc3BlY2lmaWVyKTtcbiAgfVxuXG4gIC8qKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gaW1wb3J0IHNwZWNpZmllciB0byB0aGUgY29ycmVzcG9uZGluZyBzb3VyY2UgZmlsZS4gKi9cbiAgcHJpdmF0ZSBfcmVzb2x2ZUZpbGVTcGVjaWZpZXIoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aD86IHN0cmluZyk6IHN0cmluZyB8IG51bGwge1xuICAgIGNvbnN0IGltcG9ydEZ1bGxQYXRoID1cbiAgICAgIGNvbnRhaW5pbmdGaWxlUGF0aCAhPT0gdW5kZWZpbmVkID8gam9pbihkaXJuYW1lKGNvbnRhaW5pbmdGaWxlUGF0aCksIHNwZWNpZmllcikgOiBzcGVjaWZpZXI7XG4gICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMoaW1wb3J0RnVsbFBhdGgpO1xuICAgIGlmIChzdGF0ICYmIHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgIHJldHVybiBpbXBvcnRGdWxsUGF0aDtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICBjb25zdCBwYXRoV2l0aEV4dGVuc2lvbiA9IGAke2ltcG9ydEZ1bGxQYXRofS4ke2V4dGVuc2lvbn1gO1xuICAgICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMocGF0aFdpdGhFeHRlbnNpb24pO1xuICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gcGF0aFdpdGhFeHRlbnNpb247XG4gICAgICB9XG4gICAgfVxuICAgIC8vIERpcmVjdG9yaWVzIHNob3VsZCBiZSBjb25zaWRlcmVkIGxhc3QuIFR5cGVTY3JpcHQgZmlyc3QgbG9va3MgZm9yIHNvdXJjZSBmaWxlcywgdGhlblxuICAgIC8vIGZhbGxzIGJhY2sgdG8gZGlyZWN0b3JpZXMgaWYgbm8gZmlsZSB3aXRoIGFwcHJvcHJpYXRlIGV4dGVuc2lvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcihqb2luKGltcG9ydEZ1bGxQYXRoLCAnaW5kZXgnKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=