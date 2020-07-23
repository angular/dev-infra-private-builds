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
            return this.conditions.every(function (_a) {
                var matchedFiles = _a.matchedFiles, checkFn = _a.checkFn, expression = _a.expression;
                try {
                    var matchesFile = checkFn([filePath], _this.precedingGroups);
                    if (matchesFile) {
                        matchedFiles.add(filePath);
                    }
                    return matchesFile;
                }
                catch (e) {
                    // In the case of a condition that depends on the state of groups we want to just
                    // warn that the verification can't accurately evaluate the condition and then
                    // continue processing. Other types of errors fail the verification, as conditions
                    // should otherwise be able to execute without throwing.
                    if (e instanceof pullapprove_arrays_1.PullApproveGroupStateDependencyError) {
                        var errMessage = "Condition could not be evaluated: \n" +
                            (e.message + "\n") +
                            ("From the [" + _this.groupName + "] group:\n") +
                            (" - " + expression);
                        console_1.warn(errMessage);
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
            var matchedConditions = this.conditions.filter(function (c) { return !!c.matchedFiles.size; });
            var unmatchedConditions = this.conditions.filter(function (c) { return !c.matchedFiles.size; });
            return {
                matchedConditions: matchedConditions,
                matchedCount: matchedConditions.length,
                unmatchedConditions: unmatchedConditions,
                unmatchedCount: unmatchedConditions.length,
                groupName: this.groupName,
            };
        };
        return PullApproveGroup;
    }());
    exports.PullApproveGroup = PullApproveGroup;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQTZDO0lBQzdDLGtHQUFpRTtJQUVqRSxnR0FBMEU7SUFrQjFFLHNFQUFzRTtJQUN0RSxJQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0lBRTlGLHlGQUF5RjtJQUN6RiwwRkFBMEY7SUFDMUYsa0ZBQWtGO0lBQ2xGLElBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBRXZDLDREQUE0RDtJQUM1RDtRQUlFLDBCQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0MsZUFBd0M7WUFBeEMsZ0NBQUEsRUFBQSxvQkFBd0M7WUFEMUMsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUNmLG9CQUFlLEdBQWYsZUFBZSxDQUF5QjtZQUxyRCx3Q0FBd0M7WUFDeEMsZUFBVSxHQUFxQixFQUFFLENBQUM7WUFLaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyw2Q0FBa0IsR0FBMUIsVUFBMkIsTUFBOEI7WUFBekQsaUJBMEJDO1lBekJDLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLG1CQUFtQixFQUFFO2dCQUMvRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztvQkFDeEMsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTt3QkFDckQsK0VBQStFO3dCQUMvRSxPQUFPO3FCQUNSO29CQUVELElBQUk7d0JBQ0YsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7NEJBQ25CLFVBQVUsWUFBQTs0QkFDVixPQUFPLEVBQUUsZ0RBQTBCLENBQUMsVUFBVSxDQUFDOzRCQUMvQyxZQUFZLEVBQUUsSUFBSSxHQUFHLEVBQUU7eUJBQ3hCLENBQUMsQ0FBQztxQkFDSjtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDVixlQUFLLENBQUMseUNBQXVDLEtBQUksQ0FBQyxTQUFXLENBQUMsQ0FBQzt3QkFDL0QsZUFBSyxDQUFDLFFBQU0sVUFBWSxDQUFDLENBQUM7d0JBQzFCLGVBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDaEIsZUFBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDakIsZUFBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNILG1DQUFRLEdBQVIsVUFBUyxRQUFnQjtZQUF6QixpQkE2QkM7WUE1QkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFDLEVBQW1DO29CQUFsQyxZQUFZLGtCQUFBLEVBQUUsT0FBTyxhQUFBLEVBQUUsVUFBVSxnQkFBQTtnQkFDOUQsSUFBSTtvQkFDRixJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxLQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7b0JBQzlELElBQUksV0FBVyxFQUFFO3dCQUNmLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzVCO29CQUNELE9BQU8sV0FBVyxDQUFDO2lCQUNwQjtnQkFBQyxPQUFPLENBQUMsRUFBRTtvQkFDVixpRkFBaUY7b0JBQ2pGLDhFQUE4RTtvQkFDOUUsa0ZBQWtGO29CQUNsRix3REFBd0Q7b0JBQ3hELElBQUksQ0FBQyxZQUFZLHlEQUFvQyxFQUFFO3dCQUNyRCxJQUFNLFVBQVUsR0FBRyxzQ0FBc0M7NkJBQ2xELENBQUMsQ0FBQyxPQUFPLE9BQUksQ0FBQTs2QkFDaEIsZUFBYSxLQUFJLENBQUMsU0FBUyxlQUFZLENBQUE7NkJBQ3ZDLFFBQU0sVUFBWSxDQUFBLENBQUM7d0JBQ3ZCLGNBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztxQkFDbEI7eUJBQU07d0JBQ0wsSUFBTSxVQUFVLEdBQUcsd0NBQXdDOzZCQUN2RCxlQUFhLEtBQUksQ0FBQyxTQUFTLGVBQVksQ0FBQTs2QkFDdkMsUUFBTSxVQUFZLENBQUE7NkJBQ2xCLFNBQU8sQ0FBQyxDQUFDLE9BQU8sU0FBSSxDQUFDLENBQUMsS0FBSyxTQUFNLENBQUEsQ0FBQzt3QkFDdEMsZUFBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO3dCQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixxQ0FBVSxHQUFWO1lBQ0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1lBQzdFLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFwQixDQUFvQixDQUFDLENBQUM7WUFDOUUsT0FBTztnQkFDTCxpQkFBaUIsbUJBQUE7Z0JBQ2pCLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO2dCQUN0QyxtQkFBbUIscUJBQUE7Z0JBQ25CLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO2dCQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDMUIsQ0FBQztRQUNKLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUFyRkQsSUFxRkM7SUFyRlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3IsIHdhcm59IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbn0gZnJvbSAnLi9jb25kaXRpb25fZXZhbHVhdG9yJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cENvbmZpZ30gZnJvbSAnLi9wYXJzZS15YW1sJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yfSBmcm9tICcuL3B1bGxhcHByb3ZlX2FycmF5cyc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGV4cHJlc3Npb246IHN0cmluZztcbiAgY2hlY2tGbjogKGZpbGVzOiBzdHJpbmdbXSwgZ3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10pID0+IGJvb2xlYW47XG4gIG1hdGNoZWRGaWxlczogU2V0PHN0cmluZz47XG59XG5cbi8qKiBSZXN1bHQgb2YgdGVzdGluZyBmaWxlcyBhZ2FpbnN0IHRoZSBncm91cC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBtYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVubWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgY29uZGl0aW9ucyBmb3IgdGhlIGdsb2JhbCBhcHByb3ZhbC5cbmNvbnN0IEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVggPSAvXlwiZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzXCIgbm90IGluIGdyb3Vwcy5hcHByb3ZlZCQvO1xuXG4vLyBOYW1lIG9mIHRoZSBQdWxsQXBwcm92ZSBncm91cCB0aGF0IHNlcnZlcyBhcyBmYWxsYmFjay4gVGhpcyBncm91cCBzaG91bGQgbmV2ZXIgY2FwdHVyZVxuLy8gYW55IGNvbmRpdGlvbnMgYXMgaXQgd291bGQgYWx3YXlzIG1hdGNoIHNwZWNpZmllZCBmaWxlcy4gVGhpcyBpcyBub3QgZGVzaXJlZCBhcyB3ZSB3YW50XG4vLyB0byBmaWd1cmUgb3V0IGFzIHBhcnQgb2YgdGhpcyB0b29sLCB3aGV0aGVyIHRoZXJlIGFjdHVhbGx5IGFyZSB1bm1hdGNoZWQgZmlsZXMuXG5jb25zdCBGQUxMQkFDS19HUk9VUF9OQU1FID0gJ2ZhbGxiYWNrJztcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8qKiBMaXN0IG9mIGNvbmRpdGlvbnMgZm9yIHRoZSBncm91cC4gKi9cbiAgY29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcsXG4gICAgICByZWFkb25seSBwcmVjZWRpbmdHcm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSA9IFtdKSB7XG4gICAgdGhpcy5fY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChjb25maWcuY29uZGl0aW9ucyAmJiB0aGlzLmdyb3VwTmFtZSAhPT0gRkFMTEJBQ0tfR1JPVVBfTkFNRSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb25kaXRpb25zLmZvckVhY2goY29uZGl0aW9uID0+IHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24ubWF0Y2goR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgY2hlY2tGbjogY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGVycm9yKGBDb3VsZCBub3QgcGFyc2UgY29uZGl0aW9uIGluIGdyb3VwOiAke3RoaXMuZ3JvdXBOYW1lfWApO1xuICAgICAgICAgIGVycm9yKGAgLSAke2V4cHJlc3Npb259YCk7XG4gICAgICAgICAgZXJyb3IoYEVycm9yOmApO1xuICAgICAgICAgIGVycm9yKGUubWVzc2FnZSk7XG4gICAgICAgICAgZXJyb3IoZS5zdGFjayk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgYSBwcm92aWRlZCBmaWxlIHBhdGggdG8gZGV0ZXJtaW5lIGlmIGl0IHdvdWxkIGJlIGNvbnNpZGVyZWQgbWF0Y2hlZCBieVxuICAgKiB0aGUgcHVsbCBhcHByb3ZlIGdyb3VwJ3MgY29uZGl0aW9ucy5cbiAgICovXG4gIHRlc3RGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zLmV2ZXJ5KCh7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWF0Y2hlc0ZpbGUgPSBjaGVja0ZuKFtmaWxlUGF0aF0sIHRoaXMucHJlY2VkaW5nR3JvdXBzKTtcbiAgICAgICAgaWYgKG1hdGNoZXNGaWxlKSB7XG4gICAgICAgICAgbWF0Y2hlZEZpbGVzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNGaWxlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiBhIGNvbmRpdGlvbiB0aGF0IGRlcGVuZHMgb24gdGhlIHN0YXRlIG9mIGdyb3VwcyB3ZSB3YW50IHRvIGp1c3RcbiAgICAgICAgLy8gd2FybiB0aGF0IHRoZSB2ZXJpZmljYXRpb24gY2FuJ3QgYWNjdXJhdGVseSBldmFsdWF0ZSB0aGUgY29uZGl0aW9uIGFuZCB0aGVuXG4gICAgICAgIC8vIGNvbnRpbnVlIHByb2Nlc3NpbmcuIE90aGVyIHR5cGVzIG9mIGVycm9ycyBmYWlsIHRoZSB2ZXJpZmljYXRpb24sIGFzIGNvbmRpdGlvbnNcbiAgICAgICAgLy8gc2hvdWxkIG90aGVyd2lzZSBiZSBhYmxlIHRvIGV4ZWN1dGUgd2l0aG91dCB0aHJvd2luZy5cbiAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBQdWxsQXBwcm92ZUdyb3VwU3RhdGVEZXBlbmRlbmN5RXJyb3IpIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gYENvbmRpdGlvbiBjb3VsZCBub3QgYmUgZXZhbHVhdGVkOiBcXG5gICtcbiAgICAgICAgICAgICAgYCR7ZS5tZXNzYWdlfVxcbmAgK1xuICAgICAgICAgICAgICBgRnJvbSB0aGUgWyR7dGhpcy5ncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgICAgYCAtICR7ZXhwcmVzc2lvbn1gO1xuICAgICAgICAgIHdhcm4oZXJyTWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBGcm9tIHRoZSBbJHt0aGlzLmdyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICAgICAgICBgIC0gJHtleHByZXNzaW9ufWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZENvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIG1hdGNoZWRDb3VudDogbWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW5tYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIHVubWF0Y2hlZENvdW50OiB1bm1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19