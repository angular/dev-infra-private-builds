"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertConditionToFunction = void 0;
const pullapprove_arrays_1 = require("./pullapprove_arrays");
const utils_1 = require("./utils");
/**
 * Context that is provided to conditions. Conditions can use various helpers
 * that PullApprove provides. We try to mock them here. Consult the official
 * docs for more details: https://docs.pullapprove.com/config/conditions.
 */
const conditionContext = {
    'len': (value) => value.length,
    'contains_any_globs': (files, patterns) => {
        // Note: Do not always create globs for the same pattern again. This method
        // could be called for each source file. Creating glob's is expensive.
        return files.some((f) => patterns.some((pattern) => (0, utils_1.getOrCreateGlob)(pattern).match(f)));
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
    const evaluateFn = new Function('files', 'groups', ...Object.keys(conditionContext), `
    return (${transformExpressionToJs(expr)});
  `);
    // Create a function that calls the dynamically constructed function which mimics
    // the condition expression that is usually evaluated with Python in PullApprove.
    return (files, groups) => {
        const result = evaluateFn(new pullapprove_arrays_1.PullApproveStringArray(...files), new pullapprove_arrays_1.PullApproveGroupArray(...groups), ...Object.values(conditionContext));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUdILDZEQUFtRjtBQUNuRixtQ0FBd0M7QUFFeEM7Ozs7R0FJRztBQUNILE1BQU0sZ0JBQWdCLEdBQUc7SUFDdkIsS0FBSyxFQUFFLENBQUMsS0FBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTTtJQUNyQyxvQkFBb0IsRUFBRSxDQUFDLEtBQTZCLEVBQUUsUUFBa0IsRUFBRSxFQUFFO1FBQzFFLDJFQUEyRTtRQUMzRSxzRUFBc0U7UUFDdEUsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxJQUFBLHVCQUFlLEVBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxRixDQUFDO0NBQ0YsQ0FBQztBQUVGOzs7R0FHRztBQUNILFNBQWdCLDBCQUEwQixDQUN4QyxJQUFZO0lBRVosNERBQTREO0lBQzVELGlHQUFpRztJQUNqRyw0RkFBNEY7SUFDNUYsOEZBQThGO0lBQzlGLGdGQUFnRjtJQUNoRixNQUFNLFVBQVUsR0FBRyxJQUFJLFFBQVEsQ0FDN0IsT0FBTyxFQUNQLFFBQVEsRUFDUixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFDaEM7Y0FDVSx1QkFBdUIsQ0FBQyxJQUFJLENBQUM7R0FDeEMsQ0FDQSxDQUFDO0lBRUYsaUZBQWlGO0lBQ2pGLGlGQUFpRjtJQUNqRixPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3ZCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FDdkIsSUFBSSwyQ0FBc0IsQ0FBQyxHQUFHLEtBQUssQ0FBQyxFQUNwQyxJQUFJLDBDQUFxQixDQUFDLEdBQUcsTUFBTSxDQUFDLEVBQ3BDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUNuQyxDQUFDO1FBQ0YsbUZBQW1GO1FBQ25GLGtGQUFrRjtRQUNsRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQztTQUM1QjtRQUNELE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUNsQixDQUFDLENBQUM7QUFDSixDQUFDO0FBaENELGdFQWdDQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLHVCQUF1QixDQUFDLFVBQWtCO0lBQ2pELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDNUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXB9IGZyb20gJy4vZ3JvdXAnO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwQXJyYXksIFB1bGxBcHByb3ZlU3RyaW5nQXJyYXl9IGZyb20gJy4vcHVsbGFwcHJvdmVfYXJyYXlzJztcbmltcG9ydCB7Z2V0T3JDcmVhdGVHbG9ifSBmcm9tICcuL3V0aWxzJztcblxuLyoqXG4gKiBDb250ZXh0IHRoYXQgaXMgcHJvdmlkZWQgdG8gY29uZGl0aW9ucy4gQ29uZGl0aW9ucyBjYW4gdXNlIHZhcmlvdXMgaGVscGVyc1xuICogdGhhdCBQdWxsQXBwcm92ZSBwcm92aWRlcy4gV2UgdHJ5IHRvIG1vY2sgdGhlbSBoZXJlLiBDb25zdWx0IHRoZSBvZmZpY2lhbFxuICogZG9jcyBmb3IgbW9yZSBkZXRhaWxzOiBodHRwczovL2RvY3MucHVsbGFwcHJvdmUuY29tL2NvbmZpZy9jb25kaXRpb25zLlxuICovXG5jb25zdCBjb25kaXRpb25Db250ZXh0ID0ge1xuICAnbGVuJzogKHZhbHVlOiBhbnlbXSkgPT4gdmFsdWUubGVuZ3RoLFxuICAnY29udGFpbnNfYW55X2dsb2JzJzogKGZpbGVzOiBQdWxsQXBwcm92ZVN0cmluZ0FycmF5LCBwYXR0ZXJuczogc3RyaW5nW10pID0+IHtcbiAgICAvLyBOb3RlOiBEbyBub3QgYWx3YXlzIGNyZWF0ZSBnbG9icyBmb3IgdGhlIHNhbWUgcGF0dGVybiBhZ2Fpbi4gVGhpcyBtZXRob2RcbiAgICAvLyBjb3VsZCBiZSBjYWxsZWQgZm9yIGVhY2ggc291cmNlIGZpbGUuIENyZWF0aW5nIGdsb2IncyBpcyBleHBlbnNpdmUuXG4gICAgcmV0dXJuIGZpbGVzLnNvbWUoKGYpID0+IHBhdHRlcm5zLnNvbWUoKHBhdHRlcm4pID0+IGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChmKSkpO1xuICB9LFxufTtcblxuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIGNvbmRpdGlvbiB0byBhIGZ1bmN0aW9uIHRoYXQgYWNjZXB0cyBhIHNldCBvZiBmaWxlcy4gVGhlIHJldHVybmVkXG4gKiBmdW5jdGlvbiBjYW4gYmUgY2FsbGVkIHRvIGNoZWNrIGlmIHRoZSBzZXQgb2YgZmlsZXMgbWF0Y2hlcyB0aGUgY29uZGl0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oXG4gIGV4cHI6IHN0cmluZyxcbik6IChmaWxlczogc3RyaW5nW10sIGdyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdKSA9PiBib29sZWFuIHtcbiAgLy8gQ3JlYXRlcyBhIGR5bmFtaWMgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lmaWVkIGV4cHJlc3Npb24uXG4gIC8vIFRoZSBmaXJzdCBwYXJhbWV0ZXIgd2lsbCBiZSBgZmlsZXNgIGFzIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHN1cHBvcnRlZCBgZmlsZXNgIHZhcmlhYmxlIHRoYXRcbiAgLy8gY2FuIGJlIGFjY2Vzc2VkIGluIFB1bGxBcHByb3ZlIGNvbmRpdGlvbiBleHByZXNzaW9ucy4gVGhlIHNlY29uZCBwYXJhbWV0ZXIgaXMgdGhlIGxpc3Qgb2ZcbiAgLy8gUHVsbEFwcHJvdmVHcm91cHMgdGhhdCBhcmUgYWNjZXNzaWJsZSBpbiB0aGUgY29uZGl0aW9uIGV4cHJlc3Npb25zLiBUaGUgZm9sbG93ZWQgcGFyYW1ldGVyc1xuICAvLyBjb3JyZXNwb25kIHRvIG90aGVyIGNvbnRleHQgdmFyaWFibGVzIHByb3ZpZGVkIGJ5IFB1bGxBcHByb3ZlIGZvciBjb25kaXRpb25zLlxuICBjb25zdCBldmFsdWF0ZUZuID0gbmV3IEZ1bmN0aW9uKFxuICAgICdmaWxlcycsXG4gICAgJ2dyb3VwcycsXG4gICAgLi4uT2JqZWN0LmtleXMoY29uZGl0aW9uQ29udGV4dCksXG4gICAgYFxuICAgIHJldHVybiAoJHt0cmFuc2Zvcm1FeHByZXNzaW9uVG9KcyhleHByKX0pO1xuICBgLFxuICApO1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIGR5bmFtaWNhbGx5IGNvbnN0cnVjdGVkIGZ1bmN0aW9uIHdoaWNoIG1pbWljc1xuICAvLyB0aGUgY29uZGl0aW9uIGV4cHJlc3Npb24gdGhhdCBpcyB1c3VhbGx5IGV2YWx1YXRlZCB3aXRoIFB5dGhvbiBpbiBQdWxsQXBwcm92ZS5cbiAgcmV0dXJuIChmaWxlcywgZ3JvdXBzKSA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdGVGbihcbiAgICAgIG5ldyBQdWxsQXBwcm92ZVN0cmluZ0FycmF5KC4uLmZpbGVzKSxcbiAgICAgIG5ldyBQdWxsQXBwcm92ZUdyb3VwQXJyYXkoLi4uZ3JvdXBzKSxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoY29uZGl0aW9uQ29udGV4dCksXG4gICAgKTtcbiAgICAvLyBJZiBhbiBhcnJheSBpcyByZXR1cm5lZCwgd2UgY29uc2lkZXIgdGhlIGNvbmRpdGlvbiBhcyBhY3RpdmUgaWYgdGhlIGFycmF5IGlzIG5vdFxuICAgIC8vIGVtcHR5LiBUaGlzIG1hdGNoZXMgUHVsbEFwcHJvdmUncyBjb25kaXRpb24gZXZhbHVhdGlvbiB0aGF0IGlzIGJhc2VkIG9uIFB5dGhvbi5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShyZXN1bHQpKSB7XG4gICAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCAhPT0gMDtcbiAgICB9XG4gICAgcmV0dXJuICEhcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgYSBjb25kaXRpb24gZXhwcmVzc2lvbiBmcm9tIFB1bGxBcHByb3ZlIHRoYXQgaXMgYmFzZWQgb24gcHl0aG9uXG4gKiBzbyB0aGF0IGl0IGNhbiBiZSBydW4gaW5zaWRlIEphdmFTY3JpcHQuIEN1cnJlbnQgdHJhbnNmb3JtYXRpb25zOlxuICogICAxLiBgbm90IDwuLj5gIC0+IGAhPC4uPmBcbiAqL1xuZnVuY3Rpb24gdHJhbnNmb3JtRXhwcmVzc2lvblRvSnMoZXhwcmVzc2lvbjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGV4cHJlc3Npb24ucmVwbGFjZSgvbm90XFxzKy9nLCAnIScpO1xufVxuIl19