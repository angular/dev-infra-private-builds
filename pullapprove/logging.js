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
    /** Create logs for each pullapprove group result. */
    function logGroup(group, matched) {
        if (matched === void 0) { matched = true; }
        var includeConditions = matched ? group.matchedIncludes : group.unmatchedIncludes;
        var excludeConditions = matched ? group.matchedExcludes : group.unmatchedExcludes;
        console.groupCollapsed("[" + group.groupName + "]");
        if (includeConditions.length) {
            console.group('includes');
            includeConditions.forEach(function (matcher) { return console.info(matcher.glob + " - " + matcher.matchedFiles.size); });
            console.groupEnd();
        }
        if (excludeConditions.length) {
            console.group('excludes');
            excludeConditions.forEach(function (matcher) { return console.info(matcher.glob + " - " + matcher.matchedFiles.size); });
            console.groupEnd();
        }
        console.groupEnd();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0lBU0EscURBQXFEO0lBQ3JELFNBQWdCLFFBQVEsQ0FBQyxLQUE2QixFQUFFLE9BQWM7UUFBZCx3QkFBQSxFQUFBLGNBQWM7UUFDcEUsSUFBTSxpQkFBaUIsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQztRQUNwRixJQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDO1FBQ3BGLE9BQU8sQ0FBQyxjQUFjLENBQUMsTUFBSSxLQUFLLENBQUMsU0FBUyxNQUFHLENBQUMsQ0FBQztRQUMvQyxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUM1QixPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFCLGlCQUFpQixDQUFDLE9BQU8sQ0FDckIsVUFBQSxPQUFPLElBQUksT0FBQSxPQUFPLENBQUMsSUFBSSxDQUFJLE9BQU8sQ0FBQyxJQUFJLFdBQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFNLENBQUMsRUFBOUQsQ0FBOEQsQ0FBQyxDQUFDO1lBQy9FLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNwQjtRQUNELElBQUksaUJBQWlCLENBQUMsTUFBTSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDMUIsaUJBQWlCLENBQUMsT0FBTyxDQUNyQixVQUFBLE9BQU8sSUFBSSxPQUFBLE9BQU8sQ0FBQyxJQUFJLENBQUksT0FBTyxDQUFDLElBQUksV0FBTSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQU0sQ0FBQyxFQUE5RCxDQUE4RCxDQUFDLENBQUM7WUFDL0UsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BCO1FBQ0QsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFqQkQsNEJBaUJDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWdCLFNBQVM7UUFBQyxnQkFBbUI7YUFBbkIsVUFBbUIsRUFBbkIscUJBQW1CLEVBQW5CLElBQW1CO1lBQW5CLDJCQUFtQjs7UUFDM0MsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQU0sU0FBUyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUM3RCxJQUFNLElBQUksR0FBRyxVQUFDLEtBQWEsRUFBRSxPQUFlLElBQUssT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDO1FBRXZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDL0UsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFYRCw4QkFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFJlc3VsdH0gZnJvbSAnLi9ncm91cCc7XG5cbi8qKiBDcmVhdGUgbG9ncyBmb3IgZWFjaCBwdWxsYXBwcm92ZSBncm91cCByZXN1bHQuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nR3JvdXAoZ3JvdXA6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQsIG1hdGNoZWQgPSB0cnVlKSB7XG4gIGNvbnN0IGluY2x1ZGVDb25kaXRpb25zID0gbWF0Y2hlZCA/IGdyb3VwLm1hdGNoZWRJbmNsdWRlcyA6IGdyb3VwLnVubWF0Y2hlZEluY2x1ZGVzO1xuICBjb25zdCBleGNsdWRlQ29uZGl0aW9ucyA9IG1hdGNoZWQgPyBncm91cC5tYXRjaGVkRXhjbHVkZXMgOiBncm91cC51bm1hdGNoZWRFeGNsdWRlcztcbiAgY29uc29sZS5ncm91cENvbGxhcHNlZChgWyR7Z3JvdXAuZ3JvdXBOYW1lfV1gKTtcbiAgaWYgKGluY2x1ZGVDb25kaXRpb25zLmxlbmd0aCkge1xuICAgIGNvbnNvbGUuZ3JvdXAoJ2luY2x1ZGVzJyk7XG4gICAgaW5jbHVkZUNvbmRpdGlvbnMuZm9yRWFjaChcbiAgICAgICAgbWF0Y2hlciA9PiBjb25zb2xlLmluZm8oYCR7bWF0Y2hlci5nbG9ifSAtICR7bWF0Y2hlci5tYXRjaGVkRmlsZXMuc2l6ZX1gKSk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICB9XG4gIGlmIChleGNsdWRlQ29uZGl0aW9ucy5sZW5ndGgpIHtcbiAgICBjb25zb2xlLmdyb3VwKCdleGNsdWRlcycpO1xuICAgIGV4Y2x1ZGVDb25kaXRpb25zLmZvckVhY2goXG4gICAgICAgIG1hdGNoZXIgPT4gY29uc29sZS5pbmZvKGAke21hdGNoZXIuZ2xvYn0gLSAke21hdGNoZXIubWF0Y2hlZEZpbGVzLnNpemV9YCkpO1xuICAgIGNvbnNvbGUuZ3JvdXBFbmQoKTtcbiAgfVxuICBjb25zb2xlLmdyb3VwRW5kKCk7XG59XG5cbi8qKiBMb2dzIGEgaGVhZGVyIHdpdGhpbiBhIHRleHQgZHJhd24gYm94LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0hlYWRlciguLi5wYXJhbXM6IHN0cmluZ1tdKSB7XG4gIGNvbnN0IHRvdGFsV2lkdGggPSA4MDtcbiAgY29uc3QgZmlsbFdpZHRoID0gdG90YWxXaWR0aCAtIDI7XG4gIGNvbnN0IGhlYWRlclRleHQgPSBwYXJhbXMuam9pbignICcpLnN1YnN0cigwLCBmaWxsV2lkdGgpO1xuICBjb25zdCBsZWZ0U3BhY2UgPSBNYXRoLmNlaWwoKGZpbGxXaWR0aCAtIGhlYWRlclRleHQubGVuZ3RoKSAvIDIpO1xuICBjb25zdCByaWdodFNwYWNlID0gZmlsbFdpZHRoIC0gbGVmdFNwYWNlIC0gaGVhZGVyVGV4dC5sZW5ndGg7XG4gIGNvbnN0IGZpbGwgPSAoY291bnQ6IG51bWJlciwgY29udGVudDogc3RyaW5nKSA9PiBjb250ZW50LnJlcGVhdChjb3VudCk7XG5cbiAgY29uc29sZS5pbmZvKGDilIwke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSQYCk7XG4gIGNvbnNvbGUuaW5mbyhg4pSCJHtmaWxsKGxlZnRTcGFjZSwgJyAnKX0ke2hlYWRlclRleHR9JHtmaWxsKHJpZ2h0U3BhY2UsICcgJyl94pSCYCk7XG4gIGNvbnNvbGUuaW5mbyhg4pSUJHtmaWxsKGZpbGxXaWR0aCwgJ+KUgCcpfeKUmGApO1xufSJdfQ==