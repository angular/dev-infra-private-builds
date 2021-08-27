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
        for (const ref of (0, parser_1.getModuleReferences)(sf)) {
            const targetFile = this._resolveImport(ref, sf.fileName);
            if (targetFile !== null) {
                result.push(...this.findCycles(this.getSourceFile(targetFile), visited, path.slice()));
            }
        }
        return result;
    }
    /** Gets the TypeScript source file of the specified path. */
    getSourceFile(filePath) {
        const resolvedPath = (0, path_1.resolve)(filePath);
        if (this._sourceFileCache.has(resolvedPath)) {
            return this._sourceFileCache.get(resolvedPath);
        }
        const fileContent = (0, fs_1.readFileSync)(resolvedPath, 'utf8');
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
        const importFullPath = containingFilePath !== undefined ? (0, path_1.join)((0, path_1.dirname)(containingFilePath), specifier) : specifier;
        const stat = (0, file_system_1.getFileStatus)(importFullPath);
        if (stat && stat.isFile()) {
            return importFullPath;
        }
        for (const extension of this.extensions) {
            const pathWithExtension = `${importFullPath}.${extension}`;
            const stat = (0, file_system_1.getFileStatus)(pathWithExtension);
            if (stat && stat.isFile()) {
                return pathWithExtension;
            }
        }
        // Directories should be considered last. TypeScript first looks for source files, then
        // falls back to directories if no file with appropriate extension could be found.
        if (stat && stat.isDirectory()) {
            return this._resolveFileSpecifier((0, path_1.join)(importFullPath, 'index'));
        }
        return null;
    }
}
exports.Analyzer = Analyzer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9uZy1kZXYvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDJCQUFnQztBQUNoQywrQkFBNEM7QUFDNUMsaUNBQWlDO0FBRWpDLCtDQUE0QztBQUM1QyxxQ0FBNkM7QUFXN0MsdUVBQXVFO0FBQ3ZFLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBRWhEOzs7R0FHRztBQUNILE1BQWEsUUFBUTtJQU1uQixZQUNTLGVBQWdDLEVBQ2hDLGFBQXVCLGtCQUFrQjtRQUR6QyxvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7UUFDaEMsZUFBVSxHQUFWLFVBQVUsQ0FBK0I7UUFQMUMscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7UUFFNUQsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztRQUN0QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBSzNDLENBQUM7SUFFSixxREFBcUQ7SUFDckQsVUFBVSxDQUNSLEVBQWlCLEVBQ2pCLFVBQVUsSUFBSSxPQUFPLEVBQWlCLEVBQ3RDLE9BQXVCLEVBQUU7UUFFekIsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN2QywwRUFBMEU7UUFDMUUsaUZBQWlGO1FBQ2pGLElBQUksYUFBYSxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7U0FDcEM7UUFDRCxzRkFBc0Y7UUFDdEYsbUZBQW1GO1FBQ25GLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNuQixPQUFPLEVBQUUsQ0FBQztT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LENBQUMsU0FBUyxDQUFDLENBQUM7SUFDNUQsQ0FBQztJQUVELDRFQUE0RTtJQUNwRSxxQkFBcUIsQ0FBQyxTQUFpQixFQUFFLGtCQUEyQjtRQUMxRSxNQUFNLGNBQWMsR0FDbEIsa0JBQWtCLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFBLFdBQUksRUFBQyxJQUFBLGNBQU8sRUFBQyxrQkFBa0IsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7UUFDOUYsTUFBTSxJQUFJLEdBQUcsSUFBQSwyQkFBYSxFQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUN6QixPQUFPLGNBQWMsQ0FBQztTQUN2QjtRQUNELEtBQUssTUFBTSxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUN2QyxNQUFNLGlCQUFpQixHQUFHLEdBQUcsY0FBYyxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLElBQUEsMkJBQWEsRUFBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQzlDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDekIsT0FBTyxpQkFBaUIsQ0FBQzthQUMxQjtTQUNGO1FBQ0QsdUZBQXVGO1FBQ3ZGLGtGQUFrRjtRQUNsRixJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDOUIsT0FBTyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBQSxXQUFJLEVBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7Q0FDRjtBQTlHRCw0QkE4R0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRGaWxlU3RhdHVzfSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Z2V0TW9kdWxlUmVmZXJlbmNlc30gZnJvbSAnLi9wYXJzZXInO1xuXG5leHBvcnQgdHlwZSBNb2R1bGVSZXNvbHZlciA9IChzcGVjaWZpZXI6IHN0cmluZykgPT4gc3RyaW5nIHwgbnVsbDtcblxuLyoqXG4gKiBSZWZlcmVuY2UgY2hhaW5zIGRlc2NyaWJlIGEgc2VxdWVuY2Ugb2Ygc291cmNlIGZpbGVzIHdoaWNoIGFyZSBjb25uZWN0ZWQgdGhyb3VnaCBpbXBvcnRzLlxuICogZS5nLiBgZmlsZV9hLnRzYCBpbXBvcnRzIGBmaWxlX2IudHNgLCB3aGVyZWFzIGBmaWxlX2IudHNgIGltcG9ydHMgYGZpbGVfYy50c2AuIFRoZSByZWZlcmVuY2VcbiAqIGNoYWluIGRhdGEgc3RydWN0dXJlIGNvdWxkIGJlIHVzZWQgdG8gcmVwcmVzZW50IHRoaXMgaW1wb3J0IHNlcXVlbmNlLlxuICovXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VDaGFpbjxUID0gdHMuU291cmNlRmlsZT4gPSBUW107XG5cbi8qKiBEZWZhdWx0IGV4dGVuc2lvbnMgdGhhdCB0aGUgYW5hbHl6ZXIgdXNlcyBmb3IgcmVzb2x2aW5nIGltcG9ydHMuICovXG5jb25zdCBERUZBVUxUX0VYVEVOU0lPTlMgPSBbJ3RzJywgJ2pzJywgJ2QudHMnXTtcblxuLyoqXG4gKiBBbmFseXplciB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVjdCBpbXBvcnQgY3ljbGVzIHdpdGhpbiBzb3VyY2UgZmlsZXMuIEl0IHN1cHBvcnRzXG4gKiBjdXN0b20gbW9kdWxlIHJlc29sdXRpb24sIHNvdXJjZSBmaWxlIGNhY2hpbmcgYW5kIGNvbGxlY3RzIHVucmVzb2x2ZWQgc3BlY2lmaWVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBfc291cmNlRmlsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgdW5yZXNvbHZlZE1vZHVsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgdW5yZXNvbHZlZEZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHB1YmxpYyByZXNvbHZlTW9kdWxlRm4/OiBNb2R1bGVSZXNvbHZlcixcbiAgICBwdWJsaWMgZXh0ZW5zaW9uczogc3RyaW5nW10gPSBERUZBVUxUX0VYVEVOU0lPTlMsXG4gICkge31cblxuICAvKiogRmluZHMgYWxsIGN5Y2xlcyBpbiB0aGUgc3BlY2lmaWVkIHNvdXJjZSBmaWxlLiAqL1xuICBmaW5kQ3ljbGVzKFxuICAgIHNmOiB0cy5Tb3VyY2VGaWxlLFxuICAgIHZpc2l0ZWQgPSBuZXcgV2Vha1NldDx0cy5Tb3VyY2VGaWxlPigpLFxuICAgIHBhdGg6IFJlZmVyZW5jZUNoYWluID0gW10sXG4gICk6IFJlZmVyZW5jZUNoYWluW10ge1xuICAgIGNvbnN0IHByZXZpb3VzSW5kZXggPSBwYXRoLmluZGV4T2Yoc2YpO1xuICAgIC8vIElmIHRoZSBnaXZlbiBub2RlIGlzIGFscmVhZHkgcGFydCBvZiB0aGUgY3VycmVudCBwYXRoLCB0aGVuIGEgY3ljbGUgaGFzXG4gICAgLy8gYmVlbiBmb3VuZC4gQWRkIHRoZSByZWZlcmVuY2UgY2hhaW4gd2hpY2ggcmVwcmVzZW50cyB0aGUgY3ljbGUgdG8gdGhlIHJlc3VsdHMuXG4gICAgaWYgKHByZXZpb3VzSW5kZXggIT09IC0xKSB7XG4gICAgICByZXR1cm4gW3BhdGguc2xpY2UocHJldmlvdXNJbmRleCldO1xuICAgIH1cbiAgICAvLyBJZiB0aGUgbm9kZSBoYXMgYWxyZWFkeSBiZWVuIHZpc2l0ZWQsIHRoZW4gaXQncyBub3QgbmVjZXNzYXJ5IHRvIGdvIGNoZWNrIGl0cyBlZGdlc1xuICAgIC8vIGFnYWluLiBDeWNsZXMgd291bGQgaGF2ZSBiZWVuIGFscmVhZHkgZGV0ZWN0ZWQgYW5kIGNvbGxlY3RlZCBpbiB0aGUgZmlyc3QgY2hlY2suXG4gICAgaWYgKHZpc2l0ZWQuaGFzKHNmKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBwYXRoLnB1c2goc2YpO1xuICAgIHZpc2l0ZWQuYWRkKHNmKTtcbiAgICAvLyBHbyB0aHJvdWdoIGFsbCBlZGdlcywgd2hpY2ggYXJlIGRldGVybWluZWQgdGhyb3VnaCBpbXBvcnQvZXhwb3J0cywgYW5kIGNvbGxlY3QgY3ljbGVzLlxuICAgIGNvbnN0IHJlc3VsdDogUmVmZXJlbmNlQ2hhaW5bXSA9IFtdO1xuICAgIGZvciAoY29uc3QgcmVmIG9mIGdldE1vZHVsZVJlZmVyZW5jZXMoc2YpKSB7XG4gICAgICBjb25zdCB0YXJnZXRGaWxlID0gdGhpcy5fcmVzb2x2ZUltcG9ydChyZWYsIHNmLmZpbGVOYW1lKTtcbiAgICAgIGlmICh0YXJnZXRGaWxlICE9PSBudWxsKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKC4uLnRoaXMuZmluZEN5Y2xlcyh0aGlzLmdldFNvdXJjZUZpbGUodGFyZ2V0RmlsZSksIHZpc2l0ZWQsIHBhdGguc2xpY2UoKSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyoqIEdldHMgdGhlIFR5cGVTY3JpcHQgc291cmNlIGZpbGUgb2YgdGhlIHNwZWNpZmllZCBwYXRoLiAqL1xuICBnZXRTb3VyY2VGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiB0cy5Tb3VyY2VGaWxlIHtcbiAgICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlKGZpbGVQYXRoKTtcbiAgICBpZiAodGhpcy5fc291cmNlRmlsZUNhY2hlLmhhcyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc291cmNlRmlsZUNhY2hlLmdldChyZXNvbHZlZFBhdGgpITtcbiAgICB9XG4gICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMocmVzb2x2ZWRQYXRoLCAndXRmOCcpO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPSB0cy5jcmVhdGVTb3VyY2VGaWxlKFxuICAgICAgcmVzb2x2ZWRQYXRoLFxuICAgICAgZmlsZUNvbnRlbnQsXG4gICAgICB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LFxuICAgICAgZmFsc2UsXG4gICAgKTtcbiAgICB0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuc2V0KHJlc29sdmVkUGF0aCwgc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gIH1cblxuICAvKiogUmVzb2x2ZXMgdGhlIGdpdmVuIGltcG9ydCBzcGVjaWZpZXIgd2l0aCByZXNwZWN0IHRvIHRoZSBzcGVjaWZpZWQgY29udGFpbmluZyBmaWxlIHBhdGguICovXG4gIHByaXZhdGUgX3Jlc29sdmVJbXBvcnQoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKHNwZWNpZmllci5jaGFyQXQoMCkgPT09ICcuJykge1xuICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fcmVzb2x2ZUZpbGVTcGVjaWZpZXIoc3BlY2lmaWVyLCBjb250YWluaW5nRmlsZVBhdGgpO1xuICAgICAgaWYgKHJlc29sdmVkUGF0aCA9PT0gbnVsbCkge1xuICAgICAgICB0aGlzLl90cmFja1VucmVzb2x2ZWRGaWxlSW1wb3J0KHNwZWNpZmllciwgY29udGFpbmluZ0ZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XG4gICAgfVxuICAgIGlmICh0aGlzLnJlc29sdmVNb2R1bGVGbikge1xuICAgICAgY29uc3QgdGFyZ2V0RmlsZSA9IHRoaXMucmVzb2x2ZU1vZHVsZUZuKHNwZWNpZmllcik7XG4gICAgICBpZiAodGFyZ2V0RmlsZSAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcih0YXJnZXRGaWxlKTtcbiAgICAgICAgaWYgKHJlc29sdmVkUGF0aCAhPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlZFBhdGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy51bnJlc29sdmVkTW9kdWxlcy5hZGQoc3BlY2lmaWVyKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBUcmFja3MgdGhlIGdpdmVuIGZpbGUgaW1wb3J0IGFzIHVucmVzb2x2ZWQuICovXG4gIHByaXZhdGUgX3RyYWNrVW5yZXNvbHZlZEZpbGVJbXBvcnQoc3BlY2lmaWVyOiBzdHJpbmcsIG9yaWdpbkZpbGVQYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMudW5yZXNvbHZlZEZpbGVzLmhhcyhvcmlnaW5GaWxlUGF0aCkpIHtcbiAgICAgIHRoaXMudW5yZXNvbHZlZEZpbGVzLnNldChvcmlnaW5GaWxlUGF0aCwgW3NwZWNpZmllcl0pO1xuICAgIH1cbiAgICB0aGlzLnVucmVzb2x2ZWRGaWxlcy5nZXQob3JpZ2luRmlsZVBhdGgpIS5wdXNoKHNwZWNpZmllcik7XG4gIH1cblxuICAvKiogUmVzb2x2ZXMgdGhlIGdpdmVuIGltcG9ydCBzcGVjaWZpZXIgdG8gdGhlIGNvcnJlc3BvbmRpbmcgc291cmNlIGZpbGUuICovXG4gIHByaXZhdGUgX3Jlc29sdmVGaWxlU3BlY2lmaWVyKHNwZWNpZmllcjogc3RyaW5nLCBjb250YWluaW5nRmlsZVBhdGg/OiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcbiAgICBjb25zdCBpbXBvcnRGdWxsUGF0aCA9XG4gICAgICBjb250YWluaW5nRmlsZVBhdGggIT09IHVuZGVmaW5lZCA/IGpvaW4oZGlybmFtZShjb250YWluaW5nRmlsZVBhdGgpLCBzcGVjaWZpZXIpIDogc3BlY2lmaWVyO1xuICAgIGNvbnN0IHN0YXQgPSBnZXRGaWxlU3RhdHVzKGltcG9ydEZ1bGxQYXRoKTtcbiAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRmlsZSgpKSB7XG4gICAgICByZXR1cm4gaW1wb3J0RnVsbFBhdGg7XG4gICAgfVxuICAgIGZvciAoY29uc3QgZXh0ZW5zaW9uIG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgY29uc3QgcGF0aFdpdGhFeHRlbnNpb24gPSBgJHtpbXBvcnRGdWxsUGF0aH0uJHtleHRlbnNpb259YDtcbiAgICAgIGNvbnN0IHN0YXQgPSBnZXRGaWxlU3RhdHVzKHBhdGhXaXRoRXh0ZW5zaW9uKTtcbiAgICAgIGlmIChzdGF0ICYmIHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgICAgcmV0dXJuIHBhdGhXaXRoRXh0ZW5zaW9uO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBEaXJlY3RvcmllcyBzaG91bGQgYmUgY29uc2lkZXJlZCBsYXN0LiBUeXBlU2NyaXB0IGZpcnN0IGxvb2tzIGZvciBzb3VyY2UgZmlsZXMsIHRoZW5cbiAgICAvLyBmYWxscyBiYWNrIHRvIGRpcmVjdG9yaWVzIGlmIG5vIGZpbGUgd2l0aCBhcHByb3ByaWF0ZSBleHRlbnNpb24gY291bGQgYmUgZm91bmQuXG4gICAgaWYgKHN0YXQgJiYgc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZUZpbGVTcGVjaWZpZXIoam9pbihpbXBvcnRGdWxsUGF0aCwgJ2luZGV4JykpO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIl19