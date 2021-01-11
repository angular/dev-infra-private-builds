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
    exports.getBranchesFromTargetLabel = exports.getTargetLabelFromPullRequest = exports.InvalidTargetLabelError = exports.InvalidTargetBranchError = void 0;
    var tslib_1 = require("tslib");
    var string_pattern_1 = require("@angular/dev-infra-private/pr/merge/string-pattern");
    /**
     * Unique error that can be thrown in the merge configuration if an
     * invalid branch is targeted.
     */
    var InvalidTargetBranchError = /** @class */ (function () {
        function InvalidTargetBranchError(failureMessage) {
            this.failureMessage = failureMessage;
        }
        return InvalidTargetBranchError;
    }());
    exports.InvalidTargetBranchError = InvalidTargetBranchError;
    /**
     * Unique error that can be thrown in the merge configuration if an
     * invalid label has been applied to a pull request.
     */
    var InvalidTargetLabelError = /** @class */ (function () {
        function InvalidTargetLabelError(failureMessage) {
            this.failureMessage = failureMessage;
        }
        return InvalidTargetLabelError;
    }());
    exports.InvalidTargetLabelError = InvalidTargetLabelError;
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
    /**
     * Gets the branches from the specified target label.
     *
     * @throws {InvalidTargetLabelError} Invalid label has been applied to pull request.
     * @throws {InvalidTargetBranchError} Invalid Github target branch has been selected.
     */
    function getBranchesFromTargetLabel(label, githubTargetBranch) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(typeof label.branches === 'function')) return [3 /*break*/, 2];
                        return [4 /*yield*/, label.branches(githubTargetBranch)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, label.branches];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, _a];
                }
            });
        });
    }
    exports.getBranchesFromTargetLabel = getBranchesFromTargetLabel;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gscUZBQWdEO0lBRWhEOzs7T0FHRztJQUNIO1FBQ0Usa0NBQW1CLGNBQXNCO1lBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQUcsQ0FBQztRQUMvQywrQkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksNERBQXdCO0lBSXJDOzs7T0FHRztJQUNIO1FBQ0UsaUNBQW1CLGNBQXNCO1lBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQUcsQ0FBQztRQUMvQyw4QkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksMERBQXVCO0lBSXBDLG9FQUFvRTtJQUNwRSxTQUFnQiw2QkFBNkIsQ0FDekMsTUFBbUMsRUFBRSxNQUFnQjs7Z0NBQzVDLEtBQUs7WUFDZCxJQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLEVBQVM7b0JBQVIsT0FBTyxhQUFBO2dCQUFNLE9BQUEsK0JBQWMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDO1lBQTlCLENBQThCLENBQUMsQ0FBQztZQUNoRixJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0NBQ2hCLEtBQUs7YUFDYjs7O1lBSkgsS0FBb0IsSUFBQSxXQUFBLGlCQUFBLE1BQU0sQ0FBQSw4QkFBQTtnQkFBckIsSUFBTSxLQUFLLG1CQUFBO3NDQUFMLEtBQUs7OzthQUtmOzs7Ozs7Ozs7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFURCxzRUFTQztJQUVEOzs7OztPQUtHO0lBQ0gsU0FBc0IsMEJBQTBCLENBQzVDLEtBQWtCLEVBQUUsa0JBQTBCOzs7Ozs7NkJBQ3pDLENBQUEsT0FBTyxLQUFLLENBQUMsUUFBUSxLQUFLLFVBQVUsQ0FBQSxFQUFwQyx3QkFBb0M7d0JBQUcscUJBQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFBOzt3QkFBeEMsS0FBQSxTQUF3QyxDQUFBOzs0QkFDeEMscUJBQU0sS0FBSyxDQUFDLFFBQVEsRUFBQTs7d0JBQXBCLEtBQUEsU0FBb0IsQ0FBQTs7NEJBRGxFLDBCQUNtRTs7OztLQUNwRTtJQUpELGdFQUlDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TWVyZ2VDb25maWcsIFRhcmdldExhYmVsfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQge21hdGNoZXNQYXR0ZXJufSBmcm9tICcuL3N0cmluZy1wYXR0ZXJuJztcblxuLyoqXG4gKiBVbmlxdWUgZXJyb3IgdGhhdCBjYW4gYmUgdGhyb3duIGluIHRoZSBtZXJnZSBjb25maWd1cmF0aW9uIGlmIGFuXG4gKiBpbnZhbGlkIGJyYW5jaCBpcyB0YXJnZXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIEludmFsaWRUYXJnZXRCcmFuY2hFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmYWlsdXJlTWVzc2FnZTogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIFVuaXF1ZSBlcnJvciB0aGF0IGNhbiBiZSB0aHJvd24gaW4gdGhlIG1lcmdlIGNvbmZpZ3VyYXRpb24gaWYgYW5cbiAqIGludmFsaWQgbGFiZWwgaGFzIGJlZW4gYXBwbGllZCB0byBhIHB1bGwgcmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIEludmFsaWRUYXJnZXRMYWJlbEVycm9yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGZhaWx1cmVNZXNzYWdlOiBzdHJpbmcpIHt9XG59XG5cbi8qKiBHZXRzIHRoZSB0YXJnZXQgbGFiZWwgZnJvbSB0aGUgc3BlY2lmaWVkIHB1bGwgcmVxdWVzdCBsYWJlbHMuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFyZ2V0TGFiZWxGcm9tUHVsbFJlcXVlc3QoXG4gICAgY29uZmlnOiBQaWNrPE1lcmdlQ29uZmlnLCAnbGFiZWxzJz4sIGxhYmVsczogc3RyaW5nW10pOiBUYXJnZXRMYWJlbHxudWxsIHtcbiAgZm9yIChjb25zdCBsYWJlbCBvZiBsYWJlbHMpIHtcbiAgICBjb25zdCBtYXRjaCA9IGNvbmZpZy5sYWJlbHMuZmluZCgoe3BhdHRlcm59KSA9PiBtYXRjaGVzUGF0dGVybihsYWJlbCwgcGF0dGVybikpO1xuICAgIGlmIChtYXRjaCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfVxuICB9XG4gIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEdldHMgdGhlIGJyYW5jaGVzIGZyb20gdGhlIHNwZWNpZmllZCB0YXJnZXQgbGFiZWwuXG4gKlxuICogQHRocm93cyB7SW52YWxpZFRhcmdldExhYmVsRXJyb3J9IEludmFsaWQgbGFiZWwgaGFzIGJlZW4gYXBwbGllZCB0byBwdWxsIHJlcXVlc3QuXG4gKiBAdGhyb3dzIHtJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3J9IEludmFsaWQgR2l0aHViIHRhcmdldCBicmFuY2ggaGFzIGJlZW4gc2VsZWN0ZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCcmFuY2hlc0Zyb21UYXJnZXRMYWJlbChcbiAgICBsYWJlbDogVGFyZ2V0TGFiZWwsIGdpdGh1YlRhcmdldEJyYW5jaDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICByZXR1cm4gdHlwZW9mIGxhYmVsLmJyYW5jaGVzID09PSAnZnVuY3Rpb24nID8gYXdhaXQgbGFiZWwuYnJhbmNoZXMoZ2l0aHViVGFyZ2V0QnJhbmNoKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBsYWJlbC5icmFuY2hlcztcbn1cbiJdfQ==