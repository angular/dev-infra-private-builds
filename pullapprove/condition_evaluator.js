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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZGl0aW9uX2V2YWx1YXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9jb25kaXRpb25fZXZhbHVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILHVDQUFnRDtJQUVoRCx1RUFBdUU7SUFDdkUsSUFBTSxZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXNCLENBQUM7SUFFbkQ7Ozs7T0FJRztJQUNILElBQU0sZ0JBQWdCLEdBQUc7UUFDdkIsS0FBSyxFQUFFLFVBQUMsS0FBWSxJQUFLLE9BQUEsS0FBSyxDQUFDLE1BQU0sRUFBWixDQUFZO1FBQ3JDLG9CQUFvQixFQUFFLFVBQUMsS0FBdUIsRUFBRSxRQUFrQjtZQUNoRSwyRUFBMkU7WUFDM0Usc0VBQXNFO1lBQ3RFLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQSxPQUFPLElBQUksT0FBQSxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFqQyxDQUFpQyxDQUFDLEVBQTNELENBQTJELENBQUMsQ0FBQztRQUN0RixDQUFDO0tBQ0YsQ0FBQztJQUVGOzs7T0FHRztJQUNILFNBQWdCLDBCQUEwQixDQUFDLElBQVk7UUFDckQscUZBQXFGO1FBQ3JGLHdGQUF3RjtRQUN4RixvRkFBb0Y7UUFDcEYsNERBQTREO1FBQzVELElBQU0sVUFBVSxRQUFPLFFBQVEsWUFBUixRQUFRLDRCQUFDLE9BQU8sR0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUUsbUJBQy9ELHVCQUF1QixDQUFDLElBQUksQ0FBQyxXQUN4QyxNQUFDLENBQUM7UUFFSCxpRkFBaUY7UUFDakYsaUZBQWlGO1FBQ2pGLE9BQU8sVUFBQSxLQUFLO1lBQ1YsSUFBTSxNQUFNLEdBQUcsVUFBVSxzQ0FBSyxnQkFBZ0IsWUFBaEIsZ0JBQWdCLDZCQUFJLEtBQUssUUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEVBQUMsQ0FBQztZQUM5RixtRkFBbUY7WUFDbkYsa0ZBQWtGO1lBQ2xGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUM7SUFDSixDQUFDO0lBcEJELGdFQW9CQztJQUVEOzs7O09BSUc7SUFDSCxTQUFTLHVCQUF1QixDQUFDLFVBQWtCO1FBQ2pELE9BQU8sVUFBVSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVEOzs7T0FHRztJQUNIO1FBQStCLDRDQUFhO1FBQzFDO1lBQVksa0JBQXFCO2lCQUFyQixVQUFxQixFQUFyQixxQkFBcUIsRUFBckIsSUFBcUI7Z0JBQXJCLDZCQUFxQjs7WUFBakMsZ0RBQ1csUUFBUSxXQU1sQjtZQUpDLDZFQUE2RTtZQUM3RSw2Q0FBNkM7WUFDN0MsaUhBQWlIO1lBQ2pILE1BQU0sQ0FBQyxjQUFjLENBQUMsS0FBSSxFQUFFLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztRQUMxRCxDQUFDO1FBRUQsa0ZBQWtGO1FBQ2xGLGtDQUFPLEdBQVAsVUFBUSxPQUFlO1lBQ3JCLFlBQVcsZ0JBQWdCLFlBQWhCLGdCQUFnQiw2QkFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsZUFBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBakMsQ0FBaUMsQ0FBQyxNQUFFO1FBQ3RGLENBQUM7UUFFRCwwRkFBMEY7UUFDMUYsa0NBQU8sR0FBUCxVQUFRLE9BQWU7WUFDckIsWUFBVyxnQkFBZ0IsWUFBaEIsZ0JBQWdCLDZCQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQWxDLENBQWtDLENBQUMsTUFBRTtRQUN2RixDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBbkJELENBQStCLEtBQUssR0FtQm5DO0lBRUQ7OztPQUdHO0lBQ0gsU0FBUyxlQUFlLENBQUMsT0FBZTtRQUN0QyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDN0IsT0FBTyxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBRSxDQUFDO1NBQ25DO1FBQ0QsSUFBTSxJQUFJLEdBQUcsSUFBSSxxQkFBUyxDQUFDLE9BQU8sRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBQ2pELFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2hDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJTWluaW1hdGNoLCBNaW5pbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5cbi8qKiBNYXAgdGhhdCBob2xkcyBwYXR0ZXJucyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBNaW5pbWF0Y2ggZ2xvYnMuICovXG5jb25zdCBwYXR0ZXJuQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgSU1pbmltYXRjaD4oKTtcblxuLyoqXG4gKiBDb250ZXh0IHRoYXQgaXMgcHJvdmlkZWQgdG8gY29uZGl0aW9ucy4gQ29uZGl0aW9ucyBjYW4gdXNlIHZhcmlvdXMgaGVscGVyc1xuICogdGhhdCBQdWxsQXBwcm92ZSBwcm92aWRlcy4gV2UgdHJ5IHRvIG1vY2sgdGhlbSBoZXJlLiBDb25zdWx0IHRoZSBvZmZpY2lhbFxuICogZG9jcyBmb3IgbW9yZSBkZXRhaWxzOiBodHRwczovL2RvY3MucHVsbGFwcHJvdmUuY29tL2NvbmZpZy9jb25kaXRpb25zLlxuICovXG5jb25zdCBjb25kaXRpb25Db250ZXh0ID0ge1xuICAnbGVuJzogKHZhbHVlOiBhbnlbXSkgPT4gdmFsdWUubGVuZ3RoLFxuICAnY29udGFpbnNfYW55X2dsb2JzJzogKGZpbGVzOiBQdWxsQXBwcm92ZUFycmF5LCBwYXR0ZXJuczogc3RyaW5nW10pID0+IHtcbiAgICAvLyBOb3RlOiBEbyBub3QgYWx3YXlzIGNyZWF0ZSBnbG9icyBmb3IgdGhlIHNhbWUgcGF0dGVybiBhZ2Fpbi4gVGhpcyBtZXRob2RcbiAgICAvLyBjb3VsZCBiZSBjYWxsZWQgZm9yIGVhY2ggc291cmNlIGZpbGUuIENyZWF0aW5nIGdsb2IncyBpcyBleHBlbnNpdmUuXG4gICAgcmV0dXJuIGZpbGVzLnNvbWUoZiA9PiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gZ2V0T3JDcmVhdGVHbG9iKHBhdHRlcm4pLm1hdGNoKGYpKSk7XG4gIH1cbn07XG5cbi8qKlxuICogQ29udmVydHMgYSBnaXZlbiBjb25kaXRpb24gdG8gYSBmdW5jdGlvbiB0aGF0IGFjY2VwdHMgYSBzZXQgb2YgZmlsZXMuIFRoZSByZXR1cm5lZFxuICogZnVuY3Rpb24gY2FuIGJlIGNhbGxlZCB0byBjaGVjayBpZiB0aGUgc2V0IG9mIGZpbGVzIG1hdGNoZXMgdGhlIGNvbmRpdGlvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHI6IHN0cmluZyk6IChmaWxlczogc3RyaW5nW10pID0+IGJvb2xlYW4ge1xuICAvLyBDcmVhdGVzIGEgZHluYW1pYyBmdW5jdGlvbiB3aXRoIHRoZSBzcGVjaWZpZWQgZXhwcmVzc2lvbi4gVGhlIGZpcnN0IHBhcmFtZXRlciB3aWxsXG4gIC8vIGJlIGBmaWxlc2AgYXMgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgc3VwcG9ydGVkIGBmaWxlc2AgdmFyaWFibGUgdGhhdCBjYW4gYmUgYWNjZXNzZWRcbiAgLy8gaW4gUHVsbEFwcHJvdmUgY29uZGl0aW9uIGV4cHJlc3Npb25zLiBUaGUgZm9sbG93ZWQgcGFyYW1ldGVycyBjb3JyZXNwb25kIHRvIG90aGVyXG4gIC8vIGNvbnRleHQgdmFyaWFibGVzIHByb3ZpZGVkIGJ5IFB1bGxBcHByb3ZlIGZvciBjb25kaXRpb25zLlxuICBjb25zdCBldmFsdWF0ZUZuID0gbmV3IEZ1bmN0aW9uKCdmaWxlcycsIC4uLk9iamVjdC5rZXlzKGNvbmRpdGlvbkNvbnRleHQpLCBgXG4gICAgcmV0dXJuICgke3RyYW5zZm9ybUV4cHJlc3Npb25Ub0pzKGV4cHIpfSk7XG4gIGApO1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIHRoYXQgY2FsbHMgdGhlIGR5bmFtaWNhbGx5IGNvbnN0cnVjdGVkIGZ1bmN0aW9uIHdoaWNoIG1pbWljc1xuICAvLyB0aGUgY29uZGl0aW9uIGV4cHJlc3Npb24gdGhhdCBpcyB1c3VhbGx5IGV2YWx1YXRlZCB3aXRoIFB5dGhvbiBpbiBQdWxsQXBwcm92ZS5cbiAgcmV0dXJuIGZpbGVzID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBldmFsdWF0ZUZuKG5ldyBQdWxsQXBwcm92ZUFycmF5KC4uLmZpbGVzKSwgLi4uT2JqZWN0LnZhbHVlcyhjb25kaXRpb25Db250ZXh0KSk7XG4gICAgLy8gSWYgYW4gYXJyYXkgaXMgcmV0dXJuZWQsIHdlIGNvbnNpZGVyIHRoZSBjb25kaXRpb24gYXMgYWN0aXZlIGlmIHRoZSBhcnJheSBpcyBub3RcbiAgICAvLyBlbXB0eS4gVGhpcyBtYXRjaGVzIFB1bGxBcHByb3ZlJ3MgY29uZGl0aW9uIGV2YWx1YXRpb24gdGhhdCBpcyBiYXNlZCBvbiBQeXRob24uXG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgcmV0dXJuIHJlc3VsdC5sZW5ndGggIT09IDA7XG4gICAgfVxuICAgIHJldHVybiAhIXJlc3VsdDtcbiAgfTtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIGEgY29uZGl0aW9uIGV4cHJlc3Npb24gZnJvbSBQdWxsQXBwcm92ZSB0aGF0IGlzIGJhc2VkIG9uIHB5dGhvblxuICogc28gdGhhdCBpdCBjYW4gYmUgcnVuIGluc2lkZSBKYXZhU2NyaXB0LiBDdXJyZW50IHRyYW5zZm9ybWF0aW9uczpcbiAqICAgMS4gYG5vdCA8Li4+YCAtPiBgITwuLj5gXG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybUV4cHJlc3Npb25Ub0pzKGV4cHJlc3Npb246IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBleHByZXNzaW9uLnJlcGxhY2UoL25vdFxccysvZywgJyEnKTtcbn1cblxuLyoqXG4gKiBTdXBlcnNldCBvZiBhIG5hdGl2ZSBhcnJheS4gVGhlIHN1cGVyc2V0IHByb3ZpZGVzIG1ldGhvZHMgd2hpY2ggbWltaWMgdGhlXG4gKiBsaXN0IGRhdGEgc3RydWN0dXJlIHVzZWQgaW4gUHVsbEFwcHJvdmUgZm9yIGZpbGVzIGluIGNvbmRpdGlvbnMuXG4gKi9cbmNsYXNzIFB1bGxBcHByb3ZlQXJyYXkgZXh0ZW5kcyBBcnJheTxzdHJpbmc+IHtcbiAgY29uc3RydWN0b3IoLi4uZWxlbWVudHM6IHN0cmluZ1tdKSB7XG4gICAgc3VwZXIoLi4uZWxlbWVudHMpO1xuXG4gICAgLy8gU2V0IHRoZSBwcm90b3R5cGUgZXhwbGljaXRseSBiZWNhdXNlIGluIEVTNSwgdGhlIHByb3RvdHlwZSBpcyBhY2NpZGVudGFsbHlcbiAgICAvLyBsb3N0IGR1ZSB0byBhIGxpbWl0YXRpb24gaW4gZG93bi1sZXZlbGluZy5cbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vTWljcm9zb2Z0L1R5cGVTY3JpcHQvd2lraS9GQVEjd2h5LWRvZXNudC1leHRlbmRpbmctYnVpbHQtaW5zLWxpa2UtZXJyb3ItYXJyYXktYW5kLW1hcC13b3JrLlxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBQdWxsQXBwcm92ZUFycmF5LnByb3RvdHlwZSk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIG5ldyBhcnJheSB3aGljaCBvbmx5IGluY2x1ZGVzIGZpbGVzIHRoYXQgbWF0Y2ggdGhlIGdpdmVuIHBhdHRlcm4uICovXG4gIGluY2x1ZGUocGF0dGVybjogc3RyaW5nKTogUHVsbEFwcHJvdmVBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBQdWxsQXBwcm92ZUFycmF5KC4uLnRoaXMuZmlsdGVyKHMgPT4gZ2V0T3JDcmVhdGVHbG9iKHBhdHRlcm4pLm1hdGNoKHMpKSk7XG4gIH1cblxuICAvKiogUmV0dXJucyBhIG5ldyBhcnJheSB3aGljaCBvbmx5IGluY2x1ZGVzIGZpbGVzIHRoYXQgZGlkIG5vdCBtYXRjaCB0aGUgZ2l2ZW4gcGF0dGVybi4gKi9cbiAgZXhjbHVkZShwYXR0ZXJuOiBzdHJpbmcpOiBQdWxsQXBwcm92ZUFycmF5IHtcbiAgICByZXR1cm4gbmV3IFB1bGxBcHByb3ZlQXJyYXkoLi4udGhpcy5maWx0ZXIocyA9PiAhZ2V0T3JDcmVhdGVHbG9iKHBhdHRlcm4pLm1hdGNoKHMpKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBHZXRzIGEgZ2xvYiBmb3IgdGhlIGdpdmVuIHBhdHRlcm4uIFRoZSBjYWNoZWQgZ2xvYiB3aWxsIGJlIHJldHVybmVkXG4gKiBpZiBhdmFpbGFibGUuIE90aGVyd2lzZSBhIG5ldyBnbG9iIHdpbGwgYmUgY3JlYXRlZCBhbmQgY2FjaGVkLlxuICovXG5mdW5jdGlvbiBnZXRPckNyZWF0ZUdsb2IocGF0dGVybjogc3RyaW5nKSB7XG4gIGlmIChwYXR0ZXJuQ2FjaGUuaGFzKHBhdHRlcm4pKSB7XG4gICAgcmV0dXJuIHBhdHRlcm5DYWNoZS5nZXQocGF0dGVybikhO1xuICB9XG4gIGNvbnN0IGdsb2IgPSBuZXcgTWluaW1hdGNoKHBhdHRlcm4sIHtkb3Q6IHRydWV9KTtcbiAgcGF0dGVybkNhY2hlLnNldChwYXR0ZXJuLCBnbG9iKTtcbiAgcmV0dXJuIGdsb2I7XG59XG4iXX0=