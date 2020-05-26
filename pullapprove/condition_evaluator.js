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
        define("@angular/dev-infra-private/pullapprove/condition_evaluator", ["require", "exports", "tslib", "minimatch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.convertConditionToFunction = void 0;
    var tslib_1 = require("tslib");
    var minimatch_1 = require("minimatch");
    /** Map that holds patterns and their corresponding Minimatch globs. */
    var patternCache = new Map();
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
            return files.some(function (f) { return patterns.some(function (pattern) { return getOrCreateGlob(pattern).match(f); }); });
        }
    };
    /**
     * Converts a given condition to a function that accepts a set of files. The returned
     * function can be called to check if the set of files matches the condition.
     */
    function convertConditionToFunction(expr) {
        // Creates a dynamic function with the specified expression. The first parameter will
        // be `files` as that corresponds to the supported `files` variable that can be accessed
        // in PullApprove condition expressions. The followed parameters correspond to other
        // context variables provided by PullApprove for conditions.
        var evaluateFn = new (Function.bind.apply(Function, tslib_1.__spread([void 0, 'files'], Object.keys(conditionContext), ["\n    return (" + transformExpressionToJs(expr) + ");\n  "])))();
        // Create a function that calls the dynamically constructed function which mimics
        // the condition expression that is usually evaluated with Python in PullApprove.
        return function (files) {
            var result = evaluateFn.apply(void 0, tslib_1.__spread([new (PullApproveArray.bind.apply(PullApproveArray, tslib_1.__spread([void 0], files)))()], Object.values(conditionContext)));
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
    /**
     * Superset of a native array. The superset provides methods which mimic the
     * list data structure used in PullApprove for files in conditions.
     */
    var PullApproveArray = /** @class */ (function (_super) {
        tslib_1.__extends(PullApproveArray, _super);
        function PullApproveArray() {
            var elements = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                elements[_i] = arguments[_i];
            }
            var _this = _super.apply(this, tslib_1.__spread(elements)) || this;
            // Set the prototype explicitly because in ES5, the prototype is accidentally
            // lost due to a limitation in down-leveling.
            // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
            Object.setPrototypeOf(_this, PullApproveArray.prototype);
            return _this;
        }
        /** Returns a new array which only includes files that match the given pattern. */
        PullApproveArray.prototype.include = function (pattern) {
            return new (PullApproveArray.bind.apply(PullApproveArray, tslib_1.__spread([void 0], this.filter(function (s) { return getOrCreateGlob(pattern).match(s); }))))();
        };
        /** Returns a new array which only includes files that did not match the given pattern. */
        PullApproveArray.prototype.exclude = function (pattern) {
            return new (PullApproveArray.bind.apply(PullApproveArray, tslib_1.__spread([void 0], this.filter(function (s) { return !getOrCreateGlob(pattern).match(s); }))))();
        };
        return PullApproveArray;
    }(Array));
    /**
     * Gets a glob for the given pattern. The cached glob will be returned
     * if available. Otherwise a new glob will be created and cached.
     */
    function getOrCreateGlob(pattern) {
        if (patternCache.has(pattern)) {
            return patternCache.get(pattern);
        }
        var glob = new minimatch_1.Minimatch(pattern, { dot: true });
        patternCache.set(pattern, glob);
        return glob;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFFSCx1Q0FBZ0Q7SUFFaEQsdUVBQXVFO0lBQ3ZFLElBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFzQixDQUFDO0lBRW5EOzs7O09BSUc7SUFDSCxJQUFNLGdCQUFnQixHQUFHO1FBQ3ZCLEtBQUssRUFBRSxVQUFDLEtBQVksSUFBSyxPQUFBLEtBQUssQ0FBQyxNQUFNLEVBQVosQ0FBWTtRQUNyQyxvQkFBb0IsRUFBRSxVQUFDLEtBQXVCLEVBQUUsUUFBa0I7WUFDaEUsMkVBQTJFO1lBQzNFLHNFQUFzRTtZQUN0RSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTyxJQUFJLE9BQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxFQUEzRCxDQUEyRCxDQUFDLENBQUM7UUFDdEYsQ0FBQztLQUNGLENBQUM7SUFFRjs7O09BR0c7SUFDSCxTQUFnQiwwQkFBMEIsQ0FBQyxJQUFZO1FBQ3JELHFGQUFxRjtRQUNyRix3RkFBd0Y7UUFDeEYsb0ZBQW9GO1FBQ3BGLDREQUE0RDtRQUM1RCxJQUFNLFVBQVUsUUFBTyxRQUFRLFlBQVIsUUFBUSw0QkFBQyxPQUFPLEdBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFFLG1CQUMvRCx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsV0FDeEMsTUFBQyxDQUFDO1FBRUgsaUZBQWlGO1FBQ2pGLGlGQUFpRjtRQUNqRixPQUFPLFVBQUEsS0FBSztZQUNWLElBQU0sTUFBTSxHQUFHLFVBQVUsc0NBQUssZ0JBQWdCLFlBQWhCLGdCQUFnQiw2QkFBSSxLQUFLLFFBQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDLENBQUM7WUFDOUYsbUZBQW1GO1lBQ25GLGtGQUFrRjtZQUNsRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ3pCLE9BQU8sTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDbEIsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQXBCRCxnRUFvQkM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxVQUFrQjtRQUNqRCxPQUFPLFVBQVUsQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRDs7O09BR0c7SUFDSDtRQUErQiw0Q0FBYTtRQUMxQztZQUFZLGtCQUFxQjtpQkFBckIsVUFBcUIsRUFBckIscUJBQXFCLEVBQXJCLElBQXFCO2dCQUFyQiw2QkFBcUI7O1lBQWpDLGdEQUNXLFFBQVEsV0FNbEI7WUFKQyw2RUFBNkU7WUFDN0UsNkNBQTZDO1lBQzdDLGlIQUFpSDtZQUNqSCxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7UUFDMUQsQ0FBQztRQUVELGtGQUFrRjtRQUNsRixrQ0FBTyxHQUFQLFVBQVEsT0FBZTtZQUNyQixZQUFXLGdCQUFnQixZQUFoQixnQkFBZ0IsNkJBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQWpDLENBQWlDLENBQUMsTUFBRTtRQUN0RixDQUFDO1FBRUQsMEZBQTBGO1FBQzFGLGtDQUFPLEdBQVAsVUFBUSxPQUFlO1lBQ3JCLFlBQVcsZ0JBQWdCLFlBQWhCLGdCQUFnQiw2QkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFsQyxDQUFrQyxDQUFDLE1BQUU7UUFDdkYsQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQW5CRCxDQUErQixLQUFLLEdBbUJuQztJQUVEOzs7T0FHRztJQUNILFNBQVMsZUFBZSxDQUFDLE9BQWU7UUFDdEMsSUFBSSxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzdCLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUUsQ0FBQztTQUNuQztRQUNELElBQU0sSUFBSSxHQUFHLElBQUkscUJBQVMsQ0FBQyxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUNqRCxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNoQyxPQUFPLElBQUksQ0FBQztJQUNkLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SU1pbmltYXRjaCwgTWluaW1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuXG4vKiogTWFwIHRoYXQgaG9sZHMgcGF0dGVybnMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgTWluaW1hdGNoIGdsb2JzLiAqL1xuY29uc3QgcGF0dGVybkNhY2hlID0gbmV3IE1hcDxzdHJpbmcsIElNaW5pbWF0Y2g+KCk7XG5cbi8qKlxuICogQ29udGV4dCB0aGF0IGlzIHByb3ZpZGVkIHRvIGNvbmRpdGlvbnMuIENvbmRpdGlvbnMgY2FuIHVzZSB2YXJpb3VzIGhlbHBlcnNcbiAqIHRoYXQgUHVsbEFwcHJvdmUgcHJvdmlkZXMuIFdlIHRyeSB0byBtb2NrIHRoZW0gaGVyZS4gQ29uc3VsdCB0aGUgb2ZmaWNpYWxcbiAqIGRvY3MgZm9yIG1vcmUgZGV0YWlsczogaHR0cHM6Ly9kb2NzLnB1bGxhcHByb3ZlLmNvbS9jb25maWcvY29uZGl0aW9ucy5cbiAqL1xuY29uc3QgY29uZGl0aW9uQ29udGV4dCA9IHtcbiAgJ2xlbic6ICh2YWx1ZTogYW55W10pID0+IHZhbHVlLmxlbmd0aCxcbiAgJ2NvbnRhaW5zX2FueV9nbG9icyc6IChmaWxlczogUHVsbEFwcHJvdmVBcnJheSwgcGF0dGVybnM6IHN0cmluZ1tdKSA9PiB7XG4gICAgLy8gTm90ZTogRG8gbm90IGFsd2F5cyBjcmVhdGUgZ2xvYnMgZm9yIHRoZSBzYW1lIHBhdHRlcm4gYWdhaW4uIFRoaXMgbWV0aG9kXG4gICAgLy8gY291bGQgYmUgY2FsbGVkIGZvciBlYWNoIHNvdXJjZSBmaWxlLiBDcmVhdGluZyBnbG9iJ3MgaXMgZXhwZW5zaXZlLlxuICAgIHJldHVybiBmaWxlcy5zb21lKGYgPT4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChmKSkpO1xuICB9XG59O1xuXG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gY29uZGl0aW9uIHRvIGEgZnVuY3Rpb24gdGhhdCBhY2NlcHRzIGEgc2V0IG9mIGZpbGVzLiBUaGUgcmV0dXJuZWRcbiAqIGZ1bmN0aW9uIGNhbiBiZSBjYWxsZWQgdG8gY2hlY2sgaWYgdGhlIHNldCBvZiBmaWxlcyBtYXRjaGVzIHRoZSBjb25kaXRpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbihleHByOiBzdHJpbmcpOiAoZmlsZXM6IHN0cmluZ1tdKSA9PiBib29sZWFuIHtcbiAgLy8gQ3JlYXRlcyBhIGR5bmFtaWMgZnVuY3Rpb24gd2l0aCB0aGUgc3BlY2lmaWVkIGV4cHJlc3Npb24uIFRoZSBmaXJzdCBwYXJhbWV0ZXIgd2lsbFxuICAvLyBiZSBgZmlsZXNgIGFzIHRoYXQgY29ycmVzcG9uZHMgdG8gdGhlIHN1cHBvcnRlZCBgZmlsZXNgIHZhcmlhYmxlIHRoYXQgY2FuIGJlIGFjY2Vzc2VkXG4gIC8vIGluIFB1bGxBcHByb3ZlIGNvbmRpdGlvbiBleHByZXNzaW9ucy4gVGhlIGZvbGxvd2VkIHBhcmFtZXRlcnMgY29ycmVzcG9uZCB0byBvdGhlclxuICAvLyBjb250ZXh0IHZhcmlhYmxlcyBwcm92aWRlZCBieSBQdWxsQXBwcm92ZSBmb3IgY29uZGl0aW9ucy5cbiAgY29uc3QgZXZhbHVhdGVGbiA9IG5ldyBGdW5jdGlvbignZmlsZXMnLCAuLi5PYmplY3Qua2V5cyhjb25kaXRpb25Db250ZXh0KSwgYFxuICAgIHJldHVybiAoJHt0cmFuc2Zvcm1FeHByZXNzaW9uVG9KcyhleHByKX0pO1xuICBgKTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiB0aGF0IGNhbGxzIHRoZSBkeW5hbWljYWxseSBjb25zdHJ1Y3RlZCBmdW5jdGlvbiB3aGljaCBtaW1pY3NcbiAgLy8gdGhlIGNvbmRpdGlvbiBleHByZXNzaW9uIHRoYXQgaXMgdXN1YWxseSBldmFsdWF0ZWQgd2l0aCBQeXRob24gaW4gUHVsbEFwcHJvdmUuXG4gIHJldHVybiBmaWxlcyA9PiB7XG4gICAgY29uc3QgcmVzdWx0ID0gZXZhbHVhdGVGbihuZXcgUHVsbEFwcHJvdmVBcnJheSguLi5maWxlcyksIC4uLk9iamVjdC52YWx1ZXMoY29uZGl0aW9uQ29udGV4dCkpO1xuICAgIC8vIElmIGFuIGFycmF5IGlzIHJldHVybmVkLCB3ZSBjb25zaWRlciB0aGUgY29uZGl0aW9uIGFzIGFjdGl2ZSBpZiB0aGUgYXJyYXkgaXMgbm90XG4gICAgLy8gZW1wdHkuIFRoaXMgbWF0Y2hlcyBQdWxsQXBwcm92ZSdzIGNvbmRpdGlvbiBldmFsdWF0aW9uIHRoYXQgaXMgYmFzZWQgb24gUHl0aG9uLlxuICAgIGlmIChBcnJheS5pc0FycmF5KHJlc3VsdCkpIHtcbiAgICAgIHJldHVybiByZXN1bHQubGVuZ3RoICE9PSAwO1xuICAgIH1cbiAgICByZXR1cm4gISFyZXN1bHQ7XG4gIH07XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyBhIGNvbmRpdGlvbiBleHByZXNzaW9uIGZyb20gUHVsbEFwcHJvdmUgdGhhdCBpcyBiYXNlZCBvbiBweXRob25cbiAqIHNvIHRoYXQgaXQgY2FuIGJlIHJ1biBpbnNpZGUgSmF2YVNjcmlwdC4gQ3VycmVudCB0cmFuc2Zvcm1hdGlvbnM6XG4gKiAgIDEuIGBub3QgPC4uPmAgLT4gYCE8Li4+YFxuICovXG5mdW5jdGlvbiB0cmFuc2Zvcm1FeHByZXNzaW9uVG9KcyhleHByZXNzaW9uOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZXhwcmVzc2lvbi5yZXBsYWNlKC9ub3RcXHMrL2csICchJyk7XG59XG5cbi8qKlxuICogU3VwZXJzZXQgb2YgYSBuYXRpdmUgYXJyYXkuIFRoZSBzdXBlcnNldCBwcm92aWRlcyBtZXRob2RzIHdoaWNoIG1pbWljIHRoZVxuICogbGlzdCBkYXRhIHN0cnVjdHVyZSB1c2VkIGluIFB1bGxBcHByb3ZlIGZvciBmaWxlcyBpbiBjb25kaXRpb25zLlxuICovXG5jbGFzcyBQdWxsQXBwcm92ZUFycmF5IGV4dGVuZHMgQXJyYXk8c3RyaW5nPiB7XG4gIGNvbnN0cnVjdG9yKC4uLmVsZW1lbnRzOiBzdHJpbmdbXSkge1xuICAgIHN1cGVyKC4uLmVsZW1lbnRzKTtcblxuICAgIC8vIFNldCB0aGUgcHJvdG90eXBlIGV4cGxpY2l0bHkgYmVjYXVzZSBpbiBFUzUsIHRoZSBwcm90b3R5cGUgaXMgYWNjaWRlbnRhbGx5XG4gICAgLy8gbG9zdCBkdWUgdG8gYSBsaW1pdGF0aW9uIGluIGRvd24tbGV2ZWxpbmcuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3dpa2kvRkFRI3doeS1kb2VzbnQtZXh0ZW5kaW5nLWJ1aWx0LWlucy1saWtlLWVycm9yLWFycmF5LWFuZC1tYXAtd29yay5cbiAgICBPYmplY3Quc2V0UHJvdG90eXBlT2YodGhpcywgUHVsbEFwcHJvdmVBcnJheS5wcm90b3R5cGUpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBuZXcgYXJyYXkgd2hpY2ggb25seSBpbmNsdWRlcyBmaWxlcyB0aGF0IG1hdGNoIHRoZSBnaXZlbiBwYXR0ZXJuLiAqL1xuICBpbmNsdWRlKHBhdHRlcm46IHN0cmluZyk6IFB1bGxBcHByb3ZlQXJyYXkge1xuICAgIHJldHVybiBuZXcgUHVsbEFwcHJvdmVBcnJheSguLi50aGlzLmZpbHRlcihzID0+IGdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChzKSkpO1xuICB9XG5cbiAgLyoqIFJldHVybnMgYSBuZXcgYXJyYXkgd2hpY2ggb25seSBpbmNsdWRlcyBmaWxlcyB0aGF0IGRpZCBub3QgbWF0Y2ggdGhlIGdpdmVuIHBhdHRlcm4uICovXG4gIGV4Y2x1ZGUocGF0dGVybjogc3RyaW5nKTogUHVsbEFwcHJvdmVBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUFycmF5KC4uLnRoaXMuZmlsdGVyKHMgPT4gIWdldE9yQ3JlYXRlR2xvYihwYXR0ZXJuKS5tYXRjaChzKSkpO1xuICB9XG59XG5cbi8qKlxuICogR2V0cyBhIGdsb2IgZm9yIHRoZSBnaXZlbiBwYXR0ZXJuLiBUaGUgY2FjaGVkIGdsb2Igd2lsbCBiZSByZXR1cm5lZFxuICogaWYgYXZhaWxhYmxlLiBPdGhlcndpc2UgYSBuZXcgZ2xvYiB3aWxsIGJlIGNyZWF0ZWQgYW5kIGNhY2hlZC5cbiAqL1xuZnVuY3Rpb24gZ2V0T3JDcmVhdGVHbG9iKHBhdHRlcm46IHN0cmluZykge1xuICBpZiAocGF0dGVybkNhY2hlLmhhcyhwYXR0ZXJuKSkge1xuICAgIHJldHVybiBwYXR0ZXJuQ2FjaGUuZ2V0KHBhdHRlcm4pITtcbiAgfVxuICBjb25zdCBnbG9iID0gbmV3IE1pbmltYXRjaChwYXR0ZXJuLCB7ZG90OiB0cnVlfSk7XG4gIHBhdHRlcm5DYWNoZS5zZXQocGF0dGVybiwgZ2xvYik7XG4gIHJldHVybiBnbG9iO1xufVxuIl19