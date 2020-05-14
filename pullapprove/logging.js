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
        define("@angular/dev-infra-private/pullapprove/logging", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logHeader = exports.logGroup = void 0;
    /** Create logs for each pullapprove group result. */
    function logGroup(group, matched) {
        if (matched === void 0) { matched = true; }
        var conditions = matched ? group.matchedConditions : group.unmatchedConditions;
        console.groupCollapsed("[" + group.groupName + "]");
        if (conditions.length) {
            conditions.forEach(function (matcher) {
                var count = matcher.matchedFiles.size;
                console.info(count + " " + (count === 1 ? 'match' : 'matches') + " - " + matcher.expression);
            });
            console.groupEnd();
        }
    }
    exports.logGroup = logGroup;
    /** Logs a header within a text drawn box. */
    function logHeader() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var totalWidth = 80;
        var fillWidth = totalWidth - 2;
        var headerText = params.join(' ').substr(0, fillWidth);
        var leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
        var rightSpace = fillWidth - leftSpace - headerText.length;
        var fill = function (count, content) { return content.repeat(count); };
        console.info("\u250C" + fill(fillWidth, '─') + "\u2510");
        console.info("\u2502" + fill(leftSpace, ' ') + headerText + fill(rightSpace, ' ') + "\u2502");
        console.info("\u2514" + fill(fillWidth, '─') + "\u2518");
    }
    exports.logHeader = logHeader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUlILHFEQUFxRDtJQUNyRCxTQUFnQixRQUFRLENBQUMsS0FBNkIsRUFBRSxPQUFjO1FBQWQsd0JBQUEsRUFBQSxjQUFjO1FBQ3BFLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7UUFDakYsT0FBTyxDQUFDLGNBQWMsQ0FBQyxNQUFJLEtBQUssQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDO1FBQy9DLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyQixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztnQkFDeEIsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLE9BQU8sQ0FBQyxJQUFJLENBQUksS0FBSyxVQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxZQUFNLE9BQU8sQ0FBQyxVQUFZLENBQUMsQ0FBQTtZQUN2RixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQjtJQUNILENBQUM7SUFWRCw0QkFVQztJQUVELDZDQUE2QztJQUM3QyxTQUFnQixTQUFTO1FBQUMsZ0JBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQiwyQkFBbUI7O1FBQzNDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDN0QsSUFBTSxJQUFJLEdBQUcsVUFBQyxLQUFhLEVBQUUsT0FBZSxJQUFLLE9BQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztRQUV2RSxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO1FBQy9FLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBWEQsOEJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFJlc3VsdH0gZnJvbSAnLi9ncm91cCc7XG5cbi8qKiBDcmVhdGUgbG9ncyBmb3IgZWFjaCBwdWxsYXBwcm92ZSBncm91cCByZXN1bHQuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nR3JvdXAoZ3JvdXA6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQsIG1hdGNoZWQgPSB0cnVlKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBtYXRjaGVkID8gZ3JvdXAubWF0Y2hlZENvbmRpdGlvbnMgOiBncm91cC51bm1hdGNoZWRDb25kaXRpb25zO1xuICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKGBbJHtncm91cC5ncm91cE5hbWV9XWApO1xuICBpZiAoY29uZGl0aW9ucy5sZW5ndGgpIHtcbiAgICBjb25kaXRpb25zLmZvckVhY2gobWF0Y2hlciA9PiB7XG4gICAgICBjb25zdCBjb3VudCA9IG1hdGNoZXIubWF0Y2hlZEZpbGVzLnNpemU7XG4gICAgICBjb25zb2xlLmluZm8oYCR7Y291bnR9ICR7Y291bnQgPT09IDEgPyAnbWF0Y2gnIDogJ21hdGNoZXMnfSAtICR7bWF0Y2hlci5leHByZXNzaW9ufWApXG4gICAgfSk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICB9XG59XG5cbi8qKiBMb2dzIGEgaGVhZGVyIHdpdGhpbiBhIHRleHQgZHJhd24gYm94LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0hlYWRlciguLi5wYXJhbXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSA4MDtcbiAgY29uc3QgZmlsbFdpZHRoID0gdG90YWxXaWR0aCAtIDI7XG4gIGNvbnN0IGhlYWRlclRleHQgPSBwYXJhbXMuam9pbignICcpLnN1YnN0cigwLCBmaWxsV2lkdGgpO1xuICBjb25zdCBsZWZ0U3BhY2UgPSBNYXRoLmNlaWwoKGZpbGxXaWR0aCAtIGhlYWRlclRleHQubGVuZ3RoKSAvIDIpO1xuICBjb25zdCByaWdodFNwYWNlID0gZmlsbFdpZHRoIC0gbGVmdFNwYWNlIC0gaGVhZGVyVGV4dC5sZW5ndGg7XG4gIGNvbnN0IGZpbGwgPSAoY291bnQ6IG51bWJlciwgY29udGVudDogc3RyaW5nKSA9PiBjb250ZW50LnJlcGVhdChjb3VudCk7XG5cbiAgY29uc29sZS5pbmZvKGDilIwke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSQYCk7XG4gIGNvbnNvbGUuaW5mbyhg4pSCJHtmaWxsKGxlZnRTcGFjZSwgJyAnKX0ke2hlYWRlclRleHR9JHtmaWxsKHJpZ2h0U3BhY2UsICcgJyl94pSCYCk7XG4gIGNvbnNvbGUuaW5mbyhg4pSUJHtmaWxsKGZpbGxXaWR0aCwgJ+KUgCcpfeKUmGApO1xufVxuIl19