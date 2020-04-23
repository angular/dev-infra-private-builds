(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/group", ["require", "exports", "@angular/dev-infra-private/pullapprove/condition_evaluator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var condition_evaluator_1 = require("@angular/dev-infra-private/pullapprove/condition_evaluator");
    // Regular expression that matches conditions for the global approval.
    var GLOBAL_APPROVAL_CONDITION_REGEX = /^"global-(docs-)?approvers" not in groups.approved$/;
    // Name of the PullApprove group that serves as fallback. This group should never capture
    // any conditions as it would always match specified files. This is not desired as we want
    // to figure out as part of this tool, whether there actually are unmatched files.
    var FALLBACK_GROUP_NAME = 'fallback';
    /** A PullApprove group to be able to test files against. */
    var PullApproveGroup = /** @class */ (function () {
        function PullApproveGroup(groupName, config) {
            this.groupName = groupName;
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
                        console.error("Could not parse condition in group: " + _this.groupName);
                        console.error(" - " + expression);
                        console.error("Error:", e.message, e.stack);
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
                    var matchesFile = checkFn([filePath]);
                    if (matchesFile) {
                        matchedFiles.add(filePath);
                    }
                    return matchesFile;
                }
                catch (e) {
                    var errMessage = "Condition could not be evaluated: \n\n" +
                        ("From the [" + _this.groupName + "] group:\n") +
                        (" - " + expression) +
                        ("\n\n" + e.message + " " + e.stack + "\n\n");
                    console.error(errMessage);
                    process.exit(1);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7SUFBQTs7Ozs7O09BTUc7SUFDSCxrR0FBaUU7SUFtQmpFLHNFQUFzRTtJQUN0RSxJQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0lBRTlGLHlGQUF5RjtJQUN6RiwwRkFBMEY7SUFDMUYsa0ZBQWtGO0lBQ2xGLElBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBRXZDLDREQUE0RDtJQUM1RDtRQUlFLDBCQUFtQixTQUFpQixFQUFFLE1BQThCO1lBQWpELGNBQVMsR0FBVCxTQUFTLENBQVE7WUFIcEMsd0NBQXdDO1lBQ3hDLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1lBR2hDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBRU8sNkNBQWtCLEdBQTFCLFVBQTJCLE1BQThCO1lBQXpELGlCQXdCQztZQXZCQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxtQkFBbUIsRUFBRTtnQkFDL0QsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7b0JBQ3hDLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLEVBQUU7d0JBQ3JELCtFQUErRTt3QkFDL0UsT0FBTztxQkFDUjtvQkFFRCxJQUFJO3dCQUNGLEtBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDOzRCQUNuQixVQUFVLFlBQUE7NEJBQ1YsT0FBTyxFQUFFLGdEQUEwQixDQUFDLFVBQVUsQ0FBQzs0QkFDL0MsWUFBWSxFQUFFLElBQUksR0FBRyxFQUFFO3lCQUN4QixDQUFDLENBQUM7cUJBQ0o7b0JBQUMsT0FBTyxDQUFDLEVBQUU7d0JBQ1YsT0FBTyxDQUFDLEtBQUssQ0FBQyx5Q0FBdUMsS0FBSSxDQUFDLFNBQVcsQ0FBQyxDQUFDO3dCQUN2RSxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQU0sVUFBWSxDQUFDLENBQUM7d0JBQ2xDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUM1QyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNILG1DQUFRLEdBQVIsVUFBUyxRQUFnQjtZQUF6QixpQkFpQkM7WUFoQkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFDLEVBQW1DO29CQUFsQyw4QkFBWSxFQUFFLG9CQUFPLEVBQUUsMEJBQVU7Z0JBQzlELElBQUk7b0JBQ0YsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztvQkFDeEMsSUFBSSxXQUFXLEVBQUU7d0JBQ2YsWUFBWSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztxQkFDNUI7b0JBQ0QsT0FBTyxXQUFXLENBQUM7aUJBQ3BCO2dCQUFDLE9BQU8sQ0FBQyxFQUFFO29CQUNWLElBQU0sVUFBVSxHQUFHLHdDQUF3Qzt5QkFDdkQsZUFBYSxLQUFJLENBQUMsU0FBUyxlQUFZLENBQUE7eUJBQ3ZDLFFBQU0sVUFBWSxDQUFBO3lCQUNsQixTQUFPLENBQUMsQ0FBQyxPQUFPLFNBQUksQ0FBQyxDQUFDLEtBQUssU0FBTSxDQUFBLENBQUM7b0JBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQzFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBRUQsZ0ZBQWdGO1FBQ2hGLHFDQUFVLEdBQVY7WUFDRSxJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFyQixDQUFxQixDQUFDLENBQUM7WUFDN0UsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQXBCLENBQW9CLENBQUMsQ0FBQztZQUM5RSxPQUFPO2dCQUNMLGlCQUFpQixtQkFBQTtnQkFDakIsWUFBWSxFQUFFLGlCQUFpQixDQUFDLE1BQU07Z0JBQ3RDLG1CQUFtQixxQkFBQTtnQkFDbkIsY0FBYyxFQUFFLG1CQUFtQixDQUFDLE1BQU07Z0JBQzFDLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUzthQUMxQixDQUFDO1FBQ0osQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQXJFRCxJQXFFQztJQXJFWSw0Q0FBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge2NvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9ufSBmcm9tICcuL2NvbmRpdGlvbl9ldmFsdWF0b3InO1xuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwQ29uZmlnfSBmcm9tICcuL3BhcnNlLXlhbWwnO1xuXG4vKiogQSBjb25kaXRpb24gZm9yIGEgZ3JvdXAuICovXG5pbnRlcmZhY2UgR3JvdXBDb25kaXRpb24ge1xuICBleHByZXNzaW9uOiBzdHJpbmc7XG4gIGNoZWNrRm46IChmaWxlczogc3RyaW5nW10pID0+IGJvb2xlYW47XG4gIG1hdGNoZWRGaWxlczogU2V0PHN0cmluZz47XG59XG5cbi8qKiBSZXN1bHQgb2YgdGVzdGluZyBmaWxlcyBhZ2FpbnN0IHRoZSBncm91cC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHVsbEFwcHJvdmVHcm91cFJlc3VsdCB7XG4gIGdyb3VwTmFtZTogc3RyaW5nO1xuICBtYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZENvdW50OiBudW1iZXI7XG4gIHVubWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG59XG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0aGF0IG1hdGNoZXMgY29uZGl0aW9ucyBmb3IgdGhlIGdsb2JhbCBhcHByb3ZhbC5cbmNvbnN0IEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVggPSAvXlwiZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzXCIgbm90IGluIGdyb3Vwcy5hcHByb3ZlZCQvO1xuXG4vLyBOYW1lIG9mIHRoZSBQdWxsQXBwcm92ZSBncm91cCB0aGF0IHNlcnZlcyBhcyBmYWxsYmFjay4gVGhpcyBncm91cCBzaG91bGQgbmV2ZXIgY2FwdHVyZVxuLy8gYW55IGNvbmRpdGlvbnMgYXMgaXQgd291bGQgYWx3YXlzIG1hdGNoIHNwZWNpZmllZCBmaWxlcy4gVGhpcyBpcyBub3QgZGVzaXJlZCBhcyB3ZSB3YW50XG4vLyB0byBmaWd1cmUgb3V0IGFzIHBhcnQgb2YgdGhpcyB0b29sLCB3aGV0aGVyIHRoZXJlIGFjdHVhbGx5IGFyZSB1bm1hdGNoZWQgZmlsZXMuXG5jb25zdCBGQUxMQkFDS19HUk9VUF9OQU1FID0gJ2ZhbGxiYWNrJztcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8qKiBMaXN0IG9mIGNvbmRpdGlvbnMgZm9yIHRoZSBncm91cC4gKi9cbiAgY29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBncm91cE5hbWU6IHN0cmluZywgY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnKSB7XG4gICAgdGhpcy5fY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChjb25maWcuY29uZGl0aW9ucyAmJiB0aGlzLmdyb3VwTmFtZSAhPT0gRkFMTEJBQ0tfR1JPVVBfTkFNRSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb25kaXRpb25zLmZvckVhY2goY29uZGl0aW9uID0+IHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24ubWF0Y2goR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgY2hlY2tGbjogY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYENvdWxkIG5vdCBwYXJzZSBjb25kaXRpb24gaW4gZ3JvdXA6ICR7dGhpcy5ncm91cE5hbWV9YCk7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgIC0gJHtleHByZXNzaW9ufWApO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yOmAsIGUubWVzc2FnZSwgZS5zdGFjayk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgYSBwcm92aWRlZCBmaWxlIHBhdGggdG8gZGV0ZXJtaW5lIGlmIGl0IHdvdWxkIGJlIGNvbnNpZGVyZWQgbWF0Y2hlZCBieVxuICAgKiB0aGUgcHVsbCBhcHByb3ZlIGdyb3VwJ3MgY29uZGl0aW9ucy5cbiAgICovXG4gIHRlc3RGaWxlKGZpbGVQYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5jb25kaXRpb25zLmV2ZXJ5KCh7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgbWF0Y2hlc0ZpbGUgPSBjaGVja0ZuKFtmaWxlUGF0aF0pO1xuICAgICAgICBpZiAobWF0Y2hlc0ZpbGUpIHtcbiAgICAgICAgICBtYXRjaGVkRmlsZXMuYWRkKGZpbGVQYXRoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWF0Y2hlc0ZpbGU7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPSBgQ29uZGl0aW9uIGNvdWxkIG5vdCBiZSBldmFsdWF0ZWQ6IFxcblxcbmAgK1xuICAgICAgICAgICAgYEZyb20gdGhlIFske3RoaXMuZ3JvdXBOYW1lfV0gZ3JvdXA6XFxuYCArXG4gICAgICAgICAgICBgIC0gJHtleHByZXNzaW9ufWAgK1xuICAgICAgICAgICAgYFxcblxcbiR7ZS5tZXNzYWdlfSAke2Uuc3RhY2t9XFxuXFxuYDtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJNZXNzYWdlKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZENvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIG1hdGNoZWRDb3VudDogbWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW5tYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIHVubWF0Y2hlZENvdW50OiB1bm1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19