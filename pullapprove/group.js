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
    // Name of the PullApprove group that serves as fallback. This group should never capture
    // any conditions as it would always match specified files. This is not desired as we want
    // to figure out as part of this tool, whether there actually are unmatched files.
    var FALLBACK_GROUP_NAME = 'fallback';
    /** A PullApprove group to be able to test files against. */
    var PullApproveGroup = /** @class */ (function () {
        function PullApproveGroup(groupName, config, precedingGroups) {
            if (precedingGroups === void 0) { precedingGroups = []; }
            this.groupName = groupName;
            this.precedingGroups = precedingGroups;
            /** List of conditions for the group. */
            this.conditions = [];
            this._captureConditions(config);
        }
        PullApproveGroup.prototype._captureConditions = function (config) {
            var _this = this;
            if (config.conditions && this.groupName !== FALLBACK_GROUP_NAME) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXVDO0lBQ3ZDLGtHQUFpRTtJQUVqRSxnR0FBMEU7SUFvQjFFLHNFQUFzRTtJQUN0RSxJQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0lBRTlGLHlGQUF5RjtJQUN6RiwwRkFBMEY7SUFDMUYsa0ZBQWtGO0lBQ2xGLElBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBRXZDLDREQUE0RDtJQUM1RDtRQUlFLDBCQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0MsZUFBd0M7WUFBeEMsZ0NBQUEsRUFBQSxvQkFBd0M7WUFEMUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNmLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtZQUxyRCx3Q0FBd0M7WUFDeEMsZUFBVSxHQUFxQixFQUFFLENBQUM7WUFLaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyw2Q0FBa0IsR0FBMUIsVUFBMkIsTUFBOEI7WUFBekQsaUJBMkJDO1lBMUJDLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLG1CQUFtQixFQUFFO2dCQUMvRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztvQkFDeEMsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTt3QkFDckQsK0VBQStFO3dCQUMvRSxPQUFPO3FCQUNSO29CQUVELElBQUk7d0JBQ0YsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7NEJBQ25CLFVBQVUsWUFBQTs0QkFD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QUMxQyxzQkFBc0Isd0JBQUE7Z0JBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDO1FBQ0osQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQXhGRCxJQXdGQztJQXhGWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtlcnJvcn0gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge2NvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9ufSBmcm9tICcuL2NvbmRpdGlvbl9ldmFsdWF0b3InO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwQ29uZmlnfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3J9IGZyb20gJy4vcHVsbGFwcHJvdmVfYXJyYXlzJztcblxuLyoqIEEgY29uZGl0aW9uIGZvciBhIGdyb3VwLiAqL1xuaW50ZXJmYWNlIEdyb3VwQ29uZGl0aW9uIHtcbiAgZXhwcmVzc2lvbjogc3RyaW5nO1xuICBjaGVja0ZuOiAoZmlsZXM6IHN0cmluZ1tdLCBncm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSkgPT4gYm9vbGVhbjtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbiAgdW52ZXJpZmlhYmxlOiBib29sZWFuO1xufVxuXG4vKiogUmVzdWx0IG9mIHRlc3RpbmcgZmlsZXMgYWdhaW5zdCB0aGUgZ3JvdXAuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICBncm91cE5hbWU6IHN0cmluZztcbiAgbWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIG1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bm1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bnZlcmlmaWFibGVDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xufVxuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIGNvbmRpdGlvbnMgZm9yIHRoZSBnbG9iYWwgYXBwcm92YWwuXG5jb25zdCBHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYID0gL15cImdsb2JhbC0oZG9jcy0pP2FwcHJvdmVyc1wiIG5vdCBpbiBncm91cHMuYXBwcm92ZWQkLztcblxuLy8gTmFtZSBvZiB0aGUgUHVsbEFwcHJvdmUgZ3JvdXAgdGhhdCBzZXJ2ZXMgYXMgZmFsbGJhY2suIFRoaXMgZ3JvdXAgc2hvdWxkIG5ldmVyIGNhcHR1cmVcbi8vIGFueSBjb25kaXRpb25zIGFzIGl0IHdvdWxkIGFsd2F5cyBtYXRjaCBzcGVjaWZpZWQgZmlsZXMuIFRoaXMgaXMgbm90IGRlc2lyZWQgYXMgd2Ugd2FudFxuLy8gdG8gZmlndXJlIG91dCBhcyBwYXJ0IG9mIHRoaXMgdG9vbCwgd2hldGhlciB0aGVyZSBhY3R1YWxseSBhcmUgdW5tYXRjaGVkIGZpbGVzLlxuY29uc3QgRkFMTEJBQ0tfR1JPVVBfTkFNRSA9ICdmYWxsYmFjayc7XG5cbi8qKiBBIFB1bGxBcHByb3ZlIGdyb3VwIHRvIGJlIGFibGUgdG8gdGVzdCBmaWxlcyBhZ2FpbnN0LiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlR3JvdXAge1xuICAvKiogTGlzdCBvZiBjb25kaXRpb25zIGZvciB0aGUgZ3JvdXAuICovXG4gIGNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHB1YmxpYyBncm91cE5hbWU6IHN0cmluZywgY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnLFxuICAgICAgcmVhZG9ubHkgcHJlY2VkaW5nR3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10gPSBbXSkge1xuICAgIHRoaXMuX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIF9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmNvbmRpdGlvbnMgJiYgdGhpcy5ncm91cE5hbWUgIT09IEZBTExCQUNLX0dST1VQX05BTUUpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29uZGl0aW9ucy5mb3JFYWNoKGNvbmRpdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICAgIGlmIChleHByZXNzaW9uLm1hdGNoKEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVgpKSB7XG4gICAgICAgICAgLy8gQ3VycmVudGx5IGEgbm9vcCBhcyB3ZSBkb24ndCB0YWtlIGFueSBhY3Rpb24gZm9yIGdsb2JhbCBhcHByb3ZhbCBjb25kaXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgICAgIGNoZWNrRm46IGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHJlc3Npb24pLFxuICAgICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0KCksXG4gICAgICAgICAgICB1bnZlcmlmaWFibGU6IGZhbHNlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXJyb3IoYENvdWxkIG5vdCBwYXJzZSBjb25kaXRpb24gaW4gZ3JvdXA6ICR7dGhpcy5ncm91cE5hbWV9YCk7XG4gICAgICAgICAgZXJyb3IoYCAtICR7ZXhwcmVzc2lvbn1gKTtcbiAgICAgICAgICBlcnJvcihgRXJyb3I6YCk7XG4gICAgICAgICAgZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICBlcnJvcihlLnN0YWNrKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyBhIHByb3ZpZGVkIGZpbGUgcGF0aCB0byBkZXRlcm1pbmUgaWYgaXQgd291bGQgYmUgY29uc2lkZXJlZCBtYXRjaGVkIGJ5XG4gICAqIHRoZSBwdWxsIGFwcHJvdmUgZ3JvdXAncyBjb25kaXRpb25zLlxuICAgKi9cbiAgdGVzdEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnMuZXZlcnkoKGNvbmRpdGlvbikgPT4ge1xuICAgICAgY29uc3Qge21hdGNoZWRGaWxlcywgY2hlY2tGbiwgZXhwcmVzc2lvbn0gPSBjb25kaXRpb247XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtYXRjaGVzRmlsZSA9IGNoZWNrRm4oW2ZpbGVQYXRoXSwgdGhpcy5wcmVjZWRpbmdHcm91cHMpO1xuICAgICAgICBpZiAobWF0Y2hlc0ZpbGUpIHtcbiAgICAgICAgICBtYXRjaGVkRmlsZXMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0Y2hlc0ZpbGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIGEgY29uZGl0aW9uIHRoYXQgZGVwZW5kcyBvbiB0aGUgc3RhdGUgb2YgZ3JvdXBzIHdlIHdhbnQgdG9cbiAgICAgICAgLy8gaWdub3JlIHRoYXQgdGhlIHZlcmlmaWNhdGlvbiBjYW4ndCBhY2N1cmF0ZWx5IGV2YWx1YXRlIHRoZSBjb25kaXRpb24gYW5kIHRoZW5cbiAgICAgICAgLy8gY29udGludWUgcHJvY2Vzc2luZy4gT3RoZXIgdHlwZXMgb2YgZXJyb3JzIGZhaWwgdGhlIHZlcmlmaWNhdGlvbiwgYXMgY29uZGl0aW9uc1xuICAgICAgICAvLyBzaG91bGQgb3RoZXJ3aXNlIGJlIGFibGUgdG8gZXhlY3V0ZSB3aXRob3V0IHRocm93aW5nLlxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIFB1bGxBcHByb3ZlR3JvdXBTdGF0ZURlcGVuZGVuY3lFcnJvcikge1xuICAgICAgICAgIGNvbmRpdGlvbi51bnZlcmlmaWFibGUgPSB0cnVlO1xuICAgICAgICAgIC8vIFJldHVybiB0cnVlIHNvIHRoYXQgYHRoaXMuY29uZGl0aW9ucy5ldmVyeWAgY2FuIGNvbnRpbnVlIGV2YWx1YXRpbmcuXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBGcm9tIHRoZSBbJHt0aGlzLmdyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICAgICAgICBgIC0gJHtleHByZXNzaW9ufWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID4gMCk7XG4gICAgY29uc3QgdW5tYXRjaGVkQ29uZGl0aW9ucyA9XG4gICAgICAgIHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLm1hdGNoZWRGaWxlcy5zaXplID09PSAwICYmICFjLnVudmVyaWZpYWJsZSk7XG4gICAgY29uc3QgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiBjLnVudmVyaWZpYWJsZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW52ZXJpZmlhYmxlQ29uZGl0aW9ucyxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19