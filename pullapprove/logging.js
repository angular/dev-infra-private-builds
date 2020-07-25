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
        define("@angular/dev-infra-private/pullapprove/logging", ["require", "exports", "@angular/dev-infra-private/utils/console"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.logHeader = exports.logGroup = void 0;
    var console_1 = require("@angular/dev-infra-private/utils/console");
    /** Create logs for each pullapprove group result. */
    function logGroup(group, conditionsToPrint, printMessageFn) {
        if (printMessageFn === void 0) { printMessageFn = console_1.info; }
        var conditions = group[conditionsToPrint];
        printMessageFn.group("[" + group.groupName + "]");
        if (conditions.length) {
            conditions.forEach(function (groupCondition) {
                var count = groupCondition.matchedFiles.size;
                if (conditionsToPrint === 'unverifiableConditions') {
                    printMessageFn("" + groupCondition.expression);
                }
                else {
                    printMessageFn(count + " " + (count === 1 ? 'match' : 'matches') + " - " + groupCondition.expression);
                }
            });
            printMessageFn.groupEnd();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUFzQztJQU10QyxxREFBcUQ7SUFDckQsU0FBZ0IsUUFBUSxDQUNwQixLQUE2QixFQUFFLGlCQUFvQyxFQUFFLGNBQXFCO1FBQXJCLCtCQUFBLEVBQUEsaUJBQWlCLGNBQUk7UUFDNUYsSUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDNUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxNQUFJLEtBQUssQ0FBQyxTQUFTLE1BQUcsQ0FBQyxDQUFDO1FBQzdDLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtZQUNyQixVQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsY0FBYztnQkFDL0IsSUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLElBQUksaUJBQWlCLEtBQUssd0JBQXdCLEVBQUU7b0JBQ2xELGNBQWMsQ0FBQyxLQUFHLGNBQWMsQ0FBQyxVQUFZLENBQUMsQ0FBQztpQkFDaEQ7cUJBQU07b0JBQ0wsY0FBYyxDQUNQLEtBQUssVUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsWUFBTSxjQUFjLENBQUMsVUFBWSxDQUFDLENBQUM7aUJBQ3JGO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBaEJELDRCQWdCQztJQUVELDZDQUE2QztJQUM3QyxTQUFnQixTQUFTO1FBQUMsZ0JBQW1CO2FBQW5CLFVBQW1CLEVBQW5CLHFCQUFtQixFQUFuQixJQUFtQjtZQUFuQiwyQkFBbUI7O1FBQzNDLElBQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFNLFNBQVMsR0FBRyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN6RCxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNqRSxJQUFNLFVBQVUsR0FBRyxTQUFTLEdBQUcsU0FBUyxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDN0QsSUFBTSxJQUFJLEdBQUcsVUFBQyxLQUFhLEVBQUUsT0FBZSxJQUFLLE9BQUEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBckIsQ0FBcUIsQ0FBQztRQUV2RSxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUNsQyxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztRQUN2RSxjQUFJLENBQUMsV0FBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxXQUFHLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBWEQsOEJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFJlc3VsdH0gZnJvbSAnLi9ncm91cCc7XG5cbnR5cGUgQ29uZGl0aW9uR3JvdXBpbmcgPSBrZXlvZiBQaWNrPFxuICAgIFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQsICdtYXRjaGVkQ29uZGl0aW9ucyd8J3VubWF0Y2hlZENvbmRpdGlvbnMnfCd1bnZlcmlmaWFibGVDb25kaXRpb25zJz47XG5cbi8qKiBDcmVhdGUgbG9ncyBmb3IgZWFjaCBwdWxsYXBwcm92ZSBncm91cCByZXN1bHQuICovXG5leHBvcnQgZnVuY3Rpb24gbG9nR3JvdXAoXG4gICAgZ3JvdXA6IFB1bGxBcHByb3ZlR3JvdXBSZXN1bHQsIGNvbmRpdGlvbnNUb1ByaW50OiBDb25kaXRpb25Hcm91cGluZywgcHJpbnRNZXNzYWdlRm4gPSBpbmZvKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBncm91cFtjb25kaXRpb25zVG9QcmludF07XG4gIHByaW50TWVzc2FnZUZuLmdyb3VwKGBbJHtncm91cC5ncm91cE5hbWV9XWApO1xuICBpZiAoY29uZGl0aW9ucy5sZW5ndGgpIHtcbiAgICBjb25kaXRpb25zLmZvckVhY2goZ3JvdXBDb25kaXRpb24gPT4ge1xuICAgICAgY29uc3QgY291bnQgPSBncm91cENvbmRpdGlvbi5tYXRjaGVkRmlsZXMuc2l6ZTtcbiAgICAgIGlmIChjb25kaXRpb25zVG9QcmludCA9PT0gJ3VudmVyaWZpYWJsZUNvbmRpdGlvbnMnKSB7XG4gICAgICAgIHByaW50TWVzc2FnZUZuKGAke2dyb3VwQ29uZGl0aW9uLmV4cHJlc3Npb259YCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcmludE1lc3NhZ2VGbihcbiAgICAgICAgICAgIGAke2NvdW50fSAke2NvdW50ID09PSAxID8gJ21hdGNoJyA6ICdtYXRjaGVzJ30gLSAke2dyb3VwQ29uZGl0aW9uLmV4cHJlc3Npb259YCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcHJpbnRNZXNzYWdlRm4uZ3JvdXBFbmQoKTtcbiAgfVxufVxuXG4vKiogTG9ncyBhIGhlYWRlciB3aXRoaW4gYSB0ZXh0IGRyYXduIGJveC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2dIZWFkZXIoLi4ucGFyYW1zOiBzdHJpbmdbXSkge1xuICBjb25zdCB0b3RhbFdpZHRoID0gODA7XG4gIGNvbnN0IGZpbGxXaWR0aCA9IHRvdGFsV2lkdGggLSAyO1xuICBjb25zdCBoZWFkZXJUZXh0ID0gcGFyYW1zLmpvaW4oJyAnKS5zdWJzdHIoMCwgZmlsbFdpZHRoKTtcbiAgY29uc3QgbGVmdFNwYWNlID0gTWF0aC5jZWlsKChmaWxsV2lkdGggLSBoZWFkZXJUZXh0Lmxlbmd0aCkgLyAyKTtcbiAgY29uc3QgcmlnaHRTcGFjZSA9IGZpbGxXaWR0aCAtIGxlZnRTcGFjZSAtIGhlYWRlclRleHQubGVuZ3RoO1xuICBjb25zdCBmaWxsID0gKGNvdW50OiBudW1iZXIsIGNvbnRlbnQ6IHN0cmluZykgPT4gY29udGVudC5yZXBlYXQoY291bnQpO1xuXG4gIGluZm8oYOKUjCR7ZmlsbChmaWxsV2lkdGgsICfilIAnKX3ilJBgKTtcbiAgaW5mbyhg4pSCJHtmaWxsKGxlZnRTcGFjZSwgJyAnKX0ke2hlYWRlclRleHR9JHtmaWxsKHJpZ2h0U3BhY2UsICcgJyl94pSCYCk7XG4gIGluZm8oYOKUlCR7ZmlsbChmaWxsV2lkdGgsICfilIAnKX3ilJhgKTtcbn1cbiJdfQ==