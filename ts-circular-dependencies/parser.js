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
        define("@angular/dev-infra-private/ts-circular-dependencies/parser", ["require", "exports", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getModuleReferences = void 0;
    var ts = require("typescript");
    /**
     * Finds all module references in the specified source file.
     * @param node Source file which should be parsed.
     * @returns List of import specifiers in the source file.
     */
    function getModuleReferences(node) {
        var references = [];
        var visitNode = function (node) {
            if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
                node.moduleSpecifier !== undefined && ts.isStringLiteral(node.moduleSpecifier)) {
                references.push(node.moduleSpecifier.text);
            }
            ts.forEachChild(node, visitNode);
        };
        ts.forEachChild(node, visitNode);
        return references;
    }
    exports.getModuleReferences = getModuleReferences;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsK0JBQWlDO0lBRWpDOzs7O09BSUc7SUFDSCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFtQjtRQUNyRCxJQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7UUFDaEMsSUFBTSxTQUFTLEdBQUcsVUFBQyxJQUFhO1lBQzlCLElBQUksQ0FBQyxFQUFFLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5RCxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVMsSUFBSSxFQUFFLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRTtnQkFDbEYsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVDO1lBQ0QsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDbkMsQ0FBQyxDQUFDO1FBQ0YsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakMsT0FBTyxVQUFVLENBQUM7SUFDcEIsQ0FBQztJQVhELGtEQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQgKiBhcyB0cyBmcm9tICd0eXBlc2NyaXB0JztcblxuLyoqXG4gKiBGaW5kcyBhbGwgbW9kdWxlIHJlZmVyZW5jZXMgaW4gdGhlIHNwZWNpZmllZCBzb3VyY2UgZmlsZS5cbiAqIEBwYXJhbSBub2RlIFNvdXJjZSBmaWxlIHdoaWNoIHNob3VsZCBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyBMaXN0IG9mIGltcG9ydCBzcGVjaWZpZXJzIGluIHRoZSBzb3VyY2UgZmlsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZHVsZVJlZmVyZW5jZXMobm9kZTogdHMuU291cmNlRmlsZSk6IHN0cmluZ1tdIHtcbiAgY29uc3QgcmVmZXJlbmNlczogc3RyaW5nW10gPSBbXTtcbiAgY29uc3QgdmlzaXROb2RlID0gKG5vZGU6IHRzLk5vZGUpID0+IHtcbiAgICBpZiAoKHRzLmlzSW1wb3J0RGVjbGFyYXRpb24obm9kZSkgfHwgdHMuaXNFeHBvcnREZWNsYXJhdGlvbihub2RlKSkgJiZcbiAgICAgICAgbm9kZS5tb2R1bGVTcGVjaWZpZXIgIT09IHVuZGVmaW5lZCAmJiB0cy5pc1N0cmluZ0xpdGVyYWwobm9kZS5tb2R1bGVTcGVjaWZpZXIpKSB7XG4gICAgICByZWZlcmVuY2VzLnB1c2gobm9kZS5tb2R1bGVTcGVjaWZpZXIudGV4dCk7XG4gICAgfVxuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUpO1xuICB9O1xuICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlKTtcbiAgcmV0dXJuIHJlZmVyZW5jZXM7XG59XG4iXX0=