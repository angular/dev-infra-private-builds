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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBRUgsb0VBQXNDO0lBR3RDLHFEQUFxRDtJQUNyRCxTQUFnQixRQUFRLENBQUMsS0FBNkIsRUFBRSxPQUFjO1FBQWQsd0JBQUEsRUFBQSxjQUFjO1FBQ3BFLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQUM7UUFDakYsY0FBSSxDQUFDLEtBQUssQ0FBQyxNQUFJLEtBQUssQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDO1FBQ25DLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyQixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztnQkFDeEIsSUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ3hDLGNBQUksQ0FBSSxLQUFLLFVBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLFlBQU0sT0FBTyxDQUFDLFVBQVksQ0FBQyxDQUFDO1lBQ2hGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsY0FBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQztJQVZELDRCQVVDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWdCLFNBQVM7UUFBQyxnQkFBbUI7YUFBbkIsVUFBbUIsRUFBbkIscUJBQW1CLEVBQW5CLElBQW1CO1lBQW5CLDJCQUFtQjs7UUFDM0MsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQU0sU0FBUyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUM3RCxJQUFNLElBQUksR0FBRyxVQUFDLEtBQWEsRUFBRSxPQUFlLElBQUssT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDO1FBRXZFLGNBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO1FBQ2xDLGNBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO1FBQ3ZFLGNBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFYRCw4QkFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFJlc3VsdH0gZnJvbSAnLi9ncm91cCc7XG5cbi8qKiBDcmVhdGUgbG9ncyBmb3IgZWFjaCBwdWxsYXBwcm92ZSBncm91cCByZXN1bHQuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nR3JvdXAoZ3JvdXA6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQsIG1hdGNoZWQgPSB0cnVlKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBtYXRjaGVkID8gZ3JvdXAubWF0Y2hlZENvbmRpdGlvbnMgOiBncm91cC51bm1hdGNoZWRDb25kaXRpb25zO1xuICBpbmZvLmdyb3VwKGBbJHtncm91cC5ncm91cE5hbWV9XWApO1xuICBpZiAoY29uZGl0aW9ucy5sZW5ndGgpIHtcbiAgICBjb25kaXRpb25zLmZvckVhY2gobWF0Y2hlciA9PiB7XG4gICAgICBjb25zdCBjb3VudCA9IG1hdGNoZXIubWF0Y2hlZEZpbGVzLnNpemU7XG4gICAgICBpbmZvKGAke2NvdW50fSAke2NvdW50ID09PSAxID8gJ21hdGNoJyA6ICdtYXRjaGVzJ30gLSAke21hdGNoZXIuZXhwcmVzc2lvbn1gKTtcbiAgICB9KTtcbiAgICBpbmZvLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuLyoqIExvZ3MgYSBoZWFkZXIgd2l0aGluIGEgdGV4dCBkcmF3biBib3guICovXG5leHBvcnQgZnVuY3Rpb24gbG9nSGVhZGVyKC4uLnBhcmFtczogc3RyaW5nW10pIHtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDgwO1xuICBjb25zdCBmaWxsV2lkdGggPSB0b3RhbFdpZHRoIC0gMjtcbiAgY29uc3QgaGVhZGVyVGV4dCA9IHBhcmFtcy5qb2luKCcgJykuc3Vic3RyKDAsIGZpbGxXaWR0aCk7XG4gIGNvbnN0IGxlZnRTcGFjZSA9IE1hdGguY2VpbCgoZmlsbFdpZHRoIC0gaGVhZGVyVGV4dC5sZW5ndGgpIC8gMik7XG4gIGNvbnN0IHJpZ2h0U3BhY2UgPSBmaWxsV2lkdGggLSBsZWZ0U3BhY2UgLSBoZWFkZXJUZXh0Lmxlbmd0aDtcbiAgY29uc3QgZmlsbCA9IChjb3VudDogbnVtYmVyLCBjb250ZW50OiBzdHJpbmcpID0+IGNvbnRlbnQucmVwZWF0KGNvdW50KTtcblxuICBpbmZvKGDilIwke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSQYCk7XG4gIGluZm8oYOKUgiR7ZmlsbChsZWZ0U3BhY2UsICcgJyl9JHtoZWFkZXJUZXh0fSR7ZmlsbChyaWdodFNwYWNlLCAnICcpfeKUgmApO1xuICBpbmZvKGDilJQke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSYYCk7XG59XG4iXX0=