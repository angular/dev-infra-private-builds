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
        define("@angular/dev-infra-private/pullapprove/logging", ["require", "exports", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logHeader = exports.logGroup = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Create logs for each pullapprove group result. */
    function logGroup(group, matched) {
        if (matched === void 0) { matched = true; }
        var conditions = matched ? group.matchedConditions : group.unmatchedConditions;
        console_1.info.group("[" + group.groupName + "]");
        if (conditions.length) {
            conditions.forEach(function (matcher) {
                var count = matcher.matchedFiles.size;
                console_1.info(count + " " + (count === 1 ? 'match' : 'matches') + " - " + matcher.expression);
            });
            console_1.info.groupEnd();
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
        console_1.info("\u250C" + fill(fillWidth, '─') + "\u2510");
        console_1.info("\u2502" + fill(leftSpace, ' ') + headerText + fill(rightSpace, ' ') + "\u2502");
        console_1.info("\u2514" + fill(fillWidth, '─') + "\u2518");
    }
    exports.logHeader = logHeader;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUFzQztJQUd0QyxxREFBcUQ7SUFDckQsU0FBZ0IsUUFBUSxDQUFDLEtBQTZCLEVBQUUsT0FBYztRQUFkLHdCQUFBLEVBQUEsY0FBYztRQUNwRSxJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDO1FBQ2pGLGNBQUksQ0FBQyxLQUFLLENBQUMsTUFBSSxLQUFLLENBQUMsU0FBUyxNQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDckIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87Z0JBQ3hCLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDO2dCQUN4QyxjQUFJLENBQUksS0FBSyxVQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxZQUFNLE9BQU8sQ0FBQyxVQUFZLENBQUMsQ0FBQztZQUNoRixDQUFDLENBQUMsQ0FBQztZQUNILGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNqQjtJQUNILENBQUM7SUFWRCw0QkFVQztJQUVELDZDQUE2QztJQUM3QyxTQUFnQixTQUFTO1FBQUMsZ0JBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQiwyQkFBbUI7O1FBQzNDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDN0QsSUFBTSxJQUFJLEdBQUcsVUFBQyxLQUFhLEVBQUUsT0FBZSxJQUFLLE9BQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztRQUV2RSxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUNsQyxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUN2RSxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBWEQsOEJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBSZXN1bHR9IGZyb20gJy4vZ3JvdXAnO1xuXG4vKiogQ3JlYXRlIGxvZ3MgZm9yIGVhY2ggcHVsbGFwcHJvdmUgZ3JvdXAgcmVzdWx0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0dyb3VwKGdyb3VwOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0LCBtYXRjaGVkID0gdHJ1ZSkge1xuICBjb25zdCBjb25kaXRpb25zID0gbWF0Y2hlZCA/IGdyb3VwLm1hdGNoZWRDb25kaXRpb25zIDogZ3JvdXAudW5tYXRjaGVkQ29uZGl0aW9ucztcbiAgaW5mby5ncm91cChgWyR7Z3JvdXAuZ3JvdXBOYW1lfV1gKTtcbiAgaWYgKGNvbmRpdGlvbnMubGVuZ3RoKSB7XG4gICAgY29uZGl0aW9ucy5mb3JFYWNoKG1hdGNoZXIgPT4ge1xuICAgICAgY29uc3QgY291bnQgPSBtYXRjaGVyLm1hdGNoZWRGaWxlcy5zaXplO1xuICAgICAgaW5mbyhgJHtjb3VudH0gJHtjb3VudCA9PT0gMSA/ICdtYXRjaCcgOiAnbWF0Y2hlcyd9IC0gJHttYXRjaGVyLmV4cHJlc3Npb259YCk7XG4gICAgfSk7XG4gICAgaW5mby5ncm91cEVuZCgpO1xuICB9XG59XG5cbi8qKiBMb2dzIGEgaGVhZGVyIHdpdGhpbiBhIHRleHQgZHJhd24gYm94LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0hlYWRlciguLi5wYXJhbXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSA4MDtcbiAgY29uc3QgZmlsbFdpZHRoID0gdG90YWxXaWR0aCAtIDI7XG4gIGNvbnN0IGhlYWRlclRleHQgPSBwYXJhbXMuam9pbignICcpLnN1YnN0cigwLCBmaWxsV2lkdGgpO1xuICBjb25zdCBsZWZ0U3BhY2UgPSBNYXRoLmNlaWwoKGZpbGxXaWR0aCAtIGhlYWRlclRleHQubGVuZ3RoKSAvIDIpO1xuICBjb25zdCByaWdodFNwYWNlID0gZmlsbFdpZHRoIC0gbGVmdFNwYWNlIC0gaGVhZGVyVGV4dC5sZW5ndGg7XG4gIGNvbnN0IGZpbGwgPSAoY291bnQ6IG51bWJlciwgY29udGVudDogc3RyaW5nKSA9PiBjb250ZW50LnJlcGVhdChjb3VudCk7XG5cbiAgaW5mbyhg4pSMJHtmaWxsKGZpbGxXaWR0aCwgJ+KUgCcpfeKUkGApO1xuICBpbmZvKGDilIIke2ZpbGwobGVmdFNwYWNlLCAnICcpfSR7aGVhZGVyVGV4dH0ke2ZpbGwocmlnaHRTcGFjZSwgJyAnKX3ilIJgKTtcbiAgaW5mbyhg4pSUJHtmaWxsKGZpbGxXaWR0aCwgJ+KUgCcpfeKUmGApO1xufVxuIl19