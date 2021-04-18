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
        /** List of discovered target labels for the PR. */
        var matches = [];
        var _loop_1 = function (label) {
            var match = config.labels.find(function (_a) {
                var pattern = _a.pattern;
                return string_pattern_1.matchesPattern(label, pattern);
            });
            if (match !== undefined) {
                matches.push(match);
            }
        };
        try {
            for (var labels_1 = tslib_1.__values(labels), labels_1_1 = labels_1.next(); !labels_1_1.done; labels_1_1 = labels_1.next()) {
                var label = labels_1_1.value;
                _loop_1(label);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (labels_1_1 && !labels_1_1.done && (_a = labels_1.return)) _a.call(labels_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (matches.length === 1) {
            return matches[0];
        }
        if (matches.length === 0) {
            throw new InvalidTargetLabelError('Unable to determine target for the PR as it has no target label.');
        }
        throw new InvalidTargetLabelError('Unable to determine target for the PR as it has multiple target labels.');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFyZ2V0LWxhYmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL21lcmdlL3RhcmdldC1sYWJlbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7Ozs7O0lBR0gscUZBQWdEO0lBRWhEOzs7T0FHRztJQUNIO1FBQ0Usa0NBQW1CLGNBQXNCO1lBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQUcsQ0FBQztRQUMvQywrQkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksNERBQXdCO0lBSXJDOzs7T0FHRztJQUNIO1FBQ0UsaUNBQW1CLGNBQXNCO1lBQXRCLG1CQUFjLEdBQWQsY0FBYyxDQUFRO1FBQUcsQ0FBQztRQUMvQyw4QkFBQztJQUFELENBQUMsQUFGRCxJQUVDO0lBRlksMERBQXVCO0lBSXBDLG9FQUFvRTtJQUNwRSxTQUFnQiw2QkFBNkIsQ0FDekMsTUFBbUMsRUFBRSxNQUFnQjs7UUFDdkQsbURBQW1EO1FBQ25ELElBQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQztnQ0FDUixLQUFLO1lBQ2QsSUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBQyxFQUFTO29CQUFSLE9BQU8sYUFBQTtnQkFBTSxPQUFBLCtCQUFjLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQztZQUE5QixDQUE4QixDQUFDLENBQUM7WUFDaEYsSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO2dCQUN2QixPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ3JCOzs7WUFKSCxLQUFvQixJQUFBLFdBQUEsaUJBQUEsTUFBTSxDQUFBLDhCQUFBO2dCQUFyQixJQUFNLEtBQUssbUJBQUE7d0JBQUwsS0FBSzthQUtmOzs7Ozs7Ozs7UUFDRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3hCLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25CO1FBQ0QsSUFBSSxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN4QixNQUFNLElBQUksdUJBQXVCLENBQzdCLGtFQUFrRSxDQUFDLENBQUM7U0FDekU7UUFDRCxNQUFNLElBQUksdUJBQXVCLENBQzdCLHlFQUF5RSxDQUFDLENBQUM7SUFDakYsQ0FBQztJQW5CRCxzRUFtQkM7SUFFRDs7Ozs7T0FLRztJQUNILFNBQXNCLDBCQUEwQixDQUM1QyxLQUFrQixFQUFFLGtCQUEwQjs7Ozs7OzZCQUN6QyxDQUFBLE9BQU8sS0FBSyxDQUFDLFFBQVEsS0FBSyxVQUFVLENBQUEsRUFBcEMsd0JBQW9DO3dCQUFHLHFCQUFNLEtBQUssQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBQTs7d0JBQXhDLEtBQUEsU0FBd0MsQ0FBQTs7NEJBQ3hDLHFCQUFNLEtBQUssQ0FBQyxRQUFRLEVBQUE7O3dCQUFwQixLQUFBLFNBQW9CLENBQUE7OzRCQURsRSwwQkFDbUU7Ozs7S0FDcEU7SUFKRCxnRUFJQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01lcmdlQ29uZmlnLCBUYXJnZXRMYWJlbH0gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHttYXRjaGVzUGF0dGVybn0gZnJvbSAnLi9zdHJpbmctcGF0dGVybic7XG5cbi8qKlxuICogVW5pcXVlIGVycm9yIHRoYXQgY2FuIGJlIHRocm93biBpbiB0aGUgbWVyZ2UgY29uZmlndXJhdGlvbiBpZiBhblxuICogaW52YWxpZCBicmFuY2ggaXMgdGFyZ2V0ZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkVGFyZ2V0QnJhbmNoRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZmFpbHVyZU1lc3NhZ2U6IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBVbmlxdWUgZXJyb3IgdGhhdCBjYW4gYmUgdGhyb3duIGluIHRoZSBtZXJnZSBjb25maWd1cmF0aW9uIGlmIGFuXG4gKiBpbnZhbGlkIGxhYmVsIGhhcyBiZWVuIGFwcGxpZWQgdG8gYSBwdWxsIHJlcXVlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmYWlsdXJlTWVzc2FnZTogc3RyaW5nKSB7fVxufVxuXG4vKiogR2V0cyB0aGUgdGFyZ2V0IGxhYmVsIGZyb20gdGhlIHNwZWNpZmllZCBwdWxsIHJlcXVlc3QgbGFiZWxzLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhcmdldExhYmVsRnJvbVB1bGxSZXF1ZXN0KFxuICAgIGNvbmZpZzogUGljazxNZXJnZUNvbmZpZywgJ2xhYmVscyc+LCBsYWJlbHM6IHN0cmluZ1tdKTogVGFyZ2V0TGFiZWwge1xuICAvKiogTGlzdCBvZiBkaXNjb3ZlcmVkIHRhcmdldCBsYWJlbHMgZm9yIHRoZSBQUi4gKi9cbiAgY29uc3QgbWF0Y2hlcyA9IFtdO1xuICBmb3IgKGNvbnN0IGxhYmVsIG9mIGxhYmVscykge1xuICAgIGNvbnN0IG1hdGNoID0gY29uZmlnLmxhYmVscy5maW5kKCh7cGF0dGVybn0pID0+IG1hdGNoZXNQYXR0ZXJuKGxhYmVsLCBwYXR0ZXJuKSk7XG4gICAgaWYgKG1hdGNoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIG1hdGNoZXMucHVzaChtYXRjaCk7XG4gICAgfVxuICB9XG4gIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBtYXRjaGVzWzBdO1xuICB9XG4gIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBJbnZhbGlkVGFyZ2V0TGFiZWxFcnJvcihcbiAgICAgICAgJ1VuYWJsZSB0byBkZXRlcm1pbmUgdGFyZ2V0IGZvciB0aGUgUFIgYXMgaXQgaGFzIG5vIHRhcmdldCBsYWJlbC4nKTtcbiAgfVxuICB0aHJvdyBuZXcgSW52YWxpZFRhcmdldExhYmVsRXJyb3IoXG4gICAgICAnVW5hYmxlIHRvIGRldGVybWluZSB0YXJnZXQgZm9yIHRoZSBQUiBhcyBpdCBoYXMgbXVsdGlwbGUgdGFyZ2V0IGxhYmVscy4nKTtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBicmFuY2hlcyBmcm9tIHRoZSBzcGVjaWZpZWQgdGFyZ2V0IGxhYmVsLlxuICpcbiAqIEB0aHJvd3Mge0ludmFsaWRUYXJnZXRMYWJlbEVycm9yfSBJbnZhbGlkIGxhYmVsIGhhcyBiZWVuIGFwcGxpZWQgdG8gcHVsbCByZXF1ZXN0LlxuICogQHRocm93cyB7SW52YWxpZFRhcmdldEJyYW5jaEVycm9yfSBJbnZhbGlkIEdpdGh1YiB0YXJnZXQgYnJhbmNoIGhhcyBiZWVuIHNlbGVjdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QnJhbmNoZXNGcm9tVGFyZ2V0TGFiZWwoXG4gICAgbGFiZWw6IFRhcmdldExhYmVsLCBnaXRodWJUYXJnZXRCcmFuY2g6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgcmV0dXJuIHR5cGVvZiBsYWJlbC5icmFuY2hlcyA9PT0gJ2Z1bmN0aW9uJyA/IGF3YWl0IGxhYmVsLmJyYW5jaGVzKGdpdGh1YlRhcmdldEJyYW5jaCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgbGFiZWwuYnJhbmNoZXM7XG59XG4iXX0=