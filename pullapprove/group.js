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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXVDO0lBQ3ZDLGtHQUFpRTtJQUVqRSxnR0FBMEU7SUF5QjFFLHNFQUFzRTtJQUN0RSxJQUFNLCtCQUErQixHQUFHLHFEQUFxRCxDQUFDO0lBRTlGLHlGQUF5RjtJQUN6RiwwRkFBMEY7SUFDMUYsa0ZBQWtGO0lBQ2xGLElBQU0sbUJBQW1CLEdBQUcsVUFBVSxDQUFDO0lBRXZDLDREQUE0RDtJQUM1RDtRQU1FLDBCQUNXLFNBQWlCLEVBQUUsTUFBOEIsRUFDL0MsZUFBd0M7WUFBeEMsZ0NBQUEsRUFBQSxvQkFBd0M7O1lBRDFDLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFDZixvQkFBZSxHQUFmLGVBQWUsQ0FBeUI7WUFQckQsd0NBQXdDO1lBQy9CLGVBQVUsR0FBcUIsRUFBRSxDQUFDO1lBT3pDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQUEsTUFBTSxDQUFDLFNBQVMsbUNBQUksRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRU8sNkNBQWtCLEdBQTFCLFVBQTJCLE1BQThCO1lBQXpELGlCQTJCQztZQTFCQyxJQUFJLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxtQkFBbUIsRUFBRTtnQkFDL0QsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFNBQVM7b0JBQ3hDLElBQU0sVUFBVSxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFcEMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLEVB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aUJBQWlCLG1CQUFBO2dCQUNqQixZQUFZLEVBQUUsaUJBQWlCLENBQUMsTUFBTTtnQkFDdEMsbUJBQW1CLHFCQUFBO2dCQUNuQixjQUFjLEVBQUUsbUJBQW1CLENBQUMsTUFBTTtnQkFDMUMsc0JBQXNCLHdCQUFBO2dCQUN0QixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7YUFDMUIsQ0FBQztRQUNKLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUEzRkQsSUEyRkM7SUEzRlksNENBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uL3V0aWxzL2NvbnNvbGUnO1xuaW1wb3J0IHtjb252ZXJ0Q29uZGl0aW9uVG9GdW5jdGlvbn0gZnJvbSAnLi9jb25kaXRpb25fZXZhbHVhdG9yJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cENvbmZpZ30gZnJvbSAnLi9wYXJzZS15YW1sJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yfSBmcm9tICcuL3B1bGxhcHByb3ZlX2FycmF5cyc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGV4cHJlc3Npb246IHN0cmluZztcbiAgY2hlY2tGbjogKGZpbGVzOiBzdHJpbmdbXSwgZ3JvdXBzOiBQdWxsQXBwcm92ZUdyb3VwW10pID0+IGJvb2xlYW47XG4gIG1hdGNoZWRGaWxlczogU2V0PHN0cmluZz47XG4gIHVudmVyaWZpYWJsZTogYm9vbGVhbjtcbn1cblxuaW50ZXJmYWNlIEdyb3VwUmV2aWV3ZXJzIHtcbiAgdXNlcnM/OiBzdHJpbmdbXTtcbiAgdGVhbXM/OiBzdHJpbmdbXTtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbiAgdW5tYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW52ZXJpZmlhYmxlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXTtcbn1cblxuLy8gUmVndWxhciBleHByZXNzaW9uIHRoYXQgbWF0Y2hlcyBjb25kaXRpb25zIGZvciB0aGUgZ2xvYmFsIGFwcHJvdmFsLlxuY29uc3QgR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCA9IC9eXCJnbG9iYWwtKGRvY3MtKT9hcHByb3ZlcnNcIiBub3QgaW4gZ3JvdXBzLmFwcHJvdmVkJC87XG5cbi8vIE5hbWUgb2YgdGhlIFB1bGxBcHByb3ZlIGdyb3VwIHRoYXQgc2VydmVzIGFzIGZhbGxiYWNrLiBUaGlzIGdyb3VwIHNob3VsZCBuZXZlciBjYXB0dXJlXG4vLyBhbnkgY29uZGl0aW9ucyBhcyBpdCB3b3VsZCBhbHdheXMgbWF0Y2ggc3BlY2lmaWVkIGZpbGVzLiBUaGlzIGlzIG5vdCBkZXNpcmVkIGFzIHdlIHdhbnRcbi8vIHRvIGZpZ3VyZSBvdXQgYXMgcGFydCBvZiB0aGlzIHRvb2wsIHdoZXRoZXIgdGhlcmUgYWN0dWFsbHkgYXJlIHVubWF0Y2hlZCBmaWxlcy5cbmNvbnN0IEZBTExCQUNLX0dST1VQX05BTUUgPSAnZmFsbGJhY2snO1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLyoqIExpc3Qgb2YgY29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSBjb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG4gIC8qKiBMaXN0IG9mIHJldmlld2VycyBmb3IgdGhlIGdyb3VwLiAqL1xuICByZWFkb25seSByZXZpZXdlcnM6IEdyb3VwUmV2aWV3ZXJzO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBjb25maWc6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcsXG4gICAgICByZWFkb25seSBwcmVjZWRpbmdHcm91cHM6IFB1bGxBcHByb3ZlR3JvdXBbXSA9IFtdKSB7XG4gICAgdGhpcy5fY2FwdHVyZUNvbmRpdGlvbnMoY29uZmlnKTtcbiAgICB0aGlzLnJldmlld2VycyA9IGNvbmZpZy5yZXZpZXdlcnMgPz8ge3VzZXJzOiBbXSwgdGVhbXM6IFtdfTtcbiAgfVxuXG4gIHByaXZhdGUgX2NhcHR1cmVDb25kaXRpb25zKGNvbmZpZzogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChjb25maWcuY29uZGl0aW9ucyAmJiB0aGlzLmdyb3VwTmFtZSAhPT0gRkFMTEJBQ0tfR1JPVVBfTkFNRSkge1xuICAgICAgcmV0dXJuIGNvbmZpZy5jb25kaXRpb25zLmZvckVhY2goY29uZGl0aW9uID0+IHtcbiAgICAgICAgY29uc3QgZXhwcmVzc2lvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGV4cHJlc3Npb24ubWF0Y2goR0xPQkFMX0FQUFJPVkFMX0NPTkRJVElPTl9SRUdFWCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGlzLmNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBleHByZXNzaW9uLFxuICAgICAgICAgICAgY2hlY2tGbjogY29udmVydENvbmRpdGlvblRvRnVuY3Rpb24oZXhwcmVzc2lvbiksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICAgIHVudmVyaWZpYWJsZTogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBlcnJvcihgQ291bGQgbm90IHBhcnNlIGNvbmRpdGlvbiBpbiBncm91cDogJHt0aGlzLmdyb3VwTmFtZX1gKTtcbiAgICAgICAgICBlcnJvcihgIC0gJHtleHByZXNzaW9ufWApO1xuICAgICAgICAgIGVycm9yKGBFcnJvcjpgKTtcbiAgICAgICAgICBlcnJvcihlLm1lc3NhZ2UpO1xuICAgICAgICAgIGVycm9yKGUuc3RhY2spO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlUGF0aDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuY29uZGl0aW9ucy5ldmVyeSgoY29uZGl0aW9uKSA9PiB7XG4gICAgICBjb25zdCB7bWF0Y2hlZEZpbGVzLCBjaGVja0ZuLCBleHByZXNzaW9ufSA9IGNvbmRpdGlvbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1hdGNoZXNGaWxlID0gY2hlY2tGbihbZmlsZVBhdGhdLCB0aGlzLnByZWNlZGluZ0dyb3Vwcyk7XG4gICAgICAgIGlmIChtYXRjaGVzRmlsZSkge1xuICAgICAgICAgIG1hdGNoZWRGaWxlcy5hZGQoZmlsZVBhdGgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXRjaGVzRmlsZTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgYSBjb25kaXRpb24gdGhhdCBkZXBlbmRzIG9uIHRoZSBzdGF0ZSBvZiBncm91cHMgd2Ugd2FudCB0b1xuICAgICAgICAvLyBpZ25vcmUgdGhhdCB0aGUgdmVyaWZpY2F0aW9uIGNhbid0IGFjY3VyYXRlbHkgZXZhbHVhdGUgdGhlIGNvbmRpdGlvbiBhbmQgdGhlblxuICAgICAgICAvLyBjb250aW51ZSBwcm9jZXNzaW5nLiBPdGhlciB0eXBlcyBvZiBlcnJvcnMgZmFpbCB0aGUgdmVyaWZpY2F0aW9uLCBhcyBjb25kaXRpb25zXG4gICAgICAgIC8vIHNob3VsZCBvdGhlcndpc2UgYmUgYWJsZSB0byBleGVjdXRlIHdpdGhvdXQgdGhyb3dpbmcuXG4gICAgICAgIGlmIChlIGluc3RhbmNlb2YgUHVsbEFwcHJvdmVHcm91cFN0YXRlRGVwZW5kZW5jeUVycm9yKSB7XG4gICAgICAgICAgY29uZGl0aW9uLnVudmVyaWZpYWJsZSA9IHRydWU7XG4gICAgICAgICAgLy8gUmV0dXJuIHRydWUgc28gdGhhdCBgdGhpcy5jb25kaXRpb25zLmV2ZXJ5YCBjYW4gY29udGludWUgZXZhbHVhdGluZy5cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID0gYENvbmRpdGlvbiBjb3VsZCBub3QgYmUgZXZhbHVhdGVkOiBcXG5cXG5gICtcbiAgICAgICAgICAgICAgYEZyb20gdGhlIFske3RoaXMuZ3JvdXBOYW1lfV0gZ3JvdXA6XFxuYCArXG4gICAgICAgICAgICAgIGAgLSAke2V4cHJlc3Npb259YCArXG4gICAgICAgICAgICAgIGBcXG5cXG4ke2UubWVzc2FnZX0gJHtlLnN0YWNrfVxcblxcbmA7XG4gICAgICAgICAgZXJyb3IoZXJyTWVzc2FnZSk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlc3VsdHMgZm9yIHRoZSBHcm91cCwgYWxsIG1hdGNoZWQgYW5kIHVubWF0Y2hlZCBjb25kaXRpb25zLiAqL1xuICBnZXRSZXN1bHRzKCk6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICAgIGNvbnN0IG1hdGNoZWRDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPiAwKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb25kaXRpb25zID1cbiAgICAgICAgdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMubWF0Y2hlZEZpbGVzLnNpemUgPT09IDAgJiYgIWMudW52ZXJpZmlhYmxlKTtcbiAgICBjb25zdCB1bnZlcmlmaWFibGVDb25kaXRpb25zID0gdGhpcy5jb25kaXRpb25zLmZpbHRlcihjID0+IGMudW52ZXJpZmlhYmxlKTtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZENvbmRpdGlvbnMsXG4gICAgICBtYXRjaGVkQ291bnQ6IG1hdGNoZWRDb25kaXRpb25zLmxlbmd0aCxcbiAgICAgIHVubWF0Y2hlZENvbmRpdGlvbnMsXG4gICAgICB1bm1hdGNoZWRDb3VudDogdW5tYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGgsXG4gICAgICB1bnZlcmlmaWFibGVDb25kaXRpb25zLFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG59XG4iXX0=