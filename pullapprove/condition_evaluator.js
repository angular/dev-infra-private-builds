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
        var evaluateFn = new (Function.bind.apply(Function, tslib_1.__spreadArray(tslib_1.__spreadArray([void 0, 'files', 'groups'], tslib_1.__read(Object.keys(conditionContext))), ["\n    return (" + transformExpressionToJs(expr) + ");\n  "])))();
        // Create a function that calls the dynamically constructed function which mimics
        // the condition expression that is usually evaluated with Python in PullApprove.
        return function (files, groups) {
            var result = evaluateFn.apply(void 0, tslib_1.__spreadArray([new (pullapprove_arrays_1.PullApproveStringArray.bind.apply(pullapprove_arrays_1.PullApproveStringArray, tslib_1.__spreadArray([void 0], tslib_1.__read(files))))(), new (pullapprove_arrays_1.PullApproveGroupArray.bind.apply(pullapprove_arrays_1.PullApproveGroupArray, tslib_1.__spreadArray([void 0], tslib_1.__read(groups))))()], tslib_1.__read(Object.values(conditionContext))));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFHSCxnR0FBbUY7SUFDbkYsc0VBQXdDO0lBRXhDOzs7O09BSUc7SUFDSCxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLEtBQUssRUFBRSxVQUFDLEtBQVksSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWTtRQUNyQyxvQkFBb0IsRUFBRSxVQUFDLEtBQTZCLEVBQUUsUUFBa0I7WUFDdEUsMkVBQTJFO1lBQzNFLHNFQUFzRTtZQUN0RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsdUJBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQWpDLENBQWlDLENBQUMsRUFBM0QsQ0FBMkQsQ0FBQyxDQUFDO1FBQ3RGLENBQUM7S0FDRixDQUFDO0lBRUY7OztPQUdHO0lBQ0gsU0FBZ0IsMEJBQTBCLENBQUMsSUFBWTtRQUVyRCw0REFBNEQ7UUFDNUQsaUdBQWlHO1FBQ2pHLDRGQUE0RjtRQUM1Riw4RkFBOEY7UUFDOUYsZ0ZBQWdGO1FBQ2hGLElBQU0sVUFBVSxRQUFPLFFBQVEsWUFBUixRQUFRLHVEQUFDLE9BQU8sRUFBRSxRQUFRLGtCQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBRSxtQkFDekUsdUJBQXVCLENBQUMsSUFBSSxDQUFDLFdBQ3hDLE1BQUMsQ0FBQztRQUVILGlGQUFpRjtRQUNqRixpRkFBaUY7UUFDakYsT0FBTyxVQUFDLEtBQUssRUFBRSxNQUFNO1lBQ25CLElBQU0sTUFBTSxHQUFHLFVBQVUsMkNBQ2pCLDJDQUFzQixZQUF0QiwyQ0FBc0IsaURBQUksS0FBSyxhQUFPLDBDQUFxQixZQUFyQiwwQ0FBcUIsaURBQUksTUFBTSx3QkFDdEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFDLENBQUM7WUFDeEMsbUZBQW1GO1lBQ25GLGtGQUFrRjtZQUNsRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQXhCRCxnRUF3QkM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxVQUFrQjtRQUNqRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwfSBmcm9tICcuL2dyb3VwJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cEFycmF5LCBQdWxsQXBwcm92ZVN0cmluZ0FycmF5fSBmcm9tICcuL3B1bGxhcHByb3ZlX2FycmF5cyc7XG5pbXBvcnQge2dldE9yQ3JlYXRlR2xvYn0gZnJvbSAnLi91dGlscyc7XG5cbi8qKlxuICogQ29udGV4dCB0aGF0IGlzIHByb3ZpZGVkIHRvIGNvbmRpdGlvbnMuIENvbmRpdGlvbnMgY2FuIHVzZSB2YXJpb3VzIGhlbHBlcnNcbiAqIHRoYXQgUHVsbEFwcHJvdmUgcHJvdmlkZXMuIFdlIHRyeSB0byBtb2NrIHRoZW0gaGVyZS4gQ29uc3VsdCB0aGUgb2ZmaWNpYWxcbiAqIGRvY3MgZm9yIG1vcmUgZGV0YWlsczogaHR0cHM6Ly9kb2NzLnB1bGxhcHByb3ZlLmNvbS9jb25maWcvY29uZGl0aW9ucy5cbiAqL1xuY29uc3QgY29uZGl0aW9uQ29udGV4dCA9IHtcbiAgJ2xlbic6ICh2YWx1ZTogYW55W10pID0+IHZhbHVlLmxlbmd0aCxcbiAgJ2NvbnRhaW5zX2FueV9nbG9icyc6IChmaWxlczogUHVsbEFwcHJvdmVTdHJpbmdBcnJheSwgcGF0dGVybnM6IHN0cmluZ1tdKSA9PiB7XG4gICAgLy8gTm90ZTogRG8gbm90IGFsd2F5cyBjcmVhdGUgZ2xvYnMgZm9yIHRoZSBzYW1lIHBhdHRlcm4gYWdhaW4uIFRoaXMgbWV0aG9kXG4gICAgLy8gY291bGQgYmUgY2FsbGVkIGZvciBlYWNoIHNvdXJjZSBmaWxlLiBDcmVhdGluZyBnbG9iJ3MgaXMgZXhwZW5zaXZlLlxuICAgIHJldHVybiBmaWxlcy5zb21lKGYgPT4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChmKSkpO1xuICB9LFxufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIGNvbmRpdGlvbiB0byBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIHNldCBvZiBmaWxlcy4gVGhlIHJldHVybmVkXG4gKiBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHRvIGNoZWNrIGlmIHRoZSBzZXQgb2YgZmlsZXMgbWF0Y2hlcyB0aGUgY29uZGl0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcjogc3RyaW5nKTogKFxuICAgIGZpbGVzOiBzdHJpbmdbXSwgZ3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10pID0+IGJvb2xlYW4ge1xuICAvLyBDcmVhdGVzIGEgZHluYW1pYyBmdW5jdGlvbiB3aXRoIHRoZSBzcGVjaWZpZWQgZXhwcmVzc2lvbi5cbiAgLy8gVGhlIGZpcnN0IHBhcmFtZXRlciB3aWxsIGJlIGBmaWxlc2AgYXMgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgc3VwcG9ydGVkIGBmaWxlc2AgdmFyaWFibGUgdGhhdFxuICAvLyBjYW4gYmUgYWNjZXNzZWQgaW4gUHVsbEFwcHJvdmUgY29uZGl0aW9uIGV4cHJlc3Npb25zLiBUaGUgc2Vjb25kIHBhcmFtZXRlciBpcyB0aGUgbGlzdCBvZlxuICAvLyBQdWxsQXBwcm92ZUdyb3VwcyB0aGF0IGFyZSBhY2Nlc3NpYmxlIGluIHRoZSBjb25kaXRpb24gZXhwcmVzc2lvbnMuIFRoZSBmb2xsb3dlZCBwYXJhbWV0ZXJzXG4gIC8vIGNvcnJlc3BvbmQgdG8gb3RoZXIgY29udGV4dCB2YXJpYWJsZXMgcHJvdmlkZWQgYnkgUHVsbEFwcHJvdmUgZm9yIGNvbmRpdGlvbnMuXG4gIGNvbnN0IGV2YWx1YXRlRm4gPSBuZXcgRnVuY3Rpb24oJ2ZpbGVzJywgJ2dyb3VwcycsIC4uLk9iamVjdC5rZXlzKGNvbmRpdGlvbkNvbnRleHQpLCBgXG4gICAgcmV0dXJuICgke3RyYW5zZm9ybUV4cHJlc3Npb25Ub0pzKGV4cHIpfSk7XG4gIGApO1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIGR5bmFtaWNhbGx5IGNvbnN0cnVjdGVkIGZ1bmN0aW9uIHdoaWNoIG1pbWljc1xuICAvLyB0aGUgY29uZGl0aW9uIGV4cHJlc3Npb24gdGhhdCBpcyB1c3VhbGx5IGV2YWx1YXRlZCB3aXRoIFB5dGhvbiBpbiBQdWxsQXBwcm92ZS5cbiAgcmV0dXJuIChmaWxlcywgZ3JvdXBzKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdGVGbihcbiAgICAgICAgbmV3IFB1bGxBcHByb3ZlU3RyaW5nQXJyYXkoLi4uZmlsZXMpLCBuZXcgUHVsbEFwcHJvdmVHcm91cEFycmF5KC4uLmdyb3VwcyksXG4gICAgICAgIC4uLk9iamVjdC52YWx1ZXMoY29uZGl0aW9uQ29udGV4dCkpO1xuICAgIC8vIElmIGFuIGFycmF5IGlzIHJldHVybmVkLCB3ZSBjb25zaWRlciB0aGUgY29uZGl0aW9uIGFzIGFjdGl2ZSBpZiB0aGUgYXJyYXkgaXMgbm90XG4gICAgLy8gZW1wdHkuIFRoaXMgbWF0Y2hlcyBQdWxsQXBwcm92ZSdzIGNvbmRpdGlvbiBldmFsdWF0aW9uIHRoYXQgaXMgYmFzZWQgb24gUHl0aG9uLlxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgIHJldHVybiByZXN1bHQubGVuZ3RoICE9PSAwO1xuICAgIH1cbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIGNvbmRpdGlvbiBleHByZXNzaW9uIGZyb20gUHVsbEFwcHJvdmUgdGhhdCBpcyBiYXNlZCBvbiBweXRob25cbiAqIHNvIHRoYXQgaXQgY2FuIGJlIHJ1biBpbnNpZGUgSmF2YVNjcmlwdC4gQ3VycmVudCB0cmFuc2Zvcm1hdGlvbnM6XG4gKiAgIDEuIGBub3QgPC4uPmAgLT4gYCE8Li4+YFxuICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1FeHByZXNzaW9uVG9KcyhleHByZXNzaW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZXhwcmVzc2lvbi5yZXBsYWNlKC9ub3RcXHMrL2csICchJyk7XG59XG4iXX0=