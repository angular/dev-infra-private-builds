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
        GLOBAL_APPROVAL: /^"global-(docs-)?approvers" not in groups.approved$/,
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
            if (group.conditions) {
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
                        else if (condition.match(CONDITION_TYPES.GLOBAL_APPROVAL)) {
                            // Currently a noop as we don't take any action for global approval conditions.
                        }
                        else {
                            var errMessage = "Unrecognized condition found, unable to parse the following condition: \n\n" +
                                ("From the [" + groupName + "] group:\n") +
                                (" - " + condition) +
                                "\n\n" +
                                "Known condition regexs:\n" +
                                ("" + Object.entries(CONDITION_TYPES).map(function (_a) {
                                    var _b = tslib_1.__read(_a, 2), k = _b[0], v = _b[1];
                                    return " " + k + " - " + v;
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
        }
        /** Retrieve all of the lines which were not able to be parsed. */
        PullApproveGroup.prototype.getBadLines = function () {
            return this.misconfiguredLines;
        };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsdUNBQWdEO0lBc0JoRCxrREFBa0Q7SUFDbEQsSUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUM7SUFFakQsSUFBTSxlQUFlLEdBQUc7UUFDdEIsYUFBYSxFQUFFLHFCQUFxQjtRQUNwQyxhQUFhLEVBQUUseUJBQXlCO1FBQ3hDLFdBQVcsRUFBRSxZQUFZO1FBQ3pCLGVBQWUsRUFBRSxxREFBcUQ7S0FDdkUsQ0FBQztJQUVGLDREQUE0RDtJQUM1RDtRQVVFLDBCQUFtQixTQUFpQixFQUFFLEtBQTZCOztZQUFuRSxpQkF5Q0M7WUF6Q2tCLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFUcEMsc0RBQXNEO1lBQzlDLHVCQUFrQixHQUFhLEVBQUUsQ0FBQztZQUMxQyxnREFBZ0Q7WUFDeEMsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQztZQUNqRCxnREFBZ0Q7WUFDeEMsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQztZQUNqRCx1Q0FBdUM7WUFDaEMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7WUFHekIsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFOztvQkFDcEIsS0FBc0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7d0JBQW5DLElBQUksU0FBUyxXQUFBO3dCQUNoQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUU3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFOzRCQUM1QyxJQUFBLDhEQUF5RSxFQUF4RSxrQkFBVSxFQUFFLDBCQUE0RCxDQUFDOzRCQUNoRixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEs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QUMsQ0FBQyxDQUFDO29CQUNILGdFQUFnRTtvQkFDaEUsNENBQTRDO29CQUM1QyxJQUFJLENBQUMsZ0JBQWMsRUFBRTt3QkFDbkIsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQzt3QkFDeEMsT0FBTyxHQUFHLElBQUksQ0FBQztxQkFDaEI7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sT0FBTyxDQUFDO1FBQ2pCLENBQUM7UUFDSCx1QkFBQztJQUFELENBQUMsQUF4R0QsSUF3R0M7SUF4R1ksNENBQWdCO0lBMEc3Qjs7O09BR0c7SUFDSCxTQUFTLDJCQUEyQixDQUFDLEtBQWE7UUFDaEQsSUFBTSxZQUFZLEdBQWEsRUFBRSxDQUFDO1FBQ2xDLElBQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO2FBQ1osS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzthQUNaLEdBQUcsQ0FBQyxVQUFDLElBQVk7WUFDaEIsSUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hDLElBQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUMxRCxJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLFlBQVksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQy9CLE9BQU8sRUFBRSxDQUFDO2FBQ1g7WUFDRCxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQixDQUFDLENBQUM7YUFDRCxNQUFNLENBQUMsVUFBQSxVQUFVLElBQUksT0FBQSxDQUFDLENBQUMsVUFBVSxFQUFaLENBQVksQ0FBQyxDQUFDO1FBQzNELE9BQU8sQ0FBQyxVQUFVLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFDcEMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SU1pbmltYXRjaCwgTWluaW1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGdsb2I6IHN0cmluZztcbiAgbWF0Y2hlcjogSU1pbmltYXRjaDtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRJbmNsdWRlczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkSW5jbHVkZXM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xufVxuXG4vLyBSZWdleCBNYXRjaGVyIGZvciBjb250YWluc19hbnlfZ2xvYnMgY29uZGl0aW9uc1xuY29uc3QgQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYID0gL14nKFteJ10rKScsPyQvO1xuXG5jb25zdCBDT05ESVRJT05fVFlQRVMgPSB7XG4gIElOQ0xVREVfR0xPQlM6IC9eY29udGFpbnNfYW55X2dsb2JzLyxcbiAgRVhDTFVERV9HTE9CUzogL15ub3QgY29udGFpbnNfYW55X2dsb2JzLyxcbiAgQVRUUl9MRU5HVEg6IC9ebGVuXFwoLipcXCkvLFxuICBHTE9CQUxfQVBQUk9WQUw6IC9eXCJnbG9iYWwtKGRvY3MtKT9hcHByb3ZlcnNcIiBub3QgaW4gZ3JvdXBzLmFwcHJvdmVkJC8sXG59O1xuXG4vKiogQSBQdWxsQXBwcm92ZSBncm91cCB0byBiZSBhYmxlIHRvIHRlc3QgZmlsZXMgYWdhaW5zdC4gKi9cbmV4cG9ydCBjbGFzcyBQdWxsQXBwcm92ZUdyb3VwIHtcbiAgLy8gTGluZXMgd2hpY2ggd2VyZSBub3QgYWJsZSB0byBiZSBwYXJzZWQgYXMgZXhwZWN0ZWQuXG4gIHByaXZhdGUgbWlzY29uZmlndXJlZExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBDb25kaXRpb25zIGZvciB0aGUgZ3JvdXAgZm9yIGluY2x1ZGluZyBmaWxlcy5cbiAgcHJpdmF0ZSBpbmNsdWRlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvLyBDb25kaXRpb25zIGZvciB0aGUgZ3JvdXAgZm9yIGV4Y2x1ZGluZyBmaWxlcy5cbiAgcHJpdmF0ZSBleGNsdWRlQ29uZGl0aW9uczogR3JvdXBDb25kaXRpb25bXSA9IFtdO1xuICAvLyBXaGV0aGVyIHRoZSBncm91cCBoYXMgZmlsZSBtYXRjaGVycy5cbiAgcHVibGljIGhhc01hdGNoZXJzID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IocHVibGljIGdyb3VwTmFtZTogc3RyaW5nLCBncm91cDogUHVsbEFwcHJvdmVHcm91cENvbmZpZykge1xuICAgIGlmIChncm91cC5jb25kaXRpb25zKSB7XG4gICAgICBmb3IgKGxldCBjb25kaXRpb24gb2YgZ3JvdXAuY29uZGl0aW9ucykge1xuICAgICAgICBjb25kaXRpb24gPSBjb25kaXRpb24udHJpbSgpO1xuXG4gICAgICAgIGlmIChjb25kaXRpb24ubWF0Y2goQ09ORElUSU9OX1RZUEVTLklOQ0xVREVfR0xPQlMpKSB7XG4gICAgICAgICAgY29uc3QgW2NvbmRpdGlvbnMsIG1pc2NvbmZpZ3VyZWRMaW5lc10gPSBnZXRMaW5lc0ZvckNvbnRhaW5zQW55R2xvYnMoY29uZGl0aW9uKTtcbiAgICAgICAgICBjb25kaXRpb25zLmZvckVhY2goZ2xvYlN0cmluZyA9PiB0aGlzLmluY2x1ZGVDb25kaXRpb25zLnB1c2goe1xuICAgICAgICAgICAgZ2xvYjogZ2xvYlN0cmluZyxcbiAgICAgICAgICAgIG1hdGNoZXI6IG5ldyBNaW5pbWF0Y2goZ2xvYlN0cmluZywge2RvdDogdHJ1ZX0pLFxuICAgICAgICAgICAgbWF0Y2hlZEZpbGVzOiBuZXcgU2V0PHN0cmluZz4oKSxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgdGhpcy5taXNjb25maWd1cmVkTGluZXMucHVzaCguLi5taXNjb25maWd1cmVkTGluZXMpO1xuICAgICAgICAgIHRoaXMuaGFzTWF0Y2hlcnMgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbmRpdGlvbi5tYXRjaChDT05ESVRJT05fVFlQRVMuRVhDTFVERV9HTE9CUykpIHtcbiAgICAgICAgICBjb25zdCBbY29uZGl0aW9ucywgbWlzY29uZmlndXJlZExpbmVzXSA9IGdldExpbmVzRm9yQ29udGFpbnNBbnlHbG9icyhjb25kaXRpb24pO1xuICAgICAgICAgIGNvbmRpdGlvbnMuZm9yRWFjaChnbG9iU3RyaW5nID0+IHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBnbG9iOiBnbG9iU3RyaW5nLFxuICAgICAgICAgICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChnbG9iU3RyaW5nLCB7ZG90OiB0cnVlfSksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICB0aGlzLm1pc2NvbmZpZ3VyZWRMaW5lcy5wdXNoKC4uLm1pc2NvbmZpZ3VyZWRMaW5lcyk7XG4gICAgICAgICAgdGhpcy5oYXNNYXRjaGVycyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uLm1hdGNoKENPTkRJVElPTl9UWVBFUy5BVFRSX0xFTkdUSCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvIG5vdCB0YWtlIGFueSBhY3Rpb24gb24gdGhpcyBjb25kaXRpb24gdHlwZS5cbiAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24ubWF0Y2goQ09ORElUSU9OX1RZUEVTLkdMT0JBTF9BUFBST1ZBTCkpIHtcbiAgICAgICAgICAvLyBDdXJyZW50bHkgYSBub29wIGFzIHdlIGRvbid0IHRha2UgYW55IGFjdGlvbiBmb3IgZ2xvYmFsIGFwcHJvdmFsIGNvbmRpdGlvbnMuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3QgZXJyTWVzc2FnZSA9XG4gICAgICAgICAgICAgIGBVbnJlY29nbml6ZWQgY29uZGl0aW9uIGZvdW5kLCB1bmFibGUgdG8gcGFyc2UgdGhlIGZvbGxvd2luZyBjb25kaXRpb246IFxcblxcbmAgK1xuICAgICAgICAgICAgICBgRnJvbSB0aGUgWyR7Z3JvdXBOYW1lfV0gZ3JvdXA6XFxuYCArXG4gICAgICAgICAgICAgIGAgLSAke2NvbmRpdGlvbn1gICtcbiAgICAgICAgICAgICAgYFxcblxcbmAgK1xuICAgICAgICAgICAgICBgS25vd24gY29uZGl0aW9uIHJlZ2V4czpcXG5gICtcbiAgICAgICAgICAgICAgYCR7T2JqZWN0LmVudHJpZXMoQ09ORElUSU9OX1RZUEVTKS5tYXAoKFtrLCB2XSkgPT4gYCAke2t9IC0gJHt2fWApLmpvaW4oJ1xcbicpfWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuYDtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1lc3NhZ2UpO1xuICAgICAgICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXRyaWV2ZSBhbGwgb2YgdGhlIGxpbmVzIHdoaWNoIHdlcmUgbm90IGFibGUgdG8gYmUgcGFyc2VkLiAqL1xuICBnZXRCYWRMaW5lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMubWlzY29uZmlndXJlZExpbmVzO1xuICB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkSW5jbHVkZXMgPSB0aGlzLmluY2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICEhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgbWF0Y2hlZEV4Y2x1ZGVzID0gdGhpcy5leGNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZEluY2x1ZGVzID0gdGhpcy5pbmNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgdW5tYXRjaGVkRXhjbHVkZXMgPSB0aGlzLmV4Y2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICFjLm1hdGNoZWRGaWxlcy5zaXplKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb3VudCA9IHVubWF0Y2hlZEluY2x1ZGVzLmxlbmd0aCArIHVubWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICBjb25zdCBtYXRjaGVkQ291bnQgPSBtYXRjaGVkSW5jbHVkZXMubGVuZ3RoICsgbWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZEluY2x1ZGVzLFxuICAgICAgbWF0Y2hlZEV4Y2x1ZGVzLFxuICAgICAgbWF0Y2hlZENvdW50LFxuICAgICAgdW5tYXRjaGVkSW5jbHVkZXMsXG4gICAgICB1bm1hdGNoZWRFeGNsdWRlcyxcbiAgICAgIHVubWF0Y2hlZENvdW50LFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICBsZXQgbWF0Y2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5jbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoaW5jbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgIGlmIChpbmNsdWRlQ29uZGl0aW9uLm1hdGNoZXIubWF0Y2goZmlsZSkpIHtcbiAgICAgICAgbGV0IG1hdGNoZWRFeGNsdWRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoZXhjbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVyLm1hdGNoKGZpbGUpKSB7XG4gICAgICAgICAgICAvLyBBZGQgZmlsZSBhcyBhIGRpc2NvdmVyZWQgZXhjbHVkZSBhcyBpdCBpcyBuZWdhdGluZyBhIG1hdGNoZWRcbiAgICAgICAgICAgIC8vIGluY2x1ZGUgY29uZGl0aW9uLlxuICAgICAgICAgICAgZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVkRmlsZXMuYWRkKGZpbGUpO1xuICAgICAgICAgICAgbWF0Y2hlZEV4Y2x1ZGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFuIGluY2x1ZGUgY29uZGl0aW9uIGlzIG9ubHkgY29uc2lkZXJlZCBtYXRjaGVkIGlmIG5vIGV4Y2x1ZGVcbiAgICAgICAgLy8gY29uZGl0aW9ucyBhcmUgZm91bmQgdG8gbWF0Y2hlZCB0aGUgZmlsZS5cbiAgICAgICAgaWYgKCFtYXRjaGVkRXhjbHVkZSkge1xuICAgICAgICAgIGluY2x1ZGVDb25kaXRpb24ubWF0Y2hlZEZpbGVzLmFkZChmaWxlKTtcbiAgICAgICAgICBtYXRjaGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBhbGwgb2YgdGhlIGluZGl2aWR1YWwgZ2xvYnMgZnJvbSBhIGdyb3VwIGNvbmRpdGlvbixcbiAqIHByb3ZpZGluZyBib3RoIHRoZSB2YWxpZCBhbmQgaW52YWxpZCBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gZ2V0TGluZXNGb3JDb250YWluc0FueUdsb2JzKGxpbmVzOiBzdHJpbmcpIHtcbiAgY29uc3QgaW52YWxpZExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB2YWxpZExpbmVzID0gbGluZXMuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDEsIC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGdsb2I6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJpbW1lZEdsb2IgPSBnbG9iLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gdHJpbW1lZEdsb2IubWF0Y2goQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZExpbmVzLnB1c2godHJpbW1lZEdsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGdsb2JTdHJpbmcgPT4gISFnbG9iU3RyaW5nKTtcbiAgcmV0dXJuIFt2YWxpZExpbmVzLCBpbnZhbGlkTGluZXNdO1xufVxuIl19