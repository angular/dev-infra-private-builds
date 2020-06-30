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
    function logGroup(group, matched, printMessageFn) {
        if (matched === void 0) { matched = true; }
        if (printMessageFn === void 0) { printMessageFn = console_1.info; }
        var conditions = matched ? group.matchedConditions : group.unmatchedConditions;
        printMessageFn.group("[" + group.groupName + "]");
        if (conditions.length) {
            conditions.forEach(function (matcher) {
                var count = matcher.matchedFiles.size;
                printMessageFn(count + " " + (count === 1 ? 'match' : 'matches') + " - " + matcher.expression);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL2Rldi1pbmZyYS9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7OztJQUVILG9FQUFzQztJQUd0QyxxREFBcUQ7SUFDckQsU0FBZ0IsUUFBUSxDQUFDLEtBQTZCLEVBQUUsT0FBYyxFQUFFLGNBQXFCO1FBQXJDLHdCQUFBLEVBQUEsY0FBYztRQUFFLCtCQUFBLEVBQUEsaUJBQWlCLGNBQUk7UUFDM0YsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQztRQUNqRixjQUFjLENBQUMsS0FBSyxDQUFDLE1BQUksS0FBSyxDQUFDLFNBQVMsTUFBRyxDQUFDLENBQUM7UUFDN0MsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFO1lBQ3JCLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxPQUFPO2dCQUN4QixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQztnQkFDeEMsY0FBYyxDQUFJLEtBQUssVUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsWUFBTSxPQUFPLENBQUMsVUFBWSxDQUFDLENBQUM7WUFDMUYsQ0FBQyxDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDO0lBVkQsNEJBVUM7SUFFRCw2Q0FBNkM7SUFDN0MsU0FBZ0IsU0FBUztRQUFDLGdCQUFtQjthQUFuQixVQUFtQixFQUFuQixxQkFBbUIsRUFBbkIsSUFBbUI7WUFBbkIsMkJBQW1COztRQUMzQyxJQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7UUFDdEIsSUFBTSxTQUFTLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDekQsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDakUsSUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO1FBQzdELElBQU0sSUFBSSxHQUFHLFVBQUMsS0FBYSxFQUFFLE9BQWUsSUFBSyxPQUFBLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQXJCLENBQXFCLENBQUM7UUFFdkUsY0FBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDbEMsY0FBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7UUFDdkUsY0FBSSxDQUFDLFdBQUksSUFBSSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsV0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQVhELDhCQVdDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5mb30gZnJvbSAnLi4vdXRpbHMvY29uc29sZSc7XG5pbXBvcnQge1B1bGxBcHByb3ZlR3JvdXBSZXN1bHR9IGZyb20gJy4vZ3JvdXAnO1xuXG4vKiogQ3JlYXRlIGxvZ3MgZm9yIGVhY2ggcHVsbGFwcHJvdmUgZ3JvdXAgcmVzdWx0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0dyb3VwKGdyb3VwOiBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0LCBtYXRjaGVkID0gdHJ1ZSwgcHJpbnRNZXNzYWdlRm4gPSBpbmZvKSB7XG4gIGNvbnN0IGNvbmRpdGlvbnMgPSBtYXRjaGVkID8gZ3JvdXAubWF0Y2hlZENvbmRpdGlvbnMgOiBncm91cC51bm1hdGNoZWRDb25kaXRpb25zO1xuICBwcmludE1lc3NhZ2VGbi5ncm91cChgWyR7Z3JvdXAuZ3JvdXBOYW1lfV1gKTtcbiAgaWYgKGNvbmRpdGlvbnMubGVuZ3RoKSB7XG4gICAgY29uZGl0aW9ucy5mb3JFYWNoKG1hdGNoZXIgPT4ge1xuICAgICAgY29uc3QgY291bnQgPSBtYXRjaGVyLm1hdGNoZWRGaWxlcy5zaXplO1xuICAgICAgcHJpbnRNZXNzYWdlRm4oYCR7Y291bnR9ICR7Y291bnQgPT09IDEgPyAnbWF0Y2gnIDogJ21hdGNoZXMnfSAtICR7bWF0Y2hlci5leHByZXNzaW9ufWApO1xuICAgIH0pO1xuICAgIHByaW50TWVzc2FnZUZuLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuLyoqIExvZ3MgYSBoZWFkZXIgd2l0aGluIGEgdGV4dCBkcmF3biBib3guICovXG5leHBvcnQgZnVuY3Rpb24gbG9nSGVhZGVyKC4uLnBhcmFtczogc3RyaW5nW10pIHtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDgwO1xuICBjb25zdCBmaWxsV2lkdGggPSB0b3RhbFdpZHRoIC0gMjtcbiAgY29uc3QgaGVhZGVyVGV4dCA9IHBhcmFtcy5qb2luKCcgJykuc3Vic3RyKDAsIGZpbGxXaWR0aCk7XG4gIGNvbnN0IGxlZnRTcGFjZSA9IE1hdGguY2VpbCgoZmlsbFdpZHRoIC0gaGVhZGVyVGV4dC5sZW5ndGgpIC8gMik7XG4gIGNvbnN0IHJpZ2h0U3BhY2UgPSBmaWxsV2lkdGggLSBsZWZ0U3BhY2UgLSBoZWFkZXJUZXh0Lmxlbmd0aDtcbiAgY29uc3QgZmlsbCA9IChjb3VudDogbnVtYmVyLCBjb250ZW50OiBzdHJpbmcpID0+IGNvbnRlbnQucmVwZWF0KGNvdW50KTtcblxuICBpbmZvKGDilIwke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSQYCk7XG4gIGluZm8oYOKUgiR7ZmlsbChsZWZ0U3BhY2UsICcgJyl9JHtoZWFkZXJUZXh0fSR7ZmlsbChyaWdodFNwYWNlLCAnICcpfeKUgmApO1xuICBpbmZvKGDilJQke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSYYCk7XG59XG4iXX0=