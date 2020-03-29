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
                                return " " + k + " - $ {\n          v\n        }\n        ";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsdUNBQXVEO0lBc0J2RCxrREFBa0Q7SUFDbEQsSUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUM7SUFFakQsSUFBTSxlQUFlLEdBQUc7UUFDdEIsYUFBYSxFQUFFLHFCQUFxQjtRQUNwQyxhQUFhLEVBQUUseUJBQXlCO1FBQ3hDLFdBQVcsRUFBRSxZQUFZO0tBQzFCLENBQUM7SUFFRiw0REFBNEQ7SUFDNUQ7UUFVRSwwQkFBbUIsU0FBaUIsRUFBRSxLQUE2Qjs7WUFBbkUsaUJBd0NDO1lBeENrQixjQUFTLEdBQVQsU0FBUyxDQUFRO1lBVHBDLHNEQUFzRDtZQUM5Qyx1QkFBa0IsR0FBYSxFQUFFLENBQUM7WUFDMUMsZ0RBQWdEO1lBQ3hDLHNCQUFpQixHQUFxQixFQUFFLENBQUM7WUFDakQsZ0RBQWdEO1lBQ3hDLHNCQUFpQixHQUFxQixFQUFFLENBQUM7WUFDakQsdUNBQXVDO1lBQ2hDLGdCQUFXLEdBQUcsS0FBSyxDQUFDOztnQkFHekIsS0FBc0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7b0JBQW5DLElBQUksU0FBUyxXQUFBO29CQUNoQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUU3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFO3dCQUM1QyxJQUFBLDhEQUF5RSxFQUF4RSxrQkFBVSxFQUFFLDBCQUE0RCxDQUFDO3dCQUNoRixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsS0FBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQzs0QkFDM0QsSUFBSSxFQUFFLFVBQVU7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RyxJQUFJLENBQUM7cUJBQ2hCO2lCQUNGO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxPQUFPLE9BQU8sQ0FBQztRQUNqQixDQUFDO1FBQ0gsdUJBQUM7SUFBRCxDQUFDLEFBckdELElBcUdDO0lBckdZLDRDQUFnQjtJQXVHN0I7OztPQUdHO0lBQ0gsU0FBUywyQkFBMkIsQ0FBQyxLQUFhO1FBQ2hELElBQU0sWUFBWSxHQUFhLEVBQUUsQ0FBQztRQUNsQyxJQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQzthQUNaLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDWixHQUFHLENBQUMsVUFBQyxJQUFZO1lBQ2hCLElBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNoQyxJQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLEtBQUssRUFBRTtnQkFDVixZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUMvQixPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEIsQ0FBQyxDQUFDO2FBQ0QsTUFBTSxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEsQ0FBQyxDQUFDLFVBQVUsRUFBWixDQUFZLENBQUMsQ0FBQztRQUMzRCxPQUFPLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3BDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0lNaW5pbWF0Y2gsIE1pbmltYXRjaCwgbWF0Y2h9IGZyb20gJ21pbmltYXRjaCc7XG5cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cENvbmZpZ30gZnJvbSAnLi9wYXJzZS15YW1sJztcblxuLyoqIEEgY29uZGl0aW9uIGZvciBhIGdyb3VwLiAqL1xuaW50ZXJmYWNlIEdyb3VwQ29uZGl0aW9uIHtcbiAgZ2xvYjogc3RyaW5nO1xuICBtYXRjaGVyOiBJTWluaW1hdGNoO1xuICBtYXRjaGVkRmlsZXM6IFNldDxzdHJpbmc+O1xufVxuXG4vKiogUmVzdWx0IG9mIHRlc3RpbmcgZmlsZXMgYWdhaW5zdCB0aGUgZ3JvdXAuICovXG5leHBvcnQgaW50ZXJmYWNlIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICBncm91cE5hbWU6IHN0cmluZztcbiAgbWF0Y2hlZEluY2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkRXhjbHVkZXM6IEdyb3VwQ29uZGl0aW9uW107XG4gIG1hdGNoZWRDb3VudDogbnVtYmVyO1xuICB1bm1hdGNoZWRJbmNsdWRlczogR3JvdXBDb25kaXRpb25bXTtcbiAgdW5tYXRjaGVkRXhjbHVkZXM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZENvdW50OiBudW1iZXI7XG59XG5cbi8vIFJlZ2V4IE1hdGNoZXIgZm9yIGNvbnRhaW5zX2FueV9nbG9icyBjb25kaXRpb25zXG5jb25zdCBDT05UQUlOU19BTllfR0xPQlNfUkVHRVggPSAvXicoW14nXSspJyw/JC87XG5cbmNvbnN0IENPTkRJVElPTl9UWVBFUyA9IHtcbiAgSU5DTFVERV9HTE9CUzogL15jb250YWluc19hbnlfZ2xvYnMvLFxuICBFWENMVURFX0dMT0JTOiAvXm5vdCBjb250YWluc19hbnlfZ2xvYnMvLFxuICBBVFRSX0xFTkdUSDogL15sZW5cXCguKlxcKS8sXG59O1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLy8gTGluZXMgd2hpY2ggd2VyZSBub3QgYWJsZSB0byBiZSBwYXJzZWQgYXMgZXhwZWN0ZWQuXG4gIHByaXZhdGUgbWlzY29uZmlndXJlZExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBDb25kaXRpb25zIGZvciB0aGUgZ3JvdXAgZm9yIGluY2x1ZGluZyBmaWxlcy5cbiAgcHJpdmF0ZSBpbmNsdWRlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvLyBDb25kaXRpb25zIGZvciB0aGUgZ3JvdXAgZm9yIGV4Y2x1ZGluZyBmaWxlcy5cbiAgcHJpdmF0ZSBleGNsdWRlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvLyBXaGV0aGVyIHRoZSBncm91cCBoYXMgZmlsZSBtYXRjaGVycy5cbiAgcHVibGljIGhhc01hdGNoZXJzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBncm91cDogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGZvciAobGV0IGNvbmRpdGlvbiBvZiBncm91cC5jb25kaXRpb25zKSB7XG4gICAgICBjb25kaXRpb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICBpZiAoY29uZGl0aW9uLm1hdGNoKENPTkRJVElPTl9UWVBFUy5JTkNMVURFX0dMT0JTKSkge1xuICAgICAgICBjb25zdCBbY29uZGl0aW9ucywgbWlzY29uZmlndXJlZExpbmVzXSA9IGdldExpbmVzRm9yQ29udGFpbnNBbnlHbG9icyhjb25kaXRpb24pO1xuICAgICAgICBjb25kaXRpb25zLmZvckVhY2goZ2xvYlN0cmluZyA9PiB0aGlzLmluY2x1ZGVDb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgIGdsb2I6IGdsb2JTdHJpbmcsXG4gICAgICAgICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChnbG9iU3RyaW5nLCB7ZG90OiB0cnVlfSksXG4gICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0PHN0cmluZz4oKSxcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLm1pc2NvbmZpZ3VyZWRMaW5lcy5wdXNoKC4uLm1pc2NvbmZpZ3VyZWRMaW5lcyk7XG4gICAgICAgIHRoaXMuaGFzTWF0Y2hlcnMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24ubWF0Y2goQ09ORElUSU9OX1RZUEVTLkVYQ0xVREVfR0xPQlMpKSB7XG4gICAgICAgIGNvbnN0IFtjb25kaXRpb25zLCBtaXNjb25maWd1cmVkTGluZXNdID0gZ2V0TGluZXNGb3JDb250YWluc0FueUdsb2JzKGNvbmRpdGlvbik7XG4gICAgICAgIGNvbmRpdGlvbnMuZm9yRWFjaChnbG9iU3RyaW5nID0+IHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgZ2xvYjogZ2xvYlN0cmluZyxcbiAgICAgICAgICBtYXRjaGVyOiBuZXcgTWluaW1hdGNoKGdsb2JTdHJpbmcsIHtkb3Q6IHRydWV9KSxcbiAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMubWlzY29uZmlndXJlZExpbmVzLnB1c2goLi4ubWlzY29uZmlndXJlZExpbmVzKTtcbiAgICAgICAgdGhpcy5oYXNNYXRjaGVycyA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKGNvbmRpdGlvbi5tYXRjaChDT05ESVRJT05fVFlQRVMuQVRUUl9MRU5HVEgpKSB7XG4gICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG8gbm90IHRha2UgYW55IGFjdGlvbiBvbiB0aGlzIGNvbmRpdGlvbiB0eXBlLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9XG4gICAgICAgICAgICBgVW5yZWNvZ25pemVkIGNvbmRpdGlvbiBmb3VuZCwgdW5hYmxlIHRvIHBhcnNlIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uOiBcXG5cXG5gICtcbiAgICAgICAgICAgIGBGcm9tIHRoZSBbJHtncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgIGAgLSAke2NvbmRpdGlvbn1gICtcbiAgICAgICAgICAgIGBcXG5cXG5gICtcbiAgICAgICAgICAgIGBLbm93biBjb25kaXRpb24gcmVnZXhzOlxcbmAgK1xuICAgICAgICAgICAgYCR7T2JqZWN0LmVudHJpZXMoQ09ORElUSU9OX1RZUEVTKS5tYXAoKFtrLCB2XSkgPT4gYCAke2t9IC0gJCB7XG4gICAgICAgICAgdlxuICAgICAgICB9XG4gICAgICAgIGApLmpvaW4oJ1xcbicpfWAgK1xuICAgICAgICAgICAgYFxcblxcbmA7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTWVzc2FnZSk7XG4gICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUmV0cmlldmUgYWxsIG9mIHRoZSBsaW5lcyB3aGljaCB3ZXJlIG5vdCBhYmxlIHRvIGJlIHBhcnNlZC4gKi9cbiAgZ2V0QmFkTGluZXMoKTogc3RyaW5nW10geyByZXR1cm4gdGhpcy5taXNjb25maWd1cmVkTGluZXM7IH1cblxuICAvKiogUmV0cmlldmUgdGhlIHJlc3VsdHMgZm9yIHRoZSBHcm91cCwgYWxsIG1hdGNoZWQgYW5kIHVubWF0Y2hlZCBjb25kaXRpb25zLiAqL1xuICBnZXRSZXN1bHRzKCk6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQge1xuICAgIGNvbnN0IG1hdGNoZWRJbmNsdWRlcyA9IHRoaXMuaW5jbHVkZUNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gISFjLm1hdGNoZWRGaWxlcy5zaXplKTtcbiAgICBjb25zdCBtYXRjaGVkRXhjbHVkZXMgPSB0aGlzLmV4Y2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICEhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgdW5tYXRjaGVkSW5jbHVkZXMgPSB0aGlzLmluY2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICFjLm1hdGNoZWRGaWxlcy5zaXplKTtcbiAgICBjb25zdCB1bm1hdGNoZWRFeGNsdWRlcyA9IHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMuZmlsdGVyKGMgPT4gIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZENvdW50ID0gdW5tYXRjaGVkSW5jbHVkZXMubGVuZ3RoICsgdW5tYXRjaGVkRXhjbHVkZXMubGVuZ3RoO1xuICAgIGNvbnN0IG1hdGNoZWRDb3VudCA9IG1hdGNoZWRJbmNsdWRlcy5sZW5ndGggKyBtYXRjaGVkRXhjbHVkZXMubGVuZ3RoO1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVkSW5jbHVkZXMsXG4gICAgICBtYXRjaGVkRXhjbHVkZXMsXG4gICAgICBtYXRjaGVkQ291bnQsXG4gICAgICB1bm1hdGNoZWRJbmNsdWRlcyxcbiAgICAgIHVubWF0Y2hlZEV4Y2x1ZGVzLFxuICAgICAgdW5tYXRjaGVkQ291bnQsXG4gICAgICBncm91cE5hbWU6IHRoaXMuZ3JvdXBOYW1lLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgYSBwcm92aWRlZCBmaWxlIHBhdGggdG8gZGV0ZXJtaW5lIGlmIGl0IHdvdWxkIGJlIGNvbnNpZGVyZWQgbWF0Y2hlZCBieVxuICAgKiB0aGUgcHVsbCBhcHByb3ZlIGdyb3VwJ3MgY29uZGl0aW9ucy5cbiAgICovXG4gIHRlc3RGaWxlKGZpbGU6IHN0cmluZykge1xuICAgIGxldCBtYXRjaGVkID0gZmFsc2U7XG4gICAgdGhpcy5pbmNsdWRlQ29uZGl0aW9ucy5mb3JFYWNoKChpbmNsdWRlQ29uZGl0aW9uOiBHcm91cENvbmRpdGlvbikgPT4ge1xuICAgICAgaWYgKGluY2x1ZGVDb25kaXRpb24ubWF0Y2hlci5tYXRjaChmaWxlKSkge1xuICAgICAgICBsZXQgbWF0Y2hlZEV4Y2x1ZGUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5leGNsdWRlQ29uZGl0aW9ucy5mb3JFYWNoKChleGNsdWRlQ29uZGl0aW9uOiBHcm91cENvbmRpdGlvbikgPT4ge1xuICAgICAgICAgIGlmIChleGNsdWRlQ29uZGl0aW9uLm1hdGNoZXIubWF0Y2goZmlsZSkpIHtcbiAgICAgICAgICAgIC8vIEFkZCBmaWxlIGFzIGEgZGlzY292ZXJlZCBleGNsdWRlIGFzIGl0IGlzIG5lZ2F0aW5nIGEgbWF0Y2hlZFxuICAgICAgICAgICAgLy8gaW5jbHVkZSBjb25kaXRpb24uXG4gICAgICAgICAgICBleGNsdWRlQ29uZGl0aW9uLm1hdGNoZWRGaWxlcy5hZGQoZmlsZSk7XG4gICAgICAgICAgICBtYXRjaGVkRXhjbHVkZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gQW4gaW5jbHVkZSBjb25kaXRpb24gaXMgb25seSBjb25zaWRlcmVkIG1hdGNoZWQgaWYgbm8gZXhjbHVkZVxuICAgICAgICAvLyBjb25kaXRpb25zIGFyZSBmb3VuZCB0byBtYXRjaGVkIHRoZSBmaWxlLlxuICAgICAgICBpZiAoIW1hdGNoZWRFeGNsdWRlKSB7XG4gICAgICAgICAgaW5jbHVkZUNvbmRpdGlvbi5tYXRjaGVkRmlsZXMuYWRkKGZpbGUpO1xuICAgICAgICAgIG1hdGNoZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBFeHRyYWN0IGFsbCBvZiB0aGUgaW5kaXZpZHVhbCBnbG9icyBmcm9tIGEgZ3JvdXAgY29uZGl0aW9uLFxuICogcHJvdmlkaW5nIGJvdGggdGhlIHZhbGlkIGFuZCBpbnZhbGlkIGxpbmVzLlxuICovXG5mdW5jdGlvbiBnZXRMaW5lc0ZvckNvbnRhaW5zQW55R2xvYnMobGluZXM6IHN0cmluZykge1xuICBjb25zdCBpbnZhbGlkTGluZXM6IHN0cmluZ1tdID0gW107XG4gIGNvbnN0IHZhbGlkTGluZXMgPSBsaW5lcy5zcGxpdCgnXFxuJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAuc2xpY2UoMSwgLTEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCgoZ2xvYjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0cmltbWVkR2xvYiA9IGdsb2IudHJpbSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSB0cmltbWVkR2xvYi5tYXRjaChDT05UQUlOU19BTllfR0xPQlNfUkVHRVgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZhbGlkTGluZXMucHVzaCh0cmltbWVkR2xvYik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5maWx0ZXIoZ2xvYlN0cmluZyA9PiAhIWdsb2JTdHJpbmcpO1xuICByZXR1cm4gW3ZhbGlkTGluZXMsIGludmFsaWRMaW5lc107XG59XG4iXX0=