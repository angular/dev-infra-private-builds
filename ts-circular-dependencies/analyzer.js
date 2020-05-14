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
        define("@angular/dev-infra-private/ts-circular-dependencies/analyzer", ["require", "exports", "tslib", "fs", "path", "typescript", "@angular/dev-infra-private/ts-circular-dependencies/file_system", "@angular/dev-infra-private/ts-circular-dependencies/parser"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Analyzer = void 0;
    var tslib_1 = require("tslib");
    var fs_1 = require("fs");
    var path_1 = require("path");
    var ts = require("typescript");
    var file_system_1 = require("@angular/dev-infra-private/ts-circular-dependencies/file_system");
    var parser_1 = require("@angular/dev-infra-private/ts-circular-dependencies/parser");
    /** Default extensions that the analyzer uses for resolving imports. */
    var DEFAULT_EXTENSIONS = ['ts', 'js', 'd.ts'];
    /**
     * Analyzer that can be used to detect import cycles within source files. It supports
     * custom module resolution, source file caching and collects unresolved specifiers.
     */
    var Analyzer = /** @class */ (function () {
        function Analyzer(resolveModuleFn, extensions) {
            if (extensions === void 0) { extensions = DEFAULT_EXTENSIONS; }
            this.resolveModuleFn = resolveModuleFn;
            this.extensions = extensions;
            this._sourceFileCache = new Map();
            this.unresolvedModules = new Set();
            this.unresolvedFiles = new Map();
        }
        /** Finds all cycles in the specified source file. */
        Analyzer.prototype.findCycles = function (sf, visited, path) {
            var e_1, _a;
            if (visited === void 0) { visited = new WeakSet(); }
            if (path === void 0) { path = []; }
            var previousIndex = path.indexOf(sf);
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
            var result = [];
            try {
                for (var _b = tslib_1.__values(parser_1.getModuleReferences(sf)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var ref = _c.value;
                    var targetFile = this._resolveImport(ref, sf.fileName);
                    if (targetFile !== null) {
                        result.push.apply(result, tslib_1.__spread(this.findCycles(this.getSourceFile(targetFile), visited, path.slice())));
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        };
        /** Gets the TypeScript source file of the specified path. */
        Analyzer.prototype.getSourceFile = function (filePath) {
            var resolvedPath = path_1.resolve(filePath);
            if (this._sourceFileCache.has(resolvedPath)) {
                return this._sourceFileCache.get(resolvedPath);
            }
            var fileContent = fs_1.readFileSync(resolvedPath, 'utf8');
            var sourceFile = ts.createSourceFile(resolvedPath, fileContent, ts.ScriptTarget.Latest, false);
            this._sourceFileCache.set(resolvedPath, sourceFile);
            return sourceFile;
        };
        /** Resolves the given import specifier with respect to the specified containing file path. */
        Analyzer.prototype._resolveImport = function (specifier, containingFilePath) {
            if (specifier.charAt(0) === '.') {
                var resolvedPath = this._resolveFileSpecifier(specifier, containingFilePath);
                if (resolvedPath === null) {
                    this._trackUnresolvedFileImport(specifier, containingFilePath);
                }
                return resolvedPath;
            }
            if (this.resolveModuleFn) {
                var targetFile = this.resolveModuleFn(specifier);
                if (targetFile !== null) {
                    var resolvedPath = this._resolveFileSpecifier(targetFile);
                    if (resolvedPath !== null) {
                        return resolvedPath;
                    }
                }
            }
            this.unresolvedModules.add(specifier);
            return null;
        };
        /** Tracks the given file import as unresolved. */
        Analyzer.prototype._trackUnresolvedFileImport = function (specifier, originFilePath) {
            if (!this.unresolvedFiles.has(originFilePath)) {
                this.unresolvedFiles.set(originFilePath, [specifier]);
            }
            this.unresolvedFiles.get(originFilePath).push(specifier);
        };
        /** Resolves the given import specifier to the corresponding source file. */
        Analyzer.prototype._resolveFileSpecifier = function (specifier, containingFilePath) {
            var e_2, _a;
            var importFullPath = containingFilePath !== undefined ? path_1.join(path_1.dirname(containingFilePath), specifier) : specifier;
            var stat = file_system_1.getFileStatus(importFullPath);
            if (stat && stat.isFile()) {
                return importFullPath;
            }
            try {
                for (var _b = tslib_1.__values(this.extensions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var extension = _c.value;
                    var pathWithExtension = importFullPath + "." + extension;
                    var stat_1 = file_system_1.getFileStatus(pathWithExtension);
                    if (stat_1 && stat_1.isFile()) {
                        return pathWithExtension;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
            // Directories should be considered last. TypeScript first looks for source files, then
            // falls back to directories if no file with appropriate extension could be found.
            if (stat && stat.isDirectory()) {
                return this._resolveFileSpecifier(path_1.join(importFullPath, 'index'));
            }
            return null;
        };
        return Analyzer;
    }());
    exports.Analyzer = Analyzer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx5QkFBZ0M7SUFDaEMsNkJBQTRDO0lBQzVDLCtCQUFpQztJQUVqQywrRkFBNEM7SUFDNUMscUZBQTZDO0lBVzdDLHVFQUF1RTtJQUN2RSxJQUFNLGtCQUFrQixHQUFHLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUVoRDs7O09BR0c7SUFDSDtRQU1FLGtCQUNXLGVBQWdDLEVBQVMsVUFBeUM7WUFBekMsMkJBQUEsRUFBQSwrQkFBeUM7WUFBbEYsb0JBQWUsR0FBZixlQUFlLENBQWlCO1lBQVMsZUFBVSxHQUFWLFVBQVUsQ0FBK0I7WUFOckYscUJBQWdCLEdBQUcsSUFBSSxHQUFHLEVBQXlCLENBQUM7WUFFNUQsc0JBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztZQUN0QyxvQkFBZSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1FBR2tELENBQUM7UUFFakcscURBQXFEO1FBQ3JELDZCQUFVLEdBQVYsVUFBVyxFQUFpQixFQUFFLE9BQXNDLEVBQUUsSUFBeUI7O1lBQWpFLHdCQUFBLEVBQUEsY0FBYyxPQUFPLEVBQWlCO1lBQUUscUJBQUEsRUFBQSxTQUF5QjtZQUU3RixJQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ3ZDLDBFQUEwRTtZQUMxRSxpRkFBaUY7WUFDakYsSUFBSSxhQUFhLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hCLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7YUFDcEM7WUFDRCxzRkFBc0Y7WUFDdEYsbUZBQW1GO1lBQ25GLElB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UUFDZCxDQUFDO1FBQ0gsZUFBQztJQUFELENBQUMsQUFyR0QsSUFxR0M7SUFyR1ksNEJBQVEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7cmVhZEZpbGVTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQge2Rpcm5hbWUsIGpvaW4sIHJlc29sdmV9IGZyb20gJ3BhdGgnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmltcG9ydCB7Z2V0RmlsZVN0YXR1c30gZnJvbSAnLi9maWxlX3N5c3RlbSc7XG5pbXBvcnQge2dldE1vZHVsZVJlZmVyZW5jZXN9IGZyb20gJy4vcGFyc2VyJztcblxuZXhwb3J0IHR5cGUgTW9kdWxlUmVzb2x2ZXIgPSAoc3BlY2lmaWVyOiBzdHJpbmcpID0+IHN0cmluZ3xudWxsO1xuXG4vKipcbiAqIFJlZmVyZW5jZSBjaGFpbnMgZGVzY3JpYmUgYSBzZXF1ZW5jZSBvZiBzb3VyY2UgZmlsZXMgd2hpY2ggYXJlIGNvbm5lY3RlZCB0aHJvdWdoIGltcG9ydHMuXG4gKiBlLmcuIGBmaWxlX2EudHNgIGltcG9ydHMgYGZpbGVfYi50c2AsIHdoZXJlYXMgYGZpbGVfYi50c2AgaW1wb3J0cyBgZmlsZV9jLnRzYC4gVGhlIHJlZmVyZW5jZVxuICogY2hhaW4gZGF0YSBzdHJ1Y3R1cmUgY291bGQgYmUgdXNlZCB0byByZXByZXNlbnQgdGhpcyBpbXBvcnQgc2VxdWVuY2UuXG4gKi9cbmV4cG9ydCB0eXBlIFJlZmVyZW5jZUNoYWluPFQgPSB0cy5Tb3VyY2VGaWxlPiA9IFRbXTtcblxuLyoqIERlZmF1bHQgZXh0ZW5zaW9ucyB0aGF0IHRoZSBhbmFseXplciB1c2VzIGZvciByZXNvbHZpbmcgaW1wb3J0cy4gKi9cbmNvbnN0IERFRkFVTFRfRVhURU5TSU9OUyA9IFsndHMnLCAnanMnLCAnZC50cyddO1xuXG4vKipcbiAqIEFuYWx5emVyIHRoYXQgY2FuIGJlIHVzZWQgdG8gZGV0ZWN0IGltcG9ydCBjeWNsZXMgd2l0aGluIHNvdXJjZSBmaWxlcy4gSXQgc3VwcG9ydHNcbiAqIGN1c3RvbSBtb2R1bGUgcmVzb2x1dGlvbiwgc291cmNlIGZpbGUgY2FjaGluZyBhbmQgY29sbGVjdHMgdW5yZXNvbHZlZCBzcGVjaWZpZXJzLlxuICovXG5leHBvcnQgY2xhc3MgQW5hbHl6ZXIge1xuICBwcml2YXRlIF9zb3VyY2VGaWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdHMuU291cmNlRmlsZT4oKTtcblxuICB1bnJlc29sdmVkTW9kdWxlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICB1bnJlc29sdmVkRmlsZXMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwdWJsaWMgcmVzb2x2ZU1vZHVsZUZuPzogTW9kdWxlUmVzb2x2ZXIsIHB1YmxpYyBleHRlbnNpb25zOiBzdHJpbmdbXSA9IERFRkFVTFRfRVhURU5TSU9OUykge31cblxuICAvKiogRmluZHMgYWxsIGN5Y2xlcyBpbiB0aGUgc3BlY2lmaWVkIHNvdXJjZSBmaWxlLiAqL1xuICBmaW5kQ3ljbGVzKHNmOiB0cy5Tb3VyY2VGaWxlLCB2aXNpdGVkID0gbmV3IFdlYWtTZXQ8dHMuU291cmNlRmlsZT4oKSwgcGF0aDogUmVmZXJlbmNlQ2hhaW4gPSBbXSk6XG4gICAgICBSZWZlcmVuY2VDaGFpbltdIHtcbiAgICBjb25zdCBwcmV2aW91c0luZGV4ID0gcGF0aC5pbmRleE9mKHNmKTtcbiAgICAvLyBJZiB0aGUgZ2l2ZW4gbm9kZSBpcyBhbHJlYWR5IHBhcnQgb2YgdGhlIGN1cnJlbnQgcGF0aCwgdGhlbiBhIGN5Y2xlIGhhc1xuICAgIC8vIGJlZW4gZm91bmQuIEFkZCB0aGUgcmVmZXJlbmNlIGNoYWluIHdoaWNoIHJlcHJlc2VudHMgdGhlIGN5Y2xlIHRvIHRoZSByZXN1bHRzLlxuICAgIGlmIChwcmV2aW91c0luZGV4ICE9PSAtMSkge1xuICAgICAgcmV0dXJuIFtwYXRoLnNsaWNlKHByZXZpb3VzSW5kZXgpXTtcbiAgICB9XG4gICAgLy8gSWYgdGhlIG5vZGUgaGFzIGFscmVhZHkgYmVlbiB2aXNpdGVkLCB0aGVuIGl0J3Mgbm90IG5lY2Vzc2FyeSB0byBnbyBjaGVjayBpdHMgZWRnZXNcbiAgICAvLyBhZ2Fpbi4gQ3ljbGVzIHdvdWxkIGhhdmUgYmVlbiBhbHJlYWR5IGRldGVjdGVkIGFuZCBjb2xsZWN0ZWQgaW4gdGhlIGZpcnN0IGNoZWNrLlxuICAgIGlmICh2aXNpdGVkLmhhcyhzZikpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcGF0aC5wdXNoKHNmKTtcbiAgICB2aXNpdGVkLmFkZChzZik7XG4gICAgLy8gR28gdGhyb3VnaCBhbGwgZWRnZXMsIHdoaWNoIGFyZSBkZXRlcm1pbmVkIHRocm91Z2ggaW1wb3J0L2V4cG9ydHMsIGFuZCBjb2xsZWN0IGN5Y2xlcy5cbiAgICBjb25zdCByZXN1bHQ6IFJlZmVyZW5jZUNoYWluW10gPSBbXTtcbiAgICBmb3IgKGNvbnN0IHJlZiBvZiBnZXRNb2R1bGVSZWZlcmVuY2VzKHNmKSkge1xuICAgICAgY29uc3QgdGFyZ2V0RmlsZSA9IHRoaXMuX3Jlc29sdmVJbXBvcnQocmVmLCBzZi5maWxlTmFtZSk7XG4gICAgICBpZiAodGFyZ2V0RmlsZSAhPT0gbnVsbCkge1xuICAgICAgICByZXN1bHQucHVzaCguLi50aGlzLmZpbmRDeWNsZXModGhpcy5nZXRTb3VyY2VGaWxlKHRhcmdldEZpbGUpLCB2aXNpdGVkLCBwYXRoLnNsaWNlKCkpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKiBHZXRzIHRoZSBUeXBlU2NyaXB0IHNvdXJjZSBmaWxlIG9mIHRoZSBzcGVjaWZpZWQgcGF0aC4gKi9cbiAgZ2V0U291cmNlRmlsZShmaWxlUGF0aDogc3RyaW5nKTogdHMuU291cmNlRmlsZSB7XG4gICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZShmaWxlUGF0aCk7XG4gICAgaWYgKHRoaXMuX3NvdXJjZUZpbGVDYWNoZS5oYXMocmVzb2x2ZWRQYXRoKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZUZpbGVDYWNoZS5nZXQocmVzb2x2ZWRQYXRoKSE7XG4gICAgfVxuICAgIGNvbnN0IGZpbGVDb250ZW50ID0gcmVhZEZpbGVTeW5jKHJlc29sdmVkUGF0aCwgJ3V0ZjgnKTtcbiAgICBjb25zdCBzb3VyY2VGaWxlID1cbiAgICAgICAgdHMuY3JlYXRlU291cmNlRmlsZShyZXNvbHZlZFBhdGgsIGZpbGVDb250ZW50LCB0cy5TY3JpcHRUYXJnZXQuTGF0ZXN0LCBmYWxzZSk7XG4gICAgdGhpcy5fc291cmNlRmlsZUNhY2hlLnNldChyZXNvbHZlZFBhdGgsIHNvdXJjZUZpbGUpO1xuICAgIHJldHVybiBzb3VyY2VGaWxlO1xuICB9XG5cbiAgLyoqIFJlc29sdmVzIHRoZSBnaXZlbiBpbXBvcnQgc3BlY2lmaWVyIHdpdGggcmVzcGVjdCB0byB0aGUgc3BlY2lmaWVkIGNvbnRhaW5pbmcgZmlsZSBwYXRoLiAqL1xuICBwcml2YXRlIF9yZXNvbHZlSW1wb3J0KHNwZWNpZmllcjogc3RyaW5nLCBjb250YWluaW5nRmlsZVBhdGg6IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBpZiAoc3BlY2lmaWVyLmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICBjb25zdCByZXNvbHZlZFBhdGggPSB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcihzcGVjaWZpZXIsIGNvbnRhaW5pbmdGaWxlUGF0aCk7XG4gICAgICBpZiAocmVzb2x2ZWRQYXRoID09PSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3RyYWNrVW5yZXNvbHZlZEZpbGVJbXBvcnQoc3BlY2lmaWVyLCBjb250YWluaW5nRmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICB9XG4gICAgaWYgKHRoaXMucmVzb2x2ZU1vZHVsZUZuKSB7XG4gICAgICBjb25zdCB0YXJnZXRGaWxlID0gdGhpcy5yZXNvbHZlTW9kdWxlRm4oc3BlY2lmaWVyKTtcbiAgICAgIGlmICh0YXJnZXRGaWxlICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMuX3Jlc29sdmVGaWxlU3BlY2lmaWVyKHRhcmdldEZpbGUpO1xuICAgICAgICBpZiAocmVzb2x2ZWRQYXRoICE9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVkUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnVucmVzb2x2ZWRNb2R1bGVzLmFkZChzcGVjaWZpZXIpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFRyYWNrcyB0aGUgZ2l2ZW4gZmlsZSBpbXBvcnQgYXMgdW5yZXNvbHZlZC4gKi9cbiAgcHJpdmF0ZSBfdHJhY2tVbnJlc29sdmVkRmlsZUltcG9ydChzcGVjaWZpZXI6IHN0cmluZywgb3JpZ2luRmlsZVBhdGg6IHN0cmluZykge1xuICAgIGlmICghdGhpcy51bnJlc29sdmVkRmlsZXMuaGFzKG9yaWdpbkZpbGVQYXRoKSkge1xuICAgICAgdGhpcy51bnJlc29sdmVkRmlsZXMuc2V0KG9yaWdpbkZpbGVQYXRoLCBbc3BlY2lmaWVyXSk7XG4gICAgfVxuICAgIHRoaXMudW5yZXNvbHZlZEZpbGVzLmdldChvcmlnaW5GaWxlUGF0aCkhLnB1c2goc3BlY2lmaWVyKTtcbiAgfVxuXG4gIC8qKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gaW1wb3J0IHNwZWNpZmllciB0byB0aGUgY29ycmVzcG9uZGluZyBzb3VyY2UgZmlsZS4gKi9cbiAgcHJpdmF0ZSBfcmVzb2x2ZUZpbGVTcGVjaWZpZXIoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aD86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBpbXBvcnRGdWxsUGF0aCA9XG4gICAgICAgIGNvbnRhaW5pbmdGaWxlUGF0aCAhPT0gdW5kZWZpbmVkID8gam9pbihkaXJuYW1lKGNvbnRhaW5pbmdGaWxlUGF0aCksIHNwZWNpZmllcikgOiBzcGVjaWZpZXI7XG4gICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMoaW1wb3J0RnVsbFBhdGgpO1xuICAgIGlmIChzdGF0ICYmIHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgIHJldHVybiBpbXBvcnRGdWxsUGF0aDtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICBjb25zdCBwYXRoV2l0aEV4dGVuc2lvbiA9IGAke2ltcG9ydEZ1bGxQYXRofS4ke2V4dGVuc2lvbn1gO1xuICAgICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMocGF0aFdpdGhFeHRlbnNpb24pO1xuICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gcGF0aFdpdGhFeHRlbnNpb247XG4gICAgICB9XG4gICAgfVxuICAgIC8vIERpcmVjdG9yaWVzIHNob3VsZCBiZSBjb25zaWRlcmVkIGxhc3QuIFR5cGVTY3JpcHQgZmlyc3QgbG9va3MgZm9yIHNvdXJjZSBmaWxlcywgdGhlblxuICAgIC8vIGZhbGxzIGJhY2sgdG8gZGlyZWN0b3JpZXMgaWYgbm8gZmlsZSB3aXRoIGFwcHJvcHJpYXRlIGV4dGVuc2lvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcihqb2luKGltcG9ydEZ1bGxQYXRoLCAnaW5kZXgnKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=