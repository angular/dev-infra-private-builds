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
        define("@angular/dev-infra-private/pullapprove/group", ["require", "exports", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pullapprove/condition_evaluator"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7SUFFSCxvRUFBdUM7SUFDdkMsa0dBQWlFO0lBbUJqRSxzRUFBc0U7SUFDdEUsSUFBTSwrQkFBK0IsR0FBRyxxREFBcUQsQ0FBQztJQUU5Rix5RkFBeUY7SUFDekYsMEZBQTBGO0lBQzFGLGtGQUFrRjtJQUNsRixJQUFNLG1CQUFtQixHQUFHLFVBQVUsQ0FBQztJQUV2Qyw0REFBNEQ7SUFDNUQ7UUFJRSwwQkFBbUIsU0FBaUIsRUFBRSxNQUE4QjtZQUFqRCxjQUFTLEdBQVQsU0FBUyxDQUFRO1lBSHBDLHdDQUF3QztZQUN4QyxlQUFVLEdBQXFCLEVBQUUsQ0FBQztZQUdoQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUVPLDZDQUFrQixHQUExQixVQUEyQixNQUE4QjtZQUF6RCxpQkEwQkM7WUF6QkMsSUFBSSxNQUFNLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssbUJBQW1CLEVBQUU7Z0JBQy9ELE9BQU8sTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTO29CQUN4QyxJQUFNLFVBQVUsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7b0JBRXBDLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxFQUFFO3dCQUNyRCwrRUFBK0U7d0JBQy9FLE9BQU87cUJBQ1I7b0JBRUQsSUFBSTt3QkFDRixLQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQzs0QkFDbkIsVUFBVSxZQUFBOzRCQUNWLE9BQU8sRUFBRSxnREFBMEIsQ0FBQyxVQUFVLENBQUM7NEJBQy9DLFlBQVksRUFBRSxJQUFJLEdBQUcsRUFBRTt5QkFDeEIsQ0FBQyxDQUFDO3FCQUNKO29CQUFDLE9BQU8sQ0FBQyxFQUFFO3dCQUNWLGVBQUssQ0FBQyx5Q0FBdUMsS0FBSSxDQUFDLFNBQVcsQ0FBQyxDQUFDO3dCQUMvRCxlQUFLLENBQUMsUUFBTSxVQUFZLENBQUMsQ0FBQzt3QkFDMUIsZUFBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3dCQUNoQixlQUFLLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUNqQixlQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUNmLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7cUJBQ2pCO2dCQUNILENBQUMsQ0FBQyxDQUFDO2FBQ0o7UUFDSCxDQUFDO1FBRUQ7OztXQUdHO1FBQ0gsbUNBQVEsR0FBUixVQUFTLFFBQWdCO1lBQXpCLGlCQWlCQztZQWhCQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQUMsRUFBbUM7b0JBQWxDLDhCQUFZLEVBQUUsb0JBQU8sRUFBRSwwQkFBVTtnQkFDOUQsSUFBSTtvQkFDRixJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO29CQUN4QyxJQUFJLFdBQVcsRUFBRTt3QkFDZixZQUFZLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO3FCQUM1QjtvQkFDRCxPQUFPLFdBQVcsQ0FBQztpQkFDcEI7Z0JBQUMsT0FBTyxDQUFDLEVBQUU7b0JBQ1YsSUFBTSxVQUFVLEdBQUcsd0NBQXdDO3lCQUN2RCxlQUFhLEtBQUksQ0FBQyxTQUFTLGVBQVksQ0FBQTt5QkFDdkMsUUFBTSxVQUFZLENBQUE7eUJBQ2xCLFNBQU8sQ0FBQyxDQUFDLE9BQU8sU0FBSSxDQUFDLENBQUMsS0FBSyxTQUFNLENBQUEsQ0FBQztvQkFDdEMsZUFBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUNsQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUNqQjtZQUNILENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVELGdGQUFnRjtRQUNoRixxQ0FBVSxHQUFWO1lBQ0UsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLElBQUksRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO1lBQzdFLElBQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFwQixDQUFvQixDQUFDLENBQUM7WUFDOUUsT0FBTztnQkFDTCxpQkFBaUIsbUJBQUE7Z0JBQ2pCLFlBQVksRUFBRSxpQkFBaUIsQ0FBQyxNQUFNO2dCQUN0QyxtQkFBbUIscUJBQUE7Z0JBQ25CLGNBQWMsRUFBRSxtQkFBbUIsQ0FBQyxNQUFNO2dCQUMxQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDMUIsQ0FBQztRQUNKLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUF2RUQsSUF1RUM7SUF2RVksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7Y29udmVydENvbmRpdGlvblRvRnVuY3Rpb259IGZyb20gJy4vY29uZGl0aW9uX2V2YWx1YXRvcic7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGV4cHJlc3Npb246IHN0cmluZztcbiAgY2hlY2tGbjogKGZpbGVzOiBzdHJpbmdbXSkgPT4gYm9vbGVhbjtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgdW5tYXRjaGVkQ291bnQ6IG51bWJlcjtcbn1cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBjb25kaXRpb25zIGZvciB0aGUgZ2xvYmFsIGFwcHJvdmFsLlxuY29uc3QgR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCA9IC9eXCJnbG9iYWwtKGRvY3MtKT9hcHByb3ZlcnNcIiBub3QgaW4gZ3JvdXBzLmFwcHJvdmVkJC87XG5cbi8vIE5hbWUgb2YgdGhlIFB1bGxBcHByb3ZlIGdyb3VwIHRoYXQgc2VydmVzIGFzIGZhbGxiYWNrLiBUaGlzIGdyb3VwIHNob3VsZCBuZXZlciBjYXB0dXJlXG4vLyBhbnkgY29uZGl0aW9ucyBhcyBpdCB3b3VsZCBhbHdheXMgbWF0Y2ggc3BlY2lmaWVkIGZpbGVzLiBUaGlzIGlzIG5vdCBkZXNpcmVkIGFzIHdlIHdhbnRcbi8vIHRvIGZpZ3VyZSBvdXQgYXMgcGFydCBvZiB0aGlzIHRvb2wsIHdoZXRoZXIgdGhlcmUgYWN0dWFsbHkgYXJlIHVubWF0Y2hlZCBmaWxlcy5cbmNvbnN0IEZBTExCQUNLX0dST1VQX05BTUUgPSAnZmFsbGJhY2snO1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLyoqIExpc3Qgb2YgY29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwLiAqL1xuICBjb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICB0aGlzLl9jYXB0dXJlQ29uZGl0aW9ucyhjb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnKSB7XG4gICAgaWYgKGNvbmZpZy5jb25kaXRpb25zICYmIHRoaXMuZ3JvdXBOYW1lICE9PSBGQUxMQkFDS19HUk9VUF9OQU1FKSB7XG4gICAgICByZXR1cm4gY29uZmlnLmNvbmRpdGlvbnMuZm9yRWFjaChjb25kaXRpb24gPT4ge1xuICAgICAgICBjb25zdCBleHByZXNzaW9uID0gY29uZGl0aW9uLnRyaW0oKTtcblxuICAgICAgICBpZiAoZXhwcmVzc2lvbi5tYXRjaChHTE9CQUxfQVBQUk9WQUxfQ09ORElUSU9OX1JFR0VYKSkge1xuICAgICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG9uJ3QgdGFrZSBhbnkgYWN0aW9uIGZvciBnbG9iYWwgYXBwcm92YWwgY29uZGl0aW9ucy5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuY29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGV4cHJlc3Npb24sXG4gICAgICAgICAgICBjaGVja0ZuOiBjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbihleHByZXNzaW9uKSxcbiAgICAgICAgICAgIG1hdGNoZWRGaWxlczogbmV3IFNldCgpLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXJyb3IoYENvdWxkIG5vdCBwYXJzZSBjb25kaXRpb24gaW4gZ3JvdXA6ICR7dGhpcy5ncm91cE5hbWV9YCk7XG4gICAgICAgICAgZXJyb3IoYCAtICR7ZXhwcmVzc2lvbn1gKTtcbiAgICAgICAgICBlcnJvcihgRXJyb3I6YCk7XG4gICAgICAgICAgZXJyb3IoZS5tZXNzYWdlKTtcbiAgICAgICAgICBlcnJvcihlLnN0YWNrKTtcbiAgICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUZXN0cyBhIHByb3ZpZGVkIGZpbGUgcGF0aCB0byBkZXRlcm1pbmUgaWYgaXQgd291bGQgYmUgY29uc2lkZXJlZCBtYXRjaGVkIGJ5XG4gICAqIHRoZSBwdWxsIGFwcHJvdmUgZ3JvdXAncyBjb25kaXRpb25zLlxuICAgKi9cbiAgdGVzdEZpbGUoZmlsZVBhdGg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmNvbmRpdGlvbnMuZXZlcnkoKHttYXRjaGVkRmlsZXMsIGNoZWNrRm4sIGV4cHJlc3Npb259KSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBtYXRjaGVzRmlsZSA9IGNoZWNrRm4oW2ZpbGVQYXRoXSk7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsZSkge1xuICAgICAgICAgIG1hdGNoZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzRmlsZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9IGBDb25kaXRpb24gY291bGQgbm90IGJlIGV2YWx1YXRlZDogXFxuXFxuYCArXG4gICAgICAgICAgICBgRnJvbSB0aGUgWyR7dGhpcy5ncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgIGAgLSAke2V4cHJlc3Npb259YCArXG4gICAgICAgICAgICBgXFxuXFxuJHtlLm1lc3NhZ2V9ICR7ZS5zdGFja31cXG5cXG5gO1xuICAgICAgICBlcnJvcihlcnJNZXNzYWdlKTtcbiAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkQ29uZGl0aW9ucyA9IHRoaXMuY29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZENvbmRpdGlvbnMgPSB0aGlzLmNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIG1hdGNoZWRDb3VudDogbWF0Y2hlZENvbmRpdGlvbnMubGVuZ3RoLFxuICAgICAgdW5tYXRjaGVkQ29uZGl0aW9ucyxcbiAgICAgIHVubWF0Y2hlZENvdW50OiB1bm1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIGdyb3VwTmFtZTogdGhpcy5ncm91cE5hbWUsXG4gICAgfTtcbiAgfVxufVxuIl19