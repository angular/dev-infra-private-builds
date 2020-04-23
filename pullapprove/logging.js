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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7O0lBSUgscURBQXFEO0lBQ3JELFNBQWdCLFFBQVEsQ0FBQyxLQUE2QixFQUFFLE9BQWM7UUFBZCx3QkFBQSxFQUFBLGNBQWM7UUFDcEUsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUNqRixPQUFPLENBQUMsY0FBYyxDQUFDLE1BQUksS0FBSyxDQUFDLFNBQVMsTUFBRyxDQUFDLENBQUM7UUFDL0MsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3JCLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO2dCQUN4QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDeEMsT0FBTyxDQUFDLElBQUksQ0FBSSxLQUFLLFVBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLFlBQU0sT0FBTyxDQUFDLFVBQVksQ0FBQyxDQUFBO1lBQ3ZGLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3BCO0lBQ0gsQ0FBQztJQVZELDRCQVVDO0lBRUQsNkNBQTZDO0lBQzdDLFNBQWdCLFNBQVM7UUFBQyxnQkFBbUI7YUFBbkIsVUFBbUIsRUFBbkIscUJBQW1CLEVBQW5CLElBQW1CO1lBQW5CLDJCQUFtQjs7UUFDM0MsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQU0sU0FBUyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ3pELElBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLElBQU0sVUFBVSxHQUFHLFNBQVMsR0FBRyxTQUFTLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztRQUM3RCxJQUFNLElBQUksR0FBRyxVQUFDLEtBQWEsRUFBRSxPQUFlLElBQUssT0FBQSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDO1FBRXZFLE9BQU8sQ0FBQyxJQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsSUFBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDL0UsT0FBTyxDQUFDLElBQUksQ0FBQyxXQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLFdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFYRCw4QkFXQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtQdWxsQXBwcm92ZUdyb3VwUmVzdWx0fSBmcm9tICcuL2dyb3VwJztcblxuLyoqIENyZWF0ZSBsb2dzIGZvciBlYWNoIHB1bGxhcHByb3ZlIGdyb3VwIHJlc3VsdC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dHcm91cChncm91cDogUHVsbEFwcHJvdmVHcm91cFJlc3VsdCwgbWF0Y2hlZCA9IHRydWUpIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IG1hdGNoZWQgPyBncm91cC5tYXRjaGVkQ29uZGl0aW9ucyA6IGdyb3VwLnVubWF0Y2hlZENvbmRpdGlvbnM7XG4gIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoYFske2dyb3VwLmdyb3VwTmFtZX1dYCk7XG4gIGlmIChjb25kaXRpb25zLmxlbmd0aCkge1xuICAgIGNvbmRpdGlvbnMuZm9yRWFjaChtYXRjaGVyID0+IHtcbiAgICAgIGNvbnN0IGNvdW50ID0gbWF0Y2hlci5tYXRjaGVkRmlsZXMuc2l6ZTtcbiAgICAgIGNvbnNvbGUuaW5mbyhgJHtjb3VudH0gJHtjb3VudCA9PT0gMSA/ICdtYXRjaCcgOiAnbWF0Y2hlcyd9IC0gJHttYXRjaGVyLmV4cHJlc3Npb259YClcbiAgICB9KTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuLyoqIExvZ3MgYSBoZWFkZXIgd2l0aGluIGEgdGV4dCBkcmF3biBib3guICovXG5leHBvcnQgZnVuY3Rpb24gbG9nSGVhZGVyKC4uLnBhcmFtczogc3RyaW5nW10pIHtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDgwO1xuICBjb25zdCBmaWxsV2lkdGggPSB0b3RhbFdpZHRoIC0gMjtcbiAgY29uc3QgaGVhZGVyVGV4dCA9IHBhcmFtcy5qb2luKCcgJykuc3Vic3RyKDAsIGZpbGxXaWR0aCk7XG4gIGNvbnN0IGxlZnRTcGFjZSA9IE1hdGguY2VpbCgoZmlsbFdpZHRoIC0gaGVhZGVyVGV4dC5sZW5ndGgpIC8gMik7XG4gIGNvbnN0IHJpZ2h0U3BhY2UgPSBmaWxsV2lkdGggLSBsZWZ0U3BhY2UgLSBoZWFkZXJUZXh0Lmxlbmd0aDtcbiAgY29uc3QgZmlsbCA9IChjb3VudDogbnVtYmVyLCBjb250ZW50OiBzdHJpbmcpID0+IGNvbnRlbnQucmVwZWF0KGNvdW50KTtcblxuICBjb25zb2xlLmluZm8oYOKUjCR7ZmlsbChmaWxsV2lkdGgsICfilIAnKX3ilJBgKTtcbiAgY29uc29sZS5pbmZvKGDilIIke2ZpbGwobGVmdFNwYWNlLCAnICcpfSR7aGVhZGVyVGV4dH0ke2ZpbGwocmlnaHRTcGFjZSwgJyAnKX3ilIJgKTtcbiAgY29uc29sZS5pbmZvKGDilJQke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSYYCk7XG59XG4iXX0=