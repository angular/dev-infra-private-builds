(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/dev-infra-private/pullapprove/group", ["require", "exports", "tslib", "minimatch"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var tslib_1 = require("tslib");
    /**
     * @license
     * Copyright Google Inc. All Rights Reserved.
     *
     * Use of this source code is governed by an MIT-style license that can be
     * found in the LICENSE file at https://angular.io/license
     */
    var minimatch_1 = require("minimatch");
    // Regex Matcher for contains_any_globs conditions
    var CONTAINS_ANY_GLOBS_REGEX = /^'([^']+)',?$/;
    var CONDITION_TYPES = {
        INCLUDE_GLOBS: /^contains_any_globs/,
        EXCLUDE_GLOBS: /^not contains_any_globs/,
        ATTR_LENGTH: /^len\(.*\)/,
    };
    /** A PullApprove group to be able to test files against. */
    var PullApproveGroup = /** @class */ (function () {
        function PullApproveGroup(groupName, group) {
            var e_1, _a, _b, _c;
            var _this = this;
            this.groupName = groupName;
            // Lines which were not able to be parsed as expected.
            this.misconfiguredLines = [];
            // Conditions for the group for including files.
            this.includeConditions = [];
            // Conditions for the group for excluding files.
            this.excludeConditions = [];
            // Whether the group has file matchers.
            this.hasMatchers = false;
            try {
                for (var _d = tslib_1.__values(group.conditions), _e = _d.next(); !_e.done; _e = _d.next()) {
                    var condition = _e.value;
                    condition = condition.trim();
                    if (condition.match(CONDITION_TYPES.INCLUDE_GLOBS)) {
                        var _f = tslib_1.__read(getLinesForContainsAnyGlobs(condition), 2), conditions = _f[0], misconfiguredLines = _f[1];
                        conditions.forEach(function (globString) { return _this.includeConditions.push({
                            glob: globString,
                            matcher: new minimatch_1.Minimatch(globString, { dot: true }),
                            matchedFiles: new Set(),
                        }); });
                        (_b = this.misconfiguredLines).push.apply(_b, tslib_1.__spread(misconfiguredLines));
                        this.hasMatchers = true;
                    }
                    else if (condition.match(CONDITION_TYPES.EXCLUDE_GLOBS)) {
                        var _g = tslib_1.__read(getLinesForContainsAnyGlobs(condition), 2), conditions = _g[0], misconfiguredLines = _g[1];
                        conditions.forEach(function (globString) { return _this.excludeConditions.push({
                            glob: globString,
                            matcher: new minimatch_1.Minimatch(globString, { dot: true }),
                            matchedFiles: new Set(),
                        }); });
                        (_c = this.misconfiguredLines).push.apply(_c, tslib_1.__spread(misconfiguredLines));
                        this.hasMatchers = true;
                    }
                    else if (condition.match(CONDITION_TYPES.ATTR_LENGTH)) {
                        // Currently a noop as we do not take any action on this condition type.
                    }
                    else {
                        var errMessage = "Unrecognized condition found, unable to parse the following condition: \n\n" +
                            ("From the [" + groupName + "] group:\n") +
                            (" - " + condition) +
                            "\n\n" +
                            "Known condition regexs:\n" +
                            ("" + Object.entries(CONDITION_TYPES).map(function (_a) {
                                var _b = tslib_1.__read(_a, 2), k = _b[0], v = _b[1];
                                return "  " + k + "  -  " + v;
                            }).join('\n')) +
                            "\n\n";
                        console.error(errMessage);
                        process.exit(1);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
        /** Retrieve all of the lines which were not able to be parsed. */
        PullApproveGroup.prototype.getBadLines = function () { return this.misconfiguredLines; };
        /** Retrieve the results for the Group, all matched and unmatched conditions. */
        PullApproveGroup.prototype.getResults = function () {
            var matchedIncludes = this.includeConditions.filter(function (c) { return !!c.matchedFiles.size; });
            var matchedExcludes = this.excludeConditions.filter(function (c) { return !!c.matchedFiles.size; });
            var unmatchedIncludes = this.includeConditions.filter(function (c) { return !c.matchedFiles.size; });
            var unmatchedExcludes = this.excludeConditions.filter(function (c) { return !c.matchedFiles.size; });
            var unmatchedCount = unmatchedIncludes.length + unmatchedExcludes.length;
            var matchedCount = matchedIncludes.length + matchedExcludes.length;
            return {
                matchedIncludes: matchedIncludes,
                matchedExcludes: matchedExcludes,
                matchedCount: matchedCount,
                unmatchedIncludes: unmatchedIncludes,
                unmatchedExcludes: unmatchedExcludes,
                unmatchedCount: unmatchedCount,
                groupName: this.groupName,
            };
        };
        /**
         * Tests a provided file path to determine if it would be considered matched by
         * the pull approve group's conditions.
         */
        PullApproveGroup.prototype.testFile = function (file) {
            var _this = this;
            var matched = false;
            this.includeConditions.forEach(function (includeCondition) {
                if (includeCondition.matcher.match(file)) {
                    var matchedExclude_1 = false;
                    _this.excludeConditions.forEach(function (excludeCondition) {
                        if (excludeCondition.matcher.match(file)) {
                            // Add file as a discovered exclude as it is negating a matched
                            // include condition.
                            excludeCondition.matchedFiles.add(file);
                            matchedExclude_1 = true;
                        }
                    });
                    // An include condition is only considered matched if no exclude
                    // conditions are found to matched the file.
                    if (!matchedExclude_1) {
                        includeCondition.matchedFiles.add(file);
                        matched = true;
                    }
                }
            });
            return matched;
        };
        return PullApproveGroup;
    }());
    exports.PullApproveGroup = PullApproveGroup;
    /**
     * Extract all of the individual globs from a group condition,
     * providing both the valid and invalid lines.
     */
    function getLinesForContainsAnyGlobs(lines) {
        var invalidLines = [];
        var validLines = lines.split('\n')
            .slice(1, -1)
            .map(function (glob) {
            var trimmedGlob = glob.trim();
            var match = trimmedGlob.match(CONTAINS_ANY_GLOBS_REGEX);
            if (!match) {
                invalidLines.push(trimmedGlob);
                return '';
            }
            return match[1];
        })
            .filter(function (globString) { return !!globString; });
        return [validLines, invalidLines];
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsdUNBQXVEO0lBc0J2RCxrREFBa0Q7SUFDbEQsSUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUM7SUFFakQsSUFBTSxlQUFlLEdBQUc7UUFDdEIsYUFBYSxFQUFFLHFCQUFxQjtRQUNwQyxhQUFhLEVBQUUseUJBQXlCO1FBQ3hDLFdBQVcsRUFBRSxZQUFZO0tBQzFCLENBQUM7SUFFRiw0REFBNEQ7SUFDNUQ7UUFVRSwwQkFBbUIsU0FBaUIsRUFBRSxLQUE2Qjs7WUFBbkUsaUJBb0NDO1lBcENrQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBVHBDLHNEQUFzRDtZQUM5Qyx1QkFBa0IsR0FBYSxFQUFFLENBQUM7WUFDMUMsZ0RBQWdEO1lBQ3hDLHNCQUFpQixHQUFxQixFQUFFLENBQUM7WUFDakQsZ0RBQWdEO1lBQ3hDLHNCQUFpQixHQUFxQixFQUFFLENBQUM7WUFDakQsdUNBQXVDO1lBQ2hDLGdCQUFXLEdBQUcsS0FBSyxDQUFDOztnQkFHekIsS0FBc0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQW5DLElBQUksU0FBUyxXQUFBO29CQUNoQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUU3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dCQUM1QyxJQUFBLDhEQUF5RSxFQUF4RSxrQkFBVSxFQUFFLDBCQUE0RCxDQUFDO3dCQUNoRixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQzs0QkFDM0QsSUFBSSxFQUFFLFVBQVU7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LEdBQUcsSUFBSSxDQUFDO3FCQUNoQjtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQWpHRCxJQWlHQztJQWpHWSw0Q0FBZ0I7SUFtRzdCOzs7T0FHRztJQUNILFNBQVMsMkJBQTJCLENBQUMsS0FBYTtRQUNoRCxJQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ1osR0FBRyxDQUFDLFVBQUMsSUFBWTtZQUNoQixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsSUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxVQUFBLFVBQVUsSUFBSSxPQUFBLENBQUMsQ0FBQyxVQUFVLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNwQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJTWluaW1hdGNoLCBNaW5pbWF0Y2gsIG1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGdsb2I6IHN0cmluZztcbiAgbWF0Y2hlcjogSU1pbmltYXRjaDtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRJbmNsdWRlczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkSW5jbHVkZXM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xufVxuXG4vLyBSZWdleCBNYXRjaGVyIGZvciBjb250YWluc19hbnlfZ2xvYnMgY29uZGl0aW9uc1xuY29uc3QgQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYID0gL14nKFteJ10rKScsPyQvO1xuXG5jb25zdCBDT05ESVRJT05fVFlQRVMgPSB7XG4gIElOQ0xVREVfR0xPQlM6IC9eY29udGFpbnNfYW55X2dsb2JzLyxcbiAgRVhDTFVERV9HTE9CUzogL15ub3QgY29udGFpbnNfYW55X2dsb2JzLyxcbiAgQVRUUl9MRU5HVEg6IC9ebGVuXFwoLipcXCkvLFxufTtcblxuLyoqIEEgUHVsbEFwcHJvdmUgZ3JvdXAgdG8gYmUgYWJsZSB0byB0ZXN0IGZpbGVzIGFnYWluc3QuICovXG5leHBvcnQgY2xhc3MgUHVsbEFwcHJvdmVHcm91cCB7XG4gIC8vIExpbmVzIHdoaWNoIHdlcmUgbm90IGFibGUgdG8gYmUgcGFyc2VkIGFzIGV4cGVjdGVkLlxuICBwcml2YXRlIG1pc2NvbmZpZ3VyZWRMaW5lczogc3RyaW5nW10gPSBbXTtcbiAgLy8gQ29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwIGZvciBpbmNsdWRpbmcgZmlsZXMuXG4gIHByaXZhdGUgaW5jbHVkZUNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW10gPSBbXTtcbiAgLy8gQ29uZGl0aW9ucyBmb3IgdGhlIGdyb3VwIGZvciBleGNsdWRpbmcgZmlsZXMuXG4gIHByaXZhdGUgZXhjbHVkZUNvbmRpdGlvbnM6IEdyb3VwQ29uZGl0aW9uW10gPSBbXTtcbiAgLy8gV2hldGhlciB0aGUgZ3JvdXAgaGFzIGZpbGUgbWF0Y2hlcnMuXG4gIHB1YmxpYyBoYXNNYXRjaGVycyA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBncm91cE5hbWU6IHN0cmluZywgZ3JvdXA6IFB1bGxBcHByb3ZlR3JvdXBDb25maWcpIHtcbiAgICBmb3IgKGxldCBjb25kaXRpb24gb2YgZ3JvdXAuY29uZGl0aW9ucykge1xuICAgICAgY29uZGl0aW9uID0gY29uZGl0aW9uLnRyaW0oKTtcblxuICAgICAgaWYgKGNvbmRpdGlvbi5tYXRjaChDT05ESVRJT05fVFlQRVMuSU5DTFVERV9HTE9CUykpIHtcbiAgICAgICAgY29uc3QgW2NvbmRpdGlvbnMsIG1pc2NvbmZpZ3VyZWRMaW5lc10gPSBnZXRMaW5lc0ZvckNvbnRhaW5zQW55R2xvYnMoY29uZGl0aW9uKTtcbiAgICAgICAgY29uZGl0aW9ucy5mb3JFYWNoKGdsb2JTdHJpbmcgPT4gdGhpcy5pbmNsdWRlQ29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICBnbG9iOiBnbG9iU3RyaW5nLFxuICAgICAgICAgIG1hdGNoZXI6IG5ldyBNaW5pbWF0Y2goZ2xvYlN0cmluZywge2RvdDogdHJ1ZX0pLFxuICAgICAgICAgIG1hdGNoZWRGaWxlczogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5taXNjb25maWd1cmVkTGluZXMucHVzaCguLi5taXNjb25maWd1cmVkTGluZXMpO1xuICAgICAgICB0aGlzLmhhc01hdGNoZXJzID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uLm1hdGNoKENPTkRJVElPTl9UWVBFUy5FWENMVURFX0dMT0JTKSkge1xuICAgICAgICBjb25zdCBbY29uZGl0aW9ucywgbWlzY29uZmlndXJlZExpbmVzXSA9IGdldExpbmVzRm9yQ29udGFpbnNBbnlHbG9icyhjb25kaXRpb24pO1xuICAgICAgICBjb25kaXRpb25zLmZvckVhY2goZ2xvYlN0cmluZyA9PiB0aGlzLmV4Y2x1ZGVDb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgIGdsb2I6IGdsb2JTdHJpbmcsXG4gICAgICAgICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChnbG9iU3RyaW5nLCB7ZG90OiB0cnVlfSksXG4gICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0PHN0cmluZz4oKSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm1pc2NvbmZpZ3VyZWRMaW5lcy5wdXNoKC4uLm1pc2NvbmZpZ3VyZWRMaW5lcyk7XG4gICAgICAgIHRoaXMuaGFzTWF0Y2hlcnMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24ubWF0Y2goQ09ORElUSU9OX1RZUEVTLkFUVFJfTEVOR1RIKSkge1xuICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvIG5vdCB0YWtlIGFueSBhY3Rpb24gb24gdGhpcyBjb25kaXRpb24gdHlwZS5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGVyck1lc3NhZ2UgPSBgVW5yZWNvZ25pemVkIGNvbmRpdGlvbiBmb3VuZCwgdW5hYmxlIHRvIHBhcnNlIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uOiBcXG5cXG5gICtcbiAgICAgICAgYEZyb20gdGhlIFske2dyb3VwTmFtZX1dIGdyb3VwOlxcbmAgK1xuICAgICAgICBgIC0gJHtjb25kaXRpb259YCArXG4gICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgYEtub3duIGNvbmRpdGlvbiByZWdleHM6XFxuYCArIFxuICAgICAgICBgJHtPYmplY3QuZW50cmllcyhDT05ESVRJT05fVFlQRVMpLm1hcCgoW2ssIHZdKSA9PiBgICAke2t9ICAtICAke3Z9YCkuam9pbignXFxuJyl9YCArXG4gICAgICAgIGBcXG5cXG5gO1xuICAgICAgICBjb25zb2xlLmVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICBwcm9jZXNzLmV4aXQoMSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHJpZXZlIGFsbCBvZiB0aGUgbGluZXMgd2hpY2ggd2VyZSBub3QgYWJsZSB0byBiZSBwYXJzZWQuICovXG4gIGdldEJhZExpbmVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMubWlzY29uZmlndXJlZExpbmVzOyB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkSW5jbHVkZXMgPSB0aGlzLmluY2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICEhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgbWF0Y2hlZEV4Y2x1ZGVzID0gdGhpcy5leGNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZEluY2x1ZGVzID0gdGhpcy5pbmNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgdW5tYXRjaGVkRXhjbHVkZXMgPSB0aGlzLmV4Y2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICFjLm1hdGNoZWRGaWxlcy5zaXplKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb3VudCA9IHVubWF0Y2hlZEluY2x1ZGVzLmxlbmd0aCArIHVubWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICBjb25zdCBtYXRjaGVkQ291bnQgPSBtYXRjaGVkSW5jbHVkZXMubGVuZ3RoICsgbWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZEluY2x1ZGVzLFxuICAgICAgbWF0Y2hlZEV4Y2x1ZGVzLFxuICAgICAgbWF0Y2hlZENvdW50LFxuICAgICAgdW5tYXRjaGVkSW5jbHVkZXMsXG4gICAgICB1bm1hdGNoZWRFeGNsdWRlcyxcbiAgICAgIHVubWF0Y2hlZENvdW50LFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICBsZXQgbWF0Y2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5jbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoaW5jbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgIGlmIChpbmNsdWRlQ29uZGl0aW9uLm1hdGNoZXIubWF0Y2goZmlsZSkpIHtcbiAgICAgICAgbGV0IG1hdGNoZWRFeGNsdWRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoZXhjbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVyLm1hdGNoKGZpbGUpKSB7XG4gICAgICAgICAgICAvLyBBZGQgZmlsZSBhcyBhIGRpc2NvdmVyZWQgZXhjbHVkZSBhcyBpdCBpcyBuZWdhdGluZyBhIG1hdGNoZWRcbiAgICAgICAgICAgIC8vIGluY2x1ZGUgY29uZGl0aW9uLlxuICAgICAgICAgICAgZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVkRmlsZXMuYWRkKGZpbGUpO1xuICAgICAgICAgICAgbWF0Y2hlZEV4Y2x1ZGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFuIGluY2x1ZGUgY29uZGl0aW9uIGlzIG9ubHkgY29uc2lkZXJlZCBtYXRjaGVkIGlmIG5vIGV4Y2x1ZGVcbiAgICAgICAgLy8gY29uZGl0aW9ucyBhcmUgZm91bmQgdG8gbWF0Y2hlZCB0aGUgZmlsZS5cbiAgICAgICAgaWYgKCFtYXRjaGVkRXhjbHVkZSkge1xuICAgICAgICAgIGluY2x1ZGVDb25kaXRpb24ubWF0Y2hlZEZpbGVzLmFkZChmaWxlKTtcbiAgICAgICAgICBtYXRjaGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBhbGwgb2YgdGhlIGluZGl2aWR1YWwgZ2xvYnMgZnJvbSBhIGdyb3VwIGNvbmRpdGlvbixcbiAqIHByb3ZpZGluZyBib3RoIHRoZSB2YWxpZCBhbmQgaW52YWxpZCBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gZ2V0TGluZXNGb3JDb250YWluc0FueUdsb2JzKGxpbmVzOiBzdHJpbmcpIHtcbiAgY29uc3QgaW52YWxpZExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB2YWxpZExpbmVzID0gbGluZXMuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDEsIC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGdsb2I6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJpbW1lZEdsb2IgPSBnbG9iLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gdHJpbW1lZEdsb2IubWF0Y2goQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZExpbmVzLnB1c2godHJpbW1lZEdsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGdsb2JTdHJpbmcgPT4gISFnbG9iU3RyaW5nKTtcbiAgcmV0dXJuIFt2YWxpZExpbmVzLCBpbnZhbGlkTGluZXNdO1xufVxuIl19