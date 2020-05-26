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
        define("@angular/dev-infra-private/pullapprove/group", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pullapprove/condition_evaluator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PullApproveGroup = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
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
                    console_1.error(errMessage);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXVDO0lBQ3ZDLGtHQUFpRTtJQW1CakUsc0VBQXNFO0lBQ3RFLElBQU0sK0JBQStCLEdBQUcscURBQXFELENBQUM7SUFFOUYseUZBQXlGO0lBQ3pGLDBGQUEwRjtJQUMxRixrRkFBa0Y7SUFDbEYsSUFBTSxtQkFBbUIsR0FBRyxVQUFVLENBQUM7SUFFdkMsNERBQTREO0lBQzVEO1FBSUUsMEJBQW1CLFNBQWlCLEVBQUUsTUFBOEI7WUFBakQsY0FBUyxHQUFULFNBQVMsQ0FBUTtZQUhwQyx3Q0FBd0M7WUFDeEMsZUFBVSxHQUFxQixFQUFFLENBQUM7WUFHaEMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFFTyw2Q0FBa0IsR0FBMUIsVUFBMkIsTUFBOEI7WUFBekQsaUJBMEJDO1lBekJDLElBQUksTUFBTSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLG1CQUFtQixFQUFFO2dCQUMvRCxPQUFPLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsU0FBUztvQkFDeEMsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUVwQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsRUFBRTt3QkFDckQsK0VBQStFO3dCQUMvRSxPQUFPO3FCQUNSO29CQUVELElBQUk7d0JBQ0YsS0FBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7NEJBQ25CLFVBQVUsWUFBQTs0QkFDVixPQUFPLEVBQUUsZ0RBQTBCLENBQUMsVUFBVSxDQUFDOzRCQUMvQyxZQUFZLEVBQUUsSUFBSSxHQUFHLEVBQUU7eUJBQ3hCLENBQUMsQ0FBQztxQkFDSjtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDVixlQUFLLENBQUMseUNBQXVDLEtBQUksQ0FBQyxTQUFXLENBQUMsQ0FBQzt3QkFDL0QsZUFBSyxDQUFDLFFBQU0sVUFBWSxDQUFDLENBQUM7d0JBQzFCLGVBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQzt3QkFDaEIsZUFBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQzt3QkFDakIsZUFBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDZixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNqQjtnQkFDSCxDQUFDLENBQUMsQ0FBQzthQUNKO1FBQ0gsQ0FBQztRQUVEOzs7V0FHRztRQUNILG1DQUFRLEdBQVIsVUFBUyxRQUFnQjtZQUF6QixpQkFpQkM7WUFoQkMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFDLEVBQW1DO29CQUFsQyxZQUFZLGtCQUFBLEVBQUUsT0FBTyxhQUFBLEVBQUUsVUFBVSxnQkFBQTtnQkFDOUQsSUFBSTtvQkFDRixJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLFdBQVcsRUFBRTt3QkFDZixZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM1QjtvQkFDRCxPQUFPLFdBQVcsQ0FBQztpQkFDcEI7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsSUFBTSxVQUFVLEdBQUcsd0NBQXdDO3lCQUN2RCxlQUFhLEtBQUksQ0FBQyxTQUFTLGVBQVksQ0FBQTt5QkFDdkMsUUFBTSxVQUFZLENBQUE7eUJBQ2xCLFNBQU8sQ0FBQyxDQUFDLE9BQU8sU0FBSSxDQUFDLENBQUMsS0FBSyxTQUFNLENBQUEsQ0FBQztvQkFDdEMsZUFBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixxQ0FBVSxHQUFWO1lBQ0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1lBQzdFLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFwQixDQUFvQixDQUFDLENBQUM7WUFDOUUsT0FBTztnQkFDTCxpQkFBaUIsbUJBQUE7Z0JBQ2pCLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO2dCQUN0QyxtQkFBbUIscUJBQUE7Z0JBQ25CLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO2dCQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDMUIsQ0FBQztRQUNKLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUF2RUQsSUF1RUM7SUF2RVksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbn0gZnJvbSAnLi9jb25kaXRpb25fZXZhbHVhdG9yJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cENvbmZpZ30gZnJvbSAnLi9wYXJzZS15YW1sJztcblxuLyoqIEEgY29uZGl0aW9uIGZvciBhIGdyb3VwLiAqL1xuaW50ZXJmYWNlIEdyb3VwQ29uZGl0aW9uIHtcbiAgZXhwcmVzc2lvbjogc3RyaW5nO1xuICBjaGVja0ZuOiAoZmlsZXM6IHN0cmluZ1tdKSA9PiBib29sZWFuO1xuICBtYXRjaGVkRmlsZXM6IFNldDxzdHJpbmc+O1xufVxuXG4vKiogUmVzdWx0IG9mIHRlc3RpbmcgZmlsZXMgYWdhaW5zdCB0aGUgZ3JvdXAuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICBncm91cE5hbWU6IHN0cmluZztcbiAgbWF0Y2hlZENvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW107XG4gIG1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bm1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xufVxuXG4vLyBSZWd1bGFyIGV4cHJlc3Npb24gdGhhdCBtYXRjaGVzIGNvbmRpdGlvbnMgZm9yIHRoZSBnbG9iYWwgYXBwcm92YWwuXG5jb25zdCBHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYID0gL15cImdsb2JhbC0oZG9jcy0pP2FwcHJvdmVyc1wiIG5vdCBpbiBncm91cHMuYXBwcm92ZWQkLztcblxuLy8gTmFtZSBvZiB0aGUgUHVsbEFwcHJvdmUgZ3JvdXAgdGhhdCBzZXJ2ZXMgYXMgZmFsbGJhY2suIFRoaXMgZ3JvdXAgc2hvdWxkIG5ldmVyIGNhcHR1cmVcbi8vIGFueSBjb25kaXRpb25zIGFzIGl0IHdvdWxkIGFsd2F5cyBtYXRjaCBzcGVjaWZpZWQgZmlsZXMuIFRoaXMgaXMgbm90IGRlc2lyZWQgYXMgd2Ugd2FudFxuLy8gdG8gZmlndXJlIG91dCBhcyBwYXJ0IG9mIHRoaXMgdG9vbCwgd2hldGhlciB0aGVyZSBhY3R1YWxseSBhcmUgdW5tYXRjaGVkIGZpbGVzLlxuY29uc3QgRkFMTEJBQ0tfR1JPVVBfTkFNRSA9ICdmYWxsYmFjayc7XG5cbi8qKiBBIFB1bGxBcHByb3ZlIGdyb3VwIHRvIGJlIGFibGUgdG8gdGVzdCBmaWxlcyBhZ2FpbnN0LiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlR3JvdXAge1xuICAvKiogTGlzdCBvZiBjb25kaXRpb25zIGZvciB0aGUgZ3JvdXAuICovXG4gIGNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ3JvdXBOYW1lOiBzdHJpbmcsIGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIHRoaXMuX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIF9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBpZiAoY29uZmlnLmNvbmRpdGlvbnMgJiYgdGhpcy5ncm91cE5hbWUgIT09IEZBTExCQUNLX0dST1VQX05BTUUpIHtcbiAgICAgIHJldHVybiBjb25maWcuY29uZGl0aW9ucy5mb3JFYWNoKGNvbmRpdGlvbiA9PiB7XG4gICAgICAgIGNvbnN0IGV4cHJlc3Npb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICAgIGlmIChleHByZXNzaW9uLm1hdGNoKEdMT0JBTF9BUFBST1ZBTF9DT05ESVRJT05fUkVHRVgpKSB7XG4gICAgICAgICAgLy8gQ3VycmVudGx5IGEgbm9vcCBhcyB3ZSBkb24ndCB0YWtlIGFueSBhY3Rpb24gZm9yIGdsb2JhbCBhcHByb3ZhbCBjb25kaXRpb25zLlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5jb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZXhwcmVzc2lvbixcbiAgICAgICAgICAgIGNoZWNrRm46IGNvbnZlcnRDb25kaXRpb25Ub0Z1bmN0aW9uKGV4cHJlc3Npb24pLFxuICAgICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0KCksXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBlcnJvcihgQ291bGQgbm90IHBhcnNlIGNvbmRpdGlvbiBpbiBncm91cDogJHt0aGlzLmdyb3VwTmFtZX1gKTtcbiAgICAgICAgICBlcnJvcihgIC0gJHtleHByZXNzaW9ufWApO1xuICAgICAgICAgIGVycm9yKGBFcnJvcjpgKTtcbiAgICAgICAgICBlcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgIGVycm9yKGUuc3RhY2spO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZGl0aW9ucy5ldmVyeSgoe21hdGNoZWRGaWxlcywgY2hlY2tGbiwgZXhwcmVzc2lvbn0pID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNGaWxlID0gY2hlY2tGbihbZmlsZVBhdGhdKTtcbiAgICAgICAgaWYgKG1hdGNoZXNGaWxlKSB7XG4gICAgICAgICAgbWF0Y2hlZEZpbGVzLmFkZChmaWxlUGF0aCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1hdGNoZXNGaWxlO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gYENvbmRpdGlvbiBjb3VsZCBub3QgYmUgZXZhbHVhdGVkOiBcXG5cXG5gICtcbiAgICAgICAgICAgIGBGcm9tIHRoZSBbJHt0aGlzLmdyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICAgICAgYCAtICR7ZXhwcmVzc2lvbn1gICtcbiAgICAgICAgICAgIGBcXG5cXG4ke2UubWVzc2FnZX0gJHtlLnN0YWNrfVxcblxcbmA7XG4gICAgICAgIGVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlc3VsdHMgZm9yIHRoZSBHcm91cCwgYWxsIG1hdGNoZWQgYW5kIHVubWF0Y2hlZCBjb25kaXRpb25zLiAqL1xuICBnZXRSZXN1bHRzKCk6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICAgIGNvbnN0IG1hdGNoZWRDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+ICEhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgdW5tYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgbWF0Y2hlZENvdW50OiBtYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bm1hdGNoZWRDb25kaXRpb25zLFxuICAgICAgdW5tYXRjaGVkQ291bnQ6IHVubWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG59XG4iXX0=