"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHeader = exports.logGroup = void 0;
const console_1 = require("../utils/console");
/** Create logs for each pullapprove group result. */
function logGroup(group, conditionsToPrint, printMessageFn = console_1.info) {
    const conditions = group[conditionsToPrint];
    printMessageFn.group(`[${group.groupName}]`);
    if (conditions.length) {
        conditions.forEach((groupCondition) => {
            const count = groupCondition.matchedFiles.size;
            if (conditionsToPrint === 'unverifiableConditions') {
                printMessageFn(`${groupCondition.expression}`);
            }
            else {
                printMessageFn(`${count} ${count === 1 ? 'match' : 'matches'} - ${groupCondition.expression}`);
            }
        });
        printMessageFn.groupEnd();
    }
}
exports.logGroup = logGroup;
/** Logs a header within a text drawn box. */
function logHeader(...params) {
    const totalWidth = 80;
    const fillWidth = totalWidth - 2;
    const headerText = params.join(' ').substr(0, fillWidth);
    const leftSpace = Math.ceil((fillWidth - headerText.length) / 2);
    const rightSpace = fillWidth - leftSpace - headerText.length;
    const fill = (count, content) => content.repeat(count);
    console_1.info(`┌${fill(fillWidth, '─')}┐`);
    console_1.info(`│${fill(leftSpace, ' ')}${headerText}${fill(rightSpace, ' ')}│`);
    console_1.info(`└${fill(fillWidth, '─')}┘`);
}
exports.logHeader = logHeader;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2luZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25nLWRldi9wdWxsYXBwcm92ZS9sb2dnaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILDhDQUFzQztBQVF0QyxxREFBcUQ7QUFDckQsU0FBZ0IsUUFBUSxDQUN0QixLQUE2QixFQUM3QixpQkFBb0MsRUFDcEMsY0FBYyxHQUFHLGNBQUk7SUFFckIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDNUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQzdDLElBQUksVUFBVSxDQUFDLE1BQU0sRUFBRTtRQUNyQixVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7WUFDcEMsTUFBTSxLQUFLLEdBQUcsY0FBYyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUM7WUFDL0MsSUFBSSxpQkFBaUIsS0FBSyx3QkFBd0IsRUFBRTtnQkFDbEQsY0FBYyxDQUFDLEdBQUcsY0FBYyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7YUFDaEQ7aUJBQU07Z0JBQ0wsY0FBYyxDQUNaLEdBQUcsS0FBSyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxNQUFNLGNBQWMsQ0FBQyxVQUFVLEVBQUUsQ0FDL0UsQ0FBQzthQUNIO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0I7QUFDSCxDQUFDO0FBcEJELDRCQW9CQztBQUVELDZDQUE2QztBQUM3QyxTQUFnQixTQUFTLENBQUMsR0FBRyxNQUFnQjtJQUMzQyxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUM7SUFDdEIsTUFBTSxTQUFTLEdBQUcsVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNqQyxNQUFNLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDekQsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDakUsTUFBTSxVQUFVLEdBQUcsU0FBUyxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzdELE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBYSxFQUFFLE9BQWUsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUV2RSxjQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxjQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN2RSxjQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwQyxDQUFDO0FBWEQsOEJBV0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmZvfSBmcm9tICcuLi91dGlscy9jb25zb2xlJztcbmltcG9ydCB7UHVsbEFwcHJvdmVHcm91cFJlc3VsdH0gZnJvbSAnLi9ncm91cCc7XG5cbnR5cGUgQ29uZGl0aW9uR3JvdXBpbmcgPSBrZXlvZiBQaWNrPFxuICBQdWxsQXBwcm92ZUdyb3VwUmVzdWx0LFxuICAnbWF0Y2hlZENvbmRpdGlvbnMnIHwgJ3VubWF0Y2hlZENvbmRpdGlvbnMnIHwgJ3VudmVyaWZpYWJsZUNvbmRpdGlvbnMnXG4+O1xuXG4vKiogQ3JlYXRlIGxvZ3MgZm9yIGVhY2ggcHVsbGFwcHJvdmUgZ3JvdXAgcmVzdWx0LiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvZ0dyb3VwKFxuICBncm91cDogUHVsbEFwcHJvdmVHcm91cFJlc3VsdCxcbiAgY29uZGl0aW9uc1RvUHJpbnQ6IENvbmRpdGlvbkdyb3VwaW5nLFxuICBwcmludE1lc3NhZ2VGbiA9IGluZm8sXG4pIHtcbiAgY29uc3QgY29uZGl0aW9ucyA9IGdyb3VwW2NvbmRpdGlvbnNUb1ByaW50XTtcbiAgcHJpbnRNZXNzYWdlRm4uZ3JvdXAoYFske2dyb3VwLmdyb3VwTmFtZX1dYCk7XG4gIGlmIChjb25kaXRpb25zLmxlbmd0aCkge1xuICAgIGNvbmRpdGlvbnMuZm9yRWFjaCgoZ3JvdXBDb25kaXRpb24pID0+IHtcbiAgICAgIGNvbnN0IGNvdW50ID0gZ3JvdXBDb25kaXRpb24ubWF0Y2hlZEZpbGVzLnNpemU7XG4gICAgICBpZiAoY29uZGl0aW9uc1RvUHJpbnQgPT09ICd1bnZlcmlmaWFibGVDb25kaXRpb25zJykge1xuICAgICAgICBwcmludE1lc3NhZ2VGbihgJHtncm91cENvbmRpdGlvbi5leHByZXNzaW9ufWApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJpbnRNZXNzYWdlRm4oXG4gICAgICAgICAgYCR7Y291bnR9ICR7Y291bnQgPT09IDEgPyAnbWF0Y2gnIDogJ21hdGNoZXMnfSAtICR7Z3JvdXBDb25kaXRpb24uZXhwcmVzc2lvbn1gLFxuICAgICAgICApO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHByaW50TWVzc2FnZUZuLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuLyoqIExvZ3MgYSBoZWFkZXIgd2l0aGluIGEgdGV4dCBkcmF3biBib3guICovXG5leHBvcnQgZnVuY3Rpb24gbG9nSGVhZGVyKC4uLnBhcmFtczogc3RyaW5nW10pIHtcbiAgY29uc3QgdG90YWxXaWR0aCA9IDgwO1xuICBjb25zdCBmaWxsV2lkdGggPSB0b3RhbFdpZHRoIC0gMjtcbiAgY29uc3QgaGVhZGVyVGV4dCA9IHBhcmFtcy5qb2luKCcgJykuc3Vic3RyKDAsIGZpbGxXaWR0aCk7XG4gIGNvbnN0IGxlZnRTcGFjZSA9IE1hdGguY2VpbCgoZmlsbFdpZHRoIC0gaGVhZGVyVGV4dC5sZW5ndGgpIC8gMik7XG4gIGNvbnN0IHJpZ2h0U3BhY2UgPSBmaWxsV2lkdGggLSBsZWZ0U3BhY2UgLSBoZWFkZXJUZXh0Lmxlbmd0aDtcbiAgY29uc3QgZmlsbCA9IChjb3VudDogbnVtYmVyLCBjb250ZW50OiBzdHJpbmcpID0+IGNvbnRlbnQucmVwZWF0KGNvdW50KTtcblxuICBpbmZvKGDilIwke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSQYCk7XG4gIGluZm8oYOKUgiR7ZmlsbChsZWZ0U3BhY2UsICcgJyl9JHtoZWFkZXJUZXh0fSR7ZmlsbChyaWdodFNwYWNlLCAnICcpfeKUgmApO1xuICBpbmZvKGDilJQke2ZpbGwoZmlsbFdpZHRoLCAn4pSAJyl94pSYYCk7XG59XG4iXX0=