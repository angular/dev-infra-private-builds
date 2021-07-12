/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
        define("@angular/dev-infra-private/tslint-rules/noImplicitOverrideAbstractRule", ["require", "exports", "tslib", "tslint/lib", "tslint/lib/rules", "typescript"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rule = void 0;
    var tslib_1 = require("tslib");
    var lib_1 = require("tslint/lib");
    var rules_1 = require("tslint/lib/rules");
    var ts = require("typescript");
    var FAILURE_MESSAGE = 'Missing override modifier. Members implemented as part of ' +
        'abstract classes must explicitly set the "override" modifier. ' +
        'More details: https://github.com/microsoft/TypeScript/issues/44457#issuecomment-856202843.';
    /**
     * Rule which enforces that class members implementing abstract members
     * from base classes explicitly specify the `override` modifier.
     *
     * This ensures we follow the best-practice of applying `override` for abstract-implemented
     * members so that TypeScript creates diagnostics in both scenarios where either the abstract
     * class member is removed, or renamed.
     *
     * More details can be found here: https://github.com/microsoft/TypeScript/issues/44457.
     */
    var Rule = /** @class */ (function (_super) {
        tslib_1.__extends(Rule, _super);
        function Rule() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Rule.prototype.applyWithProgram = function (sourceFile, program) {
            return this.applyWithFunction(sourceFile, function (ctx) { return visitNode(sourceFile, ctx, program); });
        };
        return Rule;
    }(rules_1.TypedRule));
    exports.Rule = Rule;
    /**
     * For a TypeScript AST node and each of its child nodes, check whether the node is a class
     * element which implements an abstract member but does not have the `override` keyword.
     */
    function visitNode(node, ctx, program) {
        // If a class element implements an abstract member but does not have the
        // `override` keyword, create a lint failure.
        if (ts.isClassElement(node) && !hasOverrideModifier(node) &&
            matchesParentAbstractElement(node, program)) {
            ctx.addFailureAtNode(node, FAILURE_MESSAGE, lib_1.Replacement.appendText(node.getStart(), "override "));
        }
        ts.forEachChild(node, function (node) { return visitNode(node, ctx, program); });
    }
    /**
     * Checks if the specified class element matches a parent abstract class element. i.e.
     * whether the specified member "implements" an abstract member from a base class.
     */
    function matchesParentAbstractElement(node, program) {
        var containingClass = node.parent;
        // If the property we check does not have a property name, we cannot look for similarly-named
        // members in parent classes and therefore return early.
        if (node.name === undefined) {
            return false;
        }
        var propertyName = getPropertyNameText(node.name);
        var typeChecker = program.getTypeChecker();
        // If the property we check does not have a statically-analyzable property name,
        // we cannot look for similarly-named members in parent classes and return early.
        if (propertyName === null) {
            return false;
        }
        return checkClassForInheritedMatchingAbstractMember(containingClass, typeChecker, propertyName);
    }
    /** Checks if the given class inherits an abstract member with the specified name. */
    function checkClassForInheritedMatchingAbstractMember(clazz, typeChecker, searchMemberName) {
        var baseClass = getBaseClass(clazz, typeChecker);
        // If the class is not `abstract`, then all parent abstract methods would need to
        // be implemented, and there is never an abstract member within the class.
        if (baseClass === null || !hasAbstractModifier(baseClass)) {
            return false;
        }
        var matchingMember = baseClass.members.find(function (m) { return m.name !== undefined && getPropertyNameText(m.name) === searchMemberName; });
        if (matchingMember !== undefined) {
            return hasAbstractModifier(matchingMember);
        }
        return checkClassForInheritedMatchingAbstractMember(baseClass, typeChecker, searchMemberName);
    }
    /** Gets the base class for the given class declaration. */
    function getBaseClass(node, typeChecker) {
        var _a, _b;
        var baseTypes = getExtendsHeritageExpressions(node);
        if (baseTypes.length > 1) {
            throw Error('Class unexpectedly extends from multiple types.');
        }
        var baseClass = typeChecker.getTypeAtLocation(baseTypes[0]).getSymbol();
        var baseClassDecl = (_a = baseClass === null || baseClass === void 0 ? void 0 : baseClass.valueDeclaration) !== null && _a !== void 0 ? _a : (_b = baseClass === null || baseClass === void 0 ? void 0 : baseClass.declarations) === null || _b === void 0 ? void 0 : _b[0];
        if (baseClassDecl !== undefined && ts.isClassDeclaration(baseClassDecl)) {
            return baseClassDecl;
        }
        return null;
    }
    /** Gets the `extends` base type expressions of the specified class. */
    function getExtendsHeritageExpressions(classDecl) {
        var e_1, _a;
        if (classDecl.heritageClauses === undefined) {
            return [];
        }
        var result = [];
        try {
            for (var _b = tslib_1.__values(classDecl.heritageClauses), _c = _b.next(); !_c.done; _c = _b.next()) {
                var clause = _c.value;
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    result.push.apply(result, tslib_1.__spreadArray([], tslib_1.__read(clause.types)));
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
    }
    /** Gets whether the specified node has the `abstract` modifier applied. */
    function hasAbstractModifier(node) {
        var _a;
        return !!((_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some(function (s) { return s.kind === ts.SyntaxKind.AbstractKeyword; }));
    }
    /** Gets whether the specified node has the `override` modifier applied. */
    function hasOverrideModifier(node) {
        var _a;
        return !!((_a = node.modifiers) === null || _a === void 0 ? void 0 : _a.some(function (s) { return s.kind === ts.SyntaxKind.OverrideKeyword; }));
    }
    /** Gets the property name text of the specified property name. */
    function getPropertyNameText(name) {
        if (ts.isComputedPropertyName(name)) {
            return null;
        }
        return name.text;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9JbXBsaWNpdE92ZXJyaWRlQWJzdHJhY3RSdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3RzbGludC1ydWxlcy9ub0ltcGxpY2l0T3ZlcnJpZGVBYnN0cmFjdFJ1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7OztJQUVILGtDQUFpRTtJQUNqRSwwQ0FBMkM7SUFDM0MsK0JBQWlDO0lBRWpDLElBQU0sZUFBZSxHQUFHLDREQUE0RDtRQUNoRixnRUFBZ0U7UUFDaEUsNEZBQTRGLENBQUM7SUFFakc7Ozs7Ozs7OztPQVNHO0lBQ0g7UUFBMEIsZ0NBQVM7UUFBbkM7O1FBSUEsQ0FBQztRQUhVLCtCQUFnQixHQUF6QixVQUEwQixVQUF5QixFQUFFLE9BQW1CO1lBQ3RFLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxVQUFBLEdBQUcsSUFBSSxPQUFBLFNBQVMsQ0FBQyxVQUFVLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxFQUFuQyxDQUFtQyxDQUFDLENBQUM7UUFDeEYsQ0FBQztRQUNILFdBQUM7SUFBRCxDQUFDLEFBSkQsQ0FBMEIsaUJBQVMsR0FJbEM7SUFKWSxvQkFBSTtJQU1qQjs7O09BR0c7SUFDSCxTQUFTLFNBQVMsQ0FBQyxJQUFhLEVBQUUsR0FBZ0IsRUFBRSxPQUFtQjtRQUNyRSx5RUFBeUU7UUFDekUsNkNBQTZDO1FBQzdDLElBQUksRUFBRSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQztZQUNyRCw0QkFBNEIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDL0MsR0FBRyxDQUFDLGdCQUFnQixDQUNoQixJQUFJLEVBQUUsZUFBZSxFQUFFLGlCQUFXLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxXQUFXLENBQUMsQ0FB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Q3BELEtBQXFCLElBQUEsS0FBQSxpQkFBQSxTQUFTLENBQUMsZUFBZSxDQUFBLGdCQUFBLDRCQUFFO2dCQUEzQyxJQUFNLE1BQU0sV0FBQTtnQkFDZixJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUU7b0JBQ2pELE1BQU0sQ0FBQyxJQUFJLE9BQVgsTUFBTSwyQ0FBUyxNQUFNLENBQUMsS0FBSyxJQUFFO2lCQUM5QjthQUNGOzs7Ozs7Ozs7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBRUQsMkVBQTJFO0lBQzNFLFNBQVMsbUJBQW1CLENBQUMsSUFBYTs7UUFDeEMsT0FBTyxDQUFDLENBQUMsQ0FBQSxNQUFBLElBQUksQ0FBQyxTQUFTLDBDQUFFLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLEVBQXhDLENBQXdDLENBQUMsQ0FBQSxDQUFDO0lBQy9FLENBQUM7SUFFRCwyRUFBMkU7SUFDM0UsU0FBUyxtQkFBbUIsQ0FBQyxJQUFhOztRQUN4QyxPQUFPLENBQUMsQ0FBQyxDQUFBLE1BQUEsSUFBSSxDQUFDLFNBQVMsMENBQUUsSUFBSSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUMsVUFBVSxDQUFDLGVBQWUsRUFBeEMsQ0FBd0MsQ0FBQyxDQUFBLENBQUM7SUFDL0UsQ0FBQztJQUVELGtFQUFrRTtJQUNsRSxTQUFTLG1CQUFtQixDQUFDLElBQXFCO1FBQ2hELElBQUksRUFBRSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1JlcGxhY2VtZW50LCBSdWxlRmFpbHVyZSwgV2Fsa0NvbnRleHR9IGZyb20gJ3RzbGludC9saWInO1xuaW1wb3J0IHtUeXBlZFJ1bGV9IGZyb20gJ3RzbGludC9saWIvcnVsZXMnO1xuaW1wb3J0ICogYXMgdHMgZnJvbSAndHlwZXNjcmlwdCc7XG5cbmNvbnN0IEZBSUxVUkVfTUVTU0FHRSA9ICdNaXNzaW5nIG92ZXJyaWRlIG1vZGlmaWVyLiBNZW1iZXJzIGltcGxlbWVudGVkIGFzIHBhcnQgb2YgJyArXG4gICAgJ2Fic3RyYWN0IGNsYXNzZXMgbXVzdCBleHBsaWNpdGx5IHNldCB0aGUgXCJvdmVycmlkZVwiIG1vZGlmaWVyLiAnICtcbiAgICAnTW9yZSBkZXRhaWxzOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQ0NDU3I2lzc3VlY29tbWVudC04NTYyMDI4NDMuJztcblxuLyoqXG4gKiBSdWxlIHdoaWNoIGVuZm9yY2VzIHRoYXQgY2xhc3MgbWVtYmVycyBpbXBsZW1lbnRpbmcgYWJzdHJhY3QgbWVtYmVyc1xuICogZnJvbSBiYXNlIGNsYXNzZXMgZXhwbGljaXRseSBzcGVjaWZ5IHRoZSBgb3ZlcnJpZGVgIG1vZGlmaWVyLlxuICpcbiAqIFRoaXMgZW5zdXJlcyB3ZSBmb2xsb3cgdGhlIGJlc3QtcHJhY3RpY2Ugb2YgYXBwbHlpbmcgYG92ZXJyaWRlYCBmb3IgYWJzdHJhY3QtaW1wbGVtZW50ZWRcbiAqIG1lbWJlcnMgc28gdGhhdCBUeXBlU2NyaXB0IGNyZWF0ZXMgZGlhZ25vc3RpY3MgaW4gYm90aCBzY2VuYXJpb3Mgd2hlcmUgZWl0aGVyIHRoZSBhYnN0cmFjdFxuICogY2xhc3MgbWVtYmVyIGlzIHJlbW92ZWQsIG9yIHJlbmFtZWQuXG4gKlxuICogTW9yZSBkZXRhaWxzIGNhbiBiZSBmb3VuZCBoZXJlOiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L1R5cGVTY3JpcHQvaXNzdWVzLzQ0NDU3LlxuICovXG5leHBvcnQgY2xhc3MgUnVsZSBleHRlbmRzIFR5cGVkUnVsZSB7XG4gIG92ZXJyaWRlIGFwcGx5V2l0aFByb2dyYW0oc291cmNlRmlsZTogdHMuU291cmNlRmlsZSwgcHJvZ3JhbTogdHMuUHJvZ3JhbSk6IFJ1bGVGYWlsdXJlW10ge1xuICAgIHJldHVybiB0aGlzLmFwcGx5V2l0aEZ1bmN0aW9uKHNvdXJjZUZpbGUsIGN0eCA9PiB2aXNpdE5vZGUoc291cmNlRmlsZSwgY3R4LCBwcm9ncmFtKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBGb3IgYSBUeXBlU2NyaXB0IEFTVCBub2RlIGFuZCBlYWNoIG9mIGl0cyBjaGlsZCBub2RlcywgY2hlY2sgd2hldGhlciB0aGUgbm9kZSBpcyBhIGNsYXNzXG4gKiBlbGVtZW50IHdoaWNoIGltcGxlbWVudHMgYW4gYWJzdHJhY3QgbWVtYmVyIGJ1dCBkb2VzIG5vdCBoYXZlIHRoZSBgb3ZlcnJpZGVgIGtleXdvcmQuXG4gKi9cbmZ1bmN0aW9uIHZpc2l0Tm9kZShub2RlOiB0cy5Ob2RlLCBjdHg6IFdhbGtDb250ZXh0LCBwcm9ncmFtOiB0cy5Qcm9ncmFtKSB7XG4gIC8vIElmIGEgY2xhc3MgZWxlbWVudCBpbXBsZW1lbnRzIGFuIGFic3RyYWN0IG1lbWJlciBidXQgZG9lcyBub3QgaGF2ZSB0aGVcbiAgLy8gYG92ZXJyaWRlYCBrZXl3b3JkLCBjcmVhdGUgYSBsaW50IGZhaWx1cmUuXG4gIGlmICh0cy5pc0NsYXNzRWxlbWVudChub2RlKSAmJiAhaGFzT3ZlcnJpZGVNb2RpZmllcihub2RlKSAmJlxuICAgICAgbWF0Y2hlc1BhcmVudEFic3RyYWN0RWxlbWVudChub2RlLCBwcm9ncmFtKSkge1xuICAgIGN0eC5hZGRGYWlsdXJlQXROb2RlKFxuICAgICAgICBub2RlLCBGQUlMVVJFX01FU1NBR0UsIFJlcGxhY2VtZW50LmFwcGVuZFRleHQobm9kZS5nZXRTdGFydCgpLCBgb3ZlcnJpZGUgYCkpO1xuICB9XG5cbiAgdHMuZm9yRWFjaENoaWxkKG5vZGUsIG5vZGUgPT4gdmlzaXROb2RlKG5vZGUsIGN0eCwgcHJvZ3JhbSkpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiB0aGUgc3BlY2lmaWVkIGNsYXNzIGVsZW1lbnQgbWF0Y2hlcyBhIHBhcmVudCBhYnN0cmFjdCBjbGFzcyBlbGVtZW50LiBpLmUuXG4gKiB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgbWVtYmVyIFwiaW1wbGVtZW50c1wiIGFuIGFic3RyYWN0IG1lbWJlciBmcm9tIGEgYmFzZSBjbGFzcy5cbiAqL1xuZnVuY3Rpb24gbWF0Y2hlc1BhcmVudEFic3RyYWN0RWxlbWVudChub2RlOiB0cy5DbGFzc0VsZW1lbnQsIHByb2dyYW06IHRzLlByb2dyYW0pOiBib29sZWFuIHtcbiAgY29uc3QgY29udGFpbmluZ0NsYXNzID0gbm9kZS5wYXJlbnQgYXMgdHMuQ2xhc3NEZWNsYXJhdGlvbjtcblxuICAvLyBJZiB0aGUgcHJvcGVydHkgd2UgY2hlY2sgZG9lcyBub3QgaGF2ZSBhIHByb3BlcnR5IG5hbWUsIHdlIGNhbm5vdCBsb29rIGZvciBzaW1pbGFybHktbmFtZWRcbiAgLy8gbWVtYmVycyBpbiBwYXJlbnQgY2xhc3NlcyBhbmQgdGhlcmVmb3JlIHJldHVybiBlYXJseS5cbiAgaWYgKG5vZGUubmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgY29uc3QgcHJvcGVydHlOYW1lID0gZ2V0UHJvcGVydHlOYW1lVGV4dChub2RlLm5hbWUpO1xuICBjb25zdCB0eXBlQ2hlY2tlciA9IHByb2dyYW0uZ2V0VHlwZUNoZWNrZXIoKTtcblxuICAvLyBJZiB0aGUgcHJvcGVydHkgd2UgY2hlY2sgZG9lcyBub3QgaGF2ZSBhIHN0YXRpY2FsbHktYW5hbHl6YWJsZSBwcm9wZXJ0eSBuYW1lLFxuICAvLyB3ZSBjYW5ub3QgbG9vayBmb3Igc2ltaWxhcmx5LW5hbWVkIG1lbWJlcnMgaW4gcGFyZW50IGNsYXNzZXMgYW5kIHJldHVybiBlYXJseS5cbiAgaWYgKHByb3BlcnR5TmFtZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBjaGVja0NsYXNzRm9ySW5oZXJpdGVkTWF0Y2hpbmdBYnN0cmFjdE1lbWJlcihjb250YWluaW5nQ2xhc3MsIHR5cGVDaGVja2VyLCBwcm9wZXJ0eU5hbWUpO1xufVxuXG4vKiogQ2hlY2tzIGlmIHRoZSBnaXZlbiBjbGFzcyBpbmhlcml0cyBhbiBhYnN0cmFjdCBtZW1iZXIgd2l0aCB0aGUgc3BlY2lmaWVkIG5hbWUuICovXG5mdW5jdGlvbiBjaGVja0NsYXNzRm9ySW5oZXJpdGVkTWF0Y2hpbmdBYnN0cmFjdE1lbWJlcihcbiAgICBjbGF6ejogdHMuQ2xhc3NEZWNsYXJhdGlvbiwgdHlwZUNoZWNrZXI6IHRzLlR5cGVDaGVja2VyLCBzZWFyY2hNZW1iZXJOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgYmFzZUNsYXNzID0gZ2V0QmFzZUNsYXNzKGNsYXp6LCB0eXBlQ2hlY2tlcik7XG5cbiAgLy8gSWYgdGhlIGNsYXNzIGlzIG5vdCBgYWJzdHJhY3RgLCB0aGVuIGFsbCBwYXJlbnQgYWJzdHJhY3QgbWV0aG9kcyB3b3VsZCBuZWVkIHRvXG4gIC8vIGJlIGltcGxlbWVudGVkLCBhbmQgdGhlcmUgaXMgbmV2ZXIgYW4gYWJzdHJhY3QgbWVtYmVyIHdpdGhpbiB0aGUgY2xhc3MuXG4gIGlmIChiYXNlQ2xhc3MgPT09IG51bGwgfHwgIWhhc0Fic3RyYWN0TW9kaWZpZXIoYmFzZUNsYXNzKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGNvbnN0IG1hdGNoaW5nTWVtYmVyID0gYmFzZUNsYXNzLm1lbWJlcnMuZmluZChcbiAgICAgIG0gPT4gbS5uYW1lICE9PSB1bmRlZmluZWQgJiYgZ2V0UHJvcGVydHlOYW1lVGV4dChtLm5hbWUpID09PSBzZWFyY2hNZW1iZXJOYW1lKTtcblxuICBpZiAobWF0Y2hpbmdNZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBoYXNBYnN0cmFjdE1vZGlmaWVyKG1hdGNoaW5nTWVtYmVyKTtcbiAgfVxuXG4gIHJldHVybiBjaGVja0NsYXNzRm9ySW5oZXJpdGVkTWF0Y2hpbmdBYnN0cmFjdE1lbWJlcihiYXNlQ2xhc3MsIHR5cGVDaGVja2VyLCBzZWFyY2hNZW1iZXJOYW1lKTtcbn1cblxuLyoqIEdldHMgdGhlIGJhc2UgY2xhc3MgZm9yIHRoZSBnaXZlbiBjbGFzcyBkZWNsYXJhdGlvbi4gKi9cbmZ1bmN0aW9uIGdldEJhc2VDbGFzcyhub2RlOiB0cy5DbGFzc0RlY2xhcmF0aW9uLCB0eXBlQ2hlY2tlcjogdHMuVHlwZUNoZWNrZXIpOiB0cy5DbGFzc0RlY2xhcmF0aW9ufFxuICAgIG51bGwge1xuICBjb25zdCBiYXNlVHlwZXMgPSBnZXRFeHRlbmRzSGVyaXRhZ2VFeHByZXNzaW9ucyhub2RlKTtcblxuICBpZiAoYmFzZVR5cGVzLmxlbmd0aCA+IDEpIHtcbiAgICB0aHJvdyBFcnJvcignQ2xhc3MgdW5leHBlY3RlZGx5IGV4dGVuZHMgZnJvbSBtdWx0aXBsZSB0eXBlcy4nKTtcbiAgfVxuXG4gIGNvbnN0IGJhc2VDbGFzcyA9IHR5cGVDaGVja2VyLmdldFR5cGVBdExvY2F0aW9uKGJhc2VUeXBlc1swXSkuZ2V0U3ltYm9sKCk7XG4gIGNvbnN0IGJhc2VDbGFzc0RlY2wgPSBiYXNlQ2xhc3M/LnZhbHVlRGVjbGFyYXRpb24gPz8gYmFzZUNsYXNzPy5kZWNsYXJhdGlvbnM/LlswXTtcblxuICBpZiAoYmFzZUNsYXNzRGVjbCAhPT0gdW5kZWZpbmVkICYmIHRzLmlzQ2xhc3NEZWNsYXJhdGlvbihiYXNlQ2xhc3NEZWNsKSkge1xuICAgIHJldHVybiBiYXNlQ2xhc3NEZWNsO1xuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKiBHZXRzIHRoZSBgZXh0ZW5kc2AgYmFzZSB0eXBlIGV4cHJlc3Npb25zIG9mIHRoZSBzcGVjaWZpZWQgY2xhc3MuICovXG5mdW5jdGlvbiBnZXRFeHRlbmRzSGVyaXRhZ2VFeHByZXNzaW9ucyhjbGFzc0RlY2w6IHRzLkNsYXNzRGVjbGFyYXRpb24pOlxuICAgIHRzLkV4cHJlc3Npb25XaXRoVHlwZUFyZ3VtZW50c1tdIHtcbiAgaWYgKGNsYXNzRGVjbC5oZXJpdGFnZUNsYXVzZXMgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCByZXN1bHQ6IHRzLkV4cHJlc3Npb25XaXRoVHlwZUFyZ3VtZW50c1tdID0gW107XG4gIGZvciAoY29uc3QgY2xhdXNlIG9mIGNsYXNzRGVjbC5oZXJpdGFnZUNsYXVzZXMpIHtcbiAgICBpZiAoY2xhdXNlLnRva2VuID09PSB0cy5TeW50YXhLaW5kLkV4dGVuZHNLZXl3b3JkKSB7XG4gICAgICByZXN1bHQucHVzaCguLi5jbGF1c2UudHlwZXMpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgbm9kZSBoYXMgdGhlIGBhYnN0cmFjdGAgbW9kaWZpZXIgYXBwbGllZC4gKi9cbmZ1bmN0aW9uIGhhc0Fic3RyYWN0TW9kaWZpZXIobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFub2RlLm1vZGlmaWVycz8uc29tZShzID0+IHMua2luZCA9PT0gdHMuU3ludGF4S2luZC5BYnN0cmFjdEtleXdvcmQpO1xufVxuXG4vKiogR2V0cyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgbm9kZSBoYXMgdGhlIGBvdmVycmlkZWAgbW9kaWZpZXIgYXBwbGllZC4gKi9cbmZ1bmN0aW9uIGhhc092ZXJyaWRlTW9kaWZpZXIobm9kZTogdHMuTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gISFub2RlLm1vZGlmaWVycz8uc29tZShzID0+IHMua2luZCA9PT0gdHMuU3ludGF4S2luZC5PdmVycmlkZUtleXdvcmQpO1xufVxuXG4vKiogR2V0cyB0aGUgcHJvcGVydHkgbmFtZSB0ZXh0IG9mIHRoZSBzcGVjaWZpZWQgcHJvcGVydHkgbmFtZS4gKi9cbmZ1bmN0aW9uIGdldFByb3BlcnR5TmFtZVRleHQobmFtZTogdHMuUHJvcGVydHlOYW1lKTogc3RyaW5nfG51bGwge1xuICBpZiAodHMuaXNDb21wdXRlZFByb3BlcnR5TmFtZShuYW1lKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBuYW1lLnRleHQ7XG59XG4iXX0=