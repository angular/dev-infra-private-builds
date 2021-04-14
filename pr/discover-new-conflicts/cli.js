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
        define("@angular/dev-infra-private/pr/discover-new-conflicts/cli", ["require", "exports", "tslib", "@angular/dev-infra-private/utils/console", "@angular/dev-infra-private/pr/discover-new-conflicts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleDiscoverNewConflictsCommand = exports.buildDiscoverNewConflictsCommand = void 0;
    var tslib_1 = require("tslib");
    var console_1 = require("@angular/dev-infra-private/utils/console");
    var index_1 = require("@angular/dev-infra-private/pr/discover-new-conflicts");
    /** Builds the discover-new-conflicts pull request command. */
    function buildDiscoverNewConflictsCommand(yargs) {
        return yargs
            .option('date', {
            description: 'Only consider PRs updated since provided date',
            defaultDescription: '30 days ago',
            coerce: function (date) { return typeof date === 'number' ? date : Date.parse(date); },
            default: getThirtyDaysAgoDate(),
        })
            .positional('pr-number', { demandOption: true, type: 'number' });
    }
    exports.buildDiscoverNewConflictsCommand = buildDiscoverNewConflictsCommand;
    /** Handles the discover-new-conflicts pull request command. */
    function handleDiscoverNewConflictsCommand(_a) {
        var prNumber = _a["pr-number"], date = _a.date;
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // If a provided date is not able to be parsed, yargs provides it as NaN.
                        if (isNaN(date)) {
                            console_1.error('Unable to parse the value provided via --date flag');
                            process.exit(1);
                        }
                        return [4 /*yield*/, index_1.discoverNewConflictsForPr(prNumber, date)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    exports.handleDiscoverNewConflictsCommand = handleDiscoverNewConflictsCommand;
    /** Gets a date object 30 days ago from today. */
    function getThirtyDaysAgoDate() {
        var date = new Date();
        // Set the hours, minutes and seconds to 0 to only consider date.
        date.setHours(0, 0, 0, 0);
        // Set the date to 30 days in the past.
        date.setDate(date.getDate() - 30);
        return date.getTime();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxvRUFBMEM7SUFFMUMsOEVBQWtEO0lBUWxELDhEQUE4RDtJQUM5RCxTQUFnQixnQ0FBZ0MsQ0FBQyxLQUFXO1FBRTFELE9BQU8sS0FBSzthQUNQLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDZCxXQUFXLEVBQUUsK0NBQStDO1lBQzVELGtCQUFrQixFQUFFLGFBQWE7WUFDakMsTUFBTSxFQUFFLFVBQUMsSUFBSSxJQUFLLE9BQUEsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQWxELENBQWtEO1lBQ3BFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRTtTQUNoQyxDQUFDO2FBQ0QsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBQyxDQUFDLENBQUM7SUFDckUsQ0FBQztJQVZELDRFQVVDO0lBRUQsK0RBQStEO0lBQy9ELFNBQXNCLGlDQUFpQyxDQUNuRCxFQUE0RTtZQUE5RCxRQUFRLGtCQUFBLEVBQUUsSUFBSSxVQUFBOzs7Ozt3QkFDOUIseUVBQXlFO3dCQUN6RSxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTs0QkFDZixlQUFLLENBQUMsb0RBQW9ELENBQUMsQ0FBQzs0QkFDNUQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzt5QkFDakI7d0JBQ0QscUJBQU0saUNBQXlCLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxFQUFBOzt3QkFBL0MsU0FBK0MsQ0FBQzs7Ozs7S0FDakQ7SUFSRCw4RUFRQztJQUVELGlEQUFpRDtJQUNqRCxTQUFTLG9CQUFvQjtRQUMzQixJQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1FBQ3hCLGlFQUFpRTtRQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFCLHVDQUF1QztRQUN2QyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUNsQyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUN4QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXJndW1lbnRzLCBBcmd2fSBmcm9tICd5YXJncyc7XG5cbmltcG9ydCB7ZXJyb3J9IGZyb20gJy4uLy4uL3V0aWxzL2NvbnNvbGUnO1xuXG5pbXBvcnQge2Rpc2NvdmVyTmV3Q29uZmxpY3RzRm9yUHJ9IGZyb20gJy4vaW5kZXgnO1xuXG4vKiogVGhlIG9wdGlvbnMgYXZhaWxhYmxlIHRvIHRoZSBkaXNjb3Zlci1uZXctY29uZmxpY3RzIGNvbW1hbmQgdmlhIENMSS4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kT3B0aW9ucyB7XG4gIGRhdGU6IG51bWJlcjtcbiAgJ3ByLW51bWJlcic6IG51bWJlcjtcbn1cblxuLyoqIEJ1aWxkcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCh5YXJnczogQXJndik6XG4gICAgQXJndjxEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmRPcHRpb25zPiB7XG4gIHJldHVybiB5YXJnc1xuICAgICAgLm9wdGlvbignZGF0ZScsIHtcbiAgICAgICAgZGVzY3JpcHRpb246ICdPbmx5IGNvbnNpZGVyIFBScyB1cGRhdGVkIHNpbmNlIHByb3ZpZGVkIGRhdGUnLFxuICAgICAgICBkZWZhdWx0RGVzY3JpcHRpb246ICczMCBkYXlzIGFnbycsXG4gICAgICAgIGNvZXJjZTogKGRhdGUpID0+IHR5cGVvZiBkYXRlID09PSAnbnVtYmVyJyA/IGRhdGUgOiBEYXRlLnBhcnNlKGRhdGUpLFxuICAgICAgICBkZWZhdWx0OiBnZXRUaGlydHlEYXlzQWdvRGF0ZSgpLFxuICAgICAgfSlcbiAgICAgIC5wb3NpdGlvbmFsKCdwci1udW1iZXInLCB7ZGVtYW5kT3B0aW9uOiB0cnVlLCB0eXBlOiAnbnVtYmVyJ30pO1xufVxuXG4vKiogSGFuZGxlcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmQoXG4gICAgeydwci1udW1iZXInOiBwck51bWJlciwgZGF0ZX06IEFyZ3VtZW50czxEaXNjb3Zlck5ld0NvbmZsaWN0c0NvbW1hbmRPcHRpb25zPikge1xuICAvLyBJZiBhIHByb3ZpZGVkIGRhdGUgaXMgbm90IGFibGUgdG8gYmUgcGFyc2VkLCB5YXJncyBwcm92aWRlcyBpdCBhcyBOYU4uXG4gIGlmIChpc05hTihkYXRlKSkge1xuICAgIGVycm9yKCdVbmFibGUgdG8gcGFyc2UgdGhlIHZhbHVlIHByb3ZpZGVkIHZpYSAtLWRhdGUgZmxhZycpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBhd2FpdCBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKHByTnVtYmVyLCBkYXRlKTtcbn1cblxuLyoqIEdldHMgYSBkYXRlIG9iamVjdCAzMCBkYXlzIGFnbyBmcm9tIHRvZGF5LiAqL1xuZnVuY3Rpb24gZ2V0VGhpcnR5RGF5c0Fnb0RhdGUoKSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAvLyBTZXQgdGhlIGhvdXJzLCBtaW51dGVzIGFuZCBzZWNvbmRzIHRvIDAgdG8gb25seSBjb25zaWRlciBkYXRlLlxuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAvLyBTZXQgdGhlIGRhdGUgdG8gMzAgZGF5cyBpbiB0aGUgcGFzdC5cbiAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gMzApO1xuICByZXR1cm4gZGF0ZS5nZXRUaW1lKCk7XG59XG4iXX0=