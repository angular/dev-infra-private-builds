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
        return yargs.option('date', {
            description: 'Only consider PRs updated since provided date',
            defaultDescription: '30 days ago',
            coerce: Date.parse,
            default: getThirtyDaysAgoDate,
        });
    }
    exports.buildDiscoverNewConflictsCommand = buildDiscoverNewConflictsCommand;
    /** Handles the discover-new-conflicts pull request command. */
    function handleDiscoverNewConflictsCommand(_a) {
        var prNumber = _a.prNumber, date = _a.date;
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
        return date;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vZGV2LWluZnJhL3ByL2Rpc2NvdmVyLW5ldy1jb25mbGljdHMvY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRzs7Ozs7Ozs7Ozs7Ozs7SUFJSCxvRUFBMEM7SUFFMUMsOEVBQWtEO0lBRWxELDhEQUE4RDtJQUM5RCxTQUFnQixnQ0FBZ0MsQ0FBQyxLQUFXO1FBQzFELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUU7WUFDMUIsV0FBVyxFQUFFLCtDQUErQztZQUM1RCxrQkFBa0IsRUFBRSxhQUFhO1lBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSztZQUNsQixPQUFPLEVBQUUsb0JBQW9CO1NBQzlCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFQRCw0RUFPQztJQUVELCtEQUErRDtJQUMvRCxTQUFzQixpQ0FBaUMsQ0FBQyxFQUEyQjtZQUExQixRQUFRLGNBQUEsRUFBRSxJQUFJLFVBQUE7Ozs7O3dCQUNyRSx5RUFBeUU7d0JBQ3pFLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFOzRCQUNmLGVBQUssQ0FBQyxvREFBb0QsQ0FBQyxDQUFDOzRCQUM1RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNqQjt3QkFDRCxxQkFBTSxpQ0FBeUIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLEVBQUE7O3dCQUEvQyxTQUErQyxDQUFDOzs7OztLQUNqRDtJQVBELDhFQU9DO0lBRUQsaURBQWlEO0lBQ2pELFNBQVMsb0JBQW9CO1FBQzNCLElBQU0sSUFBSSxHQUFHLElBQUksSUFBSSxFQUFFLENBQUM7UUFDeEIsaUVBQWlFO1FBQ2pFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDMUIsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0FyZ3VtZW50cywgQXJndn0gZnJvbSAneWFyZ3MnO1xuXG5pbXBvcnQge2Vycm9yfSBmcm9tICcuLi8uLi91dGlscy9jb25zb2xlJztcblxuaW1wb3J0IHtkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByfSBmcm9tICcuL2luZGV4JztcblxuLyoqIEJ1aWxkcyB0aGUgZGlzY292ZXItbmV3LWNvbmZsaWN0cyBwdWxsIHJlcXVlc3QgY29tbWFuZC4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZERpc2NvdmVyTmV3Q29uZmxpY3RzQ29tbWFuZCh5YXJnczogQXJndikge1xuICByZXR1cm4geWFyZ3Mub3B0aW9uKCdkYXRlJywge1xuICAgIGRlc2NyaXB0aW9uOiAnT25seSBjb25zaWRlciBQUnMgdXBkYXRlZCBzaW5jZSBwcm92aWRlZCBkYXRlJyxcbiAgICBkZWZhdWx0RGVzY3JpcHRpb246ICczMCBkYXlzIGFnbycsXG4gICAgY29lcmNlOiBEYXRlLnBhcnNlLFxuICAgIGRlZmF1bHQ6IGdldFRoaXJ0eURheXNBZ29EYXRlLFxuICB9KTtcbn1cblxuLyoqIEhhbmRsZXMgdGhlIGRpc2NvdmVyLW5ldy1jb25mbGljdHMgcHVsbCByZXF1ZXN0IGNvbW1hbmQuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlRGlzY292ZXJOZXdDb25mbGljdHNDb21tYW5kKHtwck51bWJlciwgZGF0ZX06IEFyZ3VtZW50cykge1xuICAvLyBJZiBhIHByb3ZpZGVkIGRhdGUgaXMgbm90IGFibGUgdG8gYmUgcGFyc2VkLCB5YXJncyBwcm92aWRlcyBpdCBhcyBOYU4uXG4gIGlmIChpc05hTihkYXRlKSkge1xuICAgIGVycm9yKCdVbmFibGUgdG8gcGFyc2UgdGhlIHZhbHVlIHByb3ZpZGVkIHZpYSAtLWRhdGUgZmxhZycpO1xuICAgIHByb2Nlc3MuZXhpdCgxKTtcbiAgfVxuICBhd2FpdCBkaXNjb3Zlck5ld0NvbmZsaWN0c0ZvclByKHByTnVtYmVyLCBkYXRlKTtcbn1cblxuLyoqIEdldHMgYSBkYXRlIG9iamVjdCAzMCBkYXlzIGFnbyBmcm9tIHRvZGF5LiAqL1xuZnVuY3Rpb24gZ2V0VGhpcnR5RGF5c0Fnb0RhdGUoKTogRGF0ZSB7XG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAvLyBTZXQgdGhlIGhvdXJzLCBtaW51dGVzIGFuZCBzZWNvbmRzIHRvIDAgdG8gb25seSBjb25zaWRlciBkYXRlLlxuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICAvLyBTZXQgdGhlIGRhdGUgdG8gMzAgZGF5cyBpbiB0aGUgcGFzdC5cbiAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gMzApO1xuICByZXR1cm4gZGF0ZTtcbn1cbiJdfQ==