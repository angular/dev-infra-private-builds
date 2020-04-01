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
        GLOBAL_APPROVAL: /^global-(docs-)?approvers not in groups.approved$/,
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
                                    return " " + k + " - $ {\n            v\n          }\n          ";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9kZXYtaW5mcmEvcHVsbGFwcHJvdmUvZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQUE7Ozs7OztPQU1HO0lBQ0gsdUNBQXVEO0lBc0J2RCxrREFBa0Q7SUFDbEQsSUFBTSx3QkFBd0IsR0FBRyxlQUFlLENBQUM7SUFFakQsSUFBTSxlQUFlLEdBQUc7UUFDdEIsYUFBYSxFQUFFLHFCQUFxQjtRQUNwQyxhQUFhLEVBQUUseUJBQXlCO1FBQ3hDLFdBQVcsRUFBRSxZQUFZO1FBQ3pCLGVBQWUsRUFBRSxtREFBbUQ7S0FDckUsQ0FBQztJQUVGLDREQUE0RDtJQUM1RDtRQVVFLDBCQUFtQixTQUFpQixFQUFFLEtBQTZCOztZQUFuRSxpQkE0Q0M7WUE1Q2tCLGNBQVMsR0FBVCxTQUFTLENBQVE7WUFUcEMsc0RBQXNEO1lBQzlDLHVCQUFrQixHQUFhLEVBQUUsQ0FBQztZQUMxQyxnREFBZ0Q7WUFDeEMsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQztZQUNqRCxnREFBZ0Q7WUFDeEMsc0JBQWlCLEdBQXFCLEVBQUUsQ0FBQztZQUNqRCx1Q0FBdUM7WUFDaEMsZ0JBQVcsR0FBRyxLQUFLLENBQUM7WUFHekIsSUFBSSxLQUFLLENBQUMsVUFBVSxFQUFFOztvQkFDcEIsS0FBc0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxVQUFVLENBQUEsZ0JBQUEsNEJBQUU7d0JBQW5DLElBQUksU0FBUyxXQUFBO3dCQUNoQixTQUFTLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO3dCQUU3QixJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxFQUFFOzRCQUM1QyxJQUFBLDhEQUF5RSxFQUF4RSxrQkFBVSxFQUFFLDBCQUE0RCxDQUFDOzRCQUNoRixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsVUFBVSxJQUFJLE9BQUEs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QyxDQUFDLENBQUM7b0JBQ0gsZ0VBQWdFO29CQUNoRSw0Q0FBNEM7b0JBQzVDLElBQUksQ0FBQyxnQkFBYyxFQUFFO3dCQUNuQixnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUN4QyxPQUFPLEdBQUcsSUFBSSxDQUFDO3FCQUNoQjtpQkFDRjtZQUNILENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUM7UUFDakIsQ0FBQztRQUNILHVCQUFDO0lBQUQsQ0FBQyxBQXpHRCxJQXlHQztJQXpHWSw0Q0FBZ0I7SUEyRzdCOzs7T0FHRztJQUNILFNBQVMsMkJBQTJCLENBQUMsS0FBYTtRQUNoRCxJQUFNLFlBQVksR0FBYSxFQUFFLENBQUM7UUFDbEMsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDWixLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ1osR0FBRyxDQUFDLFVBQUMsSUFBWTtZQUNoQixJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEMsSUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO1lBQzFELElBQUksQ0FBQyxLQUFLLEVBQUU7Z0JBQ1YsWUFBWSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDL0IsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xCLENBQUMsQ0FBQzthQUNELE1BQU0sQ0FBQyxVQUFBLFVBQVUsSUFBSSxPQUFBLENBQUMsQ0FBQyxVQUFVLEVBQVosQ0FBWSxDQUFDLENBQUM7UUFDM0QsT0FBTyxDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNwQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJTWluaW1hdGNoLCBNaW5pbWF0Y2gsIG1hdGNofSBmcm9tICdtaW5pbWF0Y2gnO1xuXG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBDb25maWd9IGZyb20gJy4vcGFyc2UteWFtbCc7XG5cbi8qKiBBIGNvbmRpdGlvbiBmb3IgYSBncm91cC4gKi9cbmludGVyZmFjZSBHcm91cENvbmRpdGlvbiB7XG4gIGdsb2I6IHN0cmluZztcbiAgbWF0Y2hlcjogSU1pbmltYXRjaDtcbiAgbWF0Y2hlZEZpbGVzOiBTZXQ8c3RyaW5nPjtcbn1cblxuLyoqIFJlc3VsdCBvZiB0ZXN0aW5nIGZpbGVzIGFnYWluc3QgdGhlIGdyb3VwLiAqL1xuZXhwb3J0IGludGVyZmFjZSBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgZ3JvdXBOYW1lOiBzdHJpbmc7XG4gIG1hdGNoZWRJbmNsdWRlczogR3JvdXBDb25kaXRpb25bXTtcbiAgbWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICBtYXRjaGVkQ291bnQ6IG51bWJlcjtcbiAgdW5tYXRjaGVkSW5jbHVkZXM6IEdyb3VwQ29uZGl0aW9uW107XG4gIHVubWF0Y2hlZEV4Y2x1ZGVzOiBHcm91cENvbmRpdGlvbltdO1xuICB1bm1hdGNoZWRDb3VudDogbnVtYmVyO1xufVxuXG4vLyBSZWdleCBNYXRjaGVyIGZvciBjb250YWluc19hbnlfZ2xvYnMgY29uZGl0aW9uc1xuY29uc3QgQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYID0gL14nKFteJ10rKScsPyQvO1xuXG5jb25zdCBDT05ESVRJT05fVFlQRVMgPSB7XG4gIElOQ0xVREVfR0xPQlM6IC9eY29udGFpbnNfYW55X2dsb2JzLyxcbiAgRVhDTFVERV9HTE9CUzogL15ub3QgY29udGFpbnNfYW55X2dsb2JzLyxcbiAgQVRUUl9MRU5HVEg6IC9ebGVuXFwoLipcXCkvLFxuICBHTE9CQUxfQVBQUk9WQUw6IC9eZ2xvYmFsLShkb2NzLSk/YXBwcm92ZXJzIG5vdCBpbiBncm91cHMuYXBwcm92ZWQkLyxcbn07XG5cbi8qKiBBIFB1bGxBcHByb3ZlIGdyb3VwIHRvIGJlIGFibGUgdG8gdGVzdCBmaWxlcyBhZ2FpbnN0LiAqL1xuZXhwb3J0IGNsYXNzIFB1bGxBcHByb3ZlR3JvdXAge1xuICAvLyBMaW5lcyB3aGljaCB3ZXJlIG5vdCBhYmxlIHRvIGJlIHBhcnNlZCBhcyBleHBlY3RlZC5cbiAgcHJpdmF0ZSBtaXNjb25maWd1cmVkTGluZXM6IHN0cmluZ1tdID0gW107XG4gIC8vIENvbmRpdGlvbnMgZm9yIHRoZSBncm91cCBmb3IgaW5jbHVkaW5nIGZpbGVzLlxuICBwcml2YXRlIGluY2x1ZGVDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG4gIC8vIENvbmRpdGlvbnMgZm9yIHRoZSBncm91cCBmb3IgZXhjbHVkaW5nIGZpbGVzLlxuICBwcml2YXRlIGV4Y2x1ZGVDb25kaXRpb25zOiBHcm91cENvbmRpdGlvbltdID0gW107XG4gIC8vIFdoZXRoZXIgdGhlIGdyb3VwIGhhcyBmaWxlIG1hdGNoZXJzLlxuICBwdWJsaWMgaGFzTWF0Y2hlcnMgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgZ3JvdXBOYW1lOiBzdHJpbmcsIGdyb3VwOiBQdWxsQXBwcm92ZUdyb3VwQ29uZmlnKSB7XG4gICAgaWYgKGdyb3VwLmNvbmRpdGlvbnMpIHtcbiAgICAgIGZvciAobGV0IGNvbmRpdGlvbiBvZiBncm91cC5jb25kaXRpb25zKSB7XG4gICAgICAgIGNvbmRpdGlvbiA9IGNvbmRpdGlvbi50cmltKCk7XG5cbiAgICAgICAgaWYgKGNvbmRpdGlvbi5tYXRjaChDT05ESVRJT05fVFlQRVMuSU5DTFVERV9HTE9CUykpIHtcbiAgICAgICAgICBjb25zdCBbY29uZGl0aW9ucywgbWlzY29uZmlndXJlZExpbmVzXSA9IGdldExpbmVzRm9yQ29udGFpbnNBbnlHbG9icyhjb25kaXRpb24pO1xuICAgICAgICAgIGNvbmRpdGlvbnMuZm9yRWFjaChnbG9iU3RyaW5nID0+IHRoaXMuaW5jbHVkZUNvbmRpdGlvbnMucHVzaCh7XG4gICAgICAgICAgICBnbG9iOiBnbG9iU3RyaW5nLFxuICAgICAgICAgICAgbWF0Y2hlcjogbmV3IE1pbmltYXRjaChnbG9iU3RyaW5nLCB7ZG90OiB0cnVlfSksXG4gICAgICAgICAgICBtYXRjaGVkRmlsZXM6IG5ldyBTZXQ8c3RyaW5nPigpLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICB0aGlzLm1pc2NvbmZpZ3VyZWRMaW5lcy5wdXNoKC4uLm1pc2NvbmZpZ3VyZWRMaW5lcyk7XG4gICAgICAgICAgdGhpcy5oYXNNYXRjaGVycyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoY29uZGl0aW9uLm1hdGNoKENPTkRJVElPTl9UWVBFUy5FWENMVURFX0dMT0JTKSkge1xuICAgICAgICAgIGNvbnN0IFtjb25kaXRpb25zLCBtaXNjb25maWd1cmVkTGluZXNdID0gZ2V0TGluZXNGb3JDb250YWluc0FueUdsb2JzKGNvbmRpdGlvbik7XG4gICAgICAgICAgY29uZGl0aW9ucy5mb3JFYWNoKGdsb2JTdHJpbmcgPT4gdGhpcy5leGNsdWRlQ29uZGl0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgIGdsb2I6IGdsb2JTdHJpbmcsXG4gICAgICAgICAgICBtYXRjaGVyOiBuZXcgTWluaW1hdGNoKGdsb2JTdHJpbmcsIHtkb3Q6IHRydWV9KSxcbiAgICAgICAgICAgIG1hdGNoZWRGaWxlczogbmV3IFNldDxzdHJpbmc+KCksXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIHRoaXMubWlzY29uZmlndXJlZExpbmVzLnB1c2goLi4ubWlzY29uZmlndXJlZExpbmVzKTtcbiAgICAgICAgICB0aGlzLmhhc01hdGNoZXJzID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmIChjb25kaXRpb24ubWF0Y2goQ09ORElUSU9OX1RZUEVTLkFUVFJfTEVOR1RIKSkge1xuICAgICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG8gbm90IHRha2UgYW55IGFjdGlvbiBvbiB0aGlzIGNvbmRpdGlvbiB0eXBlLlxuICAgICAgICB9IGVsc2UgaWYgKGNvbmRpdGlvbi5tYXRjaChDT05ESVRJT05fVFlQRVMuR0xPQkFMX0FQUFJPVkFMKSkge1xuICAgICAgICAgIC8vIEN1cnJlbnRseSBhIG5vb3AgYXMgd2UgZG9uJ3QgdGFrZSBhbnkgYWN0aW9uIGZvciBnbG9iYWwgYXBwcm92YWwgY29uZGl0aW9ucy5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBlcnJNZXNzYWdlID1cbiAgICAgICAgICAgICAgYFVucmVjb2duaXplZCBjb25kaXRpb24gZm91bmQsIHVuYWJsZSB0byBwYXJzZSB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbjogXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBGcm9tIHRoZSBbJHtncm91cE5hbWV9XSBncm91cDpcXG5gICtcbiAgICAgICAgICAgICAgYCAtICR7Y29uZGl0aW9ufWAgK1xuICAgICAgICAgICAgICBgXFxuXFxuYCArXG4gICAgICAgICAgICAgIGBLbm93biBjb25kaXRpb24gcmVnZXhzOlxcbmAgK1xuICAgICAgICAgICAgICBgJHtPYmplY3QuZW50cmllcyhDT05ESVRJT05fVFlQRVMpLm1hcCgoW2ssIHZdKSA9PiBgICR7a30gLSAkIHtcbiAgICAgICAgICAgIHZcbiAgICAgICAgICB9XG4gICAgICAgICAgYCkuam9pbignXFxuJyl9YCArXG4gICAgICAgICAgICAgIGBcXG5cXG5gO1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTWVzc2FnZSk7XG4gICAgICAgICAgcHJvY2Vzcy5leGl0KDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJldHJpZXZlIGFsbCBvZiB0aGUgbGluZXMgd2hpY2ggd2VyZSBub3QgYWJsZSB0byBiZSBwYXJzZWQuICovXG4gIGdldEJhZExpbmVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMubWlzY29uZmlndXJlZExpbmVzOyB9XG5cbiAgLyoqIFJldHJpZXZlIHRoZSByZXN1bHRzIGZvciB0aGUgR3JvdXAsIGFsbCBtYXRjaGVkIGFuZCB1bm1hdGNoZWQgY29uZGl0aW9ucy4gKi9cbiAgZ2V0UmVzdWx0cygpOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0IHtcbiAgICBjb25zdCBtYXRjaGVkSW5jbHVkZXMgPSB0aGlzLmluY2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICEhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgbWF0Y2hlZEV4Y2x1ZGVzID0gdGhpcy5leGNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhIWMubWF0Y2hlZEZpbGVzLnNpemUpO1xuICAgIGNvbnN0IHVubWF0Y2hlZEluY2x1ZGVzID0gdGhpcy5pbmNsdWRlQ29uZGl0aW9ucy5maWx0ZXIoYyA9PiAhYy5tYXRjaGVkRmlsZXMuc2l6ZSk7XG4gICAgY29uc3QgdW5tYXRjaGVkRXhjbHVkZXMgPSB0aGlzLmV4Y2x1ZGVDb25kaXRpb25zLmZpbHRlcihjID0+ICFjLm1hdGNoZWRGaWxlcy5zaXplKTtcbiAgICBjb25zdCB1bm1hdGNoZWRDb3VudCA9IHVubWF0Y2hlZEluY2x1ZGVzLmxlbmd0aCArIHVubWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICBjb25zdCBtYXRjaGVkQ291bnQgPSBtYXRjaGVkSW5jbHVkZXMubGVuZ3RoICsgbWF0Y2hlZEV4Y2x1ZGVzLmxlbmd0aDtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlZEluY2x1ZGVzLFxuICAgICAgbWF0Y2hlZEV4Y2x1ZGVzLFxuICAgICAgbWF0Y2hlZENvdW50LFxuICAgICAgdW5tYXRjaGVkSW5jbHVkZXMsXG4gICAgICB1bm1hdGNoZWRFeGNsdWRlcyxcbiAgICAgIHVubWF0Y2hlZENvdW50LFxuICAgICAgZ3JvdXBOYW1lOiB0aGlzLmdyb3VwTmFtZSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFRlc3RzIGEgcHJvdmlkZWQgZmlsZSBwYXRoIHRvIGRldGVybWluZSBpZiBpdCB3b3VsZCBiZSBjb25zaWRlcmVkIG1hdGNoZWQgYnlcbiAgICogdGhlIHB1bGwgYXBwcm92ZSBncm91cCdzIGNvbmRpdGlvbnMuXG4gICAqL1xuICB0ZXN0RmlsZShmaWxlOiBzdHJpbmcpIHtcbiAgICBsZXQgbWF0Y2hlZCA9IGZhbHNlO1xuICAgIHRoaXMuaW5jbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoaW5jbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgIGlmIChpbmNsdWRlQ29uZGl0aW9uLm1hdGNoZXIubWF0Y2goZmlsZSkpIHtcbiAgICAgICAgbGV0IG1hdGNoZWRFeGNsdWRlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZXhjbHVkZUNvbmRpdGlvbnMuZm9yRWFjaCgoZXhjbHVkZUNvbmRpdGlvbjogR3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgICAgICBpZiAoZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVyLm1hdGNoKGZpbGUpKSB7XG4gICAgICAgICAgICAvLyBBZGQgZmlsZSBhcyBhIGRpc2NvdmVyZWQgZXhjbHVkZSBhcyBpdCBpcyBuZWdhdGluZyBhIG1hdGNoZWRcbiAgICAgICAgICAgIC8vIGluY2x1ZGUgY29uZGl0aW9uLlxuICAgICAgICAgICAgZXhjbHVkZUNvbmRpdGlvbi5tYXRjaGVkRmlsZXMuYWRkKGZpbGUpO1xuICAgICAgICAgICAgbWF0Y2hlZEV4Y2x1ZGUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIEFuIGluY2x1ZGUgY29uZGl0aW9uIGlzIG9ubHkgY29uc2lkZXJlZCBtYXRjaGVkIGlmIG5vIGV4Y2x1ZGVcbiAgICAgICAgLy8gY29uZGl0aW9ucyBhcmUgZm91bmQgdG8gbWF0Y2hlZCB0aGUgZmlsZS5cbiAgICAgICAgaWYgKCFtYXRjaGVkRXhjbHVkZSkge1xuICAgICAgICAgIGluY2x1ZGVDb25kaXRpb24ubWF0Y2hlZEZpbGVzLmFkZChmaWxlKTtcbiAgICAgICAgICBtYXRjaGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBtYXRjaGVkO1xuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCBhbGwgb2YgdGhlIGluZGl2aWR1YWwgZ2xvYnMgZnJvbSBhIGdyb3VwIGNvbmRpdGlvbixcbiAqIHByb3ZpZGluZyBib3RoIHRoZSB2YWxpZCBhbmQgaW52YWxpZCBsaW5lcy5cbiAqL1xuZnVuY3Rpb24gZ2V0TGluZXNGb3JDb250YWluc0FueUdsb2JzKGxpbmVzOiBzdHJpbmcpIHtcbiAgY29uc3QgaW52YWxpZExpbmVzOiBzdHJpbmdbXSA9IFtdO1xuICBjb25zdCB2YWxpZExpbmVzID0gbGluZXMuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKDEsIC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoKGdsb2I6IHN0cmluZykgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdHJpbW1lZEdsb2IgPSBnbG9iLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG1hdGNoID0gdHJpbW1lZEdsb2IubWF0Y2goQ09OVEFJTlNfQU5ZX0dMT0JTX1JFR0VYKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW52YWxpZExpbmVzLnB1c2godHJpbW1lZEdsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGdsb2JTdHJpbmcgPT4gISFnbG9iU3RyaW5nKTtcbiAgcmV0dXJuIFt2YWxpZExpbmVzLCBpbnZhbGlkTGluZXNdO1xufVxuIl19