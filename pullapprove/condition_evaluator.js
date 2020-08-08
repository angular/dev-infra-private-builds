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
        define("@angular/dev-infra-private/pullapprove/condition_evaluator", ["require", "exports", "tslib", "@angular/dev-infra-private/pullapprove/pullapprove_arrays", "@angular/dev-infra-private/pullapprove/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertConditionToFunction = void 0;
    var tslib_1 = require("tslib");
    var pullapprove_arrays_1 = require("@angular/dev-infra-private/pullapprove/pullapprove_arrays");
    var utils_1 = require("@angular/dev-infra-private/pullapprove/utils");
    /**
     * Context that is provided to conditions. Conditions can use various helpers
     * that PullApprove provides. We try to mock them here. Consult the official
     * docs for more details: https://docs.pullapprove.com/config/conditions.
     */
    var conditionContext = {
        'len': function (value) { return value.length; },
        'contains_any_globs': function (files, patterns) {
            // Note: Do not always create globs for the same pattern again. This method
            // could be called for each source file. Creating glob's is expensive.
            return files.some(function (f) { return patterns.some(function (pattern) { return utils_1.getOrCreateGlob(pattern).match(f); }); });
        },
    };
    /**
     * Converts a given condition to a function that accepts a set of files. The returned
     * function can be called to check if the set of files matches the condition.
     */
    function convertConditionToFunction(expr) {
        // Creates a dynamic function with the specified expression.
        // The first parameter will be `files` as that corresponds to the supported `files` variable that
        // can be accessed in PullApprove condition expressions. The second parameter is the list of
        // PullApproveGroups that are accessible in the condition expressions. The followed parameters
        // correspond to other context variables provided by PullApprove for conditions.
        var evaluateFn = new (Function.bind.apply(Function, tslib_1.__spread([void 0, 'files', 'groups'], Object.keys(conditionContext), ["\n    return (" + transformExpressionToJs(expr) + ");\n  "])))();
        // Create a function that calls the dynamically constructed function which mimics
        // the condition expression that is usually evaluated with Python in PullApprove.
        return function (files, groups) {
            var result = evaluateFn.apply(void 0, tslib_1.__spread([new (pullapprove_arrays_1.PullApproveStringArray.bind.apply(pullapprove_arrays_1.PullApproveStringArray, tslib_1.__spread([void 0], files)))(), new (pullapprove_arrays_1.PullApproveGroupArray.bind.apply(pullapprove_arrays_1.PullApproveGroupArray, tslib_1.__spread([void 0], groups)))()], Object.values(conditionContext)));
            // If an array is returned, we consider the condition as active if the array is not
            // empty. This matches PullApprove's condition evaluation that is based on Python.
            if (Array.isArray(result)) {
                return result.length !== 0;
            }
            return !!result;
        };
    }
    exports.convertConditionToFunction = convertConditionToFunction;
    /**
     * Transforms a condition expression from PullApprove that is based on python
     * so that it can be run inside JavaScript. Current transformations:
     *   1. `not <..>` -> `!<..>`
     */
    function transformExpressionToJs(expression) {
        return expression.replace(/not\s+/g, '!');
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxnR0FBbUY7SUFDbkYsc0VBQXdDO0lBRXhDOzs7O09BSUc7SUFDSCxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLEtBQUssRUFBRSxVQUFDLEtBQVksSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWTtRQUNyQyxvQkFBb0IsRUFBRSxVQUFDLEtBQTZCLEVBQUUsUUFBa0I7WUFDdEUsMkVBQTJFO1lBQzNFLHNFQUFzRTtZQUN0RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsdUJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQWpDLENBQWlDLENBQUMsRUFBM0QsQ0FBMkQsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBZ0IsMEJBQTBCLENBQUMsSUFBWTtRQUVyRCw0REFBNEQ7UUFDNUQsaUdBQWlHO1FBQ2pHLDRGQUE0RjtRQUM1Riw4RkFBOEY7UUFDOUYsZ0ZBQWdGO1FBQ2hGLElBQU0sVUFBVSxRQUFPLFFBQVEsWUFBUixRQUFRLDRCQUFDLE9BQU8sRUFBRSxRQUFRLEdBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFFLG1CQUN6RSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FDeEMsTUFBQyxDQUFDO1FBRUgsaUZBQWlGO1FBQ2pGLGlGQUFpRjtRQUNqRixPQUFPLFVBQUMsS0FBSyxFQUFFLE1BQU07WUFDbkIsSUFBTSxNQUFNLEdBQUcsVUFBVSxzQ0FDakIsMkNBQXNCLFlBQXRCLDJDQUFzQiw2QkFBSSxLQUFLLFlBQU8sMENBQXFCLFlBQXJCLDBDQUFxQiw2QkFBSSxNQUFNLFFBQ3RFLE1BQU0sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBQyxDQUFDO1lBQ3hDLG1GQUFtRjtZQUNuRixrRkFBa0Y7WUFDbEYsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUN6QixPQUFPLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2xCLENBQUMsQ0FBQztJQUNKLENBQUM7SUF4QkQsZ0VBd0JDO0lBRUQ7Ozs7T0FJRztJQUNILFNBQVMsdUJBQXVCLENBQUMsVUFBa0I7UUFDakQsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cH0gZnJvbSAnLi9ncm91cCc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBBcnJheSwgUHVsbEFwcHJvdmVTdHJpbmdBcnJheX0gZnJvbSAnLi9wdWxsYXBwcm92ZV9hcnJheXMnO1xuaW1wb3J0IHtnZXRPckNyZWF0ZUdsb2J9IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIENvbnRleHQgdGhhdCBpcyBwcm92aWRlZCB0byBjb25kaXRpb25zLiBDb25kaXRpb25zIGNhbiB1c2UgdmFyaW91cyBoZWxwZXJzXG4gKiB0aGF0IFB1bGxBcHByb3ZlIHByb3ZpZGVzLiBXZSB0cnkgdG8gbW9jayB0aGVtIGhlcmUuIENvbnN1bHQgdGhlIG9mZmljaWFsXG4gKiBkb2NzIGZvciBtb3JlIGRldGFpbHM6IGh0dHBzOi8vZG9jcy5wdWxsYXBwcm92ZS5jb20vY29uZmlnL2NvbmRpdGlvbnMuXG4gKi9cbmNvbnN0IGNvbmRpdGlvbkNvbnRleHQgPSB7XG4gICdsZW4nOiAodmFsdWU6IGFueVtdKSA9PiB2YWx1ZS5sZW5ndGgsXG4gICdjb250YWluc19hbnlfZ2xvYnMnOiAoZmlsZXM6IFB1bGxBcHByb3ZlU3RyaW5nQXJyYXksIHBhdHRlcm5zOiBzdHJpbmdbXSkgPT4ge1xuICAgIC8vIE5vdGU6IERvIG5vdCBhbHdheXMgY3JlYXRlIGdsb2JzIGZvciB0aGUgc2FtZSBwYXR0ZXJuIGFnYWluLiBUaGlzIG1ldGhvZFxuICAgIC8vIGNvdWxkIGJlIGNhbGxlZCBmb3IgZWFjaCBzb3VyY2UgZmlsZS4gQ3JlYXRpbmcgZ2xvYidzIGlzIGV4cGVuc2l2ZS5cbiAgICByZXR1cm4gZmlsZXMuc29tZShmID0+IHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBnZXRPckNyZWF0ZUdsb2IocGF0dGVybikubWF0Y2goZikpKTtcbiAgfSxcbn07XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiBjb25kaXRpb24gdG8gYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBzZXQgb2YgZmlsZXMuIFRoZSByZXR1cm5lZFxuICogZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCB0byBjaGVjayBpZiB0aGUgc2V0IG9mIGZpbGVzIG1hdGNoZXMgdGhlIGNvbmRpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHI6IHN0cmluZyk6IChcbiAgICBmaWxlczogc3RyaW5nW10sIGdyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdKSA9PiBib29sZWFuIHtcbiAgLy8gQ3JlYXRlcyBhIGR5bmFtaWMgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lmaWVkIGV4cHJlc3Npb24uXG4gIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgd2lsbCBiZSBgZmlsZXNgIGFzIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHN1cHBvcnRlZCBgZmlsZXNgIHZhcmlhYmxlIHRoYXRcbiAgLy8gY2FuIGJlIGFjY2Vzc2VkIGluIFB1bGxBcHByb3ZlIGNvbmRpdGlvbiBleHByZXNzaW9ucy4gVGhlIHNlY29uZCBwYXJhbWV0ZXIgaXMgdGhlIGxpc3Qgb2ZcbiAgLy8gUHVsbEFwcHJvdmVHcm91cHMgdGhhdCBhcmUgYWNjZXNzaWJsZSBpbiB0aGUgY29uZGl0aW9uIGV4cHJlc3Npb25zLiBUaGUgZm9sbG93ZWQgcGFyYW1ldGVyc1xuICAvLyBjb3JyZXNwb25kIHRvIG90aGVyIGNvbnRleHQgdmFyaWFibGVzIHByb3ZpZGVkIGJ5IFB1bGxBcHByb3ZlIGZvciBjb25kaXRpb25zLlxuICBjb25zdCBldmFsdWF0ZUZuID0gbmV3IEZ1bmN0aW9uKCdmaWxlcycsICdncm91cHMnLCAuLi5PYmplY3Qua2V5cyhjb25kaXRpb25Db250ZXh0KSwgYFxuICAgIHJldHVybiAoJHt0cmFuc2Zvcm1FeHByZXNzaW9uVG9KcyhleHByKX0pO1xuICBgKTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBkeW5hbWljYWxseSBjb25zdHJ1Y3RlZCBmdW5jdGlvbiB3aGljaCBtaW1pY3NcbiAgLy8gdGhlIGNvbmRpdGlvbiBleHByZXNzaW9uIHRoYXQgaXMgdXN1YWxseSBldmFsdWF0ZWQgd2l0aCBQeXRob24gaW4gUHVsbEFwcHJvdmUuXG4gIHJldHVybiAoZmlsZXMsIGdyb3VwcykgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IGV2YWx1YXRlRm4oXG4gICAgICAgIG5ldyBQdWxsQXBwcm92ZVN0cmluZ0FycmF5KC4uLmZpbGVzKSwgbmV3IFB1bGxBcHByb3ZlR3JvdXBBcnJheSguLi5ncm91cHMpLFxuICAgICAgICAuLi5PYmplY3QudmFsdWVzKGNvbmRpdGlvbkNvbnRleHQpKTtcbiAgICAvLyBJZiBhbiBhcnJheSBpcyByZXR1cm5lZCwgd2UgY29uc2lkZXIgdGhlIGNvbmRpdGlvbiBhcyBhY3RpdmUgaWYgdGhlIGFycmF5IGlzIG5vdFxuICAgIC8vIGVtcHR5LiBUaGlzIG1hdGNoZXMgUHVsbEFwcHJvdmUncyBjb25kaXRpb24gZXZhbHVhdGlvbiB0aGF0IGlzIGJhc2VkIG9uIFB5dGhvbi5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCAhPT0gMDtcbiAgICB9XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYSBjb25kaXRpb24gZXhwcmVzc2lvbiBmcm9tIFB1bGxBcHByb3ZlIHRoYXQgaXMgYmFzZWQgb24gcHl0aG9uXG4gKiBzbyB0aGF0IGl0IGNhbiBiZSBydW4gaW5zaWRlIEphdmFTY3JpcHQuIEN1cnJlbnQgdHJhbnNmb3JtYXRpb25zOlxuICogICAxLiBgbm90IDwuLj5gIC0+IGAhPC4uPmBcbiAqL1xuZnVuY3Rpb24gdHJhbnNmb3JtRXhwcmVzc2lvblRvSnMoZXhwcmVzc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGV4cHJlc3Npb24ucmVwbGFjZSgvbm90XFxzKy9nLCAnIScpO1xufVxuIl19