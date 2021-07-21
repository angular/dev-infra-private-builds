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
        define("@angular/dev-infra-private/pullapprove/group", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pullapprove/condition_evaluator", "@angular/dev-infra-private/pullapprove/pullapprove_arrays"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullApproveGroup = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var condition_evaluator_1 = require("@angular/dev-infra-private/pullapprove/condition_evaluator");
    var pullapprove_arrays_1 = require("@angular/dev-infra-private/pullapprove/pullapprove_arrays");
    // Regular expression that matches conditions for the global approval.
    var GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;
    /** A PullApprove group to be able to test files against. */
    var PullApproveGroup = /** @class */ (function () {
        function PullApproveGroup(groupName, config, precedingGroups) {
            if (precedingGroups === void 0) { precedingGroups = []; }
            var _a;
            this.groupName = groupName;
            this.precedingGroups = precedingGroups;
            /** List of conditions for the group. */
            this.conditions = [];
            this._captureConditions(config);
            this.reviewers = (_a = config.reviewers) !== null && _a !== void 0 ? _a : { users: [], teams: [] };
        }
        PullApproveGroup.prototype._captureConditions = function (config) {
            var _this = this;
            if (config.conditions) {
                return config.conditions.forEach(function (condition) {
                    var expression = condition.trim();
                    if (expression.match(GLOBAL_APPROVAL_CONDITION_REGEX)) {
                        // Currently a noop as we don't take any action for global approval conditions.
                        return;
                    }
                    try {
                        _this.conditions.push({
                            expression: expression,
                            checkFn: condition_evaluator_1.convertConditionToFunction(expression),
                            matchedFiles: new Set(),
                            unverifiable: false,
                        });
                    }
                    catch (e) {
                        console_1.error("Could not parse condition in group: " + _this.groupName);
                        console_1.error(" - " + expression);
                        console_1.error("Error:");
                        console_1.error(e.message);
                        console_1.error(e.stack);
                        process.exit(1);
                    }
                });
            }
        };
        /**
         * Tests a provided file path to determine if it would be considered matched by
         * the pull approve group's conditions.
         */
        PullApproveGroup.prototype.testFile = function (filePath) {
            var _this = this;
            return this.conditions.every(function (condition) {
                var matchedFiles = condition.matchedFiles, checkFn = condition.checkFn, expression = condition.expression;
                try {
                    var matchesFile = checkFn([filePath], _this.precedingGroups);
                    if (matchesFile) {
                        matchedFiles.add(filePath);
                    }
                    return matchesFile;
                }
                catch (e) {
                    // In the case of a condition that depends on the state of groups we want to
                    // ignore that the verification can't accurately evaluate the condition and then
                    // continue processing. Other types of errors fail the verification, as conditions
                    // should otherwise be able to execute without throwing.
                    if (e instanceof pullapprove_arrays_1.PullApproveGroupStateDependencyError) {
                        condition.unverifiable = true;
                        // Return true so that `this.conditions.every` can continue evaluating.
                        return true;
                    }
                    else {
                        var errMessage = "Condition could not be evaluated: \n\n" +
                            ("From the [" + _this.groupName + "] group:\n") +
                            (" - " + expression) +
                            ("\n\n" + e.message + " " + e.stack + "\n\n");
                        console_1.error(errMessage);
                        process.exit(1);
                    }
                }
            });
        };
        /** Retrieve the results for the Group, all matched and unmatched conditions. */
        PullApproveGroup.prototype.getResults = function () {
            var matchedConditions = this.conditions.filter(function (c) { return c.matchedFiles.size > 0; });
            var unmatchedConditions = this.conditions.filter(function (c) { return c.matchedFiles.size === 0 && !c.unverifiable; });
            var unverifiableConditions = this.conditions.filter(function (c) { return c.unverifiable; });
            return {
                matchedConditions: matchedConditions,
                matchedCount: matchedConditions.length,
                unmatchedConditions: unmatchedConditions,
                unmatchedCount: unmatchedConditions.length,
                unverifiableConditions: unverifiableConditions,
                groupName: this.groupName,
            };
        };
        return PullApproveGroup;
    }());
    exports.PullApproveGroup = PullApproveGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXVDO0lBQ3ZDLGtHQUFpRTtJQUVqRSxnR0FBMEU7SUF5QjFFLHNFQUFzRTtJQUN0RSxJQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0lBRTlGLDREQUE0RDtJQUM1RDtRQU1FLDBCQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0MsZUFBd0M7WUFBeEMsZ0NBQUEsRUFBQSxvQkFBd0M7O1lBRDFDLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7WUFQckQsd0NBQXdDO1lBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1lBT3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUEsTUFBTSxDQUFDLFNBQVMsbUNBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sNkNBQWtCLEdBQTFCLFVBQTJCLE1BQThCO1lBQXpELGlCQTJCQztZQTFCQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3JCLE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTO29CQUN4QyxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXBDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO3dCQUNyRCwrRUFBK0U7d0JBQy9FLE9BQU87cUJBQ1I7b0JBRUQsSUFBSTt3QkFDRixLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzs0QkFDbkIsVUFBVSxZQUFBOzRCQUNW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QzFDLHNCQUFzQix3QkFBQTtnQkFDdEIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO2FBQzFCLENBQUM7UUFDSixDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBM0ZELElBMkZDO0lBM0ZZLDRDQUFnQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Y29udmVydENvbmRpdGlvblRvRnVuY3Rpb259IGZyb20gJy4vY29uZGl0aW9uX2V2YWx1YXRvcic7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcn0gZnJvbSAnLi9wdWxsYXBwcm92ZV9hcnJheXMnO1xuXG4vKiogQSBjb25kaXRpb24gZm9yIGEgZ3JvdXAuICovXG5pbnRlcmZhY2UgR3JvdXBDb25kaXRpb24ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIGNoZWNrRm46IChmaWxlczogc3RyaW5nW10sIGdyb3VwczogUHVsbEFwcHJvdmVHcm91cFtdKSA9PiBib29sZWFuO1xuICBtYXRjaGVkRmlsZXM6IFNldDxzdHJpbmc+O1xuICB1bnZlcmlmaWFibGU6IGJvb2xlYW47XG59XG5cbmludGVyZmFjZSBHcm91cFJldmlld2VycyB7XG4gIHVzZXJzPzogc3RyaW5nW107XG4gIHRlYW1zPzogc3RyaW5nW107XG59XG5cbi8qKiBSZXN1bHQgb2YgdGVzdGluZyBmaWxlcyBhZ2FpbnN0IHRoZSBncm91cC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBtYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVubWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVudmVyaWZpYWJsZUNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgY29uZGl0aW9ucyBmb3IgdGhlIGdsb2JhbCBhcHByb3ZhbC5cbmNvbnN0IEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVggPSAvXlwiZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzXCIgbm90IGluIGdyb3Vwcy5hcHByb3ZlZCQvO1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLyoqIExpc3Qgb2YgY29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSBjb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG4gIC8qKiBMaXN0IG9mIHJldmlld2VycyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSByZXZpZXdlcnM6IEdyb3VwUmV2aWV3ZXJzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcsXG4gICAgICByZWFkb25seSBwcmVjZWRpbmdHcm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSA9IFtdKSB7XG4gICAgdGhpcy5fY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnKTtcbiAgICB0aGlzLnJldmlld2VycyA9IGNvbmZpZy5yZXZpZXdlcnMgPz8ge3VzZXJzOiBbXSwgdGVhbXM6IFtdfTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChjb25maWcuY29uZGl0aW9ucykge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb25kaXRpb25zLmZvckVhY2goY29uZGl0aW9uID0+IHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24ubWF0Y2goR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgY2hlY2tGbjogY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICAgIHVudmVyaWZpYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBlcnJvcihgQ291bGQgbm90IHBhcnNlIGNvbmRpdGlvbiBpbiBncm91cDogJHt0aGlzLmdyb3VwTmFtZX1gKTtcbiAgICAgICAgICBlcnJvcihgIC0gJHtleHByZXNzaW9ufWApO1xuICAgICAgICAgIGVycm9yKGBFcnJvcjpgKTtcbiAgICAgICAgICBlcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgIGVycm9yKGUuc3RhY2spO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZGl0aW9ucy5ldmVyeSgoY29uZGl0aW9uKSA9PiB7XG4gICAgICBjb25zdCB7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSA9IGNvbmRpdGlvbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNGaWxlID0gY2hlY2tGbihbZmlsZVBhdGhdLCB0aGlzLnByZWNlZGluZ0dyb3Vwcyk7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsZSkge1xuICAgICAgICAgIG1hdGNoZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzRmlsZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSBjb25kaXRpb24gdGhhdCBkZXBlbmRzIG9uIHRoZSBzdGF0ZSBvZiBncm91cHMgd2Ugd2FudCB0b1xuICAgICAgICAvLyBpZ25vcmUgdGhhdCB0aGUgdmVyaWZpY2F0aW9uIGNhbid0IGFjY3VyYXRlbHkgZXZhbHVhdGUgdGhlIGNvbmRpdGlvbiBhbmQgdGhlblxuICAgICAgICAvLyBjb250aW51ZSBwcm9jZXNzaW5nLiBPdGhlciB0eXBlcyBvZiBlcnJvcnMgZmFpbCB0aGUgdmVyaWZpY2F0aW9uLCBhcyBjb25kaXRpb25zXG4gICAgICAgIC8vIHNob3VsZCBvdGhlcndpc2UgYmUgYWJsZSB0byBleGVjdXRlIHdpdGhvdXQgdGhyb3dpbmcuXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKSB7XG4gICAgICAgICAgY29uZGl0aW9uLnVudmVyaWZpYWJsZSA9IHRydWU7XG4gICAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gdGhhdCBgdGhpcy5jb25kaXRpb25zLmV2ZXJ5YCBjYW4gY29udGludWUgZXZhbHVhdGluZy5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gYENvbmRpdGlvbiBjb3VsZCBub3QgYmUgZXZhbHVhdGVkOiBcXG5cXG5gICtcbiAgICAgICAgICAgICAgYEZyb20gdGhlIFske3RoaXMuZ3JvdXBOYW1lfV0gZ3JvdXA6XFxuYCArXG4gICAgICAgICAgICAgIGAgLSAke2V4cHJlc3Npb259YCArXG4gICAgICAgICAgICAgIGBcXG5cXG4ke2UubWVzc2FnZX0gJHtlLnN0YWNrfVxcblxcbmA7XG4gICAgICAgICAgZXJyb3IoZXJyTWVzc2FnZSk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlc3VsdHMgZm9yIHRoZSBHcm91cCwgYWxsIG1hdGNoZWQgYW5kIHVubWF0Y2hlZCBjb25kaXRpb25zLiAqL1xuICBnZXRSZXN1bHRzKCk6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICAgIGNvbnN0IG1hdGNoZWRDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPiAwKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb25kaXRpb25zID1cbiAgICAgICAgdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPT09IDAgJiYgIWMudW52ZXJpZmlhYmxlKTtcbiAgICBjb25zdCB1bnZlcmlmaWFibGVDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMudW52ZXJpZmlhYmxlKTtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZENvbmRpdGlvbnMsXG4gICAgICBtYXRjaGVkQ291bnQ6IG1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIHVubWF0Y2hlZENvbmRpdGlvbnMsXG4gICAgICB1bm1hdGNoZWRDb3VudDogdW5tYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bnZlcmlmaWFibGVDb25kaXRpb25zLFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG59XG4iXX0=