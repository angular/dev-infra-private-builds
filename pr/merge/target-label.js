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
    exports.getBranchesFromTargetLabel = exports.getTargetLabelFromPullRequest = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gscUZBQWdEO0lBRWhELG9FQUFvRTtJQUNwRSxTQUFnQiw2QkFBNkIsQ0FBQyxNQUFtQixFQUFFLE1BQWdCOztnQ0FFdEUsS0FBSztZQUNkLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQUMsRUFBUztvQkFBUixPQUFPLGFBQUE7Z0JBQU0sT0FBQSwrQkFBYyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUM7WUFBOUIsQ0FBOEIsQ0FBQyxDQUFDO1lBQ2hGLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtnQ0FDaEIsS0FBSzthQUNiOzs7WUFKSCxLQUFvQixJQUFBLFdBQUEsaUJBQUEsTUFBTSxDQUFBLDhCQUFBO2dCQUFyQixJQUFNLEtBQUssbUJBQUE7c0NBQUwsS0FBSzs7O2FBS2Y7Ozs7Ozs7OztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQVRELHNFQVNDO0lBRUQseURBQXlEO0lBQ3pELFNBQWdCLDBCQUEwQixDQUN0QyxLQUFrQixFQUFFLGtCQUEwQjtRQUNoRCxPQUFPLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztJQUNwRyxDQUFDO0lBSEQsZ0VBR0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtNZXJnZUNvbmZpZywgVGFyZ2V0TGFiZWx9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCB7bWF0Y2hlc1BhdHRlcm59IGZyb20gJy4vc3RyaW5nLXBhdHRlcm4nO1xuXG4vKiogR2V0cyB0aGUgdGFyZ2V0IGxhYmVsIGZyb20gdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgbGFiZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KGNvbmZpZzogTWVyZ2VDb25maWcsIGxhYmVsczogc3RyaW5nW10pOiBUYXJnZXRMYWJlbHxcbiAgICBudWxsIHtcbiAgZm9yIChjb25zdCBsYWJlbCBvZiBsYWJlbHMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGNvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PiBtYXRjaGVzUGF0dGVybihsYWJlbCwgcGF0dGVybikpO1xuICAgIGlmIChtYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKiogR2V0cyB0aGUgYnJhbmNoZXMgZnJvbSB0aGUgc3BlY2lmaWVkIHRhcmdldCBsYWJlbC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbChcbiAgICBsYWJlbDogVGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nKTogc3RyaW5nW10ge1xuICByZXR1cm4gdHlwZW9mIGxhYmVsLmJyYW5jaGVzID09PSAnZnVuY3Rpb24nID8gbGFiZWwuYnJhbmNoZXMoZ2l0aHViVGFyZ2V0QnJhbmNoKSA6IGxhYmVsLmJyYW5jaGVzO1xufVxuIl19