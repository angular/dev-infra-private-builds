"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getModuleReferences = void 0;
const ts = require("typescript");
/**
 * Finds all module references in the specified source file.
 * @param node Source file which should be parsed.
 * @returns List of import specifiers in the source file.
 */
function getModuleReferences(node) {
    const references = [];
    const visitNode = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier !== undefined &&
            ts.isStringLiteral(node.moduleSpecifier)) {
            references.push(node.moduleSpecifier.text);
        }
        ts.forEachChild(node, visitNode);
    };
    ts.forEachChild(node, visitNode);
    return references;
}
exports.getModuleReferences = getModuleReferences;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbmctZGV2L3RzLWNpcmN1bGFyLWRlcGVuZGVuY2llcy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7R0FNRzs7O0FBRUgsaUNBQWlDO0FBRWpDOzs7O0dBSUc7QUFDSCxTQUFnQixtQkFBbUIsQ0FBQyxJQUFtQjtJQUNyRCxNQUFNLFVBQVUsR0FBYSxFQUFFLENBQUM7SUFDaEMsTUFBTSxTQUFTLEdBQUcsQ0FBQyxJQUFhLEVBQUUsRUFBRTtRQUNsQyxJQUNFLENBQUMsRUFBRSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5RCxJQUFJLENBQUMsZUFBZSxLQUFLLFNBQVM7WUFDbEMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQ3hDO1lBQ0EsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzVDO1FBQ0QsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDbkMsQ0FBQyxDQUFDO0lBQ0YsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDakMsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQWRELGtEQWNDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCAqIGFzIHRzIGZyb20gJ3R5cGVzY3JpcHQnO1xuXG4vKipcbiAqIEZpbmRzIGFsbCBtb2R1bGUgcmVmZXJlbmNlcyBpbiB0aGUgc3BlY2lmaWVkIHNvdXJjZSBmaWxlLlxuICogQHBhcmFtIG5vZGUgU291cmNlIGZpbGUgd2hpY2ggc2hvdWxkIGJlIHBhcnNlZC5cbiAqIEByZXR1cm5zIExpc3Qgb2YgaW1wb3J0IHNwZWNpZmllcnMgaW4gdGhlIHNvdXJjZSBmaWxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TW9kdWxlUmVmZXJlbmNlcyhub2RlOiB0cy5Tb3VyY2VGaWxlKTogc3RyaW5nW10ge1xuICBjb25zdCByZWZlcmVuY2VzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB2aXNpdE5vZGUgPSAobm9kZTogdHMuTm9kZSkgPT4ge1xuICAgIGlmIChcbiAgICAgICh0cy5pc0ltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHx8IHRzLmlzRXhwb3J0RGVjbGFyYXRpb24obm9kZSkpICYmXG4gICAgICBub2RlLm1vZHVsZVNwZWNpZmllciAhPT0gdW5kZWZpbmVkICYmXG4gICAgICB0cy5pc1N0cmluZ0xpdGVyYWwobm9kZS5tb2R1bGVTcGVjaWZpZXIpXG4gICAgKSB7XG4gICAgICByZWZlcmVuY2VzLnB1c2gobm9kZS5tb2R1bGVTcGVjaWZpZXIudGV4dCk7XG4gICAgfVxuICAgIHRzLmZvckVhY2hDaGlsZChub2RlLCB2aXNpdE5vZGUpO1xuICB9O1xuICB0cy5mb3JFYWNoQ2hpbGQobm9kZSwgdmlzaXROb2RlKTtcbiAgcmV0dXJuIHJlZmVyZW5jZXM7XG59XG4iXX0=