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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHl6ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvdHMtY2lyY3VsYXItZGVwZW5kZW5jaWVzL2FuYWx5emVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHlCQUFnQztJQUNoQyw2QkFBNEM7SUFDNUMsK0JBQWlDO0lBRWpDLCtGQUE0QztJQUM1QyxxRkFBNkM7SUFXN0MsdUVBQXVFO0lBQ3ZFLElBQU0sa0JBQWtCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBRWhEOzs7T0FHRztJQUNIO1FBTUUsa0JBQ1csZUFBZ0MsRUFBUyxVQUF5QztZQUF6QywyQkFBQSxFQUFBLCtCQUF5QztZQUFsRixvQkFBZSxHQUFmLGVBQWUsQ0FBaUI7WUFBUyxlQUFVLEdBQVYsVUFBVSxDQUErQjtZQU5yRixxQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBeUIsQ0FBQztZQUU1RCxzQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1lBQ3RDLG9CQUFlLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7UUFHa0QsQ0FBQztRQUVqRyxxREFBcUQ7UUFDckQsNkJBQVUsR0FBVixVQUFXLEVBQWlCLEVBQUUsT0FBc0MsRUFBRSxJQUF5Qjs7WUFBakUsd0JBQUEsRUFBQSxjQUFjLE9BQU8sRUFBaUI7WUFBRSxxQkFBQSxFQUFBLFNBQXlCO1lBRTdGLElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDdkMsMEVBQTBFO1lBQzFFLGlGQUFpRjtZQUNqRixJQUFJLGFBQWEsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDeEIsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQzthQUNwQztZQUNELHNGQUFzRjtZQUN0RixtRkFBbUY7WUFDbkYsSUFB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QUNkLENBQUM7UUFDSCxlQUFDO0lBQUQsQ0FBQyxBQXJHRCxJQXFHQztJQXJHWSw0QkFBUSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtyZWFkRmlsZVN5bmN9IGZyb20gJ2ZzJztcbmltcG9ydCB7ZGlybmFtZSwgam9pbiwgcmVzb2x2ZX0gZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuaW1wb3J0IHtnZXRGaWxlU3RhdHVzfSBmcm9tICcuL2ZpbGVfc3lzdGVtJztcbmltcG9ydCB7Z2V0TW9kdWxlUmVmZXJlbmNlc30gZnJvbSAnLi9wYXJzZXInO1xuXG5leHBvcnQgdHlwZSBNb2R1bGVSZXNvbHZlciA9IChzcGVjaWZpZXI6IHN0cmluZykgPT4gc3RyaW5nIHwgbnVsbDtcblxuLyoqXG4gKiBSZWZlcmVuY2UgY2hhaW5zIGRlc2NyaWJlIGEgc2VxdWVuY2Ugb2Ygc291cmNlIGZpbGVzIHdoaWNoIGFyZSBjb25uZWN0ZWQgdGhyb3VnaCBpbXBvcnRzLlxuICogZS5nLiBgZmlsZV9hLnRzYCBpbXBvcnRzIGBmaWxlX2IudHNgLCB3aGVyZWFzIGBmaWxlX2IudHNgIGltcG9ydHMgYGZpbGVfYy50c2AuIFRoZSByZWZlcmVuY2VcbiAqIGNoYWluIGRhdGEgc3RydWN0dXJlIGNvdWxkIGJlIHVzZWQgdG8gcmVwcmVzZW50IHRoaXMgaW1wb3J0IHNlcXVlbmNlLlxuICovXG5leHBvcnQgdHlwZSBSZWZlcmVuY2VDaGFpbjxUID0gdHMuU291cmNlRmlsZT4gPSBUW107XG5cbi8qKiBEZWZhdWx0IGV4dGVuc2lvbnMgdGhhdCB0aGUgYW5hbHl6ZXIgdXNlcyBmb3IgcmVzb2x2aW5nIGltcG9ydHMuICovXG5jb25zdCBERUZBVUxUX0VYVEVOU0lPTlMgPSBbJ3RzJywgJ2pzJywgJ2QudHMnXTtcblxuLyoqXG4gKiBBbmFseXplciB0aGF0IGNhbiBiZSB1c2VkIHRvIGRldGVjdCBpbXBvcnQgY3ljbGVzIHdpdGhpbiBzb3VyY2UgZmlsZXMuIEl0IHN1cHBvcnRzXG4gKiBjdXN0b20gbW9kdWxlIHJlc29sdXRpb24sIHNvdXJjZSBmaWxlIGNhY2hpbmcgYW5kIGNvbGxlY3RzIHVucmVzb2x2ZWQgc3BlY2lmaWVycy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFuYWx5emVyIHtcbiAgcHJpdmF0ZSBfc291cmNlRmlsZUNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIHRzLlNvdXJjZUZpbGU+KCk7XG5cbiAgdW5yZXNvbHZlZE1vZHVsZXMgPSBuZXcgU2V0PHN0cmluZz4oKTtcbiAgdW5yZXNvbHZlZEZpbGVzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIHJlc29sdmVNb2R1bGVGbj86IE1vZHVsZVJlc29sdmVyLCBwdWJsaWMgZXh0ZW5zaW9uczogc3RyaW5nW10gPSBERUZBVUxUX0VYVEVOU0lPTlMpIHt9XG5cbiAgLyoqIEZpbmRzIGFsbCBjeWNsZXMgaW4gdGhlIHNwZWNpZmllZCBzb3VyY2UgZmlsZS4gKi9cbiAgZmluZEN5Y2xlcyhzZjogdHMuU291cmNlRmlsZSwgdmlzaXRlZCA9IG5ldyBXZWFrU2V0PHRzLlNvdXJjZUZpbGU+KCksIHBhdGg6IFJlZmVyZW5jZUNoYWluID0gW10pOlxuICAgICAgUmVmZXJlbmNlQ2hhaW5bXSB7XG4gICAgY29uc3QgcHJldmlvdXNJbmRleCA9IHBhdGguaW5kZXhPZihzZik7XG4gICAgLy8gSWYgdGhlIGdpdmVuIG5vZGUgaXMgYWxyZWFkeSBwYXJ0IG9mIHRoZSBjdXJyZW50IHBhdGgsIHRoZW4gYSBjeWNsZSBoYXNcbiAgICAvLyBiZWVuIGZvdW5kLiBBZGQgdGhlIHJlZmVyZW5jZSBjaGFpbiB3aGljaCByZXByZXNlbnRzIHRoZSBjeWNsZSB0byB0aGUgcmVzdWx0cy5cbiAgICBpZiAocHJldmlvdXNJbmRleCAhPT0gLTEpIHtcbiAgICAgIHJldHVybiBbcGF0aC5zbGljZShwcmV2aW91c0luZGV4KV07XG4gICAgfVxuICAgIC8vIElmIHRoZSBub2RlIGhhcyBhbHJlYWR5IGJlZW4gdmlzaXRlZCwgdGhlbiBpdCdzIG5vdCBuZWNlc3NhcnkgdG8gZ28gY2hlY2sgaXRzIGVkZ2VzXG4gICAgLy8gYWdhaW4uIEN5Y2xlcyB3b3VsZCBoYXZlIGJlZW4gYWxyZWFkeSBkZXRlY3RlZCBhbmQgY29sbGVjdGVkIGluIHRoZSBmaXJzdCBjaGVjay5cbiAgICBpZiAodmlzaXRlZC5oYXMoc2YpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHBhdGgucHVzaChzZik7XG4gICAgdmlzaXRlZC5hZGQoc2YpO1xuICAgIC8vIEdvIHRocm91Z2ggYWxsIGVkZ2VzLCB3aGljaCBhcmUgZGV0ZXJtaW5lZCB0aHJvdWdoIGltcG9ydC9leHBvcnRzLCBhbmQgY29sbGVjdCBjeWNsZXMuXG4gICAgY29uc3QgcmVzdWx0OiBSZWZlcmVuY2VDaGFpbltdID0gW107XG4gICAgZm9yIChjb25zdCByZWYgb2YgZ2V0TW9kdWxlUmVmZXJlbmNlcyhzZikpIHtcbiAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLl9yZXNvbHZlSW1wb3J0KHJlZiwgc2YuZmlsZU5hbWUpO1xuICAgICAgaWYgKHRhcmdldEZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgcmVzdWx0LnB1c2goLi4udGhpcy5maW5kQ3ljbGVzKHRoaXMuZ2V0U291cmNlRmlsZSh0YXJnZXRGaWxlKSwgdmlzaXRlZCwgcGF0aC5zbGljZSgpKSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiogR2V0cyB0aGUgVHlwZVNjcmlwdCBzb3VyY2UgZmlsZSBvZiB0aGUgc3BlY2lmaWVkIHBhdGguICovXG4gIGdldFNvdXJjZUZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IHRzLlNvdXJjZUZpbGUge1xuICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUoZmlsZVBhdGgpO1xuICAgIGlmICh0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuaGFzKHJlc29sdmVkUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuZ2V0KHJlc29sdmVkUGF0aCkgITtcbiAgICB9XG4gICAgY29uc3QgZmlsZUNvbnRlbnQgPSByZWFkRmlsZVN5bmMocmVzb2x2ZWRQYXRoLCAndXRmOCcpO1xuICAgIGNvbnN0IHNvdXJjZUZpbGUgPVxuICAgICAgICB0cy5jcmVhdGVTb3VyY2VGaWxlKHJlc29sdmVkUGF0aCwgZmlsZUNvbnRlbnQsIHRzLlNjcmlwdFRhcmdldC5MYXRlc3QsIGZhbHNlKTtcbiAgICB0aGlzLl9zb3VyY2VGaWxlQ2FjaGUuc2V0KHJlc29sdmVkUGF0aCwgc291cmNlRmlsZSk7XG4gICAgcmV0dXJuIHNvdXJjZUZpbGU7XG4gIH1cblxuICAvKiogUmVzb2x2ZXMgdGhlIGdpdmVuIGltcG9ydCBzcGVjaWZpZXIgd2l0aCByZXNwZWN0IHRvIHRoZSBzcGVjaWZpZWQgY29udGFpbmluZyBmaWxlIHBhdGguICovXG4gIHByaXZhdGUgX3Jlc29sdmVJbXBvcnQoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aDogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIGlmIChzcGVjaWZpZXIuY2hhckF0KDApID09PSAnLicpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHRoaXMuX3Jlc29sdmVGaWxlU3BlY2lmaWVyKHNwZWNpZmllciwgY29udGFpbmluZ0ZpbGVQYXRoKTtcbiAgICAgIGlmIChyZXNvbHZlZFBhdGggPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fdHJhY2tVbnJlc29sdmVkRmlsZUltcG9ydChzcGVjaWZpZXIsIGNvbnRhaW5pbmdGaWxlUGF0aCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgIH1cbiAgICBpZiAodGhpcy5yZXNvbHZlTW9kdWxlRm4pIHtcbiAgICAgIGNvbnN0IHRhcmdldEZpbGUgPSB0aGlzLnJlc29sdmVNb2R1bGVGbihzcGVjaWZpZXIpO1xuICAgICAgaWYgKHRhcmdldEZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWRQYXRoID0gdGhpcy5fcmVzb2x2ZUZpbGVTcGVjaWZpZXIodGFyZ2V0RmlsZSk7XG4gICAgICAgIGlmIChyZXNvbHZlZFBhdGggIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZWRQYXRoO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudW5yZXNvbHZlZE1vZHVsZXMuYWRkKHNwZWNpZmllcik7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogVHJhY2tzIHRoZSBnaXZlbiBmaWxlIGltcG9ydCBhcyB1bnJlc29sdmVkLiAqL1xuICBwcml2YXRlIF90cmFja1VucmVzb2x2ZWRGaWxlSW1wb3J0KHNwZWNpZmllcjogc3RyaW5nLCBvcmlnaW5GaWxlUGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKCF0aGlzLnVucmVzb2x2ZWRGaWxlcy5oYXMob3JpZ2luRmlsZVBhdGgpKSB7XG4gICAgICB0aGlzLnVucmVzb2x2ZWRGaWxlcy5zZXQob3JpZ2luRmlsZVBhdGgsIFtzcGVjaWZpZXJdKTtcbiAgICB9XG4gICAgdGhpcy51bnJlc29sdmVkRmlsZXMuZ2V0KG9yaWdpbkZpbGVQYXRoKSAhLnB1c2goc3BlY2lmaWVyKTtcbiAgfVxuXG4gIC8qKiBSZXNvbHZlcyB0aGUgZ2l2ZW4gaW1wb3J0IHNwZWNpZmllciB0byB0aGUgY29ycmVzcG9uZGluZyBzb3VyY2UgZmlsZS4gKi9cbiAgcHJpdmF0ZSBfcmVzb2x2ZUZpbGVTcGVjaWZpZXIoc3BlY2lmaWVyOiBzdHJpbmcsIGNvbnRhaW5pbmdGaWxlUGF0aD86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICBjb25zdCBpbXBvcnRGdWxsUGF0aCA9XG4gICAgICAgIGNvbnRhaW5pbmdGaWxlUGF0aCAhPT0gdW5kZWZpbmVkID8gam9pbihkaXJuYW1lKGNvbnRhaW5pbmdGaWxlUGF0aCksIHNwZWNpZmllcikgOiBzcGVjaWZpZXI7XG4gICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMoaW1wb3J0RnVsbFBhdGgpO1xuICAgIGlmIChzdGF0ICYmIHN0YXQuaXNGaWxlKCkpIHtcbiAgICAgIHJldHVybiBpbXBvcnRGdWxsUGF0aDtcbiAgICB9XG4gICAgZm9yIChjb25zdCBleHRlbnNpb24gb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICBjb25zdCBwYXRoV2l0aEV4dGVuc2lvbiA9IGAke2ltcG9ydEZ1bGxQYXRofS4ke2V4dGVuc2lvbn1gO1xuICAgICAgY29uc3Qgc3RhdCA9IGdldEZpbGVTdGF0dXMocGF0aFdpdGhFeHRlbnNpb24pO1xuICAgICAgaWYgKHN0YXQgJiYgc3RhdC5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gcGF0aFdpdGhFeHRlbnNpb247XG4gICAgICB9XG4gICAgfVxuICAgIC8vIERpcmVjdG9yaWVzIHNob3VsZCBiZSBjb25zaWRlcmVkIGxhc3QuIFR5cGVTY3JpcHQgZmlyc3QgbG9va3MgZm9yIHNvdXJjZSBmaWxlcywgdGhlblxuICAgIC8vIGZhbGxzIGJhY2sgdG8gZGlyZWN0b3JpZXMgaWYgbm8gZmlsZSB3aXRoIGFwcHJvcHJpYXRlIGV4dGVuc2lvbiBjb3VsZCBiZSBmb3VuZC5cbiAgICBpZiAoc3RhdCAmJiBzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl9yZXNvbHZlRmlsZVNwZWNpZmllcihqb2luKGltcG9ydEZ1bGxQYXRoLCAnaW5kZXgnKSk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG59XG4iXX0=