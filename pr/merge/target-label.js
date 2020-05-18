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
        define("@angular/dev-infra-private/pr/merge/target-label", ["require", "exports", "tslib", "@angular/dev-infra-private/pr/merge/string-pattern"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    /** Gets the target label from the specified pull request labels. */
    function getTargetLabelFromPullRequest(config, labels) {
        var e_1, _a;
        var _loop_1 = function (label) {
            var match = config.labels.find(function (_a) {
                var pattern = _a.pattern;
                return string_pattern_1.matchesPattern(label, pattern);
            });
            if (match !== undefined) {
                return { value: match };
            }
        };
        try {
            for (var labels_1 = tslib_1.__values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
                var label = labels_1_1.value;
                var state_1 = _loop_1(label);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return null;
    }
    exports.getTargetLabelFromPullRequest = getTargetLabelFromPullRequest;
    /** Gets the branches from the specified target label. */
    function getBranchesFromTargetLabel(label, githubTargetBranch) {
        return typeof label.branches === 'function' ? label.branches(githubTargetBranch) : label.branches;
    }
    exports.getBranchesFromTargetLabel = getBranchesFromTargetLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7SUFHSCxxRkFBZ0Q7SUFFaEQsb0VBQW9FO0lBQ3BFLFNBQWdCLDZCQUE2QixDQUFDLE1BQW1CLEVBQUUsTUFBZ0I7O2dDQUV0RSxLQUFLO1lBQ2QsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFTO29CQUFSLG9CQUFPO2dCQUFNLE9BQUEsK0JBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1lBQTlCLENBQThCLENBQUMsQ0FBQztZQUNoRixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0NBQ2hCLEtBQUs7YUFDYjs7O1lBSkgsS0FBb0IsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQTtnQkFBckIsSUFBTSxLQUFLLG1CQUFBO3NDQUFMLEtBQUs7OzthQUtmOzs7Ozs7Ozs7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFURCxzRUFTQztJQUVELHlEQUF5RDtJQUN6RCxTQUFnQiwwQkFBMEIsQ0FDdEMsS0FBa0IsRUFBRSxrQkFBMEI7UUFDaEQsT0FBTyxPQUFPLEtBQUssQ0FBQyxRQUFRLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUM7SUFDcEcsQ0FBQztJQUhELGdFQUdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TWVyZ2VDb25maWcsIFRhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcblxuLyoqIEdldHMgdGhlIHRhcmdldCBsYWJlbCBmcm9tIHRoZSBzcGVjaWZpZWQgcHVsbCByZXF1ZXN0IGxhYmVscy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUYXJnZXRMYWJlbEZyb21QdWxsUmVxdWVzdChjb25maWc6IE1lcmdlQ29uZmlnLCBsYWJlbHM6IHN0cmluZ1tdKTogVGFyZ2V0TGFiZWx8XG4gICAgbnVsbCB7XG4gIGZvciAoY29uc3QgbGFiZWwgb2YgbGFiZWxzKSB7XG4gICAgY29uc3QgbWF0Y2ggPSBjb25maWcubGFiZWxzLmZpbmQoKHtwYXR0ZXJufSkgPT4gbWF0Y2hlc1BhdHRlcm4obGFiZWwsIHBhdHRlcm4pKTtcbiAgICBpZiAobWF0Y2ggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuLyoqIEdldHMgdGhlIGJyYW5jaGVzIGZyb20gdGhlIHNwZWNpZmllZCB0YXJnZXQgbGFiZWwuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwoXG4gICAgbGFiZWw6IFRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZyk6IHN0cmluZ1tdIHtcbiAgcmV0dXJuIHR5cGVvZiBsYWJlbC5icmFuY2hlcyA9PT0gJ2Z1bmN0aW9uJyA/IGxhYmVsLmJyYW5jaGVzKGdpdGh1YlRhcmdldEJyYW5jaCkgOiBsYWJlbC5icmFuY2hlcztcbn1cbiJdfQ==